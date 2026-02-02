/**
 * WhatsApp Business API - Settings Service
 * Ayar yönetimi servisi (Firebase Admin SDK)
 */

import { adminDb } from '../../firebase-admin';
import admin from 'firebase-admin';
import { 
  COLLECTIONS, 
  SETTINGS_DOC_ID, 
  DEFAULT_SETTINGS,
  GRAPH_API_BASE,
} from './schema';

/**
 * Generate random webhook verify token
 */
export function generateVerifyToken() {
  return `mkn_wa_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get settings from Firestore
 */
export async function getSettings() {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

    const docRef = adminDb.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  } catch (error) {
    console.error('Error getting WhatsApp settings:', error);
    throw error;
  }
}

/**
 * Save settings to Firestore
 */
export async function saveSettings(settings) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID);
    const docSnap = await docRef.get();
    const existingSettings = docSnap.exists ? docSnap.data() : null;

    const dataToSave = {
      ...DEFAULT_SETTINGS,
      ...existingSettings,
      ...settings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!existingSettings) {
      dataToSave.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await docRef.set(dataToSave, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error saving WhatsApp settings:', error);
    throw error;
  }
}

/**
 * Get or create webhook verify token
 */
export async function getOrCreateWebhookVerifyToken() {
  const settings = await getSettings();

  if (settings?.webhookVerifyToken) {
    return settings.webhookVerifyToken;
  }

  const token = generateVerifyToken();
  await saveSettings({ webhookVerifyToken: token });
  return token;
}

/**
 * Get active access token
 */
export function getActiveAccessToken(settings) {
  if (!settings) return null;
  return settings.systemUserToken || null;
}

/**
 * Check connection status with Meta API
 */
export async function checkConnectionStatus() {
  try {
    const settings = await getSettings();
    
    if (!settings) {
      return {
        status: 'disconnected',
        error: 'Ayarlar bulunamadı',
      };
    }

    const token = getActiveAccessToken(settings);
    
    if (!token) {
      return {
        status: 'disconnected',
        error: 'Access token bulunamadı',
      };
    }

    if (!settings.phoneNumberId) {
      return {
        status: 'disconnected',
        error: 'Phone Number ID bulunamadı',
      };
    }

    // Test API connection
    const response = await fetch(
      `${GRAPH_API_BASE}/${settings.phoneNumberId}?access_token=${token}`
    );
    const data = await response.json();

    if (data.error) {
      // Update connection status
      await updateConnectionStatus('error', data.error.message);
      
      return {
        status: 'error',
        error: data.error.message,
        errorCode: data.error.code,
      };
    }

    // Update connection status
    await updateConnectionStatus('connected');

    return {
      status: 'connected',
      phoneNumberId: data.id,
      displayPhoneNumber: data.display_phone_number,
      verifiedName: data.verified_name,
      qualityRating: data.quality_rating,
      wabaId: settings.wabaId,
    };
  } catch (error) {
    console.error('Error checking connection status:', error);
    await updateConnectionStatus('error', error.message);
    
    return {
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Update connection status in settings
 */
async function updateConnectionStatus(status, error = null) {
  try {
    await saveSettings({
      connectionStatus: {
        status,
        lastCheck: new Date().toISOString(),
        error,
      },
    });
  } catch (err) {
    console.error('Error updating connection status:', err);
  }
}

/**
 * Disconnect WhatsApp integration
 */
export async function disconnect() {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID);
    
    // Reset to default settings but keep webhook token
    const settings = await getSettings();
    const webhookVerifyToken = settings?.webhookVerifyToken || generateVerifyToken();
    
    await docRef.set({
      ...DEFAULT_SETTINGS,
      webhookVerifyToken,
      connectionStatus: {
        status: 'disconnected',
        lastCheck: new Date().toISOString(),
        error: null,
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    throw error;
  }
}

/**
 * Fetch account info from access token
 */
export async function fetchAccountInfo(token) {
  try {
    // 1. Get WhatsApp Business Accounts
    const wabaResponse = await fetch(
      `${GRAPH_API_BASE}/me/businesses?fields=id,name,owned_whatsapp_business_accounts&access_token=${token}`
    );
    const wabaData = await wabaResponse.json();

    if (wabaData.error) {
      throw new Error(wabaData.error.message);
    }

    // Find WABA from business
    let wabaId = null;
    let businessName = null;

    for (const business of wabaData.data || []) {
      if (business.owned_whatsapp_business_accounts?.data?.length > 0) {
        wabaId = business.owned_whatsapp_business_accounts.data[0].id;
        businessName = business.name;
        break;
      }
    }

    if (!wabaId) {
      // Try direct WABA access
      const directResponse = await fetch(
        `${GRAPH_API_BASE}/me/whatsapp_business_accounts?access_token=${token}`
      );
      const directData = await directResponse.json();

      if (directData.data?.length > 0) {
        wabaId = directData.data[0].id;
      }
    }

    if (!wabaId) {
      throw new Error('WhatsApp Business Account bulunamadı');
    }

    // 2. Get phone numbers for WABA
    const phoneResponse = await fetch(
      `${GRAPH_API_BASE}/${wabaId}/phone_numbers?access_token=${token}`
    );
    const phoneData = await phoneResponse.json();

    if (phoneData.error) {
      throw new Error(phoneData.error.message);
    }

    if (!phoneData.data?.length) {
      throw new Error('Bu WABA için kayıtlı telefon numarası bulunamadı');
    }

    const phone = phoneData.data[0];

    return {
      success: true,
      data: {
        wabaId,
        businessName,
        phoneNumberId: phone.id,
        displayPhoneNumber: phone.display_phone_number,
        verifiedName: phone.verified_name,
        qualityRating: phone.quality_rating,
        codeVerificationStatus: phone.code_verification_status,
      },
    };
  } catch (error) {
    console.error('Error fetching account info:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Debug token - validate and get info
 */
export async function debugToken(token) {
  try {
    const settings = await getSettings();
    const appId = settings?.appId;
    const appSecret = settings?.appSecret;

    if (!appId || !appSecret) {
      throw new Error('App ID ve App Secret gerekli');
    }

    const response = await fetch(
      `${GRAPH_API_BASE}/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
