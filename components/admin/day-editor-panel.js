"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Image as ImageIcon,
  Type,
  Layout,
  GripVertical,
  Edit3,
  Eye,
  PlayCircle,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import MobilePreview from "@/components/admin/mobile-preview";
import ContentLibraryDialog from "@/components/admin/content-library-dialog";

const STATUS_CONFIG = {
  idle: {
    label: "Planlanmamış",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Clock,
  },
  planned: {
    label: "Planlandı",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Calendar,
  },
  ready: {
    label: "Hazır",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  review: {
    label: "İncelemede",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Eye,
  },
  blocked: {
    label: "Engellendi",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const CONTENT_TYPE_CONFIG = {
  post: { label: "Post", emoji: "📝" },
  reel: { label: "Reel", emoji: "🎬" },
  story: { label: "Story", emoji: "📸" },
  video: { label: "Video", emoji: "🎥" },
  carousel: { label: "Carousel", emoji: "📊" },
  article: { label: "Makale", emoji: "📄" },
};

const PLATFORM_CONFIG = {
  instagram: {
    label: "Instagram",
    icon: Instagram,
    color: "#F56565", // Soft coral red
    lightColor: "#FED7D7", // Very light pink
    darkColor: "#C53030", // Deep red
    gradient: "from-red-400 to-red-600",
  },
  facebook: {
    label: "Facebook",
    icon: Facebook,
    color: "#4299E1", // Soft blue
    lightColor: "#BEE3F8", // Very light blue
    darkColor: "#2B6CB0", // Deep blue
    gradient: "from-blue-400 to-blue-600",
  },
  x: {
    label: "X (Twitter)",
    icon: Twitter,
    color: "#4A5568", // Soft dark gray
    lightColor: "#E2E8F0", // Very light gray
    darkColor: "#2D3748", // Deep gray
    gradient: "from-gray-500 to-gray-700",
  },
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
    color: "#4299E1", // Soft sky blue
    lightColor: "#BEE3F8", // Very light blue
    darkColor: "#2C5282", // Deep blue
    gradient: "from-blue-400 to-blue-600",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    color: "#F56565", // Soft red
    lightColor: "#FED7D7", // Very light red
    darkColor: "#C53030", // Deep red
    gradient: "from-red-400 to-red-600",
  },
  tiktok: {
    label: "TikTok",
    icon: Smartphone,
    color: "#4A5568", // Soft dark
    lightColor: "#E2E8F0", // Very light gray
    darkColor: "#2D3748", // Deep dark
    gradient: "from-gray-600 to-gray-800",
  },
};

export default function DayEditorPanel({
  open,
  onOpenChange,
  selectedDate,
  dayContents = [],
  availableContents = [],
  onAddContent,
  onRemoveContent,
  onUpdateDayStatus,
  onUpdateDayNotes,
  onReorderContents,
  onCreateNewContent,
  onUpdateContentTime,
  onClearDay,
}) {
  const [dayStatus, setDayStatus] = useState("idle");
  const [dayNotes, setDayNotes] = useState("");
  const [showContentLibrary, setShowContentLibrary] = useState(false);
  const [editingTimeForContent, setEditingTimeForContent] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedContentType, setSelectedContentType] = useState("all");

  // Format date
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("tr-TR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Load day data
  useEffect(() => {
    if (open && selectedDate) {
      // Load existing day status and notes from dayContents metadata if available
      const dayMetadata = dayContents[0]?.dayMetadata;
      if (dayMetadata) {
        setDayStatus(dayMetadata.status || "idle");
        setDayNotes(dayMetadata.notes || "");
      } else {
        setDayStatus(dayContents.length > 0 ? "planned" : "idle");
        setDayNotes("");
      }
    }
  }, [open, selectedDate, dayContents]);

  const handleStatusChange = (newStatus) => {
    setDayStatus(newStatus);
    onUpdateDayStatus?.(selectedDate, newStatus);
    toast.success("Gün durumu güncellendi");
  };

  const handleSaveNotes = () => {
    onUpdateDayNotes?.(selectedDate, dayNotes);
    toast.success("Notlar kaydedildi");
  };

  const handleAddContent = async (contentId) => {
    try {
      await onAddContent?.(selectedDate, contentId);
      setShowContentLibrary(false);
      toast.success("İçerik güne eklendi ve kütüphane güncellendi");
    } catch (error) {
      console.error("Add content error:", error);
      toast.error("İçerik eklenemedi");
    }
  };

  const handleRemoveContent = async (contentId) => {
    try {
      await onRemoveContent?.(selectedDate, contentId);
      toast.success("İçerik günden çıkarıldı ve kütüphane güncellendi");
    } catch (error) {
      console.error("Remove content error:", error);
      toast.error("İçerik çıkarılamadı");
    }
  };

  const handleClearDay = async () => {
    if (dayContents.length === 0) {
      toast.info("Bu günde temizlenecek içerik yok");
      return;
    }

    if (
      !confirm(
        `${formattedDate} tarihindeki tüm içerikler (${dayContents.length} adet) kaldırılacak. Emin misiniz?`
      )
    ) {
      return;
    }

    try {
      await onClearDay?.(selectedDate, dayContents);
      toast.success("Tüm içerikler günden kaldırıldı ve kütüphane güncellendi");
    } catch (error) {
      console.error("Clear day error:", error);
      toast.error("Gün temizlenemedi");
    }
  };

  const handleUpdateTime = (contentId, time) => {
    onUpdateContentTime?.(selectedDate, contentId, time);
    setEditingTimeForContent(null);
    toast.success("Yayın saati güncellendi");
  };

  // Calculate platform counts
  const platformCounts = dayContents.reduce((acc, content) => {
    const platform = content.platform || "other";
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  // Calculate content type counts
  const contentTypeCounts = dayContents.reduce((acc, content) => {
    const type = content.contentType || "other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Filter contents by platform and content type
  const filteredContents = dayContents.filter((content) => {
    const platformMatch =
      selectedPlatform === "all" || content.platform === selectedPlatform;
    const contentTypeMatch =
      selectedContentType === "all" ||
      content.contentType === selectedContentType;
    return platformMatch && contentTypeMatch;
  });

  const StatusIcon = STATUS_CONFIG[dayStatus]?.icon || Clock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: "96vw", width: "1400px", maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">
                  {formattedDate}
                </DialogTitle>
                <DialogDescription className="text-xs text-white/70">
                  İçerik yönetimi
                </DialogDescription>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Select value={dayStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs">{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Badge
                className={`${STATUS_CONFIG[dayStatus]?.color} border px-2.5 py-1 text-xs`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {STATUS_CONFIG[dayStatus]?.label}
              </Badge>
            </div>
          </div>
        </div>

        <div
          className="flex overflow-hidden bg-gray-50"
          style={{ height: "calc(92vh - 65px)" }}
        >
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">
              {/* Content List Section */}
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md p-1.5">
                        <Layout className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        Planlı İçerikler
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700"
                        >
                          {dayContents.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      {dayContents.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleClearDay}
                          className="h-8 px-3 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Tümünü Temizle
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowContentLibrary(true)}
                        className="h-8 px-3 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Kütüphane
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onCreateNewContent?.(selectedDate)}
                        className="h-8 px-3 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Yeni
                      </Button>
                    </div>
                  </div>

                  {/* Platform Filter */}
                  {dayContents.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant={
                          selectedPlatform === "all" ? "default" : "outline"
                        }
                        onClick={() => setSelectedPlatform("all")}
                        className={`h-7 px-2.5 text-xs ${
                          selectedPlatform === "all"
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            : ""
                        }`}
                      >
                        Tümü
                        <Badge
                          variant="secondary"
                          className="ml-1.5 text-[10px] px-1.5 py-0 h-4 bg-white/20 text-white border-0"
                        >
                          {dayContents.length}
                        </Badge>
                      </Button>
                      {Object.entries(PLATFORM_CONFIG).map(
                        ([platform, config]) => {
                          const count = platformCounts[platform] || 0;
                          if (count === 0) return null;
                          const PlatformIcon = config.icon;
                          return (
                            <Button
                              key={platform}
                              size="sm"
                              variant={
                                selectedPlatform === platform
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setSelectedPlatform(platform)}
                              className="h-7 px-2.5 text-xs border-0"
                              style={
                                selectedPlatform === platform
                                  ? {
                                      background: `linear-gradient(to right, ${config.color}, ${config.darkColor})`,
                                      color: "white",
                                    }
                                  : {}
                              }
                            >
                              <PlatformIcon className="w-3.5 h-3.5 mr-1" />
                              {config.label}
                              <Badge
                                variant="secondary"
                                className={`ml-1.5 text-[10px] px-1.5 py-0 h-4 ${
                                  selectedPlatform === platform
                                    ? "bg-white/20 text-white border-0"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {count}
                              </Badge>
                            </Button>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* Content Type Filter */}
                  {dayContents.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={
                          selectedContentType === "all" ? "default" : "outline"
                        }
                        onClick={() => setSelectedContentType("all")}
                        className={`h-7 px-2.5 text-xs ${
                          selectedContentType === "all"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            : ""
                        }`}
                      >
                        Tüm Tipler
                        <Badge
                          variant="secondary"
                          className="ml-1.5 text-[10px] px-1.5 py-0 h-4 bg-white/20 text-white border-0"
                        >
                          {dayContents.length}
                        </Badge>
                      </Button>
                      {Object.entries(CONTENT_TYPE_CONFIG).map(
                        ([type, config]) => {
                          const count = contentTypeCounts[type] || 0;
                          if (count === 0) return null;
                          return (
                            <Button
                              key={type}
                              size="sm"
                              variant={
                                selectedContentType === type
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setSelectedContentType(type)}
                              className={`h-7 px-2.5 text-xs ${
                                selectedContentType === type
                                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                  : ""
                              }`}
                            >
                              <span className="mr-1">{config.emoji}</span>
                              {config.label}
                              <Badge
                                variant="secondary"
                                className={`ml-1.5 text-[10px] px-1.5 py-0 h-4 ${
                                  selectedContentType === type
                                    ? "bg-white/20 text-white border-0"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {count}
                              </Badge>
                            </Button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* Contents Grid */}
                {dayContents.length === 0 ? (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-8 text-center border border-dashed border-indigo-300">
                    <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Henüz içerik eklenmedi
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      İçerik ekleyerek planlamaya başlayın
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setShowContentLibrary(true)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs h-8"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      İçerik Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {filteredContents.map((content, index) => {
                      const platformData = PLATFORM_CONFIG[content.platform];
                      const hasTime =
                        (content.scheduledDate || content.start) &&
                        (content.scheduledDate || content.start).includes(
                          "T"
                        ) &&
                        !(content.scheduledDate || content.start).endsWith(
                          "T00:00:00"
                        ) &&
                        (content.scheduledDate || content.start).split(
                          "T"
                        )[1] !== "00:00:00";

                      return (
                        <div
                          key={content.id}
                          onClick={() => setPreviewContent(content)}
                          className="group bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-400 hover:shadow-xl transition-all relative cursor-pointer"
                        >
                          {/* Order Badge - Top Left */}
                          <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg px-2 py-1 text-xs font-black shadow-lg">
                            #{index + 1}
                          </div>

                          {/* Platform Icon Badge - Top Right */}
                          <div
                            className="absolute top-2 right-2 z-20 rounded-lg p-2 shadow-lg border-2 border-white"
                            style={{
                              background: hasTime
                                ? `linear-gradient(135deg, ${
                                    platformData?.color || "#718096"
                                  }, ${platformData?.darkColor || "#4A5568"})`
                                : "linear-gradient(135deg, #E2E8F0, #CBD5E0)",
                            }}
                          >
                            {(() => {
                              const PlatformIcon =
                                platformData?.icon || Smartphone;
                              return (
                                <PlatformIcon
                                  className="w-4 h-4"
                                  style={{
                                    color: hasTime
                                      ? "white"
                                      : platformData?.color || "#718096",
                                  }}
                                />
                              );
                            })()}
                          </div>

                          {/* Content Image Preview */}
                          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
                            {(() => {
                              // Handle carousel images - use first image
                              let imageUrl = null;
                              if (
                                content.image?.type === "carousel" &&
                                content.image?.images?.length > 0
                              ) {
                                imageUrl =
                                  content.image.images[0].url ||
                                  content.image.images[0];
                              } else {
                                imageUrl =
                                  content.image?.url ||
                                  content.image ||
                                  content.content?.image?.url ||
                                  content.content?.image;
                              }

                              const isVideo =
                                content.image?.type?.startsWith("video/") ||
                                content.contentType === "reel" ||
                                content.contentType === "video";

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
                                          e.target.parentElement.nextElementSibling.style.display =
                                            "flex";
                                        }}
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                        <div className="bg-white/90 rounded-full p-3 shadow-xl">
                                          <PlayCircle className="w-8 h-8 text-indigo-600" />
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <img
                                      src={imageUrl}
                                      alt={content.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentElement.nextElementSibling.style.display =
                                          "flex";
                                      }}
                                    />
                                  )}
                                  {/* Carousel indicator */}
                                  {content.image?.type === "carousel" &&
                                    content.image?.images?.length > 1 && (
                                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
                                        +{content.image.images.length - 1}
                                      </div>
                                    )}
                                </div>
                              ) : null;
                            })()}
                            <div
                              className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 items-center justify-center hidden"
                              style={{
                                display: (
                                  content.image?.type === "carousel"
                                    ? content.image?.images?.length > 0
                                    : content.image?.url ||
                                      content.image ||
                                      content.content?.image?.url ||
                                      content.content?.image
                                )
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              <div className="text-center">
                                <span className="text-6xl block">
                                  {CONTENT_TYPE_CONFIG[content.contentType]
                                    ?.emoji || "📝"}
                                </span>
                              </div>
                            </div>

                            {/* Content Type Badge - Bottom Right */}
                            <div className="absolute bottom-2 right-2 z-10 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-sm font-bold shadow-lg border border-gray-200">
                              {CONTENT_TYPE_CONFIG[content.contentType]?.emoji}
                            </div>
                          </div>

                          {/* Content Info */}
                          <div className="p-3 space-y-2 bg-white">
                            <div>
                              <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight mb-2">
                                {content.title || "Başlıksız İçerik"}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge
                                  className="text-[10px] px-2 py-0.5 font-semibold capitalize border-0"
                                  style={{
                                    background: hasTime
                                      ? `linear-gradient(to right, ${
                                          platformData?.color || "#718096"
                                        }, ${
                                          platformData?.darkColor || "#4A5568"
                                        })`
                                      : "linear-gradient(to right, #E2E8F0, #CBD5E0)",
                                    color: hasTime ? "white" : "#4A5568",
                                  }}
                                >
                                  {content.platform}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0.5 font-semibold bg-indigo-100 text-indigo-700 border-0"
                                >
                                  {CONTENT_TYPE_CONFIG[content.contentType]
                                    ?.label || content.contentType}
                                </Badge>
                              </div>
                              {content.datasetName && (
                                <p className="text-[10px] text-indigo-600 font-semibold mt-1.5 truncate flex items-center gap-1">
                                  <span>📁</span>
                                  <span>{content.datasetName}</span>
                                </p>
                              )}
                            </div>

                            {/* Time & Status */}
                            <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-gray-100">
                              {/* Status Badge */}
                              <Badge
                                variant="secondary"
                                className={`text-[10px] px-2 py-0.5 h-5 font-semibold ${
                                  content.status === "published"
                                    ? "bg-green-100 text-green-700"
                                    : content.status === "scheduled"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {content.status === "published"
                                  ? "✓ Yayında"
                                  : content.status === "scheduled"
                                  ? "⏰ Zamanlandı"
                                  : "📝 Taslak"}
                              </Badge>

                              {/* Time Editor */}
                              {editingTimeForContent === content.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="time"
                                    defaultValue={(() => {
                                      // scheduledDate'den saat bilgisini çıkar
                                      if (
                                        content.scheduledDate ||
                                        content.start
                                      ) {
                                        const date = new Date(
                                          content.scheduledDate || content.start
                                        );
                                        return date.toTimeString().slice(0, 5);
                                      }
                                      return content.scheduledTime || "";
                                    })()}
                                    className="h-6 w-20 text-[10px] px-2 border-2"
                                    onBlur={(e) =>
                                      handleUpdateTime(
                                        content.id,
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleUpdateTime(
                                          content.id,
                                          e.target.value
                                        );
                                      }
                                      if (e.key === "Escape") {
                                        setEditingTimeForContent(null);
                                      }
                                    }}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              ) : content.scheduledDate ||
                                content.start ||
                                content.scheduledTime ? (
                                <div
                                  className="flex items-center gap-1 group/time bg-blue-100 px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTimeForContent(content.id);
                                  }}
                                >
                                  <Clock className="w-3 h-3 text-blue-700" />
                                  <span className="text-[10px] font-bold text-blue-700">
                                    {(() => {
                                      // scheduledDate'den saat bilgisini parse et
                                      if (
                                        content.scheduledDate ||
                                        content.start
                                      ) {
                                        const date = new Date(
                                          content.scheduledDate || content.start
                                        );
                                        return date.toLocaleTimeString(
                                          "tr-TR",
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        );
                                      }
                                      return content.scheduledTime || "00:00";
                                    })()}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className="flex items-center gap-1 group/time bg-gray-100 px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTimeForContent(content.id);
                                  }}
                                >
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <span className="text-[10px] font-bold text-gray-500">
                                    00:00
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* AI Model Badge */}
                            {content.aiModel && (
                              <div className="pt-2 border-t border-gray-100">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0.5 h-5 bg-purple-100 text-purple-700 border-0 font-semibold w-full justify-center"
                                >
                                  🤖{" "}
                                  {content.aiModel.includes("sonnet-4")
                                    ? "Claude Sonnet 4"
                                    : content.aiModel.includes("sonnet")
                                    ? "Claude Sonnet"
                                    : content.aiModel.includes("claude")
                                    ? "Claude AI"
                                    : "AI Generated"}
                                </Badge>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCreateNewContent?.(
                                    selectedDate,
                                    content.id
                                  );
                                }}
                                className="flex-1 h-7 text-[10px] font-semibold border-2 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all"
                              >
                                <Edit3 className="w-3 h-3 mr-1" />
                                Düzenle
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 h-7 px-2 border-2 transition-all font-semibold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm(
                                      "Bu içeriği günden çıkarmak istediğinizden emin misiniz?"
                                    )
                                  ) {
                                    handleRemoveContent(content.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Day Rules Section */}
              {dayContents.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <h4 className="font-semibold text-xs flex items-center gap-2 mb-3 text-gray-900">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md p-1">
                      <AlertCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    Gün Özeti
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 rounded-full p-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">
                            {dayContents.length}
                          </p>
                          <p className="text-[10px] text-gray-500">İçerik</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-full p-1.5 ${
                            dayContents.every((c) => c.image)
                              ? "bg-green-100"
                              : "bg-amber-100"
                          }`}
                        >
                          {dayContents.every((c) => c.image) ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">
                            {dayContents.filter((c) => c.image).length}
                          </p>
                          <p className="text-[10px] text-gray-500">Görsel</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-full p-1.5 ${
                            dayContents.every(
                              (c) =>
                                c.scheduledTime || c.scheduledDate || c.start
                            )
                              ? "bg-green-100"
                              : "bg-amber-100"
                          }`}
                        >
                          {dayContents.every(
                            (c) => c.scheduledTime || c.scheduledDate || c.start
                          ) ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">
                            {
                              dayContents.filter(
                                (c) =>
                                  c.scheduledTime || c.scheduledDate || c.start
                              ).length
                            }
                          </p>
                          <p className="text-[10px] text-gray-500">Zamanlı</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-full p-1.5 ${
                            dayContents.every(
                              (c) => c.caption || c.content?.caption || c.title
                            )
                              ? "bg-green-100"
                              : "bg-amber-100"
                          }`}
                        >
                          {dayContents.every(
                            (c) => c.caption || c.content?.caption || c.title
                          ) ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Type className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">
                            {
                              dayContents.filter(
                                (c) =>
                                  c.caption || c.content?.caption || c.title
                              ).length
                            }
                          </p>
                          <p className="text-[10px] text-gray-500">Metin</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-md p-1">
                    <Type className="w-3.5 h-3.5 text-white" />
                  </div>
                  <Label
                    htmlFor="day-notes"
                    className="text-xs font-semibold text-gray-900"
                  >
                    Günlük Notlar
                  </Label>
                </div>
                <Textarea
                  id="day-notes"
                  value={dayNotes}
                  onChange={(e) => setDayNotes(e.target.value)}
                  placeholder="Bu gün için notlar ve hatırlatmalar..."
                  rows={3}
                  className="resize-none text-xs border mb-2"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="w-full h-8 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Kaydet
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Content Library Dialog */}
      <ContentLibraryDialog
        open={showContentLibrary}
        onOpenChange={setShowContentLibrary}
        contents={availableContents}
        onSelectContent={(contentId) => {
          handleAddContent(contentId);
          setShowContentLibrary(false);
        }}
      />

      {/* Preview Dialog */}
      {previewContent && (
        <Dialog
          open={!!previewContent}
          onOpenChange={() => setPreviewContent(null)}
        >
          <DialogContent
            className="p-0 gap-0 overflow-hidden"
            style={{
              maxWidth: "1600px",
              width: "75vw",
              height: "97vh",
              maxHeight: "97vh",
            }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    İçerik Önizleme
                  </DialogTitle>
                  <DialogDescription className="text-sm mt-1">
                    {previewContent.title || "Başlıksız İçerik"}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {previewContent.platform}
                  </Badge>
                  <Badge variant="outline">
                    {CONTENT_TYPE_CONFIG[previewContent.contentType]?.emoji}{" "}
                    {CONTENT_TYPE_CONFIG[previewContent.contentType]?.label}
                  </Badge>
                  {previewContent.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs gap-1.5 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                      onClick={() => {
                        sessionStorage.setItem(
                          "editingContent",
                          JSON.stringify(previewContent)
                        );
                        window.open(
                          "/admin/social-media/content-studio?mode=edit",
                          "_blank"
                        );
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Content Studio'da Aç
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Mobile Preview */}
              <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-start justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-[380px]">
                  <MobilePreview
                    platform={previewContent.platform || "instagram"}
                    contentType={previewContent.contentType || "post"}
                    content={
                      typeof previewContent.content === "string"
                        ? { caption: previewContent.content }
                        : previewContent.content || {}
                    }
                    image={
                      previewContent.image?.type === "carousel" &&
                      previewContent.image?.images?.length > 0
                        ? previewContent.image.images[0].url ||
                          previewContent.image.images[0]
                        : previewContent.image?.url
                    }
                    images={
                      previewContent.image?.type === "carousel" &&
                      previewContent.image?.images
                        ? previewContent.image.images.map(
                            (img) => img.url || img
                          )
                        : undefined
                    }
                    isVideo={previewContent.image?.type?.startsWith("video/")}
                  />
                </div>
              </div>

              {/* Right: Content Details */}
              <div className="w-[600px] bg-white border-l border-gray-200 overflow-y-auto shrink-0">
                <div className="p-6 space-y-6">
                  {/* Metadata Section */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                      Genel Bilgiler
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 font-medium mb-1">
                          Başlık
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {previewContent.title || "Başlıksız İçerik"}
                        </div>
                      </div>

                      {previewContent.datasetName && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            Dataset
                          </div>
                          <div className="text-sm font-semibold text-indigo-600">
                            📁 {previewContent.datasetName}
                          </div>
                        </div>
                      )}

                      {previewContent.aiModel && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            AI Model
                          </div>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                            🤖 {previewContent.aiModel}
                          </Badge>
                        </div>
                      )}

                      {(previewContent.scheduledDate ||
                        previewContent.start ||
                        previewContent.scheduledTime) && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            Yayın Tarihi & Saati
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {(() => {
                              if (
                                previewContent.scheduledDate ||
                                previewContent.start
                              ) {
                                const date = new Date(
                                  previewContent.scheduledDate ||
                                    previewContent.start
                                );
                                return date.toLocaleString("tr-TR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              }
                              return previewContent.scheduledTime || "00:00";
                            })()}
                          </Badge>
                        </div>
                      )}

                      {previewContent.status && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            Durum
                          </div>
                          <Badge
                            className={`text-xs ${
                              previewContent.status === "published"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : previewContent.status === "scheduled"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {previewContent.status === "published"
                              ? "✅ Yayınlandı"
                              : previewContent.status === "scheduled"
                              ? "📅 Zamanlandı"
                              : "📝 Taslak"}
                          </Badge>
                        </div>
                      )}

                      {previewContent.createdAt && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            Oluşturulma
                          </div>
                          <div className="text-xs text-gray-600">
                            {(() => {
                              try {
                                const date = previewContent.createdAt.toDate
                                  ? previewContent.createdAt.toDate()
                                  : new Date(previewContent.createdAt);
                                if (isNaN(date.getTime())) {
                                  return "Tarih bilgisi mevcut değil";
                                }
                                return date.toLocaleString("tr-TR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              } catch (e) {
                                return "Tarih bilgisi mevcut değil";
                              }
                            })()}
                          </div>
                        </div>
                      )}

                      {previewContent.updatedAt && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            Son Güncelleme
                          </div>
                          <div className="text-xs text-gray-600">
                            {(() => {
                              try {
                                const date = previewContent.updatedAt.toDate
                                  ? previewContent.updatedAt.toDate()
                                  : new Date(previewContent.updatedAt);
                                if (isNaN(date.getTime())) {
                                  return "Tarih bilgisi mevcut değil";
                                }
                                return date.toLocaleString("tr-TR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              } catch (e) {
                                return "Tarih bilgisi mevcut değil";
                              }
                            })()}
                          </div>
                        </div>
                      )}

                      {previewContent.description && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            Açıklama
                          </div>
                          <div className="text-sm text-gray-900">
                            {previewContent.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Render Content Details Based on Platform & Type */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                      İçerik Detayları
                    </h3>
                    {previewContent.content &&
                    typeof previewContent.content === "object" ? (
                      <>
                        {/* Instagram Post */}
                        {previewContent.platform === "instagram" &&
                          previewContent.contentType === "post" && (
                            <div className="space-y-4">
                              {/* Hook */}
                              {previewContent.content.hook && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                                      🎯 Hook
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {previewContent.content.hook.length}/125
                                      karakter
                                    </span>
                                  </div>
                                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-gray-900">
                                    {previewContent.content.hook}
                                  </div>
                                </div>
                              )}

                              {/* Full Caption */}
                              {previewContent.content.fullCaption && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                      📝 Tam Caption
                                    </Badge>
                                  </div>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {previewContent.content.fullCaption}
                                  </div>
                                </div>
                              )}

                              {/* Hashtag Strategy */}
                              {previewContent.content.hashtagStrategy && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    # Hashtag Stratejisi
                                  </Badge>
                                  <div className="space-y-3">
                                    {/* Hashtags array */}
                                    {previewContent.content.hashtagStrategy
                                      .hashtags &&
                                      Array.isArray(
                                        previewContent.content.hashtagStrategy
                                          .hashtags
                                      ) && (
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                          <div className="text-xs font-semibold text-purple-700 mb-2">
                                            Hashtag'ler
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {previewContent.content.hashtagStrategy.hashtags.map(
                                              (tag, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="outline"
                                                  className="text-xs bg-purple-100 text-purple-700 border-purple-300"
                                                >
                                                  {tag.startsWith("#")
                                                    ? tag
                                                    : `#${tag}`}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    {/* Rationale */}
                                    {previewContent.content.hashtagStrategy
                                      .rationale && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          Hashtag Mantığı
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .hashtagStrategy.rationale
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {/* Placement */}
                                    {previewContent.content.hashtagStrategy
                                      .placement && (
                                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                        <div className="text-xs font-semibold text-pink-700 mb-1">
                                          Yerleşim
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .hashtagStrategy.placement
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Visual Suggestions */}
                              {previewContent.content.visualSuggestions && (
                                <div>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs mb-2">
                                    🎨 Görsel Önerileri
                                  </Badge>
                                  <div className="space-y-3">
                                    {previewContent.content.visualSuggestions
                                      .primary && (
                                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="text-xs font-semibold text-emerald-700 mb-1">
                                          Ana Görsel
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .visualSuggestions.primary
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.visualSuggestions
                                      .carouselIdea && (
                                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="text-xs font-semibold text-emerald-700 mb-1">
                                          Carousel Fikri
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .visualSuggestions.carouselIdea
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.visualSuggestions
                                      .alternativeVisuals &&
                                      Array.isArray(
                                        previewContent.content.visualSuggestions
                                          .alternativeVisuals
                                      ) && (
                                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                          <div className="text-xs font-semibold text-emerald-700 mb-2">
                                            Alternatif Görseller
                                          </div>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-900">
                                            {previewContent.content.visualSuggestions.alternativeVisuals.map(
                                              (item, idx) => (
                                                <li key={idx}>{item}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}

                              {/* Performance Optimization */}
                              {previewContent.content
                                .performanceOptimization && (
                                <div>
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs mb-2">
                                    📊 Performans Optimizasyonu
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content
                                      .performanceOptimization.bestPostTime && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          En İyi Paylaşım Saati
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .performanceOptimization
                                              .bestPostTime
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content
                                      .performanceOptimization
                                      .saveWorthiness && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Kaydetmeye Değerlik
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .performanceOptimization
                                              .saveWorthiness
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content
                                      .performanceOptimization
                                      .engagementHooks &&
                                      Array.isArray(
                                        previewContent.content
                                          .performanceOptimization
                                          .engagementHooks
                                      ) && (
                                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                          <div className="text-xs font-semibold text-orange-700 mb-2">
                                            Etkileşim Tetikleyicileri
                                          </div>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-900">
                                            {previewContent.content.performanceOptimization.engagementHooks.map(
                                              (hook, idx) => (
                                                <li key={idx}>{hook}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}

                              {/* CTA */}
                              {previewContent.content.cta && (
                                <div>
                                  <Badge className="bg-pink-100 text-pink-700 border-pink-300 text-xs mb-2">
                                    👉 Call to Action
                                  </Badge>
                                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-200 text-sm text-gray-900">
                                    {previewContent.content.cta}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Instagram Carousel */}
                        {previewContent.platform === "instagram" &&
                          previewContent.contentType === "carousel" && (
                            <div className="space-y-4">
                              {/* Hook */}
                              {previewContent.content.hook && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                                      ⚡ Hook
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {previewContent.content.hook.length}/125
                                      karakter
                                    </span>
                                  </div>
                                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-gray-900 font-medium">
                                    {previewContent.content.hook}
                                  </div>
                                </div>
                              )}

                              {/* Full Caption */}
                              {previewContent.content.fullCaption && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                      📝 Tam Caption
                                    </Badge>
                                  </div>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {previewContent.content.fullCaption}
                                  </div>
                                </div>
                              )}

                              {/* Caption Structure */}
                              {previewContent.content.captionStructure && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    🏗️ Caption Yapısı
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.captionStructure
                                      .hook && (
                                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-xs font-semibold text-purple-700 mb-1">
                                          Hook:
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .captionStructure.hook
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.captionStructure
                                      .body && (
                                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-xs font-semibold text-purple-700 mb-1">
                                          Body:
                                        </div>
                                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                          {
                                            previewContent.content
                                              .captionStructure.body
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.captionStructure
                                      .engagement && (
                                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-xs font-semibold text-purple-700 mb-1">
                                          Etkileşim:
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .captionStructure.engagement
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.captionStructure
                                      .hashtags && (
                                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-xs font-semibold text-purple-700 mb-1">
                                          Hashtags:
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .captionStructure.hashtags
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Carousel Concept */}
                              {previewContent.content.carouselConcept && (
                                <div>
                                  <Badge className="bg-pink-100 text-pink-700 border-pink-300 text-xs mb-2">
                                    🎠 Carousel Konsepti
                                  </Badge>
                                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                    <div className="text-sm text-gray-900 mb-2">
                                      {previewContent.content.carouselConcept}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                      {previewContent.content.totalSlides && (
                                        <span>
                                          <strong>Slide Sayısı:</strong>{" "}
                                          {previewContent.content.totalSlides}
                                        </span>
                                      )}
                                      {previewContent.content.format && (
                                        <span>
                                          <strong>Format:</strong>{" "}
                                          {previewContent.content.format}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Carousel Slides */}
                              {previewContent.content.slides &&
                                previewContent.content.slides.length > 0 && (
                                  <div>
                                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs mb-2">
                                      📊 Carousel Slides (
                                      {previewContent.content.slides.length})
                                    </Badge>
                                    <div className="space-y-3">
                                      {previewContent.content.slides.map(
                                        (slide, idx) => (
                                          <div
                                            key={idx}
                                            className="p-3 bg-white rounded-lg border-2 border-indigo-200"
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs">
                                                Slide{" "}
                                                {slide.slideNumber || idx + 1}
                                              </Badge>
                                              {slide.slideType && (
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {slide.slideType}
                                                </Badge>
                                              )}
                                            </div>
                                            {slide.title && (
                                              <div className="font-bold text-sm text-gray-900 mb-1">
                                                {slide.title}
                                              </div>
                                            )}
                                            {slide.subtitle && (
                                              <div className="text-sm text-gray-600 mb-2">
                                                {slide.subtitle}
                                              </div>
                                            )}
                                            {slide.body && (
                                              <div className="text-sm text-gray-900 mb-2">
                                                {Array.isArray(slide.body) ? (
                                                  <ul className="list-disc list-inside space-y-1">
                                                    {slide.body.map(
                                                      (item, bIdx) => (
                                                        <li key={bIdx}>
                                                          {item}
                                                        </li>
                                                      )
                                                    )}
                                                  </ul>
                                                ) : (
                                                  slide.body
                                                )}
                                              </div>
                                            )}
                                            {slide.visualSuggestion && (
                                              <div className="mt-2 p-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded border border-pink-100">
                                                <div className="text-xs font-semibold text-pink-700 mb-1">
                                                  🎨 Görsel Önerisi
                                                </div>
                                                <div className="text-xs text-gray-700">
                                                  {slide.visualSuggestion}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Visual Suggestions */}
                              {previewContent.content.visualSuggestions && (
                                <div>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs mb-2">
                                    🎨 Görsel Önerileri
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.visualSuggestions
                                      .primary && (
                                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                        <div className="text-xs font-semibold text-pink-700 mb-1">
                                          Ana Görsel Önerisi
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .visualSuggestions.primary
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.visualSuggestions
                                      .alternative && (
                                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-xs font-semibold text-purple-700 mb-1">
                                          Alternatif Öneri
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .visualSuggestions.alternative
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.visualSuggestions
                                      .carouselIdea && (
                                      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                                        <div className="text-xs font-semibold text-cyan-700 mb-2">
                                          📊 Carousel Slide Fikirleri
                                        </div>
                                        {Array.isArray(
                                          previewContent.content
                                            .visualSuggestions.carouselIdea
                                        ) ? (
                                          <div className="space-y-1">
                                            {previewContent.content.visualSuggestions.carouselIdea.map(
                                              (slide, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-start gap-2 p-2 bg-white rounded"
                                                >
                                                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shrink-0 text-xs">
                                                    {idx + 1}
                                                  </Badge>
                                                  <span className="text-sm text-gray-900">
                                                    {slide}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-sm text-gray-900">
                                            {
                                              previewContent.content
                                                .visualSuggestions.carouselIdea
                                            }
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Design Theme */}
                              {previewContent.content.designTheme && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    🎨 Tasarım Teması
                                  </Badge>
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
                                    {previewContent.content.designTheme
                                      .colorPalette &&
                                      previewContent.content.designTheme
                                        .colorPalette.length > 0 && (
                                        <div>
                                          <div className="text-xs font-semibold text-purple-700 mb-2">
                                            Renk Paleti:
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {previewContent.content.designTheme.colorPalette.map(
                                              (color, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-center gap-1.5"
                                                >
                                                  <div
                                                    className="w-6 h-6 rounded border-2 border-white shadow-sm"
                                                    style={{
                                                      backgroundColor: color,
                                                    }}
                                                  />
                                                  <span className="text-xs font-mono text-gray-600">
                                                    {color}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    {previewContent.content.designTheme
                                      .fontFamily && (
                                      <div className="text-sm text-gray-900">
                                        <strong>Font:</strong>{" "}
                                        {
                                          previewContent.content.designTheme
                                            .fontFamily
                                        }
                                      </div>
                                    )}
                                    {previewContent.content.designTheme
                                      .layoutStyle && (
                                      <div className="text-sm text-gray-900">
                                        <strong>Layout Stili:</strong>{" "}
                                        {
                                          previewContent.content.designTheme
                                            .layoutStyle
                                        }
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Hashtag Strategy */}
                              {previewContent.content.hashtagStrategy && (
                                <div>
                                  <Badge className="bg-pink-100 text-pink-700 border-pink-300 text-xs mb-2">
                                    # Hashtag Stratejisi
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.hashtagStrategy
                                      .hashtags &&
                                      Array.isArray(
                                        previewContent.content.hashtagStrategy
                                          .hashtags
                                      ) && (
                                        <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                          <div className="flex flex-wrap gap-1.5">
                                            {previewContent.content.hashtagStrategy.hashtags.map(
                                              (tag, idx) => (
                                                <Badge
                                                  key={idx}
                                                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs"
                                                >
                                                  {tag.startsWith("#")
                                                    ? tag
                                                    : `#${tag}`}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    {previewContent.content.hashtagStrategy
                                      .placement && (
                                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                        <div className="text-xs font-semibold text-pink-700 mb-1">
                                          Yerleşim
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .hashtagStrategy.placement
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.hashtagStrategy
                                      .rationale && (
                                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                        <div className="text-xs font-semibold text-pink-700 mb-1">
                                          Mantık
                                        </div>
                                        <div className="text-sm text-gray-900 italic">
                                          {
                                            previewContent.content
                                              .hashtagStrategy.rationale
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Engagement Strategy */}
                              {previewContent.content.engagementStrategy && (
                                <div>
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs mb-2">
                                    💬 Etkileşim Stratejisi
                                  </Badge>
                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-gray-900">
                                    {previewContent.content.engagementStrategy}
                                  </div>
                                </div>
                              )}

                              {/* Performance Optimization / Expected Performance */}
                              {(previewContent.content
                                .performanceOptimization ||
                                previewContent.content.expectedPerformance) && (
                                <div>
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs mb-2">
                                    📊 Performans
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content
                                      .performanceOptimization
                                      ?.bestPostTime && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          En İyi Paylaşım Saati
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .performanceOptimization
                                              .bestPostTime
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content
                                      .performanceOptimization
                                      ?.saveWorthiness && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Kaydetme Değeri
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .performanceOptimization
                                              .saveWorthiness
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.expectedPerformance
                                      ?.swipeRate && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Kaydırma Oranı
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .expectedPerformance.swipeRate
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.expectedPerformance
                                      ?.slideCompletion && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Slide Tamamlama
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .expectedPerformance
                                              .slideCompletion
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Caption for Carousel (alternative field) */}
                              {previewContent.content.captionForCarousel && (
                                <div>
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                    📝 Carousel Caption
                                  </Badge>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {previewContent.content.captionForCarousel}
                                  </div>
                                </div>
                              )}

                              {/* Visual Assets */}
                              {previewContent.content.visualAssets && (
                                <div>
                                  <Badge className="bg-teal-100 text-teal-700 border-teal-300 text-xs mb-2">
                                    🎨 Görsel Varlıklar
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.visualAssets
                                      .iconsNeeded &&
                                      previewContent.content.visualAssets
                                        .iconsNeeded.length > 0 && (
                                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                                          <div className="text-xs font-semibold text-teal-700 mb-2">
                                            Gerekli İkonlar:
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {previewContent.content.visualAssets.iconsNeeded.map(
                                              (icon, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {icon}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    {previewContent.content.visualAssets
                                      .imagesNeeded &&
                                      previewContent.content.visualAssets
                                        .imagesNeeded.length > 0 && (
                                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                                          <div className="text-xs font-semibold text-teal-700 mb-2">
                                            Gerekli Görseller:
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {previewContent.content.visualAssets.imagesNeeded.map(
                                              (image, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {image}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Instagram Reel */}
                        {previewContent.platform === "instagram" &&
                          previewContent.contentType === "reel" && (
                            <div className="space-y-4">
                              {/* Reel Concept */}
                              {previewContent.content.reelConcept && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    🎬 Reel Konsepti
                                  </Badge>
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-gray-900">
                                    {previewContent.content.reelConcept}
                                  </div>
                                </div>
                              )}

                              {/* Duration */}
                              {previewContent.content.duration && (
                                <div>
                                  <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs mb-2">
                                    ⏱️ Süre
                                  </Badge>
                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900">
                                    {previewContent.content.duration}
                                  </div>
                                </div>
                              )}

                              {/* Script Timeline */}
                              {previewContent.content.script && (
                                <div>
                                  <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-xs mb-2">
                                    📝 Script Timeline
                                  </Badge>
                                  <div className="space-y-3">
                                    {/* Hook */}
                                    {previewContent.content.script.hook && (
                                      <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge className="bg-yellow-200 text-yellow-800 text-xs">
                                            Hook
                                            {previewContent.content.script.hook
                                              .timestamp &&
                                              ` (${previewContent.content.script.hook.timestamp})`}
                                          </Badge>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-900">
                                          {previewContent.content.script.hook
                                            .visual && (
                                            <div>
                                              <span className="font-semibold text-gray-700">
                                                Görsel:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .hook.visual
                                              }
                                            </div>
                                          )}
                                          {previewContent.content.script.hook
                                            .cameraAngle && (
                                            <div>
                                              <span className="font-semibold text-gray-700">
                                                Kamera Açısı:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .hook.cameraAngle
                                              }
                                            </div>
                                          )}
                                          {previewContent.content.script.hook
                                            .onScreenText && (
                                            <div>
                                              <span className="font-semibold text-gray-700">
                                                Ekran Metni:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .hook.onScreenText
                                              }
                                            </div>
                                          )}
                                          {previewContent.content.script.hook
                                            .audio && (
                                            <div className="text-xs text-gray-600">
                                              <span className="font-semibold">
                                                Audio:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .hook.audio
                                              }
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Promise */}
                                    {previewContent.content.script.promise && (
                                      <div className="p-3 bg-cyan-50 rounded-lg border-l-4 border-cyan-400">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge className="bg-cyan-200 text-cyan-800 text-xs">
                                            Promise
                                            {previewContent.content.script
                                              .promise.timestamp &&
                                              ` (${previewContent.content.script.promise.timestamp})`}
                                          </Badge>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-900">
                                          {previewContent.content.script.promise
                                            .visual && (
                                            <div>
                                              <span className="font-semibold text-gray-700">
                                                Görsel:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .promise.visual
                                              }
                                            </div>
                                          )}
                                          {previewContent.content.script.promise
                                            .transition && (
                                            <div className="text-xs text-gray-600">
                                              <span className="font-semibold">
                                                Geçiş:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .promise.transition
                                              }
                                            </div>
                                          )}
                                          {previewContent.content.script.promise
                                            .onScreenText && (
                                            <div>
                                              <span className="font-semibold text-gray-700">
                                                Ekran Metni:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .promise.onScreenText
                                              }
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Value Points */}
                                    {previewContent.content.script
                                      .valuePoints &&
                                      Array.isArray(
                                        previewContent.content.script
                                          .valuePoints
                                      ) && (
                                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-blue-200 text-blue-800 text-xs">
                                              Value Points
                                            </Badge>
                                          </div>
                                          <div className="space-y-3">
                                            {previewContent.content.script.valuePoints.map(
                                              (point, idx) => (
                                                <div
                                                  key={idx}
                                                  className="text-sm text-gray-900"
                                                >
                                                  {typeof point === "object" ? (
                                                    <div className="space-y-2 p-3 bg-white rounded-lg border border-blue-200">
                                                      {point.timestamp && (
                                                        <div className="text-xs font-semibold text-blue-700">
                                                          ⏱️ {point.timestamp}
                                                        </div>
                                                      )}
                                                      {point.point && (
                                                        <div>
                                                          <span className="text-xs font-semibold text-gray-600">
                                                            💡 Ana Nokta:
                                                          </span>{" "}
                                                          <span className="text-sm font-semibold">
                                                            {point.point}
                                                          </span>
                                                        </div>
                                                      )}
                                                      {point.visual && (
                                                        <div>
                                                          <span className="text-xs font-semibold text-gray-600">
                                                            🎬 Görsel:
                                                          </span>{" "}
                                                          <span className="text-sm">
                                                            {point.visual}
                                                          </span>
                                                        </div>
                                                      )}
                                                      {point.transition && (
                                                        <div className="text-xs text-gray-600">
                                                          <span className="font-semibold">
                                                            🔄 Geçiş:
                                                          </span>{" "}
                                                          {point.transition}
                                                        </div>
                                                      )}
                                                      {point.onScreenText && (
                                                        <div>
                                                          <span className="text-xs font-semibold text-gray-600">
                                                            💬 Ekran Metni:
                                                          </span>{" "}
                                                          <span className="text-sm">
                                                            {point.onScreenText}
                                                          </span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <div className="flex items-start gap-2">
                                                      <span className="text-blue-600 mt-1">
                                                        •
                                                      </span>
                                                      <span>{point}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Payoff */}
                                    {previewContent.content.script.payoff && (
                                      <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge className="bg-green-200 text-green-800 text-xs">
                                            Payoff
                                            {previewContent.content.script
                                              .payoff.timestamp &&
                                              ` (${previewContent.content.script.payoff.timestamp})`}
                                          </Badge>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-900">
                                          {previewContent.content.script.payoff
                                            .visual && (
                                            <div>
                                              <span className="font-semibold text-gray-700">
                                                Görsel:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .payoff.visual
                                              }
                                            </div>
                                          )}
                                          {previewContent.content.script.payoff
                                            .onScreenText && (
                                            <div>
                                              <span className="font-semibold text-gray-700">
                                                Ekran Metni:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .payoff.onScreenText
                                              }
                                            </div>
                                          )}
                                          {previewContent.content.script.payoff
                                            .loopability && (
                                            <div className="text-xs text-gray-600">
                                              <span className="font-semibold">
                                                Döngü:
                                              </span>{" "}
                                              {
                                                previewContent.content.script
                                                  .payoff.loopability
                                              }
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Audio Suggestions */}
                              {previewContent.content.audioSuggestions && (
                                <div>
                                  <Badge className="bg-violet-100 text-violet-700 border-violet-300 text-xs mb-2">
                                    🎵 Ses Önerileri
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.audioSuggestions
                                      .original && (
                                      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                                        <div className="text-xs font-semibold text-violet-700 mb-1">
                                          Orijinal Ses
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .audioSuggestions.original
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.audioSuggestions
                                      .trending &&
                                      Array.isArray(
                                        previewContent.content.audioSuggestions
                                          .trending
                                      ) && (
                                        <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                                          <div className="text-xs font-semibold text-violet-700 mb-2">
                                            Trending Sesler
                                          </div>
                                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-900">
                                            {previewContent.content.audioSuggestions.trending.map(
                                              (sound, idx) => (
                                                <li key={idx}>{sound}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    {previewContent.content.audioSuggestions
                                      .voiceoverScript && (
                                      <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                                        <div className="text-xs font-semibold text-violet-700 mb-1">
                                          Voiceover Script
                                        </div>
                                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                          {
                                            previewContent.content
                                              .audioSuggestions.voiceoverScript
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Shooting Notes */}
                              {previewContent.content.shootingNotes && (
                                <div>
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs mb-2">
                                    📹 Çekim Notları
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.shootingNotes
                                      .location && (
                                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="text-xs font-semibold text-amber-700 mb-1">
                                          Lokasyon
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.shootingNotes
                                              .location
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.shootingNotes
                                      .equipment && (
                                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="text-xs font-semibold text-amber-700 mb-1">
                                          Ekipman
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.shootingNotes
                                              .equipment
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.shootingNotes
                                      .lighting && (
                                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="text-xs font-semibold text-amber-700 mb-1">
                                          Işık
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.shootingNotes
                                              .lighting
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.shootingNotes
                                      .props && (
                                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="text-xs font-semibold text-amber-700 mb-1">
                                          Props
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.shootingNotes
                                              .props
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Reel Caption */}
                              {previewContent.content.captionForReel && (
                                <div>
                                  <Badge className="bg-pink-100 text-pink-700 border-pink-300 text-xs mb-2">
                                    💬 Reel Caption
                                  </Badge>
                                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-200 text-sm text-gray-900 whitespace-pre-wrap">
                                    {previewContent.content.captionForReel}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {
                                      previewContent.content.captionForReel
                                        .length
                                    }{" "}
                                    karakter
                                  </div>
                                </div>
                              )}

                              {/* Editing Notes */}
                              {previewContent.content.editingNotes && (
                                <div>
                                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs mb-2">
                                    ✂️ Düzenleme Notları
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.editingNotes
                                      .software && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          Yazılım
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.editingNotes
                                              .software
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.editingNotes
                                      .effects && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-2">
                                          Efektler
                                        </div>
                                        {Array.isArray(
                                          previewContent.content.editingNotes
                                            .effects
                                        ) ? (
                                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-900">
                                            {previewContent.content.editingNotes.effects.map(
                                              (effect, idx) => (
                                                <li key={idx}>{effect}</li>
                                              )
                                            )}
                                          </ul>
                                        ) : (
                                          <div className="text-sm text-gray-900">
                                            {
                                              previewContent.content
                                                .editingNotes.effects
                                            }
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {previewContent.content.editingNotes
                                      .colorGrade && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          Renk
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.editingNotes
                                              .colorGrade
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.editingNotes
                                      .pacing && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          Tempo
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.editingNotes
                                              .pacing
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Expected Performance */}
                              {previewContent.content.expectedPerformance && (
                                <div>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs mb-2">
                                    📈 Beklenen Performans
                                  </Badge>
                                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 text-sm text-gray-900">
                                    {previewContent.content.expectedPerformance}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Instagram Story */}
                        {previewContent.platform === "instagram" &&
                          previewContent.contentType === "story" && (
                            <div className="space-y-4">
                              {/* Series Concept */}
                              {previewContent.content.seriesConcept && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    💡 Story Serisi Konsepti
                                  </Badge>
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-gray-900">
                                    {previewContent.content.seriesConcept}
                                  </div>
                                </div>
                              )}

                              {/* Story Concept (alternative field) */}
                              {previewContent.content.storyConcept && (
                                <div>
                                  <Badge className="bg-pink-100 text-pink-700 border-pink-300 text-xs mb-2">
                                    💡 Story Konsepti
                                  </Badge>
                                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-200 text-sm text-gray-900">
                                    {previewContent.content.storyConcept}
                                  </div>
                                </div>
                              )}

                              {/* Stories Array */}
                              {previewContent.content.stories &&
                                Array.isArray(
                                  previewContent.content.stories
                                ) && (
                                  <div>
                                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs mb-2">
                                      📱 Story Kartları (
                                      {previewContent.content.stories.length}{" "}
                                      adet)
                                    </Badge>
                                    <div className="space-y-3">
                                      {previewContent.content.stories.map(
                                        (story, idx) => (
                                          <div
                                            key={idx}
                                            className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-400"
                                          >
                                            {/* Story Header */}
                                            <div className="flex items-center justify-between mb-3">
                                              <Badge className="bg-indigo-600 text-white text-xs">
                                                Story{" "}
                                                {story.storyNumber || idx + 1}
                                              </Badge>
                                              {story.duration && (
                                                <span className="text-xs text-gray-500 font-semibold">
                                                  ⏱️ {story.duration}
                                                </span>
                                              )}
                                            </div>

                                            {/* Story Text */}
                                            {story.text && (
                                              <div className="mb-3 p-3 bg-white rounded-lg border border-indigo-200">
                                                <div className="text-xs font-semibold text-indigo-700 mb-2">
                                                  📝 Metin
                                                </div>
                                                {story.text.mainText && (
                                                  <div className="text-sm font-bold text-gray-900 mb-2">
                                                    {story.text.mainText}
                                                  </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                  {story.text.type && (
                                                    <div>
                                                      <span className="font-semibold">
                                                        Tip:
                                                      </span>{" "}
                                                      {story.text.type}
                                                    </div>
                                                  )}
                                                  {story.text.fontSize && (
                                                    <div>
                                                      <span className="font-semibold">
                                                        Boyut:
                                                      </span>{" "}
                                                      {story.text.fontSize}
                                                    </div>
                                                  )}
                                                  {story.text.color && (
                                                    <div className="flex items-center gap-1">
                                                      <span className="font-semibold">
                                                        Renk:
                                                      </span>
                                                      <div
                                                        className="w-4 h-4 rounded border"
                                                        style={{
                                                          backgroundColor:
                                                            story.text.color,
                                                        }}
                                                      />
                                                      <span>
                                                        {story.text.color}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {story.text.placement && (
                                                    <div>
                                                      <span className="font-semibold">
                                                        Konum:
                                                      </span>{" "}
                                                      {story.text.placement}
                                                    </div>
                                                  )}
                                                </div>
                                                {story.text.animation && (
                                                  <div className="text-xs text-purple-600 mt-2">
                                                    ✨ Animasyon:{" "}
                                                    {story.text.animation}
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                            {/* Visual */}
                                            {story.visual && (
                                              <div className="mb-3 p-3 bg-white rounded-lg border border-emerald-200">
                                                <div className="text-xs font-semibold text-emerald-700 mb-2">
                                                  🎨 Görsel
                                                </div>
                                                {story.visual.mainElement && (
                                                  <div className="text-sm text-gray-900 mb-2">
                                                    <span className="font-semibold">
                                                      Ana Öğe:
                                                    </span>{" "}
                                                    {story.visual.mainElement}
                                                  </div>
                                                )}
                                                {story.visual.background && (
                                                  <div className="text-sm text-gray-700 mb-2">
                                                    <span className="font-semibold">
                                                      Arka Plan:
                                                    </span>{" "}
                                                    {story.visual.background}
                                                  </div>
                                                )}
                                                {story.visual.aesthetic && (
                                                  <div className="text-xs text-gray-600">
                                                    <span className="font-semibold">
                                                      Estetik:
                                                    </span>{" "}
                                                    {story.visual.aesthetic}
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                            {/* Interactive Elements */}
                                            {story.interactiveElements &&
                                              Array.isArray(
                                                story.interactiveElements
                                              ) &&
                                              story.interactiveElements.length >
                                                0 && (
                                                <div className="mb-3 p-3 bg-white rounded-lg border border-yellow-200">
                                                  <div className="text-xs font-semibold text-yellow-700 mb-2">
                                                    ⭐ Etkileşim Öğeleri
                                                  </div>
                                                  {story.interactiveElements.map(
                                                    (elem, elemIdx) => (
                                                      <div
                                                        key={elemIdx}
                                                        className="mb-2 last:mb-0 p-2 bg-yellow-50 rounded border border-yellow-300"
                                                      >
                                                        <div className="flex items-center gap-2 mb-1">
                                                          <Badge className="bg-yellow-600 text-white text-[10px]">
                                                            {elem.type}
                                                          </Badge>
                                                          {elem.placement && (
                                                            <span className="text-[10px] text-gray-500">
                                                              📍{" "}
                                                              {elem.placement}
                                                            </span>
                                                          )}
                                                        </div>
                                                        {elem.content && (
                                                          <div className="text-xs text-gray-900 mb-1">
                                                            {elem.content}
                                                          </div>
                                                        )}
                                                        {elem.purpose && (
                                                          <div className="text-[10px] text-gray-600 italic">
                                                            💡 {elem.purpose}
                                                          </div>
                                                        )}
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              )}

                                            {/* CTA */}
                                            {story.cta && (
                                              <div className="p-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded border border-pink-300 text-center">
                                                <div className="text-xs font-bold text-pink-700">
                                                  👉 {story.cta}
                                                </div>
                                              </div>
                                            )}

                                            {/* Transition Note */}
                                            {story.text?.transitionNote && (
                                              <div className="mt-2 text-[10px] text-gray-500 italic text-center">
                                                🔄 {story.text.transitionNote}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Story Text (alternative field) */}
                              {previewContent.content.storyText && (
                                <div>
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                    💬 Story Metni
                                  </Badge>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap">
                                    {previewContent.content.storyText}
                                  </div>
                                </div>
                              )}

                              {/* Engagement Strategy */}
                              {previewContent.content.engagementStrategy && (
                                <div>
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs mb-2">
                                    🎯 Etkileşim Stratejisi
                                  </Badge>
                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-gray-900">
                                    {previewContent.content.engagementStrategy}
                                  </div>
                                </div>
                              )}

                              {/* Expected Interaction */}
                              {previewContent.content.expectedInteraction && (
                                <div>
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                    📊 Beklenen Etkileşim
                                  </Badge>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900">
                                    {previewContent.content.expectedInteraction}
                                  </div>
                                </div>
                              )}

                              {/* Follow Up Plan */}
                              {previewContent.content.followUpPlan && (
                                <div>
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs mb-2">
                                    📋 Takip Planı
                                  </Badge>
                                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm text-gray-900">
                                    {previewContent.content.followUpPlan}
                                  </div>
                                </div>
                              )}

                              {/* Highlight Worthy */}
                              {previewContent.content.highlightWorthy && (
                                <div>
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs mb-2">
                                    ⭐ Highlight Değerlendirmesi
                                  </Badge>
                                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-gray-900">
                                    {previewContent.content.highlightWorthy}
                                  </div>
                                </div>
                              )}

                              {/* Caption (fallback) */}
                              {previewContent.content.caption && (
                                <div>
                                  <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs mb-2">
                                    📝 Caption
                                  </Badge>
                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900 whitespace-pre-wrap">
                                    {previewContent.content.caption}
                                  </div>
                                </div>
                              )}

                              {/* Visual Elements (fallback) */}
                              {previewContent.content.visualElements && (
                                <div>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs mb-2">
                                    🎨 Görsel Öğeler
                                  </Badge>
                                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-sm text-gray-900">
                                    {typeof previewContent.content
                                      .visualElements === "string"
                                      ? previewContent.content.visualElements
                                      : JSON.stringify(
                                          previewContent.content.visualElements,
                                          null,
                                          2
                                        )}
                                  </div>
                                </div>
                              )}

                              {/* Interaction Elements (fallback) */}
                              {previewContent.content.interactionElements && (
                                <div>
                                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs mb-2">
                                    ⭐ Etkileşim Öğeleri
                                  </Badge>
                                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-gray-900">
                                    {typeof previewContent.content
                                      .interactionElements === "string"
                                      ? previewContent.content
                                          .interactionElements
                                      : JSON.stringify(
                                          previewContent.content
                                            .interactionElements,
                                          null,
                                          2
                                        )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Facebook Post */}
                        {previewContent.platform === "facebook" &&
                          previewContent.contentType === "post" && (
                            <div className="space-y-4">
                              {/* Hook */}
                              {previewContent.content.hook && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                                      🎯 Hook
                                    </Badge>
                                  </div>
                                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-gray-900">
                                    {previewContent.content.hook}
                                  </div>
                                </div>
                              )}

                              {/* Full Post */}
                              {previewContent.content.fullPost && (
                                <div>
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                    📝 Post İçeriği
                                  </Badge>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {previewContent.content.fullPost}
                                  </div>
                                </div>
                              )}

                              {/* Caption fallback */}
                              {!previewContent.content.fullPost &&
                                previewContent.content.caption && (
                                  <div>
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                      📝 Caption
                                    </Badge>
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                      {previewContent.content.caption}
                                    </div>
                                  </div>
                                )}

                              {/* Engagement Strategy */}
                              {previewContent.content.engagementStrategy && (
                                <div>
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs mb-2">
                                    💡 Etkileşim Stratejisi
                                  </Badge>
                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-gray-900">
                                    {typeof previewContent.content
                                      .engagementStrategy === "string"
                                      ? previewContent.content
                                          .engagementStrategy
                                      : previewContent.content
                                          .engagementStrategy
                                          .discussionQuestion ||
                                        JSON.stringify(
                                          previewContent.content
                                            .engagementStrategy
                                        )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Facebook Video */}
                        {previewContent.platform === "facebook" &&
                          previewContent.contentType === "video" && (
                            <div className="space-y-4">
                              {/* Video Title */}
                              {previewContent.content.videoTitle && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    🎬 Video Başlığı
                                  </Badge>
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm font-semibold text-gray-900">
                                    {previewContent.content.videoTitle}
                                  </div>
                                </div>
                              )}

                              {/* Reel Concept */}
                              {previewContent.content.reelConcept && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    🎬 Video Konsepti
                                  </Badge>
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-gray-900">
                                    {previewContent.content.reelConcept}
                                  </div>
                                </div>
                              )}

                              {/* Caption for Reel */}
                              {previewContent.content.captionForReel && (
                                <div>
                                  <Badge className="bg-pink-100 text-pink-700 border-pink-300 text-xs mb-2">
                                    💬 Video Caption
                                  </Badge>
                                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-200 text-sm text-gray-900 whitespace-pre-wrap">
                                    {previewContent.content.captionForReel}
                                  </div>
                                </div>
                              )}

                              {/* Caption fallback */}
                              {!previewContent.content.captionForReel &&
                                previewContent.content.caption && (
                                  <div>
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                      📝 Caption
                                    </Badge>
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap">
                                      {previewContent.content.caption}
                                    </div>
                                  </div>
                                )}

                              {/* Thumbnail Suggestion */}
                              {previewContent.content.thumbnailSuggestion && (
                                <div>
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs mb-2">
                                    🖼️ Thumbnail Önerisi
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.thumbnailSuggestion
                                      .description && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Açıklama
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .thumbnailSuggestion.description
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.thumbnailSuggestion
                                      .textOverlay && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Metin Overlay
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .thumbnailSuggestion.textOverlay
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* X/Twitter Tweet */}
                        {previewContent.platform === "x" &&
                          previewContent.contentType === "tweet" && (
                            <div className="space-y-4">
                              {/* Tweet Text */}
                              {previewContent.content.tweetText && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-sky-100 text-sky-700 border-sky-300 text-xs">
                                      🐦 Tweet
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {previewContent.content.tweetText.length}
                                      /280 karakter
                                    </span>
                                  </div>
                                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-sm text-gray-900 whitespace-pre-wrap">
                                    {previewContent.content.tweetText}
                                  </div>
                                </div>
                              )}

                              {/* Visual Suggestion */}
                              {previewContent.content.visualSuggestion && (
                                <div>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs mb-2">
                                    🎨 Görsel Önerisi
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.visualSuggestion
                                      .imageType && (
                                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="text-xs font-semibold text-emerald-700 mb-1">
                                          Görsel Tipi
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .visualSuggestion.imageType
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.visualSuggestion
                                      .imageDescription && (
                                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="text-xs font-semibold text-emerald-700 mb-1">
                                          Açıklama
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .visualSuggestion.imageDescription
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Hashtags */}
                              {previewContent.content.hashtags &&
                                Array.isArray(
                                  previewContent.content.hashtags
                                ) && (
                                  <div>
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                      # Hashtag'ler
                                    </Badge>
                                    <div className="flex flex-wrap gap-1.5">
                                      {previewContent.content.hashtags.map(
                                        (tag, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="outline"
                                            className="text-xs bg-purple-100 text-purple-700 border-purple-300"
                                          >
                                            {tag.startsWith("#")
                                              ? tag
                                              : `#${tag}`}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Engagement Hooks */}
                              {previewContent.content.engagementHooks && (
                                <div>
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs mb-2">
                                    💡 Etkileşim Stratejisi
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.engagementHooks
                                      .quoteTweetBait && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Quote Tweet Tetikleyici
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .engagementHooks.quoteTweetBait
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.engagementHooks
                                      .replyStarter && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Cevap Başlatıcı
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .engagementHooks.replyStarter
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.engagementHooks
                                      .bookmarkWorthiness && (
                                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-xs font-semibold text-orange-700 mb-1">
                                          Bookmark Değeri
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .engagementHooks
                                              .bookmarkWorthiness
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* X/Twitter Thread */}
                        {previewContent.platform === "x" &&
                          previewContent.contentType === "thread" && (
                            <div className="space-y-4">
                              {/* Thread Concept */}
                              {previewContent.content.threadConcept && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    💡 Thread Konsepti
                                  </Badge>
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-gray-900">
                                    {previewContent.content.threadConcept}
                                  </div>
                                </div>
                              )}

                              {/* Thread Length */}
                              {previewContent.content.threadLength && (
                                <div>
                                  <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                                    📊 {previewContent.content.threadLength}{" "}
                                    Tweet
                                  </Badge>
                                </div>
                              )}

                              {/* Tweets */}
                              {previewContent.content.tweets &&
                                Array.isArray(
                                  previewContent.content.tweets
                                ) && (
                                  <div>
                                    <Badge className="bg-sky-100 text-sky-700 border-sky-300 text-xs mb-2">
                                      🧵 Thread (
                                      {previewContent.content.tweets.length}{" "}
                                      tweet)
                                    </Badge>
                                    <div className="space-y-3">
                                      {previewContent.content.tweets.map(
                                        (tweet, idx) => (
                                          <div
                                            key={idx}
                                            className="p-3 bg-sky-50 rounded-lg border-l-4 border-sky-400"
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="text-xs font-semibold text-sky-700">
                                                Tweet{" "}
                                                {typeof tweet === "object"
                                                  ? tweet.tweetNumber || idx + 1
                                                  : idx + 1}
                                              </div>
                                              {typeof tweet === "object" &&
                                                tweet.position && (
                                                  <Badge className="text-xs bg-sky-200 text-sky-800">
                                                    {tweet.position}
                                                  </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-900 whitespace-pre-wrap mb-2">
                                              {typeof tweet === "object"
                                                ? tweet.text
                                                : tweet}
                                            </div>
                                            {typeof tweet === "object" && (
                                              <>
                                                {tweet.characterCount && (
                                                  <div className="text-xs text-gray-500">
                                                    {tweet.characterCount}/280
                                                    karakter
                                                  </div>
                                                )}
                                                {tweet.keyPoint && (
                                                  <div className="mt-2 text-xs text-indigo-700 bg-indigo-50 p-2 rounded border border-indigo-200">
                                                    💡{" "}
                                                    <span className="font-semibold">
                                                      Ana Nokta:
                                                    </span>{" "}
                                                    {tweet.keyPoint}
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                        {/* LinkedIn Post */}
                        {previewContent.platform === "linkedin" &&
                          previewContent.contentType === "post" && (
                            <div className="space-y-4">
                              {/* Hook */}
                              {previewContent.content.hook && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                                      🎯 Hook
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {previewContent.content.hook.length}/210
                                      karakter
                                    </span>
                                  </div>
                                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-gray-900">
                                    {previewContent.content.hook}
                                  </div>
                                </div>
                              )}

                              {/* Full Post */}
                              {previewContent.content.fullPost && (
                                <div>
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                    💼 LinkedIn İçeriği
                                  </Badge>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {previewContent.content.fullPost}
                                  </div>
                                </div>
                              )}

                              {/* Post Structure */}
                              {previewContent.content.postStructure && (
                                <div>
                                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs mb-2">
                                    📋 Post Yapısı
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.postStructure
                                      .hook && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          Hook
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.postStructure
                                              .hook
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.postStructure
                                      .personalStory && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          Kişisel Hikaye
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.postStructure
                                              .personalStory
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.postStructure
                                      .insight && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          İçgörü
                                        </div>
                                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                          {
                                            previewContent.content.postStructure
                                              .insight
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {previewContent.content.postStructure
                                      .cta && (
                                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          CTA
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content.postStructure
                                              .cta
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Engagement Strategy */}
                              {previewContent.content.engagementStrategy && (
                                <div>
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs mb-2">
                                    🎯 Etkileşim Stratejisi
                                  </Badge>
                                  <div className="space-y-2">
                                    {previewContent.content.engagementStrategy
                                      .discussionQuestion && (
                                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-xs font-semibold text-green-700 mb-1">
                                          Tartışma Sorusu
                                        </div>
                                        <div className="text-sm text-gray-900">
                                          {
                                            previewContent.content
                                              .engagementStrategy
                                              .discussionQuestion
                                          }
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {/* LinkedIn Carousel */}
                        {previewContent.platform === "linkedin" &&
                          previewContent.contentType === "carousel" && (
                            <div className="space-y-4">
                              {/* Carousel Concept */}
                              {previewContent.content.carouselConcept && (
                                <div>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">
                                    💡 Carousel Konsepti
                                  </Badge>
                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-gray-900">
                                    {previewContent.content.carouselConcept}
                                  </div>
                                </div>
                              )}

                              {/* Total Slides */}
                              {previewContent.content.totalSlides && (
                                <div>
                                  <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                                    📊 {previewContent.content.totalSlides}{" "}
                                    Slayt
                                  </Badge>
                                </div>
                              )}

                              {/* Slides */}
                              {previewContent.content.slides &&
                                Array.isArray(
                                  previewContent.content.slides
                                ) && (
                                  <div>
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                      📊 Carousel (
                                      {previewContent.content.slides.length}{" "}
                                      slayt)
                                    </Badge>
                                    <div className="space-y-3">
                                      {previewContent.content.slides.map(
                                        (slide, idx) => (
                                          <div
                                            key={idx}
                                            className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="text-xs font-semibold text-blue-700">
                                                Slayt{" "}
                                                {typeof slide === "object"
                                                  ? slide.slideNumber || idx + 1
                                                  : idx + 1}
                                              </div>
                                              {typeof slide === "object" &&
                                                slide.slideType && (
                                                  <Badge className="text-xs bg-blue-200 text-blue-800">
                                                    {slide.slideType}
                                                  </Badge>
                                                )}
                                            </div>
                                            {typeof slide === "object" ? (
                                              <div className="space-y-2 text-sm text-gray-900">
                                                {slide.title && (
                                                  <div>
                                                    <span className="font-semibold">
                                                      Başlık:
                                                    </span>{" "}
                                                    {slide.title}
                                                  </div>
                                                )}
                                                {slide.subtitle && (
                                                  <div>
                                                    <span className="font-semibold">
                                                      Alt Başlık:
                                                    </span>{" "}
                                                    {slide.subtitle}
                                                  </div>
                                                )}
                                                {slide.body && (
                                                  <div className="whitespace-pre-wrap">
                                                    {Array.isArray(
                                                      slide.body
                                                    ) ? (
                                                      <ul className="list-disc list-inside space-y-1">
                                                        {slide.body.map(
                                                          (item, i) => (
                                                            <li key={i}>
                                                              {item}
                                                            </li>
                                                          )
                                                        )}
                                                      </ul>
                                                    ) : (
                                                      slide.body
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                                                {slide}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Caption for Carousel */}
                              {previewContent.content.captionForCarousel && (
                                <div>
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">
                                    📝 Caption
                                  </Badge>
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap">
                                    {previewContent.content.captionForCarousel}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                        <div className="text-amber-600 mb-2">
                          <AlertCircle className="w-8 h-8 mx-auto" />
                        </div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">
                          İçerik Detayı Bulunamadı
                        </p>
                        <p className="text-xs text-amber-700">
                          {typeof previewContent.content === "string"
                            ? "İçerik metin formatında: " +
                              previewContent.content.substring(0, 100)
                            : "Bu içerik için detaylı veri mevcut değil"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Technical Info */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
                      Teknik Bilgiler
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Platform:</span>
                        <span className="font-semibold capitalize">
                          {previewContent.platform}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                        <span className="text-gray-600">İçerik Tipi:</span>
                        <span className="font-semibold">
                          {
                            CONTENT_TYPE_CONFIG[previewContent.contentType]
                              ?.label
                          }
                        </span>
                      </div>
                      {previewContent.image && (
                        <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                          <span className="text-gray-600">Medya:</span>
                          <span className="font-semibold">
                            {previewContent.image.type?.startsWith("video/")
                              ? "🎥 Video"
                              : "🖼️ Görsel"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
