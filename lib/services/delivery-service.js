import {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  serverTimestamp,
} from "../firestore";

const DELIVERY_COLLECTION = "deliveries";

// Delivery types
export const DELIVERY_TYPE = {
  INBOUND: "inbound", // Incoming deliveries (received)
  OUTBOUND: "outbound", // Outgoing deliveries (sent)
};

export const DELIVERY_TYPE_LABELS = {
  [DELIVERY_TYPE.INBOUND]: "Giriş İrsaliyesi",
  [DELIVERY_TYPE.OUTBOUND]: "Çıkış İrsaliyesi",
};

// Delivery statuses
export const DELIVERY_STATUS = {
  PREPARED: "prepared",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  RETURNED: "returned",
  CANCELLED: "cancelled",
};

export const DELIVERY_STATUS_LABELS = {
  [DELIVERY_STATUS.PREPARED]: "Hazırlandı",
  [DELIVERY_STATUS.IN_TRANSIT]: "Yolda",
  [DELIVERY_STATUS.DELIVERED]: "Teslim Edildi",
  [DELIVERY_STATUS.RETURNED]: "İade",
  [DELIVERY_STATUS.CANCELLED]: "İptal",
};

// Product categories
export const PRODUCT_CATEGORIES = {
  RAW_MATERIAL: "raw_material",
  PACKAGING: "packaging",
  FINISHED_PRODUCT: "finished_product",
  SEMI_FINISHED: "semi_finished",
  AUXILIARY_MATERIAL: "auxiliary_material",
  CHEMICAL: "chemical",
  OTHER: "other",
};

export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.RAW_MATERIAL]: "Hammadde",
  [PRODUCT_CATEGORIES.PACKAGING]: "Ambalaj Malzemesi",
  [PRODUCT_CATEGORIES.FINISHED_PRODUCT]: "Mamül",
  [PRODUCT_CATEGORIES.SEMI_FINISHED]: "Yarımamül",
  [PRODUCT_CATEGORIES.AUXILIARY_MATERIAL]: "Yardımcı Malzeme",
  [PRODUCT_CATEGORIES.CHEMICAL]: "Kimyasal",
  [PRODUCT_CATEGORIES.OTHER]: "Diğer",
};

// Units
export const UNITS = {
  PIECE: "piece",
  KG: "kg",
  GRAM: "gram",
  LITER: "liter",
  ML: "ml",
  METER: "meter",
  CM: "cm",
  M2: "m2",
  M3: "m3",
  BOX: "box",
  PALLET: "pallet",
};

export const UNIT_LABELS = {
  [UNITS.PIECE]: "Adet",
  [UNITS.KG]: "Kilogram",
  [UNITS.GRAM]: "Gram",
  [UNITS.LITER]: "Litre",
  [UNITS.ML]: "Mililitre",
  [UNITS.METER]: "Metre",
  [UNITS.CM]: "Santimetre",
  [UNITS.M2]: "Metrekare",
  [UNITS.M3]: "Metreküp",
  [UNITS.BOX]: "Koli",
  [UNITS.PALLET]: "Palet",
};

/**
 * Delivery Service
 * Service class for managing delivery note records
 */
