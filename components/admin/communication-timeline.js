"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  COMMUNICATION_TYPE,
  getCommunicationTypeLabel,
  getCommunicationTypeColor,
  isIncomingCommunication,
  CommunicationService,
} from "../../lib/services/communication-service";
import { generateMknEmailHtml } from "../../lib/email-templates/mkn-email-template";
import { useToast } from "../../hooks/use-toast";

// UI Components
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// Icons
import {
  Mail,
  MailOpen,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  MessageCircle,
  Users,
  StickyNote,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Bot,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Send,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

// İletişim tipi ikonları
const getTypeIcon = (type) => {
  const icons = {
    [COMMUNICATION_TYPE.EMAIL_INCOMING]: MailOpen,
    [COMMUNICATION_TYPE.EMAIL_OUTGOING]: Mail,
    [COMMUNICATION_TYPE.PHONE_INCOMING]: PhoneIncoming,
    [COMMUNICATION_TYPE.PHONE_OUTGOING]: PhoneOutgoing,
    [COMMUNICATION_TYPE.WHATSAPP_INCOMING]: MessageCircle,
    [COMMUNICATION_TYPE.WHATSAPP_OUTGOING]: MessageCircle,
    [COMMUNICATION_TYPE.MEETING]: Users,
    [COMMUNICATION_TYPE.NOTE]: StickyNote,
    [COMMUNICATION_TYPE.SYSTEM]: Sparkles,
  };
  return icons[type] || Mail;
};

// Tarih formatlama
const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Göreceli tarih
const getRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true, locale: tr });
};

// Süre formatlama (saniye -> dk:sn)
const formatDuration = (seconds) => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Tek iletişim kartı
 */
function CommunicationItem({ communication, isLast, onEdit, onDelete, onSendViaOutlook }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = getTypeIcon(communication.type);
  const isIncoming = isIncomingCommunication(communication.type);
  const hasLongContent = communication.content && communication.content.length > 200;
  
  // Giden mesajlar düzenlenebilir/silinebilir
  const isOutgoing = !isIncoming && communication.type !== COMMUNICATION_TYPE.SYSTEM;
  const canEdit = isOutgoing;
  const canDelete = isOutgoing;
  const canSendViaOutlook = communication.type === COMMUNICATION_TYPE.EMAIL_OUTGOING && communication.to;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(communication.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Timeline çizgisi */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      )}

      <div className="flex gap-4">
        {/* İkon */}
        <div
          className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isIncoming
              ? "bg-blue-100 dark:bg-blue-900/30"
              : communication.type === COMMUNICATION_TYPE.NOTE
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-green-100 dark:bg-green-900/30"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              isIncoming
                ? "text-blue-600 dark:text-blue-400"
                : communication.type === COMMUNICATION_TYPE.NOTE
                ? "text-amber-600 dark:text-amber-400"
                : "text-green-600 dark:text-green-400"
            }`}
          />
        </div>

        {/* İçerik */}
        <Card className={`flex-1 mb-4 ${
          isIncoming 
            ? "border-l-4 border-l-blue-400" 
            : communication.type === COMMUNICATION_TYPE.NOTE
            ? "border-l-4 border-l-amber-400"
            : "border-l-4 border-l-green-400"
        }`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Yön ikonu */}
                {isIncoming ? (
                  <ArrowDownLeft className="h-4 w-4 text-blue-500" />
                ) : communication.type !== COMMUNICATION_TYPE.NOTE && communication.type !== COMMUNICATION_TYPE.SYSTEM ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : null}
                
                {/* Tip badge */}
                <Badge
                  variant="outline"
                  className={getCommunicationTypeColor(communication.type)}
                >
                  {getCommunicationTypeLabel(communication.type)}
                </Badge>

                {/* AI ile oluşturuldu */}
                {communication.isAiGenerated && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          <Bot className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AI ile oluşturuldu</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Otomatik import edildi */}
                {communication.isAutoImported && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <Mail className="h-3 w-3 mr-1" />
                          Otomatik
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>E-posta yanıtından otomatik eklendi</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Thread takibi aktif */}
                {communication.outlookConversationId && !communication.isAutoImported && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Thread
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Thread takibi aktif - yanıtlar otomatik eklenir</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Ek dosyalar */}
                {communication.attachments?.length > 0 && (
                  <Badge variant="outline" className="text-gray-500">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {communication.attachments.length}
                  </Badge>
                )}

                {/* Süre (telefon için) */}
                {communication.duration && (
                  <Badge variant="outline" className="text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(communication.duration)}
                  </Badge>
                )}
              </div>

              {/* Tarih ve Aksiyonlar */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {getRelativeTime(communication.communicationDate)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatDate(communication.communicationDate)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Aksiyon Menüsü */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Kopyala */}
                    <DropdownMenuItem onClick={handleCopy}>
                      {copied ? (
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Kopyala
                    </DropdownMenuItem>
                    
                    {/* Outlook ile Gönder */}
                    {canSendViaOutlook && (
                      <DropdownMenuItem onClick={() => onSendViaOutlook?.(communication)}>
                        <Send className="h-4 w-4 mr-2 text-blue-600" />
                        Outlook ile Gönder
                      </DropdownMenuItem>
                    )}
                    
                    {(canEdit || canDelete) && <DropdownMenuSeparator />}
                    
                    {/* Düzenle */}
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit?.(communication)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                    )}
                    
                    {/* Sil */}
                    {canDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(communication)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Konu */}
            {communication.subject && (
              <CardTitle className="text-sm font-medium mt-2">
                {communication.subject}
              </CardTitle>
            )}

            {/* Kimden/Kime */}
            {(communication.from || communication.to) && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                {communication.from && (
                  <p><span className="font-medium">Kimden:</span> {communication.from}</p>
                )}
                {communication.to && (
                  <p><span className="font-medium">Kime:</span> {communication.to}</p>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {/* İçerik */}
            {communication.content && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div
                  className={`whitespace-pre-wrap ${
                    !expanded && hasLongContent ? "line-clamp-4" : ""
                  }`}
                >
                  {communication.content}
                </div>
                {hasLongContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Daha az göster
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Devamını oku
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Özet */}
            {communication.summary && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Özet:</span> {communication.summary}
              </div>
            )}

            {/* Oluşturan */}
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {communication.createdByName || "Sistem"} tarafından
                {communication.createdAt && ` • ${formatDate(communication.createdAt)}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Ana Timeline Komponenti
 */
