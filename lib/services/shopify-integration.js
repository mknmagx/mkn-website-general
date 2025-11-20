/**
 * Shopify Integration Service
 * Müşteri bazlı Shopify API bağlantıları ve işlemleri
 */

import { adminFirestore } from "../firebase-admin";
import logger from "../utils/logger";
import ShopifyNotifications from "../utils/shopify-notifications";
import crypto from "crypto";

// Firestore Koleksiyonları
const INTEGRATIONS_COLLECTION = "integrations";
const SHOPIFY_ORDERS_COLLECTION = "shopify_orders";
const SHOPIFY_CUSTOMERS_COLLECTION = "shopify_customers";
const SHOPIFY_RETURNS_COLLECTION = "shopify_returns";

// Raw data collections - API'den gelen tam response
const SHOPIFY_RAW_ORDERS_COLLECTION = "shopify_raw_orders";
const SHOPIFY_RAW_CUSTOMERS_COLLECTION = "shopify_raw_customers";
const SHOPIFY_RAW_PRODUCTS_COLLECTION = "shopify_raw_products";

// Webhook collections
const SHOPIFY_WEBHOOKS_COLLECTION = "shopify_webhooks";
const WEBHOOK_EVENTS_COLLECTION = "webhook_events";

export class ShopifyIntegrationService {
  constructor() {
    this.apiVersion = "2025-10"; // Default, her integration kendi version'ını override edebilir

    // Webhook endpoint - sadece base URL environment'tan gelir
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://mkngroup.com.tr";
    this.webhookEndpoint = `${baseUrl}/api/admin/integrations/shopify/webhooks/receiver`;

    logger.info(
      `Shopify service initialized. Webhook endpoint: ${this.webhookEndpoint}`
    );
  }

