/**
 * 🎨 ULTRA-PROFESSIONAL VISUAL GENERATION SETTINGS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Bu dosya, Gemini content-visualize API'si için kullanılabilecek
 * tüm görsel üretim ayarlarını tanımlar.
 * 
 * API Kullanımı:
 * POST /api/gemini/content-visualize
 * Body: {
 *   chatId: string,
 *   message: string,
 *   contentId: string,
 *   settings: { ...visualSettings }
 * }
 */

export const VISUAL_STYLES = {
  AUTO: {
    value: "auto",
    label: "Otomatik (AI Seçimi)",
    description: "AI, içerik ve platforma göre en uygun stili otomatik seçer",
    icon: "🎯",
    bestFor: ["Hızlı üretim", "AI önerileri", "A/B testing"],
  },
  REALISTIC: {
    value: "realistic",
    label: "Gerçekçi Fotoğraf",
    description: "Ultra-gerçekçi fotoğraf stili, DSLR kalitesi, doğal görünüm",
    icon: "📸",
    bestFor: ["Ürün fotoğrafları", "İnsan portreleri", "Gerçek yaşam sahneleri"],
  },
  MINIMALIST: {
    value: "minimalist",
    label: "Minimalist & Sofistike",
    description: "Temiz tasarım, negatif alan kullanımı, Apple tarzı estetik",
    icon: "✨",
    bestFor: ["Lüks markalar", "Tech ürünleri", "Premium hizmetler"],
  },
  CREATIVE: {
    value: "creative",
    label: "Yaratıcı & Artistik",
    description: "Cesur sanatsal vizyon, sıra dışı kompozisyon, ödül kazanan tasarım",
    icon: "🎨",
    bestFor: ["Kampanyalar", "Yaratıcı projeler", "Sanat odaklı içerik"],
  },
  PROFESSIONAL: {
    value: "professional",
    label: "Kurumsal Profesyonel",
    description: "İş dünyası standardı, boardroom kalitesi, güvenilir görsel dil",
    icon: "💼",
    bestFor: ["B2B içerikleri", "Kurumsal sunumlar", "Resmi duyurular"],
  },
  EDITORIAL: {
    value: "editorial",
    label: "Editöryal Dergi Kalitesi",
    description: "Vogue/GQ seviyesi, dergi kapağı kalitesi, yayıncılık standardı",
    icon: "📰",
    bestFor: ["Blog başlıkları", "Feature içerikler", "Lider makaleler"],
  },
};

export const TEXT_OVERLAY_OPTIONS = {
  NONE: {
    value: "none",
    label: "Hiç Yazı Yok",
    description: "Tamamen görselle anlatım, text-free tasarım",
    icon: "🚫",
    bestFor: ["Güçlü görseller", "Minimal estetik", "Sanatsal içerik"],
    textAmount: "0 kelime",
  },
  MINIMAL: {
    value: "minimal",
    label: "Minimal Yazı (Önerilen)",
    description: "Maksimum 3-5 kelime, ince typography entegrasyonu",
    icon: "✍️",
    bestFor: ["Modern tasarımlar", "Premium markalar", "Çoğu sosyal medya"],
    textAmount: "3-5 kelime",
  },
  MODERATE: {
    value: "moderate",
    label: "Dengeli Yazı-Görsel",
    description: "Başlık + destekleyici copy, harmonik entegrasyon",
    icon: "📝",
    bestFor: ["Bilgilendirici içerik", "Kampanya görselleri", "Promo içerikler"],
    textAmount: "10-15 kelime",
  },
  PROMINENT: {
    value: "prominent",
    label: "Yazı Odaklı",
    description: "Cesur tipografi, text-forward design, quote tarzı",
    icon: "📢",
    bestFor: ["Alıntı görselleri", "İstatistik paylaşımları", "Duyuru görselleri"],
    textAmount: "15+ kelime",
  },
};

