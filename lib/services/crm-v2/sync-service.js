/**
 * CRM v2 - Sync Service
 * 
 * Tüm kaynakları (formlar + emailler) tek noktadan senkronize eder.
 * 
 * Özellikler:
 * - Birleşik senkronizasyon (contacts, quotes, outlook emails)
 * - İncremental sync (sadece yeni verileri çeker)
 * - Son sync zamanını Firestore'da saklar
 * - Otomatik kontrol (ayarlarda belirlenen aralıklı)
 * - Manuel tetikleme butonu
 * - Sync Lock mekanizması (paralel çalışmayı engeller)
 * - Duplicate protection (çift kayıt önleme)
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS, CHANNEL, CONVERSATION_STATUS, PRIORITY, REPLY_STATUS } from "./schema";
import { createConversation, addMessage, updateConversation } from "./conversation-service";
import { getCrmSettings, DEFAULT_SETTINGS } from "./settings-service";

// Eski sistem servisleri
import { getAllContacts, CONTACT_STATUS } from "../contacts-service";
import { getQuotes } from "../admin-quote-service";
import { getActiveThreads } from "../email-thread-service";

// =============================================================================
// CONSTANTS
// =============================================================================

const SYNC_DOC_ID = "unified_sync";

// Spam/Junk email domain'leri
const SPAM_DOMAINS = ['noreply', 'no-reply', 'mailer-daemon', 'postmaster'];

// İç emailler (kendi domain'lerimiz)
const INTERNAL_DOMAINS = ['mkngroup.com.tr'];

// =============================================================================
// HELPER - Get sync settings
// =============================================================================

const getSyncIntervalMinutes = async () => {
  try {
    const settings = await getCrmSettings();
    return settings?.sync?.syncInterval || DEFAULT_SETTINGS.sync.syncInterval;
  } catch {
    return DEFAULT_SETTINGS.sync.syncInterval;
  }
};

const getEmailSyncDays = async () => {
  try {
    const settings = await getCrmSettings();
    return settings?.sync?.emailSyncDays || DEFAULT_SETTINGS.sync.emailSyncDays;
  } catch {
    return DEFAULT_SETTINGS.sync.emailSyncDays;
  }
};

// =============================================================================
// SYNC LOCK MECHANISM - Paralel sync işlemlerini engeller
// =============================================================================

let syncLockState = {
  isLocked: false,
  lockedAt: null,
  lockedBy: null,
};

const SYNC_LOCK_TIMEOUT_MS = 120000; // 2 dakika timeout

/**
 * Sync kilidi al - paralel işlemleri engeller
 * @param {string} operationId - İşlem tanımlayıcı (debug için)
 * @returns {boolean} true ise kilit alındı, false ise başka işlem devam ediyor
 */
export const acquireSyncLock = (operationId = 'unknown') => {
  const now = Date.now();
  
  // Kilit varsa ve timeout geçmemişse
  if (syncLockState.isLocked && syncLockState.lockedAt) {
    const elapsed = now - syncLockState.lockedAt;
    
    if (elapsed < SYNC_LOCK_TIMEOUT_MS) {
      console.warn(`[CRM Sync Lock] Lock denied - already locked by '${syncLockState.lockedBy}' (${Math.round(elapsed/1000)}s ago)`);
      return false;
    }
    
    // Timeout geçmiş, eski kilidi kaldır
    console.warn(`[CRM Sync Lock] Previous lock timed out (${syncLockState.lockedBy}), releasing...`);
  }
  
  // Kilidi al
  syncLockState = {
    isLocked: true,
    lockedAt: now,
    lockedBy: operationId,
  };
  
  console.log(`[CRM Sync Lock] Lock acquired by '${operationId}'`);
  return true;
};

/**
 * Sync kilidini serbest bırak
 * @param {string} operationId - Kilidi alan işlemin ID'si
 */
export const releaseSyncLock = (operationId = 'unknown') => {
  if (syncLockState.lockedBy === operationId || !syncLockState.lockedBy) {
    const duration = syncLockState.lockedAt ? Math.round((Date.now() - syncLockState.lockedAt) / 1000) : 0;
    console.log(`[CRM Sync Lock] Lock released by '${operationId}' (held for ${duration}s)`);
    
    syncLockState = {
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
    };
    return true;
  }
  
  console.warn(`[CRM Sync Lock] Cannot release - lock owned by '${syncLockState.lockedBy}', not '${operationId}'`);
  return false;
};

/**
 * Kilit durumunu kontrol et
 * @returns {Object} Kilit durumu
 */
export const getSyncLockStatus = () => ({
  ...syncLockState,
  elapsed: syncLockState.lockedAt ? Date.now() - syncLockState.lockedAt : null,
});

// =============================================================================
// SYNC METADATA FUNCTIONS
// =============================================================================

/**
 * Son senkronizasyon zamanını al
 */
export const getLastSyncTime = async () => {
  try {
    const docRef = doc(db, COLLECTIONS.SYNC_METADATA, SYNC_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        lastSyncAt: data.lastSyncAt?.toDate?.() || null,
        lastSyncBy: data.lastSyncBy || null,
        syncCount: data.syncCount || 0,
        lastResults: data.lastResults || null,
        // Email sync bilgileri
        lastEmailSyncAt: data.lastEmailSyncAt?.toDate?.() || null,
        emailStats: data.emailStats || null,
      };
    }
    
    return null;
  } catch (error) {
    console.error("[CRM Sync] Error getting last sync time:", error);
    return null;
  }
};

/**
 * Son senkronizasyon zamanını güncelle
 */
export const updateLastSyncTime = async (userId, results) => {
  try {
    const docRef = doc(db, COLLECTIONS.SYNC_METADATA, SYNC_DOC_ID);
    const currentDoc = await getDoc(docRef);
    const currentData = currentDoc.exists() ? currentDoc.data() : {};
    
    await setDoc(docRef, {
      lastSyncAt: serverTimestamp(),
      lastSyncBy: userId || null,
      syncCount: (currentData.syncCount || 0) + 1,
      lastResults: results,
      // Email sync bilgilerini de sakla - sadece email import edilmişse güncelle
      lastEmailSyncAt: (results.outlookEmails?.imported > 0 || results.outlookEmails?.addedToThread > 0)
        ? serverTimestamp() 
        : currentData.lastEmailSyncAt,
      emailStats: results.outlookEmails || currentData.emailStats,
      updatedAt: serverTimestamp(),
    });
    
    console.log("[CRM Sync] Sync metadata updated");
  } catch (error) {
    console.error("[CRM Sync] Error updating sync metadata:", error);
  }
};

/**
 * Email sync zamanını sıfırla (ilk sync için)
 * Bu fonksiyon lastEmailSyncAt'i null yaparak
 * bir sonraki sync'in 30 gün geriye gitmesini sağlar
 */
