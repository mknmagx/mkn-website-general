/**
 * 🤖 AI Constants - Merkezi AI Sabitleri
 * 
 * TÜM AI ile ilgili sabit tanımlar bu dosyada.
 * Tek bir noktadan yönetim, çoklu dosya güncellemesine son!
 * 
 * ÖNEMLİ: Bu dosyadaki sabitler FALLBACK olarak kullanılır.
 * Gerçek veriler Firestore'dan çekilir. Bu dosya:
 * 1. Firestore erişilemezse fallback sağlar
 * 2. TypeScript/IDE için tip tanımları sağlar
 * 3. Seed işlemleri için referans sağlar
 * 
 * Import örneği:
 * ```js
 * import { AI_CONTEXTS, AI_PROVIDERS, PROVIDER_INFO } from '@/lib/ai-constants';
 * ```
 * 
 * Dinamik yükleme örneği:
 * ```js
 * import { loadProvidersFromFirestore, loadModelsFromFirestore } from '@/lib/ai-constants';
 * const providers = await loadProvidersFromFirestore();
 * ```
 */

// ============================================================================
// 📊 PROVIDER TYPES - AI Sağlayıcı Tanımları
// ============================================================================

export const AI_PROVIDERS = {
  CLAUDE: "claude",
  GEMINI: "gemini",
  OPENAI: "openai",
};

// Provider aliases (API çağrılarında kullanım için)
export const AI_PROVIDER_TYPES = AI_PROVIDERS;

// ============================================================================
// � FINISH REASONS - AI Response Bitiş Nedenleri (Standardize)
// ============================================================================

/**
 * Standardize edilmiş finish reason değerleri
 * Tüm provider'lar bu değerlere normalize edilir
 */
export const AI_FINISH_REASONS = {
  STOP: "stop",                    // Normal tamamlanma
  MAX_TOKENS: "max_tokens",        // Token limiti aşıldı (TRUNCATED!)
  CONTENT_FILTER: "content_filter", // İçerik filtresi tarafından durduruldu
  TOOL_CALLS: "tool_calls",        // Tool/function call ile sonlandı
  OTHER: "other",                  // Diğer nedenler
  UNKNOWN: "unknown",              // Bilinmeyen neden
};

/**
 * Truncated sayılan finish reason'lar
 * Bu değerler için kullanıcıya uyarı gösterilmeli
 */
export const TRUNCATED_FINISH_REASONS = [
  AI_FINISH_REASONS.MAX_TOKENS,
];

/**
 * Content filter ile ilgili finish reason'lar
 */
export const FILTERED_FINISH_REASONS = [
  AI_FINISH_REASONS.CONTENT_FILTER,
];

/**
 * Check if response was truncated due to token limit
 * @param {string} finishReason - Normalized finish reason
 * @returns {boolean}
 */
export function isResponseTruncated(finishReason) {
  return TRUNCATED_FINISH_REASONS.includes(finishReason);
}

/**
 * Check if response was filtered
 * @param {string} finishReason - Normalized finish reason
 * @returns {boolean}
 */
export function isResponseFiltered(finishReason) {
  return FILTERED_FINISH_REASONS.includes(finishReason);
}

/**
 * Get user-friendly message for finish reason
 * @param {string} finishReason - Normalized finish reason
 * @param {string} language - "tr" or "en"
 * @returns {string}
 */
export function getFinishReasonMessage(finishReason, language = "tr") {
  const messages = {
    tr: {
      [AI_FINISH_REASONS.STOP]: "Başarıyla tamamlandı",
      [AI_FINISH_REASONS.MAX_TOKENS]: "⚠️ İçerik yarıda kesildi (token limiti aşıldı)",
      [AI_FINISH_REASONS.CONTENT_FILTER]: "⚠️ İçerik güvenlik filtresi tarafından durduruldu",
      [AI_FINISH_REASONS.TOOL_CALLS]: "Tool çağrısı ile tamamlandı",
      [AI_FINISH_REASONS.OTHER]: "Tamamlandı",
      [AI_FINISH_REASONS.UNKNOWN]: "Durum bilinmiyor",
    },
    en: {
      [AI_FINISH_REASONS.STOP]: "Completed successfully",
      [AI_FINISH_REASONS.MAX_TOKENS]: "⚠️ Content truncated (token limit reached)",
      [AI_FINISH_REASONS.CONTENT_FILTER]: "⚠️ Content stopped by safety filter",
      [AI_FINISH_REASONS.TOOL_CALLS]: "Completed with tool calls",
      [AI_FINISH_REASONS.OTHER]: "Completed",
      [AI_FINISH_REASONS.UNKNOWN]: "Status unknown",
    },
  };
  
  return messages[language]?.[finishReason] || messages.tr[AI_FINISH_REASONS.UNKNOWN];
}

