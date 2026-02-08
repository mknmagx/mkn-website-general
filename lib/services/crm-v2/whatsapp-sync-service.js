/**
 * CRM v2 - WhatsApp Sync Service
 * 
 * WhatsApp verilerini CRM v2'ye senkronize eder.
 * - whatsapp_conversations → crm_conversations
 * - whatsapp_messages → crm_messages
 * - Müşteri eşleştirme/oluşturma
 * 
 * Özellikler:
 * - Incremental sync (sadece yeni veriler)
 * - Duplicate protection
 * - 24 saat kuralı kontrolü (mesaj gönderirken)
 * - Müşteri otomatik oluşturma
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
import { createConversation, addMessage, updateConversation, getConversation, cleanupWhatsAppMessagesWithoutWamId, findOrCreateCustomerConversation } from "./conversation-service";
import { findCustomerByContact, createCustomer } from "./customer-service";
import { normalizePhone, formatPhoneDisplay, comparePhones, validatePhone } from "../../utils/phone-utils";

// WhatsApp servisleri (API route üzerinden çalışır)
// Admin SDK kullanan servisler client-side'da çalışmaz, API route kullanılmalı

// =============================================================================
// CONSTANTS
// =============================================================================

const WHATSAPP_SYNC_DOC_ID = "whatsapp_sync_status";
const WHATSAPP_COLLECTIONS = {
  CONVERSATIONS: 'whatsapp_conversations',
  MESSAGES: 'whatsapp_messages',
  CONTACTS: 'whatsapp_contacts',
  SETTINGS: 'whatsapp_settings',
};

// =============================================================================
// SYNC METADATA
// =============================================================================

/**
 * WhatsApp sync durumunu al
 */
export const getWhatsAppSyncStatus = async () => {
  try {
    const docRef = doc(db, COLLECTIONS.SYNC_METADATA, WHATSAPP_SYNC_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error("[WhatsApp Sync] Error getting sync status:", error);
    return null;
  }
};

/**
 * WhatsApp sync durumunu güncelle
 */
export const updateWhatsAppSyncStatus = async (data) => {
  try {
    const docRef = doc(db, COLLECTIONS.SYNC_METADATA, WHATSAPP_SYNC_DOC_ID);
    const currentDoc = await getDoc(docRef);
    const currentData = currentDoc.exists() ? currentDoc.data() : {};
    
    await setDoc(docRef, {
      ...currentData,
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    console.log("[WhatsApp Sync] Status updated");
  } catch (error) {
    console.error("[WhatsApp Sync] Error updating sync status:", error);
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * WhatsApp telefon numarasını formatla (görüntüleme için)
 * @param {string} waId - WhatsApp ID (905551234567)
 * @returns {string} Formatlanmış telefon (+90 555 123 4567)
 */
const formatPhoneNumber = (waId) => {
  // Merkezi modulu kullan
  return formatPhoneDisplay(waId);
};

/**
 * Telefon numarasını WhatsApp E.164 formatına çevir
 * WhatsApp API E.164 formatı gerektirir: 905551234567 (+ olmadan)
 * 
 * Örnekler:
 * - Türkiye: 5365923035 -> 905365923035
 * - Türkiye: 05365923035 -> 905365923035
 * - Türkiye: +90 536 592 30 35 -> 905365923035
 * - Almanya: +49 176 12345678 -> 4917612345678
 * - ABD: +1 555 123 4567 -> 15551234567
 * - Zaten E.164: 905365923035 -> 905365923035
 * 
 * @param {string} phone - Telefon numarası (herhangi bir format)
 * @param {string} defaultCountryCode - Varsayılan ülke kodu (örn: '90' Türkiye için)
 * @returns {string} E.164 formatlı numara (örn: 905365923035)
 */
export const formatPhoneForWhatsApp = (phone, defaultCountryCode = '90') => {
  // Merkezi modulu kullan
  return normalizePhone(phone, defaultCountryCode);
};

/**
 * Telefon numarasının geçerli WhatsApp formatında olup olmadığını kontrol et
 * @param {string} phone - Kontrol edilecek numara
 * @returns {{ valid: boolean, formatted: string, message?: string }}
 */
export const validateWhatsAppPhone = (phone) => {
  // Merkezi modulu kullan
  const result = validatePhone(phone);
  return {
    valid: result.valid,
    formatted: result.normalized,
    message: result.message,
  };
};

/**
 * CRM conversation ID'yi waId'den türet (mapping için)
 */
const generateSourceRefId = (waId, phoneNumberId) => {
  return `wa_${waId}_${phoneNumberId || 'default'}`;
};

/**
 * Telefon numarasını normalize et (sadece rakamlar) - karşılaştırma için
 * Tüm formatları aynı formata çevirir: 905365923035
 * @param {string} phone - Telefon numarası (herhangi bir format)
 * @returns {string} Sadece rakamlardan oluşan numara
 */
const normalizePhoneForComparison = (phone) => {
  // Merkezi modulu kullan
  return normalizePhone(phone);
};

/**
 * Mevcut WhatsApp sourceRef'leri al (duplicate kontrolü için)
 * 
 * ⚠️ DİKKAT: Bu fonksiyon TÜM kanallardaki konuşmaları kontrol eder!
 * Teklif formu veya iletişim formu ile başlayan konuşmalar da WhatsApp 
 * template gönderilince waId alır. Bu konuşmalar da dahil edilmeli.
 * 
 * Telefon numarası formatlarından bağımsız eşleştirme yapar:
 * - +90 536 592 30 35
 * - 905365923035
 * - 0536 592 30 35
 * Hepsi aynı normalize değere dönüşür: 905365923035
 */
const getExistingWhatsAppSourceRefs = async () => {
  try {
    const existingSourceRefs = new Set();
    const normalizedPhoneToConvId = new Map(); // Telefon → Conversation ID mapping
    
    // Tüm CRM konuşmalarını tek seferde al
    const allConversationsSnapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
    
    allConversationsSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const convId = docSnap.id;
      
      // sourceRef.id ekle
      if (data.sourceRef?.type === 'whatsapp' && data.sourceRef?.id) {
        existingSourceRefs.add(data.sourceRef.id);
      }
      
      // waId ekle (normalize edilmiş)
      if (data.channelMetadata?.waId) {
        const normalizedWaId = normalizePhoneForComparison(data.channelMetadata.waId);
        existingSourceRefs.add(normalizedWaId);
        existingSourceRefs.add(data.channelMetadata.waId); // Orijinal formatı da ekle
        normalizedPhoneToConvId.set(normalizedWaId, convId);
      }
      
      // whatsappConversationId ekle
      if (data.channelMetadata?.whatsappConversationId) {
        existingSourceRefs.add(data.channelMetadata.whatsappConversationId);
      }
      
      // sender.phone'dan da normalize edilmiş telefon ekle
      // (Quote form / Contact form için)
      if (data.sender?.phone) {
        const normalizedSenderPhone = normalizePhoneForComparison(data.sender.phone);
        if (normalizedSenderPhone.length >= 10) {
          existingSourceRefs.add(normalizedSenderPhone);
          normalizedPhoneToConvId.set(normalizedSenderPhone, convId);
          console.log(`[WhatsApp Sync] Found phone in ${data.channel} sender: ${normalizedSenderPhone} -> Conv: ${convId}`);
        }
      }
      
      // customer.phone'dan da ekle (eğer embedded ise)
      if (data.customer?.phone) {
        const normalizedCustomerPhone = normalizePhoneForComparison(data.customer.phone);
        if (normalizedCustomerPhone.length >= 10) {
          existingSourceRefs.add(normalizedCustomerPhone);
          normalizedPhoneToConvId.set(normalizedCustomerPhone, convId);
        }
      }
    });
    
    console.log(`[WhatsApp Sync] Found ${existingSourceRefs.size} existing refs (all channels, normalized phones included)`);
    return { existingSourceRefs, normalizedPhoneToConvId };
  } catch (error) {
    console.error("[WhatsApp Sync] Error getting existing source refs:", error);
    return { existingSourceRefs: new Set(), normalizedPhoneToConvId: new Map() };
  }
};

/**
 * CRM'de mevcut WhatsApp mesaj ID'lerini al
 */
const getExistingWhatsAppMessageIds = async () => {
  try {
    const existingQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('channel', '==', CHANNEL.WHATSAPP)
    );
    const existingSnapshot = await getDocs(existingQuery);
    const existingIds = new Set();
    
    existingSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.channelMetadata?.wamId) {
        existingIds.add(data.channelMetadata.wamId);
      }
    });
    
    console.log(`[WhatsApp Sync] Found ${existingIds.size} existing WhatsApp message IDs`);
    return existingIds;
  } catch (error) {
    console.error("[WhatsApp Sync] Error getting existing message IDs:", error);
    return new Set();
  }
};

