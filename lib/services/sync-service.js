/**
 * Sync Service - Permission, Role ve User koleksiyonları arasında senkronizasyon
 * Bu serv      // Silinen rol varsa, kullanıcıları default user rolüne geçir
      const usersQuery = query(collection(db, "users"), where("role", "==", roleId));
      const usersSnapshot = await getDocs(usersQuery);
      
      // Default user rolünün permissions'larını al
      const defaultRoleRef = doc(db, "roles", "user");
      const defaultRoleSnap = await getDoc(defaultRoleRef);
      const defaultPermissions = defaultRoleSnap.exists() ? defaultRoleSnap.data().permissions || [] : [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userRef = doc(db, "users", userDoc.id);
        batch.update(userRef, {
          role: "user",
          permissions: defaultPermissions,
          updatedAt: serverTimestamp()
        });
        updatedUsers++;
      }klikleri otomatik olarak ilgili koleksiyonlara yansıtır
 */

import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { getRolePermissions } from "./admin-auth-service";

/**
 * Permission değiştiğinde etkilenen tüm rolleri ve kullanıcıları günceller
 */
export const syncPermissionChanges = async (
  permissionId,
  action,
  permissionData = null
) => {
  try {
    // Permission sync started

    const batch = writeBatch(db);
    const updatedRoles = [];
    const updatedUsers = [];

    // 1. Tüm rolleri kontrol et - bu permission'ı kullanan rolleri bul
    const rolesQuery = collection(db, "roles");
    const rolesSnapshot = await getDocs(rolesQuery);

    for (const roleDoc of rolesSnapshot.docs) {
      const roleData = roleDoc.data();
      const roleId = roleDoc.id;
      let shouldUpdate = false;
      let newPermissions = [...(roleData.permissions || [])];

      if (action === "delete") {
        // Permission siliniyorsa, rollerden kaldır
        if (newPermissions.includes(permissionId)) {
          newPermissions = newPermissions.filter((p) => p !== permissionId);
          shouldUpdate = true;
        }
      } else if (action === "create" || action === "update") {
        // Permission oluşturuluyor/güncelleniyor
        // Rol tipine göre otomatik ekleme mantığı (opsiyonel)
        if (permissionData && permissionData.autoAssignToRoles) {
          if (permissionData.autoAssignToRoles.includes(roleData.name)) {
            if (!newPermissions.includes(permissionId)) {
              newPermissions.push(permissionId);
              shouldUpdate = true;
            }
          }
        }
      }

      if (shouldUpdate) {
        const roleRef = doc(db, "roles", roleId);
        batch.update(roleRef, {
          permissions: newPermissions,
          updatedAt: serverTimestamp(),
        });
        updatedRoles.push(roleId);

        // Bu roldeki tüm kullanıcıları güncelle
        await syncUsersWithRole(roleId, newPermissions, batch);
      }
    }

    await batch.commit();

    // Permission sync completed successfully

    return {
      success: true,
      updatedRoles: updatedRoles.length,
      message: "Permission değişiklikleri başarıyla senkronize edildi",
    };
  } catch (error) {
    console.error("[SYNC] Permission sync error:", error);
    throw error;
  }
};

/**
 * Role değiştiğinde o roldeki tüm kullanıcıların permission array'lerini günceller
 */
export const syncRoleChanges = async (
  roleId,
  action,
  newPermissions = null
) => {
  try {
    // Role sync started

    const batch = writeBatch(db);
    let updatedUsers = 0;

    if (action === "delete") {
      // Role siliniyorsa, o roldeki kullanıcıları "user" rolüne çevir
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", roleId)
      );
      const usersSnapshot = await getDocs(usersQuery);

      // User rolünün permissions'larını Firestore'dan al
      const userPermissions = await getRolePermissions("user");

      for (const userDoc of usersSnapshot.docs) {
        const userRef = doc(db, "users", userDoc.id);
        batch.update(userRef, {
          role: "user",
          permissions: userPermissions,
          updatedAt: serverTimestamp(),
        });
        updatedUsers++;
      }
    } else if (action === "update" && newPermissions) {
      // Role'ün permission'ları değişmişse, o roldeki tüm kullanıcıları güncelle
      await syncUsersWithRole(roleId, newPermissions, batch);
    }

    if (batch._mutations && batch._mutations.length > 0) {
      await batch.commit();
    }

    // Role sync completed successfully

    return {
      success: true,
      updatedUsers,
      message: "Role değişiklikleri başarıyla senkronize edildi",
    };
  } catch (error) {
    console.error("[SYNC] Role sync error:", error);
    throw error;
  }
};

/**
 * Belirli bir roldeki tüm kullanıcıların permission array'lerini günceller
 */
