import { NextResponse } from 'next/server';
import { shopifyService } from '../../../../../../../../lib/services/shopify-integration';
import { withAuth } from '../../../../../../../../lib/services/api-auth-middleware';
import logger from '../../../../../../../../lib/utils/logger';

// POST - Sipariş iadesi oluştur
export const POST = withAuth(async (request, { params }) => {
  try {
    const { id, orderId } = await params;
    
    if (!id || !orderId) {
      return NextResponse.json(
        { 
          error: 'Entegrasyon ID ve Sipariş ID gerekli',
          success: false 
        }, 
        { status: 400 }
      );
    }

    const body = await request.json();
    const { refundData } = body;

    if (!refundData) {
      return NextResponse.json(
        { 
          error: 'Refund verileri gerekli',
          success: false 
        }, 
        { status: 400 }
      );
    }

    const result = await shopifyService.refundOrder(orderId, refundData);

    return NextResponse.json({ 
      message: 'Sipariş iadesi başarıyla oluşturuldu',
      refund: result,
      success: true
    });
  } catch (error) {
    logger.error('Refund hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Sipariş iadesi oluşturulamadı',
        details: error.message,
        success: false 
      }, 
      { status: 500 }
    );
  }
});