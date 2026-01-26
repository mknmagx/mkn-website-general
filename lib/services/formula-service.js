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

// v4.0 Imports - Kategori bazlı promptlar ve hesaplama servisleri
import { getPromptByCategory, getContextByCategory } from './formula-prompts-v4';
import { processFormulaCalculations, validateFormula } from './formula-calculation-service';
import { findBestPriceMatch, saveIngredientPrice } from './ingredients-price-service';

// ============================================================================
// Dinamik Prompt Template Sistemi
// ============================================================================
// Bu servis artık Firestore'dan gelen prompt template'lerini kullanır.
// Hardcoded promptlar kaldırıldı, tüm promptlar ai_prompts koleksiyonundan çekilir.
// Page tarafında useUnifiedAI hook'u ile firestorePrompt alınır ve bu servise geçilir.

/**
 * Template değişkenlerini replace eder
 * @param {string} template - Prompt template ({{variable}} formatında)
 * @param {Object} variables - Değişken değerleri
 * @returns {string} Replace edilmiş prompt
 */
function replaceTemplateVariables(template, variables) {
  if (!template) return "";

  let result = template;

  // Nested object desteği için flatten
  const flatVariables = flattenObject(variables);

  // {{variable}} formatındaki değişkenleri replace et
  Object.entries(flatVariables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value?.toString() || "");
  });

  return result;
}

/**
 * Nested object'leri flatten eder (levelSpecs.name -> "levelSpecs.name")
 */
