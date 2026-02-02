/**
 * WhatsApp Business API - Webhook Handler
 * Webhook işleme servisi
 */

import crypto from 'crypto';
import { adminDb } from '../../firebase-admin';
import admin from 'firebase-admin';
import { WEBHOOK_EVENTS, COLLECTIONS } from './schema';
import { getSettings } from './settings-service';
import { processIncomingMessage, processStatusUpdate } from './message-service';

/**
 * Verify webhook subscription
 */
export function verifyWebhook(params, verifyToken) {
  const mode = params['hub.mode'];
  const token = params['hub.verify_token'];
  const challenge = params['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully');
    return {
      success: true,
      challenge,
    };
  }

  console.warn('Webhook verification failed:', { mode, tokenMatch: token === verifyToken });
  return {
    success: false,
    error: 'Verification failed',
  };
}

/**
 * Validate webhook signature
 */
export function validateSignature(rawBody, signature, appSecret) {
  if (!signature || !appSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  const providedSignature = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(providedSignature)
  );
}

/**
 * Parse webhook payload
 */
export function parseWebhookPayload(rawBody) {
  try {
    if (typeof rawBody === 'string') {
      return JSON.parse(rawBody);
    }
    return rawBody;
  } catch (error) {
    console.error('Failed to parse webhook payload:', error);
    return null;
  }
}

/**
 * Log webhook to Firestore for debugging
 */
async function logWebhook(payload, status = 'received', error = null) {
  try {
    if (!adminDb) {
      console.log('Webhook log (no DB):', JSON.stringify(payload).slice(0, 500));
      return;
    }

    const logEntry = {
      payload: JSON.parse(JSON.stringify(payload)), // Deep clone to avoid circular refs
      status,
      error: error?.message || error,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Extract key info for easier querying
      object: payload?.object,
      entryId: payload?.entry?.[0]?.id,
      hasMessages: payload?.entry?.[0]?.changes?.[0]?.value?.messages?.length > 0,
      hasStatuses: payload?.entry?.[0]?.changes?.[0]?.value?.statuses?.length > 0,
    };

    await adminDb.collection(COLLECTIONS.WEBHOOK_LOGS).add(logEntry);
    console.log('Webhook logged successfully');
  } catch (err) {
    console.error('Error logging webhook:', err);
  }
}

/**
 * Handle webhook event
 */
export async function handleWebhookEvent(body) {
  try {
    // Log webhook to Firestore for debugging
    await logWebhook(body, 'received');

    // WhatsApp webhooks have object: 'whatsapp_business_account'
    if (body.object !== 'whatsapp_business_account') {
      console.log('Ignoring non-WhatsApp webhook:', body.object);
      return { status: 'ignored', reason: 'Not a WhatsApp webhook' };
    }

    const results = {
      processed: 0,
      errors: 0,
      details: [],
    };

    // Process each entry
    for (const entry of body.entry || []) {
      // Process changes (contains messages and statuses)
      for (const change of entry.changes || []) {
        const value = change.value;
        
        if (!value) continue;

        // Get metadata
        const metadata = value.metadata || {};
        const phoneNumberId = metadata.phone_number_id;
        const displayPhoneNumber = metadata.display_phone_number;

        // Process messages
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            try {
              // Get contact info
              const contact = value.contacts?.find(
                (c) => c.wa_id === message.from
              );

              const result = await processIncomingMessage(message, contact);
              
              results.processed++;
              results.details.push({
                type: 'message',
                messageId: message.id,
                from: message.from,
                success: result.success,
              });
            } catch (error) {
              console.error('Error processing message:', error);
              results.errors++;
              results.details.push({
                type: 'message',
                messageId: message.id,
                error: error.message,
              });
            }
          }
        }

        // Process statuses
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            try {
              const result = await processStatusUpdate(status);
              
              results.processed++;
              results.details.push({
                type: 'status',
                messageId: status.id,
                status: status.status,
                success: result.success,
              });
            } catch (error) {
              console.error('Error processing status:', error);
              results.errors++;
              results.details.push({
                type: 'status',
                messageId: status.id,
                error: error.message,
              });
            }
          }
        }

        // Process errors
        if (value.errors && value.errors.length > 0) {
          for (const error of value.errors) {
            console.error('WhatsApp API error:', error);
            results.details.push({
              type: 'error',
              code: error.code,
              title: error.title,
              message: error.message,
            });
            results.errors++;
          }
        }
      }
    }

    // Log success
    await logWebhook(body, 'processed', null);

    return {
      status: 'ok',
      ...results,
    };
  } catch (error) {
    console.error('Webhook handler error:', error);
    await logWebhook(body, 'error', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Create test webhook payload (for testing)
 */
export function createTestPayload(phoneNumber, text = 'Test message') {
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test_waba_id',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15550000000',
            phone_number_id: 'test_phone_number_id',
          },
          contacts: [{
            profile: {
              name: 'Test User',
            },
            wa_id: phoneNumber,
          }],
          messages: [{
            from: phoneNumber,
            id: `wamid.test_${timestamp}`,
            timestamp: timestamp.toString(),
            text: {
              body: text,
            },
            type: 'text',
          }],
        },
        field: 'messages',
      }],
    }],
  };
}

/**
 * Create test status payload (for testing)
 */
export function createTestStatusPayload(messageId, status = 'delivered') {
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test_waba_id',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15550000000',
            phone_number_id: 'test_phone_number_id',
          },
          statuses: [{
            id: messageId,
            status,
            timestamp: timestamp.toString(),
            recipient_id: '905551234567',
          }],
        },
        field: 'messages',
      }],
    }],
  };
}
