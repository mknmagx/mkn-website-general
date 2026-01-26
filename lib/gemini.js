import { GoogleGenAI } from "@google/genai";

/**
 * ✅ Gemini Modelleri (Aralık 2025 - En Güncel)
 *
 * 📚 Kaynak: https://ai.google.dev/gemini-api/docs/models
 *
 * MODEL YETENEKLERİ:
 * ┌─────────────────────────────┬──────────┬──────────┬──────────┬──────────┐
 * │ Model                       │ Grounding│ Tools    │ Image Gen│ Multimodal│
 * ├─────────────────────────────┼──────────┼──────────┼──────────┼──────────┤
 * │ gemini-3-pro-preview        │    ❌    │    ✅    │    ❌    │    ✅    │
 * │ gemini-3-pro-image-preview  │    ❌    │    ❌    │    ✅    │    ✅    │
 * │ gemini-2.5-flash            │    ✅    │    ✅    │    ❌    │    ✅    │
 * └─────────────────────────────┴──────────┴──────────┴──────────┴──────────┘
 *
 * ⚡ Grounding = Google Search ile canlı web verisi (Default: 2.5-flash AÇIK)
 * 🛠️ Tools = Function calling, code execution, file search
 * 🎨 Image Gen = Görsel üretimi (text→image, 4K destekli)
 * 📦 Multimodal = Text, image, video, audio input
 */

const GEMINI_MODELS = {
  // 🚀 En Güçlü Model (Gemini 3.0)
  pro3: "gemini-3-pro-preview", // ❌ NO Grounding (Preview) | ✅ Tools | Text/Vision/Audio/PDF
  proImage3: "gemini-3-pro-image-preview", // ❌ NO Grounding (Preview) | ✅ Image Gen (4K) | NO Tools

  // ⚡ Hızlı & Verimli (Gemini 2.5) - DEFAULT
  flash25: "gemini-2.5-flash", // ✅ Grounding + Tools | Text/Vision (Default Web Search: ON)
};

/**
 * 🎯 Tüm Gemini Modelleri - UI Dropdown İçin
 */
export const GEMINI_CHAT_MODELS = [
  // === GEMINI 3.0 SERİSİ ===
  {
    value: "gemini-3-pro-preview",
    label: "Gemini 3 Pro",
    icon: "🚀",
    type: "text",
    description:
      "En güçlü reasoning-first + multimodal model (1M token context)",
    features: [
      "Text",
      "Vision",
      "Audio",
      "PDF",
      "🛠️ Tools",
      "🧠 Deep Reasoning",
      "📚 1M Context",
    ],
    supportsGrounding: false, // Preview model - grounding desteklenmiyor
    supportsTools: true,
    supportsImageGen: false,
    supportsReasoning: true, // ✅ Advanced reasoning capability
    supportsLongContext: true, // ✅ 1M token context window
    supportedModalities: ["text", "image", "audio", "video", "pdf"],
    defaultWebSearch: false,
    maxInputTokens: 1000000, // ✅ 1M token context
    maxOutputTokens: 32768,
    // Reasoning-optimized config
    reasoningConfig: {
      enabled: true,
      thinkingMode: "deep", // deep | standard | fast
      chainOfThought: true,
      multiStepPlanning: true,
    },
    // Use cases
    useCases: [
      "Complex reasoning & analysis",
      "Long document analysis",
      "Code analysis & generation",
      "Multi-step planning",
      "Agent-like automation",
      "Data analysis & reports",
    ],
    // Optimized parameters for reasoning tasks
    defaultConfig: {
      temperature: 0.7, // Balanced for reasoning
      topP: 0.9,
      topK: 40,
      candidateCount: 1,
    },
  },
  {
    value: "gemini-3-pro-image-preview",
    label: "Gemini 3 Pro Image (Nano Banana Pro)",
    icon: "🎨",
    type: "image",
    description: "Gelişmiş görsel üretimi + multi-turn editing + reasoning",
    features: [
      "🎨 4K Image Gen",
      "✏️ Multi-turn Edit",
      "🔍 Google Search Grounding",
      "🧠 Reasoning",
      "📐 10 Aspect Ratios",
      "🖼️ 14 Input Images",
    ],
    supportsGrounding: true, // ✅ Google Search grounding supported
    supportsTools: false, // ❌ No function calling/code execution
    supportsImageGen: true,
    supportsMultiTurnEdit: true, // ✅ Iterative editing with thoughtSignature
    defaultWebSearch: false,
    // Technical specs from documentation
    maxInputTokens: 65536,
    maxOutputTokens: 32768,
    maxInputImages: 14, // Max images per prompt
    maxImageSize: 7 * 1024 * 1024, // 7 MB per image
    maxTotalInputSize: 500 * 1024 * 1024, // 500 MB total (docs + images)
    supportedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
      "image/heif",
    ],
    supportedAspectRatios: [
      "1:1",
      "3:2",
      "2:3",
      "3:4",
      "4:3",
      "4:5",
      "5:4",
      "9:16",
      "16:9",
      "21:9",
    ],
    supportedImageSizes: ["1K", "2K", "4K"], // 1024px, 2048px, 4096px
    knowledgeCutoff: "January 2025",
    launchDate: "November 2025",
    hasSynthIDWatermark: true, // All outputs include SynthID watermark
    // Default generation params
    defaultConfig: {
      temperature: 1.0, // Recommended: 0.8-1.2 for image gen
      topP: 0.95,
      topK: 64,
      candidateCount: 1,
      responseModalities: ["IMAGE", "TEXT"],
    },
  },

  // === GEMINI 2.5 SERİSİ (DEFAULT) ===
  {
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    icon: "⚡",
    type: "text",
    description: "Hızlı + düşük gecikme + thinking özelliği + web search",
    features: [
      "Text",
      "Vision",
      "Audio",
      "🌐 Grounding (ON)",
      "🛠️ Tools",
      "💭 Thinking",
      "⚡ Low Latency",
    ],
    supportsGrounding: true,
    supportsTools: true,
    supportsImageGen: false,
    supportsThinking: true, // ✅ Thinking/reasoning support
    supportsMultimodal: true, // ✅ Multimodal input (text + image + document)
    supportedModalities: ["text", "image", "audio", "document"],
    defaultWebSearch: true, // Default AÇIK
    maxInputTokens: 1000000, // ✅ 1M token support
    maxOutputTokens: 8192,
    // Speed & throughput optimized
    performanceProfile: {
      latency: "low", // Low latency for real-time apps
      throughput: "high", // High throughput for scale
      costEfficiency: "high", // Cost-effective
    },
    // Use cases
    useCases: [
      "Real-time chatbots",
      "Customer service",
      "High-volume requests",
      "Fast content generation",
      "Automation workflows",
      "Quick analysis",
    ],
    // Thinking mode config
    thinkingConfig: {
      enabled: true,
      mode: "fast", // fast | standard
      reasoningDepth: "moderate",
    },
    // Speed-optimized parameters
    defaultConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      candidateCount: 1,
    },
  },
];

