import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    let query = adminDb.collection('social-media-content');

    if (platform && platform !== 'all') {
      query = query.where('platform', '==', platform);
    }
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const content = [];
    snapshot.forEach(doc => {
      content.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({
      success: true,
      content: content,
      count: content.length
    });

  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const contentData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: data.status || 'draft'
    };

    const docRef = await adminDb.collection('social-media-content').add(contentData);
    const contentId = docRef.id;

    // If titleId exists, update the title document with usedPosts info
    if (data.titleId && data.datasetId) {
      try {
        const titleRef = adminDb
          .collection('socialMediaDatasets')
          .doc(data.datasetId)
          .collection('titles')
          .doc(data.titleId);

        const usedPostData = {
          postId: contentId,
          platform: data.platform,
          contentType: data.contentType,
          createdAt: contentData.createdAt,
        };

        const titleDoc = await titleRef.get();
        const currentUsedPosts = titleDoc.data()?.usedPosts || [];
        
        await titleRef.update({
          usedPosts: [...currentUsedPosts, usedPostData],
          updatedAt: new Date().toISOString()
        });
      } catch (titleError) {
        console.error('Başlık dosyası güncellenirken hata:', titleError);
        // Don't throw, content is already saved
      }
    }

    return NextResponse.json({
      success: true,
      id: contentId,
      content: contentData
    });

  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json(
      { error: 'Failed to create content', details: error.message },
      { status: 500 }
    );
  }
}
