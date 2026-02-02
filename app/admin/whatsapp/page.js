"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Smile,
  Archive,
  Tag,
  User,
  Filter,
  X,
  RefreshCw,
  Loader2,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Message status icon
const MessageStatus = ({ status }) => {
  switch (status) {
    case "sent":
      return <Check className="h-3 w-3 text-gray-400" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    case "failed":
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    default:
      return <Clock className="h-3 w-3 text-gray-400" />;
  }
};

export default function WhatsAppInboxPage() {
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/whatsapp/conversations?${params}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    setMessagesLoading(true);
    try {
      const response = await fetch(
        `/api/admin/whatsapp/messages?conversationId=${conversationId}`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
        
        // Mark as read
        await fetch("/api/admin/whatsapp/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "markAsRead",
            conversationId,
          }),
        });

        // Refresh conversations to update unread count
        fetchConversations();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  }, [fetchConversations]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/admin/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          to: selectedConversation.waId,
          conversationId: selectedConversation.id,
          text: newMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        fetchMessages(selectedConversation.id);
        fetchConversations();
      } else {
        toast({
          title: "Hata",
          description: data.error || "Mesaj gönderilemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Update conversation status
  const handleStatusChange = async (conversationId, status) => {
    try {
      await fetch("/api/admin/whatsapp/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateStatus",
          conversationId,
          data: { status },
        }),
      });
      fetchConversations();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Effects
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation.id);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedConversation, fetchConversations, fetchMessages]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    let date;
    try {
      // Handle Firestore Timestamp
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle Firestore Timestamp from JSON (has seconds and nanoseconds)
      else if (timestamp?.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Handle _seconds (serialized Firestore Timestamp)
      else if (timestamp?._seconds) {
        date = new Date(timestamp._seconds * 1000);
      }
      // Handle ISO string or regular date
      else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      }
      else {
        return "";
      }

      // Validate date
      if (isNaN(date.getTime())) {
        return "";
      }

      const now = new Date();
      const diff = now - date;

      if (diff < 86400000) {
        return format(date, "HH:mm", { locale: tr });
      }
      if (diff < 604800000) {
        return format(date, "EEE", { locale: tr });
      }
      return format(date, "dd/MM", { locale: tr });
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return "";
    }
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if service window is open
  const isWindowOpen = (conversation) => {
    if (!conversation) return false;
    
    // If isWithinWindow is true, check if not expired
    if (conversation.isWithinWindow) return true;
    
    const expiry = conversation.serviceWindowExpiry;
    if (!expiry) return false;
    
    let expiryDate;
    if (expiry?.toDate && typeof expiry.toDate === 'function') {
      expiryDate = expiry.toDate();
    } else if (expiry?.seconds) {
      expiryDate = new Date(expiry.seconds * 1000);
    } else if (expiry?._seconds) {
      expiryDate = new Date(expiry._seconds * 1000);
    } else if (typeof expiry === 'string' || typeof expiry === 'number') {
      expiryDate = new Date(expiry);
    } else {
      return false;
    }
    
    return new Date() < expiryDate;
  };

  return (
    <div className="flex h-full bg-white">
      {/* Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Search & Filter */}
        <div className="p-3 border-b border-gray-200 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-50 border-0"
            />
          </div>
          <div className="flex gap-1">
            {["all", "open", "closed", "pending"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 text-xs flex-1",
                  statusFilter === status && "bg-green-600 hover:bg-green-700"
                )}
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" && "Tümü"}
                {status === "open" && "Açık"}
                {status === "closed" && "Kapalı"}
                {status === "pending" && "Bekleyen"}
              </Button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Henüz konuşma yok</p>
              <p className="text-xs text-gray-400 mt-1">
                Müşteriler WhatsApp'tan mesaj gönderdiğinde burada görünecek
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedConversation?.id === conv.id && "bg-green-50"
                  )}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                        {getInitials(conv.profileName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {conv.profileName || conv.phoneNumber || conv.waId}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate pr-2">
                          {conv.lastMessageDirection === "outbound" && (
                            <span className="text-gray-400">Siz: </span>
                          )}
                          {conv.lastMessagePreview || conv.lastMessage || "Henüz mesaj yok"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="h-5 min-w-[20px] bg-green-500 text-white text-xs px-1.5">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                    {getInitials(selectedConversation.profileName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">
                    {selectedConversation.profileName || selectedConversation.waId}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.phoneNumber || selectedConversation.waId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs cursor-pointer",
                          isWindowOpen(selectedConversation)
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {isWindowOpen(selectedConversation) ? "Pencere Açık" : "Şablon Gerekli"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {isWindowOpen(selectedConversation)
                          ? "24 saatlik mesajlaşma penceresi açık"
                          : "Serbest mesaj göndermek için müşterinin mesaj göndermesi gerekli"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(selectedConversation.id, "closed")}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Konuşmayı Kapat
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Tag className="h-4 w-4 mr-2" />
                      Etiket Ekle
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Ata
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-[#e5ddd5]">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <WhatsAppIcon className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Henüz mesaj yok</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.direction === "outbound" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2 shadow-sm",
                          msg.direction === "outbound"
                            ? "bg-[#dcf8c6] rounded-tr-none"
                            : "bg-white rounded-tl-none"
                        )}
                      >
                        {/* Message content based on type */}
                        {msg.type === "text" && (
                          <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                            {msg.text || msg.content?.text}
                          </p>
                        )}
                        {msg.type === "image" && (
                          <div>
                            {(msg.mediaUrl || msg.content?.mediaUrl) && (
                              <img
                                src={msg.mediaUrl || msg.content?.mediaUrl}
                                alt="Image"
                                className="rounded max-w-full max-h-60 object-cover"
                              />
                            )}
                            {(msg.caption || msg.content?.caption) && (
                              <p className="text-sm text-gray-900 mt-1">
                                {msg.caption || msg.content?.caption}
                              </p>
                            )}
                          </div>
                        )}
                        {msg.type === "document" && (
                          <div className="flex items-center gap-2 bg-gray-50 rounded p-2">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">
                                {msg.filename || msg.content?.filename || "Dosya"}
                              </p>
                              <p className="text-xs text-gray-500">Doküman</p>
                            </div>
                          </div>
                        )}
                        {msg.type === "template" && (
                          <div className="text-sm">
                            <p className="text-gray-500 text-xs mb-1">📋 Şablon</p>
                            <p className="text-gray-900">{msg.templateName || msg.content?.templateName}</p>
                          </div>
                        )}

                        {/* Timestamp & Status */}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-500">
                            {formatTime(msg.timestamp)}
                          </span>
                          {msg.direction === "outbound" && (
                            <MessageStatus status={msg.status} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-500"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-500"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  ref={inputRef}
                  placeholder="Mesaj yazın..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-9 bg-white"
                  disabled={!isWindowOpen(selectedConversation)}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 bg-green-600 hover:bg-green-700"
                  disabled={!newMessage.trim() || sending || !isWindowOpen(selectedConversation)}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              {!isWindowOpen(selectedConversation) && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  24 saatlik pencere kapalı. Şablon mesajı göndermek için Şablonlar sayfasını kullanın.
                </p>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <WhatsAppIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-1">
                WhatsApp Business
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Sol taraftan bir konuşma seçin veya müşterilerinizin size
                WhatsApp üzerinden mesaj göndermesini bekleyin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
