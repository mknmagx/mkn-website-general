/**
 * 🔌 AI Provider Registry
 * 
 * Modüler AI provider mimarisi
 * Her provider (Claude, Gemini, OpenAI) burada kayıtlı ve merkezi olarak yönetiliyor.
 * 
 * Özellikler:
 * - Provider bazlı adaptör deseni
 * - Ortak interface ile farklı API'lere erişim
 * - Dinamik provider değiştirme
 * - Hata yakalama ve fallback mekanizması
 */

import { claudeService } from "@/lib/claude";
import { geminiService } from "@/lib/gemini";
import { chatGPTService } from "@/lib/openai";

// Merkezi AI sabitleri import et
import { 
  AI_PROVIDER_TYPES, 
  AI_PROVIDERS,
  PROVIDER_INFO,
  getProviderFromModelId as getProviderFromModelIdHelper,
} from "@/lib/ai-constants";

// Re-export for backward compatibility
export { AI_PROVIDER_TYPES, AI_PROVIDERS, PROVIDER_INFO };
export const getProviderFromModelId = getProviderFromModelIdHelper;

// ============================================================================
// PROVIDER ADAPTERS - Her provider için ortak interface
// ============================================================================

/**
 * Response'dan content'i extract et (backward compatibility için)
 * Yeni format: { content, metadata } veya eski format: string
 */
function extractContent(response) {
  if (typeof response === 'string') {
    return response;
  }
  if (response && typeof response === 'object' && 'content' in response) {
    return response.content;
  }
  return response;
}

/**
 * Response'dan metadata'yı extract et
 */
function extractMetadata(response) {
  if (response && typeof response === 'object' && 'metadata' in response) {
    return response.metadata;
  }
  return null;
}

/**
 * Claude Provider Adapter
 */
const claudeAdapter = {
  id: AI_PROVIDER_TYPES.CLAUDE,
  name: PROVIDER_INFO[AI_PROVIDER_TYPES.CLAUDE].name,
  icon: PROVIDER_INFO[AI_PROVIDER_TYPES.CLAUDE].icon,
  
  /**
   * İçerik üretimi (metadata ile)
   */
  async generateContent(prompt, options = {}) {
    const {
      systemPrompt,
      maxTokens = 4096,
      temperature = 0.7,
      model,
      apiId,
      returnMetadata = true, // Default true for generateContent
    } = options;

    // apiId veya model kullanarak generate
    const modelToUse = apiId || model;
    
    const result = await claudeService.generateContent(prompt, {
      systemPrompt,
      maxTokens,
      temperature,
      model: modelToUse,
      returnMetadata,
    });
    
    // Return full response with metadata
    if (returnMetadata && result?.metadata) {
      return result;
    }
    
    return result;
  },

  /**
   * Sohbet mesajı gönderme
   */
  async chat(message, options = {}) {
    const { systemPrompt, maxTokens = 2048, model, apiId, returnMetadata = false } = options;
    const modelToUse = apiId || model;
    
    return await claudeService.sendMessage(message, systemPrompt, maxTokens, modelToUse, returnMetadata);
  },

  /**
   * Conversation (multi-turn chat)
   */
  async conversation(messages, options = {}) {
    const { systemPrompt, model, apiId, returnMetadata = false } = options;
    const modelToUse = apiId || model;
    
    return await claudeService.chatConversation(messages, systemPrompt, modelToUse, returnMetadata);
  },

  /**
   * Metin analizi
   */
  async analyze(text, analysisType = "general") {
    return await claudeService.analyzeText(text, analysisType);
  },
};

/**
 * Gemini Provider Adapter
 */
const geminiAdapter = {
  id: AI_PROVIDER_TYPES.GEMINI,
  name: PROVIDER_INFO[AI_PROVIDER_TYPES.GEMINI].name,
  icon: PROVIDER_INFO[AI_PROVIDER_TYPES.GEMINI].icon,
  
  /**
   * İçerik üretimi (metadata ile)
   */
  async generateContent(prompt, options = {}) {
    const {
      systemPrompt,
      maxTokens = 4096,
      temperature = 0.7,
      model,
      apiId,
      useGrounding = false,
      returnMetadata = true, // Default true for generateContent
    } = options;

    const modelToUse = apiId || model || "gemini-2.5-flash";
    
    // geminiService.sendMessage kullan (returnMetadata ile)
    const result = await geminiService.sendMessage(
      prompt,
      systemPrompt,
      maxTokens,
      modelToUse,
      temperature,
      { useGrounding, returnMetadata }
    );
    
    return result;
  },

  /**
   * Sohbet mesajı gönderme
   */
  async chat(message, options = {}) {
    const { systemPrompt, maxTokens = 2048, model, apiId, useGrounding = true, returnMetadata = false } = options;
    const modelToUse = apiId || model || "gemini-2.5-flash";
    
    return await geminiService.sendMessage(
      message,
      systemPrompt,
      maxTokens,
      modelToUse,
      0.7,
      { useGrounding, returnMetadata }
    );
  },

  /**
   * Conversation (multi-turn chat)
   */
  async conversation(messages, options = {}) {
    const { systemPrompt, model, apiId, maxTokens = 4096 } = options;
    const modelToUse = apiId || model || "gemini-2.5-flash";
    
    // Gemini için conversation formatı
    const formattedMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      content: msg.content,
    }));
    
    // Son mesajı al
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    const conversationContext = formattedMessages.slice(0, -1)
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");
    
    const fullPrompt = `Previous conversation:\n${conversationContext}\n\nUser: ${lastMessage.content}`;
    
    return await geminiService.sendMessage(
      fullPrompt,
      systemPrompt,
      maxTokens,
      modelToUse
    );
  },

  /**
   * Metin analizi
   */
  async analyze(text, analysisType = "general") {
    const analysisPrompts = {
      sentiment: "Analyze the sentiment of this text and provide detailed analysis:",
      summary: "Provide a concise summary of this text:",
      general: "Analyze this text and provide insights:",
      seo: "Analyze this text for SEO optimization and provide recommendations:",
    };
    
    const prompt = `${analysisPrompts[analysisType] || analysisPrompts.general}\n\n${text}`;
    return await geminiService.sendMessage(prompt, null, 2048);
  },

  /**
   * Görsel üretimi (Gemini 3 Pro Image)
   */
  async generateImage(prompt, options = {}) {
    const { aspectRatio = "1:1", size = "2K" } = options;
    
    // geminiService'den image generation kullan
    if (geminiService?.generateImage) {
      return await geminiService.generateImage(prompt, { aspectRatio, size });
    }
    
    throw new Error("Gemini image generation not available");
  },
};

