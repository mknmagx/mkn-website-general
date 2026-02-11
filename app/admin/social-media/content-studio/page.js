"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  PermissionGuard,
  usePermissions,
} from "@/components/admin-route-guard";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Icons
import {
  Wand2,
  FileText,
  Search,
  Folder,
  ChevronRight,
  Check,
  Library,
  X,
  ImageIcon,
  Sparkles,
  Video,
  Settings,
  Brain,
  Cpu,
  Copy,
  Save,
  Download,
  RefreshCw,
  MoreHorizontal,
  Instagram,
  Facebook,
  Linkedin,
  Hash,
  Lightbulb,
  Type,
  ExternalLink,
  Clock,
  CheckCircle2,
  Play,
  Layers,
  Plus,
  Trash2,
  Upload,
  Eye,
  ArrowLeft,
  Zap,
  Info,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Palette,
  Type as TypeIcon,
  Maximize2,
} from "lucide-react";

// Components
import MobilePreview from "@/components/admin/mobile-preview";
import ImageUploader from "@/components/admin/image-uploader";

// Visual Generation Settings
import {
  VISUAL_STYLES,
  TEXT_OVERLAY_OPTIONS,
  COLOR_SCHEMES,
  MOOD_OPTIONS,
  PRESET_COMBINATIONS,
} from "@/config/visual-generation-settings";

// Hooks
import { useUnifiedAI, AI_CONTEXTS } from "@/hooks/use-unified-ai";
import { useContentStudio } from "@/hooks/use-content-studio";
import { PLATFORMS, CONTENT_TYPES } from "@/lib/constants/content-studio";

// X Icon
const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Platform Config
const PLATFORM_CONFIG = {
  instagram: {
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
    label: "Instagram",
    contentTypes: ["post", "reel", "story", "carousel"],
  },
  facebook: {
    icon: Facebook,
    color: "bg-blue-600",
    label: "Facebook",
    contentTypes: ["post", "reel", "story"],
  },
  x: {
    icon: XIcon,
    color: "bg-black",
    label: "X",
    contentTypes: ["tweet", "thread"],
  },
  linkedin: {
    icon: Linkedin,
    color: "bg-[#0A66C2]",
    label: "LinkedIn",
    contentTypes: ["post", "article", "carousel"],
  },
};

const CONTENT_TYPE_LABELS = {
  post: "Post",
  reel: "Reel",
  story: "Story",
  carousel: "Carousel",
  tweet: "Tweet",
  thread: "Thread",
  article: "Article",
  video: "Video",
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function getMediaInfo(content) {
  if (!content) return { url: null, isVideo: false, images: [] };

  if (content.image) {
    const img = content.image;
    if (img.type?.startsWith("video") || img.type === "video/mp4") {
      return { url: img.url, isVideo: true, images: [] };
    }
    if (img.type === "carousel" && img.images?.length > 0) {
      const urls = img.images
        .map((i) => (typeof i === "string" ? i : i?.url))
        .filter(Boolean);
      return { url: urls[0], isVideo: false, images: urls };
    }
    if (img.url) {
      return { url: img.url, isVideo: false, images: [img.url] };
    }
  }
  return { url: null, isVideo: false, images: [] };
}

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
    if (val) return typeof val === "object" ? val.text || "" : val;
  }
  return "";
}

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

/**
 * İçeriği farklı platform/tip için dönüştür
 * Mevcut içeriğin metin ve görsellerini yeni formata uygun şekilde aktarır
 */
function convertContentForPlatform(
  sourceContent,
  targetPlatform,
  targetContentType,
) {
  if (!sourceContent?.content) return null;

  const src = sourceContent.content;
  const details = getContentDetails(sourceContent);

  // Temel metinleri al
  const mainText =
    details.fullCaption || details.hook || details.tweetText || "";
  const hook = details.hook || "";
  const hashtags = details.hashtags || [];
  const cta = details.cta || "";

  // Platform/içerik tipine göre yeni yapı oluştur
  const converted = {
    hook: hook,
    hashtags: hashtags,
    cta: cta,
    hashtagStrategy: src.hashtagStrategy || { hashtags, rationale: "" },
    visualSuggestions: src.visualSuggestions || {},
  };

  // Platform özel dönüşümler
  switch (targetPlatform) {
    case "instagram":
      if (targetContentType === "post" || targetContentType === "carousel") {
        converted.fullCaption = mainText;
        converted.caption = { headline: hook, body: mainText };
      } else if (
        targetContentType === "reel" ||
        targetContentType === "story"
      ) {
        converted.script = mainText;
        converted.scenes = src.scenes || [];
        converted.duration = src.duration || "15-30 saniye";
      }
      break;

    case "facebook":
      converted.fullPost = mainText;
      converted.headline = hook;
      if (targetContentType === "reel" || targetContentType === "story") {
        converted.script = mainText;
      }
      break;

    case "x":
      // Tweet karakter limiti kontrolü
      const tweetText =
        mainText.length > 280 ? mainText.substring(0, 277) + "..." : mainText;
      if (targetContentType === "thread") {
        // Thread için metni parçalara ayır
        const tweets = [];
        let remaining = mainText;
        let index = 1;
        while (remaining.length > 0) {
          const chunk = remaining.substring(0, 270);
          tweets.push({
            index,
            text: chunk + (remaining.length > 270 ? "..." : ""),
          });
          remaining = remaining.substring(270);
          index++;
        }
        converted.tweets = tweets;
        converted.threadTitle = hook;
      } else {
        converted.tweetText = tweetText;
      }
      break;

    case "linkedin":
      converted.fullPost = mainText;
      converted.headline = hook;
      if (targetContentType === "article") {
        converted.title = hook;
        converted.body = mainText;
        converted.summary = mainText.substring(0, 200);
      }
      break;
  }

  return converted;
}

// ============================================
// COMPONENTS
// ============================================

// Copy Button
function CopyButton({ text, label, className, showLabel = false }) {
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
        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all",
        text
          ? "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          : "text-slate-300 cursor-not-allowed",
        copied && "text-emerald-600 bg-emerald-50",
        className,
      )}
    >
      {copied ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {showLabel && <span>{copied ? "Kopyalandi" : "Kopyala"}</span>}
    </button>
  );
}

