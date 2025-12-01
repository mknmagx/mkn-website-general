import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET - List all datasets
export async function GET() {
  try {
    const datasetsSnapshot = await adminDb
      .collection('socialMediaDatasets')
      .orderBy('createdAt', 'desc')
      .get();

    const datasets = [];
    datasetsSnapshot.forEach(doc => {
      datasets.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      datasets
    });
  } catch (error) {
    console.error('Get datasets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new dataset
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, platforms, categories, status = 'active', platformCounts, categoryCounts } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Dataset adı gereklidir' },
        { status: 400 }
      );
    }

    const datasetData = {
      name: name.trim(),
      description: description?.trim() || '',
      platforms: platforms || [],
      categories: categories || [],
      titleCount: 0,
      platformCounts: platformCounts || {},
      categoryCounts: categoryCounts || {},
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('socialMediaDatasets').add(datasetData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      dataset: {
        id: docRef.id,
        ...datasetData
      }
    });
  } catch (error) {
    console.error('Create dataset error:', error);
    return NextResponse.json(
      { error: 'Failed to create dataset', details: error.message },
      { status: 500 }
    );
  }
}
