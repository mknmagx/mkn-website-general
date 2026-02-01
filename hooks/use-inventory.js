"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  inventoryItemService,
  transactionService,
  warehouseService,
  supplierService,
  migrationService,
  quickOperations,
  ITEM_STATUS,
} from "../lib/services/inventory-service";

// ============================================
// useInventoryItems - Stok kalemleri hook
// ============================================
export function useInventoryItems(filters = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryItemService.getAll(filters);
      setItems(data);
    } catch (err) {
      console.error("Error loading inventory items:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const refresh = useCallback(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    refresh,
    setItems,
  };
}

// ============================================
// useInventoryItem - Tek stok kalemi hook
// ============================================
export function useInventoryItem(id) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadItem = useCallback(async () => {
    if (!id) {
      setItem(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryItemService.getById(id);
      setItem(data);
    } catch (err) {
      console.error("Error loading inventory item:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const refresh = useCallback(() => {
    loadItem();
  }, [loadItem]);

  return {
    item,
    loading,
    error,
    refresh,
    setItem,
  };
}

// ============================================
// useInventoryStatistics - İstatistik hook
// ============================================
export function useInventoryStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryItemService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error("Error loading statistics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = useCallback(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}

// ============================================
// useTransactions - İşlem geçmişi hook
// ============================================
export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll(filters);
      setTransactions(data);
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const refresh = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    refresh,
    setTransactions,
  };
}

// ============================================
// useTransactionStatistics - İşlem istatistikleri hook
// ============================================
export function useTransactionStatistics(filters = {}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getStatistics(filters);
      setStats(data);
    } catch (err) {
      console.error("Error loading transaction statistics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = useCallback(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}

// ============================================
// useWarehouses - Depo hook
// ============================================
export function useWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await warehouseService.getAll();
      setWarehouses(data);
    } catch (err) {
      console.error("Error loading warehouses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const refresh = useCallback(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const createWarehouse = useCallback(async (data) => {
    const newWarehouse = await warehouseService.create(data);
    setWarehouses((prev) => [...prev, newWarehouse]);
    return newWarehouse;
  }, []);

  const updateWarehouse = useCallback(async (id, data) => {
    const updated = await warehouseService.update(id, data);
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id ? updated : w))
    );
    return updated;
  }, []);

  const deleteWarehouse = useCallback(async (id) => {
    await warehouseService.delete(id);
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return {
    warehouses,
    loading,
    error,
    refresh,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  };
}

// ============================================
// useSuppliers - Tedarikçi hook
// ============================================
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error("Error loading suppliers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const refresh = useCallback(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const createSupplier = useCallback(async (data) => {
    const newSupplier = await supplierService.create(data);
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback(async (id, data) => {
    const updated = await supplierService.update(id, data);
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    );
    return updated;
  }, []);

  const deleteSupplier = useCallback(async (id) => {
    await supplierService.delete(id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    suppliers,
    loading,
    error,
    refresh,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}

// ============================================
// useInventoryOperations - İşlem operasyonları hook
// ============================================
export function useInventoryOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createItem = useCallback(async (data, user) => {
    try {
      setLoading(true);
      setError(null);
      const result = await inventoryItemService.create(data, user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id, data, user) => {
    try {
      setLoading(true);
      setError(null);
      const result = await inventoryItemService.update(id, data, user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryItemService.delete(id);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const hardDeleteItem = useCallback(async (id, deleteTransactions = false) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryItemService.hardDelete(id, deleteTransactions);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inbound = useCallback(async (data, user) => {
    try {
      setLoading(true);
      setError(null);
      const result = await quickOperations.inbound(data, user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const outbound = useCallback(async (data, user) => {
    try {
      setLoading(true);
      setError(null);
      const result = await quickOperations.outbound(data, user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustment = useCallback(async (data, user) => {
    try {
      setLoading(true);
      setError(null);
      const result = await quickOperations.adjustment(data, user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const transfer = useCallback(async (data, user) => {
    try {
      setLoading(true);
      setError(null);
      const result = await quickOperations.transfer(data, user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelTransaction = useCallback(async (id, user) => {
    try {
      setLoading(true);
      setError(null);
      await transactionService.cancel(id, user);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const migrate = useCallback(async (user, defaultQuantity = 10000) => {
    try {
      setLoading(true);
      setError(null);
      const result = await migrationService.migratePackagingProducts(user, defaultQuantity);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    hardDeleteItem,
    inbound,
    outbound,
    adjustment,
    transfer,
    cancelTransaction,
    migrate,
  };
}

// ============================================
// useInventorySearch - Arama hook
// ============================================
export function useInventorySearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const search = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await inventoryItemService.search(term);
      setResults(data);
    } catch (err) {
      console.error("Error searching:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        search(searchTerm);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, search]);

  return {
    results,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    search,
  };
}

// ============================================
// useItemTransactions - Ürün işlem geçmişi hook
// ============================================
export function useItemTransactions(itemId) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTransactions = useCallback(async () => {
    if (!itemId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll({ itemId });
      setTransactions(data);
    } catch (err) {
      console.error("Error loading item transactions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const refresh = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    refresh,
  };
}

// ============================================
// useLowStockItems - Düşük stok uyarısı hook
// ============================================
export function useLowStockItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allItems = await inventoryItemService.getAll({ status: ITEM_STATUS.ACTIVE });
      
      const lowStock = allItems.filter((item) => {
        const quantity = item.stock?.quantity || 0;
        const minStock = item.stock?.minStockLevel || 0;
        return minStock > 0 && quantity <= minStock;
      });
      
      setItems(lowStock);
    } catch (err) {
      console.error("Error loading low stock items:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const refresh = useCallback(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    refresh,
    count: items.length,
  };
}

export default {
  useInventoryItems,
  useInventoryItem,
  useInventoryStatistics,
  useTransactions,
  useTransactionStatistics,
  useWarehouses,
  useSuppliers,
  useInventoryOperations,
  useInventorySearch,
  useItemTransactions,
  useLowStockItems,
};
