import { NextResponse } from "next/server";
import { withAuth } from "../../../../../../../lib/services/api-auth-middleware";
import { shopifyService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";

/**
 * Webhook Debug API
 * Webhook sorunlarını debug etmek için
 */

/**
 * GET method - Webhook endpoint'lerinin durumunu kontrol et
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const integrationId = url.searchParams.get('integrationId');
    const checkEndpoints = url.searchParams.get('checkEndpoints') === 'true';
    
    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    logger.info(`Debug request for integration: ${integrationId}`);

    // Integration bilgilerini al
    const integration = await shopifyService.findIntegrationById(integrationId);
    
    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    // Webhook durumunu al
    const webhookStatus = await shopifyService.getWebhookStatus(integrationId);

    // Endpoint'lerin durumunu kontrol et
    let endpointChecks = null;
    if (checkEndpoints) {
      endpointChecks = await checkWebhookEndpoints(integration);
    }

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        shopDomain: integration.shopDomain,
        status: integration.status,
        hasCredentials: !!integration.credentials,
        hasWebhookSecret: !!integration.credentials?.webhookSecret
      },
      webhookStatus,
      endpointChecks,
      debugInfo: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        environment: process.env.NODE_ENV,
        webhookReceiverUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/shopify/webhooks/receiver`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error("Error in webhook debug:", {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: "Debug request failed",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST method - Manual webhook test
 */
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { integrationId, topic, customPayload, testType = 'standard' } = body;

    if (!integrationId || !topic) {
      return NextResponse.json(
        { error: "Integration ID and topic are required" },
        { status: 400 }
      );
    }

    logger.info(`Manual webhook test: ${topic} for integration: ${integrationId}`);

    const integration = await shopifyService.findIntegrationById(integrationId);
    
    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    // Test webhook gönder
    let testResult;
    if (testType === 'custom' && customPayload) {
      // Custom payload ile test
      testResult = await testCustomWebhook(integration, topic, customPayload);
    } else {
      // Standard test
      testResult = await shopifyService.sendTestWebhook(integrationId, 'test-webhook-id', topic);
    }

    return NextResponse.json({
      success: true,
      testResult,
      integration: {
        id: integration.id,
        shopDomain: integration.shopDomain
      },
      testInfo: {
        topic,
        testType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error("Error in manual webhook test:", {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: "Manual test failed",
        details: error.message 
      },
      { status: 500 }
    );
  }
});

/**
 * Webhook endpoint'lerinin durumunu kontrol et
 */
async function checkWebhookEndpoints(integration) {
  const checks = {};
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const receiverUrl = `${baseUrl}/api/admin/integrations/shopify/webhooks/receiver`;
    
    // GET request test
    try {
      const getResponse = await fetch(receiverUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'MKN-Debug-Check/1.0'
        }
      });
      
      checks.getRequest = {
        success: getResponse.ok,
        status: getResponse.status,
        statusText: getResponse.statusText
      };
    } catch (error) {
      checks.getRequest = {
        success: false,
        error: error.message
      };
    }

    // Test webhook endpoint
    const testUrl = `${baseUrl}/api/admin/integrations/shopify/webhooks/test-all`;
    try {
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'MKN-Debug-Check/1.0'
        }
      });
      
      checks.testEndpoint = {
        success: testResponse.ok,
        status: testResponse.status,
        statusText: testResponse.statusText
      };
    } catch (error) {
      checks.testEndpoint = {
        success: false,
        error: error.message
      };
    }

    // Manage endpoint
    const manageUrl = `${baseUrl}/api/admin/integrations/shopify/webhooks/manage?integrationId=${integration.id}`;
    try {
      const manageResponse = await fetch(manageUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'MKN-Debug-Check/1.0'
        }
      });
      
      checks.manageEndpoint = {
        success: manageResponse.ok,
        status: manageResponse.status,
        statusText: manageResponse.statusText
      };
    } catch (error) {
      checks.manageEndpoint = {
        success: false,
        error: error.message
      };
    }

  } catch (error) {
    logger.error("Error checking webhook endpoints:", error);
    checks.error = error.message;
  }
  
  return checks;
}

/**
 * Custom payload ile webhook test
 */
async function testCustomWebhook(integration, topic, customPayload) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const webhookUrl = `${baseUrl}/api/admin/integrations/shopify/webhooks/receiver`;
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Topic": topic,
        "X-Shopify-Shop-Domain": integration.shopDomain,
        "X-Shopify-Webhook-Id": "debug-test-" + Date.now(),
        "User-Agent": "MKN-Webhook-Test/1.0 (Debug)",
      },
      body: JSON.stringify(customPayload),
    });

    const responseText = await response.text();

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseBody: responseText,
      headers: Object.fromEntries(response.headers.entries()),
    };
    
  } catch (error) {
    logger.error("Custom webhook test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}