/**
 * Instagram DM Conversations API Route
 * GET: Konuşma listesi
 */

import { NextResponse } from 'next/server';
import { getConversations, getUnreadCount } from '@/lib/services/instagram-dm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limitCount = parseInt(searchParams.get('limit') || '50', 10);

    const [conversations, unreadCount] = await Promise.all([
      getConversations({ status, limitCount }).catch(() => []),
      getUnreadCount().catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      data: conversations || [],
      meta: {
        total: conversations?.length || 0,
        unreadCount: unreadCount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    // Hata durumunda bile 200 döndür ama boş data ile
    return NextResponse.json({
      success: true,
      data: [],
      meta: {
        total: 0,
        unreadCount: 0,
      },
    });
  }
}
