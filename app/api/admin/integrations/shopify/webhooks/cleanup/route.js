import { ShopifyIntegrationService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";
import { NextResponse } from "next/server";

/**
 * Shopify Webhook Records Cleanup API
 * Sadece webhook kayıtlarını temizlemek için (sipariş/müşteri verileri korunur)
 */

// Webhook kayıtlarını temizle
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

    logger.info(`Starting webhook records cleanup for integration: ${integrationId}`);

    const shopifyService = new ShopifyIntegrationService();
    const cleanupResult = await shopifyService.cleanupWebhookRecords(integrationId);
    
    if (cleanupResult.success) {
      logger.info("Webhook records cleanup completed successfully", cleanupResult);
      return NextResponse.json({
        success: true,
        message: `${cleanupResult.totalDeleted} webhook kaydı başarıyla temizlendi`,
        cleanup: cleanupResult,
        totalDeleted: cleanupResult.totalDeleted,
        deletedWebhooks: cleanupResult.deletedWebhooks,
        deletedWebhookEvents: cleanupResult.deletedWebhookEvents,
        duration: cleanupResult.duration,
      });
    } else {
      logger.warn("Webhook records cleanup failed", cleanupResult);
      return NextResponse.json(
        {
          error: cleanupResult.error || "Webhook kayıt temizleme işlemi başarısız",
          details: cleanupResult
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("Error during webhook records cleanup:", error);
    return NextResponse.json(
      {
        error: "Webhook kayıt temizleme sırasında hata",
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Integration'ın temizlenecek webhook kayıt sayısını getir (preview)
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
    
    // Webhook kayıt sayılarını hesapla
    const preview = await shopifyService.getWebhookCleanupPreview(integrationId);
    
    return NextResponse.json({
      success: true,
      integrationId,
      preview,
      totalWebhookRecords: Object.values(preview).reduce((sum, count) => sum + count, 0),
      note: "Bu işlem sadece webhook kayıtlarını temizler, sipariş ve müşteri verileri korunur",
    });
  } catch (error) {
    logger.error("Error getting webhook cleanup preview:", error);
    return NextResponse.json(
      {
        error: "Webhook temizleme önizlemesi alınamadı",
        details: error.message
      },
      { status: 500 }
    );
  }
}