import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  syncRoleChanges,
  syncPermissionChanges,
  syncUsersWithRole,
} from "./sync-service";

/**
 * Admin permissions yönetim servisleri - Tamamen Dinamik Versiyon
 */

// Güvenli timestamp dönüştürme fonksiyonu
const safeToDate = (timestamp) => {
  if (!timestamp) return null;
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === "string") {
    return new Date(timestamp);
  }
  if (typeof timestamp === "number") {
    return new Date(timestamp);
  }
  return null;
};

// Rol seviyesi (yetki kontrolü için)
export const ROLE_LEVELS = {
  super_admin: 4,
  admin: 3,
  moderator: 2,
  user: 1,
};

/**
 * Firestore'dan tüm permissions'ları getir - Tamamen dinamik
 */
export const getAllPermissions = async () => {
  try {
    // Fetching all permissions from Firestore

    const permissionsQuery = query(
      collection(db, "permissions"),
      orderBy("category"),
      orderBy("name")
    );
    const permissionsSnapshot = await getDocs(permissionsQuery);

    let permissions = {};

    if (!permissionsSnapshot.empty) {
      permissionsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const key = data.key || data.id || doc.id;

        permissions[key] = {
          name: data.name,
          description: data.description,
          category: data.category,
          categoryLabel: data.categoryLabel || data.category,
          icon: data.icon || "Key",
          color: data.color || "text-gray-600 bg-gray-50",
          isCustom: data.isCustom !== false,
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
        };
      });

      // Successfully loaded permissions
    } else {
      // No permissions found in Firestore
    }

    return {
      success: true,
      data: permissions,
      totalCount: Object.keys(permissions).length,
    };
  } catch (error) {
    console.error("❌ Permissions getirilirken hata:", error);
    return {
      success: false,
      error: error.message,
      data: {},
    };
  }
};

/**
 * Firestore'dan tüm rolleri getir - Tamamen dinamik
 */
export const getAllRoles = async () => {
  try {
    // Fetching all roles from Firestore

    const rolesQuery = query(collection(db, "roles"), orderBy("name"));
    const rolesSnapshot = await getDocs(rolesQuery);

    let roles = [];

    if (!rolesSnapshot.empty) {
      for (const roleDoc of rolesSnapshot.docs) {
        const data = roleDoc.data();

        // Kullanıcı sayısını hesapla
        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", roleDoc.id)
        );
        const usersSnapshot = await getDocs(usersQuery);

        roles.push({
          id: roleDoc.id,
          name: data.name,
          description: data.description,
          permissions: data.permissions || [],
          allowedRoutes: data.allowedRoutes || [],
          isSystemRole: data.isSystemRole || false,
          color: data.color || "blue",
          userCount: usersSnapshot.size,
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
        });
      }

      // Successfully loaded roles
    } else {
      // No roles found in Firestore
    }

    return {
      success: true,
      data: roles,
    };
  } catch (error) {
    console.error("❌ Roller getirilirken hata:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Firestore'dan kategorileri dinamik olarak getir
 */
export const getDynamicCategories = async () => {
  try {
    // Fetching categories from Firestore

    const permissionsRef = collection(db, "permissions");
    const permissionsSnapshot = await getDocs(permissionsRef);

    const categoriesMap = new Map();

    permissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category && data.category.trim()) {
        const category = data.category.trim();
        if (!categoriesMap.has(category)) {
          categoriesMap.set(category, {
            value: category,
            label:
              data.categoryLabel ||
              category.charAt(0).toUpperCase() +
                category.slice(1).replace(/_/g, " "),
            icon: data.icon || "Key",
            color: data.color || "text-gray-600 bg-gray-50",
          });
        }
      }
    });

    const categoriesArray = Array.from(categoriesMap.keys()).sort();
    const categoriesWithMetadata = Array.from(categoriesMap.values()).sort(
      (a, b) => a.value.localeCompare(b.value)
    );

    // Successfully loaded categories

    return {
      success: true,
      data: categoriesWithMetadata,
      categories: categoriesArray,
    };
  } catch (error) {
    console.error("❌ Kategoriler getirilemedi:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      categories: [],
    };
  }
};

/**
 * Yeni permission oluştur
 */
