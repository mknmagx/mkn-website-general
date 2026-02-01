"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
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
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Skeleton } from "../../../components/ui/skeleton";
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
  Forward,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "../../../lib/utils";

// Dosya türü ikonları
const getFileIcon = (contentType, name) => {
  if (contentType?.startsWith("image/")) return Image;
  if (contentType?.includes("pdf")) return FileText;
  if (contentType?.includes("word") || name?.endsWith(".doc") || name?.endsWith(".docx")) return FileText;
  if (contentType?.includes("excel") || name?.endsWith(".xls") || name?.endsWith(".xlsx")) return FileText;
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

// E-posta HTML içeriğini temizle
const sanitizeEmailHtml = (html) => {
  if (!html) return "";
  let sanitized = html.replace(
    /<img[^>]*src=["']cid:[^"']*["'][^>]*>/gi,
    '<span class="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">[Gömülü Görsel]</span>'
  );
  sanitized = sanitized.replace(/<img[^>]*src=["']["'][^>]*>/gi, "");
  return sanitized;
};

// Paylaşılan posta kutuları
const SHARED_MAILBOXES = [
  { value: "all", label: "Tümü", description: "Tüm posta kutuları", color: "slate", icon: Mail },
  { value: "info@mkngroup.com.tr", label: "MKN Group", description: "Genel iletişim", color: "blue", icon: Mail },
  { value: "fulfillment@mkngroup.com.tr", label: "Fulfillment", description: "Sipariş ve lojistik", color: "emerald", icon: Mail },
  { value: "design@mkngroup.com.tr", label: "Design", description: "Tasarım departmanı", color: "violet", icon: Mail },
];

const REAL_MAILBOXES = SHARED_MAILBOXES.filter((m) => m.value !== "all");

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

// Folder translations
const folderNameTranslations = {
  inbox: "Gelen Kutusu",
  "sent items": "Gönderilenler",
  sentitems: "Gönderilenler",
  drafts: "Taslaklar",
  "deleted items": "Çöp Kutusu",
  deleteditems: "Çöp Kutusu",
  archive: "Arşiv",
  "junk email": "Spam",
  junkemail: "Spam",
  outbox: "Giden Kutusu",
  "conversation history": "Konuşma Geçmişi",
  notes: "Notlar",
};

const translateFolderName = (name) => {
  if (!name) return "Klasör";
  const lowerName = name.toLowerCase().replace(/\s+/g, "");
  if (folderNameTranslations[lowerName]) return folderNameTranslations[lowerName];
  const lowerOriginal = name.toLowerCase();
  if (folderNameTranslations[lowerOriginal]) return folderNameTranslations[lowerOriginal];
  return name;
};

// Folder priority for sorting (lower = higher priority)
const folderPriority = {
  inbox: 1,
  sentitems: 2,
  drafts: 3,
  outbox: 4,
  junkemail: 5,
  deleteditems: 6,
  archive: 7,
  conversationhistory: 8,
  notes: 9,
};

const getFolderPriority = (folderName) => {
  if (!folderName) return 99;
  const key = folderName.toLowerCase().replace(/\s+/g, "");
  return folderPriority[key] || 50;
};

const sortFolders = (folders) => {
  return [...folders].sort((a, b) => {
    const priorityA = getFolderPriority(a.displayName);
    const priorityB = getFolderPriority(b.displayName);
    return priorityA - priorityB;
  });
};

// Mailbox color helpers
const getMailboxBgColor = (color) => {
  const colors = {
    slate: "bg-slate-100",
    blue: "bg-blue-100",
    emerald: "bg-emerald-100",
    violet: "bg-violet-100",
  };
  return colors[color] || colors.slate;
};

const getMailboxTextColor = (color) => {
  const colors = {
    slate: "text-slate-600",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    violet: "text-violet-600",
  };
  return colors[color] || colors.slate;
};

const getMailboxBorderColor = (color) => {
  const colors = {
    slate: "border-slate-200",
    blue: "border-blue-200",
    emerald: "border-emerald-200",
    violet: "border-violet-200",
  };
  return colors[color] || colors.slate;
};

export default function OutlookPage() {
  const { user } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const emailListRef = useRef(null);

  // Core State
  const [emails, setEmails] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalMessages: 0, unreadMessages: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeMailbox, setActiveMailbox] = useState(SHARED_MAILBOXES[0].value);
  const [viewMode, setViewMode] = useState("list");

  // Attachments
  const [emailAttachments, setEmailAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [composeAttachments, setComposeAttachments] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  // Dialogs
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveEmailId, setMoveEmailId] = useState(null);
  const [moveEmailMailbox, setMoveEmailMailbox] = useState(null);

  // Thread state
  const [expandedThreads, setExpandedThreads] = useState({});

  // Compose form
  const [composeForm, setComposeForm] = useState({
    from: REAL_MAILBOXES[0]?.value || "",
    to: "",
    cc: "",
    subject: "",
    body: "",
  });

  // Reply
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);

  // Permissions
  const canViewEmails = hasPermission("outlook.view");
  const canSendEmails = hasPermission("outlook.send");
  const canDeleteEmails = hasPermission("outlook.delete");

  // Active mailbox info
  const activeMailboxInfo = useMemo(() => {
    return SHARED_MAILBOXES.find((m) => m.value === activeMailbox) || SHARED_MAILBOXES[0];
  }, [activeMailbox]);

  // Selected folder name
  const selectedFolderName = useMemo(() => {
    const folder = folders.find((f) => f.id === selectedFolder);
    return translateFolderName(folder?.displayName) || "Gelen Kutusu";
  }, [folders, selectedFolder]);

  // Load folders
  const loadFolders = useCallback(async () => {
    try {
      if (activeMailbox === "all") {
        const foldersPromises = REAL_MAILBOXES.map(async (mailbox) => {
          const response = await fetch(`/api/admin/outlook/folders?userId=${encodeURIComponent(mailbox.value)}`);
          const data = await response.json();
          return data.success ? data.folders : [];
        });
        const allFoldersArrays = await Promise.all(foldersPromises);
        const baseFolders = allFoldersArrays[0] || [];
        const combinedFolders = baseFolders.map((folder) => {
          let totalUnread = folder.unreadItemCount || 0;
          let totalItems = folder.totalItemCount || 0;
          for (let i = 1; i < allFoldersArrays.length; i++) {
            const matchingFolder = allFoldersArrays[i].find((f) => f.displayName?.toLowerCase() === folder.displayName?.toLowerCase());
            if (matchingFolder) {
              totalUnread += matchingFolder.unreadItemCount || 0;
              totalItems += matchingFolder.totalItemCount || 0;
            }
          }
          return { ...folder, unreadItemCount: totalUnread, totalItemCount: totalItems };
        });
        setFolders(combinedFolders);
      } else {
        const response = await fetch(`/api/admin/outlook/folders?userId=${encodeURIComponent(activeMailbox)}`);
        const data = await response.json();
        if (data.success) setFolders(data.folders);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  }, [activeMailbox]);

  // Load emails
  const loadEmails = useCallback(async (folderId = selectedFolder) => {
    try {
      if (activeMailbox === "all") {
        const allEmailsPromises = REAL_MAILBOXES.map(async (mailbox) => {
          const response = await fetch(`/api/admin/outlook/emails?folderId=${folderId}&userId=${encodeURIComponent(mailbox.value)}`);
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
        const allEmailsArrays = await Promise.all(allEmailsPromises);
        const combinedEmails = allEmailsArrays.flat();
        combinedEmails.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
        setEmails(combinedEmails);
      } else {
        const response = await fetch(`/api/admin/outlook/emails?folderId=${folderId}&userId=${encodeURIComponent(activeMailbox)}`);
        const data = await response.json();
        if (data.success) setEmails(data.emails);
      }
    } catch (error) {
      console.error("Error loading emails:", error);
      toast({ title: "Hata", description: "E-postalar yüklenirken bir hata oluştu", variant: "destructive" });
    }
  }, [activeMailbox, selectedFolder, toast]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      if (activeMailbox === "all") {
        const statsPromises = REAL_MAILBOXES.map(async (mailbox) => {
          const response = await fetch(`/api/admin/outlook/stats?userId=${encodeURIComponent(mailbox.value)}`);
          const data = await response.json();
          return data.success ? data.stats : { totalMessages: 0, unreadMessages: 0 };
        });
        const allStats = await Promise.all(statsPromises);
        const combinedStats = allStats.reduce((acc, curr) => ({
          totalMessages: acc.totalMessages + (curr.totalMessages || 0),
          unreadMessages: acc.unreadMessages + (curr.unreadMessages || 0),
        }), { totalMessages: 0, unreadMessages: 0 });
        setStats(combinedStats);
      } else {
        const response = await fetch(`/api/admin/outlook/stats?userId=${encodeURIComponent(activeMailbox)}`);
        const data = await response.json();
        if (data.success) setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, [activeMailbox]);

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!canViewEmails) return;
    await Promise.all([loadFolders(), loadEmails(), loadStats()]);
  }, [canViewEmails, loadFolders, loadEmails, loadStats]);

  useEffect(() => {
    if (canViewEmails) {
      setLoading(true);
      loadAllData().finally(() => setLoading(false));
    }
  }, [canViewEmails, activeMailbox, loadAllData]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    toast({ title: "Yenilendi", description: "E-postalar güncellendi" });
  };

  // Search emails
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadEmails();
      return;
    }
    try {
      setLoading(true);
      if (activeMailbox === "all") {
        const searchPromises = REAL_MAILBOXES.map(async (mailbox) => {
          const response = await fetch(`/api/admin/outlook/search?q=${encodeURIComponent(searchQuery)}&userId=${encodeURIComponent(mailbox.value)}`);
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
        combinedResults.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
        setEmails(combinedResults);
      } else {
        const response = await fetch(`/api/admin/outlook/search?q=${encodeURIComponent(searchQuery)}&userId=${encodeURIComponent(activeMailbox)}`);
        const data = await response.json();
        if (data.success) setEmails(data.emails);
      }
    } catch (error) {
      console.error("Error searching emails:", error);
      toast({ title: "Hata", description: "Arama sırasında bir hata oluştu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // View email
  const handleViewEmail = async (email) => {
    try {
      if (emailListRef.current) setScrollPosition(emailListRef.current.scrollTop);
      setEmailAttachments([]);
      const mailboxToUse = email._mailbox || activeMailbox;
      const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(email.id)}?userId=${encodeURIComponent(mailboxToUse)}`);
      const data = await response.json();
      if (data.success) {
        setSelectedEmail({
          ...data.email,
          _mailbox: email._mailbox,
          _mailboxLabel: email._mailboxLabel,
          _mailboxColor: email._mailboxColor,
        });
        setViewMode("detail");
        if (!email.isRead) await markAsRead(email.id, mailboxToUse);
        if (email.hasAttachments) loadEmailAttachments(email.id, mailboxToUse);
      }
    } catch (error) {
      console.error("Error viewing email:", error);
      toast({ title: "Hata", description: "E-posta yüklenirken bir hata oluştu", variant: "destructive" });
    }
  };

  // Load attachments
  const loadEmailAttachments = async (emailId, mailbox = null) => {
    try {
      setLoadingAttachments(true);
      const mailboxToUse = mailbox || selectedEmail?._mailbox || activeMailbox;
      const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(emailId)}/attachments?userId=${encodeURIComponent(mailboxToUse)}`);
      const data = await response.json();
      if (data.success) setEmailAttachments(data.attachments || []);
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
      if (attachment.contentBytes) {
        const byteCharacters = atob(attachment.contentBytes);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
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
        const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(selectedEmail.id)}/attachments?userId=${encodeURIComponent(mailboxToUse)}&attachmentId=${encodeURIComponent(attachment.id)}`);
        const data = await response.json();
        if (data.success && data.attachment?.contentBytes) {
          const byteCharacters = atob(data.attachment.contentBytes);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: data.attachment.contentType });
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
      toast({ title: "Hata", description: "Dosya indirilirken bir hata oluştu", variant: "destructive" });
    }
  };

  // Preview attachment
  const handlePreviewAttachment = async (attachment) => {
    if (attachment.contentType?.startsWith("image/")) {
      const mailboxToUse = selectedEmail?._mailbox || activeMailbox;
      if (attachment.contentBytes) {
        setPreviewAttachment({ ...attachment, dataUrl: `data:${attachment.contentType};base64,${attachment.contentBytes}` });
      } else {
        const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(selectedEmail.id)}/attachments?userId=${encodeURIComponent(mailboxToUse)}&attachmentId=${encodeURIComponent(attachment.id)}`);
        const data = await response.json();
        if (data.success && data.attachment?.contentBytes) {
          setPreviewAttachment({ ...data.attachment, dataUrl: `data:${data.attachment.contentType};base64,${data.attachment.contentBytes}` });
        }
      }
    }
  };

  // Handle file select for compose
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.size > 25 * 1024 * 1024) {
        toast({ title: "Uyarı", description: `${file.name} dosyası 25MB'dan büyük`, variant: "destructive" });
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        const isImage = file.type?.startsWith("image/");
        setComposeAttachments((prev) => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size,
          contentBytes: base64,
          preview: isImage ? reader.result : null,
        }]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeComposeAttachment = (index) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Mark as read/unread
  const markAsRead = async (emailId, mailbox = null) => {
    try {
      const mailboxToUse = mailbox || activeMailbox;
      const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(emailId)}/read?userId=${encodeURIComponent(mailboxToUse)}&isRead=true`, { method: "PATCH" });
      const data = await response.json();
      if (data.success) {
        setEmails(emails.map((e) => (e.id === emailId ? { ...e, isRead: true } : e)));
        loadStats();
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAsUnread = async (emailId, mailbox = null) => {
    try {
      const mailboxToUse = mailbox || activeMailbox;
      const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(emailId)}/read?userId=${encodeURIComponent(mailboxToUse)}&isRead=false`, { method: "PATCH" });
      const data = await response.json();
      if (data.success) {
        setEmails(emails.map((e) => (e.id === emailId ? { ...e, isRead: false } : e)));
        loadStats();
        toast({ title: "Başarılı", description: "E-posta okunmadı olarak işaretlendi" });
      }
    } catch (error) {
      console.error("Error marking as unread:", error);
    }
  };

  const toggleReadStatus = async (email, e) => {
    e?.stopPropagation();
    const mailboxToUse = email._mailbox || activeMailbox;
    if (email.isRead) {
      await markAsUnread(email.id, mailboxToUse);
    } else {
      await markAsRead(email.id, mailboxToUse);
    }
  };

  // Send email
  const handleSendEmail = async () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      toast({ title: "Uyarı", description: "Lütfen tüm zorunlu alanları doldurun", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/admin/outlook/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeForm.to.split(",").map((e) => e.trim()),
          cc: composeForm.cc ? composeForm.cc.split(",").map((e) => e.trim()) : [],
          subject: composeForm.subject,
          body: composeForm.body,
          userId: composeForm.from,
          attachments: composeAttachments.map((a) => ({ name: a.name, contentType: a.contentType, contentBytes: a.contentBytes })),
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "E-posta başarıyla gönderildi" });
        setViewMode("list");
        setComposeForm({ from: activeMailbox === "all" ? REAL_MAILBOXES[0].value : activeMailbox, to: "", cc: "", subject: "", body: "" });
        setComposeAttachments([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({ title: "Hata", description: "E-posta gönderilirken bir hata oluştu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Reply
  const handleReply = async () => {
    if (!replyText.trim()) {
      toast({ title: "Uyarı", description: "Lütfen cevap metnini yazın", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const mailboxToUse = selectedEmail?._mailbox || activeMailbox;
      const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(selectedEmail.id)}/reply?userId=${encodeURIComponent(mailboxToUse)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: replyText }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "Cevap başarıyla gönderildi" });
        setShowReply(false);
        setReplyText("");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error replying:", error);
      toast({ title: "Hata", description: "Cevap gönderilirken bir hata oluştu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (emailId) => {
    if (!window.confirm("Bu e-postayı silmek istediğinizden emin misiniz?")) return;
    try {
      const mailboxToUse = selectedEmail?._mailbox || activeMailbox;
      const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(emailId)}?userId=${encodeURIComponent(mailboxToUse)}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "E-posta silindi" });
        loadEmails();
        loadStats();
        goBackToList();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast({ title: "Hata", description: "E-posta silinirken bir hata oluştu", variant: "destructive" });
    }
  };

  const handleDeleteFromList = async (email, e) => {
    e?.stopPropagation();
    if (!window.confirm("Bu e-postayı silmek istediğinizden emin misiniz?")) return;
    try {
      const mailboxToUse = email._mailbox || activeMailbox;
      const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(email.id)}?userId=${encodeURIComponent(mailboxToUse)}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "E-posta silindi" });
        setEmails((prev) => prev.filter((e) => e.id !== email.id));
        loadStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast({ title: "Hata", description: "E-posta silinirken bir hata oluştu", variant: "destructive" });
    }
  };

  // Move email
  const handleMoveEmail = async (destinationId) => {
    if (!moveEmailId || !destinationId) return;
    try {
      setLoading(true);
      const mailboxToUse = moveEmailMailbox || activeMailbox;
      const response = await fetch(`/api/admin/outlook/emails/${encodeURIComponent(moveEmailId)}/move?userId=${encodeURIComponent(mailboxToUse)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Başarılı", description: "E-posta taşındı" });
        setEmails((prev) => prev.filter((e) => e.id !== moveEmailId));
        loadStats();
        setShowMoveDialog(false);
        setMoveEmailId(null);
        setMoveEmailMailbox(null);
        if (selectedEmail?.id === moveEmailId) goBackToList();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error moving email:", error);
      toast({ title: "Hata", description: "E-posta taşınırken bir hata oluştu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openMoveDialog = (email, e) => {
    e?.stopPropagation();
    setMoveEmailId(email.id);
    setMoveEmailMailbox(email._mailbox || activeMailbox);
    setShowMoveDialog(true);
  };

  // Thread helpers
  const toggleThread = (threadId) => {
    setExpandedThreads((prev) => ({ ...prev, [threadId]: !prev[threadId] }));
  };

  const parseConversationThread = (emailBody) => {
    if (!emailBody?.content) return { mainContent: emailBody?.content || "", replies: [] };
    const content = emailBody.content;
    const replies = [];
    const replyPatterns = [
      /<div[^>]*class="[^"]*gmail_quote[^"]*"[^>]*>([\s\S]*?)(?=<\/div>\s*$|$)/gi,
      /(<hr[^>]*>)?\s*(<p[^>]*>|<div[^>]*>)?\s*[-_]{3,}\s*(Original Message|Orijinal Mesaj|Özgün İleti)[\s\S]*$/gi,
      /(<hr[^>]*>)?\s*(<p[^>]*>|<div[^>]*>)?\s*(From|Kimden|Gönderen)\s*:\s*[\s\S]*?(Subject|Konu)\s*:[\s\S]*$/gi,
      /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    ];
    let mainContent = content;
    let foundReplies = false;
    for (const pattern of replyPatterns) {
      const firstMatch = content.search(pattern);
      if (firstMatch > 100) {
        mainContent = content.substring(0, firstMatch);
        const replyContent = content.substring(firstMatch);
        if (replyContent.trim().length > 50) {
          replies.push({ id: "thread-1", content: replyContent, isExpanded: false });
          foundReplies = true;
          break;
        }
      }
    }
    return { mainContent, replies, hasThread: foundReplies };
  };

  // Date helpers
  const formatDateFull = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? "Şimdi" : `${minutes}dk`;
    }
    if (hours < 24) return `${hours}sa`;
    if (days < 7) return `${days}g`;
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  // Avatar helpers
  const getInitials = (email) => {
    const name = email?.from?.emailAddress?.name || email?.from?.emailAddress?.address || "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (email) => {
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-rose-500"];
    const hash = (email?.from?.emailAddress?.address || "").split("").reduce((a, b) => { a = (a << 5) - a + b.charCodeAt(0); return a & a; }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Navigation
  const goBackToList = () => {
    setViewMode("list");
    setSelectedEmail(null);
    setShowReply(false);
    setTimeout(() => {
      if (emailListRef.current) emailListRef.current.scrollTop = scrollPosition;
    }, 50);
  };

  const handleMailboxChange = (mailbox) => {
    setActiveMailbox(mailbox);
    setSelectedFolder("inbox");
    setSelectedEmail(null);
    setViewMode("list");
    setScrollPosition(0);
    setLoading(true);
    const defaultSender = mailbox === "all" ? REAL_MAILBOXES[0].value : mailbox;
    setComposeForm((prev) => ({ ...prev, from: defaultSender }));
  };

  const handleFolderChange = (folderId) => {
    setSelectedFolder(folderId);
    setLoading(true);
    loadEmails(folderId).finally(() => setLoading(false));
    setViewMode("list");
  };

  // Loading state
  if (loading && emails.length === 0 && viewMode === "list") {
    return (
      <PermissionGuard requiredPermission="outlook.view">
        <div className="h-full overflow-auto bg-slate-50">
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-48 bg-slate-200" />
              <Skeleton className="h-10 w-32 bg-slate-200" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl bg-slate-200" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Skeleton className="h-80 rounded-xl bg-slate-200" />
              <Skeleton className="h-80 rounded-xl bg-slate-200 lg:col-span-3" />
            </div>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermission="outlook.view">
      <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
        {/* Header */}
        <div className="flex-none bg-white border-b border-slate-200 px-6 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">E-posta</h1>
              <p className="text-xs text-slate-600">
                {activeMailboxInfo.label} • {stats.unreadMessages} okunmamış mesaj
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing} title="Yenile">
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>
              <PermissionGuard requiredPermission="outlook.send">
                <Button onClick={() => { setComposeForm((prev) => ({ ...prev, from: activeMailbox === "all" ? REAL_MAILBOXES[0].value : activeMailbox })); setViewMode("compose"); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni E-posta
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden p-3 gap-2">
          {/* Mailbox Selector Cards */}
          <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-2">
            {SHARED_MAILBOXES.map((mailbox) => {
              const isActive = activeMailbox === mailbox.value;
              const Icon = mailbox.icon;
              return (
                <Card
                  key={mailbox.value}
                  onClick={() => handleMailboxChange(mailbox.value)}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-sm",
                    isActive ? `border-2 ${getMailboxBorderColor(mailbox.color)} shadow-sm` : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", getMailboxBgColor(mailbox.color))}>
                          <Icon className={cn("h-3.5 w-3.5", getMailboxTextColor(mailbox.color))} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{mailbox.label}</p>
                          <p className="text-[10px] text-slate-500">{mailbox.description}</p>
                        </div>
                      </div>
                      {isActive && <Check className={cn("h-4 w-4", getMailboxTextColor(mailbox.color))} />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="flex-none grid grid-cols-4 gap-2">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Okunmamış</p>
                    <div className="text-lg font-bold text-slate-900">{stats.unreadMessages}</div>
                  </div>
                  <div className="p-1.5 bg-blue-50 rounded">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Toplam</p>
                    <div className="text-lg font-bold text-slate-900">{stats.totalMessages}</div>
                  </div>
                  <div className="p-1.5 bg-emerald-50 rounded">
                    <Inbox className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Klasörler</p>
                    <div className="text-lg font-bold text-slate-900">{folders.length}</div>
                  </div>
                  <div className="p-1.5 bg-violet-50 rounded">
                    <Archive className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Hesaplar</p>
                    <div className="text-lg font-bold text-slate-900">{REAL_MAILBOXES.length}</div>
                  </div>
                  <div className="p-1.5 bg-orange-50 rounded">
                    <User className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Full height */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2 min-h-0 overflow-hidden">
            {/* Folders Sidebar */}
            <Card className="bg-white border-slate-200 lg:col-span-1 flex flex-col overflow-hidden">
              <CardHeader className="flex-none border-b border-slate-100 py-1.5 px-3">
                <CardTitle className="text-sm font-medium text-slate-900">Klasörler</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-1.5">
                    {sortFolders(folders).map((folder) => {
                      const folderKey = folder.displayName?.toLowerCase()?.replace(/\s/g, "");
                      const IconComponent = folderIcons[folderKey] || Inbox;
                      const isSelected = selectedFolder === folder.id;
                      const translatedName = translateFolderName(folder.displayName);
                      return (
                        <button
                          key={folder.id}
                          onClick={() => handleFolderChange(folder.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all",
                            isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                          )}
                        >
                          <IconComponent className={cn("h-4 w-4 flex-shrink-0", isSelected && "text-blue-600")} />
                          <span className="flex-1 text-left truncate">{translatedName}</span>
                          {folder.unreadItemCount > 0 && (
                            <Badge className={cn("min-w-[20px] h-5 px-1.5 text-xs", isSelected ? "bg-blue-600 text-white hover:bg-blue-600" : "bg-slate-200 text-slate-600")}>
                              {folder.unreadItemCount}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Email List / Detail / Compose */}
            <Card className="bg-white border-slate-200 lg:col-span-3 flex flex-col overflow-hidden">
              {viewMode === "list" && (
                <>
                  {/* Search Header */}
                  <CardHeader className="flex-none border-b border-slate-100 py-1.5 px-3">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="E-posta ara..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                          className="pl-8 h-7 bg-slate-50 border-slate-200 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-medium">{selectedFolderName}</span>
                        <span className="text-slate-400">•</span>
                        <span>{emails.length} e-posta</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea ref={emailListRef} className="h-full">
                      {loading ? (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                          <div className="text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">E-postalar yükleniyor...</p>
                          </div>
                        </div>
                      ) : emails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-500">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <Inbox className="h-6 w-6 text-slate-300" />
                          </div>
                          <p className="font-medium text-sm">E-posta bulunamadı</p>
                          <p className="text-xs mt-1">Bu klasör boş görünüyor</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {emails.map((email) => (
                            <div
                              key={email.id}
                              onClick={() => handleViewEmail(email)}
                              className={cn(
                                "group flex items-start gap-3 px-3 py-2 cursor-pointer transition-colors",
                                "hover:bg-slate-50",
                                !email.isRead && "bg-blue-50/50"
                              )}
                            >
                              {/* Avatar */}
                              <div className={cn("flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-medium", getAvatarColor(email))}>
                                {getInitials(email)}
                              </div>
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={cn("text-sm truncate", !email.isRead ? "font-semibold text-slate-900" : "text-slate-700")}>
                                    {email.from?.emailAddress?.name || email.from?.emailAddress?.address}
                                  </span>
                                  {email.hasAttachments && <Paperclip className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />}
                                  {activeMailbox === "all" && email._mailboxLabel && (
                                    <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4", getMailboxBorderColor(email._mailboxColor), getMailboxTextColor(email._mailboxColor))}>
                                      {email._mailboxLabel}
                                    </Badge>
                                  )}
                                </div>
                                <p className={cn("text-sm truncate", !email.isRead ? "font-medium text-slate-800" : "text-slate-600")}>
                                  {email.subject || "(Konu yok)"}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-1">{email.bodyPreview}</p>
                              </div>
                              {/* Actions & Date */}
                              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                  <span className={cn("text-xs", !email.isRead ? "text-blue-600 font-medium" : "text-slate-500")}>
                                    {formatDate(email.receivedDateTime)}
                                  </span>
                                  {/* Quick Actions */}
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                    <button onClick={(e) => toggleReadStatus(email, e)} className="p-1 rounded hover:bg-slate-200 transition-colors" title={email.isRead ? "Okunmadı işaretle" : "Okundu işaretle"}>
                                      {email.isRead ? <MailOpen className="h-3.5 w-3.5 text-slate-500" /> : <MailCheck className="h-3.5 w-3.5 text-blue-600" />}
                                    </button>
                                    <button onClick={(e) => openMoveDialog(email, e)} className="p-1 rounded hover:bg-slate-200 transition-colors" title="Taşı">
                                      <FolderInput className="h-3.5 w-3.5 text-slate-500" />
                                    </button>
                                    <PermissionGuard requiredPermission="outlook.delete">
                                      <button onClick={(e) => handleDeleteFromList(email, e)} className="p-1 rounded hover:bg-red-100 transition-colors" title="Sil">
                                        <Trash2 className="h-3.5 w-3.5 text-slate-500 hover:text-red-600" />
                                      </button>
                                    </PermissionGuard>
                                  </div>
                                </div>
                                {!email.isRead && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </>
              )}

              {viewMode === "detail" && selectedEmail && (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Detail Header */}
                  <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <Button variant="ghost" size="sm" onClick={goBackToList} className="gap-1 h-7">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span className="text-xs">Geri</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => {
                        const mailboxToUse = selectedEmail._mailbox || activeMailbox;
                        if (selectedEmail.isRead) {
                          markAsUnread(selectedEmail.id, mailboxToUse);
                          setSelectedEmail((prev) => ({ ...prev, isRead: false }));
                        } else {
                          markAsRead(selectedEmail.id, mailboxToUse);
                          setSelectedEmail((prev) => ({ ...prev, isRead: true }));
                        }
                      }}>
                        {selectedEmail.isRead ? <MailOpen className="h-3.5 w-3.5" /> : <MailCheck className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => openMoveDialog(selectedEmail)}>
                        <FolderInput className="h-3.5 w-3.5" />
                      </Button>
                      <PermissionGuard requiredPermission="outlook.send">
                        <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setShowReply(true)}>
                          <Reply className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Yanıtla</span>
                        </Button>
                      </PermissionGuard>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setComposeForm({
                              from: selectedEmail._mailbox || activeMailbox,
                              to: "",
                              cc: "",
                              subject: `FW: ${selectedEmail.subject || ""}`,
                              body: `\n\n---------- Forwarded message ----------\nFrom: ${selectedEmail.from?.emailAddress?.address}\nDate: ${formatDateFull(selectedEmail.receivedDateTime)}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body?.content?.replace(/<[^>]*>/g, "") || ""}`,
                            });
                            setViewMode("compose");
                          }}>
                            <Forward className="h-4 w-4 mr-2" />
                            İlet
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const archiveFolder = folders.find((f) => f.displayName?.toLowerCase() === "archive" || f.displayName?.toLowerCase() === "arşiv");
                            if (archiveFolder) {
                              setMoveEmailId(selectedEmail.id);
                              setMoveEmailMailbox(selectedEmail._mailbox || activeMailbox);
                              handleMoveEmail(archiveFolder.id);
                            }
                          }}>
                            <Archive className="h-4 w-4 mr-2" />
                            Arşivle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <PermissionGuard requiredPermission="outlook.delete">
                            <DropdownMenuItem onClick={() => handleDelete(selectedEmail.id)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Email Content */}
                  <ScrollArea className="flex-1 overflow-auto">
                    <div className="p-4">
                      {/* Subject */}
                      <h2 className="text-base font-semibold text-slate-900 mb-4">{selectedEmail.subject || "(Konu yok)"}</h2>
                      {/* Sender Info */}
                      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-100">
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-medium", getAvatarColor(selectedEmail))}>
                          {getInitials(selectedEmail)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-slate-900 text-sm truncate">{selectedEmail.from?.emailAddress?.name || selectedEmail.from?.emailAddress?.address}</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-1.5 truncate">{selectedEmail.from?.emailAddress?.address}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                            <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                              <User className="h-2.5 w-2.5" />
                              Kime: {selectedEmail.toRecipients?.map((r) => r.emailAddress?.address).join(", ")}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(selectedEmail.receivedDateTime).toLocaleString("tr-TR")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Attachments */}
                      {selectedEmail.hasAttachments && (
                        <div className="mb-4 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Paperclip className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-xs font-medium text-slate-700">Ekler {loadingAttachments && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}</span>
                          </div>
                          {emailAttachments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {emailAttachments.map((attachment) => {
                                const FileIcon = getFileIcon(attachment.contentType, attachment.name);
                                const isImage = attachment.contentType?.startsWith("image/");
                                return (
                                  <div key={attachment.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 group">
                                    <div className={cn("w-7 h-7 rounded flex items-center justify-center", isImage ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600")}>
                                      <FileIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-slate-700 truncate">{attachment.name}</p>
                                      <p className="text-[10px] text-slate-500">{formatFileSize(attachment.size)}</p>
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {isImage && (
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handlePreviewAttachment(attachment)}>
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      )}
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownloadAttachment(attachment)}>
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : !loadingAttachments && <p className="text-xs text-slate-500">Ekler yüklenemedi</p>}
                        </div>
                      )}

                      {/* Body */}
                      {(() => {
                        const { mainContent, replies, hasThread } = parseConversationThread(selectedEmail.body);
                        return (
                          <div className="space-y-3">
                            <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-600 text-sm" dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(mainContent) }} />
                            {hasThread && replies.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <Collapsible open={expandedThreads[selectedEmail.id]} onOpenChange={() => toggleThread(selectedEmail.id)}>
                                  <CollapsibleTrigger asChild>
                                    <button className="flex items-center gap-2 w-full p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                      <div className="flex items-center justify-center w-5 h-5 rounded bg-slate-200">
                                        {expandedThreads[selectedEmail.id] ? <ChevronDown className="h-3 w-3 text-slate-600" /> : <ChevronRight className="h-3 w-3 text-slate-600" />}
                                      </div>
                                      <div className="flex-1 text-left">
                                        <span className="text-xs font-medium text-slate-700">Önceki mesajlar</span>
                                      </div>
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{replies.length} mesaj</Badge>
                                    </button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="mt-2 pl-3 border-l-2 border-slate-200">
                                      {replies.map((reply, index) => (
                                        <div key={reply.id || index} className="py-2 px-3 bg-slate-50 rounded-lg mb-1.5 text-sm">
                                          <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(reply.content) }} />
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
                  </ScrollArea>

                  {/* Reply Panel */}
                  {showReply && (
                    <div className="border-t border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 mb-2 text-xs text-slate-600">
                        <Reply className="h-3.5 w-3.5" />
                        <span>Yanıtla: {selectedEmail.from?.emailAddress?.address}</span>
                      </div>
                      <Textarea placeholder="Cevabınızı yazın..." rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} className="mb-2 bg-white border-slate-200 text-sm" />
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setShowReply(false); setReplyText(""); }}>İptal</Button>
                        <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1" onClick={handleReply} disabled={loading}>
                          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          Gönder
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {viewMode === "compose" && (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Compose Header */}
                  <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode("list")}><X className="h-3.5 w-3.5" /></Button>
                      <h2 className="font-semibold text-slate-900 text-sm">Yeni E-posta</h2>
                    </div>
                    <Button onClick={handleSendEmail} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 h-7 text-xs">
                      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Gönder
                    </Button>
                  </div>

                  {/* Compose Form */}
                  <ScrollArea className="flex-1 overflow-auto">
                    <div className="p-4 space-y-3">
                      {/* Sender */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Gönderici</label>
                        <Select value={composeForm.from} onValueChange={(value) => setComposeForm({ ...composeForm, from: value })}>
                          <SelectTrigger className="bg-white border-slate-200 h-8 text-sm">
                            <SelectValue placeholder="Gönderici seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {REAL_MAILBOXES.map((mailbox) => (
                              <SelectItem key={mailbox.value} value={mailbox.value}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-5 h-5 rounded flex items-center justify-center", getMailboxBgColor(mailbox.color))}>
                                    <Mail className={cn("h-2.5 w-2.5", getMailboxTextColor(mailbox.color))} />
                                  </div>
                                  <span className="text-sm">{mailbox.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* To */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Kime <span className="text-red-500">*</span></label>
                        <Input placeholder="ornek@email.com" value={composeForm.to} onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })} className="bg-white border-slate-200 h-8 text-sm" />
                      </div>
                      {/* CC */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">CC</label>
                        <Input placeholder="ornek@email.com" value={composeForm.cc} onChange={(e) => setComposeForm({ ...composeForm, cc: e.target.value })} className="bg-white border-slate-200 h-8 text-sm" />
                      </div>
                      {/* Subject */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Konu <span className="text-red-500">*</span></label>
                        <Input placeholder="E-posta konusu" value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} className="bg-white border-slate-200 h-8 text-sm" />
                      </div>
                      {/* Body */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Mesaj <span className="text-red-500">*</span></label>
                        <Textarea placeholder="E-posta içeriğinizi yazın..." rows={8} value={composeForm.body} onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })} className="bg-white border-slate-200 resize-none text-sm" />
                      </div>
                      {/* Attachments */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-700">Ekler</label>
                          <Button type="button" variant="outline" size="sm" className="gap-1 h-6 text-xs" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-3 w-3" />
                            Dosya Ekle
                          </Button>
                          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                        </div>
                        {composeAttachments.length > 0 && (
                          <div className="space-y-1.5">
                            {composeAttachments.map((file, index) => {
                              const FileIcon = getFileIcon(file.contentType, file.name);
                              const isImage = file.contentType?.startsWith("image/");
                              return (
                                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 group">
                                  <div className={cn("w-7 h-7 rounded flex items-center justify-center", isImage ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600")}>
                                    <FileIcon className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                                    <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                                  </div>
                                  {isImage && file.preview && <img src={file.preview} alt={file.name} className="w-7 h-7 rounded object-cover" />}
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeComposeAttachment(index)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewAttachment?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-slate-100 rounded-lg min-h-[400px]">
            {previewAttachment?.contentType?.startsWith("image/") ? (
              <img src={previewAttachment.dataUrl || `data:${previewAttachment.contentType};base64,${previewAttachment.contentBytes}`} alt={previewAttachment.name} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
            ) : (
              <div className="text-center py-12">
                <File className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Bu dosya türü önizlenemez</p>
                <Button className="mt-4" onClick={() => handleDownloadAttachment(previewAttachment)}>
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-500">{previewAttachment?.size && formatFileSize(previewAttachment.size)}</span>
            <Button onClick={() => handleDownloadAttachment(previewAttachment)} className="gap-2">
              <Download className="h-4 w-4" />
              İndir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Email Modal */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderInput className="h-5 w-5" />
              E-postayı Taşı
            </DialogTitle>
            <DialogDescription>E-postayı taşımak istediğiniz klasörü seçin</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {sortFolders(folders).map((folder) => {
                  const folderKey = folder.displayName?.toLowerCase()?.replace(/\s/g, "");
                  const IconComponent = folderIcons[folderKey] || Inbox;
                  const translatedName = translateFolderName(folder.displayName);
                  const isCurrentFolder = folder.id === selectedFolder;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleMoveEmail(folder.id)}
                      disabled={loading || isCurrentFolder}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
                        isCurrentFolder && "opacity-50 cursor-not-allowed bg-slate-50"
                      )}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{translatedName}</span>
                      {isCurrentFolder && <Badge variant="secondary" className="text-xs">Mevcut</Badge>}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowMoveDialog(false); setMoveEmailId(null); setMoveEmailMailbox(null); }}>İptal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
