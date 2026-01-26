/**
 * 🌱 AI Settings Seed Data
 *
 * Bu dosya Firestore'a ilk AI ayarlarını yüklemek için kullanılır.
 * Tüm mevcut model tanımları ve system promptlar burada tanımlıdır.
 *
 * Kullanım: Admin panelinden "AI Ayarlarını Başlat" butonuna tıklayın
 * veya bu dosyayı manuel olarak çalıştırın.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AI_PROVIDERS,
  PROMPT_CATEGORIES,
  USAGE_CONTEXTS,
  MODEL_CATEGORIES,
} from "./ai-settings-service";

// ============================================================================
// PROVIDERS SEED DATA
// ============================================================================

export const SEED_PROVIDERS = {
  [AI_PROVIDERS.CLAUDE]: {
    id: AI_PROVIDERS.CLAUDE,
    name: "Anthropic Claude",
    icon: "🟣",
    description: "Güçlü reasoning ve analiz yetenekleri, uzun context window",
    website: "https://anthropic.com",
    docsUrl: "https://docs.anthropic.com",
    envKey: "ANTHROPIC_API_KEY",
    isActive: true,
    order: 1,
    defaultModel: "claude_haiku",
    pricing: {
      currency: "USD",
      unit: "1M tokens",
    },
    features: [
      "Reasoning & Analysis",
      "Long Context (200K)",
      "Code Generation",
      "Multilingual",
    ],
  },
  [AI_PROVIDERS.GEMINI]: {
    id: AI_PROVIDERS.GEMINI,
    name: "Google Gemini",
    icon: "🔵",
    description: "Multimodal AI, görsel üretim, web search grounding",
    website: "https://ai.google.dev",
    docsUrl: "https://ai.google.dev/docs",
    envKey: "GEMINI_API_KEY",
    isActive: true,
    order: 2,
    defaultModel: "gemini_flash_25",
    pricing: {
      currency: "USD",
      unit: "1M tokens",
    },
    features: [
      "Image Generation",
      "Multimodal Input",
      "Web Search Grounding",
      "1M+ Context Window",
      "Video/Audio Processing",
    ],
  },
  [AI_PROVIDERS.OPENAI]: {
    id: AI_PROVIDERS.OPENAI,
    name: "OpenAI ChatGPT",
    icon: "🟢",
    description: "Genel amaçlı AI, vision yetenekleri, function calling",
    website: "https://openai.com",
    docsUrl: "https://platform.openai.com/docs",
    envKey: "OPENAI_API_KEY",
    isActive: true,
    order: 3,
    defaultModel: "gpt4o_mini",
    pricing: {
      currency: "USD",
      unit: "1M tokens",
    },
    features: ["Vision (GPT-4o)", "Function Calling", "JSON Mode", "Streaming"],
  },
};

// ============================================================================
// MODELS SEED DATA
// ============================================================================

export const SEED_MODELS = {
  // =====================
  // CLAUDE MODELS
  // =====================
  claude_haiku: {
    modelId: "claude_haiku",
    provider: AI_PROVIDERS.CLAUDE,
    name: "Claude Haiku",
    displayName: "Claude Haiku 4.5",
    apiId: "claude-haiku-4-5-20251001",
    icon: "⚡",
    description:
      "En hızlı ve ekonomik Claude modeli. Basit görevler için ideal.",
    isActive: true,
    isDefault: true,
    order: 1,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      reasoning: false,
      codeGeneration: true,
      longContext: true,
    },
    limits: {
      maxTokens: 8192,
      contextWindow: 200000,
    },
    pricing: {
      inputPer1M: 0.25,
      outputPer1M: 1.25,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
    },
  },
  claude_sonnet: {
    modelId: "claude_sonnet",
    provider: AI_PROVIDERS.CLAUDE,
    name: "Claude Sonnet",
    displayName: "Claude Sonnet 4.5",
    apiId: "claude-sonnet-4-5-20250929",
    icon: "🎯",
    description: "Dengeli performans. Çoğu görev için önerilen model.",
    isActive: true,
    isDefault: false,
    order: 2,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      reasoning: true,
      codeGeneration: true,
      longContext: true,
    },
    limits: {
      maxTokens: 8192,
      contextWindow: 200000,
    },
    pricing: {
      inputPer1M: 3.0,
      outputPer1M: 15.0,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
    },
  },
  claude_opus: {
    modelId: "claude_opus",
    provider: AI_PROVIDERS.CLAUDE,
    name: "Claude Opus",
    displayName: "Claude Opus 4.1",
    apiId: "claude-opus-4-1-20250805",
    icon: "🏆",
    description: "En güçlü Claude modeli. Karmaşık reasoning için.",
    isActive: true,
    isDefault: false,
    order: 3,
    category: MODEL_CATEGORIES.REASONING,
    capabilities: {
      chat: true,
      vision: true,
      reasoning: true,
      codeGeneration: true,
      longContext: true,
      deepAnalysis: true,
    },
    limits: {
      maxTokens: 8192,
      contextWindow: 200000,
    },
    pricing: {
      inputPer1M: 15.0,
      outputPer1M: 75.0,
    },
    settings: {
      defaultTemperature: 0.5,
      defaultMaxTokens: 4096,
    },
  },

  // =====================
  // GEMINI MODELS
  // =====================
  gemini_flash_25: {
    modelId: "gemini_flash_25",
    provider: AI_PROVIDERS.GEMINI,
    name: "Gemini 2.5 Flash",
    displayName: "Gemini 2.5 Flash",
    apiId: "gemini-2.5-flash",
    icon: "⚡",
    description: "Hızlı ve verimli. Web search grounding destekli.",
    isActive: true,
    isDefault: true,
    order: 1,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      grounding: true,
      webSearch: true,
      tools: true,
      thinking: true,
    },
    limits: {
      maxTokens: 65536,
      contextWindow: 1000000,
    },
    pricing: {
      inputPer1M: 0.075,
      outputPer1M: 0.3,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 8192,
      defaultGrounding: true,
    },
  },
  gemini_pro_3: {
    modelId: "gemini_pro_3",
    provider: AI_PROVIDERS.GEMINI,
    name: "Gemini 3 Pro",
    displayName: "Gemini 3 Pro Preview",
    apiId: "gemini-3-pro-preview",
    icon: "🚀",
    description: "En güçlü Gemini. Reasoning-first multimodal model.",
    isActive: true,
    isDefault: false,
    order: 2,
    category: MODEL_CATEGORIES.REASONING,
    capabilities: {
      chat: true,
      vision: true,
      audio: true,
      video: true,
      pdf: true,
      tools: true,
      deepReasoning: true,
    },
    limits: {
      maxTokens: 8192,
      contextWindow: 1000000,
    },
    pricing: {
      inputPer1M: 1.25,
      outputPer1M: 5.0,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
    },
  },
  gemini_pro_3_image: {
    modelId: "gemini_pro_3_image",
    provider: AI_PROVIDERS.GEMINI,
    name: "Gemini 3 Pro Image",
    displayName: "Gemini 3 Pro Image Preview",
    apiId: "gemini-3-pro-image-preview",
    icon: "🎨",
    description: "Görsel üretim modeli. 4K destekli.",
    isActive: true,
    isDefault: false,
    order: 3,
    category: MODEL_CATEGORIES.IMAGE_GENERATION,
    capabilities: {
      imageGeneration: true,
      imageEditing: true,
      multimodal: true,
      highResolution: true,
    },
    limits: {
      maxTokens: 8192,
      maxImageSize: "4K",
    },
    pricing: {
      perImage: 0.04,
    },
    settings: {
      defaultTemperature: 1.0,
      defaultImageSize: "2K",
      defaultAspectRatio: "1:1",
    },
  },

  // =====================
  // OPENAI MODELS
  // =====================
  gpt4o: {
    modelId: "gpt4o",
    provider: AI_PROVIDERS.OPENAI,
    name: "GPT-4o",
    displayName: "GPT-4o",
    apiId: "gpt-4o",
    icon: "🌟",
    description:
      "En yetenekli GPT modeli. Vision ve function calling destekli.",
    isActive: true,
    isDefault: false,
    order: 1,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
      jsonMode: true,
      streaming: true,
    },
    limits: {
      maxTokens: 16384,
      contextWindow: 128000,
    },
    pricing: {
      inputPer1M: 2.5,
      outputPer1M: 10.0,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 8192,
    },
  },
  gpt4o_mini: {
    modelId: "gpt4o_mini",
    provider: AI_PROVIDERS.OPENAI,
    name: "GPT-4o Mini",
    displayName: "GPT-4o Mini",
    apiId: "gpt-4o-mini",
    icon: "⚡",
    description: "Hızlı ve ekonomik. Günlük görevler için ideal.",
    isActive: true,
    isDefault: true,
    order: 2,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
      jsonMode: true,
      streaming: true,
    },
    limits: {
      maxTokens: 16384,
      contextWindow: 128000,
    },
    pricing: {
      inputPer1M: 0.15,
      outputPer1M: 0.6,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 2048,
    },
  },
  gpt4_turbo: {
    modelId: "gpt4_turbo",
    provider: AI_PROVIDERS.OPENAI,
    name: "GPT-4 Turbo",
    displayName: "GPT-4 Turbo",
    apiId: "gpt-4-turbo",
    icon: "🚀",
    description: "GPT-4'ün optimize edilmiş versiyonu.",
    isActive: true,
    isDefault: false,
    order: 3,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
      jsonMode: true,
    },
    limits: {
      maxTokens: 4096,
      contextWindow: 128000,
    },
    pricing: {
      inputPer1M: 10.0,
      outputPer1M: 30.0,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
    },
  },
  o1_preview: {
    modelId: "o1_preview",
    provider: AI_PROVIDERS.OPENAI,
    name: "o1 Preview",
    displayName: "o1 Preview (Reasoning)",
    apiId: "o1-preview",
    icon: "🧠",
    description: "Gelişmiş reasoning modeli. Karmaşık problemler için.",
    isActive: true,
    isDefault: false,
    order: 4,
    category: MODEL_CATEGORIES.REASONING,
    capabilities: {
      chat: true,
      reasoning: true,
      chainOfThought: true,
    },
    limits: {
      maxTokens: 32768,
      contextWindow: 128000,
    },
    pricing: {
      inputPer1M: 15.0,
      outputPer1M: 60.0,
    },
    settings: {
      defaultTemperature: 1.0,
      defaultMaxTokens: 8192,
    },
  },
  o1_mini: {
    modelId: "o1_mini",
    provider: AI_PROVIDERS.OPENAI,
    name: "o1 Mini",
    displayName: "o1 Mini (Reasoning)",
    apiId: "o1-mini",
    icon: "🔮",
    description: "Ekonomik reasoning modeli.",
    isActive: true,
    isDefault: false,
    order: 5,
    category: MODEL_CATEGORIES.REASONING,
    capabilities: {
      chat: true,
      reasoning: true,
      chainOfThought: true,
    },
    limits: {
      maxTokens: 65536,
      contextWindow: 128000,
    },
    pricing: {
      inputPer1M: 3.0,
      outputPer1M: 12.0,
    },
    settings: {
      defaultTemperature: 1.0,
      defaultMaxTokens: 8192,
    },
  },
};

// ============================================================================
// PROMPTS SEED DATA
// ============================================================================

export const SEED_PROMPTS = {
  // =====================
  // CRM PROMPTS - ai-prompts-seed.js'e TAŞINDI
  // Burada sadece referans bırakıyoruz
  // =====================
  // crm_communication -> ai-prompts-seed.js (ilk mesaj karşılama)
  // crm_communication_continuation -> ai-prompts-seed.js (devam yanıtı)

  // =====================
  // GENERAL ASSISTANT
  // =====================
  general_assistant_tr: {
    key: "general_assistant_tr",
    name: "Genel Asistan (Türkçe)",
    description: "Genel amaçlı Türkçe asistan promptu",
    category: PROMPT_CATEGORIES.GENERAL_ASSISTANT,
    isActive: true,
    order: 1,
    version: 1,
    language: "tr",
    content: `Sen MKN Group için çalışan yardımcı bir yapay zeka asistanısın.

## UZMANLIK ALANLARIN
- Kozmetik üretim süreçleri
- Ambalaj çözümleri
- E-ticaret operasyonları
- İş geliştirme ve pazarlama

## KURALLAR
1. Her zaman Türkçe yanıt ver
2. Profesyonel ve yardımsever ol
3. Teknik konularda detaylı açıkla
4. Emin olmadığın konularda bunu belirt
5. Gerekirse ek bilgi iste`,
    variables: [],
    metadata: {
      usedIn: ["chat_chatgpt", "chat_gemini"],
    },
  },

  // =====================
  // BLOG PROMPTS
  // =====================
  blog_generation: {
    key: "blog_generation",
    name: "Blog İçerik Üretimi",
    description: "SEO uyumlu, profesyonel blog içeriği oluşturur",
    category: PROMPT_CATEGORIES.BLOG_CONTENT,
    isActive: true,
    order: 1,
    version: 3,
    language: "tr",
    // System Prompt - AI rolü ve KELİME SAYISI kuralları
    systemPrompt: `Sen MKN Group'un profesyonel blog yazarısın. 

## KRİTİK KURAL - KELİME SAYISI:
- Kısa (short): EN AZ 700 kelime yaz
- Orta (medium): EN AZ 1200 kelime yaz  
- Uzun (long): EN AZ 2000 kelime yaz

Bu kelime sayılarına MUTLAKA uymalısın. Kısa içerik KABUL EDİLMEZ.

Her bölümü detaylı açıkla, örnekler ver, alt başlıklar kullan.
Yanıtını geçerli JSON formatında ver.`,
    content: `## 🚨 ZORUNLU: {{length}} uzunluğunda blog yaz!

Kelime hedefleri:
- short = EN AZ 700 kelime
- medium = EN AZ 1200 kelime
- long = EN AZ 2000 kelime

Seçilen: **{{length}}** - Bu hedefe MUTLAKA ulaş!

---

## KONU
{{topic}}

## ANAHTAR KELİMELER
{{keywords}}

## TON
{{tone}}

---

## MKN GROUP - DETAYLI BİLGİLER

### Şirket Profili
- **Kuruluş:** 2009
- **Deneyim:** 15+ yıl sektör deneyimi
- **Lokasyon:** Esenyurt, İstanbul, Türkiye
- **Tesis:** 5.000 m² üretim alanı
- **Kapasite:** Aylık 500.000+ ürün
- **Sertifikalar:** ISO 22716, GMP, Helal, Vegan

### Hizmet Alanları

**1. Fason Kozmetik Üretim**
- Cilt Bakım: Kremler, serumlar, losyonlar, maskeler, tonikler
- Saç Bakım: Şampuanlar, saç maskeleri, saç serumları, saç spreyleri
- Vücut Bakım: Duş jelleri, vücut losyonları, peelingler
- Erkek Bakım: Sakal yağları, tıraş sonrası losyonlar
- Bebek Bakım: Bebek şampuanı, bebek losyonu, pişik kremi
- Güneş Bakım: SPF kremler, bronzlaştırıcılar, güneş sonrası bakım

**2. Fason Gıda Takviyesi Üretim**
- Vitaminler ve mineraller
- Bitkisel takviyeler
- Protein tozları
- Kolajen ürünleri
- Probiyotikler
- Omega-3 ve balık yağları

**3. Fason Temizlik Ürünleri Üretim**
- Ev temizlik ürünleri
- Çamaşır deterjanları
- Bulaşık deterjanları
- Yüzey temizleyiciler
- Endüstriyel temizlik ürünleri

**4. Ambalaj Çözümleri**
- Cam şişeler (dropper, pump, sprey kapaklı)
- Plastik şişeler (PET, HDPE, PP)
- Kavanozlar (cam, akrilik, PP)
- Tüpler (PE, lamine, airless)
- Airless pompalar
- Roll-on aplikatörler
- Özel tasarım ambalajlar
- Etiket ve kutu tasarımı

**5. E-ticaret Operasyonları**
- Depolama ve stok yönetimi
- Sipariş karşılama (fulfillment)
- Kargo entegrasyonları (yurtiçi/yurtdışı)
- Pazaryeri entegrasyonları (Trendyol, Hepsiburada, Amazon)
- Dropshipping hizmetleri
- Müşteri hizmetleri desteği

**6. Formülasyon & Ar-Ge**
- Özel formül geliştirme
- Mevcut formül optimizasyonu
- Doğal ve organik formülasyonlar
- Vegan formülasyonlar
- Stabilite testleri
- Etkinlik testleri
- Dermatolojik testler

**7. Özel Etiket (Private Label)**
- Hazır formüllerden seçim
- Markalama hizmetleri
- Minimum sipariş: 500 adet
- Hızlı lansman (2-4 hafta)

### İletişim
- **Website:** www.mkngroup.com.tr
- **E-posta:** info@mkngroup.com.tr
- **Telefon:** +90 531 494 25 94
- **Adres:** Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul, Türkiye

---

## İÇERİK GEREKSİNİMLERİ

1. **Giriş bölümü** (150+ kelime): Konuyu tanıt, okuyucunun ilgisini çek
2. **Ana bölümler** (her biri 200+ kelime): 
   - {{length}} = short ise 3-4 bölüm
   - {{length}} = medium ise 5-6 bölüm
   - {{length}} = long ise 7-8 bölüm
3. **Her bölümde**: Alt başlıklar, listeler, örnekler kullan
4. **Sonuç bölümü** (150+ kelime): Özet ve MKN Group CTA

---

## JSON ÇIKTI FORMATI

{
  "title": "SEO uyumlu başlık (50-60 karakter)",
  "slug": "url-slug",
  "excerpt": "Özet (150-200 karakter)",
  "content": "<h2>Başlık</h2><p>Paragraf...</p>... (HTML - UZUN İÇERİK)",
  "metaDescription": "Meta açıklama (160 karakter)",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Kategori",
  "readingTime": 5,
  "wordCount": 1200
}

---

## ⚠️ UYARI
content alanı {{length}} için gereken kelime sayısına MUTLAKA ulaşmalı!
Kısa içerik üretirsen BAŞARISIZ sayılır.`,
    variables: [
      { name: "topic", description: "Blog konusu", required: true },
      {
        name: "keywords",
        description: "Hedef anahtar kelimeler",
        required: false,
      },
      {
        name: "length",
        description: "İçerik uzunluğu (short/medium/long)",
        required: true,
      },
      {
        name: "tone",
        description: "İçerik tonu (professional/casual/technical)",
        required: false,
      },
    ],
    metadata: {
      usedIn: ["admin_blog", "api_content_generate"],
      wordCountTargets: {
        short: { min: 600, target: 700, max: 900 },
        medium: { min: 1000, target: 1200, max: 1500 },
        long: { min: 1800, target: 2000, max: 2500 },
      },
    },
  },

  blog_content_improvement: {
    key: "blog_content_improvement",
    name: "Blog İçerik İyileştirme",
    description: "Mevcut blog içeriğini düzenler ve iyileştirir",
    category: PROMPT_CATEGORIES.BLOG_CONTENT,
    isActive: true,
    order: 2,
    version: 2,
    language: "tr",
    content: `Sen profesyonel bir içerik editörüsün. Mevcut blog içeriğini daha etkileyici, SEO uyumlu ve okunabilir hale getiriyorsun.

## İYİLEŞTİRME ALANLARI
1. **Dil ve Üslup:** Gramer hataları, akıcılık
2. **SEO:** Anahtar kelime yoğunluğu, meta açıklama
3. **Yapı:** Başlık hiyerarşisi, paragraf düzeni
4. **Okunabilirlik:** Kısa cümleler, aktif dil
5. **Değer:** Eksik bilgileri tamamla

## KURALLAR
- Orijinal anlamı koruyarak iyileştir
- Türkçe dilbilgisi kurallarına uy
- Profesyonel ton kullan
- HTML formatını koru

## ÇIKTI
Sadece iyileştirilmiş HTML içeriği döndür, JSON formatında değil.

## İYİLEŞTİRİLECEK İÇERİK
{{content}}`,
    variables: [
      {
        name: "content",
        description: "İyileştirilecek içerik",
        required: true,
      },
    ],
    metadata: {
      usedIn: ["admin_blog"],
    },
  },

  // =====================
  // SOCIAL MEDIA PROMPTS
  // =====================
  social_media_instagram_post: {
    key: "social_media_instagram_post",
    name: "Instagram Post İçeriği",
    description: "Instagram post içeriği oluşturur",
    category: PROMPT_CATEGORIES.SOCIAL_MEDIA,
    isActive: true,
    order: 1,
    version: 1,
    language: "tr",
    content: `Sen MKN Group'un sosyal medya içerik uzmanısın.

## GÖREV
Verilen başlık için etkileyici bir Instagram post içeriği oluştur.

## MKN GROUP HAKKINDA
- Kozmetik fason üretim
- Premium ambalaj çözümleri
- E-ticaret operasyonları
- 15+ yıl deneyim

## İÇERİK KURALLARI
1. Dikkat çekici açılış cümlesi
2. Değer önerisi net olmalı
3. Call-to-action ekle
4. Emoji kullan (3-5 adet)
5. 5-10 hashtag öner
6. 150-300 kelime arası

## FORMAT
{
  "caption": "Post içeriği...",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "callToAction": "Bio'daki linkten...",
  "mood": "inspirational/educational/promotional"
}`,
    variables: [
      { name: "title", description: "Post başlığı", required: true },
      { name: "platform", description: "Platform adı", required: false },
      { name: "contentType", description: "İçerik türü", required: false },
    ],
    metadata: {
      usedIn: ["admin_social_media", "admin_content_studio"],
    },
  },

  social_media_linkedin_post: {
    key: "social_media_linkedin_post",
    name: "LinkedIn Post İçeriği",
    description: "LinkedIn post içeriği oluşturur",
    category: PROMPT_CATEGORIES.SOCIAL_MEDIA,
    isActive: true,
    order: 2,
    version: 1,
    language: "tr",
    content: `Sen MKN Group'un B2B içerik stratejisti olarak LinkedIn için profesyonel içerikler üretiyorsun.

## GÖREV
Verilen başlık için LinkedIn'e uygun profesyonel bir post oluştur.

## MKN GROUP B2B DEĞERLERİ
- Kurumsal güvenilirlik
- Teknik uzmanlık
- Sektör liderliği
- İnovasyon odaklılık

## İÇERİK KURALLARI
1. Profesyonel ton
2. Değer odaklı içerik
3. Sektör insights paylaş
4. Thought leadership göster
5. 200-400 kelime
6. Minimal emoji (0-2)

## FORMAT
{
  "content": "Post içeriği...",
  "hashtags": ["#B2B", "#Kozmetik"],
  "targetAudience": "Marka yöneticileri, satın alma müdürleri",
  "keyMessage": "Ana mesaj"
}`,
    variables: [
      { name: "title", description: "Post başlığı", required: true },
      { name: "industry", description: "Hedef sektör", required: false },
    ],
    metadata: {
      usedIn: ["admin_social_media", "admin_content_studio"],
    },
  },

  // =====================
  // TITLE GENERATION
  // =====================
  title_generation_main: {
    key: "title_generation_main",
    name: "Başlık Üretimi",
    description: "Sosyal medya ve blog için başlık üretir",
    category: PROMPT_CATEGORIES.TITLE_GENERATION,
    isActive: true,
    order: 1,
    version: 1,
    language: "tr",
    content: `Sen yaratıcı bir içerik stratejisti olarak başlık üretiyorsun.

## GÖREV
Verilen konu için dikkat çekici, SEO uyumlu başlıklar üret.

## MKN GROUP İÇERİK ALANLARI
- Kozmetik üretim
- Cilt bakımı
- Saç bakımı
- Ambalaj çözümleri
- E-ticaret
- Marka oluşturma

## BAŞLIK KURALLARI
1. Dikkat çekici olmalı
2. SEO anahtar kelime içermeli
3. 60 karakter altında
4. Merak uyandırmalı
5. Değer önerisi net olmalı

## ÇIKTI FORMAT
Her başlık için:
{
  "title": "Başlık metni",
  "type": "educational/promotional/news/case_study/trend",
  "seoScore": 1-10,
  "engagementPotential": 1-10,
  "targetKeyword": "Anahtar kelime"
}

5-10 başlık öner, JSON array olarak döndür.`,
    variables: [
      { name: "topic", description: "Konu/Kategori", required: true },
      { name: "count", description: "Başlık sayısı", required: false },
      { name: "platform", description: "Hedef platform", required: false },
    ],
    metadata: {
      usedIn: ["admin_social_media", "service_title_generation"],
    },
  },

  // =====================
  // ANALYSIS PROMPTS
  // =====================
  sentiment_analysis: {
    key: "sentiment_analysis",
    name: "Duygu Analizi",
    description: "Metin duygu analizi yapar",
    category: PROMPT_CATEGORIES.SENTIMENT_ANALYSIS,
    isActive: true,
    order: 1,
    version: 1,
    language: "tr",
    content: `Verilen metnin duygusal tonunu analiz et.

## ANALİZ KRİTERLERİ
1. Genel duygu: Pozitif / Negatif / Nötr
2. Duygu yoğunluğu: 1-10 arası
3. Alt duygular: Mutluluk, üzüntü, öfke, korku, şaşkınlık
4. Önemli ifadeler

## ÇIKTI FORMAT
{
  "sentiment": "positive/negative/neutral",
  "score": 7.5,
  "emotions": {
    "happiness": 0.8,
    "sadness": 0.1,
    "anger": 0.0,
    "fear": 0.0,
    "surprise": 0.1
  },
  "keyPhrases": ["ifade1", "ifade2"],
  "summary": "Kısa değerlendirme"
}`,
    variables: [
      { name: "text", description: "Analiz edilecek metin", required: true },
    ],
    metadata: {
      usedIn: ["api_analyze", "admin_crm"],
    },
  },

  image_analysis: {
    key: "image_analysis",
    name: "Görsel Analizi",
    description: "Görsel içerik analizi ve skorlama",
    category: PROMPT_CATEGORIES.IMAGE_ANALYSIS,
    isActive: true,
    order: 1,
    version: 1,
    language: "tr",
    content: `Sen görsel içerik analisti olarak görselleri değerlendiriyorsun.

## ANALİZ KRİTERLERİ
1. İçerik uygunluğu (verilen konuyla ilişki)
2. Görsel kalite
3. Kompozisyon
4. Renk uyumu
5. Marka uygunluğu

## SKORLAMA
Her kriter için 1-10 arası puan ver.

## ÇIKTI FORMAT
{
  "relevanceScore": 8,
  "qualityScore": 7,
  "compositionScore": 9,
  "colorScore": 8,
  "brandFitScore": 7,
  "overallScore": 7.8,
  "recommendation": "use/maybe/skip",
  "reasoning": "Değerlendirme açıklaması"
}`,
    variables: [
      { name: "topic", description: "Konu/Bağlam", required: true },
      { name: "imageUrl", description: "Görsel URL", required: true },
    ],
    metadata: {
      usedIn: ["service_image_selection", "admin_content_studio"],
    },
  },

  // =====================
  // SEO PROMPTS
  // =====================
  seo_content_optimization: {
    key: "seo_content_optimization",
    name: "SEO İçerik Optimizasyonu",
    description: "İçeriği SEO için optimize eder",
    category: PROMPT_CATEGORIES.SEO_OPTIMIZATION,
    isActive: true,
    order: 1,
    version: 1,
    language: "tr",
    content: `Sen SEO uzmanı olarak içerik optimizasyonu yapıyorsun.

## GÖREV
Verilen içeriği SEO için analiz et ve öneriler sun.

## ANALİZ ALANLARI
1. Anahtar kelime yoğunluğu
2. Meta description uygunluğu
3. Başlık yapısı (H1, H2, H3)
4. İç bağlantı fırsatları
5. Okunabilirlik skoru

## ÇIKTI FORMAT
{
  "seoScore": 75,
  "keywordDensity": 2.3,
  "readabilityScore": 80,
  "recommendations": [
    {
      "type": "keyword",
      "priority": "high",
      "suggestion": "Öneri detayı"
    }
  ],
  "metaDescription": "Önerilen meta description",
  "titleSuggestion": "Optimize edilmiş başlık"
}`,
    variables: [
      {
        name: "content",
        description: "Analiz edilecek içerik",
        required: true,
      },
      {
        name: "targetKeyword",
        description: "Hedef anahtar kelime",
        required: true,
      },
    ],
    metadata: {
      usedIn: ["admin_blog", "api_analyze"],
    },
  },

  // =====================
  // FORMULA PROMPTS
  // =====================
  formula_analysis: {
    key: "formula_analysis",
    name: "Formül Analizi",
    description: "Kozmetik formül analizi ve değerlendirme",
    category: PROMPT_CATEGORIES.FORMULA_ANALYSIS,
    isActive: true,
    order: 1,
    version: 1,
    language: "tr",
    content: `Sen kozmetik formülasyon uzmanısın.

## GÖREV
Verilen formülü analiz et ve değerlendir.

## ANALİZ ALANLARI
1. İçerik bileşenleri ve oranları
2. Stabilite değerlendirmesi
3. Güvenlik analizi
4. Etkinlik tahmini
5. Maliyet optimizasyonu önerileri

## DÜZENLEME KURALLARI
- INCI adlarını kullan
- Yüzde oranları belirt
- Uyumluluk uyarıları ver
- Alternatif öner

## ÇIKTI FORMAT
{
  "analysis": {
    "stability": "stable/unstable/conditionally_stable",
    "safety": "safe/warning/caution",
    "efficacy": "high/medium/low"
  },
  "ingredients": [
    {
      "name": "INCI adı",
      "percentage": 5.0,
      "function": "Fonksiyon",
      "notes": "Notlar"
    }
  ],
  "recommendations": ["Öneri 1", "Öneri 2"],
  "warnings": ["Uyarı 1"]
}`,
    variables: [
      { name: "formulaContent", description: "Formül içeriği", required: true },
      { name: "productType", description: "Ürün türü", required: false },
    ],
    metadata: {
      usedIn: ["admin_formulas"],
    },
  },

  // =====================
  // TRANSLATION
  // =====================
  translation_general: {
    key: "translation_general",
    name: "Genel Çeviri",
    description: "Metinleri çevirir",
    category: PROMPT_CATEGORIES.TRANSLATION,
    isActive: true,
    order: 1,
    version: 1,
    language: "multi",
    content: `Profesyonel çevirmen olarak çalışıyorsun.

## KURALLAR
1. Anlamı koruyarak çevir
2. Hedef dilin doğal akışını kullan
3. Teknik terimleri doğru çevir
4. Kültürel uyarlama yap
5. Tutarlı terminoloji kullan

## ÇIKTI FORMAT
{
  "translation": "Çevrilmiş metin",
  "sourceLanguage": "tr",
  "targetLanguage": "en",
  "notes": "Çeviri notları (varsa)"
}`,
    variables: [
      { name: "text", description: "Çevrilecek metin", required: true },
      { name: "targetLanguage", description: "Hedef dil", required: true },
      { name: "sourceLanguage", description: "Kaynak dil", required: false },
    ],
    metadata: {
      usedIn: ["api_analyze", "admin_blog"],
    },
  },

  // =====================
  // CODE REVIEW
  // =====================
  code_review: {
    key: "code_review",
    name: "Kod İnceleme",
    description: "Kod kalitesi analizi ve öneriler",
    category: PROMPT_CATEGORIES.CODE_REVIEW,
    isActive: true,
    order: 1,
    version: 1,
    language: "en",
    content: `You are a senior software engineer reviewing code.

## REVIEW CRITERIA
1. Code quality and readability
2. Performance considerations
3. Security vulnerabilities
4. Best practices adherence
5. Error handling

## OUTPUT FORMAT
{
  "overallScore": 8,
  "issues": [
    {
      "severity": "high/medium/low",
      "line": 42,
      "type": "security/performance/style",
      "description": "Issue description",
      "suggestion": "How to fix"
    }
  ],
  "improvements": ["Suggestion 1", "Suggestion 2"],
  "positives": ["Good practice 1"]
}`,
    variables: [
      { name: "code", description: "Code to review", required: true },
      {
        name: "language",
        description: "Programming language",
        required: false,
      },
    ],
    metadata: {
      usedIn: ["api_analyze"],
    },
  },
};

// ============================================================================
// CONFIGURATIONS SEED DATA - v3.0 FLAT STRUCTURE
// Her işlem için ayrı basit konfigürasyon - İçiçe mapping yok!
// ============================================================================

export const SEED_CONFIGURATIONS = {
  // ============================================================================
  // CRM CONFIGURATIONS - HİBRİT YAPI v4.0
  // İlk mesaj için karşılama, devam için kısa yanıt
  // ============================================================================
  crm_communication: {
    contextId: "crm_communication",
    context: USAGE_CONTEXTS.ADMIN_CRM,
    operation: "communication",
    name: "CRM İlk Karşılama",
    description:
      "Yeni müşteri taleplerini karşılar - sıcak, profesyonel ilk izlenim",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: [
      "claude_haiku",
      "claude_sonnet",
      "gpt4o_mini",
      "gpt4o",
      "gemini_flash_25",
    ],
    promptKey: "crm_communication", // ai-prompts-seed.js'den gelir
    // Ton seçenekleri
    toneOptions: {
      professional: {
        label: "Profesyonel",
        description: "Kurumsal ve resmi ton",
      },
      friendly: { label: "Samimi", description: "Samimi ama profesyonel ton" },
      formal: { label: "Resmi", description: "Çok resmi, kurumsal ton" },
      concise: { label: "Kısa & Öz", description: "En kısa şekilde yanıt" },
    },
    settings: {
      temperature: 0.75,
      maxTokens: 800,
      streaming: false,
    },
    responseSettings: {
      includeSignature: true,
      includeContactInfo: true,
      maxWordCount: 150,
      defaultTone: "friendly",
    },
    metadata: {
      promptType: "first_message",
    },
    isActive: true,
    order: 1,
  },

  // Devam eden konuşmalar için akıllı yanıt
  crm_communication_continuation: {
    contextId: "crm_communication_continuation",
    context: USAGE_CONTEXTS.ADMIN_CRM,
    operation: "communication_continuation",
    name: "CRM Devam Yanıtı - Akıllı",
    description:
      "Devam eden konuşmalara bağlam farkında, profesyonel ve insani yanıtlar",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: [
      "claude_haiku",
      "claude_sonnet",
      "gpt4o_mini",
      "gpt4o",
      "gemini_flash_25",
    ],
    promptKey: "crm_communication_continuation", // ai-prompts-seed.js'den gelir
    toneOptions: {
      professional: {
        label: "Profesyonel",
        description: "Kurumsal ve resmi ton",
      },
      friendly: { label: "Samimi", description: "Samimi ama profesyonel ton" },
      concise: { label: "Kısa & Öz", description: "En kısa şekilde yanıt" },
    },
    settings: {
      temperature: 0.7,
      maxTokens: 600,
      streaming: false,
    },
    responseSettings: {
      includeSignature: true,
      includeContactInfo: false,
      maxWordCount: 80,
      defaultTone: "professional",
    },
    metadata: {
      promptType: "continuation",
    },
    isActive: true,
    order: 2,
  },

  // CRM Talep Özeti - Konuşmadan özet çıkarma
  crm_case_summary: {
    contextId: "crm_case_summary",
    context: USAGE_CONTEXTS.ADMIN_CRM,
    operation: "case_summary",
    name: "CRM Talep Özeti",
    description: "Müşteri konuşmalarından talep özeti çıkaran AI konfigürasyonu",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: [
      "claude_haiku",
      "claude_sonnet",
      "gemini_flash_25",
      "gpt4o_mini",
    ],
    promptKey: "crm_case_summary",
    settings: {
      temperature: 0.3,
      maxTokens: 2048,
      streaming: false,
    },
    features: {
      allowModelChange: true,
      allowPromptEdit: false,
      showTokenUsage: true,
      enableHistory: true,
    },
    metadata: {
      version: "1.0",
      createdFor: "CRM V2 Case Detail Page",
      usage: "Conversation içeriğinden talep özeti üretme",
    },
    isActive: true,
    order: 3,
  },

  // ============================================================================
  // BLOG CONFIGURATIONS
  // ============================================================================
  // Ana blog üretimi için context - unified-ai-service tarafından kullanılır
  blog_generation: {
    contextId: "blog_generation",
    context: USAGE_CONTEXTS.ADMIN_BLOG,
    operation: "content_generation",
    name: "Blog - İçerik Üretimi (Tam Yazı)",
    description: "Tam kapsamlı blog yazısı oluşturur",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_sonnet",
    allowedModelIds: [
      "claude_haiku",
      "claude_sonnet",
      "claude_opus",
      "gpt4o",
      "gemini_flash_25",
    ],
    promptKey: "blog_generation",
    settings: {
      temperature: 0.8,
      maxTokens: 8192,
      streaming: true,
    },
    contentSettings: {
      creativity: 70,
      technicality: 60,
      seoOptimization: 80,
      readability: 75,
    },
    isActive: true,
    order: 1,
  },
  // Blog iyileştirme için context
  blog_improvement: {
    contextId: "blog_improvement",
    context: USAGE_CONTEXTS.ADMIN_BLOG,
    operation: "content_improvement",
    name: "Blog - İçerik İyileştirme",
    description: "Mevcut blog içeriğini düzenler ve iyileştirir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_sonnet",
    allowedModelIds: ["claude_haiku", "claude_sonnet", "gpt4o"],
    promptKey: "blog_content_improvement",
    settings: {
      temperature: 0.7,
      maxTokens: 4096,
      streaming: true,
    },
    isActive: true,
    order: 2,
  },
  blog_content_improvement: {
    context: USAGE_CONTEXTS.ADMIN_BLOG,
    operation: "content_improvement",
    name: "Blog - İçerik İyileştirme (Düzenleme)",
    description: "Mevcut blog içeriğini düzenler ve iyileştirir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_sonnet",
    allowedModelIds: ["claude_haiku", "claude_sonnet", "gpt4o"],
    promptKey: "blog_content_improvement",
    settings: {
      temperature: 0.7,
      maxTokens: 4096,
      streaming: true,
    },
    isActive: true,
    order: 2,
  },
  blog_title_generation: {
    context: USAGE_CONTEXTS.ADMIN_BLOG,
    operation: "title_generation",
    name: "Blog - Başlık Üretimi (Tek Başlık)",
    description: "Blog için dikkat çekici başlık önerileri",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet", "gpt4o_mini"],
    promptKey: "title_generation",
    settings: {
      temperature: 0.9,
      maxTokens: 1024,
      streaming: false,
    },
    isActive: true,
    order: 3,
  },
  blog_title_dataset: {
    context: USAGE_CONTEXTS.ADMIN_BLOG,
    operation: "title_dataset_generation",
    name: "Blog - Başlık Dataset (Toplu Üretim)",
    description: "Toplu başlık listesi oluşturur",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gpt4o_mini"],
    promptKey: "blog_title_dataset_generation",
    settings: {
      temperature: 0.9,
      maxTokens: 2048,
      streaming: false,
    },
    isActive: true,
    order: 4,
  },
  blog_seo_optimization: {
    context: USAGE_CONTEXTS.ADMIN_BLOG,
    operation: "seo_optimization",
    name: "Blog - SEO Optimizasyonu (Analiz)",
    description: "İçeriği SEO için analiz eder ve optimize eder",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet", "gpt4o_mini"],
    promptKey: "seo_content",
    settings: {
      temperature: 0.5,
      maxTokens: 2048,
      streaming: false,
    },
    isActive: true,
    order: 5,
  },
  blog_translation: {
    context: USAGE_CONTEXTS.ADMIN_BLOG,
    operation: "translation",
    name: "Blog - İçerik Çevirisi (Çoklu Dil)",
    description: "Blog içeriğini farklı dillere çevirir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gemini_flash_25", "gpt4o_mini"],
    promptKey: "translation",
    settings: {
      temperature: 0.3,
      maxTokens: 4096,
      streaming: false,
    },
    isActive: true,
    order: 6,
  },

  // ============================================================================
  // SOCIAL MEDIA - GENEL
  // ============================================================================
  social_content_general: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "content_general",
    name: "Sosyal Medya - Genel İçerik",
    description: "Genel sosyal medya içeriği üretir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet", "gpt4o_mini"],
    promptKey: "social_content",
    settings: {
      temperature: 0.9,
      maxTokens: 1024,
      streaming: false,
    },
    isActive: true,
    order: 1,
  },
  social_hashtag_generation: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "hashtag_generation",
    name: "Sosyal Medya - Hashtag Üretimi",
    description: "İçeriğe uygun hashtag önerileri",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gpt4o_mini"],
    promptKey: "social_hashtag",
    settings: {
      temperature: 0.8,
      maxTokens: 512,
      streaming: false,
    },
    isActive: true,
    order: 2,
  },
  social_content_optimization: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "content_optimization",
    name: "Sosyal Medya - İçerik Optimizasyonu",
    description: "Mevcut içeriği optimize eder",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gpt4o_mini"],
    promptKey: "social_optimize",
    settings: {
      temperature: 0.7,
      maxTokens: 1024,
      streaming: false,
    },
    isActive: true,
    order: 3,
  },
  social_title_generation: {
    contextId: "social_title_generation",
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "title_generation",
    name: "Sosyal Medya - Başlık Üretimi",
    description:
      "Sosyal medya içerikleri için kategoriye ve platforma özel başlık üretir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: [
      "claude_haiku",
      "claude_sonnet",
      "gpt4o_mini",
      "gemini_flash_25",
    ],
    promptKey: "social_title_generation", // Fallback/genel prompt
    // Platform bazlı prompt anahtarları
    platformPrompts: {
      instagram: "instagram_title_generation",
      facebook: "facebook_title_generation",
      x: "x_title_generation",
      twitter: "x_title_generation", // alias
      linkedin: "linkedin_title_generation",
    },
    settings: {
      temperature: 0.9,
      maxTokens: 4096,
      streaming: false,
    },
    isActive: true,
    order: 4,
  },

  // ============================================================================
  // SOCIAL MEDIA - INSTAGRAM
  // ============================================================================
  instagram_post: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "instagram_post",
    name: "Instagram - Post İçeriği",
    description: "Instagram post içeriği üretir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet", "gpt4o_mini"],
    promptKey: "instagram_post_generation",
    settings: {
      temperature: 0.9,
      maxTokens: 1024,
      streaming: false,
    },
    isActive: true,
    order: 10,
  },
  instagram_reel: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "instagram_reel",
    name: "Instagram - Reel Script",
    description: "Instagram reel script'i oluşturur",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet"],
    promptKey: "instagram_reel_generation",
    settings: {
      temperature: 1.0,
      maxTokens: 1024,
      streaming: false,
    },
    isActive: true,
    order: 11,
  },
  instagram_story: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "instagram_story",
    name: "Instagram - Story Serisi",
    description: "Instagram story serisi oluşturur",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gpt4o_mini"],
    promptKey: "instagram_story_generation",
    settings: {
      temperature: 0.9,
      maxTokens: 1024,
      streaming: false,
    },
    isActive: true,
    order: 12,
  },
  instagram_carousel: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "instagram_carousel",
    name: "Instagram - Carousel İçeriği",
    description: "Instagram carousel içeriği",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet"],
    promptKey: "instagram_carousel_generation",
    settings: {
      temperature: 0.8,
      maxTokens: 2048,
      streaming: false,
    },
    isActive: true,
    order: 13,
  },

  // ============================================================================
  // SOCIAL MEDIA - FACEBOOK
  // ============================================================================
  facebook_post: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "facebook_post",
    name: "Facebook - Post İçeriği",
    description: "Facebook post içeriği üretir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet", "gpt4o_mini"],
    promptKey: "facebook_post_generation",
    settings: {
      temperature: 0.8,
      maxTokens: 2048,
      streaming: false,
    },
    isActive: true,
    order: 20,
  },
  facebook_video: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "facebook_video",
    name: "Facebook - Video Script",
    description: "Facebook video script'i",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet"],
    promptKey: "facebook_video_generation",
    settings: {
      temperature: 0.9,
      maxTokens: 2048,
      streaming: false,
    },
    isActive: true,
    order: 21,
  },

  // ============================================================================
  // SOCIAL MEDIA - X (TWITTER)
  // ============================================================================
  x_tweet: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "x_tweet",
    name: "X (Twitter) - Tek Tweet",
    description: "X tek tweet içeriği",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gpt4o_mini"],
    promptKey: "x_tweet_generation",
    settings: {
      temperature: 0.9,
      maxTokens: 512,
      streaming: false,
    },
    isActive: true,
    order: 30,
  },
  x_thread: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "x_thread",
    name: "X (Twitter) - Thread Serisi",
    description: "X thread serisi oluşturur",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet"],
    promptKey: "x_thread_generation",
    settings: {
      temperature: 0.8,
      maxTokens: 2048,
      streaming: false,
    },
    isActive: true,
    order: 31,
  },

  // ============================================================================
  // SOCIAL MEDIA - LINKEDIN
  // ============================================================================
  linkedin_post: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "linkedin_post",
    name: "LinkedIn - Post İçeriği",
    description: "LinkedIn post içeriği üretir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "claude_sonnet", "gpt4o_mini"],
    promptKey: "linkedin_post_generation",
    settings: {
      temperature: 0.7,
      maxTokens: 2048,
      streaming: false,
    },
    isActive: true,
    order: 40,
  },
  linkedin_carousel: {
    context: USAGE_CONTEXTS.ADMIN_SOCIAL_MEDIA,
    operation: "linkedin_carousel",
    name: "LinkedIn - Carousel İçeriği",
    description: "LinkedIn carousel içeriği",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_sonnet",
    allowedModelIds: ["claude_haiku", "claude_sonnet"],
    promptKey: "linkedin_carousel_generation",
    settings: {
      temperature: 0.7,
      maxTokens: 3072,
      streaming: false,
    },
    isActive: true,
    order: 41,
  },

  // ============================================================================
  // CONTENT STUDIO
  // ============================================================================
  content_studio_generation: {
    contextId: "content_studio_generation",
    context: USAGE_CONTEXTS.ADMIN_CONTENT_STUDIO,
    operation: "content_generation",
    name: "Content Studio - İçerik Üretimi",
    description: "Platform ve içerik tipine göre sosyal medya içeriği üretir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_sonnet",
    allowedModelIds: [
      "claude_haiku",
      "claude_sonnet",
      "claude_opus",
      "gpt4o",
      "gpt4o_mini",
      "gemini_flash_25",
    ],
    promptKey: "social_content", // Fallback prompt
    // Platform + ContentType bazlı prompt anahtarları
    platformPrompts: {
      // Instagram
      instagram_post: "instagram_post_generation",
      instagram_reel: "instagram_reel_generation",
      instagram_story: "instagram_story_generation",
      instagram_carousel: "instagram_carousel_generation",
      // Facebook
      facebook_post: "facebook_post_generation",
      facebook_video: "facebook_video_generation",
      // X (Twitter)
      x_tweet: "x_tweet_generation",
      x_thread: "x_thread_generation",
      // LinkedIn
      linkedin_post: "linkedin_post_generation",
      linkedin_carousel: "linkedin_carousel_generation",
    },
    settings: {
      temperature: 0.8,
      maxTokens: 4096,
      streaming: false,
    },
    isActive: true,
    order: 0,
  },
  content_visual_generation: {
    context: USAGE_CONTEXTS.ADMIN_CONTENT_STUDIO,
    operation: "visual_generation",
    name: "Content Studio - Görsel Üretimi (AI)",
    description: "AI ile görsel üretir",
    defaultProvider: AI_PROVIDERS.GEMINI,
    defaultModelId: "gemini_pro_3_image",
    allowedModelIds: ["gemini_pro_3_image"],
    promptKey: "content_visual_generation",
    settings: {
      temperature: 1.0,
      imageSize: "2K",
      aspectRatio: "1:1",
    },
    isActive: true,
    order: 1,
  },

  // ============================================================================
  // FORMULAS
  // ============================================================================
  formula_generation: {
    context: USAGE_CONTEXTS.ADMIN_FORMULAS,
    operation: "formula_generation",
    name: "Formül - Üretim (Yeni Formül)",
    description: "Yeni kozmetik formülü oluşturur",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_sonnet",
    allowedModelIds: ["claude_sonnet", "claude_opus", "gpt4o"],
    promptKey: "formula_generation",
    settings: {
      temperature: 0.5,
      maxTokens: 4096,
      streaming: false,
    },
    isActive: true,
    order: 1,
  },

  // Profesyonel Formül Üretimi (v4.0) - Kozmetik, Dermokozmetik, Temizlik, Gıda Takviyesi
  // Kategori bazlı dinamik prompt sistemi
  formula_generation_pro: {
    context: USAGE_CONTEXTS.ADMIN_FORMULAS,
    operation: "formula_generation_pro",
    name: "Formül - Profesyonel Üretim (v4.0)",
    description:
      "Kozmetik, dermokozmetik, temizlik ürünleri ve gıda takviyeleri için profesyonel düzeyde formülasyon üretir. Kategori bazlı dinamik prompt sistemi.",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_sonnet",
    allowedModelIds: ["claude_sonnet", "claude_opus", "gpt4o", "gemini_pro"],
    promptKey: "formula_cosmetic_pro", // Fallback prompt (default: cosmetic)
    // Kategori bazlı prompt anahtarları (platformPrompts gibi çalışır)
    categoryPrompts: {
      cosmetic: "formula_cosmetic_pro",
      dermocosmetic: "formula_dermocosmetic_pro",
      cleaning: "formula_cleaning_pro",
      supplement: "formula_supplement_pro",
    },
    settings: {
      temperature: 0.7,
      maxTokens: 8000,
      streaming: false,
    },
    metadata: {
      supportedCategories: [
        "cosmetic",
        "dermocosmetic",
        "cleaning",
        "supplement",
      ],
      features: [
        "Kategori bazlı özel promptlar",
        "Backend hesaplama (AI hesaplama yapmaz)",
        "ingredients_price DB entegrasyonu",
        "Gelişmiş hammadde parametreleri",
        "Sertifikasyon desteği",
        "Hedef kitle özelleştirme",
      ],
      version: "4.0",
    },
    isActive: true,
    order: 0, // En üstte göster
  },

  formula_price_analysis: {
    context: USAGE_CONTEXTS.ADMIN_FORMULAS,
    operation: "price_analysis",
    name: "Formül - Fiyat Analizi (Maliyet)",
    description: "Formül maliyet analizi yapar",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gpt4o_mini"],
    promptKey: "formula_price_analysis",
    settings: {
      temperature: 0.3,
      maxTokens: 2048,
      streaming: false,
    },
    isActive: true,
    order: 2,
  },
  formula_marketing_generation: {
    contextId: "formula_marketing_generation",
    context: USAGE_CONTEXTS.ADMIN_FORMULAS,
    operation: "marketing_generation",
    name: "Formül - Pazarlama İçeriği",
    description:
      "Formül için profesyonel pazarlama içeriği (ürün açıklaması, kullanım talimatı, faydalar, öneriler, uyarılar) üretir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: [
      "claude_haiku",
      "claude_sonnet",
      "gpt4o_mini",
      "gemini_flash_25",
    ],
    promptKey: "formula_marketing_generation",
    settings: {
      temperature: 0.7,
      maxTokens: 1500,
      streaming: false,
    },
    isActive: true,
    order: 3,
  },

  // ============================================================================
  // CHAT INTERFACES
  // ============================================================================
  chat_gemini: {
    context: USAGE_CONTEXTS.CHAT_GEMINI,
    operation: "default_chat",
    name: "Gemini - Sohbet Arayüzü",
    description: "Gemini sohbet arayüzü",
    defaultProvider: AI_PROVIDERS.GEMINI,
    defaultModelId: "gemini_flash_25",
    allowedModelIds: ["gemini_flash_25", "gemini_pro_3"],
    promptKey: "chat_chatgpt_default",
    settings: {
      temperature: 0.7,
      maxTokens: 8192,
      streaming: true,
      grounding: true,
    },
    isActive: true,
    order: 1,
  },
  chat_chatgpt: {
    context: USAGE_CONTEXTS.CHAT_CHATGPT,
    operation: "default_chat",
    name: "ChatGPT - Sohbet Arayüzü",
    description: "ChatGPT sohbet arayüzü",
    defaultProvider: AI_PROVIDERS.OPENAI,
    defaultModelId: "gpt4o_mini",
    allowedModelIds: [
      "gpt4o_mini",
      "gpt4o",
      "gpt4_turbo",
      "o1_mini",
      "o1_preview",
    ],
    promptKey: "chat_chatgpt_default",
    settings: {
      temperature: 0.7,
      maxTokens: 4096,
      streaming: true,
    },
    isActive: true,
    order: 1,
  },

  // ============================================================================
  // SERVICES
  // ============================================================================
  service_image_analysis: {
    context: USAGE_CONTEXTS.SERVICE_IMAGE_SELECTION,
    operation: "detailed_analysis",
    name: "Görsel Seçim - Detaylı Analiz",
    description: "Görseli detaylı analiz eder",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gpt4o_mini"],
    promptKey: "image_relevance_analysis",
    settings: {
      temperature: 0.5,
      maxTokens: 1024,
    },
    isActive: true,
    order: 1,
  },
  service_image_quick: {
    context: USAGE_CONTEXTS.SERVICE_IMAGE_SELECTION,
    operation: "quick_analysis",
    name: "Görsel Seçim - Hızlı Analiz",
    description: "Görseli hızlıca değerlendirir",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku"],
    promptKey: "image_quick_analysis",
    settings: {
      temperature: 0.5,
      maxTokens: 512,
    },
    isActive: true,
    order: 2,
  },
  service_title_single: {
    context: USAGE_CONTEXTS.SERVICE_TITLE_GENERATION,
    operation: "single_title",
    name: "Başlık Servisi - Tek Başlık",
    description: "Tek bir başlık önerisi",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku", "gpt4o_mini"],
    promptKey: "title_generation",
    settings: {
      temperature: 0.9,
      maxTokens: 512,
    },
    isActive: true,
    order: 1,
  },
  service_title_batch: {
    context: USAGE_CONTEXTS.SERVICE_TITLE_GENERATION,
    operation: "batch_generation",
    name: "Başlık Servisi - Toplu Üretim (Dataset)",
    description: "Büyük başlık dataset'i oluşturur",
    defaultProvider: AI_PROVIDERS.CLAUDE,
    defaultModelId: "claude_haiku",
    allowedModelIds: ["claude_haiku"],
    promptKey: "blog_title_dataset_generation",
    settings: {
      temperature: 0.9,
      maxTokens: 3072,
    },
    isActive: true,
    order: 2,
  },
};

// ============================================================================
// SEED FUNCTION - Providers, Models ve Configurations için
// NOT: Prompt'lar ai-prompts-seed.js'den yüklenir!
// ============================================================================

/**
 * Initialize AI settings in Firestore (Providers, Models, Configurations)
 * PROMPT'LAR BU FONKSİYONDAN YÜKLENMEZ!
 * Prompt'lar için: ai-prompts-seed.js -> seedAllPrompts() kullanın
 */
