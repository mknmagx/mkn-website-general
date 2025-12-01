import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const doc = await adminDb.collection('social-media-titles').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Title not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      title: { id: doc.id, ...doc.data() }
    });

  } catch (error) {
    console.error('Get title error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch title', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    await adminDb.collection('social-media-titles').doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Title updated successfully'
    });

  } catch (error) {
    console.error('Update title error:', error);
    return NextResponse.json(
      { error: 'Failed to update title', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await adminDb.collection('social-media-titles').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Title deleted successfully'
    });

  } catch (error) {
    console.error('Delete title error:', error);
    return NextResponse.json(
      { error: 'Failed to delete title', details: error.message },
      { status: 500 }
    );
  }
}
