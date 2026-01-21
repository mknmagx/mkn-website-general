/**
 * Finance Module - İşlem (Transaction) Servisi
 * 
 * Gelir/Gider işlemleri CRUD ve hesaplama fonksiyonları
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
  startAfter,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { 
  TRANSACTION_TYPE, 
  TRANSACTION_STATUS,
  CURRENCY,
  INCOME_CATEGORY,
  EXPENSE_CATEGORY,
} from "./schema";
import { updateAccountBalance, getAccount } from "./account-service";

const COLLECTION = "finance_transactions";

// =============================================================================
// İŞLEM CRUD
// =============================================================================

/**
 * İşlem numarası oluştur
 */
export const generateTransactionNumber = async (type) => {
  const prefix = type === TRANSACTION_TYPE.INCOME ? 'GEL' : 
                 type === TRANSACTION_TYPE.EXPENSE ? 'GID' : 'TRF';
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const q = query(
    collection(db, COLLECTION),
    where("type", "==", type),
    where("transactionNumber", ">=", `${prefix}-${year}${month}-`),
    where("transactionNumber", "<=", `${prefix}-${year}${month}-\uf8ff`),
    orderBy("transactionNumber", "desc"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastTx = snapshot.docs[0].data();
    const parts = lastTx.transactionNumber.split("-");
    nextNumber = parseInt(parts[2], 10) + 1;
  }
  
  return `${prefix}-${year}${month}-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Yeni işlem oluştur
 */
export const createTransaction = async (transactionData, userId) => {
  try {
    const transactionNumber = await generateTransactionNumber(transactionData.type);

    const newTransaction = {
      transactionNumber,
      type: transactionData.type,
      status: transactionData.status || TRANSACTION_STATUS.COMPLETED,
      
      // Kategori
      category: transactionData.category || null,
      subcategory: transactionData.subcategory || null,
      
      // Tutar
      amount: transactionData.amount,
      currency: transactionData.currency || CURRENCY.TRY,
      
      // Hesap bilgileri
      accountId: transactionData.accountId,
      accountName: transactionData.accountName || "",
      
      // Transfer için hedef hesap
      toAccountId: transactionData.toAccountId || null,
      toAccountName: transactionData.toAccountName || null,
      
      // İlişkiler
      customerId: transactionData.customerId || null,
      customerName: transactionData.customerName || null,
      companyId: transactionData.companyId || null,
      companyName: transactionData.companyName || null,
      orderId: transactionData.orderId || null,
      orderNumber: transactionData.orderNumber || null,
      personnelId: transactionData.personnelId || null,
      personnelName: transactionData.personnelName || null,
      
      // Detaylar
      description: transactionData.description || "",
      notes: transactionData.notes || "",
      reference: transactionData.reference || "", // Fatura no, çek no vb.
      
      // Tarih
      transactionDate: transactionData.transactionDate || Timestamp.now(),
      
      // Belgeler
      attachments: transactionData.attachments || [],
      
      // Meta
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    const docRef = await addDoc(collection(db, COLLECTION), newTransaction);

    // Hesap bakiyesini güncelle
    if (newTransaction.status === TRANSACTION_STATUS.COMPLETED) {
      if (newTransaction.type === TRANSACTION_TYPE.TRANSFER) {
        // Transfer: kaynak hesaptan düş, hedef hesaba ekle
        await updateAccountBalance(
          newTransaction.accountId, 
          newTransaction.amount, 
          TRANSACTION_TYPE.EXPENSE, 
          userId
        );
        await updateAccountBalance(
          newTransaction.toAccountId, 
          newTransaction.amount, 
          TRANSACTION_TYPE.INCOME, 
          userId
        );
      } else {
        await updateAccountBalance(
          newTransaction.accountId, 
          newTransaction.amount, 
          newTransaction.type, 
          userId
        );
      }
    }

    return {
      success: true,
      id: docRef.id,
      transactionNumber,
      message: "İşlem başarıyla kaydedildi",
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * İşlem güncelle
 */
export const updateTransaction = async (transactionId, updateData, userId) => {
  try {
    const docRef = doc(db, COLLECTION, transactionId);
    
    // Mevcut işlemi al
    const existing = await getTransaction(transactionId);
    if (!existing.success) {
      return existing;
    }

    // Tutar veya hesap değiştiyse bakiyeyi düzelt
    const oldTx = existing.data;
    const shouldUpdateBalance = 
      updateData.amount !== undefined && updateData.amount !== oldTx.amount ||
      updateData.accountId !== undefined && updateData.accountId !== oldTx.accountId ||
      updateData.status !== undefined && updateData.status !== oldTx.status;

    if (shouldUpdateBalance && oldTx.status === TRANSACTION_STATUS.COMPLETED) {
      // Eski işlemi geri al
      const reverseType = oldTx.type === TRANSACTION_TYPE.INCOME 
        ? TRANSACTION_TYPE.EXPENSE 
        : TRANSACTION_TYPE.INCOME;
      
      await updateAccountBalance(oldTx.accountId, oldTx.amount, reverseType, userId);
    }

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    // Yeni bakiyeyi uygula
    const newStatus = updateData.status || oldTx.status;
    if (shouldUpdateBalance && newStatus === TRANSACTION_STATUS.COMPLETED) {
      const newAmount = updateData.amount || oldTx.amount;
      const newAccountId = updateData.accountId || oldTx.accountId;
      const newType = updateData.type || oldTx.type;
      
      await updateAccountBalance(newAccountId, newAmount, newType, userId);
    }

    return {
      success: true,
      message: "İşlem başarıyla güncellendi",
    };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * İşlem sil
 */
export const deleteTransaction = async (transactionId, userId) => {
  try {
    const existing = await getTransaction(transactionId);
    if (!existing.success) {
      return existing;
    }

    const tx = existing.data;

    // Bakiyeyi geri al
    if (tx.status === TRANSACTION_STATUS.COMPLETED) {
      const reverseType = tx.type === TRANSACTION_TYPE.INCOME 
        ? TRANSACTION_TYPE.EXPENSE 
        : TRANSACTION_TYPE.INCOME;
      
      await updateAccountBalance(tx.accountId, tx.amount, reverseType, userId);
      
      // Transfer ise hedef hesabı da geri al
      if (tx.type === TRANSACTION_TYPE.TRANSFER && tx.toAccountId) {
        await updateAccountBalance(tx.toAccountId, tx.amount, TRANSACTION_TYPE.EXPENSE, userId);
      }
    }

    await deleteDoc(doc(db, COLLECTION, transactionId));

    return {
      success: true,
      message: "İşlem başarıyla silindi",
    };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Tek işlem getir
 */
export const getTransaction = async (transactionId) => {
  try {
    const docRef = doc(db, COLLECTION, transactionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: "İşlem bulunamadı",
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
    console.error("Error getting transaction:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * İşlemleri listele
 */
export const getTransactions = async (filters = {}, pagination = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    // Tür filtresi
    if (filters.type) {
      constraints.push(where("type", "==", filters.type));
    }

    // Kategori filtresi
    if (filters.category) {
      constraints.push(where("category", "==", filters.category));
    }

    // Hesap filtresi
    if (filters.accountId) {
      constraints.push(where("accountId", "==", filters.accountId));
    }

    // Müşteri filtresi
    if (filters.customerId) {
      constraints.push(where("customerId", "==", filters.customerId));
    }

    // Firma filtresi
    if (filters.companyId) {
      constraints.push(where("companyId", "==", filters.companyId));
    }

    // Personel filtresi
    if (filters.personnelId) {
      constraints.push(where("personnelId", "==", filters.personnelId));
    }

    // Para birimi filtresi
    if (filters.currency) {
      constraints.push(where("currency", "==", filters.currency));
    }

    // Durum filtresi
    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }

    // Tarih aralığı
    if (filters.startDate) {
      constraints.push(where("transactionDate", ">=", Timestamp.fromDate(new Date(filters.startDate))));
    }
    if (filters.endDate) {
      constraints.push(where("transactionDate", "<=", Timestamp.fromDate(new Date(filters.endDate))));
    }

    // Sıralama
    const sortField = filters.sortBy || "transactionDate";
    const sortOrder = filters.sortOrder || "desc";
    constraints.push(orderBy(sortField, sortOrder));

    // Limit
    if (pagination.limit) {
      constraints.push(limit(pagination.limit));
    }

    // Sayfalama
    if (pagination.startAfter) {
      constraints.push(startAfter(pagination.startAfter));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      data: transactions,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error("Error getting transactions:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// =============================================================================
// RAPORLAMA
// =============================================================================

/**
 * Gelir/Gider özeti (dönemsel)
 */
export const getIncomeExpenseSummary = async (startDate, endDate, currency = null) => {
  try {
    const start = Timestamp.fromDate(new Date(startDate));
    const end = Timestamp.fromDate(new Date(endDate));

    let constraints = [
      where("status", "==", TRANSACTION_STATUS.COMPLETED),
      where("transactionDate", ">=", start),
      where("transactionDate", "<=", end),
      orderBy("transactionDate", "desc"),
    ];

    if (currency) {
      constraints.push(where("currency", "==", currency));
    }

    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const summary = {
      totalIncome: {},
      totalExpense: {},
      netProfit: {},
      byCategory: {
        income: {},
        expense: {},
      },
      transactions: [],
    };

    snapshot.docs.forEach((doc) => {
      const tx = { id: doc.id, ...doc.data() };
      summary.transactions.push(tx);

      const curr = tx.currency;

      if (tx.type === TRANSACTION_TYPE.INCOME) {
        summary.totalIncome[curr] = (summary.totalIncome[curr] || 0) + tx.amount;
        
        if (tx.category) {
          if (!summary.byCategory.income[curr]) {
            summary.byCategory.income[curr] = {};
          }
          summary.byCategory.income[curr][tx.category] = 
            (summary.byCategory.income[curr][tx.category] || 0) + tx.amount;
        }
      } else if (tx.type === TRANSACTION_TYPE.EXPENSE) {
        summary.totalExpense[curr] = (summary.totalExpense[curr] || 0) + tx.amount;
        
        if (tx.category) {
          if (!summary.byCategory.expense[curr]) {
            summary.byCategory.expense[curr] = {};
          }
          summary.byCategory.expense[curr][tx.category] = 
            (summary.byCategory.expense[curr][tx.category] || 0) + tx.amount;
        }
      }
    });

    // Net kar hesapla
    Object.keys(summary.totalIncome).forEach((curr) => {
      summary.netProfit[curr] = 
        (summary.totalIncome[curr] || 0) - (summary.totalExpense[curr] || 0);
    });
    Object.keys(summary.totalExpense).forEach((curr) => {
      if (!summary.netProfit[curr]) {
        summary.netProfit[curr] = -(summary.totalExpense[curr] || 0);
      }
    });

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Error getting income/expense summary:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Aylık gelir/gider trendi
 */
export const getMonthlyTrend = async (year, currency = CURRENCY.TRY) => {
  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const q = query(
      collection(db, COLLECTION),
      where("status", "==", TRANSACTION_STATUS.COMPLETED),
      where("currency", "==", currency),
      where("transactionDate", ">=", Timestamp.fromDate(startDate)),
      where("transactionDate", "<=", Timestamp.fromDate(endDate)),
      orderBy("transactionDate", "asc"),
    );

    const snapshot = await getDocs(q);

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      net: 0,
    }));

    snapshot.docs.forEach((doc) => {
      const tx = doc.data();
      const txDate = tx.transactionDate.toDate();
      const monthIndex = txDate.getMonth();

      if (tx.type === TRANSACTION_TYPE.INCOME) {
        monthlyData[monthIndex].income += tx.amount;
      } else if (tx.type === TRANSACTION_TYPE.EXPENSE) {
        monthlyData[monthIndex].expense += tx.amount;
      }
    });

    monthlyData.forEach((m) => {
      m.net = m.income - m.expense;
    });

    return {
      success: true,
      data: monthlyData,
    };
  } catch (error) {
    console.error("Error getting monthly trend:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * İşlem istatistikleri
 */
export const getTransactionStats = async () => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonth, lastMonth] = await Promise.all([
      getIncomeExpenseSummary(thisMonthStart, thisMonthEnd),
      getIncomeExpenseSummary(lastMonthStart, lastMonthEnd),
    ]);

    return {
      success: true,
      data: {
        thisMonth: thisMonth.data,
        lastMonth: lastMonth.data,
      },
    };
  } catch (error) {
    console.error("Error getting transaction stats:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
