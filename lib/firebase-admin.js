import admin from "firebase-admin";

// Singleton pattern için cache
let isInitialized = false;

// Firebase Admin SDK'yı başlat
if (!admin.apps.length && !isInitialized) {
  try {
    // Service account key bilgilerini environment variables'dan al
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    // Eğer environment variables yoksa, hata fırlat
    if (
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_CLIENT_EMAIL
    ) {
      console.error("❌ Kritik environment variables eksik!");
      console.error(
        "FIREBASE_PRIVATE_KEY:",
        !!process.env.FIREBASE_PRIVATE_KEY
      );
      console.error(
        "FIREBASE_CLIENT_EMAIL:",
        !!process.env.FIREBASE_CLIENT_EMAIL
      );
      throw new Error("Firebase Admin SDK environment variables are missing");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: "mkngroup-general.firebasestorage.app",
    });

    isInitialized = true;
  } catch (error) {
    console.error("❌ Firebase Admin SDK initialization failed:", error);
    console.error("Hata detayları:", error.message);
    console.error("Hata stack:", error.stack);
    // Geliştirme ortamında hata vermek yerine uyarı ver
    console.warn(
      "Firebase Admin SDK is not properly configured. Please set up environment variables."
    );
  }
}

// Firebase Admin services'ları export et
const adminAuthInstance = admin.apps.length > 0 ? admin.auth() : null;
const adminFirestoreInstance = admin.apps.length > 0 ? admin.firestore() : null;

export const adminAuth = adminAuthInstance;
export const adminFirestore = adminFirestoreInstance;
export const adminDb = adminFirestoreInstance; // Alias for Firestore

export default admin;
