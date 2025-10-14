import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  logAuthAction,
  logPermissionCheck,
  logError,
} from "./admin-log-service";

/**
 * Admin kullanıcısı için authentication servisi
 */

// Role hierarchy tanımları
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
};

// Permission cache for performance
let permissionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// Cache helper functions
const getCachedPermissions = (roleId) => {
  const cached = permissionCache.get(roleId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.permissions;
  }
  return null;
};

const setCachedPermissions = (roleId, permissions) => {
  permissionCache.set(roleId, {
    permissions,
    timestamp: Date.now(),
  });
};

// Cache temizleme fonksiyonları
export const clearPermissionCache = (roleId = null) => {
  if (roleId) {
    permissionCache.delete(roleId);
  } else {
    permissionCache.clear();
  }
};

export const refreshRolePermissions = async (roleId) => {
  clearPermissionCache(roleId);
  return await getRolePermissions(roleId);
};

// Firestore'dan rol izinlerini getir
export const getRolePermissions = async (roleId) => {
  try {
    // Cache kontrol et
    const cached = getCachedPermissions(roleId);
    if (cached) {
      return cached;
    }

    // Firestore'dan role document'ini getir
    const roleDoc = await getDoc(doc(db, "roles", roleId));

    if (roleDoc.exists()) {
      const roleData = roleDoc.data();
      const permissions = roleData.permissions || [];

      // Cache'le
      setCachedPermissions(roleId, permissions);

      return permissions;
    }

    // Role bulunamazsa boş array
    console.warn(`Role not found in Firestore: ${roleId}`);
    return [];
  } catch (error) {
    console.error(`Error fetching role permissions for ${roleId}:`, error);
    // Hata durumunda güvenli fallback - minimum permissions
    return roleId === USER_ROLES.SUPER_ADMIN ? ["system.backup"] : [];
  }
};

// Admin rolü ve kullanıcı bilgilerini getir
export const checkAdminRole = async (user) => {
  if (!user)
    return {
      isAdmin: false,
      userData: null,
      permissions: [],
      allowedRoutes: [],
    };

  try {
    // Önce users koleksiyonundan kullanıcı bilgilerini al
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const adminRoles = [
        USER_ROLES.SUPER_ADMIN,
        USER_ROLES.ADMIN,
        USER_ROLES.MODERATOR,
      ];
      const isAdmin =
        adminRoles.includes(userData.role) && userData.isActive !== false;

      // Permission array sistemini kullan
      let permissions = [];
      let allowedRoutes = [];

      if (isAdmin) {
        // Önce kullanıcının kendi özel izinlerini kontrol et
        if (userData.permissions && Array.isArray(userData.permissions)) {
          permissions = userData.permissions;
        } else {
          // Kullanıcıya özel izin yoksa, rolden al
          permissions = await getRolePermissions(userData.role);
        }

        // Role bilgilerini Firestore'dan al
        if (userData.role) {
          try {
            const roleDoc = await getDoc(doc(db, "roles", userData.role));
            if (roleDoc.exists()) {
              const roleData = roleDoc.data();
              allowedRoutes = roleData.allowedRoutes || [];

              // Eğer kullanıcının özel izni yoksa ve rol izinleri varsa, rol izinlerini kullan
              if (
                !userData.permissions &&
                roleData.permissions &&
                Array.isArray(roleData.permissions)
              ) {
                permissions = roleData.permissions;
              }
            }
          } catch (error) {
            console.error("❌ [DEBUG] Role data fetch error:", error);
            console.error("❌ [DEBUG] Error details:", {
              errorMessage: error.message,
              errorCode: error.code,
              userRole: userData.role,
              roleDocPath: `roles/${userData.role}`,
            });
            // Fallback: güvenli minimum erişim
            allowedRoutes =
              userData.role === USER_ROLES.SUPER_ADMIN
                ? ["*"]
                : ["/admin/dashboard"];

            if (!permissions.length) {
              permissions = []; // Güvenlik için boş bırak
            }
          }
        }
      }

      return {
        isAdmin,
        userData: {
          ...userData,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
        permissions,
        allowedRoutes,
      };
    }

    // Eski admins koleksiyonu kontrolü (backward compatibility)
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    if (adminDoc.exists() && adminDoc.data().role === "admin") {
      const adminData = adminDoc.data();
      // Dinamik olarak admin rolünün izinlerini al
      const dynamicPermissions = await getRolePermissions(USER_ROLES.ADMIN);

      return {
        isAdmin: true,
        userData: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: USER_ROLES.ADMIN,
          isActive: true,
          ...adminData,
        },
        permissions: dynamicPermissions,
        allowedRoutes: ["/admin/dashboard"], // Fallback routes
      };
    }

    return { isAdmin: false, userData: null, permissions: [] };
  } catch (error) {
    console.error("Admin role check error:", error);
    return { isAdmin: false, userData: null, permissions: [] };
  }
};

// Permission kontrol helper fonksiyonları
export const hasPermission = async (
  permissions,
  permissionKey,
  userId = null,
  userEmail = null,
  userRole = null
) => {
  // Array-based permission sistemi
  const allowed = Array.isArray(permissions)
    ? permissions.includes(permissionKey)
    : false;

  // Permission check log
  if (userId) {
    await logPermissionCheck(
      userId,
      userEmail,
      userRole,
      permissionKey,
      allowed
    );
  }

  return allowed;
};

export const requirePermission = async (
  permissions,
  permissionKey,
  userId = null,
  userEmail = null,
  userRole = null
) => {
  const allowed = await hasPermission(
    permissions,
    permissionKey,
    userId,
    userEmail,
    userRole
  );

  if (!allowed) {
    // Permission denied log
    if (userId) {
      await logPermissionCheck(
        userId,
        userEmail,
        userRole,
        permissionKey,
        false
      );
    }

    throw new Error(`Bu işlem için ${permissionKey} yetkisi gereklidir.`);
  }
};

