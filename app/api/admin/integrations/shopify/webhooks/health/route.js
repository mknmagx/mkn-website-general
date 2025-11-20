import { ShopifyIntegrationService } from "../../../../../../../lib/services/shopify-integration";
import { adminFirestore } from "../../../../../../../lib/firebase-admin";
import logger from "../../../../../../../lib/utils/logger";
import { NextResponse } from "next/server";

/**
 * Shopify Webhook Health Monitoring API
 * Webhook sisteminin sağlık durumunu ve istatistiklerini raporlar
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("integrationId");
    const periodHours = parseInt(searchParams.get("hours") || "24", 10);

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID gerekli" },
        { status: 400 }
      );
    }

    logger.info(
      `Getting webhook health report for integration ${integrationId}, period: ${periodHours}h`
    );

    const shopifyService = new ShopifyIntegrationService();

    // Integration bilgisini al
    const integration = await shopifyService.getIntegration(integrationId);
    if (!integration) {
      return NextResponse.json(
        { error: "Integration bulunamadı" },
        { status: 404 }
      );
    }

    const shopDomain = integration.credentials?.shopDomain;
    if (!shopDomain) {
      return NextResponse.json(
        { error: "Shop domain bulunamadı" },
        { status: 400 }
      );
    }

    // Shop domain'i normalize et
    let normalizedShopDomain = shopDomain;
    if (!shopDomain.includes(".myshopify.com")) {
      normalizedShopDomain = `${shopDomain}.myshopify.com`;
    }

    const startDate = new Date(Date.now() - periodHours * 60 * 60 * 1000);

    // 1. Received webhook'lar (webhook_events)
    const receivedWebhooksSnapshot = await adminFirestore
      .collection("webhook_events")
      .where("shopDomain", "==", normalizedShopDomain)
      .where("receivedAt", ">=", startDate)
      .get();

    const receivedWebhooks = receivedWebhooksSnapshot.docs.map((doc) =>
      doc.data()
    );

    // 2. Processed webhook'lar (processed_webhooks - idempotency tracking)
    const processedWebhooksSnapshot = await adminFirestore
      .collection("processed_webhooks")
      .where("integrationId", "==", integrationId)
      .where("processedAt", ">=", startDate)
      .get();

    const processedWebhooks = processedWebhooksSnapshot.docs.map((doc) =>
      doc.data()
    );

    // 3. Shopify'dan webhook durumunu al
    const shopifyWebhooks = await shopifyService.fetchWebhooksFromShopify(
      integrationId
    );

    // 4. Topic bazlı istatistikler
    const byTopic = {};
    receivedWebhooks.forEach((webhook) => {
      if (!byTopic[webhook.topic]) {
        byTopic[webhook.topic] = {
          received: 0,
          processed: 0,
          duplicates: 0,
        };
      }
      byTopic[webhook.topic].received++;
    });

    processedWebhooks.forEach((webhook) => {
      if (byTopic[webhook.topic]) {
        byTopic[webhook.topic].processed++;
      }
    });

    // 5. Duplicate detection (aynı webhook ID birden fazla received)
    const webhookIdCounts = {};
    receivedWebhooks.forEach((webhook) => {
      const webhookId = webhook.headers?.["x-shopify-webhook-id"];
      if (webhookId) {
        webhookIdCounts[webhookId] = (webhookIdCounts[webhookId] || 0) + 1;
      }
    });

    let duplicateReceivedCount = 0;
    Object.values(webhookIdCounts).forEach((count) => {
      if (count > 1) {
        duplicateReceivedCount += count - 1;
      }
    });

    // 6. Shopify webhook subscriptions (çoklu kayıt kontrolü)
    const webhookSubscriptions = {};
    shopifyWebhooks.forEach((webhook) => {
      if (!webhookSubscriptions[webhook.topic]) {
        webhookSubscriptions[webhook.topic] = [];
      }
      webhookSubscriptions[webhook.topic].push({
        id: webhook.id,
        createdAt: webhook.created_at,
        address: webhook.address,
      });
    });

    const duplicateSubscriptions = {};
    let totalDuplicateSubscriptions = 0;
    Object.entries(webhookSubscriptions).forEach(([topic, subscriptions]) => {
      if (subscriptions.length > 1) {
        duplicateSubscriptions[topic] = subscriptions.length;
        totalDuplicateSubscriptions += subscriptions.length - 1;
      }
    });

    // 7. Success rate hesapla
    const totalReceived = receivedWebhooks.length;
    const totalProcessed = processedWebhooks.length;
    const successRate =
      totalReceived > 0
        ? ((totalProcessed / totalReceived) * 100).toFixed(2)
        : "0.00";

    // 8. Health status belirleme
    let health = "healthy";
    const issues = [];

    if (totalDuplicateSubscriptions > 0) {
      health = "warning";
      issues.push(
        `${totalDuplicateSubscriptions} duplicate webhook subscription bulundu`
      );
    }

    if (duplicateReceivedCount > 0) {
      health = "warning";
      issues.push(`${duplicateReceivedCount} duplicate webhook alındı`);
    }

    if (parseFloat(successRate) < 90 && totalReceived > 10) {
      health = "degraded";
      issues.push(`Success rate düşük: ${successRate}%`);
    }

    if (totalReceived === 0) {
      health = "unknown";
      issues.push(`Son ${periodHours} saatte webhook alınmadı`);
    }

    const report = {
      success: true,
      integrationId,
      shopDomain: normalizedShopDomain,
      period: `${periodHours}h`,
      timestamp: new Date().toISOString(),
      health,
      issues: issues.length > 0 ? issues : undefined,

      summary: {
        totalReceived,
        totalProcessed,
        duplicateReceivedCount,
        successRate: `${successRate}%`,
      },

      webhookSubscriptions: {
        total: shopifyWebhooks.length,
        byTopic: Object.entries(webhookSubscriptions).map(([topic, subs]) => ({
          topic,
          count: subs.length,
          isDuplicate: subs.length > 1,
        })),
        duplicates:
          totalDuplicateSubscriptions > 0 ? duplicateSubscriptions : undefined,
      },

      byTopic: Object.entries(byTopic).map(([topic, stats]) => ({
        topic,
        ...stats,
        successRate:
          stats.received > 0
            ? `${((stats.processed / stats.received) * 100).toFixed(2)}%`
            : "N/A",
      })),

      recentWebhooks: receivedWebhooks
        .sort((a, b) => b.receivedAt - a.receivedAt)
        .slice(0, 10)
        .map((webhook) => ({
          topic: webhook.topic,
          shopifyId: webhook.shopifyId,
          webhookId: webhook.headers?.["x-shopify-webhook-id"],
          receivedAt: webhook.receivedAt,
          status: webhook.status,
        })),
    };

    return NextResponse.json(report);
  } catch (error) {
    logger.error("Error getting webhook health report:", error);
    return NextResponse.json(
      {
        error: "Webhook health raporu alınamadı",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
