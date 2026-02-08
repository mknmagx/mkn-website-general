/**
 * Telefon Numarası Normalizasyon Migration Service
 * 
 * Bu servis, mevcut veritabanındaki tüm telefon numaralarını
 * standart formata çevirir.
 * 
 * Hedef Koleksiyonlar:
 * - crm_customers: phone, whatsappNumber
 * - crm_conversations: sender.phone, customer.phone, channelMetadata.waId
 * - companies: phone, whatsappNumber
 * 
 * ⚠️ Bu servis Firebase Admin SDK kullanır (server-side only)
 */

import { adminDb } from "../../firebase-admin";
import admin from "firebase-admin";
import { COLLECTIONS } from "./schema";
import { normalizePhone, formatPhoneDisplay, analyzePhone } from "../../utils/phone-utils";

// =============================================================================
// PREVIEW FUNCTIONS
// =============================================================================

/**
 * Telefon normalizasyon önizlemesi
 * Değişiklik yapmadan, hangi kayıtların güncelleneceğini raporlar
 */
export const previewPhoneNormalization = async () => {
  console.log('[Phone Migration] Starting preview...');
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  
  const report = {
    customers: await previewCustomerPhones(),
    conversations: await previewConversationPhones(),
    companies: await previewCompanyPhones(),
    summary: {},
  };
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Özet
  report.summary = {
    totalCustomers: report.customers.total,
    customersNeedingUpdate: report.customers.needsUpdate.length,
    totalConversations: report.conversations.total,
    conversationsNeedingUpdate: report.conversations.needsUpdate.length,
    totalCompanies: report.companies.total,
    companiesNeedingUpdate: report.companies.needsUpdate.length,
    totalNeedingUpdate: 
      report.customers.needsUpdate.length + 
      report.conversations.needsUpdate.length + 
      report.companies.needsUpdate.length,
    duration: `${duration}s`,
  };
  
  // Console'a yazdır
  console.log('\n' + '='.repeat(80));
  console.log('PHONE NORMALIZATION PREVIEW REPORT');
  console.log('='.repeat(80));
  console.log('\n📊 SUMMARY:');
  console.log(`   Customers: ${report.summary.customersNeedingUpdate}/${report.summary.totalCustomers} needs update`);
  console.log(`   Conversations: ${report.summary.conversationsNeedingUpdate}/${report.summary.totalConversations} needs update`);
  console.log(`   Companies: ${report.summary.companiesNeedingUpdate}/${report.summary.totalCompanies} needs update`);
  console.log(`   Total: ${report.summary.totalNeedingUpdate} records need normalization`);
  console.log(`   Duration: ${report.summary.duration}`);
  console.log('='.repeat(80) + '\n');
  
  return report;
};

/**
 * Customer telefon numaralarını önizle
 */
const previewCustomerPhones = async () => {
  const result = {
    total: 0,
    needsUpdate: [],
    alreadyNormalized: [],
    noPhone: [],
    errors: [],
  };
  
  try {
    console.log('[Phone Migration] Analyzing customers...');
    const snapshot = await adminDb.collection(COLLECTIONS.CUSTOMERS).get();
    result.total = snapshot.size;
    
    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        const id = docSnap.id;
        const updates = {};
        let needsUpdate = false;
        
        // phone field
        if (data.phone) {
          const normalized = normalizePhone(data.phone);
          if (normalized !== data.phone) {
            updates.phone = { old: data.phone, new: normalized };
            needsUpdate = true;
          }
        }
        
        // whatsappNumber field
        if (data.whatsappNumber) {
          const normalized = normalizePhone(data.whatsappNumber);
          if (normalized !== data.whatsappNumber) {
            updates.whatsappNumber = { old: data.whatsappNumber, new: normalized };
            needsUpdate = true;
          }
        }
        
        if (!data.phone && !data.whatsappNumber) {
          result.noPhone.push({ id, name: data.name || data.company });
        } else if (needsUpdate) {
          result.needsUpdate.push({
            id,
            name: data.name || data.company,
            updates,
          });
        } else {
          result.alreadyNormalized.push({ id, name: data.name || data.company });
        }
        
      } catch (error) {
        result.errors.push({ id: docSnap.id, error: error.message });
      }
    }
    
    console.log(`[Phone Migration] Customers analyzed: ${result.needsUpdate.length}/${result.total} need update`);
    
  } catch (error) {
    console.error('[Phone Migration] Error analyzing customers:', error);
    result.errors.push({ error: error.message });
  }
  
  return result;
};

