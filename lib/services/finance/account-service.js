/**
 * Finance Module - Hesap Yönetimi Servisi
 * 
 * Hesap CRUD işlemleri ve bakiye hesaplamaları
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { ACCOUNT_TYPE, CURRENCY, TRANSACTION_TYPE } from "./schema";

const COLLECTION = "finance_accounts";

// =============================================================================
// HESAP CRUD
// =============================================================================

/**
 * Yeni hesap oluştur
 */
export const createAccount = async (accountData, userId) => {
  try {
    const newAccount = {
      name: accountData.name,
      type: accountData.type || ACCOUNT_TYPE.BANK,
      currency: accountData.currency || CURRENCY.TRY,
      
      // Banka bilgileri (banka hesapları için)
      bankName: accountData.bankName || "",
      iban: accountData.iban || "",
      accountNumber: accountData.accountNumber || "",
      branchCode: accountData.branchCode || "",
      
      // Bakiye
      initialBalance: accountData.initialBalance || 0,
      currentBalance: accountData.initialBalance || 0,
      
      // Durum
      isActive: true,
      isDefault: accountData.isDefault || false,
      
      // Notlar
      description: accountData.description || "",
      notes: accountData.notes || "",
      
      // Meta
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    // Eğer varsayılan olarak işaretlendiyse, diğerlerini kaldır
    if (newAccount.isDefault) {
      await clearDefaultAccount(newAccount.currency);
    }

    const docRef = await addDoc(collection(db, COLLECTION), newAccount);

    return {
      success: true,
      id: docRef.id,
      message: "Hesap başarıyla oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Hesap güncelle
 */
export const updateAccount = async (accountId, updateData, userId) => {
  try {
    const docRef = doc(db, COLLECTION, accountId);

    // Varsayılan kontrolü
    if (updateData.isDefault) {
      const account = await getAccount(accountId);
      if (account.success) {
        await clearDefaultAccount(account.data.currency);
      }
    }

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return {
      success: true,
      message: "Hesap başarıyla güncellendi",
    };
  } catch (error) {
    console.error("Error updating account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Hesap sil (soft delete)
 */
export const deleteAccount = async (accountId, userId) => {
  try {
    const docRef = doc(db, COLLECTION, accountId);
    
    await updateDoc(docRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Hesap başarıyla silindi",
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Hesap kalıcı olarak sil
 */
export const permanentDeleteAccount = async (accountId) => {
  try {
    await deleteDoc(doc(db, COLLECTION, accountId));

    return {
      success: true,
      message: "Hesap kalıcı olarak silindi",
    };
  } catch (error) {
    console.error("Error permanently deleting account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Tek hesap getir
 */
export const getAccount = async (accountId) => {
  try {
    const docRef = doc(db, COLLECTION, accountId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: "Hesap bulunamadı",
      };
    }

    return {
      success: true,
      data: {
        id: docSnap.id,
        ...docSnap.data(),
      },
    };
  } catch (error) {
    console.error("Error getting account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Tüm hesapları getir
 */
export const getAccounts = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    // Aktif hesapları getir (varsayılan)
    if (filters.isActive !== false) {
      constraints.push(where("isActive", "==", true));
    }

    // Tür filtresi
    if (filters.type) {
      constraints.push(where("type", "==", filters.type));
    }

    // Para birimi filtresi
    if (filters.currency) {
      constraints.push(where("currency", "==", filters.currency));
    }

    // Sıralama
    constraints.push(orderBy("name", "asc"));

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    const accounts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      data: accounts,
    };
  } catch (error) {
    console.error("Error getting accounts:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Para birimine göre varsayılan hesabı getir
 */
export const getDefaultAccount = async (currency = CURRENCY.TRY) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("isActive", "==", true),
      where("currency", "==", currency),
      where("isDefault", "==", true),
      limit(1)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return {
        success: false,
        error: "Varsayılan hesap bulunamadı",
      };
    }

    return {
      success: true,
      data: {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      },
    };
  } catch (error) {
    console.error("Error getting default account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Varsayılan hesap işaretini kaldır
 */
const clearDefaultAccount = async (currency) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("currency", "==", currency),
      where("isDefault", "==", true)
    );

    const snapshot = await getDocs(q);
    
    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isDefault: false })
    );

    await Promise.all(updates);
  } catch (error) {
    console.error("Error clearing default account:", error);
  }
};

// =============================================================================
// BAKİYE İŞLEMLERİ
// =============================================================================

/**
 * Hesap bakiyesini güncelle
 */
export const updateAccountBalance = async (accountId, amount, transactionType, userId) => {
  try {
    const account = await getAccount(accountId);
    if (!account.success) {
      return account;
    }

    let newBalance = account.data.currentBalance;

    switch (transactionType) {
      case TRANSACTION_TYPE.INCOME:
        newBalance += amount;
        break;
      case TRANSACTION_TYPE.EXPENSE:
        newBalance -= amount;
        break;
    }

    await updateDoc(doc(db, COLLECTION, accountId), {
      currentBalance: newBalance,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    console.error("Error updating account balance:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Hesaplar arası transfer
 */
export const transferBetweenAccounts = async (fromAccountId, toAccountId, amount, userId) => {
  try {
    const fromAccount = await getAccount(fromAccountId);
    const toAccount = await getAccount(toAccountId);

    if (!fromAccount.success || !toAccount.success) {
      return {
        success: false,
        error: "Hesap bulunamadı",
      };
    }

    // Kaynak hesap bakiyesi kontrolü
    if (fromAccount.data.currentBalance < amount) {
      return {
        success: false,
        error: "Yetersiz bakiye",
      };
    }

    // Kaynak hesaptan düş
    await updateDoc(doc(db, COLLECTION, fromAccountId), {
      currentBalance: fromAccount.data.currentBalance - amount,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    // Hedef hesaba ekle
    await updateDoc(doc(db, COLLECTION, toAccountId), {
      currentBalance: toAccount.data.currentBalance + amount,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return {
      success: true,
      message: "Transfer başarıyla gerçekleşti",
    };
  } catch (error) {
    console.error("Error transferring between accounts:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Toplam bakiye hesapla (para birimine göre)
 */
export const getTotalBalance = async (currency = null) => {
  try {
    const result = await getAccounts({ currency });
    
    if (!result.success) {
      return result;
    }

    const totals = {};

    result.data.forEach((account) => {
      if (!totals[account.currency]) {
        totals[account.currency] = 0;
      }
      totals[account.currency] += account.currentBalance;
    });

    return {
      success: true,
      data: totals,
    };
  } catch (error) {
    console.error("Error getting total balance:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Hesap istatistikleri
 */
export const getAccountStats = async () => {
  try {
    const result = await getAccounts();
    
    if (!result.success) {
      return result;
    }

    const stats = {
      totalAccounts: result.data.length,
      byType: {},
      byCurrency: {},
      totalBalances: {},
    };

    result.data.forEach((account) => {
      // Türe göre
      stats.byType[account.type] = (stats.byType[account.type] || 0) + 1;
      
      // Para birimine göre
      stats.byCurrency[account.currency] = (stats.byCurrency[account.currency] || 0) + 1;
      
      // Toplam bakiye
      if (!stats.totalBalances[account.currency]) {
        stats.totalBalances[account.currency] = 0;
      }
      stats.totalBalances[account.currency] += account.currentBalance;
    });

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error getting account stats:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
