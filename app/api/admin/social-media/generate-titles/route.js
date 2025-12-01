import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getTitleGenerationPrompt } from '@/lib/ai-prompts/social-media-prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL_MAP = {
  'claude-sonnet-4': 'claude-sonnet-4-20250514',
  'claude-opus-4': 'claude-opus-4-20250514',
  'claude-haiku-4': 'claude-haiku-4-20250514'
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

    // Generate prompt with customPrompt parameter
    const prompt = getTitleGenerationPrompt(category, platform, contentType, count, customPrompt || '');

    // Call Claude API
    const model = MODEL_MAP[aiModel] || MODEL_MAP['claude-sonnet-4'];
    
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: 4096,
      temperature: 0.9, // Higher creativity for topic generation
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      // Request JSON output for better parsing
      system: "You are a social media expert specializing in topic generation. Always return valid JSON array format. Each topic title should be short (5-15 words), engaging, and suitable for the specified platform."
    });

    // Parse response
    const responseText = message.content[0].text;
    
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
      model: model,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    });

  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate titles', details: error.message },
      { status: 500 }
    );
  }
}
