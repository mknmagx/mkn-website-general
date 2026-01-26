/**
 * CRM v2 - Merkezi Hatırlatma Servisi
 * 
 * Bu servis, tüm CRM modüllerinden gelen hatırlatmaları merkezi olarak yönetir.
 * Hatırlatmalar hem kaynak entity'ye (case, customer vb.) hem de merkezi koleksiyona kaydedilir.
 * 
 * Koleksiyon: crm_reminders
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS, REMINDER_STATUS, REMINDER_TYPE, ACTIVITY_TYPE } from "./schema";
import { logActivity } from "./activity-service";

// =============================================================================
// ENTITY TYPES - Hatırlatmanın Bağlı Olduğu Entity Türleri
// =============================================================================
export const REMINDER_ENTITY_TYPE = {
  CASE: 'case',
  CUSTOMER: 'customer',
  CONVERSATION: 'conversation',
  ORDER: 'order',
  GENERAL: 'general', // Belirli bir entity'ye bağlı olmayan
};

export const getEntityTypeLabel = (type) => {
  const labels = {
    [REMINDER_ENTITY_TYPE.CASE]: 'Talep',
    [REMINDER_ENTITY_TYPE.CUSTOMER]: 'Müşteri',
    [REMINDER_ENTITY_TYPE.CONVERSATION]: 'Konuşma',
    [REMINDER_ENTITY_TYPE.ORDER]: 'Sipariş',
    [REMINDER_ENTITY_TYPE.GENERAL]: 'Genel',
  };
  return labels[type] || type;
};

// =============================================================================
// CREATE REMINDER
// =============================================================================

/**
 * Yeni hatırlatma oluştur
 * @param {Object} reminderData - Hatırlatma bilgileri
 * @returns {Object} - Oluşturulan hatırlatma
 */
export const createReminder = async (reminderData) => {
  try {
    const now = serverTimestamp();
    
    const newReminder = {
      // Temel bilgiler
      title: reminderData.title || '',
      description: reminderData.description || '',
      type: reminderData.type || REMINDER_TYPE.CUSTOM,
      status: REMINDER_STATUS.PENDING,
      
      // Tarihler
      dueDate: reminderData.dueDate ? Timestamp.fromDate(new Date(reminderData.dueDate)) : null,
      dueTime: reminderData.dueTime || null, // HH:mm formatında
      
      // Entity bağlantısı
      entityType: reminderData.entityType || REMINDER_ENTITY_TYPE.GENERAL,
      entityId: reminderData.entityId || null,
      entityTitle: reminderData.entityTitle || null, // Hızlı görüntüleme için
      
      // Müşteri bağlantısı (her zaman varsa)
      customerId: reminderData.customerId || null,
      customerName: reminderData.customerName || null,
      
      // Atama
      assignedTo: reminderData.assignedTo || null,
      assignedToName: reminderData.assignedToName || null,
      
      // Ek bilgiler
      priority: reminderData.priority || 'normal', // low, normal, high, urgent
      location: reminderData.location || null, // Görüşme konumu
      meetingLink: reminderData.meetingLink || null, // Çevrimiçi toplantı linki
      notes: reminderData.notes || null,
      
      // Snooze bilgisi
      snoozedUntil: null,
      snoozeCount: 0,
      
      // Meta
      createdAt: now,
      updatedAt: now,
      createdBy: reminderData.createdBy || null,
      createdByName: reminderData.createdByName || null,
      
      // Tamamlanma bilgisi
      completedAt: null,
      completedBy: null,
    };
    
    // Merkezi koleksiyona kaydet
    const docRef = await addDoc(collection(db, COLLECTIONS.REMINDERS), newReminder);
    
    // Aktivite kaydı
    await logActivity({
      type: ACTIVITY_TYPE.REMINDER_SET,
      customerId: newReminder.customerId,
      caseId: newReminder.entityType === REMINDER_ENTITY_TYPE.CASE ? newReminder.entityId : null,
      conversationId: newReminder.entityType === REMINDER_ENTITY_TYPE.CONVERSATION ? newReminder.entityId : null,
      performedBy: newReminder.createdBy,
      metadata: {
        reminderId: docRef.id,
        title: newReminder.title,
        type: newReminder.type,
        dueDate: newReminder.dueDate,
      },
      description: `Hatırlatma oluşturuldu: "${newReminder.title}"`,
    });
    
    return { id: docRef.id, ...newReminder };
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }
};

// =============================================================================
// READ REMINDERS
// =============================================================================

/**
 * Tek bir hatırlatmayı getir
 */
