/**
 * CRM v2 - Customer Service
 * 
 * Müşteri profili yönetimi servisi.
 * Her müşteri için tek bir profil, farklı kanallardan gelen iletişimler
 * aynı müşteri altında birleştirilebilir.
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
} from "firebase/firestore";
import { db } from "../../firebase";
import { 
  COLLECTIONS, 
  CUSTOMER_TYPE, 
  PRIORITY,
  ACTIVITY_TYPE,
} from "./schema";

// Company Sync Service - Lazy import to avoid circular dependency
let syncService = null;
const getSyncService = async () => {
  if (!syncService) {
    syncService = await import('./company-sync-service.js');
  }
  return syncService;
};

/**
 * Yeni müşteri oluştur
 */
export const createCustomer = async (customerData, options = {}) => {
  const { syncToCompany = true } = options;
  
  try {
    const now = serverTimestamp();
    
    const customer = {
      // Temel bilgiler
      name: customerData.name || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      
      // Şirket bilgileri
      company: {
        name: customerData.companyName || customerData.company?.name || '',
        position: customerData.position || customerData.company?.position || '',
        website: customerData.website || customerData.company?.website || '',
        industry: customerData.industry || customerData.company?.industry || '',
        size: customerData.companySize || customerData.company?.size || '',
        address: customerData.address || customerData.company?.address || '',
        country: customerData.country || customerData.company?.country || 'TR',
        city: customerData.city || customerData.company?.city || '',
      },
      
      // Vergi bilgileri (B2B için)
      taxInfo: {
        taxOffice: customerData.taxOffice || '',
        taxNumber: customerData.taxNumber || '',
        mersisNumber: customerData.mersisNumber || '',
      },
      
      // Alternatif iletişim bilgileri (farklı kanallardan gelen)
      alternativeContacts: customerData.alternativeContacts || [],
      // Örnek: [{ type: 'email', value: 'other@email.com', channel: 'quote_form' }]
      
      // Müşteri sınıflandırma
      type: customerData.type || CUSTOMER_TYPE.LEAD,
      priority: customerData.priority || PRIORITY.NORMAL,
      tags: customerData.tags || [],
      
      // Atama
      assignedTo: customerData.assignedTo || null,
      
      // İstatistikler (otomatik güncellenir)
      stats: {
        totalConversations: 0,
        totalCases: 0,
        openCases: 0,
        wonCases: 0,
        lostCases: 0,
        totalValue: 0,
        lastContactAt: customerData.originalCreatedAt || null,
        // İlk iletişim tarihi - migration'da orijinal tarih kullanılır
        firstContactAt: customerData.originalCreatedAt || now,
      },
      
      // Bağlı eski veriler (varsa mevcut companies ile eşleşme)
      linkedCompanyId: customerData.linkedCompanyId || null,
      
      // Notlar
      notes: customerData.notes || '',
      
      // Meta - Eski sistemden gelen veriler için orijinal tarihi koru
      createdAt: customerData.originalCreatedAt || now,
      updatedAt: now,
      createdBy: customerData.createdBy || null,
      // Migration bilgisi
      migratedAt: customerData.originalCreatedAt ? now : null,
      sourceRef: customerData.sourceRef || null,
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), customer);
    
    // Aktivite kaydı - orijinal tarih varsa onu kullan
    await logActivity({
      type: ACTIVITY_TYPE.CUSTOMER_CREATED,
      customerId: docRef.id,
      performedBy: customerData.createdBy,
      originalCreatedAt: customerData.originalCreatedAt || null,
      metadata: { customerName: customer.name },
    });
    
    // 🔄 Companies Senkronizasyonu - Yeni customer oluşturulduğunda Companies ile senkronize et
    if (syncToCompany && !customerData.linkedCompanyId) {
      try {
        const sync = await getSyncService();
        const syncResult = await sync.onCustomerCreated(docRef.id, customerData.createdBy);
        if (syncResult.success) {
          console.log(`✅ Customer ${docRef.id} Companies ile senkronize edildi (${syncResult.action})`);
        }
      } catch (syncError) {
        // Senkronizasyon hatası ana işlemi etkilemesin
        console.error("Company sync error (non-blocking):", syncError);
      }
    }
    
    return { id: docRef.id, ...customer };
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

/**
 * Müşteri güncelle
 */
export const updateCustomer = async (customerId, updateData, updatedBy = null, options = {}) => {
  const { syncToCompany = true, syncRelatedRecords = true } = options;
  
  try {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    
    // Mevcut müşteri verilerini al (karşılaştırma için)
    const currentDoc = await getDoc(customerRef);
    if (!currentDoc.exists()) {
      throw new Error('Müşteri bulunamadı');
    }
    const currentData = currentDoc.data();
    
    const updates = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };
    
    // Nested objeleri düzgün güncelle
    if (updateData.company) {
      updates.company = { ...currentData.company, ...updateData.company };
    }
    
    if (updateData.taxInfo) {
      updates.taxInfo = { ...currentData.taxInfo, ...updateData.taxInfo };
    }
    
    await updateDoc(customerRef, updates);
    
    // Aktivite kaydı
    await logActivity({
      type: ACTIVITY_TYPE.CUSTOMER_UPDATED,
      customerId: customerId,
      performedBy: updatedBy,
      metadata: { fields: Object.keys(updateData) },
    });
    
    // 🔄 İlişkili kayıtları güncelle (conversations'daki sender bilgileri)
    // Sadece temel iletişim bilgileri değiştiyse güncelle
    if (syncRelatedRecords) {
      const contactFieldsChanged = 
        updateData.name !== undefined ||
        updateData.email !== undefined ||
        updateData.phone !== undefined ||
        (updateData.company && updateData.company.name !== undefined);
      
      if (contactFieldsChanged) {
        try {
          const newSenderData = {
            name: updateData.name ?? currentData.name,
            email: updateData.email ?? currentData.email,
            phone: updateData.phone ?? currentData.phone,
            company: updateData.company?.name ?? currentData.company?.name ?? '',
          };
          
          await syncCustomerToRelatedRecords(customerId, newSenderData, updatedBy);
          console.log(`✅ Customer ${customerId} ilişkili kayıtlar güncellendi`);
        } catch (syncError) {
          // Senkronizasyon hatası ana işlemi etkilemesin
          console.error("Related records sync error (non-blocking):", syncError);
        }
      }
    }
    
    // 🔄 Companies Senkronizasyonu - Customer güncellendiğinde Companies'i de güncelle
    if (syncToCompany) {
      try {
        const sync = await getSyncService();
        const syncResult = await sync.onCustomerUpdated(customerId);
        if (syncResult.success) {
          console.log(`✅ Customer ${customerId} Companies ile senkronize edildi`);
        }
      } catch (syncError) {
        // Senkronizasyon hatası ana işlemi etkilemesin
        console.error("Company sync error (non-blocking):", syncError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

/**
 * Müşterinin ilişkili kayıtlarındaki bilgileri güncelle
 * (Conversations sender bilgileri)
 */
export const syncCustomerToRelatedRecords = async (customerId, senderData, updatedBy = null) => {
  try {
    const batch = writeBatch(db);
    let updatedCount = 0;
    
    // 1. Bu müşteriye ait tüm conversations'ları bul ve sender bilgilerini güncelle
    const conversationsQuery = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('customerId', '==', customerId)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    conversationsSnapshot.forEach((doc) => {
      const convRef = doc.ref;
      batch.update(convRef, {
        'sender.name': senderData.name || '',
        'sender.email': senderData.email || '',
        'sender.phone': senderData.phone || '',
        'sender.company': senderData.company || '',
        updatedAt: serverTimestamp(),
      });
      updatedCount++;
    });
    
    // Batch commit
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`[syncCustomerToRelatedRecords] ${updatedCount} conversation güncellendi`);
    }
    
    return { 
      success: true, 
      updatedConversations: updatedCount,
    };
  } catch (error) {
    console.error("Error syncing customer to related records:", error);
    throw error;
  }
};

/**
 * Müşteri getir
 */
export const getCustomer = async (customerId) => {
  try {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      return null;
    }
    
    return { id: customerDoc.id, ...customerDoc.data() };
  } catch (error) {
    console.error("Error getting customer:", error);
    throw error;
  }
};

/**
 * Tüm müşterileri getir
 */
export const getAllCustomers = async (options = {}) => {
  try {
    const { 
      type = null,
      assignedTo = null,
      tags = [],
      searchTerm = '',
      sortBy = 'updatedAt',
      sortDirection = 'desc',
      limitCount = 0, // 0 = no limit (get all)
      startAfterDoc = null,
      returnLastDoc = false, // Pagination için son dokümanı döndür
    } = options;
    
    let q = collection(db, COLLECTIONS.CUSTOMERS);
    let constraints = [];
    
    if (type) {
      constraints.push(where('type', '==', type));
    }
    
    if (assignedTo) {
      constraints.push(where('assignedTo', '==', assignedTo));
    }
    
    constraints.push(orderBy(sortBy, sortDirection));
    
    // Only apply limit if limitCount > 0
    if (limitCount > 0) {
      constraints.push(limit(limitCount));
    }
    
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }
    
    q = query(q, ...constraints);
    
    const snapshot = await getDocs(q);
    let customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    
    // Client-side search (Firestore full-text search desteklemediği için)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      customers = customers.filter(c => 
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.company?.name?.toLowerCase().includes(term)
      );
    }
    
    // Tag filter (client-side)
    if (tags.length > 0) {
      customers = customers.filter(c => 
        tags.some(tag => c.tags?.includes(tag))
      );
    }
    
    // Pagination için son dokümanı da döndür
    if (returnLastDoc) {
      return {
        customers,
        lastDoc,
        hasMore: limitCount > 0 && snapshot.docs.length === limitCount,
      };
    }
    
    return customers;
  } catch (error) {
    console.error("Error getting all customers:", error);
    throw error;
  }
};

