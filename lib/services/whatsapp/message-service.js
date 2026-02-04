/**
 * WhatsApp Business API - Message Service
 * Mesaj yönetimi servisi (Firebase Admin SDK)
 */

import { adminDb } from '../../firebase-admin';
import admin from 'firebase-admin';
import {
  COLLECTIONS,
  MESSAGE_SCHEMA,
  MESSAGE_TYPES,
  MESSAGE_STATUS,
} from './schema';
import {
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  markMessageAsRead as markReadApi,
} from './api-client';
import {
  upsertConversation,
  updateLastMessage,
  updateServiceWindow,
  findByWaId,
} from './conversation-service';
import {
  findByPhone as findContactByPhone,
  createContact,
} from './contact-service';
import { getSettings } from './settings-service';

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId, options = {}) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return { data: [], hasMore: false };
    }

    const { pageSize = 50, lastDoc, beforeTimestamp } = options;

    let queryRef = adminDb
      .collection(COLLECTIONS.MESSAGES)
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'desc');

    if (beforeTimestamp) {
      queryRef = queryRef.where('timestamp', '<', beforeTimestamp);
    }

    if (lastDoc) {
      queryRef = queryRef.startAfter(lastDoc);
    }

    queryRef = queryRef.limit(pageSize + 1);

    const snapshot = await queryRef.get();
    const messages = [];
    let lastVisible = null;

    snapshot.docs.slice(0, pageSize).forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
      lastVisible = doc;
    });

    return {
      data: messages.reverse(), // Chronological order
      hasMore: snapshot.docs.length > pageSize,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

/**
 * Get single message by ID
 */
export async function getMessage(messageId) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

    const docRef = adminDb.collection(COLLECTIONS.MESSAGES).doc(messageId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  } catch (error) {
    console.error('Error getting message:', error);
    throw error;
  }
}

/**
 * Find message by WhatsApp message ID
 */
export async function findByWamId(wamId) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

    const snapshot = await adminDb
      .collection(COLLECTIONS.MESSAGES)
      .where('wamId', '==', wamId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error finding message by wamId:', error);
    throw error;
  }
}

/**
 * Recursively remove undefined values from an object
 */
function removeUndefinedValues(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item)).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object' && !(obj instanceof Date) && !obj._seconds) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = removeUndefinedValues(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }
  
  return obj;
}

/**
 * Save message to Firestore
 */
