"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { useToast } from "../../../../../hooks/use-toast";
// Unified AI Hook - mevcut AI altyapısı
import { useUnifiedAI, AI_CONTEXTS } from "../../../../../hooks/use-unified-ai";
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
  cleanupDuplicateMessages,
} from "../../../../../lib/services/crm-v2/conversation-service";
import { getCustomer } from "../../../../../lib/services/crm-v2/customer-service";
import {
  createCaseFromConversation,
  getCaseByConversationId,
} from "../../../../../lib/services/crm-v2/case-service";
// AI Reply constants (browser-safe)
import {
  REPLY_TONE,
  REPLY_TONE_LABELS,
  replacePromptVariables,
  formatConversationHistory,
} from "../../../../../lib/services/crm-v2/ai-reply-constants";
import {
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
  getCaseTypeLabel,
  getPriorityLabel,
  getMessageStatusLabel,
  getMessageStatusColor,
  getReplyStatusLabel,
  getReplyStatusColor,
  getReplyStatusDot,
  getReplyStatusIcon,
} from "../../../../../lib/services/crm-v2/schema";
import { formatDistanceToNow, format, addDays, addHours } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../../lib/utils";

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

// AI Constants
import {
  PROVIDER_INFO,
  CONTEXT_DISPLAY_NAMES,
} from "../../../../../lib/ai-constants";

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
} from "lucide-react";

/**
 * Email imza bloklarını tespit et ve kes
 * Yaygın imza formatlarını tanır
 */
const removeEmailSignature = (text) => {
  if (!text) return '';
  
  // İmza başlangıç kalıpları - bundan sonrası kesilecek
  const signaturePatterns = [
    // Klasik imza ayırıcıları - normal tire ve em-dash
    /^--\s*$/m,                          // "-- " ile başlayan satır (RFC standart)
    /^-{4,}\s*$/m,                       // 4+ tire (tek satırda)
    /^_{4,}\s*$/m,                       // 4+ alt çizgi (tek satırda)
    /^={4,}\s*$/m,                       // 4+ eşittir (tek satırda)
    /^—{3,}/m,                           // 3+ em-dash (—)
    /^–{3,}/m,                           // 3+ en-dash (–)
    /[-—–_=]{10,}/m,                     // 10+ karışık tire/dash/altçizgi
    
    // Türkçe imza kalıpları - satır sonunu bekleme
    /\n\s*Saygılarımla\s*[\/,.]?\s*(Best regards)?/im,
    /\n\s*Saygılar\s*[\/,.]?/im,
    /\n\s*İyi çalışmalar\s*[\/,.]?/im,
    /\n\s*Sevgilerimle\s*[\/,.]?/im,
    /\n\s*Kolay gelsin\s*[\/,.]?/im,
    /\n\s*Teşekkürler\s*[\/,.]?/im,
    /\n\s*Saygılarımızla\s*[\/,.]?/im,
    
    // İngilizce imza kalıpları
    /\n\s*Best regards\s*[\/,.]?/im,
    /\n\s*Kind regards\s*[\/,.]?/im,
    /\n\s*Regards\s*[\/,.]?/im,
    /\n\s*Thanks\s*[\/,.]?/im,
    /\n\s*Thank you\s*[\/,.]?/im,
    /\n\s*Sincerely\s*[\/,.]?/im,
    /\n\s*Cheers\s*[\/,.]?/im,
    
    // Özel imza bloğu işaretleri
    /^Sent from my iPhone/im,
    /^Sent from my iPad/im,
    /^Sent from my Android/im,
    /^Sent from Samsung/im,
    /^Get Outlook for/im,
  ];
  
  let cleanText = text;
  
  // En erken bulunan imza başlangıcını bul
  let earliestIndex = cleanText.length;
  
  for (const pattern of signaturePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const index = cleanText.indexOf(match[0]);
      // En az 30 karakter içerik kalsın (boş mesaj olmasın)
      if (index > 30 && index < earliestIndex) {
        earliestIndex = index;
      }
    }
  }
  
  // Eğer imza bulunduysa kes
  if (earliestIndex < cleanText.length) {
    cleanText = cleanText.substring(0, earliestIndex).trim();
  }
  
  // Son temizlik - satır sonlarındaki tire/alt çizgi dizilerini kaldır (em-dash dahil)
  cleanText = cleanText
    .replace(/[\-—–_=]{4,}\s*$/gm, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
  
  return cleanText;
};

