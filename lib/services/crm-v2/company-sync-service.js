/**
 * CRM v2 - Company Sync Service
 * 
 * Companies ve CRM Customers arasında çift yönlü senkronizasyon servisi.
 * 
 * Ana fonksiyonlar:
 * - initialBidirectionalSync(): İlk senkronizasyon (mevcut tüm veriler)
 * - syncCompanyToCRM(): Tek company → CRM customer
 * - syncCRMToCompany(): Tek CRM customer → Company
 * - createLink(): İki sistem arasında bağlantı oluştur
 * - findMatchingCustomer(): Email/telefon ile CRM'de eşleşme bul
 * - findMatchingCompany(): Email/telefon ile Companies'de eşleşme bul
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
  Timestamp,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { comparePhones, normalizePhone } from "../../utils/phone-utils";
import {
  COLLECTIONS,
  SYNC_DIRECTION,
  SYNC_STATUS,
  CUSTOMER_TYPE,
  PRIORITY,
  COMPANY_STATUS_TO_CUSTOMER_TYPE,
  CUSTOMER_TYPE_TO_COMPANY_STATUS,
} from "./schema";

// =============================================================================
// CONSTANTS
// =============================================================================

const COMPANIES_COLLECTION = "companies";

// Eşleştirme için minimum benzerlik skoru (0-100)
const MIN_MATCH_SCORE = 70;

// CRM'den Company oluşturma koşulları
const CREATE_COMPANY_CONDITIONS = {
  // Lead dahil tüm ana tipler - hepsi Companies ile senkronize olabilir
  customerTypes: [CUSTOMER_TYPE.LEAD, CUSTOMER_TYPE.PROSPECT, CUSTOMER_TYPE.CUSTOMER, CUSTOMER_TYPE.VIP],
  requireTaxNumber: false, // Tax number zorunlu değil
  requireCompanyName: false, // Şirket adı artık zorunlu değil - müşteri adı kullanılabilir
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Metni normalize et (karşılaştırma için)
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^\w\s@.-]/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * Email'i normalize et
 */
const normalizeEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

// Telefon normalizasyonu merkezi phone-utils modülünden import ediliyor

/**
 * İki değer arasındaki benzerlik skoru (0-100)
 */
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  return 0;
};

/**
 * Eşleşme skoru hesapla
 */
const calculateMatchScore = (record1, record2) => {
  let score = 0;
  let matchedFields = [];

  // Email eşleşmesi (en yüksek ağırlık)
  const email1 = normalizeEmail(record1.email || record1.contactEmail);
  const email2 = normalizeEmail(record2.email);
  if (email1 && email2 && email1 === email2) {
    score += 50;
    matchedFields.push('email');
  }

  // Telefon eşleşmesi (comparePhones suffix matching ile karşılaştırır)
  const phone1 = record1.phone || record1.contactPhone;
  const phone2 = record2.phone;
  if (phone1 && phone2 && comparePhones(phone1, phone2)) {
    score += 30;
    matchedFields.push('phone');
  }

  // Şirket adı eşleşmesi
  const companyName1 = normalizeText(record1.name || record1.company?.name);
  const companyName2 = normalizeText(record2.company?.name || record2.name);
  if (companyName1 && companyName2) {
    const nameSimilarity = calculateSimilarity(companyName1, companyName2);
    if (nameSimilarity >= 80) {
      score += 20;
      matchedFields.push('companyName');
    }
  }

  return { score, matchedFields };
};

/**
 * Timestamp'i Date'e çevir
 */
const toDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

// =============================================================================
// LINK MANAGEMENT (company_crm_links collection)
// =============================================================================

/**
 * Yeni link oluştur
 */
export const createLink = async (companyId, customerId, direction, linkedBy = null) => {
  try {
    const linkData = {
      companyId,
      customerId,
      linkedAt: serverTimestamp(),
      linkedBy,
      syncDirection: direction,
      lastSyncAt: serverTimestamp(),
      syncStatus: SYNC_STATUS.SYNCED,
      metadata: {
        createdAt: serverTimestamp(),
      },
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.COMPANY_CRM_LINKS), linkData);
    
    // CRM customer'da linkedCompanyId güncelle
    await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, customerId), {
      linkedCompanyId: companyId,
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, ...linkData };
  } catch (error) {
    console.error("Error creating link:", error);
    throw error;
  }
};

/**
 * Link güncelle
 */
export const updateLink = async (linkId, updates) => {
  try {
    const linkRef = doc(db, COLLECTIONS.COMPANY_CRM_LINKS, linkId);
    await updateDoc(linkRef, {
      ...updates,
      lastSyncAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating link:", error);
    throw error;
  }
};

/**
 * Company ID ile link bul
 */
export const getLinkByCompanyId = async (companyId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.COMPANY_CRM_LINKS),
      where("companyId", "==", companyId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error("Error getting link by company ID:", error);
    return null;
  }
};

/**
 * Customer ID ile link bul
 */
export const getLinkByCustomerId = async (customerId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.COMPANY_CRM_LINKS),
      where("customerId", "==", customerId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error("Error getting link by customer ID:", error);
    return null;
  }
};

/**
 * Tüm linkleri getir
 */
export const getAllLinks = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.COMPANY_CRM_LINKS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting all links:", error);
    return [];
  }
};

// =============================================================================
// MATCHING FUNCTIONS
// =============================================================================

/**
 * CRM'de eşleşen müşteri bul
 */
export const findMatchingCustomer = async ({ email, phone, companyName }) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    
    // Email ile ara
    if (normalizedEmail) {
      const emailQuery = query(
        collection(db, COLLECTIONS.CUSTOMERS),
        where("email", "==", normalizedEmail),
        limit(1)
      );
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        const customer = { id: emailSnapshot.docs[0].id, ...emailSnapshot.docs[0].data() };
        return { customer, matchedBy: 'email', score: 100 };
      }
    }

    // Tüm müşterileri getirip karşılaştır (daha kapsamlı arama)
    const allCustomersSnapshot = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
    const customers = allCustomersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let bestMatch = null;
    let bestScore = 0;
    let matchedFields = [];

    for (const customer of customers) {
      const { score, matchedFields: fields } = calculateMatchScore(
        { email, phone, name: companyName },
        customer
      );

      if (score > bestScore && score >= MIN_MATCH_SCORE) {
        bestScore = score;
        bestMatch = customer;
        matchedFields = fields;
      }
    }

    if (bestMatch) {
      return { customer: bestMatch, matchedBy: matchedFields.join(', '), score: bestScore };
    }

    return null;
  } catch (error) {
    console.error("Error finding matching customer:", error);
    return null;
  }
};

