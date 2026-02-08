/**
 * Merkezi Telefon Numarası İşleme Modülü
 * 
 * Bu modül, sistemdeki tüm telefon numarası işlemlerini standartlaştırır.
 * 
 * ⚠️ KURAL: Veritabanına kaydedilen tüm telefon numaraları normalizePhone() 
 * fonksiyonundan geçirilmelidir!
 * 
 * DB Formatı: "905365923035" (sadece rakamlar, ülke kodu dahil)
 * Display Formatı: "+90 536 592 30 35" (okunabilir format)
 */

// =============================================================================
// ÜLKE KODLARI VERİTABANI
// =============================================================================

/**
 * Desteklenen ülke kodları ve bilgileri
 * Öncelik sırasına göre sıralanmış (uzun kodlar önce)
 */
export const COUNTRY_CODES = {
  // Türkiye
  '90': { 
    name: 'Türkiye', 
    code: 'TR', 
    mobilePrefix: ['5'], 
    minLength: 10, 
    maxLength: 10,
    format: '+## ### ### ## ##'
  },
  
  // Avrupa
  '49': { name: 'Almanya', code: 'DE', mobilePrefix: ['15', '16', '17'], minLength: 10, maxLength: 11 },
  '44': { name: 'İngiltere', code: 'GB', mobilePrefix: ['7'], minLength: 10, maxLength: 10 },
  '33': { name: 'Fransa', code: 'FR', mobilePrefix: ['6', '7'], minLength: 9, maxLength: 9 },
  '39': { name: 'İtalya', code: 'IT', mobilePrefix: ['3'], minLength: 9, maxLength: 10 },
  '34': { name: 'İspanya', code: 'ES', mobilePrefix: ['6', '7'], minLength: 9, maxLength: 9 },
  '31': { name: 'Hollanda', code: 'NL', mobilePrefix: ['6'], minLength: 9, maxLength: 9 },
  '32': { name: 'Belçika', code: 'BE', mobilePrefix: ['4'], minLength: 9, maxLength: 9 },
  '43': { name: 'Avusturya', code: 'AT', mobilePrefix: ['6'], minLength: 10, maxLength: 13 },
  '41': { name: 'İsviçre', code: 'CH', mobilePrefix: ['7'], minLength: 9, maxLength: 9 },
  '48': { name: 'Polonya', code: 'PL', mobilePrefix: ['5', '6', '7', '8'], minLength: 9, maxLength: 9 },
  '46': { name: 'İsveç', code: 'SE', mobilePrefix: ['7'], minLength: 9, maxLength: 9 },
  '47': { name: 'Norveç', code: 'NO', mobilePrefix: ['4', '9'], minLength: 8, maxLength: 8 },
  '45': { name: 'Danimarka', code: 'DK', mobilePrefix: ['2', '3', '4', '5', '6', '7', '8', '9'], minLength: 8, maxLength: 8 },
  '358': { name: 'Finlandiya', code: 'FI', mobilePrefix: ['4', '5'], minLength: 9, maxLength: 10 },
  '30': { name: 'Yunanistan', code: 'GR', mobilePrefix: ['6'], minLength: 10, maxLength: 10 },
  '351': { name: 'Portekiz', code: 'PT', mobilePrefix: ['9'], minLength: 9, maxLength: 9 },
  '420': { name: 'Çekya', code: 'CZ', mobilePrefix: ['6', '7'], minLength: 9, maxLength: 9 },
  '36': { name: 'Macaristan', code: 'HU', mobilePrefix: ['2', '3', '7'], minLength: 9, maxLength: 9 },
  '40': { name: 'Romanya', code: 'RO', mobilePrefix: ['7'], minLength: 9, maxLength: 9 },
  '359': { name: 'Bulgaristan', code: 'BG', mobilePrefix: ['8', '9'], minLength: 8, maxLength: 9 },
  '380': { name: 'Ukrayna', code: 'UA', mobilePrefix: ['5', '6', '7', '9'], minLength: 9, maxLength: 9 },
  '7': { name: 'Rusya', code: 'RU', mobilePrefix: ['9'], minLength: 10, maxLength: 10 },
  
  // Orta Doğu
  '971': { name: 'BAE', code: 'AE', mobilePrefix: ['5'], minLength: 9, maxLength: 9 },
  '966': { name: 'Suudi Arabistan', code: 'SA', mobilePrefix: ['5'], minLength: 9, maxLength: 9 },
  '974': { name: 'Katar', code: 'QA', mobilePrefix: ['3', '5', '6', '7'], minLength: 8, maxLength: 8 },
  '973': { name: 'Bahreyn', code: 'BH', mobilePrefix: ['3', '6'], minLength: 8, maxLength: 8 },
  '965': { name: 'Kuveyt', code: 'KW', mobilePrefix: ['5', '6', '9'], minLength: 8, maxLength: 8 },
  '968': { name: 'Umman', code: 'OM', mobilePrefix: ['9'], minLength: 8, maxLength: 8 },
  '962': { name: 'Ürdün', code: 'JO', mobilePrefix: ['7'], minLength: 9, maxLength: 9 },
  '961': { name: 'Lübnan', code: 'LB', mobilePrefix: ['3', '7', '8'], minLength: 7, maxLength: 8 },
  '972': { name: 'İsrail', code: 'IL', mobilePrefix: ['5'], minLength: 9, maxLength: 9 },
  '98': { name: 'İran', code: 'IR', mobilePrefix: ['9'], minLength: 10, maxLength: 10 },
  '964': { name: 'Irak', code: 'IQ', mobilePrefix: ['7'], minLength: 10, maxLength: 10 },
  '963': { name: 'Suriye', code: 'SY', mobilePrefix: ['9'], minLength: 9, maxLength: 9 },
  
  // Asya
  '86': { name: 'Çin', code: 'CN', mobilePrefix: ['1'], minLength: 11, maxLength: 11 },
  '91': { name: 'Hindistan', code: 'IN', mobilePrefix: ['6', '7', '8', '9'], minLength: 10, maxLength: 10 },
  '81': { name: 'Japonya', code: 'JP', mobilePrefix: ['7', '8', '9'], minLength: 10, maxLength: 10 },
  '82': { name: 'Güney Kore', code: 'KR', mobilePrefix: ['1'], minLength: 9, maxLength: 10 },
  '84': { name: 'Vietnam', code: 'VN', mobilePrefix: ['3', '5', '7', '8', '9'], minLength: 9, maxLength: 10 },
  '66': { name: 'Tayland', code: 'TH', mobilePrefix: ['6', '8', '9'], minLength: 9, maxLength: 9 },
  '60': { name: 'Malezya', code: 'MY', mobilePrefix: ['1'], minLength: 9, maxLength: 10 },
  '65': { name: 'Singapur', code: 'SG', mobilePrefix: ['8', '9'], minLength: 8, maxLength: 8 },
  '62': { name: 'Endonezya', code: 'ID', mobilePrefix: ['8'], minLength: 10, maxLength: 12 },
  '63': { name: 'Filipinler', code: 'PH', mobilePrefix: ['9'], minLength: 10, maxLength: 10 },
  '92': { name: 'Pakistan', code: 'PK', mobilePrefix: ['3'], minLength: 10, maxLength: 10 },
  '880': { name: 'Bangladeş', code: 'BD', mobilePrefix: ['1'], minLength: 10, maxLength: 10 },
  '994': { name: 'Azerbaycan', code: 'AZ', mobilePrefix: ['5', '7'], minLength: 9, maxLength: 9 },
  '995': { name: 'Gürcistan', code: 'GE', mobilePrefix: ['5'], minLength: 9, maxLength: 9 },
  '996': { name: 'Kırgızistan', code: 'KG', mobilePrefix: ['5', '7'], minLength: 9, maxLength: 9 },
  '998': { name: 'Özbekistan', code: 'UZ', mobilePrefix: ['9'], minLength: 9, maxLength: 9 },
  '993': { name: 'Türkmenistan', code: 'TM', mobilePrefix: ['6'], minLength: 8, maxLength: 8 },
  '7': { name: 'Kazakistan', code: 'KZ', mobilePrefix: ['7'], minLength: 10, maxLength: 10 }, // 7 ile başlayan Kazak numaraları
  
  // Amerika
  '1': { name: 'ABD/Kanada', code: 'US', mobilePrefix: ['2', '3', '4', '5', '6', '7', '8', '9'], minLength: 10, maxLength: 10 },
  '52': { name: 'Meksika', code: 'MX', mobilePrefix: ['1'], minLength: 10, maxLength: 10 },
  '55': { name: 'Brezilya', code: 'BR', mobilePrefix: ['9'], minLength: 10, maxLength: 11 },
  '54': { name: 'Arjantin', code: 'AR', mobilePrefix: ['9'], minLength: 10, maxLength: 11 },
  '57': { name: 'Kolombiya', code: 'CO', mobilePrefix: ['3'], minLength: 10, maxLength: 10 },
  '56': { name: 'Şili', code: 'CL', mobilePrefix: ['9'], minLength: 9, maxLength: 9 },
  '51': { name: 'Peru', code: 'PE', mobilePrefix: ['9'], minLength: 9, maxLength: 9 },
  '58': { name: 'Venezuela', code: 'VE', mobilePrefix: ['4'], minLength: 10, maxLength: 10 },
  
  // Afrika
  '20': { name: 'Mısır', code: 'EG', mobilePrefix: ['1'], minLength: 10, maxLength: 10 },
  '27': { name: 'Güney Afrika', code: 'ZA', mobilePrefix: ['6', '7', '8'], minLength: 9, maxLength: 9 },
  '234': { name: 'Nijerya', code: 'NG', mobilePrefix: ['7', '8', '9'], minLength: 10, maxLength: 10 },
  '212': { name: 'Fas', code: 'MA', mobilePrefix: ['6', '7'], minLength: 9, maxLength: 9 },
  '213': { name: 'Cezayir', code: 'DZ', mobilePrefix: ['5', '6', '7'], minLength: 9, maxLength: 9 },
  '216': { name: 'Tunus', code: 'TN', mobilePrefix: ['2', '5', '9'], minLength: 8, maxLength: 8 },
  '218': { name: 'Libya', code: 'LY', mobilePrefix: ['9'], minLength: 9, maxLength: 9 },
  '254': { name: 'Kenya', code: 'KE', mobilePrefix: ['7'], minLength: 9, maxLength: 9 },
  
  // Okyanusya
  '61': { name: 'Avustralya', code: 'AU', mobilePrefix: ['4'], minLength: 9, maxLength: 9 },
  '64': { name: 'Yeni Zelanda', code: 'NZ', mobilePrefix: ['2'], minLength: 8, maxLength: 10 },
};

