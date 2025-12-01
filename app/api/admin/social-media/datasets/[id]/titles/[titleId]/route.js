import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// PATCH - Update a title
export async function PATCH(request, { params }) {
  try {
    const { id, titleId } = params;
    const body = await request.json();

    await adminDb
      .collection('socialMediaDatasets')
      .doc(id)
      .collection('titles')
      .doc(titleId)
      .update({
        ...body,
        updatedAt: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      id: titleId
    });
  } catch (error) {
    console.error('Update title error:', error);
    return NextResponse.json(
      { error: 'Failed to update title', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a title
export async function DELETE(request, { params }) {
  try {
    const { id, titleId } = params;

    await adminDb
      .collection('socialMediaDatasets')
      .doc(id)
      .collection('titles')
      .doc(titleId)
      .delete();

    // Update dataset titleCount
    const datasetRef = adminDb.collection('socialMediaDatasets').doc(id);
    const datasetDoc = await datasetRef.get();
    const currentCount = datasetDoc.data()?.titleCount || 0;
    
    await datasetRef.update({
      titleCount: Math.max(0, currentCount - 1),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      id: titleId
    });
  } catch (error) {
    console.error('Delete title error:', error);
    return NextResponse.json(
      { error: 'Failed to delete title', details: error.message },
      { status: 500 }
    );
  }
}