// Regenerate Confirmation Dialog
function RegenerateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  contentCount,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <Info className="w-5 h-5" />
            Mevcut Icerik Silinecek
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-3">
          <p className="text-slate-600">
            Suanda{" "}
            <span className="font-semibold text-slate-900">
              {contentCount} adet
            </span>{" "}
            olusturulmus icerik var.
          </p>
          <p className="text-slate-600">
            Yeni icerik olusturdugunuzda, mevcut icerikler silinecek ve yeni
            icerik ile degistirilecektir.
          </p>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Eger mevcut icerikleri korumak istiyorsaniz, onleri kaydetmeyi
                unutmayin.
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Iptal
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            Devam Et
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Create Variant Dialog - Mevcut içerikten farklı platform/tip ile yeni içerik oluştur
function CreateVariantDialog({
  open,
  onOpenChange,
  sourceContent,
  sourcePlatform,
  sourceContentType,
  sourceImage,
  onCreateVariant,
}) {
  const [targetPlatform, setTargetPlatform] = useState(sourcePlatform);
  const [targetContentType, setTargetContentType] = useState(sourceContentType);
  const [creating, setCreating] = useState(false);

  const availableTypes = PLATFORM_CONFIG[targetPlatform]?.contentTypes || [
    "post",
  ];

  // Platform değişince content type'ı sıfırla
  useEffect(() => {
    if (!availableTypes.includes(targetContentType)) {
      setTargetContentType(availableTypes[0]);
    }
  }, [targetPlatform, availableTypes, targetContentType]);

  const handleCreate = async () => {
    if (
      targetPlatform === sourcePlatform &&
      targetContentType === sourceContentType
    ) {
      toast.error("Lutfen farkli bir platform veya icerik tipi seciniz");
      return;
    }

    setCreating(true);
    try {
      // İçeriği dönüştür
      const convertedContent = convertContentForPlatform(
        sourceContent,
        targetPlatform,
        targetContentType,
      );

      await onCreateVariant({
        platform: targetPlatform,
        contentType: targetContentType,
        content: convertedContent,
        image: sourceImage, // Görseli de aktar
      });

      onOpenChange(false);
      toast.success(
        `${PLATFORM_CONFIG[targetPlatform]?.label} ${CONTENT_TYPE_LABELS[targetContentType]} olarak olusturuldu`,
      );
    } catch (error) {
      console.error("Variant creation error:", error);
      toast.error("Icerik olusturulamadi");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 rounded-2xl overflow-hidden"
        style={{ width: "500px", maxWidth: "95vw" }}
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Farkli Olustur</DialogTitle>
          <DialogDescription>
            Mevcut icerigi farkli platform/tip icin kopyala
          </DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Farkli Olustur</h3>
              <p className="text-xs text-white/70">
                Bu icerigi farkli platforma aktar
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Source Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                PLATFORM_CONFIG[sourcePlatform]?.color,
              )}
            >
              {(() => {
                const Icon = PLATFORM_CONFIG[sourcePlatform]?.icon;
                return Icon ? <Icon className="w-4 h-4 text-white" /> : null;
              })()}
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Kaynak</p>
              <p className="text-sm font-medium text-slate-900">
                {PLATFORM_CONFIG[sourcePlatform]?.label} -{" "}
                {CONTENT_TYPE_LABELS[sourceContentType]}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>

          {/* Target Platform */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Hedef Platform
            </Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = targetPlatform === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTargetPlatform(key)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center",
                        config.color,
                      )}
                    >
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Content Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Icerik Tipi
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setTargetContentType(type)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all border-2",
                    targetContentType === type
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  )}
                >
                  {CONTENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Metin ve gorseller yeni formata uygun sekilde aktarilacak.
              Platform ozel alanlar otomatik doldurulacak.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-slate-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Iptal
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              creating ||
              (targetPlatform === sourcePlatform &&
                targetContentType === sourceContentType)
            }
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {creating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Olusturuluyor...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Olustur
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Visual Generation Section - Enhanced
function VisualGenerationSection({
  content,
  platform,
  contentType,
  generating,
  generatedImages = [],
  onGenerate,
  onSelectImage,
  onRemoveImage,
  selectedImageUrl,
  onShowAISettings,
  visualAiConfig,
  visualCurrentModel,
}) {
  const [prompt, setPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredImage, setHoveredImage] = useState(null);

  // Settings
  const [visualStyle, setVisualStyle] = useState("realistic");
  const [textOverlay, setTextOverlay] = useState("minimal");
  const [colorScheme, setColorScheme] = useState("brand");
  const [mood, setMood] = useState("professional");

  // Images per page for pagination
  const IMAGES_PER_PAGE = 4;
  const totalPages = Math.ceil(generatedImages.length / IMAGES_PER_PAGE);
  const paginatedImages = generatedImages.slice(
    currentPage * IMAGES_PER_PAGE,
    (currentPage + 1) * IMAGES_PER_PAGE,
  );

  // Get relevant presets based on platform
  const relevantPresets = Object.entries(PRESET_COMBINATIONS).filter(
    ([key, preset]) =>
      preset.platform === "Universal" ||
      preset.platform.toLowerCase() === platform?.toLowerCase(),
  );

  // Apply preset
  const applyPreset = (presetKey) => {
    const preset = PRESET_COMBINATIONS[presetKey];
    if (preset) {
      setSelectedPreset(presetKey);
      setVisualStyle(preset.settings.visualStyle);
      setTextOverlay(preset.settings.textOverlay);
      setColorScheme(preset.settings.colorScheme);
      setMood(preset.settings.mood);
      toast.success(`${preset.name} sablonu uygulandi`);
    }
  };

  const handleGenerate = () => {
    if (!content) {
      toast.error("Oncelikle icerik olusturun");
      return;
    }
    onGenerate({
      prompt,
      style: visualStyle,
      settings: {
        visualStyle,
        textOverlay,
        colorScheme,
        mood,
      },
    });
    setCurrentPage(0);
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Gorsel - AI Olusturma
            </h3>
            <p className="text-xs text-slate-500">
              {visualCurrentModel?.displayName ||
                visualCurrentModel?.name ||
                "Model secilmedi"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowAISettings}
          className="rounded-lg"
        >
          <Settings className="w-4 h-4 mr-1.5" />
          Gorsel Ayarlari
        </Button>
      </div>

      <div className="p-6 space-y-5">
        {/* Preset Templates */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Hazir Sablonlar
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {relevantPresets.slice(0, 4).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  selectedPreset === key
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <p className="text-xs font-medium text-slate-900">
                  {preset.name}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <span className="text-sm font-medium text-slate-700">
            Detayli Ayarlar
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform",
              showAdvanced && "rotate-180",
            )}
          />
        </button>

        {/* Advanced Settings Panel */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            {/* Visual Style */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Gorsel Stili
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(VISUAL_STYLES)
                  .slice(0, 5)
                  .map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setVisualStyle(style.value);
                        setSelectedPreset(null);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        visualStyle === style.value
                          ? "border-violet-500 bg-violet-100 text-violet-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                      )}
                    >
                      <span className="mr-1">{style.icon}</span>
                      {style.label.split(" ")[0]}
                    </button>
                  ))}
              </div>
            </div>

            {/* Text Overlay */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <TypeIcon className="w-3.5 h-3.5" />
                Yazi Miktari
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TEXT_OVERLAY_OPTIONS).map(([key, opt]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTextOverlay(opt.value);
                      setSelectedPreset(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                      textOverlay === opt.value
                        ? "border-violet-500 bg-violet-100 text-violet-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                    )}
                  >
                    <span className="mr-1">{opt.icon}</span>
                    {opt.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Renk Semasi
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(COLOR_SCHEMES)
                  .slice(0, 5)
                  .map(([key, scheme]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setColorScheme(scheme.value);
                        setSelectedPreset(null);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        colorScheme === scheme.value
                          ? "border-violet-500 bg-violet-100 text-violet-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                      )}
                    >
                      <span className="mr-1">{scheme.icon}</span>
                      {scheme.label.split(" ")[0]}
                    </button>
                  ))}
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Gorsel Havasi
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(MOOD_OPTIONS).map(([key, m]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setMood(m.value);
                      setSelectedPreset(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                      mood === m.value
                        ? "border-violet-500 bg-violet-100 text-violet-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                    )}
                  >
                    <span className="mr-1">{m.icon}</span>
                    {m.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Prompt */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            Ek Aciklama (Opsiyonel)
          </Label>
          <Textarea
            placeholder="Ornek: Turkuaz tonlari, profesyonel ortam, ofis arka plani, modern cizgiler..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] rounded-xl resize-none text-sm"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generating || !content}
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-sm font-medium"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Gorsel Olusturuluyor...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI ile Gorsel Olustur
            </>
          )}
        </Button>

        {/* Generated Images Grid with Pagination */}
        {generatedImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-700">
                Olusturulan Gorseller ({generatedImages.length})
              </Label>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-500">
                    {currentPage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage === totalPages - 1}
                    className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {paginatedImages.map((img, idx) => {
                const globalIdx = currentPage * IMAGES_PER_PAGE + idx;
                const isSelected = selectedImageUrl === img.url;
                const isHovered = hoveredImage === globalIdx;

                return (
                  <div
                    key={globalIdx}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                    onMouseEnter={() => setHoveredImage(globalIdx)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    <Image
                      src={img.url}
                      alt={`Generated ${globalIdx + 1}`}
                      fill
                      className="object-cover"
                    />

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 ring-4 ring-inset ring-violet-500 rounded-xl">
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity",
                        isHovered ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <button
                        onClick={() => onSelectImage(img.url)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-violet-500 text-white"
                            : "bg-white/90 text-slate-700 hover:bg-white",
                        )}
                        title="Gorseli Sec"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openInNewTab(img.url)}
                        className="w-10 h-10 rounded-xl bg-white/90 text-slate-700 hover:bg-white flex items-center justify-center transition-colors"
                        title="Yeni Sekmede Ac"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                      {onRemoveImage && (
                        <button
                          onClick={() => onRemoveImage(globalIdx)}
                          className="w-10 h-10 rounded-xl bg-red-500/90 text-white hover:bg-red-500 flex items-center justify-center transition-colors"
                          title="Kaldir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Platform Selector
function PlatformSelector({ selected, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
        const Icon = config.icon;
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2",
              isSelected
                ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center",
                config.color,
              )}
            >
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

// Content Type Selector
function ContentTypeSelector({ platform, selected, onSelect, disabled }) {
  const types = PLATFORM_CONFIG[platform]?.contentTypes || ["post"];

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          disabled={disabled}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all border-2",
            selected === type
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {CONTENT_TYPE_LABELS[type] || type}
        </button>
      ))}
    </div>
  );
}

// Title Selection Dialog
function TitleSelectionDialog({
  open,
  onOpenChange,
  datasets,
  selectedDataset,
  datasetTitles,
  selectedTitle,
  onDatasetSelect,
  onTitleSelect,
  searchTerm,
  onSearchChange,
  titleSearchTerm,
  onTitleSearchChange,
  loadingTitles,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 rounded-2xl overflow-hidden"
        style={{
          width: "900px",
          maxWidth: "95vw",
          height: "600px",
          maxHeight: "85vh",
        }}
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Baslik Secimi</DialogTitle>
          <DialogDescription>Dataset ve baslik seciniz</DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Library className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Baslik Sec</h3>
              <p className="text-xs text-slate-500">
                Kutuphaneden bir baslik seciniz
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex flex-1 overflow-hidden"
          style={{ height: "calc(100% - 73px)" }}
        >
          {/* Datasets Column */}
          <div className="w-[300px] border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Dataset ara..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {datasets
                .filter((d) =>
                  d.name?.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((dataset) => (
                  <button
                    key={dataset.id}
                    onClick={() => onDatasetSelect(dataset.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all",
                      selectedDataset?.id === dataset.id
                        ? "bg-violet-50 border-2 border-violet-200"
                        : "hover:bg-slate-50 border-2 border-transparent",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        selectedDataset?.id === dataset.id
                          ? "bg-violet-500"
                          : "bg-slate-200",
                      )}
                    >
                      <Folder
                        className={cn(
                          "w-4 h-4",
                          selectedDataset?.id === dataset.id
                            ? "text-white"
                            : "text-slate-500",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {dataset.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {dataset.titleCount || 0} baslik
                      </p>
                    </div>
                    {selectedDataset?.id === dataset.id && (
                      <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Titles Column */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Baslik ara..."
                  value={titleSearchTerm}
                  onChange={(e) => onTitleSearchChange(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-slate-200"
                  disabled={!selectedDataset}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {loadingTitles ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : !selectedDataset ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Folder className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Onece bir dataset seciniz</p>
                </div>
              ) : datasetTitles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <FileText className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Bu datasette baslik bulunamadi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {datasetTitles
                    .filter((t) =>
                      t.title
                        ?.toLowerCase()
                        .includes(titleSearchTerm.toLowerCase()),
                    )
                    .map((title) => (
                      <button
                        key={title.id}
                        onClick={() => {
                          onTitleSelect(title);
                          onOpenChange(false);
                        }}
                        className={cn(
                          "w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all",
                          selectedTitle?.id === title.id
                            ? "bg-violet-50 border-2 border-violet-300"
                            : "bg-white border-2 border-slate-100 hover:border-slate-200",
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            selectedTitle?.id === title.id
                              ? "bg-violet-500"
                              : "bg-slate-100",
                          )}
                        >
                          {selectedTitle?.id === title.id ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <FileText className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 line-clamp-2">
                            {title.title}
                          </p>
                          {title.category && (
                            <Badge
                              variant="secondary"
                              className="mt-2 text-[10px]"
                            >
                              {title.category}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// AI Settings Dialog
function AISettingsDialog({
  open,
  onOpenChange,
  aiConfig,
  availableModels,
  modelsByProvider,
  currentModel,
  currentProvider,
  selectModel,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  isThinkingModel,
  configLoading,
  title = "AI Ayarlari",
  subtitle = "Model ve parametre secimi",
  promptData = null,
  sampleVariables = {},
}) {
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Generate sample filled prompt
  const getFilledPrompt = () => {
    if (!promptData?.systemPrompt) return null;
    let filled = promptData.systemPrompt;

    // Replace all variables
    Object.entries(sampleVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}|\\$\\{${key}\\}`, "gi");
      filled = filled.replace(regex, value || `[${key}]`);
    });

    return filled;
  };

  const filledPrompt = getFilledPrompt();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 rounded-2xl overflow-hidden"
        style={{
          width: "700px",
          maxWidth: "95vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>AI model ve parametre ayarlari</DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-violet-500 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-xs text-white/70">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {configLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : (
            <>
              {/* Model Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">
                  AI Model
                </Label>
                <Select
                  value={currentModel?.id || ""}
                  onValueChange={selectModel}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
                    <SelectValue placeholder="Model seciniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(modelsByProvider || {}).map(
                      ([provider, models]) => (
                        <div key={provider}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50">
                            {provider}
                          </div>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-slate-400" />
                                <span>{model.displayName || model.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ),
                    )}
                  </SelectContent>
                </Select>

                {currentModel && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {currentModel.displayName || currentModel.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {currentProvider?.name}
                      </p>
                    </div>
                    {isThinkingModel() && (
                      <Badge className="bg-amber-100 text-amber-700 border-0">
                        <Brain className="w-3 h-3 mr-1" />
                        Thinking
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">
                    Temperature
                  </Label>
                  <span className="text-sm font-mono text-violet-600">
                    {temperature.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={([val]) => setTemperature(val)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="py-2"
                />
                <p className="text-xs text-slate-500">
                  Dusuk = daha tutarli, Yuksek = daha yaratici
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">
                    Max Tokens
                  </Label>
                  <span className="text-sm font-mono text-violet-600">
                    {maxTokens.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[maxTokens]}
                  onValueChange={([val]) => setMaxTokens(val)}
                  min={1000}
                  max={8192}
                  step={100}
                  className="py-2"
                />
                <p className="text-xs text-slate-500">
                  Firestore ayarlarindan yuklendi. Degisiklikler sadece bu
                  oturum icin gecerlidir.
                </p>
                {isThinkingModel() && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                    <Brain className="w-4 h-4" />
                    Thinking model: Dusunme asamasi icin daha fazla token
                    gerekebilir
                  </div>
                )}
              </div>
            </>
          )}

          {/* Prompt Preview Section */}
          {promptData && (
            <div className="space-y-3 border-t pt-4">
              <button
                onClick={() => setShowPromptPreview(!showPromptPreview)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Prompt Onizleme
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {promptData.name && (
                    <Badge variant="outline" className="text-xs">
                      {promptData.name}
                    </Badge>
                  )}
                  {showPromptPreview ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {showPromptPreview && (
                <div className="space-y-4 px-1">
                  {/* System Prompt */}
                  {promptData.systemPrompt && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                          System Prompt
                        </Badge>
                        {promptData.version && (
                          <Badge variant="outline" className="text-[10px]">
                            v{promptData.version}
                          </Badge>
                        )}
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-blue-900 whitespace-pre-wrap font-mono">
                          {promptData.systemPrompt}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* User Prompt Template */}
                  {promptData.userPromptTemplate && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          User Prompt Template
                        </Badge>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-green-900 whitespace-pre-wrap font-mono">
                          {promptData.userPromptTemplate}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Variables List */}
                  {promptData.variables && promptData.variables.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                          Degiskenler
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {promptData.variables.map((variable) => {
                          const value = sampleVariables[variable];
                          return (
                            <div
                              key={variable}
                              className={cn(
                                "px-2 py-1 rounded text-xs",
                                value
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500",
                              )}
                            >
                              <span className="font-medium">{`{{${variable}}}`}</span>
                              {value && (
                                <span className="text-emerald-600 ml-1">
                                  = {String(value).substring(0, 25)}
                                  {String(value).length > 25 ? "..." : ""}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Filled Preview */}
                  {filledPrompt && Object.keys(sampleVariables).length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">
                          Doldurulmus System Prompt
                        </Badge>
                      </div>
                      <div className="p-3 bg-violet-50 rounded-lg border border-violet-100 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-violet-900 whitespace-pre-wrap font-mono">
                          {filledPrompt}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-2 px-6 py-4 border-t bg-slate-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Media Selection Component
// Carousel Media Item Component
function CarouselMediaItem({ url, index, onRemove, onDragStart, onDragOver, onDrop, isDragging }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        "relative aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 transition-all cursor-move group",
        isDragging ? "border-violet-500 opacity-50" : "border-slate-200 hover:border-violet-400"
      )}
    >
      <img
        src={url}
        alt={`Görsel ${index + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex flex-col items-center gap-1 text-white">
          <Maximize2 className="w-5 h-5" />
          <span className="text-xs font-medium">Sürükle</span>
        </div>
      </div>

      {/* Order Badge */}
      <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">
        {index + 1}
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Carousel Media Manager Component
function CarouselMediaManager({ imagePreviews, onUpdatePreviews, onClear, currentContent }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Get carousel images from currentContent if imagePreviews is empty
  const effectivePreviews = (() => {
    if (imagePreviews.length > 0) {
      return imagePreviews;
    }
    
    if (currentContent?.image) {
      // Carousel tipinde images array'i varsa
      if (currentContent.image.type === "carousel" && currentContent.image.images?.length > 0) {
        return currentContent.image.images.map(img => img.url);
      }
      // Tekil image URL'si varsa (post'tan carousel'e dönüştürülmüş olabilir)
      if (currentContent.image.url && currentContent.image.type !== "carousel") {
        return [currentContent.image.url];
      }
    }
    
    return [];
  })();

  // Sync currentContent images to parent state if imagePreviews is empty
  useEffect(() => {
    if (imagePreviews.length === 0 && effectivePreviews.length > 0) {
      onUpdatePreviews(effectivePreviews);
    }
  }, [currentContent?.image]);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPreviews = [...effectivePreviews];
    const draggedItem = newPreviews[draggedIndex];
    newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(dropIndex, 0, draggedItem);
    
    setDraggedIndex(null);
    onUpdatePreviews(newPreviews);
  };

  const handleRemove = (index) => {
    const newPreviews = effectivePreviews.filter((_, idx) => idx !== index);
    
    if (newPreviews.length === 0) {
      onClear();
    } else {
      onUpdatePreviews(newPreviews);
    }
  };

  const handleAddImages = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readFiles = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readFiles).then((newUrls) => {
      const updatedPreviews = [...effectivePreviews, ...newUrls];
      onUpdatePreviews(updatedPreviews);
    });

    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold text-slate-700">
            Carousel Gorseller
          </Label>
          <Badge variant="secondary" className="text-xs">
            {effectivePreviews.length} / 10
          </Badge>
        </div>
        {effectivePreviews.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3 h-3" />
            Tumu Temizle
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleAddImages}
        className="hidden"
      />

      {effectivePreviews.length > 0 ? (
        <>
          {/* Media Grid */}
          <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
            {effectivePreviews.map((url, index) => (
              <CarouselMediaItem
                key={`carousel-${index}-${url.substring(0, 20)}`}
                url={url}
                index={index}
                onRemove={handleRemove}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragging={draggedIndex === index}
              />
            ))}
          </div>

          {/* Add More Button */}
          {effectivePreviews.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-dashed border-2 hover:border-violet-400 hover:bg-violet-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Daha Fazla Gorsel Ekle ({effectivePreviews.length}/10)
            </Button>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Görselleri <strong>sürükleyerek</strong> sıralayabilir, her görselin üzerine gelip <strong>X</strong> butonuna tıklayarak silebilirsiniz.
            </p>
          </div>
        </>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Layers className="w-8 h-8 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                Carousel için gorseller ekleyin
              </p>
              <p className="text-xs text-slate-500">
                2-10 arasında gorsel yukleyebilirsiniz
              </p>
            </div>
            <Button type="button" size="sm" className="mt-2">
              <Upload className="w-4 h-4 mr-2" />
              Gorsel Sec
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaSelector({
  selectedImage,
  imagePreview,
  selectedVideo,
  videoPreview,
  selectedImages,
  imagePreviews,
  onImageSelect,
  onVideoSelect,
  onImagesSelect,
  onUpdatePreviews,
  onClear,
  contentType,
  currentContent,
}) {
  const isCarousel = contentType === "carousel";
  const isVideo = contentType === "reel" || contentType === "video";
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isVideo) {
        onVideoSelect(file, reader.result);
      } else {
        onImageSelect(file, reader.result);
      }
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  // Carousel için özel component kullan
  if (isCarousel) {
    return (
      <CarouselMediaManager
        imagePreviews={imagePreviews}
        onUpdatePreviews={onUpdatePreviews}
        onClear={onClear}
        currentContent={currentContent}
      />
    );
  }

  // Get media from currentContent if not manually selected
  let displayImageUrl = imagePreview;
  let displayVideoUrl = videoPreview;
  
  if (!displayImageUrl && !displayVideoUrl && currentContent?.image) {
    if (currentContent.image.type === "video/mp4" || currentContent.image.type?.startsWith("video")) {
      displayVideoUrl = currentContent.image.url;
    } else if (currentContent.image.url) {
      displayImageUrl = currentContent.image.url;
    }
  }

  const hasMedia = displayImageUrl || displayVideoUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-slate-700">
          {isVideo ? "Video" : "Gorsel"}
        </Label>
        {hasMedia && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Temizle
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={isVideo ? "video/*" : "image/*"}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview */}
      {displayVideoUrl ? (
        <>
          <div className="relative rounded-xl overflow-hidden bg-slate-900 max-h-[300px]">
            <video
              src={displayVideoUrl}
              className="w-full h-full object-contain max-h-[300px]"
              controls
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Baska Video Sec
          </Button>
        </>
      ) : displayImageUrl ? (
        <>
          <div className="relative rounded-xl overflow-hidden bg-slate-100">
            <img
              src={displayImageUrl}
              alt="Preview"
              className="w-full h-auto max-h-[280px] object-contain rounded-xl"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Baska Gorsel Sec
          </Button>
        </>
      ) : (
        <ImageUploader
          platform={
            contentType === "post" ? "instagram" : "facebook"
          }
          contentType={contentType}
          onImageSelect={(file, preview) => {
            if (isVideo) {
              onVideoSelect(file, preview);
            } else {
              onImageSelect(file, preview);
            }
          }}
          onRemove={onClear}
        />
      )}
    </div>
  );
}

// Content Preview Panel
function ContentPreviewPanel({ content, platform, contentType, onCopy }) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-medium">Onizleme</p>
        <p className="text-xs text-center mt-1">
          Icerik olusturuldugunda burada gorunecek
        </p>
      </div>
    );
  }

  const { url, isVideo, images } = getMediaInfo(content);
  const details = getContentDetails(content);
  const platformConfig = PLATFORM_CONFIG[platform];
  const PlatformIcon = platformConfig?.icon || FileText;

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left - Phone Preview */}
      <div className="flex flex-col items-center justify-center" style={{ width: "330px" }}>
        {/* Phone Frame */}
        <div
          style={{
            position: "relative",
            background: "#0f172a",
            borderRadius: "2.5rem",
            padding: "6px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70px",
              height: "18px",
              background: "#000",
              borderRadius: "9999px",
              zIndex: 30,
            }}
          />

          {/* Screen */}
          <div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "2.2rem",
              overflow: "hidden",
              width: "320px",
              height: "700px",
            }}
          >
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <MobilePreview
                platform={platform || "instagram"}
                contentType={contentType || "post"}
                content={content.content || {}}
                image={url}
                images={images}
                isVideo={isVideo}
                embedded={true}
              />
            </div>
            {/* Home Indicator */}
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100px",
                height: "4px",
                background: "rgba(15,23,42,0.15)",
                borderRadius: "9999px",
              }}
            />
          </div>
        </div>

        {/* Platform Badge */}
        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-slate-100 rounded-full">
          <div
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center",
              platformConfig?.color || "bg-slate-600",
            )}
          >
            <PlatformIcon className="w-3 h-3 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-700">
              {platformConfig?.label}
            </p>
            <p className="text-[10px] text-slate-500">
              {CONTENT_TYPE_LABELS[contentType]}
            </p>
          </div>
        </div>
      </div>

      {/* Right - Content Details Card */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Content Details - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          {details.title && details.title !== details.fullCaption && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Baslik
                  </span>
                </div>
                <CopyButton text={details.title} label="Baslik" />
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {details.title}
                </p>
              </div>
            </div>
          )}

          {/* Summary */}
          {details.summary && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Ozet
                  </span>
                </div>
                <CopyButton text={details.summary} label="Ozet" />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {details.summary}
                </p>
              </div>
            </div>
          )}

          {/* Full Caption */}
          {details.fullCaption && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Metin
                  </span>
                </div>
                <CopyButton text={details.fullCaption} label="Metin" />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-40 overflow-y-auto">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {details.fullCaption}
                </p>
              </div>
            </div>
          )}

          {/* Hook */}
          {details.hook && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Hook
                  </span>
                </div>
                <CopyButton text={details.hook} label="Hook" />
              </div>
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-100">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {details.hook}
                </p>
              </div>
            </div>
          )}

          {/* CTA */}
          {details.cta && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    CTA
                  </span>
                </div>
                <CopyButton text={details.cta} label="CTA" />
              </div>
              <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {details.cta}
                </p>
              </div>
            </div>
          )}

          {/* Hashtags */}
          {details.hashtags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Hashtagler
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
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
                {details.hashtags.slice(0, 10).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-md cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        tag.startsWith("#") ? tag : `#${tag}`,
                      );
                      toast.success("Kopyalandi");
                    }}
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
              {details.hashtagRationale && (
                <p className="mt-2 text-xs text-slate-500 italic">
                  {details.hashtagRationale}
                </p>
              )}
            </div>
          )}

          {/* Tweet */}
          {details.tweetText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Tweet
                  </span>
                </div>
                <CopyButton text={details.tweetText} label="Tweet" />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {details.tweetText}
                </p>
              </div>
            </div>
          )}

          {/* Thread */}
          {(details.threadTitle || details.tweets.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Thread
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Senaryo
                  </span>
                </div>
                <CopyButton text={details.script} label="Senaryo" />
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
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
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Sahne Listesi
                </span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 space-y-2">
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
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Story Fikri
                </span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {details.storyIdea}
                </p>
              </div>
            </div>
          )}

          {/* Visual Suggestions */}
          {details.visualSuggestions && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Gorsel Onerileri
                </span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 space-y-2">
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
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 p-4 border-t bg-slate-50">
          <Button
            size="sm"
            className="w-full bg-violet-600 hover:bg-violet-700 h-10 text-sm font-medium"
            onClick={onCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            Tum Metni Kopyala
          </Button>
        </div>
      </div>
    </div>
  );
}

// Customization Panel
function CustomizationPanel({
  customization,
  setCustomization,
  showCustomization,
  setShowCustomization,
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowCustomization(!showCustomization)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-900">Ozellestirme</p>
            <p className="text-xs text-slate-500">Ton, CTA, hashtag vb.</p>
          </div>
        </div>
        <ChevronRight
          className={cn(
            "w-5 h-5 text-slate-400 transition-transform",
            showCustomization && "rotate-90",
          )}
        />
      </button>

      {showCustomization && (
        <div className="space-y-4 p-4 bg-white border border-slate-200 rounded-xl">
          {/* Tone */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">Ton</Label>
            <Select
              value={customization.tone}
              onValueChange={(val) =>
                setCustomization((prev) => ({ ...prev, tone: val }))
              }
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Ton seciniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Profesyonel</SelectItem>
                <SelectItem value="friendly">Samimi</SelectItem>
                <SelectItem value="educational">Egitici</SelectItem>
                <SelectItem value="inspirational">Ilham Verici</SelectItem>
                <SelectItem value="humorous">Eglenceli</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Length */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Uzunluk
            </Label>
            <Select
              value={customization.length}
              onValueChange={(val) =>
                setCustomization((prev) => ({ ...prev, length: val }))
              }
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Uzunluk seciniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Kisa</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="long">Uzun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom CTA */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Ozel CTA
            </Label>
            <Input
              placeholder="Ornek: Detaylar icin link bio'da"
              value={customization.customCTA}
              onChange={(e) =>
                setCustomization((prev) => ({
                  ...prev,
                  customCTA: e.target.value,
                }))
              }
              className="h-10 rounded-lg"
            />
          </div>

          {/* Focus Angle */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Odak Noktasi
            </Label>
            <Input
              placeholder="Ornek: Dogal icerikler, Cilt bakimi"
              value={customization.focusAngle}
              onChange={(e) =>
                setCustomization((prev) => ({
                  ...prev,
                  focusAngle: e.target.value,
                }))
              }
              className="h-10 rounded-lg"
            />
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">Ek Not</Label>
            <Textarea
              placeholder="AI'ya ekstra bilgi verin..."
              value={customization.additionalContext}
              onChange={(e) =>
                setCustomization((prev) => ({
                  ...prev,
                  additionalContext: e.target.value,
                }))
              }
              className="min-h-[60px] rounded-lg resize-none"
            />
          </div>

          {/* Include Emoji */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-900">Emoji Kullan</p>
              <p className="text-xs text-slate-500">
                Metinde emoji eklensin mi?
              </p>
            </div>
            <Switch
              checked={customization.includeEmoji}
              onCheckedChange={(val) =>
                setCustomization((prev) => ({ ...prev, includeEmoji: val }))
              }
              className="data-[state=checked]:bg-violet-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function ContentStudioPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  // AI Hook
  // AI Config for Content Generation
  const {
    config: aiConfig,
    availableModels,
    modelsByProvider,
    selectedModel: currentModel,
    currentProvider,
    selectModel,
    loading: aiLoading,
    configLoading,
    isReady: aiIsReady,
    prompt: contentPrompt,
  } = useUnifiedAI(AI_CONTEXTS.CONTENT_STUDIO_GENERATION);

  // AI Config for Visual Generation (separate config)
  const {
    config: visualAiConfig,
    availableModels: visualAvailableModels,
    modelsByProvider: visualModelsByProvider,
    selectedModel: visualCurrentModel,
    currentProvider: visualCurrentProvider,
    selectModel: visualSelectModel,
    loading: visualAiLoading,
    configLoading: visualConfigLoading,
    isReady: visualAiIsReady,
    prompt: visualPrompt,
  } = useUnifiedAI(AI_CONTEXTS.CONTENT_VISUAL_GENERATION);

  // AI Settings State - Content Generation
  const [showAISettings, setShowAISettings] = useState(false);
  const [temperature, setTemperature] = useState(
    aiConfig?.settings?.temperature || 0.8,
  );
  const [maxTokens, setMaxTokens] = useState(
    aiConfig?.settings?.maxTokens || 4096,
  );

  // AI Settings State - Visual Generation
  const [showVisualAISettings, setShowVisualAISettings] = useState(false);
  const [visualTemperature, setVisualTemperature] = useState(
    visualAiConfig?.settings?.temperature || 0.7,
  );
  const [visualMaxTokens, setVisualMaxTokens] = useState(
    visualAiConfig?.settings?.maxTokens || 2048,
  );

  // Regenerate Confirmation State
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Content Studio Hook
  const {
    datasets,
    selectedDataset,
    datasetTitles,
    selectedTitle,
    selectedPlatform,
    selectedContentType,
    aiModel,
    generating,
    generatedContents,
    currentPreview,
    searchTerm,
    titleSearchTerm,
    loadingTitles,
    dialogOpen,
    selectedImage,
    imagePreview,
    selectedVideo,
    videoPreview,
    selectedImages,
    imagePreviews,
    customization,
    showCustomization,
    setSelectedDataset,
    setSelectedTitle,
    setSelectedPlatform,
    setSelectedContentType,
    setAiModel,
    setGeneratedContents,
    setCurrentPreview,
    setSearchTerm,
    setTitleSearchTerm,
    setDialogOpen,
    setSelectedImage,
    setImagePreview,
    setSelectedVideo,
    setVideoPreview,
    setSelectedImages,
    setImagePreviews,
    setCustomization,
    setShowCustomization,
    loadDatasetTitles,
    selectPlatform,
    selectContentType,
    handleGenerate,
    handleUpdate,
    handleSaveAsNew,
    handleSaveAsNewWithContent,
    handleCopy,
    editingContentId,
    visualGenerating,
    aiGeneratedImages,
    setVisualGenerating,
    setAiGeneratedImages,
  } = useContentStudio();

  // Manual title input
  const [manualTitle, setManualTitle] = useState("");
  const [useManualTitle, setUseManualTitle] = useState(false);

  // Variant dialog state
  const [showVariantDialog, setShowVariantDialog] = useState(false);

  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initialContentRef = useRef(null);

  // Check if content exists (for locking fields)
  const hasGeneratedContent =
    generatedContents.length > 0 && generatedContents[0]?.content;

  // Track content changes - mark as unsaved when content is generated or edited
  useEffect(() => {
    if (generatedContents.length === 0) {
      return;
    }

    const snapshot = JSON.stringify(generatedContents);

    // Establish baseline snapshot
    if (!initialContentRef.current) {
      initialContentRef.current = snapshot;
      setIsInitialLoad(false);

      // New content (not edit mode) should be marked as unsaved
      if (!editingContentId) {
        setHasUnsavedChanges(true);
      }
      return;
    }

    if (snapshot !== initialContentRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [generatedContents, editingContentId]);

  // Reset baseline when switching edit target
  useEffect(() => {
    if (!editingContentId) {
      initialContentRef.current = null;
      setIsInitialLoad(true);
      setHasUnsavedChanges(false);
      return;
    }

    if (generatedContents.length > 0) {
      initialContentRef.current = JSON.stringify(generatedContents);
      setIsInitialLoad(false);
      setHasUnsavedChanges(false);
    }
  }, [editingContentId, generatedContents.length]);

  // Browser beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Kaydedilmemiş degisiklikleriniz var. Sayfadan cikmayi onayliyor musunuz?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation with unsaved changes
  const handleNavigation = useCallback((url) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Kaydedilmemiş degisiklikleriniz var. Sayfadan cikmayi onayliyor musunuz?"
      );
      if (confirmed) {
        setHasUnsavedChanges(false);
        router.push(url);
      }
    } else {
      router.push(url);
    }
  }, [hasUnsavedChanges, router]);

  // Sync AI model
  useEffect(() => {
    if (currentModel && currentModel.id !== aiModel) {
      setAiModel(currentModel.id);
    }
  }, [currentModel, aiModel, setAiModel]);

  // Is thinking model (Content)
  const isThinkingModel = useCallback(() => {
    const modelId = aiModel || currentModel?.modelId || currentModel?.id || "";
    const modelName = (
      currentModel?.name ||
      currentModel?.displayName ||
      ""
    ).toLowerCase();
    const patterns = ["gemini-3", "opus", "o1", "o3", "thinking", "reasoning"];
    return patterns.some(
      (p) => modelId.toLowerCase().includes(p) || modelName.includes(p),
    );
  }, [aiModel, currentModel]);

  // Is thinking model (Visual)
  const visualIsThinkingModel = useCallback(() => {
    const modelId = visualCurrentModel?.modelId || visualCurrentModel?.id || "";
    const modelName = (
      visualCurrentModel?.name ||
      visualCurrentModel?.displayName ||
      ""
    ).toLowerCase();
    const patterns = ["gemini-3", "opus", "o1", "o3", "thinking", "reasoning"];
    return patterns.some(
      (p) => modelId.toLowerCase().includes(p) || modelName.includes(p),
    );
  }, [visualCurrentModel]);

  // Sync settings from Firestore config (Content)
  useEffect(() => {
    if (aiConfig?.settings) {
      if (aiConfig.settings.temperature !== undefined) {
        setTemperature(aiConfig.settings.temperature);
      }
      if (aiConfig.settings.maxTokens !== undefined) {
        setMaxTokens(aiConfig.settings.maxTokens);
      }
    }
  }, [aiConfig]);

  // Sync settings from Firestore config (Visual)
  useEffect(() => {
    if (visualAiConfig?.settings) {
      if (visualAiConfig.settings.temperature !== undefined) {
        setVisualTemperature(visualAiConfig.settings.temperature);
      }
      if (visualAiConfig.settings.maxTokens !== undefined) {
        setVisualMaxTokens(visualAiConfig.settings.maxTokens);
      }
    }
  }, [visualAiConfig]);

  // Sync image preview when content changes (for archive or loaded content)
  useEffect(() => {
    const content = generatedContents[currentPreview];

    if (content?.image) {
      // Single image or video
      if (content.image.url) {
        const imageUrl = content.image.url;
        // Always update to ensure sync
        if (imageUrl !== imagePreview) {
          setImagePreview(imageUrl);
          setSelectedImage(content.image);
        }
      }
      // Carousel images
      else if (content.image.images?.length > 0) {
        const urls = content.image.images
          .map((i) => (typeof i === "string" ? i : i?.url))
          .filter(Boolean);
        if (urls.length > 0) {
          setImagePreviews(urls);
          if (!imagePreview || imagePreview !== urls[0]) {
            setImagePreview(urls[0]);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPreview,
    generatedContents,
    generatedContents[currentPreview]?.image,
  ]);

  // Generate content handler
  const onGenerate = async () => {
    const titleToUse = useManualTitle
      ? { title: manualTitle, id: null }
      : selectedTitle;
    if (!titleToUse?.title && !useManualTitle) {
      toast.error("Lutfen bir baslik seciniz veya yaziniz");
      return;
    }
    if (useManualTitle && !manualTitle.trim()) {
      toast.error("Lutfen bir baslik yaziniz");
      return;
    }

    // Check if content already exists
    if (generatedContents.length > 0) {
      setShowRegenerateConfirm(true);
      return;
    }

    // If manual title, set it as selected title temporarily
    if (useManualTitle) {
      setSelectedTitle({ title: manualTitle.trim(), id: null });
    }
    await handleGenerate({ temperature, maxTokens });
  };

  // Confirmed regenerate handler
  const handleConfirmedGenerate = async () => {
    setShowRegenerateConfirm(false);
    // If manual title, set it as selected title temporarily
    if (useManualTitle) {
      setSelectedTitle({ title: manualTitle.trim(), id: null });
    }
    await handleGenerate({ temperature, maxTokens });
  };

  // Current content
  const currentContent = generatedContents[currentPreview] || null;
  const editableHook =
    currentContent?.content?.hook ||
    currentContent?.content?.openingHook ||
    currentContent?.content?.caption?.headline ||
    currentContent?.content?.headline ||
    "";
  const editableText =
    currentContent?.content?.fullCaption ||
    currentContent?.content?.caption?.text ||
    currentContent?.content?.caption ||
    currentContent?.content?.fullPost ||
    currentContent?.content?.fullText?.text ||
    currentContent?.content?.fullText ||
    currentContent?.content?.body?.text ||
    currentContent?.content?.body ||
    currentContent?.content?.text ||
    "";

  const setMediaFromImage = useCallback(
    (image) => {
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedVideo(null);
      setVideoPreview(null);
      setSelectedImages([]);
      setImagePreviews([]);

      if (!image) return;

      if (image.type === "carousel" && image.images?.length > 0) {
        const urls = image.images
          .map((img) => (typeof img === "string" ? img : img?.url))
          .filter(Boolean);
        if (urls.length > 0) {
          setImagePreviews(urls);
          setImagePreview(urls[0]);
        }
        setSelectedImages(
          image.images.map((img) =>
            typeof img === "string" ? { url: img } : img,
          ),
        );
        return;
      }

      if (image.type?.startsWith("video/")) {
        if (image.url) {
          setVideoPreview(image.url);
          setSelectedVideo(image);
        }
        return;
      }

      if (image.url) {
        setImagePreview(image.url);
        setSelectedImage(image);
      }
    },
    [
      setSelectedImage,
      setImagePreview,
      setSelectedVideo,
      setVideoPreview,
      setSelectedImages,
      setImagePreviews,
    ],
  );

  // Clear media
  const clearMedia = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedVideo(null);
    setVideoPreview(null);
    setSelectedImages([]);
    setImagePreviews([]);

    // Clear image from current content
    if (currentContent) {
      const updated = [...generatedContents];
      updated[currentPreview] = {
        ...updated[currentPreview],
        image: null,
      };
      setGeneratedContents(updated);
    }
  };

  // Create variant handler - mevcut içerikten farklı platform/tip ile yeni içerik oluştur
  const handleCreateVariant = async (variantData) => {
    const { platform, contentType, content, image } = variantData;

    // Yeni içerik oluştur
    const newContent = {
      platform,
      contentType,
      content,
      image: image || currentContent?.image,
      success: true,
    };

    // State'leri güncelle
    setSelectedPlatform(platform);
    setSelectedContentType(contentType);
    setGeneratedContents([newContent]);
    setCurrentPreview(0);
    setMediaFromImage(image || currentContent?.image || null);

    const savedId = await handleSaveAsNewWithContent(newContent);
    if (savedId) {
      setHasUnsavedChanges(false);
      initialContentRef.current = JSON.stringify([newContent]);
    }
  };

  // Save wrapper - wraps handleUpdate and handleSaveAsNew
  const handleSave = async () => {
    try {
      if (editingContentId) {
        await handleUpdate();
      } else {
        await handleSaveAsNew();
      }
      setHasUnsavedChanges(false);
      initialContentRef.current = JSON.stringify(generatedContents);
      toast.success(editingContentId ? "Icerik guncellendi" : "Icerik kaydedildi");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Kaydetme basarisiz");
    }
  };

  // Generate visual handler
  const handleGenerateVisual = async ({ prompt, style, settings }) => {
    if (!currentContent) {
      toast.error("Oncelikle icerik olusturun");
      return;
    }

    setVisualGenerating(true);
    try {
      // Generate unique IDs for the API
      const chatId = `content-studio-${Date.now()}`;
      const contentId = editingContentId || `temp-${Date.now()}`;

      // Build the message from content
      const contentText =
        currentContent.content?.fullCaption ||
        currentContent.content?.fullPost ||
        currentContent.content?.tweetText ||
        currentContent.content?.hook ||
        JSON.stringify(currentContent.content);

      // Build the visual generation message
      const visualPrompt = prompt
        ? `${prompt}\n\nIcerik:\n${contentText}`
        : `Bu icerik icin gorsel olustur:\n\n${contentText}`;

      const response = await fetch("/api/admin/social-media/generate-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message: visualPrompt,
          contentId,
          modelId: visualCurrentModel?.id || visualCurrentModel?.apiId,
          temperature: visualTemperature,
          maxTokens: visualMaxTokens,
          // Direct content for Content Studio mode
          directContent: currentContent.content,
          directPlatform: selectedPlatform,
          directContentType: selectedContentType,
          directTitle: selectedTitle?.title || manualTitle || "",
          settings: {
            visualStyle: style || settings?.visualStyle || "realistic",
            textOverlay: settings?.textOverlay || "minimal",
            colorScheme: settings?.colorScheme || "brand",
            mood: settings?.mood || "professional",
            platform: selectedPlatform,
            contentType: selectedContentType,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.generatedImageUrls?.length > 0) {
        // Convert URLs to image objects for consistency
        const newImages = data.generatedImageUrls.map((url) => ({ url }));
        // Append to existing images instead of replacing
        setAiGeneratedImages((prev) => [...prev, ...newImages]);
        toast.success(`${data.generatedImageUrls.length} gorsel olusturuldu`);
      } else if (data.success && data.images?.length > 0) {
        // Legacy format support
        setAiGeneratedImages((prev) => [...prev, ...data.images]);
        toast.success(`${data.images.length} gorsel olusturuldu`);
      } else {
        toast.error(
          data.error ||
            "Gorsel olusturulamadi - API yanit verdi ama gorsel yok",
        );
        return;
      }
    } catch (error) {
      console.error("Visual generation error:", error);
      toast.error(error.message || "Gorsel olusturma basarisiz");
    } finally {
      setVisualGenerating(false);
    }
  };

  // Select generated image
  const handleSelectGeneratedImage = (imageUrl) => {
    setImagePreview(imageUrl);
    setSelectedImage({ url: imageUrl, type: "image/png" });

    // Update current content with new image
    if (currentContent) {
      const updated = [...generatedContents];
      updated[currentPreview] = {
        ...updated[currentPreview],
        image: { url: imageUrl, type: "image/png" },
      };
      setGeneratedContents(updated);
    }
    toast.success("Gorsel secildi");
  };

  // Remove generated image
  const handleRemoveGeneratedImage = (index) => {
    const updated = aiGeneratedImages.filter((_, i) => i !== index);
    setAiGeneratedImages(updated);

    // If removed image was selected, clear selection
    if (aiGeneratedImages[index]?.url === imagePreview) {
      setImagePreview(null);
      setSelectedImage(null);
    }
    toast.success("Gorsel kaldirildi");
  };

  return (
    <PermissionGuard requiredPermission="social_media.create">
      <div className="h-full flex flex-col bg-slate-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Icerik Studyosu
                </h1>
                <p className="text-sm text-slate-500">
                  AI destekli sosyal medya icerigi olusturun
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {editingContentId && (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  Duzenleme Modu
                </Badge>
              )}
              {hasUnsavedChanges && hasGeneratedContent && (
                <Button
                  onClick={handleSave}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingContentId ? "Guncelle" : "Kaydet"}
                </Button>
              )}
              {hasGeneratedContent && (
                <Button
                  variant="outline"
                  onClick={() => setShowVariantDialog(true)}
                  className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Farkli Olustur
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleNavigation("/admin/social-media/content-list")}
                className="rounded-xl"
              >
                <Library className="w-4 h-4 mr-2" />
                Arsiv
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Content Creation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-5">
              {/* Step 1: Title Selection */}
              <div
                className={cn(
                  "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm",
                  hasGeneratedContent && "opacity-60",
                )}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-600">
                    1
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Baslik
                  </h2>
                  {hasGeneratedContent && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Kilitli
                    </Badge>
                  )}
                </div>

                {/* Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() =>
                      !hasGeneratedContent && setUseManualTitle(false)
                    }
                    disabled={hasGeneratedContent}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                      !useManualTitle
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      hasGeneratedContent && "cursor-not-allowed",
                    )}
                  >
                    <Library className="w-4 h-4 inline mr-2" />
                    Kutuphaneden Sec
                  </button>
                  <button
                    onClick={() =>
                      !hasGeneratedContent && setUseManualTitle(true)
                    }
                    disabled={hasGeneratedContent}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                      useManualTitle
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      hasGeneratedContent && "cursor-not-allowed",
                    )}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Manuel Yaz
                  </button>
                </div>

                {useManualTitle ? (
                  <Textarea
                    placeholder="Iceriginiz icin bir baslik yazin..."
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    disabled={hasGeneratedContent}
                    className="min-h-[80px] rounded-xl resize-none"
                  />
                ) : (
                  <>
                    <button
                      onClick={() =>
                        !hasGeneratedContent && setDialogOpen(true)
                      }
                      disabled={hasGeneratedContent}
                      className={cn(
                        "w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border-2 border-dashed border-slate-200",
                        hasGeneratedContent &&
                          "cursor-not-allowed hover:bg-slate-50",
                      )}
                    >
                      {selectedTitle ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-slate-900 line-clamp-1">
                              {selectedTitle.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {selectedDataset?.name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                            <Search className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-slate-600">
                              Baslik Sec
                            </p>
                            <p className="text-xs text-slate-400">
                              Dataset ve baslik seciniz
                            </p>
                          </div>
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>

                    <TitleSelectionDialog
                      open={dialogOpen}
                      onOpenChange={setDialogOpen}
                      datasets={datasets}
                      selectedDataset={selectedDataset}
                      datasetTitles={datasetTitles}
                      selectedTitle={selectedTitle}
                      onDatasetSelect={loadDatasetTitles}
                      onTitleSelect={setSelectedTitle}
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      titleSearchTerm={titleSearchTerm}
                      onTitleSearchChange={setTitleSearchTerm}
                      loadingTitles={loadingTitles}
                    />
                  </>
                )}
              </div>

              {/* Step 2: Platform & Content Type */}
              <div
                className={cn(
                  "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm",
                  hasGeneratedContent && "opacity-60",
                )}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-600">
                    2
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Platform ve Icerik Tipi
                  </h2>
                  {hasGeneratedContent && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Kilitli
                    </Badge>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 mb-3 block">
                      Platform
                    </Label>
                    <PlatformSelector
                      selected={selectedPlatform}
                      onSelect={(p) => {
                        selectPlatform(p);
                        // Reset content type if not available
                        if (
                          !PLATFORM_CONFIG[p]?.contentTypes.includes(
                            selectedContentType,
                          )
                        ) {
                          selectContentType(
                            PLATFORM_CONFIG[p]?.contentTypes[0] || "post",
                          );
                        }
                      }}
                      disabled={generating || hasGeneratedContent}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600 mb-3 block">
                      Icerik Tipi
                    </Label>
                    <ContentTypeSelector
                      platform={selectedPlatform}
                      selected={selectedContentType}
                      onSelect={selectContentType}
                      disabled={generating || hasGeneratedContent}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Media (Optional) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-600">
                    3
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Gorsel/Video
                  </h2>
                  <Badge variant="secondary" className="text-[10px]">
                    Opsiyonel
                  </Badge>
                </div>

                <MediaSelector
                  selectedImage={selectedImage}
                  imagePreview={imagePreview}
                  selectedVideo={selectedVideo}
                  videoPreview={videoPreview}
                  selectedImages={selectedImages}
                  imagePreviews={imagePreviews}
                  currentContent={currentContent}
                  onImageSelect={(file, preview) => {
                    setSelectedImage(file);
                    setImagePreview(preview);

                    // Update current content with selected image
                    if (currentContent) {
                      const updated = [...generatedContents];
                      updated[currentPreview] = {
                        ...updated[currentPreview],
                        image: { url: preview, type: file.type || "image/png" },
                      };
                      setGeneratedContents(updated);
                    }
                  }}
                  onVideoSelect={(file, preview) => {
                    setSelectedVideo(file);
                    setVideoPreview(preview);

                    // Update current content with selected video
                    if (currentContent) {
                      const updated = [...generatedContents];
                      updated[currentPreview] = {
                        ...updated[currentPreview],
                        image: { url: preview, type: file.type || "video/mp4" },
                      };
                      setGeneratedContents(updated);
                    }
                  }}
                  onImagesSelect={(files, previews) => {
                    setSelectedImages((prev) => [...prev, files]);
                    setImagePreviews((prev) => [...prev, previews]);

                    // Update current content with carousel images
                    if (currentContent) {
                      const updated = [...generatedContents];
                      updated[currentPreview] = {
                        ...updated[currentPreview],
                        image: {
                          type: "carousel",
                          images: imagePreviews
                            .concat(previews)
                            .map((url) => ({ url })),
                        },
                      };
                      setGeneratedContents(updated);
                    }
                  }}
                  onUpdatePreviews={(newPreviews) => {
                    setImagePreviews(newPreviews);
                    // Also update selectedImages to sync with uploadMedia
                    setSelectedImages(newPreviews.map(url => ({ url, preview: url })));
                    
                    // Update current content with new order
                    if (currentContent) {
                      const updated = [...generatedContents];
                      updated[currentPreview] = {
                        ...updated[currentPreview],
                        image: {
                          type: "carousel",
                          images: newPreviews.map((url) => ({ url })),
                        },
                      };
                      setGeneratedContents(updated);
                    }
                  }}
                  onClear={clearMedia}
                  contentType={selectedContentType}
                />
              </div>

              {/* Step 4: Customization */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-600">
                    4
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Metin Icerik - AI Ayarlari
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Metin icerik uretimi icin AI modeli ve parametreleri
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {currentModel?.displayName ||
                          currentModel?.name ||
                          "Model secilmedi"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Temperature: {temperature.toFixed(2)} • Max Tokens:{" "}
                        {maxTokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAISettings(true)}
                    className="rounded-lg"
                  >
                    <Settings className="w-4 h-4 mr-1.5" />
                    Metin Ayarlari
                  </Button>
                </div>

                <CustomizationPanel
                  customization={customization}
                  setCustomization={setCustomization}
                  showCustomization={showCustomization}
                  setShowCustomization={setShowCustomization}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={onGenerate}
                disabled={
                  generating || !aiIsReady || (!selectedTitle && !manualTitle)
                }
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg font-semibold shadow-lg shadow-violet-500/25"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Icerik Olusturuluyor...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Icerik Olustur
                  </>
                )}
              </Button>

              {/* Generated Content Edit Area */}
              {currentContent && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Olusan Icerik
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy(getPreviewText(currentContent))
                        }
                        className="rounded-lg"
                      >
                        <Copy className="w-4 h-4 mr-1.5" />
                        Kopyala
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Save className="w-4 h-4 mr-1.5" />
                        {editingContentId ? "Guncelle" : "Kaydet"}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Edit Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                        Hook
                      </Label>
                      <Textarea
                        value={editableHook}
                        onChange={(e) => {
                          const updated = [...generatedContents];
                          updated[currentPreview].content.hook = e.target.value;
                          setGeneratedContents(updated);
                        }}
                        placeholder="Hook metni..."
                        className="min-h-[60px] rounded-lg resize-none"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-600 mb-1.5 block">
                        Tam Metin
                      </Label>
                      <Textarea
                        value={editableText}
                        onChange={(e) => {
                          const updated = [...generatedContents];
                          updated[currentPreview].content.fullCaption =
                            e.target.value;
                          setGeneratedContents(updated);
                        }}
                        placeholder="Metin..."
                        className="min-h-[120px] rounded-lg resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Generation Section - Separate Card */}
              {currentContent && (
                <VisualGenerationSection
                  content={currentContent}
                  platform={selectedPlatform}
                  contentType={selectedContentType}
                  generating={visualGenerating}
                  generatedImages={aiGeneratedImages}
                  onGenerate={handleGenerateVisual}
                  onSelectImage={handleSelectGeneratedImage}
                  onRemoveImage={handleRemoveGeneratedImage}
                  selectedImageUrl={imagePreview}
                  onShowAISettings={() => setShowVisualAISettings(true)}
                  visualAiConfig={visualAiConfig}
                  visualCurrentModel={visualCurrentModel}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div
            className="border-l border-slate-200 bg-slate-100 flex flex-col flex-shrink-0"
            style={{ width: "770px" }}
          >
            <ContentPreviewPanel
              content={currentContent}
              platform={selectedPlatform}
              contentType={selectedContentType}
              onCopy={() => handleCopy(getPreviewText(currentContent))}
            />
          </div>
        </div>

        {/* AI Settings Dialog - Content Generation */}
        <AISettingsDialog
          open={showAISettings}
          onOpenChange={setShowAISettings}
          aiConfig={aiConfig}
          availableModels={availableModels}
          modelsByProvider={modelsByProvider}
          currentModel={currentModel}
          currentProvider={currentProvider}
          selectModel={selectModel}
          temperature={temperature}
          setTemperature={setTemperature}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          isThinkingModel={isThinkingModel}
          configLoading={configLoading}
          title="Metin Icerik - AI Ayarlari"
          subtitle="Metin icerik uretimi icin model ve parametre secimi"
          promptData={contentPrompt}
          sampleVariables={{
            platform: selectedPlatform,
            contentType: selectedContentType,
            topic: selectedTitle?.title || "",
            tone: customization?.tone || "professional",
            targetAudience: "",
            additionalNotes: customization?.additionalContext || "",
          }}
        />

        {/* AI Settings Dialog - Visual Generation */}
        <AISettingsDialog
          open={showVisualAISettings}
          onOpenChange={setShowVisualAISettings}
          aiConfig={visualAiConfig}
          availableModels={visualAvailableModels}
          modelsByProvider={visualModelsByProvider}
          currentModel={visualCurrentModel}
          currentProvider={visualCurrentProvider}
          selectModel={visualSelectModel}
          temperature={visualTemperature}
          setTemperature={setVisualTemperature}
          maxTokens={visualMaxTokens}
          setMaxTokens={setVisualMaxTokens}
          isThinkingModel={visualIsThinkingModel}
          configLoading={visualConfigLoading}
          title="Gorsel - AI Ayarlari"
          subtitle="Gorsel uretimi icin model ve parametre secimi"
          promptData={visualPrompt}
          sampleVariables={{
            platform: selectedPlatform,
            contentType: selectedContentType,
            content:
              currentContent?.content?.fullCaption ||
              currentContent?.content?.hook ||
              "",
            title: currentContent?.content?.title || selectedTitle?.title || "",
            visualStyle: "[Gorsel Stili - Dialog'da secilecek]",
            colorScheme: "[Renk Semasi - Dialog'da secilecek]",
            mood: "[Atmosfer - Dialog'da secilecek]",
            textOverlay: "[Yazi Miktari - Dialog'da secilecek]",
          }}
        />

        {/* Create Variant Dialog */}
        <CreateVariantDialog
          open={showVariantDialog}
          onOpenChange={setShowVariantDialog}
          sourceContent={currentContent}
          sourcePlatform={selectedPlatform}
          sourceContentType={selectedContentType}
          sourceImage={currentContent?.image}
          onCreateVariant={handleCreateVariant}
        />

        {/* Regenerate Confirmation Dialog */}
        <RegenerateConfirmDialog
          open={showRegenerateConfirm}
          onOpenChange={setShowRegenerateConfirm}
          onConfirm={handleConfirmedGenerate}
          contentCount={generatedContents.length}
        />
      </div>
    </PermissionGuard>
  );
}
