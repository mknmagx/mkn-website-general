/**
 * CRM v2 - Conversation Service
 * 
 * Konuşma (thread) yönetimi servisi.
 * Kanaldan bağımsız olarak gelen her temas tek bir Conversation yapısına düşer.
 * Conversation, mesajlaşma ve ilk değerlendirme alanıdır.
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
  startAfter,
  Timestamp,
  serverTimestamp,
  writeBatch,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../firebase";
import { 
  COLLECTIONS, 
  CHANNEL, 
  CONVERSATION_STATUS, 
  PRIORITY,
  ACTIVITY_TYPE,
  MESSAGE_STATUS,
  REPLY_STATUS,
  REPLY_CHANNEL,
} from "./schema";
import { findCustomerByContact, createCustomer, updateCustomerStats } from "./customer-service";
import { generateMknEmailHtml } from "../../email-templates/mkn-email-template";
// HTML to Text utility
import { htmlToText } from "../../../utils/html-to-text";

/**
 * HTML içeriğinden düz metin çıkar (preview için)
 * html-to-text utility'sini kullanır
 */
const stripHtmlToText = (html) => {
  if (!html) return '';
  return htmlToText(html, { removeQuotes: false, removeSignature: false });
};

/**
 * Outlook API üzerinden email gönder
 * Client-side'dan çağrılabilir (API route kullanır)
 * MKN kurumsal template ile sarılmış HTML gönderir
 * @param {Object} options
 * @param {string} options.to - Alıcı email
 * @param {string} options.subject - Konu
 * @param {string} options.body - İçerik
 * @param {string} options.recipientName - Alıcı adı
 * @param {string} options.senderName - Gönderen adı
 * @param {string} options.conversationId - Outlook conversation ID (reply için)
 * @param {string} options.inReplyTo - Reply yapılan mesaj ID
 * @param {Array} options.attachments - Ekler [{name, contentType, contentBytes}]
 */
