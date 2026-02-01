/**
 * Instagram DM Conversation Service
 * Konuşma yönetimi (Admin SDK)
 */

import { adminDb } from '../../firebase-admin';
import { COLLECTIONS, CONVERSATION_STATUS } from './schema';

/**
 * Konuşmaları listeler
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Conversations list
 */
export async function getConversations(options = {}) {
  try {
    if (!adminDb) {
      console.warn('Firebase Admin DB not initialized');
      return [];
    }
    
    const {
      status = null,
      limitCount = 50,
      assignedTo = null,
    } = options;

    let query = adminDb.collection(COLLECTIONS.CONVERSATIONS)
      .orderBy('lastMessageAt', 'desc')
      .limit(limitCount);

    const snapshot = await query.get();
    
    let results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Client-side filtreleme
    if (status && status !== 'all') {
      results = results.filter(c => c.status === status);
    }
    
    if (assignedTo) {
      results = results.filter(c => c.assignedTo === assignedTo);
    }
    
    return results;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

/**
 * Tekil konuşmayı getirir
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Conversation
 */
export async function getConversation(conversationId) {
  try {
    if (!adminDb) return null;
    
    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

/**
 * Konuşma oluşturur veya günceller
 * @param {string} conversationId - Conversation ID
 * @param {Object} data - Conversation data (platform, igUserId, igUsername, etc.)
 * @returns {Promise<void>}
 */
export async function upsertConversation(conversationId, data) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // Mevcut konuşmayı güncelle - platform değişmemeli
      const updateData = { ...data, updatedAt: new Date() };
      // Platform sadece ilk oluşturmada set edilmeli, sonra değişmemeli
      if (docSnap.data().platform) {
        delete updateData.platform;
      }
      await docRef.update(updateData);
    } else {
      // Yeni konuşma oluştur
      await docRef.set({
        ...data,
        platform: data.platform || 'instagram', // Varsayılan: instagram
        status: CONVERSATION_STATUS.OPEN,
        unreadCount: 1,
        tags: [],
        assignedTo: null,
        customerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error upserting conversation:', error);
    throw error;
  }
}

/**
 * Konuşmayı okundu olarak işaretler
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<void>}
 */
export async function markAsRead(conversationId) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      unreadCount: 0,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
}

/**
 * Konuşma durumunu günceller
 * @param {string} conversationId - Conversation ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export async function updateStatus(conversationId, status) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    throw error;
  }
}

/**
 * Konuşmaya etiket ekler
 * @param {string} conversationId - Conversation ID
 * @param {string} tag - Tag to add
 * @returns {Promise<void>}
 */
export async function addTag(conversationId, tag) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const conversation = await getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const tags = conversation.tags || [];
    if (!tags.includes(tag)) {
      tags.push(tag);
      const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
      await docRef.update({
        tags,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
}

/**
 * Konuşmadan etiket kaldırır
 * @param {string} conversationId - Conversation ID
 * @param {string} tag - Tag to remove
 * @returns {Promise<void>}
 */
export async function removeTag(conversationId, tag) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const conversation = await getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const tags = (conversation.tags || []).filter((t) => t !== tag);
    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      tags,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error removing tag:', error);
    throw error;
  }
}

/**
 * Konuşmayı birine atar
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID to assign
 * @returns {Promise<void>}
 */
export async function assignTo(conversationId, userId) {
  try {
    if (!adminDb) throw new Error('Firebase Admin DB not initialized');
    
    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      assignedTo: userId,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error assigning conversation:', error);
    throw error;
  }
}

/**
 * Okunmamış konuşma sayısını getirir
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount() {
  try {
    if (!adminDb) return 0;
    
    const snapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS)
      .where('unreadCount', '>', 0)
      .get();
    
    // Client-side status filtresi
    const unreadOpen = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === CONVERSATION_STATUS.OPEN;
    });
    
    return unreadOpen.length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * IG User ID'ye göre konuşma bulur
 * @param {string} igUserId - Instagram User ID
 * @returns {Promise<Object|null>} Conversation
 */
export async function findByIgUserId(igUserId) {
  try {
    if (!adminDb) return null;
    
    const snapshot = await adminDb.collection(COLLECTIONS.CONVERSATIONS)
      .where('igUserId', '==', igUserId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (error) {
    console.error('Error finding conversation by IG user ID:', error);
    throw error;
  }
}
