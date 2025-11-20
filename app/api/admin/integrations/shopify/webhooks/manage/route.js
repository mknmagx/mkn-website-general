import { ShopifyIntegrationService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";
import { NextResponse } from "next/server";

/**
 * Shopify Webhook Management API
 * Webhook kurulumu, durum kontrolü ve konfigürasyon
 */

// Webhook'ları getir
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("integrationId");
    
    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID gerekli' },
        { status: 400 }
      );
    }

    const shopifyService = new ShopifyIntegrationService();
    
    // Sadece webhook durumunu getir - minimal credentials gerekli
    const webhooks = await shopifyService.getWebhookStatus(integrationId);
    
    return NextResponse.json({ 
      success: true, 
      webhooks,
      baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/integrations/shopify/webhooks/receiver`
    });
  } catch (error) {
    logger.error("Error fetching webhooks:", error);
    return NextResponse.json(
      { 
        error: "Webhook durumu alınamadı",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Webhook'ları kur
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

    const shopifyService = new ShopifyIntegrationService();
    const result = await shopifyService.setupWebhooks(integrationId);
    
    if (result.success) {
      logger.info("Webhooks configured successfully", result);
      return NextResponse.json({
        success: true,
        message: "Webhook'lar başarıyla yapılandırıldı",
        webhooks: result.webhooks
      });
    } else {
      logger.warn("Failed to configure webhooks", result);
      return NextResponse.json(
        {
          error: "Webhook yapılandırması başarısız",
          details: result.error
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("Error setting up webhooks:", error);
    return NextResponse.json(
      {
        error: "Webhook kurulumu sırasında hata",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Webhook'ları kaldır
export async function DELETE(request) {
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
    const result = await shopifyService.removeWebhooks(integrationId);
    
    if (result.success) {
      logger.info("Webhooks removed successfully", result);
      return NextResponse.json({
        success: true,
        message: result.message || "Webhook'lar başarıyla kaldırıldı",
        removed: result.removed || [],
        errors: result.errors
      });
    } else {
      logger.warn("Failed to remove webhooks", result);
      return NextResponse.json(
        {
          error: result.error || "Webhook kaldırma işlemi başarısız",
          details: result.details
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("Error removing webhooks:", error);
    return NextResponse.json(
      {
        error: "Webhook kaldırma sırasında hata",
        details: error.message
      },
      { status: 500 }
    );
  }
}