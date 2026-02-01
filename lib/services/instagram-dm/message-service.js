/**
 * Instagram DM Message Service
 * Mesaj yönetimi (Admin SDK)
 */

import { adminDb } from '../../firebase-admin';
import { COLLECTIONS, MESSAGE_TYPE, PLATFORM_TYPE } from './schema';
import * as apiClient from './api-client';
import * as conversationService from './conversation-service';
import { getSettings } from './settings-service';

/**
 * Konuşmadaki mesajları listeler
 * @param {string} conversationId - Conversation ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Messages list
 */
export async function getMessages(conversationId, options = {}) {
  try {
    if (!adminDb) {
      console.log('❌ getMessages: adminDb not initialized');
      return [];
    }
    
    const { limitCount = 100 } = options;
    
    console.log('📨 getMessages called for conversationId:', conversationId);

    // Firestore composite index gerektirir:
    // Collection: instagram_dm_messages
    // Fields: conversationId (Ascending), sentAt (Ascending)
    const snapshot = await adminDb.collection(COLLECTIONS.MESSAGES)
      .where('conversationId', '==', conversationId)
      .orderBy('sentAt', 'asc')
      .limit(limitCount)
      .get();

    console.log('📨 getMessages found:', snapshot.size, 'messages');

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('❌ Error getting messages:', error.message);
    
    // Index hatası ise link göster
    if (error.code === 9 || error.message?.includes('index')) {
      console.error('');
      console.error('🔗 ========================================');
      console.error('🔗 FIRESTORE INDEX GEREKLİ!');
      console.error('🔗 Aşağıdaki linke tıklayarak index oluşturun:');
      console.error('🔗 ========================================');
      console.error(error.message);
      console.error('');
    }
    
    return [];
  }
}

/**
 * Mesaj kaydeder (Firestore'a)
 * @param {Object} messageData - Message data
 * @returns {Promise<string>} Message ID
 */