/**
 * WhatsApp conversation'ı CRM conversation'a dönüştür
 */
const mapWhatsAppToCrmConversation = (waConv) => {
  const waId = waConv.waId || waConv.displayPhoneNumber;
  const profileName = waConv.profileName || formatPhoneNumber(waId);
  
  // Firestore undefined değerlerini kabul etmiyor, null'a çevir
  const phoneNumberId = waConv.phoneNumberId || null;
  const whatsappConversationId = waConv.id || null;
  
  return {
    name: profileName,
    email: '', // WhatsApp'ta email yok
    phone: formatPhoneNumber(waId),
    company: '',
    channel: CHANNEL.WHATSAPP,
    subject: `WhatsApp - ${profileName}`,
    message: waConv.lastMessagePreview || '',
    status: mapWhatsAppStatus(waConv.status),
    priority: PRIORITY.NORMAL,
    replyStatus: waConv.unreadCount > 0 ? REPLY_STATUS.AWAITING_US : REPLY_STATUS.AWAITING_CUSTOMER,
    sourceRef: { 
      type: 'whatsapp', 
      id: generateSourceRefId(waId, phoneNumberId),
      whatsappConversationId: whatsappConversationId,
    },
    channelMetadata: {
      waId: waId || null,
      profileName: profileName || null,
      phoneNumberId: phoneNumberId,
      whatsappConversationId: whatsappConversationId,
      serviceWindowExpiry: waConv.serviceWindowExpiry || null,
      isWithinWindow: waConv.isWithinWindow || false,
      // Orijinal tarih
      originalCreatedAt: waConv.createdAt || null,
    },
  };
};

/**
 * WhatsApp status'u CRM status'a map et
 */
const mapWhatsAppStatus = (waStatus) => {
  const mapping = {
    'open': CONVERSATION_STATUS.OPEN,
    'active': CONVERSATION_STATUS.OPEN,
    'closed': CONVERSATION_STATUS.CLOSED,
    'pending': CONVERSATION_STATUS.PENDING,
    'archived': CONVERSATION_STATUS.CLOSED,
  };
  return mapping[waStatus] || CONVERSATION_STATUS.OPEN;
};

/**
 * WhatsApp mesajını CRM mesajına dönüştür
 */
