/**
 * Communication Service
 * CRM İletişim Geçmişi Yönetimi
 * Müşteri ile tüm iletişimlerin kaydı ve takibi
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "communications";

// İletişim Türleri
export const COMMUNICATION_TYPE = {
  EMAIL_INCOMING: "email_incoming",      // Gelen e-posta
  EMAIL_OUTGOING: "email_outgoing",      // Giden e-posta
  PHONE_INCOMING: "phone_incoming",      // Gelen arama
  PHONE_OUTGOING: "phone_outgoing",      // Giden arama
  WHATSAPP_INCOMING: "whatsapp_incoming", // Gelen WhatsApp
  WHATSAPP_OUTGOING: "whatsapp_outgoing", // Giden WhatsApp
  MEETING: "meeting",                     // Toplantı
  NOTE: "note",                           // Dahili not
  SYSTEM: "system",                       // Sistem mesajı
};

// İletişim Durumları
export const COMMUNICATION_STATUS = {
  SENT: "sent",           // Gönderildi
  DELIVERED: "delivered", // Teslim edildi
  READ: "read",           // Okundu
  REPLIED: "replied",     // Yanıtlandı
  PENDING: "pending",     // Beklemede
  FAILED: "failed",       // Başarısız
};

// Türkçe Etiketler
export const getCommunicationTypeLabel = (type) => {
  const labels = {
    [COMMUNICATION_TYPE.EMAIL_INCOMING]: "Gelen E-posta",
    [COMMUNICATION_TYPE.EMAIL_OUTGOING]: "Giden E-posta",
    [COMMUNICATION_TYPE.PHONE_INCOMING]: "Gelen Arama",
    [COMMUNICATION_TYPE.PHONE_OUTGOING]: "Giden Arama",
    [COMMUNICATION_TYPE.WHATSAPP_INCOMING]: "Gelen WhatsApp",
    [COMMUNICATION_TYPE.WHATSAPP_OUTGOING]: "Giden WhatsApp",
    [COMMUNICATION_TYPE.MEETING]: "Toplantı",
    [COMMUNICATION_TYPE.NOTE]: "Not",
    [COMMUNICATION_TYPE.SYSTEM]: "Sistem",
  };
  return labels[type] || type;
};

export const getCommunicationStatusLabel = (status) => {
  const labels = {
    [COMMUNICATION_STATUS.SENT]: "Gönderildi",
    [COMMUNICATION_STATUS.DELIVERED]: "Teslim Edildi",
    [COMMUNICATION_STATUS.READ]: "Okundu",
    [COMMUNICATION_STATUS.REPLIED]: "Yanıtlandı",
    [COMMUNICATION_STATUS.PENDING]: "Beklemede",
    [COMMUNICATION_STATUS.FAILED]: "Başarısız",
  };
  return labels[status] || status;
};

// Tür renkleri
export const getCommunicationTypeColor = (type) => {
  const colors = {
    [COMMUNICATION_TYPE.EMAIL_INCOMING]: "bg-blue-100 text-blue-800 border-blue-200",
    [COMMUNICATION_TYPE.EMAIL_OUTGOING]: "bg-indigo-100 text-indigo-800 border-indigo-200",
    [COMMUNICATION_TYPE.PHONE_INCOMING]: "bg-green-100 text-green-800 border-green-200",
    [COMMUNICATION_TYPE.PHONE_OUTGOING]: "bg-emerald-100 text-emerald-800 border-emerald-200",
    [COMMUNICATION_TYPE.WHATSAPP_INCOMING]: "bg-lime-100 text-lime-800 border-lime-200",
    [COMMUNICATION_TYPE.WHATSAPP_OUTGOING]: "bg-teal-100 text-teal-800 border-teal-200",
    [COMMUNICATION_TYPE.MEETING]: "bg-purple-100 text-purple-800 border-purple-200",
    [COMMUNICATION_TYPE.NOTE]: "bg-amber-100 text-amber-800 border-amber-200",
    [COMMUNICATION_TYPE.SYSTEM]: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Gelen/Giden kontrolü
export const isIncomingCommunication = (type) => {
  return [
    COMMUNICATION_TYPE.EMAIL_INCOMING,
    COMMUNICATION_TYPE.PHONE_INCOMING,
    COMMUNICATION_TYPE.WHATSAPP_INCOMING,
  ].includes(type);
};

/**
 * Communication Service
 */