export async function saveMessage(messageData) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    // Build message object without spreading MESSAGE_SCHEMA to avoid nested object issues
    const message = {
      conversationId: messageData.conversationId || '',
      wamId: messageData.wamId || '',
      waId: messageData.waId || '',
      phoneNumberId: messageData.phoneNumberId || '',
      direction: messageData.direction || '',
      type: messageData.type || MESSAGE_TYPES.TEXT,
      status: messageData.status || MESSAGE_STATUS.PENDING,
      timestamp: messageData.timestamp || admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add optional fields only if they have values
    if (messageData.text) message.text = messageData.text;
    if (messageData.caption) message.caption = messageData.caption;
    if (messageData.mediaId) message.mediaId = messageData.mediaId;
    if (messageData.mediaUrl) message.mediaUrl = messageData.mediaUrl;
    if (messageData.mimeType) message.mimeType = messageData.mimeType;
    if (messageData.filename) message.filename = messageData.filename;
    if (messageData.templateName) message.templateName = messageData.templateName;
    if (messageData.templateLanguage) message.templateLanguage = messageData.templateLanguage;
    if (messageData.templateComponents) message.templateComponents = messageData.templateComponents;
    if (messageData.replyToMessageId) message.replyToMessageId = messageData.replyToMessageId;
    if (messageData.error) message.error = messageData.error;
    
    // Handle location data
    if (messageData.latitude !== undefined) message.latitude = messageData.latitude;
    if (messageData.longitude !== undefined) message.longitude = messageData.longitude;
    if (messageData.locationName) message.locationName = messageData.locationName;
    if (messageData.locationAddress) message.locationAddress = messageData.locationAddress;
    
    // Handle contacts
    if (messageData.contacts) message.contacts = messageData.contacts;
    
    // Handle interactive/button data
    if (messageData.payload) message.payload = messageData.payload;
    if (messageData.description) message.description = messageData.description;
    
    // Handle reaction data
    if (messageData.emoji) message.emoji = messageData.emoji;
    if (messageData.reactedMessageId) message.reactedMessageId = messageData.reactedMessageId;
    
    // Handle sticker data
    if (messageData.animated !== undefined) message.animated = messageData.animated;
    
    // Handle audio data
    if (messageData.voice !== undefined) message.voice = messageData.voice;

    // Final cleanup - recursively remove any remaining undefined values
    const cleanedMessage = removeUndefinedValues(message);

    const docRef = await adminDb.collection(COLLECTIONS.MESSAGES).add(cleanedMessage);
    return { id: docRef.id, ...cleanedMessage };
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

/**
 * Update message status
 */
export async function updateMessageStatus(messageId, status, errorInfo = null) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const updateData = {
      status,
      statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (errorInfo) {
      updateData.error = errorInfo;
    }

    const docRef = adminDb.collection(COLLECTIONS.MESSAGES).doc(messageId);
    await docRef.update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
}

/**
 * Send text message
 * @param {string} conversationId - Conversation ID
 * @param {string} to - Recipient phone number
 * @param {string} text - Message text
 * @param {string} replyToMessageId - Optional wamId to reply to
 */
export async function sendMessage(conversationId, to, text, replyToMessageId = null) {
  try {
    // Get settings to get phoneNumberId
    const settings = await getSettings();
    const phoneNumberId = settings?.phoneNumberId;

    // Send via API
    const response = await sendTextMessage(to, text, false, replyToMessageId);

    if (response.error) {
      throw new Error(response.error.message);
    }

    const wamId = response.messages?.[0]?.id;

    // Get or create conversation
    let conversation = await findByWaId(to);
    if (!conversation) {
      conversation = await upsertConversation(to, {
        displayPhoneNumber: to,
        phoneNumberId: phoneNumberId,
      });
    }

    // Save message to Firestore
    const messageData = {
      conversationId: conversation.id,
      wamId,
      waId: to,
      phoneNumberId: phoneNumberId, // Business phone number ID
      direction: 'outbound',
      type: MESSAGE_TYPES.TEXT,
      text,
      status: MESSAGE_STATUS.SENT,
      timestamp: admin.firestore.Timestamp.now(),
    };

    // Add reply context if provided
    if (replyToMessageId) {
      messageData.replyToMessageId = replyToMessageId;
    }

    const message = await saveMessage(messageData);

    // Update conversation
    await updateLastMessage(conversation.id, {
      text,
      type: MESSAGE_TYPES.TEXT,
      direction: 'outbound',
    });

    return { success: true, message, wamId };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Send image message
 */
export async function sendImageMessage(conversationId, to, imageUrl, caption = null) {
  try {
    // Get settings to get phoneNumberId
    const settings = await getSettings();
    const phoneNumberId = settings?.phoneNumberId;

    const response = await sendMediaMessage(to, 'image', imageUrl, caption);

    if (response.error) {
      throw new Error(response.error.message);
    }

    const wamId = response.messages?.[0]?.id;

    let conversation = await findByWaId(to);
    if (!conversation) {
      conversation = await upsertConversation(to, {
        displayPhoneNumber: to,
        phoneNumberId: phoneNumberId,
      });
    }

    const message = await saveMessage({
      conversationId: conversation.id,
      wamId,
      waId: to,
      phoneNumberId: phoneNumberId,
      direction: 'outbound',
      type: MESSAGE_TYPES.IMAGE,
      mediaUrl: imageUrl,
      caption,
      status: MESSAGE_STATUS.SENT,
      timestamp: admin.firestore.Timestamp.now(),
    });

    await updateLastMessage(conversation.id, {
      text: caption || '[Resim]',
      type: MESSAGE_TYPES.IMAGE,
      direction: 'outbound',
    });

    return { success: true, message, wamId };
  } catch (error) {
    console.error('Error sending image message:', error);
    throw error;
  }
}

/**
 * Send document message
 */
export async function sendDocumentMessage(conversationId, to, documentUrl, filename, caption = null) {
  try {
    // Get settings to get phoneNumberId
    const settings = await getSettings();
    const phoneNumberId = settings?.phoneNumberId;

    const response = await sendMediaMessage(to, 'document', documentUrl, caption, filename);

    if (response.error) {
      throw new Error(response.error.message);
    }

    const wamId = response.messages?.[0]?.id;

    let conversation = await findByWaId(to);
    if (!conversation) {
      conversation = await upsertConversation(to, {
        displayPhoneNumber: to,
        phoneNumberId: phoneNumberId,
      });
    }

    const message = await saveMessage({
      conversationId: conversation.id,
      wamId,
      waId: to,
      phoneNumberId: phoneNumberId,
      direction: 'outbound',
      type: MESSAGE_TYPES.DOCUMENT,
      mediaUrl: documentUrl,
      filename,
      caption,
      status: MESSAGE_STATUS.SENT,
      timestamp: admin.firestore.Timestamp.now(),
    });

    await updateLastMessage(conversation.id, {
      text: caption || `[Dosya: ${filename}]`,
      type: MESSAGE_TYPES.DOCUMENT,
      direction: 'outbound',
    });

    return { success: true, message, wamId };
  } catch (error) {
    console.error('Error sending document message:', error);
    throw error;
  }
}

/**
 * Send generic media message (video, audio)
 */
export async function sendGenericMediaMessage(conversationId, to, type, mediaUrl, caption = null) {
  try {
    // Get settings to get phoneNumberId
    const settings = await getSettings();
    const phoneNumberId = settings?.phoneNumberId;

    const response = await sendMediaMessage(to, type, mediaUrl, caption);

    if (response.error) {
      throw new Error(response.error.message);
    }

    const wamId = response.messages?.[0]?.id;

    let conversation = await findByWaId(to);
    if (!conversation) {
      conversation = await upsertConversation(to, {
        displayPhoneNumber: to,
        phoneNumberId: phoneNumberId,
      });
    }

    const typeLabels = {
      video: '[Video]',
      audio: '[Ses]',
      image: '[Resim]',
    };

    const message = await saveMessage({
      conversationId: conversation.id,
      wamId,
      waId: to,
      phoneNumberId: phoneNumberId,
      direction: 'outbound',
      type: type.toUpperCase(),
      mediaUrl,
      caption,
      status: MESSAGE_STATUS.SENT,
      timestamp: admin.firestore.Timestamp.now(),
    });

    await updateLastMessage(conversation.id, {
      text: caption || typeLabels[type] || `[${type}]`,
      type: type.toUpperCase(),
      direction: 'outbound',
    });

    return { success: true, message, wamId };
  } catch (error) {
    console.error(`Error sending ${type} message:`, error);
    throw error;
  }
}

/**
 * Send template message
 */
export async function sendTemplate(conversationId, to, templateName, language, components = null) {
  try {
    // Get settings to get phoneNumberId
    const settings = await getSettings();
    const phoneNumberId = settings?.phoneNumberId;

    const response = await sendTemplateMessage(to, templateName, language, components);

    if (response.error) {
      throw new Error(response.error.message);
    }

    const wamId = response.messages?.[0]?.id;

    let conversation = await findByWaId(to);
    if (!conversation) {
      conversation = await upsertConversation(to, {
        displayPhoneNumber: to,
        phoneNumberId: phoneNumberId,
      });
    }

    const message = await saveMessage({
      conversationId: conversation.id,
      wamId,
      waId: to,
      phoneNumberId: phoneNumberId,
      direction: 'outbound',
      type: MESSAGE_TYPES.TEMPLATE,
      templateName,
      templateLanguage: language,
      templateComponents: components,
      status: MESSAGE_STATUS.SENT,
      timestamp: admin.firestore.Timestamp.now(),
    });

    await updateLastMessage(conversation.id, {
      text: `[Şablon: ${templateName}]`,
      type: MESSAGE_TYPES.TEMPLATE,
      direction: 'outbound',
    });

    return { success: true, message, wamId };
  } catch (error) {
    console.error('Error sending template message:', error);
    throw error;
  }
}

/**
 * Process incoming message from webhook
 */
export async function processIncomingMessage(webhookMessage, contact = null, phoneNumberId = null) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const { from, id: wamId, timestamp, type } = webhookMessage;
    
    // Check if message already exists
    const existing = await findByWamId(wamId);
    if (existing) {
      console.log('Message already processed:', wamId);
      return { success: true, message: existing, duplicate: true };
    }

    // Extract profile name from contact
    const profileName = contact?.profile?.name || webhookMessage.profile?.name;

    // Get or create conversation
    let conversation = await findByWaId(from);
    if (!conversation) {
      conversation = await upsertConversation(from, {
        displayPhoneNumber: from,
        profileName: profileName,
        phoneNumberId: phoneNumberId, // Business phone number ID
      });
    } else if (profileName && !conversation.profileName) {
      // Update profile name if we didn't have it
      const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversation.id);
      await docRef.update({
        profileName: profileName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Auto-create contact if enabled in settings
    let autoCreatedContact = null;
    try {
      const settings = await getSettings();
      if (settings?.autoCreateContacts !== false) {
        // Check if contact exists
        const existingContact = await findContactByPhone(from);
        if (!existingContact) {
          // Create new contact
          const contactResult = await createContact({
            name: profileName || from,
            phoneNumber: from,
            waId: from,
            profileName: profileName,
            phoneNumberId: phoneNumberId, // Business phone number ID
            group: 'other',
            notes: 'WhatsApp üzerinden otomatik oluşturuldu',
          }, 'system');
          
          if (contactResult.success) {
            autoCreatedContact = contactResult.contact;
            console.log('Auto-created contact:', from, profileName);
          }
        }
      }
    } catch (contactError) {
      // Don't fail the message processing if contact creation fails
      console.error('Error auto-creating contact:', contactError);
    }

    // Parse message content based on type
    const messageData = parseMessageContent(webhookMessage);

    // Save message
    const message = await saveMessage({
      conversationId: conversation.id,
      wamId,
      waId: from,
      phoneNumberId: phoneNumberId, // Business phone number ID
      direction: 'inbound',
      type: type || MESSAGE_TYPES.TEXT,
      ...messageData,
      status: MESSAGE_STATUS.DELIVERED,
      timestamp: admin.firestore.Timestamp.fromMillis(parseInt(timestamp) * 1000),
    });

    // Update conversation
    await updateLastMessage(conversation.id, {
      text: messageData.text || `[${type}]`,
      type: type || MESSAGE_TYPES.TEXT,
      direction: 'inbound',
    });

    // Update service window (24-hour messaging window)
    await updateServiceWindow(conversation.id);

    // Mark as read in WhatsApp
    try {
      await markReadApi(wamId);
    } catch (err) {
      console.error('Error marking message as read in WhatsApp:', err);
    }

    return { success: true, message, conversation, autoCreatedContact };
  } catch (error) {
    console.error('Error processing incoming message:', error);
    throw error;
  }
}

/**
 * Parse message content based on type
 */
function parseMessageContent(message) {
  const { type } = message;
  const content = {};

  switch (type) {
    case 'text':
      content.text = message.text?.body;
      break;

    case 'image':
      content.mediaId = message.image?.id;
      content.mimeType = message.image?.mime_type;
      content.caption = message.image?.caption;
      break;

    case 'video':
      content.mediaId = message.video?.id;
      content.mimeType = message.video?.mime_type;
      content.caption = message.video?.caption;
      break;

    case 'audio':
      content.mediaId = message.audio?.id;
      content.mimeType = message.audio?.mime_type;
      content.voice = message.audio?.voice;
      break;

    case 'document':
      content.mediaId = message.document?.id;
      content.mimeType = message.document?.mime_type;
      content.filename = message.document?.filename;
      content.caption = message.document?.caption;
      break;

    case 'sticker':
      content.mediaId = message.sticker?.id;
      content.mimeType = message.sticker?.mime_type;
      content.animated = message.sticker?.animated;
      break;

    case 'location':
      content.latitude = message.location?.latitude;
      content.longitude = message.location?.longitude;
      content.locationName = message.location?.name;
      content.locationAddress = message.location?.address;
      break;

    case 'contacts':
      content.contacts = message.contacts;
      break;

    case 'button':
      content.text = message.button?.text;
      content.payload = message.button?.payload;
      break;

    case 'interactive':
      if (message.interactive?.type === 'button_reply') {
        content.text = message.interactive.button_reply?.title;
        content.payload = message.interactive.button_reply?.id;
      } else if (message.interactive?.type === 'list_reply') {
        content.text = message.interactive.list_reply?.title;
        content.payload = message.interactive.list_reply?.id;
        content.description = message.interactive.list_reply?.description;
      }
      break;

    case 'reaction':
      content.emoji = message.reaction?.emoji;
      content.reactedMessageId = message.reaction?.message_id;
      break;

    default:
      content.rawType = type;
  }

  // Remove undefined values
  Object.keys(content).forEach(key => {
    if (content[key] === undefined) {
      delete content[key];
    }
  });

  return content;
}

/**
 * Process status update from webhook
 */
export async function processStatusUpdate(statusData) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const { id: wamId, status, timestamp, errors } = statusData;

    // Find message by wamId
    const message = await findByWamId(wamId);
    if (!message) {
      console.log('Message not found for status update:', wamId);
      return { success: false, error: 'Message not found' };
    }

    // Map WhatsApp status to our status
    const statusMap = {
      sent: MESSAGE_STATUS.SENT,
      delivered: MESSAGE_STATUS.DELIVERED,
      read: MESSAGE_STATUS.READ,
      failed: MESSAGE_STATUS.FAILED,
    };

    const newStatus = statusMap[status] || status;

    // Update message status
    const errorInfo = errors?.[0] ? {
      code: errors[0].code,
      title: errors[0].title,
      message: errors[0].message,
    } : null;

    await updateMessageStatus(message.id, newStatus, errorInfo);

    return { success: true, messageId: message.id, status: newStatus };
  } catch (error) {
    console.error('Error processing status update:', error);
    throw error;
  }
}

/**
 * Get all messages (for analytics)
 */
export async function getAllMessages(options = {}) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return { data: [] };
    }

    const { limit: queryLimit = 1000, direction, startDate, endDate } = options;

    let queryRef = adminDb.collection(COLLECTIONS.MESSAGES);

    if (direction) {
      queryRef = queryRef.where('direction', '==', direction);
    }

    if (startDate) {
      queryRef = queryRef.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate));
    }

    if (endDate) {
      queryRef = queryRef.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(endDate));
    }

    queryRef = queryRef.orderBy('timestamp', 'desc').limit(queryLimit);

    const snapshot = await queryRef.get();
    const messages = [];

    snapshot.docs.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    return { data: messages };
  } catch (error) {
    console.error('Error getting all messages:', error);
    return { data: [] };
  }
}

/**
 * Delete message
 */
export async function deleteMessage(messageId) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.MESSAGES).doc(messageId);
    await docRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}
