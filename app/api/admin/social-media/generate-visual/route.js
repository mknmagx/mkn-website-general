/**
 * 🎨 Content Studio - Visual Generation API
 * 
 * Unified AI System ile entegre - Firestore'dan dinamik config
 * Gemini ile görsel üretimi
 */

import { NextResponse } from "next/server";
import { GeminiService, GEMINI_CHAT_MODELS } from "@/lib/gemini";
import { adminDb } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";
import {
  getGeneratedContentByIdAdmin,
  addAiImageSuggestionAdmin,
} from "@/lib/services/social-media-service-admin";
import { getChatMessagesAdmin } from "@/lib/services/gemini-chat-service-admin";
import { AI_CONTEXTS } from "@/lib/ai-constants";

// ═══════════════════════════════════════════════════════════════
// 🔧 FIRESTORE HELPERS (generate-content ile aynı pattern)
// ═══════════════════════════════════════════════════════════════

async function getConfiguration(contextKey) {
  try {
    const configDoc = await adminDb
      .collection("ai_configurations")
      .doc(contextKey)
      .get();
    if (!configDoc.exists) return null;
    return { id: configDoc.id, ...configDoc.data() };
  } catch (error) {
    console.error("Error fetching AI configuration:", error);
    return null;
  }
}

async function getModel(modelId) {
  try {
    const modelDoc = await adminDb.collection("ai_models").doc(modelId).get();
    if (!modelDoc.exists) return null;
    return { id: modelDoc.id, ...modelDoc.data() };
  } catch (error) {
    console.error("Error fetching AI model:", error);
    return null;
  }
}

