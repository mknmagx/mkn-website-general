import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser as deleteAuthUser,
  getAuth,
} from "firebase/auth";
import {
  USER_ROLES,
  hasPermission,
  requirePermission,
  getRolePermissions,
} from "./admin-auth-service";
import { syncUserRoleChange } from "./sync-service";
import { ROLE_LEVELS } from "./admin-permissions-service";

// Re-export USER_ROLES for convenience
export { USER_ROLES };

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

// Tüm kullanıcıları getir (permission kontrolü ile)
export const getAllUsers = async (currentUserPermissions) => {
  try {
    requirePermission(currentUserPermissions, "users.view");

    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
        lastLoginAt: safeToDate(data.lastLoginAt),
      });
    });

    return {
      success: true,
      users: users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error.message,
      users: [],
    };
  }
};

// Tek kullanıcı getir
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      throw new Error("Kullanıcı bulunamadı");
    }

    const userData = userDoc.data();
    return {
      id: userDoc.id,
      ...userData,
      createdAt: safeToDate(userData.createdAt),
      updatedAt: safeToDate(userData.updatedAt),
      lastLoginAt: safeToDate(userData.lastLoginAt),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Kullanıcı rolünü güncelle
export const updateUserRole = async (
  userId,
  newRole,
  currentUserPermissions,
  currentUserRole
) => {
  try {
    // Permission kontrolü
    requirePermission(currentUserPermissions, "users.manage_roles");

    // Yetki kontrolü
    if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[newRole]) {
      throw new Error("Bu rolü atamak için yetkiniz yok");
    }

    // Mevcut kullanıcı verisini al
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      throw new Error("Kullanıcı bulunamadı");
    }
    
    const oldRole = userDoc.data().role;

    // Kullanıcı rolünü güncelle
    await updateDoc(doc(db, "users", userId), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    // Senkronizasyon: Role değişince permission array'ini otomatik güncelle
    await syncUserRoleChange(userId, newRole, oldRole);

    return {
      success: true,
      message: "Kullanıcı rolü ve yetkileri başarıyla güncellendi",
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Kullanıcı bilgilerini güncelle
export const updateUser = async (userId, userData, currentUserRole) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("Kullanıcı bulunamadı");
    }

    const currentUserData = userSnap.data();

    // Yetki kontrolü - sadece kendi seviyesinden düşük rollere sahip kullanıcıları güncelleyebilir
    if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[currentUserData.role]) {
      throw new Error("Bu kullanıcıyı güncelleme yetkiniz yok");
    }

    // Eğer rol değiştiriliyorsa, yeni rol için de yetki kontrolü
    if (userData.role && userData.role !== currentUserData.role) {
      if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[userData.role]) {
        throw new Error("Bu rolü atama yetkiniz yok");
      }
    }

    // Güncelleme verilerini hazırla
    const updateData = {
      ...userData,
      updatedAt: serverTimestamp(),
    };

    // Email ve sistem alanlarının güncellenmesine izin verme
    delete updateData.email;
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(userRef, updateData);

    return {
      success: true,
      message: "Kullanıcı başarıyla güncellendi",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Kullanıcıyı devre dışı bırak/aktifleştir
export const toggleUserStatus = async (userId, isActive, currentUserRole) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("Kullanıcı bulunamadı");
    }

    const targetUser = userSnap.data();

    // Super admin kendini devre dışı bırakamaz
    if (targetUser.role === USER_ROLES.SUPER_ADMIN && !isActive) {
      throw new Error("Super admin devre dışı bırakılamaz");
    }

    // Yetki kontrolü
    if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[targetUser.role]) {
      throw new Error("Bu kullanıcıyı değiştirmek için yetkiniz yok");
    }

    await updateDoc(userRef, {
      isActive: isActive,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};

// Güvenli şifre oluşturma fonksiyonu
const generateSecurePassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Yeni kullanıcı oluştur (Authentication + Firestore)
export const createUser = async (userData, currentUserRole) => {
  try {
    // Yetki kontrolü
    if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[userData.role]) {
      throw new Error("Bu rolde kullanıcı oluşturmak için yetkiniz yok");
    }

    // Mevcut kullanıcı bilgilerini sakla
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser?.email;

    // Otomatik güvenli şifre oluştur
    const generatedPassword = generateSecurePassword();

    // Firebase Authentication'da kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      generatedPassword
    );
    const newUser = userCredential.user;

    // Display name güncelle
    if (userData.displayName) {
      await updateProfile(newUser, {
        displayName: userData.displayName
      });
    }

    // Role göre permissions al
    const rolePermissions = await getRolePermissions(userData.role);

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
      permissions: rolePermissions,
      achievements: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: null,
    };

    await setDoc(doc(db, "users", newUser.uid), userDocData);

    // Yeni kullanıcıyı logout et
    await auth.signOut();

    // ÖNEMLI: Burada mevcut admin kullanıcıyı tekrar login etmeyi deneyebilirsiniz
    // Ancak güvenlik nedeniyle şifre gerekebilir. Alternatif olarak sayfa yenilenmesini bekleyebiliriz.

    return {
      success: true,
      userId: newUser.uid,
      generatedPassword: generatedPassword,
      message: "Kullanıcı başarıyla oluşturuldu",
      requiresReauth: true // Admin kullanıcının yeniden login olması gerektiğini belirt
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Manuel UID ile kullanıcı kaydı oluşturma (Firebase Auth'da zaten mevcut kullanıcılar için)
export const createUserRecordByUID = async (uid, userData, currentUserRole) => {
  try {
    // Yetki kontrolü
    if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[userData.role]) {
      throw new Error("Bu rolde kullanıcı oluşturmak için yetkiniz yok");
    }

    // UID ile kullanıcı zaten var mı kontrol et
    const existingUserDoc = await getDoc(doc(db, "users", uid));
    if (existingUserDoc.exists()) {
      throw new Error("Bu UID ile kullanıcı kaydı zaten mevcut. Düzenlemek için kullanıcı listesinden düzenle butonunu kullanın.");
    }

    // Role göre permissions al (async await zorunlu)
    const userRole = userData.role || USER_ROLES.USER;
    const rolePermissions = await getRolePermissions(userRole);

    // Firestore'da kullanıcı bilgilerini kaydet
    const userDocData = {
      email: userData.email || "",
      displayName: userData.displayName || `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "İsimsiz Kullanıcı",
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      phoneNumber: userData.phoneNumber || "",
      role: userRole,
      isActive: true,
      company: userData.company || {
        name: "MKN Group",
        division: "ambalaj",
        position: "specialist",
        employeeId: `MKN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        startDate: new Date().toISOString().split("T")[0],
        branch: "istanbul-merkez",
      },
      performance: userData.performance || {
        salesTarget: 50000,
        salesAchieved: 0,
        customerSatisfaction: 4.0,
        quotesCreated: 0,
      },
      preferences: userData.preferences || {
        language: "tr",
        theme: "light",
        timezone: "Europe/Istanbul",
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      },
      permissions: rolePermissions,
      achievements: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: null,
    };

    // UID ile setDoc kullanarak kayıt oluştur
    await setDoc(doc(db, "users", uid), userDocData);

    return {
      success: true,
      userId: uid,
      message: "Kullanıcı kaydı başarıyla oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating user record by UID:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Kullanıcı silme
export const deleteUser = async (userId, currentUserRole) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("Kullanıcı bulunamadı");
    }

    const targetUser = userSnap.data();

    // Super admin silinemez
    if (targetUser.role === USER_ROLES.SUPER_ADMIN) {
      throw new Error("Super admin silinemez");
    }

    // Yetki kontrolü
    if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[targetUser.role]) {
      throw new Error("Bu kullanıcıyı silmek için yetkiniz yok");
    }

    await deleteDoc(userRef);

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Kullanıcı istatistikleri
export const getUserStats = async (currentUserPermissions) => {
  try {
    requirePermission(currentUserPermissions, "analytics.view");

    const usersQuery = query(collection(db, "users"));
    const querySnapshot = await getDocs(usersQuery);

    const stats = {
      total: 0,
      active: 0,
      inactive: 0,
      byRole: {
        [USER_ROLES.SUPER_ADMIN]: 0,
        [USER_ROLES.ADMIN]: 0,
        [USER_ROLES.MODERATOR]: 0,
        [USER_ROLES.USER]: 0,
      },
    };

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      stats.total++;

      if (userData.isActive !== false) {
        stats.active++;
      } else {
        stats.inactive++;
      }

      if (userData.role && stats.byRole.hasOwnProperty(userData.role)) {
        stats.byRole[userData.role]++;
      }
    });

    return {
      success: true,
      stats: stats,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      success: false,
      error: error.message,
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {},
      },
    };
  }
};

