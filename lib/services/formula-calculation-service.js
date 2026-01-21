/**
 * Formula Calculation Service
 * ===========================
 * AI'dan gelen yüzde bazlı formülü işleyip
 * miktar ve maliyet hesaplamalarını yapan servis.
 * 
 * AI HESAPLAMA YAPMAZ - Tüm matematik işlemleri burada yapılır.
 * 
 * @version 1.0
 * @author MKN Group R&D
 */

import { getIngredientPrice, findBestPriceMatch } from './ingredients-price-service';

// ============================================================================
// ANA HESAPLAMA FONKSİYONLARI
// ============================================================================

/**
 * AI'dan gelen ham formülü işler ve hesaplamaları yapar
 * @param {Object} rawFormula - AI'dan gelen formül objesi
 * @param {number} targetVolumeGram - Hedef hacim (gram)
 * @param {number} productionQuantity - Üretim adedi
 * @returns {Object} İşlenmiş formül
 */
export async function processFormulaCalculations(rawFormula, targetVolumeGram, productionQuantity) {
  const totalBatchKg = (targetVolumeGram * productionQuantity) / 1000;
  
  // Yüzdelerin toplamını kontrol et
  const totalPercentage = rawFormula.formula.reduce((sum, ing) => {
    return sum + (parseFloat(ing.percentage) || 0);
  }, 0);
  
  // Yüzde toplamı 100 değilse normalize et
  const normalizationFactor = totalPercentage > 0 ? 100 / totalPercentage : 1;
  
  // Her hammadde için hesaplamaları yap
  const processedFormula = await Promise.all(rawFormula.formula.map(async (ingredient) => {
    // Normalize edilmiş yüzde
    const normalizedPercentage = parseFloat(((parseFloat(ingredient.percentage) || 0) * normalizationFactor).toFixed(4));
    
    // Miktar hesapla (gram)
    const amountGram = parseFloat(((normalizedPercentage / 100) * targetVolumeGram).toFixed(4));
    
    // DB'den fiyat kontrolü yap, yoksa AI'ın verdiğini kullan
    let priceTLperKg = parseFloat(ingredient.estimatedPriceTLperKg) || 0;
    let priceSource = 'ai_estimate';
    
    try {
      const dbPrice = await findBestPriceMatch(ingredient.inciName || ingredient.tradeName);
      if (dbPrice) {
        priceTLperKg = dbPrice.priceTLperKg;
        priceSource = 'database';
      }
    } catch (error) {
      console.warn(`[FormulaCalc] DB fiyat bulunamadı: ${ingredient.inciName}`, error.message);
    }
    
    // Birim maliyet hesapla
    const costPerUnit = parseFloat(((amountGram / 1000) * priceTLperKg).toFixed(4));
    
    // Batch maliyet hesapla
    const costForBatch = parseFloat((costPerUnit * productionQuantity).toFixed(2));
    
    return {
      // Temel bilgiler
      inciName: ingredient.inciName || '',
      tradeName: ingredient.tradeName || ingredient.inciName || '',
      function: ingredient.function || '',
      functionTr: ingredient.functionTr || translateFunction(ingredient.function),
      phase: ingredient.phase || '',
      supplier: ingredient.supplier || '',
      notes: ingredient.notes || '',
      
      // Hesaplanan değerler
      percentage: normalizedPercentage,
      amount: amountGram,
      unit: 'gram',
      
      // Fiyat bilgileri
      priceTLperKg: priceTLperKg,
      priceSource: priceSource,
      costPerUnit: costPerUnit,
      costForBatch: costForBatch,
    };
  }));
  
  // Toplamları hesapla
  const totals = calculateTotals(processedFormula, targetVolumeGram, productionQuantity);
  
  return {
    meta: {
      ...rawFormula.meta,
      productName: rawFormula.meta?.productName || 'İsimsiz Ürün',
      targetVolumeGram: targetVolumeGram,
      productionQuantity: productionQuantity,
      totalBatchKg: totalBatchKg,
      calculatedAt: new Date().toISOString(),
      version: '4.0',
    },
    formula: processedFormula,
    totals: totals,
    manufacturing: rawFormula.manufacturing || {},
    quality: rawFormula.quality || {},
    compliance: rawFormula.compliance || {},
    suggestions: rawFormula.suggestions || '',
  };
}

/**
 * Toplamları hesaplar
 * @param {Array} formula - İşlenmiş hammadde listesi
 * @param {number} targetVolumeGram - Hedef hacim
 * @param {number} productionQuantity - Üretim adedi
 * @returns {Object} Toplam değerler
 */
