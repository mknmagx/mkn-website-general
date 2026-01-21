/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🤖 MKN Group - Merkezi AI Model Konfigürasyonu
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bu dosya tüm AI modellerinin merkezi yönetimini sağlar.
 * Tüm admin sayfaları bu dosyadan model bilgilerini almalıdır.
 *
 * Desteklenen AI Sağlayıcıları:
 * 1. Anthropic Claude (claude-haiku, claude-sonnet, claude-opus)
 * 2. Google Gemini (gemini-2.5-flash, gemini-3-pro, gemini-3-pro-image)
 * 3. OpenAI ChatGPT (gpt-4o, gpt-4o-mini, gpt-4-turbo, o1-preview, o1-mini)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Brain, Zap, Cpu, Sparkles } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// ANTHROPIC CLAUDE MODELLERİ
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Claude Model API ID'leri
 * API çağrılarında kullanılacak gerçek model isimleri
 */
export const CLAUDE_API_IDS = {
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-5-20250929",
  opus: "claude-opus-4-1-20250805",
};

/**
 * Claude Model Detayları (UI ve işlevsellik için)
 */
export const CLAUDE_MODELS = {
  "claude-haiku": {
    id: "claude-haiku",
    value: "claude-haiku",
    name: "Claude Haiku 4.5",
    label: "Claude Haiku 4.5",
    shortLabel: "Haiku 4 (Hızlı)",
    provider: "Anthropic",
    apiId: CLAUDE_API_IDS.haiku,
    alias: "claude-haiku-4-5",
    description: "En hızlı model, yakın-sınır zeka ile optimal performans",
    shortDescription: "Hızlı ve ekonomik - Temel üretim için ideal",
    icon: Zap,
    iconEmoji: "⚡",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-600",
    maxTokens: 3000,
    defaultMaxTokens: 3000,
    versions: ["4.5"],
    capabilities: ["Hızlı Üretim", "Blog Yazısı", "İçerik Optimizasyonu", "SEO"],
    recommended: true,
    isDefault: true,
    speed: "Çok Hızlı",
    cost: "Düşük",
    type: "text",
    supportsVision: false,
    supportsTools: true,
  },
  "claude-sonnet": {
    id: "claude-sonnet",
    value: "claude-sonnet",
    name: "Claude Sonnet 4.5",
    label: "Claude Sonnet 4.5",
    shortLabel: "Sonnet 4 (Önerilen)",
    provider: "Anthropic",
    apiId: CLAUDE_API_IDS.sonnet,
    alias: "claude-sonnet-4-5",
    description: "En akıllı model, karmaşık görevler ve kodlama için ideal",
    shortDescription: "Dengeli performans - Profesyonel geliştirme için önerilir",
    icon: Brain,
    iconEmoji: "🧠",
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-gradient-to-r from-purple-500 to-indigo-600",
    maxTokens: 4000,
    defaultMaxTokens: 4000,
    versions: ["4.5"],
    capabilities: ["Karmaşık Analiz", "Yaratıcı Yazım", "Teknik İçerik", "SEO Optimizasyonu"],
    recommended: true,
    isDefault: false,
    speed: "Hızlı",
    cost: "Orta",
    type: "text",
    supportsVision: true,
    supportsTools: true,
  },
  "claude-opus": {
    id: "claude-opus",
    value: "claude-opus",
    name: "Claude Opus 4.1",
    label: "Claude Opus 4.1",
    shortLabel: "Opus 4 (Güçlü)",
    provider: "Anthropic",
    apiId: CLAUDE_API_IDS.opus,
    alias: "claude-opus-4-1",
    description: "Özel görevler için istisnai model, detaylı analiz",
    shortDescription: "En güçlü model - Kompleks ve özel işler için en iyi seçim",
    icon: Cpu,
    iconEmoji: "🚀",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-gradient-to-r from-blue-500 to-cyan-600",
    maxTokens: 3500,
    defaultMaxTokens: 3500,
    versions: ["4.1"],
    capabilities: ["Detaylı Analiz", "Araştırma", "Profesyonel İçerik"],
    recommended: false,
    isDefault: false,
    speed: "Orta",
    cost: "Yüksek",
    type: "text",
    supportsVision: true,
    supportsTools: true,
  },
};

