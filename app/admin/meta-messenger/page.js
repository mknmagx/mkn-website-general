"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  Search,
  Send,
  MoreVertical,
  User,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  RefreshCw,
  Archive,
  Tag,
  Inbox,
  Settings,
  RotateCcw,
  Facebook,
  Trash2,
  Eraser,
} from "lucide-react";

// Custom Meta Icon Component
const MetaMessengerIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.548 3.7 7.254V22l3.405-1.87c.91.252 1.873.388 2.895.388 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.054 12.443l-2.55-2.723-4.974 2.723 5.47-5.805 2.612 2.723 4.912-2.723-5.47 5.805z"/>
  </svg>
);

// Custom Instagram Icon
const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

import {
  CONVERSATION_STATUS,
  getConversationStatusLabel,
  getConversationStatusColor,
  getTagLabel,
  getTagColor,
  CONVERSATION_TAGS,
} from "@/lib/services/instagram-dm/schema";

// Message status constants
const MESSAGE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
};

export default function MetaMessengerInboxPage() {
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [retryingId, setRetryingId] = useState(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/instagram-dm/conversations?status=${statusFilter}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      // Silent fail for background refresh
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch quick replies
  const fetchQuickReplies = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/quick-replies");
      const data = await response.json();

      if (data.success) {
        setQuickReplies(data.data || []);
      }
    } catch (error) {
      // Silent fail - quick replies are optional
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedConversation(data.data.conversation);
        setMessages(data.data.messages || []);
        setPendingMessages(prev => prev.filter(m => m.conversationId !== conversationId));
      }
    } catch (error) {
      toast({
        title: "Mesajlar yüklenemedi",
        description: "Lütfen tekrar deneyin",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Send message
  const handleSendMessage = async (retryMessage = null) => {
    const content = retryMessage?.content || messageInput.trim();
    const tempId = retryMessage?.tempId || `temp_${Date.now()}`;
    
    if (!content || !selectedConversation) return;

    if (!retryMessage) {
      setMessageInput("");
    }
    
    if (retryMessage) {
      setRetryingId(tempId);
      setPendingMessages(prev => prev.map(m => 
        m.tempId === tempId ? { ...m, status: MESSAGE_STATUS.PENDING } : m
      ));
    } else {
      const pendingMsg = {
        tempId,
        conversationId: selectedConversation.id,
        content,
        status: MESSAGE_STATUS.PENDING,
        sentAt: new Date(),
        isFromCustomer: false,
      };
      setPendingMessages(prev => [...prev, pendingMsg]);
    }

    setSending(true);

    try {
      const response = await fetch("/api/admin/instagram-dm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPendingMessages(prev => prev.filter(m => m.tempId !== tempId));
        await fetchMessages(selectedConversation.id);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setPendingMessages(prev => prev.map(m => 
        m.tempId === tempId ? { ...m, status: MESSAGE_STATUS.FAILED, error: error.message } : m
      ));
      toast({
        title: "Mesaj gönderilemedi",
        description: error.message?.includes("capability") 
          ? "App Review onayı gerekli" 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
      setRetryingId(null);
    }
  };

  // Retry failed message
  const handleRetry = (msg) => {
    handleSendMessage(msg);
  };

  // Delete pending message
  const handleDeletePending = (tempId) => {
    setPendingMessages(prev => prev.filter(m => m.tempId !== tempId));
  };

  // Update conversation status
  const handleUpdateStatus = async (conversationId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateStatus",
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchConversations();
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(data.data);
        }
      }
    } catch (error) {
      toast({
        title: "Durum güncellenemedi",
        variant: "destructive",
      });
    }
  };

  // Add tag
  const handleAddTag = async (conversationId, tag) => {
    try {
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addTag",
          tag,
        }),
      });

      if (response.ok) {
        await fetchConversations();
        if (selectedConversation?.id === conversationId) {
          await fetchMessages(conversationId);
        }
      }
    } catch (error) {
      toast({
        title: "Etiket eklenemedi",
        variant: "destructive",
      });
    }
  };

  // Clear conversation messages
  const handleClearMessages = async (conversationId) => {
    if (!confirm("Bu konuşmanın tüm mesajları silinecek. Emin misiniz?")) return;

    try {
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clearMessages",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Mesajlar Temizlendi",
          description: "Konuşma içeriği silindi",
        });
        // Refresh messages
        if (selectedConversation?.id === conversationId) {
          await fetchMessages(conversationId);
        }
      } else {
        throw new Error(data.error || "İşlem başarısız");
      }
    } catch (error) {
      toast({
        title: "Mesajlar temizlenemedi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId) => {
    if (!confirm("Bu konuşma kalıcı olarak silinecek. Emin misiniz?")) return;

    try {
      const response = await fetch(`/api/admin/instagram-dm/conversations/${conversationId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Konuşma Silindi",
          description: "Konuşma kalıcı olarak kaldırıldı",
        });
        // Clear selected conversation if it was deleted
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }
        // Refresh conversation list
        await fetchConversations();
      } else {
        throw new Error(data.error || "İşlem başarısız");
      }
    } catch (error) {
      toast({
        title: "Konuşma silinemedi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Quick reply insert
  const handleQuickReply = (quickReply) => {
    setMessageInput(quickReply.content);
    inputRef.current?.focus();
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchQuickReplies();
  }, [fetchConversations, fetchQuickReplies]);

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingMessages]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      conv.igUsername?.toLowerCase().includes(search) ||
      conv.lastMessagePreview?.toLowerCase().includes(search)
    );
  });

  // Get pending messages for current conversation
  const currentPendingMessages = pendingMessages.filter(
    m => m.conversationId === selectedConversation?.id
  );

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      let date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "";
      }
      
      if (isNaN(date.getTime())) {
        return "";
      }
      
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return "";
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      let date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      if (isNaN(date.getTime())) return "";
      return format(date, 'HH:mm', { locale: tr });
    } catch {
      return "";
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 bg-gray-50/50 overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-80 border-r border-gray-200/80 bg-white flex flex-col shadow-sm min-h-0">
          {/* Header */}
          <div className="h-14 px-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <MetaMessengerIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">Meta Mesajlar</span>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Facebook className="h-2.5 w-2.5" />
                  <span>+</span>
                  <span>Instagram</span>
                </div>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-gray-100"
                  onClick={fetchConversations}
                >
                  <RefreshCw className={cn("h-4 w-4 text-gray-500", loading && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Yenile</TooltipContent>
            </Tooltip>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Konuşmalarda ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="px-3 py-2 border-b border-gray-100 flex gap-1">
            {[
              { value: "open", label: "Açık", icon: Inbox },
              { value: "closed", label: "Kapalı", icon: Archive },
              { value: "all", label: "Tümü", icon: MessageSquare },
            ].map((status) => (
              <Button
                key={status.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-1 h-8 text-xs gap-1.5 rounded-lg transition-all",
                  statusFilter === status.value 
                    ? "bg-gray-900 text-white hover:bg-gray-800" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
                onClick={() => setStatusFilter(status.value)}
              >
                <status.icon className="h-3.5 w-3.5" />
                {status.label}
              </Button>
            ))}
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-3 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl">
                    <div className="h-11 w-11 rounded-full shrink-0 bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Inbox className="h-12 w-12 mb-3 stroke-[1.5]" />
                <p className="text-sm font-medium text-gray-500">Konuşma bulunamadı</p>
                <p className="text-xs mt-1">Yeni mesajlar burada görünecek</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => fetchMessages(conv.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200",
                      selectedConversation?.id === conv.id
                        ? "bg-blue-50 border border-blue-100"
                        : "hover:bg-gray-50 border border-transparent"
                    )}
                  >
                  {/* Avatar */}
                    <div className="relative shrink-0">
                      {conv.profilePicUrl ? (
                        <img
                          src={conv.profilePicUrl}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center ring-2 ring-white shadow-sm">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      {/* Platform Indicator */}
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white",
                        conv.platform === 'facebook' 
                          ? "bg-blue-600" 
                          : "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
                      )}>
                        {conv.platform === 'facebook' ? (
                          <Facebook className="h-2.5 w-2.5 text-white" />
                        ) : (
                          <InstagramIcon className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold shadow-sm ring-2 ring-white">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-sm truncate",
                          conv.unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                        )}>
                          {conv.igUsername 
                            ? (conv.platform === 'facebook' ? conv.igUsername : `@${conv.igUsername}`)
                            : "Kullanıcı"}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs truncate mt-0.5",
                        conv.unreadCount > 0 ? "text-gray-600 font-medium" : "text-gray-500"
                      )}>
                        {conv.lastMessagePreview || "Mesaj yok"}
                      </p>
                      {conv.tags && conv.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {conv.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={cn("text-[10px] px-1.5 py-0 h-4 font-medium", getTagColor(tag))}
                            >
                              {getTagLabel(tag)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main - Messages Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-14 px-4 border-b border-gray-200/80 bg-white flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {selectedConversation.profilePicUrl ? (
                      <img
                        src={selectedConversation.profilePicUrl}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {/* Platform Indicator */}
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white",
                      selectedConversation.platform === 'facebook' 
                        ? "bg-blue-600" 
                        : "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
                    )}>
                      {selectedConversation.platform === 'facebook' ? (
                        <Facebook className="h-2 w-2 text-white" />
                      ) : (
                        <InstagramIcon className="h-2 w-2 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {selectedConversation.igUsername 
                        ? (selectedConversation.platform === 'facebook' ? selectedConversation.igUsername : `@${selectedConversation.igUsername}`)
                        : "Kullanıcı"}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-[10px] px-1.5 h-4 font-medium",
                          selectedConversation.status === 'open' 
                            ? "bg-green-50 text-green-700" 
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {getConversationStatusLabel(selectedConversation.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-gray-100"
                        onClick={() => fetchMessages(selectedConversation.id)}
                      >
                        <RefreshCw className={cn("h-4 w-4 text-gray-500", loadingMessages && "animate-spin")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Yenile</TooltipContent>
                  </Tooltip>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {selectedConversation.status === 'open' ? (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedConversation.id, CONVERSATION_STATUS.CLOSED)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Konuşmayı Kapat
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedConversation.id, CONVERSATION_STATUS.OPEN)}>
                          <Inbox className="h-4 w-4 mr-2" />
                          Yeniden Aç
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleClearMessages(selectedConversation.id)}
                        className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                      >
                        <Eraser className="h-4 w-4 mr-2" />
                        İçeriği Temizle
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteConversation(selectedConversation.id)}
                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Konuşmayı Sil
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Etiket Ekle</div>
                      {Object.values(CONVERSATION_TAGS).map((tag) => (
                        <DropdownMenuItem
                          key={tag}
                          onClick={() => handleAddTag(selectedConversation.id, tag)}
                          className="text-xs"
                        >
                          <Tag className="h-3.5 w-3.5 mr-2" />
                          {getTagLabel(tag)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : messages.length === 0 && currentPendingMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <MessageSquare className="h-12 w-12 mb-3 stroke-[1.5]" />
                      <p className="text-sm text-gray-500">Henüz mesaj yok</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-2xl mx-auto">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn("flex", msg.isFromCustomer ? "justify-start" : "justify-end")}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                              msg.isFromCustomer
                                ? "bg-white border border-gray-100 rounded-bl-md"
                              : "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                            )}
                          >
                            {msg.mediaUrl && msg.messageType === "image" && (
                              <img src={msg.mediaUrl} alt="" className="max-w-full rounded-lg mb-2" />
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1",
                              msg.isFromCustomer ? "justify-start" : "justify-end"
                            )}>
                              <span className={cn(
                                "text-[10px]",
                                msg.isFromCustomer ? "text-gray-400" : "text-white/70"
                              )}>
                                {formatMessageTime(msg.sentAt)}
                              </span>
                              {!msg.isFromCustomer && <CheckCircle2 className="h-3 w-3 text-white/70" />}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pending Messages */}
                      {currentPendingMessages.map((msg) => (
                        <div key={msg.tempId} className="flex justify-end">
                          <div className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2.5 rounded-br-md",
                            msg.status === MESSAGE_STATUS.FAILED
                              ? "bg-red-50 border border-red-200"
                              : "bg-gray-100 border border-gray-200"
                          )}>
                            <p className={cn(
                              "text-sm whitespace-pre-wrap leading-relaxed",
                              msg.status === MESSAGE_STATUS.FAILED ? "text-red-700" : "text-gray-600"
                            )}>
                              {msg.content}
                            </p>
                            <div className="flex items-center justify-between gap-3 mt-1.5">
                              <span className={cn(
                                "text-[10px] font-medium",
                                msg.status === MESSAGE_STATUS.FAILED ? "text-red-500" : "text-gray-400"
                              )}>
                                {msg.status === MESSAGE_STATUS.PENDING && "Gönderiliyor..."}
                                {msg.status === MESSAGE_STATUS.FAILED && "Gönderilemedi"}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {msg.status === MESSAGE_STATUS.PENDING && (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                                )}
                                {msg.status === MESSAGE_STATUS.FAILED && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 hover:bg-red-100 rounded-full"
                                          onClick={() => handleRetry(msg)}
                                          disabled={retryingId === msg.tempId}
                                        >
                                          {retryingId === msg.tempId ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                                          ) : (
                                            <RotateCcw className="h-3.5 w-3.5 text-red-500" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Tekrar Dene</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 hover:bg-red-100 rounded-full"
                                          onClick={() => handleDeletePending(msg.tempId)}
                                        >
                                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Sil</TooltipContent>
                                    </Tooltip>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Replies */}
              {quickReplies.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 bg-white shrink-0">
                  <div className="flex gap-2 overflow-x-auto pb-1 max-w-2xl mx-auto">
                    {quickReplies.slice(0, 6).map((qr) => (
                      <Button
                        key={qr.id}
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-xs h-7 px-3 rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        onClick={() => handleQuickReply(qr)}
                      >
                        {qr.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200/80 bg-white shrink-0">
                <div className="flex gap-3 max-w-2xl mx-auto">
                  <Input
                    ref={inputRef}
                    placeholder="Mesajınızı yazın..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sending}
                    className="flex-1 h-11 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all rounded-full px-5"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!messageInput.trim() || sending}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-11 w-11 rounded-full p-0 shadow-md hover:shadow-lg transition-all"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MetaMessengerIcon className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Meta Messenger
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  Facebook & Instagram DM
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  Soldaki listeden bir konuşma seçin
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/admin/meta-messenger/settings'}
                  className="gap-2 rounded-full px-5"
                >
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