export async function seedAiSettings() {
  const results = {
    providers: { success: 0, failed: 0 },
    models: { success: 0, failed: 0 },
    configurations: { success: 0, failed: 0 },
  };

  try {
    // Seed Providers
    console.log("🔄 Seeding AI providers...");
    for (const [id, data] of Object.entries(SEED_PROVIDERS)) {
      try {
        const providerRef = doc(db, "ai_providers", id);
        await setDoc(providerRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.providers.success++;
      } catch (error) {
        console.error(`Failed to seed provider ${id}:`, error);
        results.providers.failed++;
      }
    }

    // Seed Models
    console.log("🔄 Seeding AI models...");
    for (const [id, data] of Object.entries(SEED_MODELS)) {
      try {
        const modelRef = doc(db, "ai_models", id);
        await setDoc(modelRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.models.success++;
      } catch (error) {
        console.error(`Failed to seed model ${id}:`, error);
        results.models.failed++;
      }
    }

    // Seed Configurations
    console.log("🔄 Seeding AI configurations...");
    for (const [id, data] of Object.entries(SEED_CONFIGURATIONS)) {
      try {
        const configRef = doc(db, "ai_configurations", id);
        await setDoc(configRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.configurations.success++;
      } catch (error) {
        console.error(`Failed to seed configuration ${id}:`, error);
        results.configurations.failed++;
      }
    }

    console.log("✅ AI settings seed completed:", results);
    console.log(
      "⚠️ Prompt'ları yüklemek için seedAllPrompts() kullanın (ai-prompts-seed.js)"
    );
    return { success: true, results };
  } catch (error) {
    console.error("❌ AI settings seed failed:", error);
    return { success: false, error: error.message, results };
  }
}

/**
 * Reset AI settings - Delete existing and seed fresh data
 * Providers, Models ve Configurations sıfırlanır
 * PROMPT'LAR BU FONKSİYONDAN SİFİRLANMAZ!
 * Prompt'lar için: ai-prompts-seed.js -> resetAllPrompts() kullanın
 */
export async function resetAiSettings() {
  const results = {
    deleted: {
      providers: 0,
      models: 0,
      configurations: 0,
    },
    added: {
      providers: 0,
      models: 0,
      configurations: 0,
    },
  };

  try {
    // 1. Delete existing data
    console.log(
      "🗑️ Deleting existing AI settings (providers, models, configs)..."
    );

    // Delete providers
    const providersRef = collection(db, "ai_providers");
    const providersSnapshot = await getDocs(providersRef);
    if (providersSnapshot.size > 0) {
      const deleteBatch = writeBatch(db);
      providersSnapshot.forEach((docSnap) => {
        deleteBatch.delete(doc(providersRef, docSnap.id));
      });
      await deleteBatch.commit();
      results.deleted.providers = providersSnapshot.size;
    }

    // Delete models
    const modelsRef = collection(db, "ai_models");
    const modelsSnapshot = await getDocs(modelsRef);
    if (modelsSnapshot.size > 0) {
      const deleteBatch = writeBatch(db);
      modelsSnapshot.forEach((docSnap) => {
        deleteBatch.delete(doc(modelsRef, docSnap.id));
      });
      await deleteBatch.commit();
      results.deleted.models = modelsSnapshot.size;
    }

    // Delete configurations
    const configurationsRef = collection(db, "ai_configurations");
    const configurationsSnapshot = await getDocs(configurationsRef);
    if (configurationsSnapshot.size > 0) {
      const deleteBatch = writeBatch(db);
      configurationsSnapshot.forEach((docSnap) => {
        deleteBatch.delete(doc(configurationsRef, docSnap.id));
      });
      await deleteBatch.commit();
      results.deleted.configurations = configurationsSnapshot.size;
    }

    // 2. Seed fresh data
    console.log("🔄 Seeding fresh AI settings...");

    // Seed Providers
    for (const [id, data] of Object.entries(SEED_PROVIDERS)) {
      const providerRef = doc(db, "ai_providers", id);
      await setDoc(providerRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      results.added.providers++;
    }

    // Seed Models
    for (const [id, data] of Object.entries(SEED_MODELS)) {
      const modelRef = doc(db, "ai_models", id);
      await setDoc(modelRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      results.added.models++;
    }

    // Seed Configurations
    for (const [id, data] of Object.entries(SEED_CONFIGURATIONS)) {
      const configRef = doc(db, "ai_configurations", id);
      await setDoc(configRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      results.added.configurations++;
    }

    console.log("✅ AI settings reset completed:", results);
    console.log(
      "⚠️ Prompt'ları sıfırlamak için resetAllPrompts() kullanın (ai-prompts-seed.js)"
    );

    const totalDeleted =
      results.deleted.providers +
      results.deleted.models +
      results.deleted.configurations;
    const totalAdded =
      results.added.providers +
      results.added.models +
      results.added.configurations;

    return {
      success: true,
      results,
      message: `${totalDeleted} eski kayıt silindi, ${totalAdded} yeni kayıt eklendi.`,
    };
  } catch (error) {
    console.error("❌ AI settings reset failed:", error);
    return { success: false, error: error.message, results };
  }
}

/**
 * Check if AI settings are already seeded
 */
export async function checkAiSettingsSeeded() {
  try {
    const providersRef = collection(db, "ai_providers");
    const snapshot = await getDocs(providersRef);
    return snapshot.size > 0;
  } catch (error) {
    console.error("Error checking AI settings:", error);
    return false;
  }
}
