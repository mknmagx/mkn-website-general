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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "customer_requests";

// Request kategorileri - MKN Group iş modellerine göre
export const REQUEST_CATEGORIES = {
  COSMETIC_MANUFACTURING: "cosmetic_manufacturing",
  SUPPLEMENT_MANUFACTURING: "supplement_manufacturing",
  CLEANING_MANUFACTURING: "cleaning_manufacturing",
  PACKAGING_SUPPLY: "packaging_supply",
  ECOMMERCE_OPERATIONS: "ecommerce_operations",
  DIGITAL_MARKETING: "digital_marketing",
  FORMULATION_DEVELOPMENT: "formulation_development",
  CONSULTATION: "consultation",
};

// Her kategoriye özel alanlar
export const CATEGORY_FIELDS = {
  [REQUEST_CATEGORIES.COSMETIC_MANUFACTURING]: {
    products: {
      type: "array",
      label: "Ürün Listesi",
      required: true,
      fields: {
        productType: {
          type: "select",
          label: "Ürün Türü",
          required: true,
          options: ["krem", "serum", "tonik", "şampuan", "maske", "diğer"],
        },
        formulaContent: {
          type: "textarea",
          label: "Formül İçeriği",
          required: true,
        },
        packaging: {
          type: "select",
          label: "Ambalaj Türü",
          required: true,
          options: [
            "plastik şişe",
            "cam şişe",
            "airless",
            "pompa",
            "tüp",
            "kavanoz",
            "diğer",
          ],
        },
        packagingSize: {
          type: "select",
          label: "Ambalaj Boyutu",
          required: true,
          options: [
            "30ml",
            "50ml",
            "100ml",
            "150ml",
            "200ml",
            "250ml",
            "500ml",
            "diğer",
          ],
        },
        label: {
          type: "select",
          label: "Etiket Türü",
          options: ["şeffaf", "opak beyaz", "metalik", "hologramlı", "diğer"],
        },
        boxType: {
          type: "select",
          label: "Kutu Türü",
          options: ["karton kutu", "lüks kutu", "blister", "kutusuz", "diğer"],
        },
        scent: { type: "text", label: "Koku Tercihi" },
        color: { type: "text", label: "Renk Tercihi" },
        texture: {
          type: "select",
          label: "Tekstür",
          options: ["gel", "krem", "losyon", "serum", "yağ", "diğer"],
        },
        quantity: { type: "number", label: "Adet", required: true },
        specialRequests: { type: "textarea", label: "Özel İstekler" },
      },
    },
    certifications: {
      type: "multiselect",
      label: "İstenen Sertifikalar",
      options: ["halal", "vegan", "organik", "iso22716", "cpsr", "diğer"],
    },
    targetMarket: {
      type: "select",
      label: "Hedef Pazar",
      options: ["türkiye", "ab", "ortadoğu", "balkanlar", "diğer"],
    },
    brandName: { type: "text", label: "Marka Adı" },
    budget: {
      type: "select",
      label: "Bütçe Aralığı",
      options: [
        "10.000-25.000 TL",
        "25.000-50.000 TL",
        "50.000-100.000 TL",
        "100.000+ TL",
      ],
    },
  },

  [REQUEST_CATEGORIES.SUPPLEMENT_MANUFACTURING]: {
    products: {
      type: "array",
      label: "Ürün Listesi",
      required: true,
      fields: {
        productType: {
          type: "select",
          label: "Ürün Türü",
          required: true,
          options: [
            "tablet",
            "kapsül",
            "şurup",
            "toz",
            "yumuşak kapsül",
            "diğer",
          ],
        },
        activeIngredients: {
          type: "textarea",
          label: "Aktif Bileşenler",
          required: true,
        },
        dosageForm: {
          type: "select",
          label: "Dozaj Formu",
          required: true,
          options: ["günlük", "haftalık", "aylık", "ihtiyaç anında"],
        },
        packaging: {
          type: "select",
          label: "Ambalaj Türü",
          required: true,
          options: ["blister", "şişe", "stick pack", "sachet", "diğer"],
        },
        quantity: { type: "number", label: "Adet/Hacim", required: true },
        shelfLife: {
          type: "select",
          label: "Raf Ömrü",
          options: ["12 ay", "18 ay", "24 ay", "36 ay"],
        },
        specialRequests: { type: "textarea", label: "Özel İstekler" },
      },
    },
    certifications: {
      type: "multiselect",
      label: "İstenen Sertifikalar",
      options: ["gıda lisansı", "halal", "vegan", "organik", "haccp", "diğer"],
    },
    targetAgeGroup: {
      type: "select",
      label: "Hedef Yaş Grubu",
      options: ["çocuk", "yetişkin", "yaşlı", "tüm yaşlar"],
    },
    brandName: { type: "text", label: "Marka Adı" },
  },

  [REQUEST_CATEGORIES.CLEANING_MANUFACTURING]: {
    products: {
      type: "array",
      label: "Ürün Listesi",
      required: true,
      fields: {
        productType: {
          type: "select",
          label: "Ürün Türü",
          required: true,
          options: [
            "deterjan",
            "temizlik spreyi",
            "bulaşık deterjanı",
            "yumuşatıcı",
            "çamaşır suyu",
            "diğer",
          ],
        },
        formula: {
          type: "textarea",
          label: "Formül Özellikleri",
          required: true,
        },
        packaging: {
          type: "select",
          label: "Ambalaj Türü",
          required: true,
          options: ["plastik şişe", "pouch", "trigger", "aerosol", "diğer"],
        },
        volume: {
          type: "select",
          label: "Hacim",
          required: true,
          options: ["500ml", "750ml", "1L", "2L", "3L", "5L", "diğer"],
        },
        scent: {
          type: "select",
          label: "Koku",
          options: ["limon", "lavanta", "beyaz sabun", "kokusuz", "diğer"],
        },
        concentration: {
          type: "select",
          label: "Konsantrasyon",
          options: ["normal", "konsantre", "ultra konsantre"],
        },
        quantity: { type: "number", label: "Adet", required: true },
        specialRequests: { type: "textarea", label: "Özel İstekler" },
      },
    },
    ecoFriendly: { type: "boolean", label: "Çevre Dostu Formül" },
    biodegradable: { type: "boolean", label: "Biyolojik Çözünür" },
    brandName: { type: "text", label: "Marka Adı" },
  },

  [REQUEST_CATEGORIES.PACKAGING_SUPPLY]: {
    packages: {
      type: "array",
      label: "Ambalaj Listesi",
      required: true,
      fields: {
        packagingType: {
          type: "select",
          label: "Ambalaj Türü",
          required: true,
          options: [
            "plastik şişe",
            "cam şişe",
            "kavanoz",
            "tüp",
            "kutu",
            "pouch",
            "etiket",
            "diğer",
          ],
        },
        material: {
          type: "select",
          label: "Malzeme",
          required: true,
          options: ["pet", "hdpe", "pp", "cam", "karton", "metal", "diğer"],
        },
        size: { type: "text", label: "Boyut/Hacim", required: true },
        color: { type: "text", label: "Renk", required: true },
        printing: {
          type: "select",
          label: "Baskı Türü",
          options: [
            "serigrafi",
            "dijital",
            "etiket",
            "hot stamping",
            "baskısız",
            "diğer",
          ],
        },
        quantity: { type: "number", label: "Adet", required: true },
        specialRequests: { type: "textarea", label: "Özel İstekler" },
      },
    },
    customDesign: { type: "boolean", label: "Özel Tasarım Gerekli" },
    samples: { type: "boolean", label: "Numune İsteği" },
    urgency: {
      type: "select",
      label: "Aciliyet",
      options: ["normal", "hızlı", "çok acil"],
    },
  },

  [REQUEST_CATEGORIES.ECOMMERCE_OPERATIONS]: {
    services: {
      type: "multiselect",
      label: "İstenen Hizmetler",
      required: true,
      options: [
        "ürün fotoğrafı",
        "katalog hazırlığı",
        "market yönetimi",
        "stok yönetimi",
        "kargo koordinasyonu",
        "müşteri hizmetleri",
        "diğer",
      ],
    },
    platforms: {
      type: "multiselect",
      label: "E-ticaret Platformları",
      required: true,
      options: [
        "trendyol",
        "hepsiburada",
        "amazon",
        "n11",
        "gittigidiyor",
        "kendi websitesi",
        "diğer",
      ],
    },
    productCount: { type: "number", label: "Ürün Adedi" },
    monthlyOrderTarget: { type: "number", label: "Aylık Sipariş Hedefi" },
    specialRequests: { type: "textarea", label: "Özel İstekler" },
  },

  [REQUEST_CATEGORIES.DIGITAL_MARKETING]: {
    services: {
      type: "multiselect",
      label: "İstenen Hizmetler",
      required: true,
      options: [
        "sosyal medya yönetimi",
        "google ads",
        "seo",
        "içerik üretimi",
        "influencer pazarlama",
        "email pazarlama",
        "diğer",
      ],
    },
    platforms: {
      type: "multiselect",
      label: "Platformlar",
      options: [
        "instagram",
        "facebook",
        "youtube",
        "tiktok",
        "linkedin",
        "google",
        "diğer",
      ],
    },
    budget: {
      type: "select",
      label: "Aylık Bütçe",
      options: [
        "5.000-10.000 TL",
        "10.000-25.000 TL",
        "25.000-50.000 TL",
        "50.000+ TL",
      ],
    },
    targetAudience: { type: "textarea", label: "Hedef Kitle" },
    campaignGoals: { type: "textarea", label: "Kampanya Hedefleri" },
  },

  [REQUEST_CATEGORIES.FORMULATION_DEVELOPMENT]: {
    productCategory: {
      type: "select",
      label: "Ürün Kategorisi",
      required: true,
      options: ["kozmetik", "gıda takviyesi", "temizlik", "diğer"],
    },
    developmentType: {
      type: "select",
      label: "Geliştirme Türü",
      required: true,
      options: [
        "yeni formül",
        "mevcut formül iyileştirme",
        "rakip analizi",
        "diğer",
      ],
    },
    targetProperties: {
      type: "textarea",
      label: "Hedeflenen Özellikler",
      required: true,
    },
    constraints: { type: "textarea", label: "Kısıtlamalar ve Sınırlar" },
    budget: {
      type: "select",
      label: "Ar-Ge Bütçesi",
      options: ["25.000-50.000 TL", "50.000-100.000 TL", "100.000+ TL"],
    },
    timeline: {
      type: "select",
      label: "Süre",
      options: ["1-3 ay", "3-6 ay", "6-12 ay", "12+ ay"],
    },
  },

  [REQUEST_CATEGORIES.CONSULTATION]: {
    consultationType: {
      type: "select",
      label: "Danışmanlık Türü",
      required: true,
      options: [
        "iş kurma",
        "lisans alma",
        "ihracat",
        "kalite sistemleri",
        "pazarlama stratejisi",
        "maliyet optimizasyonu",
        "diğer",
      ],
    },
    businessStage: {
      type: "select",
      label: "İş Aşaması",
      options: [
        "fikir aşaması",
        "kuruluş aşaması",
        "büyüme aşaması",
        "olgun işletme",
      ],
    },
    currentChallenges: {
      type: "textarea",
      label: "Mevcut Zorluklar",
      required: true,
    },
    goals: { type: "textarea", label: "Hedefler", required: true },
    timeline: {
      type: "select",
      label: "Danışmanlık Süresi",
      options: ["1 gün", "1 hafta", "1 ay", "3 ay", "6 ay", "sürekli"],
    },
    meetingPreference: {
      type: "select",
      label: "Görüşme Tercihi",
      options: ["yüz yüze", "online", "hibrit"],
    },
  },
};

