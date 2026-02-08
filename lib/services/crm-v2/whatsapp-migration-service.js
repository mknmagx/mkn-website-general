/**
 * WhatsApp-CRM v2 Migration Service
 * 
 * Bu servis, eski CRM conversation'larını WhatsApp metadata yapısına
 * göre günceller ve eksik field'ları doldurur.
 * 
 * Kullanım:
 * 1. migrateWhatsAppConversations() - Tüm eski conversation'ları günceller
 * 2. previewMigration() - Sadece rapor çıkarır, değişiklik yapmaz
 * 
 * ⚠️ Bu servis Firebase Admin SDK kullanır (server-side only)
 */

import { adminDb } from "../../firebase-admin";
import admin from "firebase-admin";
import { COLLECTIONS, CHANNEL } from "./schema";
import { normalizePhone, formatPhoneDisplay } from "../../utils/phone-utils";

// =============================================================================
// HELPER FUNCTIONS - Merkezi phone-utils modülü kullanılıyor
// =============================================================================

// =============================================================================
// MAPPING FUNCTIONS
// =============================================================================

/**
 * WhatsApp conversation'ları telefon numaralarına göre map'le
 * @returns {Map} normalized phone -> WhatsApp conversation mapping
 */
const buildWhatsAppPhoneMap = async () => {
  const phoneMap = new Map();
  
  try {
    console.log('[Migration] Fetching WhatsApp conversations from Firestore...');
    const waConversationsSnapshot = await adminDb.collection('whatsapp_conversations').get();
    
    console.log(`[Migration] Found ${waConversationsSnapshot.size} WhatsApp conversations`);
    
    waConversationsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const waId = data.waId || data.displayPhoneNumber;
      
      if (waId) {
        const normalized = normalizePhone(waId);
        if (normalized.length >= 10) {
          phoneMap.set(normalized, {
            id: docSnap.id,
            waId: waId,
            profileName: data.profileName || null,
            phoneNumberId: data.phoneNumberId || null,
            serviceWindowExpiry: data.serviceWindowExpiry || null,
            isWithinWindow: data.isWithinWindow || false,
            status: data.status || null,
            unreadCount: data.unreadCount || 0,
            lastMessageAt: data.lastMessageAt || null,
            lastMessagePreview: data.lastMessagePreview || null,
            createdAt: data.createdAt || null,
          });
        }
      }
    });
    
    console.log(`[Migration] Built phone map with ${phoneMap.size} entries`);
  } catch (error) {
    console.error('[Migration] Error building WhatsApp phone map:', error);
  }
  
  return phoneMap;
};

/**
 * CRM conversation'larını analiz et ve WhatsApp eşleştir
 */
