/**
 * Finance Module - Hesap Yönetimi Servisi
 * 
 * Hesap CRUD işlemleri ve bakiye hesaplamaları
 * Multi-currency ve Single-currency hesap desteği
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
import { ACCOUNT_TYPE, ACCOUNT_MODE, CURRENCY, TRANSACTION_TYPE, createEmptyBalances, ALL_CURRENCIES } from "./schema";

const COLLECTION = "finance_accounts";

// =============================================================================
// HESAP CRUD
// =============================================================================

/**
 * Yeni hesap oluştur
 * @param {Object} accountData - Hesap verileri
 * @param {string} accountData.mode - 'single' veya 'multi'
 * @param {string} accountData.currency - Tek döviz modu için
 * @param {string[]} accountData.supportedCurrencies - Çoklu döviz modu için
 */
export const createAccount = async (accountData, userId) => {
  try {
    const isMultiCurrency = accountData.mode === ACCOUNT_MODE.MULTI;
    
    // Başlangıç bakiyeleri
    let balances = createEmptyBalances();
    let initialBalances = createEmptyBalances();
    
    if (isMultiCurrency) {
      // Multi-currency: Gönderilen başlangıç bakiyelerini kullan
      if (accountData.initialBalances) {
        Object.keys(accountData.initialBalances).forEach(currency => {
          balances[currency] = accountData.initialBalances[currency] || 0;
          initialBalances[currency] = accountData.initialBalances[currency] || 0;
        });
      }
    } else {
      // Single-currency: Sadece belirlenen döviz için bakiye
      const currency = accountData.currency || CURRENCY.TRY;
      balances[currency] = accountData.initialBalance || 0;
      initialBalances[currency] = accountData.initialBalance || 0;
    }

    const newAccount = {
      name: accountData.name,
      type: accountData.type || ACCOUNT_TYPE.BANK,
      mode: isMultiCurrency ? ACCOUNT_MODE.MULTI : ACCOUNT_MODE.SINGLE,
      
      // Tek döviz modu için ana döviz
      currency: accountData.currency || CURRENCY.TRY,
      
      // Çoklu döviz modu için desteklenen dövizler
      supportedCurrencies: isMultiCurrency 
        ? (accountData.supportedCurrencies || ALL_CURRENCIES)
        : [accountData.currency || CURRENCY.TRY],
      
      // Raporlama için varsayılan döviz
      defaultCurrency: accountData.defaultCurrency || accountData.currency || CURRENCY.TRY,
      
      // Banka bilgileri (banka hesapları için)
      bankName: accountData.bankName || "",
      iban: accountData.iban || "",
      accountNumber: accountData.accountNumber || "",
      branchCode: accountData.branchCode || "",
      
      // Bakiyeler (yeni multi-currency yapı)
      balances,
      initialBalances,
      
      // Geriye uyumluluk için (tek döviz hesaplar)
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
      await clearDefaultAccount(newAccount.defaultCurrency);
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
 * Hesap bakiyesini güncelle (multi-currency destekli)
 * @param {string} accountId - Hesap ID
 * @param {number} amount - Tutar
 * @param {string} transactionType - 'income' veya 'expense'
 * @param {string} userId - Kullanıcı ID
 * @param {string} currency - Para birimi (opsiyonel, belirtilmezse hesabın ana dövizi)
 */
export const updateAccountBalance = async (accountId, amount, transactionType, userId, currency = null) => {
  try {
    const account = await getAccount(accountId);
    if (!account.success) {
      return account;
    }

    const accountData = account.data;
    const targetCurrency = currency || accountData.currency || CURRENCY.TRY;
    
    // Bakiyeleri al (eski sistemle uyumluluk)
    let balances = accountData.balances || createEmptyBalances();
    
    // Eski tek bakiyeli sistemden migrate et
    if (!accountData.balances && accountData.currentBalance) {
      balances[accountData.currency] = accountData.currentBalance;
    }
    
    // Bakiyeyi güncelle
    let currentAmount = balances[targetCurrency] || 0;
    let newAmount = currentAmount;

    switch (transactionType) {
      case TRANSACTION_TYPE.INCOME:
        newAmount = currentAmount + amount;
        break;
      case TRANSACTION_TYPE.EXPENSE:
        newAmount = currentAmount - amount;
        break;
    }

    balances[targetCurrency] = newAmount;
    
    // Geriye uyumluluk için currentBalance'ı da güncelle (ana döviz için)
    const mainCurrencyBalance = balances[accountData.currency] || 0;

    await updateDoc(doc(db, COLLECTION, accountId), {
      balances,
      currentBalance: mainCurrencyBalance,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return {
      success: true,
      newBalance: newAmount,
      currency: targetCurrency,
      allBalances: balances,
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
 * Belirli bir döviz bakiyesini direkt ayarla
 */
export const setAccountBalance = async (accountId, currency, amount, userId) => {
  try {
    const account = await getAccount(accountId);
    if (!account.success) {
      return account;
    }

    let balances = account.data.balances || createEmptyBalances();
    balances[currency] = amount;
    
    const mainCurrencyBalance = balances[account.data.currency] || 0;

    await updateDoc(doc(db, COLLECTION, accountId), {
      balances,
      currentBalance: mainCurrencyBalance,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return {
      success: true,
      newBalance: amount,
      currency,
      allBalances: balances,
    };
  } catch (error) {
    console.error("Error setting account balance:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Hesap içi döviz çevirme (exchange)
 */
export const exchangeWithinAccount = async (accountId, fromCurrency, toCurrency, fromAmount, toAmount, exchangeRate, userId) => {
  try {
    const account = await getAccount(accountId);
    if (!account.success) {
      return account;
    }

    const accountData = account.data;
    
    // Multi-currency kontrolü
    if (accountData.mode !== ACCOUNT_MODE.MULTI) {
      return {
        success: false,
        error: "Bu hesap çoklu döviz desteklemiyor",
      };
    }

    let balances = accountData.balances || createEmptyBalances();
    
    // Yeterli bakiye kontrolü
    if ((balances[fromCurrency] || 0) < fromAmount) {
      return {
        success: false,
        error: `Yetersiz ${fromCurrency} bakiyesi`,
      };
    }

    // Çevirme işlemi
    balances[fromCurrency] = (balances[fromCurrency] || 0) - fromAmount;
    balances[toCurrency] = (balances[toCurrency] || 0) + toAmount;
    
    const mainCurrencyBalance = balances[accountData.currency] || 0;

    await updateDoc(doc(db, COLLECTION, accountId), {
      balances,
      currentBalance: mainCurrencyBalance,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return {
      success: true,
      fromCurrency,
      fromAmount,
      toCurrency,
      toAmount,
      exchangeRate,
      newBalances: balances,
    };
  } catch (error) {
    console.error("Error exchanging within account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Hesaplar arası transfer (aynı veya farklı döviz)
 */
export const transferBetweenAccounts = async (fromAccountId, toAccountId, amount, userId, fromCurrency = null, toCurrency = null, exchangeRate = 1) => {
  try {
    const fromAccount = await getAccount(fromAccountId);
    const toAccount = await getAccount(toAccountId);

    if (!fromAccount.success || !toAccount.success) {
      return {
        success: false,
        error: "Hesap bulunamadı",
      };
    }

    const sourceCurrency = fromCurrency || fromAccount.data.currency;
    const targetCurrency = toCurrency || toAccount.data.currency;
    
    // Kaynak hesap bakiyeleri
    let fromBalances = fromAccount.data.balances || createEmptyBalances();
    if (!fromAccount.data.balances && fromAccount.data.currentBalance) {
      fromBalances[fromAccount.data.currency] = fromAccount.data.currentBalance;
    }
    
    // Bakiye kontrolü
    if ((fromBalances[sourceCurrency] || 0) < amount) {
      return {
        success: false,
        error: "Yetersiz bakiye",
      };
    }

    // Hedef hesap bakiyeleri
    let toBalances = toAccount.data.balances || createEmptyBalances();
    if (!toAccount.data.balances && toAccount.data.currentBalance) {
      toBalances[toAccount.data.currency] = toAccount.data.currentBalance;
    }

    // Transfer tutarı (döviz farklıysa çevir)
    const transferAmount = sourceCurrency === targetCurrency 
      ? amount 
      : amount * exchangeRate;

    // Kaynaktan düş
    fromBalances[sourceCurrency] = (fromBalances[sourceCurrency] || 0) - amount;
    const fromMainBalance = fromBalances[fromAccount.data.currency] || 0;

    await updateDoc(doc(db, COLLECTION, fromAccountId), {
      balances: fromBalances,
      currentBalance: fromMainBalance,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    // Hedefe ekle
    toBalances[targetCurrency] = (toBalances[targetCurrency] || 0) + transferAmount;
    const toMainBalance = toBalances[toAccount.data.currency] || 0;

    await updateDoc(doc(db, COLLECTION, toAccountId), {
      balances: toBalances,
      currentBalance: toMainBalance,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return {
      success: true,
      message: "Transfer başarıyla gerçekleşti",
      fromCurrency: sourceCurrency,
      toCurrency: targetCurrency,
      amount,
      transferredAmount: transferAmount,
      exchangeRate: sourceCurrency !== targetCurrency ? exchangeRate : null,
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
 * Toplam bakiye hesapla (tüm hesaplardaki tüm dövizler)
 * Multi-currency hesapları da dahil eder
 */
export const getTotalBalance = async (currency = null) => {
  try {
    const result = await getAccounts({});
    
    if (!result.success) {
      return result;
    }

    const totals = createEmptyBalances();

    result.data.forEach((account) => {
      // Multi-currency hesap
      if (account.balances) {
        Object.entries(account.balances).forEach(([curr, amount]) => {
          if (amount && (!currency || curr === currency)) {
            totals[curr] = (totals[curr] || 0) + amount;
          }
        });
      } 
      // Eski tek dövizli hesap
      else if (account.currentBalance) {
        const curr = account.currency || CURRENCY.TRY;
        if (!currency || curr === currency) {
          totals[curr] = (totals[curr] || 0) + account.currentBalance;
        }
      }
    });

    // Sıfır olanları temizle
    Object.keys(totals).forEach(curr => {
      if (totals[curr] === 0) delete totals[curr];
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
 * Hesap istatistikleri (multi-currency destekli)
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
      byMode: { single: 0, multi: 0 },
      totalBalances: createEmptyBalances(),
    };

    result.data.forEach((account) => {
      // Türe göre
      stats.byType[account.type] = (stats.byType[account.type] || 0) + 1;
      
      // Ana para birimine göre
      stats.byCurrency[account.currency] = (stats.byCurrency[account.currency] || 0) + 1;
      
      // Mode'a göre
      const mode = account.mode || ACCOUNT_MODE.SINGLE;
      stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;
      
      // Toplam bakiyeler (tüm dövizler)
      if (account.balances) {
        Object.entries(account.balances).forEach(([curr, amount]) => {
          if (amount) {
            stats.totalBalances[curr] = (stats.totalBalances[curr] || 0) + amount;
          }
        });
      } else if (account.currentBalance) {
        const curr = account.currency || CURRENCY.TRY;
        stats.totalBalances[curr] = (stats.totalBalances[curr] || 0) + account.currentBalance;
      }
    });

    // Sıfır bakiyeleri temizle
    Object.keys(stats.totalBalances).forEach(curr => {
      if (stats.totalBalances[curr] === 0) delete stats.totalBalances[curr];
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

/**
 * Belirli bir hesabın tüm döviz bakiyelerini getir
 */
export const getAccountBalances = async (accountId) => {
  try {
    const account = await getAccount(accountId);
    if (!account.success) {
      return account;
    }

    const accountData = account.data;
    let balances = accountData.balances || createEmptyBalances();
    
    // Eski sistemden migrate et
    if (!accountData.balances && accountData.currentBalance) {
      balances[accountData.currency] = accountData.currentBalance;
    }

    // Sadece sıfır olmayan bakiyeleri döndür
    const nonZeroBalances = {};
    Object.entries(balances).forEach(([curr, amount]) => {
      if (amount !== 0) {
        nonZeroBalances[curr] = amount;
      }
    });

    return {
      success: true,
      data: {
        accountId,
        accountName: accountData.name,
        mode: accountData.mode || ACCOUNT_MODE.SINGLE,
        mainCurrency: accountData.currency,
        balances: nonZeroBalances,
        allBalances: balances,
      },
    };
  } catch (error) {
    console.error("Error getting account balances:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
