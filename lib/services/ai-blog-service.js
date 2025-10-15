/**
 * AI Blog Generator Service
 * MKN Group AI destekli blog üretim servisleri
 */

import { siteConfig } from "@/config/site";
import { markdownToHtml, enhancedMarkdownToHtml, sanitizeHtml, htmlToMarkdown } from "./markdown-to-html";

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
 * Converts markdown to HTML and ensures proper formatting
 * @param {Object} blogData - Blog data from AI
 * @returns {Object} Processed blog data with HTML content
 */
export function processBlogContent(blogData) {
  if (!blogData || !blogData.content) {
    return blogData;
  }

  return {
    ...blogData,
    // content: convertMarkdownToHtml(blogData.content),
    // Keep original markdown for editing if needed
    markdownContent: blogData.content
  };
}

// Okuma süresi hesaplama
export const estimateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return readingTime;
};

// Slug oluşturma
export const generateSlug = (title) => {
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

// Etiket üretme servisi
export const generateTags = (content, title, excerpt, selectedCategory) => {
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();
  const excerptLower = excerpt.toLowerCase();
  
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

  // En az 5, en fazla 8 etiket
  const selectedTags = relevantTags.slice(0, 8);
  
  if (selectedTags.length < 5) {
    // Kategoriye göre varsayılan etiketler ekle
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

// Mock blog data
export const mockGeneratedBlog = {
  title: "Airless Ambalaj Nedir?",
  slug: "airless-ambalaj-nedir",
  excerpt: "Airless ambalaj sistemlerinin kozmetik sektöründe sunduğu avantajları, fason üretim süreçlerindeki önemini ve ürün korumasındaki rolünü keşfedin.",
  content: `
Airless ambalaj teknolojisi, kozmetik endüstrisinde devrim yaratan bir yeniliktir. Bu sistemi sayesinde ürünler hava ile temas etmeden güvenli bir şekilde muhafaza edilir.

## Airless Ambalaj Sistemlerinin Teknolojik Altyapısı

### İnovatif Vakum Teknolojisi

MKN Group olarak, airless ambalaj sistemlerinin tasarımında son teknoloji vakum çözümlerini kullanıyoruz. Bu sistem, ürünün içeriğini havadan tamamen izole ederek:

- Oksidasyonu önler
- Ürün stabilitesini artırır  
- Kontaminasyon riskini minimize eder
- Raf ömrünü uzatır

### Fason Üretim Sürecindeki Avantajları

Kozmetik fason üretim süreçlerimizde airless ambalaj kullanmanın önemli faydaları:

**Kalite Güvencesi:** GMP sertifikalı tesislerimizde üretilen ürünler, airless sistemler sayesinde en yüksek kalite standartlarında korunur.

**Maliyet Optimizasyonu:** Uzayan raf ömrü ve azalan fire oranları ile üretim maliyetlerinde önemli tasarruf sağlanır.

**Pazar Avantajı:** Premium ambalaj çözümleri ile müşterilerinize değer katarak rekabet avantajı elde edersiniz.

## Uygulama Alanları

Airless ambalaj teknolojisi özellikle şu ürün kategorilerinde tercih edilir:

- **Serum ve Konsantre Ürünler:** Aktif bileşenlerin korunması kritiktir
- **Anti-aging Kremler:** Yaşlanma karşıtı formüllerin etkinliğini korur
- **Doğal/Organik Kozmetikler:** Koruyucu kimyasal içermeyen formüller için ideal
- **Premium Cilt Bakım Ürünleri:** Lüks segment için vazgeçilmez teknoloji

## MKN Group Airless Çözümleri

15 yıllık tecrübemizle, her müşterimize özel airless ambalaj çözümleri geliştiriyoruz:

- **Özel Tasarım:** Markanıza özel airless pompa ve şişe tasarımları
- **Hacim Seçenekleri:** 15ml'den 50ml'ye kadar geniş hacim yelpazesi  
- **Renk ve Finish:** Mat, parlak, metalik ve özel efekt seçenekleri
- **Sustainability:** Geri dönüştürülebilir ve çevre dostu malzeme seçenekleri

### Teknik Özellikler

- **Vakum Oranı:** %99.5 hava izolasyonu
- **Dozaj Hassasiyeti:** ±0.1ml doğruluk
- **Dayanıklılık:** 10.000+ pompalama garantisi
- **Sıcaklık Direnci:** -20°C ile +50°C arası

## Sonuç

Airless ambalaj teknolojisi, kozmetik sektöründe geleceğin standardıdır. MKN Group olarak, bu alandaki uzmanlığımızı müşterilerimizin başarısına dönüştürmeyi hedefliyoruz.

**Airless ambalaj çözümlerimiz hakkında detaylı bilgi almak için hemen iletişime geçin!**

---

*MKN Group - 15 yıldır kozmetik fason üretim sektöründe öncü, GMP sertifikalı tesislerde premium kalite hizmet.*
  `,
  category: "Ambalaj",
  categorySlug: "ambalaj",
  author: "MKN Group Uzmanları",
  tags: "airless ambalaj, kozmetik ambalaj, fason üretim, MKN Group, vakum teknolojisi, premium ambalaj",
  metaDescription: "Airless ambalaj sistemlerinin kozmetik sektöründe sunduğu avantajları ve MKN Group'un bu alandaki çözümlerini keşfedin.",
  readingTime: 6,
  featured: false,
  image: ""
};

// AI prompt templates
export const AI_PROMPTS = {
  blogGeneration: (topics, details) => `
Sen MKN Group için blog yazısı üreten uzman bir yazarsın. MKN Group, Türkiye'nin önde gelen kozmetik fason üretim, gıda takviyesi üretimi, temizlik ürünleri üretimi, ambalaj çözümleri ve e-ticaret operasyon hizmetleri sunan bir şirketidir.

GÖREV: Aşağıdaki konular hakkında profesyonel, SEO uyumlu ve bilgilendirici bir blog yazısı yaz.

KONULAR: ${topics.join(', ')}

YAZIŞ AYARLARI:
- Ton: ${details.tone === 'professional' ? 'Profesyonel ve güvenilir' : details.tone === 'friendly' ? 'Samimi ve yakın' : 'Teknik ve detaylı'}
- Uzunluk: ${details.length === 'short' ? '600-800 kelime' : details.length === 'medium' ? '1000-1500 kelime' : '1800-2500 kelime'}
- Hedef Kelimeler: ${details.targetKeywords || 'MKN Group, fason üretim, kozmetik üretimi'}

ÖZELLİKLER:
${details.includeStats ? '✓ İstatistikler ve veriler ekle' : ''}
${details.includeMKNInfo ? '✓ MKN Group hizmetlerini vurgula' : ''}
${details.includeCallToAction ? '✓ Güçlü çağrı-to-action ekle' : ''}

MKN GROUP BİLGİLERİ:
- 15+ yıl sektör tecrübesi
- GMP ve HACCP sertifikalı üretim tesisleri
- Halal sertifikalı ürün seçenekleri
- 50+ ülkeye ihracat
- Private label ve contract manufacturing uzmanı
- E-ticaret fulfillment ve 3PL hizmetleri
- Sürdürülebilir ve çevre dostu üretim yaklaşımı

HTML FORMATLAMA KURALLARI:
- Başlıklar için <h2>, <h3>, <h4> kullan (h1 kullanma)
- Paragraflar için <p> etiketleri
- Vurgular için <strong> ve <em> kullan
- Listeler için <ul>/<ol> ve <li> kullan
- Önemli noktalar için <mark> veya <span class="highlight"> kullanabilirsin
- Abartmadan, sade ve okunabilir HTML formatında yaz

ÇIKTI FORMATI:
Lütfen yanıtını JSON formatında ver:
{
  "title": "SEO uyumlu başlık (50-60 karakter)",
  "slug": "url-dostu-slug",
  "excerpt": "Özet paragraf (150-200 karakter)",
  "content": "Tam blog içeriği (HTML formatında, newline karakterleri yerine <br> kullan)",
  "tags": "etiket1, etiket2, etiket3, etiket4, etiket5",
  "metaDescription": "SEO meta açıklaması (150-160 karakter)"
}

ÖNEMLİ: 
1. Sadece JSON yanıtı ver, başka açıklama yapma
2. Content alanında newline karakterleri kullanma, HTML tag'leriyle format et
3. JSON string içinde tırnak işaretleri için \\" kullan
  `,

  contentImprovement: (content) => `
Sen MKN Group için blog yazısı geliştiren uzman bir editörsün. Aşağıdaki HTML içeriğini MKN Group'un profesyonel standartlarına uygun olarak iyileştir.

İYİLEŞTİRME KRİTERLERİ:
1. Daha akıcı ve anlaşılır bir dil kullan
2. SEO dostu anahtar kelimeler ekle
3. Paragraf yapısını optimize et
4. Teknik detayları daha anlaşılır hale getir
5. Call-to-action ifadeleri güçlendir
6. MKN Group'un uzmanlık alanlarını vurgula
7. Okuyucu deneyimini artır
8. HTML başlık hiyerarşisini düzenle

HTML FORMATLAMA KURALLARI:
- Başlıklar için <h2>, <h3>, <h4> kullan (h1 kullanma)
- Paragraflar için <p> etiketleri
- Vurgular için <strong> ve <em> kullan
- Listeler için <ul>/<ol> ve <li> kullan
- Newline karakterleri kullanma, HTML tag'leriyle format et

MEVCUT İÇERİK:
${content}

ÇIKTI: Sadece iyileştirilmiş HTML içeriğini döndür, açıklama yapma. Newline karakterleri kullanma.
  `
};