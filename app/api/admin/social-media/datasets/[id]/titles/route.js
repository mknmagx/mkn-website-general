import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET - Get all titles in a dataset
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const titlesSnapshot = await adminDb
      .collection('socialMediaDatasets')
      .doc(id)
      .collection('titles')
      .orderBy('createdAt', 'desc')
      .get();

    const titles = [];
    titlesSnapshot.forEach(doc => {
      titles.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      titles
    });
  } catch (error) {
    console.error('Get titles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch titles', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add titles to dataset
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { titles } = await request.json();

    if (!titles || !Array.isArray(titles)) {
      return NextResponse.json(
        { error: 'Invalid titles data' },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();
    const addedTitles = [];

    for (const title of titles) {
      const titleData = {
        ...title,
        datasetId: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = adminDb
        .collection('socialMediaDatasets')
        .doc(id)
        .collection('titles')
        .doc();

      batch.set(docRef, titleData);
      addedTitles.push({
        id: docRef.id,
        ...titleData
      });
    }

    // Update dataset titleCount
    const datasetRef = adminDb.collection('socialMediaDatasets').doc(id);
    const datasetDoc = await datasetRef.get();
    const currentCount = datasetDoc.data()?.titleCount || 0;
    
    batch.update(datasetRef, {
      titleCount: currentCount + titles.length,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      titles: addedTitles
    });
  } catch (error) {
    console.error('Add titles error:', error);
    return NextResponse.json(
      { error: 'Failed to add titles', details: error.message },
      { status: 500 }
    );
  }
}
