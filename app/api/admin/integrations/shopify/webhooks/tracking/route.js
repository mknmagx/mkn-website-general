import { ShopifyIntegrationService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";
import { NextResponse } from "next/server";

/**
 * Webhook ve Sync Data Tracking API
 * Webhook ve sync işlemleri arasındaki veri çakışmalarını izlemek için
 */

// Data source istatistiklerini getir
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("integrationId");
    const days = parseInt(searchParams.get("days") || "7");
    
    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID gerekli" },
        { status: 400 }
      );
    }

    const shopifyService = new ShopifyIntegrationService();
    
    // Data source istatistiklerini getir
    const stats = await shopifyService.getDataSourceStats(integrationId, days);
    
    return NextResponse.json({
      success: true,
      integrationId,
      days,
      stats,
    });
  } catch (error) {
    logger.error("Error getting data source stats:", error);
    return NextResponse.json(
      {
        error: "Data source istatistikleri alınamadı",
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Data conflict raporunu getir
export async function POST(request) {
  try {
    const body = await request.json();
    const { integrationId, days = 7 } = body;
    
    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID gerekli" },
        { status: 400 }
      );
    }

    const shopifyService = new ShopifyIntegrationService();
    
    // Conflict raporunu getir
    const conflictReport = await shopifyService.getDataConflictReport(integrationId, days);
    
    return NextResponse.json({
      success: true,
      integrationId,
      days,
      conflicts: conflictReport,
    });
  } catch (error) {
    logger.error("Error getting data conflict report:", error);
    return NextResponse.json(
      {
        error: "Data conflict raporu alınamadı",
        details: error.message
      },
      { status: 500 }
    );
  }
}