'use client';

import { useState, useCallback, useMemo } from 'react';
import { useClaude } from './use-claude';

// Sosyal medya platformları konfigürasyonu
export const SOCIAL_PLATFORMS = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    charLimit: 2200,
    hashtagLimit: 30,
    imageRequired: true,
    aspectRatios: ['1:1', '4:5', '16:9'],
    contentTypes: ['post', 'story', 'reel'],
    features: ['hashtags', 'mentions', 'location', 'alt_text'],
    bestTimes: ['12:00', '17:00', '19:00'],
    description: 'Görsel içerik odaklı sosyal platform'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    charLimit: 63206,
    hashtagLimit: 30,
    imageRequired: false,
    aspectRatios: ['16:9', '1:1', '4:5'],
    contentTypes: ['post', 'story', 'event'],
    features: ['hashtags', 'mentions', 'location', 'alt_text', 'links'],
    bestTimes: ['09:00', '13:00', '15:00'],
    description: 'Geniş kitle erişimi ve detaylı targeting'
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🔷',
    color: '#1DA1F2',
    charLimit: 280,
    hashtagLimit: 10,
    imageRequired: false,
    aspectRatios: ['16:9', '1:1'],
    contentTypes: ['tweet', 'thread', 'reply'],
    features: ['hashtags', 'mentions', 'alt_text', 'links'],
    bestTimes: ['09:00', '12:00', '18:00'],
    description: 'Hızlı güncel bilgi paylaşımı'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    charLimit: 3000,
    hashtagLimit: 20,
    imageRequired: false,
    aspectRatios: ['1.91:1', '1:1'],
    contentTypes: ['post', 'article', 'story'],
    features: ['hashtags', 'mentions', 'links', 'documents'],
    bestTimes: ['08:00', '12:00', '17:00'],
    description: 'Profesyonel network ve B2B pazarlama'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: '#FF0000',
    charLimit: 5000,
    hashtagLimit: 15,
    imageRequired: true,
    aspectRatios: ['16:9'],
    contentTypes: ['video', 'short', 'community'],
    features: ['hashtags', 'mentions', 'timestamps', 'links'],
    bestTimes: ['14:00', '18:00', '20:00'],
    description: 'Video içerik paylaşım platformu'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    charLimit: 2200,
    hashtagLimit: 20,
    imageRequired: true,
    aspectRatios: ['9:16'],
    contentTypes: ['video', 'photo'],
    features: ['hashtags', 'mentions', 'sounds'],
    bestTimes: ['06:00', '10:00', '19:00'],
    description: 'Kısa form video içerikler'
  }
};

// İçerik tipleri ve amaçları
export const CONTENT_TYPES = {
  promotional: {
    id: 'promotional',
    name: 'Tanıtım',
    description: 'Ürün/hizmet tanıtımı',
    tone: 'professional',
    cta: true,
    hashtags: ['product', 'service', 'quality']
  },
  educational: {
    id: 'educational',
    name: 'Eğitici',
    description: 'Bilgilendirici içerik',
    tone: 'informative',
    cta: false,
    hashtags: ['tips', 'howto', 'education']
  },
  entertainment: {
    id: 'entertainment',
    name: 'Eğlenceli',
    description: 'Eğlenceli ve günlük paylaşım',
    tone: 'casual',
    cta: false,
    hashtags: ['fun', 'behindthescenes', 'team']
  },
  news: {
    id: 'news',
    name: 'Haber',
    description: 'Şirket haberleri ve duyurular',
    tone: 'professional',
    cta: false,
    hashtags: ['news', 'announcement', 'update']
  },
  community: {
    id: 'community',
    name: 'Topluluk',
    description: 'Kullanıcı etkileşimi odaklı',
    tone: 'friendly',
    cta: true,
    hashtags: ['community', 'feedback', 'question']
  }
};

