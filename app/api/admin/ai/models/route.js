/**
 * 🔍 OpenAI Available Models API
 * 
 * Bu endpoint OpenAI API'den mevcut modelleri listeler.
 * GPT-5+ model adlarını doğrulamak için kullanılabilir.
 * 
 * GET /api/admin/ai/models?filter=gpt-5
 */

import { NextResponse } from "next/server";
import { listAvailableModels } from "@/lib/openai";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || null;
    
    console.log(`🔍 Listing OpenAI models${filter ? ` with filter: ${filter}` : ''}...`);
    
    const models = await listAvailableModels(filter);
    
    // GPT-5 ve üzeri modelleri öne çıkar
    const gpt5Models = models.filter(m => m.id.toLowerCase().includes('gpt-5'));
    const gpt4Models = models.filter(m => m.id.toLowerCase().includes('gpt-4'));
    const o1Models = models.filter(m => m.id.toLowerCase().startsWith('o1'));
    
    return NextResponse.json({
      success: true,
      total: models.length,
      summary: {
        gpt5Count: gpt5Models.length,
        gpt4Count: gpt4Models.length,
        o1Count: o1Models.length,
      },
      highlights: {
        gpt5: gpt5Models.map(m => m.id),
        o1: o1Models.map(m => m.id),
      },
      models: models,
    });
  } catch (error) {
    console.error("Failed to list models:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        hint: "OpenAI API key'inizi kontrol edin veya model adının doğru olduğundan emin olun."
      },
      { status: 500 }
    );
  }
}
