import {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
} from "../firestore";
import { createConversation } from "./crm-v2/conversation-service";
import { CHANNEL } from "./crm-v2/schema";

const COLLECTION_NAME = "contacts";

// Contact status constants
export const CONTACT_STATUS = {
  NEW: "new",
  IN_PROGRESS: "in-progress",
  RESPONDED: "responded",
  CLOSED: "closed",
};

export const CONTACT_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

export const CONTACT_SOURCE = {
  WEBSITE_CONTACT: "website-contact",
  WEBSITE_QUOTE: "website-quote",
  PHONE: "phone",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
};

// Tüm iletişimleri getir
export const getAllContacts = async () => {
  try {
    const contacts = await getDocuments(COLLECTION_NAME, {
      orderBy: ["createdAt", "desc"],
    });
    return contacts;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Tek iletişim getir
export const getContactById = async (id) => {
  try {
    const contact = await getDocument(COLLECTION_NAME, id);
    return contact;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
};

// Yeni iletişim ekle
export const createContact = async (contactData) => {
  try {
    const docId = await addDocument(COLLECTION_NAME, {
      ...contactData,
      // Default değerler
      status: contactData.status || CONTACT_STATUS.NEW,
      priority: contactData.priority || CONTACT_PRIORITY.NORMAL,
      source: contactData.source || CONTACT_SOURCE.WEBSITE_CONTACT,
      // Boş alanları varsayılan değerlerle doldur
      name: contactData.name || "",
      email: contactData.email || "",
      phone: contactData.phone || "",
      company: contactData.company || "",
      service: contactData.service || "",
      product: contactData.product || "",
      message: contactData.message || "",
      // İlave bilgiler
      notes: [],
      assignedTo: null,
      responseTime: null,
      followUpDate: null,
      tags: [],
    });
    
    // =========================================================================
    // 🔄 CRM v2 ENTEGRASYONU - Otomatik conversation oluştur
    // Bu sayede sync beklemeden direkt CRM'de görünür ve çift kayıt önlenir
    // =========================================================================
    try {
      await createConversation({
        name: contactData.name || "",
        email: contactData.email || "",
        phone: contactData.phone || "",
        company: contactData.company || "",
        channel: CHANNEL.CONTACT_FORM,
        subject: contactData.service || contactData.product || 'İletişim Formu',
        message: contactData.message || "",
        sourceRef: { type: 'contact', id: docId }, // ⚠️ Bu ID ile sync duplicate engelleyecek
        channelMetadata: {
          legacySystem: 'contacts',
          source: contactData.source || CONTACT_SOURCE.WEBSITE_CONTACT,
          service: contactData.service || null,
          product: contactData.product || null,
          syncedAt: new Date().toISOString(),
          directWrite: true, // Direkt yazıldığını işaretle (debug için)
        },
      });
      console.log(`[Contact] CRM v2 conversation created for contact: ${docId}`);
    } catch (crmError) {
      // CRM hatası contact oluşturmayı engellemez, sadece log'la
      console.error(`[Contact] CRM v2 conversation creation failed for ${docId}:`, crmError);
    }
    
    return docId;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

// İletişim güncelle
export const updateContact = async (id, contactData) => {
  try {
    await updateDocument(COLLECTION_NAME, id, contactData);
    return true;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

// İletişim sil
export const deleteContact = async (id) => {
  try {
    await deleteDocument(COLLECTION_NAME, id);
    return true;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

// Duruma göre iletişimleri getir
export const getContactsByStatus = async (status) => {
  try {
    const contacts = await getDocuments(COLLECTION_NAME, {
      where: ["status", "==", status],
      orderBy: ["createdAt", "desc"],
    });
    return contacts;
  } catch (error) {
    console.error("Error fetching contacts by status:", error);
    throw error;
  }
};

// Önceliğe göre iletişimleri getir
export const getContactsByPriority = async (priority) => {
  try {
    const contacts = await getDocuments(COLLECTION_NAME, {
      where: ["priority", "==", priority],
      orderBy: ["createdAt", "desc"],
    });
    return contacts;
  } catch (error) {
    console.error("Error fetching contacts by priority:", error);
    throw error;
  }
};

// Servise göre iletişimleri getir
export const getContactsByService = async (service) => {
  try {
    const contacts = await getDocuments(COLLECTION_NAME, {
      where: ["service", "==", service],
      orderBy: ["createdAt", "desc"],
    });
    return contacts;
  } catch (error) {
    console.error("Error fetching contacts by service:", error);
    throw error;
  }
};

// Arama yap
export const searchContacts = async (searchTerm) => {
  try {
    // Firestore'da full-text search olmadığı için tüm iletişimleri getirip client-side'da filtreleyeceğiz
    const allContacts = await getAllContacts();

    if (!searchTerm) return allContacts;

    const filteredContacts = allContacts.filter((contact) => {
      const searchFields = [
        contact.name,
        contact.email,
        contact.phone,
        contact.company,
        contact.service,
        contact.product,
        contact.message,
      ];

      return searchFields.some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return filteredContacts;
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
};

// İletişim notlarını güncelle
export const updateContactNotes = async (id, notes) => {
  try {
    await updateDocument(COLLECTION_NAME, id, { notes });
    return true;
  } catch (error) {
    console.error("Error updating contact notes:", error);
    throw error;
  }
};

// İletişim durumunu güncelle
export const updateContactStatus = async (id, status) => {
  try {
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Eğer durum "responded" ise response time'ı ekle
    if (status === CONTACT_STATUS.RESPONDED) {
      updateData.responseTime = new Date().toISOString();
    }

    await updateDocument(COLLECTION_NAME, id, updateData);
    return true;
  } catch (error) {
    console.error("Error updating contact status:", error);
    throw error;
  }
};

// İletişim önceliğini güncelle
export const updateContactPriority = async (id, priority) => {
  try {
    await updateDocument(COLLECTION_NAME, id, {
      priority,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error updating contact priority:", error);
    throw error;
  }
};

// İletişim atama
export const assignContact = async (id, assignedTo) => {
  try {
    await updateDocument(COLLECTION_NAME, id, {
      assignedTo,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error assigning contact:", error);
    throw error;
  }
};

// Takip tarihini güncelle
export const updateFollowUpDate = async (id, followUpDate) => {
  try {
    await updateDocument(COLLECTION_NAME, id, {
      followUpDate,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error updating follow up date:", error);
    throw error;
  }
};

// İstatistikler
export const getContactStats = async () => {
  try {
    const allContacts = await getAllContacts();

    const stats = {
      total: allContacts.length,
      new: allContacts.filter((c) => c.status === CONTACT_STATUS.NEW).length,
      inProgress: allContacts.filter(
        (c) => c.status === CONTACT_STATUS.IN_PROGRESS
      ).length,
      responded: allContacts.filter(
        (c) => c.status === CONTACT_STATUS.RESPONDED
      ).length,
      closed: allContacts.filter((c) => c.status === CONTACT_STATUS.CLOSED)
        .length,
      high: allContacts.filter((c) => c.priority === CONTACT_PRIORITY.HIGH)
        .length,
      urgent: allContacts.filter((c) => c.priority === CONTACT_PRIORITY.URGENT)
        .length,
    };

    return stats;
  } catch (error) {
    console.error("Error getting contact stats:", error);
    throw error;
  }
};
