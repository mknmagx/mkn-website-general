"use client";

import { useState, useEffect, useCallback } from "react";
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
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
  Eye,
  Play,
  X,
  Calendar,
  Video,
  Hash,
  Sparkles,
  Type,
  Lightbulb,
  Clock,
  Cpu,
  CheckCircle2,
  ExternalLink,
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
  instagram: {
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
    label: "Instagram",
    textColor: "text-pink-600",
  },
  facebook: {
    icon: Facebook,
    color: "bg-blue-600",
    label: "Facebook",
    textColor: "text-blue-600",
  },
  x: { icon: XIcon, color: "bg-black", label: "X", textColor: "text-black" },
  linkedin: {
    icon: Linkedin,
    color: "bg-[#0A66C2]",
    label: "LinkedIn",
    textColor: "text-[#0A66C2]",
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

const ITEMS_PER_PAGE = 12;

// Helper: Check if URL is video
function isVideoUrl(url) {
  if (!url) return false;
  const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
  const lowerUrl = url.toLowerCase();
  return (
    videoExtensions.some((ext) => lowerUrl.includes(ext)) ||
    lowerUrl.includes("video")
  );
}

// Helper: Get media info from content
function getMediaInfo(content) {
  if (!content) return { url: null, isVideo: false, images: [] };

  // Check image object first (Firebase format)
  if (content.image) {
    const img = content.image;

    // Video type
    if (img.type?.startsWith("video") || img.type === "video/mp4") {
      return { url: img.url, isVideo: true, images: [] };
    }

    // Carousel type
    if (img.type === "carousel" && img.images?.length > 0) {
      const urls = img.images
        .map((i) => (typeof i === "string" ? i : i?.url))
        .filter(Boolean);
      return { url: urls[0], isVideo: false, images: urls };
    }

    // Regular image
    if (img.url) {
      const isVid = isVideoUrl(img.url);
      return { url: img.url, isVideo: isVid, images: isVid ? [] : [img.url] };
    }
  }

  // Fallback checks
  const directFields = [
    "imageUrl",
    "visualUrl",
    "generatedImageUrl",
    "mediaUrl",
  ];
  for (const field of directFields) {
    if (content[field]) {
      const isVid = isVideoUrl(content[field]);
      return {
        url: content[field],
        isVideo: isVid,
        images: isVid ? [] : [content[field]],
      };
    }
  }

  // Check content.content
  const c = content.content;
  if (c && typeof c === "object") {
    if (c.image?.url) {
      const isVid = isVideoUrl(c.image.url);
      return {
        url: c.image.url,
        isVideo: isVid,
        images: isVid ? [] : [c.image.url],
      };
    }
    for (const field of directFields) {
      if (c[field]) {
        const isVid = isVideoUrl(c[field]);
        return {
          url: c[field],
          isVideo: isVid,
          images: isVid ? [] : [c[field]],
        };
      }
    }
  }

  return { url: null, isVideo: false, images: [] };
}

// Helper: Get preview text
function getPreviewText(content) {
  const c = content?.content;
  if (typeof c === "string") return c;
  if (!c || typeof c !== "object") return "";

  const fields = [
    "captionForReel",
    "caption",
    "fullCaption",
    "fullPost",
    "fullText",
    "tweetText",
    "text",
    "summary",
    "title",
    "hook",
    "openingHook",
    "threadTitle",
    "script",
    "description",
    "body",
  ];
  for (const field of fields) {
    const val = c[field];
    if (val) {
      if (typeof val === "object") {
        // Handle nested structures from convertContentForPlatform
        return val.text || val.body || val.headline || "";
      }
      return val;
    }
  }

  // Check for X thread tweets array
  if (c.tweets && Array.isArray(c.tweets) && c.tweets.length > 0) {
    return c.tweets[0]?.text || "";
  }

  return "";
}

// Helper: Format date
function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Helper: Format relative time
function formatRelativeTime(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(timestamp);
  if (days > 0) return `${days} gun once`;
  if (hours > 0) return `${hours} saat once`;
  return "Az once";
}

// Media Thumbnail Component - Handles both image and video
function MediaThumbnail({ url, isVideo, className }) {
  const [error, setError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  if (!url || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-100",
          className,
        )}
      >
        <ImageIcon className="w-10 h-10 text-slate-300" />
      </div>
    );
  }

  if (isVideo) {
    // Video - show thumbnail with play overlay
    return (
      <div
        className={cn(
          "relative bg-slate-900 flex items-center justify-center",
          className,
        )}
      >
        {!videoError ? (
          <video
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
          />
        ) : (
          <Video className="w-12 h-12 text-slate-500" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-slate-900 ml-0.5" />
          </div>
        </div>
        <Badge className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] border-0">
          <Video className="w-3 h-3 mr-1" />
          Video
        </Badge>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt="Content"
      fill
      className={cn("object-cover", className)}
      sizes="(max-width: 768px) 50vw, 25vw"
      onError={() => setError(true)}
    />
  );
}

// Content Card - Modern professional design
function ContentCard({
  content,
  onEdit,
  onCopy,
  onDelete,
  onClick,
  canDelete,
}) {
  const platform = PLATFORM_CONFIG[content.platform] || {};
  const PlatformIcon = platform.icon || FileText;
  const { url, isVideo, images } = getMediaInfo(content);
  const previewText = getPreviewText(content);
  const isCarousel = images.length > 1;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onClick(content)}
    >
      {/* Media Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <MediaThumbnail
          url={url}
          isVideo={isVideo}
          className="absolute inset-0"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Platform Icon */}
        <div
          className={cn(
            "absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
            platform.color,
          )}
        >
          <PlatformIcon className="w-4 h-4 text-white" />
        </div>

        {/* Content Type */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/95 text-slate-700 text-[10px] font-medium shadow-sm border-0 backdrop-blur-sm">
            {CONTENT_TYPE_LABELS[content.contentType] || content.contentType}
          </Badge>
        </div>

        {/* Carousel Indicator */}
        {isCarousel && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
            <Layers className="w-3 h-3 text-white" />
            <span className="text-[10px] text-white font-medium">
              {images.length}
            </span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <button
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onClick(content);
            }}
          >
            <Eye className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4">
        {/* Text Preview */}
        <p className="text-sm text-slate-700 line-clamp-2 mb-3 min-h-[2.5rem] leading-relaxed">
          {previewText ? previewText.substring(0, 100) : "Icerik metni..."}
        </p>

        {/* Meta Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs">
              {formatRelativeTime(content.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 font-normal"
            >
              {content.aiModel || "AI"}
            </Badge>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(content);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Duzenle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(previewText);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Metni Kopyala
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(content.id);
                    toast.success(
                      "ID kopyalandi: " + content.id.substring(0, 8) + "...",
                    );
                  }}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  ID Kopyala
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(content.id);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: Extract content details for display
function getContentDetails(content) {
  const c = content?.content || {};
  const mainText =
    c.fullCaption ||
    c.caption?.text ||
    c.caption ||
    c.fullPost ||
    c.fullText?.text ||
    c.fullText ||
    c.body?.text ||
    c.body ||
    c.text ||
    c.summary ||
    c.title ||
    null;

  return {
    hook: c.hook || c.openingHook || c.caption?.headline || c.headline || null,
    fullCaption: mainText,
    title: c.title || null,
    summary: c.summary || null,
    hashtags: c.hashtagStrategy?.hashtags || c.hashtags || [],
    hashtagRationale: c.hashtagStrategy?.rationale || null,
    visualSuggestions: c.visualSuggestions || c.visual_style || null,
    storyIdea: c.storyIdea || c.story_idea || null,
    cta: c.cta || c.call_to_action || c.caption?.call_to_action || null,
    tweetText: c.tweetText || c.tweet || null,
    threadTitle: c.threadTitle || null,
    tweets: c.tweets || [],
    script: c.script || c.captionForReel || null,
    scenes: c.scenes || [],
    duration: c.duration || null,
  };
}

// Copy Button Component
function CopyButton({ text, label, className }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} kopyalandi`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={cn(
        "p-1.5 rounded-lg transition-all",
        text
          ? "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          : "text-slate-200 cursor-not-allowed",
        copied && "text-emerald-500",
        className,
      )}
    >
      {copied ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

// Preview Dialog - Two column layout with phone and content details
function PreviewDialog({ open, onOpenChange, content, onEdit }) {
  if (!content) return null;

  const { url, isVideo, images } = getMediaInfo(content);
  const previewText = getPreviewText(content);
  const platform = PLATFORM_CONFIG[content.platform];
  const PlatformIcon = platform?.icon || FileText;
  const details = getContentDetails(content);

  // Dialog dimensions
  const DIALOG_WIDTH = 1000;
  const DIALOG_HEIGHT = 780;
  const LEFT_PANEL_WIDTH = 380;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="p-0 bg-slate-900 border border-slate-700/50 shadow-2xl gap-0 rounded-2xl"
        style={{ 
          width: `${DIALOG_WIDTH}px`, 
          maxWidth: '95vw', 
          height: `${DIALOG_HEIGHT}px`, 
          maxHeight: '92vh',
          overflow: 'hidden'
        }}
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Icerik Onizleme</DialogTitle>
          <DialogDescription>Sosyal medya icerik onizlemesi</DialogDescription>
        </VisuallyHidden>

        {/* Main Container - Fixed height flex */}
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Left Panel - Phone Preview - FIXED */}
          <div style={{ 
            width: `${LEFT_PANEL_WIDTH}px`,
            minWidth: `${LEFT_PANEL_WIDTH}px`,
            maxWidth: `${LEFT_PANEL_WIDTH}px`,
            height: '100%',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(226,232,240,0.7))',
            borderRight: '1px solid rgba(148,163,184,0.4)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            flexShrink: 0
          }}>
            {/* Phone Frame */}
            <div style={{ width: '280px', position: 'relative' }}>
              <div style={{
                position: 'relative',
                background: '#020617',
                borderRadius: '2.5rem',
                padding: '6px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {/* Dynamic Island */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '20px',
                  background: '#000',
                  borderRadius: '9999px',
                  zIndex: 30
                }} />

                {/* Screen */}
                <div style={{
                  position: 'relative',
                  background: '#fff',
                  borderRadius: '2.2rem',
                  overflow: 'hidden',
                  height: '580px'
                }}>
                  {/* MobilePreview Content */}
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    <MobilePreview
                      platform={content.platform || "instagram"}
                      contentType={content.contentType || "post"}
                      content={content.content || {}}
                      image={url}
                      images={images}
                      isVideo={isVideo}
                      embedded={true}
                    />
                  </div>

                  {/* Home Indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '112px',
                    height: '4px',
                    background: 'rgba(15,23,42,0.2)',
                    borderRadius: '9999px',
                    zIndex: 20
                  }} />
                </div>
              </div>
            </div>

            {/* Platform Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.75)',
              borderRadius: '12px',
              border: '1px solid rgba(148,163,184,0.35)',
              boxShadow: '0 10px 20px -12px rgba(15,23,42,0.25)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/40",
                platform?.color || "bg-slate-600"
              )}>
                <PlatformIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {platform?.label || content.platform}
                </p>
                <p className="text-xs text-slate-500">
                  {CONTENT_TYPE_LABELS[content.contentType] || content.contentType}
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Content Details - SCROLLABLE */}
          <div style={{ 
            flex: 1,
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            overflow: 'hidden'
          }}>
            {/* Header - FIXED */}
            <div style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Icerik Detaylari</h3>
                  <p className="text-xs text-slate-500">AI tarafindan olusturuldu</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Content Sections - SCROLLABLE */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '24px',
              minHeight: 0
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Title */}
              {details.title && details.title !== details.fullCaption && (
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Baslik
                      </span>
                    </div>
                    <CopyButton text={details.title} label="Baslik" />
                  </div>
                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {details.title}
                    </p>
                  </div>
                </div>
              )}

              {/* Summary */}
              {details.summary && (
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Ozet
                      </span>
                    </div>
                    <CopyButton text={details.summary} label="Ozet" />
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {details.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Full Caption Section */}
              {details.fullCaption && (
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Tam Metin
                      </span>
                    </div>
                    <CopyButton text={details.fullCaption} label="Metin" />
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 max-h-[180px] overflow-y-auto">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {details.fullCaption}
                    </p>
                  </div>
                </div>
              )}

              {/* Hook Section */}
              {details.hook && (
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Hook
                      </span>
                    </div>
                    <CopyButton text={details.hook} label="Hook" />
                  </div>
                  <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">
                      {details.hook}
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Section */}
              {details.cta && (
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        CTA
                      </span>
                    </div>
                    <CopyButton text={details.cta} label="CTA" />
                  </div>
                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100">
                    <p className="text-sm text-slate-800 font-medium">
                      {details.cta}
                    </p>
                  </div>
                </div>
              )}

              {/* Hashtags Section */}
              {details.hashtags.length > 0 && (
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Hashtagler
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-purple-50 text-purple-600 border-0"
                      >
                        {details.hashtags.length}
                      </Badge>
                    </div>
                    <CopyButton
                      text={details.hashtags
                        .map((h) => (h.startsWith("#") ? h : `#${h}`))
                        .join(" ")}
                      label="Hashtagler"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {details.hashtags.slice(0, 15).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            tag.startsWith("#") ? tag : `#${tag}`,
                          );
                          toast.success("Hashtag kopyalandi");
                        }}
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                    {details.hashtags.length > 15 && (
                      <span className="px-2.5 py-1 text-xs text-slate-400">
                        +{details.hashtags.length - 15} daha
                      </span>
                    )}
                  </div>
                  {details.hashtagRationale && (
                    <p className="mt-2 text-xs text-slate-500 italic">
                      {details.hashtagRationale}
                    </p>
                  )}
                </div>
              )}

              {/* Tweet Text (for X/Twitter) */}
              {details.tweetText && (
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Tweet
                      </span>
                    </div>
                    <CopyButton text={details.tweetText} label="Tweet" />
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {details.tweetText}
                    </p>
                  </div>
                </div>
              )}

              {/* Thread */}
              {(details.threadTitle || details.tweets.length > 0) && (
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Thread
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    {details.threadTitle && (
                      <p className="text-sm font-medium text-slate-800">
                        {details.threadTitle}
                      </p>
                    )}
                    {details.tweets.map((tweet, idx) => (
                      <p key={idx} className="text-sm text-slate-700">
                        {tweet.text || tweet}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Script */}
              {details.script && (
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Senaryo
                      </span>
                    </div>
                    <CopyButton text={details.script} label="Senaryo" />
                  </div>
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {details.script}
                    </p>
                    {details.duration && (
                      <p className="mt-2 text-xs text-emerald-600">
                        Sure: {details.duration}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Scenes */}
              {details.scenes.length > 0 && (
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Sahne Listesi
                    </span>
                  </div>
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                    {details.scenes.map((scene, idx) => (
                      <p key={idx} className="text-sm text-slate-700">
                        {scene.text || scene.description || scene}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Idea */}
              {details.storyIdea && (
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Story Fikri
                    </span>
                  </div>
                  <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">
                      {details.storyIdea}
                    </p>
                  </div>
                </div>
              )}

              {/* Visual Suggestions */}
              {details.visualSuggestions && (
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Gorsel Onerileri
                    </span>
                  </div>
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                    {typeof details.visualSuggestions === "string" ? (
                      <p className="text-sm text-slate-700">
                        {details.visualSuggestions}
                      </p>
                    ) : (
                      <>
                        {details.visualSuggestions.primary && (
                          <p className="text-sm text-slate-700">
                            <span className="font-medium text-emerald-700">
                              Ana:
                            </span>{" "}
                            {details.visualSuggestions.primary}
                          </p>
                        )}
                        {details.visualSuggestions.alternative && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium text-slate-500">
                              Alternatif:
                            </span>{" "}
                            {details.visualSuggestions.alternative}
                          </p>
                        )}
                        {details.visualSuggestions.description && (
                          <p className="text-sm text-slate-700">
                            {details.visualSuggestions.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(content.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{content.aiModel || "AI Model"}</span>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Footer Actions - FIXED */}
            <div style={{
              flexShrink: 0,
              display: 'flex',
              gap: '8px',
              padding: '16px',
              borderTop: '1px solid #f1f5f9',
              background: 'rgba(248,250,252,0.5)'
            }}>
              <Button
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                onClick={() => {
                  navigator.clipboard.writeText(previewText);
                  toast.success("Tum metin kopyalandi");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Tum Metni Kopyala
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                onClick={() => {
                  onOpenChange(false);
                  if (onEdit) {
                    onEdit(content);
                  }
                }}
                title="Content Studio'da Duzenle"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3"
                onClick={() => {
                  navigator.clipboard.writeText(content.id);
                  toast.success("ID kopyalandi");
                }}
              >
                <Hash className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3"
                onClick={() => {
                  const dataStr = JSON.stringify(content, null, 2);
                  const blob = new Blob([dataStr], {
                    type: "application/json",
                  });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `content-${content.id}.json`;
                  link.click();
                  toast.success("JSON indirildi");
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Empty State
function EmptyState({ hasFilters, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-6">
        <Archive className="w-10 h-10 text-emerald-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {hasFilters ? "Sonuc bulunamadi" : "Henuz icerik yok"}
      </h3>
      <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
        {hasFilters
          ? "Farkli filtreler deneyebilirsiniz"
          : "AI ile profesyonel sosyal medya icerikleri olusturun"}
      </p>
      {!hasFilters && (
        <Button
          onClick={onCreate}
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ilk Icerigi Olustur
        </Button>
      )}
    </div>
  );
}

// Stats Row
function StatsRow({ contents }) {
  const thisMonth = contents.filter((c) => {
    const date = c.createdAt?.toDate
      ? c.createdAt.toDate()
      : new Date(c.createdAt || 0);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const platforms = new Set(contents.map((c) => c.platform)).size;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Layers className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{contents.length}</p>
          <p className="text-xs text-slate-500">Toplam Icerik</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{thisMonth}</p>
          <p className="text-xs text-slate-500">Bu Ay</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
          <Archive className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{platforms}</p>
          <p className="text-xs text-slate-500">Platform</p>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
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
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (
        content.title?.toLowerCase().includes(search) ||
        content.platform?.toLowerCase().includes(search) ||
        JSON.stringify(content.content).toLowerCase().includes(search)
      );
    })
    .filter(
      (content) =>
        platformFilter === "all" || content.platform === platformFilter,
    )
    .filter(
      (content) =>
        contentTypeFilter === "all" ||
        content.contentType === contentTypeFilter,
    )
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentContents = filteredContents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleEdit = useCallback(
    (content) => {
      sessionStorage.setItem("editingContent", JSON.stringify(content));
      router.push("/admin/social-media/content-studio?mode=edit");
    },
    [router],
  );

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success("Panoya kopyalandi");
  }, []);

  const handleDelete = useCallback(async (contentId) => {
    if (!confirm("Bu icerigi silmek istediginize emin misiniz?")) return;
    try {
      await socialMediaService.deleteGeneratedContent(contentId);
      toast.success("Icerik silindi");
      loadContents();
    } catch (error) {
      toast.error("Icerik silinirken hata olustu");
    }
  }, []);

  const handleCardClick = useCallback((content) => {
    setSelectedContent(content);
    setPreviewOpen(true);
  }, []);

  const hasFilters =
    searchQuery || platformFilter !== "all" || contentTypeFilter !== "all";

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Icerik Arsivi</h1>
            <p className="text-sm text-slate-500 mt-1">
              Olusturdugunuz tum icerikleri yonetin
            </p>
          </div>
          <Button
            onClick={() => router.push("/admin/social-media/content-studio")}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm h-11 px-5"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Icerik
          </Button>
        </div>

        {/* Stats */}
        <StatsRow contents={contents} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-slate-200 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Icerik ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
            />
          </div>
          <Select
            value={platformFilter}
            onValueChange={(v) => {
              setPlatformFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-11 bg-slate-50 border-slate-200 rounded-xl">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tum Platformlar</SelectItem>
              {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <config.icon className={cn("w-4 h-4", config.textColor)} />
                    {config.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={contentTypeFilter}
            onValueChange={(v) => {
              setContentTypeFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] h-11 bg-slate-50 border-slate-200 rounded-xl">
              <SelectValue placeholder="Icerik Tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tum Tipler</SelectItem>
              {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setPlatformFilter("all");
                setContentTypeFilter("all");
              }}
              className="h-11 px-4 text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredContents.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onCreate={() => router.push("/admin/social-media/content-studio")}
          />
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {filteredContents.length} icerik bulundu
                {hasFilters && ` (toplam ${contents.length})`}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Onceki
                </Button>

                <div className="flex items-center gap-1 px-4">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "w-9 h-9 rounded-xl text-sm font-medium transition-colors",
                          currentPage === pageNum
                            ? "bg-emerald-600 text-white"
                            : "text-slate-600 hover:bg-slate-100",
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl"
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        content={selectedContent}
        onEdit={handleEdit}
      />
    </div>
  );
}
