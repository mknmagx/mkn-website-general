/**
 * Instagram DM Settings Service
 * API ayarları yönetimi
 */

import { adminDb } from '../../firebase-admin';
import { COLLECTIONS, CONNECTION_STATUS } from './schema';

const SETTINGS_DOC_ID = 'main';

/**
 * Ayarları getirir
 * @returns {Promise<Object|null>} Settings object
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
    console.error('Error getting Instagram DM settings:', error);
    throw error;
  }
}

/**
 * Ayarları kaydeder/günceller
 * @param {Object} settings - Settings object
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }
    
    const docRef = adminDb.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID);
    const docSnap = await docRef.get();
    
    const data = {
      ...settings,
      updatedAt: new Date(),
    };
    
    if (docSnap.exists) {
      await docRef.update(data);
    } else {
      await docRef.set({
        ...data,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error saving Instagram DM settings:', error);
    throw error;
  }
}

/**
 * Bağlantı durumunu kontrol eder
 * @returns {Promise<Object>} Connection status
 */
export async function checkConnectionStatus() {
  try {
    const settings = await getSettings();
    
    // En az bir token olmalı
    if (!settings || (!settings.pageAccessToken && !settings.systemUserToken)) {
      return {
        status: CONNECTION_STATUS.DISCONNECTED,
        message: 'Instagram hesabı bağlı değil - Token gerekli',
      };
    }
    
    // Token süresini kontrol et
    if (settings.tokenExpiresAt) {
      const expiresAt = settings.tokenExpiresAt.toDate 
        ? settings.tokenExpiresAt.toDate() 
        : new Date(settings.tokenExpiresAt);
      
      if (expiresAt < new Date()) {
        return {
          status: CONNECTION_STATUS.EXPIRED,
          message: 'Access token süresi dolmuş',
          expiresAt,
        };
      }
      
      // 7 gün içinde expire olacaksa uyar
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      if (expiresAt < sevenDaysFromNow) {
        return {
          status: CONNECTION_STATUS.CONNECTED,
          message: 'Token yakında expire olacak',
          expiresAt,
          warning: true,
          instagramAccountId: settings.instagramAccountId,
          instagramUsername: settings.instagramUsername,
          pageId: settings.pageId,
          pageName: settings.pageName,
        };
      }
    }
    
    return {
      status: CONNECTION_STATUS.CONNECTED,
      message: 'Bağlantı aktif',
      instagramAccountId: settings.instagramAccountId,
      instagramUsername: settings.instagramUsername,
      pageId: settings.pageId,
      pageName: settings.pageName,
    };
  } catch (error) {
    console.error('Error checking connection status:', error);
    return {
      status: CONNECTION_STATUS.ERROR,
      message: error.message || 'Bağlantı kontrol edilemedi',
    };
  }
}

/**
 * Bağlantıyı keser
 * @returns {Promise<void>}
 */
export async function disconnect() {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }
    
    const docRef = adminDb.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID);
    await docRef.update({
      systemUserToken: null,
      pageAccessToken: null,
      pageId: null,
      pageName: null,
      instagramAccountId: null,
      instagramUsername: null,
      connectedAt: null,
      tokenExpiresAt: null,
      disconnectedAt: new Date(),
    });
  } catch (error) {
    console.error('Error disconnecting Instagram:', error);
    throw error;
  }
}

/**
 * Webhook verify token'ı oluşturur/getirir
 * @returns {Promise<string>} Verify token
 */
export async function getOrCreateWebhookVerifyToken() {
  try {
    const settings = await getSettings();
    
    if (settings?.webhookVerifyToken) {
      return settings.webhookVerifyToken;
    }
    
    // Yeni token oluştur
    const verifyToken = `mkn_ig_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    await saveSettings({
      webhookVerifyToken: verifyToken,
    });
    
    return verifyToken;
  } catch (error) {
    console.error('Error getting/creating webhook verify token:', error);
    throw error;
  }
}

/**
 * Aktif access token'ı döndürür
 * Öncelik: System User Token > Page Access Token
 * @returns {Promise<string|null>} Access token
 */
export async function getActiveAccessToken() {
  const settings = await getSettings();
  
  if (!settings) return null;
  
  // System User Token varsa onu kullan (süresiz, daha güvenli)
  if (settings.systemUserToken) {
    return settings.systemUserToken;
  }
  
  // Yoksa Page Access Token kullan
  return settings.pageAccessToken || null;
}

/**
 * Token tipini belirler
 * @param {string} token - Access token
 * @returns {string} Token tipi
 */
export function getTokenType(token) {
  if (!token) return 'none';
  
  // Tüm Facebook/Meta tokenlar EAA ile başlar
  if (token.startsWith('EAA')) {
    // Token'ın uzunluğu ve formatına göre tip belirlenemez
    // Sadece prefix'e bakabiliriz
    return 'facebook_token'; // Page veya System User olabilir
  }
  
  if (token.startsWith('IGAAW') || token.startsWith('IGA')) {
    return 'instagram_user_token'; // DM için çalışmaz!
  }
  
  return 'unknown';
}
