/**
 * HTML to Text Utility
 * HTML içeriğini temiz düz metne dönüştürür
 * Email içerikleri, alıntılar ve imzaları temizler
 */

/**
 * Email imza bloklarını tespit et ve kes
 * @param {string} text - Temizlenecek metin
 * @returns {string} İmzası kaldırılmış metin
 */
export const removeEmailSignature = (text) => {
  if (!text) return '';
  
  const signaturePatterns = [
    /^--\s*$/m,
    /^-{4,}\s*$/m,
    /^_{4,}\s*$/m,
    /^={4,}\s*$/m,
    /^—{3,}/m,
    /^–{3,}/m,
    /[-—–_=]{10,}/m,
    /\n\s*Saygılarımla\s*[\/,.]?\s*(Best regards)?/im,
    /\n\s*Saygılar\s*[\/,.]?/im,
    /\n\s*İyi çalışmalar\s*[\/,.]?/im,
    /\n\s*Saygılarımızla\s*[\/,.]?/im,
    /\n\s*Best regards\s*[\/,.]?/im,
    /\n\s*Kind regards\s*[\/,.]?/im,
    /\n\s*Regards\s*[\/,.]?/im,
    /^Sent from my iPhone/im,
    /^Sent from my Android/im,
    /^Get Outlook for/im,
  ];
  
  let cleanText = text;
  let earliestIndex = cleanText.length;
  
  for (const pattern of signaturePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const index = cleanText.indexOf(match[0]);
      if (index > 30 && index < earliestIndex) {
        earliestIndex = index;
      }
    }
  }
  
  if (earliestIndex < cleanText.length) {
    cleanText = cleanText.substring(0, earliestIndex).trim();
  }
  
  return cleanText.replace(/[\-—–_=]{4,}\s*$/gm, '').replace(/\n{2,}/g, '\n\n').trim();
};

/**
 * Email alıntılarını kaldır
 * @param {string} text - Temizlenecek metin
 * @returns {string} Alıntıları kaldırılmış metin
 */
export const removeEmailQuotes = (text) => {
  if (!text) return '';
  
  const quotePatterns = [
    /^.*<[^>]+@[^>]+>[^:]*tarihinde şunu yazd[ıi]:\s*$/im,
    /^On .+wrote:\s*$/im,
    /^From:\s*.+\n.*Sent:\s*.+\n.*To:\s*.+/im,
    /^Kimden:\s*.+$/im,
    /^-{3,}\s*(Alıntı|Original Message|Orijinal Mesaj)\s*-{3,}/im,
    /^(>.*\n){2,}/m,
    /^_{5,}/m,
    /^Tarih:\s*\d+/im,
  ];
  
  let cleanText = text;
  let earliestIndex = cleanText.length;
  
  for (const pattern of quotePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const index = cleanText.indexOf(match[0]);
      if (index > 20 && index < earliestIndex) {
        earliestIndex = index;
      }
    }
  }
  
  if (earliestIndex < cleanText.length) {
    cleanText = cleanText.substring(0, earliestIndex).trim();
  }
  
  return cleanText.trim();
};

/**
 * HTML entities'leri decode et
 * @param {string} text - Decode edilecek metin
 * @returns {string} Decode edilmiş metin
 */
export const decodeHtmlEntities = (text) => {
  if (!text) return '';
  
  const htmlEntities = {
    '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
    '&quot;': '"', '&#39;': "'", '&apos;': "'",
    '&rsquo;': "'", '&lsquo;': "'", '&rdquo;': '"', '&ldquo;': '"',
    '&mdash;': '—', '&ndash;': '–', '&hellip;': '...',
    '&#160;': ' ', '&copy;': '©', '&reg;': '®', '&trade;': '™',
    '&euro;': '€', '&pound;': '£', '&yen;': '¥',
    '&sect;': '§', '&para;': '¶', '&bull;': '•',
    '&middot;': '·', '&times;': '×', '&divide;': '÷',
  };
  
  let result = text;
  
  for (const [entity, char] of Object.entries(htmlEntities)) {
    result = result.replace(new RegExp(entity, 'gi'), char);
  }
  
  // Numeric entities
  result = result.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return result;
};

/**
 * HTML tag'larını kaldır
 * @param {string} html - Temizlenecek HTML
 * @returns {string} Tag'ları kaldırılmış metin
 */
export const stripHtmlTags = (html) => {
  if (!html) return '';
  
  let text = html;
  
  // Head, script, style taglarını içerikleriyle birlikte kaldır
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<meta[^>]*>/gi, '');
  text = text.replace(/<link[^>]*>/gi, '');
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
  text = text.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, ''); // HTML yorumları
  
  // Email alıntı yapılarını temizle - SADECE gerçek alıntıları kaldır
  // NOT: gmail_quote bazen orijinal mesaj içeriğini de sarabilir, dikkatli olmalıyız
  text = text.replace(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi, '');
  // gmail_signature'ı kaldır (imza)
  text = text.replace(/<div[^>]*class="[^"]*gmail_signature[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  // Outlook'un iletilen/yanıtlanan mesaj işaretçisi
  text = text.replace(/<div[^>]*id="divRplyFwdMsg"[^>]*>[\s\S]*$/gi, '');
  // Mozilla alıntı öneki
  text = text.replace(/<div[^>]*class="[^"]*moz-cite-prefix[^"]*"[^>]*>[\s\S]*$/gi, '');
  // Yahoo alıntı
  text = text.replace(/<div[^>]*class="[^"]*yahoo_quoted[^"]*"[^>]*>[\s\S]*$/gi, '');
  
  // NOT: gmail_quote'u KALDIRMIYORUZ çünkü bazen orijinal mesaj içeriği bu div içinde
  // Bunun yerine sadece "On ... wrote:" pattern'ini içeren alıntıları kaldırıyoruz
  // text = text.replace(/<div[^>]*class="[^"]*gmail_quote[^"]*"[^>]*>[\s\S]*$/gi, '');
  
  // Blok elementleri yeni satıra çevir
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<hr[^>]*>/gi, '\n---\n');
  
  // TÜM HTML tag'larını kaldır
  text = text.replace(/<[^>]*>/g, '');
  text = text.replace(/<[a-zA-Z][^>]*$/gm, ''); // Yarım kalan tag'lar
  text = text.replace(/^[^<]*>/gm, ''); // Yarım kapanan tag'lar
  
  return text;
};

