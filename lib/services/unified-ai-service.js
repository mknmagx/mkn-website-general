/**
 * 🤖 Unified AI Service
 * 
 * Tüm AI işlemlerini merkezi olarak yöneten servis.
 * Firestore'dan dinamik ayarları çeker ve uygun provider'ı kullanır.
 * 
 * Özellikler:
 * - Firestore tabanlı dinamik konfigürasyon
 * - Multi-provider desteği (Claude, Gemini, OpenAI)
 * - Context bazlı model ve prompt yönetimi
 * - Otomatik fallback mekanizması
 * - Cache yönetimi
 * 
 * Kullanım:
 * ```js
 * import { unifiedAI, AI_CONTEXTS } from '@/lib/services/unified-ai-service';
 * 
 * // Blog için içerik üret
 * const content = await unifiedAI.generateContent(AI_CONTEXTS.BLOG_GENERATION, prompt, options);
 * 
 * // Belirli model ile üret
 * const response = await unifiedAI.generateWithModel('gemini-2.5-flash', prompt, options);
 * ```
 */

import { 
  getProvider, 
} from "./ai-provider-registry";

// Merkezi AI sabitleri import et
import {
  AI_CONTEXTS,
  AI_PROVIDERS,
  AI_PROVIDER_TYPES,
  getProviderFromModelId,
} from "@/lib/ai-constants";

import {
  getFullConfigurationForContext,
  getAllowedModelsForContext,
  getAiModel,
  getPromptByKey,
  getAiProviders,
} from "./ai-settings-service";

// Re-export for backward compatibility
export { AI_CONTEXTS, AI_PROVIDERS, AI_PROVIDER_TYPES };

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

function getCacheKey(context) {
  return `config_${context}`;
}

