import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  Timestamp,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Admin Logging Service
 * Tüm admin işlemlerini sistematik olarak loglar
 */

// Log seviyeleri
export const LOG_LEVELS = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  DEBUG: "debug",
};

// Log kategorileri
export const LOG_CATEGORIES = {
  AUTH: "auth",
  NAVIGATION: "navigation",
  CRUD: "crud",
  PERMISSION: "permission",
  SYSTEM: "system",
  USER_MANAGEMENT: "user_management",
  COMPANY_MANAGEMENT: "company_management",
  CONTACT_MANAGEMENT: "contact_management",
  QUOTE_MANAGEMENT: "quote_management",
  CONTENT_MANAGEMENT: "content_management",
};

// CRUD işlem tipleri
export const CRUD_OPERATIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  BULK_UPDATE: "bulk_update",
  BULK_DELETE: "bulk_delete",
  EXPORT: "export",
  IMPORT: "import",
};

/**
 * Admin log kaydı oluşturur
 * @param {Object} logData - Log verisi
 * @returns {Promise<string>} Log ID
 */
export const createAdminLog = async (logData) => {
  try {
    const {
      userId,
      userEmail,
      userRole,
      action,
      category,
      level = LOG_LEVELS.INFO,
      resource,
      resourceId,
      details,
      metadata = {},
      ipAddress,
      userAgent,
    } = logData;

    // Zorunlu alanları kontrol et
    if (!userId || !action || !category) {
      throw new Error("userId, action ve category alanları zorunludur");
    }

    const logEntry = {
      // Kullanıcı bilgileri
      userId,
      userEmail: userEmail || null,
      userRole: userRole || null,

      // İşlem bilgileri
      action,
      category,
      level,

      // Kaynak bilgileri
      resource: resource || null,
      resourceId: resourceId || null,

      // Detay bilgileri
      details: details || null,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent:
          userAgent ||
          (typeof navigator !== "undefined" ? navigator.userAgent : null),
        url: typeof window !== "undefined" ? window.location.href : null,
      },

      // Sistem bilgileri
      ipAddress: ipAddress || null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "admin_logs"), logEntry);
    return docRef.id;
  } catch (error) {
    console.error("Admin log oluşturulurken hata:", error);
    // Logging hatası sistem çalışmasını engellememelidir
    return null;
  }
};

/**
 * Hızlı log fonksiyonları
 */

// Giriş/Çıkış logları
export const logAuthAction = async (
  userId,
  userEmail,
  userRole,
  action,
  details = null
) => {
  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action,
    category: LOG_CATEGORIES.AUTH,
    level: LOG_LEVELS.INFO,
    details,
  });
};

// Navigasyon logları
export const logNavigation = async (
  userId,
  userEmail,
  userRole,
  fromPath,
  toPath
) => {
  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action: "page_navigation",
    category: LOG_CATEGORIES.NAVIGATION,
    level: LOG_LEVELS.DEBUG,
    details: `${fromPath} → ${toPath}`,
    metadata: {
      fromPath,
      toPath,
    },
  });
};

// CRUD işlem logları
export const logCrudOperation = async (
  userId,
  userEmail,
  userRole,
  operation,
  resource,
  resourceId = null,
  details = null,
  metadata = {}
) => {
  const level =
    operation === CRUD_OPERATIONS.DELETE ? LOG_LEVELS.WARNING : LOG_LEVELS.INFO;

  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action: operation,
    category: LOG_CATEGORIES.CRUD,
    level,
    resource,
    resourceId,
    details,
    metadata,
  });
};

// Kullanıcı yönetimi logları
export const logUserManagement = async (
  userId,
  userEmail,
  userRole,
  action,
  targetUserId,
  details,
  metadata = {}
) => {
  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action,
    category: LOG_CATEGORIES.USER_MANAGEMENT,
    level: LOG_LEVELS.INFO,
    resource: "user",
    resourceId: targetUserId,
    details,
    metadata,
  });
};

// Şirket yönetimi logları
export const logCompanyManagement = async (
  userId,
  userEmail,
  userRole,
  action,
  companyId,
  details,
  metadata = {}
) => {
  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action,
    category: LOG_CATEGORIES.COMPANY_MANAGEMENT,
    level: LOG_LEVELS.INFO,
    resource: "company",
    resourceId: companyId,
    details,
    metadata,
  });
};

