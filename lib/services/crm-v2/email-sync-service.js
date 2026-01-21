/**
 * CRM v2 - Email Sync Service
 * 
 * ⚠️ DEPRECATED: Bu servis artık kullanılmıyor.
 * Tüm senkronizasyon işlemleri sync-service.js üzerinden yapılmalıdır.
 * 
 * Bu dosya geriye dönük uyumluluk için wrapper fonksiyonlar sağlar
 * ve tüm çağrıları sync-service.js'e yönlendirir.
 * 
 * Microsoft Graph API'den inbox emaillerini çeker ve
 * CRM v2 conversation'larına dönüştürür.
 * 
 * Özellikler:
 * - Inbox emaillerini otomatik senkronize et
 * - Conversation thread'lerini takip et
 * - Spam/junk filtreleme
 * - Son sync zamanını sakla
 * - Manuel ve otomatik sync destekle
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS, CHANNEL, CONVERSATION_STATUS, PRIORITY } from "./schema";
import { createConversation, addMessage, updateConversation } from "./conversation-service";

// Graph API servisleri
import { getEmails, getEmailById, getEmailStats } from "../graph-service";

// Unified sync service - TÜM SYNC İŞLEMLERİ BURADAN YAPILMALI
import { 
  manualSync, 
  autoSyncIfNeeded, 
  getLastSyncTime,
  acquireSyncLock,
  releaseSyncLock,
} from "./sync-service";

// =============================================================================
// CONSTANTS
// =============================================================================

const EMAIL_SYNC_DOC_ID = "email_sync_status";
const SYNC_COLLECTION = COLLECTIONS.SYNC_METADATA;
const DEFAULT_SYNC_DAYS = 30; // Varsayılan olarak son 30 günün emaillerini çek

// Spam/Junk olarak kabul edilecek email domain'leri
const SPAM_DOMAINS = [
  'noreply',
  'no-reply',
  'mailer-daemon',
  'postmaster',
];

// İç emailler (kendi domain'lerimiz)
const INTERNAL_DOMAINS = [
  'mkngroup.com.tr',
  'mkngrup.com',
  'dogukankimya.com',
  'asparilac.com',
];

// =============================================================================
// SYNC METADATA FUNCTIONS
// =============================================================================

/**
 * Email sync durumunu al
 */
