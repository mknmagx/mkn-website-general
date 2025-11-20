'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useClaude } from './use-claude';
import { 
  saveTitleSuggestions, 
  loadTitleSuggestions,
  updateTitleSuggestion,
  deleteTitleSuggestion
} from '../lib/services/title-service';

// MKN Group şirket bilgileri ve iş dalları
export const COMPANY_CONTEXT = {
  name: "MKN GROUP",
  description: "Türkiye'nin önde gelen ambalaj ve kozmetik üretim firması",
  
  // Ana İş Dalları
  businessAreas: [
    {
      id: 'ambalaj',
      name: 'Ambalaj Üretimi',
      description: 'Kozmetik, gıda ve endüstriyel ürünler için özel ambalaj çözümleri',
      keywords: ['ambalaj', 'packaging', 'disc top', 'pompa', 'şişe', 'kapak', 'alüminyum', 'plastik'],
      subAreas: ['Disc Top Kapaklar', 'Krem Pompalar', 'Losyon Pompaları', 'Sprey Pompalar', 'Köpük Pompalar', 'Airless Şişeler']
    },
    {
      id: 'kozmetik-uretim',
      name: 'Kozmetik Üretimi',
      description: 'ISO 22716 sertifikalı kozmetik ve dermokozmetik ürün üretimi',
      keywords: ['kozmetik', 'dermokozmetik', 'fason üretim', 'ISO 22716', 'krem', 'losyon', 'serum'],
      subAreas: ['Cilt Bakım Ürünleri', 'Saç Bakım Ürünleri', 'Temizlik Ürünleri', 'Parfüm']
    },
    {
      id: 'e-ticaret',
      name: 'E-ticaret Fulfillment',
      description: 'Kapsamlı e-ticaret operasyon yönetimi ve lojistik çözümleri',
      keywords: ['e-ticaret', 'fulfillment', 'lojistik', 'depolama', 'kargo', 'marketplace'],
      subAreas: ['Depolama', 'Sipariş Yönetimi', 'Kargo Entegrasyonu', 'Marketplace Yönetimi']
    },
    {
      id: 'pazarlama',
      name: 'Pazarlama & Tasarım',
      description: 'Dijital pazarlama, marka geliştirme ve görsel tasarım hizmetleri',
      keywords: ['pazarlama', 'tasarım', 'marka', 'dijital', 'sosyal medya', 'SEO'],
      subAreas: ['Dijital Pazarlama', 'Sosyal Medya Yönetimi', 'Marka Tasarımı', 'Web Tasarım']
    }
  ],

  // Önceden Tanımlı Konular
  predefinedTopics: [
    // Ambalaj Konuları
    {
      category: 'ambalaj',
      topics: [
        'Sürdürülebilir ambalaj çözümleri',
        'Kozmetik ambalajında yenilikler', 
        'Disc top kapak avantajları',
        'Airless şişelerin faydaları',
        'Pompa sistemlerinin çeşitleri',
        'Alüminyum vs plastik ambalaj karşılaştırması',
        'Ambalaj malzeme seçimi rehberi',
        'Özel tasarım ambalaj çözümleri',
        'Ambalaj kalite standartları',
        'Ekonomik ambalaj seçenekleri'
      ]
    },
    // Kozmetik Üretim Konuları
    {
      category: 'kozmetik-uretim',
      topics: [
        'ISO 22716 kalite güvencesi',
        'Fason kozmetik üretim avantajları',
        'Dermokozmetik ürün geliştirme',
        'Cilt bakım ürünleri formülasyonu',
        'Saç bakım ürünleri üretimi',
        'Temizlik ürünleri formülü',
        'Parfüm üretim süreci',
        'Kozmetik ürün testleri',
        'Kalite kontrol süreçleri',
        'Üretim kapasitesi ve teknolojiler'
      ]
    },
    // E-ticaret Konuları
    {
      category: 'e-ticaret',
      topics: [
        'E-ticaret fulfillment hizmetleri',
        'Depolama ve lojistik çözümleri',
        'Sipariş yönetimi sistemleri',
        'Kargo entegrasyonu avantajları',
        'Marketplace yönetimi',
        'E-ticaret operasyon optimizasyonu',
        'Stok yönetimi stratejileri',
        'Müşteri memnuniyeti artırma',
        'Hızlı teslimat çözümleri',
        'E-ticaret analitik raporları'
      ]
    },
    // Pazarlama Konuları
    {
      category: 'pazarlama',
      topics: [
        'Dijital pazarlama stratejileri',
        'Sosyal medya yönetimi',
        'Marka kimliği geliştirme',
        'Web tasarım trendleri',
        'SEO optimizasyon teknikleri',
        'İçerik pazarlama stratejileri',
        'Marka görsel kimliği',
        'Dijital reklam kampanyaları',
        'Müşteri deneyimi tasarımı',
        'Pazarlama analitikleri'
      ]
    },
    // Genel Şirket Konuları
    {
      category: 'genel',
      topics: [
        'MKN Group hizmetleri',
        'Şirket değerleri ve vizyonu',
        'Müşteri başarı hikayeleri',
        'Teknoloji ve inovasyon',
        'Kalite ve güvenilirlik',
        'Uzman ekip avantajları',
        'Modern üretim tesisleri',
        'Sektördeki deneyim',
        'Entegre çözümler',
        'Müşteri odaklı yaklaşım'
      ]
    },
    // Trend ve İnovasyon Konuları
    {
      category: 'trend',
      topics: [
        '2024 ambalaj trendleri',
        'Gelecekteki kozmetik teknolojileri',
        'E-ticaret sektörü gelişmeleri',
        'Sürdürülebilirlik trendleri',
        'Dijital dönüşüm trendleri',
        'Tüketici davranış değişimleri',
        'Endüstri 4.0 uygulamaları',
        'Çevre dostu üretim yöntemleri',
        'Akıllı ambalaj teknolojileri',
        'Gelecek nesil kozmetik ürünleri'
      ]
    }
  ],

  // Şirket Değerleri
  values: [
    'Kalite ve güvenilirlik',
    'İnovasyon ve teknoloji',
    'Müşteri odaklı yaklaşım',
    'Sürdürülebilirlik',
    'Uzman ekip ve deneyim'
  ],

  // Hedef Pazarlar
  targetMarkets: ['B2B', 'B2C', 'Kozmetik markaları', 'E-ticaret şirketleri', 'Girişimciler'],

  // Rekabet Avantajları
  advantages: [
    '75+ uzman ekip',
    '10,600m² modern üretim tesisi',
    '6+ yıl sektör deneyimi',
    'ISO 22716 kalite sertifikası',
    'Tek çatı altında entegre çözümler'
  ]
};