export async function saveMessage(messageData) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const docRef = await adminDb.collection(COLLECTIONS.MESSAGES).add({
      ...messageData,
      createdAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

/**
 * Mesaj gönderir (Instagram/Facebook API + Firestore)
 * @param {string} conversationId - Conversation ID
 * @param {string} recipientId - Recipient PSID (Facebook) veya IGSID (Instagram)
 * @param {string} content - Message content
 * @returns {Promise<Object>} Sent message
 */
export async function sendMessage(conversationId, recipientId, content) {
  try {
    const settings = await getSettings();
    
    if (!settings?.pageAccessToken) {
      throw new Error('Page Access Token eksik');
    }

    // Konuşmayı getir - platform bilgisi için
    const conversation = await conversationService.getConversation(conversationId);
    const platform = conversation?.platform || PLATFORM_TYPE.INSTAGRAM;

    // Platform'a göre doğru ID'yi kullan
    // Facebook Messenger: Page ID kullan
    // Instagram DM: Instagram Account ID kullan
    let senderAccountId;
    if (platform === PLATFORM_TYPE.FACEBOOK || platform === 'facebook') {
      if (!settings?.pageId) {
        throw new Error('Facebook Page ID eksik');
      }
      senderAccountId = settings.pageId;
      console.log('📤 Sending Facebook Messenger message via Page ID:', senderAccountId);
    } else {
      if (!settings?.instagramAccountId) {
        throw new Error('Instagram Account ID eksik');
      }
      senderAccountId = settings.instagramAccountId;
      console.log('📤 Sending Instagram DM message via IG Account ID:', senderAccountId);
    }

    // API'ye gönder
    const apiResponse = await apiClient.sendMessage(
      senderAccountId,
      recipientId,
      content,
      settings.pageAccessToken
    );

    const now = new Date();
    
    // Firestore'a kaydet
    const messageData = {
      conversationId,
      igMessageId: apiResponse.message_id,
      senderId: senderAccountId,
      isFromCustomer: false,
      content,
      messageType: MESSAGE_TYPE.TEXT,
      mediaUrl: null,
      platform: platform,
      sentAt: now,
      deliveredAt: null,
      readAt: null,
    };

    const messageId = await saveMessage(messageData);

    // Konuşmayı güncelle
    await conversationService.upsertConversation(conversationId, {
      lastMessageAt: now,
      lastMessagePreview: content.substring(0, 100),
    });

    return {
      id: messageId,
      ...messageData,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Görsel mesaj gönderir
 * @param {string} conversationId - Conversation ID
 * @param {string} recipientId - Recipient IGSID
 * @param {string} imageUrl - Image URL
 * @returns {Promise<Object>} Sent message
 */
export async function sendImageMessage(conversationId, recipientId, imageUrl) {
  try {
    const settings = await getSettings();
    
    if (!settings?.pageAccessToken) {
      throw new Error('Page Access Token eksik');
    }

    // Konuşmayı getir - platform bilgisi için
    const conversation = await conversationService.getConversation(conversationId);
    const platform = conversation?.platform || PLATFORM_TYPE.INSTAGRAM;

    // Platform'a göre doğru sender ID'yi belirle
    // Facebook Messenger: Page ID kullanılmalı
    // Instagram DM: Instagram Account ID kullanılmalı
    let senderAccountId;
    if (platform === PLATFORM_TYPE.FACEBOOK || platform === 'facebook') {
      if (!settings?.pageId) {
        throw new Error('Facebook Page ID eksik');
      }
      senderAccountId = settings.pageId;
      console.log('🖼️ Sending Facebook Messenger image via Page ID:', senderAccountId);
    } else {
      if (!settings?.instagramAccountId) {
        throw new Error('Instagram Account ID eksik');
      }
      senderAccountId = settings.instagramAccountId;
      console.log('🖼️ Sending Instagram DM image via Instagram Account ID:', senderAccountId);
    }

    // Meta API'ye gönder - Page Access Token kullanılmalı
    const apiResponse = await apiClient.sendImageMessage(
      senderAccountId,
      recipientId,
      imageUrl,
      settings.pageAccessToken
    );

    const now = new Date();
    
    // Firestore'a kaydet
    const messageData = {
      conversationId,
      igMessageId: apiResponse.message_id,
      senderId: senderAccountId,
      isFromCustomer: false,
      content: '[Görsel]',
      messageType: MESSAGE_TYPE.IMAGE,
      mediaUrl: imageUrl,
      platform: platform,
      sentAt: now,
      deliveredAt: null,
      readAt: null,
    };

    const messageId = await saveMessage(messageData);

    // Konuşmayı güncelle
    await conversationService.upsertConversation(conversationId, {
      lastMessageAt: now,
      lastMessagePreview: '[Görsel]',
    });

    return {
      id: messageId,
      ...messageData,
    };
  } catch (error) {
    console.error('Error sending image message:', error);
    throw error;
  }
}

/**
 * Webhook'tan gelen mesajı işler
 * @param {Object} webhookMessage - Webhook message payload
 * @param {string} platform - Platform type ('instagram' or 'facebook')
 * @returns {Promise<Object>} Processed message
 */
export async function processIncomingMessage(webhookMessage, platform = PLATFORM_TYPE.INSTAGRAM) {
  try {
    console.log('📥 Processing incoming message:', JSON.stringify(webhookMessage, null, 2));
    console.log('📱 Platform:', platform);
    
    const { sender, recipient, timestamp, message } = webhookMessage;

    // Konuşmayı bul veya oluştur
    let conversation = await conversationService.findByIgUserId(sender.id);
    console.log('🔍 Found conversation:', conversation?.id || 'NEW');
    
    const sentTime = new Date(timestamp);
    
    const conversationData = {
      igUserId: sender.id,
      lastMessageAt: sentTime,
      lastMessagePreview: message.text?.substring(0, 100) || '[Medya]',
      platform: platform, // facebook veya instagram
    };

    // Kullanıcı bilgilerini çek - hem yeni hem mevcut konuşmalar için (eğer eksikse)
    const shouldFetchProfile = !conversation || !conversation.igUsername;
    
    if (shouldFetchProfile) {
      console.log('👤 Fetching user profile for platform:', platform);
      const settings = await getSettings();
      
      if (settings?.pageAccessToken) {
        try {
          // Platform'a göre profil çek - Facebook için pageId de geçir
          const userProfile = await apiClient.getUserProfile(
            sender.id,
            settings.pageAccessToken,
            platform,
            settings.pageId // Facebook conversation participant lookup için
          );
          
          if (userProfile) {
            console.log('✅ User profile fetched:', userProfile);
            // Facebook için name, Instagram için username
            if (platform === 'facebook') {
              conversationData.igUsername = userProfile.name || null;
              conversationData.displayName = userProfile.name || null;
            } else {
              conversationData.igUsername = userProfile.username || null;
            }
            conversationData.profilePicUrl = userProfile.profile_pic || null;
          } else if (platform === 'facebook' && !conversation?.igUsername) {
            // Profil alınamadı, "Messenger Kullanıcısı" olarak işaretle
            conversationData.igUsername = 'Messenger Kullanıcısı';
          }
        } catch (profileError) {
          console.warn('⚠️ Could not fetch user profile:', profileError.message);
          // Facebook için varsayılan isim
          if (platform === 'facebook' && !conversation?.igUsername) {
            conversationData.igUsername = 'Messenger Kullanıcısı';
          }
        }
      }
    }

    const conversationId = conversation?.id || sender.id;
    
    // Konuşmayı güncelle/oluştur
    await conversationService.upsertConversation(conversationId, {
      ...conversationData,
      unreadCount: (conversation?.unreadCount || 0) + 1,
    });

    // Mesaj tipini belirle
    let messageType = MESSAGE_TYPE.TEXT;
    let mediaUrl = null;
    let content = message.text || '';

    if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0];
      mediaUrl = attachment.payload?.url;
      
      switch (attachment.type) {
        case 'image':
          messageType = MESSAGE_TYPE.IMAGE;
          content = content || '[Görsel]';
          break;
        case 'video':
          messageType = MESSAGE_TYPE.VIDEO;
          content = content || '[Video]';
          break;
        case 'audio':
          messageType = MESSAGE_TYPE.AUDIO;
          content = content || '[Ses]';
          break;
        case 'file':
          messageType = MESSAGE_TYPE.FILE;
          content = content || '[Dosya]';
          break;
        default:
          if (message.is_echo) {
            // Echo mesajları (kendi gönderdiğimiz)
            return null;
          }
      }
    }

    // Story reply/mention kontrolü
    if (message.reply_to?.story) {
      messageType = MESSAGE_TYPE.STORY_REPLY;
      content = `[Story yanıtı] ${content}`;
    }

    // Mesajı kaydet
    const messageData = {
      conversationId,
      igMessageId: message.mid,
      senderId: sender.id,
      isFromCustomer: true,
      content,
      messageType,
      mediaUrl,
      platform: platform, // facebook veya instagram
      sentAt: sentTime,
      deliveredAt: null,
      readAt: null,
    };

    const messageId = await saveMessage(messageData);
    console.log('✅ Message saved:', messageId, 'in conversation:', conversationId);

    return {
      id: messageId,
      conversationId,
      ...messageData,
    };
  } catch (error) {
    console.error('❌ Error processing incoming message:', error);
    throw error;
  }
}
