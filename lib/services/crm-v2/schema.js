/**
 * CRM v2 - Veritabanı Şema Tanımları
 * 
 * Bu dosya, yeni CRM sisteminin temel veri yapılarını tanımlar.
 * Firestore collection'ları: crm_customers, crm_conversations, crm_cases, crm_messages, crm_activities
 */

// =============================================================================
// CHANNELS - Müşteri İletişim Kanalları
// =============================================================================
export const CHANNEL = {
  CONTACT_FORM: 'contact_form',      // Web sitesi iletişim formu
  QUOTE_FORM: 'quote_form',          // Web sitesi teklif formu
  EMAIL: 'email',                     // E-posta (Outlook, Gmail vb.)
  PHONE: 'phone',                     // Telefon araması
  WHATSAPP: 'whatsapp',              // WhatsApp mesajı
  SOCIAL_INSTAGRAM: 'social_instagram',
  SOCIAL_FACEBOOK: 'social_facebook',
  SOCIAL_LINKEDIN: 'social_linkedin',
  SOCIAL_TWITTER: 'social_twitter',
  MANUAL: 'manual',                   // Manuel eklenen
};

export const getChannelLabel = (channel) => {
  const labels = {
    [CHANNEL.CONTACT_FORM]: 'İletişim Formu',
    [CHANNEL.QUOTE_FORM]: 'Teklif Formu',
    [CHANNEL.EMAIL]: 'E-posta',
    [CHANNEL.PHONE]: 'Telefon',
    [CHANNEL.WHATSAPP]: 'WhatsApp',
    [CHANNEL.SOCIAL_INSTAGRAM]: 'Instagram',
    [CHANNEL.SOCIAL_FACEBOOK]: 'Facebook',
    [CHANNEL.SOCIAL_LINKEDIN]: 'LinkedIn',
    [CHANNEL.SOCIAL_TWITTER]: 'Twitter',
    [CHANNEL.MANUAL]: 'Manuel',
  };
  return labels[channel] || channel;
};

export const getChannelIcon = (channel) => {
  const icons = {
    [CHANNEL.CONTACT_FORM]: 'MessageSquare',
    [CHANNEL.QUOTE_FORM]: 'FileText',
    [CHANNEL.EMAIL]: 'Mail',
    [CHANNEL.PHONE]: 'Phone',
    [CHANNEL.WHATSAPP]: 'MessageCircle',
    [CHANNEL.SOCIAL_INSTAGRAM]: 'Instagram',
    [CHANNEL.SOCIAL_FACEBOOK]: 'Facebook',
    [CHANNEL.SOCIAL_LINKEDIN]: 'Linkedin',
    [CHANNEL.SOCIAL_TWITTER]: 'Twitter',
    [CHANNEL.MANUAL]: 'PenLine',
  };
  return icons[channel] || 'MessageSquare';
};