function flattenObject(obj, prefix = "") {
  const result = {};

  for (const [key, value] of Object.entries(obj || {})) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Formül seviyesine göre spec objesi oluşturur
 */
function getLevelSpecs(level) {
  if (level <= 3) {
    return {
      name: `Ekonomik Formül (Seviye ${level})`,
      description: "Temel hammaddeler, uygun fiyat, basit formülasyon",
      ingredientCount: `${6 + level * 2}-${8 + level * 2}`,
      priceRange: "düşük",
      complexity: "basit",
      qualityTier: "ekonomik",
    };
  } else if (level >= 4 && level <= 6) {
    return {
      name: `Orta Segment Formül (Seviye ${level})`,
      description:
        "Dengeli kalite-fiyat, etkili hammaddeler, güvenilir sonuçlar",
      ingredientCount: `${10 + level * 2}-${12 + level * 2}`,
      priceRange: "orta",
      complexity: "orta",
      qualityTier: "standart-iyi",
    };
  } else if (level >= 7 && level <= 8) {
    return {
      name: `Premium Formül (Seviye ${level})`,
      description:
        "Yüksek kalite aktif maddeler, kompleks formülasyon, lüks içerikler",
      ingredientCount: `${14 + level * 2}-${16 + level * 2}`,
      priceRange: "yüksek",
      complexity: "kompleks",
      qualityTier: "premium",
    };
  } else {
    return {
      name: `Ultra Lüks Formül (Seviye ${level})`,
      description:
        "En lüks hammaddeler, biyoteknoloji, peptidler, maksimum etkinlik",
      ingredientCount: `${18 + level * 2}-${20 + level * 2}`,
      priceRange: "çok yüksek/lüks",
      complexity: "ileri seviye",
      qualityTier: "ultra-premium",
    };
  }
}

// JSON Çıktı format talimatları - dinamik değerlerle (v3.1)
// Template değişkenleri: {{targetGram}}, {{targetUnits}}, {{targetKg}}
function getJsonOutputInstructions(targetGram, targetUnits, targetKg) {
  return `
═══════════════════════════════════════════════════════════════════
📝 JSON ÇIKTI FORMATI
═══════════════════════════════════════════════════════════════════

⚠️ KRİTİK: Formül toplamı TAM OLARAK ${targetGram} gram olmalı!

{
  "meta": {
    "productName": "Ürün Adı",
    "type": "tip",
    "level": 4,
    "batch": { "unitSize_g": ${targetGram}, "units": ${targetUnits}, "totalBatch_kg": ${targetKg} }
  },
  "formula": [
    {
      "name": "INCI Name",
      "displayName": "Türkçe Adı",
      "amount": 0.00,
      "unit": "gram",
      "percentage": 0.00,
      "function": "Function",
      "functionTr": "Fonksiyon",
      "estimatedPriceTLperKg": 0,
      "estimatedCostTL": 0.00,
      "supplier": "Tedarikçi",
      "specNotes": "Not"
    }
  ],
  "totals": {
    "totalWeight_g": ${targetGram},
    "totalEstimatedCostTL": 0.00,
    "costPerGramTL": 0.00,
    "estimatedCostPerUnit_TL": 0.00,
    "estimatedRawCostForBatch_TL": 0.00
  },
  "manufacturing": { "processType": "cold_blend", "steps": ["Adım"], "fillingTemp_C": 30 },
  "quality": { "appearance": "Görünüm", "viscosity_cP_25C": { "min": 50, "max": 200 } },
  "productionNotes": ["Not"],
  "suggestions": "Öneriler"
}

KURALLAR:
1. SADECE JSON - açıklama YOK
2. amount toplamı = ${targetGram} gram TAM
3. estimatedCostTL = (amount/1000) × estimatedPriceTLperKg
`;
}

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
    Emollient: "Yumuşatıcı",
    Emulsifier: "Emülgatör",
    Thickener: "Koyulaştırıcı",
    Preservative: "Koruyucu",
    Fragrance: "Parfüm",
    Perfume: "Parfüm",
    Oil: "Yağ",
    "Active Ingredient": "Aktif Bileşen",
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
      productVolumeUnit: formulaData.productVolumeUnit || "ml",
      productionQuantity: formulaData.productionQuantity || null,
      notes: formulaData.notes?.trim() || "",
      ingredients: formulaData.ingredients
        .filter((ing) => ing.name)
        .map((ing) => {
          const amount = parseFloat(ing.amount) || 0;
          let amountInGrams = amount;
          if (ing.unit === "kg") amountInGrams = amount * 1000;
          else if (ing.unit === "ml") amountInGrams = amount;
          else if (ing.unit === "litre") amountInGrams = amount * 1000;

          // v3.1 uyumu: hem eski hem yeni field adlarını destekle
          const pricePerKg = parseFloat(ing.estimatedPriceTLperKg || ing.price) || 0;
          const estimatedCost = parseFloat(ing.estimatedCostTL) || (amount / 1000) * pricePerKg;

          return {
            name: ing.name,
            displayName: ing.displayName || ing.name,
            amount: amount,
            unit: ing.unit || "gram",
            price: pricePerKg, // kg fiyatı (eski uyumluluk)
            estimatedPriceTLperKg: pricePerKg, // v3.1 field
            estimatedCostTL: parseFloat(estimatedCost.toFixed(4)), // v3.1 field
            supplier: ing.supplier || "",
            function: ing.function || "Other",
            functionTr: ing.functionTr || getFunctionTurkish(ing.function || "Other"),
            specNotes: ing.specNotes || "",
            percentage:
              totalAmount > 0
                ? parseFloat(((amountInGrams / totalAmount) * 100).toFixed(2))
                : 0,
          };
        }),
      totalAmount: totalAmount,
      totalAmountUnit: "gram",
      // AI'dan gelen üretim, kalite ve uyumluluk bilgileri
      manufacturing: formulaData.manufacturing || null,
      quality: formulaData.quality || null,
      compliance: formulaData.compliance || null,
      suggestions: formulaData.suggestions || "",
      shelfLife: formulaData.shelfLife || "",
      targetPH: formulaData.targetPH || "",
      storageConditions: formulaData.storageConditions || "",
      productionNotes: formulaData.productionNotes || [],
      qualityChecks: formulaData.qualityChecks || [],
      // AI configuration if provided
      aiConfig: formulaData.aiConfig || null,
      // Marketing content - Pazarlama içeriği
      productDescription: formulaData.productDescription || "",
      usageInstructions: formulaData.usageInstructions || "",
      benefits: formulaData.benefits || "",
      recommendations: formulaData.recommendations || "",
      warnings: formulaData.warnings || "",
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
 *
 * YENİ MİMARİ: Prompt artık Firestore'dan (ai_prompts koleksiyonu) dinamik olarak geliyor.
 * Page tarafında useUnifiedAI hook'u ile firestorePrompt alınır ve promptConfig olarak geçilir.
 *
 * @param {Object} productInfo - Product information
 * @param {Function} sendMessage - AI message function (useUnifiedAI generateContent wrapper)
 * @param {Object} promptConfig - Firestore'dan gelen prompt config (systemPrompt, userPromptTemplate)
 * @returns {Promise<Object>} Generated formula object
 */
export async function generateAIFormula(
  productInfo,
  sendMessage,
  promptConfig = null
) {
  // Convert numeric level (1-10) to formula specifications
  const level = productInfo.formulaLevel || 5;
  const selectedModel = productInfo.selectedModel || null;
  const levelSpecs = getLevelSpecs(level);

  // Üretim miktarına göre toplam kg hesapla
  // productVolumeGram veya productVolume olarak gelebilir (page.js uyumluluğu)
  const productVolumeGram = parseFloat(productInfo.productVolumeGram || productInfo.productVolume) || 100;
  const productionQuantity = parseInt(productInfo.productionQuantity) || 1000;
  const totalProductionKg = (productVolumeGram * productionQuantity) / 1000;

  // Template değişkenleri hazırla
  const templateVariables = {
    productName: productInfo.productName || "",
    productType: productInfo.productType || "kozmetik",
    productCategory: productInfo.productCategory || productInfo.productType || "kozmetik",
    subcategory: productInfo.subcategory || "",
    productVolumeGram: productVolumeGram.toString(),
    productionQuantity: productionQuantity.toString(),
    totalProductionKg: totalProductionKg.toFixed(2),
    level: level.toString(),
    levelName: levelSpecs.name || "",
    levelDescription: levelSpecs.description || "",
    levelSpecs: levelSpecs,
    description: productInfo.description || "Yok",
    
    // Gelişmiş parametreler (v2.0)
    minIngredients: (productInfo.minIngredients || levelSpecs.ingredientCount?.min || 10).toString(),
    maxIngredients: (productInfo.maxIngredients || levelSpecs.ingredientCount?.max || 20).toString(),
    minActives: (productInfo.minActives || levelSpecs.activeCount?.min || 2).toString(),
    maxActives: (productInfo.maxActives || levelSpecs.activeCount?.max || 5).toString(),
    quality: levelSpecs.quality || "standard",
    priceMultiplier: (levelSpecs.priceMultiplier || 1.0).toString(),
    ingredientQuality: productInfo.ingredientQuality || "standard",
    targetAudience: productInfo.targetAudience || "all_skin",
    certifications: Array.isArray(productInfo.certifications) 
      ? productInfo.certifications.join(", ") 
      : (productInfo.certifications || "Yok"),
    excludeIngredients: productInfo.excludeIngredients || "Yok",
    mustInclude: productInfo.mustInclude || "Yok",
  };

  // Firestore'dan gelen prompt zorunlu - systemPrompt veya content alanı olmalı
  // v4.0 promptları systemPrompt/userPromptTemplate kullanır
  // Eski promptlar content alanı kullanabilir
  const hasValidPrompt = promptConfig?.systemPrompt || promptConfig?.content;
  if (!hasValidPrompt) {
    throw new Error(
      "Firestore'da prompt bulunamadı. Lütfen admin panelinden AI prompt ayarlarını yapılandırın."
    );
  }

  // System prompt: v4 yapısı varsa kullan, yoksa content'ten çıkar
  let systemPromptForAI;
  let userPrompt;
  
  if (promptConfig.systemPrompt) {
    // v4.0 yapısı - ayrı system ve user prompt
    systemPromptForAI = replaceTemplateVariables(
      promptConfig.systemPrompt,
      templateVariables
    );
    
    userPrompt = promptConfig.userPromptTemplate
      ? replaceTemplateVariables(
          promptConfig.userPromptTemplate,
          templateVariables
        )
      : `${templateVariables.productVolumeGram} gram hacimli ${templateVariables.productType} formülünü oluştur.`;
  } else {
    // Eski yapı - content alanından system prompt olarak kullan
    systemPromptForAI = replaceTemplateVariables(
      promptConfig.content,
      templateVariables
    );
    userPrompt = `${templateVariables.productVolumeGram} gram hacimli ${templateVariables.productType} formülünü oluştur.`;
  }

  // JSON output instructions - dinamik değerlerle
  const jsonInstructions = getJsonOutputInstructions(
    productVolumeGram,
    productionQuantity,
    totalProductionKg.toFixed(2)
  );
  userPrompt = userPrompt + "\n" + jsonInstructions;

  console.log(
    "[FormulaService] Using Firestore prompt:",
    promptConfig.key || promptConfig.name
  );
  console.log(
    "[FormulaService] SystemPrompt length:",
    systemPromptForAI.length,
    "UserPrompt length:",
    userPrompt.length
  );

  try {
    const response = await sendMessage(userPrompt, {
      // maxTokens page/UI'dan gelir, sendMessage wrapper'ı kendi değerini kullanır
      type: "generate",
      model: selectedModel,
      // System prompt'u ayrı parametre olarak gönder
      systemPrompt: systemPromptForAI,
    });

    // Parse AI response
    return parseFormulaResponse(response);
  } catch (error) {
    console.error("AI formula generation error:", error);
    throw error;
  }
}

/**
 * AI response'unu parse eder
 */
function parseFormulaResponse(response) {
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

    // Log first 500 chars for debugging
    console.log("Raw JSON preview:", jsonStr.substring(0, 500));

    // Enhanced aggressive cleanup for AI-generated JSON
    jsonStr = cleanupJsonString(jsonStr);

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
      // Initial parse failed, trying recovery methods (this is expected for some AI responses)
      console.warn(
        "[FormulaService] Initial JSON parse failed, attempting recovery..."
      );

      // Try parsing individual objects from formula array
      const formulaItems = tryExtractFormulaItems(jsonStr);
      if (formulaItems && formulaItems.length > 0) {
        console.log(
          "[FormulaService] ✓ Successfully extracted",
          formulaItems.length,
          "formula items using object extraction"
        );
        return {
          formula: formulaItems,
          totalEstimatedCost: "0.00",
          costPerUnit: "0.00",
          productionNotes: [],
          suggestions: "",
        };
      }

      // Try to extract and parse formula array using bracket matching
      try {
        const formulaStart = jsonStr.indexOf('"formula"');
        if (formulaStart !== -1) {
          const arrayStart = jsonStr.indexOf("[", formulaStart);
          if (arrayStart !== -1) {
            let depth = 0;
            let arrayEnd = -1;
            for (let i = arrayStart; i < jsonStr.length; i++) {
              if (jsonStr[i] === "[") depth++;
              if (jsonStr[i] === "]") depth--;
              if (depth === 0) {
                arrayEnd = i;
                break;
              }
            }

            if (arrayEnd !== -1) {
              let formulaArrayContent = jsonStr.substring(
                arrayStart,
                arrayEnd + 1
              );
              formulaArrayContent = cleanupJsonString(formulaArrayContent);

              const reconstructedJson = `{"formula": ${formulaArrayContent}}`;
              const parsedFormula = JSON.parse(reconstructedJson);

              if (
                parsedFormula.formula &&
                Array.isArray(parsedFormula.formula) &&
                parsedFormula.formula.length > 0
              ) {
                console.log(
                  "[FormulaService] ✓ Successfully parsed formula with",
                  parsedFormula.formula.length,
                  "ingredients via bracket matching"
                );
                return {
                  formula: parsedFormula.formula,
                  totalEstimatedCost: "0.00",
                  costPerUnit: "0.00",
                  productionNotes: [],
                  suggestions: "",
                };
              }
            }
          }
        }
      } catch (bracketMatchError) {
        // Bracket matching failed, continue to next method
      }

      // Last resort - try extracting objects again with different approach
      const lastResortItems = tryExtractFormulaItemsLastResort(jsonStr);
      if (lastResortItems && lastResortItems.length > 0) {
        console.log(
          "[FormulaService] ✓ Last resort extraction successful with",
          lastResortItems.length,
          "items"
        );
        return {
          formula: lastResortItems,
          totalEstimatedCost: "0.00",
          costPerUnit: "0.00",
          productionNotes: [],
          suggestions: "",
        };
      }

      // All recovery methods failed
      console.error(
        "[FormulaService] All JSON recovery methods failed. Original error:",
        parseError.message
      );
      throw new Error(
        `JSON parse hatası: ${parseError.message}. Lütfen farklı bir model deneyin veya parametreleri değiştirin.`
      );
    }
  } else {
    throw new Error("JSON formatı bulunamadı");
  }
}

