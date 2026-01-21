import { NextResponse } from "next/server";
import { GeminiService, DEFAULT_CHAT_MODEL } from "@/lib/gemini";
import { getChatMessagesAdmin } from "@/lib/services/gemini-chat-service-admin";
import { getStorage } from "firebase-admin/storage";
import admin from "@/lib/firebase-admin";

/**
 * Upload base64 image to Firebase Storage
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} chatId - Chat ID for organizing files
 * @returns {Promise<string>} - Public download URL
 */
async function uploadGeneratedImageToStorage(base64Data, chatId) {
  try {
    const bucket = getStorage().bucket();
    const timestamp = Date.now();
    const filename = `gemini-generated/${chatId}/${timestamp}.png`;
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64");
    
    // Create file reference
    const file = bucket.file(filename);
    
    // Upload with metadata
    await file.save(imageBuffer, {
      metadata: {
        contentType: "image/png",
        metadata: {
          generatedBy: "gemini",
          chatId: chatId,
          timestamp: timestamp.toString(),
        },
      },
    });
    
    // Make file public and get URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    
    console.log(`✅ Image uploaded to storage: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("❌ Failed to upload image to storage:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const geminiService = new GeminiService();
    const {
      chatId,
      message,
      images,
      model,
      settings,
      // ✅ New: Advanced options
      enableReasoning = false,
      thinkingMode = "standard",
      enableThinking = true,
    } = await request.json();

    if (!message && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: "Mesaj veya görsel gerekli" },
        { status: 400 }
      );
    }

    let response;
    let tokens = null;

    // Get chat history if chatId is provided
    let history = [];
    if (chatId) {
      try {
        const messages = await getChatMessagesAdmin(chatId);

        // Map messages to history format
        // ⚠️ CRITICAL: Properly handle images for Gemini API
        // 1. Assistant messages: NEVER include images (these are generated outputs)
        // 2. User messages: ONLY include base64 images (original user uploads)
        // 3. Storage URLs: NEVER send to Gemini (these break the API)
        history = messages.map((msg) => {
          let imageUrls = [];
          
          // Only process images for USER messages
          if (msg.role === 'user' && msg.imageUrls && Array.isArray(msg.imageUrls)) {
            // Filter to ONLY include base64 data URLs (user uploads)
            imageUrls = msg.imageUrls.filter(url => {
              if (!url || typeof url !== 'string') return false;
              // Must be data:image/... format with base64
              return url.startsWith('data:image/') && url.includes('base64');
            });
            
            if (imageUrls.length > 0) {
              console.log(`✅ Keeping ${imageUrls.length} base64 image(s) for user message`);
            }
          }
          // For assistant messages, imageUrls stays empty (no generated images in history)
          
          // 🛡️ Ensure content is a valid, non-empty string
          let cleanContent = "";
          if (msg.content && typeof msg.content === 'string') {
            cleanContent = msg.content.trim();
          }
          
          return {
            role: msg.role,
            content: cleanContent, // Trimmed, guaranteed string
            imageUrls: imageUrls, // Empty for assistant, filtered base64 for user
          };
        });

        // 🛡️ CRITICAL: Remove messages with empty or invalid content
        // Empty messages break Gemini API with "missing thought_signature" error
        const beforeFilterCount = history.length;
        history = history.filter((msg, idx) => {
          if (!msg.content || msg.content.trim() === "") {
            console.warn(`⚠️ Removing message ${idx} with empty content (role: ${msg.role})`);
            return false;
          }
          
          // Additional check: Ensure content has actual characters
          if (msg.content.length < 1) {
            console.warn(`⚠️ Removing message ${idx} with zero-length content (role: ${msg.role})`);
            return false;
          }
          
          return true;
        });
        
        if (beforeFilterCount !== history.length) {
          console.log(`🗑️ Removed ${beforeFilterCount - history.length} invalid messages from history`);
        }

        console.log(`📚 Chat history: ${history.length} messages loaded (after filtering)`);

        // IMPORTANT: Remove the last user message if it matches the current message
        // This prevents duplicate messages in history
        if (history.length > 0) {
          const lastMsg = history[history.length - 1];
          if (lastMsg.role === "user" && lastMsg.content === message) {
            console.log(`🗑️ Removing duplicate last message from history`);
            history = history.slice(0, -1);
          }
        }

        // ✅ HYBRID HISTORY LIMITING
        // Web search aktifse: 10 mesaj (güncel bilgi gelecek)
        // Web search kapalıysa: 30 mesaj (context önemli)
        const useWebSearch = settings?.enableWebSearch !== false; // Default: true for flash25
        const historyLimit = useWebSearch ? 10 : 30;
        
        if (history.length > historyLimit) {
          console.log(`✂️ Trimming history: ${history.length} → ${historyLimit} messages`);
          history = history.slice(-historyLimit);
        }

        // 🔍 Debug: Log final history structure with FULL details
        console.log(`📚 Chat history: ${history.length} messages loaded`);
        console.log(`📊 History breakdown:`, {
          total: history.length,
          userMessages: history.filter(m => m.role === 'user').length,
          assistantMessages: history.filter(m => m.role === 'assistant').length,
          messagesWithImages: history.filter(m => m.imageUrls?.length > 0).length,
        });
        
        // 🔍 DEBUG: Log each message in detail
        history.forEach((msg, idx) => {
          console.log(`\n📝 Message ${idx}:`, {
            role: msg.role,
            contentLength: msg.content?.length || 0,
            contentPreview: msg.content?.substring(0, 50) || '[EMPTY]',
            hasImages: msg.imageUrls?.length > 0,
            imageCount: msg.imageUrls?.length || 0,
            imageTypes: msg.imageUrls?.map(url => {
              if (!url) return 'null';
              if (url.startsWith('data:image')) return 'base64';
              if (url.startsWith('http')) return 'storage-url';
              return 'unknown';
            }),
          });
        });
      } catch (error) {
        console.error("❌ Chat history could not be loaded:", error);
        console.error("Error details:", error.message, error.stack);
      }
    } else {
      console.warn("⚠️ No chatId provided - history will be empty");
    }

    // Send message with history (with optional Google Search grounding)
    const useWebSearch = settings?.enableWebSearch !== false; // Default true for flash25
    console.log(`🌐 Web Search ${useWebSearch ? 'ENABLED' : 'DISABLED'}`);
    
    // ✅ Advanced options for Gemini 3 Pro & 2.5 Flash
    const advancedOptions = {
      enableReasoning, // Gemini 3 Pro: Deep reasoning
      thinkingMode, // Gemini 3 Pro: deep | standard | fast
      enableThinking, // Gemini 2.5 Flash: Thinking mode
    };

    console.log(`🧠 Advanced options:`, advancedOptions);
    
    const result = await geminiService.sendMessageWithHistory(
      history,
      message,
      images || [],
      null, // systemPrompt
      settings?.maxTokens || 2048,
      model || DEFAULT_CHAT_MODEL,
      settings?.temperature || 0.7,
      useWebSearch, // Enable/disable Google Search grounding
      advancedOptions, // Pass reasoning/thinking options
      settings // ⭐ Pass ALL settings (aspectRatio, imageSize, etc.)
    );

    // 🔍 DETAILED RESULT ANALYSIS
    console.log(`🔍 Gemini API Result Analysis:`, {
      hasText: !!result.text,
      textLength: result.text?.length || 0,
      hasInlineData: result.hasInlineData,
      generatedImages: result.generatedImages?.length || 0,
      contentParts: result.contentParts,
      textPreview: result.text?.substring(0, 100) || "[EMPTY]",
    });

    // Extract text and grounding metadata
    response = result.text;
    const groundingMetadata = result.groundingMetadata;

    // 🖼️ Handle generated images - Upload to Firebase Storage
    let generatedImageUrls = [];
    if (result.generatedImages && result.generatedImages.length > 0) {
      console.log(`🎨 Processing ${result.generatedImages.length} generated images...`);
      
      try {
        const uploadPromises = result.generatedImages.map(async (img, idx) => {
          console.log(`📤 Uploading image ${idx + 1}/${result.generatedImages.length}...`);
          const url = await uploadGeneratedImageToStorage(img.data, chatId);
          return url;
        });
        
        generatedImageUrls = await Promise.all(uploadPromises);
        console.log(`✅ All images uploaded successfully:`, generatedImageUrls);
        
        // If no text but has images, create a descriptive message
        if (!response || response.trim() === "") {
          response = `Görsel oluşturuldu (${generatedImageUrls.length} adet)`;
        }
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        // Continue with text response even if upload fails
        if (!response || response.trim() === "") {
          response = "[Görsel oluşturuldu ancak yüklenemedi]";
        }
      }
    }

    // ⚠️ Handle non-text responses (e.g., image generation with inlineData)
    if (!response || response.trim() === "") {
      console.warn("⚠️ Empty or undefined text response from Gemini");
      
      if (result.hasInlineData) {
        console.log("🖼️ Response contains inlineData (image generation)");
        console.log("there are non-text parts inlineData in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.");
        response = "[Görsel oluşturuldu - metin içeriği bulunamadı]"; // Fallback for image generation
      } else {
        console.error("❌ No text AND no inlineData - unexpected response format!");
        response = "[Yanıt alındı ancak içerik okunamadı]"; // Generic fallback
      }
      
      console.log(`📝 Using fallback response: "${response}"`);
    } else {
      console.log(`✅ Valid text response received: ${response.length} characters`);
    }

    // Try to count tokens
    try {
      tokens = await geminiService.countTokens(message, model);
    } catch (error) {
      console.warn("Token counting failed:", error);
    }

    return NextResponse.json({
      response: response,
      generatedImageUrls: generatedImageUrls, // ⭐ New: Array of uploaded image URLs
      tokens,
      model: model || DEFAULT_CHAT_MODEL,
      groundingMetadata, // Include grounding data for web searches
      searchQueries: result.searchQueries || [],
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Gemini API isteği başarısız oldu", details: error.message },
      { status: 500 }
    );
  }
}