export const resetEmailSyncTime = async () => {
  try {
    const docRef = doc(db, COLLECTIONS.SYNC_METADATA, SYNC_DOC_ID);
    const currentDoc = await getDoc(docRef);
    
    if (currentDoc.exists()) {
      const currentData = currentDoc.data();
      await setDoc(docRef, {
        ...currentData,
        lastEmailSyncAt: null,
        emailStats: null,
        updatedAt: serverTimestamp(),
      });
      console.log("[CRM Sync] Email sync time reset successfully");
      return { success: true };
    }
    
    return { success: false, error: "Sync metadata not found" };
  } catch (error) {
    console.error("[CRM Sync] Error resetting email sync time:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Mevcut email conversation'larının tarihlerini düzelt
 * Email'lerde receivedDateTime varsa ama originalCreatedAt yoksa düzelt
 */
export const fixEmailConversationDates = async () => {
  try {
    console.log("[CRM Sync] Fixing email conversation dates...");
    
    const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
    const q = query(conversationsRef, where('channel', '==', CHANNEL.EMAIL));
    const snapshot = await getDocs(q);
    
    let fixed = 0;
    let skipped = 0;
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const metadata = data.channelMetadata || {};
      
      // receivedDateTime varsa ve henüz Timestamp değilse düzelt
      if (metadata.receivedDateTime && typeof metadata.receivedDateTime === 'string') {
        const receivedTimestamp = Timestamp.fromDate(new Date(metadata.receivedDateTime));
        
        await setDoc(docSnap.ref, {
          channelMetadata: {
            ...metadata,
            originalCreatedAt: receivedTimestamp,
          },
          createdAt: receivedTimestamp,
          lastMessageAt: receivedTimestamp,
        }, { merge: true });
        
        fixed++;
        console.log(`[CRM Sync] Fixed date for conversation ${docSnap.id}`);
      } else {
        skipped++;
      }
    }
    
    console.log(`[CRM Sync] Date fix completed. Fixed: ${fixed}, Skipped: ${skipped}`);
    return { success: true, fixed, skipped };
  } catch (error) {
    console.error("[CRM Sync] Error fixing email dates:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Senkronizasyon gerekli mi kontrol et
 * @returns {boolean} true ise senkronizasyon gerekli
 */
export const isSyncNeeded = async () => {
  try {
    const syncData = await getLastSyncTime();
    
    if (!syncData || !syncData.lastSyncAt) {
      console.log("[CRM Sync] No previous sync found, sync needed");
      return true;
    }
    
    const lastSyncDate = new Date(syncData.lastSyncAt);
    const now = new Date();
    const diffMinutes = (now - lastSyncDate) / (1000 * 60);
    
    const syncInterval = await getSyncIntervalMinutes();
    console.log(`[CRM Sync] Last sync: ${lastSyncDate.toISOString()}, ${Math.round(diffMinutes)} minutes ago (interval: ${syncInterval})`);
    
    return diffMinutes >= syncInterval;
  } catch (error) {
    console.error("[CRM Sync] Error checking sync status:", error);
    return false;
  }
};

// =============================================================================
// STATUS MAPPING HELPERS
// =============================================================================

const mapContactStatusToConversationStatus = (status) => {
  const mapping = {
    new: CONVERSATION_STATUS.OPEN,
    contacted: CONVERSATION_STATUS.OPEN,
    in_progress: CONVERSATION_STATUS.OPEN,
    qualified: CONVERSATION_STATUS.OPEN,
    converted: CONVERSATION_STATUS.CLOSED,
    lost: CONVERSATION_STATUS.CLOSED,
    archived: CONVERSATION_STATUS.CLOSED,
  };
  return mapping[status] || CONVERSATION_STATUS.OPEN;
};

const mapQuoteStatusToConversationStatus = (status) => {
  const mapping = {
    new: CONVERSATION_STATUS.OPEN,
    pending: CONVERSATION_STATUS.OPEN,
    reviewing: CONVERSATION_STATUS.OPEN,
    approved: CONVERSATION_STATUS.CLOSED,
    rejected: CONVERSATION_STATUS.CLOSED,
    completed: CONVERSATION_STATUS.CLOSED,
  };
  return mapping[status] || CONVERSATION_STATUS.OPEN;
};

const mapPriority = (priority) => {
  const mapping = {
    high: PRIORITY.HIGH,
    urgent: PRIORITY.URGENT,
    normal: PRIORITY.NORMAL,
    low: PRIORITY.LOW,
  };
  return mapping[priority] || PRIORITY.NORMAL;
};

// =============================================================================
// DATE CONVERSION HELPER
// =============================================================================

const toFirestoreTimestamp = (dateValue) => {
  if (!dateValue) return null;
  
  if (dateValue.toDate) {
    // Zaten Firestore Timestamp
    return dateValue;
  } else if (dateValue instanceof Date) {
    return Timestamp.fromDate(dateValue);
  } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      return Timestamp.fromDate(parsedDate);
    }
  }
  return null;
};

// =============================================================================
// INCREMENTAL SYNC FUNCTIONS
// =============================================================================

/**
 * Mevcut sourceRef'leri al (duplicate kontrolü için)
 * Nested field query'leri index gerektirdiği için tüm kayıtları çekip Set ile kontrol ediyoruz
 */
const getExistingSourceRefs = async () => {
  try {
    const existingQuery = query(collection(db, COLLECTIONS.CONVERSATIONS));
    const existingSnapshot = await getDocs(existingQuery);
    const existingSourceRefs = new Set();
    
    existingSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.sourceRef?.type && data.sourceRef?.id) {
        existingSourceRefs.add(`${data.sourceRef.type}_${data.sourceRef.id}`);
      }
    });
    
    console.log(`[CRM Sync] Found ${existingSourceRefs.size} existing source refs`);
    return existingSourceRefs;
  } catch (error) {
    console.error("[CRM Sync] Error getting existing source refs:", error);
    return new Set();
  }
};

/**
 * Son sync'ten sonra eklenen contacts'ları import et
 */
const syncNewContacts = async (lastSyncTime, createdBy, existingSourceRefs) => {
  const results = { imported: 0, skipped: 0, errors: [] };
  
  try {
    console.log("[CRM Sync] Fetching contacts...");
    const allContacts = await getAllContacts();
    
    // Son sync'ten sonra eklenenleri filtrele
    const newContacts = allContacts.filter(contact => {
      if (!lastSyncTime) return true; // İlk sync, hepsini al
      
      const contactDate = contact.createdAt?.toDate?.() || 
                         (contact.createdAt ? new Date(contact.createdAt) : null);
      
      return contactDate && contactDate > lastSyncTime;
    });
    
    console.log(`[CRM Sync] Found ${newContacts.length} new contacts since last sync`);
    
    for (const contact of newContacts) {
      try {
        // Zaten import edilmiş mi kontrol et (Set ile hızlı kontrol)
        const sourceRefKey = `contact_${contact.id}`;
        if (existingSourceRefs.has(sourceRefKey)) {
          results.skipped++;
          continue;
        }
        
        const originalTimestamp = toFirestoreTimestamp(contact.createdAt);
        
        await createConversation({
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          company: contact.company || '',
          channel: CHANNEL.CONTACT_FORM,
          subject: contact.service || contact.product || 'İletişim Formu',
          message: contact.message || '',
          status: mapContactStatusToConversationStatus(contact.status),
          priority: mapPriority(contact.priority),
          sourceRef: { type: 'contact', id: contact.id },
          createdBy,
          assignedTo: contact.assignedTo || null,
          tags: contact.tags || [],
          snoozedUntil: (() => {
            if (!contact.followUpDate) return null;
            if (contact.followUpDate.toDate) return contact.followUpDate;
            const d = new Date(contact.followUpDate);
            return !isNaN(d.getTime()) ? Timestamp.fromDate(d) : null;
          })(),
          channelMetadata: {
            originalCreatedAt: originalTimestamp,
            legacySystem: 'contacts',
            source: contact.source || null,
            responseTime: contact.responseTime || null,
            legacyNotes: contact.notes || [],
            legacyStatus: contact.status,
            legacyPriority: contact.priority,
            syncedAt: new Date().toISOString(),
          },
        });
        
        results.imported++;
        console.log(`[CRM Sync] Contact imported: ${contact.id}`);
      } catch (error) {
        console.error(`[CRM Sync] Error importing contact ${contact.id}:`, error);
        results.errors.push({ contactId: contact.id, error: error.message });
      }
    }
  } catch (error) {
    console.error("[CRM Sync] Error syncing contacts:", error);
    results.errors.push({ error: error.message });
  }
  
  return results;
};

