/**
 * 🚀 OpenAI GPT-5+ Models Seed Data
 *
 * Bu dosya OpenAI'nin GPT-5 ve üzeri modellerini Firestore'a yüklemek için kullanılır.
 * GPT-5, GPT-5.2, GPT-5.2 Pro ve diğer gelişmiş modeller burada tanımlıdır.
 *
 * Kullanım: Admin panelinden "GPT-5+ Modelleri Yükle" butonuna tıklayın.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AI_PROVIDERS, MODEL_CATEGORIES } from "./ai-settings-service";

// ============================================================================
// GPT-5+ MODELS SEED DATA
// ============================================================================

export const SEED_GPT5_MODELS = {
  // =====================
  // GPT-5 BASE MODEL
  // 🚀 Responses API kullanır, temperature/top_p DESTEKLİYOR
  // =====================
  gpt5: {
    modelId: "gpt5",
    provider: AI_PROVIDERS.OPENAI,
    name: "GPT-5",
    displayName: "GPT-5",
    apiId: "gpt-5",
    icon: "🌟",
    description:
      "OpenAI'nin yeni nesil temel modeli. Gelişmiş reasoning ve multimodal yetenekler.",
    isActive: true,
    isDefault: false,
    usesResponsesAPI: true, // 🚀 GPT-5+ Responses API kullanır
    isReasoningModel: false, // Normal model - temperature/top_p destekler
    order: 6,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      audio: true,
      functionCalling: true,
      jsonMode: true,
      streaming: true,
      reasoning: true,
      longContext: true,
    },
    limits: {
      maxTokens: 32768,
      contextWindow: 256000,
    },
    pricing: {
      inputPer1M: 5.0,
      outputPer1M: 15.0,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 8192,
    },
    metadata: {
      releaseDate: "2026-01-15",
      version: "5.0",
      capabilities: [
        "Extended context window (256K)",
        "Advanced multimodal processing",
        "Improved reasoning capabilities",
        "Enhanced code generation",
        "Better multilingual support",
      ],
    },
  },

  // =====================
  // GPT-5.2
  // 🚀 Responses API kullanır, temperature/top_p DESTEKLİYOR
  // =====================
  gpt5_2: {
    modelId: "gpt5_2",
    provider: AI_PROVIDERS.OPENAI,
    name: "GPT-5.2",
    displayName: "GPT-5.2",
    apiId: "gpt-5.2",
    icon: "🚀",
    description:
      "GPT-5'in optimize edilmiş versiyonu. Daha hızlı ve verimli performans.",
    isActive: true,
    isDefault: false,
    usesResponsesAPI: true, // 🚀 GPT-5+ Responses API kullanır
    isReasoningModel: false, // Normal model - temperature/top_p destekler
    order: 7,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      audio: true,
      video: true,
      functionCalling: true,
      jsonMode: true,
      streaming: true,
      reasoning: true,
      longContext: true,
      realTimeProcessing: true,
    },
    limits: {
      maxTokens: 65536,
      contextWindow: 512000,
    },
    pricing: {
      inputPer1M: 8.0,
      outputPer1M: 24.0,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 16384,
    },
    metadata: {
      releaseDate: "2026-02-01",
      version: "5.2",
      capabilities: [
        "Ultra-long context (512K tokens)",
        "Real-time audio/video processing",
        "Advanced function calling",
        "Superior code understanding",
        "Enhanced creative writing",
        "Multi-step reasoning",
      ],
    },
  },

  // =====================
  // GPT-5.2 PRO (Reasoning Model)
  // 🧠 Bu model Responses API kullanır
  // ❌ temperature ve top_p KULLANILMAZ
  // ✅ reasoning.effort: "low" | "medium" | "high" kullanılır
  // =====================
  gpt5_2_pro: {
    modelId: "gpt5_2_pro",
    provider: AI_PROVIDERS.OPENAI,
    name: "GPT-5.2 Pro",
    displayName: "GPT-5.2 Pro",
    apiId: "gpt-5.2-pro", // ✅ Responses API ile kullanılıyor
    icon: "💎",
    description:
      "En güçlü GPT modeli. Deep reasoning ile profesyonel ve karmaşık görevler için optimize edilmiş.",
    isActive: true,
    isDefault: false,
    usesResponsesAPI: true, // 🚀 Responses API kullanır
    isReasoningModel: true, // 🧠 Reasoning modeli - temperature/top_p YOK
    defaultReasoningEffort: "high", // Varsayılan reasoning effort
    order: 8,
    category: MODEL_CATEGORIES.REASONING,
    capabilities: {
      chat: true,
      vision: true,
      audio: true,
      video: true,
      functionCalling: true,
      jsonMode: true,
      streaming: true,
      reasoning: true,
      deepReasoning: true,
      longContext: true,
      realTimeProcessing: true,
      codeExecution: true,
      webSearch: true,
    },
    limits: {
      maxTokens: 131072,
      contextWindow: 1000000,
    },
    pricing: {
      inputPer1M: 20.0,
      outputPer1M: 60.0,
    },
    settings: {
      defaultTemperature: 0.5,
      defaultMaxTokens: 32768,
    },
    metadata: {
      releaseDate: "2026-02-05",
      version: "5.2-pro",
      capabilities: [
        "1M token context window",
        "Deep reasoning & analysis",
        "Native code execution",
        "Web search integration",
        "Advanced multimodal understanding",
        "Professional-grade outputs",
        "Real-time collaboration",
        "Enhanced safety & alignment",
      ],
    },
  },

  // =====================
  // GPT-5 NANO
  // 🚀 Responses API kullanır, temperature/top_p DESTEKLEMİYOR
  // =====================
  gpt5_nano: {
    modelId: "gpt5_nano",
    provider: AI_PROVIDERS.OPENAI,
    name: "GPT-5 Nano",
    displayName: "GPT-5 Nano",
    apiId: "gpt-5-nano",
    icon: "🔬",
    description:
      "GPT-5'in en hafif versiyonu. Ultra düşük maliyet, hızlı yanıtlar.",
    isActive: true,
    isDefault: false,
    usesResponsesAPI: true, // 🚀 GPT-5+ Responses API kullanır
    isReasoningModel: true, // ⚠️ Nano model - temperature/top_p DESTEKLEMİYOR
    order: 9,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: false,
      functionCalling: true,
      jsonMode: true,
      streaming: true,
    },
    limits: {
      maxTokens: 8192,
      contextWindow: 64000,
    },
    pricing: {
      inputPer1M: 0.25,
      outputPer1M: 0.75,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 2048,
    },
    metadata: {
      releaseDate: "2026-01-28",
      version: "5.0-nano",
      capabilities: [
        "Ultra cost-effective",
        "Fastest response times",
        "Perfect for simple tasks",
        "Lightweight deployment",
      ],
    },
  },

  // =====================
  // GPT-5 MINI
  // 🚀 Responses API kullanır, temperature/top_p DESTEKLEMİYOR
  // =====================
  gpt5_mini: {
    modelId: "gpt5_mini",
    provider: AI_PROVIDERS.OPENAI,
    name: "GPT-5 Mini",
    displayName: "GPT-5 Mini",
    apiId: "gpt-5-mini",
    icon: "🔹",
    description:
      "Kompakt ve ekonomik GPT-5 versiyonu. Günlük görevler için ideal.",
    isActive: true,
    isDefault: false,
    usesResponsesAPI: true, // 🚀 GPT-5+ Responses API kullanır
    isReasoningModel: true, // ⚠️ Mini model - temperature/top_p DESTEKLEMİYOR
    order: 10,
    category: MODEL_CATEGORIES.CHAT,
    capabilities: {
      chat: true,
      vision: true,
      functionCalling: true,
      jsonMode: true,
      streaming: true,
    },
    limits: {
      maxTokens: 16384,
      contextWindow: 128000,
    },
    pricing: {
      inputPer1M: 0.5,
      outputPer1M: 1.5,
    },
    settings: {
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
    },
    metadata: {
      releaseDate: "2026-01-25",
      version: "5.0-mini",
      capabilities: [
        "Highly cost-effective",
        "Fast response times",
        "Good for simple tasks",
        "Efficient token usage",
      ],
    },
  },
};

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Seed OpenAI GPT-5+ models to Firestore
 * Sadece modelleri ekler, mevcut provider ve configuration'ları değiştirmez
 */
