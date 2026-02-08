import OpenAI from "openai";

/**
 * ✅ OpenAI GPT Modelleri (Aralık 2025 - En Güncel)
 *
 * 📚 Kaynak: https://platform.openai.com/docs/models
 *
 * MODEL YETENEKLERİ:
 * ┌─────────────────────────────┬──────────┬──────────┬──────────┬──────────┐
 * │ Model                       │ Vision   │ Tools    │ JSON     │ Context  │
 * ├─────────────────────────────┼──────────┼──────────┼──────────┼──────────┤
 * │ gpt-4o                      │    ✅    │    ✅    │    ✅    │  128K    │
 * │ gpt-4o-mini                 │    ✅    │    ✅    │    ✅    │  128K    │
 * │ gpt-4-turbo                 │    ✅    │    ✅    │    ✅    │  128K    │
 * │ gpt-4                       │    ❌    │    ✅    │    ❌    │   8K     │
 * │ gpt-3.5-turbo               │    ❌    │    ✅    │    ✅    │  16K     │
 * │ o1-preview                  │    ✅    │    ❌    │    ❌    │  128K    │
 * │ o1-mini                     │    ✅    │    ❌    │    ❌    │  128K    │
 * └─────────────────────────────┴──────────┴──────────┴──────────┴──────────┘
 */

export const CHATGPT_MODELS = {
  // 🚀 En Güçlü Modeller
  gpt4o: "gpt-4o",
  gpt4oMini: "gpt-4o-mini",
  gpt4Turbo: "gpt-4-turbo",
  
  // ⚡ Reasoning Modelleri (o1 serisi)
  o1Preview: "o1-preview",
  o1Mini: "o1-mini",
  
  // 💰 Ekonomik Model
  gpt35Turbo: "gpt-3.5-turbo",
};

/**
 * 🎯 Tüm ChatGPT Modelleri - UI Dropdown İçin
 */
