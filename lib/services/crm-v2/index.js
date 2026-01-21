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
export * from './activity-service';
export * from './sync-service';

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
