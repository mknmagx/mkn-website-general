'use client';

import { useState, useEffect } from 'react';
import { RequestService, REQUEST_STATUS, REQUEST_CATEGORIES, REQUEST_PRIORITY } from '../lib/services/request-service';

/**
 * Custom hook for request management
 */
export function useRequests(options = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);

  const loadRequests = async (resetList = true) => {
    try {
      if (resetList) {
        setLoading(true);
        setError(null);
      }

      const result = await RequestService.getRequests({
        ...options,
        lastDoc: resetList ? null : lastDoc
      });

      if (result.success) {
        if (resetList) {
          setRequests(result.requests);
        } else {
          setRequests(prev => [...prev, ...result.requests]);
        }
        setHasMore(result.hasMore);
        setLastDoc(result.lastDoc);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadRequests(false);
    }
  };

  const refreshRequests = () => {
    loadRequests(true);
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    options.status,
    options.category,
    options.priority,
    options.searchTerm,
    options.limitCount
  ]);

  return {
    requests,
    loading,
    error,
    hasMore,
    loadMore,
    refreshRequests
  };
}

/**
 * Single request hook
 */
export function useRequest(requestId) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRequest = async () => {
    if (!requestId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await RequestService.getRequest(requestId);

      if (result.success) {
        setRequest(result.request);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (updateData) => {
    try {
      const result = await RequestService.updateRequest(requestId, updateData);
      
      if (result.success) {
        // Refresh request data
        await loadRequest();
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMsg = err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const addNote = async (noteData) => {
    try {
      const result = await RequestService.addRequestNote(requestId, noteData);
      
      if (result.success) {
        // Refresh request data
        await loadRequest();
      }
      
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const addFollowUp = async (followUpData) => {
    try {
      const result = await RequestService.addFollowUp(requestId, followUpData);
      
      if (result.success) {
        // Refresh request data
        await loadRequest();
      }
      
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  return {
    request,
    loading,
    error,
    updateRequest,
    addNote,
    addFollowUp,
    refreshRequest: loadRequest
  };
}

/**
 * Request creation hook
 */
export function useRequestCreation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRequest = async (requestData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await RequestService.createRequest(requestData);
      
      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMsg = err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    createRequest,
    loading,
    error
  };
}

/**
 * Request statistics hook
 */
export function useRequestStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await RequestService.getRequestStats();

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
    refreshStats: loadStats
  };
}

/**
 * Request search hook
 */
export function useRequestSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchRequests = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await RequestService.searchRequests(searchTerm);

      if (result.success) {
        setResults(result.requests);
      } else {
        setError(result.error);
        setResults([]);
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    searchRequests,
    clearResults
  };
}