function calculateTotals(formula, targetVolumeGram, productionQuantity) {
  const totalWeight = formula.reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0);
  const totalPercentage = formula.reduce((sum, ing) => sum + (parseFloat(ing.percentage) || 0), 0);
  const totalCostPerUnit = formula.reduce((sum, ing) => sum + (parseFloat(ing.costPerUnit) || 0), 0);
  const totalCostForBatch = formula.reduce((sum, ing) => sum + (parseFloat(ing.costForBatch) || 0), 0);
  
  // DB'den fiyat alınan ve AI tahmini kullanan hammadde sayıları
  const dbPriceCount = formula.filter(ing => ing.priceSource === 'database').length;
  const aiPriceCount = formula.filter(ing => ing.priceSource === 'ai_estimate').length;
  
  return {
    totalWeight_g: parseFloat(totalWeight.toFixed(4)),
    totalPercentage: parseFloat(totalPercentage.toFixed(2)),
    percentageValid: Math.abs(totalPercentage - 100) < 0.01, // %0.01 tolerans
    weightValid: Math.abs(totalWeight - targetVolumeGram) < 0.1, // 0.1g tolerans
    
    // Maliyet toplamları
    costPerUnit_TL: parseFloat(totalCostPerUnit.toFixed(4)),
    costForBatch_TL: parseFloat(totalCostForBatch.toFixed(2)),
    costPerGram_TL: parseFloat((totalCostPerUnit / targetVolumeGram).toFixed(6)),
    
    // Fiyat kaynağı istatistikleri
    priceStats: {
      fromDatabase: dbPriceCount,
      fromAI: aiPriceCount,
      total: formula.length,
      dbCoverage: parseFloat(((dbPriceCount / formula.length) * 100).toFixed(1)),
    },
  };
}

/**
 * Tek bir hammadde için miktar hesaplar
 * @param {number} percentage - Yüzde oranı
 * @param {number} targetVolumeGram - Hedef hacim
 * @returns {number} Miktar (gram)
 */
export function calculateAmount(percentage, targetVolumeGram) {
  return parseFloat(((percentage / 100) * targetVolumeGram).toFixed(4));
}

/**
 * Birim maliyet hesaplar
 * @param {number} amountGram - Miktar (gram)
 * @param {number} priceTLperKg - Kg fiyatı (TL)
 * @returns {number} Maliyet (TL)
 */
export function calculateCost(amountGram, priceTLperKg) {
  return parseFloat(((amountGram / 1000) * priceTLperKg).toFixed(4));
}

/**
 * Yüzde oranını normalleştirir (toplam 100 olacak şekilde)
 * @param {Array} percentages - Yüzde değerleri dizisi
 * @returns {Array} Normalleştirilmiş yüzde değerleri
 */
export function normalizePercentages(percentages) {
  const total = percentages.reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
  
  if (total === 0) return percentages.map(() => 0);
  
  const factor = 100 / total;
  return percentages.map(p => parseFloat(((parseFloat(p) || 0) * factor).toFixed(4)));
}

/**
 * Formül validasyonu yapar
 * @param {Object} formula - İşlenmiş formül objesi
 * @returns {Object} Validasyon sonucu
 */
export function validateFormula(formula) {
  const errors = [];
  const warnings = [];
  
  // Yüzde toplamı kontrolü
  const totalPercentage = formula.formula.reduce((sum, ing) => sum + (parseFloat(ing.percentage) || 0), 0);
  if (Math.abs(totalPercentage - 100) >= 0.1) {
    errors.push(`Yüzde toplamı ${totalPercentage.toFixed(2)}% - 100% olmalı`);
  }
  
  // Ağırlık toplamı kontrolü
  const totalWeight = formula.formula.reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0);
  const targetWeight = formula.meta?.targetVolumeGram || 0;
  if (Math.abs(totalWeight - targetWeight) >= 1) {
    errors.push(`Ağırlık toplamı ${totalWeight.toFixed(2)}g - ${targetWeight}g olmalı`);
  }
  
  // Fiyat kontrolü
  const missingPrices = formula.formula.filter(ing => !ing.priceTLperKg || ing.priceTLperKg === 0);
  if (missingPrices.length > 0) {
    warnings.push(`${missingPrices.length} hammadde için fiyat bilgisi eksik`);
  }
  
  // AI tahminli fiyat uyarısı
  const aiPriceCount = formula.formula.filter(ing => ing.priceSource === 'ai_estimate').length;
  if (aiPriceCount > 0) {
    warnings.push(`${aiPriceCount} hammadde AI fiyat tahmini kullanıyor`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    summary: {
      totalPercentage: parseFloat(totalPercentage.toFixed(2)),
      totalWeight: parseFloat(totalWeight.toFixed(4)),
      ingredientCount: formula.formula.length,
      aiPriceCount: aiPriceCount,
    }
  };
}

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * İngilizce fonksiyon adını Türkçeye çevirir
 * @param {string} functionEn - İngilizce fonksiyon adı
 * @returns {string} Türkçe karşılık
 */