// ============================================================================
// �📋 PROVIDER INFO - Provider Detaylı Bilgileri
// ============================================================================

export const PROVIDER_INFO = {
  [AI_PROVIDERS.CLAUDE]: {
    id: AI_PROVIDERS.CLAUDE,
    name: "Anthropic Claude",
    icon: "🟣",
    description: "Güçlü reasoning ve analiz yetenekleri",
    website: "https://anthropic.com",
    envKey: "ANTHROPIC_API_KEY",
    color: "purple",
    gradient: "from-purple-500 to-indigo-600",
  },
  [AI_PROVIDERS.GEMINI]: {
    id: AI_PROVIDERS.GEMINI,
    name: "Google Gemini",
    icon: "🔵",
    description: "Multimodal AI, görsel üretim, web search",
    website: "https://ai.google.dev",
    envKey: "GEMINI_API_KEY",
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
  },
  [AI_PROVIDERS.OPENAI]: {
    id: AI_PROVIDERS.OPENAI,
    name: "OpenAI ChatGPT",
    icon: "🟢",
    description: "Genel amaçlı AI, vision, kod üretimi",
    website: "https://openai.com",
    envKey: "OPENAI_API_KEY",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
  },
};

// ============================================================================
// 🎯 AI CONTEXTS - Kullanım Alanı Tanımları
// ============================================================================
// ÖNEMLİ: Bu değerler Firestore ai_configurations koleksiyonundaki 
// document id'leri ile BIREBIR eşleşmeli!
// Kaynak: lib/services/ai-settings-seed.js SEED_CONFIGURATIONS

