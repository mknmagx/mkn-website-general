/**
 * Email Thread Tracking Service
 * E-posta thread'lerini takip eder ve yanıtları otomatik olarak iletişim geçmişine ekler
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getEmailsByConversationId, getNewInboxEmails } from "./graph-service";

const THREAD_COLLECTION = "email_threads";

/**
 * Yeni email thread kaydı oluşturur
 * Gönderilen her e-postada çağrılır
 */
export async function createEmailThread(data) {
  try {
    const docRef = await addDoc(collection(db, THREAD_COLLECTION), {
      // Outlook/Graph bilgileri
      conversationId: data.conversationId,
      messageId: data.messageId,
      internetMessageId: data.internetMessageId || null,
      
      // İlişkiler (CRM)
      requestId: data.requestId || null,
      companyId: data.companyId || null,
      communicationId: data.communicationId || null,
      
      // E-posta bilgileri
      subject: data.subject || "",
      toEmail: data.toEmail || "",
      fromEmail: data.fromEmail || "info@mkngroup.com.tr",
      
      // Takip durumu
      isActive: true,
      lastCheckedAt: serverTimestamp(),
      lastReplyAt: null,
      replyCount: 0,
      
      // Meta
      createdAt: serverTimestamp(),
      createdBy: data.createdBy || null,
      createdByName: data.createdByName || "Sistem",
    });

    return {
      success: true,
      id: docRef.id,
      message: "Thread takibi başlatıldı",
    };
  } catch (error) {
    console.error("Error creating email thread:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Aktif thread'leri getirir
 */
export async function getActiveThreads() {
  try {
    const q = query(
      collection(db, THREAD_COLLECTION),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting active threads:", error);
    return [];
  }
}

/**
 * Request ID'ye göre thread'leri getirir
 */
export async function getThreadsByRequestId(requestId) {
  try {
    const q = query(
      collection(db, THREAD_COLLECTION),
      where("requestId", "==", requestId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting threads by request:", error);
    return [];
  }
}

/**
 * ConversationId'ye göre thread kaydını getirir
 */
export async function getThreadByConversationId(conversationId) {
  try {
    const q = query(
      collection(db, THREAD_COLLECTION),
      where("conversationId", "==", conversationId)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error getting thread by conversationId:", error);
    return null;
  }
}

/**
 * Thread bilgilerini günceller
 */
export async function updateThread(threadId, data) {
  try {
    const docRef = doc(db, THREAD_COLLECTION, threadId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating thread:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Thread'deki tüm e-postaları Outlook'tan çeker
 */
export async function fetchThreadEmails(conversationId) {
  try {
    const emails = await getEmailsByConversationId(conversationId);
    return {
      success: true,
      emails,
      count: emails.length,
    };
  } catch (error) {
    console.error("Error fetching thread emails:", error);
    return { success: false, error: error.message, emails: [] };
  }
}

/**
 * Tek bir thread için yeni yanıt kontrolü yapar
 * @returns {Object} - Yeni yanıtlar varsa döner
 */
export async function checkThreadForReplies(thread) {
  try {
    const emails = await getEmailsByConversationId(thread.conversationId);
    
    // İlk e-posta dışındaki tüm yanıtlar
    // Bizim gönderdiğimiz mesajı (messageId) filtrele
    const replies = emails.filter(email => 
      email.id !== thread.messageId &&
      email.from?.emailAddress?.address?.toLowerCase() !== "info@mkngroup.com.tr"
    );

    // Yeni yanıtları belirle (daha önce işlenmemiş olanlar)
    const lastChecked = thread.lastCheckedAt?.toDate?.() || new Date(0);
    const newReplies = replies.filter(reply => {
      const receivedDate = new Date(reply.receivedDateTime);
      return receivedDate > lastChecked;
    });

    return {
      success: true,
      hasNewReplies: newReplies.length > 0,
      newReplies,
      totalReplies: replies.length,
    };
  } catch (error) {
    console.error("Error checking thread for replies:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Tüm aktif thread'leri kontrol eder ve yeni yanıtları döner
 * Polling endpoint'i tarafından kullanılır
 */
export async function checkAllThreadsForReplies() {
  try {
    const threads = await getActiveThreads();
    const results = [];

    for (const thread of threads) {
      const check = await checkThreadForReplies(thread);
      
      if (check.success && check.hasNewReplies) {
        results.push({
          thread,
          newReplies: check.newReplies,
        });

        // Thread'i güncelle
        await updateThread(thread.id, {
          lastCheckedAt: serverTimestamp(),
          replyCount: check.totalReplies,
          lastReplyAt: Timestamp.fromDate(
            new Date(check.newReplies[0].receivedDateTime)
          ),
        });
      } else {
        // Sadece lastCheckedAt güncelle
        await updateThread(thread.id, {
          lastCheckedAt: serverTimestamp(),
        });
      }
    }

    return {
      success: true,
      checkedCount: threads.length,
      threadsWithReplies: results.length,
      results,
    };
  } catch (error) {
    console.error("Error checking all threads:", error);
    return { success: false, error: error.message };
  }
}

/**
 * E-posta yanıtını communication kaydına dönüştürür
 */
export function emailToCommmunicationData(email, thread) {
  return {
    requestId: thread.requestId,
    companyId: thread.companyId,
    type: "email_incoming",
    subject: email.subject || "",
    content: email.body?.content || email.bodyPreview || "",
    summary: email.bodyPreview || "",
    from: email.from?.emailAddress?.address || "",
    to: email.toRecipients?.map(r => r.emailAddress?.address).join(", ") || "",
    status: "received",
    outlookMessageId: email.id,
    outlookConversationId: email.conversationId,
    parentCommunicationId: thread.communicationId,
    communicationDate: Timestamp.fromDate(new Date(email.receivedDateTime)),
    isAutoImported: true,
    importedFromThread: thread.id,
  };
}