export const DeliveryService = {
  /**
   * Create new delivery
   */
  async createDelivery(deliveryData) {
    try {
      const deliveryNumber = this.generateDeliveryNumber(deliveryData.type);

      const newDelivery = {
        ...deliveryData,
        deliveryNumber,
        status: DELIVERY_STATUS.PREPARED,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Calculate total quantity/amount
        totalQuantity: this.calculateTotalQuantity(deliveryData.items || []),
        totalItems: this.calculateTotalItems(deliveryData.items || []),
        // PDF status
        pdfGenerated: false,
        pdfUrl: null,
        // Transaction link (if created from transaction)
        linkedTransactionId: deliveryData.linkedTransactionId || null,
        linkedTransactionRef: deliveryData.linkedTransactionRef || null,
      };

      const docId = await addDocument(DELIVERY_COLLECTION, newDelivery);

      return {
        success: true,
        id: docId,
        deliveryNumber,
      };
    } catch (error) {
      console.error("Error creating delivery:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Create delivery from inventory transaction
   */
  async createFromTransaction(transaction, additionalData = {}) {
    try {
      // Determine delivery type based on transaction type
      const type = transaction.type === "outbound" 
        ? DELIVERY_TYPE.OUTBOUND 
        : DELIVERY_TYPE.INBOUND;

      // Build item from transaction
      const item = {
        name: transaction.itemName || transaction.item?.name || "Ürün",
        sku: transaction.itemSku || transaction.item?.sku || "",
        quantity: transaction.quantity || 0,
        unit: transaction.unit || "piece",
        description: transaction.notes || "",
      };

      const deliveryData = {
        type,
        items: [item],
        linkedTransactionId: transaction.id,
        linkedTransactionRef: transaction.transactionNumber || transaction.referenceNumber,
        companyInfo: additionalData.companyInfo || {
          companyName: transaction.companyName || additionalData.companyName || "",
          contactPerson: transaction.contactPerson || additionalData.contactPerson || "",
          address: additionalData.address || "",
          taxNumber: additionalData.taxNumber || "",
          taxOffice: additionalData.taxOffice || "",
          phone: additionalData.phone || "",
        },
        vehicleInfo: additionalData.vehicleInfo || {
          plateNumber: "",
          driverName: "",
          driverPhone: "",
        },
        notes: transaction.notes || additionalData.notes || "",
        warehouseId: transaction.warehouseId,
        warehouseName: transaction.warehouseName,
        createdBy: additionalData.createdBy || transaction.createdBy,
      };

      const result = await this.createDelivery(deliveryData);

      // Link back to transaction if successful
      if (result.success && transaction.id) {
        try {
          await updateDocument("inventory_transactions", transaction.id, {
            linkedDeliveryId: result.id,
            linkedDeliveryNumber: result.deliveryNumber,
            updatedAt: serverTimestamp(),
          });
        } catch (linkError) {
          console.warn("Could not link delivery to transaction:", linkError);
        }
      }

      return result;
    } catch (error) {
      console.error("Error creating delivery from transaction:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Get delivery by linked transaction ID
   */
  async getDeliveryByTransactionId(transactionId) {
    try {
      const deliveries = await getDocuments(DELIVERY_COLLECTION, {
        where: [["linkedTransactionId", "==", transactionId]],
        limit: 1,
      });

      if (deliveries.length > 0) {
        return {
          success: true,
          delivery: deliveries[0],
        };
      }

      return {
        success: true,
        delivery: null,
      };
    } catch (error) {
      console.error("Error fetching delivery by transaction:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update delivery
   */
  async updateDelivery(id, updateData) {
    try {
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      // Recalculate totals if items are updated
      if (updates.items) {
        updates.totalQuantity = this.calculateTotalQuantity(updates.items);
        updates.totalItems = this.calculateTotalItems(updates.items);
      }

      await updateDocument(DELIVERY_COLLECTION, id, updates);

      return {
        success: true,
        id,
      };
    } catch (error) {
      console.error("Error updating irsaliye:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Delete delivery
   */
  async deleteDelivery(id) {
    try {
      await deleteDocument(DELIVERY_COLLECTION, id);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting delivery:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Get single delivery
   */
  async getDelivery(id) {
    try {
      const delivery = await getDocument(DELIVERY_COLLECTION, id);

      if (!delivery) {
        return {
          success: false,
          error: "Delivery not found",
        };
      }

      return {
        success: true,
        delivery: {
          id,
          ...delivery,
        },
      };
    } catch (error) {
      console.error("Error fetching delivery:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Get all deliveries
   */
  async getDeliveries(filters = {}) {
    try {
      const queryOptions = {
        orderBy: ["createdAt", "desc"],
      };

      // Filters
      const whereConditions = [];
      
      if (filters.companyId) {
        whereConditions.push(["companyId", "==", filters.companyId]);
      }
      if (filters.type) {
        whereConditions.push(["type", "==", filters.type]);
      }
      if (filters.status) {
        whereConditions.push(["status", "==", filters.status]);
      }

      if (whereConditions.length > 0) {
        queryOptions.where = whereConditions;
      }

      const deliveries = await getDocuments(DELIVERY_COLLECTION, queryOptions);

      return {
        success: true,
        deliveries,
      };
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Get deliveries by company
   */
  async getDeliveriesByCompany(companyId) {
    try {
      const deliveries = await getDocuments(DELIVERY_COLLECTION, {
        where: ["companyId", "==", companyId],
        orderBy: ["createdAt", "desc"],
      });

      return {
        success: true,
        deliveries,
      };
    } catch (error) {
      console.error("Error fetching company deliveries:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(id, status, deliveryInfo = {}) {
    try {
      const updates = {
        status,
        updatedAt: serverTimestamp(),
      };

      // Add delivery information
      if (status === DELIVERY_STATUS.DELIVERED && deliveryInfo) {
        updates.deliveryInfo = {
          ...deliveryInfo,
          deliveryDate: deliveryInfo.deliveryDate || new Date().toISOString(),
        };
      }

      await updateDocument(DELIVERY_COLLECTION, id, updates);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error updating delivery status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Update PDF URL
   */
  async updatePdfUrl(id, pdfUrl) {
    try {
      await updateDocument(DELIVERY_COLLECTION, id, {
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
   * Generate delivery number
   */
  generateDeliveryNumber(type = DELIVERY_TYPE.OUTBOUND) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const timestamp = Date.now().toString().slice(-6);

    const prefix = type === DELIVERY_TYPE.INBOUND ? "IN" : "OUT";
    return `${prefix}-${year}${month}${day}-${timestamp}`;
  },

  /**
   * Calculate total items (product count)
   */
  calculateTotalItems(items) {
    return items ? items.length : 0;
  },

  /**
   * Calculate total quantity
   */
  calculateTotalQuantity(items) {
    return items.reduce((total, item) => {
      return total + (Number(item.quantity) || 0);
    }, 0);
  },

  /**
   * Get delivery statistics
   */
  async getDeliveryStats() {
    try {
      const result = await this.getDeliveries();

      if (!result.success) {
        return result;
      }

      const deliveries = result.deliveries;
      const stats = {
        total: deliveries.length,
        inbound: deliveries.filter((d) => d.type === DELIVERY_TYPE.INBOUND).length,
        outbound: deliveries.filter((d) => d.type === DELIVERY_TYPE.OUTBOUND).length,
        prepared: deliveries.filter((d) => d.status === DELIVERY_STATUS.PREPARED).length,
        inTransit: deliveries.filter((d) => d.status === DELIVERY_STATUS.IN_TRANSIT).length,
        delivered: deliveries.filter((d) => d.status === DELIVERY_STATUS.DELIVERED).length,
        totalProducts: deliveries.reduce((sum, d) => sum + (d.totalItems || 0), 0),
        totalQuantity: deliveries.reduce((sum, d) => sum + (d.totalQuantity || 0), 0),
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("Error getting delivery stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Fix missing totals for existing deliveries
   */
  async fixMissingTotals() {
    try {
      const result = await this.getDeliveries();
      if (!result.success) return result;

      const deliveries = result.deliveries;
      let fixedCount = 0;

      for (const delivery of deliveries) {
        // Check if totals are missing or incorrect
        const hasItems = delivery.items && delivery.items.length > 0;
        const correctTotalItems = hasItems ? delivery.items.length : 0;
        const correctTotalQuantity = hasItems 
          ? delivery.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
          : 0;

        const needsUpdate = 
          delivery.totalItems !== correctTotalItems ||
          delivery.totalQuantity !== correctTotalQuantity ||
          delivery.totalItems === undefined ||
          delivery.totalQuantity === undefined;

        if (needsUpdate) {
          
          await updateDocument(DELIVERY_COLLECTION, delivery.id, {
            totalItems: correctTotalItems,
            totalQuantity: correctTotalQuantity,
            updatedAt: serverTimestamp(),
          });
          
          fixedCount++;
        }
      }

      return {
        success: true,
        message: `Fixed totals for ${fixedCount} deliveries`,
        fixedCount
      };
    } catch (error) {
      console.error("Error fixing delivery totals:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Helper functions
export const getDeliveryTypeLabel = (type) => {
  return DELIVERY_TYPE_LABELS[type] || type;
};

export const getDeliveryStatusLabel = (status) => {
  return DELIVERY_STATUS_LABELS[status] || status;
};

export const getProductCategoryLabel = (category) => {
  return PRODUCT_CATEGORY_LABELS[category] || category;
};

export const getUnitLabel = (unit) => {
  return UNIT_LABELS[unit] || unit;
};

// Status color helper
export const getStatusColor = (status) => {
  switch (status) {
    case DELIVERY_STATUS.PREPARED:
      return "bg-yellow-100 text-yellow-800";
    case DELIVERY_STATUS.IN_TRANSIT:
      return "bg-blue-100 text-blue-800";
    case DELIVERY_STATUS.DELIVERED:
      return "bg-green-100 text-green-800";
    case DELIVERY_STATUS.RETURNED:
      return "bg-orange-100 text-orange-800";
    case DELIVERY_STATUS.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Type color helper
export const getTypeColor = (type) => {
  switch (type) {
    case DELIVERY_TYPE.INBOUND:
      return "bg-green-100 text-green-800";
    case DELIVERY_TYPE.OUTBOUND:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default DeliveryService;