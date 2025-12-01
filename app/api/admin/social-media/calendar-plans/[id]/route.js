import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const doc = await adminDb
      .collection('social-media-calendar-plans')
      .doc(id)
      .get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: { id: doc.id, ...doc.data() }
    });

  } catch (error) {
    console.error('Get plan error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    await adminDb
      .collection('social-media-calendar-plans')
      .doc(id)
      .update(updateData);

    return NextResponse.json({
      success: true,
      id: id,
      plan: updateData
    });

  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json(
      { error: 'Failed to update plan', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Get the calendar plan to access its events
    const calendarDoc = await adminDb
      .collection('social-media-calendar-plans')
      .doc(id)
      .get();

    if (calendarDoc.exists) {
      const calendarData = calendarDoc.data();
      const events = calendarData.events || [];

      // Update each content's usedInCalendars array
      const updatePromises = events.map(async (event) => {
        if (event.id) {
          try {
            const contentRef = adminDb
              .collection('social-media-generated-content')
              .doc(event.id);
            
            const contentDoc = await contentRef.get();
            
            if (contentDoc.exists) {
              // Clear the usedInCalendars field completely
              await contentRef.update({
                usedInCalendars: [],
                updatedAt: new Date().toISOString()
              });
            }
          } catch (contentError) {
            console.error(`Error updating content ${event.id}:`, contentError);
            // Continue with other updates even if one fails
          }
        }
      });

      // Wait for all content updates to complete
      await Promise.all(updatePromises);
    }

    // Delete the calendar plan
    await adminDb
      .collection('social-media-calendar-plans')
      .doc(id)
      .delete();

    return NextResponse.json({
      success: true,
      id: id
    });

  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan', details: error.message },
      { status: 500 }
    );
  }
}