/**
 * E-posta veya telefon ile müşteri bul
 */
export const findCustomerByContact = async (email = null, phone = null) => {
  try {
    if (!email && !phone) return null;
    
    // Önce ana e-posta/telefon ile ara
    if (email) {
      const emailQuery = query(
        collection(db, COLLECTIONS.CUSTOMERS),
        where('email', '==', email.toLowerCase()),
        limit(1)
      );
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        return { id: emailSnapshot.docs[0].id, ...emailSnapshot.docs[0].data() };
      }
    }
    
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      const phoneQuery = query(
        collection(db, COLLECTIONS.CUSTOMERS),
        where('phone', '==', normalizedPhone),
        limit(1)
      );
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        return { id: phoneSnapshot.docs[0].id, ...phoneSnapshot.docs[0].data() };
      }
    }
    
    // Alternatif iletişim bilgilerinde ara (client-side)
    const allQuery = query(collection(db, COLLECTIONS.CUSTOMERS), limit(500));
    const allSnapshot = await getDocs(allQuery);
    
    for (const doc of allSnapshot.docs) {
      const data = doc.data();
      const altContacts = data.alternativeContacts || [];
      
      if (email) {
        const found = altContacts.find(c => 
          c.type === 'email' && c.value.toLowerCase() === email.toLowerCase()
        );
        if (found) {
          return { id: doc.id, ...data };
        }
      }
      
      if (phone) {
        const normalizedPhone = normalizePhone(phone);
        const found = altContacts.find(c => 
          c.type === 'phone' && normalizePhone(c.value) === normalizedPhone
        );
        if (found) {
          return { id: doc.id, ...data };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error finding customer by contact:", error);
    throw error;
  }
};

/**
 * Müşteri birleştir (iki müşteri profilini birleştir)
 */
export const mergeCustomers = async (primaryId, secondaryId, mergedBy = null) => {
  try {
    const batch = writeBatch(db);
    
    const primaryDoc = await getDoc(doc(db, COLLECTIONS.CUSTOMERS, primaryId));
    const secondaryDoc = await getDoc(doc(db, COLLECTIONS.CUSTOMERS, secondaryId));
    
    if (!primaryDoc.exists() || !secondaryDoc.exists()) {
      throw new Error('One or both customers not found');
    }
    
    const primary = primaryDoc.data();
    const secondary = secondaryDoc.data();
    
    // Alternatif iletişim bilgilerini birleştir
    const mergedAltContacts = [
      ...(primary.alternativeContacts || []),
      // Secondary'nin ana bilgilerini alternatif olarak ekle
      { type: 'email', value: secondary.email, source: 'merged', mergedFrom: secondaryId },
      { type: 'phone', value: secondary.phone, source: 'merged', mergedFrom: secondaryId },
      ...(secondary.alternativeContacts || []),
    ].filter(c => c.value); // Boş değerleri filtrele
    
    // Tags birleştir
    const mergedTags = [...new Set([...(primary.tags || []), ...(secondary.tags || [])])];
    
    // Stats birleştir
    const mergedStats = {
      totalConversations: (primary.stats?.totalConversations || 0) + (secondary.stats?.totalConversations || 0),
      totalCases: (primary.stats?.totalCases || 0) + (secondary.stats?.totalCases || 0),
      openCases: (primary.stats?.openCases || 0) + (secondary.stats?.openCases || 0),
      wonCases: (primary.stats?.wonCases || 0) + (secondary.stats?.wonCases || 0),
      lostCases: (primary.stats?.lostCases || 0) + (secondary.stats?.lostCases || 0),
      totalValue: (primary.stats?.totalValue || 0) + (secondary.stats?.totalValue || 0),
      lastContactAt: primary.stats?.lastContactAt || secondary.stats?.lastContactAt,
      firstContactAt: secondary.stats?.firstContactAt || primary.stats?.firstContactAt,
    };
    
    // Primary'yi güncelle
    batch.update(doc(db, COLLECTIONS.CUSTOMERS, primaryId), {
      alternativeContacts: mergedAltContacts,
      tags: mergedTags,
      stats: mergedStats,
      notes: `${primary.notes || ''}\n\n[Birleştirildi: ${secondary.name}]\n${secondary.notes || ''}`.trim(),
      updatedAt: serverTimestamp(),
    });
    
    // Secondary müşterinin conversation ve case'lerini güncelle
    const conversationsQuery = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('customerId', '==', secondaryId)
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);
    conversationsSnapshot.forEach(convDoc => {
      batch.update(doc(db, COLLECTIONS.CONVERSATIONS, convDoc.id), {
        customerId: primaryId,
        updatedAt: serverTimestamp(),
      });
    });
    
    const casesQuery = query(
      collection(db, COLLECTIONS.CASES),
      where('customerId', '==', secondaryId)
    );
    const casesSnapshot = await getDocs(casesQuery);
    casesSnapshot.forEach(caseDoc => {
      batch.update(doc(db, COLLECTIONS.CASES, caseDoc.id), {
        customerId: primaryId,
        updatedAt: serverTimestamp(),
      });
    });
    
    // Secondary'yi sil
    batch.delete(doc(db, COLLECTIONS.CUSTOMERS, secondaryId));
    
    await batch.commit();
    
    // Aktivite kaydı
    await logActivity({
      type: ACTIVITY_TYPE.CUSTOMER_MERGED,
      customerId: primaryId,
      performedBy: mergedBy,
      metadata: { 
        mergedFromId: secondaryId,
        mergedFromName: secondary.name,
      },
    });
    
    return true;
  } catch (error) {
    console.error("Error merging customers:", error);
    throw error;
  }
};