export const AI_CONTEXTS = {
  // === Blog ===
  BLOG_GENERATION: "blog_generation",           // Tam blog yazısı üretimi
  BLOG_IMPROVEMENT: "blog_improvement",         // Blog içerik iyileştirme
  BLOG_CONTENT_IMPROVEMENT: "blog_content_improvement", // Düzenleme modu
  BLOG_TITLE_GENERATION: "blog_title_generation",   // Tek başlık üretimi
  BLOG_TITLE_DATASET: "blog_title_dataset",     // Toplu başlık dataset üretimi
  BLOG_SEO_OPTIMIZATION: "blog_seo_optimization", // SEO analizi
  BLOG_TRANSLATION: "blog_translation",         // İçerik çevirisi
  
  // === CRM === (Tek context - İletişim Teklifi)
  CRM_COMMUNICATION: "crm_communication",       // Tek CRM contexti - İletişim teklifi
  // Legacy aliases (geriye uyumluluk)
  CRM_EMAIL_REPLY: "crm_communication",         // → CRM_COMMUNICATION
  CRM_EMAIL_SUMMARIZE: "crm_communication",     // → CRM_COMMUNICATION
  CRM_EMAIL_ANALYZE: "crm_communication",       // → CRM_COMMUNICATION
  CRM_QUICK_REPLY: "crm_communication",         // → CRM_COMMUNICATION
  
  // === Social Media ===
  SOCIAL_CONTENT_GENERAL: "social_content_general",     // Genel içerik
  SOCIAL_HASHTAG_GENERATION: "social_hashtag_generation", // Hashtag üretimi
  SOCIAL_CONTENT_OPTIMIZATION: "social_content_optimization", // İçerik optimizasyonu
  SOCIAL_CONTENT_ANALYSIS: "social_content_analysis",   // İçerik analizi
  SOCIAL_CALENDAR_SUGGESTION: "social_calendar_suggestion", // Takvim önerisi
  SOCIAL_TITLE_GENERATION: "social_title_generation",   // Sosyal medya başlık üretimi
  
  // Platform specific
  SOCIAL_INSTAGRAM: "social_instagram",
  SOCIAL_FACEBOOK: "social_facebook", 
  SOCIAL_TWITTER: "social_twitter",
  SOCIAL_LINKEDIN: "social_linkedin",
  SOCIAL_YOUTUBE: "social_youtube",
  SOCIAL_TIKTOK: "social_tiktok",
  
  // === Chat Interfaces ===
  CHAT_GEMINI: "chat_gemini",
  CHAT_CHATGPT: "chat_chatgpt",
  
  // === Content Studio ===
  CONTENT_VISUAL_GENERATION: "content_visual_generation",
  CONTENT_STUDIO_GENERATION: "content_studio_generation", // Platform + content type bazlı içerik üretimi
  
  // Platform + Content Type specific (Content Studio için)
  CONTENT_INSTAGRAM_POST: "content_instagram_post",
  CONTENT_INSTAGRAM_REEL: "content_instagram_reel",
  CONTENT_INSTAGRAM_STORY: "content_instagram_story",
  CONTENT_INSTAGRAM_CAROUSEL: "content_instagram_carousel",
  CONTENT_FACEBOOK_POST: "content_facebook_post",
  CONTENT_FACEBOOK_VIDEO: "content_facebook_video",
  CONTENT_X_TWEET: "content_x_tweet",
  CONTENT_X_THREAD: "content_x_thread",
  CONTENT_LINKEDIN_POST: "content_linkedin_post",
  CONTENT_LINKEDIN_CAROUSEL: "content_linkedin_carousel",
  
  // === Formula ===
  FORMULA_GENERATION: "formula_generation",
  FORMULA_GENERATION_PRO: "formula_generation_pro", // Profesyonel formül üretimi (v4.0)
  // Kategori bazlı formül context'leri
  FORMULA_COSMETIC_PRO: "formula_cosmetic_pro",
  FORMULA_DERMOCOSMETIC_PRO: "formula_dermocosmetic_pro",
  FORMULA_CLEANING_PRO: "formula_cleaning_pro",
  FORMULA_SUPPLEMENT_PRO: "formula_supplement_pro",
  FORMULA_PRICE_ANALYSIS: "formula_price_analysis",
  FORMULA_MARKETING_GENERATION: "formula_marketing_generation",
  
  // === Image Analysis ===
  IMAGE_RELEVANCE_ANALYSIS: "image_relevance_analysis",
  IMAGE_QUICK_ANALYSIS: "image_quick_analysis",
  
  // === Code & Technical ===
  CODE_REVIEW: "code_review",
  
  // === Legacy aliases (eski kod uyumluluğu için) ===
  // Bu değerler yeni değerlere yönlendirilmeli
  BLOG_TITLE: "blog_title_dataset",           // → BLOG_TITLE_DATASET
  CRM_REPLY: "crm_communication",             // → CRM_COMMUNICATION
  CRM_ANALYSIS: "crm_communication",          // → CRM_COMMUNICATION
  SOCIAL_CONTENT: "social_content_general",   // → SOCIAL_CONTENT_GENERAL
  SOCIAL_HASHTAG: "social_hashtag_generation", // → SOCIAL_HASHTAG_GENERATION
  CONTENT_STUDIO: "content_visual_generation", // → CONTENT_VISUAL_GENERATION
  TRANSLATION: "blog_translation",            // → BLOG_TRANSLATION
  IMAGE_SELECTION: "image_relevance_analysis", // → IMAGE_RELEVANCE_ANALYSIS
  IMAGE_GENERATION: "content_visual_generation", // → CONTENT_VISUAL_GENERATION
  FORMULA_ANALYSIS: "formula_generation",     // → FORMULA_GENERATION
};

