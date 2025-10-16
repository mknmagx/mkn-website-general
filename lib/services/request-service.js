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
  startAfter,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'customer_requests';

// Request kategorileri - MKN Group iş modellerine göre
export const REQUEST_CATEGORIES = {
  COSMETIC_MANUFACTURING: 'cosmetic_manufacturing',
  SUPPLEMENT_MANUFACTURING: 'supplement_manufacturing', 
  CLEANING_MANUFACTURING: 'cleaning_manufacturing',
  PACKAGING_SUPPLY: 'packaging_supply',
  ECOMMERCE_OPERATIONS: 'ecommerce_operations',
  DIGITAL_MARKETING: 'digital_marketing',
  FORMULATION_DEVELOPMENT: 'formulation_development',
  CONSULTATION: 'consultation'
};

// Request durumları
export const REQUEST_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  WAITING_CLIENT: 'waiting_client',
  QUOTATION_SENT: 'quotation_sent',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Request öncelikleri
export const REQUEST_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Request kaynak türleri
export const REQUEST_SOURCE = {
  WEBSITE_FORM: 'website_form',
  PHONE_CALL: 'phone_call',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  MEETING: 'meeting',
  REFERRAL: 'referral',
  EXISTING_CLIENT: 'existing_client'
};

/**
 * Request Service
 * Müşteri talebi yönetimi için Firebase operations
 */