/**
 * OpenAI/ChatGPT Provider Adapter
 */
const openaiAdapter = {
  id: AI_PROVIDER_TYPES.OPENAI,
  name: PROVIDER_INFO[AI_PROVIDER_TYPES.OPENAI].name,
  icon: PROVIDER_INFO[AI_PROVIDER_TYPES.OPENAI].icon,
  
  /**
   * İçerik üretimi (metadata ile)
   */
  async generateContent(prompt, options = {}) {
    const {
      systemPrompt,
      maxTokens = 4096,
      temperature = 0.7,
      model,
      apiId,
      returnMetadata = true, // Default true for generateContent
    } = options;

    const modelToUse = apiId || model || "gpt-4o-mini";
    
    const result = await chatGPTService.generateContent(prompt, {
      systemPrompt,
      maxTokens,
      temperature,
      model: modelToUse,
      returnMetadata,
    });
    
    return result;
  },

  /**
   * Sohbet mesajı gönderme
   */
  async chat(message, options = {}) {
    const { systemPrompt, maxTokens = 2048, model, apiId, temperature = 0.7, returnMetadata = false } = options;
    const modelToUse = apiId || model || "gpt-4o-mini";
    
    return await chatGPTService.sendMessage(message, systemPrompt, maxTokens, modelToUse, returnMetadata);
  },

  /**
   * Conversation (multi-turn chat)
   */
  async conversation(messages, options = {}) {
    const { systemPrompt, model, apiId, maxTokens = 4096 } = options;
    const modelToUse = apiId || model || "gpt-4o-mini";
    
    const result = await chatGPTService.chatConversation(messages, systemPrompt, modelToUse, { maxTokens });
    
    // chatConversation artık metadata da döndürüyor
    // Backward compatibility için content döndür ama metadata'yı da ekle
    if (result?.metadata) {
      return result;
    }
    
    return result?.content || result;
  },

  /**
   * Metin analizi
   */
  async analyze(text, analysisType = "general") {
    const analysisPrompts = {
      sentiment: "Analyze the sentiment of the given text. Provide a detailed sentiment analysis.",
      summary: "Provide a concise summary of the given text.",
      general: "Analyze the given text and provide insights.",
      seo: "Analyze the text for SEO optimization and provide recommendations.",
    };
    
    return await chatGPTService.sendMessage(text, analysisPrompts[analysisType] || analysisPrompts.general, 1500, null);
  },
};

// ============================================================================
// PROVIDER REGISTRY - Tüm provider'ları merkezi kayıt
// ============================================================================

const providerRegistry = new Map([
  [AI_PROVIDER_TYPES.CLAUDE, claudeAdapter],
  [AI_PROVIDER_TYPES.GEMINI, geminiAdapter],
  [AI_PROVIDER_TYPES.OPENAI, openaiAdapter],
]);

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Belirli bir provider'ı al
 * @param {string} providerId - Provider ID (claude, gemini, openai)
 * @returns {Object} Provider adapter
 */
export function getProvider(providerId) {
  const normalizedId = providerId?.toLowerCase();
  const provider = providerRegistry.get(normalizedId);
  
  if (!provider) {
    console.warn(`⚠️ Unknown provider: ${providerId}, falling back to Claude`);
    return providerRegistry.get(AI_PROVIDER_TYPES.CLAUDE);
  }
  
  return provider;
}

/**
 * Tüm provider'ları listele
 * @returns {Array} Provider listesi
 */
export function getAllProviders() {
  return Array.from(providerRegistry.values()).map(p => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
  }));
}

/**
 * Provider'ın desteklenip desteklenmediğini kontrol et
 * @param {string} providerId 
 * @returns {boolean}
 */
export function isProviderSupported(providerId) {
  return providerRegistry.has(providerId?.toLowerCase());
}

/**
 * Yeni provider kaydet (genişletilebilirlik için)
 * @param {string} id - Provider ID
 * @param {Object} adapter - Provider adapter
 */
export function registerProvider(id, adapter) {
  if (!adapter.generateContent || !adapter.chat) {
    throw new Error("Provider adapter must implement generateContent and chat methods");
  }
  
  providerRegistry.set(id.toLowerCase(), {
    id: id.toLowerCase(),
    ...adapter,
  });
}

export default {
  getProvider,
  getAllProviders,
  isProviderSupported,
  getProviderFromModelId,
  registerProvider,
  AI_PROVIDER_TYPES,
};
