/**
 * AI Blog Generator Service
 * MKN Group AI destekli blog üretim yardımcı servisleri
 */

import { markdownToHtml, enhancedMarkdownToHtml, sanitizeHtml } from "./markdown-to-html";

/**
 * Convert markdown content to HTML
 * @param {string} markdownContent - The markdown content to convert
 * @param {boolean} enhanced - Whether to use enhanced conversion
 * @returns {string} HTML content
 */
export function convertMarkdownToHtml(markdownContent, enhanced = true) {
  if (!markdownContent || typeof markdownContent !== 'string') {
    return '';
  }

  const html = enhanced 
    ? enhancedMarkdownToHtml(markdownContent)
    : markdownToHtml(markdownContent);

  return sanitizeHtml(html);
}

/**
 * Process blog content for storage
 * @param {Object} blogData - Blog data from AI
 * @returns {Object} Processed blog data
 */
export function processBlogContent(blogData) {
  if (!blogData || !blogData.content) {
    return blogData;
  }

  return {
    ...blogData,
    markdownContent: blogData.content
  };
}

/**
 * Okuma süresi hesaplama
 * @param {string} content - Blog içeriği
 * @returns {number} Dakika cinsinden okuma süresi
 */
export const estimateReadingTime = (content) => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * URL-friendly slug oluşturma (Türkçe karakter desteği)
 * @param {string} title - Blog başlığı
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[şŞ]/g, "s")
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[ıI]/g, "i")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

/**
 * İçerik bazlı otomatik etiket üretme
 * @param {string} content - Blog içeriği
 * @param {string} title - Blog başlığı
 * @param {string} excerpt - Blog özeti
 * @param {string} selectedCategory - Seçili kategori slug'ı
 * @returns {string} Virgülle ayrılmış etiketler
 */
export const generateTags = (content, title, excerpt, selectedCategory) => {
  const contentLower = (content || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const excerptLower = (excerpt || '').toLowerCase();
  
  const possibleTags = [
    // Genel MKN Group
    'MKN Group', 'fason üretim', 'contract manufacturing',
    // Kozmetik
    'kozmetik üretimi', 'kozmetik fason üretim', 'GMP sertifikalı üretim',
    'halal kozmetik', 'doğal kozmetik', 'organik kozmetik',
    'cilt bakım', 'saç bakım', 'makyaj ürünleri',
    // Ambalaj
    'kozmetik ambalaj', 'airless ambalaj', 'parfüm şişesi',
    'pompalı şişe', 'krem kavanozu', 'serum şişesi',
    'sürdürülebilir ambalaj', 'premium ambalaj',
    // Gıda Takviyesi
    'gıda takviyesi', 'vitamin üretimi', 'probiyotik üretim',
    'HACCP sertifikalı', 'tablet üretimi', 'kapsül üretimi',
    // Temizlik
    'temizlik ürünleri', 'deterjan üretimi', 'sıvı sabun',
    'çevre dostu temizlik', 'endüstriyel temizlik',
    // E-ticaret & Operasyon
    'e-ticaret operasyon', 'fulfillment hizmetleri', 'depo yönetimi',
    '3PL hizmetleri', 'kargo operasyonu',
    // Pazarlama
    'dijital pazarlama', 'influencer marketing', 'sosyal medya',
    'marka geliştirme', 'ürün pazarlama',
    // Sektörel
    'kozmetik sektörü', 'güzellik endüstrisi', 'kozmetik trendleri',
    'sektör analizi', 'pazar araştırması'
  ];

  const relevantTags = possibleTags.filter(tag => 
    contentLower.includes(tag.toLowerCase()) || 
    titleLower.includes(tag.toLowerCase()) ||
    excerptLower.includes(tag.toLowerCase())
  );

  const selectedTags = relevantTags.slice(0, 8);
  
  // Minimum 5 etiket için kategori bazlı varsayılanlar
  if (selectedTags.length < 5) {
    const defaultTags = {
      'ambalaj': ['kozmetik ambalaj', 'fason üretim', 'MKN Group'],
      'kozmetik': ['kozmetik üretimi', 'GMP sertifikalı üretim', 'contract manufacturing'],
      'gida-takviyesi': ['gıda takviyesi', 'HACCP sertifikalı', 'vitamin üretimi'],
      'temizlik': ['temizlik ürünleri', 'çevre dostu üretim', 'deterjan üretimi'],
      'eticaret': ['e-ticaret operasyon', 'fulfillment hizmetleri', 'depo yönetimi'],
      'pazarlama': ['dijital pazarlama', 'marka geliştirme', 'influencer marketing']
    };
    
    const categoryDefaults = defaultTags[selectedCategory] || ['fason üretim', 'MKN Group', 'contract manufacturing'];
    selectedTags.push(...categoryDefaults.slice(0, 5 - selectedTags.length));
  }

  return [...new Set(selectedTags)].join(', ');
};

/**
 * Test amaçlı mock blog verisi
 */
export const mockGeneratedBlog = {
  title: "Airless Ambalaj Nedir?",
  slug: "airless-ambalaj-nedir",
  excerpt: "Airless ambalaj sistemlerinin kozmetik sektöründe sunduğu avantajları keşfedin.",
  content: `<h2>Airless Ambalaj Teknolojisi</h2><p>Airless ambalaj teknolojisi, kozmetik endüstrisinde devrim yaratan bir yeniliktir.</p><h3>Avantajları</h3><ul><li>Oksidasyonu önler</li><li>Ürün stabilitesini artırır</li><li>Raf ömrünü uzatır</li></ul><p>MKN Group olarak airless ambalaj çözümleri sunuyoruz.</p>`,
  category: "Ambalaj",
  categorySlug: "ambalaj",
  author: "MKN Group Uzmanları",
  tags: "airless ambalaj, kozmetik ambalaj, fason üretim, MKN Group",
  metaDescription: "Airless ambalaj sistemlerinin kozmetik sektöründe sunduğu avantajları keşfedin.",
  readingTime: 3,
  featured: false,
  image: ""
};