const sendEmailViaOutlook = async ({ to, subject, body, recipientName, senderName, conversationId, inReplyTo, attachments = [] }) => {
  try {
    // MKN kurumsal template ile sar
    const htmlBody = generateMknEmailHtml({
      recipientName: recipientName || '',
      subject: subject,
      bodyContent: body,
      senderName: senderName || 'MKN GROUP Ekibi',
      includeSignature: true,
    });
    
    const response = await fetch('/api/admin/outlook/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        body: htmlBody,
        bodyType: 'HTML',
        // Reply için gerekli bilgiler
        conversationId,
        inReplyTo,
        // Attachments
        attachments: attachments.filter(a => a.contentBytes).map(a => ({
          name: a.name,
          contentType: a.contentType || 'application/octet-stream',
          contentBytes: a.contentBytes,
        })),
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Email gönderilemedi');
    }
    
    return {
      success: true,
      messageId: result.messageId,
      conversationId: result.conversationId,
    };
  } catch (error) {
    console.error('[CRM] Outlook send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Yeni konuşma oluştur
 * 
 * ⚠️ DUPLICATE PROTECTION:
 * - Email kanalı için outlookMessageId/internetMessageId kontrolü yapar
 * - sourceRef (contact, quote) için duplicate kontrolü yapar
 * - Aynı kayıt varsa skip eder
 */
export const createConversation = async (conversationData) => {
  try {
    const now = serverTimestamp();
    
    // ==========================================================================
    // 🔒 DUPLICATE CHECK - Aynı conversation zaten var mı?
    // ==========================================================================
    
    // 1. Email kanalı için outlookMessageId kontrolü
    if (conversationData.channel === CHANNEL.EMAIL) {
      const outlookMessageId = conversationData.channelMetadata?.outlookMessageId;
      const internetMessageId = conversationData.channelMetadata?.internetMessageId;
      
      if (outlookMessageId || internetMessageId) {
        // Tüm email conversation'larını kontrol et (Firestore nested field query sınırlı)
        const emailConvsQuery = query(
          collection(db, COLLECTIONS.CONVERSATIONS),
          where('channel', '==', CHANNEL.EMAIL)
        );
        const emailConvsSnapshot = await getDocs(emailConvsQuery);
        
        for (const docSnap of emailConvsSnapshot.docs) {
          const data = docSnap.data();
          const existingOutlookId = data.channelMetadata?.outlookMessageId;
          const existingInternetId = data.channelMetadata?.internetMessageId;
          
          if (
            (outlookMessageId && existingOutlookId === outlookMessageId) ||
            (internetMessageId && existingInternetId === internetMessageId)
          ) {
            console.log(`[CRM] ⚠️ DUPLICATE PREVENTED - Conversation already exists for email: ${outlookMessageId || internetMessageId}`);
            return { 
              id: docSnap.id, 
              ...data, 
              skipped: true,
              skipReason: 'duplicate_email',
            };
          }
        }
      }
    }
    
    // 2. sourceRef (legacy import) için duplicate kontrolü
    if (conversationData.sourceRef?.type && conversationData.sourceRef?.id) {
      const sourceType = conversationData.sourceRef.type;
      const sourceId = conversationData.sourceRef.id;
      
      // Tüm conversation'ları kontrol et
      const allConvsSnapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
      
      for (const docSnap of allConvsSnapshot.docs) {
        const data = docSnap.data();
        if (
          data.sourceRef?.type === sourceType &&
          data.sourceRef?.id === sourceId
        ) {
          console.log(`[CRM] ⚠️ DUPLICATE PREVENTED - Conversation already exists for sourceRef: ${sourceType}_${sourceId}`);
          return { 
            id: docSnap.id, 
            ...data, 
            skipped: true,
            skipReason: 'duplicate_sourceRef',
          };
        }
      }
    }
    
    // ==========================================================================
    // ✅ DUPLICATE CHECK PASSED - Conversation oluştur
    // ==========================================================================
    
    // Orijinal tarih varsa hesapla (migration için)
    const originalCreatedAt = conversationData.channelMetadata?.originalCreatedAt;
    
    // Müşteri eşleştirme veya oluşturma
    let customerId = conversationData.customerId;
    
    if (!customerId && (conversationData.email || conversationData.phone)) {
      // Mevcut müşteriyi bul
      const existingCustomer = await findCustomerByContact(
        conversationData.email,
        conversationData.phone
      );
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else if (conversationData.autoCreateCustomer !== false) {
        // Yeni müşteri oluştur - orijinal tarihi de aktar
        const newCustomer = await createCustomer({
          name: conversationData.name || conversationData.senderName || '',
          email: conversationData.email || '',
          phone: conversationData.phone || '',
          companyName: conversationData.company || '',
          createdBy: conversationData.createdBy,
          // Migration: orijinal tarihi müşteriye de aktar
          originalCreatedAt: originalCreatedAt || null,
          // Migration: kaynak referansı
          sourceRef: conversationData.sourceRef || null,
        });
        customerId = newCustomer.id;
      }
    }
    
    const conversation = {
      // Müşteri bağlantısı
      customerId: customerId || null,
      
      // Gönderen bilgileri (müşteri eşleşmese bile)
      sender: {
        name: conversationData.name || conversationData.senderName || '',
        email: conversationData.email || '',
        phone: conversationData.phone || '',
        company: conversationData.company || '',
      },
      
      // Kanal bilgisi
      channel: conversationData.channel || CHANNEL.MANUAL,
      channelMetadata: conversationData.channelMetadata || {},
      // Örnek channelMetadata: { outlookConversationId: '...', emailThreadId: '...' }
      
      // Konu ve özet
      subject: conversationData.subject || 'Yeni Konuşma',
      // Preview: HTML içeriği temizlenmiş olmalı
      preview: conversationData.preview || stripHtmlToText(conversationData.message)?.substring(0, 200) || '',
      
      // Durum ve öncelik
      status: conversationData.status || CONVERSATION_STATUS.OPEN,
      priority: conversationData.priority || PRIORITY.NORMAL,
      
      // Yanıt takip durumu (🔴🟡🟢 badge sistemi)
      replyStatus: conversationData.replyStatus || REPLY_STATUS.AWAITING_US, // Yeni mesaj = 🔴 Bizden bekleniyor
      
      // Atama
      assignedTo: conversationData.assignedTo || null,
      
      // Etiketler
      tags: conversationData.tags || [],
      
      // Sayaçlar
      messageCount: 0, // addMessage ile artırılacak
      unreadCount: 0,  // addMessage ile artırılacak (inbound için)
      
      // Snooze (erteleme) bilgisi
      snoozedUntil: conversationData.snoozedUntil || null,
      
      // Bağlı Case (varsa)
      linkedCaseId: null,
      
      // Kaynak referansı (eski sistemden geldiyse)
      sourceRef: conversationData.sourceRef || null,
      // Örnek: { type: 'contact', id: 'contact_123' } veya { type: 'quote', id: 'quote_456' }
      
      // Meta
      // Eski sistemden gelen veriler için orijinal tarihi koru
      createdAt: conversationData.channelMetadata?.originalCreatedAt || now,
      updatedAt: now,
      lastMessageAt: conversationData.channelMetadata?.originalCreatedAt || now,
      closedAt: null,
      createdBy: conversationData.createdBy || null,
      // Migration bilgisi
      migratedAt: conversationData.sourceRef ? now : null,
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.CONVERSATIONS), conversation);
    
    // İlk mesajı ekle (message veya firstMessage field'ını kontrol et)
    const initialMessage = conversationData.message || conversationData.firstMessage;
    if (initialMessage) {
      await addMessage(docRef.id, {
        content: initialMessage,
        contentHtml: conversationData.messageHtml || null, // HTML içerik desteği
        direction: 'inbound',
        channel: conversation.channel,
        senderName: conversation.sender.name,
        senderEmail: conversation.sender.email,
        attachments: conversationData.attachments || [],
        createdBy: conversationData.createdBy,
        // Orijinal tarih varsa mesaja da ekle
        originalCreatedAt: conversationData.channelMetadata?.originalCreatedAt || null,
      });
    }
    
    // Müşteri istatistiklerini güncelle
    if (customerId) {
      await updateCustomerStats(customerId, {
        totalConversations: increment(1),
        lastContactAt: now,
      });
    }
    
    // Aktivite kaydı - orijinal tarih varsa onu kullan
    await logActivity({
      type: ACTIVITY_TYPE.CONVERSATION_CREATED,
      conversationId: docRef.id,
      customerId: customerId,
      performedBy: conversationData.createdBy,
      originalCreatedAt: conversationData.channelMetadata?.originalCreatedAt || null,
      metadata: { 
        channel: conversation.channel,
        subject: conversation.subject,
      },
    });
    
    return { id: docRef.id, ...conversation };
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

/**
 * Konuşma güncelle
 */
export const updateConversation = async (conversationId, updateData, updatedBy = null) => {
  try {
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    
    const updates = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };
    
    // Status değişikliği için özel işlemler
    if (updateData.status === CONVERSATION_STATUS.CLOSED && !updateData.closedAt) {
      updates.closedAt = serverTimestamp();
    }
    
    await updateDoc(conversationRef, updates);
    
    return true;
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
};

/**
 * Konuşma getir (legacy kayıtlar dahil)
 */
export const getConversation = async (conversationId) => {
  try {
    // Legacy kayıt kontrolü
    if (conversationId?.startsWith('legacy_')) {
      return await getLegacyConversationById(conversationId);
    }
    
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      return null;
    }
    
    return { id: conversationDoc.id, ...conversationDoc.data() };
  } catch (error) {
    console.error("Error getting conversation:", error);
    throw error;
  }
};

/**
 * Legacy kaydı ID'ye göre getir
 */
const getLegacyConversationById = async (legacyId) => {
  try {
    // ID formatı: legacy_contact_xxx, legacy_quote_xxx, legacy_email_xxx
    const parts = legacyId.split('_');
    if (parts.length < 3) return null;
    
    const type = parts[1]; // contact, quote, email
    const originalId = parts.slice(2).join('_'); // Orijinal ID
    
    if (type === 'contact') {
      // Contact form verisini getir
      const { getContactById } = await import('../contacts-service');
      const contact = await getContactById(originalId);
      if (!contact) return null;
      
      return {
        id: legacyId,
        type: 'legacy',
        sender: {
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          company: contact.company || '',
        },
        channel: CHANNEL.CONTACT_FORM,
        subject: contact.service || contact.product || 'İletişim Formu',
        preview: contact.message || '',
        status: mapLegacyContactStatus(contact.status),
        priority: PRIORITY.NORMAL,
        createdAt: contact.createdAt,
        lastMessageAt: contact.updatedAt || contact.createdAt,
        sourceRef: { type: 'contact', id: originalId },
        isLegacy: true,
        legacyData: contact,
        // Mesaj olarak orijinal içeriği kullan
        messages: [{
          id: `msg_${legacyId}`,
          content: contact.message || '',
          direction: 'inbound',
          sender: {
            name: contact.name || '',
            email: contact.email || '',
          },
          createdAt: contact.createdAt,
          metadata: {
            service: contact.service,
            product: contact.product,
            source: contact.source,
          }
        }],
      };
    }
    
    if (type === 'quote') {
      // Quote form verisini getir
      const { getQuoteById } = await import('../admin-quote-service');
      const result = await getQuoteById(originalId);
      if (!result?.success || !result?.quote) return null;
      const quote = result.quote;
      
      const firstName = quote.contactInfo?.firstName || '';
      const lastName = quote.contactInfo?.lastName || '';
      
      return {
        id: legacyId,
        type: 'legacy',
        sender: {
          name: `${firstName} ${lastName}`.trim() || 'İsimsiz',
          email: quote.contactInfo?.email || '',
          phone: quote.contactInfo?.phone || '',
          company: quote.contactInfo?.company || '',
        },
        channel: CHANNEL.QUOTE_FORM,
        subject: quote.projectInfo?.projectName || 'Teklif Talebi',
        preview: quote.projectInfo?.projectDescription || '',
        status: mapLegacyQuoteStatus(quote.metadata?.status),
        priority: PRIORITY.NORMAL,
        createdAt: quote.metadata?.submissionDate || quote.createdAt,
        lastMessageAt: quote.metadata?.lastUpdated || quote.createdAt,
        sourceRef: { type: 'quote', id: originalId },
        isLegacy: true,
        legacyData: quote,
        channelMetadata: {
          productType: quote.productInfo?.productType,
          quantity: quote.productInfo?.quantity,
          budget: quote.productInfo?.budget,
        },
        // Mesaj olarak orijinal içeriği kullan
        messages: [{
          id: `msg_${legacyId}`,
          content: formatQuoteMessage(quote),
          direction: 'inbound',
          sender: {
            name: `${firstName} ${lastName}`.trim() || 'İsimsiz',
            email: quote.contactInfo?.email || '',
          },
          createdAt: quote.metadata?.submissionDate || quote.createdAt,
          metadata: {
            projectInfo: quote.projectInfo,
            productInfo: quote.productInfo,
            contactInfo: quote.contactInfo,
          }
        }],
      };
    }
    
    if (type === 'email') {
      // Email thread verisini getir - doğrudan firestore'dan
      const threadDoc = await getDoc(doc(db, 'email_threads', originalId));
      if (!threadDoc.exists()) return null;
      const thread = { id: threadDoc.id, ...threadDoc.data() };
      
      return {
        id: legacyId,
        type: 'legacy',
        sender: {
          name: thread.toEmail?.split('@')[0] || '',
          email: thread.toEmail || '',
          phone: '',
          company: '',
        },
        channel: CHANNEL.EMAIL,
        subject: thread.subject || 'Email',
        preview: thread.lastMessagePreview || '',
        status: mapLegacyEmailStatus(thread.status),
        priority: PRIORITY.NORMAL,
        createdAt: thread.createdAt,
        lastMessageAt: thread.lastMessageAt || thread.createdAt,
        sourceRef: { type: 'email_thread', id: originalId },
        isLegacy: true,
        legacyData: thread,
        // Mesajları dönüştür
        messages: (thread.messages || []).map((msg, idx) => ({
          id: `msg_${legacyId}_${idx}`,
          content: msg.body || msg.content || '',
          direction: msg.type === 'sent' ? 'outbound' : 'inbound',
          sender: {
            name: msg.type === 'sent' ? 'MKN Group' : (thread.toEmail?.split('@')[0] || ''),
            email: msg.type === 'sent' ? 'info@mkngroup.com.tr' : thread.toEmail,
          },
          createdAt: msg.timestamp || msg.createdAt,
          metadata: {
            subject: msg.subject,
          }
        })),
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting legacy conversation:", error);
    return null;
  }
};

// Legacy status mapping helpers
const mapLegacyContactStatus = (status) => {
  const map = {
    'new': CONVERSATION_STATUS.OPEN,
    'pending': CONVERSATION_STATUS.OPEN,
    'replied': CONVERSATION_STATUS.OPEN,
    'closed': CONVERSATION_STATUS.CLOSED,
    'archived': CONVERSATION_STATUS.CLOSED,
  };
  return map[status] || CONVERSATION_STATUS.OPEN;
};

const mapLegacyQuoteStatus = (status) => {
  const map = {
    'new': CONVERSATION_STATUS.OPEN,
    'pending': CONVERSATION_STATUS.OPEN,
    'in_progress': CONVERSATION_STATUS.OPEN,
    'completed': CONVERSATION_STATUS.CLOSED,
    'rejected': CONVERSATION_STATUS.CLOSED,
  };
  return map[status] || CONVERSATION_STATUS.OPEN;
};

const mapLegacyEmailStatus = (status) => {
  const map = {
    'active': CONVERSATION_STATUS.OPEN,
    'pending': CONVERSATION_STATUS.OPEN,
    'closed': CONVERSATION_STATUS.CLOSED,
    'archived': CONVERSATION_STATUS.CLOSED,
  };
  return map[status] || CONVERSATION_STATUS.OPEN;
};

// Quote mesajını formatla
const formatQuoteMessage = (quote) => {
  const lines = [];
  
  if (quote.projectInfo?.projectName) {
    lines.push(`**Proje:** ${quote.projectInfo.projectName}`);
  }
  if (quote.projectInfo?.projectDescription) {
    lines.push(`**Açıklama:** ${quote.projectInfo.projectDescription}`);
  }
  if (quote.productInfo?.productType) {
    lines.push(`**Ürün Tipi:** ${quote.productInfo.productType}`);
  }
  if (quote.productInfo?.quantity) {
    lines.push(`**Miktar:** ${quote.productInfo.quantity}`);
  }
  if (quote.productInfo?.budget) {
    lines.push(`**Bütçe:** ${quote.productInfo.budget}`);
  }
  // additionalInfo obje veya string olabilir
  if (quote.additionalInfo) {
    if (typeof quote.additionalInfo === 'string') {
      lines.push(`**Ek Bilgi:** ${quote.additionalInfo}`);
    } else if (typeof quote.additionalInfo === 'object') {
      // Obje ise her alanı ayrı satıra yaz
      Object.entries(quote.additionalInfo).forEach(([key, value]) => {
        if (value && typeof value !== 'object') {
          lines.push(`**${key}:** ${value}`);
        }
      });
    }
  }
  // İletişim bilgilerini de ekle
  const contact = quote.contactInfo || {};
  if (contact.firstName || contact.lastName) {
    lines.push(`\n**İletişim:** ${contact.firstName || ''} ${contact.lastName || ''}`.trim());
  }
  if (contact.email) {
    lines.push(`**E-posta:** ${contact.email}`);
  }
  if (contact.phone) {
    lines.push(`**Telefon:** ${contact.phone}`);
  }
  if (contact.company) {
    lines.push(`**Firma:** ${contact.company}`);
  }
  
  return lines.join('\n\n') || 'Teklif talebi';
};

/**
 * Konuşma ile birlikte mesajları getir
 */
export const getConversationWithMessages = async (conversationId) => {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) return null;
    
    // Legacy kayıtlar zaten messages içeriyor
    if (conversation.isLegacy && conversation.messages) {
      return conversation;
    }
    
    const messages = await getConversationMessages(conversationId);
    
    return {
      ...conversation,
      messages,
    };
  } catch (error) {
    console.error("Error getting conversation with messages:", error);
    throw error;
  }
};

/**
 * Inbox için konuşmaları getir
 */
export const getInboxConversations = async (options = {}) => {
  try {
    const {
      status = null, // null = tümü, array = çoklu filtre
      channel = null,
      assignedTo = null,
      unreadOnly = false,
      customerId = null,
      tags = [],
      searchTerm = '',
      sortBy = 'createdAt', // Orijinal oluşturulma tarihine göre sırala
      sortDirection = 'desc',
      limitCount = 50,
      startAfterDoc = null,
    } = options;
    
    let q = collection(db, COLLECTIONS.CONVERSATIONS);
    let constraints = [];
    
    // Status filtresi
    if (status) {
      if (Array.isArray(status)) {
        constraints.push(where('status', 'in', status));
      } else {
        constraints.push(where('status', '==', status));
      }
    }
    
    // Channel filtresi
    if (channel) {
      constraints.push(where('channel', '==', channel));
    }
    
    // Atama filtresi
    if (assignedTo !== null) {
      constraints.push(where('assignedTo', '==', assignedTo));
    }
    
    // Müşteri filtresi
    if (customerId) {
      constraints.push(where('customerId', '==', customerId));
    }
    
    constraints.push(orderBy(sortBy, sortDirection));
    constraints.push(limit(limitCount));
    
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }
    
    q = query(q, ...constraints);
    
    const snapshot = await getDocs(q);
    let conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Client-side filtreler
    if (unreadOnly) {
      conversations = conversations.filter(c => c.unreadCount > 0);
    }
    
    if (tags.length > 0) {
      conversations = conversations.filter(c => 
        tags.some(tag => c.tags?.includes(tag))
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      conversations = conversations.filter(c => 
        c.subject?.toLowerCase().includes(term) ||
        c.preview?.toLowerCase().includes(term) ||
        c.sender?.name?.toLowerCase().includes(term) ||
        c.sender?.email?.toLowerCase().includes(term) ||
        c.sender?.company?.toLowerCase().includes(term)
      );
    }
    
    // Akıllı sıralama: 
    // - Birden fazla mesaj varsa (yanıt gelmiş/gönderilmiş) = lastMessageAt kullan
    // - Sadece tek mesaj varsa (sadece müşteri mesajı) = originalCreatedAt kullan
    // Bu sayede aktif konuşmalar yukarıda, eski yanıtsız mesajlar altta kalır
    conversations.sort((a, b) => {
      const getDisplayDate = (conv) => {
        // Birden fazla mesaj var mı? (yanıtlanmış conversation)
        const hasMultipleMessages = (conv.messageCount || 0) > 1;
        
        if (hasMultipleMessages && conv.lastMessageAt) {
          // Aktif konuşma - son mesaj tarihini kullan
          return conv.lastMessageAt?.toDate?.() || new Date(conv.lastMessageAt);
        }
        
        // Tek mesajlı veya yanıtsız - orijinal oluşturma tarihini kullan
        const originalDate = conv.channelMetadata?.originalCreatedAt;
        if (originalDate) {
          return originalDate?.toDate?.() || new Date(originalDate);
        }
        
        // Fallback: createdAt
        return conv.createdAt?.toDate?.() || new Date(conv.createdAt) || new Date(0);
      };
      
      const dateA = getDisplayDate(a);
      const dateB = getDisplayDate(b);
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    return conversations;
  } catch (error) {
    console.error("Error getting inbox conversations:", error);
    throw error;
  }
};

/**
 * Inbox sayıları (statüye göre)
 */
export const getInboxCounts = async (assignedTo = null) => {
  try {
    let q = collection(db, COLLECTIONS.CONVERSATIONS);
    
    if (assignedTo !== null) {
      q = query(q, where('assignedTo', '==', assignedTo));
    }
    
    const snapshot = await getDocs(q);
    
    const counts = {
      total: 0,
      open: 0,
      pending: 0,
      snoozed: 0,
      closed: 0,
      unread: 0,
      byChannel: {},
    };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      counts.total++;
      
      // Status sayıları
      switch (data.status) {
        case CONVERSATION_STATUS.OPEN:
          counts.open++;
          break;
        case CONVERSATION_STATUS.PENDING:
          counts.pending++;
          break;
        case CONVERSATION_STATUS.SNOOZED:
          counts.snoozed++;
          break;
        case CONVERSATION_STATUS.CLOSED:
          counts.closed++;
          break;
      }
      
      // Okunmamış sayısı
      if (data.unreadCount > 0) {
        counts.unread++;
      }
      
      // Kanal sayıları
      counts.byChannel[data.channel] = (counts.byChannel[data.channel] || 0) + 1;
    });
    
    return counts;
  } catch (error) {
    console.error("Error getting inbox counts:", error);
    throw error;
  }
};

/**
 * Konuşmaya mesaj ekle
 * 
 * ⚠️ DUPLICATE PROTECTION:
 * - Email mesajları için outlookMessageId/internetMessageId kontrolü
 * - Aynı mesaj varsa skip eder, mevcut mesajı döner
 * 
 * Yeni mesaj akışı:
 * 1. Kullanıcı mesaj yazar veya AI önerir
 * 2. Mesaj "draft" olarak kaydedilir
 * 3. Kullanıcı onaylarsa "sent" olarak işaretlenir
 * 4. İleride gerçek gönderim entegrasyonları eklenecek
 */
export const addMessage = async (conversationId, messageData) => {
  try {
    const now = serverTimestamp();
    
    // ==========================================================================
    // 🔒 DUPLICATE CHECK - Bu conversation'daki mesajları kontrol et
    // ==========================================================================
    
    // Bu conversation'daki TÜM mesajları al (index gerektirmez)
    const existingMsgsQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId)
    );
    const existingMsgsSnapshot = await getDocs(existingMsgsQuery);
    
    // Email duplicate check
    const outlookMessageId = messageData.emailMetadata?.outlookMessageId;
    const internetMessageId = messageData.emailMetadata?.internetMessageId;
    
    if (outlookMessageId || internetMessageId) {
      for (const docSnap of existingMsgsSnapshot.docs) {
        const data = docSnap.data();
        if (data.channel === CHANNEL.EMAIL) {
          if (
            (outlookMessageId && data.emailMetadata?.outlookMessageId === outlookMessageId) ||
            (internetMessageId && data.emailMetadata?.internetMessageId === internetMessageId)
          ) {
            console.log(`[CRM] ⚠️ DUPLICATE PREVENTED - Email already exists: ${outlookMessageId || internetMessageId}`);
            return { id: docSnap.id, ...data, skipped: true, skipReason: 'duplicate_email' };
          }
        }
      }
    }
    
    // WhatsApp duplicate check
    const wamId = messageData.channelMetadata?.wamId;
    
    if (wamId && messageData.channel === CHANNEL.WHATSAPP) {
      for (const docSnap of existingMsgsSnapshot.docs) {
        const data = docSnap.data();
        if (data.channel === CHANNEL.WHATSAPP && data.channelMetadata?.wamId === wamId) {
          console.log(`[CRM] ⚠️ DUPLICATE PREVENTED - WhatsApp message already exists: ${wamId}`);
          return { id: docSnap.id, ...data, skipped: true, skipReason: 'duplicate_whatsapp' };
        }
      }
    }
    
    // ==========================================================================
    // ✅ DUPLICATE CHECK PASSED - Mesaj oluştur
    // ==========================================================================
    
    // Orijinal tarih desteği (migration için)
    let createdAtValue = now;
    if (messageData.originalCreatedAt) {
      const originalDate = messageData.originalCreatedAt;
      if (originalDate?.toDate) {
        createdAtValue = originalDate;
      } else if (originalDate instanceof Date) {
        createdAtValue = Timestamp.fromDate(originalDate);
      } else if (typeof originalDate === 'string' || typeof originalDate === 'number') {
        createdAtValue = Timestamp.fromDate(new Date(originalDate));
      }
    }
    
    // Mesaj durumu belirleme
    // - Gelen mesajlar (inbound): her zaman 'received' (farklı tracking)
    // - Giden mesajlar (outbound): 
    //   - AI ile yazıldıysa: pending_approval
    //   - Manuel yazıldıysa: draft veya sent (saveAsDraft parametresine göre)
    let messageStatus = null;
    if (messageData.direction === 'outbound') {
      if (messageData.aiGenerated) {
        messageStatus = MESSAGE_STATUS.PENDING_APPROVAL;
      } else if (messageData.saveAsDraft === false) {
        messageStatus = MESSAGE_STATUS.SENT;
      } else {
        messageStatus = MESSAGE_STATUS.DRAFT;
      }
    }
    
    const message = {
      conversationId,
      content: messageData.content || '',
      contentHtml: messageData.contentHtml || null,
      direction: messageData.direction || 'inbound', // 'inbound' veya 'outbound'
      channel: messageData.channel || CHANNEL.MANUAL,
      
      // Mesaj durumu (sadece outbound için)
      status: messageStatus,
      
      // Yanıt kanalı (outbound için)
      replyChannel: messageData.replyChannel || REPLY_CHANNEL.MANUAL,
      
      // AI bilgileri
      aiGenerated: messageData.aiGenerated || false,
      aiModel: messageData.aiModel || null,
      aiMetadata: messageData.aiMetadata || null,
      
      // Gönderen bilgisi
      sender: {
        name: messageData.sender?.name || messageData.senderName || 
              (messageData.direction === 'outbound' ? 'MKN GROUP Ekibi' : ''),
        email: messageData.sender?.email || messageData.senderEmail || '',
        isStaff: messageData.direction === 'outbound',
      },
      
      // Ekler
      attachments: messageData.attachments || [],
      // Örnek: [{ name: 'file.pdf', url: '...', size: 1234, type: 'application/pdf' }]
      
      // E-posta metadata (varsa)
      emailMetadata: messageData.emailMetadata || null,
      // Örnek: { messageId: '...', inReplyTo: '...', references: [] }
      
      // Kanal metadata (WhatsApp, vb. için)
      // WhatsApp: { wamId, waId, phoneNumberId, type, mediaId, mediaUrl, ... }
      // Undefined değerleri filtreleyerek temiz bir obje oluştur
      channelMetadata: messageData.channelMetadata 
        ? Object.fromEntries(
            Object.entries(messageData.channelMetadata).filter(([_, v]) => v !== undefined)
          )
        : null,
      
      // Okundu durumu
      isRead: messageData.direction === 'outbound', // Giden mesajlar otomatik okundu
      readAt: messageData.direction === 'outbound' ? now : null,
      
      // Meta - orijinal tarih varsa onu kullan
      createdAt: createdAtValue,
      createdBy: messageData.createdBy || null,
      updatedAt: now,
      // Orijinal tarih meta verisi olarak da sakla
      ...(messageData.originalCreatedAt && { originalCreatedAt: messageData.originalCreatedAt }),
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), message);
    console.log(`[CRM] ✅ Message created: ${docRef.id} for conversation: ${conversationId}`);
    
    // Konuşmayı güncelle
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const updateData = {
        lastMessageAt: now,
        updatedAt: now,
        preview: messageData.content?.substring(0, 200) || '',
        messageCount: increment(1),
      };
      
      // Gelen mesajlarda okunmamış sayısını artır
      if (messageData.direction === 'inbound') {
        updateData.unreadCount = increment(1);
        updateData.status = CONVERSATION_STATUS.OPEN; // Yeni mesaj gelince tekrar aç
        updateData.replyStatus = REPLY_STATUS.AWAITING_US; // 🔴 Bizden yanıt bekleniyor
      }
      
      // Draft mesajlar için draft sayısı (opsiyonel tracking)
      if (messageStatus === MESSAGE_STATUS.DRAFT || messageStatus === MESSAGE_STATUS.PENDING_APPROVAL) {
        updateData.hasDraftReply = true;
      }
      
      await updateDoc(conversationRef, updateData);
      console.log(`[CRM] ✅ Conversation updated: ${conversationId}, messageCount incremented`);
    } else {
      // Conversation bulunamadı - bu kritik bir hata
      console.error(`[CRM] ❌ CRITICAL: Conversation not found: ${conversationId} - Message created but conversation not updated!`);
    }
    
    // Aktivite kaydı (sadece sent mesajlar için veya gelen mesajlar için)
    if (messageData.direction === 'inbound' || messageStatus === MESSAGE_STATUS.SENT) {
      await logActivity({
        type: messageData.direction === 'inbound' ? ACTIVITY_TYPE.MESSAGE_RECEIVED : ACTIVITY_TYPE.MESSAGE_SENT,
        conversationId,
        customerId: conversationDoc.data()?.customerId,
        performedBy: messageData.createdBy,
        metadata: { 
          channel: message.channel,
          hasAttachments: message.attachments.length > 0,
          aiGenerated: message.aiGenerated,
        },
      });
    }
    
    return { id: docRef.id, ...message };
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
};