/**
 * Companies'de eşleşen firma bul
 */
export const findMatchingCompany = async ({ email, phone, companyName }) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    // Tüm firmaları getir
    const companiesSnapshot = await getDocs(collection(db, COMPANIES_COLLECTION));
    const companies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let bestMatch = null;
    let bestScore = 0;
    let matchedFields = [];

    for (const company of companies) {
      // Email eşleşmesi
      const companyEmail = normalizeEmail(company.email || company.contactEmail);
      const companyPhone = normalizePhone(company.phone || company.contactPhone);
      const companyNameNorm = normalizeText(company.name);

      let score = 0;
      let fields = [];

      // Email tam eşleşme
      if (normalizedEmail && companyEmail && normalizedEmail === companyEmail) {
        score += 50;
        fields.push('email');
      }

      // Telefon eşleşme
      if (normalizedPhone && companyPhone && normalizedPhone === companyPhone) {
        score += 30;
        fields.push('phone');
      }

      // Şirket adı eşleşme
      if (companyName && companyNameNorm) {
        const nameSim = calculateSimilarity(companyName, companyNameNorm);
        if (nameSim >= 80) {
          score += 20;
          fields.push('companyName');
        }
      }

      if (score > bestScore && score >= MIN_MATCH_SCORE) {
        bestScore = score;
        bestMatch = company;
        matchedFields = fields;
      }
    }

    if (bestMatch) {
      return { company: bestMatch, matchedBy: matchedFields.join(', '), score: bestScore };
    }

    return null;
  } catch (error) {
    console.error("Error finding matching company:", error);
    return null;
  }
};

// =============================================================================
// DATA TRANSFORMATION
// =============================================================================

/**
 * Company verisini CRM Customer formatına dönüştür
 */
export const transformCompanyToCustomer = (company) => {
  return {
    // Temel bilgiler - yetkili kişi bilgileri (telefon normalize edildi)
    name: company.contactPerson || company.name || '',
    email: company.contactEmail || company.email || '',
    phone: normalizePhone(company.contactPhone || company.phone) || '',
    
    // Şirket bilgileri
    company: {
      name: company.name || '',
      position: company.contactPosition || '',
      website: company.website || '',
      industry: company.businessLine || '',
      size: company.employees || '',
      address: company.address || '',
      country: 'TR',
      city: '',
    },
    
    // Vergi bilgileri
    taxInfo: {
      taxOffice: company.taxOffice || '',
      taxNumber: company.taxNumber || '',
      mersisNumber: company.mersisNumber || '',
    },
    
    // Müşteri tipi (status'a göre)
    type: COMPANY_STATUS_TO_CUSTOMER_TYPE[company.status] || CUSTOMER_TYPE.LEAD,
    priority: company.priority === 'high' ? PRIORITY.HIGH : 
              company.priority === 'low' ? PRIORITY.LOW : PRIORITY.NORMAL,
    
    // Bağlantı
    linkedCompanyId: company.id,
    
    // Notlar - array'i string'e çevir
    notes: Array.isArray(company.notes) 
      ? company.notes.map(n => `[${n.date}] ${n.content}`).join('\n')
      : company.notes || '',
    
    // Kaynak referansı
    sourceRef: `company:${company.id}`,
  };
};

/**
 * CRM Customer verisini Company formatına dönüştür
 */