/**
 * Conversation telefon numaralarını önizle
 */
const previewConversationPhones = async () => {
  const result = {
    total: 0,
    needsUpdate: [],
    alreadyNormalized: [],
    noPhone: [],
    errors: [],
  };
  
  try {
    console.log('[Phone Migration] Analyzing conversations...');
    const snapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS).get();
    result.total = snapshot.size;
    
    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        const id = docSnap.id;
        const updates = {};
        let needsUpdate = false;
        let hasPhone = false;
        
        // sender.phone
        if (data.sender?.phone) {
          hasPhone = true;
          const normalized = normalizePhone(data.sender.phone);
          if (normalized !== data.sender.phone) {
            updates['sender.phone'] = { old: data.sender.phone, new: normalized };
            needsUpdate = true;
          }
        }
        
        // customer.phone (embedded)
        if (data.customer?.phone) {
          hasPhone = true;
          const normalized = normalizePhone(data.customer.phone);
          if (normalized !== data.customer.phone) {
            updates['customer.phone'] = { old: data.customer.phone, new: normalized };
            needsUpdate = true;
          }
        }
        
        // channelMetadata.waId
        if (data.channelMetadata?.waId) {
          hasPhone = true;
          const normalized = normalizePhone(data.channelMetadata.waId);
          if (normalized !== data.channelMetadata.waId) {
            updates['channelMetadata.waId'] = { old: data.channelMetadata.waId, new: normalized };
            needsUpdate = true;
          }
        }
        
        // phone field (legacy)
        if (data.phone) {
          hasPhone = true;
          const normalized = normalizePhone(data.phone);
          if (normalized !== data.phone) {
            updates.phone = { old: data.phone, new: normalized };
            needsUpdate = true;
          }
        }
        
        if (!hasPhone) {
          result.noPhone.push({ id, name: data.name || data.subject });
        } else if (needsUpdate) {
          result.needsUpdate.push({
            id,
            name: data.name || data.subject,
            channel: data.channel,
            updates,
          });
        } else {
          result.alreadyNormalized.push({ id, name: data.name || data.subject });
        }
        
      } catch (error) {
        result.errors.push({ id: docSnap.id, error: error.message });
      }
    }
    
    console.log(`[Phone Migration] Conversations analyzed: ${result.needsUpdate.length}/${result.total} need update`);
    
  } catch (error) {
    console.error('[Phone Migration] Error analyzing conversations:', error);
    result.errors.push({ error: error.message });
  }
  
  return result;
};

/**
 * Company telefon numaralarını önizle
 */