export const getEmailSyncStatus = async () => {
  try {
    const docRef = doc(db, SYNC_COLLECTION, EMAIL_SYNC_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error("[Email Sync] Error getting sync status:", error);
    return null;
  }
};

/**
 * Email sync durumunu güncelle
 */
export const updateEmailSyncStatus = async (data) => {
  try {
    const docRef = doc(db, SYNC_COLLECTION, EMAIL_SYNC_DOC_ID);
    const currentDoc = await getDoc(docRef);
    const currentData = currentDoc.exists() ? currentDoc.data() : {};
    
    await setDoc(docRef, {
      ...currentData,
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    console.log("[Email Sync] Status updated");
  } catch (error) {
    console.error("[Email Sync] Error updating sync status:", error);
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Email'in spam olup olmadığını kontrol et
 */
const isSpamEmail = (email) => {
  const fromAddress = email.from?.emailAddress?.address?.toLowerCase() || '';
  const fromName = email.from?.emailAddress?.name?.toLowerCase() || '';
  
  // Spam domain kontrolü
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
const determinePriority = (email) => {
  const importance = email.importance?.toLowerCase();
  
  if (importance === 'high') return PRIORITY.HIGH;
  if (importance === 'low') return PRIORITY.LOW;
  
  return PRIORITY.NORMAL;
};

/**
 * Email subject'inden konu çıkar
 */
const cleanSubject = (subject) => {
  if (!subject) return 'E-posta';
  
  // Re:, Fw:, Fwd: gibi prefixleri temizle
  return subject
    .replace(/^(re:|fw:|fwd:|yanıt:|ynt:|ileti:)\s*/gi, '')
    .trim() || 'E-posta';
};

/**
 * Mevcut email conversationId'lerini al
 */
const getExistingEmailIds = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('channel', '==', CHANNEL.EMAIL)
    );
    
    const snapshot = await getDocs(q);
    const existingIds = new Set();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Outlook message ID veya internet message ID ile kontrol
      if (data.channelMetadata?.outlookMessageId) {
        existingIds.add(data.channelMetadata.outlookMessageId);
      }
      if (data.channelMetadata?.internetMessageId) {
        existingIds.add(data.channelMetadata.internetMessageId);
      }
      // conversationId ile de kontrol (thread'ler için)
      if (data.channelMetadata?.outlookConversationId) {
        existingIds.add(`conv_${data.channelMetadata.outlookConversationId}`);
      }
    });
    
    return existingIds;
  } catch (error) {
    console.error("[Email Sync] Error getting existing email IDs:", error);
    return new Set();
  }
};

/**
 * ConversationId'ye göre mevcut conversation'ı bul
 * 
 * ⚠️ ÖNEMLİ: TÜM KANALLARI arar (email, quote_form, contact_form, vb.)
 * Çünkü teklif/iletişim formuna email ile cevap verildiğinde,
 * müşterinin reply'ı o form conversation'ına eklenmeli.
 */
const findConversationByOutlookConversationId = async (outlookConversationId) => {
  try {
    // 🔴 TÜM conversation'ları al (sadece email değil!)
    const snapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
    
    // Client-side filtreleme - TÜM KANALLARDA ara
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.channelMetadata?.outlookConversationId === outlookConversationId) {
        console.log(`[Email Sync] ✅ Found conversation by outlookConversationId (channel: ${data.channel}): ${docSnap.id}`);
        return { id: docSnap.id, ...data };
      }
    }
    
    return null;
  } catch (error) {
    console.error("[Email Sync] Error finding conversation:", error);
    return null;
  }
};

// =============================================================================
// MAIN SYNC FUNCTIONS
// =============================================================================

/**
 * Inbox emaillerini senkronize et
 * 
 * ⚠️ Bu fonksiyon artık SYNC LOCK mekanizması kullanır.
 * Paralel çalışma engellenmiştir.
 * 
 * @param {Object} options - Sync seçenekleri
 * @returns {Object} Sync sonuçları
 */
