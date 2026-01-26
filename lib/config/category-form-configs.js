/**
 * Kategori Bazlı Profesyonel Form Konfigürasyonları
 * ==================================================
 * Her ana kategori için özelleştirilmiş form alanları ve validasyonlar
 * 
 * @version 1.0
 * @author MKN Group R&D
 */

// ============================================================================
// GIDA TAKVİYESİ (SUPPLEMENT) FORM KONFİGÜRASYONU
// ============================================================================
export const SUPPLEMENT_FORM_CONFIG = {
  // Form tipi seçenekleri
  formTypes: {
    capsule: {
      id: "capsule",
      name: "Kapsül",
      icon: "💊",
      description: "Sert veya yumuşak jelatin kapsüller",
      // Kapsül boyutları ve kapasiteleri (mg cinsinden)
      capsuleSizes: {
        "000": { name: "000", capacityMg: 1000, capacityMgMax: 1400, description: "En büyük - 1000-1400mg" },
        "00": { name: "00", capacityMg: 735, capacityMgMax: 950, description: "Çok büyük - 735-950mg" },
        "0": { name: "0", capacityMg: 500, capacityMgMax: 680, description: "Büyük - 500-680mg" },
        "1": { name: "1", capacityMg: 400, capacityMgMax: 500, description: "Orta-büyük - 400-500mg" },
        "2": { name: "2", capacityMg: 300, capacityMgMax: 370, description: "Orta - 300-370mg" },
        "3": { name: "3", capacityMg: 200, capacityMgMax: 270, description: "Küçük-orta - 200-270mg" },
        "4": { name: "4", capacityMg: 145, capacityMgMax: 190, description: "Küçük - 145-190mg" },
        "5": { name: "5", capacityMg: 85, capacityMgMax: 120, description: "Çok küçük - 85-120mg" },
      },
      // Kapsül tipleri
      capsuleTypes: {
        hard_gelatin: { name: "Sert Jelatin", icon: "💊", priceMultiplier: 1.0 },
        softgel: { name: "Softgel", icon: "🔵", priceMultiplier: 1.3 },
        veggie: { name: "Bitkisel (HPMC)", icon: "🌱", priceMultiplier: 1.5 },
        enteric: { name: "Enterik Kaplı", icon: "🛡️", priceMultiplier: 1.8 },
        delayed_release: { name: "Gecikmeli Salınım", icon: "⏰", priceMultiplier: 2.0 },
      },
      // Form alanları
      fields: [
        { id: "capsuleSize", type: "select", label: "Kapsül Boyutu", required: true },
        { id: "capsuleType", type: "select", label: "Kapsül Tipi", required: true },
        { id: "fillWeightMg", type: "number", label: "Dolum Ağırlığı (mg)", required: true, placeholder: "600" },
        { id: "capsuleCount", type: "number", label: "Kutu Başına Kapsül", required: true, placeholder: "60", default: 60 },
        { id: "dailyDose", type: "number", label: "Günlük Doz (kapsül)", required: true, placeholder: "2", default: 2 },
      ],
    },
    tablet: {
      id: "tablet",
      name: "Tablet",
      icon: "💎",
      description: "Tablet formülasyonları",
      // Tablet tipleri
      tabletTypes: {
        standard: { name: "Standart Tablet", icon: "💊", priceMultiplier: 1.0 },
        effervescent: { name: "Efervesan", icon: "🫧", priceMultiplier: 1.4 },
        chewable: { name: "Çiğnenebilir", icon: "🍬", priceMultiplier: 1.2 },
        sublingual: { name: "Dilaltı", icon: "👅", priceMultiplier: 1.6 },
        coated: { name: "Film Kaplı", icon: "✨", priceMultiplier: 1.3 },
        enteric_coated: { name: "Enterik Kaplı", icon: "🛡️", priceMultiplier: 1.7 },
        sustained_release: { name: "Uzun Salınımlı", icon: "⏱️", priceMultiplier: 2.0 },
      },
      // Tablet boyutları
      tabletSizes: {
        mini: { name: "Mini", weightMg: 250, description: "250mg" },
        small: { name: "Küçük", weightMg: 500, description: "500mg" },
        medium: { name: "Orta", weightMg: 750, description: "750mg" },
        standard: { name: "Standart", weightMg: 1000, description: "1000mg" },
        large: { name: "Büyük", weightMg: 1500, description: "1500mg" },
        extra_large: { name: "Ekstra Büyük", weightMg: 2000, description: "2000mg" },
      },
      fields: [
        { id: "tabletType", type: "select", label: "Tablet Tipi", required: true },
        { id: "tabletSize", type: "select", label: "Tablet Boyutu", required: true },
        { id: "tabletWeightMg", type: "number", label: "Tablet Ağırlığı (mg)", required: true, placeholder: "1000" },
        { id: "tabletCount", type: "number", label: "Kutu Başına Tablet", required: true, placeholder: "60", default: 60 },
        { id: "dailyDose", type: "number", label: "Günlük Doz (tablet)", required: true, placeholder: "1", default: 1 },
      ],
    },
    sachet: {
      id: "sachet",
      name: "Saşe",
      icon: "📦",
      description: "Toz veya granül saşe formülasyonları",
      // Saşe tipleri
      sachetTypes: {
        powder: { name: "Toz", icon: "🥄", priceMultiplier: 1.0 },
        granule: { name: "Granül", icon: "🧂", priceMultiplier: 1.2 },
        effervescent_powder: { name: "Efervesan Toz", icon: "🫧", priceMultiplier: 1.4 },
        gel: { name: "Jel", icon: "💧", priceMultiplier: 1.5 },
        orodispersible: { name: "Ağızda Dağılan", icon: "❄️", priceMultiplier: 1.6 },
      },
      // Saşe boyutları
      sachetSizes: {
        mini: { name: "Mini", weightG: 1, description: "1g" },
        small: { name: "Küçük", weightG: 3, description: "3g" },
        medium: { name: "Orta", weightG: 5, description: "5g" },
        standard: { name: "Standart", weightG: 10, description: "10g" },
        large: { name: "Büyük", weightG: 15, description: "15g" },
        extra_large: { name: "Ekstra Büyük", weightG: 30, description: "30g" },
      },
      fields: [
        { id: "sachetType", type: "select", label: "Saşe Tipi", required: true },
        { id: "sachetSize", type: "select", label: "Saşe Boyutu", required: true },
        { id: "sachetWeightG", type: "number", label: "Saşe Ağırlığı (g)", required: true, placeholder: "10" },
        { id: "sachetCount", type: "number", label: "Kutu Başına Saşe", required: true, placeholder: "30", default: 30 },
        { id: "dailyDose", type: "number", label: "Günlük Doz (saşe)", required: true, placeholder: "1", default: 1 },
      ],
    },
    powder: {
      id: "powder",
      name: "Toz",
      icon: "🥄",
      description: "Toz takviye ürünleri (protein, kreatin vb.)",
      // Toz tipleri
      powderTypes: {
        protein: { name: "Protein Tozu", icon: "💪", priceMultiplier: 1.0 },
        supplement: { name: "Takviye Tozu", icon: "⚡", priceMultiplier: 1.2 },
        meal_replacement: { name: "Öğün İkamesi", icon: "🍽️", priceMultiplier: 1.3 },
        pre_workout: { name: "Antrenman Öncesi", icon: "🏋️", priceMultiplier: 1.4 },
        recovery: { name: "Toparlanma", icon: "🔄", priceMultiplier: 1.3 },
        greens: { name: "Yeşillik Tozu", icon: "🥬", priceMultiplier: 1.5 },
      },
      fields: [
        { id: "powderType", type: "select", label: "Toz Tipi", required: true },
        { id: "containerSizeG", type: "number", label: "Kap Boyutu (g)", required: true, placeholder: "1000" },
        { id: "servingSizeG", type: "number", label: "Porsiyon Boyutu (g)", required: true, placeholder: "30" },
        { id: "servingsPerContainer", type: "number", label: "Kap Başına Porsiyon", computed: true },
        { id: "dailyServings", type: "number", label: "Günlük Porsiyon", required: true, placeholder: "1", default: 1 },
      ],
    },
    liquid: {
      id: "liquid",
      name: "Sıvı",
      icon: "🧪",
      description: "Şurup, damla, ampul ve shot formülasyonları",
      // Sıvı tipleri
      liquidTypes: {
        syrup: { name: "Şurup", icon: "🍯", priceMultiplier: 1.0 },
        drops: { name: "Damla", icon: "💧", priceMultiplier: 1.8 },
        ampoule: { name: "Ampul", icon: "💉", priceMultiplier: 2.0 },
        shot: { name: "Shot", icon: "🥤", priceMultiplier: 1.5 },
        spray: { name: "Sprey", icon: "🌬️", priceMultiplier: 1.6 },
        oral_solution: { name: "Oral Solüsyon", icon: "🧴", priceMultiplier: 1.3 },
      },
      fields: [
        { id: "liquidType", type: "select", label: "Sıvı Tipi", required: true },
        { id: "bottleSizeMl", type: "number", label: "Şişe Boyutu (ml)", required: true, placeholder: "250" },
        { id: "servingSizeMl", type: "number", label: "Porsiyon Boyutu (ml)", required: true, placeholder: "10" },
        { id: "servingsPerBottle", type: "number", label: "Şişe Başına Porsiyon", computed: true },
        { id: "dailyDose", type: "number", label: "Günlük Doz (ml)", required: true, placeholder: "10", default: 10 },
      ],
    },
    gummy: {
      id: "gummy",
      name: "Gummy/Jel",
      icon: "🍬",
      description: "Yumuşak jel vitamin ve takviyeleri",
      gummyTypes: {
        standard: { name: "Standart Gummy", icon: "🍬", priceMultiplier: 1.0 },
        sugar_free: { name: "Şekersiz", icon: "🚫", priceMultiplier: 1.3 },
        vegan: { name: "Vegan", icon: "🌱", priceMultiplier: 1.5 },
        pectin_based: { name: "Pektin Bazlı", icon: "🍎", priceMultiplier: 1.4 },
      },
      fields: [
        { id: "gummyType", type: "select", label: "Gummy Tipi", required: true },
        { id: "gummyWeightG", type: "number", label: "Gummy Ağırlığı (g)", required: true, placeholder: "3" },
        { id: "gummyCount", type: "number", label: "Kutu Başına Gummy", required: true, placeholder: "60", default: 60 },
        { id: "dailyDose", type: "number", label: "Günlük Doz (adet)", required: true, placeholder: "2", default: 2 },
      ],
    },
    softgel: {
      id: "softgel",
      name: "Softgel",
      icon: "🔵",
      description: "Yumuşak jelatin kapsüller (yağ bazlı formülasyonlar için ideal)",
      // Softgel boyutları ve kapasiteleri (mg cinsinden)
      softgelSizes: {
        mini: { name: "Mini", capacityMg: 100, capacityMgMax: 200, description: "Çok küçük - 100-200mg" },
        small: { name: "Küçük", capacityMg: 200, capacityMgMax: 400, description: "Küçük - 200-400mg" },
        medium: { name: "Orta", capacityMg: 400, capacityMgMax: 700, description: "Orta - 400-700mg" },
        standard: { name: "Standart", capacityMg: 700, capacityMgMax: 1000, description: "Standart - 700-1000mg" },
        large: { name: "Büyük", capacityMg: 1000, capacityMgMax: 1500, description: "Büyük - 1000-1500mg" },
        oblong: { name: "Oblong", capacityMg: 1200, capacityMgMax: 1800, description: "Oblong - 1200-1800mg" },
      },
      // Softgel tipleri
      softgelTypes: {
        standard: { name: "Standart Softgel", icon: "🔵", priceMultiplier: 1.0 },
        vegetarian: { name: "Vejetaryen Softgel", icon: "🌱", priceMultiplier: 1.8 },
        enteric: { name: "Enterik Kaplı", icon: "🛡️", priceMultiplier: 1.5 },
        chewable: { name: "Çiğnenebilir Softgel", icon: "🍬", priceMultiplier: 1.3 },
        liquid_fill: { name: "Sıvı Dolgulu", icon: "💧", priceMultiplier: 1.2 },
      },
      fields: [
        { id: "softgelSize", type: "select", label: "Softgel Boyutu", required: true },
        { id: "softgelType", type: "select", label: "Softgel Tipi", required: true },
        { id: "fillWeightMg", type: "number", label: "Dolum Ağırlığı (mg)", required: true, placeholder: "1000" },
        { id: "softgelCount", type: "number", label: "Kutu Başına Softgel", required: true, placeholder: "60", default: 60 },
        { id: "dailyDose", type: "number", label: "Günlük Doz (softgel)", required: true, placeholder: "1", default: 1 },
      ],
    },
  },

  // Aktif madde kategorileri (Gıda Takviyesi için)
  activeCategories: {
    vitamins: {
      name: "Vitaminler",
      icon: "💊",
      items: [
        { id: "vitamin_a", name: "A Vitamini", unit: "IU", suggestedDose: "5000", maxDose: "10000" },
        { id: "vitamin_b1", name: "B1 Vitamini (Tiamin)", unit: "mg", suggestedDose: "1.2", maxDose: "100" },
        { id: "vitamin_b2", name: "B2 Vitamini (Riboflavin)", unit: "mg", suggestedDose: "1.3", maxDose: "100" },
        { id: "vitamin_b3", name: "B3 Vitamini (Niasin)", unit: "mg", suggestedDose: "16", maxDose: "35" },
        { id: "vitamin_b5", name: "B5 Vitamini (Pantotenik Asit)", unit: "mg", suggestedDose: "5", maxDose: "100" },
        { id: "vitamin_b6", name: "B6 Vitamini", unit: "mg", suggestedDose: "1.7", maxDose: "100" },
        { id: "vitamin_b7", name: "B7 Vitamini (Biotin)", unit: "mcg", suggestedDose: "30", maxDose: "10000" },
        { id: "vitamin_b9", name: "B9 Vitamini (Folik Asit)", unit: "mcg", suggestedDose: "400", maxDose: "1000" },
        { id: "vitamin_b12", name: "B12 Vitamini", unit: "mcg", suggestedDose: "2.4", maxDose: "5000" },
        { id: "vitamin_c", name: "C Vitamini", unit: "mg", suggestedDose: "90", maxDose: "2000" },
        { id: "vitamin_d3", name: "D3 Vitamini", unit: "IU", suggestedDose: "1000", maxDose: "10000" },
        { id: "vitamin_e", name: "E Vitamini", unit: "IU", suggestedDose: "15", maxDose: "1000" },
        { id: "vitamin_k2", name: "K2 Vitamini", unit: "mcg", suggestedDose: "100", maxDose: "500" },
      ],
    },
    minerals: {
      name: "Mineraller",
      icon: "⚡",
      items: [
        { id: "magnesium", name: "Magnezyum", unit: "mg", suggestedDose: "400", maxDose: "400", forms: ["Magnezyum Bisglisinat", "Magnezyum Sitrat", "Magnezyum Oksit", "Magnezyum Malat", "Magnezyum Taurat", "Magnezyum L-Treonat"] },
        { id: "zinc", name: "Çinko", unit: "mg", suggestedDose: "15", maxDose: "40", forms: ["Çinko Bisglisinat", "Çinko Sitrat", "Çinko Pikolinat", "Çinko Glukonat"] },
        { id: "iron", name: "Demir", unit: "mg", suggestedDose: "18", maxDose: "45", forms: ["Demir Bisglisinat", "Demir Fumarat", "Demir Sülfat"] },
        { id: "calcium", name: "Kalsiyum", unit: "mg", suggestedDose: "1000", maxDose: "2500", forms: ["Kalsiyum Sitrat", "Kalsiyum Karbonat", "Kalsiyum Malat"] },
        { id: "selenium", name: "Selenyum", unit: "mcg", suggestedDose: "55", maxDose: "400" },
        { id: "copper", name: "Bakır", unit: "mg", suggestedDose: "0.9", maxDose: "10" },
        { id: "manganese", name: "Manganez", unit: "mg", suggestedDose: "2.3", maxDose: "11" },
        { id: "chromium", name: "Krom", unit: "mcg", suggestedDose: "35", maxDose: "1000" },
        { id: "iodine", name: "İyot", unit: "mcg", suggestedDose: "150", maxDose: "1100" },
        { id: "potassium", name: "Potasyum", unit: "mg", suggestedDose: "2600", maxDose: "3400" },
      ],
    },
    amino_acids: {
      name: "Amino Asitler",
      icon: "🔬",
      items: [
        { id: "l_glutamine", name: "L-Glutamin", unit: "mg", suggestedDose: "5000", maxDose: "15000" },
        { id: "l_arginine", name: "L-Arjinin", unit: "mg", suggestedDose: "3000", maxDose: "6000" },
        { id: "l_lysine", name: "L-Lizin", unit: "mg", suggestedDose: "1000", maxDose: "3000" },
        { id: "l_carnitine", name: "L-Karnitin", unit: "mg", suggestedDose: "500", maxDose: "2000" },
        { id: "l_tyrosine", name: "L-Tirozin", unit: "mg", suggestedDose: "500", maxDose: "2000" },
        { id: "l_theanine", name: "L-Teanin", unit: "mg", suggestedDose: "200", maxDose: "400" },
        { id: "bcaa", name: "BCAA Kompleks", unit: "mg", suggestedDose: "5000", maxDose: "20000" },
        { id: "taurine", name: "Taurin", unit: "mg", suggestedDose: "1000", maxDose: "3000" },
        { id: "glycine", name: "Glisin", unit: "mg", suggestedDose: "3000", maxDose: "15000" },
      ],
    },
    herbals: {
      name: "Bitkisel Ekstreler",
      icon: "🌿",
      items: [
        { id: "ashwagandha", name: "Ashwagandha", unit: "mg", suggestedDose: "300", maxDose: "600" },
        { id: "rhodiola", name: "Rhodiola Rosea", unit: "mg", suggestedDose: "200", maxDose: "600" },
        { id: "ginseng", name: "Ginseng", unit: "mg", suggestedDose: "200", maxDose: "400" },
        { id: "turmeric", name: "Zerdeçal/Kurkumin", unit: "mg", suggestedDose: "500", maxDose: "2000" },
        { id: "milk_thistle", name: "Deve Dikeni", unit: "mg", suggestedDose: "250", maxDose: "500" },
        { id: "ginkgo", name: "Ginkgo Biloba", unit: "mg", suggestedDose: "120", maxDose: "240" },
        { id: "elderberry", name: "Mürdüm Eriği", unit: "mg", suggestedDose: "500", maxDose: "1000" },
        { id: "echinacea", name: "Ekinezya", unit: "mg", suggestedDose: "400", maxDose: "800" },
        { id: "valerian", name: "Kediotu", unit: "mg", suggestedDose: "300", maxDose: "900" },
        { id: "bacopa", name: "Bacopa Monnieri", unit: "mg", suggestedDose: "300", maxDose: "450" },
      ],
    },
    speciality: {
      name: "Özel Bileşenler",
      icon: "✨",
      items: [
        { id: "collagen", name: "Kolajen", unit: "mg", suggestedDose: "5000", maxDose: "15000", forms: ["Hidrolize Kolajen", "Marine Kolajen", "Tip I Kolajen", "Tip II Kolajen"] },
        { id: "coq10", name: "Koenzim Q10", unit: "mg", suggestedDose: "100", maxDose: "400" },
        { id: "omega3", name: "Omega-3 (EPA/DHA)", unit: "mg", suggestedDose: "1000", maxDose: "3000" },
        { id: "probiotics", name: "Probiyotik", unit: "CFU", suggestedDose: "10B", maxDose: "100B" },
        { id: "hyaluronic_acid", name: "Hyaluronik Asit", unit: "mg", suggestedDose: "100", maxDose: "200" },
        { id: "glucosamine", name: "Glukozamin", unit: "mg", suggestedDose: "1500", maxDose: "3000" },
        { id: "chondroitin", name: "Kondroitin", unit: "mg", suggestedDose: "800", maxDose: "1200" },
        { id: "msm", name: "MSM", unit: "mg", suggestedDose: "1000", maxDose: "3000" },
        { id: "alpha_lipoic_acid", name: "Alfa Lipoik Asit", unit: "mg", suggestedDose: "300", maxDose: "600" },
        { id: "melatonin", name: "Melatonin", unit: "mg", suggestedDose: "3", maxDose: "10" },
        { id: "creatine", name: "Kreatin", unit: "g", suggestedDose: "5", maxDose: "10" },
      ],
    },
  },

  // Elemental vs Total hesaplama için mineral formları
  mineralForms: {
    magnesium: {
      bisglycinate: { name: "Magnezyum Bisglisinat", elementalPercent: 14.1 },
      citrate: { name: "Magnezyum Sitrat", elementalPercent: 16.2 },
      oxide: { name: "Magnezyum Oksit", elementalPercent: 60.3 },
      malate: { name: "Magnezyum Malat", elementalPercent: 15.5 },
      taurate: { name: "Magnezyum Taurat", elementalPercent: 8.9 },
      threonate: { name: "Magnezyum L-Treonat", elementalPercent: 7.2 },
      glycinate: { name: "Magnezyum Glinat", elementalPercent: 14.1 },
    },
    zinc: {
      bisglycinate: { name: "Çinko Bisglisinat", elementalPercent: 25 },
      citrate: { name: "Çinko Sitrat", elementalPercent: 31 },
      picolinate: { name: "Çinko Pikolinat", elementalPercent: 21 },
      gluconate: { name: "Çinko Glukonat", elementalPercent: 14.3 },
      oxide: { name: "Çinko Oksit", elementalPercent: 80 },
    },
    iron: {
      bisglycinate: { name: "Demir Bisglisinat", elementalPercent: 20 },
      fumarate: { name: "Demir Fumarat", elementalPercent: 33 },
      sulfate: { name: "Demir Sülfat", elementalPercent: 20 },
      gluconate: { name: "Demir Glukonat", elementalPercent: 12 },
    },
    calcium: {
      citrate: { name: "Kalsiyum Sitrat", elementalPercent: 21 },
      carbonate: { name: "Kalsiyum Karbonat", elementalPercent: 40 },
      malate: { name: "Kalsiyum Malat", elementalPercent: 13.5 },
      gluconate: { name: "Kalsiyum Glukonat", elementalPercent: 9 },
    },
  },
};