export default function CommunicationTimeline({
  communications = [],
  loading = false,
  emptyMessage = "Henüz iletişim kaydı bulunmuyor",
  onRefresh,
  requestId = null,
}) {
  const { toast } = useToast();
  
  // Edit Modal State
  const [editModal, setEditModal] = useState({ open: false, communication: null });
  const [editForm, setEditForm] = useState({ subject: "", content: "" });
  const [editLoading, setEditLoading] = useState(false);
  
  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, communication: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Outlook Send Dialog State
  const [outlookDialog, setOutlookDialog] = useState({ open: false, communication: null });
  const [sendingOutlook, setSendingOutlook] = useState(false);
  
  // Thread Check State
  const [checkingThreads, setCheckingThreads] = useState(false);

  // Edit Modal Aç
  const handleOpenEdit = (communication) => {
    setEditForm({
      subject: communication.subject || "",
      content: communication.content || "",
    });
    setEditModal({ open: true, communication });
  };

  // Edit Kaydet
  const handleSaveEdit = async () => {
    if (!editModal.communication) return;
    
    setEditLoading(true);
    try {
      const result = await CommunicationService.update(editModal.communication.id, {
        subject: editForm.subject,
        content: editForm.content,
      });
      
      if (result.success) {
        toast({ title: "Başarılı", description: "İletişim kaydı güncellendi" });
        setEditModal({ open: false, communication: null });
        onRefresh?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: error.message || "Güncelleme başarısız", 
        variant: "destructive" 
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Delete İşlemi
  const handleDelete = async () => {
    if (!deleteDialog.communication) return;
    
    setDeleteLoading(true);
    try {
      const result = await CommunicationService.delete(deleteDialog.communication.id);
      
      if (result.success) {
        toast({ title: "Başarılı", description: "İletişim kaydı silindi" });
        setDeleteDialog({ open: false, communication: null });
        onRefresh?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: error.message || "Silme başarısız", 
        variant: "destructive" 
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Outlook ile Gönder
  const handleSendViaOutlook = async () => {
    if (!outlookDialog.communication) return;
    
    const comm = outlookDialog.communication;
    setSendingOutlook(true);
    
    try {
      // Alıcı adını e-postadan çıkarmaya çalış
      const recipientName = comm.metadata?.customerName || 
                           comm.to?.split("@")[0]?.replace(/[._-]/g, " ") || 
                           "";
      
      // HTML e-posta oluştur
      const htmlBody = generateMknEmailHtml({
        recipientName: recipientName,
        subject: comm.subject || "MKN Group - Yanıt",
        bodyContent: comm.content,
        senderName: "MKN GROUP Ekibi",
        includeSignature: true,
      });
      
      // Outlook API ile e-posta gönder
      const response = await fetch("/api/admin/outlook/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: comm.to,
          subject: comm.subject || "MKN Group - Yanıt",
          body: htmlBody,
          bodyType: "HTML",
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // İletişim kaydını thread bilgileriyle güncelle
        await CommunicationService.update(comm.id, {
          status: "sent",
          sentAt: new Date(),
          outlookMessageId: result.messageId,
          outlookConversationId: result.conversationId,
          outlookInternetMessageId: result.internetMessageId,
        });
        
        // Thread takibi oluştur
        if (result.conversationId) {
          try {
            await fetch("/api/admin/email-threads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                conversationId: result.conversationId,
                messageId: result.messageId,
                internetMessageId: result.internetMessageId,
                requestId: requestId,
                companyId: comm.companyId,
                communicationId: comm.id,
                subject: comm.subject,
                toEmail: comm.to,
                fromEmail: "info@mkngroup.com.tr",
              }),
            });
          } catch (threadError) {
            console.error("Thread takibi oluşturulamadı:", threadError);
          }
        }
        
        toast({ 
          title: "E-posta Gönderildi", 
          description: `${comm.to} adresine başarıyla gönderildi. Thread takibi aktif.` 
        });
        setOutlookDialog({ open: false, communication: null });
        onRefresh?.();
      } else {
        throw new Error(result.error || "E-posta gönderilemedi");
      }
    } catch (error) {
      toast({ 
        title: "Hata", 
        description: error.message || "E-posta gönderilemedi", 
        variant: "destructive" 
      });
    } finally {
      setSendingOutlook(false);
    }
  };

  // Thread'lerde yeni yanıt kontrolü
  const handleCheckThreads = async () => {
    setCheckingThreads(true);
    try {
      const response = await fetch("/api/admin/email-threads/check", {
        method: "GET",
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (result.importedCount > 0) {
          toast({
            title: "Yeni Yanıtlar Bulundu",
            description: `${result.importedCount} yeni e-posta yanıtı iletişim geçmişine eklendi.`,
          });
          onRefresh?.();
        } else {
          toast({
            title: "Kontrol Tamamlandı",
            description: `${result.checkedThreads} thread kontrol edildi. Yeni yanıt bulunamadı.`,
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Thread kontrolü başarısız",
        variant: "destructive",
      });
    } finally {
      setCheckingThreads(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!communications || communications.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  // Thread takibi olan e-posta var mı kontrol et
  const hasTrackedThreads = communications.some(c => c.outlookConversationId);

  return (
    <>
      {/* Thread Kontrol Butonu */}
      {hasTrackedThreads && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckThreads}
            disabled={checkingThreads}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            {checkingThreads ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kontrol Ediliyor...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Yanıtları Kontrol Et
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        {communications.map((comm, index) => (
          <CommunicationItem
            key={comm.id}
            communication={comm}
            isLast={index === communications.length - 1}
            onEdit={handleOpenEdit}
            onDelete={(c) => setDeleteDialog({ open: true, communication: c })}
            onSendViaOutlook={(c) => setOutlookDialog({ open: true, communication: c })}
          />
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => !open && setEditModal({ open: false, communication: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              İletişim Kaydını Düzenle
            </DialogTitle>
            <DialogDescription>
              Yanıtı düzenleyebilirsiniz
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Konu</Label>
              <Input
                id="edit-subject"
                value={editForm.subject}
                onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Konu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">İçerik</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal({ open: false, communication: null })}>
              İptal
            </Button>
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Kaydediliyor...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> Kaydet</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, communication: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İletişim Kaydını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu iletişim kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Siliniyor...</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" /> Sil</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Outlook Send Dialog */}
      <Dialog open={outlookDialog.open} onOpenChange={(open) => !open && setOutlookDialog({ open: false, communication: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Outlook ile E-posta Gönder
            </DialogTitle>
            <DialogDescription>
              Bu yanıtı gerçekten müşteriye göndermek istiyor musunuz?
            </DialogDescription>
          </DialogHeader>
          
          {outlookDialog.communication && (
            <div className="space-y-4 py-4">
              {/* Alıcı */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Alıcı</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{outlookDialog.communication.to}</p>
                </div>
              </div>
              
              {/* Konu */}
              <div>
                <Label className="text-sm font-medium">Konu</Label>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {outlookDialog.communication.subject || "MKN Group - Yanıt"}
                </p>
              </div>
              
              {/* İçerik Önizleme */}
              <div>
                <Label className="text-sm font-medium">İçerik</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {outlookDialog.communication.content}
                  </p>
                </div>
              </div>
              
              {/* AI Badge */}
              {outlookDialog.communication.isAiGenerated && (
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                  <Bot className="h-4 w-4" />
                  <span>Bu yanıt AI tarafından oluşturuldu</span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutlookDialog({ open: false, communication: null })}>
              İptal
            </Button>
            <Button 
              onClick={handleSendViaOutlook} 
              disabled={sendingOutlook}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingOutlook ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gönderiliyor...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Outlook ile Gönder</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
