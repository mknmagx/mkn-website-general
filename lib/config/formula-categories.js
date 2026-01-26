/**
 * Professional Formula Generation Configuration
 * =============================================
 * Kozmetik, Dermokozmetik, Temizlik ve Gıda Takviyesi üretimi için
 * kapsamlı kategori, alt kategori ve formül parametreleri
 * 
 * @version 2.0
 * @author MKN Group R&D
 */

// ============================================================================
// ANA KATEGORİLER
// ============================================================================
export const MAIN_CATEGORIES = {
  COSMETIC: {
    id: "cosmetic",
    name: "Kozmetik",
    nameEn: "Cosmetics",
    icon: "✨",
    color: "pink",
    gradient: "from-pink-500 to-rose-500",
    description: "Cilt bakım, makyaj, saç bakım ve vücut bakım ürünleri",
  },
  DERMOCOSMETIC: {
    id: "dermocosmetic",
    name: "Dermokozmetik",
    nameEn: "Dermocosmetics",
    icon: "🔬",
    color: "purple",
    gradient: "from-purple-500 to-indigo-500",
    description: "Dermatolojik testli, klinik onaylı cilt bakım ürünleri",
  },
  CLEANING: {
    id: "cleaning",
    name: "Temizlik Ürünleri",
    nameEn: "Cleaning Products",
    icon: "🧴",
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    description: "Ev, endüstriyel ve kişisel hijyen ürünleri",
  },
  SUPPLEMENT: {
    id: "supplement",
    name: "Gıda Takviyesi",
    nameEn: "Dietary Supplements",
    icon: "💊",
    color: "green",
    gradient: "from-green-500 to-emerald-500",
    description: "Kapsül, tablet, toz, sıvı ve saşe formülasyonları",
  },
};

