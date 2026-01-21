/**
 * 🎣 useUnifiedAI Hook
 * 
 * React hook for unified AI service integration.
 * Uses API routes for server-side AI generation.
 * 
 * Features:
 * - Dynamic model/prompt loading from Firestore via API
 * - Multi-provider support (Claude, Gemini, OpenAI)
 * - Loading states and error handling
 * - Client-safe (no server-side imports)
 * 
 * Usage:
 * ```jsx
 * import { useUnifiedAI, AI_CONTEXTS } from '@/hooks/use-unified-ai';
 * 
 * function BlogGenerator() {
 *   const { 
 *     generateContent, 
 *     loading, 
 *     error, 
 *     config, 
 *     availableModels 
 *   } = useUnifiedAI(AI_CONTEXTS.BLOG_GENERATION);
 * 
 *   const handleGenerate = async () => {
 *     const result = await generateContent(prompt);
 *     // result.content, result.model, result.provider
 *   };
 * }
 * ```
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// Merkezi AI sabitleri import et
import { 
  AI_CONTEXTS, 
  AI_PROVIDERS,
  AI_PROVIDER_TYPES,
  PROVIDER_INFO,
  FALLBACK_MODELS,
  getProviderIcon,
  getDefaultFallbackModel,
} from "@/lib/ai-constants";

// Re-export for backward compatibility
export { AI_CONTEXTS, AI_PROVIDERS, AI_PROVIDER_TYPES, PROVIDER_INFO };

/**
 * Unified AI Hook
 * 
 * @param {string} context - AI usage context (blog_generation, crm_reply, etc.)
 * @param {Object} options - Hook options
 */
