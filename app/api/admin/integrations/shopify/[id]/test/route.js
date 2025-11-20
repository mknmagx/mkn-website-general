import { NextResponse } from "next/server";
import { withAuth } from "../../../../../../../lib/services/api-auth-middleware";
import { ShopifyIntegrationService } from "../../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../../lib/utils/logger";

// POST - Shopify API bağlantısını test et (database credentials kullanarak)
export const POST = withAuth(async (request, { params }) => {
  try {
    // params'ı await ile al (Next.js 13+ için gerekli)
    const { id } = await params;

    // Create service instance
    const shopifyService = new ShopifyIntegrationService();

    // Test connection using database credentials
    const result = await shopifyService.testConnection(id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Shopify bağlantısı başarılı!",
        data: {
          shopName: result.shopInfo.name,
          domain: result.shopInfo.domain,
          email: result.shopInfo.email,
          plan: result.shopInfo.plan_name || result.shopInfo.plan_display_name,
          country: result.shopInfo.country_name || result.shopInfo.country,
          currency: result.shopInfo.currency,
          timezone: result.shopInfo.timezone,
          createdAt: result.shopInfo.created_at,
          shopOwner: result.shopInfo.shop_owner,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Bağlantı testi başarısız",
          details: result.details || {},
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("Shopify connection test error:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: "Bağlantı testi sırasında hata oluştu: " + error.message,
      },
      { status: 500 }
    );
  }
});
