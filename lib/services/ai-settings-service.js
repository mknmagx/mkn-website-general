/**
 * 🤖 AI Settings Service
 * 
 * Firestore tabanlı dinamik AI yönetim sistemi
 * - AI Model yönetimi (Claude, Gemini, ChatGPT)
 * - System prompt yönetimi
 * - Provider ayarları
 * - Kullanım alanı bazlı konfigürasyon
 * 
 * Collections:
 * - ai_providers: AI sağlayıcı ayarları (Claude, Gemini, OpenAI)
 * - ai_models: Her provider için model tanımları
 * - ai_prompts: System prompt şablonları
 * - ai_configurations: Kullanım alanı bazlı konfigürasyonlar
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CLAUDE_MODELS, ALL_AI_MODELS_ARRAY } from "@/lib/ai-models";

// Merkezi AI sabitleri import et
import {
  AI_PROVIDERS,
  AI_PROVIDER_TYPES,
  PROVIDER_INFO,
  AI_COLLECTIONS,
  MODEL_CATEGORIES,
  PROMPT_CATEGORIES,
} from "@/lib/ai-constants";

// Re-export for backward compatibility
export { 
  AI_PROVIDERS, 
  AI_PROVIDER_TYPES, 
  PROVIDER_INFO, 
  MODEL_CATEGORIES, 
  PROMPT_CATEGORIES 
};

// Collection names from centralized constants
const COLLECTIONS = AI_COLLECTIONS;

// ============================================================================
// USAGE CONTEXTS (Where AI is used in the app) - Legacy support
// ============================================================================

export const USAGE_CONTEXTS = {
  // Admin Pages
  ADMIN_CRM: "admin_crm",
  ADMIN_BLOG: "admin_blog",
  ADMIN_SOCIAL_MEDIA: "admin_social_media",
  ADMIN_FORMULAS: "admin_formulas",
  ADMIN_CONTENT_STUDIO: "admin_content_studio",
  
  // Chat Interfaces
  CHAT_GEMINI: "chat_gemini",
  CHAT_CHATGPT: "chat_chatgpt",
  
  // API Endpoints
  API_CONTENT_GENERATE: "api_content_generate",
  API_IMAGE_GENERATE: "api_image_generate",
  API_ANALYZE: "api_analyze",
  
  // Services
  SERVICE_IMAGE_SELECTION: "service_image_selection",
  SERVICE_TITLE_GENERATION: "service_title_generation",
};

// ============================================================================
// PROVIDER CRUD OPERATIONS
// ============================================================================

/**
 * Get all AI providers
 */