/**
 * Claude modelleri array formatında (Select/Dropdown için)
 */
export const CLAUDE_MODELS_ARRAY = Object.values(CLAUDE_MODELS);

/**
 * Claude modelleri basit array formatında (value/label)
 */
export const CLAUDE_MODELS_SIMPLE = [
  { value: "claude-sonnet-4", label: "Sonnet 4 (Önerilen)", apiId: CLAUDE_API_IDS.sonnet },
  { value: "claude-opus-4", label: "Opus 4 (Güçlü)", apiId: CLAUDE_API_IDS.opus },
  { value: "claude-haiku-4", label: "Haiku 4 (Hızlı)", apiId: CLAUDE_API_IDS.haiku },
];

/**
 * @deprecated CLAUDE_CONTENT_STUDIO_MODELS artık kullanılmıyor!
 * 
 * YENİ YAPI: Modeller Firestore ai_models koleksiyonundan useUnifiedAI hook'u ile çekiliyor.
 * Bu export sadece geriye dönük uyumluluk için korunuyor.
 * 
 * KULLANIM:
 * ```javascript
 * import { useUnifiedAI, AI_CONTEXTS } from '@/hooks/use-unified-ai';
 * const { availableModels, selectedModel } = useUnifiedAI(AI_CONTEXTS.CONTENT_STUDIO_GENERATION);
 * ```
 * 
 * TÜM AI ADMIN SAYFALARI GEÇİŞ TAMAMLANINCA KALDIRILACAK.
 */
