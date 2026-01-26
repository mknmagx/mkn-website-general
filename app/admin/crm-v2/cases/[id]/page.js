"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
import {
  getCase,
  updateCase,
  addQuoteToCase,
  updateCaseQuote,
  deleteQuoteFromCase,
  logActivity,
  toggleChecklistItem,
  getChecklistProgress,
  addReminderToCase,
  updateReminderStatus,
  snoozeReminder,
  deleteReminder,
  addAttachmentToCase,
  deleteAttachmentFromCase,
  addNoteToCase,
  deleteNoteFromCase,
  toggleNoteImportance,
  deleteCase,
  addSummaryToCase,
  deleteSummaryFromCase,
} from "../../../../../lib/services/crm-v2";
import { getCustomer } from "../../../../../lib/services/crm-v2/customer-service";
import {
  getConversationWithMessages,
  addMessage,
} from "../../../../../lib/services/crm-v2/conversation-service";
import { getChecklistForCaseType } from "../../../../../lib/services/crm-v2/settings-service";
import {
  ProformaService,
  PROFORMA_STATUS_LABELS,
} from "../../../../../lib/services/proforma-service";
import {
  CASE_STATUS,
  CASE_TYPE,
  PRIORITY,
  getCaseStatusLabel,
  getCaseStatusColor,
  getCaseTypeLabel,
  getPriorityLabel,
  getPriorityColor,
  getChannelLabel,
  calculateSLAStatus,
  getSLAStatusColor,
  getSLAProgressColor,
  REMINDER_TYPE,
  getReminderTypeLabel,
  getReminderTypeColor,
} from "../../../../../lib/services/crm-v2/schema";
import { formatDistanceToNow, format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../../lib/utils";

// AI Hook
import { useUnifiedAI, AI_CONTEXTS } from "../../../../../hooks/use-unified-ai";

// AI Settings Modal Component
import AISettingsModal from "../../../../../components/admin/ai-settings-modal";

// HTML to Text utility - Mesaj temizleme
import {
  cleanTextForAI,
  cleanEmailContent,
} from "../../../../../utils/html-to-text";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { Textarea } from "../../../../../components/ui/textarea";
import { Label } from "../../../../../components/ui/label";
import { Progress } from "../../../../../components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { Separator } from "../../../../../components/ui/separator";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { Checkbox } from "../../../../../components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";

// Icons
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  DollarSign,
  RefreshCw,
  ExternalLink,
  Receipt,
  Search,
  Loader2,
  Trash2,
  Send,
  MoreVertical,
  CheckCircle2,
  XOctagon,
  ListChecks,
  Timer,
  Bell,
  BellOff,
  AlertTriangle,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
  CalendarClock,
  Paperclip,
  StickyNote,
  Upload,
  Image,
  File,
  Star,
  StarOff,
  Download,
  Eye,
  ShoppingCart,
  Zap,
} from "lucide-react";