// ============================================================================
// ALT KATEGORİLER - KOZMETİK
// ============================================================================
export const COSMETIC_SUBCATEGORIES = {
  SKINCARE: {
    id: "skincare",
    name: "Cilt Bakım",
    icon: "🧴",
    products: [
      { id: "moisturizer", name: "Nemlendirici Krem", defaultVolume: 50, unit: "ml" },
      { id: "serum", name: "Serum", defaultVolume: 30, unit: "ml" },
      { id: "toner", name: "Tonik", defaultVolume: 200, unit: "ml" },
      { id: "cleanser", name: "Yüz Temizleyici", defaultVolume: 150, unit: "ml" },
      { id: "mask", name: "Yüz Maskesi", defaultVolume: 75, unit: "ml" },
      { id: "eye_cream", name: "Göz Kremi", defaultVolume: 15, unit: "ml" },
      { id: "night_cream", name: "Gece Kremi", defaultVolume: 50, unit: "ml" },
      { id: "day_cream", name: "Gündüz Kremi", defaultVolume: 50, unit: "ml" },
      { id: "peeling", name: "Peeling", defaultVolume: 50, unit: "ml" },
      { id: "micellar", name: "Misel Su", defaultVolume: 400, unit: "ml" },
    ],
  },
  HAIRCARE: {
    id: "haircare",
    name: "Saç Bakım",
    icon: "💇",
    products: [
      { id: "shampoo", name: "Şampuan", defaultVolume: 400, unit: "ml" },
      { id: "conditioner", name: "Saç Kremi", defaultVolume: 300, unit: "ml" },
      { id: "hair_mask", name: "Saç Maskesi", defaultVolume: 250, unit: "ml" },
      { id: "hair_serum", name: "Saç Serumu", defaultVolume: 100, unit: "ml" },
      { id: "hair_oil", name: "Saç Yağı", defaultVolume: 100, unit: "ml" },
      { id: "leave_in", name: "Durulanmayan Bakım", defaultVolume: 200, unit: "ml" },
      { id: "scalp_treatment", name: "Saç Derisi Bakımı", defaultVolume: 100, unit: "ml" },
    ],
  },
  BODYCARE: {
    id: "bodycare",
    name: "Vücut Bakım",
    icon: "🧴",
    products: [
      { id: "body_lotion", name: "Vücut Losyonu", defaultVolume: 250, unit: "ml" },
      { id: "body_cream", name: "Vücut Kremi", defaultVolume: 200, unit: "ml" },
      { id: "body_oil", name: "Vücut Yağı", defaultVolume: 150, unit: "ml" },
      { id: "shower_gel", name: "Duş Jeli", defaultVolume: 400, unit: "ml" },
      { id: "body_scrub", name: "Vücut Peelingi", defaultVolume: 200, unit: "ml" },
      { id: "hand_cream", name: "El Kremi", defaultVolume: 75, unit: "ml" },
      { id: "foot_cream", name: "Ayak Kremi", defaultVolume: 75, unit: "ml" },
    ],
  },
  SUNCARE: {
    id: "suncare",
    name: "Güneş Bakım",
    icon: "☀️",
    products: [
      { id: "sunscreen_face", name: "Yüz Güneş Kremi", defaultVolume: 50, unit: "ml" },
      { id: "sunscreen_body", name: "Vücut Güneş Kremi", defaultVolume: 200, unit: "ml" },
      { id: "sunscreen_spray", name: "Güneş Spreyi", defaultVolume: 200, unit: "ml" },
      { id: "after_sun", name: "Güneş Sonrası Bakım", defaultVolume: 200, unit: "ml" },
      { id: "tanning_oil", name: "Bronzlaştırıcı Yağ", defaultVolume: 150, unit: "ml" },
    ],
  },
  MAKEUP: {
    id: "makeup",
    name: "Makyaj",
    icon: "💄",
    products: [
      { id: "foundation", name: "Fondöten", defaultVolume: 30, unit: "ml" },
      { id: "bb_cream", name: "BB Krem", defaultVolume: 40, unit: "ml" },
      { id: "cc_cream", name: "CC Krem", defaultVolume: 40, unit: "ml" },
      { id: "primer", name: "Primer", defaultVolume: 30, unit: "ml" },
      { id: "concealer", name: "Kapatıcı", defaultVolume: 10, unit: "ml" },
      { id: "setting_spray", name: "Makyaj Sabitleyici", defaultVolume: 100, unit: "ml" },
    ],
  },
  MENS: {
    id: "mens",
    name: "Erkek Bakım",
    icon: "🧔",
    products: [
      { id: "beard_oil", name: "Sakal Yağı", defaultVolume: 30, unit: "ml" },
      { id: "aftershave", name: "Tıraş Sonrası Losyon", defaultVolume: 100, unit: "ml" },
      { id: "shaving_gel", name: "Tıraş Jeli", defaultVolume: 200, unit: "ml" },
      { id: "face_wash_men", name: "Erkek Yüz Yıkama", defaultVolume: 150, unit: "ml" },
      { id: "hair_wax", name: "Saç Şekillendirici", defaultVolume: 100, unit: "g" },
    ],
  },
  BABY: {
    id: "baby",
    name: "Bebek Bakım",
    icon: "👶",
    products: [
      { id: "baby_shampoo", name: "Bebek Şampuanı", defaultVolume: 300, unit: "ml" },
      { id: "baby_lotion", name: "Bebek Losyonu", defaultVolume: 200, unit: "ml" },
      { id: "diaper_cream", name: "Pişik Kremi", defaultVolume: 100, unit: "ml" },
      { id: "baby_oil", name: "Bebek Yağı", defaultVolume: 200, unit: "ml" },
      { id: "baby_powder", name: "Bebek Pudrası", defaultVolume: 100, unit: "g" },
    ],
  },
};

