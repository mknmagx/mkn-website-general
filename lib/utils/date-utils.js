/**
 * Date Utilities
 * Firestore timestamp'lerini ve diğer tarih formatlarını işlemek için yardımcı fonksiyonlar
 */

import { format, isValid, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import logger from './logger';

/**
 * Firestore timestamp'ini veya herhangi bir tarih değerini Date object'e çevirir
 * @param {any} dateValue - Firestore timestamp, ISO string, Date object, vs.
 * @returns {Date|null} Date object veya null
 */
export function parseFirestoreDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    // Firestore timestamp kontrolü
    if (dateValue && typeof dateValue === 'object') {
      // Firestore Admin SDK timestamp format: {_seconds: number, _nanoseconds: number}
      if (dateValue._seconds !== undefined) {
        return new Date(dateValue._seconds * 1000);
      }
      
      // Firestore Client SDK timestamp format: {seconds: number, nanoseconds: number}
      if (dateValue.seconds !== undefined) {
        return new Date(dateValue.seconds * 1000);
      }
      
      // Firestore Timestamp object with toDate() method
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
      }
      
      // Regular Date object
      if (dateValue instanceof Date) {
        return isValid(dateValue) ? dateValue : null;
      }
    }
    
    // ISO string veya number timestamp
    if (typeof dateValue === 'string') {
      const parsed = parseISO(dateValue);
      return isValid(parsed) ? parsed : new Date(dateValue);
    }
    
    if (typeof dateValue === 'number') {
      const date = new Date(dateValue);
      return isValid(date) ? date : null;
    }
    
    // Son çare - direkt Date constructor'a ver
    const date = new Date(dateValue);
    return isValid(date) ? date : null;
    
  } catch (error) {
    logger.warn('Date parsing error:', { error: error.message, value: dateValue });
    return null;
  }
}

/**
 * Tarih değerini Türkçe formatta formatlar
 * @param {any} dateValue - Firestore timestamp, ISO string, Date object, vs.
 * @param {string} formatPattern - date-fns format pattern (varsayılan: 'dd MMM yyyy HH:mm')
 * @returns {string} Formatlanmış tarih string'i
 */
export function formatDate(dateValue, formatPattern = 'dd MMM yyyy HH:mm') {
  if (!dateValue) return 'Henüz senkronize edilmedi';
  
  const date = parseFirestoreDate(dateValue);
  if (!date) return 'Geçersiz tarih';
  
  try {
    return format(date, formatPattern, { locale: tr });
  } catch (error) {
    logger.warn('Date formatting error:', { error: error.message, date, formatPattern });
    return 'Tarih formatı hatası';
  }
}

/**
 * Tarih değerini kısa formatta formatlar (örn: "7 Kas 2025")
 * @param {any} dateValue - Firestore timestamp, ISO string, Date object, vs.
 * @returns {string} Kısa formatlanmış tarih string'i
 */
export function formatDateShort(dateValue) {
  return formatDate(dateValue, 'dd MMM yyyy');
}

/**
 * Tarih değerini uzun formatta formatlar (örn: "7 Kasım 2025, 17:30")
 * @param {any} dateValue - Firestore timestamp, ISO string, Date object, vs.
 * @returns {string} Uzun formatlanmış tarih string'i
 */
export function formatDateLong(dateValue) {
  return formatDate(dateValue, 'dd MMMM yyyy, HH:mm');
}

/**
 * İki tarih arasındaki farkı hesaplar ve Türkçe açıklama döner
 * @param {any} dateValue - Firestore timestamp, ISO string, Date object, vs.
 * @returns {string} Göreceli zaman açıklaması
 */
export function formatRelativeTime(dateValue) {
  const date = parseFirestoreDate(dateValue);
  if (!date) return 'Bilinmeyen tarih';
  
  const now = new Date();
  const diffInMilliseconds = now - date;
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) {
    return 'Az önce';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  } else if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  } else if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  } else {
    return formatDateShort(dateValue);
  }
}

/**
 * Firestore'a kaydetmek için geçerli timestamp oluşturur
 * @returns {Date} Şu anki tarih
 */
export function createTimestamp() {
  return new Date();
}

/**
 * Tarih değerinin geçerli olup olmadığını kontrol eder
 * @param {any} dateValue - Kontrol edilecek tarih değeri
 * @returns {boolean} Geçerli ise true
 */
export function isValidDate(dateValue) {
  const date = parseFirestoreDate(dateValue);
  return date !== null && isValid(date);
}

/**
 * Basit para birimi formatlayıcı
 * @param {number|string|null|undefined} amount - Gösterilecek miktar
 * @param {string} currency - ISO para birimi kodu (varsayılan: TRY)
 * @returns {string} Formatlanmış para string'i
 */
export function formatCurrency(amount, currency = 'TRY') {
  // Eğer amount null, undefined veya NaN ise 0 kullan
  const numericAmount = amount == null || isNaN(amount) ? 0 : parseFloat(amount);

  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(numericAmount);
  } catch (error) {
    // Fallback: basit string dönüşü
    logger.warn('Currency formatting error:', { error: error.message, amount, currency });
    return `${numericAmount.toFixed(2)} ${currency}`;
  }
}