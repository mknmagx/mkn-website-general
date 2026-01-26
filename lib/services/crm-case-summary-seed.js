/**
 * 🎯 CRM Case Summary AI Seed Data
 *
 * Bu dosya CRM talep özeti AI ayarlarını Firestore'a yüklemek için kullanılır.
 * Mevcut seed dosyalarına (ai-settings-seed, ai-prompts-seed) dokunmadan,
 * sadece talep özeti için gerekli konfigürasyonu yükler.
 *
 * Kullanım: Admin panelinden "Talep Özeti AI Ayarlarını Yükle" butonu ile çalıştırılır
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ============================================================================
// CONTEXT KEY
// ============================================================================

export const CRM_CASE_SUMMARY_CONTEXT = "crm_case_summary";

// ============================================================================
// CONFIGURATION - ai-settings-seed.js yapısı ile uyumlu
// categoryPrompts ile kategori bazlı prompt desteği
// ============================================================================

export const CASE_SUMMARY_CONFIGURATION = {
  // Unique ID - document ID olarak da kullanılır
  contextId: CRM_CASE_SUMMARY_CONTEXT,
  // Context grubu - CRM altında
  context: "admin_crm",
  // İşlem tipi
  operation: "case_summary",
  // UI görüntüleme
  name: "CRM Talep/Konuşma Özeti",
  description: "Müşteri konuşmalarından talep özeti veya hızlı konuşma özeti çıkaran AI konfigürasyonu. Kategori bazlı prompt sistemi.",
  // Provider ve Model
  defaultProvider: "claude",
  defaultModelId: "claude_haiku",
  allowedModelIds: [
    "claude_haiku",
    "claude_sonnet",
    "gemini_flash_25",
    "gpt4o_mini",
  ],
  // Prompt bağlantısı - varsayılan (detailed)
  promptKey: "crm_case_summary",
  // Kategori bazlı prompt anahtarları (formula_generation_pro gibi çalışır)
  categoryPrompts: {
    detailed: "crm_case_summary",        // Case detay sayfası için detaylı özet (JSON)
    quick: "crm_case_summary_quick",     // Inbox detay sayfası için hızlı özet (JSON)
  },
  // AI ayarları
  settings: {
    temperature: 0.3, // Düşük temperature - tutarlı özetler için
    maxTokens: 2048,
    streaming: false,
  },
  // Özellikler
  features: {
    allowModelChange: true,
    allowPromptEdit: false,
    showTokenUsage: true,
    enableHistory: true,
  },
  // Metadata
  metadata: {
    version: "2.0",
    createdFor: "CRM V2 - Case Detail & Inbox Detail Pages",
    usage: "Conversation içeriğinden talep özeti veya hızlı özet üretme",
    supportedCategories: ["detailed", "quick"],
    categoryDescriptions: {
      detailed: "Case detay sayfası için detaylı JSON özet (mainRequest, details, keyPoints, vb.)",
      quick: "Inbox detay sayfası için hızlı JSON özet (summary, serviceType, products, currentStage, nextStep)",
    },
  },
  isActive: true,
  order: 3,
};

// ============================================================================
// PROMPT
// ============================================================================

export const CASE_SUMMARY_PROMPT = {
  key: "crm_case_summary",
  name: "CRM Talep Özeti Prompt'u",
  description:
    "Müşteri konuşmalarını analiz ederek net ve yapılandırılmış talep özeti üretir",
  category: "crm",
  context: CRM_CASE_SUMMARY_CONTEXT,
  isActive: true,
  version: "1.0",

  variables: [
    "conversation_messages",
    "customer_name",
    "customer_company",
    "case_title",
    "case_type",
    "case_description",
  ],

  systemPrompt: `Sen MKN GROUP'un CRM sisteminde çalışan bir talep analiz uzmanısın.
Görevin müşteri ile yapılan yazışmaları analiz ederek, talebin özünü çıkarmak ve bunu personelin kolayca anlayabileceği şekilde özetlemektir.

═══════════════════════════════════════════════════════════════════
📋 GÖREV
═══════════════════════════════════════════════════════════════════

1. Konuşma geçmişini dikkatlice oku
2. Müşterinin asıl talebini/ihtiyacını tespit et
3. Kritik detayları çıkar (miktar, ürün tipi, özel istekler vb.)
4. Belirsiz veya eksik noktaları belirle
5. Net, kısa ve aksiyona yönelik bir özet üret

═══════════════════════════════════════════════════════════════════
📝 ÖZET FORMATI
═══════════════════════════════════════════════════════════════════

Aşağıdaki yapıda JSON formatında yanıt ver:

{
  "mainRequest": "Müşterinin ana talebi - tek cümle",
  "requestedProducts": [
    {
      "name": "Ürün adı (spesifik)",
      "quantity": "Miktar/adet (varsa)",
      "specs": "Formülasyon, mg, kapsül tipi vb. detaylar (varsa)"
    }
  ],
  "details": {
    "productType": "Genel ürün kategorisi (kozmetik, gıda takviyesi, temizlik vb.)",
    "quantity": "Toplam sipariş miktarı (varsa)",
    "specifications": "Genel özel istekler - sertifikalar, pazar hedefi vb. (varsa)",
    "timeline": "Zaman beklentisi (varsa)",
    "budget": "Bütçe bilgisi (varsa)"
  },
  "keyPoints": ["Önemli nokta 1", "Önemli nokta 2"],
  "uncertainties": ["Netleştirilmesi gereken konu 1", "Belirsiz nokta 2"],
  "suggestedActions": ["Önerilen aksiyon 1", "Önerilen aksiyon 2"],
  "summary": "2-3 cümlelik genel özet - personelin hızlıca okuyup anlayacağı"
}

═══════════════════════════════════════════════════════════════════
🛒 requestedProducts ALANI KRİTİK - MUTLAKA DOLDUR!
═══════════════════════════════════════════════════════════════════

Bu alan EN ÖNEMLİ alandır! Konuşmada geçen TÜM ürünleri buraya listele:

• Müşterinin talep ettiği, fiyat istediği veya üretilmesini istediği HER ÜRÜNü ayrı satır olarak ekle
• Ürün adını SPESİFİK yaz: "Magnezyum Bisglisinat", "D3 Vitamini", "Saç Serumu", "El Kremi" gibi
• Miktar varsa quantity'ye yaz: "1000 kutu", "5000 adet", "500 kg" gibi
• Formülasyon detayı varsa specs'e yaz: "500mg kapsül", "organik", "vegan", "softgel" gibi
• Birden fazla ürün varsa HEPSİNİ listele - örnek:
  [
    {"name": "Magnezyum Bisglisinat", "quantity": "1000 kutu", "specs": "kapsül formunda"},
    {"name": "D3 Vitamini", "quantity": "1000 kutu", "specs": "softgel"},
    {"name": "Milk Thistle Extract", "quantity": "1000 kutu", "specs": ""},
    {"name": "Enginar Ekstresi", "quantity": "1000 kutu", "specs": ""}
  ]
• Ürün bilgisi YOKSA boş dizi döndür: []

═══════════════════════════════════════════════════════════════════
⚠️ ÖNEMLİ KURALLAR
═══════════════════════════════════════════════════════════════════

• SADECE konuşmada geçen bilgileri kullan
• Varsayımda bulunma - belirsiz bilgileri "uncertainties" alanına yaz
• Müşterinin tam olarak ne istediğini anla, varsayma
• Teknik detayları basitleştir ama kaybetme
• Türkçe yaz
• JSON formatına SADIK kal, ekstra metin ekleme
• Eğer konuşma çok kısa veya belirsizse, bunu belirt

═══════════════════════════════════════════════════════════════════
🏢 MKN GROUP BAĞLAMI
═══════════════════════════════════════════════════════════════════

MKN GROUP hizmetleri:
- Kozmetik üretimi (fason/private label)
- Gıda takviyesi üretimi
- Temizlik ürünleri üretimi
- Ambalaj tedariki
- E-ticaret operasyonu

Bu bağlamda talepleri değerlendir.`,

  userPromptTemplate: `═══════════════════════════════════════════════════════════════════
📋 TALEP BİLGİLERİ
═══════════════════════════════════════════════════════════════════
• Talep Başlığı: {{case_title}}
• Talep Türü: {{case_type}}
• Müşteri: {{customer_name}}
• Firma: {{customer_company}}
• Mevcut Açıklama: {{case_description}}

═══════════════════════════════════════════════════════════════════
💬 KONUŞMA GEÇMİŞİ
═══════════════════════════════════════════════════════════════════
{{conversation_messages}}

═══════════════════════════════════════════════════════════════════
📝 GÖREV
═══════════════════════════════════════════════════════════════════
Yukarıdaki konuşmayı analiz et ve belirtilen JSON formatında talep özeti üret.`,

  defaultSettings: {
    temperature: 0.3,
    maxTokens: 2048,
  },

  sourceFile: "lib/services/crm-case-summary-seed.js",
  tags: ["crm", "case", "summary", "özet", "talep"],
};

// ============================================================================
// PROMPT CATEGORY: QUICK_SUMMARY - Inbox Detay için Hızlı Özet
// ============================================================================

export const QUICK_SUMMARY_PROMPT = {
  key: "crm_case_summary_quick",
  name: "CRM Hızlı Konuşma Özeti",
  description:
    "Inbox detay sayfası için konuşmanın kısa ve öz özetini üretir",
  category: "crm",
  context: CRM_CASE_SUMMARY_CONTEXT,
  promptCategory: "quick_summary", // Kategori ayırıcı
  isActive: true,
  version: "1.0",

  variables: [
    "conversation_messages",
    "customer_name", 
    "customer_company",
    "subject",
    "channel",
  ],

  systemPrompt: `Sen MKN GROUP'un CRM sisteminde çalışan bir konuşma analiz uzmanısın.
Görevin müşteri ile yapılan yazışmaları hızlıca analiz ederek, personelin konuşmayı açmadan bile durumu anlayabileceği KISA ve NET bir özet üretmektir.

═══════════════════════════════════════════════════════════════════
📋 GÖREV
═══════════════════════════════════════════════════════════════════

Konuşmayı analiz et ve şu bilgileri KISA ve ÖZ şekilde çıkar:
1. Konuşmanın özeti (maksimum 2 cümle)
2. Müşterinin talep ettiği hizmet/ürün türü
3. Bahsi geçen ürünler/hizmetler ve detayları
4. Sürecin hangi aşamada olduğu
5. Bir sonraki beklenen adım

═══════════════════════════════════════════════════════════════════
📝 ÇIKTI FORMATI - JSON
═══════════════════════════════════════════════════════════════════

{
  "summary": "Maksimum 2 cümlelik özet",
  "serviceType": "Talep edilen hizmet türü (örn: Fason Kozmetik Üretimi, Teklif Talebi, Bilgi Alma)",
  "products": [
    {"name": "Ürün/Hizmet adı", "detail": "Kısa detay (miktar, özellik vb.)"}
  ],
  "currentStage": "Şu anki aşama (örn: İlk Temas, Teklif Bekleniyor, Görüşme Aşaması, Numune Hazırlanıyor)",
  "nextStep": "Beklenen sonraki adım (örn: Teklif Gönderilecek, Müşteriden Yanıt Bekleniyor, Toplantı Planlanacak)"
}

═══════════════════════════════════════════════════════════════════
⚠️ KURALLAR
═══════════════════════════════════════════════════════════════════

• ÇOK KISA ve NET ol - personel hızlıca göz atacak
• Sadece konuşmada geçen bilgileri kullan
• products dizisi boş olabilir, eğer somut ürün/hizmet belirtilmemişse
• Türkçe yaz
• SADECE JSON döndür, başka metin ekleme
• Belirsiz durumlarda "Belirsiz" veya "Henüz belirtilmedi" yaz`,

  userPromptTemplate: `KONUŞMA BİLGİLERİ:
• Konu: {{subject}}
• Müşteri: {{customer_name}}
• Firma: {{customer_company}}
• Kanal: {{channel}}

KONUŞMA GEÇMİŞİ:
{{conversation_messages}}

Yukarıdaki konuşmayı analiz et ve belirtilen JSON formatında KISA özet üret.`,

  defaultSettings: {
    temperature: 0.2, // Daha düşük - tutarlı sonuçlar için
    maxTokens: 800,   // Kısa özet için yeterli
  },

  sourceFile: "lib/services/crm-case-summary-seed.js",
  tags: ["crm", "inbox", "quick-summary", "özet"],
};

// ============================================================================
// PROMPT CATEGORIES MAPPING
// ============================================================================

export const CASE_SUMMARY_PROMPTS = {
  // Case detay sayfası için detaylı özet
  detailed: CASE_SUMMARY_PROMPT,
  // Inbox detay sayfası için hızlı özet
  quick: QUICK_SUMMARY_PROMPT,
};

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Talep özeti AI ayarlarını Firestore'a yükle
 * Mevcut ayarlara dokunmaz, sadece kendi ayarlarını ekler/günceller
 * Her iki prompt'u da yükler (detailed ve quick)
 */
