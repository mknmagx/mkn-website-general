/**
 * Finance Module - Personel ve Maaş/Avans Servisi
 * 
 * Personel yönetimi, maaş bordrosu ve avans takibi
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
  PERSONNEL_STATUS,
  ADVANCE_STATUS,
  SALARY_STATUS,
  CURRENCY,
} from "./schema";

const PERSONNEL_COLLECTION = "finance_personnel";
const SALARIES_COLLECTION = "finance_salaries";
const ADVANCES_COLLECTION = "finance_advances";
const USERS_COLLECTION = "users";

// =============================================================================
// KULLANICI BAĞLANTI FONKSİYONLARI
// =============================================================================

/**
 * Kullanıcı dokümanını personel bilgileriyle güncelle
 */
const updateUserFinanceLink = async (userId, personnelId, personnelNumber) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      financePersonnelId: personnelId,
      financePersonnelNumber: personnelNumber,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user finance link:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Kullanıcı dokümanından personel bağlantısını kaldır
 */
const removeUserFinanceLink = async (userId) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      financePersonnelId: null,
      financePersonnelNumber: null,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error removing user finance link:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Kullanıcının personel kaydını getir
 */
export const getPersonnelByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, PERSONNEL_COLLECTION),
      where("linkedUserId", "==", userId),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { success: false, error: "Personel kaydı bulunamadı", data: null };
    }
    
    const doc = snapshot.docs[0];
    return { 
      success: true, 
      data: { id: doc.id, ...doc.data() } 
    };
  } catch (error) {
    console.error("Error getting personnel by user id:", error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Personelin finans özetini getir (maaş ve avans bilgileri)
 */
export const getPersonnelFinanceSummary = async (personnelId) => {
  try {
    // Personel bilgisi
    const personnelResult = await getPersonnel(personnelId);
    if (!personnelResult.success) {
      return personnelResult;
    }
    
    // Maaş geçmişi
    const salariesQuery = query(
      collection(db, SALARIES_COLLECTION),
      where("personnelId", "==", personnelId),
      orderBy("period", "desc"),
      limit(12)
    );
    const salariesSnap = await getDocs(salariesQuery);
    const salaries = salariesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Avans geçmişi
    const advancesQuery = query(
      collection(db, ADVANCES_COLLECTION),
      where("personnelId", "==", personnelId),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const advancesSnap = await getDocs(advancesQuery);
    const advances = advancesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Özet hesaplamalar
    const totalPaidSalaries = salaries
      .filter(s => s.status === SALARY_STATUS.PAID)
      .reduce((sum, s) => sum + (s.netSalary || 0), 0);
    
    const pendingAdvances = advances
      .filter(a => a.status !== ADVANCE_STATUS.FULLY_DEDUCTED)
      .reduce((sum, a) => sum + (a.remainingAmount || 0), 0);
    
    const totalAdvances = advances.reduce((sum, a) => sum + (a.amount || 0), 0);
    
    return {
      success: true,
      data: {
        personnel: personnelResult.data,
        salaries,
        advances,
        summary: {
          totalPaidSalaries,
          pendingAdvances,
          totalAdvances,
          salaryCount: salaries.length,
          advanceCount: advances.length,
        }
      }
    };
  } catch (error) {
    console.error("Error getting personnel finance summary:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// PERSONEL İŞLEMLERİ
// =============================================================================

/**
 * Personel numarası oluştur
 */
const generatePersonnelNumber = async () => {
  const q = query(
    collection(db, PERSONNEL_COLLECTION),
    orderBy("personnelNumber", "desc"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0].data();
    if (last.personnelNumber) {
      nextNumber = parseInt(last.personnelNumber.replace("PRS-", ""), 10) + 1;
    }
  }
  
  return `PRS-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Yeni personel oluştur
 */
export const createPersonnel = async (data, userId) => {
  try {
    const personnelNumber = await generatePersonnelNumber();

    const newPersonnel = {
      personnelNumber,
      
      // Sistem kullanıcısı bağlantısı
      linkedUserId: data.linkedUserId || null,  // Sistemdeki kullanıcı ID'si
      
      // Kişisel bilgiler
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      tcNo: data.tcNo || "",
      birthDate: data.birthDate || null,
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      
      // İş bilgileri
      department: data.department || "",
      position: data.position || "",
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      
      // Maaş bilgileri
      baseSalary: data.baseSalary || 0,
      currency: data.currency || CURRENCY.TRY,
      salaryCurrency: data.salaryCurrency || data.currency || CURRENCY.TRY,
      
      // Banka bilgileri
      bankName: data.bankName || "",
      iban: data.iban || "",
      
      // Durum
      status: data.status || PERSONNEL_STATUS.ACTIVE,
      
      // İstatistikler (hesaplanır)
      stats: {
        totalAdvances: 0,          // Toplam verilen avans
        pendingAdvances: 0,        // Kesilmemiş avans
        totalSalariesPaid: 0,      // Ödenen toplam maaş
      },
      
      // Notlar
      notes: data.notes || "",
      
      // Meta
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    const docRef = await addDoc(collection(db, PERSONNEL_COLLECTION), newPersonnel);

    // Eğer bir kullanıcıya bağlandıysa, kullanıcı dokümanını güncelle
    if (data.linkedUserId) {
      await updateUserFinanceLink(data.linkedUserId, docRef.id, personnelNumber);
    }

    return {
      success: true,
      id: docRef.id,
      personnelNumber,
      message: "Personel kaydı oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating personnel:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Personel güncelle
 */
export const updatePersonnel = async (id, updateData, userId) => {
  try {
    // Mevcut personel bilgisini al
    const personnelResult = await getPersonnel(id);
    if (!personnelResult.success) {
      return personnelResult;
    }
    const currentPersonnel = personnelResult.data;

    // fullName güncelle
    if (updateData.firstName || updateData.lastName) {
      const firstName = updateData.firstName || currentPersonnel.firstName;
      const lastName = updateData.lastName || currentPersonnel.lastName;
      updateData.fullName = `${firstName} ${lastName}`;
    }

    // Kullanıcı bağlantısı değiştiyse
    if (updateData.linkedUserId !== undefined && 
        updateData.linkedUserId !== currentPersonnel.linkedUserId) {
      
      // Eski bağlantıyı kaldır
      if (currentPersonnel.linkedUserId) {
        await removeUserFinanceLink(currentPersonnel.linkedUserId);
      }
      
      // Yeni bağlantı ekle
      if (updateData.linkedUserId) {
        await updateUserFinanceLink(
          updateData.linkedUserId, 
          id, 
          currentPersonnel.personnelNumber
        );
      }
    }

    await updateDoc(doc(db, PERSONNEL_COLLECTION, id), {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Personel güncellendi" };
  } catch (error) {
    console.error("Error updating personnel:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Tek personel getir
 */
export const getPersonnel = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, PERSONNEL_COLLECTION, id));
    if (!docSnap.exists()) {
      return { success: false, error: "Personel bulunamadı" };
    }
    return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
  } catch (error) {
    console.error("Error getting personnel:", error);
    return { success: false, error: error.message };
  }
};

// Alias for getPersonnel
export const getPersonnelById = getPersonnel;

/**
 * Personelleri listele
 */
export const getPersonnelList = async (filters = {}) => {
  try {
    let q = collection(db, PERSONNEL_COLLECTION);
    const constraints = [];

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.department) {
      constraints.push(where("department", "==", filters.department));
    }

    constraints.push(orderBy("fullName", "asc"));

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    const personnel = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: personnel };
  } catch (error) {
    console.error("Error getting personnel list:", error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Personel sil (soft delete)
 */
export const deletePersonnel = async (id, userId) => {
  try {
    await updateDoc(doc(db, PERSONNEL_COLLECTION, id), {
      status: PERSONNEL_STATUS.TERMINATED,
      endDate: Timestamp.now(),
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Personel kaydı sonlandırıldı" };
  } catch (error) {
    console.error("Error deleting personnel:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// AVANS İŞLEMLERİ
// =============================================================================

/**
 * Avans numarası oluştur
 */
const generateAdvanceNumber = async () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const q = query(
    collection(db, ADVANCES_COLLECTION),
    where("advanceNumber", ">=", `AVS-${year}${month}-`),
    where("advanceNumber", "<=", `AVS-${year}${month}-\uf8ff`),
    orderBy("advanceNumber", "desc"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0].data();
    nextNumber = parseInt(last.advanceNumber.split("-")[2], 10) + 1;
  }
  
  return `AVS-${year}${month}-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Yeni avans oluştur
 */
export const createAdvance = async (data, userId) => {
  try {
    const advanceNumber = await generateAdvanceNumber();

    const newAdvance = {
      advanceNumber,
      
      // Personel bilgileri
      personnelId: data.personnelId,
      personnelName: data.personnelName || "",
      personnelNumber: data.personnelNumber || "",
      
      // Tutar
      amount: data.amount,
      currency: data.currency || CURRENCY.TRY,
      
      // Kesinti bilgileri
      deductedAmount: 0,
      remainingAmount: data.amount,
      
      // Durum
      status: ADVANCE_STATUS.PENDING,
      
      // Tarihler
      requestDate: data.requestDate || Timestamp.now(),
      approvedAt: null,
      paidAt: null,
      
      // Detaylar
      reason: data.reason || "",
      notes: data.notes || "",
      
      // Ödeme planı
      deductionPlan: data.deductionPlan || "single", // single, monthly
      monthlyDeduction: data.monthlyDeduction || data.amount,
      
      // Kesinti geçmişi
      deductions: [],
      
      // Meta
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    const docRef = await addDoc(collection(db, ADVANCES_COLLECTION), newAdvance);

    return {
      success: true,
      id: docRef.id,
      advanceNumber,
      message: "Avans talebi oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating advance:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Avans onayla
 */
export const approveAdvance = async (id, userId) => {
  try {
    await updateDoc(doc(db, ADVANCES_COLLECTION, id), {
      status: ADVANCE_STATUS.APPROVED,
      approvedAt: serverTimestamp(),
      approvedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Avans onaylandı" };
  } catch (error) {
    console.error("Error approving advance:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Avans öde
 */
export const payAdvance = async (id, paymentData, userId) => {
  try {
    const advance = await getAdvance(id);
    if (!advance.success) return advance;

    // Personel stats güncelle
    await updatePersonnelAdvanceStats(advance.data.personnelId, advance.data.amount, "add");

    await updateDoc(doc(db, ADVANCES_COLLECTION, id), {
      status: ADVANCE_STATUS.PAID,
      paidAt: serverTimestamp(),
      paidBy: userId,
      accountId: paymentData.accountId || null,
      paymentMethod: paymentData.method || null,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Avans ödendi" };
  } catch (error) {
    console.error("Error paying advance:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Avanstan kesinti yap (maaştan)
 */
export const deductFromAdvance = async (advanceId, deductionData, userId) => {
  try {
    const advance = await getAdvance(advanceId);
    if (!advance.success) return advance;

    const deduction = {
      id: Date.now().toString(),
      amount: deductionData.amount,
      salaryId: deductionData.salaryId || null,
      period: deductionData.period || null, // "2026-01" format
      date: Timestamp.now(),
      createdBy: userId,
    };

    const newDeductedAmount = advance.data.deductedAmount + deduction.amount;
    const newRemainingAmount = advance.data.amount - newDeductedAmount;
    
    const newStatus = newRemainingAmount <= 0 
      ? ADVANCE_STATUS.DEDUCTED 
      : advance.data.status;

    await updateDoc(doc(db, ADVANCES_COLLECTION, advanceId), {
      deductions: [...advance.data.deductions, deduction],
      deductedAmount: newDeductedAmount,
      remainingAmount: Math.max(0, newRemainingAmount),
      status: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    // Personel stats güncelle
    if (newStatus === ADVANCE_STATUS.DEDUCTED) {
      await updatePersonnelAdvanceStats(advance.data.personnelId, advance.data.amount, "clear");
    }

    return { success: true, message: "Kesinti yapıldı" };
  } catch (error) {
    console.error("Error deducting from advance:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Tek avans getir
 */
export const getAdvance = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, ADVANCES_COLLECTION, id));
    if (!docSnap.exists()) {
      return { success: false, error: "Avans bulunamadı" };
    }
    return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
  } catch (error) {
    console.error("Error getting advance:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Avansları listele
 */
export const getAdvances = async (filters = {}) => {
  try {
    let q = collection(db, ADVANCES_COLLECTION);
    const constraints = [];

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.personnelId) {
      constraints.push(where("personnelId", "==", filters.personnelId));
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    const advances = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: advances };
  } catch (error) {
    console.error("Error getting advances:", error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Belirli bir personelin avanslarını getir
 */
export const getAdvancesByPersonnel = async (personnelId) => {
  return getAdvances({ personnelId });
};

/**
 * Personelin bekleyen avanslarını getir
 */
export const getPendingAdvancesByPersonnel = async (personnelId) => {
  try {
    const q = query(
      collection(db, ADVANCES_COLLECTION),
      where("personnelId", "==", personnelId),
      where("status", "==", ADVANCE_STATUS.PAID),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);
    const advances = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalRemaining = advances.reduce((sum, a) => sum + a.remainingAmount, 0);

    return { 
      success: true, 
      data: advances,
      totalRemaining,
    };
  } catch (error) {
    console.error("Error getting pending advances:", error);
    return { success: false, error: error.message, data: [], totalRemaining: 0 };
  }
};

/**
 * Personel avans istatistiklerini güncelle
 */
const updatePersonnelAdvanceStats = async (personnelId, amount, action) => {
  try {
    const personnel = await getPersonnel(personnelId);
    if (!personnel.success) return;

    const stats = personnel.data.stats || { totalAdvances: 0, pendingAdvances: 0, totalSalariesPaid: 0 };

    if (action === "add") {
      stats.totalAdvances += amount;
      stats.pendingAdvances += amount;
    } else if (action === "clear") {
      stats.pendingAdvances = Math.max(0, stats.pendingAdvances - amount);
    }

    await updateDoc(doc(db, PERSONNEL_COLLECTION, personnelId), {
      stats,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating personnel advance stats:", error);
  }
};

/**
 * Avans iptal
 */
export const cancelAdvance = async (id, userId) => {
  try {
    await updateDoc(doc(db, ADVANCES_COLLECTION, id), {
      status: ADVANCE_STATUS.CANCELLED,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Avans iptal edildi" };
  } catch (error) {
    console.error("Error cancelling advance:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// MAAŞ BORDROSU İŞLEMLERİ
// =============================================================================

/**
 * Maaş bordrosu numarası oluştur
 */
const generateSalaryNumber = async (year, month) => {
  const q = query(
    collection(db, SALARIES_COLLECTION),
    where("salaryNumber", ">=", `MAS-${year}${String(month).padStart(2, '0')}-`),
    where("salaryNumber", "<=", `MAS-${year}${String(month).padStart(2, '0')}-\uf8ff`),
    orderBy("salaryNumber", "desc"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const last = snapshot.docs[0].data();
    nextNumber = parseInt(last.salaryNumber.split("-")[2], 10) + 1;
  }
  
  return `MAS-${year}${String(month).padStart(2, '0')}-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Yeni maaş bordrosu oluştur
 */
export const createSalary = async (data, userId) => {
  try {
    const salaryNumber = await generateSalaryNumber(data.year, data.month);

    // Bekleyen avansları al
    const pendingAdvances = await getPendingAdvancesByPersonnel(data.personnelId);
    
    // Avans kesintisi hesapla
    let advanceDeduction = 0;
    const advanceDeductions = [];
    
    if (pendingAdvances.success && pendingAdvances.data.length > 0) {
      // Varsayılan olarak tüm bekleyen avansları kes
      // veya data.advanceDeduction ile özel bir tutar belirlenebilir
      advanceDeduction = data.advanceDeduction !== undefined 
        ? data.advanceDeduction 
        : pendingAdvances.totalRemaining;
      
      pendingAdvances.data.forEach((adv) => {
        if (advanceDeduction > 0) {
          const deductAmount = Math.min(adv.remainingAmount, advanceDeduction);
          if (deductAmount > 0) {
            advanceDeductions.push({
              advanceId: adv.id,
              advanceNumber: adv.advanceNumber,
              amount: deductAmount,
            });
            advanceDeduction -= deductAmount;
          }
        }
      });
    }

    const totalAdvanceDeduction = advanceDeductions.reduce((sum, d) => sum + d.amount, 0);

    const newSalary = {
      salaryNumber,
      
      // Dönem
      year: data.year,
      month: data.month,
      period: `${data.year}-${String(data.month).padStart(2, '0')}`,
      
      // Personel bilgileri
      personnelId: data.personnelId,
      personnelName: data.personnelName || "",
      personnelNumber: data.personnelNumber || "",
      
      // Temel maaş
      baseSalary: data.baseSalary || 0,
      currency: data.currency || CURRENCY.TRY,
      
      // Eklemeler
      bonus: data.bonus || 0,
      overtime: data.overtime || 0,
      otherAdditions: data.otherAdditions || 0,
      
      // Kesintiler
      advanceDeduction: totalAdvanceDeduction,
      advanceDeductions, // Detaylı avans kesintileri
      taxDeduction: data.taxDeduction || 0,
      sskDeduction: data.sskDeduction || 0,
      otherDeductions: data.otherDeductions || 0,
      
      // Hesaplamalar
      grossSalary: 0,
      totalDeductions: 0,
      netSalary: 0,
      
      // Durum
      status: SALARY_STATUS.DRAFT,
      
      // Ödeme bilgileri
      paidAt: null,
      paidBy: null,
      accountId: null,
      
      // Notlar
      notes: data.notes || "",
      
      // Meta
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    // Hesapla
    newSalary.grossSalary = newSalary.baseSalary + newSalary.bonus + newSalary.overtime + newSalary.otherAdditions;
    newSalary.totalDeductions = newSalary.advanceDeduction + newSalary.taxDeduction + newSalary.sskDeduction + newSalary.otherDeductions;
    newSalary.netSalary = newSalary.grossSalary - newSalary.totalDeductions;

    const docRef = await addDoc(collection(db, SALARIES_COLLECTION), newSalary);

    return {
      success: true,
      id: docRef.id,
      salaryNumber,
      message: "Maaş bordrosu oluşturuldu",
    };
  } catch (error) {
    console.error("Error creating salary:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Maaş bordrosu güncelle
 */
export const updateSalary = async (id, updateData, userId) => {
  try {
    const salary = await getSalary(id);
    if (!salary.success) return salary;

    // Yeniden hesapla
    const updated = { ...salary.data, ...updateData };
    updated.grossSalary = updated.baseSalary + updated.bonus + updated.overtime + updated.otherAdditions;
    updated.totalDeductions = updated.advanceDeduction + updated.taxDeduction + updated.sskDeduction + updated.otherDeductions;
    updated.netSalary = updated.grossSalary - updated.totalDeductions;

    await updateDoc(doc(db, SALARIES_COLLECTION, id), {
      ...updateData,
      grossSalary: updated.grossSalary,
      totalDeductions: updated.totalDeductions,
      netSalary: updated.netSalary,
      status: SALARY_STATUS.CALCULATED,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Maaş bordrosu güncellendi" };
  } catch (error) {
    console.error("Error updating salary:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Maaş bordrosu onayla
 */
export const approveSalary = async (id, userId) => {
  try {
    await updateDoc(doc(db, SALARIES_COLLECTION, id), {
      status: SALARY_STATUS.APPROVED,
      approvedAt: serverTimestamp(),
      approvedBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Maaş bordrosu onaylandı" };
  } catch (error) {
    console.error("Error approving salary:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Maaş öde
 */
export const paySalary = async (id, paymentData, userId) => {
  try {
    const salary = await getSalary(id);
    if (!salary.success) return salary;

    // Avans kesintilerini işle
    if (salary.data.advanceDeductions && salary.data.advanceDeductions.length > 0) {
      for (const ad of salary.data.advanceDeductions) {
        await deductFromAdvance(ad.advanceId, {
          amount: ad.amount,
          salaryId: id,
          period: salary.data.period,
        }, userId);
      }
    }

    // Personel stats güncelle
    const personnel = await getPersonnel(salary.data.personnelId);
    if (personnel.success) {
      const stats = personnel.data.stats || { totalAdvances: 0, pendingAdvances: 0, totalSalariesPaid: 0 };
      stats.totalSalariesPaid += salary.data.netSalary;
      
      await updateDoc(doc(db, PERSONNEL_COLLECTION, salary.data.personnelId), {
        stats,
        updatedAt: serverTimestamp(),
      });
    }

    await updateDoc(doc(db, SALARIES_COLLECTION, id), {
      status: SALARY_STATUS.PAID,
      paidAt: serverTimestamp(),
      paidBy: userId,
      accountId: paymentData.accountId || null,
      paymentMethod: paymentData.method || null,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    return { success: true, message: "Maaş ödendi" };
  } catch (error) {
    console.error("Error paying salary:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Tek maaş bordrosu getir
 */
export const getSalary = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, SALARIES_COLLECTION, id));
    if (!docSnap.exists()) {
      return { success: false, error: "Maaş bordrosu bulunamadı" };
    }
    return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
  } catch (error) {
    console.error("Error getting salary:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Maaş bordrolarını listele
 */
export const getSalaries = async (filters = {}) => {
  try {
    let q = collection(db, SALARIES_COLLECTION);
    const constraints = [];

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.personnelId) {
      constraints.push(where("personnelId", "==", filters.personnelId));
    }
    if (filters.period) {
      constraints.push(where("period", "==", filters.period));
    }
    if (filters.year) {
      constraints.push(where("year", "==", filters.year));
    }
    if (filters.month) {
      constraints.push(where("month", "==", filters.month));
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    const salaries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: salaries };
  } catch (error) {
    console.error("Error getting salaries:", error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Belirli bir personelin maaş bordrolarını getir
 */
export const getSalariesByPersonnel = async (personnelId) => {
  return getSalaries({ personnelId });
};

/**
 * Maaş bordrosu sil
 */
export const deleteSalary = async (id) => {
  try {
    await deleteDoc(doc(db, SALARIES_COLLECTION, id));
    return { success: true, message: "Maaş bordrosu silindi" };
  } catch (error) {
    console.error("Error deleting salary:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// İSTATİSTİKLER
// =============================================================================

/**
 * Personel özeti
 */
export const getPersonnelSummary = async () => {
  try {
    const [personnelResult, advancesResult, salariesResult] = await Promise.all([
      getPersonnelList(),
      getAdvances(),
      getSalaries(),
    ]);

    const summary = {
      personnel: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      advances: {
        total: 0,
        pending: 0,
        paid: 0,
        totalAmount: {},
        pendingAmount: {},
      },
      salaries: {
        total: 0,
        paid: 0,
        pending: 0,
        totalPaid: {},
      },
    };

    if (personnelResult.success) {
      summary.personnel.total = personnelResult.data.length;
      summary.personnel.active = personnelResult.data.filter(p => p.status === PERSONNEL_STATUS.ACTIVE).length;
      summary.personnel.inactive = summary.personnel.total - summary.personnel.active;
    }

    if (advancesResult.success) {
      summary.advances.total = advancesResult.data.length;
      
      advancesResult.data.forEach((adv) => {
        const curr = adv.currency;
        summary.advances.totalAmount[curr] = (summary.advances.totalAmount[curr] || 0) + adv.amount;
        
        if (adv.status === ADVANCE_STATUS.PAID) {
          summary.advances.paid += 1;
          summary.advances.pendingAmount[curr] = (summary.advances.pendingAmount[curr] || 0) + adv.remainingAmount;
        }
        if (adv.status === ADVANCE_STATUS.PENDING || adv.status === ADVANCE_STATUS.APPROVED) {
          summary.advances.pending += 1;
        }
      });
    }

    if (salariesResult.success) {
      summary.salaries.total = salariesResult.data.length;
      
      salariesResult.data.forEach((sal) => {
        const curr = sal.currency;
        
        if (sal.status === SALARY_STATUS.PAID) {
          summary.salaries.paid += 1;
          summary.salaries.totalPaid[curr] = (summary.salaries.totalPaid[curr] || 0) + sal.netSalary;
        } else {
          summary.salaries.pending += 1;
        }
      });
    }

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error getting personnel summary:", error);
    return { success: false, error: error.message };
  }
};
