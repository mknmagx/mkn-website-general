/**
 * CRM v2 - AI Reply Constants
 * 
 * Client ve Server tarafında kullanılacak sabitler.
 * Bu dosya browser-safe'dir, AI kütüphaneleri import etmez.
 * 
 * NOT: Tüm AI ayarları Firestore'dan dinamik olarak gelir.
 * Bu dosya sadece UI için sabitler içerir.
 * Ana kaynak: ai-settings-seed.js ve ai-prompts-seed.js
 * 
 * ÖNEMLİ: CRM v2 tek bir config dosyası kullanır: crm_communication
 * Tüm CRM işlemleri (reply, summarize, analyze, quick reply) 
 * aynı "crm_communication" config'ini kullanır.
 */

// HTML to Text utility - Mesaj temizleme
import { cleanTextForAI } from '../../../utils/html-to-text';

// =============================================================================
// REPLY TONE - Yanıt Tonu Seçenekleri
// ai-settings-seed.js -> SEED_CONFIGURATIONS.crm_communication.toneOptions ile senkronize
// =============================================================================

export const REPLY_TONE = {
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
  FORMAL: 'formal',
  CONCISE: 'concise',
};

export const REPLY_TONE_LABELS = {
  [REPLY_TONE.PROFESSIONAL]: 'Profesyonel',
  [REPLY_TONE.FRIENDLY]: 'Samimi',
  [REPLY_TONE.FORMAL]: 'Resmi',
  [REPLY_TONE.CONCISE]: 'Kısa & Öz',
};

// =============================================================================
// MESSAGE CATEGORY - Mesaj Kategorileri
// ai-settings-seed.js -> SEED_CONFIGURATIONS.crm_communication.categoryPrompts ile senkronize
// =============================================================================

export const MESSAGE_CATEGORY = {
  GENERAL: 'general',
  PRICING: 'pricing',
  COSMETIC_PRODUCTION: 'cosmetic_production',
  PACKAGING: 'packaging',
  ECOMMERCE: 'ecommerce',
  FORMULATION: 'formulation',
  COMPLAINT: 'complaint',
  PARTNERSHIP: 'partnership',
  FOLLOWUP: 'followup',
};

export const MESSAGE_CATEGORY_LABELS = {
  [MESSAGE_CATEGORY.GENERAL]: 'Genel',
  [MESSAGE_CATEGORY.PRICING]: 'Fiyat Talebi',
  [MESSAGE_CATEGORY.COSMETIC_PRODUCTION]: 'Kozmetik Üretim',
  [MESSAGE_CATEGORY.PACKAGING]: 'Ambalaj',
  [MESSAGE_CATEGORY.ECOMMERCE]: 'E-ticaret',
  [MESSAGE_CATEGORY.FORMULATION]: 'Formülasyon',
  [MESSAGE_CATEGORY.COMPLAINT]: 'Şikayet',
  [MESSAGE_CATEGORY.PARTNERSHIP]: 'İş Ortaklığı',
  [MESSAGE_CATEGORY.FOLLOWUP]: 'Takip',
};

// =============================================================================
// QUICK REPLY TYPES - Hızlı Yanıt Türleri
// =============================================================================

export const QUICK_REPLY_TYPE = {
  ACKNOWLEDGMENT: 'acknowledgment',
  MEETING_REQUEST: 'meeting_request',
  INFO_REQUEST: 'info_request',
  FOLLOWUP: 'followup',
  THANK_YOU: 'thank_you',
  PRICE_REQUEST: 'price_request',
  CALLBACK: 'callback',
};

export const QUICK_REPLY_TYPE_LABELS = {
  [QUICK_REPLY_TYPE.ACKNOWLEDGMENT]: 'Mesaj Alındı',
  [QUICK_REPLY_TYPE.MEETING_REQUEST]: 'Toplantı Talebi',
  [QUICK_REPLY_TYPE.INFO_REQUEST]: 'Bilgi Talebi',
  [QUICK_REPLY_TYPE.FOLLOWUP]: 'Takip Mesajı',
  [QUICK_REPLY_TYPE.THANK_YOU]: 'Teşekkür Mesajı',
  [QUICK_REPLY_TYPE.PRICE_REQUEST]: 'Fiyat Sorusu Yanıtı',
  [QUICK_REPLY_TYPE.CALLBACK]: 'Geri Arama Talebi',
};

// =============================================================================
// AI CONTEXTS - CRM için tek AI Context tanımı
// ai-constants.js -> AI_CONTEXTS.CRM_COMMUNICATION ile senkronize
// 
// NOT: CRM v2 artık tek bir config kullanır: "crm_communication"
// Tüm eski context'ler (email_reply, summarize, analyze, quick_reply)
// artık bu tek config'e yönlendirilir.
// =============================================================================

export const CRM_AI_CONTEXTS = {
  // Ana context - tek konfigürasyon
  COMMUNICATION: 'crm_communication',
  
  // Legacy aliases (geriye uyumluluk için - hepsi crm_communication'a yönlendirilir)
  EMAIL_REPLY: 'crm_communication',
  EMAIL_SUMMARIZE: 'crm_communication',
  EMAIL_ANALYZE: 'crm_communication',
  QUICK_REPLY: 'crm_communication',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Konuşma geçmişini prompt için formatla
 * HTML içeriklerini temizler
 */
export function formatConversationHistory(messages, maxMessages = 10) {
  if (!messages || !messages.length) return "Önceki mesaj yok.";
  
  const recentMessages = messages.slice(-maxMessages);
  
  return recentMessages.map((m, i) => {
    const role = m.direction === 'inbound' ? 'MÜŞTERİ' : 'BİZ';
    // HTML içeriklerini temizle
    const content = cleanTextForAI(m.content || '', 500);
    return `[${role}]: ${content}`;
  }).join('\n\n');
}

/**
 * Prompt değişkenlerini replace et
 * Handlebars-like {{#if variable}} ... {{/if}} syntax'ını destekler
 */
export function replacePromptVariables(template, variables) {
  if (!template) return '';
  
  let result = template;
  
  // Önce {{#if variable}}...{{/if}} bloklarını işle
  const ifBlockRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifBlockRegex, (match, varName, content) => {
    const value = variables[varName];
    // Değer varsa ve boş değilse içeriği göster, yoksa kaldır
    if (value && value.toString().trim() !== '') {
      return content;
    }
    return '';
  });
  
  // Sonra normal {{variable}} değişkenlerini replace et
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  }
  
  return result;
}
