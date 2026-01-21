import { NextResponse } from 'next/server';
import { unifiedAIService, applyPromptVariables, AI_CONTEXTS } from '@/lib/services/unified-ai-service';

// Kategori label mapping
const CATEGORY_LABELS = {
  'fason-kozmetik': 'Fason Kozmetik Üretim',
  'fason-gida': 'Fason Gıda Takviye',
  'fason-temizlik': 'Fason Temizlik Ürünleri',
  'kozmetik-ambalaj': 'Kozmetik Ambalaj',
  'e-ticaret-operasyon': 'E-ticaret Operasyon',
  'dijital-pazarlama': 'Dijital Pazarlama',
  'marka-danismanlik': 'Marka Danışmanlık',
  'sirket-haberleri': 'Şirket Haberleri'
};

// Platform label mapping
const PLATFORM_LABELS = {
  'instagram': 'Instagram',
  'facebook': 'Facebook',
  'twitter': 'X (Twitter)',
  'x': 'X (Twitter)',
  'linkedin': 'LinkedIn'
};

// İçerik tipi label mapping
const CONTENT_TYPE_LABELS = {
  'post': 'Post',
  'reel': 'Reel/Video',
  'story': 'Story',
  'carousel': 'Carousel/Thread',
  'article': 'Makale',
  'thread': 'Thread'
};

export async function POST(request) {
  try {
    const { category, platform, contentType, count, aiModel, customPrompt } = await request.json();

    if (!category || !platform || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Unified AI Service'den konfigürasyonu al (prompt dahil)
    const aiContext = AI_CONTEXTS.SOCIAL_TITLE_GENERATION;
    const config = await unifiedAIService.getConfiguration(aiContext);
    
    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found for social_title_generation' },
        { status: 500 }
      );
    }

    // Config içinden prompt bilgisini al
    const promptData = config.prompt;

    // Prompt değişkenlerini hazırla
    const variables = {
      category: category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      platform: platform,
      platformLabel: PLATFORM_LABELS[platform] || platform,
      contentType: contentType,
      contentTypeLabel: CONTENT_TYPE_LABELS[contentType] || contentType,
      count: count || 5,
      customPrompt: customPrompt ? `\n\n📝 ÖZEL TALİMATLAR:\n${customPrompt}` : ''
    };

    // Prompt'ları değişkenlerle doldur
    const systemPrompt = applyPromptVariables(promptData?.systemPrompt || '', variables);
    const userPrompt = applyPromptVariables(promptData?.userPromptTemplate || promptData?.content || '', variables);

    // Request gelen aiModel'i veya config'den default modeli kullan
    const selectedModel = aiModel || config?.model?.modelId || 'claude-sonnet-4';
    
    // Unified AI Service ile içerik üret
    const result = await unifiedAIService.generateContent(aiContext, userPrompt, {
      modelId: selectedModel,
      systemPrompt: systemPrompt,
      temperature: promptData?.defaultSettings?.temperature || config?.settings?.temperature || 0.9,
      maxTokens: promptData?.defaultSettings?.maxTokens || config?.settings?.maxTokens || 4096
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'AI generation failed', details: result.error },
        { status: 500 }
      );
    }

    // Parse response
    const responseText = result.content;
    
    // Try to extract JSON from the response
    let titles;
    try {
      // Look for JSON array in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        titles = JSON.parse(jsonMatch[0]);
      } else {
        titles = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: split by newlines and create basic structure
      titles = responseText
        .split('\n')
        .filter(line => line.trim())
        .slice(0, count)
        .map((line, idx) => ({
          title: line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''),
          suggestedHashtags: [],
          contentType: contentType
        }));
    }

    return NextResponse.json({
      success: true,
      titles: titles,
      model: result.metadata?.model,
      provider: result.metadata?.provider,
      tokensUsed: 0 // Token bilgisi şu an provider'dan gelmiyor
    });

  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate titles', details: error.message },
      { status: 500 }
    );
  }
}
