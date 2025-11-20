import { NextResponse } from "next/server";
import { withAuth } from "../../../../../../../lib/services/api-auth-middleware";
import { shopifyService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";

/**
 * Tüm webhook'ları test et
 * POST /api/admin/integrations/shopify/webhooks/test-all
 */
async function testAllWebhooksHandler(req) {
  try {
    const { integrationId } = await req.json();

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    logger.info(`Testing all webhooks for integration: ${integrationId}`);

    const result = await shopifyService.testAllWebhooks(integrationId);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || "Webhook testleri başarısız",
          details: result.details 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.summary.successful}/${result.summary.total} webhook test başarılı`,
      summary: result.summary,
      results: result.results
    });

  } catch (error) {
    logger.error("Error in test all webhooks:", error);
    return NextResponse.json(
      { error: "Webhook testleri sırasında hata oluştu" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(testAllWebhooksHandler);