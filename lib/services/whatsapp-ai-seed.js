/**
 * 🌱 WhatsApp AI Settings Seed Data
 *
 * Bu dosya sadece WhatsApp ile ilgili AI ayarlarını Firestore'a yükler.
 * Mevcut ayarları etkilemeden sadece WhatsApp konfigürasyon ve prompt'unu ekler.
 *
 * Kullanım: 
 * - Admin panelinden "WhatsApp AI Ayarlarını Yükle" butonu ile
 * - Veya terminalde: node -e "require('./lib/services/whatsapp-ai-seed.js').seedWhatsAppAI()"
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
// WHATSAPP AI CONFIGURATION
// ============================================================================

export const WHATSAPP_AI_CONFIGURATION = {
  contextId: "whatsapp_text_revision",
  context: "admin_whatsapp",
  operation: "text_revision",
  name: "WhatsApp Metin Düzeltme",
  description: "WhatsApp mesajlarını gramer ve söz dizilimi açısından düzeltir ve iyileştirir",
  defaultProvider: "claude",
  defaultModelId: "claude_haiku",
  allowedModelIds: [
    "claude_haiku",
    "claude_sonnet",
    "gpt4o_mini",
    "gpt4o",
    "gemini_flash_25",
  ],
  promptKey: "whatsapp_text_revision",
  settings: {
    temperature: 0.3,
    maxTokens: 1024,
    streaming: false,
  },
  features: {
    allowModelChange: true,
    allowPromptEdit: false,
    showTokenUsage: false,
    enableHistory: false,
  },
  metadata: {
    version: "1.0",
    createdFor: "Admin WhatsApp Inbox Page",
    usage: "Mesaj gönderilmeden önce metin düzeltme",
  },
  isActive: true,
  order: 1,
};

// ============================================================================
// WHATSAPP AI PROMPT
// ============================================================================

export const WHATSAPP_AI_PROMPT = {
  key: "whatsapp_text_revision",
  name: "WhatsApp Metin Düzeltme",
  description: "WhatsApp mesajlarını gramer, söz dizilimi ve profesyonellik açısından düzeltir",
  category: "crm_communication",
  context: "whatsapp_text_revision",
  isActive: true,
  version: "1.0",

  variables: [
    "original_text",
  ],

  systemPrompt: `Sen profesyonel bir metin editörüsün. Görevin WhatsApp mesajlarını düzeltmek ve iyileştirmek.

═══════════════════════════════════════════════════════════════════
📋 GÖREV
═══════════════════════════════════════════════════════════════════

Verilen metni şu açılardan gözden geçir ve düzelt:
1. Gramer hataları
2. Yazım hataları (typo)
3. Noktalama işaretleri
4. Söz dizilimi (cümle yapısı)
5. Akıcılık ve okunabilirlik
6. Profesyonel ton (WhatsApp iş mesajı olarak uygun)

═══════════════════════════════════════════════════════════════════
⚠️ KRİTİK KURALLAR
═══════════════════════════════════════════════════════════════════

1. Metnin ANLAMINI DEĞİŞTİRME
2. Gereksiz yere uzatma - kısa ve öz tut
3. Orijinal yazarın üslubunu koru (samimi/resmi)
4. WhatsApp formatına uygun tut (çok uzun paragraflar yapma)
5. Emoji kullanımını koru (varsa)
6. Sadece gerekli düzeltmeleri yap, gereksiz değişiklik yapma

═══════════════════════════════════════════════════════════════════
📝 ÇIKTI
═══════════════════════════════════════════════════════════════════

SADECE düzeltilmiş metni döndür.
Açıklama, yorum veya ek not EKLEME.
Metni quotes içine ALMA.`,

  userPromptTemplate: `Aşağıdaki WhatsApp mesajını düzelt:

{{original_text}}`,

  defaultSettings: {
    temperature: 0.3,
    maxTokens: 1024,
  },

  sourceFile: "app/admin/whatsapp/page.js",
  tags: ["whatsapp", "metin", "düzeltme", "gramer", "revision"],
};

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * WhatsApp AI ayarlarını Firestore'a yükle
 * Mevcut ayarları etkilemez, sadece WhatsApp configuration ve prompt ekler
 */
