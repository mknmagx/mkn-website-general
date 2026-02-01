/**
 * Instagram DM Schema & Constants
 * Tüm sabitler ve tip tanımları
 */

// Konuşma durumları
export const CONVERSATION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  SNOOZED: 'snoozed',
};

// Mesaj tipleri
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  STICKER: 'sticker',
  STORY_REPLY: 'story_reply',
  STORY_MENTION: 'story_mention',
  SHARE: 'share',
};

// Platform tipleri (Facebook Messenger vs Instagram DM)
export const PLATFORM_TYPE = {
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
};

// Konuşma etiketleri
export const CONVERSATION_TAGS = {
  URGENT: 'urgent',
  POTENTIAL_CUSTOMER: 'potential_customer',
  EXISTING_CUSTOMER: 'existing_customer',
  SUPPORT: 'support',
  SALES: 'sales',
  SPAM: 'spam',
};

// Quick reply kategorileri
export const QUICK_REPLY_CATEGORIES = {
  GREETING: 'greeting',
  PRICING: 'pricing',
  PRODUCT: 'product',
  SUPPORT: 'support',
  CLOSING: 'closing',
  OTHER: 'other',
};

// Bağlantı durumları
export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  EXPIRED: 'expired',
  ERROR: 'error',
};

// Helper fonksiyonlar
export const getConversationStatusLabel = (status) => {
  const labels = {
    [CONVERSATION_STATUS.OPEN]: 'Açık',
    [CONVERSATION_STATUS.CLOSED]: 'Kapalı',
    [CONVERSATION_STATUS.SNOOZED]: 'Ertelendi',
  };
  return labels[status] || status;
};

export const getConversationStatusColor = (status) => {
  const colors = {
    [CONVERSATION_STATUS.OPEN]: 'bg-emerald-100 text-emerald-700',
    [CONVERSATION_STATUS.CLOSED]: 'bg-gray-100 text-gray-700',
    [CONVERSATION_STATUS.SNOOZED]: 'bg-amber-100 text-amber-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getMessageTypeLabel = (type) => {
  const labels = {
    [MESSAGE_TYPE.TEXT]: 'Metin',
    [MESSAGE_TYPE.IMAGE]: 'Görsel',
    [MESSAGE_TYPE.VIDEO]: 'Video',
    [MESSAGE_TYPE.AUDIO]: 'Ses',
    [MESSAGE_TYPE.FILE]: 'Dosya',
    [MESSAGE_TYPE.STICKER]: 'Sticker',
    [MESSAGE_TYPE.STORY_REPLY]: 'Story Yanıtı',
    [MESSAGE_TYPE.STORY_MENTION]: 'Story Bahsetme',
    [MESSAGE_TYPE.SHARE]: 'Paylaşım',
  };
  return labels[type] || type;
};

export const getTagLabel = (tag) => {
  const labels = {
    [CONVERSATION_TAGS.URGENT]: 'Acil',
    [CONVERSATION_TAGS.POTENTIAL_CUSTOMER]: 'Potansiyel Müşteri',
    [CONVERSATION_TAGS.EXISTING_CUSTOMER]: 'Mevcut Müşteri',
    [CONVERSATION_TAGS.SUPPORT]: 'Destek',
    [CONVERSATION_TAGS.SALES]: 'Satış',
    [CONVERSATION_TAGS.SPAM]: 'Spam',
  };
  return labels[tag] || tag;
};

export const getTagColor = (tag) => {
  const colors = {
    [CONVERSATION_TAGS.URGENT]: 'bg-red-100 text-red-700 border-red-200',
    [CONVERSATION_TAGS.POTENTIAL_CUSTOMER]: 'bg-blue-100 text-blue-700 border-blue-200',
    [CONVERSATION_TAGS.EXISTING_CUSTOMER]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [CONVERSATION_TAGS.SUPPORT]: 'bg-purple-100 text-purple-700 border-purple-200',
    [CONVERSATION_TAGS.SALES]: 'bg-amber-100 text-amber-700 border-amber-200',
    [CONVERSATION_TAGS.SPAM]: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[tag] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getQuickReplyCategoryLabel = (category) => {
  const labels = {
    [QUICK_REPLY_CATEGORIES.GREETING]: 'Karşılama',
    [QUICK_REPLY_CATEGORIES.PRICING]: 'Fiyat',
    [QUICK_REPLY_CATEGORIES.PRODUCT]: 'Ürün',
    [QUICK_REPLY_CATEGORIES.SUPPORT]: 'Destek',
    [QUICK_REPLY_CATEGORIES.CLOSING]: 'Kapanış',
    [QUICK_REPLY_CATEGORIES.OTHER]: 'Diğer',
  };
  return labels[category] || category;
};

export const getConnectionStatusLabel = (status) => {
  const labels = {
    [CONNECTION_STATUS.CONNECTED]: 'Bağlı',
    [CONNECTION_STATUS.DISCONNECTED]: 'Bağlı Değil',
    [CONNECTION_STATUS.EXPIRED]: 'Süresi Dolmuş',
    [CONNECTION_STATUS.ERROR]: 'Hata',
  };
  return labels[status] || status;
};

export const getConnectionStatusColor = (status) => {
  const colors = {
    [CONNECTION_STATUS.CONNECTED]: 'text-emerald-600',
    [CONNECTION_STATUS.DISCONNECTED]: 'text-gray-500',
    [CONNECTION_STATUS.EXPIRED]: 'text-amber-600',
    [CONNECTION_STATUS.ERROR]: 'text-red-600',
  };
  return colors[status] || 'text-gray-500';
};

// Graph API versiyon
export const GRAPH_API_VERSION = 'v21.0';

// Instagram DM için HER ZAMAN Facebook Graph API kullanılmalı
// Instagram Graph API (graph.instagram.com) DM desteği sunmuyor!
export const GRAPH_API_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * API base URL döndürür
 * Instagram DM için her zaman Facebook Graph API kullanılır
 * @returns {string} API base URL
 */
export const getApiBaseUrl = () => {
  // Instagram DM için her zaman Facebook Graph API kullan
  // IGAAW tokenları DM için çalışmıyor, EAAW (Page Access Token) gerekli
  return GRAPH_API_BASE_URL;
};

// Firestore collection isimleri
export const COLLECTIONS = {
  SETTINGS: 'instagram_dm_settings',
  CONVERSATIONS: 'instagram_dm_conversations',
  MESSAGES: 'instagram_dm_messages',
  QUICK_REPLIES: 'instagram_dm_quick_replies',
};