// Context display names (UI için)
export const CONTEXT_DISPLAY_NAMES = {
  // Blog
  [AI_CONTEXTS.BLOG_GENERATION]: "Blog - İçerik Üretimi",
  [AI_CONTEXTS.BLOG_IMPROVEMENT]: "Blog - İçerik İyileştirme",
  [AI_CONTEXTS.BLOG_CONTENT_IMPROVEMENT]: "Blog - Düzenleme",
  [AI_CONTEXTS.BLOG_TITLE_GENERATION]: "Blog - Tek Başlık Üretimi",
  [AI_CONTEXTS.BLOG_TITLE_DATASET]: "Blog - Başlık Dataset (Toplu)",
  [AI_CONTEXTS.BLOG_SEO_OPTIMIZATION]: "Blog - SEO Optimizasyonu",
  [AI_CONTEXTS.BLOG_TRANSLATION]: "Blog - Çeviri",
  
  // CRM
  [AI_CONTEXTS.CRM_COMMUNICATION]: "CRM - İletişim Teklifi",
  
  // Social Media
  [AI_CONTEXTS.SOCIAL_CONTENT_GENERAL]: "Sosyal Medya - Genel İçerik",
  [AI_CONTEXTS.SOCIAL_HASHTAG_GENERATION]: "Sosyal Medya - Hashtag",
  [AI_CONTEXTS.SOCIAL_CONTENT_OPTIMIZATION]: "Sosyal Medya - Optimizasyon",
  [AI_CONTEXTS.SOCIAL_CONTENT_ANALYSIS]: "Sosyal Medya - Analiz",
  [AI_CONTEXTS.SOCIAL_CALENDAR_SUGGESTION]: "Sosyal Medya - Takvim",
  [AI_CONTEXTS.SOCIAL_TITLE_GENERATION]: "Sosyal Medya - Başlık Üretimi",
  [AI_CONTEXTS.SOCIAL_INSTAGRAM]: "Instagram İçeriği",
  [AI_CONTEXTS.SOCIAL_FACEBOOK]: "Facebook İçeriği",
  [AI_CONTEXTS.SOCIAL_TWITTER]: "Twitter/X İçeriği",
  [AI_CONTEXTS.SOCIAL_LINKEDIN]: "LinkedIn İçeriği",
  [AI_CONTEXTS.SOCIAL_YOUTUBE]: "YouTube İçeriği",
  [AI_CONTEXTS.SOCIAL_TIKTOK]: "TikTok İçeriği",
  
  // Chat
  [AI_CONTEXTS.CHAT_GEMINI]: "Gemini Chat",
  [AI_CONTEXTS.CHAT_CHATGPT]: "ChatGPT Chat",
  
  // Content Studio
  [AI_CONTEXTS.CONTENT_VISUAL_GENERATION]: "Görsel Üretimi",
  [AI_CONTEXTS.CONTENT_STUDIO_GENERATION]: "Content Studio - İçerik Üretimi",
  [AI_CONTEXTS.CONTENT_INSTAGRAM_POST]: "Instagram Post",
  [AI_CONTEXTS.CONTENT_INSTAGRAM_REEL]: "Instagram Reel",
  [AI_CONTEXTS.CONTENT_INSTAGRAM_STORY]: "Instagram Story",
  [AI_CONTEXTS.CONTENT_INSTAGRAM_CAROUSEL]: "Instagram Carousel",
  [AI_CONTEXTS.CONTENT_FACEBOOK_POST]: "Facebook Post",
  [AI_CONTEXTS.CONTENT_FACEBOOK_VIDEO]: "Facebook Video",
  [AI_CONTEXTS.CONTENT_X_TWEET]: "X Tweet",
  [AI_CONTEXTS.CONTENT_X_THREAD]: "X Thread",
  [AI_CONTEXTS.CONTENT_LINKEDIN_POST]: "LinkedIn Post",
  [AI_CONTEXTS.CONTENT_LINKEDIN_CAROUSEL]: "LinkedIn Carousel",
  
  // Formula
  [AI_CONTEXTS.FORMULA_GENERATION]: "Formül Üretimi",
  [AI_CONTEXTS.FORMULA_GENERATION_PRO]: "Profesyonel Formül Üretimi (v4.0)",
  [AI_CONTEXTS.FORMULA_COSMETIC_PRO]: "Kozmetik Formül (v4.0)",
  [AI_CONTEXTS.FORMULA_DERMOCOSMETIC_PRO]: "Dermokozmetik Formül (v4.0)",
  [AI_CONTEXTS.FORMULA_CLEANING_PRO]: "Temizlik Ürünü Formül (v4.0)",
  [AI_CONTEXTS.FORMULA_SUPPLEMENT_PRO]: "Gıda Takviyesi Formül (v4.0)",
  [AI_CONTEXTS.FORMULA_PRICE_ANALYSIS]: "Fiyat Analizi",
  [AI_CONTEXTS.FORMULA_MARKETING_GENERATION]: "Formül Pazarlama İçeriği",
  
  // Image Analysis
  [AI_CONTEXTS.IMAGE_RELEVANCE_ANALYSIS]: "Görsel Analizi",
  [AI_CONTEXTS.IMAGE_QUICK_ANALYSIS]: "Hızlı Görsel Analizi",
  
  // Code
  [AI_CONTEXTS.CODE_REVIEW]: "Kod İncelemesi",
};