const analyzeCrmConversations = async (whatsappPhoneMap) => {
  const results = {
    total: 0,
    needsUpdate: [],
    alreadyComplete: [],
    noWhatsAppMatch: [],
    whatsappChannel: [],
    errors: [],
  };
  
  try {
    console.log('[Migration] Analyzing CRM conversations...');
    const crmConversationsSnapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS).get();
    
    results.total = crmConversationsSnapshot.size;
    console.log(`[Migration] Found ${results.total} CRM conversations`);
    
    for (const docSnap of crmConversationsSnapshot.docs) {
      try {
        const data = docSnap.data();
        const convId = docSnap.id;
        
        // Telefon numarası bul (sender.phone, customer.phone, channelMetadata.waId, phone field)
        let phoneNumber = null;
        let phoneSource = null;
        
        if (data.sender?.phone) {
          phoneNumber = data.sender.phone;
          phoneSource = 'sender.phone';
        } else if (data.customer?.phone) {
          phoneNumber = data.customer.phone;
          phoneSource = 'customer.phone';
        } else if (data.channelMetadata?.waId) {
          phoneNumber = data.channelMetadata.waId;
          phoneSource = 'channelMetadata.waId';
        } else if (data.phone) {
          phoneNumber = data.phone;
          phoneSource = 'phone';
        }
        
        if (!phoneNumber) {
          results.noWhatsAppMatch.push({
            id: convId,
            channel: data.channel,
            name: data.name,
            reason: 'Telefon numarası bulunamadı',
          });
          continue;
        }
        
        const normalizedPhone = normalizePhone(phoneNumber);
        
        if (normalizedPhone.length < 10) {
          results.noWhatsAppMatch.push({
            id: convId,
            channel: data.channel,
            name: data.name,
            phone: phoneNumber,
            reason: 'Geçersiz telefon numarası (çok kısa)',
          });
          continue;
        }
        
        // WhatsApp eşleşmesi var mı?
        const whatsappData = whatsappPhoneMap.get(normalizedPhone);
        
        if (!whatsappData) {
          results.noWhatsAppMatch.push({
            id: convId,
            channel: data.channel,
            name: data.name,
            phone: phoneNumber,
            normalizedPhone: normalizedPhone,
            reason: 'WhatsApp conversation bulunamadı',
          });
          continue;
        }
        
        // Channel = whatsapp ise özel kontrol (bu zaten WhatsApp conversation)
        if (data.channel === CHANNEL.WHATSAPP) {
          // Metadata eksik mi kontrol et
          const hasMetadata = data.channelMetadata?.waId && 
                             data.channelMetadata?.whatsappConversationId;
          
          if (hasMetadata) {
            results.alreadyComplete.push({
              id: convId,
              channel: data.channel,
              name: data.name,
              phone: phoneNumber,
              waId: data.channelMetadata.waId,
              whatsappConversationId: data.channelMetadata.whatsappConversationId,
            });
          } else {
            results.needsUpdate.push({
              id: convId,
              channel: data.channel,
              name: data.name,
              phone: phoneNumber,
              phoneSource: phoneSource,
              normalizedPhone: normalizedPhone,
              whatsappData: whatsappData,
              missingFields: {
                waId: !data.channelMetadata?.waId,
                whatsappConversationId: !data.channelMetadata?.whatsappConversationId,
                profileName: !data.channelMetadata?.profileName,
                serviceWindowExpiry: !data.channelMetadata?.serviceWindowExpiry,
              },
              currentMetadata: data.channelMetadata || {},
            });
          }
          results.whatsappChannel.push(convId);
          continue;
        }
        
        // Diğer channel'lar (quote_form, contact_form, vb.)
        // WhatsApp metadata'sı var mı?
        const hasWhatsAppMetadata = data.channelMetadata?.waId || 
                                   data.channelMetadata?.whatsappConversationId;
        
        if (hasWhatsAppMetadata) {
          // Metadata var ama tam mı?
          const hasCompleteMetadata = data.channelMetadata?.waId && 
                                     data.channelMetadata?.whatsappConversationId &&
                                     data.channelMetadata?.profileName;
          
          if (hasCompleteMetadata) {
            results.alreadyComplete.push({
              id: convId,
              channel: data.channel,
              name: data.name,
              phone: phoneNumber,
              waId: data.channelMetadata.waId,
              whatsappConversationId: data.channelMetadata.whatsappConversationId,
            });
          } else {
            results.needsUpdate.push({
              id: convId,
              channel: data.channel,
              name: data.name,
              phone: phoneNumber,
              phoneSource: phoneSource,
              normalizedPhone: normalizedPhone,
              whatsappData: whatsappData,
              missingFields: {
                waId: !data.channelMetadata?.waId,
                whatsappConversationId: !data.channelMetadata?.whatsappConversationId,
                profileName: !data.channelMetadata?.profileName,
                serviceWindowExpiry: !data.channelMetadata?.serviceWindowExpiry,
              },
              currentMetadata: data.channelMetadata || {},
            });
          }
        } else {
          // WhatsApp metadata hiç yok - ekle
          results.needsUpdate.push({
            id: convId,
            channel: data.channel,
            name: data.name,
            phone: phoneNumber,
            phoneSource: phoneSource,
            normalizedPhone: normalizedPhone,
            whatsappData: whatsappData,
            missingFields: {
              waId: true,
              whatsappConversationId: true,
              profileName: true,
              serviceWindowExpiry: true,
              isWithinWindow: true,
            },
            currentMetadata: data.channelMetadata || {},
          });
        }
        
      } catch (error) {
        console.error(`[Migration] Error analyzing conversation ${docSnap.id}:`, error);
        results.errors.push({
          id: docSnap.id,
          error: error.message,
        });
      }
    }
    
  } catch (error) {
    console.error('[Migration] Error analyzing CRM conversations:', error);
    results.errors.push({ error: error.message });
  }
  
  return results;
};

// =============================================================================
// PREVIEW FUNCTION
// =============================================================================

/**
 * Migration önizlemesi - değişiklik yapmaz, sadece rapor oluşturur
 */
