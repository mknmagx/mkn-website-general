import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";

// ============================================
// COLLECTIONS
// ============================================
export const INVENTORY_COLLECTIONS = {
  ITEMS: "inventory_items",
  TRANSACTIONS: "inventory_transactions",
  WAREHOUSES: "inventory_warehouses",
  SUPPLIERS: "inventory_suppliers",
  SETTINGS: "inventory_settings",
};

// ============================================
// ENUMS & CONSTANTS
// ============================================
export const ITEM_CATEGORY = {
  PACKAGING: "packaging",
  RAW_MATERIAL: "raw_material",
  FINISHED_PRODUCT: "finished_product",
  SEMI_FINISHED: "semi_finished",
  CUSTOMER_GOODS: "customer_goods",
  AUXILIARY_MATERIAL: "auxiliary_material",
  CHEMICAL: "chemical",
  OTHER: "other",
};

export const ITEM_CATEGORY_LABELS = {
  [ITEM_CATEGORY.PACKAGING]: "Ambalaj",
  [ITEM_CATEGORY.RAW_MATERIAL]: "Hammadde",
  [ITEM_CATEGORY.FINISHED_PRODUCT]: "Mamül",
  [ITEM_CATEGORY.SEMI_FINISHED]: "Yarı Mamül",
  [ITEM_CATEGORY.CUSTOMER_GOODS]: "Müşteri Malı",
  [ITEM_CATEGORY.AUXILIARY_MATERIAL]: "Yardımcı Malzeme",
  [ITEM_CATEGORY.CHEMICAL]: "Kimyasal",
  [ITEM_CATEGORY.OTHER]: "Diğer",
};

export const OWNERSHIP_TYPE = {
  MKN: "mkn",
  CUSTOMER: "customer",
};

export const OWNERSHIP_TYPE_LABELS = {
  [OWNERSHIP_TYPE.MKN]: "MKN",
  [OWNERSHIP_TYPE.CUSTOMER]: "Müşteri",
};

export const TRANSACTION_TYPE = {
  INBOUND: "inbound",
  OUTBOUND: "outbound",
  TRANSFER: "transfer",
  ADJUSTMENT: "adjustment",
  RESERVATION: "reservation",
  RELEASE: "release",
};

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPE.INBOUND]: "Giriş",
  [TRANSACTION_TYPE.OUTBOUND]: "Çıkış",
  [TRANSACTION_TYPE.TRANSFER]: "Transfer",
  [TRANSACTION_TYPE.ADJUSTMENT]: "Düzeltme",
  [TRANSACTION_TYPE.RESERVATION]: "Rezervasyon",
  [TRANSACTION_TYPE.RELEASE]: "Serbest Bırakma",
};

export const TRANSACTION_SUBTYPE = {
  PURCHASE: "purchase",
  PRODUCTION: "production",
  RETURN: "return",
  SALE: "sale",
  DAMAGE: "damage",
  COUNT: "count",
  CUSTOMER_INBOUND: "customer_inbound",
  CUSTOMER_OUTBOUND: "customer_outbound",
  MIGRATION: "migration",
  MANUAL: "manual",
};

export const TRANSACTION_SUBTYPE_LABELS = {
  [TRANSACTION_SUBTYPE.PURCHASE]: "Satın Alma",
  [TRANSACTION_SUBTYPE.PRODUCTION]: "Üretim",
  [TRANSACTION_SUBTYPE.RETURN]: "İade",
  [TRANSACTION_SUBTYPE.SALE]: "Satış",
  [TRANSACTION_SUBTYPE.DAMAGE]: "Hasar/Fire",
  [TRANSACTION_SUBTYPE.COUNT]: "Sayım",
  [TRANSACTION_SUBTYPE.CUSTOMER_INBOUND]: "Müşteri Girişi",
  [TRANSACTION_SUBTYPE.CUSTOMER_OUTBOUND]: "Müşteri Çıkışı",
  [TRANSACTION_SUBTYPE.MIGRATION]: "Migration",
  [TRANSACTION_SUBTYPE.MANUAL]: "Manuel",
};

export const ITEM_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DISCONTINUED: "discontinued",
};

export const ITEM_STATUS_LABELS = {
  [ITEM_STATUS.ACTIVE]: "Aktif",
  [ITEM_STATUS.INACTIVE]: "Pasif",
  [ITEM_STATUS.DISCONTINUED]: "Üretimden Kalktı",
};

export const UNIT = {
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
  SET: "set",
};

