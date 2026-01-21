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
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_CHAT_MODEL, DEFAULT_CHAT_SETTINGS } from "../gemini";
import { ref, deleteObject, getStorage } from "firebase/storage";

// Gemini Collections
const GEMINI_CHATS_COLLECTION = "geminiChats";
const GEMINI_MESSAGES_COLLECTION = "geminiMessages";
const GEMINI_FILES_COLLECTION = "geminiFiles";

/**
 * Chat CRUD Operations
 */

// Create new chat
export const createChat = async (chatData) => {
  try {
    const docRef = await addDoc(collection(db, GEMINI_CHATS_COLLECTION), {
      title: chatData.title || "Yeni Sohbet",
      userId: chatData.userId,
      model: chatData.model || DEFAULT_CHAT_MODEL,
      settings: chatData.settings || DEFAULT_CHAT_SETTINGS,
      type: chatData.type || "chat", // "chat" or "contentVisualize"
      contentId: chatData.contentId || null,
      contentTitle: chatData.contentTitle || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      messageCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Chat oluşturulurken hata:", error);
    throw error;
  }
};

// Get all chats for a user
export const getUserChats = async (userId) => {
  try {
    const q = query(
      collection(db, GEMINI_CHATS_COLLECTION),
      where("userId", "==", userId),
      orderBy("lastMessageAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Chatler alınırken hata:", error);
    throw error;
  }
};

// Get single chat
export const getChat = async (chatId) => {
  try {
    const docRef = doc(db, GEMINI_CHATS_COLLECTION, chatId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Chat alınırken hata:", error);
    throw error;
  }
};

// Update chat
export const updateChat = async (chatId, chatData) => {
  try {
    const docRef = doc(db, GEMINI_CHATS_COLLECTION, chatId);
    await updateDoc(docRef, {
      ...chatData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Chat güncellenirken hata:", error);
    throw error;
  }
};

// Delete chat and all its messages (including images from storage)
export const deleteChat = async (chatId) => {
  try {
    console.log(`🗑️ Deleting chat ${chatId} and all associated data...`);
    
    // Get all messages in the chat
    const messagesQuery = query(
      collection(db, GEMINI_MESSAGES_COLLECTION),
      where("chatId", "==", chatId)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    
    // Extract all image URLs from messages
    const imageUrls = [];
    messagesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.imageUrls && Array.isArray(data.imageUrls)) {
        imageUrls.push(...data.imageUrls);
      }
    });
    
    console.log(`📸 Found ${imageUrls.length} image(s) to delete from storage`);
    
    // Delete images from Firebase Storage
    if (imageUrls.length > 0) {
      const storage = getStorage();
      const deleteImagePromises = imageUrls.map(async (imageUrl) => {
        try {
          // Extract storage path from URL
          // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
          const urlMatch = imageUrl.match(/\/o\/(.+?)\?/);
          if (urlMatch && urlMatch[1]) {
            const storagePath = decodeURIComponent(urlMatch[1]);
            const imageRef = ref(storage, storagePath);
            await deleteObject(imageRef);
            console.log(`✅ Deleted image: ${storagePath}`);
          }
        } catch (error) {
          // Log but don't throw - continue deleting other images
          console.warn(`⚠️ Failed to delete image ${imageUrl}:`, error.message);
        }
      });
      await Promise.all(deleteImagePromises);
    }
    
    // Delete all message documents from Firestore
    const deleteMessagePromises = messagesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deleteMessagePromises);
    console.log(`✅ Deleted ${messagesSnapshot.docs.length} message(s) from Firestore`);

    // Delete the chat document
    await deleteDoc(doc(db, GEMINI_CHATS_COLLECTION, chatId));
    console.log(`✅ Chat ${chatId} deleted successfully`);
  } catch (error) {
    console.error("❌ Chat silinirken hata:", error);
    throw error;
  }
};

/**
 * Message CRUD Operations
 */

/**
 * Upload user images to Firebase Storage
 * @param {Array<string>} base64Images - Array of base64 encoded images (data:image/...;base64,...)
 * @param {string} chatId - Chat ID for organizing files
 * @returns {Promise<Array<string>>} - Array of public download URLs
 */
export const uploadUserImagesToStorage = async (base64Images, chatId) => {
  if (!base64Images || base64Images.length === 0) {
    return [];
  }

  console.log(`📤 Uploading ${base64Images.length} user image(s) to storage...`);

  try {
    const uploadPromises = base64Images.map(async (base64Data, index) => {
      // Extract mime type and data from base64 string
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.error(`❌ Invalid base64 format at index ${index}`);
        throw new Error(`Invalid base64 image format at index ${index}`);
      }

      const mimeType = matches[1]; // e.g., 'image/jpeg'
      const base64Content = matches[2];
      
      // Determine file extension
      const extension = mimeType.split('/')[1] || 'png';
      
      // Create unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const filename = `gemini-chat-uploads/${chatId}/${timestamp}-${randomId}.${extension}`;

      // Call upload API endpoint
      const response = await fetch('/api/upload-user-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: base64Content,
          mimeType: mimeType,
          filename: filename,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      console.log(`✅ Image ${index + 1}/${base64Images.length} uploaded: ${data.url}`);
      
      return data.url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    console.log(`🎉 All ${uploadedUrls.length} user images uploaded successfully`);
    
    return uploadedUrls;
  } catch (error) {
    console.error("❌ Error uploading user images:", error);
    throw error;
  }
};

// Add message to chat
export const addMessage = async (messageData) => {
  try {
    // 🛡️ STRICT VALIDATION - Firebase doesn't allow undefined values
    console.log(`💾 addMessage called with:`, {
      chatId: messageData.chatId,
      role: messageData.role,
      contentType: typeof messageData.content,
      contentLength: messageData.content?.length || 0,
      contentPreview: messageData.content?.substring(0, 50) || "[EMPTY]",
      hasImageUrls: !!(messageData.imageUrls?.length),
      model: messageData.model,
    });

    // Validate required fields
    if (!messageData.chatId) {
      throw new Error("chatId is required");
    }
    if (!messageData.role) {
      throw new Error("role is required");
    }
    if (!messageData.content || messageData.content.trim() === "") {
      console.error(`❌ VALIDATION FAILED: content is empty or undefined!`);
      console.error(`Full messageData:`, JSON.stringify(messageData, null, 2));
      throw new Error("content cannot be empty or undefined");
    }

    // Prepare document data - ensure no undefined values
    const docData = {
      chatId: messageData.chatId,
      role: messageData.role, // 'user' or 'assistant'
      content: messageData.content.trim(), // Trim whitespace
      imageUrls: messageData.imageUrls || [],
      fileIds: messageData.fileIds || [],
      model: messageData.model || "unknown",
      tokens: messageData.tokens || null,
      createdAt: serverTimestamp(),
    };

    console.log(`✅ Validation passed, adding to Firestore...`);
    const docRef = await addDoc(collection(db, GEMINI_MESSAGES_COLLECTION), docData);

    // Update chat's lastMessageAt and messageCount
    const chatRef = doc(db, GEMINI_CHATS_COLLECTION, messageData.chatId);
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      await updateDoc(chatRef, {
        lastMessageAt: serverTimestamp(),
        messageCount: (chatSnap.data().messageCount || 0) + 1,
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Mesaj eklenirken hata:", error);
    throw error;
  }
};

// Get messages for a chat
export const getChatMessages = async (chatId, limitCount = 50, beforeTimestamp = null) => {
  try {
    let q;
    
    if (beforeTimestamp) {
      // Load older messages (for pagination)
      q = query(
        collection(db, GEMINI_MESSAGES_COLLECTION),
        where("chatId", "==", chatId),
        where("createdAt", "<", beforeTimestamp),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    } else {
      // Load latest messages
      q = query(
        collection(db, GEMINI_MESSAGES_COLLECTION),
        where("chatId", "==", chatId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const messages = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });
    
    // Reverse to get chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error("❌ Mesajlar alınırken hata:", error);
    console.error("Error details:", error.message);
    throw error;
  }
};

// Delete message
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, GEMINI_MESSAGES_COLLECTION, messageId));
  } catch (error) {
    console.error("Mesaj silinirken hata:", error);
    throw error;
  }
};

/**
 * File Operations
 */

// Add file reference
export const addFile = async (fileData) => {
  try {
    const docRef = await addDoc(collection(db, GEMINI_FILES_COLLECTION), {
      chatId: fileData.chatId,
      messageId: fileData.messageId,
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
      uploadedBy: fileData.uploadedBy,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Dosya eklenirken hata:", error);
    throw error;
  }
};

// Get files for a chat
export const getChatFiles = async (chatId) => {
  try {
    const q = query(
      collection(db, GEMINI_FILES_COLLECTION),
      where("chatId", "==", chatId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Dosyalar alınırken hata:", error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (fileId) => {
  try {
    await deleteDoc(doc(db, GEMINI_FILES_COLLECTION, fileId));
  } catch (error) {
    console.error("Dosya silinirken hata:", error);
    throw error;
  }
};

/**
 * Chat Statistics
 */
export const getChatStats = async (userId) => {
  try {
    const chatsQuery = query(
      collection(db, GEMINI_CHATS_COLLECTION),
      where("userId", "==", userId)
    );
    const chatsSnapshot = await getDocs(chatsQuery);
    
    let totalMessages = 0;
    chatsSnapshot.docs.forEach((doc) => {
      totalMessages += doc.data().messageCount || 0;
    });

    return {
      totalChats: chatsSnapshot.size,
      totalMessages,
    };
  } catch (error) {
    console.error("Chat istatistikleri alınırken hata:", error);
    throw error;
  }
};
