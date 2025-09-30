import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

// Role permissions tanımları
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: {
    canManageUsers: true,
    canManageAdmins: true,
    canManageCompanies: true,
    canViewAllContacts: true,
    canViewAllQuotes: true,
    canDeleteContent: true,
    canModifySettings: true,
    canViewAnalytics: true,
  },
  [USER_ROLES.ADMIN]: {
    canManageUsers: true,
    canManageAdmins: false,
    canManageCompanies: true,
    canViewAllContacts: true,
    canViewAllQuotes: true,
    canDeleteContent: true,
    canModifySettings: false,
    canViewAnalytics: true,
  },
  [USER_ROLES.MODERATOR]: {
    canManageUsers: false,
    canManageAdmins: false,
    canManageCompanies: false,
    canViewAllContacts: true,
    canViewAllQuotes: true,
    canDeleteContent: false,
    canModifySettings: false,
    canViewAnalytics: false,
  },
};

// Admin rolü ve kullanıcı bilgilerini getir
export const checkAdminRole = async (user) => {
  if (!user) return { isAdmin: false, userData: null, permissions: null };

  try {
    // Önce users koleksiyonundan kullanıcı bilgilerini al
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const adminRoles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MODERATOR];
      const isAdmin =
        adminRoles.includes(userData.role) && userData.isActive !== false;

      // Gerçek permission sistemini kullan - roldeki permissions arrayinden
      let permissions = {};
      if (isAdmin && userData.permissions && Array.isArray(userData.permissions)) {
        // Permission arrayini object'e çevir
        userData.permissions.forEach(perm => {
          permissions[perm] = true;
        });
        
        // Backward compatibility için eski permissionları da ekle
        const oldPermissions = ROLE_PERMISSIONS[userData.role] || {};
        permissions = { ...oldPermissions, ...permissions };
      } else if (isAdmin) {
        // Fallback olarak eski sistem permissionları
        permissions = ROLE_PERMISSIONS[userData.role] || {};
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

    return { isAdmin: false, userData: null, permissions: null };
  } catch (error) {
    console.error("Admin role check error:", error);
    return { isAdmin: false, userData: null, permissions: null };
  }
};

// Permission kontrol helper fonksiyonları
export const hasPermission = (permissions, permissionKey) => {
  return permissions && permissions[permissionKey] === true;
};

export const requirePermission = (permissions, permissionKey) => {
  if (!hasPermission(permissions, permissionKey)) {
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
  return allowedRoutes.includes("*") || allowedRoutes.some(route => routePath.startsWith(route));
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

    return {
      success: true,
      user: userData,
      permissions,
      message: "Başarıyla giriş yapıldı.",
    };
  } catch (error) {
    console.error("Admin sign in error:", error);
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
    await signOut(auth);
    return {
      success: true,
      message: "Başarıyla çıkış yapıldı.",
    };
  } catch (error) {
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
        
        callback(isAdmin ? { 
          user: userData, 
          isAdmin: true, 
          permissions 
        } : null);
      } else {
        console.log("No user found");
        callback(null);
      }
    } catch (error) {
      console.error("Auth state change error:", error);
      callback(null);
    }
  });
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