// ============================================================================
// ALT KATEGORİLER - DERMOKOZMETİK
// ============================================================================
export const DERMOCOSMETIC_SUBCATEGORIES = {
  ANTI_AGING: {
    id: "anti_aging",
    name: "Anti-Aging",
    icon: "⏳",
    products: [
      { id: "retinol_serum", name: "Retinol Serum", defaultVolume: 30, unit: "ml" },
      { id: "peptide_cream", name: "Peptit Kremi", defaultVolume: 50, unit: "ml" },
      { id: "collagen_booster", name: "Kolajen Destekleyici", defaultVolume: 30, unit: "ml" },
      { id: "wrinkle_filler", name: "Kırışıklık Doldurucu", defaultVolume: 15, unit: "ml" },
      { id: "firming_serum", name: "Sıkılaştırıcı Serum", defaultVolume: 30, unit: "ml" },
    ],
  },
  BRIGHTENING: {
    id: "brightening",
    name: "Aydınlatıcı",
    icon: "✨",
    products: [
      { id: "vitamin_c_serum", name: "C Vitamini Serum", defaultVolume: 30, unit: "ml" },
      { id: "niacinamide_serum", name: "Niasinamid Serum", defaultVolume: 30, unit: "ml" },
      { id: "spot_corrector", name: "Leke Giderici", defaultVolume: 30, unit: "ml" },
      { id: "brightening_cream", name: "Aydınlatıcı Krem", defaultVolume: 50, unit: "ml" },
      { id: "dark_circle", name: "Göz Altı Aydınlatıcı", defaultVolume: 15, unit: "ml" },
    ],
  },
  ACNE: {
    id: "acne",
    name: "Akne Bakımı",
    icon: "🎯",
    products: [
      { id: "salicylic_cleanser", name: "Salisilik Asit Temizleyici", defaultVolume: 200, unit: "ml" },
      { id: "acne_serum", name: "Akne Serumu", defaultVolume: 30, unit: "ml" },
      { id: "spot_treatment", name: "Sivilce Tedavisi", defaultVolume: 15, unit: "ml" },
      { id: "pore_minimizer", name: "Gözenek Sıkılaştırıcı", defaultVolume: 30, unit: "ml" },
      { id: "oil_control", name: "Yağ Kontrol Kremi", defaultVolume: 50, unit: "ml" },
    ],
  },
  SENSITIVE: {
    id: "sensitive",
    name: "Hassas Cilt",
    icon: "🌸",
    products: [
      { id: "gentle_cleanser", name: "Hassas Cilt Temizleyici", defaultVolume: 200, unit: "ml" },
      { id: "calming_serum", name: "Yatıştırıcı Serum", defaultVolume: 30, unit: "ml" },
      { id: "barrier_repair", name: "Bariyer Onarıcı", defaultVolume: 50, unit: "ml" },
      { id: "redness_relief", name: "Kızarıklık Giderici", defaultVolume: 30, unit: "ml" },
      { id: "soothing_cream", name: "Yatıştırıcı Krem", defaultVolume: 50, unit: "ml" },
    ],
  },
  HYDRATION: {
    id: "hydration",
    name: "Yoğun Nemlendirme",
    icon: "💧",
    products: [
      { id: "hyaluronic_serum", name: "Hyaluronik Asit Serum", defaultVolume: 30, unit: "ml" },
      { id: "hydrating_mask", name: "Nemlendirici Maske", defaultVolume: 75, unit: "ml" },
      { id: "ceramide_cream", name: "Seramid Kremi", defaultVolume: 50, unit: "ml" },
      { id: "hydra_boost", name: "Hydra Boost Serum", defaultVolume: 30, unit: "ml" },
      { id: "aqua_gel", name: "Aqua Jel", defaultVolume: 50, unit: "ml" },
    ],
  },
  MEDICAL: {
    id: "medical",
    name: "Medikal Dermatoloji",
    icon: "🏥",
    products: [
      { id: "post_procedure", name: "İşlem Sonrası Bakım", defaultVolume: 50, unit: "ml" },
      { id: "scar_treatment", name: "İz Giderici", defaultVolume: 30, unit: "ml" },
      { id: "eczema_care", name: "Egzama Bakımı", defaultVolume: 100, unit: "ml" },
      { id: "psoriasis_care", name: "Sedef Bakımı", defaultVolume: 100, unit: "ml" },
      { id: "wound_healing", name: "Yara İyileştirici", defaultVolume: 50, unit: "ml" },
    ],
  },
};