/**
 * Müşteri sil
 */
export const deleteCustomer = async (customerId) => {
  try {
    // İlişkili conversation ve case'leri kontrol et
    const conversationsQuery = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('customerId', '==', customerId),
      limit(1)
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    if (!conversationsSnapshot.empty) {
      throw new Error('Bu müşteriye ait konuşmalar var. Önce konuşmaları silin veya başka müşteriye atayın.');
    }
    
    const casesQuery = query(
      collection(db, COLLECTIONS.CASES),
      where('customerId', '==', customerId),
      limit(1)
    );
    const casesSnapshot = await getDocs(casesQuery);
    
    if (!casesSnapshot.empty) {
      throw new Error('Bu müşteriye ait talepler var. Önce talepleri silin veya başka müşteriye atayın.');
    }
    
    await deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, customerId));
    return true;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

/**
 * Müşteri istatistiklerini güncelle
 */
export const updateCustomerStats = async (customerId, statsUpdate) => {
  try {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) return;
    
    const currentStats = customerDoc.data().stats || {};
    
    const newStats = {
      ...currentStats,
      ...statsUpdate,
    };
    
    await updateDoc(customerRef, {
      stats: newStats,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error updating customer stats:", error);
    throw error;
  }
};

/**
 * Müşteriye etiket ekle/çıkar
 */
export const updateCustomerTags = async (customerId, tags, updatedBy = null) => {
  try {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    
    await updateDoc(customerRef, {
      tags,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error("Error updating customer tags:", error);
    throw error;
  }
};

/**
 * Müşteri istatistikleri
 */
export const getCustomerStatistics = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
    
    const stats = {
      total: 0,
      byType: {},
      byPriority: {},
      totalValue: 0,
    };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      stats.total++;
      stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
      stats.byPriority[data.priority] = (stats.byPriority[data.priority] || 0) + 1;
      stats.totalValue += data.stats?.totalValue || 0;
    });
    
    return stats;
  } catch (error) {
    console.error("Error getting customer statistics:", error);
    throw error;
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Telefon numarasını normalize et
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)]/g, '');
};

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
    // Aktivite kaydı hataları ana işlemi etkilemesin
  }
};
