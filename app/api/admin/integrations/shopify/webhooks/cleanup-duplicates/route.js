import { ShopifyIntegrationService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";
import { NextResponse } from "next/server";

/**
 * Shopify Duplicate Webhook Cleanup API
 * Aynı topic için birden fazla webhook varsa temizler
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { integrationId } = body;
    
    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID gerekli" },
        { status: 400 }
      );
    }

    logger.info(`Starting duplicate webhook cleanup for integration ${integrationId}`);

    const shopifyService = new ShopifyIntegrationService();
    const result = await shopifyService.cleanupDuplicateWebhooks(integrationId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${result.duplicatesDeleted} duplicate webhook silindi, ${result.remaining} webhook kaldı`,
        ...result
      });
    } else {
      return NextResponse.json(
        {
          error: "Duplicate webhook temizliği başarısız",
          details: result.error
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("Error cleaning up duplicate webhooks:", error);
    return NextResponse.json(
      {
        error: "Webhook temizliği sırasında hata",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Duplicate webhook durumunu kontrol et (Preview)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("integrationId");
    
    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID gerekli" },
        { status: 400 }
      );
    }

    const shopifyService = new ShopifyIntegrationService();
    
    // Shopify'dan webhook'ları çek
    const webhooks = await shopifyService.fetchWebhooksFromShopify(integrationId);
    
    // Topic'e göre grupla
    const groupedByTopic = {};
    webhooks.forEach(webhook => {
      if (!groupedByTopic[webhook.topic]) {
        groupedByTopic[webhook.topic] = [];
      }
      groupedByTopic[webhook.topic].push(webhook);
    });

    // Duplicate'leri tespit et
    const duplicates = {};
    let totalDuplicates = 0;
    
    for (const [topic, topicWebhooks] of Object.entries(groupedByTopic)) {
      if (topicWebhooks.length > 1) {
        duplicates[topic] = {
          count: topicWebhooks.length,
          toDelete: topicWebhooks.length - 1,
          webhooks: topicWebhooks.map(w => ({
            id: w.id,
            createdAt: w.created_at,
            address: w.address,
          })),
        };
        totalDuplicates += topicWebhooks.length - 1;
      }
    }

    return NextResponse.json({
      success: true,
      totalWebhooks: webhooks.length,
      totalDuplicates,
      hasDuplicates: totalDuplicates > 0,
      duplicates,
      summary: {
        byTopic: Object.entries(groupedByTopic).map(([topic, topicWebhooks]) => ({
          topic,
          count: topicWebhooks.length,
          isDuplicate: topicWebhooks.length > 1,
        })),
      },
    });
  } catch (error) {
    logger.error("Error checking duplicate webhooks:", error);
    return NextResponse.json(
      {
        error: "Webhook durumu kontrol edilemedi",
        details: error.message
      },
      { status: 500 }
    );
  }
}
