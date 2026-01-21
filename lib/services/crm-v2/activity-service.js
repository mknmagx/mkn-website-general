/**
 * CRM v2 - Activity Service
 * 
 * Müşteri aktivite timeline'ı yönetimi.
 * Tüm müşteri etkileşimlerinin tarihçesi.
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS, ACTIVITY_TYPE, getActivityTypeLabel } from "./schema";

/**
 * Aktivite kaydet
 */
export const logActivity = async (activityData) => {
  try {
    // Orijinal tarih desteği (migration için)
    const originalDate = activityData.originalCreatedAt;
    let createdAtValue = serverTimestamp();
    
    if (originalDate) {
      // Eğer orijinal tarih varsa, onu kullan
      if (originalDate?.toDate) {
        createdAtValue = originalDate; // Zaten Timestamp
      } else if (originalDate instanceof Date) {
        createdAtValue = Timestamp.fromDate(originalDate);
      } else if (typeof originalDate === 'string' || typeof originalDate === 'number') {
        createdAtValue = Timestamp.fromDate(new Date(originalDate));
      }
    }
    
    const activity = {
      type: activityData.type,
      
      // İlişkili entity'ler
      customerId: activityData.customerId || null,
      conversationId: activityData.conversationId || null,
      caseId: activityData.caseId || null,
      
      // Kim tarafından yapıldı
      performedBy: activityData.performedBy || null,
      
      // Ek bilgiler
      metadata: {
        ...activityData.metadata,
        // Orijinal tarih meta verisinde de saklansın
        ...(originalDate && { originalCreatedAt: originalDate }),
      },
      
      // Açıklama (otomatik oluşturulabilir)
      description: activityData.description || generateActivityDescription(activityData),
      
      // Tarih - orijinal tarih varsa onu kullan
      createdAt: createdAtValue,
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.ACTIVITIES), activity);
    return { id: docRef.id, ...activity };
  } catch (error) {
    console.error("Error logging activity:", error);
    // Aktivite kaydı hataları ana işlemi etkilemesin
    return null;
  }
};

/**
 * Müşteri aktivitelerini getir (Timeline)
 */
export const getCustomerActivities = async (customerId, options = {}) => {
  try {
    const {
      types = null, // Belirli aktivite türleri
      limitCount = 50,
      startDate = null,
      endDate = null,
    } = options;
    
    let constraints = [
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ];
    
    const q = query(collection(db, COLLECTIONS.ACTIVITIES), ...constraints);
    const snapshot = await getDocs(q);
    
    let activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Client-side type filter
    if (types && types.length > 0) {
      activities = activities.filter(a => types.includes(a.type));
    }
    
    // Client-side date filter
    if (startDate) {
      const start = Timestamp.fromDate(new Date(startDate));
      activities = activities.filter(a => a.createdAt >= start);
    }
    
    if (endDate) {
      const end = Timestamp.fromDate(new Date(endDate));
      activities = activities.filter(a => a.createdAt <= end);
    }
    
    return activities;
  } catch (error) {
    console.error("Error getting customer activities:", error);
    throw error;
  }
};

/**
 * Konuşma aktivitelerini getir
 */
