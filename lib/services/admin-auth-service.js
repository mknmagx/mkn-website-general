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

// Role permissions tanımları - Firebase'deki dynamic permission listesi
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    // Analytics
    "analytics.export",
    "analytics.view",
    
    // Blog
    "blog.analytics",
    "blog.categories", 
    "blog.delete",
    "blog.publish",
    "blog.read",
    "blog.write",
    
    // Companies
    "companies.create",
    "companies.delete",
    "companies.edit",
    "companies.view",
    
    // Contacts
    "contacts.delete",
    "contacts.respond",
    "contacts.update",
    "contacts.view",
    
    // Content
    "content.create",
    "content.delete",
    "content.edit",
    "content.publish",
    "content.view",
    
    // Quotes
    "quotes.create",
    "quotes.delete",
    "quotes.edit",
    "quotes.view",
    
    // System
    "system.backup",
    "system.logs",
    "system.settings",
    
    // Users
    "users.create",
    "users.delete",
    "users.edit",
    "users.manage_permissions",
    "users.manage_roles",
    "users.view"
  ],
  [USER_ROLES.ADMIN]: [
    // Analytics
    "analytics.view",
    
    // Blog
    "blog.analytics",
    "blog.categories",
    "blog.delete",
    "blog.publish", 
    "blog.read",
    "blog.write",
    
    // Companies
    "companies.create",
    "companies.delete",
    "companies.edit",
    "companies.view",
    
    // Contacts
    "contacts.delete",
    "contacts.respond",
    "contacts.update",
    "contacts.view",
    
    // Content
    "content.create",
    "content.delete",
    "content.edit",
    "content.publish",
    "content.view",
    
    // Quotes
    "quotes.create",
    "quotes.delete",
    "quotes.edit",
    "quotes.view",
    
    // Users (limited)
    "users.create",
    "users.edit",
    "users.view"
  ],
  [USER_ROLES.MODERATOR]: [
    // Blog (read only)
    "blog.read",
    
    // Companies (view only)
    "companies.view",
    
    // Contacts
    "contacts.respond",
    "contacts.view",
    
    // Content (view only)
    "content.view",
    
    // Quotes (view only)
    "quotes.view"
  ],
};

// Admin rolü ve kullanıcı bilgilerini getir
export const checkAdminRole = async (user) => {
  if (!user) return { isAdmin: false, userData: null, permissions: [] };

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
      
      if (isAdmin) {
        // Kullanıcının kendi permission arrayini kullan (varsa)
        if (userData.permissions && Array.isArray(userData.permissions)) {
          permissions = userData.permissions;
        } else {
          // Yoksa role-based permissions kullan
          permissions = ROLE_PERMISSIONS[userData.role] || [];
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
      };
    }

    // Eski admins koleksiyonu kontrolü (backward compatibility)
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    if (adminDoc.exists() && adminDoc.data().role === "admin") {
      return {
        isAdmin: true,
        userData: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: USER_ROLES.ADMIN,
          isActive: true,
          ...adminDoc.data(),
        },
        permissions: ROLE_PERMISSIONS[USER_ROLES.ADMIN],
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

// Role-based route guard
export const canAccessRoute = (userRole, routePath) => {
  const roleRoutes = {
    [USER_ROLES.SUPER_ADMIN]: ["*"], // Tüm sayfalara erişim
    [USER_ROLES.ADMIN]: [
      "/admin/dashboard",
      "/admin/users",
      "/admin/companies",
      "/admin/contacts",
      "/admin/quotes",
    ],
    [USER_ROLES.MODERATOR]: [
      "/admin/dashboard",
      "/admin/contacts",
      "/admin/quotes",
    ],
  };

  const allowedRoutes = roleRoutes[userRole] || [];
  return (
    allowedRoutes.includes("*") ||
    allowedRoutes.some((route) => routePath.startsWith(route))
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

        const { isAdmin, userData, permissions } = await Promise.race([
          checkPromise,
          timeoutPromise,
        ]);

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
              }
            : { user: null, isAdmin: false, permissions: [] }
        );
      } else {
        console.log("No user found");
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