/**
 * 🎯 Varsayılan Modeller
 * - Chat: Gemini 2.5 Flash (hız + maliyet + özellik dengesi)
 * - Image: Gemini 3 Pro Image (4K görsel üretimi)
 *
 * NOT: Bu değerler artık lib/ai-models.js dosyasında da tanımlı.
 * Merkezi yönetim için lib/ai-models.js kullanılmalıdır.
 */
export const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";

// Default chat settings
export const DEFAULT_CHAT_SETTINGS = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
};

// ============================================================================
// AI RESPONSE METADATA HELPERS
// ============================================================================

/**
 * Gemini finishReason değerlerini standardize et
 * Gemini API: "STOP" | "MAX_TOKENS" | "SAFETY" | "RECITATION" | "OTHER"
 */
function normalizeGeminiFinishReason(finishReason) {
  const mapping = {
    STOP: "stop",
    MAX_TOKENS: "max_tokens",
    SAFETY: "content_filter",
    RECITATION: "content_filter",
    OTHER: "other",
    FINISH_REASON_UNSPECIFIED: "unknown",
  };
  return mapping[finishReason] || finishReason?.toLowerCase() || "unknown";
}

/**
 * Gemini response'dan standardize metadata oluştur
 */
function createGeminiMetadata(response, modelUsed) {
  // Gemini response structure varies - try to extract what we can
  const candidate = response?.candidates?.[0] || response?.response?.candidates?.[0];
  const usageMetadata = response?.usageMetadata || response?.response?.usageMetadata;
  
  const rawFinishReason = candidate?.finishReason || "STOP";
  const finishReason = normalizeGeminiFinishReason(rawFinishReason);
  const isTruncated = rawFinishReason === "MAX_TOKENS";
  
  return {
    provider: "gemini",
    model: modelUsed,
    finishReason,
    isTruncated,
    stopReason: rawFinishReason, // Original Gemini value
    usage: {
      inputTokens: usageMetadata?.promptTokenCount || 0,
      outputTokens: usageMetadata?.candidatesTokenCount || usageMetadata?.totalTokenCount || 0,
      totalTokens: usageMetadata?.totalTokenCount || 0,
    },
    groundingMetadata: candidate?.groundingMetadata || null,
    timestamp: new Date().toISOString(),
  };
}

const IMAGEN_MODELS = {
  imagen3: "imagen-3.0-generate-001",
  imagen3Fast: "imagen-3.0-fast-generate-001",
};

// ✅ All supported aspect ratios from Gemini 3 Pro Image documentation
const ASPECT_RATIOS = {
  SQUARE: "1:1", // 1:1 (Square)
  LANDSCAPE_3_2: "3:2", // 3:2 (Classic landscape)
  PORTRAIT_2_3: "2:3", // 2:3 (Classic portrait)
  PORTRAIT_3_4: "3:4", // 3:4 (Photo portrait)
  LANDSCAPE_4_3: "4:3", // 4:3 (Classic landscape)
  PORTRAIT_4_5: "4:5", // 4:5 (Social portrait)
  LANDSCAPE_5_4: "5:4", // 5:4 (Social landscape)
  PORTRAIT_9_16: "9:16", // 9:16 (Vertical/Story)
  LANDSCAPE_16_9: "16:9", // 16:9 (Widescreen)
  ULTRA_WIDE: "21:9", // 21:9 (Ultra-wide)
};