export async function seedCaseSummarySettings() {
  const results = {
    configuration: { status: "pending", message: "" },
    detailedPrompt: { status: "pending", message: "" },
    quickPrompt: { status: "pending", message: "" },
  };

  try {
    // 1. Configuration yükle
    console.log("📝 CRM Case Summary konfigürasyonu yükleniyor...");
    const configRef = doc(db, "ai_configurations", CRM_CASE_SUMMARY_CONTEXT);

    await setDoc(
      configRef,
      {
        ...CASE_SUMMARY_CONFIGURATION,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    results.configuration = {
      status: "success",
      message: "Konfigürasyon yüklendi",
    };

    // 2. Detailed Prompt yükle (Case detay sayfası için)
    console.log("📝 CRM Case Summary - Detailed prompt yükleniyor...");
    const detailedPromptRef = doc(db, "ai_prompts", CASE_SUMMARY_PROMPT.key);

    await setDoc(
      detailedPromptRef,
      {
        ...CASE_SUMMARY_PROMPT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    results.detailedPrompt = {
      status: "success",
      message: "Detailed prompt yüklendi",
    };

    // 3. Quick Prompt yükle (Inbox detay sayfası için)
    console.log("📝 CRM Case Summary - Quick prompt yükleniyor...");
    const quickPromptRef = doc(db, "ai_prompts", QUICK_SUMMARY_PROMPT.key);

    await setDoc(
      quickPromptRef,
      {
        ...QUICK_SUMMARY_PROMPT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    results.quickPrompt = {
      status: "success",
      message: "Quick prompt yüklendi",
    };

    console.log("✅ CRM Case Summary AI ayarları başarıyla yüklendi!");

    return {
      success: true,
      results,
      message: "Talep özeti AI ayarları başarıyla yüklendi (2 prompt).",
    };
  } catch (error) {
    console.error("❌ CRM Case Summary seed hatası:", error);
    return {
      success: false,
      error: error.message,
      results,
    };
  }
}

/**
 * Ayarların yüklenip yüklenmediğini kontrol et
 */
export async function checkCaseSummarySettingsSeeded() {
  try {
    const configRef = doc(db, "ai_configurations", CRM_CASE_SUMMARY_CONTEXT);
    const configDoc = await getDoc(configRef);

    const detailedPromptRef = doc(db, "ai_prompts", CASE_SUMMARY_PROMPT.key);
    const detailedPromptDoc = await getDoc(detailedPromptRef);

    const quickPromptRef = doc(db, "ai_prompts", QUICK_SUMMARY_PROMPT.key);
    const quickPromptDoc = await getDoc(quickPromptRef);

    return {
      isSeeded: configDoc.exists() && detailedPromptDoc.exists() && quickPromptDoc.exists(),
      hasConfiguration: configDoc.exists(),
      hasDetailedPrompt: detailedPromptDoc.exists(),
      hasQuickPrompt: quickPromptDoc.exists(),
    };
  } catch (error) {
    console.error("Error checking case summary settings:", error);
    return {
      isSeeded: false,
      hasConfiguration: false,
      hasDetailedPrompt: false,
      hasQuickPrompt: false,
      error: error.message,
    };
  }
}

/**
 * Ayarları sil ve yeniden yükle
 */
export async function resetCaseSummarySettings() {
  try {
    // Silme işlemi yapmadan direkt üzerine yaz (merge: true ile)
    return await seedCaseSummarySettings();
  } catch (error) {
    console.error("Error resetting case summary settings:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  CRM_CASE_SUMMARY_CONTEXT,
  CASE_SUMMARY_CONFIGURATION,
  CASE_SUMMARY_PROMPT,
  QUICK_SUMMARY_PROMPT,
  CASE_SUMMARY_PROMPTS,
  seedCaseSummarySettings,
  checkCaseSummarySettingsSeeded,
  resetCaseSummarySettings,
};
