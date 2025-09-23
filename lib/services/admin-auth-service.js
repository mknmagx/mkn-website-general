import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Admin kullanıcısı için authentication servisi
 */

// Admin rolü kontrolü
export const checkAdminRole = async (user) => {
  if (!user) return false;

  try {
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    return adminDoc.exists() && adminDoc.data().role === "admin";
  } catch (error) {
    console.error("Admin role check error:", error);
    return false;
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
    const isAdmin = await checkAdminRole(user);
    if (!isAdmin) {
      await signOut(auth);
      throw new Error("Bu hesap admin yetkisine sahip değil.");
    }

    return {
      success: true,
      user,
      message: "Başarıyla giriş yapıldı.",
    };
  } catch (error) {
    console.error("Admin sign in error:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
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
        const isAdmin = await checkAdminRole(user);

        callback(isAdmin ? user : null);
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
