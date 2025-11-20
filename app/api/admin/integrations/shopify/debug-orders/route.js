import { NextResponse } from "next/server";
import { withAuth } from "../../../../../../lib/services/api-auth-middleware";
import { shopifyService } from "../../../../../../lib/services/shopify-integration";
import logger from "../../../../../../lib/utils/logger";

/**
 * Debug Orders API - Siparişleri detaylı şekilde kontrol et
 */
export const POST = withAuth(async function POST(req) {
  try {
    const { integrationId } = await req.json();

    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 });
    }

    logger.info(`Starting debug orders check for integration: ${integrationId}`);

    // Integration'ı al
    const integration = await shopifyService.getIntegration(integrationId);
    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const { credentials } = integration;
    let shopDomain = credentials.shopDomain;
    if (!shopDomain.includes(".myshopify.com")) {
      shopDomain = `${shopDomain}.myshopify.com`;
    }

    const shopName = shopDomain.replace(".myshopify.com", "");
    const apiVersion = credentials.apiVersion || "2025-10";

    // Direct API call yaparak siparişleri kontrol et
    const debugUrls = [
      `https://${shopName}.myshopify.com/admin/api/${apiVersion}/orders.json?limit=10`,
      `https://${shopName}.myshopify.com/admin/api/${apiVersion}/orders.json?limit=10&status=any`,
      `https://${shopName}.myshopify.com/admin/api/${apiVersion}/orders.json?limit=10&status=open`,
      `https://${shopName}.myshopify.com/admin/api/${apiVersion}/orders.json?limit=10&status=closed`,
    ];

    const results = {};

    for (const [index, url] of debugUrls.entries()) {
      try {
        logger.info(`Testing URL ${index + 1}: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            "X-Shopify-Access-Token": credentials.accessToken,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          results[`url_${index + 1}`] = {
            url,
            error: `${response.status} - ${errorText}`,
            success: false
          };
          continue;
        }

        const data = await response.json();
        const orders = data.orders || [];
        
        results[`url_${index + 1}`] = {
          url,
          success: true,
          count: orders.length,
          orders: orders.map(order => ({
            id: order.id,
            name: order.name,
            email: order.email,
            total_price: order.total_price,
            currency: order.currency,
            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status,
            created_at: order.created_at,
            updated_at: order.updated_at,
            cancelled_at: order.cancelled_at,
            closed_at: order.closed_at,
            customer: {
              id: order.customer?.id,
              email: order.customer?.email,
              first_name: order.customer?.first_name,
              last_name: order.customer?.last_name,
            }
          }))
        };

        logger.success(`URL ${index + 1} returned ${orders.length} orders`);
        
      } catch (error) {
        logger.error(`Error testing URL ${index + 1}:`, error);
        results[`url_${index + 1}`] = {
          url,
          error: error.message,
          success: false
        };
      }
    }

    // Şu anki database'deki sipariş sayısını da kontrol et
    try {
      const dbOrdersCount = await shopifyService.getOrdersCount(integrationId);
      results.database_info = {
        current_orders_in_db: dbOrdersCount,
        integration_id: integrationId,
        shop_domain: shopDomain,
      };
    } catch (error) {
      results.database_info = {
        error: error.message
      };
    }

    return NextResponse.json({
      success: true,
      integration_id: integrationId,
      shop_name: shopName,
      api_version: apiVersion,
      debug_results: results,
      recommendation: "Check which URL returns the expected number of orders"
    });

  } catch (error) {
    logger.error("Error in debug orders:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
});