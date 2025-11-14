import { NextResponse } from 'next/server';
import { shopifyService } from '../../../../../../../lib/services/shopify-integration';
import { withAuth } from '../../../../../../../lib/services/api-auth-middleware';
import logger from '../../../../../../../lib/utils/logger';

// GET - Entegrasyonun müşterilerini getir
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

    const customers = await shopifyService.getIntegrationCustomers(id, page, limit);

    return NextResponse.json({ 
      customers,
      success: true 
    });
  } catch (error) {
    logger.error('Müşterileri getirme hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Müşteriler getirilemedi',
        success: false 
      }, 
      { status: 500 }
    );
  }
});

// POST - Shopify müşterilerini senkronize et
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
    
    const customerCount = await shopifyService.syncCustomers(id);

    return NextResponse.json({ 
      message: 'Müşteriler başarıyla senkronize edildi',
      syncedCustomers: customerCount,
      success: true
    });
  } catch (error) {
    logger.error('Müşteri senkronizasyon hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Müşteriler senkronize edilemedi',
        success: false 
      }, 
      { status: 500 }
    );
  }
});