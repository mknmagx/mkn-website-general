import { NextResponse } from "next/server";
import { withAuth } from "../../../../../../../lib/services/api-auth-middleware";
import { shopifyService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";

/**
 * Webhook Secret Migration
 * Mevcut integration'lar için webhook secret'larını oluştur
 * POST /api/admin/integrations/shopify/webhooks/migrate-secrets
 */
async function migrateWebhookSecretsHandler(req) {
  try {
    logger.info("Starting webhook secrets migration via API");

    const result = await shopifyService.migrateWebhookSecrets();

    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Migration failed",
          details: result 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed: ${result.updated} secrets created, ${result.skipped} skipped`,
      details: result
    });

  } catch (error) {
    logger.error("Error in webhook secrets migration:", error);
    return NextResponse.json(
      { 
        error: "Migration failed", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(migrateWebhookSecretsHandler);