export const getChannelColor = (channel) => {
  const colors = {
    [CHANNEL.CONTACT_FORM]: 'bg-blue-100 text-blue-700 border-blue-200',
    [CHANNEL.QUOTE_FORM]: 'bg-purple-100 text-purple-700 border-purple-200',
    [CHANNEL.EMAIL]: 'bg-sky-100 text-sky-700 border-sky-200',
    [CHANNEL.PHONE]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [CHANNEL.WHATSAPP]: 'bg-green-100 text-green-700 border-green-200',
    [CHANNEL.SOCIAL_INSTAGRAM]: 'bg-pink-100 text-pink-700 border-pink-200',
    [CHANNEL.SOCIAL_FACEBOOK]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    [CHANNEL.SOCIAL_LINKEDIN]: 'bg-blue-100 text-blue-700 border-blue-200',
    [CHANNEL.SOCIAL_TWITTER]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    [CHANNEL.MANUAL]: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[channel] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// CONVERSATION STATUS - Konuşma Durumları (Inbox yönetimi için)
// =============================================================================
export const CONVERSATION_STATUS = {
  OPEN: 'open',           // Açık, yanıt bekliyor
  PENDING: 'pending',     // Beklemede (ertelendi)
  SNOOZED: 'snoozed',     // Uyutuldu (belirli bir tarihe kadar)
  CLOSED: 'closed',       // Kapatıldı
  SPAM: 'spam',           // Spam olarak işaretlendi
  CONVERTED: 'converted', // Case'e dönüştürüldü
};

export const getConversationStatusLabel = (status) => {
  const labels = {
    [CONVERSATION_STATUS.OPEN]: 'Açık',
    [CONVERSATION_STATUS.PENDING]: 'Beklemede',
    [CONVERSATION_STATUS.SNOOZED]: 'Ertelendi',
    [CONVERSATION_STATUS.CLOSED]: 'Kapatıldı',
    [CONVERSATION_STATUS.SPAM]: 'Spam',
    [CONVERSATION_STATUS.CONVERTED]: 'Dönüştürüldü',
  };
  return labels[status] || status;
};

export const getConversationStatusColor = (status) => {
  const colors = {
    [CONVERSATION_STATUS.OPEN]: 'bg-blue-100 text-blue-700 border-blue-200',
    [CONVERSATION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [CONVERSATION_STATUS.SNOOZED]: 'bg-orange-100 text-orange-700 border-orange-200',
    [CONVERSATION_STATUS.CLOSED]: 'bg-gray-100 text-gray-700 border-gray-200',
    [CONVERSATION_STATUS.SPAM]: 'bg-red-100 text-red-700 border-red-200',
    [CONVERSATION_STATUS.CONVERTED]: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// REPLY STATUS - Yanıt Takip Durumları (Badge sistemi için)
// =============================================================================
export const REPLY_STATUS = {
  NONE: 'none',                        // Henüz yanıt yok
  AWAITING_US: 'awaiting_us',          // Bizden yanıt bekleniyor (🔴)
  AWAITING_CUSTOMER: 'awaiting_customer', // Müşteriden yanıt bekleniyor (🟡)
  CLOSED: 'closed',                    // Kapatıldı (🟢)
};

export const getReplyStatusLabel = (status) => {
  const labels = {
    [REPLY_STATUS.NONE]: 'Yeni',
    [REPLY_STATUS.AWAITING_US]: 'Cevaplanmadı',
    [REPLY_STATUS.AWAITING_CUSTOMER]: 'Cevap Bekleniyor',
    [REPLY_STATUS.CLOSED]: 'Kapatıldı',
  };
  return labels[status] || status;
};

export const getReplyStatusColor = (status) => {
  // Minimalist soft renkler
  const colors = {
    [REPLY_STATUS.NONE]: 'bg-rose-50 text-rose-600 border border-rose-200',
    [REPLY_STATUS.AWAITING_US]: 'bg-rose-50 text-rose-600 border border-rose-200',
    [REPLY_STATUS.AWAITING_CUSTOMER]: 'bg-amber-50 text-amber-600 border border-amber-200',
    [REPLY_STATUS.CLOSED]: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  };
  return colors[status] || 'bg-slate-50 text-slate-500 border border-slate-200';
};

export const getReplyStatusDot = (status) => {
  // Küçük dot renkleri
  const dots = {
    [REPLY_STATUS.NONE]: 'bg-rose-500',
    [REPLY_STATUS.AWAITING_US]: 'bg-rose-500',
    [REPLY_STATUS.AWAITING_CUSTOMER]: 'bg-amber-500',
    [REPLY_STATUS.CLOSED]: 'bg-emerald-500',
  };
  return dots[status] || 'bg-slate-400';
};

export const getReplyStatusIcon = (status) => {
  // Artık kullanılmıyor - dot ile değiştirildi
  return '';
};

// =============================================================================
// CASE STATUS - Talep/İş Durumları (Pipeline için)
// =============================================================================
export const CASE_STATUS = {
  // Ana statüler (Pipeline aşamaları)
  NEW: 'new',                         // Yeni oluşturuldu
  QUALIFYING: 'qualifying',           // Değerlendiriliyor
  QUOTE_SENT: 'quote_sent',          // Teklif gönderildi
  NEGOTIATING: 'negotiating',         // Pazarlık aşamasında
  WON: 'won',                         // Kazanıldı
  LOST: 'lost',                       // Kaybedildi
  ON_HOLD: 'on_hold',                // Beklemede
};

export const getCaseStatusLabel = (status) => {
  const labels = {
    [CASE_STATUS.NEW]: 'Yeni',
    [CASE_STATUS.QUALIFYING]: 'Değerlendirme',
    [CASE_STATUS.QUOTE_SENT]: 'Teklif Verildi',
    [CASE_STATUS.NEGOTIATING]: 'Pazarlık',
    [CASE_STATUS.WON]: 'Kazanıldı',
    [CASE_STATUS.LOST]: 'Kaybedildi',
    [CASE_STATUS.ON_HOLD]: 'Beklemede',
  };
  return labels[status] || status;
};

export const getCaseStatusColor = (status) => {
  const colors = {
    [CASE_STATUS.NEW]: 'bg-blue-500',
    [CASE_STATUS.QUALIFYING]: 'bg-cyan-500',
    [CASE_STATUS.QUOTE_SENT]: 'bg-purple-500',
    [CASE_STATUS.NEGOTIATING]: 'bg-orange-500',
    [CASE_STATUS.WON]: 'bg-green-500',
    [CASE_STATUS.LOST]: 'bg-red-500',
    [CASE_STATUS.ON_HOLD]: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

// Pipeline sıralaması
export const CASE_PIPELINE_ORDER = [
  CASE_STATUS.NEW,
  CASE_STATUS.QUALIFYING,
  CASE_STATUS.QUOTE_SENT,
  CASE_STATUS.NEGOTIATING,
  CASE_STATUS.WON,
];

// =============================================================================
// CASE TYPES - Talep Türleri
// =============================================================================
export const CASE_TYPE = {
  COSMETIC_MANUFACTURING: 'cosmetic_manufacturing',
  SUPPLEMENT_MANUFACTURING: 'supplement_manufacturing',
  CLEANING_MANUFACTURING: 'cleaning_manufacturing',
  PACKAGING_SUPPLY: 'packaging_supply',
  ECOMMERCE_OPERATIONS: 'ecommerce_operations',
  FORMULATION: 'formulation',
  CONSULTATION: 'consultation',
  OTHER: 'other',
};

export const getCaseTypeLabel = (type) => {
  const labels = {
    [CASE_TYPE.COSMETIC_MANUFACTURING]: 'Kozmetik Üretim',
    [CASE_TYPE.SUPPLEMENT_MANUFACTURING]: 'Takviye Üretim',
    [CASE_TYPE.CLEANING_MANUFACTURING]: 'Temizlik Üretim',
    [CASE_TYPE.PACKAGING_SUPPLY]: 'Ambalaj Tedarik',
    [CASE_TYPE.ECOMMERCE_OPERATIONS]: 'E-ticaret Operasyon',
    [CASE_TYPE.FORMULATION]: 'Formülasyon',
    [CASE_TYPE.CONSULTATION]: 'Danışmanlık',
    [CASE_TYPE.OTHER]: 'Diğer',
  };
  return labels[type] || type;
};

// =============================================================================
// PRIORITY - Öncelik Seviyeleri
// =============================================================================
export const PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const getPriorityLabel = (priority) => {
  const labels = {
    [PRIORITY.LOW]: 'Düşük',
    [PRIORITY.NORMAL]: 'Normal',
    [PRIORITY.HIGH]: 'Yüksek',
    [PRIORITY.URGENT]: 'Acil',
  };
  return labels[priority] || priority;
};

export const getPriorityColor = (priority) => {
  const colors = {
    [PRIORITY.LOW]: 'bg-gray-100 text-gray-700 border-gray-200',
    [PRIORITY.NORMAL]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PRIORITY.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
    [PRIORITY.URGENT]: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// MESSAGE STATUS - Mesaj Durumları
// =============================================================================
export const MESSAGE_STATUS = {
  DRAFT: 'draft',                 // Taslak - henüz gönderilmedi
  PENDING_APPROVAL: 'pending_approval', // Onay bekliyor (AI tarafından yazıldı)
  APPROVED: 'approved',           // Onaylandı - gönderilmeye hazır
  SENDING: 'sending',             // Gönderiliyor
  SENT: 'sent',                   // Gönderildi
  DELIVERED: 'delivered',         // Teslim edildi
  READ: 'read',                   // Okundu
  FAILED: 'failed',               // Gönderilemedi
};

export const getMessageStatusLabel = (status) => {
  const labels = {
    [MESSAGE_STATUS.DRAFT]: 'Taslak',
    [MESSAGE_STATUS.PENDING_APPROVAL]: 'Onay Bekliyor',
    [MESSAGE_STATUS.APPROVED]: 'Onaylandı',
    [MESSAGE_STATUS.SENDING]: 'Gönderiliyor',
    [MESSAGE_STATUS.SENT]: 'Gönderildi',
    [MESSAGE_STATUS.DELIVERED]: 'Teslim Edildi',
    [MESSAGE_STATUS.READ]: 'Okundu',
    [MESSAGE_STATUS.FAILED]: 'Başarısız',
  };
  return labels[status] || status;
};

export const getMessageStatusColor = (status) => {
  const colors = {
    [MESSAGE_STATUS.DRAFT]: 'bg-slate-100 text-slate-600 border-slate-200',
    [MESSAGE_STATUS.PENDING_APPROVAL]: 'bg-amber-100 text-amber-700 border-amber-200',
    [MESSAGE_STATUS.APPROVED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [MESSAGE_STATUS.SENDING]: 'bg-cyan-100 text-cyan-600 border-cyan-200',
    [MESSAGE_STATUS.SENT]: 'bg-green-100 text-green-700 border-green-200',
    [MESSAGE_STATUS.DELIVERED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [MESSAGE_STATUS.READ]: 'bg-teal-100 text-teal-700 border-teal-200',
    [MESSAGE_STATUS.FAILED]: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// REPLY CHANNEL - Yanıt Kanalları
// =============================================================================
export const REPLY_CHANNEL = {
  MANUAL: 'manual',               // Manuel (sistem içi kayıt)
  EMAIL: 'email',                 // E-posta (Outlook, Gmail)
  WHATSAPP: 'whatsapp',           // WhatsApp
  SMS: 'sms',                     // SMS
};

export const getReplyChannelLabel = (channel) => {
  const labels = {
    [REPLY_CHANNEL.MANUAL]: 'Manuel Kayıt',
    [REPLY_CHANNEL.EMAIL]: 'E-posta',
    [REPLY_CHANNEL.WHATSAPP]: 'WhatsApp',
    [REPLY_CHANNEL.SMS]: 'SMS',
  };
  return labels[channel] || channel;
};

// =============================================================================
// ACTIVITY TYPES - Aktivite Türleri (Timeline için)
// =============================================================================
export const ACTIVITY_TYPE = {
  // Konuşma aktiviteleri
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_SENT: 'message_sent',
  CONVERSATION_CREATED: 'conversation_created',
  CONVERSATION_CLOSED: 'conversation_closed',
  CONVERSATION_ASSIGNED: 'conversation_assigned',
  CONVERSATION_MERGED: 'conversation_merged',
  CONVERSATION_DELETED: 'conversation_deleted',
  
  // Case aktiviteleri
  CASE_CREATED: 'case_created',
  CASE_STATUS_CHANGED: 'case_status_changed',
  CASE_ASSIGNED: 'case_assigned',
  QUOTE_SENT: 'quote_sent',
  QUOTE_ACCEPTED: 'quote_accepted',
  QUOTE_REJECTED: 'quote_rejected',
  
  // Müşteri aktiviteleri
  CUSTOMER_CREATED: 'customer_created',
  CUSTOMER_UPDATED: 'customer_updated',
  CUSTOMER_MERGED: 'customer_merged',
  
  // Notlar ve hatırlatmalar
  NOTE_ADDED: 'note_added',
  REMINDER_SET: 'reminder_set',
  REMINDER_COMPLETED: 'reminder_completed',
  
  // Etiketler
  TAG_ADDED: 'tag_added',
  TAG_REMOVED: 'tag_removed',
};

export const getActivityTypeLabel = (type) => {
  const labels = {
    [ACTIVITY_TYPE.MESSAGE_RECEIVED]: 'Mesaj alındı',
    [ACTIVITY_TYPE.MESSAGE_SENT]: 'Mesaj gönderildi',
    [ACTIVITY_TYPE.CONVERSATION_CREATED]: 'Konuşma başlatıldı',
    [ACTIVITY_TYPE.CONVERSATION_CLOSED]: 'Konuşma kapatıldı',
    [ACTIVITY_TYPE.CONVERSATION_ASSIGNED]: 'Konuşma atandı',
    [ACTIVITY_TYPE.CONVERSATION_MERGED]: 'Konuşmalar birleştirildi',
    [ACTIVITY_TYPE.CONVERSATION_DELETED]: 'Konuşma silindi',
    [ACTIVITY_TYPE.CASE_CREATED]: 'Talep oluşturuldu',
    [ACTIVITY_TYPE.CASE_STATUS_CHANGED]: 'Talep durumu değişti',
    [ACTIVITY_TYPE.CASE_ASSIGNED]: 'Talep atandı',
    [ACTIVITY_TYPE.QUOTE_SENT]: 'Teklif gönderildi',
    [ACTIVITY_TYPE.QUOTE_ACCEPTED]: 'Teklif kabul edildi',
    [ACTIVITY_TYPE.QUOTE_REJECTED]: 'Teklif reddedildi',
    [ACTIVITY_TYPE.CUSTOMER_CREATED]: 'Müşteri oluşturuldu',
    [ACTIVITY_TYPE.CUSTOMER_UPDATED]: 'Müşteri güncellendi',
    [ACTIVITY_TYPE.CUSTOMER_MERGED]: 'Müşteri birleştirildi',
    [ACTIVITY_TYPE.NOTE_ADDED]: 'Not eklendi',
    [ACTIVITY_TYPE.REMINDER_SET]: 'Hatırlatma oluşturuldu',
    [ACTIVITY_TYPE.REMINDER_COMPLETED]: 'Hatırlatma tamamlandı',
    [ACTIVITY_TYPE.TAG_ADDED]: 'Etiket eklendi',
    [ACTIVITY_TYPE.TAG_REMOVED]: 'Etiket kaldırıldı',
  };
  return labels[type] || type;
};

export const getActivityColor = (type) => {
  const colors = {
    [ACTIVITY_TYPE.MESSAGE_RECEIVED]: 'text-blue-600',
    [ACTIVITY_TYPE.MESSAGE_SENT]: 'text-green-600',
    [ACTIVITY_TYPE.CONVERSATION_CREATED]: 'text-purple-600',
    [ACTIVITY_TYPE.CONVERSATION_CLOSED]: 'text-gray-600',
    [ACTIVITY_TYPE.CONVERSATION_ASSIGNED]: 'text-orange-600',
    [ACTIVITY_TYPE.CONVERSATION_MERGED]: 'text-violet-600',
    [ACTIVITY_TYPE.CONVERSATION_DELETED]: 'text-red-600',
    [ACTIVITY_TYPE.CASE_CREATED]: 'text-indigo-600',
    [ACTIVITY_TYPE.CASE_STATUS_CHANGED]: 'text-amber-600',
    [ACTIVITY_TYPE.CASE_ASSIGNED]: 'text-orange-600',
    [ACTIVITY_TYPE.QUOTE_SENT]: 'text-cyan-600',
    [ACTIVITY_TYPE.QUOTE_ACCEPTED]: 'text-green-600',
    [ACTIVITY_TYPE.QUOTE_REJECTED]: 'text-red-600',
    [ACTIVITY_TYPE.CUSTOMER_CREATED]: 'text-emerald-600',
    [ACTIVITY_TYPE.CUSTOMER_UPDATED]: 'text-blue-600',
    [ACTIVITY_TYPE.CUSTOMER_MERGED]: 'text-violet-600',
    [ACTIVITY_TYPE.NOTE_ADDED]: 'text-yellow-600',
    [ACTIVITY_TYPE.REMINDER_SET]: 'text-pink-600',
    [ACTIVITY_TYPE.REMINDER_COMPLETED]: 'text-green-600',
    [ACTIVITY_TYPE.TAG_ADDED]: 'text-teal-600',
    [ACTIVITY_TYPE.TAG_REMOVED]: 'text-gray-600',
  };
  return colors[type] || 'text-gray-600';
};

export const getActivityBgColor = (type) => {
  const colors = {
    [ACTIVITY_TYPE.MESSAGE_RECEIVED]: 'bg-blue-50',
    [ACTIVITY_TYPE.MESSAGE_SENT]: 'bg-green-50',
    [ACTIVITY_TYPE.CONVERSATION_CREATED]: 'bg-purple-50',
    [ACTIVITY_TYPE.CONVERSATION_CLOSED]: 'bg-gray-50',
    [ACTIVITY_TYPE.CONVERSATION_ASSIGNED]: 'bg-orange-50',
    [ACTIVITY_TYPE.CONVERSATION_MERGED]: 'bg-violet-50',
    [ACTIVITY_TYPE.CONVERSATION_DELETED]: 'bg-red-50',
    [ACTIVITY_TYPE.CASE_CREATED]: 'bg-indigo-50',
    [ACTIVITY_TYPE.CASE_STATUS_CHANGED]: 'bg-amber-50',
    [ACTIVITY_TYPE.CASE_ASSIGNED]: 'bg-orange-50',
    [ACTIVITY_TYPE.QUOTE_SENT]: 'bg-cyan-50',
    [ACTIVITY_TYPE.QUOTE_ACCEPTED]: 'bg-green-50',
    [ACTIVITY_TYPE.QUOTE_REJECTED]: 'bg-red-50',
    [ACTIVITY_TYPE.CUSTOMER_CREATED]: 'bg-emerald-50',
    [ACTIVITY_TYPE.CUSTOMER_UPDATED]: 'bg-blue-50',
    [ACTIVITY_TYPE.CUSTOMER_MERGED]: 'bg-violet-50',
    [ACTIVITY_TYPE.NOTE_ADDED]: 'bg-yellow-50',
    [ACTIVITY_TYPE.REMINDER_SET]: 'bg-pink-50',
    [ACTIVITY_TYPE.REMINDER_COMPLETED]: 'bg-green-50',
    [ACTIVITY_TYPE.TAG_ADDED]: 'bg-teal-50',
    [ACTIVITY_TYPE.TAG_REMOVED]: 'bg-gray-50',
  };
  return colors[type] || 'bg-gray-50';
};

export const getActivityIcon = (type) => {
  // Returns icon name to be used with lucide-react
  const icons = {
    [ACTIVITY_TYPE.MESSAGE_RECEIVED]: 'MessageSquare',
    [ACTIVITY_TYPE.MESSAGE_SENT]: 'Send',
    [ACTIVITY_TYPE.CONVERSATION_CREATED]: 'MessageCircle',
    [ACTIVITY_TYPE.CONVERSATION_CLOSED]: 'Archive',
    [ACTIVITY_TYPE.CONVERSATION_ASSIGNED]: 'UserPlus',
    [ACTIVITY_TYPE.CONVERSATION_MERGED]: 'GitMerge',
    [ACTIVITY_TYPE.CONVERSATION_DELETED]: 'Trash2',
    [ACTIVITY_TYPE.CASE_CREATED]: 'Briefcase',
    [ACTIVITY_TYPE.CASE_STATUS_CHANGED]: 'RefreshCw',
    [ACTIVITY_TYPE.CASE_ASSIGNED]: 'UserCheck',
    [ACTIVITY_TYPE.QUOTE_SENT]: 'FileText',
    [ACTIVITY_TYPE.QUOTE_ACCEPTED]: 'CheckCircle',
    [ACTIVITY_TYPE.QUOTE_REJECTED]: 'XCircle',
    [ACTIVITY_TYPE.CUSTOMER_CREATED]: 'UserPlus',
    [ACTIVITY_TYPE.CUSTOMER_UPDATED]: 'Edit',
    [ACTIVITY_TYPE.CUSTOMER_MERGED]: 'Merge',
    [ACTIVITY_TYPE.NOTE_ADDED]: 'StickyNote',
    [ACTIVITY_TYPE.REMINDER_SET]: 'Bell',
    [ACTIVITY_TYPE.REMINDER_COMPLETED]: 'BellOff',
    [ACTIVITY_TYPE.TAG_ADDED]: 'Tag',
    [ACTIVITY_TYPE.TAG_REMOVED]: 'TagOff',
  };
  return icons[type] || 'Activity';
};

// =============================================================================
// CUSTOMER TYPE - Müşteri Türleri
// =============================================================================
export const CUSTOMER_TYPE = {
  LEAD: 'lead',           // Potansiyel müşteri
  PROSPECT: 'prospect',   // İletişime geçilmiş potansiyel
  CUSTOMER: 'customer',   // Aktif müşteri
  VIP: 'vip',             // VIP müşteri
  CHURNED: 'churned',     // Kaybedilmiş müşteri
};

export const getCustomerTypeLabel = (type) => {
  const labels = {
    [CUSTOMER_TYPE.LEAD]: 'Potansiyel',
    [CUSTOMER_TYPE.PROSPECT]: 'İlgili',
    [CUSTOMER_TYPE.CUSTOMER]: 'Müşteri',
    [CUSTOMER_TYPE.VIP]: 'VIP',
    [CUSTOMER_TYPE.CHURNED]: 'Pasif',
  };
  return labels[type] || type;
};

export const getCustomerTypeColor = (type) => {
  const colors = {
    [CUSTOMER_TYPE.LEAD]: 'bg-gray-100 text-gray-700 border-gray-200',
    [CUSTOMER_TYPE.PROSPECT]: 'bg-blue-100 text-blue-700 border-blue-200',
    [CUSTOMER_TYPE.CUSTOMER]: 'bg-green-100 text-green-700 border-green-200',
    [CUSTOMER_TYPE.VIP]: 'bg-amber-100 text-amber-700 border-amber-200',
    [CUSTOMER_TYPE.CHURNED]: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// COLLECTION NAMES - Firestore Collection İsimleri
// =============================================================================
export const COLLECTIONS = {
  CUSTOMERS: 'crm_customers',
  CONVERSATIONS: 'crm_conversations',
  MESSAGES: 'crm_messages',
  CASES: 'crm_cases',
  ACTIVITIES: 'crm_activities',
  TAGS: 'crm_tags',
  SYNC_METADATA: 'crm_sync_metadata',
  ORDERS: 'crm_orders',
  SETTINGS: 'crm_settings',
  // Company-CRM Senkronizasyon
  COMPANY_CRM_LINKS: 'company_crm_links',
};

// =============================================================================
// SYNC DIRECTION - Senkronizasyon Yönü
// =============================================================================
export const SYNC_DIRECTION = {
  COMPANY_TO_CRM: 'company_to_crm',
  CRM_TO_COMPANY: 'crm_to_company',
  BIDIRECTIONAL: 'bidirectional',
  MANUAL: 'manual',
};

export const getSyncDirectionLabel = (direction) => {
  const labels = {
    [SYNC_DIRECTION.COMPANY_TO_CRM]: 'Firma → CRM',
    [SYNC_DIRECTION.CRM_TO_COMPANY]: 'CRM → Firma',
    [SYNC_DIRECTION.BIDIRECTIONAL]: 'Çift Yönlü',
    [SYNC_DIRECTION.MANUAL]: 'Manuel',
  };
  return labels[direction] || direction;
};

// =============================================================================
// SYNC STATUS - Senkronizasyon Durumu
// =============================================================================
export const SYNC_STATUS = {
  SYNCED: 'synced',           // Senkronize
  PENDING: 'pending',         // Beklemede
  CONFLICT: 'conflict',       // Çakışma var
  ERROR: 'error',             // Hata
};

export const getSyncStatusLabel = (status) => {
  const labels = {
    [SYNC_STATUS.SYNCED]: 'Senkronize',
    [SYNC_STATUS.PENDING]: 'Beklemede',
    [SYNC_STATUS.CONFLICT]: 'Çakışma',
    [SYNC_STATUS.ERROR]: 'Hata',
  };
  return labels[status] || status;
};

export const getSyncStatusColor = (status) => {
  const colors = {
    [SYNC_STATUS.SYNCED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [SYNC_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [SYNC_STATUS.CONFLICT]: 'bg-orange-100 text-orange-700 border-orange-200',
    [SYNC_STATUS.ERROR]: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// COMPANY STATUS TO CUSTOMER TYPE MAPPING
// =============================================================================
export const COMPANY_STATUS_TO_CUSTOMER_TYPE = {
  'lead': CUSTOMER_TYPE.LEAD,
  'negotiation': CUSTOMER_TYPE.PROSPECT,
  'active-client': CUSTOMER_TYPE.CUSTOMER,
  'completed': CUSTOMER_TYPE.CUSTOMER,
  'paused': CUSTOMER_TYPE.CHURNED,
};

export const CUSTOMER_TYPE_TO_COMPANY_STATUS = {
  [CUSTOMER_TYPE.LEAD]: 'lead',
  [CUSTOMER_TYPE.PROSPECT]: 'negotiation',
  [CUSTOMER_TYPE.CUSTOMER]: 'active-client',
  [CUSTOMER_TYPE.VIP]: 'active-client',
  [CUSTOMER_TYPE.CHURNED]: 'paused',
};

// =============================================================================
// REMINDER TYPES - Hatırlatma Türleri
// =============================================================================
export const REMINDER_TYPE = {
  FOLLOW_UP: 'follow_up',           // Takip hatırlatması
  DEADLINE: 'deadline',             // Deadline yaklaşıyor
  SLA_WARNING: 'sla_warning',       // SLA uyarısı
  CUSTOM: 'custom',                 // Özel hatırlatma
  QUOTE_FOLLOW_UP: 'quote_follow_up', // Teklif takibi
  INACTIVITY: 'inactivity',         // Hareketsizlik uyarısı
};

export const getReminderTypeLabel = (type) => {
  const labels = {
    [REMINDER_TYPE.FOLLOW_UP]: 'Takip',
    [REMINDER_TYPE.DEADLINE]: 'Deadline',
    [REMINDER_TYPE.SLA_WARNING]: 'SLA Uyarısı',
    [REMINDER_TYPE.CUSTOM]: 'Özel',
    [REMINDER_TYPE.QUOTE_FOLLOW_UP]: 'Teklif Takibi',
    [REMINDER_TYPE.INACTIVITY]: 'Hareketsizlik',
  };
  return labels[type] || type;
};

export const getReminderTypeColor = (type) => {
  const colors = {
    [REMINDER_TYPE.FOLLOW_UP]: 'bg-blue-100 text-blue-700 border-blue-200',
    [REMINDER_TYPE.DEADLINE]: 'bg-red-100 text-red-700 border-red-200',
    [REMINDER_TYPE.SLA_WARNING]: 'bg-orange-100 text-orange-700 border-orange-200',
    [REMINDER_TYPE.CUSTOM]: 'bg-purple-100 text-purple-700 border-purple-200',
    [REMINDER_TYPE.QUOTE_FOLLOW_UP]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    [REMINDER_TYPE.INACTIVITY]: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// =============================================================================
// REMINDER STATUS - Hatırlatma Durumları
// =============================================================================
export const REMINDER_STATUS = {
  PENDING: 'pending',       // Bekliyor
  SNOOZED: 'snoozed',      // Ertelendi
  COMPLETED: 'completed',   // Tamamlandı
  DISMISSED: 'dismissed',   // Görmezden gelindi
};

export const getReminderStatusLabel = (status) => {
  const labels = {
    [REMINDER_STATUS.PENDING]: 'Bekliyor',
    [REMINDER_STATUS.SNOOZED]: 'Ertelendi',
    [REMINDER_STATUS.COMPLETED]: 'Tamamlandı',
    [REMINDER_STATUS.DISMISSED]: 'İptal Edildi',
  };
  return labels[status] || status;
};

// =============================================================================
// WON/LOST REASONS - Kazanma/Kaybetme Sebepleri
// =============================================================================
export const WON_REASONS = {
  PRICE_COMPETITIVE: 'price_competitive',
  QUALITY_ASSURANCE: 'quality_assurance',
  FAST_DELIVERY: 'fast_delivery',
  EXISTING_RELATIONSHIP: 'existing_relationship',
  UNIQUE_CAPABILITY: 'unique_capability',
  GOOD_COMMUNICATION: 'good_communication',
  REFERENCES: 'references',
  CERTIFICATIONS: 'certifications',
};

export const getWonReasonLabel = (reason) => {
  const labels = {
    [WON_REASONS.PRICE_COMPETITIVE]: 'Rekabetçi Fiyat',
    [WON_REASONS.QUALITY_ASSURANCE]: 'Kalite Güvencesi',
    [WON_REASONS.FAST_DELIVERY]: 'Hızlı Teslimat',
    [WON_REASONS.EXISTING_RELATIONSHIP]: 'Mevcut İlişki',
    [WON_REASONS.UNIQUE_CAPABILITY]: 'Benzersiz Yetenek',
    [WON_REASONS.GOOD_COMMUNICATION]: 'İyi İletişim',
    [WON_REASONS.REFERENCES]: 'Referanslar',
    [WON_REASONS.CERTIFICATIONS]: 'Sertifikalar',
  };
  return labels[reason] || reason;
};

export const LOST_REASONS = {
  PRICE_TOO_HIGH: 'price_too_high',
  COMPETITOR_CHOSEN: 'competitor_chosen',
  BUDGET_CUT: 'budget_cut',
  TIMING_NOT_RIGHT: 'timing_not_right',
  NO_RESPONSE: 'no_response',
  REQUIREMENTS_CHANGED: 'requirements_changed',
  QUALITY_CONCERNS: 'quality_concerns',
  DELIVERY_TIME: 'delivery_time',
};

export const getLostReasonLabel = (reason) => {
  const labels = {
    [LOST_REASONS.PRICE_TOO_HIGH]: 'Fiyat Yüksek',
    [LOST_REASONS.COMPETITOR_CHOSEN]: 'Rakip Seçildi',
    [LOST_REASONS.BUDGET_CUT]: 'Bütçe İptal',
    [LOST_REASONS.TIMING_NOT_RIGHT]: 'Zamanlama Uygun Değil',
    [LOST_REASONS.NO_RESPONSE]: 'Cevap Alınamadı',
    [LOST_REASONS.REQUIREMENTS_CHANGED]: 'Gereksinimler Değişti',
    [LOST_REASONS.QUALITY_CONCERNS]: 'Kalite Endişesi',
    [LOST_REASONS.DELIVERY_TIME]: 'Teslimat Süresi',
  };
  return labels[reason] || reason;
};

// =============================================================================
// DEFAULT CHECKLISTS - Varsayılan Kontrol Listeleri (Case türlerine göre)
// =============================================================================
export const DEFAULT_CHECKLISTS = {
  [CASE_TYPE.COSMETIC_MANUFACTURING]: [
    { id: 'customer_info', label: 'Müşteri bilgileri doğrulandı', required: true, phase: 'qualifying' },
    { id: 'requirements_clear', label: 'Talep detayları netleştirildi', required: true, phase: 'qualifying' },
    { id: 'moq_determined', label: 'MOQ (minimum sipariş) belirlendi', required: true, phase: 'qualifying' },
    { id: 'formula_requirements', label: 'Formül gereksinimleri alındı', required: true, phase: 'qualifying' },
    { id: 'packaging_preferences', label: 'Ambalaj tercihleri belirlendi', required: false, phase: 'qualifying' },
    { id: 'certifications_checked', label: 'Sertifika gereksinimleri soruldu', required: false, phase: 'qualifying' },
    { id: 'sample_request', label: 'Numune talebi var mı kontrolü yapıldı', required: false, phase: 'qualifying' },
    { id: 'cost_calculated', label: 'Maliyet hesaplaması yapıldı', required: true, phase: 'quote_sent' },
    { id: 'proforma_prepared', label: 'Proforma hazırlandı', required: true, phase: 'quote_sent' },
    { id: 'proforma_sent', label: 'Proforma gönderildi', required: true, phase: 'quote_sent' },
    { id: 'customer_feedback', label: 'Müşteri geri dönüşü alındı', required: true, phase: 'negotiating' },
    { id: 'revision_done', label: 'Revizyon gerekiyorsa yapıldı', required: false, phase: 'negotiating' },
    { id: 'final_approval', label: 'Onay alındı', required: true, phase: 'won' },
  ],
  [CASE_TYPE.SUPPLEMENT_MANUFACTURING]: [
    { id: 'customer_info', label: 'Müşteri bilgileri doğrulandı', required: true, phase: 'qualifying' },
    { id: 'requirements_clear', label: 'Talep detayları netleştirildi', required: true, phase: 'qualifying' },
    { id: 'formula_analysis', label: 'Formül analizi yapıldı', required: true, phase: 'qualifying' },
    { id: 'dosage_form', label: 'Dozaj formu belirlendi', required: true, phase: 'qualifying' },
    { id: 'gida_license', label: 'Gıda lisansı gereksinimleri kontrol edildi', required: true, phase: 'qualifying' },
    { id: 'cost_calculated', label: 'Maliyet hesaplaması yapıldı', required: true, phase: 'quote_sent' },
    { id: 'proforma_prepared', label: 'Proforma hazırlandı', required: true, phase: 'quote_sent' },
    { id: 'proforma_sent', label: 'Proforma gönderildi', required: true, phase: 'quote_sent' },
    { id: 'customer_feedback', label: 'Müşteri geri dönüşü alındı', required: true, phase: 'negotiating' },
    { id: 'final_approval', label: 'Onay alındı', required: true, phase: 'won' },
  ],
  [CASE_TYPE.CLEANING_MANUFACTURING]: [
    { id: 'customer_info', label: 'Müşteri bilgileri doğrulandı', required: true, phase: 'qualifying' },
    { id: 'product_type', label: 'Ürün türü belirlendi', required: true, phase: 'qualifying' },
    { id: 'formula_specs', label: 'Formül özellikleri alındı', required: true, phase: 'qualifying' },
    { id: 'volume_determined', label: 'Hacim/miktar belirlendi', required: true, phase: 'qualifying' },
    { id: 'cost_calculated', label: 'Maliyet hesaplaması yapıldı', required: true, phase: 'quote_sent' },
    { id: 'proforma_prepared', label: 'Proforma hazırlandı', required: true, phase: 'quote_sent' },
    { id: 'proforma_sent', label: 'Proforma gönderildi', required: true, phase: 'quote_sent' },
    { id: 'customer_feedback', label: 'Müşteri geri dönüşü alındı', required: true, phase: 'negotiating' },
    { id: 'final_approval', label: 'Onay alındı', required: true, phase: 'won' },
  ],
  [CASE_TYPE.PACKAGING_SUPPLY]: [
    { id: 'customer_info', label: 'Müşteri bilgileri doğrulandı', required: true, phase: 'qualifying' },
    { id: 'packaging_type', label: 'Ambalaj türü belirlendi', required: true, phase: 'qualifying' },
    { id: 'material_specs', label: 'Malzeme özellikleri netleştirildi', required: true, phase: 'qualifying' },
    { id: 'quantity_determined', label: 'Miktar belirlendi', required: true, phase: 'qualifying' },
    { id: 'design_requirements', label: 'Tasarım gereksinimleri alındı', required: false, phase: 'qualifying' },
    { id: 'supplier_check', label: 'Tedarikçi kontrolü yapıldı', required: true, phase: 'quote_sent' },
    { id: 'cost_calculated', label: 'Maliyet hesaplaması yapıldı', required: true, phase: 'quote_sent' },
    { id: 'proforma_sent', label: 'Proforma gönderildi', required: true, phase: 'quote_sent' },
    { id: 'customer_feedback', label: 'Müşteri geri dönüşü alındı', required: true, phase: 'negotiating' },
    { id: 'final_approval', label: 'Onay alındı', required: true, phase: 'won' },
  ],
  [CASE_TYPE.ECOMMERCE_OPERATIONS]: [
    { id: 'customer_info', label: 'Müşteri bilgileri doğrulandı', required: true, phase: 'qualifying' },
    { id: 'platforms_identified', label: 'E-ticaret platformları belirlendi', required: true, phase: 'qualifying' },
    { id: 'service_scope', label: 'Hizmet kapsamı netleştirildi', required: true, phase: 'qualifying' },
    { id: 'product_count', label: 'Ürün sayısı belirlendi', required: true, phase: 'qualifying' },
    { id: 'pricing_model', label: 'Fiyatlandırma modeli belirlendi', required: true, phase: 'quote_sent' },
    { id: 'proforma_sent', label: 'Proforma gönderildi', required: true, phase: 'quote_sent' },
    { id: 'customer_feedback', label: 'Müşteri geri dönüşü alındı', required: true, phase: 'negotiating' },
    { id: 'contract_terms', label: 'Sözleşme şartları görüşüldü', required: true, phase: 'negotiating' },
    { id: 'final_approval', label: 'Onay alındı', required: true, phase: 'won' },
  ],
  [CASE_TYPE.FORMULATION]: [
    { id: 'customer_info', label: 'Müşteri bilgileri doğrulandı', required: true, phase: 'qualifying' },
    { id: 'product_category', label: 'Ürün kategorisi belirlendi', required: true, phase: 'qualifying' },
    { id: 'target_properties', label: 'Hedeflenen özellikler alındı', required: true, phase: 'qualifying' },
    { id: 'constraints', label: 'Kısıtlamalar belirlendi', required: false, phase: 'qualifying' },
    { id: 'budget_timeline', label: 'Bütçe ve süre netleştirildi', required: true, phase: 'qualifying' },
    { id: 'cost_calculated', label: 'Ar-Ge maliyeti hesaplandı', required: true, phase: 'quote_sent' },
    { id: 'proforma_sent', label: 'Proforma gönderildi', required: true, phase: 'quote_sent' },
    { id: 'customer_feedback', label: 'Müşteri geri dönüşü alındı', required: true, phase: 'negotiating' },
    { id: 'final_approval', label: 'Onay alındı', required: true, phase: 'won' },
  ],
  [CASE_TYPE.CONSULTATION]: [
    { id: 'customer_info', label: 'Müşteri bilgileri doğrulandı', required: true, phase: 'qualifying' },
    { id: 'consultation_type', label: 'Danışmanlık türü belirlendi', required: true, phase: 'qualifying' },
    { id: 'current_challenges', label: 'Mevcut zorluklar anlaşıldı', required: true, phase: 'qualifying' },
    { id: 'goals_defined', label: 'Hedefler tanımlandı', required: true, phase: 'qualifying' },
    { id: 'pricing_determined', label: 'Fiyatlandırma belirlendi', required: true, phase: 'quote_sent' },
    { id: 'proforma_sent', label: 'Proforma gönderildi', required: true, phase: 'quote_sent' },
    { id: 'customer_feedback', label: 'Müşteri geri dönüşü alındı', required: true, phase: 'negotiating' },
    { id: 'final_approval', label: 'Onay alındı', required: true, phase: 'won' },
  ],
  [CASE_TYPE.OTHER]: [
    { id: 'customer_info', label: 'Müşteri bilgileri doğrulandı', required: true, phase: 'qualifying' },
    { id: 'requirements_clear', label: 'Talepler netleştirildi', required: true, phase: 'qualifying' },
    { id: 'cost_calculated', label: 'Maliyet hesaplandı', required: true, phase: 'quote_sent' },
    { id: 'proforma_sent', label: 'Proforma gönderildi', required: true, phase: 'quote_sent' },
    { id: 'customer_feedback', label: 'Müşteri geri dönüşü alındı', required: true, phase: 'negotiating' },
    { id: 'final_approval', label: 'Onay alındı', required: true, phase: 'won' },
  ],
};

// =============================================================================
// DEFAULT SLA SETTINGS - Varsayılan SLA Ayarları (saat cinsinden)
// =============================================================================
export const DEFAULT_SLA_SETTINGS = {
  [CASE_STATUS.NEW]: {
    maxDuration: 24,          // 24 saat içinde qualifying'e geçmeli
    warningThreshold: 18,     // 18 saat sonra uyarı
    label: 'Yeni talep değerlendirilmeli',
  },
  [CASE_STATUS.QUALIFYING]: {
    maxDuration: 72,          // 72 saat (3 gün)
    warningThreshold: 48,     // 48 saat sonra uyarı
    label: 'Detaylar netleştirilmeli',
  },
  [CASE_STATUS.QUOTE_SENT]: {
    maxDuration: 168,         // 168 saat (7 gün)
    warningThreshold: 120,    // 5 gün sonra uyarı
    label: 'Teklif geri dönüşü bekleniyor',
  },
  [CASE_STATUS.NEGOTIATING]: {
    maxDuration: 336,         // 336 saat (14 gün)
    warningThreshold: 240,    // 10 gün sonra uyarı
    label: 'Pazarlık sonuçlanmalı',
  },
  [CASE_STATUS.ON_HOLD]: {
    maxDuration: 720,         // 720 saat (30 gün)
    warningThreshold: 504,    // 21 gün sonra uyarı
    label: 'Beklemedeki talep kontrol edilmeli',
  },
};

// =============================================================================
// DEFAULT DATA - Varsayılan Veriler
// =============================================================================
export const DEFAULT_TAGS = [
  { id: 'vip', name: 'VIP', color: '#f59e0b' },
  { id: 'urgent', name: 'Acil', color: '#ef4444' },
  { id: 'follow-up', name: 'Takip', color: '#3b82f6' },
  { id: 'new-brand', name: 'Yeni Marka', color: '#10b981' },
  { id: 'existing-customer', name: 'Mevcut Müşteri', color: '#8b5cf6' },
  { id: 'international', name: 'Uluslararası', color: '#06b6d4' },
  { id: 'bulk-order', name: 'Toplu Sipariş', color: '#ec4899' },
  { id: 'sample-request', name: 'Numune Talebi', color: '#14b8a6' },
];

// =============================================================================
// SLA HELPER FUNCTIONS - SLA Yardımcı Fonksiyonları
// =============================================================================
export const calculateSLAStatus = (caseData, slaSettings = DEFAULT_SLA_SETTINGS) => {
  if (!caseData || !caseData.status) return null;
  
  const settings = slaSettings[caseData.status];
  if (!settings) return null;
  
  // Status değişiklik zamanını bul
  const statusHistory = caseData.statusHistory || [];
  const currentStatusEntry = statusHistory.filter(h => h.status === caseData.status).pop();
  
  const statusChangedAt = currentStatusEntry?.changedAt?.toDate?.() || 
                          caseData.updatedAt?.toDate?.() || 
                          caseData.createdAt?.toDate?.() ||
                          new Date();
  
  const now = new Date();
  const hoursElapsed = (now - statusChangedAt) / (1000 * 60 * 60);
  const percentUsed = (hoursElapsed / settings.maxDuration) * 100;
  
  let status = 'on_track';  // Yolunda
  if (hoursElapsed >= settings.maxDuration) {
    status = 'overdue';     // Gecikmiş
  } else if (hoursElapsed >= settings.warningThreshold) {
    status = 'warning';     // Uyarı
  }
  
  return {
    status,
    hoursElapsed: Math.round(hoursElapsed),
    hoursRemaining: Math.max(0, Math.round(settings.maxDuration - hoursElapsed)),
    percentUsed: Math.min(100, Math.round(percentUsed)),
    maxDuration: settings.maxDuration,
    label: settings.label,
  };
};

export const getSLAStatusColor = (status) => {
  const colors = {
    on_track: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getSLAProgressColor = (status) => {
  const colors = {
    on_track: 'bg-emerald-500',
    warning: 'bg-amber-500',
    overdue: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
};
