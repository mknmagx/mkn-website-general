/**
 * Instagram DM Quick Replies API Route
 * GET: Liste
 * POST: Oluştur
 */

import { NextResponse } from 'next/server';
import {
  getQuickReplies,
  createQuickReply,
  seedDefaultQuickReplies,
} from '@/lib/services/instagram-dm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const quickReplies = await getQuickReplies({ category });

    return NextResponse.json({
      success: true,
      data: quickReplies,
    });
  } catch (error) {
    console.error('Error fetching quick replies:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Seed default kontrolü
    if (body.action === 'seed') {
      await seedDefaultQuickReplies();
      return NextResponse.json({
        success: true,
        message: 'Default quick replies seeded',
      });
    }

    const { title, content, shortcut, category } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const id = await createQuickReply({ title, content, shortcut, category });

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('Error creating quick reply:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
