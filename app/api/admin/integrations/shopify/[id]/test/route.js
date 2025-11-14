import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../../../lib/services/api-auth-middleware';
import logger from '../../../../../../../lib/utils/logger';

// POST - Shopify API bağlantısını test et (specific integration için)
export const POST = withAuth(async (request, { params }) => {
  try {
    // params'ı await ile al (Next.js 13+ için gerekli)
    const { id } = await params;
    const body = await request.json();
    const { shopDomain: originalShopDomain, accessToken, apiVersion = '2025-10' } = body;

    if (!originalShopDomain || !accessToken) {
      return NextResponse.json(
        { error: 'Shop domain ve access token gerekli' }, 
        { status: 400 }
      );
    }

    // Access token format kontrolü
    if (!accessToken.startsWith('shppa_') && !accessToken.startsWith('shpat_') && !accessToken.startsWith('shpca_')) {
      return NextResponse.json(
        { error: 'Geçersiz token formatı. Token shppa_, shpat_ veya shpca_ ile başlamalı.' }, 
        { status: 400 }
      );
    }

    // Shopify domain'ini düzelt
    let shopDomain = originalShopDomain;
    if (!shopDomain.includes('.myshopify.com')) {
      shopDomain = `${shopDomain}.myshopify.com`;
    }
    
    // .myshopify.com'u kaldır ve sadece shop name'i al
    const shopName = shopDomain.replace('.myshopify.com', '');

    // Shopify API'ye test çağrısı
    const shopifyUrl = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/shop.json`;
    
    const response = await fetch(shopifyUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Geçersiz access token veya yetersiz izinler',
            details: {
              shopName,
              apiVersion,
              url: shopifyUrl,
              suggestions: [
                'Access token\'ın doğru olduğunu kontrol edin',
                'Private app\'in aktif olduğunu kontrol edin',
                'Admin API erişim izinlerini kontrol edin',
                'Shop domain\'in doğru olduğunu kontrol edin'
              ]
            }
          }, 
          { status: 401 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { error: 'Shop domain bulunamadı' }, 
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { error: 'Shopify API bağlantı hatası' }, 
          { status: 400 }
        );
      }
    }

    const shopData = await response.json();

    return NextResponse.json({ 
      success: true,
      data: {
        shopName: shopData.shop.name,
        domain: shopData.shop.domain,
        email: shopData.shop.email,
        currency: shopData.shop.currency,
        timezone: shopData.shop.timezone
      }
    });

  } catch (error) {
    logger.error('Shopify connection test error:', error.message);
    return NextResponse.json(
      { error: 'Bağlantı test edilemedi' }, 
      { status: 500 }
    );
  }
});