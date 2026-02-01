/**
 * Instagram DM Webhook Handler
 * Webhook event işleme
 */

import crypto from 'crypto';
import { processIncomingMessage } from './message-service';
import { getSettings } from './settings-service';

/**
 * Webhook verification (GET request)
 * @param {Object} params - Query parameters
 * @param {string} verifyToken - Expected verify token
 * @returns {Object} Verification response
 */
export function verifyWebhook(params, verifyToken) {
  const mode = params['hub.mode'];
  const token = params['hub.verify_token'];
  const challenge = params['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully');
    return {
      success: true,
      challenge: challenge,
    };
  }

  console.warn('Webhook verification failed', { mode, tokenMatch: token === verifyToken });
  return {
    success: false,
    error: 'Verification failed',
  };
}

/**
 * Webhook signature validation
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Hub-Signature-256 header
 * @param {string} appSecret - Meta App Secret (Dashboard > Settings > Basic)
 * @returns {boolean} Is valid
 */
export function validateSignature(payload, signature, appSecret) {
  if (!signature || !appSecret) {
    console.warn('Missing signature or Meta App Secret');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload, 'utf-8')
    .digest('hex');

  const providedSignature = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(providedSignature)
  );
}

/**
 * Webhook event handler (POST request)
 * @param {Object} body - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export async function handleWebhookEvent(body) {
  try {
    const { object, entry } = body;

    console.log('📨 Webhook received:', JSON.stringify(body, null, 2));

    // Instagram veya Page mesaj webhook'u kontrolü
    if (object !== 'instagram' && object !== 'page') {
      console.log('❌ Ignoring webhook, object type:', object);
      return { processed: false, reason: `Unsupported object type: ${object}` };
    }

    // Platform tipini belirle: 'page' -> facebook, 'instagram' -> instagram
    const platform = object === 'page' ? 'facebook' : 'instagram';
    console.log('📱 Platform detected:', platform);

    const results = [];

    for (const entryItem of entry) {
      // "messaging" array (Instagram direct)
      const { messaging, changes, id: entryId } = entryItem;

      console.log('📋 Entry item:', JSON.stringify(entryItem, null, 2));
      console.log('📋 Entry ID:', entryId);
      console.log('📬 Messaging array:', messaging ? `${messaging.length} events` : 'NO MESSAGING');
      console.log('📬 Changes array:', changes ? `${changes.length} changes` : 'NO CHANGES');

      // "changes" array formatını işle (Facebook Page webhook)
      if (changes && Array.isArray(changes)) {
        for (const change of changes) {
          console.log('🔄 Processing change:', JSON.stringify(change, null, 2));
          
          if (change.field === 'messages' && change.value) {
            const value = change.value;
            
            // Mesaj var mı?
            if (value.message) {
              console.log('✅ Found message in changes format!');
              
              // Webhook formatını messaging formatına dönüştür
              const messagingEvent = {
                sender: { id: value.sender?.id || value.from?.id },
                recipient: { id: value.recipient?.id || entryId },
                timestamp: value.timestamp || Date.now(),
                message: {
                  mid: value.message.mid || value.message.id,
                  text: value.message.text,
                  attachments: value.message.attachments,
                  is_echo: value.message.is_echo,
                  reply_to: value.message.reply_to,
                }
              };

              // Echo mesajları atla
              if (messagingEvent.message.is_echo) {
                console.log('🔄 Skipping echo message from changes');
                continue;
              }

              try {
                const result = await processIncomingMessage(messagingEvent, platform);
                if (result) {
                  console.log('💾 Message saved from changes:', result.id);
                  results.push({
                    type: 'message',
                    source: 'changes',
                    platform,
                    success: true,
                    messageId: result.id,
                    conversationId: result.conversationId,
                  });
                }
              } catch (error) {
                console.error('Error processing message from changes:', error);
                results.push({
                  type: 'message',
                  source: 'changes',
                  platform,
                  success: false,
                  error: error.message,
                });
              }
            }
          }
        }
      }

      // "messaging" array formatını işle (Instagram direct messaging)
      if (!messaging || !Array.isArray(messaging)) {
        console.log('⚠️ No messaging array in entry, checking changes only...');
        continue;
      }

      for (const messagingEvent of messaging) {
        console.log('📩 Processing event:', JSON.stringify(messagingEvent, null, 2));
        console.log('🔍 Event keys:', Object.keys(messagingEvent));
        
        // Echo mesajları atla (kendi gönderdiğimiz)
        if (messagingEvent.message?.is_echo) {
          console.log('🔄 Skipping echo message');
          continue;
        }

        // message_edit eventi - atla
        if (messagingEvent.message_edit) {
          console.log('✏️ Skipping message_edit event');
          continue;
        }

        // Mesaj event'i
        if (messagingEvent.message) {
          console.log('✅ Found message event! Processing...');
          try {
            const result = await processIncomingMessage(messagingEvent, platform);
            if (result) {
              console.log('💾 Message saved:', result.id);
              results.push({
                type: 'message',
                platform,
                success: true,
                messageId: result.id,
                conversationId: result.conversationId,
              });
            }
          } catch (error) {
            console.error('Error processing message:', error);
            results.push({
              type: 'message',
              platform,
              success: false,
              error: error.message,
            });
          }
        }

        // Read receipt event
        if (messagingEvent.read) {
          console.log('Read receipt received:', messagingEvent.read);
          results.push({
            type: 'read',
            success: true,
            watermark: messagingEvent.read.watermark,
          });
        }

        // Delivery receipt event
        if (messagingEvent.delivery) {
          console.log('Delivery receipt received:', messagingEvent.delivery);
          results.push({
            type: 'delivery',
            success: true,
            mids: messagingEvent.delivery.mids,
          });
        }

        // Reaction event
        if (messagingEvent.reaction) {
          console.log('Reaction received:', messagingEvent.reaction);
          results.push({
            type: 'reaction',
            success: true,
            reaction: messagingEvent.reaction.reaction,
            mid: messagingEvent.reaction.mid,
          });
        }
      }
    }

    return {
      processed: true,
      results,
    };
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return {
      processed: false,
      error: error.message,
    };
  }
}

/**
 * Webhook payload'ı parse eder
 * @param {string|Object} body - Request body
 * @returns {Object} Parsed body
 */
export function parseWebhookPayload(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (error) {
      console.error('Error parsing webhook payload:', error);
      return null;
    }
  }
  return body;
}
