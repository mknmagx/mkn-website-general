"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Settings2,
  Palette,
  ImageIcon,
  Loader2,
  Download,
  ExternalLink,
  Trash2,
  Check,
  RefreshCw,
  BookOpen,
  Eye,
  Info,
  X,
  Zap,
  Brain,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Görsel üretim için token tahmini
const VISUAL_GENERATION_BASE_TOKENS = 2048;
const VISUAL_GENERATION_BUFFER = 1.5;
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
import { useUnifiedAI, AI_CONTEXTS } from "@/hooks/use-unified-ai";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function VisualGenerationTab({
  content,
  platform,
  contentType,
  onGenerateImage,
  loading,
  generatedImages = [],
  onDeleteImage,
  onSetAsMainImage,
}) {
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [showAIConfigPanel, setShowAIConfigPanel] = useState(false);
  const textareaRef = useRef(null);

  // Unified AI hook for visual generation
  const {
    config: aiConfig,
    availableModels,
    modelsByProvider,
    selectedModel,
    currentProvider,
    prompt: firestorePrompt,
    selectModel,
    refresh: refreshAIConfig,
    getProviderIcon,
    configLoading,
    isReady: aiIsReady,
    hasModels,
  } = useUnifiedAI(AI_CONTEXTS.CONTENT_VISUAL_GENERATION);

  // AI Configuration states
  const [temperature, setTemperature] = useState(1.0);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [autoMaxTokens, setAutoMaxTokens] = useState(true);
  const [imageQuality, setImageQuality] = useState("2K");

  // Visual generation settings
  const [settings, setSettings] = useState(() =>
    getDefaultSettings(platform || "", contentType || "")
  );

  // Sync settings from config
  useEffect(() => {
    if (aiConfig?.settings?.temperature) {
      setTemperature(aiConfig.settings.temperature);
    }
    if (aiConfig?.settings?.imageSize) {
      setImageQuality(aiConfig.settings.imageSize);
    }
    if (aiConfig?.settings?.maxTokens) {
      setMaxTokens(aiConfig.settings.maxTokens);
    }
  }, [aiConfig]);

  // Auto calculate max tokens
  useEffect(() => {
    if (autoMaxTokens) {
      const calculatedTokens = Math.round(VISUAL_GENERATION_BASE_TOKENS * VISUAL_GENERATION_BUFFER);
      setMaxTokens(calculatedTokens);
    }
  }, [autoMaxTokens]);

  // Get current model display name
  const currentModelDisplay = useMemo(() => {
    if (!selectedModel) return "Yükleniyor...";
    return selectedModel.displayName || selectedModel.name || selectedModel.id;
  }, [selectedModel]);

  // Get prompt content for preview
  const getPromptPreviewContent = useMemo(() => {
    if (!firestorePrompt) return null;
    
    // Extract the actual prompt content
    let promptContent = "";
    if (typeof firestorePrompt === "string") {
      promptContent = firestorePrompt;
    } else if (firestorePrompt.systemPrompt) {
      promptContent = firestorePrompt.systemPrompt;
    } else if (firestorePrompt.content) {
      promptContent = firestorePrompt.content;
    } else {
      promptContent = JSON.stringify(firestorePrompt, null, 2);
    }
    
    return {
      content: promptContent,
      version: firestorePrompt.version,
      updatedAt: firestorePrompt.updatedAt,
      name: firestorePrompt.name || aiConfig?.promptKey,
    };
  }, [firestorePrompt, aiConfig]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    // Use custom message or default
    const userMessage =
      message.trim() ||
      "Bu içerik için profesyonel ve dikkat çekici bir görsel oluştur.";

    onGenerateImage({
      message: userMessage,
      settings: {
        ...settings,
        temperature,
        maxTokens,
        imageQuality,
      },
      modelId: selectedModel?.modelId || selectedModel?.id,
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

  // Get recommended presets
  const recommendedPresets = getRecommendedPresets(platform || "");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Görsel Üretimi
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {currentModelDisplay} ile bu içerik için profesyonel görseller oluşturun
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromptPreview(!showPromptPreview)}
            className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            Prompt
          </button>
          <button
            onClick={refreshAIConfig}
            disabled={configLoading}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${configLoading ? "animate-spin" : ""}`} />
          </button>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            {currentProvider?.icon} {currentModelDisplay}
          </Badge>
        </div>
      </div>

      {/* AI Model Selection */}
      {aiIsReady && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Model Seçimi
            </span>
            <button
              onClick={() => setShowAIConfigPanel(!showAIConfigPanel)}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              {showAIConfigPanel ? "Basit Görünüm" : "Detaylı Ayarlar"}
            </button>
          </div>

          {/* Model Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
              <div className="text-gray-500">Model</div>
              <div className="font-semibold text-gray-900 truncate">
                {currentModelDisplay}
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
              <div className="text-gray-500">Provider</div>
              <div className="font-semibold text-gray-900">
                {currentProvider?.icon} {currentProvider?.name || "Gemini"}
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
              <div className="text-gray-500">Temperature</div>
              <div className="font-semibold text-gray-900">
                {temperature.toFixed(2)}
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
              <div className="text-gray-500">Max Tokens</div>
              <div className="font-semibold text-gray-900">
                {maxTokens.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
              <div className="text-gray-500">Kalite</div>
              <div className="font-semibold text-gray-900">
                {imageQuality}
              </div>
            </div>
          </div>

          {/* Model Selection */}
          {hasModels && availableModels?.length > 0 && (
            <div className="space-y-3">
              {Object.entries(modelsByProvider || {}).map(([provider, models]) => (
                <div key={provider} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    <span>{getProviderIcon(provider)}</span>
                    <span className="capitalize">{provider}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {models.map((model) => (
                      <button
                        key={model.id || model.modelId}
                        onClick={() => selectModel(model.id || model.modelId)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                          (selectedModel?.id || selectedModel?.modelId) === (model.id || model.modelId)
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                        }`}
                      >
                        {model.displayName || model.name || model.id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Config Panel */}
          {showAIConfigPanel && (
            <div className="space-y-4 pt-3 border-t border-purple-200">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    Temperature (Yaratıcılık)
                  </Label>
                  <span className="text-xs font-mono text-purple-600">
                    {temperature.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[temperature * 100]}
                  onValueChange={(value) => setTemperature(value[0] / 100)}
                  max={200}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Tutarlı (0.5)</span>
                  <span>Yaratıcı (1.0)</span>
                  <span>Deneysel (2.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    Max Tokens
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">Otomatik</span>
                    <Switch
                      checked={autoMaxTokens}
                      onCheckedChange={setAutoMaxTokens}
                    />
                  </div>
                </div>

                {autoMaxTokens ? (
                  <div className="text-xs text-purple-700 bg-purple-100/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-3 w-3" />
                      <span>
                        Görsel üretim: {VISUAL_GENERATION_BASE_TOKENS} base × {VISUAL_GENERATION_BUFFER} = <strong>{maxTokens.toLocaleString()}</strong> token
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Slider
                      value={[maxTokens]}
                      onValueChange={(value) => setMaxTokens(value[0])}
                      max={8192}
                      min={1000}
                      step={256}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>1000</span>
                      <span className="font-medium text-purple-600">
                        {maxTokens.toLocaleString()} token
                      </span>
                      <span>8192</span>
                    </div>
                  </>
                )}
              </div>

              {/* Firestore Config Info */}
              {aiConfig && (
                <div className="pt-3 border-t border-purple-100">
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">
                    Firestore Konfigürasyonu
                  </Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="text-gray-500">Context:</span>
                      <span className="font-mono text-gray-700">
                        {aiConfig.contextId || aiConfig.context}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="text-gray-500">Default Model:</span>
                      <span className="font-mono text-gray-700">
                        {aiConfig.defaultModelId}
                      </span>
                    </div>
                    {aiConfig.promptKey && (
                      <div className="flex justify-between p-2 bg-white rounded border col-span-2">
                        <span className="text-gray-500">Prompt Key:</span>
                        <span className="font-mono text-gray-700">
                          {aiConfig.promptKey}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State for AI Config */}
      {configLoading && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI konfigürasyonu yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Prompt Preview */}
      {showPromptPreview && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Görsel Üretim Prompt'u
              {getPromptPreviewContent?.name && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                  {getPromptPreviewContent.name}
                </Badge>
              )}
            </span>
            <button
              onClick={() => setShowPromptPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {getPromptPreviewContent ? (
            <>
              <div className="p-3 bg-white rounded-lg border border-purple-100 max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {getPromptPreviewContent.content}
                </pre>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-purple-600">
                  {getPromptPreviewContent.version && (
                    <Badge variant="secondary" className="bg-purple-100">
                      v{getPromptPreviewContent.version}
                    </Badge>
                  )}
                  {getPromptPreviewContent.updatedAt && (
                    <span className="text-gray-500">
                      Güncellendi: {new Date(
                        getPromptPreviewContent.updatedAt?.seconds * 1000 || getPromptPreviewContent.updatedAt
                      ).toLocaleDateString("tr-TR")}
                    </span>
                  )}
                </div>
                <span className="text-gray-400">
                  {getPromptPreviewContent.content?.length || 0} karakter
                </span>
              </div>
            </>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 text-sm">
                <Info className="h-4 w-4" />
                <span>Prompt yüklenmedi veya yapılandırılmamış.</span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                Firestore'da <code className="bg-yellow-100 px-1 rounded">{aiConfig?.promptKey || "content_visual_generation"}</code> key'i ile prompt ekleyin.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              Oluşturulan Görseller ({generatedImages.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {generatedImages.map((image, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-all shadow-sm hover:shadow-lg"
              >
                <img
                  src={image.url}
                  alt={`Generated ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200">
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white hover:bg-gray-100 text-gray-900 shadow-md h-8 w-8 p-0"
                      onClick={() => window.open(image.url, "_blank")}
                      title="Yeni sekmede aç"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white hover:bg-gray-100 text-gray-900 shadow-md h-8 w-8 p-0"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = image.url;
                        a.download = `mkn-visual-${idx + 1}.png`;
                        a.click();
                      }}
                      title="İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    {onSetAsMainImage && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-green-500 hover:bg-green-600 text-white shadow-md h-8 w-8 p-0"
                        onClick={() => onSetAsMainImage(image, idx)}
                        title="Ana görsel yap"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onDeleteImage && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600 text-white shadow-md h-8 w-8 p-0"
                        onClick={() => onDeleteImage(idx)}
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                {image.createdAt && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge className="bg-black/70 text-white text-xs">
                      {(() => {
                        try {
                          let date;
                          
                          // Handle Firestore Timestamp with seconds property
                          if (image.createdAt?.seconds) {
                            date = new Date(image.createdAt.seconds * 1000);
                          }
                          // Handle Firestore Timestamp with toDate method
                          else if (image.createdAt?.toDate) {
                            date = image.createdAt.toDate();
                          }
                          // Handle ISO string
                          else if (typeof image.createdAt === 'string') {
                            date = new Date(image.createdAt);
                          }
                          // Handle Date object
                          else if (image.createdAt instanceof Date) {
                            date = image.createdAt;
                          }
                          else {
                            return "Tarih yok";
                          }
                          
                          // Check if date is valid
                          if (isNaN(date.getTime())) {
                            return "Geçersiz tarih";
                          }
                          
                          return date.toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          });
                        } catch (e) {
                          return "Tarih yok";
                        }
                      })()}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generation Form */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
        {/* Settings & Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="gap-1.5 text-xs h-8 px-3"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Görsel Ayarları
          </Button>

          {/* Quick Presets */}
          {recommendedPresets.length > 0 && (
            <>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-xs text-gray-500">Hızlı:</span>
              {recommendedPresets.slice(0, 3).map((preset) => (
                <Button
                  key={preset.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => applyPreset(preset.key)}
                  className="text-xs h-7 px-2.5 hover:bg-purple-50"
                >
                  {preset.name}
                </Button>
              ))}
            </>
          )}
        </div>

        {/* Current Settings Summary */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] px-2 py-1 rounded-md bg-purple-50 text-purple-600 border border-purple-100 font-medium">
            {VISUAL_STYLES[settings.visualStyle.toUpperCase().replace(/-/g, "_")]?.icon}{" "}
            {settings.visualStyle}
          </span>
          <span className="text-[10px] px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-medium">
            {TEXT_OVERLAY_OPTIONS[settings.textOverlay.toUpperCase().replace(/-/g, "_")]?.icon}{" "}
            {settings.textOverlay}
          </span>
          <span className="text-[10px] px-2 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200 font-medium">
            📏 {settings.imageSize}
          </span>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Görsel Talimatı (İsteğe Bağlı)
          </label>
          <Textarea
            ref={textareaRef}
            placeholder="Özel bir talimat yazın veya boş bırakarak otomatik oluşturun..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={3}
            className="resize-none rounded-xl border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-500">
            💡 İpucu: Boş bırakırsanız, içeriğiniz analiz edilerek otomatik olarak
            profesyonel bir görsel oluşturulur
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Görsel Oluşturuluyor...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Görsel Oluştur
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-purple-900 mb-1">
              Otomatik Optimizasyon
            </h4>
            <p className="text-xs text-purple-700 leading-relaxed">
              AI, içeriğinizin başlığını, mesajını, platformunu ve hedef kitlesini
              analiz ederek markanıza uygun, profesyonel ve etkileşim odaklı
              görseller oluşturur. Tüm görseller otomatik olarak Firebase Storage'a
              yüklenir ve içeriğinize bağlanır.
            </p>
          </div>
        </div>
      </div>

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
              Platformunuza özel profesyonel görseller için ayarları özelleştirin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Preset Selection */}
            {recommendedPresets.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <label className="text-sm font-semibold text-gray-900">
                    Hızlı Şablonlar
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {recommendedPresets.map((preset) => (
                    <button
                      key={preset.key}
                      onClick={() => applyPreset(preset.key)}
                      className="group relative text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 bg-white hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                          {preset.name}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-500">Özel Ayarlar</span>
              </div>
            </div>

            {/* Primary Settings */}
            <div className="space-y-4">
              {/* Visual Style */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg">🎨</span>
                  Görsel Stili
                </label>
                <select
                  value={settings.visualStyle}
                  onChange={(e) =>
                    setSettings({ ...settings, visualStyle: e.target.value })
                  }
                  className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                >
                  {Object.values(VISUAL_STYLES).map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.icon} {style.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {VISUAL_STYLES[settings.visualStyle.toUpperCase().replace(/-/g, "_")]?.description}
                </p>
              </div>

              {/* Text Overlay */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  Yazı Miktarı
                </label>
                <select
                  value={settings.textOverlay}
                  onChange={(e) =>
                    setSettings({ ...settings, textOverlay: e.target.value })
                  }
                  className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                >
                  {Object.values(TEXT_OVERLAY_OPTIONS).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {TEXT_OVERLAY_OPTIONS[settings.textOverlay.toUpperCase().replace(/-/g, "_")]?.description}
                </p>
              </div>
            </div>

            {/* Secondary Settings */}
            <div className="grid grid-cols-2 gap-4">
              {/* Color Scheme */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <span>🎨</span>
                  Renk Paleti
                </label>
                <select
                  value={settings.colorScheme}
                  onChange={(e) =>
                    setSettings({ ...settings, colorScheme: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
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
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <span>📐</span>
                  Kompozisyon
                </label>
                <select
                  value={settings.composition}
                  onChange={(e) =>
                    setSettings({ ...settings, composition: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
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
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <span>🌟</span>
                  Atmosfer
                </label>
                <select
                  value={settings.mood}
                  onChange={(e) =>
                    setSettings({ ...settings, mood: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
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
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <span>📏</span>
                  Kalite
                </label>
                <select
                  value={settings.imageSize}
                  onChange={(e) =>
                    setSettings({ ...settings, imageSize: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
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
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-4">
              <p className="text-xs font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Aktif Ayarlar
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white text-purple-700 border border-purple-200 font-medium shadow-sm">
                  {VISUAL_STYLES[settings.visualStyle.toUpperCase().replace(/-/g, "_")]?.icon}
                  {settings.visualStyle}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white text-blue-700 border border-blue-200 font-medium shadow-sm">
                  {TEXT_OVERLAY_OPTIONS[settings.textOverlay.toUpperCase().replace(/-/g, "_")]?.icon}
                  {settings.textOverlay}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white text-green-700 border border-green-200 font-medium shadow-sm">
                  {COLOR_SCHEMES[settings.colorScheme.toUpperCase()]?.icon}
                  {settings.colorScheme}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white text-orange-700 border border-orange-200 font-medium shadow-sm">
                  {MOOD_OPTIONS[settings.mood.toUpperCase()]?.icon}
                  {settings.mood}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white text-gray-700 border border-gray-200 font-medium shadow-sm">
                  📏 {settings.imageSize}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  const defaults = getDefaultSettings(platform || "", contentType || "");
                  setSettings(defaults);
                }}
                className="border-2 hover:bg-gray-50"
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
