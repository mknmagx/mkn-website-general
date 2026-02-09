"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
// Unified AI Hook - mevcut AI altyapısı
import { useUnifiedAI, AI_CONTEXTS, getAIErrorTitle, getAIErrorMessage } from "../../../../../hooks/use-unified-ai";
// HTML to Text utility - Mesaj temizleme
import {
  cleanTextForAI,
  cleanEmailContent,
} from "../../../../../utils/html-to-text";
import {
  getConversationWithMessages,
  addMessage,
  markConversationAsRead,
  closeConversation,
  snoozeConversation,
  assignConversation,
  updateMessageStatus,
  approveAndSendMessage,
  updateMessageContent,
  deleteMessage,
} from "../../../../../lib/services/crm-v2/conversation-service";
import { getCustomer } from "../../../../../lib/services/crm-v2/customer-service";
import {
  createCaseFromConversation,
  getCaseByConversationId,
} from "../../../../../lib/services/crm-v2/case-service";
// WhatsApp Sync Service - 24 saat kuralı ve mesaj gönderme
import {
  checkServiceWindow,
  sendWhatsAppFromCRM,
  formatPhoneForWhatsApp,
  validateWhatsAppPhone,
} from "../../../../../lib/services/crm-v2/whatsapp-sync-service";
// AI Reply constants (browser-safe)
import {
  REPLY_TONE,
  REPLY_TONE_LABELS,
  replacePromptVariables,
  formatConversationHistory,
} from "../../../../../lib/services/crm-v2/ai-reply-constants";
import {
  CHANNEL,
  CONVERSATION_STATUS,
  CASE_TYPE,
  PRIORITY,
  MESSAGE_STATUS,
  REPLY_CHANNEL,
  REPLY_STATUS,
  getConversationStatusLabel,
  getConversationStatusColor,
  getChannelLabel,
  getChannelColor,
  getChannelIcon,
  getCaseTypeLabel,
  getPriorityLabel,
  getMessageStatusLabel,
  getMessageStatusColor,
  getReplyStatusLabel,
  getReplyStatusColor,
  getReplyStatusDot,
  getReplyStatusIcon,
} from "../../../../../lib/services/crm-v2/schema";
// Local Settings (localStorage-based file upload limits)
import {
  getMaxFileSizeBytes,
  getMaxFileSizeMB,
  validateFileSize,
  needsLargeUploadConfirmation,
  formatFileSize,
} from "../../../../../lib/services/crm-v2/local-settings-service";
import { formatDistanceToNow, format, addDays, addHours } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../../lib/utils";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import { uploadFile } from "../../../../../lib/storage";
import { PROFORMA_STATUS_LABELS } from "../../../../../lib/services/proforma-service";
import * as PricingService from "../../../../../lib/services/pricing-service";

// UI Components
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { Textarea } from "../../../../../components/ui/textarea";
import { Label } from "../../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { Separator } from "../../../../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../../../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import { Switch } from "../../../../../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../../components/ui/tooltip";

// AI Constants
import { PROVIDER_INFO } from "../../../../../lib/ai-constants";

// AI Settings Modal
import AISettingsModal from "../../../../../components/admin/ai-settings-modal";

// Icons
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MoreHorizontal,
  Send,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  User,
  MessageSquare,
  MessageSquarePlus,
  MessageCircle,
  Briefcase,
  ExternalLink,
  Archive,
  AlarmClock,
  UserPlus,
  Tag,
  Reply,
  Forward,
  Trash2,
  Star,
  Flag,
  X,
  Sparkles,
  Loader2,
  Save,
  Edit,
  FileText,
  CheckCircle,
  Settings,
  Sliders,
  Eye,
  Copy,
  Info,
  Zap,
  Brain,
  RefreshCw,
  Paperclip,
  Upload,
  File as FileIcon,
  Receipt,
  Calculator,
  Link2,
  FolderOpen,
  XCircle,
  PenLine,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Image as ImageIcon,
  Film,
  Music,
  Download,
} from "lucide-react";

// WhatsApp Media Upload Dialog
import MediaUploadDialog from "../../../../../components/whatsapp-media-upload-dialog";

/**
 * Kanal ikonunu döndür
 * Schema'daki getChannelIcon fonksiyonundan gelen string'i gerçek React icon'a çevirir
 */
const CHANNEL_ICON_MAP = {
  MessageSquare: MessageSquare,
  FileText: FileText,
  Mail: Mail,
  Phone: Phone,
  MessageCircle: MessageCircle,
  Instagram: Instagram,
  Facebook: Facebook,
  Linkedin: Linkedin,
  Twitter: Twitter,
  PenLine: PenLine,
};

const getChannelIconComponent = (channel, className = "h-3 w-3") => {
  const iconName = getChannelIcon(channel);
  const IconComponent = CHANNEL_ICON_MAP[iconName] || MessageSquare;
  return <IconComponent className={className} />;
};

/**
 * Mesajın kanal rengini al (badge için daha açık tonlar)
 */
