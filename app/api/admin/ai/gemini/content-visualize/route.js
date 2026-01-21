import { NextResponse } from "next/server";
import { GeminiService, GEMINI_CHAT_MODELS } from "@/lib/gemini";
import {
  getGeneratedContentByIdAdmin,
  addAiImageSuggestionAdmin,
} from "@/lib/services/social-media-service-admin";
import { getChatMessagesAdmin } from "@/lib/services/gemini-chat-service-admin";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import "@/lib/firebase-admin"; // Initialize admin SDK
import { AI_CONTEXTS, AI_COLLECTIONS } from "@/lib/ai-constants";

/**
 * Admin SDK ile AI konfigürasyonunu getir
 */
async function getAIConfigurationAdmin(contextId) {
  try {
    const db = getFirestore();
    
    // 1. Context konfigürasyonunu al
    const contextDoc = await db.collection(AI_COLLECTIONS.CONTEXTS).doc(contextId).get();
    
    if (!contextDoc.exists) {
      console.error(`❌ Context not found: ${contextId}`);
      return null;
    }
    
    const contextData = contextDoc.data();
    
    return {
      contextId: contextId,
      ...contextData,
    };
  } catch (error) {
    console.error("Error getting AI configuration (admin):", error);
    return null;
  }
}

/**
 * Admin SDK ile prompt getir
 */
async function getPromptAdmin(promptKey) {
  try {
    const db = getFirestore();
    const promptDoc = await db.collection(AI_COLLECTIONS.PROMPTS).doc(promptKey).get();
    
    if (!promptDoc.exists) {
      console.error(`❌ Prompt not found: ${promptKey}`);
      return null;
    }
    
    return promptDoc.data();
  } catch (error) {
    console.error("Error getting prompt (admin):", error);
    return null;
  }
}

/**
 * Admin SDK ile model getir
 */
async function getModelAdmin(modelId) {
  try {
    const db = getFirestore();
    const modelDoc = await db.collection(AI_COLLECTIONS.MODELS).doc(modelId).get();
    
    if (!modelDoc.exists) {
      console.error(`❌ Model not found in Firestore: ${modelId}`);
      return null;
    }
    
    return {
      id: modelId,
      ...modelDoc.data(),
    };
  } catch (error) {
    console.error("Error getting model (admin):", error);
    return null;
  }
}

/**
 * Upload base64 image to Firebase Storage
 */