export const syncUsersWithRole = async (
  roleId,
  newPermissions,
  batch = null
) => {
  try {
    const shouldCommit = !batch;
    if (!batch) {
      batch = writeBatch(db);
    }

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

    if (shouldCommit && batch._mutations && batch._mutations.length > 0) {
      await batch.commit();
    }

    // Successfully synced users with role
    return {
      success: true,
      updatedUsers: updatedUsers,
      message: `${updatedUsers} kullanıcı başarıyla senkronize edildi`,
    };
  } catch (error) {
    console.error("[SYNC] Users with role sync error:", error);
    return {
      success: false,
      updatedUsers: 0,
      error: error.message,
    };
  }
};

/**
 * User'ın rolü değiştiğinde permission array'ini otomatik günceller
 */
export const syncUserRoleChange = async (userId, newRole, oldRole = null) => {
  try {
    // User role change sync started

    // Yeni rolün permission'larını Firestore'dan al
    const roleRef = doc(db, "roles", newRole);
    const roleSnap = await getDoc(roleRef);
    const newPermissions = roleSnap.exists()
      ? roleSnap.data().permissions || []
      : [];

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      permissions: newPermissions,
      updatedAt: serverTimestamp(),
    });

    // User role change completed successfully

    return {
      success: true,
      newPermissions,
      message: "Kullanıcı rol değişikliği başarıyla senkronize edildi",
    };
  } catch (error) {
    console.error("[SYNC] User role change sync error:", error);
    throw error;
  }
};

/**
 * Tüm sistem genelinde permission tutarlılığını kontrol eder ve düzeltir
 */
export const validateAndFixPermissionConsistency = async () => {
  try {
    // Starting system-wide permission consistency check

    const batch = writeBatch(db);
    let fixedUsers = 0;
    let fixedRoles = 0;

    // 1. Tüm kullanıcıları kontrol et
    const usersSnapshot = await getDocs(collection(db, "users"));

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userRole = userData.role;
      const currentPermissions = userData.permissions || [];

      // Rolün beklenen permissions'larını Firestore'dan al
      const roleRef = doc(db, "roles", userRole);
      const roleSnap = await getDoc(roleRef);
      const expectedPermissions = roleSnap.exists()
        ? roleSnap.data().permissions || []
        : [];

      // Permission array'leri karşılaştır
      if (!arraysEqual(currentPermissions, expectedPermissions)) {
        const userRef = doc(db, "users", userDoc.id);
        batch.update(userRef, {
          permissions: expectedPermissions,
          updatedAt: serverTimestamp(),
        });
        fixedUsers++;
      }
    }

    // 2. Tüm rolleri kontrol et (gelecekte custom role support için)
    const rolesSnapshot = await getDocs(collection(db, "roles"));

    for (const roleDoc of rolesSnapshot.docs) {
      const roleData = roleDoc.data();
      const rolePermissions = roleData.permissions || [];

      // Permission existence kontrolü
      const validPermissions = [];
      for (const permission of rolePermissions) {
        const permissionDoc = await getDoc(doc(db, "permissions", permission));
        if (permissionDoc.exists()) {
          validPermissions.push(permission);
        }
      }

      if (validPermissions.length !== rolePermissions.length) {
        const roleRef = doc(db, "roles", roleDoc.id);
        batch.update(roleRef, {
          permissions: validPermissions,
          updatedAt: serverTimestamp(),
        });
        fixedRoles++;
      }
    }

    if (batch._mutations && batch._mutations.length > 0) {
      await batch.commit();
    }

    console.log(
      `[SYNC] Consistency check completed. Fixed users: ${fixedUsers}, Fixed roles: ${fixedRoles}`
    );

    return {
      success: true,
      fixedUsers,
      fixedRoles,
      message: "Sistem tutarlılığı kontrolü tamamlandı",
    };
  } catch (error) {
    console.error("[SYNC] Consistency check error:", error);
    throw error;
  }
};

/**
 * İki array'in eşit olup olmadığını kontrol eder
 */
const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, index) => val === sorted2[index]);
};

/**
 * Bulk operations için optimize edilmiş senkronizasyon
 */
export const syncBulkChanges = async (changes) => {
  try {
    console.log("[SYNC] Starting bulk sync operation...");

    const batch = writeBatch(db);
    let totalUpdates = 0;

    for (const change of changes) {
      const { type, id, action, data } = change;

      switch (type) {
        case "permission":
          await syncPermissionChanges(id, action, data);
          break;
        case "role":
          await syncRoleChanges(id, action, data);
          break;
        case "user":
          if (data && data.newRole) {
            await syncUserRoleChange(id, data.newRole, data.oldRole);
          }
          break;
      }
      totalUpdates++;
    }

    console.log(
      `[SYNC] Bulk sync completed. Processed ${totalUpdates} changes`
    );

    return {
      success: true,
      processedChanges: totalUpdates,
      message: "Toplu değişiklikler başarıyla senkronize edildi",
    };
  } catch (error) {
    console.error("[SYNC] Bulk sync error:", error);
    throw error;
  }
};