export const transformCustomerToCompany = (customer) => {
  const normalizedPhone = normalizePhone(customer.phone) || '';
  return {
    // Temel bilgiler (telefon normalize edildi)
    name: customer.company?.name || customer.name || '',
    email: customer.email || '',
    phone: normalizedPhone,
    website: customer.company?.website || '',
    address: customer.company?.address || '',
    
    // Yetkili kişi
    contactPerson: customer.name || '',
    contactPosition: customer.company?.position || '',
    contactPhone: normalizedPhone,
    contactEmail: customer.email || '',
    
    // Şirket bilgileri
    employees: customer.company?.size || '',
    description: customer.notes || '',
    
    // Vergi bilgileri
    taxOffice: customer.taxInfo?.taxOffice || '',
    taxNumber: customer.taxInfo?.taxNumber || '',
    mersisNumber: customer.taxInfo?.mersisNumber || '',
    
    // Durum (type'a göre)
    status: CUSTOMER_TYPE_TO_COMPANY_STATUS[customer.type] || 'lead',
    priority: customer.priority === PRIORITY.HIGH ? 'high' :
              customer.priority === PRIORITY.URGENT ? 'high' :
              customer.priority === PRIORITY.LOW ? 'low' : 'medium',
    
    // İş kolu
    businessLine: customer.company?.industry || 'ambalaj',
    
    // Default değerler
    projectDetails: {
      productType: "",
      packagingType: "",
      monthlyVolume: "",
      unitPrice: "",
      expectedMonthlyValue: "",
      projectDescription: "",
      specifications: "",
      deliverySchedule: "",
    },
    contractDetails: {
      contractStart: "",
      contractEnd: "",
      contractValue: "",
      paymentTerms: "",
      deliveryTerms: "",
    },
    socialMedia: {
      linkedin: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
    totalProjects: 0,
    totalRevenue: customer.stats?.totalValue || 0,
    lastContact: customer.stats?.lastContactAt || null,
    notes: [],
    reminders: [],
    documents: [],
    pricingCalculations: [],
  };
};

// =============================================================================
// SYNC OPERATIONS
// =============================================================================

/**
 * Tek company'i CRM'e senkronize et
 */
export const syncCompanyToCRM = async (companyId, options = {}) => {
  const { createdBy = null, skipIfLinked = true } = options;
  
  try {
    // 1. Company'i getir
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (!companyDoc.exists()) {
      return { success: false, error: 'Company not found' };
    }
    
    const company = { id: companyDoc.id, ...companyDoc.data() };
    
    // 2. Zaten linkli mi kontrol et
    if (skipIfLinked) {
      const existingLink = await getLinkByCompanyId(companyId);
      if (existingLink) {
        // Sadece bilgileri güncelle
        const updates = transformCompanyToCustomer(company);
        await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, existingLink.customerId), {
          ...updates,
          linkedCompanyId: companyId,
          updatedAt: serverTimestamp(),
        });
        await updateLink(existingLink.id, { syncStatus: SYNC_STATUS.SYNCED });
        return { success: true, action: 'updated', customerId: existingLink.customerId };
      }
    }
    
    // 3. CRM'de eşleşen müşteri ara
    const match = await findMatchingCustomer({
      email: company.email || company.contactEmail,
      phone: company.phone || company.contactPhone,
      companyName: company.name,
    });
    
    if (match) {
      // 4a. Eşleşme bulundu - link oluştur ve güncelle
      await createLink(companyId, match.customer.id, SYNC_DIRECTION.COMPANY_TO_CRM, createdBy);
      
      // Bilgileri merge et
      const updates = transformCompanyToCustomer(company);
      await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, match.customer.id), {
        ...updates,
        linkedCompanyId: companyId,
        updatedAt: serverTimestamp(),
      });
      
      return { 
        success: true, 
        action: 'linked', 
        customerId: match.customer.id,
        matchedBy: match.matchedBy,
        score: match.score,
      };
    } else {
      // 4b. Eşleşme yok - yeni customer oluştur
      const customerData = transformCompanyToCustomer(company);
      const customerRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), {
        ...customerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy,
        stats: {
          totalConversations: 0,
          totalCases: 0,
          openCases: 0,
          wonCases: 0,
          lostCases: 0,
          totalValue: 0,
          lastContactAt: null,
          firstContactAt: serverTimestamp(),
        },
      });
      
      // Link oluştur
      await createLink(companyId, customerRef.id, SYNC_DIRECTION.COMPANY_TO_CRM, createdBy);
      
      return { success: true, action: 'created', customerId: customerRef.id };
    }
  } catch (error) {
    console.error("Error syncing company to CRM:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Tek CRM customer'ı Companies'e senkronize et
 */
export const syncCRMToCompany = async (customerId, options = {}) => {
  const { createdBy = null, skipIfLinked = true, forceCreate = false } = options;
  
  try {
    // 1. Customer'ı getir
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      return { success: false, error: 'Customer not found' };
    }
    
    const customer = { id: customerDoc.id, ...customerDoc.data() };
    
    // 2. Zaten linkli mi kontrol et
    if (skipIfLinked && customer.linkedCompanyId) {
      // Sadece bilgileri güncelle
      const updates = transformCustomerToCompany(customer);
      await updateDoc(doc(db, COMPANIES_COLLECTION, customer.linkedCompanyId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const link = await getLinkByCustomerId(customerId);
      if (link) {
        await updateLink(link.id, { syncStatus: SYNC_STATUS.SYNCED });
      }
      
      return { success: true, action: 'updated', companyId: customer.linkedCompanyId };
    }
    
    // 3. Company oluşturma koşullarını kontrol et
    const shouldCreate = forceCreate || (
      CREATE_COMPANY_CONDITIONS.customerTypes.includes(customer.type) ||
      customer.stats?.wonCases > 0 ||
      (customer.company?.name && customer.taxInfo?.taxNumber)
    );
    
    if (!shouldCreate && !forceCreate) {
      return { 
        success: false, 
        action: 'skipped', 
        reason: 'Customer does not meet company creation criteria',
      };
    }
    
    // 4. Companies'de eşleşen firma ara
    const match = await findMatchingCompany({
      email: customer.email,
      phone: customer.phone,
      companyName: customer.company?.name,
    });
    
    if (match) {
      // 5a. Eşleşme bulundu - link oluştur ve güncelle
      await createLink(match.company.id, customerId, SYNC_DIRECTION.CRM_TO_COMPANY, createdBy);
      
      // CRM'deki linkedCompanyId'yi güncelle
      await updateDoc(customerRef, {
        linkedCompanyId: match.company.id,
        updatedAt: serverTimestamp(),
      });
      
      return { 
        success: true, 
        action: 'linked', 
        companyId: match.company.id,
        matchedBy: match.matchedBy,
        score: match.score,
      };
    } else {
      // 5b. Eşleşme yok - yeni company oluştur
      // En az müşteri adı veya şirket adı olmalı
      const companyName = customer.company?.name || customer.name;
      if (!companyName) {
        return { 
          success: false, 
          action: 'skipped', 
          reason: 'Customer or company name is required',
        };
      }
      
      const companyData = transformCustomerToCompany(customer);
      const companyRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
        ...companyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Link oluştur
      await createLink(companyRef.id, customerId, SYNC_DIRECTION.CRM_TO_COMPANY, createdBy);
      
      // CRM'deki linkedCompanyId'yi güncelle
      await updateDoc(customerRef, {
        linkedCompanyId: companyRef.id,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, action: 'created', companyId: companyRef.id };
    }
  } catch (error) {
    console.error("Error syncing CRM to company:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// INITIAL BIDIRECTIONAL SYNC
// =============================================================================

/**
 * Tüm Companies'i CRM'e senkronize et (Faz 1)
 */
export const syncAllCompaniesToCRM = async (createdBy = null) => {
  const results = {
    processed: 0,
    created: 0,
    linked: 0,
    updated: 0,
    errors: [],
  };
  
  try {
    const companiesSnapshot = await getDocs(collection(db, COMPANIES_COLLECTION));
    const companies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    for (const company of companies) {
      try {
        const result = await syncCompanyToCRM(company.id, { createdBy, skipIfLinked: false });
        results.processed++;
        
        if (result.success) {
          if (result.action === 'created') results.created++;
          else if (result.action === 'linked') results.linked++;
          else if (result.action === 'updated') results.updated++;
        } else {
          results.errors.push({ companyId: company.id, error: result.error });
        }
      } catch (error) {
        results.errors.push({ companyId: company.id, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error syncing all companies to CRM:", error);
    throw error;
  }
};

/**
 * Link'i olmayan CRM müşterilerini Companies'e senkronize et (Faz 2)
 */
export const syncUnlinkedCustomersToCompanies = async (createdBy = null) => {
  const results = {
    processed: 0,
    created: 0,
    linked: 0,
    skipped: 0,
    errors: [],
  };
  
  try {
    // linkedCompanyId'si null olan müşterileri bul
    const customersSnapshot = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
    const customers = customersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(c => !c.linkedCompanyId);
    
    for (const customer of customers) {
      try {
        const result = await syncCRMToCompany(customer.id, { createdBy, skipIfLinked: false });
        results.processed++;
        
        if (result.success) {
          if (result.action === 'created') results.created++;
          else if (result.action === 'linked') results.linked++;
        } else if (result.action === 'skipped') {
          results.skipped++;
        } else {
          results.errors.push({ customerId: customer.id, error: result.error });
        }
      } catch (error) {
        results.errors.push({ customerId: customer.id, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error syncing unlinked customers to companies:", error);
    throw error;
  }
};

/**
 * Çift yönlü ilk senkronizasyon
 */
export const initialBidirectionalSync = async (createdBy = null) => {
  console.log('🔄 Çift yönlü senkronizasyon başlatılıyor...');
  
  const results = {
    phase1: null, // Companies → CRM
    phase2: null, // CRM → Companies
    totalLinks: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    success: false,
  };
  
  try {
    // FAZ 1: Companies → CRM Customers
    console.log('📤 Faz 1: Companies → CRM Customers...');
    results.phase1 = await syncAllCompaniesToCRM(createdBy);
    console.log(`   ✅ ${results.phase1.processed} company işlendi`);
    console.log(`   - ${results.phase1.created} yeni customer oluşturuldu`);
    console.log(`   - ${results.phase1.linked} eşleşme bulundu ve bağlandı`);
    console.log(`   - ${results.phase1.updated} güncellendi`);
    
    // FAZ 2: CRM Customers → Companies
    console.log('📥 Faz 2: CRM Customers → Companies...');
    results.phase2 = await syncUnlinkedCustomersToCompanies(createdBy);
    console.log(`   ✅ ${results.phase2.processed} customer işlendi`);
    console.log(`   - ${results.phase2.created} yeni company oluşturuldu`);
    console.log(`   - ${results.phase2.linked} eşleşme bulundu ve bağlandı`);
    console.log(`   - ${results.phase2.skipped} atlandı (koşul sağlanmadı)`);
    
    // Toplam link sayısı
    const allLinks = await getAllLinks();
    results.totalLinks = allLinks.length;
    
    results.completedAt = new Date().toISOString();
    results.success = true;
    
    console.log('✅ Senkronizasyon tamamlandı!');
    console.log(`   Toplam bağlantı: ${results.totalLinks}`);
    
    return results;
  } catch (error) {
    console.error("❌ Senkronizasyon hatası:", error);
    results.completedAt = new Date().toISOString();
    results.error = error.message;
    return results;
  }
};

// =============================================================================
// REAL-TIME SYNC HOOKS (Companies ve Customer service'lerde kullanılacak)
// =============================================================================

/**
 * Company oluşturulduğunda çağrılacak hook
 */
export const onCompanyCreated = async (companyId, createdBy = null) => {
  console.log(`🔄 Yeni company (${companyId}) CRM'e senkronize ediliyor...`);
  return await syncCompanyToCRM(companyId, { createdBy, skipIfLinked: true });
};

/**
 * Company güncellendiğinde çağrılacak hook
 * - Link varsa: Bağlı CRM customer'ı güncelle
 * - Link yoksa: Eşleşme aramaya çalış, varsa bağla
 */
export const onCompanyUpdated = async (companyId, updatedFields = null) => {
  try {
    const link = await getLinkByCompanyId(companyId);
    
    if (link) {
      // Mevcut link var - CRM customer'ı güncelle
      console.log(`🔄 Company (${companyId}) güncellendi, bağlı CRM customer güncelleniyor...`);
      
      const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
      const companyDoc = await getDoc(companyRef);
      
      if (!companyDoc.exists()) {
        return { success: false, error: 'Company not found' };
      }
      
      const company = { id: companyDoc.id, ...companyDoc.data() };
      const updates = transformCompanyToCustomer(company);
      
      await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, link.customerId), {
        ...updates,
        linkedCompanyId: companyId,
        updatedAt: serverTimestamp(),
      });
      
      await updateLink(link.id, { syncStatus: SYNC_STATUS.SYNCED });
      
      return { success: true, action: 'updated', customerId: link.customerId };
    } else {
      // Link yok - eşleşme aramaya çalış
      console.log(`🔄 Company (${companyId}) güncellendi, eşleşme aranıyor...`);
      return await syncCompanyToCRM(companyId, { skipIfLinked: false });
    }
  } catch (error) {
    console.error(`Error in onCompanyUpdated (${companyId}):`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Customer oluşturulduğunda çağrılacak hook
 */
export const onCustomerCreated = async (customerId, createdBy = null) => {
  console.log(`🔄 Yeni customer (${customerId}) Companies ile senkronize ediliyor...`);
  return await syncCRMToCompany(customerId, { createdBy, skipIfLinked: true });
};

/**
 * Customer güncellendiğinde çağrılacak hook
 * - Link varsa: Bağlı Company'i güncelle
 * - Link yoksa: Eşleşme aramaya çalış, varsa bağla
 */
export const onCustomerUpdated = async (customerId, updatedFields = null) => {
  try {
    const link = await getLinkByCustomerId(customerId);
    
    if (link) {
      // Mevcut link var - Company'i güncelle
      console.log(`🔄 Customer (${customerId}) güncellendi, bağlı Company güncelleniyor...`);
      
      const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        return { success: false, error: 'Customer not found' };
      }
      
      const customer = { id: customerDoc.id, ...customerDoc.data() };
      const updates = transformCustomerToCompany(customer);
      
      await updateDoc(doc(db, COMPANIES_COLLECTION, link.companyId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      await updateLink(link.id, { syncStatus: SYNC_STATUS.SYNCED });
      
      return { success: true, action: 'updated', companyId: link.companyId };
    } else {
      // Link yok - eşleşme aramaya çalış
      console.log(`🔄 Customer (${customerId}) güncellendi, eşleşme aranıyor...`);
      return await syncCRMToCompany(customerId, { skipIfLinked: false });
    }
  } catch (error) {
    console.error(`Error in onCustomerUpdated (${customerId}):`, error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Senkronizasyon durumunu getir
 */
export const getSyncStatus = async () => {
  try {
    const [companiesSnapshot, customersSnapshot, linksSnapshot] = await Promise.all([
      getDocs(collection(db, COMPANIES_COLLECTION)),
      getDocs(collection(db, COLLECTIONS.CUSTOMERS)),
      getDocs(collection(db, COLLECTIONS.COMPANY_CRM_LINKS)),
    ]);
    
    const totalCompanies = companiesSnapshot.size;
    const totalCustomers = customersSnapshot.size;
    const totalLinks = linksSnapshot.size;
    
    // Linkli customer sayısı
    const linkedCustomers = customersSnapshot.docs.filter(
      doc => doc.data().linkedCompanyId
    ).length;
    
    return {
      totalCompanies,
      totalCustomers,
      totalLinks,
      linkedCustomers,
      unlinkedCustomers: totalCustomers - linkedCustomers,
      syncPercentage: totalCustomers > 0 
        ? Math.round((linkedCustomers / totalCustomers) * 100) 
        : 0,
    };
  } catch (error) {
    console.error("Error getting sync status:", error);
    throw error;
  }
};

/**
 * Link'i kaldır (unlink)
 */
export const unlinkCompanyAndCustomer = async (linkId) => {
  try {
    const linkRef = doc(db, COLLECTIONS.COMPANY_CRM_LINKS, linkId);
    const linkDoc = await getDoc(linkRef);
    
    if (!linkDoc.exists()) {
      return { success: false, error: 'Link not found' };
    }
    
    const link = linkDoc.data();
    
    // CRM customer'daki linkedCompanyId'yi temizle
    await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, link.customerId), {
      linkedCompanyId: null,
      updatedAt: serverTimestamp(),
    });
    
    // Link'i sil
    await deleteDoc(linkRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error unlinking:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Manuel link oluştur (UI'dan)
 */
export const manualLink = async (companyId, customerId, linkedBy = null) => {
  try {
    // Mevcut link kontrolü
    const existingCompanyLink = await getLinkByCompanyId(companyId);
    if (existingCompanyLink) {
      return { success: false, error: 'Company already linked to another customer' };
    }
    
    const existingCustomerLink = await getLinkByCustomerId(customerId);
    if (existingCustomerLink) {
      return { success: false, error: 'Customer already linked to another company' };
    }
    
    // Link oluştur
    const link = await createLink(companyId, customerId, SYNC_DIRECTION.MANUAL, linkedBy);
    
    return { success: true, link };
  } catch (error) {
    console.error("Error manual linking:", error);
    return { success: false, error: error.message };
  }
};

// =============================================================================
// DUPLICATE DETECTION AND MERGE
// =============================================================================

/**
 * CRM Customers içindeki duplicate kayıtları tespit et
 * Email ve telefon numarası ile eşleştirme yapar
 */
export const detectDuplicateCustomers = async () => {
  try {
    const customersSnapshot = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
    const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const duplicateGroups = [];
    const processedIds = new Set();
    
    for (const customer of customers) {
      if (processedIds.has(customer.id)) continue;
      
      const normalizedEmail = normalizeEmail(customer.email);
      const normalizedPhone = normalizePhone(customer.phone);
      
      // En az bir tanımlayıcı bilgi olmalı
      if (!normalizedEmail && !normalizedPhone) continue;
      
      const duplicates = customers.filter(c => {
        if (c.id === customer.id || processedIds.has(c.id)) return false;
        
        const cEmail = normalizeEmail(c.email);
        const cPhone = normalizePhone(c.phone);
        
        // Email veya telefon eşleşmesi
        const emailMatch = normalizedEmail && cEmail && normalizedEmail === cEmail;
        const phoneMatch = normalizedPhone && cPhone && normalizedPhone === cPhone;
        
        return emailMatch || phoneMatch;
      });
      
      if (duplicates.length > 0) {
        const group = [customer, ...duplicates];
        duplicateGroups.push({
          matchType: normalizedEmail ? 'email' : 'phone',
          matchValue: normalizedEmail || normalizedPhone,
          records: group.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            companyName: r.company?.name || '',
            type: r.type,
            linkedCompanyId: r.linkedCompanyId,
            conversationCount: r.stats?.totalConversations || 0,
            createdAt: r.createdAt,
          })),
        });
        
        group.forEach(r => processedIds.add(r.id));
      }
    }
    
    return {
      success: true,
      totalCustomers: customers.length,
      duplicateGroups,
      duplicateCount: duplicateGroups.reduce((sum, g) => sum + g.records.length - 1, 0),
    };
  } catch (error) {
    console.error("Error detecting duplicate customers:", error);
    return { success: false, error: error.message, duplicateGroups: [] };
  }
};

/**
 * Companies içindeki duplicate kayıtları tespit et
 * Email ve telefon numarası ile eşleştirme yapar
 */
export const detectDuplicateCompanies = async () => {
  try {
    const companiesSnapshot = await getDocs(collection(db, COMPANIES_COLLECTION));
    const companies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const duplicateGroups = [];
    const processedIds = new Set();
    
    for (const company of companies) {
      if (processedIds.has(company.id)) continue;
      
      const primaryEmail = normalizeEmail(company.email || company.contactEmail);
      const primaryPhone = normalizePhone(company.phone || company.contactPhone);
      
      // En az bir tanımlayıcı bilgi olmalı
      if (!primaryEmail && !primaryPhone) continue;
      
      const duplicates = companies.filter(c => {
        if (c.id === company.id || processedIds.has(c.id)) return false;
        
        const cEmail = normalizeEmail(c.email || c.contactEmail);
        const cPhone = normalizePhone(c.phone || c.contactPhone);
        
        // Email veya telefon eşleşmesi
        const emailMatch = primaryEmail && cEmail && primaryEmail === cEmail;
        const phoneMatch = primaryPhone && cPhone && primaryPhone === cPhone;
        
        return emailMatch || phoneMatch;
      });
      
      if (duplicates.length > 0) {
        const group = [company, ...duplicates];
        duplicateGroups.push({
          matchType: primaryEmail ? 'email' : 'phone',
          matchValue: primaryEmail || primaryPhone,
          records: group.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email || r.contactEmail,
            phone: r.phone || r.contactPhone,
            status: r.status,
            linkedCustomerId: null, // Will be filled below
            proformaCount: r.totalProjects || 0,
            createdAt: r.createdAt,
          })),
        });
        
        group.forEach(r => processedIds.add(r.id));
      }
    }
    
    // Link bilgilerini ekle
    const allLinks = await getAllLinks();
    for (const group of duplicateGroups) {
      for (const record of group.records) {
        const link = allLinks.find(l => l.companyId === record.id);
        if (link) {
          record.linkedCustomerId = link.customerId;
        }
      }
    }
    
    return {
      success: true,
      totalCompanies: companies.length,
      duplicateGroups,
      duplicateCount: duplicateGroups.reduce((sum, g) => sum + g.records.length - 1, 0),
    };
  } catch (error) {
    console.error("Error detecting duplicate companies:", error);
    return { success: false, error: error.message, duplicateGroups: [] };
  }
};

/**
 * Tüm duplicate'leri tespit et (hem CRM hem Companies)
 */
export const detectAllDuplicates = async () => {
  try {
    const [customerDupes, companyDupes] = await Promise.all([
      detectDuplicateCustomers(),
      detectDuplicateCompanies(),
    ]);
    
    return {
      success: true,
      customers: customerDupes,
      companies: companyDupes,
      summary: {
        totalCustomerDuplicates: customerDupes.duplicateCount || 0,
        totalCompanyDuplicates: companyDupes.duplicateCount || 0,
        customerGroups: customerDupes.duplicateGroups?.length || 0,
        companyGroups: companyDupes.duplicateGroups?.length || 0,
      },
    };
  } catch (error) {
    console.error("Error detecting all duplicates:", error);
    return { success: false, error: error.message };
  }
};

/**
 * CRM Customer duplicate grubunu birleştir
 * En eski kaydı master olarak kullanır, diğerlerini siler
 * İlişkili veriler (conversations, cases) master'a taşınır
 */
export const mergeDuplicateCustomers = async (customerIds, masterId = null, mergedBy = null) => {
  try {
    if (!customerIds || customerIds.length < 2) {
      return { success: false, error: 'En az 2 kayıt gerekli' };
    }
    
    // Kayıtları getir
    const customers = [];
    for (const id of customerIds) {
      const docRef = doc(db, COLLECTIONS.CUSTOMERS, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        customers.push({ id: docSnap.id, ...docSnap.data() });
      }
    }
    
    if (customers.length < 2) {
      return { success: false, error: 'Yeterli kayıt bulunamadı' };
    }
    
    // Master kaydı belirle (parametre ile verilmişse onu kullan, yoksa en eski)
    let master;
    if (masterId) {
      master = customers.find(c => c.id === masterId);
      if (!master) {
        return { success: false, error: 'Belirtilen master kayıt bulunamadı' };
      }
    } else {
      // En eski kaydı bul
      master = customers.reduce((oldest, current) => {
        const oldestTime = oldest.createdAt?.toDate?.() || oldest.createdAt || new Date(0);
        const currentTime = current.createdAt?.toDate?.() || current.createdAt || new Date(0);
        return currentTime < oldestTime ? current : oldest;
      });
    }
    
    const duplicatesToRemove = customers.filter(c => c.id !== master.id);
    const batch = writeBatch(db);
    
    // 1. Conversations'ları master'a taşı
    for (const dupe of duplicatesToRemove) {
      const conversationsQuery = query(
        collection(db, COLLECTIONS.CONVERSATIONS),
        where('customerId', '==', dupe.id)
      );
      const convSnapshot = await getDocs(conversationsQuery);
      
      convSnapshot.forEach(convDoc => {
        batch.update(convDoc.ref, {
          customerId: master.id,
          'sender.name': master.name || dupe.name,
          'sender.email': master.email || dupe.email,
          'sender.phone': master.phone || dupe.phone,
          updatedAt: serverTimestamp(),
          mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
        });
      });
    }
    
    // 2. Cases'leri master'a taşı
    for (const dupe of duplicatesToRemove) {
      const casesQuery = query(
        collection(db, COLLECTIONS.CASES),
        where('customerId', '==', dupe.id)
      );
      const casesSnapshot = await getDocs(casesQuery);
      
      casesSnapshot.forEach(caseDoc => {
        batch.update(caseDoc.ref, {
          customerId: master.id,
          updatedAt: serverTimestamp(),
          mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
        });
      });
    }
    
    // 3. Activities'leri master'a taşı
    for (const dupe of duplicatesToRemove) {
      const activitiesQuery = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        where('customerId', '==', dupe.id)
      );
      const actSnapshot = await getDocs(activitiesQuery);
      
      actSnapshot.forEach(actDoc => {
        batch.update(actDoc.ref, {
          customerId: master.id,
          updatedAt: serverTimestamp(),
        });
      });
    }
    
    // 4. Company-CRM linklerini güncelle
    for (const dupe of duplicatesToRemove) {
      const link = await getLinkByCustomerId(dupe.id);
      if (link) {
        // Link'i master'a taşı veya sil
        const masterLink = await getLinkByCustomerId(master.id);
        if (masterLink) {
          // Master'ın zaten link'i var, duplicate'ın linkini sil
          batch.delete(doc(db, COLLECTIONS.COMPANY_CRM_LINKS, link.id));
        } else {
          // Link'i master'a taşı
          batch.update(doc(db, COLLECTIONS.COMPANY_CRM_LINKS, link.id), {
            customerId: master.id,
            lastSyncAt: serverTimestamp(),
            mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
          });
          // Master'ın linkedCompanyId'sini güncelle
          batch.update(doc(db, COLLECTIONS.CUSTOMERS, master.id), {
            linkedCompanyId: link.companyId,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }
    
    // 5. Master kaydını güncelle (bilgileri birleştir)
    const mergedData = {
      // Boş olmayan değerleri birleştir
      name: master.name || duplicatesToRemove.find(d => d.name)?.name || '',
      email: master.email || duplicatesToRemove.find(d => d.email)?.email || '',
      phone: master.phone || duplicatesToRemove.find(d => d.phone)?.phone || '',
      // Şirket bilgilerini birleştir
      company: {
        name: master.company?.name || duplicatesToRemove.find(d => d.company?.name)?.company?.name || '',
        position: master.company?.position || duplicatesToRemove.find(d => d.company?.position)?.company?.position || '',
        website: master.company?.website || duplicatesToRemove.find(d => d.company?.website)?.company?.website || '',
        address: master.company?.address || duplicatesToRemove.find(d => d.company?.address)?.company?.address || '',
        city: master.company?.city || duplicatesToRemove.find(d => d.company?.city)?.company?.city || '',
        country: master.company?.country || duplicatesToRemove.find(d => d.company?.country)?.company?.country || 'TR',
      },
      // Vergi bilgileri
      taxInfo: {
        taxOffice: master.taxInfo?.taxOffice || duplicatesToRemove.find(d => d.taxInfo?.taxOffice)?.taxInfo?.taxOffice || '',
        taxNumber: master.taxInfo?.taxNumber || duplicatesToRemove.find(d => d.taxInfo?.taxNumber)?.taxInfo?.taxNumber || '',
      },
      // Stats birleştir
      stats: {
        totalConversations: (master.stats?.totalConversations || 0) + 
          duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.totalConversations || 0), 0),
        totalCases: (master.stats?.totalCases || 0) + 
          duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.totalCases || 0), 0),
        openCases: (master.stats?.openCases || 0) + 
          duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.openCases || 0), 0),
        wonCases: (master.stats?.wonCases || 0) + 
          duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.wonCases || 0), 0),
        lostCases: (master.stats?.lostCases || 0) + 
          duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.lostCases || 0), 0),
        totalValue: (master.stats?.totalValue || 0) + 
          duplicatesToRemove.reduce((sum, d) => sum + (d.stats?.totalValue || 0), 0),
      },
      // Meta bilgiler
      updatedAt: serverTimestamp(),
      mergedIds: duplicatesToRemove.map(d => d.id),
      mergedAt: serverTimestamp(),
      mergedBy,
    };
    
    batch.update(doc(db, COLLECTIONS.CUSTOMERS, master.id), mergedData);
    
    // 6. Duplicate kayıtları sil
    for (const dupe of duplicatesToRemove) {
      batch.delete(doc(db, COLLECTIONS.CUSTOMERS, dupe.id));
    }
    
    // Commit
    await batch.commit();
    
    return {
      success: true,
      masterId: master.id,
      mergedCount: duplicatesToRemove.length,
      deletedIds: duplicatesToRemove.map(d => d.id),
    };
  } catch (error) {
    console.error("Error merging duplicate customers:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Companies duplicate grubunu birleştir
 * En eski kaydı master olarak kullanır, diğerlerini siler
 * İlişkili veriler (proformas, contracts) master'a taşınır
 */
export const mergeDuplicateCompanies = async (companyIds, masterId = null, mergedBy = null) => {
  try {
    if (!companyIds || companyIds.length < 2) {
      return { success: false, error: 'En az 2 kayıt gerekli' };
    }
    
    // Kayıtları getir
    const companies = [];
    for (const id of companyIds) {
      const docRef = doc(db, COMPANIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        companies.push({ id: docSnap.id, ...docSnap.data() });
      }
    }
    
    if (companies.length < 2) {
      return { success: false, error: 'Yeterli kayıt bulunamadı' };
    }
    
    // Master kaydı belirle
    let master;
    if (masterId) {
      master = companies.find(c => c.id === masterId);
      if (!master) {
        return { success: false, error: 'Belirtilen master kayıt bulunamadı' };
      }
    } else {
      master = companies.reduce((oldest, current) => {
        const oldestTime = oldest.createdAt?.toDate?.() || oldest.createdAt || new Date(0);
        const currentTime = current.createdAt?.toDate?.() || current.createdAt || new Date(0);
        return currentTime < oldestTime ? current : oldest;
      });
    }
    
    const duplicatesToRemove = companies.filter(c => c.id !== master.id);
    const batch = writeBatch(db);
    
    // 1. Proformas'ları master'a taşı
    for (const dupe of duplicatesToRemove) {
      const proformasQuery = query(
        collection(db, 'proformas'),
        where('companyId', '==', dupe.id)
      );
      const proformasSnapshot = await getDocs(proformasQuery);
      
      proformasSnapshot.forEach(proformaDoc => {
        batch.update(proformaDoc.ref, {
          companyId: master.id,
          updatedAt: serverTimestamp(),
          mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
        });
      });
    }
    
    // 2. Contracts'ları master'a taşı
    for (const dupe of duplicatesToRemove) {
      const contractsQuery = query(
        collection(db, 'contracts'),
        where('companyId', '==', dupe.id)
      );
      const contractsSnapshot = await getDocs(contractsQuery);
      
      contractsSnapshot.forEach(contractDoc => {
        batch.update(contractDoc.ref, {
          companyId: master.id,
          updatedAt: serverTimestamp(),
          mergeNote: `Birleştirildi: ${dupe.id} → ${master.id}`,
        });
      });
    }
    
    // 3. PricingCalculations linkedCompanies güncelle
    const allCalcsSnapshot = await getDocs(collection(db, 'pricingCalculations'));
    allCalcsSnapshot.forEach(calcDoc => {
      const data = calcDoc.data();
      const linkedCompanies = data.linkedCompanies || [];
      
      let needsUpdate = false;
      const updatedLinks = linkedCompanies.map(companyId => {
        if (duplicatesToRemove.some(d => d.id === companyId)) {
          needsUpdate = true;
          return master.id;
        }
        return companyId;
      });
      
      // Duplicate'ları kaldır
      const uniqueLinks = [...new Set(updatedLinks)];
      
      if (needsUpdate) {
        batch.update(calcDoc.ref, {
          linkedCompanies: uniqueLinks,
          updatedAt: serverTimestamp(),
        });
      }
    });
    
    // 4. Shopify integrations taşı
    for (const dupe of duplicatesToRemove) {
      const integrationsQuery = query(
        collection(db, 'shopify_integrations'),
        where('companyId', '==', dupe.id)
      );
      const intSnapshot = await getDocs(integrationsQuery);
      
      intSnapshot.forEach(intDoc => {
        batch.update(intDoc.ref, {
          companyId: master.id,
          updatedAt: serverTimestamp(),
        });
      });
    }
    
    // 5. Company-CRM linklerini güncelle
    for (const dupe of duplicatesToRemove) {
      const link = await getLinkByCompanyId(dupe.id);
      if (link) {
        const masterLink = await getLinkByCompanyId(master.id);
        if (masterLink) {
          // Master'ın zaten link'i var, CRM customer'ı güncelle
          batch.update(doc(db, COLLECTIONS.CUSTOMERS, link.customerId), {
            linkedCompanyId: master.id,
            updatedAt: serverTimestamp(),
          });
          batch.delete(doc(db, COLLECTIONS.COMPANY_CRM_LINKS, link.id));
        } else {
          // Link'i master'a taşı
          batch.update(doc(db, COLLECTIONS.COMPANY_CRM_LINKS, link.id), {
            companyId: master.id,
            lastSyncAt: serverTimestamp(),
          });
        }
      }
    }
    
    // 6. Master kaydını güncelle
    const mergedData = {
      name: master.name || duplicatesToRemove.find(d => d.name)?.name || '',
      email: master.email || duplicatesToRemove.find(d => d.email)?.email || '',
      phone: master.phone || duplicatesToRemove.find(d => d.phone)?.phone || '',
      contactPerson: master.contactPerson || duplicatesToRemove.find(d => d.contactPerson)?.contactPerson || '',
      contactEmail: master.contactEmail || duplicatesToRemove.find(d => d.contactEmail)?.contactEmail || '',
      contactPhone: master.contactPhone || duplicatesToRemove.find(d => d.contactPhone)?.contactPhone || '',
      address: master.address || duplicatesToRemove.find(d => d.address)?.address || '',
      website: master.website || duplicatesToRemove.find(d => d.website)?.website || '',
      taxOffice: master.taxOffice || duplicatesToRemove.find(d => d.taxOffice)?.taxOffice || '',
      taxNumber: master.taxNumber || duplicatesToRemove.find(d => d.taxNumber)?.taxNumber || '',
      // Stats birleştir
      totalProjects: (master.totalProjects || 0) + 
        duplicatesToRemove.reduce((sum, d) => sum + (d.totalProjects || 0), 0),
      totalRevenue: (master.totalRevenue || 0) + 
        duplicatesToRemove.reduce((sum, d) => sum + (d.totalRevenue || 0), 0),
      // Notes birleştir (array)
      notes: [
        ...(master.notes || []),
        ...duplicatesToRemove.flatMap(d => d.notes || []),
      ],
      // Meta
      updatedAt: serverTimestamp(),
      mergedIds: duplicatesToRemove.map(d => d.id),
      mergedAt: serverTimestamp(),
      mergedBy,
    };
    
    batch.update(doc(db, COMPANIES_COLLECTION, master.id), mergedData);
    
    // 7. Duplicate kayıtları sil
    for (const dupe of duplicatesToRemove) {
      batch.delete(doc(db, COMPANIES_COLLECTION, dupe.id));
    }
    
    // Commit
    await batch.commit();
    
    return {
      success: true,
      masterId: master.id,
      mergedCount: duplicatesToRemove.length,
      deletedIds: duplicatesToRemove.map(d => d.id),
    };
  } catch (error) {
    console.error("Error merging duplicate companies:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Tüm duplicate'leri otomatik birleştir (dikkatli kullanın!)
 */
export const mergeAllDuplicates = async (mergedBy = null) => {
  try {
    const results = {
      customers: { merged: 0, errors: [] },
      companies: { merged: 0, errors: [] },
    };
    
    // CRM Customers
    const customerDupes = await detectDuplicateCustomers();
    if (customerDupes.success && customerDupes.duplicateGroups) {
      for (const group of customerDupes.duplicateGroups) {
        try {
          const ids = group.records.map(r => r.id);
          const result = await mergeDuplicateCustomers(ids, null, mergedBy);
          if (result.success) {
            results.customers.merged += result.mergedCount;
          } else {
            results.customers.errors.push({ group: group.matchValue, error: result.error });
          }
        } catch (error) {
          results.customers.errors.push({ group: group.matchValue, error: error.message });
        }
      }
    }
    
    // Companies
    const companyDupes = await detectDuplicateCompanies();
    if (companyDupes.success && companyDupes.duplicateGroups) {
      for (const group of companyDupes.duplicateGroups) {
        try {
          const ids = group.records.map(r => r.id);
          const result = await mergeDuplicateCompanies(ids, null, mergedBy);
          if (result.success) {
            results.companies.merged += result.mergedCount;
          } else {
            results.companies.errors.push({ group: group.matchValue, error: result.error });
          }
        } catch (error) {
          results.companies.errors.push({ group: group.matchValue, error: error.message });
        }
      }
    }
    
    return {
      success: true,
      ...results,
      totalMerged: results.customers.merged + results.companies.merged,
    };
  } catch (error) {
    console.error("Error merging all duplicates:", error);
    return { success: false, error: error.message };
  }
};

export default {
  // Link management
  createLink,
  updateLink,
  getLinkByCompanyId,
  getLinkByCustomerId,
  getAllLinks,
  unlinkCompanyAndCustomer,
  manualLink,
  
  // Matching
  findMatchingCustomer,
  findMatchingCompany,
  
  // Sync operations
  syncCompanyToCRM,
  syncCRMToCompany,
  initialBidirectionalSync,
  syncAllCompaniesToCRM,
  syncUnlinkedCustomersToCompanies,
  
  // Real-time hooks
  onCompanyCreated,
  onCompanyUpdated,
  onCustomerCreated,
  onCustomerUpdated,
  
  // Utilities
  getSyncStatus,
  transformCompanyToCustomer,
  transformCustomerToCompany,
  
  // Duplicate detection & merge
  detectDuplicateCustomers,
  detectDuplicateCompanies,
  detectAllDuplicates,
  mergeDuplicateCustomers,
  mergeDuplicateCompanies,
  mergeAllDuplicates,
};
