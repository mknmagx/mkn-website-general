/**
 * Shopify Integration Service
 * Müşteri bazlı Shopify API bağlantıları ve işlemleri
 */

import { adminFirestore } from "../firebase-admin";
import logger from "../utils/logger";
import ShopifyNotifications from "../utils/shopify-notifications";

// Firestore Koleksiyonları
const INTEGRATIONS_COLLECTION = "integrations";
const SHOPIFY_ORDERS_COLLECTION = "shopify_orders";
const SHOPIFY_CUSTOMERS_COLLECTION = "shopify_customers";
const SHOPIFY_RETURNS_COLLECTION = "shopify_returns";

export class ShopifyIntegrationService {
  constructor() {
    this.apiVersion = "2025-10";
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
      if (integrationsSnapshot.empty && process.env.NODE_ENV === 'development') {
        logger.info("No Shopify integrations found, checking all integrations");
        const allIntegrationsSnapshot = await adminFirestore
          .collection(INTEGRATIONS_COLLECTION)
          .get();
        
        logger.info("All integrations count:", { 
          total: allIntegrationsSnapshot.size 
        });
      }

      const integrations = integrationsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Frontend için gerekli field'ları normalize et
          shopDomain: data.credentials?.shopDomain || '',
          companyName: data.companyName || data.customerName || '',
          companyEmail: data.companyEmail || data.customerEmail || '',
          ordersCount: data.lastSyncOrderCount || 0,
          platform: data.platform || 'shopify'
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
        .where("platform", "==", "shopify")  // type yerine platform kullan
        .get();

      return integrationsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Frontend için gerekli field'ları normalize et
          shopDomain: data.credentials?.shopDomain || '',
          companyName: data.companyName || data.customerName || '',
          companyEmail: data.companyEmail || data.customerEmail || '',
          ordersCount: data.lastSyncOrderCount || 0,
          platform: data.platform || 'shopify'
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
        platform: "shopify",  // type yerine platform kullan
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
          autoFulfillment: false
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

      return { id: docRef.id, ...integrationData };
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
      const testUrl = `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion || this.apiVersion}/shop.json`;

      const response = await fetch(testUrl, {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API hatası: ${response.status} - ${errorText}`);
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

      // Shopify domain'ini düzelt
      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }

      const shopName = shopDomain.replace(".myshopify.com", "");
      let allOrders = [];

      const url = `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/orders.json?status=any&limit=250`;

      const response = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Shopify API Error: ${response.status}`, errorText);
        throw new Error(
          `Shopify API hatası: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      allOrders = data.orders || [];

      logger.info(`Found ${allOrders.length} orders from Shopify`);

      // Siparişleri kaydet
      let savedCount = 0;
      for (const order of allOrders) {
        try {
          await this.saveOrder(integrationId, integration.companyId, order);
          savedCount++;
        } catch (orderError) {
          logger.error(`Order save error for order ${order.id}:`, orderError);
        }
      }

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
   * Siparişi Firestore'a kaydet
   */
  async saveOrder(integrationId, companyId, shopifyOrder) {
    try {
      if (!adminFirestore) {
        throw new Error("Firebase Admin SDK is not configured");
      }

      const orderData = {
        integrationId,
        companyId,
        shopifyOrderId: shopifyOrder.id.toString(),
        orderNumber: shopifyOrder.order_number || shopifyOrder.number,
        name: shopifyOrder.name,
        email: shopifyOrder.email,
        customerName: shopifyOrder.customer
          ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`
          : "",
        customerEmail: shopifyOrder.customer
          ? shopifyOrder.customer.email
          : shopifyOrder.email,
        totalPrice: parseFloat(shopifyOrder.total_price),
        currency: shopifyOrder.currency,
        financialStatus: shopifyOrder.financial_status,
        fulfillmentStatus: shopifyOrder.fulfillment_status,
        lineItems: (shopifyOrder.line_items || []).map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
        createdAt: new Date(shopifyOrder.created_at),
        updatedAt: new Date(shopifyOrder.updated_at),
        syncedAt: new Date(),
      };

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
          .add(orderData);
      } else {
        // Mevcut siparişi güncelle
        const existingOrderRef = existingOrders.docs[0].ref;
        await existingOrderRef.update({
          ...orderData,
          updatedAt: new Date(),
          syncedAt: new Date(),
        });
      }
    } catch (error) {
      logger.error(`Error saving order ${shopifyOrder.id}:`, error);
      throw error;
    }
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
  async syncCustomers(integrationId) {
    try {
      logger.info(`Starting customers sync for integration ${integrationId}`);
      return 0;
    } catch (error) {
      logger.error("Customer sync error:", error);
      throw error;
    }
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

      // Shopify domain'ini düzelt
      let shopDomain = credentials.shopDomain;
      if (!shopDomain.includes(".myshopify.com")) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }

      const shopName = shopDomain.replace(".myshopify.com", "");

      // Returns API'sini çağır (Shopify'da returns/refunds olarak geçer)
      const url = `https://${shopName}.myshopify.com/admin/api/${credentials.apiVersion}/orders.json?status=any&financial_status=refunded&limit=250`;

      const response = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          `Shopify Returns API Error: ${response.status}`,
          errorText
        );
        throw new Error(`Shopify Returns API hatası: ${response.status}`);
      }

      const data = await response.json();
      const refundedOrders = data.orders || [];

      logger.info(
        `Found ${refundedOrders.length} refunded orders from Shopify`
      );

      // İadeleri kaydet
      let savedCount = 0;
      for (const order of refundedOrders) {
        try {
          await this.saveReturn(integrationId, integration.companyId, order);
          savedCount++;
        } catch (returnError) {
          logger.error(`Return save error for order ${order.id}:`, returnError);
        }
      }

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
        refundAmount: parseFloat(refundedOrder.total_price),
        currency: refundedOrder.currency,
        reason: "Shopify Refund",
        status: "completed",
        customerEmail: refundedOrder.customer
          ? refundedOrder.customer.email
          : refundedOrder.email,
        refundedAt: new Date(refundedOrder.updated_at),
        syncedAt: new Date(),
      };

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
          .add(returnData);
      } else {
        // Mevcut iadeyi güncelle
        const existingReturnRef = existingReturns.docs[0].ref;
        await existingReturnRef.update({
          ...returnData,
          updatedAt: new Date(),
          syncedAt: new Date(),
        });
      }
    } catch (error) {
      logger.error(`Error saving return ${refundedOrder.id}:`, error);
      throw error;
    }
  }
}

export const shopifyService = new ShopifyIntegrationService();