// ============================================================================
// KOZMETİK FORM KONFİGÜRASYONU
// ============================================================================
export const COSMETIC_FORM_CONFIG = {
  // Kozmetik ürün formları
  productForms: {
    cream: { 
      id: "cream", 
      name: "Krem", 
      icon: "🧴",
      texture: "Yarı katı emülsiyon",
      phRange: { min: 4.5, max: 6.5 },
      viscosityRange: { min: 15000, max: 50000, unit: "cP" },
    },
    lotion: { 
      id: "lotion", 
      name: "Losyon", 
      icon: "💧",
      texture: "Akışkan emülsiyon",
      phRange: { min: 4.5, max: 6.5 },
      viscosityRange: { min: 1000, max: 15000, unit: "cP" },
    },
    serum: { 
      id: "serum", 
      name: "Serum", 
      icon: "✨",
      texture: "Sulu veya yağlı bazlı",
      phRange: { min: 3.5, max: 6.5 },
      viscosityRange: { min: 500, max: 5000, unit: "cP" },
    },
    gel: { 
      id: "gel", 
      name: "Jel", 
      icon: "🫧",
      texture: "Şeffaf veya opak jel",
      phRange: { min: 4.0, max: 7.0 },
      viscosityRange: { min: 5000, max: 30000, unit: "cP" },
    },
    oil: { 
      id: "oil", 
      name: "Yağ", 
      icon: "💛",
      texture: "Anhidrik",
      phRange: null, // Yağlar için pH geçersiz
      viscosityRange: { min: 10, max: 500, unit: "cP" },
    },
    foam: { 
      id: "foam", 
      name: "Köpük", 
      icon: "☁️",
      texture: "Aerosol veya pompa",
      phRange: { min: 5.0, max: 7.0 },
    },
    spray: { 
      id: "spray", 
      name: "Sprey", 
      icon: "💨",
      texture: "Sıvı sprey",
      phRange: { min: 4.5, max: 7.0 },
    },
    balm: { 
      id: "balm", 
      name: "Balm", 
      icon: "🍯",
      texture: "Yarı katı anhidrik",
      phRange: null,
    },
    mask: { 
      id: "mask", 
      name: "Maske", 
      icon: "🎭",
      texture: "Çeşitli",
      phRange: { min: 3.5, max: 7.0 },
    },
    powder: { 
      id: "powder", 
      name: "Pudra", 
      icon: "🌸",
      texture: "Kuru toz",
      phRange: null,
    },
  },

  // Kozmetik form alanları
  fields: [
    { id: "productForm", type: "select", label: "Ürün Formu", required: true },
    { id: "productVolume", type: "number", label: "Ürün Hacmi (ml/g)", required: true },
    { id: "targetPh", type: "range", label: "Hedef pH", min: 3.0, max: 8.0, step: 0.1 },
    { id: "targetViscosity", type: "range", label: "Hedef Viskozite (cP)", min: 100, max: 100000 },
  ],

  // Aktif madde kategorileri (Kozmetik için)
  activeCategories: {
    humectants: {
      name: "Nemlendirici Ajanlar",
      icon: "💧",
      items: [
        { id: "glycerin", name: "Gliserin", maxPercent: 10, suggestedPercent: 5 },
        { id: "hyaluronic_acid", name: "Hyaluronik Asit", maxPercent: 2, suggestedPercent: 1 },
        { id: "sodium_pca", name: "Sodyum PCA", maxPercent: 5, suggestedPercent: 2 },
        { id: "urea", name: "Üre", maxPercent: 10, suggestedPercent: 5 },
        { id: "panthenol", name: "Panthenol", maxPercent: 5, suggestedPercent: 2 },
        { id: "betaine", name: "Betain", maxPercent: 5, suggestedPercent: 2 },
      ],
    },
    emollients: {
      name: "Yumuşatıcılar",
      icon: "🌿",
      items: [
        { id: "squalane", name: "Skualan", maxPercent: 10, suggestedPercent: 5 },
        { id: "jojoba_oil", name: "Jojoba Yağı", maxPercent: 15, suggestedPercent: 5 },
        { id: "shea_butter", name: "Shea Yağı", maxPercent: 20, suggestedPercent: 5 },
        { id: "ceramides", name: "Seramidler", maxPercent: 3, suggestedPercent: 1 },
        { id: "caprylic_triglyceride", name: "Kaprilik Trigliserit", maxPercent: 15, suggestedPercent: 7 },
      ],
    },
    actives: {
      name: "Aktif Maddeler",
      icon: "⚡",
      items: [
        { id: "niacinamide", name: "Niasinamid", maxPercent: 10, suggestedPercent: 5 },
        { id: "vitamin_c", name: "C Vitamini", maxPercent: 20, suggestedPercent: 10 },
        { id: "retinol", name: "Retinol", maxPercent: 1, suggestedPercent: 0.3 },
        { id: "salicylic_acid", name: "Salisilik Asit", maxPercent: 2, suggestedPercent: 1 },
        { id: "glycolic_acid", name: "Glikolik Asit", maxPercent: 10, suggestedPercent: 5 },
        { id: "azelaic_acid", name: "Azelaik Asit", maxPercent: 20, suggestedPercent: 10 },
        { id: "alpha_arbutin", name: "Alfa Arbutin", maxPercent: 2, suggestedPercent: 1 },
        { id: "tranexamic_acid", name: "Traneksamik Asit", maxPercent: 5, suggestedPercent: 2 },
        { id: "peptides", name: "Peptitler", maxPercent: 5, suggestedPercent: 2 },
        { id: "bakuchiol", name: "Bakuchiol", maxPercent: 1, suggestedPercent: 0.5 },
      ],
    },
  },

  // Cilt tipleri
  skinTypes: {
    normal: { name: "Normal", icon: "😊" },
    dry: { name: "Kuru", icon: "🏜️" },
    oily: { name: "Yağlı", icon: "💦" },
    combination: { name: "Karma", icon: "⚖️" },
    sensitive: { name: "Hassas", icon: "🌸" },
    mature: { name: "Olgun", icon: "🌺" },
    acne_prone: { name: "Akneye Eğilimli", icon: "🎯" },
  },
};