// ============================================================================
// ALT KATEGORİLER - TEMİZLİK ÜRÜNLERİ
// ============================================================================
export const CLEANING_SUBCATEGORIES = {
  HOUSEHOLD: {
    id: "household",
    name: "Ev Temizliği",
    icon: "🏠",
    products: [
      { id: "multi_surface", name: "Çok Amaçlı Temizleyici", defaultVolume: 500, unit: "ml" },
      { id: "glass_cleaner", name: "Cam Temizleyici", defaultVolume: 500, unit: "ml" },
      { id: "floor_cleaner", name: "Yer Temizleyici", defaultVolume: 1000, unit: "ml" },
      { id: "bathroom_cleaner", name: "Banyo Temizleyici", defaultVolume: 750, unit: "ml" },
      { id: "kitchen_cleaner", name: "Mutfak Temizleyici", defaultVolume: 750, unit: "ml" },
      { id: "disinfectant", name: "Dezenfektan", defaultVolume: 500, unit: "ml" },
    ],
  },
  LAUNDRY: {
    id: "laundry",
    name: "Çamaşır Ürünleri",
    icon: "👕",
    products: [
      { id: "liquid_detergent", name: "Sıvı Deterjan", defaultVolume: 3000, unit: "ml" },
      { id: "powder_detergent", name: "Toz Deterjan", defaultVolume: 4000, unit: "g" },
      { id: "fabric_softener", name: "Yumuşatıcı", defaultVolume: 2000, unit: "ml" },
      { id: "stain_remover", name: "Leke Çıkarıcı", defaultVolume: 500, unit: "ml" },
      { id: "color_protect", name: "Renk Koruyucu", defaultVolume: 1000, unit: "ml" },
    ],
  },
  DISHWASHING: {
    id: "dishwashing",
    name: "Bulaşık Ürünleri",
    icon: "🍽️",
    products: [
      { id: "dish_liquid", name: "Bulaşık Deterjanı", defaultVolume: 750, unit: "ml" },
      { id: "dishwasher_tablet", name: "Makine Tableti", defaultVolume: 500, unit: "g" },
      { id: "rinse_aid", name: "Parlatıcı", defaultVolume: 500, unit: "ml" },
      { id: "dish_gel", name: "Bulaşık Jeli", defaultVolume: 1000, unit: "ml" },
    ],
  },
  PERSONAL_HYGIENE: {
    id: "personal_hygiene",
    name: "Kişisel Hijyen",
    icon: "🧼",
    products: [
      { id: "liquid_soap", name: "Sıvı Sabun", defaultVolume: 500, unit: "ml" },
      { id: "antibacterial_soap", name: "Antibakteriyel Sabun", defaultVolume: 500, unit: "ml" },
      { id: "hand_sanitizer", name: "El Dezenfektanı", defaultVolume: 250, unit: "ml" },
      { id: "intimate_wash", name: "Genital Bölge Temizleyici", defaultVolume: 250, unit: "ml" },
    ],
  },
  INDUSTRIAL: {
    id: "industrial",
    name: "Endüstriyel Temizlik",
    icon: "🏭",
    products: [
      { id: "degreaser", name: "Yağ Çözücü", defaultVolume: 5000, unit: "ml" },
      { id: "industrial_disinfectant", name: "Endüstriyel Dezenfektan", defaultVolume: 5000, unit: "ml" },
      { id: "machine_cleaner", name: "Makine Temizleyici", defaultVolume: 5000, unit: "ml" },
      { id: "heavy_duty", name: "Ağır Kir Çözücü", defaultVolume: 5000, unit: "ml" },
    ],
  },
};