// Ton ve stil seçenekleri
export const CONTENT_TONES = {
  professional: {
    id: 'professional',
    name: 'Profesyonel',
    description: 'Kurumsal ve resmi ton',
    keywords: ['kalite', 'uzman', 'güvenilir', 'profesyonel']
  },
  friendly: {
    id: 'friendly',
    name: 'Samimi',
    description: 'Sıcak ve yakın ton',
    keywords: ['dostça', 'samimi', 'arkadaşça', 'sıcak']
  },
  casual: {
    id: 'casual',
    name: 'Günlük',
    description: 'Rahat ve doğal ton',
    keywords: ['rahat', 'doğal', 'günlük', 'sade']
  },
  informative: {
    id: 'informative',
    name: 'Bilgilendirici',
    description: 'Açıklayıcı ve öğretici ton',
    keywords: ['bilgilendirici', 'açıklayıcı', 'detaylı', 'öğretici']
  },
  exciting: {
    id: 'exciting',
    name: 'Heyecanlı',
    description: 'Enerjik ve coşkulu ton',
    keywords: ['heyecanlı', 'dinamik', 'enerjik', 'coşkulu']
  }
};

/**
 * Sosyal medya yönetimi için ana hook
 */
export function useSocialMedia() {
  const { generateContent, loading: aiLoading } = useClaude();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // İçerik üretimi - Her platform için ayrı
  const generateSocialContent = useCallback(async ({
    platform,
    contentType,
    topic,
    tone = 'professional',
    includeHashtags = true,
    includeEmojis = true,
    targetAudience = 'genel',
    brandContext = '',
    additionalInstructions = ''
  }) => {
    setLoading(true);
    setError(null);

    try {
      const platformConfig = SOCIAL_PLATFORMS[platform];
      const contentTypeConfig = CONTENT_TYPES[contentType];
      const toneConfig = CONTENT_TONES[tone];

      const systemPrompt = `Sen MKN Group için sosyal medya içeriği üreten uzman bir pazarlama profesyonelisisin. 

MKN Group Hakkında:
- Türkiye'nin önde gelen ambalaj ve kozmetik üretim firması
- ISO 22716 sertifikalı kozmetik üretimi
- 10,600m² modern üretim tesisi
- 75+ uzman ekip
- 6+ yıl deneyim
- E-ticaret fulfillment hizmetleri
- B2B ve B2C çözümler

Platform: ${platformConfig.name}
- Karakter limiti: ${platformConfig.charLimit}
- Hashtag limiti: ${platformConfig.hashtagLimit}
- Özellikler: ${platformConfig.features.join(', ')}
- En iyi paylaşım saatleri: ${platformConfig.bestTimes.join(', ')}

Bu platform için özel optimizasyon:
${platform === 'instagram' ? '- Görsel odaklı, story-friendly format\n- Aesthetic ve modern dil\n- Lifestyle entegrasyonu' : ''}
${platform === 'linkedin' ? '- Profesyonel ve B2B odaklı\n- Sektör expertise vurgusu\n- Network building' : ''}
${platform === 'facebook' ? '- Geniş kitle odaklı\n- Engaging ve paylaşılabilir\n- Community building' : ''}
${platform === 'twitter' ? '- Kısa ve etkili\n- Güncel ve trend odaklı\n- Hashtag odaklı reach' : ''}
${platform === 'youtube' ? '- Video content support\n- Detaylı açıklamalar\n- Educational approach' : ''}
${platform === 'tiktok' ? '- Genç kitle odaklı\n- Trend ve viral approach\n- Creative ve fun' : ''}

İçerik Türü: ${contentTypeConfig.name} - ${contentTypeConfig.description}
Ton: ${toneConfig.name} - ${toneConfig.description}
Hedef Kitle: ${targetAudience}

${brandContext ? `Ek Marka Bilgisi: ${brandContext}` : ''}
${additionalInstructions ? `Ek Talimatlar: ${additionalInstructions}` : ''}

Lütfen aşağıdaki kurallara uyarak içerik üret:
1. Platform karakteristiklerine uygun ve özgü içerik
2. Belirtilen ton ve stili kullan
3. ${includeHashtags ? 'Platform için optimize edilmiş hashtagler ekle' : 'Hashtag kullanma'}
4. ${includeEmojis ? 'Platform kültürüne uygun emojiler ekle' : 'Emoji kullanma'}
5. Türkçe dilinde üret
6. CTA (Call to Action) ${contentTypeConfig.cta ? 'platforma uygun şekilde ekle' : 'ekleme'}
7. MKN Group\'un değer önerilerini platform kültürüne uygun şekilde vurgula
8. Platform algoritmasına uygun engagement taktikleri kullan`;

      const prompt = `Konu: ${topic}

${platform} platformu için bu konuda özel olarak optimize edilmiş sosyal medya içeriği üret. İçeriğin ${platform} kullanıcılarının beklentilerine ve platform kültürüne tam uygun olmasına özen göster.`;

      const response = await generateContent(prompt, {
        systemPrompt,
        maxTokens: 2000
      });

      return response;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateContent]);

  // Hashtag önerileri
  const generateHashtags = useCallback(async (topic, platform, count = 10) => {
    const platformConfig = SOCIAL_PLATFORMS[platform];
    
    const systemPrompt = `MKN Group için ${platformConfig.name} platformunda "${topic}" konusu hakkında relevant hashtagler öner. 
    Maksimum ${Math.min(count, platformConfig.hashtagLimit)} hashtag öner.
    
    MKN Group alanları:
    - Ambalaj üretimi
    - Kozmetik üretimi  
    - E-ticaret fulfillment
    - B2B çözümler
    
    Sadece hashtag listesi döndür, açıklama yapma.`;

    try {
      const response = await generateContent(topic, { systemPrompt });
      
      // Hashtag formatında parse et
      const hashtags = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('#'))
        .slice(0, count);

      return hashtags;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [generateContent]);

  // Çoklu platform için aynı anda içerik üretimi
  const generateMultiPlatformContent = useCallback(async ({
    platforms,
    contentType,
    topic,
    tone = 'professional',
    includeHashtags = true,
    includeEmojis = true,
    targetAudience = 'genel',
    brandContext = '',
    additionalInstructions = ''
  }) => {
    setLoading(true);
    setError(null);

    try {
      const contentPromises = platforms.map(async (platform) => {
        const content = await generateSocialContent({
          platform,
          contentType,
          topic,
          tone,
          includeHashtags,
          includeEmojis,
          targetAudience,
          brandContext,
          additionalInstructions
        });

        return {
          platform,
          content,
          hashtags: includeHashtags ? await generateHashtags(topic, platform, 10) : [],
          optimizedFor: SOCIAL_PLATFORMS[platform].name
        };
      });

      const results = await Promise.all(contentPromises);
      
      return results.reduce((acc, result) => {
        acc[result.platform] = {
          content: result.content,
          hashtags: result.hashtags,
          optimizedFor: result.optimizedFor
        };
        return acc;
      }, {});

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateSocialContent, generateHashtags]);

  // İçerik optimizasyonu
  const optimizeContent = useCallback(async (content, platform, optimization = 'engagement') => {
    const platformConfig = SOCIAL_PLATFORMS[platform];
    
    const systemPrompt = `Verilen sosyal medya içeriğini ${platformConfig.name} platformu için ${optimization} odaklı optimize et.

Platform limitleri:
- Karakter: ${platformConfig.charLimit}
- Hashtag: ${platformConfig.hashtagLimit}

Optimizasyon türü: ${optimization}

Optimizasyondan sonra orijinal mesajın anlamını koruyarak daha etkili hale getir.`;

    try {
      const response = await generateContent(content, {
        systemPrompt,
        maxTokens: 2000
      });

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [generateContent]);

  // İçerik analizi
  const analyzeContent = useCallback(async (content, platform) => {
    const platformConfig = SOCIAL_PLATFORMS[platform];
    
    const systemPrompt = `Verilen sosyal medya içeriğini ${platformConfig.name} platformu için analiz et ve şu kriterlerde değerlendir:

1. Platform uygunluğu (1-10)
2. Engagement potansiyeli (1-10)
3. Karakter kullanımı (${content.length}/${platformConfig.charLimit})
4. Hashtag sayısı
5. Ton ve stil uygunluğu
6. İyileştirme önerileri

JSON formatında detaylı analiz raporu döndür.`;

    try {
      const response = await generateContent(content, {
        systemPrompt,
        maxTokens: 1500
      });

      // JSON parse et
      try {
        return JSON.parse(response);
      } catch {
        return { analysis: response };
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [generateContent]);

  // Content calendar önerileri
  const generateContentCalendar = useCallback(async (period = 'week', themes = []) => {
    const systemPrompt = `MKN Group için ${period === 'week' ? '1 haftalık' : '1 aylık'} sosyal medya içerik takvimi oluştur.

${themes.length > 0 ? `Odak temalar: ${themes.join(', ')}` : ''}

Her gün için:
1. Platform önerisi (Instagram, Facebook, LinkedIn, Twitter)
2. İçerik türü
3. Konu başlığı
4. Ton/stil
5. Hashtag önerileri
6. En uygun paylaşım saati

MKN Group'un hizmetlerini dengeli şekilde yansıt:
- Ambalaj çözümleri
- Kozmetik üretim
- E-ticaret fulfillment
- Kurumsal değerler

JSON formatında organize takvim döndür.`;

    try {
      const response = await generateContent('İçerik takvimi oluştur', {
        systemPrompt,
        maxTokens: 3000
      });

      try {
        return JSON.parse(response);
      } catch {
        return { calendar: response };
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [generateContent]);

  // Platform performans önerisi
  const getPlatformRecommendations = useCallback((contentType, targetAudience = 'B2B') => {
    const recommendations = [];

    Object.entries(SOCIAL_PLATFORMS).forEach(([key, platform]) => {
      let score = 0;
      let reasons = [];

      // Content type uygunluğu
      if (contentType === 'promotional') {
        if (['instagram', 'facebook', 'linkedin'].includes(key)) {
          score += 3;
          reasons.push('Tanıtım içeriği için ideal');
        }
      } else if (contentType === 'educational') {
        if (['linkedin', 'youtube', 'facebook'].includes(key)) {
          score += 3;
          reasons.push('Eğitici içerik için uygun');
        }
      } else if (contentType === 'entertainment') {
        if (['instagram', 'tiktok', 'twitter'].includes(key)) {
          score += 3;
          reasons.push('Eğlenceli içerik için mükemmel');
        }
      }

      // Target audience uygunluğu
      if (targetAudience === 'B2B') {
        if (['linkedin', 'facebook', 'twitter'].includes(key)) {
          score += 2;
          reasons.push('B2B hedef kitle için etkili');
        }
      } else if (targetAudience === 'B2C') {
        if (['instagram', 'facebook', 'tiktok'].includes(key)) {
          score += 2;
          reasons.push('B2C hedef kitle için ideal');
        }
      }

      recommendations.push({
        platform: key,
        name: platform.name,
        score,
        reasons,
        color: platform.color,
        icon: platform.icon
      });
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, []);

  return {
    // States
    loading: loading || aiLoading,
    error,

    // Platform configs
    platforms: SOCIAL_PLATFORMS,
    contentTypes: CONTENT_TYPES,
    contentTones: CONTENT_TONES,

    // Functions
    generateSocialContent,
    generateMultiPlatformContent, // Yeni: Çoklu platform içerik üretimi
    generateHashtags,
    optimizeContent,
    analyzeContent,
    generateContentCalendar,
    getPlatformRecommendations,

    // Utilities
    resetError: () => setError(null)
  };
}