// ============================================================================
// DERMOKOZMETİK FORM KONFİGÜRASYONU
// ============================================================================
export const DERMOCOSMETIC_FORM_CONFIG = {
  // Dermokozmetik ek özellikleri
  clinicalClaims: {
    dermatologically_tested: { name: "Dermatolojik Testli", icon: "🔬" },
    hypoallergenic: { name: "Hipoalerjenik", icon: "🛡️" },
    non_comedogenic: { name: "Non-Komedojenik", icon: "✅" },
    fragrance_free: { name: "Kolusuz", icon: "🚫" },
    paraben_free: { name: "Parabensiz", icon: "🌿" },
    ophthalmologically_tested: { name: "Oftalmolojik Testli", icon: "👁️" },
    clinically_proven: { name: "Klinik Kanıtlı", icon: "📊" },
  },

  // Dermokozmetik aktif madde dozajları (daha yüksek konsantrasyonlar)
  activeCategories: {
    ...COSMETIC_FORM_CONFIG.activeCategories,
    pharmaceutical_grade: {
      name: "Farmasötik Aktifler",
      icon: "💊",
      items: [
        { id: "retinoid_complex", name: "Retinoid Kompleks", maxPercent: 2, suggestedPercent: 0.5 },
        { id: "hydroquinone_alternative", name: "Hidrokinon Alternatifi", maxPercent: 4, suggestedPercent: 2 },
        { id: "prescription_peptides", name: "Reçete Peptitler", maxPercent: 10, suggestedPercent: 5 },
        { id: "growth_factors", name: "Büyüme Faktörleri", maxPercent: 5, suggestedPercent: 2 },
      ],
    },
  },

  // Form alanları (Kozmetik + ek dermokozmetik alanları)
  fields: [
    ...COSMETIC_FORM_CONFIG.fields,
    { id: "clinicalClaims", type: "multi-select", label: "Klinik Beyanlar", required: false },
    { id: "indicatedCondition", type: "select", label: "Endike Durum", required: true },
    { id: "clinicalStudyRef", type: "text", label: "Klinik Çalışma Ref.", required: false },
  ],

  // Endike durumlar
  indicatedConditions: {
    anti_aging: { name: "Anti-Aging", icon: "⏳" },
    hyperpigmentation: { name: "Hiperpigmentasyon", icon: "🌗" },
    acne_vulgaris: { name: "Akne Vulgaris", icon: "🎯" },
    rosacea: { name: "Rozasea", icon: "🌹" },
    eczema: { name: "Egzama", icon: "🩹" },
    psoriasis: { name: "Sedef", icon: "🔵" },
    post_procedure: { name: "İşlem Sonrası", icon: "🏥" },
    wound_healing: { name: "Yara İyileşme", icon: "🩹" },
  },
};