/**
 * Konuşmanın mesajlarını getir
 */
export const getConversationMessages = async (conversationId, options = {}) => {
  try {
    const {
      limitCount = 100,
      sortDirection = 'asc', // Eski mesajlardan yeniye
    } = options;
    
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', sortDirection),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    throw error;
  }
};

/**
 * Mesaj durumunu güncelle
 */
export const updateMessageStatus = async (messageId, newStatus, updatedBy = null) => {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Mesaj bulunamadı');
    }
    
    const updateData = {
      status: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy,
    };
    
    // Gönderildi durumuna geçildiyse
    if (newStatus === MESSAGE_STATUS.SENT) {
      updateData.sentAt = serverTimestamp();
    }
    
    await updateDoc(messageRef, updateData);
    
    // Aktivite kaydı (sadece sent için)
    if (newStatus === MESSAGE_STATUS.SENT) {
      const messageData = messageDoc.data();
      await logActivity({
        type: ACTIVITY_TYPE.MESSAGE_SENT,
        conversationId: messageData.conversationId,
        performedBy: updatedBy,
        metadata: { 
          messageId,
          aiGenerated: messageData.aiGenerated || false,
        },
      });
      
      // Konuşmadaki draft durumunu temizle
      const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, messageData.conversationId);
      await updateDoc(conversationRef, {
        hasDraftReply: false,
        updatedAt: serverTimestamp(),
      });
    }
    
    return { id: messageId, status: newStatus };
  } catch (error) {
    console.error("Error updating message status:", error);
    throw error;
  }
};