// ✅ Image sizes supported by Gemini 3 Pro Image
const IMAGE_SIZES = {
  STANDARD: "1K", // 1024px - Fast generation, lower quality
  HIGH: "2K", // 2048px - Balanced quality/speed (Recommended)
  ULTRA: "4K", // 4096px - Maximum quality, slower (Gemini 3 Pro Image only)
};

// Initialize only on server-side
let genAI;
if (typeof window === "undefined") {
  genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  });
}

export class GeminiService {
  constructor() {
    // Server-side check - sadece warning ver, throw etme
    if (typeof window !== "undefined") {
      console.warn(
        "Warning: GeminiService should only be used on the server side"
      );
      return; // Constructor'dan çık
    }
    this.client = genAI;
    this.defaultModel = GEMINI_MODELS.flash25; // Gemini 2.5 Flash (grounding + tools)
  }

  /**
   * Send a message to Gemini
   * ✅ Supports Gemini 3 Pro (reasoning-first, 1M context) & 2.5 Flash (thinking, speed)
   * @param {string} message - The message to send to Gemini
   * @param {string} systemPrompt - Optional system prompt
   * @param {number} maxTokens - Maximum tokens for response (default: 2048 for better output)
   * @param {string} model - Model to use (default: gemini-2.5-flash)
   * @param {number} temperature - Temperature for response (default: 0.7)
   * @param {Object} options - Additional options
   * @param {boolean} options.enableReasoning - Enable deep reasoning for Gemini 3 Pro (default: false)
   * @param {string} options.thinkingMode - "deep" | "standard" | "fast" (Gemini 3 Pro only)
   * @param {boolean} options.enableThinking - Enable thinking mode for Flash (default: true)
   * @param {boolean} options.returnMetadata - Return full response with metadata (default: false)
   * @returns {Promise<string|Object>} Gemini's response (string or {content, metadata})
   */
  async sendMessage(
    message,
    systemPrompt = null,
    maxTokens = 2048,
    model = null,
    temperature = 0.7,
    options = {}
  ) {
    try {
      const {
        enableReasoning = false,
        thinkingMode = "standard",
        enableThinking = true,
        returnMetadata = false,
        useGrounding = false, // ✅ Default KAPALI - sadece gerektiğinde açılacak (formula generation vb.)
      } = options;

      const modelToUse = model || this.defaultModel;
      const modelInfo = GEMINI_CHAT_MODELS.find((m) => m.value === modelToUse);

      // User message
      const contents = [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      // Config object (@google/genai SDK format)
      const config = {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      };

      // ✅ System instruction INSIDE config (@google/genai SDK requirement)
      if (systemPrompt) {
        config.systemInstruction = systemPrompt;
      }

      // ✅ Model-specific features - proper thinkingConfig format
      if (modelInfo?.supportsReasoning && enableReasoning) {
        // @google/genai SDK thinkingConfig format
        config.thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: thinkingMode === 'deep' ? 8192 : (thinkingMode === 'fast' ? 1024 : 4096),
        };
      }
      if (modelInfo?.supportsThinking && enableThinking) {
        // Enable thinking for Flash models
        config.thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: 4096,
        };
      }

      // ✅ Google Search Grounding - hammadde fiyatları vb. için canlı web araması
      if (useGrounding && modelInfo?.supportsGrounding) {
        config.tools = [{ googleSearch: {} }];
      }

      // Build request
      const requestParams = {
        model: modelToUse,
        contents,
        config,
      };

      const response = await this.client.models.generateContent(requestParams);
      const content = response.text;
      
      // Return with metadata if requested
      if (returnMetadata) {
        const metadata = createGeminiMetadata(response, modelToUse);
        
        // Log if truncated
        if (metadata.isTruncated) {
          console.warn(`⚠️ Gemini response truncated (MAX_TOKENS reached). Model: ${modelToUse}, Output tokens: ${metadata.usage.outputTokens}`);
        }
        
        return { content, metadata };
      }
      
      return content;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(`Gemini API request failed: ${error.message}`);
    }
  }

  /**
   * Send a message to Gemini with chat history
   * ✅ Optimized for Gemini 3 Pro (1M context, reasoning) & 2.5 Flash (thinking, multimodal)
   * @param {Array<{role: string, content: string, imageUrls?: Array}>} history - Previous messages
   * @param {string} message - The new message to send
   * @param {Array<string>} images - Optional images for the current message
   * @param {string} systemPrompt - Optional system prompt
   * @param {number} maxTokens - Maximum tokens for response
   * @param {string} model - Model to use
   * @param {number} temperature - Temperature for response
   * @param {boolean} useGrounding - Enable Google Search grounding (default: true)
   * @param {Object} options - Additional options
   * @param {boolean} options.enableReasoning - Enable deep reasoning (Gemini 3 Pro)
   * @param {string} options.thinkingMode - "deep" | "standard" | "fast"
   * @param {boolean} options.enableThinking - Enable thinking (Flash)
   * @returns {Promise<{text: string, groundingMetadata?: object}>} Gemini's response with optional grounding data
   */
  async sendMessageWithHistory(
    history = [],
    message,
    images = [],
    systemPrompt = null,
    maxTokens = 2048,
    model = null,
    temperature = 0.7,
    useGrounding = true,
    options = {},
    settings = {} // ⭐ NEW: All UI settings (aspectRatio, imageSize, etc.)
  ) {
    try {
      const {
        enableReasoning = false,
        thinkingMode = "standard",
        enableThinking = true,
      } = options;

      let modelToUse = model || this.defaultModel;

      // Get model info
      const modelInfo = GEMINI_CHAT_MODELS.find((m) => m.value === modelToUse);

      // Model Compatibility Check - Grounding için uygun model seç
      if (useGrounding) {
        const groundingModelInfo = GEMINI_CHAT_MODELS.find((m) => m.value === modelToUse);
        if (!groundingModelInfo?.supportsGrounding) {
          modelToUse = GEMINI_MODELS.flash25;
        }
      }

      // Image generation models don't support conversation history
      if (modelToUse && (modelToUse.includes("image") || modelToUse.includes("Image"))) {
        history = [];
      }

      // Prepare contents array from history
      const contents = [];

      // Add history messages with validation
      history.forEach((msg, index) => {
        // Validate message content
        if (!msg.content || typeof msg.content !== "string") {
          return; // Skip invalid messages
        }

        const cleanContent = msg.content.trim();
        if (!cleanContent) {
          return; // Skip empty messages
        }

        // 🛡️ Ensure content has minimum length (at least 1 character)
        if (cleanContent.length < 1) {
          console.warn(`⚠️ Skipping zero-length content at index ${index}`);
          return;
        }

        // Build parts array - TEXT MUST BE FIRST
        const parts = [{ text: cleanContent }];

        // Add images if present in history (base64 only)
        if (msg.imageUrls && Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0) {
          msg.imageUrls.forEach((imgUrl) => {
            if (!imgUrl || typeof imgUrl !== "string") return;
            if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return;

            if (imgUrl.startsWith("data:image") && imgUrl.includes("base64")) {
              try {
                const mimeTypeMatch = imgUrl.match(/data:(image\/[a-z]+);base64,/);
                const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
                const base64Data = imgUrl.split(",")[1];
                if (base64Data && base64Data.length > 0) {
                  parts.push({ inlineData: { data: base64Data, mimeType } });
                }
              } catch (err) {
                // Skip invalid images
              }
            }
          });
        }

        // Only add to contents if we have valid parts
        if (parts.length > 0 && parts[0].text && parts[0].text.trim().length > 0) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts,
          });
        }
      });

      // Add current message with validation
      if (!message || typeof message !== "string" || !message.trim()) {
        throw new Error("Current message is empty or invalid");
      }

      const currentParts = [{ text: message.trim() }];

      // Add current images if present (base64 only)
      if (images && Array.isArray(images) && images.length > 0) {
        images.forEach((imgUrl) => {
          if (imgUrl && typeof imgUrl === "string" && imgUrl.includes("base64")) {
            try {
              const mimeTypeMatch = imgUrl.match(/data:(image\/[a-z]+);base64,/);
              const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
              const base64Data = imgUrl.split(",")[1];
              if (base64Data && base64Data.length > 0) {
                currentParts.push({ inlineData: { data: base64Data, mimeType } });
              }
            } catch (err) {
              // Skip invalid images
            }
          }
        });
      }

      contents.push({
        role: "user",
        parts: currentParts,
      });

      // Validate conversation has at least the current user message
      if (contents.length === 0) {
        throw new Error("No valid messages to send to Gemini");
      }

      // Ensure conversation starts with 'user' (Gemini API requirement)
      while (contents.length > 0 && contents[0].role === "model") {
        contents.shift();
      }

      // Build request config (@google/genai SDK format)
      const requestConfig = {
        model: modelToUse,
        contents,
        config: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        },
      };

      // System instruction INSIDE config (@google/genai SDK requirement)
      if (systemPrompt) {
        requestConfig.config.systemInstruction = systemPrompt;
      }

      // ✅ Gemini 3 Pro Image: Add image generation config (SEPARATE from config)
      if (modelInfo?.supportsImageGen && settings) {
        // Image generation config MUST be at top level, not inside config
        const imageGenConfig = {
          responseModalities: settings.responseModalities || ["IMAGE", "TEXT"],
        };

        // Add aspectRatio if specified (and valid)
        if (settings.aspectRatio) {
          imageGenConfig.aspectRatio = settings.aspectRatio;
        }

        // Add numberOfImages if specified
        if (settings.numberOfImages && settings.numberOfImages > 0) {
          imageGenConfig.numberOfImages = settings.numberOfImages;
        }

        requestConfig.generationConfig = imageGenConfig;
      }

      // Gemini 3 Pro: Enable reasoning with proper thinkingConfig
      if (modelInfo?.supportsReasoning && enableReasoning) {
        requestConfig.config.thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: thinkingMode === 'deep' ? 8192 : (thinkingMode === 'fast' ? 1024 : 4096),
        };
      }

      // Gemini 2.5 Flash: Enable thinking with proper thinkingConfig
      if (modelInfo?.supportsThinking && enableThinking) {
        requestConfig.config.thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: 4096,
        };
      }

      // Add Google Search grounding tool
      if (useGrounding) {
        requestConfig.config.tools = [{ googleSearch: {} }];
      }

      const response = await this.client.models.generateContent(requestConfig);

      // Extract grounding metadata
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

      // Extract response parts
      const firstCandidate = response.candidates?.[0];
      const contentParts = firstCandidate?.content?.parts || [];
      const hasInlineData = contentParts.some((part) => part.inlineData);

      // Extract text
      let extractedText = response.text || "";
      if (!extractedText || extractedText.trim() === "") {
        const textParts = contentParts.filter((part) => part.text).map((part) => part.text);
        if (textParts.length > 0) {
          extractedText = textParts.join(" ");
        }
      }

      // Extract generated images (inlineData)
      const generatedImages = [];
      if (hasInlineData) {
        const imageParts = contentParts.filter((part) => part.inlineData);
        imageParts.forEach((part, idx) => {
          generatedImages.push({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
            index: idx,
          });
        });
      }

      // Create metadata
      const metadata = createGeminiMetadata(response, modelToUse);
      
      // Log if truncated
      if (metadata.isTruncated) {
        console.warn(`⚠️ Gemini response truncated (MAX_TOKENS reached). Model: ${modelToUse}`);
      }

      // Return both text and grounding metadata
      return {
        text: extractedText,
        hasInlineData: hasInlineData,
        generatedImages: generatedImages, // ⭐ New: Array of generated images
        contentParts: contentParts.length,
        groundingMetadata: groundingMetadata,
        webSearchQueries: groundingMetadata?.webSearchQueries || [],
        groundingChunks: groundingMetadata?.groundingChunks || [],
        groundingSupports: groundingMetadata?.groundingSupports || [],
        // ⭐ New: AI metadata for truncation tracking
        metadata,
      };
    } catch (error) {
      console.error("Gemini API Error (with history):", error);
      throw new Error(`Gemini API request failed: ${error.message}`);
    }
  }

  /**
   * Stream a message to Gemini
   * ✅ Supports Gemini 3 Pro & 2.5 Flash with thinking/reasoning modes
   * @param {string} message - The message to send to Gemini
   * @param {string} systemPrompt - Optional system prompt
   * @param {number} maxTokens - Maximum tokens for response
   * @param {string} model - Model to use
   * @param {number} temperature - Temperature for response
   * @param {Object} options - Additional options for reasoning/thinking
   * @returns {AsyncGenerator<string>} Stream of response chunks
   */
  async *streamMessage(
    message,
    systemPrompt = null,
    maxTokens = 2048,
    model = null,
    temperature = 0.7,
    options = {}
  ) {
    try {
      const {
        enableReasoning = false,
        thinkingMode = "standard",
        enableThinking = true,
      } = options;

      const modelToUse = model || this.defaultModel;
      const modelInfo = GEMINI_CHAT_MODELS.find((m) => m.value === modelToUse);

      const contents = [];

      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Config object (@google/genai SDK format)
      const config = {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      };

      // ✅ System instruction INSIDE config
      if (systemPrompt) {
        config.systemInstruction = systemPrompt;
      }

      // ✅ Enable model-specific features with proper thinkingConfig
      if (modelInfo?.supportsReasoning && enableReasoning) {
        config.thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: thinkingMode === 'deep' ? 8192 : (thinkingMode === 'fast' ? 1024 : 4096),
        };
      }

      if (modelInfo?.supportsThinking && enableThinking) {
        config.thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: 4096,
        };
      }

      // Build stream request
      const streamRequest = {
        model: modelToUse,
        contents,
        config,
      };

      const stream = await this.client.models.generateContentStream(
        streamRequest
      );

      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Gemini Streaming API Error:", error);
      throw new Error(`Gemini streaming failed: ${error.message}`);
    }
  }

  /**
   * Stream a message to Gemini with chat history
   * ✅ Optimized for Gemini 3 Pro (reasoning) & 2.5 Flash (thinking, multimodal)
   * @param {Array<{role: string, content: string, imageUrls?: Array}>} history - Previous messages
   * @param {string} message - The new message to send
   * @param {Array<string>} images - Optional images for the current message
   * @param {string} systemPrompt - Optional system prompt
   * @param {number} maxTokens - Maximum tokens for response
   * @param {string} model - Model to use
   * @param {number} temperature - Temperature for response
   * @param {boolean} useGrounding - Enable Google Search grounding
   * @param {Object} options - Additional options for reasoning/thinking
   * @returns {AsyncGenerator<string>} Stream of response chunks
   */
  async *streamMessageWithHistory(
    history = [],
    message,
    images = [],
    systemPrompt = null,
    maxTokens = 2048,
    model = null,
    temperature = 0.7,
    useGrounding = true,
    options = {}
  ) {
    try {
      const {
        enableReasoning = false,
        thinkingMode = "standard",
        enableThinking = true,
      } = options;

      let modelToUse = model || this.defaultModel;
      const modelInfo = GEMINI_CHAT_MODELS.find((m) => m.value === modelToUse);

      // Model Compatibility Check - Grounding için uygun model seç
      if (useGrounding && !modelInfo?.supportsGrounding) {
        modelToUse = GEMINI_MODELS.flash25;
      }

      // Prepare contents array from history
      const contents = [];

      // Add history messages with validation
      history.forEach((msg, index) => {
        if (!msg.content || typeof msg.content !== "string") return;
        const cleanContent = msg.content.trim();
        if (!cleanContent) return;

        const parts = [{ text: cleanContent }];

        // Add images if present in history (base64 only)
        if (msg.imageUrls && Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0) {
          msg.imageUrls.forEach((imgUrl) => {
            if (!imgUrl || typeof imgUrl !== "string") return;
            if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return;

            if (imgUrl.startsWith("data:image") && imgUrl.includes("base64")) {
              try {
                const mimeTypeMatch = imgUrl.match(/data:(image\/[a-z]+);base64,/);
                const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
                const base64Data = imgUrl.split(",")[1];
                if (base64Data && base64Data.length > 0) {
                  parts.push({ inlineData: { data: base64Data, mimeType } });
                }
              } catch (err) {
                // Skip invalid images
              }
            }
          });
        }

        // Only add if we have valid text part
        if (parts.length > 0 && parts[0].text && parts[0].text.trim().length > 0) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts,
          });
        }
      });

      // Add current message with validation
      if (!message || typeof message !== "string" || !message.trim()) {
        throw new Error("Current message is empty or invalid");
      }

      const currentParts = [{ text: message.trim() }];

      // Add current images if present
      if (images && Array.isArray(images) && images.length > 0) {
        images.forEach((imgUrl) => {
          if (imgUrl && typeof imgUrl === "string" && imgUrl.includes("base64")) {
            try {
              const mimeTypeMatch = imgUrl.match(/data:(image\/[a-z]+);base64,/);
              const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
              const base64Data = imgUrl.split(",")[1];
              if (base64Data && base64Data.length > 0) {
                currentParts.push({ inlineData: { data: base64Data, mimeType } });
              }
            } catch (err) {
              // Skip invalid images
            }
          }
        });
      }

      contents.push({
        role: "user",
        parts: currentParts,
      });

      // Ensure conversation starts with 'user'
      while (contents.length > 0 && contents[0].role === "model") {
        contents.shift();
      }

      // Build request config
      const requestConfig = {
        model: modelToUse,
        contents,
        config: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        },
      };

      // System instruction INSIDE config
      if (systemPrompt) {
        requestConfig.config.systemInstruction = systemPrompt;
      }

      // Enable reasoning/thinking with proper thinkingConfig
      if (modelInfo?.supportsReasoning && enableReasoning) {
        requestConfig.config.thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: thinkingMode === 'deep' ? 8192 : (thinkingMode === 'fast' ? 1024 : 4096),
        };
      }

      if (modelInfo?.supportsThinking && enableThinking) {
        requestConfig.config.thinkingConfig = {
          includeThoughts: true,
          thinkingBudget: 4096,
        };
      }

      // Add Google Search grounding tool
      if (useGrounding) {
        requestConfig.config.tools = [{ googleSearch: {} }];
      }

      const stream = await this.client.models.generateContentStream(
        requestConfig
      );

      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Gemini Streaming API Error (with history):", error);
      throw new Error(`Gemini streaming failed: ${error.message}`);
    }
  }

  /**
   * Generate content with structured output
   * @param {string} message - The message/prompt
   * @param {string} systemPrompt - Optional system prompt
   * @param {Object} schema - JSON schema for structured output
   * @param {string} model - Model to use
   * @returns {Promise<Object>} Structured response
   */
  async generateStructuredContent(
    message,
    systemPrompt = null,
    schema = null,
    model = null
  ) {
    try {
      const modelToUse = model || this.defaultModel;

      const contents = [];

      let promptMessage = message;
      if (schema) {
        promptMessage += `\n\nPlease respond with valid JSON matching this schema: ${JSON.stringify(
          schema
        )}`;
      }

      contents.push({
        role: "user",
        parts: [{ text: promptMessage }],
      });

      const config = {
        responseMimeType: schema ? "application/json" : "text/plain",
      };

      // ✅ System instruction INSIDE config (@google/genai SDK requirement)
      if (systemPrompt) {
        config.systemInstruction = systemPrompt;
      }

      // Build request
      const requestParams = {
        model: modelToUse,
        contents,
        config,
      };

      const response = await this.client.models.generateContent(requestParams);

      if (schema) {
        return JSON.parse(response.text);
      }

      return response.text;
    } catch (error) {
      console.error("Gemini Structured Content Error:", error);
      throw new Error(`Gemini structured content failed: ${error.message}`);
    }
  }

  /**
   * Generate content with images (Vision API)
   * @param {string} message - The text prompt
   * @param {Array<{inlineData: {data: string, mimeType: string}}>} images - Array of image data
   * @param {string} model - Model to use
   * @returns {Promise<string>} Response
   */
  async generateContentWithImages(message, images, model = null) {
    try {
      const modelToUse = model || GEMINI_MODELS.flash25; // Gemini 2.5 Flash (multimodal)

      const parts = [{ text: message }];

      // Add images
      images.forEach((img) => {
        parts.push({
          inlineData: {
            mimeType: img.inlineData.mimeType,
            data: img.inlineData.data,
          },
        });
      });

      const response = await this.client.models.generateContent({
        model: modelToUse,
        contents: [
          {
            role: "user",
            parts,
          },
        ],
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Vision API Error:", error);
      throw new Error(`Gemini vision request failed: ${error.message}`);
    }
  }

  /**
   * ✅ Generate images using Gemini 3 Pro Image (Native Image Generation)
   *
   * 📚 Full Documentation Implementation
   * Model: gemini-3-pro-image-preview (Nano Banana Pro)
   *
   * 🎯 Capabilities:
   * - Text → Image generation
   * - Text + Image(s) → Image editing (inpainting, outpainting, composition)
   * - Multi-turn conversational editing with thoughtSignature
   * - Google Search grounding support
   * - Up to 14 input images per request
   * - 10 aspect ratios: 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
   * - 3 quality levels: 1K (1024px), 2K (2048px), 4K (4096px)
   *
   * 📊 Limits:
   * - Max input tokens: 65,536
   * - Max output tokens: 32,768
   * - Max total input size: 500 MB
   * - Max images per prompt: 14
   * - Max image size: 7 MB per image
   * - Supported MIME: image/png, image/jpeg, image/webp, image/heic, image/heif
   *
   * ⚠️ Important:
   * - All outputs include SynthID watermark
   * - thoughtSignature MUST be preserved for multi-turn editing
   * - Temperature: 0.8-1.2 recommended (default 1.0)
   *
   * @param {string} prompt - The text prompt for image generation
   * @param {Object} options - Generation options
   * @param {string} options.model - "flash" (2.5) or "pro" (3.0 - recommended for quality)
   * @param {string} options.aspectRatio - One of 10 supported ratios: "1:1", "3:2", "2:3", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"
   * @param {string} options.imageSize - "1K" (fast), "2K" (balanced), "4K" (max quality, Gemini 3 Pro only)
   * @param {number} options.temperature - 0.0-2.0, recommended 0.8-1.2 for images (default: 1.0)
   * @param {number} options.topP - 0.0-1.0 (default: 0.95)
   * @param {Array<string>} options.responseModalities - ["IMAGE"], ["TEXT"], or ["IMAGE", "TEXT"]
   * @param {Array<{data: string, mimeType: string}>} options.referenceImages - Up to 14 reference images for editing
   * @param {boolean} options.enableGrounding - Enable Google Search grounding (Gemini 3 Pro Image supports this)
   * @param {string} options.systemInstruction - Optional system prompt for style/behavior
   * @returns {Promise<Array<{data: string, mimeType: string, thoughtSignature?: string, text?: string}>>} Generated images + optional text + thoughtSignature
   */
  async generateImages(prompt, options = {}) {
    try {
      const {
        model = "pro", // Default to "pro" for Gemini 3 Pro Image
        aspectRatio = ASPECT_RATIOS.SQUARE,
        imageSize = IMAGE_SIZES.HIGH, // Default to 2K for balanced quality
        temperature = 1.0, // Recommended for image generation
        topP = 0.95,
        responseModalities = ["IMAGE", "TEXT"], // Get both image and description
        referenceImages = [],
        enableGrounding = false,
        systemInstruction = null,
      } = options;

      // 🎯 Model selection
      const modelToUse =
        model === "pro" ? GEMINI_MODELS.proImage3 : GEMINI_MODELS.flashImage25;

      // Validation: Check reference images count (max 14)
      if (referenceImages.length > 14) {
        referenceImages = referenceImages.slice(0, 14);
      }

      // Build contents array
      const parts = [{ text: prompt }];

      // Add reference images if provided (for editing/composition)
      if (referenceImages.length > 0) {
        referenceImages.forEach((img) => {
          parts.push({
            inlineData: {
              mimeType: img.mimeType || "image/jpeg",
              data: img.data,
            },
          });
        });
      }

      const contents = [
        {
          role: "user",
          parts,
        },
      ];

      // 🔧 Build generation config
      const config = {
        temperature: temperature,
        topP: topP,
        topK: 64, // Fixed for Gemini 3 Pro Image
        candidateCount: 1,
        responseModalities: responseModalities,
      };

      // Add image-specific config
      if (aspectRatio) {
        config.imageConfig = {
          aspectRatio: aspectRatio,
        };

        // Add image size for pro model (1K/2K/4K)
        if (model === "pro" && ["1K", "2K", "4K"].includes(imageSize)) {
          config.imageConfig.imageSize = imageSize;
        }
      }

      // Build request
      const requestConfig = {
        model: modelToUse,
        contents,
        config,
      };

      // System instruction INSIDE config
      if (systemInstruction) {
        requestConfig.config.systemInstruction = systemInstruction;
      }

      // Add Google Search grounding if enabled (Gemini 3 Pro Image supports this)
      if (enableGrounding && model === "pro") {
        requestConfig.config.tools = [{ googleSearch: {} }];
      }

      // Call Gemini API
      const response = await this.client.models.generateContent(requestConfig);

      // Extract results from response
      const results = [];
      const candidates = response.candidates || [];

      if (candidates.length === 0) {
        throw new Error("No candidates returned from Gemini API");
      }

      const firstCandidate = candidates[0];
      const contentParts = firstCandidate?.content?.parts || [];

      // Extract ALL parts including thoughtSignature for multi-turn editing
      for (const part of contentParts) {
        if (part.inlineData) {
          results.push({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || "image/png",
            thoughtSignature: part.thoughtSignature,
            isThought: part.thought || false,
          });
        } else if (part.text && !part.thought) {
          results.push({
            text: part.text,
            thoughtSignature: part.thoughtSignature,
            isThought: false,
          });
        } else if (part.thoughtSignature && results.length > 0) {
          results[results.length - 1].thoughtSignature = part.thoughtSignature;
        }
      }

      // Validation
      if (results.length === 0) {
        throw new Error("No valid images or text extracted from response");
      }

      return results;

      return results;
    } catch (error) {
      console.error("❌ Gemini Image Generation Error:", error);

      // Enhanced error handling with specific messages
      if (error.message?.includes("SAFETY")) {
        throw new Error(
          "Image generation blocked by safety filters. Please modify your prompt."
        );
      } else if (error.message?.includes("INVALID_ARGUMENT")) {
        throw new Error(
          "Invalid parameters provided. Check aspect ratio, image size, and reference images."
        );
      } else if (error.message?.includes("RESOURCE_EXHAUSTED")) {
        throw new Error(
          "Image generation quota exceeded. Please try again later."
        );
      }

      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Generate images using Imagen 3
   * @param {string} prompt - The text prompt for image generation
   * @param {Object} options - Generation options
   * @param {string} options.model - Imagen model ("imagen3" or "imagen3Fast")
   * @param {number} options.numberOfImages - Number of images to generate (1-4)
   * @param {string} options.aspectRatio - Aspect ratio ("1:1", "9:16", "16:9", "4:3", "3:4")
   * @param {string} options.negativePrompt - What to avoid in the image
   * @param {string} options.personGeneration - "allow_all" or "block_all"
   * @returns {Promise<Array<{data: string, mimeType: string}>>} Generated images
   */
  async generateImagesWithImagen(prompt, options = {}) {
    try {
      const {
        model = "imagen3",
        numberOfImages = 1,
        aspectRatio = "1:1",
        negativePrompt = null,
        personGeneration = "allow_all",
      } = options;

      const modelToUse =
        model === "imagen3Fast"
          ? IMAGEN_MODELS.imagen3Fast
          : IMAGEN_MODELS.imagen3;

      const config = {
        numberOfImages: Math.min(Math.max(numberOfImages, 1), 4),
        aspectRatio,
        personGeneration,
      };

      if (negativePrompt) {
        config.negativePrompt = negativePrompt;
      }

      const response = await this.client.models.generateImages({
        model: modelToUse,
        prompt,
        config,
      });

      return response.images || [];
    } catch (error) {
      console.error("Imagen 3 Generation Error:", error);
      throw new Error(`Imagen 3 generation failed: ${error.message}`);
    }
  }

  /**
   * Count tokens in a message
   * @param {string} message - The message to count tokens for
   * @param {string} model - Model to use
   * @returns {Promise<number>} Token count
   */
  async countTokens(message, model = null) {
    try {
      const modelToUse = model || this.defaultModel;

      const response = await this.client.models.countTokens({
        model: modelToUse,
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      });

      return response.totalTokens;
    } catch (error) {
      console.error("Gemini Token Count Error:", error);
      throw new Error(`Token counting failed: ${error.message}`);
    }
  }

  /**
   * Helper: Extract parts from response (images, text, thoughts)
   * @private
   */
  _extractResponseParts(response) {
    const results = {
      images: [],
      texts: [],
      thoughts: [],
      groundingMetadata: response.grounding_metadata || null,
    };

    if (response.parts) {
      for (const part of response.parts) {
        if (part.inline_data) {
          const imageData = {
            data: part.inline_data.data,
            mimeType: part.inline_data.mime_type || "image/png",
            thoughtSignature: part.thought_signature,
            isThought: part.thought || false,
          };

          if (part.thought) {
            results.thoughts.push(imageData);
          } else {
            results.images.push(imageData);
          }
        } else if (part.text) {
          const textData = {
            text: part.text,
            thoughtSignature: part.thought_signature,
            isThought: part.thought || false,
          };

          if (part.thought) {
            results.thoughts.push(textData);
          } else {
            results.texts.push(textData);
          }
        }
      }
    }

    return results;
  }

  /**
   * Get available models
   * @returns {Object} Available Gemini models
   */
  getAvailableModels() {
    return {
      gemini: GEMINI_MODELS,
      imagen: IMAGEN_MODELS,
      aspectRatios: ASPECT_RATIOS,
      imageSizes: IMAGE_SIZES,
    };
  }
}

// Server-side instance export - dikkatli kullanılmalı
// Not: Bu sadece API route'larda kullanılmalı, client component'lerde değil
export const geminiService =
  typeof window === "undefined" ? new GeminiService() : null;
export { GEMINI_MODELS, IMAGEN_MODELS, ASPECT_RATIOS, IMAGE_SIZES };
