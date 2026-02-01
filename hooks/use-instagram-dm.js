"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for Instagram DM operations
 * Provides state management and API calls for conversations, messages, and settings
 */
export function useInstagramDM() {
  const { toast } = useToast();
  
  // Connection status
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  
  // Conversations
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  // Messages
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Quick Replies
  const [quickReplies, setQuickReplies] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    tag: null,
    assignedTo: null,
  });
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    open: 0,
    pending: 0,
  });
  
  // Polling interval
  const pollingRef = useRef(null);
  
  /**
   * Check connection status
   */
  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=test");
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(data.data.connected);
        setConnectionStatus(data.data);
      } else {
        setIsConnected(false);
        setConnectionStatus(null);
      }
      
      return data.data;
    } catch (error) {
      console.error("Error checking connection:", error);
      setIsConnected(false);
      return null;
    }
  }, []);
  
  /**
   * Fetch conversations list
   */
  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      
      const params = new URLSearchParams();
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.tag) params.set("tag", filters.tag);
      if (filters.assignedTo) params.set("assignedTo", filters.assignedTo);
      
      const url = `/api/admin/instagram-dm/conversations${params.toString() ? "?" + params.toString() : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.data || []);
        
        // Calculate stats
        const all = data.data || [];
        setStats({
          total: all.length,
          unread: all.filter(c => c.unreadCount > 0).length,
          open: all.filter(c => c.status === "open").length,
          pending: all.filter(c => c.status === "pending").length,
        });
      }
      
      return data.data || [];
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Hata",
        description: "Konuşmalar yüklenemedi",
        variant: "destructive",
      });
      return [];
    } finally {
      setConversationsLoading(false);
    }
  }, [filters, toast]);
  
  /**
   * Fetch messages for a conversation
   */
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return [];
    
    try {
      setMessagesLoading(true);
      
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages || []);
        
        // Update selected conversation
        if (data.data.conversation) {
          setSelectedConversation(data.data.conversation);
        }
        
        return data.data.messages || [];
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Hata",
        description: "Mesajlar yüklenemedi",
        variant: "destructive",
      });
      return [];
    } finally {
      setMessagesLoading(false);
    }
  }, [toast]);
  
  /**
   * Send a message
   */
  const sendMessage = useCallback(async (conversationId, text, attachments = []) => {
    try {
      const response = await fetch("/api/admin/instagram-dm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          text,
          attachments,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add message to list
        setMessages(prev => [...prev, data.data]);
        
        // Refresh conversation list to update preview
        fetchConversations();
        
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Hata",
        description: error.message || "Mesaj gönderilemedi",
        variant: "destructive",
      });
      return null;
    }
  }, [fetchConversations, toast]);
  
  /**
   * Mark conversation as read
   */
  const markAsRead = useCallback(async (conversationId) => {
    try {
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead" }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update conversation in list
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, []);
  
  /**
   * Update conversation status
   */
  const updateStatus = useCallback(async (conversationId, status) => {
    try {
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId ? { ...c, status } : c
          )
        );
        
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => ({ ...prev, status }));
        }
        
        toast({
          title: "Güncellendi",
          description: "Konuşma durumu değiştirildi",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Hata",
        description: "Durum güncellenemedi",
        variant: "destructive",
      });
    }
  }, [selectedConversation, toast]);
  
  /**
   * Add tag to conversation
   */
  const addTag = useCallback(async (conversationId, tag) => {
    try {
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addTag", tag }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { ...c, tags: [...(c.tags || []), tag] } 
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  }, []);
  
  /**
   * Remove tag from conversation
   */
  const removeTag = useCallback(async (conversationId, tag) => {
    try {
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeTag", tag }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { ...c, tags: (c.tags || []).filter(t => t !== tag) } 
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  }, []);
  
  /**
   * Sync conversations from Instagram
   */
  const syncFromInstagram = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Senkronize Edildi",
          description: "Konuşmalar Instagram'dan güncellendi",
        });
        fetchConversations();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error syncing:", error);
      toast({
        title: "Hata",
        description: error.message || "Senkronizasyon başarısız",
        variant: "destructive",
      });
    }
  }, [fetchConversations, toast]);
  
  /**
   * Fetch quick replies
   */
  const fetchQuickReplies = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/quick-replies");
      const data = await response.json();
      
      if (data.success) {
        setQuickReplies(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching quick replies:", error);
    }
  }, []);
  
  /**
   * Select a conversation
   */
  const selectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    if (conversation?.id) {
      fetchMessages(conversation.id);
      markAsRead(conversation.id);
    }
  }, [fetchMessages, markAsRead]);
  
  /**
   * Start polling for new messages
   */
  const startPolling = useCallback((interval = 30000) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    pollingRef.current = setInterval(() => {
      fetchConversations();
      if (selectedConversation?.id) {
        fetchMessages(selectedConversation.id);
      }
    }, interval);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchConversations, fetchMessages, selectedConversation]);
  
  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    checkConnection();
    fetchConversations();
    fetchQuickReplies();
    
    // Start polling
    const cleanup = startPolling();
    
    return () => {
      cleanup();
      stopPolling();
    };
  }, []);
  
  // Update filters effect
  useEffect(() => {
    fetchConversations();
  }, [filters.status, filters.tag, filters.assignedTo]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchConversations();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters.search]);
  
  return {
    // Connection
    isConnected,
    connectionStatus,
    checkConnection,
    
    // Conversations
    conversations,
    conversationsLoading,
    selectedConversation,
    selectConversation,
    fetchConversations,
    markAsRead,
    updateStatus,
    addTag,
    removeTag,
    syncFromInstagram,
    
    // Messages
    messages,
    messagesLoading,
    fetchMessages,
    sendMessage,
    
    // Quick Replies
    quickReplies,
    fetchQuickReplies,
    
    // Filters
    filters,
    setFilters,
    
    // Stats
    stats,
    
    // Polling
    startPolling,
    stopPolling,
  };
}

/**
 * Hook for quick reply operations
 */
export function useQuickReplies() {
  const { toast } = useToast();
  const [quickReplies, setQuickReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchQuickReplies = useCallback(async (category = null) => {
    try {
      setLoading(true);
      const url = category 
        ? `/api/admin/instagram-dm/quick-replies?category=${category}`
        : "/api/admin/instagram-dm/quick-replies";
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setQuickReplies(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching quick replies:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createQuickReply = useCallback(async (quickReply) => {
    try {
      const response = await fetch("/api/admin/instagram-dm/quick-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickReply),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuickReplies(prev => [...prev, data.data]);
        toast({
          title: "Oluşturuldu",
          description: "Hazır yanıt eklendi",
        });
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Oluşturulamadı",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);
  
  const updateQuickReply = useCallback(async (id, updates) => {
    try {
      const response = await fetch(`/api/admin/instagram-dm/quick-replies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuickReplies(prev => prev.map(qr => qr.id === id ? { ...qr, ...updates } : qr));
        toast({
          title: "Güncellendi",
          description: "Hazır yanıt güncellendi",
        });
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Güncellenemedi",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);
  
  const deleteQuickReply = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/admin/instagram-dm/quick-replies/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuickReplies(prev => prev.filter(qr => qr.id !== id));
        toast({
          title: "Silindi",
          description: "Hazır yanıt kaldırıldı",
        });
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Silinemedi",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);
  
  useEffect(() => {
    fetchQuickReplies();
  }, []);
  
  return {
    quickReplies,
    loading,
    fetchQuickReplies,
    createQuickReply,
    updateQuickReply,
    deleteQuickReply,
  };
}

/**
 * Hook for Instagram DM settings
 */
export function useInstagramDMSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/instagram-dm/settings");
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const saveSettings = useCallback(async (newSettings) => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/instagram-dm/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        toast({
          title: "Kaydedildi",
          description: "Ayarlar güncellendi",
        });
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Kaydedilemedi",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  }, [toast]);
  
  const testConnection = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/settings?action=test");
      const data = await response.json();
      
      if (data.success && data.data.connected) {
        toast({
          title: "Bağlantı Başarılı",
          description: "Instagram API'ye bağlanıldı",
        });
        return data.data;
      } else {
        toast({
          title: "Bağlantı Başarısız",
          description: data.error || "API'ye bağlanılamadı",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Test yapılamadı",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);
  
  const disconnect = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/settings", {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(null);
        toast({
          title: "Bağlantı Kesildi",
          description: "Instagram hesabı bağlantısı kaldırıldı",
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bağlantı kesilemedi",
        variant: "destructive",
      });
    }
    return false;
  }, [toast]);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  return {
    settings,
    loading,
    saving,
    fetchSettings,
    saveSettings,
    testConnection,
    disconnect,
  };
}

export default useInstagramDM;
