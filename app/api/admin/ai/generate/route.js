/**
 * 🤖 Unified AI Generation API Route
 * 
 * Tüm AI provider'ları için tek endpoint
 * Client-side'dan gelen istekleri server-side'da işler
 */

import { NextResponse } from "next/server";
import { getProvider } from "@/lib/services/ai-provider-registry";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Prompt değişkenlerini replace et
 * Handlebars-like {{#if variable}} ... {{/if}} syntax'ını destekler
 */
function replacePromptVariables(template, variables) {
  if (!template) return '';
  
  let result = template;
  
  // Önce {{#if variable}}...{{/if}} bloklarını işle
  const ifBlockRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifBlockRegex, (match, varName, content) => {
    const value = variables[varName];
    // Değer varsa ve boş değilse içeriği göster, yoksa kaldır
    if (value && value.toString().trim() !== '') {
      return content;
    }
    return '';
  });
  
  // Sonra normal {{variable}} değişkenlerini replace et
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  }
  
  return result;
}

// Firestore'dan konfigürasyon al
async function getConfiguration(contextKey) {
  try {
    const configDoc = await adminDb
      .collection("ai_configurations")
      .doc(contextKey)
      .get();

    if (!configDoc.exists) {
      return null;
    }

    return { id: configDoc.id, ...configDoc.data() };
  } catch (error) {
    console.error("Error fetching AI configuration:", error);
    return null;
  }
}

// Firestore'dan tek model al
async function getModel(modelId) {
  try {
    const modelDoc = await adminDb
      .collection("ai_models")
      .doc(modelId)
      .get();

    if (!modelDoc.exists) {
      return null;
    }

    return { id: modelDoc.id, ...modelDoc.data() };
  } catch (error) {
    console.error("Error fetching AI model:", error);
    return null;
  }
}

// Firestore'dan modelleri al
async function getAvailableModels(allowedModelIds = null) {
  try {
    const modelsSnapshot = await adminDb
      .collection("ai_models")
      .where("isActive", "==", true)
      .get();

    let models = [];
    modelsSnapshot.forEach((doc) => {
      models.push({ id: doc.id, ...doc.data() });
    });

    // allowedModelIds varsa filtrele
    if (allowedModelIds && allowedModelIds.length > 0) {
      models = models.filter(m => 
        allowedModelIds.includes(m.id) || allowedModelIds.includes(m.modelId)
      );
    }

    // Order'a göre sırala
    models.sort((a, b) => (a.order || 0) - (b.order || 0));

    return models;
  } catch (error) {
    console.error("Error fetching AI models:", error);
    return [];
  }
}

