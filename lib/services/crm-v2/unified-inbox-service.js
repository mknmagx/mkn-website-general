/**
 * CRM v2 - Unified Inbox Service
 * 
 * Tüm kanallardan gelen mesajları birleştiren servis.
 * Mevcut sistemlerden (contacts, quotes, outlook) verileri çeker
 * ve yeni CRM yapısına dönüştürür.
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
import { 
  COLLECTIONS, 
  CHANNEL,
  CONVERSATION_STATUS,
  PRIORITY,
} from "./schema";
import { createConversation, getInboxConversations, getInboxCounts, findOrCreateCustomerConversation } from "./conversation-service";
import { findCustomerByContact } from "./customer-service";

// Eski sistem servisleri
import { getAllContacts, CONTACT_STATUS } from "../contacts-service";
import { getQuotes } from "../admin-quote-service";
// Email thread servisleri
import { getActiveThreads } from "../email-thread-service";
import { getEmails, getEmailById } from "../graph-service";

/**
 * Eski sistemden verileri import et (one-time migration)
 */
export const importFromLegacySystems = async (options = {}) => {
  try {
    const {
      importContacts = true,
      importQuotes = true,
      importEmails = true,
      skipExisting = true,
      createdBy = null,
    } = options;
    
    console.log('[CRM Migration] Starting import with options:', { importContacts, importQuotes, importEmails, skipExisting });
    
    const results = {
      contacts: { imported: 0, skipped: 0, errors: [] },
      quotes: { imported: 0, skipped: 0, errors: [] },
      emails: { imported: 0, skipped: 0, errors: [] },
    };
    
    // Mevcut sourceRef'leri al (duplicate kontrolü için - bir kez çek, hepsinde kullan)
    // Nested field query'leri index gerektirdiği için tüm kayıtları çekip Set ile kontrol ediyoruz
    let existingSourceRefs = new Set();
    if (skipExisting) {
      const existingQuery = query(collection(db, COLLECTIONS.CONVERSATIONS));
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.sourceRef?.type && data.sourceRef?.id) {
          existingSourceRefs.add(`${data.sourceRef.type}_${data.sourceRef.id}`);
        }
      });
      console.log('[CRM Migration] Found existing source refs:', existingSourceRefs.size);
    }
    
    // Contacts import
    if (importContacts) {
      console.log('[CRM Migration] Fetching contacts...');
      const contacts = await getAllContacts();
      console.log('[CRM Migration] Found contacts:', contacts?.length || 0);
      
      for (const contact of contacts) {
        try {
          // Zaten import edilmiş mi kontrol et (Set ile hızlı kontrol)
          if (skipExisting) {
            const sourceRefKey = `contact_${contact.id}`;
            if (existingSourceRefs.has(sourceRefKey)) {
              results.contacts.skipped++;
              continue;
            }
          }
          
          // Conversation oluştur
          // Eski sistemdeki orijinal tarihi Firestore Timestamp'a çevir
          let originalTimestamp = null;
          if (contact.createdAt) {
            if (contact.createdAt.toDate) {
              // Zaten Firestore Timestamp
              originalTimestamp = contact.createdAt;
            } else if (contact.createdAt instanceof Date) {
              originalTimestamp = Timestamp.fromDate(contact.createdAt);
            } else if (typeof contact.createdAt === 'string' || typeof contact.createdAt === 'number') {
              const parsedDate = new Date(contact.createdAt);
              if (!isNaN(parsedDate.getTime())) {
                originalTimestamp = Timestamp.fromDate(parsedDate);
              }
            }
          }
          
          console.log('[CRM Migration] Importing contact:', contact.id, contact.name);
          
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
            // Eski sistemden gelen atama ve etiket bilgileri
            assignedTo: contact.assignedTo || null,
            tags: contact.tags || [],
            // Takip tarihi varsa snooze olarak kullan
            snoozedUntil: (() => {
              if (!contact.followUpDate) return null;
              if (contact.followUpDate.toDate) return contact.followUpDate;
              const d = new Date(contact.followUpDate);
              return !isNaN(d.getTime()) ? Timestamp.fromDate(d) : null;
            })(),
            // Timestamp'ı koru - eski sistemdeki orijinal tarih ve tüm legacy metadata
            channelMetadata: {
              originalCreatedAt: originalTimestamp,
              legacySystem: 'contacts',
              // Eski sistemden gelen ek bilgiler
              source: contact.source || null,
              responseTime: contact.responseTime || null,
              legacyNotes: contact.notes || [],
              legacyStatus: contact.status,
              legacyPriority: contact.priority,
            },
          });
          
          results.contacts.imported++;
          console.log('[CRM Migration] Contact imported successfully:', contact.id);
        } catch (error) {
          console.error('[CRM Migration] Error importing contact:', contact.id, error);
          results.contacts.errors.push({ contactId: contact.id, error: error.message });
        }
      }
    }
    
    // Quotes import
    if (importQuotes) {
      console.log('[CRM Migration] Fetching quotes...');
      const quotesResponse = await getQuotes({ limit: 1000 });
      const quotes = quotesResponse?.quotes || [];
      console.log('[CRM Migration] Found quotes:', quotes?.length || 0);
      
      for (const quote of quotes) {
        try {
          // Zaten import edilmiş mi kontrol et (Set ile hızlı kontrol)
          if (skipExisting) {
            const sourceRefKey = `quote_${quote.id}`;
            if (existingSourceRefs.has(sourceRefKey)) {
              results.quotes.skipped++;
              continue;
            }
          }
          
          // Quote verilerini normalize et
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
          
          // Eski sistemdeki orijinal tarihi Firestore Timestamp'a çevir
          const quoteOriginalDate = quote.metadata?.submissionDate || quote.createdAt;
          let quoteTimestamp = null;
          if (quoteOriginalDate) {
            if (quoteOriginalDate.toDate) {
              // Zaten Firestore Timestamp
              quoteTimestamp = quoteOriginalDate;
            } else if (quoteOriginalDate instanceof Date) {
              quoteTimestamp = Timestamp.fromDate(quoteOriginalDate);
            } else if (typeof quoteOriginalDate === 'string' || typeof quoteOriginalDate === 'number') {
              const parsedDate = new Date(quoteOriginalDate);
              if (!isNaN(parsedDate.getTime())) {
                quoteTimestamp = Timestamp.fromDate(parsedDate);
              }
            }
          }
          
          console.log('[CRM Migration] Importing quote:', quote.id, fullName);
          
          // Conversation oluştur
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
            // Eski sistemden gelen atama bilgisi
            assignedTo: quote.metadata?.assignedTo || null,
            channelMetadata: {
              originalCreatedAt: quoteTimestamp,
              legacySystem: 'quotes',
              // Proje bilgileri
              serviceArea: serviceArea,
              serviceSubcategory: serviceSubcategory,
              targetMarket: quote.projectInfo?.targetMarket,
              estimatedQuantity: quote.projectInfo?.estimatedQuantity || null,
              budget: quote.projectInfo?.budget || null,
              targetLaunchDate: quote.projectInfo?.targetLaunchDate || null,
              // Ek bilgiler
              additionalNotes: quote.additionalInfo?.notes || null,
              adminNotes: quote.metadata?.adminNotes || null,
              // Tam legacy data referansı
              legacyStatus: quote.metadata?.status,
              legacyPriority: quote.metadata?.priority,
              // İletişim detayları
              contactPosition: quote.contactInfo?.position || null,
              contactCountry: quote.contactInfo?.country || null,
            },
          });
          
          results.quotes.imported++;
          console.log('[CRM Migration] Quote imported successfully:', quote.id);
        } catch (error) {
          console.error('[CRM Migration] Error importing quote:', quote.id, error);
          results.quotes.errors.push({ quoteId: quote.id, error: error.message });
        }
      }
    }
    
    // Email Threads import
    if (importEmails) {
      try {
        console.log('[CRM Migration] Fetching email threads...');
        const threads = await getActiveThreads();
        console.log('[CRM Migration] Found email threads:', threads?.length || 0);
        
        for (const thread of threads) {
          try {
            // Zaten import edilmiş mi kontrol et (Set ile hızlı kontrol)
            if (skipExisting) {
              const sourceRefKey = `email_thread_${thread.id}`;
              if (existingSourceRefs.has(sourceRefKey)) {
                results.emails.skipped++;
                continue;
              }
            }
            
            // Eski sistemdeki orijinal tarihi Firestore Timestamp'a çevir
            let threadTimestamp = null;
            if (thread.createdAt) {
              if (thread.createdAt.toDate) {
                // Zaten Firestore Timestamp
                threadTimestamp = thread.createdAt;
              } else if (thread.createdAt instanceof Date) {
                threadTimestamp = Timestamp.fromDate(thread.createdAt);
              } else if (typeof thread.createdAt === 'string' || typeof thread.createdAt === 'number') {
                const parsedDate = new Date(thread.createdAt);
                if (!isNaN(parsedDate.getTime())) {
                  threadTimestamp = Timestamp.fromDate(parsedDate);
                }
              }
            }
            
            console.log('[CRM Migration] Importing email thread:', thread.id);
            
            // Conversation oluştur
            await createConversation({
              name: thread.toEmail?.split('@')[0] || '',
              email: thread.toEmail || '',
              phone: '',
              company: '',
              channel: CHANNEL.EMAIL,
              subject: thread.subject || 'E-posta',
              message: '', // İlk mesaj content'i sonra eklenebilir
              status: CONVERSATION_STATUS.OPEN,
              priority: PRIORITY.NORMAL,
              sourceRef: { type: 'email_thread', id: thread.id },
              createdBy,
              channelMetadata: {
                conversationId: thread.conversationId,
                messageId: thread.messageId,
                originalCreatedAt: threadTimestamp,
                legacySystem: 'email_threads',
              },
            });
            
            results.emails.imported++;
            console.log('[CRM Migration] Email thread imported successfully:', thread.id);
          } catch (error) {
            console.error('[CRM Migration] Error importing email thread:', thread.id, error);
            results.emails.errors.push({ threadId: thread.id, error: error.message });
          }
        }
      } catch (error) {
        console.error("[CRM Migration] Error fetching email threads:", error);
        results.emails.errors.push({ error: error.message });
      }
    }
    
    console.log('[CRM Migration] Import completed. Results:', results);
    
    return results;
  } catch (error) {
    console.error("Error importing from legacy systems:", error);
    throw error;
  }
};

