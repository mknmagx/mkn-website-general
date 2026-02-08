"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConversations, useMessages } from "@/hooks/use-whatsapp-realtime";
import { useUnifiedAI, AI_CONTEXTS } from "@/hooks/use-unified-ai";
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

// WhatsApp Modals
import {
  NewContactModal,
  TemplatePickerModal,
  NewMessageModal,
  DeleteConversationDialog,
} from "@/components/whatsapp-modals";

// Contact Profile Dialog
import ContactProfileDialog from "@/components/whatsapp-contact-profile-dialog";

// Media Upload Dialog
import MediaUploadDialog from "@/components/whatsapp-media-upload-dialog";

// Emoji Picker
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  ChevronUp,
  Plus,
  UserPlus,
  Trash2,
  Reply,
  CornerDownLeft,
  Wand2,
  ExternalLink,
  Building2,
  UserCheck,
} from "lucide-react";

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
  const scrollViewportRef = useRef(null);

  // AI Text Revision Hook
  const {
    generateContent: reviseText,
    loading: revisingText,
    configLoading: aiConfigLoading,
    config: aiConfig,
    error: aiError,
  } = useUnifiedAI(AI_CONTEXTS.WHATSAPP_TEXT_REVISION);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Real-time data from Firestore (no polling needed!)
  const {
    conversations,
    loading: conversationsLoading,
    markAsRead,
  } = useConversations({ statusFilter, searchQuery });

  const { messages, loading: messagesLoading } = useMessages(
    selectedConversationId,
  );

  // Derived state
  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  // Modal States
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactInfo, setContactInfo] = useState(null); // CRM müşteri bilgisi (telefon numarası olanlar)
  const [contactsMap, setContactsMap] = useState({}); // Tüm CRM müşterileri (telefon -> isim)
  const [addingToContacts, setAddingToContacts] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [messageSearchResults, setMessageSearchResults] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // Yanıtlanacak mesaj
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Scroll tracking refs
  const userScrolledUpRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  // Select conversation handler
  const handleSelectConversation = useCallback(
    (conversation) => {
      if (conversation?.id !== selectedConversationId) {
        setSelectedConversationId(conversation?.id || null);
        isInitialLoadRef.current = true;
        userScrolledUpRef.current = false;
        prevMessageCountRef.current = 0;
        if (conversation?.id) {
          markAsRead(conversation.id);
        }
      }
    },
    [selectedConversationId, markAsRead],
  );

  // AI Text Revision - Metin düzeltme
  const handleReviseText = useCallback(async () => {
    if (!newMessage.trim() || revisingText) return;

    try {
      const result = await reviseText(null, {
        promptVariables: {
          original_text: newMessage.trim(),
        },
      });

      if (result.success && result.content) {
        setNewMessage(result.content);
        toast({
          title: "Metin Düzeltildi",
          description:
            "Mesajınız gramer ve söz dizilimi açısından iyileştirildi.",
        });
        // Focus back to input
        inputRef.current?.focus();
      } else {
        throw new Error(result.error || "Düzeltme başarısız");
      }
    } catch (error) {
      console.error("AI text revision error:", error);
      toast({
        title: "Düzeltme Hatası",
        description: error.message || "Metin düzeltilemedi. Tekrar deneyin.",
        variant: "destructive",
      });
    }
  }, [newMessage, revisingText, reviseText, toast]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    // Check if window is open
    if (!isWindowOpen(selectedConversation)) {
      toast({
        title: "24 Saat Penceresi Kapalı",
        description:
          "Serbest mesaj gönderemezsiniz. Şablon kullanmanız gerekiyor.",
        variant: "destructive",
      });
      setShowTemplates(true);
      return;
    }

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
          replyToMessageId: replyingTo?.wamId || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        setReplyingTo(null); // Clear reply state
        userScrolledUpRef.current = false; // Reset scroll flag on send
        // Real-time listener will auto-update messages, no need to fetch
        // Scroll to bottom after sending
        setTimeout(() => scrollToBottom("smooth"), 200);
      } else if (data.requiresTemplate) {
        // Backend says window is closed, open template picker
        toast({
          title: "Şablon Gerekli",
          description: "24 saatlik pencere kapandı. Şablon seçmeniz gerekiyor.",
          variant: "destructive",
        });
        setShowTemplates(true);
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
      // Real-time listener will auto-update
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Check if contact/customer exists in CRM (contacts API now returns CRM customers)
  const checkContactInPhonebook = useCallback(async (waId) => {
    if (!waId) {
      setContactInfo(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/whatsapp/contacts?search=${waId}&exactMatch=true`,
      );
      const data = await response.json();

      if (data.success && data.data?.length > 0) {
        // contacts API artık CRM customers döndürüyor
        setContactInfo(data.data[0]);
      } else {
        setContactInfo(null);
      }
    } catch (error) {
      console.error("Error checking contact:", error);
      setContactInfo(null);
    }
  }, []);

  // Fetch all contacts for name mapping
  const fetchAllContacts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/whatsapp/contacts?limit=1000");
      const data = await response.json();

      if (data.success && data.data?.length > 0) {
        const map = {};
        data.data.forEach((contact) => {
          // Telefon numarasından + işaretini çıkar ve normalize et
          const phone = (contact.phoneNumber || "").replace(/[^0-9]/g, "");
          if (phone && contact.name) {
            map[phone] = contact.name;
          }
        });
        setContactsMap(map);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, []);

  // Load contacts map on mount
  useEffect(() => {
    fetchAllContacts();
  }, [fetchAllContacts]);

  // Get display name for conversation (prioritize contacts)
  const getDisplayName = useCallback(
    (conv) => {
      if (!conv) return "";
      const waId = (conv.waId || conv.phoneNumber || "").replace(/[^0-9]/g, "");
      return (
        contactsMap[waId] || conv.profileName || conv.phoneNumber || conv.waId
      );
    },
    [contactsMap],
  );

  // Add current conversation to contacts
  const handleAddToContacts = async () => {
    if (!selectedConversation) return;

    setAddingToContacts(true);
    try {
      const response = await fetch("/api/admin/whatsapp/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedConversation.profileName || selectedConversation.waId,
          phoneNumber: selectedConversation.waId,
          profileName: selectedConversation.profileName,
          group: "other",
          notes: "WhatsApp konuşmasından eklendi",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "CRM müşterisi oluşturuldu",
        });
        setContactInfo(data.contact || data.data);
        // Ayrıca contactsMap'i güncelle
        if (data.contact?.phoneNumber && data.contact?.name) {
          const phone = (data.contact.phoneNumber || "").replace(/[^0-9]/g, "");
          setContactsMap((prev) => ({
            ...prev,
            [phone]: data.contact.name,
          }));
        }
      } else {
        toast({
          title: "Hata",
          description: data.error || "Kişi eklenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kişi eklenemedi",
        variant: "destructive",
      });
    } finally {
      setAddingToContacts(false);
    }
  };

  // Search messages in current conversation
  const handleMessageSearch = useCallback(
    (query) => {
      setMessageSearchQuery(query);

      if (!query.trim()) {
        setMessageSearchResults([]);
        setHighlightedMessageId(null);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const results = messages.filter((msg) => {
        const text = msg.text || msg.content?.text || "";
        return text.toLowerCase().includes(lowerQuery);
      });

      setMessageSearchResults(results);

      // Highlight first result
      if (results.length > 0) {
        setHighlightedMessageId(results[0].id);
        // Scroll to message
        setTimeout(() => {
          const element = document.getElementById(`msg-${results[0].id}`);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      } else {
        setHighlightedMessageId(null);
      }
    },
    [messages],
  );

  // Navigate to next/previous search result
  const navigateSearchResult = (direction) => {
    if (messageSearchResults.length === 0) return;

    const currentIndex = messageSearchResults.findIndex(
      (msg) => msg.id === highlightedMessageId,
    );

    let newIndex;
    if (direction === "next") {
      newIndex =
        currentIndex < messageSearchResults.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex =
        currentIndex > 0 ? currentIndex - 1 : messageSearchResults.length - 1;
    }

    const targetMsg = messageSearchResults[newIndex];
    setHighlightedMessageId(targetMsg.id);

    setTimeout(() => {
      const element = document.getElementById(`msg-${targetMsg.id}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  // Close search
  const closeMessageSearch = () => {
    setShowMessageSearch(false);
    setMessageSearchQuery("");
    setMessageSearchResults([]);
    setHighlightedMessageId(null);
  };

  // Scroll to bottom
  const scrollToBottom = (behavior = "auto") => {
    if (scrollViewportRef.current) {
      const { scrollHeight, clientHeight } = scrollViewportRef.current;
      scrollViewportRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior,
      });
    }
  };

  // Handle scroll event
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Calculate distance from bottom
    const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
    const isAtBottom = distanceFromBottom < 100;

    // Track if user has scrolled up
    userScrolledUpRef.current = !isAtBottom;

    // Show scroll button if we are scrolled up more than 100px from bottom
    setShowScrollButton(!isAtBottom);
  };

  // Scroll to bottom function
  const scrollToBottomManual = () => {
    userScrolledUpRef.current = false; // Reset flag when user clicks scroll button
    scrollToBottom("smooth");
  };

  // Effects - Real-time listeners are handled by hooks, no need for manual fetching
  useEffect(() => {
    if (selectedConversation) {
      checkContactInPhonebook(selectedConversation.waId);
      // Reset message search and reply when conversation changes
      closeMessageSearch();
      setReplyingTo(null);
      // Reset scroll state
      setShowScrollButton(false);
    } else {
      setContactInfo(null);
    }
  }, [selectedConversation, checkContactInPhonebook]);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (scrollViewportRef.current && messages.length > 0) {
      const hasNewMessages = messages.length > prevMessageCountRef.current;

      // Scroll on initial load
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        scrollToBottom("auto");

        // Delay for images loading
        const timer = setTimeout(() => scrollToBottom("auto"), 150);
        const longTimer = setTimeout(() => scrollToBottom("auto"), 500);

        return () => {
          clearTimeout(timer);
          clearTimeout(longTimer);
        };
      }
      // Scroll on new message if user is at bottom
      else if (hasNewMessages && !userScrolledUpRef.current) {
        setTimeout(() => scrollToBottom("smooth"), 100);
      }

      prevMessageCountRef.current = messages.length;
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    let date;
    try {
      // Handle Firestore Timestamp
      if (timestamp?.toDate && typeof timestamp.toDate === "function") {
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
      else if (typeof timestamp === "string" || typeof timestamp === "number") {
        date = new Date(timestamp);
      } else {
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
      console.error("Error formatting time:", error, timestamp);
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

  // Parse expiry date from various formats
  const parseExpiryDate = (expiry) => {
    if (!expiry) return null;

    let expiryDate;
    if (expiry?.toDate && typeof expiry.toDate === "function") {
      expiryDate = expiry.toDate();
    } else if (expiry?.seconds) {
      expiryDate = new Date(expiry.seconds * 1000);
    } else if (expiry?._seconds) {
      expiryDate = new Date(expiry._seconds * 1000);
    } else if (typeof expiry === "string" || typeof expiry === "number") {
      expiryDate = new Date(expiry);
    } else {
      return null;
    }

    return expiryDate;
  };

  // Check if service window is open - ALWAYS check expiry time
  const isWindowOpen = (conversation) => {
    if (!conversation) return false;

    const expiry = conversation.serviceWindowExpiry;
    if (!expiry) return false;

    const expiryDate = parseExpiryDate(expiry);
    if (!expiryDate || isNaN(expiryDate.getTime())) return false;

    // Always compare current time with expiry - isWithinWindow flag alone is not reliable
    return new Date() < expiryDate;
  };

  // Get remaining time info for the service window
  const getWindowTimeInfo = (conversation) => {
    if (!conversation) return null;

    const expiry = conversation.serviceWindowExpiry;
    if (!expiry) return null;

    const expiryDate = parseExpiryDate(expiry);
    if (!expiryDate || isNaN(expiryDate.getTime())) return null;

    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { isOpen: false, expired: true, text: "Pencere kapandı" };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let timeText;
    if (diffHours > 0) {
      timeText = `${diffHours} saat ${diffMinutes} dakika kaldı`;
    } else if (diffMinutes > 0) {
      timeText = `${diffMinutes} dakika kaldı`;
    } else {
      timeText = "1 dakikadan az kaldı";
    }

    return {
      isOpen: true,
      expired: false,
      text: timeText,
      hours: diffHours,
      minutes: diffMinutes,
      expiryDate,
    };
  };

  return (
    <div className="flex h-full w-full bg-white">
      {/* Conversation List */}
      <aside className="w-72 border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
        {/* Search & Filter */}
        <div className="p-3 border-b border-gray-200 space-y-2 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-gray-50 border-0"
              />
            </div>
            <Button
              size="sm"
              className="h-9 bg-green-600 hover:bg-green-700"
              onClick={() => setShowNewMessage(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1">
            {["all", "open", "closed", "pending"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 text-xs flex-1",
                  statusFilter === status && "bg-green-600 hover:bg-green-700",
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {conversationsLoading ? (
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
                    "px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedConversation?.id === conv.id && "bg-green-50",
                  )}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                        {getInitials(getDisplayName(conv))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {getDisplayName(conv)}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-auto flex-shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 truncate flex-1 min-w-0">
                          {conv.lastMessageDirection === "outbound" && (
                            <span className="text-gray-400">Siz: </span>
                          )}
                          {conv.lastMessagePreview ||
                            conv.lastMessage ||
                            "Henüz mesaj yok"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="h-[18px] min-w-[18px] flex-shrink-0 bg-green-500 hover:bg-green-500 text-white text-[10px] px-1 font-bold rounded-full">
                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <Avatar
                  className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-green-500 hover:ring-offset-1 transition-all"
                  onClick={() => setShowProfileDialog(true)}
                >
                  <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                    {getInitials(
                      contactInfo?.name || selectedConversation.profileName,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="cursor-pointer"
                  onClick={() => setShowProfileDialog(true)}
                >
                  <h3 className="font-medium text-sm text-gray-900 hover:text-green-600 transition-colors">
                    {contactInfo?.name ||
                      selectedConversation.profileName ||
                      selectedConversation.waId}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.phoneNumber ||
                      selectedConversation.waId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* CRM Müşteri Badge - contacts artık CRM customers */}
                {contactInfo ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-50 text-purple-700 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                          onClick={() => window.open(`/admin/crm-v2/customers/${contactInfo.crmCustomerId || contactInfo.id}`, '_blank')}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          {contactInfo.name || 'CRM Müşteri'}
                          <ExternalLink className="h-2.5 w-2.5 ml-1 opacity-60" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="text-xs space-y-1">
                          <p className="font-medium">CRM Müşteri Profili</p>
                          {contactInfo.company && (
                            <p className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {contactInfo.company}
                            </p>
                          )}
                          {contactInfo.email && <p>📧 {contactInfo.email}</p>}
                          <p className="text-purple-500 mt-1">Tıklayarak müşteri profiline gidin</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={handleAddToContacts}
                          disabled={addingToContacts}
                        >
                          {addingToContacts ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <UserPlus className="h-3 w-3 mr-1" />
                          )}
                          CRM'e Ekle
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Bu kişiyi CRM müşterisi olarak kaydet</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs cursor-pointer",
                          isWindowOpen(selectedConversation)
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                        )}
                      >
                        {isWindowOpen(selectedConversation)
                          ? "Pencere Açık"
                          : "Şablon Gerekli"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {(() => {
                        const timeInfo =
                          getWindowTimeInfo(selectedConversation);
                        if (timeInfo?.isOpen) {
                          return (
                            <div className="text-xs space-y-1">
                              <p className="font-medium">
                                24 saatlik mesajlaşma penceresi açık
                              </p>
                              <p className="text-green-500">
                                ⏱ {timeInfo.text}
                              </p>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-xs space-y-1">
                              <p className="font-medium">Pencere kapalı</p>
                              <p className="text-amber-500">
                                Serbest mesaj göndermek için müşterinin mesaj
                                göndermesi gerekli
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowMessageSearch(!showMessageSearch)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Mesajlarda Ara</p>
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
                    {/* CRM Müşteri Actions - contacts artık CRM customers */}
                    {contactInfo ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => window.open(`/admin/crm-v2/customers/${contactInfo.crmCustomerId || contactInfo.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          CRM Müşterisine Git
                        </DropdownMenuItem>
                        {contactInfo.linkedCompanyId && (
                          <DropdownMenuItem
                            onClick={() => window.open(`/admin/companies/${contactInfo.linkedCompanyId}`, '_blank')}
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            Firmaya Git
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={handleAddToContacts}
                          disabled={addingToContacts}
                        >
                          {addingToContacts ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4 mr-2" />
                          )}
                          CRM Müşterisi Oluştur
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        handleStatusChange(selectedConversation.id, "closed")
                      }
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Konuşmayı Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Message Search Bar */}
            {showMessageSearch && (
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Mesajlarda ara..."
                    value={messageSearchQuery}
                    onChange={(e) => handleMessageSearch(e.target.value)}
                    className="pl-9 h-8 bg-white"
                    autoFocus
                  />
                </div>
                {messageSearchResults.length > 0 && (
                  <>
                    <span className="text-xs text-gray-500 min-w-[60px] text-center">
                      {messageSearchResults.findIndex(
                        (m) => m.id === highlightedMessageId,
                      ) + 1}{" "}
                      / {messageSearchResults.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigateSearchResult("prev")}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigateSearchResult("next")}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={closeMessageSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 min-h-0 relative">
              <div
                ref={scrollViewportRef}
                className="h-full overflow-y-auto p-4 bg-[#e5ddd5] minimal-scrollbar"
                onScroll={handleScroll}
              >
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
                        id={`msg-${msg.id}`}
                        className={cn(
                          "flex transition-all duration-300 group",
                          msg.direction === "outbound"
                            ? "justify-end"
                            : "justify-start",
                          highlightedMessageId === msg.id && "scale-[1.02]",
                        )}
                      >
                        {/* Reply button - left side for outbound */}
                        {msg.direction === "outbound" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity self-center mr-1"
                                  onClick={() => setReplyingTo(msg)}
                                >
                                  <CornerDownLeft className="h-3 w-3 text-gray-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Yanıtla</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-3 py-2 shadow-sm transition-all duration-300",
                            msg.direction === "outbound"
                              ? "bg-[#dcf8c6] rounded-tr-none"
                              : "bg-white rounded-tl-none",
                            highlightedMessageId === msg.id &&
                              "ring-2 ring-yellow-400 bg-yellow-50",
                          )}
                        >
                          {/* Reply indicator */}
                          {msg.replyToMessageId && (
                            <div
                              className="bg-black/5 rounded px-2 py-1 mb-1 border-l-2 border-green-500 cursor-pointer text-xs"
                              onClick={() => {
                                const replyMsg = messages.find(
                                  (m) => m.wamId === msg.replyToMessageId,
                                );
                                if (replyMsg) {
                                  setHighlightedMessageId(replyMsg.id);
                                  setTimeout(() => {
                                    const element = document.getElementById(
                                      `msg-${replyMsg.id}`,
                                    );
                                    element?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "center",
                                    });
                                  }, 100);
                                  setTimeout(
                                    () => setHighlightedMessageId(null),
                                    2000,
                                  );
                                }
                              }}
                            >
                              <span className="text-green-600 font-medium">
                                Yanıt
                              </span>
                            </div>
                          )}

                          {/* Message content based on type */}
                          {msg.type === "text" && (
                            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                              {msg.text || msg.content?.text}
                            </p>
                          )}
                          {msg.type === "image" && (
                            <div>
                              {msg.mediaUrl || msg.content?.mediaUrl ? (
                                <img
                                  src={msg.mediaUrl || msg.content?.mediaUrl}
                                  alt="Image"
                                  className="rounded max-w-full max-h-60 object-cover cursor-pointer"
                                  onClick={() =>
                                    window.open(
                                      msg.mediaUrl || msg.content?.mediaUrl,
                                      "_blank",
                                    )
                                  }
                                />
                              ) : (
                                <div className="bg-gray-100 rounded p-4 flex items-center justify-center min-h-[120px]">
                                  <div className="text-center text-gray-500">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                    <p className="text-xs">
                                      Görsel yükleniyor...
                                    </p>
                                  </div>
                                </div>
                              )}
                              {(msg.filename || msg.content?.filename) &&
                                !(msg.caption || msg.content?.caption) && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {msg.filename || msg.content?.filename}
                                  </p>
                                )}
                              {(msg.caption || msg.content?.caption) && (
                                <p className="text-sm text-gray-900 mt-1">
                                  {msg.caption || msg.content?.caption}
                                </p>
                              )}
                            </div>
                          )}
                          {msg.type === "video" && (
                            <div>
                              {msg.mediaUrl || msg.content?.mediaUrl ? (
                                <video
                                  src={msg.mediaUrl || msg.content?.mediaUrl}
                                  controls
                                  className="rounded max-w-full max-h-60"
                                />
                              ) : (
                                <div className="bg-gray-100 rounded p-4 flex items-center justify-center min-h-[120px]">
                                  <div className="text-center text-gray-500">
                                    <FileText className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                    <p className="text-xs">
                                      Video yükleniyor...
                                    </p>
                                  </div>
                                </div>
                              )}
                              {(msg.filename || msg.content?.filename) && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {msg.filename || msg.content?.filename}
                                </p>
                              )}
                              {(msg.caption || msg.content?.caption) && (
                                <p className="text-sm text-gray-900 mt-1">
                                  {msg.caption || msg.content?.caption}
                                </p>
                              )}
                            </div>
                          )}
                          {msg.type === "audio" && (
                            <div>
                              {msg.mediaUrl || msg.content?.mediaUrl ? (
                                <audio
                                  src={msg.mediaUrl || msg.content?.mediaUrl}
                                  controls
                                  className="max-w-full"
                                />
                              ) : (
                                <div className="bg-gray-100 rounded p-3 text-center text-gray-500">
                                  <p className="text-xs">
                                    Ses dosyası yükleniyor...
                                  </p>
                                </div>
                              )}
                              {(msg.filename || msg.content?.filename) && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {msg.filename || msg.content?.filename}
                                </p>
                              )}
                              {(msg.caption || msg.content?.caption) && (
                                <p className="text-sm text-gray-900 mt-1">
                                  {msg.caption || msg.content?.caption}
                                </p>
                              )}
                            </div>
                          )}
                          {msg.type === "document" && (
                            <div>
                              <div
                                className="flex items-center gap-2 bg-gray-50 rounded p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                  const url =
                                    msg.mediaUrl || msg.content?.mediaUrl;
                                  if (url) window.open(url, "_blank");
                                }}
                              >
                                <FileText className="h-8 w-8 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {msg.filename ||
                                      msg.content?.filename ||
                                      "Dosya"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {msg.mediaUrl || msg.content?.mediaUrl
                                      ? "İndirmek için tıklayın"
                                      : "Yükleniyor..."}
                                  </p>
                                </div>
                              </div>
                              {(msg.caption || msg.content?.caption) && (
                                <p className="text-sm text-gray-900 mt-1">
                                  {msg.caption || msg.content?.caption}
                                </p>
                              )}
                            </div>
                          )}
                          {msg.type === "sticker" && (
                            <div>
                              {msg.mediaUrl || msg.content?.mediaUrl ? (
                                <img
                                  src={msg.mediaUrl || msg.content?.mediaUrl}
                                  alt="Sticker"
                                  className="max-w-[150px] max-h-[150px]"
                                />
                              ) : (
                                <div className="bg-gray-100 rounded p-4 text-center text-gray-500">
                                  <p className="text-xs">🎭 Çıkartma</p>
                                </div>
                              )}
                            </div>
                          )}
                          {msg.type === "template" && (
                            <div className="text-sm">
                              <p className="text-gray-500 text-xs mb-1">
                                📋 Şablon
                              </p>
                              {msg.text ? (
                                <p className="text-gray-900 whitespace-pre-wrap">
                                  {msg.text}
                                </p>
                              ) : (
                                <p className="text-gray-600 italic">
                                  {msg.templateName ||
                                    msg.content?.templateName}
                                </p>
                              )}
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

                        {/* Reply button - right side for inbound */}
                        {msg.direction === "inbound" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity self-center ml-1"
                                  onClick={() => setReplyingTo(msg)}
                                >
                                  <CornerDownLeft className="h-3 w-3 text-gray-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Yanıtla</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg bg-white/90 hover:bg-white z-10 animate-in fade-in zoom-in duration-200"
                  onClick={scrollToBottomManual}
                >
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                  {conversations.find((c) => c.id === selectedConversation?.id)
                    ?.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
                      {
                        conversations.find(
                          (c) => c.id === selectedConversation?.id,
                        )?.unreadCount
                      }
                    </span>
                  )}
                </Button>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-gray-50">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-1 h-8 bg-green-500 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-green-600">
                        {replyingTo.direction === "inbound"
                          ? selectedConversation?.profileName ||
                            selectedConversation?.waId
                          : "Siz"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {replyingTo.text ||
                          replyingTo.content?.text ||
                          `[${replyingTo.type}]`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              )}

              <div className="p-3">
                {isWindowOpen(selectedConversation) ? (
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2"
                  >
                    <Popover
                      open={showEmojiPicker}
                      onOpenChange={setShowEmojiPicker}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-500 hover:text-yellow-500 shrink-0"
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border-0"
                        side="top"
                        align="start"
                        sideOffset={10}
                      >
                        <Picker
                          data={data}
                          onEmojiSelect={(emoji) => {
                            setNewMessage((prev) => prev + emoji.native);
                            setShowEmojiPicker(false);
                            inputRef.current?.focus();
                          }}
                          locale="tr"
                          theme="light"
                          previewPosition="none"
                          skinTonePosition="none"
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-gray-500 hover:text-green-600 shrink-0"
                      onClick={() => setShowMediaUpload(true)}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        placeholder="Mesaj yazın..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          // Auto-resize textarea
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                        onKeyDown={(e) => {
                          // Shift+Enter = yeni satır, sadece Enter = gönder
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (newMessage.trim() && !sending) {
                              handleSendMessage(e);
                            }
                          }
                        }}
                        className="w-full min-h-[36px] max-h-[120px] px-3 py-2 text-sm bg-white border border-gray-200 rounded-md resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={1}
                      />
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-500 hover:text-purple-600 shrink-0"
                            onClick={handleReviseText}
                            disabled={
                              !newMessage.trim() ||
                              revisingText ||
                              aiConfigLoading ||
                              !!aiError
                            }
                          >
                            {revisingText ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : aiConfigLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-300" />
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>
                            {aiConfigLoading
                              ? "AI yükleniyor..."
                              : aiError
                                ? "AI yapılandırma hatası"
                                : "AI ile düzelt"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      type="submit"
                      size="icon"
                      className="h-9 w-9 bg-green-600 hover:bg-green-700 shrink-0"
                      disabled={!newMessage.trim() || sending}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-amber-600 mb-2">
                      24 saatlik mesajlaşma penceresi kapalı. Şablon mesajı
                      göndermeniz gerekiyor.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => setShowTemplates(true)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Şablon Gönder
                    </Button>
                  </div>
                )}
              </div>
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
      </main>

      {/* Modals */}
      <NewMessageModal
        open={showNewMessage}
        onOpenChange={setShowNewMessage}
        onConversationStart={(result) => {
          // Real-time listener will auto-update
          toast({
            title: "Mesaj Gönderildi",
            description: "Şablon mesajı başarıyla gönderildi.",
          });
        }}
      />

      <NewContactModal
        open={showNewContact}
        onOpenChange={setShowNewContact}
        onContactCreated={(contact) => {
          toast({
            title: "Müşteri Eklendi",
            description: `${contact.name || contact.phoneNumber} CRM'e eklendi.`,
          });
          // contactsMap'i güncelle
          if (contact?.phoneNumber && contact?.name) {
            const phone = (contact.phoneNumber || "").replace(/[^0-9]/g, "");
            setContactsMap((prev) => ({
              ...prev,
              [phone]: contact.name,
            }));
          }
        }}
      />

      <TemplatePickerModal
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onTemplateSelect={(result) => {
          // Real-time listener will auto-update
          userScrolledUpRef.current = false;
          setTimeout(() => scrollToBottom("smooth"), 200);
          toast({
            title: "Şablon Gönderildi",
            description: "Şablon mesajı başarıyla gönderildi.",
          });
        }}
        recipientPhone={selectedConversation?.waId}
        recipientName={contactInfo?.name || selectedConversation?.profileName}
        hidePhoneInput={!!selectedConversation?.waId}
        contextData={{
          customerName:
            contactInfo?.name || selectedConversation?.profileName || "",
        }}
      />

      <DeleteConversationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        conversation={selectedConversation}
        onDeleted={() => {
          setSelectedConversationId(null);
          // Real-time listener will auto-update conversations
          toast({
            title: "Konuşma Silindi",
            description: "Konuşma ve tüm mesajlar silindi.",
          });
        }}
      />

      {/* Contact Profile Dialog */}
      <ContactProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        contact={contactInfo}
        conversation={selectedConversation}
        onContactUpdate={(updatedContact) => {
          setContactInfo(updatedContact);
          // contactsMap'i de güncelle
          if (updatedContact?.phoneNumber && updatedContact?.name) {
            const phone = (updatedContact.phoneNumber || "").replace(
              /[^0-9]/g,
              "",
            );
            setContactsMap((prev) => ({
              ...prev,
              [phone]: updatedContact.name,
            }));
          }
        }}
        onAddToContacts={handleAddToContacts}
      />

      {/* Media Upload Dialog */}
      <MediaUploadDialog
        open={showMediaUpload}
        onOpenChange={setShowMediaUpload}
        conversationId={selectedConversation?.id}
        recipientPhone={selectedConversation?.waId}
        onMediaSent={() => {
          // Real-time listener will auto-update
          userScrolledUpRef.current = false;
          setTimeout(() => scrollToBottom("smooth"), 200);
        }}
      />
    </div>
  );
}
