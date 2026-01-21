/**
 * Gemini Chat Service - Server-side (Firebase Admin SDK)
 * Bu servis sadece API route'larda kullanılır ve Firestore security rules'u bypass eder
 */

import { adminFirestore } from "../firebase-admin";
import { DEFAULT_CHAT_MODEL, DEFAULT_CHAT_SETTINGS } from "../gemini";

// Gemini Collections
const GEMINI_CHATS_COLLECTION = "geminiChats";
const GEMINI_MESSAGES_COLLECTION = "geminiMessages";
const GEMINI_FILES_COLLECTION = "geminiFiles";

/**
 * Message Operations - Server-side
 */

// Get messages for a chat (Server-side with Admin SDK)
export const getChatMessagesAdmin = async (chatId, limitCount = 100) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    const messagesRef = adminFirestore
      .collection(GEMINI_MESSAGES_COLLECTION)
      .where("chatId", "==", chatId)
      .orderBy("createdAt", "asc")
      .limit(limitCount);
    
    const snapshot = await messagesRef.get();
    
    const messages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        // Timestamp'leri Date'e çevir
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      });
    });
    return messages;
  } catch (error) {
    console.error("❌ [ADMIN] Mesajlar alınırken hata:", error);
    console.error("Error details:", error.message);
    throw error;
  }
};

// Add message to chat (Server-side with Admin SDK)
export const addMessageAdmin = async (messageData) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    const docRef = await adminFirestore.collection(GEMINI_MESSAGES_COLLECTION).add({
      chatId: messageData.chatId,
      role: messageData.role, // 'user' or 'assistant'
      content: messageData.content,
      imageUrls: messageData.imageUrls || [],
      fileIds: messageData.fileIds || [],
      model: messageData.model,
      tokens: messageData.tokens || null,
      createdAt: adminFirestore.FieldValue.serverTimestamp(),
    });

    // Update chat's lastMessageAt and messageCount
    const chatRef = adminFirestore.collection(GEMINI_CHATS_COLLECTION).doc(messageData.chatId);
    const chatDoc = await chatRef.get();
    
    if (chatDoc.exists) {
      await chatRef.update({
        lastMessageAt: adminFirestore.FieldValue.serverTimestamp(),
        messageCount: adminFirestore.FieldValue.increment(1),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("❌ [ADMIN] Mesaj eklenirken hata:", error);
    throw error;
  }
};

// Get user chats (Server-side)
export const getUserChatsAdmin = async (userId) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    const chatsRef = adminFirestore
      .collection(GEMINI_CHATS_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("lastMessageAt", "desc");
    
    const snapshot = await chatsRef.get();
    
    const chats = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        lastMessageAt: data.lastMessageAt?.toDate ? data.lastMessageAt.toDate() : data.lastMessageAt,
      });
    });
    
    return chats;
  } catch (error) {
    console.error("❌ [ADMIN] Chatler alınırken hata:", error);
    throw error;
  }
};

// Create new chat (Server-side)
export const createChatAdmin = async (chatData) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    const docRef = await adminFirestore.collection(GEMINI_CHATS_COLLECTION).add({
      title: chatData.title || "Yeni Sohbet",
      userId: chatData.userId,
      model: chatData.model || DEFAULT_CHAT_MODEL,
      settings: chatData.settings || DEFAULT_CHAT_SETTINGS,
      createdAt: adminFirestore.FieldValue.serverTimestamp(),
      updatedAt: adminFirestore.FieldValue.serverTimestamp(),
      lastMessageAt: adminFirestore.FieldValue.serverTimestamp(),
      messageCount: 0,
    });
    
    return docRef.id;
  } catch (error) {
    console.error("❌ [ADMIN] Chat oluşturulurken hata:", error);
    throw error;
  }
};

// Delete chat and messages (Server-side)
export const deleteChatAdmin = async (chatId) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    // Delete all messages in the chat
    const messagesRef = adminFirestore
      .collection(GEMINI_MESSAGES_COLLECTION)
      .where("chatId", "==", chatId);
    
    const snapshot = await messagesRef.get();
    const batch = adminFirestore.batch();
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete the chat
    batch.delete(adminFirestore.collection(GEMINI_CHATS_COLLECTION).doc(chatId));
    
    await batch.commit();
  } catch (error) {
    console.error("❌ [ADMIN] Chat silinirken hata:", error);
    throw error;
  }
};

// Update chat (Server-side)
export const updateChatAdmin = async (chatId, chatData) => {
  try {
    if (!adminFirestore) {
      throw new Error("Firebase Admin SDK is not initialized");
    }

    const chatRef = adminFirestore.collection(GEMINI_CHATS_COLLECTION).doc(chatId);
    await chatRef.update({
      ...chatData,
      updatedAt: adminFirestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("❌ [ADMIN] Chat güncellenirken hata:", error);
    throw error;
  }
};