export const syncInboxEmails = async (options = {}) => {
  const {
    userId = null,
    maxEmails = 100,
    sinceDate = null,
    forceFullSync = false,
  } = options;
  
  const operationId = `email_sync_${Date.now()}`;
  
  // 🔒 SYNC LOCK - Paralel işlemleri engelle
  if (!acquireSyncLock(operationId)) {
    console.warn("[Email Sync] ⚠️ Another sync is in progress, skipping...");
    return {
      success: false,
      skipped: true,
      skipReason: 'sync_locked',
      message: 'Başka bir senkronizasyon işlemi devam ediyor.',
    };
  }
  
  const results = {
    success: true,
    imported: 0,
    skipped: 0,
    addedToThread: 0,
    errors: [],
    details: [],
  };
  
  try {
    console.log("[Email Sync] Starting inbox sync...");
    
    // 1. Sync durumunu al
    const syncStatus = await getEmailSyncStatus();
    const lastSyncAt = syncStatus?.lastEmailSyncAt?.toDate?.() || null;
    
    // 2. Kaç gün geriye gidileceğini belirle
    let filterDate = sinceDate;
    if (!filterDate && !forceFullSync && lastSyncAt) {
      filterDate = lastSyncAt;
    } else if (!filterDate) {
      // İlk sync veya full sync - son X gün
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - DEFAULT_SYNC_DAYS);
      filterDate = daysAgo;
    }
    
    const filterDateStr = filterDate.toISOString();
    console.log(`[Email Sync] Fetching emails since: ${filterDateStr}`);
    
    // 3. Mevcut email ID'lerini al (duplicate kontrolü için)
    const existingIds = await getExistingEmailIds();
    console.log(`[Email Sync] Found ${existingIds.size} existing email IDs`);
    
    // 4. Inbox'tan emailleri çek
    const filter = `receivedDateTime ge ${filterDateStr}`;
    const emailResponse = await getEmails('inbox', {
      top: maxEmails,
      filter: filter,
      orderBy: 'receivedDateTime desc',
      select: 'id,subject,from,toRecipients,ccRecipients,receivedDateTime,isRead,hasAttachments,bodyPreview,body,importance,conversationId,internetMessageId',
    });
    
    const emails = emailResponse.emails || [];
    console.log(`[Email Sync] Fetched ${emails.length} emails from inbox`);
    
    // 5. Her email'i işle
    for (const email of emails) {
      try {
        // Spam kontrolü
        if (isSpamEmail(email)) {
          results.skipped++;
          results.details.push({
            emailId: email.id,
            subject: email.subject,
            status: 'skipped',
            reason: 'spam',
          });
          continue;
        }
        
        // İç mail kontrolü (kendi gönderdiğimiz maillerin cevapları hariç)
        if (isInternalEmail(email) && !email.conversationId) {
          results.skipped++;
          results.details.push({
            emailId: email.id,
            subject: email.subject,
            status: 'skipped',
            reason: 'internal',
          });
          continue;
        }
        
        // Zaten import edilmiş mi?
        if (existingIds.has(email.id) || existingIds.has(email.internetMessageId)) {
          results.skipped++;
          continue;
        }
        
        // Mevcut bir thread'in parçası mı kontrol et
        const existingConversation = email.conversationId 
          ? await findConversationByOutlookConversationId(email.conversationId)
          : null;
        
        if (existingConversation) {
          // Mevcut conversation'a mesaj olarak ekle
          await addMessage(existingConversation.id, {
            content: email.body?.content || email.bodyPreview || '',
            direction: 'inbound',
            channel: CHANNEL.EMAIL,
            senderName: email.from?.emailAddress?.name || '',
            senderEmail: email.from?.emailAddress?.address || '',
            attachments: email.hasAttachments ? [{ hasAttachments: true }] : [],
            createdBy: userId,
            emailMetadata: {
              outlookMessageId: email.id,
              internetMessageId: email.internetMessageId,
              receivedDateTime: email.receivedDateTime,
              isRead: email.isRead,
            },
          });
          
          // Conversation'ı güncelle - yeni mesaj geldi
          await updateConversation(existingConversation.id, {
            status: CONVERSATION_STATUS.OPEN, // Yeni mesaj geldiğinde aç
            unreadCount: (existingConversation.unreadCount || 0) + 1,
          }, userId);
          
          results.addedToThread++;
          results.details.push({
            emailId: email.id,
            subject: email.subject,
            status: 'added_to_thread',
            conversationId: existingConversation.id,
          });
        } else {
          // Yeni conversation oluştur
          const senderEmail = email.from?.emailAddress?.address || '';
          const senderName = email.from?.emailAddress?.name || senderEmail.split('@')[0] || 'Bilinmeyen';
          
          await createConversation({
            name: senderName,
            email: senderEmail,
            phone: '',
            company: '', // Email'den firma çıkaramıyoruz
            channel: CHANNEL.EMAIL,
            subject: cleanSubject(email.subject),
            message: email.body?.content || email.bodyPreview || '',
            status: CONVERSATION_STATUS.OPEN,
            priority: determinePriority(email),
            createdBy: userId,
            channelMetadata: {
              outlookMessageId: email.id,
              outlookConversationId: email.conversationId,
              internetMessageId: email.internetMessageId,
              receivedDateTime: email.receivedDateTime,
              isRead: email.isRead,
              hasAttachments: email.hasAttachments,
              importance: email.importance,
              toRecipients: email.toRecipients?.map(r => r.emailAddress?.address) || [],
              ccRecipients: email.ccRecipients?.map(r => r.emailAddress?.address) || [],
            },
          });
          
          results.imported++;
          results.details.push({
            emailId: email.id,
            subject: email.subject,
            status: 'imported',
            from: senderEmail,
          });
        }
      } catch (error) {
        console.error(`[Email Sync] Error processing email ${email.id}:`, error);
        results.errors.push({
          emailId: email.id,
          subject: email.subject,
          error: error.message,
        });
      }
    }
    
    // 6. Sync durumunu güncelle
    await updateEmailSyncStatus({
      lastEmailSyncAt: serverTimestamp(),
      lastEmailSyncBy: userId,
      lastEmailSyncResults: {
        imported: results.imported,
        skipped: results.skipped,
        addedToThread: results.addedToThread,
        errors: results.errors.length,
        totalProcessed: emails.length,
      },
      emailSyncCount: (syncStatus?.emailSyncCount || 0) + 1,
    });
    
    console.log(`[Email Sync] Completed. Imported: ${results.imported}, Added to thread: ${results.addedToThread}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
    
    // 🔓 SYNC LOCK RELEASE
    releaseSyncLock(operationId);
    
    return results;
  } catch (error) {
    console.error("[Email Sync] Sync failed:", error);
    results.success = false;
    results.errors.push({ error: error.message });
    
    // 🔓 SYNC LOCK RELEASE (hata durumunda da)
    releaseSyncLock(operationId);
    
    return results;
  }
};

/**
 * Manuel email sync (UI'dan çağrılır)
 */
export const manualEmailSync = async (userId) => {
  console.log("[Email Sync] Manual sync triggered");
  return await syncInboxEmails({ userId, forceFullSync: false });
};

/**
 * Tam email sync (tüm geçmişi çek)
 */
export const fullEmailSync = async (userId, days = DEFAULT_SYNC_DAYS) => {
  console.log(`[Email Sync] Full sync triggered for last ${days} days`);
  
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  
  return await syncInboxEmails({ 
    userId, 
    forceFullSync: true,
    sinceDate,
    maxEmails: 500, // Full sync için daha fazla email
  });
};

/**
 * Email istatistiklerini al (Outlook'tan)
 */
export const getEmailSyncStats = async () => {
  try {
    const [outlookStats, syncStatus] = await Promise.all([
      getEmailStats(),
      getEmailSyncStatus(),
    ]);
    
    // CRM'deki email conversation sayısı
    const q = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('channel', '==', CHANNEL.EMAIL)
    );
    const snapshot = await getDocs(q);
    
    return {
      outlook: {
        totalMessages: outlookStats.totalMessages,
        unreadMessages: outlookStats.unreadMessages,
      },
      crm: {
        totalEmailConversations: snapshot.size,
      },
      sync: {
        lastSyncAt: syncStatus?.lastEmailSyncAt?.toDate?.() || null,
        syncCount: syncStatus?.emailSyncCount || 0,
        lastResults: syncStatus?.lastEmailSyncResults || null,
      },
    };
  } catch (error) {
    console.error("[Email Sync] Error getting stats:", error);
    return null;
  }
};

/**
 * Otomatik email sync kontrolü (sayfa yüklendiğinde)
 * Son sync'ten 15 dakika geçtiyse yeni emailleri çek
 */
export const autoEmailSyncIfNeeded = async (userId) => {
  try {
    const syncStatus = await getEmailSyncStatus();
    const lastSyncAt = syncStatus?.lastEmailSyncAt?.toDate?.();
    
    if (!lastSyncAt) {
      // İlk sync
      console.log("[Email Sync] First sync, triggering...");
      return await syncInboxEmails({ userId, maxEmails: 50 });
    }
    
    const now = new Date();
    const diffMinutes = (now - lastSyncAt) / (1000 * 60);
    
    if (diffMinutes >= 15) {
      console.log(`[Email Sync] Auto sync needed (${Math.round(diffMinutes)} min since last sync)`);
      return await syncInboxEmails({ userId, maxEmails: 50 });
    }
    
    console.log(`[Email Sync] Auto sync skipped (${Math.round(diffMinutes)} min since last sync)`);
    return { skipped: true, reason: 'recent_sync' };
  } catch (error) {
    console.error("[Email Sync] Auto sync error:", error);
    return { success: false, error: error.message };
  }
};