// Role göre kullanıcıları getir
export const getUsersByRole = async (role) => {
  try {
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", role),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastLoginAt: doc.data().lastLoginAt?.toDate(),
      });
    });

    return users;
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};

// Son giriş tarihini güncelle
export const updateLastLogin = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
};

// Admin kullanıcıları getir
export const getAdminUsers = async (currentUserPermissions) => {
  try {
    requirePermission(currentUserPermissions, "users.manage_roles");

    const adminRoles = [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.MODERATOR,
    ];
    const usersQuery = query(
      collection(db, "users"),
      where("role", "in", adminRoles),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(usersQuery);
    const adminUsers = [];

    querySnapshot.forEach((doc) => {
      adminUsers.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      users: adminUsers,
    };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Yeni admin kullanıcısı oluştur
export const createAdminUser = async (
  userData,
  currentUserPermissions,
  currentUserRole
) => {
  try {
    const { email, password, displayName, role } = userData;

    // Permission kontrolü
    if (
      role === USER_ROLES.SUPER_ADMIN &&
      currentUserRole !== USER_ROLES.SUPER_ADMIN
    ) {
      throw new Error(
        "Sadece süper admin kullanıcıları başka süper admin oluşturabilir."
      );
    }

    if ([USER_ROLES.ADMIN, USER_ROLES.MODERATOR].includes(role)) {
      requirePermission(currentUserPermissions, "users.manage_roles");
    } else {
      requirePermission(currentUserPermissions, "users.create");
    }

    // Firebase Authentication'da kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Yeni role göre permission array'i Firestore'dan al
    const rolePermissions = await getRolePermissions(role);

    // Firestore'da kullanıcı bilgilerini kaydet
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      displayName: displayName,
      role: role,
      permissions: rolePermissions, // Array formatında permissions
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid,
    });

    return {
      success: true,
      message: "Admin kullanıcısı başarıyla oluşturuldu.",
      userId: user.uid,
    };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