/**
 * Mesajı onayla ve gönder (draft/pending_approval → sent)
 * @param {string} conversationId - Konuşma ID
 * @param {string} messageId - Mesaj ID
 * @param {string} userId - İşlemi yapan kullanıcı
 * @param {Object} sendOptions - Gönderim seçenekleri
 * @param {Array} sendOptions.channels - Gönderim kanalları ['email', 'whatsapp', 'manual']
 * @param {string} sendOptions.recipientEmail - Alıcı email
 * @param {string} sendOptions.recipientName - Alıcı adı (template için)
 * @param {string} sendOptions.recipientPhone - Alıcı telefon
 * @param {string} sendOptions.subject - E-posta konusu
 * @param {Array} sendOptions.attachments - Ekler [{name, contentType, contentBytes}]
 * @param {string} sendOptions.templateName - WhatsApp template adı (24 saat geçtiyse zorunlu)
 * @param {string} sendOptions.templateLanguage - WhatsApp template dili
 * @param {Array} sendOptions.templateComponents - WhatsApp template değişkenleri
 * @param {boolean} sendOptions.forceTemplate - WhatsApp template kullanımını zorla
 */
export const approveAndSendMessage = async (conversationId, messageId, userId = null, sendOptions = {}) => {
  try {
    const { 
      channels = ['manual'], 
      recipientEmail, 
      recipientName, 
      recipientPhone, 
      subject, 
      attachments = [],
      templateName,
      templateLanguage,
      templateComponents,
      forceTemplate,
    } = sendOptions;
    
    // Mesajı al
    const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Mesaj bulunamadı');
    }
    
    const messageData = messageDoc.data();
    const sentChannels = [];
    const errors = [];
    
    // Konuşmayı al (Outlook metadata için)
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationDoc = await getDoc(conversationRef);
    const conversationData = conversationDoc.exists() ? conversationDoc.data() : {};
    
    // Email gönderimi
    if (channels.includes('email') && recipientEmail) {
      try {
        // Mesajdaki attachment'ları veya gönderilen attachment'ları kullan
        const emailAttachments = attachments.length > 0 
          ? attachments 
          : (messageData.attachments || []).filter(a => a.contentBytes);
        
        // Outlook API üzerinden email gönder (MKN template ile)
        const emailResult = await sendEmailViaOutlook({
          to: recipientEmail,
          subject: subject ? `Re: ${subject}` : 'Yanıt',
          body: messageData.content,
          recipientName: recipientName || conversationData.sender?.name || '',
          senderName: 'MKN GROUP Ekibi',
          conversationId: conversationData.channelMetadata?.outlookConversationId,
          inReplyTo: conversationData.channelMetadata?.outlookMessageId,
          attachments: emailAttachments,
        });
        
        if (emailResult.success) {
          sentChannels.push('email');
          // Outlook message ID'yi kaydet
          await updateDoc(messageRef, {
            'emailMetadata.outlookMessageId': emailResult.messageId,
            'emailMetadata.outlookConversationId': emailResult.conversationId,
            'emailMetadata.to': recipientEmail, // Alıcı email - thread matching için
            'emailMetadata.sentAt': serverTimestamp(),
          });
          
          // Conversation'a outlookConversationId ve toRecipients'ı kaydet (reply matching için kritik!)
          const updateData = {};
          
          if (emailResult.conversationId && !conversationData.channelMetadata?.outlookConversationId) {
            updateData['channelMetadata.outlookConversationId'] = emailResult.conversationId;
          }
          
          // toRecipients listesine alıcıyı ekle (yoksa oluştur)
          const existingRecipients = conversationData.channelMetadata?.toRecipients || [];
          if (recipientEmail && !existingRecipients.includes(recipientEmail.toLowerCase())) {
            updateData['channelMetadata.toRecipients'] = [...existingRecipients, recipientEmail.toLowerCase()];
          }
          
          if (Object.keys(updateData).length > 0) {
            await updateDoc(conversationRef, updateData);
            console.log(`[CRM] Updated conversation metadata:`, updateData);
          }
        } else {
          errors.push({ channel: 'email', error: emailResult.error });
        }
      } catch (emailError) {
        console.error('[CRM] Email send error:', emailError);
        errors.push({ channel: 'email', error: emailError.message });
      }
    }
    
    // WhatsApp gönderimi
    if (channels.includes('whatsapp') && recipientPhone) {
      try {
        // WhatsApp sync servisini dinamik import et
        const { sendWhatsAppFromCRM, checkServiceWindow } = await import('./whatsapp-sync-service');
        
        // Service window kontrolü (24 saat kuralı)
        const windowStatus = await checkServiceWindow(conversationId);
        
        // Template zorlanıyorsa veya pencere kapalıysa template ile gönder
        const needsTemplate = forceTemplate || windowStatus.requiresTemplate;
        
        if (needsTemplate && !templateName) {
          // Template gerekli ama seçilmemiş
          errors.push({ 
            channel: 'whatsapp', 
            error: '24 saat penceresi kapanmış. WhatsApp göndermek için şablon seçmelisiniz.',
            requiresTemplate: true,
            windowStatus,
          });
        } else {
          // Mesaj gönder (template veya normal)
          const whatsappResult = await sendWhatsAppFromCRM(
            conversationId, 
            messageData.content,
            { 
              forceTemplate: needsTemplate,
              templateName: templateName,
              templateLanguage: templateLanguage || 'tr',
              templateComponents: templateComponents || [],
              recipientPhone: recipientPhone, // İletişim formu gibi kanallar için
              skipCrmRecord: true,
            }
          );
          
          if (whatsappResult.success) {
            sentChannels.push('whatsapp');
            // WhatsApp metadata'yı kaydet (sadece undefined olmayan değerler)
            const whatsappMetadata = {
              'whatsappMetadata.messageType': whatsappResult.messageType,
              'whatsappMetadata.sentAt': serverTimestamp(),
            };
            
            if (whatsappResult.wamId) {
              whatsappMetadata['whatsappMetadata.wamId'] = whatsappResult.wamId;
            }
            
            if (needsTemplate && templateName) {
              whatsappMetadata['whatsappMetadata.templateName'] = templateName;
            }
            
            await updateDoc(messageRef, whatsappMetadata);
          } else {
            errors.push({ channel: 'whatsapp', error: whatsappResult.error });
          }
        }
      } catch (whatsappError) {
        console.error('[CRM] WhatsApp send error:', whatsappError);
        errors.push({ channel: 'whatsapp', error: whatsappError.message });
      }
    }
    
    // Manuel kayıt (her zaman başarılı)
    if (channels.includes('manual')) {
      sentChannels.push('manual');
    }
    
    // En az bir kanal başarılı olduysa mesajı "sent" olarak işaretle
    if (sentChannels.length > 0 || errors.length === 0) {
      // Mesajın birincil kanalını belirle (öncelik: email > whatsapp > manual)
      let primaryChannel = CHANNEL.MANUAL;
      if (sentChannels.includes('email')) {
        primaryChannel = CHANNEL.EMAIL;
      } else if (sentChannels.includes('whatsapp')) {
        primaryChannel = CHANNEL.WHATSAPP;
      }
      
      await updateDoc(messageRef, {
        status: MESSAGE_STATUS.SENT,
        channel: primaryChannel, // Gönderilen birincil kanal
        sentAt: serverTimestamp(),
        sentBy: userId,
        sentChannels: sentChannels,
        sendErrors: errors.length > 0 ? errors : null,
        updatedAt: serverTimestamp(),
      });
      
      // Konuşma durumunu güncelle
      await updateDoc(conversationRef, {
        status: CONVERSATION_STATUS.PENDING, // Cevap bekleniyor
        replyStatus: REPLY_STATUS.AWAITING_CUSTOMER,
        lastReplyAt: serverTimestamp(),
        lastReplyBy: 'agent',
        hasDraftReply: false,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return { 
        success: true, 
        messageId, 
        sentChannels, 
        errors: errors.length > 0 ? errors : null 
      };
    } else {
      throw new Error('Hiçbir kanal üzerinden gönderilemedi: ' + errors.map(e => e.error).join(', '));
    }
  } catch (error) {
    console.error("Error approving and sending message:", error);
    throw error;
  }
};

/**
 * Mesaj içeriğini güncelle
 */
export const updateMessageContent = async (messageId, newContent, updatedBy = null) => {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Mesaj bulunamadı');
    }
    
    const messageData = messageDoc.data();
    
    // Sadece draft veya pending_approval durumundaki mesajlar düzenlenebilir
    if (messageData.status && ![MESSAGE_STATUS.DRAFT, MESSAGE_STATUS.PENDING_APPROVAL].includes(messageData.status)) {
      throw new Error('Sadece taslak durumundaki mesajlar düzenlenebilir');
    }
    
    await updateDoc(messageRef, {
      content: newContent,
      updatedAt: serverTimestamp(),
      updatedBy,
      // Düzenlendiyse AI etiketini koru ama düzenlendiğini belirt
      ...(messageData.aiGenerated && { aiEdited: true }),
    });
    
    return { id: messageId, content: newContent };
  } catch (error) {
    console.error("Error updating message content:", error);
    throw error;
  }
};

