import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET - Get a single content by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const doc = await adminDb
      .collection('social-media-content')
      .doc(id)
      .get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      content: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update a content
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Get current content to check if titleId is changing
    const contentDoc = await adminDb
      .collection('social-media-content')
      .doc(id)
      .get();

    if (!contentDoc.exists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    const currentData = contentDoc.data();
    const oldTitleId = currentData?.titleId;
    const newTitleId = updates.titleId;
    const oldDatasetId = currentData?.datasetId;
    const newDatasetId = updates.datasetId;

    // Update the content
    await adminDb
      .collection('social-media-content')
      .doc(id)
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      });

    // Handle titleId changes
    if (oldTitleId && oldDatasetId && (oldTitleId !== newTitleId || oldDatasetId !== newDatasetId)) {
      try {
        // Remove from old title
        const oldTitleRef = adminDb
          .collection('socialMediaDatasets')
          .doc(oldDatasetId)
          .collection('titles')
          .doc(oldTitleId);

        const oldTitleDoc = await oldTitleRef.get();
        const oldUsedPosts = oldTitleDoc.data()?.usedPosts || [];
        
        const filteredPosts = oldUsedPosts.filter(post => post.postId !== id);
        
        await oldTitleRef.update({
          usedPosts: filteredPosts,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Eski başlık güncellenirken hata:', error);
      }
    }

    // Add to new title if titleId exists
    if (newTitleId && newDatasetId) {
      try {
        const newTitleRef = adminDb
          .collection('socialMediaDatasets')
          .doc(newDatasetId)
          .collection('titles')
          .doc(newTitleId);

        const usedPostData = {
          postId: id,
          platform: updates.platform || currentData.platform,
          contentType: updates.contentType || currentData.contentType,
          createdAt: currentData.createdAt || new Date().toISOString(),
        };

        const newTitleDoc = await newTitleRef.get();
        const currentUsedPosts = newTitleDoc.data()?.usedPosts || [];
        
        // Check if post is not already in the array
        const existsInNew = currentUsedPosts.some(post => post.postId === id);
        if (!existsInNew) {
          await newTitleRef.update({
            usedPosts: [...currentUsedPosts, usedPostData],
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Yeni başlık güncellenirken hata:', error);
      }
    }

    return NextResponse.json({
      success: true,
      id
    });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'Failed to update content', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a content
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Get content data before deleting to access titleId
    const contentDoc = await adminDb
      .collection('social-media-content')
      .doc(id)
      .get();

    if (!contentDoc.exists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    const contentData = contentDoc.data();

    // Delete the content
    await adminDb
      .collection('social-media-content')
      .doc(id)
      .delete();

    // If titleId exists, remove from title document's usedPosts
    if (contentData?.titleId && contentData?.datasetId) {
      try {
        const titleRef = adminDb
          .collection('socialMediaDatasets')
          .doc(contentData.datasetId)
          .collection('titles')
          .doc(contentData.titleId);

        const titleDoc = await titleRef.get();
        const currentUsedPosts = titleDoc.data()?.usedPosts || [];
        
        const filteredPosts = currentUsedPosts.filter(post => post.postId !== id);
        
        await titleRef.update({
          usedPosts: filteredPosts,
          updatedAt: new Date().toISOString()
        });
      } catch (titleError) {
        console.error('Başlık dosyasından post kaldırılırken hata:', titleError);
        // Don't throw, content is already deleted
      }
    }

    return NextResponse.json({
      success: true,
      id
    });
  } catch (error) {
    console.error('Delete content error:', error);
    return NextResponse.json(
      { error: 'Failed to delete content', details: error.message },
      { status: 500 }
    );
  }
}