const getMessageChannelColor = (channel) => {
  const colors = {
    [CHANNEL.EMAIL]: 'bg-sky-50 text-sky-600 border-sky-200',
    [CHANNEL.WHATSAPP]: 'bg-green-50 text-green-600 border-green-200',
    [CHANNEL.CONTACT_FORM]: 'bg-blue-50 text-blue-600 border-blue-200',
    [CHANNEL.QUOTE_FORM]: 'bg-purple-50 text-purple-600 border-purple-200',
    [CHANNEL.PHONE]: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    [CHANNEL.SOCIAL_INSTAGRAM]: 'bg-pink-50 text-pink-600 border-pink-200',
    [CHANNEL.SOCIAL_FACEBOOK]: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    [CHANNEL.SOCIAL_LINKEDIN]: 'bg-blue-50 text-blue-600 border-blue-200',
    [CHANNEL.SOCIAL_TWITTER]: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    [CHANNEL.MANUAL]: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  return colors[channel] || 'bg-slate-50 text-slate-500 border-slate-200';
};

/**
 * HTML içeriğini sanitize et (cid: referansları ve tehlikeli içerik)
 */
const sanitizeEmailHtml = (html) => {
  if (!html) return "";

  let sanitized = html;

  // cid: referanslarını placeholder görsel ile değiştir
  sanitized = sanitized.replace(
    /<img[^>]*src=["']cid:[^"']*["'][^>]*>/gi,
    '<span class="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">[Gömülü Görsel]</span>',
  );

  // Boş src'li görselleri temizle
  sanitized = sanitized.replace(/<img[^>]*src=["']["'][^>]*>/gi, "");

  // Script ve style taglarını tamamen kaldır
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Event handler'ları temizle
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");

  return sanitized;
};

/**
 * HTML içeriğinden düz metin çıkar (preview için)
 * html-to-text utility'sini kullanır
 */
const stripHtmlToText = (html) => {
  if (!html) return "";
  return cleanEmailContent(html);
};

/**
 * İçeriğin HTML olup olmadığını kontrol et
 */
const isHtmlContent = (content) => {
  if (!content) return false;
  // Daha güçlü HTML detection
  return (
    /<[a-z][\s\S]*>/i.test(content) ||
    /&[a-z]+;/i.test(content) ||
    /&#\d+;/.test(content)
  );
};

/**
 * Güvenli tarih parse - Invalid time value hatalarını önler
 * Firestore Timestamp, serialized timestamp, string veya number tarihleri destekler
 */
const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // Firestore Timestamp (toDate metodu var)
    if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // Serialized Firestore Timestamp (seconds property)
    if (dateValue?.seconds) {
      return new Date(dateValue.seconds * 1000);
    }
    
    // Serialized Firestore Timestamp (_seconds property)
    if (dateValue?._seconds) {
      return new Date(dateValue._seconds * 1000);
    }
    
    // String veya number
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  } catch (e) {
    console.warn('Date parsing error:', dateValue);
    return null;
  }
};

/**
 * Güvenli tarih formatlama
 */
const safeFormatDate = (dateValue, formatString = "dd MMM yyyy HH:mm") => {
  const date = safeParseDate(dateValue);
  if (!date) return "";
  
  try {
    return format(date, formatString, { locale: tr });
  } catch (e) {
    console.warn('Date format error:', dateValue);
    return "";
  }
};

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const conversationId = params.id;

  // Unified AI Hook - CRM Email Reply context (Firestore'dan dinamik config)
  const {
    generateContent: generateAIContent,
    loading: aiLoading,
    config: unifiedConfig,
    prompt: firestorePrompt,
    availableModels,
    selectedModel: currentModel,
    currentProvider,
    selectModel,
    refresh: refreshAIConfig,
    configLoading,
    isReady: aiReady,
  } = useUnifiedAI(AI_CONTEXTS.CRM_EMAIL_REPLY);

  // Unified AI Hook - CRM Case Summary (Quick Summary için)
  const {
    config: summaryConfig,
    prompt: summaryPrompt,
    availableModels: summaryAvailableModels,
    selectedModel: summaryCurrentModel,
    currentProvider: summaryCurrentProvider,
    selectModel: selectSummaryModel,
    refresh: refreshSummaryConfig,
    configLoading: summaryConfigLoading,
    loadPromptForCategory: loadSummaryPromptForCategory,
  } = useUnifiedAI(AI_CONTEXTS.CRM_CASE_SUMMARY);

  // Quick prompt için state
  const [quickPromptData, setQuickPromptData] = useState(null);

  // State
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [linkedCase, setLinkedCase] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);

  // AI Reply State
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiTone, setAiTone] = useState(REPLY_TONE.PROFESSIONAL);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [aiMetadata, setAiMetadata] = useState(null);

  // Draft mesaj state
  const [draftMessage, setDraftMessage] = useState(null);
  const [editingDraft, setEditingDraft] = useState(false);

  // AI Settings Dialog State
  const [showAISettingsModal, setShowAISettingsModal] = useState(false);
  const [aiSettingsTab, setAISettingsTab] = useState("config");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showFilledPrompt, setShowFilledPrompt] = useState(true); // Değişkenlerle dolu prompt göster
  const [showVariablesPanel, setShowVariablesPanel] = useState(false); // Değişkenler paneli
  const [modelSettings, setModelSettings] = useState({
    maxTokens: 2048,
    autoMaxTokens: true,
    temperature: 0.7,
  });

  // Attachment States (Dosya Ekleme)
  const [attachments, setAttachments] = useState([]); // Eklenecek dosyalar
  const [showDocumentPicker, setShowDocumentPicker] = useState(false); // Belge seçici modal
  const [addingDocumentId, setAddingDocumentId] = useState(null); // Hangi belge ekleniyor
  const [showCalcOptionsModal, setShowCalcOptionsModal] = useState(false); // Hesaplama PDF ayarları modalı
  const [pendingCalculation, setPendingCalculation] = useState(null); // Eklenecek hesaplama
  const [calcShowCostDetails, setCalcShowCostDetails] = useState(false); // Maliyet detayları gösterilsin mi
  const [linkedDocuments, setLinkedDocuments] = useState({ // Müşteriye bağlı belgeler
    proformas: [],
    contracts: [],
    calculations: [],
  });
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [linkedCompany, setLinkedCompany] = useState(null);
  const fileInputRef = useRef(null);

  // Modals
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showQuickReplyModal, setShowQuickReplyModal] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [pendingSendMessageId, setPendingSendMessageId] = useState(null);
  const [sendChannels, setSendChannels] = useState({
    email: true, // Outlook Email - varsayılan aktif
    whatsapp: false, // WhatsApp
    manual: false, // Sadece CRM'e kaydet
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // WhatsApp 24 saat kuralı state'leri
  const [whatsappWindowStatus, setWhatsappWindowStatus] = useState(null);
  const [showWhatsAppMediaUpload, setShowWhatsAppMediaUpload] = useState(false);
  const [checkingWhatsappWindow, setCheckingWhatsappWindow] = useState(false);
  const [whatsappTemplates, setWhatsappTemplates] = useState([]);
  const [selectedWhatsappTemplate, setSelectedWhatsappTemplate] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  // WhatsApp telefon düzenleme
  const [editableWhatsappPhone, setEditableWhatsappPhone] = useState('');
  const [whatsappPhoneError, setWhatsappPhoneError] = useState(null);
  
  // WhatsApp Şablon Direkt Gönderim Modal State
  const [showWhatsAppTemplateModal, setShowWhatsAppTemplateModal] = useState(false);
  const [directTemplatePhone, setDirectTemplatePhone] = useState('');
  const [directTemplatePhoneError, setDirectTemplatePhoneError] = useState(null);
  const [directSelectedTemplate, setDirectSelectedTemplate] = useState(null);
  const [directTemplates, setDirectTemplates] = useState([]);
  const [loadingDirectTemplates, setLoadingDirectTemplates] = useState(false);
  const [sendingDirectTemplate, setSendingDirectTemplate] = useState(false);
  
  // WhatsApp Şablon Değişkenleri (Her iki modal için)
  const [templateVariables, setTemplateVariables] = useState({ header: "", body: [] });
  const [directTemplateVariables, setDirectTemplateVariables] = useState({ header: "", body: [] });
  
  // ==========================================
  // WHATSAPP TEMPLATE HELPER FUNCTIONS
  // ==========================================
  
  // Şablondaki değişkenleri çıkar
  const getTemplateVariables = useCallback((template) => {
    const vars = { header: null, body: [] };
    const regex = /\{\{(\d+)\}\}/g;
    
    for (const component of template?.components || []) {
      if (component.type === 'HEADER' && component.format === 'TEXT') {
        const matches = component.text?.match(regex);
        if (matches) vars.header = true;
      }
      if (component.type === 'BODY' && component.text) {
        const matches = [...component.text.matchAll(regex)];
        vars.body = matches.map((m) => parseInt(m[1]));
      }
    }
    
    return vars;
  }, []);
  
  // Değişken önerileri (context'e göre)
  const getVariableSuggestions = useCallback((template, varNum, idx) => {
    const suggestions = [];
    const templateName = template?.name?.toLowerCase() || "";
    const bodyText = template?.components?.find(c => c.type === "BODY")?.text?.toLowerCase() || "";
    
    // İlk değişken genellikle müşteri adı
    if (varNum === 1 || idx === 0) {
      if (bodyText.includes("merhaba") || bodyText.includes("sayın")) {
        suggestions.push({ key: "customerName", label: "Müşteri Adı" });
      }
    }
    
    // İkinci değişken kalıpları
    if (varNum === 2 || idx === 1) {
      if (templateName.includes("talep") || bodyText.includes("talep") || bodyText.includes("konulu")) {
        suggestions.push({ key: "requestTitle", label: "Talep Başlığı" });
      }
      if (templateName.includes("teklif") || bodyText.includes("teklif")) {
        suggestions.push({ key: "offerTitle", label: "Teklif Başlığı" });
      }
      if (bodyText.includes("fiyat") || bodyText.includes("tutar")) {
        suggestions.push({ key: "amount", label: "Tutar" });
      }
    }
    
    return suggestions;
  }, []);
  
  // Canlı önizleme oluştur
  const getLivePreview = useCallback((template, vars) => {
    if (!template) return "";
    
    let preview = "";
    for (const comp of template.components || []) {
      if (comp.type === "HEADER" && comp.format === "TEXT") {
        let headerText = comp.text || "";
        if (vars?.header) {
          headerText = headerText.replace(/\{\{1\}\}/g, vars.header);
        }
        preview += `*${headerText}*\n\n`;
      }
      if (comp.type === "BODY") {
        let bodyText = comp.text || "";
        const templateVars = getTemplateVariables(template);
        templateVars.body.forEach((varNum, idx) => {
          const value = vars?.body?.[idx] || `{{${varNum}}}`;
          bodyText = bodyText.replace(new RegExp(`\\{\\{${varNum}\\}\\}`, 'g'), value);
        });
        preview += bodyText;
      }
      if (comp.type === "FOOTER") {
        preview += `\n\n_${comp.text || ""}_`;
      }
    }
    return preview;
  }, [getTemplateVariables]);
  
  // API için component parametreleri oluştur
  const buildTemplateComponents = useCallback((template, vars) => {
    const components = [];
    
    for (const component of template?.components || []) {
      if (component.type === "HEADER" && vars?.header) {
        if (component.format === "TEXT") {
          components.push({
            type: "header",
            parameters: [{ type: "text", text: vars.header }],
          });
        }
      }
      
      if (component.type === "BODY" && vars?.body?.length > 0) {
        components.push({
          type: "body",
          parameters: vars.body.map((v) => ({ type: "text", text: v || "" })),
        });
      }
    }
    
    return components;
  }, []);
  
  // Şablon seçildiğinde değişkenleri otomatik doldur
  const autoFillTemplateVariables = useCallback((template, setVars) => {
    const templateVars = getTemplateVariables(template);
    const customerName = customer?.name || conversation?.sender?.name || "";
    const subject = conversation?.subject || "";
    
    const autoFilledBody = templateVars.body.map((varNum, idx) => {
      const suggestions = getVariableSuggestions(template, varNum, idx);
      
      // İlk değişken genellikle müşteri adı
      if (idx === 0 && customerName) {
        return customerName;
      }
      
      // İkinci değişken için konu başlığı
      if (idx === 1 && subject) {
        return subject;
      }
      
      return "";
    });
    
    setVars({ header: "", body: autoFilledBody });
  }, [customer, conversation, getTemplateVariables, getVariableSuggestions]);
  
  const [convertForm, setConvertForm] = useState({
    title: "",
    type: CASE_TYPE.OTHER,
    priority: PRIORITY.NORMAL,
  });

  // AI Summary State (Sidebar için hızlı özet)
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [showSummarySettingsModal, setShowSummarySettingsModal] =
    useState(false);
  const [summaryModelSettings, setSummaryModelSettings] = useState({
    maxTokens: 1500,
    autoMaxTokens: true,
    temperature: 0.2,
  });

  // Firestore config yüklendiğinde summaryModelSettings'i güncelle
  useEffect(() => {
    if (summaryConfig?.settings) {
      setSummaryModelSettings(prev => ({
        ...prev,
        maxTokens: summaryConfig.settings.maxTokens || prev.maxTokens,
        temperature: summaryConfig.settings.temperature ?? prev.temperature,
      }));
    }
  }, [summaryConfig]);

  // Modal açıldığında quick prompt'u yükle
  useEffect(() => {
    const loadQuickPrompt = async () => {
      if (
        showSummarySettingsModal &&
        loadSummaryPromptForCategory &&
        !quickPromptData
      ) {
        const promptData = await loadSummaryPromptForCategory("quick");
        if (promptData) {
          setQuickPromptData(promptData);
        }
      }
    };
    loadQuickPrompt();
  }, [showSummarySettingsModal, loadSummaryPromptForCategory, quickPromptData]);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const convData = await getConversationWithMessages(conversationId);

      if (!convData) {
        toast({
          title: "Hata",
          description: "Konuşma bulunamadı.",
          variant: "destructive",
        });
        router.push("/admin/crm-v2/inbox");
        return;
      }

      setConversation(convData);

      // Mark as read (only for non-legacy)
      if (
        !convData.isLegacy &&
        convData.status === CONVERSATION_STATUS.UNREAD
      ) {
        await markConversationAsRead(conversationId);
      }

      // Set convert form title from subject
      setConvertForm((prev) => ({
        ...prev,
        title: convData.subject || "",
      }));

      // Load customer if exists
      if (convData.customerId) {
        const customerData = await getCustomer(convData.customerId);
        setCustomer(customerData);
      }

      // Check if there's a linked case (for legacy or normal conversations)
      // First check linkedCaseId, then search by conversationId
      if (convData.linkedCaseId) {
        setLinkedCase({ id: convData.linkedCaseId });
      } else {
        // Search for case by this conversation ID
        const existingCase = await getCaseByConversationId(conversationId);
        if (existingCase) {
          setLinkedCase(existingCase);
        }
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, router, toast, user?.uid]);

  // Load linked documents from Company (for attachment picker)
  const loadLinkedDocuments = useCallback(async (companyId) => {
    if (!companyId) {
      setLinkedDocuments({ proformas: [], contracts: [], calculations: [] });
      setLinkedCompany(null);
      return;
    }

    try {
      setDocumentsLoading(true);

      // Load Company info
      const companyDoc = await getDoc(doc(db, "companies", companyId));
      if (companyDoc.exists()) {
        setLinkedCompany({ id: companyDoc.id, ...companyDoc.data() });
      }

      // Load Proformas
      let proformas = [];
      try {
        const proformasQuery = query(
          collection(db, "proformas"),
          where("companyId", "==", companyId),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const proformasSnapshot = await getDocs(proformasQuery);
        proformas = proformasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error loading proformas:", error);
      }

      // Load Contracts
      let contracts = [];
      try {
        const contractsQuery = query(
          collection(db, "contracts"),
          where("companyId", "==", companyId),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const contractsSnapshot = await getDocs(contractsQuery);
        contracts = contractsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error loading contracts:", error);
      }

      // Load Calculations - İKİ KAYNAKTAN:
      // 1. pricingCalculations koleksiyonunda linkedCompanies içinde companyId olanlar
      // 2. companies koleksiyonundaki pricingCalculations array'i
      let calculations = [];
      try {
        const allCalcs = await PricingService.getPricingCalculations();
        
        // Kaynak 1: linkedCompanies içinde companyId olanlar
        const linkedFromCalcCollection = allCalcs.filter(
          (calc) => calc.linkedCompanies && calc.linkedCompanies.includes(companyId)
        );
        
        // Kaynak 2: Firma dokümanındaki pricingCalculations array'i
        const companyDocRef = await getDoc(doc(db, "companies", companyId));
        let linkedFromCompanyDoc = [];
        if (companyDocRef.exists()) {
          const companyData = companyDocRef.data();
          const companyCalcIds = (companyData.pricingCalculations || []).map(c => c.calculationId || c.id);
          linkedFromCompanyDoc = allCalcs.filter(calc => companyCalcIds.includes(calc.id));
        }
        
        // İki kaynağı birleştir (duplicate'leri kaldır)
        calculations = [...linkedFromCalcCollection];
        for (const calc of linkedFromCompanyDoc) {
          if (!calculations.some(c => c.id === calc.id)) {
            calculations.push(calc);
          }
        }
      } catch (error) {
        console.error("Error loading calculations:", error);
      }

      setLinkedDocuments({ proformas, contracts, calculations });
    } catch (error) {
      console.error("Error loading linked documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  // Load linked documents when customer changes
  useEffect(() => {
    if (customer?.linkedCompanyId) {
      loadLinkedDocuments(customer.linkedCompanyId);
    }
  }, [customer?.linkedCompanyId, loadLinkedDocuments]);

  // Track previous message count to detect NEW messages only
  const prevMessageCount = useRef(0);

  // ConversationId değişince sync flag'ini sıfırla
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior = "smooth") => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);
  }, []);

  // Scroll to bottom on initial page load (when data is loaded)
  useEffect(() => {
    if (!loading && conversation?.messages?.length > 0) {
      // Use instant scroll for initial load
      scrollToBottom("instant");
    }
  }, [loading, conversation?.messages?.length, scrollToBottom]);

  // Scroll to bottom when a NEW message is added
  useEffect(() => {
    const currentCount = conversation?.messages?.length || 0;

    // Only scroll if message count increased (new message added)
    if (
      prevMessageCount.current > 0 &&
      currentCount > prevMessageCount.current
    ) {
      scrollToBottom("smooth");
    }

    prevMessageCount.current = currentCount;
  }, [conversation?.messages?.length, scrollToBottom]);

  // Copy prompt to clipboard
  const handleCopyPrompt = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Get tone descriptions from Firestore config or use defaults
  const getToneDescription = (tone) => {
    const defaultDescriptions = {
      professional: "Profesyonel ve resmi",
      friendly: "Samimi ama profesyonel",
      formal: "Çok resmi, kurumsal",
      concise: "Kısa ve öz",
    };

    const toneOption = unifiedConfig?.toneOptions?.[tone];

    // toneOption object ise (label, promptSuffix) label'i kullan
    if (toneOption && typeof toneOption === "object") {
      return (
        toneOption.label ||
        toneOption.promptSuffix ||
        defaultDescriptions[tone] ||
        defaultDescriptions.professional
      );
    }

    // string ise direkt kullan
    if (typeof toneOption === "string") {
      return toneOption;
    }

    return defaultDescriptions[tone] || defaultDescriptions.professional;
  };

  // Get tone label for display
  const getToneLabel = (tone) => {
    const toneOption = unifiedConfig?.toneOptions?.[tone];

    if (toneOption && typeof toneOption === "object" && toneOption.label) {
      return toneOption.label;
    }

    // Fallback to constants
    return REPLY_TONE_LABELS[tone] || tone;
  };

  // Calculate effective maxTokens
  const getEffectiveMaxTokens = () => {
    if (modelSettings.autoMaxTokens) {
      return unifiedConfig?.settings?.maxTokens || 2048;
    }
    return modelSettings.maxTokens;
  };

  // Get effective temperature
  const getEffectiveTemperature = () => {
    return (
      modelSettings.temperature ?? unifiedConfig?.settings?.temperature ?? 0.7
    );
  };

  // Modal'da gösterilecek prompt değişkenleri (useMemo ile hesapla)
  const currentPromptVariables = useMemo(() => {
    // Son müşteri mesajını bul
    const lastCustomerMessage = conversation?.messages
      ? [...conversation.messages]
          .reverse()
          .find((m) => m.direction === "inbound")
      : null;

    const customerName =
      customer?.name || conversation?.from?.name || "Değerli Müşterimiz";
    const customerCompany =
      customer?.companyName || conversation?.from?.company || "";
    const customerEmail = customer?.email || conversation?.sender?.email || "";
    const agentName =
      user?.displayName || user?.email?.split("@")[0] || "MKN Group";
    const toneDescription = getToneDescription(aiTone);
    const conversationHistory = formatConversationHistory(
      conversation?.messages || [],
      10,
    );

    return {
      // HTML'den temizlenmiş müşteri mesajı
      customer_message: lastCustomerMessage?.content
        ? cleanTextForAI(lastCustomerMessage.content, 1500)
        : "(Müşteri mesajı yok)",
      conversation_history: conversationHistory || "(Konuşma geçmişi yok)",
      customer_name: customerName,
      customer_company: customerCompany,
      customer_email: customerEmail,
      agent_name: agentName,
      tone: aiTone,
      tone_description: toneDescription,
      subject: conversation?.subject || "Konu belirtilmemiş",
      channel: conversation?.channel || "email",
      user_instruction: replyContent.trim() || "",
    };
  }, [conversation, customer, user, aiTone, replyContent, unifiedConfig]);

  // AI ile yanıt oluştur (useUnifiedAI hook kullanarak - Firestore'dan dinamik config)
  // HİBRİT PROMPT SİSTEMİ: İlk mesaj için karşılama, devam için kısa yanıt
  const handleGenerateAIReply = async () => {
    if (!conversation?.messages?.length) return;

    // Son müşteri mesajını bul
    const lastCustomerMessage = [...conversation.messages]
      .reverse()
      .find((m) => m.direction === "inbound");

    if (!lastCustomerMessage) {
      toast({
        title: "Hata",
        description: "Yanıtlanacak müşteri mesajı bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingAI(true);
    try {
      // Konuşma geçmişini formatla (helper fonksiyon kullan)
      const conversationHistory = formatConversationHistory(
        conversation.messages,
        10,
      );

      const customerName =
        customer?.name || conversation.from?.name || "Değerli Müşterimiz";
      const customerCompany =
        customer?.companyName || conversation.from?.company || "";
      const customerEmail = customer?.email || conversation.sender?.email || "";
      const agentName =
        user?.displayName || user?.email?.split("@")[0] || "MKN Group";

      // Firestore'dan gelen config'deki tone options'ı kullan
      const toneDescription = getToneDescription(aiTone);

      // HİBRİT PROMPT SEÇİMİ:
      // - İlk mesaj (messageCount <= 1): crm_communication (karşılama promptu)
      // - Devam mesajları (messageCount > 1): crm_communication_continuation (kısa yanıt)
      const messageCount = conversation.messages?.length || 0;
      const isFirstMessage = messageCount <= 1;
      const promptContextKey = isFirstMessage
        ? "crm_communication"
        : "crm_communication_continuation";

      console.log(
        `[AI Reply] Mesaj sayısı: ${messageCount}, Prompt: ${promptContextKey}`,
      );

      // Mesaj kutusundaki içerik varsa, AI'ya talimat olarak gönder
      const userInstruction = replyContent.trim();

      // Prompt değişkenleri - Müşteri mesajını temizle
      const promptVariables = {
        customer_message: cleanTextForAI(lastCustomerMessage.content, 1500),
        conversation_history: conversationHistory,
        customer_name: customerName,
        customer_company: customerCompany,
        customer_email: customerEmail,
        agent_name: agentName,
        tone: aiTone,
        tone_description: toneDescription,
        subject: conversation.subject || "Konu belirtilmemiş",
        channel: conversation.channel || "email",
        // Kullanıcının mesaj kutusundan ek talimatı (varsa)
        user_instruction: userInstruction,
      };

      // API'ye doğrudan istek at (hibrit prompt seçimi için)
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          contextKey: promptContextKey,
          promptVariables,
          options: {
            temperature: getEffectiveTemperature(),
            maxTokens: getEffectiveMaxTokens(),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setReplyContent(result.content);
        setIsAiGenerated(true);
        setAiMetadata({
          model: result.model,
          apiModel: result.apiModel,
          provider: result.provider,
          tone: aiTone,
          temperature: getEffectiveTemperature(),
          maxTokens: getEffectiveMaxTokens(),
          generatedAt: new Date().toISOString(),
          aiMetadata: result.aiMetadata,
          promptType: isFirstMessage ? "first_message" : "continuation",
        });
        toast({
          title: "AI Yanıt Oluşturuldu",
          description: `${result.model} ile ${isFirstMessage ? "karşılama" : "devam"} yanıtı oluşturuldu.`,
        });
      } else {
        throw new Error(result.error || "Yanıt oluşturulamadı");
      }
    } catch (error) {
      console.error("AI reply generation error:", error);
      toast({
        title: "AI Hatası",
        description: error.message || "Yanıt oluşturulamadı.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  // Taslak olarak kaydet (gönderilmedi)
  const handleSaveAsDraft = async () => {
    if (!replyContent.trim()) return;

    setSending(true);
    try {
      const messageData = {
        content: replyContent,
        direction: "outbound",
        status: MESSAGE_STATUS.DRAFT,
        channel: CHANNEL.MANUAL, // Kanal bilgisi - başlangıçta manuel, gönderimde değişecek
        replyChannel: REPLY_CHANNEL.MANUAL,
        sender: {
          name: user?.displayName || user?.email || "Admin",
          email: user?.email,
        },
      };

      // AI metadata varsa ekle
      if (isAiGenerated && aiMetadata) {
        messageData.aiGenerated = true;
        messageData.aiModel = aiMetadata.model;
        messageData.aiMetadata = aiMetadata;
      }

      // Ekleri ekle
      if (attachments.length > 0) {
        messageData.attachments = attachments.map(att => ({
          type: att.type,
          name: att.name,
          size: att.size || null,
          documentId: att.documentId || null,
          documentType: att.documentType || null,
          url: att.url || null,
        }));
      }

      const newMessage = await addMessage(conversationId, messageData);

      setReplyContent("");
      setIsAiGenerated(false);
      setAiMetadata(null);
      setAttachments([]);
      setDraftMessage(newMessage);

      toast({
        title: "Taslak Kaydedildi",
        description: "Mesaj taslak olarak kaydedildi. Onaylayarak gönderin.",
      });
      loadData();
    } catch (error) {
      console.error("Save draft error:", error);
      toast({
        title: "Hata",
        description: "Taslak kaydedilemedi.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Gönderim modalını aç - WhatsApp için 24 saat kuralını kontrol et
  const handleOpenSendModal = async (messageId) => {
    setPendingSendMessageId(messageId);
    
    // Müşteri email'i varsa email varsayılan olsun
    const hasEmail = conversation?.sender?.email;
    const hasPhone = conversation?.sender?.phone;
    // WhatsApp iletişimi başlamışsa (kanal veya metadata kontrolu)
    const isWhatsAppChannel = conversation?.channel === 'whatsapp';
    const hasWhatsAppData = conversation?.channelMetadata?.waId || conversation?.channelMetadata?.whatsappConversationId;
    const isWhatsAppEnabled = isWhatsAppChannel || hasWhatsAppData;
    
    // Telefon numarasını düzenlenebilir alana set et
    if (hasPhone) {
      const formattedPhone = formatPhoneForWhatsApp(conversation.sender.phone);
      setEditableWhatsappPhone(formattedPhone);
      // Doğrulama yap
      const validation = validateWhatsAppPhone(formattedPhone);
      setWhatsappPhoneError(validation.valid ? null : validation.message);
    } else if (hasWhatsAppData) {
      setEditableWhatsappPhone(conversation.channelMetadata.waId || '');
      setWhatsappPhoneError(null);
    } else {
      setEditableWhatsappPhone('');
      setWhatsappPhoneError(null);
    }
    
    // WhatsApp kanalıysa veya telefon numarası varsa 24 saat kontrolü yap
    if (isWhatsAppEnabled || hasPhone) {
      setCheckingWhatsappWindow(true);
      try {
        const windowStatus = await checkServiceWindow(conversationId);
        setWhatsappWindowStatus(windowStatus);
        
        // Eğer template gerekiyorsa template'leri yükle
        if (windowStatus.requiresTemplate) {
          setLoadingTemplates(true);
          try {
            const response = await fetch('/api/admin/whatsapp/templates');
            const data = await response.json();
            if (data.success) {
              // Sadece onaylı template'leri göster
              const approvedTemplates = (data.data || []).filter(t => t.status === 'APPROVED');
              setWhatsappTemplates(approvedTemplates);
            }
          } catch (err) {
            console.error('Template loading error:', err);
          } finally {
            setLoadingTemplates(false);
          }
        }
      } catch (err) {
        console.error('Service window check error:', err);
        setWhatsappWindowStatus({ isOpen: false, requiresTemplate: true });
      } finally {
        setCheckingWhatsappWindow(false);
      }
    }
    
    setSendChannels({
      email: hasEmail ? true : false,
      whatsapp: isWhatsAppEnabled ? true : false, // WhatsApp iletişimi başlamışsa otomatik seç
      manual: !hasEmail && !isWhatsAppEnabled, // Email ve WhatsApp yoksa manuel seçili olsun
    });
    setSelectedWhatsappTemplate(null);
    setShowSendModal(true);
  };

  // Seçilen kanallarla mesaj gönder
  const handleConfirmSend = async () => {
    if (!pendingSendMessageId) return;

    // En az bir kanal seçilmeli
    if (!sendChannels.email && !sendChannels.whatsapp && !sendChannels.manual) {
      toast({
        title: "Kanal Seçin",
        description: "En az bir gönderim kanalı seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }
    
    // WhatsApp seçiliyse telefon doğrulama
    if (sendChannels.whatsapp) {
      const phoneValidation = validateWhatsAppPhone(editableWhatsappPhone);
      if (!phoneValidation.valid) {
        toast({
          title: "Geçersiz Telefon Numarası",
          description: phoneValidation.message,
          variant: "destructive",
        });
        return;
      }
    }
    
    // WhatsApp seçiliyse ve 24 saat kapanmışsa template zorunlu
    if (sendChannels.whatsapp && whatsappWindowStatus?.requiresTemplate && !selectedWhatsappTemplate) {
      toast({
        title: "Şablon Seçin",
        description: "24 saat penceresi kapandığı için WhatsApp mesajı göndermek için şablon seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      const selectedChannels = [];
      if (sendChannels.email) selectedChannels.push("email");
      if (sendChannels.whatsapp) selectedChannels.push("whatsapp");
      if (sendChannels.manual) selectedChannels.push("manual");

      // Attachment'ları hazırla - state'ten veya mesajdan al
      let emailAttachments = attachments;
      
      // Eğer state'te attachment yoksa, mesajdaki attachment'ları al
      // ⚠️ Storage'daki dosyaları INDIRMEYE GEREK YOK, sadece URL'leri kullan
      if (emailAttachments.length === 0 && sendChannels.email) {
        const pendingMessage = conversation?.messages?.find(m => m.id === pendingSendMessageId);
        if (pendingMessage?.attachments?.length > 0) {
          // Attachments'ları direkt kullan (URL varsa, contentBytes olmadan)
          emailAttachments = pendingMessage.attachments.map(att => ({
            name: att.name,
            url: att.url,
            size: att.size || 0,
            contentType: att.contentType || 'application/octet-stream',
            // contentBytes yok - sendEmailViaOutlook bunları URL olarak işleyecek
          }));
          
          console.log('[CRM] Using existing storage URLs for attachments:', emailAttachments.length);
        }
      }
      
      // WhatsApp template bilgilerini hazırla
      const whatsappOptions = sendChannels.whatsapp ? {
        templateName: selectedWhatsappTemplate?.name || null,
        templateLanguage: selectedWhatsappTemplate?.language || 'tr',
        forceTemplate: whatsappWindowStatus?.requiresTemplate || false,
        templateComponents: selectedWhatsappTemplate 
          ? buildTemplateComponents(selectedWhatsappTemplate, templateVariables) 
          : undefined,
      } : {};

      // Mesajı onayla ve gönder (kanallarla ve attachment'larla birlikte)
      await approveAndSendMessage(
        conversationId,
        pendingSendMessageId,
        user?.uid,
        {
          channels: selectedChannels,
          recipientEmail: conversation?.sender?.email,
          recipientName: conversation?.sender?.name,
          recipientPhone: sendChannels.whatsapp ? editableWhatsappPhone : conversation?.sender?.phone,
          subject: conversation?.subject,
          attachments: emailAttachments, // Hazırlanan attachment'ları gönder
          ...whatsappOptions, // WhatsApp template bilgileri
        },
      );

      const channelNames = [];
      if (sendChannels.email) channelNames.push("E-posta");
      if (sendChannels.whatsapp) channelNames.push("WhatsApp");
      if (sendChannels.manual) channelNames.push("Manuel kayıt");

      toast({
        title: "✅ Gönderildi",
        description: `Mesaj gönderildi: ${channelNames.join(", ")}`,
      });

      setDraftMessage(null);
      setShowSendModal(false);
      setPendingSendMessageId(null);
      setAttachments([]); // Attachment'ları temizle
      setSelectedWhatsappTemplate(null);
      setTemplateVariables({ header: "", body: [] });
      loadData();
    } catch (error) {
      console.error("Send message error:", error);
      toast({
        title: "Gönderim Hatası",
        description: error.message || "Mesaj gönderilemedi.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Eski fonksiyon - geriye uyumluluk için (direkt gönderim)
  const handleApproveAndSend = async (messageId) => {
    handleOpenSendModal(messageId);
  };

  // WhatsApp Şablon Modalını Aç (Direkt gönderim için)
  const handleOpenWhatsAppTemplateModal = async () => {
    // Telefon numarasını set et - tüm olası kaynaklardan al
    const phone = conversation?.sender?.phone 
      || conversation?.channelMetadata?.waId 
      || customer?.phone  // Customer'dan telefon al
      || '';
    
    console.log('[WA Template] Phone sources:', {
      senderPhone: conversation?.sender?.phone,
      waId: conversation?.channelMetadata?.waId,
      customerPhone: customer?.phone,
      resolved: phone
    });
    
    if (phone) {
      const formattedPhone = formatPhoneForWhatsApp(phone);
      setDirectTemplatePhone(formattedPhone);
      const validation = validateWhatsAppPhone(formattedPhone);
      setDirectTemplatePhoneError(validation.valid ? null : validation.message);
    } else {
      setDirectTemplatePhone('');
      setDirectTemplatePhoneError('Müşterinin telefon numarası bulunamadı. Lütfen manuel girin.');
    }
    
    // Template'leri yükle
    setLoadingDirectTemplates(true);
    setDirectSelectedTemplate(null);
    setShowWhatsAppTemplateModal(true);
    
    try {
      const response = await fetch('/api/admin/whatsapp/templates');
      const data = await response.json();
      if (data.success) {
        // Sadece onaylı template'leri göster
        const approvedTemplates = (data.data || []).filter(t => t.status === 'APPROVED');
        setDirectTemplates(approvedTemplates);
      } else {
        setDirectTemplates([]);
        toast({
          title: "Uyarı",
          description: "WhatsApp şablonları yüklenemedi.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Template loading error:', err);
      setDirectTemplates([]);
    } finally {
      setLoadingDirectTemplates(false);
    }
  };

  // WhatsApp Şablon ile Direkt Gönder
  const handleSendDirectTemplate = async () => {
    // Validasyon
    if (!directSelectedTemplate) {
      toast({
        title: "Şablon Seçin",
        description: "Göndermek için bir WhatsApp şablonu seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }
    
    const phoneValidation = validateWhatsAppPhone(directTemplatePhone);
    if (!phoneValidation.valid) {
      toast({
        title: "Geçersiz Telefon Numarası",
        description: phoneValidation.message,
        variant: "destructive",
      });
      return;
    }
    
    setSendingDirectTemplate(true);
    try {
      // 1. Canlı önizleme ile şablon içeriğini oluştur (değişkenler uygulanmış)
      const livePreviewContent = getLivePreview(directSelectedTemplate, directTemplateVariables);
      const templateContent = `[WhatsApp Şablon: ${directSelectedTemplate.name}]\n\n${livePreviewContent}`;
      
      const messageData = {
        content: templateContent,
        direction: "outbound",
        status: MESSAGE_STATUS.DRAFT,
        channel: CHANNEL.WHATSAPP,
        replyChannel: REPLY_CHANNEL.WHATSAPP,
        sender: {
          name: user?.displayName || user?.email || "Admin",
          email: user?.email,
        },
        channelMetadata: {
          templateName: directSelectedTemplate.name,
          templateLanguage: directSelectedTemplate.language || 'tr',
        },
      };
      
      const newMessage = await addMessage(conversationId, messageData);
      
      // Mesaj skip edildiyse (duplicate) uyar
      if (newMessage.skipped) {
        console.warn('[CRM] Message was skipped (duplicate):', newMessage.skipReason);
      }
      
      console.log('[CRM] Message created for template:', newMessage.id);
      
      // 2. Mesajı WhatsApp üzerinden gönder (template components ile)
      const templateComponents = buildTemplateComponents(directSelectedTemplate, directTemplateVariables);
      
      await approveAndSendMessage(
        conversationId,
        newMessage.id,
        user?.uid,
        {
          channels: ['whatsapp'],
          recipientPhone: directTemplatePhone,
          templateName: directSelectedTemplate.name,
          templateLanguage: directSelectedTemplate.language || 'tr',
          templateComponents,
          forceTemplate: true,
        }
      );
      
      toast({
        title: "✅ WhatsApp Şablon Gönderildi",
        description: `"${directSelectedTemplate.name}" şablonu başarıyla gönderildi.`,
      });
      
      setShowWhatsAppTemplateModal(false);
      setDirectSelectedTemplate(null);
      setDirectTemplateVariables({ header: "", body: [] });
      loadData();
    } catch (error) {
      console.error("WhatsApp template send error:", error);
      toast({
        title: "Gönderim Hatası",
        description: error.message || "Şablon gönderilemedi.",
        variant: "destructive",
      });
    } finally {
      setSendingDirectTemplate(false);
    }
  };

  // Taslak mesajı sil
  const handleDeleteDraft = async (messageId) => {
    try {
      await deleteMessage(messageId, user?.uid);
      toast({
        title: "Silindi",
        description: "Taslak mesaj silindi.",
      });
      setDraftMessage(null);
      loadData();
    } catch (error) {
      console.error("Delete draft error:", error);
      toast({
        title: "Hata",
        description: "Mesaj silinemedi.",
        variant: "destructive",
      });
    }
  };

  // Taslak mesajı düzenle
  const handleEditDraft = (message) => {
    setReplyContent(message.content);
    setEditingDraft(true);
    setDraftMessage(message);
  };

  // Taslak güncellemesini kaydet
  const handleUpdateDraft = async () => {
    if (!draftMessage || !replyContent.trim()) return;

    setSending(true);
    try {
      await updateMessageContent(draftMessage.id, replyContent, user?.email);
      toast({
        title: "Güncellendi",
        description: "Taslak mesaj güncellendi.",
      });
      setReplyContent("");
      setEditingDraft(false);
      setDraftMessage(null);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Taslak güncellenemedi.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // ATTACHMENT HANDLING FUNCTIONS
  // ==========================================

  // Dosya seçimi (bilgisayardan)
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // LocalStorage'dan dosya boyutu limitini al
    const maxSizeMB = getMaxFileSizeMB();
    const maxSize = getMaxFileSizeBytes();

    for (const file of files) {
      // Dosya boyutu kontrolü
      const validation = validateFileSize(file.size);
      if (!validation.valid) {
        toast({
          title: "Dosya çok büyük",
          description: `${file.name} (${formatFileSize(file.size)}) ${maxSizeMB}MB limitini aşıyor.`,
          variant: "destructive",
        });
        continue;
      }

      // Büyük dosya uyarısı
      if (needsLargeUploadConfirmation(file.size)) {
        const confirmed = window.confirm(
          `${file.name} (${formatFileSize(file.size)}) büyük bir dosya.\n\nYüklemek istediğinizden emin misiniz?`
        );
        if (!confirmed) continue;
      }

      toast({
        title: "Yükleniyor",
        description: `${file.name} (${formatFileSize(file.size)}) yükleniyor...`,
      });

      try {
        // Firebase Storage'a yükle
        const storagePath = `crm-attachments/${conversationId}/${Date.now()}_${file.name}`;
        const storageUrl = await uploadFile(file, storagePath);

        // Base64'e çevir (email için)
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.readAsDataURL(file);
        });

        const attachment = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          contentType: file.type || 'application/octet-stream',
          contentBytes: base64,
          size: file.size,
          type: 'file',
          url: storageUrl,
          storagePath: storagePath,
        };

        setAttachments(prev => [...prev, attachment]);
        
        toast({
          title: "✅ Yüklendi",
          description: `${file.name} başarıyla eklendi.`,
        });
      } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        toast({
          title: "Hata",
          description: `${file.name} yüklenemedi: ${error.message}`,
          variant: "destructive",
        });
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Bağlı belgeyi ekleme (Proforma, Sözleşme)
  // Hesaplama için önce modal açılır
  const handleAddLinkedDocument = async (docType, document, options = {}) => {
    // Hesaplama için önce ayar modalı aç
    if (docType === 'calculation' && !options.skipModal) {
      setPendingCalculation(document);
      setCalcShowCostDetails(false); // Varsayılan: maliyet detayları gizli
      setShowCalcOptionsModal(true);
      return;
    }

    // Duplicate kontrolü
    const attachmentId = `${docType}-${document.id}`;
    const exists = attachments.some(a => a.id === attachmentId);
    if (exists) {
      toast({
        title: "Zaten ekli",
        description: "Bu belge zaten eklendi.",
        variant: "default",
      });
      return;
    }

    // Loading toast
    toast({
      title: "PDF Oluşturuluyor",
      description: "Belge PDF'e dönüştürülüyor...",
    });

    try {
      let apiEndpoint = '';
      let requestBody = {};
      let fileName = '';
      
      switch (docType) {
        case 'proforma':
          apiEndpoint = '/api/generate-pdf';
          // Proforma için şirket bilgilerini de al
          requestBody = { 
            proforma: document,
            companyData: linkedCompany || null
          };
          fileName = `Proforma_${document.proformaNumber || document.id.slice(0, 8)}.pdf`;
          break;
        case 'contract':
          apiEndpoint = '/api/generate-contract-pdf';
          requestBody = { 
            contract: document,
            companyData: linkedCompany || null
          };
          fileName = `Sozlesme_${document.contractNumber || document.id.slice(0, 8)}.pdf`;
          break;
        case 'calculation':
          apiEndpoint = '/api/generate-pricing-calculation-pdf';
          requestBody = { 
            calculation: document,
            options: {
              showCostDetails: options.showCostDetails || false,
              companyData: linkedCompany || null
            }
          };
          fileName = `Hesaplama_${document.productName || document.id.slice(0, 8)}.pdf`;
          break;
      }

      // PDF API'yi çağır
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`PDF oluşturulamadı: ${response.status}`);
      }

      // PDF blob'unu al
      const pdfBlob = await response.blob();
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Firebase Storage'a yükle
      const storagePath = `crm-attachments/${conversationId}/${Date.now()}_${fileName}`;
      const storageUrl = await uploadFile(pdfFile, storagePath);

      // Base64'e çevir (email için)
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.readAsDataURL(pdfBlob);
      });

      // Attachment objesi oluştur
      const attachment = {
        id: attachmentId,
        name: fileName,
        type: docType,
        contentType: 'application/pdf',
        contentBytes: base64,
        size: pdfBlob.size,
        url: storageUrl,
        storagePath: storagePath,
        documentId: document.id,
        documentType: docType,
        documentInfo: {
          number: document.proformaNumber || document.contractNumber || document.productName,
          status: document.status,
          total: document.totals?.grandTotal || document.totalCost,
          createdAt: document.createdAt,
        },
      };

      setAttachments(prev => [...prev, attachment]);
      toast({
        title: "✅ Eklendi",
        description: `${fileName} başarıyla eklendi.`,
      });
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: `PDF oluşturulamadı: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Attachment'ı kaldır
  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Hemen gönder (onay adımı olmadan)
  const handleSendReply = async () => {
    if (!replyContent.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      const messageData = {
        content: replyContent,
        direction: "outbound",
        status: MESSAGE_STATUS.SENT,
        channel: CHANNEL.MANUAL, // Kanal bilgisi
        replyChannel: REPLY_CHANNEL.MANUAL,
        sender: {
          name: user?.displayName || user?.email || "Admin",
          email: user?.email,
        },
      };

      // AI metadata varsa ekle
      if (isAiGenerated && aiMetadata) {
        messageData.aiGenerated = true;
        messageData.aiModel = aiMetadata.model;
        messageData.aiMetadata = aiMetadata;
      }

      // Attachment'ları ekle
      if (attachments.length > 0) {
        messageData.attachments = attachments.map(att => ({
          name: att.name,
          type: att.type,
          contentType: att.contentType,
          size: att.size,
          contentBytes: att.contentBytes,
          docType: att.docType,
          docId: att.docId,
          pdfUrl: att.pdfUrl,
          documentInfo: att.documentInfo,
        }));
      }

      await addMessage(conversationId, messageData);

      setReplyContent("");
      setIsAiGenerated(false);
      setAiMetadata(null);
      setAttachments([]); // Attachment'ları temizle

      toast({ title: "Gönderildi", description: "Mesajınız gönderildi." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Convert to case
  const handleConvertToCase = async () => {
    if (!convertForm.title) return;

    setCreatingCase(true);
    try {
      const newCase = await createCaseFromConversation(
        conversationId,
        {
          title: convertForm.title,
          type: convertForm.type,
          priority: convertForm.priority,
        },
        user?.uid,
      );

      toast({
        title: "Başarılı",
        description: "Konuşma talep olarak oluşturuldu.",
      });
      router.push(`/admin/crm-v2/cases/${newCase.id}`);
    } catch (error) {
      console.error("Error converting to case:", error);
      toast({
        title: "Hata",
        description: "Talep oluşturulamadı.",
        variant: "destructive",
      });
    } finally {
      setCreatingCase(false);
    }
  };

  // AI ile hızlı özet oluştur (sidebar için)
  const handleGenerateSummary = async () => {
    if (!conversation?.messages?.length) {
      toast({
        title: "Uyarı",
        description: "Özetlenecek mesaj bulunamadı.",
        variant: "default",
      });
      return;
    }

    setGeneratingSummary(true);
    try {
      // Konuşma geçmişini formatla
      const conversationHistory = formatConversationHistory(
        conversation.messages,
        15, // Daha fazla mesaj dahil et özet için
      );

      const customerName =
        customer?.name || conversation.sender?.name || "Müşteri";
      const customerCompany =
        customer?.companyName || conversation.sender?.company || "";

      // Prompt değişkenleri
      const promptVariables = {
        conversation_messages: conversationHistory,
        customer_name: customerName,
        customer_company: customerCompany,
        subject: conversation.subject || "Konu belirtilmemiş",
        channel: getChannelLabel(conversation.channel) || "email",
      };

      // API'ye istek at (quick kategori promptu ile)
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          contextKey: AI_CONTEXTS.CRM_CASE_SUMMARY,
          promptKey: "crm_case_summary_quick", // Quick kategori promptu
          promptVariables,
          options: {
            temperature: summaryModelSettings.temperature,
            maxTokens: summaryModelSettings.autoMaxTokens ? undefined : summaryModelSettings.maxTokens,
          },
        }),
      });

      const result = await response.json();

      if (result.success && result.content) {
        // JSON yanıtı parse et
        try {
          // JSON bloğunu temizle (```json ... ``` varsa)
          let jsonContent = result.content;
          if (jsonContent.includes("```json")) {
            jsonContent = jsonContent
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "");
          }
          if (jsonContent.includes("```")) {
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
            jsonContent += ']'.repeat(openBrackets - closeBrackets);
          }
          if (openBraces > closeBraces) {
            // Eğer son karakter virgül veya açık tırnak ise düzelt
            jsonContent = jsonContent.replace(/,\s*$/, '');
            jsonContent = jsonContent.replace(/"[^"]*$/, '""');
            jsonContent += '}'.repeat(openBraces - closeBraces);
          }

          const summaryData = JSON.parse(jsonContent.trim());
          setAiSummary(summaryData);

          toast({
            title: "✅ Özet Oluşturuldu",
            description: "Konuşma özeti hazır.",
          });
        } catch (parseError) {
          console.error("JSON parse error:", parseError, result.content);
          
          // Fallback: Ham içerikten özet çıkarmaya çalış
          const summaryMatch = result.content.match(/"summary"\s*:\s*"([^"]+)"/);
          const mainRequestMatch = result.content.match(/"mainRequest"\s*:\s*"([^"]+)"/);
          
          if (summaryMatch || mainRequestMatch) {
            setAiSummary({
              summary: summaryMatch?.[1] || mainRequestMatch?.[1] || "Özet ayrıştırılamadı",
              mainRequest: mainRequestMatch?.[1] || "",
              parseError: true,
              rawContent: result.content,
            });
            toast({
              title: "⚠️ Kısmi Özet",
              description: "Özet kısmen ayrıştırıldı.",
              variant: "default",
            });
          } else {
            // JSON parse edilemezse ham içeriği göster
            setAiSummary({
              summary: result.content,
              parseError: true,
            });
          }
        }
      } else {
        // Enhanced error handling with user-friendly messages (helpers from hook)
        toast({
          title: getAIErrorTitle(result.errorCode),
          description: getAIErrorMessage(result.errorCode, result.error),
          variant: result.retryable ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error("AI summary error:", error);
      toast({
        title: "AI Hatası",
        description: error.message || "Özet oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Close conversation
  const handleClose = async () => {
    try {
      await closeConversation(conversationId);
      toast({ title: "Kapatıldı", description: "Konuşma kapatıldı." });
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  // Snooze
  const handleSnooze = async (until) => {
    try {
      await snoozeConversation(conversationId, until);
      toast({
        title: "Ertelendi",
        description: `${format(until, "dd MMM HH:mm", {
          locale: tr,
        })} tarihine ertelendi.`,
      });
      setShowSnoozeModal(false);
      loadData();
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="h-full flex bg-slate-50">
        <div className="flex-1 p-6 space-y-4 bg-white">
          <Skeleton className="h-8 w-48 bg-slate-200" />
          <Skeleton className="h-[400px] bg-slate-200" />
          <Skeleton className="h-24 bg-slate-200" />
        </div>
        <div className="w-80 border-l p-4 space-y-4 bg-white">
          <Skeleton className="h-32 bg-slate-200" />
          <Skeleton className="h-48 bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  const isClosed = conversation.status === CONVERSATION_STATUS.CLOSED;
  const isConverted = conversation.status === CONVERSATION_STATUS.CONVERTED;
  const hasLinkedCase = !!conversation.linkedCaseId || !!linkedCase;
  const linkedCaseId = conversation.linkedCaseId || linkedCase?.id;

  return (
    <div className="h-full flex bg-slate-50/50">
      {/* Main Content - Messages */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                asChild
              >
                <Link href="/admin/crm-v2/inbox">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  {conversation.subject || "Konu Yok"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs bg-white border-slate-200 text-slate-600"
                  >
                    {getChannelLabel(conversation.channel)}
                  </Badge>
                  {/* Reply Status Badge - Minimalist */}
                  {conversation.replyStatus && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
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
                      "text-xs bg-white",
                      getConversationStatusColor(conversation.status),
                    )}
                  >
                    {getConversationStatusLabel(conversation.status)}
                  </Badge>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">
                    {safeFormatDate(
                      conversation.channelMetadata?.originalCreatedAt || conversation.createdAt,
                      "dd MMM yyyy HH:mm"
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isClosed && !isConverted && !hasLinkedCase && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowConvertModal(true)}
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Talep Oluştur
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border-slate-200"
                    >
                      <DropdownMenuItem
                        onClick={() => setShowSnoozeModal(true)}
                        className="text-slate-700"
                      >
                        <AlarmClock className="h-4 w-4 mr-2" />
                        Ertele
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-100" />
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            const result = await cleanupDuplicateMessages(
                              conversation.id,
                            );
                            if (result.deleted > 0) {
                              toast({
                                title: "Temizlendi",
                                description: `${result.deleted} duplicate mesaj silindi.`,
                              });
                              // Sayfayı yenile
                              loadConversation();
                            } else {
                              toast({
                                title: "Temiz",
                                description: "Duplicate mesaj bulunamadı.",
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "Hata",
                              description: error.message,
                              variant: "destructive",
                            });
                          }
                        }}
                        className="text-slate-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Duplicate Temizle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-100" />
                      <DropdownMenuItem
                        onClick={handleClose}
                        className="text-amber-600 focus:text-amber-700"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Kapat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              {(isConverted || hasLinkedCase) && linkedCaseId && (
                <Button
                  variant="outline"
                  className="bg-white border-slate-200"
                  asChild
                >
                  <Link href={`/admin/crm-v2/cases/${linkedCaseId}`}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Talebi Görüntüle
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="space-y-4 max-w-3xl mx-auto">
                {!conversation.messages ||
                conversation.messages.length === 0 ? (
                  <div className="py-6">
                    {/* Eğer preview varsa, ilk mesaj olarak göster */}
                    {conversation.preview ? (
                      <div className="flex gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-white shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                            {getInitials(conversation.sender?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 max-w-[75%]">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-semibold text-slate-800">
                              {conversation.sender?.name || "Bilinmiyor"}
                            </span>
                            {/* Kanal Badge - Konuşmanın geldiği kanal */}
                            {conversation.channel && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 flex items-center gap-1 border",
                                  getMessageChannelColor(conversation.channel)
                                )}
                                title={`Kanal: ${getChannelLabel(conversation.channel)}`}
                              >
                                {getChannelIconComponent(conversation.channel, "h-2.5 w-2.5")}
                                <span className="hidden sm:inline">{getChannelLabel(conversation.channel)}</span>
                              </Badge>
                            )}
                            <span className="text-xs text-slate-400">
                              {safeFormatDate(
                                conversation.channelMetadata?.originalCreatedAt || conversation.createdAt,
                                "dd MMM HH:mm"
                              )}
                            </span>
                          </div>
                          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-slate-100">
                            <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
                              {isHtmlContent(conversation.preview)
                                ? stripHtmlToText(conversation.preview)
                                : conversation.preview}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">
                          Henüz mesaj yok
                        </p>
                        {conversation.sourceRef && (
                          <Button
                            variant="link"
                            className="mt-3 text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              const sourceType = conversation.sourceRef?.type;
                              const sourceId = conversation.sourceRef?.id;
                              if (sourceType === "contact") {
                                router.push(`/admin/contacts/${sourceId}`);
                              } else if (sourceType === "quote") {
                                router.push(`/admin/quotes/${sourceId}`);
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Eski sistemde görüntüle
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  conversation.messages?.map((message, index) => {
                    const isOutbound = message.direction === "outbound";
                    const isDraft = message.status === MESSAGE_STATUS.DRAFT;
                    const isPending =
                      message.status === MESSAGE_STATUS.PENDING_APPROVAL;
                    const showActions = isOutbound && (isDraft || isPending);

                    return (
                      <div
                        key={message.id || index}
                        className={cn(
                          "flex gap-3",
                          isOutbound && "flex-row-reverse",
                        )}
                      >
                        <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-white shadow-sm">
                          <AvatarFallback
                            className={cn(
                              "text-sm font-medium",
                              isOutbound
                                ? "bg-gradient-to-br from-slate-600 to-slate-700 text-white"
                                : "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
                            )}
                          >
                            {/* WhatsApp inbound mesajları için conversation bilgilerinden initials al */}
                            {getInitials(!isOutbound && conversation?.channel === 'whatsapp' 
                              ? (conversation?.name || conversation?.channelMetadata?.profileName || conversation?.sender?.name || conversation?.phone || "") 
                              : (message.sender?.name || ""))}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "flex-1",
                            isOutbound ? "flex justify-end" : "",
                          )}
                        >
                          <div className="max-w-[75%]">
                            <div
                              className={cn(
                                "flex items-center gap-2 mb-1.5",
                                isOutbound && "flex-row-reverse",
                              )}
                            >
                              <span className="text-sm font-semibold text-slate-800">
                                {/* WhatsApp inbound mesajları için conversation bilgilerini kullan */}
                                {!isOutbound && conversation?.channel === 'whatsapp'
                                  ? (conversation?.name || conversation?.channelMetadata?.profileName || conversation?.sender?.name || conversation?.phone || "Bilinmiyor")
                                  : (message.sender?.name || "Bilinmiyor")}
                              </span>
                              {/* Kanal Badge - Mesajın geldiği/gönderildiği kanal */}
                              {(message.channel || message.replyChannel) && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] px-1.5 py-0 h-4 flex items-center gap-1 border",
                                    getMessageChannelColor(message.channel || message.replyChannel)
                                  )}
                                  title={`${isOutbound ? 'Gönderim Kanalı' : 'Alınan Kanal'}: ${getChannelLabel(message.channel || message.replyChannel)}`}
                                >
                                  {getChannelIconComponent(message.channel || message.replyChannel, "h-2.5 w-2.5")}
                                  <span className="hidden sm:inline">{getChannelLabel(message.channel || message.replyChannel)}</span>
                                </Badge>
                              )}
                              <span className="text-xs text-slate-400">
                                {safeFormatDate(
                                  message.originalCreatedAt || message.createdAt,
                                  "dd MMM HH:mm"
                                )}
                              </span>
                              {/* AI Badge */}
                              {message.aiGenerated && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0 bg-purple-50 text-purple-600 border-purple-200"
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                              {/* Status Badge */}
                              {isOutbound &&
                                message.status &&
                                message.status !== MESSAGE_STATUS.SENT && (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs px-1.5 py-0",
                                      getMessageStatusColor(message.status),
                                    )}
                                  >
                                    {getMessageStatusLabel(message.status)}
                                  </Badge>
                                )}
                            </div>
                            <div
                              className={cn(
                                "px-4 py-3 shadow-sm",
                                isOutbound
                                  ? isDraft
                                    ? "bg-amber-100 text-amber-900 rounded-2xl rounded-tr-md border-2 border-dashed border-amber-300"
                                    : "bg-slate-800 text-white rounded-2xl rounded-tr-md"
                                  : "bg-white border border-slate-100 rounded-2xl rounded-tl-md",
                              )}
                            >
                              {/* WhatsApp Media Content - template ve text dışındaki tipler */}
                              {message.channel === 'whatsapp' && message.channelMetadata?.type && !['text', 'template'].includes(message.channelMetadata?.type) ? (
                                <div className="space-y-2">
                                  {/* Image */}
                                  {message.channelMetadata.type === 'image' && (
                                    <div>
                                      {message.channelMetadata.mediaUrl ? (
                                        <img
                                          src={message.channelMetadata.mediaUrl}
                                          alt="WhatsApp Image"
                                          className="rounded-lg max-w-full max-h-60 object-cover cursor-pointer"
                                          onClick={() => window.open(message.channelMetadata.mediaUrl, '_blank')}
                                        />
                                      ) : (
                                        <div className={cn("rounded-lg p-4 flex items-center justify-center min-h-[120px]", isOutbound ? "bg-slate-700" : "bg-slate-100")}>
                                          <div className="text-center text-slate-500">
                                            <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                            <p className="text-xs">Görsel yükleniyor...</p>
                                          </div>
                                        </div>
                                      )}
                                      {message.channelMetadata.caption && (
                                        <p className={cn("text-sm mt-2", isOutbound ? (isDraft ? "text-amber-800" : "text-slate-100") : "text-slate-700")}>
                                          {message.channelMetadata.caption}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Video */}
                                  {message.channelMetadata.type === 'video' && (
                                    <div>
                                      {message.channelMetadata.mediaUrl ? (
                                        <video
                                          src={message.channelMetadata.mediaUrl}
                                          controls
                                          className="rounded-lg max-w-full max-h-60"
                                        />
                                      ) : (
                                        <div className={cn("rounded-lg p-4 flex items-center justify-center min-h-[120px]", isOutbound ? "bg-slate-700" : "bg-slate-100")}>
                                          <div className="text-center text-slate-500">
                                            <Film className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                            <p className="text-xs">Video yükleniyor...</p>
                                          </div>
                                        </div>
                                      )}
                                      {message.channelMetadata.caption && (
                                        <p className={cn("text-sm mt-2", isOutbound ? (isDraft ? "text-amber-800" : "text-slate-100") : "text-slate-700")}>
                                          {message.channelMetadata.caption}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Audio */}
                                  {message.channelMetadata.type === 'audio' && (
                                    <div>
                                      {message.channelMetadata.mediaUrl ? (
                                        <audio
                                          src={message.channelMetadata.mediaUrl}
                                          controls
                                          className="max-w-full"
                                        />
                                      ) : (
                                        <div className={cn("rounded-lg p-3 text-center", isOutbound ? "bg-slate-700" : "bg-slate-100")}>
                                          <Music className={cn("h-6 w-6 mx-auto mb-1", isOutbound ? "text-slate-300" : "text-slate-500")} />
                                          <p className={cn("text-xs", isOutbound ? "text-slate-300" : "text-slate-500")}>Ses dosyası yükleniyor...</p>
                                        </div>
                                      )}
                                      {message.channelMetadata.filename && (
                                        <p className={cn("text-xs mt-1 truncate", isOutbound ? "text-slate-400" : "text-slate-500")}>
                                          {message.channelMetadata.filename}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Document */}
                                  {message.channelMetadata.type === 'document' && (
                                    <div>
                                      <button
                                        className={cn(
                                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-colors w-full",
                                          isOutbound ? "bg-slate-700" : "bg-slate-100"
                                        )}
                                        onClick={() => {
                                          if (message.channelMetadata.mediaUrl) {
                                            window.open(message.channelMetadata.mediaUrl, '_blank');
                                          }
                                        }}
                                      >
                                        <FileText className={cn("h-8 w-8", isOutbound ? "text-slate-300" : "text-slate-500")} />
                                        <div className="flex-1 min-w-0 text-left">
                                          <p className={cn("text-sm font-medium truncate", isOutbound ? "text-slate-100" : "text-slate-700")}>
                                            {message.channelMetadata.filename || "Dosya"}
                                          </p>
                                          <p className={cn("text-xs", isOutbound ? "text-slate-400" : "text-slate-500")}>
                                            {message.channelMetadata.mediaUrl ? 'İndirmek için tıklayın' : 'Yükleniyor...'}
                                          </p>
                                        </div>
                                        {message.channelMetadata.mediaUrl && (
                                          <Download className={cn("h-4 w-4", isOutbound ? "text-slate-400" : "text-slate-500")} />
                                        )}
                                      </button>
                                      {message.channelMetadata.caption && (
                                        <p className={cn("text-sm mt-2", isOutbound ? (isDraft ? "text-amber-800" : "text-slate-100") : "text-slate-700")}>
                                          {message.channelMetadata.caption}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className={cn(
                                    "whitespace-pre-wrap text-sm leading-relaxed",
                                    isOutbound
                                      ? isDraft
                                        ? "text-amber-800"
                                        : "text-slate-100"
                                      : "text-slate-700",
                                  )}
                                >
                                  {/* HTML içerik varsa temizleyerek göster, yoksa direkt göster */}
                                  {isHtmlContent(message.content)
                                    ? stripHtmlToText(message.content)
                                    : message.content}
                                </div>
                              )}

                              {/* Mesaja ekli dosyalar */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className={cn(
                                  "mt-3 pt-3 border-t",
                                  isDraft ? "border-amber-200" : isOutbound ? "border-slate-600" : "border-slate-200"
                                )}>
                                  <div className={cn(
                                    "flex items-center gap-1.5 mb-2 text-xs font-medium",
                                    isDraft ? "text-amber-700" : isOutbound ? "text-slate-300" : "text-slate-500"
                                  )}>
                                    <Paperclip className="h-3 w-3" />
                                    Ekler ({message.attachments.length})
                                  </div>
                                  <div className="space-y-1.5">
                                    {message.attachments.map((att, attIndex) => (
                                      <button
                                        key={attIndex}
                                        onClick={() => {
                                          // Önce Storage URL'i kontrol et (her zaman tercih edilir)
                                          if (att.url) {
                                            window.open(att.url, '_blank');
                                          } 
                                          // Yoksa belge tipine göre admin sayfasına yönlendir
                                          else if (att.documentId) {
                                            if (att.type === 'proforma') {
                                              window.open(`/admin/proformas/${att.documentId}`, '_blank');
                                            } else if (att.type === 'contract') {
                                              window.open(`/admin/contracts/${att.documentId}`, '_blank');
                                            } else if (att.type === 'calculation') {
                                              window.open(`/admin/pricing-calculator?id=${att.documentId}`, '_blank');
                                            }
                                          }
                                        }}
                                        className={cn(
                                          "flex items-center gap-2 w-full p-2 rounded-lg text-left transition-colors",
                                          isDraft 
                                            ? "bg-amber-50 hover:bg-amber-200 border border-amber-200" 
                                            : isOutbound 
                                              ? "bg-slate-700 hover:bg-slate-600 border border-slate-600" 
                                              : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                                        )}
                                      >n                                        {att.type === 'file' ? (
                                          <FileIcon className={cn("h-4 w-4 flex-shrink-0", isDraft ? "text-amber-600" : isOutbound ? "text-slate-300" : "text-slate-500")} />
                                        ) : att.type === 'proforma' ? (
                                          <Receipt className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        ) : att.type === 'contract' ? (
                                          <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <Calculator className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <p className={cn(
                                            "text-xs font-medium truncate",
                                            isDraft ? "text-amber-800" : isOutbound ? "text-slate-200" : "text-slate-700"
                                          )}>
                                            {att.name}
                                          </p>
                                          {att.size && (
                                            <p className={cn(
                                              "text-xs",
                                              isDraft ? "text-amber-600" : isOutbound ? "text-slate-400" : "text-slate-500"
                                            )}>
                                              {formatFileSize(att.size)}
                                            </p>
                                          )}
                                        </div>
                                        <ExternalLink className={cn(
                                          "h-3 w-3 flex-shrink-0",
                                          isDraft ? "text-amber-500" : isOutbound ? "text-slate-400" : "text-slate-400"
                                        )} />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Draft Actions */}
                            {showActions && (
                              <div
                                className={cn(
                                  "flex gap-2 mt-2",
                                  isOutbound && "justify-end",
                                )}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => handleEditDraft(message)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Düzenle
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteDraft(message.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Sil
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() =>
                                    handleApproveAndSend(message.id)
                                  }
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Onayla ve Gönder
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Reply Box - Always visible except when closed */}
        {!isClosed && (
          <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              {/* Show linked case info if exists */}
              {hasLinkedCase && linkedCaseId && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-slate-600">
                    Bu konuşma bir talebe bağlı:
                  </span>
                  <Link
                    href={`/admin/crm-v2/cases/${linkedCaseId}`}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Talebi Görüntüle →
                  </Link>
                </div>
              )}

              {/* AI Controls - Compact & Responsive */}
              <div className="flex items-center justify-between mb-3 px-1 gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Grup 1: AI Araçları */}
                  <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
                    {/* AI Tone Selector */}
                    <Select value={aiTone} onValueChange={setAiTone}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="Üslup" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REPLY_TONE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* AI Generate Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateAIReply}
                      disabled={generatingAI || !conversation?.messages?.length}
                      className="h-8 text-xs bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
                    >
                      {generatingAI ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          <span className="hidden sm:inline">Oluşturuluyor...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 sm:mr-1.5" />
                          <span className="hidden sm:inline">AI ile Yanıtla</span>
                        </>
                      )}
                    </Button>

                    {/* AI Settings Button - AI butonunun yanında */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAISettingsModal(true)}
                      className="h-8 w-8 text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                      title="AI Ayarları"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Grup 2: Hazır Mesajlar */}
                  <div className="flex items-center gap-1">
                    {/* Quick Reply Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickReplyModal(true)}
                      className="h-8 text-xs text-slate-600 hover:bg-slate-100"
                      title="Hazır Yanıtlar"
                    >
                      <FileText className="h-3.5 w-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">Hazır Yanıtlar</span>
                    </Button>

                    {/* WhatsApp Şablon Gönder Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOpenWhatsAppTemplateModal}
                      className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="WhatsApp şablonu seçerek direkt mesaj gönder"
                    >
                      <MessageCircle className="h-3.5 w-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">WA Şablon</span>
                    </Button>
                  </div>
                </div>

                {/* Status Badges - Right side */}
                <div className="flex items-center gap-2">
                  {/* AI Generated Indicator */}
                  {isAiGenerated && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-600 border-purple-200 text-[10px] px-2 py-0 h-5"
                    >
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                      AI
                    </Badge>
                  )}

                  {/* User Instruction Indicator */}
                  {replyContent.trim() && !isAiGenerated && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] px-2 py-0 h-5"
                      title="Mesaj kutusundaki metin AI'ya talimat olarak gönderilecek"
                    >
                      <Zap className="h-2.5 w-2.5 mr-1" />
                      Talimat
                    </Badge>
                  )}

                  {/* Attachment Count Badge */}
                  {attachments.length > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] px-2 py-0 h-5"
                    >
                      <Paperclip className="h-2.5 w-2.5 mr-1" />
                      {attachments.length} dosya
                    </Badge>
                  )}
                </div>
              </div>

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs",
                        attachment.type === 'linked_document'
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-slate-100 border border-slate-200"
                      )}
                    >
                      {attachment.type === 'linked_document' ? (
                        attachment.docType === 'proforma' ? (
                          <Receipt className="h-3.5 w-3.5 text-blue-500" />
                        ) : attachment.docType === 'contract' ? (
                          <FileText className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Calculator className="h-3.5 w-3.5 text-purple-500" />
                        )
                      ) : (
                        <FileIcon className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span className="max-w-[150px] truncate text-slate-700">
                        {attachment.name}
                      </span>
                      {attachment.size && (
                        <span className="text-slate-400">
                          ({formatFileSize(attachment.size)})
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 items-end">
                <Textarea
                  placeholder={
                    editingDraft
                      ? "Taslağı düzenleyin..."
                      : "Mesaj yazın veya AI talimatı girin..."
                  }
                  value={replyContent}
                  onChange={(e) => {
                    setReplyContent(e.target.value);
                    if (isAiGenerated) {
                      setIsAiGenerated(false);
                    }
                  }}
                  rows={3}
                  className={cn(
                    "flex-1 resize-none rounded-xl text-sm",
                    isAiGenerated
                      ? "bg-purple-50 border-purple-200 focus:bg-white focus:border-purple-300 focus:ring-purple-200"
                      : replyContent.trim() && !isAiGenerated
                        ? "bg-amber-50/50 border-amber-200 focus:bg-white focus:border-amber-300 focus:ring-amber-200"
                        : "bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200",
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      handleSaveAsDraft();
                    }
                  }}
                />
                <div className="flex flex-col gap-2 items-center">
                  {/* Dosya İkonları - Gönder butonunun üstünde */}
                  <div className="flex items-center gap-0.5">
                    {/* WhatsApp Media Upload Button - Sadece WhatsApp konuşmalarında */}
                    {conversation?.channel === 'whatsapp' && conversation?.channelMetadata?.whatsappConversationId && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => setShowWhatsAppMediaUpload(true)}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">WhatsApp Medya Gönder</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {/* File Upload Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 w-7 text-slate-400 hover:text-slate-600"
                      title="Dosya Ekle"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                    </Button>

                    {/* Linked Documents Button */}
                    {customer?.linkedCompanyId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDocumentPicker(true)}
                        className="h-7 w-7 text-slate-400 hover:text-blue-600"
                        title="Belgelerden Seç (Proforma, Sözleşme)"
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {editingDraft ? (
                    <>
                      <Button
                        onClick={handleUpdateDraft}
                        disabled={sending || !replyContent.trim()}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4 h-9 shadow-sm text-xs"
                      >
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        Güncelle
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingDraft(false);
                          setReplyContent("");
                          setDraftMessage(null);
                        }}
                        className="rounded-xl px-4 h-9 text-xs"
                      >
                        İptal
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleSaveAsDraft}
                      disabled={sending || !replyContent.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 h-10 shadow-sm text-xs"
                    >
                      {sending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          Gönder
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                Ctrl+Enter ile taslak olarak kaydet
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Contact Info */}
      <div className="w-80 border-l border-slate-200 bg-white flex-shrink-0 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Contact Card */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              Kişi Bilgileri
            </h3>
            <div className="bg-slate-50/50 rounded-xl p-4 space-y-3">
              {customer ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">
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
                      className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      asChild
                    >
                      <Link href={`/admin/crm-v2/customers/${customer.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    {customer.email && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate text-slate-600">
                          {customer.email}
                        </span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">
                    {conversation.sender?.name || "İsimsiz"}
                  </p>
                  {conversation.sender?.email && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {conversation.sender.email}
                      </span>
                    </div>
                  )}
                  {conversation.sender?.phone && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {conversation.sender.phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conversation Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Konuşma Detayları
            </h3>
            <div className="bg-slate-50/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Kanal</span>
                <Badge
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-600 text-xs"
                >
                  {getChannelLabel(conversation.channel)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Durum</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "bg-white text-xs",
                    getConversationStatusColor(conversation.status),
                  )}
                >
                  {getConversationStatusLabel(conversation.status)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Mesaj Sayısı</span>
                <span className="text-sm font-medium text-slate-700">
                  {conversation.messages?.length || 0}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">İlk Mesaj</span>
                  <span className="text-sm text-slate-700">
                    {safeFormatDate(
                      conversation.channelMetadata?.originalCreatedAt || conversation.createdAt,
                      "dd MMM yyyy"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Son Mesaj</span>
                  <span className="text-sm text-slate-700">
                    {(() => {
                      const date = safeParseDate(conversation.lastMessageAt);
                      if (!date) return "";
                      try {
                        return formatDistanceToNow(date, { addSuffix: true, locale: tr });
                      } catch (e) {
                        return "";
                      }
                    })()}
                  </span>
                </div>
              </div>
              {conversation.snoozedUntil && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-amber-600">
                    <span className="text-sm">Ertelendi</span>
                    <span className="text-sm font-medium">
                      {safeFormatDate(conversation.snoozedUntil, "dd MMM HH:mm")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Conversation Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Özet
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowSummarySettingsModal(true)}
                  title="AI Ayarları"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {!aiSummary && !generatingSummary && (
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100"
                onClick={handleGenerateSummary}
                disabled={!conversation.messages?.length}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Konuşmayı Özetle
              </Button>
            )}

            {generatingSummary && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  <span className="text-sm text-purple-700">
                    AI özet oluşturuluyor...
                  </span>
                </div>
              </div>
            )}

            {aiSummary && !generatingSummary && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100 space-y-3">
                {/* Summary Text */}
                <p className="text-sm text-slate-700 leading-relaxed">
                  {aiSummary.summary || aiSummary.ozet}
                </p>

                {/* Service Type */}
                {(aiSummary.serviceType || aiSummary.hizmetTuru) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Hizmet:</span>
                    <Badge
                      variant="outline"
                      className="bg-white text-purple-700 border-purple-200 text-xs"
                    >
                      {aiSummary.serviceType || aiSummary.hizmetTuru}
                    </Badge>
                  </div>
                )}

                {/* Products/Services */}
                {((aiSummary.products && aiSummary.products.length > 0) ||
                  (aiSummary.urunler && aiSummary.urunler.length > 0)) && (
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">
                      Bahsi Geçen Ürünler:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(aiSummary.products || aiSummary.urunler || []).map(
                        (product, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-white text-slate-700 border-slate-200"
                            title={
                              typeof product === "object" ? product.detail : ""
                            }
                          >
                            {typeof product === "object"
                              ? product.name
                              : product}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Current Stage */}
                {(aiSummary.currentStage || aiSummary.mevcutAsama) && (
                  <div className="flex items-start gap-2 pt-2 border-t border-purple-100">
                    <span className="text-xs text-slate-500 shrink-0">
                      Aşama:
                    </span>
                    <span className="text-xs text-slate-700">
                      {aiSummary.currentStage || aiSummary.mevcutAsama}
                    </span>
                  </div>
                )}

                {/* Next Step */}
                {(aiSummary.nextStep || aiSummary.sonrakiAdim) && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-slate-500 shrink-0">
                      Sonraki:
                    </span>
                    <span className="text-xs text-slate-700">
                      {aiSummary.nextStep || aiSummary.sonrakiAdim}
                    </span>
                  </div>
                )}

                {/* Regenerate Button */}
                <div className="pt-2 border-t border-purple-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    onClick={handleGenerateSummary}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Yeniden Oluştur
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Linked Case */}
          {conversation.caseId && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                Bağlı Talep
              </h3>
              <Button
                variant="outline"
                className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                asChild
              >
                <Link href={`/admin/crm-v2/cases/${conversation.caseId}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Talebi Görüntüle
                </Link>
              </Button>
            </div>
          )}

          {/* Original Data */}
          {conversation.originalData && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Orijinal Veriler
              </h3>
              <div className="text-xs bg-slate-50 p-3 rounded-xl overflow-auto max-h-48 border border-slate-100">
                <pre className="text-slate-600">
                  {JSON.stringify(conversation.originalData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Convert to Case Modal */}
      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Talep Oluştur</DialogTitle>
            <DialogDescription>
              Bu konuşmadan yeni bir talep oluşturun.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input
                value={convertForm.title}
                onChange={(e) =>
                  setConvertForm({ ...convertForm, title: e.target.value })
                }
                placeholder="Talep başlığı"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tür</Label>
                <Select
                  value={convertForm.type}
                  onValueChange={(v) =>
                    setConvertForm({ ...convertForm, type: v })
                  }
                >
                  <SelectTrigger>
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
                <Label>Öncelik</Label>
                <Select
                  value={convertForm.priority}
                  onValueChange={(v) =>
                    setConvertForm({ ...convertForm, priority: v })
                  }
                >
                  <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConvertModal(false)}
            >
              İptal
            </Button>
            <Button onClick={handleConvertToCase} disabled={!convertForm.title || creatingCase}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konuşmayı Ertele</DialogTitle>
            <DialogDescription>
              Bu konuşma belirtilen zamana kadar inbox'tan gizlenecek.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSnooze(addHours(new Date(), 3))}
            >
              <Clock className="h-4 w-4 mr-2" />3 saat sonra
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSnooze(addDays(new Date(), 1))}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Yarın
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSnooze(addDays(new Date(), 3))}
            >
              <Calendar className="h-4 w-4 mr-2" />3 gün sonra
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSnooze(addDays(new Date(), 7))}
            >
              <Calendar className="h-4 w-4 mr-2" />1 hafta sonra
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSnoozeModal(false)}>
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Reply Templates Modal */}
      <Dialog open={showQuickReplyModal} onOpenChange={setShowQuickReplyModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hazır Yanıt Şablonları</DialogTitle>
            <DialogDescription>
              Sık kullanılan yanıt şablonlarından birini seçin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            {/* Firestore config'den gelen quick templates veya default */}
            {(
              unifiedConfig?.quickTemplates || [
                {
                  title: "Teşekkür Mesajı",
                  content:
                    "Değerli Müşterimiz,\n\nBize ulaştığınız için teşekkür ederiz. Talebiniz tarafımıza ulaşmıştır ve en kısa sürede sizinle iletişime geçeceğiz.\n\nSaygılarımızla,\nMKN Group",
                },
                {
                  title: "Bilgi Talebi",
                  content:
                    "Sayın Müşterimiz,\n\nTalebinizi daha iyi değerlendirebilmemiz için aşağıdaki bilgilere ihtiyacımız bulunmaktadır:\n\n- Ürün detayları\n- Miktar bilgisi\n- Tercih ettiğiniz teslimat süresi\n\nBu bilgileri ilettiğinizde size detaylı fiyat teklifimizi sunacağız.\n\nSaygılarımızla,\nMKN Group",
                },
                {
                  title: "Fiyat Teklifi Bildirimi",
                  content:
                    "Değerli Müşterimiz,\n\nTalebiniz doğrultusunda fiyat teklifimizi hazırladık. Ekte sunulan teklifimizi incelemenizi rica ederiz.\n\nSorularınız için bize ulaşabilirsiniz.\n\nSaygılarımızla,\nMKN Group",
                },
                {
                  title: "Üretim Süreci Bilgilendirmesi",
                  content:
                    "Sayın Müşterimiz,\n\nSiparişiniz üretim sürecine alınmıştır. Tahmini teslim süresi [X] iş günüdür.\n\nÜretim süreci hakkında herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.\n\nSaygılarımızla,\nMKN Group",
                },
                {
                  title: "Numune Gönderimi",
                  content:
                    "Değerli Müşterimiz,\n\nTalebiniz doğrultusunda numunelerimiz hazırlanmıştır. Kargo takip numarası ve detayları en kısa sürede tarafınıza iletilecektir.\n\nSaygılarımızla,\nMKN Group",
                },
              ]
            ).map((template, idx) => (
              <div
                key={idx}
                className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => {
                  setReplyContent(template.content);
                  setIsAiGenerated(false);
                  setAiMetadata(null);
                  setShowQuickReplyModal(false);
                }}
              >
                <h4 className="font-medium text-slate-800 mb-2">
                  {template.title}
                </h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">
                  {template.content}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowQuickReplyModal(false)}
            >
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Settings Dialog */}
      <Dialog open={showAISettingsModal} onOpenChange={setShowAISettingsModal}>
        <DialogContent className="sm:max-w-[560px] p-0 gap-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-slate-900 text-lg font-bold">
                    AI Yanıt Ayarları
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 text-sm">
                    Model, prompt ve token ayarları
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Tabs */}
          <Tabs
            value={aiSettingsTab}
            onValueChange={setAISettingsTab}
            className="w-full"
          >
            <div className="px-6 py-3 bg-slate-50/50">
              <TabsList className="w-full grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg h-10">
                <TabsTrigger
                  value="config"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  Ayarlar
                </TabsTrigger>
                <TabsTrigger
                  value="prompt"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Prompt
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Config Tab */}
            <TabsContent value="config" className="mt-0 focus:outline-none">
              <ScrollArea className="h-[400px]">
                <div className="p-6 space-y-5">
                  {/* Hibrit Prompt Modu Bilgisi */}
                  {(() => {
                    const messageCount = conversation?.messages?.length || 0;
                    const isFirstMessage = messageCount <= 1;
                    return (
                      <div
                        className={`rounded-xl border overflow-hidden ${
                          isFirstMessage
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-blue-200 bg-blue-50/50"
                        }`}
                      >
                        <div
                          className={`px-4 py-3 border-b ${
                            isFirstMessage
                              ? "border-emerald-100 bg-emerald-50"
                              : "border-blue-100 bg-blue-50"
                          }`}
                        >
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            <Sparkles
                              className={`h-3.5 w-3.5 ${
                                isFirstMessage
                                  ? "text-emerald-500"
                                  : "text-blue-500"
                              }`}
                            />
                            Hibrit Prompt Modu
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${
                                isFirstMessage
                                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                  : "bg-gradient-to-br from-blue-400 to-blue-600"
                              }`}
                            >
                              {isFirstMessage ? (
                                <MessageSquarePlus className="h-5 w-5 text-white" />
                              ) : (
                                <MessageSquare className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900">
                                {isFirstMessage
                                  ? "İlk Karşılama Promptu"
                                  : "Devam Yanıtı Promptu"}
                              </p>
                              <p className="text-sm text-slate-500">
                                {isFirstMessage
                                  ? "Sıcak, profesyonel karşılama (max 100 kelime)"
                                  : "Bağlam farkında, akıllı yanıt (80-120 kelime)"}
                              </p>
                            </div>
                            <Badge
                              className={`border-0 text-xs ${
                                isFirstMessage
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {messageCount} mesaj
                            </Badge>
                          </div>
                          <div
                            className={`mt-3 pt-3 border-t text-xs ${
                              isFirstMessage
                                ? "border-emerald-100 text-emerald-700"
                                : "border-blue-100 text-blue-700"
                            }`}
                          >
                            <code className="font-mono bg-white/50 px-2 py-1 rounded">
                              {isFirstMessage
                                ? "crm_communication"
                                : "crm_communication_continuation"}
                            </code>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Active Model Card */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Aktif Model
                      </p>
                    </div>
                    <div className="p-4">
                      {configLoading ? (
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-11 h-11 rounded-xl" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-40 mb-2" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                                PROVIDER_INFO[currentProvider?.id]?.gradient ||
                                "from-slate-400 to-slate-500"
                              } flex items-center justify-center shadow-md`}
                            >
                              <span className="text-xl">
                                {PROVIDER_INFO[currentProvider?.id]?.icon ||
                                  "🤖"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {currentModel?.displayName ||
                                  currentModel?.name ||
                                  "Model seçilmedi"}
                              </p>
                              <p className="text-sm text-slate-500">
                                {PROVIDER_INFO[currentProvider?.id]?.name ||
                                  currentProvider?.id ||
                                  "Provider"}
                              </p>
                            </div>
                            {currentModel?.isDefault && (
                              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                Varsayılan
                              </Badge>
                            )}
                          </div>

                          {/* Model Selection */}
                          {availableModels?.length > 1 && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <Label className="text-xs text-slate-500 mb-2 block">
                                Model Seç
                              </Label>
                              <Select
                                value={
                                  currentModel?.modelId || currentModel?.id
                                }
                                onValueChange={(val) => selectModel(val)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Model seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableModels.map((model) => (
                                    <SelectItem
                                      key={model.modelId || model.id}
                                      value={model.modelId || model.id}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {PROVIDER_INFO[model.provider]
                                            ?.icon || "🤖"}
                                        </span>
                                        <span>
                                          {model.displayName || model.name}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Model Stats */}
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />
                              <span>{currentModel?.speed || "Normal"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Brain className="h-3.5 w-3.5 text-purple-500" />
                              <span>{availableModels?.length || 0} model</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Token Settings */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Token Limiti
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs ${
                            modelSettings.autoMaxTokens
                              ? "text-purple-600 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          Otomatik
                        </span>
                        <Switch
                          checked={modelSettings.autoMaxTokens}
                          onCheckedChange={(checked) =>
                            setModelSettings((prev) => ({
                              ...prev,
                              autoMaxTokens: checked,
                            }))
                          }
                          className="scale-90"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      {modelSettings.autoMaxTokens ? (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-purple-900">
                              Otomatik ayarlama aktif
                            </p>
                            <p className="text-xs text-purple-600">
                              Firestore config:{" "}
                              {unifiedConfig?.settings?.maxTokens?.toLocaleString() ||
                                2048}{" "}
                              token
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={modelSettings.maxTokens}
                              onChange={(e) =>
                                setModelSettings((prev) => ({
                                  ...prev,
                                  maxTokens: parseInt(e.target.value) || 1000,
                                }))
                              }
                              min={500}
                              max={8000}
                              step={256}
                              className="flex-1 h-10 rounded-lg border-slate-200 text-center font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {[1024, 2048, 4096, 8000].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() =>
                                  setModelSettings((prev) => ({
                                    ...prev,
                                    maxTokens: val,
                                  }))
                                }
                                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                                  modelSettings.maxTokens === val
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {val >= 1000
                                  ? `${(val / 1000).toFixed(
                                      val % 1000 === 0 ? 0 : 1,
                                    )}K`
                                  : val}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Yaratıcılık (Temperature)
                      </p>
                      <span className="text-sm font-bold text-purple-600 font-mono">
                        {modelSettings.temperature.toFixed(1)}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={modelSettings.temperature}
                          onChange={(e) =>
                            setModelSettings((prev) => ({
                              ...prev,
                              temperature: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between mt-3 text-xs">
                        <span className="text-blue-600 font-medium">
                          Tutarlı
                        </span>
                        <span className="text-purple-600 font-medium">
                          Dengeli
                        </span>
                        <span className="text-pink-600 font-medium">
                          Yaratıcı
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tone Options */}
                  {unifiedConfig?.toneOptions && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Yanıt Tonları (Config)
                        </p>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(unifiedConfig.toneOptions).map(
                            ([key, value]) => {
                              // value object veya string olabilir
                              const label =
                                typeof value === "object" ? value.label : key;
                              const description =
                                typeof value === "object"
                                  ? value.promptSuffix ||
                                    value.description ||
                                    ""
                                  : value;

                              return (
                                <div
                                  key={key}
                                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                                    aiTone === key
                                      ? "border-purple-300 bg-purple-50"
                                      : "border-slate-200 hover:border-slate-300"
                                  }`}
                                  onClick={() => setAiTone(key)}
                                >
                                  <p className="text-sm font-medium text-slate-800">
                                    {label}
                                  </p>
                                  {description && (
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                      {description}
                                    </p>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Prompt Tab - Hibrit Sistem */}
            <TabsContent value="prompt" className="mt-0 focus:outline-none">
              <ScrollArea className="h-[400px]" style={{ width: "100%" }}>
                <div
                  className="p-6 space-y-4"
                  style={{ maxWidth: "100%", overflow: "hidden" }}
                >
                  {/* Hibrit Prompt Seçici */}
                  {(() => {
                    const messageCount = conversation?.messages?.length || 0;
                    const isFirstMessage = messageCount <= 1;
                    const activePromptKey = isFirstMessage
                      ? "crm_communication"
                      : "crm_communication_continuation";

                    return (
                      <>
                        {/* Prompt Seçim Kartları */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {/* İlk Karşılama Promptu */}
                          <div
                            className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
                              isFirstMessage
                                ? "border-emerald-400 bg-emerald-50 shadow-md"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                  isFirstMessage
                                    ? "bg-emerald-500"
                                    : "bg-slate-300"
                                }`}
                              >
                                <MessageSquarePlus className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  isFirstMessage
                                    ? "text-emerald-700"
                                    : "text-slate-500"
                                }`}
                              >
                                İlk Karşılama
                              </span>
                              {isFirstMessage && (
                                <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 h-4 ml-auto">
                                  AKTİF
                                </Badge>
                              )}
                            </div>
                            <p
                              className={`text-[10px] ${
                                isFirstMessage
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              Sıcak karşılama • Max 100 kelime
                            </p>
                          </div>

                          {/* Devam Yanıtı Promptu */}
                          <div
                            className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
                              !isFirstMessage
                                ? "border-blue-400 bg-blue-50 shadow-md"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                  !isFirstMessage
                                    ? "bg-blue-500"
                                    : "bg-slate-300"
                                }`}
                              >
                                <MessageSquare className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  !isFirstMessage
                                    ? "text-blue-700"
                                    : "text-slate-500"
                                }`}
                              >
                                Devam Yanıtı
                              </span>
                              {!isFirstMessage && (
                                <Badge className="bg-blue-500 text-white text-[9px] px-1.5 py-0 h-4 ml-auto">
                                  AKTİF
                                </Badge>
                              )}
                            </div>
                            <p
                              className={`text-[10px] ${
                                !isFirstMessage
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }`}
                            >
                              Akıllı bağlam • 80-120 kelime
                            </p>
                          </div>
                        </div>

                        {/* Mesaj Sayısı Bilgisi */}
                        <div
                          className={`text-center py-2 px-3 rounded-lg text-xs ${
                            isFirstMessage
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          Bu konuşmada <strong>{messageCount}</strong> mesaj var
                          →
                          <code className="ml-1 bg-white/50 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {activePromptKey}
                          </code>{" "}
                          kullanılacak
                        </div>
                      </>
                    );
                  })()}

                  {firestorePrompt ? (
                    <>
                      {/* Prompt Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          {firestorePrompt.name && (
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs font-medium">
                              {firestorePrompt.name}
                            </Badge>
                          )}
                          {firestorePrompt.version && (
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              v{firestorePrompt.version}
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyPrompt(
                              firestorePrompt?.systemPrompt ||
                                firestorePrompt?.content ||
                                "",
                            )
                          }
                          className="h-8 px-3 text-xs rounded-lg hover:bg-slate-100 flex-shrink-0"
                        >
                          {copiedPrompt ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />{" "}
                              Kopyalandı
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1.5" /> Kopyala
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Aktif Değişkenler Paneli */}
                      <div className="rounded-xl border border-emerald-200 overflow-hidden bg-emerald-50/50">
                        <div
                          className="px-3 py-2 bg-emerald-100 border-b border-emerald-200 flex items-center justify-between cursor-pointer"
                          onClick={() => setShowVariablesPanel((prev) => !prev)}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-[11px] font-semibold text-emerald-700">
                              Aktif Değişkenler
                            </span>
                            <Badge className="bg-emerald-200 text-emerald-800 text-[9px] px-1.5 py-0 h-4">
                              {Object.keys(currentPromptVariables).length} adet
                            </Badge>
                          </div>
                          <span className="text-emerald-600 text-xs">
                            {showVariablesPanel ? "▲" : "▼"}
                          </span>
                        </div>
                        {showVariablesPanel && (
                          <div className="p-3 space-y-2 max-h-48 overflow-auto">
                            {Object.entries(currentPromptVariables).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex gap-2 text-[11px]"
                                >
                                  <code className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                                    {`{{${key}}}`}
                                  </code>
                                  <span
                                    className={`text-slate-600 truncate ${
                                      value ? "" : "italic text-slate-400"
                                    }`}
                                  >
                                    {value
                                      ? value.length > 60
                                        ? value.substring(0, 60) + "..."
                                        : value
                                      : "(boş)"}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>

                      {/* System Prompt */}
                      <div
                        className="rounded-xl border border-slate-700 overflow-hidden"
                        style={{ maxWidth: "100%" }}
                      >
                        <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-[11px] text-slate-400 ml-1 font-mono">
                            system_prompt
                          </span>
                        </div>
                        <div
                          className="bg-slate-900 p-4 overflow-auto max-h-64"
                          style={{ maxWidth: "100%" }}
                        >
                          <pre
                            style={{
                              margin: 0,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              fontSize: "12px",
                              lineHeight: "1.6",
                              color: "#f3f4f6",
                              fontFamily:
                                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                            }}
                          >
                            {firestorePrompt.systemPrompt ||
                              firestorePrompt.content ||
                              "Prompt bulunamadı"}
                          </pre>
                        </div>
                      </div>

                      {/* User Prompt Template - Değişkenlerle doldurulmuş */}
                      {firestorePrompt.userPromptTemplate && (
                        <div
                          className="rounded-xl border border-purple-800 overflow-hidden"
                          style={{ maxWidth: "100%" }}
                        >
                          <div className="px-3 py-2 bg-purple-900 border-b border-purple-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                              </div>
                              <span className="text-[11px] text-purple-300 ml-1 font-mono">
                                user_prompt{" "}
                                {showFilledPrompt
                                  ? "(değişkenler dolu)"
                                  : "(template)"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-purple-400">
                                {showFilledPrompt ? "Dolu" : "Template"}
                              </span>
                              <Switch
                                checked={showFilledPrompt}
                                onCheckedChange={setShowFilledPrompt}
                                className="scale-75"
                              />
                            </div>
                          </div>
                          <div
                            className="bg-purple-950 p-4 overflow-auto max-h-64"
                            style={{ maxWidth: "100%" }}
                          >
                            <pre
                              style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                fontSize: "12px",
                                lineHeight: "1.6",
                                color: "#f3e8ff",
                                fontFamily:
                                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                              }}
                            >
                              {showFilledPrompt
                                ? replacePromptVariables(
                                    firestorePrompt.userPromptTemplate,
                                    currentPromptVariables,
                                  )
                                : firestorePrompt.userPromptTemplate}
                            </pre>
                          </div>
                          {/* Variables info */}
                          {showFilledPrompt &&
                            currentPromptVariables.user_instruction && (
                              <div className="px-3 py-2 bg-amber-900/50 border-t border-amber-800/50 flex items-center gap-2">
                                <Zap className="h-3 w-3 text-amber-400" />
                                <span className="text-[10px] text-amber-300">
                                  Operatör Talimatı: "
                                  {currentPromptVariables.user_instruction.substring(
                                    0,
                                    50,
                                  )}
                                  {currentPromptVariables.user_instruction
                                    .length > 50
                                    ? "..."
                                    : ""}
                                  "
                                </span>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Description */}
                      {firestorePrompt.description && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-800 leading-relaxed">
                            {firestorePrompt.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : configLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-4" />
                      <p className="text-slate-600 font-medium">
                        Prompt yükleniyor...
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Firestore'dan veri alınıyor
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">
                        Prompt bulunamadı
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        CRM Email Reply prompt'u Firestore'da tanımlı değil
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Context:{" "}
              <span className="font-mono text-slate-500">
                {AI_CONTEXTS.CRM_EMAIL_REPLY}
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => refreshAIConfig()}
                className="rounded-lg hover:bg-slate-200"
              >
                <Loader2
                  className={`h-3.5 w-3.5 mr-1.5 ${
                    configLoading ? "animate-spin" : ""
                  }`}
                />
                Yenile
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAISettingsModal(false)}
                className="rounded-lg hover:bg-slate-200"
              >
                Kapat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gönderim Kanalı Seçimi Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Mesaj Gönderimi
            </DialogTitle>
            <DialogDescription>
              Mesajın gönderileceği kanalları seçin. Birden fazla kanal
              seçebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            {/* Alıcı Bilgisi */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-slate-700">Alıcı:</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {conversation?.sender?.name || "İsimsiz"}
                </span>
              </div>
              {conversation?.sender?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {conversation?.sender?.email}
                  </span>
                </div>
              )}
              {conversation?.sender?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {conversation?.sender?.phone}
                  </span>
                </div>
              )}
            </div>

            {/* Ek Dosyalar */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Ekler ({attachments.length})
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {attachment.type === 'file' ? (
                          <FileIcon className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        ) : attachment.type === 'proforma' ? (
                          <Receipt className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        ) : attachment.type === 'contract' ? (
                          <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Calculator className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {attachment.name}
                          </p>
                          {attachment.size && (
                            <p className="text-xs text-slate-500">
                              {formatFileSize(attachment.size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-red-500"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kanal Seçimleri */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                Gönderim Kanalları:
              </p>

              {/* Outlook Email */}
              <label
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                  sendChannels.email
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300",
                  !conversation?.sender?.email &&
                    "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      sendChannels.email
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Outlook E-posta
                    </p>
                    <p className="text-xs text-slate-500">
                      {conversation?.sender?.email || "E-posta adresi yok"}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendChannels.email}
                  disabled={!conversation?.sender?.email}
                  onChange={(e) =>
                    setSendChannels((prev) => ({
                      ...prev,
                      email: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              {/* WhatsApp */}
              <label
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                  sendChannels.whatsapp
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      sendChannels.whatsapp
                        ? "bg-green-500 text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">WhatsApp</p>
                    <p className="text-xs text-slate-500">
                      {editableWhatsappPhone ? `+${editableWhatsappPhone}` : "Telefon numarası yok"}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendChannels.whatsapp}
                  onChange={(e) =>
                    setSendChannels((prev) => ({
                      ...prev,
                      whatsapp: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
              </label>
              
              {/* WhatsApp Telefon Numarası Düzenleme */}
              {sendChannels.whatsapp && (
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <Label className="text-xs text-slate-700 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    WhatsApp Numarası (E.164 formatı)
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="px-3 py-2 bg-slate-200 text-slate-600 text-sm rounded-l-md border border-r-0 border-slate-300">
                          +
                        </span>
                        <Input
                          type="text"
                          value={editableWhatsappPhone}
                          onChange={(e) => {
                            // Sadece rakamları kabul et
                            const value = e.target.value.replace(/\D/g, '');
                            setEditableWhatsappPhone(value);
                            // Doğrulama
                            const validation = validateWhatsAppPhone(value);
                            setWhatsappPhoneError(validation.valid ? null : validation.message);
                          }}
                          placeholder="905551234567"
                          className={cn(
                            "rounded-l-none",
                            whatsappPhoneError && "border-red-500 focus:ring-red-500"
                          )}
                        />
                      </div>
                      {whatsappPhoneError && (
                        <p className="text-xs text-red-600 mt-1">{whatsappPhoneError}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Ülke kodu dahil tam numara girin. Örn: Türkiye 905xx, Almanya 49xxx, ABD 1xxx
                  </p>
                </div>
              )}
              
              {/* WhatsApp 24 Saat Kuralı Uyarısı */}
              {sendChannels.whatsapp && whatsappWindowStatus && (
                <div className={cn(
                  "p-3 rounded-lg border",
                  whatsappWindowStatus.requiresTemplate 
                    ? "bg-amber-50 border-amber-200" 
                    : "bg-green-50 border-green-200"
                )}>
                  {checkingWhatsappWindow ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      24 saat penceresi kontrol ediliyor...
                    </div>
                  ) : whatsappWindowStatus.requiresTemplate ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            {whatsappWindowStatus.isFirstContact 
                              ? "İlk WhatsApp İletişimi" 
                              : "24 Saat Penceresi Kapandı"}
                          </p>
                          <p className="text-xs text-amber-700">
                            {whatsappWindowStatus.reason || "Son müşteri mesajından 24 saat geçtiği için sadece şablon mesaj gönderilebilir."}
                          </p>
                        </div>
                      </div>
                      
                      {/* Template Seçimi */}
                      <div className="space-y-3">
                        <Label className="text-xs text-amber-800">Şablon Seçin:</Label>
                        {loadingTemplates ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Şablonlar yükleniyor...
                          </div>
                        ) : whatsappTemplates.length > 0 ? (
                          <>
                            <Select
                              value={selectedWhatsappTemplate?.name || ""}
                              onValueChange={(value) => {
                                const template = whatsappTemplates.find(t => t.name === value);
                                setSelectedWhatsappTemplate(template);
                                if (template) {
                                  autoFillTemplateVariables(template, setTemplateVariables);
                                }
                              }}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Şablon seçin..." />
                              </SelectTrigger>
                              <SelectContent>
                                {whatsappTemplates.map((template) => (
                                  <SelectItem key={template.name} value={template.name}>
                                    <div className="flex flex-col">
                                      <span>{template.name}</span>
                                      <span className="text-xs text-slate-500">{template.category}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {/* Seçili şablon için değişkenler */}
                            {selectedWhatsappTemplate && (
                              <div className="space-y-3 mt-3 p-3 border border-amber-200 rounded-lg bg-white">
                                {/* Header değişkeni */}
                                {getTemplateVariables(selectedWhatsappTemplate).header && (
                                  <div>
                                    <Label className="text-xs text-slate-600 flex items-center gap-1">
                                      Başlık Değişkeni
                                      <span className="text-slate-400">{`{{1}}`}</span>
                                    </Label>
                                    <Input
                                      placeholder="Başlık değeri"
                                      value={templateVariables.header || ""}
                                      onChange={(e) => setTemplateVariables({ ...templateVariables, header: e.target.value })}
                                      className="mt-1 h-8 text-sm"
                                    />
                                  </div>
                                )}
                                
                                {/* Body değişkenleri */}
                                {getTemplateVariables(selectedWhatsappTemplate).body.map((varNum, idx) => {
                                  const suggestions = getVariableSuggestions(selectedWhatsappTemplate, varNum, idx);
                                  const label = suggestions.length > 0 ? suggestions[0].label : `Değişken ${varNum}`;
                                  return (
                                    <div key={idx}>
                                      <Label className="text-xs text-slate-600 flex items-center gap-1">
                                        {label}
                                        <span className="text-slate-400">{`{{${varNum}}}`}</span>
                                      </Label>
                                      <Input
                                        placeholder={label}
                                        value={templateVariables.body?.[idx] || ""}
                                        onChange={(e) => {
                                          const newBody = [...(templateVariables.body || [])];
                                          newBody[idx] = e.target.value;
                                          setTemplateVariables({ ...templateVariables, body: newBody });
                                        }}
                                        className="mt-1 h-8 text-sm"
                                      />
                                    </div>
                                  );
                                })}
                                
                                {/* Canlı önizleme */}
                                <div className="mt-3">
                                  <Label className="text-xs text-slate-600 flex items-center gap-1 mb-2">
                                    <Eye className="h-3 w-3" />
                                    Önizleme
                                  </Label>
                                  <div className="bg-[#e5ddd5] rounded-lg p-2">
                                    <div className="bg-white rounded-lg p-2 shadow-sm max-w-[90%] ml-auto">
                                      <pre className="text-xs whitespace-pre-wrap font-sans text-gray-800">
                                        {getLivePreview(selectedWhatsappTemplate, templateVariables)}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-amber-700">
                            Onaylı şablon bulunamadı. WhatsApp Admin panelinden şablon oluşturun.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          24 Saat Penceresi Açık
                        </p>
                        <p className="text-xs text-green-700">
                          Kalan süre: {whatsappWindowStatus.remainingMinutes} dakika
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manuel Kayıt */}
              <label
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                  sendChannels.manual
                    ? "border-slate-500 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      sendChannels.manual
                        ? "bg-slate-600 text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Manuel Kayıt</p>
                    <p className="text-xs text-slate-500">
                      Sadece CRM'e kaydet, dışarı gönderme
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendChannels.manual}
                  onChange={(e) =>
                    setSendChannels((prev) => ({
                      ...prev,
                      manual: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                />
              </label>
            </div>

            {/* Bilgi Notu */}
            {sendChannels.email && conversation?.channel === "email" && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  E-posta, mevcut konuşma zincirine (thread) yanıt olarak
                  gönderilecek.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSendModal(false);
                setPendingSendMessageId(null);
                setWhatsappWindowStatus(null);
                setSelectedWhatsappTemplate(null);
                setTemplateVariables({ header: "", body: [] });
                setEditableWhatsappPhone('');
                setWhatsappPhoneError(null);
              }}
              disabled={sendingMessage}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirmSend}
              disabled={
                sendingMessage || 
                (!sendChannels.email && !sendChannels.whatsapp && !sendChannels.manual) ||
                (sendChannels.whatsapp && whatsappWindowStatus?.requiresTemplate && !selectedWhatsappTemplate) ||
                (sendChannels.whatsapp && whatsappPhoneError)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingMessage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calculation Options Modal - Maliyet Detayları Seçimi */}
      <Dialog open={showCalcOptionsModal} onOpenChange={(open) => {
        if (!open) {
          setShowCalcOptionsModal(false);
          setPendingCalculation(null);
          setAddingDocumentId(null);
        }
      }}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-500" />
              PDF Ayarları
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {pendingCalculation?.productName || "Hesaplama"} için PDF oluşturma seçeneklerini belirleyin.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Maliyet Detayları Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="space-y-0.5">
                <Label htmlFor="calcCostDetails" className="text-sm font-medium text-slate-900">
                  Maliyet Detayları
                </Label>
                <p className="text-xs text-slate-500">
                  Hammadde maliyetlerini ve kar marjını göster
                </p>
              </div>
              <Switch
                id="calcCostDetails"
                checked={calcShowCostDetails}
                onCheckedChange={setCalcShowCostDetails}
              />
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Maliyet detayları kapatıldığında PDF'te sadece satış fiyatı görünür. Müşteriye gönderilecek tekliflerde bu seçeneği kapalı tutmanız önerilir.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCalcOptionsModal(false);
                setPendingCalculation(null);
                setAddingDocumentId(null);
              }}
            >
              İptal
            </Button>
            <Button
              onClick={async () => {
                if (pendingCalculation) {
                  setShowCalcOptionsModal(false);
                  setAddingDocumentId(pendingCalculation.id);
                  await handleAddLinkedDocument('calculation', pendingCalculation, {
                    skipModal: true,
                    showCostDetails: calcShowCostDetails
                  });
                  setAddingDocumentId(null);
                  setPendingCalculation(null);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              PDF Oluştur ve Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Picker Modal - Bağlı Belgelerden Seç */}
      <Dialog open={showDocumentPicker} onOpenChange={setShowDocumentPicker}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              Belgelerden Seç
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {linkedCompany ? (
                <>
                  <span className="font-medium text-blue-600">{linkedCompany.name}</span> firmasına ait belgeleri e-postaya ekleyin.
                </>
              ) : (
                "Müşteriye bağlı firma belgeleri"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {documentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {/* Proformas Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-blue-500" />
                    Proformalar
                    <Badge variant="secondary" className="ml-1 bg-blue-50 text-blue-700 text-xs">
                      {linkedDocuments.proformas.length}
                    </Badge>
                  </h4>
                  {linkedDocuments.proformas.length === 0 ? (
                    <p className="text-sm text-slate-400 py-2 pl-6">Proforma bulunamadı</p>
                  ) : (
                    <div className="space-y-1 pl-6">
                      {linkedDocuments.proformas.map((proforma) => (
                        <div
                          key={proforma.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Receipt className="h-4 w-4 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {proforma.proformaNumber || `#${proforma.id.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-slate-400">
                                {safeFormatDate(proforma.createdAt, "dd MMM yyyy")}
                                {proforma.totals?.grandTotal && (
                                  <span className="ml-2 text-emerald-600">
                                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(proforma.totals.grandTotal)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                proforma.status === "accepted" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                proforma.status === "sent" && "bg-blue-50 text-blue-700 border-blue-200",
                                proforma.status === "draft" && "bg-slate-50 text-slate-600 border-slate-200"
                              )}
                            >
                              {PROFORMA_STATUS_LABELS[proforma.status] || proforma.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={addingDocumentId !== null}
                              onClick={async () => {
                                setAddingDocumentId(proforma.id);
                                await handleAddLinkedDocument('proforma', proforma);
                                setAddingDocumentId(null);
                              }}
                              className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {addingDocumentId === proforma.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Paperclip className="h-3.5 w-3.5 mr-1" />
                                  Ekle
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contracts Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    Sözleşmeler
                    <Badge variant="secondary" className="ml-1 bg-green-50 text-green-700 text-xs">
                      {linkedDocuments.contracts.length}
                    </Badge>
                  </h4>
                  {linkedDocuments.contracts.length === 0 ? (
                    <p className="text-sm text-slate-400 py-2 pl-6">Sözleşme bulunamadı</p>
                  ) : (
                    <div className="space-y-1 pl-6">
                      {linkedDocuments.contracts.map((contract) => (
                        <div
                          key={contract.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-green-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {contract.contractNumber || `#${contract.id.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-slate-400">
                                {contract.contractType && <span className="mr-2">{contract.contractType}</span>}
                                {safeFormatDate(contract.createdAt, "dd MMM yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                contract.status === "active" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                contract.status === "draft" && "bg-slate-50 text-slate-600 border-slate-200"
                              )}
                            >
                              {contract.status === "active" ? "Aktif" : contract.status === "draft" ? "Taslak" : contract.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={addingDocumentId !== null}
                              onClick={async () => {
                                setAddingDocumentId(contract.id);
                                await handleAddLinkedDocument('contract', contract);
                                setAddingDocumentId(null);
                              }}
                              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {addingDocumentId === contract.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Paperclip className="h-3.5 w-3.5 mr-1" />
                                  Ekle
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calculations Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-purple-500" />
                    Fiyat Hesaplamaları
                    <Badge variant="secondary" className="ml-1 bg-purple-50 text-purple-700 text-xs">
                      {linkedDocuments.calculations.length}
                    </Badge>
                  </h4>
                  {linkedDocuments.calculations.length === 0 ? (
                    <p className="text-sm text-slate-400 py-2 pl-6">Hesaplama bulunamadı</p>
                  ) : (
                    <div className="space-y-1 pl-6">
                      {linkedDocuments.calculations.map((calc) => (
                        <div
                          key={calc.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Calculator className="h-4 w-4 text-purple-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {calc.productName || calc.name || "Hesaplama"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {safeFormatDate(calc.createdAt, "dd MMM yyyy")}
                                {calc.totalCost && (
                                  <span className="ml-2 text-purple-600">
                                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(calc.totalCost)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {calc.productType && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                {calc.productType}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={addingDocumentId !== null}
                              onClick={() => {
                                // Hesaplama için modal açılacak, loading yok
                                handleAddLinkedDocument('calculation', calc);
                              }}
                              className="h-7 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              {addingDocumentId === calc.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Paperclip className="h-3.5 w-3.5 mr-1" />
                                  Ekle
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Empty State */}
                {linkedDocuments.proformas.length === 0 && 
                 linkedDocuments.contracts.length === 0 && 
                 linkedDocuments.calculations.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <FolderOpen className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">Belge bulunamadı</p>
                    <p className="text-sm text-slate-400 mt-1">Bu firmaya ait henüz belge oluşturulmamış.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDocumentPicker(false)}
              className="bg-white border-slate-200 text-slate-600"
            >
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Şablon Direkt Gönderim Modal */}
      <Dialog open={showWhatsAppTemplateModal} onOpenChange={setShowWhatsAppTemplateModal}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              WhatsApp Şablon Gönder
            </DialogTitle>
            <DialogDescription>
              Mesaj yazmadan doğrudan WhatsApp şablonu seçerek gönderim yapın.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            {/* Alıcı Bilgisi */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-slate-700">Alıcı:</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {conversation?.sender?.name || "İsimsiz"}
                </span>
              </div>
            </div>

            {/* Telefon Numarası */}
            <div className="space-y-2">
              <Label className="text-sm text-slate-700 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                WhatsApp Numarası
              </Label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-200 text-slate-600 text-sm rounded-l-md border border-r-0 border-slate-300">
                  +
                </span>
                <Input
                  type="text"
                  value={directTemplatePhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setDirectTemplatePhone(value);
                    const validation = validateWhatsAppPhone(value);
                    setDirectTemplatePhoneError(validation.valid ? null : validation.message);
                  }}
                  placeholder="905551234567"
                  className={cn(
                    "rounded-l-none",
                    directTemplatePhoneError && "border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
              {directTemplatePhoneError && (
                <p className="text-xs text-red-600">{directTemplatePhoneError}</p>
              )}
              <p className="text-xs text-slate-500">
                Ülke kodu dahil tam numara girin. Örn: Türkiye 905xx
              </p>
            </div>

            {/* Şablon Seçimi */}
            <div className="space-y-2">
              <Label className="text-sm text-slate-700 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                WhatsApp Şablonu
              </Label>
              {loadingDirectTemplates ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Şablonlar yükleniyor...
                </div>
              ) : directTemplates.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {directTemplates.map((template) => (
                    <div
                      key={template.name}
                      onClick={() => {
                        setDirectSelectedTemplate(template);
                        autoFillTemplateVariables(template, setDirectTemplateVariables);
                      }}
                      className={cn(
                        "p-3 rounded-lg border-2 cursor-pointer transition-all",
                        directSelectedTemplate?.name === template.name
                          ? "border-green-500 bg-green-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{template.name}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {template.category}
                            </Badge>
                          </div>
                          {/* Template kısa özeti */}
                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                            {template.components?.find(c => c.type === 'BODY')?.text?.slice(0, 60)}...
                          </p>
                        </div>
                        {directSelectedTemplate?.name === template.name && (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Şablon Bulunamadı</p>
                  <p className="text-xs text-slate-500 mt-1">
                    WhatsApp Business'tan onaylı şablon oluşturun.
                  </p>
                </div>
              )}
            </div>

            {/* Seçili şablon için değişkenler ve önizleme */}
            {directSelectedTemplate && (
              <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50/50">
                {/* Değişken Girişleri */}
                {(getTemplateVariables(directSelectedTemplate).header || 
                  getTemplateVariables(directSelectedTemplate).body.length > 0) && (
                  <div className="space-y-3">
                    <Label className="text-sm text-slate-700 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Değişkenler
                    </Label>
                    
                    {/* Header değişkeni */}
                    {getTemplateVariables(directSelectedTemplate).header && (
                      <div>
                        <Label className="text-xs text-slate-600">
                          Başlık Değişkeni <span className="text-slate-400">{`{{1}}`}</span>
                        </Label>
                        <Input
                          placeholder="Başlık değeri"
                          value={directTemplateVariables.header || ""}
                          onChange={(e) => setDirectTemplateVariables({ 
                            ...directTemplateVariables, 
                            header: e.target.value 
                          })}
                          className="mt-1 h-8 text-sm bg-white"
                        />
                      </div>
                    )}
                    
                    {/* Body değişkenleri */}
                    {getTemplateVariables(directSelectedTemplate).body.map((varNum, idx) => {
                      const suggestions = getVariableSuggestions(directSelectedTemplate, varNum, idx);
                      const label = suggestions.length > 0 ? suggestions[0].label : `Değişken ${varNum}`;
                      return (
                        <div key={idx}>
                          <Label className="text-xs text-slate-600">
                            {label} <span className="text-slate-400">{`{{${varNum}}}`}</span>
                          </Label>
                          <Input
                            placeholder={label}
                            value={directTemplateVariables.body?.[idx] || ""}
                            onChange={(e) => {
                              const newBody = [...(directTemplateVariables.body || [])];
                              newBody[idx] = e.target.value;
                              setDirectTemplateVariables({ ...directTemplateVariables, body: newBody });
                            }}
                            className="mt-1 h-8 text-sm bg-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Canlı Önizleme */}
                <div>
                  <Label className="text-sm text-slate-700 flex items-center gap-1 mb-2">
                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                    Önizleme
                  </Label>
                  <div className="bg-[#e5ddd5] rounded-lg p-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm max-w-[90%] ml-auto">
                      <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800">
                        {getLivePreview(directSelectedTemplate, directTemplateVariables)}
                      </pre>
                      <p className="text-[10px] text-gray-400 text-right mt-1">
                        {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowWhatsAppTemplateModal(false);
                setDirectSelectedTemplate(null);
                setDirectTemplateVariables({ header: "", body: [] });
              }}
              disabled={sendingDirectTemplate}
            >
              İptal
            </Button>
            <Button
              onClick={handleSendDirectTemplate}
              disabled={sendingDirectTemplate || !directSelectedTemplate || !directTemplatePhone}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {sendingDirectTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Şablonu Gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Summary Settings Modal - Reusable Component */}
      <AISettingsModal
        open={showSummarySettingsModal}
        onOpenChange={setShowSummarySettingsModal}
        title={summaryConfig?.name || "AI Özet Ayarları"}
        description={
          summaryConfig?.description || "Konuşma özeti üretimi için AI ayarları"
        }
        contextKey={AI_CONTEXTS.CRM_CASE_SUMMARY}
        availableModels={summaryAvailableModels}
        currentModel={summaryCurrentModel}
        currentProvider={summaryCurrentProvider}
        selectModel={selectSummaryModel}
        prompt={quickPromptData || summaryPrompt}
        config={summaryConfig}
        promptVariables={{
          conversation_messages: formatConversationHistory(
            conversation?.messages || [],
            15,
          ),
          customer_name:
            customer?.name || conversation?.sender?.name || "Müşteri",
          customer_company:
            customer?.companyName || conversation?.sender?.company || "",
          subject: conversation?.subject || "Konu belirtilmemiş",
          channel: getChannelLabel(conversation?.channel) || "email",
        }}
        loading={summaryConfigLoading}
        onRefresh={refreshSummaryConfig}
        modelSettings={summaryModelSettings}
        setModelSettings={setSummaryModelSettings}
      />

      {/* WhatsApp Media Upload Dialog */}
      {conversation?.channel === 'whatsapp' && conversation?.channelMetadata?.whatsappConversationId && (
        <MediaUploadDialog
          open={showWhatsAppMediaUpload}
          onOpenChange={setShowWhatsAppMediaUpload}
          conversationId={conversation.channelMetadata.whatsappConversationId}
          recipientPhone={conversation.phone || customer?.phone}
          onMediaSent={() => {
            // Medya gönderildikten sonra konuşmayı yenile
            fetchConversation();
            toast({
              title: "Medya Gönderildi",
              description: "WhatsApp medyanız başarıyla gönderildi",
            });
          }}
        />
      )}
    </div>
  );
}