/**
 * Yeni gelen verileri real-time olarak Conversation'a dönüştür
 * Bu fonksiyon API endpoint'lerinden çağrılacak
 * 
 * 🆕 MÜŞTERİ BAZLI SİSTEM:
 * - Önce müşteriyi bul/oluştur (email veya telefon ile)
 * - Müşterinin mevcut AÇIK conversation'ını bul
 * - Varsa aynı conversation'a yeni mesaj ekle
 * - Yoksa yeni conversation oluştur
 */
export const ingestFromChannel = async (channelType, data) => {
  try {
    // Müşteri tanımlayıcıları hazırla
    let customerIdentifiers = {};
    let messageData = {};
    let options = {};
    
    switch (channelType) {
      case 'contact_form':
        customerIdentifiers = {
          email: data.email || '',
          phone: data.phone || '',
          name: data.name || '',
          company: data.company || '',
        };
        messageData = {
          channel: CHANNEL.CONTACT_FORM,
          subject: data.service || data.subject || 'İletişim Formu',
          message: data.message || '',
        };
        options = {
          status: CONVERSATION_STATUS.OPEN,
          priority: PRIORITY.NORMAL,
          sourceRef: data.sourceRef || null,
          createdBy: data.createdBy,
        };
        break;
        
      case 'quote_form':
        const firstName = data.contactInfo?.firstName || data.firstName || '';
        const lastName = data.contactInfo?.lastName || data.lastName || '';
        customerIdentifiers = {
          email: data.contactInfo?.email || data.email || '',
          phone: data.contactInfo?.phone || data.phone || '',
          name: `${firstName} ${lastName}`.trim() || data.name || '',
          company: data.contactInfo?.company || data.company || '',
        };
        messageData = {
          channel: CHANNEL.QUOTE_FORM,
          subject: data.projectInfo?.projectName || data.subject || 'Teklif Talebi',
          message: data.projectInfo?.projectDescription || data.message || '',
          channelMetadata: {
            serviceArea: data.projectInfo?.serviceArea,
            targetMarket: data.projectInfo?.targetMarket,
          },
        };
        options = {
          status: CONVERSATION_STATUS.OPEN,
          priority: PRIORITY.NORMAL,
          sourceRef: data.sourceRef || null,
          createdBy: data.createdBy,
        };
        break;
        
      case 'email':
        customerIdentifiers = {
          email: data.senderEmail || data.from?.email || '',
          phone: '',
          name: data.senderName || data.from?.name || '',
          company: '',
        };
        messageData = {
          channel: CHANNEL.EMAIL,
          subject: data.subject || 'E-posta',
          message: data.body || data.content || '',
          attachments: data.attachments || [],
          channelMetadata: {
            messageId: data.messageId,
            conversationId: data.conversationId,
            internetMessageId: data.internetMessageId,
            outlookMessageId: data.messageId, // Duplicate kontrolü için
          },
        };
        options = {
          status: CONVERSATION_STATUS.OPEN,
          priority: PRIORITY.NORMAL,
          sourceRef: data.sourceRef || null,
          createdBy: data.createdBy,
        };
        break;
        
      case 'phone':
        customerIdentifiers = {
          email: '',
          phone: data.callerPhone || data.phone || '',
          name: data.callerName || '',
          company: data.company || '',
        };
        messageData = {
          channel: CHANNEL.PHONE,
          subject: data.subject || 'Telefon Görüşmesi',
          message: data.notes || data.message || '',
        };
        options = {
          status: CONVERSATION_STATUS.OPEN,
          priority: data.priority || PRIORITY.NORMAL,
          createdBy: data.createdBy,
        };
        break;
        
      case 'whatsapp':
        customerIdentifiers = {
          email: '',
          phone: data.senderPhone || data.phone || '',
          name: data.senderName || '',
          company: '',
        };
        messageData = {
          channel: CHANNEL.WHATSAPP,
          subject: 'WhatsApp Mesajı',
          message: data.message || '',
          attachments: data.attachments || [],
          channelMetadata: {
            whatsappId: data.whatsappId,
            wamId: data.wamId, // Duplicate kontrolü için
          },
        };
        options = {
          status: CONVERSATION_STATUS.OPEN,
          priority: PRIORITY.NORMAL,
          createdBy: data.createdBy,
        };
        break;
        
      case 'social_instagram':
      case 'social_facebook':
      case 'social_linkedin':
      case 'social_twitter':
        customerIdentifiers = {
          email: data.email || '',
          phone: '',
          name: data.senderName || data.username || '',
          company: '',
        };
        messageData = {
          channel: CHANNEL[`SOCIAL_${channelType.split('_')[1].toUpperCase()}`],
          subject: `${channelType.split('_')[1]} Mesajı`,
          message: data.message || '',
          channelMetadata: {
            profileUrl: data.profileUrl,
            username: data.username,
          },
        };
        options = {
          status: CONVERSATION_STATUS.OPEN,
          priority: PRIORITY.NORMAL,
          createdBy: data.createdBy,
        };
        break;
        
      case 'manual':
      default:
        customerIdentifiers = {
          email: data.email || '',
          phone: data.phone || '',
          name: data.name || '',
          company: data.company || '',
        };
        messageData = {
          channel: CHANNEL.MANUAL,
          subject: data.subject || 'Manuel Kayıt',
          message: data.message || '',
        };
        options = {
          status: CONVERSATION_STATUS.OPEN,
          priority: data.priority || PRIORITY.NORMAL,
          createdBy: data.createdBy,
        };
    }
    
    // 🆕 Müşteri bazlı conversation oluştur/güncelle
    const result = await findOrCreateCustomerConversation(
      customerIdentifiers,
      messageData,
      options
    );
    
    console.log('[ingestFromChannel] Result:', {
      channel: channelType,
      customerId: result.customer?.id,
      conversationId: result.conversation?.id,
      isNewConversation: result.isNewConversation,
      channelAdded: result.channelAdded,
    });
    
    return result.conversation;
  } catch (error) {
    console.error("Error ingesting from channel:", error);
    throw error;
  }
};

