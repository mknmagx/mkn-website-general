import {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
} from "../firestore";
import { normalizePhone } from "../utils/phone-utils";

// CRM Sync Service - Lazy import to avoid circular dependency
let syncService = null;
const getSyncService = async () => {
  if (!syncService) {
    syncService = await import('./crm-v2/company-sync-service.js');
  }
  return syncService;
};

const COLLECTION_NAME = "companies";

// Tüm firmaları getir
export const getAllCompanies = async () => {
  try {
    const companies = await getDocuments(COLLECTION_NAME, {
      orderBy: ["createdAt", "desc"],
    });
    return companies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

// Tek firma getir
export const getCompanyById = async (id) => {
  try {
    const company = await getDocument(COLLECTION_NAME, id);
    return company;
  } catch (error) {
    console.error("Error fetching company:", error);
    throw error;
  }
};

// Yeni firma ekle
export const createCompany = async (companyData, options = {}) => {
  const { syncToCRM = true, createdBy = null } = options;
  
  try {
    const docId = await addDocument(COLLECTION_NAME, {
      ...companyData,
      // Default değerler
      status: companyData.status || "lead",
      priority: companyData.priority || "medium",
      businessLine: companyData.businessLine || "ambalaj",
      // Boş alanları varsayılan değerlerle doldur (telefon numaraları normalize ediliyor)
      phone: normalizePhone(companyData.phone) || "",
      email: companyData.email || "",
      website: companyData.website || "",
      address: companyData.address || "",
      contactPerson: companyData.contactPerson || "",
      contactPosition: companyData.contactPosition || "",
      contactPhone: normalizePhone(companyData.contactPhone) || "",
      contactEmail: companyData.contactEmail || "",
      employees: companyData.employees || "",
      foundedYear: companyData.foundedYear || "",
      description: companyData.description || "",
      // Vergi Bilgileri
      taxOffice: companyData.taxOffice || "",
      taxNumber: companyData.taxNumber || "",
      mersisNumber: companyData.mersisNumber || "",
      // Nested objects
      projectDetails: companyData.projectDetails || {
        productType: "",
        packagingType: "",
        monthlyVolume: "",
        unitPrice: "",
        expectedMonthlyValue: "",
        projectDescription: "",
        specifications: "",
        deliverySchedule: "",
      },
      contractDetails: companyData.contractDetails || {
        contractStart: "",
        contractEnd: "",
        contractValue: "",
        paymentTerms: "",
        deliveryTerms: "",
      },
      socialMedia: companyData.socialMedia || {
        linkedin: "",
        instagram: "",
        facebook: "",
        twitter: "",
      },
      // İstatistikler ve notlar
      totalProjects: 0,
      totalRevenue: 0,
      lastContact: null,
      notes: [],
      reminders: [],
      documents: [],
      pricingCalculations: [], // Kaydedilmiş hesaplamalar
    });
    
    // 🔄 CRM Senkronizasyonu - Yeni company oluşturulduğunda CRM'e de ekle
    if (syncToCRM) {
      try {
        const sync = await getSyncService();
        await sync.onCompanyCreated(docId, createdBy);
        console.log(`✅ Company ${docId} CRM'e senkronize edildi`);
      } catch (syncError) {
        // Senkronizasyon hatası ana işlemi etkilemesin
        console.error("CRM sync error (non-blocking):", syncError);
      }
    }
    
    return docId;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};

// Firma güncelle
export const updateCompany = async (id, companyData, options = {}) => {
  const { syncToCRM = true } = options;
  
  try {
    // Telefon numaralarını normalize et
    const normalizedData = {
      ...companyData,
      ...(companyData.phone !== undefined && { phone: normalizePhone(companyData.phone) }),
      ...(companyData.contactPhone !== undefined && { contactPhone: normalizePhone(companyData.contactPhone) }),
    };
    
    await updateDocument(COLLECTION_NAME, id, normalizedData);
    
    // 🔄 CRM Senkronizasyonu - Company güncellendiğinde CRM'i de güncelle
    if (syncToCRM) {
      try {
        const sync = await getSyncService();
        await sync.onCompanyUpdated(id);
        console.log(`✅ Company ${id} CRM ile senkronize edildi`);
      } catch (syncError) {
        // Senkronizasyon hatası ana işlemi etkilemesin
        console.error("CRM sync error (non-blocking):", syncError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
};

// Firma sil
export const deleteCompany = async (id) => {
  try {
    await deleteDocument(COLLECTION_NAME, id);
    return true;
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
};

// Durum bazlı firmaları getir
export const getCompaniesByStatus = async (status) => {
  try {
    const companies = await getDocuments(COLLECTION_NAME, {
      where: ["status", "==", status],
      orderBy: ["createdAt", "desc"],
    });
    return companies;
  } catch (error) {
    console.error("Error fetching companies by status:", error);
    throw error;
  }
};

// İş kolu bazlı firmaları getir
export const getCompaniesByBusinessLine = async (businessLine) => {
  try {
    const companies = await getDocuments(COLLECTION_NAME, {
      where: ["businessLine", "==", businessLine],
      orderBy: ["createdAt", "desc"],
    });
    return companies;
  } catch (error) {
    console.error("Error fetching companies by business line:", error);
    throw error;
  }
};

// Arama yap
export const searchCompanies = async (searchTerm) => {
  try {
    // Firestore'da full-text search olmadığı için tüm firmaları getirip client-side'da filtreleyeceğiz
    const allCompanies = await getAllCompanies();

    if (!searchTerm) return allCompanies;

    const filteredCompanies = allCompanies.filter((company) => {
      const searchFields = [
        company.name,
        company.email,
        company.phone,
        company.contactPerson,
        company.address,
        company.description,
      ];

      return searchFields.some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return filteredCompanies;
  } catch (error) {
    console.error("Error searching companies:", error);
    throw error;
  }
};

// Firma notları güncelle
export const updateCompanyNotes = async (id, notes) => {
  try {
    await updateDocument(COLLECTION_NAME, id, { notes });
    return true;
  } catch (error) {
    console.error("Error updating company notes:", error);
    throw error;
  }
};

// Firma hatırlatıcıları güncelle
export const updateCompanyReminders = async (id, reminders) => {
  try {
    await updateDocument(COLLECTION_NAME, id, { reminders });
    return true;
  } catch (error) {
    console.error("Error updating company reminders:", error);
    throw error;
  }
};

// Son iletişim tarihini güncelle
export const updateLastContact = async (id) => {
  try {
    await updateDocument(COLLECTION_NAME, id, {
      lastContact: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error updating last contact:", error);
    throw error;
  }
};

// Firma hesaplamalarını güncelle
export const updateCompanyPricingCalculations = async (id, calculations) => {
  try {
    await updateDocument(COLLECTION_NAME, id, {
      pricingCalculations: calculations,
    });
    return true;
  } catch (error) {
    console.error("Error updating company pricing calculations:", error);
    throw error;
  }
};

// Firmaya hesaplama ekle
export const addPricingCalculationToCompany = async (
  companyId,
  calculationData
) => {
  try {
    const company = await getDocument(COLLECTION_NAME, companyId);
    const calculations = company.pricingCalculations || [];

    const newCalculation = {
      id: Date.now().toString(),
      ...calculationData,
      addedAt: new Date().toISOString(),
    };

    calculations.push(newCalculation);
    await updateDocument(COLLECTION_NAME, companyId, {
      pricingCalculations: calculations,
    });
    return newCalculation;
  } catch (error) {
    console.error("Error adding pricing calculation to company:", error);
    throw error;
  }
};

// Firmadan hesaplama sil
export const removePricingCalculationFromCompany = async (
  companyId,
  calculationId
) => {
  try {
    const company = await getDocument(COLLECTION_NAME, companyId);
    const calculations = company.pricingCalculations || [];

    const updatedCalculations = calculations.filter(
      (calc) => calc.id !== calculationId
    );
    await updateDocument(COLLECTION_NAME, companyId, {
      pricingCalculations: updatedCalculations,
    });
    return true;
  } catch (error) {
    console.error("Error removing pricing calculation from company:", error);
    throw error;
  }
};

// Birden fazla firmaya aynı hesaplamayı ekle
export const addPricingCalculationToMultipleCompanies = async (
  companyIds,
  calculationData
) => {
  try {
    const results = [];
    
    for (const companyId of companyIds) {
      try {
        const result = await addPricingCalculationToCompany(companyId, calculationData);
        results.push({ companyId, success: true, data: result });
      } catch (error) {
        console.error(`Error adding calculation to company ${companyId}:`, error);
        results.push({ companyId, success: false, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error adding pricing calculation to multiple companies:", error);
    throw error;
  }
};

// Basit firma bilgilerini al (select için)
export const getCompaniesForSelect = async () => {
  try {
    const companies = await getDocuments(COLLECTION_NAME, {
      orderBy: ["name", "asc"],
    });
    return companies.map(company => ({
      id: company.id,
      name: company.name,
      email: company.email,
      status: company.status,
      businessLine: company.businessLine,
    }));
  } catch (error) {
    console.error("Error fetching companies for select:", error);
    throw error;
  }
};

// Belirli hesaplama ID'sine sahip tüm firmaları getir
export const getCompaniesByCalculationId = async (calculationId) => {
  try {
    const allCompanies = await getAllCompanies();
    
    return allCompanies.filter(company => {
      const calculations = company.pricingCalculations || [];
      return calculations.some(calc => calc.calculationId === calculationId);
    });
  } catch (error) {
    console.error("Error fetching companies by calculation ID:", error);
    throw error;
  }
};

// ==========================================
// ŞİRKET EŞLEŞTİRME FONKSİYONLARI
// ==========================================

/**
 * Metin normalizasyonu - karşılaştırma için
 * @param {string} text - Normalleştirilecek metin
 * @returns {string} Normalleştirilmiş metin
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    // Türkçe karakterleri dönüştür
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Özel karakterleri ve fazla boşlukları temizle
    .replace(/[^\w\s@.-]/g, '')
    .replace(/\s+/g, ' ');
};

/**
 * E-posta domain'ini çıkar
 * @param {string} email - E-posta adresi
 * @returns {string} Domain adı
 */
const extractEmailDomain = (email) => {
  if (!email || !email.includes('@')) return '';
  const domain = email.split('@')[1]?.toLowerCase() || '';
  // Yaygın e-posta sağlayıcılarını filtrele
  const commonProviders = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'yandex.com', 'mail.com'];
  if (commonProviders.includes(domain)) return '';
  return domain;
};

// Telefon normalizasyonu merkezi phone-utils modülünden import ediliyor

/**
 * İki metin arasındaki benzerlik skoru hesapla (0-100)
 * Levenshtein mesafesi bazlı
 */
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  
  // Tam içerme kontrolü
  if (s1.includes(s2) || s2.includes(s1)) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    return Math.round((shorter.length / longer.length) * 90);
  }
  
  // Kelime bazlı eşleşme
  const words1 = s1.split(' ').filter(w => w.length > 2);
  const words2 = s2.split(' ').filter(w => w.length > 2);
  
  if (words1.length > 0 && words2.length > 0) {
    let matchCount = 0;
    for (const w1 of words1) {
      for (const w2 of words2) {
        if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
          matchCount++;
          break;
        }
      }
    }
    const wordScore = (matchCount / Math.max(words1.length, words2.length)) * 70;
    if (wordScore > 0) return Math.round(wordScore);
  }
  
  // Levenshtein mesafesi
  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 100;
  if (maxLen > 100) return 0; // Çok uzun metinleri karşılaştırma
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  return Math.round((1 - distance / maxLen) * 100);
};

/**
 * Eşleşme türü sabitleri
 */
export const MATCH_TYPE = {
  EXACT: 'exact',           // Tam eşleşme
  HIGH: 'high',             // Yüksek benzerlik (%80+)
  MEDIUM: 'medium',         // Orta benzerlik (%60-80)
  LOW: 'low',               // Düşük benzerlik (%40-60)
  NONE: 'none',             // Eşleşme yok
};

/**
 * Eşleşme alanı sabitleri
 */
export const MATCH_FIELD = {
  NAME: 'name',
  EMAIL: 'email',
  EMAIL_DOMAIN: 'email_domain',
  PHONE: 'phone',
  CONTACT_PHONE: 'contact_phone',
  CONTACT_EMAIL: 'contact_email',
  TAX_NUMBER: 'tax_number',
  MERSIS_NUMBER: 'mersis_number',
  WEBSITE: 'website',
  ADDRESS: 'address',
  CONTACT_PERSON: 'contact_person',
};

/**
 * Eşleşme sonucu objesi oluştur
 */
const createMatchResult = (company, score, matchedFields, matchType) => ({
  company: {
    id: company.id,
    name: company.name,
    email: company.email,
    phone: company.phone,
    status: company.status,
    businessLine: company.businessLine,
    contactPerson: company.contactPerson,
    contactEmail: company.contactEmail,
    taxNumber: company.taxNumber,
    address: company.address,
  },
  score,
  matchedFields,
  matchType,
});

/**
 * Çoklu kaynak veriden şirket eşleştirmesi yap
 * @param {Object} sourceData - Eşleştirme için kaynak veri
 * @param {Object} options - Opsiyonlar
 * @returns {Promise<Object>} Eşleşme sonuçları
 */
export const findMatchingCompanies = async (sourceData, options = {}) => {
  const {
    minScore = 40,           // Minimum eşleşme skoru
    maxResults = 10,         // Maksimum sonuç sayısı
    strictMode = false,      // Sadece yüksek eşleşmeleri döndür
    includePartialMatches = true, // Kısmi eşleşmeleri dahil et
  } = options;

  try {
    const allCompanies = await getAllCompanies();
    const matches = [];

    // Kaynak veriden eşleştirme alanlarını çıkar
    const sourceFields = {
      name: normalizeText(sourceData.name || sourceData.company || sourceData.companyName || ''),
      email: (sourceData.email || sourceData.contactEmail || '').toLowerCase().trim(),
      phone: normalizePhone(sourceData.phone || sourceData.contactPhone || ''),
      contactPerson: normalizeText(sourceData.contactPerson || sourceData.contactName || sourceData.name || ''),
      taxNumber: (sourceData.taxNumber || '').replace(/\D/g, ''),
      mersisNumber: (sourceData.mersisNumber || '').replace(/\D/g, ''),
      website: normalizeText(sourceData.website || ''),
      address: normalizeText(sourceData.address || ''),
    };
    
    const sourceEmailDomain = extractEmailDomain(sourceFields.email);

    for (const company of allCompanies) {
      const matchedFields = [];
      let totalScore = 0;
      let fieldCount = 0;

      // 1. İsim eşleştirmesi (ağırlık: 30)
      if (sourceFields.name) {
        const companyName = normalizeText(company.name || '');
        if (companyName) {
          const nameScore = calculateSimilarity(sourceFields.name, companyName);
          if (nameScore >= 50) {
            matchedFields.push({ field: MATCH_FIELD.NAME, score: nameScore, sourceValue: sourceFields.name, companyValue: company.name });
            totalScore += nameScore * 0.30;
            fieldCount++;
          }
        }
      }

      // 2. E-posta eşleştirmesi (ağırlık: 25 - tam eşleşme çok güçlü)
      if (sourceFields.email) {
        const companyEmail = (company.email || '').toLowerCase().trim();
        const companyContactEmail = (company.contactEmail || '').toLowerCase().trim();
        
        if (sourceFields.email === companyEmail || sourceFields.email === companyContactEmail) {
          matchedFields.push({ field: MATCH_FIELD.EMAIL, score: 100, sourceValue: sourceFields.email, companyValue: companyEmail || companyContactEmail });
          totalScore += 100 * 0.25;
          fieldCount++;
        }
      }

      // 3. E-posta domain eşleştirmesi (ağırlık: 15)
      if (sourceEmailDomain) {
        const companyEmailDomain = extractEmailDomain(company.email);
        const companyContactEmailDomain = extractEmailDomain(company.contactEmail);
        
        if (sourceEmailDomain === companyEmailDomain || sourceEmailDomain === companyContactEmailDomain) {
          matchedFields.push({ field: MATCH_FIELD.EMAIL_DOMAIN, score: 100, sourceValue: sourceEmailDomain, companyValue: companyEmailDomain || companyContactEmailDomain });
          totalScore += 100 * 0.15;
          fieldCount++;
        }
      }

      // 4. Telefon eşleştirmesi (ağırlık: 20)
      if (sourceFields.phone && sourceFields.phone.length >= 10) {
        const companyPhone = normalizePhone(company.phone);
        const companyContactPhone = normalizePhone(company.contactPhone);
        
        // Son 10 hane karşılaştırması (ülke kodu farklılığı için)
        const sourceLast10 = sourceFields.phone.slice(-10);
        const companyLast10 = companyPhone.slice(-10);
        const contactLast10 = companyContactPhone.slice(-10);
        
        if (sourceLast10 === companyLast10 || sourceLast10 === contactLast10) {
          matchedFields.push({ field: MATCH_FIELD.PHONE, score: 100, sourceValue: sourceFields.phone, companyValue: companyPhone || companyContactPhone });
          totalScore += 100 * 0.20;
          fieldCount++;
        }
      }

      // 5. Vergi numarası eşleştirmesi (ağırlık: 25 - çok güçlü)
      if (sourceFields.taxNumber && sourceFields.taxNumber.length >= 10) {
        const companyTaxNumber = (company.taxNumber || '').replace(/\D/g, '');
        if (sourceFields.taxNumber === companyTaxNumber) {
          matchedFields.push({ field: MATCH_FIELD.TAX_NUMBER, score: 100, sourceValue: sourceFields.taxNumber, companyValue: company.taxNumber });
          totalScore += 100 * 0.25;
          fieldCount++;
        }
      }

      // 6. Mersis numarası eşleştirmesi (ağırlık: 25 - çok güçlü)
      if (sourceFields.mersisNumber && sourceFields.mersisNumber.length >= 16) {
        const companyMersisNumber = (company.mersisNumber || '').replace(/\D/g, '');
        if (sourceFields.mersisNumber === companyMersisNumber) {
          matchedFields.push({ field: MATCH_FIELD.MERSIS_NUMBER, score: 100, sourceValue: sourceFields.mersisNumber, companyValue: company.mersisNumber });
          totalScore += 100 * 0.25;
          fieldCount++;
        }
      }

      // 7. İletişim kişisi eşleştirmesi (ağırlık: 10)
      if (sourceFields.contactPerson) {
        const companyContactPerson = normalizeText(company.contactPerson || '');
        if (companyContactPerson) {
          const personScore = calculateSimilarity(sourceFields.contactPerson, companyContactPerson);
          if (personScore >= 60) {
            matchedFields.push({ field: MATCH_FIELD.CONTACT_PERSON, score: personScore, sourceValue: sourceFields.contactPerson, companyValue: company.contactPerson });
            totalScore += personScore * 0.10;
            fieldCount++;
          }
        }
      }

      // 8. Website eşleştirmesi (ağırlık: 10)
      if (sourceFields.website) {
        const companyWebsite = normalizeText(company.website || '');
        if (companyWebsite) {
          // Domain bazlı karşılaştırma
          const sourceWebDomain = sourceFields.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
          const companyWebDomain = companyWebsite.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
          if (sourceWebDomain === companyWebDomain) {
            matchedFields.push({ field: MATCH_FIELD.WEBSITE, score: 100, sourceValue: sourceFields.website, companyValue: company.website });
            totalScore += 100 * 0.10;
            fieldCount++;
          }
        }
      }

      // Eğer hiç eşleşme yoksa atla
      if (matchedFields.length === 0) continue;

      // Toplam skoru hesapla (normalize et)
      const finalScore = Math.round(totalScore);

      // Minimum skor kontrolü
      if (finalScore < minScore) continue;

      // Strict mode'da sadece yüksek eşleşmeleri al
      if (strictMode && finalScore < 70) continue;

      // Eşleşme türünü belirle
      let matchType = MATCH_TYPE.NONE;
      if (finalScore >= 90) matchType = MATCH_TYPE.EXACT;
      else if (finalScore >= 70) matchType = MATCH_TYPE.HIGH;
      else if (finalScore >= 50) matchType = MATCH_TYPE.MEDIUM;
      else if (finalScore >= minScore) matchType = MATCH_TYPE.LOW;

      matches.push(createMatchResult(company, finalScore, matchedFields, matchType));
    }

    // Skora göre sırala
    matches.sort((a, b) => b.score - a.score);

    // Sonuç limitini uygula
    const limitedMatches = matches.slice(0, maxResults);

    // Sonuç objesi oluştur
    return {
      success: true,
      totalFound: matches.length,
      matches: limitedMatches,
      bestMatch: limitedMatches.length > 0 ? limitedMatches[0] : null,
      hasPerfectMatch: limitedMatches.some(m => m.matchType === MATCH_TYPE.EXACT),
      hasHighMatch: limitedMatches.some(m => m.matchType === MATCH_TYPE.HIGH || m.matchType === MATCH_TYPE.EXACT),
      sourceData: sourceFields,
    };
  } catch (error) {
    console.error("Error finding matching companies:", error);
    return {
      success: false,
      error: error.message,
      matches: [],
      bestMatch: null,
      hasPerfectMatch: false,
      hasHighMatch: false,
    };
  }
};

/**
 * CRM item'ından şirket eşleştirmesi yap
 * @param {Object} crmItem - CRM verisi (contact, quote, request, outlook)
 * @param {Object} options - Opsiyonlar
 * @returns {Promise<Object>} Eşleşme sonuçları
 */
export const findMatchingCompaniesFromCrmItem = async (crmItem, options = {}) => {
  // CRM item'ından eşleştirme verisi oluştur
  const sourceData = {
    name: crmItem.company || crmItem.name || '',
    email: crmItem.email || '',
    phone: crmItem.phone || '',
    contactPerson: crmItem.name || '',
    // Raw data'dan ek alanlar çıkar
    taxNumber: crmItem.raw?.taxNumber || crmItem.raw?.contactInfo?.taxNumber || '',
    mersisNumber: crmItem.raw?.mersisNumber || crmItem.raw?.contactInfo?.mersisNumber || '',
    website: crmItem.raw?.website || '',
    address: crmItem.raw?.address || crmItem.raw?.contactInfo?.address || '',
  };

  return findMatchingCompanies(sourceData, options);
};

/**
 * Eşleşme sonucundan yeni şirket oluşturma verileri hazırla
 * @param {Object} sourceData - Kaynak veri
 * @param {string} businessLine - İş kolu
 * @returns {Object} Şirket oluşturma için hazır veri
 */
export const prepareNewCompanyDataFromSource = (sourceData, businessLine = 'ambalaj') => {
  return {
    name: sourceData.company || sourceData.name || sourceData.companyName || '',
    email: sourceData.email || sourceData.contactEmail || '',
    phone: sourceData.phone || sourceData.contactPhone || '',
    contactPerson: sourceData.contactPerson || sourceData.contactName || sourceData.name || '',
    contactEmail: sourceData.email || '',
    contactPhone: sourceData.phone || '',
    address: sourceData.address || '',
    website: sourceData.website || '',
    taxNumber: sourceData.taxNumber || '',
    mersisNumber: sourceData.mersisNumber || '',
    status: 'lead',
    priority: 'medium',
    businessLine: businessLine,
    description: `CRM'den oluşturuldu. Kaynak: ${sourceData.source || 'Bilinmiyor'}`,
  };
};

/**
 * CRM item'ından yeni şirket oluştur
 * @param {Object} crmItem - CRM verisi
 * @param {Object} additionalData - Ek veri
 * @returns {Promise<Object>} Oluşturulan şirket ID'si ve bilgileri
 */
export const createCompanyFromCrmItem = async (crmItem, additionalData = {}) => {
  try {
    const baseData = prepareNewCompanyDataFromSource({
      company: crmItem.company || '',
      name: crmItem.name || '',
      email: crmItem.email || '',
      phone: crmItem.phone || '',
      address: crmItem.raw?.address || '',
      website: crmItem.raw?.website || '',
      taxNumber: crmItem.raw?.taxNumber || '',
      mersisNumber: crmItem.raw?.mersisNumber || '',
      source: crmItem.source || crmItem.type || '',
    }, additionalData.businessLine || 'ambalaj');

    const companyData = {
      ...baseData,
      ...additionalData,
      // Meta bilgiler
      createdFromCrm: true,
      crmItemId: crmItem.originalId || crmItem.id,
      crmItemType: crmItem.type,
    };

    const companyId = await createCompany(companyData);

    return {
      success: true,
      companyId,
      companyData,
    };
  } catch (error) {
    console.error("Error creating company from CRM item:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