function setCache(key, data) {
  configCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function getCache(key) {
  const cached = configCache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    configCache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function clearUnifiedAICache() {
  configCache.clear();
}

// ============================================================================
// UNIFIED AI SERVICE CLASS
// ============================================================================

class UnifiedAIService {
  constructor() {
    this.defaultProvider = AI_PROVIDER_TYPES.CLAUDE;
  }

  /**
   * Context için tam konfigürasyonu getir (cached)
   * @param {string} context - Usage context
   * @param {boolean} forceRefresh - Cache'i atla
   */
  async getConfiguration(context, forceRefresh = false) {
    const cacheKey = getCacheKey(context);
    
    if (!forceRefresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const config = await getFullConfigurationForContext(context);
      
      if (config) {
        setCache(cacheKey, config);
        return config;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Context için izin verilen modelleri getir
   * @param {string} context - Usage context
   */
  async getAllowedModels(context) {
    try {
      return await getAllowedModelsForContext(context);
    } catch (error) {
      return [];
    }
  }

  /**
   * Model bilgisini getir
   * @param {string} modelId - Model ID
   */
  async getModel(modelId) {
    try {
      return await getAiModel(modelId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Prompt bilgisini getir
   * @param {string} promptKey - Prompt key
   */
  async getPrompt(promptKey) {
    try {
      return await getPromptByKey(promptKey);
    } catch (error) {
      return null;
    }
  }

  /**
   * Aktif provider'ları getir
   */
  async getActiveProviders() {
    try {
      return await getAiProviders();
    } catch (error) {
      return [];
    }
  }

  /**
   * Context bazlı içerik üretimi
   * En önemli method - Firestore'dan config çeker ve uygun provider kullanır
   * 
   * @param {string} context - Usage context (blog_generation, crm_reply, etc.)
   * @param {string} prompt - Kullanıcı prompt'u
   * @param {Object} options - Ek seçenekler
   */
  async generateContent(context, prompt, options = {}) {
    const {
      modelId,       // Override: Belirli model kullan
      temperature,   // Override: Temperature
      maxTokens,     // Override: Max tokens
      systemPrompt,  // Override: System prompt
      variables = {},// Prompt template değişkenleri
    } = options;

    try {
      // 1. Konfigürasyonu çek
      const config = await this.getConfiguration(context);
      
      // 2. Model belirle
      let selectedModel = null;
      let selectedProvider = null;
      
      if (modelId) {
        // Override model kullan
        selectedModel = await this.getModel(modelId);
        selectedProvider = getProviderFromModelId(modelId);
      } else if (config?.model) {
        // Config'deki default model
        selectedModel = config.model;
        selectedProvider = config.model.provider || getProviderFromModelId(config.model.modelId);
      } else {
        // Fallback: Claude Haiku
        selectedProvider = this.defaultProvider;
      }

      // 3. System prompt belirle
      let finalSystemPrompt = systemPrompt;
      
      if (!finalSystemPrompt && config?.prompt?.content) {
        finalSystemPrompt = this.interpolatePrompt(config.prompt.content, variables);
      }

      // 4. Settings belirle
      const finalTemperature = temperature ?? config?.settings?.temperature ?? selectedModel?.settings?.defaultTemperature ?? 0.7;
      const finalMaxTokens = maxTokens ?? config?.settings?.maxTokens ?? selectedModel?.settings?.defaultMaxTokens ?? 4096;

      // 5. Provider al ve generate et
      const provider = getProvider(selectedProvider);
      
      const response = await provider.generateContent(prompt, {
        systemPrompt: finalSystemPrompt,
        temperature: finalTemperature,
        maxTokens: finalMaxTokens,
        model: selectedModel?.modelId,
        apiId: selectedModel?.apiId,
      });
      
      return {
        success: true,
        content: response,
        metadata: {
          context,
          provider: provider.id,
          model: selectedModel?.modelId || "default",
          modelName: selectedModel?.displayName || selectedModel?.name,
          temperature: finalTemperature,
          maxTokens: finalMaxTokens,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          context,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Belirli model ile içerik üretimi
   * Model ID veya API ID ile direkt çağrı
   * 
   * @param {string} modelIdentifier - Model ID veya API ID
   * @param {string} prompt - Kullanıcı prompt'u
   * @param {Object} options - Ek seçenekler
   */
  async generateWithModel(modelIdentifier, prompt, options = {}) {
    const {
      systemPrompt,
      temperature = 0.7,
      maxTokens = 4096,
    } = options;

    try {
      // 1. Model bilgisini çek
      const model = await this.getModel(modelIdentifier);
      
      // 2. Provider belirle
      const providerId = model?.provider || getProviderFromModelId(modelIdentifier);
      const provider = getProvider(providerId);
      
      // 3. Generate et
      const response = await provider.generateContent(prompt, {
        systemPrompt,
        temperature,
        maxTokens,
        model: model?.modelId || modelIdentifier,
        apiId: model?.apiId,
      });

      return {
        success: true,
        content: response,
        metadata: {
          provider: provider.id,
          model: model?.modelId || modelIdentifier,
          modelName: model?.displayName || model?.name,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Context bazlı chat
   * 
   * @param {string} context - Usage context
   * @param {string|Array} messages - Mesaj veya mesaj listesi
   * @param {Object} options - Ek seçenekler
   */
  async chat(context, messages, options = {}) {
    const { modelId, systemPrompt } = options;

    try {
      const config = await this.getConfiguration(context);
      
      let selectedModel = null;
      let selectedProvider = null;
      
      if (modelId) {
        selectedModel = await this.getModel(modelId);
        selectedProvider = getProviderFromModelId(modelId);
      } else if (config?.model) {
        selectedModel = config.model;
        selectedProvider = config.model.provider;
      } else {
        selectedProvider = this.defaultProvider;
      }

      const finalSystemPrompt = systemPrompt || config?.prompt?.content;
      const provider = getProvider(selectedProvider);

      // Tek mesaj mı yoksa conversation mı?
      if (Array.isArray(messages)) {
        return await provider.conversation(messages, {
          systemPrompt: finalSystemPrompt,
          model: selectedModel?.modelId,
          apiId: selectedModel?.apiId,
        });
      } else {
        return await provider.chat(messages, {
          systemPrompt: finalSystemPrompt,
          model: selectedModel?.modelId,
          apiId: selectedModel?.apiId,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Metin analizi
   * 
   * @param {string} text - Analiz edilecek metin
   * @param {string} analysisType - Analiz tipi
   * @param {Object} options - Ek seçenekler
   */
  async analyze(text, analysisType = "general", options = {}) {
    const { providerId = this.defaultProvider } = options;
    
    const provider = getProvider(providerId);
    return await provider.analyze(text, analysisType);
  }

  /**
   * Görsel üretimi (Gemini Only)
   * 
   * @param {string} prompt - Görsel açıklaması
   * @param {Object} options - Görsel seçenekleri
   */
  async generateImage(prompt, options = {}) {
    const geminiProvider = getProvider(AI_PROVIDER_TYPES.GEMINI);
    
    if (!geminiProvider.generateImage) {
      throw new Error("Image generation only supported by Gemini");
    }
    
    return await geminiProvider.generateImage(prompt, options);
  }

  /**
   * Prompt template'ini değişkenlerle doldur
   * @private
   */
  interpolatePrompt(template, variables = {}) {
    if (!template) return template;
    
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, value || "");
    });
    
    return result;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Prompt template'ini değişkenlerle doldur (standalone fonksiyon)
 * @param {string} template - {{variable}} formatında template string
 * @param {object} variables - Değişken key-value eşlemeleri
 * @returns {string} - Değişkenler uygulanmış string
 */
export function applyPromptVariables(template, variables = {}) {
  if (!template) return template;
  
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
    result = result.replace(regex, String(value || ""));
  });
  
  return result;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const unifiedAI = new UnifiedAIService();

// Backward compatibility için alternatif export
export const unifiedAIService = unifiedAI;

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Blog içeriği üret
 */
export async function generateBlogContent(prompt, options = {}) {
  return await unifiedAI.generateContent(AI_CONTEXTS.BLOG_GENERATION, prompt, options);
}

/**
 * Blog içeriğini iyileştir
 */
export async function improveBlogContent(content, options = {}) {
  return await unifiedAI.generateContent(AI_CONTEXTS.BLOG_IMPROVEMENT, content, options);
}

/**
 * CRM yanıtı üret
 */
export async function generateCRMReply(message, options = {}) {
  return await unifiedAI.generateContent(AI_CONTEXTS.CRM_REPLY, message, options);
}

/**
 * Sosyal medya içeriği üret
 */
export async function generateSocialContent(prompt, options = {}) {
  return await unifiedAI.generateContent(AI_CONTEXTS.SOCIAL_CONTENT, prompt, options);
}

export default unifiedAI;
