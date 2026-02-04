/**
 * WhatsApp Business API - Schema & Constants
 * Firestore şemaları ve sabit değerler
 */

// Collection names
export const COLLECTIONS = {
  SETTINGS: 'whatsapp_settings',
  CONVERSATIONS: 'whatsapp_conversations',
  MESSAGES: 'whatsapp_messages',
  TEMPLATES: 'whatsapp_templates',
  ANALYTICS: 'whatsapp_analytics',
  WEBHOOK_LOGS: 'whatsapp_webhook_logs',
  CONTACTS: 'whatsapp_contacts',
};

// Settings document ID (singleton)
export const SETTINGS_DOC_ID = 'whatsapp_config';

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  STICKER: 'sticker',
  LOCATION: 'location',
  CONTACTS: 'contacts',
  INTERACTIVE: 'interactive',
  TEMPLATE: 'template',
  REACTION: 'reaction',
  BUTTON: 'button',
};

// Message status
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
  PENDING: 'pending',
};

// Conversation status
export const CONVERSATION_STATUS = {
  OPEN: 'open',
  ACTIVE: 'open', // Alias for OPEN
  CLOSED: 'closed',
  PENDING: 'pending',
  ARCHIVED: 'archived',
};

// Template categories
export const TEMPLATE_CATEGORIES = {
  MARKETING: 'MARKETING',
  UTILITY: 'UTILITY',
  AUTHENTICATION: 'AUTHENTICATION',
};

// Template status
export const TEMPLATE_STATUS = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  DISABLED: 'DISABLED',
};

// Webhook event types
export const WEBHOOK_EVENTS = {
  MESSAGES: 'messages',
  MESSAGE_STATUS: 'statuses',
  MESSAGE_TEMPLATE_STATUS: 'message_template_status_update',
};

// Meta Graph API version
export const GRAPH_API_VERSION = 'v21.0';
export const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Default settings schema
export const DEFAULT_SETTINGS = {
  // Meta App credentials
  appId: '',
  appSecret: '',
  
  // WhatsApp Business Account
  wabaId: '', // WhatsApp Business Account ID
  phoneNumberId: '', // Business Phone Number ID
  displayPhoneNumber: '', // Display phone number
  verifiedName: '', // Verified business name
  
  // Access tokens
  systemUserToken: '', // Permanent token
  
  // Webhook
  webhookVerifyToken: '',
  webhookConfigured: false,
  
  // Connection status
  connectionStatus: {
    status: 'disconnected', // connected, disconnected, error, expired
    lastCheck: null,
    error: null,
  },
  
  // Automation settings
  autoCreateContacts: true, // Otomatik kişi oluşturma
  
  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Conversation schema
export const CONVERSATION_SCHEMA = {
  waId: '', // WhatsApp ID (phone number)
  profileName: '', // User's profile name
  phoneNumber: '', // Formatted phone number
  phoneNumberId: '', // Business phone number ID (hangi WA hesabına ait)
  
  // Status
  status: CONVERSATION_STATUS.OPEN,
  unreadCount: 0,
  
  // Last message
  lastMessage: null,
  lastMessageAt: null,
  lastMessageDirection: null, // inbound, outbound
  
  // Customer service window
  windowExpiry: null, // 24-hour window expiry
  isWithinWindow: false,
  
  // Tags & Assignment
  tags: [],
  assignedTo: null,
  
  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Message schema
export const MESSAGE_SCHEMA = {
  conversationId: '',
  wamId: '', // WhatsApp message ID (wamid)
  phoneNumberId: '', // Business phone number ID (hangi WA hesabından)
  
  // Direction
  direction: '', // inbound, outbound
  
  // Sender info
  from: '', // Sender phone/ID
  to: '', // Recipient phone/ID
  
  // Content
  type: MESSAGE_TYPES.TEXT,
  content: {
    text: '',
    caption: '',
    mediaUrl: '',
    mediaId: '',
    mimeType: '',
    filename: '',
    // Template specific
    templateName: '',
    templateLanguage: '',
    templateComponents: [],
  },
  
  // Status
  status: MESSAGE_STATUS.PENDING,
  statusTimestamps: {
    sent: null,
    delivered: null,
    read: null,
    failed: null,
  },
  
  // Error info
  error: null,
  
  // Metadata
  timestamp: null,
  createdAt: null,
  updatedAt: null,
};

// Template schema
export const TEMPLATE_SCHEMA = {
  templateId: '', // Meta template ID
  name: '',
  language: '',
  category: TEMPLATE_CATEGORIES.UTILITY,
  status: TEMPLATE_STATUS.PENDING,
  
  // Components
  components: [],
  
  // Quality
  qualityScore: null,
  
  // Cache
  cachedAt: null,
};

// Analytics schema
export const ANALYTICS_SCHEMA = {
  date: '', // YYYY-MM-DD
  
  // Message counts
  messagesSent: 0,
  messagesDelivered: 0,
  messagesRead: 0,
  messagesFailed: 0,
  messagesReceived: 0,
  
  // Template counts
  templatesSent: 0,
  templatesDelivered: 0,
  
  // Conversation counts
  conversationsOpened: 0,
  conversationsClosed: 0,
  
  // Response metrics
  avgResponseTime: 0, // seconds
  
  // Metadata
  updatedAt: null,
};

// Contact schema (Telefon Rehberi)
export const CONTACT_SCHEMA = {
  // Temel bilgiler
  phoneNumber: '', // Uluslararası format: 905551234567
  name: '', // İsim
  company: '', // Şirket adı
  email: '', // E-posta
  phoneNumberId: '', // Business phone number ID (hangi WA hesabıyla ilişkili)
  
  // WhatsApp bilgileri
  waId: '', // WhatsApp ID
  profileName: '', // WhatsApp profil adı
  hasWhatsApp: true, // WhatsApp'ı var mı
  
  // Sınıflandırma
  tags: [], // Etiketler
  group: '', // Grup (Müşteri, Tedarikçi, vb.)
  
  // Notlar
  notes: '',
  
  // İlişkili conversation
  lastConversationId: null,
  lastMessageAt: null,
  
  // CRM entegrasyonu
  crmCustomerId: null, // CRM'deki müşteri ID'si
  
  // Meta
  createdAt: null,
  updatedAt: null,
  createdBy: null,
};

// Contact groups
export const CONTACT_GROUPS = {
  CUSTOMER: 'customer',
  LEAD: 'lead',
  SUPPLIER: 'supplier',
  PARTNER: 'partner',
  OTHER: 'other',
};