export async function getAiProviders() {
  try {
    const providersRef = collection(db, COLLECTIONS.PROVIDERS);
    const q = query(providersRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting AI providers:", error);
    throw error;
  }
}

/**
 * Get a single AI provider
 */
export async function getAiProvider(providerId) {
  try {
    const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
    const snapshot = await getDoc(providerRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Error getting AI provider:", error);
    throw error;
  }
}

/**
 * Update AI provider settings
 */
export async function updateAiProvider(providerId, data) {
  try {
    const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
    await updateDoc(providerRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating AI provider:", error);
    throw error;
  }
}

/**
 * Create or initialize AI provider
 */
export async function createAiProvider(providerId, data) {
  try {
    const providerRef = doc(db, COLLECTIONS.PROVIDERS, providerId);
    await setDoc(providerRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, id: providerId };
  } catch (error) {
    console.error("Error creating AI provider:", error);
    throw error;
  }
}

// ============================================================================
// MODEL CRUD OPERATIONS
// ============================================================================

/**
 * Get all AI models
 */
export async function getAiModels(filters = {}) {
  try {
    const modelsRef = collection(db, COLLECTIONS.MODELS);
    let q = query(modelsRef, orderBy("provider"), orderBy("order", "asc"));
    
    if (filters.provider) {
      q = query(modelsRef, 
        where("provider", "==", filters.provider),
        orderBy("order", "asc")
      );
    }
    
    if (filters.isActive !== undefined) {
      q = query(modelsRef,
        where("isActive", "==", filters.isActive),
        orderBy("provider"),
        orderBy("order", "asc")
      );
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting AI models:", error);
    throw error;
  }
}

/**
 * Get models by provider
 */
export async function getModelsByProvider(provider) {
  try {
    const modelsRef = collection(db, COLLECTIONS.MODELS);
    const q = query(
      modelsRef,
      where("provider", "==", provider),
      where("isActive", "==", true),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting models by provider:", error);
    throw error;
  }
}

/**
 * Get a single AI model
 */
export async function getAiModel(modelId) {
  try {
    const modelRef = doc(db, COLLECTIONS.MODELS, modelId);
    const snapshot = await getDoc(modelRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Error getting AI model:", error);
    throw error;
  }
}

/**
 * Create a new AI model
 */
export async function createAiModel(data) {
  try {
    const modelId = data.modelId || `${data.provider}_${data.name.toLowerCase().replace(/\s+/g, "_")}`;
    const modelRef = doc(db, COLLECTIONS.MODELS, modelId);
    
    await setDoc(modelRef, {
      ...data,
      modelId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, id: modelId };
  } catch (error) {
    console.error("Error creating AI model:", error);
    throw error;
  }
}

/**
 * Update an AI model
 */
export async function updateAiModel(modelId, data) {
  try {
    const modelRef = doc(db, COLLECTIONS.MODELS, modelId);
    await updateDoc(modelRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating AI model:", error);
    throw error;
  }
}

/**
 * Delete an AI model
 */
export async function deleteAiModel(modelId) {
  try {
    const modelRef = doc(db, COLLECTIONS.MODELS, modelId);
    await deleteDoc(modelRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting AI model:", error);
    throw error;
  }
}

/**
 * Toggle model active status
 */
export async function toggleModelStatus(modelId, isActive) {
  try {
    const modelRef = doc(db, COLLECTIONS.MODELS, modelId);
    await updateDoc(modelRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error toggling model status:", error);
    throw error;
  }
}

// ============================================================================
// PROMPT CRUD OPERATIONS
// ============================================================================

/**
 * Get all AI prompts
 */
export async function getAiPrompts(filters = {}) {
  try {
    const promptsRef = collection(db, COLLECTIONS.PROMPTS);
    let q = query(promptsRef, orderBy("category"), orderBy("name"));
    
    if (filters.category) {
      q = query(promptsRef,
        where("category", "==", filters.category),
        orderBy("name")
      );
    }
    
    if (filters.isActive !== undefined) {
      q = query(promptsRef,
        where("isActive", "==", filters.isActive),
        orderBy("category"),
        orderBy("name")
      );
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting AI prompts:", error);
    throw error;
  }
}

/**
 * Get prompts by category
 */
export async function getPromptsByCategory(category) {
  try {
    const promptsRef = collection(db, COLLECTIONS.PROMPTS);
    const q = query(
      promptsRef,
      where("category", "==", category),
      where("isActive", "==", true),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting prompts by category:", error);
    throw error;
  }
}

/**
 * Get a single AI prompt
 */
export async function getAiPrompt(promptId) {
  try {
    const promptRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    const snapshot = await getDoc(promptRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Error getting AI prompt:", error);
    throw error;
  }
}

/**
 * Get prompt by key (unique identifier)
 */
export async function getPromptByKey(key) {
  try {
    const promptsRef = collection(db, COLLECTIONS.PROMPTS);
    const q = query(promptsRef, where("key", "==", key));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error getting prompt by key:", error);
    throw error;
  }
}

/**
 * Create a new AI prompt
 */
export async function createAiPrompt(data) {
  try {
    const promptId = data.key || `${data.category}_${Date.now()}`;
    const promptRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    
    await setDoc(promptRef, {
      ...data,
      key: data.key || promptId,
      version: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, id: promptId };
  } catch (error) {
    console.error("Error creating AI prompt:", error);
    throw error;
  }
}

/**
 * Update an AI prompt
 */
export async function updateAiPrompt(promptId, data) {
  try {
    const promptRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    const currentDoc = await getDoc(promptRef);
    const currentVersion = currentDoc.exists() ? (currentDoc.data().version || 1) : 1;
    
    await updateDoc(promptRef, {
      ...data,
      version: currentVersion + 1,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating AI prompt:", error);
    throw error;
  }
}

/**
 * Delete an AI prompt
 */
export async function deleteAiPrompt(promptId) {
  try {
    const promptRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    await deleteDoc(promptRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting AI prompt:", error);
    throw error;
  }
}

// ============================================================================
// CONFIGURATION CRUD OPERATIONS
// ============================================================================

/**
 * Get all AI configurations
 */
export async function getAiConfigurations() {
  try {
    const configsRef = collection(db, COLLECTIONS.CONFIGURATIONS);
    const q = query(configsRef, orderBy("context"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting AI configurations:", error);
    throw error;
  }
}

/**
 * Get configuration by context
 */
export async function getConfigurationByContext(context) {
  try {
    const configRef = doc(db, COLLECTIONS.CONFIGURATIONS, context);
    const snapshot = await getDoc(configRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = {
      id: snapshot.id,
      ...snapshot.data(),
    };
    
    return data;
  } catch (error) {
    console.error("Error getting configuration by context:", error);
    throw error;
  }
}

/**
 * Create or update AI configuration
 */
export async function setAiConfiguration(context, data) {
  try {
    const configRef = doc(db, COLLECTIONS.CONFIGURATIONS, context);
    
    // context field'ını data'dan çıkar (zaten doc ID olarak kullanılıyor)
    const { context: _, ...cleanData } = data;
    
    // Önce mevcut dökümanı kontrol et
    const existingDoc = await getDoc(configRef);
    
    if (existingDoc.exists()) {
      // Varsa update et (merge ile)
      await setDoc(configRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      // Yoksa yeni oluştur
      await setDoc(configRef, {
        context, // Sadece yeni oluştururken context ekle
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error setting AI configuration:", error);
    throw error;
  }
}

/**
 * Delete AI configuration
 */
export async function deleteAiConfiguration(context) {
  try {
    const configRef = doc(db, COLLECTIONS.CONFIGURATIONS, context);
    await deleteDoc(configRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting AI configuration:", error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the default model for a specific context
 */
export async function getDefaultModelForContext(context) {
  try {
    const config = await getConfigurationByContext(context);
    if (config?.defaultModelId) {
      return await getAiModel(config.defaultModelId);
    }
    return null;
  } catch (error) {
    console.error("Error getting default model for context:", error);
    return null;
  }
}

/**
 * Get the prompt for a specific context
 */
export async function getPromptForContext(context) {
  try {
    const config = await getConfigurationByContext(context);
    if (config?.promptKey) {
      return await getPromptByKey(config.promptKey);
    }
    return null;
  } catch (error) {
    console.error("Error getting prompt for context:", error);
    return null;
  }
}

/**
 * Get full configuration for a context (model + prompt + settings)
 */
export async function getFullConfigurationForContext(context) {
  try {
    const config = await getConfigurationByContext(context);
    if (!config) {
      return null;
    }
    
    const [model, prompt] = await Promise.all([
      config.defaultModelId ? getAiModel(config.defaultModelId) : null,
      config.promptKey ? getPromptByKey(config.promptKey) : null,
    ]);

    // Çoklu model desteği - allowedModelIds varsa modelleri getir
    let allowedModels = [];
    if (config.allowedModelIds && config.allowedModelIds.length > 0) {
      const modelPromises = config.allowedModelIds.map(id => getAiModel(id));
      allowedModels = (await Promise.all(modelPromises)).filter(Boolean);
    }
    
    const fullConfig = {
      ...config,
      model,
      prompt,
      allowedModels,
    };
    
    return fullConfig;
  } catch (error) {
    console.error("Error getting full configuration for context:", error);
    return null;
  }
}

/**
 * Get allowed models for a specific context (for dropdowns)
 */
export async function getAllowedModelsForContext(context) {
  try {
    const config = await getConfigurationByContext(context);
    if (!config) {
      return [];
    }

    // Eğer allowedModelIds tanımlıysa sadece onları getir
    if (config.allowedModelIds && config.allowedModelIds.length > 0) {
      const modelPromises = config.allowedModelIds.map(id => getAiModel(id));
      const modelsFromDB = (await Promise.all(modelPromises)).filter(Boolean);
      
      // Database'den gelen modeller
      const formattedModels = modelsFromDB.map((model) => ({
        value: model.modelId,
        label: model.displayName || model.name,
        description: model.description,
        icon: model.icon,
        provider: model.provider,
        apiId: model.apiId,
        capabilities: model.capabilities,
        settings: model.settings,
        color: model.color,
        versions: model.versions,
        recommended: model.recommended,
      }));
      
      // Database'de bulunamayan model ID'leri için fallback
      const foundModelIds = new Set(modelsFromDB.map(m => m.modelId));
      const missingModelIds = config.allowedModelIds.filter(id => !foundModelIds.has(id));
      
      if (missingModelIds.length > 0) {
        // ALL_AI_MODELS_ARRAY'den eksik modelleri bul ve ekle
        const fallbackModels = missingModelIds
          .map(id => {
            // 1. Tam eşleşme ara
            let aiModel = ALL_AI_MODELS_ARRAY.find(m => m.id === id || m.apiId === id);
            
            // 2. Eğer bulunamazsa, benzer ID'leri kontrol et
            if (!aiModel) {
              const normalizedId = id.toLowerCase().replace(/_/g, '-');
              aiModel = ALL_AI_MODELS_ARRAY.find(m => {
                const modelId = m.id.toLowerCase().replace(/\./g, '-');
                return modelId.includes(normalizedId) || normalizedId.includes(modelId);
              });
            }
            
            if (aiModel) {
              return {
                value: aiModel.id,
                label: aiModel.name,
                description: aiModel.description,
                icon: aiModel.iconEmoji || "🤖",
                provider: aiModel.provider,
                apiId: aiModel.apiId,
                capabilities: aiModel.capabilities,
                settings: { defaultMaxTokens: aiModel.maxTokens },
                color: aiModel.color,
                versions: aiModel.versions,
                recommended: aiModel.recommended,
              };
            }
            
            return null;
          })
          .filter(Boolean);
        
        return [...formattedModels, ...fallbackModels];
      }
      
      return formattedModels;
    }

    // allowedModelIds boşsa, sadece varsayılan modeli döndür (varsa)
    if (config.defaultModelId) {
      const defaultModel = await getAiModel(config.defaultModelId);
      if (defaultModel) {
        return [{
          value: defaultModel.modelId,
          label: defaultModel.displayName || defaultModel.name,
          description: defaultModel.description,
          icon: defaultModel.icon,
          provider: defaultModel.provider,
          apiId: defaultModel.apiId,
          capabilities: defaultModel.capabilities,
          settings: defaultModel.settings,
        }];
      }
    }

    // Hiçbiri yoksa boş dizi döndür
    return [];
  } catch (error) {
    console.error("Error getting allowed models for context:", error);
    return [];
  }
}

/**
 * Get models formatted for UI dropdown
 */
export async function getModelsForDropdown(provider = null) {
  try {
    const models = provider 
      ? await getModelsByProvider(provider)
      : await getAiModels({ isActive: true });
    
    return models.map((model) => ({
      value: model.modelId,
      label: model.displayName || model.name,
      description: model.description,
      icon: model.icon,
      provider: model.provider,
      apiId: model.apiId,
      capabilities: model.capabilities,
    }));
  } catch (error) {
    console.error("Error getting models for dropdown:", error);
    return [];
  }
}

/**
 * Get prompts formatted for UI dropdown
 */
export async function getPromptsForDropdown(category = null) {
  try {
    const prompts = category
      ? await getPromptsByCategory(category)
      : await getAiPrompts({ isActive: true });
    
    return prompts.map((prompt) => ({
      value: prompt.key,
      label: prompt.name,
      description: prompt.description,
      category: prompt.category,
    }));
  } catch (error) {
    console.error("Error getting prompts for dropdown:", error);
    return [];
  }
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

let cachedModels = null;
let cachedPrompts = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached models
 */
export async function getCachedModels(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && cachedModels && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedModels;
  }
  
  cachedModels = await getAiModels({ isActive: true });
  cacheTimestamp = now;
  
  return cachedModels;
}

/**
 * Get cached prompts
 */
export async function getCachedPrompts(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && cachedPrompts && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedPrompts;
  }
  
  cachedPrompts = await getAiPrompts({ isActive: true });
  cacheTimestamp = now;
  
  return cachedPrompts;
}

/**
 * Clear cache
 */
export function clearAiSettingsCache() {
  cachedModels = null;
  cachedPrompts = null;
  cacheTimestamp = null;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Initialize all default AI settings (seed data)
 */
export async function initializeDefaultAiSettings() {
  const batch = writeBatch(db);
  
  // This function will be called by the seed script
  // Implementation in ai-settings-seed.js
  
  return { success: true, message: "Use seed script to initialize settings" };
}

/**
 * Export all AI settings (for backup)
 */
export async function exportAiSettings() {
  try {
    const [providers, models, prompts, configurations] = await Promise.all([
      getAiProviders(),
      getAiModels(),
      getAiPrompts(),
      getAiConfigurations(),
    ]);
    
    return {
      exportedAt: new Date().toISOString(),
      providers,
      models,
      prompts,
      configurations,
    };
  } catch (error) {
    console.error("Error exporting AI settings:", error);
    throw error;
  }
}

/**
 * Import AI settings (from backup)
 */
export async function importAiSettings(data) {
  try {
    const batch = writeBatch(db);
    
    // Import providers
    if (data.providers) {
      for (const provider of data.providers) {
        const ref = doc(db, COLLECTIONS.PROVIDERS, provider.id);
        batch.set(ref, { ...provider, importedAt: serverTimestamp() });
      }
    }
    
    // Import models
    if (data.models) {
      for (const model of data.models) {
        const ref = doc(db, COLLECTIONS.MODELS, model.id);
        batch.set(ref, { ...model, importedAt: serverTimestamp() });
      }
    }
    
    // Import prompts
    if (data.prompts) {
      for (const prompt of data.prompts) {
        const ref = doc(db, COLLECTIONS.PROMPTS, prompt.id);
        batch.set(ref, { ...prompt, importedAt: serverTimestamp() });
      }
    }
    
    // Import configurations
    if (data.configurations) {
      for (const config of data.configurations) {
        const ref = doc(db, COLLECTIONS.CONFIGURATIONS, config.id);
        batch.set(ref, { ...config, importedAt: serverTimestamp() });
      }
    }
    
    await batch.commit();
    clearAiSettingsCache();
    
    return { success: true };
  } catch (error) {
    console.error("Error importing AI settings:", error);
    throw error;
  }
}
// ============================================================================
// PROMPT MAPPINGS - v2.0 YENİ FONKSİYONLAR
// ============================================================================

/**
 * Belirli bir context ve operation için prompt bilgisini getirir
 * @param {string} context - USAGE_CONTEXTS değeri
 * @param {string} operationKey - promptMappings içindeki işlem key'i (örn: "email_reply", "content_generation")
 * @returns {Object|null} - { promptKey, name, description, modelOverride, fullPrompt }
 */
export async function getPromptForOperation(context, operationKey) {
  try {
    const config = await getConfigurationByContext(context);
    if (!config) {
      console.warn(`Configuration not found for context: ${context}`);
      return null;
    }

    // promptMappings içinde operationKey'i ara
    if (config.promptMappings && config.promptMappings[operationKey]) {
      const mapping = config.promptMappings[operationKey];
      
      // Prompt'u getir
      const promptData = mapping.promptKey ? await getPromptByKey(mapping.promptKey) : null;
      
      // Model override varsa o modeli getir, yoksa default modeli kullan
      const modelId = mapping.modelOverride || config.defaultModelId;
      const modelData = modelId ? await getAiModel(modelId) : null;
      
      return {
        operationKey,
        promptKey: mapping.promptKey,
        name: mapping.name,
        description: mapping.description,
        fullPrompt: promptData,
        modelOverride: mapping.modelOverride,
        recommendedModel: modelData,
      };
    }

    // promptMappings yoksa eski yapıyı kullan (geriye uyumluluk)
    if (config.promptKey) {
      const promptData = await getPromptByKey(config.promptKey);
      const modelData = config.defaultModelId ? await getAiModel(config.defaultModelId) : null;
      
      return {
        operationKey: "default",
        promptKey: config.promptKey,
        name: "Varsayılan Prompt",
        description: config.description,
        fullPrompt: promptData,
        modelOverride: null,
        recommendedModel: modelData,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error getting prompt for operation ${operationKey} in context ${context}:`, error);
    return null;
  }
}

/**
 * Bir context için tüm kullanılabilir operasyonları listeler
 * @param {string} context - USAGE_CONTEXTS değeri
 * @returns {Array} - [{ operationKey, name, description, promptKey, modelOverride }]
 */
export async function getAvailableOperationsForContext(context) {
  try {
    const config = await getConfigurationByContext(context);
    if (!config) {
      return [];
    }

    // promptMappings varsa onları döndür
    if (config.promptMappings) {
      return Object.entries(config.promptMappings).map(([key, mapping]) => ({
        operationKey: key,
        name: mapping.name,
        description: mapping.description,
        promptKey: mapping.promptKey,
        modelOverride: mapping.modelOverride,
      }));
    }

    // promptMappings yoksa tek bir varsayılan operasyon döndür (geriye uyumluluk)
    if (config.promptKey) {
      return [{
        operationKey: "default",
        name: "Varsayılan İşlem",
        description: config.description,
        promptKey: config.promptKey,
        modelOverride: null,
      }];
    }

    return [];
  } catch (error) {
    console.error(`Error getting available operations for context ${context}:`, error);
    return [];
  }
}

/**
 * Context ve operation için tam konfigürasyon getirir (model + prompt + settings)
 * @param {string} context - USAGE_CONTEXTS değeri
 * @param {string} operationKey - İşlem key'i (opsiyonel, verilmezse default kullanılır)
 * @returns {Object|null} - Tam konfigürasyon objesi
 */
export async function getFullConfigurationForOperation(context, operationKey = null) {
  try {
    const config = await getConfigurationByContext(context);
    if (!config) {
      return null;
    }

    let promptInfo = null;
    let modelToUse = null;

    // operationKey verilmişse ilgili prompt mapping'i kullan
    if (operationKey && config.promptMappings && config.promptMappings[operationKey]) {
      promptInfo = await getPromptForOperation(context, operationKey);
      
      // Model override varsa onu kullan, yoksa default
      const modelId = config.promptMappings[operationKey].modelOverride || config.defaultModelId;
      modelToUse = modelId ? await getAiModel(modelId) : null;
    } else {
      // operationKey yoksa veya mapping bulunamadıysa varsayılan prompt'u kullan
      if (config.promptKey) {
        const promptData = await getPromptByKey(config.promptKey);
        promptInfo = {
          operationKey: operationKey || "default",
          promptKey: config.promptKey,
          name: "Varsayılan Prompt",
          description: config.description,
          fullPrompt: promptData,
          modelOverride: null,
        };
      }
      modelToUse = config.defaultModelId ? await getAiModel(config.defaultModelId) : null;
    }

    // Çoklu model desteği - allowedModelIds varsa modelleri getir
    let allowedModels = [];
    if (config.allowedModelIds && config.allowedModelIds.length > 0) {
      const modelPromises = config.allowedModelIds.map(id => getAiModel(id));
      allowedModels = (await Promise.all(modelPromises)).filter(Boolean);
    }

    return {
      context: config.context,
      name: config.name,
      description: config.description,
      operation: promptInfo,
      model: modelToUse,
      allowedModels,
      settings: config.settings,
      isActive: config.isActive,
    };
  } catch (error) {
    console.error(`Error getting full configuration for operation ${operationKey} in context ${context}:`, error);
    return null;
  }
}

/**
 * Get content settings (creativity, technicality, etc.) for a context
 * Returns default values from lib/ai-models.js if not configured in DB
 * @param {string} context - USAGE_CONTEXTS değeri
 * @returns {Object} - Content settings objesi
 */
export async function getContentSettingsForContext(context) {
  try {
    const config = await getConfigurationByContext(context);
    
    // DB'den contentSettings varsa onu döndür
    if (config?.contentSettings) {
      return config.contentSettings;
    }
    
    // DB'de yoksa, AI_CONTENT_SETTINGS'ten default değerleri döndür (fallback)
    // Not: Bu import client-side'da çalışmayabilir, o yüzden fallback manuel tanımlanıyor
    return {
      creativity: 70,
      technicality: 60,
      seoOptimization: 80,
      readability: 75,
    };
  } catch (error) {
    console.error(`Error getting content settings for context ${context}:`, error);
    // Hata durumunda default değerleri döndür
    return {
      creativity: 70,
      technicality: 60,
      seoOptimization: 80,
      readability: 75,
    };
  }
}