/**
 * Mesajı sil (sadece draft durumundakiler)
 */
export const deleteMessage = async (messageId, deletedBy = null) => {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Mesaj bulunamadı');
    }
    
    const messageData = messageDoc.data();
    
    // Sadece draft durumundaki mesajlar silinebilir
    if (messageData.status && ![MESSAGE_STATUS.DRAFT, MESSAGE_STATUS.PENDING_APPROVAL].includes(messageData.status)) {
      throw new Error('Sadece taslak durumundaki mesajlar silinebilir');
    }
    
    await deleteDoc(messageRef);
    
    // Konuşmadaki draft durumunu kontrol et
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, messageData.conversationId);
    const remainingDrafts = await getDocs(query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', messageData.conversationId),
      where('direction', '==', 'outbound'),
      where('status', 'in', [MESSAGE_STATUS.DRAFT, MESSAGE_STATUS.PENDING_APPROVAL]),
      limit(1)
    ));
    
    if (remainingDrafts.empty) {
      await updateDoc(conversationRef, {
        hasDraftReply: false,
        updatedAt: serverTimestamp(),
      });
    }
    
    return { id: messageId, deleted: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

/**
 * Mesajı zorla sil (admin işlemi - tüm mesaj türlerini silebilir)
 */
export const forceDeleteMessage = async (messageId, deletedBy = null) => {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Mesaj bulunamadı');
    }
    
    const messageData = messageDoc.data();
    
    await deleteDoc(messageRef);
    
    // Konuşma mesaj sayısını güncelle
    if (messageData.conversationId) {
      const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, messageData.conversationId);
      await updateDoc(conversationRef, {
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log(`[Force Delete] Message ${messageId} deleted by ${deletedBy}`);
    return { id: messageId, deleted: true };
  } catch (error) {
    console.error("Error force deleting message:", error);
    throw error;
  }
};

/**
 * Mesajı tekrar gönder (kullanıcı mesajını yeniden işleme almak için)
 */
export const resendMessage = async (messageId, resendBy = null) => {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Mesaj bulunamadı');
    }
    
    const messageData = messageDoc.data();
    
    // Mesaj bilgilerini güncelle
    await updateDoc(messageRef, {
      status: MESSAGE_STATUS.SENT,
      resentAt: serverTimestamp(),
      resentBy: resendBy,
      isResent: true,
    });
    
    // Konuşmayı güncelle
    if (messageData.conversationId) {
      const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, messageData.conversationId);
      await updateDoc(conversationRef, {
        updatedAt: serverTimestamp(),
        status: CONVERSATION_STATUS.OPEN, // Açık duruma getir
        unreadCount: increment(1),
      });
    }
    
    console.log(`[Resend] Message ${messageId} resent by ${resendBy}`);
    return { id: messageId, resent: true };
  } catch (error) {
    console.error("Error resending message:", error);
    throw error;
  }
};