/**
 * JSON string'i temizler
 */
function cleanupJsonString(str) {
  return (
    str
      // Remove newlines and normalize whitespace first
      .replace(/\n/g, " ")
      .replace(/\r/g, "")
      .replace(/\t/g, " ")
      // Fix common AI mistakes: missing commas between array elements
      .replace(/"\s*}\s*{\s*"/g, '" }, { "')
      .replace(/(\d+\.?\d*)\s*}\s*{\s*"/g, '$1 }, { "')
      .replace(/}\s*{/g, "}, {")
      // Fix missing comma after string value before next key
      .replace(/"\s+"(?=[a-zA-Z])/g, '", "')
      // Fix missing comma after number before next key
      .replace(/(\d+\.?\d*)\s+"(?=[a-zA-Z])/g, '$1, "')
      // Fix missing comma after closing brace before quote
      .replace(/}\s+"(?=[a-zA-Z])/g, '}, "')
      // Fix missing comma after closing bracket before quote
      .replace(/]\s+"(?=[a-zA-Z])/g, '], "')
      // Fix missing comma after true/false/null before quote
      .replace(/(true|false|null)\s+"(?=[a-zA-Z])/g, '$1, "')
      // Remove trailing commas before closing brackets/braces
      .replace(/,(\s*[}\]])/g, "$1")
      // Remove double commas
      .replace(/,\s*,/g, ",")
      // Remove leading commas in arrays/objects
      .replace(/\[\s*,/g, "[")
      .replace(/{\s*,/g, "{")
      // Fix numbers followed by closing brace with extra space
      .replace(/(\d+)\s+}/g, "$1}")
      .replace(/(\d+)\s+,/g, "$1,")
      // Fix colon followed by number then quote without comma
      .replace(/:\s*(\d+\.?\d*)\s+"(?=[a-zA-Z])/g, ': $1, "')
      // Normalize multiple spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Formula array'inden objeleri tek tek çıkarır
 */
function tryExtractFormulaItems(jsonStr) {
  try {
    // Find formula array content
    const formulaMatch = jsonStr.match(/"formula"\s*:\s*\[/);
    if (!formulaMatch) return null;

    const arrayStartIndex = jsonStr.indexOf("[", formulaMatch.index);
    if (arrayStartIndex === -1) return null;

    // Extract content between first [ after "formula" and find objects
    const items = [];
    let depth = 0;
    let objectStart = -1;

    for (let i = arrayStartIndex; i < jsonStr.length; i++) {
      const char = jsonStr[i];

      if (char === "{") {
        if (depth === 1) {
          // We're inside the formula array
          objectStart = i;
        }
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 1 && objectStart !== -1) {
          // Completed an object inside formula array
          const objectStr = jsonStr.substring(objectStart, i + 1);
          try {
            const obj = JSON.parse(objectStr);
            if (obj.name || obj.ingredient) {
              // Valid formula item
              items.push(obj);
            }
          } catch (e) {
            // Try to fix and parse the object
            const fixedObj = tryFixAndParseObject(objectStr);
            if (fixedObj) items.push(fixedObj);
          }
          objectStart = -1;
        }
      } else if (char === "[") {
        depth++;
      } else if (char === "]") {
        depth--;
        if (depth === 0) break; // End of formula array
      }
    }

    return items.length > 0 ? items : null;
  } catch (e) {
    console.error("tryExtractFormulaItems error:", e);
    return null;
  }
}

/**
 * Tek bir objeyi düzeltip parse etmeye çalışır
 */
function tryFixAndParseObject(objStr) {
  try {
    // Clean up the object string
    let fixed = objStr
      // Fix truncated field names (AI sometimes cuts off)
      .replace(/"estimatedPr[^"]*"?\s*:?\s*$/g, "")
      .replace(/"estimated[^"]*"?\s*:?\s*$/g, "")
      .replace(/"functio[^"]*"?\s*:?\s*$/g, "")
      .replace(/"amoun[^"]*"?\s*:?\s*$/g, "")
      .replace(/"displayNam[^"]*"?\s*:?\s*$/g, "")
      // Remove incomplete key-value pairs at the end
      .replace(/,\s*"[^"]*"?\s*:?\s*$/g, "")
      .replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/g, "")
      // Standard fixes
      .replace(/"\s+"(?=[a-zA-Z])/g, '", "')
      .replace(/(\d+\.?\d*)\s+"(?=[a-zA-Z])/g, '$1, "')
      .replace(/,(\s*})/g, "$1")
      .replace(/,\s*,/g, ",")
      .trim();

    // Ensure object ends properly
    if (!fixed.endsWith("}")) {
      // Try to close the object
      const lastValidPart = fixed.match(
        /^(.*"[^"]+"\s*:\s*(?:"[^"]*"|[\d.]+|true|false|null))\s*,?\s*.*$/
      );
      if (lastValidPart) {
        fixed = lastValidPart[1] + "}";
      } else {
        // Just close it
        fixed = fixed.replace(/,\s*$/, "") + "}";
      }
    }

    return JSON.parse(fixed);
  } catch (e) {
    return null;
  }
}

/**
 * Son çare: regex ile objeleri çıkar
 */
function tryExtractFormulaItemsLastResort(jsonStr) {
  try {
    const items = [];
    // Match objects with name/ingredient field
    const objectPattern = /\{[^{}]*"(?:name|ingredient)"[^{}]*\}/g;
    let match;

    while ((match = objectPattern.exec(jsonStr)) !== null) {
      try {
        const obj = JSON.parse(match[0]);
        if (obj.name || obj.ingredient) {
          items.push(obj);
        }
      } catch (e) {
        const fixed = tryFixAndParseObject(match[0]);
        if (fixed) items.push(fixed);
      }
    }

    return items.length > 0 ? items : null;
  } catch (e) {
    console.error("tryExtractFormulaItemsLastResort error:", e);
    return null;
  }
}

/**
 * Get AI price suggestion for an ingredient
 *
 * YENİ MİMARİ: Prompt artık Firestore'dan (ai_prompts koleksiyonu) dinamik olarak geliyor.
 *
 * @param {Object} ingredientInfo - Ingredient information
 * @param {Function} sendMessage - AI message function (useUnifiedAI generateContent wrapper)
 * @param {Object} promptConfig - Firestore'dan gelen prompt config (opsiyonel)
 * @returns {Promise<Object>} Price data objects
 */
export async function getAIIngredientPrice(
  ingredientInfo,
  sendMessage,
  promptConfig = null
) {
  // Template değişkenleri hazırla
  const templateVariables = {
    ingredientName: ingredientInfo.name || "",
    ingredientAmount: ingredientInfo.amount?.toString() || "Belirtilmedi",
    ingredientUnit: ingredientInfo.unit || "kg",
    ingredientSupplier: ingredientInfo.supplier || "Yok",
    productType: ingredientInfo.productType || "genel",
    productName: ingredientInfo.productName || "",
  };

  let userPrompt = "";
  let systemPromptForAI = "";

  // ✅ FIX: System prompt'u AYRI gönder - token tekrarını önler
  if (promptConfig?.systemPrompt) {
    systemPromptForAI = replaceTemplateVariables(
      promptConfig.systemPrompt,
      templateVariables
    );
    userPrompt = promptConfig.userPromptTemplate
      ? replaceTemplateVariables(
          promptConfig.userPromptTemplate,
          templateVariables
        )
      : `${templateVariables.ingredientName} hammaddesi için Türkiye piyasa fiyat analizi yap.`;

    console.log(
      "[FormulaService] Using Firestore prompt for price analysis (optimized):",
      promptConfig.key || promptConfig.name
    );
  } else {
    // Fallback: Minimal prompt
    console.warn(
      "[FormulaService] No Firestore prompt found for price analysis, using fallback"
    );
    userPrompt = buildFallbackPricePrompt(templateVariables);
    systemPromptForAI =
      "Sen profesyonel bir kozmetik/gıda hammaddesi piyasa fiyat analistisin. Türkiye pazarında güncel fiyatları araştırıyorsun.";
  }

  try {
    const response = await sendMessage(userPrompt, {
      maxTokens: 2000,
      type: "generate",
      // ✅ System prompt'u ayrı parametre olarak gönder
      systemPrompt: systemPromptForAI,
    });

    // Parse AI response
    return parsePriceResponse(response);
  } catch (error) {
    console.error("AI price fetch error:", error);
    throw error;
  }
}

/**
 * Fallback price prompt builder
 */
function buildFallbackPricePrompt(variables) {
  return `Sen profesyonel bir kozmetik/gıda hammaddesi piyasa fiyat analistisin. Türkiye pazarında güncel fiyatları araştırıyorsun.

HAMMADDE BİLGİLERİ:
- Hammadde: ${variables.ingredientName}
- Miktar: ${variables.ingredientAmount} ${variables.ingredientUnit}
- Tedarikçi: ${variables.ingredientSupplier}
- Kategori: ${variables.productType}

GÖREV:
Bu hammadde için Türkiye piyasasında 2024-2025 güncel fiyat analizi yap.

KURALLAR:
✓ Fiyat = TL/kg bazında
✓ Gerçek piyasa fiyatlarını araştır
✓ Türkiye'deki bilinen tedarikçileri öner

JSON FORMATINDA CEVAP VER:
{
  "estimatedPrice": 125.50,
  "priceRange": { "min": 85.00, "max": 180.00 },
  "unit": "TL/kg",
  "currency": "TL",
  "notes": "Piyasa notları",
  "confidenceLevel": "yüksek"
}

NOT: Sadece JSON döndür, başka açıklama yazma.`;
}

/**
 * Parse price response
 */
function parsePriceResponse(response) {
  let jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonStr = jsonMatch ? jsonMatch[1].trim() : null;

  if (!jsonStr) {
    jsonMatch = response.match(/(\{[\s\S]*?\})/);
    jsonStr = jsonMatch ? jsonMatch[1] : null;
  }

  if (jsonStr) {
    jsonStr = jsonStr
      .replace(/,(\s*[}\]])/g, "$1")
      .replace(/\n/g, " ")
      .replace(/\r/g, "")
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error in price suggestion:", parseError);

      const startIndex = jsonStr.indexOf("{");
      const lastIndex = jsonStr.lastIndexOf("}");

      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        const extractedJson = jsonStr.substring(startIndex, lastIndex + 1);
        try {
          return JSON.parse(extractedJson);
        } catch (secondError) {
          console.error("Second parse attempt failed:", secondError);
        }
      }

      throw new Error(`JSON parse hatası: ${parseError.message}`);
    }
  } else {
    throw new Error("JSON formatı bulunamadı");
  }
}

