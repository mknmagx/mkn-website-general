import { NextResponse } from "next/server";
import { withAuth } from "../../../../../../../lib/services/api-auth-middleware";
import { shopifyService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";

/**
 * GET method - Test endpoint durumu
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const integrationId = url.searchParams.get('integrationId');
    
    return NextResponse.json({
      status: "active",
      message: "Webhook test-all endpoint is running",
      endpoint: "/api/admin/integrations/shopify/webhooks/test-all",
      method: "POST",
      requiredParams: ["integrationId"],
      providedIntegrationId: integrationId || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error in test-all GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
      logger.warn(`Webhook tests failed for integration ${integrationId}`, {
        error: result.error,
        details: result.details
      });
      
      return NextResponse.json(
        { 
          error: result.error || "Webhook testleri başarısız",
          details: result.details,
          integrationId 
        },
        { status: 400 }
      );
    }

    logger.info(`Webhook tests completed for integration ${integrationId}`, {
      summary: result.summary
    });

    return NextResponse.json({
      success: true,
      message: `${result.summary.successful}/${result.summary.total} webhook test başarılı`,
      summary: result.summary,
      results: result.results,
      integrationId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error("Error in test all webhooks:", {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: "Webhook testleri sırasında hata oluştu",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(testAllWebhooksHandler);