// ============================================================================
// ALT KATEGORİLER - GIDA TAKVİYESİ
// ============================================================================
export const SUPPLEMENT_SUBCATEGORIES = {
  CAPSULE: {
    id: "capsule",
    name: "Kapsül",
    icon: "💊",
    formTypes: ["hard_capsule", "softgel"],
    products: [
      { id: "vitamin_d3", name: "D3 Vitamini", defaultDose: 1000, unit: "IU", capsuleCount: 60 },
      { id: "vitamin_c", name: "C Vitamini", defaultDose: 1000, unit: "mg", capsuleCount: 60 },
      { id: "omega3", name: "Omega-3", defaultDose: 1000, unit: "mg", capsuleCount: 90 },
      { id: "multivitamin", name: "Multivitamin", defaultDose: 1, unit: "tablet", capsuleCount: 60 },
      { id: "b_complex", name: "B Kompleks", defaultDose: 1, unit: "tablet", capsuleCount: 60 },
      { id: "iron", name: "Demir", defaultDose: 28, unit: "mg", capsuleCount: 60 },
      { id: "zinc", name: "Çinko", defaultDose: 15, unit: "mg", capsuleCount: 60 },
      { id: "magnesium", name: "Magnezyum", defaultDose: 400, unit: "mg", capsuleCount: 60 },
      { id: "probiotics", name: "Probiyotik", defaultDose: 10, unit: "B CFU", capsuleCount: 30 },
      { id: "coenzyme_q10", name: "Koenzim Q10", defaultDose: 100, unit: "mg", capsuleCount: 60 },
    ],
  },
  SOFTGEL: {
    id: "softgel",
    name: "Softgel",
    icon: "🔵",
    formTypes: ["standard_softgel", "vegetarian_softgel", "enteric_softgel"],
    products: [
      { id: "omega3_softgel", name: "Omega-3 Softgel", defaultDose: 1000, unit: "mg", softgelCount: 90 },
      { id: "vitamin_d3_softgel", name: "D3 Vitamini Softgel", defaultDose: 5000, unit: "IU", softgelCount: 60 },
      { id: "vitamin_e_softgel", name: "E Vitamini Softgel", defaultDose: 400, unit: "IU", softgelCount: 60 },
      { id: "coq10_softgel", name: "Koenzim Q10 Softgel", defaultDose: 100, unit: "mg", softgelCount: 60 },
      { id: "fish_oil", name: "Balık Yağı", defaultDose: 1000, unit: "mg", softgelCount: 90 },
      { id: "krill_oil", name: "Krill Yağı", defaultDose: 500, unit: "mg", softgelCount: 60 },
      { id: "evening_primrose", name: "Çuha Çiçeği Yağı", defaultDose: 1000, unit: "mg", softgelCount: 60 },
      { id: "flaxseed_oil", name: "Keten Tohumu Yağı", defaultDose: 1000, unit: "mg", softgelCount: 90 },
      { id: "vitamin_a_softgel", name: "A Vitamini Softgel", defaultDose: 10000, unit: "IU", softgelCount: 60 },
      { id: "astaxanthin", name: "Astaksantin", defaultDose: 12, unit: "mg", softgelCount: 60 },
    ],
  },
  SACHET: {
    id: "sachet",
    name: "Saşe",
    icon: "📦",
    formTypes: ["powder_sachet", "gel_sachet", "liquid_sachet"],
    products: [
      { id: "collagen_sachet", name: "Kolajen Saşe", defaultDose: 10, unit: "g", sachetCount: 30 },
      { id: "vitamin_c_sachet", name: "C Vitamini Saşe", defaultDose: 1000, unit: "mg", sachetCount: 30 },
      { id: "electrolyte", name: "Elektrolit", defaultDose: 5, unit: "g", sachetCount: 20 },
      { id: "fiber_sachet", name: "Lif Saşe", defaultDose: 5, unit: "g", sachetCount: 30 },
      { id: "probiotic_sachet", name: "Probiyotik Saşe", defaultDose: 10, unit: "B CFU", sachetCount: 30 },
    ],
  },
  TABLET: {
    id: "tablet",
    name: "Tablet",
    icon: "💎",
    formTypes: ["effervescent", "chewable", "coated", "sublingual"],
    products: [
      { id: "effervescent_c", name: "Efervesan C", defaultDose: 1000, unit: "mg", tabletCount: 20 },
      { id: "chewable_multi", name: "Çiğnenebilir Multi", defaultDose: 1, unit: "tablet", tabletCount: 60 },
      { id: "calcium_d3", name: "Kalsiyum D3", defaultDose: 600, unit: "mg", tabletCount: 60 },
      { id: "melatonin", name: "Melatonin", defaultDose: 3, unit: "mg", tabletCount: 30 },
      { id: "biotin", name: "Biotin", defaultDose: 5000, unit: "mcg", tabletCount: 60 },
    ],
  },
  POWDER: {
    id: "powder",
    name: "Toz",
    icon: "🥄",
    formTypes: ["protein_powder", "supplement_powder", "meal_replacement"],
    products: [
      { id: "whey_protein", name: "Whey Protein", defaultDose: 30, unit: "g", containerSize: 1000 },
      { id: "plant_protein", name: "Bitkisel Protein", defaultDose: 25, unit: "g", containerSize: 750 },
      { id: "collagen_powder", name: "Kolajen Toz", defaultDose: 10, unit: "g", containerSize: 300 },
      { id: "creatine", name: "Kreatin", defaultDose: 5, unit: "g", containerSize: 300 },
      { id: "bcaa", name: "BCAA", defaultDose: 7, unit: "g", containerSize: 300 },
      { id: "greens_powder", name: "Yeşil Toz", defaultDose: 10, unit: "g", containerSize: 300 },
    ],
  },
  LIQUID: {
    id: "liquid",
    name: "Sıvı",
    icon: "🧪",
    formTypes: ["syrup", "drops", "ampoule", "shot"],
    products: [
      { id: "iron_syrup", name: "Demir Şurubu", defaultDose: 10, unit: "ml", bottleSize: 250 },
      { id: "vitamin_d_drops", name: "D Vitamini Damla", defaultDose: 5, unit: "damla", bottleSize: 30 },
      { id: "collagen_shot", name: "Kolajen Shot", defaultDose: 25, unit: "ml", shotCount: 30 },
      { id: "ginseng_ampoule", name: "Ginseng Ampul", defaultDose: 10, unit: "ml", ampouleCount: 20 },
      { id: "multivitamin_syrup", name: "Multi Şurup", defaultDose: 10, unit: "ml", bottleSize: 250 },
    ],
  },
};

