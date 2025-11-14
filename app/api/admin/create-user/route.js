import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../../../lib/firebase-admin';
import { withAuth } from '../../../../lib/services/api-auth-middleware';

// Güvenli şifre oluşturma fonksiyonu
function generateSecurePassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export const POST = withAuth(async (request) => {
  try {
    // Firebase Admin SDK kontrol et
    if (!adminAuth || !adminFirestore) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Firebase Admin SDK is not properly configured. Please set up service account credentials.' 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userData, currentUserRole } = body;

    // Basit yetki kontrolü (daha detaylı kontroller eklenebilir)
    if (!currentUserRole) {
      return NextResponse.json(
        { success: false, error: 'Yetki kontrolü başarısız' },
        { status: 403 }
      );
    }

    // Otomatik güvenli şifre oluştur
    const generatedPassword = generateSecurePassword();

    // Firebase Admin SDK ile kullanıcı oluştur
    const userRecord = await adminAuth.createUser({
      email: userData.email,
      password: generatedPassword,
      displayName: userData.displayName,
      disabled: false,
      emailVerified: false
    });

    // Firestore'da kullanıcı bilgilerini kaydet
    const userDocData = {
      email: userData.email,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      isActive: true,
      company: userData.company || {
        name: "MKN Group",
        division: "ambalaj",
        position: "specialist",
        employeeId: "",
        startDate: "",
        branch: "istanbul-merkez",
      },
      performance: userData.performance || {
        salesTarget: 0,
        salesAchieved: 0,
        customerSatisfaction: 0,
        quotesCreated: 0,
      },
      preferences: userData.preferences || {
        language: "tr",
        theme: "light",
        timezone: "Europe/Istanbul",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    };

    await adminFirestore.collection('users').doc(userRecord.uid).set(userDocData);

    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      generatedPassword: generatedPassword,
      message: "Kullanıcı başarıyla oluşturuldu"
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});