// Ülke kodlarını uzunluğa göre sırala (uzun olanlar önce - daha spesifik eşleştirme için)
const SORTED_COUNTRY_CODES = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);

// =============================================================================
// ANA FONKSİYONLAR
// =============================================================================

/**
 * Telefon numarasını normalize et (DB formatı)
 * 
 * Bu fonksiyon TÜM telefon numarası kayıtlarında kullanılmalıdır!
 * 
 * @param {string} phone - Ham telefon numarası (herhangi bir format)
 * @param {string} defaultCountryCode - Varsayılan ülke kodu (default: '90')
 * @returns {string} Normalize edilmiş numara (sadece rakamlar, ülke kodu dahil)
 * 
 * @example
 * normalizePhone('+90 536 592 30 35') // '905365923035'
 * normalizePhone('0536 592 30 35')    // '905365923035'
 * normalizePhone('5365923035')        // '905365923035'
 * normalizePhone('+1 234 567 8900')   // '12345678900'
 * normalizePhone('00491234567890')    // '491234567890'
 */
export const normalizePhone = (phone, defaultCountryCode = '90') => {
  if (!phone) return '';
  
  // String'e çevir
  let digits = String(phone).trim();
  
  // Özel karakterleri temizle ama önce bazı kontroller yap
  const hasPlus = digits.startsWith('+');
  const hasDoubleZero = digits.startsWith('00');
  
  // Tüm rakam olmayan karakterleri kaldır
  digits = digits.replace(/\D/g, '');
  
  if (!digits) return '';
  
  // Çok kısa numaralar (5 haneden az) - geçersiz
  if (digits.length < 5) {
    console.warn(`[Phone Utils] Çok kısa numara: ${phone} -> ${digits}`);
    return digits;
  }
  
  // 00 ile başlayan uluslararası format (00 kaldır)
  if (hasDoubleZero && digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  
  // + ile başlıyorsa zaten ülke kodu var demektir
  if (hasPlus) {
    // Ülke kodunu doğrula
    const countryInfo = detectCountryCode(digits);
    if (countryInfo) {
      return digits; // Zaten doğru formatta
    }
  }
  
  // Ülke kodu kontrolü
  const countryInfo = detectCountryCode(digits);
  
  if (countryInfo) {
    // Ülke kodu mevcut
    return digits;
  }
  
  // Türkiye için özel işlem
  if (defaultCountryCode === '90') {
    // 0 ile başlıyorsa (yerel format: 05xx) -> 0'ı kaldır
    if (digits.startsWith('0') && digits.length === 11) {
      digits = digits.slice(1);
    }
    
    // 10 haneli ve 5 ile başlıyorsa (cep telefonu)
    if (digits.length === 10 && digits.startsWith('5')) {
      return '90' + digits;
    }
    
    // 10 haneli ve sabit hat (2, 3, 4 ile başlayan)
    if (digits.length === 10 && /^[234]/.test(digits)) {
      return '90' + digits;
    }
  }
  
  // Diğer ülkeler için genel işlem
  // Varsayılan ülke kodu ile başlamıyorsa ve uygun uzunlukta ise ekle
  const countryData = COUNTRY_CODES[defaultCountryCode];
  if (countryData) {
    const { minLength, maxLength } = countryData;
    if (digits.length >= minLength && digits.length <= maxLength) {
      // Başında 0 varsa kaldır (yerel format)
      if (digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      return defaultCountryCode + digits;
    }
  }
  
  // Hiçbir kural uygulanamadıysa olduğu gibi döndür
  return digits;
};

/**
 * Telefon numarasının ülke kodunu tespit et
 * 
 * @param {string} phone - Telefon numarası (normalize edilmiş veya ham)
 * @returns {{ code: string, country: object, nationalNumber: string } | null}
 */
export const detectCountryCode = (phone) => {
  if (!phone) return null;
  
  const digits = String(phone).replace(/\D/g, '');
  
  if (!digits) return null;
  
  // Uzun kodlardan kısalara doğru kontrol et
  for (const code of SORTED_COUNTRY_CODES) {
    if (digits.startsWith(code)) {
      const country = COUNTRY_CODES[code];
      const nationalNumber = digits.slice(code.length);
      
      // Numara uzunluğunu kontrol et
      if (nationalNumber.length >= (country.minLength - code.length) || 
          nationalNumber.length <= (country.maxLength + 2)) {
        return {
          code,
          country,
          nationalNumber,
        };
      }
    }
  }
  
  return null;
};

/**
 * Telefon numarasını okunabilir formata çevir
 * 
 * @param {string} phone - Telefon numarası (herhangi bir format)
 * @returns {string} Formatlanmış numara
 * 
 * @example
 * formatPhoneDisplay('905365923035') // '+90 536 592 30 35'
 * formatPhoneDisplay('12345678900')  // '+1 234 567 8900'
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';
  
  const normalized = normalizePhone(phone);
  if (!normalized) return phone;
  
  const countryInfo = detectCountryCode(normalized);
  
  if (!countryInfo) {
    return '+' + normalized;
  }
  
  const { code, nationalNumber } = countryInfo;
  
  // Türkiye için özel format
  if (code === '90' && nationalNumber.length === 10) {
    return `+90 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6, 8)} ${nationalNumber.slice(8)}`;
  }
  
  // ABD/Kanada için format
  if (code === '1' && nationalNumber.length === 10) {
    return `+1 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
  }
  
  // Almanya için format
  if (code === '49') {
    return `+49 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3)}`;
  }
  
  // Genel format: +XX XXX XXX XXXX
  const chunks = [];
  let remaining = nationalNumber;
  
  while (remaining.length > 0) {
    if (remaining.length <= 4) {
      chunks.push(remaining);
      break;
    }
    chunks.push(remaining.slice(0, 3));
    remaining = remaining.slice(3);
  }
  
  return `+${code} ${chunks.join(' ')}`;
};

/**
 * İki telefon numarasını karşılaştır
 * 
 * Farklı formatlardaki numaraları normalize ederek karşılaştırır.
 * 
 * @param {string} phone1 - İlk telefon numarası
 * @param {string} phone2 - İkinci telefon numarası
 * @returns {boolean} Eşleşme durumu
 * 
 * @example
 * comparePhones('+90 536 592 30 35', '905365923035') // true
 * comparePhones('0536 592 30 35', '5365923035')     // true (her ikisi de 90 eklenir)
 */
export const comparePhones = (phone1, phone2) => {
  if (!phone1 || !phone2) return false;
  
  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);
  
  if (!normalized1 || !normalized2) return false;
  
  // Direkt eşleşme
  if (normalized1 === normalized2) return true;
  
  // Son 10 hane eşleşmesi (bazı sistemler ülke kodunu farklı tutar)
  const suffix1 = normalized1.slice(-10);
  const suffix2 = normalized2.slice(-10);
  
  if (suffix1.length === 10 && suffix2.length === 10 && suffix1 === suffix2) {
    console.log(`[Phone Utils] Suffix match: ${normalized1} ≈ ${normalized2}`);
    return true;
  }
  
  return false;
};

/**
 * Telefon numarasını doğrula
 * 
 * @param {string} phone - Telefon numarası
 * @returns {{ valid: boolean, normalized: string, country: object | null, message: string | null }}
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { 
      valid: false, 
      normalized: '', 
      country: null, 
      message: 'Telefon numarası girilmedi' 
    };
  }
  
  const normalized = normalizePhone(phone);
  
  if (!normalized) {
    return { 
      valid: false, 
      normalized: '', 
      country: null, 
      message: 'Geçersiz telefon numarası' 
    };
  }
  
  if (normalized.length < 8) {
    return { 
      valid: false, 
      normalized, 
      country: null, 
      message: 'Telefon numarası çok kısa' 
    };
  }
  
  if (normalized.length > 15) {
    return { 
      valid: false, 
      normalized, 
      country: null, 
      message: 'Telefon numarası çok uzun' 
    };
  }
  
  const countryInfo = detectCountryCode(normalized);
  
  if (!countryInfo) {
    return { 
      valid: true, 
      normalized, 
      country: null, 
      message: 'Ülke kodu tanınamadı, ancak numara kaydedilebilir' 
    };
  }
  
  return { 
    valid: true, 
    normalized, 
    country: countryInfo.country, 
    message: null 
  };
};

/**
 * Telefon numarasından WhatsApp formatı oluştur
 * WhatsApp için ülke kodu + numara (boşluksuz)
 * 
 * @param {string} phone - Telefon numarası
 * @returns {string} WhatsApp formatında numara
 */
export const toWhatsAppFormat = (phone) => {
  return normalizePhone(phone);
};

/**
 * WhatsApp numarasından okunabilir format oluştur
 * 
 * @param {string} waId - WhatsApp ID (örn: 905365923035)
 * @returns {string} Formatlanmış numara
 */
export const fromWhatsAppFormat = (waId) => {
  return formatPhoneDisplay(waId);
};

// =============================================================================
// YARDIMCI FONKSİYONLAR
// =============================================================================

/**
 * Ülke bilgisini al
 * 
 * @param {string} phone - Telefon numarası veya ülke kodu
 * @returns {object | null} Ülke bilgisi
 */
export const getCountryInfo = (phone) => {
  if (!phone) return null;
  
  // Direkt ülke kodu olabilir
  if (COUNTRY_CODES[phone]) {
    return COUNTRY_CODES[phone];
  }
  
  // Telefon numarasından çıkar
  const countryInfo = detectCountryCode(phone);
  return countryInfo?.country || null;
};

/**
 * Ülke kodunu al
 * 
 * @param {string} phone - Telefon numarası
 * @returns {string | null} Ülke kodu
 */
export const getCountryCode = (phone) => {
  const countryInfo = detectCountryCode(phone);
  return countryInfo?.code || null;
};

/**
 * Ulusal numarayı al (ülke kodu olmadan)
 * 
 * @param {string} phone - Telefon numarası
 * @returns {string} Ulusal numara
 */
export const getNationalNumber = (phone) => {
  const countryInfo = detectCountryCode(normalizePhone(phone));
  return countryInfo?.nationalNumber || normalizePhone(phone);
};

/**
 * Telefon numarasının mobil mi sabit hat mı olduğunu tahmin et
 * 
 * @param {string} phone - Telefon numarası
 * @returns {'mobile' | 'landline' | 'unknown'}
 */
export const getPhoneType = (phone) => {
  const normalized = normalizePhone(phone);
  const countryInfo = detectCountryCode(normalized);
  
  if (!countryInfo) return 'unknown';
  
  const { country, nationalNumber } = countryInfo;
  
  if (country.mobilePrefix) {
    for (const prefix of country.mobilePrefix) {
      if (nationalNumber.startsWith(prefix)) {
        return 'mobile';
      }
    }
    return 'landline';
  }
  
  return 'unknown';
};

/**
 * Batch normalize - birden fazla numarayı aynı anda normalize et
 * 
 * @param {string[]} phones - Telefon numaraları dizisi
 * @returns {string[]} Normalize edilmiş numaralar
 */
export const normalizePhoneBatch = (phones) => {
  if (!Array.isArray(phones)) return [];
  return phones.map(phone => normalizePhone(phone)).filter(Boolean);
};

/**
 * Unique telefon numaraları - tekrarlı numaraları filtrele
 * 
 * @param {string[]} phones - Telefon numaraları dizisi
 * @returns {string[]} Unique, normalize edilmiş numaralar
 */
export const getUniquePhones = (phones) => {
  if (!Array.isArray(phones)) return [];
  
  const normalized = normalizePhoneBatch(phones);
  return [...new Set(normalized)];
};

// =============================================================================
// DEBUG / TEST
// =============================================================================

/**
 * Telefon numarası analizi (debug için)
 * 
 * @param {string} phone - Telefon numarası
 * @returns {object} Analiz sonucu
 */
export const analyzePhone = (phone) => {
  const original = phone;
  const normalized = normalizePhone(phone);
  const display = formatPhoneDisplay(phone);
  const validation = validatePhone(phone);
  const countryInfo = detectCountryCode(normalized);
  const phoneType = getPhoneType(phone);
  
  return {
    original,
    normalized,
    display,
    validation,
    countryCode: countryInfo?.code || null,
    country: countryInfo?.country?.name || null,
    nationalNumber: countryInfo?.nationalNumber || null,
    phoneType,
  };
};

// Default export
export default {
  normalizePhone,
  formatPhoneDisplay,
  comparePhones,
  validatePhone,
  detectCountryCode,
  getCountryInfo,
  getCountryCode,
  getNationalNumber,
  getPhoneType,
  toWhatsAppFormat,
  fromWhatsAppFormat,
  normalizePhoneBatch,
  getUniquePhones,
  analyzePhone,
  COUNTRY_CODES,
};