// ============================================================================
// FORMÜL SEVİYELERİ - GELİŞMİŞ
// ============================================================================
export const FORMULA_LEVELS = {
  1: {
    name: "Temel",
    nameEn: "Basic",
    tier: "economy",
    description: "En temel hammaddeler, düşük maliyet odaklı",
    ingredientCount: { min: 6, max: 10 },
    activeCount: { min: 0, max: 1 },
    quality: "standard",
    priceMultiplier: 0.6,
    features: ["Temel hammaddeler", "Standart kalite", "Düşük maliyet"],
  },
  2: {
    name: "Ekonomik",
    nameEn: "Economic",
    tier: "economy",
    description: "Uygun fiyatlı, günlük kullanım için ideal",
    ingredientCount: { min: 8, max: 12 },
    activeCount: { min: 1, max: 2 },
    quality: "standard",
    priceMultiplier: 0.7,
    features: ["Ekonomik formül", "Temel aktifler", "Günlük kullanım"],
  },
  3: {
    name: "Standart",
    nameEn: "Standard",
    tier: "economy",
    description: "Kalite-fiyat dengesi optimize edilmiş",
    ingredientCount: { min: 10, max: 14 },
    activeCount: { min: 1, max: 2 },
    quality: "good",
    priceMultiplier: 0.8,
    features: ["Dengeli formül", "İyi etkinlik", "Uygun fiyat"],
  },
  4: {
    name: "İyi",
    nameEn: "Good",
    tier: "mid",
    description: "Kaliteli hammaddeler, güvenilir etkinlik",
    ingredientCount: { min: 12, max: 16 },
    activeCount: { min: 2, max: 3 },
    quality: "good",
    priceMultiplier: 0.9,
    features: ["Kaliteli hammaddeler", "Etkin formül", "Güvenilir sonuçlar"],
  },
  5: {
    name: "İyi+",
    nameEn: "Good Plus",
    tier: "mid",
    description: "Orta-üst segment için ideal denge",
    ingredientCount: { min: 14, max: 18 },
    activeCount: { min: 2, max: 4 },
    quality: "high",
    priceMultiplier: 1.0,
    features: ["Optimize formül", "Çoklu aktifler", "Orta-üst segment"],
  },
  6: {
    name: "Premium",
    nameEn: "Premium",
    tier: "mid",
    description: "Yüksek kaliteli aktifler ve hammaddeler",
    ingredientCount: { min: 16, max: 20 },
    activeCount: { min: 3, max: 5 },
    quality: "high",
    priceMultiplier: 1.15,
    features: ["Yüksek kalite", "Çoklu aktifler", "Premium hammaddeler"],
  },
  7: {
    name: "Premium+",
    nameEn: "Premium Plus",
    tier: "premium",
    description: "İleri seviye aktifler, profesyonel formülasyon",
    ingredientCount: { min: 18, max: 22 },
    activeCount: { min: 4, max: 6 },
    quality: "premium",
    priceMultiplier: 1.35,
    features: ["İleri aktifler", "Profesyonel düzey", "Yüksek etkinlik"],
  },
  8: {
    name: "Lüks",
    nameEn: "Luxury",
    tier: "premium",
    description: "Lüks segment için özel hammaddeler",
    ingredientCount: { min: 20, max: 25 },
    activeCount: { min: 5, max: 7 },
    quality: "premium",
    priceMultiplier: 1.6,
    features: ["Lüks hammaddeler", "Özel formülasyon", "Maksimum etkinlik"],
  },
  9: {
    name: "Ultra Lüks",
    nameEn: "Ultra Luxury",
    tier: "luxury",
    description: "En yüksek kalite hammaddeler, peptitler",
    ingredientCount: { min: 22, max: 28 },
    activeCount: { min: 6, max: 8 },
    quality: "ultra-premium",
    priceMultiplier: 2.0,
    features: ["Ultra premium", "Peptitler", "Biyoteknoloji"],
  },
  10: {
    name: "Prestige",
    nameEn: "Prestige",
    tier: "luxury",
    description: "Endüstri lideri, en inovatif formülasyon",
    ingredientCount: { min: 25, max: 35 },
    activeCount: { min: 8, max: 12 },
    quality: "ultra-premium",
    priceMultiplier: 2.5,
    features: ["Endüstri lideri", "En inovatif", "Sınırsız kalite"],
  },
};

