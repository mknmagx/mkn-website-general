/**
 * WhatsApp Messages API Route
 * GET: Mesajları listele
 * POST: Mesaj gönder
 */

import { NextResponse } from 'next/server';
import {
  getMessages,
  sendMessage,
  sendImageMessage,
  sendTemplate,
} from '@/lib/services/whatsapp';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'conversationId gerekli',
      }, { status: 400 });
    }

    const options = {
      pageSize: parseInt(searchParams.get('pageSize')) || 50,
    };

    const result = await getMessages(conversationId, options);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error('WhatsApp messages GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, to, conversationId, text, imageUrl, caption, templateName, languageCode, components } = body;

    if (!to) {
      return NextResponse.json({
        success: false,
        error: 'Alıcı telefon numarası (to) gerekli',
      }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'text':
        if (!text) {
          return NextResponse.json({
            success: false,
            error: 'Mesaj metni gerekli',
          }, { status: 400 });
        }
        result = await sendMessage(conversationId, to, text);
        break;

      case 'image':
        if (!imageUrl) {
          return NextResponse.json({
            success: false,
            error: 'Resim URL\'i gerekli',
          }, { status: 400 });
        }
        result = await sendImageMessage(conversationId, to, imageUrl, caption || '');
        break;

      case 'template':
        if (!templateName || !languageCode) {
          return NextResponse.json({
            success: false,
            error: 'Şablon adı ve dil kodu gerekli',
          }, { status: 400 });
        }
        result = await sendTemplate(conversationId, to, templateName, languageCode, components || []);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Geçersiz mesaj tipi. Desteklenen tipler: text, image, template',
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      waMessageId: result.waMessageId,
    });
  } catch (error) {
    console.error('WhatsApp messages POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