// ============================================================================
// TEMİZLİK ÜRÜNLERİ FORM KONFİGÜRASYONU
// ============================================================================
export const CLEANING_FORM_CONFIG = {
  // Temizlik ürün formları
  productForms: {
    liquid: { id: "liquid", name: "Sıvı", icon: "💧" },
    gel: { id: "gel", name: "Jel", icon: "🫧" },
    powder: { id: "powder", name: "Toz", icon: "🧂" },
    tablet: { id: "tablet", name: "Tablet", icon: "💊" },
    spray: { id: "spray", name: "Sprey", icon: "💨" },
    foam: { id: "foam", name: "Köpük", icon: "☁️" },
    paste: { id: "paste", name: "Macun", icon: "🧴" },
    wipe: { id: "wipe", name: "Mendil", icon: "🧻" },
  },

  // Temizlik ürün boyutları
  containerSizes: {
    small: { name: "Küçük", volumes: [250, 500], unit: "ml" },
    medium: { name: "Orta", volumes: [750, 1000], unit: "ml" },
    large: { name: "Büyük", volumes: [2000, 3000], unit: "ml" },
    industrial: { name: "Endüstriyel", volumes: [5000, 10000, 20000], unit: "ml" },
    bulk: { name: "Dökme", volumes: [25000, 200000], unit: "ml" },
  },

  // Form alanları
  fields: [
    { id: "productForm", type: "select", label: "Ürün Formu", required: true },
    { id: "containerSize", type: "select", label: "Kap Boyutu", required: true },
    { id: "productVolume", type: "number", label: "Hacim (ml/g)", required: true },
    { id: "concentration", type: "select", label: "Konsantrasyon", required: true },
    { id: "targetPh", type: "range", label: "Hedef pH", min: 1.0, max: 14.0, step: 0.5 },
    { id: "dilutionRatio", type: "text", label: "Seyreltme Oranı", placeholder: "1:10" },
  ],

  // Konsantrasyon seviyeleri
  concentrations: {
    ready_to_use: { name: "Kullanıma Hazır", dilution: 1, priceMultiplier: 1.0 },
    light: { name: "Hafif Konsantre (1:5)", dilution: 5, priceMultiplier: 1.3 },
    medium: { name: "Orta Konsantre (1:10)", dilution: 10, priceMultiplier: 1.6 },
    heavy: { name: "Yoğun Konsantre (1:20)", dilution: 20, priceMultiplier: 2.0 },
    super: { name: "Süper Konsantre (1:50)", dilution: 50, priceMultiplier: 3.0 },
  },

  // Aktif madde kategorileri (Temizlik için)
  activeCategories: {
    surfactants: {
      name: "Yüzey Aktif Maddeler",
      icon: "🫧",
      items: [
        { id: "sles", name: "SLES", maxPercent: 30, suggestedPercent: 15 },
        { id: "sls", name: "SLS", maxPercent: 25, suggestedPercent: 10 },
        { id: "cocoamidopropyl_betaine", name: "Kokamidopropil Betain", maxPercent: 10, suggestedPercent: 5 },
        { id: "alkyl_polyglucoside", name: "APG (Doğal)", maxPercent: 15, suggestedPercent: 8 },
      ],
    },
    disinfectants: {
      name: "Dezenfektanlar",
      icon: "🛡️",
      items: [
        { id: "benzalkonium_chloride", name: "Benzalkonyum Klorür", maxPercent: 1, suggestedPercent: 0.1 },
        { id: "sodium_hypochlorite", name: "Sodyum Hipoklorit", maxPercent: 5, suggestedPercent: 2 },
        { id: "hydrogen_peroxide", name: "Hidrojen Peroksit", maxPercent: 10, suggestedPercent: 3 },
        { id: "quaternary_ammonium", name: "Kuaterner Amonyum", maxPercent: 2, suggestedPercent: 0.5 },
      ],
    },
    builders: {
      name: "Yapı Maddeleri",
      icon: "🔧",
      items: [
        { id: "sodium_carbonate", name: "Sodyum Karbonat", maxPercent: 30, suggestedPercent: 15 },
        { id: "citric_acid", name: "Sitrik Asit", maxPercent: 20, suggestedPercent: 10 },
        { id: "edta", name: "EDTA", maxPercent: 5, suggestedPercent: 1 },
        { id: "zeolite", name: "Zeolit", maxPercent: 25, suggestedPercent: 15 },
      ],
    },
    fragrances: {
      name: "Kokular",
      icon: "🌸",
      items: [
        { id: "lemon", name: "Limon", maxPercent: 2, suggestedPercent: 0.5 },
        { id: "lavender", name: "Lavanta", maxPercent: 2, suggestedPercent: 0.5 },
        { id: "pine", name: "Çam", maxPercent: 2, suggestedPercent: 0.5 },
        { id: "floral", name: "Çiçeksi", maxPercent: 2, suggestedPercent: 0.5 },
        { id: "fresh", name: "Ferah", maxPercent: 2, suggestedPercent: 0.5 },
      ],
    },
  },
};

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * Kategoriye göre form config döndürür
 */