export const CLAUDE_CONTENT_STUDIO_MODELS = [
  {
    value: "claude-sonnet-4",
    label: "Claude Sonnet 4 (Önerilen)",
    icon: Sparkles,
    color: "from-purple-500 to-purple-600",
    apiId: CLAUDE_API_IDS.sonnet,
  },
  {
    value: "claude-opus-4",
    label: "Claude Opus 4 (Güçlü)",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    apiId: CLAUDE_API_IDS.opus,
  },
  {
    value: "claude-haiku-4",
    label: "Claude Haiku 4 (Hızlı)",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    apiId: CLAUDE_API_IDS.haiku,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE GEMİNİ MODELLERİ
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gemini Model API ID'leri
 */
export const GEMINI_API_IDS = {
  pro3: "gemini-3-pro-preview",
  proImage3: "gemini-3-pro-image-preview",
  flash25: "gemini-2.5-flash",
};

/**
 * Gemini Chat Modelleri (Detaylı)
 */
export const GEMINI_MODELS = {
  "gemini-3-pro-preview": {
    id: "gemini-3-pro-preview",
    value: "gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    label: "Gemini 3 Pro",
    provider: "Google",
    apiId: GEMINI_API_IDS.pro3,
    description: "En güçlü reasoning-first + multimodal model (1M token context)",
    icon: "🚀",
    type: "text",
    features: ["Text", "Vision", "Audio", "PDF", "🛠️ Tools", "🧠 Deep Reasoning", "📚 1M Context"],
    supportsGrounding: false,
    supportsTools: true,
    supportsImageGen: false,
    supportsReasoning: true,
    supportsLongContext: true,
    supportedModalities: ["text", "image", "audio", "video", "pdf"],
    defaultWebSearch: false,
    maxInputTokens: 1000000,
    maxOutputTokens: 32768,
    defaultConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      candidateCount: 1,
    },
    useCases: [
      "Complex reasoning & analysis",
      "Long document analysis",
      "Code analysis & generation",
      "Multi-step planning",
      "Agent-like automation",
      "Data analysis & reports",
    ],
  },
  "gemini-3-pro-image-preview": {
    id: "gemini-3-pro-image-preview",
    value: "gemini-3-pro-image-preview",
    name: "Gemini 3 Pro Image (Nano Banana Pro)",
    label: "Gemini 3 Pro Image",
    provider: "Google",
    apiId: GEMINI_API_IDS.proImage3,
    description: "Gelişmiş görsel üretimi + multi-turn editing + reasoning",
    icon: "🎨",
    type: "image",
    features: ["🎨 4K Image Gen", "✏️ Multi-turn Edit", "🔍 Google Search Grounding", "🧠 Reasoning", "📐 10 Aspect Ratios", "🖼️ 14 Input Images"],
    supportsGrounding: true,
    supportsTools: false,
    supportsImageGen: true,
    supportsMultiTurnEdit: true,
    defaultWebSearch: false,
    maxInputTokens: 65536,
    maxOutputTokens: 32768,
    maxInputImages: 14,
    maxImageSize: 7 * 1024 * 1024,
    maxTotalInputSize: 500 * 1024 * 1024,
    supportedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"],
    supportedAspectRatios: ["1:1", "3:2", "2:3", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
    supportedImageSizes: ["1K", "2K", "4K"],
    hasSynthIDWatermark: true,
    defaultConfig: {
      temperature: 1.0,
      topP: 0.95,
      topK: 64,
      candidateCount: 1,
      responseModalities: ["IMAGE", "TEXT"],
    },
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    value: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    label: "Gemini 2.5 Flash",
    provider: "Google",
    apiId: GEMINI_API_IDS.flash25,
    description: "Hızlı + düşük gecikme + thinking özelliği + web search",
    icon: "⚡",
    type: "text",
    features: ["Text", "Vision", "Audio", "🌐 Grounding (ON)", "🛠️ Tools", "💭 Thinking", "⚡ Low Latency"],
    supportsGrounding: true,
    supportsTools: true,
    supportsImageGen: false,
    supportsThinking: true,
    supportsMultimodal: true,
    supportedModalities: ["text", "image", "audio", "document"],
    defaultWebSearch: true,
    maxInputTokens: 1000000,
    maxOutputTokens: 8192,
    isDefault: true,
    performanceProfile: {
      latency: "low",
      throughput: "high",
      costEfficiency: "high",
    },
    defaultConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      candidateCount: 1,
    },
    useCases: [
      "Real-time chatbots",
      "Customer service",
      "High-volume requests",
      "Fast content generation",
      "Automation workflows",
      "Quick analysis",
    ],
  },
};

/**
 * Gemini modelleri array formatında
 */
export const GEMINI_MODELS_ARRAY = Object.values(GEMINI_MODELS);

/**
 * Gemini Chat için varsayılan model
 */
export const DEFAULT_GEMINI_CHAT_MODEL = "gemini-2.5-flash";

/**
 * Gemini görsel üretim modeli
 */
export const GEMINI_IMAGE_MODEL = "gemini-3-pro-image-preview";

// ═══════════════════════════════════════════════════════════════════════════════
// OPENAI CHATGPT MODELLERİ
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ChatGPT Model API ID'leri
 */
export const CHATGPT_API_IDS = {
  gpt4o: "gpt-4o",
  gpt4oMini: "gpt-4o-mini",
  gpt4Turbo: "gpt-4-turbo",
  o1Preview: "o1-preview",
  o1Mini: "o1-mini",
  gpt35Turbo: "gpt-3.5-turbo",
};

/**
 * ChatGPT Modelleri (Detaylı)
 */
export const CHATGPT_MODELS = {
  "gpt-4o": {
    id: "gpt-4o",
    value: "gpt-4o",
    name: "GPT-4o",
    label: "GPT-4o",
    provider: "OpenAI",
    apiId: CHATGPT_API_IDS.gpt4o,
    description: "En güçlü ve en hızlı multimodal model (128K context)",
    icon: "🚀",
    type: "text",
    features: ["Text", "Vision", "🛠️ Tools", "📋 JSON Mode", "🎯 Function Calling", "📚 128K Context"],
    supportsVision: true,
    supportsTools: true,
    supportsJSON: true,
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    defaultConfig: {
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    value: "gpt-4o-mini",
    name: "GPT-4o Mini",
    label: "GPT-4o Mini",
    provider: "OpenAI",
    apiId: CHATGPT_API_IDS.gpt4oMini,
    description: "Hızlı ve ekonomik multimodal model",
    icon: "⚡",
    type: "text",
    features: ["Text", "Vision", "🛠️ Tools", "📋 JSON Mode", "💰 Ekonomik", "📚 128K Context"],
    supportsVision: true,
    supportsTools: true,
    supportsJSON: true,
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    isDefault: true,
    defaultConfig: {
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  },
  "gpt-4-turbo": {
    id: "gpt-4-turbo",
    value: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    label: "GPT-4 Turbo",
    provider: "OpenAI",
    apiId: CHATGPT_API_IDS.gpt4Turbo,
    description: "Güçlü ve güvenilir model (vision destekli)",
    icon: "🔥",
    type: "text",
    features: ["Text", "Vision", "🛠️ Tools", "📋 JSON Mode", "📚 128K Context"],
    supportsVision: true,
    supportsTools: true,
    supportsJSON: true,
    maxInputTokens: 128000,
    maxOutputTokens: 4096,
    defaultConfig: {
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  },
  "o1-preview": {
    id: "o1-preview",
    value: "o1-preview",
    name: "o1 Preview",
    label: "o1 Preview",
    provider: "OpenAI",
    apiId: CHATGPT_API_IDS.o1Preview,
    description: "İleri düzey reasoning ve problem çözme",
    icon: "🧠",
    type: "reasoning",
    features: ["🧠 Advanced Reasoning", "Vision", "🔍 Deep Analysis", "📐 Math & Code", "📚 128K Context"],
    supportsVision: true,
    supportsTools: false,
    supportsJSON: false,
    maxInputTokens: 128000,
    maxOutputTokens: 32768,
    defaultConfig: {
      temperature: 1,
    },
  },
  "o1-mini": {
    id: "o1-mini",
    value: "o1-mini",
    name: "o1 Mini",
    label: "o1 Mini",
    provider: "OpenAI",
    apiId: CHATGPT_API_IDS.o1Mini,
    description: "Hızlı reasoning modeli",
    icon: "💡",
    type: "reasoning",
    features: ["🧠 Reasoning", "Vision", "💰 Ekonomik", "📐 Math & Code", "📚 128K Context"],
    supportsVision: true,
    supportsTools: false,
    supportsJSON: false,
    maxInputTokens: 128000,
    maxOutputTokens: 65536,
    defaultConfig: {
      temperature: 1,
    },
  },
  "gpt-3.5-turbo": {
    id: "gpt-3.5-turbo",
    value: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    label: "GPT-3.5 Turbo",
    provider: "OpenAI",
    apiId: CHATGPT_API_IDS.gpt35Turbo,
    description: "Hızlı ve ekonomik model",
    icon: "💚",
    type: "text",
    features: ["Text", "🛠️ Tools", "📋 JSON Mode", "💰 En Ekonomik", "📚 16K Context"],
    supportsVision: false,
    supportsTools: true,
    supportsJSON: true,
    maxInputTokens: 16385,
    maxOutputTokens: 4096,
    defaultConfig: {
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  },
};

/**
 * ChatGPT modelleri array formatında
 */
export const CHATGPT_MODELS_ARRAY = Object.values(CHATGPT_MODELS);

/**
 * ChatGPT varsayılan model
 */
export const DEFAULT_CHATGPT_MODEL = "gpt-4o-mini";

// ═══════════════════════════════════════════════════════════════════════════════
// VARSAYILAN MODELLER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Tüm sağlayıcılar için varsayılan modeller
 */
export const DEFAULT_MODELS = {
  claude: "claude-haiku",
  gemini: DEFAULT_GEMINI_CHAT_MODEL,
  chatgpt: DEFAULT_CHATGPT_MODEL,
};

/**
 * Claude için varsayılan model
 */
export const DEFAULT_CLAUDE_MODEL = "claude-haiku";

// ═══════════════════════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Model ID'den API ID'yi al
 * @param {string} modelId - Model ID (örn: "claude-haiku", "claude-sonnet-4")
 * @param {string} provider - Sağlayıcı ("claude" | "gemini" | "chatgpt")
 * @returns {string} API ID
 */
export function getApiIdFromModelId(modelId, provider = "claude") {
  if (provider === "claude") {
    // Kısa format kontrolü (claude-haiku, claude-sonnet, claude-opus)
    if (CLAUDE_MODELS[modelId]) {
      return CLAUDE_MODELS[modelId].apiId;
    }
    // Uzun format kontrolü (claude-sonnet-4, claude-opus-4, claude-haiku-4)
    const shortId = modelId.replace(/-4$/, "").replace("claude-", "claude-");
    if (modelId.includes("sonnet")) return CLAUDE_API_IDS.sonnet;
    if (modelId.includes("opus")) return CLAUDE_API_IDS.opus;
    if (modelId.includes("haiku")) return CLAUDE_API_IDS.haiku;
  }
  
  if (provider === "gemini") {
    if (GEMINI_MODELS[modelId]) {
      return GEMINI_MODELS[modelId].apiId;
    }
  }
  
  if (provider === "chatgpt") {
    if (CHATGPT_MODELS[modelId]) {
      return CHATGPT_MODELS[modelId].apiId;
    }
  }
  
  return modelId; // Bulunamazsa orijinal ID'yi döndür
}

/**
 * Model bilgilerini al
 * @param {string} modelId - Model ID
 * @param {string} provider - Sağlayıcı
 * @returns {Object|null} Model bilgileri
 */
export function getModelInfo(modelId, provider = "claude") {
  if (provider === "claude") {
    if (CLAUDE_MODELS[modelId]) return CLAUDE_MODELS[modelId];
    // Uzun format kontrolü
    if (modelId.includes("sonnet")) return CLAUDE_MODELS["claude-sonnet"];
    if (modelId.includes("opus")) return CLAUDE_MODELS["claude-opus"];
    if (modelId.includes("haiku")) return CLAUDE_MODELS["claude-haiku"];
  }
  
  if (provider === "gemini") {
    return GEMINI_MODELS[modelId] || null;
  }
  
  if (provider === "chatgpt") {
    return CHATGPT_MODELS[modelId] || null;
  }
  
  return null;
}

/**
 * Model adını al (UI gösterimi için)
 * @param {string} modelId - Model ID
 * @param {string} provider - Sağlayıcı
 * @returns {string} Model adı
 */
export function getModelName(modelId, provider = "claude") {
  const info = getModelInfo(modelId, provider);
  return info?.name || info?.label || modelId;
}

/**
 * Model ikonunu al
 * @param {string} modelId - Model ID
 * @param {string} provider - Sağlayıcı
 * @returns {string|Component} İkon
 */
export function getModelIcon(modelId, provider = "claude") {
  const info = getModelInfo(modelId, provider);
  return info?.icon || info?.iconEmoji || "🤖";
}

/**
 * Varsayılan Claude model ID'sini API ID'ye çevir
 * @param {string} modelId - Kısa model ID
 * @returns {string} API ID
 */
export function claudeModelToApiId(modelId) {
  return getApiIdFromModelId(modelId, "claude");
}

/**
 * Model seçimi için standart dropdown seçenekleri oluştur
 * @param {string} provider - Sağlayıcı ("claude" | "gemini" | "chatgpt")
 * @param {string} format - Format ("simple" | "detailed")
 * @returns {Array} Dropdown seçenekleri
 */
export function getModelOptions(provider = "claude", format = "simple") {
  if (provider === "claude") {
    if (format === "simple") {
      return CLAUDE_MODELS_SIMPLE;
    }
    return CLAUDE_MODELS_ARRAY;
  }
  
  if (provider === "gemini") {
    return GEMINI_MODELS_ARRAY;
  }
  
  if (provider === "chatgpt") {
    return CHATGPT_MODELS_ARRAY;
  }
  
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI İÇERİK AYARLARI
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AI İçerik üretim ayarları
 */
export const AI_CONTENT_SETTINGS = {
  creativity: {
    label: "Yaratıcılık Seviyesi",
    description: "İçeriğin ne kadar yaratıcı ve özgün olacağını belirler",
    min: 0,
    max: 100,
    step: 10,
    default: 70,
  },
  technicality: {
    label: "Teknik Detay Seviyesi",
    description: "İçeriğe dahil edilecek teknik bilgi miktarı",
    min: 0,
    max: 100,
    step: 10,
    default: 60,
  },
  seoOptimization: {
    label: "SEO Optimizasyonu",
    description: "Anahtar kelime yoğunluğu ve SEO odağı",
    min: 0,
    max: 100,
    step: 10,
    default: 80,
  },
  readability: {
    label: "Okunabilirlik",
    description: "Metnin anlaşılabilirlik seviyesi",
    min: 0,
    max: 100,
    step: 10,
    default: 75,
  },
};

/**
 * Varsayılan AI ayarları
 */
export const DEFAULT_AI_SETTINGS = {
  creativity: AI_CONTENT_SETTINGS.creativity.default,
  technicality: AI_CONTENT_SETTINGS.technicality.default,
  seoOptimization: AI_CONTENT_SETTINGS.seoOptimization.default,
  readability: AI_CONTENT_SETTINGS.readability.default,
};

// ═══════════════════════════════════════════════════════════════════════════════
// TÜM MODELLERİ TEK BİR YERDEN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Tüm AI modelleri (tüm sağlayıcılar)
 */
export const ALL_AI_MODELS = {
  claude: CLAUDE_MODELS,
  gemini: GEMINI_MODELS,
  chatgpt: CHATGPT_MODELS,
};

/**
 * Tüm AI modelleri array formatında
 */
export const ALL_AI_MODELS_ARRAY = [
  ...CLAUDE_MODELS_ARRAY.map((m) => ({ ...m, provider: "claude" })),
  ...GEMINI_MODELS_ARRAY.map((m) => ({ ...m, provider: "gemini" })),
  ...CHATGPT_MODELS_ARRAY.map((m) => ({ ...m, provider: "chatgpt" })),
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 DİNAMİK FIRESTORE ENTEGRASYONu
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Bu bölüm Firestore'dan dinamik AI ayarları çekme işlemi için kullanılır.
 * Admin panelinden AI ayarları değiştirildiğinde, bu fonksiyonlar
 * güncel değerleri çekmek için kullanılabilir.
 * 
 * Kullanım:
 * - Server-side: import { getDynamicAiSettings } from '@/lib/ai-models'
 * - Client-side: use useUnifiedAI hook from '@/hooks/use-unified-ai'
 */

// Cache for dynamic settings
let dynamicSettingsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get dynamic AI settings from Firestore
 * Falls back to static values if Firestore is unavailable
 * 
 * @param {boolean} forceRefresh - Force refresh from Firestore
 * @returns {Promise<object>} AI settings object
 */
export async function getDynamicAiSettings(forceRefresh = false) {
  // Check cache
  const now = Date.now();
  if (!forceRefresh && dynamicSettingsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return dynamicSettingsCache;
  }

  try {
    // Dynamic import to avoid circular dependencies
    const { getCachedModels, getCachedPrompts } = await import("@/lib/services/ai-settings-service");
    
    const [models, prompts] = await Promise.all([
      getCachedModels(),
      getCachedPrompts(),
    ]);

    if (models && models.length > 0) {
      // Build settings from Firestore data
      const settings = {
        claudeApiIds: {},
        geminiApiIds: {},
        openaiApiIds: {},
        models: {},
        prompts: {},
      };

      models.forEach(model => {
        settings.models[model.modelId] = model;
        
        // Build API ID mappings
        if (model.provider === 'claude') {
          if (model.modelId.includes('haiku')) settings.claudeApiIds.haiku = model.apiId;
          if (model.modelId.includes('sonnet')) settings.claudeApiIds.sonnet = model.apiId;
          if (model.modelId.includes('opus')) settings.claudeApiIds.opus = model.apiId;
        }
        if (model.provider === 'gemini') {
          if (model.modelId.includes('flash')) settings.geminiApiIds.flash = model.apiId;
          if (model.modelId.includes('pro_3_image')) settings.geminiApiIds.image = model.apiId;
          else if (model.modelId.includes('pro_3')) settings.geminiApiIds.pro = model.apiId;
        }
        if (model.provider === 'openai') {
          if (model.modelId === 'gpt4o') settings.openaiApiIds.gpt4o = model.apiId;
          if (model.modelId === 'gpt4o_mini') settings.openaiApiIds.gpt4oMini = model.apiId;
        }
      });

      prompts.forEach(prompt => {
        settings.prompts[prompt.key] = prompt;
      });

      // Cache the result
      dynamicSettingsCache = settings;
      cacheTimestamp = now;

      return settings;
    }
  } catch (error) {
    console.warn("Could not load dynamic AI settings, using static fallback:", error.message);
  }

  // Return static fallback
  return {
    claudeApiIds: CLAUDE_API_IDS,
    geminiApiIds: GEMINI_API_IDS,
    openaiApiIds: CHATGPT_API_IDS,
    models: { ...CLAUDE_MODELS, ...GEMINI_MODELS, ...CHATGPT_MODELS },
    prompts: {},
  };
}

/**
 * Get API ID dynamically (with Firestore fallback)
 * 
 * @param {string} provider - 'claude' | 'gemini' | 'openai'
 * @param {string} modelKey - Model key like 'haiku', 'sonnet', 'flash', etc.
 * @returns {Promise<string>} API ID
 */
export async function getDynamicApiId(provider, modelKey) {
  const settings = await getDynamicAiSettings();
  
  switch (provider) {
    case 'claude':
      return settings.claudeApiIds[modelKey] || CLAUDE_API_IDS[modelKey];
    case 'gemini':
      return settings.geminiApiIds[modelKey] || GEMINI_API_IDS[modelKey];
    case 'openai':
      return settings.openaiApiIds[modelKey] || CHATGPT_API_IDS[modelKey];
    default:
      return null;
  }
}

/**
 * Get prompt content dynamically
 * 
 * @param {string} key - Prompt key
 * @returns {Promise<string|null>} Prompt content
 */
export async function getDynamicPrompt(key) {
  const settings = await getDynamicAiSettings();
  return settings.prompts[key]?.content || null;
}

/**
 * Clear dynamic settings cache
 */
export function clearDynamicSettingsCache() {
  dynamicSettingsCache = null;
  cacheTimestamp = null;
}

/**
 * Check if dynamic settings are available
 * 
 * @returns {Promise<boolean>}
 */
export async function isDynamicSettingsAvailable() {
  try {
    const { checkAiSettingsSeeded } = await import("@/lib/services/ai-settings-seed");
    return await checkAiSettingsSeeded();
  } catch {
    return false;
  }
}

