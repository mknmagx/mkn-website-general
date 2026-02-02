/**
 * WhatsApp Business API - Conversation Service
 * Konuşma yönetimi servisi (Firebase Admin SDK)
 */

import { adminDb } from '../../firebase-admin';
import admin from 'firebase-admin';
import {
  COLLECTIONS,
  CONVERSATION_SCHEMA,
  CONVERSATION_STATUS,
} from './schema';

/**
 * Get all conversations with pagination
 */
export async function getConversations(options = {}) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return { data: [], hasMore: false };
    }

    const {
      status,
      assignedTo,
      tag,
      search,
      pageSize = 50,
      lastDoc,
      sortBy = 'lastMessageAt',
      sortDir = 'desc',
    } = options;

    let conversationsRef = adminDb.collection(COLLECTIONS.CONVERSATIONS);
    let queryRef = conversationsRef.orderBy(sortBy, sortDir);

    // Filters
    if (status && status !== 'all') {
      queryRef = queryRef.where('status', '==', status);
    }

    if (assignedTo) {
      queryRef = queryRef.where('assignedTo', '==', assignedTo);
    }

    if (tag) {
      queryRef = queryRef.where('tags', 'array-contains', tag);
    }

    // Pagination
    if (lastDoc) {
      queryRef = queryRef.startAfter(lastDoc);
    }

    queryRef = queryRef.limit(pageSize + 1);

    const snapshot = await queryRef.get();
    const conversations = [];
    let lastVisible = null;

    snapshot.docs.slice(0, pageSize).forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
      lastVisible = doc;
    });

    // Client-side search filtering
    let filtered = conversations;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = conversations.filter(
        (conv) =>
          conv.profileName?.toLowerCase().includes(searchLower) ||
          conv.waId?.includes(search) ||
          conv.displayPhoneNumber?.includes(search)
      );
    }

    return {
      data: filtered,
      hasMore: snapshot.docs.length > pageSize,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

/**
 * Get single conversation by ID
 */
export async function getConversation(conversationId) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

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
 * Find conversation by WhatsApp ID (wa_id)
 */
export async function findByWaId(waId) {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return null;
    }

    const snapshot = await adminDb
      .collection(COLLECTIONS.CONVERSATIONS)
      .where('waId', '==', waId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error finding conversation by waId:', error);
    throw error;
  }
}

/**
 * Create or update conversation
 */
export async function upsertConversation(waId, data) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const existing = await findByWaId(waId);

    if (existing) {
      // Update existing
      const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(existing.id);
      await docRef.update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { id: existing.id, ...existing, ...data };
    }

    // Create new
    const newConv = {
      ...CONVERSATION_SCHEMA,
      ...data,
      waId,
      status: CONVERSATION_STATUS.ACTIVE,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(COLLECTIONS.CONVERSATIONS).add(newConv);
    return { id: docRef.id, ...newConv };
  } catch (error) {
    console.error('Error upserting conversation:', error);
    throw error;
  }
}

/**
 * Update conversation status
 */
export async function updateStatus(conversationId, status) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const validStatuses = Object.values(CONVERSATION_STATUS);
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating conversation status:', error);
    throw error;
  }
}

/**
 * Mark conversation as read
 */
export async function markAsRead(conversationId) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      unreadCount: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
}

/**
 * Update last message info
 */
export async function updateLastMessage(conversationId, message) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    
    const updateData = {
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessagePreview: message.text || `[${message.type}]`,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Increment unread count for incoming messages
    if (message.direction === 'inbound') {
      updateData.unreadCount = admin.firestore.FieldValue.increment(1);
    }

    await docRef.update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating last message:', error);
    throw error;
  }
}

/**
 * Update service window (24-hour messaging window)
 */
export async function updateServiceWindow(conversationId) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    
    // Service window expires 24 hours after last customer message
    const windowExpiry = new Date();
    windowExpiry.setHours(windowExpiry.getHours() + 24);

    await docRef.update({
      serviceWindowExpiry: admin.firestore.Timestamp.fromDate(windowExpiry),
      isWithinWindow: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating service window:', error);
    throw error;
  }
}

/**
 * Assign conversation to user
 */
export async function assignConversation(conversationId, userId, userName = null) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      assignedTo: userId,
      assignedToName: userName,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error assigning conversation:', error);
    throw error;
  }
}

/**
 * Add tag to conversation
 */
export async function addTag(conversationId, tag) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      tags: admin.firestore.FieldValue.arrayUnion(tag),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
}

/**
 * Remove tag from conversation
 */
export async function removeTag(conversationId, tag) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      tags: admin.firestore.FieldValue.arrayRemove(tag),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing tag:', error);
    throw error;
  }
}

/**
 * Archive conversation
 */
export async function archiveConversation(conversationId) {
  return updateStatus(conversationId, CONVERSATION_STATUS.ARCHIVED);
}

/**
 * Close conversation
 */
export async function closeConversation(conversationId) {
  return updateStatus(conversationId, CONVERSATION_STATUS.CLOSED);
}

/**
 * Reopen conversation
 */
export async function reopenConversation(conversationId) {
  return updateStatus(conversationId, CONVERSATION_STATUS.ACTIVE);
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    // Delete all messages in conversation
    const messagesSnapshot = await adminDb
      .collection(COLLECTIONS.MESSAGES)
      .where('conversationId', '==', conversationId)
      .get();

    const batch = adminDb.batch();
    messagesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete conversation
    const convRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    batch.delete(convRef);

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Get unread count across all conversations
 */
export async function getTotalUnreadCount() {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return 0;
    }

    const snapshot = await adminDb
      .collection(COLLECTIONS.CONVERSATIONS)
      .where('unreadCount', '>', 0)
      .get();

    let total = 0;
    snapshot.docs.forEach((doc) => {
      total += doc.data().unreadCount || 0;
    });

    return total;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Get conversation statistics
 */
export async function getConversationStats() {
  try {
    if (!adminDb) {
      console.error('Firebase Admin DB not initialized');
      return { active: 0, closed: 0, pending: 0, archived: 0 };
    }

    const [activeSnap, closedSnap, pendingSnap, archivedSnap] = await Promise.all([
      adminDb.collection(COLLECTIONS.CONVERSATIONS).where('status', '==', CONVERSATION_STATUS.ACTIVE).get(),
      adminDb.collection(COLLECTIONS.CONVERSATIONS).where('status', '==', CONVERSATION_STATUS.CLOSED).get(),
      adminDb.collection(COLLECTIONS.CONVERSATIONS).where('status', '==', CONVERSATION_STATUS.PENDING).get(),
      adminDb.collection(COLLECTIONS.CONVERSATIONS).where('status', '==', CONVERSATION_STATUS.ARCHIVED).get(),
    ]);

    return {
      active: activeSnap.size,
      closed: closedSnap.size,
      pending: pendingSnap.size,
      archived: archivedSnap.size,
    };
  } catch (error) {
    console.error('Error getting conversation stats:', error);
    return { active: 0, closed: 0, pending: 0, archived: 0 };
  }
}

/**
 * Update customer info in conversation
 */
export async function updateCustomerInfo(conversationId, customerInfo) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin DB not initialized');
    }

    const docRef = adminDb.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    await docRef.update({
      ...customerInfo,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating customer info:', error);
    throw error;
  }
}