// ============================================================================
// v4.0 - YENİ MİMARİ: Kategori Bazlı Formül Üretimi
// AI hesaplama yapmaz, sadece yüzde ve fiyat tahmini verir
// Tüm hesaplamalar backend'de yapılır
// ============================================================================

/**
 * v4.0 - Kategori bazlı profesyonel formül üretimi
 * 
 * Yeni özellikler:
 * - 4 ayrı kategori prompt'u (cosmetic, dermocosmetic, cleaning, supplement)
 * - AI sadece yüzde ve TL/kg fiyat verir
 * - Tüm miktar/maliyet hesaplamaları backend'de
 * - ingredients_price DB entegrasyonu
 * 
 * @param {Object} productInfo - Ürün bilgileri
 * @param {Function} sendMessage - AI mesaj fonksiyonu
 * @param {Object} promptConfig - Firestore'dan gelen prompt (opsiyonel, yoksa kategori bazlı seçilir)
 * @returns {Promise<Object>} İşlenmiş formül objesi
 */
export async function generateAIFormulaV4(
  productInfo,
  sendMessage,
  promptConfig = null
) {
  const startTime = Date.now();
  
  // 1. Temel parametreleri hazırla
  const category = productInfo.productCategory || productInfo.category || 'cosmetic';
  const level = productInfo.formulaLevel || 5;
  const selectedModel = productInfo.selectedModel || null;
  const levelSpecs = getLevelSpecs(level);
  
  const productVolumeGram = parseFloat(productInfo.productVolumeGram || productInfo.productVolume) || 100;
  const productionQuantity = parseInt(productInfo.productionQuantity) || 1000;
  const totalProductionKg = (productVolumeGram * productionQuantity) / 1000;

  console.log(`[FormulaService v4] Kategori: ${category}, Seviye: ${level}, Hacim: ${productVolumeGram}g`);

  // 2. Prompt seçimi: Firestore'dan gelen varsa kullan, yoksa kategori bazlı seç
  let activePrompt = promptConfig;
  if (!activePrompt?.systemPrompt) {
    activePrompt = getPromptByCategory(category);
    console.log(`[FormulaService v4] Kategori bazlı prompt seçildi: ${activePrompt.key}`);
  }

  // 3. Template değişkenlerini hazırla
  const templateVariables = {
    productName: productInfo.productName || "",
    productCategory: category,
    subcategory: productInfo.subcategory || "",
    productType: productInfo.productType || "",
    productVolumeGram: productVolumeGram.toString(),
    productionQuantity: productionQuantity.toString(),
    totalProductionKg: totalProductionKg.toFixed(2),
    level: level.toString(),
    levelName: levelSpecs.name || "",
    levelDescription: levelSpecs.description || "",
    minIngredients: (productInfo.minIngredients || levelSpecs.ingredientCount?.min || 10).toString(),
    maxIngredients: (productInfo.maxIngredients || levelSpecs.ingredientCount?.max || 20).toString(),
    targetAudience: productInfo.targetAudience || "Genel",
    certifications: Array.isArray(productInfo.certifications) 
      ? productInfo.certifications.join(", ") 
      : (productInfo.certifications || "Yok"),
    excludeIngredients: productInfo.excludeIngredients || "Yok",
    mustInclude: productInfo.mustInclude || "Yok",
    description: productInfo.description || "",
  };

  // 4. Prompt'ları hazırla
  const systemPromptForAI = replaceTemplateVariables(
    activePrompt.systemPrompt,
    templateVariables
  );
  
  const userPrompt = replaceTemplateVariables(
    activePrompt.userPromptTemplate,
    templateVariables
  );

  console.log(`[FormulaService v4] SystemPrompt: ${systemPromptForAI.length} karakter`);
  console.log(`[FormulaService v4] UserPrompt: ${userPrompt.length} karakter`);

  try {
    // 5. AI'dan ham formül al
    const response = await sendMessage(userPrompt, {
      type: "generate",
      model: selectedModel,
      systemPrompt: systemPromptForAI,
      maxTokens: activePrompt.defaultSettings?.maxTokens || 8000,
    });

    // 6. AI response'unu parse et
    const rawFormula = parseFormulaResponseV4(response);
    
    // 7. Backend'de hesaplamaları yap
    const processedFormula = await processFormulaCalculations(
      rawFormula,
      productVolumeGram,
      productionQuantity
    );

    // 8. Validasyon
    const validation = validateFormula(processedFormula);
    if (!validation.isValid) {
      console.warn(`[FormulaService v4] Validasyon uyarıları:`, validation.errors);
    }

    const elapsed = Date.now() - startTime;
    console.log(`[FormulaService v4] ✓ Formül üretildi (${elapsed}ms) - ${processedFormula.formula.length} hammadde`);

    return {
      ...processedFormula,
      validation: validation,
      generationInfo: {
        category: category,
        promptKey: activePrompt.key,
        promptVersion: activePrompt.version,
        elapsedMs: elapsed,
        model: selectedModel,
      }
    };

  } catch (error) {
    console.error("[FormulaService v4] Formül üretim hatası:", error);
    throw error;
  }
}

