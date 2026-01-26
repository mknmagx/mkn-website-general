"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  // Settings
  getCrmSettings,
  updateSyncSettings,
  addQuickReply,
  updateQuickReply,
  deleteQuickReply,
  resetCrmSettingsToDefaults,
  QUICK_REPLY_CATEGORIES,
  DEFAULT_SETTINGS,
  // Dangerous Operations
  importFromLegacySystems,
  resetAllCrmCollections,
  resetEmailSyncTime,
  fixEmailConversationDates,
  manualSync,
  // Conversation Tools
  mergeConversations,
  detectOrphanedEmailReplies,
  getConversationWithMessages,
  forceDeleteMessage,
  approveAndSendMessage,
  MESSAGE_STATUS,
  recalculateMessageCounts,
  // Company-CRM Sync
  initialBidirectionalSync,
  getSyncStatus,
  syncAllCompaniesToCRM,
  syncUnlinkedCustomersToCompanies,
  SYNC_STATUS,
  getSyncStatusLabel,
  getSyncStatusColor,
  // Manuel Email Import
  searchOutlookEmails,
  importSingleEmailById,
  importMultipleEmails,
  reimportEmailById,
  // Local Settings (localStorage)
  getLocalSettings,
  saveLocalSettings,
  DEFAULT_LOCAL_SETTINGS,
  resetLocalSettings,
} from "../../../../lib/services/crm-v2";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Separator } from "../../../../components/ui/separator";

// Icons
import {
  ArrowLeft,
  Settings,
  RefreshCw,
  Clock,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Download,
  Database,
  GitMerge,
  Search,
  Bell,
  Eye,
  ChevronRight,
  GripVertical,
  X,
  RotateCcw,
  CheckSquare,
  Building2,
  Users,
  Link2,
  Unlink,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Mail,
  User,
  Send,
  CheckCheck,
  Phone,
  Info,
  FileText,
  MessageCircle,
  HardDrive,
  Upload,
  FileUp,
} from "lucide-react";

import { cn } from "../../../../lib/utils";
import { Checkbox } from "../../../../components/ui/checkbox";
import { ScrollArea } from "../../../../components/ui/scroll-area";

