/**
 * API çağrıları için authentication utility
 * Firebase ID token'ını otomatik olarak API request'lere ekler
 */
import { auth } from "../firebase";
import logger from "../utils/logger";

/**
 * Mevcut kullanıcının ID token'ını alır
 */
export const getCurrentUserToken = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    const idToken = await auth.currentUser.getIdToken(true);
    return idToken;
  } catch (error) {
    logger.error("Token alma hatası:", error.message);
    throw error;
  }
};

/**
 * API çağrıları için auth header'ları oluşturur
 */
export const createAuthHeaders = async (additionalHeaders = {}) => {
  try {
    const token = await getCurrentUserToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...additionalHeaders,
    };
  } catch (error) {
    logger.error("Auth headers oluşturulamadı:", error.message);
    throw error;
  }
};

/**
 * Authenticated fetch wrapper
 */
export const authenticatedFetch = async (url, options = {}) => {
  try {
    const headers = await createAuthHeaders(options.headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 401 durumunda kullanıcıyı login sayfasına yönlendir
    if (response.status === 401) {
      logger.warn("Authentication failed, redirecting to login");
      // Bu kısmı router ile yapabilirsiniz veya window.location kullanabilirsiniz
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new Error("Authentication failed");
    }

    return response;
  } catch (error) {
    logger.error("Authenticated fetch error:", error.message);
    throw error;
  }
};

/**
 * Shopify API çağrıları için utility fonksiyonlar
 */
export const shopifyApi = {
  // Tüm entegrasyonları getir
  async getIntegrations(companyId = null) {
    const url = companyId
      ? `/api/admin/integrations/shopify?companyId=${companyId}`
      : "/api/admin/integrations/shopify";

    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error("Entegrasyonlar getirilemedi");
    }

    return response.json();
  },

  // Yeni entegrasyon oluştur
  async createIntegration(data) {
    const response = await authenticatedFetch(
      "/api/admin/integrations/shopify",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Entegrasyon oluşturulamadı");
    }

    return response.json();
  },

  // Entegrasyon detaylarını getir
  async getIntegration(integrationId) {
    const response = await authenticatedFetch(
      `/api/admin/integrations/shopify/${integrationId}`
    );

    if (!response.ok) {
      throw new Error("Entegrasyon detayları getirilemedi");
    }

    return response.json();
  },

  // Entegrasyonu güncelle
  async updateIntegration(integrationId, data) {
    const response = await authenticatedFetch(
      `/api/admin/integrations/shopify/${integrationId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Entegrasyon güncellenemedi");
    }

    return response.json();
  },

  // Entegrasyonu sil
  async deleteIntegration(integrationId) {
    const response = await authenticatedFetch(
      `/api/admin/integrations/shopify/${integrationId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Entegrasyon silinemedi");
    }

    return response.json();
  },

  // Bağlantı testi
  async testConnection(credentials) {
    const response = await authenticatedFetch(
      "/api/admin/integrations/shopify/test",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Bağlantı testi başarısız");
    }

    return response.json();
  },

  // Sipariş senkronizasyonu
  async syncOrders(integrationId) {
    const response = await authenticatedFetch(
      `/api/admin/integrations/shopify/${integrationId}/sync`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sipariş senkronizasyonu başarısız");
    }

    return response.json();
  },

  // Entegrasyon siparişlerini getir
  async getOrders(integrationId, page = 1, limit = 50) {
    const response = await authenticatedFetch(
      `/api/admin/integrations/shopify/${integrationId}/sync?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Siparişler getirilemedi");
    }

    return response.json();
  },
};

/**
 * Error handling için utility
 */
export const handleApiError = (error) => {
  logger.error("API Error:", error.message);

  // Auth hataları
  if (
    error.message.includes("Authentication") ||
    error.message.includes("auth")
  ) {
    return {
      type: "auth",
      message: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.",
      action: "redirect_login",
    };
  }

  // Permission hataları
  if (
    error.message.includes("Permission") ||
    error.message.includes("Forbidden")
  ) {
    return {
      type: "permission",
      message: "Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır.",
      action: "show_message",
    };
  }

  // Network hataları
  if (error.message.includes("Network") || error.message.includes("fetch")) {
    return {
      type: "network",
      message: "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.",
      action: "retry",
    };
  }

  // Genel hata
  return {
    type: "general",
    message: error.message || "Beklenmedik bir hata oluştu.",
    action: "show_message",
  };
};
