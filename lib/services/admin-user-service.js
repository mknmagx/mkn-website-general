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
} from "firebase/firestore";
import { db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser as deleteAuthUser,
  getAuth,
} from "firebase/auth";

// Kullanıcı rolleri
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
};

// Rol seviyesi (yetki kontrolü için)
export const ROLE_LEVELS = {
  [USER_ROLES.SUPER_ADMIN]: 4,
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.MODERATOR]: 2,
  [USER_ROLES.USER]: 1,
};

// Tüm kullanıcıları getir
export const getAllUsers = async () => {
  try {
    const usersQuery = query(
      collection(db, "users"),
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
    console.error("Error fetching users:", error);
    throw error;
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
      createdAt: userData.createdAt?.toDate(),
      updatedAt: userData.updatedAt?.toDate(),
      lastLoginAt: userData.lastLoginAt?.toDate(),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Kullanıcı rolünü güncelle
export const updateUserRole = async (userId, newRole, currentUserRole) => {
  try {
    // Yetki kontrolü
    if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[newRole]) {
      throw new Error("Bu rolü atamak için yetkiniz yok");
    }

    await updateDoc(doc(db, "users", userId), {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    return true;
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

    const currentUser = userSnap.data();

    // Eğer rol değiştiriliyorsa yetki kontrolü yap
    if (userData.role && userData.role !== currentUser.role) {
      if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[userData.role]) {
        throw new Error("Bu rolü atamak için yetkiniz yok");
      }
    }

    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });

    return true;
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

// Yeni kullanıcı oluştur
export const createUser = async (userData, currentUserRole) => {
  try {
    // Yetki kontrolü
    if (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[userData.role]) {
      throw new Error("Bu rolde kullanıcı oluşturmak için yetkiniz yok");
    }

    // Firestore'da kullanıcı kaydı oluştur
    const userDocData = {
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: null,
    };

    const docRef = await addDoc(collection(db, "users"), userDocData);

    return docRef.id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
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
export const getUserStats = async () => {
  try {
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

    return stats;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
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