const previewCompanyPhones = async () => {
  const result = {
    total: 0,
    needsUpdate: [],
    alreadyNormalized: [],
    noPhone: [],
    errors: [],
  };
  
  try {
    console.log('[Phone Migration] Analyzing companies...');
    const snapshot = await adminDb.collection('companies').get();
    result.total = snapshot.size;
    
    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        const id = docSnap.id;
        const updates = {};
        let needsUpdate = false;
        let hasPhone = false;
        
        // phone field
        if (data.phone) {
          hasPhone = true;
          const normalized = normalizePhone(data.phone);
          if (normalized !== data.phone) {
            updates.phone = { old: data.phone, new: normalized };
            needsUpdate = true;
          }
        }
        
        // whatsappNumber field
        if (data.whatsappNumber) {
          hasPhone = true;
          const normalized = normalizePhone(data.whatsappNumber);
          if (normalized !== data.whatsappNumber) {
            updates.whatsappNumber = { old: data.whatsappNumber, new: normalized };
            needsUpdate = true;
          }
        }
        
        // Contacts array içindeki telefon numaraları
        if (data.contacts && Array.isArray(data.contacts)) {
          data.contacts.forEach((contact, idx) => {
            if (contact.phone) {
              hasPhone = true;
              const normalized = normalizePhone(contact.phone);
              if (normalized !== contact.phone) {
                updates[`contacts[${idx}].phone`] = { old: contact.phone, new: normalized };
                needsUpdate = true;
              }
            }
            if (contact.whatsappNumber) {
              hasPhone = true;
              const normalized = normalizePhone(contact.whatsappNumber);
              if (normalized !== contact.whatsappNumber) {
                updates[`contacts[${idx}].whatsappNumber`] = { old: contact.whatsappNumber, new: normalized };
                needsUpdate = true;
              }
            }
          });
        }
        
        if (!hasPhone) {
          result.noPhone.push({ id, name: data.name || data.companyName });
        } else if (needsUpdate) {
          result.needsUpdate.push({
            id,
            name: data.name || data.companyName,
            updates,
          });
        } else {
          result.alreadyNormalized.push({ id, name: data.name || data.companyName });
        }
        
      } catch (error) {
        result.errors.push({ id: docSnap.id, error: error.message });
      }
    }
    
    console.log(`[Phone Migration] Companies analyzed: ${result.needsUpdate.length}/${result.total} need update`);
    
  } catch (error) {
    console.error('[Phone Migration] Error analyzing companies:', error);
    result.errors.push({ error: error.message });
  }
  
  return result;
};

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

/**
 * Telefon numaralarını normalize et ve güncelle
 * 
 * @param {Object} options
 * @param {boolean} options.dryRun - true ise değişiklik yapmaz
 * @param {number} options.limit - Maksimum güncelleme sayısı
 * @param {string[]} options.collections - Güncellenecek koleksiyonlar ['customers', 'conversations', 'companies']
 */
