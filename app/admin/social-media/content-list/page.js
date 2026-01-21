"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as socialMediaService from "@/lib/services/social-media-service";
import {
  PermissionGuard,
  usePermissions,
} from "@/components/admin-route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Copy,
  Trash2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft,
  Edit3,
  Library,
  Filter,
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  Layers,
  Download,
  FileText,
  Clock,
} from "lucide-react";
import MobilePreview from "@/components/admin/mobile-preview";
import { PLATFORMS } from "@/lib/constants/content-studio";

const PLATFORM_CONFIG = {
  instagram: {
    label: "Instagram",
    icon: Instagram,
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    bgLight: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  facebook: {
    label: "Facebook",
    icon: Facebook,
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  x: {
    label: "X",
    icon: Twitter,
    gradient: "from-gray-800 to-gray-900",
    bgLight: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  },
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
    gradient: "from-blue-600 to-blue-700",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
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

const ITEMS_PER_PAGE = 10;

export default function ContentListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
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

  useEffect(() => {
    filterContents();
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchQuery, platformFilter, contentTypeFilter, contents]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const data = await socialMediaService.getAllGeneratedContents();
      setContents(data);
    } catch (error) {
      console.error("Error loading contents:", error);
      toast.error("İçerikler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const filterContents = () => {
    let filtered = [...contents];

    if (searchQuery) {
      const searchText = searchQuery.toLowerCase();
      filtered = filtered.filter((content) => {
        return (
          content.title?.toLowerCase().includes(searchText) ||
          content.platform?.toLowerCase().includes(searchText) ||
          content.contentType?.toLowerCase().includes(searchText) ||
          JSON.stringify(content.content).toLowerCase().includes(searchText)
        );
      });
    }

    if (platformFilter !== "all") {
      filtered = filtered.filter(
        (content) => content.platform === platformFilter,
      );
    }

    if (contentTypeFilter !== "all") {
      filtered = filtered.filter(
        (content) => content.contentType === contentTypeFilter,
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    setFilteredContents(filtered);
  };

  const handleDelete = async (contentId, e) => {
    e.stopPropagation();
    if (!confirm("Bu içeriği silmek istediğinize emin misiniz?")) return;

    try {
      await socialMediaService.deleteGeneratedContent(contentId);
      toast.success("İçerik silindi");
      loadContents();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("İçerik silinirken hata oluştu");
    }
  };

  const handleCopy = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Panoya kopyalandı");
  };

  const handlePreview = (content, e) => {
    e.stopPropagation();
    setSelectedContent(content);
    setPreviewOpen(true);
  };

  const handleEdit = (content) => {
    // Store content in sessionStorage for content-studio to load
    sessionStorage.setItem("editingContent", JSON.stringify(content));
    router.push("/admin/social-media/content-studio?mode=edit");
  };

  const getContentPreview = (content) => {
    const c = content.content;

    // If content is a string, return it
    if (typeof c === "string") return c.substring(0, 150);

    // If content is not an object, return default
    if (!c || typeof c !== "object") return "İçerik mevcut değil";

    // Try different content field patterns based on platform and type

    // Instagram Reel
    if (content.platform === "instagram" && content.contentType === "reel") {
      if (c.captionForReel) return c.captionForReel;
      if (c.reelConcept) return c.reelConcept;
      if (c.script?.hook?.onScreenText) return c.script.hook.onScreenText;
    }

    // Instagram Post/Story
    if (
      content.platform === "instagram" &&
      (content.contentType === "post" || content.contentType === "story")
    ) {
      if (c.caption) return c.caption;
      if (c.fullCaption) return c.fullCaption;
      if (c.storyConcept) return c.storyConcept;
      if (c.storyText) return c.storyText;
    }

    // LinkedIn Post
    if (content.platform === "linkedin" && content.contentType === "post") {
      if (c.fullPost) return c.fullPost;
      if (c.hook) return c.hook;
      if (c.postStructure?.openingHook) return c.postStructure.openingHook;
    }

    // X (Twitter) Tweet/Thread
    if (content.platform === "x") {
      if (c.tweetText) return c.tweetText;
      if (c.fullText) return c.fullText;
      if (c.tweets && Array.isArray(c.tweets) && c.tweets[0]) {
        return (
          c.tweets[0].text ||
          (typeof c.tweets[0] === "string" ? c.tweets[0] : "")
        );
      }
    }

    // Facebook Post/Video
    if (content.platform === "facebook") {
      if (c.caption) return c.caption;
      if (c.fullCaption) return c.fullCaption;
      if (c.reelConcept) return c.reelConcept; // Facebook video uses reel structure
      if (c.postText) return c.postText;
    }

    // Generic fallback - try common fields
    if (c.caption) return c.caption;
    if (c.fullCaption) return c.fullCaption;
    if (c.fullPost) return c.fullPost;
    if (c.fullText) return c.fullText;
    if (c.text) return c.text;
    if (c.hook) return c.hook;
    if (c.content)
      return typeof c.content === "string"
        ? c.content
        : JSON.stringify(c.content).substring(0, 150);

    // If we have any text content, show first available string value
    const firstTextValue = Object.values(c).find(
      (v) => typeof v === "string" && v.length > 10,
    );
    if (firstTextValue) return firstTextValue;

    return "İçerik mevcut değil";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Tarih yok";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Pagination
  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentContents = filteredContents.slice(startIndex, endIndex);
  const goToPage = (page) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const availableContentTypes = [
    ...new Set(contents.map((c) => c.contentType)),
  ];

  const exportToJSON = (content, e) => {
    e?.stopPropagation();
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `content-${content.platform}-${content.contentType}-${content.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("JSON olarak indirildi");
  };

  return (
    <PermissionGuard requiredPermission="social_media.read">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Modern Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push("/admin/social-media/content-studio")
                  }
                  className="hover:bg-purple-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Stüdyo
                </Button>

                <div className="h-6 w-px bg-gray-200" />

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-lg opacity-30" />
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-2 shadow-lg">
                      <Layers className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      İçerik Kütüphanesi
                    </h1>
                    <p className="text-sm text-gray-500">
                      {filteredContents.length} içerik
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Section - Stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <div className="text-left">
                    <div className="text-xs text-gray-600">Toplam</div>
                    <div className="text-lg font-bold text-purple-600">
                      {contents.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6 max-w-7xl">
          {/* Modern Filters */}
          <Card className="mb-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="İçerik, başlık veya platform ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>

                {/* Platform Filter */}
                <Select
                  value={platformFilter}
                  onValueChange={setPlatformFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px] h-10 bg-white border-gray-200">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Filter className="h-3 w-3" />
                        Tüm Platformlar
                      </div>
                    </SelectItem>
                    {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Content Type Filter */}
                <Select
                  value={contentTypeFilter}
                  onValueChange={setContentTypeFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px] h-10 bg-white border-gray-200">
                    <SelectValue placeholder="İçerik Tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3" />
                        Tüm Tipler
                      </div>
                    </SelectItem>
                    {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <Sparkles className="h-6 w-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">
                İçerikler yükleniyor...
              </p>
            </div>
          ) : filteredContents.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-20" />
                  <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-full p-6">
                    <FileText className="h-12 w-12 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  İçerik Bulunamadı
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery ||
                  platformFilter !== "all" ||
                  contentTypeFilter !== "all"
                    ? "Filtrelere uygun içerik bulunamadı. Farklı filtreler deneyin."
                    : "Henüz hiç içerik oluşturulmamış. Hemen başlayın!"}
                </p>
                <Button
                  onClick={() =>
                    router.push("/admin/social-media/content-studio")
                  }
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  İçerik Oluştur
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentContents.map((content) => {
                  const platformConfig =
                    PLATFORM_CONFIG[content.platform] || {};
                  const PlatformIcon = platformConfig.icon || Library;
                  const isVideo =
                    content.contentType === "reel" ||
                    content.contentType === "video";

                  return (
                    <div key={content.id} className="group relative">
                      {/* Clean Card - No nested borders */}
                      <div className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                        {/* Mobile Preview - Click isolated */}
                        <div
                          className="relative bg-gradient-to-br from-slate-50 to-white p-4 flex items-center justify-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MobilePreview
                            platform={content.platform}
                            contentType={content.contentType}
                            content={content.content}
                            image={
                              content.image?.images?.[0]?.url ||
                              content.image?.url
                            }
                            images={content.image?.images?.map(
                              (img) => img.url,
                            )}
                            isVideo={isVideo}
                          />
                        </div>

                        {/* Floating Action Buttons */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleEdit(content)}
                            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-gray-200/50"
                            title="Düzenle"
                          >
                            <Edit3 className="h-4 w-4 text-purple-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(getContentPreview(content), e);
                            }}
                            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-gray-200/50"
                            title="Kopyala"
                          >
                            <Copy className="h-4 w-4 text-green-600" />
                          </button>
                          {hasPermission("social_media.delete") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(content.id, e);
                              }}
                              className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-gray-200/50"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          )}
                        </div>

                        {/* Minimal Info Bar - Bottom overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent p-4 pt-8">
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                              <div
                                className={`bg-gradient-to-r ${platformConfig?.gradient} rounded-md p-1.5`}
                              >
                                <PlatformIcon className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs font-medium">
                                {content.contentType}
                              </span>
                            </div>
                            <span className="text-xs opacity-90">
                              {formatDate(content.createdAt).split(",")[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Show first page, last page, current page and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(page)}
                              className={`rounded-lg min-w-[40px] ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                                  : ""
                              }`}
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="flex items-center gap-3">
                {selectedContent && (
                  <>
                    <div
                      className={`bg-gradient-to-br ${
                        PLATFORM_CONFIG[selectedContent.platform]?.gradient
                      } rounded-lg p-2 shadow-md`}
                    >
                      {(() => {
                        const Icon =
                          PLATFORM_CONFIG[selectedContent.platform]?.icon ||
                          FileText;
                        return <Icon className="h-5 w-5 text-white" />;
                      })()}
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {selectedContent.title || "İçerik Önizleme"}
                      </div>
                      <div className="text-sm font-normal text-gray-500">
                        {PLATFORM_CONFIG[selectedContent.platform]?.label} •{" "}
                        {CONTENT_TYPE_LABELS[selectedContent.contentType]}
                      </div>
                    </div>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2">
              {selectedContent && (
                <div className="space-y-4 py-4">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <Label className="text-xs text-gray-600 mb-1 block">
                        Platform
                      </Label>
                      <p className="text-sm font-semibold text-purple-600">
                        {PLATFORM_CONFIG[selectedContent.platform]?.label}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <Label className="text-xs text-gray-600 mb-1 block">
                        Tip
                      </Label>
                      <p className="text-sm font-semibold text-blue-600">
                        {CONTENT_TYPE_LABELS[selectedContent.contentType]}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <Label className="text-xs text-gray-600 mb-1 block">
                        AI Model
                      </Label>
                      <p className="text-sm font-semibold text-green-600">
                        {selectedContent.aiModel || "Belirtilmemiş"}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <Label className="text-xs text-gray-600 mb-1 block">
                        Tarih
                      </Label>
                      <p className="text-sm font-semibold text-orange-600">
                        {formatDate(selectedContent.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {selectedContent.image?.url && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Görsel
                      </Label>
                      <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                        <img
                          src={selectedContent.image.url}
                          alt={selectedContent.title || "Content image"}
                          className="w-full aspect-video object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-4 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                        <span className="font-medium">
                          {selectedContent.image.fileName}
                        </span>
                        <span>•</span>
                        <span>
                          {(selectedContent.image.size / 1024 / 1024).toFixed(
                            2,
                          )}{" "}
                          MB
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content Details */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      İçerik Detayları
                    </Label>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                        {JSON.stringify(selectedContent.content, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="border-t border-gray-100 pt-4 flex gap-2">
              <Button
                onClick={() => handleEdit(selectedContent)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button
                onClick={() =>
                  handleCopy(JSON.stringify(selectedContent.content, null, 2))
                }
                variant="outline"
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                JSON Kopyala
              </Button>
              <Button
                onClick={(e) => exportToJSON(selectedContent, e)}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                JSON İndir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
