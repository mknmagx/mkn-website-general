import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./firebase";

// Kullanıcı kaydı
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Kullanıcı profil bilgilerini güncelle
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
    }

    // E-posta doğrulama gönder
    await sendEmailVerification(userCredential.user);

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Kullanıcı girişi
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Kullanıcı çıkışı
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

// Şifre sıfırlama
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Auth durumu değişiklik dinleyicisi
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Mevcut kullanıcıyı al
export const getCurrentUser = () => {
  return auth.currentUser;
};
