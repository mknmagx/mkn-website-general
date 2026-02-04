/**
 * WhatsApp Business API Services - Main Export
 * Tüm servisler için merkezi export
 */

// Schema & Constants
export * from './schema';

// Services (namespace exports)
export * as settingsService from './settings-service';
export * as conversationService from './conversation-service';
export * as messageService from './message-service';
export * as templateService from './template-service';
export * as webhookHandler from './webhook-handler';
export * as apiClient from './api-client';
export * as contactService from './contact-service';

// Direct exports for convenience - Settings
export {
  getSettings,
  saveSettings,
  checkConnectionStatus,
  disconnect,
  getOrCreateWebhookVerifyToken,
  getActiveAccessToken,
  fetchAccountInfo,
  debugToken,
  generateVerifyToken,
} from './settings-service';

// Direct exports - Conversations
export {
  getConversations,
  getConversation,
  findByWaId,
  upsertConversation,
  updateLastMessage,
  markAsRead,
  updateStatus,
  updateServiceWindow,
  isServiceWindowOpen,
  addTag,
  removeTag,
  assignConversation,
  getTotalUnreadCount,
  deleteConversation,
  archiveConversation,
  closeConversation,
  reopenConversation,
  getConversationStats,
  updateCustomerInfo,
} from './conversation-service';

// Direct exports - Messages
export {
  getMessages,
  getMessage,
  findByWamId,
  saveMessage,
  updateMessageStatus,
  sendMessage,
  sendImageMessage,
  sendDocumentMessage,
  sendGenericMediaMessage,
  sendTemplate,
  processIncomingMessage,
  processStatusUpdate,
  getAllMessages,
  deleteMessage,
} from './message-service';

// Direct exports - Templates
export {
  syncTemplates,
  getTemplates,
  getTemplate,
  getTemplateByName,
  createTemplate,
  deleteTemplate,
  buildTemplateComponents,
  getTemplateCategories,
  getStatusInfo,
  updateTemplateStatus,
  getApprovedTemplates,
  getTemplateStats,
  getTemplatePreview,
  extractTemplateVariables,
} from './template-service';

// Direct exports - Webhook
export {
  verifyWebhook,
  validateSignature,
  handleWebhookEvent,
  parseWebhookPayload,
  createTestPayload,
  createTestStatusPayload,
} from './webhook-handler';

// Direct exports - API Client
export {
  graphRequest,
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  sendInteractiveMessage,
  sendReaction,
  sendLocationMessage,
  markMessageAsRead,
  getMessageTemplates,
  createMessageTemplate,
  deleteMessageTemplate,
  getPhoneNumberInfo,
  getBusinessProfile,
  updateBusinessProfile,
  uploadMedia,
  getMediaUrl,
  downloadMedia,
} from './api-client';

// Direct exports - Contacts
export {
  formatPhoneNumber,
  validatePhoneNumber,
  getContacts,
  getContact,
  findByPhone,
  createContact,
  updateContact,
  deleteContact,
  addTagToContact,
  removeTagFromContact,
  syncContactFromConversation,
  getContactGroupStats,
  searchContacts,
  importContacts,
} from './contact-service';
