'use client';

import { useState, useEffect } from 'react';
import { CompanyService } from '../lib/services/company-service';

export function useCompanies(options = {}) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);

  const loadCompanies = async (resetList = true) => {
    try {
      if (resetList) {
        setLoading(true);
        setError(null);
      }

      const result = await CompanyService.getCompanies({
        ...options,
        lastDoc: resetList ? null : lastDoc
      });

      if (result.success) {
        if (resetList) {
          setCompanies(result.companies);
        } else {
          setCompanies(prev => [...prev, ...result.companies]);
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
    if (!loading && hasMore) {
      loadCompanies(false);
    }
  };

  const refresh = () => {
    loadCompanies(true);
  };

  useEffect(() => {
    loadCompanies(true);
  }, [JSON.stringify(options)]);

  return {
    companies,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}

export function useCompany(id) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCompany = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await CompanyService.getCompany(id);

      if (result.success) {
        setCompany(result.company);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (updateData) => {
    try {
      const result = await CompanyService.updateCompany(id, updateData);
      
      if (result.success) {
        setCompany(prev => ({ ...prev, ...updateData }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteCompany = async () => {
    try {
      const result = await CompanyService.deleteCompany(id);
      
      if (result.success) {
        setCompany(null);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const addNote = async (noteData) => {
    try {
      const result = await CompanyService.addCompanyNote(id, noteData);
      
      if (result.success) {
        setCompany(prev => ({
          ...prev,
          notes: [result.note, ...(prev.notes || [])]
        }));
        return { success: true, note: result.note };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const addReminder = async (reminderData) => {
    try {
      const result = await CompanyService.addCompanyReminder(id, reminderData);
      
      if (result.success) {
        setCompany(prev => ({
          ...prev,
          reminders: [...(prev.reminders || []), result.reminder]
        }));
        return { success: true, reminder: result.reminder };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateReminderStatus = async (reminderId, status) => {
    try {
      const result = await CompanyService.updateReminderStatus(id, reminderId, status);
      
      if (result.success) {
        setCompany(prev => ({
          ...prev,
          reminders: (prev.reminders || []).map(reminder =>
            reminder.id === reminderId
              ? { ...reminder, status }
              : reminder
          )
        }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    loadCompany();
  }, [id]);

  return {
    company,
    loading,
    error,
    updateCompany,
    deleteCompany,
    addNote,
    addReminder,
    updateReminderStatus,
    refresh: loadCompany
  };
}

export function useCompanyStats() {
  const [stats, setStats] = useState({
    total: 0,
    clients: 0,
    prospects: 0,
    active: 0,
    inactive: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await CompanyService.getCompanyStats();

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

export function useCompanySearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await CompanyService.searchCompanies(searchTerm.trim());

      if (result.success) {
        setResults(result.companies);
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
    search,
    clearResults
  };
}

export function useUpcomingReminders(daysAhead = 7) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReminders = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await CompanyService.getUpcomingReminders(daysAhead);

      if (result.success) {
        setReminders(result.companies);
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
    loadReminders();
  }, [daysAhead]);

  return {
    reminders,
    loading,
    error,
    refresh: loadReminders
  };
}

export function useCreateCompany() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCompany = async (companyData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await CompanyService.createCompany(companyData);

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

  return {
    createCompany,
    loading,
    error
  };
}