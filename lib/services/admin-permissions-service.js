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

/**
 * Admin permissions yönetim servisleri
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

// Permission kategorileri
export const PERMISSION_CATEGORIES = {
  USERS: "users",
  CONTACTS: "contacts",
  QUOTES: "quotes",
  COMPANIES: "companies",
  CONTENT: "content",
  ANALYTICS: "analytics",
  SYSTEM: "system",
};

// Detaylı yetki sistemi (iconlar component'te tanımlanacak)
export const DETAILED_PERMISSIONS = {
  // Kullanıcı Yönetimi
  "users.view": {
    name: "Kullanıcıları Görüntüle",
    description: "Kullanıcı listesini ve bilgilerini görüntüleme",
    category: PERMISSION_CATEGORIES.USERS,
  },
  "users.create": {
    name: "Kullanıcı Oluştur",
    description: "Yeni kullanıcı hesabı oluşturma",
    category: PERMISSION_CATEGORIES.USERS,
  },
  "users.edit": {
    name: "Kullanıcı Düzenle",
    description: "Kullanıcı bilgilerini güncelleme",
    category: PERMISSION_CATEGORIES.USERS,
  },
  "users.delete": {
    name: "Kullanıcı Sil",
    description: "Kullanıcı hesaplarını silme",
    category: PERMISSION_CATEGORIES.USERS,
  },
  "users.manage_roles": {
    name: "Rol Yönetimi",
    description: "Kullanıcı rollerini değiştirme",
    category: PERMISSION_CATEGORIES.USERS,
  },
  "users.manage_permissions": {
    name: "Yetki Yönetimi",
    description: "Kullanıcı yetkilerini yönetme",
    category: PERMISSION_CATEGORIES.USERS,
  },

  // İletişim Yönetimi
  "contacts.view": {
    name: "Mesajları Görüntüle",
    description: "İletişim mesajlarını görüntüleme",
    category: PERMISSION_CATEGORIES.CONTACTS,
  },
  "contacts.update": {
    name: "Mesaj Durumu Güncelle",
    description: "Mesaj durumunu değiştirme",
    category: PERMISSION_CATEGORIES.CONTACTS,
  },
  "contacts.delete": {
    name: "Mesaj Sil",
    description: "İletişim mesajlarını silme",
    category: PERMISSION_CATEGORIES.CONTACTS,
  },
  "contacts.respond": {
    name: "Mesaj Yanıtla",
    description: "İletişim mesajlarını yanıtlama",
    category: PERMISSION_CATEGORIES.CONTACTS,
  },

  // Teklif Yönetimi
  "quotes.view": {
    name: "Teklifleri Görüntüle",
    description: "Teklif taleplerini görüntüleme",
    category: PERMISSION_CATEGORIES.QUOTES,
  },
  "quotes.create": {
    name: "Teklif Oluştur",
    description: "Yeni teklif oluşturma",
    category: PERMISSION_CATEGORIES.QUOTES,
  },
  "quotes.edit": {
    name: "Teklif Düzenle",
    description: "Mevcut teklifleri düzenleme",
    category: PERMISSION_CATEGORIES.QUOTES,
  },
  "quotes.delete": {
    name: "Teklif Sil",
    description: "Teklifleri silme",
    category: PERMISSION_CATEGORIES.QUOTES,
  },

  // Şirket Yönetimi
  "companies.view": {
    name: "Şirketleri Görüntüle",
    description: "Şirket bilgilerini görüntüleme",
    category: PERMISSION_CATEGORIES.COMPANIES,
  },
  "companies.create": {
    name: "Şirket Oluştur",
    description: "Yeni şirket kaydı oluşturma",
    category: PERMISSION_CATEGORIES.COMPANIES,
  },
  "companies.edit": {
    name: "Şirket Düzenle",
    description: "Şirket bilgilerini güncelleme",
    category: PERMISSION_CATEGORIES.COMPANIES,
  },
  "companies.delete": {
    name: "Şirket Sil",
    description: "Şirket kayıtlarını silme",
    category: PERMISSION_CATEGORIES.COMPANIES,
  },

  // İçerik Yönetimi
  "content.view": {
    name: "İçerikleri Görüntüle",
    description: "Site içeriklerini görüntüleme",
    category: PERMISSION_CATEGORIES.CONTENT,
  },
  "content.create": {
    name: "İçerik Oluştur",
    description: "Yeni içerik oluşturma",
    category: PERMISSION_CATEGORIES.CONTENT,
  },
  "content.edit": {
    name: "İçerik Düzenle",
    description: "Mevcut içerikleri düzenleme",
    category: PERMISSION_CATEGORIES.CONTENT,
  },
  "content.delete": {
    name: "İçerik Sil",
    description: "İçerikleri silme",
    category: PERMISSION_CATEGORIES.CONTENT,
  },
  "content.publish": {
    name: "İçerik Yayınla",
    description: "İçerikleri yayınlama/yayından kaldırma",
    category: PERMISSION_CATEGORIES.CONTENT,
  },

  // Analitik & Raporlama
  "analytics.view": {
    name: "Analitik Görüntüle",
    description: "Site analitiği ve raporları görüntüleme",
    category: PERMISSION_CATEGORIES.ANALYTICS,
  },
  "analytics.export": {
    name: "Rapor Dışa Aktar",
    description: "Analitik raporları dışa aktarma",
    category: PERMISSION_CATEGORIES.ANALYTICS,
  },

  // Sistem Yönetimi
  "system.settings": {
    name: "Sistem Ayarları",
    description: "Sistem ayarlarını değiştirme",
    category: PERMISSION_CATEGORIES.SYSTEM,
  },
  "system.backup": {
    name: "Sistem Yedeği",
    description: "Sistem yedeği alma ve geri yükleme",
    category: PERMISSION_CATEGORIES.SYSTEM,
  },
  "system.logs": {
    name: "Sistem Logları",
    description: "Sistem loglarını görüntüleme",
    category: PERMISSION_CATEGORIES.SYSTEM,
  },
};

// Rol bazında varsayılan yetkiler
export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: Object.keys(DETAILED_PERMISSIONS), // Tüm yetkiler
  admin: [
    // Kullanıcı yönetimi (kendi seviyesinden düşük)
    "users.view",
    "users.create",
    "users.edit",
    "users.manage_roles",
    // İletişim yönetimi
    "contacts.view",
    "contacts.update",
    "contacts.delete",
    "contacts.respond",
    // Teklif yönetimi
    "quotes.view",
    "quotes.create",
    "quotes.edit",
    "quotes.delete",
    // Şirket yönetimi
    "companies.view",
    "companies.create",
    "companies.edit",
    "companies.delete",
    // İçerik yönetimi
    "content.view",
    "content.create",
    "content.edit",
    "content.delete",
    "content.publish",
    // Analitik
    "analytics.view",
    "analytics.export",
  ],
  moderator: [
    // Sadece görüntüleme ve temel işlemler
    "users.view",
    "contacts.view",
    "contacts.update",
    "contacts.respond",
    "quotes.view",
    "quotes.edit",
    "companies.view",
    "content.view",
    "content.edit",
  ],
  user: [
    // Minimum yetkiler
    "contacts.view",
    "quotes.view",
    "content.view",
  ],
};

/**
 * Tüm rolleri ve yetkilerini getirir
 * @returns {Promise<Array>} Roller listesi
 */
