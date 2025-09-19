import { addDocument } from "../firestore";
import { serverTimestamp } from "firebase/firestore";

/**
 * İletişim formunu Firestore'a kaydeder
 * @param {Object} formData - Form verisi
 * @returns {Promise<Object>} - Submit sonucu
 */
export const submitContactForm = async (formData) => {
  try {
    // Form verisini temizle ve yapılandır
    const contactData = {
      // İletişim Bilgileri
      contactInfo: {
        name: formData.name?.trim(),
        email: formData.email?.trim().toLowerCase(),
        phone: formData.phone?.trim(),
        company: formData.company?.trim() || null,
      },

      // Talep Bilgileri
      requestInfo: {
        service: formData.service || null,
        product: formData.product?.trim() || null,
        message: formData.message?.trim(),
      },

      // Meta Bilgiler
      metadata: {
        status: 'new', // new, in-progress, responded, closed
        priority: 'normal', // low, normal, high, urgent
        source: 'website-contact',
        submissionDate: serverTimestamp(),
        ipAddress: null, // Bu client-side'da alınamaz, server-side'da eklenebilir
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        responseRequired: true,
      },

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Firestore'a kaydet
    const docId = await addDocument('contact-messages', contactData);
    
    return {
      success: true,
      docId,
      message: 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.'
    };

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
  if (!phone || phone.trim() === '') return true; // Phone is optional
  
  // Türkiye telefon numarası formatları: +90, 0, 5xx
  const phoneRegex = /^(\+90|0)?([5]\d{2})(\d{3})(\d{2})(\d{2})$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * İletişim form verilerinin geçerliliğini kontrol eder
 * @param {Object} formData 
 * @returns {Object} validation result
 */
export const validateContactForm = (formData) => {
  const errors = {};

  // İsim kontrolü
  if (!formData.name?.trim()) {
    errors.name = 'Ad Soyad zorunludur';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Ad Soyad en az 2 karakter olmalıdır';
  }

  // E-posta kontrolü
  if (!formData.email?.trim()) {
    errors.email = 'E-posta zorunludur';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Geçerli bir e-posta adresi girin';
  }

  // Telefon kontrolü (opsiyonel ama geçerli olmalı)
  if (formData.phone?.trim() && !validatePhone(formData.phone)) {
    errors.phone = 'Geçerli bir telefon numarası girin';
  }

  // Mesaj kontrolü
  if (!formData.message?.trim()) {
    errors.message = 'Mesaj zorunludur';
  } else if (formData.message.trim().length < 10) {
    errors.message = 'Mesaj en az 10 karakter olmalıdır';
  } else if (formData.message.trim().length > 2000) {
    errors.message = 'Mesaj en fazla 2000 karakter olabilir';
  }

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
export const validateAndSubmitContact = async (formData) => {
  // Form validasyonu
  const validation = validateContactForm(formData);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      message: 'Lütfen tüm zorunlu alanları doğru şekilde doldurun'
    };
  }

  // Firestore'a gönder
  return await submitContactForm(formData);
};
