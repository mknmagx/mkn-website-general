import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  startAfter,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_CHATGPT_MODEL, DEFAULT_CHATGPT_SETTINGS } from "../openai";
import { ref, deleteObject, getStorage, uploadString, getDownloadURL } from "firebase/storage";

// ChatGPT Collections
const CHATGPT_CHATS_COLLECTION = "chatgptChats";
const CHATGPT_MESSAGES_COLLECTION = "chatgptMessages";

/**
 * Chat CRUD Operations
 */

// Create new chat
export const createChatGPTChat = async (chatData) => {
  try {
    const docRef = await addDoc(collection(db, CHATGPT_CHATS_COLLECTION), {
      title: chatData.title || "Yeni Sohbet",
      userId: chatData.userId,
      model: chatData.model || DEFAULT_CHATGPT_MODEL,
      settings: chatData.settings || DEFAULT_CHATGPT_SETTINGS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      messageCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("ChatGPT Chat oluşturulurken hata:", error);
    throw error;
  }
};

// Get all chats for a user
export const getChatGPTUserChats = async (userId) => {
  try {
    const q = query(
      collection(db, CHATGPT_CHATS_COLLECTION),
      where("userId", "==", userId),
      orderBy("lastMessageAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("ChatGPT Chatler alınırken hata:", error);
    throw error;
  }
};

// Get single chat
export const getChatGPTChat = async (chatId) => {
  try {
    const docRef = doc(db, CHATGPT_CHATS_COLLECTION, chatId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("ChatGPT Chat alınırken hata:", error);
    throw error;
  }
};

// Update chat
export const updateChatGPTChat = async (chatId, chatData) => {
  try {
    const docRef = doc(db, CHATGPT_CHATS_COLLECTION, chatId);
    await updateDoc(docRef, {
      ...chatData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("ChatGPT Chat güncellenirken hata:", error);
    throw error;
  }
};

// Delete chat and all its messages
export const deleteChatGPTChat = async (chatId) => {
  try {
    // First, delete all messages in the chat
    const messagesQuery = query(
      collection(db, CHATGPT_MESSAGES_COLLECTION),
      where("chatId", "==", chatId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const deletePromises = messagesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Delete the chat
    await deleteDoc(doc(db, CHATGPT_CHATS_COLLECTION, chatId));
  } catch (error) {
    console.error("ChatGPT Chat silinirken hata:", error);
    throw error;
  }
};

/**
 * Message CRUD Operations
 */

// Add message to chat
export const addChatGPTMessage = async (messageData) => {
  try {
    const docRef = await addDoc(collection(db, CHATGPT_MESSAGES_COLLECTION), {
      chatId: messageData.chatId,
      role: messageData.role, // "user" or "assistant"
      content: messageData.content,
      imageUrls: messageData.imageUrls || [],
      model: messageData.model,
      usage: messageData.usage || null,
      createdAt: serverTimestamp(),
    });

    // Update chat's lastMessageAt and messageCount
    const chatRef = doc(db, CHATGPT_CHATS_COLLECTION, messageData.chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      const currentCount = chatDoc.data().messageCount || 0;
      await updateDoc(chatRef, {
        lastMessageAt: serverTimestamp(),
        messageCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("ChatGPT Mesaj eklenirken hata:", error);
    throw error;
  }
};

// Get messages for a chat with pagination
export const getChatGPTMessages = async (chatId, limitCount = 50, lastDoc = null) => {
  try {
    let q;
    
    if (lastDoc) {
      q = query(
        collection(db, CHATGPT_MESSAGES_COLLECTION),
        where("chatId", "==", chatId),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, CHATGPT_MESSAGES_COLLECTION),
        where("chatId", "==", chatId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return in chronological order
    return {
      messages: messages.reverse(),
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === limitCount,
    };
  } catch (error) {
    console.error("ChatGPT Mesajlar alınırken hata:", error);
    throw error;
  }
};

// Get all messages for a chat (for API context)
export const getAllChatGPTMessages = async (chatId) => {
  try {
    const q = query(
      collection(db, CHATGPT_MESSAGES_COLLECTION),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("ChatGPT tüm mesajlar alınırken hata:", error);
    throw error;
  }
};

// Update chat title (usually after first message)
export const updateChatGPTTitle = async (chatId, title) => {
  try {
    const chatRef = doc(db, CHATGPT_CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      title: title,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("ChatGPT başlık güncellenirken hata:", error);
    throw error;
  }
};

/**
 * Upload user images to Firebase Storage
 * @param {Array<string>} base64Images - Array of base64 image strings
 * @param {string} chatId - Chat ID for organizing files
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} Array of download URLs
 */
export const uploadChatGPTUserImages = async (base64Images, chatId, userId) => {
  try {
    const storage = getStorage();
    const uploadPromises = base64Images.map(async (base64, index) => {
      const timestamp = Date.now();
      const filename = `chatgpt-uploads/${userId}/${chatId}/${timestamp}_${index}.png`;
      const storageRef = ref(storage, filename);
      
      // Upload base64 string
      await uploadString(storageRef, base64, "data_url");
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("ChatGPT görseller yüklenirken hata:", error);
    throw error;
  }
};
