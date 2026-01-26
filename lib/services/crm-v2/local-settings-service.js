/**
 * CRM v2 Local Settings Service
 * 
 * localStorage tabanlı yerel ayarlar yönetimi.
 * Firebase'e yazılmadan tarayıcıda saklanır.
 * 
 * Kullanım alanları:
 * - Dosya boyutu limitleri
 * - UI tercihleri
 * - Performans ayarları
 */

const LOCAL_SETTINGS_KEY = 'crm-v2-local-settings';

// Varsayılan yerel ayarlar
export const DEFAULT_LOCAL_SETTINGS = {
  // Dosya yükleme ayarları
  fileUpload: {
    maxFileSizeMB: 500, // MB cinsinden maksimum dosya boyutu
    maxTotalSizeMB: 2000, // Tek seferde toplam yükleme limiti (MB)
    allowedFileTypes: '*', // '*' = tüm dosyalar, veya 'image/*,application/pdf' gibi
    compressImages: false, // Görsel sıkıştırma (ileride)
  },
  
  // Performans ayarları
  performance: {
    lazyLoadImages: true,
    preloadAttachments: false,
    cacheConversations: true,
  },
  
  // UI tercihleri
  ui: {
    showFileSizeWarning: true, // Büyük dosyalarda uyarı göster
    confirmLargeUploads: true, // 100MB üstü yüklemelerde onay iste
    largeUploadThresholdMB: 100,
  },
};

/**
 * localStorage'dan ayarları yükle
 * @returns {object} Yerel ayarlar
 */
export const getLocalSettings = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCAL_SETTINGS;
  }
  
  try {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!saved) {
      return DEFAULT_LOCAL_SETTINGS;
    }
    
    const parsed = JSON.parse(saved);
    // Deep merge with defaults to handle new settings
    return deepMerge(DEFAULT_LOCAL_SETTINGS, parsed);
  } catch (error) {
    console.error('[LocalSettings] Load error:', error);
    return DEFAULT_LOCAL_SETTINGS;
  }
};

/**
 * localStorage'a ayarları kaydet
 * @param {object} settings - Kaydedilecek ayarlar (partial ok)
 * @returns {object} Güncellenmiş tam ayarlar
 */
export const saveLocalSettings = (settings) => {
  if (typeof window === 'undefined') {
    console.warn('[LocalSettings] Cannot save - not in browser');
    return DEFAULT_LOCAL_SETTINGS;
  }
  
  try {
    const current = getLocalSettings();
    const updated = deepMerge(current, settings);
    
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
    console.log('[LocalSettings] Saved:', updated);
    
    return updated;
  } catch (error) {
    console.error('[LocalSettings] Save error:', error);
    throw error;
  }
};

/**
 * Belirli bir ayar grubunu güncelle
 * @param {string} group - Ayar grubu (fileUpload, performance, ui)
 * @param {object} groupSettings - Grup ayarları
 */
export const updateLocalSettingsGroup = (group, groupSettings) => {
  const current = getLocalSettings();
  current[group] = { ...current[group], ...groupSettings };
  return saveLocalSettings(current);
};

/**
 * Dosya yükleme ayarlarını al
 */
export const getFileUploadSettings = () => {
  const settings = getLocalSettings();
  return settings.fileUpload || DEFAULT_LOCAL_SETTINGS.fileUpload;
};

/**
 * Dosya yükleme ayarlarını güncelle
 * @param {object} fileSettings - Dosya ayarları
 */
export const updateFileUploadSettings = (fileSettings) => {
  return updateLocalSettingsGroup('fileUpload', fileSettings);
};

/**
 * Maksimum dosya boyutunu al (bytes cinsinden)
 */
export const getMaxFileSizeBytes = () => {
  const settings = getFileUploadSettings();
  return (settings.maxFileSizeMB || DEFAULT_LOCAL_SETTINGS.fileUpload.maxFileSizeMB) * 1024 * 1024;
};

/**
 * Maksimum dosya boyutunu al (MB cinsinden)
 */
export const getMaxFileSizeMB = () => {
  const settings = getFileUploadSettings();
  return settings.maxFileSizeMB || DEFAULT_LOCAL_SETTINGS.fileUpload.maxFileSizeMB;
};

/**
 * Dosya boyutu kontrolü
 * @param {number} sizeBytes - Dosya boyutu (bytes)
 * @returns {object} { valid: boolean, message?: string }
 */
export const validateFileSize = (sizeBytes) => {
  const maxBytes = getMaxFileSizeBytes();
  const maxMB = getMaxFileSizeMB();
  
  if (sizeBytes > maxBytes) {
    return {
      valid: false,
      message: `Dosya boyutu ${maxMB}MB limitini aşıyor.`,
      maxMB,
      actualMB: Math.round(sizeBytes / 1024 / 1024 * 10) / 10,
    };
  }
  
  return { valid: true };
};

/**
 * Büyük yükleme uyarısı gerekiyor mu?
 * @param {number} sizeBytes - Dosya boyutu (bytes)
 */
export const needsLargeUploadConfirmation = (sizeBytes) => {
  const settings = getLocalSettings();
  const ui = settings.ui || DEFAULT_LOCAL_SETTINGS.ui;
  
  if (!ui.confirmLargeUploads) return false;
  
  const thresholdBytes = (ui.largeUploadThresholdMB || 100) * 1024 * 1024;
  return sizeBytes > thresholdBytes;
};

/**
 * Ayarları varsayılanlara sıfırla
 */
export const resetLocalSettings = () => {
  if (typeof window === 'undefined') return DEFAULT_LOCAL_SETTINGS;
  
  try {
    localStorage.removeItem(LOCAL_SETTINGS_KEY);
    console.log('[LocalSettings] Reset to defaults');
    return DEFAULT_LOCAL_SETTINGS;
  } catch (error) {
    console.error('[LocalSettings] Reset error:', error);
    return DEFAULT_LOCAL_SETTINGS;
  }
};

/**
 * Derin merge fonksiyonu
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Boyut formatlama helper'ı
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
