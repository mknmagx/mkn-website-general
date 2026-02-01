/**
 * Instagram DM Quick Replies Service
 * Hazır yanıt şablonları yönetimi (Admin SDK)
 */

import { adminDb } from '../../firebase-admin';
import admin from 'firebase-admin';
import { COLLECTIONS, QUICK_REPLY_CATEGORIES } from './schema';

/**
 * Tüm hazır yanıtları listeler
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Quick replies list
 */
export async function getQuickReplies(options = {}) {
  try {
    if (!adminDb) return [];
    
    const { category = null } = options;

    let query = adminDb.collection(COLLECTIONS.QUICK_REPLIES)
      .orderBy('usageCount', 'desc');

    const snapshot = await query.get();
    
    let results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Client-side category filter
    if (category && category !== 'all') {
      results = results.filter(r => r.category === category);
    }

    return results;
  } catch (error) {
    console.error('Error getting quick replies:', error);
    return [];
  }
}

/**
 * Tekil hazır yanıtı getirir
 * @param {string} quickReplyId - Quick reply ID
 * @returns {Promise<Object|null>} Quick reply
 */
export async function getQuickReply(quickReplyId) {
  try {
    if (!adminDb) return null;
    
    const docRef = adminDb.collection(COLLECTIONS.QUICK_REPLIES).doc(quickReplyId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  } catch (error) {
    console.error('Error getting quick reply:', error);
    throw error;
  }
}

/**
 * Hazır yanıt oluşturur
 * @param {Object} data - Quick reply data
 * @returns {Promise<string>} Created quick reply ID
 */
export async function createQuickReply(data) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const docRef = await adminDb.collection(COLLECTIONS.QUICK_REPLIES).add({
      title: data.title,
      content: data.content,
      shortcut: data.shortcut || null,
      category: data.category || QUICK_REPLY_CATEGORIES.OTHER,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating quick reply:', error);
    throw error;
  }
}

/**
 * Hazır yanıtı günceller
 * @param {string} quickReplyId - Quick reply ID
 * @param {Object} data - Update data
 * @returns {Promise<void>}
 */
export async function updateQuickReply(quickReplyId, data) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const docRef = adminDb.collection(COLLECTIONS.QUICK_REPLIES).doc(quickReplyId);
    await docRef.update({
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating quick reply:', error);
    throw error;
  }
}

/**
 * Hazır yanıtı siler
 * @param {string} quickReplyId - Quick reply ID
 * @returns {Promise<void>}
 */
export async function deleteQuickReply(quickReplyId) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const docRef = adminDb.collection(COLLECTIONS.QUICK_REPLIES).doc(quickReplyId);
    await docRef.delete();
  } catch (error) {
    console.error('Error deleting quick reply:', error);
    throw error;
  }
}

/**
 * Hazır yanıt kullanım sayısını artırır
 * @param {string} quickReplyId - Quick reply ID
 * @returns {Promise<void>}
 */
export async function incrementUsageCount(quickReplyId) {
  try {
    if (!adminDb) return;
    
    const docRef = adminDb.collection(COLLECTIONS.QUICK_REPLIES).doc(quickReplyId);
    await docRef.update({
      usageCount: admin.firestore.FieldValue.increment(1),
    });
  } catch (error) {
    console.error('Error incrementing usage count:', error);
    // Hata durumunda devam et, kritik değil
  }
}

/**
 * Shortcut ile hazır yanıt arar
 * @param {string} shortcut - Shortcut string
 * @returns {Promise<Object|null>} Quick reply
 */
export async function findByShortcut(shortcut) {
  try {
    if (!adminDb) return null;
    
    const snapshot = await adminDb.collection(COLLECTIONS.QUICK_REPLIES)
      .where('shortcut', '==', shortcut)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (error) {
    console.error('Error finding quick reply by shortcut:', error);
    throw error;
  }
}

/**
 * Varsayılan hazır yanıtları seed eder
 * @returns {Promise<void>}
 */
export async function seedDefaultQuickReplies() {
  try {
    const existingReplies = await getQuickReplies();
    
    if (existingReplies.length > 0) {
      console.log('Quick replies already exist, skipping seed');
      return;
    }

    const defaults = [
      {
        title: 'Hoş Geldiniz',
        content: 'Merhaba! MKN Group\'a hoş geldiniz. Size nasıl yardımcı olabiliriz?',
        shortcut: '/hosgeldin',
        category: QUICK_REPLY_CATEGORIES.GREETING,
      },
      {
        title: 'Fiyat Bilgisi',
        content: 'Fiyat bilgisi için lütfen ürün detaylarını (boyut, adet, malzeme) paylaşır mısınız? En kısa sürede size özel teklif hazırlayalım.',
        shortcut: '/fiyat',
        category: QUICK_REPLY_CATEGORIES.PRICING,
      },
      {
        title: 'Katalog',
        content: 'Ürün kataloğumuzu incelemek için web sitemizi ziyaret edebilirsiniz: www.mkngroup.com.tr\n\nDilediğiniz kategoride detaylı bilgi almak isterseniz yardımcı olalım.',
        shortcut: '/katalog',
        category: QUICK_REPLY_CATEGORIES.PRODUCT,
      },
      {
        title: 'Teşekkürler',
        content: 'İlginiz için teşekkür ederiz! Başka bir sorunuz olursa her zaman yazabilirsiniz. İyi günler dileriz 🙏',
        shortcut: '/tesekkur',
        category: QUICK_REPLY_CATEGORIES.CLOSING,
      },
      {
        title: 'Çalışma Saatleri',
        content: 'Çalışma saatlerimiz:\n📅 Pazartesi - Cuma: 09:00 - 18:00\n📅 Cumartesi: 09:00 - 14:00\n📅 Pazar: Kapalı\n\nMesaj bırakabilirsiniz, en kısa sürede dönüş yapacağız.',
        shortcut: '/saat',
        category: QUICK_REPLY_CATEGORIES.SUPPORT,
      },
    ];

    for (const reply of defaults) {
      await createQuickReply(reply);
    }

    console.log('Default quick replies seeded successfully');
  } catch (error) {
    console.error('Error seeding default quick replies:', error);
    throw error;
  }
}
