import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const snapshot = await adminDb
      .collection('social-media-calendar-plans')
      .orderBy('createdAt', 'desc')
      .get();
    
    const plans = [];
    snapshot.forEach(doc => {
      plans.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({
      success: true,
      plans: plans,
      count: plans.length
    });

  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const planData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('social-media-calendar-plans').add(planData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      plan: planData
    });

  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json(
      { error: 'Failed to create plan', details: error.message },
      { status: 500 }
    );
  }
}