export const CommunicationService = {
  /**
   * Yeni iletişim kaydı oluştur
   */
  async create(data) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        // İlişkiler
        requestId: data.requestId || null,
        companyId: data.companyId || null,
        contactId: data.contactId || null,
        
        // İletişim bilgileri
        type: data.type,
        subject: data.subject || "",
        content: data.content || "",
        summary: data.summary || "",
        
        // Katılımcılar
        from: data.from || "",
        to: data.to || "",
        cc: data.cc || [],
        
        // Meta bilgiler
        status: data.status || COMMUNICATION_STATUS.SENT,
        duration: data.duration || null, // Telefon için saniye
        attachments: data.attachments || [],
        
        // AI ile oluşturuldu mu?
        isAiGenerated: data.isAiGenerated || false,
        aiPromptUsed: data.aiPromptUsed || null,
        
        // E-posta Thread Takibi
        outlookMessageId: data.outlookMessageId || null,
        outlookConversationId: data.outlookConversationId || null,
        outlookInternetMessageId: data.outlookInternetMessageId || null,
        parentCommunicationId: data.parentCommunicationId || null, // Yanıt zinciri için
        
        // Otomatik import bilgileri
        isAutoImported: data.isAutoImported || false,
        importedFromThread: data.importedFromThread || null,
        
        // Kullanıcı bilgileri
        createdBy: data.createdBy || null,
        createdByName: data.createdByName || "Sistem",
        
        // Tarihler
        communicationDate: data.communicationDate || Timestamp.now(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        id: docRef.id,
        message: "İletişim kaydı oluşturuldu",
      };
    } catch (error) {
      console.error("Error creating communication:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * İletişim kaydı güncelle
   */
  async update(id, data) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true, message: "İletişim güncellendi" };
    } catch (error) {
      console.error("Error updating communication:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * İletişim kaydı sil
   */
  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true, message: "İletişim silindi" };
    } catch (error) {
      console.error("Error deleting communication:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Tek iletişim kaydı getir
   */
  async get(id) {
    try {
      const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (!docSnap.exists()) {
        return { success: false, error: "İletişim bulunamadı" };
      }
      return {
        success: true,
        communication: { id: docSnap.id, ...docSnap.data() },
      };
    } catch (error) {
      console.error("Error getting communication:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Talebe ait iletişimleri getir
   */
  async getByRequest(requestId, options = {}) {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where("requestId", "==", requestId),
        orderBy("communicationDate", "desc")
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, communications };
    } catch (error) {
      console.error("Error getting communications by request:", error);
      return { success: false, error: error.message, communications: [] };
    }
  },

  /**
   * Şirkete ait iletişimleri getir
   */
  async getByCompany(companyId, options = {}) {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where("companyId", "==", companyId),
        orderBy("communicationDate", "desc")
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, communications };
    } catch (error) {
      console.error("Error getting communications by company:", error);
      return { success: false, error: error.message, communications: [] };
    }
  },

  /**
   * Talebe hızlı not ekle
   */
  async addNote(requestId, noteContent, user) {
    return this.create({
      requestId,
      type: COMMUNICATION_TYPE.NOTE,
      content: noteContent,
      createdBy: user?.uid,
      createdByName: user?.displayName || user?.email || "Sistem",
    });
  },

  /**
   * Giden e-posta kaydı ekle
   */
  async addOutgoingEmail(requestId, emailData, user) {
    return this.create({
      requestId,
      companyId: emailData.companyId,
      type: COMMUNICATION_TYPE.EMAIL_OUTGOING,
      subject: emailData.subject,
      content: emailData.content,
      from: emailData.from || "info@mkngroup.com.tr",
      to: emailData.to,
      cc: emailData.cc || [],
      attachments: emailData.attachments || [],
      isAiGenerated: emailData.isAiGenerated || false,
      aiPromptUsed: emailData.aiPromptUsed || null,
      createdBy: user?.uid,
      createdByName: user?.displayName || user?.email || "Sistem",
    });
  },

  /**
   * Telefon görüşmesi kaydı ekle
   */
  async addPhoneCall(requestId, callData, user) {
    return this.create({
      requestId,
      companyId: callData.companyId,
      type: callData.isIncoming ? COMMUNICATION_TYPE.PHONE_INCOMING : COMMUNICATION_TYPE.PHONE_OUTGOING,
      subject: callData.subject || "Telefon Görüşmesi",
      content: callData.notes || "",
      summary: callData.summary || "",
      from: callData.from,
      to: callData.to,
      duration: callData.duration, // saniye cinsinden
      createdBy: user?.uid,
      createdByName: user?.displayName || user?.email || "Sistem",
    });
  },

  /**
   * İstatistikler
   */
  async getStats(requestId) {
    try {
      const result = await this.getByRequest(requestId);
      if (!result.success) return result;

      const stats = {
        total: result.communications.length,
        incoming: 0,
        outgoing: 0,
        byType: {},
        lastCommunication: result.communications[0] || null,
      };

      result.communications.forEach((comm) => {
        // Tip sayımı
        stats.byType[comm.type] = (stats.byType[comm.type] || 0) + 1;

        // Gelen/Giden sayımı
        if (isIncomingCommunication(comm.type)) {
          stats.incoming++;
        } else if (comm.type !== COMMUNICATION_TYPE.NOTE && comm.type !== COMMUNICATION_TYPE.SYSTEM) {
          stats.outgoing++;
        }
      });

      return { success: true, stats };
    } catch (error) {
      console.error("Error getting communication stats:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * OutlookConversationId'ye göre iletişim kayıtlarını getir
   */
  async getByConversationId(conversationId) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("outlookConversationId", "==", conversationId),
        orderBy("communicationDate", "asc")
      );
      
      const snapshot = await getDocs(q);
      const communications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, communications };
    } catch (error) {
      console.error("Error getting communications by conversationId:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Belirli bir outlookMessageId'nin zaten kayıtlı olup olmadığını kontrol et
   */
  async existsByOutlookMessageId(outlookMessageId) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("outlookMessageId", "==", outlookMessageId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      return { success: true, exists: !snapshot.empty };
    } catch (error) {
      console.error("Error checking outlookMessageId:", error);
      return { success: false, error: error.message, exists: false };
    }
  },
};

export default CommunicationService;
