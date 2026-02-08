/**
 * CRM v2 - Conversation Migration Service
 * 
 * Aynı müşteriye ait duplicate conversation'ları tek conversation'da birleştirir.
 * 
 * Migration Mantığı:
 * 1. Tüm conversation'ları alır
 * 2. Email veya telefon bazlı gruplar
 * 3. Her grup için en eski conversation'ı "primary" olarak seçer
 * 4. Diğer conversation'ların mesajlarını primary'ye taşır
 * 5. Eski conversation'ları siler
 * 
 * Güvenlik:
 * - Dry-run modu ile önce nelerin birleştirileceğini gösterir
 * - Her adımda detaylı log tutar
 * - Hata durumunda partial rollback yapabilir
 */

import { adminDb } from "../../firebase-admin";
import admin from "firebase-admin";
import { COLLECTIONS, CHANNEL, CONVERSATION_STATUS } from "./schema";
import { normalizePhone as normalizePhoneUtil } from "../../utils/phone-utils";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Email'i normalize et (lowercase, trim)
 */
const normalizeEmail = (email) => {
  if (!email) return null;
  return email.toLowerCase().trim();
};

/**
 * Telefonu normalize et (sadece rakamlar)
 */
const normalizePhone = (phone) => {
  if (!phone) return null;
  // normalizePhone fonksiyonunu kullan (phone-utils'den)
  const normalized = normalizePhoneUtil(phone);
  // Zaten normalize edilmiş hali döner (örn: '905361234567')
  return normalized || null;
};

/**
 * Conversation'dan müşteri tanımlayıcılarını çıkar
 */
const extractCustomerIdentifiers = (conversation) => {
  const identifiers = [];
  
  // Email
  const email = normalizeEmail(conversation.sender?.email);
  if (email && email.length > 3) {
    identifiers.push({ type: 'email', value: email });
  }
  
  // Telefon
  const phone = normalizePhone(conversation.sender?.phone);
  if (phone && phone.length >= 7) {
    identifiers.push({ type: 'phone', value: phone });
  }
  
  // channelMetadata'dan da kontrol et
  if (conversation.channelMetadata?.waId) {
    const waPhone = normalizePhone(conversation.channelMetadata.waId);
    if (waPhone && waPhone.length >= 7) {
      identifiers.push({ type: 'phone', value: waPhone });
    }
  }
  
  return identifiers;
};

/**
 * İki conversation'ın aynı müşteriye ait olup olmadığını kontrol et
 */
