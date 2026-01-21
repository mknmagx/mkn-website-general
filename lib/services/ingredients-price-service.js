/**
 * Ingredients Price Service
 * =========================
 * Hammadde fiyatları veritabanı yönetimi
 * 
 * Koleksiyon: ingredients_price
 * 
 * Özellikler:
 * - Hammadde INCI/Ticari isim ile fiyat kaydı
 * - Toptan TL/kg fiyatı
 * - Tedarikçi bilgisi
 * - Fiyat geçmişi takibi
 * - AI ile güncel fiyat araması (grounding)
 * 
 * @version 1.0
 * @author MKN Group R&D
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION_NAME = "ingredients_price";

// ============================================================================
// VERİ YAPISI
// ============================================================================
/**
 * Hammadde fiyat kaydı yapısı
 * @typedef {Object} IngredientPrice
 * @property {string} id - Firestore document ID (otomatik veya INCI-based)
 * @property {string} inciName - INCI adı (İngilizce, standart)
 * @property {string[]} aliases - Alternatif isimler, ticari isimler
 * @property {string} category - Kategori (active, carrier_oil, essential_oil, surfactant, vb.)
 * @property {number} priceTLperKg - Toptan TL/kg fiyatı
 * @property {string} supplier - Ana tedarikçi
 * @property {string[]} alternativeSuppliers - Alternatif tedarikçiler
 * @property {string} priceSource - Fiyat kaynağı (manual, ai_grounding, supplier_quote)
 * @property {Date} priceDate - Fiyat tarihi
 * @property {Object[]} priceHistory - Fiyat geçmişi
 * @property {string} notes - Notlar
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// ============================================================================
// CRUD İŞLEMLERİ
// ============================================================================

/**
 * Yeni hammadde fiyatı ekler veya günceller
 * @param {Object} ingredientData - Hammadde fiyat bilgileri
 * @returns {Promise<Object>} Eklenen/güncellenen kayıt
 */
export async function saveIngredientPrice(ingredientData) {
  try {
    const {
      inciName,
      aliases = [],
      category = 'other',
      priceTLperKg,
      supplier = '',
      alternativeSuppliers = [],
      priceSource = 'manual',
      notes = '',
    } = ingredientData;
    
    if (!inciName || !priceTLperKg) {
      throw new Error("INCI adı ve fiyat zorunludur");
    }
    
    // Document ID: INCI adını normalize et
    const docId = normalizeInciName(inciName);
    const docRef = doc(db, COLLECTION_NAME, docId);
    
    // Mevcut kayıt var mı kontrol et
    const existingDoc = await getDoc(docRef);
    const now = serverTimestamp();
    
    if (existingDoc.exists()) {
      // Güncelle - fiyat geçmişine ekle
      const existingData = existingDoc.data();
      const priceHistory = existingData.priceHistory || [];
      
      // Eski fiyatı geçmişe ekle
      if (existingData.priceTLperKg !== priceTLperKg) {
        priceHistory.push({
          price: existingData.priceTLperKg,
          date: existingData.priceDate || existingData.updatedAt,
          source: existingData.priceSource,
        });
      }
      
      await updateDoc(docRef, {
        priceTLperKg: parseFloat(priceTLperKg),
        supplier: supplier,
        alternativeSuppliers: alternativeSuppliers,
        priceSource: priceSource,
        priceDate: now,
        priceHistory: priceHistory.slice(-10), // Son 10 fiyat geçmişi
        notes: notes,
        aliases: [...new Set([...existingData.aliases || [], ...aliases])], // Alias'ları birleştir
        updatedAt: now,
      });
      
      console.log(`[IngredientPrice] Güncellendi: ${inciName}`);
      return { id: docId, updated: true };
    } else {
      // Yeni kayıt oluştur
      await setDoc(docRef, {
        inciName: inciName.trim(),
        aliases: aliases.map(a => a.trim().toLowerCase()),
        category: category,
        priceTLperKg: parseFloat(priceTLperKg),
        supplier: supplier,
        alternativeSuppliers: alternativeSuppliers,
        priceSource: priceSource,
        priceDate: now,
        priceHistory: [],
        notes: notes,
        createdAt: now,
        updatedAt: now,
      });
      
      console.log(`[IngredientPrice] Eklendi: ${inciName}`);
      return { id: docId, created: true };
    }
  } catch (error) {
    console.error("[IngredientPrice] Kayıt hatası:", error);
    throw error;
  }
}

/**
 * INCI adına göre fiyat getirir
 * @param {string} inciName - INCI adı
 * @returns {Promise<Object|null>} Fiyat bilgisi veya null
 */
export async function getIngredientPrice(inciName) {
  try {
    const docId = normalizeInciName(inciName);
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    
    return null;
  } catch (error) {
    console.error("[IngredientPrice] Getirme hatası:", error);
    return null;
  }
}