export const CHATGPT_CHAT_MODELS = [
  // === GPT-4o SERİSİ ===
  {
    value: "gpt-4o",
    label: "GPT-4o",
    icon: "🚀",
    type: "text",
    description: "En güçlü ve en hızlı multimodal model (128K context)",
    features: [
      "Text",
      "Vision",
      "🛠️ Tools",
      "📋 JSON Mode",
      "🎯 Function Calling",
      "📚 128K Context",
    ],
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
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    icon: "⚡",
    type: "text",
    description: "Hızlı ve ekonomik multimodal model",
    features: [
      "Text",
      "Vision",
      "🛠️ Tools",
      "📋 JSON Mode",
      "💰 Ekonomik",
      "📚 128K Context",
    ],
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
  // === O1 REASONING SERİSİ ===
  {
    value: "o1-preview",
    label: "o1 Preview",
    icon: "🧠",
    type: "reasoning",
    description: "İleri düzey reasoning ve problem çözme",
    features: [
      "🧠 Advanced Reasoning",
      "Vision",
      "🔍 Deep Analysis",
      "📐 Math & Code",
      "📚 128K Context",
    ],
    supportsVision: true,
    supportsTools: false,
    supportsJSON: false,
    maxInputTokens: 128000,
    maxOutputTokens: 32768,
    defaultConfig: {
      temperature: 1, // o1 doesn't support temperature adjustment
    },
  },
  {
    value: "o1-mini",
    label: "o1 Mini",
    icon: "💡",
    type: "reasoning",
    description: "Hızlı reasoning modeli",
    features: [
      "🧠 Reasoning",
      "Vision",
      "💰 Ekonomik",
      "📐 Math & Code",
      "📚 128K Context",
    ],
    supportsVision: true,
    supportsTools: false,
    supportsJSON: false,
    maxInputTokens: 128000,
    maxOutputTokens: 65536,
    defaultConfig: {
      temperature: 1,
    },
  },
  // === GPT-4 TURBO ===
  {
    value: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    icon: "🔥",
    type: "text",
    description: "Güçlü ve güvenilir model (vision destekli)",
    features: [
      "Text",
      "Vision",
      "🛠️ Tools",
      "📋 JSON Mode",
      "📚 128K Context",
    ],
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
  // === GPT-3.5 EKONOMİK ===
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    icon: "💚",
    type: "text",
    description: "Hızlı ve ekonomik model",
    features: [
      "Text",
      "🛠️ Tools",
      "📋 JSON Mode",
      "💰 En Ekonomik",
      "📚 16K Context",
    ],
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
];

/**
 * Varsayılan ChatGPT modeli
 * NOT: Bu değer artık lib/ai-models.js dosyasında da tanımlı.
 * Merkezi yönetim için lib/ai-models.js kullanılmalıdır.
 */
export const DEFAULT_CHATGPT_MODEL = "gpt-4o-mini";

export const DEFAULT_CHATGPT_SETTINGS = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

// ============================================================================
// AI RESPONSE METADATA HELPERS
// ============================================================================

// ============================================================================
// GPT-5+ MODEL DETECTION & CONFIGURATION
// ============================================================================

/**
 * 🔍 Model Kategorileri ve API Kullanımı
 * 
 * GPT-4 ve öncesi:
 *   - Endpoint: /v1/chat/completions
 *   - Params: max_tokens, temperature, top_p, frequency_penalty, presence_penalty
 * 
 * GPT-5+ (Normal):
 *   - Endpoint: /v1/responses
 *   - Params: max_output_tokens, temperature, top_p
 * 
 * GPT-5+ Reasoning (Pro modeller):
 *   - Endpoint: /v1/responses
 *   - Params: max_output_tokens, reasoning.effort (NO temperature, NO top_p)
 *   - reasoning.effort: "low" | "medium" | "high" 
 */

// GPT-5+ model pattern'leri
const GPT5_PLUS_MODEL_PATTERNS = [
  /^gpt-5/i,           // gpt-5, gpt-5.2, gpt-5.2-pro, vb.
  /^gpt-6/i,           // Gelecek modeller için
  /^gpt-7/i,
];

// Reasoning modelleri - temperature/top_p YOK, sadece reasoning.effort
// Ayrıca mini/nano modeller de temperature desteklemiyor
const REASONING_ONLY_MODELS = [
  // GPT-5 Pro serisi (reasoning modelleri)
  'gpt-5.2-pro',
  'gpt-5.2-pro-2025-12-11',
  'gpt-5-pro',
  'gpt-5-pro-2025-10-06',
  'gpt-5.1-codex-max',
  // GPT-5 Mini/Nano (temperature desteklemiyor)
  'gpt-5-mini',
  'gpt-5-mini-2025-08-07',
  'gpt-5-nano',
  'gpt-5-nano-2025-08-07',
  // o1 serisi de reasoning modeli
  'o1-preview',
  'o1-mini',
  'o1',
  'o1-pro',
];

// Varsayılan reasoning effort seviyeleri
const DEFAULT_REASONING_EFFORT = {
  'gpt-5.2-pro': 'high',
  'gpt-5.2-pro-2025-12-11': 'high',
  'gpt-5-pro': 'high',
  'gpt-5-pro-2025-10-06': 'high',
  'gpt-5.1-codex-max': 'medium',
  'o1-preview': 'high',
  'o1-mini': 'medium',
  'o1': 'high',
  'o1-pro': 'high',
};

/**
 * Model ID'sinin GPT-5+ olup olmadığını kontrol et
 * @param {string} modelId - Model API ID'si
 * @returns {boolean}
 */
function isGPT5PlusModel(modelId) {
  if (!modelId || typeof modelId !== 'string') return false;
  return GPT5_PLUS_MODEL_PATTERNS.some(pattern => pattern.test(modelId));
}

/**
 * Model'in reasoning-only olup olmadığını kontrol et
 * Bu modeller temperature/top_p KULLANMAZ, sadece reasoning.effort kullanır
 * @param {string} modelId - Model API ID'si
 * @returns {boolean}
 */
function isReasoningOnlyModel(modelId) {
  if (!modelId || typeof modelId !== 'string') return false;
  const normalizedId = modelId.toLowerCase();
  return REASONING_ONLY_MODELS.some(m => normalizedId === m.toLowerCase() || normalizedId.startsWith(m.toLowerCase()));
}

/**
 * Model'in o1 serisi olup olmadığını kontrol et
 * @param {string} modelId - Model API ID'si
 * @returns {boolean}
 */
function isO1Model(modelId) {
  if (!modelId || typeof modelId !== 'string') return false;
  return modelId.toLowerCase().startsWith('o1');
}

/**
 * Model için varsayılan reasoning effort seviyesini döndür
 * @param {string} modelId - Model API ID'si
 * @returns {string} - "low" | "medium" | "high"
 */
function getDefaultReasoningEffort(modelId) {
  if (!modelId) return 'medium';
  const normalizedId = modelId.toLowerCase();
  
  // Tam eşleşme ara
  for (const [key, value] of Object.entries(DEFAULT_REASONING_EFFORT)) {
    if (normalizedId === key.toLowerCase()) {
      return value;
    }
  }
  
  // Pro modeller için high, diğerleri için medium
  if (normalizedId.includes('pro')) return 'high';
  return 'medium';
}

/**
 * GPT-5+ Responses API için parametreleri hazırla
 * @param {string} modelId - Model API ID'si
 * @param {Object} options - Parametreler
 * @returns {Object} - Responses API için hazır parametreler
 */
function prepareResponsesParams(modelId, options) {
  const {
    systemPrompt,
    prompt,
    messages,
    maxTokens = 4096,
    temperature,
    topP,
    reasoningEffort,
  } = options;

  const params = {
    model: modelId,
  };

  // Input formatı - messages veya tek prompt
  if (messages && Array.isArray(messages)) {
    params.input = messages;
  } else if (prompt) {
    // System prompt varsa instructions olarak ekle
    if (systemPrompt) {
      params.instructions = systemPrompt;
    }
    params.input = prompt;
  }

  // Max output tokens
  if (maxTokens) {
    params.max_output_tokens = maxTokens;
  }

  // Reasoning-only modeller için
  if (isReasoningOnlyModel(modelId)) {
    // Temperature ve top_p KULLANILMAZ
    const effort = reasoningEffort || getDefaultReasoningEffort(modelId);
    params.reasoning = { effort };
    console.log(`🧠 Reasoning Model: ${modelId}, effort: ${effort} (no temperature/top_p)`);
  } else {
    // Normal GPT-5 modeller için temperature ve top_p kullanılabilir
    if (temperature !== undefined && temperature !== null) {
      params.temperature = temperature;
    }
    if (topP !== undefined && topP !== null) {
      params.top_p = topP;
    }
  }

  return params;
}

/**
 * GPT-4 ve öncesi için Chat Completions parametrelerini hazırla
 * @param {string} modelId - Model API ID'si
 * @param {Object} options - Parametreler
 * @returns {Object} - Chat Completions API için hazır parametreler
 */
function prepareChatCompletionParams(modelId, options) {
  const {
    messages,
    maxTokens = 4096,
    temperature,
    topP,
    frequencyPenalty,
    presencePenalty,
  } = options;

  const params = {
    model: modelId,
    messages: messages,
    max_tokens: maxTokens,
  };

  // o1 modelleri temperature desteklemez
  if (!isO1Model(modelId)) {
    if (temperature !== undefined && temperature !== null) {
      params.temperature = temperature;
    }
    if (topP !== undefined && topP !== null) {
      params.top_p = topP;
    }
    if (frequencyPenalty !== undefined && frequencyPenalty !== null) {
      params.frequency_penalty = frequencyPenalty;
    }
    if (presencePenalty !== undefined && presencePenalty !== null) {
      params.presence_penalty = presencePenalty;
    }
  }

  return params;
}

/**
 * Responses API yanıtından metadata oluştur
 */
function createResponsesMetadata(response, modelUsed) {
  return {
    provider: "openai",
    model: modelUsed || response.model,
    finishReason: response.status || "stop",
    isTruncated: response.status === "incomplete",
    usage: {
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
    },
    reasoning: response.reasoning_summary || null,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// AI RESPONSE METADATA HELPERS
// ============================================================================

/**
 * OpenAI finish_reason değerlerini standardize et
 * OpenAI API: "stop" | "length" | "content_filter" | "tool_calls" | "function_call"
 */
function normalizeOpenAIFinishReason(finishReason) {
  const mapping = {
    stop: "stop",
    length: "max_tokens",
    content_filter: "content_filter",
    tool_calls: "tool_calls",
    function_call: "tool_calls",
  };
  return mapping[finishReason] || finishReason || "unknown";
}

/**
 * OpenAI response'dan standardize metadata oluştur
 */
function createOpenAIMetadata(response, modelUsed) {
  const choice = response.choices?.[0];
  const rawFinishReason = choice?.finish_reason;
  const finishReason = normalizeOpenAIFinishReason(rawFinishReason);
  const isTruncated = rawFinishReason === "length";
  
  return {
    provider: "openai",
    model: modelUsed || response.model,
    finishReason,
    isTruncated,
    stopReason: rawFinishReason, // Original OpenAI value
    usage: {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
    timestamp: new Date().toISOString(),
  };
}

// Initialize OpenAI client lazily (only on server-side)
let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

/**
 * 🚀 GPT-5+ için Responses API çağrısı
 * OpenAI SDK'da responses API doğrudan desteklenmediği için HTTP request kullanılıyor
 * @param {Object} params - API parametreleri
 * @returns {Promise<Object>} API yanıtı
 */
async function callResponsesAPI(params) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  console.log(`🚀 Calling Responses API with model: ${params.model}`);
  console.log(`   Parameters:`, JSON.stringify({
    ...params,
    input: typeof params.input === 'string' 
      ? params.input.substring(0, 100) + '...' 
      : '[messages array]',
    instructions: params.instructions 
      ? params.instructions.substring(0, 50) + '...' 
      : undefined,
  }, null, 2));

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Responses API Error:', errorData);
    throw new Error(`Responses API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Responses API yanıtından içeriği çıkar
 * @param {Object} response - Responses API yanıtı
 * @returns {string} - Metin içeriği
 */
function extractResponseContent(response) {
  // output array'den text içeriğini çıkar
  if (response.output && Array.isArray(response.output)) {
    const textOutputs = response.output
      .filter(item => item.type === 'message' && item.content)
      .map(item => {
        if (Array.isArray(item.content)) {
          return item.content
            .filter(c => c.type === 'output_text')
            .map(c => c.text)
            .join('');
        }
        return item.content;
      });
    return textOutputs.join('\n');
  }
  
  // Eski format için fallback
  if (response.output_text) {
    return response.output_text;
  }
  
  // Choices formatı için fallback
  if (response.choices?.[0]?.message?.content) {
    return response.choices[0].message.content;
  }
  
  return '';
}

/**
 * 🔍 OpenAI'dan mevcut modelleri listele
 * Bu fonksiyon API key'inizin erişebildiği tüm modelleri döndürür
 * GPT-5+ model adlarını doğrulamak için kullanılabilir
 * @param {string} filter - İsteğe bağlı filtre (örn: "gpt-5")
 * @returns {Promise<Array>} Model listesi
 */
export async function listAvailableModels(filter = null) {
  try {
    const client = getOpenAIClient();
    const response = await client.models.list();
    
    let models = response.data || [];
    
    // Filtre uygula
    if (filter) {
      models = models.filter(m => 
        m.id.toLowerCase().includes(filter.toLowerCase())
      );
    }
    
    // Alfabetik sırala
    models.sort((a, b) => a.id.localeCompare(b.id));
    
    console.log(`📋 Available OpenAI Models${filter ? ` (filter: ${filter})` : ''}:`);
    models.forEach(m => console.log(`  - ${m.id}`));
    
    return models.map(m => ({
      id: m.id,
      created: m.created,
      ownedBy: m.owned_by,
    }));
  } catch (error) {
    console.error("Failed to list models:", error.message);
    throw error;
  }
}

/**
 * 🔍 GPT-5+ modelleri listele
 * API key'inizin erişebildiği GPT-5 ve üzeri modelleri gösterir
 */
export async function listGPT5Models() {
  return listAvailableModels('gpt-5');
}

export class ChatGPTService {
  constructor() {
    this.defaultModel = DEFAULT_CHATGPT_MODEL;
  }

  get client() {
    return getOpenAIClient();
  }

  /**
   * Send a message to ChatGPT
   * @param {string} message - The message to send
   * @param {string} systemPrompt - Optional system prompt
   * @param {number} maxTokens - Maximum tokens for response
   * @param {string} model - Model to use
   * @param {boolean} returnMetadata - Return full response with metadata (default: false)
   * @param {Object} extraOptions - Extra options (reasoningEffort for GPT-5+ pro models)
   * @returns {Promise<string|Object>} ChatGPT's response (string or {content, metadata})
   */
  async sendMessage(message, systemPrompt = null, maxTokens = 4096, model = null, returnMetadata = false, extraOptions = {}) {
    try {
      const modelToUse = model || this.defaultModel;

      // 🚀 GPT-5+ modeller için Responses API kullan
      if (isGPT5PlusModel(modelToUse)) {
        console.log(`🚀 GPT-5+ Model: ${modelToUse}, using Responses API`);
        
        const params = prepareResponsesParams(modelToUse, {
          systemPrompt,
          prompt: message,
          maxTokens,
          temperature: extraOptions.temperature,
          topP: extraOptions.topP,
          reasoningEffort: extraOptions.reasoningEffort,
        });

        const response = await callResponsesAPI(params);
        const content = extractResponseContent(response);
        
        if (returnMetadata) {
          const metadata = createResponsesMetadata(response, modelToUse);
          return { content, metadata };
        }
        
        return content;
      }

      // 💬 GPT-4 ve öncesi için Chat Completions API kullan
      const messages = [];

      if (systemPrompt && typeof systemPrompt === "string") {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: message,
      });

      const completionParams = prepareChatCompletionParams(modelToUse, {
        messages,
        maxTokens,
        temperature: extraOptions.temperature,
        topP: extraOptions.topP,
        frequencyPenalty: extraOptions.frequencyPenalty,
        presencePenalty: extraOptions.presencePenalty,
      });

      const response = await this.client.chat.completions.create(completionParams);
      const content = response.choices[0].message.content;
      
      if (returnMetadata) {
        const metadata = createOpenAIMetadata(response, modelToUse);
        if (metadata.isTruncated) {
          console.warn(`⚠️ OpenAI response truncated. Model: ${modelToUse}`);
        }
        return { content, metadata };
      }

      return content;
    } catch (error) {
      console.error("ChatGPT API Error:", error);
      throw new Error(`ChatGPT API Error: ${error.message}`);
    }
  }

  /**
   * Send a message with images (Vision)
   * @param {string} message - The message to send
   * @param {Array<string>} images - Array of base64 images or URLs
   * @param {string} systemPrompt - Optional system prompt
   * @param {number} maxTokens - Maximum tokens
   * @param {string} model - Model to use
   * @returns {Promise<string>} ChatGPT's response
   */
  async sendMessageWithImages(message, images = [], systemPrompt = null, maxTokens = 4096, model = null) {
    try {
      const modelToUse = model || this.defaultModel;

      // Reasoning-only modeller (gpt-5.2-pro vb.) vision desteklemez
      if (isReasoningOnlyModel(modelToUse)) {
        throw new Error(`Model ${modelToUse} is a reasoning model and does not support vision/images. Please use gpt-5.2 or gpt-4o instead.`);
      }

      // Build content array with text and images
      const content = [];
      
      if (message) {
        content.push({
          type: "text",
          text: message,
        });
      }

      // Add images
      for (const image of images) {
        if (image.startsWith("data:") || image.startsWith("http")) {
          content.push({
            type: "image_url",
            image_url: {
              url: image,
              detail: "auto",
            },
          });
        }
      }

      // 🚀 GPT-5+ modeller için Responses API kullan
      if (isGPT5PlusModel(modelToUse)) {
        console.log(`🖼️ GPT-5+ Vision: ${modelToUse}, using Responses API`);
        
        const params = prepareResponsesParams(modelToUse, {
          systemPrompt,
          messages: [
            { role: "user", content: content }
          ],
          maxTokens,
        });

        const response = await callResponsesAPI(params);
        return extractResponseContent(response);
      }

      // 💬 GPT-4 ve öncesi için Chat Completions API
      const messages = [];

      if (systemPrompt && typeof systemPrompt === "string") {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: content,
      });

      const completionParams = prepareChatCompletionParams(modelToUse, {
        messages,
        maxTokens,
      });

      const response = await this.client.chat.completions.create(completionParams);
      return response.choices[0].message.content;
    } catch (error) {
      console.error("ChatGPT Vision API Error:", error);
      throw new Error(`ChatGPT Vision API Error: ${error.message}`);
    }
  }

  /**
   * Generate content with ChatGPT
   * @param {string} prompt - The content generation prompt
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated content with metadata {content, metadata}
   */
  async generateContent(prompt, options = {}) {
    const {
      systemPrompt = "You are a helpful AI assistant.",
      maxTokens = 4096,
      temperature = 0.7,
      topP,
      model = null,
      returnMetadata = true,
      reasoningEffort, // GPT-5+ Pro modeller için: "low" | "medium" | "high"
    } = options;

    try {
      const modelToUse = model || this.defaultModel;

      // 🚀 GPT-5+ modeller için Responses API kullan
      if (isGPT5PlusModel(modelToUse)) {
        const isReasoning = isReasoningOnlyModel(modelToUse);
        console.log(`📝 GPT-5+ Content Generation: ${modelToUse}, using Responses API${isReasoning ? ' (reasoning mode)' : ''}`);
        
        const params = prepareResponsesParams(modelToUse, {
          systemPrompt,
          prompt,
          maxTokens,
          temperature: isReasoning ? undefined : temperature, // Reasoning modeller temperature kullanmaz
          topP: isReasoning ? undefined : topP,
          reasoningEffort,
        });

        const response = await callResponsesAPI(params);
        const content = extractResponseContent(response);
        const metadata = createResponsesMetadata(response, modelToUse);

        if (metadata.isTruncated) {
          console.warn(`⚠️ Response truncated. Model: ${modelToUse}`);
        }

        if (returnMetadata) {
          return { content, metadata };
        }
        return content;
      }

      // 💬 GPT-4 ve öncesi için Chat Completions API
      const messages = [];

      if (systemPrompt && typeof systemPrompt === "string") {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      messages.push({
        role: "user",
        content: prompt,
      });

      const completionParams = prepareChatCompletionParams(modelToUse, {
        messages,
        maxTokens,
        temperature,
        topP,
      });

      const response = await this.client.chat.completions.create(completionParams);
      const content = response.choices[0].message.content;
      const metadata = createOpenAIMetadata(response, modelToUse);

      if (metadata.isTruncated) {
        console.warn(`⚠️ OpenAI response truncated. Model: ${modelToUse}`);
      }

      if (returnMetadata) {
        return { content, metadata };
      }
      return content;
    } catch (error) {
      console.error("ChatGPT Content Generation Error:", error);
      throw new Error(`ChatGPT Content Generation Error: ${error.message}`);
    }
  }

  /**
   * Chat conversation with ChatGPT
   * @param {Array} conversation - Array of message objects [{role, content}]
   * @param {string} systemPrompt - System prompt for the conversation
   * @param {string} model - Model to use
   * @param {Object} settings - Additional settings
   * @returns {Promise<Object>} ChatGPT's response with usage info
   */
  async chatConversation(conversation, systemPrompt = null, model = null, settings = {}) {
    try {
      const modelToUse = model || this.defaultModel;

      // � GPT-5+ modeller için Responses API kullan
      if (isGPT5PlusModel(modelToUse)) {
        const isReasoning = isReasoningOnlyModel(modelToUse);
        console.log(`💬 GPT-5+ Chat Conversation: ${modelToUse}, using Responses API${isReasoning ? ' (reasoning mode)' : ''}`);
        
        // Build messages array
        const messages = [];
        for (const msg of conversation) {
          if (msg.images && msg.images.length > 0 && msg.role === "user") {
            // Message with images
            const content = [];
            if (msg.content) {
              content.push({ type: "input_text", text: msg.content });
            }
            for (const image of msg.images) {
              if (image && (image.startsWith("data:") || image.startsWith("http"))) {
                content.push({ type: "input_image", image_url: image });
              }
            }
            messages.push({ role: msg.role, content });
          } else {
            messages.push({ role: msg.role, content: msg.content });
          }
        }

        const params = prepareResponsesParams(modelToUse, {
          systemPrompt,
          messages,
          maxTokens: settings.maxTokens || 4096,
          temperature: isReasoning ? undefined : settings.temperature,
          topP: isReasoning ? undefined : settings.topP,
          reasoningEffort: settings.reasoningEffort,
        });

        const response = await callResponsesAPI(params);
        const content = extractResponseContent(response);
        const metadata = createResponsesMetadata(response, modelToUse);

        if (metadata.isTruncated) {
          console.warn(`⚠️ GPT-5+ conversation truncated. Model: ${modelToUse}`);
        }

        return {
          content,
          usage: response.usage || {},
          model: response.model || modelToUse,
          finishReason: response.status || 'stop',
          metadata,
        };
      }

      // 💬 GPT-4 ve öncesi için Chat Completions API
      const messages = [];

      if (systemPrompt && typeof systemPrompt === "string") {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // Add conversation history
      for (const msg of conversation) {
        if (msg.images && msg.images.length > 0 && msg.role === "user") {
          const content = [];
          if (msg.content) {
            content.push({ type: "text", text: msg.content });
          }
          for (const image of msg.images) {
            if (image && (image.startsWith("data:") || image.startsWith("http"))) {
              content.push({
                type: "image_url",
                image_url: { url: image, detail: "auto" },
              });
            }
          }
          messages.push({ role: msg.role, content });
        } else {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      const completionParams = prepareChatCompletionParams(modelToUse, {
        messages,
        maxTokens: settings.maxTokens || 4096,
        temperature: settings.temperature,
        topP: settings.topP,
        frequencyPenalty: settings.frequencyPenalty,
        presencePenalty: settings.presencePenalty,
      });

      const response = await this.client.chat.completions.create(completionParams);
      const content = response.choices[0].message.content;
      const metadata = createOpenAIMetadata(response, modelToUse);

      if (metadata.isTruncated) {
        console.warn(`⚠️ OpenAI conversation truncated. Model: ${modelToUse}`);
      }

      return {
        content,
        usage: response.usage,
        model: response.model,
        finishReason: response.choices[0].finish_reason,
        metadata,
      };
    } catch (error) {
      console.error("ChatGPT Chat Error:", error);
      throw new Error(`ChatGPT Chat Error: ${error.message}`);
    }
  }

  /**
   * Analyze text with ChatGPT
   * @param {string} text - Text to analyze
   * @param {string} analysisType - Type of analysis
   * @returns {Promise<string>} Analysis result
   */
  async analyzeText(text, analysisType = "general") {
    const systemPrompts = {
      sentiment: "Analyze the sentiment of the given text. Provide a detailed sentiment analysis in Turkish.",
      summary: "Provide a concise summary of the given text in Turkish.",
      general: "Analyze the given text and provide insights in Turkish.",
      seo: "Analyze the text for SEO optimization and provide recommendations in Turkish.",
      translation: "Translate the given text and provide language insights.",
      grammar: "Check the grammar and suggest improvements in Turkish.",
      keywords: "Extract the main keywords and topics from the text in Turkish.",
    };

    const systemPrompt = systemPrompts[analysisType] || systemPrompts.general;

    return await this.sendMessage(text, systemPrompt, 2000);
  }
}

export const chatGPTService = new ChatGPTService();

export { getOpenAIClient as openai };

export default ChatGPTService;
