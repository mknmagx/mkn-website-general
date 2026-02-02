/**
 * WhatsApp Conversations API Route
 * GET: Konuşmaları listele
 * POST: Konuşma oluştur/güncelle
 */

import { NextResponse } from 'next/server';
import {
  getConversations,
  getConversation,
  upsertConversation,
  markAsRead,
  updateStatus,
  addTag,
  removeTag,
  assignConversation,
  getTotalUnreadCount,
  deleteConversation,
} from '@/lib/services/whatsapp';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get single conversation
    const conversationId = searchParams.get('id');
    if (conversationId) {
      const conversation = await getConversation(conversationId);
      
      if (!conversation) {
        return NextResponse.json({
          success: false,
          error: 'Konuşma bulunamadı',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: conversation,
      });
    }

    // Get unread count only
    if (searchParams.get('unread') === 'true') {
      const totalUnread = await getTotalUnreadCount();
      return NextResponse.json({
        success: true,
        data: { totalUnread },
      });
    }

    // List conversations with filters
    const options = {
      status: searchParams.get('status') || 'all',
      assignedTo: searchParams.get('assignedTo'),
      tag: searchParams.get('tag'),
      search: searchParams.get('search'),
      pageSize: parseInt(searchParams.get('pageSize')) || 50,
      sortBy: searchParams.get('sortBy') || 'lastMessageAt',
      sortDir: searchParams.get('sortDir') || 'desc',
    };

    const result = await getConversations(options);

    // Get unread count for meta
    const totalUnread = await getTotalUnreadCount();

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        ...result.meta,
        unreadCount: totalUnread,
      },
    });
  } catch (error) {
    console.error('WhatsApp conversations GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, conversationId, waId, data } = body;

    // Mark as read
    if (action === 'markAsRead') {
      if (!conversationId) {
        return NextResponse.json({
          success: false,
          error: 'conversationId gerekli',
        }, { status: 400 });
      }

      await markAsRead(conversationId);
      return NextResponse.json({ success: true });
    }

    // Update status
    if (action === 'updateStatus') {
      if (!conversationId || !data?.status) {
        return NextResponse.json({
          success: false,
          error: 'conversationId ve status gerekli',
        }, { status: 400 });
      }

      await updateStatus(conversationId, data.status);
      return NextResponse.json({ success: true });
    }

    // Add tag
    if (action === 'addTag') {
      if (!conversationId || !data?.tag) {
        return NextResponse.json({
          success: false,
          error: 'conversationId ve tag gerekli',
        }, { status: 400 });
      }

      const result = await addTag(conversationId, data.tag);
      return NextResponse.json({ success: true, tags: result.tags });
    }

    // Remove tag
    if (action === 'removeTag') {
      if (!conversationId || !data?.tag) {
        return NextResponse.json({
          success: false,
          error: 'conversationId ve tag gerekli',
        }, { status: 400 });
      }

      const result = await removeTag(conversationId, data.tag);
      return NextResponse.json({ success: true, tags: result.tags });
    }

    // Assign to user
    if (action === 'assign') {
      if (!conversationId) {
        return NextResponse.json({
          success: false,
          error: 'conversationId gerekli',
        }, { status: 400 });
      }

      await assignConversation(conversationId, data?.userId || null);
      return NextResponse.json({ success: true });
    }

    // Create/update conversation
    if (waId) {
      const result = await upsertConversation(waId, data || {});
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Geçersiz istek',
    }, { status: 400 });
  } catch (error) {
    console.error('WhatsApp conversations POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'conversationId gerekli',
      }, { status: 400 });
    }

    await deleteConversation(conversationId);

    return NextResponse.json({
      success: true,
      message: 'Konuşma silindi',
    });
  } catch (error) {
    console.error('WhatsApp conversations DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