// Başlık kategorileri ve amaçları
export const TITLE_CATEGORIES = {
  educational: {
    id: 'educational',
    name: 'Eğitici & Bilgilendirici',
    description: 'Sektör bilgileri, ipuçları ve rehberler',
    tone: 'informative',
    examples: ['Nasıl', 'Rehber', 'İpuçları', 'Bilmeniz Gerekenler']
  },
  promotional: {
    id: 'promotional',
    name: 'Tanıtım & Pazarlama',
    description: 'Ürün/hizmet tanıtımı ve satış odaklı',
    tone: 'persuasive',
    examples: ['Yeni', 'Özel', 'Avantajlar', 'Çözümler']
  },
  news: {
    id: 'news',
    name: 'Haber & Duyuru',
    description: 'Şirket haberleri ve sektör güncellemeleri',
    tone: 'professional',
    examples: ['Duyuru', 'Haber', 'Güncelleme', 'Yenilik']
  },
  case_study: {
    id: 'case_study',
    name: 'Başarı Hikayeleri',
    description: 'Müşteri deneyimleri ve proje örnekleri',
    tone: 'storytelling',
    examples: ['Başarı', 'Deneyim', 'Çalışma', 'Sonuç']
  },
  trend: {
    id: 'trend',
    name: 'Trend & İnovasyon',
    description: 'Sektör trendleri ve yenilikler',
    tone: 'innovative',
    examples: ['Trend', 'Gelecek', 'İnovasyon', 'Teknoloji']
  }
};

// Başlık tonları
export const TITLE_TONES = {
  professional: { name: 'Profesyonel', style: 'Resmi ve güvenilir' },
  friendly: { name: 'Samimi', style: 'Sıcak ve yakın' },
  authoritative: { name: 'Otoriter', style: 'Uzman ve kesin' },
  curious: { name: 'Meraklı', style: 'Soru soran ve ilgi çekici' },
  urgent: { name: 'Acil', style: 'Hemen harekete geçiren' },
  creative: { name: 'Yaratıcı', style: 'Orijinal ve dikkat çekici' }
};

