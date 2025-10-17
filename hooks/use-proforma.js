'use client';

import { useState, useEffect } from 'react';
import { ProformaService } from '../lib/services/proforma-service';

/**
 * Proforma listesi için hook
 */
export function useProformas(filters = {}) {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProformas = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.getProformas(filters);

      if (result.success) {
        setProformas(result.proformas);
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
    loadProformas();
  }, [JSON.stringify(filters)]);

  return {
    proformas,
    loading,
    error,
    refresh: loadProformas
  };
}

/**
 * Tek proforma için hook
 */
export function useProforma(id) {
  const [proforma, setProforma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProforma = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.getProforma(id);

      if (result.success) {
        setProforma(result.proforma);
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
    loadProforma();
  }, [id]);

  return {
    proforma,
    loading,
    error,
    refresh: loadProforma
  };
}

/**
 * Proforma oluşturma için hook
 */
export function useCreateProforma() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProforma = async (proformaData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.createProforma(proformaData);

      if (result.success) {
        return { 
          success: true, 
          id: result.id,
          proformaNumber: result.proformaNumber 
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
    createProforma,
    loading,
    error
  };
}

/**
 * Proforma güncelleme için hook
 */
export function useUpdateProforma() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProforma = async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.updateProforma(id, updateData);

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

  const updateStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.updateProformaStatus(id, status);

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
    updateProforma,
    updateStatus,
    loading,
    error
  };
}

/**
 * Proforma silme için hook
 */
export function useDeleteProforma() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteProforma = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.deleteProforma(id);

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
    deleteProforma,
    loading,
    error
  };
}

/**
 * Firmaya ait proformalar için hook
 */
export function useCompanyProformas(companyId) {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProformas = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.getProformasByCompany(companyId);

      if (result.success) {
        setProformas(result.proformas);
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
    loadProformas();
  }, [companyId]);

  return {
    proformas,
    loading,
    error,
    refresh: loadProformas
  };
}

/**
 * Proforma istatistikleri için hook
 */
export function useProformaStats() {
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    totalValue: 0,
    acceptedValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.getProformaStats();

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
    loadStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
}

/**
 * PDF URL güncelleme için hook
 */
export function useUpdatePdfUrl() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePdfUrl = async (id, pdfUrl) => {
    try {
      setLoading(true);
      setError(null);

      const result = await ProformaService.updatePdfUrl(id, pdfUrl);

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