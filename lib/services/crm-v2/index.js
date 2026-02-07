/**
 * CRM v2 - Ana Export
 * 
 * Tüm CRM v2 servislerini tek bir noktadan export eder.
 */

// Schema ve sabitler
export * from './schema';
export * from './order-schema';

// Servisler
export * from './customer-service';
export * from './conversation-service';
export * from './case-service';
export * from './order-service';
export * from './unified-inbox-service';
export * from './sync-service';

// WhatsApp Sync Service - CRM'e WhatsApp entegrasyonu
export {
  // Sync operations
  syncWhatsAppToCRM,
  syncWhatsAppConversations,
  syncWhatsAppMessages,
  syncMessagesForConversation,
  
  // Service window (24 saat kuralı)
  checkServiceWindow,
  refreshServiceWindow,
  
  // CRM'den WhatsApp mesaj gönderme
  sendWhatsAppFromCRM,
  
  // Customer matching
  findOrCreateCustomerByPhone,
  
  // Phone formatting
  formatPhoneForWhatsApp,
  validateWhatsAppPhone,
  
  // Sync status
  getWhatsAppSyncStatus,
  updateWhatsAppSyncStatus,
} from './whatsapp-sync-service';

// Activity Service - exclude conflicting functions
export {
  logActivity,
  addNote,
  getRecentActivities,
  getCustomerActivities,
  getConversationActivities,
  getCaseActivities,
  getUnifiedTimeline,
  // Legacy reminder functions - deprecated, use reminder-service instead
  createReminder as createActivityReminder,
  getUpcomingReminders as getActivityUpcomingReminders,
} from './activity-service';

// Reminder Service - Central reminder management
export {
  // Entity types
  REMINDER_ENTITY_TYPE,
  getEntityTypeLabel,
  // CRUD operations
  createReminder,
  getReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  // Status operations
  completeReminder,
  snoozeReminder,
  dismissReminder,
  // Queries
  getTodayReminders,
  getOverdueReminders,
  getUpcomingReminders,
  getRemindersForEntity,
  getReminderStats,
  // Bulk operations
  completeMultipleReminders,
  deleteMultipleReminders,
  // Utilities
  isReminderOverdue,
  getReminderPriorityColor,
  formatReminderDue,
} from './reminder-service';

// Company-CRM Sync Service
export {
  // Link management
  createLink,
  updateLink,
  getLinkByCompanyId,
  getLinkByCustomerId,
  getAllLinks,
  unlinkCompanyAndCustomer,
  manualLink,
  
  // Matching
  findMatchingCustomer,
  findMatchingCompany,
  
  // Sync operations
  syncCompanyToCRM,
  syncCRMToCompany,
  initialBidirectionalSync,
  syncAllCompaniesToCRM,
  syncUnlinkedCustomersToCompanies,
  
  // Real-time hooks
  onCompanyCreated,
  onCompanyUpdated,
  onCustomerCreated,
  onCustomerUpdated,
  
  // Utilities
  getSyncStatus,
  transformCompanyToCustomer,
  transformCustomerToCompany,
  
  // Duplicate detection & merge
  detectDuplicateCustomers,
  detectDuplicateCompanies,
  detectAllDuplicates,
  mergeDuplicateCustomers,
  mergeDuplicateCompanies,
  mergeAllDuplicates,
} from './company-sync-service';

// Settings service - exclude conflicting checklist functions and re-export with prefixes
export {
  DEFAULT_SETTINGS,
  QUICK_REPLY_CATEGORIES,
  getCrmSettings,
  updateCrmSettings,
  updateSyncSettings,
  getQuickReplies,
  addQuickReply,
  updateQuickReply,
  deleteQuickReply,
  reorderQuickReplies,
  updateNotificationSettings,
  updateDisplaySettings,
  resetCrmSettingsToDefaults,
  initializeCrmSettings,
  getChecklistSettings,
  getChecklistForCaseType,
  updateChecklistForCaseType,
  reorderChecklist,
  resetChecklistToDefault,
  getSLASettings,
  updateSLASettings,
  updateSLAForStatus,
  resetSLAToDefaults,
  getAutoReminderRules,
  addAutoReminderRule,
  updateAutoReminderRule,
  updateAutoReminderRules,
  deleteAutoReminderRule,
  addChecklistItem as addCaseChecklistItem,
  updateChecklistItem as updateCaseChecklistItem,
  deleteChecklistItem as deleteCaseChecklistItem,
} from './settings-service';

// AI Reply constants (browser-safe)
export * from './ai-reply-constants';

// Local Settings Service (localStorage-based)
export {
  DEFAULT_LOCAL_SETTINGS,
  getLocalSettings,
  saveLocalSettings,
  updateLocalSettingsGroup,
  getFileUploadSettings,
  updateFileUploadSettings,
  getMaxFileSizeBytes,
  getMaxFileSizeMB,
  validateFileSize,
  needsLargeUploadConfirmation,
  resetLocalSettings,
  formatFileSize,
} from './local-settings-service';