/**
 * Unified Inbox - Tüm kaynaklardan verileri birleştir
 * Bu fonksiyon hem yeni CRM verilerini hem de (geçiş döneminde) eski sistem verilerini gösterebilir
 */
export const getUnifiedInbox = async (options = {}) => {
  try {
    const {
      includeLegacy = false, // Eski sistemden de çek
      ...conversationOptions
    } = options;
    
    // Yeni CRM conversation'larını al
    let conversations = await getInboxConversations(conversationOptions);
    
    // Geçiş döneminde eski sistemden de veri çekmek istersek
    if (includeLegacy) {
      // Bu özellik migration tamamlandıktan sonra kapatılacak
      const legacyData = await getLegacyInboxItems(conversationOptions);
      
      // Yeni sistemde olmayan eski verileri ekle
      const existingSourceRefs = new Set(
        conversations
          .filter(c => c.sourceRef)
          .map(c => `${c.sourceRef.type}_${c.sourceRef.id}`)
      );
      
      const newLegacyItems = legacyData.filter(item => 
        !existingSourceRefs.has(`${item.sourceRef?.type}_${item.sourceRef?.id}`)
      );
      
      conversations = [...conversations, ...newLegacyItems];
      
      // Akıllı sıralama: 
      // - Birden fazla mesaj varsa (yanıt gelmiş/gönderilmiş) = lastMessageAt kullan
      // - Sadece tek mesaj varsa (sadece müşteri mesajı) = originalCreatedAt kullan
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
        return dateB - dateA;
      });
    }
    
    return conversations;
  } catch (error) {
    console.error("Error getting unified inbox:", error);
    throw error;
  }
};

