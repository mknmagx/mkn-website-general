import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/api-auth-middleware';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from '@/lib/firebase';
import logger from '@/lib/utils/logger';

// POST - Belirli roldeki kullanıcıları senkronize et
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { roleId, newPermissions } = body;

    if (!roleId || !Array.isArray(newPermissions)) {
      return NextResponse.json(
        { 
          error: 'Role ID ve permissions array gerekli',
          success: false 
        }, 
        { status: 400 }
      );
    }

    const batch = writeBatch(db);
    
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", roleId)
    );
    const usersSnapshot = await getDocs(usersQuery);

    let updatedUsers = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userRef = doc(db, "users", userDoc.id);
      batch.update(userRef, {
        permissions: newPermissions,
        updatedAt: serverTimestamp(),
      });
      updatedUsers++;
    }

    if (batch._mutations && batch._mutations.length > 0) {
      await batch.commit();
    }

    logger.info(`Successfully synced ${updatedUsers} users with role ${roleId}`);

    return NextResponse.json({ 
      success: true,
      updatedUsers: updatedUsers,
      message: `${updatedUsers} kullanıcı başarıyla senkronize edildi`,
    });

  } catch (error) {
    logger.error('User role sync error:', error.message);
    return NextResponse.json(
      { 
        error: 'Kullanıcı senkronizasyonu başarısız',
        details: error.message,
        success: false 
      }, 
      { status: 500 }
    );
  }
});