/**
 * AI başlık üretimi ve yönetimi için hook
 */
export function useTitleGenerator() {
  const { generateContent, loading: aiLoading } = useClaude();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedTitles, setSavedTitles] = useState([]);

  // Şirket verilerini analiz eden sistem promptu
  const getSystemPrompt = useCallback(() => {
    return `Sen MKN Group için uzman bir içerik pazarlamacısı ve başlık yazarısın.

MKN GROUP HAKKINDa:
${COMPANY_CONTEXT.description}

ANA İŞ DALLARI:
${COMPANY_CONTEXT.businessAreas.map(area => 
  `• ${area.name}: ${area.description}\n  Alt Alanlar: ${area.subAreas.join(', ')}\n  Anahtar Kelimeler: ${area.keywords.join(', ')}`
).join('\n\n')}

ŞİRKET DEĞERLERİ: ${COMPANY_CONTEXT.values.join(', ')}
HEDEF PAZARLAR: ${COMPANY_CONTEXT.targetMarkets.join(', ')}
REKABET AVANTAJLARI: ${COMPANY_CONTEXT.advantages.join(', ')}

BAŞLIK YAZMA PRENSİPLERİ:
1. Hedef kitle için relevant ve değerli olmalı
2. SEO dostu anahtar kelimeler içermeli  
3. Duygusal bağ kuracak güçlü kelimeler kullanmalı
4. Spesifik ve ölçülebilir vaatler vermeli
5. Marka değerlerini ve uzmanlığı yansıtmalı
6. Rakiplerden farklılaşan açılar bulmalı
7. Türkçe dilinde doğal ve akıcı olmalı

Sosyal medya, blog, haber, ürün tanıtımı gibi farklı formatlarda başlık üretebilmelisin.`;
  }, []);

  // AI ile başlık üretimi
  const generateTitles = useCallback(async ({
    topic,
    category = 'educational',
    tone = 'professional',
    businessArea = null,
    targetAudience = 'genel',
    count = 10,
    contentType = 'blog',
    additionalContext = ''
  }) => {
    setLoading(true);
    setError(null);

    try {
      const categoryConfig = TITLE_CATEGORIES[category];
      const toneConfig = TITLE_TONES[tone];
      const businessAreaData = businessArea ? 
        COMPANY_CONTEXT.businessAreas.find(area => area.id === businessArea) : null;

      const prompt = `
Konu: ${topic}
İçerik Türü: ${contentType}
Kategori: ${categoryConfig.name} (${categoryConfig.description})
Ton: ${toneConfig.name} - ${toneConfig.style}
Hedef Kitle: ${targetAudience}
${businessAreaData ? `İş Dalı Odağı: ${businessAreaData.name} - ${businessAreaData.description}` : ''}
${additionalContext ? `Ek Bağlam: ${additionalContext}` : ''}

MKN Group'un yukarıdaki iş dalları ve değerleri doğrultusunda ${count} farklı başlık üret.

Her başlık için şu kriterleri dikkate al:
- Konuyla ilgili MKN Group'un uzmanlık alanlarını vurgula
- ${businessAreaData ? `"${businessAreaData.keywords.join('", "')}"` : 'Şirket anahtar kelimelerini'} stratejik olarak kullan
- ${targetAudience} hedef kitlesinin ilgi ve ihtiyaçlarını karşıla
- ${categoryConfig.examples ? `"${categoryConfig.examples.join('", "')}" tarzı kelimeler kullanabilirsin` : ''}
- 40-80 karakter arası ideal uzunlukta ol
- SEO dostu ve sosyal medya paylaşımına uygun ol

Format:
1. [Başlık metni]
2. [Başlık metni]
...

SADECE başlık listesi döndür, açıklama yapma.`;

      const response = await generateContent(prompt, {
        systemPrompt: getSystemPrompt(),
        maxTokens: 1500
      });

      // Başlıkları parse et
      const titles = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\.\s+/))
        .map(line => line.replace(/^\d+\.\s+/, ''))
        .filter(title => title.length > 0);

      // Metadata ile birlikte döndür
      const titlesWithMetadata = titles.map((title, index) => ({
        id: `generated-${Date.now()}-${index}`,
        text: title,
        category,
        tone,
        businessArea,
        targetAudience,
        topic,
        contentType,
        generatedAt: new Date().toISOString(),
        isCustom: false,
        isSelected: false,
        characterCount: title.length
      }));

      return titlesWithMetadata;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateContent, getSystemPrompt]);

  // Başlık optimizasyonu
  const optimizeTitle = useCallback(async (title, optimization = 'seo') => {
    const systemPrompt = getSystemPrompt();
    
    let optimizationPrompt = '';
    
    switch (optimization) {
      case 'seo':
        optimizationPrompt = 'SEO performansı için optimize et. Anahtar kelime yoğunluğu artır, arama dostu hale getir.';
        break;
      case 'social':
        optimizationPrompt = 'Sosyal medya paylaşımı için optimize et. Daha dikkat çekici ve viral olabilir şekilde iyileştir.';
        break;
      case 'engagement':
        optimizationPrompt = 'Kullanıcı etkileşimi için optimize et. Daha merak uyandırıcı ve tıklanabilir hale getir.';
        break;
      case 'conversion':
        optimizationPrompt = 'Dönüşüm odaklı optimize et. Harekete geçirici ve ikna edici hale getir.';
        break;
      default:
        optimizationPrompt = 'Genel performans için optimize et.';
    }

    try {
      const prompt = `Şu başlığı ${optimizationPrompt}

Mevcut başlık: "${title}"

Optimizasyon kriterleri:
- MKN Group'un değer önerisini güçlendir
- Hedef kitlenin ilgisini çek
- Türkçe dilinde doğal ve akıcı ol
- ${optimization} açısından en etkili hali bul

SADECE optimize edilmiş başlığı döndür, açıklama yapma.`;

      const response = await generateContent(prompt, {
        systemPrompt,
        maxTokens: 200
      });

      return response.trim();

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [generateContent, getSystemPrompt]);

  // Başlık analizi
  const analyzeTitle = useCallback(async (title) => {
    const systemPrompt = getSystemPrompt();

    try {
      const prompt = `Şu başlığı analiz et ve değerlendir:

"${title}"

Aşağıdaki kriterlerde 1-10 arası puan ver ve kısa açıklama yap:

1. SEO Uygunluğu
2. Dikkat Çekicilik  
3. Marka Uyumu (MKN Group)
4. Hedef Kitle Uygunluğu
5. Duygusal Etki
6. Özgünlük/Farklılık
7. Açıklık/Anlaşılırlık
8. Harekete Geçirici Güç

Ayrıca:
- Güçlü yanlar
- İyileştirme önerileri
- Anahtar kelime analizi
- Genel skor (1-100)

JSON formatında döndür.`;

      const response = await generateContent(prompt, {
        systemPrompt,
        maxTokens: 1000
      });

      try {
        return JSON.parse(response);
      } catch {
        return { analysis: response };
      }

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [generateContent, getSystemPrompt]);

  // Başlık varyasyonları
  const generateVariations = useCallback(async (baseTitle, variationType = 'tone') => {
    const systemPrompt = getSystemPrompt();

    let variationPrompt = '';
    
    switch (variationType) {
      case 'tone':
        variationPrompt = 'Farklı tonlarda (profesyonel, samimi, meraklı, acil, yaratıcı) 5 varyasyon üret.';
        break;
      case 'length':
        variationPrompt = 'Farklı uzunluklarda (kısa-40 karakter, orta-60 karakter, uzun-80 karakter) 3 varyasyon üret.';
        break;
      case 'format':
        variationPrompt = 'Farklı formatlarda (soru, liste, sayı, nasıl, rehber) 5 varyasyon üret.';
        break;
      case 'audience':
        variationPrompt = 'Farklı hedef kitleler için (B2B, B2C, uzmanlar, yeni başlayanlar) 4 varyasyon üret.';
        break;
    }

    try {
      const prompt = `Şu temel başlık için varyasyonlar üret:

Temel başlık: "${baseTitle}"

${variationPrompt}

Her varyasyonu numaralayarak listele. SADECE başlık listesi döndür.`;

      const response = await generateContent(prompt, {
        systemPrompt,
        maxTokens: 800
      });

      // Varyasyonları parse et
      const variations = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\.\s+/))
        .map(line => line.replace(/^\d+\.\s+/, ''))
        .filter(title => title.length > 0);

      return variations.map((title, index) => ({
        id: `variation-${Date.now()}-${index}`,
        text: title,
        baseTitle,
        variationType,
        characterCount: title.length,
        generatedAt: new Date().toISOString()
      }));

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [generateContent, getSystemPrompt]);

  // Kayıtlı başlıkları yükle
  const loadSavedTitles = useCallback(async (filters = {}) => {
    try {
      const titles = await loadTitleSuggestions(filters);
      setSavedTitles(titles);
      return titles;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Saved titles'ı component mount'unda yükle
  useEffect(() => {
    const initializeSavedTitles = async () => {
      try {
        await loadSavedTitles();
      } catch (err) {
        // Silent fail - error handling in UI
      }
    };
    
    initializeSavedTitles();
  }, [loadSavedTitles]);

  // Başlık kaydet
  const saveTitle = useCallback(async (titleData) => {
    try {
      const savedTitle = await saveTitleSuggestions([titleData]);
      setSavedTitles(prev => [...prev, savedTitle[0]]);
      return savedTitle[0];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Birden fazla başlık kaydet
  const saveTitles = useCallback(async (titlesData) => {
    try {
      const savedTitles = await saveTitleSuggestions(titlesData);
      setSavedTitles(prev => [...prev, ...savedTitles]);
      return savedTitles;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Başlık güncelle
  const updateTitle = useCallback(async (titleId, updates) => {
    try {
      const updatedTitle = await updateTitleSuggestion(titleId, updates);
      setSavedTitles(prev => 
        prev.map(title => title.id === titleId ? updatedTitle : title)
      );
      return updatedTitle;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Başlık sil
  const deleteTitle = useCallback(async (titleId) => {
    try {
      await deleteTitleSuggestion(titleId);
      setSavedTitles(prev => prev.filter(title => title.id !== titleId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Önerilen konular (şirket iş dallarına göre)
  const getSuggestedTopics = useCallback((businessArea = null) => {
    if (businessArea) {
      const area = COMPANY_CONTEXT.businessAreas.find(a => a.id === businessArea);
      return area ? area.subAreas.concat(area.keywords) : [];
    }
    
    return COMPANY_CONTEXT.businessAreas.reduce((topics, area) => {
      return topics.concat(area.subAreas.slice(0, 2));
    }, []);
  }, []);

  // Trend konular üretimi
  const generateTrendingTopics = useCallback(async (businessArea = null) => {
    const systemPrompt = getSystemPrompt();
    const area = businessArea ? COMPANY_CONTEXT.businessAreas.find(a => a.id === businessArea) : null;

    try {
      const prompt = `${area ? `${area.name} alanında` : 'MKN Group\'un tüm iş dallarında'} güncel trend konularını öner.

${area ? `Odak Alan: ${area.description}\nAnahtar Kelimeler: ${area.keywords.join(', ')}` : ''}

2024-2025 dönemi için:
- Sektörde yeni teknolojiler
- Pazar trendleri
- Müşteri talepleri
- Sürdürülebilirlik konuları
- İnovasyon fırsatları

10 trend konu başlığı öner. Her birini tek satırda listele.

Format:
1. [Konu]
2. [Konu]
...`;

      const response = await generateContent(prompt, {
        systemPrompt,
        maxTokens: 800
      });

      const topics = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\.\s+/))
        .map(line => line.replace(/^\d+\.\s+/, ''))
        .filter(topic => topic.length > 0);

      return topics;

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [generateContent, getSystemPrompt]);

  return {
    // States
    loading: loading || aiLoading,
    error,
    savedTitles,

    // Configurations
    companyContext: COMPANY_CONTEXT,
    titleCategories: TITLE_CATEGORIES,
    titleTones: TITLE_TONES,

    // AI Functions
    generateTitles,
    optimizeTitle,
    analyzeTitle,
    generateVariations,
    generateTrendingTopics,

    // Database Functions
    loadSavedTitles,
    saveTitle,
    saveTitles,
    updateTitle,
    deleteTitle,

    // Utility Functions
    getSuggestedTopics,
    
    // Error handling
    resetError: () => setError(null)
  };
}