// Request durumları
export const REQUEST_STATUS = {
  NEW: "new",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  WAITING_CLIENT: "waiting_client",
  QUOTATION_SENT: "quotation_sent",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Request öncelikleri
export const REQUEST_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

// Request kaynak türleri
export const REQUEST_SOURCE = {
  WEBSITE_FORM: "website_form",
  PHONE_CALL: "phone_call",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  MEETING: "meeting",
  REFERRAL: "referral",
  EXISTING_CLIENT: "existing_client",
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
        actualValue: 0,
      });

      return {
        success: true,
        id: docRef.id,
        message: "Talep başarıyla oluşturuldu",
      };
    } catch (error) {
      console.error("Error creating request:", error);
      return {
        success: false,
        error: error.message,
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
        updatedAt: Timestamp.now(),
      });

      return {
        success: true,
        message: "Talep başarıyla güncellendi",
      };
    } catch (error) {
      console.error("Error updating request:", error);
      return {
        success: false,
        error: error.message,
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
        message: "Talep başarıyla silindi",
      };
    } catch (error) {
      console.error("Error deleting request:", error);
      return {
        success: false,
        error: error.message,
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
            ...docSnap.data(),
          },
        };
      } else {
        return {
          success: false,
          error: "Talep bulunamadı",
        };
      }
    } catch (error) {
      console.error("Error getting request:", error);
      return {
        success: false,
        error: error.message,
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
        conditions.push(where("companyId", "==", options.companyId));
      }

      if (options.status) {
        conditions.push(where("status", "==", options.status));
      }

      if (options.category) {
        conditions.push(where("category", "==", options.category));
      }

      if (options.priority) {
        conditions.push(where("priority", "==", options.priority));
      }

      if (options.assignedTo) {
        conditions.push(where("assignedTo", "==", options.assignedTo));
      }

      // Sorgu oluştur
      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }

      // Sıralama
      const orderField = options.orderBy || "createdAt";
      const orderDirection = options.orderDirection || "desc";
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
          ...doc.data(),
        });
        lastDoc = doc;
      });

      return {
        success: true,
        requests,
        hasMore: requests.length === (options.limitCount || 50),
        lastDoc,
      };
    } catch (error) {
      console.error("Error getting requests:", error);
      return {
        success: false,
        error: error.message,
        requests: [],
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

      const filteredRequests = result.requests.filter(
        (request) =>
          request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.requestNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.companyName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        success: true,
        requests: filteredRequests,
      };
    } catch (error) {
      console.error("Error searching requests:", error);
      return {
        success: false,
        error: error.message,
        requests: [],
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
          error: "Talep bulunamadı",
        };
      }

      const currentNotes = docSnap.data().notes || [];
      const newNote = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: Timestamp.now(),
      };

      await updateDoc(docRef, {
        notes: [newNote, ...currentNotes],
        updatedAt: Timestamp.now(),
      });

      return {
        success: true,
        note: newNote,
        message: "Not başarıyla eklendi",
      };
    } catch (error) {
      console.error("Error adding request note:", error);
      return {
        success: false,
        error: error.message,
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
          error: "Talep bulunamadı",
        };
      }

      const currentFollowUps = docSnap.data().followUps || [];
      const newFollowUp = {
        id: Date.now().toString(),
        ...followUpData,
        status: "pending",
        createdAt: Timestamp.now(),
      };

      await updateDoc(docRef, {
        followUps: [...currentFollowUps, newFollowUp],
        updatedAt: Timestamp.now(),
      });

      return {
        success: true,
        followUp: newFollowUp,
        message: "Takip başarıyla planlandı",
      };
    } catch (error) {
      console.error("Error adding follow up:", error);
      return {
        success: false,
        error: error.message,
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
        statusHistory: request.request.statusHistory || [],
      };
    } catch (error) {
      console.error("Error getting status history:", error);
      return {
        success: false,
        error: error.message,
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
        completedValue: 0,
      };

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      allRequests.requests.forEach((request) => {
        // Status sayımı
        stats.byStatus[request.status] =
          (stats.byStatus[request.status] || 0) + 1;

        // Category sayımı
        stats.byCategory[request.category] =
          (stats.byCategory[request.category] || 0) + 1;

        // Priority sayımı
        stats.byPriority[request.priority] =
          (stats.byPriority[request.priority] || 0) + 1;

        // Bu ay sayımı
        if (
          request.createdAt &&
          request.createdAt.toDate &&
          request.createdAt.toDate() >= thisMonth
        ) {
          stats.thisMonth++;
        }

        // Değer hesaplamaları
        if (request.estimatedValue) {
          if (request.status === REQUEST_STATUS.COMPLETED) {
            stats.completedValue +=
              request.actualValue || request.estimatedValue;
          } else if (
            [
              REQUEST_STATUS.NEW,
              REQUEST_STATUS.IN_PROGRESS,
              REQUEST_STATUS.QUOTATION_SENT,
            ].includes(request.status)
          ) {
            stats.pendingValue += request.estimatedValue;
          }
        }
      });

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("Error getting request stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Yardımcı fonksiyonlar
export const getRequestCategoryLabel = (category) => {
  const labels = {
    [REQUEST_CATEGORIES.COSMETIC_MANUFACTURING]: "Kozmetik Fason Üretim",
    [REQUEST_CATEGORIES.SUPPLEMENT_MANUFACTURING]: "Gıda Takviyesi Üretimi",
    [REQUEST_CATEGORIES.CLEANING_MANUFACTURING]: "Temizlik Ürünleri Üretimi",
    [REQUEST_CATEGORIES.PACKAGING_SUPPLY]: "Ambalaj Tedariki",
    [REQUEST_CATEGORIES.ECOMMERCE_OPERATIONS]: "E-ticaret Operasyonları",
    [REQUEST_CATEGORIES.DIGITAL_MARKETING]: "Dijital Pazarlama",
    [REQUEST_CATEGORIES.FORMULATION_DEVELOPMENT]: "Formülasyon Geliştirme",
    [REQUEST_CATEGORIES.CONSULTATION]: "Danışmanlık",
  };
  return labels[category] || category;
};

// Kategori ikonları
export const getCategoryIcon = (category) => {
  const icons = {
    [REQUEST_CATEGORIES.COSMETIC_MANUFACTURING]: "droplets",
    [REQUEST_CATEGORIES.SUPPLEMENT_MANUFACTURING]: "pill",
    [REQUEST_CATEGORIES.CLEANING_MANUFACTURING]: "spray-can",
    [REQUEST_CATEGORIES.PACKAGING_SUPPLY]: "package",
    [REQUEST_CATEGORIES.ECOMMERCE_OPERATIONS]: "shopping-cart",
    [REQUEST_CATEGORIES.DIGITAL_MARKETING]: "trending-up",
    [REQUEST_CATEGORIES.FORMULATION_DEVELOPMENT]: "flask-conical",
    [REQUEST_CATEGORIES.CONSULTATION]: "users",
  };
  return icons[category] || "folder";
};

// Kategori renkleri
export const getCategoryColor = (category) => {
  const colors = {
    [REQUEST_CATEGORIES.COSMETIC_MANUFACTURING]:
      "bg-pink-100 text-pink-800 border-pink-200",
    [REQUEST_CATEGORIES.SUPPLEMENT_MANUFACTURING]:
      "bg-green-100 text-green-800 border-green-200",
    [REQUEST_CATEGORIES.CLEANING_MANUFACTURING]:
      "bg-blue-100 text-blue-800 border-blue-200",
    [REQUEST_CATEGORIES.PACKAGING_SUPPLY]:
      "bg-orange-100 text-orange-800 border-orange-200",
    [REQUEST_CATEGORIES.ECOMMERCE_OPERATIONS]:
      "bg-purple-100 text-purple-800 border-purple-200",
    [REQUEST_CATEGORIES.DIGITAL_MARKETING]:
      "bg-indigo-100 text-indigo-800 border-indigo-200",
    [REQUEST_CATEGORIES.FORMULATION_DEVELOPMENT]:
      "bg-teal-100 text-teal-800 border-teal-200",
    [REQUEST_CATEGORIES.CONSULTATION]:
      "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const getRequestStatusLabel = (status) => {
  const labels = {
    [REQUEST_STATUS.NEW]: "Yeni",
    [REQUEST_STATUS.ASSIGNED]: "Atandı",
    [REQUEST_STATUS.IN_PROGRESS]: "İşleniyor",
    [REQUEST_STATUS.WAITING_CLIENT]: "Müşteri Bekleniyor",
    [REQUEST_STATUS.QUOTATION_SENT]: "Teklif Gönderildi",
    [REQUEST_STATUS.APPROVED]: "Onaylandı",
    [REQUEST_STATUS.REJECTED]: "Reddedildi",
    [REQUEST_STATUS.COMPLETED]: "Tamamlandı",
    [REQUEST_STATUS.CANCELLED]: "İptal Edildi",
  };
  return labels[status] || status;
};

export const getRequestPriorityLabel = (priority) => {
  const labels = {
    [REQUEST_PRIORITY.LOW]: "Düşük",
    [REQUEST_PRIORITY.NORMAL]: "Normal",
    [REQUEST_PRIORITY.HIGH]: "Yüksek",
    [REQUEST_PRIORITY.URGENT]: "Acil",
  };
  return labels[priority] || priority;
};

export const getRequestSourceLabel = (source) => {
  const labels = {
    [REQUEST_SOURCE.WEBSITE_FORM]: "Website Formu",
    [REQUEST_SOURCE.PHONE_CALL]: "Telefon",
    [REQUEST_SOURCE.EMAIL]: "E-posta",
    [REQUEST_SOURCE.WHATSAPP]: "WhatsApp",
    [REQUEST_SOURCE.MEETING]: "Toplantı",
    [REQUEST_SOURCE.REFERRAL]: "Referans",
    [REQUEST_SOURCE.EXISTING_CLIENT]: "Mevcut Müşteri",
  };
  return labels[source] || source;
};