export const getAllRoles = async () => {
  try {
    const rolesQuery = query(collection(db, "roles"), orderBy("name"));
    const rolesSnapshot = await getDocs(rolesQuery);

    let roles = [];

    if (rolesSnapshot.empty) {
      roles = await initializeDefaultRoles();
    } else {
      roles = rolesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id || doc.id,
          documentId: doc.id,
          ...data,
        };
      });
    }

    // Her rol için kullanıcı sayısını hesapla
    const rolesWithUserCount = await Promise.all(
      roles.map(async (role) => {
        // Kullanıcıları hem data.id hem de document ID ile arayalım
        const usersQuery1 = query(
          collection(db, "users"),
          where("role", "==", role.id)
        );
        const usersQuery2 = query(
          collection(db, "users"),
          where("role", "==", role.documentId)
        );

        const [usersSnapshot1, usersSnapshot2] = await Promise.all([
          getDocs(usersQuery1),
          getDocs(usersQuery2),
        ]);

        const userCount = Math.max(usersSnapshot1.size, usersSnapshot2.size);

        return {
          ...role,
          userCount: userCount,
        };
      })
    );

    return {
      success: true,
      data: rolesWithUserCount,
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Varsayılan sistem rollerini oluşturur
 * @returns {Promise<Array>} Oluşturulan roller
 */
export const initializeDefaultRoles = async () => {
  try {
    const defaultRoles = [
      {
        id: "super_admin",
        name: "Süper Admin",
        description: "Tam sistem erişimi ve yönetim yetkisi",
        isSystemRole: true,
        color: "purple",
        permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "admin",
        name: "Admin",
        description: "Sistem yönetimi ve kullanıcı yönetimi",
        isSystemRole: true,
        color: "red",
        permissions: DEFAULT_ROLE_PERMISSIONS.admin,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "moderator",
        name: "Moderatör",
        description: "İçerik yönetimi ve müşteri iletişimi",
        isSystemRole: true,
        color: "yellow",
        permissions: DEFAULT_ROLE_PERMISSIONS.moderator,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user",
        name: "Kullanıcı",
        description: "Temel erişim yetkisi",
        isSystemRole: true,
        color: "gray",
        permissions: DEFAULT_ROLE_PERMISSIONS.user,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Rolleri Firestore'a kaydet
    const createdRoles = [];
    for (const role of defaultRoles) {
      const roleRef = doc(db, "roles", role.id);
      // setDoc kullanarak belirli ID'li döküman oluştur/güncelle
      await setDoc(roleRef, role, { merge: true });
      createdRoles.push(role);
    }

    return createdRoles;
  } catch (error) {
    console.error("Error initializing default roles:", error);
    throw error;
  }
};

/**
 * Belirli bir rolün yetkilerini günceller
 * @param {string} roleId - Rol ID'si
 * @param {Array} permissions - Yeni yetkiler listesi
 * @returns {Promise<Object>} Güncelleme sonucu
 */
export const updateRolePermissions = async (roleId, permissions) => {
  try {
    // Önce role ID ile arayalım
    let roleRef = doc(db, "roles", roleId);
    let roleDoc = await getDoc(roleRef);

    // Eğer bulunamadıysa, data.id field'ı ile arayalım
    if (!roleDoc.exists()) {
      const rolesQuery = query(
        collection(db, "roles"),
        where("id", "==", roleId)
      );
      const rolesSnapshot = await getDocs(rolesQuery);

      if (!rolesSnapshot.empty) {
        const foundDoc = rolesSnapshot.docs[0];
        roleRef = foundDoc.ref;
        roleDoc = foundDoc;
      }
    }

    if (!roleDoc.exists()) {
      throw new Error(`Rol bulunamadı: ${roleId}`);
    }

    const roleData = roleDoc.data();

    // Sistem rollerinin temel yetkilerini koruma
    if (roleData.isSystemRole) {
      const minPermissions = getMinimumPermissionsForRole(roleId);
      const finalPermissions = [
        ...new Set([...minPermissions, ...permissions]),
      ];

      await updateDoc(roleRef, {
        permissions: finalPermissions,
        updatedAt: new Date(),
      });
    } else {
      await updateDoc(roleRef, {
        permissions: permissions,
        updatedAt: new Date(),
      });
    }

    return {
      success: true,
      message: "Rol yetkileri güncellendi",
    };
  } catch (error) {
    console.error("Error updating role permissions:", error);
    return {
      success: false,
      error: error.message,
      message: "Yetkiler güncellenirken hata oluştu",
    };
  }
};

/**
 * Rol için minimum gerekli yetkileri döndürür
 * @param {string} roleId - Rol ID'si
 * @returns {Array} Minimum yetkiler
 */
export const getMinimumPermissionsForRole = (roleId) => {
  const minimumPermissions = {
    super_admin: [], // Süper admin için kısıtlama yok
    admin: ["users.view", "contacts.view"],
    moderator: ["contacts.view"],
    user: ["contacts.view"],
  };

  return minimumPermissions[roleId] || [];
};

/**
 * Kullanıcının yetkilerini kontrol eder
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} permission - Kontrol edilecek yetki
 * @returns {Promise<boolean>} Yetki durumu
 */
export const checkUserPermission = async (userId, permission) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const userRole = userData.role;

    // Kullanıcının kendi yetkileri varsa onları kontrol et
    if (userData.permissions && Array.isArray(userData.permissions)) {
      return userData.permissions.includes(permission);
    }

    // Yoksa rol bazında kontrol et
    const roleDoc = await getDoc(doc(db, "roles", userRole));

    if (!roleDoc.exists()) {
      return false;
    }

    const roleData = roleDoc.data();
    return roleData.permissions?.includes(permission) || false;
  } catch (error) {
    console.error("Error checking user permission:", error);
    return false;
  }
};

/**
 * Kullanıcının bireysel yetkilerini günceller
 * @param {string} userId - Kullanıcı ID'si
 * @param {Array} permissions - Yeni yetkiler
 * @returns {Promise<Object>} Güncelleme sonucu
 */
export const updateUserPermissions = async (userId, permissions) => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      permissions: permissions,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: "Kullanıcı yetkileri güncellendi",
    };
  } catch (error) {
    console.error("Error updating user permissions:", error);
    return {
      success: false,
      error: error.message,
      message: "Yetkiler güncellenirken hata oluştu",
    };
  }
};