/**
 * Son sync'ten sonra eklenen quotes'ları import et
 */
const syncNewQuotes = async (lastSyncTime, createdBy, existingSourceRefs) => {
  const results = { imported: 0, skipped: 0, errors: [] };
  
  try {
    console.log("[CRM Sync] Fetching quotes...");
    const quotesResponse = await getQuotes({ limit: 1000 });
    const allQuotes = quotesResponse?.quotes || [];
    
    // Son sync'ten sonra eklenenleri filtrele
    const newQuotes = allQuotes.filter(quote => {
      if (!lastSyncTime) return true;
      
      const quoteDate = quote.metadata?.submissionDate?.toDate?.() ||
                       quote.createdAt?.toDate?.() ||
                       (quote.createdAt ? new Date(quote.createdAt) : null);
      
      return quoteDate && quoteDate > lastSyncTime;
    });
    
    console.log(`[CRM Sync] Found ${newQuotes.length} new quotes since last sync`);
    
    for (const quote of newQuotes) {
      try {
        // Zaten import edilmiş mi kontrol et (Set ile hızlı kontrol)
        const sourceRefKey = `quote_${quote.id}`;
        if (existingSourceRefs.has(sourceRefKey)) {
          results.skipped++;
          continue;
        }
        
        const firstName = quote.contactInfo?.firstName || '';
        const lastName = quote.contactInfo?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'İsimsiz';
        
        const projectName = quote.projectInfo?.projectName || '';
        const serviceArea = quote.projectInfo?.serviceArea || '';
        const serviceSubcategory = quote.projectInfo?.serviceSubcategory || '';
        const subject = projectName || 
                        (serviceArea && serviceSubcategory ? `${serviceArea} - ${serviceSubcategory}` : '') ||
                        'Teklif Talebi';
        
        const message = quote.projectInfo?.projectDescription || 
                        quote.additionalInfo?.notes || '';
        
        const quoteOriginalDate = quote.metadata?.submissionDate || quote.createdAt;
        const quoteTimestamp = toFirestoreTimestamp(quoteOriginalDate);
        
        await createConversation({
          name: fullName,
          email: quote.contactInfo?.email || '',
          phone: quote.contactInfo?.phone || '',
          company: quote.contactInfo?.company || '',
          channel: CHANNEL.QUOTE_FORM,
          subject: subject,
          message: message,
          status: mapQuoteStatusToConversationStatus(quote.metadata?.status),
          priority: mapPriority(quote.metadata?.priority),
          sourceRef: { type: 'quote', id: quote.id },
          createdBy,
          assignedTo: quote.metadata?.assignedTo || null,
          channelMetadata: {
            originalCreatedAt: quoteTimestamp,
            legacySystem: 'quotes',
            serviceArea: serviceArea,
            serviceSubcategory: serviceSubcategory,
            targetMarket: quote.projectInfo?.targetMarket,
            estimatedQuantity: quote.projectInfo?.estimatedQuantity || null,
            budget: quote.projectInfo?.budget || null,
            targetLaunchDate: quote.projectInfo?.targetLaunchDate || null,
            additionalNotes: quote.additionalInfo?.notes || null,
            adminNotes: quote.metadata?.adminNotes || null,
            legacyStatus: quote.metadata?.status,
            legacyPriority: quote.metadata?.priority,
            contactPosition: quote.contactInfo?.position || null,
            contactCountry: quote.contactInfo?.country || null,
            syncedAt: new Date().toISOString(),
          },
        });
        
        results.imported++;
        console.log(`[CRM Sync] Quote imported: ${quote.id}`);
      } catch (error) {
        console.error(`[CRM Sync] Error importing quote ${quote.id}:`, error);
        results.errors.push({ quoteId: quote.id, error: error.message });
      }
    }
  } catch (error) {
    console.error("[CRM Sync] Error syncing quotes:", error);
    results.errors.push({ error: error.message });
  }
  
  return results;
};

/**
 * Son sync'ten sonra eklenen email threads'leri import et
 */
const syncNewEmailThreads = async (lastSyncTime, createdBy, existingSourceRefs) => {
  const results = { imported: 0, skipped: 0, errors: [] };
  
  try {
    console.log("[CRM Sync] Fetching email threads...");
    const allThreads = await getActiveThreads();
    
    // Son sync'ten sonra eklenenleri filtrele
    const newThreads = (allThreads || []).filter(thread => {
      if (!lastSyncTime) return true;
      
      const threadDate = thread.createdAt?.toDate?.() ||
                        (thread.createdAt ? new Date(thread.createdAt) : null);
      
      return threadDate && threadDate > lastSyncTime;
    });
    
    console.log(`[CRM Sync] Found ${newThreads.length} new email threads since last sync`);
    
    for (const thread of newThreads) {
      try {
        // Zaten import edilmiş mi kontrol et (Set ile hızlı kontrol)
        const sourceRefKey = `email_thread_${thread.id}`;
        if (existingSourceRefs.has(sourceRefKey)) {
          results.skipped++;
          continue;
        }
        
        const threadTimestamp = toFirestoreTimestamp(thread.createdAt);
        
        await createConversation({
          name: thread.toEmail?.split('@')[0] || '',
          email: thread.toEmail || '',
          phone: '',
          company: '',
          channel: CHANNEL.EMAIL,
          subject: thread.subject || 'E-posta',
          message: '',
          status: CONVERSATION_STATUS.OPEN,
          priority: PRIORITY.NORMAL,
          sourceRef: { type: 'email_thread', id: thread.id },
          createdBy,
          channelMetadata: {
            conversationId: thread.conversationId,
            messageId: thread.messageId,
            originalCreatedAt: threadTimestamp,
            legacySystem: 'email_threads',
            syncedAt: new Date().toISOString(),
          },
        });
        
        results.imported++;
        console.log(`[CRM Sync] Email thread imported: ${thread.id}`);
      } catch (error) {
        console.error(`[CRM Sync] Error importing email thread ${thread.id}:`, error);
        results.errors.push({ threadId: thread.id, error: error.message });
      }
    }
  } catch (error) {
    console.error("[CRM Sync] Error syncing email threads:", error);
    results.errors.push({ error: error.message });
  }
  
  return results;
};

// =============================================================================
// OUTLOOK EMAIL SYNC HELPERS
// =============================================================================

/**
 * Email'in spam olup olmadığını kontrol et
 */
const isSpamEmail = (email) => {
  const fromAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
  const fromName = email.from?.emailAddress?.name?.toLowerCase() || '';
  
  for (const spamDomain of SPAM_DOMAINS) {
    if (fromAddress.includes(spamDomain) || fromName.includes(spamDomain)) {
      return true;
    }
  }
  return false;
};

/**
 * Email'in iç mail olup olmadığını kontrol et
 */
