"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  getUnifiedInbox,
  getUnifiedInboxCounts,
  markConversationAsRead,
  closeConversation,
  snoozeConversation,
  assignConversation,
  updateConversation,
  createCaseFromConversation,
  getCaseByConversationId,
} from "../../../../lib/services/crm-v2";
import {
  CONVERSATION_STATUS,
  CHANNEL,
  PRIORITY,
  getConversationStatusLabel,
  getConversationStatusColor,
  getChannelLabel,
  getChannelIcon,
  getChannelColor,
  getPriorityLabel,
  getPriorityColor,
  CASE_TYPE,
  getCaseTypeLabel,
  REPLY_STATUS,
  getReplyStatusLabel,
  getReplyStatusColor,
  getReplyStatusDot,
  getReplyStatusIcon,
} from "../../../../lib/services/crm-v2/schema";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../lib/utils";

// HTML to Text utility - Mesaj temizleme
import { htmlToText } from "../../../../utils/html-to-text";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";
import { Skeleton } from "../../../../components/ui/skeleton";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";

// Icons
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  MailOpen,
  Phone,
  MessageCircle,
  MessageSquare,
  FileText,
  Building2,
  User,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Inbox,
  Archive,
  Tag,
  UserPlus,
  AlertTriangle,
  Briefcase,
  ChevronRight,
  Calendar,
  Send,
  Eye,
  Trash2,
  MoreVertical,
  Loader2,
} from "lucide-react";

/**
 * HTML içeriğinden düz metin çıkar (preview için)
 * html-to-text utility'sini kullanır
 */
const stripHtmlToText = (html) => {
  if (!html) return "";
  return htmlToText(html, { removeQuotes: true, removeSignature: true });
};

// Kanal ikonları için mapping
const channelIcons = {
  contact_form: MessageSquare,
  quote_form: FileText,
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  manual: MessageSquare,
};

// Session storage key
const STORAGE_KEY_SELECTED_CONVERSATION = "inbox_selected_conversation";

