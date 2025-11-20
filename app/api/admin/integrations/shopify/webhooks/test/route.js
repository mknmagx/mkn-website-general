import { NextResponse } from "next/server";
import { withAuth } from "../../../../../../../lib/services/api-auth-middleware";
import { ShopifyIntegrationService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";

/**
 * Webhook Test API
 * Shopify webhook'larını test eder
 */

// POST - Webhook test et
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { integrationId, webhookId, topic } = body;

    if (!integrationId || !webhookId || !topic) {
      return NextResponse.json(
        { 
          success: false,
          error: "Integration ID, Webhook ID ve topic gerekli" 
        },
        { status: 400 }
      );
    }

    const shopifyService = new ShopifyIntegrationService();

    // Webhook'ın gerçekten var olduğunu kontrol et
    const webhookExists = await shopifyService.verifyWebhookExists(integrationId, webhookId);
    
    if (!webhookExists.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Webhook bulunamadı veya erişilemez",
          details: webhookExists.details
        },
        { status: 404 }
      );
    }

    // Test webhook gönder
    const testResult = await shopifyService.sendTestWebhook(integrationId, webhookId, topic);

    if (testResult.success) {
      logger.info(`Webhook test successful: ${webhookId}`, testResult);
      
      return NextResponse.json({
        success: true,
        message: `${topic} webhook testi başarılı`,
        status: testResult.status,
        responseTime: testResult.responseTime,
        webhookId,
        topic,
        details: {
          shopifyResponse: testResult.shopifyResponse,
          ourEndpointTest: testResult.endpointTest
        }
      });
    } else {
      logger.warn(`Webhook test failed: ${webhookId}`, testResult);
      
      return NextResponse.json(
        {
          success: false,
          error: testResult.error || "Webhook testi başarısız",
          details: testResult.details,
          webhookId,
          topic
        },
        { status: 400 }
      );
    }

  } catch (error) {
    logger.error("Error testing webhook:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Webhook test sırasında hata oluştu",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
});