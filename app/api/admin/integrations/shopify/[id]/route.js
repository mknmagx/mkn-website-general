import { NextResponse } from 'next/server';
import { shopifyService } from '../../../../../../lib/services/shopify-integration';
import { withAuth } from '../../../../../../lib/services/api-auth-middleware';
import logger from '../../../../../../lib/utils/logger';

// GET - Belirli bir entegrasyonun detaylarını getir
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

    const integration = await shopifyService.getIntegration(id);

    if (!integration) {
      return NextResponse.json(
        { 
          error: 'Entegrasyon bulunamadı',
          success: false 
        }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      integration,
      success: true 
    });
  } catch (error) {
    logger.error('Entegrasyon detayları getirme hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Entegrasyon detayları getirilemedi',
        success: false 
      }, 
      { status: 500 }
    );
  }
});

// PUT - Entegrasyon bilgilerini güncelle
export const PUT = withAuth(async (request, { params }) => {
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

    // Temel validasyon
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { 
          error: 'Güncellenecek veri gerekli',
          success: false 
        }, 
        { status: 400 }
      );
    }

    const updated = await shopifyService.updateIntegration(id, body);

    if (!updated) {
      return NextResponse.json(
        { 
          error: 'Entegrasyon güncellenemedi',
          success: false 
        }, 
        { status: 400 }
      );
    }

    // Güncellenmiş entegrasyon bilgilerini getir
    const updatedIntegration = await shopifyService.getIntegration(id);

    return NextResponse.json({ 
      message: 'Entegrasyon başarıyla güncellendi',
      integration: updatedIntegration,
      success: true
    });
  } catch (error) {
    logger.error('Entegrasyon güncelleme hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Entegrasyon güncellenirken bir hata oluştu',
        success: false 
      }, 
      { status: 500 }
    );
  }
});

// DELETE - Entegrasyonu sil
export const DELETE = withAuth(async (request, { params }) => {
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

    const deleted = await shopifyService.deleteIntegration(id);

    if (!deleted) {
      return NextResponse.json(
        { 
          error: 'Entegrasyon silinemedi',
          success: false 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Entegrasyon başarıyla silindi',
      success: true
    });
  } catch (error) {
    logger.error('Entegrasyon silme hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Entegrasyon silinirken bir hata oluştu',
        success: false,
        details: error.message 
      }, 
      { status: 500 }
    );
  }
});