export default function InboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  // Refs
  const listContainerRef = useRef(null);
  const isRestoringRef = useRef(false);

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [counts, setCounts] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedLinkedCase, setSelectedLinkedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "open",
  );
  const [channelFilter, setChannelFilter] = useState("all");

  // Modals
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [convertingConversation, setConvertingConversation] = useState(null);
  const [creatingCase, setCreatingCase] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState("");

  // Convert to Case form
  const [caseForm, setCaseForm] = useState({
    title: "",
    type: CASE_TYPE.OTHER,
    priority: PRIORITY.NORMAL,
    description: "",
  });

  // Data fetching
  const loadData = useCallback(async () => {
    try {
      const statusFilterValue =
        statusFilter === "all"
          ? null
          : statusFilter === "active"
            ? [CONVERSATION_STATUS.OPEN, CONVERSATION_STATUS.PENDING]
            : statusFilter;

      const [conversationsData, countsData] = await Promise.all([
        getUnifiedInbox({
          status: statusFilterValue,
          channel: channelFilter === "all" ? null : channelFilter,
          searchTerm,
          limitCount: 100,
          includeLegacy: false, // Artık sadece CRM v2 koleksiyonlarından
        }),
        getUnifiedInboxCounts({ includeLegacy: false }),
      ]);

      // Artık tüm veriler CRM v2'de, linkedCaseId conversation'da mevcut
      setConversations(conversationsData);
      setCounts(countsData);

      // Restore selected conversation from session storage
      if (!isRestoringRef.current) {
        isRestoringRef.current = true;
        const savedConversationId = sessionStorage.getItem(
          STORAGE_KEY_SELECTED_CONVERSATION,
        );
        if (savedConversationId && conversationsData.length > 0) {
          const savedConversation = conversationsData.find(
            (c) => c.id === savedConversationId,
          );
          if (savedConversation) {
            setSelectedConversation(savedConversation);

            // Scroll to selected item after DOM is ready
            setTimeout(() => {
              const selectedElement = document.getElementById(
                `conversation-${savedConversationId}`,
              );
              if (selectedElement) {
                selectedElement.scrollIntoView({
                  block: "center",
                  behavior: "instant",
                });
              }
            }, 150);
          }
        }
      }
    } catch (error) {
      console.error("Error loading inbox:", error);
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, channelFilter, searchTerm, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save selected conversation to session storage
  useEffect(() => {
    if (selectedConversation) {
      sessionStorage.setItem(
        STORAGE_KEY_SELECTED_CONVERSATION,
        selectedConversation.id,
      );
    }
  }, [selectedConversation]);

  // Check for linked case when conversation is selected
  useEffect(() => {
    const checkLinkedCase = async () => {
      if (!selectedConversation) {
        setSelectedLinkedCase(null);
        return;
      }

      // If already has linkedCaseId, use that
      if (selectedConversation.linkedCaseId) {
        setSelectedLinkedCase({ id: selectedConversation.linkedCaseId });
        return;
      }

      // Otherwise search for case by conversation ID
      const existingCase = await getCaseByConversationId(
        selectedConversation.id,
      );
      setSelectedLinkedCase(existingCase);
    };

    checkLinkedCase();
  }, [selectedConversation]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Actions
  const handleMarkAsRead = async (conversation) => {
    try {
      await markConversationAsRead(conversation.id, user?.uid);
      toast({ title: "Başarılı", description: "Okundu olarak işaretlendi." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız oldu.",
        variant: "destructive",
      });
    }
  };

  const handleClose = async (conversation) => {
    try {
      await closeConversation(conversation.id, user?.uid);
      toast({ title: "Başarılı", description: "Konuşma kapatıldı." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız oldu.",
        variant: "destructive",
      });
    }
  };

  const handleSnooze = async () => {
    if (!convertingConversation || !snoozeUntil) return;

    try {
      await snoozeConversation(
        convertingConversation.id,
        snoozeUntil,
        user?.uid,
      );
      toast({ title: "Başarılı", description: "Konuşma ertelendi." });
      setShowSnoozeModal(false);
      setConvertingConversation(null);
      setSnoozeUntil("");
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız oldu.",
        variant: "destructive",
      });
    }
  };

  const openConvertModal = (conversation) => {
    setConvertingConversation(conversation);
    setCaseForm({
      title: conversation.subject || "",
      type: CASE_TYPE.OTHER,
      priority: conversation.priority || PRIORITY.NORMAL,
      description: stripHtmlToText(conversation.preview) || "",
    });
    setShowConvertModal(true);
  };

  const handleConvertToCase = async () => {
    if (!convertingConversation) return;

    setCreatingCase(true);
    try {
      const newCase = await createCaseFromConversation(
        convertingConversation.id,
        {
          ...caseForm,
          createdBy: user?.uid,
        },
        user?.uid,
      );

      toast({
        title: "Başarılı",
        description: "Talep oluşturuldu.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/crm-v2/cases/${newCase.id}`)}
          >
            Görüntüle
          </Button>
        ),
      });

      setShowConvertModal(false);
      setConvertingConversation(null);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Talep oluşturulamadı.",
        variant: "destructive",
      });
    } finally {
      setCreatingCase(false);
    }
  };

  const openSnoozeModal = (conversation) => {
    setConvertingConversation(conversation);
    // Default: yarın
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setSnoozeUntil(tomorrow.toISOString().slice(0, 16));
    setShowSnoozeModal(true);
  };

  // Render conversation item
  const renderConversationItem = (conversation) => {
    const ChannelIcon = channelIcons[conversation.channel] || MessageSquare;
    const isUnread = conversation.unreadCount > 0;
    const isSelected = selectedConversation?.id === conversation.id;

    return (
      <div
        key={conversation.id}
        id={`conversation-${conversation.id}`}
        className={cn(
          "p-4 cursor-pointer transition-all hover:bg-slate-50 border-l-4",
          isSelected ? "bg-blue-50 border-l-blue-600" : "border-l-transparent",
          isUnread && !isSelected && "bg-blue-50/30",
        )}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className="flex items-start gap-3">
          {/* Channel Icon */}
          <div
            className={cn(
              "p-2 rounded-lg flex-shrink-0",
              getChannelColor(conversation.channel),
            )}
          >
            <ChannelIcon className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "font-medium truncate text-slate-900",
                    isUnread && "font-semibold",
                  )}
                >
                  {conversation.sender?.name || "İsimsiz"}
                </span>
                {isUnread && (
                  <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                )}
                {conversation.isLegacy && (
                  <Badge
                    variant="outline"
                    className="h-5 px-1.5 text-xs border-slate-300 text-slate-600"
                  >
                    Eski
                  </Badge>
                )}
              </div>
              <span className="text-xs text-slate-500 flex-shrink-0">
                {(() => {
                  // Akıllı tarih görüntüleme:
                  // - Birden fazla mesaj varsa (yanıtlanmış) = lastMessageAt göster
                  // - Sadece tek mesaj varsa = originalCreatedAt göster
                  const hasMultipleMessages =
                    (conversation.messageCount || 0) > 1;

                  let displayDate;
                  if (hasMultipleMessages && conversation.lastMessageAt) {
                    // Aktif konuşma - son mesaj tarihini göster
                    displayDate = conversation.lastMessageAt;
                  } else {
                    // Tek mesajlı - orijinal oluşturma tarihini göster
                    const originalDate =
                      conversation.channelMetadata?.originalCreatedAt;
                    displayDate =
                      originalDate ||
                      conversation.createdAt ||
                      conversation.lastMessageAt;
                  }

                  if (!displayDate) return "";
                  return formatDistanceToNow(
                    displayDate?.toDate?.() || new Date(displayDate),
                    { addSuffix: true, locale: tr },
                  );
                })()}
              </span>
            </div>

            {/* Company */}
            {conversation.sender?.company && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{conversation.sender.company}</span>
              </div>
            )}

            {/* Subject */}
            <p
              className={cn(
                "text-sm mt-1.5 truncate",
                isUnread ? "text-slate-900 font-medium" : "text-slate-600",
              )}
            >
              {conversation.subject}
            </p>

            {/* Preview */}
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {stripHtmlToText(conversation.preview)}
            </p>

            {/* Footer - Tags & Status */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Reply Status Badge - Minimalist */}
              {conversation.replyStatus && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
                    getReplyStatusColor(conversation.replyStatus),
                  )}
                  title={getReplyStatusLabel(conversation.replyStatus)}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      getReplyStatusDot(conversation.replyStatus),
                    )}
                  />
                  {getReplyStatusLabel(conversation.replyStatus)}
                </span>
              )}
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  getConversationStatusColor(conversation.status),
                )}
              >
                {getConversationStatusLabel(conversation.status)}
              </Badge>
              {conversation.linkedCaseId && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  <Briefcase className="h-3 w-3 mr-1" />
                  Talebe Bağlı
                </Badge>
              )}
              {conversation.tags?.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs border-slate-300 text-slate-600"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/crm-v2/inbox/${conversation.id}`);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Detay Görüntüle
              </DropdownMenuItem>
              {isUnread && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(conversation);
                  }}
                >
                  <MailOpen className="h-4 w-4 mr-2" />
                  Okundu İşaretle
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  openConvertModal(conversation);
                }}
                disabled={
                  conversation.linkedCaseId ||
                  conversation.status === CONVERSATION_STATUS.CLOSED
                }
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Talebe Dönüştür
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  openSnoozeModal(conversation);
                }}
                disabled={conversation.status === CONVERSATION_STATUS.CLOSED}
              >
                <Clock className="h-4 w-4 mr-2" />
                Ertele
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(conversation);
                }}
                disabled={conversation.status === CONVERSATION_STATUS.CLOSED}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Kapat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  // Render detail panel
  const renderDetailPanel = () => {
    if (!selectedConversation) {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="p-4 bg-white rounded-full w-fit mx-auto mb-4 shadow-sm">
              <Inbox className="h-12 w-12 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              Detay görüntülemek için bir konuşma seçin
            </p>
          </div>
        </div>
      );
    }

    const conversation = selectedConversation;
    const ChannelIcon = channelIcons[conversation.channel] || MessageSquare;

    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-lg",
                  getChannelColor(conversation.channel),
                )}
              >
                <ChannelIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {conversation.sender?.name || "İsimsiz"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {conversation.sender?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {conversation.sender.email}
                    </span>
                  )}
                  {conversation.sender?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {conversation.sender.phone}
                    </span>
                  )}
                </div>
                {conversation.sender?.company && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Building2 className="h-3 w-3" />
                    {conversation.sender.company}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/admin/crm-v2/inbox/${conversation.id}`)
                }
              >
                Tam Görünüm
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Tags & Status */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge
              variant="outline"
              className={getChannelColor(conversation.channel)}
            >
              {getChannelLabel(conversation.channel)}
            </Badge>
            <Badge
              variant="outline"
              className={getPriorityColor(conversation.priority)}
            >
              {getPriorityLabel(conversation.priority)}
            </Badge>
            {/* Durum Select - Legacy olmayan kayıtlar için */}
            {!conversation.isLegacy ? (
              <Select
                value={conversation.status}
                onValueChange={async (newStatus) => {
                  try {
                    await updateConversation(
                      conversation.id,
                      { status: newStatus },
                      user?.uid,
                    );
                    toast({
                      title: "Başarılı",
                      description: "Durum güncellendi.",
                    });
                    loadData();
                  } catch (error) {
                    toast({
                      title: "Hata",
                      description: "Durum güncellenemedi.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <SelectTrigger className="h-6 w-auto text-xs px-2 py-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CONVERSATION_STATUS.OPEN}>Açık</SelectItem>
                  <SelectItem value={CONVERSATION_STATUS.PENDING}>
                    Beklemede
                  </SelectItem>
                  <SelectItem value={CONVERSATION_STATUS.CLOSED}>
                    Kapalı
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge
                variant="outline"
                className={getConversationStatusColor(conversation.status)}
              >
                {getConversationStatusLabel(conversation.status)}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                {conversation.subject}
              </h4>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {stripHtmlToText(conversation.preview)}
              </p>
            </div>

            {/* Channel Metadata */}
            {conversation.channelMetadata &&
              Object.keys(conversation.channelMetadata).length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h5 className="text-sm font-semibold text-slate-900 mb-3">
                    Ek Bilgiler
                  </h5>
                  <dl className="text-sm space-y-2 bg-slate-50 rounded-lg p-4">
                    {(() => {
                      // Alan adı çevirileri
                      const fieldTranslations = {
                        isRead: "Okundu",
                        ccRecipients: "CC Alıcıları",
                        importance: "Önem Derecesi",
                        syncedAt: "Senkronize Edilme",
                        receivedDateTime: "Alınma Tarihi",
                        originalCreatedAt: "Orijinal Oluşturma",
                        toRecipients: "Alıcılar",
                        hasAttachments: "Ek Dosya Var",
                        fromAddress: "Gönderen Adres",
                        replyTo: "Yanıt Adresi",
                        messageId: "Mesaj ID",
                      };

                      // Gizlenecek karmaşık/gereksiz alanlar
                      const hiddenFields = [
                        "internetMessageId",
                        "outlookMessageId",
                        "outlookConversationId",
                        "conversationId",
                        "threadId",
                        "rawHeaders",
                        "bodyPreview",
                      ];

                      // Değer formatlama
                      const formatValue = (key, value) => {
                        if (value === null || value === undefined) return "-";
                        
                        // Boolean değerler
                        if (typeof value === "boolean") {
                          return value ? "Evet" : "Hayır";
                        }
                        
                        // Timestamp objesi kontrolü
                        if (value?.seconds || value?.toDate) {
                          try {
                            const date = value?.toDate?.() || new Date(value.seconds * 1000);
                            return format(date, "d MMMM yyyy HH:mm", { locale: tr });
                          } catch {
                            return "-";
                          }
                        }
                        
                        // Tarih string'i kontrolü (ISO format)
                        if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
                          try {
                            return format(new Date(value), "d MMMM yyyy HH:mm", { locale: tr });
                          } catch {
                            return value;
                          }
                        }
                        
                        // Importance/Önem değeri
                        if (key === "importance") {
                          const importanceMap = { low: "Düşük", normal: "Normal", high: "Yüksek" };
                          return importanceMap[value?.toLowerCase()] || value;
                        }
                        
                        // Uzun string'leri kısalt
                        const strValue = String(value);
                        if (strValue.length > 50) {
                          return strValue.substring(0, 47) + "...";
                        }
                        
                        return strValue;
                      };

                      return Object.entries(conversation.channelMetadata)
                        .filter(([key]) => !hiddenFields.includes(key))
                        .filter(([, value]) => value !== null && value !== undefined && value !== "")
                        .map(([key, value]) => (
                          <div key={key} className="flex">
                            <dt className="text-slate-600 font-medium w-36 flex-shrink-0">
                              {fieldTranslations[key] || key}:
                            </dt>
                            <dd className="text-slate-900 break-all">
                              {formatValue(key, value)}
                            </dd>
                          </div>
                        ));
                    })()}
                  </dl>
                </div>
              )}

            {/* Timestamps */}
            <div className="pt-6 border-t border-slate-100 text-sm text-slate-500 space-y-1">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Oluşturulma:</span>
                {(() => {
                  const originalDate =
                    conversation.channelMetadata?.originalCreatedAt;
                  const displayDate = originalDate || conversation.createdAt;
                  if (!displayDate) return "";
                  return format(
                    displayDate?.toDate?.() || new Date(displayDate),
                    "d MMMM yyyy HH:mm",
                    { locale: tr },
                  );
                })()}
              </p>
              {/* Son mesaj tarihi - sadece birden fazla mesaj varsa göster (yanıtlanmış conversation) */}
              {conversation.lastMessageAt &&
                (conversation.messageCount || 0) > 1 && (
                  <p className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Son mesaj:</span>
                    {format(
                      conversation.lastMessageAt?.toDate?.() ||
                        new Date(conversation.lastMessageAt),
                      "d MMMM yyyy HH:mm",
                      { locale: tr },
                    )}
                  </p>
                )}
              {/* Mesaj sayısı bilgisi */}
              {(conversation.messageCount || 0) > 0 && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Toplam mesaj:</span>
                  {conversation.messageCount} adet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Talebe Dönüştür - sadece açık veya beklemede ise ve talep yoksa */}
            {(conversation.status === CONVERSATION_STATUS.OPEN ||
              conversation.status === CONVERSATION_STATUS.PENDING ||
              conversation.status === CONVERSATION_STATUS.UNREAD) &&
            !conversation.linkedCaseId &&
            !selectedLinkedCase ? (
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                onClick={() => openConvertModal(conversation)}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Talebe Dönüştür
              </Button>
            ) : conversation.linkedCaseId || selectedLinkedCase ? (
              <Button className="flex-1" variant="outline" asChild>
                <Link
                  href={`/admin/crm-v2/cases/${conversation.linkedCaseId || selectedLinkedCase?.id}`}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Talebi Görüntüle
                </Link>
              </Button>
            ) : (
              <Button className="flex-1" variant="outline" disabled>
                <Briefcase className="h-4 w-4 mr-2" />
                Talebe Dönüştür
              </Button>
            )}
            {/* Kapat butonu - sadece kapalı değilse */}
            {conversation.status !== CONVERSATION_STATUS.CLOSED && (
              <Button
                variant="outline"
                onClick={() => handleClose(conversation)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Kapat
              </Button>
            )}
            {/* Ertele butonu - sadece açıksa */}
            {conversation.status !== CONVERSATION_STATUS.CLOSED && (
              <Button
                variant="outline"
                onClick={() => openSnoozeModal(conversation)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Clock className="h-4 w-4 mr-2" />
                Ertele
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex bg-slate-50">
        <div className="w-96 border-r bg-white p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 bg-slate-200" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Inbox</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Tüm kanallardan gelen mesajlar
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Link href="/admin/crm-v2/inbox/new">
                <MessageSquare className="h-4 w-4 mr-2" />
                Manuel Ekle
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="İsim, e-posta veya şirket ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-slate-300">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü ({counts.total || 0})</SelectItem>
              <SelectItem value="open">Açık ({counts.open || 0})</SelectItem>
              <SelectItem value="pending">
                Beklemede ({counts.pending || 0})
              </SelectItem>
              <SelectItem value="snoozed">
                Ertelendi ({counts.snoozed || 0})
              </SelectItem>
              <SelectItem value="closed">
                Kapalı ({counts.closed || 0})
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Channel Filter */}
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kanal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kanallar</SelectItem>
              {Object.values(CHANNEL).map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {getChannelLabel(channel)}
                  {counts.byChannel?.[channel]
                    ? ` (${counts.byChannel[channel]})`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Conversation List */}
        <div
          ref={listContainerRef}
          className="w-96 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto"
        >
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                <Inbox className="h-12 w-12 text-slate-300" />
              </div>
              <p className="text-slate-500">Konuşma bulunamadı</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map(renderConversationItem)}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {renderDetailPanel()}
      </div>

      {/* Convert to Case Modal */}
      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent className="sm:max-w-[500px] bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-lg font-semibold">
              Talebe Dönüştür
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Bu konuşmayı bir talebe dönüştürün. Talep, iş süreçlerinin takip
              edildiği ayrı bir alan olarak kullanılacaktır.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 font-medium">
                Talep Başlığı
              </Label>
              <Input
                id="title"
                value={caseForm.title}
                onChange={(e) =>
                  setCaseForm({ ...caseForm, title: e.target.value })
                }
                placeholder="Talep başlığı"
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-slate-700 font-medium">
                  Talep Türü
                </Label>
                <Select
                  value={caseForm.type}
                  onValueChange={(value) =>
                    setCaseForm({ ...caseForm, type: value })
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CASE_TYPE).map((type) => (
                      <SelectItem key={type} value={type}>
                        {getCaseTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="priority"
                  className="text-slate-700 font-medium"
                >
                  Öncelik
                </Label>
                <Select
                  value={caseForm.priority}
                  onValueChange={(value) =>
                    setCaseForm({ ...caseForm, priority: value })
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PRIORITY).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {getPriorityLabel(priority)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-slate-700 font-medium"
              >
                Açıklama
              </Label>
              <Textarea
                id="description"
                value={caseForm.description}
                onChange={(e) =>
                  setCaseForm({ ...caseForm, description: e.target.value })
                }
                placeholder="Talep açıklaması..."
                rows={4}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConvertModal(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              İptal
            </Button>
            <Button
              onClick={handleConvertToCase}
              disabled={!caseForm.title || creatingCase}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {creatingCase ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Briefcase className="h-4 w-4 mr-2" />
              )}
              {creatingCase ? "Oluşturuluyor..." : "Talep Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snooze Modal */}
      <Dialog open={showSnoozeModal} onOpenChange={setShowSnoozeModal}>
        <DialogContent className="sm:max-w-[400px] bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-lg font-semibold">
              Konuşmayı Ertele
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Bu konuşma belirttiğiniz tarihe kadar ertelenecek ve o tarihte
              tekrar inbox&apos;ta görünecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="snoozeUntil"
                className="text-slate-700 font-medium"
              >
                Erteleme Tarihi
              </Label>
              <Input
                id="snoozeUntil"
                type="datetime-local"
                value={snoozeUntil}
                onChange={(e) => setSnoozeUntil(e.target.value)}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Quick options */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Yarın", days: 1 },
                { label: "3 gün", days: 3 },
                { label: "1 hafta", days: 7 },
                { label: "2 hafta", days: 14 },
              ].map((option) => (
                <Button
                  key={option.days}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + option.days);
                    date.setHours(9, 0, 0, 0);
                    setSnoozeUntil(date.toISOString().slice(0, 16));
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSnoozeModal(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              İptal
            </Button>
            <Button
              onClick={handleSnooze}
              disabled={!snoozeUntil}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Ertele
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
