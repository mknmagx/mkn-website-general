"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import {
  PermissionGuard,
  usePermissions,
} from "../../../components/admin-route-guard";
import { useToast } from "../../../hooks/use-toast";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import {
  Mail,
  Inbox,
  Send,
  Trash2,
  RefreshCw,
  Search,
  Plus,
  Reply,
  Loader2,
  Paperclip,
  Archive,
  Clock,
  User,
  X,
  ArrowLeft,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Upload,
  MailOpen,
  MailCheck,
  AlertCircle,
  MessageSquare,
  StickyNote,
  FolderOutput,
  MoreHorizontal,
  FolderInput,
  ChevronDown,
  ChevronRight,
  ReplyAll,
  Forward,
  Star,
  Flag,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../../../lib/utils";

// Dosya türü ikonları
const getFileIcon = (contentType, name) => {
  if (contentType?.startsWith("image/")) return Image;
  if (contentType?.includes("pdf")) return FileText;
  if (
    contentType?.includes("word") ||
    name?.endsWith(".doc") ||
    name?.endsWith(".docx")
  )
    return FileText;
  if (
    contentType?.includes("excel") ||
    name?.endsWith(".xls") ||
    name?.endsWith(".xlsx")
  )
    return FileText;
  return File;
};

// Dosya boyutunu formatla
const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// E-posta HTML içeriğini temizle (cid: referanslarını kaldır)
const sanitizeEmailHtml = (html) => {
  if (!html) return "";

  // cid: referanslarını placeholder görsel ile değiştir
  let sanitized = html.replace(
    /<img[^>]*src=["']cid:[^"']*["'][^>]*>/gi,
    '<span class="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">[Gömülü Görsel]</span>'
  );

  // Boş src'li görselleri temizle
  sanitized = sanitized.replace(/<img[^>]*src=["']["'][^>]*>/gi, "");

  return sanitized;
};

// Paylaşılan posta kutuları (Microsoft 365)
const SHARED_MAILBOXES = [
  {
    value: "all",
    label: "Tümü",
    description: "Tüm posta kutuları",
    color: "from-slate-600 to-slate-800",
  },
  {
    value: "info@mkngroup.com.tr",
    label: "Mkn Group",
    description: "Genel iletişim",
    color: "from-blue-500 to-indigo-600",
  },
  {
    value: "fulfillment@mkngroup.com.tr",
    label: "Mkn Fulfillment",
    description: "Sipariş ve lojistik",
    color: "from-emerald-500 to-teal-600",
  },
  {
    value: "design@mkngroup.com.tr",
    label: "Mkn Group Design",
    description: "Tasarım departmanı",
    color: "from-violet-500 to-purple-600",
  },
];

// Gerçek posta kutuları (API çağrıları için)
const REAL_MAILBOXES = SHARED_MAILBOXES.filter((m) => m.value !== "all");

export default function OutlookPage() {
  const { user } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const emailListRef = useRef(null);

  // State management
  const [emails, setEmails] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalMessages: 0, unreadMessages: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

  // Active mailbox selection
  const [activeMailbox, setActiveMailbox] = useState(SHARED_MAILBOXES[0].value);

  // View states
  const [viewMode, setViewMode] = useState("list"); // list, detail, compose

  // Attachments state
  const [emailAttachments, setEmailAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [composeAttachments, setComposeAttachments] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  // Move dialog
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveEmailId, setMoveEmailId] = useState(null);
  const [moveEmailMailbox, setMoveEmailMailbox] = useState(null);

  // Thread/conversation state
  const [expandedThreads, setExpandedThreads] = useState({});

  // Compose form with sender selection
  const [composeForm, setComposeForm] = useState({
    from: SHARED_MAILBOXES[0].value,
    to: "",
    cc: "",
    subject: "",
    body: "",
  });

  // Reply form
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);

  // Permission checks
  const canViewEmails = hasPermission("outlook.view");
  const canSendEmails = hasPermission("outlook.send");
  const canDeleteEmails = hasPermission("outlook.delete");

  // Folder icons mapping
  const folderIcons = {
    inbox: Inbox,
    sentitems: Send,
    drafts: FileText,
    deleteditems: Trash2,
    archive: Archive,
    junkemail: AlertCircle,
    outbox: FolderOutput,
    conversationhistory: MessageSquare,
    notes: StickyNote,
  };

  // Folder name translations (English to Turkish)
  const folderNameTranslations = {
    inbox: "Gelen Kutusu",
    "sent items": "Gönderilenler",
    sentitems: "Gönderilenler",
    drafts: "Taslaklar",
    "deleted items": "Silinmiş Öğeler",
    deleteditems: "Silinmiş Öğeler",
    archive: "Arşiv",
    "junk email": "Gereksiz E-posta",
    junkemail: "Gereksiz E-posta",
    outbox: "Giden Kutusu",
    "conversation history": "Konuşma Geçmişi",
    notes: "Notlar",
  };

  // Translate folder name to Turkish
  const translateFolderName = (name) => {
    if (!name) return "Klasör";
    const lowerName = name.toLowerCase().replace(/\s+/g, "");
    // Check with spaces removed
    if (folderNameTranslations[lowerName]) {
      return folderNameTranslations[lowerName];
    }
    // Check with original lowercase
    const lowerOriginal = name.toLowerCase();
    if (folderNameTranslations[lowerOriginal]) {
      return folderNameTranslations[lowerOriginal];
    }
    return name;
  };

  // Load initial data
  useEffect(() => {
    if (canViewEmails) {
      loadFolders();
      loadEmails();
      loadStats();
    }
  }, [canViewEmails, activeMailbox]);

  // Load folders
  const loadFolders = async () => {
    try {
      if (activeMailbox === "all") {
        // "Tümü" seçiliyse tüm mailbox'lardan klasörleri al ve okunmamış sayılarını topla
        const foldersPromises = REAL_MAILBOXES.map(async (mailbox) => {
          const response = await fetch(
            `/api/admin/outlook/folders?userId=${encodeURIComponent(
              mailbox.value
            )}`
          );
          const data = await response.json();
          return data.success ? data.folders : [];
        });

        const allFoldersArrays = await Promise.all(foldersPromises);

        // İlk mailbox'un klasör yapısını temel al ve okunmamış sayılarını topla
        const baseFolders = allFoldersArrays[0] || [];
        const combinedFolders = baseFolders.map((folder) => {
          let totalUnread = folder.unreadItemCount || 0;
          let totalItems = folder.totalItemCount || 0;

          // Diğer mailbox'lardaki aynı klasörün okunmamış sayılarını topla
          for (let i = 1; i < allFoldersArrays.length; i++) {
            const matchingFolder = allFoldersArrays[i].find(
              (f) =>
                f.displayName?.toLowerCase() ===
                folder.displayName?.toLowerCase()
            );
            if (matchingFolder) {
              totalUnread += matchingFolder.unreadItemCount || 0;
              totalItems += matchingFolder.totalItemCount || 0;
            }
          }

          return {
            ...folder,
            unreadItemCount: totalUnread,
            totalItemCount: totalItems,
          };
        });

        setFolders(combinedFolders);
      } else {
        const response = await fetch(
          `/api/admin/outlook/folders?userId=${encodeURIComponent(
            activeMailbox
          )}`
        );
        const data = await response.json();

        if (data.success) {
          setFolders(data.folders);
        }
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  // Load emails
  const loadEmails = async (folderId = selectedFolder) => {
    try {
      setLoading(true);

      // "Tümü" seçiliyse tüm mailbox'lardan e-postaları çek
      if (activeMailbox === "all") {
        const allEmailsPromises = REAL_MAILBOXES.map(async (mailbox) => {
          const response = await fetch(
            `/api/admin/outlook/emails?folderId=${folderId}&userId=${encodeURIComponent(
              mailbox.value
            )}`
          );
          const data = await response.json();
          if (data.success) {
            // Her e-postaya hangi mailbox'tan geldiğini ekle
            return data.emails.map((email) => ({
              ...email,
              _mailbox: mailbox.value,
              _mailboxLabel: mailbox.label,
              _mailboxColor: mailbox.color,
            }));
          }
          return [];
        });

        const allEmailsArrays = await Promise.all(allEmailsPromises);
        const combinedEmails = allEmailsArrays.flat();

        // Tarihe göre sırala (en yeni üstte)
        combinedEmails.sort(
          (a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime)
        );

        setEmails(combinedEmails);
      } else {
        const response = await fetch(
          `/api/admin/outlook/emails?folderId=${folderId}&userId=${encodeURIComponent(
            activeMailbox
          )}`
        );
        const data = await response.json();

        if (data.success) {
          setEmails(data.emails);
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error) {
      console.error("Error loading emails:", error);
      toast({
        title: "Hata",
        description: "E-postalar yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      // "Tümü" seçiliyse tüm mailbox'ların istatistiklerini topla
      if (activeMailbox === "all") {
        const statsPromises = REAL_MAILBOXES.map(async (mailbox) => {
          const response = await fetch(
            `/api/admin/outlook/stats?userId=${encodeURIComponent(
              mailbox.value
            )}`
          );
          const data = await response.json();
          return data.success
            ? data.stats
            : { totalMessages: 0, unreadMessages: 0 };
        });

        const allStats = await Promise.all(statsPromises);
        const combinedStats = allStats.reduce(
          (acc, curr) => ({
            totalMessages: acc.totalMessages + (curr.totalMessages || 0),
            unreadMessages: acc.unreadMessages + (curr.unreadMessages || 0),
          }),
          { totalMessages: 0, unreadMessages: 0 }
        );

        setStats(combinedStats);
      } else {
        const response = await fetch(
          `/api/admin/outlook/stats?userId=${encodeURIComponent(activeMailbox)}`
        );
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Search emails
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadEmails();
      return;
    }

    try {
      setLoading(true);

      // "Tümü" seçiliyse tüm mailbox'larda ara
      if (activeMailbox === "all") {
        const searchPromises = REAL_MAILBOXES.map(async (mailbox) => {
          const response = await fetch(
            `/api/admin/outlook/search?q=${encodeURIComponent(
              searchQuery
            )}&userId=${encodeURIComponent(mailbox.value)}`
          );
          const data = await response.json();
          if (data.success) {
            return data.emails.map((email) => ({
              ...email,
              _mailbox: mailbox.value,
              _mailboxLabel: mailbox.label,
              _mailboxColor: mailbox.color,
            }));
          }
          return [];
        });

        const allResults = await Promise.all(searchPromises);
        const combinedResults = allResults.flat();
        combinedResults.sort(
          (a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime)
        );
        setEmails(combinedResults);
      } else {
        const response = await fetch(
          `/api/admin/outlook/search?q=${encodeURIComponent(
            searchQuery
          )}&userId=${encodeURIComponent(activeMailbox)}`
        );
        const data = await response.json();

        if (data.success) {
          setEmails(data.emails);
        }
      }
    } catch (error) {
      console.error("Error searching emails:", error);
      toast({
        title: "Hata",
        description: "Arama sırasında bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // View email details
  const handleViewEmail = async (email) => {
    try {
      // Scroll pozisyonunu kaydet
      if (emailListRef.current) {
        setScrollPosition(emailListRef.current.scrollTop);
      }
      
      setEmailAttachments([]);
      // "Tümü" modundaysa e-postanın geldiği mailbox'u kullan
      const mailboxToUse = email._mailbox || activeMailbox;
      const response = await fetch(
        `/api/admin/outlook/emails/${encodeURIComponent(
          email.id
        )}?userId=${encodeURIComponent(mailboxToUse)}`
      );
      const data = await response.json();

      if (data.success) {
        // E-postaya mailbox bilgisini ekle
        setSelectedEmail({
          ...data.email,
          _mailbox: email._mailbox,
          _mailboxLabel: email._mailboxLabel,
          _mailboxColor: email._mailboxColor,
        });
        setViewMode("detail");

        // Mark as read if unread
        if (!email.isRead) {
          await markAsRead(email.id, mailboxToUse);
        }

        // Load attachments if email has any
        if (email.hasAttachments) {
          loadEmailAttachments(email.id, mailboxToUse);
        }
      }
    } catch (error) {
      console.error("Error viewing email:", error);
      toast({
        title: "Hata",
        description: "E-posta yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Load email attachments
  const loadEmailAttachments = async (emailId, mailbox = null) => {
    try {
      setLoadingAttachments(true);
      const mailboxToUse = mailbox || selectedEmail?._mailbox || activeMailbox;
      const response = await fetch(
        `/api/admin/outlook/emails/${encodeURIComponent(
          emailId
        )}/attachments?userId=${encodeURIComponent(mailboxToUse)}`
      );
      const data = await response.json();

      if (data.success) {
        setEmailAttachments(data.attachments || []);
      }
    } catch (error) {
      console.error("Error loading attachments:", error);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Download attachment
  const handleDownloadAttachment = async (attachment) => {
    try {
      const mailboxToUse = selectedEmail?._mailbox || activeMailbox;

      // Base64 verisi varsa direkt indir
      if (attachment.contentBytes) {
        const byteCharacters = atob(attachment.contentBytes);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: attachment.contentType });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = attachment.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // API'den attachment detayını al
        const response = await fetch(
          `/api/admin/outlook/emails/${encodeURIComponent(
            selectedEmail.id
          )}/attachments?userId=${encodeURIComponent(
            mailboxToUse
          )}&attachmentId=${encodeURIComponent(attachment.id)}`
        );
        const data = await response.json();

        if (data.success && data.attachment?.contentBytes) {
          const byteCharacters = atob(data.attachment.contentBytes);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: data.attachment.contentType,
          });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = data.attachment.name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast({
        title: "Hata",
        description: "Dosya indirilirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Preview attachment (for images)
  const handlePreviewAttachment = async (attachment) => {
    if (attachment.contentType?.startsWith("image/")) {
      const mailboxToUse = selectedEmail?._mailbox || activeMailbox;

      if (attachment.contentBytes) {
        setPreviewAttachment({
          ...attachment,
          dataUrl: `data:${attachment.contentType};base64,${attachment.contentBytes}`,
        });
      } else {
        // Fetch full attachment with content
        const response = await fetch(
          `/api/admin/outlook/emails/${encodeURIComponent(
            selectedEmail.id
          )}/attachments?userId=${encodeURIComponent(
            mailboxToUse
          )}&attachmentId=${encodeURIComponent(attachment.id)}`
        );
        const data = await response.json();
        if (data.success && data.attachment?.contentBytes) {
          setPreviewAttachment({
            ...data.attachment,
            dataUrl: `data:${data.attachment.contentType};base64,${data.attachment.contentBytes}`,
          });
        }
      }
    }
  };

  // Handle file selection for compose
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      // Max 25MB
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Uyarı",
          description: `${file.name} dosyası 25MB'dan büyük`,
          variant: "destructive",
        });
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        const isImage = file.type?.startsWith("image/");
        setComposeAttachments((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            contentBytes: base64,
            preview: isImage ? reader.result : null,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attachment from compose
  const removeComposeAttachment = (index) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Mark as read
  const markAsRead = async (emailId, mailbox = null) => {
    try {
      const mailboxToUse = mailbox || activeMailbox;
      const response = await fetch(
        `/api/admin/outlook/emails/${encodeURIComponent(
          emailId
        )}/read?userId=${encodeURIComponent(mailboxToUse)}&isRead=true`,
        {
          method: "PATCH",
        }
      );
      const data = await response.json();

      if (data.success) {
        // Update local state
        setEmails(
          emails.map((e) => (e.id === emailId ? { ...e, isRead: true } : e))
        );
        loadStats();
        toast({
          title: "Başarılı",
          description: "E-posta okundu olarak işaretlendi",
        });
      } else {
        // Yetki hatası mı kontrol et
        if (data.code === "ACCESS_DENIED") {
          toast({
            title: "Yetki Hatası",
            description:
              "Azure AD uygulamasının e-posta yazma izni yok. Sistem yöneticisine başvurun.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || "Failed to mark as read");
        }
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      toast({
        title: "Hata",
        description: error.message || "E-posta okundu olarak işaretlenemedi",
        variant: "destructive",
      });
    }
  };

  // Mark as unread
  const markAsUnread = async (emailId, mailbox = null) => {
    try {
      const mailboxToUse = mailbox || activeMailbox;
      const response = await fetch(
        `/api/admin/outlook/emails/${encodeURIComponent(
          emailId
        )}/read?userId=${encodeURIComponent(mailboxToUse)}&isRead=false`,
        {
          method: "PATCH",
        }
      );
      const data = await response.json();

      if (data.success) {
        // Update local state
        setEmails(
          emails.map((e) => (e.id === emailId ? { ...e, isRead: false } : e))
        );
        loadStats();

        toast({
          title: "Başarılı",
          description: "E-posta okunmadı olarak işaretlendi",
        });
      } else {
        // Yetki hatası mı kontrol et
        if (data.code === "ACCESS_DENIED") {
          toast({
            title: "Yetki Hatası",
            description:
              "Azure AD uygulamasının e-posta yazma izni yok. Sistem yöneticisine başvurun.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || "Failed to mark as unread");
        }
      }
    } catch (error) {
      console.error("Error marking as unread:", error);
      toast({
        title: "Hata",
        description: error.message || "E-posta okunmadı olarak işaretlenemedi",
        variant: "destructive",
      });
    }
  };

  // Toggle read status (for quick actions)
  const toggleReadStatus = async (email, e) => {
    e?.stopPropagation(); // Prevent opening the email
    const mailboxToUse = email._mailbox || activeMailbox;

    if (email.isRead) {
      await markAsUnread(email.id, mailboxToUse);
    } else {
      await markAsRead(email.id, mailboxToUse);
      toast({
        title: "Başarılı",
        description: "E-posta okundu olarak işaretlendi",
      });
    }
  };

  // Send email
  const handleSendEmail = async () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      toast({
        title: "Uyarı",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/outlook/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeForm.to.split(",").map((e) => e.trim()),
          cc: composeForm.cc
            ? composeForm.cc.split(",").map((e) => e.trim())
            : [],
          subject: composeForm.subject,
          body: composeForm.body,
          userId: composeForm.from,
          attachments: composeAttachments.map((a) => ({
            name: a.name,
            contentType: a.contentType,
            contentBytes: a.contentBytes,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "E-posta başarıyla gönderildi",
        });
        setViewMode("list");
        setComposeForm({
          from: activeMailbox,
          to: "",
          cc: "",
          subject: "",
          body: "",
        });
        setComposeAttachments([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Hata",
        description: "E-posta gönderilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reply to email
  const handleReply = async () => {
    if (!replyText.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen cevap metnini yazın",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const mailboxToUse = selectedEmail?._mailbox || activeMailbox;
      const response = await fetch(
        `/api/admin/outlook/emails/${encodeURIComponent(
          selectedEmail.id
        )}/reply?userId=${encodeURIComponent(mailboxToUse)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: replyText }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Cevap başarıyla gönderildi",
        });
        setShowReply(false);
        setReplyText("");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error replying:", error);
      toast({
        title: "Hata",
        description: "Cevap gönderilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete email
  const handleDelete = async (emailId) => {
    if (!window.confirm("Bu e-postayı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const mailboxToUse = selectedEmail?._mailbox || activeMailbox;
      const response = await fetch(
        `/api/admin/outlook/emails/${encodeURIComponent(
          emailId
        )}?userId=${encodeURIComponent(mailboxToUse)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "E-posta silindi",
        });
        loadEmails();
        loadStats();
        goBackToList();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast({
        title: "Hata",
        description: "E-posta silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Delete email from list (with email object)
  const handleDeleteFromList = async (email, e) => {
    e?.stopPropagation();
    if (!window.confirm("Bu e-postayı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const mailboxToUse = email._mailbox || activeMailbox;
      const response = await fetch(
        `/api/admin/outlook/emails/${encodeURIComponent(
          email.id
        )}?userId=${encodeURIComponent(mailboxToUse)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "E-posta silindi",
        });
        // Remove from local state
        setEmails((prev) => prev.filter((e) => e.id !== email.id));
        loadStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast({
        title: "Hata",
        description: "E-posta silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Move email to folder
  const handleMoveEmail = async (destinationId) => {
    if (!moveEmailId || !destinationId) return;

    try {
      setLoading(true);
      const mailboxToUse = moveEmailMailbox || activeMailbox;
      const response = await fetch(
        `/api/admin/outlook/emails/${encodeURIComponent(
          moveEmailId
        )}/move?userId=${encodeURIComponent(mailboxToUse)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "E-posta taşındı",
        });
        // Remove from current view
        setEmails((prev) => prev.filter((e) => e.id !== moveEmailId));
        loadStats();
        setShowMoveDialog(false);
        setMoveEmailId(null);
        setMoveEmailMailbox(null);

        if (selectedEmail?.id === moveEmailId) {
          goBackToList();
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error moving email:", error);
      toast({
        title: "Hata",
        description: "E-posta taşınırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open move dialog
  const openMoveDialog = (email, e) => {
    e?.stopPropagation();
    setMoveEmailId(email.id);
    setMoveEmailMailbox(email._mailbox || activeMailbox);
    setShowMoveDialog(true);
  };

  // Toggle thread expanded state
  const toggleThread = (threadId) => {
    setExpandedThreads((prev) => ({
      ...prev,
      [threadId]: !prev[threadId],
    }));
  };

  // Parse conversation history from email body
  const parseConversationThread = (emailBody) => {
    if (!emailBody?.content)
      return { mainContent: emailBody?.content || "", replies: [] };

    const content = emailBody.content;
    const replies = [];

    // Look for common reply patterns
    // Pattern 1: <div class="gmail_quote"> or similar
    // Pattern 2: -----Original Message----- or --- Orijinal Mesaj ---
    // Pattern 3: On ... wrote: or ... tarihinde ... yazdı:
    // Pattern 4: From: ... Sent: ... Subject:

    const replyPatterns = [
      // Gmail style
      /<div[^>]*class="[^"]*gmail_quote[^"]*"[^>]*>([\s\S]*?)(?=<\/div>\s*$|$)/gi,
      // Outlook style - Original Message
      /(<hr[^>]*>)?\s*(<p[^>]*>|<div[^>]*>)?\s*[-_]{3,}\s*(Original Message|Orijinal Mesaj|Özgün İleti)[\s\S]*$/gi,
      // Outlook style - From/Sent headers
      /(<hr[^>]*>)?\s*(<p[^>]*>|<div[^>]*>)?\s*(From|Kimden|Gönderen)\s*:\s*[\s\S]*?(Subject|Konu)\s*:[\s\S]*$/gi,
      // "On date, person wrote" pattern
      /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    ];

    let mainContent = content;
    let foundReplies = false;

    for (const pattern of replyPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // Get content before the reply chain
        const firstMatch = content.search(pattern);
        if (firstMatch > 100) {
          // Ensure there's substantial main content
          mainContent = content.substring(0, firstMatch);
          const replyContent = content.substring(firstMatch);

          if (replyContent.trim().length > 50) {
            replies.push({
              id: "thread-1",
              content: replyContent,
              isExpanded: false,
            });
            foundReplies = true;
            break;
          }
        }
      }
    }

    return { mainContent, replies, hasThread: foundReplies };
  };

  // Format date with full details
  const formatDateFull = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? "Şimdi" : `${minutes} dk`;
    }
    if (hours < 24) {
      return `${hours} saat`;
    }
    if (days < 7) {
      return `${days} gün`;
    }
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  // Get initials from email
  const getInitials = (email) => {
    const name =
      email?.from?.emailAddress?.name ||
      email?.from?.emailAddress?.address ||
      "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for avatar
  const getAvatarColor = (email) => {
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-emerald-400 to-emerald-600",
      "bg-gradient-to-br from-violet-400 to-violet-600",
      "bg-gradient-to-br from-orange-400 to-orange-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-teal-400 to-teal-600",
      "bg-gradient-to-br from-rose-400 to-rose-600",
    ];
    const hash = (email?.from?.emailAddress?.address || "")
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Selected folder name
  const selectedFolderName = useMemo(() => {
    const folder = folders.find((f) => f.id === selectedFolder);
    return translateFolderName(folder?.displayName) || "Gelen Kutusu";
  }, [folders, selectedFolder]);

  // Active mailbox info
  const activeMailboxInfo = useMemo(() => {
    return (
      SHARED_MAILBOXES.find((m) => m.value === activeMailbox) ||
      SHARED_MAILBOXES[0]
    );
  }, [activeMailbox]);

  // Go back to list and restore scroll position
  const goBackToList = () => {
    setViewMode("list");
    setSelectedEmail(null);
    setShowReply(false);
    // Scroll pozisyonunu restore et
    setTimeout(() => {
      if (emailListRef.current) {
        emailListRef.current.scrollTop = scrollPosition;
      }
    }, 50);
  };

  // Handle mailbox change
  const handleMailboxChange = (mailbox) => {
    setActiveMailbox(mailbox);
    setSelectedFolder("inbox");
    setSelectedEmail(null);
    setViewMode("list");
    setScrollPosition(0); // Yeni mailbox'a geçince scroll sıfırla
    // "Tümü" seçildiğinde ilk gerçek mailbox'u varsayılan gönderici yap
    const defaultSender = mailbox === "all" ? REAL_MAILBOXES[0].value : mailbox;
    setComposeForm((prev) => ({ ...prev, from: defaultSender }));
  };

  return (
    <PermissionGuard requiredPermission="outlook.view">
      <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
        {/* Mailbox Selector */}
        <div className="flex-shrink-0 border-b bg-muted/30">
          <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto">
            {SHARED_MAILBOXES.map((mailbox) => (
              <button
                key={mailbox.value}
                onClick={() => handleMailboxChange(mailbox.value)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap",
                  activeMailbox === mailbox.value
                    ? `bg-gradient-to-r ${mailbox.color} text-white shadow-lg`
                    : "bg-background hover:bg-muted border"
                )}
              >
                <Mail className="h-4 w-4" />
                <div className="text-left">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      activeMailbox !== mailbox.value && "text-foreground"
                    )}
                  >
                    {mailbox.label}
                  </div>
                  {mailbox.value !== "all" && (
                    <div
                      className={cn(
                        "text-xs",
                        activeMailbox === mailbox.value
                          ? "text-white/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {mailbox.value}
                    </div>
                  )}
                  {mailbox.value === "all" && (
                    <div
                      className={cn(
                        "text-xs",
                        activeMailbox === mailbox.value
                          ? "text-white/80"
                          : "text-muted-foreground"
                      )}
                    >
                      3 posta kutusu
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modern Header */}
        <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-2xl text-white shadow-lg",
                  `bg-gradient-to-br ${activeMailboxInfo.color}`
                )}
              >
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {activeMailboxInfo.label}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {stats.unreadMessages > 0 ? (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        {stats.unreadMessages} okunmamış
                      </span>
                    </>
                  ) : (
                    <span>Tüm mesajlar okundu</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  loadEmails();
                  loadStats();
                }}
                disabled={loading}
                className="h-10 w-10 rounded-xl"
              >
                <RefreshCw
                  className={cn("h-4 w-4", loading && "animate-spin")}
                />
              </Button>
              <PermissionGuard requiredPermission="outlook.send">
                <Button
                  onClick={() => {
                    setComposeForm((prev) => ({
                      ...prev,
                      from: activeMailbox,
                    }));
                    setViewMode("compose");
                  }}
                  className={cn(
                    "gap-2 h-10 px-4 rounded-xl shadow-lg transition-all",
                    `bg-gradient-to-r ${activeMailboxInfo.color} hover:opacity-90`
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Yeni E-posta</span>
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside
            className={cn(
              "w-72 border-r bg-muted/20 flex-shrink-0 flex flex-col",
              "hidden lg:flex"
            )}
          >
            {/* Quick Stats */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.unreadMessages}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Okunmamış
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20">
                  <div className="text-3xl font-bold text-slate-600">
                    {stats.totalMessages}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Toplam
                  </div>
                </div>
              </div>
            </div>

            {/* Folders */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              <p className="text-xs font-medium text-muted-foreground px-3 mb-2 uppercase tracking-wider">
                Klasörler
              </p>
              <div className="space-y-1">
                {folders.map((folder) => {
                  const folderKey = folder.displayName
                    ?.toLowerCase()
                    ?.replace(/\s/g, "");
                  const IconComponent = folderIcons[folderKey] || Inbox;
                  const isSelected = selectedFolder === folder.id;
                  const translatedName = translateFolderName(
                    folder.displayName
                  );

                  return (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setSelectedFolder(folder.id);
                        loadEmails(folder.id);
                        setViewMode("list");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                        isSelected
                          ? "bg-gradient-to-r from-blue-500/15 to-indigo-500/10 text-blue-600 font-medium shadow-sm"
                          : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <IconComponent
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isSelected ? "text-blue-500" : ""
                        )}
                      />
                      <span className="flex-1 text-left truncate">
                        {translatedName}
                      </span>
                      {folder.unreadItemCount > 0 && (
                        <Badge
                          className={cn(
                            "min-w-[26px] h-6 px-2 text-xs font-medium",
                            isSelected
                              ? "bg-blue-500 text-white hover:bg-blue-500"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {folder.unreadItemCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Email List / Detail / Compose */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {viewMode === "list" && (
              <>
                {/* Search Bar */}
                <div className="flex-shrink-0 p-4 border-b bg-background/50">
                  <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="E-posta ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-11 h-11 bg-muted/50 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Email List */}
                <div ref={emailListRef} className="flex-1 overflow-y-auto">
                  {loading && emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
                      <p className="text-sm">E-postalar yükleniyor...</p>
                    </div>
                  ) : emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <Inbox className="h-10 w-10" />
                      </div>
                      <p className="font-medium text-lg">E-posta bulunamadı</p>
                      <p className="text-sm mt-1">Bu klasör boş görünüyor</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {emails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => handleViewEmail(email)}
                          className={cn(
                            "group flex items-start gap-4 px-6 py-5 cursor-pointer transition-all duration-200",
                            "hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent",
                            !email.isRead && "bg-blue-50/50 dark:bg-blue-950/10"
                          )}
                        >
                          {/* Avatar */}
                          <div
                            className={cn(
                              "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md",
                              getAvatarColor(email)
                            )}
                          >
                            {getInitials(email)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  "text-sm truncate",
                                  !email.isRead
                                    ? "font-semibold text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {email.from?.emailAddress?.name ||
                                  email.from?.emailAddress?.address}
                              </span>
                              {email.hasAttachments && (
                                <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              )}
                              {/* Mailbox badge for "Tümü" view */}
                              {activeMailbox === "all" &&
                                email._mailboxLabel && (
                                  <span
                                    className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-full text-white font-medium flex-shrink-0",
                                      `bg-gradient-to-r ${email._mailboxColor}`
                                    )}
                                  >
                                    {email._mailboxLabel}
                                  </span>
                                )}
                            </div>
                            <p
                              className={cn(
                                "text-sm truncate mb-1.5",
                                !email.isRead
                                  ? "font-medium text-foreground"
                                  : "text-foreground/80"
                              )}
                            >
                              {email.subject || "(Konu yok)"}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {email.bodyPreview}
                            </p>
                          </div>

                          {/* Date & Status & Actions */}
                          <div className="flex-shrink-0 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              <span
                                className={cn(
                                  "text-xs mr-2",
                                  !email.isRead
                                    ? "text-blue-600 font-medium"
                                    : "text-muted-foreground"
                                )}
                              >
                                {formatDate(email.receivedDateTime)}
                              </span>

                              {/* Quick Actions - visible on hover */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                {/* Toggle Read/Unread */}
                                <button
                                  onClick={(e) => toggleReadStatus(email, e)}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-all hover:bg-muted",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                  )}
                                  title={
                                    email.isRead
                                      ? "Okunmadı olarak işaretle"
                                      : "Okundu olarak işaretle"
                                  }
                                >
                                  {email.isRead ? (
                                    <MailOpen className="h-4 w-4 text-muted-foreground hover:text-blue-600" />
                                  ) : (
                                    <MailCheck className="h-4 w-4 text-blue-600" />
                                  )}
                                </button>

                                {/* Archive/Move */}
                                <button
                                  onClick={(e) => openMoveDialog(email, e)}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-all hover:bg-muted",
                                    "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                  )}
                                  title="Klasöre taşı"
                                >
                                  <FolderInput className="h-4 w-4 text-muted-foreground hover:text-amber-600" />
                                </button>

                                {/* Delete */}
                                <PermissionGuard requiredPermission="outlook.delete">
                                  <button
                                    onClick={(e) =>
                                      handleDeleteFromList(email, e)
                                    }
                                    className={cn(
                                      "p-1.5 rounded-lg transition-all hover:bg-destructive/10",
                                      "focus:outline-none focus:ring-2 focus:ring-destructive/50"
                                    )}
                                    title="Sil"
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                  </button>
                                </PermissionGuard>
                              </div>
                            </div>
                            {!email.isRead && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {viewMode === "detail" && selectedEmail && (
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-background/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBackToList}
                    className="gap-2 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Geri
                  </Button>

                  <div className="flex items-center gap-2">
                    {/* Mark as Read/Unread Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const mailboxToUse =
                          selectedEmail._mailbox || activeMailbox;
                        if (selectedEmail.isRead) {
                          markAsUnread(selectedEmail.id, mailboxToUse);
                          setSelectedEmail((prev) => ({
                            ...prev,
                            isRead: false,
                          }));
                        } else {
                          markAsRead(selectedEmail.id, mailboxToUse);
                          setSelectedEmail((prev) => ({
                            ...prev,
                            isRead: true,
                          }));
                          toast({
                            title: "Başarılı",
                            description: "E-posta okundu olarak işaretlendi",
                          });
                        }
                      }}
                      className="gap-2 rounded-xl"
                    >
                      {selectedEmail.isRead ? (
                        <>
                          <MailOpen className="h-4 w-4" />
                          <span className="hidden sm:inline">Okunmadı</span>
                        </>
                      ) : (
                        <>
                          <MailCheck className="h-4 w-4" />
                          <span className="hidden sm:inline">Okundu</span>
                        </>
                      )}
                    </Button>

                    {/* Move Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMoveDialog(selectedEmail)}
                      className="gap-2 rounded-xl"
                    >
                      <FolderInput className="h-4 w-4" />
                      <span className="hidden sm:inline">Taşı</span>
                    </Button>

                    <PermissionGuard requiredPermission="outlook.send">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReply(true)}
                        className="gap-2 rounded-xl"
                      >
                        <Reply className="h-4 w-4" />
                        <span className="hidden sm:inline">Cevapla</span>
                      </Button>
                    </PermissionGuard>

                    {/* More Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            // Forward - open compose with prefilled data
                            setComposeForm({
                              from: selectedEmail._mailbox || activeMailbox,
                              to: "",
                              cc: "",
                              subject: `FW: ${selectedEmail.subject || ""}`,
                              body: `\n\n---------- Forwarded message ----------\nFrom: ${
                                selectedEmail.from?.emailAddress?.address
                              }\nDate: ${formatDateFull(
                                selectedEmail.receivedDateTime
                              )}\nSubject: ${selectedEmail.subject}\n\n${
                                selectedEmail.body?.content?.replace(
                                  /<[^>]*>/g,
                                  ""
                                ) || ""
                              }`,
                            });
                            setViewMode("compose");
                          }}
                          className="gap-2 cursor-pointer"
                        >
                          <Forward className="h-4 w-4" />
                          İlet
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // Archive - move to archive folder
                            const archiveFolder = folders.find(
                              (f) =>
                                f.displayName?.toLowerCase() === "archive" ||
                                f.displayName?.toLowerCase() === "arşiv"
                            );
                            if (archiveFolder) {
                              setMoveEmailId(selectedEmail.id);
                              setMoveEmailMailbox(
                                selectedEmail._mailbox || activeMailbox
                              );
                              handleMoveEmail(archiveFolder.id);
                            } else {
                              toast({
                                title: "Uyarı",
                                description: "Arşiv klasörü bulunamadı",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="gap-2 cursor-pointer"
                        >
                          <Archive className="h-4 w-4" />
                          Arşivle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <PermissionGuard requiredPermission="outlook.delete">
                          <DropdownMenuItem
                            onClick={() => handleDelete(selectedEmail.id)}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-4xl mx-auto p-8">
                    {/* Subject */}
                    <h2 className="text-2xl font-semibold mb-8 leading-tight">
                      {selectedEmail.subject || "(Konu yok)"}
                    </h2>

                    {/* Sender Info */}
                    <div className="flex items-start gap-4 mb-8 pb-6 border-b">
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-lg",
                          getAvatarColor(selectedEmail)
                        )}
                      >
                        {getInitials(selectedEmail)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">
                            {selectedEmail.from?.emailAddress?.name ||
                              selectedEmail.from?.emailAddress?.address}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedEmail.from?.emailAddress?.address}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                            <User className="h-3 w-3" />
                            Kime:{" "}
                            {selectedEmail.toRecipients
                              ?.map((r) => r.emailAddress?.address)
                              .join(", ")}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                            <Clock className="h-3 w-3" />
                            {new Date(
                              selectedEmail.receivedDateTime
                            ).toLocaleString("tr-TR")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    {selectedEmail.hasAttachments && (
                      <div className="mb-8 pb-6 border-b">
                        <div className="flex items-center gap-2 mb-4">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Ekler{" "}
                            {loadingAttachments && (
                              <Loader2 className="inline h-3 w-3 animate-spin ml-1" />
                            )}
                          </span>
                        </div>

                        {emailAttachments.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {emailAttachments.map((attachment) => {
                              const FileIcon = getFileIcon(
                                attachment.contentType,
                                attachment.name
                              );
                              const isImage =
                                attachment.contentType?.startsWith("image/");

                              return (
                                <div
                                  key={attachment.id}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border hover:bg-muted/50 transition-colors group"
                                >
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-lg flex items-center justify-center",
                                      isImage
                                        ? "bg-pink-500/10 text-pink-600"
                                        : "bg-blue-500/10 text-blue-600"
                                    )}
                                  >
                                    <FileIcon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {attachment.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isImage && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg"
                                        onClick={() =>
                                          handlePreviewAttachment(attachment)
                                        }
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg"
                                      onClick={() =>
                                        handleDownloadAttachment(attachment)
                                      }
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          !loadingAttachments && (
                            <p className="text-sm text-muted-foreground">
                              Ekler yüklenemedi
                            </p>
                          )
                        )}
                      </div>
                    )}

                    {/* Body with Conversation Thread */}
                    {(() => {
                      const { mainContent, replies, hasThread } =
                        parseConversationThread(selectedEmail.body);
                      return (
                        <div className="space-y-6">
                          {/* Main Email Content */}
                          <div
                            className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeEmailHtml(mainContent),
                            }}
                          />

                          {/* Conversation Thread (Previous Messages) */}
                          {hasThread && replies.length > 0 && (
                            <div className="mt-8 pt-6 border-t">
                              <Collapsible
                                open={expandedThreads[selectedEmail.id]}
                                onOpenChange={() =>
                                  toggleThread(selectedEmail.id)
                                }
                              >
                                <CollapsibleTrigger asChild>
                                  <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-background transition-colors">
                                      {expandedThreads[selectedEmail.id] ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                          Önceki mesajlar
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {expandedThreads[selectedEmail.id]
                                          ? "Gizlemek için tıklayın"
                                          : "Görüntülemek için tıklayın"}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {replies.length} mesaj
                                      </Badge>
                                    </div>
                                  </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="mt-4 pl-4 border-l-2 border-muted">
                                    {replies.map((reply, index) => (
                                      <div
                                        key={reply.id || index}
                                        className="py-4 px-4 bg-muted/20 rounded-lg mb-3"
                                      >
                                        <div
                                          className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600 text-muted-foreground"
                                          dangerouslySetInnerHTML={{
                                            __html: sanitizeEmailHtml(
                                              reply.content
                                            ),
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Reply Panel */}
                {showReply && (
                  <div className="flex-shrink-0 border-t bg-muted/20 p-6">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                        <Reply className="h-4 w-4" />
                        <span>
                          Yanıtla: {selectedEmail.from?.emailAddress?.address}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Cevabınızı yazın..."
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="mb-4 bg-background rounded-xl resize-none"
                      />
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowReply(false);
                            setReplyText("");
                          }}
                          className="rounded-xl"
                        >
                          İptal
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleReply}
                          disabled={loading}
                          className="gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Gönder
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === "compose" && (
              <div className="flex flex-col h-full">
                {/* Compose Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-background/50">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="h-10 w-10 rounded-xl"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold">Yeni E-posta</h2>
                  </div>
                  <Button
                    onClick={handleSendEmail}
                    disabled={loading}
                    className={cn(
                      "gap-2 h-10 px-5 rounded-xl shadow-lg",
                      `bg-gradient-to-r ${
                        REAL_MAILBOXES.find((m) => m.value === composeForm.from)
                          ?.color || activeMailboxInfo.color
                      }`
                    )}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Gönder
                  </Button>
                </div>

                {/* Compose Form */}
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-4xl mx-auto p-8">
                    <div className="space-y-6">
                      {/* Sender Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Gönderici Hesabı
                        </label>
                        <Select
                          value={composeForm.from}
                          onValueChange={(value) =>
                            setComposeForm({ ...composeForm, from: value })
                          }
                        >
                          <SelectTrigger className="w-full h-14 bg-muted/30 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/50">
                            <SelectValue placeholder="Gönderici seçin" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {REAL_MAILBOXES.map((mailbox) => (
                              <SelectItem
                                key={mailbox.value}
                                value={mailbox.value}
                                className="rounded-lg py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs",
                                      `bg-gradient-to-br ${mailbox.color}`
                                    )}
                                  >
                                    <Mail className="h-4 w-4" />
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">
                                      {mailbox.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {mailbox.value}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* To */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Kime <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="ornek@email.com (virgülle ayırarak birden fazla ekleyin)"
                          value={composeForm.to}
                          onChange={(e) =>
                            setComposeForm({
                              ...composeForm,
                              to: e.target.value,
                            })
                          }
                          className="h-12 bg-muted/30 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        />
                      </div>

                      {/* CC */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          CC
                        </label>
                        <Input
                          placeholder="ornek@email.com"
                          value={composeForm.cc}
                          onChange={(e) =>
                            setComposeForm({
                              ...composeForm,
                              cc: e.target.value,
                            })
                          }
                          className="h-12 bg-muted/30 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        />
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Konu <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="E-posta konusu"
                          value={composeForm.subject}
                          onChange={(e) =>
                            setComposeForm({
                              ...composeForm,
                              subject: e.target.value,
                            })
                          }
                          className="h-12 bg-muted/30 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        />
                      </div>

                      {/* Body */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Mesaj <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          placeholder="E-posta içeriğinizi yazın..."
                          rows={14}
                          value={composeForm.body}
                          onChange={(e) =>
                            setComposeForm({
                              ...composeForm,
                              body: e.target.value,
                            })
                          }
                          className="bg-muted/30 border-0 rounded-xl resize-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        />
                      </div>

                      {/* Attachments */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-muted-foreground">
                            Ekler
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-xl"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4" />
                            Dosya Ekle
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                          />
                        </div>

                        {composeAttachments.length > 0 && (
                          <div className="space-y-2">
                            {composeAttachments.map((file, index) => {
                              const FileIcon = getFileIcon(
                                file.type,
                                file.name
                              );
                              const isImage = file.type?.startsWith("image/");

                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border group"
                                >
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-lg flex items-center justify-center",
                                      isImage
                                        ? "bg-pink-500/10 text-pink-600"
                                        : "bg-blue-500/10 text-blue-600"
                                    )}
                                  >
                                    <FileIcon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)}
                                    </p>
                                  </div>
                                  {isImage && file.preview && (
                                    <img
                                      src={file.preview}
                                      alt={file.name}
                                      className="w-10 h-10 rounded-lg object-cover"
                                    />
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      removeComposeAttachment(index)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Sender Info Card */}
                      <div
                        className={cn(
                          "p-5 rounded-2xl border",
                          `bg-gradient-to-r ${
                            REAL_MAILBOXES.find(
                              (m) => m.value === composeForm.from
                            )?.color || "from-blue-500 to-indigo-600"
                          }/5`
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                              `bg-gradient-to-br ${
                                REAL_MAILBOXES.find(
                                  (m) => m.value === composeForm.from
                                )?.color || "from-blue-500 to-indigo-600"
                              }`
                            )}
                          >
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {REAL_MAILBOXES.find(
                                (m) => m.value === composeForm.from
                              )?.label || "Gönderici"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {composeForm.from} olarak gönderilecek
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      <Dialog
        open={!!previewAttachment}
        onOpenChange={() => setPreviewAttachment(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewAttachment?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-xl min-h-[400px]">
            {previewAttachment?.contentType?.startsWith("image/") ? (
              <img
                src={
                  previewAttachment.contentUrl ||
                  `data:${previewAttachment.contentType};base64,${previewAttachment.contentBytes}`
                }
                alt={previewAttachment.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <div className="text-center py-12">
                <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Bu dosya türü önizlenemez
                </p>
                <Button
                  className="mt-4"
                  onClick={() => handleDownloadAttachment(previewAttachment)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {previewAttachment?.size &&
                formatFileSize(previewAttachment.size)}
            </div>
            <Button
              onClick={() => handleDownloadAttachment(previewAttachment)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              İndir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Email Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderInput className="h-5 w-5" />
              E-postayı Taşı
            </DialogTitle>
            <DialogDescription>
              E-postayı taşımak istediğiniz klasörü seçin
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {folders.map((folder) => {
                const folderKey = folder.displayName
                  ?.toLowerCase()
                  ?.replace(/\s/g, "");
                const IconComponent = folderIcons[folderKey] || Inbox;
                const translatedName = translateFolderName(folder.displayName);
                const isCurrentFolder = folder.id === selectedFolder;

                return (
                  <button
                    key={folder.id}
                    onClick={() => handleMoveEmail(folder.id)}
                    disabled={loading || isCurrentFolder}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                      "hover:bg-muted/80 text-muted-foreground hover:text-foreground",
                      isCurrentFolder &&
                        "opacity-50 cursor-not-allowed bg-muted/50"
                    )}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{translatedName}</span>
                    {isCurrentFolder && (
                      <Badge variant="secondary" className="text-xs">
                        Mevcut
                      </Badge>
                    )}
                    {folder.displayName?.toLowerCase() === "deleted items" ||
                    folder.displayName?.toLowerCase() === "deleteditems" ? (
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : folder.displayName?.toLowerCase() === "archive" ||
                      folder.displayName?.toLowerCase() === "arşiv" ? (
                      <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMoveDialog(false);
                setMoveEmailId(null);
                setMoveEmailMailbox(null);
              }}
              className="rounded-xl"
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
