/**
 * CRM v2 Settings Service
 * 
 * CRM ayarlarını Firestore'da yönetir.
 */

import { db } from '../../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { DEFAULT_CHECKLISTS, DEFAULT_SLA_SETTINGS, CASE_TYPE } from './schema';

// Collection ve document adları
const SETTINGS_COLLECTION = 'crm_settings';
const GLOBAL_DOC = 'global';

// Varsayılan ayarlar
export const DEFAULT_SETTINGS = {
  // Senkronizasyon
  sync: {
    autoSync: true,
    syncInterval: 15, // dakika
    emailSyncDays: 30,
    syncOnPageLoad: true,
  },
  
  // Hızlı Yanıtlar
  quickReplies: [
    {
      id: 'qr_1',
      title: 'Teşekkür',
      content: 'Mesajınız için teşekkür ederiz. En kısa sürede size dönüş yapacağız.',
      category: 'genel',
      order: 1,
    },
    {
      id: 'qr_2',
      title: 'Teklif Bilgisi',
      content: 'Talebiniz doğrultusunda hazırladığımız teklifi ekte bulabilirsiniz. Herhangi bir sorunuz olursa lütfen bize ulaşın.',
      category: 'teklif',
      order: 2,
    },
    {
      id: 'qr_3',
      title: 'Bilgi Talebi',
      content: 'Size daha iyi yardımcı olabilmemiz için lütfen aşağıdaki bilgileri paylaşır mısınız?\n\n- Ürün/Hizmet detayı\n- Miktar\n- Teslimat süresi',
      category: 'bilgi',
      order: 3,
    },
    {
      id: 'qr_4',
      title: 'Görüşme Talebi',
      content: 'Detaylı görüşme için uygun olduğunuz gün ve saati paylaşırsanız, sizi arayalım.',
      category: 'genel',
      order: 4,
    },
  ],
  
  // Bildirimler
  notifications: {
    emailNotifications: true,
    browserNotifications: false,
    soundEnabled: true,
  },
  
  // Görünüm
  display: {
    itemsPerPage: 20,
    showUnreadFirst: true,
    compactView: false,
  },
  
  // Case Checklist Ayarları
  checklists: DEFAULT_CHECKLISTS,
  
  // SLA Ayarları
  slaSettings: DEFAULT_SLA_SETTINGS,
  
  // Otomatik Hatırlatma Kuralları
  autoReminderRules: {
    enabled: true,
    rules: [
      {
        id: 'rule_inactivity_3d',
        name: 'Hareketsizlik Uyarısı (3 gün)',
        trigger: 'inactivity',
        triggerDays: 3,
        reminderType: 'inactivity',
        enabled: true,
      },
      {
        id: 'rule_quote_followup_5d',
        name: 'Teklif Takibi (5 gün)',
        trigger: 'status_quote_sent',
        triggerDays: 5,
        reminderType: 'quote_follow_up',
        enabled: true,
      },
      {
        id: 'rule_negotiating_7d',
        name: 'Pazarlık Uzadı (7 gün)',
        trigger: 'status_negotiating',
        triggerDays: 7,
        reminderType: 'follow_up',
        enabled: true,
      },
    ],
  },
};

// Kategori listesi
export const QUICK_REPLY_CATEGORIES = [
  { value: 'genel', label: 'Genel' },
  { value: 'teklif', label: 'Teklif' },
  { value: 'bilgi', label: 'Bilgi Talebi' },
  { value: 'siparis', label: 'Sipariş' },
  { value: 'destek', label: 'Destek' },
];

/**
 * CRM ayarlarını getir
 */
export const getCrmSettings = async () => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      // İlk kullanımda varsayılan ayarları oluştur
      console.log('[CRM Settings] Creating default settings...');
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return DEFAULT_SETTINGS;
    }
    
    const data = settingsDoc.data();
    
    // Eksik alanları varsayılanlarla doldur
    return {
      sync: { ...DEFAULT_SETTINGS.sync, ...data.sync },
      quickReplies: data.quickReplies || DEFAULT_SETTINGS.quickReplies,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...data.notifications },
      display: { ...DEFAULT_SETTINGS.display, ...data.display },
      // Yeni eklenen alanlar
      checklists: data.checklists || DEFAULT_SETTINGS.checklists,
      slaSettings: data.slaSettings || DEFAULT_SETTINGS.slaSettings,
      autoReminderRules: data.autoReminderRules || DEFAULT_SETTINGS.autoReminderRules,
    };
  } catch (error) {
    console.error('[CRM Settings] Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * CRM ayarlarını güncelle
 */
export const updateCrmSettings = async (updates, userId = null) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
    
    await updateDoc(settingsRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
    
    console.log('[CRM Settings] Settings updated:', Object.keys(updates));
    return { success: true };
  } catch (error) {
    // Document yoksa oluştur
    if (error.code === 'not-found') {
      const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        ...updates,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      });
      return { success: true };
    }
    
    console.error('[CRM Settings] Error updating settings:', error);
    throw error;
  }
};