const mapWhatsAppToCrmMessage = (waMsg, crmConversationId, conversation = null) => {
  // Mesaj içeriğini belirle
  let content = '';
  if (waMsg.text) {
    content = waMsg.text;
  } else if (waMsg.caption) {
    content = waMsg.caption;
  } else if (waMsg.content?.text) {
    content = waMsg.content.text;
  } else if (waMsg.type) {
    const typeLabels = {
      'image': '[Resim]',
      'video': '[Video]',
      'audio': '[Ses]',
      'document': '[Dosya]',
      'sticker': '[Çıkartma]',
      'location': '[Konum]',
      'contacts': '[Kişi]',
    };
    content = typeLabels[waMsg.type.toLowerCase()] || `[${waMsg.type}]`;
  }
  
  // Gönderen adını belirle - öncelik sırasına göre
  // Inbound: WhatsApp profileName > CRM metadata profileName > sender.name > company
  // Outbound: MKN GROUP Ekibi (varsayılan)
  let senderName = '';
  if (waMsg.direction === 'inbound' || !waMsg.direction) {
    // Öncelik sırası:
    // 1. WhatsApp mesajındaki profileName (en güncel)
    // 2. CRM conversation channelMetadata.profileName
    // 3. CRM conversation sender.name (isim + soyisim)
    // 4. CRM conversation name (şirket adı - son çare)
    senderName = waMsg.profileName 
      || conversation?.channelMetadata?.profileName 
      || conversation?.sender?.name 
      || conversation?.name 
      || 'Müşteri';
  } else {
    // Outbound mesajlar için varsayılan isim
    senderName = 'MKN GROUP Ekibi';
  }
  
  // Orijinal timestamp'ı kullan
  let originalCreatedAt = null;
  if (waMsg.timestamp) {
    // Firestore Timestamp veya Date objesi olabilir
    if (waMsg.timestamp.toDate) {
      originalCreatedAt = waMsg.timestamp.toDate();
    } else if (waMsg.timestamp._seconds) {
      originalCreatedAt = new Date(waMsg.timestamp._seconds * 1000);
    } else if (waMsg.timestamp.seconds) {
      originalCreatedAt = new Date(waMsg.timestamp.seconds * 1000);
    } else if (typeof waMsg.timestamp === 'string' || typeof waMsg.timestamp === 'number') {
      originalCreatedAt = new Date(waMsg.timestamp);
    }
  }
  
  // channelMetadata - undefined değerleri null'a çevir (Firestore uyumluluğu)
  const channelMetadata = {
    wamId: waMsg.wamId || waMsg.id || null,
    waId: waMsg.waId || null,
    phoneNumberId: waMsg.phoneNumberId || null,
    type: waMsg.type || null,
    mediaId: waMsg.mediaId || waMsg.content?.mediaId || null,
    mediaUrl: waMsg.mediaUrl || waMsg.content?.mediaUrl || null,
    mimeType: waMsg.mimeType || waMsg.content?.mimeType || null,
    filename: waMsg.filename || waMsg.content?.filename || null,
    originalTimestamp: waMsg.timestamp || null,
  };
  
  return {
    conversationId: crmConversationId,
    content: content,
    direction: waMsg.direction || 'inbound',
    channel: CHANNEL.WHATSAPP,
    senderName: senderName,
    status: waMsg.status || 'delivered',
    channelMetadata,
    // Orijinal tarih (addMessage'da kullanılacak)
    originalCreatedAt: originalCreatedAt,
    // Outbound mesajlar için saveAsDraft=false ile gönderilmiş mesaj olarak kaydet
    saveAsDraft: false,
  };
};

// =============================================================================
// CUSTOMER MATCHING/CREATION
// =============================================================================

/**
 * WhatsApp numarası için CRM müşterisi bul veya oluştur
 * @param {string} waId - WhatsApp ID (telefon numarası)
 * @param {string} profileName - WhatsApp profil adı
 * @param {string} createdBy - Oluşturan kullanıcı
 * @returns {Object|null} Müşteri kaydı
 */
export const findOrCreateCustomerByPhone = async (waId, profileName, createdBy = null) => {
  try {
    const phone = formatPhoneNumber(waId);
    const phoneDigits = waId.replace(/\D/g, '');
    
    // Telefon numarasıyla müşteri ara
    // Farklı formatları da kontrol et
    let existingCustomer = await findCustomerByContact(null, phone);
    
    if (!existingCustomer) {
      // Sadece rakamlarla da dene
      existingCustomer = await findCustomerByContact(null, phoneDigits);
    }
    
    if (!existingCustomer) {
      // +90 ile başlayan formatla da dene
      existingCustomer = await findCustomerByContact(null, `+${phoneDigits}`);
    }
    
    if (existingCustomer) {
      console.log(`[WhatsApp Sync] Found existing customer: ${existingCustomer.id}`);
      return existingCustomer;
    }
    
    // Yeni müşteri oluştur
    console.log(`[WhatsApp Sync] Creating new customer for: ${waId}`);
    const newCustomer = await createCustomer({
      name: profileName || phone,
      phone: phone,
      email: '', // WhatsApp'ta email yok
      companyName: '',
      source: 'whatsapp',
      notes: `WhatsApp üzerinden otomatik oluşturuldu. WA ID: ${waId}`,
      createdBy: createdBy,
    });
    
    return newCustomer;
  } catch (error) {
    console.error("[WhatsApp Sync] Error finding/creating customer:", error);
    return null;
  }
};

// =============================================================================
// SYNC FUNCTIONS
// =============================================================================

/**
 * WhatsApp conversations'ları CRM'e senkronize et
 * API route üzerinden çalışır
 * @param {string} createdBy - Oluşturan kullanıcı ID
 * @param {Object} options - Seçenekler
 * @param {number} options.hours - Son kaç saatin verilerini sync et (default: 24)
 */