export async function seedOpenAIGPT5Models() {
  const results = {
    models: { success: 0, failed: 0, updated: 0 },
  };

  try {
    console.log("🚀 Seeding OpenAI GPT-5+ models...");

    // Seed Models
    for (const [id, data] of Object.entries(SEED_GPT5_MODELS)) {
      try {
        const modelRef = doc(db, "ai_models", id);
        await setDoc(
          modelRef,
          {
            ...data,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        results.models.success++;
        console.log(`✅ Model seeded: ${data.displayName}`);
      } catch (error) {
        console.error(`❌ Failed to seed model ${id}:`, error);
        results.models.failed++;
      }
    }

    console.log("✅ GPT-5+ models seed completed:", results);

    return {
      success: true,
      results,
      message: `${results.models.success} GPT-5+ model başarıyla yüklendi.`,
    };
  } catch (error) {
    console.error("❌ GPT-5+ models seed failed:", error);
    return {
      success: false,
      error: error.message,
      results,
    };
  }
}

/**
 * Check if GPT-5+ models are already seeded
 */
export async function checkGPT5ModelsSeeded() {
  try {
    const modelsRef = collection(db, "ai_models");
    const snapshot = await getDocs(modelsRef);

    const gpt5Models = [];
    const totalGPT5Models = Object.keys(SEED_GPT5_MODELS).length;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        data.provider === AI_PROVIDERS.OPENAI &&
        docSnap.id in SEED_GPT5_MODELS
      ) {
        gpt5Models.push({
          id: docSnap.id,
          name: data.displayName,
          exists: true,
        });
      }
    });

    return {
      isSeeded: gpt5Models.length > 0,
      seededCount: gpt5Models.length,
      totalCount: totalGPT5Models,
      allSeeded: gpt5Models.length === totalGPT5Models,
      details: gpt5Models,
      models: Object.keys(SEED_GPT5_MODELS).map((id) => ({
        id,
        name: SEED_GPT5_MODELS[id].displayName,
        exists: gpt5Models.some((m) => m.id === id),
      })),
    };
  } catch (error) {
    console.error("Error checking GPT-5+ models:", error);
    return {
      isSeeded: false,
      seededCount: 0,
      totalCount: Object.keys(SEED_GPT5_MODELS).length,
      allSeeded: false,
      details: [],
      models: [],
    };
  }
}

/**
 * Get statistics about GPT-5+ models
 */
export function getGPT5ModelStatistics() {
  const stats = {
    totalModels: Object.keys(SEED_GPT5_MODELS).length,
    byCategory: {},
    models: [],
  };

  for (const [id, model] of Object.entries(SEED_GPT5_MODELS)) {
    // Count by category
    const category = model.category;
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    // Add model info
    stats.models.push({
      id,
      name: model.displayName,
      category: model.category,
      pricing: model.pricing,
      contextWindow: model.limits.contextWindow,
    });
  }

  return stats;
}
