import {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  serverTimestamp,
} from "../firestore";
import { v4 as uuidv4 } from "uuid";

const PROFORMA_COLLECTION = "proformas";

// Hizmet kategorileri
export const SERVICE_CATEGORIES = {
  COSMETIC_MANUFACTURING: "cosmetic_manufacturing",
  SUPPLEMENT_MANUFACTURING: "supplement_manufacturing",
  CLEANING_MANUFACTURING: "cleaning_manufacturing",
  PACKAGING_SUPPLY: "packaging_supply",
  ECOMMERCE_OPERATIONS: "ecommerce_operations",
  DIGITAL_MARKETING: "digital_marketing",
  DESIGN_SERVICES: "design_services",
  FORMULATION_DEVELOPMENT: "formulation_development",
  CONSULTATION: "consultation",
  CUSTOM: "custom",
};

// Hizmet kategorilerinin Türkçe karşılıkları
export const SERVICE_CATEGORY_LABELS = {
  [SERVICE_CATEGORIES.COSMETIC_MANUFACTURING]: "Kozmetik Fason Üretim",
  [SERVICE_CATEGORIES.SUPPLEMENT_MANUFACTURING]: "Gıda Takviyesi Üretimi",
  [SERVICE_CATEGORIES.CLEANING_MANUFACTURING]: "Temizlik Ürünleri Üretimi",
  [SERVICE_CATEGORIES.PACKAGING_SUPPLY]: "Ambalaj Tedariki",
  [SERVICE_CATEGORIES.ECOMMERCE_OPERATIONS]: "E-ticaret Operasyonları",
  [SERVICE_CATEGORIES.DIGITAL_MARKETING]: "Dijital Pazarlama",
  [SERVICE_CATEGORIES.DESIGN_SERVICES]: "Tasarım Hizmetleri",
  [SERVICE_CATEGORIES.FORMULATION_DEVELOPMENT]: "Formülasyon Geliştirme",
  [SERVICE_CATEGORIES.CONSULTATION]: "Danışmanlık",
  [SERVICE_CATEGORIES.CUSTOM]: "Özel Hizmet",
};

// Proforma durumları
export const PROFORMA_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

export const PROFORMA_STATUS_LABELS = {
  [PROFORMA_STATUS.DRAFT]: "Taslak",
  [PROFORMA_STATUS.SENT]: "Gönderildi",
  [PROFORMA_STATUS.ACCEPTED]: "Kabul Edildi",
  [PROFORMA_STATUS.REJECTED]: "Reddedildi",
  [PROFORMA_STATUS.EXPIRED]: "Süresi Doldu",
};

// Para birimleri
export const CURRENCIES = {
  TRY: "TRY",
  USD: "USD",
  EUR: "EUR",
};

// Hizmet şablonları
export const SERVICE_TEMPLATES = {
  [SERVICE_CATEGORIES.COSMETIC_MANUFACTURING]: [
    { name: "Formülasyon Geliştirme", unit: "Adet", price: 0 },
    { name: "Üretim (Minimum 1000 Adet)", unit: "Adet", price: 0 },
    { name: "Ambalajlama", unit: "Adet", price: 0 },
    { name: "Etiketleme", unit: "Adet", price: 0 },
    { name: "Kalite Kontrol", unit: "Parti", price: 0 },
  ],
  [SERVICE_CATEGORIES.SUPPLEMENT_MANUFACTURING]: [
    { name: "Formül Analizi", unit: "Adet", price: 0 },
    { name: "Üretim (Minimum 5000 Adet)", unit: "Adet", price: 0 },
    { name: "Kapsül/Tablet Üretimi", unit: "Adet", price: 0 },
    { name: "Ambalajlama", unit: "Kutu", price: 0 },
  ],
  [SERVICE_CATEGORIES.CLEANING_MANUFACTURING]: [
    { name: "Formülasyon", unit: "Adet", price: 0 },
    { name: "Üretim (Minimum 1000 Lt)", unit: "Litre", price: 0 },
    { name: "Şişeleme", unit: "Adet", price: 0 },
    { name: "Etiketleme", unit: "Adet", price: 0 },
  ],
  [SERVICE_CATEGORIES.PACKAGING_SUPPLY]: [
    { name: "Airless Şişe", unit: "Adet", price: 0 },
    { name: "Pompa Şişe", unit: "Adet", price: 0 },
    { name: "Disc Top Kapak", unit: "Adet", price: 0 },
    { name: "Özel Tasarım Ambalaj", unit: "Adet", price: 0 },
  ],
  [SERVICE_CATEGORIES.ECOMMERCE_OPERATIONS]: [
    { name: "Depo Yönetimi", unit: "Aylık", price: 0 },
    { name: "Kargo Operasyonları", unit: "Sipariş", price: 0 },
    { name: "Müşteri Hizmetleri", unit: "Aylık", price: 0 },
  ],
  [SERVICE_CATEGORIES.DIGITAL_MARKETING]: [
    { name: "Sosyal Medya Yönetimi", unit: "Aylık", price: 0 },
    { name: "İçerik Üretimi", unit: "Adet", price: 0 },
    { name: "Reklam Kampanyası", unit: "Kampanya", price: 0 },
  ],
  [SERVICE_CATEGORIES.DESIGN_SERVICES]: [
    { name: "Logo Tasarımı", unit: "Adet", price: 0 },
    { name: "Ambalaj Tasarımı", unit: "Adet", price: 0 },
    { name: "Web Tasarımı", unit: "Sayfa", price: 0 },
    { name: "3D Modelleme", unit: "Adet", price: 0 },
  ],
};