export const getConversationActivities = async (conversationId, options = {}) => {
  try {
    const { limitCount = 50 } = options;
    
    const q = query(
      collection(db, COLLECTIONS.ACTIVITIES),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting conversation activities:", error);
    throw error;
  }
};

/**
 * Case aktivitelerini getir
 */
export const getCaseActivities = async (caseId, options = {}) => {
  try {
    const { limitCount = 50 } = options;
    
    const q = query(
      collection(db, COLLECTIONS.ACTIVITIES),
      where('caseId', '==', caseId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting case activities:", error);
    throw error;
  }
};

/**
 * Birleştirilmiş timeline (müşteri için tüm aktiviteler)
 */
export const getUnifiedTimeline = async (customerId, options = {}) => {
  try {
    const {
      limitCount = 100,
      includeMessages = true,
      includeCaseEvents = true,
    } = options;
    
    // Aktiviteleri al
    const activities = await getCustomerActivities(customerId, { limitCount });
    
    // Ek olarak mesajları da dahil edebiliriz
    let timeline = [...activities];
    
    if (includeMessages) {
      // Müşterinin konuşmalarındaki mesajları al
      const conversationsQuery = query(
        collection(db, COLLECTIONS.CONVERSATIONS),
        where('customerId', '==', customerId)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      
      for (const convDoc of conversationsSnapshot.docs) {
        const messagesQuery = query(
          collection(db, COLLECTIONS.MESSAGES),
          where('conversationId', '==', convDoc.id),
          orderBy('createdAt', 'desc'),
          limit(20) // Her konuşmadan max 20 mesaj
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        messagesSnapshot.forEach(msgDoc => {
          const msgData = msgDoc.data();
          timeline.push({
            id: `msg_${msgDoc.id}`,
            type: msgData.direction === 'inbound' ? 'message_received' : 'message_sent',
            customerId,
            conversationId: convDoc.id,
            createdAt: msgData.createdAt,
            metadata: {
              content: msgData.content?.substring(0, 200),
              channel: msgData.channel,
              hasAttachments: (msgData.attachments?.length || 0) > 0,
            },
            description: msgData.direction === 'inbound' 
              ? `${msgData.sender?.name || 'Müşteri'} mesaj gönderdi`
              : 'Yanıt gönderildi',
            isMessage: true,
          });
        });
      }
    }
    
    // Tarihe göre sırala
    timeline.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA;
    });
    
    // Limit uygula
    return timeline.slice(0, limitCount);
  } catch (error) {
    console.error("Error getting unified timeline:", error);
    throw error;
  }
};

/**
 * Not ekle (aktivite olarak)
 */
export const addNote = async (noteData) => {
  try {
    return await logActivity({
      type: ACTIVITY_TYPE.NOTE_ADDED,
      customerId: noteData.customerId,
      conversationId: noteData.conversationId,
      caseId: noteData.caseId,
      performedBy: noteData.createdBy,
      metadata: {
        content: noteData.content,
        isPinned: noteData.isPinned || false,
      },
      description: `Not eklendi: "${noteData.content?.substring(0, 50)}${noteData.content?.length > 50 ? '...' : ''}"`,
    });
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
};

/**
 * Hatırlatma oluştur
 */
export const createReminder = async (reminderData) => {
  try {
    return await logActivity({
      type: ACTIVITY_TYPE.REMINDER_SET,
      customerId: reminderData.customerId,
      conversationId: reminderData.conversationId,
      caseId: reminderData.caseId,
      performedBy: reminderData.createdBy,
      metadata: {
        title: reminderData.title,
        dueDate: reminderData.dueDate ? Timestamp.fromDate(new Date(reminderData.dueDate)) : null,
        isCompleted: false,
      },
      description: `Hatırlatma: "${reminderData.title}"`,
    });
  } catch (error) {
    console.error("Error creating reminder:", error);
    throw error;
  }
};

/**
 * Yaklaşan hatırlatmaları getir
 */
export const getUpcomingReminders = async (userId = null, options = {}) => {
  try {
    const { 
      limitCount = 20,
      daysAhead = 7,
    } = options;
    
    const now = Timestamp.now();
    const futureDate = Timestamp.fromDate(
      new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
    );
    
    let constraints = [
      where('type', '==', ACTIVITY_TYPE.REMINDER_SET),
      where('metadata.isCompleted', '==', false),
      orderBy('metadata.dueDate', 'asc'),
      limit(limitCount),
    ];
    
    if (userId) {
      constraints.unshift(where('performedBy', '==', userId));
    }
    
    const q = query(collection(db, COLLECTIONS.ACTIVITIES), ...constraints);
    const snapshot = await getDocs(q);
    
    let reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Tarih filtresi (client-side, Firestore compound query limitleri nedeniyle)
    reminders = reminders.filter(r => {
      const dueDate = r.metadata?.dueDate;
      if (!dueDate) return false;
      return dueDate >= now && dueDate <= futureDate;
    });
    
    return reminders;
  } catch (error) {
    console.error("Error getting upcoming reminders:", error);
    throw error;
  }
};

/**
 * Son aktiviteleri getir (Dashboard için)
 */
export const getRecentActivities = async (options = {}) => {
  try {
    const {
      limitCount = 20,
      types = null,
      userId = null,
    } = options;
    
    let constraints = [
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ];
    
    if (userId) {
      constraints.unshift(where('performedBy', '==', userId));
    }
    
    const q = query(collection(db, COLLECTIONS.ACTIVITIES), ...constraints);
    const snapshot = await getDocs(q);
    
    let activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Type filter (client-side)
    if (types && types.length > 0) {
      activities = activities.filter(a => types.includes(a.type));
    }
    
    return activities;
  } catch (error) {
    console.error("Error getting recent activities:", error);
    throw error;
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Aktivite açıklaması oluştur
 */
const generateActivityDescription = (activityData) => {
  const { type, metadata } = activityData;
  
  switch (type) {
    case ACTIVITY_TYPE.MESSAGE_RECEIVED:
      return `${metadata?.senderName || 'Müşteri'} mesaj gönderdi`;
      
    case ACTIVITY_TYPE.MESSAGE_SENT:
      return 'Yanıt gönderildi';
      
    case ACTIVITY_TYPE.CONVERSATION_CREATED:
      return `Konuşma başlatıldı (${metadata?.channel || 'bilinmeyen kanal'})`;
      
    case ACTIVITY_TYPE.CONVERSATION_CLOSED:
      return `Konuşma kapatıldı${metadata?.reason ? `: ${metadata.reason}` : ''}`;
      
    case ACTIVITY_TYPE.CONVERSATION_ASSIGNED:
      return `Konuşma ${metadata?.assignedTo || 'birine'} atandı`;
      
    case ACTIVITY_TYPE.CASE_CREATED:
      return `Talep oluşturuldu: ${metadata?.title || ''}`;
      
    case ACTIVITY_TYPE.CASE_STATUS_CHANGED:
      return `Talep durumu değişti: ${metadata?.previousStatus} → ${metadata?.newStatus}`;
      
    case ACTIVITY_TYPE.CASE_ASSIGNED:
      return `Talep ${metadata?.assignedTo || 'birine'} atandı`;
      
    case ACTIVITY_TYPE.QUOTE_SENT:
      return `Teklif gönderildi: ${metadata?.amount || 0} ${metadata?.currency || 'TRY'}`;
      
    case ACTIVITY_TYPE.QUOTE_ACCEPTED:
      return 'Teklif kabul edildi';
      
    case ACTIVITY_TYPE.QUOTE_REJECTED:
      return 'Teklif reddedildi';
      
    case ACTIVITY_TYPE.CUSTOMER_CREATED:
      return `Müşteri oluşturuldu: ${metadata?.customerName || ''}`;
      
    case ACTIVITY_TYPE.CUSTOMER_UPDATED:
      return `Müşteri bilgileri güncellendi`;
      
    case ACTIVITY_TYPE.CUSTOMER_MERGED:
      return `Müşteri birleştirildi: ${metadata?.mergedFromName || ''}`;
      
    case ACTIVITY_TYPE.TAG_ADDED:
      return `Etiket eklendi: ${metadata?.tag || ''}`;
      
    case ACTIVITY_TYPE.TAG_REMOVED:
      return `Etiket kaldırıldı: ${metadata?.tag || ''}`;
      
    default:
      return getActivityTypeLabel(type);
  }
};
