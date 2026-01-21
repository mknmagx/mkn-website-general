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
   * @returns {Promise<string|Object>} ChatGPT's response (string or {content, metadata})
   */
  async sendMessage(message, systemPrompt = null, maxTokens = 4096, model = null, returnMetadata = false) {
    try {
      const modelToUse = model || this.defaultModel;
      const messages = [];

      // Add system prompt if provided
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

      const response = await this.client.chat.completions.create({
        model: modelToUse,
        messages: messages,
        max_tokens: maxTokens,
      });

      const content = response.choices[0].message.content;
      
      // Return with metadata if requested
      if (returnMetadata) {
        const metadata = createOpenAIMetadata(response, modelToUse);
        
        // Log if truncated
        if (metadata.isTruncated) {
          console.warn(`⚠️ OpenAI response truncated (length reached). Model: ${modelToUse}, Output tokens: ${metadata.usage.outputTokens}`);
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
      const messages = [];

      // Add system prompt if provided
      if (systemPrompt && typeof systemPrompt === "string") {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
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
        if (image.startsWith("data:")) {
          // Base64 image
          content.push({
            type: "image_url",
            image_url: {
              url: image,
              detail: "auto",
            },
          });
        } else if (image.startsWith("http")) {
          // URL image
          content.push({
            type: "image_url",
            image_url: {
              url: image,
              detail: "auto",
            },
          });
        }
      }

      messages.push({
        role: "user",
        content: content,
      });

      const response = await this.client.chat.completions.create({
        model: modelToUse,
        messages: messages,
        max_tokens: maxTokens,
      });

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
      model = null,
      returnMetadata = true, // Default true for generateContent
    } = options;

    try {
      const modelToUse = model || this.defaultModel;
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

      const response = await this.client.chat.completions.create({
        model: modelToUse,
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const content = response.choices[0].message.content;
      const metadata = createOpenAIMetadata(response, modelToUse);

      // Log if truncated
      if (metadata.isTruncated) {
        console.warn(`⚠️ OpenAI response truncated (length reached). Model: ${modelToUse}, Output tokens: ${metadata.usage.outputTokens}`);
      }

      // Return with metadata (default for generateContent)
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
      const messages = [];

      // Add system prompt first
      if (systemPrompt && typeof systemPrompt === "string") {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // Add conversation history
      for (const msg of conversation) {
        // Handle messages with images
        if (msg.images && msg.images.length > 0 && msg.role === "user") {
          const content = [];
          
          if (msg.content) {
            content.push({
              type: "text",
              text: msg.content,
            });
          }

          for (const image of msg.images) {
            if (image && (image.startsWith("data:") || image.startsWith("http"))) {
              content.push({
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "auto",
                },
              });
            }
          }

          messages.push({
            role: msg.role,
            content: content,
          });
        } else {
          // Regular text message
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      const completionParams = {
        model: modelToUse,
        messages: messages,
        max_tokens: settings.maxTokens || 4096,
      };

      // Add optional parameters (not supported by o1 models)
      if (!modelToUse.startsWith("o1")) {
        if (settings.temperature !== undefined) {
          completionParams.temperature = settings.temperature;
        }
        if (settings.topP !== undefined) {
          completionParams.top_p = settings.topP;
        }
        if (settings.frequencyPenalty !== undefined) {
          completionParams.frequency_penalty = settings.frequencyPenalty;
        }
        if (settings.presencePenalty !== undefined) {
          completionParams.presence_penalty = settings.presencePenalty;
        }
      }

      const response = await this.client.chat.completions.create(completionParams);
      
      const content = response.choices[0].message.content;
      const metadata = createOpenAIMetadata(response, modelToUse);
      
      // Log if truncated
      if (metadata.isTruncated) {
        console.warn(`⚠️ OpenAI conversation truncated (length reached). Model: ${modelToUse}, Output tokens: ${metadata.usage.outputTokens}`);
      }

      return {
        content,
        usage: response.usage,
        model: response.model,
        finishReason: response.choices[0].finish_reason,
        // ⭐ New: Standardized metadata
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
