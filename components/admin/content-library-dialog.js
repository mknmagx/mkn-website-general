"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Library,
  Filter,
  Plus,
  PlayCircle,
} from "lucide-react";
import MobilePreview from "@/components/admin/mobile-preview";

const CONTENT_TYPE_CONFIG = {
  post: { label: "Post", emoji: "📝" },
  reel: { label: "Reel", emoji: "🎬" },
  story: { label: "Story", emoji: "📸" },
  video: { label: "Video", emoji: "🎥" },
  carousel: { label: "Carousel", emoji: "📊" },
  article: { label: "Makale", emoji: "📄" },
};

const PLATFORMS = [
  { value: "all", label: "Tüm Platformlar" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
];

export default function ContentLibraryDialog({
  open,
  onOpenChange,
  contents = [],
  onSelectContent,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [usageFilter, setUsageFilter] = useState("all"); // all, used, unused
  const [platformFilter, setPlatformFilter] = useState("all");
  const [selectedContent, setSelectedContent] = useState(null);

  // Filter contents
  const filteredContents = contents.filter((content) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      content.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.caption?.toLowerCase().includes(searchQuery.toLowerCase());

    // Usage filter
    let matchesUsage = true;
    if (usageFilter === "used") {
      matchesUsage =
        content.usedInCalendars && content.usedInCalendars.length > 0;
    } else if (usageFilter === "unused") {
      matchesUsage =
        !content.usedInCalendars || content.usedInCalendars.length === 0;
    }

    // Platform filter
    const matchesPlatform =
      platformFilter === "all" || content.platform === platformFilter;

    return matchesSearch && matchesUsage && matchesPlatform;
  });

  const handleSelectContent = (content) => {
    onSelectContent?.(content.id);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedContent(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: "96vw", width: "1400px", maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2.5 text-gray-900">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2 shadow-md">
              <Library className="h-5 w-5 text-white" />
            </div>
            İçerik Kütüphanesi
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 ml-9 mt-0.5">
            Mevcut içeriklerden seçim yapın veya filtreleyin
          </DialogDescription>
        </div>

        <div className="flex overflow-hidden" style={{ height: "calc(92vh - 90px)" }}>
          {/* Left Panel - Content List */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-6 space-y-4">
              {/* Filters */}
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="İçerik ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 p-1 bg-gray-100 rounded-lg flex-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setUsageFilter("all")}
                      className={`h-7 text-xs flex-1 ${
                        usageFilter === "all"
                          ? "bg-white shadow-sm font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      Tümü
                      <span className="ml-1.5 text-[10px] text-gray-500">
                        {contents.length}
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setUsageFilter("unused")}
                      className={`h-7 text-xs flex-1 ${
                        usageFilter === "unused"
                          ? "bg-white shadow-sm font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Kullanılmamış
                      <span className="ml-1.5 text-[10px] text-gray-500">
                        {
                          contents.filter(
                            (c) =>
                              !c.usedInCalendars || c.usedInCalendars.length === 0
                          ).length
                        }
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setUsageFilter("used")}
                      className={`h-7 text-xs flex-1 ${
                        usageFilter === "used"
                          ? "bg-white shadow-sm font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Kullanılmış
                      <span className="ml-1.5 text-[10px] text-gray-500">
                        {
                          contents.filter(
                            (c) =>
                              c.usedInCalendars && c.usedInCalendars.length > 0
                          ).length
                        }
                      </span>
                    </Button>
                  </div>

                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content Grid */}
              <div className="space-y-2">
                {filteredContents.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Library className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">İçerik bulunamadı</p>
                    <p className="text-xs mt-1">
                      Farklı filtreler deneyin
                    </p>
                  </div>
                ) : (
                  filteredContents.map((content) => (
                    <div
                      key={content.id}
                      className={`group bg-white rounded-lg p-3 border cursor-pointer transition-all ${
                        selectedContent?.id === content.id
                          ? "border-indigo-400 bg-indigo-50/50 shadow-sm"
                          : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedContent(content)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 relative">
                          {(() => {
                            // Handle carousel images - use first image
                            let imageUrl = null;
                            if (content.image?.type === "carousel" && content.image?.images?.length > 0) {
                              imageUrl = content.image.images[0].url || content.image.images[0];
                            } else {
                              imageUrl = content.image?.url || content.image || content.content?.image?.url || content.content?.image;
                            }
                            
                            const isVideo = content.image?.type?.startsWith('video/') || content.contentType === 'reel' || content.contentType === 'video';
                            
                            return imageUrl ? (
                              <div className="w-full h-full relative">
                                {isVideo ? (
                                  <>
                                    <video
                                      src={imageUrl}
                                      className="w-full h-full object-cover"
                                      muted
                                      playsInline
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentElement.nextElementSibling.style.display = "flex";
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                      <PlayCircle className="w-6 h-6 text-white drop-shadow-lg" />
                                    </div>
                                  </>
                                ) : (
                                  <img
                                    src={imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      if (e.target.nextElementSibling) {
                                        e.target.nextElementSibling.style.display = "flex";
                                      }
                                    }}
                                  />
                                )}
                                {/* Carousel indicator */}
                                {content.image?.type === "carousel" && content.image?.images?.length > 1 && (
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                                    +{content.image.images.length - 1}
                                  </div>
                                )}
                              </div>
                            ) : null;
                          })()}
                          <div 
                            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                            style={{ display: (content.image?.type === "carousel" ? (content.image?.images?.length > 0 ? "none" : "flex") : (content.image?.url || content.image || content.content?.image?.url || content.content?.image) ? "none" : "flex") }}
                          >
                            <span className="text-xl">
                              {CONTENT_TYPE_CONFIG[content.contentType]?.emoji ||
                                "📝"}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate text-gray-900">
                            {content.title || "Başlıksız İçerik"}
                          </div>
                          {(content.caption || content.content?.caption) && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {content.caption || content.content?.caption}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium capitalize">
                              {content.platform}
                            </span>
                            <span className="text-[10px] text-gray-400">·</span>
                            <span className="text-[11px] text-gray-500 capitalize">
                              {CONTENT_TYPE_CONFIG[content.contentType]?.label ||
                                content.contentType}
                            </span>
                            {content.usedInCalendars &&
                              content.usedInCalendars.length > 0 && (
                                <>
                                  <span className="text-[10px] text-gray-400">
                                    ·
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-medium">
                                    {content.usedInCalendars.length} takvim
                                  </span>
                                </>
                              )}
                          </div>
                        </div>

                        {/* Select Button */}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectContent(content);
                          }}
                          className={`h-8 ${
                            selectedContent?.id === content.id
                              ? "bg-indigo-600"
                              : ""
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Ekle
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          {selectedContent && (
            <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-900">
                    Önizleme
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedContent(null)}
                    className="h-7 w-7 p-0"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>

                <MobilePreview
                  platform={selectedContent.platform || "instagram"}
                  contentType={selectedContent.contentType || "post"}
                  content={
                    typeof selectedContent.content === "string"
                      ? { caption: selectedContent.content }
                      : selectedContent.content || {}
                  }
                  image={
                    selectedContent.image?.type === "carousel" && selectedContent.image?.images?.length > 0
                      ? selectedContent.image.images[0].url || selectedContent.image.images[0]
                      : selectedContent.image?.url
                  }
                  images={
                    selectedContent.image?.type === "carousel" && selectedContent.image?.images
                      ? selectedContent.image.images.map(img => img.url || img)
                      : undefined
                  }
                  isVideo={selectedContent.image?.type?.startsWith("video/")}
                />

                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-[11px] text-gray-500 uppercase tracking-wider">
                    İçerik Detayları
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 text-xs">Platform:</span>
                      <span className="font-medium capitalize text-xs px-2 py-0.5 bg-white rounded border border-gray-200">
                        {selectedContent.platform}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 text-xs">Tür:</span>
                      <span className="font-medium capitalize text-xs px-2 py-0.5 bg-white rounded border border-gray-200">
                        {CONTENT_TYPE_CONFIG[selectedContent.contentType]
                          ?.label || selectedContent.contentType}
                      </span>
                    </div>
                    {selectedContent.usedInCalendars &&
                      selectedContent.usedInCalendars.length > 0 && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-500 text-xs">
                            Kullanım:
                          </span>
                          <span className="font-medium text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
                            {selectedContent.usedInCalendars.length} takvimde
                          </span>
                        </div>
                      )}
                    {selectedContent.createdAt && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500 text-xs">
                          Oluşturulma:
                        </span>
                        <span className="font-medium text-xs px-2 py-0.5 bg-white rounded border border-gray-200">
                          {new Date(
                            selectedContent.createdAt.seconds * 1000 ||
                              selectedContent.createdAt
                          ).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full h-9 text-xs"
                  onClick={() => handleSelectContent(selectedContent)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Bu İçeriği Ekle
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
