/**
 * Instagram DM Single Conversation API Route
 * GET: Konuşma detayı ve mesajları
 * PATCH: Konuşma güncelleme (status, tags, assignment)
 */

import { NextResponse } from 'next/server';
import {
  getConversation,
  getMessages,
  markAsRead,
  updateStatus,
  addTag,
  removeTag,
  assignTo,
  clearMessages,
  deleteConversation,
} from '@/lib/services/instagram-dm';

export async function GET(request, { params }) {
  try {
    const { conversationId } = await params;

    const [conversation, messages] = await Promise.all([
      getConversation(conversationId),
      getMessages(conversationId),
    ]);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Okundu olarak işaretle
    await markAsRead(conversationId);

    return NextResponse.json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { conversationId } = await params;
    const body = await request.json();

    const { action, ...data } = body;

    switch (action) {
      case 'updateStatus':
        await updateStatus(conversationId, data.status);
        break;
      case 'addTag':
        await addTag(conversationId, data.tag);
        break;
      case 'removeTag':
        await removeTag(conversationId, data.tag);
        break;
      case 'assign':
        await assignTo(conversationId, data.userId);
        break;
      case 'markAsRead':
        await markAsRead(conversationId);
        break;
      case 'clearMessages':
        await clearMessages(conversationId);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedConversation = await getConversation(conversationId);

    return NextResponse.json({
      success: true,
      data: updatedConversation,
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { conversationId } = await params;

    await deleteConversation(conversationId);

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