export const getReminder = async (reminderId) => {
  try {
    const docRef = doc(db, COLLECTIONS.REMINDERS, reminderId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error getting reminder:", error);
    throw error;
  }
};

/**
 * Tüm hatırlatmaları getir (filtreli)
 */
export const getReminders = async (options = {}) => {
  try {
    const {
      status = null,
      type = null,
      entityType = null,
      entityId = null,
      customerId = null,
      assignedTo = null,
      dueFrom = null,
      dueTo = null,
      includeCompleted = false,
      limitCount = 100,
      sortBy = 'dueDate',
      sortOrder = 'asc',
    } = options;
    
    let constraints = [];
    
    // Status filtresi
    if (status) {
      constraints.push(where('status', '==', status));
    } else if (!includeCompleted) {
      // Varsayılan olarak tamamlanmış ve iptal edilmişleri hariç tut
      constraints.push(where('status', 'in', [REMINDER_STATUS.PENDING, REMINDER_STATUS.SNOOZED]));
    }
    
    // Tür filtresi
    if (type) {
      constraints.push(where('type', '==', type));
    }
    
    // Entity filtresi
    if (entityType) {
      constraints.push(where('entityType', '==', entityType));
    }
    
    if (entityId) {
      constraints.push(where('entityId', '==', entityId));
    }
    
    // Müşteri filtresi
    if (customerId) {
      constraints.push(where('customerId', '==', customerId));
    }
    
    // Atanan kişi filtresi
    if (assignedTo) {
      constraints.push(where('assignedTo', '==', assignedTo));
    }
    
    // Sıralama
    constraints.push(orderBy(sortBy, sortOrder));
    constraints.push(limit(limitCount));
    
    const q = query(collection(db, COLLECTIONS.REMINDERS), ...constraints);
    const snapshot = await getDocs(q);
    
    let reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Tarih filtresi (client-side, compound query limitleri nedeniyle)
    if (dueFrom) {
      const fromDate = Timestamp.fromDate(new Date(dueFrom));
      reminders = reminders.filter(r => r.dueDate && r.dueDate >= fromDate);
    }
    
    if (dueTo) {
      const toDate = Timestamp.fromDate(new Date(dueTo));
      reminders = reminders.filter(r => r.dueDate && r.dueDate <= toDate);
    }
    
    return reminders;
  } catch (error) {
    console.error("Error getting reminders:", error);
    throw error;
  }
};

/**
 * Bugünün hatırlatmalarını getir
 */
export const getTodayReminders = async (userId = null) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await getReminders({
      assignedTo: userId,
      dueFrom: today.toISOString(),
      dueTo: tomorrow.toISOString(),
      includeCompleted: false,
    });
  } catch (error) {
    console.error("Error getting today's reminders:", error);
    throw error;
  }
};

/**
 * Gecikmiş hatırlatmaları getir
 */
export const getOverdueReminders = async (userId = null) => {
  try {
    const now = new Date();
    
    let constraints = [
      where('status', 'in', [REMINDER_STATUS.PENDING, REMINDER_STATUS.SNOOZED]),
      orderBy('dueDate', 'asc'),
      limit(50),
    ];
    
    if (userId) {
      constraints.unshift(where('assignedTo', '==', userId));
    }
    
    const q = query(collection(db, COLLECTIONS.REMINDERS), ...constraints);
    const snapshot = await getDocs(q);
    
    const nowTimestamp = Timestamp.fromDate(now);
    const reminders = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(r => r.dueDate && r.dueDate < nowTimestamp);
    
    return reminders;
  } catch (error) {
    console.error("Error getting overdue reminders:", error);
    throw error;
  }
};

/**
 * Yaklaşan hatırlatmaları getir (Dashboard için)
 */
export const getUpcomingReminders = async (userId = null, options = {}) => {
  try {
    const {
      limitCount = 10,
      daysAhead = 7,
    } = options;
    
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    let constraints = [
      where('status', 'in', [REMINDER_STATUS.PENDING, REMINDER_STATUS.SNOOZED]),
      orderBy('dueDate', 'asc'),
      limit(limitCount * 2), // Filtre sonrası yeterli sonuç olsun
    ];
    
    if (userId) {
      constraints.unshift(where('assignedTo', '==', userId));
    }
    
    const q = query(collection(db, COLLECTIONS.REMINDERS), ...constraints);
    const snapshot = await getDocs(q);
    
    const nowTimestamp = Timestamp.fromDate(now);
    const futureTimestamp = Timestamp.fromDate(futureDate);
    
    const reminders = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(r => {
        if (!r.dueDate) return false;
        return r.dueDate >= nowTimestamp && r.dueDate <= futureTimestamp;
      })
      .slice(0, limitCount);
    
    return reminders;
  } catch (error) {
    console.error("Error getting upcoming reminders:", error);
    throw error;
  }
};