/**
 * Konuşmayı okundu olarak işaretle
 */
export const markConversationAsRead = async (conversationId, readBy = null) => {
  try {
    const batch = writeBatch(db);
    
    // Konuşmadaki tüm okunmamış mesajları işaretle
    const messagesQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId),
      where('isRead', '==', false)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    const now = serverTimestamp();
    
    messagesSnapshot.forEach(messageDoc => {
      batch.update(doc(db, COLLECTIONS.MESSAGES, messageDoc.id), {
        isRead: true,
        readAt: now,
        readBy,
      });
    });
    
    // Konuşmayı güncelle
    batch.update(doc(db, COLLECTIONS.CONVERSATIONS, conversationId), {
      unreadCount: 0,
      updatedAt: now,
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};

/**
 * Konuşmayı kapat
 */
export const closeConversation = async (conversationId, closedBy = null, reason = null) => {
  try {
    await updateConversation(conversationId, {
      status: CONVERSATION_STATUS.CLOSED,
      closedAt: serverTimestamp(),
    }, closedBy);
    
    await logActivity({
      type: ACTIVITY_TYPE.CONVERSATION_CLOSED,
      conversationId,
      performedBy: closedBy,
      metadata: { reason },
    });
    
    return true;
  } catch (error) {
    console.error("Error closing conversation:", error);
    throw error;
  }
};

/**
 * Konuşmayı ertele (snooze)
 */
export const snoozeConversation = async (conversationId, snoozeUntil, snoozedBy = null) => {
  try {
    await updateConversation(conversationId, {
      status: CONVERSATION_STATUS.SNOOZED,
      snoozedUntil: Timestamp.fromDate(new Date(snoozeUntil)),
    }, snoozedBy);
    
    return true;
  } catch (error) {
    console.error("Error snoozing conversation:", error);
    throw error;
  }
};

/**
 * Konuşmayı birine ata
 */
export const assignConversation = async (conversationId, assignedTo, assignedBy = null) => {
  try {
    await updateConversation(conversationId, {
      assignedTo,
    }, assignedBy);
    
    const conversation = await getConversation(conversationId);
    
    await logActivity({
      type: ACTIVITY_TYPE.CONVERSATION_ASSIGNED,
      conversationId,
      customerId: conversation?.customerId,
      performedBy: assignedBy,
      metadata: { assignedTo },
    });
    
    return true;
  } catch (error) {
    console.error("Error assigning conversation:", error);
    throw error;
  }
};

/**
 * Konuşmayı Case'e dönüştür / bağla
 */
export const convertToCase = async (conversationId, caseId, convertedBy = null) => {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // caseId string olmalı
    if (!caseId || typeof caseId !== 'string') {
      throw new Error('Case ID is required to link conversation');
    }
    
    await updateConversation(conversationId, {
      status: CONVERSATION_STATUS.CONVERTED,
      linkedCaseId: caseId,
    }, convertedBy);
    
    return true;
  } catch (error) {
    console.error("Error converting to case:", error);
    throw error;
  }
};

/**
 * Konuşma sil
 */
export const deleteConversation = async (conversationId) => {
  try {
    const batch = writeBatch(db);
    
    // İlişkili mesajları sil
    const messagesQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.forEach(messageDoc => {
      batch.delete(doc(db, COLLECTIONS.MESSAGES, messageDoc.id));
    });
    
    // Konuşmayı sil
    batch.delete(doc(db, COLLECTIONS.CONVERSATIONS, conversationId));
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

/**
 * Snoozed konuşmaları kontrol et ve aç (scheduled job için)
 */
export const checkSnoozedConversations = async () => {
  try {
    const now = Timestamp.now();
    
    const q = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('status', '==', CONVERSATION_STATUS.SNOOZED),
      where('snoozedUntil', '<=', now)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.forEach(convDoc => {
      batch.update(doc(db, COLLECTIONS.CONVERSATIONS, convDoc.id), {
        status: CONVERSATION_STATUS.OPEN,
        snoozedUntil: null,
        updatedAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
    return snapshot.size;
  } catch (error) {
    console.error("Error checking snoozed conversations:", error);
    throw error;
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Aktivite kaydı oluştur (internal)
 */
const logActivity = async (activityData) => {
  try {
    await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
      ...activityData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

// =============================================================================
// DUPLICATE CLEANUP
// =============================================================================

/**
 * Bir konuşmadaki duplicate mesajları temizle
 * outlookMessageId veya internetMessageId'ye göre eşleşenleri bulur ve ilkini bırakıp diğerlerini siler
 */
export const cleanupDuplicateMessages = async (conversationId) => {
  try {
    console.log(`[CRM] Starting duplicate cleanup for conversation: ${conversationId}`);
    
    let deletedCount = 0;
    const batch = writeBatch(db);
    
    // Bu conversation'daki TÜM mesajları al (tek query - index gerektirmez)
    const allMsgsQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId)
    );
    const allMsgsSnapshot = await getDocs(allMsgsQuery);
    
    // ==========================================================================
    // 1. EMAIL DUPLICATE CLEANUP
    // ==========================================================================
    const emailMessageGroups = {};
    allMsgsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.channel === CHANNEL.EMAIL) {
        const key = data.emailMetadata?.outlookMessageId || data.emailMetadata?.internetMessageId;
        if (key) {
          if (!emailMessageGroups[key]) {
            emailMessageGroups[key] = [];
          }
          emailMessageGroups[key].push({ id: docSnap.id, ...data, createdAt: data.createdAt?.toDate?.() || new Date() });
        }
      }
    });
    
    for (const [key, messages] of Object.entries(emailMessageGroups)) {
      if (messages.length > 1) {
        messages.sort((a, b) => a.createdAt - b.createdAt);
        const [keep, ...toDelete] = messages;
        
        console.log(`[CRM] Found ${toDelete.length} email duplicates for: ${key}`);
        
        for (const msg of toDelete) {
          batch.delete(doc(db, COLLECTIONS.MESSAGES, msg.id));
          deletedCount++;
        }
      }
    }
    
    // ==========================================================================
    // 2. WHATSAPP DUPLICATE CLEANUP
    // ==========================================================================
    const waMessageGroups = {};
    allMsgsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.channel === CHANNEL.WHATSAPP) {
        const key = data.channelMetadata?.wamId;
        if (key) {
          if (!waMessageGroups[key]) {
            waMessageGroups[key] = [];
          }
          waMessageGroups[key].push({ id: docSnap.id, ...data, createdAt: data.createdAt?.toDate?.() || new Date() });
        }
      }
    });
    
    for (const [key, messages] of Object.entries(waMessageGroups)) {
      if (messages.length > 1) {
        messages.sort((a, b) => a.createdAt - b.createdAt);
        const [keep, ...toDelete] = messages;
        
        console.log(`[CRM] Found ${toDelete.length} WhatsApp duplicates for wamId: ${key}`);
        
        for (const msg of toDelete) {
          batch.delete(doc(db, COLLECTIONS.MESSAGES, msg.id));
          deletedCount++;
        }
      }
    }
    
    // ==========================================================================
    // 3. COMMIT & UPDATE
    // ==========================================================================
    if (deletedCount > 0) {
      await batch.commit();
      
      // Mesaj sayısını güncelle
      const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      if (conversationDoc.exists()) {
        const newMsgSnapshot = await getDocs(query(
          collection(db, COLLECTIONS.MESSAGES),
          where('conversationId', '==', conversationId)
        ));
        await updateDoc(conversationRef, {
          messageCount: newMsgSnapshot.size,
          updatedAt: serverTimestamp(),
        });
      }
    }
    
    console.log(`[CRM] Duplicate cleanup complete. Deleted ${deletedCount} duplicate messages.`);
    return { deleted: deletedCount };
  } catch (error) {
    console.error("[CRM] Error cleaning up duplicates:", error);
    throw error;
  }
};

/**
 * WhatsApp conversation'daki channelMetadata olmayan mesajları temizle
 * Bu fonksiyon sadece bir kerelik migration için kullanılmalı
 */
export const cleanupWhatsAppMessagesWithoutWamId = async (conversationId) => {
  try {
    console.log(`[CRM] Cleaning up WhatsApp messages without wamId for: ${conversationId}`);
    
    // Bu conversation'daki tüm mesajları al
    const msgsQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId)
    );
    const msgsSnapshot = await getDocs(msgsQuery);
    
    // WhatsApp mesajlarını filtrele
    const whatsappMsgs = [];
    msgsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.channel === CHANNEL.WHATSAPP) {
        whatsappMsgs.push({ id: docSnap.id, ...data });
      }
    });
    
    // channelMetadata olmayan mesajları bul
    const msgsWithoutWamId = whatsappMsgs.filter(msg => !msg.channelMetadata?.wamId);
    
    if (msgsWithoutWamId.length === 0) {
      console.log(`[CRM] No WhatsApp messages without wamId found`);
      return { deleted: 0 };
    }
    
    console.log(`[CRM] Found ${msgsWithoutWamId.length} WhatsApp messages without wamId`);
    
    // Sil
    const batch = writeBatch(db);
    for (const msg of msgsWithoutWamId) {
      batch.delete(doc(db, COLLECTIONS.MESSAGES, msg.id));
    }
    await batch.commit();
    
    // Mesaj sayısını güncelle
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const newMsgSnapshot = await getDocs(query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', conversationId)
    ));
    await updateDoc(conversationRef, {
      messageCount: newMsgSnapshot.size,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`[CRM] Deleted ${msgsWithoutWamId.length} messages without wamId`);
    return { deleted: msgsWithoutWamId.length };
  } catch (error) {
    console.error("[CRM] Error cleaning up messages without wamId:", error);
    throw error;
  }
};

