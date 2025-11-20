import { shopifyService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";
import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * Shopify Webhook Receiver
 * Tüm Shopify webhook'ları için merkezi endpoint
 */
export async function POST(req) {
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const topic = headers["x-shopify-topic"];
    const shopDomain = headers["x-shopify-shop-domain"];
    const isTestRequest = headers["user-agent"]?.includes("MKN-Webhook-Test");

    logger.info(`Webhook received: ${topic} from ${shopDomain}${isTestRequest ? ' (TEST)' : ' (PRODUCTION)'}`);

    // JSON parse
    const data = JSON.parse(body);

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
    const integration = await shopifyService.findIntegrationByShopDomain(shopDomain);
    if (!integration) {
      logger.warn(`No integration found for shop domain: ${shopDomain}`);
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // HMAC doğrulama - integration'ın kendi webhook secret'ı ile
    const webhookSecret = integration.credentials?.webhookSecret;
    
    // Production'da HMAC doğrulama zorunlu
    if (process.env.NODE_ENV === 'production' || !isTestRequest) {
      const isValid = verifyWebhookSignature(body, headers["x-shopify-hmac-sha256"], webhookSecret);
      if (!isValid) {
        logger.warn(`Invalid webhook signature for ${topic} from ${shopDomain}`, {
          hasSecret: !!webhookSecret,
          hasSignature: !!headers["x-shopify-hmac-sha256"],
          environment: process.env.NODE_ENV
        });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    logger.info(`Shopify webhook verified: ${topic}`, {
      id: data.id,
      shopDomain: shopDomain,
      integrationId: integration.id,
      isTest: isTestRequest
    });

    // Webhook event'ini işle
    await shopifyService.processWebhookEvent(topic, data, headers);

    return NextResponse.json({ 
      success: true, 
      processed: true,
      webhook: topic,
      integration: integration.id
    });
  } catch (error) {
    logger.error("Error processing Shopify webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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