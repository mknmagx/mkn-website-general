import { shopifyService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";
import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * Shopify Webhook Receiver
 * Tüm Shopify webhook'ları için merkezi endpoint
 */

/**
 * GET method - Webhook endpoint durumu kontrolü
 * Shopify webhook verification için kullanılır
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const challenge = url.searchParams.get('challenge');
    
    logger.info("Webhook endpoint GET request received", {
      challenge: !!challenge,
      searchParams: Object.fromEntries(url.searchParams.entries()),
      headers: Object.fromEntries(req.headers.entries())
    });

    // Shopify webhook verification challenge
    if (challenge) {
      logger.info("Webhook verification challenge received");
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Normal GET request - endpoint status
    return NextResponse.json({
      status: "active",
      message: "Shopify webhook receiver is running",
      endpoint: "/api/admin/integrations/shopify/webhooks/receiver",
      methods: ["GET", "POST"],
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
    
  } catch (error) {
    logger.error("Error in webhook receiver GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST method - Webhook event processing
 */
export async function POST(req) {
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const topic = headers["x-shopify-topic"];
    const shopDomain = headers["x-shopify-shop-domain"];
    const isTestRequest = headers["user-agent"]?.includes("MKN-Webhook-Test");

    logger.info(`Webhook received: ${topic} from ${shopDomain}${isTestRequest ? ' (TEST)' : ' (PRODUCTION)'}`, {
      contentLength: body.length,
      hasBody: body.length > 0,
      headers: {
        topic,
        shopDomain,
        userAgent: headers["user-agent"],
        contentType: headers["content-type"],
        hasSignature: !!headers["x-shopify-hmac-sha256"]
      }
    });

    // Empty body check
    if (!body || body.trim().length === 0) {
      logger.warn("Empty webhook body received", { headers });
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    // JSON parse with error handling
    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      logger.error("Invalid JSON in webhook body", { 
        error: parseError.message,
        bodyPreview: body.substring(0, 200)
      });
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    // Required headers check
    if (!topic) {
      logger.warn("Missing X-Shopify-Topic header");
      return NextResponse.json({ error: "Missing X-Shopify-Topic header" }, { status: 400 });
    }

    if (!shopDomain) {
      logger.warn("Missing X-Shopify-Shop-Domain header");
      return NextResponse.json({ error: "Missing X-Shopify-Shop-Domain header" }, { status: 400 });
    }

    // Test istekleri için özel handling
    if (isTestRequest) {
      logger.info(`Processing test webhook: ${topic}`);
      
      // Production'da test istekleri için minimal doğrulama
      if (process.env.NODE_ENV === 'production') {
        // Production'da test webhook'ları için basit doğrulama
        const integration = await shopifyService.findIntegrationByShopDomain(shopDomain);
        if (!integration) {
          logger.warn(`Test webhook: No integration found for shop domain: ${shopDomain}`);
          return NextResponse.json({ error: "Integration not found" }, { status: 404 });
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        processed: true, 
        message: "Test webhook received successfully",
        topic: topic,
        shopDomain: shopDomain,
        environment: process.env.NODE_ENV
      });
    }

    // Production webhook processing
    // Shop domain'e göre integration bul ve webhook secret al
    let integration;
    try {
      integration = await shopifyService.findIntegrationByShopDomain(shopDomain);
    } catch (dbError) {
      logger.error("Database error while finding integration", {
        error: dbError.message,
        shopDomain
      });
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!integration) {
      logger.warn(`No integration found for shop domain: ${shopDomain}`, {
        isTest: isTestRequest,
        topic
      });
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // HMAC doğrulama - Shopify App API Secret Key kullanılmalı
    // Shopify, webhook'ları App'in API Secret Key ile imzalar
    // credentials.apiSecret: Shopify App'in API Secret Key'i (shpss_...)
    const webhookSecret = integration.credentials?.apiSecret || integration.credentials?.apiSecretKey || integration.credentials?.webhookSecret;
    
    // Production'da HMAC doğrulama zorunlu (test istekleri hariç)
    if ((process.env.NODE_ENV === 'production' && !isTestRequest) || 
        (process.env.NODE_ENV === 'development' && !isTestRequest)) {
      const isValid = verifyWebhookSignature(body, headers["x-shopify-hmac-sha256"], webhookSecret);
      if (!isValid) {
        logger.warn(`Invalid webhook signature for ${topic} from ${shopDomain}`, {
          hasSecret: !!webhookSecret,
          hasApiSecret: !!integration.credentials?.apiSecret,
          hasApiSecretKey: !!integration.credentials?.apiSecretKey,
          hasWebhookSecret: !!integration.credentials?.webhookSecret,
          hasSignature: !!headers["x-shopify-hmac-sha256"],
          environment: process.env.NODE_ENV,
          isTest: isTestRequest,
          integrationId: integration.id
        });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    logger.info(`Shopify webhook verified: ${topic}`, {
      id: data.id,
      shopDomain: shopDomain,
      integrationId: integration.id,
      isTest: isTestRequest,
      dataKeys: Object.keys(data).slice(0, 10) // İlk 10 key'i log'la
    });

    // Webhook event'ini işle
    try {
      await shopifyService.processWebhookEvent(topic, data, headers);
      
      logger.info(`Webhook processed successfully: ${topic}`, {
        id: data.id,
        integrationId: integration.id,
        isTest: isTestRequest
      });
    } catch (processingError) {
      logger.error("Error processing webhook event:", {
        error: processingError.message,
        topic,
        shopDomain,
        integrationId: integration.id,
        dataId: data.id
      });
      
      // Processing error'unda bile 200 dön (Shopify retry'ı önlemek için)
      return NextResponse.json({ 
        success: false, 
        processed: false,
        error: "Processing error",
        webhook: topic,
        integration: integration.id
      });
    }

    return NextResponse.json({ 
      success: true, 
      processed: true,
      webhook: topic,
      integration: integration.id,
      dataId: data.id,
      isTest: isTestRequest
    });
  } catch (error) {
    logger.error("Error processing Shopify webhook:", {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Webhook imzasını doğrula
 */
function verifyWebhookSignature(body, signature, webhookSecret) {
  try {
    if (!webhookSecret) {
      logger.warn("Webhook secret not configured for this integration");
      return false;
    }

    if (!signature) {
      logger.warn("No HMAC signature provided");
      return false;
    }

    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("base64");

    const isValid = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    
    if (!isValid) {
      logger.warn("HMAC signature verification failed", {
        expectedHash: hash.substring(0, 10) + "...",
        receivedSignature: signature.substring(0, 10) + "...",
        secretConfigured: !!webhookSecret
      });
    }

    return isValid;
  } catch (error) {
    logger.error("Error verifying webhook signature:", {
      error: error.message,
      hasSecret: !!webhookSecret,
      hasSignature: !!signature
    });
    return false;
  }
}