/**
 * Eski sistemden inbox item'larını al (geçiş dönemi için)
 */
const getLegacyInboxItems = async (options = {}) => {
  try {
    const items = [];
    
    // Contacts
    try {
      const contacts = await getAllContacts();
      for (const contact of contacts) {
        items.push({
          id: `legacy_contact_${contact.id}`,
          type: 'legacy',
          sender: {
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            company: contact.company || '',
          },
          channel: CHANNEL.CONTACT_FORM,
          subject: contact.service || contact.product || 'İletişim Formu',
          preview: contact.message?.substring(0, 200) || '',
          status: mapContactStatusToConversationStatus(contact.status),
          priority: mapPriority(contact.priority),
          createdAt: contact.createdAt,
          lastMessageAt: contact.updatedAt || contact.createdAt,
          sourceRef: { type: 'contact', id: contact.id },
          isLegacy: true,
          legacyData: contact,
        });
      }
    } catch (error) {
      console.error("Error fetching legacy contacts:", error);
    }
    
    // Quotes
    try {
      const quotesResult = await getQuotes();
      const quotes = quotesResult?.quotes || [];
      for (const quote of quotes) {
        const firstName = quote.contactInfo?.firstName || '';
        const lastName = quote.contactInfo?.lastName || '';
        
        items.push({
          id: `legacy_quote_${quote.id}`,
          type: 'legacy',
          sender: {
            name: `${firstName} ${lastName}`.trim() || 'İsimsiz',
            email: quote.contactInfo?.email || '',
            phone: quote.contactInfo?.phone || '',
            company: quote.contactInfo?.company || '',
          },
          channel: CHANNEL.QUOTE_FORM,
          subject: quote.projectInfo?.projectName || 'Teklif Talebi',
          preview: quote.projectInfo?.projectDescription?.substring(0, 200) || '',
          status: mapQuoteStatusToConversationStatus(quote.metadata?.status),
          priority: mapPriority(quote.metadata?.priority),
          createdAt: quote.metadata?.submissionDate || quote.createdAt,
          lastMessageAt: quote.metadata?.lastUpdated || quote.createdAt,
          sourceRef: { type: 'quote', id: quote.id },
          isLegacy: true,
          legacyData: quote,
        });
      }
    } catch (error) {
      console.error("Error fetching legacy quotes:", error);
    }
    
    // Email Threads
    try {
      const threads = await getActiveThreads();
      for (const thread of threads) {
        items.push({
          id: `legacy_email_${thread.id}`,
          type: 'legacy',
          sender: {
            name: thread.toEmail?.split('@')[0] || '',
            email: thread.toEmail || '',
            phone: '',
            company: '',
          },
          channel: CHANNEL.EMAIL,
          subject: thread.subject || 'E-posta',
          preview: '',
          status: CONVERSATION_STATUS.OPEN,
          priority: PRIORITY.NORMAL,
          createdAt: thread.createdAt,
          lastMessageAt: thread.lastReplyAt || thread.createdAt,
          sourceRef: { type: 'email_thread', id: thread.id },
          isLegacy: true,
          legacyData: thread,
          messageCount: thread.replyCount || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching email threads:", error);
    }
    
    return items;
  } catch (error) {
    console.error("Error getting legacy inbox items:", error);
    return [];
  }
};

/**
 * Unified Inbox sayıları
 */
export const getUnifiedInboxCounts = async (options = {}) => {
  try {
    const { includeLegacy = false, assignedTo = null } = options;
    
    const counts = await getInboxCounts(assignedTo);
    
    if (includeLegacy) {
      // Eski sistem sayılarını ekle (migration tamamlandıktan sonra kaldırılacak)
      const contacts = await getAllContacts();
      const quotesResponse = await getQuotes({ limit: 1000 });
      const quotes = quotesResponse?.quotes || [];
      
      // Sadece yeni sistemde olmayan eski kayıtları say
      const existingQuery = query(collection(db, COLLECTIONS.CONVERSATIONS));
      const existingSnapshot = await getDocs(existingQuery);
      const existingSourceRefs = new Set();
      
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.sourceRef) {
          existingSourceRefs.add(`${data.sourceRef.type}_${data.sourceRef.id}`);
        }
      });
      
      let legacyNewCount = 0;
      
      contacts.forEach(contact => {
        if (!existingSourceRefs.has(`contact_${contact.id}`)) {
          if (contact.status === 'new') legacyNewCount++;
        }
      });
      
      quotes.forEach(quote => {
        if (!existingSourceRefs.has(`quote_${quote.id}`)) {
          if (quote.metadata?.status === 'new') legacyNewCount++;
        }
      });
      
      counts.legacyNew = legacyNewCount;
    }
    
    return counts;
  } catch (error) {
    console.error("Error getting unified inbox counts:", error);
    throw error;
  }
};