// Firestore'dan prompt al
async function getPrompt(promptKey) {
  try {
    const promptDoc = await adminDb
      .collection("ai_prompts")
      .doc(promptKey)
      .get();

    if (!promptDoc.exists) {
      return null;
    }

    return { id: promptDoc.id, ...promptDoc.data() };
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      action,
      contextKey,
      prompt,
      promptKey: requestedPromptKey, // Belirli bir prompt key isteniyorsa
      modelId,
      options = {},
      platform, // Platform bazlı prompt seçimi için (Social Media)
      category, // Category bazlı prompt seçimi için (Formula)
    } = body;

    // Action: getConfig - Konfigürasyon ve modelleri getir
    if (action === "getConfig") {
      // Önce config'i al
      const config = contextKey ? await getConfiguration(contextKey) : null;
      
      console.log(`📦 getConfig: contextKey=${contextKey}, config exists=${!!config}, promptKey=${config?.promptKey}`);
      
      // Config'deki allowedModelIds ile modelleri filtrele
      const models = await getAvailableModels(config?.allowedModelIds);

      // Prompt'u da al (platform veya category varsa specific prompt'u al)
      let promptData = null;
      let promptKey = config?.promptKey;
      
      // Platform bazlı prompt desteği (Social Media için)
      if (platform && config?.platformPrompts?.[platform]) {
        promptKey = config.platformPrompts[platform];
        console.log(`🎯 Platform-specific prompt: ${platform} -> ${promptKey}`);
      }
      
      // Category bazlı prompt desteği (Formula için)
      if (category && config?.categoryPrompts?.[category]) {
        promptKey = config.categoryPrompts[category];
        console.log(`🎯 Category-specific prompt: ${category} -> ${promptKey}`);
      }
      
      if (promptKey) {
        promptData = await getPrompt(promptKey);
        console.log(`📝 Prompt loaded: key=${promptKey}, exists=${!!promptData}, hasContent=${!!promptData?.content}`);
      } else {
        console.warn(`⚠️ Config için promptKey yok: ${contextKey}`);
      }

      // Platform prompt'larını da yükle (UI'da göstermek için)
      let platformPrompts = null;
      if (config?.platformPrompts) {
        platformPrompts = {};
        for (const [plat, pKey] of Object.entries(config.platformPrompts)) {
          const pData = await getPrompt(pKey);
          if (pData) {
            platformPrompts[plat] = {
              key: pKey,
              name: pData.name,
              description: pData.description,
              version: pData.version,
            };
          }
        }
      }

      // Category prompt'larını da yükle (Formula için)
      let categoryPrompts = null;
      if (config?.categoryPrompts) {
        categoryPrompts = {};
        for (const [cat, cKey] of Object.entries(config.categoryPrompts)) {
          const cData = await getPrompt(cKey);
          if (cData) {
            categoryPrompts[cat] = {
              key: cKey,
              name: cData.name,
              description: cData.description,
              version: cData.version,
            };
          }
        }
      }

      console.log(`📦 Config loaded: ${contextKey}, Models: ${models.length}, Prompt: ${promptData?.name || 'null'}, PlatformPrompts: ${Object.keys(platformPrompts || {}).length}, CategoryPrompts: ${Object.keys(categoryPrompts || {}).length}`);

      return NextResponse.json({
        success: true,
        config: {
          ...config,
          platformPrompts: config?.platformPrompts, // Original keys
          categoryPrompts: config?.categoryPrompts, // Original keys
        },
        models,
        prompt: promptData,
        platformPromptsInfo: platformPrompts, // Detailed info
        categoryPromptsInfo: categoryPrompts, // Detailed info
      });
    }

    // Action: getPromptForPlatform - Belirli platform için prompt al
    if (action === "getPromptForPlatform") {
      const { platform: targetPlatform } = body;
      
      if (!contextKey || !targetPlatform) {
        return NextResponse.json(
          { success: false, error: "contextKey and platform are required" },
          { status: 400 }
        );
      }
      
      const config = await getConfiguration(contextKey);
      if (!config) {
        return NextResponse.json(
          { success: false, error: "Configuration not found" },
          { status: 404 }
        );
      }
      
      // Platform-specific veya fallback prompt key
      const promptKey = config.platformPrompts?.[targetPlatform] || config.promptKey;
      const promptData = promptKey ? await getPrompt(promptKey) : null;
      
      return NextResponse.json({
        success: true,
        prompt: promptData,
        promptKey,
        isPlatformSpecific: !!config.platformPrompts?.[targetPlatform],
      });
    }

    // Action: getPromptForCategory - Belirli kategori için prompt al (Formula için)
    if (action === "getPromptForCategory") {
      const { category: targetCategory } = body;
      
      if (!contextKey || !targetCategory) {
        return NextResponse.json(
          { success: false, error: "contextKey and category are required" },
          { status: 400 }
        );
      }
      
      const config = await getConfiguration(contextKey);
      if (!config) {
        return NextResponse.json(
          { success: false, error: "Configuration not found" },
          { status: 404 }
        );
      }
      
      // Category-specific veya fallback prompt key
      const promptKey = config.categoryPrompts?.[targetCategory] || config.promptKey;
      const promptData = promptKey ? await getPrompt(promptKey) : null;
      
      console.log(`🎯 getPromptForCategory: ${targetCategory} -> ${promptKey}`);
      
      return NextResponse.json({
        success: true,
        prompt: promptData,
        promptKey,
        isCategorySpecific: !!config.categoryPrompts?.[targetCategory],
      });
    }

    // Action: generate - İçerik üret
    if (action === "generate") {
      const { promptVariables } = body;
      
      // prompt veya promptVariables olmalı
      if (!prompt && !promptVariables) {
        return NextResponse.json(
          { success: false, error: "Prompt or promptVariables is required" },
          { status: 400 }
        );
      }

      // Model bilgisini Firestore'dan al
      let modelData = null;
      let provider = null;
      let apiModelId = null;

      if (modelId) {
        // Firestore'dan model bilgisini al
        modelData = await getModel(modelId);
        
        if (modelData) {
          provider = getProvider(modelData.provider);
          apiModelId = modelData.apiId; // Gerçek API model ID'si (örn: gpt-4o, claude-sonnet-4-5-20250929)
          console.log(`🔍 Model found: ${modelId} -> API: ${apiModelId}, Provider: ${modelData.provider}`);
        }
      }

      // Model bulunamadıysa config'den default'u al
      if (!modelData && contextKey) {
        const config = await getConfiguration(contextKey);
        if (config) {
          modelData = await getModel(config.defaultModelId);
          if (modelData) {
            provider = getProvider(modelData.provider);
            apiModelId = modelData.apiId;
            console.log(`🔄 Using default model: ${config.defaultModelId} -> API: ${apiModelId}`);
          }
        }
      }

      // Hala model yoksa fallback olarak Gemini kullan
      if (!provider || !apiModelId) {
        provider = getProvider("gemini");
        apiModelId = "gemini-2.5-flash";
        console.log(`⚠️ Fallback to Gemini: ${apiModelId}`);
      }

      // System prompt'u options'dan al (öncelikli)
      // ✅ FIX: Eğer options'dan systemPrompt geldiyse onu kullan, Firestore'dan çekme!
      // Bu sayede formula-service gibi servisler kendi systemPrompt'larını gönderebilir
      // ve token tekrarı önlenir.
      let systemPrompt = options.systemPrompt;
      let promptData = null;
      let configData = null;
      let finalUserPrompt = prompt; // Default olarak direkt prompt kullan
      
      // Sadece systemPrompt yoksa Firestore'dan çek
      if (!systemPrompt && contextKey) {
        configData = await getConfiguration(contextKey);
        
        // ✅ requestedPromptKey varsa onu kullan, yoksa config'deki promptKey'i kullan
        const effectivePromptKey = requestedPromptKey || configData?.promptKey;
        
        if (effectivePromptKey) {
          promptData = await getPrompt(effectivePromptKey);
          console.log(`📝 Loading prompt: requested=${requestedPromptKey || 'none'}, config=${configData?.promptKey}, effective=${effectivePromptKey}`);
          
          if (promptData) {
            // System prompt ayrı, user prompt (content/userPromptTemplate) ayrı
            // System prompt AI'ın rolünü tanımlar
            systemPrompt = promptData.systemPrompt || `Sen MKN Group'un profesyonel içerik yazarısın.`;
            
            // promptVariables varsa userPromptTemplate'i doldur
            if (promptVariables && promptData.userPromptTemplate) {
              finalUserPrompt = replacePromptVariables(promptData.userPromptTemplate, promptVariables);
              console.log(`📝 UserPrompt generated from template (${finalUserPrompt.length} chars)`);
            }
          }
        }
      } else if (systemPrompt) {
        // systemPrompt options'dan geldi - sadece config bilgisini al metadata için
        if (contextKey) {
          configData = await getConfiguration(contextKey);
          const effectivePromptKey = requestedPromptKey || configData?.promptKey;
          if (effectivePromptKey) {
            promptData = await getPrompt(effectivePromptKey);
          }
        }
        console.log(`✅ Using provided systemPrompt (length: ${systemPrompt.length}), skipping Firestore fetch`);
      }

      const startTime = Date.now();
      console.log(`🚀 Generating with: Provider=${provider.id}, Model=${apiModelId}, SystemPrompt: ${systemPrompt?.substring(0, 50)}...`);

      // Config'den gelen settings'i fallback olarak kullan
      const effectiveMaxTokens = options.maxTokens || configData?.settings?.maxTokens || 4096;
      const effectiveTemperature = options.temperature ?? configData?.settings?.temperature ?? 0.7;

      // İçerik üret (returnMetadata: true ile metadata da döner)
      const result = await provider.generateContent(finalUserPrompt, {
        systemPrompt,
        maxTokens: effectiveMaxTokens,
        temperature: effectiveTemperature,
        apiId: apiModelId,
        model: apiModelId,
        returnMetadata: true, // ⭐ Always get metadata
        ...options,
      });


      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      // Extract content and metadata from result
      const content = result?.content || result;
      const providerMetadata = result?.metadata || null;

      // Check if response was truncated
      if (providerMetadata?.isTruncated) {
        console.warn(`⚠️ AI Response TRUNCATED! Provider: ${provider.id}, Model: ${apiModelId}, Reason: ${providerMetadata.finishReason}`);
      }

      return NextResponse.json({
        success: true,
        content: content,
        // ⭐ Provider'dan gelen standardize metadata (finishReason, isTruncated, usage)
        providerMetadata: providerMetadata,
        // AI Metadata - UI'da gösterilecek
        aiMetadata: {
          model: {
            id: modelId || "gemini_flash_25",
            apiId: apiModelId,
            name: modelData?.displayName || modelData?.name || apiModelId,
            provider: provider.id,
            providerName: provider.name,
          },
          prompt: promptData ? {
            key: promptData.key || configData?.promptKey,
            name: promptData.name,
            category: promptData.category,
            version: promptData.version,
          } : null,
          config: configData ? {
            name: configData.name,
            context: configData.context,
            operation: configData.operation,
          } : null,
          settings: {
            temperature: effectiveTemperature,
            maxTokens: effectiveMaxTokens,
          },
          performance: {
            duration: `${duration}s`,
            timestamp: new Date().toISOString(),
          },
          // ⭐ Truncation info from provider
          finishReason: providerMetadata?.finishReason || "unknown",
          isTruncated: providerMetadata?.isTruncated || false,
          usage: providerMetadata?.usage || null,
        },
        // Geriye uyumluluk için eski alanlar
        model: modelId || "gemini_flash_25",
        apiModel: apiModelId,
        provider: provider.id,
        // ⭐ Direct access to truncation status
        isTruncated: providerMetadata?.isTruncated || false,
        finishReason: providerMetadata?.finishReason || "unknown",
      });
    }

    // Action: chat - Sohbet mesajı
    if (action === "chat") {
      if (!prompt) {
        return NextResponse.json(
          { success: false, error: "Message is required" },
          { status: 400 }
        );
      }

      // Model bilgisini Firestore'dan al
      let modelData = null;
      let provider = null;
      let apiModelId = null;

      if (modelId) {
        modelData = await getModel(modelId);
        if (modelData) {
          provider = getProvider(modelData.provider);
          apiModelId = modelData.apiId;
        }
      }

      if (!provider || !apiModelId) {
        provider = getProvider("gemini");
        apiModelId = "gemini-2.5-flash";
      }

      const result = await provider.chat(prompt, {
        systemPrompt: options.systemPrompt,
        maxTokens: options.maxTokens || 2048,
        apiId: apiModelId,
        model: apiModelId,
        ...options,
      });

      return NextResponse.json({
        success: true,
        content: result,
        model: modelId,
        apiModel: apiModelId,
        provider: provider.id,
      });
    }

    // Action: improve - İçerik iyileştir
    if (action === "improve") {
      if (!prompt) {
        return NextResponse.json(
          { success: false, error: "Content is required" },
          { status: 400 }
        );
      }

      // Model bilgisini Firestore'dan al
      let modelData = null;
      let provider = null;
      let apiModelId = null;

      if (modelId) {
        modelData = await getModel(modelId);
        if (modelData) {
          provider = getProvider(modelData.provider);
          apiModelId = modelData.apiId;
        }
      }

      if (!provider || !apiModelId) {
        provider = getProvider("gemini");
        apiModelId = "gemini-2.5-flash";
      }

      // İyileştirme prompt'u
      const improvementPrompt = options.improvementPrompt || `
Aşağıdaki blog içeriğini geliştir ve iyileştir:
- Daha akıcı ve okunabilir yap
- SEO optimizasyonu ekle
- Daha fazla detay ve örnek ekle
- Profesyonel bir ton kullan

İçerik:
${prompt}
`;

      const result = await provider.generateContent(improvementPrompt, {
        systemPrompt: options.systemPrompt || "Sen profesyonel bir içerik editörü ve SEO uzmanısın.",
        maxTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        apiId: apiModelId,
        model: apiModelId,
      });

      return NextResponse.json({
        success: true,
        content: result,
        model: modelId,
        apiModel: apiModelId,
        provider: provider.id,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("AI Generation Error:", error);
    
    // Parse error for user-friendly messages
    const errorInfo = parseAIError(error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorInfo.message,
        errorCode: errorInfo.code,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable,
        retryAfter: errorInfo.retryAfter,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: errorInfo.httpStatus }
    );
  }
}

/**
 * AI Error Parser - Kullanıcı dostu hata mesajları üretir
 */
function parseAIError(error) {
  const errorMessage = error.message || "";
  const errorString = JSON.stringify(error);
  
  // 503 - Service Unavailable / Model Overloaded
  if (errorMessage.includes("503") || errorMessage.includes("overloaded") || errorMessage.includes("UNAVAILABLE")) {
    return {
      code: "MODEL_OVERLOADED",
      type: "temporary",
      message: "AI modeli şu anda yoğun. Lütfen birkaç saniye bekleyip tekrar deneyin.",
      retryable: true,
      retryAfter: 5,
      httpStatus: 503,
    };
  }
  
  // 429 - Rate Limit Exceeded
  if (errorMessage.includes("429") || errorMessage.includes("rate") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    return {
      code: "RATE_LIMITED",
      type: "temporary",
      message: "Çok fazla istek gönderildi. Lütfen bir dakika bekleyip tekrar deneyin.",
      retryable: true,
      retryAfter: 60,
      httpStatus: 429,
    };
  }
  
  // 401/403 - Authentication/Authorization
  if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("UNAUTHENTICATED")) {
    return {
      code: "AUTH_ERROR",
      type: "configuration",
      message: "AI servisi yapılandırma hatası. Lütfen yöneticiyle iletişime geçin.",
      retryable: false,
      httpStatus: 500,
    };
  }
  
  // 400 - Bad Request / Invalid Input
  if (errorMessage.includes("400") || errorMessage.includes("INVALID_ARGUMENT") || errorMessage.includes("invalid")) {
    return {
      code: "INVALID_INPUT",
      type: "client",
      message: "Geçersiz istek. Lütfen girdiğiniz verileri kontrol edin.",
      retryable: false,
      httpStatus: 400,
    };
  }
  
  // Content Safety / Blocked
  if (errorMessage.includes("safety") || errorMessage.includes("blocked") || errorMessage.includes("SAFETY")) {
    return {
      code: "CONTENT_BLOCKED",
      type: "content",
      message: "İçerik güvenlik filtresine takıldı. Lütfen farklı bir şekilde ifade etmeyi deneyin.",
      retryable: false,
      httpStatus: 400,
    };
  }
  
  // Timeout
  if (errorMessage.includes("timeout") || errorMessage.includes("DEADLINE_EXCEEDED")) {
    return {
      code: "TIMEOUT",
      type: "temporary",
      message: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
      retryable: true,
      retryAfter: 3,
      httpStatus: 504,
    };
  }
  
  // Network Error
  if (errorMessage.includes("network") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("fetch")) {
    return {
      code: "NETWORK_ERROR",
      type: "temporary",
      message: "AI servisine bağlanılamadı. İnternet bağlantınızı kontrol edin.",
      retryable: true,
      retryAfter: 5,
      httpStatus: 503,
    };
  }
  
  // Default - Unknown Error
  return {
    code: "UNKNOWN_ERROR",
    type: "unknown",
    message: errorMessage || "AI işlemi başarısız oldu. Lütfen tekrar deneyin.",
    retryable: true,
    retryAfter: 3,
    httpStatus: 500,
  };
}