/**
 * Entity'ye bağlı hatırlatmaları getir
 */
export const getRemindersForEntity = async (entityType, entityId, includeCompleted = false) => {
  try {
    return await getReminders({
      entityType,
      entityId,
      includeCompleted,
    });
  } catch (error) {
    console.error("Error getting reminders for entity:", error);
    throw error;
  }
};

/**
 * İstatistikleri getir
 */
export const getReminderStats = async (userId = null) => {
  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);
    
    let constraints = [
      where('status', 'in', [REMINDER_STATUS.PENDING, REMINDER_STATUS.SNOOZED]),
    ];
    
    if (userId) {
      constraints.unshift(where('assignedTo', '==', userId));
    }
    
    const q = query(collection(db, COLLECTIONS.REMINDERS), ...constraints);
    const snapshot = await getDocs(q);
    
    const reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Helper: dueDate'i Date objesine çevir
    const getDueDate = (reminder) => {
      if (!reminder.dueDate) return null;
      if (reminder.dueDate.toDate) return reminder.dueDate.toDate();
      if (reminder.dueDate instanceof Date) return reminder.dueDate;
      return new Date(reminder.dueDate);
    };
    
    const stats = {
      total: reminders.length,
      overdue: reminders.filter(r => {
        const dueDate = getDueDate(r);
        return dueDate && dueDate < now;
      }).length,
      today: reminders.filter(r => {
        const dueDate = getDueDate(r);
        return dueDate && dueDate >= today && dueDate < tomorrow;
      }).length,
      thisWeek: reminders.filter(r => {
        const dueDate = getDueDate(r);
        return dueDate && dueDate >= today && dueDate < weekLater;
      }).length,
      byType: {},
      byEntityType: {},
    };
    
    // Türlere göre grupla
    reminders.forEach(r => {
      stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
      stats.byEntityType[r.entityType] = (stats.byEntityType[r.entityType] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error("Error getting reminder stats:", error);
    throw error;
  }
};

// =============================================================================
// UPDATE REMINDER
// =============================================================================

/**
 * Hatırlatmayı güncelle
 */
export const updateReminder = async (reminderId, updateData, updatedBy = null) => {
  try {
    const reminderRef = doc(db, COLLECTIONS.REMINDERS, reminderId);
    
    const updates = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };
    
    // dueDate string ise Timestamp'e çevir
    if (updates.dueDate && !(updates.dueDate instanceof Timestamp)) {
      updates.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
    }
    
    await updateDoc(reminderRef, updates);
    
    return true;
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
};

/**
 * Hatırlatmayı tamamla
 */
export const completeReminder = async (reminderId, completedBy = null, notes = null) => {
  try {
    const reminderRef = doc(db, COLLECTIONS.REMINDERS, reminderId);
    const reminder = await getReminder(reminderId);
    
    if (!reminder) {
      throw new Error('Reminder not found');
    }
    
    await updateDoc(reminderRef, {
      status: REMINDER_STATUS.COMPLETED,
      completedAt: serverTimestamp(),
      completedBy,
      completionNotes: notes,
      updatedAt: serverTimestamp(),
    });
    
    // Aktivite kaydı
    await logActivity({
      type: ACTIVITY_TYPE.REMINDER_COMPLETED,
      customerId: reminder.customerId,
      caseId: reminder.entityType === REMINDER_ENTITY_TYPE.CASE ? reminder.entityId : null,
      conversationId: reminder.entityType === REMINDER_ENTITY_TYPE.CONVERSATION ? reminder.entityId : null,
      performedBy: completedBy,
      metadata: {
        reminderId,
        title: reminder.title,
      },
      description: `Hatırlatma tamamlandı: "${reminder.title}"`,
    });
    
    return true;
  } catch (error) {
    console.error("Error completing reminder:", error);
    throw error;
  }
};

/**
 * Hatırlatmayı ertele
 */
export const snoozeReminder = async (reminderId, snoozeDuration, snoozedBy = null) => {
  try {
    const reminder = await getReminder(reminderId);
    
    if (!reminder) {
      throw new Error('Reminder not found');
    }
    
    // snoozeDuration: dakika cinsinden veya { hours, minutes } objesi
    let snoozeMinutes = snoozeDuration;
    if (typeof snoozeDuration === 'object') {
      snoozeMinutes = (snoozeDuration.hours || 0) * 60 + (snoozeDuration.minutes || 0);
    }
    
    const newDueDate = new Date();
    newDueDate.setMinutes(newDueDate.getMinutes() + snoozeMinutes);
    
    const reminderRef = doc(db, COLLECTIONS.REMINDERS, reminderId);
    await updateDoc(reminderRef, {
      status: REMINDER_STATUS.SNOOZED,
      dueDate: Timestamp.fromDate(newDueDate),
      snoozedUntil: Timestamp.fromDate(newDueDate),
      snoozeCount: (reminder.snoozeCount || 0) + 1,
      lastSnoozedBy: snoozedBy,
      lastSnoozedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error snoozing reminder:", error);
    throw error;
  }
};

/**
 * Hatırlatmayı iptal et
 */
export const dismissReminder = async (reminderId, dismissedBy = null, reason = null) => {
  try {
    const reminderRef = doc(db, COLLECTIONS.REMINDERS, reminderId);
    
    await updateDoc(reminderRef, {
      status: REMINDER_STATUS.DISMISSED,
      dismissedAt: serverTimestamp(),
      dismissedBy,
      dismissReason: reason,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error dismissing reminder:", error);
    throw error;
  }
};

// =============================================================================
// DELETE REMINDER
// =============================================================================

/**
 * Hatırlatmayı sil
 */
export const deleteReminder = async (reminderId) => {
  try {
    const reminderRef = doc(db, COLLECTIONS.REMINDERS, reminderId);
    await deleteDoc(reminderRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

// =============================================================================
// BULK OPERATIONS
// =============================================================================

/**
 * Toplu tamamlama
 */
export const completeMultipleReminders = async (reminderIds, completedBy = null) => {
  try {
    const batch = writeBatch(db);
    
    for (const reminderId of reminderIds) {
      const reminderRef = doc(db, COLLECTIONS.REMINDERS, reminderId);
      batch.update(reminderRef, {
        status: REMINDER_STATUS.COMPLETED,
        completedAt: serverTimestamp(),
        completedBy,
        updatedAt: serverTimestamp(),
      });
    }
    
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error("Error completing multiple reminders:", error);
    throw error;
  }
};

/**
 * Toplu silme
 */
export const deleteMultipleReminders = async (reminderIds) => {
  try {
    const batch = writeBatch(db);
    
    for (const reminderId of reminderIds) {
      const reminderRef = doc(db, COLLECTIONS.REMINDERS, reminderId);
      batch.delete(reminderRef);
    }
    
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error("Error deleting multiple reminders:", error);
    throw error;
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Hatırlatma durumunu kontrol et (gecikmiş mi?)
 */
export const isReminderOverdue = (reminder) => {
  if (!reminder?.dueDate) return false;
  if (reminder.status === REMINDER_STATUS.COMPLETED || reminder.status === REMINDER_STATUS.DISMISSED) {
    return false;
  }
  
  const now = new Date();
  const dueDate = reminder.dueDate.toDate ? reminder.dueDate.toDate() : new Date(reminder.dueDate);
  
  return dueDate < now;
};

/**
 * Hatırlatma öncelik rengini al
 */
export const getReminderPriorityColor = (priority) => {
  const colors = {
    low: 'bg-gray-100 text-gray-600 border-gray-200',
    normal: 'bg-blue-100 text-blue-600 border-blue-200',
    high: 'bg-orange-100 text-orange-600 border-orange-200',
    urgent: 'bg-red-100 text-red-600 border-red-200',
  };
  return colors[priority] || colors.normal;
};

/**
 * Hatırlatma için okunabilir zaman farkı
 */
export const formatReminderDue = (dueDate) => {
  if (!dueDate) return '';
  
  const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
  const now = new Date();
  const diffMs = date - now;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMs < 0) {
    // Geçmiş
    const absDays = Math.abs(diffDays);
    const absHours = Math.abs(diffHours);
    const absMins = Math.abs(diffMins);
    
    if (absDays > 0) return `${absDays} gün önce`;
    if (absHours > 0) return `${absHours} saat önce`;
    if (absMins > 0) return `${absMins} dakika önce`;
    return 'Şimdi';
  }
  
  // Gelecek
  if (diffDays > 0) return `${diffDays} gün sonra`;
  if (diffHours > 0) return `${diffHours} saat sonra`;
  if (diffMins > 0) return `${diffMins} dakika sonra`;
  return 'Şimdi';
};