/**
 * Proforma Service
 * Proforma fiyat tekliflerinin yönetimi için servis sınıfı
 */
export const ProformaService = {
  /**
   * Yeni proforma oluştur
   */
  async createProforma(proformaData) {
    try {
      const proformaNumber = this.generateProformaNumber();

      const newProforma = {
        ...proformaData,
        proformaNumber,
        status: PROFORMA_STATUS.DRAFT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Toplam tutarı hesapla
        totalAmount: this.calculateTotal(proformaData.services || []),
        // PDF durumu
        pdfGenerated: false,
        pdfUrl: null,
      };

      const docId = await addDocument(PROFORMA_COLLECTION, newProforma);

      return {
        success: true,
        id: docId,
        proformaNumber,
      };
    } catch (error) {
      console.error("Error creating proforma:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Proforma güncelle
   */
  async updateProforma(id, updateData) {
    try {
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      // Eğer hizmetler güncellendiyse toplam tutarı yeniden hesapla
      if (updates.services) {
        updates.totalAmount = this.calculateTotal(updates.services);
      }

      await updateDocument(PROFORMA_COLLECTION, id, updates);

      return {
        success: true,
        id,
      };
    } catch (error) {
      console.error("Error updating proforma:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Proforma sil
   */
  async deleteProforma(id) {
    try {
      await deleteDocument(PROFORMA_COLLECTION, id);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting proforma:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Tek proforma getir
   */
  async getProforma(id) {
    try {
      const proforma = await getDocument(PROFORMA_COLLECTION, id);

      if (!proforma) {
        return {
          success: false,
          error: "Proforma bulunamadı",
        };
      }

      return {
        success: true,
        proforma: {
          id,
          ...proforma,
        },
      };
    } catch (error) {
      console.error("Error fetching proforma:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Tüm proformaları getir
   */
  async getProformas(filters = {}) {
    try {
      const queryOptions = {
        orderBy: ["createdAt", "desc"],
      };

      // Filtreler
      if (filters.companyId) {
        queryOptions.where = ["companyId", "==", filters.companyId];
      }
      if (filters.status) {
        queryOptions.where = queryOptions.where
          ? [...queryOptions.where, ["status", "==", filters.status]]
          : ["status", "==", filters.status];
      }

      const proformas = await getDocuments(PROFORMA_COLLECTION, queryOptions);

      return {
        success: true,
        proformas,
      };
    } catch (error) {
      console.error("Error fetching proformas:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Firmaya ait proformaları getir
   */
  async getProformasByCompany(companyId) {
    try {
      const proformas = await getDocuments(PROFORMA_COLLECTION, {
        where: ["companyId", "==", companyId],
        orderBy: ["createdAt", "desc"],
      });

      return {
        success: true,
        proformas,
      };
    } catch (error) {
      console.error("Error fetching company proformas:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Proforma durumunu güncelle
   */
  async updateProformaStatus(id, status) {
    try {
      await updateDocument(PROFORMA_COLLECTION, id, {
        status,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error updating proforma status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * PDF URL'sini güncelle
   */
  async updatePdfUrl(id, pdfUrl) {
    try {
      await updateDocument(PROFORMA_COLLECTION, id, {
        pdfUrl,
        pdfGenerated: true,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error updating PDF URL:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Proforma numarası oluştur
   */
  generateProformaNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const timestamp = Date.now().toString().slice(-6);

    return `PRF-${year}${month}${day}-${timestamp}`;
  },

  /**
   * Toplam tutarı hesapla
   */
  calculateTotal(services) {
    return services.reduce((total, service) => {
      const serviceTotal = (service.quantity || 0) * (service.unitPrice || 0);
      return total + serviceTotal;
    }, 0);
  },

  /**
   * Proforma istatistikleri
   */
  async getProformaStats() {
    try {
      const result = await this.getProformas();

      if (!result.success) {
        return result;
      }

      const proformas = result.proformas;
      const stats = {
        total: proformas.length,
        draft: proformas.filter((p) => p.status === PROFORMA_STATUS.DRAFT)
          .length,
        sent: proformas.filter((p) => p.status === PROFORMA_STATUS.SENT).length,
        accepted: proformas.filter((p) => p.status === PROFORMA_STATUS.ACCEPTED)
          .length,
        rejected: proformas.filter((p) => p.status === PROFORMA_STATUS.REJECTED)
          .length,
        totalValue: proformas.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
        acceptedValue: proformas
          .filter((p) => p.status === PROFORMA_STATUS.ACCEPTED)
          .reduce((sum, p) => sum + (p.totalAmount || 0), 0),
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("Error getting proforma stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Yardımcı fonksiyonlar
export const getServiceCategoryLabel = (category) => {
  return SERVICE_CATEGORY_LABELS[category] || category;
};

export const getProformaStatusLabel = (status) => {
  return PROFORMA_STATUS_LABELS[status] || status;
};

export const getServiceTemplate = (category) => {
  return SERVICE_TEMPLATES[category] || [];
};

export const formatPrice = (price, currency = CURRENCIES.TRY) => {
  const numPrice = Number(price) || 0;
  
  // Türkçe para birimi sembolü düzeltmesi
  if (currency === CURRENCIES.TRY) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice).replace('₺', '₺'); // Unicode ₺ sembolü
  }
  
  const formatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(numPrice);
};

export default ProformaService;