// ============================================================================
// 📁 MODEL CATEGORIES - Model Kategorileri
// ============================================================================

export const MODEL_CATEGORIES = {
  CHAT: "chat",
  IMAGE_GENERATION: "image_generation",
  VISION: "vision",
  REASONING: "reasoning",
  CODE: "code",
  EMBEDDING: "embedding",
};

// ============================================================================
// 📝 PROMPT CATEGORIES - Prompt Kategorileri
// ============================================================================

export const PROMPT_CATEGORIES = {
  // CRM & Müşteri İletişimi (Tek prompt - İletişim Teklifi)
  CRM_COMMUNICATION: "crm_communication",
  
  // Content Generation
  SOCIAL_MEDIA: "social_media",
  BLOG_CONTENT: "blog_content",
  TITLE_GENERATION: "title_generation",
  SEO_OPTIMIZATION: "seo_optimization",
  
  // Chat & Assistant
  GENERAL_ASSISTANT: "general_assistant",
  GEMINI_CHAT: "gemini_chat",
  CHATGPT_CHAT: "chatgpt_chat",
  
  // Analysis
  SENTIMENT_ANALYSIS: "sentiment_analysis",
  IMAGE_ANALYSIS: "image_analysis",
  CODE_REVIEW: "code_review",
  
  // Translation
  TRANSLATION: "translation",
  
  // Formulas & Technical
  FORMULA_ANALYSIS: "formula_analysis",
  PRODUCT_DESCRIPTION: "product_description",
};

// ============================================================================
// 🗄️ FIRESTORE COLLECTIONS - Koleksiyon İsimleri
// ============================================================================

export const AI_COLLECTIONS = {
  PROVIDERS: "ai_providers",
  MODELS: "ai_models",
  PROMPTS: "ai_prompts",
  CONFIGURATIONS: "ai_configurations",
};

// ============================================================================
// ⚙️ DEFAULT SETTINGS - Varsayılan Ayarlar
// ============================================================================

export const DEFAULT_AI_SETTINGS = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

// Fallback modeller (Firestore'dan çekilemezse)
export const FALLBACK_MODELS = [
  { 
    id: "gemini-2.5-flash", 
    modelId: "gemini-2.5-flash", 
    name: "Gemini 2.5 Flash", 
    displayName: "Gemini 2.5 Flash",
    provider: AI_PROVIDERS.GEMINI,
    isDefault: true,
  },
  { 
    id: "gemini-2.5-pro", 
    modelId: "gemini-2.5-pro", 
    name: "Gemini 2.5 Pro", 
    displayName: "Gemini 2.5 Pro",
    provider: AI_PROVIDERS.GEMINI,
  },
  { 
    id: "claude-sonnet-4-20250514", 
    modelId: "claude-sonnet-4-20250514", 
    name: "Claude Sonnet 4", 
    displayName: "Claude Sonnet 4",
    provider: AI_PROVIDERS.CLAUDE,
  },
  { 
    id: "gpt-4o", 
    modelId: "gpt-4o", 
    name: "GPT-4o", 
    displayName: "GPT-4o",
    provider: AI_PROVIDERS.OPENAI,
  },
];

// ============================================================================
// 🔧 HELPER FUNCTIONS
// ============================================================================

/**
 * Provider ikonu getir
 * @param {string} providerId - Provider ID
 * @returns {string} Provider emoji ikonu
 */
export function getProviderIcon(providerId) {
  return PROVIDER_INFO[providerId]?.icon || "⚪";
}

/**
 * Provider adı getir
 * @param {string} providerId - Provider ID
 * @returns {string} Provider görüntü adı
 */
export function getProviderName(providerId) {
  return PROVIDER_INFO[providerId]?.name || providerId;
}

