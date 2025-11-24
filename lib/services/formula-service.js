import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Get Turkish translation for ingredient function
 * @param {string} functionEn - English function name
 * @returns {string} Turkish translation
 */
function getFunctionTurkish(functionEn) {
  const translations = {
    Solvent: "Çözücü",
    Carrier: "Taşıyıcı",
    Moisturizer: "Nemlendirici",
    Humectant: "Nemlendirici",
    Emulsifier: "Emülgatör",
    Thickener: "Koyulaştırıcı",
    Preservative: "Koruyucu",
    Fragrance: "Parfüm",
    Perfume: "Parfüm",
    Oil: "Yağ",
    "Active Ingredient": "Aktif Madde",
    Antioxidant: "Antioksidan",
    "pH Adjuster": "pH Düzenleyici",
    Colorant: "Renklendirici",
    Other: "Diğer",
  };
  return translations[functionEn] || functionEn;
}

/**
 * Formula Service
 * Manages product formulas in Firestore
 */

/**
 * Load all saved formulas from Firestore
 * @returns {Promise<Array>} Array of formula objects
 */
export async function loadSavedFormulas() {
  try {
    const formulasRef = collection(db, "product_formulas");
    const q = query(formulasRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const formulas = [];
    querySnapshot.forEach((doc) => {
      formulas.push({ id: doc.id, ...doc.data() });
    });

    return formulas;
  } catch (error) {
    console.error("Error loading formulas:", error);
    throw error;
  }
}

/**
 * Load formulas by product type
 * @param {string} productType - Type of product
 * @returns {Promise<Array>} Filtered array of formula objects
 */
export async function loadFormulasByType(productType) {
  try {
    const formulasRef = collection(db, "product_formulas");
    const q = query(
      formulasRef,
      where("productType", "==", productType),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const formulas = [];
    querySnapshot.forEach((doc) => {
      formulas.push({ id: doc.id, ...doc.data() });
    });

    return formulas;
  } catch (error) {
    console.error("Error loading formulas by type:", error);
    throw error;
  }
}

/**
 * Save a new formula to Firestore
 * @param {Object} formulaData - Formula data object
 * @returns {Promise<Object>} Created formula document reference
 */
export async function saveFormula(formulaData) {
  try {
    // Calculate total amount
    const totalAmount = formulaData.ingredients.reduce((sum, ing) => {
      const amount = parseFloat(ing.amount) || 0;
      // Convert everything to grams for consistency
      let amountInGrams = amount;
      if (ing.unit === "kg") amountInGrams = amount * 1000;
      else if (ing.unit === "ml") amountInGrams = amount;
      else if (ing.unit === "litre") amountInGrams = amount * 1000;
      return sum + amountInGrams;
    }, 0);

    const data = {
      name: formulaData.name.trim(),
      productType: formulaData.productType || "genel",
      productVolume: formulaData.productVolume || null,
      notes: formulaData.notes?.trim() || "",
      ingredients: formulaData.ingredients
        .filter((ing) => ing.name)
        .map((ing) => {
          const amount = parseFloat(ing.amount) || 0;
          let amountInGrams = amount;
          if (ing.unit === "kg") amountInGrams = amount * 1000;
          else if (ing.unit === "ml") amountInGrams = amount;
          else if (ing.unit === "litre") amountInGrams = amount * 1000;

          return {
            name: ing.name,
            displayName: ing.displayName || ing.name, // Türkçe ad
            amount: parseFloat(ing.amount) || 0,
            unit: ing.unit,
            price: parseFloat(ing.price) || 0,
            supplier: ing.supplier || "",
            function: ing.function || "Other",
            functionTr: getFunctionTurkish(ing.function || "Other"),
            percentage:
              totalAmount > 0
                ? parseFloat(((amountInGrams / totalAmount) * 100).toFixed(2))
                : 0,
          };
        }),
      totalAmount: totalAmount,
      totalAmountUnit: "gram",
      // AI configuration if provided
      aiConfig: formulaData.aiConfig || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "product_formulas"), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error saving formula:", error);
    throw error;
  }
}

/**
 * Load a specific formula by ID
 * @param {string} formulaId - Formula document ID
 * @returns {Promise<Object>} Formula data
 */
export async function loadFormula(formulaId) {
  try {
    const formulaRef = doc(db, "product_formulas", formulaId);
    const formulaSnap = await getDoc(formulaRef);

    if (!formulaSnap.exists()) {
      throw new Error("Formül bulunamadı");
    }

    return { id: formulaSnap.id, ...formulaSnap.data() };
  } catch (error) {
    console.error("Error loading formula:", error);
    throw error;
  }
}

/**
 * Update an existing formula
 * @param {string} formulaId - Formula document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateFormula(formulaId, updates) {
  try {
    const formulaRef = doc(db, "product_formulas", formulaId);

    // Recalculate percentages if ingredients are updated
    if (updates.ingredients) {
      const totalAmount = updates.ingredients.reduce((sum, ing) => {
        const amount = parseFloat(ing.amount) || 0;
        let amountInGrams = amount;
        if (ing.unit === "kg") amountInGrams = amount * 1000;
        else if (ing.unit === "ml") amountInGrams = amount;
        else if (ing.unit === "litre") amountInGrams = amount * 1000;
        return sum + amountInGrams;
      }, 0);

      updates.ingredients = updates.ingredients.map((ing) => {
        const amount = parseFloat(ing.amount) || 0;
        let amountInGrams = amount;
        if (ing.unit === "kg") amountInGrams = amount * 1000;
        else if (ing.unit === "ml") amountInGrams = amount;
        else if (ing.unit === "litre") amountInGrams = amount * 1000;

        return {
          ...ing,
          displayName: ing.displayName || ing.name, // Türkçe ad ekle
          function: ing.function || "Other",
          functionTr: getFunctionTurkish(ing.function || "Other"),
          percentage:
            totalAmount > 0
              ? parseFloat(((amountInGrams / totalAmount) * 100).toFixed(2))
              : 0,
        };
      });

      updates.totalAmount = totalAmount;
    }

    await updateDoc(formulaRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating formula:", error);
    throw error;
  }
}

/**
 * Delete a formula
 * @param {string} formulaId - Formula document ID
 * @returns {Promise<void>}
 */
export async function deleteFormula(formulaId) {
  try {
    const formulaRef = doc(db, "product_formulas", formulaId);
    await deleteDoc(formulaRef);
  } catch (error) {
    console.error("Error deleting formula:", error);
    throw error;
  }
}

/**
 * Generate formula using AI
 * @param {Object} productInfo - Product information
 * @param {Function} sendMessage - AI message function
 * @returns {Promise<Object>} Generated formula object
 */
export async function generateAIFormula(productInfo, sendMessage) {
  // Convert numeric level (1-10) to formula specifications
  const level = productInfo.formulaLevel || 5;
  const selectedModel =
    productInfo.selectedModel || "claude-haiku-4-5-20251001";

  let levelSpecs = {
    name: "",
    description: "",
    ingredientCount: "",
    priceRange: "",
    complexity: "",
    qualityTier: "",
  };

  if (level <= 3) {
    levelSpecs = {
      name: `Ekonomik Formül (Seviye ${level})`,
      description: "Temel hammaddeler, uygun fiyat, basit formülasyon",
      ingredientCount: `${6 + level * 2}-${8 + level * 2}`,
      priceRange: "düşük",
      complexity: "basit",
      qualityTier: "ekonomik",
    };
  } else if (level >= 4 && level <= 6) {
    levelSpecs = {
      name: `Orta Segment Formül (Seviye ${level})`,
      description:
        "Dengeli kalite-fiyat, etkili hammaddeler, güvenilir sonuçlar",
      ingredientCount: `${10 + level * 2}-${12 + level * 2}`,
      priceRange: "orta",
      complexity: "orta",
      qualityTier: "standart-iyi",
    };
  } else if (level >= 7 && level <= 8) {
    levelSpecs = {
      name: `Premium Formül (Seviye ${level})`,
      description:
        "Yüksek kalite aktif maddeler, kompleks formülasyon, lüks içerikler",
      ingredientCount: `${14 + level * 2}-${16 + level * 2}`,
      priceRange: "yüksek",
      complexity: "kompleks",
      qualityTier: "premium",
    };
  } else {
    levelSpecs = {
      name: `Ultra Lüks Formül (Seviye ${level})`,
      description:
        "En lüks hammaddeler, biyoteknoloji, peptidler, maksimum etkinlik",
      ingredientCount: `${18 + level * 2}-${20 + level * 2}`,
      priceRange: "çok yüksek/lüks",
      complexity: "ileri seviye",
      qualityTier: "ultra-premium",
    };
  }

  const prompt = `Sen profesyonel bir kozmetik formülasyon uzmanısın ve Türkiye pazarındaki 2024-2025 güncel hammadde fiyatlarını biliyorsun.

═══════════════════════════════════════════════════════════════════
📋 ÜRÜN DETAYLARI
═══════════════════════════════════════════════════════════════════
• Ürün Adı: ${productInfo.productName}
• Ürün Tipi: ${productInfo.productType}
• TOPLAM HACİM: ${productInfo.productVolume || "100"} gram
• Özel İstek: ${productInfo.description || "Yok"}
• Kalite Seviyesi: ${level}/10 (${levelSpecs.name})

═══════════════════════════════════════════════════════════════════
🎯 KRİTİK GÖREV: TOPLAM HACİM KURALI
═══════════════════════════════════════════════════════════════════
⚠️ EN ÖNEMLİ KURAL ⚠️
Tüm hammaddelerin "amount" değerlerinin TOPLAMI = ${
    productInfo.productVolume || "100"
  } gram olmalı!

ADIM ADIM KONTROL:
1. Her hammadde eklerken kümülatif toplamı hesapla
2. Son hammaddeyi eklemeden önce kalan miktarı belirle
3. Son hammaddeye tam olarak kalan miktarı ata
4. Final kontrolde tüm amount'ları topla ve ${
    productInfo.productVolume || "100"
  } olduğunu doğrula

ÖRNEK: Hedef 50 gram için
✓ Doğru: 40.5 + 5.0 + 2.5 + 1.5 + 0.5 = 50.0 gram
✗ Yanlış: 40 + 5 + 2 + 1 = 48 gram (eksik!)
✗ Yanlış: 40 + 5 + 3 + 2 + 1 = 51 gram (fazla!)

═══════════════════════════════════════════════════════════════════
📊 FORMÜL SEVİYE REHBERİ
═══════════════════════════════════════════════════════════════════
SEVİYE ${level}/10: ${levelSpecs.name}
Açıklama: ${levelSpecs.description}
Tavsiye Edilen Hammadde Sayısı: ${levelSpecs.ingredientCount} adet
(Not: Hacim hedefine göre ayarlanabilir)

FORMÜL KALİTE KATEGORİLERİ:
┌─────────────┬──────────────────────────────────────────────────┐
│ Seviye 1-3  │ Ekonomik: Temel hammaddeler, basit formülasyon   │
│ Seviye 4-6  │ Orta: Dengeli kalite, etkili aktif maddeler      │
│ Seviye 7-8  │ Premium: Yüksek kalite, kompleks formülasyon     │
│ Seviye 9-10 │ Lüks: Ultra premium, biyoteknoloji, peptidler    │
└─────────────┴──────────────────────────────────────────────────┘

🔑 ÖNEMLİ: Seviye sadece HAMMADDENİN KALİTESİNİ belirler, fiyat gerçek piyasa değeridir!

═══════════════════════════════════════════════════════════════════
💰 FİYATLANDIRMA KURALLARI
═══════════════════════════════════════════════════════════════════
Sen bir piyasa fiyat analistisin. Aşağıdaki kurallara SIKI SIKIYA uy:

1️⃣ FİYAT BİRİMİ: TL/kg (Türk Lirası per kilogram)
2️⃣ DÖNEM: 2024-2025 güncel Türkiye piyasa fiyatları
3️⃣ KAYNAK: Gerçek tedarikçiler (Brenntag, Solvay, Sigma Kimya, Azelis, Kolb, Merck vb.)
4️⃣ GERÇEKÇİLİK: Doğrulanabilir, abartısız, piyasa gerçeği
5️⃣ BAĞIMSIZLIK: Formül seviyesi fiyatı ETKİLEMEZ - her zaman gerçek fiyat

REFERANS FİYAT ÖRNEKLERİ:
• Su (Aqua): 0.02-0.05 TL/kg
• Gliserin: 120-180 TL/kg
• Hyaluronik Asit: 8,000-25,000 TL/kg
• Peptidler: 15,000-80,000 TL/kg
• Parfüm/Esans: 500-3,500 TL/kg
• Vitaminler (E, C): 800-5,000 TL/kg

═══════════════════════════════════════════════════════════════════
📝 JSON ÇIKTI FORMATI
═══════════════════════════════════════════════════════════════════
Aşağıdaki JSON formatında cevap ver (hiçbir açıklama ekleme):

{
  "formula": [
    {
      "name": "Aqua",
      "displayName": "Saf Su",
      "amount": 65.5,
      "unit": "gram",
      "function": "Solvent",
      "estimatedPrice": 0.02
    },
    {
      "name": "Glycerin",
      "displayName": "Gliserin",
      "amount": 8.0,
      "unit": "gram",
      "function": "Humectant",
      "estimatedPrice": 150.00
    },
    {
      "name": "Hyaluronic Acid",
      "displayName": "Hyaluronik Asit",
      "amount": 0.5,
      "unit": "gram",
      "function": "Active Ingredient",
      "estimatedPrice": 12000.00
    }
  ],
  "totalEstimatedCost": "XX.XX TL",
  "costPerUnit": "X.XX TL/gram",
  "productionNotes": [
    "Üretim sıcaklığı: 40-50°C",
    "Karıştırma süresi: 15-20 dakika",
    "pH ayarı gerekli: 5.5-6.5"
  ],
  "suggestions": "Formül hakkında profesyonel öneriler"
}

═══════════════════════════════════════════════════════════════════
📌 ALAN TANIMLARI
═══════════════════════════════════════════════════════════════════
• name: INCI adı (İngilizce - uluslararası standart kimyasal ad)
• displayName: Türkçe yaygın adı (kullanıcı dostu isim)
• amount: Miktar (sayısal değer, ondalık kabul eder)
• unit: Birim (sadece "gram" kullan)
• function: Fonksiyon (aşağıdaki listeden seç)
• estimatedPrice: Fiyat (TL/kg, gerçek piyasa değeri)

İZİN VERİLEN FUNCTION DEĞERLERİ (sadece bunları kullan):
Solvent, Carrier, Moisturizer, Humectant, Emulsifier, Thickener, 
Preservative, Fragrance, Perfume, Oil, Active Ingredient, 
Antioxidant, pH Adjuster, Colorant, Other

═══════════════════════════════════════════════════════════════════
✅ FİNAL KONTROL LİSTESİ (Cevap vermeden önce kontrol et)
═══════════════════════════════════════════════════════════════════
☐ Tüm amount değerlerinin toplamı TAM OLARAK ${
    productInfo.productVolume || "100"
  } gram mı?
☐ Her hammaddenin name ve displayName alanı dolu mu?
☐ EstimatedPrice değerleri gerçekçi ve güncel mi?
☐ Function değerleri izin verilen listeden mi?
☐ Unit değeri her yerde "gram" mı?
☐ JSON formatı geçerli mi (virgüller, süslü parantezler doğru mu)?
☐ Formül seviyesi ${level} için uygun kalite hammaddeleri seçildi mi?
☐ TotalEstimatedCost ve costPerUnit hesaplandı mı?

⚠️ Bu kontrollerin HEPSİ ✓ olmalı! Eksik varsa düzelt!

═══════════════════════════════════════════════════════════════════
⚠️⚠️⚠️ ÇOK ÖNEMLİ: JSON FORMAT KURALLARI ⚠️⚠️⚠️
═══════════════════════════════════════════════════════════════════
1. SADECE JSON döndür - hiçbir açıklama, yorum veya ek metin ekleme
2. Son elemandan sonra virgül (,) KULLANMA
3. Tüm string değerleri çift tırnak içinde yaz
4. Sayısal değerler tırnak içinde OLMAMALI
5. JSON'u başka bir metin ile sarmalama
6. Geçerli JSON formatını kontrol et

YANLIŞ ÖRNEK:
{
  "formula": [
    {"name": "Aqua", "amount": 50,}  ← SON ELEMAN VIRGÜLÜ YANLIŞ!
  ],
}  ← SON SÜSLÜ PARANTEZDEN ÖNCE VIRGÜL YANLIŞ!

DOĞRU ÖRNEK:
{
  "formula": [
    {"name": "Aqua", "amount": 50}
  ]
}

═══════════════════════════════════════════════════════════════════
🚀 ŞİMDİ FORMÜLÜ OLUŞTUR
═══════════════════════════════════════════════════════════════════
Yukarıdaki tüm kurallara uyarak ${productInfo.productVolume || "100"} gram 
hacimli ${productInfo.productType} formülünü oluştur.

ÇIKTI FORMATI:
\`\`\`json
{
  "formula": [...],
  "totalEstimatedCost": "XX.XX TL",
  "costPerUnit": "X.XX TL/gram",
  "productionNotes": [...],
  "suggestions": "..."
}
\`\`\`

SADECE yukarıdaki JSON formatında cevap ver. Başka hiçbir metin, açıklama veya yorum ekleme!`;

  try {
    const response = await sendMessage(prompt, {
      maxTokens: 4000, // Increased for better completion
      type: "generate",
      model: selectedModel,
    });

    // Parse AI response with enhanced error handling
    let jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    let jsonStr = jsonMatch ? jsonMatch[1].trim() : null;

    if (!jsonStr) {
      jsonMatch = response.match(/(\{[\s\S]*\})/);
      jsonStr = jsonMatch ? jsonMatch[1] : null;
    }

    if (jsonStr) {
      // Log the raw JSON for debugging
      console.log("Raw JSON length:", jsonStr.length);
      console.log("First 200 chars:", jsonStr.substring(0, 200));
      console.log("Last 200 chars:", jsonStr.substring(jsonStr.length - 200));

      // Step 1: Aggressive cleanup
      jsonStr = jsonStr
        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
        .replace(/,\s*,/g, ",") // Remove double commas
        .replace(/\[\s*,/g, "[") // Remove comma after [
        .replace(/{\s*,/g, "{") // Remove comma after {
        .replace(/}\s*{/g, "}, {") // Fix missing comma between objects
        .replace(/(\d+\.?\d*)\s*}\s*{/g, "$1 }, {") // Fix missing comma after number at object end
        .replace(/"\s*}\s*{/g, '" }, {') // Fix missing comma after string at object end
        .replace(/(\d+)\s+}/g, "$1}") // Fix numbers followed by space and }
        .replace(/(\d+)\s+,/g, "$1,") // Fix numbers followed by space and comma
        .replace(/:\s*(\d+)\s+"/g, ': $1, "') // Fix missing comma between number and string
        .replace(/\n/g, " ") // Remove newlines
        .replace(/\r/g, "") // Remove carriage returns
        .replace(/\t/g, " ") // Replace tabs with spaces
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      // Try to parse, if fails try to fix and parse again
      try {
        const parsedFormula = JSON.parse(jsonStr);

        if (
          parsedFormula.formula &&
          Array.isArray(parsedFormula.formula) &&
          parsedFormula.formula.length > 0
        ) {
          return parsedFormula;
        } else {
          throw new Error("Geçerli formül bulunamadı");
        }
      } catch (parseError) {
        console.error("JSON parse error, attempting to fix:", parseError);
        console.log("Error position:", parseError.message);
        console.log(
          "Problematic JSON (first 1000):",
          jsonStr.substring(0, 1000)
        );
        console.log("Around error position:", jsonStr.substring(4480, 4500));

        // Try a more aggressive fix: find the formula array specifically
        const formulaMatch = jsonStr.match(/"formula"\s*:\s*\[([\s\S]*?)\]/);
        if (formulaMatch) {
          try {
            // Fix common issues in the array
            let formulaArrayStr = formulaMatch[0];
            
            // Fix missing commas between objects in array: } {
            formulaArrayStr = formulaArrayStr.replace(/}\s*{/g, "}, {");
            
            // Fix missing comma after number before next property: 45.0 }
            formulaArrayStr = formulaArrayStr.replace(/(\d+\.?\d*)\s+}/g, "$1 }");
            
            // Fix missing comma between number and next object: 45.0 }
            formulaArrayStr = formulaArrayStr.replace(/(\d+\.?\d*)\s*}\s*{/g, "$1 }, {");
            
            const minimalJson = `{${formulaArrayStr}}`;
            console.log("Trying minimal JSON:", minimalJson.substring(0, 200));

            const parsedFormula = JSON.parse(minimalJson);

            if (
              parsedFormula.formula &&
              Array.isArray(parsedFormula.formula) &&
              parsedFormula.formula.length > 0
            ) {
              // Add missing fields with defaults
              return {
                formula: parsedFormula.formula,
                totalEstimatedCost: "0.00",
                costPerUnit: "0.00",
                productionNotes: [],
                suggestions: "",
              };
            }
          } catch (minimalError) {
            console.error("Minimal JSON parse failed:", minimalError);
          }
        }

        // Last resort: Try to find and extract just the main JSON object
        const startIndex = jsonStr.indexOf("{");
        const lastIndex = jsonStr.lastIndexOf("}");

        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          let extractedJson = jsonStr.substring(startIndex, lastIndex + 1);

          // One more aggressive cleanup on extracted JSON
          extractedJson = extractedJson
            .replace(/,(\s*[}\]])/g, "$1")
            .replace(/,\s*,/g, ",");

          try {
            const parsedFormula = JSON.parse(extractedJson);

            if (
              parsedFormula.formula &&
              Array.isArray(parsedFormula.formula) &&
              parsedFormula.formula.length > 0
            ) {
              return parsedFormula;
            }
          } catch (secondError) {
            console.error("Second parse attempt failed:", secondError);
            console.log(
              "Extracted JSON (first 500):",
              extractedJson.substring(0, 500)
            );
          }
        }

        throw new Error(
          `JSON parse hatası: ${parseError.message}. Lütfen farklı bir model deneyin veya parametreleri değiştirin.`
        );
      }
    } else {
      throw new Error("JSON formatı bulunamadı");
    }
  } catch (error) {
    console.error("AI formula generation error:", error);
    throw error;
  }
}

/**
 * Get AI price suggestion for an ingredient
 * @param {Object} ingredientInfo - Ingredient information
 * @param {Function} sendMessage - AI message function
 * @returns {Promise<Object>} Price data objects
 */
export async function getAIIngredientPrice(ingredientInfo, sendMessage) {
  const prompt = `Sen profesyonel bir kozmetik/gıda hammaddesi piyasa fiyat analistisin. Türkiye pazarında güncel fiyatları araştırıyorsun.

HAMMADDE BİLGİLERİ:
- Hammadde: ${ingredientInfo.name}
- Miktar: ${
    ingredientInfo.amount
      ? `${ingredientInfo.amount} ${ingredientInfo.unit}`
      : "Belirtilmedi"
  }
- Tedarikçi: ${ingredientInfo.supplier || "Yok"}
- Kategori: ${ingredientInfo.productType || "genel"}

GÖREV:
Bu hammadde için Türkiye piyasasında 2024-2025 güncel fiyat analizi yap.

KURALLAR:
✓ Fiyat = TL/kg bazında
✓ Gerçek piyasa fiyatlarını araştır
✓ Türkiye'deki bilinen tedarikçileri öner (Brenntag, Solvay, Sigma Kimya, Azelis vb.)
✓ Ekonomik/Standart/Premium kalite seviyeleri belirt
✓ Gerçekçi ve doğrulanabilir fiyatlar ver

JSON FORMATINDA CEVAP VER:
{
  "estimatedPrice": 125.50,
  "priceRange": {
    "min": 85.00,
    "max": 180.00
  },
  "unit": "TL/kg",
  "currency": "TL",
  "priceDate": "2024-2025",
  "qualityLevels": {
    "ekonomik": 85.00,
    "standart": 125.50,
    "premium": 180.00
  },
  "suppliers": [
    {
      "name": "Brenntag Türkiye",
      "estimatedPrice": 120.00,
      "minOrder": "5 kg",
      "quality": "Standart"
    },
    {
      "name": "Sigma Kimya",
      "estimatedPrice": 135.00,
      "minOrder": "10 kg",
      "quality": "Premium"
    }
  ],
  "notes": "Piyasa notları ve öneriler",
  "confidenceLevel": "yüksek"
}

NOT: Sadece JSON döndür, başka açıklama yazma.`;

  try {
    const response = await sendMessage(prompt, {
      maxTokens: 2000,
      type: "generate",
      model: "claude-sonnet-4-5-20250929",
    });

    // Parse AI response with enhanced error handling
    let jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    let jsonStr = jsonMatch ? jsonMatch[1].trim() : null;

    if (!jsonStr) {
      jsonMatch = response.match(/(\{[\s\S]*?\})/);
      jsonStr = jsonMatch ? jsonMatch[1] : null;
    }

    if (jsonStr) {
      // Clean up common JSON formatting issues
      jsonStr = jsonStr
        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
        .replace(/\n/g, " ") // Remove newlines
        .replace(/\r/g, "") // Remove carriage returns
        .replace(/\t/g, " ") // Replace tabs with spaces
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      try {
        const priceData = JSON.parse(jsonStr);
        return priceData;
      } catch (parseError) {
        console.error("JSON parse error in price suggestion:", parseError);
        console.log("Problematic JSON:", jsonStr.substring(0, 300));

        // Try to extract just the JSON object
        const startIndex = jsonStr.indexOf("{");
        const lastIndex = jsonStr.lastIndexOf("}");

        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          const extractedJson = jsonStr.substring(startIndex, lastIndex + 1);
          try {
            const priceData = JSON.parse(extractedJson);
            return priceData;
          } catch (secondError) {
            console.error("Second parse attempt failed:", secondError);
          }
        }

        throw new Error(`JSON parse hatası: ${parseError.message}`);
      }
    } else {
      throw new Error("JSON formatı bulunamadı");
    }
  } catch (error) {
    console.error("AI price fetch error:", error);
    throw error;
  }
}
