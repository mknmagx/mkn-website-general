/**
 * Instagram DM Services - Main Export
 * Tüm servisler için merkezi export
 */

// Schema & Constants
export * from './schema';

// Services
export * as settingsService from './settings-service';
export * as conversationService from './conversation-service';
export * as messageService from './message-service';
export * as quickReplyService from './quick-reply-service';
export * as webhookHandler from './webhook-handler';
export * as apiClient from './api-client';

// Direct exports for convenience
export {
  getSettings,
  saveSettings,
  checkConnectionStatus,
  disconnect,
  getOrCreateWebhookVerifyToken,
  getActiveAccessToken,
  getTokenType,
} from './settings-service';

export {
  getConversations,
  getConversation,
  upsertConversation,
  markAsRead,
  updateStatus,
  addTag,
  removeTag,
  assignTo,
  getUnreadCount,
  findByIgUserId,
} from './conversation-service';

export {
  getMessages,
  saveMessage,
  sendMessage,
  sendImageMessage,
  processIncomingMessage,
} from './message-service';

export {
  getQuickReplies,
  getQuickReply,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
  incrementUsageCount,
  findByShortcut,
  seedDefaultQuickReplies,
} from './quick-reply-service';

export {
  verifyWebhook,
  validateSignature,
  handleWebhookEvent,
  parseWebhookPayload,
} from './webhook-handler';