/**
 * Senkronizasyon ayarlarını güncelle
 */
export const updateSyncSettings = async (syncSettings, userId = null) => {
  return updateCrmSettings({ sync: syncSettings }, userId);
};

/**
 * Hızlı yanıtları getir
 */
export const getQuickReplies = async () => {
  const settings = await getCrmSettings();
  return settings.quickReplies || [];
};

/**
 * Hızlı yanıt ekle
 */
export const addQuickReply = async (quickReply, userId = null) => {
  const settings = await getCrmSettings();
  const quickReplies = settings.quickReplies || [];
  
  const newReply = {
    id: `qr_${Date.now()}`,
    ...quickReply,
    order: quickReplies.length + 1,
    createdAt: new Date().toISOString(),
  };
  
  quickReplies.push(newReply);
  
  await updateCrmSettings({ quickReplies }, userId);
  return newReply;
};

/**
 * Hızlı yanıt güncelle
 */
export const updateQuickReply = async (replyId, updates, userId = null) => {
  const settings = await getCrmSettings();
  const quickReplies = settings.quickReplies || [];
  
  const index = quickReplies.findIndex(r => r.id === replyId);
  if (index === -1) {
    throw new Error('Quick reply not found');
  }
  
  quickReplies[index] = {
    ...quickReplies[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await updateCrmSettings({ quickReplies }, userId);
  return quickReplies[index];
};

/**
 * Hızlı yanıt sil
 */
export const deleteQuickReply = async (replyId, userId = null) => {
  const settings = await getCrmSettings();
  const quickReplies = (settings.quickReplies || []).filter(r => r.id !== replyId);
  
  // Order'ları yeniden düzenle
  quickReplies.forEach((r, i) => {
    r.order = i + 1;
  });
  
  await updateCrmSettings({ quickReplies }, userId);
  return { success: true };
};

/**
 * Hızlı yanıtları yeniden sırala
 */
export const reorderQuickReplies = async (orderedIds, userId = null) => {
  const settings = await getCrmSettings();
  const quickReplies = settings.quickReplies || [];
  
  // ID sırasına göre yeniden düzenle
  const reordered = orderedIds.map((id, index) => {
    const reply = quickReplies.find(r => r.id === id);
    if (reply) {
      return { ...reply, order: index + 1 };
    }
    return null;
  }).filter(Boolean);
  
  await updateCrmSettings({ quickReplies: reordered }, userId);
  return reordered;
};

/**
 * Bildirim ayarlarını güncelle
 */
export const updateNotificationSettings = async (notificationSettings, userId = null) => {
  return updateCrmSettings({ notifications: notificationSettings }, userId);
};

/**
 * Görünüm ayarlarını güncelle
 */
export const updateDisplaySettings = async (displaySettings, userId = null) => {
  return updateCrmSettings({ display: displaySettings }, userId);
};

/**
 * Ayarları varsayılanlara sıfırla
 */
export const resetCrmSettingsToDefaults = async (userId = null) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
    
    await setDoc(settingsRef, {
      ...DEFAULT_SETTINGS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resetBy: userId,
      resetAt: serverTimestamp(),
    });
    
    console.log('[CRM Settings] Settings reset to defaults');
    return { success: true };
  } catch (error) {
    console.error('[CRM Settings] Error resetting settings:', error);
    throw error;
  }
};

/**
 * Ayarları başlat (ilk kurulum için)
 */
export const initializeCrmSettings = async (userId = null) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      console.log('[CRM Settings] Settings already exist');
      return { success: true, alreadyExists: true };
    }
    
    await setDoc(settingsRef, {
      ...DEFAULT_SETTINGS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      initializedBy: userId,
    });
    
    console.log('[CRM Settings] Settings initialized with defaults');
    return { success: true, alreadyExists: false };
  } catch (error) {
    console.error('[CRM Settings] Error initializing settings:', error);
    throw error;
  }
};
// =============================================================================
// CHECKLIST SETTINGS
// =============================================================================