export const previewMigration = async () => {
  console.log('[Migration Preview] Starting...');
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  
  // 1. WhatsApp conversation'larını al ve map'le
  const whatsappPhoneMap = await buildWhatsAppPhoneMap();
  
  // 2. CRM conversation'larını analiz et
  const analysis = await analyzeCrmConversations(whatsappPhoneMap);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Rapor oluştur
  const report = {
    summary: {
      totalCrmConversations: analysis.total,
      needsUpdate: analysis.needsUpdate.length,
      alreadyComplete: analysis.alreadyComplete.length,
      noWhatsAppMatch: analysis.noWhatsAppMatch.length,
      whatsappChannelConversations: analysis.whatsappChannel.length,
      errors: analysis.errors.length,
      duration: `${duration}s`,
    },
    details: {
      conversationsNeedingUpdate: analysis.needsUpdate,
      conversationsAlreadyComplete: analysis.alreadyComplete,
      conversationsWithoutWhatsApp: analysis.noWhatsAppMatch,
      errors: analysis.errors,
    },
  };
  
  // Console'a yazdır
  console.log('\n' + '='.repeat(80));
  console.log('MIGRATION PREVIEW REPORT');
  console.log('='.repeat(80));
  console.log('\n📊 SUMMARY:');
  console.log(`   Total CRM Conversations: ${report.summary.totalCrmConversations}`);
  console.log(`   ✅ Already Complete: ${report.summary.alreadyComplete}`);
  console.log(`   🔄 Needs Update: ${report.summary.needsUpdate}`);
  console.log(`   ❌ No WhatsApp Match: ${report.summary.noWhatsAppMatch}`);
  console.log(`   📱 WhatsApp Channel: ${report.summary.whatsappChannelConversations}`);
  console.log(`   ⚠️  Errors: ${report.summary.errors}`);
  console.log(`   ⏱️  Duration: ${report.summary.duration}`);
  
  if (analysis.needsUpdate.length > 0) {
    console.log('\n🔄 CONVERSATIONS NEEDING UPDATE:');
    analysis.needsUpdate.slice(0, 10).forEach((conv, idx) => {
      console.log(`\n   ${idx + 1}. ${conv.id}`);
      console.log(`      Channel: ${conv.channel}`);
      console.log(`      Name: ${conv.name}`);
      console.log(`      Phone: ${conv.phone} (source: ${conv.phoneSource})`);
      console.log(`      WhatsApp ID: ${conv.whatsappData.id}`);
      console.log(`      Missing Fields:`, Object.keys(conv.missingFields).filter(k => conv.missingFields[k]).join(', '));
    });
    if (analysis.needsUpdate.length > 10) {
      console.log(`\n   ... and ${analysis.needsUpdate.length - 10} more`);
    }
  }
  
  if (analysis.noWhatsAppMatch.length > 0) {
    console.log('\n❌ CONVERSATIONS WITHOUT WHATSAPP MATCH:');
    analysis.noWhatsAppMatch.slice(0, 10).forEach((conv, idx) => {
      console.log(`\n   ${idx + 1}. ${conv.id}`);
      console.log(`      Channel: ${conv.channel}`);
      console.log(`      Name: ${conv.name}`);
      console.log(`      Reason: ${conv.reason}`);
    });
    if (analysis.noWhatsAppMatch.length > 10) {
      console.log(`\n   ... and ${analysis.noWhatsAppMatch.length - 10} more`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('[Migration Preview] Complete!');
  console.log('='.repeat(80) + '\n');
  
  return report;
};

// =============================================================================
// MIGRATION FUNCTION
// =============================================================================

/**
 * WhatsApp-CRM conversation'larını migrate et
 * Eksik metadata field'larını doldurur ve günceller
 * 
 * @param {Object} options - Migration seçenekleri
 * @param {boolean} options.dryRun - true ise değişiklik yapmaz, sadece rapor oluşturur
 * @param {number} options.limit - Maksimum güncelleme sayısı (güvenlik için)
 * @returns {Promise<Object>} Migration sonuçları
 */
export const migrateWhatsAppConversations = async (options = {}) => {
  const { dryRun = false, limit = 1000 } = options;
  
  console.log('[Migration] Starting...');
  console.log(`[Migration] Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update database)'}`);
  console.log(`[Migration] Limit: ${limit} conversations`);
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  const results = {
    analyzed: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    updatedConversations: [],
  };
  
  try {
    // 1. WhatsApp conversation'larını al ve map'le
    const whatsappPhoneMap = await buildWhatsAppPhoneMap();
    
    // 2. CRM conversation'larını analiz et
    const analysis = await analyzeCrmConversations(whatsappPhoneMap);
    
    results.analyzed = analysis.total;
    
    // 3. Güncelleme gerekenleri işle
    const conversationsToUpdate = analysis.needsUpdate.slice(0, limit);
    
    console.log(`\n[Migration] Found ${analysis.needsUpdate.length} conversations needing update`);
    console.log(`[Migration] Will process ${conversationsToUpdate.length} conversations (limit: ${limit})`);
    
    for (const conv of conversationsToUpdate) {
      try {
        const updateData = {};
        
        // channelMetadata alanlarını hazırla
        if (conv.missingFields.waId) {
          updateData['channelMetadata.waId'] = conv.whatsappData.waId;
        }
        
        if (conv.missingFields.whatsappConversationId) {
          updateData['channelMetadata.whatsappConversationId'] = conv.whatsappData.id;
        }
        
        if (conv.missingFields.profileName) {
          updateData['channelMetadata.profileName'] = conv.whatsappData.profileName;
        }
        
        if (conv.missingFields.serviceWindowExpiry) {
          updateData['channelMetadata.serviceWindowExpiry'] = conv.whatsappData.serviceWindowExpiry;
          updateData['channelMetadata.isWithinWindow'] = conv.whatsappData.isWithinWindow;
        }
        
        // phoneNumberId her zaman ekle
        if (conv.whatsappData.phoneNumberId) {
          updateData['channelMetadata.phoneNumberId'] = conv.whatsappData.phoneNumberId;
        }
        
        // sourceRef güncelle (eğer WhatsApp channel ise veya sourceRef yoksa)
        if (conv.channel === CHANNEL.WHATSAPP || !conv.currentMetadata.sourceRef) {
          const sourceRefId = `wa_${conv.whatsappData.waId}_${conv.whatsappData.phoneNumberId || 'default'}`;
          updateData['sourceRef'] = {
            type: 'whatsapp',
            id: sourceRefId,
            whatsappConversationId: conv.whatsappData.id,
          };
        }
        
        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        
        if (dryRun) {
          console.log(`[Migration] [DRY RUN] Would update ${conv.id}:`, updateData);
          results.updated++;
          results.updatedConversations.push({
            id: conv.id,
            channel: conv.channel,
            updateData: updateData,
          });
        } else {
          // Gerçek güncelleme
          await adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conv.id).update(updateData);
          console.log(`[Migration] Updated ${conv.id} (channel: ${conv.channel})`);
          results.updated++;
          results.updatedConversations.push({
            id: conv.id,
            channel: conv.channel,
            updateData: updateData,
          });
        }
        
      } catch (error) {
        console.error(`[Migration] Error updating ${conv.id}:`, error);
        results.errors.push({
          id: conv.id,
          error: error.message,
        });
      }
    }
    
    // Atlandı sayısı
    results.skipped = analysis.alreadyComplete.length + analysis.noWhatsAppMatch.length;
    
  } catch (error) {
    console.error('[Migration] Fatal error:', error);
    results.errors.push({ error: error.message });
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Final rapor
  console.log('\n' + '='.repeat(80));
  console.log('MIGRATION COMPLETED');
  console.log('='.repeat(80));
  console.log(`\n📊 RESULTS:`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Analyzed: ${results.analyzed}`);
  console.log(`   Updated: ${results.updated}`);
  console.log(`   Skipped: ${results.skipped}`);
  console.log(`   Errors: ${results.errors.length}`);
  console.log(`   Duration: ${duration}s`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    results.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.id || 'Unknown'}: ${err.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  return {
    success: results.errors.length === 0,
    analyzed: results.analyzed,
    updated: results.updated,
    skipped: results.skipped,
    errors: results.errors,
    updatedConversations: results.updatedConversations,
    duration: `${duration}s`,
  };
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Belirli bir conversation ID için WhatsApp metadata'yı güncelle
 */
export const updateConversationWhatsAppMetadata = async (conversationId, whatsappConversationId) => {
  try {
    console.log(`[Migration] Updating conversation ${conversationId} with WhatsApp ID ${whatsappConversationId}`);
    
    // WhatsApp conversation'ı bul
    const waConvDoc = await adminDb.collection('whatsapp_conversations').doc(whatsappConversationId).get();
    
    if (!waConvDoc.exists) {
      throw new Error('WhatsApp conversation not found');
    }
    
    const waData = waConvDoc.data();
    
    const updateData = {
      'channelMetadata.waId': waData.waId || null,
      'channelMetadata.whatsappConversationId': whatsappConversationId,
      'channelMetadata.profileName': waData.profileName || null,
      'channelMetadata.phoneNumberId': waData.phoneNumberId || null,
      'channelMetadata.serviceWindowExpiry': waData.serviceWindowExpiry || null,
      'channelMetadata.isWithinWindow': waData.isWithinWindow || false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId).update(updateData);
    
    console.log(`[Migration] Successfully updated conversation ${conversationId}`);
    return { success: true };
    
  } catch (error) {
    console.error(`[Migration] Error updating conversation ${conversationId}:`, error);
    return { success: false, error: error.message };
  }
};
