import { NextResponse } from 'next/server';
import { adminFirestore } from '../../../../lib/firebase-admin';
import { withAuth } from '../../../../lib/services/api-auth-middleware';

// GET - Tüm companies'i getir
export const GET = withAuth(async (request) => {
  try {
    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }

    const querySnapshot = await adminFirestore
      .collection('companies')
      .orderBy('createdAt', 'desc')
      .get();

    const companies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch companies' }, 
      { status: 500 }
    );
  }
});