/**
 * WhatsApp Settings API Route
 * GET: Ayarları getir / Test bağlantı / Debug
 * POST: Ayarları kaydet
 * DELETE: Bağlantıyı kes
 */

import { NextResponse } from 'next/server';
import {
  getSettings,
  saveSettings,
  checkConnectionStatus,
  disconnect,
  getOrCreateWebhookVerifyToken,
  fetchAccountInfo,
  debugToken,
} from '@/lib/services/whatsapp';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Test connection
    if (action === 'test') {
      const connectionStatus = await checkConnectionStatus();
      return NextResponse.json({
        success: true,
        data: connectionStatus,
      });
    }

    // Fetch account info from token
    if (action === 'fetch-account') {
      const settings = await getSettings();
      const token = settings?.systemUserToken;
      
      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'System User Token bulunamadı. Önce bir token kaydedin.',
        }, { status: 400 });
      }

      const result = await fetchAccountInfo(token);
      
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      // Save fetched info
      await saveSettings(result.data);

      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Hesap bilgileri başarıyla alındı ve kaydedildi.',
      });
    }

    // Debug token
    if (action === 'debug-token') {
      const settings = await getSettings();
      const token = settings?.systemUserToken;
      
      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'Token bulunamadı',
        }, { status: 400 });
      }

      const result = await debugToken(token);
      return NextResponse.json(result);
    }

    // Get settings
    const settings = await getSettings();
    const verifyToken = await getOrCreateWebhookVerifyToken();

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          webhookVerifyToken: verifyToken,
          connectionStatus: { status: 'disconnected' },
        },
      });
    }

    // Mask sensitive data
    const maskedSettings = {
      appId: settings.appId,
      appSecretMasked: settings.appSecret ? '••••' + settings.appSecret.slice(-4) : null,
      systemUserTokenMasked: settings.systemUserToken 
        ? settings.systemUserToken.slice(0, 10) + '••••' + settings.systemUserToken.slice(-6) 
        : null,
      wabaId: settings.wabaId,
      phoneNumberId: settings.phoneNumberId,
      displayPhoneNumber: settings.displayPhoneNumber,
      verifiedName: settings.verifiedName,
      webhookVerifyToken: settings.webhookVerifyToken || verifyToken,
      webhookConfigured: settings.webhookConfigured,
      connectionStatus: settings.connectionStatus,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: maskedSettings,
    });
  } catch (error) {
    console.error('WhatsApp settings GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      appId,
      appSecret,
      systemUserToken,
      wabaId,
      phoneNumberId,
      displayPhoneNumber,
      verifiedName,
      webhookVerifyToken,
      webhookConfigured,
    } = body;

    // Build update object (only include non-empty values)
    const updates = {};

    if (appId !== undefined) updates.appId = appId;
    if (appSecret) updates.appSecret = appSecret;
    if (systemUserToken) updates.systemUserToken = systemUserToken;
    if (wabaId !== undefined) updates.wabaId = wabaId;
    if (phoneNumberId !== undefined) updates.phoneNumberId = phoneNumberId;
    if (displayPhoneNumber !== undefined) updates.displayPhoneNumber = displayPhoneNumber;
    if (verifiedName !== undefined) updates.verifiedName = verifiedName;
    if (webhookVerifyToken) updates.webhookVerifyToken = webhookVerifyToken;
    if (webhookConfigured !== undefined) updates.webhookConfigured = webhookConfigured;

    await saveSettings(updates);

    // Test connection if we have token and phone number ID
    let connectionStatus = null;
    if (updates.systemUserToken || updates.phoneNumberId) {
      connectionStatus = await checkConnectionStatus();
    }

    return NextResponse.json({
      success: true,
      message: 'Ayarlar kaydedildi',
      connectionStatus,
    });
  } catch (error) {
    console.error('WhatsApp settings POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await disconnect();

    return NextResponse.json({
      success: true,
      message: 'WhatsApp bağlantısı kesildi',
    });
  } catch (error) {
    console.error('WhatsApp settings DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
