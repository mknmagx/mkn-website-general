/**
 * Shopify Integration Toast Notifications
 * Centralized notification system for Shopify operations
 */

import { toast } from "../../hooks/use-toast";
import logger from "./logger";

class ShopifyNotifications {
  // Success notifications
  static success = {
    integrationCreated: (shopDomain) => {
      toast({
        title: "Entegrasyon Başarılı",
        description: `${shopDomain} Shopify mağazası başarıyla entegre edildi`,
        variant: "default",
      });
    },

    integrationUpdated: (shopDomain) => {
      toast({
        title: "Entegrasyon Güncellendi",
        description: `${shopDomain} entegrasyon ayarları güncellendi`,
        variant: "default",
      });
    },

    ordersSynced: (count, shopDomain) => {
      toast({
        title: "Siparişler Senkronize Edildi",
        description: `${count} sipariş ${shopDomain} mağazasından başarıyla senkronize edildi`,
        variant: "default",
      });
    },

    customersSynced: (count) => {
      toast({
        title: "Müşteriler Senkronize Edildi",
        description: `${count} müşteri bilgisi başarıyla senkronize edildi`,
        variant: "default",
      });
    },

    returnsSynced: (count) => {
      toast({
        title: "İadeler Senkronize Edildi",
        description: `${count} iade kaydı başarıyla senkronize edildi`,
        variant: "default",
      });
    },

    connectionTested: (shopName) => {
      toast({
        title: "Bağlantı Başarılı",
        description: `${shopName} mağazasına bağlantı başarıyla test edildi`,
        variant: "default",
      });
    },

    integrationDeleted: () => {
      toast({
        title: "Entegrasyon Silindi",
        description: "Shopify entegrasyonu başarıyla kaldırıldı",
        variant: "default",
      });
    }
  };

  // Error notifications
  static error = {
    connectionFailed: (shopDomain, errorMessage) => {
      logger.error("Shopify connection failed:", { shopDomain, errorMessage });
      toast({
        title: "Bağlantı Hatası",
        description: `${shopDomain} mağazasına bağlanılamadı: ${errorMessage}`,
        variant: "destructive",
      });
    },

    integrationCreateFailed: (errorMessage) => {
      logger.error("Integration creation failed:", errorMessage);
      toast({
        title: "Entegrasyon Oluşturulamadı",
        description: `Entegrasyon oluşturulurken hata: ${errorMessage}`,
        variant: "destructive",
      });
    },

    syncFailed: (type, errorMessage) => {
      logger.error(`${type} sync failed:`, errorMessage);
      const typeNames = {
        orders: "Sipariş",
        customers: "Müşteri", 
        returns: "İade"
      };
      toast({
        title: `${typeNames[type]} Senkronizasyon Hatası`,
        description: `${typeNames[type]} senkronizasyonu başarısız: ${errorMessage}`,
        variant: "destructive",
      });
    },

    apiError: (operation, statusCode, errorMessage) => {
      logger.error("Shopify API error:", { operation, statusCode, errorMessage });
      toast({
        title: "API Hatası",
        description: `Shopify API hatası (${statusCode}): ${errorMessage}`,
        variant: "destructive",
      });
    },

    integrationNotFound: () => {
      toast({
        title: "Entegrasyon Bulunamadı",
        description: "İstenen Shopify entegrasyonu bulunamadı",
        variant: "destructive",
      });
    },

    permissionDenied: () => {
      toast({
        title: "İzin Hatası",
        description: "Bu işlem için yeterli izniniz bulunmuyor",
        variant: "destructive",
      });
    },

    generalError: (errorMessage) => {
      logger.error("General Shopify error:", errorMessage);
      toast({
        title: "İşlem Başarısız",
        description: errorMessage || "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Warning notifications
  static warning = {
    partialSync: (syncedCount, totalCount, type) => {
      toast({
        title: "Kısmi Senkronizasyon",
        description: `${syncedCount}/${totalCount} ${type} senkronize edildi. Bazı kayıtlarda sorun var.`,
        variant: "default",
      });
    },

    noDataFound: (type) => {
      toast({
        title: "Veri Bulunamadı",
        description: `Senkronize edilecek ${type} bulunamadı`,
        variant: "default",
      });
    },

    rateLimitWarning: () => {
      toast({
        title: "API Limit Uyarısı",
        description: "Shopify API limit yaklaşıyor, işlemler yavaşlatılabilir",
        variant: "default",
      });
    }
  };

  // Info notifications
  static info = {
    syncStarted: (type) => {
      toast({
        title: "Senkronizasyon Başladı",
        description: `${type} senkronizasyonu başlatıldı`,
        variant: "default",
      });
    },

    integrationStatus: (status, shopDomain) => {
      const statusMessages = {
        active: `${shopDomain} entegrasyonu aktif`,
        inactive: `${shopDomain} entegrasyonu pasif`,
        error: `${shopDomain} entegrasyonunda hata var`
      };
      toast({
        title: "Entegrasyon Durumu",
        description: statusMessages[status] || `${shopDomain} durumu: ${status}`,
        variant: "default",
      });
    }
  };
}

export default ShopifyNotifications;