const isInternalEmail = (email) => {
  const fromAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
  for (const domain of INTERNAL_DOMAINS) {
    if (fromAddress.includes(domain)) {
      return true;
    }
  }
  return false;
};

/**
 * Email'den öncelik belirle
 */
const determineEmailPriority = (email) => {
  const importance = email.importance?.toLowerCase();
  if (importance === 'high') return PRIORITY.HIGH;
  if (importance === 'low') return PRIORITY.LOW;
  return PRIORITY.NORMAL;
};

/**
 * Email subject'inden konu çıkar
 */
const cleanEmailSubject = (subject) => {
  if (!subject) return 'E-posta';
  return subject
    .replace(/^(re:|fw:|fwd:|yanıt:|ynt:|ileti:)\s*/gi, '')
    .trim() || 'E-posta';
};

/**
 * Conversation'daki tüm katılımcı email adreslerini topla
 * (sender, toRecipients, ccRecipients ve mesajlardaki adresler)
 */
const getConversationParticipants = async (conversationId, conversationData) => {
  const participants = new Set();
  
  // Conversation'daki bilgilerden
  if (conversationData.sender?.email) {
    participants.add(conversationData.sender.email.toLowerCase());
  }
  
  // toRecipients
  const toRecipients = conversationData.channelMetadata?.toRecipients || [];
  toRecipients.forEach(r => {
    const email = typeof r === 'string' ? r : r?.address;
    if (email) participants.add(email.toLowerCase());
  });
  
  // ccRecipients
  const ccRecipients = conversationData.channelMetadata?.ccRecipients || [];
  ccRecipients.forEach(r => {
    const email = typeof r === 'string' ? r : r?.address;
    if (email) participants.add(email.toLowerCase());
  });
  
  // Mesajlardaki email adresleri
  try {
    const messagesQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    
    messagesSnapshot.forEach(doc => {
      const msg = doc.data();
      if (msg.senderEmail) participants.add(msg.senderEmail.toLowerCase());
      if (msg.emailMetadata?.to) participants.add(msg.emailMetadata.to.toLowerCase());
    });
  } catch (e) {
    console.error('[CRM Sync] Error getting message participants:', e);
  }
  
  // MKN email'lerini çıkar (kendi emaillerimiz eşleşmeyi bozmasın)
  const mknEmails = ['info@mkngroup.com.tr', 'satis@mkngroup.com.tr', 'destek@mkngroup.com.tr'];
  mknEmails.forEach(e => participants.delete(e));
  
  return participants;
};

/**
 * Email thread eşleştirme - Çok katmanlı strateji
 * 
 * ⚠️ ÖNEMLİ: Tüm kanalları arar (email, quote_form, contact_form, vb.)
 * Çünkü teklif/iletişim formuna email ile cevap verildiğinde,
 * müşterinin reply'ı o form conversation'ına eklenmeli.
 * 
 * Eşleşme sırası (ilk eşleşen döner):
 * 1. outlookConversationId ile tam eşleşme (TÜM KANALLARDA)
 * 2. Subject + katılımcı email eşleşmesi (TÜM KANALLARDA)
 */
const findConversationByOutlookId = async (outlookConversationId, email = null) => {
  try {
    // 🔴 TÜM conversation'ları çek (sadece email değil!)
    // Çünkü quote_form veya contact_form'a email ile cevap verildiğinde
    // outlookConversationId o conversation'a kaydediliyor
    const allConversationsSnapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
    
    const incomingSender = email?.from?.emailAddress?.address?.toLowerCase();
    const incomingSubject = email ? cleanEmailSubject(email.subject) : null;
    // Email'in alıcılarını da al (bizim adresimiz olabilir)
    const incomingTo = email?.toRecipients?.map(r => r.emailAddress?.address?.toLowerCase()).filter(Boolean) || [];
    
    console.log(`[CRM Sync] Looking for thread match (ALL CHANNELS):`, {
      outlookConversationId,
      incomingSender,
      incomingSubject,
      incomingTo,
      totalConversations: allConversationsSnapshot.docs.length
    });
    
    // 1. Önce outlookConversationId ile eşleşme dene (TÜM KANALLARDA)
    if (outlookConversationId) {
      for (const docSnap of allConversationsSnapshot.docs) {
        const data = docSnap.data();
        if (data.channelMetadata?.outlookConversationId === outlookConversationId) {
          console.log(`[CRM Sync] ✅ Found by outlookConversationId (channel: ${data.channel}): ${docSnap.id}`);
          return { id: docSnap.id, ...data };
        }
      }
      console.log(`[CRM Sync] No match by outlookConversationId in any channel`);
    }
    
    // 2. Subject + sender/katılımcı ile eşleşme (TÜM KANALLARDA)
    if (email && incomingSubject) {
      for (const docSnap of allConversationsSnapshot.docs) {
        const data = docSnap.data();
        const convSubject = cleanEmailSubject(data.subject);
        
        // Subject eşleşmesi - tam eşleşme veya biri diğerini içeriyor olmalı
        const subjectMatch = convSubject === incomingSubject ||
          convSubject.includes(incomingSubject) ||
          incomingSubject.includes(convSubject);
        
        if (!subjectMatch) {
          continue;
        }
        
        // Conversation'daki email adresleri
        const convSender = data.sender?.email?.toLowerCase();
        const convToRecipients = (data.channelMetadata?.toRecipients || []).map(r => 
          (typeof r === 'string' ? r : r?.address || '').toLowerCase()
        ).filter(Boolean);
        
        // EŞLEŞME KONTROLÜ:
        // 1. Gelen email'in sender'ı = conversation'ın sender'ı (aynı müşteri)
        // 2. VEYA gelen email'in sender'ı conversation'ın toRecipients'ında (müşteri reply yapıyor)
        // 3. VEYA gelen email'in toRecipients'ı conversation'ın sender'ını içeriyor (biz reply yapıyoruz)
        
        const senderIsSame = incomingSender && convSender === incomingSender;
        const senderWasRecipient = incomingSender && convToRecipients.includes(incomingSender);
        const recipientIsSender = incomingTo.some(to => to === convSender);
        
        const isMatch = senderIsSame || senderWasRecipient || recipientIsSender;
        
        console.log(`[CRM Sync] Checking conversation ${docSnap.id} (channel: ${data.channel}):`, {
          convSubject,
          convSender,
          convToRecipients,
          senderIsSame,
          senderWasRecipient,
          recipientIsSender,
          isMatch
        });
        
        if (isMatch) {
          console.log(`[CRM Sync] ✅ Found by subject+email match (channel: ${data.channel}): ${docSnap.id}`);
          
          // outlookConversationId'yi güncelle (gelecek eşleşmeler için)
          if (outlookConversationId && !data.channelMetadata?.outlookConversationId) {
            try {
              const { updateDoc } = await import('firebase/firestore');
              await updateDoc(docSnap.ref, {
                'channelMetadata.outlookConversationId': outlookConversationId,
              });
              console.log(`[CRM Sync] Updated outlookConversationId for ${data.channel} conversation`);
            } catch (e) {
              console.log(`[CRM Sync] Could not update outlookConversationId:`, e.message);
            }
          }
          
          return { id: docSnap.id, ...data };
        }
      }
      console.log(`[CRM Sync] No match by subject+email in any channel`);
    }
    
    console.log(`[CRM Sync] ❌ No existing conversation found in any channel`);
    return null;
  } catch (error) {
    console.error("[CRM Sync] Error finding conversation:", error);
    return null;
  }
};