export const RequestService = {
  /**
   * Yeni talep oluştur
   */
  async createRequest(requestData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...requestData,
        status: requestData.status || REQUEST_STATUS.NEW,
        priority: requestData.priority || REQUEST_PRIORITY.NORMAL,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // Otomatik alanlar
        requestNumber: `REQ-${Date.now()}`,
        assignedTo: null,
        notes: [],
        followUps: [],
        documents: [],
        estimatedValue: 0,
        actualValue: 0
      });

      return {
        success: true,
        id: docRef.id,
        message: 'Talep başarıyla oluşturuldu'
      };
    } catch (error) {
      console.error('Error creating request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Talep güncelle
   */
  async updateRequest(id, updateData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        message: 'Talep başarıyla güncellendi'
      };
    } catch (error) {
      console.error('Error updating request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Talep sil
   */
  async deleteRequest(id) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return {
        success: true,
        message: 'Talep başarıyla silindi'
      };
    } catch (error) {
      console.error('Error deleting request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Tek talep getir
   */
  async getRequest(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          request: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          error: 'Talep bulunamadı'
        };
      }
    } catch (error) {
      console.error('Error getting request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Tüm talepleri getir (filtreleme ve sayfalama ile)
   */
  async getRequests(options = {}) {
    try {
      let q = collection(db, COLLECTION_NAME);
      const conditions = [];

      // Filtreler
      if (options.companyId) {
        conditions.push(where('companyId', '==', options.companyId));
      }
      
      if (options.status) {
        conditions.push(where('status', '==', options.status));
      }

      if (options.category) {
        conditions.push(where('category', '==', options.category));
      }

      if (options.priority) {
        conditions.push(where('priority', '==', options.priority));
      }

      if (options.assignedTo) {
        conditions.push(where('assignedTo', '==', options.assignedTo));
      }

      // Sorgu oluştur
      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }

      // Sıralama
      const orderField = options.orderBy || 'createdAt';
      const orderDirection = options.orderDirection || 'desc';
      q = query(q, orderBy(orderField, orderDirection));

      // Sayfalama
      if (options.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const requests = [];
      let lastDoc = null;

      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
        lastDoc = doc;
      });

      return {
        success: true,
        requests,
        hasMore: requests.length === (options.limitCount || 50),
        lastDoc
      };
    } catch (error) {
      console.error('Error getting requests:', error);
      return {
        success: false,
        error: error.message,
        requests: []
      };
    }
  },

  /**
   * Talep arama
   */
  async searchRequests(searchTerm) {
    try {
      // Basit search - gerçek projede Algolia kullanılmalı
      const result = await this.getRequests({ limitCount: 100 });
      
      if (!result.success) {
        return result;
      }

      const filteredRequests = result.requests.filter(request => 
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        success: true,
        requests: filteredRequests
      };
    } catch (error) {
      console.error('Error searching requests:', error);
      return {
        success: false,
        error: error.message,
        requests: []
      };
    }
  },

  /**
   * Talebe not ekle
   */
  async addRequestNote(requestId, noteData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, requestId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Talep bulunamadı'
        };
      }

      const currentNotes = docSnap.data().notes || [];
      const newNote = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: Timestamp.now()
      };

      await updateDoc(docRef, {
        notes: [newNote, ...currentNotes],
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        note: newNote,
        message: 'Not başarıyla eklendi'
      };
    } catch (error) {
      console.error('Error adding request note:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Takip planla
   */
  async addFollowUp(requestId, followUpData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, requestId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Talep bulunamadı'
        };
      }

      const currentFollowUps = docSnap.data().followUps || [];
      const newFollowUp = {
        id: Date.now().toString(),
        ...followUpData,
        status: 'pending',
        createdAt: Timestamp.now()
      };

      await updateDoc(docRef, {
        followUps: [...currentFollowUps, newFollowUp],
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        followUp: newFollowUp,
        message: 'Takip başarıyla planlandı'
      };
    } catch (error) {
      console.error('Error adding follow up:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Durum geçmişi al
   */
  async getRequestStatusHistory(requestId) {
    try {
      const request = await this.getRequest(requestId);
      if (!request.success) {
        return request;
      }

      return {
        success: true,
        statusHistory: request.request.statusHistory || []
      };
    } catch (error) {
      console.error('Error getting status history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Dashboard istatistikleri
   */
  async getRequestStats() {
    try {
      const allRequests = await this.getRequests({ limitCount: 1000 });
      
      if (!allRequests.success) {
        return allRequests;
      }

      const stats = {
        total: allRequests.requests.length,
        byStatus: {},
        byCategory: {},
        byPriority: {},
        thisMonth: 0,
        pendingValue: 0,
        completedValue: 0
      };

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      allRequests.requests.forEach(request => {
        // Status sayımı
        stats.byStatus[request.status] = (stats.byStatus[request.status] || 0) + 1;
        
        // Category sayımı
        stats.byCategory[request.category] = (stats.byCategory[request.category] || 0) + 1;
        
        // Priority sayımı  
        stats.byPriority[request.priority] = (stats.byPriority[request.priority] || 0) + 1;

        // Bu ay sayımı
        if (request.createdAt && request.createdAt.toDate && 
            request.createdAt.toDate() >= thisMonth) {
          stats.thisMonth++;
        }

        // Değer hesaplamaları
        if (request.estimatedValue) {
          if (request.status === REQUEST_STATUS.COMPLETED) {
            stats.completedValue += request.actualValue || request.estimatedValue;
          } else if ([REQUEST_STATUS.NEW, REQUEST_STATUS.IN_PROGRESS, REQUEST_STATUS.QUOTATION_SENT].includes(request.status)) {
            stats.pendingValue += request.estimatedValue;
          }
        }
      });

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error getting request stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Yardımcı fonksiyonlar
export const getRequestCategoryLabel = (category) => {
  const labels = {
    [REQUEST_CATEGORIES.COSMETIC_MANUFACTURING]: 'Kozmetik Fason Üretim',
    [REQUEST_CATEGORIES.SUPPLEMENT_MANUFACTURING]: 'Gıda Takviyesi Üretimi',
    [REQUEST_CATEGORIES.CLEANING_MANUFACTURING]: 'Temizlik Ürünleri Üretimi',
    [REQUEST_CATEGORIES.PACKAGING_SUPPLY]: 'Ambalaj Tedariki',
    [REQUEST_CATEGORIES.ECOMMERCE_OPERATIONS]: 'E-ticaret Operasyonları',
    [REQUEST_CATEGORIES.DIGITAL_MARKETING]: 'Dijital Pazarlama',
    [REQUEST_CATEGORIES.FORMULATION_DEVELOPMENT]: 'Formülasyon Geliştirme',
    [REQUEST_CATEGORIES.CONSULTATION]: 'Danışmanlık'
  };
  return labels[category] || category;
};

export const getRequestStatusLabel = (status) => {
  const labels = {
    [REQUEST_STATUS.NEW]: 'Yeni',
    [REQUEST_STATUS.ASSIGNED]: 'Atandı',
    [REQUEST_STATUS.IN_PROGRESS]: 'İşleniyor',
    [REQUEST_STATUS.WAITING_CLIENT]: 'Müşteri Bekleniyor',
    [REQUEST_STATUS.QUOTATION_SENT]: 'Teklif Gönderildi',
    [REQUEST_STATUS.APPROVED]: 'Onaylandı',
    [REQUEST_STATUS.REJECTED]: 'Reddedildi',
    [REQUEST_STATUS.COMPLETED]: 'Tamamlandı',
    [REQUEST_STATUS.CANCELLED]: 'İptal Edildi'
  };
  return labels[status] || status;
};

export const getRequestPriorityLabel = (priority) => {
  const labels = {
    [REQUEST_PRIORITY.LOW]: 'Düşük',
    [REQUEST_PRIORITY.NORMAL]: 'Normal',
    [REQUEST_PRIORITY.HIGH]: 'Yüksek',
    [REQUEST_PRIORITY.URGENT]: 'Acil'
  };
  return labels[priority] || priority;
};

export const getRequestSourceLabel = (source) => {
  const labels = {
    [REQUEST_SOURCE.WEBSITE_FORM]: 'Website Formu',
    [REQUEST_SOURCE.PHONE_CALL]: 'Telefon',
    [REQUEST_SOURCE.EMAIL]: 'E-posta',
    [REQUEST_SOURCE.WHATSAPP]: 'WhatsApp',
    [REQUEST_SOURCE.MEETING]: 'Toplantı',
    [REQUEST_SOURCE.REFERRAL]: 'Referans',
    [REQUEST_SOURCE.EXISTING_CLIENT]: 'Mevcut Müşteri'
  };
  return labels[source] || source;
};