async function uploadGeneratedImageToStorage(base64Data, chatId, modelName) {
  try {
    const bucket = getStorage().bucket();
    const timestamp = Date.now();
    const filename = `gemini-generated/${chatId}/${timestamp}.png`;

    const imageBuffer = Buffer.from(base64Data, "base64");
    const file = bucket.file(filename);

    await file.save(imageBuffer, {
      metadata: {
        contentType: "image/png",
        metadata: {
          generatedBy: modelName,
          chatId: chatId,
          timestamp: timestamp.toString(),
        },
      },
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    console.log(`✅ Image uploaded to storage: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("❌ Failed to upload image to storage:", error);
    throw error;
  }
}

export async function POST(req) {
  try {
    const geminiService = new GeminiService();
    const { chatId, message, contentId, settings = {}, modelId } = await req.json();

    if (!chatId || !message || !contentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 UNIFIED AI CONFIGURATION - Admin SDK ile Firestore'dan yükle
    // ═══════════════════════════════════════════════════════════════
    const aiConfig = await getAIConfigurationAdmin(AI_CONTEXTS.CONTENT_VISUAL_GENERATION);
    
    if (!aiConfig) {
      return NextResponse.json(
        { error: "AI configuration not found. Please configure content_visual_generation context in Firestore." },
        { status: 500 }
      );
    }

    // Prompt'u Firestore'dan yükle (Admin SDK)
    let firestorePrompt = null;
    if (aiConfig.promptKey) {
      firestorePrompt = await getPromptAdmin(aiConfig.promptKey);
    }

    // Model bilgisini al - önce request'ten gelen modelId, yoksa config'den default
    const selectedModelId = modelId || aiConfig.defaultModelId;
    let modelInfo = await getModelAdmin(selectedModelId);
    
    // Fallback: Firestore'dan model bulunamazsa, GEMINI_CHAT_MODELS'den kontrol et
    if (!modelInfo) {
      console.warn(`⚠️ Model not found in Firestore: ${selectedModelId}, checking GEMINI_CHAT_MODELS...`);
      const localModel = GEMINI_CHAT_MODELS.find(m => m.value === selectedModelId);
      if (localModel) {
        modelInfo = {
          id: localModel.value,
          apiModelId: localModel.value,
          name: localModel.label,
          displayName: localModel.label,
          provider: 'gemini',
          supportsImageGen: localModel.supportsImageGen || false,
        };
        console.log(`✅ Found model in GEMINI_CHAT_MODELS:`, modelInfo);
      }
    }
    
    if (!modelInfo) {
      return NextResponse.json(
        { error: `Model not found: ${selectedModelId}. Please configure models in Firestore or use a valid Gemini model.` },
        { status: 500 }
      );
    }

    // Config'den ayarları al
    const configSettings = aiConfig.settings || {};
    const temperature = settings.temperature || configSettings.temperature || 1.0;
    const imageSize = settings.imageSize || configSettings.imageSize || "2K";
    const aspectRatio = settings.aspectRatio || configSettings.aspectRatio || "1:1";

    console.log("✅ AI Configuration loaded from Firestore:", { 
      contextId: aiConfig.contextId,
      modelId: selectedModelId,
      modelName: modelInfo.name || modelInfo.displayName,
      apiModelId: modelInfo.apiModelId,
      promptKey: aiConfig.promptKey,
      hasPrompt: !!firestorePrompt,
      temperature,
      imageSize,
      aspectRatio
    });

    // Fetch content details from social-media-content collection
    let contentData;
    try {
      contentData = await getGeneratedContentByIdAdmin(contentId);

      if (!contentData) {
        return NextResponse.json(
          { error: "Content not found" },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      return NextResponse.json(
        { error: "Failed to fetch content", details: error.message },
        { status: 500 }
      );
    }

    // Extract content details (handle nested content object)
    const content = contentData.content || {};
    const platform = contentData.platform || "";
    const contentType = contentData.contentType || "";
    const title = contentData.title || "";
    const datasetName = contentData.datasetName || "";
    const customization = contentData.customization || {};

    // Extract detailed content information
    const hook = content.hook || "";
    const fullCaption = content.fullCaption || "";
    const engagementStrategy = content.engagementStrategy || "";
    const imageUrl = contentData.image?.url || "";

    // Extract AI-generated visual suggestions (if available)
    const visualSuggestions = content.visualSuggestions || {};
    const hashtagStrategy = content.hashtagStrategy || {};
    const performanceOptimization = content.performanceOptimization || {};

    // Extract customization context
    const tone = customization.tone || "";
    const focusAngle = customization.focusAngle || "";
    const additionalContext = customization.additionalContext || "";

    // ═══════════════════════════════════════════════════════════════
    // 🎨 VISUAL GENERATION - Firestore Prompt Kullan
    // ═══════════════════════════════════════════════════════════════

    // Extract visual preferences from settings
    const visualStyle = settings.visualStyle || "auto";
    const textOverlay = settings.textOverlay || "minimal";
    const colorScheme = settings.colorScheme || "brand";
    const composition = settings.composition || "balanced";
    const mood = settings.mood || "professional";

    // Platform aspect ratio belirleme
    const platformLower = platform.toLowerCase();
    let defaultAspectRatio = aspectRatio;
    if (platformLower.includes("instagram")) {
      defaultAspectRatio = contentType === "story" ? "9:16" : "1:1";
    } else if (platformLower.includes("facebook") || platformLower.includes("linkedin")) {
      defaultAspectRatio = "16:9";
    }
    const finalAspectRatio = settings.aspectRatio || defaultAspectRatio;

    // Firestore'dan gelen system prompt'u kullan
    let systemPromptContent = "";
    if (firestorePrompt) {
      systemPromptContent = typeof firestorePrompt === "string" 
        ? firestorePrompt 
        : firestorePrompt.systemPrompt || firestorePrompt.content || "";
    }

    // Prompt değişkenlerini uygula
    const promptVariables = {
      message,
      title,
      platform,
      contentType,
      datasetName,
      hook,
      fullCaption: fullCaption?.substring(0, 600) || "",
      engagementStrategy,
      visualSuggestions: visualSuggestions.primary || "",
      hashtags: hashtagStrategy.hashtags?.join(" ") || "",
      saveWorthiness: performanceOptimization.saveWorthiness || "",
      tone,
      focusAngle,
      additionalContext,
      visualStyle,
      textOverlay,
      colorScheme,
      composition,
      mood,
      aspectRatio: finalAspectRatio,
      imageSize,
    };

    // Firestore prompt varsa kullan, yoksa basit bir prompt oluştur
    let systemPromptForAI;
    let userMessage;
    if (systemPromptContent) {
      // Firestore prompt'undaki değişkenleri değiştir
      systemPromptForAI = systemPromptContent;
      Object.entries(promptVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}|\\$\\{${key}\\}`, 'gi');
        systemPromptForAI = systemPromptForAI.replace(regex, value || "");
      });
      // Kullanıcı mesajı ayrı
      userMessage = message;
    } else {
      // Firestore prompt yoksa hata döndür
      return NextResponse.json(
        { error: "Visual generation prompt not configured. Please add prompt with key: " + aiConfig.promptKey },
        { status: 500 }
      );
    }

    console.log(`🎨 Generating image for content: ${title}`);
    console.log(`📝 Platform: ${platform}, Type: ${contentType}`);
    console.log(`🤖 Using model: ${modelInfo.apiModelId || selectedModelId}`);

    // Get chat history for context
    let history = [];
    try {
      const messages = await getChatMessagesAdmin(chatId);
      history = messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content || "",
          imageUrls:
            msg.role === "user" && msg.imageUrls
              ? msg.imageUrls.filter((url) => url?.startsWith("data:image/"))
              : [],
        }))
        .filter((msg) => msg.content.trim().length > 0);

      // Remove last message if duplicate
      if (history.length > 0) {
        const lastMsg = history[history.length - 1];
        if (lastMsg.role === "user" && lastMsg.content === message) {
          history = history.slice(0, -1);
        }
      }

      console.log(`📚 Chat history: ${history.length} messages`);
    } catch (error) {
      console.warn("⚠️ Could not load chat history:", error);
    }

    // Image generation settings from Firestore config
    const imageSettings = {
      responseModalities: ["IMAGE", "TEXT"],
      aspectRatio: finalAspectRatio,
      numberOfImages: 1,
      imageSize: imageSize,
    };

    console.log(`🎨 Image settings:`, imageSettings);

    // Firestore'dan gelen model API ID'sini kullan
    const apiModelId = modelInfo.apiModelId || selectedModelId;
    const modelDisplayName = modelInfo.displayName || modelInfo.name || selectedModelId;
    
    // Max tokens - settings'ten gelen varsa onu kullan, yoksa config'den
    const maxTokens = settings.maxTokens || configSettings.maxTokens || 2048;

    // ═══════════════════════════════════════════════════════════════
    // 📋 AI STUDIO LOG FORMAT - System & User Prompt Ayrımı
    // ═══════════════════════════════════════════════════════════════
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║           🎨 CONTENT VISUAL GENERATION REQUEST             ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log(`║ Model: ${apiModelId}`);
    console.log(`║ Provider: ${modelInfo.provider || 'gemini'}`);
    console.log(`║ Temperature: ${temperature}`);
    console.log(`║ Max Tokens: ${maxTokens}`);
    console.log(`║ Context: ${AI_CONTEXTS.CONTENT_VISUAL_GENERATION}`);
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║                    📝 SYSTEM PROMPT                        ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log(systemPromptForAI.substring(0, 1000) + (systemPromptForAI.length > 1000 ? "..." : ""));
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║                    👤 USER MESSAGE                         ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log(userMessage);
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log(`║ Chat History: ${history.length} messages`);
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    // Call Gemini for image generation with Firestore config
    const result = await geminiService.sendMessageWithHistory(
      history,
      userMessage, // user message ayrı
      [], // no input images
      systemPromptForAI, // system prompt ayrı olarak gönder
      maxTokens, // max tokens from settings or config
      apiModelId, // model from Firestore
      temperature, // temperature from config
      false, // no web search for image gen
      {}, // no reasoning options
      imageSettings // image generation settings
    );

    console.log(`📦 Result analysis:`, {
      hasText: !!result.text,
      textLength: result.text?.length || 0,
      hasInlineData: result.hasInlineData,
      generatedImages: result.generatedImages?.length || 0,
    });

    let response = result.text || "";
    let generatedImageUrls = [];

    // Upload generated images to Firebase Storage
    if (result.generatedImages && result.generatedImages.length > 0) {
      console.log(
        `🎨 Processing ${result.generatedImages.length} generated images...`
      );

      try {
        const uploadPromises = result.generatedImages.map(async (img, idx) => {
          console.log(`📤 Uploading image ${idx + 1}...`);
          const url = await uploadGeneratedImageToStorage(img.data, chatId, modelDisplayName);
          return url;
        });

        generatedImageUrls = await Promise.all(uploadPromises);
        console.log(`✅ All images uploaded:`, generatedImageUrls);

        if (!response || response.trim() === "") {
          response = `Görsel oluşturuldu: ${title}`;
        }
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        response = response || "[Görsel oluşturuldu ancak yüklenemedi]";
      }
    }

    // Fallback if no text response
    if (!response || response.trim() === "") {
      response = result.hasInlineData
        ? `${title} için görsel oluşturuldu`
        : "[Yanıt alındı ancak içerik okunamadı]";
    }

    console.log(
      `✅ Image generation complete: ${generatedImageUrls.length} images`
    );

    // Save AI image suggestions to content document
    if (generatedImageUrls.length > 0) {
      try {
        for (const imageUrl of generatedImageUrls) {
          await addAiImageSuggestionAdmin(contentId, imageUrl);
        }
        console.log(`✅ AI image suggestions saved to content ${contentId}`);
      } catch (saveError) {
        console.error("⚠️ Failed to save AI image suggestions:", saveError);
        // Don't fail the request, just log the error
      }
    }

    // Response with Firestore config values
    return NextResponse.json({
      success: true,
      response: response,
      generatedImageUrls,
      contentTitle: title,
      contentId: contentId,
      platform: platform,
      contentType: contentType,
      // AI Metadata from Firestore
      model: apiModelId,
      modelDisplayName: modelDisplayName,
      provider: modelInfo.provider,
      aiConfig: {
        contextId: aiConfig.contextId,
        promptKey: aiConfig.promptKey,
        temperature: temperature,
        maxTokens: maxTokens,
      },
      appliedSettings: {
        visualStyle: visualStyle,
        textOverlay: textOverlay,
        colorScheme: colorScheme,
        composition: composition,
        mood: mood,
        aspectRatio: finalAspectRatio,
        imageSize: imageSize,
      },
    });
  } catch (error) {
    console.error("Content Visualize API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