// Faz tanımları ve sıralaması
const PHASE_DEFINITIONS = {
  qualifying: { name: 'Ön Değerlendirme', order: 1 },
  quote_sent: { name: 'Teklif', order: 2 },
  negotiating: { name: 'Pazarlık', order: 3 },
  won: { name: 'Onay', order: 4 },
};

/**
 * Düz checklist array'ini phases yapısına dönüştür
 */
const convertToPhaseStructure = (checklistItems) => {
  if (!checklistItems || !Array.isArray(checklistItems)) return { phases: [] };
  
  // Fazları grupla
  const phaseMap = {};
  
  checklistItems.forEach(item => {
    const phase = item.phase || 'qualifying';
    if (!phaseMap[phase]) {
      phaseMap[phase] = {
        id: phase,
        name: PHASE_DEFINITIONS[phase]?.name || phase,
        order: PHASE_DEFINITIONS[phase]?.order || 99,
        items: [],
      };
    }
    phaseMap[phase].items.push(item);
  });
  
  // Fazları sırala
  const phases = Object.values(phaseMap).sort((a, b) => a.order - b.order);
  
  return { phases };
};

/**
 * Checklist ayarlarını getir (tüm case türleri için)
 */
export const getChecklistSettings = async () => {
  const settings = await getCrmSettings();
  return settings.checklists || DEFAULT_CHECKLISTS;
};

/**
 * Belirli bir case türü için checklist'i getir (faz yapısında)
 */
export const getChecklistForCaseType = async (caseType) => {
  const checklists = await getChecklistSettings();
  const checklistItems = checklists[caseType] || checklists[CASE_TYPE.OTHER] || [];
  return convertToPhaseStructure(checklistItems);
};

/**
 * Belirli bir case türü için checklist'i güncelle
 */
export const updateChecklistForCaseType = async (caseType, checklistItems, userId = null) => {
  const settings = await getCrmSettings();
  const checklists = settings.checklists || DEFAULT_CHECKLISTS;
  
  checklists[caseType] = checklistItems;
  
  await updateCrmSettings({ checklists }, userId);
  return checklists[caseType];
};

/**
 * Checklist'e yeni item ekle
 */
export const addChecklistItem = async (caseType, item, userId = null) => {
  const settings = await getCrmSettings();
  const checklists = settings.checklists || DEFAULT_CHECKLISTS;
  
  const checklist = checklists[caseType] || [];
  
  const newItem = {
    id: `cl_${Date.now()}`,
    label: item.label,
    required: item.required || false,
    phase: item.phase || 'qualifying',
    order: checklist.length + 1,
  };
  
  checklist.push(newItem);
  checklists[caseType] = checklist;
  
  await updateCrmSettings({ checklists }, userId);
  return newItem;
};

/**
 * Checklist item'ını güncelle
 */
export const updateChecklistItem = async (caseType, itemId, updates, userId = null) => {
  const settings = await getCrmSettings();
  const checklists = settings.checklists || DEFAULT_CHECKLISTS;
  
  const checklist = checklists[caseType] || [];
  const index = checklist.findIndex(item => item.id === itemId);
  
  if (index === -1) {
    throw new Error('Checklist item not found');
  }
  
  checklist[index] = { ...checklist[index], ...updates };
  checklists[caseType] = checklist;
  
  await updateCrmSettings({ checklists }, userId);
  return checklist[index];
};

/**
 * Checklist item'ını sil
 */
export const deleteChecklistItem = async (caseType, itemId, userId = null) => {
  const settings = await getCrmSettings();
  const checklists = settings.checklists || DEFAULT_CHECKLISTS;
  
  const checklist = (checklists[caseType] || []).filter(item => item.id !== itemId);
  
  // Order'ları yeniden düzenle
  checklist.forEach((item, i) => {
    item.order = i + 1;
  });
  
  checklists[caseType] = checklist;
  
  await updateCrmSettings({ checklists }, userId);
  return { success: true };
};

/**
 * Checklist sırasını güncelle
 */
