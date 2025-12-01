import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getContentGenerationPrompt } from "@/lib/ai-prompts/social-media-prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL_MAP = {
  "claude-sonnet-4": "claude-sonnet-4-20250514",
  "claude-opus-4": "claude-opus-4-20250514",
  "claude-haiku-4": "claude-haiku-4-20250514",
};

export async function POST(request) {
  try {
    const { title, platform, contentType, aiModel, options } =
      await request.json();

    if (!title || !platform || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate prompt with customization options
    const prompt = getContentGenerationPrompt(
      title,
      platform,
      contentType,
      options || {}
    );

    // Call Claude API
    const model = MODEL_MAP[aiModel] || MODEL_MAP["claude-sonnet-4"];

    const message = await anthropic.messages.create({
      model: model,
      max_tokens: 8192,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse response
    const responseText = message.content[0].text;

    let content;
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText.trim();

      // Remove ```json and ``` markers
      cleanedText = cleanedText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "");
      cleanedText = cleanedText.replace(/\s*```\s*$/, "");
      cleanedText = cleanedText.trim();

      // Try to extract JSON from the cleaned response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        content = JSON.parse(cleanedText);
      }
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError);
      console.error("Response text:", responseText.substring(0, 200));

      // Fallback: create basic structure
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
      model: model,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content", details: error.message },
      { status: 500 }
    );
  }
}