/**
 * Tüm konuşmalardaki duplicate mesajları temizle
 */
export const cleanupAllDuplicateMessages = async () => {
  try {
    console.log(`[CRM] Starting global duplicate cleanup...`);
    
    const convQuery = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('channel', '==', CHANNEL.EMAIL)
    );
    const convSnapshot = await getDocs(convQuery);
    
    let totalDeleted = 0;
    
    for (const convDoc of convSnapshot.docs) {
      const result = await cleanupDuplicateMessages(convDoc.id);
      totalDeleted += result.deleted;
    }
    
    console.log(`[CRM] Global duplicate cleanup complete. Total deleted: ${totalDeleted}`);
    return { totalDeleted, conversationsChecked: convSnapshot.size };
  } catch (error) {
    console.error("[CRM] Error in global duplicate cleanup:", error);
    throw error;
  }
};

// =============================================================================
// CONVERSATION MERGE - İki conversation'ı birleştir
// =============================================================================

/**
 * İki conversation'ı birleştir
 * 
 * Kullanım durumu: Teklif formu ve ayrı düşen email reply'ını birleştirmek
 * 
 * @param {string} targetConversationId - Ana conversation (mesajlar buraya taşınacak)
 * @param {string} sourceConversationId - Kapatılacak conversation (mesajları taşınacak)
 * @param {string} userId - İşlemi yapan kullanıcı
 * @returns {Object} Birleştirme sonucu
 */