export const UNIT_LABELS = {
  [UNIT.PIECE]: "Adet",
  [UNIT.KG]: "Kilogram",
  [UNIT.GRAM]: "Gram",
  [UNIT.LITER]: "Litre",
  [UNIT.ML]: "Mililitre",
  [UNIT.METER]: "Metre",
  [UNIT.CM]: "Santimetre",
  [UNIT.M2]: "Metrekare",
  [UNIT.M3]: "Metreküp",
  [UNIT.BOX]: "Koli",
  [UNIT.PALLET]: "Palet",
  [UNIT.SET]: "Set",
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const generateSKU = (category, name) => {
  const categoryPrefix = {
    [ITEM_CATEGORY.PACKAGING]: "AMB",
    [ITEM_CATEGORY.RAW_MATERIAL]: "HAM",
    [ITEM_CATEGORY.FINISHED_PRODUCT]: "MAM",
    [ITEM_CATEGORY.SEMI_FINISHED]: "YAR",
    [ITEM_CATEGORY.CUSTOMER_GOODS]: "MUS",
    [ITEM_CATEGORY.AUXILIARY_MATERIAL]: "YRD",
    [ITEM_CATEGORY.CHEMICAL]: "KIM",
    [ITEM_CATEGORY.OTHER]: "DGR",
  };

  const prefix = categoryPrefix[category] || "STK";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${prefix}-${timestamp}-${random}`;
};

export const generateTransactionNumber = (type) => {
  const prefix = {
    [TRANSACTION_TYPE.INBOUND]: "GRS",
    [TRANSACTION_TYPE.OUTBOUND]: "CKS",
    [TRANSACTION_TYPE.TRANSFER]: "TRF",
    [TRANSACTION_TYPE.ADJUSTMENT]: "DZT",
    [TRANSACTION_TYPE.RESERVATION]: "RZV",
    [TRANSACTION_TYPE.RELEASE]: "SRB",
  };

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = now.getTime().toString(36).toUpperCase().slice(-6);
  
  return `${prefix[type] || "TRX"}-${dateStr}-${timeStr}`;
};

// ============================================
// WAREHOUSE SERVICE
// ============================================
export const warehouseService = {
  async getAll() {
    try {
      const q = query(
        collection(db, INVENTORY_COLLECTIONS.WAREHOUSES),
        orderBy("name", "asc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      throw new Error("Depolar yüklenirken hata oluştu");
    }
  },

  async getById(id) {
    try {
      const docRef = doc(db, INVENTORY_COLLECTIONS.WAREHOUSES, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching warehouse:", error);
      throw new Error("Depo yüklenirken hata oluştu");
    }
  },

  async create(data) {
    try {
      const newWarehouse = {
        name: data.name,
        code: data.code || data.name.substring(0, 3).toUpperCase(),
        address: data.address || "",
        description: data.description || "",
        isDefault: data.isDefault || false,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // If this is default, unset other defaults
      if (newWarehouse.isDefault) {
        const warehouses = await this.getAll();
        const batch = writeBatch(db);
        warehouses.forEach((w) => {
          if (w.isDefault) {
            batch.update(doc(db, INVENTORY_COLLECTIONS.WAREHOUSES, w.id), {
              isDefault: false,
            });
          }
        });
        await batch.commit();
      }

      const docRef = await addDoc(
        collection(db, INVENTORY_COLLECTIONS.WAREHOUSES),
        newWarehouse
      );
      return { id: docRef.id, ...newWarehouse };
    } catch (error) {
      console.error("Error creating warehouse:", error);
      throw new Error("Depo oluşturulurken hata oluştu");
    }
  },

  async update(id, data) {
    try {
      const docRef = doc(db, INVENTORY_COLLECTIONS.WAREHOUSES, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      // If setting as default, unset other defaults
      if (data.isDefault) {
        const warehouses = await this.getAll();
        const batch = writeBatch(db);
        warehouses.forEach((w) => {
          if (w.id !== id && w.isDefault) {
            batch.update(doc(db, INVENTORY_COLLECTIONS.WAREHOUSES, w.id), {
              isDefault: false,
            });
          }
        });
        await batch.commit();
      }

      await updateDoc(docRef, updateData);
      return await this.getById(id);
    } catch (error) {
      console.error("Error updating warehouse:", error);
      throw new Error("Depo güncellenirken hata oluştu");
    }
  },

  async delete(id) {
    try {
      // Check if warehouse is default
      const warehouse = await this.getById(id);
      if (warehouse?.isDefault) {
        throw new Error("Varsayılan depo silinemez. Önce başka bir depoyu varsayılan yapın.");
      }

      // Check if warehouse has items
      const itemsQuery = query(
        collection(db, INVENTORY_COLLECTIONS.ITEMS),
        where("warehouseId", "==", id),
        limit(1)
      );
      const itemsSnap = await getDocs(itemsQuery);
      
      if (!itemsSnap.empty) {
        throw new Error("Bu depoda ürün bulunduğu için silinemez. Önce ürünleri başka bir depoya taşıyın.");
      }

      // Check if warehouse is referenced in transactions
      const transactionsQuery = query(
        collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS),
        where("warehouseId", "==", id),
        limit(1)
      );
      const transactionsSnap = await getDocs(transactionsQuery);
      
      if (!transactionsSnap.empty) {
        throw new Error("Bu depoya ait stok hareketi bulunduğu için silinemez.");
      }

      await deleteDoc(doc(db, INVENTORY_COLLECTIONS.WAREHOUSES, id));
      return true;
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      throw new Error(error.message || "Depo silinirken hata oluştu");
    }
  },

  async getDefault() {
    try {
      const q = query(
        collection(db, INVENTORY_COLLECTIONS.WAREHOUSES),
        where("isDefault", "==", true),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      
      // If no default, create one
      return await this.create({
        name: "Ana Depo",
        code: "MAIN",
        isDefault: true,
      });
    } catch (error) {
      console.error("Error getting default warehouse:", error);
      throw error;
    }
  },

  async ensureDefaultExists() {
    const warehouses = await this.getAll();
    if (warehouses.length === 0) {
      return await this.create({
        name: "Ana Depo",
        code: "MAIN",
        address: "",
        isDefault: true,
      });
    }
    return warehouses.find((w) => w.isDefault) || warehouses[0];
  },
};

// ============================================
// SUPPLIER SERVICE
// ============================================
export const supplierService = {
  async getAll() {
    try {
      const q = query(
        collection(db, INVENTORY_COLLECTIONS.SUPPLIERS),
        orderBy("name", "asc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw new Error("Tedarikçiler yüklenirken hata oluştu");
    }
  },

  async getById(id) {
    try {
      const docRef = doc(db, INVENTORY_COLLECTIONS.SUPPLIERS, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching supplier:", error);
      throw new Error("Tedarikçi yüklenirken hata oluştu");
    }
  },

  async create(data) {
    try {
      const newSupplier = {
        name: data.name,
        code: data.code || "",
        contactPerson: data.contactPerson || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        taxNumber: data.taxNumber || "",
        taxOffice: data.taxOffice || "",
        notes: data.notes || "",
        category: data.category || "general",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, INVENTORY_COLLECTIONS.SUPPLIERS),
        newSupplier
      );
      return { id: docRef.id, ...newSupplier };
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw new Error("Tedarikçi oluşturulurken hata oluştu");
    }
  },

  async update(id, data) {
    try {
      const docRef = doc(db, INVENTORY_COLLECTIONS.SUPPLIERS, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return await this.getById(id);
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw new Error("Tedarikçi güncellenirken hata oluştu");
    }
  },

  async delete(id) {
    try {
      // Check if supplier has items
      const itemsQuery = query(
        collection(db, INVENTORY_COLLECTIONS.ITEMS),
        where("supplierId", "==", id),
        limit(1)
      );
      const itemsSnap = await getDocs(itemsQuery);
      
      if (!itemsSnap.empty) {
        throw new Error("Bu tedarikçiye bağlı ürün bulunduğu için silinemez. Önce ürünlerin tedarikçisini değiştirin.");
      }

      // Check if supplier is referenced in transactions
      const transactionsQuery = query(
        collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS),
        where("supplierId", "==", id),
        limit(1)
      );
      const transactionsSnap = await getDocs(transactionsQuery);
      
      if (!transactionsSnap.empty) {
        throw new Error("Bu tedarikçiye ait stok hareketi bulunduğu için silinemez.");
      }

      await deleteDoc(doc(db, INVENTORY_COLLECTIONS.SUPPLIERS, id));
      return true;
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw new Error(error.message || "Tedarikçi silinirken hata oluştu");
    }
  },
};

// ============================================
// INVENTORY ITEM SERVICE
// ============================================
export const inventoryItemService = {
  async getAll(filters = {}) {
    try {
      let q = collection(db, INVENTORY_COLLECTIONS.ITEMS);

      // Build query
      const queryConstraints = [];
      
      if (filters.status) {
        queryConstraints.push(where("status", "==", filters.status));
      }
      
      if (filters.category) {
        queryConstraints.push(where("category", "==", filters.category));
      }
      
      if (filters.ownershipType) {
        queryConstraints.push(where("ownership.type", "==", filters.ownershipType));
      }
      
      if (filters.companyId) {
        queryConstraints.push(where("ownership.companyId", "==", filters.companyId));
      }
      
      if (filters.warehouseId) {
        queryConstraints.push(where("warehouseId", "==", filters.warehouseId));
      }

      if (queryConstraints.length > 0) {
        q = query(q, ...queryConstraints);
      }

      const snapshot = await getDocs(q);
      let items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Client-side sorting
      items.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      // Apply limit if specified
      if (filters.limitCount && filters.limitCount > 0) {
        items = items.slice(0, filters.limitCount);
      }

      return items;
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      throw new Error("Stok kalemleri yüklenirken hata oluştu");
    }
  },

  async getById(id) {
    try {
      const docRef = doc(db, INVENTORY_COLLECTIONS.ITEMS, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      throw new Error("Stok kalemi yüklenirken hata oluştu");
    }
  },

  async getBySKU(sku) {
    try {
      const q = query(
        collection(db, INVENTORY_COLLECTIONS.ITEMS),
        where("sku", "==", sku),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching item by SKU:", error);
      throw new Error("Stok kalemi SKU ile yüklenirken hata oluştu");
    }
  },

  async create(data, user) {
    try {
      const sku = data.sku || generateSKU(data.category, data.name);
      
      // Check if SKU exists
      const existingItem = await this.getBySKU(sku);
      if (existingItem) {
        throw new Error("Bu SKU zaten kullanılıyor");
      }

      // Get default warehouse if not specified
      let warehouseId = data.warehouseId;
      if (!warehouseId) {
        const defaultWarehouse = await warehouseService.getDefault();
        warehouseId = defaultWarehouse.id;
      }

      const newItem = {
        sku,
        name: data.name,
        description: data.description || "",
        category: data.category || ITEM_CATEGORY.OTHER,
        subcategory: data.subcategory || "",
        
        ownership: {
          type: data.ownershipType || OWNERSHIP_TYPE.MKN,
          companyId: data.companyId || null,
          companyName: data.companyName || null,
        },
        
        stock: {
          quantity: data.initialQuantity || 0,
          reservedQuantity: 0,
          availableQuantity: data.initialQuantity || 0,
          minStockLevel: data.minStockLevel || 0,
          maxStockLevel: data.maxStockLevel || null,
          unit: data.unit || UNIT.PIECE,
        },
        
        warehouseId,
        location: data.location || "",
        
        pricing: {
          costPrice: data.costPrice || 0,
          salePrice: data.salePrice || 0,
          currency: data.currency || "TRY",
          lastPurchasePrice: data.costPrice || 0,
          averageCost: data.costPrice || 0,
        },
        
        // Lot/Serial tracking
        tracking: {
          hasLotTracking: data.hasLotTracking || false,
          hasSerialTracking: data.hasSerialTracking || false,
          lotNumber: data.lotNumber || null,
          serialNumber: data.serialNumber || null,
          productionDate: data.productionDate || null,
          expiryDate: data.expiryDate || null,
        },
        
        // Link to packaging product if applicable
        linkedProductId: data.linkedProductId || null,
        
        // Supplier info
        supplierId: data.supplierId || null,
        supplierName: data.supplierName || null,
        
        status: data.status || ITEM_STATUS.ACTIVE,
        images: data.images || [],
        specifications: data.specifications || {},
        tags: data.tags || [],
        notes: data.notes || "",
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user ? {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        } : null,
        lastModifiedBy: user ? {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        } : null,
      };

      const docRef = await addDoc(
        collection(db, INVENTORY_COLLECTIONS.ITEMS),
        newItem
      );

      // If there's initial quantity, create initial transaction
      if (data.initialQuantity && data.initialQuantity > 0) {
        await transactionService.create({
          type: TRANSACTION_TYPE.INBOUND,
          subtype: TRANSACTION_SUBTYPE.MANUAL,
          itemId: docRef.id,
          quantity: data.initialQuantity,
          unit: data.unit || UNIT.PIECE,
          unitPrice: data.costPrice || 0,
          warehouseId,
          notes: "Başlangıç stoğu",
        }, user, false); // false = don't update stock again
      }

      return { id: docRef.id, ...newItem, sku };
    } catch (error) {
      console.error("Error creating inventory item:", error);
      throw new Error(error.message || "Stok kalemi oluşturulurken hata oluştu");
    }
  },

  async update(id, data, user) {
    try {
      const docRef = doc(db, INVENTORY_COLLECTIONS.ITEMS, id);
      const currentItem = await this.getById(id);
      
      if (!currentItem) {
        throw new Error("Stok kalemi bulunamadı");
      }

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user ? {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        } : currentItem.lastModifiedBy,
      };

      // Handle nested objects properly
      if (data.ownership) {
        updateData.ownership = { ...currentItem.ownership, ...data.ownership };
      }
      if (data.stock) {
        updateData.stock = { ...currentItem.stock, ...data.stock };
      }
      if (data.pricing) {
        updateData.pricing = { ...currentItem.pricing, ...data.pricing };
      }
      if (data.tracking) {
        updateData.tracking = { ...currentItem.tracking, ...data.tracking };
      }

      await updateDoc(docRef, updateData);
      
      // Get updated item
      const updatedItem = await this.getById(id);
      
      // Update related transactions' itemSnapshot if name, sku or category changed
      // NOTE: Pricing is NOT updated in transactions - they should preserve historical values
      const shouldUpdateTransactions = 
        data.name !== currentItem.name ||
        data.sku !== currentItem.sku ||
        data.category !== currentItem.category ||
        data.ownership?.companyName !== currentItem.ownership?.companyName;
        
      if (shouldUpdateTransactions) {
        await this.updateRelatedTransactions(id, {
          sku: updatedItem.sku,
          name: updatedItem.name,
          category: updatedItem.category,
        }, updatedItem.ownership?.companyName);
      }
      
      // Update transactions if cost price or quantity changed
      // NOTE: Sale price changes do NOT affect transactions
      const newCostPrice = data.pricing?.costPrice;
      const oldCostPrice = currentItem.pricing?.costPrice;
      const newCurrency = data.pricing?.currency;
      const oldCurrency = currentItem.pricing?.currency;
      const newQuantity = data.stock?.quantity;
      const oldQuantity = currentItem.stock?.quantity;
      
      // Use loose comparison for numbers that might be strings
      const costPriceChanged = newCostPrice !== undefined && 
        Number(newCostPrice) !== Number(oldCostPrice || 0);
      const currencyChanged = newCurrency !== undefined && 
        newCurrency !== oldCurrency;
      const quantityChanged = newQuantity !== undefined && 
        Number(newQuantity) !== Number(oldQuantity || 0);
        
      if (costPriceChanged || quantityChanged || currencyChanged) {
        try {
          await this.updateTransactionPricing(id, {
            costPrice: updatedItem.pricing?.costPrice,
            currency: updatedItem.pricing?.currency,
            quantity: updatedItem.stock?.quantity,
            costPriceChanged,
            quantityChanged,
            currencyChanged,
          });
        } catch (txError) {
          // Transaction pricing update failed - silently continue
        }
      }
      
      return updatedItem;
    } catch (error) {
      console.error("Error updating inventory item:", error);
      throw new Error("Stok kalemi güncellenirken hata oluştu");
    }
  },

  async updateRelatedTransactions(itemId, itemSnapshot, companyName) {
    try {
      // Get all transactions for this item
      const transactionsQuery = query(
        collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS),
        where("itemId", "==", itemId)
      );
      const snapshot = await getDocs(transactionsQuery);
      
      if (snapshot.empty) return;
      
      // Batch update all related transactions
      // NOTE: Only updating reference info (name, sku, category, companyName)
      // Pricing (unitPrice, totalValue, currency) is NOT updated - preserves historical values
      const batch = writeBatch(db);
      
      snapshot.docs.forEach((docSnap) => {
        const updateObj = {
          itemSnapshot: itemSnapshot,
          updatedAt: serverTimestamp(),
        };
        
        // Also update companyName if provided
        if (companyName !== undefined) {
          updateObj.companyName = companyName;
        }
        
        batch.update(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, docSnap.id), updateObj);
      });
      
      await batch.commit();
    } catch (error) {
      // Don't throw - this is a secondary operation
    }
  },

  /**
   * Update transaction pricing when cost price or quantity is edited on the item
   * NOTE: Sale price changes do NOT trigger this - only cost price and quantity
   * This updates the unitPrice (from costPrice), quantity, and recalculates totalValue
   */
  async updateTransactionPricing(itemId, { costPrice, currency, quantity, costPriceChanged, quantityChanged, currencyChanged }) {
    try {
      // Get all transactions for this item
      const transactionsQuery = query(
        collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS),
        where("itemId", "==", itemId)
      );
      const snapshot = await getDocs(transactionsQuery);
      
      if (snapshot.empty) {
        return;
      }
      
      // Batch update all related transactions
      const batch = writeBatch(db);
      let updatedCount = 0;
      
      snapshot.docs.forEach((docSnap) => {
        const transactionData = docSnap.data();
        const updateObj = {
          updatedAt: serverTimestamp(),
        };
        
        // Update unit price (maliyet) if cost price changed
        if (costPriceChanged && costPrice !== undefined) {
          updateObj.unitPrice = costPrice;
        }
        
        // Update currency if changed
        if (currencyChanged && currency !== undefined) {
          updateObj.currency = currency;
        }
        
        // Update quantity if changed - only for stock_in type transactions
        // For stock_out and other types, we preserve the original quantity
        if (quantityChanged && quantity !== undefined) {
          // Only update the latest stock_in transaction's quantity
          // Other transactions should keep their original quantities
          // This is a simplification - in a more complex system, 
          // you might want different logic
        }
        
        // Recalculate total value if price or currency changed
        if (costPriceChanged || currencyChanged) {
          // Use the transaction's own quantity for totalValue calculation
          const transactionQty = transactionData.quantity || 0;
          const newUnitPrice = updateObj.unitPrice !== undefined ? updateObj.unitPrice : transactionData.unitPrice;
          updateObj.totalValue = transactionQty * newUnitPrice;
        }
        
        if (Object.keys(updateObj).length > 1) { // More than just updatedAt
          batch.update(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, docSnap.id), updateObj);
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        await batch.commit();
      }
    } catch (error) {
      // Don't throw - this is a secondary operation
    }
  },

  async delete(id) {
    try {
      // Soft delete - set status to discontinued
      await this.update(id, { status: ITEM_STATUS.DISCONTINUED });
      return true;
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      throw new Error("Stok kalemi silinirken hata oluştu");
    }
  },

  async hardDelete(id, deleteTransactions = false) {
    try {
      // Check for related transactions
      const transactionsQuery = query(
        collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS),
        where("itemId", "==", id)
      );
      const transactionsSnap = await getDocs(transactionsQuery);
      
      if (!transactionsSnap.empty) {
        if (!deleteTransactions) {
          throw new Error(
            `Bu ürüne ait ${transactionsSnap.docs.length} adet stok hareketi bulunmaktadır. ` +
            `Kalıcı silmek için ilgili kayıtların da silinmesi gerekir.`
          );
        }
        
        // Delete all related transactions in batches
        const batch = writeBatch(db);
        transactionsSnap.docs.forEach((docSnap) => {
          batch.delete(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, docSnap.id));
        });
        await batch.commit();
      }

      // Delete the item
      await deleteDoc(doc(db, INVENTORY_COLLECTIONS.ITEMS, id));
      return true;
    } catch (error) {
      console.error("Error hard deleting inventory item:", error);
      throw new Error(error.message || "Stok kalemi kalıcı silinirken hata oluştu");
    }
  },

  async getTransactionCount(id) {
    try {
      const transactionsQuery = query(
        collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS),
        where("itemId", "==", id)
      );
      const snapshot = await getDocs(transactionsQuery);
      return snapshot.docs.length;
    } catch (error) {
      console.error("Error getting transaction count:", error);
      return 0;
    }
  },

  async updateStock(id, quantityChange, user) {
    try {
      const docRef = doc(db, INVENTORY_COLLECTIONS.ITEMS, id);
      
      return await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        
        if (!docSnap.exists()) {
          throw new Error("Stok kalemi bulunamadı");
        }
        
        const currentData = docSnap.data();
        const currentQuantity = currentData.stock?.quantity || 0;
        const reservedQuantity = currentData.stock?.reservedQuantity || 0;
        const newQuantity = currentQuantity + quantityChange;
        
        if (newQuantity < 0) {
          throw new Error("Yetersiz stok");
        }
        
        transaction.update(docRef, {
          "stock.quantity": newQuantity,
          "stock.availableQuantity": newQuantity - reservedQuantity,
          updatedAt: serverTimestamp(),
          lastModifiedBy: user ? {
            id: user.uid,
            name: user.displayName || user.email,
            email: user.email,
          } : currentData.lastModifiedBy,
        });
        
        return {
          previousQuantity: currentQuantity,
          newQuantity,
          change: quantityChange,
        };
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      throw new Error(error.message || "Stok güncellenirken hata oluştu");
    }
  },

  async getStatistics() {
    try {
      const items = await this.getAll({ status: ITEM_STATUS.ACTIVE });
      
      const stats = {
        totalItems: items.length,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        byCategory: {},
        byOwnership: {
          mkn: 0,
          customer: 0,
        },
        byWarehouse: {},
      };

      items.forEach((item) => {
        const quantity = item.stock?.quantity || 0;
        const costPrice = item.pricing?.costPrice || 0;
        const minStock = item.stock?.minStockLevel || 0;

        // Total value
        stats.totalValue += quantity * costPrice;

        // Low stock check
        if (quantity > 0 && quantity <= minStock) {
          stats.lowStockItems++;
        }

        // Out of stock check
        if (quantity === 0) {
          stats.outOfStockItems++;
        }

        // By category
        const category = item.category || "other";
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        // By ownership
        const ownershipType = item.ownership?.type || "mkn";
        stats.byOwnership[ownershipType] = (stats.byOwnership[ownershipType] || 0) + 1;

        // By warehouse
        const warehouseId = item.warehouseId || "unknown";
        stats.byWarehouse[warehouseId] = (stats.byWarehouse[warehouseId] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("Error getting statistics:", error);
      throw new Error("İstatistikler yüklenirken hata oluştu");
    }
  },

  async search(searchTerm) {
    try {
      const items = await this.getAll();
      const term = searchTerm.toLowerCase();
      
      return items.filter((item) => 
        item.name?.toLowerCase().includes(term) ||
        item.sku?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.ownership?.companyName?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error("Error searching items:", error);
      throw new Error("Arama yapılırken hata oluştu");
    }
  },
};

// ============================================
// TRANSACTION SERVICE
// ============================================
export const transactionService = {
  async getAll(filters = {}) {
    try {
      let q = collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS);
      const queryConstraints = [];

      if (filters.type) {
        queryConstraints.push(where("type", "==", filters.type));
      }
      
      if (filters.itemId) {
        queryConstraints.push(where("itemId", "==", filters.itemId));
      }
      
      if (filters.companyId) {
        queryConstraints.push(where("companyId", "==", filters.companyId));
      }

      if (queryConstraints.length > 0) {
        q = query(q, ...queryConstraints);
      }

      const snapshot = await getDocs(q);
      let transactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt descending
      transactions.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      if (filters.limitCount && filters.limitCount > 0) {
        transactions = transactions.slice(0, filters.limitCount);
      }

      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("İşlem geçmişi yüklenirken hata oluştu");
    }
  },

  async getById(id) {
    try {
      const docRef = doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw new Error("İşlem yüklenirken hata oluştu");
    }
  },

  async create(data, user, updateStock = true) {
    try {
      const transactionNumber = generateTransactionNumber(data.type);
      
      // Get item info for snapshot
      const item = await inventoryItemService.getById(data.itemId);
      if (!item) {
        throw new Error("Stok kalemi bulunamadı");
      }

      // Calculate quantity change based on type
      let quantityChange = data.quantity;
      if (data.type === TRANSACTION_TYPE.OUTBOUND) {
        quantityChange = -Math.abs(data.quantity);
      } else if (data.type === TRANSACTION_TYPE.INBOUND) {
        quantityChange = Math.abs(data.quantity);
      } else if (data.type === TRANSACTION_TYPE.ADJUSTMENT) {
        // For adjustment, use the provided quantity (can be negative)
        quantityChange = data.quantity;
      }

      const previousStock = item.stock?.quantity || 0;
      const newStock = previousStock + quantityChange;

      if (newStock < 0 && updateStock) {
        throw new Error(`Yetersiz stok. Mevcut: ${previousStock}, İstenen çıkış: ${Math.abs(quantityChange)}`);
      }

      const newTransaction = {
        transactionNumber,
        type: data.type,
        subtype: data.subtype || TRANSACTION_SUBTYPE.MANUAL,
        
        // References
        references: {
          deliveryId: data.deliveryId || null,
          orderId: data.orderId || null,
          proformaId: data.proformaId || null,
          sourceType: data.sourceType || "manual",
        },
        
        // Item info
        itemId: data.itemId,
        itemSnapshot: {
          sku: item.sku,
          name: item.name,
          category: item.category,
        },
        
        // Quantity
        quantity: quantityChange,
        unit: data.unit || item.stock?.unit || UNIT.PIECE,
        previousStock,
        newStock: updateStock ? newStock : previousStock,
        
        // Value
        unitPrice: data.unitPrice || item.pricing?.costPrice || 0,
        totalValue: Math.abs(quantityChange) * (data.unitPrice || item.pricing?.costPrice || 0),
        currency: data.currency || item.pricing?.currency || "TRY",
        
        // Warehouse
        fromWarehouseId: data.fromWarehouseId || null,
        toWarehouseId: data.toWarehouseId || data.warehouseId || item.warehouseId,
        
        // Company
        companyId: data.companyId || item.ownership?.companyId || null,
        companyName: data.companyName || item.ownership?.companyName || null,
        
        // Lot/Serial
        lotNumber: data.lotNumber || null,
        serialNumber: data.serialNumber || null,
        
        notes: data.notes || "",
        
        // Audit
        createdAt: serverTimestamp(),
        createdBy: user ? {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        } : null,
        
        status: "completed",
      };

      const docRef = await addDoc(
        collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS),
        newTransaction
      );

      // Update stock if needed
      if (updateStock) {
        await inventoryItemService.updateStock(data.itemId, quantityChange, user);
      }

      return { id: docRef.id, ...newTransaction, transactionNumber };
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw new Error(error.message || "İşlem oluşturulurken hata oluştu");
    }
  },

  async cancel(id, user) {
    try {
      const transaction = await this.getById(id);
      if (!transaction) {
        throw new Error("İşlem bulunamadı");
      }

      if (transaction.status === "cancelled") {
        throw new Error("Bu işlem zaten iptal edilmiş");
      }

      // Reverse the stock change
      const reverseQuantity = -transaction.quantity;
      await inventoryItemService.updateStock(transaction.itemId, reverseQuantity, user);

      // Update transaction status
      await updateDoc(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, id), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        cancelledBy: user ? {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        } : null,
      });

      return true;
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      throw new Error(error.message || "İşlem iptal edilirken hata oluştu");
    }
  },

  /**
   * Update transaction quantity (for migration fixes)
   * This updates quantity, newStock, and item stock directly with the entered value
   */
  async updateQuantity(id, newQuantity, user) {
    try {
      const transaction = await this.getById(id);
      if (!transaction) {
        throw new Error("İşlem bulunamadı");
      }

      if (transaction.status === "cancelled") {
        throw new Error("İptal edilmiş işlem güncellenemez");
      }

      const quantity = Number(newQuantity);
      if (isNaN(quantity)) {
        throw new Error("Geçersiz miktar");
      }

      // Calculate new total value
      const totalValue = Math.abs(quantity) * (transaction.unitPrice || 0);

      // Set all 3 fields to the entered quantity directly
      await updateDoc(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, id), {
        quantity,
        totalValue,
        newStock: quantity, // Direct assignment
        updatedAt: serverTimestamp(),
        updatedBy: user ? {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        } : null,
      });

      // Update item stock directly with the entered quantity
      if (transaction.itemId) {
        try {
          await updateDoc(doc(db, INVENTORY_COLLECTIONS.ITEMS, transaction.itemId), {
            "stock.quantity": quantity, // Direct assignment
            updatedAt: serverTimestamp(),
          });
          console.log(`Updated item ${transaction.itemId} stock to ${quantity}`);
        } catch (itemError) {
          console.error("Error updating item stock:", itemError);
        }
      }

      console.log(`Updated transaction ${id}: quantity=${quantity}, newStock=${quantity}, itemStock=${quantity}`);
      return true;
    } catch (error) {
      console.error("Error updating transaction quantity:", error);
      throw new Error(error.message || "İşlem güncellenirken hata oluştu");
    }
  },

  /**
   * Update transaction with proper stock correction and finance sync
   * When quantity changes:
   * 1. Calculate the difference
   * 2. Apply difference to item stock (reverse the diff for outbound)
   * 3. Update transaction record
   * 4. Update linked finance record if exists
   * 
   * @param {string} id - Transaction ID
   * @param {Object} updateData - { quantity, unitPrice, notes, financeTransactionId }
   * @param {Object} user - Current user
   * @returns {Object} { success, stockDiff, financeUpdated }
   */
  async updateWithCorrection(id, updateData, user) {
    try {
      const transaction = await this.getById(id);
      if (!transaction) {
        throw new Error("İşlem bulunamadı");
      }

      const oldQuantity = Math.abs(transaction.quantity);
      const newQuantity = Math.abs(Number(updateData.quantity));
      
      if (isNaN(newQuantity) || newQuantity < 0) {
        throw new Error("Geçersiz miktar");
      }

      // Calculate differences
      const quantityDiff = newQuantity - oldQuantity;
      const newUnitPrice = updateData.unitPrice !== undefined 
        ? Number(updateData.unitPrice) 
        : (transaction.unitPrice || 0);
      const newTotalValue = newQuantity * newUnitPrice;

      // Get current item stock
      const itemRef = doc(db, INVENTORY_COLLECTIONS.ITEMS, transaction.itemId);
      const itemSnap = await getDoc(itemRef);
      
      if (!itemSnap.exists()) {
        throw new Error("İlgili ürün bulunamadı");
      }

      const item = itemSnap.data();
      const currentStock = item.stock?.quantity || 0;

      // Calculate new stock based on transaction type
      // For OUTBOUND: if we reduce the outbound quantity, stock increases
      // For INBOUND: if we reduce the inbound quantity, stock decreases
      let newItemStock;
      if (transaction.type === TRANSACTION_TYPE.OUTBOUND) {
        // Outbound: quantity was subtracted, so diff should be reversed
        // Example: old=9500, new=8500 -> diff=-1000 -> stock should +1000
        newItemStock = currentStock - quantityDiff;
      } else {
        // Inbound: quantity was added
        // Example: old=100, new=150 -> diff=+50 -> stock should +50
        newItemStock = currentStock + quantityDiff;
      }

      // Ensure stock doesn't go negative
      if (newItemStock < 0) {
        throw new Error(`Stok negatif olamaz. Mevcut stok: ${currentStock}, Değişim: ${-quantityDiff}`);
      }

      // 1. Update item stock
      await updateDoc(itemRef, {
        "stock.quantity": newItemStock,
        updatedAt: serverTimestamp(),
        updatedBy: user ? {
          id: user.uid,
          name: user.displayName || user.email,
        } : null,
      });

      // 2. Update transaction
      const transactionQuantity = transaction.type === TRANSACTION_TYPE.OUTBOUND 
        ? -newQuantity 
        : newQuantity;

      await updateDoc(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, id), {
        quantity: transactionQuantity,
        unitPrice: newUnitPrice,
        totalValue: newTotalValue,
        previousStock: currentStock,
        newStock: newItemStock,
        notes: updateData.notes !== undefined ? updateData.notes : transaction.notes,
        correctedAt: serverTimestamp(),
        correctedBy: user ? {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        } : null,
        correctionHistory: [
          ...(transaction.correctionHistory || []),
          {
            date: new Date().toISOString(),
            oldQuantity: transaction.quantity,
            newQuantity: transactionQuantity,
            oldUnitPrice: transaction.unitPrice,
            newUnitPrice,
            stockBefore: currentStock,
            stockAfter: newItemStock,
            correctedBy: user?.displayName || user?.email || "System",
            reason: updateData.correctionReason || "Manuel düzeltme",
          }
        ],
      });

      // 3. Return result - finance update will be handled by the caller
      return {
        success: true,
        transactionId: id,
        itemId: transaction.itemId,
        quantityDiff,
        oldQuantity,
        newQuantity,
        oldStock: currentStock,
        newStock: newItemStock,
        oldTotalValue: transaction.totalValue,
        newTotalValue,
        financeTransactionId: updateData.financeTransactionId || transaction.financeTransactionId || null,
      };
    } catch (error) {
      console.error("Error updating transaction with correction:", error);
      throw new Error(error.message || "İşlem düzeltilirken hata oluştu");
    }
  },

  /**
   * Batch update transaction quantities and related item stocks
   * All 3 fields (quantity, newStock, item.stock.quantity) are set to the entered value directly
   * @param {Array} updates - Array of {id, quantity} objects
   * @param {Object} user - Current user for audit
   */
  async batchUpdateQuantities(updates, user) {
    try {
      // First, collect all transactions
      const transactionUpdates = [];
      const itemUpdates = {}; // itemId -> quantity (direct assignment)
      
      for (const update of updates) {
        const transaction = await this.getById(update.id);
        if (!transaction || transaction.status === "cancelled") {
          continue;
        }

        const newQuantity = Number(update.quantity);
        if (isNaN(newQuantity)) {
          continue;
        }

        const totalValue = Math.abs(newQuantity) * (transaction.unitPrice || 0);

        transactionUpdates.push({
          id: update.id,
          quantity: newQuantity,
          totalValue,
          newStock: newQuantity, // Direct assignment
          itemId: transaction.itemId,
        });

        // Set item stock directly to the entered quantity
        if (transaction.itemId) {
          itemUpdates[transaction.itemId] = newQuantity;
        }
      }

      // Batch update transactions
      const batch = writeBatch(db);
      
      for (const update of transactionUpdates) {
        const docRef = doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, update.id);
        batch.update(docRef, {
          quantity: update.quantity,
          totalValue: update.totalValue,
          newStock: update.newStock,
          updatedAt: serverTimestamp(),
          updatedBy: user ? {
            id: user.uid,
            name: user.displayName || user.email,
            email: user.email,
          } : null,
        });
      }

      await batch.commit();
      console.log(`Batch updated ${transactionUpdates.length} transactions`);

      // Update item stocks directly with the entered quantity
      for (const [itemId, quantity] of Object.entries(itemUpdates)) {
        try {
          await updateDoc(doc(db, INVENTORY_COLLECTIONS.ITEMS, itemId), {
            "stock.quantity": quantity, // Direct assignment
            updatedAt: serverTimestamp(),
          });
          console.log(`Updated item ${itemId} stock to ${quantity}`);
        } catch (itemError) {
          console.error(`Error updating item ${itemId} stock:`, itemError);
        }
      }

      return { 
        success: true, 
        transactionCount: transactionUpdates.length,
        itemsUpdated: Object.keys(itemUpdates).length
      };
    } catch (error) {
      console.error("Error batch updating transactions:", error);
      throw new Error(error.message || "Toplu güncelleme sırasında hata oluştu");
    }
  },

  async getStatistics(filters = {}) {
    try {
      const transactions = await this.getAll(filters);
      
      const stats = {
        totalTransactions: transactions.length,
        inboundCount: 0,
        outboundCount: 0,
        inboundValue: 0,
        outboundValue: 0,
        byType: {},
        bySubtype: {},
        recentTransactions: transactions.slice(0, 10),
      };

      transactions.forEach((t) => {
        if (t.status === "cancelled") return;
        
        if (t.type === TRANSACTION_TYPE.INBOUND) {
          stats.inboundCount++;
          stats.inboundValue += t.totalValue || 0;
        } else if (t.type === TRANSACTION_TYPE.OUTBOUND) {
          stats.outboundCount++;
          stats.outboundValue += t.totalValue || 0;
        }

        stats.byType[t.type] = (stats.byType[t.type] || 0) + 1;
        stats.bySubtype[t.subtype] = (stats.bySubtype[t.subtype] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("Error getting transaction statistics:", error);
      throw new Error("İşlem istatistikleri yüklenirken hata oluştu");
    }
  },
};

// ============================================
// MIGRATION SERVICE
// ============================================
export const migrationService = {
  async migratePackagingProducts({ warehouseId, defaultQuantity = 10000, createdBy }) {
    try {
      // Get all packaging products
      const packagingSnapshot = await getDocs(
        collection(db, "packaging_products")
      );
      
      const products = packagingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Use provided warehouse or ensure default exists
      let warehouse;
      if (warehouseId) {
        warehouse = await warehouseService.getById(warehouseId);
      }
      if (!warehouse) {
        warehouse = await warehouseService.ensureDefaultExists();
      }

      const results = {
        total: products.length,
        success: 0,
        skipped: 0,
        failed: 0,
        errors: [],
        skippedItems: [], // Detailed skip reasons
      };

      for (const product of products) {
        try {
          // Check if already migrated by linkedProductId only (most accurate)
          // We don't check SKU because same SKU can have different variants (size, color, material)
          const existingByLinkedId = await this.getByLinkedProductId(product.id);
          if (existingByLinkedId) {
            results.skipped++;
            results.skippedItems.push({
              productId: product.id,
              productName: product.name,
              productCode: product.code,
              reason: "Zaten migrate edilmiş (linkedProductId eşleşti)",
            });
            continue;
          }

          // Build a unique SKU that includes variant info
          // Format: CODE-UNIQUEID (using last 6 chars of product.id for uniqueness)
          // This guarantees unique SKU for each packaging product
          const productIdStr = String(product.id);
          const uniqueIdPart = productIdStr.slice(-6).toUpperCase();
          let uniqueSKU = product.code 
            ? `${product.code}-${uniqueIdPart}`
            : `PKG-${uniqueIdPart}`;

          // Create inventory item with full product info in name
          const itemName = product.name;
          
          await inventoryItemService.create({
            sku: uniqueSKU,
            name: itemName,
            description: product.description || "",
            category: ITEM_CATEGORY.PACKAGING,
            subcategory: product.category || "",
            ownershipType: OWNERSHIP_TYPE.MKN,
            initialQuantity: defaultQuantity,
            unit: UNIT.PIECE,
            costPrice: product.business?.price || 0,
            currency: product.business?.currency || "TRY",
            warehouseId: warehouse.id,
            linkedProductId: product.id,
            images: product.images || [],
            specifications: product.specifications || {},
            notes: `Packaging products'tan migrate edildi. Orijinal ID: ${product.id}`,
            status: product.metadata?.isActive !== false ? ITEM_STATUS.ACTIVE : ITEM_STATUS.INACTIVE,
          }, createdBy);

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            productId: product.id,
            productName: product.name,
            productCode: product.code,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error migrating packaging products:", error);
      throw new Error("Migration sırasında hata oluştu: " + error.message);
    }
  },

  async getByLinkedProductId(linkedProductId) {
    try {
      const q = query(
        collection(db, INVENTORY_COLLECTIONS.ITEMS),
        where("linkedProductId", "==", linkedProductId),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching item by linkedProductId:", error);
      return null;
    }
  },

  async clearAllItems() {
    try {
      // Get all items
      const itemsSnapshot = await getDocs(collection(db, INVENTORY_COLLECTIONS.ITEMS));
      const transactionsSnapshot = await getDocs(collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS));
      
      // Delete in batches (Firestore limit is 500 per batch)
      const batchSize = 450;
      let deletedItems = 0;
      let deletedTransactions = 0;

      // Delete transactions first
      const transactionBatches = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      for (const docSnap of transactionsSnapshot.docs) {
        currentBatch.delete(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, docSnap.id));
        count++;
        if (count >= batchSize) {
          transactionBatches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) {
        transactionBatches.push(currentBatch);
      }

      for (const batch of transactionBatches) {
        await batch.commit();
      }
      deletedTransactions = transactionsSnapshot.docs.length;

      // Delete items
      const itemBatches = [];
      currentBatch = writeBatch(db);
      count = 0;

      for (const docSnap of itemsSnapshot.docs) {
        currentBatch.delete(doc(db, INVENTORY_COLLECTIONS.ITEMS, docSnap.id));
        count++;
        if (count >= batchSize) {
          itemBatches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) {
        itemBatches.push(currentBatch);
      }

      for (const batch of itemBatches) {
        await batch.commit();
      }
      deletedItems = itemsSnapshot.docs.length;

      return {
        deletedItems,
        deletedTransactions,
      };
    } catch (error) {
      console.error("Error clearing inventory:", error);
      throw new Error("Envanter temizlenirken hata oluştu: " + error.message);
    }
  },

  // Tüm envanter verilerini sıfırla (items, transactions, warehouses)
  async resetAllInventoryData() {
    try {
      const batchSize = 450;
      let deletedItems = 0;
      let deletedTransactions = 0;
      let deletedWarehouses = 0;

      // 1. Get all collections
      const itemsSnapshot = await getDocs(collection(db, INVENTORY_COLLECTIONS.ITEMS));
      const transactionsSnapshot = await getDocs(collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS));
      const warehousesSnapshot = await getDocs(collection(db, INVENTORY_COLLECTIONS.WAREHOUSES));

      // 2. Delete transactions first (they reference items)
      const transactionBatches = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      for (const docSnap of transactionsSnapshot.docs) {
        currentBatch.delete(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, docSnap.id));
        count++;
        if (count >= batchSize) {
          transactionBatches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) {
        transactionBatches.push(currentBatch);
      }

      for (const batch of transactionBatches) {
        await batch.commit();
      }
      deletedTransactions = transactionsSnapshot.docs.length;

      // 3. Delete items (they reference warehouses)
      const itemBatches = [];
      currentBatch = writeBatch(db);
      count = 0;

      for (const docSnap of itemsSnapshot.docs) {
        currentBatch.delete(doc(db, INVENTORY_COLLECTIONS.ITEMS, docSnap.id));
        count++;
        if (count >= batchSize) {
          itemBatches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) {
        itemBatches.push(currentBatch);
      }

      for (const batch of itemBatches) {
        await batch.commit();
      }
      deletedItems = itemsSnapshot.docs.length;

      // 4. Delete warehouses last
      const warehouseBatches = [];
      currentBatch = writeBatch(db);
      count = 0;

      for (const docSnap of warehousesSnapshot.docs) {
        currentBatch.delete(doc(db, INVENTORY_COLLECTIONS.WAREHOUSES, docSnap.id));
        count++;
        if (count >= batchSize) {
          warehouseBatches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) {
        warehouseBatches.push(currentBatch);
      }

      for (const batch of warehouseBatches) {
        await batch.commit();
      }
      deletedWarehouses = warehousesSnapshot.docs.length;

      return {
        success: true,
        deletedItems,
        deletedTransactions,
        deletedWarehouses,
      };
    } catch (error) {
      console.error("Error resetting inventory data:", error);
      throw new Error("Envanter sıfırlanırken hata oluştu: " + error.message);
    }
  },

  /**
   * Fix outbound transactions currency - set all outbound transactions currency to TRY
   */
  async fixOutboundCurrency(targetCurrency = "TRY") {
    try {
      const transactionsSnapshot = await getDocs(
        query(
          collection(db, INVENTORY_COLLECTIONS.TRANSACTIONS),
          where("type", "==", TRANSACTION_TYPE.OUTBOUND)
        )
      );

      if (transactionsSnapshot.empty) {
        return {
          success: true,
          updatedCount: 0,
          message: "Güncellenecek outbound transaction bulunamadı.",
        };
      }

      const batchSize = 500;
      const batches = [];
      let currentBatch = writeBatch(db);
      let count = 0;
      let updatedCount = 0;

      for (const docSnap of transactionsSnapshot.docs) {
        const data = docSnap.data();
        // Only update if currency is different from target
        if (data.currency !== targetCurrency) {
          currentBatch.update(doc(db, INVENTORY_COLLECTIONS.TRANSACTIONS, docSnap.id), {
            currency: targetCurrency,
          });
          updatedCount++;
          count++;

          if (count >= batchSize) {
            batches.push(currentBatch);
            currentBatch = writeBatch(db);
            count = 0;
          }
        }
      }

      if (count > 0) {
        batches.push(currentBatch);
      }

      for (const batch of batches) {
        await batch.commit();
      }

      return {
        success: true,
        updatedCount,
        totalOutbound: transactionsSnapshot.docs.length,
        message: `${updatedCount} outbound transaction currency'si ${targetCurrency} olarak güncellendi.`,
      };
    } catch (error) {
      console.error("Error fixing outbound currency:", error);
      throw new Error("Currency düzeltilirken hata oluştu: " + error.message);
    }
  },
};

// ============================================
// QUICK OPERATIONS
// ============================================
export const quickOperations = {
  async inbound(data, user) {
    return await transactionService.create({
      type: TRANSACTION_TYPE.INBOUND,
      subtype: data.subtype || TRANSACTION_SUBTYPE.PURCHASE,
      ...data,
    }, user);
  },

  async outbound(data, user) {
    return await transactionService.create({
      type: TRANSACTION_TYPE.OUTBOUND,
      subtype: data.subtype || TRANSACTION_SUBTYPE.SALE,
      ...data,
    }, user);
  },

  async adjustment(data, user) {
    return await transactionService.create({
      type: TRANSACTION_TYPE.ADJUSTMENT,
      subtype: data.subtype || TRANSACTION_SUBTYPE.COUNT,
      ...data,
    }, user);
  },

  async transfer(data, user) {
    // Outbound from source
    await transactionService.create({
      type: TRANSACTION_TYPE.OUTBOUND,
      subtype: TRANSACTION_SUBTYPE.MANUAL,
      itemId: data.itemId,
      quantity: data.quantity,
      fromWarehouseId: data.fromWarehouseId,
      notes: `Transfer: ${data.fromWarehouseId} -> ${data.toWarehouseId}`,
    }, user);

    // Update item warehouse
    await inventoryItemService.update(data.itemId, {
      warehouseId: data.toWarehouseId,
    }, user);

    // Inbound to destination
    return await transactionService.create({
      type: TRANSACTION_TYPE.INBOUND,
      subtype: TRANSACTION_SUBTYPE.MANUAL,
      itemId: data.itemId,
      quantity: data.quantity,
      toWarehouseId: data.toWarehouseId,
      notes: `Transfer: ${data.fromWarehouseId} -> ${data.toWarehouseId}`,
    }, user);
  },
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default {
  warehouseService,
  supplierService,
  inventoryItemService,
  transactionService,
  migrationService,
  quickOperations,
  // Constants
  INVENTORY_COLLECTIONS,
  ITEM_CATEGORY,
  ITEM_CATEGORY_LABELS,
  OWNERSHIP_TYPE,
  OWNERSHIP_TYPE_LABELS,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_SUBTYPE,
  TRANSACTION_SUBTYPE_LABELS,
  ITEM_STATUS,
  ITEM_STATUS_LABELS,
  UNIT,
  UNIT_LABELS,
  // Helpers
  generateSKU,
  generateTransactionNumber,
};