// Helper function to render complex AI summary values in a readable format
const renderAIValue = (value, depth = 0) => {
  if (value === null || value === undefined) return null;

  // String veya number ise direkt döndür
  if (typeof value === "string" || typeof value === "number") {
    return <span>{value}</span>;
  }

  // Array ise liste olarak göster
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return (
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        {value.map((item, i) => (
          <li key={i} className="text-slate-600">
            {typeof item === "object" ? renderAIValue(item, depth + 1) : item}
          </li>
        ))}
      </ul>
    );
  }

  // Object ise key-value olarak göster
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return null;

    return (
      <div
        className={cn(
          "space-y-2",
          depth > 0 && "ml-3 mt-1 border-l-2 border-slate-200 pl-3",
        )}
      >
        {entries.map(([key, val]) => (
          <div key={key}>
            <span className="font-medium text-slate-700">{key}:</span>
            {typeof val === "object" ? (
              <div className="mt-1">{renderAIValue(val, depth + 1)}</div>
            ) : (
              <span className="ml-1 text-slate-600">{val}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
};

const STATUS_FLOW = [
  CASE_STATUS.NEW,
  CASE_STATUS.QUALIFYING,
  CASE_STATUS.QUOTE_SENT,
  CASE_STATUS.NEGOTIATING,
  CASE_STATUS.WON,
];

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  const caseId = params.id;
  const messagesEndRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Modals
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    amount: "",
    currency: "TRY",
    description: "",
    validUntil: "",
  });

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [statusNote, setStatusNote] = useState("");

  // Proforma Modal State
  const [showProformaModal, setShowProformaModal] = useState(false);
  const [proformas, setProformas] = useState([]);
  const [loadingProformas, setLoadingProformas] = useState(false);
  const [selectedProformaId, setSelectedProformaId] = useState(null);
  const [proformaSearchTerm, setProformaSearchTerm] = useState("");

  // Checklist State
  const [checklistSettings, setChecklistSettings] = useState(null);
  const [checklistProgress, setChecklistProgress] = useState({
    completed: 0,
    total: 0,
  });
  const [updatingChecklist, setUpdatingChecklist] = useState(null);
  const [showUncheckConfirm, setShowUncheckConfirm] = useState(false);
  const [pendingUncheckItem, setPendingUncheckItem] = useState(null);

  // Reminder State
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    type: "follow_up",
    dueDate: "",
    title: "",
    description: "",
  });
  const [savingReminder, setSavingReminder] = useState(false);

  // SLA State
  const [slaStatus, setSlaStatus] = useState(null);

  // Attachments & Notes State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({ content: "", important: false });
  const [savingNote, setSavingNote] = useState(false);
  const fileInputRef = useRef(null);

  // Delete Case State (Super Admin Only)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isSuperAdmin = user?.role === "super_admin";

  // AI Summary State
  const [showAiSettingsModal, setShowAiSettingsModal] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [expandedSummaryId, setExpandedSummaryId] = useState(null);
  const [modelSettings, setModelSettings] = useState({
    maxTokens: 2048,
    autoMaxTokens: true,
    temperature: 0.3,
  });

  // AI Hook
  const {
    generateContent: generateAiSummary,
    loading: aiLoading,
    configLoading: aiConfigLoading,
    availableModels,
    selectedModel,
    selectModel,
    isReady: aiIsReady,
    error: aiError,
    prompt: aiPrompt,
    config: aiConfig,
  } = useUnifiedAI(AI_CONTEXTS.CRM_CASE_SUMMARY);

  // Firestore config yüklendiğinde modelSettings'i güncelle
  useEffect(() => {
    if (aiConfig?.settings) {
      setModelSettings((prev) => ({
        ...prev,
        maxTokens: aiConfig.settings.maxTokens || prev.maxTokens,
        temperature: aiConfig.settings.temperature ?? prev.temperature,
      }));
    }
  }, [aiConfig]);

  // Modal'da gösterilecek prompt değişkenleri
  const currentPromptVariables = useMemo(() => {
    const customerName = customer?.name || "Müşteri";
    const customerCompany = customer?.companyName || "";

    // Mesajları düzgün formatla - HTML'i temizle
    const formattedMessages =
      conversation?.messages
        ?.map((m, index) => {
          const direction =
            m.direction === "inbound" ? "📩 MÜŞTERİ" : "📤 OPERATİONS";
          const rawContent = m.content || "";
          // HTML'den temiz metin çıkar (email alıntıları ve imzalar dahil temizlenir)
          const cleanContent = cleanTextForAI(rawContent, 500);
          return `[${index + 1}] ${direction}:\n${cleanContent}`;
        })
        .join("\n\n---\n\n") || "(Mesaj yok)";

    return {
      conversation_messages: formattedMessages,
      customer_name: customerName,
      customer_company: customerCompany || "(Belirtilmemiş)",
      case_title: caseData?.title || "(Başlık yok)",
      case_type: getCaseTypeLabel(caseData?.type) || "(Tür yok)",
      case_description: caseData?.description || "(Açıklama yok)",
    };
  }, [conversation, customer, caseData]);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const caseResult = await getCase(caseId);

      if (!caseResult) {
        toast({
          title: "Hata",
          description: "Talep bulunamadı.",
          variant: "destructive",
        });
        router.push("/admin/crm-v2/cases");
        return;
      }

      setCaseData(caseResult);
      setEditForm({
        title: caseResult.title || "",
        description: caseResult.description || "",
        type: caseResult.type || CASE_TYPE.SALES,
        priority: caseResult.priority || PRIORITY.NORMAL,
      });

      // Load checklist settings for case type
      const checklistConfig = await getChecklistForCaseType(caseResult.type);
      console.log(
        "[Case Detail] Checklist config for type",
        caseResult.type,
        ":",
        checklistConfig,
      );
      setChecklistSettings(checklistConfig);

      // Calculate checklist progress if case has checklist
      if (caseResult.checklist?.length > 0) {
        const progress = getChecklistProgress(caseResult.checklist);
        setChecklistProgress(progress);
      } else if (checklistConfig?.phases?.length > 0) {
        // Initialize checklist from settings if not exists
        const allItems = checklistConfig.phases.flatMap((phase) =>
          phase.items.map((item) => ({
            ...item,
            completed: false,
            completedAt: null,
            completedBy: null,
          })),
        );
        console.log(
          "[Case Detail] Checklist items initialized:",
          allItems.length,
        );
        setChecklistProgress({ completed: 0, total: allItems.length });
      } else {
        console.log("[Case Detail] No checklist config phases found");
      }

      // Calculate SLA status - caseResult objesinin tamamını geçir
      if (caseResult.status) {
        const sla = calculateSLAStatus(caseResult);
        console.log("[Case Detail] SLA calculated:", sla);
        setSlaStatus(sla);
      }

      const [customerData, conversationData] = await Promise.all([
        caseResult.customerId ? getCustomer(caseResult.customerId) : null,
        caseResult.sourceConversationId
          ? getConversationWithMessages(caseResult.sourceConversationId)
          : null,
      ]);

      setCustomer(customerData);
      setConversation(conversationData);
    } catch (error) {
      console.error("Error loading case:", error);
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [caseId, router, toast]);

  // Track previous message count to detect NEW messages only
  const prevMessageCount = useRef(0);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Scroll to bottom ONLY when a NEW message is added (not on initial load)
  useEffect(() => {
    const currentCount = conversation?.messages?.length || 0;

    // Only scroll if message count increased (new message added)
    // Skip initial load (when prevMessageCount is 0)
    if (
      prevMessageCount.current > 0 &&
      currentCount > prevMessageCount.current
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessageCount.current = currentCount;
  }, [conversation?.messages?.length]);

  // Send reply to conversation
  const handleSendReply = async () => {
    if (!replyContent.trim() || !conversation) return;

    setSendingReply(true);
    try {
      await addMessage(conversation.id, {
        content: replyContent,
        direction: "outbound",
        sender: {
          name: user?.displayName || user?.email || "Admin",
          email: user?.email,
        },
      });

      setReplyContent("");
      toast({ title: "Gönderildi", description: "Mesajınız eklendi." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi.",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCase(caseId, editForm, user?.uid);
      toast({ title: "Başarılı", description: "Talep güncellendi." });
      setEditing(false);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Güncelleme başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Status change
  const handleStatusChange = async () => {
    if (!targetStatus) return;

    try {
      await updateCase(
        caseId,
        { status: targetStatus, statusChangeNotes: statusNote },
        user?.uid,
      );

      toast({
        title: "Başarılı",
        description: `Durum "${getCaseStatusLabel(
          targetStatus,
        )}" olarak güncellendi.`,
      });
      setShowStatusModal(false);
      setTargetStatus(null);
      setStatusNote("");
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  // Add quote
  const handleSaveQuote = async () => {
    if (!quoteForm.amount) return;

    try {
      await addQuoteToCase(caseId, {
        amount: parseFloat(quoteForm.amount),
        currency: quoteForm.currency,
        description: quoteForm.description,
        validUntil: quoteForm.validUntil,
      });
      toast({ title: "Başarılı", description: "Teklif eklendi." });
      setShowQuoteModal(false);
      setQuoteForm({
        amount: "",
        currency: "TRY",
        description: "",
        validUntil: "",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Teklif kaydedilemedi.",
        variant: "destructive",
      });
    }
  };

  // Load proformas for selection
  const loadProformas = async () => {
    setLoadingProformas(true);
    try {
      const result = await ProformaService.getProformas();
      if (result.success) {
        setProformas(result.proformas || []);
      }
    } catch (error) {
      console.error("Error loading proformas:", error);
    } finally {
      setLoadingProformas(false);
    }
  };

  // Open proforma modal
  const openProformaModal = () => {
    setShowProformaModal(true);
    setSelectedProformaId(null);
    setProformaSearchTerm("");
    loadProformas();
  };

  // Add proforma as quote
  const handleAddProformaAsQuote = async () => {
    if (!selectedProformaId) return;

    const selectedProforma = proformas.find((p) => p.id === selectedProformaId);
    if (!selectedProforma) return;

    try {
      await addQuoteToCase(caseId, {
        amount: selectedProforma.totalAmount || 0,
        currency: selectedProforma.currency || "TRY",
        description: `Proforma: ${selectedProforma.proformaNumber}\n${
          selectedProforma.companyName || ""
        }\n${selectedProforma.notes || ""}`,
        validUntil: selectedProforma.validUntil || "",
        proformaId: selectedProforma.id,
        proformaNumber: selectedProforma.proformaNumber,
        status: selectedProforma.status || "draft", // Proformanın gerçek statusunu kullan
      });
      toast({
        title: "Başarılı",
        description: "Proforma teklif olarak eklendi.",
      });
      setShowProformaModal(false);
      setSelectedProformaId(null);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Proforma eklenemedi.",
        variant: "destructive",
      });
    }
  };

  // Delete quote
  const handleDeleteQuote = async (quoteId) => {
    if (!confirm("Bu teklifi silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteQuoteFromCase(caseId, quoteId, user?.uid);
      toast({ title: "Başarılı", description: "Teklif silindi." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Teklif silinemedi.",
        variant: "destructive",
      });
    }
  };

  // ==================== CHECKLIST HANDLERS ====================
  const handleToggleChecklistItem = async (
    itemId,
    isCurrentlyCompleted,
    itemLabel,
  ) => {
    // Eğer zaten işaretli ve kaldırılmak isteniyorsa onay iste
    if (isCurrentlyCompleted) {
      setPendingUncheckItem({ id: itemId, label: itemLabel });
      setShowUncheckConfirm(true);
      return;
    }

    // Yeni işaretleme - direkt yap
    await executeChecklistToggle(itemId);
  };

  const executeChecklistToggle = async (itemId) => {
    setUpdatingChecklist(itemId);
    try {
      await toggleChecklistItem(caseId, itemId, checklistSettings, user?.uid);
      toast({ title: "Başarılı", description: "Checklist güncellendi." });
      loadData();
    } catch (error) {
      console.error("Error toggling checklist item:", error);
      toast({
        title: "Hata",
        description: "Checklist güncellenemedi.",
        variant: "destructive",
      });
    } finally {
      setUpdatingChecklist(null);
    }
  };

  const handleConfirmUncheck = async () => {
    if (pendingUncheckItem) {
      await executeChecklistToggle(pendingUncheckItem.id);
    }
    setShowUncheckConfirm(false);
    setPendingUncheckItem(null);
  };

  // ==================== REMINDER HANDLERS ====================
  const handleAddReminder = async () => {
    if (!reminderForm.dueDate || !reminderForm.title) {
      toast({
        title: "Hata",
        description: "Başlık ve tarih zorunludur.",
        variant: "destructive",
      });
      return;
    }

    setSavingReminder(true);
    try {
      await addReminderToCase(
        caseId,
        {
          type: reminderForm.type,
          title: reminderForm.title,
          description: reminderForm.description,
          dueDate: new Date(reminderForm.dueDate),
        },
        user?.uid,
      );

      toast({ title: "Başarılı", description: "Hatırlatıcı eklendi." });
      setShowReminderModal(false);
      setReminderForm({
        type: "follow_up",
        dueDate: "",
        title: "",
        description: "",
      });
      loadData();
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Hata",
        description: "Hatırlatıcı eklenemedi.",
        variant: "destructive",
      });
    } finally {
      setSavingReminder(false);
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await updateReminderStatus(caseId, reminderId, "completed", user?.uid);
      toast({ title: "Başarılı", description: "Hatırlatıcı tamamlandı." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  const handleDismissReminder = async (reminderId) => {
    try {
      await updateReminderStatus(caseId, reminderId, "dismissed", user?.uid);
      toast({ title: "Başarılı", description: "Hatırlatıcı kapatıldı." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  const handleSnoozeReminder = async (reminderId, hours = 24) => {
    try {
      await snoozeReminder(caseId, reminderId, hours, user?.uid);
      toast({
        title: "Başarılı",
        description: `Hatırlatıcı ${hours} saat ertelendi.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!confirm("Bu hatırlatıcıyı silmek istediğinizden emin misiniz?"))
      return;

    try {
      await deleteReminder(caseId, reminderId, user?.uid);
      toast({ title: "Başarılı", description: "Hatırlatıcı silindi." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hatırlatıcı silinemedi.",
        variant: "destructive",
      });
    }
  };

  // Get active/pending reminders
  const activeReminders =
    caseData?.reminders?.filter(
      (r) => r.status === "pending" || r.status === "snoozed",
    ) || [];

  const overdueReminders = activeReminders.filter((r) => {
    const dueDate = r.dueDate?.toDate?.() || new Date(r.dueDate);
    return dueDate < new Date();
  });

  // ==================== ATTACHMENT & NOTE HANDLERS ====================
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 10MB'dan büyük olamaz.",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(true);
    try {
      // API route üzerinden Cloudinary'ye yükle
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId);

      const response = await fetch("/api/upload/case-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const result = data.data;

      // Case'e ekle
      await addAttachmentToCase(
        caseId,
        {
          name: result.fileName,
          url: result.url,
          publicId: result.publicId,
          type: result.isImage
            ? "image"
            : result.fileType === "application/pdf"
              ? "pdf"
              : "file",
          size: result.fileSize,
          category: "general",
          isImage: result.isImage,
        },
        user?.uid,
      );

      toast({ title: "Başarılı", description: "Dosya yüklendi." });
      loadData();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Hata",
        description: error.message || "Dosya yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm("Bu dosyayı silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteAttachmentFromCase(caseId, attachmentId, user?.uid);
      toast({ title: "Başarılı", description: "Dosya silindi." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dosya silinemedi.",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.content.trim()) {
      toast({
        title: "Hata",
        description: "Not içeriği boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    setSavingNote(true);
    try {
      await addNoteToCase(
        caseId,
        noteForm,
        user?.uid,
        user?.displayName || user?.email,
      );
      toast({ title: "Başarılı", description: "Not eklendi." });
      setShowNoteModal(false);
      setNoteForm({ content: "", important: false });
      loadData();
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Hata",
        description: "Not eklenemedi.",
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Bu notu silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteNoteFromCase(caseId, noteId, user?.uid);
      toast({ title: "Başarılı", description: "Not silindi." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Not silinemedi.",
        variant: "destructive",
      });
    }
  };

  const handleToggleNoteImportance = async (noteId) => {
    try {
      await toggleNoteImportance(caseId, noteId, user?.uid);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  // ==================== DELETE CASE HANDLER (SUPER ADMIN ONLY) ====================
  const handleDeleteCase = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Yetki Hatası",
        description: "Bu işlem için yetkiniz yok.",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);
    try {
      await deleteCase(caseId);
      toast({ title: "Başarılı", description: "Talep başarıyla silindi." });
      router.push("/admin/crm-v2/cases");
    } catch (error) {
      console.error("Error deleting case:", error);
      toast({
        title: "Hata",
        description: "Talep silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getFileIcon = (type) => {
    if (type === "image") return <Image className="h-4 w-4 text-blue-500" />;
    if (type === "pdf") return <FileText className="h-4 w-4 text-red-500" />;
    return <File className="h-4 w-4 text-slate-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ==================== AI SUMMARY HANDLERS ====================
  const handleGenerateSummary = async () => {
    if (!conversation?.messages?.length) {
      toast({
        title: "Hata",
        description: "Özetlenecek konuşma bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingSummary(true);
    try {
      // Konuşma mesajlarını formatla
      const formattedMessages = conversation.messages
        .map((msg) => {
          const sender = msg.direction === "inbound" ? "Müşteri" : "MKN GROUP";
          const date = msg.createdAt?.toDate?.()
            ? format(msg.createdAt.toDate(), "dd.MM.yyyy HH:mm", { locale: tr })
            : "";
          const content = cleanEmailContent(msg.content || msg.text || "");
          return `[${date}] ${sender}:\n${content}`;
        })
        .join("\n\n---\n\n");

      // Prompt değişkenleri hazırla (Firestore'daki prompt şablonuna uygun)
      const promptVariables = {
        conversation_messages: formattedMessages,
        customer_name: customer?.name || customer?.companyName || "Bilinmeyen",
        customer_company: customer?.companyName || "Belirtilmemiş",
        case_title: caseData?.title || "Belirtilmemiş",
        case_type: getCaseTypeLabel(caseData?.type),
        case_description: caseData?.description
          ? cleanEmailContent(caseData.description)
          : "Açıklama yok",
      };

      // useUnifiedAI hook'u ile üret - Firestore'daki prompt otomatik kullanılır
      // Hata durumunda hook otomatik toast gösterir
      const result = await generateAiSummary(null, {
        promptVariables,
        temperature: modelSettings.temperature,
        maxTokens: modelSettings.autoMaxTokens ? undefined : modelSettings.maxTokens,
      });

      if (!result.success) {
        // Hook zaten toast gösterdi, sadece çık
        return;
      }

      // JSON parse et
      let summaryData;
      try {
        // JSON'u temizle - bazen AI markdown code block ekliyor
        let jsonContent = result.content;
        if (jsonContent.includes("```json")) {
          jsonContent = jsonContent
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "");
        } else if (jsonContent.includes("```")) {
          jsonContent = jsonContent.replace(/```\n?/g, "");
        }

        // Kesilmiş/eksik JSON'ı düzeltmeye çalış
        jsonContent = jsonContent.trim();

        // Eğer JSON tam değilse tamamlamaya çalış
        const openBraces = (jsonContent.match(/{/g) || []).length;
        const closeBraces = (jsonContent.match(/}/g) || []).length;
        const openBrackets = (jsonContent.match(/\[/g) || []).length;
        const closeBrackets = (jsonContent.match(/\]/g) || []).length;

        // Eksik kapanış parantezlerini ekle
        if (openBrackets > closeBrackets) {
          jsonContent += "]".repeat(openBrackets - closeBrackets);
        }
        if (openBraces > closeBraces) {
          // Eğer son karakter virgül veya açık tırnak ise düzelt
          jsonContent = jsonContent.replace(/,\s*$/, "");
          jsonContent = jsonContent.replace(/"[^"]*$/, '""');
          jsonContent += "}".repeat(openBraces - closeBraces);
        }

        summaryData = JSON.parse(jsonContent.trim());
      } catch (parseError) {
        console.error("JSON parse error:", parseError, result.content);

        // Fallback: Ham içerikten özet çıkarmaya çalış
        const summaryMatch = result.content.match(/"summary"\s*:\s*"([^"]+)"/);
        const mainRequestMatch = result.content.match(
          /"mainRequest"\s*:\s*"([^"]+)"/,
        );

        if (summaryMatch || mainRequestMatch) {
          summaryData = {
            mainRequest: mainRequestMatch?.[1] || "Kısmi Özet",
            summary:
              summaryMatch?.[1] ||
              mainRequestMatch?.[1] ||
              "Özet ayrıştırılamadı",
            details: {},
            keyPoints: [],
            uncertainties: ["JSON yanıtı kısmen ayrıştırıldı"],
            suggestedActions: [],
            parseError: true,
          };
        } else {
          // Fallback: Düz metin olarak kaydet
          summaryData = {
            mainRequest: "Özet ayrıştırılamadı",
            summary: result.content,
            details: {},
            keyPoints: [],
            uncertainties: [
              "JSON formatı ayrıştırılamadı - ham yanıt kaydedildi",
            ],
            suggestedActions: [],
          };
        }
      }

      // Özeti kaydet
      await addSummaryToCase(
        caseId,
        {
          ...summaryData,
          aiModel:
            result.model || selectedModel?.displayName || selectedModel?.name,
          aiProvider: result.provider,
          messageCount: conversation.messages.length,
        },
        user?.uid,
        user?.displayName || user?.email,
      );

      toast({
        title: "Başarılı",
        description: "Talep özeti oluşturuldu.",
      });

      loadData();
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "AI Hatası",
        description: error.message || "Özet oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleDeleteSummary = async (summaryId) => {
    if (!confirm("Bu özeti silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteSummaryFromCase(caseId, summaryId, user?.uid);
      toast({ title: "Başarılı", description: "Özet silindi." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Özet silinemedi.",
        variant: "destructive",
      });
    }
  };

  // ==================== END HANDLERS ====================

  // Update quote status (and sync with proforma if linked)
  const handleUpdateQuoteStatus = async (quote, newStatus) => {
    try {
      // CRM teklifini güncelle
      await updateCaseQuote(caseId, quote.id, { status: newStatus }, user?.uid);

      // Eğer proformaya bağlıysa, proforma statusunu da güncelle
      if (quote.proformaId) {
        const result = await ProformaService.updateProformaStatus(
          quote.proformaId,
          newStatus,
        );
        if (!result.success) {
          console.error("Proforma status güncellenemedi:", result.error);
        }
      }

      const statusLabels = {
        draft: "taslak",
        sent: "gönderildi",
        accepted: "kabul edildi",
        rejected: "reddedildi",
      };
      toast({
        title: "Başarılı",
        description: `Teklif ${
          statusLabels[newStatus] || newStatus
        } olarak işaretlendi.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Teklif durumu güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  // Get quote status label and color
  const getQuoteStatusLabel = (status) => {
    const labels = {
      draft: "Taslak",
      sent: "Gönderildi",
      accepted: "Kabul Edildi",
      rejected: "Reddedildi",
      expired: "Süresi Doldu",
    };
    return labels[status] || status;
  };

  const getQuoteStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-100 text-slate-700",
      sent: "bg-blue-100 text-blue-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      expired: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  // Filter proformas by search term and sort by createdAt
  const filteredProformas = proformas
    .filter((p) => {
      const search = proformaSearchTerm.toLowerCase();
      const companyName = p.customerInfo?.companyName || p.companyName || "";
      const contactPerson =
        p.customerInfo?.contactPerson || p.contactPerson || "";
      return (
        p.proformaNumber?.toLowerCase().includes(search) ||
        companyName.toLowerCase().includes(search) ||
        contactPerson.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const dateA =
        a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
      const dateB =
        b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
      return dateB - dateA; // Newest first
    });

  const formatCurrency = (value, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getCurrentStatusIndex = () => STATUS_FLOW.indexOf(caseData?.status);

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        <Skeleton className="h-10 w-64 bg-slate-200" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-48 bg-slate-200" />
            <Skeleton className="h-64 bg-slate-200" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 bg-slate-200" />
            <Skeleton className="h-40 bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) return null;

  const isClosedStatus = [
    CASE_STATUS.WON,
    CASE_STATUS.LOST,
    CASE_STATUS.CANCELLED,
  ].includes(caseData.status);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hover:bg-slate-100"
          >
            <Link href="/admin/crm-v2/cases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">
                {caseData.title || "İsimsiz Talep"}
              </h1>
              <Badge
                variant="outline"
                className={cn("text-xs", getCaseStatusColor(caseData.status))}
              >
                {getCaseStatusLabel(caseData.status)}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", getPriorityColor(caseData.priority))}
              >
                {getPriorityLabel(caseData.priority)}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              #{caseData.caseNumber} • {getCaseTypeLabel(caseData.type)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
                className="border-slate-200"
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={openProformaModal}
                className="border-slate-200"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Proforma Ekle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuoteModal(true)}
                className="border-slate-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Teklif Ekle
              </Button>
              <Button
                size="sm"
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              {isSuperAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pipeline Progress */}
      {!isClosedStatus && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center">
              {STATUS_FLOW.map((status, index) => {
                const currentIndex = getCurrentStatusIndex();
                const isActive = index === currentIndex;
                const isPast = index < currentIndex;
                const isFuture = index > currentIndex;

                return (
                  <div key={status} className="flex items-center flex-1">
                    <button
                      onClick={() => {
                        if (!isActive && !isPast) {
                          setTargetStatus(status);
                          setShowStatusModal(true);
                        }
                      }}
                      disabled={isPast || isActive}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all flex-1",
                        isActive && "bg-blue-50",
                        !isPast &&
                          !isActive &&
                          "hover:bg-slate-50 cursor-pointer",
                        isPast && "opacity-50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                          isActive && "bg-blue-600 text-white",
                          isPast && "bg-green-500 text-white",
                          isFuture && "bg-slate-100 text-slate-500",
                        )}
                      >
                        {isPast ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isActive && "text-blue-600",
                          isPast && "text-slate-400",
                          isFuture && "text-slate-500",
                        )}
                      >
                        {getCaseStatusLabel(status)}
                      </span>
                    </button>
                    {index < STATUS_FLOW.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 w-full max-w-[40px]",
                          index < currentIndex
                            ? "bg-green-500"
                            : "bg-slate-200",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closed Status Banner */}
      {isClosedStatus && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-4">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  caseData.status === CASE_STATUS.WON &&
                    "bg-green-50 text-green-700",
                  caseData.status === CASE_STATUS.LOST &&
                    "bg-red-50 text-red-700",
                  caseData.status === CASE_STATUS.CANCELLED &&
                    "bg-slate-100 text-slate-600",
                )}
              >
                {caseData.status === CASE_STATUS.WON && (
                  <CheckCircle className="h-5 w-5" />
                )}
                {caseData.status === CASE_STATUS.LOST && (
                  <XCircle className="h-5 w-5" />
                )}
                {caseData.status === CASE_STATUS.CANCELLED && (
                  <X className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {getCaseStatusLabel(caseData.status)}
                </span>
              </div>
              {caseData.status === CASE_STATUS.WON && (
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/crm-v2/orders/new?caseId=${caseId}`)
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Siparişe Dönüştür
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTargetStatus(CASE_STATUS.NEW);
                  setShowStatusModal(true);
                }}
                className="border-slate-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Yeniden Aç
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Talep Bilgileri
                </CardTitle>
                {/* AI Özet Butonları */}
                {conversation?.messages?.length > 0 && !editing && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={generatingSummary || !aiIsReady}
                      className="border-slate-200 text-slate-600 hover:text-slate-900"
                    >
                      {generatingSummary ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      )}
                      {generatingSummary ? "Özetleniyor..." : "AI ile Özetle"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAiSettingsModal(true)}
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      title="AI Ayarları"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Özetleri */}
              {caseData.aiSummaries?.length > 0 && !editing && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Özetleri
                    <Badge variant="secondary" className="text-xs">
                      {caseData.aiSummaries.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {caseData.aiSummaries.map((summary, index) => {
                      const isExpanded = expandedSummaryId === summary.id;
                      return (
                        <div
                          key={summary.id}
                          className="border border-purple-100 bg-purple-50/50 rounded-lg overflow-hidden"
                        >
                          {/* Summary Header */}
                          <div
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-purple-50 transition-colors"
                            onClick={() =>
                              setExpandedSummaryId(
                                isExpanded ? null : summary.id,
                              )
                            }
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-800 truncate">
                                  {typeof summary.mainRequest === "object"
                                    ? JSON.stringify(summary.mainRequest)
                                    : summary.mainRequest || "Özet"}
                                </span>
                                {index === 0 && (
                                  <Badge className="bg-purple-100 text-purple-700 text-[10px]">
                                    En Güncel
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                <span>{summary.aiModel || "AI"}</span>
                                <span>•</span>
                                <span>{summary.messageCount} mesaj</span>
                                <span>•</span>
                                <span>
                                  {formatDistanceToNow(
                                    summary.createdAt?.toDate?.() ||
                                      new Date(summary.createdAt),
                                    { addSuffix: true, locale: tr },
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSummary(summary.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="border-t border-purple-100 p-3 space-y-3 bg-white">
                              {/* Summary Text */}
                              {summary.summary && (
                                <div>
                                  <p className="text-sm text-slate-700">
                                    {typeof summary.summary === "object"
                                      ? renderAIValue(summary.summary)
                                      : summary.summary}
                                  </p>
                                </div>
                              )}

                              {/* Talep Edilen Ürünler */}
                              {summary.requestedProducts?.length > 0 && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-blue-800 text-sm">
                                      Talep Edilen Ürünler
                                    </span>
                                    <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                                      {summary.requestedProducts.length} ürün
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    {summary.requestedProducts.map(
                                      (product, i) => (
                                        <div
                                          key={i}
                                          className="flex items-start gap-2 text-sm bg-white/60 p-2 rounded border border-blue-100"
                                        >
                                          <span className="text-blue-500 font-bold">
                                            {i + 1}.
                                          </span>
                                          <div className="flex-1">
                                            <span className="font-medium text-slate-800">
                                              {typeof product === "string"
                                                ? product
                                                : product.name || "Ürün"}
                                            </span>
                                            {product.quantity && (
                                              <span className="ml-2 text-slate-500">
                                                ({product.quantity})
                                              </span>
                                            )}
                                            {product.specs && (
                                              <p className="text-xs text-slate-500 mt-0.5">
                                                {product.specs}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Details */}
                              {summary.details &&
                                Object.keys(summary.details).some(
                                  (k) => summary.details[k],
                                ) && (
                                  <div className="space-y-3 text-xs">
                                    {/* Basit alanlar - grid içinde */}
                                    <div className="grid grid-cols-2 gap-2">
                                      {summary.details.productType && (
                                        <div className="bg-slate-50 p-2 rounded">
                                          <span className="text-slate-500">
                                            Kategori:
                                          </span>{" "}
                                          <span className="text-slate-700 font-medium">
                                            {typeof summary.details
                                              .productType === "object"
                                              ? renderAIValue(
                                                  summary.details.productType,
                                                )
                                              : summary.details.productType}
                                          </span>
                                        </div>
                                      )}
                                      {summary.details.quantity && (
                                        <div className="bg-slate-50 p-2 rounded">
                                          <span className="text-slate-500">
                                            Miktar:
                                          </span>{" "}
                                          <span className="text-slate-700 font-medium">
                                            {typeof summary.details.quantity ===
                                            "object"
                                              ? renderAIValue(
                                                  summary.details.quantity,
                                                )
                                              : summary.details.quantity}
                                          </span>
                                        </div>
                                      )}
                                      {summary.details.timeline && (
                                        <div className="bg-slate-50 p-2 rounded">
                                          <span className="text-slate-500">
                                            Süre:
                                          </span>{" "}
                                          <span className="text-slate-700 font-medium">
                                            {typeof summary.details.timeline ===
                                            "object"
                                              ? renderAIValue(
                                                  summary.details.timeline,
                                                )
                                              : summary.details.timeline}
                                          </span>
                                        </div>
                                      )}
                                      {summary.details.budget && (
                                        <div className="bg-slate-50 p-2 rounded">
                                          <span className="text-slate-500">
                                            Bütçe:
                                          </span>{" "}
                                          <span className="text-slate-700 font-medium">
                                            {typeof summary.details.budget ===
                                            "object"
                                              ? renderAIValue(
                                                  summary.details.budget,
                                                )
                                              : summary.details.budget}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Özel İstekler - tam genişlikte ve detaylı */}
                                    {summary.details.specifications && (
                                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FileText className="h-3.5 w-3.5 text-slate-500" />
                                          <span className="font-medium text-slate-700">
                                            Özel İstekler
                                          </span>
                                        </div>
                                        <div className="text-slate-600">
                                          {typeof summary.details
                                            .specifications === "object"
                                            ? renderAIValue(
                                                summary.details.specifications,
                                              )
                                            : summary.details.specifications}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* Key Points */}
                              {summary.keyPoints?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-slate-600 mb-1">
                                    Önemli Noktalar
                                  </h5>
                                  <ul className="text-xs text-slate-600 space-y-1">
                                    {summary.keyPoints.map((point, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-1"
                                      >
                                        <span className="text-green-500 mt-0.5">
                                          •
                                        </span>
                                        {typeof point === "object"
                                          ? JSON.stringify(point)
                                          : point}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Uncertainties */}
                              {summary.uncertainties?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-amber-600 mb-1">
                                    Netleştirilmesi Gerekenler
                                  </h5>
                                  <ul className="text-xs text-amber-700 space-y-1">
                                    {summary.uncertainties.map((item, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-1"
                                      >
                                        <span className="mt-0.5">⚠️</span>
                                        {typeof item === "object"
                                          ? JSON.stringify(item)
                                          : item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Suggested Actions */}
                              {summary.suggestedActions?.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-blue-600 mb-1">
                                    Önerilen Aksiyonlar
                                  </h5>
                                  <ul className="text-xs text-blue-700 space-y-1">
                                    {summary.suggestedActions.map(
                                      (action, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-1"
                                        >
                                          <span className="mt-0.5">→</span>
                                          {typeof action === "object"
                                            ? JSON.stringify(action)
                                            : action}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mevcut Açıklama */}
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Başlık</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="border-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Tür</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(v) =>
                          setEditForm({ ...editForm, type: v })
                        }
                      >
                        <SelectTrigger className="border-slate-200">
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
                      <Label className="text-slate-700">Öncelik</Label>
                      <Select
                        value={editForm.priority}
                        onValueChange={(v) =>
                          setEditForm({ ...editForm, priority: v })
                        }
                      >
                        <SelectTrigger className="border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PRIORITY).map((p) => (
                            <SelectItem key={p} value={p}>
                              {getPriorityLabel(p)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Açıklama</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="border-slate-200"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {/* Orijinal açıklama - sadece AI özeti yoksa veya açıklama varsa göster */}
                  {(caseData.description || !caseData.aiSummaries?.length) && (
                    <div>
                      {caseData.aiSummaries?.length > 0 && (
                        <h4 className="text-xs font-medium text-slate-500 mb-2">
                          Orijinal Açıklama
                        </h4>
                      )}
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {cleanEmailContent(caseData.description) ||
                          "Açıklama yok"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotes */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Teklifler
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openProformaModal}
                    className="border-slate-200"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Proforma Seç
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuoteModal(true)}
                    className="border-slate-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manuel Ekle
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!caseData.quotes || caseData.quotes.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Henüz teklif yok</p>
                  <p className="text-xs mt-1">
                    Proforma seçerek veya manuel olarak teklif ekleyebilirsiniz
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {caseData.quotes.map((quote, index) => (
                    <div
                      key={quote.id || index}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-semibold text-slate-900">
                              {formatCurrency(quote.amount, quote.currency)}
                            </span>
                            {quote.proformaNumber && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-50 text-blue-700"
                              >
                                <Receipt className="h-3 w-3 mr-1" />
                                {quote.proformaNumber}
                              </Badge>
                            )}
                            {quote.status && (
                              <Badge
                                className={cn(
                                  "text-xs",
                                  getQuoteStatusColor(quote.status),
                                )}
                              >
                                {getQuoteStatusLabel(quote.status)}
                              </Badge>
                            )}
                          </div>
                          {quote.description && (
                            <p className="text-sm text-slate-500 mt-1 whitespace-pre-line line-clamp-2">
                              {quote.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                            {quote.validUntil && (
                              <span>
                                Geçerlilik:{" "}
                                {(() => {
                                  try {
                                    const date =
                                      quote.validUntil?.toDate?.() ||
                                      (quote.validUntil instanceof Date
                                        ? quote.validUntil
                                        : new Date(quote.validUntil));
                                    return format(date, "dd MMM yyyy", {
                                      locale: tr,
                                    });
                                  } catch {
                                    return "-";
                                  }
                                })()}
                              </span>
                            )}
                            {quote.createdAt && (
                              <span>
                                {format(
                                  quote.createdAt?.toDate?.() ||
                                    new Date(quote.createdAt),
                                  "dd MMM yyyy",
                                  { locale: tr },
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {quote.proformaId && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/admin/proformas/${quote.proformaId}`}
                                title="Proformayı Görüntüle"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {quote.status !== "sent" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateQuoteStatus(quote, "sent")
                                  }
                                >
                                  <Send className="h-4 w-4 mr-2 text-blue-600" />
                                  Gönderildi İşaretle
                                </DropdownMenuItem>
                              )}
                              {quote.status !== "accepted" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateQuoteStatus(quote, "accepted")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                  Kabul Edildi İşaretle
                                </DropdownMenuItem>
                              )}
                              {quote.status !== "rejected" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateQuoteStatus(quote, "rejected")
                                  }
                                >
                                  <XOctagon className="h-4 w-4 mr-2 text-red-600" />
                                  Reddedildi İşaretle
                                </DropdownMenuItem>
                              )}
                              {quote.status !== "draft" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateQuoteStatus(quote, "draft")
                                  }
                                >
                                  <FileText className="h-4 w-4 mr-2 text-slate-600" />
                                  Taslak'a Döndür
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteQuote(quote.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Teklifi Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Durum Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!caseData.statusHistory ||
              caseData.statusHistory.length === 0 ? (
                <p className="text-sm text-slate-400">Durum değişikliği yok</p>
              ) : (
                <div className="space-y-3">
                  {caseData.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full flex-shrink-0",
                          getCaseStatusColor(history.status),
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-900">
                          {getCaseStatusLabel(history.status)}
                        </span>
                        {history.notes && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {history.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {history.changedAt &&
                          formatDistanceToNow(
                            history.changedAt?.toDate?.() ||
                              new Date(history.changedAt),
                            { addSuffix: true, locale: tr },
                          )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ek Bilgiler - Attachments & Notes */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-slate-400" />
                Ek Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dosyalar Bölümü */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <File className="h-4 w-4" />
                    Dosyalar
                    {caseData.attachments?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {caseData.attachments.length}
                      </Badge>
                    )}
                  </h4>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="h-7 px-2"
                    >
                      {uploadingFile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {!caseData.attachments || caseData.attachments.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg">
                    <File className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Henüz dosya yok</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="text-blue-600 h-auto p-0 mt-1"
                    >
                      Dosya Yükle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {caseData.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group"
                      >
                        {getFileIcon(attachment.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatFileSize(attachment.size)} •{" "}
                            {formatDistanceToNow(
                              attachment.uploadedAt?.toDate?.() ||
                                new Date(attachment.uploadedAt),
                              { addSuffix: true, locale: tr },
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              window.open(attachment.url, "_blank")
                            }
                          >
                            {attachment.type === "image" ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                            onClick={() =>
                              handleDeleteAttachment(attachment.id)
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="bg-slate-100" />

              {/* Notlar Bölümü */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Ekip Notları
                    {caseData.internalNotes?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {caseData.internalNotes.length}
                      </Badge>
                    )}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNoteModal(true)}
                    className="h-7 px-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {!caseData.internalNotes ||
                caseData.internalNotes.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg">
                    <StickyNote className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Henüz not yok</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowNoteModal(true)}
                      className="text-blue-600 h-auto p-0 mt-1"
                    >
                      Not Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {caseData.internalNotes.map((note) => (
                      <div
                        key={note.id}
                        className={cn(
                          "p-3 rounded-lg border group",
                          note.important
                            ? "bg-amber-50 border-amber-200"
                            : "bg-slate-50 border-slate-200",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap flex-1">
                            {note.content}
                          </p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                handleToggleNoteImportance(note.id)
                              }
                            >
                              {note.important ? (
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              ) : (
                                <StarOff className="h-3.5 w-3.5 text-slate-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <span>{note.createdByName}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(
                              note.createdAt?.toDate?.() ||
                                new Date(note.createdAt),
                              { addSuffix: true, locale: tr },
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* SLA Status Indicator */}
          {slaStatus && !isClosedStatus && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Timer className="h-4 w-4 text-slate-400" />
                  SLA Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "text-xs font-medium",
                        getSLAStatusColor(slaStatus.status),
                      )}
                    >
                      {slaStatus.status === "on_track" && "Yolunda"}
                      {slaStatus.status === "warning" && "Uyarı"}
                      {slaStatus.status === "overdue" && "Gecikmiş"}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {slaStatus.hoursElapsed}s / {slaStatus.maxDuration}s
                    </span>
                  </div>
                  <Progress
                    value={Math.min(slaStatus.percentUsed, 100)}
                    className="h-2"
                  />
                  {slaStatus.status === "warning" && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        SLA süresi dolmak üzere! ({slaStatus.hoursRemaining}s
                        kaldı)
                      </span>
                    </div>
                  )}
                  {slaStatus.status === "overdue" && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      <span>SLA süresi aşıldı!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checklist Card */}
          {checklistSettings?.phases?.length > 0 && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-slate-400" />
                    Kontrol Listesi
                  </CardTitle>
                  <span className="text-xs text-slate-500">
                    {checklistProgress.completed}/{checklistProgress.total}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <Progress
                    value={
                      checklistProgress.total > 0
                        ? (checklistProgress.completed /
                            checklistProgress.total) *
                          100
                        : 0
                    }
                    className="h-2"
                  />

                  {/* Phases */}
                  <div className="space-y-4">
                    {checklistSettings.phases.map((phase, phaseIndex) => {
                      // Get items for this phase from case data or initialize
                      const phaseItems = phase.items.map((item) => {
                        const caseItem = caseData?.checklist?.find(
                          (ci) => ci.id === item.id,
                        );
                        return {
                          ...item,
                          completed: caseItem?.completed || false,
                          completedAt: caseItem?.completedAt,
                          completedBy: caseItem?.completedBy,
                        };
                      });
                      const phaseCompleted = phaseItems.filter(
                        (i) => i.completed,
                      ).length;
                      const phaseTotal = phaseItems.length;

                      return (
                        <div key={phase.id || phaseIndex}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-medium text-slate-600">
                              {phase.name}
                            </h4>
                            <span className="text-xs text-slate-400">
                              {phaseCompleted}/{phaseTotal}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {phaseItems.map((item) => (
                              <div
                                key={item.id}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded hover:bg-slate-50 group cursor-pointer",
                                  item.completed && "bg-slate-50",
                                )}
                                onClick={() =>
                                  handleToggleChecklistItem(
                                    item.id,
                                    item.completed,
                                    item.label,
                                  )
                                }
                              >
                                <Checkbox
                                  checked={item.completed}
                                  disabled={updatingChecklist === item.id}
                                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                                <span
                                  className={cn(
                                    "text-sm flex-1",
                                    item.completed
                                      ? "text-slate-400 line-through"
                                      : "text-slate-700",
                                  )}
                                >
                                  {item.label}
                                  {item.required && !item.completed && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </span>
                                {updatingChecklist === item.id && (
                                  <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reminders Card */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" />
                  Hatırlatıcılar
                  {overdueReminders.length > 0 && (
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      {overdueReminders.length} gecikmiş
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReminderForm({
                      type: "follow_up",
                      dueDate: format(
                        addDays(new Date(), 1),
                        "yyyy-MM-dd'T'HH:mm",
                      ),
                      title: "",
                      description: "",
                    });
                    setShowReminderModal(true);
                  }}
                  className="h-7 px-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeReminders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Aktif hatırlatıcı yok
                </p>
              ) : (
                <div className="space-y-2">
                  {activeReminders.map((reminder) => {
                    const dueDate =
                      reminder.dueDate?.toDate?.() ||
                      new Date(reminder.dueDate);
                    const isOverdue = dueDate < new Date();
                    const isSnoozed = reminder.status === "snoozed";

                    return (
                      <div
                        key={reminder.id}
                        className={cn(
                          "p-2 rounded border",
                          isOverdue
                            ? "border-red-200 bg-red-50"
                            : isSnoozed
                              ? "border-amber-200 bg-amber-50"
                              : "border-slate-200 bg-slate-50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-medium truncate",
                                  isOverdue ? "text-red-700" : "text-slate-700",
                                )}
                              >
                                {reminder.title}
                              </span>
                              {isSnoozed && (
                                <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                                  Ertelendi
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarClock
                                className={cn(
                                  "h-3 w-3",
                                  isOverdue ? "text-red-500" : "text-slate-400",
                                )}
                              />
                              <span
                                className={cn(
                                  "text-xs",
                                  isOverdue ? "text-red-600" : "text-slate-500",
                                )}
                              >
                                {format(dueDate, "d MMM yyyy HH:mm", {
                                  locale: tr,
                                })}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCompleteReminder(reminder.id)
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Tamamla
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSnoozeReminder(reminder.id, 1)
                                }
                              >
                                <Clock className="h-4 w-4 mr-2 text-amber-600" />
                                1 Saat Ertele
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSnoozeReminder(reminder.id, 24)
                                }
                              >
                                <Clock className="h-4 w-4 mr-2 text-amber-600" />
                                1 Gün Ertele
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDismissReminder(reminder.id)
                                }
                              >
                                <BellOff className="h-4 w-4 mr-2 text-slate-500" />
                                Kapat
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteReminder(reminder.id)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financials */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" />
                Finansal Özet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Teklif Edilen</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(caseData.financials?.quotedValue)}
                </span>
              </div>
              <Separator className="bg-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Onaylanan</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(caseData.financials?.approvedValue)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Müşteri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {customer.name}
                      </h4>
                      {customer.company?.name && (
                        <p className="text-sm text-slate-500">
                          {customer.company.name}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="hover:bg-slate-100"
                    >
                      <Link href={`/admin/crm-v2/customers/${customer.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <Separator className="bg-slate-100" />
                  <div className="space-y-2">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Müşteri bilgisi yok</p>
              )}
            </CardContent>
          </Card>

          {/* Source Conversation with Messages */}
          {conversation && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                    İletişim Geçmişi
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-500 hover:text-slate-700"
                    onClick={() =>
                      router.push(`/admin/crm-v2/inbox/${conversation.id}`)
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Detay
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Channel Badge */}
                <Badge variant="outline" className="text-xs border-slate-200">
                  {getChannelLabel(conversation.channel)}
                </Badge>

                {/* Messages List */}
                <ScrollArea className="h-64 border border-slate-200 rounded-lg">
                  <div className="p-3 space-y-3">
                    {!conversation.messages ||
                    conversation.messages.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        Henüz mesaj yok
                      </div>
                    ) : (
                      conversation.messages.map((message, index) => {
                        const isOutbound = message.direction === "outbound";
                        return (
                          <div
                            key={message.id || index}
                            className={cn(
                              "flex",
                              isOutbound ? "justify-end" : "justify-start",
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                                isOutbound
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-800",
                              )}
                            >
                              <p className="whitespace-pre-wrap text-xs leading-relaxed">
                                {cleanEmailContent(message.content)}
                              </p>
                              <p
                                className={cn(
                                  "text-[10px] mt-1",
                                  isOutbound
                                    ? "text-blue-200"
                                    : "text-slate-400",
                                )}
                              >
                                {message.createdAt &&
                                  format(
                                    message.createdAt?.toDate?.() ||
                                      new Date(message.createdAt),
                                    "dd MMM HH:mm",
                                    { locale: tr },
                                  )}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Reply Box */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Mesaj yazın..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                    className="flex-1 resize-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleSendReply();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyContent.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Ctrl+Enter ile gönder
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {!isClosedStatus && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setTargetStatus(CASE_STATUS.WON);
                    setShowStatusModal(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Kazanıldı Olarak İşaretle
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setTargetStatus(CASE_STATUS.LOST);
                    setShowStatusModal(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Kaybedildi Olarak İşaretle
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Detaylar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Oluşturulma</span>
                <span className="text-slate-900">
                  {caseData.createdAt &&
                    format(
                      caseData.createdAt?.toDate?.() ||
                        new Date(caseData.createdAt),
                      "dd MMM yyyy HH:mm",
                      { locale: tr },
                    )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Son Güncelleme</span>
                <span className="text-slate-900">
                  {caseData.updatedAt &&
                    formatDistanceToNow(
                      caseData.updatedAt?.toDate?.() ||
                        new Date(caseData.updatedAt),
                      { addSuffix: true, locale: tr },
                    )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Change Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Durum Değiştir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Talep durumunu{" "}
              <strong>"{getCaseStatusLabel(targetStatus)}"</strong> olarak
              güncellemek istiyor musunuz?
            </p>
            <div className="space-y-2">
              <Label className="text-slate-700">Not (opsiyonel)</Label>
              <Textarea
                placeholder="Durum değişikliği hakkında not ekleyin..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                className="border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
              className="border-slate-200"
            >
              İptal
            </Button>
            <Button
              onClick={handleStatusChange}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quote Modal */}
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Yeni Teklif Ekle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Tutar</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quoteForm.amount}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, amount: e.target.value })
                  }
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Para Birimi</Label>
                <Select
                  value={quoteForm.currency}
                  onValueChange={(v) =>
                    setQuoteForm({ ...quoteForm, currency: v })
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY (₺)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Açıklama</Label>
              <Textarea
                placeholder="Teklif detayları..."
                value={quoteForm.description}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, description: e.target.value })
                }
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Geçerlilik Tarihi</Label>
              <Input
                type="date"
                value={quoteForm.validUntil}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, validUntil: e.target.value })
                }
                className="border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQuoteModal(false);
                setQuoteForm({
                  amount: "",
                  currency: "TRY",
                  description: "",
                  validUntil: "",
                });
              }}
              className="border-slate-200"
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveQuote}
              disabled={!quoteForm.amount}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proforma Selection Modal */}
      <Dialog open={showProformaModal} onOpenChange={setShowProformaModal}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Proforma Seç</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Proforma numarası veya firma adı ile ara..."
                value={proformaSearchTerm}
                onChange={(e) => setProformaSearchTerm(e.target.value)}
                className="pl-9 border-slate-200"
              />
            </div>

            {/* Proforma List */}
            <ScrollArea className="h-[400px] border border-slate-200 rounded-lg">
              {loadingProformas ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : filteredProformas.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Receipt className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Proforma bulunamadı</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredProformas.map((proforma) => {
                    const companyName =
                      proforma.customerInfo?.companyName ||
                      proforma.companyName ||
                      "-";
                    const contactPerson =
                      proforma.customerInfo?.contactPerson ||
                      proforma.contactPerson ||
                      "";
                    const phone = proforma.customerInfo?.phone || "";
                    const email = proforma.customerInfo?.email || "";

                    return (
                      <div
                        key={proforma.id}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-slate-50 transition-colors",
                          selectedProformaId === proforma.id &&
                            "bg-blue-50 border-l-2 border-l-blue-600",
                        )}
                        onClick={() => setSelectedProformaId(proforma.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-900 text-sm">
                                {proforma.proformaNumber}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {PROFORMA_STATUS_LABELS[proforma.status] ||
                                  proforma.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 mt-1 truncate">
                              {companyName}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              {contactPerson && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {contactPerson}
                                </span>
                              )}
                              {phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {phone}
                                </span>
                              )}
                              {email && (
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="h-3 w-3" />
                                  {email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-slate-900 text-sm">
                              {formatCurrency(
                                proforma.totalAmount,
                                proforma.currency,
                              )}
                            </p>
                            {proforma.createdAt && (
                              <p className="text-xs text-slate-400 mt-1">
                                {format(
                                  proforma.createdAt?.toDate?.() ||
                                    new Date(proforma.createdAt),
                                  "dd MMM yyyy",
                                  { locale: tr },
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowProformaModal(false);
                setSelectedProformaId(null);
              }}
              className="border-slate-200"
            >
              İptal
            </Button>
            <Button
              onClick={handleAddProformaAsQuote}
              disabled={!selectedProformaId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Teklif Olarak Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Modal */}
      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Hatırlatıcı Ekle
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Bu talep için bir hatırlatıcı oluşturun
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Tür</Label>
              <Select
                value={reminderForm.type}
                onValueChange={(v) =>
                  setReminderForm({ ...reminderForm, type: v })
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REMINDER_TYPE).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {getReminderTypeLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Başlık *</Label>
              <Input
                value={reminderForm.title}
                onChange={(e) =>
                  setReminderForm({ ...reminderForm, title: e.target.value })
                }
                placeholder="Hatırlatıcı başlığı"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Tarih & Saat *</Label>
              <Input
                type="datetime-local"
                value={reminderForm.dueDate}
                onChange={(e) =>
                  setReminderForm({ ...reminderForm, dueDate: e.target.value })
                }
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Açıklama</Label>
              <Textarea
                value={reminderForm.description}
                onChange={(e) =>
                  setReminderForm({
                    ...reminderForm,
                    description: e.target.value,
                  })
                }
                placeholder="İsteğe bağlı açıklama"
                className="border-slate-200 resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReminderModal(false);
                setReminderForm({
                  type: "follow_up",
                  dueDate: "",
                  title: "",
                  description: "",
                });
              }}
              className="border-slate-200"
            >
              İptal
            </Button>
            <Button
              onClick={handleAddReminder}
              disabled={
                !reminderForm.title || !reminderForm.dueDate || savingReminder
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {savingReminder ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checklist Uncheck Confirmation Modal */}
      <Dialog open={showUncheckConfirm} onOpenChange={setShowUncheckConfirm}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              İşareti Kaldır
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Bu adımın işaretini kaldırmak istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 font-medium">
                {pendingUncheckItem?.label}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Bu adım tekrar "yapılmadı" olarak işaretlenecek.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUncheckConfirm(false);
                setPendingUncheckItem(null);
              }}
              className="border-slate-200"
            >
              Vazgeç
            </Button>
            <Button
              onClick={handleConfirmUncheck}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Evet, Kaldır
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Case Modal (Super Admin Only) */}
      {isSuperAdmin && (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="bg-white border-slate-200 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Talebi Sil
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Bu işlem geri alınamaz. Talep ve ilişkili veriler kalıcı olarak
                silinecektir.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Silinecek Talep: {caseData?.title || "İsimsiz Talep"}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      #{caseData?.caseNumber}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-red-700 space-y-1 border-t border-red-200 pt-3">
                  <p>Bu işlemle birlikte:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Talep kalıcı olarak silinecek</li>
                    <li>Müşteri istatistikleri güncellenecek</li>
                    {caseData?.sourceConversationId && (
                      <li>Bağlı konuşma tekrar açık duruma geçecek</li>
                    )}
                    {caseData?.quotes?.length > 0 && (
                      <li>{caseData.quotes.length} teklif silinecek</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="border-slate-200"
              >
                Vazgeç
              </Button>
              <Button
                onClick={handleDeleteCase}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Evet, Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-slate-500" />
              Not Ekle
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Bu talep için ekip notu ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Not İçeriği *</Label>
              <Textarea
                value={noteForm.content}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, content: e.target.value })
                }
                placeholder="Notunuzu buraya yazın..."
                className="border-slate-200 resize-none"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="important"
                checked={noteForm.important}
                onCheckedChange={(checked) =>
                  setNoteForm({ ...noteForm, important: checked })
                }
              />
              <Label
                htmlFor="important"
                className="text-sm text-slate-600 cursor-pointer"
              >
                Önemli olarak işaretle
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNoteModal(false);
                setNoteForm({ content: "", important: false });
              }}
              className="border-slate-200"
            >
              İptal
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!noteForm.content.trim() || savingNote}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {savingNote ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Settings Modal - Reusable Component */}
      <AISettingsModal
        open={showAiSettingsModal}
        onOpenChange={setShowAiSettingsModal}
        title="AI Özet Ayarları"
        description="Model, prompt ve token ayarları"
        contextKey={AI_CONTEXTS.CRM_CASE_SUMMARY}
        availableModels={availableModels}
        currentModel={selectedModel}
        currentProvider={{ id: selectedModel?.provider }}
        selectModel={selectModel}
        prompt={aiPrompt}
        config={aiConfig}
        promptVariables={currentPromptVariables}
        loading={aiConfigLoading}
        modelSettings={modelSettings}
        setModelSettings={setModelSettings}
      />
    </div>
  );
}
