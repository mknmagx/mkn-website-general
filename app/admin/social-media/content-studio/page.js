"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Copy,
  RefreshCw,
  Eye,
  Download,
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
  Zap,
  Calendar,
  ExternalLink,
  Info,
  Settings,
  BookOpen,
  Brain,
  Cpu,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import MobilePreview from "@/components/admin/mobile-preview";
import ImageUploader from "@/components/admin/image-uploader";
import VisualGenerationTab from "@/components/admin/content-studio/visual-generation-tab";
import {
  InstagramPostRenderer,
  InstagramReelRenderer,
  InstagramCarouselRenderer,
} from "@/components/admin/content-studio";
import { PLATFORMS, CONTENT_TYPES } from "@/lib/constants/content-studio";
// Unified AI Hook - Firestore'dan dinamik config
import { useUnifiedAI, AI_CONTEXTS } from "@/hooks/use-unified-ai";
import { PROVIDER_INFO } from "@/lib/ai-constants";
import { useContentStudio } from "@/hooks/use-content-studio";
import { Textarea } from "@/components/ui/textarea";

export default function ContentStudioPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  // Unified AI Hook - Firestore'dan dinamik config
  const {
    config: aiConfig,
    availableModels,
    modelsByProvider,
    selectedModel: currentModel,
    currentProvider,
    generateContent: unifiedGenerateContent,
    selectModel,
    loading: aiLoading,
    configLoading,
    error: aiError,
    isReady: aiIsReady,
    hasModels,
    refresh: refreshAIConfig,
    getProviderIcon,
    prompt: firestorePrompt,
    // Platform bazlı prompt desteği
    platformPromptsInfo,
    hasPlatformPrompts,
    loadPromptForPlatform,
    platformPromptCache,
  } = useUnifiedAI(AI_CONTEXTS.CONTENT_STUDIO_GENERATION);

  // State for AI config display
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [previewPromptsByPlatformContent, setPreviewPromptsByPlatformContent] =
    useState({});
  const [loadingPreviewPrompts, setLoadingPreviewPrompts] = useState(false);
  const [showAIConfigPanel, setShowAIConfigPanel] = useState(false);
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [autoMaxTokens, setAutoMaxTokens] = useState(true);
  const [showFullPromptDialog, setShowFullPromptDialog] = useState(false);

  // Use custom hook for all state and logic
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
    activeTab,
    dialogOpen,
    categoryFilter,
    platformFilter,
    contentTypeFilter,
    selectedImage,
    imagePreview,
    selectedVideo,
    videoPreview,
    selectedImages,
    imagePreviews,
    customization,
    showCustomization,
    visualGenerating,
    aiGeneratedImages,
    setSelectedDataset,
    setSelectedTitle,
    setSelectedPlatform,
    setSelectedContentType,
    setAiModel,
    setGeneratedContents,
    setCurrentPreview,
    setSearchTerm,
    setTitleSearchTerm,
    setActiveTab,
    setCategoryFilter,
    setPlatformFilter,
    setContentTypeFilter,
    setSelectedImage,
    setImagePreview,
    setSelectedVideo,
    setVideoPreview,
    setSelectedImages,
    setImagePreviews,
    setCustomization,
    setShowCustomization,
    setDialogOpen,
    setVisualGenerating,
    setAiGeneratedImages,
    loadDatasetTitles,
    selectPlatform,
    selectContentType,
    handleGenerate,
    handleUpdate,
    handleSaveAsNew,
    handleCopy,
    handleExport,
    editingContentId,
  } = useContentStudio();

  // Platform+ContentType bazlı prompt key oluştur
  const getPlatformContentKey = useCallback((platform, contentType) => {
    if (!platform || !contentType) return null;
    return `${platform.toLowerCase()}_${contentType.toLowerCase()}`;
  }, []);

  // Platform değiştiğinde prompt'ları yükle
  useEffect(() => {
    const loadCurrentPrompt = async () => {
      if (!selectedPlatform || !selectedContentType || !hasPlatformPrompts)
        return;

      const platformContentKey = getPlatformContentKey(
        selectedPlatform,
        selectedContentType
      );
      if (!platformContentKey) return;

      // Cache'de yoksa yükle
      if (!platformPromptCache[platformContentKey]) {
        await loadPromptForPlatform(platformContentKey);
      }
    };

    loadCurrentPrompt();
  }, [
    selectedPlatform,
    selectedContentType,
    hasPlatformPrompts,
    loadPromptForPlatform,
    getPlatformContentKey,
    platformPromptCache,
  ]);

  // Prompt önizleme için tüm platform promptlarını yükle
  const loadAllPlatformPrompts = useCallback(async () => {
    if (!hasPlatformPrompts || !platformPromptsInfo) return;

    setLoadingPreviewPrompts(true);
    try {
      const promptsMap = {};
      for (const [key, promptKey] of Object.entries(platformPromptsInfo)) {
        if (!platformPromptCache[key]) {
          await loadPromptForPlatform(key);
        }
        promptsMap[key] = platformPromptCache[key] || null;
      }
      setPreviewPromptsByPlatformContent(promptsMap);
    } catch (error) {
      console.error("Error loading platform prompts:", error);
      toast.error("Promptlar yüklenirken hata oluştu");
    } finally {
      setLoadingPreviewPrompts(false);
    }
  }, [
    hasPlatformPrompts,
    platformPromptsInfo,
    platformPromptCache,
    loadPromptForPlatform,
  ]);

  // Prompt preview açıldığında yükle
  useEffect(() => {
    if (showPromptPreview && hasPlatformPrompts) {
      loadAllPlatformPrompts();
    }
  }, [showPromptPreview, hasPlatformPrompts, loadAllPlatformPrompts]);

  // Unified AI'dan model seçimi senkronize et
  useEffect(() => {
    if (currentModel && currentModel.id !== aiModel) {
      setAiModel(currentModel.id);
    }
  }, [currentModel, aiModel, setAiModel]);

  // Seçili modelin "thinking" model olup olmadığını kontrol et
  const isThinkingModel = useCallback(() => {
    const modelId = aiModel || currentModel?.modelId || currentModel?.id || "";
    const modelName = (
      currentModel?.name ||
      currentModel?.displayName ||
      ""
    ).toLowerCase();

    // Thinking/reasoning modelleri: gemini-3-pro, claude-opus, o1, o3 vb.
    const thinkingPatterns = [
      "gemini-3",
      "gemini_pro_3",
      "gemini-3-pro",
      "opus",
      "claude-opus",
      "claude_opus",
      "o1",
      "o3", // OpenAI reasoning modelleri
      "thinking",
      "reasoning",
      "deep",
    ];

    return thinkingPatterns.some(
      (pattern) =>
        modelId.toLowerCase().includes(pattern) || modelName.includes(pattern)
    );
  }, [aiModel, currentModel]);

  // İçerik tipine göre tahmini token miktarı
  const getEstimatedTokensForContentType = useCallback((contentType) => {
    const tokenEstimates = {
      post: 800, // Caption + hashtags + CTA
      reel: 1200, // Script + scenes + hooks
      story: 1500, // Multiple stories + interactive elements
      carousel: 2000, // Multiple slides content
      tweet: 400, // Short form
      thread: 1500, // Multiple tweets
      video: 1200, // Video script
    };
    return tokenEstimates[contentType?.toLowerCase()] || 1000;
  }, []);

  // User prompt template'indeki değişkenleri gerçek değerlerle değiştir
  const replacePromptVariables = useCallback(
    (template) => {
      if (!template) return template;

      const replacements = {
        title: selectedTitle?.title || "[Başlık seçilmedi]",
        platform: selectedPlatform || "[Platform seçilmedi]",
        contentType: selectedContentType || "[İçerik tipi seçilmedi]",
        categoryContext:
          customization?.focusAngle || "Genel kozmetik ve cilt bakımı",
        tone: customization?.tone || "profesyonel ve bilgilendirici",
        customCTA: customization?.customCTA || "",
        focusAngle: customization?.focusAngle || "",
        additionalContext: customization?.additionalContext || "",
        targetHashtags: Array.isArray(customization?.targetHashtags)
          ? customization.targetHashtags.join(", ")
          : customization?.targetHashtags || "",
        length: customization?.length || "medium",
        includeEmoji: customization?.includeEmoji !== false ? "Evet" : "Hayır",
      };

      let result = template;
      Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, "g"),
          value || `[${key}]`
        );
      });

      return result;
    },
    [selectedTitle, selectedPlatform, selectedContentType, customization]
  );

  // Otomatik maxTokens hesapla - model türüne ve içerik tipine göre
  const calculateAutoMaxTokens = useCallback(() => {
    const baseTokens = getEstimatedTokensForContentType(selectedContentType);

    // Thinking modelleri için ekstra token gerekli (düşünme için 2000-3000 token harcar)
    if (isThinkingModel()) {
      const thinkingOverhead = 2500;
      const total = baseTokens + thinkingOverhead;
      // Min 3000, max 8192
      return Math.min(8192, Math.max(3000, Math.round(total)));
    }

    // Normal modeller için güvenlik çarpanı
    const safetyMultiplier = 1.5;
    const total = baseTokens * safetyMultiplier;
    // Min 1500, max 6000
    return Math.min(6000, Math.max(1500, Math.round(total)));
  }, [selectedContentType, isThinkingModel, getEstimatedTokensForContentType]);

  // Auto token hesaplama efekti
  useEffect(() => {
    if (autoMaxTokens && selectedContentType) {
      setMaxTokens(calculateAutoMaxTokens());
    }
  }, [autoMaxTokens, selectedContentType, calculateAutoMaxTokens]);

  // Config'ten gelen ayarları yükle
  useEffect(() => {
    if (aiConfig?.settings) {
      if (aiConfig.settings.temperature) {
        setTemperature(aiConfig.settings.temperature);
      }
      if (aiConfig.settings.maxTokens && autoMaxTokens) {
        // Config'den gelen değer varsa bunu da dikkate al
        const configMaxTokens = aiConfig.settings.maxTokens;
        const calculatedMaxTokens = calculateAutoMaxTokens();
        setMaxTokens(Math.max(configMaxTokens, calculatedMaxTokens));
      }
    }
  }, [aiConfig, autoMaxTokens, calculateAutoMaxTokens]);

  // Update content helper function
  const updateContent = (field, value) => {
    const updated = [...generatedContents];
    updated[currentPreview].content[field] = value;
    setGeneratedContents(updated);
  };

  // Instagram Story Renderer
  const renderInstagramStory = (content) => (
    <div className="space-y-6">
      {content.seriesConcept && (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
          <p className="text-xs font-semibold text-pink-700 mb-2">
            Story Serisi Konsepti
          </p>
          <p className="text-sm text-gray-700">{content.seriesConcept}</p>
          {content.totalStories && (
            <p className="text-xs text-gray-500 mt-2">
              Toplam: {content.totalStories} story
            </p>
          )}
        </div>
      )}

      {content.stories &&
        content.stories.map((story, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-xl border-2 border-purple-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-purple-500 text-white">
                Story {story.storyNumber || idx + 1}
              </Badge>
              <Badge variant="outline">{story.type}</Badge>
            </div>

            {/* Visual */}
            {story.visual && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Görsel
                </p>
                <p className="text-sm text-gray-700">
                  {story.visual.background}
                </p>
                {story.visual.mainElement && (
                  <p className="text-xs text-gray-600 mt-1">
                    {story.visual.mainElement}
                  </p>
                )}
              </div>
            )}

            {/* Text */}
            {story.text && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Metin
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {story.text.mainText}
                </p>
                {story.text.placement && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pozisyon: {story.text.placement}
                  </p>
                )}
              </div>
            )}

            {/* Interactive Elements */}
            {story.interactiveElements &&
              story.interactiveElements.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700 mb-2">
                    Interactive Elements
                  </p>
                  {story.interactiveElements.map((element, eIdx) => (
                    <div key={eIdx} className="text-sm text-gray-700 mb-1">
                      <Badge variant="secondary" className="mr-2">
                        {element.type}
                      </Badge>
                      {element.content}
                    </div>
                  ))}
                </div>
              )}

            {story.cta && (
              <p className="text-xs text-purple-600 font-medium mt-3">
                → {story.cta}
              </p>
            )}
          </div>
        ))}
    </div>
  );

  // X Tweet Renderer
  const renderXTweet = (content) => (
    <div className="space-y-6">
      {content.tweetText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700">
              Tweet Metni
            </Label>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  content.characterCount <= 280 ? "default" : "destructive"
                }
              >
                {content.characterCount || content.tweetText.length}/280
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(content.tweetText)}
              >
                <Copy className="w-4 h-4 mr-1" />
                Kopyala
              </Button>
            </div>
          </div>
          <Textarea
            value={content.tweetText}
            onChange={(e) => updateContent("tweetText", e.target.value)}
            rows={5}
            className="border-gray-200 focus:border-gray-800 rounded-xl resize-none font-medium"
            maxLength={280}
          />
        </div>
      )}

      {/* Visual Suggestion */}
      {content.visualSuggestion && (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
          <p className="text-xs font-semibold text-pink-700 mb-3">
            Görsel Önerisi
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.visualSuggestion.imageType && (
              <p>
                <strong>Görsel Tipi:</strong>{" "}
                {content.visualSuggestion.imageType}
              </p>
            )}
            {content.visualSuggestion.imageDescription && (
              <p>
                <strong>Açıklama:</strong>{" "}
                {content.visualSuggestion.imageDescription}
              </p>
            )}
            {content.visualSuggestion.designNotes && (
              <p>
                <strong>Tasarım Notları:</strong>{" "}
                {content.visualSuggestion.designNotes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hashtags */}
      {content.hashtags && content.hashtags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Hashtags
          </Label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
            {content.hashtags.map((tag, idx) => (
              <Badge key={idx} className="bg-gray-800 text-white">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Hooks */}
      {content.engagementHooks && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 mb-3">
            Engagement Stratejisi
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.engagementHooks.quoteTweetBait && (
              <div>
                <p className="font-semibold">Quote Tweet Bait:</p>
                <p>{content.engagementHooks.quoteTweetBait}</p>
              </div>
            )}
            {content.engagementHooks.replyStarter && (
              <div>
                <p className="font-semibold">Reply Starter:</p>
                <p>{content.engagementHooks.replyStarter}</p>
              </div>
            )}
            {content.engagementHooks.bookmarkWorthiness && (
              <div>
                <p className="font-semibold">Bookmark Worthiness:</p>
                <p>{content.engagementHooks.bookmarkWorthiness}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timing */}
      {content.timing && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
          <p className="text-xs font-semibold text-orange-700 mb-3">
            Zamanlama
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.timing.bestTime && (
              <p>
                <strong>En İyi Zaman:</strong> {content.timing.bestTime}
              </p>
            )}
            {content.timing.trendRelevance && (
              <p>
                <strong>Trend İlişkisi:</strong> {content.timing.trendRelevance}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Expected Performance */}
      {content.expectedPerformance && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-xs font-semibold text-green-700 mb-3">
            Beklenen Performans
          </p>
          <div className="space-y-1 text-sm text-gray-700">
            {content.expectedPerformance.viralPotential && (
              <p>
                <strong>Viral Potansiyel:</strong>{" "}
                {content.expectedPerformance.viralPotential}
              </p>
            )}
            {content.expectedPerformance.expectedEngagement && (
              <p>
                <strong>Beklenen Etkileşim:</strong>{" "}
                {content.expectedPerformance.expectedEngagement}
              </p>
            )}
            {content.expectedPerformance.audienceResonance && (
              <p>
                <strong>Hedef Kitle Uyumu:</strong>{" "}
                {content.expectedPerformance.audienceResonance}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Thread Potential */}
      {content.threadPotential && content.threadPotential.canExpandToThread && (
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 mb-3">
            Thread Potansiyeli
          </p>
          <p className="text-sm text-gray-700 mb-2">
            {content.threadPotential.threadHookIdea}
          </p>
          {content.threadPotential.estimatedTweetCount && (
            <p className="text-xs text-gray-600">
              <strong>Tahmini Tweet Sayısı:</strong>{" "}
              {content.threadPotential.estimatedTweetCount}
            </p>
          )}
        </div>
      )}

      {/* Alternative Versions */}
      {content.alternativeVersions &&
        content.alternativeVersions.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-200">
            <p className="text-xs font-semibold text-cyan-700 mb-3">
              Alternatif Versiyonlar
            </p>
            <div className="space-y-2">
              {content.alternativeVersions.map((version, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-cyan-100"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-700 flex-1">{version}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        updateContent("tweetText", version);
                        toast.success("Tweet güncellendi");
                      }}
                      className="ml-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );

  // X Thread Renderer
  const renderXThread = (content) => (
    <div className="space-y-6">
      {content.threadConcept && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Thread Konsepti
          </p>
          <p className="text-sm text-gray-700">{content.threadConcept}</p>
          {content.threadLength && (
            <p className="text-xs text-gray-500 mt-2">
              {content.threadLength} tweet
            </p>
          )}
        </div>
      )}

      {content.tweets &&
        content.tweets.map((tweet, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-xl border-2 border-gray-300 shadow-sm hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-800 text-white">
                  {tweet.tweetNumber}/{content.tweets.length}
                </Badge>
                {tweet.position && (
                  <Badge variant="outline">{tweet.position}</Badge>
                )}
              </div>
              {tweet.standalonePotential && (
                <Badge variant="secondary" className="text-xs">
                  {tweet.standalonePotential.includes("High") ? "⭐ " : ""}
                  Standalone
                </Badge>
              )}
            </div>

            <Textarea
              value={tweet.text}
              onChange={(e) => {
                const updated = [...generatedContents];
                updated[currentPreview].content.tweets[idx].text =
                  e.target.value;
                setGeneratedContents(updated);
              }}
              rows={3}
              className="border-gray-200 focus:border-gray-800 rounded-lg resize-none mb-2"
            />

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{tweet.characterCount || tweet.text.length}/280</span>
              {tweet.visual?.hasVisual && (
                <Badge variant="secondary" className="text-xs">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Görsel var
                </Badge>
              )}
            </div>
          </div>
        ))}

      {content.visualStrategy && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 mb-3">
            Görsel Stratejisi
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.visualStrategy.totalVisuals && (
              <p>
                <strong>Toplam Görsel:</strong>{" "}
                {content.visualStrategy.totalVisuals}
              </p>
            )}
            {content.visualStrategy.visualPlacements &&
              content.visualStrategy.visualPlacements.length > 0 && (
                <p>
                  <strong>Görsel Yerleşimi:</strong> Tweet #
                  {content.visualStrategy.visualPlacements.join(", #")}
                </p>
              )}
            {content.visualStrategy.visualTypes &&
              content.visualStrategy.visualTypes.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Görsel Tipleri:</p>
                  <div className="flex flex-wrap gap-2">
                    {content.visualStrategy.visualTypes.map((type, idx) => (
                      <Badge key={idx} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Threading Strategy */}
      {content.threadingStrategy && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 mb-3">
            Thread Stratejisi
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.threadingStrategy.method && (
              <p>
                <strong>Yöntem:</strong> {content.threadingStrategy.method}
              </p>
            )}
            {content.threadingStrategy.numberingSystem && (
              <p>
                <strong>Numaralama:</strong>{" "}
                {content.threadingStrategy.numberingSystem}
              </p>
            )}
            {content.threadingStrategy.threadReaderFriendly !== undefined && (
              <p>
                <strong>Thread Reader Uyumlu:</strong>{" "}
                {content.threadingStrategy.threadReaderFriendly
                  ? "Evet"
                  : "Hayır"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Expected Performance */}
      {content.expectedPerformance && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-xs font-semibold text-green-700 mb-3">
            Beklenen Performans
          </p>
          <div className="space-y-1 text-sm text-gray-700">
            {content.expectedPerformance.viralPotential && (
              <p>
                <strong>Viral Potansiyel:</strong>{" "}
                {content.expectedPerformance.viralPotential}
              </p>
            )}
            {content.expectedPerformance.expectedRetweets && (
              <p>
                <strong>Beklenen RT:</strong>{" "}
                {content.expectedPerformance.expectedRetweets}
              </p>
            )}
            {content.expectedPerformance.bookmarkWorthiness && (
              <p>
                <strong>Bookmark Değeri:</strong>{" "}
                {content.expectedPerformance.bookmarkWorthiness}
              </p>
            )}
            {content.expectedPerformance.quoteTweetAngles &&
              content.expectedPerformance.quoteTweetAngles.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Quote Tweet Açıları:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {content.expectedPerformance.quoteTweetAngles.map(
                      (angle, idx) => (
                        <li key={idx}>{angle}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Alternative Hooks */}
      {content.alternativeHooks && content.alternativeHooks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <p className="text-xs font-semibold text-indigo-700 mb-3">
            Alternatif Hook'lar
          </p>
          <div className="space-y-2">
            {content.alternativeHooks.map((hook, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-lg border border-indigo-100"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-700 flex-1">{hook}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updated = [...generatedContents];
                      updated[currentPreview].content.tweets[0].text = hook;
                      setGeneratedContents(updated);
                      toast.success("İlk tweet güncellendi");
                    }}
                    className="ml-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // LinkedIn Post Renderer
  const renderLinkedInPost = (content) => (
    <div className="space-y-6">
      {content.hook && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Hook (İlk 2 Satır - "See More" Öncesi)
          </Label>
          <Textarea
            value={content.hook}
            onChange={(e) => updateContent("hook", e.target.value)}
            rows={2}
            className="border-blue-200 bg-blue-50 focus:border-blue-500 rounded-xl resize-none font-medium"
          />
          <p className="text-xs text-gray-500">
            {content.hook?.length || 0} karakter
          </p>
        </div>
      )}

      {content.fullPost && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700">
              Tam Post
            </Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(content.fullPost)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Kopyala
            </Button>
          </div>
          <Textarea
            value={content.fullPost}
            onChange={(e) => updateContent("fullPost", e.target.value)}
            rows={15}
            className="border-gray-200 focus:border-blue-500 rounded-xl resize-none"
          />
          <p className="text-xs text-gray-500">
            {content.fullPost?.length || 0} karakter
          </p>
        </div>
      )}

      {/* Post Structure Breakdown */}
      {content.postStructure && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 mb-3">
            Post Yapısı
          </p>
          <div className="space-y-3 text-sm text-gray-700">
            {content.postStructure.hook && (
              <div>
                <p className="font-semibold text-blue-600">Hook:</p>
                <p>{content.postStructure.hook}</p>
              </div>
            )}
            {content.postStructure.personalStory && (
              <div>
                <p className="font-semibold text-blue-600">Kişisel Hikaye:</p>
                <p>{content.postStructure.personalStory}</p>
              </div>
            )}
            {content.postStructure.transition && (
              <div>
                <p className="font-semibold text-blue-600">Geçiş:</p>
                <p>{content.postStructure.transition}</p>
              </div>
            )}
            {content.postStructure.insight && (
              <div>
                <p className="font-semibold text-blue-600">İçgörü:</p>
                <p>{content.postStructure.insight}</p>
              </div>
            )}
            {content.postStructure.engagement && (
              <div>
                <p className="font-semibold text-blue-600">
                  Etkileşim Çağrısı:
                </p>
                <p>{content.postStructure.engagement}</p>
              </div>
            )}
            {content.postStructure.cta && (
              <div>
                <p className="font-semibold text-blue-600">CTA:</p>
                <p>{content.postStructure.cta}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formatting Strategy */}
      {content.formatting && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
          <p className="text-xs font-semibold text-orange-700 mb-3">
            Formatlama Stratejisi
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.formatting.paragraphCount && (
              <p>
                <strong>Paragraf Sayısı:</strong>{" "}
                {content.formatting.paragraphCount}
              </p>
            )}
            {content.formatting.lineBreaksStrategy && (
              <p>
                <strong>Satır Boşlukları:</strong>{" "}
                {content.formatting.lineBreaksStrategy}
              </p>
            )}
            {content.formatting.listUsage && (
              <p>
                <strong>Liste Kullanımı:</strong> {content.formatting.listUsage}
              </p>
            )}
            {content.formatting.boldText && (
              <p>
                <strong>Bold Metin:</strong> {content.formatting.boldText}
              </p>
            )}
            {content.formatting.emojiUsage && (
              <p>
                <strong>Emoji Kullanımı:</strong>{" "}
                {content.formatting.emojiUsage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Engagement Strategy */}
      {content.engagementStrategy && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-xs font-semibold text-green-700 mb-3">
            Etkileşim Stratejisi
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.engagementStrategy.discussionQuestion && (
              <div>
                <p className="font-semibold">Tartışma Sorusu:</p>
                <p className="text-gray-800">
                  {content.engagementStrategy.discussionQuestion}
                </p>
              </div>
            )}
            {content.engagementStrategy.pollIdea && (
              <div>
                <p className="font-semibold">Poll Fikri:</p>
                <p>{content.engagementStrategy.pollIdea}</p>
              </div>
            )}
            {content.engagementStrategy.commentModeration && (
              <div>
                <p className="font-semibold">Yorum Yönetimi:</p>
                <p>{content.engagementStrategy.commentModeration}</p>
              </div>
            )}
            {content.engagementStrategy.followUpContent && (
              <div>
                <p className="font-semibold">Takip İçeriği:</p>
                <p>{content.engagementStrategy.followUpContent}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Suggestion */}
      {content.visualSuggestion && (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
          <p className="text-xs font-semibold text-pink-700 mb-3">
            Görsel Önerisi
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.visualSuggestion.imageType && (
              <p>
                <strong>Görsel Tipi:</strong>{" "}
                {content.visualSuggestion.imageType}
              </p>
            )}
            {content.visualSuggestion.imageDescription && (
              <p>
                <strong>Açıklama:</strong>{" "}
                {content.visualSuggestion.imageDescription}
              </p>
            )}
            {content.visualSuggestion.carouselAlternative && (
              <p>
                <strong>Carousel Alternatifi:</strong>{" "}
                {content.visualSuggestion.carouselAlternative}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hashtag Strategy */}
      {content.hashtagStrategy && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Hashtag Stratejisi
          </Label>
          {content.hashtagStrategy.hashtags &&
            content.hashtagStrategy.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                {content.hashtagStrategy.hashtags.map((tag, idx) => (
                  <Badge key={idx} className="bg-blue-600 text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          {content.hashtagStrategy.placement && (
            <p className="text-xs text-gray-600">
              <strong>Yerleşim:</strong> {content.hashtagStrategy.placement}
            </p>
          )}
          {content.hashtagStrategy.rationale && (
            <p className="text-xs text-gray-600">
              <strong>Mantık:</strong> {content.hashtagStrategy.rationale}
            </p>
          )}
        </div>
      )}

      {/* Expected Performance */}
      {content.expectedPerformance && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 mb-3">
            Beklenen Performans
          </p>
          <div className="space-y-1 text-sm text-gray-700">
            {content.expectedPerformance.saveWorthiness && (
              <p>
                <strong>Kaydetme Değeri:</strong>{" "}
                {content.expectedPerformance.saveWorthiness}
              </p>
            )}
            {content.expectedPerformance.shareability && (
              <p>
                <strong>Paylaşılabilirlik:</strong>{" "}
                {content.expectedPerformance.shareability}
              </p>
            )}
            {content.expectedPerformance.commentPotential && (
              <p>
                <strong>Yorum Potansiyeli:</strong>{" "}
                {content.expectedPerformance.commentPotential}
              </p>
            )}
            {content.expectedPerformance.connectionRequests && (
              <p>
                <strong>Bağlantı İstekleri:</strong>{" "}
                {content.expectedPerformance.connectionRequests}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Alternative Hooks */}
      {content.alternativeHooks && content.alternativeHooks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-200">
          <p className="text-xs font-semibold text-cyan-700 mb-3">
            Alternatif Hook'lar
          </p>
          <div className="space-y-2">
            {content.alternativeHooks.map((hook, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-lg border border-cyan-100"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-700 flex-1">{hook}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      updateContent("hook", hook);
                      toast.success("Hook güncellendi");
                    }}
                    className="ml-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // LinkedIn Carousel Renderer
  const renderLinkedInCarousel = (content) => (
    <div className="space-y-6">
      {content.carouselConcept && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 mb-2">
            Carousel Konsepti
          </p>
          <p className="text-sm text-gray-700">{content.carouselConcept}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            {content.totalSlides && (
              <span>
                <strong>Slide Sayısı:</strong> {content.totalSlides}
              </span>
            )}
            {content.format && (
              <span>
                <strong>Format:</strong> {content.format}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Design Theme */}
      {content.designTheme && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 mb-3">
            Tasarım Teması
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.designTheme.colorPalette &&
              content.designTheme.colorPalette.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Renk Paleti:</p>
                  <div className="flex flex-wrap gap-2">
                    {content.designTheme.colorPalette.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {content.designTheme.fontFamily && (
              <p>
                <strong>Font:</strong> {content.designTheme.fontFamily}
              </p>
            )}
            {content.designTheme.layoutStyle && (
              <p>
                <strong>Layout Stili:</strong> {content.designTheme.layoutStyle}
              </p>
            )}
          </div>
        </div>
      )}

      {content.slides && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-700">
            Carousel Slides
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {content.slides.map((slide, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-600 text-white">
                    Slide {slide.slideNumber || idx + 1}
                  </Badge>
                  {slide.slideType && (
                    <Badge variant="outline">{slide.slideType}</Badge>
                  )}
                </div>

                {slide.title && (
                  <h4 className="font-bold text-gray-900 mb-2">
                    {slide.title}
                  </h4>
                )}

                {slide.subtitle && (
                  <p className="text-sm text-gray-600 mb-2">{slide.subtitle}</p>
                )}

                {slide.body && (
                  <div className="mt-2 space-y-1">
                    {Array.isArray(slide.body) ? (
                      slide.body.map((item, bIdx) => (
                        <p key={bIdx} className="text-xs text-gray-700">
                          • {item}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-gray-700">{slide.body}</p>
                    )}
                  </div>
                )}

                {slide.design && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {slide.design.background &&
                        `BG: ${slide.design.background}`}
                      {slide.design.icon && ` | Icon: ${slide.design.icon}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {content.captionForCarousel && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Carousel Caption
          </Label>
          <Textarea
            value={content.captionForCarousel}
            onChange={(e) =>
              updateContent("captionForCarousel", e.target.value)
            }
            rows={6}
            className="border-gray-200 focus:border-blue-500 rounded-xl resize-none"
          />
        </div>
      )}

      {content.productionNotes && (
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-xs font-semibold text-orange-700 mb-3">
            Production Notes
          </p>
          <div className="space-y-1 text-sm text-gray-700">
            {content.productionNotes.software && (
              <p>
                <strong>Software:</strong> {content.productionNotes.software}
              </p>
            )}
            {content.productionNotes.templates && (
              <p>
                <strong>Templates:</strong> {content.productionNotes.templates}
              </p>
            )}
            {content.productionNotes.exportFormat && (
              <p>
                <strong>Export Format:</strong>{" "}
                {content.productionNotes.exportFormat}
              </p>
            )}
            {content.productionNotes.fileSize && (
              <p>
                <strong>Dosya Boyutu:</strong>{" "}
                {content.productionNotes.fileSize}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Visual Assets */}
      {content.visualAssets && (
        <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
          <p className="text-xs font-semibold text-teal-700 mb-3">
            Görsel Varlıklar
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.visualAssets.iconsNeeded &&
              content.visualAssets.iconsNeeded.length > 0 && (
                <div>
                  <p className="font-semibold">Gerekli İkonlar:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.visualAssets.iconsNeeded.map((icon, idx) => (
                      <Badge key={idx} variant="secondary">
                        {icon}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {content.visualAssets.imagesNeeded &&
              content.visualAssets.imagesNeeded.length > 0 && (
                <div>
                  <p className="font-semibold">Gerekli Görseller:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.visualAssets.imagesNeeded.map((image, idx) => (
                      <Badge key={idx} variant="secondary">
                        {image}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {content.visualAssets.chartsNeeded &&
              content.visualAssets.chartsNeeded.length > 0 && (
                <div>
                  <p className="font-semibold">Gerekli Grafikler:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.visualAssets.chartsNeeded.map((chart, idx) => (
                      <Badge key={idx} variant="secondary">
                        {chart}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Expected Performance */}
      {content.expectedPerformance && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-xs font-semibold text-green-700 mb-3">
            Beklenen Performans
          </p>
          <div className="space-y-1 text-sm text-gray-700">
            {content.expectedPerformance.saveRate && (
              <p>
                <strong>Kaydetme Oranı:</strong>{" "}
                {content.expectedPerformance.saveRate}
              </p>
            )}
            {content.expectedPerformance.slideCompletion && (
              <p>
                <strong>Slide Tamamlama:</strong>{" "}
                {content.expectedPerformance.slideCompletion}
              </p>
            )}
            {content.expectedPerformance.shares && (
              <p>
                <strong>Paylaşım Potansiyeli:</strong>{" "}
                {content.expectedPerformance.shares}
              </p>
            )}
            {content.expectedPerformance.leadGeneration && (
              <p>
                <strong>Lead Generation:</strong>{" "}
                {content.expectedPerformance.leadGeneration}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Alternative Titles */}
      {content.alternativeTitles && content.alternativeTitles.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <p className="text-xs font-semibold text-indigo-700 mb-3">
            Alternatif Başlıklar
          </p>
          <div className="space-y-2">
            {content.alternativeTitles.map((title, idx) => (
              <div
                key={idx}
                className="p-2 bg-white rounded-lg border border-indigo-100"
              >
                <p className="text-sm text-gray-700">{title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Facebook Post Renderer
  const renderFacebookPost = (content) => renderLinkedInPost(content); // Similar structure

  // Facebook Video Renderer
  const renderFacebookVideo = (content) => renderInstagramReel(content); // Similar structure

  // Generic Fallback Renderer
  // Generic Fallback Renderer
  const renderGenericContent = (content) => (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-sm font-semibold text-yellow-800 mb-2">
          ⚠️ Generic Renderer
        </p>
        <p className="text-xs text-yellow-700">
          Platform/content type için özel renderer bulunamadı. Ham JSON
          gösteriliyor.
        </p>
      </div>
      <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );

  // Render content fields based on platform and content type
  const renderContentFields = () => {
    const currentContent = generatedContents[currentPreview];

    if (!currentContent || !currentContent.content) {
      return null;
    }

    const { platform, contentType, content } = currentContent;

    // Use modular renderers for Instagram
    if (platform === "instagram" && contentType === "post") {
      return (
        <InstagramPostRenderer
          content={content}
          updateContent={updateContent}
          handleCopy={handleCopy}
        />
      );
    }

    if (platform === "instagram" && contentType === "carousel") {
      return (
        <InstagramCarouselRenderer
          content={content}
          updateContent={updateContent}
          handleCopy={handleCopy}
        />
      );
    }

    if (platform === "instagram" && contentType === "reel") {
      return (
        <InstagramReelRenderer
          content={content}
          updateContent={updateContent}
          handleCopy={handleCopy}
        />
      );
    }

    // For other content types, keep using existing renderers
    const renderKey = `${platform}_${contentType}`;

    switch (renderKey) {
      case "instagram_story":
        return renderInstagramStory(content);
      case "facebook_post":
        return renderFacebookPost(content);
      case "facebook_video":
        return renderFacebookVideo(content);
      case "x_tweet":
        return renderXTweet(content);
      case "x_thread":
        return renderXThread(content);
      case "linkedin_post":
        return renderLinkedInPost(content);
      case "linkedin_carousel":
        return renderLinkedInCarousel(content);
      default:
        return renderGenericContent(content);
    }
  };

  return (
    <PermissionGuard requiredPermission="social_media.create">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Modern Header with Glass Effect */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-2.5 shadow-lg">
                    <Wand2 className="h-7 w-7 text-white" />
                  </div>
                  İçerik Stüdyosu
                </h1>
                <p className="text-gray-600 mt-2 ml-14">
                  AI destekli profesyonel sosyal medya içeriği oluşturun
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push("/admin/social-media/content-list")
                  }
                  className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 rounded-xl"
                >
                  <Library className="h-4 w-4 mr-2" />
                  İçerik Kütüphanesi
                </Button>
                <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {datasets.length}
                  </div>
                  <div className="text-xs text-gray-500">Dataset</div>
                </div>
                {generatedContents.length > 0 && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm">
                    İçerik Hazır
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                  <TabsTrigger
                    value="generate"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    İçerik Üret
                  </TabsTrigger>
                  <TabsTrigger
                    value="edit"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Düzenle
                  </TabsTrigger>
                  {generatedContents.length > 0 &&
                    generatedContents[currentPreview]?.content && (
                      <TabsTrigger
                        value="visuals"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        AI Görseller
                      </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="generate" className="space-y-6">
                  {/* Title Selection Card */}
                  <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-100 bg-white">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <FileText className="h-5 w-5 text-gray-700" />
                        Başlık Seçimi
                      </CardTitle>
                      <CardDescription>
                        Kütüphanenizden bir başlık seçin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Title Selection Dialog */}
                      <div className="space-y-4">
                        <Label>Başlık</Label>

                        {/* Toggle between Dataset and Manual */}
                        <Tabs defaultValue="dataset" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="dataset">
                              <Library className="w-4 h-4 mr-2" />
                              Kütüphaneden Seç
                            </TabsTrigger>
                            <TabsTrigger value="manual">
                              <FileText className="w-4 h-4 mr-2" />
                              Manuel Yaz
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="dataset" className="mt-0">
                            <Dialog
                              open={dialogOpen}
                              onOpenChange={setDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full h-12 justify-between border-gray-200 hover:bg-purple-50 hover:border-purple-300 rounded-xl"
                                >
                                  <span className="flex items-center gap-2">
                                    {selectedTitle ? (
                                      <>
                                        <FileText className="h-4 w-4 text-purple-600" />
                                        <span className="truncate max-w-[300px]">
                                          {selectedTitle.title}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Search className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-500">
                                          Dataset ve başlık seçin
                                        </span>
                                      </>
                                    )}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </Button>
                              </DialogTrigger>

                              <DialogContent
                                className="overflow-hidden flex flex-col"
                                style={{
                                  maxWidth: "1000px",
                                  maxHeight: "80vh",
                                }}
                              >
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Folder className="h-5 w-5 text-purple-600" />
                                    Başlık Seçimi
                                  </DialogTitle>
                                  <DialogDescription>
                                    Önce bir dataset, sonra içinden bir başlık
                                    seçin
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                                  {/* Datasets Column */}
                                  <div className="flex flex-col space-y-4 overflow-hidden">
                                    <div>
                                      <Label className="text-sm mb-2 block">
                                        Dataset Seçin
                                      </Label>
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                          placeholder="Dataset ara..."
                                          value={searchTerm}
                                          onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                          }
                                          className="pl-9 h-10 border-gray-200 focus:border-purple-500 rounded-lg"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                      {datasets
                                        .filter(
                                          (d) =>
                                            d.name
                                              .toLowerCase()
                                              .includes(
                                                searchTerm.toLowerCase()
                                              ) ||
                                            d.description
                                              ?.toLowerCase()
                                              .includes(
                                                searchTerm.toLowerCase()
                                              )
                                        )
                                        .map((dataset) => (
                                          <button
                                            key={dataset.id}
                                            onClick={() => {
                                              loadDatasetTitles(dataset.id);
                                              setTitleSearchTerm("");
                                              // Reset filters
                                              setCategoryFilter("all");
                                              setPlatformFilter("all");
                                              setContentTypeFilter("all");
                                            }}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                                              selectedDataset?.id === dataset.id
                                                ? "bg-purple-50 border-purple-300 shadow-sm"
                                                : "bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-200"
                                            }`}
                                          >
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="font-semibold text-sm text-gray-900">
                                                {dataset.name}
                                              </span>
                                              <Badge
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {dataset.titleCount || 0}
                                              </Badge>
                                            </div>
                                            {dataset.description && (
                                              <p className="text-xs text-gray-500 line-clamp-1">
                                                {dataset.description}
                                              </p>
                                            )}
                                          </button>
                                        ))}

                                      {datasets.filter(
                                        (d) =>
                                          d.name
                                            .toLowerCase()
                                            .includes(
                                              searchTerm.toLowerCase()
                                            ) ||
                                          d.description
                                            ?.toLowerCase()
                                            .includes(searchTerm.toLowerCase())
                                      ).length === 0 && (
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                          Dataset bulunamadı
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Titles Column */}
                                  <div className="flex flex-col space-y-4 overflow-hidden border-l border-gray-200 pl-4">
                                    <div className="space-y-3">
                                      <Label className="text-sm mb-2 block">
                                        Başlık Seçin
                                      </Label>

                                      {/* Filters */}
                                      {selectedDataset &&
                                        datasetTitles.length > 0 && (
                                          <div className="space-y-2">
                                            {/* Filter Header with Badge and Clear Button */}
                                            <div className="flex items-center justify-between px-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-600">
                                                  Filtreler
                                                </span>
                                                {(categoryFilter !== "all" ||
                                                  platformFilter !== "all" ||
                                                  contentTypeFilter !==
                                                    "all") && (
                                                  <Badge
                                                    variant="secondary"
                                                    className="h-5 px-1.5 text-xs"
                                                  >
                                                    {
                                                      [
                                                        categoryFilter !==
                                                          "all",
                                                        platformFilter !==
                                                          "all",
                                                        contentTypeFilter !==
                                                          "all",
                                                      ].filter(Boolean).length
                                                    }
                                                  </Badge>
                                                )}
                                              </div>
                                              {(categoryFilter !== "all" ||
                                                platformFilter !== "all" ||
                                                contentTypeFilter !==
                                                  "all") && (
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    setCategoryFilter("all");
                                                    setPlatformFilter("all");
                                                    setContentTypeFilter("all");
                                                  }}
                                                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                                                >
                                                  Temizle
                                                </Button>
                                              )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                              {/* Category Filter */}
                                              <div className="space-y-1.5">
                                                <Label className="text-xs text-gray-600">
                                                  Kategori
                                                </Label>
                                                <Select
                                                  value={categoryFilter}
                                                  onValueChange={
                                                    setCategoryFilter
                                                  }
                                                >
                                                  <SelectTrigger className="h-9 text-xs bg-white border-gray-200 rounded-lg">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="all">
                                                      <span className="text-xs">
                                                        Tümü
                                                      </span>
                                                    </SelectItem>
                                                    {Array.from(
                                                      new Set(
                                                        datasetTitles
                                                          .map(
                                                            (t) => t.category
                                                          )
                                                          .filter(Boolean)
                                                      )
                                                    ).map((cat) => (
                                                      <SelectItem
                                                        key={cat}
                                                        value={cat}
                                                      >
                                                        <span className="text-xs">
                                                          {cat}
                                                        </span>
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>

                                              {/* Platform Filter */}
                                              <div className="space-y-1.5">
                                                <Label className="text-xs text-gray-600">
                                                  Platform
                                                </Label>
                                                <Select
                                                  value={platformFilter}
                                                  onValueChange={
                                                    setPlatformFilter
                                                  }
                                                >
                                                  <SelectTrigger className="h-9 text-xs bg-white border-gray-200 rounded-lg">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="all">
                                                      <span className="text-xs">
                                                        Tümü
                                                      </span>
                                                    </SelectItem>
                                                    {PLATFORMS.map((p) => (
                                                      <SelectItem
                                                        key={p.value}
                                                        value={p.value}
                                                      >
                                                        <span className="text-xs">
                                                          {p.label}
                                                        </span>
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>

                                              {/* Content Type Filter */}
                                              <div className="space-y-1.5">
                                                <Label className="text-xs text-gray-600">
                                                  İçerik Tipi
                                                </Label>
                                                <Select
                                                  value={contentTypeFilter}
                                                  onValueChange={
                                                    setContentTypeFilter
                                                  }
                                                >
                                                  <SelectTrigger className="h-9 text-xs bg-white border-gray-200 rounded-lg">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="all">
                                                      <span className="text-xs">
                                                        Tümü
                                                      </span>
                                                    </SelectItem>
                                                    {platformFilter !== "all" &&
                                                    CONTENT_TYPES[
                                                      platformFilter
                                                    ]
                                                      ? CONTENT_TYPES[
                                                          platformFilter
                                                        ].map((ct) => (
                                                          <SelectItem
                                                            key={ct.value}
                                                            value={ct.value}
                                                          >
                                                            <span className="text-xs">
                                                              {ct.label}
                                                            </span>
                                                          </SelectItem>
                                                        ))
                                                      : // Get unique content types across all platforms
                                                        Array.from(
                                                          new Map(
                                                            Object.values(
                                                              CONTENT_TYPES
                                                            )
                                                              .flat()
                                                              .map((ct) => [
                                                                ct.value,
                                                                ct,
                                                              ])
                                                          ).values()
                                                        ).map((ct, index) => (
                                                          <SelectItem
                                                            key={`${ct.value}-${index}`}
                                                            value={ct.value}
                                                          >
                                                            <span className="text-xs">
                                                              {ct.label}
                                                            </span>
                                                          </SelectItem>
                                                        ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                      {/* Search */}
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                          placeholder="Başlık ara..."
                                          value={titleSearchTerm}
                                          onChange={(e) =>
                                            setTitleSearchTerm(e.target.value)
                                          }
                                          className="pl-9 h-10 border-gray-200 focus:border-purple-500 rounded-lg"
                                          disabled={!selectedDataset}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                      {!selectedDataset ? (
                                        <div className="text-center py-12 text-gray-400 text-sm">
                                          Önce bir dataset seçin
                                        </div>
                                      ) : loadingTitles ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                                          <p className="text-sm text-gray-600">
                                            Başlıklar yükleniyor...
                                          </p>
                                        </div>
                                      ) : (
                                        datasetTitles
                                          .filter((t) => {
                                            // Text search
                                            const matchesSearch = t.title
                                              .toLowerCase()
                                              .includes(
                                                titleSearchTerm.toLowerCase()
                                              );

                                            // Category filter
                                            const matchesCategory =
                                              categoryFilter === "all" ||
                                              t.category === categoryFilter;

                                            // Platform filter
                                            const matchesPlatform =
                                              platformFilter === "all" ||
                                              t.platform === platformFilter;

                                            // Content type filter
                                            const matchesContentType =
                                              contentTypeFilter === "all" ||
                                              t.contentType ===
                                                contentTypeFilter;

                                            return (
                                              matchesSearch &&
                                              matchesCategory &&
                                              matchesPlatform &&
                                              matchesContentType
                                            );
                                          })
                                          .map((title) => (
                                            <button
                                              key={title.id}
                                              onClick={() => {
                                                setSelectedTitle(title);

                                                // Otomatik platform ve içerik tipi seçimi
                                                if (
                                                  title.platform &&
                                                  title.contentType
                                                ) {
                                                  selectPlatform(
                                                    title.platform
                                                  );
                                                  setSelectedContentType(
                                                    title.contentType
                                                  );
                                                }

                                                setDialogOpen(false);
                                                toast.success("Başlık seçildi");
                                              }}
                                              className="w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
                                            >
                                              <div className="flex items-start gap-2 mb-2">
                                                {title.platform && (
                                                  <Badge
                                                    variant="outline"
                                                    className="text-xs shrink-0"
                                                  >
                                                    {title.platform}
                                                  </Badge>
                                                )}
                                                {title.contentType && (
                                                  <Badge
                                                    variant="outline"
                                                    className="text-xs shrink-0"
                                                  >
                                                    {title.contentType}
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-sm text-gray-900 font-medium line-clamp-2">
                                                {title.title}
                                              </p>
                                              {title.category && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                  {title.category}
                                                </p>
                                              )}
                                            </button>
                                          ))
                                      )}

                                      {selectedDataset &&
                                        !loadingTitles &&
                                        datasetTitles.filter((t) => {
                                          const matchesSearch = t.title
                                            .toLowerCase()
                                            .includes(
                                              titleSearchTerm.toLowerCase()
                                            );
                                          const matchesCategory =
                                            categoryFilter === "all" ||
                                            t.category === categoryFilter;
                                          const matchesPlatform =
                                            platformFilter === "all" ||
                                            t.platform === platformFilter;
                                          const matchesContentType =
                                            contentTypeFilter === "all" ||
                                            t.contentType === contentTypeFilter;
                                          return (
                                            matchesSearch &&
                                            matchesCategory &&
                                            matchesPlatform &&
                                            matchesContentType
                                          );
                                        }).length === 0 && (
                                          <div className="text-center py-8 text-gray-500 text-sm">
                                            {titleSearchTerm ||
                                            categoryFilter !== "all" ||
                                            platformFilter !== "all" ||
                                            contentTypeFilter !== "all"
                                              ? "Filtre kriterlerine uygun başlık bulunamadı"
                                              : "Bu dataset boş"}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TabsContent>

                          <TabsContent value="manual" className="mt-0">
                            <Textarea
                              placeholder="Başlığınızı buraya yazın..."
                              value={selectedTitle?.title || ""}
                              onChange={(e) => {
                                setSelectedTitle({
                                  title: e.target.value,
                                  id: "manual",
                                });
                                setSelectedDataset(null);
                              }}
                              rows={4}
                              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl resize-none bg-white"
                            />
                            {selectedTitle?.title && (
                              <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                                <span>
                                  {selectedTitle.title.length} karakter
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedTitle(null);
                                  }}
                                  className="h-7 text-xs"
                                >
                                  Temizle
                                </Button>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>

                      {selectedTitle && selectedDataset && (
                        <div className="mt-4">
                          {/* Başlık Düzenleme */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-xs font-semibold text-gray-900">
                                    Seçili Başlık:
                                  </p>
                                  {selectedDataset && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {selectedDataset.name}
                                    </Badge>
                                  )}
                                </div>
                                <Textarea
                                  value={selectedTitle.title}
                                  onChange={(e) =>
                                    setSelectedTitle({
                                      ...selectedTitle,
                                      title: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl resize-none text-sm bg-white"
                                  placeholder="Başlık metnini düzenleyin..."
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedTitle(null);
                                  setSelectedDataset(null);
                                  setDatasetTitles([]);
                                }}
                                className="shrink-0 h-7 text-xs ml-2"
                              >
                                Temizle
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Görsel/Video Seçimi - Ayrı Kart */}
                      <div className="mt-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group">
                          {(() => {
                            // Determine if content needs video or multiple images
                            const needsVideo =
                              selectedContentType === "reel" ||
                              selectedContentType === "video";
                            const needsMultipleImages =
                              selectedContentType === "carousel";

                            if (needsVideo) {
                              // VIDEO UPLOAD SECTION
                              return (
                                <>
                                  <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                                    <Video className="w-3.5 h-3.5" />
                                    İçerik Videosu
                                    <span className="text-gray-400 font-normal">
                                      (Reel/Video için)
                                    </span>
                                  </Label>

                                  {!videoPreview ? (
                                    <label className="relative flex flex-col items-center justify-center w-full h-40 border border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-300 cursor-pointer overflow-hidden">
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="video/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            if (file.size > 100 * 1024 * 1024) {
                                              toast.error(
                                                "Video boyutu 100MB'dan küçük olmalıdır"
                                              );
                                              return;
                                            }
                                            setSelectedVideo(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setVideoPreview(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />

                                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20" />
                                        <div
                                          className="absolute inset-0"
                                          style={{
                                            backgroundImage:
                                              "radial-gradient(circle at 2px 2px, rgb(147 51 234 / 0.1) 1px, transparent 0)",
                                            backgroundSize: "24px 24px",
                                          }}
                                        />
                                      </div>

                                      <div className="relative flex flex-col items-center gap-3">
                                        <div className="relative">
                                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-purple-50 group-hover:to-pink-50 flex items-center justify-center transition-all duration-300 shadow-sm">
                                            <Video className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
                                          </div>
                                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                                            +
                                          </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                          <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                            Video Seç
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            MP4, MOV, AVI • Max 100MB
                                          </p>
                                        </div>
                                      </div>
                                    </label>
                                  ) : (
                                    <div className="relative group/preview">
                                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black">
                                        <video
                                          src={videoPreview}
                                          controls
                                          className="w-full h-56 object-contain"
                                        />

                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center pointer-events-none">
                                          <div className="opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex gap-2 pointer-events-auto">
                                            <button
                                              onClick={() => {
                                                setSelectedVideo(null);
                                                setVideoPreview(null);
                                              }}
                                              className="p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-red-500 rounded-xl transition-all duration-200 shadow-lg"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                            <label className="p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-purple-500 rounded-xl transition-all duration-200 shadow-lg cursor-pointer">
                                              <input
                                                type="file"
                                                className="hidden"
                                                accept="video/*"
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files?.[0];
                                                  if (file) {
                                                    if (
                                                      file.size >
                                                      100 * 1024 * 1024
                                                    ) {
                                                      toast.error(
                                                        "Video boyutu 100MB'dan küçük olmalıdır"
                                                      );
                                                      return;
                                                    }
                                                    setSelectedVideo(file);
                                                    const reader =
                                                      new FileReader();
                                                    reader.onloadend = () => {
                                                      setVideoPreview(
                                                        reader.result
                                                      );
                                                    };
                                                    reader.readAsDataURL(file);
                                                  }
                                                }}
                                              />
                                              <RefreshCw className="w-4 h-4" />
                                            </label>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="absolute top-2 left-2 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                        <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                          <Check className="w-3 h-3 text-green-500" />
                                          Video Yüklendi
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            } else if (needsMultipleImages) {
                              // MULTIPLE IMAGES UPLOAD SECTION (CAROUSEL)
                              return (
                                <>
                                  <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Carousel Görselleri
                                    <span className="text-gray-400 font-normal">
                                      (2-10 görsel)
                                    </span>
                                  </Label>

                                  <div className="space-y-3">
                                    {/* Upload Zone */}
                                    <label className="relative flex flex-col items-center justify-center w-full h-32 border border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-300 cursor-pointer overflow-hidden">
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                          const files = Array.from(
                                            e.target.files || []
                                          );
                                          if (
                                            files.length +
                                              selectedImages.length >
                                            10
                                          ) {
                                            toast.error(
                                              "En fazla 10 görsel yükleyebilirsiniz"
                                            );
                                            return;
                                          }

                                          files.forEach((file) => {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setImagePreviews((prev) => [
                                                ...prev,
                                                reader.result,
                                              ]);
                                            };
                                            reader.readAsDataURL(file);
                                          });

                                          setSelectedImages((prev) => [
                                            ...prev,
                                            ...files,
                                          ]);
                                        }}
                                      />

                                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20" />
                                      </div>

                                      <div className="relative flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-purple-50 group-hover:to-pink-50 flex items-center justify-center transition-all duration-300 shadow-sm">
                                          <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
                                        </div>
                                        <div className="text-center space-y-0.5">
                                          <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                            {selectedImages.length > 0
                                              ? "Daha Fazla Ekle"
                                              : "Görselleri Seç"}
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            {selectedImages.length}/10 görsel
                                          </p>
                                        </div>
                                      </div>
                                    </label>

                                    {/* Images Grid */}
                                    {imagePreviews.length > 0 && (
                                      <div className="grid grid-cols-3 gap-2">
                                        {imagePreviews.map((preview, idx) => (
                                          <div
                                            key={idx}
                                            className="relative group/img aspect-square rounded-xl overflow-hidden border border-gray-200"
                                          >
                                            <img
                                              src={preview}
                                              alt={`Preview ${idx + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                              <button
                                                onClick={() => {
                                                  setSelectedImages((prev) =>
                                                    prev.filter(
                                                      (_, i) => i !== idx
                                                    )
                                                  );
                                                  setImagePreviews((prev) =>
                                                    prev.filter(
                                                      (_, i) => i !== idx
                                                    )
                                                  );
                                                }}
                                                className="opacity-0 group-hover/img:opacity-100 transition-opacity p-1.5 bg-white/90 backdrop-blur-sm hover:bg-white text-red-500 rounded-lg"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                                              {idx + 1}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </>
                              );
                            } else {
                              // SINGLE IMAGE UPLOAD SECTION (DEFAULT)
                              return (
                                <>
                                  <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    İçerik Görseli
                                    <span className="text-gray-400 font-normal">
                                      (İsteğe Bağlı)
                                    </span>
                                  </Label>

                                  {!imagePreview ? (
                                    <label className="relative flex flex-col items-center justify-center w-full h-40 border border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-300 cursor-pointer overflow-hidden">
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setSelectedImage(file);
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setImagePreview(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />

                                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20" />
                                        <div
                                          className="absolute inset-0"
                                          style={{
                                            backgroundImage:
                                              "radial-gradient(circle at 2px 2px, rgb(147 51 234 / 0.1) 1px, transparent 0)",
                                            backgroundSize: "24px 24px",
                                          }}
                                        />
                                      </div>

                                      <div className="relative flex flex-col items-center gap-3">
                                        <div className="relative">
                                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-purple-50 group-hover:to-pink-50 flex items-center justify-center transition-all duration-300 shadow-sm">
                                            <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
                                          </div>
                                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                                            +
                                          </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                          <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                            Görsel Seç
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            PNG, JPG, WEBP • Max 10MB
                                          </p>
                                        </div>
                                      </div>
                                    </label>
                                  ) : (
                                    <div className="relative group/preview">
                                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                                        <img
                                          src={imagePreview}
                                          alt="Preview"
                                          className="w-full h-56 object-contain"
                                        />

                                        <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                          <div className="opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex gap-2">
                                            <button
                                              onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                              }}
                                              className="p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-red-500 rounded-xl transition-all duration-200 shadow-lg"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                            <label className="p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-purple-500 rounded-xl transition-all duration-200 shadow-lg cursor-pointer">
                                              <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files?.[0];
                                                  if (file) {
                                                    setSelectedImage(file);
                                                    const reader =
                                                      new FileReader();
                                                    reader.onloadend = () => {
                                                      setImagePreview(
                                                        reader.result
                                                      );
                                                    };
                                                    reader.readAsDataURL(file);
                                                  }
                                                }}
                                              />
                                              <RefreshCw className="w-4 h-4" />
                                            </label>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="absolute top-2 left-2 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                        <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                          <Check className="w-3 h-3 text-green-500" />
                                          Görsel Yüklendi
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Platform & Settings Card */}
                  <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-100 bg-white">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Sparkles className="h-5 w-5 text-gray-700" />
                        Platform ve İçerik Tipi Seçimi
                      </CardTitle>
                      <CardDescription>
                        Birden fazla platform ve içerik tipi seçerek toplu
                        üretim yapabilirsiniz
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* AI Model Selection - Unified AI System */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            AI Model
                          </Label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setShowPromptPreview(!showPromptPreview)
                              }
                              className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                              <BookOpen className="h-3 w-3" />
                              Prompt Önizle
                            </button>
                            <button
                              onClick={refreshAIConfig}
                              disabled={configLoading}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                              <RefreshCw
                                className={`h-3 w-3 ${
                                  configLoading ? "animate-spin" : ""
                                }`}
                              />
                              Yenile
                            </button>
                          </div>
                        </div>

                        {configLoading ? (
                          <div className="h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                            <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                          </div>
                        ) : hasModels && availableModels?.length > 0 ? (
                          <div className="space-y-3">
                            {/* Provider grupları */}
                            {Object.entries(modelsByProvider || {}).map(
                              ([provider, models]) => {
                                const providerInfo = PROVIDER_INFO[provider];
                                return (
                                  <div key={provider} className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                      <span>{providerInfo?.icon || "⚪"}</span>
                                      <span>
                                        {providerInfo?.name || provider}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {models.map((model) => {
                                        const modelId =
                                          model.modelId || model.id;
                                        const isSelected = aiModel === modelId;
                                        const isDefault =
                                          aiConfig?.defaultModelId === modelId;
                                        return (
                                          <div
                                            key={modelId}
                                            onClick={() => {
                                              setAiModel(modelId);
                                              selectModel(modelId);
                                            }}
                                            className={`
                                              relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-200
                                              ${
                                                isSelected
                                                  ? "border-purple-500 bg-purple-50 shadow-sm"
                                                  : "border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/30"
                                              }
                                            `}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-base">
                                                {model.icon ||
                                                  providerInfo?.icon ||
                                                  "⚪"}
                                              </span>
                                              <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                  {model.displayName ||
                                                    model.name}
                                                </div>
                                                {isDefault && (
                                                  <span className="text-xs text-purple-600">
                                                    Önerilen
                                                  </span>
                                                )}
                                              </div>
                                              {isSelected && (
                                                <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <div className="h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-sm text-gray-400">
                            <Info className="h-5 w-5 mb-2" />
                            Model yüklenemedi
                            <button
                              onClick={refreshAIConfig}
                              className="text-purple-600 hover:text-purple-700 mt-1 text-xs"
                            >
                              Tekrar dene
                            </button>
                          </div>
                        )}

                        {/* Current Prompt Preview - Full Text */}
                        {showPromptPreview &&
                          selectedPlatform &&
                          selectedContentType && (
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-purple-700 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  {selectedPlatform} - {selectedContentType}{" "}
                                  Prompt
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      setShowFullPromptDialog(true)
                                    }
                                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                    Tam Ekran
                                  </button>
                                  <button
                                    onClick={() => setShowPromptPreview(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {(() => {
                                const key = getPlatformContentKey(
                                  selectedPlatform,
                                  selectedContentType
                                );
                                const cachedPrompt = platformPromptCache[key];
                                if (cachedPrompt) {
                                  return (
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs text-purple-600 font-medium flex items-center gap-2">
                                          <Cpu className="h-3 w-3" />
                                          {cachedPrompt.name ||
                                            cachedPrompt.promptKey}
                                          {cachedPrompt.version && (
                                            <Badge
                                              variant="outline"
                                              className="text-[10px] py-0"
                                            >
                                              v{cachedPrompt.version}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      {/* System Prompt */}
                                      {cachedPrompt.systemPrompt && (
                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-purple-700 flex items-center gap-1">
                                            <Brain className="h-3 w-3" />
                                            System Prompt
                                          </Label>
                                          <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-purple-100 max-h-64 overflow-y-auto font-mono leading-relaxed">
                                            {cachedPrompt.systemPrompt}
                                          </pre>
                                        </div>
                                      )}
                                      {/* User Prompt Template - Değişkenler değiştirilmiş */}
                                      {(cachedPrompt.userPromptTemplate ||
                                        cachedPrompt.content) && (
                                        <div className="space-y-1">
                                          <Label className="text-xs font-medium text-blue-700 flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            User Prompt (Değerler Atanmış)
                                          </Label>
                                          <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-blue-100 max-h-48 overflow-y-auto font-mono leading-relaxed">
                                            {replacePromptVariables(
                                              cachedPrompt.userPromptTemplate ||
                                                cachedPrompt.content
                                            )}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Prompt yükleniyor veya bu kombinasyon için
                                    prompt tanımlı değil
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                      </div>

                      {/* Platform Selection */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          Platform Seçimi
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {PLATFORMS.map((plat) => {
                            const Icon = plat.icon;
                            const isSelected = selectedPlatform === plat.value;
                            return (
                              <button
                                key={plat.value}
                                type="button"
                                onClick={() => selectPlatform(plat.value)}
                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                  isSelected
                                    ? `bg-gradient-to-br ${plat.color} border-transparent text-white shadow-lg`
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-white rounded-full p-0.5">
                                    <Check className="h-3 w-3 text-green-600" />
                                  </div>
                                )}
                                <Icon
                                  className={`h-6 w-6 mx-auto mb-2 ${
                                    isSelected ? "text-white" : ""
                                  }`}
                                />
                                <div
                                  className={`text-xs font-medium text-center ${
                                    isSelected ? "text-white" : ""
                                  }`}
                                >
                                  {plat.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content Type Selection */}
                      {selectedPlatform && (
                        <div className="space-y-4">
                          <Label className="flex items-center gap-2">
                            İçerik Tipi Seçimi
                          </Label>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {(CONTENT_TYPES[selectedPlatform] || []).map(
                                (type) => {
                                  const isSelected =
                                    selectedContentType === type.value;
                                  return (
                                    <button
                                      key={type.value}
                                      type="button"
                                      onClick={() =>
                                        selectContentType(type.value)
                                      }
                                      className={`relative p-3 rounded-lg border transition-all text-left ${
                                        isSelected
                                          ? "bg-purple-50 border-purple-300 shadow-sm"
                                          : "bg-white border-gray-200 hover:border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute top-1.5 right-1.5 bg-purple-600 rounded-full p-0.5">
                                          <Check className="h-2.5 w-2.5 text-white" />
                                        </div>
                                      )}
                                      <div className="text-xs font-medium text-gray-900">
                                        {type.label}
                                      </div>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {selectedPlatform && selectedContentType && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-900">
                              Üretim Özeti
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">
                              {
                                PLATFORMS.find(
                                  (p) => p.value === selectedPlatform
                                )?.label
                              }
                            </span>
                            {" - "}
                            <span className="font-medium">
                              {
                                CONTENT_TYPES[selectedPlatform]?.find(
                                  (t) => t.value === selectedContentType
                                )?.label
                              }
                            </span>
                            {" için içerik oluşturulacak"}
                          </div>
                        </div>
                      )}

                      {/* 🆕 Customization Panel */}
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <button
                          onClick={() =>
                            setShowCustomization(!showCustomization)
                          }
                          className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-purple-600" />
                            <span className="font-semibold text-gray-900">
                              İçerik Özelleştirme
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              İsteğe Bağlı
                            </Badge>
                          </div>
                          <ChevronRight
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              showCustomization ? "rotate-90" : ""
                            }`}
                          />
                        </button>

                        {showCustomization && (
                          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
                            {/* Tone Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Ton & Üslup
                              </Label>
                              <Select
                                value={customization.tone || "default"}
                                onValueChange={(value) =>
                                  setCustomization((prev) => ({
                                    ...prev,
                                    tone: value === "default" ? "" : value,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg">
                                  <SelectValue placeholder="Varsayılan (Profesyonel & Friendly)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="default">
                                    Varsayılan (Profesyonel & Friendly)
                                  </SelectItem>
                                  <SelectItem value="professional">
                                    🎯 Profesyonel (Ciddi, expertise vurgulu)
                                  </SelectItem>
                                  <SelectItem value="casual">
                                    😊 Samimi (Rahat, arkadaşça)
                                  </SelectItem>
                                  <SelectItem value="playful">
                                    🎉 Eğlenceli (Yaratıcı, enerjik)
                                  </SelectItem>
                                  <SelectItem value="serious">
                                    📊 Ciddi (Data-odaklı, authoritative)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Focus Angle */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                İçerik Odağı
                              </Label>
                              <Select
                                value={customization.focusAngle || "auto"}
                                onValueChange={(value) =>
                                  setCustomization((prev) => ({
                                    ...prev,
                                    focusAngle: value === "auto" ? "" : value,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg">
                                  <SelectValue placeholder="Otomatik (AI karar verir)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">
                                    Otomatik (AI karar verir)
                                  </SelectItem>
                                  <SelectItem value="educational">
                                    📚 Eğitici (Öğretici, actionable insights)
                                  </SelectItem>
                                  <SelectItem value="inspirational">
                                    ✨ İlham Verici (Motivasyonel, hikaye
                                    odaklı)
                                  </SelectItem>
                                  <SelectItem value="promotional">
                                    🎁 Tanıtım (Hizmet/ürün odaklı, ama pushy
                                    değil)
                                  </SelectItem>
                                  <SelectItem value="behind-the-scenes">
                                    🎬 Perde Arkası (Süreç, authenticity)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Length Preference */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                İçerik Uzunluğu
                              </Label>
                              <Select
                                value={customization.length}
                                onValueChange={(value) =>
                                  setCustomization((prev) => ({
                                    ...prev,
                                    length: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="short">
                                    ⚡ Kısa (Öz, minimum kelime)
                                  </SelectItem>
                                  <SelectItem value="medium">
                                    📝 Orta (Dengeli, önerilen)
                                  </SelectItem>
                                  <SelectItem value="long">
                                    📖 Uzun (Detaylı, maksimum değer)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Emoji Usage */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">
                                  Emoji Kullan
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                  İçerikte emoji kullanımı (stratejik placement)
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={customization.includeEmoji}
                                  onChange={(e) =>
                                    setCustomization((prev) => ({
                                      ...prev,
                                      includeEmoji: e.target.checked,
                                    }))
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            </div>

                            {/* Custom CTA */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Özel CTA (Call-to-Action)
                              </Label>
                              <Input
                                placeholder="Örn: Detaylar için DM atın, Katalog için tıklayın"
                                value={customization.customCTA}
                                onChange={(e) =>
                                  setCustomization((prev) => ({
                                    ...prev,
                                    customCTA: e.target.value,
                                  }))
                                }
                                className="h-10 bg-white border-gray-200 rounded-lg"
                              />
                              <p className="text-xs text-gray-500">
                                Boş bırakırsanız AI uygun CTA oluşturur
                              </p>
                            </div>

                            {/* Target Hashtags */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                İstenen Hashtag'ler
                              </Label>
                              <Input
                                placeholder="#kozmetik #fasonuretim #mkngroup (virgülle ayırın)"
                                value={customization.targetHashtags.join(", ")}
                                onChange={(e) => {
                                  const tags = e.target.value
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter((t) => t);
                                  setCustomization((prev) => ({
                                    ...prev,
                                    targetHashtags: tags,
                                  }));
                                }}
                                className="h-10 bg-white border-gray-200 rounded-lg"
                              />
                              <p className="text-xs text-gray-500">
                                AI bu hashtag'leri içeriğe dahil etmeye çalışır
                              </p>
                            </div>

                            {/* Additional Context */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Ek Not & Bağlam
                              </Label>
                              <Textarea
                                placeholder="AI'ya özel talimatlarınız... Örn: Belirli bir ürünü vurgula, rakip markalardan bahsetme, vb."
                                value={customization.additionalContext}
                                onChange={(e) =>
                                  setCustomization((prev) => ({
                                    ...prev,
                                    additionalContext: e.target.value,
                                  }))
                                }
                                rows={3}
                                className="bg-white border-gray-200 rounded-lg resize-none"
                              />
                            </div>

                            {/* Reset Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCustomization({
                                  tone: "",
                                  customCTA: "",
                                  targetHashtags: [],
                                  length: "medium",
                                  includeEmoji: true,
                                  focusAngle: "",
                                  additionalContext: "",
                                })
                              }
                              className="w-full hover:bg-gray-100"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Varsayılanlara Sıfırla
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* AI Config Summary - Editable */}
                      {aiIsReady && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-purple-700 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              AI Konfigürasyonu
                            </span>
                            <button
                              onClick={() =>
                                setShowAIConfigPanel(!showAIConfigPanel)
                              }
                              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                            >
                              {showAIConfigPanel
                                ? "Basit Görünüm"
                                : "Detaylı Ayarlar"}
                            </button>
                          </div>

                          {/* Quick Summary */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
                              <div className="text-gray-500">Model</div>
                              <div className="font-semibold text-gray-900 truncate">
                                {currentModel?.displayName ||
                                  currentModel?.name ||
                                  aiModel}
                              </div>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-purple-100 text-center">
                              <div className="text-gray-500">Provider</div>
                              <div className="font-semibold text-gray-900">
                                {currentProvider?.icon}{" "}
                                {currentProvider?.name || currentProvider?.id}
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
                              <div
                                className={`font-semibold ${
                                  isThinkingModel()
                                    ? "text-amber-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {maxTokens.toLocaleString()}
                                {isThinkingModel() && (
                                  <Brain className="inline h-3 w-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {selectedPlatform &&
                              selectedContentType &&
                              platformPromptCache[
                                getPlatformContentKey(
                                  selectedPlatform,
                                  selectedContentType
                                )
                              ] && (
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-100 text-purple-700"
                                >
                                  <BookOpen className="h-2.5 w-2.5 mr-1" />
                                  Prompt Aktif
                                </Badge>
                              )}
                            {isThinkingModel() && (
                              <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-700"
                              >
                                <Brain className="h-2.5 w-2.5 mr-1" />
                                Thinking Model
                              </Badge>
                            )}
                            {autoMaxTokens && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                              >
                                <Zap className="h-2.5 w-2.5 mr-1" />
                                Otomatik Token
                              </Badge>
                            )}
                          </div>

                          {/* Detailed Settings Panel */}
                          {showAIConfigPanel && (
                            <div className="space-y-4 pt-3 border-t border-purple-200">
                              {/* Thinking Model Warning */}
                              {isThinkingModel() && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <div className="flex items-center gap-2 text-amber-700 text-xs font-medium">
                                    <Brain className="h-4 w-4" />
                                    Thinking Model Algılandı
                                  </div>
                                  <p className="text-xs text-amber-600 mt-1">
                                    Bu model (Gemini 3 Pro, Claude Opus vb.)
                                    "düşünme" aşaması için ekstra token harcar.
                                    Otomatik hesaplamada +2500 token ekleniyor.
                                  </p>
                                </div>
                              )}

                              {/* Temperature Slider */}
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
                                  onValueChange={(value) =>
                                    setTemperature(value[0] / 100)
                                  }
                                  max={100}
                                  min={10}
                                  step={5}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400">
                                  <span>Tutarlı (0.1)</span>
                                  <span>Dengeli (0.5)</span>
                                  <span>Yaratıcı (1.0)</span>
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
                                    <span className="text-[10px] text-gray-500">
                                      Otomatik
                                    </span>
                                    <Switch
                                      checked={autoMaxTokens}
                                      onCheckedChange={setAutoMaxTokens}
                                    />
                                  </div>
                                </div>

                                {autoMaxTokens ? (
                                  <div className="text-xs text-purple-700 bg-purple-100/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-3 w-3" />
                                      {isThinkingModel() ? (
                                        <span>
                                          Thinking Model:{" "}
                                          {getEstimatedTokensForContentType(
                                            selectedContentType
                                          )}{" "}
                                          base + 2500 thinking ={" "}
                                          <strong>
                                            {maxTokens.toLocaleString()}
                                          </strong>{" "}
                                          token
                                        </span>
                                      ) : (
                                        <span>
                                          {selectedContentType || "İçerik"}:{" "}
                                          {getEstimatedTokensForContentType(
                                            selectedContentType
                                          )}{" "}
                                          × 1.5 ={" "}
                                          <strong>
                                            {maxTokens.toLocaleString()}
                                          </strong>{" "}
                                          token
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <Slider
                                      value={[maxTokens]}
                                      onValueChange={(value) =>
                                        setMaxTokens(value[0])
                                      }
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

                              {/* Config Info */}
                              {aiConfig && (
                                <div className="pt-3 border-t border-purple-100">
                                  <Label className="text-xs font-medium text-gray-700 mb-2 block">
                                    Firestore Konfigürasyonu
                                  </Label>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between p-2 bg-white rounded border">
                                      <span className="text-gray-500">
                                        Context:
                                      </span>
                                      <span className="font-mono text-gray-700">
                                        {aiConfig.contextId || aiConfig.context}
                                      </span>
                                    </div>
                                    <div className="flex justify-between p-2 bg-white rounded border">
                                      <span className="text-gray-500">
                                        Default Model:
                                      </span>
                                      <span className="font-mono text-gray-700">
                                        {aiConfig.defaultModelId}
                                      </span>
                                    </div>
                                    {aiConfig.promptKey && (
                                      <div className="flex justify-between p-2 bg-white rounded border col-span-2">
                                        <span className="text-gray-500">
                                          Prompt Key:
                                        </span>
                                        <span className="font-mono text-gray-700">
                                          {aiConfig.promptKey}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Platform Prompt Status */}
                              {hasPlatformPrompts && (
                                <div className="flex items-center justify-between text-xs p-2 bg-green-50 rounded-lg border border-green-100">
                                  <span className="text-green-700 flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    Platform Bazlı Promptlar
                                  </span>
                                  <span className="text-green-600 font-medium">
                                    Aktif
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Generate Button */}
                      <Button
                        onClick={() =>
                          handleGenerate({ temperature, maxTokens })
                        }
                        disabled={
                          generating ||
                          !selectedTitle ||
                          !selectedPlatform ||
                          !selectedContentType
                        }
                        className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
                        size="lg"
                      >
                        {generating ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            İçerik Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            İçerik Oluştur
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="edit" className="space-y-6">
                  {!generatedContents || generatedContents.length === 0 ? (
                    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                      <CardContent className="py-16 text-center">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                          <Wand2 className="h-10 w-10 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Henüz içerik oluşturulmadı
                        </h3>
                        <p className="text-gray-500">
                          Önce "İçerik Üret" sekmesinden içerik oluşturun
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                      <CardHeader className="border-b border-gray-100 bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                              <FileText className="h-5 w-5 text-gray-700" />
                              İçerik Düzenle
                            </CardTitle>
                            <CardDescription>
                              Oluşturulan içeriği düzenleyin ve kaydedin
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleExport}
                              className="rounded-lg"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Dışa Aktar
                            </Button>
                            {editingContentId && (
                              <Button
                                size="sm"
                                onClick={handleUpdate}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Güncelle
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={handleSaveAsNew}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {editingContentId ? "Farklı Kaydet" : "Kaydet"}
                            </Button>
                          </div>
                        </div>

                        {/* Content Navigator */}
                        {generatedContents.length > 1 && (
                          <div className="mt-4 flex items-center gap-2 flex-wrap">
                            {generatedContents.map((content, idx) => {
                              const PlatformIcon =
                                PLATFORMS.find(
                                  (p) => p.value === content.platform
                                )?.icon || FileText;
                              const isActive = idx === currentPreview;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentPreview(idx)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    isActive
                                      ? "bg-white text-green-700 shadow-sm border border-green-200"
                                      : "bg-green-100/50 text-green-600 hover:bg-green-100"
                                  }`}
                                >
                                  <PlatformIcon className="h-3.5 w-3.5" />
                                  <span>{content.platform}</span>
                                  <span className="text-gray-400">·</span>
                                  <span>{content.contentType}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-6">
                          {/* Used in Calendars Info */}
                          {generatedContents[currentPreview]?.usedInCalendars &&
                            generatedContents[currentPreview].usedInCalendars
                              .length > 0 && (
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                  <p className="text-xs font-semibold text-blue-700">
                                    Takvimlerde Kullanım
                                  </p>
                                  <Badge className="bg-blue-600 text-white">
                                    {
                                      generatedContents[currentPreview]
                                        .usedInCalendars.length
                                    }
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  {generatedContents[
                                    currentPreview
                                  ].usedInCalendars.map((usage, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          {usage.calendarName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                          <span>
                                            {new Date(
                                              usage.date
                                            ).toLocaleDateString("tr-TR", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                            })}
                                          </span>
                                          {usage.addedAt && (
                                            <>
                                              <span>·</span>
                                              <span>
                                                Eklendi:{" "}
                                                {new Date(
                                                  usage.addedAt
                                                ).toLocaleDateString("tr-TR")}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          const url = `/admin/social-media/calendar-view/${usage.calendarId}?date=${usage.date}`;
                                          window.open(url, "_blank");
                                        }}
                                        className="ml-2 hover:bg-blue-50"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* AI Customization Info */}
                          {customization &&
                            (customization.tone ||
                              customization.customCTA ||
                              customization.targetHashtags?.length > 0 ||
                              customization.focusAngle ||
                              customization.additionalContext) && (
                              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles className="h-4 w-4 text-purple-600" />
                                  <p className="text-xs font-semibold text-purple-700">
                                    AI Özelleştirme Ayarları
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  {customization.tone && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-[80px]">
                                        Ton:
                                      </span>
                                      <span className="text-gray-900 capitalize">
                                        {customization.tone}
                                      </span>
                                    </div>
                                  )}
                                  {customization.focusAngle && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-[80px]">
                                        Fokus:
                                      </span>
                                      <span className="text-gray-900 capitalize">
                                        {customization.focusAngle}
                                      </span>
                                    </div>
                                  )}
                                  {customization.length && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-[80px]">
                                        Uzunluk:
                                      </span>
                                      <span className="text-gray-900 capitalize">
                                        {customization.length}
                                      </span>
                                    </div>
                                  )}
                                  {customization.customCTA && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-[80px]">
                                        CTA:
                                      </span>
                                      <span className="text-gray-900">
                                        {customization.customCTA}
                                      </span>
                                    </div>
                                  )}
                                  {customization.targetHashtags?.length > 0 && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-[80px]">
                                        Hashtagler:
                                      </span>
                                      <div className="flex flex-wrap gap-1">
                                        {customization.targetHashtags.map(
                                          (tag, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className="text-xs bg-purple-100 text-purple-700"
                                            >
                                              {tag}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {customization.additionalContext && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-[80px]">
                                        Ek Not:
                                      </span>
                                      <span className="text-gray-900 italic bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                        "{customization.additionalContext}"
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 pt-2 border-t border-purple-100">
                                    <Check className="h-3 w-3 text-green-600" />
                                    <span>Bu ayarlarla oluşturuldu</span>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Content Fields */}
                          {renderContentFields()}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="visuals" className="space-y-6">
                  {!generatedContents ||
                  generatedContents.length === 0 ||
                  !generatedContents[currentPreview]?.content ? (
                    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                      <CardContent className="py-16 text-center">
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          İçerik Bulunamadı
                        </h3>
                        <p className="text-gray-500">
                          Önce "İçerik Üret" sekmesinden içerik oluşturun
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                      <CardContent className="pt-6">
                        <VisualGenerationTab
                          content={generatedContents[currentPreview].content}
                          platform={generatedContents[currentPreview].platform}
                          contentType={
                            generatedContents[currentPreview].contentType
                          }
                          onGenerateImage={async ({ message, settings, modelId }) => {
                            if (!editingContentId) {
                              toast.error("Lütfen önce içeriği kaydedin");
                              return;
                            }

                            setVisualGenerating(true);
                            try {
                              const response = await fetch(
                                "/api/admin/social-media/generate-visual",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    chatId: `content-studio-${editingContentId}`,
                                    message: message,
                                    contentId: editingContentId,
                                    settings: settings,
                                    modelId: modelId,
                                  }),
                                }
                              );

                              if (!response.ok) {
                                const error = await response.json();
                                throw new Error(
                                  error.error || "Görsel oluşturulamadı"
                                );
                              }

                              const data = await response.json();

                              if (
                                data.generatedImageUrls &&
                                data.generatedImageUrls.length > 0
                              ) {
                                const newImages = data.generatedImageUrls.map(
                                  (url) => ({
                                    url: url,
                                    createdAt: new Date().toISOString(),
                                    model: data.modelDisplayName || data.model,
                                    provider: data.provider,
                                  })
                                );

                                setAiGeneratedImages((prev) => [
                                  ...prev,
                                  ...newImages,
                                ]);
                                toast.success(
                                  `${data.generatedImageUrls.length} görsel oluşturuldu!`
                                );
                              } else {
                                toast.info(
                                  "Görsel oluşturuldu ancak URL alınamadı"
                                );
                              }
                            } catch (error) {
                              toast.error(
                                error.message || "Görsel oluşturma başarısız"
                              );
                            } finally {
                              setVisualGenerating(false);
                            }
                          }}
                          loading={visualGenerating}
                          generatedImages={aiGeneratedImages}
                          onDeleteImage={(index) => {
                            setAiGeneratedImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                            toast.success("Görsel listeden kaldırıldı");
                          }}
                          onSetAsMainImage={async (image, index) => {
                            if (!editingContentId) {
                              toast.error("İçerik ID bulunamadı");
                              return;
                            }

                            const confirmed = window.confirm(
                              "Bu görseli içeriğin ana görseli olarak ayarlamak istediğinize emin misiniz? Mevcut görsel değiştirilecektir."
                            );

                            if (!confirmed) return;

                            try {
                              // Extract filename from URL
                              const urlParts = image.url.split("/");
                              const filename = urlParts[urlParts.length - 1];

                              // Create image object matching the structure
                              const imageObject = {
                                url: image.url,
                                fileName: filename,
                                path: `gemini-generated/${editingContentId}/${filename}`,
                                type: "image/png",
                                size: 0, // We don't have size info
                              };

                              // Update in Firestore
                              const response = await fetch(
                                `/api/admin/social-media/content/${editingContentId}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    image: imageObject,
                                  }),
                                }
                              );

                              if (!response.ok) {
                                throw new Error("Görsel güncellenemedi");
                              }

                              // Update local state
                              const updated = [...generatedContents];
                              if (updated[currentPreview]) {
                                updated[currentPreview].image = imageObject;
                                setGeneratedContents(updated);
                              }

                              // Update preview
                              setImagePreview(image.url);
                              setSelectedImage({
                                preview: image.url,
                                ...imageObject,
                              });

                              toast.success("Ana görsel güncellendi!");
                            } catch (error) {
                              toast.error(
                                "Ana görsel güncellenemedi: " + error.message
                              );
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                        <Eye className="h-5 w-5 text-gray-700" />
                        Mobil Önizleme
                      </CardTitle>
                    </div>

                    {/* Show selected platform and content type */}
                    {selectedPlatform && selectedContentType && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge className="bg-gray-800 text-white">
                            {selectedPlatform}
                          </Badge>
                          <span className="text-gray-400">·</span>
                          <Badge variant="outline">{selectedContentType}</Badge>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <MobilePreview
                      platform={selectedPlatform || "instagram"}
                      contentType={selectedContentType || "post"}
                      content={
                        generatedContents[currentPreview]?.content || {
                          title: selectedTitle?.title || "Başlık seçin",
                        }
                      }
                      image={
                        videoPreview ||
                        (imagePreviews.length > 0
                          ? imagePreviews[0]
                          : imagePreview)
                      }
                      images={
                        imagePreviews.length > 0 ? imagePreviews : undefined
                      }
                      isVideo={!!videoPreview}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Prompt Preview Dialog */}
      <Dialog
        open={showFullPromptDialog}
        onOpenChange={setShowFullPromptDialog}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-700">
              <BookOpen className="h-5 w-5" />
              Prompt Önizleme - {selectedPlatform} / {selectedContentType}
            </DialogTitle>
            <DialogDescription>
              AI modeline gönderilecek tam prompt içeriği. Bu içerik
              Firestore'dan yüklenir.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {(() => {
              const key = getPlatformContentKey(
                selectedPlatform,
                selectedContentType
              );
              const cachedPrompt = platformPromptCache[key];

              if (!cachedPrompt) {
                return (
                  <div className="p-6 text-center text-gray-500">
                    <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Bu platform ve içerik tipi için prompt tanımlı değil.</p>
                    <p className="text-sm mt-1">
                      Platform: {selectedPlatform}, İçerik:{" "}
                      {selectedContentType}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Prompt Info */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <Cpu className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-purple-900">
                          {cachedPrompt.name || cachedPrompt.promptKey}
                        </div>
                        {cachedPrompt.description && (
                          <div className="text-xs text-purple-600">
                            {cachedPrompt.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cachedPrompt.version && (
                        <Badge variant="outline" className="text-xs">
                          v{cachedPrompt.version}
                        </Badge>
                      )}
                      {cachedPrompt.category && (
                        <Badge variant="secondary" className="text-xs">
                          {cachedPrompt.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* System Prompt */}
                  {cachedPrompt.systemPrompt && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        System Prompt
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {cachedPrompt.systemPrompt.length} karakter
                        </Badge>
                      </Label>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        <pre className="text-sm text-purple-900 whitespace-pre-wrap font-mono leading-relaxed">
                          {cachedPrompt.systemPrompt}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* User Prompt Template - Değişkenler değiştirilmiş */}
                  {(cachedPrompt.userPromptTemplate ||
                    cachedPrompt.content) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        User Prompt (Değerler Atanmış)
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {
                            replacePromptVariables(
                              cachedPrompt.userPromptTemplate ||
                                cachedPrompt.content
                            ).length
                          }{" "}
                          karakter
                        </Badge>
                      </Label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-[250px] overflow-y-auto">
                        <pre className="text-sm text-blue-900 whitespace-pre-wrap font-mono leading-relaxed">
                          {replacePromptVariables(
                            cachedPrompt.userPromptTemplate ||
                              cachedPrompt.content
                          )}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* AI Settings Summary */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Gönderilecek AI Ayarları
                    </Label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-xs text-gray-500">Model</div>
                          <div className="font-medium text-gray-900 truncate">
                            {currentModel?.displayName ||
                              currentModel?.name ||
                              aiModel}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-xs text-gray-500">Provider</div>
                          <div className="font-medium text-gray-900">
                            {currentProvider?.icon} {currentProvider?.name}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-xs text-gray-500">
                            Temperature
                          </div>
                          <div className="font-medium text-gray-900">
                            {temperature.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-xs text-gray-500">
                            Max Tokens
                          </div>
                          <div
                            className={`font-medium ${
                              isThinkingModel()
                                ? "text-amber-600"
                                : "text-gray-900"
                            }`}
                          >
                            {maxTokens.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {isThinkingModel() && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          Thinking model: Düşünme aşaması için ekstra token
                          ayrıldı.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowFullPromptDialog(false)}
            >
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
