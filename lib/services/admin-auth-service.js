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

// Admin rolü ve kullanıcı bilgilerini getir
export const checkAdminRole = async (user) => {
  if (!user) return { isAdmin: false, userData: null };

  try {
    // Önce users koleksiyonundan kullanıcı bilgilerini al
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const adminRoles = ["super_admin", "admin", "moderator"];
      const isAdmin =
        adminRoles.includes(userData.role) && userData.isActive !== false;

      return {
        isAdmin,
        userData: {
          ...userData,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
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
          role: "admin",
          isActive: true,
          ...adminDoc.data(),
        },
      };
    }

    return { isAdmin: false, userData: null };
  } catch (error) {
    console.error("Admin role check error:", error);
    return { isAdmin: false, userData: null };
  }
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
    const { isAdmin, userData } = await checkAdminRole(user);
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

        const { isAdmin, userData } = await Promise.race([
          checkPromise,
          timeoutPromise,
        ]);
        callback(isAdmin ? userData : null);
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
