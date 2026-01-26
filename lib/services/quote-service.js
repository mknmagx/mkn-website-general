import { addDocument } from "../firestore";
import { serverTimestamp } from "firebase/firestore";
import { createConversation } from "./crm-v2/conversation-service";
import { CHANNEL } from "./crm-v2/schema";

/**
 * Fason üretim teklif talebini Firestore'a kaydeder
 * @param {Object} formData - Form verisi
 * @returns {Promise<string>} - Oluşturulan dökümanın ID'si
 */
export const submitQuoteRequest = async (formData) => {
  try {
    // Processing quote form data
    
    // Form verisini temizle ve yapılandır
    const quoteData = {
      // Kişi Bilgileri
      contactInfo: {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        email: formData.email?.trim().toLowerCase(),
        phone: formData.phone?.trim(),
        company: formData.company?.trim(),
        position: formData.position?.trim() || null,
      },

      // Proje Bilgileri
      projectInfo: {
        serviceArea: formData.serviceArea,
        serviceSubcategory: formData.serviceSubcategory || null,
        productCategory: formData.productCategory || null,
        projectName: formData.projectName?.trim(),
        projectDescription: formData.projectDescription?.trim(),
        targetMarket: formData.targetMarket || null,
      },

      // Teknik Bilgiler
      technicalInfo: {
        existingFormula: formData.existingFormula,
        formulaDetails: formData.formulaDetails?.trim() || null,
        packagingType: formData.packagingType || [],
        packagingSize: formData.packagingSize?.trim() || null,
        productVolume: formData.productVolume,
        
        // Fason Üretim Alanları
        productType: formData.productType || null,
        consistency: formData.consistency || null,
        ingredients: formData.ingredients?.trim() || null,
        regulatoryRequirements: formData.regulatoryRequirements || [],
        shelfLife: formData.shelfLife || null,
        
        // Ambalaj Alanları
        ambalajType: formData.ambalajType || null,
        ambalajMaterial: formData.ambalajMaterial || null,
        printingRequirements: formData.printingRequirements?.trim() || null,
        quantity: formData.quantity || null,
        
        // E-ticaret Operasyon Alanları
        currentOrderVolume: formData.currentOrderVolume || null,
        warehouseNeeds: formData.warehouseNeeds?.trim() || null,
        integrationNeeds: formData.integrationNeeds || [],
        customerServiceNeeds: formData.customerServiceNeeds?.trim() || null,
        
        // Dijital Pazarlama Alanları
        brandStage: formData.brandStage || null,
        targetAudience: formData.targetAudience?.trim() || null,
        marketingGoals: formData.marketingGoals || [],
        campaignBudget: formData.campaignBudget || null,
        contentNeeds: formData.contentNeeds || [],
        
        certificates: formData.certificates || [],
        timeline: formData.timeline || null,
        budget: formData.budget || null,
        specialRequirements: formData.specialRequirements?.trim() || null,
      },

      // Ek Bilgiler
      additionalInfo: {
        previousExperience: formData.previousExperience?.trim() || null,
        additionalServices: formData.additionalServices || [],
        notes: formData.notes?.trim() || null,
      },

      // Meta Bilgiler
      metadata: {
        status: 'pending', // pending, in-review, quoted, completed, cancelled
        priority: 'normal', // low, normal, high, urgent
        source: 'website',
        submissionDate: serverTimestamp(),
        ipAddress: null, // Bu client-side'da alınamaz, server-side'da eklenebilir
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      },

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Prepared quote data for Firestore

    // Firestore'a kaydet
    const docId = await addDocument('quotes', quoteData);
    
    // =========================================================================
    // 🔄 CRM v2 ENTEGRASYONU - Otomatik conversation oluştur
    // Bu sayede sync beklemeden direkt CRM'de görünür ve çift kayıt önlenir
    // =========================================================================
    try {
      const firstName = formData.firstName?.trim() || '';
      const lastName = formData.lastName?.trim() || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'İsimsiz';
      
      const projectName = formData.projectName?.trim() || '';
      const serviceArea = formData.serviceArea || '';
      const serviceSubcategory = formData.serviceSubcategory || '';
      const subject = projectName || 
                      (serviceArea && serviceSubcategory ? `${serviceArea} - ${serviceSubcategory}` : '') ||
                      'Teklif Talebi';
      
      await createConversation({
        name: fullName,
        email: formData.email?.trim().toLowerCase() || '',
        phone: formData.phone?.trim() || '',
        company: formData.company?.trim() || '',
        channel: CHANNEL.QUOTE_FORM,
        subject: subject,
        message: formData.projectDescription?.trim() || formData.notes?.trim() || '',
        sourceRef: { type: 'quote', id: docId }, // ⚠️ Bu ID ile sync duplicate engelleyecek
        channelMetadata: {
          legacySystem: 'quotes',
          serviceArea: serviceArea,
          serviceSubcategory: serviceSubcategory,
          targetMarket: formData.targetMarket || null,
          budget: formData.budget || null,
          timeline: formData.timeline || null,
          syncedAt: new Date().toISOString(),
          directWrite: true, // Direkt yazıldığını işaretle (debug için)
        },
      });
      console.log(`[Quote] CRM v2 conversation created for quote: ${docId}`);
    } catch (crmError) {
      // CRM hatası quote oluşturmayı engellemez, sadece log'la
      console.error(`[Quote] CRM v2 conversation creation failed for ${docId}:`, crmError);
    }
    
    return {
      success: true,
      docId,
      message: 'Teklif talebiniz başarıyla gönderildi!'
    };

  } catch (error) {
    console.error('Quote submission error:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Teklif talebiniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
    };
  }
};

/**
 * E-posta adresinin geçerliliğini kontrol eder
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Telefon numarasının geçerliliğini kontrol eder (Türkiye formatı)
 * @param {string} phone 
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  // Türkiye telefon numarası formatları: +90, 0, 5xx
  const phoneRegex = /^(\+90|0)?([5]\d{2})(\d{3})(\d{2})(\d{2})$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * Form verilerinin geçerliliğini kontrol eder
 * @param {Object} formData 
 * @returns {Object} validation result
 */
export const validateQuoteForm = (formData) => {
  const errors = {};
  
  // Validating form data

  // Kişi Bilgileri Validasyonu
  if (!formData.firstName?.trim()) {
    errors.firstName = 'Ad zorunludur';
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = 'Soyad zorunludur';
  }

  if (!formData.email?.trim()) {
    errors.email = 'E-posta zorunludur';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Geçerli bir e-posta adresi girin';
  }

  if (!formData.phone?.trim()) {
    errors.phone = 'Telefon numarası zorunludur';
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Geçerli bir telefon numarası girin';
  }

  if (!formData.company?.trim()) {
    errors.company = 'Firma adı zorunludur';
  }

  // Proje Bilgileri Validasyonu - YENİ ALAN ADLARI
  if (!formData.serviceArea) {
    errors.serviceArea = 'Hizmet alanı seçimi zorunludur';
  }

  if (!formData.projectName?.trim()) {
    errors.projectName = 'Proje adı zorunludur';
  }

  if (!formData.projectDescription?.trim()) {
    errors.projectDescription = 'Proje açıklaması zorunludur';
  } else if (formData.projectDescription.trim().length < 20) {
    errors.projectDescription = 'Proje açıklaması en az 20 karakter olmalıdır';
  }

  // Hizmet alanına göre özel validasyonlar
  if (formData.serviceArea === "fason-uretim") {
    if (!formData.existingFormula) {
      errors.existingFormula = 'Formül durumu belirtilmelidir';
    }
  } else if (formData.serviceArea === "ambalaj") {
    if (!formData.ambalajType) {
      errors.ambalajType = 'Ambalaj tipi seçimi zorunludur';
    }
    if (!formData.quantity) {
      errors.quantity = 'Miktar seçimi zorunludur';
    }
  } else if (formData.serviceArea === "eticaret-operasyon") {
    if (!formData.currentOrderVolume) {
      errors.currentOrderVolume = 'Sipariş hacmi belirtilmelidir';
    }
  } else if (formData.serviceArea === "dijital-pazarlama") {
    if (!formData.brandStage) {
      errors.brandStage = 'Marka durumu belirtilmelidir';
    }
  }

  // Validation completed

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Form verilerini submit etmeden önce son kontrol yapar
 * @param {Object} formData 
 * @returns {Object}
 */
export const validateAndSubmitQuote = async (formData) => {
  // Form validasyonu
  const validation = validateQuoteForm(formData);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      message: 'Lütfen tüm zorunlu alanları doldurun'
    };
  }

  // Firestore'a gönder
  return await submitQuoteRequest(formData);
};
