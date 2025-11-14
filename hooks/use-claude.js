import { useState, useCallback } from "react";

/**
 * Custom hook for interacting with Claude AI
 * @returns {Object} Claude API functions and state
 */
export function useClaude() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const resetState = useCallback(() => {
    setError(null);
    setResponse(null);
  }, []);

  /**
   * Send a message to Claude
   * @param {string} message - The message to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Claude's response
   */
  const sendMessage = useCallback(async (message, options = {}) => {
    const { systemPrompt = null, maxTokens = 1000, type = "chat" } = options;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          systemPrompt,
          maxTokens,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || "Claude API error";
        throw new Error(
          `Claude API Error: ${response.status} - ${errorMessage}`
        );
      }

      setResponse(data.response);
      return data.response;
    } catch (err) {
      const errorMessage = err.message || "Unknown Claude API error";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate content with Claude
   * @param {string} prompt - The content generation prompt
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Generated content
   */
  const generateContent = useCallback(
    async (prompt, options = {}) => {
      return await sendMessage(prompt, { ...options, type: "generate" });
    },
    [sendMessage]
  );

  /**
   * Analyze text with Claude
   * @param {string} text - Text to analyze
   * @param {string} analysisType - Type of analysis
   * @returns {Promise<string>} Analysis result
   */
  const analyzeText = useCallback(
    async (text, analysisType = "general") => {
      return await sendMessage(text, {
        systemPrompt: analysisType,
        type: "analyze",
      });
    },
    [sendMessage]
  );

  /**
   * Have a conversation with Claude
   * @param {Array} conversation - Array of message objects
   * @param {string} systemPrompt - System prompt
   * @returns {Promise<string>} Claude's response
   */
  const chatConversation = useCallback(
    async (conversation, systemPrompt = null) => {
      return await sendMessage(conversation, {
        systemPrompt,
        type: "conversation",
      });
    },
    [sendMessage]
  );

  /**
   * Generate SEO content
   * @param {string} content - Content to optimize
   * @param {Object} options - SEO options
   * @returns {Promise<string>} SEO optimized content
   */
  const generateSEOContent = useCallback(
    async (content, options = {}) => {
      const {
        targetKeywords = [],
        contentType = "web page",
        language = "Turkish",
      } = options;

      const systemPrompt = `You are an SEO expert. Generate SEO-optimized content in ${language} for ${contentType}. 
    ${
      targetKeywords.length > 0
        ? `Target keywords: ${targetKeywords.join(", ")}`
        : ""
    }
    Focus on: meta descriptions, title tags, header structure, and keyword optimization.`;

      return await sendMessage(content, {
        systemPrompt,
        type: "generate",
        maxTokens: 2000,
      });
    },
    [sendMessage]
  );

  /**
   * Translate content
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language
   * @param {string} sourceLanguage - Source language (optional)
   * @returns {Promise<string>} Translated text
   */
  const translateContent = useCallback(
    async (text, targetLanguage, sourceLanguage = "auto") => {
      const systemPrompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
    Maintain the original tone and context. Provide only the translation.`;

      return await sendMessage(text, {
        systemPrompt,
        type: "generate",
      });
    },
    [sendMessage]
  );

  return {
    // State
    loading,
    error,
    response,

    // Actions
    sendMessage,
    generateContent,
    analyzeText,
    chatConversation,
    generateSEOContent,
    translateContent,
    resetState,
  };
}

export default useClaude;