export const createPermission = async (permissionData) => {
  try {
    // Creating new permission

    // Permission key'i document ID olarak kullan (daha temiz ve anlamlı)
    const permissionKey = permissionData.key;

    const docData = {
      key: permissionKey,
      name: permissionData.name,
      description: permissionData.description,
      category: permissionData.category,
      categoryLabel: permissionData.categoryLabel || permissionData.category,
      icon: permissionData.icon || "Key",
      color: permissionData.color || "text-gray-600 bg-gray-50",
      isCustom: permissionData.isCustom !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // setDoc kullanarak permission key'ini document ID yap
    const docRef = doc(db, "permissions", permissionKey);
    await setDoc(docRef, docData);

    // Permission created successfully

    // Sync işlemi
    await syncPermissionChanges(permissionKey, "created");

    return {
      success: true,
      message: `Permission "${permissionData.name}" başarıyla oluşturuldu`,
      permissionKey: permissionKey, // Bu önemli - handleAddPermission için gerekli
      data: { id: permissionKey, ...docData },
    };
  } catch (error) {
    console.error("❌ Permission oluşturma hatası:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Permission sil
 */
export const deletePermission = async (permissionKey) => {
  try {
    // Deleting permission

    // Permission'ı bul
    const permissionsQuery = query(
      collection(db, "permissions"),
      where("key", "==", permissionKey)
    );
    const snapshot = await getDocs(permissionsQuery);

    if (snapshot.empty) {
      throw new Error("Permission bulunamadı");
    }

    const permissionDoc = snapshot.docs[0];
    await deleteDoc(permissionDoc.ref);

    // Sync işlemi
    await syncPermissionChanges(permissionKey, "deleted");

    // Permission deleted successfully

    return {
      success: true,
      message: `Permission "${permissionKey}" başarıyla silindi`,
    };
  } catch (error) {
    console.error("❌ Permission silme hatası:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Rol permissions'larını güncelle
 */
export const updateRolePermissions = async (roleId, permissions) => {
  try {
    // Updating role permissions

    // Validation - permissions undefined olmamalı
    if (!roleId) {
      throw new Error("Role ID gereklidir");
    }

    if (permissions === undefined || permissions === null) {
      // Permissions undefined/null, using empty array
      permissions = [];
    }

    if (!Array.isArray(permissions)) {
      // Permissions not array, converting to array
      permissions = permissions ? [permissions] : [];
    }

    // Updating permissions

    const roleRef = doc(db, "roles", roleId);
    await updateDoc(roleRef, {
      permissions: permissions,
      updatedAt: new Date(),
    });

    // Sync işlemi
    await syncRoleChanges(roleId, "updated");

    // Role permissions updated successfully

    return {
      success: true,
      message: "Rol yetkileri başarıyla güncellendi",
    };
  } catch (error) {
    console.error("❌ Rol permissions güncelleme hatası:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Rol allowedRoutes'larını güncelle
 */
export const updateRoleAllowedRoutes = async (roleId, allowedRoutes) => {
  try {
    // Validation
    if (!roleId) {
      throw new Error("Role ID gereklidir");
    }

    if (allowedRoutes === undefined || allowedRoutes === null) {
      allowedRoutes = [];
    }

    if (!Array.isArray(allowedRoutes)) {
      allowedRoutes = allowedRoutes ? [allowedRoutes] : [];
    }

    const roleRef = doc(db, "roles", roleId);
    await updateDoc(roleRef, {
      allowedRoutes: allowedRoutes,
      updatedAt: new Date(),
    });

    // Sync işlemi
    await syncRoleChanges(roleId, "updated");

    return {
      success: true,
      message: "Rol erişim rotaları başarıyla güncellendi",
    };
  } catch (error) {
    console.error("❌ Rol allowedRoutes güncelleme hatası:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Mevcut permission'lara categoryLabel ve icon ekle (tek seferlik)
 */
export const updatePermissionMetadata = async () => {
  try {
    const categoryMetadata = {
      users: {
        categoryLabel: "Kullanıcı Yönetimi",
        icon: "Users",
        color: "text-blue-600 bg-blue-50",
      },
      contacts: {
        categoryLabel: "İletişim Yönetimi",
        icon: "MessageSquare",
        color: "text-green-600 bg-green-50",
      },
      requests: {
        categoryLabel: "Müşteri Talepleri",
        icon: "MessageSquareText",
        color: "text-cyan-600 bg-cyan-50",
      },
      quotes: {
        categoryLabel: "Teklif Yönetimi",
        icon: "FileText",
        color: "text-purple-600 bg-purple-50",
      },
      companies: {
        categoryLabel: "Şirket Yönetimi",
        icon: "Building",
        color: "text-orange-600 bg-orange-50",
      },
      content: {
        categoryLabel: "İçerik Yönetimi",
        icon: "FileText",
        color: "text-teal-600 bg-teal-50",
      },
      analytics: {
        categoryLabel: "Analitik Yönetimi",
        icon: "BarChart",
        color: "text-pink-600 bg-pink-50",
      },
      system: {
        categoryLabel: "Sistem Yönetimi",
        icon: "Settings",
        color: "text-red-600 bg-red-50",
      },
      blog: {
        categoryLabel: "Blog Yönetimi",
        icon: "Edit",
        color: "text-indigo-600 bg-indigo-50",
      },
      packaging: {
        categoryLabel: "Ambalaj Yönetimi",
        icon: "Package",
        color: "text-yellow-600 bg-yellow-50",
      },
    };

    // Tüm permission'ları getir
    const permissionsQuery = query(collection(db, "permissions"));
    const permissionsSnapshot = await getDocs(permissionsQuery);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const permissionDoc of permissionsSnapshot.docs) {
      const data = permissionDoc.data();
      const category = data.category;

      // Eğer zaten categoryLabel ve icon varsa atla
      if (data.categoryLabel && data.icon) {
        console.log(`⏭️ ${data.key || permissionDoc.id} zaten güncel`);
        skippedCount++;
        continue;
      }

      // Kategori metadata'sını bul
      const metadata = categoryMetadata[category];
      if (!metadata) {
        console.log(
          `⚠️ ${
            data.key || permissionDoc.id
          } için kategori metadata bulunamadı: ${category}`
        );
        skippedCount++;
        continue;
      }

      // Permission'ı güncelle
      const updateData = {
        updatedAt: new Date(),
      };

      // Sadece eksik olanları ekle
      if (!data.categoryLabel) {
        updateData.categoryLabel = metadata.categoryLabel;
      }
      if (!data.icon) {
        updateData.icon = metadata.icon;
      }
      if (!data.color) {
        updateData.color = metadata.color;
      }

      await updateDoc(permissionDoc.ref, updateData);

      console.log(`✅ ${data.key || permissionDoc.id} güncellendi`);
      updatedCount++;
    }

    console.log(
      `🎉 ${updatedCount} permission güncellendi, ${skippedCount} atlandı`
    );

    return {
      success: true,
      message: `${updatedCount} permission metadata'sı başarıyla güncellendi`,
      updatedCount,
      skippedCount,
    };
  } catch (error) {
    console.error("❌ Permission metadata güncelleme hatası:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Kategori listeleme (debug için - production'da kaldırılacak)
 */
export const listPermissionCategories = async () => {
  try {
    // Fetching permission categories from Firestore

    const permissionsRef = collection(db, "permissions");
    const permissionsSnapshot = await getDocs(permissionsRef);

    const categories = new Set();
    const permissionsByCategory = {};

    // Processing permissions

    permissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      const category = data.category || "uncategorized";

      categories.add(category);

      if (!permissionsByCategory[category]) {
        permissionsByCategory[category] = [];
      }

      permissionsByCategory[category].push({
        id: doc.id,
        key: data.key,
        name: data.name,
        description: data.description,
        isCustom: data.isCustom !== false,
      });

      // Processing permission details
    });

    // Processing category summary

    Array.from(categories)
      .sort()
      .forEach((category) => {
        const categoryPermissions = permissionsByCategory[category];

        // Processing category permissions
        categoryPermissions.forEach((perm) => {
          const icon = perm.isCustom ? "🔧" : "⚙️";
          // Permission processed
        });
      });

    // Summary completed

    return {
      success: true,
      data: {
        categories: Array.from(categories),
        permissionsByCategory,
        totalCategories: categories.size,
        totalPermissions: permissionsSnapshot.size,
      },
    };
  } catch (error) {
    console.error("❌ Hata:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Backward compatibility
export const getAvailableCategories = getDynamicCategories;
export const createPermissionWithCategory = createPermission;