/**
 * Mevcut email ID'lerini al (duplicate kontrolü)
 * Hem conversations hem de messages'tan kontrol eder
 */
const getExistingOutlookEmailIds = async () => {
  try {
    const existingIds = new Set();
    
    // 1. Conversations'tan email ID'lerini al
    const convQuery = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('channel', '==', CHANNEL.EMAIL)
    );
    const convSnapshot = await getDocs(convQuery);
    
    convSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.channelMetadata?.outlookMessageId) {
        existingIds.add(data.channelMetadata.outlookMessageId);
      }
      if (data.channelMetadata?.internetMessageId) {
        existingIds.add(data.channelMetadata.internetMessageId);
      }
    });
    
    // 2. Messages'tan email ID'lerini al (thread'e eklenen mesajlar)
    const msgQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('channel', '==', CHANNEL.EMAIL)
    );
    const msgSnapshot = await getDocs(msgQuery);
    
    msgSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.emailMetadata?.outlookMessageId) {
        existingIds.add(data.emailMetadata.outlookMessageId);
      }
      if (data.emailMetadata?.internetMessageId) {
        existingIds.add(data.emailMetadata.internetMessageId);
      }
    });
    
    console.log(`[CRM Sync] Found ${existingIds.size} existing email IDs (conversations + messages)`);
    return existingIds;
  } catch (error) {
    console.error("[CRM Sync] Error getting existing email IDs:", error);
    return new Set();
  }
};

/**
 * Outlook Inbox'tan emailleri senkronize et
 * API route üzerinden çalışır (client-side uyumlu)
 */