/**
 * Context görüntü adı getir
 * @param {string} contextKey - Context key
 * @returns {string} Context görüntü adı
 */
export function getContextDisplayName(contextKey) {
  return CONTEXT_DISPLAY_NAMES[contextKey] || contextKey;
}

/**
 * Provider ID'den provider tipini al
 * @param {string} modelId - Model ID
 * @returns {string} Provider ID
 */
export function getProviderFromModelId(modelId) {
  if (!modelId) return AI_PROVIDERS.CLAUDE;
  
  const modelLower = modelId.toLowerCase();
  
  if (modelLower.includes("gemini")) return AI_PROVIDERS.GEMINI;
  if (modelLower.includes("gpt") || modelLower.includes("o1") || modelLower.includes("o3")) return AI_PROVIDERS.OPENAI;
  if (modelLower.includes("claude")) return AI_PROVIDERS.CLAUDE;
  
  return AI_PROVIDERS.CLAUDE;
}

/**
 * Varsayılan fallback modeli getir
 * @returns {Object} Fallback model
 */
export function getDefaultFallbackModel() {
  return FALLBACK_MODELS.find(m => m.isDefault) || FALLBACK_MODELS[0];
}

// ============================================================================
// 🔄 FIRESTORE DYNAMIC LOADERS
// Prodüksiyon ortamında Firestore'dan dinamik yükleme
// ============================================================================

// Cache for Firestore data (runtime)
const firestoreCache = {
  providers: null,
  models: null,
  contexts: null,
  prompts: null,
  lastFetch: null,
  CACHE_TTL: 5 * 60 * 1000, // 5 dakika
};

/**
 * Cache'in geçerli olup olmadığını kontrol et
 * @returns {boolean}
 */
function isCacheValid() {
  if (!firestoreCache.lastFetch) return false;
  return Date.now() - firestoreCache.lastFetch < firestoreCache.CACHE_TTL;
}

/**
 * Cache'i temizle
 */
export function clearAIConstantsCache() {
  firestoreCache.providers = null;
  firestoreCache.models = null;
  firestoreCache.contexts = null;
  firestoreCache.prompts = null;
  firestoreCache.lastFetch = null;
}

/**
 * Firestore'dan provider'ları yükle
 * @param {Object} db - Firestore db instance
 * @returns {Promise<Object>} Provider map
 */
export async function loadProvidersFromFirestore(db) {
  if (firestoreCache.providers && isCacheValid()) {
    return firestoreCache.providers;
  }

  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const providersRef = collection(db, AI_COLLECTIONS.PROVIDERS);
    const q = query(providersRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    const providers = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      providers[doc.id] = {
        id: doc.id,
        ...data,
      };
    });
    
    firestoreCache.providers = providers;
    firestoreCache.lastFetch = Date.now();
    
    return providers;
  } catch (error) {
    console.warn("⚠️ Failed to load providers from Firestore, using fallback:", error.message);
    return PROVIDER_INFO;
  }
}

/**
 * Firestore'dan modelleri yükle
 * @param {Object} db - Firestore db instance
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} Model array
 */
export async function loadModelsFromFirestore(db, options = {}) {
  const { provider, activeOnly = true } = options;
  
  // Cache key based on options
  const cacheKey = `models_${provider || 'all'}_${activeOnly}`;
  
  if (firestoreCache.models?.[cacheKey] && isCacheValid()) {
    return firestoreCache.models[cacheKey];
  }

  try {
    const { collection, getDocs, query, where, orderBy } = await import("firebase/firestore");
    const modelsRef = collection(db, AI_COLLECTIONS.MODELS);
    
    let q;
    if (provider && activeOnly) {
      q = query(modelsRef, 
        where("provider", "==", provider),
        where("isActive", "==", true),
        orderBy("order", "asc")
      );
    } else if (provider) {
      q = query(modelsRef, 
        where("provider", "==", provider),
        orderBy("order", "asc")
      );
    } else if (activeOnly) {
      q = query(modelsRef, 
        where("isActive", "==", true),
        orderBy("provider"),
        orderBy("order", "asc")
      );
    } else {
      q = query(modelsRef, orderBy("provider"), orderBy("order", "asc"));
    }
    
    const snapshot = await getDocs(q);
    
    const models = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Initialize cache object if needed
    if (!firestoreCache.models) {
      firestoreCache.models = {};
    }
    firestoreCache.models[cacheKey] = models;
    firestoreCache.lastFetch = Date.now();
    
    return models;
  } catch (error) {
    console.warn("⚠️ Failed to load models from Firestore, using fallback:", error.message);
    return FALLBACK_MODELS;
  }
}