const isSameCustomer = (conv1, conv2) => {
  const ids1 = extractCustomerIdentifiers(conv1);
  const ids2 = extractCustomerIdentifiers(conv2);
  
  for (const id1 of ids1) {
    for (const id2 of ids2) {
      if (id1.type === id2.type && id1.value === id2.value) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Conversation'ın oluşturulma tarihini al
 */
const getConversationDate = (conv) => {
  // Önce orijinal tarih, yoksa createdAt
  const originalDate = conv.channelMetadata?.originalCreatedAt;
  if (originalDate) {
    return originalDate?.toDate?.() || new Date(originalDate);
  }
  
  const createdAt = conv.createdAt;
  if (createdAt) {
    return createdAt?.toDate?.() || new Date(createdAt);
  }
  
  return new Date(0);
};

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Duplicate conversation'ları analiz et
 * @returns {Object} Analysis sonucu
 */
export const analyzeDuplicateConversations = async () => {
  try {
    console.log('[Migration] Analyzing duplicate conversations...');
    
    // Tüm conversation'ları al (Admin SDK)
    const conversationsSnapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS).get();
    const conversations = [];
    
    conversationsSnapshot.forEach(doc => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    console.log(`[Migration] Found ${conversations.length} total conversations`);
    
    // Müşteri grupları oluştur
    const customerGroups = new Map(); // identifier -> [conversations]
    const processedConvIds = new Set();
    
    for (const conv of conversations) {
      if (processedConvIds.has(conv.id)) continue;
      
      const identifiers = extractCustomerIdentifiers(conv);
      if (identifiers.length === 0) {
        // Tanımlayıcısı olmayan conversation'lar
        continue;
      }
      
      // Bu conversation'a eşleşen mevcut bir grup var mı?
      let foundGroup = null;
      for (const id of identifiers) {
        const key = `${id.type}:${id.value}`;
        if (customerGroups.has(key)) {
          foundGroup = customerGroups.get(key);
          break;
        }
      }
      
      if (foundGroup) {
        // Bu conversation aynı müşteriye mi ait?
        const isSame = foundGroup.conversations.some(c => isSameCustomer(c, conv));
        if (isSame) {
          foundGroup.conversations.push(conv);
          // Tüm identifier'ları da bu gruba bağla
          for (const id of identifiers) {
            const key = `${id.type}:${id.value}`;
            customerGroups.set(key, foundGroup);
          }
          processedConvIds.add(conv.id);
          continue;
        }
      }
      
      // Yeni grup oluştur
      const newGroup = {
        identifiers,
        conversations: [conv],
      };
      
      for (const id of identifiers) {
        const key = `${id.type}:${id.value}`;
        customerGroups.set(key, newGroup);
      }
      
      processedConvIds.add(conv.id);
    }
    
    // Unique grupları bul
    const uniqueGroups = [];
    const seenGroupIds = new Set();
    
    for (const group of customerGroups.values()) {
      // Her grup için unique bir ID oluştur (ilk conversation'ın ID'si)
      const groupId = group.conversations[0].id;
      if (seenGroupIds.has(groupId)) continue;
      seenGroupIds.add(groupId);
      
      if (group.conversations.length > 1) {
        // Bu bir duplicate grup
        uniqueGroups.push(group);
      }
    }
    
    // Sonuçları hazırla
    const duplicateGroups = uniqueGroups.map(group => {
      // En eski conversation'ı primary olarak seç
      const sorted = [...group.conversations].sort((a, b) => 
        getConversationDate(a) - getConversationDate(b)
      );
      
      const primary = sorted[0];
      const duplicates = sorted.slice(1);
      
      // Kanalları topla
      const channels = new Set();
      sorted.forEach(c => {
        if (c.channel) channels.add(c.channel);
        if (c.channels) c.channels.forEach(ch => channels.add(ch));
      });
      
      return {
        primaryId: primary.id,
        primarySubject: primary.subject,
        primaryChannel: primary.channel,
        primaryDate: getConversationDate(primary),
        customerName: primary.sender?.name || 'İsimsiz',
        customerEmail: primary.sender?.email || '-',
        customerPhone: primary.sender?.phone || '-',
        duplicateCount: duplicates.length,
        duplicateIds: duplicates.map(d => d.id),
        duplicates: duplicates.map(d => ({
          id: d.id,
          subject: d.subject,
          channel: d.channel,
          date: getConversationDate(d),
        })),
        totalChannels: Array.from(channels),
      };
    });
    
    // Conversation'ları olmayan/tanımlayıcısı olmayan conversation sayısı
    const orphanCount = conversations.length - processedConvIds.size;
    
    const result = {
      success: true,
      totalConversations: conversations.length,
      uniqueCustomers: uniqueGroups.length + (conversations.length - Array.from(new Set([...uniqueGroups.flatMap(g => g.conversations.map(c => c.id))])).length),
      duplicateGroups: duplicateGroups.length,
      totalDuplicateConversations: duplicateGroups.reduce((sum, g) => sum + g.duplicateCount, 0),
      orphanConversations: orphanCount,
      groups: duplicateGroups,
    };
    
    console.log('[Migration] Analysis complete:', {
      total: result.totalConversations,
      duplicateGroups: result.duplicateGroups,
      totalDuplicates: result.totalDuplicateConversations,
    });
    
    return result;
  } catch (error) {
    console.error('[Migration] Error analyzing duplicates:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// =============================================================================
// MERGE FUNCTIONS
// =============================================================================

/**
 * Belirli bir duplicate grubunu birleştir
 * @param {string} primaryId - Primary conversation ID
 * @param {Array<string>} duplicateIds - Silinecek/birleştirilecek conversation ID'leri
 * @param {Object} options - Seçenekler
 * @returns {Object} Merge sonucu
 */
export const mergeConversationGroup = async (primaryId, duplicateIds, options = {}) => {
  const { 
    dryRun = false, 
    createdBy = null,
    deleteDuplicates = true, // false ise archive yapar
  } = options;
  
  try {
    console.log(`[Migration] Merging group: primary=${primaryId}, duplicates=${duplicateIds.length}, dryRun=${dryRun}`);
    
    // Primary conversation'ı al (Admin SDK)
    const primaryDoc = await adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(primaryId).get();
    if (!primaryDoc.exists) {
      throw new Error(`Primary conversation not found: ${primaryId}`);
    }
    const primaryData = primaryDoc.data();
    
    // Duplicate conversation'ları al (Admin SDK)
    const duplicateConvs = [];
    for (const dupId of duplicateIds) {
      const dupDoc = await adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(dupId).get();
      if (dupDoc.exists) {
        duplicateConvs.push({
          id: dupDoc.id,
          ...dupDoc.data(),
        });
      }
    }
    
    if (duplicateConvs.length === 0) {
      return {
        success: true,
        message: 'No duplicates to merge',
        movedMessages: 0,
        deletedConversations: 0,
      };
    }
    
    // Duplicate conversation'ların mesajlarını al (Admin SDK)
    const allMessages = [];
    for (const dupConv of duplicateConvs) {
      const messagesSnapshot = await adminDb
        .collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', dupConv.id)
        .get();
      
      messagesSnapshot.forEach(msgDoc => {
        allMessages.push({
          id: msgDoc.id,
          conversationId: dupConv.id,
          originalChannel: dupConv.channel, // Orijinal kanalı sakla
          ...msgDoc.data(),
        });
      });
    }
    
    console.log(`[Migration] Found ${allMessages.length} messages to move from ${duplicateConvs.length} duplicates`);
    
    // DRY RUN ise burada dur
    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        primaryId,
        duplicateCount: duplicateConvs.length,
        messagesToMove: allMessages.length,
        duplicates: duplicateConvs.map(d => ({
          id: d.id,
          subject: d.subject,
          channel: d.channel,
        })),
      };
    }
    
    // Gerçek merge işlemi (Admin SDK batch)
    const batch = adminDb.batch();
    let movedMessages = 0;
    
    // 1. Mesajları primary conversation'a taşı
    for (const msg of allMessages) {
      // Yeni mesaj dokümanı oluştur (conversationId değiştir)
      const newMsgRef = adminDb.collection(COLLECTIONS.MESSAGES).doc();
      
      const newMsgData = {
        ...msg,
        conversationId: primaryId,
        // Migration metadata
        migratedFrom: msg.conversationId,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        migratedBy: createdBy,
      };
      
      // ID ve orijinal conversationId'yi kaldır
      delete newMsgData.id;
      delete newMsgData.originalChannel;
      
      batch.set(newMsgRef, newMsgData);
      movedMessages++;
    }
    
    // 2. Primary conversation'ı güncelle
    // Tüm kanalları topla
    const allChannels = new Set();
    if (primaryData.channel) allChannels.add(primaryData.channel);
    if (primaryData.channels) primaryData.channels.forEach(ch => allChannels.add(ch));
    
    for (const dupConv of duplicateConvs) {
      if (dupConv.channel) allChannels.add(dupConv.channel);
      if (dupConv.channels) dupConv.channels.forEach(ch => allChannels.add(ch));
    }
    
    // Message count güncelle
    const currentMessageCount = primaryData.messageCount || 0;
    
    const primaryUpdateData = {
      channels: Array.from(allChannels),
      messageCount: currentMessageCount + movedMessages,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Migration metadata
      mergedConversations: duplicateIds,
      lastMergeAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMergeBy: createdBy,
    };
    
    batch.update(adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(primaryId), primaryUpdateData);
    
    // 3. Duplicate conversation'ları sil veya arşivle
    for (const dupConv of duplicateConvs) {
      if (deleteDuplicates) {
        // Sil
        batch.delete(adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(dupConv.id));
        
        // Eski mesajları da sil
        const oldMsgSnapshot = await adminDb
          .collection(COLLECTIONS.MESSAGES)
          .where('conversationId', '==', dupConv.id)
          .get();
        oldMsgSnapshot.forEach(msgDoc => {
          batch.delete(adminDb.collection(COLLECTIONS.MESSAGES).doc(msgDoc.id));
        });
      } else {
        // Arşivle
        batch.update(adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(dupConv.id), {
          status: CONVERSATION_STATUS.CLOSED,
          archived: true,
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          mergedInto: primaryId,
        });
      }
    }
    
    // Batch commit
    await batch.commit();
    
    console.log(`[Migration] Merge complete: moved ${movedMessages} messages, ${deleteDuplicates ? 'deleted' : 'archived'} ${duplicateConvs.length} conversations`);
    
    return {
      success: true,
      primaryId,
      movedMessages,
      deletedConversations: deleteDuplicates ? duplicateConvs.length : 0,
      archivedConversations: deleteDuplicates ? 0 : duplicateConvs.length,
    };
  } catch (error) {
    console.error('[Migration] Error merging group:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Tüm duplicate grupları birleştir
 * @param {Object} options - Seçenekler
 * @returns {Object} Migration sonucu
 */
export const mergeAllDuplicates = async (options = {}) => {
  const {
    dryRun = true, // Varsayılan olarak dry run
    createdBy = null,
    deleteDuplicates = true,
    maxGroups = null, // Test için sınırlı sayıda grup
  } = options;
  
  try {
    console.log('[Migration] Starting merge all duplicates...', { dryRun, deleteDuplicates, maxGroups });
    
    // Önce analiz yap
    const analysis = await analyzeDuplicateConversations();
    
    if (!analysis.success) {
      return {
        success: false,
        error: 'Analysis failed: ' + analysis.error,
      };
    }
    
    if (analysis.duplicateGroups === 0) {
      return {
        success: true,
        message: 'No duplicate conversations found',
        mergedGroups: 0,
        movedMessages: 0,
        deletedConversations: 0,
      };
    }
    
    // Grupları işle
    let groups = analysis.groups;
    if (maxGroups) {
      groups = groups.slice(0, maxGroups);
    }
    
    const results = {
      success: true,
      dryRun,
      totalGroups: analysis.duplicateGroups,
      processedGroups: groups.length,
      mergedGroups: 0,
      movedMessages: 0,
      deletedConversations: 0,
      archivedConversations: 0,
      errors: [],
      details: [],
    };
    
    for (const group of groups) {
      try {
        const mergeResult = await mergeConversationGroup(
          group.primaryId,
          group.duplicateIds,
          { dryRun, createdBy, deleteDuplicates }
        );
        
        if (mergeResult.success) {
          results.mergedGroups++;
          results.movedMessages += mergeResult.movedMessages || mergeResult.messagesToMove || 0;
          results.deletedConversations += mergeResult.deletedConversations || 0;
          results.archivedConversations += mergeResult.archivedConversations || 0;
          
          results.details.push({
            primaryId: group.primaryId,
            customerName: group.customerName,
            duplicateCount: group.duplicateCount,
            ...mergeResult,
          });
        } else {
          results.errors.push({
            primaryId: group.primaryId,
            error: mergeResult.error,
          });
        }
      } catch (error) {
        results.errors.push({
          primaryId: group.primaryId,
          error: error.message,
        });
      }
    }
    
    console.log('[Migration] Merge all complete:', {
      mergedGroups: results.mergedGroups,
      movedMessages: results.movedMessages,
      deletedConversations: results.deletedConversations,
      errors: results.errors.length,
    });
    
    return results;
  } catch (error) {
    console.error('[Migration] Error in merge all:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Belirli bir müşterinin tüm conversation'larını bul
 * @param {string} email - Email adresi
 * @param {string} phone - Telefon numarası
 * @returns {Array} Conversations
 */
export const findCustomerConversations = async (email, phone) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    
    if (!normalizedEmail && !normalizedPhone) {
      return [];
    }
    
    const conversationsSnapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS).get();
    const matchingConversations = [];
    
    conversationsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Email eşleşmesi
      if (normalizedEmail) {
        const convEmail = normalizeEmail(data.sender?.email);
        if (convEmail === normalizedEmail) {
          matchingConversations.push({ id: doc.id, ...data });
          return;
        }
      }
      
      // Telefon eşleşmesi
      if (normalizedPhone) {
        const convPhone = normalizePhone(data.sender?.phone);
        const waPhone = normalizePhone(data.channelMetadata?.waId);
        
        if (convPhone === normalizedPhone || waPhone === normalizedPhone) {
          matchingConversations.push({ id: doc.id, ...data });
        }
      }
    });
    
    return matchingConversations;
  } catch (error) {
    console.error('[Migration] Error finding customer conversations:', error);
    return [];
  }
};

/**
 * Migration istatistiklerini al
 */
export const getMigrationStats = async () => {
  try {
    const analysis = await analyzeDuplicateConversations();
    
    if (!analysis.success) {
      return {
        success: false,
        error: analysis.error,
      };
    }
    
    // Kanal bazlı dağılım
    const channelDistribution = {};
    analysis.groups.forEach(group => {
      group.totalChannels.forEach(channel => {
        channelDistribution[channel] = (channelDistribution[channel] || 0) + 1;
      });
    });
    
    return {
      success: true,
      totalConversations: analysis.totalConversations,
      duplicateGroups: analysis.duplicateGroups,
      totalDuplicateConversations: analysis.totalDuplicateConversations,
      estimatedSavings: analysis.totalDuplicateConversations, // Silinecek conversation sayısı
      channelDistribution,
      // En büyük duplicate grupları
      topDuplicateGroups: analysis.groups
        .sort((a, b) => b.duplicateCount - a.duplicateCount)
        .slice(0, 10)
        .map(g => ({
          customerName: g.customerName,
          customerEmail: g.customerEmail,
          customerPhone: g.customerPhone,
          duplicateCount: g.duplicateCount,
          channels: g.totalChannels,
        })),
    };
  } catch (error) {
    console.error('[Migration] Error getting stats:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