export function getFormConfigByCategory(categoryId) {
  switch (categoryId) {
    case "supplement":
      return SUPPLEMENT_FORM_CONFIG;
    case "cosmetic":
      return COSMETIC_FORM_CONFIG;
    case "dermocosmetic":
      return DERMOCOSMETIC_FORM_CONFIG;
    case "cleaning":
      return CLEANING_FORM_CONFIG;
    default:
      return null;
  }
}

/**
 * Elemental mineral miktarından toplam form miktarını hesaplar
 * Örnek: 120mg elemental magnezyum, bisglisinat formunda kaç mg gerekir?
 */
export function calculateTotalFromElemental(elementalMg, mineralId, formId) {
  const forms = SUPPLEMENT_FORM_CONFIG.mineralForms[mineralId];
  if (!forms || !forms[formId]) return null;
  
  const elementalPercent = forms[formId].elementalPercent;
  const totalMg = (elementalMg / elementalPercent) * 100;
  
  return {
    elementalMg,
    totalMg: Math.round(totalMg * 10) / 10,
    formName: forms[formId].name,
    elementalPercent,
  };
}

/**
 * Toplam form miktarından elemental miktarı hesaplar
 */
export function calculateElementalFromTotal(totalMg, mineralId, formId) {
  const forms = SUPPLEMENT_FORM_CONFIG.mineralForms[mineralId];
  if (!forms || !forms[formId]) return null;
  
  const elementalPercent = forms[formId].elementalPercent;
  const elementalMg = (totalMg * elementalPercent) / 100;
  
  return {
    totalMg,
    elementalMg: Math.round(elementalMg * 10) / 10,
    formName: forms[formId].name,
    elementalPercent,
  };
}