/**
 * v4 JSON response parser
 * Daha esnek parsing - AI'ın verdiği formata uyum sağlar
 */
function parseFormulaResponseV4(response) {
  // Markdown code block'u temizle
  let jsonStr = response;
  
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  } else {
    // Direkt JSON bul
    const jsonMatch = response.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
  }

  // Temizle
  jsonStr = cleanupJsonString(jsonStr);

  try {
    const parsed = JSON.parse(jsonStr);
    
    // formula array'i var mı kontrol et
    if (parsed.formula && Array.isArray(parsed.formula) && parsed.formula.length > 0) {
      return parsed;
    }
    
    throw new Error("formula array bulunamadı veya boş");
  } catch (parseError) {
    console.warn("[FormulaService v4] İlk parse başarısız, recovery deneniyor...");
    
    // Recovery: formula array'i extract et
    const formulaItems = tryExtractFormulaItems(jsonStr);
    if (formulaItems && formulaItems.length > 0) {
      console.log(`[FormulaService v4] Recovery başarılı: ${formulaItems.length} hammadde`);
      return {
        formula: formulaItems,
        manufacturing: {},
        quality: {},
        compliance: {},
        suggestions: "",
      };
    }
    
    // Last resort
    const lastResort = tryExtractFormulaItemsLastResort(jsonStr);
    if (lastResort && lastResort.length > 0) {
      console.log(`[FormulaService v4] Last resort başarılı: ${lastResort.length} hammadde`);
      return {
        formula: lastResort,
        manufacturing: {},
        quality: {},
        compliance: {},
        suggestions: "",
      };
    }
    
    throw new Error(`JSON parse hatası: ${parseError.message}`);
  }
}