const syncOutlookEmails = async (lastSyncTime, createdBy) => {
  const results = { imported: 0, skipped: 0, addedToThread: 0, errors: [] };
  
  try {
    console.log("[CRM Sync] Fetching Outlook emails via API...");
    
    // Kaç gün geriye gidileceğini belirle
    let filterDate = lastSyncTime;
    if (!filterDate) {
      const emailSyncDays = await getEmailSyncDays();
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - emailSyncDays);
      filterDate = daysAgo;
    }
    
    const filterDateStr = filterDate.toISOString();
    console.log(`[CRM Sync] Fetching emails since: ${filterDateStr}`);
    
    // Mevcut email ID'lerini al
    const existingIds = await getExistingOutlookEmailIds();
    console.log(`[CRM Sync] Found ${existingIds.size} existing email IDs`);
    
    // API route üzerinden emailleri çek - PAGINATION ile tüm emailleri al
    const filter = encodeURIComponent(`receivedDateTime ge ${filterDateStr}`);
    const select = encodeURIComponent('id,subject,from,toRecipients,ccRecipients,receivedDateTime,isRead,hasAttachments,bodyPreview,body,importance,conversationId,internetMessageId');
    
    // Pagination: 100'er 100'er çek, maksimum 500 email (5 sayfa)
    const MAX_PAGES = 5;
    const PAGE_SIZE = 100;
    let allEmails = [];
    let currentPage = 0;
    
    while (currentPage < MAX_PAGES) {
      const skip = currentPage * PAGE_SIZE;
      const apiUrl = `/api/admin/outlook/emails?folderId=inbox&top=${PAGE_SIZE}&skip=${skip}&filter=${filter}&select=${select}`;
      console.log(`[CRM Sync] Calling API (page ${currentPage + 1}): ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      console.log(`[CRM Sync] API Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CRM Sync] API Error response: ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[CRM Sync] API Response (page ${currentPage + 1}):`, { success: data.success, emailCount: data.emails?.length, error: data.error });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch emails from API');
      }
      
      const pageEmails = data.emails || [];
      allEmails = [...allEmails, ...pageEmails];
      
      // Daha az email geldiyse son sayfaya ulaştık
      if (pageEmails.length < PAGE_SIZE) {
        console.log(`[CRM Sync] Last page reached (${pageEmails.length} emails)`);
        break;
      }
      
      currentPage++;
    }
    
    console.log(`[CRM Sync] Total fetched ${allEmails.length} emails from Outlook (${currentPage + 1} pages)`);
    
    for (const email of allEmails) {
      try {
        // Spam kontrolü
        if (isSpamEmail(email)) {
          results.skipped++;
          continue;
        }
        
        // İç mail kontrolü
        if (isInternalEmail(email) && !email.conversationId) {
          results.skipped++;
          continue;
        }
        
        // Zaten import edilmiş mi?
        if (existingIds.has(email.id) || existingIds.has(email.internetMessageId)) {
          results.skipped++;
          continue;
        }
        
        // Mevcut bir thread'in parçası mı?
        // outlookConversationId ile veya subject+sender ile eşleşme dene
        const existingConversation = await findConversationByOutlookId(email.conversationId, email);
        
        if (existingConversation) {
          // Mevcut conversation'a mesaj olarak ekle
          // Email body içeriğini al - HTML veya text
          const emailBodyContent = email.body?.content || '';
          const emailBodyType = email.body?.contentType || 'text'; // 'html' veya 'text'
          const fallbackContent = email.bodyPreview || '';
          
          // İçerik boşsa bodyPreview kullan
          const finalContent = emailBodyContent.trim() || fallbackContent;
          
          await addMessage(existingConversation.id, {
            content: finalContent,
            contentHtml: emailBodyType === 'html' ? emailBodyContent : null, // HTML içeriği ayrı sakla
            direction: 'inbound',
            channel: CHANNEL.EMAIL,
            senderName: email.from?.emailAddress?.name || '',
            senderEmail: email.from?.emailAddress?.address || '',
            attachments: email.hasAttachments ? [{ hasAttachments: true }] : [],
            createdBy,
            emailMetadata: {
              outlookMessageId: email.id,
              internetMessageId: email.internetMessageId,
              receivedDateTime: email.receivedDateTime,
              isRead: email.isRead,
              bodyType: emailBodyType, // 'html' veya 'text'
              bodyLength: finalContent.length, // Debug için içerik uzunluğu
            },
          });
          
          // ✅ Runtime duplicate protection - eklenen email ID'lerini set'e ekle
          if (email.id) existingIds.add(email.id);
          if (email.internetMessageId) existingIds.add(email.internetMessageId);
          
          // Conversation'ı güncelle - Müşteriden yanıt geldi, bizden cevap bekleniyor!
          await updateConversation(existingConversation.id, {
            status: CONVERSATION_STATUS.OPEN,
            replyStatus: REPLY_STATUS.AWAITING_US, // 🔴 Bizden cevap bekleniyor
            lastMessageAt: serverTimestamp(),
            unreadCount: (existingConversation.unreadCount || 0) + 1,
          }, createdBy);
          
          results.addedToThread++;
          console.log(`[CRM Sync] Added email to existing thread: ${existingConversation.id}`);
        } else {
          // Yeni conversation oluştur
          const senderEmail = email.from?.emailAddress?.address || '';
          const senderName = email.from?.emailAddress?.name || senderEmail.split('@')[0] || 'Bilinmeyen';
          
          // Email tarihini Firestore Timestamp'a çevir
          const emailReceivedAt = email.receivedDateTime 
            ? Timestamp.fromDate(new Date(email.receivedDateTime))
            : null;
          
          // Email body içeriğini al - HTML veya text
          const emailBodyContent = email.body?.content || '';
          const emailBodyType = email.body?.contentType || 'text';
          const fallbackContent = email.bodyPreview || '';
          const finalContent = emailBodyContent.trim() || fallbackContent;
          
          await createConversation({
            name: senderName,
            email: senderEmail,
            phone: '',
            company: '',
            channel: CHANNEL.EMAIL,
            subject: cleanEmailSubject(email.subject),
            message: finalContent,
            messageHtml: emailBodyType === 'html' ? emailBodyContent : null, // HTML içeriği ayrı
            status: CONVERSATION_STATUS.OPEN,
            priority: determineEmailPriority(email),
            createdBy,
            channelMetadata: {
              outlookMessageId: email.id,
              outlookConversationId: email.conversationId,
              internetMessageId: email.internetMessageId,
              receivedDateTime: email.receivedDateTime,
              // Orijinal email tarihi - listede gösterilecek ve sıralamada kullanılacak
              // Timestamp formatında olmalı ki conversation-service doğru işlesin
              originalCreatedAt: emailReceivedAt,
              isRead: email.isRead,
              hasAttachments: email.hasAttachments,
              importance: email.importance,
              toRecipients: email.toRecipients?.map(r => r.emailAddress?.address) || [],
              ccRecipients: email.ccRecipients?.map(r => r.emailAddress?.address) || [],
              syncedAt: new Date().toISOString(),
              bodyType: emailBodyType, // 'html' veya 'text'
              bodyLength: finalContent.length, // Debug için içerik uzunluğu
            },
          });
          
          // ✅ Runtime duplicate protection - eklenen email ID'lerini set'e ekle
          if (email.id) existingIds.add(email.id);
          if (email.internetMessageId) existingIds.add(email.internetMessageId);
          
          results.imported++;
        }
      } catch (error) {
        console.error(`[CRM Sync] Error processing email ${email.id}:`, error);
        results.errors.push({ emailId: email.id, error: error.message });
      }
    }
    
    console.log(`[CRM Sync] Outlook sync done. Imported: ${results.imported}, Threads: ${results.addedToThread}, Skipped: ${results.skipped}`);
  } catch (error) {
    console.error("[CRM Sync] Error syncing Outlook emails:", error);
    results.errors.push({ error: error.message });
  }
  
  return results;
};

// =============================================================================
// MAIN SYNC FUNCTIONS
// =============================================================================

/**
 * Birleşik senkronizasyon - Formlar + Emailler
 * 
 * ⚠️ SYNC LOCK: Paralel çalışma engellenmiştir.
 * Aynı anda sadece bir sync işlemi çalışabilir.
 * 
 * Manuel buton veya otomatik tetikleme için kullanılır
 */
export const syncNewData = async (options = {}) => {
  const {
    syncContacts = true,
    syncQuotes = true,
    syncEmailThreads = true,
    syncOutlook = true, // Outlook inbox sync
    createdBy = null,
    forceSync = false,
  } = options;
  
  const operationId = `unified_sync_${Date.now()}`;
  
  console.log("[CRM Sync] Starting unified sync...");
  
  // 🔒 SYNC LOCK - Paralel işlemleri engelle
  if (!acquireSyncLock(operationId)) {
    console.warn("[CRM Sync] ⚠️ Another sync is in progress, skipping...");
    return {
      skipped: true,
      skipReason: 'sync_locked',
      message: 'Başka bir senkronizasyon işlemi devam ediyor. Lütfen bekleyin.',
    };
  }
  
  try {
    // Sync gerekli mi kontrol et
    if (!forceSync) {
      const needsSync = await isSyncNeeded();
      if (!needsSync) {
        const syncInterval = await getSyncIntervalMinutes();
        console.log("[CRM Sync] Sync not needed, skipping...");
        releaseSyncLock(operationId);
        return {
          skipped: true,
          message: `Son senkronizasyondan bu yana ${syncInterval} dakika geçmedi.`,
        };
      }
    }
  
  // Son sync zamanını al
  const syncData = await getLastSyncTime();
  const lastSyncTime = syncData?.lastSyncAt || null;
  
  console.log(`[CRM Sync] Last sync time: ${lastSyncTime?.toISOString() || 'Never'}`);
  
  // Mevcut sourceRef'leri al
  const existingSourceRefs = await getExistingSourceRefs();
  
  const results = {
    contacts: { imported: 0, skipped: 0, errors: [] },
    quotes: { imported: 0, skipped: 0, errors: [] },
    emailThreads: { imported: 0, skipped: 0, errors: [] },
    outlookEmails: { imported: 0, skipped: 0, addedToThread: 0, errors: [] },
    syncedAt: new Date().toISOString(),
  };
  
  // 1. Contact form senkronizasyonu
  if (syncContacts) {
    results.contacts = await syncNewContacts(lastSyncTime, createdBy, existingSourceRefs);
  }
  
  // 2. Quote form senkronizasyonu
  if (syncQuotes) {
    results.quotes = await syncNewQuotes(lastSyncTime, createdBy, existingSourceRefs);
  }
  
  // 3. Legacy email threads senkronizasyonu
  if (syncEmailThreads) {
    results.emailThreads = await syncNewEmailThreads(lastSyncTime, createdBy, existingSourceRefs);
  }
  
  // 4. Outlook inbox senkronizasyonu
  if (syncOutlook) {
    try {
      // Outlook için ayrı lastEmailSyncAt zamanı kullan
      // Eğer hiç email sync yapılmamışsa, DEFAULT_EMAIL_SYNC_DAYS gün geriye git
      const emailSyncTime = syncData?.lastEmailSyncAt || null;
      results.outlookEmails = await syncOutlookEmails(emailSyncTime, createdBy);
    } catch (error) {
      console.error("[CRM Sync] Outlook sync failed:", error);
      results.outlookEmails.errors.push({ error: error.message });
    }
  }
  
  // Son sync zamanını güncelle
  await updateLastSyncTime(createdBy, results);
  
  const totalImported = 
    results.contacts.imported + 
    results.quotes.imported + 
    results.emailThreads.imported +
    results.outlookEmails.imported;
  
  const totalSkipped = 
    results.contacts.skipped + 
    results.quotes.skipped + 
    results.emailThreads.skipped +
    results.outlookEmails.skipped;
  
  const totalErrors = 
    results.contacts.errors.length + 
    results.quotes.errors.length + 
    results.emailThreads.errors.length +
    results.outlookEmails.errors.length;
  
  const totalThreadUpdates = results.outlookEmails.addedToThread || 0;
  
  console.log(`[CRM Sync] Unified sync completed. Imported: ${totalImported}, Thread updates: ${totalThreadUpdates}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);
  
  // 🔓 SYNC LOCK RELEASE
  releaseSyncLock(operationId);
  
  return {
    skipped: false,
    results,
    summary: {
      imported: totalImported,
      skipped: totalSkipped,
      errors: totalErrors,
      threadUpdates: totalThreadUpdates,
      // Detaylı özet
      forms: results.contacts.imported + results.quotes.imported,
      emails: results.outlookEmails.imported + results.outlookEmails.addedToThread,
    },
  };
  } catch (error) {
    console.error("[CRM Sync] Unified sync error:", error);
    // 🔓 SYNC LOCK RELEASE (hata durumunda da)
    releaseSyncLock(operationId);
    throw error;
  }
};

