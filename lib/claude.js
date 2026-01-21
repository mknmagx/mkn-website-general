import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_API_IDS } from "@/lib/ai-models";

// Use centralized API IDs from ai-models.js
const CLAUDE_MODELS = {
  sonnet: CLAUDE_API_IDS.sonnet,
  haiku: CLAUDE_API_IDS.haiku,
  opus: CLAUDE_API_IDS.opus,
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// AI RESPONSE METADATA HELPERS
// ============================================================================

/**
 * Claude stop_reason değerlerini standardize et
 * Claude API: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use"
 */
function normalizeClaudeFinishReason(stopReason) {
  const mapping = {
    end_turn: "stop",
    max_tokens: "max_tokens",
    stop_sequence: "stop",
    tool_use: "tool_calls",
  };
  return mapping[stopReason] || stopReason || "unknown";
}

/**
 * Claude response'dan standardize metadata oluştur
 */
function createClaudeMetadata(response, modelUsed) {
  const finishReason = normalizeClaudeFinishReason(response.stop_reason);
  const isTruncated = response.stop_reason === "max_tokens";
  
  return {
    provider: "claude",
    model: modelUsed || response.model,
    finishReason,
    isTruncated,
    stopReason: response.stop_reason, // Original Claude value
    usage: {
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
    },
    timestamp: new Date().toISOString(),
  };
}

export class ClaudeService {
  constructor() {
    this.client = anthropic;
    this.defaultModel = CLAUDE_MODELS.haiku;
  }

  /**
   * Send a message to Claude
   * @param {string} message - The message to send to Claude
   * @param {string} systemPrompt - Optional system prompt
   * @param {number} maxTokens - Maximum tokens for response (default: 1000)
   * @param {string} model - Model to use (default: sonnet)
   * @param {boolean} returnMetadata - Return full response with metadata (default: false for backward compatibility)
   * @returns {Promise<string|Object>} Claude's response (string or {content, metadata})
   */
  async sendMessage(
    message,
    systemPrompt = null,
    maxTokens = 1000,
    model = null,
    returnMetadata = false
  ) {
    try {
      const modelToUse = model || this.defaultModel;

      const messagePayload = {
        model: modelToUse,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      };

      // Add system prompt if provided - ensure it's a string
      if (systemPrompt && typeof systemPrompt === "string") {
        messagePayload.system = systemPrompt;
      }

      const response = await this.client.messages.create(messagePayload);
      const content = response.content[0].text;

      // Return with metadata if requested
      if (returnMetadata) {
        return {
          content,
          metadata: createClaudeMetadata(response, modelToUse),
        };
      }

      return content;
    } catch (error) {
      console.error("Claude API Error:", error);

      // If model not found, try fallback models
      if (error.status === 404 && error.error?.message?.includes("model:")) {
        console.log("Trying fallback models...");
        const fallbackModels = [
          "claude-3-5-sonnet-20240620",
          "claude-3-sonnet-20240229",
          "claude-3-haiku-20240307",
        ];

        for (const fallbackModel of fallbackModels) {
          try {
            const fallbackPayload = {
              model: fallbackModel,
              max_tokens: maxTokens,
              messages: [{ role: "user", content: message }],
            };

            if (systemPrompt && typeof systemPrompt === "string") {
              fallbackPayload.system = systemPrompt;
            }

            const fallbackResponse = await this.client.messages.create(
              fallbackPayload
            );
            console.log(`Successfully used fallback model: ${fallbackModel}`);
            return fallbackResponse.content[0].text;
          } catch (fallbackError) {
            continue;
          }
        }
      }

      throw new Error(
        `Claude API Error: ${error.status} ${JSON.stringify(error.error)}`
      );
    }
  }

  /**
   * Generate content with Claude
   * @param {string} prompt - The content generation prompt
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated content with metadata {content, metadata}
   */
  async generateContent(prompt, options = {}) {
    const {
      systemPrompt = "You are a helpful AI assistant.",
      maxTokens = 2000,
      temperature = 0.7,
      model = null,
      returnMetadata = true, // Default true for generateContent
    } = options;

    try {
      const modelToUse = model || this.defaultModel;

      const messagePayload = {
        model: modelToUse,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      };

      // Add system prompt if provided - ensure it's a string
      if (systemPrompt && typeof systemPrompt === "string") {
        messagePayload.system = systemPrompt;
      }

      const response = await this.client.messages.create(messagePayload);
      const content = response.content[0].text;
      const metadata = createClaudeMetadata(response, modelToUse);

      // Log if truncated
      if (metadata.isTruncated) {
        console.warn(`⚠️ Claude response truncated (max_tokens reached). Model: ${modelToUse}, Output tokens: ${metadata.usage.outputTokens}`);
      }

      // Return with metadata (default for generateContent)
      if (returnMetadata) {
        return { content, metadata };
      }

      return content;
    } catch (error) {
      console.error("Claude Content Generation Error:", error);

      // If model not found, try fallback models
      if (error.status === 404 && error.error?.message?.includes("model:")) {
        console.log("Trying fallback models for content generation...");
        const fallbackModels = [
          "claude-3-5-sonnet-20240620",
          "claude-3-sonnet-20240229",
          "claude-3-haiku-20240307",
        ];

        for (const fallbackModel of fallbackModels) {
          try {
            const fallbackPayload = {
              model: fallbackModel,
              max_tokens: maxTokens,
              temperature: temperature,
              messages: [{ role: "user", content: prompt }],
            };

            if (systemPrompt && typeof systemPrompt === "string") {
              fallbackPayload.system = systemPrompt;
            }

            const fallbackResponse = await this.client.messages.create(
              fallbackPayload
            );
            console.log(
              `Successfully used fallback model for generation: ${fallbackModel}`
            );
            const fallbackContent = fallbackResponse.content[0].text;
            const fallbackMetadata = createClaudeMetadata(fallbackResponse, fallbackModel);
            
            if (returnMetadata) {
              return { content: fallbackContent, metadata: fallbackMetadata };
            }
            return fallbackContent;
          } catch (fallbackError) {
            continue;
          }
        }
      }

      throw new Error(
        `Claude Content Generation Error: ${error.status} ${JSON.stringify(
          error.error
        )}`
      );
    }
  }

  /**
   * Analyze text with Claude
   * @param {string} text - Text to analyze
   * @param {string} analysisType - Type of analysis (sentiment, summary, etc.)
   * @returns {Promise<string>} Analysis result
   */
  async analyzeText(text, analysisType = "general") {
    const systemPrompts = {
      sentiment:
        "Analyze the sentiment of the given text. Provide a detailed sentiment analysis.",
      summary: "Provide a concise summary of the given text.",
      general: "Analyze the given text and provide insights.",
      seo: "Analyze the text for SEO optimization and provide recommendations.",
      translation: "Translate the given text and provide language insights.",
    };

    const systemPrompt = systemPrompts[analysisType] || systemPrompts.general;

    return await this.sendMessage(text, systemPrompt, 1500);
  }

  /**
   * Chat conversation with Claude
   * @param {Array} conversation - Array of message objects
   * @param {string} systemPrompt - System prompt for the conversation
   * @param {string} model - Model to use (default: sonnet)
   * @param {boolean} returnMetadata - Return full response with metadata
   * @returns {Promise<string|Object>} Claude's response
   */
  async chatConversation(conversation, systemPrompt = null, model = null, returnMetadata = false) {
    try {
      const modelToUse = model || this.defaultModel;
      
      const messagePayload = {
        model: modelToUse,
        max_tokens: 2000,
        messages: conversation,
      };

      if (systemPrompt) {
        messagePayload.system = systemPrompt;
      }

      const response = await this.client.messages.create(messagePayload);
      const content = response.content[0].text;

      if (returnMetadata) {
        return {
          content,
          metadata: createClaudeMetadata(response, modelToUse),
        };
      }

      return content;
    } catch (error) {
      console.error("Claude Chat Error:", error);
      throw new Error(`Claude Chat Error: ${error.message}`);
    }
  }
}

export const claudeService = new ClaudeService();

export { anthropic };

export { CLAUDE_MODELS };

export default ClaudeService;
