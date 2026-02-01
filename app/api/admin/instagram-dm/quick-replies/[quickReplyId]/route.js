/**
 * Instagram DM Quick Reply Detail API Route
 * GET: Detay
 * PATCH: Güncelle
 * DELETE: Sil
 */

import { NextResponse } from 'next/server';
import {
  getQuickReply,
  updateQuickReply,
  deleteQuickReply,
} from '@/lib/services/instagram-dm';

export async function GET(request, { params }) {
  try {
    const { quickReplyId } = params;
    const quickReply = await getQuickReply(quickReplyId);

    if (!quickReply) {
      return NextResponse.json(
        { success: false, error: 'Quick reply not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quickReply,
    });
  } catch (error) {
    console.error('Error fetching quick reply:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { quickReplyId } = params;
    const body = await request.json();

    await updateQuickReply(quickReplyId, body);
    const updated = await getQuickReply(quickReplyId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating quick reply:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { quickReplyId } = params;
    await deleteQuickReply(quickReplyId);

    return NextResponse.json({
      success: true,
      message: 'Quick reply deleted',
    });
  } catch (error) {
    console.error('Error deleting quick reply:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
