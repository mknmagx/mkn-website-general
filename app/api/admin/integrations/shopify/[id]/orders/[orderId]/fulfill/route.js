import { NextResponse } from 'next/server';
import { shopifyService } from '@/lib/services/shopify-integration';
import { withAuth } from '@/lib/services/api-auth-middleware';
import logger from '@/lib/utils/logger';

// POST - Siparişi fulfill et
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
    const { fulfillmentData } = body;

    if (!fulfillmentData) {
      return NextResponse.json(
        { 
          error: 'Fulfillment verileri gerekli',
          success: false 
        }, 
        { status: 400 }
      );
    }

    const result = await shopifyService.fulfillOrder(orderId, fulfillmentData);

    return NextResponse.json({ 
      message: 'Sipariş başarıyla fulfill edildi',
      fulfillment: result,
      success: true
    });
  } catch (error) {
    logger.error('Fulfillment hatası:', error.message);
    return NextResponse.json(
      { 
        error: 'Sipariş fulfill edilemedi',
        details: error.message,
        success: false 
      }, 
      { status: 500 }
    );
  }
});