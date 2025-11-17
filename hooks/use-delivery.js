'use client';

import { useState, useEffect } from 'react';
import { DeliveryService } from '../lib/services/delivery-service';

/**
 * Hook for delivery list
 */
export function useDeliveries(filters = {}) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.getDeliveries(filters);

      if (result.success) {
        setDeliveries(result.deliveries);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [JSON.stringify(filters)]);

  return {
    deliveries,
    loading,
    error,
    refresh: fetchDeliveries
  };
}

/**
 * Hook for single delivery
 */
export function useDelivery(id) {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDelivery = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.getDelivery(id);

      if (result.success) {
        setDelivery(result.delivery);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  return {
    delivery,
    loading,
    error,
    refresh: fetchDelivery
  };
}

/**
 * Hook for creating delivery
 */
export function useCreateDelivery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDelivery = async (deliveryData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.createDelivery(deliveryData);

      if (result.success) {
        return { 
          success: true, 
          id: result.id,
          deliveryNumber: result.deliveryNumber 
        };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    createDelivery,
    loading,
    error
  };
}

/**
 * Hook for updating delivery
 */
export function useUpdateDelivery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDelivery = async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.updateDelivery(id, updateData);

      if (result.success) {
        return { success: true, id: result.id };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, deliveryInfo = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.updateDeliveryStatus(id, status, deliveryInfo);

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateDelivery,
    updateStatus,
    loading,
    error
  };
}

/**
 * Hook for deleting delivery
 */
export function useDeleteDelivery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteDelivery = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.deleteDelivery(id);

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteDelivery,
    loading,
    error
  };
}

/**
 * Hook for company deliveries
 */
export function useCompanyDeliveries(companyId) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeliveries = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.getDeliveriesByCompany(companyId);

      if (result.success) {
        setDeliveries(result.deliveries);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [companyId]);

  return {
    deliveries,
    loading,
    error,
    refresh: fetchDeliveries
  };
}

/**
 * Hook for delivery statistics
 */
export function useDeliveryStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.getDeliveryStats();

      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
}

/**
 * Hook for updating PDF URL
 */
export function useUpdatePdfUrl() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePdfUrl = async (id, pdfUrl) => {
    try {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.updatePdfUrl(id, pdfUrl);

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    updatePdfUrl,
    loading,
    error
  };
}