/**
 * Otomatik senkronizasyon kontrolü
 * Sayfa yüklendiğinde çağrılır, gerekirse senkronize eder
 */
export const autoSyncIfNeeded = async (userId = null) => {
  try {
    console.log("[CRM Sync] Checking if auto-sync is needed...");
    
    const needsSync = await isSyncNeeded();
    
    if (needsSync) {
      console.log("[CRM Sync] Auto-sync triggered");
      return await syncNewData({
        createdBy: userId,
        forceSync: true,
      });
    }
    
    console.log("[CRM Sync] Auto-sync not needed");
    return {
      skipped: true,
      message: "Otomatik senkronizasyon gerekli değil.",
    };
  } catch (error) {
    console.error("[CRM Sync] Auto-sync error:", error);
    return {
      skipped: true,
      error: error.message,
    };
  }
};

/**
 * Manuel senkronizasyon (buton ile)
 * Interval kontrolünü atlar, hemen senkronize eder
 */
export const manualSync = async (userId = null) => {
  console.log("[CRM Sync] Manual sync triggered");
  
  return await syncNewData({
    createdBy: userId,
    forceSync: true,
  });
};

// =============================================================================
// SYNC STATUS HOOK HELPER
// =============================================================================

/**
 * Sync durumunu formatla (UI için)
 * Not: syncInterval parametre olarak verilebilir, yoksa varsayılan kullanılır
 */
export const formatSyncStatus = (syncData, syncInterval = DEFAULT_SETTINGS.sync.syncInterval) => {
  if (!syncData || !syncData.lastSyncAt) {
    return {
      label: "Hiç senkronize edilmedi",
      color: "text-orange-600",
      canSync: true,
    };
  }
  
  const lastSyncDate = new Date(syncData.lastSyncAt);
  const now = new Date();
  const diffMinutes = Math.round((now - lastSyncDate) / (1000 * 60));
  
  if (diffMinutes < 1) {
    return {
      label: "Az önce senkronize edildi",
      color: "text-green-600",
      canSync: false,
    };
  } else if (diffMinutes < 60) {
    return {
      label: `${diffMinutes} dakika önce`,
      color: diffMinutes >= syncInterval ? "text-orange-600" : "text-green-600",
      canSync: diffMinutes >= syncInterval,
    };
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return {
      label: `${hours} saat önce`,
      color: "text-orange-600",
      canSync: true,
    };
  } else {
    const days = Math.floor(diffMinutes / 1440);
    return {
      label: `${days} gün önce`,
      color: "text-red-600",
      canSync: true,
    };
  }
};

// =============================================================================
// MANUEL EMAIL IMPORT - Tek bir email'i ID veya arama ile çek
// =============================================================================

/**
 * Outlook'tan tek bir email'i ID ile çekip CRM'e yaz
 * @param {string} outlookMessageId - Outlook Message ID
 * @param {string} createdBy - İşlemi yapan kullanıcı
 * @returns {Object} İşlem sonucu
 */