export const COLOR_SCHEMES = {
  BRAND: {
    value: "brand",
    label: "Marka Renkleri",
    description: "Profesyonel marka uyumlu palet, kurumsal renk psikolojisi",
    icon: "🎨",
    examples: ["Marka kimliği", "Tutarlılık", "Tanınırlık"],
  },
  VIBRANT: {
    value: "vibrant",
    label: "Canlı & Enerjik",
    description: "Cesur doygun renkler, dikkat çekici enerji, genç estetik",
    icon: "🌈",
    examples: ["Gençlik pazarı", "Enerji", "Heyecan"],
  },
  MUTED: {
    value: "muted",
    label: "Soft & Sofistike",
    description: "Zarif pastel tonlar, premium his, yaklaşılabilir sıcaklık",
    icon: "🎭",
    examples: ["Lüks", "Zarafet", "Premium"],
  },
  MONOCHROME: {
    value: "monochrome",
    label: "Siyah & Beyaz",
    description: "Zamansız siyah-beyaz, dramatik kontrast, klasik sofistikasyon",
    icon: "⚫",
    examples: ["Klasik", "Dramatik", "Sanatsal"],
  },
  PASTEL: {
    value: "pastel",
    label: "Pastel Harmoni",
    description: "Yumuşak pastel harmoni, nazik estetik, yaklaşılabilir sıcaklık",
    icon: "🌸",
    examples: ["Yumuşak", "Nazik", "Dostça"],
  },
};

export const COMPOSITION_STYLES = {
  BALANCED: {
    value: "balanced",
    label: "Dengeli Kompozisyon",
    description: "Mükemmel görsel denge, harmonik eleman yerleşimi",
    icon: "⚖️",
    bestFor: ["Çoğu içerik", "Güvenli seçim", "Profesyonel görünüm"],
  },
  RULE_OF_THIRDS: {
    value: "rule-of-thirds",
    label: "Rule of Thirds",
    description: "Altın oran prensipleri, fotografik kompozisyon standardı",
    icon: "📐",
    bestFor: ["Fotoğraf", "Doğal görünüm", "Profesyonel framing"],
  },
  CENTERED: {
    value: "centered",
    label: "Merkez Odaklı",
    description: "Cesur merkez focal point, simetrik güç, direkt görsel etki",
    icon: "🎯",
    bestFor: ["Ürün showcase", "Logo", "Tek eleman vurgusu"],
  },
  DYNAMIC: {
    value: "dynamic",
    label: "Dinamik & Hareketli",
    description: "Dinamik asimetri, yaratıcı gerilim, hareket ve enerji",
    icon: "⚡",
    bestFor: ["Action shots", "Enerji", "Dikkat çekme"],
  },
};

export const MOOD_OPTIONS = {
  PROFESSIONAL: {
    value: "professional",
    label: "Profesyonel & Güvenilir",
    description: "Cilalanmış kurumsal profesyonellik, güvenilir otorite",
    icon: "💼",
    emotion: "Güven, Otorite, Saygınlık",
  },
  ENERGETIC: {
    value: "energetic",
    label: "Enerjik & Dinamik",
    description: "Dinamik enerji, heyecan, aksiyon odaklı canlılık",
    icon: "⚡",
    emotion: "Heyecan, Enerji, Motivasyon",
  },
  CALM: {
    value: "calm",
    label: "Sakin & Huzurlu",
    description: "Dingin sakinlik, zen sofistikasyonu, huzurlu zarafet",
    icon: "🧘",
    emotion: "Huzur, Dinginlik, Denge",
  },
  LUXURY: {
    value: "luxury",
    label: "Lüks & Prestijli",
    description: "Premium lüks, özel sofistikasyon, high-end çekicilik",
    icon: "💎",
    emotion: "Prestij, Özellik, Lüks",
  },
  FRIENDLY: {
    value: "friendly",
    label: "Samimi & Yakın",
    description: "Sıcak dostane yaklaşılabilirlik, insani bağlantı, ilişkilenebilir çekicilik",
    icon: "😊",
    emotion: "Sıcaklık, Yakınlık, Dostluk",
  },
};

export const IMAGE_SIZES = {
  SD: { value: "SD", label: "Standard (512x512)", description: "Hızlı önizleme" },
  HD: { value: "HD", label: "High Definition (1024x1024)", description: "Genel kullanım" },
  "2K": { value: "2K", label: "2K Resolution (2048x2048)", description: "Yüksek kalite (Önerilen)" },
  "4K": { value: "4K", label: "4K Ultra HD (4096x4096)", description: "Maksimum kalite" },
};