export const reorderChecklist = async (caseType, orderedIds, userId = null) => {
  const settings = await getCrmSettings();
  const checklists = settings.checklists || DEFAULT_CHECKLISTS;
  
  const checklist = checklists[caseType] || [];
  
  const reordered = orderedIds.map((id, index) => {
    const item = checklist.find(i => i.id === id);
    if (item) {
      return { ...item, order: index + 1 };
    }
    return null;
  }).filter(Boolean);
  
  checklists[caseType] = reordered;
  
  await updateCrmSettings({ checklists }, userId);
  return reordered;
};

/**
 * Checklist'i varsayılana sıfırla
 */
export const resetChecklistToDefault = async (caseType, userId = null) => {
  const settings = await getCrmSettings();
  const checklists = settings.checklists || {};
  
  checklists[caseType] = DEFAULT_CHECKLISTS[caseType] || DEFAULT_CHECKLISTS[CASE_TYPE.OTHER];
  
  await updateCrmSettings({ checklists }, userId);
  return checklists[caseType];
};

// =============================================================================
// SLA SETTINGS
// =============================================================================

/**
 * SLA ayarlarını getir
 */
export const getSLASettings = async () => {
  const settings = await getCrmSettings();
  return settings.slaSettings || DEFAULT_SLA_SETTINGS;
};

/**
 * SLA ayarlarını güncelle
 */
export const updateSLASettings = async (slaSettings, userId = null) => {
  return updateCrmSettings({ slaSettings }, userId);
};

/**
 * Belirli bir status için SLA ayarını güncelle
 */
export const updateSLAForStatus = async (status, settings, userId = null) => {
  const currentSettings = await getCrmSettings();
  const slaSettings = currentSettings.slaSettings || DEFAULT_SLA_SETTINGS;
  
  slaSettings[status] = { ...slaSettings[status], ...settings };
  
  await updateCrmSettings({ slaSettings }, userId);
  return slaSettings[status];
};

/**
 * SLA ayarlarını varsayılana sıfırla
 */
export const resetSLAToDefaults = async (userId = null) => {
  await updateCrmSettings({ slaSettings: DEFAULT_SLA_SETTINGS }, userId);
  return DEFAULT_SLA_SETTINGS;
};

// =============================================================================
// AUTO REMINDER RULES
// =============================================================================

/**
 * Otomatik hatırlatma kurallarını getir
 */
export const getAutoReminderRules = async () => {
  const settings = await getCrmSettings();
  return settings.autoReminderRules || DEFAULT_SETTINGS.autoReminderRules;
};

/**
 * Otomatik hatırlatma kurallarını güncelle
 */
export const updateAutoReminderRules = async (rules, userId = null) => {
  return updateCrmSettings({ autoReminderRules: rules }, userId);
};

/**
 * Tek bir otomatik hatırlatma kuralını güncelle
 */
export const updateAutoReminderRule = async (ruleId, updates, userId = null) => {
  const settings = await getCrmSettings();
  const autoReminderRules = settings.autoReminderRules || DEFAULT_SETTINGS.autoReminderRules;
  
  const ruleIndex = autoReminderRules.rules.findIndex(r => r.id === ruleId);
  if (ruleIndex === -1) {
    throw new Error('Rule not found');
  }
  
  autoReminderRules.rules[ruleIndex] = { ...autoReminderRules.rules[ruleIndex], ...updates };
  
  await updateCrmSettings({ autoReminderRules }, userId);
  return autoReminderRules.rules[ruleIndex];
};

/**
 * Yeni otomatik hatırlatma kuralı ekle
 */
export const addAutoReminderRule = async (rule, userId = null) => {
  const settings = await getCrmSettings();
  const autoReminderRules = settings.autoReminderRules || DEFAULT_SETTINGS.autoReminderRules;
  
  const newRule = {
    id: `rule_${Date.now()}`,
    enabled: true,
    ...rule,
  };
  
  autoReminderRules.rules.push(newRule);
  
  await updateCrmSettings({ autoReminderRules }, userId);
  return newRule;
};

/**
 * Otomatik hatırlatma kuralını sil
 */
export const deleteAutoReminderRule = async (ruleId, userId = null) => {
  const settings = await getCrmSettings();
  const autoReminderRules = settings.autoReminderRules || DEFAULT_SETTINGS.autoReminderRules;
  
  autoReminderRules.rules = autoReminderRules.rules.filter(r => r.id !== ruleId);
  
  await updateCrmSettings({ autoReminderRules }, userId);
  return { success: true };
};