// İletişim yönetimi logları
export const logContactManagement = async (
  userId,
  userEmail,
  userRole,
  action,
  contactId,
  details,
  metadata = {}
) => {
  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action,
    category: LOG_CATEGORIES.CONTACT_MANAGEMENT,
    level: LOG_LEVELS.INFO,
    resource: "contact",
    resourceId: contactId,
    details,
    metadata,
  });
};

// Teklif yönetimi logları
export const logQuoteManagement = async (
  userId,
  userEmail,
  userRole,
  action,
  quoteId,
  details,
  metadata = {}
) => {
  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action,
    category: LOG_CATEGORIES.QUOTE_MANAGEMENT,
    level: LOG_LEVELS.INFO,
    resource: "quote",
    resourceId: quoteId,
    details,
    metadata,
  });
};

// Hata logları
export const logError = async (
  userId,
  userEmail,
  userRole,
  action,
  error,
  metadata = {}
) => {
  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action,
    category: LOG_CATEGORIES.SYSTEM,
    level: LOG_LEVELS.ERROR,
    details: error.message || error,
    metadata: {
      ...metadata,
      stack: error.stack,
      errorCode: error.code,
    },
  });
};

// Yetki kontrol logları
export const logPermissionCheck = async (
  userId,
  userEmail,
  userRole,
  permission,
  allowed,
  resource = null
) => {
  return createAdminLog({
    userId,
    userEmail,
    userRole,
    action: "permission_check",
    category: LOG_CATEGORIES.PERMISSION,
    level: allowed ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARNING,
    resource,
    details: `Permission '${permission}' ${allowed ? "granted" : "denied"}`,
    metadata: {
      permission,
      allowed,
    },
  });
};

/**
 * Log sorgulama fonksiyonları
 */

// Tüm logları getir (sayfalama ile)
export const getAdminLogs = async (
  filters = {},
  pageSize = 50,
  lastDoc = null
) => {
  try {
    const { userId, category, level, resource, dateFrom, dateTo, searchText } =
      filters;

    let q = collection(db, "admin_logs");
    let constraints = [];

    // Filtreler
    if (userId) {
      constraints.push(where("userId", "==", userId));
    }
    if (category) {
      constraints.push(where("category", "==", category));
    }
    if (level) {
      constraints.push(where("level", "==", level));
    }
    if (resource) {
      constraints.push(where("resource", "==", resource));
    }
    if (dateFrom) {
      constraints.push(
        where("createdAt", ">=", Timestamp.fromDate(new Date(dateFrom)))
      );
    }
    if (dateTo) {
      constraints.push(
        where("createdAt", "<=", Timestamp.fromDate(new Date(dateTo)))
      );
    }

    // Sıralama
    constraints.push(orderBy("createdAt", "desc"));

    // Sayfa limiti
    constraints.push(limit(pageSize));

    // Sayfalama
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    const logs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      });
    });

    // Metin araması (client-side, Firestore'da text search sınırlı)
    let filteredLogs = logs;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredLogs = logs.filter(
        (log) =>
          log.action?.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower) ||
          log.userEmail?.toLowerCase().includes(searchLower) ||
          log.resource?.toLowerCase().includes(searchLower)
      );
    }

    return {
      success: true,
      logs: filteredLogs,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === pageSize,
    };
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    return {
      success: false,
      error: error.message,
      logs: [],
    };
  }
};

// Belirli bir kullanıcının loglarını getir
export const getUserLogs = async (userId, limit = 100) => {
  try {
    const q = query(
      collection(db, "admin_logs"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      });
    });

    return {
      success: true,
      logs,
    };
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return {
      success: false,
      error: error.message,
      logs: [],
    };
  }
};