/**
 * Email alıntılarını (quoted replies) kaldır
 * Farklı email client'larının formatlarını tanır
 */
const removeEmailQuotes = (text) => {
  if (!text) return '';
  
  // Alıntı başlangıç kalıpları (bu satırdan sonrası kesilecek)
  const quotePatterns = [
    // Gmail Türkçe: "Mkn Group <info@mkngroup.com.tr>, 19 Oca 2026 Pzt, 21:54 tarihinde şunu yazdı:"
    /^.*<[^>]+@[^>]+>[^:]*tarihinde şunu yazd[ıi]:\s*$/im,
    // Gmail English: "On Mon, Jan 19, 2026 at 9:54 PM Name <email> wrote:"
    /^On .+wrote:\s*$/im,
    // Outlook: "From: ... Sent: ... To: ... Subject: ..."
    /^From:\s*.+\n.*Sent:\s*.+\n.*To:\s*.+/im,
    // Outlook Türkçe: "Kimden: ... Gönderildi: ... Kime: ..."  
    /^Kimden:\s*.+$/im,
    // Genel alıntı işaretleri
    /^-{3,}\s*(Alıntı|Original Message|Orijinal Mesaj|Forwarded message|İletilmiş mesaj)\s*-{3,}/im,
    // > ile başlayan satırlar (en az 2 ardışık)
    /^(>.*\n){2,}/m,
    // "---- Original Message ----" veya benzeri
    /^-{4,}\s*(Original|Orijinal).*-{4,}/im,
    // "_____" ile başlayan Outlook ayırıcı
    /^_{5,}/m,
    // Email header başlangıcı (genellikle alıntı işareti)
    /^Tarih:\s*\d+/im,  // "Tarih: 20 Ocak 2026"
  ];
  
  let cleanText = text;
  
  // En erken bulunan alıntı başlangıcını bul
  let earliestIndex = cleanText.length;
  
  for (const pattern of quotePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const index = cleanText.indexOf(match[0]);
      // En az 20 karakter içerik kalsın
      if (index > 20 && index < earliestIndex) {
        earliestIndex = index;
      }
    }
  }
  
  // Eğer alıntı bulunduysa kes
  if (earliestIndex < cleanText.length) {
    cleanText = cleanText.substring(0, earliestIndex).trim();
  }
  
  return cleanText.trim();
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
    '<span class="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">[Gömülü Görsel]</span>'
  );

  // Boş src'li görselleri temizle
  sanitized = sanitized.replace(/<img[^>]*src=["']["'][^>]*>/gi, "");
  
  // Script ve style taglarını tamamen kaldır
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Event handler'ları temizle
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');

  return sanitized;
};

/**
 * HTML içeriğinden düz metin çıkar
 * Email'lerde gelen HTML içeriğini temizleyip okunabilir hale getirir
 * Ayrıca email alıntılarını (quoted replies) ve imzaları keser
 */
const stripHtmlToText = (html) => {
  if (!html) return '';
  
  // Zaten düz metin ise alıntıları ve imzaları temizleyip döndür
  if (!html.includes('<') && !html.includes('&')) {
    let cleaned = removeEmailQuotes(html);
    cleaned = removeEmailSignature(cleaned);
    return cleaned;
  }
  
  // Önce alıntı ve imza bloklarını HTML seviyesinde temizle
  let text = html;
  
  // Gmail/Outlook blockquote'ları tamamen kaldır (içeriğiyle birlikte)
  text = text.replace(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi, '');
  // Gmail'in div.gmail_quote yapısını kaldır  
  text = text.replace(/<div[^>]*class="[^"]*gmail_quote[^"]*"[^>]*>[\s\S]*$/gi, '');
  // Gmail'in gmail_extra yapısını kaldır
  text = text.replace(/<div[^>]*class="[^"]*gmail_extra[^"]*"[^>]*>[\s\S]*$/gi, '');
  // Gmail'in gmail_signature yapısını kaldır
  text = text.replace(/<div[^>]*class="[^"]*gmail_signature[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  // Outlook'un #divRplyFwdMsg yapısını kaldır
  text = text.replace(/<div[^>]*id="divRplyFwdMsg"[^>]*>[\s\S]*$/gi, '');
  // Outlook'un appendonsend yapısını kaldır
  text = text.replace(/<div[^>]*id="appendonsend"[^>]*>[\s\S]*$/gi, '');
  // Email signature wrapper'larını kaldır
  text = text.replace(/<div[^>]*class="[^"]*signature[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  text = text.replace(/<div[^>]*id="[^"]*signature[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  // Apple Mail signature
  text = text.replace(/<div[^>]*class="[^"]*AppleMailSignature[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Script, style, head taglarını tamamen kaldır
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  text = text.replace(/<meta[^>]*>/gi, '');
  text = text.replace(/<link[^>]*>/gi, '');
  
  // cid: referanslı görselleri placeholder ile değiştir
  text = text.replace(/<img[^>]*src=["']cid:[^"']*["'][^>]*>/gi, '');
  
  // <hr> taglarını potansiyel bölüm işareti olarak değerlendir
  text = text.replace(/<hr[^>]*>/gi, '\n---HR_MARKER---\n');
  
  // Blok elementleri yeni satıra çevir
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<\/th>/gi, ' ');
  
  // TÜM HTML tag'larını kaldır - agresif regex
  text = text.replace(/<[^>]*>/g, '');
  text = text.replace(/<[a-zA-Z][^>]*$/gm, ''); // Yarım kalan tag'lar
  text = text.replace(/^[^<]*>/gm, ''); // Yarım kapanan tag'lar
  
  // HTML entities decode - kapsamlı liste
  const htmlEntities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&deg;': '°',
    '&bull;': '•',
    '&middot;': '·',
    '&laquo;': '«',
    '&raquo;': '»',
    '&frac12;': '½',
    '&frac14;': '¼',
    '&frac34;': '¾',
    '&times;': '×',
    '&divide;': '÷',
    '&plusmn;': '±',
    '&iexcl;': '¡',
    '&iquest;': '¿',
    '&sect;': '§',
    '&para;': '¶',
    '&dagger;': '†',
    '&Dagger;': '‡',
    '&#160;': ' ',
    '&#8203;': '', // Zero-width space
    '&#8204;': '', // Zero-width non-joiner
    '&#8205;': '', // Zero-width joiner
  };
  
  for (const [entity, char] of Object.entries(htmlEntities)) {
    text = text.replace(new RegExp(entity, 'gi'), char);
  }
  
  // Numeric HTML entities decode
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  // HR marker'ları kontrol et - çok sayıda ise ilk bölümü al
  const hrParts = text.split('---HR_MARKER---');
  if (hrParts.length > 1) {
    // İlk anlamlı bölümü al (en az 30 karakter)
    const meaningfulPart = hrParts.find(part => part.trim().length > 30);
    if (meaningfulPart) {
      text = meaningfulPart;
    } else {
      text = hrParts[0];
    }
  }
  
  // Fazla boşlukları temizle
  text = text
    .replace(/[ \t]+/g, ' ')          // Ardışık boşlukları tek boşluğa indir
    .replace(/\n[ \t]+/g, '\n')       // Satır başı boşlukları temizle
    .replace(/[ \t]+\n/g, '\n')       // Satır sonu boşlukları temizle
    .replace(/\n{3,}/g, '\n\n')       // 3+ yeni satırı 2'ye indir
    .replace(/^[\-—–_=]{4,}\s*$/gm, '') // Sadece tire/em-dash/altçizgi/eşittir olan satırları kaldır
    .replace(/[\-—–_=]{10,}/g, '')   // 10+ karışık tire dizilerini kaldır (inline)
    .replace(/\n{3,}/g, '\n\n')       // Tekrar fazla satırları temizle
    .trim();
  
  // Metin alıntılarını temizle
  text = removeEmailQuotes(text);
  
  // İmza bloklarını temizle
  text = removeEmailSignature(text);
  
  // Son temizlik - kalan tire dizilerini kaldır (em-dash dahil)
  text = text
    .replace(/^[\-—–_=]{4,}\s*$/gm, '')
    .replace(/[\-—–_=]{10,}/g, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
  
  return text;
};

/**
 * İçeriğin HTML olup olmadığını kontrol et
 */
const isHtmlContent = (content) => {
  if (!content) return false;
  // Daha güçlü HTML detection
  return /<[a-z][\s\S]*>/i.test(content) || /&[a-z]+;/i.test(content) || /&#\d+;/.test(content);
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

  // Modals
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showQuickReplyModal, setShowQuickReplyModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [pendingSendMessageId, setPendingSendMessageId] = useState(null);
  const [sendChannels, setSendChannels] = useState({
    email: true,      // Outlook Email - varsayılan aktif
    whatsapp: false,  // WhatsApp - şimdilik devre dışı
    manual: false,    // Sadece CRM'e kaydet
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [convertForm, setConvertForm] = useState({
    title: "",
    type: CASE_TYPE.OTHER,
    priority: PRIORITY.NORMAL,
  });

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
  }, [conversationId, router, toast]);

  // Track previous message count to detect NEW messages only
  const prevMessageCount = useRef(0);

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
      ? [...conversation.messages].reverse().find((m) => m.direction === "inbound")
      : null;

    const customerName = customer?.name || conversation?.from?.name || "Değerli Müşterimiz";
    const customerCompany = customer?.companyName || conversation?.from?.company || "";
    const customerEmail = customer?.email || conversation?.sender?.email || "";
    const agentName = user?.displayName || user?.email?.split("@")[0] || "MKN Group";
    const toneDescription = getToneDescription(aiTone);
    const conversationHistory = formatConversationHistory(conversation?.messages || [], 10);

    return {
      customer_message: lastCustomerMessage?.content || "(Müşteri mesajı yok)",
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
        10
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

      console.log(`[AI Reply] Mesaj sayısı: ${messageCount}, Prompt: ${promptContextKey}`);

      // Mesaj kutusundaki içerik varsa, AI'ya talimat olarak gönder
      const userInstruction = replyContent.trim();

      // Prompt değişkenleri
      const promptVariables = {
        customer_message: lastCustomerMessage.content,
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

      const newMessage = await addMessage(conversationId, messageData);

      setReplyContent("");
      setIsAiGenerated(false);
      setAiMetadata(null);
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

  // Gönderim modalını aç
  const handleOpenSendModal = (messageId) => {
    setPendingSendMessageId(messageId);
    // Müşteri email'i varsa email varsayılan olsun
    const hasEmail = conversation?.sender?.email;
    setSendChannels({
      email: hasEmail ? true : false,
      whatsapp: false,
      manual: !hasEmail, // Email yoksa manuel seçili olsun
    });
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
    
    setSendingMessage(true);
    try {
      const selectedChannels = [];
      if (sendChannels.email) selectedChannels.push('email');
      if (sendChannels.whatsapp) selectedChannels.push('whatsapp');
      if (sendChannels.manual) selectedChannels.push('manual');
      
      // Mesajı onayla ve gönder (kanallarla birlikte)
      await approveAndSendMessage(conversationId, pendingSendMessageId, user?.uid, {
        channels: selectedChannels,
        recipientEmail: conversation?.sender?.email,
        recipientName: conversation?.sender?.name,
        recipientPhone: conversation?.sender?.phone,
        subject: conversation?.subject,
      });
      
      const channelNames = [];
      if (sendChannels.email) channelNames.push('E-posta');
      if (sendChannels.whatsapp) channelNames.push('WhatsApp');
      if (sendChannels.manual) channelNames.push('Manuel kayıt');
      
      toast({
        title: "✅ Gönderildi",
        description: `Mesaj gönderildi: ${channelNames.join(', ')}`,
      });
      
      setDraftMessage(null);
      setShowSendModal(false);
      setPendingSendMessageId(null);
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

  // Hemen gönder (onay adımı olmadan)
  const handleSendReply = async () => {
    if (!replyContent.trim()) return;

    setSending(true);
    try {
      const messageData = {
        content: replyContent,
        direction: "outbound",
        status: MESSAGE_STATUS.SENT,
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

      await addMessage(conversationId, messageData);

      setReplyContent("");
      setIsAiGenerated(false);
      setAiMetadata(null);

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

    try {
      const newCase = await createCaseFromConversation(
        conversationId,
        {
          title: convertForm.title,
          type: convertForm.type,
          priority: convertForm.priority,
        },
        user?.uid
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
                        getReplyStatusColor(conversation.replyStatus)
                      )}
                      title={getReplyStatusLabel(conversation.replyStatus)}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", getReplyStatusDot(conversation.replyStatus))} />
                      {getReplyStatusLabel(conversation.replyStatus)}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs bg-white",
                      getConversationStatusColor(conversation.status)
                    )}
                  >
                    {getConversationStatusLabel(conversation.status)}
                  </Badge>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">
                    {(() => {
                      const originalDate =
                        conversation.channelMetadata?.originalCreatedAt;
                      const displayDate =
                        originalDate || conversation.createdAt;
                      if (!displayDate) return "";
                      return format(
                        displayDate?.toDate?.() || new Date(displayDate),
                        "dd MMM yyyy HH:mm",
                        { locale: tr }
                      );
                    })()}
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
                            const result = await cleanupDuplicateMessages(conversation.id);
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
                            <span className="text-xs text-slate-400">
                              {(() => {
                                const originalDate =
                                  conversation.channelMetadata
                                    ?.originalCreatedAt;
                                const displayDate =
                                  originalDate || conversation.createdAt;
                                if (!displayDate) return "";
                                return format(
                                  displayDate?.toDate?.() ||
                                    new Date(displayDate),
                                  "HH:mm",
                                  { locale: tr }
                                );
                              })()}
                            </span>
                          </div>
                          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-slate-100">
                            <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
                              {isHtmlContent(conversation.preview) 
                                ? stripHtmlToText(conversation.preview)
                                : conversation.preview
                              }
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
                          isOutbound && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-white shadow-sm">
                          <AvatarFallback
                            className={cn(
                              "text-sm font-medium",
                              isOutbound
                                ? "bg-gradient-to-br from-slate-600 to-slate-700 text-white"
                                : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            )}
                          >
                            {getInitials(message.sender?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "flex-1",
                            isOutbound ? "flex justify-end" : ""
                          )}
                        >
                          <div className="max-w-[75%]">
                            <div
                              className={cn(
                                "flex items-center gap-2 mb-1.5",
                                isOutbound && "flex-row-reverse"
                              )}
                            >
                              <span className="text-sm font-semibold text-slate-800">
                                {message.sender?.name || "Bilinmiyor"}
                              </span>
                              <span className="text-xs text-slate-400">
                                {(() => {
                                  const originalDate =
                                    message.originalCreatedAt;
                                  const displayDate =
                                    originalDate || message.createdAt;
                                  if (!displayDate) return "";
                                  return format(
                                    displayDate?.toDate?.() ||
                                      new Date(displayDate),
                                    "HH:mm",
                                    { locale: tr }
                                  );
                                })()}
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
                                      getMessageStatusColor(message.status)
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
                                  : "bg-white border border-slate-100 rounded-2xl rounded-tl-md"
                              )}
                            >
                              <div
                                className={cn(
                                  "whitespace-pre-wrap text-sm leading-relaxed",
                                  isOutbound
                                    ? isDraft
                                      ? "text-amber-800"
                                      : "text-slate-100"
                                    : "text-slate-700"
                                )}
                              >
                                {/* HTML içerik varsa temizleyerek göster, yoksa direkt göster */}
                                {isHtmlContent(message.content) 
                                  ? stripHtmlToText(message.content)
                                  : message.content
                                }
                              </div>
                            </div>

                            {/* Draft Actions */}
                            {showActions && (
                              <div
                                className={cn(
                                  "flex gap-2 mt-2",
                                  isOutbound && "justify-end"
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
              <div className="flex items-center justify-between mb-3 px-1 gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* AI Tone Selector */}
                  <Select value={aiTone} onValueChange={setAiTone}>
                    <SelectTrigger className="w-32 h-8 text-xs">
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
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        AI ile Yanıtla
                      </>
                    )}
                  </Button>

                  {/* Quick Reply Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickReplyModal(true)}
                    className="h-8 text-xs text-slate-600 hidden sm:flex"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Hazır Yanıtlar
                  </Button>

                  {/* AI Settings Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAISettingsModal(true)}
                    className="h-8 w-8 text-slate-400 hover:text-slate-600"
                    title="AI Ayarları"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
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
                </div>
              </div>

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
                      : "bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:ring-blue-200"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      handleSaveAsDraft();
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
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
                    getConversationStatusColor(conversation.status)
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
                    {(() => {
                      const originalDate =
                        conversation.channelMetadata?.originalCreatedAt;
                      const displayDate =
                        originalDate || conversation.createdAt;
                      if (!displayDate) return "";
                      return format(
                        displayDate?.toDate?.() || new Date(displayDate),
                        "dd MMM yyyy",
                        { locale: tr }
                      );
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Son Mesaj</span>
                  <span className="text-sm text-slate-700">
                    {conversation.lastMessageAt &&
                      formatDistanceToNow(
                        conversation.lastMessageAt?.toDate?.() ||
                          new Date(conversation.lastMessageAt),
                        { addSuffix: true, locale: tr }
                      )}
                  </span>
                </div>
              </div>
              {conversation.snoozedUntil && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-amber-600">
                    <span className="text-sm">Ertelendi</span>
                    <span className="text-sm font-medium">
                      {format(
                        conversation.snoozedUntil?.toDate?.() ||
                          new Date(conversation.snoozedUntil),
                        "dd MMM HH:mm",
                        { locale: tr }
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
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
            <Button onClick={handleConvertToCase} disabled={!convertForm.title}>
              <Briefcase className="h-4 w-4 mr-2" />
              Talep Oluştur
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
                      <div className={`rounded-xl border overflow-hidden ${
                        isFirstMessage 
                          ? "border-emerald-200 bg-emerald-50/50" 
                          : "border-blue-200 bg-blue-50/50"
                      }`}>
                        <div className={`px-4 py-3 border-b ${
                          isFirstMessage 
                            ? "border-emerald-100 bg-emerald-50" 
                            : "border-blue-100 bg-blue-50"
                        }`}>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            <Sparkles className={`h-3.5 w-3.5 ${
                              isFirstMessage ? "text-emerald-500" : "text-blue-500"
                            }`} />
                            Hibrit Prompt Modu
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${
                              isFirstMessage 
                                ? "bg-gradient-to-br from-emerald-400 to-emerald-600" 
                                : "bg-gradient-to-br from-blue-400 to-blue-600"
                            }`}>
                              {isFirstMessage ? (
                                <MessageSquarePlus className="h-5 w-5 text-white" />
                              ) : (
                                <MessageSquare className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900">
                                {isFirstMessage ? "İlk Karşılama Promptu" : "Devam Yanıtı Promptu"}
                              </p>
                              <p className="text-sm text-slate-500">
                                {isFirstMessage 
                                  ? "Sıcak, profesyonel karşılama (max 100 kelime)" 
                                  : "Bağlam farkında, akıllı yanıt (80-120 kelime)"
                                }
                              </p>
                            </div>
                            <Badge className={`border-0 text-xs ${
                              isFirstMessage 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {messageCount} mesaj
                            </Badge>
                          </div>
                          <div className={`mt-3 pt-3 border-t text-xs ${
                            isFirstMessage ? "border-emerald-100 text-emerald-700" : "border-blue-100 text-blue-700"
                          }`}>
                            <code className="font-mono bg-white/50 px-2 py-1 rounded">
                              {isFirstMessage ? "crm_communication" : "crm_communication_continuation"}
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
                                      val % 1000 === 0 ? 0 : 1
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
                            }
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
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                isFirstMessage 
                                  ? "bg-emerald-500" 
                                  : "bg-slate-300"
                              }`}>
                                <MessageSquarePlus className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className={`text-xs font-bold ${
                                isFirstMessage ? "text-emerald-700" : "text-slate-500"
                              }`}>
                                İlk Karşılama
                              </span>
                              {isFirstMessage && (
                                <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0 h-4 ml-auto">
                                  AKTİF
                                </Badge>
                              )}
                            </div>
                            <p className={`text-[10px] ${
                              isFirstMessage ? "text-emerald-600" : "text-slate-400"
                            }`}>
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
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                !isFirstMessage 
                                  ? "bg-blue-500" 
                                  : "bg-slate-300"
                              }`}>
                                <MessageSquare className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className={`text-xs font-bold ${
                                !isFirstMessage ? "text-blue-700" : "text-slate-500"
                              }`}>
                                Devam Yanıtı
                              </span>
                              {!isFirstMessage && (
                                <Badge className="bg-blue-500 text-white text-[9px] px-1.5 py-0 h-4 ml-auto">
                                  AKTİF
                                </Badge>
                              )}
                            </div>
                            <p className={`text-[10px] ${
                              !isFirstMessage ? "text-blue-600" : "text-slate-400"
                            }`}>
                              Akıllı bağlam • 80-120 kelime
                            </p>
                          </div>
                        </div>

                        {/* Mesaj Sayısı Bilgisi */}
                        <div className={`text-center py-2 px-3 rounded-lg text-xs ${
                          isFirstMessage 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          Bu konuşmada <strong>{messageCount}</strong> mesaj var → 
                          <code className="ml-1 bg-white/50 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {activePromptKey}
                          </code> kullanılacak
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
                                ""
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
                          onClick={() => setShowVariablesPanel(prev => !prev)}
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
                            {Object.entries(currentPromptVariables).map(([key, value]) => (
                              <div key={key} className="flex gap-2 text-[11px]">
                                <code className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                                  {`{{${key}}}`}
                                </code>
                                <span className={`text-slate-600 truncate ${
                                  value ? '' : 'italic text-slate-400'
                                }`}>
                                  {value 
                                    ? (value.length > 60 ? value.substring(0, 60) + '...' : value)
                                    : '(boş)'
                                  }
                                </span>
                              </div>
                            ))}
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
                                user_prompt {showFilledPrompt ? "(değişkenler dolu)" : "(template)"}
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
                                ? replacePromptVariables(firestorePrompt.userPromptTemplate, currentPromptVariables)
                                : firestorePrompt.userPromptTemplate
                              }
                            </pre>
                          </div>
                          {/* Variables info */}
                          {showFilledPrompt && currentPromptVariables.user_instruction && (
                            <div className="px-3 py-2 bg-amber-900/50 border-t border-amber-800/50 flex items-center gap-2">
                              <Zap className="h-3 w-3 text-amber-400" />
                              <span className="text-[10px] text-amber-300">
                                Operatör Talimatı: "{currentPromptVariables.user_instruction.substring(0, 50)}{currentPromptVariables.user_instruction.length > 50 ? '...' : ''}"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Mesaj Gönderimi
            </DialogTitle>
            <DialogDescription>
              Mesajın gönderileceği kanalları seçin. Birden fazla kanal seçebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Alıcı Bilgisi */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-slate-700">Alıcı:</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {conversation?.sender?.name || 'İsimsiz'}
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

            {/* Kanal Seçimleri */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Gönderim Kanalları:</p>
              
              {/* Outlook Email */}
              <label className={cn(
                "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                sendChannels.email 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-slate-200 hover:border-slate-300",
                !conversation?.sender?.email && "opacity-50 cursor-not-allowed"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    sendChannels.email ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Outlook E-posta</p>
                    <p className="text-xs text-slate-500">
                      {conversation?.sender?.email || 'E-posta adresi yok'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendChannels.email}
                  disabled={!conversation?.sender?.email}
                  onChange={(e) => setSendChannels(prev => ({ ...prev, email: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              {/* WhatsApp - Yakında */}
              <label className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-400">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">WhatsApp</p>
                    <p className="text-xs text-slate-400">Yakında aktif olacak</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Yakında</Badge>
              </label>

              {/* Manuel Kayıt */}
              <label className={cn(
                "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                sendChannels.manual 
                  ? "border-slate-500 bg-slate-50" 
                  : "border-slate-200 hover:border-slate-300"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    sendChannels.manual ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Manuel Kayıt</p>
                    <p className="text-xs text-slate-500">Sadece CRM'e kaydet, dışarı gönderme</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendChannels.manual}
                  onChange={(e) => setSendChannels(prev => ({ ...prev, manual: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                />
              </label>
            </div>

            {/* Bilgi Notu */}
            {sendChannels.email && conversation?.channel === 'email' && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  E-posta, mevcut konuşma zincirine (thread) yanıt olarak gönderilecek.
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
              }}
              disabled={sendingMessage}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirmSend}
              disabled={sendingMessage || (!sendChannels.email && !sendChannels.manual)}
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
    </div>
  );
}
