import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const category = searchParams.get('category');
    const contentType = searchParams.get('contentType');

    let query = adminDb.collection('social-media-titles');

    if (platform && platform !== 'all') {
      query = query.where('platform', '==', platform);
    }
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    if (contentType && contentType !== 'all') {
      query = query.where('contentType', '==', contentType);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const titles = [];
    snapshot.forEach(doc => {
      titles.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({
      success: true,
      titles: titles,
      count: titles.length
    });

  } catch (error) {
    console.error('Get titles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch titles', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const titleData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: data.status || 'draft'
    };

    const docRef = await adminDb.collection('social-media-titles').add(titleData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      title: titleData
    });

  } catch (error) {
    console.error('Create title error:', error);
    return NextResponse.json(
      { error: 'Failed to create title', details: error.message },
      { status: 500 }
    );
  }
}