async function getPrompt(promptKey) {
  try {
    const promptDoc = await adminDb.collection("ai_prompts").doc(promptKey).get();
    if (!promptDoc.exists) return null;
    return { id: promptDoc.id, ...promptDoc.data() };
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 📤 STORAGE HELPER
// ═══════════════════════════════════════════════════════════════

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
    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
  } catch (error) {
    console.error("❌ Failed to upload image to storage:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// 🎨 MAIN API HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(request) {
  try {
    const {
      chatId,
      message,
      contentId,
      settings = {},
      modelId,
      // Unified AI parametreleri
      temperature,
      maxTokens,
    } = await request.json();

    if (!chatId || !message || !contentId) {
      return NextResponse.json(
        { error: "Missing required fields: chatId, message, contentId" },
        { status: 400 }
      );
    }

    // 1. Firestore'dan config al
    const config = await getConfiguration(AI_CONTEXTS.CONTENT_VISUAL_GENERATION);
    
    if (!config) {
      return NextResponse.json(
        { error: `AI configuration not found: ${AI_CONTEXTS.CONTENT_VISUAL_GENERATION}` },
        { status: 500 }
      );
    }

    // 2. Prompt'u al
    let promptData = null;
    if (config.promptKey) {
      promptData = await getPrompt(config.promptKey);
    }

    // 3. Model belirle
    const selectedModelId = modelId || config.defaultModelId;
    let modelData = await getModel(selectedModelId);
    
    // Fallback: Firestore'da yoksa GEMINI_CHAT_MODELS'den al
    if (!modelData) {
      const localModel = GEMINI_CHAT_MODELS.find(m => m.value === selectedModelId);
      if (localModel) {
        modelData = {
          id: localModel.value,
          apiId: localModel.value,
          apiModelId: localModel.value,
          name: localModel.label,
          displayName: localModel.label,
          provider: 'gemini',
        };
      }
    }
    
    if (!modelData) {
      return NextResponse.json(
        { error: `Model not found: ${selectedModelId}` },
        { status: 500 }
      );
    }

    // 4. Settings
    const configSettings = config.settings || {};
    const finalTemperature = temperature ?? settings.temperature ?? configSettings.temperature ?? 1.0;
    const finalMaxTokens = maxTokens ?? settings.maxTokens ?? configSettings.maxTokens ?? 2048;
    const imageSize = settings.imageSize || configSettings.imageSize || "2K";

    console.log(`✅ Config loaded: ${config.id}, Model: ${modelData.displayName || modelData.name}, Prompt: ${promptData?.name || 'N/A'}`);

    // 5. Content data al
    const contentData = await getGeneratedContentByIdAdmin(contentId);
    if (!contentData) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const content = contentData.content || {};
    const platform = contentData.platform || "";
    const contentType = contentData.contentType || "";
    const title = contentData.title || "";

    // 6. Platform bazlı aspect ratio
    const platformLower = platform.toLowerCase();
    let aspectRatio = settings.aspectRatio || configSettings.aspectRatio || "1:1";
    if (platformLower.includes("instagram") && contentType === "story") {
      aspectRatio = "9:16";
    } else if (platformLower.includes("facebook") || platformLower.includes("linkedin")) {
      aspectRatio = "16:9";
    }

    // 7. System prompt hazırla
    let systemPrompt = "";
    if (promptData) {
      systemPrompt = promptData.systemPrompt || promptData.content || "";
      
      // Değişkenleri uygula
      const variables = {
        message,
        title,
        platform,
        contentType,
        hook: content.hook || "",
        fullCaption: (content.fullCaption || "").substring(0, 600),
        visualStyle: settings.visualStyle || "auto",
        textOverlay: settings.textOverlay || "minimal",
        colorScheme: settings.colorScheme || "brand",
        mood: settings.mood || "professional",
        aspectRatio,
        imageSize,
      };

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}|\\$\\{${key}\\}`, 'gi');
        systemPrompt = systemPrompt.replace(regex, value || "");
      });
    }

    if (!systemPrompt) {
      return NextResponse.json(
        { error: `Prompt not configured: ${config.promptKey}` },
        { status: 500 }
      );
    }

    // 8. Chat history al
    let history = [];
    try {
      const messages = await getChatMessagesAdmin(chatId);
      history = messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content || "",
          imageUrls: msg.role === "user" && msg.imageUrls
            ? msg.imageUrls.filter((url) => url?.startsWith("data:image/"))
            : [],
        }))
        .filter((msg) => msg.content.trim().length > 0);

      // Son mesaj duplicate ise kaldır
      if (history.length > 0 && history[history.length - 1].content === message) {
        history = history.slice(0, -1);
      }
    } catch (error) {
      console.warn("⚠️ Could not load chat history:", error);
    }

    // 9. Gemini API call
    const apiModelId = modelData.apiId || modelData.apiModelId || selectedModelId;
    const modelDisplayName = modelData.displayName || modelData.name || selectedModelId;

    // Log
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║           🎨 CONTENT VISUAL GENERATION                     ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log(`║ Model: ${apiModelId}`);
    console.log(`║ Temperature: ${finalTemperature} | Max Tokens: ${finalMaxTokens}`);
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║ 📝 SYSTEM PROMPT:");
    console.log(systemPrompt.substring(0, 500) + (systemPrompt.length > 500 ? "..." : ""));
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║ 👤 USER MESSAGE:");
    console.log(message);
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    const imageSettings = {
      responseModalities: ["IMAGE", "TEXT"],
      aspectRatio,
      numberOfImages: 1,
      imageSize,
    };

    const startTime = Date.now();
    const geminiService = new GeminiService();
    
    const result = await geminiService.sendMessageWithHistory(
      history,
      message,
      [],
      systemPrompt,
      finalMaxTokens,
      apiModelId,
      finalTemperature,
      false,
      {},
      imageSettings
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // 10. Upload & Response
    let response = result.text || "";
    let generatedImageUrls = [];

    if (result.generatedImages?.length > 0) {
      console.log(`🎨 Uploading ${result.generatedImages.length} images...`);
      
      const uploadPromises = result.generatedImages.map((img) =>
        uploadGeneratedImageToStorage(img.data, chatId, modelDisplayName)
      );
      generatedImageUrls = await Promise.all(uploadPromises);
      
      console.log(`✅ Images uploaded:`, generatedImageUrls);
      
      if (!response) {
        response = `Görsel oluşturuldu: ${title}`;
      }

      // Content'e kaydet
      for (const imageUrl of generatedImageUrls) {
        await addAiImageSuggestionAdmin(contentId, imageUrl);
      }
    }

    if (!response) {
      response = result.hasInlineData
        ? `${title} için görsel oluşturuldu`
        : "[Yanıt alındı]";
    }

    console.log(`✅ Image generation complete: ${generatedImageUrls.length} images in ${duration}s`);

    return NextResponse.json({
      success: true,
      response,
      generatedImageUrls,
      contentTitle: title,
      contentId,
      platform,
      contentType,
      // AI Metadata (generate-content ile aynı format)
      aiMetadata: {
        model: {
          id: modelData.id,
          apiId: apiModelId,
          name: modelDisplayName,
          provider: modelData.provider || 'gemini',
        },
        prompt: promptData ? {
          key: promptData.id,
          name: promptData.name,
          version: promptData.version,
        } : { source: "not_configured" },
        settings: {
          temperature: finalTemperature,
          maxTokens: finalMaxTokens,
          aspectRatio,
          imageSize,
        },
        performance: {
          duration: `${duration}s`,
          timestamp: new Date().toISOString(),
        },
      },
      // Legacy fields
      model: apiModelId,
      modelDisplayName,
      provider: modelData.provider || 'gemini',
      appliedSettings: {
        visualStyle: settings.visualStyle || "auto",
        aspectRatio,
        imageSize,
      },
    });
  } catch (error) {
    console.error("Visual generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