// ============================================================================
// HAMMADDE KALİTESİ SEVİYELERİ
// ============================================================================
export const INGREDIENT_QUALITY_LEVELS = {
  standard: {
    id: "standard",
    name: "Standart",
    description: "Genel kullanım kalitesi",
    priceMultiplier: 1.0,
  },
  pharmaceutical: {
    id: "pharmaceutical",
    name: "Farmasötik Grade",
    description: "İlaç sınıfı saflık",
    priceMultiplier: 1.5,
  },
  organic: {
    id: "organic",
    name: "Organik",
    description: "Organik sertifikalı",
    priceMultiplier: 1.8,
  },
  natural: {
    id: "natural",
    name: "Doğal",
    description: "Doğal kaynaklı",
    priceMultiplier: 1.3,
  },
  vegan: {
    id: "vegan",
    name: "Vegan",
    description: "Vegan sertifikalı",
    priceMultiplier: 1.4,
  },
  halal: {
    id: "halal",
    name: "Helal",
    description: "Helal sertifikalı",
    priceMultiplier: 1.2,
  },
  kosher: {
    id: "kosher",
    name: "Koşer",
    description: "Koşer sertifikalı",
    priceMultiplier: 1.3,
  },
};

// ============================================================================
// HIZLI ŞABLONLAR / PRESETS
// ============================================================================
export const FORMULA_PRESETS = {
  // Kozmetik Presets
  antiaging_serum: {
    name: "Anti-Aging Serum",
    category: "dermocosmetic",
    subcategory: "anti_aging",
    productType: "retinol_serum",
    level: 8,
    volume: 30,
    description: "Kırışıklık karşıtı, sıkılaştırıcı serum formülü",
    suggestedActives: ["Retinol", "Peptide Complex", "Vitamin E", "Niacinamide"],
  },
  hydrating_cream: {
    name: "Yoğun Nemlendirici Krem",
    category: "cosmetic",
    subcategory: "skincare",
    productType: "moisturizer",
    level: 6,
    volume: 50,
    description: "Derin nemlendirme sağlayan günlük krem",
    suggestedActives: ["Hyaluronic Acid", "Ceramides", "Glycerin", "Squalane"],
  },
  vitamin_c_brightening: {
    name: "C Vitamini Aydınlatıcı",
    category: "dermocosmetic",
    subcategory: "brightening",
    productType: "vitamin_c_serum",
    level: 7,
    volume: 30,
    description: "Leke giderici, cilt tonunu eşitleyen serum",
    suggestedActives: ["L-Ascorbic Acid", "Niacinamide", "Alpha Arbutin", "Ferulic Acid"],
  },
  // Temizlik Presets
  eco_multipurpose: {
    name: "Eko Çok Amaçlı",
    category: "cleaning",
    subcategory: "household",
    productType: "multi_surface",
    level: 5,
    volume: 500,
    description: "Çevre dostu, doğal içerikli temizleyici",
    suggestedActives: ["Citric Acid", "Plant Surfactants", "Essential Oils"],
  },
  // Supplement Presets
  collagen_beauty: {
    name: "Kolajen Güzellik",
    category: "supplement",
    subcategory: "sachet",
    productType: "collagen_sachet",
    level: 7,
    volume: 10,
    description: "Marine kolajen, hyaluronik asit destekli",
    suggestedActives: ["Marine Collagen", "Hyaluronic Acid", "Vitamin C", "Biotin"],
  },
  immunity_boost: {
    name: "Bağışıklık Desteği",
    category: "supplement",
    subcategory: "capsule",
    productType: "vitamin_c",
    level: 6,
    volume: 1,
    description: "C vitamini, çinko ve sambucus içeren formül",
    suggestedActives: ["Vitamin C", "Zinc", "Elderberry Extract", "Vitamin D3"],
  },
};