export const syncWhatsAppConversations = async (createdBy = null, options = {}) => {
  const { hours = 24 } = options;
  const results = { imported: 0, updated: 0, skipped: 0, linkedToExisting: 0, errors: [] };
  
  try {
    console.log(`[WhatsApp Sync] Fetching WhatsApp conversations via API (last ${hours}h)...`);
    
    // API route üzerinden WhatsApp conversations'ları çek
    const response = await fetch(`/api/admin/whatsapp/conversations?pageSize=200&hours=${hours}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch WhatsApp conversations');
    }
    
    const waConversations = data.data || [];
    console.log(`[WhatsApp Sync] Found ${waConversations.length} WhatsApp conversations`);
    
    // Mevcut sourceRef'leri ve telefon-conversation mapping'i al
    const { existingSourceRefs, normalizedPhoneToConvId } = await getExistingWhatsAppSourceRefs();
    
    for (const waConv of waConversations) {
      try {
        const waId = waConv.waId || waConv.displayPhoneNumber;
        if (!waId) {
          results.skipped++;
          continue;
        }
        
        const normalizedWaId = normalizePhoneForComparison(waId);
        const sourceRefId = generateSourceRefId(waId, waConv.phoneNumberId);
        const whatsappConversationId = waConv.id;
        
        // Zaten var mı kontrol et (waId, sourceRefId, whatsappConversationId veya normalize telefon ile)
        const alreadyExists = existingSourceRefs.has(sourceRefId) || 
                             existingSourceRefs.has(waId) || 
                             existingSourceRefs.has(normalizedWaId) ||
                             (whatsappConversationId && existingSourceRefs.has(whatsappConversationId));
        
        if (alreadyExists) {
          // Mevcut conversation'ı güncelle (son mesaj, status vb.)
          // Önce normalize telefon ile CRM conversation ID'yi bul
          const existingConvId = normalizedPhoneToConvId.get(normalizedWaId);
          await updateExistingWhatsAppConversation(waConv, existingConvId);
          results.updated++;
          console.log(`[WhatsApp Sync] Updated existing conversation for: ${waId} (normalized: ${normalizedWaId})`);
          continue;
        }
        
        // ⚠️ Son kontrol: Belki telefon numarası farklı formatta CRM'de var
        // Ama WhatsApp bağlantısı henüz kurulmamış (quote form vb.)
        const existingConvIdByPhone = normalizedPhoneToConvId.get(normalizedWaId);
        if (existingConvIdByPhone) {
          // Mevcut CRM konuşmasını WhatsApp ile bağla
          console.log(`[WhatsApp Sync] Linking existing CRM conv ${existingConvIdByPhone} to WhatsApp conv ${whatsappConversationId}`);
          await updateConversation(existingConvIdByPhone, {
            'channelMetadata.waId': waId,
            'channelMetadata.whatsappConversationId': whatsappConversationId,
            'channelMetadata.serviceWindowExpiry': waConv.serviceWindowExpiry || null,
            'channelMetadata.isWithinWindow': waConv.isWithinWindow || false,
          });
          results.linkedToExisting++;
          
          // Set'e ekle (runtime duplicate protection)
          existingSourceRefs.add(sourceRefId);
          existingSourceRefs.add(waId);
          existingSourceRefs.add(normalizedWaId);
          if (whatsappConversationId) {
            existingSourceRefs.add(whatsappConversationId);
          }
          continue;
        }
        
        // Müşteri eşleştir/oluştur
        const customer = await findOrCreateCustomerByPhone(
          waId, 
          waConv.profileName, 
          createdBy
        );
        
        // 🆕 MÜŞTERİ BAZLI SİSTEM - findOrCreateCustomerConversation kullan
        const profileName = waConv.profileName || formatPhoneNumber(waId);
        const phoneNumberId = waConv.phoneNumberId || null;
        // whatsappConversationId zaten yukarıda tanımlı (waConv.id)
        
        const result = await findOrCreateCustomerConversation(
          // Müşteri tanımlayıcıları
          {
            email: '',
            phone: formatPhoneNumber(waId),
            name: profileName,
            company: '',
          },
          // Mesaj verileri
          {
            channel: CHANNEL.WHATSAPP,
            subject: `WhatsApp - ${profileName}`,
            message: waConv.lastMessagePreview || '',
            channelMetadata: {
              waId: waId || null,
              profileName: profileName || null,
              phoneNumberId: phoneNumberId,
              whatsappConversationId: whatsappConversationId,
              serviceWindowExpiry: waConv.serviceWindowExpiry || null,
              isWithinWindow: waConv.isWithinWindow || false,
              originalCreatedAt: waConv.createdAt || null,
            },
          },
          // Seçenekler
          {
            status: mapWhatsAppStatus(waConv.status),
            priority: PRIORITY.NORMAL,
            sourceRef: { 
              type: 'whatsapp', 
              id: generateSourceRefId(waId, phoneNumberId),
              whatsappConversationId: whatsappConversationId,
            },
            createdBy,
          }
        );
        
        if (result.duplicateSkipped) {
          results.skipped++;
        } else if (result.isNewConversation) {
          results.imported++;
          console.log(`[WhatsApp Sync] Conversation imported: ${waId}`);
        } else {
          results.updated++;
          console.log(`[WhatsApp Sync] Added to existing customer conversation: ${waId}`);
        }
        
        // Set'e ekle (runtime duplicate protection)
        existingSourceRefs.add(sourceRefId);
        existingSourceRefs.add(waId);
        existingSourceRefs.add(normalizedWaId);
        if (whatsappConversationId) {
          existingSourceRefs.add(whatsappConversationId);
        }
        
      } catch (error) {
        console.error(`[WhatsApp Sync] Error importing conversation:`, error);
        results.errors.push({ waId: waConv.waId, error: error.message });
      }
    }
    
  } catch (error) {
    console.error("[WhatsApp Sync] Error syncing conversations:", error);
    results.errors.push({ error: error.message });
  }
  
  return results;
};

/**
 * Mevcut CRM conversation'ı WhatsApp verileriyle güncelle
 * 
 * ⚠️ TÜM kanallardaki waId eşleşmelerini kontrol eder!
 * Quote form veya iletişim formu üzerinden başlayan ama WhatsApp ile
 * devam eden konuşmalar da güncellenir.
 * 
 * @param {Object} waConv - WhatsApp conversation verisi
 * @param {string|null} knownConvId - Bilinen CRM conversation ID (varsa arama atlanır)
 */
const updateExistingWhatsAppConversation = async (waConv, knownConvId = null) => {
  try {
    const waId = waConv.waId || waConv.displayPhoneNumber;
    const whatsappConversationId = waConv.id;
    const normalizedWaId = normalizePhoneForComparison(waId);
    
    let crmConvId = knownConvId;
    let crmConvData = null;
    let matchReason = knownConvId ? 'known' : null;
    
    // Eğer convId bilinmiyorsa, ara
    if (!crmConvId) {
      // CRM'deki conversation'ı bul - TÜM kanallarda ara
      const allConversationsSnapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
      
      for (const docSnap of allConversationsSnapshot.docs) {
        const data = docSnap.data();
        
        // waId eşleşmesi (tam eşleşme)
        if (data.channelMetadata?.waId === waId) {
          crmConvId = docSnap.id;
          crmConvData = data;
          matchReason = 'waId_exact';
          break;
        }
        
        // waId eşleşmesi (normalize edilmiş)
        if (data.channelMetadata?.waId) {
          const normalizedExisting = normalizePhoneForComparison(data.channelMetadata.waId);
          if (normalizedExisting === normalizedWaId) {
            crmConvId = docSnap.id;
            crmConvData = data;
            matchReason = 'waId_normalized';
            break;
          }
        }
        
        // sender.phone eşleşmesi (normalize edilmiş)
        if (data.sender?.phone) {
          const normalizedSenderPhone = normalizePhoneForComparison(data.sender.phone);
          if (normalizedSenderPhone === normalizedWaId) {
            crmConvId = docSnap.id;
            crmConvData = data;
            matchReason = 'sender_phone_normalized';
            break;
          }
        }
        
        // whatsappConversationId eşleşmesi
        if (whatsappConversationId && data.channelMetadata?.whatsappConversationId === whatsappConversationId) {
          crmConvId = docSnap.id;
          crmConvData = data;
          matchReason = 'whatsappConversationId';
          break;
        }
      }
    } else {
      // convId biliniyor, sadece data'yı al
      const convDoc = await getDoc(doc(db, COLLECTIONS.CONVERSATIONS, crmConvId));
      if (convDoc.exists()) {
        crmConvData = convDoc.data();
      }
    }
    
    if (!crmConvId) {
      console.log(`[WhatsApp Sync] No existing CRM conversation found for waId: ${waId} (normalized: ${normalizedWaId})`);
      return false;
    }
    
    console.log(`[WhatsApp Sync] Updating conversation ${crmConvId} (channel: ${crmConvData?.channel}, match: ${matchReason})`);
    
    // Güncellenecek alanlar
    const updateData = {
      'channelMetadata.serviceWindowExpiry': waConv.serviceWindowExpiry || null,
      'channelMetadata.isWithinWindow': waConv.isWithinWindow || false,
      'channelMetadata.lastMessageAt': waConv.lastMessageAt || null,
      preview: waConv.lastMessagePreview || '',
      unreadCount: waConv.unreadCount || 0,
      replyStatus: waConv.unreadCount > 0 ? REPLY_STATUS.AWAITING_US : null,
    };
    
    // WhatsApp metadata eksikse ekle (quote form'dan başlayan konuşmalar için)
    if (!crmConvData?.channelMetadata?.whatsappConversationId && whatsappConversationId) {
      updateData['channelMetadata.whatsappConversationId'] = whatsappConversationId;
      console.log(`[WhatsApp Sync] Linking whatsappConversationId ${whatsappConversationId} to CRM conv ${crmConvId}`);
    }
    
    if (!crmConvData?.channelMetadata?.waId && waId) {
      updateData['channelMetadata.waId'] = waId;
      console.log(`[WhatsApp Sync] Adding waId ${waId} to CRM conv ${crmConvId}`);
    }
    
    await updateConversation(crmConvId, updateData);
    
    return true;
  } catch (error) {
    console.error("[WhatsApp Sync] Error updating existing conversation:", error);
    return false;
  }
};

/**
 * WhatsApp mesajlarını CRM'e senkronize et
 */
export const syncWhatsAppMessages = async (crmConversationId, waConversationId, createdBy = null, conversation = null) => {
  const results = { imported: 0, skipped: 0, errors: [] };
  
  try {
    console.log(`[WhatsApp Sync] Fetching messages for conversation: ${waConversationId}`);
    
    // Conversation objesi yoksa al
    if (!conversation) {
      conversation = await getConversation(crmConversationId);
    }
    
    // API route üzerinden mesajları çek
    const response = await fetch(`/api/admin/whatsapp/messages?conversationId=${waConversationId}&pageSize=100`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch messages');
    }
    
    const waMessages = data.data || [];
    console.log(`[WhatsApp Sync] Found ${waMessages.length} messages from WhatsApp`);
    
    // Bu conversation'daki mevcut CRM mesajlarını al (tek query - index gerektirmez)
    const existingMsgsQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', crmConversationId)
    );
    const existingSnapshot = await getDocs(existingMsgsQuery);
    
    // Mevcut wamId'leri topla
    const existingWamIds = new Set();
    existingSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.channel === CHANNEL.WHATSAPP && data.channelMetadata?.wamId) {
        existingWamIds.add(data.channelMetadata.wamId);
      }
    });
    
    console.log(`[WhatsApp Sync] Found ${existingWamIds.size} existing WhatsApp messages in CRM`);
    
    for (const waMsg of waMessages) {
      try {
        const wamId = waMsg.wamId || waMsg.id;
        
        if (!wamId) {
          console.warn(`[WhatsApp Sync] Message has no wamId, skipping`);
          results.skipped++;
          continue;
        }
        
        // Zaten var mı? (hızlı kontrol)
        if (existingWamIds.has(wamId)) {
          results.skipped++;
          continue;
        }
        
        // CRM mesajı oluştur - conversation objesini geç
        const msgData = mapWhatsAppToCrmMessage(waMsg, crmConversationId, conversation);
        msgData.createdBy = createdBy;
        
        const addResult = await addMessage(crmConversationId, msgData);
        
        // addMessage duplicate tespit ettiyse skip
        if (addResult?.skipped) {
          results.skipped++;
          continue;
        }
        
        results.imported++;
        existingWamIds.add(wamId); // Race condition'ı önlemek için ekle
        
      } catch (error) {
        console.error(`[WhatsApp Sync] Error importing message:`, error);
        results.errors.push({ messageId: waMsg.id, error: error.message });
      }
    }
    
    console.log(`[WhatsApp Sync] Sync complete: ${results.imported} imported, ${results.skipped} skipped`);
    
  } catch (error) {
    console.error("[WhatsApp Sync] Error syncing messages:", error);
    results.errors.push({ error: error.message });
  }
  
  return results;
};

// =============================================================================
// 24 SAAT KURALI - SERVICE WINDOW KONTROLÜ
// =============================================================================

/**
 * Service window (24 saat kuralı) kontrolü
 * 
 * ⚠️ KRİTİK: Kanal kontrolü KALDIRILDI!
 * Quote form, contact form gibi kanallardan başlayan konuşmalara da 
 * WhatsApp template gönderildiyse waId ve service window bilgisi eklenir.
 * Kontrol artık channelMetadata.waId varlığına göre yapılıyor.
 * 
 * @param {string} crmConversationId - CRM conversation ID
 * @returns {Object} { isOpen: boolean, expiry: Date|null, requiresTemplate: boolean, reason: string }
 */
export const checkServiceWindow = async (crmConversationId) => {
  try {
    const conversation = await getConversation(crmConversationId);
    
    if (!conversation) {
      return { isOpen: false, expiry: null, requiresTemplate: true, reason: 'Conversation bulunamadı' };
    }
    
    const metadata = conversation.channelMetadata || {};
    const hasWhatsAppData = metadata.waId || metadata.whatsappConversationId;
    
    // WhatsApp verisi yoksa (hiç WhatsApp iletişimi başlamamış)
    // Template gerekli - ilk iletişim
    if (!hasWhatsAppData) {
      console.log(`[WhatsApp Window] No WhatsApp data for conversation ${crmConversationId} (channel: ${conversation.channel})`);
      return { 
        isOpen: false, 
        expiry: null, 
        requiresTemplate: true,
        reason: 'İlk WhatsApp mesajı için şablon gerekli. Müşteri henüz WhatsApp üzerinden mesaj göndermedi.',
        isFirstContact: true,
      };
    }
    
    // WhatsApp verisi var, service window kontrolü yap
    console.log(`[WhatsApp Window] Checking window for conversation ${crmConversationId} (channel: ${conversation.channel}, waId: ${metadata.waId})`);
    
    const expiry = metadata.serviceWindowExpiry;
    
    if (!expiry) {
      // Service window bilgisi yok, template gerekli
      return { isOpen: false, expiry: null, requiresTemplate: true };
    }
    
    // Expiry tarihini Date objesine çevir
    let expiryDate;
    if (expiry.toDate) {
      expiryDate = expiry.toDate();
    } else if (expiry.seconds) {
      expiryDate = new Date(expiry.seconds * 1000);
    } else if (expiry._seconds) {
      expiryDate = new Date(expiry._seconds * 1000);
    } else if (typeof expiry === 'string' || typeof expiry === 'number') {
      expiryDate = new Date(expiry);
    } else {
      return { isOpen: false, expiry: null, requiresTemplate: true };
    }
    
    const now = new Date();
    const isOpen = now < expiryDate;
    
    return {
      isOpen,
      expiry: expiryDate,
      requiresTemplate: !isOpen,
      remainingMinutes: isOpen ? Math.round((expiryDate - now) / (1000 * 60)) : 0,
    };
  } catch (error) {
    console.error("[WhatsApp Sync] Error checking service window:", error);
    return { isOpen: false, expiry: null, requiresTemplate: true };
  }
};

/**
 * Service window'u güncelle (müşteri mesaj gönderdiğinde)
 */
export const refreshServiceWindow = async (crmConversationId) => {
  try {
    // 24 saat sonra expire olacak
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    
    await updateConversation(crmConversationId, {
      'channelMetadata.serviceWindowExpiry': Timestamp.fromDate(expiry),
      'channelMetadata.isWithinWindow': true,
    });
    
    return { success: true, expiry };
  } catch (error) {
    console.error("[WhatsApp Sync] Error refreshing service window:", error);
    return { success: false, error: error.message };
  }
};

/**
 * WhatsApp mesaj geldiğinde CRM conversation'ın service window'unu güncelle
 * Webhook'tan çağrılır - waId veya telefon ile CRM conversation'ı bulur
 * @param {string} waId - WhatsApp ID (telefon numarası)
 * @param {string} whatsappConversationId - WhatsApp conversation ID
 */
export const refreshCrmServiceWindow = async (waId, whatsappConversationId) => {
  try {
    const normalizedWaId = normalizePhoneForComparison(waId);
    
    // CRM'deki conversation'ı bul - waId veya telefon ile
    const allConversationsSnapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
    
    let crmConvId = null;
    
    for (const docSnap of allConversationsSnapshot.docs) {
      const data = docSnap.data();
      
      // waId eşleşmesi
      if (data.channelMetadata?.waId) {
        const normalizedExisting = normalizePhoneForComparison(data.channelMetadata.waId);
        if (normalizedExisting === normalizedWaId) {
          crmConvId = docSnap.id;
          break;
        }
      }
      
      // sender.phone eşleşmesi
      if (data.sender?.phone) {
        const normalizedSenderPhone = normalizePhoneForComparison(data.sender.phone);
        if (normalizedSenderPhone === normalizedWaId) {
          crmConvId = docSnap.id;
          break;
        }
      }
      
      // whatsappConversationId eşleşmesi
      if (whatsappConversationId && data.channelMetadata?.whatsappConversationId === whatsappConversationId) {
        crmConvId = docSnap.id;
        break;
      }
    }
    
    if (!crmConvId) {
      console.log(`[CRM Sync] No CRM conversation found for waId: ${waId}`);
      return { success: false, reason: 'no_crm_conversation' };
    }
    
    // 24 saat sonra expire olacak
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    
    // ⚠️ DİKKAT: channel değiştirilmemeli!
    // Quote form, contact form gibi kanallardan başlayan konuşmaların 
    // kanal bilgisi korunmalı, sadece WhatsApp metadata eklenmeli.
    await updateConversation(crmConvId, {
      'channelMetadata.serviceWindowExpiry': Timestamp.fromDate(expiry),
      'channelMetadata.isWithinWindow': true,
      'channelMetadata.waId': waId, // waId yoksa ekle
      'channelMetadata.whatsappConversationId': whatsappConversationId,
      // 'channel': CHANNEL.WHATSAPP, // KALDIRILDI - Orijinal kanalı koruyoruz!
    });
    
    console.log(`[CRM Sync] ✅ Service window updated for CRM conv ${crmConvId}, expires: ${expiry.toISOString()}`);
    return { success: true, crmConversationId: crmConvId, expiry };
    
  } catch (error) {
    console.error("[CRM Sync] Error refreshing CRM service window:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// CRM'DEN WHATSAPP MESAJ GÖNDERME
// =============================================================================

/**
 * CRM üzerinden WhatsApp mesajı gönder
 * 24 saat kuralına göre normal mesaj veya template kullanır
 * 
 * @param {string} crmConversationId - CRM conversation ID
 * @param {string} message - Gönderilecek mesaj (normal mesaj için)
 * @param {Object} options - Ek seçenekler
 * @param {string} options.templateName - Template adı (zorunlu template için)
 * @param {string} options.templateLanguage - Template dili (default: 'tr')
 * @param {Array} options.templateComponents - Template değişkenleri
 * @param {boolean} options.forceTemplate - Template kullanımını zorla
 */
export const sendWhatsAppFromCRM = async (crmConversationId, message, options = {}) => {
  try {
    const conversation = await getConversation(crmConversationId);
    
    if (!conversation) {
      return { success: false, error: 'Conversation bulunamadı' };
    }
    
    // WhatsApp ID'yi bul - tüm olası kaynaklardan
    let waId = conversation.channelMetadata?.waId;
    
    // waId yoksa diğer kaynaklardan telefon numarası al
    if (!waId) {
      // Öncelik sırası: recipientPhone > sender.phone > customer > participantPhone
      if (options.recipientPhone) {
        waId = formatPhoneForWhatsApp(options.recipientPhone);
      } else if (conversation.sender?.phone) {
        waId = formatPhoneForWhatsApp(conversation.sender.phone);
      } else if (conversation.customer?.phone) {
        waId = formatPhoneForWhatsApp(conversation.customer.phone);
      } else if (conversation.participantPhone) {
        waId = formatPhoneForWhatsApp(conversation.participantPhone);
      }
    }
    
    console.log(`[WhatsApp CRM] Phone lookup for ${crmConversationId}:`, {
      waId,
      recipientPhone: options.recipientPhone,
      senderPhone: conversation.sender?.phone,
      customerPhone: conversation.customer?.phone,
    });
    
    if (!waId) {
      return { success: false, error: 'WhatsApp numarası bulunamadı. Müşterinin telefon numarası kayıtlı değil.' };
    }
    
    // Telefon numarasını E.164 formatına çevir
    waId = formatPhoneForWhatsApp(waId);
    
    if (!waId || waId.length < 10) {
      return { success: false, error: 'Geçersiz telefon numarası formatı' };
    }
    
    console.log(`[WhatsApp CRM] Sending to waId: ${waId} (channel: ${conversation.channel})`);
    
    // Service window kontrolü
    const windowStatus = await checkServiceWindow(crmConversationId);
    
    // Template zorunlu mu?
    const useTemplate = options.forceTemplate || windowStatus.requiresTemplate;
    
    if (useTemplate) {
      // Template mesajı gönder
      if (!options.templateName) {
        return { 
          success: false, 
          error: '24 saat penceresi kapanmış. Mesaj göndermek için şablon seçmelisiniz.',
          requiresTemplate: true,
          windowStatus,
        };
      }
      
      // Template API'yi çağır
      const response = await fetch('/api/admin/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.channelMetadata?.whatsappConversationId,
          to: waId,
          type: 'template',
          templateName: options.templateName,
          languageCode: options.templateLanguage || 'tr',
          components: options.templateComponents || [],
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return { success: false, error: result.error || 'Template gönderilemedi' };
      }
      
      // ✅ WhatsApp conversationId'yi CRM'e kaydet (kritik: ilk mesaj için bağlantı kuruluyor)
      const whatsappConversationId = result.conversationId;
      if (whatsappConversationId && !conversation.channelMetadata?.whatsappConversationId) {
        console.log(`[WhatsApp Sync] Linking CRM conversation ${crmConversationId} to WhatsApp conversation ${whatsappConversationId}`);
        await updateConversation(crmConversationId, {
          'channelMetadata.whatsappConversationId': whatsappConversationId,
          'channelMetadata.waId': waId,
        });
      }
      
      if (!options.skipCrmRecord) {
        // CRM mesajı olarak da kaydet
        await addMessage(crmConversationId, {
          content: `[Şablon: ${options.templateName}]`,
          direction: 'outbound',
          channel: CHANNEL.WHATSAPP,
          status: 'sent',
          channelMetadata: {
            wamId: result.data?.wamId || result.wamId,
            waId: waId,
            type: 'template',
            templateName: options.templateName,
            templateLanguage: options.templateLanguage || 'tr',
          },
        });

        // Conversation güncelle
        await updateConversation(crmConversationId, {
          replyStatus: REPLY_STATUS.AWAITING_CUSTOMER,
          lastMessageAt: serverTimestamp(),
        });
      }
      
      return { 
        success: true, 
        messageType: 'template',
        wamId: result.data?.wamId || result.wamId,
        whatsappConversationId: whatsappConversationId,
      };
      
    } else {
      // Normal mesaj gönder
      if (!message || message.trim() === '') {
        return { success: false, error: 'Mesaj içeriği boş olamaz' };
      }
      
      // Mesaj API'yi çağır
      const response = await fetch('/api/admin/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.channelMetadata?.whatsappConversationId,
          to: waId,
          type: 'text',
          text: message,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return { success: false, error: result.error || 'Mesaj gönderilemedi' };
      }
      
      // ✅ WhatsApp conversationId'yi CRM'e kaydet (kritik: ilk mesaj için bağlantı kuruluyor)
      const whatsappConversationId = result.conversationId;
      if (whatsappConversationId && !conversation.channelMetadata?.whatsappConversationId) {
        console.log(`[WhatsApp Sync] Linking CRM conversation ${crmConversationId} to WhatsApp conversation ${whatsappConversationId}`);
        await updateConversation(crmConversationId, {
          'channelMetadata.whatsappConversationId': whatsappConversationId,
          'channelMetadata.waId': waId,
        });
      }
      
      if (!options.skipCrmRecord) {
        // CRM mesajı olarak da kaydet
        await addMessage(crmConversationId, {
          content: message,
          direction: 'outbound',
          channel: CHANNEL.WHATSAPP,
          status: 'sent',
          channelMetadata: {
            wamId: result.data?.wamId || result.wamId,
            waId: waId,
            type: 'text',
          },
        });
        
        // Conversation güncelle
        await updateConversation(crmConversationId, {
          replyStatus: REPLY_STATUS.AWAITING_CUSTOMER,
          lastMessageAt: serverTimestamp(),
        });
      }
      
      return { 
        success: true, 
        messageType: 'text',
        wamId: result.data?.wamId || result.wamId,
        whatsappConversationId: whatsappConversationId,
      };
    }
    
  } catch (error) {
    console.error("[WhatsApp Sync] Error sending WhatsApp message:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// MAIN SYNC FUNCTION
// =============================================================================

/**
 * WhatsApp verilerini CRM'e senkronize et (ana fonksiyon)
 * Conversation'ları ve mesajları sync eder
 */
export const syncWhatsAppToCRM = async (createdBy = null, options = {}) => {
  const { syncMessages = true, hours = 24 } = options;
  
  const results = {
    conversations: { imported: 0, updated: 0, skipped: 0, errors: [] },
    messages: { imported: 0, skipped: 0, errors: [] },
    cleanup: { deleted: 0 },
    customers: { created: 0, matched: 0 },
    success: false,
  };
  
  try {
    console.log("[WhatsApp Sync] Starting WhatsApp to CRM sync...");
    
    // 1. Conversations sync
    const convResults = await syncWhatsAppConversations(createdBy, { hours });
    results.conversations = convResults;
    
    // 2. WhatsApp metadata'sı olan TÜM conversation'ları al (sadece WhatsApp kanalı değil!)
    // Quote form veya iletişim formu ile başlayan ama WhatsApp ile devam eden konuşmalar da dahil
    const allConversationsSnapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
    
    // WhatsApp iletişimi olan konuşmaları filtrele
    const conversationsWithWhatsApp = [];
    allConversationsSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      // WhatsApp conversation ID'si olan veya WhatsApp kanalındaki tüm konuşmalar
      if (data.channel === CHANNEL.WHATSAPP || data.channelMetadata?.whatsappConversationId) {
        conversationsWithWhatsApp.push({ id: docSnap.id, ...data });
      }
    });
    
    console.log(`[WhatsApp Sync] Found ${conversationsWithWhatsApp.length} conversations with WhatsApp communication`);
    
    // 3. Önce wamId olmayan eski mesajları temizle (migration)
    for (const conv of conversationsWithWhatsApp) {
      try {
        const cleanupResult = await cleanupWhatsAppMessagesWithoutWamId(conv.id);
        results.cleanup.deleted += cleanupResult.deleted;
      } catch (err) {
        console.error(`[WhatsApp Sync] Cleanup error for ${conv.id}:`, err);
      }
    }
    
    // 4. Mesajları sync et
    if (syncMessages) {
      console.log(`[WhatsApp Sync] Syncing messages...`);
      
      for (const conv of conversationsWithWhatsApp) {
        const waConvId = conv.channelMetadata?.whatsappConversationId;
        
        if (waConvId) {
          try {
            const msgResults = await syncWhatsAppMessages(conv.id, waConvId, createdBy, conv);
            results.messages.imported += msgResults.imported;
            results.messages.skipped += msgResults.skipped;
            if (msgResults.errors.length > 0) {
              results.messages.errors.push(...msgResults.errors);
            }
          } catch (err) {
            console.error(`[WhatsApp Sync] Error syncing messages for ${conv.id}:`, err);
            results.messages.errors.push({ conversationId: conv.id, error: err.message });
          }
        }
      }
    }
    
    // Sync durumunu kaydet
    await updateWhatsAppSyncStatus({
      lastSyncAt: serverTimestamp(),
      lastSyncBy: createdBy,
      lastResults: results,
    });
    
    results.success = true;
    console.log("[WhatsApp Sync] Sync completed:", results);
    
  } catch (error) {
    console.error("[WhatsApp Sync] Sync failed:", error);
    results.error = error.message;
  }
  
  return results;
};

/**
 * CRM conversation için WhatsApp mesajlarını sync et
 * 
 * ⚠️ Channel kontrolü KALDIRILDI - WhatsApp metadata varlığı kontrol edilir
 */
export const syncMessagesForConversation = async (crmConversationId, createdBy = null) => {
  try {
    const conversation = await getConversation(crmConversationId);
    
    if (!conversation) {
      return { success: false, error: 'Conversation bulunamadı' };
    }
    
    const waConvId = conversation.channelMetadata?.whatsappConversationId;
    if (!waConvId) {
      return { success: false, error: 'WhatsApp conversation ID bulunamadı. Bu konuşmada henüz WhatsApp iletişimi başlamamış.' };
    }
    
    console.log(`[WhatsApp Sync] Syncing messages for conversation ${crmConversationId} (channel: ${conversation.channel}, waConvId: ${waConvId})`);
    
    // conversation objesini geç
    const results = await syncWhatsAppMessages(crmConversationId, waConvId, createdBy, conversation);
    
    return { success: true, ...results };
  } catch (error) {
    console.error("[WhatsApp Sync] Error syncing messages:", error);
    return { success: false, error: error.message };
  }
};

/**
 * WhatsApp konuşmalarında name alanı boş olanları onar
 * channelMetadata.profileName değerinden name alanını doldurur
 */
export const repairWhatsAppConversationNames = async () => {
  const results = { updated: 0, skipped: 0, errors: [] };
  
  try {
    // WhatsApp konuşmalarını getir
    const conversationsQuery = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('channel', '==', CHANNEL.WHATSAPP)
    );
    
    const snapshot = await getDocs(conversationsQuery);
    console.log(`[WhatsApp Repair] Found ${snapshot.size} WhatsApp conversations`);
    
    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        
        // name alanı zaten doluysa atla
        if (data.name && data.name.trim() !== '') {
          results.skipped++;
          continue;
        }
        
        // channelMetadata.profileName'den al
        const profileName = data.channelMetadata?.profileName;
        
        if (!profileName || profileName.trim() === '') {
          // profileName de yoksa phone'dan al
          const phone = data.phone || data.channelMetadata?.waId;
          if (phone) {
            await updateDoc(doc(db, COLLECTIONS.CONVERSATIONS, docSnap.id), {
              name: phone,
              updatedAt: serverTimestamp()
            });
            results.updated++;
            console.log(`[WhatsApp Repair] Updated ${docSnap.id} with phone: ${phone}`);
          } else {
            results.skipped++;
          }
        } else {
          await updateDoc(doc(db, COLLECTIONS.CONVERSATIONS, docSnap.id), {
            name: profileName,
            updatedAt: serverTimestamp()
          });
          results.updated++;
          console.log(`[WhatsApp Repair] Updated ${docSnap.id} with profileName: ${profileName}`);
        }
        
      } catch (error) {
        console.error(`[WhatsApp Repair] Error updating ${docSnap.id}:`, error);
        results.errors.push({ id: docSnap.id, error: error.message });
      }
    }
    
  } catch (error) {
    console.error("[WhatsApp Repair] Error:", error);
    results.errors.push({ error: error.message });
  }
  
  console.log(`[WhatsApp Repair] Results:`, results);
  return results;
};
