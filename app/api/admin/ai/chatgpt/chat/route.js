import { NextResponse } from "next/server";
import { chatGPTService, CHATGPT_CHAT_MODELS } from "@/lib/openai";

export async function POST(request) {
  try {
    const {
      chatId,
      message,
      images,
      model,
      settings,
      history,
      systemPrompt,
    } = await request.json();

    if (!message && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: "Mesaj veya görsel gerekli" },
        { status: 400 }
      );
    }

    // Build conversation from history
    const conversation = [];

    // Add history messages
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        conversation.push({
          role: msg.role,
          content: msg.content,
          images: msg.role === "user" ? msg.imageUrls?.filter(url => 
            url && typeof url === "string" && (url.startsWith("data:image/") || url.startsWith("http"))
          ) : [],
        });
      }
    }

    // Add current message
    const currentMessage = {
      role: "user",
      content: message || "",
      images: images?.filter(img => 
        img && typeof img === "string" && (img.startsWith("data:image/") || img.startsWith("http"))
      ) || [],
    };
    conversation.push(currentMessage);

    // Get model info for system prompt
    const modelInfo = CHATGPT_CHAT_MODELS.find(m => m.value === model);
    
    // Default system prompt
    const defaultSystemPrompt = `Sen MKN Group için çalışan yardımcı bir yapay zeka asistanısın. 
Türkçe yanıt ver ve kullanıcıya profesyonel bir şekilde yardım et.
Kozmetik üretimi, ambalaj, e-ticaret ve iş operasyonları konularında uzmansın.
Yanıtların açık, anlaşılır ve faydalı olsun.`;

    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    console.log("📤 ChatGPT API Request:", {
      model,
      messageLength: message?.length,
      imagesCount: currentMessage.images.length,
      historyCount: history?.length || 0,
    });

    // Call ChatGPT service
    const response = await chatGPTService.chatConversation(
      conversation,
      finalSystemPrompt,
      model,
      {
        maxTokens: settings?.maxTokens || 4096,
        temperature: settings?.temperature || 0.7,
        topP: settings?.topP || 1,
        frequencyPenalty: settings?.frequencyPenalty || 0,
        presencePenalty: settings?.presencePenalty || 0,
      }
    );

    console.log("✅ ChatGPT API Response:", {
      contentLength: response.content?.length,
      model: response.model,
      usage: response.usage,
    });

    return NextResponse.json({
      success: true,
      response: response.content,
      usage: response.usage,
      model: response.model,
      finishReason: response.finishReason,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ ChatGPT API Error:", error);

    return NextResponse.json(
      {
        error: "ChatGPT service error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "ChatGPT Chat API endpoint is running",
    models: CHATGPT_CHAT_MODELS.map(m => ({
      value: m.value,
      label: m.label,
      icon: m.icon,
    })),
    endpoints: {
      POST: "/api/admin/ai/chatgpt/chat",
    },
  });
}
