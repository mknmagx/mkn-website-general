import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SCHEDULE_RECOMMENDATION_PROMPT } from '@/lib/ai-prompts/social-media-prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { titles, startDate, duration } = await request.json();

    if (!titles || titles.length === 0) {
      return NextResponse.json(
        { error: 'No titles provided' },
        { status: 400 }
      );
    }

    // Prepare prompt with titles data
    const titlesInfo = titles.map(t => ({
      id: t.id,
      title: t.title.substring(0, 100),
      platform: t.platform,
      contentType: t.contentType,
      category: t.category
    }));

    const prompt = `${SCHEDULE_RECOMMENDATION_PROMPT}

Başlıklar (${titles.length} adet):
${JSON.stringify(titlesInfo, null, 2)}

Başlangıç Tarihi: ${startDate}
Süre: ${duration} gün

Lütfen bu başlıklar için optimal bir yayın planı oluştur. Her başlık için:
- En uygun tarih ve saat
- Platform best practices'e uygun dağılım
- İçerik mix dengesi
- Engagement maximization stratejisi

JSON formatında yanıt ver:
{
  "schedule": [
    {
      "titleId": "id",
      "title": "başlık metni",
      "platform": "platform",
      "contentType": "tip",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "reasoning": "neden bu zaman önerildi"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse response
    const responseText = message.content[0].text;
    
    let scheduleData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scheduleData = JSON.parse(jsonMatch[0]);
      } else {
        scheduleData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: Create basic schedule
      const start = new Date(startDate);
      scheduleData = {
        schedule: titles.map((title, idx) => {
          const date = new Date(start);
          date.setDate(date.getDate() + Math.floor(idx * (duration / titles.length)));
          
          // Simple time assignment based on platform
          const timeMap = {
            instagram: '11:00',
            facebook: '14:00',
            x: '09:00',
            linkedin: '08:30'
          };
          
          return {
            titleId: title.id,
            title: title.title,
            platform: title.platform,
            contentType: title.contentType,
            date: date.toISOString().split('T')[0],
            time: timeMap[title.platform] || '12:00',
            reasoning: 'Otomatik dağılım'
          };
        })
      };
    }

    return NextResponse.json({
      success: true,
      schedule: scheduleData.schedule,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    });

  } catch (error) {
    console.error('Schedule generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate schedule', details: error.message },
      { status: 500 }
    );
  }
}
