import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET - Get single dataset
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const docRef = await adminDb.collection('socialMediaDatasets').doc(id).get();

    if (!docRef.exists) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dataset: {
        id: docRef.id,
        ...docRef.data()
      }
    });
  } catch (error) {
    console.error('Get dataset error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update dataset
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    await adminDb.collection('socialMediaDatasets').doc(id).update({
      ...body,
      updatedAt: new Date().toISOString()
    });

    // Get updated dataset
    const updatedDoc = await adminDb.collection('socialMediaDatasets').doc(id).get();

    return NextResponse.json({
      success: true,
      dataset: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Update dataset error:', error);
    return NextResponse.json(
      { error: 'Failed to update dataset', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete dataset and its titles
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Delete all titles in this dataset
    const titlesSnapshot = await adminDb
      .collection('socialMediaDatasets')
      .doc(id)
      .collection('titles')
      .get();

    const batch = adminDb.batch();
    titlesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the dataset
    batch.delete(adminDb.collection('socialMediaDatasets').doc(id));

    await batch.commit();

    return NextResponse.json({
      success: true,
      id
    });
  } catch (error) {
    console.error('Delete dataset error:', error);
    return NextResponse.json(
      { error: 'Failed to delete dataset', details: error.message },
      { status: 500 }
    );
  }
}
