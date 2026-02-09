"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import * as socialMediaService from "@/lib/services/social-media-service";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/components/admin-route-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import MobilePreview from "@/components/admin/mobile-preview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Search,
  Copy,
  Trash2,
  Instagram,
  Facebook,
  Linkedin,
  Edit3,
  Layers,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Archive,
  Plus,
  ImageIcon,
  Smartphone,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// X Icon (Twitter/X)
const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const PLATFORM_CONFIG = {
  instagram: { icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500", label: "Instagram" },
  facebook: { icon: Facebook, color: "bg-blue-600", label: "Facebook" },
  x: { icon: XIcon, color: "bg-slate-900", label: "X" },
  linkedin: { icon: Linkedin, color: "bg-blue-700", label: "LinkedIn" },
};

const CONTENT_TYPE_LABELS = {
  post: "Post",
  reel: "Reel",
  story: "Story",
  video: "Video",
  tweet: "Tweet",
  thread: "Thread",
  carousel: "Carousel",
};

const ITEMS_PER_PAGE = 12;

// Helper: Get image URL from content
function getContentImage(content) {
  const c = content.content;
  if (!c) return null;
  
  // En önemli: image objesi içindeki url (Firebase'den gelen format)
  if (c.image?.url) return c.image.url;
  
  // Direkt content seviyesinde görsel
  if (content.imageUrl) return content.imageUrl;
  if (content.visualUrl) return content.visualUrl;
  if (content.generatedImageUrl) return content.generatedImageUrl;
  
  // Content.content içinde görsel alanları
  const imageFields = [
    "imageUrl", 
    "visualUrl", 
    "thumbnail", 
    "coverImage", 
    "mediaUrl",
    "generatedImageUrl",
    "selectedImageUrl"
  ];
  
  for (const field of imageFields) {
    if (c[field]) return c[field];
  }
  
  // Nested objeler
  if (c.visual?.url) return c.visual.url;
  if (c.visual?.imageUrl) return c.visual.imageUrl;
  if (c.media?.url) return c.media.url;
  if (c.selectedImage?.url) return c.selectedImage.url;
  
  // Array içinde görseller
  if (c.images && Array.isArray(c.images) && c.images[0]) {
    return typeof c.images[0] === "string" ? c.images[0] : c.images[0]?.url;
  }
  
  if (c.generatedImageUrls && Array.isArray(c.generatedImageUrls) && c.generatedImageUrls[0]) {
    return c.generatedImageUrls[0];
  }
  
  if (c.aiGeneratedImages && Array.isArray(c.aiGeneratedImages) && c.aiGeneratedImages[0]) {
    return typeof c.aiGeneratedImages[0] === "string" ? c.aiGeneratedImages[0] : c.aiGeneratedImages[0]?.url;
  }
  
  return null;
}

// Helper: Get preview text
function getPreviewText(content) {
  const c = content.content;
  if (typeof c === "string") return c;
  if (!c || typeof c !== "object") return "";
  
  const fields = ["caption", "fullCaption", "fullPost", "tweetText", "text", "hook", "description"];
  for (const field of fields) {
    if (c[field]) return c[field];
  }
  return "";
}

// Helper: Get hashtags
function getHashtags(content) {
  const c = content.content;
  if (!c) return "";
  if (c.hashtags) {
    return Array.isArray(c.hashtags) ? c.hashtags.join(" ") : c.hashtags;
  }
  return "";
}

// Stat Card
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// Content Card with Image
function ContentCard({ content, onEdit, onCopy, onDelete, onClick, canDelete }) {
  const platform = PLATFORM_CONFIG[content.platform] || {};
  const PlatformIcon = platform.icon || FileText;
  const imageUrl = getContentImage(content);
  const previewText = getPreviewText(content);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(date);
  };

  return (
    <div 
      className="group bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick(content)}
    >
      {/* Image Area */}
      <div className="relative aspect-square bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Content"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <ImageIcon className="w-12 h-12 text-slate-300" />
          </div>
        )}
        
        {/* Platform Badge */}
        <div className={cn("absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center shadow-md", platform.color)}>
          <PlatformIcon className="w-4 h-4 text-white" />
        </div>

        {/* Content Type Badge */}
        <Badge className="absolute top-2 right-2 bg-white/90 text-slate-700 text-[10px] shadow-sm">
          {CONTENT_TYPE_LABELS[content.contentType] || content.contentType}
        </Badge>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Heart className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(content)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Duzenle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(previewText)}>
                <Copy className="w-4 h-4 mr-2" />
                Kopyala
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(content.id)} className="text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3">
        <p className="text-xs text-slate-600 line-clamp-2 mb-2 min-h-[2rem]">
          {previewText.substring(0, 80) || "Icerik"}...
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400">{formatDate(content.createdAt)}</span>
          <Badge variant="secondary" className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0">
            {content.aiModel || "AI"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// Mobile Preview Dialog
function MobilePreviewDialog({ open, onOpenChange, content }) {
  if (!content) return null;

  const imageUrl = getContentImage(content);
  const previewText = getPreviewText(content);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors z-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Phone Frame with Real MobilePreview Component */}
          <div className="relative w-[360px] mx-auto bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-10" />
            
            <div className="w-full h-[700px] bg-white rounded-[2.5rem] overflow-hidden">
              <MobilePreview
                platform={content.platform || "instagram"}
                contentType={content.contentType || "post"}
                content={content.content || {}}
                image={imageUrl}
              />
            </div>
          </div>

          {/* Action Buttons Below Phone */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(previewText);
                toast.success("Panoya kopyalandi");
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Kopyala
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                const dataStr = JSON.stringify(content, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `content-${content.id}.json`;
                link.click();
                URL.revokeObjectURL(url);
                toast.success("JSON indirildi");
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Indir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Empty State
function EmptyState({ hasFilters, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
        <Archive className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        {hasFilters ? "Sonuc bulunamadi" : "Henuz icerik yok"}
      </h3>
      <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">
        {hasFilters
          ? "Farkli filtreler deneyebilirsiniz"
          : "AI ile hemen icerik olusturmaya baslayin"}
      </p>
      {!hasFilters && (
        <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Icerik Olustur
        </Button>
      )}
    </div>
  );
}

// Main Page
export default function ContentListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [selectedContent, setSelectedContent] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setLoading(true);
      const data = await socialMediaService.getAllGeneratedContents();
      setContents(data);
    } catch (error) {
      console.error("Error loading contents:", error);
      toast.error("Icerikler yuklenirken hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents
    .filter((content) => {
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          content.title?.toLowerCase().includes(search) ||
          content.platform?.toLowerCase().includes(search) ||
          JSON.stringify(content.content).toLowerCase().includes(search)
        );
      }
      return true;
    })
    .filter((content) => platformFilter === "all" || content.platform === platformFilter)
    .filter((content) => contentTypeFilter === "all" || content.contentType === contentTypeFilter)
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentContents = filteredContents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleEdit = (content) => {
    sessionStorage.setItem("editingContent", JSON.stringify(content));
    router.push("/admin/social-media/content-studio?mode=edit");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Panoya kopyalandi");
  };

  const handleDelete = async (contentId) => {
    if (!confirm("Bu icerigi silmek istediginize emin misiniz?")) return;
    try {
      await socialMediaService.deleteGeneratedContent(contentId);
      toast.success("Icerik silindi");
      loadContents();
    } catch (error) {
      toast.error("Icerik silinirken hata olustu");
    }
  };

  const handleCardClick = (content) => {
    setSelectedContent(content);
    setPreviewOpen(true);
  };

  const hasFilters = searchQuery || platformFilter !== "all" || contentTypeFilter !== "all";

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Icerik Arsivi</h1>
          <p className="text-sm text-slate-500 mt-1">Olusturdugunu tum icerikleri goruntuleyin</p>
        </div>
        <Button onClick={() => router.push("/admin/social-media/content-studio")} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Icerik
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Toplam Icerik" value={contents.length} icon={Layers} color="bg-emerald-500" />
        <StatCard label="Bu Ay" value={contents.filter(c => {
          const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt || 0);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length} icon={FileText} color="bg-blue-500" />
        <StatCard label="Platform" value={new Set(contents.map(c => c.platform)).size} icon={Archive} color="bg-violet-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Icerik ara..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-10 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum Platformlar</SelectItem>
            {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={contentTypeFilter} onValueChange={(v) => { setContentTypeFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full sm:w-[140px] h-10 bg-white">
            <SelectValue placeholder="Tip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum Tipler</SelectItem>
            {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : filteredContents.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onCreate={() => router.push("/admin/social-media/content-studio")} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentContents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onDelete={handleDelete}
                onClick={handleCardClick}
                canDelete={hasPermission("social_media.delete")}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600 px-3">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Mobile Preview Dialog */}
      <MobilePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        content={selectedContent}
      />
    </div>
  );
}