export async function seedWhatsAppAI() {
  const results = {
    configuration: { success: false, existed: false },
    prompt: { success: false, existed: false },
  };

  try {
    console.log("🚀 WhatsApp AI ayarları yükleniyor...");

    // 1. Configuration'ı kontrol et ve ekle
    const configRef = doc(db, "ai_configurations", WHATSAPP_AI_CONFIGURATION.contextId);
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      console.log("⚠️ WhatsApp configuration zaten mevcut, atlanıyor...");
      results.configuration.existed = true;
    } else {
      await setDoc(configRef, {
        ...WHATSAPP_AI_CONFIGURATION,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("✅ WhatsApp configuration eklendi");
      results.configuration.success = true;
    }

    // 2. Prompt'u kontrol et ve ekle
    const promptRef = doc(db, "ai_prompts", WHATSAPP_AI_PROMPT.key);
    const promptSnap = await getDoc(promptRef);

    if (promptSnap.exists()) {
      console.log("⚠️ WhatsApp prompt zaten mevcut, atlanıyor...");
      results.prompt.existed = true;
    } else {
      await setDoc(promptRef, {
        ...WHATSAPP_AI_PROMPT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("✅ WhatsApp prompt eklendi");
      results.prompt.success = true;
    }

    console.log("🎉 WhatsApp AI ayarları başarıyla yüklendi!");
    return { success: true, results };

  } catch (error) {
    console.error("❌ WhatsApp AI seed hatası:", error);
    return { success: false, error: error.message, results };
  }
}

/**
 * WhatsApp AI ayarlarını güncelle (zorla üzerine yaz)
 */
export async function updateWhatsAppAI() {
  try {
    console.log("🔄 WhatsApp AI ayarları güncelleniyor...");

    // Configuration güncelle
    const configRef = doc(db, "ai_configurations", WHATSAPP_AI_CONFIGURATION.contextId);
    await setDoc(configRef, {
      ...WHATSAPP_AI_CONFIGURATION,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log("✅ WhatsApp configuration güncellendi");

    // Prompt güncelle
    const promptRef = doc(db, "ai_prompts", WHATSAPP_AI_PROMPT.key);
    await setDoc(promptRef, {
      ...WHATSAPP_AI_PROMPT,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log("✅ WhatsApp prompt güncellendi");

    console.log("🎉 WhatsApp AI ayarları başarıyla güncellendi!");
    return { success: true };

  } catch (error) {
    console.error("❌ WhatsApp AI güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
}

/**
 * WhatsApp AI ayarlarının mevcut olup olmadığını kontrol et
 */
export async function checkWhatsAppAISeeded() {
  try {
    const configRef = doc(db, "ai_configurations", WHATSAPP_AI_CONFIGURATION.contextId);
    const configSnap = await getDoc(configRef);
    
    const promptRef = doc(db, "ai_prompts", WHATSAPP_AI_PROMPT.key);
    const promptSnap = await getDoc(promptRef);

    return {
      configurationExists: configSnap.exists(),
      promptExists: promptSnap.exists(),
      isFullySeeded: configSnap.exists() && promptSnap.exists(),
    };
  } catch (error) {
    console.error("Error checking WhatsApp AI settings:", error);
    return {
      configurationExists: false,
      promptExists: false,
      isFullySeeded: false,
      error: error.message,
    };
  }
}

export default {
  seedWhatsAppAI,
  updateWhatsAppAI,
  checkWhatsAppAISeeded,
  WHATSAPP_AI_CONFIGURATION,
  WHATSAPP_AI_PROMPT,
};
