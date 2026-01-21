'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommunicationService } from '../lib/services/communication-service';

/**
 * Hook: Talebe ait iletişimleri yönetir
 */
export function useRequestCommunications(requestId) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const loadCommunications = useCallback(async () => {
    if (!requestId) {
      setCommunications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await CommunicationService.getByRequest(requestId);

      if (result.success) {
        setCommunications(result.communications);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const loadStats = useCallback(async () => {
    if (!requestId) return;

    try {
      const result = await CommunicationService.getStats(requestId);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error("Stats yüklenirken hata:", err);
    }
  }, [requestId]);

  // İletişim ekle
  const addCommunication = useCallback(async (data) => {
    try {
      const result = await CommunicationService.create({
        ...data,
        requestId,
      });

      if (result.success) {
        await loadCommunications();
        await loadStats();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [requestId, loadCommunications, loadStats]);

  // Not ekle
  const addNote = useCallback(async (content, user) => {
    try {
      const result = await CommunicationService.addNote(requestId, content, user);

      if (result.success) {
        await loadCommunications();
        await loadStats();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [requestId, loadCommunications, loadStats]);

  // E-posta kaydı ekle
  const addOutgoingEmail = useCallback(async (emailData, user) => {
    try {
      const result = await CommunicationService.addOutgoingEmail(requestId, emailData, user);

      if (result.success) {
        await loadCommunications();
        await loadStats();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [requestId, loadCommunications, loadStats]);

  // Telefon kaydı ekle
  const addPhoneCall = useCallback(async (callData, user) => {
    try {
      const result = await CommunicationService.addPhoneCall(requestId, callData, user);

      if (result.success) {
        await loadCommunications();
        await loadStats();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [requestId, loadCommunications, loadStats]);

  // İletişim güncelle
  const updateCommunication = useCallback(async (id, data) => {
    try {
      const result = await CommunicationService.update(id, data);

      if (result.success) {
        await loadCommunications();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadCommunications]);

  // İletişim sil
  const deleteCommunication = useCallback(async (id) => {
    try {
      const result = await CommunicationService.delete(id);

      if (result.success) {
        await loadCommunications();
        await loadStats();
      }

      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [loadCommunications, loadStats]);

  // İlk yükleme
  useEffect(() => {
    loadCommunications();
    loadStats();
  }, [loadCommunications, loadStats]);

  return {
    communications,
    loading,
    error,
    stats,
    refresh: loadCommunications,
    addCommunication,
    addNote,
    addOutgoingEmail,
    addPhoneCall,
    updateCommunication,
    deleteCommunication,
  };
}

/**
 * Hook: Şirkete ait iletişimleri yönetir
 */
export function useCompanyCommunications(companyId) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCommunications = useCallback(async () => {
    if (!companyId) {
      setCommunications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await CommunicationService.getByCompany(companyId);

      if (result.success) {
        setCommunications(result.communications);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadCommunications();
  }, [loadCommunications]);

  return {
    communications,
    loading,
    error,
    refresh: loadCommunications,
  };
}

export default useRequestCommunications;
