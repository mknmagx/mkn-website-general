import { NextResponse } from 'next/server';
import { shopifyService } from '../../../../../../../lib/services/shopify-integration';
import { withAuth } from '../../../../../../../lib/services/api-auth-middleware';
import logger from '../../../../../../../lib/utils/logger';

// POST - Shopify verilerini kapsamlı senkronize et
export const POST = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: 'Entegrasyon ID gerekli',
          success: false 
        }, 
        { status: 400 }
      );
    }

    const body = await request.json();
    const { syncType = "comprehensive", includeAnalytics = true, refreshCache = true } = body;

    let syncResults = {};

    // Senkronizasyon tipine göre işlem yap
    if (syncType === "comprehensive" || syncType === "all") {
      logger.info(`Starting comprehensive sync for integration ${id}`);
      
      // Parallel sync operations
      const syncPromises = [];

      // 1. Siparişleri sync et
      syncPromises.push(
        shopifyService.syncOrders(id).then(count => {
          syncResults.orders = count;
          logger.info(`Orders synced: ${count}`);
        }).catch(error => {
          logger.error('Orders sync failed:', error.message);
          syncResults.orders = 0;
        })
      );

      // 2. Müşterileri sync et
      syncPromises.push(
        shopifyService.syncCustomers(id).then(count => {
          syncResults.customers = count;
          logger.info(`Customers synced: ${count}`);
        }).catch(error => {
          logger.error('Customers sync failed:', error.message);
          syncResults.customers = 0;
        })
      );

      // 3. İadeleri sync et
      syncPromises.push(
        shopifyService.syncReturns(id).then(count => {
          syncResults.returns = count;
          logger.info(`Returns synced: ${count}`);
        }).catch(error => {
          logger.error('Returns sync failed:', error.message);
          syncResults.returns = 0;
        })
      );

      // Tüm sync işlemlerini bekle
      await Promise.all(syncPromises);

      // 4. Analytics'i yenile (diğer işlemlerden sonra)
      if (includeAnalytics) {
        try {
          await shopifyService.refreshAnalytics(id);
          syncResults.analytics = true;
          logger.info('Analytics refreshed successfully');
        } catch (error) {
          logger.error('Analytics refresh failed:', error.message);
          syncResults.analytics = false;
        }
      }

      // 5. Integration metadata'sını güncelle
      await shopifyService.updateIntegration(id, {
        lastSyncAt: new Date(),
        lastSyncType: "comprehensive",
        lastSyncResults: syncResults
      });

    } else if (syncType === "orders") {
      // Sadece siparişleri sync et (backward compatibility)
      const orderCount = await shopifyService.syncOrders(id);
      syncResults.orders = orderCount;
    }

    const totalSynced = Object.values(syncResults).reduce((sum, count) => {
      return sum + (typeof count === 'number' ? count : 0);
    }, 0);

    return NextResponse.json({ 
      message: `Senkronizasyon tamamlandı: ${totalSynced} toplam kayıt`,
      syncResults,
      syncType,
      totalSynced,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    logger.error('Comprehensive sync hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Senkronizasyon işlemi başarısız oldu',
        details: error.message,
        success: false 
      }, 
      { status: 500 }
    );
  }
});

// GET - Entegrasyonun siparişlerini getir
export const GET = withAuth(async (request, { params }) => {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: 'Entegrasyon ID gerekli',
          success: false 
        }, 
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const orders = await shopifyService.getIntegrationOrders(id, page, limit);

    return NextResponse.json({ 
      orders,
      success: true 
    });
  } catch (error) {
    logger.error('Siparişleri getirme hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Siparişler getirilemedi',
        success: false 
      }, 
      { status: 500 }
    );
  }
});