export const ASPECT_RATIOS = {
  SQUARE: { value: "1:1", label: "Square (1:1)", platforms: ["Instagram Post", "Facebook"] },
  VERTICAL: { value: "9:16", label: "Vertical Story (9:16)", platforms: ["Instagram Story", "TikTok"] },
  HORIZONTAL: { value: "16:9", label: "Horizontal (16:9)", platforms: ["Facebook", "LinkedIn", "YouTube"] },
  PORTRAIT: { value: "4:5", label: "Portrait (4:5)", platforms: ["Instagram Feed"] },
};

// ═══════════════════════════════════════════════════════════════
// 🎯 ÖNCEDEFİNE PRESET KOMBİNASYONLAR
// ═══════════════════════════════════════════════════════════════

export const PRESET_COMBINATIONS = {
  // Instagram Presets
  INSTAGRAM_LIFESTYLE: {
    name: "Instagram Lifestyle",
    platform: "Instagram",
    settings: {
      visualStyle: "realistic",
      textOverlay: "minimal",
      colorScheme: "vibrant",
      composition: "rule-of-thirds",
      mood: "friendly",
    },
    description: "Lifestyle influencer tarzı, gerçekçi ve yakın hisli",
  },
  INSTAGRAM_MINIMAL: {
    name: "Instagram Minimal Chic",
    platform: "Instagram",
    settings: {
      visualStyle: "minimalist",
      textOverlay: "none",
      colorScheme: "muted",
      composition: "centered",
      mood: "calm",
    },
    description: "Apple tarzı minimal estetik, premium markalar için",
  },

  // LinkedIn Presets
  LINKEDIN_CORPORATE: {
    name: "LinkedIn Corporate",
    platform: "LinkedIn",
    settings: {
      visualStyle: "professional",
      textOverlay: "moderate",
      colorScheme: "brand",
      composition: "balanced",
      mood: "professional",
    },
    description: "B2B odaklı, güvenilir kurumsal görünüm",
  },
  LINKEDIN_THOUGHT_LEADER: {
    name: "LinkedIn Thought Leadership",
    platform: "LinkedIn",
    settings: {
      visualStyle: "editorial",
      textOverlay: "prominent",
      colorScheme: "monochrome",
      composition: "rule-of-thirds",
      mood: "professional",
    },
    description: "Editöryal kalite, fikir liderliği içerikler için",
  },

  // Facebook Presets
  FACEBOOK_ENGAGING: {
    name: "Facebook Engagement Driver",
    platform: "Facebook",
    settings: {
      visualStyle: "creative",
      textOverlay: "moderate",
      colorScheme: "vibrant",
      composition: "dynamic",
      mood: "energetic",
    },
    description: "Yüksek engagement için optimize, dikkat çekici",
  },

  // X (Twitter) Presets
  X_VIRAL: {
    name: "X Viral Punch",
    platform: "X",
    settings: {
      visualStyle: "creative",
      textOverlay: "prominent",
      colorScheme: "vibrant",
      composition: "centered",
      mood: "energetic",
    },
    description: "Viral potansiyeli yüksek, hızlı tüketim için optimize",
  },

  // Universal Premium
  PREMIUM_LUXURY: {
    name: "Premium Luxury Brand",
    platform: "Universal",
    settings: {
      visualStyle: "editorial",
      textOverlay: "none",
      colorScheme: "monochrome",
      composition: "rule-of-thirds",
      mood: "luxury",
    },
    description: "High-end lüks markalar için mükemmel",
  },
};

// ═══════════════════════════════════════════════════════════════
// 📊 KULLANIM ÖRNEKLERİ
// ═══════════════════════════════════════════════════════════════

export const USAGE_EXAMPLES = {
  basic: {
    title: "Temel Kullanım (Varsayılan Ayarlarla)",
    code: `
fetch('/api/admin/ai/gemini/content-visualize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: 'chat-id-here',
    message: 'Lüks bir ürün lansmanı için Instagram görseli oluştur',
    contentId: 'content-id-here',
    // settings belirtilmezse varsayılanlar kullanılır
  })
})`,
  },

  advanced: {
    title: "Gelişmiş Kullanım (Özel Ayarlarla)",
    code: `
fetch('/api/admin/ai/gemini/content-visualize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: 'chat-id-here',
    message: 'Kurumsal bir duyuru görseli hazırla',
    contentId: 'content-id-here',
    settings: {
      visualStyle: 'professional',     // Kurumsal stil
      textOverlay: 'moderate',          // Orta seviye yazı
      colorScheme: 'brand',             // Marka renkleri
      composition: 'balanced',          // Dengeli kompozisyon
      mood: 'professional',             // Profesyonel mood
      aspectRatio: '16:9',              // LinkedIn için
      imageSize: '2K',                  // Yüksek kalite
    }
  })
})`,
  },

  preset: {
    title: "Preset Kullanımı",
    code: `
import { PRESET_COMBINATIONS } from '@/config/visual-generation-settings';

const preset = PRESET_COMBINATIONS.INSTAGRAM_MINIMAL;

fetch('/api/admin/ai/gemini/content-visualize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: 'chat-id-here',
    message: 'Minimal bir ürün showcase görseli',
    contentId: 'content-id-here',
    settings: preset.settings
  })
})`,
  },
};