/**
 * Metni normalize et (fazla boşlukları temizle)
 * @param {string} text - Normalize edilecek metin
 * @returns {string} Normalize edilmiş metin
 */
export const normalizeWhitespace = (text) => {
  if (!text) return '';
  
  return text
    .replace(/[ \t]+/g, ' ')           // Çoklu boşlukları tek boşluğa
    .replace(/\n[ \t]+/g, '\n')        // Satır başı boşlukları
    .replace(/[ \t]+\n/g, '\n')        // Satır sonu boşlukları
    .replace(/\n{3,}/g, '\n\n')        // 3+ yeni satırı 2'ye düşür
    .replace(/^[\-—–_=]{4,}\s*$/gm, '') // Ayırıcı çizgileri kaldır
    .replace(/[\-—–_=]{10,}/g, '')     // Uzun ayırıcıları kaldır
    .trim();
};

/**
 * HTML içeriğinden düz metin çıkar (TAM TEMİZLİK)
 * Email içerikleri, alıntılar ve imzaları temizler
 * 
 * @param {string} html - Temizlenecek HTML içeriği
 * @param {Object} options - Seçenekler
 * @param {boolean} options.removeQuotes - Email alıntılarını kaldır (varsayılan: true)
 * @param {boolean} options.removeSignature - İmzaları kaldır (varsayılan: true)
 * @param {boolean} options.preserveLineBreaks - Satır sonlarını koru (varsayılan: true)
 * @returns {string} Temizlenmiş düz metin
 */
export const htmlToText = (html, options = {}) => {
  const {
    removeQuotes = true,
    removeSignature = true,
    preserveLineBreaks = true,
  } = options;
  
  if (!html) return '';
  
  let text = html;
  
  // Önce tam HTML dökümanı mı kontrol et
  const hasHtmlTags = /<[a-zA-Z][^>]*>/i.test(text);
  
  if (hasHtmlTags) {
    // HTML tag'larını kaldır
    text = stripHtmlTags(text);
  }
  
  // HTML entities decode
  text = decodeHtmlEntities(text);
  
  // Kalan HTML benzeri kalıntıları temizle
  text = text.replace(/<[^>]*$/g, ''); // Satır sonundaki yarım tag
  text = text.replace(/^[^<]*>/g, ''); // Satır başındaki yarım tag
  
  // Whitespace normalize
  text = normalizeWhitespace(text);
  
  // Email alıntılarını temizle
  if (removeQuotes) {
    text = removeEmailQuotes(text);
  }
  
  // İmzaları temizle
  if (removeSignature) {
    text = removeEmailSignature(text);
  }
  
  // Son temizlik
  text = text
    .replace(/^[\-—–_=]{4,}\s*$/gm, '')
    .replace(/\n{2,}/g, preserveLineBreaks ? '\n\n' : '\n')
    .trim();
  
  return text;
};

/**
 * Basit HTML tag temizleme (sadece tag'ları kaldırır)
 * @param {string} html - Temizlenecek HTML
 * @returns {string} Tag'sız metin
 */
export const simpleStripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * AI Prompt için metin temizle
 * Daha agresif temizleme - gereksiz tüm içerikleri kaldırır
 * 
 * @param {string} html - Temizlenecek HTML içeriği  
 * @param {number} maxLength - Maksimum karakter sayısı (varsayılan: 2000)
 * @returns {string} AI prompt için optimize edilmiş temiz metin
 */
export const cleanTextForAI = (html, maxLength = 2000) => {
  if (!html) return '';
  
  // Tam temizlik yap
  let text = htmlToText(html, {
    removeQuotes: true,
    removeSignature: true,
    preserveLineBreaks: true,
  });
  
  // Ekstra temizlik - AI için gereksiz karakterleri kaldır
  text = text
    .replace(/[^\S\n]+/g, ' ')         // Tüm whitespace'leri boşluğa çevir (newline hariç)
    .replace(/\n{3,}/g, '\n\n')        // Fazla satır sonlarını azalt
    .replace(/[""]/g, '"')              // Akıllı tırnak işaretlerini normale çevir
    .replace(/['']/g, "'")
    .replace(/…/g, '...')               // Özel karakterleri normalize et
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width karakterleri kaldır
    .trim();
  
  // Maksimum uzunluğa kırp
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    // Kelime ortasında kesmeyi önle
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      text = text.substring(0, lastSpace);
    }
    text += '...';
  }
  
  return text;
};

/**
 * Email içeriği için özel temizleme
 * cleanEmailContent fonksiyonunun alias'ı
 */
export const cleanEmailContent = htmlToText;

// Default export
export default {
  htmlToText,
  cleanTextForAI,
  cleanEmailContent,
  stripHtmlTags,
  decodeHtmlEntities,
  removeEmailQuotes,
  removeEmailSignature,
  normalizeWhitespace,
  simpleStripHtml,
};