export default function CrmSettingsPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingSettings, setResettingSettings] = useState(false);
  
  // Settings state - Başlangıçta DEFAULT_SETTINGS kullan
  const [settings, setSettings] = useState(null);
  const [syncSettings, setSyncSettings] = useState(DEFAULT_SETTINGS.sync);
  
  // Quick Replies state
  const [quickReplies, setQuickReplies] = useState([]);
  const [showQuickReplyDialog, setShowQuickReplyDialog] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [replyForm, setReplyForm] = useState({
    title: '',
    content: '',
    category: 'genel',
  });
  
  // Dangerous operations state
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Merge tools state
  const [detecting, setDetecting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [orphanedConversations, setOrphanedConversations] = useState([]);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [mergeSourceId, setMergeSourceId] = useState('');

  // Message Manager state
  const [showMessageManagerDialog, setShowMessageManagerDialog] = useState(false);
  const [messageManagerConvId, setMessageManagerConvId] = useState('');
  const [messageManagerMessages, setMessageManagerMessages] = useState([]);
  const [messageManagerConversation, setMessageManagerConversation] = useState(null);
  const [messageManagerLoading, setMessageManagerLoading] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [deletingMessages, setDeletingMessages] = useState(false);
  
  // Resend Modal state
  const [showResendModal, setShowResendModal] = useState(false);
  const [pendingResendMessageId, setPendingResendMessageId] = useState(null);
  const [resendChannels, setResendChannels] = useState({ email: false, manual: true });
  const [resendingMessage, setResendingMessage] = useState(false);

  // Company-CRM Sync state
  const [companySyncStatus, setCompanySyncStatus] = useState(null);
  const [loadingSyncStatus, setLoadingSyncStatus] = useState(false);
  const [runningSync, setRunningSync] = useState(false);
  const [syncPhase, setSyncPhase] = useState('');

  // Message Count Recalculation state
  const [recalculatingCounts, setRecalculatingCounts] = useState(false);

  // Manuel Email Import state
  const [showEmailImportDialog, setShowEmailImportDialog] = useState(false);
  const [emailImportQuery, setEmailImportQuery] = useState('');
  const [emailImportResults, setEmailImportResults] = useState([]);
  const [emailImportLoading, setEmailImportLoading] = useState(false);
  const [emailImporting, setEmailImporting] = useState(false);
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);

  // Local Settings state (localStorage tabanlı)
  const [localSettings, setLocalSettings] = useState(DEFAULT_LOCAL_SETTINGS);
  const [savingLocalSettings, setSavingLocalSettings] = useState(false);

  // Load settings
  useEffect(() => {
    loadSettings();
    loadCompanySyncStatus();
    loadLocalSettings();
  }, []);

  // LocalStorage ayarlarını yükle
  const loadLocalSettings = () => {
    const settings = getLocalSettings();
    setLocalSettings(settings);
  };

  // LocalStorage ayarlarını kaydet
  const handleSaveLocalSettings = () => {
    setSavingLocalSettings(true);
    try {
      saveLocalSettings(localSettings);
      toast({
        title: "✅ Kaydedildi",
        description: "Yerel ayarlar başarıyla kaydedildi.",
      });
    } catch (error) {
      console.error("Error saving local settings:", error);
      toast({
        title: "Hata",
        description: "Yerel ayarlar kaydedilemedi.",
        variant: "destructive",
      });
    } finally {
      setSavingLocalSettings(false);
    }
  };

  // LocalStorage ayarlarını sıfırla
  const handleResetLocalSettings = () => {
    const confirmed = window.confirm(
      "Yerel ayarları varsayılanlara sıfırlamak istediğinizden emin misiniz?"
    );
    if (!confirmed) return;
    
    resetLocalSettings();
    setLocalSettings(DEFAULT_LOCAL_SETTINGS);
    toast({
      title: "✅ Sıfırlandı",
      description: "Yerel ayarlar varsayılanlara döndürüldü.",
    });
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getCrmSettings();
      console.log('[CRM Settings] Loaded from DB:', data);
      setSettings(data);
      // DB'den gelen değerleri kullan, yoksa DEFAULT_SETTINGS'den al
      setSyncSettings(data?.sync || DEFAULT_SETTINGS.sync);
      setQuickReplies(data?.quickReplies || DEFAULT_SETTINGS.quickReplies);
    } catch (error) {
      console.error("Error loading settings:", error);
      // Hata durumunda varsayılanları kullan
      setSyncSettings(DEFAULT_SETTINGS.sync);
      setQuickReplies(DEFAULT_SETTINGS.quickReplies);
      toast({
        title: "Uyarı",
        description: "Ayarlar yüklenemedi, varsayılanlar kullanılıyor.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save sync settings
  const handleSaveSyncSettings = async () => {
    setSaving(true);
    try {
      await updateSyncSettings(syncSettings, user?.uid);
      toast({
        title: "✅ Kaydedildi",
        description: "Senkronizasyon ayarları güncellendi.",
      });
    } catch (error) {
      console.error("Error saving sync settings:", error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilemedi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Quick Reply handlers
  const handleAddQuickReply = () => {
    setEditingReply(null);
    setReplyForm({ title: '', content: '', category: 'genel' });
    setShowQuickReplyDialog(true);
  };

  const handleEditQuickReply = (reply) => {
    setEditingReply(reply);
    setReplyForm({
      title: reply.title,
      content: reply.content,
      category: reply.category || 'genel',
    });
    setShowQuickReplyDialog(true);
  };

  const handleSaveQuickReply = async () => {
    if (!replyForm.title.trim() || !replyForm.content.trim()) {
      toast({
        title: "Hata",
        description: "Başlık ve içerik zorunludur.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingReply) {
        await updateQuickReply(editingReply.id, replyForm, user?.uid);
        toast({ title: "✅ Güncellendi" });
      } else {
        await addQuickReply(replyForm, user?.uid);
        toast({ title: "✅ Eklendi" });
      }
      setShowQuickReplyDialog(false);
      loadSettings();
    } catch (error) {
      console.error("Error saving quick reply:", error);
      toast({
        title: "Hata",
        description: "Hızlı yanıt kaydedilemedi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuickReply = async (replyId) => {
    if (!window.confirm("Bu hızlı yanıtı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await deleteQuickReply(replyId, user?.uid);
      toast({ title: "✅ Silindi" });
      loadSettings();
    } catch (error) {
      console.error("Error deleting quick reply:", error);
      toast({
        title: "Hata",
        description: "Hızlı yanıt silinemedi.",
        variant: "destructive",
      });
    }
  };

  // Message Count Recalculation handler
  const handleRecalculateMessageCounts = async () => {
    if (recalculatingCounts) return;
    
    const confirmed = window.confirm(
      "🔧 Mesaj Sayısı Düzeltme\n\n" +
      "Bu işlem tüm conversation'ların messageCount değerini gerçek mesaj sayısına göre düzeltecek.\n\n" +
      "• Yanlış sayılar düzeltilir\n" +
      "• Son mesaj tarihleri güncellenir\n" +
      "• Veriler korunur, sadece sayaçlar düzeltilir\n\n" +
      "Devam etmek istiyor musunuz?"
    );
    
    if (!confirmed) return;
    
    setRecalculatingCounts(true);
    try {
      const result = await recalculateMessageCounts();
      
      toast({
        title: "✅ Düzeltme Tamamlandı",
        description: `Toplam ${result.total} conversation kontrol edildi. ${result.fixed} düzeltildi, ${result.alreadyCorrect} zaten doğruydu.`,
      });
    } catch (error) {
      console.error("Recalculate error:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRecalculatingCounts(false);
    }
  };

  // Dangerous operations handlers
  const handleImportLegacyData = async () => {
    if (importing) return;
    
    const confirmed = window.confirm(
      "Bu işlem tüm verileri CRM v2'ye import edecek:\n\n" +
      "• Eski sistemlerden (contacts, quotes, email threads)\n" +
      "• Outlook inbox'tan son 30 günün emailleri\n\n" +
      "Zaten import edilmiş veriler atlanacaktır.\n\n" +
      "Devam etmek istiyor musunuz?"
    );
    
    if (!confirmed) return;
    
    setImporting(true);
    try {
      await resetEmailSyncTime();
      const legacyResults = await importFromLegacySystems({
        importContacts: true,
        importQuotes: true,
        importEmails: true,
        skipExisting: true,
        createdBy: user?.uid,
      });
      const syncResults = await manualSync(user?.uid);
      await fixEmailConversationDates();
      
      const legacyTotal = legacyResults.contacts.imported + legacyResults.quotes.imported + legacyResults.emails.imported;
      const outlookImported = syncResults?.summary?.emails || 0;
      
      toast({
        title: "✅ Tam İçe Aktarma Tamamlandı",
        description: `Legacy: ${legacyTotal} import. Outlook: ${outlookImported} email.`,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleResetAllData = async () => {
    if (resetting) return;
    
    const firstConfirm = window.confirm(
      "⚠️ DİKKAT: Bu işlem tüm CRM v2 verilerini KALICI olarak silecek!\n\n" +
      "Bu işlem GERİ ALINAMAZ!\n\n" +
      "Devam etmek istiyor musunuz?"
    );
    
    if (!firstConfirm) return;
    
    const secondConfirm = window.prompt("Onaylamak için 'SIFIRLA' yazın:");
    
    if (secondConfirm !== 'SIFIRLA') {
      toast({ title: "İptal Edildi" });
      return;
    }
    
    setResetting(true);
    try {
      const result = await resetAllCrmCollections();
      await resetEmailSyncTime();
      
      toast({
        title: "✅ Sıfırlama Tamamlandı",
        description: `Toplam ${result.totalDeleted} kayıt silindi.`,
      });
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        title: "Sıfırlama Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  // Ayarları varsayılanlara sıfırla
  const handleResetSettingsToDefaults = async () => {
    if (resettingSettings) return;
    
    const confirmed = window.confirm(
      "Tüm CRM ayarlarını varsayılan değerlere sıfırlamak istediğinizden emin misiniz?\n\n" +
      "Bu işlem:\n" +
      "• Senkronizasyon ayarlarını sıfırlar\n" +
      "• Hızlı yanıtları varsayılanlara döndürür\n\n" +
      "Verileriniz (müşteriler, mesajlar vb.) ETKİLENMEZ."
    );
    
    if (!confirmed) return;
    
    setResettingSettings(true);
    try {
      await resetCrmSettingsToDefaults(user?.uid);
      toast({
        title: "✅ Ayarlar Sıfırlandı",
        description: "Tüm ayarlar varsayılan değerlere döndürüldü.",
      });
      loadSettings();
    } catch (error) {
      console.error("Reset settings error:", error);
      toast({
        title: "Hata",
        description: "Ayarlar sıfırlanamadı.",
        variant: "destructive",
      });
    } finally {
      setResettingSettings(false);
    }
  };

  // Company-CRM Sync handlers
  const loadCompanySyncStatus = async () => {
    setLoadingSyncStatus(true);
    try {
      const status = await getSyncStatus();
      setCompanySyncStatus(status);
    } catch (error) {
      console.error("Error loading sync status:", error);
    } finally {
      setLoadingSyncStatus(false);
    }
  };

  const handleInitialSync = async () => {
    if (runningSync) return;
    
    const confirmed = window.confirm(
      "🔄 Çift Yönlü Senkronizasyon Başlatılacak\n\n" +
      "Bu işlem:\n" +
      "1. Tüm Companies → CRM Customers eşleştirilecek\n" +
      "2. Tüm CRM Customers → Companies eşleştirilecek\n" +
      "3. Eşleşen kayıtlar bağlanacak\n" +
      "4. Eşleşmeyen kayıtlar için yeni kayıt oluşturulacak\n\n" +
      "Mevcut veriler korunur, sadece bağlantılar kurulur.\n\n" +
      "Devam etmek istiyor musunuz?"
    );
    
    if (!confirmed) return;
    
    setRunningSync(true);
    setSyncPhase('Hazırlanıyor...');
    
    try {
      setSyncPhase('Faz 1: Companies → CRM...');
      const result = await initialBidirectionalSync(user?.uid);
      
      if (result.success) {
        toast({
          title: "✅ Senkronizasyon Tamamlandı",
          description: `
            Companies: ${result.phase1?.processed || 0} işlendi (${result.phase1?.created || 0} yeni, ${result.phase1?.linked || 0} bağlandı)
            Customers: ${result.phase2?.processed || 0} işlendi (${result.phase2?.created || 0} yeni, ${result.phase2?.linked || 0} bağlandı)
            Toplam bağlantı: ${result.totalLinks}
          `.trim(),
        });
      } else {
        throw new Error(result.error || 'Senkronizasyon başarısız');
      }
      
      // Durumu yenile
      await loadCompanySyncStatus();
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Senkronizasyon Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRunningSync(false);
      setSyncPhase('');
    }
  };

  const handleSyncCompaniesToCRM = async () => {
    if (runningSync) return;
    
    setRunningSync(true);
    setSyncPhase('Companies → CRM senkronize ediliyor...');
    
    try {
      const result = await syncAllCompaniesToCRM(user?.uid);
      
      toast({
        title: "✅ Companies → CRM Tamamlandı",
        description: `${result.processed} company işlendi: ${result.created} yeni, ${result.linked} bağlandı, ${result.updated} güncellendi`,
      });
      
      await loadCompanySyncStatus();
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRunningSync(false);
      setSyncPhase('');
    }
  };

  const handleSyncCRMToCompanies = async () => {
    if (runningSync) return;
    
    setRunningSync(true);
    setSyncPhase('CRM → Companies senkronize ediliyor...');
    
    try {
      const result = await syncUnlinkedCustomersToCompanies(user?.uid);
      
      toast({
        title: "✅ CRM → Companies Tamamlandı",
        description: `${result.processed} customer işlendi: ${result.created} yeni, ${result.linked} bağlandı, ${result.skipped} atlandı`,
      });
      
      await loadCompanySyncStatus();
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRunningSync(false);
      setSyncPhase('');
    }
  };

  // Merge tools handlers
  const handleDetectOrphaned = async () => {
    if (detecting) return;
    
    setDetecting(true);
    try {
      const orphans = await detectOrphanedEmailReplies();
      setOrphanedConversations(orphans);
      
      if (orphans.length > 0) {
        toast({
          title: "🔍 Tespit Tamamlandı",
          description: `${orphans.length} potansiyel birleştirme adayı bulundu.`,
        });
      } else {
        toast({
          title: "✅ Temiz",
          description: "Ayrı düşmüş conversation bulunamadı.",
        });
      }
    } catch (error) {
      console.error("Detect error:", error);
      toast({
        title: "Tespit Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDetecting(false);
    }
  };

  const handleMergeConversations = async () => {
    if (merging || !mergeTargetId || !mergeSourceId) return;
    
    if (mergeTargetId === mergeSourceId) {
      toast({
        title: "❌ Hata",
        description: "Hedef ve kaynak aynı olamaz!",
        variant: "destructive",
      });
      return;
    }
    
    const confirmed = window.confirm(
      `Kaynak: ${mergeSourceId}\nHedef: ${mergeTargetId}\n\nDevam?`
    );
    
    if (!confirmed) return;
    
    setMerging(true);
    try {
      const result = await mergeConversations(mergeTargetId, mergeSourceId, user?.uid);
      
      toast({
        title: "✅ Birleştirme Tamamlandı",
        description: `${result.movedMessages} mesaj taşındı.`,
      });
      
      setMergeTargetId('');
      setMergeSourceId('');
      setShowMergeDialog(false);
      setOrphanedConversations([]);
    } catch (error) {
      console.error("Merge error:", error);
      toast({
        title: "Birleştirme Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMerging(false);
    }
  };

  // Message Manager handlers
  const handleLoadConversationMessages = async () => {
    if (!messageManagerConvId.trim()) {
      toast({
        title: "Hata",
        description: "Conversation ID giriniz.",
        variant: "destructive",
      });
      return;
    }

    setMessageManagerLoading(true);
    setMessageManagerMessages([]);
    setSelectedMessageIds([]);
    
    try {
      const conversation = await getConversationWithMessages(messageManagerConvId.trim());
      
      if (!conversation) {
        throw new Error('Conversation bulunamadı');
      }
      
      setMessageManagerConversation(conversation);
      setMessageManagerMessages(conversation.messages || []);
      
      toast({
        title: "✅ Yüklendi",
        description: `${conversation.messages?.length || 0} mesaj bulundu.`,
      });
    } catch (error) {
      console.error("Load messages error:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMessageManagerLoading(false);
    }
  };

  const handleToggleMessageSelection = (messageId) => {
    setSelectedMessageIds(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAllMessages = () => {
    if (selectedMessageIds.length === messageManagerMessages.length) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(messageManagerMessages.map(m => m.id));
    }
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessageIds.length === 0) return;
    
    const confirmed = window.confirm(
      `${selectedMessageIds.length} mesaj kalıcı olarak silinecek.\n\nBu işlem GERİ ALINAMAZ!\n\nDevam etmek istiyor musunuz?`
    );
    
    if (!confirmed) return;
    
    setDeletingMessages(true);
    try {
      let deleted = 0;
      let failed = 0;
      
      for (const messageId of selectedMessageIds) {
        try {
          await forceDeleteMessage(messageId, user?.email);
          deleted++;
        } catch (err) {
          console.error(`Failed to delete message ${messageId}:`, err);
          failed++;
        }
      }
      
      toast({
        title: "✅ Silme Tamamlandı",
        description: `${deleted} mesaj silindi${failed > 0 ? `, ${failed} başarısız` : ''}.`,
      });
      
      // Listeyi yenile
      setSelectedMessageIds([]);
      await handleLoadConversationMessages();
    } catch (error) {
      console.error("Delete messages error:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingMessages(false);
    }
  };

  // Tekrar Gönder modalını aç
  const handleOpenResendModal = (messageId) => {
    setPendingResendMessageId(messageId);
    // Müşteri email'i varsa email varsayılan olsun
    const hasEmail = messageManagerConversation?.sender?.email;
    setResendChannels({
      email: hasEmail ? true : false,
      manual: !hasEmail, // Email yoksa manuel seçili olsun
    });
    setShowResendModal(true);
  };

  // Seçilen kanallarla mesaj gönder
  const handleConfirmResend = async () => {
    if (!pendingResendMessageId || !messageManagerConvId) return;
    
    // En az bir kanal seçilmeli
    if (!resendChannels.email && !resendChannels.manual) {
      toast({
        title: "Kanal Seçin",
        description: "En az bir gönderim kanalı seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }
    
    setResendingMessage(true);
    try {
      const selectedChannels = [];
      if (resendChannels.email) selectedChannels.push('email');
      if (resendChannels.manual) selectedChannels.push('manual');
      
      // Mesajı onayla ve gönder (kanallarla birlikte)
      await approveAndSendMessage(messageManagerConvId, pendingResendMessageId, user?.uid, {
        channels: selectedChannels,
        recipientEmail: messageManagerConversation?.sender?.email,
        recipientName: messageManagerConversation?.sender?.name,
        recipientPhone: messageManagerConversation?.sender?.phone,
        subject: messageManagerConversation?.subject,
      });
      
      const channelNames = [];
      if (resendChannels.email) channelNames.push('E-posta');
      if (resendChannels.manual) channelNames.push('Manuel kayıt');
      
      toast({
        title: "✅ Gönderildi",
        description: `Mesaj gönderildi: ${channelNames.join(', ')}`,
      });
      
      setShowResendModal(false);
      setPendingResendMessageId(null);
      
      // Listeyi yenile
      await handleLoadConversationMessages();
    } catch (error) {
      console.error("Resend message error:", error);
      toast({
        title: "Gönderim Hatası",
        description: error.message || "Mesaj gönderilemedi.",
        variant: "destructive",
      });
    } finally {
      setResendingMessage(false);
    }
  };

  // ============================================================================
  // MANUEL EMAIL IMPORT HANDLERS
  // ============================================================================
  
  const handleSearchOutlookEmails = async () => {
    if (!emailImportQuery.trim()) {
      toast({
        title: "Hata",
        description: "Arama sorgusu giriniz (konu, gönderen e-posta vb.)",
        variant: "destructive",
      });
      return;
    }
    
    setEmailImportLoading(true);
    setEmailImportResults([]);
    setSelectedEmailIds([]);
    
    try {
      const result = await searchOutlookEmails(emailImportQuery.trim());
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setEmailImportResults(result.emails || []);
      
      toast({
        title: "✅ Arama Tamamlandı",
        description: `${result.emails?.length || 0} email bulundu.`,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Arama Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEmailImportLoading(false);
    }
  };
  
  const handleToggleEmailSelection = (emailId) => {
    setSelectedEmailIds(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };
  
  const handleSelectAllEmails = () => {
    const importableEmails = emailImportResults.filter(e => !e.isInCrm);
    if (selectedEmailIds.length === importableEmails.length) {
      setSelectedEmailIds([]);
    } else {
      setSelectedEmailIds(importableEmails.map(e => e.id));
    }
  };
  
  const handleImportSelectedEmails = async () => {
    if (selectedEmailIds.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir email seçiniz.",
        variant: "destructive",
      });
      return;
    }
    
    const confirmed = window.confirm(
      `${selectedEmailIds.length} email CRM'e aktarılacak.\n\nDevam etmek istiyor musunuz?`
    );
    
    if (!confirmed) return;
    
    setEmailImporting(true);
    try {
      const result = await importMultipleEmails(selectedEmailIds, user?.uid);
      
      toast({
        title: "✅ Import Tamamlandı",
        description: `${result.success} başarılı, ${result.skipped} zaten mevcut, ${result.failed} başarısız.`,
      });
      
      // Listeyi yenile
      setSelectedEmailIds([]);
      await handleSearchOutlookEmails();
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEmailImporting(false);
    }
  };
  
  const handleImportSingleEmail = async (emailId) => {
    setEmailImporting(true);
    try {
      const result = await importSingleEmailById(emailId, user?.uid);
      
      if (result.success) {
        toast({
          title: "✅ Email Aktarıldı",
          description: `${result.action === 'new_conversation' ? 'Yeni conversation oluşturuldu' : 'Mevcut thread\'e eklendi'}: ${result.subject}`,
        });
        
        // Listeyi yenile
        await handleSearchOutlookEmails();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEmailImporting(false);
    }
  };

  // CRM'de mevcut email'in içeriğini yeniden al (üzerine yaz)
  const handleReimportEmail = async (emailId) => {
    setEmailImporting(true);
    try {
      const result = await reimportEmailById(emailId, user?.uid);
      
      if (result.success) {
        toast({
          title: "✅ İçerik Güncellendi",
          description: `Email içeriği yeniden alındı (${result.contentLength} karakter): ${result.subject}`,
        });
        
        // Listeyi yenile
        await handleSearchOutlookEmails();
      } else if (result.notFound) {
        toast({
          title: "Bulunamadı",
          description: "Bu email CRM'de bulunamadı. Önce import etmeyi deneyin.",
          variant: "destructive",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Reimport error:", error);
      toast({
        title: "Güncelleme Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEmailImporting(false);
    }
  };

  const handleDeleteSingleMessage = async (messageId) => {
    const confirmed = window.confirm(
      "Bu mesaj kalıcı olarak silinecek.\n\nBu işlem GERİ ALINAMAZ!\n\nDevam etmek istiyor musunuz?"
    );
    
    if (!confirmed) return;
    
    setDeletingMessages(true);
    try {
      await forceDeleteMessage(messageId, user?.email);
      
      toast({
        title: "✅ Silindi",
        description: "Mesaj başarıyla silindi.",
      });
      
      // Listeyi yenile
      await handleLoadConversationMessages();
    } catch (error) {
      console.error("Delete message error:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingMessages(false);
    }
  };

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('tr-TR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/crm-v2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              CRM Ayarları
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Senkronizasyon, hızlı yanıtlar ve gelişmiş ayarlar
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        
        {/* Senkronizasyon Ayarları */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Senkronizasyon</CardTitle>
                <CardDescription>
                  Outlook ve form verilerinin senkronizasyon ayarları
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Otomatik Sync */}
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg border border-slate-200">
                <div>
                  <Label className="text-sm font-medium">Otomatik Senkronizasyon</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Sayfa açıldığında otomatik kontrol
                  </p>
                </div>
                <Switch
                  checked={syncSettings.autoSync}
                  onCheckedChange={(v) => setSyncSettings({ ...syncSettings, autoSync: v })}
                />
              </div>

              {/* Sayfa Yüklendiğinde Sync */}
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg border border-slate-200">
                <div>
                  <Label className="text-sm font-medium">Sayfa Açılışında Sync</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Dashboard açıldığında kontrol et
                  </p>
                </div>
                <Switch
                  checked={syncSettings.syncOnPageLoad}
                  onCheckedChange={(v) => setSyncSettings({ ...syncSettings, syncOnPageLoad: v })}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Sync Interval */}
              <div className="space-y-2">
                <Label htmlFor="syncInterval" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Senkronizasyon Aralığı
                </Label>
                <Select
                  value={syncSettings.syncInterval?.toString()}
                  onValueChange={(v) => setSyncSettings({ ...syncSettings, syncInterval: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aralık seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 dakika</SelectItem>
                    <SelectItem value="10">10 dakika</SelectItem>
                    <SelectItem value="15">15 dakika</SelectItem>
                    <SelectItem value="30">30 dakika</SelectItem>
                    <SelectItem value="60">1 saat</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Otomatik senkronizasyon kontrol aralığı
                </p>
              </div>

              {/* Email Sync Days */}
              <div className="space-y-2">
                <Label htmlFor="emailSyncDays" className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-500" />
                  Email Geçmişi
                </Label>
                <Select
                  value={syncSettings.emailSyncDays?.toString()}
                  onValueChange={(v) => setSyncSettings({ ...syncSettings, emailSyncDays: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gün seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Son 7 gün</SelectItem>
                    <SelectItem value="14">Son 14 gün</SelectItem>
                    <SelectItem value="30">Son 30 gün</SelectItem>
                    <SelectItem value="60">Son 60 gün</SelectItem>
                    <SelectItem value="90">Son 90 gün</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  İlk import'ta kaç günlük email çekilecek
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSyncSettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dosya Yükleme Ayarları - LocalStorage */}
        <Card className="bg-white border-cyan-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <FileUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <CardTitle>Dosya Yükleme Ayarları</CardTitle>
                <CardDescription>
                  Dosya ve belge yükleme limitleri (Bu ayarlar tarayıcınızda saklanır)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
              <p className="text-xs text-cyan-700">
                <Info className="h-3 w-3 inline mr-1" />
                Bu ayarlar sadece bu tarayıcıda geçerlidir ve localStorage&apos;da saklanır.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Maksimum Dosya Boyutu */}
              <div className="space-y-2">
                <Label htmlFor="maxFileSizeMB" className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-slate-500" />
                  Maksimum Dosya Boyutu
                </Label>
                <Select
                  value={localSettings.fileUpload?.maxFileSizeMB?.toString() || "500"}
                  onValueChange={(v) => setLocalSettings({
                    ...localSettings,
                    fileUpload: { ...localSettings.fileUpload, maxFileSizeMB: parseInt(v) }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Limit seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 MB</SelectItem>
                    <SelectItem value="25">25 MB</SelectItem>
                    <SelectItem value="50">50 MB</SelectItem>
                    <SelectItem value="100">100 MB</SelectItem>
                    <SelectItem value="250">250 MB</SelectItem>
                    <SelectItem value="500">500 MB</SelectItem>
                    <SelectItem value="1000">1 GB</SelectItem>
                    <SelectItem value="2000">2 GB</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Tek bir dosya için maksimum boyut limiti
                </p>
              </div>

              {/* Toplam Yükleme Limiti */}
              <div className="space-y-2">
                <Label htmlFor="maxTotalSizeMB" className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-slate-500" />
                  Toplam Yükleme Limiti
                </Label>
                <Select
                  value={localSettings.fileUpload?.maxTotalSizeMB?.toString() || "2000"}
                  onValueChange={(v) => setLocalSettings({
                    ...localSettings,
                    fileUpload: { ...localSettings.fileUpload, maxTotalSizeMB: parseInt(v) }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Limit seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 MB</SelectItem>
                    <SelectItem value="500">500 MB</SelectItem>
                    <SelectItem value="1000">1 GB</SelectItem>
                    <SelectItem value="2000">2 GB</SelectItem>
                    <SelectItem value="5000">5 GB</SelectItem>
                    <SelectItem value="10000">10 GB</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Tek seferde toplam yükleme limiti
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Büyük Dosya Uyarı Eşiği */}
              <div className="space-y-2">
                <Label htmlFor="largeUploadThresholdMB" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-slate-500" />
                  Büyük Dosya Uyarı Eşiği
                </Label>
                <Select
                  value={localSettings.ui?.largeUploadThresholdMB?.toString() || "100"}
                  onValueChange={(v) => setLocalSettings({
                    ...localSettings,
                    ui: { ...localSettings.ui, largeUploadThresholdMB: parseInt(v) }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Eşik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 MB</SelectItem>
                    <SelectItem value="50">50 MB</SelectItem>
                    <SelectItem value="100">100 MB</SelectItem>
                    <SelectItem value="200">200 MB</SelectItem>
                    <SelectItem value="500">500 MB</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Bu boyutun üstünde onay istenir
                </p>
              </div>

              {/* Büyük Dosya Onayı */}
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg border border-slate-200">
                <div>
                  <Label className="text-sm font-medium">Büyük Dosya Onayı</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Eşik üstü dosyalarda onay iste
                  </p>
                </div>
                <Switch
                  checked={localSettings.ui?.confirmLargeUploads ?? true}
                  onCheckedChange={(v) => setLocalSettings({
                    ...localSettings,
                    ui: { ...localSettings.ui, confirmLargeUploads: v }
                  })}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={handleResetLocalSettings}
                className="text-slate-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Varsayılanlara Sıfırla
              </Button>
              <Button onClick={handleSaveLocalSettings} disabled={savingLocalSettings}>
                {savingLocalSettings ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Case İş Akışı Ayarları - Link Card */}
        <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/admin/crm-v2/settings/case-workflow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <CheckSquare className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Case İş Akışı Ayarları</CardTitle>
                    <CardDescription>
                      Checklist, SLA ve otomatik hatırlatma kuralları
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Checklist
                </Badge>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  SLA Ayarları
                </Badge>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Otomatik Hatırlatmalar
                </Badge>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Company-CRM Senkronizasyon Yönetimi */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle>Company-CRM Senkronizasyonu</CardTitle>
                <CardDescription>
                  Companies ve CRM Customers arasında çift yönlü veri senkronizasyonu
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Durum Özeti */}
            {loadingSyncStatus ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : companySyncStatus ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-center">
                  <Building2 className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{companySyncStatus.totalCompanies}</div>
                  <div className="text-xs text-slate-500">Companies</div>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-center">
                  <Users className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{companySyncStatus.totalCustomers}</div>
                  <div className="text-xs text-slate-500">CRM Customers</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                  <Link2 className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-700">{companySyncStatus.linkedCustomers}</div>
                  <div className="text-xs text-emerald-600">Bağlı</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <Unlink className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-700">{companySyncStatus.unlinkedCustomers}</div>
                  <div className="text-xs text-amber-600">Bağlı Değil</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Durum bilgisi yüklenemedi</p>
              </div>
            )}

            {/* Sync Progress Indicator */}
            {companySyncStatus && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Senkronizasyon Oranı</span>
                  <span className="font-medium text-slate-900">{companySyncStatus.syncPercentage}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${companySyncStatus.syncPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Sync Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-700">Senkronizasyon İşlemleri</h4>
              
              {/* Running indicator */}
              {runningSync && (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  <span className="text-sm text-indigo-700 font-medium">{syncPhase}</span>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Full Bidirectional Sync */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-indigo-900">Tam Senkronizasyon</h5>
                      <p className="text-xs text-indigo-700 mt-1 mb-3">
                        Çift yönlü tüm verileri eşleştir ve bağla
                      </p>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleInitialSync}
                        disabled={runningSync}
                      >
                        {runningSync ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Başlat
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Refresh Status */}
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-200 rounded-lg">
                      <Eye className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-900">Durum Yenile</h5>
                      <p className="text-xs text-slate-600 mt-1 mb-3">
                        Güncel senkronizasyon durumunu kontrol et
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={loadCompanySyncStatus}
                        disabled={loadingSyncStatus}
                      >
                        {loadingSyncStatus ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Yenile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tek yönlü sync seçenekleri */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-slate-600">Tek Yönlü Senkronizasyon</h5>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncCompaniesToCRM}
                    disabled={runningSync}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Companies → CRM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncCRMToCompanies}
                    disabled={runningSync}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    CRM → Companies
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Not: CRM → Companies tüm CRM müşterilerini (lead, prospect, customer, vip) Companies&apos;e aktarır veya eşleştirir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hızlı Yanıtlar */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Hızlı Yanıtlar</CardTitle>
                  <CardDescription>
                    Sık kullanılan mesaj şablonları
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleAddQuickReply} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {quickReplies.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Henüz hızlı yanıt eklenmemiş</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quickReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className="flex items-start gap-3 p-4 bg-slate-100 rounded-lg border border-slate-200 group hover:bg-slate-200 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-slate-300 mt-0.5 cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{reply.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {QUICK_REPLY_CATEGORIES.find(c => c.value === reply.category)?.label || reply.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {reply.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditQuickReply(reply)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteQuickReply(reply.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Araçları */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <GitMerge className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Conversation Araçları</CardTitle>
                <CardDescription>
                  Conversation ve mesaj yönetim araçları
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleDetectOrphaned}
                disabled={detecting}
              >
                {detecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Ayrı Düşmüş Kayıtları Tespit Et
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMergeDialog(true)}
              >
                <GitMerge className="h-4 w-4 mr-2" />
                Manuel Birleştir
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMessageManagerDialog(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Mesaj Yöneticisi
              </Button>
            </div>

            {/* Tespit edilen adaylar */}
            {orphanedConversations.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-slate-700">
                  Tespit Edilen Adaylar ({orphanedConversations.length})
                </h4>
                {orphanedConversations.map((item, index) => (
                  <div key={index} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-amber-800">{item.email}</span>
                    </div>
                    {item.potentialMatches?.map((match, mIndex) => (
                      <div key={mIndex} className="text-sm text-amber-700 mb-2 pl-4 border-l-2 border-amber-300">
                        <p><strong>Form:</strong> {match.formConversation?.subject}</p>
                        <p><strong>Email:</strong> {match.emailConversation?.subject}</p>
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-400 text-amber-700 hover:bg-amber-100"
                            onClick={() => {
                              setMergeTargetId(match.formConversation?.id || '');
                              setMergeSourceId(match.emailConversation?.id || '');
                              setShowMergeDialog(true);
                            }}
                          >
                            <GitMerge className="h-3 w-3 mr-1" />
                            Birleştir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manuel Email Import */}
        <Card className="bg-white border-sky-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-50 rounded-lg">
                <Mail className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <CardTitle>Manuel Email Import</CardTitle>
                <CardDescription>
                  Kaçırılan veya eksik kalan email'leri Outlook'tan manuel olarak çekin
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
              <p className="text-sm text-sky-700 mb-4">
                Outlook inbox'ınızda olup CRM'e aktarılmamış email'leri arayıp import edebilirsiniz.
                Gönderen email, konu veya içerik ile arama yapabilirsiniz.
              </p>
              <Button
                onClick={() => setShowEmailImportDialog(true)}
                className="bg-sky-600 hover:bg-sky-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Email Ara ve Import Et
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tehlikeli İşlemler */}
        <Card className="bg-white border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900">Tehlikeli İşlemler</CardTitle>
                <CardDescription className="text-red-600">
                  Bu işlemler geri alınamaz. Dikkatli kullanın.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Tam İçe Aktarma</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Eski sistemlerden ve Outlook'tan tüm verileri import et
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleImportLegacyData}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {importing ? "İçe Aktarılıyor..." : "İçe Aktar"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Mesaj Sayılarını Düzelt</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Conversation'ların messageCount değerlerini gerçek mesaj sayısına göre düzelt
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={handleRecalculateMessageCounts}
                  disabled={recalculatingCounts}
                >
                  {recalculatingCounts ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {recalculatingCounts ? "Düzeltiliyor..." : "Düzelt"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-amber-900">Ayarları Varsayılanlara Sıfırla</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Senkronizasyon ve hızlı yanıt ayarlarını varsayılana döndür
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={handleResetSettingsToDefaults}
                  disabled={resettingSettings}
                >
                  {resettingSettings ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  {resettingSettings ? "Sıfırlanıyor..." : "Varsayılana Dön"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">Tüm Verileri Sıfırla</h4>
                  <p className="text-sm text-red-600 mt-1">
                    Tüm CRM v2 verilerini kalıcı olarak sil
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleResetAllData}
                  disabled={resetting}
                >
                  {resetting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {resetting ? "Sıfırlanıyor..." : "Sıfırla"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reply Dialog */}
      <Dialog open={showQuickReplyDialog} onOpenChange={setShowQuickReplyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingReply ? "Hızlı Yanıt Düzenle" : "Yeni Hızlı Yanıt"}
            </DialogTitle>
            <DialogDescription>
              Sık kullanılan mesaj şablonu oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={replyForm.title}
                onChange={(e) => setReplyForm({ ...replyForm, title: e.target.value })}
                placeholder="Örn: Teşekkür mesajı"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={replyForm.category}
                onValueChange={(v) => setReplyForm({ ...replyForm, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {QUICK_REPLY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                value={replyForm.content}
                onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                placeholder="Mesaj içeriğini yazın..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickReplyDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveQuickReply} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5" />
              Conversation Birleştir
            </DialogTitle>
            <DialogDescription>
              Kaynak conversation silinecek ve mesajları hedef'e taşınacak
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="targetId">Hedef Conversation ID (korunacak)</Label>
              <Input
                id="targetId"
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                placeholder="Örn: abc123..."
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceId">Kaynak Conversation ID (silinecek)</Label>
              <Input
                id="sourceId"
                value={mergeSourceId}
                onChange={(e) => setMergeSourceId(e.target.value)}
                placeholder="Örn: xyz789..."
                className="font-mono text-sm"
              />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong>Not:</strong> Conversation ID'yi Inbox'ta ilgili kayda tıklayarak URL'den alabilirsiniz.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleMergeConversations} 
              disabled={merging || !mergeTargetId || !mergeSourceId}
            >
              {merging ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <GitMerge className="h-4 w-4 mr-2" />
              )}
              Birleştir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Manager Dialog */}
      <Dialog open={showMessageManagerDialog} onOpenChange={(open) => {
        setShowMessageManagerDialog(open);
        if (!open) {
          setMessageManagerMessages([]);
          setSelectedMessageIds([]);
          setMessageManagerConvId('');
        }
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              Mesaj Yöneticisi
            </DialogTitle>
            <DialogDescription>
              Conversation içindeki mesajları görüntüle, sil veya yeniden gönder
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Conversation ID Input */}
            <div className="flex gap-2">
              <Input
                value={messageManagerConvId}
                onChange={(e) => setMessageManagerConvId(e.target.value)}
                placeholder="Conversation ID girin..."
                className="font-mono text-sm"
              />
              <Button 
                onClick={handleLoadConversationMessages}
                disabled={messageManagerLoading}
              >
                {messageManagerLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Yükle
              </Button>
            </div>

            {/* Messages List */}
            {messageManagerMessages.length > 0 && (
              <>
                {/* Actions Bar */}
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedMessageIds.length === messageManagerMessages.length && messageManagerMessages.length > 0}
                      onCheckedChange={handleSelectAllMessages}
                    />
                    <span className="text-sm text-slate-600">
                      {selectedMessageIds.length > 0 
                        ? `${selectedMessageIds.length} seçili` 
                        : `Toplam ${messageManagerMessages.length} mesaj`
                      }
                    </span>
                  </div>
                  {selectedMessageIds.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelectedMessages}
                      disabled={deletingMessages}
                    >
                      {deletingMessages ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Seçilileri Sil
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="h-[400px] border rounded-lg">
                  <div className="p-2 space-y-2">
                    {messageManagerMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          selectedMessageIds.includes(message.id)
                            ? 'bg-orange-50 border-orange-300'
                            : message.direction === 'inbound'
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        <Checkbox
                          checked={selectedMessageIds.includes(message.id)}
                          onCheckedChange={() => handleToggleMessageSelection(message.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {message.direction === 'inbound' ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Mail className="h-4 w-4 text-emerald-600" />
                            )}
                            <span className="text-xs font-medium">
                              {message.direction === 'inbound' ? 'Gelen' : 'Giden'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.status || 'sent'}
                            </Badge>
                            {message.isResent && (
                              <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                                Yeniden Gönderildi
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-3 mb-2">
                            {message.content?.substring(0, 200)}
                            {message.content?.length > 200 && '...'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{formatMessageDate(message.createdAt)}</span>
                            <span className="font-mono text-slate-400 truncate max-w-[150px]">
                              {message.id}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {message.direction === 'outbound' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleOpenResendModal(message.id)}
                              disabled={resendingMessage}
                              title="Tekrar Gönder"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteSingleMessage(message.id)}
                            disabled={deletingMessages}
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}

            {/* Empty State */}
            {!messageManagerLoading && messageManagerMessages.length === 0 && messageManagerConvId && (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Mesaj bulunamadı veya conversation yüklenmedi</p>
              </div>
            )}

            {/* Help Text */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong>💡 İpucu:</strong> Conversation ID&apos;yi Inbox&apos;ta ilgili kayda tıkladığınızda URL&apos;den alabilirsiniz. 
              Giden mesajlar için &quot;Tekrar Gönder&quot; butonu mesajı yeniden gönderir.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageManagerDialog(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manuel Email Import Dialog */}
      <Dialog open={showEmailImportDialog} onOpenChange={setShowEmailImportDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-sky-600" />
              Manuel Email Import
            </DialogTitle>
            <DialogDescription>
              Outlook inbox&apos;ınızda email arayın ve CRM&apos;e aktarın
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
            {/* Search Box */}
            <div className="flex gap-2">
              <Input
                placeholder="Konu, gönderen veya içerik ile arayın..."
                value={emailImportQuery}
                onChange={(e) => setEmailImportQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchOutlookEmails()}
                className="flex-1"
              />
              <Button
                onClick={handleSearchOutlookEmails}
                disabled={emailImportLoading}
                className="bg-sky-600 hover:bg-sky-700"
              >
                {emailImportLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Results */}
            {emailImportResults.length > 0 && (
              <>
                {/* Bulk Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedEmailIds.length > 0 && selectedEmailIds.length === emailImportResults.filter(e => !e.isInCrm).length}
                      onCheckedChange={handleSelectAllEmails}
                    />
                    <span className="text-sm text-slate-600">
                      {selectedEmailIds.length > 0 
                        ? `${selectedEmailIds.length} seçili` 
                        : `${emailImportResults.filter(e => !e.isInCrm).length} import edilebilir`}
                    </span>
                  </div>
                  {selectedEmailIds.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleImportSelectedEmails}
                      disabled={emailImporting}
                      className="bg-sky-600 hover:bg-sky-700"
                    >
                      {emailImporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Seçilenleri Import Et
                    </Button>
                  )}
                </div>

                {/* Email List */}
                <ScrollArea className="flex-1 -mx-6 px-6">
                  <div className="space-y-2">
                    {emailImportResults.map((email) => (
                      <div
                        key={email.id}
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          email.isInCrm 
                            ? "bg-green-50 border-green-200" 
                            : selectedEmailIds.includes(email.id)
                              ? "bg-sky-50 border-sky-300"
                              : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!email.isInCrm && (
                            <Checkbox
                              checked={selectedEmailIds.includes(email.id)}
                              onCheckedChange={() => handleToggleEmailSelection(email.id)}
                              className="mt-1"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900 truncate">
                                {email.fromName || email.from}
                              </span>
                              {email.isInCrm && (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  CRM&apos;de Mevcut
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 truncate">{email.subject}</p>
                            <p className="text-xs text-slate-500 truncate mt-1">{email.bodyPreview}...</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(email.receivedDateTime).toLocaleString('tr-TR')}
                            </p>
                          </div>
                          {email.isInCrm ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReimportEmail(email.id)}
                              disabled={emailImporting}
                              className="flex-shrink-0 text-amber-600 border-amber-300 hover:bg-amber-50"
                              title="İçeriği Outlook'tan yeniden al"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleImportSingleEmail(email.id)}
                              disabled={emailImporting}
                              className="flex-shrink-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}

            {/* Empty State */}
            {!emailImportLoading && emailImportResults.length === 0 && emailImportQuery && (
              <div className="text-center py-8 text-slate-500">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Email bulunamadı</p>
                <p className="text-sm mt-1">Farklı bir arama terimi deneyin</p>
              </div>
            )}

            {/* Initial State */}
            {!emailImportLoading && emailImportResults.length === 0 && !emailImportQuery && (
              <div className="text-center py-8 text-slate-500">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Outlook inbox&apos;ınızda email arayın</p>
                <p className="text-sm mt-1">Konu, gönderen email veya içerik ile arama yapabilirsiniz</p>
              </div>
            )}

            {/* Help Text */}
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-800">
              <strong>💡 İpucu:</strong> PeraPole, Gratis gibi şirketlerden gelen email&apos;leri 
              gönderen adresiyle (örn: &quot;perapole&quot; veya &quot;gratis&quot;) arayabilirsiniz.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEmailImportDialog(false);
              setEmailImportQuery('');
              setEmailImportResults([]);
              setSelectedEmailIds([]);
            }}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resend Message Modal */}
      <Dialog open={showResendModal} onOpenChange={setShowResendModal}>
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
                  {messageManagerConversation?.sender?.name || 'İsimsiz'}
                </span>
              </div>
              {messageManagerConversation?.sender?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {messageManagerConversation?.sender?.email}
                  </span>
                </div>
              )}
              {messageManagerConversation?.sender?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {messageManagerConversation?.sender?.phone}
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
                resendChannels.email 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-slate-200 hover:border-slate-300",
                !messageManagerConversation?.sender?.email && "opacity-50 cursor-not-allowed"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    resendChannels.email ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Outlook E-posta</p>
                    <p className="text-xs text-slate-500">
                      {messageManagerConversation?.sender?.email || 'E-posta adresi yok'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resendChannels.email}
                  disabled={!messageManagerConversation?.sender?.email}
                  onChange={(e) => setResendChannels(prev => ({ ...prev, email: e.target.checked }))}
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
                resendChannels.manual 
                  ? "border-slate-500 bg-slate-50" 
                  : "border-slate-200 hover:border-slate-300"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    resendChannels.manual ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Manuel Kayıt</p>
                    <p className="text-xs text-slate-500">Sadece CRM&apos;e kaydet, dışarı gönderme</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={resendChannels.manual}
                  onChange={(e) => setResendChannels(prev => ({ ...prev, manual: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                />
              </label>
            </div>

            {/* Bilgi Notu */}
            {resendChannels.email && messageManagerConversation?.channel === 'email' && (
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
                setShowResendModal(false);
                setPendingResendMessageId(null);
              }}
              disabled={resendingMessage}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirmResend}
              disabled={resendingMessage || (!resendChannels.email && !resendChannels.manual)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {resendingMessage ? (
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