// Dynamic route guard - Firestore'dan allowedRoutes kullanır
export const canAccessRoute = async (
  userRole,
  routePath,
  allowedRoutes = null
) => {
  try {
    let routes = allowedRoutes;

    // Eğer routes verilmemişse, Firestore'dan al
    if (!routes) {
      const roleDoc = await getDoc(doc(db, "roles", userRole));
      if (roleDoc.exists()) {
        const roleData = roleDoc.data();
        routes = roleData.allowedRoutes || [];
      } else {
        // Fallback güvenlik: sadece dashboard'a erişim
        routes = ["/admin/dashboard"];
      }
    }

    return (
      routes.includes("*") ||
      routes.some((route) => routePath.startsWith(route))
    );
  } catch (error) {
    console.error("Route access check error:", error);
    // Hata durumunda güvenli: sadece dashboard'a izin ver
    return routePath === "/admin/dashboard";
  }
};

// Sync version for backward compatibility
export const canAccessRouteSync = (userRole, routePath, allowedRoutes) => {
  const routes = allowedRoutes || ["/admin/dashboard"];
  return (
    routes.includes("*") || routes.some((route) => routePath.startsWith(route))
  );
};

// Admin girişi
export const adminSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Admin rolü kontrolü
    const { isAdmin, userData, permissions } = await checkAdminRole(user);
    if (!isAdmin) {
      await signOut(auth);

      // Başarısız giriş denemesi log
      await logAuthAction(
        user.uid,
        email,
        null,
        "login_failed",
        "Admin yetkisi bulunmuyor"
      );

      return {
        success: false,
        error: "admin-access-denied",
        message: "Bu hesap admin paneline erişim yetkisine sahip değil.",
      };
    }

    // Son giriş zamanını güncelle
    try {
      const { updateDoc, doc, serverTimestamp } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../firebase");
      await updateDoc(doc(db, "users", user.uid), {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to update last login:", error);
    }

    // Başarılı giriş log
    await logAuthAction(
      userData.uid,
      userData.email,
      userData.role,
      "login",
      `Başarıyla giriş yapıldı - IP: ${await getClientIP()}`
    );

    return {
      success: true,
      user: userData,
      permissions,
      message: "Başarıyla giriş yapıldı.",
    };
  } catch (error) {
    console.error("Admin sign in error:", error);

    // Hata log
    await logError(null, email, null, "login_attempt_failed", error);

    return {
      success: false,
      error: error.code || "admin-access-denied",
      message: error.message || getErrorMessage(error.code),
    };
  }
};

// Admin çıkışı
export const adminSignOut = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Çıkış log
      await logAuthAction(
        user.uid,
        user.email,
        null,
        "logout",
        "Kullanıcı çıkış yaptı"
      );
    }

    await signOut(auth);
    return {
      success: true,
      message: "Başarıyla çıkış yapıldı.",
    };
  } catch (error) {
    await logError(
      auth.currentUser?.uid,
      auth.currentUser?.email,
      null,
      "logout_failed",
      error
    );

    return {
      success: false,
      error: error.code,
      message: "Çıkış yapılırken bir hata oluştu.",
    };
  }
};

// Şifre sıfırlama
export const adminPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Şifre sıfırlama bağlantısı email adresinize gönderildi.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

// Auth state listener
export const onAdminAuthStateChanged = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        // Promise race ile timeout ekliyoruz
        const checkPromise = checkAdminRole(user);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timeout")), 5000)
        );

        const { isAdmin, userData, permissions, allowedRoutes } =
          await Promise.race([checkPromise, timeoutPromise]);

        // Role bilgisini user objesine ekle
        const userWithRole = userData
          ? {
              ...userData,
              role: userData.role, // Role bilgisini açıkça ekle
            }
          : null;

        callback(
          isAdmin
            ? {
                user: userWithRole,
                isAdmin: true,
                permissions,
                allowedRoutes,
              }
            : { user: null, isAdmin: false, permissions: [], allowedRoutes: [] }
        );
      } else {
        // No user found in authentication state
        callback({ user: null, isAdmin: false, permissions: [] });
      }
    } catch (error) {
      console.error("Auth state change error:", error);
      callback({ user: null, isAdmin: false, permissions: [] });
    }
  });
};

// IP adresi alma fonksiyonu
const getClientIP = async () => {
  try {
    // Client-side'da IP adresini almak için üçüncü parti servis kullanabiliriz
    // Veya sadece 'client' olarak işaretleyebiliriz
    return "client-browser";
  } catch (error) {
    return "unknown";
  }
};

// Hata mesajları
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "Bu email adresi ile kayıtlı kullanıcı bulunamadı.";
    case "auth/wrong-password":
      return "Hatalı şifre girdiniz.";
    case "auth/invalid-email":
      return "Geçersiz email adresi.";
    case "auth/invalid-credential":
      return "Geçersiz email veya şifre.";
    case "auth/user-disabled":
      return "Bu hesap devre dışı bırakılmış.";
    case "auth/too-many-requests":
      return "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.";
    case "auth/network-request-failed":
      return "Bağlantı hatası. İnternet bağlantınızı kontrol edin.";
    case "auth/operation-not-allowed":
      return "Email/şifre girişi etkinleştirilmemiş.";
    case "auth/weak-password":
      return "Şifre çok zayıf.";
    default:
      return `Giriş yapılırken bir hata oluştu. Hata kodu: ${
        errorCode || "Bilinmeyen hata"
      }`;
  }
};