/**
 * Tek bir hammadde için DB'den veya AI'dan fiyat al
 * @param {string} ingredientName - Hammadde adı
 * @param {Function} sendMessage - AI mesaj fonksiyonu (opsiyonel)
 * @returns {Promise<Object>} Fiyat bilgisi
 */
export async function getIngredientPriceV4(ingredientName, sendMessage = null) {
  // 1. Önce DB'den dene
  const dbPrice = await findBestPriceMatch(ingredientName);
  if (dbPrice) {
    return {
      source: 'database',
      priceTLperKg: dbPrice.priceTLperKg,
      supplier: dbPrice.supplier,
      lastUpdated: dbPrice.priceDate,
      confidence: 'high',
    };
  }
  
  // 2. DB'de yoksa ve AI varsa, AI'dan al
  if (sendMessage) {
    try {
      const aiPrice = await getAIPriceEstimate(ingredientName, sendMessage);
      return {
        source: 'ai_estimate',
        priceTLperKg: aiPrice.estimatedPrice || 0,
        supplier: aiPrice.suggestedSupplier || '',
        confidence: aiPrice.confidenceLevel || 'low',
        notes: aiPrice.notes || '',
      };
    } catch (error) {
      console.warn(`[FormulaService v4] AI fiyat alınamadı: ${ingredientName}`, error.message);
    }
  }
  
  // 3. Hiçbiri yoksa null
  return null;
}

