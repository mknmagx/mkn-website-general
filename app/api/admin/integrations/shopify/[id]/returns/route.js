import { NextResponse } from 'next/server';
import { shopifyService } from '../../../../../../../lib/services/shopify-integration';
import { withAuth } from '../../../../../../../lib/services/api-auth-middleware';
import logger from '../../../../../../../lib/utils/logger';

// GET - Entegrasyonun iadelerini getir
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

    const returns = await shopifyService.getIntegrationReturns(id, page, limit);

    return NextResponse.json({ 
      returns,
      success: true 
    });
  } catch (error) {
    logger.error('İadeleri getirme hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'İadeler getirilemedi',
        success: false 
      }, 
      { status: 500 }
    );
  }
});

// POST - Shopify iadelerini senkronize et
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
    
    const returnCount = await shopifyService.syncReturns(id);

    return NextResponse.json({ 
      message: 'İadeler başarıyla senkronize edildi',
      syncedReturns: returnCount,
      success: true
    });
  } catch (error) {
    logger.error('İade senkronizasyon hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'İadeler senkronize edilemedi',
        success: false 
      }, 
      { status: 500 }
    );
  }
});