function translateFunction(functionEn) {
  const translations = {
    'Solvent': 'Çözücü',
    'Carrier': 'Taşıyıcı',
    'Moisturizer': 'Nemlendirici',
    'Humectant': 'Nem Tutucu',
    'Emollient': 'Yumuşatıcı',
    'Emulsifier': 'Emülgatör',
    'Co-emulsifier': 'Yardımcı Emülgatör',
    'Thickener': 'Koyulaştırıcı',
    'Viscosity Modifier': 'Viskozite Düzenleyici',
    'Preservative': 'Koruyucu',
    'Antimicrobial': 'Antimikrobiyal',
    'Fragrance': 'Parfüm',
    'Perfume': 'Parfüm',
    'Essential Oil': 'Uçucu Yağ',
    'Carrier Oil': 'Taşıyıcı Yağ',
    'Active': 'Aktif Madde',
    'Active Ingredient': 'Aktif Bileşen',
    'Antioxidant': 'Antioksidan',
    'pH Adjuster': 'pH Düzenleyici',
    'pH Buffer': 'pH Tamponu',
    'Colorant': 'Renklendirici',
    'Opacifier': 'Opaklaştırıcı',
    'Surfactant': 'Yüzey Aktif Madde',
    'Anionic Surfactant': 'Anyonik Yüzey Aktif',
    'Nonionic Surfactant': 'Noniyonik Yüzey Aktif',
    'Amphoteric Surfactant': 'Amfoterik Yüzey Aktif',
    'Cationic Surfactant': 'Katyonik Yüzey Aktif',
    'Chelating Agent': 'Şelatlayıcı',
    'Sequestrant': 'Bağlayıcı',
    'Film Former': 'Film Oluşturucu',
    'Conditioner': 'Yumuşatıcı',
    'Skin Conditioning': 'Cilt Bakım',
    'Hair Conditioning': 'Saç Bakım',
    'UV Filter': 'UV Filtre',
    'Sunscreen': 'Güneş Koruyucu',
    'Exfoliant': 'Peeling Maddesi',
    'Brightening Agent': 'Aydınlatıcı',
    'Anti-aging': 'Yaşlanma Karşıtı',
    'Soothing Agent': 'Yatıştırıcı',
    'Anti-inflammatory': 'Anti-enflamatuar',
    'Filler': 'Dolgu Maddesi',
    'Excipient': 'Yardımcı Madde',
    'Binder': 'Bağlayıcı',
    'Disintegrant': 'Parçalayıcı',
    'Lubricant': 'Kaydırıcı',
    'Flow Agent': 'Akış Düzenleyici',
    'Coating': 'Kaplama',
    'Sweetener': 'Tatlandırıcı',
    'Flavoring': 'Aroma',
    'Other': 'Diğer',
  };
  
  return translations[functionEn] || functionEn || 'Diğer';
}

/**
 * Formül özeti oluşturur (PDF/görüntüleme için)
 * @param {Object} formula - İşlenmiş formül
 * @returns {Object} Özet bilgiler
 */
export function generateFormulaSummary(formula) {
  const phases = {};
  formula.formula.forEach(ing => {
    const phase = ing.phase || 'Diğer';
    if (!phases[phase]) {
      phases[phase] = {
        ingredients: [],
        totalPercentage: 0,
        totalCost: 0,
      };
    }
    phases[phase].ingredients.push(ing);
    phases[phase].totalPercentage += ing.percentage || 0;
    phases[phase].totalCost += ing.costPerUnit || 0;
  });
  
  return {
    productName: formula.meta?.productName || 'İsimsiz Ürün',
    targetVolume: `${formula.meta?.targetVolumeGram || 0}g`,
    productionQty: formula.meta?.productionQuantity || 0,
    totalBatch: `${formula.meta?.totalBatchKg || 0}kg`,
    ingredientCount: formula.formula?.length || 0,
    unitCost: `${formula.totals?.costPerUnit_TL?.toFixed(2) || 0} TL`,
    batchCost: `${formula.totals?.costForBatch_TL?.toFixed(2) || 0} TL`,
    phases: phases,
    validation: validateFormula(formula),
  };
}

export default {
  processFormulaCalculations,
  calculateAmount,
  calculateCost,
  normalizePercentages,
  validateFormula,
  generateFormulaSummary,
};