export function useUnifiedAI(context, options = {}) {
  const { 
    autoLoad = true,        // Otomatik config yükleme
  } = options;

  // States
  const [config, setConfig] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [platformPromptsInfo, setPlatformPromptsInfo] = useState(null); // Platform bazlı prompt bilgileri
  const [categoryPromptsInfo, setCategoryPromptsInfo] = useState(null); // Category bazlı prompt bilgileri (Formula için)
  const [platformPromptCache, setPlatformPromptCache] = useState({}); // Platform/Category prompt cache
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  /**
   * Load configuration from API
   */
  const loadConfiguration = useCallback(async () => {
    if (!context) return;

    setConfigLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getConfig",
          contextKey: context,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
        setAvailableModels(data.models || []);
        setPrompt(data.prompt);
        setPlatformPromptsInfo(data.platformPromptsInfo || null);
        setCategoryPromptsInfo(data.categoryPromptsInfo || null);

        // Set default model
        if (data.config?.defaultModelId && data.models?.length > 0) {
          const defaultModel = data.models.find(
            (m) => m.id === data.config.defaultModelId || m.modelId === data.config.defaultModelId
          );
          setSelectedModel(defaultModel || data.models[0]);
        } else if (data.models?.length > 0) {
          setSelectedModel(data.models[0]);
        }
      } else {
        throw new Error(data.error || "Failed to load configuration");
      }
    } catch (err) {
      setError(err.message);
      
      // Merkezi fallback modeller
      setAvailableModels(FALLBACK_MODELS);
      setSelectedModel(getDefaultFallbackModel());
    } finally {
      setConfigLoading(false);
    }
  }, [context]);

  /**
   * Load prompt for specific platform
   * @param {string} platform - Platform identifier (instagram, facebook, x, linkedin)
   * @returns {Promise<Object|null>} Platform-specific prompt data
   */
  const loadPromptForPlatform = useCallback(async (platform) => {
    if (!context || !platform) return null;
    
    // Check cache first
    if (platformPromptCache[platform]) {
      return platformPromptCache[platform];
    }

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getPromptForPlatform",
          contextKey: context,
          platform: platform,
        }),
      });

      const data = await response.json();

      if (data.success && data.prompt) {
        // Cache the prompt
        setPlatformPromptCache(prev => ({
          ...prev,
          [platform]: data.prompt,
        }));
        return data.prompt;
      }
      
      // Fallback to default prompt
      return prompt;
    } catch (err) {
      console.error(`Error loading prompt for platform ${platform}:`, err);
      return prompt; // Fallback to default
    }
  }, [context, prompt, platformPromptCache]);

  /**
   * Load prompt for specific category (Formula için)
   * @param {string} category - Category identifier (cosmetic, dermocosmetic, cleaning, supplement)
   * @returns {Promise<Object|null>} Category-specific prompt data
   */
  const loadPromptForCategory = useCallback(async (category) => {
    if (!context || !category) return null;
    
    // Check cache first (platformPromptCache'i category için de kullanıyoruz)
    const cacheKey = `category_${category}`;
    if (platformPromptCache[cacheKey]) {
      return platformPromptCache[cacheKey];
    }

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getPromptForCategory",
          contextKey: context,
          category: category,
        }),
      });

      const data = await response.json();

      if (data.success && data.prompt) {
        // Cache the prompt
        setPlatformPromptCache(prev => ({
          ...prev,
          [cacheKey]: data.prompt,
        }));
        return data.prompt;
      }
      
      // Fallback to default prompt
      return prompt;
    } catch (err) {
      console.error(`Error loading prompt for category ${category}:`, err);
      return prompt; // Fallback to default
    }
  }, [context, prompt, platformPromptCache]);

  /**
   * Generate content using API
   */
  const generateContent = useCallback(async (promptText, generateOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          contextKey: context,
          prompt: promptText,
          modelId: generateOptions.modelId || selectedModel?.modelId || selectedModel?.id,
          options: {
            systemPrompt: generateOptions.systemPrompt,
            temperature: generateOptions.temperature,
            maxTokens: generateOptions.maxTokens,
            ...generateOptions,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result = {
          success: true,
          content: data.content,
          model: data.model,
          apiModel: data.apiModel,
          provider: data.provider,
          aiMetadata: data.aiMetadata, // AI metadata ekle
        };
        setLastResult(result);
        return result;
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [context, selectedModel]);

  /**
   * Generate with specific model
   */
  const generateWithModel = useCallback(async (modelId, promptText, generateOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          contextKey: context,
          prompt: promptText,
          modelId: modelId,
          options: {
            systemPrompt: generateOptions.systemPrompt,
            temperature: generateOptions.temperature,
            maxTokens: generateOptions.maxTokens,
            ...generateOptions,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result = {
          success: true,
          content: data.content,
          model: data.model,
          provider: data.provider,
        };
        setLastResult(result);
        return result;
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [context]);

  /**
   * Chat method
   */
  const chat = useCallback(async (message, chatOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          contextKey: context,
          prompt: message,
          modelId: chatOptions.modelId || selectedModel?.modelId || selectedModel?.id,
          options: {
            systemPrompt: chatOptions.systemPrompt,
            maxTokens: chatOptions.maxTokens,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, content: data.content };
      } else {
        throw new Error(data.error || "Chat failed");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [context, selectedModel]);

  /**
   * Improve content
   */
  const improveContent = useCallback(async (content, improveOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "improve",
          contextKey: context,
          prompt: content,
          modelId: improveOptions.modelId || selectedModel?.modelId || selectedModel?.id,
          options: {
            systemPrompt: improveOptions.systemPrompt,
            improvementPrompt: improveOptions.improvementPrompt,
            maxTokens: improveOptions.maxTokens,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result = {
          success: true,
          content: data.content,
          model: data.model,
          provider: data.provider,
        };
        setLastResult(result);
        return result;
      } else {
        throw new Error(data.error || "Improvement failed");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [context, selectedModel]);

  /**
   * Change selected model
   */
  const selectModel = useCallback((modelId) => {
    const model = availableModels.find(
      (m) => m.id === modelId || m.modelId === modelId
    );
    if (model) {
      setSelectedModel(model);
      return true;
    }
    return false;
  }, [availableModels]);

  /**
   * Refresh configuration
   */
  const refresh = useCallback(() => {
    return loadConfiguration();
  }, [loadConfiguration]);

  /**
   * Get current provider info
   */
  const currentProvider = useMemo(() => {
    if (!selectedModel) return null;
    const info = PROVIDER_INFO[selectedModel.provider];
    return {
      id: selectedModel.provider,
      name: info?.name || selectedModel.provider,
      icon: info?.icon || "⚪",
    };
  }, [selectedModel]);

  // Group models by provider
  const modelsByProvider = useMemo(() => {
    const grouped = {};
    availableModels.forEach((model) => {
      const provider = model.provider || "other";
      if (!grouped[provider]) {
        grouped[provider] = [];
      }
      grouped[provider].push(model);
    });
    return grouped;
  }, [availableModels]);

  // Check if platform prompts are available
  const hasPlatformPrompts = useMemo(() => {
    return !!(config?.platformPrompts && Object.keys(config.platformPrompts).length > 0);
  }, [config]);

  // Check if category prompts are available
  const hasCategoryPrompts = useMemo(() => {
    return !!(config?.categoryPrompts && Object.keys(config.categoryPrompts).length > 0);
  }, [config]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && context) {
      loadConfiguration();
    }
  }, [autoLoad, context, loadConfiguration]);

  return {
    // Configuration
    config,
    availableModels,
    modelsByProvider,
    selectedModel,
    currentProvider,
    prompt,
    
    // Platform-specific prompts
    platformPromptsInfo,      // Platform prompt bilgileri (name, description, version)
    hasPlatformPrompts,       // Platform prompt'ları var mı?
    loadPromptForPlatform,    // Platform için prompt yükle
    platformPromptCache,      // Yüklenmiş platform prompt'ları
    
    // Category-specific prompts (formula generation vb.)
    categoryPromptsInfo,      // Kategori prompt bilgileri (name, description, version)
    hasCategoryPrompts,       // Kategori prompt'ları var mı?
    loadPromptForCategory,    // Kategori için prompt yükle
    
    // Actions
    generateContent,
    generateWithModel,
    chat,
    improveContent,
    selectModel,
    refresh,
    getProviderIcon, // Merkezi helper
    
    // States
    loading,
    configLoading,
    error,
    lastResult,
    
    // Helpers
    isReady: !configLoading,
    hasModels: availableModels.length > 0,
  };
}

/**
 * Blog specific hook
 */
export function useBlogAI() {
  return useUnifiedAI(AI_CONTEXTS.BLOG_GENERATION);
}

/**
 * CRM specific hook
 */
export function useCRMAI() {
  return useUnifiedAI(AI_CONTEXTS.CRM_REPLY);
}

/**
 * Social Media specific hook
 */
export function useSocialMediaAI() {
  return useUnifiedAI(AI_CONTEXTS.SOCIAL_CONTENT);
}

/**
 * Content Studio specific hook
 */
export function useContentStudioAI() {
  return useUnifiedAI(AI_CONTEXTS.CONTENT_STUDIO);
}

export default useUnifiedAI;