/**
 * Yeni rol oluşturur
 * @param {Object} roleData - Rol bilgileri
 * @returns {Promise<Object>} Oluşturma sonucu
 */
export const createRole = async (roleData) => {
  try {
    const { name, description, color, permissions } = roleData;

    // Rol ID'sini oluştur (name'den)
    const roleId = name.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const roleRef = doc(db, "roles", roleId);

    // Rol zaten var mı kontrol et
    const existingRole = await getDoc(roleRef);
    if (existingRole.exists()) {
      return {
        success: false,
        error: "Bu isimde bir rol zaten mevcut",
      };
    }

    const newRole = {
      id: roleId,
      name,
      description,
      color: color || "blue",
      permissions: permissions || [],
      isSystemRole: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(roleRef, newRole);

    return {
      success: true,
      data: newRole,
      message: "Rol başarıyla oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating role:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Rol siler
 * @param {string} roleId - Silinecek rol ID'si
 * @returns {Promise<Object>} Silme sonucu
 */
export const deleteRole = async (roleId) => {
  try {
    const roleRef = doc(db, "roles", roleId);
    const roleDoc = await getDoc(roleRef);

    if (!roleDoc.exists()) {
      return {
        success: false,
        error: "Rol bulunamadı",
      };
    }

    const roleData = roleDoc.data();

    // Sistem rollerini silmeyi engelle
    if (roleData.isSystemRole) {
      return {
        success: false,
        error: "Sistem rolleri silinemez",
      };
    }

    // Bu role sahip kullanıcıları kontrol et
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", roleId)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (!usersSnapshot.empty) {
      return {
        success: false,
        error: `Bu role sahip ${usersSnapshot.size} kullanıcı bulunuyor. Önce kullanıcıları başka role atayın.`,
      };
    }

    await deleteDoc(roleRef);

    return {
      success: true,
      message: "Rol başarıyla silindi",
    };
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Yeni yetki oluşturur
 * @param {Object} permissionData - Yetki bilgileri
 * @returns {Promise<Object>} Oluşturma sonucu
 */
export const createPermission = async (permissionData) => {
  try {
    const { key, name, description, category } = permissionData;

    // Yetki zaten var mı kontrol et
    if (DETAILED_PERMISSIONS[key]) {
      return {
        success: false,
        error: "Bu anahtarla bir yetki zaten mevcut",
      };
    }

    const permissionRef = doc(db, "permissions", key);

    const newPermission = {
      key,
      name,
      description,
      category: category || "other",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(permissionRef, newPermission);

    return {
      success: true,
      data: newPermission,
      message: "Yetki başarıyla oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating permission:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Tüm yetkiler listesini getirir
 * @returns {Promise<Object>} Yetkiler listesi
 */
export const getAllPermissions = async () => {
  try {
    const permissionsQuery = query(collection(db, "permissions"));
    const permissionsSnapshot = await getDocs(permissionsQuery);

    let permissions = {};

    if (permissionsSnapshot.empty) {
      // İlk kez çalışıyorsa varsayılan yetkileri Firestore'a yükle
      console.log("Permissions not found in Firestore, initializing...");
      const initResult = await initializePermissions();
      if (initResult.success) {
        permissions = DETAILED_PERMISSIONS;
      } else {
        throw new Error("Failed to initialize permissions");
      }
    } else {
      permissionsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        permissions[data.key] = {
          name: data.name,
          description: data.description,
          category: data.category,
        };
      });
    }

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return {
      success: false,
      error: error.message,
      data: DETAILED_PERMISSIONS, // Fallback olarak static veriyi dön
    };
  }
};

/**
 * Varsayılan yetkileri Firestore'a yükler
 * @returns {Promise<Object>} Yükleme sonucu
 */
export const initializePermissions = async () => {
  try {
    const batch = [];

    for (const [key, permission] of Object.entries(DETAILED_PERMISSIONS)) {
      const permissionRef = doc(db, "permissions", key);
      batch.push(
        setDoc(
          permissionRef,
          {
            key,
            name: permission.name,
            description: permission.description,
            category: permission.category,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        )
      );
    }

    await Promise.all(batch);

    return {
      success: true,
      message: "Yetkiler başarıyla yüklendi",
    };
  } catch (error) {
    console.error("Error initializing permissions:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
