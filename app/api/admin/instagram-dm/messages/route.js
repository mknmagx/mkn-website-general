/**
 * Instagram DM Messages API Route
 * POST: Mesaj gönderme
 */

import { NextResponse } from 'next/server';
import {
  sendMessage,
  sendImageMessage,
  getConversation,
  incrementUsageCount,
} from '@/lib/services/instagram-dm';

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationId, content, messageType = 'text', mediaUrl, quickReplyId } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Konuşmayı al (recipientId için)
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    let result;

    if (messageType === 'image' && mediaUrl) {
      result = await sendImageMessage(conversationId, conversation.igUserId, mediaUrl);
    } else {
      result = await sendMessage(conversationId, conversation.igUserId, content);
    }

    // Quick reply kullanıldıysa sayacı artır
    if (quickReplyId) {
      await incrementUsageCount(quickReplyId);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