// ═══════════════════════════════════════════════════════════════
// 🎨 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Platform'a göre önerilen preset'leri getir
 */
export function getRecommendedPresets(platform) {
  const platformLower = platform.toLowerCase();
  return Object.entries(PRESET_COMBINATIONS)
    .filter(([_, preset]) => 
      preset.platform === "Universal" || 
      preset.platform.toLowerCase().includes(platformLower)
    )
    .map(([key, preset]) => ({ key, ...preset }));
}

/**
 * Varsayılan ayarları getir
 */
export function getDefaultSettings(platform = "", contentType = "") {
  const defaults = {
    visualStyle: "auto",
    textOverlay: "minimal",
    colorScheme: "brand",
    composition: "balanced",
    mood: "professional",
    imageSize: "2K",
  };

  // Platform-specific defaults
  if (platform.toLowerCase().includes("instagram")) {
    defaults.aspectRatio = contentType === "story" ? "9:16" : "1:1";
  } else if (platform.toLowerCase().includes("facebook")) {
    defaults.aspectRatio = "16:9";
  } else if (platform.toLowerCase().includes("linkedin")) {
    defaults.aspectRatio = "16:9";
  } else {
    defaults.aspectRatio = "1:1";
  }

  return defaults;
}

/**
 * Setting validasyonu yap
 */
export function validateSettings(settings) {
  const validVisualStyles = Object.values(VISUAL_STYLES).map(s => s.value);
  const validTextOverlays = Object.values(TEXT_OVERLAY_OPTIONS).map(s => s.value);
  const validColorSchemes = Object.values(COLOR_SCHEMES).map(s => s.value);
  const validCompositions = Object.values(COMPOSITION_STYLES).map(s => s.value);
  const validMoods = Object.values(MOOD_OPTIONS).map(s => s.value);
  const validSizes = Object.values(IMAGE_SIZES).map(s => s.value);
  const validAspectRatios = Object.values(ASPECT_RATIOS).map(s => s.value);

  const errors = [];

  if (settings.visualStyle && !validVisualStyles.includes(settings.visualStyle)) {
    errors.push(`Invalid visualStyle: ${settings.visualStyle}`);
  }
  if (settings.textOverlay && !validTextOverlays.includes(settings.textOverlay)) {
    errors.push(`Invalid textOverlay: ${settings.textOverlay}`);
  }
  if (settings.colorScheme && !validColorSchemes.includes(settings.colorScheme)) {
    errors.push(`Invalid colorScheme: ${settings.colorScheme}`);
  }
  if (settings.composition && !validCompositions.includes(settings.composition)) {
    errors.push(`Invalid composition: ${settings.composition}`);
  }
  if (settings.mood && !validMoods.includes(settings.mood)) {
    errors.push(`Invalid mood: ${settings.mood}`);
  }
  if (settings.imageSize && !validSizes.includes(settings.imageSize)) {
    errors.push(`Invalid imageSize: ${settings.imageSize}`);
  }
  if (settings.aspectRatio && !validAspectRatios.includes(settings.aspectRatio)) {
    errors.push(`Invalid aspectRatio: ${settings.aspectRatio}`);
  }

  return { valid: errors.length === 0, errors };
}

export default {
  VISUAL_STYLES,
  TEXT_OVERLAY_OPTIONS,
  COLOR_SCHEMES,
  COMPOSITION_STYLES,
  MOOD_OPTIONS,
  IMAGE_SIZES,
  ASPECT_RATIOS,
  PRESET_COMBINATIONS,
  USAGE_EXAMPLES,
  getRecommendedPresets,
  getDefaultSettings,
  validateSettings,
};