export const importSingleEmailById = async (outlookMessageId, createdBy = null) => {
  try {
    console.log(`[CRM Sync] Importing single email by ID: ${outlookMessageId}`);
    
    // Zaten var mı kontrol et
    const existingIds = await getExistingOutlookEmailIds();
    if (existingIds.has(outlookMessageId)) {
      return {
        success: false,
        error: 'Bu email zaten CRM\'de mevcut.',
        alreadyExists: true,
      };
    }
    
    // Email detayını API'den çek
    const apiUrl = `/api/admin/outlook/emails/${encodeURIComponent(outlookMessageId)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Outlook API hatası: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.email) {
      throw new Error(data.error || 'Email bulunamadı');
    }
    
    const email = data.email;
    console.log(`[CRM Sync] Found email:`, { subject: email.subject, from: email.from?.emailAddress?.address });
    
    // Email'i CRM'e ekle
    const result = await processSingleEmail(email, createdBy);
    
    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error('[CRM Sync] Error importing single email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Outlook'ta email ara ve sonuçları döndür
 * @param {string} searchQuery - Arama sorgusu (konu, gönderen, vb.)
 * @returns {Array} Bulunan emailler
 */
export const searchOutlookEmails = async (searchQuery) => {
  try {
    console.log(`[CRM Sync] Searching Outlook emails: ${searchQuery}`);
    
    const apiUrl = `/api/admin/outlook/search?q=${encodeURIComponent(searchQuery)}&top=20`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Arama hatası: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Arama başarısız');
    }
    
    // Mevcut ID'leri al
    const existingIds = await getExistingOutlookEmailIds();
    
    // Her email için CRM'de olup olmadığını işaretle
    const emails = (data.emails || []).map(email => ({
      id: email.id,
      subject: email.subject || '(Konusuz)',
      from: email.from?.emailAddress?.address || '',
      fromName: email.from?.emailAddress?.name || '',
      receivedDateTime: email.receivedDateTime,
      bodyPreview: email.bodyPreview?.substring(0, 100) || '',
      isInCrm: existingIds.has(email.id) || existingIds.has(email.internetMessageId),
    }));
    
    return {
      success: true,
      emails,
      total: emails.length,
    };
  } catch (error) {
    console.error('[CRM Sync] Error searching emails:', error);
    return {
      success: false,
      error: error.message,
      emails: [],
    };
  }
};

/**
 * Tek bir email'i işleyip CRM'e ekle (internal helper)
 */
const processSingleEmail = async (email, createdBy) => {
  // Email body içeriğini al
  const emailBodyContent = email.body?.content || '';
  const emailBodyType = email.body?.contentType || 'text';
  const fallbackContent = email.bodyPreview || '';
  const finalContent = emailBodyContent.trim() || fallbackContent;
  
  // Mevcut conversation var mı?
  const existingConversation = await findConversationByOutlookId(email.conversationId, email);
  
  if (existingConversation) {
    // Mevcut thread'e ekle
    await addMessage(existingConversation.id, {
      content: finalContent,
      contentHtml: emailBodyType === 'html' ? emailBodyContent : null,
      direction: 'inbound',
      channel: CHANNEL.EMAIL,
      senderName: email.from?.emailAddress?.name || '',
      senderEmail: email.from?.emailAddress?.address || '',
      attachments: email.hasAttachments ? [{ hasAttachments: true }] : [],
      createdBy,
      emailMetadata: {
        outlookMessageId: email.id,
        internetMessageId: email.internetMessageId,
        receivedDateTime: email.receivedDateTime,
        isRead: email.isRead,
        bodyType: emailBodyType,
        bodyLength: finalContent.length,
        manualImport: true, // Manuel import olduğunu işaretle
      },
    });
    
    // Conversation'ı güncelle
    await updateConversation(existingConversation.id, {
      status: CONVERSATION_STATUS.OPEN,
      replyStatus: REPLY_STATUS.AWAITING_US,
    }, createdBy);
    
    return {
      action: 'added_to_thread',
      conversationId: existingConversation.id,
      subject: email.subject,
      from: email.from?.emailAddress?.address,
    };
  } else {
    // Yeni conversation oluştur
    const senderEmail = email.from?.emailAddress?.address || '';
    const senderName = email.from?.emailAddress?.name || senderEmail.split('@')[0] || 'Bilinmeyen';
    
    const emailReceivedAt = email.receivedDateTime 
      ? Timestamp.fromDate(new Date(email.receivedDateTime))
      : null;
    
    const newConv = await createConversation({
      name: senderName,
      email: senderEmail,
      phone: '',
      company: '',
      channel: CHANNEL.EMAIL,
      subject: cleanEmailSubject(email.subject),
      message: finalContent,
      messageHtml: emailBodyType === 'html' ? emailBodyContent : null,
      status: CONVERSATION_STATUS.OPEN,
      priority: determineEmailPriority(email),
      createdBy,
      channelMetadata: {
        outlookMessageId: email.id,
        outlookConversationId: email.conversationId,
        internetMessageId: email.internetMessageId,
        receivedDateTime: email.receivedDateTime,
        originalCreatedAt: emailReceivedAt,
        isRead: email.isRead,
        hasAttachments: email.hasAttachments,
        importance: email.importance,
        toRecipients: email.toRecipients?.map(r => r.emailAddress?.address) || [],
        ccRecipients: email.ccRecipients?.map(r => r.emailAddress?.address) || [],
        syncedAt: new Date().toISOString(),
        bodyType: emailBodyType,
        bodyLength: finalContent.length,
        manualImport: true,
      },
    });
    
    return {
      action: 'new_conversation',
      conversationId: newConv.id,
      subject: email.subject,
      from: senderEmail,
    };
  }
};

/**
 * Birden fazla email'i toplu import et
 * @param {Array<string>} emailIds - Outlook Message ID'leri
 * @param {string} createdBy - İşlemi yapan kullanıcı
 */
export const importMultipleEmails = async (emailIds, createdBy = null) => {
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    details: [],
  };
  
  for (const emailId of emailIds) {
    try {
      const result = await importSingleEmailById(emailId, createdBy);
      
      if (result.success) {
        results.success++;
        results.details.push(result);
      } else if (result.alreadyExists) {
        results.skipped++;
      } else {
        results.failed++;
        results.errors.push({ emailId, error: result.error });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ emailId, error: error.message });
    }
  }
  
  return results;
};

/**
 * CRM'de mevcut bir email'in içeriğini Outlook'tan yeniden al ve güncelle
 * @param {string} outlookMessageId - Outlook Message ID
 * @param {string} createdBy - İşlemi yapan kullanıcı
 * @returns {Object} Güncelleme sonucu
 */
export const reimportEmailById = async (outlookMessageId, createdBy = null) => {
  try {
    // 1. Outlook'tan email'i detaylı al
    const apiUrl = `/api/admin/outlook/emails/${encodeURIComponent(outlookMessageId)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Email detayı alınamadı: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.email) {
      throw new Error('Email bulunamadı');
    }
    
    const email = data.email;
    
    // Email body içeriğini al
    const emailBodyContent = email.body?.content || '';
    const emailBodyType = email.body?.contentType || 'text';
    const fallbackContent = email.bodyPreview || '';
    const finalContent = emailBodyContent.trim() || fallbackContent;
    
    // 2. CRM'de bu email'i bul - önce messages'ta ara
    const messagesRef = collection(db, 'crm_messages');
    const q = query(messagesRef, where('emailMetadata.outlookMessageId', '==', outlookMessageId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Mesaj bulundu - içeriği güncelle
      const messageDoc = snapshot.docs[0];
      const messageId = messageDoc.id;
      const messageData = messageDoc.data();
      
      await updateDoc(doc(db, 'crm_messages', messageId), {
        content: finalContent,
        contentHtml: emailBodyType === 'html' ? emailBodyContent : null,
        'emailMetadata.bodyType': emailBodyType,
        'emailMetadata.bodyLength': finalContent.length,
        'emailMetadata.reimportedAt': new Date().toISOString(),
        'emailMetadata.reimportedBy': createdBy,
        updatedAt: serverTimestamp(),
      });
      
      return {
        success: true,
        action: 'message_updated',
        messageId,
        conversationId: messageData.conversationId,
        contentLength: finalContent.length,
        subject: email.subject,
      };
    }
    
    // 3. Mesaj bulunamadı, conversation'ın kendisini kontrol et
    const conversationsRef = collection(db, 'crm_conversations');
    const convQuery = query(conversationsRef, where('channelMetadata.outlookMessageId', '==', outlookMessageId));
    const convSnapshot = await getDocs(convQuery);
    
    if (!convSnapshot.empty) {
      // Conversation bulundu
      const convDoc = convSnapshot.docs[0];
      const convId = convDoc.id;
      const convData = convDoc.data();
      
      // Conversation'ı güncelle
      await updateDoc(doc(db, 'crm_conversations', convId), {
        message: finalContent,
        messageHtml: emailBodyType === 'html' ? emailBodyContent : null,
        'channelMetadata.bodyType': emailBodyType,
        'channelMetadata.bodyLength': finalContent.length,
        'channelMetadata.reimportedAt': new Date().toISOString(),
        'channelMetadata.reimportedBy': createdBy,
        updatedAt: serverTimestamp(),
      });
      
      // crm_messages'ta bu conversation için mesaj var mı kontrol et
      const convMsgQuery = query(
        collection(db, 'crm_messages'),
        where('conversationId', '==', convId),
        orderBy('createdAt', 'asc'),
        limit(1)
      );
      const convMsgSnapshot = await getDocs(convMsgQuery);
      
      if (convMsgSnapshot.empty) {
        // İlk mesaj yok - oluştur
        const messageData = {
          conversationId: convId,
          content: finalContent,
          contentHtml: emailBodyType === 'html' ? emailBodyContent : null,
          direction: 'inbound',
          channel: convData.channel || 'email',
          senderName: convData.name || email.from?.emailAddress?.name || '',
          senderEmail: convData.email || email.from?.emailAddress?.address || '',
          status: 'received',
          createdAt: convData.channelMetadata?.originalCreatedAt || convData.createdAt || serverTimestamp(),
          createdBy: createdBy,
          emailMetadata: {
            outlookMessageId: outlookMessageId,
            internetMessageId: email.internetMessageId,
            receivedDateTime: email.receivedDateTime,
            bodyType: emailBodyType,
            bodyLength: finalContent.length,
            reimportedAt: new Date().toISOString(),
            reimportedBy: createdBy,
          },
        };
        
        const newMsgRef = await addDoc(collection(db, 'crm_messages'), messageData);
        
        return {
          success: true,
          action: 'message_created',
          messageId: newMsgRef.id,
          conversationId: convId,
          contentLength: finalContent.length,
          subject: email.subject,
        };
      } else {
        // İlk mesaj var - güncelle
        const firstMsgDoc = convMsgSnapshot.docs[0];
        const firstMsgId = firstMsgDoc.id;
        
        await updateDoc(doc(db, 'crm_messages', firstMsgId), {
          content: finalContent,
          contentHtml: emailBodyType === 'html' ? emailBodyContent : null,
          'emailMetadata.bodyType': emailBodyType,
          'emailMetadata.bodyLength': finalContent.length,
          'emailMetadata.reimportedAt': new Date().toISOString(),
          'emailMetadata.reimportedBy': createdBy,
          updatedAt: serverTimestamp(),
        });
        
        return {
          success: true,
          action: 'first_message_updated',
          messageId: firstMsgId,
          conversationId: convId,
          contentLength: finalContent.length,
          subject: email.subject,
        };
      }
    }
    
    // Hiçbir yerde bulunamadı
    return {
      success: false,
      error: 'Email CRM\'de bulunamadı',
      notFound: true,
    };
    
  } catch (error) {
    console.error('[CRM Sync] Error reimporting email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
