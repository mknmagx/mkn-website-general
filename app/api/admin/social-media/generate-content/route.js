/**
 * 📱 Content Studio - Social Media Content Generation API
 * 
 * Unified AI System ile entegre - Firestore'dan dinamik config
 * Multi-provider desteği (Claude, GPT, Gemini)
 */

import { NextResponse } from "next/server";
import { getProvider } from "@/lib/services/ai-provider-registry";
import { adminDb } from "@/lib/firebase-admin";
import { getContentGenerationPrompt } from "@/lib/ai-prompts/social-media-prompts";

// Context key for content studio
const CONTENT_STUDIO_CONTEXT = "content_studio_generation";

// Firestore helpers
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

export async function POST(request) {
  try {
    const { 
      title, 
      platform, 
      contentType, 
      aiModel, 
      options = {},
      // Yeni: Unified AI parametreleri
      temperature,
      maxTokens,
      useFirestorePrompt = true, // Default: Firestore'dan prompt kullan
    } = await request.json();

    if (!title || !platform || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Firestore'dan config al
    const config = await getConfiguration(CONTENT_STUDIO_CONTEXT);
    
    // 2. Platform+ContentType bazlı prompt key oluştur
    const platformContentKey = `${platform.toLowerCase()}_${contentType.toLowerCase()}`;
    
    // 3. Firestore'dan platform-specific prompt al
    let firestorePromptData = null;
    let systemPrompt = null;
    let userPromptTemplate = null;
    
    if (useFirestorePrompt && config?.platformPrompts?.[platformContentKey]) {
      const promptKey = config.platformPrompts[platformContentKey];
      firestorePromptData = await getPrompt(promptKey);
      
      if (firestorePromptData) {
        systemPrompt = firestorePromptData.systemPrompt;
        userPromptTemplate = firestorePromptData.userPromptTemplate || firestorePromptData.content;
      }
    }
    
    // 4. User prompt'u oluştur - TÜM değişkenleri replace et
    const buildUserPrompt = (template, data) => {
      if (!template) return null;
      
      // Tüm olası değişkenleri replace et
      const replacements = {
        title: data.title || "",
        platform: data.platform || "",
        contentType: data.contentType || "",
        categoryContext: data.categoryContext || data.options?.focusAngle || "Genel kozmetik ve cilt bakımı",
        tone: data.options?.tone || "profesyonel ve bilgilendirici",
        customCTA: data.options?.customCTA || "",
        focusAngle: data.options?.focusAngle || "",
        additionalContext: data.options?.additionalContext || "",
        targetHashtags: Array.isArray(data.options?.targetHashtags) 
          ? data.options.targetHashtags.join(", ") 
          : (data.options?.targetHashtags || ""),
        length: data.options?.length || "medium",
        includeEmoji: data.options?.includeEmoji !== false ? "Evet, uygun emojiler kullan" : "Hayır, emoji kullanma",
      };
      
      let result = template;
      Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      });
      
      // Eğer customization varsa, prompt'a ek bilgiler ekle
      if (data.options?.tone || data.options?.customCTA || data.options?.focusAngle || data.options?.additionalContext) {
        const extras = [];
        if (data.options.tone) extras.push(`Ton: ${data.options.tone}`);
        if (data.options.focusAngle) extras.push(`Odak: ${data.options.focusAngle}`);
        if (data.options.customCTA) extras.push(`CTA: ${data.options.customCTA}`);
        if (data.options.additionalContext) extras.push(`Ek Bağlam: ${data.options.additionalContext}`);
        if (data.options.targetHashtags?.length) {
          const hashtags = Array.isArray(data.options.targetHashtags) 
            ? data.options.targetHashtags.join(", ") 
            : data.options.targetHashtags;
          extras.push(`Hedef Hashtagler: ${hashtags}`);
        }
        
        if (extras.length > 0) {
          result += `\n\n--- Özelleştirme ---\n${extras.join("\n")}`;
        }
      }
      
      return result;
    };
    
    const userPrompt = userPromptTemplate 
      ? buildUserPrompt(userPromptTemplate, { title, platform, contentType, options, categoryContext: options.focusAngle })
      : getContentGenerationPrompt(title, platform, contentType, options);
    
    // 5. Model belirle
    let modelData = null;
    let provider = null;
    let apiModelId = null;
    
    if (aiModel) {
      modelData = await getModel(aiModel);
      if (modelData) {
        provider = getProvider(modelData.provider);
        apiModelId = modelData.apiId;
      }
    }
    
    // Config'den default model
    if (!modelData && config?.defaultModelId) {
      modelData = await getModel(config.defaultModelId);
      if (modelData) {
        provider = getProvider(modelData.provider);
        apiModelId = modelData.apiId;
      }
    }
    
    // Fallback: Gemini
    if (!provider || !apiModelId) {
      provider = getProvider("gemini");
      apiModelId = "gemini-2.5-flash";
    }

    // 6. Settings
    const finalTemperature = temperature ?? config?.settings?.temperature ?? 0.7;
    const finalMaxTokens = maxTokens ?? config?.settings?.maxTokens ?? 16384;
    
    // 7. AI'dan içerik üret
    const startTime = Date.now();
    
    const response = await provider.generateContent(userPrompt, {
      systemPrompt: systemPrompt || "Sen MKN Group'un profesyonel sosyal medya içerik yazarısın. Türkçe olarak yaratıcı ve etkileyici içerikler oluşturuyorsun.",
      maxTokens: finalMaxTokens,
      temperature: finalTemperature,
      apiId: apiModelId,
      model: apiModelId,
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // 8. Response'u parse et
    // Provider response formatları:
    // - Gemini: { text: string, metadata: object, ... }
    // - Claude: { content: string, metadata: object }
    // - OpenAI: { content: string, metadata: object }
    // - Or plain string if returnMetadata=false
    let content;
    let parseWarning = null;
    
    // Extract text from response - handle all provider formats
    const extractTextFromResponse = (res) => {
      // If already a string, return directly
      if (typeof res === 'string') {
        return res;
      }
      
      // If null or undefined
      if (!res) {
        console.error('❌ Response is null or undefined');
        return '';
      }
      
      // Gemini format: { text: string, ... }
      if (typeof res.text === 'string') {
        return res.text;
      }
      
      // Claude/OpenAI format: { content: string, ... }
      if (typeof res.content === 'string') {
        return res.content;
      }
      
      // If response has candidates array (raw Gemini API response - shouldn't happen but safety check)
      if (res.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.candidates[0].content.parts[0].text;
      }
      
      // If response has choices array (raw OpenAI API response - shouldn't happen but safety check)
      if (res.choices?.[0]?.message?.content) {
        return res.choices[0].message.content;
      }
      
      // Last resort: try to stringify (but log warning)
      console.warn('⚠️ Unknown response format, attempting JSON stringify:', typeof res, Object.keys(res || {}));
      return JSON.stringify(res);
    };
    
    let responseText = extractTextFromResponse(response);
    
    try {
      let cleanedText = responseText.trim();
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
      cleanedText = cleanedText.replace(/\s*```\s*$/, "");
      cleanedText = cleanedText.trim();

      // Try to find complete JSON first
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          content = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          // JSON might be truncated due to MAX_TOKENS
          console.warn("⚠️ JSON truncated, attempting partial recovery...");
          parseWarning = "Response truncated by MAX_TOKENS limit";
          
          // Try to recover partial JSON by closing brackets
          let partialJson = jsonMatch[0];
          const openBraces = (partialJson.match(/\{/g) || []).length;
          const closeBraces = (partialJson.match(/\}/g) || []).length;
          const openBrackets = (partialJson.match(/\[/g) || []).length;
          const closeBrackets = (partialJson.match(/\]/g) || []).length;
          
          // Add missing closing quotes if in string
          if (partialJson.match(/"[^"]*$/)) {
            partialJson += '"';
          }
          
          // Add missing closing brackets/braces
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            partialJson += ']';
          }
          for (let i = 0; i < openBraces - closeBraces; i++) {
            partialJson += '}';
          }
          
          try {
            content = JSON.parse(partialJson);
          } catch (recoveryError) {
            throw innerError; // Use original error
          }
        }
      } else {
        content = JSON.parse(cleanedText);
      }
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError);
      console.error("Response text:", responseText.substring(0, 200));

      // Fallback structure
      content = {
        caption: responseText.substring(0, 500),
        fullText: responseText,
        hashtags: [],
        cta: "Daha fazla bilgi için bizi takip edin!",
      };
    }

    return NextResponse.json({
      success: true,
      content: content,
      // Warning if response was truncated
      ...(parseWarning && { warning: parseWarning }),
      // AI Metadata
      aiMetadata: {
        model: {
          id: aiModel || config?.defaultModelId || "gemini_flash_25",
          apiId: apiModelId,
          name: modelData?.displayName || modelData?.name || apiModelId,
          provider: provider.id,
        },
        prompt: firestorePromptData ? {
          key: firestorePromptData.id,
          name: firestorePromptData.name,
          version: firestorePromptData.version,
        } : { source: "hardcoded" },
        settings: {
          temperature: finalTemperature,
          maxTokens: finalMaxTokens,
        },
        performance: {
          duration: `${duration}s`,
          timestamp: new Date().toISOString(),
        },
      },
      // Legacy fields for backward compatibility
      model: apiModelId,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content", details: error.message },
      { status: 500 }
    );
  }
}