/**
 * Firestore'dan context konfigürasyonlarını yükle
 * @param {Object} db - Firestore db instance
 * @param {string} contextKey - Specific context key (optional)
 * @returns {Promise<Object|Array>} Configuration(s)
 */
export async function loadContextsFromFirestore(db, contextKey = null) {
  try {
    const { collection, doc, getDoc, getDocs, query, where } = await import("firebase/firestore");
    
    if (contextKey) {
      // Tek context getir
      const configRef = doc(db, AI_COLLECTIONS.CONFIGURATIONS, contextKey);
      const snapshot = await getDoc(configRef);
      
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      
      // contextId ile ara
      const configsRef = collection(db, AI_COLLECTIONS.CONFIGURATIONS);
      const q = query(configsRef, where("contextId", "==", contextKey));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() };
      }
      
      return null;
    }
    
    // Tüm context'leri getir
    const configsRef = collection(db, AI_COLLECTIONS.CONFIGURATIONS);
    const snapshot = await getDocs(configsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.warn("⚠️ Failed to load contexts from Firestore:", error.message);
    return contextKey ? null : [];
  }
}

/**
 * Firestore'dan prompt'ları yükle
 * @param {Object} db - Firestore db instance
 * @param {string} promptKey - Specific prompt key (optional)
 * @returns {Promise<Object|Array>} Prompt(s)
 */
export async function loadPromptsFromFirestore(db, promptKey = null) {
  try {
    const { collection, getDocs, query, where } = await import("firebase/firestore");
    const promptsRef = collection(db, AI_COLLECTIONS.PROMPTS);
    
    if (promptKey) {
      const q = query(promptsRef, where("key", "==", promptKey));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    }
    
    const snapshot = await getDocs(promptsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.warn("⚠️ Failed to load prompts from Firestore:", error.message);
    return promptKey ? null : [];
  }
}

/**
 * Tüm AI ayarlarını Firestore'dan yükle (Batch)
 * @param {Object} db - Firestore db instance
 * @returns {Promise<Object>} All AI settings
 */
export async function loadAllAISettings(db) {
  const [providers, models, contexts, prompts] = await Promise.all([
    loadProvidersFromFirestore(db),
    loadModelsFromFirestore(db, { activeOnly: true }),
    loadContextsFromFirestore(db),
    loadPromptsFromFirestore(db),
  ]);
  
  return {
    providers,
    models,
    contexts,
    prompts,
    loadedAt: new Date().toISOString(),
  };
}

// ============================================================================
// 🎯 CONTEXT-AWARE GETTERS
// Firestore + Fallback mantığı ile güvenli veri erişimi
// ============================================================================

/**
 * Context için tam konfigürasyon getir (model + prompt dahil)
 * @param {Object} db - Firestore db instance
 * @param {string} contextKey - Context key (e.g., "blog_generation")
 * @returns {Promise<Object>} Full configuration with model and prompt
 */
export async function getFullContextConfig(db, contextKey) {
  try {
    // 1. Context konfigürasyonunu al
    const config = await loadContextsFromFirestore(db, contextKey);
    if (!config) {
      return { config: null, model: null, prompt: null, fallback: true };
    }
    
    // 2. Default model bilgisini al
    let model = null;
    if (config.defaultModelId) {
      const models = await loadModelsFromFirestore(db, { activeOnly: true });
      model = models.find(m => m.modelId === config.defaultModelId || m.id === config.defaultModelId);
    }
    
    // 3. Prompt bilgisini al
    let prompt = null;
    if (config.promptKey) {
      prompt = await loadPromptsFromFirestore(db, config.promptKey);
    }
    
    return {
      config,
      model,
      prompt,
      allowedModels: config.allowedModelIds || [],
      settings: config.settings || DEFAULT_AI_SETTINGS,
      fallback: false,
    };
  } catch (error) {
    console.error("❌ Failed to get full context config:", error);
    return { config: null, model: null, prompt: null, fallback: true };
  }
}

