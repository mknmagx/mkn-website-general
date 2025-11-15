import Anthropic from "@anthropic-ai/sdk";

// Claude model configurations
const CLAUDE_MODELS = {
  sonnet: "claude-sonnet-4-5-20250929",
  haiku: "claude-haiku-4-5-20251001",
  opus: "claude-opus-4-1-20250805",
};

// Anthropic Claude client configuration
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude AI service functions
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
   * @returns {Promise<string>} Claude's response
   */
  async sendMessage(
    message,
    systemPrompt = null,
    maxTokens = 1000,
    model = null
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
      if (systemPrompt && typeof systemPrompt === 'string') {
        messagePayload.system = systemPrompt;
      }

      const response = await this.client.messages.create(messagePayload);

      return response.content[0].text;
    } catch (error) {
      console.error("Claude API Error:", error);
      
      // If model not found, try fallback models
      if (error.status === 404 && error.error?.message?.includes('model:')) {
        console.log('Trying fallback models...');
        const fallbackModels = ["claude-3-5-sonnet-20240620", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"];
        
        for (const fallbackModel of fallbackModels) {
          try {
            const fallbackPayload = {
              model: fallbackModel,
              max_tokens: maxTokens,
              messages: [{ role: "user", content: message }],
            };
            
            if (systemPrompt && typeof systemPrompt === 'string') {
              fallbackPayload.system = systemPrompt;
            }
            
            const fallbackResponse = await this.client.messages.create(fallbackPayload);
            console.log(`Successfully used fallback model: ${fallbackModel}`);
            return fallbackResponse.content[0].text;
          } catch (fallbackError) {
            continue;
          }
        }
      }
      
      throw new Error(`Claude API Error: ${error.status} ${JSON.stringify(error.error)}`);
    }
  }

  /**
   * Generate content with Claude
   * @param {string} prompt - The content generation prompt
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Generated content
   */
  async generateContent(prompt, options = {}) {
    const {
      systemPrompt = "You are a helpful AI assistant.",
      maxTokens = 2000,
      temperature = 0.7,
      model = null,
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
      if (systemPrompt && typeof systemPrompt === 'string') {
        messagePayload.system = systemPrompt;
      }

      const response = await this.client.messages.create(messagePayload);

      return response.content[0].text;
    } catch (error) {
      console.error("Claude Content Generation Error:", error);
      
      // If model not found, try fallback models
      if (error.status === 404 && error.error?.message?.includes('model:')) {
        console.log('Trying fallback models for content generation...');
        const fallbackModels = ["claude-3-5-sonnet-20240620", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"];
        
        for (const fallbackModel of fallbackModels) {
          try {
            const fallbackPayload = {
              model: fallbackModel,
              max_tokens: maxTokens,
              temperature: temperature,
              messages: [{ role: "user", content: prompt }],
            };
            
            if (systemPrompt && typeof systemPrompt === 'string') {
              fallbackPayload.system = systemPrompt;
            }
            
            const fallbackResponse = await this.client.messages.create(fallbackPayload);
            console.log(`Successfully used fallback model for generation: ${fallbackModel}`);
            return fallbackResponse.content[0].text;
          } catch (fallbackError) {
            continue;
          }
        }
      }
      
      throw new Error(`Claude Content Generation Error: ${error.status} ${JSON.stringify(error.error)}`);
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
   * @returns {Promise<string>} Claude's response
   */
  async chatConversation(conversation, systemPrompt = null, model = null) {
    try {
      const messagePayload = {
        model: model || this.defaultModel,
        max_tokens: 2000,
        messages: conversation,
      };

      if (systemPrompt) {
        messagePayload.system = systemPrompt;
      }

      const response = await this.client.messages.create(messagePayload);

      return response.content[0].text;
    } catch (error) {
      console.error("Claude Chat Error:", error);
      throw new Error(`Claude Chat Error: ${error.message}`);
    }
  }
}

// Export a singleton instance
export const claudeService = new ClaudeService();

// Export the Anthropic client for direct use if needed
export { anthropic };

// Export model configurations
export { CLAUDE_MODELS };

export default ClaudeService;