// Log istatistikleri
export const getLogStats = async (dateFrom = null, dateTo = null) => {
  try {
    let q = collection(db, "admin_logs");
    let constraints = [];

    if (dateFrom) {
      constraints.push(
        where("createdAt", ">=", Timestamp.fromDate(new Date(dateFrom)))
      );
    }
    if (dateTo) {
      constraints.push(
        where("createdAt", "<=", Timestamp.fromDate(new Date(dateTo)))
      );
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);

    const stats = {
      totalLogs: 0,
      categories: {},
      levels: {},
      users: {},
      resources: {},
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.totalLogs++;

      // Kategori istatistikleri
      stats.categories[data.category] =
        (stats.categories[data.category] || 0) + 1;

      // Seviye istatistikleri
      stats.levels[data.level] = (stats.levels[data.level] || 0) + 1;

      // Kullanıcı istatistikleri
      if (data.userEmail) {
        stats.users[data.userEmail] = (stats.users[data.userEmail] || 0) + 1;
      }

      // Kaynak istatistikleri
      if (data.resource) {
        stats.resources[data.resource] =
          (stats.resources[data.resource] || 0) + 1;
      }
    });

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Error fetching log stats:", error);
    return {
      success: false,
      error: error.message,
      stats: null,
    };
  }
};

// Log temizleme (eski logları silme)
export const cleanupOldLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const q = query(
      collection(db, "admin_logs"),
      where("createdAt", "<", Timestamp.fromDate(cutoffDate)),
      limit(500) // Batch silme için limit
    );

    const querySnapshot = await getDocs(q);
    const batch = [];

    querySnapshot.forEach((doc) => {
      batch.push(deleteDoc(doc.ref));
    });

    await Promise.all(batch);

    return {
      success: true,
      deletedCount: querySnapshot.size,
    };
  } catch (error) {
    console.error("Error cleaning up old logs:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Yardımcı fonksiyonlar
 */

// Türkçe log mesajları
export const getLogMessage = (log) => {
  const actionMessages = {
    // Auth
    login: "Giriş yaptı",
    logout: "Çıkış yaptı",
    login_failed: "Başarısız giriş denemesi",
    password_reset: "Şifre sıfırlama talebinde bulundu",

    // Navigation
    page_navigation: "Sayfa geçişi yaptı",

    // CRUD
    create: "Oluşturdu",
    read: "Görüntüledi",
    update: "Güncelledi",
    delete: "Sildi",
    bulk_update: "Toplu güncelleme yaptı",
    bulk_delete: "Toplu silme yaptı",
    export: "Dışa aktardı",
    import: "İçe aktardı",

    // User Management
    user_created: "Kullanıcı oluşturdu",
    user_updated: "Kullanıcı güncelledi",
    user_deleted: "Kullanıcı sildi",
    user_activated: "Kullanıcı aktifleştirdi",
    user_deactivated: "Kullanıcı deaktifleştirdi",
    user_role_changed: "Kullanıcı rolü değiştirdi",

    // Permission
    permission_check: "Yetki kontrolü yapıldı",
    permission_denied: "Yetki reddedildi",
  };

  return actionMessages[log.action] || log.action;
};

// Log seviyesi rengi
export const getLogLevelColor = (level) => {
  const colors = {
    [LOG_LEVELS.DEBUG]: "gray",
    [LOG_LEVELS.INFO]: "blue",
    [LOG_LEVELS.SUCCESS]: "green",
    [LOG_LEVELS.WARNING]: "yellow",
    [LOG_LEVELS.ERROR]: "red",
  };
  return colors[level] || "gray";
};

// Log kategori ikonu
export const getLogCategoryIcon = (category) => {
  const icons = {
    [LOG_CATEGORIES.AUTH]: "🔐",
    [LOG_CATEGORIES.NAVIGATION]: "🧭",
    [LOG_CATEGORIES.CRUD]: "📝",
    [LOG_CATEGORIES.PERMISSION]: "🛡️",
    [LOG_CATEGORIES.SYSTEM]: "⚙️",
    [LOG_CATEGORIES.USER_MANAGEMENT]: "👥",
    [LOG_CATEGORIES.COMPANY_MANAGEMENT]: "🏢",
    [LOG_CATEGORIES.CONTACT_MANAGEMENT]: "📞",
    [LOG_CATEGORIES.QUOTE_MANAGEMENT]: "💰",
    [LOG_CATEGORIES.CONTENT_MANAGEMENT]: "📄",
  };
  return icons[category] || "📋";
};
