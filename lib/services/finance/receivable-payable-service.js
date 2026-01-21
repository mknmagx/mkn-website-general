/**
 * Finance Module - Alacak/Borç Servisi
 * 
 * Alacak ve borç takibi için CRUD işlemleri
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
import { 
  RECEIVABLE_STATUS, 
  PAYABLE_STATUS,
  CURRENCY,
  PAYMENT_METHOD,
} from "./schema";

const RECEIVABLES_COLLECTION = "finance_receivables";
const PAYABLES_COLLECTION = "finance_payables";

// =============================================================================
// ALACAK (RECEIVABLE) İŞLEMLERİ
// =============================================================================

/**
 * Alacak numarası oluştur
 */
const generateReceivableNumber = async () => {
  const year = new Date().getFullYear();
  
  const q = query(
    collection(db, RECEIVABLES_COLLECTION),
    where("receivableNumber", ">=", `ALC-${year}-`),
    where("receivableNumber", "<=", `ALC-${year}-\uf8ff`),
    orderBy("receivableNumber", "desc"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0].data();
    nextNumber = parseInt(last.receivableNumber.split("-")[2], 10) + 1;
  }
  
  return `ALC-${year}-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Yeni alacak oluştur
 */
export const createReceivable = async (data, userId) => {
  try {
    const receivableNumber = await generateReceivableNumber();

    const newReceivable = {
      receivableNumber,
      
      // İlişkiler
      customerId: data.customerId || null,
      customerName: data.customerName || "",
      companyId: data.companyId || null,
      companyName: data.companyName || "",
      orderId: data.orderId || null,
      orderNumber: data.orderNumber || null,
      
      // Tutar bilgileri
      amount: data.amount,
      currency: data.currency || CURRENCY.TRY,
      paidAmount: 0,
      remainingAmount: data.amount,
      
      // Durum
      status: RECEIVABLE_STATUS.PENDING,
      
      // Tarihler
      dueDate: data.dueDate || null,
      
      // Detaylar
      description: data.description || "",
      notes: data.notes || "",
      
      // Ödeme geçmişi
      payments: [],
      
      // Meta
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    const docRef = await addDoc(collection(db, RECEIVABLES_COLLECTION), newReceivable);

    return {
      success: true,
      id: docRef.id,
      receivableNumber,
      message: "Alacak kaydı oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating receivable:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Alacak güncelle
 */
export const updateReceivable = async (id, updateData, userId) => {
  try {
    await updateDoc(doc(db, RECEIVABLES_COLLECTION, id), {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Alacak güncellendi" };
  } catch (error) {
    console.error("Error updating receivable:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Alacağa tahsilat ekle
 */
export const addReceivablePayment = async (receivableId, paymentData, userId) => {
  try {
    const receivable = await getReceivable(receivableId);
    if (!receivable.success) return receivable;

    const payment = {
      id: Date.now().toString(),
      amount: paymentData.amount,
      method: paymentData.method || PAYMENT_METHOD.BANK_TRANSFER,
      date: paymentData.date || Timestamp.now(),
      accountId: paymentData.accountId || null,
      note: paymentData.note || "",
      createdBy: userId,
      createdAt: Timestamp.now(),
    };

    const newPaidAmount = receivable.data.paidAmount + payment.amount;
    const newRemainingAmount = receivable.data.amount - newPaidAmount;
    
    let newStatus = receivable.data.status;
    if (newRemainingAmount <= 0) {
      newStatus = RECEIVABLE_STATUS.COLLECTED;
    } else if (newPaidAmount > 0) {
      newStatus = RECEIVABLE_STATUS.PARTIAL;
    }

    await updateDoc(doc(db, RECEIVABLES_COLLECTION, receivableId), {
      payments: [...receivable.data.payments, payment],
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, newRemainingAmount),
      status: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Tahsilat eklendi" };
  } catch (error) {
    console.error("Error adding receivable payment:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Tek alacak getir
 */
export const getReceivable = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, RECEIVABLES_COLLECTION, id));
    if (!docSnap.exists()) {
      return { success: false, error: "Alacak bulunamadı" };
    }
    return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
  } catch (error) {
    console.error("Error getting receivable:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Alacakları listele
 */
export const getReceivables = async (filters = {}) => {
  try {
    let q = collection(db, RECEIVABLES_COLLECTION);
    const constraints = [];

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.customerId) {
      constraints.push(where("customerId", "==", filters.customerId));
    }
    if (filters.companyId) {
      constraints.push(where("companyId", "==", filters.companyId));
    }
    if (filters.currency) {
      constraints.push(where("currency", "==", filters.currency));
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    const receivables = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: receivables };
  } catch (error) {
    console.error("Error getting receivables:", error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Vadesi geçmiş alacakları kontrol et
 */
export const checkOverdueReceivables = async () => {
  try {
    const now = Timestamp.now();
    
    const q = query(
      collection(db, RECEIVABLES_COLLECTION),
      where("status", "in", [RECEIVABLE_STATUS.PENDING, RECEIVABLE_STATUS.PARTIAL]),
      where("dueDate", "<", now)
    );

    const snapshot = await getDocs(q);
    
    // Vadesi geçmişleri güncelle
    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { 
        status: RECEIVABLE_STATUS.OVERDUE,
        updatedAt: serverTimestamp(),
      })
    );

    await Promise.all(updates);

    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error("Error checking overdue receivables:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Alacak sil
 */
export const deleteReceivable = async (id) => {
  try {
    await deleteDoc(doc(db, RECEIVABLES_COLLECTION, id));
    return { success: true, message: "Alacak silindi" };
  } catch (error) {
    console.error("Error deleting receivable:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// BORÇ (PAYABLE) İŞLEMLERİ
// =============================================================================

/**
 * Borç numarası oluştur
 */
const generatePayableNumber = async () => {
  const year = new Date().getFullYear();
  
  const q = query(
    collection(db, PAYABLES_COLLECTION),
    where("payableNumber", ">=", `BRC-${year}-`),
    where("payableNumber", "<=", `BRC-${year}-\uf8ff`),
    orderBy("payableNumber", "desc"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0].data();
    nextNumber = parseInt(last.payableNumber.split("-")[2], 10) + 1;
  }
  
  return `BRC-${year}-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Yeni borç oluştur
 */
export const createPayable = async (data, userId) => {
  try {
    const payableNumber = await generatePayableNumber();

    const newPayable = {
      payableNumber,
      
      // İlişkiler - tedarikçi veya personel
      supplierId: data.supplierId || null,
      supplierName: data.supplierName || "",
      personnelId: data.personnelId || null,
      personnelName: data.personnelName || "",
      companyId: data.companyId || null,
      companyName: data.companyName || "",
      
      // Türü
      payableType: data.payableType || "supplier", // supplier, personnel, other
      
      // Tutar bilgileri
      amount: data.amount,
      currency: data.currency || CURRENCY.TRY,
      paidAmount: 0,
      remainingAmount: data.amount,
      
      // Durum
      status: PAYABLE_STATUS.PENDING,
      
      // Tarihler
      dueDate: data.dueDate || null,
      
      // Detaylar
      description: data.description || "",
      notes: data.notes || "",
      category: data.category || null,
      
      // Ödeme geçmişi
      payments: [],
      
      // Meta
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    const docRef = await addDoc(collection(db, PAYABLES_COLLECTION), newPayable);

    return {
      success: true,
      id: docRef.id,
      payableNumber,
      message: "Borç kaydı oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating payable:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Borç güncelle
 */
export const updatePayable = async (id, updateData, userId) => {
  try {
    await updateDoc(doc(db, PAYABLES_COLLECTION, id), {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Borç güncellendi" };
  } catch (error) {
    console.error("Error updating payable:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Borca ödeme ekle
 */
export const addPayablePayment = async (payableId, paymentData, userId) => {
  try {
    const payable = await getPayable(payableId);
    if (!payable.success) return payable;

    const payment = {
      id: Date.now().toString(),
      amount: paymentData.amount,
      method: paymentData.method || PAYMENT_METHOD.BANK_TRANSFER,
      date: paymentData.date || Timestamp.now(),
      accountId: paymentData.accountId || null,
      note: paymentData.note || "",
      createdBy: userId,
      createdAt: Timestamp.now(),
    };

    const newPaidAmount = payable.data.paidAmount + payment.amount;
    const newRemainingAmount = payable.data.amount - newPaidAmount;
    
    let newStatus = payable.data.status;
    if (newRemainingAmount <= 0) {
      newStatus = PAYABLE_STATUS.PAID;
    } else if (newPaidAmount > 0) {
      newStatus = PAYABLE_STATUS.PARTIAL;
    }

    await updateDoc(doc(db, PAYABLES_COLLECTION, payableId), {
      payments: [...payable.data.payments, payment],
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, newRemainingAmount),
      status: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Ödeme eklendi" };
  } catch (error) {
    console.error("Error adding payable payment:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Tek borç getir
 */
export const getPayable = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, PAYABLES_COLLECTION, id));
    if (!docSnap.exists()) {
      return { success: false, error: "Borç bulunamadı" };
    }
    return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
  } catch (error) {
    console.error("Error getting payable:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Borçları listele
 */
export const getPayables = async (filters = {}) => {
  try {
    let q = collection(db, PAYABLES_COLLECTION);
    const constraints = [];

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.payableType) {
      constraints.push(where("payableType", "==", filters.payableType));
    }
    if (filters.personnelId) {
      constraints.push(where("personnelId", "==", filters.personnelId));
    }
    if (filters.supplierId) {
      constraints.push(where("supplierId", "==", filters.supplierId));
    }
    if (filters.currency) {
      constraints.push(where("currency", "==", filters.currency));
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    const payables = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: payables };
  } catch (error) {
    console.error("Error getting payables:", error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Vadesi geçmiş borçları kontrol et
 */
export const checkOverduePayables = async () => {
  try {
    const now = Timestamp.now();
    
    const q = query(
      collection(db, PAYABLES_COLLECTION),
      where("status", "in", [PAYABLE_STATUS.PENDING, PAYABLE_STATUS.PARTIAL]),
      where("dueDate", "<", now)
    );

    const snapshot = await getDocs(q);
    
    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { 
        status: PAYABLE_STATUS.OVERDUE,
        updatedAt: serverTimestamp(),
      })
    );

    await Promise.all(updates);

    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error("Error checking overdue payables:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Borç sil
 */
export const deletePayable = async (id) => {
  try {
    await deleteDoc(doc(db, PAYABLES_COLLECTION, id));
    return { success: true, message: "Borç silindi" };
  } catch (error) {
    console.error("Error deleting payable:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// İSTATİSTİKLER
// =============================================================================

/**
 * Alacak/Borç özeti
 */
export const getReceivablePayableSummary = async () => {
  try {
    const [receivables, payables] = await Promise.all([
      getReceivables(),
      getPayables(),
    ]);

    const summary = {
      receivables: {
        total: {},
        collected: {},
        pending: {},
        overdue: {},
        count: 0,
      },
      payables: {
        total: {},
        paid: {},
        pending: {},
        overdue: {},
        count: 0,
      },
    };

    // Alacakları işle
    if (receivables.success) {
      summary.receivables.count = receivables.data.length;
      
      receivables.data.forEach((r) => {
        const curr = r.currency;
        summary.receivables.total[curr] = (summary.receivables.total[curr] || 0) + r.amount;
        summary.receivables.collected[curr] = (summary.receivables.collected[curr] || 0) + r.paidAmount;
        
        if (r.status === RECEIVABLE_STATUS.PENDING || r.status === RECEIVABLE_STATUS.PARTIAL) {
          summary.receivables.pending[curr] = (summary.receivables.pending[curr] || 0) + r.remainingAmount;
        }
        if (r.status === RECEIVABLE_STATUS.OVERDUE) {
          summary.receivables.overdue[curr] = (summary.receivables.overdue[curr] || 0) + r.remainingAmount;
        }
      });
    }

    // Borçları işle
    if (payables.success) {
      summary.payables.count = payables.data.length;
      
      payables.data.forEach((p) => {
        const curr = p.currency;
        summary.payables.total[curr] = (summary.payables.total[curr] || 0) + p.amount;
        summary.payables.paid[curr] = (summary.payables.paid[curr] || 0) + p.paidAmount;
        
        if (p.status === PAYABLE_STATUS.PENDING || p.status === PAYABLE_STATUS.PARTIAL) {
          summary.payables.pending[curr] = (summary.payables.pending[curr] || 0) + p.remainingAmount;
        }
        if (p.status === PAYABLE_STATUS.OVERDUE) {
          summary.payables.overdue[curr] = (summary.payables.overdue[curr] || 0) + p.remainingAmount;
        }
      });
    }

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error getting receivable/payable summary:", error);
    return { success: false, error: error.message };
  }
};