export const mergeConversations = async (targetConversationId, sourceConversationId, userId = null) => {
  try {
    console.log(`[CRM] Merging conversations: ${sourceConversationId} -> ${targetConversationId}`);
    
    // 1. Her iki conversation'ı al
    const targetRef = doc(db, COLLECTIONS.CONVERSATIONS, targetConversationId);
    const sourceRef = doc(db, COLLECTIONS.CONVERSATIONS, sourceConversationId);
    
    const [targetDoc, sourceDoc] = await Promise.all([
      getDoc(targetRef),
      getDoc(sourceRef),
    ]);
    
    if (!targetDoc.exists()) {
      throw new Error(`Hedef conversation bulunamadı: ${targetConversationId}`);
    }
    
    if (!sourceDoc.exists()) {
      throw new Error(`Kaynak conversation bulunamadı: ${sourceConversationId}`);
    }
    
    const targetData = targetDoc.data();
    const sourceData = sourceDoc.data();
    
    console.log(`[CRM] Target: ${targetData.subject} (${targetData.channel})`);
    console.log(`[CRM] Source: ${sourceData.subject} (${sourceData.channel})`);
    
    // 2. Kaynak conversation'daki mesajları al
    const sourceMsgsQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('conversationId', '==', sourceConversationId)
    );
    const sourceMsgsSnapshot = await getDocs(sourceMsgsQuery);
    
    console.log(`[CRM] Found ${sourceMsgsSnapshot.docs.length} messages to move`);
    
    // 3. Mesajları hedef conversation'a taşı
    const batch = writeBatch(db);
    let movedCount = 0;
    
    for (const msgDoc of sourceMsgsSnapshot.docs) {
      const msgData = msgDoc.data();
      
      // Mesajı hedef conversation'a taşı
      batch.update(msgDoc.ref, {
        conversationId: targetConversationId,
        movedFrom: sourceConversationId,
        movedAt: serverTimestamp(),
        movedBy: userId,
      });
      
      movedCount++;
    }
    
    // 4. Hedef conversation'ı güncelle
    const newMessageCount = (targetData.messageCount || 0) + movedCount;
    const newUnreadCount = (targetData.unreadCount || 0) + (sourceData.unreadCount || 0);
    
    // outlookConversationId'yi de taşı (eğer hedefte yoksa)
    const metadataUpdates = {};
    if (sourceData.channelMetadata?.outlookConversationId && !targetData.channelMetadata?.outlookConversationId) {
      metadataUpdates['channelMetadata.outlookConversationId'] = sourceData.channelMetadata.outlookConversationId;
    }
    if (sourceData.channelMetadata?.toRecipients?.length > 0) {
      const existingRecipients = targetData.channelMetadata?.toRecipients || [];
      const newRecipients = [...new Set([...existingRecipients, ...sourceData.channelMetadata.toRecipients])];
      metadataUpdates['channelMetadata.toRecipients'] = newRecipients;
    }
    
    batch.update(targetRef, {
      messageCount: newMessageCount,
      unreadCount: newUnreadCount,
      lastMessageAt: sourceData.lastMessageAt || targetData.lastMessageAt,
      updatedAt: serverTimestamp(),
      ...metadataUpdates,
    });
    
    // 5. Kaynak conversation'ı sil veya "merged" olarak işaretle
    batch.update(sourceRef, {
      status: CONVERSATION_STATUS.CLOSED,
      mergedInto: targetConversationId,
      mergedAt: serverTimestamp(),
      mergedBy: userId,
      closedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // 6. Batch'i commit et
    await batch.commit();
    
    // 7. Aktivite kaydı
    await logActivity({
      type: ACTIVITY_TYPE.CONVERSATION_MERGED,
      conversationId: targetConversationId,
      performedBy: userId,
      metadata: {
        action: 'conversations_merged',
        sourceConversationId,
        movedMessages: movedCount,
        sourceChannel: sourceData.channel,
        targetChannel: targetData.channel,
      },
    });
    
    console.log(`[CRM] ✅ Merge completed. Moved ${movedCount} messages.`);
    
    return {
      success: true,
      movedMessages: movedCount,
      targetConversationId,
      sourceConversationId,
    };
  } catch (error) {
    console.error("[CRM] Error merging conversations:", error);
    throw error;
  }
};

/**
 * Ayrı düşmüş email conversation'larını tespit et
 * 
 * Aynı müşteri email'i + benzer subject ile farklı kanalda conversation var mı?
 */
export const detectOrphanedEmailReplies = async () => {
  try {
    console.log(`[CRM] Detecting orphaned email replies...`);
    
    // Tüm conversation'ları al
    const allConversationsSnapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
    
    const emailConversations = [];
    const formConversations = []; // quote_form, contact_form
    
    allConversationsSnapshot.docs.forEach(docSnap => {
      const data = { id: docSnap.id, ...docSnap.data() };
      
      // Kapalı/merged olanları atla
      if (data.status === 'closed' && data.mergedInto) return;
      
      if (data.channel === CHANNEL.EMAIL) {
        emailConversations.push(data);
      } else if ([CHANNEL.QUOTE_FORM, CHANNEL.CONTACT_FORM].includes(data.channel)) {
        formConversations.push(data);
      }
    });
    
    console.log(`[CRM] Found ${emailConversations.length} email conversations, ${formConversations.length} form conversations`);
    
    // Potansiyel birleştirme adaylarını email'e göre grupla
    const byEmail = {};
    
    for (const emailConv of emailConversations) {
      const emailSender = emailConv.sender?.email?.toLowerCase();
      if (!emailSender) continue;
      
      // Aynı müşteri email'i ile form conversation ara
      for (const formConv of formConversations) {
        const formSender = formConv.sender?.email?.toLowerCase();
        if (!formSender || formSender !== emailSender) continue;
        
        // Subject benzerliği kontrol et veya aynı outlookConversationId
        const emailSubject = emailConv.subject?.toLowerCase() || '';
        const formSubject = formConv.subject?.toLowerCase() || '';
        
        // Aynı Outlook conversation ID ise kesin birleştirmeli
        const sameOutlookConv = 
          emailConv.channelMetadata?.outlookConversationId && 
          formConv.channelMetadata?.outlookConversationId &&
          emailConv.channelMetadata.outlookConversationId === formConv.channelMetadata.outlookConversationId;
        
        const subjectSimilar = 
          emailSubject.includes(formSubject) ||
          formSubject.includes(emailSubject) ||
          emailSubject === formSubject;
        
        if (sameOutlookConv || subjectSimilar) {
          if (!byEmail[emailSender]) {
            byEmail[emailSender] = {
              email: emailSender,
              potentialMatches: [],
            };
          }
          
          // Daha önce eklenmemişse ekle
          const exists = byEmail[emailSender].potentialMatches.some(
            m => m.formConversation?.id === formConv.id && m.emailConversation?.id === emailConv.id
          );
          
          if (!exists) {
            byEmail[emailSender].potentialMatches.push({
              formConversation: {
                id: formConv.id,
                subject: formConv.subject,
                channel: formConv.channel,
              },
              emailConversation: {
                id: emailConv.id,
                subject: emailConv.subject,
                channel: emailConv.channel,
              },
              confidence: sameOutlookConv ? 'high' : 'medium',
            });
          }
        }
      }
    }
    
    const results = Object.values(byEmail);
    console.log(`[CRM] Found ${results.length} potential merge candidates`);
    
    return results;
  } catch (error) {
    console.error("[CRM] Error detecting orphaned replies:", error);
    throw error;
  }
};

/**
 * Tüm conversation'ların messageCount değerini gerçek mesaj sayısına göre düzelt
 * Migration sonrası oluşan tutarsızlıkları gidermek için kullanılır
 * 
 * @returns {Object} - Düzeltme sonuçları
 */
export const recalculateMessageCounts = async () => {
  try {
    console.log('[CRM] Starting messageCount recalculation...');
    
    const results = {
      total: 0,
      fixed: 0,
      alreadyCorrect: 0,
      errors: [],
    };
    
    // Tüm conversation'ları al
    const conversationsSnapshot = await getDocs(collection(db, COLLECTIONS.CONVERSATIONS));
    results.total = conversationsSnapshot.size;
    
    console.log(`[CRM] Found ${results.total} conversations to check`);
    
    // Her conversation için mesaj sayısını kontrol et
    for (const convDoc of conversationsSnapshot.docs) {
      try {
        const convId = convDoc.id;
        const convData = convDoc.data();
        const currentCount = convData.messageCount || 0;
        
        // Bu conversation'a ait mesajları say
        const messagesQuery = query(
          collection(db, COLLECTIONS.MESSAGES),
          where('conversationId', '==', convId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const actualCount = messagesSnapshot.size;
        
        // Eğer sayılar farklıysa güncelle
        if (currentCount !== actualCount) {
          console.log(`[CRM] Fixing conversation ${convId}: ${currentCount} → ${actualCount}`);
          
          // lastMessageAt'i de güncelle (en son mesajın tarihine göre)
          let lastMessageAt = convData.createdAt;
          
          if (actualCount > 0) {
            // En son mesajı bul
            const sortedMessages = messagesSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
                return dateB - dateA;
              });
            
            if (sortedMessages.length > 0 && sortedMessages[0].createdAt) {
              lastMessageAt = sortedMessages[0].createdAt;
            }
          }
          
          await updateDoc(doc(db, COLLECTIONS.CONVERSATIONS, convId), {
            messageCount: actualCount,
            lastMessageAt: lastMessageAt,
            updatedAt: serverTimestamp(),
          });
          
          results.fixed++;
        } else {
          results.alreadyCorrect++;
        }
      } catch (error) {
        console.error(`[CRM] Error processing conversation ${convDoc.id}:`, error);
        results.errors.push({
          conversationId: convDoc.id,
          error: error.message,
        });
      }
    }
    
    console.log('[CRM] messageCount recalculation completed:', results);
    
    return results;
  } catch (error) {
    console.error('[CRM] Error recalculating message counts:', error);
    throw error;
  }
};