/**
 * Müşteri arama (e-posta, telefon, isim ile)
 */
export const searchCustomerForConversation = async (searchTerm) => {
  try {
    // E-posta formatında mı kontrol et
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchTerm);
    // Telefon formatında mı kontrol et  
    const isPhone = /^[\d\s\-\+\(\)]+$/.test(searchTerm) && searchTerm.replace(/\D/g, '').length >= 7;
    
    if (isEmail) {
      return await findCustomerByContact(searchTerm, null);
    }
    
    if (isPhone) {
      return await findCustomerByContact(null, searchTerm);
    }
    
    // İsim araması - client-side yapılacak
    return null;
  } catch (error) {
    console.error("Error searching customer:", error);
    return null;
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Contact status -> Conversation status mapping
 */
const mapContactStatusToConversationStatus = (status) => {
  const mapping = {
    'new': CONVERSATION_STATUS.OPEN,
    'in-progress': CONVERSATION_STATUS.PENDING,
    'responded': CONVERSATION_STATUS.CLOSED,
    'closed': CONVERSATION_STATUS.CLOSED,
  };
  return mapping[status] || CONVERSATION_STATUS.OPEN;
};

/**
 * Quote status -> Conversation status mapping
 */
const mapQuoteStatusToConversationStatus = (status) => {
  const mapping = {
    'new': CONVERSATION_STATUS.OPEN,
    'in-progress': CONVERSATION_STATUS.PENDING,
    'responded': CONVERSATION_STATUS.CLOSED,
    'closed': CONVERSATION_STATUS.CLOSED,
  };
  return mapping[status] || CONVERSATION_STATUS.OPEN;
};

/**
 * Priority mapping
 */
const mapPriority = (priority) => {
  const mapping = {
    'low': PRIORITY.LOW,
    'normal': PRIORITY.NORMAL,
    'high': PRIORITY.HIGH,
    'urgent': PRIORITY.URGENT,
  };
  return mapping[priority] || PRIORITY.NORMAL;
};

// =============================================================================
// RESET / CLEAR ALL DATA
// =============================================================================

/**
 * Tüm CRM v2 koleksiyonlarını sıfırla
 * ⚠️ DİKKAT: Bu işlem geri alınamaz!
 */
export const resetAllCrmCollections = async () => {
  try {
    const { deleteDoc, doc } = await import("firebase/firestore");
    
    const collectionsToReset = [
      COLLECTIONS.CUSTOMERS,
      COLLECTIONS.CONVERSATIONS,
      COLLECTIONS.MESSAGES,
      COLLECTIONS.CASES,
      COLLECTIONS.ACTIVITIES,
    ];
    
    const results = {};
    
    for (const collectionName of collectionsToReset) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        let deletedCount = 0;
        
        // Her dokümanı sil
        const deletePromises = snapshot.docs.map(async (docSnapshot) => {
          await deleteDoc(doc(db, collectionName, docSnapshot.id));
          deletedCount++;
        });
        
        await Promise.all(deletePromises);
        results[collectionName] = { deleted: deletedCount, success: true };
      } catch (error) {
        console.error(`Error resetting ${collectionName}:`, error);
        results[collectionName] = { deleted: 0, success: false, error: error.message };
      }
    }
    
    return {
      success: true,
      results,
      totalDeleted: Object.values(results).reduce((sum, r) => sum + (r.deleted || 0), 0),
    };
  } catch (error) {
    console.error("Error resetting CRM collections:", error);
    throw error;
  }
};
