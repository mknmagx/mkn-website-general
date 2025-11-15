import { NextResponse } from "next/server";
import { withAuth } from "@/lib/services/api-auth-middleware";
import { adminFirestore } from "@/lib/firebase-admin";
import logger from "@/lib/utils/logger";

// POST - Belirli roldeki kullanıcıları senkronize et
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();
    const { roleId, newPermissions } = body;

    if (!roleId || !Array.isArray(newPermissions)) {
      return NextResponse.json(
        {
          error: "Role ID ve permissions array gerekli",
          success: false,
        },
        { status: 400 }
      );
    }

    const batch = adminFirestore.batch();

    const usersQuery = adminFirestore
      .collection("users")
      .where("role", "==", roleId);
    const usersSnapshot = await usersQuery.get();

    let updatedUsers = 0;

    usersSnapshot.forEach((userDoc) => {
      const userRef = adminFirestore.collection("users").doc(userDoc.id);
      batch.update(userRef, {
        permissions: newPermissions,
        updatedAt: new Date(),
      });
      updatedUsers++;
    });

    if (updatedUsers > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      updatedUsers: updatedUsers,
      message: `${updatedUsers} kullanıcı başarıyla senkronize edildi`,
    });
  } catch (error) {
    logger.error("User role sync error:", error.message);
    return NextResponse.json(
      {
        error: "Kullanıcı senkronizasyonu başarısız",
        details: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
});