/**
 * AI'dan fiyat tahmini al (grounding destekli - gelecekte)
 */
async function getAIPriceEstimate(ingredientName, sendMessage) {
  const prompt = `Türkiye'de "${ingredientName}" hammaddesinin 2025 toptan fiyatı nedir?

JSON formatında yanıtla:
{
  "ingredientName": "${ingredientName}",
  "estimatedPrice": 0,
  "unit": "TL/kg",
  "priceRange": { "min": 0, "max": 0 },
  "suggestedSupplier": "Tedarikçi adı",
  "confidenceLevel": "high/medium/low",
  "notes": "Notlar"
}

SADECE JSON döndür.`;

  const response = await sendMessage(prompt, {
    type: "generate",
    maxTokens: 500,
    systemPrompt: "Sen Türkiye kimya/kozmetik sektöründe uzman bir fiyat analistisin. Gerçek piyasa fiyatları hakkında bilgi veriyorsun.",
  });

  return parsePriceResponse(response);
}

/**
 * Formülden elde edilen fiyatları DB'ye kaydet (opsiyonel)
 */
export async function saveFormulaPricesToDB(formula) {
  const results = {
    saved: 0,
    skipped: 0,
    errors: [],
  };
  
  for (const ingredient of formula.formula) {
    // Sadece AI tahmini olanları kaydet (DB'den gelenler zaten var)
    if (ingredient.priceSource === 'ai_estimate' && ingredient.priceTLperKg > 0) {
      try {
        await saveIngredientPrice({
          inciName: ingredient.inciName || ingredient.tradeName,
          aliases: [ingredient.tradeName?.toLowerCase()].filter(Boolean),
          category: categorizeIngredient(ingredient.function),
          priceTLperKg: ingredient.priceTLperKg,
          supplier: ingredient.supplier || '',
          priceSource: 'formula_ai_estimate',
          notes: `Formül üretiminden otomatik kaydedildi`,
        });
        results.saved++;
      } catch (error) {
        results.errors.push({ ingredient: ingredient.inciName, error: error.message });
      }
    } else {
      results.skipped++;
    }
  }
  
  return results;
}

/**
 * Fonksiyona göre kategori belirle
 */
function categorizeIngredient(functionName) {
  const fn = (functionName || '').toLowerCase();
  
  if (fn.includes('emollient') || fn.includes('yumuşatıcı')) return 'emollient';
  if (fn.includes('humectant') || fn.includes('nem')) return 'humectant';
  if (fn.includes('preservative') || fn.includes('koruyucu')) return 'preservative';
  if (fn.includes('emulsifier') || fn.includes('emülgatör')) return 'emulsifier';
  if (fn.includes('surfactant') || fn.includes('yüzey aktif')) return 'surfactant';
  if (fn.includes('thicken') || fn.includes('koyulaştırıcı')) return 'thickener';
  if (fn.includes('antioxidant') || fn.includes('antioksidan')) return 'antioxidant';
  if (fn.includes('active') || fn.includes('aktif')) return 'active';
  if (fn.includes('fragrance') || fn.includes('parfüm')) return 'fragrance';
  if (fn.includes('oil') || fn.includes('yağ')) return 'carrier_oil';
  if (fn.includes('solvent') || fn.includes('çözücü')) return 'solvent';
  
  return 'other';
}

