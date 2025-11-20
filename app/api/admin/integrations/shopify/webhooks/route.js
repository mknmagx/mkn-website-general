import { shopifyService } from "../../../../../../lib/services/shopify-integration";
import { withAuth } from "../../../../../../lib/services/api-auth-middleware";
import logger from "../../../../../../lib/utils/logger";
import { NextResponse } from "next/server";

/**
 * Shopify Webhook Yönetimi API
 * /api/admin/integrations/shopify/webhooks
 */

// Webhook'ları listele
export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("integrationId");
    const action = searchParams.get("action");

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID gerekli" },
        { status: 400 }
      );
    }

    let result;

    if (action === "shopify") {
      // Shopify'dan mevcut webhook'ları çek
      result = await shopifyService.fetchWebhooksFromShopify(integrationId);
      return NextResponse.json({ webhooks: result });
    } else {
      // Database'den webhook'ları çek
      result = await shopifyService.getWebhooks(integrationId);
      return NextResponse.json({ webhooks: result });
    }
  } catch (error) {
    logger.error("Error fetching webhooks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// Webhook kur
export const POST = withAuth(async (request) => {
  try {
    const { integrationId, webhookConfig, action } = await request.json();

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID gerekli" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "setup":
        // Webhook'ları kur
        result = await shopifyService.setupWebhooks(integrationId, webhookConfig);
        break;
        
      case "deleteAll":
        // Tüm webhook'ları sil
        result = await shopifyService.deleteAllWebhooks(integrationId);
        break;
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error managing webhooks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// Tekil webhook sil
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("integrationId");
    const webhookId = searchParams.get("webhookId");

    if (!integrationId || !webhookId) {
      return NextResponse.json(
        { error: "Integration ID ve Webhook ID gerekli" },
        { status: 400 }
      );
    }

    await shopifyService.deleteWebhook(integrationId, webhookId);

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    logger.error("Error deleting webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});