export const migratePhoneNumbers = async (options = {}) => {
  const { 
    dryRun = false, 
    limit = 1000,
    collections = ['customers', 'conversations', 'companies']
  } = options;
  
  console.log('[Phone Migration] Starting migration...');
  console.log(`[Phone Migration] Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`[Phone Migration] Collections: ${collections.join(', ')}`);
  console.log(`[Phone Migration] Limit: ${limit}`);
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  
  const results = {
    customers: { updated: 0, skipped: 0, errors: [] },
    conversations: { updated: 0, skipped: 0, errors: [] },
    companies: { updated: 0, skipped: 0, errors: [] },
    summary: {},
  };
  
  let totalUpdated = 0;
  
  // Customers
  if (collections.includes('customers') && totalUpdated < limit) {
    const customerResults = await migrateCustomerPhones({ dryRun, limit: limit - totalUpdated });
    results.customers = customerResults;
    totalUpdated += customerResults.updated;
  }
  
  // Conversations
  if (collections.includes('conversations') && totalUpdated < limit) {
    const convResults = await migrateConversationPhones({ dryRun, limit: limit - totalUpdated });
    results.conversations = convResults;
    totalUpdated += convResults.updated;
  }
  
  // Companies
  if (collections.includes('companies') && totalUpdated < limit) {
    const companyResults = await migrateCompanyPhones({ dryRun, limit: limit - totalUpdated });
    results.companies = companyResults;
    totalUpdated += companyResults.updated;
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  results.summary = {
    mode: dryRun ? 'DRY RUN' : 'LIVE',
    totalUpdated,
    totalSkipped: results.customers.skipped + results.conversations.skipped + results.companies.skipped,
    totalErrors: results.customers.errors.length + results.conversations.errors.length + results.companies.errors.length,
    duration: `${duration}s`,
  };
  
  // Final rapor
  console.log('\n' + '='.repeat(80));
  console.log('PHONE MIGRATION COMPLETED');
  console.log('='.repeat(80));
  console.log(`\n📊 RESULTS:`);
  console.log(`   Mode: ${results.summary.mode}`);
  console.log(`   Customers Updated: ${results.customers.updated}`);
  console.log(`   Conversations Updated: ${results.conversations.updated}`);
  console.log(`   Companies Updated: ${results.companies.updated}`);
  console.log(`   Total Updated: ${results.summary.totalUpdated}`);
  console.log(`   Total Skipped: ${results.summary.totalSkipped}`);
  console.log(`   Total Errors: ${results.summary.totalErrors}`);
  console.log(`   Duration: ${results.summary.duration}`);
  console.log('='.repeat(80) + '\n');
  
  return results;
};

/**
 * Customer telefon numaralarını normalize et
 */
const migrateCustomerPhones = async ({ dryRun, limit }) => {
  const result = { updated: 0, skipped: 0, errors: [], updatedRecords: [] };
  
  try {
    console.log('[Phone Migration] Processing customers...');
    const snapshot = await adminDb.collection(COLLECTIONS.CUSTOMERS).get();
    
    for (const docSnap of snapshot.docs) {
      if (result.updated >= limit) break;
      
      try {
        const data = docSnap.data();
        const id = docSnap.id;
        const updateData = {};
        let needsUpdate = false;
        
        // phone field
        if (data.phone) {
          const normalized = normalizePhone(data.phone);
          if (normalized !== data.phone) {
            updateData.phone = normalized;
            needsUpdate = true;
          }
        }
        
        // whatsappNumber field
        if (data.whatsappNumber) {
          const normalized = normalizePhone(data.whatsappNumber);
          if (normalized !== data.whatsappNumber) {
            updateData.whatsappNumber = normalized;
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          updateData.phoneNormalizedAt = admin.firestore.FieldValue.serverTimestamp();
          
          if (dryRun) {
            console.log(`[Phone Migration] [DRY RUN] Would update customer ${id}:`, updateData);
          } else {
            await adminDb.collection(COLLECTIONS.CUSTOMERS).doc(id).update(updateData);
            console.log(`[Phone Migration] Updated customer ${id}`);
          }
          
          result.updated++;
          result.updatedRecords.push({ id, updates: updateData });
        } else {
          result.skipped++;
        }
        
      } catch (error) {
        console.error(`[Phone Migration] Error updating customer ${docSnap.id}:`, error);
        result.errors.push({ id: docSnap.id, error: error.message });
      }
    }
    
  } catch (error) {
    console.error('[Phone Migration] Error processing customers:', error);
    result.errors.push({ error: error.message });
  }
  
  return result;
};

/**
 * Conversation telefon numaralarını normalize et
 */
const migrateConversationPhones = async ({ dryRun, limit }) => {
  const result = { updated: 0, skipped: 0, errors: [], updatedRecords: [] };
  
  try {
    console.log('[Phone Migration] Processing conversations...');
    const snapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS).get();
    
    for (const docSnap of snapshot.docs) {
      if (result.updated >= limit) break;
      
      try {
        const data = docSnap.data();
        const id = docSnap.id;
        const updateData = {};
        let needsUpdate = false;
        
        // sender.phone
        if (data.sender?.phone) {
          const normalized = normalizePhone(data.sender.phone);
          if (normalized !== data.sender.phone) {
            updateData['sender.phone'] = normalized;
            needsUpdate = true;
          }
        }
        
        // customer.phone (embedded)
        if (data.customer?.phone) {
          const normalized = normalizePhone(data.customer.phone);
          if (normalized !== data.customer.phone) {
            updateData['customer.phone'] = normalized;
            needsUpdate = true;
          }
        }
        
        // channelMetadata.waId
        if (data.channelMetadata?.waId) {
          const normalized = normalizePhone(data.channelMetadata.waId);
          if (normalized !== data.channelMetadata.waId) {
            updateData['channelMetadata.waId'] = normalized;
            needsUpdate = true;
          }
        }
        
        // phone field (legacy)
        if (data.phone) {
          const normalized = normalizePhone(data.phone);
          if (normalized !== data.phone) {
            updateData.phone = normalized;
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          updateData.phoneNormalizedAt = admin.firestore.FieldValue.serverTimestamp();
          
          if (dryRun) {
            console.log(`[Phone Migration] [DRY RUN] Would update conversation ${id}:`, updateData);
          } else {
            await adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(id).update(updateData);
            console.log(`[Phone Migration] Updated conversation ${id}`);
          }
          
          result.updated++;
          result.updatedRecords.push({ id, updates: updateData });
        } else {
          result.skipped++;
        }
        
      } catch (error) {
        console.error(`[Phone Migration] Error updating conversation ${docSnap.id}:`, error);
        result.errors.push({ id: docSnap.id, error: error.message });
      }
    }
    
  } catch (error) {
    console.error('[Phone Migration] Error processing conversations:', error);
    result.errors.push({ error: error.message });
  }
  
  return result;
};

/**
 * Company telefon numaralarını normalize et
 */
const migrateCompanyPhones = async ({ dryRun, limit }) => {
  const result = { updated: 0, skipped: 0, errors: [], updatedRecords: [] };
  
  try {
    console.log('[Phone Migration] Processing companies...');
    const snapshot = await adminDb.collection('companies').get();
    
    for (const docSnap of snapshot.docs) {
      if (result.updated >= limit) break;
      
      try {
        const data = docSnap.data();
        const id = docSnap.id;
        const updateData = {};
        let needsUpdate = false;
        
        // phone field
        if (data.phone) {
          const normalized = normalizePhone(data.phone);
          if (normalized !== data.phone) {
            updateData.phone = normalized;
            needsUpdate = true;
          }
        }
        
        // whatsappNumber field
        if (data.whatsappNumber) {
          const normalized = normalizePhone(data.whatsappNumber);
          if (normalized !== data.whatsappNumber) {
            updateData.whatsappNumber = normalized;
            needsUpdate = true;
          }
        }
        
        // Contacts array içindeki telefon numaraları
        if (data.contacts && Array.isArray(data.contacts) && data.contacts.length > 0) {
          const updatedContacts = data.contacts.map(contact => {
            const updatedContact = { ...contact };
            let contactChanged = false;
            
            if (contact.phone) {
              const normalized = normalizePhone(contact.phone);
              if (normalized !== contact.phone) {
                updatedContact.phone = normalized;
                contactChanged = true;
              }
            }
            
            if (contact.whatsappNumber) {
              const normalized = normalizePhone(contact.whatsappNumber);
              if (normalized !== contact.whatsappNumber) {
                updatedContact.whatsappNumber = normalized;
                contactChanged = true;
              }
            }
            
            if (contactChanged) needsUpdate = true;
            return updatedContact;
          });
          
          if (needsUpdate) {
            updateData.contacts = updatedContacts;
          }
        }
        
        if (needsUpdate) {
          updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
          updateData.phoneNormalizedAt = admin.firestore.FieldValue.serverTimestamp();
          
          if (dryRun) {
            console.log(`[Phone Migration] [DRY RUN] Would update company ${id}:`, updateData);
          } else {
            await adminDb.collection('companies').doc(id).update(updateData);
            console.log(`[Phone Migration] Updated company ${id}`);
          }
          
          result.updated++;
          result.updatedRecords.push({ id, updates: updateData });
        } else {
          result.skipped++;
        }
        
      } catch (error) {
        console.error(`[Phone Migration] Error updating company ${docSnap.id}:`, error);
        result.errors.push({ id: docSnap.id, error: error.message });
      }
    }
    
  } catch (error) {
    console.error('[Phone Migration] Error processing companies:', error);
    result.errors.push({ error: error.message });
  }
  
  return result;
};

// =============================================================================
// EXPORT
// =============================================================================

export default {
  previewPhoneNormalization,
  migratePhoneNumbers,
};