/**
 * Kapsül boyutuna göre tavsiye edilen dolum ağırlığını döndürür
 */
export function getCapsuleFillRecommendation(capsuleSize) {
  const size = SUPPLEMENT_FORM_CONFIG.formTypes.capsule.capsuleSizes[capsuleSize];
  if (!size) return null;
  
  return {
    size: capsuleSize,
    minFillMg: size.capacityMg,
    maxFillMg: size.capacityMgMax,
    recommendedFillMg: Math.round((size.capacityMg + size.capacityMgMax) / 2),
    description: size.description,
  };
}

/**
 * Günlük doz ve kutu sayısından kullanım süresini hesaplar
 */
export function calculateSupplyDuration(totalUnits, dailyDose) {
  if (!dailyDose || dailyDose <= 0) return null;
  const days = totalUnits / dailyDose;
  return {
    days: Math.floor(days),
    weeks: Math.round(days / 7 * 10) / 10,
    months: Math.round(days / 30 * 10) / 10,
  };
}

export default {
  SUPPLEMENT_FORM_CONFIG,
  COSMETIC_FORM_CONFIG,
  DERMOCOSMETIC_FORM_CONFIG,
  CLEANING_FORM_CONFIG,
  getFormConfigByCategory,
  calculateTotalFromElemental,
  calculateElementalFromTotal,
  getCapsuleFillRecommendation,
  calculateSupplyDuration,
};