/**
 * İsme göre en iyi eşleşen fiyatı bulur (alias dahil)
 * @param {string} searchName - Aranacak isim (INCI veya ticari)
 * @returns {Promise<Object|null>} Fiyat bilgisi veya null
 */
export async function findBestPriceMatch(searchName) {
  try {
    if (!searchName) return null;
    
    const normalizedSearch = searchName.toLowerCase().trim();
    
    // 1. Önce direkt INCI eşleşmesi dene
    const directMatch = await getIngredientPrice(searchName);
    if (directMatch) return directMatch;
    
    // 2. Alias'larda ara
    const aliasQuery = query(
      collection(db, COLLECTION_NAME),
      where("aliases", "array-contains", normalizedSearch)
    );
    const aliasSnapshot = await getDocs(aliasQuery);
    
    if (!aliasSnapshot.empty) {
      const doc = aliasSnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    // 3. Kısmi eşleşme (kelime bazlı) - tüm kayıtları çek ve filtrele
    const allDocs = await getDocs(collection(db, COLLECTION_NAME));
    const searchWords = normalizedSearch.split(/\s+/);
    
    let bestMatch = null;
    let bestScore = 0;
    
    allDocs.forEach(doc => {
      const data = doc.data();
      const inciLower = (data.inciName || '').toLowerCase();
      const allNames = [inciLower, ...(data.aliases || [])];
      
      // Skor hesapla
      let score = 0;
      allNames.forEach(name => {
        searchWords.forEach(word => {
          if (name.includes(word)) score++;
          if (name === normalizedSearch) score += 10; // Tam eşleşme bonus
        });
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { id: doc.id, ...data, matchScore: score };
      }
    });
    
    // Minimum skor eşiği
    if (bestScore >= 2) {
      return bestMatch;
    }
    
    return null;
  } catch (error) {
    console.error("[IngredientPrice] Arama hatası:", error);
    return null;
  }
}

/**
 * Tüm hammadde fiyatlarını getirir
 * @param {Object} options - Filtreleme seçenekleri
 * @returns {Promise<Array>} Fiyat listesi
 */
export async function getAllIngredientPrices(options = {}) {
  try {
    const { category, limit: limitCount = 500 } = options;
    
    let q = collection(db, COLLECTION_NAME);
    
    if (category) {
      q = query(q, where("category", "==", category), orderBy("inciName"));
    } else {
      q = query(q, orderBy("inciName"), limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("[IngredientPrice] Liste hatası:", error);
    return [];
  }
}

/**
 * Hammadde fiyatını siler
 * @param {string} inciName - INCI adı
 * @returns {Promise<boolean>} Başarılı mı
 */
export async function deleteIngredientPrice(inciName) {
  try {
    const docId = normalizeInciName(inciName);
    await deleteDoc(doc(db, COLLECTION_NAME, docId));
    console.log(`[IngredientPrice] Silindi: ${inciName}`);
    return true;
  } catch (error) {
    console.error("[IngredientPrice] Silme hatası:", error);
    return false;
  }
}

/**
 * Toplu fiyat güncelleme (CSV import vb.)
 * @param {Array} ingredients - Hammadde listesi
 * @returns {Promise<Object>} Sonuç özeti
 */
export async function bulkUpdatePrices(ingredients) {
  try {
    const batch = writeBatch(db);
    let added = 0;
    let updated = 0;
    let errors = [];
    
    for (const ing of ingredients) {
      try {
        const docId = normalizeInciName(ing.inciName);
        const docRef = doc(db, COLLECTION_NAME, docId);
        
        batch.set(docRef, {
          inciName: ing.inciName.trim(),
          aliases: ing.aliases || [],
          category: ing.category || 'other',
          priceTLperKg: parseFloat(ing.priceTLperKg),
          supplier: ing.supplier || '',
          alternativeSuppliers: ing.alternativeSuppliers || [],
          priceSource: 'bulk_import',
          priceDate: serverTimestamp(),
          priceHistory: [],
          notes: ing.notes || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        
        added++;
      } catch (err) {
        errors.push({ ingredient: ing.inciName, error: err.message });
      }
    }
    
    await batch.commit();
    
    return {
      success: true,
      added: added,
      errors: errors,
    };
  } catch (error) {
    console.error("[IngredientPrice] Toplu güncelleme hatası:", error);
    throw error;
  }
}

// ============================================================================
// BAŞLANGIÇ FİYAT VERİLERİ (SEED)
// ============================================================================

/**
 * Başlangıç fiyat verilerini yükler
 * @returns {Promise<Object>} Sonuç
 */
export async function seedInitialPrices() {
  const initialPrices = [
    // SOLVENTS & CARRIERS
    { inciName: "Aqua", aliases: ["water", "su", "deionized water", "purified water"], category: "solvent", priceTLperKg: 0.1, supplier: "Yerel" },
    { inciName: "Glycerin", aliases: ["gliserin", "glycerol", "vegetable glycerin"], category: "humectant", priceTLperKg: 120, supplier: "Brenntag" },
    { inciName: "Propylene Glycol", aliases: ["propilen glikol", "pg"], category: "humectant", priceTLperKg: 95, supplier: "Brenntag" },
    { inciName: "Butylene Glycol", aliases: ["butilen glikol", "bg"], category: "humectant", priceTLperKg: 180, supplier: "Azelis" },
    
    // CARRIER OILS
    { inciName: "Helianthus Annuus Seed Oil", aliases: ["sunflower oil", "ayçiçek yağı"], category: "carrier_oil", priceTLperKg: 130, supplier: "Yerel" },
    { inciName: "Ricinus Communis Seed Oil", aliases: ["castor oil", "hint yağı"], category: "carrier_oil", priceTLperKg: 185, supplier: "Sigma Kimya" },
    { inciName: "Prunus Amygdalus Dulcis Oil", aliases: ["sweet almond oil", "tatlı badem yağı"], category: "carrier_oil", priceTLperKg: 375, supplier: "Azelis" },
    { inciName: "Cocos Nucifera Oil", aliases: ["coconut oil", "hindistan cevizi yağı", "virgin coconut oil"], category: "carrier_oil", priceTLperKg: 200, supplier: "IMCD" },
    { inciName: "Caprylic/Capric Triglyceride", aliases: ["cct", "fractionated coconut oil", "mct oil"], category: "carrier_oil", priceTLperKg: 380, supplier: "Brenntag" },
    { inciName: "Simmondsia Chinensis Seed Oil", aliases: ["jojoba oil", "jojoba yağı"], category: "carrier_oil", priceTLperKg: 1200, supplier: "Azelis" },
    { inciName: "Argania Spinosa Kernel Oil", aliases: ["argan oil", "argan yağı"], category: "carrier_oil", priceTLperKg: 2500, supplier: "IMCD" },
    { inciName: "Squalane", aliases: ["skualan", "olive squalane"], category: "emollient", priceTLperKg: 1000, supplier: "Azelis" },
    
    // BUTTERS
    { inciName: "Butyrospermum Parkii Butter", aliases: ["shea butter", "shea yağı", "karite yağı"], category: "butter", priceTLperKg: 325, supplier: "IMCD" },
    { inciName: "Theobroma Cacao Seed Butter", aliases: ["cocoa butter", "kakao yağı"], category: "butter", priceTLperKg: 450, supplier: "Brenntag" },
    
    // ACTIVES
    { inciName: "Niacinamide", aliases: ["niasinamid", "vitamin b3", "nicotinamide"], category: "active", priceTLperKg: 625, supplier: "DSM" },
    { inciName: "Panthenol", aliases: ["d-panthenol", "provitamin b5"], category: "active", priceTLperKg: 1200, supplier: "BASF" },
    { inciName: "Tocopherol", aliases: ["vitamin e", "mixed tocopherols"], category: "antioxidant", priceTLperKg: 800, supplier: "BASF" },
    { inciName: "Caffeine", aliases: ["kafein"], category: "active", priceTLperKg: 1200, supplier: "Sigma Kimya" },
    { inciName: "Ascorbic Acid", aliases: ["c vitamini", "vitamin c", "l-ascorbic acid"], category: "active", priceTLperKg: 450, supplier: "DSM" },
    { inciName: "Retinol", aliases: ["a vitamini", "vitamin a"], category: "active", priceTLperKg: 8500, supplier: "BASF" },
    { inciName: "Hyaluronic Acid", aliases: ["hiyaluronik asit", "sodium hyaluronate"], category: "active", priceTLperKg: 6000, supplier: "Bloomage" },
    
    // ESSENTIAL OILS
    { inciName: "Rosmarinus Officinalis Leaf Oil", aliases: ["rosemary oil", "biberiye yağı"], category: "essential_oil", priceTLperKg: 1400, supplier: "Azelis" },
    { inciName: "Lavandula Angustifolia Oil", aliases: ["lavender oil", "lavanta yağı"], category: "essential_oil", priceTLperKg: 1750, supplier: "Azelis" },
    { inciName: "Melaleuca Alternifolia Leaf Oil", aliases: ["tea tree oil", "çay ağacı yağı"], category: "essential_oil", priceTLperKg: 2000, supplier: "IMCD" },
    { inciName: "Mentha Piperita Oil", aliases: ["peppermint oil", "nane yağı"], category: "essential_oil", priceTLperKg: 1300, supplier: "Azelis" },
    
    // PRESERVATIVES
    { inciName: "Phenoxyethanol", aliases: ["fenoksietanol"], category: "preservative", priceTLperKg: 475, supplier: "Clariant" },
    { inciName: "Potassium Sorbate", aliases: ["potasyum sorbat"], category: "preservative", priceTLperKg: 320, supplier: "Brenntag" },
    { inciName: "Sodium Benzoate", aliases: ["sodyum benzoat"], category: "preservative", priceTLperKg: 180, supplier: "Brenntag" },
    
    // THICKENERS
    { inciName: "Xanthan Gum", aliases: ["ksantan gam"], category: "thickener", priceTLperKg: 650, supplier: "Jungbunzlauer" },
    { inciName: "Carbomer", aliases: ["karbomer", "carbopol"], category: "thickener", priceTLperKg: 950, supplier: "Lubrizol" },
    { inciName: "Hydroxyethyl Cellulose", aliases: ["hec", "natrosol"], category: "thickener", priceTLperKg: 550, supplier: "Ashland" },
    
    // EMULSIFIERS
    { inciName: "Cetearyl Alcohol", aliases: ["setearil alkol", "cetyl stearyl alcohol"], category: "emulsifier", priceTLperKg: 180, supplier: "BASF" },
    { inciName: "Glyceryl Stearate", aliases: ["gliseril stearat"], category: "emulsifier", priceTLperKg: 220, supplier: "Gattefossé" },
    { inciName: "Polysorbate 80", aliases: ["tween 80"], category: "emulsifier", priceTLperKg: 145, supplier: "Croda" },
    
    // SURFACTANTS (Cleaning)
    { inciName: "Sodium Laureth Sulfate", aliases: ["sles", "sodyum lauret sülfat"], category: "surfactant", priceTLperKg: 85, supplier: "BASF" },
    { inciName: "Cocamidopropyl Betaine", aliases: ["capb", "betain"], category: "surfactant", priceTLperKg: 120, supplier: "Evonik" },
    { inciName: "Sodium Chloride", aliases: ["tuz", "salt", "nacl"], category: "thickener", priceTLperKg: 5, supplier: "Yerel" },
    { inciName: "Citric Acid", aliases: ["sitrik asit"], category: "ph_adjuster", priceTLperKg: 45, supplier: "Jungbunzlauer" },
    
    // SUPPLEMENTS
    { inciName: "Microcrystalline Cellulose", aliases: ["mcc", "avicel"], category: "excipient", priceTLperKg: 120, supplier: "FMC" },
    { inciName: "Maltodextrin", aliases: ["maltodekstrin"], category: "excipient", priceTLperKg: 65, supplier: "Roquette" },
    { inciName: "Silicon Dioxide", aliases: ["silika", "aerosil"], category: "flow_agent", priceTLperKg: 250, supplier: "Evonik" },
    { inciName: "Magnesium Stearate", aliases: ["magnezyum stearat"], category: "lubricant", priceTLperKg: 180, supplier: "Peter Greven" },
    { inciName: "Collagen Peptides", aliases: ["kolajen", "hydrolyzed collagen"], category: "active", priceTLperKg: 650, supplier: "Rousselot" },
    
    // FRAGRANCE
    { inciName: "Parfum", aliases: ["fragrance", "parfüm", "esans"], category: "fragrance", priceTLperKg: 1200, supplier: "Givaudan" },
  ];
  
  return await bulkUpdatePrices(initialPrices);
}

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * INCI adını document ID için normalize eder
 * @param {string} inciName - INCI adı
 * @returns {string} Normalize edilmiş ID
 */
function normalizeInciName(inciName) {
  return inciName
    .toLowerCase()
    .trim()
    .replace(/[\/\\]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .substring(0, 100); // Firestore ID limiti
}

/**
 * Kategori listesi
 */
export const INGREDIENT_CATEGORIES = {
  solvent: "Çözücü",
  humectant: "Nem Tutucu",
  carrier_oil: "Taşıyıcı Yağ",
  essential_oil: "Uçucu Yağ",
  butter: "Yağ/Tereyağı",
  emollient: "Yumuşatıcı",
  active: "Aktif Madde",
  antioxidant: "Antioksidan",
  preservative: "Koruyucu",
  thickener: "Koyulaştırıcı",
  emulsifier: "Emülgatör",
  surfactant: "Yüzey Aktif",
  ph_adjuster: "pH Düzenleyici",
  colorant: "Renklendirici",
  fragrance: "Parfüm",
  excipient: "Yardımcı Madde",
  flow_agent: "Akış Düzenleyici",
  lubricant: "Kaydırıcı",
  other: "Diğer",
};

export default {
  saveIngredientPrice,
  getIngredientPrice,
  findBestPriceMatch,
  getAllIngredientPrices,
  deleteIngredientPrice,
  bulkUpdatePrices,
  seedInitialPrices,
  INGREDIENT_CATEGORIES,
};
