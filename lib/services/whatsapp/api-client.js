/**
 * WhatsApp Business API - API Client
 * Meta Graph API iletişim servisi
 */

import { GRAPH_API_BASE, MESSAGE_TYPES } from './schema';
import { getSettings, getActiveAccessToken } from './settings-service';

/**
 * Make authenticated request to Graph API
 */
export async function graphRequest(endpoint, options = {}) {
  const settings = await getSettings();
  const token = getActiveAccessToken(settings);

  if (!token) {
    throw new Error('Access token bulunamadı');
  }

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${GRAPH_API_BASE}${endpoint}`;

  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = `${url}${separator}access_token=${token}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (data.error) {
    const error = new Error(data.error.message);
    error.code = data.error.code;
    error.type = data.error.type;
    error.fbTraceId = data.error.fbtrace_id;
    throw error;
  }

  return data;
}

/**
 * Send text message
 * @param {string} to - Recipient phone number
 * @param {string} text - Message text
 * @param {boolean} previewUrl - Whether to preview URLs
 * @param {string} replyToMessageId - Optional message ID to reply to
 */
export async function sendTextMessage(to, text, previewUrl = false, replyToMessageId = null) {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: previewUrl,
      body: text,
    },
  };

  // Add context for reply
  if (replyToMessageId) {
    payload.context = {
      message_id: replyToMessageId,
    };
  }

  return graphRequest(`/${settings.phoneNumberId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Send template message
 */
export async function sendTemplateMessage(to, templateName, languageCode, components = []) {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
    },
  };

  if (components.length > 0) {
    payload.template.components = components;
  }

  return graphRequest(`/${settings.phoneNumberId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Send media message (image, video, document, audio)
 */
export async function sendMediaMessage(to, type, mediaUrl, caption = '', filename = null) {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  const mediaTypes = ['image', 'video', 'document', 'audio', 'sticker'];
  if (!mediaTypes.includes(type)) {
    throw new Error(`Geçersiz medya tipi: ${type}`);
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type,
    [type]: {
      link: mediaUrl,
    },
  };

  // Add filename for document (required) and other media types (optional)
  if (filename) {
    payload[type].filename = filename;
  } else if (type === 'document') {
    // Extract filename from URL or use default
    const urlFilename = mediaUrl.split('/').pop().split('?')[0];
    payload[type].filename = urlFilename || 'document.pdf';
  }

  // Add caption for image, video, document
  if (caption && ['image', 'video', 'document'].includes(type)) {
    payload[type].caption = caption;
  }

  return graphRequest(`/${settings.phoneNumberId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Send interactive message (buttons, list)
 */
export async function sendInteractiveMessage(to, interactiveData) {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: interactiveData,
  };

  return graphRequest(`/${settings.phoneNumberId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Send reaction to a message
 */
export async function sendReaction(to, messageId, emoji) {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'reaction',
    reaction: {
      message_id: messageId,
      emoji,
    },
  };

  return graphRequest(`/${settings.phoneNumberId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Send location message
 */
export async function sendLocationMessage(to, latitude, longitude, name = '', address = '') {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'location',
    location: {
      latitude,
      longitude,
      name,
      address,
    },
  };

  return graphRequest(`/${settings.phoneNumberId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId) {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };

  return graphRequest(`/${settings.phoneNumberId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Get message templates
 */
export async function getMessageTemplates(limit = 100) {
  const settings = await getSettings();
  
  if (!settings?.wabaId) {
    throw new Error('WhatsApp Business Account ID yapılandırılmamış');
  }

  return graphRequest(
    `/${settings.wabaId}/message_templates?fields=id,name,language,status,category,components,quality_score&limit=${limit}`
  );
}

/**
 * Create message template
 */
export async function createMessageTemplate(templateData) {
  const settings = await getSettings();
  
  if (!settings?.wabaId) {
    throw new Error('WhatsApp Business Account ID yapılandırılmamış');
  }

  return graphRequest(`/${settings.wabaId}/message_templates`, {
    method: 'POST',
    body: JSON.stringify(templateData),
  });
}

/**
 * Delete message template
 */
export async function deleteMessageTemplate(templateName) {
  const settings = await getSettings();
  
  if (!settings?.wabaId) {
    throw new Error('WhatsApp Business Account ID yapılandırılmamış');
  }

  return graphRequest(
    `/${settings.wabaId}/message_templates?name=${templateName}`,
    { method: 'DELETE' }
  );
}

/**
 * Get phone number info
 */
export async function getPhoneNumberInfo() {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  return graphRequest(
    `/${settings.phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type,throughput`
  );
}

/**
 * Get business profile
 */
export async function getBusinessProfile() {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  return graphRequest(
    `/${settings.phoneNumberId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`
  );
}

/**
 * Update business profile
 */
export async function updateBusinessProfile(profileData) {
  const settings = await getSettings();
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  return graphRequest(`/${settings.phoneNumberId}/whatsapp_business_profile`, {
    method: 'POST',
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      ...profileData,
    }),
  });
}

/**
 * Upload media to WhatsApp
 */
export async function uploadMedia(file, mimeType) {
  const settings = await getSettings();
  const token = getActiveAccessToken(settings);
  
  if (!settings?.phoneNumberId) {
    throw new Error('Phone Number ID yapılandırılmamış');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', mimeType);
  formData.append('messaging_product', 'whatsapp');

  const response = await fetch(
    `${GRAPH_API_BASE}/${settings.phoneNumberId}/media?access_token=${token}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}

/**
 * Get media URL from media ID
 */
export async function getMediaUrl(mediaId) {
  return graphRequest(`/${mediaId}`);
}

/**
 * Download media from URL
 */
export async function downloadMedia(mediaUrl) {
  const settings = await getSettings();
  const token = getActiveAccessToken(settings);

  const response = await fetch(mediaUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Medya indirilemedi');
  }

  return response;
}