  /**
   * Mevcut integration'lar için webhook secret'larını oluştur
   * Migration fonksiyonu - bir kere çalıştırılmalı
   */
  async migrateWebhookSecrets() {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      logger.info("Starting webhook secrets migration...");
      
      const integrationsSnapshot = await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .where("provider", "==", "shopify")
        .where("status", "==", "active")
        .get();

      const updates = [];
      let updated = 0;
      let skipped = 0;

      for (const doc of integrationsSnapshot.docs) {
        const integration = doc.data();
        
        // Zaten webhook secret'ı varsa atla
        if (integration.credentials?.webhookSecret) {
          skipped++;
          continue;
        }

        // Yeni secret oluştur
        const webhookSecret = this.generateWebhookSecret();
        
        updates.push({
          id: doc.id,
          secret: webhookSecret
        });
      }

      // Batch update
      for (const update of updates) {
        await this.updateIntegration(update.id, {
          'credentials.webhookSecret': update.secret,
          webhookSecretMigratedAt: new Date()
        });
        updated++;
        
        logger.info(`Updated webhook secret for integration: ${update.id}`);
      }

      logger.info(`Webhook secrets migration completed:`, {
        total: integrationsSnapshot.docs.length,
        updated,
        skipped
      });

      return {
        success: true,
        total: integrationsSnapshot.docs.length,
        updated,
        skipped
      };

    } catch (error) {
      logger.error("Error during webhook secrets migration:", error);
      throw error;
    }
  }

  /**
   * Güvenli webhook secret oluştur
   * @returns {string} 32-byte hex string
   */
  generateWebhookSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Integration için webhook secret'ını al veya oluştur
   * @param {string} integrationId - Integration ID
   * @returns {string} Webhook secret
   */
  async ensureWebhookSecret(integrationId) {
    try {
      const integration = await this.getIntegration(integrationId);
      
      // Zaten webhook secret varsa onu kullan
      if (integration?.credentials?.webhookSecret) {
        return integration.credentials.webhookSecret;
      }

      // Yoksa yeni secret oluştur ve kaydet
      const webhookSecret = this.generateWebhookSecret(integrationId);
      
      await this.updateIntegration(integrationId, {
        'credentials.webhookSecret': webhookSecret,
        webhookSecretUpdatedAt: new Date()
      });

      logger.info(`Generated new webhook secret for integration ${integrationId}`);
      return webhookSecret;
    } catch (error) {
      logger.error(`Error ensuring webhook secret for integration ${integrationId}:`, error);
      throw error;
    }
  }

  /**
   * Entegrasyonu güncelle
   */
  async updateIntegration(integrationId, updateData) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .doc(integrationId)
        .update({
          ...updateData,
          updatedAt: new Date(),
        });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Integration'dan API credential'larını al
   * @param {string} integrationId - Integration document ID
   * @param {Array} requiredFields - Required credential fields (optional)
   */
  async getIntegrationCredentials(integrationId, requiredFields = null) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const integrationDoc = await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .doc(integrationId)
        .get();

      if (!integrationDoc.exists) {
        throw new Error(`Integration bulunamadı: ${integrationId}`);
      }

      const integration = integrationDoc.data();
      const credentials = integration.credentials;

      if (!credentials) {
        throw new Error(`Integration credentials bulunamadı: ${integrationId}`);
      }

      // Eğer belirli field'lar talep edilmişse sadece onları kontrol et
      if (requiredFields && requiredFields.length > 0) {
        const missingFields = requiredFields.filter(
          (field) => !credentials[field]
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Eksik credential'lar: ${missingFields.join(
              ", "
            )}. Lütfen integration ayarlarını tamamlayın.`
          );
        }
      } else {
        // Default: Tüm credential'ları kontrol et
        const defaultRequiredFields = [
          "shopDomain",
          "accessToken",
          "apiKey",
          "apiSecret",
        ];
        const missingFields = defaultRequiredFields.filter(
          (field) => !credentials[field]
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Eksik credential'lar: ${missingFields.join(
              ", "
            )}. Lütfen integration ayarlarını tamamlayın.`
          );
        }
      }

      return {
        shopDomain: credentials.shopDomain,
        accessToken: credentials.accessToken,
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        webhookSecret:
          credentials.webhookSecret ||
          this.generateWebhookSecret(integrationId),
        apiVersion:
          integration.settings?.apiVersion ||
          credentials.apiVersion ||
          "2025-10",
      };
    } catch (error) {
      logger.error(`Error getting integration credentials:`, error);
      throw error;
    }
  }

  /**
   * Integration credential'larını güncelle
   */
  async updateIntegrationCredentials(integrationId, newCredentials) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const updateData = {
        credentials: newCredentials,
        updatedAt: new Date(),
      };

      await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .doc(integrationId)
        .update(updateData);

      logger.info(`Integration credentials updated: ${integrationId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating integration credentials:`, error);
      throw error;
    }
  }

  /**
   * Test connection using database credentials
   * @param {string} integrationId - Integration document ID
   * @returns {Object} Result with success flag and shop info or error
   */
  async testConnection(integrationId) {
    try {
      // Get integration credentials from database
      const credentials = await this.getIntegrationCredentials(integrationId, [
        "shopDomain",
        "accessToken",
      ]);

      const { shopDomain, accessToken, apiVersion } = credentials;

      // Normalize shop domain
      let normalizedDomain = shopDomain;
      if (!normalizedDomain.includes(".myshopify.com")) {
        normalizedDomain = `${normalizedDomain}.myshopify.com`;
      }

      const shopName = normalizedDomain.replace(".myshopify.com", "");

      // Test API call to get shop info
      const shopifyUrl = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/shop.json`;

      const response = await fetch(shopifyUrl, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        let errorMessage = "Shopify API bağlantı hatası";
        let details = { statusCode: response.status, shopName, apiVersion };

        if (response.status === 401) {
          errorMessage = "Geçersiz access token veya yetersiz izinler";
          details.suggestions = [
            "Access token'ın doğru olduğunu kontrol edin",
            "Private app'in aktif olduğunu kontrol edin",
            "Admin API erişim izinlerini kontrol edin",
          ];
        } else if (response.status === 404) {
          errorMessage = "Shop domain bulunamadı";
          details.suggestions = ["Shop domain'in doğru olduğunu kontrol edin"];
        }

        return {
          success: false,
          error: errorMessage,
          details,
        };
      }

      const shopData = await response.json();

      return {
        success: true,
        shopInfo: shopData.shop,
        message: "Bağlantı başarılı",
      };
    } catch (error) {
      logger.error("Shopify test connection error:", error);

      return {
        success: false,
        error: error.message || "Bağlantı testi başarısız",
        details: {
          integrationId,
          originalError: error.toString(),
        },
      };
    }
  }

  /**
   * Get shop information using database credentials
   * @param {string} integrationId - Integration document ID
   * @returns {Object|null} Shop information or null
   */
  async getShopInfo(integrationId) {
    try {
      const credentials = await this.getIntegrationCredentials(integrationId, [
        "shopDomain",
        "accessToken",
      ]);
      const { shopDomain, accessToken, apiVersion } = credentials;

      let normalizedDomain = shopDomain;
      if (!normalizedDomain.includes(".myshopify.com")) {
        normalizedDomain = `${normalizedDomain}.myshopify.com`;
      }

      const shopName = normalizedDomain.replace(".myshopify.com", "");
      const shopifyUrl = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/shop.json`;

      const response = await fetch(shopifyUrl, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.shop;
      }

      return null;
    } catch (error) {
      logger.error("Error getting shop info:", error);
      return null;
    }
  }

  /**
   * Shopify API çağrısı yap (credential'lar ile)
   */
  async makeShopifyRequest(integrationId, endpoint, options = {}) {
    try {
      const credentials = await this.getIntegrationCredentials(integrationId);

      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }

      const shopName = shopDomain.replace(".myshopify.com", "");
      const url = `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/${endpoint}`;

      const defaultOptions = {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`Shopify API request failed for ${integrationId}:`, error);
      throw error;
    }
  }

  /**
   * Entegrasyonu getir
   */
  async getIntegration(integrationId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const integrationDoc = await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .doc(integrationId)
        .get();

      if (!integrationDoc.exists) {
        return null;
      }

      return { id: integrationDoc.id, ...integrationDoc.data() };
    } catch (error) {
      logger.error("Error getting integration:", error);
      throw error;
    }
  }

  /**
   * Tüm entegrasyonları getir
   */
  async getAllIntegrations(companyId = null) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      logger.info("getAllIntegrations called", { companyId });

      let query = adminFirestore.collection(INTEGRATIONS_COLLECTION);

      // Şirket ID'si varsa filtrele
      if (companyId) {
        query = query.where("companyId", "==", companyId);
        logger.info("Filtering by companyId", { companyId });
      }

      // Shopify entegrasyonlarını getir (platform field'ını kullan)
      query = query.where("platform", "==", "shopify");

      const integrationsSnapshot = await query.get();

      // Eğer hiç entegrasyon yoksa, tüm entegrasyonları kontrol et (sadece debug için)
      if (
        integrationsSnapshot.empty &&
        process.env.NODE_ENV === "development"
      ) {
        logger.info("No Shopify integrations found, checking all integrations");
        const allIntegrationsSnapshot = await adminFirestore
          .collection(INTEGRATIONS_COLLECTION)
          .get();

        logger.info("All integrations count:", {
          total: allIntegrationsSnapshot.size,
        });
      }

      const integrations = integrationsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Frontend için gerekli field'ları normalize et
          shopDomain: data.credentials?.shopDomain || "",
          companyName: data.companyName || data.customerName || "",
          companyEmail: data.companyEmail || data.customerEmail || "",
          ordersCount: data.lastSyncOrderCount || 0,
          platform: data.platform || "shopify",
        };
      });

      logger.info("Returning integrations", { count: integrations.length });
      return integrations;
    } catch (error) {
      logger.error("Error getting all integrations:", error);
      throw error;
    }
  }

  /**
   * Şirket entegrasyonlarını getir
   */
  async getCompanyIntegrations(companyId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const integrationsSnapshot = await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .where("companyId", "==", companyId)
        .where("platform", "==", "shopify") // type yerine platform kullan
        .get();

      return integrationsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Frontend için gerekli field'ları normalize et
          shopDomain: data.credentials?.shopDomain || "",
          companyName: data.companyName || data.customerName || "",
          companyEmail: data.companyEmail || data.customerEmail || "",
          ordersCount: data.lastSyncOrderCount || 0,
          platform: data.platform || "shopify",
        };
      });
    } catch (error) {
      logger.error("Error getting company integrations:", error);
      throw error;
    }
  }

  /**
   * Yeni entegrasyon oluştur
   */
  async createIntegration(companyId, credentials, settings, userId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      // Shopify bağlantısını test et
      await this.testShopifyConnection(credentials);

      const integrationData = {
        companyId,
        platform: "shopify", // type yerine platform kullan
        name: credentials.shopName || credentials.shopDomain,
        credentials: {
          shopDomain: credentials.shopDomain,
          accessToken: credentials.accessToken,
          apiVersion: credentials.apiVersion || this.apiVersion,
        },
        settings: settings || {
          autoSync: true,
          syncInterval: 30, // dakika
          webhooks: {
            orders: true,
            customers: true,
            products: false,
          },
          syncOrders: true,
          syncReturns: true,
          autoFulfillment: false,
        },
        status: "active",
        lastSyncAt: null,
        lastSyncOrderCount: 0,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .add(integrationData);

      const integrationId = docRef.id;
      const integration = { id: integrationId, ...integrationData };

      // Webhook'ları otomatik kur (eğer settings'te webhook aktifse)
      if (
        settings?.webhooks &&
        Object.values(settings.webhooks).some(Boolean)
      ) {
        try {
          logger.info(
            `Setting up webhooks for new integration ${integrationId}`
          );
          await this.setupWebhooks(integrationId, {
            orders: {
              create: settings.webhooks.orders || false,
              update: settings.webhooks.orders || false,
              paid: settings.webhooks.orders || false,
              fulfilled: settings.webhooks.orders || false,
              cancelled: settings.webhooks.orders || false,
            },
            customers: {
              create: settings.webhooks.customers || false,
              update: settings.webhooks.customers || false,
            },
            app: {
              uninstalled: true, // Her zaman aktif
            },
          });
          logger.info(
            `Webhooks setup completed for integration ${integrationId}`
          );
        } catch (webhookError) {
          logger.warn(
            `Webhook setup failed for integration ${integrationId}:`,
            webhookError
          );
          // Webhook hatası entegrasyon oluşumunu engellemez
        }
      }

      return integration;
    } catch (error) {
      logger.error("Error creating integration:", error);
      throw error;
    }
  }

  /**
   * Shopify bağlantısını test et
   */
  async testShopifyConnection(credentials) {
    try {
      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }

      const shopName = shopDomain.replace(".myshopify.com", "");
      const testUrl = `https://${shopName}.myshopify.com/admin/api/${
        credentials.apiVersion || this.apiVersion
      }/shop.json`;

      const response = await fetch(testUrl, {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Shopify API hatası: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data.shop;
    } catch (error) {
      logger.error("Shopify connection test failed:", error);
      throw new Error(`Shopify bağlantısı başarısız: ${error.message}`);
    }
  }

  /**
   * Shopify siparişlerini senkronize et
   */
  async syncOrders(integrationId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const integrationDoc = await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .doc(integrationId)
        .get();

      if (!integrationDoc.exists) {
        throw new Error("Entegrasyon bulunamadı");
      }

      const integration = integrationDoc.data();
      const { credentials } = integration;

      // Shopify domain'ini normalize et
      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }

      const shopName = shopDomain.replace(".myshopify.com", "");

      logger.info(`Starting order sync for integration ${integrationId}`, {
        shopDomain,
        apiVersion: credentials.apiVersion,
      });

      // API bağlantısını test et
      await this.validateApiConnection(credentials, shopName);

      // Siparişleri çek - pagination ile
      const allOrders = await this.fetchAllOrders(credentials, shopName);

      // Siparişleri kaydet
      const savedCount = await this.saveOrdersBatch(
        integrationId,
        integration.companyId,
        allOrders,
        credentials
      );

      // Son senkronizasyon zamanını güncelle
      await this.updateIntegration(integrationId, {
        lastSyncAt: new Date(),
        lastSyncOrderCount: savedCount,
      });

      logger.info(
        `Successfully synced ${savedCount}/${allOrders.length} orders for integration ${integrationId}`
      );
      return savedCount;
    } catch (error) {
      logger.error("Order sync error:", error);
      throw error;
    }
  }

  /**
   * API bağlantısını doğrula
   */
  async validateApiConnection(credentials, shopName) {
    try {
      const testUrl = `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/shop.json`;

      const response = await fetch(testUrl, {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API validation failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      logger.info("API connection validated", { shopName: data.shop?.name });
      return true;
    } catch (error) {
      logger.error("API connection validation failed:", error);
      throw error;
    }
  }

  /**
   * Tüm siparişleri çek - pagination ile
   */
  async fetchAllOrders(credentials, shopName) {
    try {
      const allOrders = [];
      let pageInfo = null;
      let hasNextPage = true;

      while (hasNextPage && allOrders.length < 1000) {
        // Maksimum 1000 sipariş
        const url = this.buildOrdersUrl(credentials, shopName, pageInfo);

        const response = await fetch(url, {
          headers: {
            "X-Shopify-Access-Token": credentials.accessToken,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Orders API error: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        const orders = data.orders || [];

        allOrders.push(...orders);

        // Link header'dan pagination bilgisini al
        const linkHeader = response.headers.get("Link");
        pageInfo = this.parsePageInfo(linkHeader);
        hasNextPage = pageInfo && pageInfo.hasNext;

        logger.info(
          `Fetched ${orders.length} orders, total: ${allOrders.length}`
        );

        // Rate limiting için kısa bekleme
        if (hasNextPage) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      logger.info(`Total orders fetched: ${allOrders.length}`);
      return allOrders;
    } catch (error) {
      logger.error("Error fetching orders:", error);
      throw error;
    }
  }

  /**
   * Link header'dan pagination bilgisini parse et
   */
  parsePageInfo(linkHeader) {
    if (!linkHeader) return null;

    const links = linkHeader.split(",");
    let nextPageInfo = null;
    let hasNext = false;

    for (const link of links) {
      if (link.includes('rel="next"')) {
        hasNext = true;
        const match = link.match(/page_info=([^&>]+)/);
        if (match) {
          nextPageInfo = match[1];
        }
        break;
      }
    }

    return hasNext ? { hasNext, nextPageInfo } : null;
  }

  /**
   * Siparişleri toplu olarak kaydet
   */
  async saveOrdersBatch(integrationId, companyId, orders, credentials) {
    let savedCount = 0;

    for (const order of orders) {
      try {
        await this.saveOrder(integrationId, companyId, order, credentials);
        savedCount++;
      } catch (orderError) {
        logger.error(`Order save error for order ${order.id}:`, orderError);
        // Hata olsa bile diğer siparişleri kaydetmeye devam et
      }
    }

    return savedCount;
  }

  /**
   * Siparişi Firestore'a kaydet - İki aşamalı: Raw + Processed
   */
  async saveOrder(
    integrationId,
    companyId,
    shopifyOrder,
    apiCredentials = null
  ) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      // 1. RAW DATA KAYDETME - API'den gelen tam response
      await this.saveRawOrderData(integrationId, companyId, shopifyOrder);

      // 2. PROCESSED DATA KAYDETME - İşlenmiş sipariş bilgileri
      await this.saveProcessedOrderData(
        integrationId,
        companyId,
        shopifyOrder,
        apiCredentials
      );
    } catch (error) {
      logger.error(`Error saving order ${shopifyOrder.id}:`, error);
      throw error;
    }
  }

  /**
   * Raw order data'yı kaydet
   */
  async saveRawOrderData(integrationId, companyId, shopifyOrder) {
    try {
      const rawOrderData = {
        integrationId,
        companyId,
        shopifyOrderId: shopifyOrder.id.toString(),
        rawResponse: shopifyOrder, // API'den gelen tam response
        syncedAt: new Date(),
        dataType: "order",
        apiVersion: this.apiVersion,
      };

      // Raw data'yı kontrol et
      const existingRawOrders = await adminFirestore
        .collection(SHOPIFY_RAW_ORDERS_COLLECTION)
        .where("shopifyOrderId", "==", shopifyOrder.id.toString())
        .where("integrationId", "==", integrationId)
        .limit(1)
        .get();

      if (existingRawOrders.empty) {
        await adminFirestore
          .collection(SHOPIFY_RAW_ORDERS_COLLECTION)
          .add(rawOrderData);
      } else {
        const existingRawRef = existingRawOrders.docs[0].ref;
        await existingRawRef.update({
          rawResponse: shopifyOrder,
          syncedAt: new Date(),
          lastUpdatedAt: new Date(),
        });
      }
    } catch (error) {
      logger.error(`Error saving raw order data ${shopifyOrder.id}:`, error);
      throw error;
    }
  }

  /**
   * Processed order data'yı kaydet
   */
  async saveProcessedOrderData(
    integrationId,
    companyId,
    shopifyOrder,
    apiCredentials
  ) {
    try {
      // API credentials'ları işlem içinde kullanabilmek için
      let credentials = apiCredentials;
      let shopName = "";

      if (!credentials) {
        // Eğer credentials yoksa integration'dan al
        const integrationDoc = await adminFirestore
          .collection(INTEGRATIONS_COLLECTION)
          .doc(integrationId)
          .get();

        if (integrationDoc.exists) {
          credentials = integrationDoc.data().credentials;
          let shopDomain = credentials.shopDomain;
          if (!shopDomain.includes(".myshopify.com")) {
            shopDomain = `${shopDomain}.myshopify.com`;
          }
          shopName = shopDomain.replace(".myshopify.com", "");
        }
      } else {
        let shopDomain = credentials.shopDomain;
        if (!shopDomain.includes(".myshopify.com")) {
          shopDomain = `${shopDomain}.myshopify.com`;
        }
        shopName = shopDomain.replace(".myshopify.com", "");
      }

      logger.info(`Processing order ${shopifyOrder.id}`, {
        orderNumber: shopifyOrder.order_number,
        customerEmail: shopifyOrder.customer?.email,
        totalPrice: shopifyOrder.total_price,
      });

      // Customer ve address bilgilerini enhanced fetch ile al
      await this.enhanceOrderWithCustomerData(
        shopifyOrder,
        credentials,
        shopName
      );

      // Processed order data
      const orderData = {
        integrationId,
        companyId,
        shopifyOrderId: shopifyOrder.id.toString(),
        orderNumber: shopifyOrder.order_number || shopifyOrder.number,
        name: shopifyOrder.name || "",
        email: shopifyOrder.email || shopifyOrder.contact_email || null,
        customerName: this.getCustomerName(shopifyOrder),
        customerEmail:
          shopifyOrder.customer?.email ||
          shopifyOrder.email ||
          shopifyOrder.contact_email ||
          null,
        customerId: shopifyOrder.customer?.id || null,
        customerState: shopifyOrder.customer?.state || null,
        totalPrice: parseFloat(shopifyOrder.total_price) || 0,
        currency: shopifyOrder.currency || "USD",
        financialStatus: shopifyOrder.financial_status || "",
        fulfillmentStatus: shopifyOrder.fulfillment_status || "",
        lineItems: this.processLineItems(shopifyOrder.line_items || []),
        tags: this.processTags(shopifyOrder.tags),
        shippingAddress: this.processAddress(
          shopifyOrder.shipping_address,
          shopifyOrder.customer
        ),
        billingAddress: this.processAddress(
          shopifyOrder.billing_address,
          shopifyOrder.customer
        ),
        fulfillments: this.processFulfillments(shopifyOrder.fulfillments || []),
        trackingInfo: this.getTrackingInfo(shopifyOrder.fulfillments),
        note: shopifyOrder.note || null,
        phone: shopifyOrder.phone || null,
        sourceName: shopifyOrder.source_name || null,
        browserInfo: {
          ip: shopifyOrder.browser_ip,
          userAgent: shopifyOrder.client_details?.user_agent,
          language:
            shopifyOrder.client_details?.accept_language ||
            shopifyOrder.customer_locale,
        },
        createdAt: new Date(shopifyOrder.created_at),
        updatedAt: new Date(shopifyOrder.updated_at),
        syncedAt: new Date(),
      };

      // Clean undefined values
      const cleanOrderData = this.removeUndefinedValues(orderData);

      // Mevcut processed order'ı kontrol et
      const existingOrders = await adminFirestore
        .collection(SHOPIFY_ORDERS_COLLECTION)
        .where("shopifyOrderId", "==", shopifyOrder.id.toString())
        .where("integrationId", "==", integrationId)
        .get();

      if (existingOrders.empty) {
        await adminFirestore
          .collection(SHOPIFY_ORDERS_COLLECTION)
          .add(cleanOrderData);
        logger.info(`New order saved: ${shopifyOrder.id}`);
      } else {
        const existingOrderRef = existingOrders.docs[0].ref;
        const updateData = this.removeUndefinedValues({
          ...orderData,
          updatedAt: new Date(),
          syncedAt: new Date(),
        });
        await existingOrderRef.update(updateData);
        logger.info(`Order updated: ${shopifyOrder.id}`);
      }

      // Customer'ı ayrı kaydet
      if (shopifyOrder.customer) {
        await this.saveCustomerData(
          integrationId,
          companyId,
          shopifyOrder.customer
        );
      }
    } catch (error) {
      logger.error(
        `Error saving processed order data ${shopifyOrder.id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Customer ve address bilgilerini enhanced şekilde al
   */
  async enhanceOrderWithCustomerData(shopifyOrder, credentials, shopName) {
    try {
      // Eğer customer disabled veya email eksikse, full customer data'yı çek
      if (
        shopifyOrder.customer?.id &&
        (shopifyOrder.customer?.state === "disabled" ||
          !shopifyOrder.customer?.email)
      ) {
        logger.info(
          `Enhancing customer data for customer ${shopifyOrder.customer.id}`
        );

        try {
          const customerResponse = await fetch(
            `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/customers/${shopifyOrder.customer.id}.json`,
            {
              headers: {
                "X-Shopify-Access-Token": credentials.accessToken,
                "Content-Type": "application/json",
              },
            }
          );

          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            if (customerData.customer) {
              // Customer bilgilerini birleştir
              shopifyOrder.customer = {
                ...shopifyOrder.customer,
                ...customerData.customer,
              };

              logger.info(
                `Enhanced customer data retrieved for ${shopifyOrder.customer.id}`
              );
            }
          }
        } catch (customerError) {
          logger.warn(
            `Customer enhancement failed for ${shopifyOrder.customer.id}:`,
            customerError.message
          );
        }
      }

      // GDPR korumalı customer için address'lerden bilgi al
      if (
        shopifyOrder.customer &&
        !shopifyOrder.customer.email &&
        !shopifyOrder.customer.first_name
      ) {
        this.extractCustomerInfoFromAddresses(shopifyOrder);
      }

      // Eğer hala email yoksa, checkout API'sini dene
      if (
        !shopifyOrder.email &&
        !shopifyOrder.contact_email &&
        shopifyOrder.checkout_token
      ) {
        await this.enhanceFromCheckout(shopifyOrder, credentials, shopName);
      }

      // Order level email'i güncelle
      if (
        shopifyOrder.customer?.email &&
        !shopifyOrder.email &&
        !shopifyOrder.contact_email
      ) {
        shopifyOrder.email = shopifyOrder.customer.email;
      }
    } catch (error) {
      logger.error("Error enhancing order with customer data:", error.message);
    }
  }

  /**
   * Address'lerden customer bilgilerini çıkar
   */
  extractCustomerInfoFromAddresses(shopifyOrder) {
    const addresses = [
      shopifyOrder.customer?.default_address,
      shopifyOrder.shipping_address,
      shopifyOrder.billing_address,
    ].filter(Boolean);

    for (const addr of addresses) {
      if (!shopifyOrder.customer.first_name && addr.first_name) {
        shopifyOrder.customer.first_name = addr.first_name;
      }
      if (!shopifyOrder.customer.last_name && addr.last_name) {
        shopifyOrder.customer.last_name = addr.last_name;
      }
      if (!shopifyOrder.customer.phone && addr.phone) {
        shopifyOrder.customer.phone = addr.phone;
      }
      if (!shopifyOrder.customer.company && addr.company) {
        shopifyOrder.customer.company = addr.company;
      }
    }

    // Eğer hala bilgi yoksa GDPR protected olarak işaretle
    if (!shopifyOrder.customer.first_name && !shopifyOrder.customer.last_name) {
      shopifyOrder.customer.first_name = "GDPR";
      shopifyOrder.customer.last_name = "Protected Customer";
      shopifyOrder.customer.gdpr_protected = true;
    }
  }

  /**
   * Checkout API'sinden bilgi al
   */
  async enhanceFromCheckout(shopifyOrder, credentials, shopName) {
    try {
      const checkoutResponse = await fetch(
        `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/checkouts/${shopifyOrder.checkout_token}.json`,
        {
          headers: {
            "X-Shopify-Access-Token": credentials.accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (checkoutResponse.ok) {
        const checkoutData = await checkoutResponse.json();

        if (checkoutData.checkout?.email) {
          shopifyOrder.email = checkoutData.checkout.email;
        }

        if (checkoutData.checkout?.customer && !shopifyOrder.customer?.email) {
          shopifyOrder.customer = {
            ...shopifyOrder.customer,
            ...checkoutData.checkout.customer,
          };
        }
      }
    } catch (checkoutError) {
      logger.warn("Checkout enhancement failed:", checkoutError.message);
    }
  }

  /**
   * Customer name'i güvenli şekilde al
   */
  getCustomerName(shopifyOrder) {
    if (!shopifyOrder.customer) return "Misafir Müşteri";

    const firstName = shopifyOrder.customer.first_name || "";
    const lastName = shopifyOrder.customer.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Anonim Müşteri";
  }

  /**
   * Line items'ı işle
   */
  processLineItems(lineItems) {
    return lineItems.map((item) => ({
      id: item.id,
      title: item.title || "",
      name: item.name || item.title || "",
      quantity: item.quantity || 0,
      price: parseFloat(item.price) || 0,
      totalDiscount: parseFloat(item.total_discount) || 0,
      sku: item.sku || "",
      variantTitle: item.variant_title || null,
      productId: item.product_id || null,
      variantId: item.variant_id || null,
      vendor: item.vendor || null,
      grams: item.grams || 0,
      requiresShipping: item.requires_shipping || false,
      taxable: item.taxable || false,
      fulfillmentStatus: item.fulfillment_status || null,
      fulfillableQuantity: item.fulfillable_quantity || 0,
    }));
  }

  /**
   * Tags'leri işle
   */
  processTags(tags) {
    if (!tags || tags.trim() === "") return [];
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  /**
   * Address'i işle
   */
  processAddress(address, customer) {
    if (!address) return null;

    return {
      firstName: address.first_name || customer?.first_name || "",
      lastName: address.last_name || customer?.last_name || "",
      address1: address.address1 || customer?.default_address?.address1 || "",
      address2: address.address2 || customer?.default_address?.address2 || "",
      city: address.city || customer?.default_address?.city || "",
      province: address.province || customer?.default_address?.province || "",
      country: address.country || customer?.default_address?.country || "",
      zip: address.zip || customer?.default_address?.zip || "",
      phone: address.phone || customer?.default_address?.phone || null,
      company: address.company || customer?.default_address?.company || null,
      countryCode:
        address.country_code || customer?.default_address?.country_code || null,
      provinceCode:
        address.province_code ||
        customer?.default_address?.province_code ||
        null,
      isComplete: !!(address.address1 && address.city),
    };
  }

  /**
   * Fulfillments'ı işle
   */
  processFulfillments(fulfillments) {
    return fulfillments.map((fulfillment) => ({
      id: fulfillment.id,
      status: fulfillment.status,
      service: fulfillment.service || null,
      trackingCompany: fulfillment.tracking_company || null,
      trackingNumber: fulfillment.tracking_number || null,
      trackingUrl: fulfillment.tracking_url || null,
      shipmentStatus: fulfillment.shipment_status || null,
      locationId: fulfillment.location_id || null,
      name: fulfillment.name || null,
      createdAt: fulfillment.created_at
        ? new Date(fulfillment.created_at)
        : null,
      updatedAt: fulfillment.updated_at
        ? new Date(fulfillment.updated_at)
        : null,
    }));
  }

  /**
   * Tracking info'yu al
   */
  getTrackingInfo(fulfillments) {
    if (!fulfillments || fulfillments.length === 0) return null;

    const fulfillment = fulfillments[0];
    return {
      carrier: fulfillment.tracking_company || "",
      trackingNumber: fulfillment.tracking_number || "",
      trackingUrl: fulfillment.tracking_url || null,
    };
  }

  /**
   * Customer data'yı ayrı kaydet
   */
  async saveCustomerData(integrationId, companyId, customerData) {
    try {
      if (!customerData || !customerData.id) {
        return "skipped";
      }

      // Raw customer data'yı kaydet
      const rawCustomerData = {
        integrationId,
        companyId,
        shopifyCustomerId: customerData.id.toString(),
        rawResponse: customerData,
        syncedAt: new Date(),
        dataType: "customer",
        apiVersion: this.apiVersion,
      };

      // Processed customer data'yı hazırla
      const processedCustomer = {
        integrationId,
        companyId,
        shopifyCustomerId: customerData.id.toString(),
        email: customerData.email || null,
        firstName: customerData.first_name || "",
        lastName: customerData.last_name || "",
        fullName:
          `${customerData.first_name || ""} ${
            customerData.last_name || ""
          }`.trim() || null,
        syntheticName: customerData.syntheticName || null,
        state: customerData.state || "enabled",
        ordersCount: customerData.orders_count || 0,
        totalSpent: parseFloat(customerData.total_spent) || 0,
        currency: customerData.currency || "USD",
        phone: customerData.phone || null,
        company: customerData.default_address?.company || null,
        acceptsMarketing: customerData.accepts_marketing || false,
        acceptsMarketingUpdatedAt: customerData.accepts_marketing_updated_at
          ? new Date(customerData.accepts_marketing_updated_at)
          : null,
        marketingOptInLevel: customerData.marketing_opt_in_level || null,
        emailMarketingConsent: customerData.email_marketing_consent || null,
        smsMarketingConsent: customerData.sms_marketing_consent || null,
        addresses: customerData.addresses || [],
        defaultAddress: customerData.default_address || null,
        tags: this.processTags(customerData.tags),
        note: customerData.note || null,
        taxExempt: customerData.tax_exempt || false,
        verifiedEmail: customerData.verified_email || false,
        multipassIdentifier: customerData.multipass_identifier || null,
        lastOrderId: customerData.last_order_id || null,
        lastOrderName: customerData.last_order_name || null,
        // GDPR bilgileri
        gdprProtected: customerData.state === "disabled" && !customerData.email,
        hasSyntheticIdentity: !!customerData.gdpr_protected,
        privacyStatus: customerData.gdpr_protected
          ? "gdpr_protected"
          : "normal",
        createdAt: customerData.created_at
          ? new Date(customerData.created_at)
          : new Date(),
        updatedAt: customerData.updated_at
          ? new Date(customerData.updated_at)
          : new Date(),
        syncedAt: new Date(),
      };

      // Undefined değerleri temizle
      const cleanCustomerData = this.removeUndefinedValues(processedCustomer);

      // Raw customer data'yı kontrol et ve kaydet
      const existingRawCustomers = await adminFirestore
        .collection(SHOPIFY_RAW_CUSTOMERS_COLLECTION)
        .where("shopifyCustomerId", "==", customerData.id.toString())
        .where("integrationId", "==", integrationId)
        .limit(1)
        .get();

      if (existingRawCustomers.empty) {
        await adminFirestore
          .collection(SHOPIFY_RAW_CUSTOMERS_COLLECTION)
          .add(rawCustomerData);
      } else {
        const existingRawRef = existingRawCustomers.docs[0].ref;
        await existingRawRef.update({
          rawResponse: customerData,
          syncedAt: new Date(),
          lastUpdatedAt: new Date(),
        });
      }

      // Processed customer'ı kontrol et
      const existingCustomers = await adminFirestore
        .collection(SHOPIFY_CUSTOMERS_COLLECTION)
        .where("shopifyCustomerId", "==", customerData.id.toString())
        .where("integrationId", "==", integrationId)
        .limit(1)
        .get();

      if (existingCustomers.empty) {
        // Yeni customer
        await adminFirestore
          .collection(SHOPIFY_CUSTOMERS_COLLECTION)
          .add(cleanCustomerData);
        return "created";
      } else {
        // Mevcut customer'ı güncelle
        const existingCustomerRef = existingCustomers.docs[0].ref;
        const existingData = existingCustomers.docs[0].data();

        // Değişiklik var mı kontrol et (syncedAt hariç)
        const currentCustomerData = { ...cleanCustomerData };
        delete currentCustomerData.syncedAt;

        const previousCustomerData = { ...existingData };
        delete previousCustomerData.syncedAt;
        delete previousCustomerData.updatedAt;

        // Basit değişiklik kontrolü
        const hasChanges =
          JSON.stringify(currentCustomerData) !==
          JSON.stringify(previousCustomerData);

        if (hasChanges) {
          const updateData = this.removeUndefinedValues({
            ...cleanCustomerData,
            updatedAt: new Date(),
            syncedAt: new Date(),
          });

          await existingCustomerRef.update(updateData);
          return "updated";
        } else {
          // Sadece syncedAt'i güncelle
          await existingCustomerRef.update({
            syncedAt: new Date(),
          });
          return "skipped";
        }
      }
    } catch (error) {
      logger.error(`Error saving customer data ${customerData?.id}:`, error);
      throw error;
    }
  }

  /**
   * Orders'ı getir - pagination ile
   */
  async getIntegrationOrders(integrationId, page = 1, limit = 50) {
    try {
      // Customer disabled ve email eksik ise, browser IP'si ile anonymous customer olarak işaretle
      if (
        shopifyOrder.customer?.state === "disabled" &&
        !shopifyOrder.customer?.email
      ) {
        logger.info(
          "Customer is disabled/GDPR protected - treating as anonymous customer"
        );
        shopifyOrder.email = shopifyOrder.email || null;
        shopifyOrder.anonymousCustomer = true;
        shopifyOrder.browserInfo = {
          ip: shopifyOrder.browser_ip,
          userAgent: shopifyOrder.client_details?.user_agent,
          language:
            shopifyOrder.client_details?.accept_language ||
            shopifyOrder.customer_locale,
        };
      }

      // Eğer customer bilgisi eksik ise ve email varsa, customer'ı email ile arama
      if (!shopifyOrder.customer && shopifyOrder.email) {
        logger.info(
          `Customer data missing for order ${shopifyOrder.id}, trying to fetch by email: ${shopifyOrder.email}`
        );
        try {
          const customerResponse = await fetch(
            `https://${shopName}.myshopify.com/admin/api/${
              credentials.apiVersion
            }/customers/search.json?query=email:${encodeURIComponent(
              shopifyOrder.email
            )}`,
            {
              headers: {
                "X-Shopify-Access-Token": credentials.accessToken,
                "Content-Type": "application/json",
              },
            }
          );

          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            if (customerData.customers && customerData.customers.length > 0) {
              console.log(
                "Found customer via email search:",
                customerData.customers[0]
              );
              shopifyOrder.customer = customerData.customers[0];
            }
          }
        } catch (customerError) {
          console.log(
            "Error fetching customer by email:",
            customerError.message
          );
        }
      }

      // Shopify order yapısını debug için logla
      logger.debug(`Shopify Order Structure for ${shopifyOrder.id}:`, {
        hasShippingAddress: !!shopifyOrder.shipping_address,
        hasBillingAddress: !!shopifyOrder.billing_address,
        fulfillmentStatus: shopifyOrder.fulfillment_status,
        fulfillmentsLength: shopifyOrder.fulfillments?.length || 0,
        tags: shopifyOrder.tags,
        financialStatus: shopifyOrder.financial_status,
      });

      const orderData = {
        integrationId,
        companyId,
        shopifyOrderId: shopifyOrder.id.toString(),
        orderNumber: shopifyOrder.order_number || shopifyOrder.number,
        name: shopifyOrder.name || "",
        email: shopifyOrder.email || shopifyOrder.contact_email || null,
        isAnonymousCustomer: !!shopifyOrder.anonymousCustomer,
        browserInfo: shopifyOrder.browserInfo || null,
        customerName: shopifyOrder.customer
          ? `${shopifyOrder.customer.first_name || ""} ${
              shopifyOrder.customer.last_name || ""
            }`.trim() ||
            (shopifyOrder.anonymousCustomer
              ? "Anonim Müşteri"
              : "Misafir Müşteri")
          : "Misafir Müşteri",
        customerEmail:
          shopifyOrder.customer?.email ||
          shopifyOrder.email ||
          shopifyOrder.contact_email ||
          null,
        customerId: shopifyOrder.customer?.id || null,
        customerState: shopifyOrder.customer?.state || null,
        totalPrice: parseFloat(shopifyOrder.total_price) || 0,
        currency: shopifyOrder.currency || "USD",
        financialStatus: shopifyOrder.financial_status || "",
        fulfillmentStatus: shopifyOrder.fulfillment_status || "",
        lineItems: (shopifyOrder.line_items || []).map((item) => ({
          id: item.id,
          title: item.title || "",
          name: item.name || item.title || "",
          quantity: item.quantity || 0,
          price: parseFloat(item.price) || 0,
          totalDiscount: parseFloat(item.total_discount) || 0,
          sku: item.sku || "",
          variantTitle: item.variant_title || null,
          productId: item.product_id || null,
          variantId: item.variant_id || null,
          vendor: item.vendor || null,
          grams: item.grams || 0,
          requiresShipping: item.requires_shipping || false,
          taxable: item.taxable || false,
          fulfillmentStatus: item.fulfillment_status || null,
          fulfillableQuantity: item.fulfillable_quantity || 0,
        })),
        tags: shopifyOrder.tags
          ? shopifyOrder.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
        shippingAddress: shopifyOrder.shipping_address
          ? {
              firstName:
                shopifyOrder.shipping_address.first_name ||
                shopifyOrder.customer?.first_name ||
                shopifyOrder.customer?.default_address?.first_name ||
                "",
              lastName:
                shopifyOrder.shipping_address.last_name ||
                shopifyOrder.customer?.last_name ||
                shopifyOrder.customer?.default_address?.last_name ||
                "",
              address1:
                shopifyOrder.shipping_address.address1 ||
                shopifyOrder.customer?.default_address?.address1 ||
                "",
              address2:
                shopifyOrder.shipping_address.address2 ||
                shopifyOrder.customer?.default_address?.address2 ||
                "",
              city:
                shopifyOrder.shipping_address.city ||
                shopifyOrder.customer?.default_address?.city ||
                "",
              province:
                shopifyOrder.shipping_address.province ||
                shopifyOrder.customer?.default_address?.province ||
                "",
              country:
                shopifyOrder.shipping_address.country ||
                shopifyOrder.customer?.default_address?.country ||
                "",
              zip:
                shopifyOrder.shipping_address.zip ||
                shopifyOrder.customer?.default_address?.zip ||
                "",
              phone:
                shopifyOrder.shipping_address.phone ||
                shopifyOrder.customer?.default_address?.phone ||
                shopifyOrder.phone ||
                null,
              company:
                shopifyOrder.shipping_address.company ||
                shopifyOrder.customer?.default_address?.company ||
                null,
              countryCode:
                shopifyOrder.shipping_address.country_code ||
                shopifyOrder.customer?.default_address?.country_code ||
                null,
              provinceCode:
                shopifyOrder.shipping_address.province_code ||
                shopifyOrder.customer?.default_address?.province_code ||
                null,
              // Address eksikse not ekle
              isIncomplete:
                !shopifyOrder.shipping_address.address1 &&
                !shopifyOrder.shipping_address.city,
            }
          : null,
        billingAddress: shopifyOrder.billing_address
          ? {
              firstName:
                shopifyOrder.billing_address.first_name ||
                shopifyOrder.customer?.first_name ||
                shopifyOrder.customer?.default_address?.first_name ||
                "",
              lastName:
                shopifyOrder.billing_address.last_name ||
                shopifyOrder.customer?.last_name ||
                shopifyOrder.customer?.default_address?.last_name ||
                "",
              address1:
                shopifyOrder.billing_address.address1 ||
                shopifyOrder.customer?.default_address?.address1 ||
                "",
              address2:
                shopifyOrder.billing_address.address2 ||
                shopifyOrder.customer?.default_address?.address2 ||
                "",
              city:
                shopifyOrder.billing_address.city ||
                shopifyOrder.customer?.default_address?.city ||
                "",
              province:
                shopifyOrder.billing_address.province ||
                shopifyOrder.customer?.default_address?.province ||
                "",
              country:
                shopifyOrder.billing_address.country ||
                shopifyOrder.customer?.default_address?.country ||
                "",
              zip:
                shopifyOrder.billing_address.zip ||
                shopifyOrder.customer?.default_address?.zip ||
                "",
              phone:
                shopifyOrder.billing_address.phone ||
                shopifyOrder.customer?.default_address?.phone ||
                shopifyOrder.phone ||
                null,
              company:
                shopifyOrder.billing_address.company ||
                shopifyOrder.customer?.default_address?.company ||
                null,
              countryCode:
                shopifyOrder.billing_address.country_code ||
                shopifyOrder.customer?.default_address?.country_code ||
                null,
              provinceCode:
                shopifyOrder.billing_address.province_code ||
                shopifyOrder.customer?.default_address?.province_code ||
                null,
              // Address eksikse not ekle
              isIncomplete:
                !shopifyOrder.billing_address.address1 &&
                !shopifyOrder.billing_address.city,
            }
          : null,
        fulfillments: (shopifyOrder.fulfillments || []).map((fulfillment) => ({
          id: fulfillment.id,
          status: fulfillment.status,
          service: fulfillment.service || null,
          trackingCompany: fulfillment.tracking_company || null,
          trackingNumber: fulfillment.tracking_number || null,
          trackingUrl: fulfillment.tracking_url || null,
          shipmentStatus: fulfillment.shipment_status || null,
          locationId: fulfillment.location_id || null,
          name: fulfillment.name || null,
          createdAt: fulfillment.created_at
            ? new Date(fulfillment.created_at)
            : null,
          updatedAt: fulfillment.updated_at
            ? new Date(fulfillment.updated_at)
            : null,
        })),
        trackingInfo:
          shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0
            ? {
                carrier: shopifyOrder.fulfillments[0].tracking_company || "",
                trackingNumber:
                  shopifyOrder.fulfillments[0].tracking_number || "",
                trackingUrl: shopifyOrder.fulfillments[0].tracking_url || null,
              }
            : null,
        note: shopifyOrder.note || null,
        phone: shopifyOrder.phone || null,
        sourceName: shopifyOrder.source_name || null,
        createdAt: new Date(shopifyOrder.created_at),
        updatedAt: new Date(shopifyOrder.updated_at),
        syncedAt: new Date(),
      };

      // İşlenen order data'yı da logla
      logger.debug("Processed orderData structure:", {
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerId: orderData.customerId,
        hasShippingAddress: !!orderData.shippingAddress,
        hasBillingAddress: !!orderData.billingAddress,
        shippingAddressPreview: orderData.shippingAddress
          ? {
              firstName: orderData.shippingAddress.firstName,
              lastName: orderData.shippingAddress.lastName,
              city: orderData.shippingAddress.city,
              country: orderData.shippingAddress.country,
            }
          : null,
        billingAddressPreview: orderData.billingAddress
          ? {
              firstName: orderData.billingAddress.firstName,
              lastName: orderData.billingAddress.lastName,
              city: orderData.billingAddress.city,
              country: orderData.billingAddress.country,
            }
          : null,
      });

      // Clean undefined values from orderData to prevent Firestore errors
      const cleanOrderData = this.removeUndefinedValues(orderData);

      // Mevcut siparişi kontrol et
      const existingOrders = await adminFirestore
        .collection(SHOPIFY_ORDERS_COLLECTION)
        .where("shopifyOrderId", "==", shopifyOrder.id.toString())
        .where("integrationId", "==", integrationId)
        .get();

      if (existingOrders.empty) {
        // Yeni sipariş ekle
        await adminFirestore
          .collection(SHOPIFY_ORDERS_COLLECTION)
          .add(cleanOrderData);
      } else {
        // Mevcut siparişi güncelle
        const existingOrderRef = existingOrders.docs[0].ref;
        const updateData = this.removeUndefinedValues({
          ...orderData,
          updatedAt: new Date(),
          syncedAt: new Date(),
        });
        await existingOrderRef.update(updateData);
      }
    } catch (error) {
      logger.error(`Error saving order ${shopifyOrder.id}:`, error);
      throw error;
    }
  }

  /**
   * Undefined değerleri temizle
   */
  removeUndefinedValues(obj) {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeUndefinedValues(item));
    }

    if (typeof obj === "object") {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }

    return obj;
  }

  /**
   * Entegrasyonun siparişlerini getir
   */
  async getIntegrationOrders(integrationId, page = 1, limit = 50) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const ordersSnapshot = await adminFirestore
        .collection(SHOPIFY_ORDERS_COLLECTION)
        .where("integrationId", "==", integrationId)
        .limit(limit)
        .get();

      return ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      logger.error("Error getting integration orders:", error);
      throw error;
    }
  }

  /**
   * Entegrasyonun müşterilerini getir
   */
  async getIntegrationCustomers(integrationId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const customersSnapshot = await adminFirestore
        .collection(SHOPIFY_CUSTOMERS_COLLECTION)
        .where("integrationId", "==", integrationId)
        .get();

      return customersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      logger.error("Error getting integration customers:", error);
      return [];
    }
  }

  /**
   * Entegrasyonun iadelerini getir
   */
  async getIntegrationReturns(integrationId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const returnsSnapshot = await adminFirestore
        .collection(SHOPIFY_RETURNS_COLLECTION)
        .where("integrationId", "==", integrationId)
        .get();

      return returnsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      logger.error("Error getting integration returns:", error);
      return [];
    }
  }

  /**
   * Entegrasyon istatistiklerini hesapla
   */
  async getIntegrationStats(integrationId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const ordersSnapshot = await adminFirestore
        .collection(SHOPIFY_ORDERS_COLLECTION)
        .where("integrationId", "==", integrationId)
        .get();

      const orders = ordersSnapshot.docs.map((doc) => doc.data());

      const customersSnapshot = await adminFirestore
        .collection(SHOPIFY_CUSTOMERS_COLLECTION)
        .where("integrationId", "==", integrationId)
        .get();

      const returnsSnapshot = await adminFirestore
        .collection(SHOPIFY_RETURNS_COLLECTION)
        .where("integrationId", "==", integrationId)
        .get();

      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (order) => order.fulfillmentStatus === "unfulfilled"
      ).length;
      const fulfilledOrders = orders.filter(
        (order) => order.fulfillmentStatus === "fulfilled"
      ).length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (parseFloat(order.totalPrice) || 0),
        0
      );
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentOrders = orders.filter((order) => {
        const createdAt = order.createdAt?.toDate
          ? order.createdAt.toDate()
          : new Date(order.createdAt);
        return createdAt >= thirtyDaysAgo;
      });

      const lastMonthGrowth =
        totalOrders > 0
          ? Math.round((recentOrders.length / totalOrders) * 100)
          : 0;
      const fulfillmentRate =
        totalOrders > 0 ? Math.round((fulfilledOrders / totalOrders) * 100) : 0;

      return {
        totalOrders,
        pendingOrders,
        fulfilledOrders,
        totalRevenue: Math.round(totalRevenue),
        avgOrderValue: Math.round(avgOrderValue),
        lastMonthGrowth,
        fulfillmentRate,
        totalCustomers: customersSnapshot.size,
        totalReturns: returnsSnapshot.size,
      };
    } catch (error) {
      logger.error("Error calculating integration stats:", error);
      throw error;
    }
  }

  /**
   * Shopify müşterilerini senkronize et
   */
  /**
   * Shopify müşterilerini senkronize et
   */
  async syncCustomers(integrationId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const integrationDoc = await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .doc(integrationId)
        .get();

      if (!integrationDoc.exists) {
        throw new Error("Entegrasyon bulunamadı");
      }

      const integration = integrationDoc.data();
      const { credentials } = integration;

      // Shopify domain'ini normalize et
      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }

      const shopName = shopDomain.replace(".myshopify.com", "");

      logger.info(`Starting customer sync for integration ${integrationId}`);

      // Müşterileri çek - pagination ile
      const allCustomers = await this.fetchAllCustomers(credentials, shopName);

      logger.info(`Found ${allCustomers.length} total customers from Shopify`);

      // Müşterileri kaydet
      const saveResult = await this.saveCustomersBatch(
        integrationId,
        integration.companyId,
        allCustomers
      );

      // Son senkronizasyon zamanını güncelle
      await this.updateIntegration(integrationId, {
        lastCustomerSyncAt: new Date(),
        lastSyncCustomerCount: saveResult.processed,
      });

      const syncSummary = {
        totalCustomers: allCustomers.length,
        processed: saveResult.processed,
        created: saveResult.created,
        updated: saveResult.updated,
        skipped: saveResult.skipped,
        success: true,
      };

      logger.info(
        `Successfully synced customers for integration ${integrationId}:`,
        syncSummary
      );

      return syncSummary;
    } catch (error) {
      logger.error("Customer sync error:", error);
      throw error;
    }
  }

  /**
   * Tüm müşterileri çek - pagination ile
   */
  async fetchAllCustomers(credentials, shopName) {
    const allCustomers = [];
    let pageInfo = null;
    let hasNextPage = true;

    while (hasNextPage && allCustomers.length < 1000) {
      // Maksimum 1000 müşteri
      const url = this.buildCustomersUrl(credentials, shopName, pageInfo);

      const response = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Customers API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      const customers = data.customers || [];

      // GDPR korumalı müşteriler için bilgileri düzenle
      const enhancedCustomers = customers.map((customer) =>
        this.enhanceCustomerData(customer)
      );

      allCustomers.push(...enhancedCustomers);

      // Link header'dan pagination bilgisini al
      const linkHeader = response.headers.get("Link");
      pageInfo = this.parsePageInfo(linkHeader);
      hasNextPage = pageInfo && pageInfo.hasNext;

      logger.info(
        `Fetched ${customers.length} customers, total: ${allCustomers.length}`
      );

      // Rate limiting için kısa bekleme
      if (hasNextPage) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return allCustomers;
  }

  /**
   * Customer data'sını geliştir (GDPR vs)
   */
  enhanceCustomerData(customer) {
    // Eğer customer disabled ve bilgiler eksikse, address'lerden bilgi çıkar
    if (
      customer.state === "disabled" &&
      (!customer.email || !customer.first_name)
    ) {
      // Default address'den bilgi çıkar
      if (customer.default_address) {
        const addr = customer.default_address;
        if (!customer.first_name && addr.first_name) {
          customer.first_name = addr.first_name;
        }
        if (!customer.last_name && addr.last_name) {
          customer.last_name = addr.last_name;
        }
        if (!customer.phone && addr.phone) {
          customer.phone = addr.phone;
        }
      }

      // Diğer address'lerden de bilgi çıkar
      if (
        (!customer.first_name || !customer.last_name) &&
        customer.addresses?.length > 0
      ) {
        for (const address of customer.addresses) {
          if (!customer.first_name && address.first_name) {
            customer.first_name = address.first_name;
          }
          if (!customer.last_name && address.last_name) {
            customer.last_name = address.last_name;
          }
          if (!customer.phone && address.phone) {
            customer.phone = address.phone;
          }
          if (customer.first_name && customer.last_name) break;
        }
      }

      // GDPR korumalı customer için synthetic identity oluştur
      if (!customer.email && !customer.first_name) {
        const country =
          customer.default_address?.country ||
          customer.addresses?.[0]?.country ||
          "Unknown";
        const createdYear = new Date(customer.created_at).getFullYear();

        customer.first_name = "GDPR Protected";
        customer.last_name = "Customer";
        customer.syntheticName = `Anonymous Customer (${country}, ${createdYear})`;
        customer.gdpr_protected = true;
      }
    }

    return customer;
  }

  /**
   * Müşterileri toplu olarak kaydet
   */
  async saveCustomersBatch(integrationId, companyId, customers) {
    let processed = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const customer of customers) {
      try {
        const result = await this.saveCustomerData(
          integrationId,
          companyId,
          customer
        );

        processed++;
        if (result === "created") created++;
        else if (result === "updated") updated++;
        else if (result === "skipped") skipped++;
      } catch (customerError) {
        logger.error(
          `Customer save error for customer ${customer.id}:`,
          customerError
        );
        skipped++;
      }
    }

    return { processed, created, updated, skipped };
  }

  /**
   * Analytics verilerini yenile
   */
  async refreshAnalytics(integrationId) {
    try {
      logger.info(`Refreshing analytics for integration ${integrationId}`);
      return true;
    } catch (error) {
      logger.error("Analytics refresh error:", error);
      throw error;
    }
  }

  /**
   * Shopify iadelerini senkronize et
   */
  async syncReturns(integrationId) {
    try {
      logger.info(`Starting returns sync for integration ${integrationId}`);

      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error("Entegrasyon bulunamadı");
      }

      const { credentials } = integration;

      // Shopify domain'ini normalize et
      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }

      const shopName = shopDomain.replace(".myshopify.com", "");

      // Refunded orders'ları çek
      const refundedOrders = await this.fetchRefundedOrders(
        credentials,
        shopName
      );

      logger.info(
        `Found ${refundedOrders.length} refunded orders from Shopify`
      );

      // İadeleri kaydet
      const savedCount = await this.saveReturnsBatch(
        integrationId,
        integration.companyId,
        refundedOrders
      );

      logger.info(
        `Successfully synced ${savedCount}/${refundedOrders.length} returns for integration ${integrationId}`
      );

      return savedCount;
    } catch (error) {
      logger.error("Returns sync error:", error);
      throw error;
    }
  }

  /**
   * İade edilmiş siparişleri çek
   */
  async fetchRefundedOrders(credentials, shopName) {
    const url = `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/orders.json?status=any&financial_status=refunded&limit=250`;

    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": credentials.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Shopify Returns API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data.orders || [];
  }

  /**
   * İadeleri toplu olarak kaydet
   */
  async saveReturnsBatch(integrationId, companyId, refundedOrders) {
    let savedCount = 0;

    for (const order of refundedOrders) {
      try {
        await this.saveReturn(integrationId, companyId, order);
        savedCount++;
      } catch (returnError) {
        logger.error(`Return save error for order ${order.id}:`, returnError);
      }
    }

    return savedCount;
  }

  /**
   * İadeyi Firestore'a kaydet
   */
  async saveReturn(integrationId, companyId, refundedOrder) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const returnData = {
        integrationId,
        companyId,
        shopifyOrderId: refundedOrder.id.toString(),
        orderNumber: refundedOrder.order_number || refundedOrder.number,
        refundAmount: parseFloat(refundedOrder.total_price) || 0,
        currency: refundedOrder.currency || "USD",
        reason: "Shopify Refund",
        status: "completed",
        customerEmail:
          refundedOrder.customer?.email || refundedOrder.email || null,
        refundedAt: new Date(refundedOrder.updated_at),
        syncedAt: new Date(),
      };

      // Undefined değerleri temizle
      const cleanReturnData = this.removeUndefinedValues(returnData);

      // Mevcut iadeli siparişi kontrol et
      const existingReturns = await adminFirestore
        .collection(SHOPIFY_RETURNS_COLLECTION)
        .where("shopifyOrderId", "==", refundedOrder.id.toString())
        .where("integrationId", "==", integrationId)
        .get();

      if (existingReturns.empty) {
        // Yeni iade ekle
        await adminFirestore
          .collection(SHOPIFY_RETURNS_COLLECTION)
          .add(cleanReturnData);
      } else {
        // Mevcut iadeyi güncelle
        const existingReturnRef = existingReturns.docs[0].ref;
        const updateData = this.removeUndefinedValues({
          ...returnData,
          updatedAt: new Date(),
          syncedAt: new Date(),
        });
        await existingReturnRef.update(updateData);
      }
    } catch (error) {
      logger.error(`Error saving return ${refundedOrder.id}:`, error);
      throw error;
    }
  }

  /**
   * ========================================
   * WEBHOOK YÖNETİMİ
   * ========================================
   */

  /**
   * Entegrasyon için webhook'ları kur
   */
  async setupWebhooks(integrationId, webhookConfig = null) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      // Webhook kurulumu için sadece accessToken ve shopDomain gerekli
      const basicCredentials = await this.getIntegrationCredentials(
        integrationId,
        ["shopDomain", "accessToken"]
      );

      // API version için full credentials al
      const fullCredentials = await this.getIntegrationCredentials(
        integrationId
      );

      const credentials = {
        ...basicCredentials,
        apiVersion: fullCredentials.apiVersion || "2025-10",
      };

      // Shopify domain'ini normalize et
      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
      const shopName = shopDomain.replace(".myshopify.com", "");

      // Default webhook konfigürasyonu
      const defaultConfig = {
        orders: {
          create: true,
          update: true,
          cancelled: true,
          fulfilled: true,
          paid: true,
        },
        customers: {
          create: true,
          update: true,
        },
        app: {
          uninstalled: true,
        },
      };

      // Integration settings'i al (webhook config için)
      let integrationSettings = null;
      try {
        const integration = await this.getIntegration(integrationId);
        integrationSettings = integration?.settings;
      } catch (error) {
        logger.warn(
          "Could not get integration settings, using defaults:",
          error.message
        );
      }

      const config =
        webhookConfig || integrationSettings?.webhooks || defaultConfig;
      
      // Webhook secret'ını ensure et
      const webhookSecret = await this.ensureWebhookSecret(integrationId);
      logger.info(`Using webhook secret for integration ${integrationId}: ${webhookSecret.substring(0, 8)}...`);

      const createdWebhooks = [];

      logger.info(`Setting up webhooks for integration ${integrationId}`, {
        config,
        hasWebhookSecret: !!webhookSecret
      });

      // Orders webhooks
      if (config.orders?.create) {
        const webhook = await this.createWebhook(credentials, shopName, {
          topic: "orders/create",
          address: this.webhookEndpoint,
          integrationId,
        });
        if (webhook) createdWebhooks.push(webhook);
      }

      if (config.orders?.update) {
        const webhook = await this.createWebhook(credentials, shopName, {
          topic: "orders/updated",
          address: this.webhookEndpoint,
          integrationId,
        });
        if (webhook) createdWebhooks.push(webhook);
      }

      if (config.orders?.cancelled) {
        const webhook = await this.createWebhook(credentials, shopName, {
          topic: "orders/cancelled",
          address: this.webhookEndpoint,
          integrationId,
        });
        if (webhook) createdWebhooks.push(webhook);
      }

      if (config.orders?.fulfilled) {
        const webhook = await this.createWebhook(credentials, shopName, {
          topic: "orders/fulfilled",
          address: this.webhookEndpoint,
          integrationId,
        });
        if (webhook) createdWebhooks.push(webhook);
      }

      if (config.orders?.paid) {
        const webhook = await this.createWebhook(credentials, shopName, {
          topic: "orders/paid",
          address: this.webhookEndpoint,
          integrationId,
        });
        if (webhook) createdWebhooks.push(webhook);
      }

      // Customer webhooks
      if (config.customers?.create) {
        const webhook = await this.createWebhook(credentials, shopName, {
          topic: "customers/create",
          address: this.webhookEndpoint,
          integrationId,
        });
        if (webhook) createdWebhooks.push(webhook);
      }

      if (config.customers?.update) {
        const webhook = await this.createWebhook(credentials, shopName, {
          topic: "customers/update",
          address: this.webhookEndpoint,
          integrationId,
        });
        if (webhook) createdWebhooks.push(webhook);
      }

      // App uninstalled webhook
      if (config.app?.uninstalled) {
        const webhook = await this.createWebhook(credentials, shopName, {
          topic: "app/uninstalled",
          address: this.webhookEndpoint,
          integrationId,
        });
        if (webhook) createdWebhooks.push(webhook);
      }

      // Webhook bilgilerini integration'a kaydet
      await this.updateIntegration(integrationId, {
        webhooks: {
          config: config,
          active: createdWebhooks,
          setupAt: new Date(),
          endpoint: this.webhookEndpoint,
        },
      });

      logger.info(
        `Successfully created ${createdWebhooks.length} webhooks for integration ${integrationId}`
      );

      return {
        success: true,
        webhooks: createdWebhooks,
        count: createdWebhooks.length,
      };
    } catch (error) {
      logger.error("Error setting up webhooks:", error);
      throw error;
    }
  }

  /**
   * Webhook secret oluştur
   * @param {string} integrationId - Integration ID
   * @returns {string} Generated webhook secret
   */
  generateWebhookSecret(integrationId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const safeIntegrationId = integrationId ? String(integrationId).substring(0, 8) : 'unknown';
    return `mkn_webhook_${safeIntegrationId}_${timestamp}_${random}`;
  }

  /**
   * Customers URL oluştur
   * @param {Object} credentials - API credentials
   * @param {string} shopName - Shop name
   * @param {string|null} pageInfo - Pagination cursor
   * @returns {string} Full API URL
   */
  buildCustomersUrl(credentials, shopName, pageInfo = null) {
    const apiVersion = credentials.apiVersion || "2025-10";
    let url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/customers.json?limit=250`;

    if (pageInfo) {
      url += `&page_info=${pageInfo}`;
    }

    return url;
  }

  /**
   * Orders URL oluştur
   * @param {Object} credentials - API credentials
   * @param {string} shopName - Shop name
   * @param {string|null} pageInfo - Pagination cursor
   * @param {Object} filters - Additional filters
   * @returns {string} Full API URL
   */
  buildOrdersUrl(credentials, shopName, pageInfo = null, filters = {}) {
    const apiVersion = credentials.apiVersion || "2025-10";
    let url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/orders.json?limit=250&status=any`;

    if (pageInfo) {
      url += `&page_info=${pageInfo}`;
    }

    // Add filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        url += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });

    return url;
  }

  /**
   * Products URL oluştur
   * @param {Object} credentials - API credentials
   * @param {string} shopName - Shop name
   * @param {string|null} pageInfo - Pagination cursor
   * @returns {string} Full API URL
   */
  buildProductsUrl(credentials, shopName, pageInfo = null) {
    const apiVersion = credentials.apiVersion || "2025-10";
    let url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/products.json?limit=250`;

    if (pageInfo) {
      url += `&page_info=${pageInfo}`;
    }

    return url;
  }

  /**
   * Webhook'ın var olduğunu doğrula
   * @param {string} integrationId - Integration ID
   * @param {string} webhookId - Webhook ID
   * @returns {Object} Verification result
   */
  async verifyWebhookExists(integrationId, webhookId) {
    try {
      const credentials = await this.getIntegrationCredentials(integrationId, [
        "shopDomain",
        "accessToken",
      ]);

      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
      const shopName = shopDomain.replace(".myshopify.com", "");

      const apiVersion = credentials.apiVersion || "2025-10";
      const url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/webhooks/${webhookId}.json`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          exists: true,
          webhook: data.webhook,
          status: "active",
        };
      } else if (response.status === 404) {
        return {
          exists: false,
          error: "Webhook bulunamadı",
          details: { webhookId, status: 404 },
        };
      } else {
        const errorText = await response.text();
        return {
          exists: false,
          error: `API Error: ${response.status}`,
          details: { errorText, status: response.status },
        };
      }
    } catch (error) {
      logger.error("Error verifying webhook:", error);
      return {
        exists: false,
        error: error.message,
        details: { integrationId, webhookId },
      };
    }
  }

  /**
   * Integration'ın tüm webhook'larını test et
   * @param {string} integrationId - Integration ID
   * @returns {Object} Comprehensive test results
   */
  async testAllWebhooks(integrationId) {
    try {
      logger.info(
        `Starting comprehensive webhook tests for integration ${integrationId}`
      );

      // Shopify'dan aktif webhook'ları al
      const webhooks = await this.getWebhookStatus(integrationId);
      if (!webhooks || webhooks.length === 0) {
        return {
          success: false,
          error: "No active webhooks found for testing",
          details: { integrationId, webhookCount: 0 },
        };
      }

      const results = [];
      const startTime = Date.now();

      // Test each webhook
      for (const webhook of webhooks) {
        logger.info(`Testing webhook: ${webhook.topic} (${webhook.id})`);

        const testResult = await this.sendTestWebhook(
          integrationId,
          webhook.id.toString(),
          webhook.topic
        );

        results.push({
          webhook: {
            id: webhook.id,
            topic: webhook.topic,
            address: webhook.address,
          },
          test: testResult,
          timestamp: new Date().toISOString(),
        });

        // Small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const totalTime = Date.now() - startTime;
      const successfulTests = results.filter((r) => r.test.success).length;
      const failedTests = results.length - successfulTests;

      logger.info(
        `Webhook tests completed: ${successfulTests}/${results.length} successful`,
        {
          integrationId,
          totalTime: `${totalTime}ms`,
          successfulTests,
          failedTests,
        }
      );

      return {
        success: true,
        summary: {
          total: results.length,
          successful: successfulTests,
          failed: failedTests,
          totalTime: `${totalTime}ms`,
        },
        results,
      };
    } catch (error) {
      logger.error(
        `Error testing all webhooks for integration ${integrationId}:`,
        error
      );
      return {
        success: false,
        error: error.message,
        details: { integrationId },
      };
    }
  }

  /**
   * Test webhook gönder
   * @param {string} integrationId - Integration ID
   * @param {string} webhookId - Webhook ID
   * @param {string} topic - Webhook topic
   * @returns {Object} Test result
   */
  async sendTestWebhook(integrationId, webhookId, topic) {
    try {
      const startTime = Date.now();

      // 1. Shopify API'den webhook bilgisini al
      const webhookVerification = await this.verifyWebhookExists(
        integrationId,
        webhookId
      );

      if (!webhookVerification.exists) {
        return {
          success: false,
          error: "Webhook doğrulanamadı",
          details: webhookVerification,
        };
      }

      const webhook = webhookVerification.webhook;

      // 2. Test payload'ı oluştur
      const testPayload = this.createTestPayload(topic);

      // 3. Webhook endpoint'ine test isteği gönder
      const endpointTest = await this.testWebhookEndpoint(
        webhook.address,
        testPayload,
        topic
      );

      const responseTime = Date.now() - startTime;

      // 4. Sonuçları analiz et
      if (endpointTest.success) {
        return {
          success: true,
          status: "Webhook aktif ve çalışıyor",
          responseTime: `${responseTime}ms`,
          shopifyResponse: {
            id: webhook.id,
            topic: webhook.topic,
            address: webhook.address,
            created_at: webhook.created_at,
            updated_at: webhook.updated_at,
          },
          endpointTest: endpointTest,
        };
      } else {
        return {
          success: false,
          error: "Webhook endpoint'i yanıt vermiyor",
          details: {
            webhookInfo: webhook,
            endpointTest: endpointTest,
            responseTime: `${responseTime}ms`,
          },
        };
      }
    } catch (error) {
      logger.error("Error sending test webhook:", error);
      return {
        success: false,
        error: error.message,
        details: { integrationId, webhookId, topic },
      };
    }
  }

  /**
   * Test payload oluştur
   * @param {string} topic - Webhook topic
   * @returns {Object} Test payload
   */
  createTestPayload(topic) {
    const basePayload = {
      test: true,
      timestamp: new Date().toISOString(),
      source: "mkngroup-webhook-test",
    };

    switch (topic) {
      case "orders/create":
      case "orders/updated":
      case "orders/paid":
        return {
          ...basePayload,
          id: 9999999999,
          order_number: "TEST-001",
          name: "#TEST-001",
          email: "test@example.com",
          total_price: "100.00",
          currency: "TRY",
          financial_status: "paid",
          fulfillment_status: null,
          created_at: new Date().toISOString(),
          customer: {
            id: 8888888888,
            email: "test@example.com",
            first_name: "Test",
            last_name: "Customer",
          },
        };

      case "customers/create":
      case "customers/update":
        return {
          ...basePayload,
          id: 8888888888,
          email: "test@example.com",
          first_name: "Test",
          last_name: "Customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

      default:
        return basePayload;
    }
  }

  /**
   * Webhook endpoint'ini test et
   * @param {string} webhookUrl - Webhook URL
   * @param {Object} payload - Test payload
   * @param {string} topic - Webhook topic
   * @returns {Object} Test result
   */
  async testWebhookEndpoint(webhookUrl, payload, topic) {
    try {
      // Development ortamında test için localhost kullan
      let testUrl = webhookUrl;
      if (
        process.env.NODE_ENV === "development" &&
        webhookUrl.includes("mkngroup.com.tr")
      ) {
        testUrl = webhookUrl.replace(
          "https://mkngroup.com.tr",
          "http://localhost:3000"
        );
        logger.info(
          `Development mode: Testing webhook at localhost - ${testUrl}`
        );
      }

      const response = await fetch(testUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Topic": topic,
          "X-Shopify-Shop-Domain": "test-shop.myshopify.com",
          "X-Shopify-Webhook-Id": "test-webhook-" + Date.now(),
          "X-Shopify-Hmac-Sha256": "test-signature",
          "User-Agent": "MKN-Webhook-Test/1.0",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      logger.error("Webhook endpoint test failed:", {
        error: error.message,
        webhookUrl,
        topic,
      });

      return {
        success: false,
        error: error.message,
        details: { webhookUrl, topic },
      };
    }
  }

  /**
   * Integration için webhook oluştur
   * @param {string} integrationId - Integration ID
   * @param {string} topic - Webhook topic
   * @param {string} address - Webhook URL
   */
  async createWebhookForIntegration(integrationId, topic, address) {
    try {
      // Webhook oluşturma için sadece accessToken ve shopDomain gerekli
      const credentials = await this.getIntegrationCredentials(integrationId, [
        "shopDomain",
        "accessToken",
      ]);

      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
      const shopName = shopDomain.replace(".myshopify.com", "");

      const result = await this.createWebhook(credentials, shopName, {
        topic,
        address,
      });

      return result;
    } catch (error) {
      logger.error(
        `Error creating webhook for integration ${integrationId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Integration için webhook sil
   * @param {string} integrationId - Integration ID
   * @param {string} webhookId - Webhook ID
   */
  async deleteWebhookForIntegration(integrationId, webhookId) {
    try {
      // Webhook silme için sadece accessToken ve shopDomain gerekli
      const credentials = await this.getIntegrationCredentials(integrationId, [
        "shopDomain",
        "accessToken",
      ]);

      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
      const shopName = shopDomain.replace(".myshopify.com", "");

      const url = `https://${shopName}.myshopify.com/admin/api/${
        credentials.apiVersion || "2025-10"
      }/webhooks/${webhookId}.json`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        logger.info(`Webhook deleted successfully: ${webhookId}`);
        return { success: true, webhookId };
      } else {
        const errorData = await response.text();
        logger.error(`Failed to delete webhook: ${errorData}`);
        throw new Error(`Webhook silinemedi: ${response.status}`);
      }
    } catch (error) {
      logger.error(
        `Error deleting webhook for integration ${integrationId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Integration için tüm webhook'ları kaldır
   * @param {string} integrationId - Integration ID
   */
  async removeWebhooks(integrationId) {
    try {
      // Webhook silme için sadece accessToken ve shopDomain gerekli
      const credentials = await this.getIntegrationCredentials(integrationId, [
        "shopDomain",
        "accessToken",
      ]);

      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
      const shopName = shopDomain.replace(".myshopify.com", "");

      // Önce mevcut webhook'ları getir
      let webhooks;
      try {
        webhooks = await this.getWebhookStatus(integrationId);
      } catch (error) {
        logger.error("Error getting webhooks for removal:", error);
        return {
          success: false,
          error: "Mevcut webhook'lar alınamadı: " + error.message,
          details: { integrationId, step: "getWebhooks" },
        };
      }

      if (!webhooks || webhooks.length === 0) {
        return {
          success: true,
          message: "Silinecek webhook bulunamadı",
          removed: [],
        };
      }

      const removedWebhooks = [];
      const errors = [];

      // Her webhook'ı tek tek sil
      for (const webhook of webhooks) {
        try {
          await this.deleteWebhookForIntegration(integrationId, webhook.id);
          removedWebhooks.push({
            id: webhook.id,
            topic: webhook.topic,
            address: webhook.address,
          });
          logger.info(`Webhook removed: ${webhook.id} (${webhook.topic})`);
        } catch (error) {
          errors.push({
            id: webhook.id,
            topic: webhook.topic,
            error: error.message,
          });
          logger.error(`Failed to remove webhook ${webhook.id}:`, error);
        }
      }

      const success =
        removedWebhooks.length > 0 || webhooks.length === errors.length;

      return {
        success,
        message:
          removedWebhooks.length > 0
            ? `${removedWebhooks.length} webhook başarıyla kaldırıldı`
            : errors.length > 0
            ? "Bazı webhook'lar kaldırılamadı"
            : "İşlem tamamlandı",
        removed: removedWebhooks,
        errors: errors.length > 0 ? errors : undefined,
        total: webhooks.length,
        removedCount: removedWebhooks.length,
        errorCount: errors.length,
      };
    } catch (error) {
      logger.error(
        `Error removing webhooks for integration ${integrationId}:`,
        error
      );
      return {
        success: false,
        error: error.message || "Webhook kaldırma işlemi başarısız",
        details: {
          integrationId,
          originalError: error.toString(),
        },
      };
    }
  }

  /**
   * Tekil webhook oluştur
   */
  async createWebhook(credentials, shopName, webhookData) {
    try {
      const apiVersion = credentials.apiVersion || "2025-10";
      const url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/webhooks.json`;

      logger.info(`Creating webhook: ${webhookData.topic} at ${url}`);

      const webhookPayload = {
        webhook: {
          topic: webhookData.topic,
          address: webhookData.address,
          format: "json",
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Webhook creation failed for ${webhookData.topic}:`, {
          status: response.status,
          statusText: response.statusText,
          url,
          error: errorText,
          shopName,
          accessToken: credentials.accessToken ? "present" : "missing",
        });

        // Detaylı hata mesajı
        let errorMessage = `Webhook oluşturulamadı: ${response.status} ${response.statusText}`;
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.errors) {
              errorMessage += ` - ${JSON.stringify(errorJson.errors)}`;
            }
          } catch {
            errorMessage += ` - ${errorText}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const webhook = data.webhook;

      // Webhook'u database'e kaydet
      await this.saveWebhookToDatabase(
        webhookData.integrationId,
        webhook,
        webhookData.topic
      );

      logger.info(`Webhook created successfully: ${webhookData.topic}`, {
        id: webhook.id,
        address: webhook.address,
      });

      return {
        id: webhook.id,
        topic: webhook.topic,
        address: webhook.address,
        createdAt: webhook.created_at,
      };
    } catch (error) {
      logger.error(`Error creating webhook for ${webhookData.topic}:`, error);
      return null;
    }
  }

  /**
   * Webhook'u database'e kaydet
   */
  async saveWebhookToDatabase(integrationId, webhookData, topic) {
    try {
      const webhookRecord = {
        integrationId,
        shopifyWebhookId: webhookData.id.toString(),
        topic: webhookData.topic || topic,
        address: webhookData.address,
        format: webhookData.format || "json",
        status: "active",
        createdAt: new Date(webhookData.created_at),
        syncedAt: new Date(),
      };

      await adminFirestore
        .collection(SHOPIFY_WEBHOOKS_COLLECTION)
        .add(webhookRecord);

      logger.info(`Webhook saved to database: ${webhookData.id}`);
    } catch (error) {
      logger.error(`Error saving webhook to database:`, error);
    }
  }

  /**
   * Entegrasyon webhook'larını listele
   */
  async getWebhooks(integrationId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const webhooksSnapshot = await adminFirestore
        .collection(SHOPIFY_WEBHOOKS_COLLECTION)
        .where("integrationId", "==", integrationId)
        .where("status", "==", "active")
        .get();

      const webhooks = webhooksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        webhooks: webhooks,
        count: webhooks.length,
      };
    } catch (error) {
      logger.error("Error getting webhooks:", error);
      return {
        success: false,
        error: error.message,
        webhooks: [],
      };
    }
  }

  /**
   * Shopify'dan mevcut webhook'ları çek
   */
  async fetchWebhooksFromShopify(integrationId) {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error("Entegrasyon bulunamadı");
      }

      const { credentials } = integration;

      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
      const shopName = shopDomain.replace(".myshopify.com", "");

      const url = `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/webhooks.json`;

      const response = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Webhooks fetch failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data.webhooks || [];
    } catch (error) {
      logger.error("Error fetching webhooks from Shopify:", error);
      throw error;
    }
  }

  /**
   * Webhook'u sil
   */
  async deleteWebhook(integrationId, webhookId) {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error("Entegrasyon bulunamadı");
      }

      const { credentials } = integration;

      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
      const shopName = shopDomain.replace(".myshopify.com", "");

      // Shopify'dan webhook'u sil
      const url = `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/webhooks/${webhookId}.json`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        throw new Error(
          `Webhook deletion failed: ${response.status} - ${errorText}`
        );
      }

      // Database'den webhook'u sil
      const webhookQuery = await adminFirestore
        .collection(SHOPIFY_WEBHOOKS_COLLECTION)
        .where("integrationId", "==", integrationId)
        .where("shopifyWebhookId", "==", webhookId.toString())
        .get();

      if (!webhookQuery.empty) {
        const webhookDoc = webhookQuery.docs[0];
        await webhookDoc.ref.update({
          status: "deleted",
          deletedAt: new Date(),
        });
      }

      logger.info(`Webhook deleted: ${webhookId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting webhook ${webhookId}:`, error);
      throw error;
    }
  }

  /**
   * Tüm webhook'ları sil
   */
  async deleteAllWebhooks(integrationId) {
    try {
      const webhooks = await this.fetchWebhooksFromShopify(integrationId);

      let deletedCount = 0;
      for (const webhook of webhooks) {
        try {
          await this.deleteWebhook(integrationId, webhook.id);
          deletedCount++;
        } catch (error) {
          logger.error(`Failed to delete webhook ${webhook.id}:`, error);
        }
      }

      logger.info(
        `Deleted ${deletedCount}/${webhooks.length} webhooks for integration ${integrationId}`
      );

      return {
        success: true,
        deleted: deletedCount,
        total: webhooks.length,
      };
    } catch (error) {
      logger.error("Error deleting all webhooks:", error);
      throw error;
    }
  }

  /**
   * Webhook event'ini işle
   */
  async processWebhookEvent(topic, data, headers) {
    try {
      // Webhook event'ini database'e kaydet
      await this.saveWebhookEvent(topic, data, headers);

      logger.info(`Processing webhook event: ${topic}`, {
        shopifyId: data.id,
        domain: headers["x-shopify-shop-domain"],
      });

      switch (topic) {
        case "orders/create":
        case "orders/updated":
        case "orders/paid":
        case "orders/fulfilled":
          await this.processOrderWebhook(data, topic, headers);
          break;

        case "orders/cancelled":
          await this.processOrderCancellation(data, headers);
          break;

        case "customers/create":
        case "customers/update":
          await this.processCustomerWebhook(data, topic, headers);
          break;

        case "app/uninstalled":
          await this.processAppUninstalled(headers);
          break;

        default:
          logger.warn(`Unhandled webhook topic: ${topic}`);
      }

      return { success: true, processed: true };
    } catch (error) {
      logger.error(`Error processing webhook event ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Webhook event'ini database'e kaydet
   */
  async saveWebhookEvent(topic, data, headers) {
    try {
      const eventRecord = {
        topic,
        shopifyId: data.id?.toString(),
        shopDomain: headers["x-shopify-shop-domain"],
        hmacHeader: headers["x-shopify-hmac-sha256"],
        data,
        headers: {
          "x-shopify-topic": headers["x-shopify-topic"],
          "x-shopify-shop-domain": headers["x-shopify-shop-domain"],
          "x-shopify-webhook-id": headers["x-shopify-webhook-id"],
        },
        status: "received",
        receivedAt: new Date(),
      };

      await adminFirestore
        .collection(WEBHOOK_EVENTS_COLLECTION)
        .add(eventRecord);
    } catch (error) {
      logger.error("Error saving webhook event:", error);
    }
  }

  /**
   * Order webhook'unu işle
   */
  async processOrderWebhook(orderData, topic, headers) {
    try {
      // Shop domain'inden integration'ı bul
      const shopDomain = headers["x-shopify-shop-domain"];
      const integration = await this.findIntegrationByShopDomain(shopDomain);

      if (!integration) {
        logger.warn(`No integration found for shop domain: ${shopDomain}`);
        return;
      }

      // Siparişi kaydet/güncelle
      await this.saveOrder(
        integration.id,
        integration.companyId,
        orderData,
        integration.credentials
      );

      // Notification gönder
      if (topic === "orders/create") {
        await this.sendOrderNotification(integration, orderData, "new_order");
      } else if (topic === "orders/paid") {
        await this.sendOrderNotification(integration, orderData, "order_paid");
      }

      logger.info(`Order webhook processed: ${topic}`, {
        orderId: orderData.id,
        integrationId: integration.id,
      });
    } catch (error) {
      logger.error(`Error processing order webhook:`, error);
      throw error;
    }
  }

  /**
   * Customer webhook'unu işle
   */
  async processCustomerWebhook(customerData, topic, headers) {
    try {
      const shopDomain = headers["x-shopify-shop-domain"];
      const integration = await this.findIntegrationByShopDomain(shopDomain);

      if (!integration) {
        logger.warn(`No integration found for shop domain: ${shopDomain}`);
        return;
      }

      // Customer'ı kaydet/güncelle
      await this.saveCustomerData(
        integration.id,
        integration.companyId,
        customerData
      );

      logger.info(`Customer webhook processed: ${topic}`, {
        customerId: customerData.id,
        integrationId: integration.id,
      });
    } catch (error) {
      logger.error(`Error processing customer webhook:`, error);
      throw error;
    }
  }

  /**
   * App uninstalled webhook'unu işle
   */
  async processAppUninstalled(headers) {
    try {
      const shopDomain = headers["x-shopify-shop-domain"];
      const integration = await this.findIntegrationByShopDomain(shopDomain);

      if (!integration) {
        logger.warn(`No integration found for shop domain: ${shopDomain}`);
        return;
      }

      // Integration'ı deaktive et
      await this.updateIntegration(integration.id, {
        status: "uninstalled",
        uninstalledAt: new Date(),
      });

      logger.info(`App uninstalled webhook processed`, {
        shopDomain,
        integrationId: integration.id,
      });
    } catch (error) {
      logger.error(`Error processing app uninstalled webhook:`, error);
      throw error;
    }
  }

  /**
   * Shop domain'ine göre integration bul
   */
  async findIntegrationByShopDomain(shopDomain) {
    try {
      if (!shopDomain) return null;

      // .myshopify.com'u kaldır
      const cleanDomain = shopDomain.replace(".myshopify.com", "");

      const integrationsQuery = await adminFirestore
        .collection(INTEGRATIONS_COLLECTION)
        .where("platform", "==", "shopify")
        .where("status", "==", "active")
        .get();

      for (const doc of integrationsQuery.docs) {
        const integration = doc.data();
        const integrationDomain = integration.credentials?.shopDomain?.replace(
          ".myshopify.com",
          ""
        );

        if (integrationDomain === cleanDomain) {
          return {
            id: doc.id,
            ...integration,
          };
        }
      }

      return null;
    } catch (error) {
      logger.error("Error finding integration by shop domain:", error);
      return null;
    }
  }

  /**
   * Order notification gönder
   */
  async sendOrderNotification(integration, orderData, type) {
    try {
      // Notification sistemi varsa kullan
      if (
        ShopifyNotifications &&
        typeof ShopifyNotifications.sendOrderNotification === "function"
      ) {
        await ShopifyNotifications.sendOrderNotification(
          integration,
          orderData,
          type
        );
      }
    } catch (error) {
      logger.error("Error sending order notification:", error);
    }
  }

  /**
   * Webhook durumunu getir
   */
  async getWebhookStatus(integrationId = null) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      if (integrationId) {
        // Specific integration için webhook'ları getir
        // Webhook işlemleri için sadece accessToken ve shopDomain gerekli
        const credentials = await this.getIntegrationCredentials(
          integrationId,
          ["shopDomain", "accessToken"]
        );

        let shopDomain = credentials.shopDomain;
        if (!shopDomain.includes(".myshopify.com")) {
          shopDomain = `${shopDomain}.myshopify.com`;
        }
        const shopName = shopDomain.replace(".myshopify.com", "");

        // Shopify'dan webhook'ları çek
        const url = `https://${shopName}.myshopify.com/admin/api/${
          credentials.apiVersion || "2025-10"
        }/webhooks.json`;
        const response = await fetch(url, {
          headers: {
            "X-Shopify-Access-Token": credentials.accessToken,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Shopify API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.webhooks || [];
      } else {
        // Tüm webhook'ları getir (database'den)
        const webhooksQuery = await adminFirestore
          .collection(SHOPIFY_WEBHOOKS_COLLECTION)
          .get();

        return webhooksQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      logger.error("Error getting webhook status:", error);
      throw error;
    }
  }

  /**
   * Tüm webhook'ları getir (genel)
   */
  async getAllWebhooks() {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const webhooksQuery = await adminFirestore
        .collection(SHOPIFY_WEBHOOKS_COLLECTION)
        .get();

      return webhooksQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error("Error getting all webhooks:", error);
      throw error;
    }
  }

  /**
   * Database'deki sipariş sayısını al
   */
  async getOrdersCount(integrationId) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const ordersSnapshot = await adminFirestore
        .collection(SHOPIFY_ORDERS_COLLECTION)
        .where('integrationId', '==', integrationId)
        .count()
        .get();

      return ordersSnapshot.data().count;
    } catch (error) {
      logger.error(`Error getting orders count for integration ${integrationId}:`, error);
      throw error;
    }
  }
}

export const shopifyService = new ShopifyIntegrationService();