// ============================================================================
// ÖZEL GEREKSİNİMLER / SERTİFİKASYONLAR
// ============================================================================
export const CERTIFICATIONS = {
  vegan: { id: "vegan", name: "Vegan", icon: "🌱" },
  halal: { id: "halal", name: "Helal", icon: "☪️" },
  organic: { id: "organic", name: "Organik", icon: "🍃" },
  cruelty_free: { id: "cruelty_free", name: "Hayvan Testinden Geçmemiş", icon: "🐰" },
  gmp: { id: "gmp", name: "GMP", icon: "✅" },
  iso22716: { id: "iso22716", name: "ISO 22716", icon: "📋" },
  natural: { id: "natural", name: "Doğal", icon: "🌿" },
  dermatologically_tested: { id: "dermatologically_tested", name: "Dermatolojik Testli", icon: "🔬" },
  hypoallergenic: { id: "hypoallergenic", name: "Hipoalerjenik", icon: "💠" },
  paraben_free: { id: "paraben_free", name: "Parabensiz", icon: "🚫" },
  sulfate_free: { id: "sulfate_free", name: "Sülfatsız", icon: "⭕" },
  silicone_free: { id: "silicone_free", name: "Silikonsuz", icon: "◯" },
};

// ============================================================================
// HEDEF KİTLE
// ============================================================================
export const TARGET_AUDIENCES = {
  all_skin: { id: "all_skin", name: "Tüm Cilt Tipleri" },
  dry_skin: { id: "dry_skin", name: "Kuru Cilt" },
  oily_skin: { id: "oily_skin", name: "Yağlı Cilt" },
  combination_skin: { id: "combination_skin", name: "Karma Cilt" },
  sensitive_skin: { id: "sensitive_skin", name: "Hassas Cilt" },
  mature_skin: { id: "mature_skin", name: "Olgun Cilt" },
  acne_prone: { id: "acne_prone", name: "Akneye Eğilimli Cilt" },
  baby: { id: "baby", name: "Bebek" },
  children: { id: "children", name: "Çocuk" },
  men: { id: "men", name: "Erkek" },
  women: { id: "women", name: "Kadın" },
  athletes: { id: "athletes", name: "Sporcular" },
  elderly: { id: "elderly", name: "Yaşlılar" },
};

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * Kategoriye göre alt kategorileri döndürür
 */
export function getSubcategoriesByCategory(categoryId) {
  switch (categoryId) {
    case "cosmetic":
      return COSMETIC_SUBCATEGORIES;
    case "dermocosmetic":
      return DERMOCOSMETIC_SUBCATEGORIES;
    case "cleaning":
      return CLEANING_SUBCATEGORIES;
    case "supplement":
      return SUPPLEMENT_SUBCATEGORIES;
    default:
      return {};
  }
}

/**
 * Tüm kategorileri ve alt kategorileri flat liste olarak döndürür
 */
export function getAllProductTypes() {
  const allProducts = [];
  
  Object.entries(COSMETIC_SUBCATEGORIES).forEach(([subKey, sub]) => {
    sub.products.forEach(product => {
      allProducts.push({
        ...product,
        category: "cosmetic",
        subcategory: subKey,
        fullName: `${sub.name} - ${product.name}`,
      });
    });
  });
  
  Object.entries(DERMOCOSMETIC_SUBCATEGORIES).forEach(([subKey, sub]) => {
    sub.products.forEach(product => {
      allProducts.push({
        ...product,
        category: "dermocosmetic",
        subcategory: subKey,
        fullName: `${sub.name} - ${product.name}`,
      });
    });
  });
  
  Object.entries(CLEANING_SUBCATEGORIES).forEach(([subKey, sub]) => {
    sub.products.forEach(product => {
      allProducts.push({
        ...product,
        category: "cleaning",
        subcategory: subKey,
        fullName: `${sub.name} - ${product.name}`,
      });
    });
  });
  
  Object.entries(SUPPLEMENT_SUBCATEGORIES).forEach(([subKey, sub]) => {
    sub.products.forEach(product => {
      allProducts.push({
        ...product,
        category: "supplement",
        subcategory: subKey,
        fullName: `${sub.name} - ${product.name}`,
      });
    });
  });
  
  return allProducts;
}

/**
 * Seviyeye göre spesifikasyon döndürür
 */
export function getLevelSpecs(level) {
  return FORMULA_LEVELS[level] || FORMULA_LEVELS[5];
}

export default {
  MAIN_CATEGORIES,
  COSMETIC_SUBCATEGORIES,
  DERMOCOSMETIC_SUBCATEGORIES,
  CLEANING_SUBCATEGORIES,
  SUPPLEMENT_SUBCATEGORIES,
  FORMULA_LEVELS,
  INGREDIENT_QUALITY_LEVELS,
  FORMULA_PRESETS,
  CERTIFICATIONS,
  TARGET_AUDIENCES,
  getSubcategoriesByCategory,
  getAllProductTypes,
  getLevelSpecs,
};
