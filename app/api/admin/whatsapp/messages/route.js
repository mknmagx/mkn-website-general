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
  sendDocumentMessage,
  sendTemplate,
  isServiceWindowOpen,
  findByWaId,
  upsertConversation,
  sendGenericMediaMessage,
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
    const { type, to, conversationId, text, imageUrl, mediaUrl, caption, templateName, languageCode, components, skipWindowCheck, filename, replyToMessageId } = body;

    if (!to) {
      return NextResponse.json({
        success: false,
        error: 'Alıcı telefon numarası (to) gerekli',
      }, { status: 400 });
    }

    // Get or create conversation for new contacts
    let convId = conversationId;
    if (!convId) {
      const existing = await findByWaId(to);
      if (existing) {
        convId = existing.id;
      } else {
        const newConv = await upsertConversation(to, {
          displayPhoneNumber: to,
          waId: to,
        });
        convId = newConv.id;
      }
    }

    // Check service window for non-template messages
    if (type !== 'template' && !skipWindowCheck) {
      const isOpen = await isServiceWindowOpen(convId);
      if (!isOpen) {
        return NextResponse.json({
          success: false,
          error: '24 saatlik mesajlaşma penceresi kapalı. Sadece şablon mesajı gönderebilirsiniz.',
          code: 'WINDOW_CLOSED',
          requiresTemplate: true,
        }, { status: 400 });
      }
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
        result = await sendMessage(convId, to, text, replyToMessageId || null);
        break;

      case 'image':
        if (!imageUrl && !mediaUrl) {
          return NextResponse.json({
            success: false,
            error: 'Resim URL\'i gerekli',
          }, { status: 400 });
        }
        result = await sendImageMessage(convId, to, imageUrl || mediaUrl, caption || '');
        break;

      case 'document':
        if (!mediaUrl) {
          return NextResponse.json({
            success: false,
            error: 'Doküman URL\'i gerekli',
          }, { status: 400 });
        }
        result = await sendDocumentMessage(convId, to, mediaUrl, filename || 'document', caption || '');
        break;

      case 'video':
      case 'audio':
        if (!mediaUrl) {
          return NextResponse.json({
            success: false,
            error: 'Medya URL\'i gerekli',
          }, { status: 400 });
        }
        // Use generic media message for video and audio
        result = await sendGenericMediaMessage(convId, to, type, mediaUrl, caption || '');
        break;

      case 'template':
        if (!templateName || !languageCode) {
          return NextResponse.json({
            success: false,
            error: 'Şablon adı ve dil kodu gerekli',
          }, { status: 400 });
        }
        result = await sendTemplate(convId, to, templateName, languageCode, components || []);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Geçersiz mesaj tipi. Desteklenen tipler: text, image, video, audio, document, template',
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      conversationId: convId,
    });
  } catch (error) {
    console.error('WhatsApp messages POST error:', error);
    
    // Handle Meta API errors
    if (error.code === 131047) {
      return NextResponse.json({
        success: false,
        error: '24 saatlik mesajlaşma penceresi kapalı. Müşterinin son 24 saat içinde mesaj göndermesi gerekiyor.',
        code: 'WINDOW_CLOSED',
        requiresTemplate: true,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
