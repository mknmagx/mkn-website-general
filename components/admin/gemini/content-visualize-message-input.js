"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Send,
  Sparkles,
  X,
  ImageIcon,
  Loader2,
  Settings2,
  Palette,
} from "lucide-react";
import ContentLibraryDialog from "@/components/admin/content-library-dialog";
import {
  VISUAL_STYLES,
  TEXT_OVERLAY_OPTIONS,
  COLOR_SCHEMES,
  COMPOSITION_STYLES,
  MOOD_OPTIONS,
  IMAGE_SIZES,
  PRESET_COMBINATIONS,
  getDefaultSettings,
  getRecommendedPresets,
} from "@/config/visual-generation-settings";
import { GEMINI_IMAGE_MODEL } from "@/lib/ai-models";

// Fixed model for image generation - imported from centralized config
const IMAGE_MODEL = GEMINI_IMAGE_MODEL;

export default function ContentVisualizeMessageInput({
  onSendMessage,
  loading,
  selectedContentId,
  selectedContentTitle,
  onContentSelect,
  onContentClear,
  contentList = [],
}) {
  const [message, setMessage] = useState("");
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);

  // Visual generation settings
  const [settings, setSettings] = useState(() => {
    const selectedContent = contentList.find((c) => c.id === selectedContentId);
    return getDefaultSettings(
      selectedContent?.platform || "",
      selectedContent?.contentType || ""
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || !selectedContentId) return;

    // Find selected content details
    const selectedContent = contentList.find((c) => c.id === selectedContentId);
    const contentInfo = selectedContent
      ? {
          title: selectedContent.title || "",
          platform: selectedContent.platform || "",
          contentType: selectedContent.contentType || "",
        }
      : {};

    // Eğer mesaj varsa kullan, yoksa default mesaj kullan
    const userMessage =
      message.trim() ||
      "Bu içerik için profesyonel ve dikkat çekici bir görsel oluştur.";

    // Add content info to message for display
    const displayMessage = `${userMessage}\n\n📋 İçerik: ${contentInfo.title}\n📱 Platform: ${contentInfo.platform}\n📝 Tip: ${contentInfo.contentType}`;

    onSendMessage({
      content: userMessage, // Original message for API
      displayContent: displayMessage, // Enhanced message for UI
      model: IMAGE_MODEL,
      contentId: selectedContentId,
      settings: settings, // Include visual settings
    });

    setMessage("");
    textareaRef.current?.focus();
  };

  const applyPreset = (presetKey) => {
    const preset = PRESET_COMBINATIONS[presetKey];
    if (preset) {
      setSettings({ ...settings, ...preset.settings });
    }
  };

  // Get recommended presets based on selected content
  const selectedContent = contentList.find((c) => c.id === selectedContentId);
  const recommendedPresets = selectedContent
    ? getRecommendedPresets(selectedContent.platform || "")
    : [];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      {/* Selected Content Banner */}
      {selectedContentId && selectedContentTitle && (
        <div className="mx-4 mt-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="flex items-center gap-2.5 p-2.5">
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedContentTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onContentClear}
              className="h-7 w-7 p-0 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State - Minimalist */}
      {!selectedContentId && (
        <div className="py-8 text-center px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-gray-100 dark:bg-gray-800">
            <Sparkles className="w-6 h-6 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Görsel oluşturmak için içerik seçin
          </p>
          <Button
            onClick={() => setShowContentDialog(true)}
            size="sm"
            className="gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 h-8 px-3 text-xs"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            İçerik Kütüphanesi
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        {/* Message Input Container */}
        {selectedContentId && (
          <div className="space-y-2.5">
            {/* Settings Button & Quick Presets */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="gap-1.5 text-xs h-7 px-2.5"
              >
                <Settings2 className="w-3 h-3" />
                Ayarlar
              </Button>

              {/* Quick Presets */}
              {recommendedPresets.length > 0 && (
                <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    Hızlı:
                  </span>
                  {recommendedPresets.slice(0, 3).map((preset) => (
                    <Button
                      key={preset.key}
                      variant="ghost"
                      size="sm"
                      onClick={() => applyPreset(preset.key)}
                      className="text-[10px] h-6 px-2 whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Settings Summary - Compact */}
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
                {
                  VISUAL_STYLES[
                    settings.visualStyle.toUpperCase().replace(/-/g, "_")
                  ]?.icon
                }{" "}
                {settings.visualStyle}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                {
                  TEXT_OVERLAY_OPTIONS[
                    settings.textOverlay.toUpperCase().replace(/-/g, "_")
                  ]?.icon
                }{" "}
                {settings.textOverlay}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                {settings.imageSize}
              </span>
            </div>

            {/* Textarea with Send Button - WhatsApp Style */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Özel talimat yazın veya boş bırakarak otomatik oluşturun..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={2}
                className="resize-none pr-12 rounded-2xl text-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <div className="absolute bottom-1.5 right-1.5">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  size="icon"
                  className="h-8 w-8 rounded-full bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 text-white disabled:opacity-50 transition-all shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Info Footer - Minimal */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Detaylar otomatik eklenir</span>
              </div>
              <span>Gemini 3 Pro Image</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Library Dialog */}
      <ContentLibraryDialog
        open={showContentDialog}
        onOpenChange={setShowContentDialog}
        contents={contentList}
        onSelectContent={(contentId) => {
          onContentSelect(contentId);
          setShowContentDialog(false);
        }}
      />

      {/* Visual Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span>Görsel Üretim Ayarları</span>
            </DialogTitle>
            <DialogDescription>
              Platformunuza özel profesyonel görseller için ayarları
              özelleştirin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Preset Selection */}
            {recommendedPresets.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Hızlı Şablonlar
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {recommendedPresets.map((preset) => (
                    <button
                      key={preset.key}
                      onClick={() => applyPreset(preset.key)}
                      className="group relative text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {preset.name}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-gray-950 px-3 text-gray-500 dark:text-gray-400">
                  Özel Ayarlar
                </span>
              </div>
            </div>

            {/* Primary Settings - Full Width */}
            <div className="space-y-4">
              {/* Visual Style */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-lg">🎨</span>
                  Görsel Stili
                </label>
                <select
                  value={settings.visualStyle}
                  onChange={(e) =>
                    setSettings({ ...settings, visualStyle: e.target.value })
                  }
                  className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                >
                  {Object.values(VISUAL_STYLES).map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.icon} {style.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {
                    VISUAL_STYLES[
                      settings.visualStyle.toUpperCase().replace(/-/g, "_")
                    ]?.description
                  }
                </p>
              </div>

              {/* Text Overlay */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  Yazı Miktarı
                </label>
                <select
                  value={settings.textOverlay}
                  onChange={(e) =>
                    setSettings({ ...settings, textOverlay: e.target.value })
                  }
                  className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                >
                  {Object.values(TEXT_OVERLAY_OPTIONS).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {
                    TEXT_OVERLAY_OPTIONS[
                      settings.textOverlay.toUpperCase().replace(/-/g, "_")
                    ]?.description
                  }
                </p>
              </div>
            </div>

            {/* Secondary Settings - Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Color Scheme */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>🎨</span>
                  Renk Paleti
                </label>
                <select
                  value={settings.colorScheme}
                  onChange={(e) =>
                    setSettings({ ...settings, colorScheme: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                >
                  {Object.values(COLOR_SCHEMES).map((scheme) => (
                    <option key={scheme.value} value={scheme.value}>
                      {scheme.icon} {scheme.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Composition */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>📐</span>
                  Kompozisyon
                </label>
                <select
                  value={settings.composition}
                  onChange={(e) =>
                    setSettings({ ...settings, composition: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                >
                  {Object.values(COMPOSITION_STYLES).map((comp) => (
                    <option key={comp.value} value={comp.value}>
                      {comp.icon} {comp.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mood */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>🌟</span>
                  Atmosfer
                </label>
                <select
                  value={settings.mood}
                  onChange={(e) =>
                    setSettings({ ...settings, mood: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                >
                  {Object.values(MOOD_OPTIONS).map((moodOpt) => (
                    <option key={moodOpt.value} value={moodOpt.value}>
                      {moodOpt.icon} {moodOpt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Size */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>📏</span>
                  Kalite
                </label>
                <select
                  value={settings.imageSize}
                  onChange={(e) =>
                    setSettings({ ...settings, imageSize: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                >
                  {Object.values(IMAGE_SIZES).map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 p-4">
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Aktif Ayarlar
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium shadow-sm">
                  {
                    VISUAL_STYLES[
                      settings.visualStyle.toUpperCase().replace(/-/g, "_")
                    ]?.icon
                  }
                  {settings.visualStyle}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium shadow-sm">
                  {
                    TEXT_OVERLAY_OPTIONS[
                      settings.textOverlay.toUpperCase().replace(/-/g, "_")
                    ]?.icon
                  }
                  {settings.textOverlay}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 font-medium shadow-sm">
                  {COLOR_SCHEMES[settings.colorScheme.toUpperCase()]?.icon}
                  {settings.colorScheme}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-medium shadow-sm">
                  {MOOD_OPTIONS[settings.mood.toUpperCase()]?.icon}
                  {settings.mood}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium shadow-sm">
                  📏 {settings.imageSize}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  const defaults = getDefaultSettings(
                    selectedContent?.platform || "",
                    selectedContent?.contentType || ""
                  );
                  setSettings(defaults);
                }}
                className="border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Varsayılana Dön
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ayarları Uygula
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
