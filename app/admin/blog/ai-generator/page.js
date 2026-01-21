"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
// Unified AI hook - dinamik Firestore konfigürasyonu
import {
  useUnifiedAI,
  AI_CONTEXTS,
  AI_PROVIDER_TYPES,
} from "../../../../hooks/use-unified-ai";
import {
  getAllBlogCategories,
  addBlogPost,
} from "../../../../lib/services/blog-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeftIcon,
  SparklesIcon,
  Loader2,
  RefreshCw,
  Eye,
  Save,
  Brain,
  FileText,
  Lightbulb,
  Target,
  Edit,
  Settings,
  CheckCircle,
  Cpu,
  Zap,
  Globe,
  Clock,
  BarChart3,
  Sparkles,
  Wand2,
  Bot,
  Code,
  ImageIcon,
  PenTool,
  Info,
  Workflow,
  AlertTriangle,
  Database,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { SmartImageSelection } from "@/components/smart-image-selection";

// AI Content Settings - Bu ayarlar Firestore'daki contentSettings ile birleştirilecek
const AI_CONTENT_SETTINGS = {
  creativity: {
    label: "Yaratıcılık Seviyesi",
    description: "İçeriğin ne kadar yaratıcı ve özgün olacağını belirler",
    min: 0,
    max: 100,
    step: 10,
    default: 70,
  },
  technicality: {
    label: "Teknik Detay Seviyesi",
    description: "İçeriğe dahil edilecek teknik bilgi miktarı",
    min: 0,
    max: 100,
    step: 10,
    default: 60,
  },
  seoOptimization: {
    label: "SEO Optimizasyonu",
    description: "Anahtar kelime yoğunluğu ve SEO odağı",
    min: 0,
    max: 100,
    step: 10,
    default: 80,
  },
  readability: {
    label: "Okunabilirlik",
    description: "Metnin anlaşılabilirlik seviyesi",
    min: 0,
    max: 100,
    step: 10,
    default: 75,
  },
};

// Import servisler
import {
  estimateReadingTime,
  generateSlug,
  generateTags,
  mockGeneratedBlog,
  processBlogContent,
  convertMarkdownToHtml,
} from "../../../../lib/services/ai-blog-service";
import { htmlToMarkdown } from "../../../../lib/services/markdown-to-html";
import {
  parseAiJsonResponse,
  validateBlogData,
} from "../../../../lib/services/json-parser";
import {
  TOPIC_CATEGORIES,
  BLOG_SETTINGS_CONFIG,
} from "../../../../lib/data/blog-topics";
import {
  getAllTitleDatasets,
  getAvailableTitles,
  markTitleAsUsed,
  DEFAULT_TITLE_CATEGORIES,
} from "../../../../lib/services/blog-title-service";
import TitleUsageTracker from "../../../../components/admin/title-usage-tracker";

// Provider renkleri ve ikonları
const PROVIDER_COLORS = {
  claude: "bg-gradient-to-r from-purple-500 to-indigo-600",
  gemini: "bg-gradient-to-r from-blue-500 to-cyan-600",
  openai: "bg-gradient-to-r from-green-500 to-emerald-600",
};

const PROVIDER_ICONS = {
  claude: Brain,
  gemini: Cpu,
  openai: Zap,
};

export default function AIBlogGeneratorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();

  // Unified AI Hook - Firestore'dan dinamik config
  const {
    config: aiConfig,
    availableModels,
    modelsByProvider,
    selectedModel: currentModel,
    currentProvider,
    generateContent: unifiedGenerate,
    selectModel,
    loading: aiLoading,
    configLoading,
    error: aiError,
    isReady: aiIsReady,
    hasModels,
    refresh: refreshAIConfig,
    getProviderIcon,
    prompt: firestorePrompt, // Firestore'dan gelen prompt
  } = useUnifiedAI(AI_CONTEXTS.BLOG_GENERATION);

  // Blog improvement için ayrı hook
  const {
    generateContent: improveContent,
    loading: improvementLoading,
    prompt: improvementPrompt, // Firestore'dan improvement prompt'u
  } = useUnifiedAI(AI_CONTEXTS.BLOG_IMPROVEMENT);

  // Ana state'ler
  const [activeTab, setActiveTab] = useState("setup");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [customTopic, setCustomTopic] = useState("");

  // Firestore Title Management States
  const [titleDatasets, setTitleDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [availableTitles, setAvailableTitles] = useState([]);
  const [titlesByCategory, setTitlesByCategory] = useState({});
  const [useFirestoreTitles, setUseFirestoreTitles] = useState(true);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [aiMetadata, setAiMetadata] = useState(null); // AI üretim metadata'sı
  const [finalPrompt, setFinalPrompt] = useState(null); // Final prompt (değişkenler uygulandıktan sonra)
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // AI improvement modal states
  const [showImproveModal, setShowImproveModal] = useState(false);
  const [improving, setImproving] = useState(false);

  // AI Model Configuration - Firestore'dan gelen değerlerle senkronize
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [temperature, setTemperature] = useState(0.8);

  // AI Content Settings - Firestore'dan gelen contentSettings ile merge edilir
  const [aiSettings, setAiSettings] = useState({
    creativity: 70,
    technicality: 60,
    seoOptimization: 80,
    readability: 75,
  });

  /**
   * Firestore'dan gelen prompt template'ine değişkenleri yerleştir
   * Önce 'content' alanına, yoksa 'userPromptTemplate' alanına bakar
   * @param {object} variables - Değişkenler objesi
   * @returns {string} - Değişkenler uygulanmış prompt
   */
  const applyPromptVariables = useCallback(
    (variables = {}) => {
      // Prompt içeriğini al - content veya userPromptTemplate
      const promptTemplate =
        firestorePrompt?.content || firestorePrompt?.userPromptTemplate;

      if (!promptTemplate) {
        return "⚠️ Prompt yüklenemedi. Lütfen Firestore'da 'ai_prompts/blog_generation' dökümanını kontrol edin.";
      }

      let promptContent = promptTemplate;

      // Değişkenleri uygula
      const allVariables = {
        topic: variables.topic || "[Konu seçilmedi]",
        keywords: variables.keywords || "",
        length: variables.length || "medium",
        tone: variables.tone || "professional",
        ...variables,
      };

      // {{variable}} formatındaki değişkenleri değiştir
      Object.entries(allVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
        promptContent = promptContent.replace(regex, String(value));
      });

      // Conditional blocks için basit işleme
      // {{#if length === 'short'}}...{{/if}} formatı
      promptContent = promptContent.replace(
        /\{\{#if length === 'short'\}\}([\s\S]*?)\{\{\/if\}\}/g,
        allVariables.length === "short" ? "$1" : ""
      );
      promptContent = promptContent.replace(
        /\{\{#if length === 'medium'\}\}([\s\S]*?)\{\{\/if\}\}/g,
        allVariables.length === "medium" ? "$1" : ""
      );
      promptContent = promptContent.replace(
        /\{\{#if length === 'long'\}\}([\s\S]*?)\{\{\/if\}\}/g,
        allVariables.length === "long" ? "$1" : ""
      );

      return promptContent;
    },
    [firestorePrompt]
  );

  // Firestore config yüklendiğinde state'leri güncelle
  useEffect(() => {
    if (aiConfig) {
      // Content settings
      if (aiConfig.contentSettings) {
        setAiSettings((prev) => ({
          ...prev,
          ...aiConfig.contentSettings,
        }));
      }
      // Temperature ve maxTokens
      if (aiConfig.settings) {
        if (aiConfig.settings.temperature)
          setTemperature(aiConfig.settings.temperature);
        if (aiConfig.settings.maxTokens)
          setMaxTokens(aiConfig.settings.maxTokens);
      }
    }
    // Default model seçimi
    if (currentModel && !selectedModelId) {
      setSelectedModelId(currentModel.modelId);
    }
  }, [aiConfig, currentModel, selectedModelId]);

  // Mevcut seçili model bilgisi - Firestore veya state'den
  const activeModel = useMemo(() => {
    if (!availableModels.length) return null;
    const found = availableModels.find((m) => m.value === selectedModelId);
    if (found) return found;
    // Default model
    return availableModels[0] || null;
  }, [availableModels, selectedModelId]);

  // Model değiştirme handler
  const handleModelChange = async (modelId) => {
    setSelectedModelId(modelId);
    await selectModel(modelId);

    // Model ayarlarını güncelle
    const model = availableModels.find((m) => m.value === modelId);
    if (model?.settings) {
      if (model.settings.defaultMaxTokens)
        setMaxTokens(model.settings.defaultMaxTokens);
      if (model.settings.defaultTemperature)
        setTemperature(model.settings.defaultTemperature);
    }
  };

  // Blog ayarları
  const [blogDetails, setBlogDetails] = useState({
    targetKeywords: "",
    tone: "professional",
    length: "medium",
    includeStats: true,
    includeMKNInfo: true,
    includeCallToAction: true,
    includeImages: true,
    autoSelectImage: true,
    includeInfographics: false,
    multiLanguage: false,
  });

  // Düzenleme modunda blog verisi
  const [editableBlog, setEditableBlog] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    categorySlug: "",
    author: user?.name || "MKN Group Uzmanları",
    featured: false,
    image: "",
    imageAlt: "",
    imageCredit: "",
    tags: "",
    metaDescription: "",
  });

  // Edit view mode - HTML or Markdown
  const [editViewMode, setEditViewMode] = useState("html");

  // Kategorileri yükle
  const loadCategories = async () => {
    try {
      const categoriesData = await getAllBlogCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kategoriler yüklenirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Title datasets yükle
  const loadTitleDatasets = async () => {
    try {
      setLoadingTitles(true);
      const datasets = await getAllTitleDatasets({ activeOnly: true });
      setTitleDatasets(datasets);

      // İlk aktif dataset'i seç
      if (datasets.length > 0 && !selectedDataset) {
        setSelectedDataset(datasets[0].id);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Başlık datasets yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoadingTitles(false);
    }
  };

  // Seçilen dataset'e göre başlıkları yükle
  const loadTitlesForDataset = async (datasetId, categoryKey = null) => {
    if (!datasetId) return;

    try {
      setLoadingTitles(true);
      const titles = await getAvailableTitles(datasetId, categoryKey);

      if (categoryKey) {
        setTitlesByCategory((prev) => ({
          ...prev,
          [categoryKey]: titles.filter((t) => t.categoryKey === categoryKey),
        }));
      } else {
        setAvailableTitles(titles);

        // Kategori bazında grupla
        const grouped = {};
        titles.forEach((title) => {
          if (!grouped[title.categoryKey]) {
            grouped[title.categoryKey] = [];
          }
          grouped[title.categoryKey].push(title);
        });
        setTitlesByCategory(grouped);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Başlıklar yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoadingTitles(false);
    }
  };

  // Başlık kullanıldığını işaretle
  const handleTitleUsed = async (categoryKey, title, blogData = {}) => {
    if (!selectedDataset) return;

    try {
      await markTitleAsUsed(selectedDataset, categoryKey, title, {
        userId: user?.uid || user?.id,
        blogPostId: blogData.id,
        blogSlug: blogData.slug,
        usageType: "blog_generation",
        aiModel: selectedModelId,
      });

      // Başlıkları yenile
      await loadTitlesForDataset(selectedDataset);
    } catch (error) {
      // Silent fail for usage tracking
    }
  };

  // Mock data test function - enhanced
  const loadMockData = () => {
    const mockData = {
      ...mockGeneratedBlog,
      aiModel: selectedModelId,
      aiModelName: activeModel?.label,
      aiProvider: currentProvider?.id,
      aiSettings: aiSettings,
      generatedAt: new Date().toISOString(),
      readingTime: 5,
      tags: "fason üretim, kozmetik ambalajı, MKN Group, sürdürülebilir ambalaj, plastik şişe",
      metaDescription:
        "MKN Group'un fason üretim hizmetleri ve kozmetik ambalaj çözümleri hakkında kapsamlı bilgiler. Profesyonel ambalaj üretim süreçleri.",
    };

    setGeneratedBlog(mockData);
    setSelectedCategory("ambalaj");
    setSelectedTopics([
      "Fason Üretim Avantajları",
      "Kozmetik Ambalaj Trendleri",
    ]);

    // Otomatik görsel seçimi test
    if (blogDetails.autoSelectImage) {
      handleAutoImageSelection(mockData);
    }

    setActiveTab("preview");

    toast({
      title: "🎉 Test Verisi Yüklendi!",
      description: `${
        activeModel?.label || "AI"
      } ile test blog verisi başarıyla yüklendi.`,
      variant: "default",
      duration: 4000,
    });
  };

  // Modal tabanlı metin güzelleştirme fonksiyonu
  const handleImproveContent = async () => {
    if (!editableBlog.content) {
      toast({
        title: "Hata",
        description: "Güzelleştirilecek içerik bulunamadı!",
        variant: "destructive",
      });
      return;
    }

    setShowImproveModal(true);
  };

  // AI ile içerik iyileştirme - Unified AI Service kullanır
  const performContentImprovement = async () => {
    setImproving(true);
    setShowImproveModal(false);

    try {
      // Firestore'dan gelen improvement prompt'unu kullan
      let improvePrompt = "";
      if (improvementPrompt?.content) {
        // Prompt template'ine içeriği ekle
        improvePrompt = improvementPrompt.content.replace(
          /\{\{content\}\}/gi,
          editableBlog.content
        );
      } else {
        // Fallback - basit prompt
        improvePrompt = `Aşağıdaki blog içeriğini iyileştir. Daha akıcı, SEO uyumlu ve okunabilir hale getir. Sadece iyileştirilmiş HTML içeriği döndür:\n\n${editableBlog.content}`;
      }

      // Unified AI Service ile iyileştirme
      const result = await improveContent(improvePrompt, {
        temperature: 0.5,
        maxTokens: 4096,
      });

      if (!result.success) {
        throw new Error(result.error || "İçerik iyileştirilemedi");
      }

      setEditableBlog({
        ...editableBlog,
        content: result.content,
        readingTime: estimateReadingTime(result.content),
      });

      toast({
        title: "İçerik İyileştirildi",
        description: `${
          result.metadata?.modelName || "AI"
        } ile içerik başarıyla güzelleştirildi!`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "İçerik iyileştirme sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setImproving(false);
    }
  };

  // Etiketleri otomatik üret
  const handleGenerateTags = () => {
    const generatedTags = generateTags(
      editableBlog.content,
      editableBlog.title,
      editableBlog.excerpt,
      selectedCategory
    );

    setEditableBlog({
      ...editableBlog,
      tags: generatedTags,
    });

    toast({
      title: "Etiketler Oluşturuldu",
      description: "İçerik analizi yapılarak uygun etiketler üretildi.",
      variant: "default",
    });
  };

  // Smart generation progress simulation
  const simulateProgress = () => {
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 800);
    return interval;
  };

  // Enhanced blog generation with progress tracking and title usage
  // Şimdi Unified AI Service kullanıyor - Firestore'dan dinamik config
  const generateBlog = async () => {
    if (
      !useFirestoreTitles &&
      selectedTopics.length === 0 &&
      !customTopic.trim()
    ) {
      toast({
        title: "❌ Hata",
        description: "Lütfen en az bir konu seçin veya özel konu girin.",
        variant: "destructive",
      });
      return;
    }

    if (
      useFirestoreTitles &&
      selectedTopics.length === 0 &&
      !customTopic.trim()
    ) {
      toast({
        title: "❌ Hata",
        description: "Lütfen en az bir başlık seçin veya özel konu girin.",
        variant: "destructive",
      });
      return;
    }

    // AI ready kontrolü
    if (!aiIsReady) {
      toast({
        title: "⏳ Bekleyin",
        description: "AI servisi hazırlanıyor, lütfen bekleyin...",
        variant: "default",
      });
      return;
    }

    const progressInterval = simulateProgress();

    try {
      const topics = selectedTopics.length > 0 ? selectedTopics : [];
      const allTopics = [...topics];
      if (customTopic.trim()) {
        allTopics.push(customTopic.trim());
      }

      // Firestore prompt kontrolü
      if (!firestorePrompt) {
        toast({
          title: "⏳ Bekleyin",
          description:
            "Prompt henüz yüklenmedi. Lütfen birkaç saniye bekleyip tekrar deneyin.",
          variant: "default",
        });
        return;
      }

      // Firestore'dan gelen prompt'a değişkenleri uygula
      const promptVariables = {
        topic: allTopics.join(", "),
        keywords: blogDetails.targetKeywords || "",
        length: blogDetails.length,
        tone: blogDetails.tone,
        creativity: aiSettings.creativity,
        technicality: aiSettings.technicality,
        seoOptimization: aiSettings.seoOptimization,
        readability: aiSettings.readability,
      };

      const prompt = applyPromptVariables(promptVariables);

      // Değişkenler uygulanmamışsa uyar
      if (prompt.includes("{{topic}}") || prompt.includes("{{length}}")) {
        toast({
          title: "⚠️ Prompt Hatası",
          description:
            "Değişkenler uygulanamadı. Sayfayı yenileyip tekrar deneyin.",
          variant: "destructive",
        });
        return;
      }

      // Final prompt'u kaydet (UI'da gösterilecek)
      setFinalPrompt(prompt);

      // Uzunluğa göre dinamik maxTokens hesapla
      // Türkçe: 1 kelime ≈ 2-2.5 token + JSON overhead
      // short: ~700 kelime ≈ 2000 token + 1000 overhead = 4096
      // medium: ~1250 kelime ≈ 3500 token + 1000 overhead = 6144
      // long: ~2200 kelime ≈ 6000 token + 2000 overhead = 12000
      const dynamicMaxTokens =
        blogDetails.length === "long"
          ? Math.max(maxTokens, 16384)
          : blogDetails.length === "medium"
          ? Math.max(maxTokens, 10240)
          : Math.max(maxTokens, 6144);

      // Unified AI Service ile içerik üret
      const result = await unifiedGenerate(prompt, {
        modelId: selectedModelId,
        maxTokens: dynamicMaxTokens,
        temperature: temperature,
        variables: {
          topic: allTopics.join(", "),
          keywords: blogDetails.targetKeywords,
          length: blogDetails.length,
          tone: blogDetails.tone,
        },
      });

      if (!result.success) {
        throw new Error(result.error || "AI yanıtı alınamadı");
      }

      // AI Metadata'yı kaydet (UI'da gösterilecek)
      if (result.aiMetadata) {
        setAiMetadata(result.aiMetadata);
      }

      let blogData;
      try {
        blogData = parseAiJsonResponse(result.content);
        blogData = validateBlogData(blogData);
      } catch (parseError) {
        throw new Error(`AI yanıtı işlenemedi: ${parseError.message}`);
      }

      // Process blog content with AI settings
      // NOT: Model bilgisini API sonucundan al (result.aiMetadata), seçili modelden değil!
      const actualModel = result.aiMetadata?.model;
      const processedBlog = {
        ...blogData,
        slug: generateSlug(blogData.title),
        readingTime: estimateReadingTime(blogData.content),
        topics: allTopics,
        selectedTitles: topics, // Firestore'dan seçilen başlıklar
        customTopic: customTopic.trim() || null,
        useFirestoreTitles,
        selectedDataset,
        selectedCategory,
        // Gerçek kullanılan model bilgisi (API sonucundan)
        aiModel: actualModel?.id || result.model || selectedModelId,
        aiModelName:
          actualModel?.name || result.apiModel || activeModel?.displayName,
        aiProvider:
          actualModel?.provider || result.provider || currentProvider?.id,
        aiProviderName: actualModel?.providerName || currentProvider?.name,
        aiApiId: actualModel?.apiId || result.apiModel,
        // Kullanılan ayarlar (API'ye gönderilen değerler)
        usedSettings: {
          temperature: temperature,
          maxTokens: dynamicMaxTokens,
          length: blogDetails.length,
          tone: blogDetails.tone,
        },
        aiSettings: aiSettings,
        aiMetadata: result.aiMetadata, // Detaylı AI bilgisi
        generatedAt: new Date().toISOString(),
      };

      setGenerationProgress(100);
      clearInterval(progressInterval);

      setTimeout(() => {
        setGeneratedBlog(processedBlog);
        setActiveTab("preview");

        toast({
          title: "🎉 Blog Oluşturuldu!",
          description: `${
            activeModel?.displayName || activeModel?.name || "AI"
          } ile blog yazısı başarıyla oluşturuldu.${
            useFirestoreTitles && selectedTopics.length > 0
              ? ` ${selectedTopics.length} başlık kullanıldı.`
              : ""
          }`,
          variant: "default",
          duration: 5000,
        });
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setGenerationProgress(0);
      toast({
        title: "Hata",
        description: `Blog üretilirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Blog kaydetme with title usage tracking
  const handleSaveBlog = async () => {
    try {
      setSaving(true);

      const blogData = {
        ...editableBlog,
        tags: editableBlog.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        metaDescription: editableBlog.metaDescription || editableBlog.excerpt,
        publishedAt: new Date().toISOString().split("T")[0],
        readingTime:
          generatedBlog?.readingTime ||
          estimateReadingTime(editableBlog.content),
      };

      const blogPostId = await addBlogPost(blogData);

      // Mark titles as used if they were from Firestore
      if (
        generatedBlog?.useFirestoreTitles &&
        generatedBlog?.selectedTitles &&
        generatedBlog?.selectedDataset &&
        generatedBlog?.selectedCategory
      ) {
        const titleUsagePromises = generatedBlog.selectedTitles.map((title) =>
          handleTitleUsed(generatedBlog.selectedCategory, title, {
            id: blogPostId,
            slug: editableBlog.slug,
          })
        );

        try {
          await Promise.all(titleUsagePromises);
        } catch (usageError) {
          // Don't fail the entire save operation for usage tracking errors
        }
      }

      setShowSaveDialog(false);

      // Formu temizle
      setGeneratedBlog(null);
      setSelectedTopics([]);
      setCustomTopic("");
      setEditableBlog({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        categorySlug: "",
        author: user?.name || "MKN Group Uzmanları",
        featured: false,
        image: "",
        imageAlt: "",
        imageCredit: "",
        tags: "",
        metaDescription: "",
      });
      setActiveTab("topics");

      toast({
        title: "Blog Kaydedildi",
        description: `Blog yazısı başarıyla kaydedildi ve yayınlandı.${
          generatedBlog?.useFirestoreTitles
            ? " Kullanılan başlıklar işaretlendi."
            : ""
        }`,
        variant: "default",
      });

      router.push("/admin/blog");
    } catch (error) {
      toast({
        title: "Hata",
        description: `Blog kaydedilirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Smart image selection handler
  const handleImageSelect = (image) => {
    setEditableBlog((prev) => ({
      ...prev,
      image: image.url,
      imageAlt: image.alt,
      imageCredit: `© ${image.photographer} - Pexels`,
    }));

    toast({
      title: "🎨 Görsel Seçildi",
      description: `"${image.alt}" görseli başarıyla seçildi.`,
      variant: "default",
    });
  };

  // Otomatik görsel seçimi - blog oluşturulduktan sonra çağrılır
  const handleAutoImageSelection = async (blogData) => {
    if (!blogDetails.autoSelectImage || !blogData.title) {
      return;
    }

    try {
      // Blog başlığı ve içeriğinden anahtar kelimeler çıkar
      const searchQuery = blogData.title
        .toLowerCase()
        .replace(/[^a-zığüşoçş\s]/gi, "")
        .split(" ")
        .filter((word) => word.length > 3)
        .slice(0, 3)
        .join(" ");

      // Smart image selection API'sini çağır
      const response = await fetch("/api/smart-image-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogTitle: blogData.title,
          blogContent: blogData.content || "",
          tags: blogData.tags
            ? blogData.tags.split(",").map((tag) => tag.trim())
            : [],
          searchQuery: searchQuery,
          autoSelect: true,
        }),
      });

      if (response.ok) {
        const imageData = await response.json();
        if (imageData.images && imageData.images.length > 0) {
          // İlk görseli otomatik seç
          const selectedImage = imageData.images[0];
          setEditableBlog((prev) => ({
            ...prev,
            image: selectedImage.url,
            imageAlt: selectedImage.alt,
            imageCredit: `© ${selectedImage.photographer} - Pexels`,
          }));

          toast({
            title: "🤖 Otomatik Görsel Seçildi",
            description: `"${selectedImage.alt}" görseli AI tarafından seçildi.`,
            variant: "default",
          });
        }
      }
    } catch (error) {
      // Hata durumunda sessizce devam et
    }
  };

  // useEffect'ler
  useEffect(() => {
    loadCategories();
    loadTitleDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      loadTitlesForDataset(selectedDataset);
    }
  }, [selectedDataset]);

  useEffect(() => {
    if (user?.name) {
      setEditableBlog((prev) => ({ ...prev, author: user.name }));
    }
  }, [user]);

  // GeneratedBlog değiştiğinde editableBlog'u güncelle
  useEffect(() => {
    if (generatedBlog) {
      const newEditableBlog = {
        title: generatedBlog.title || "",
        slug: generatedBlog.slug || "",
        excerpt: generatedBlog.excerpt || "",
        content: generatedBlog.content || "",
        category: selectedCategory
          ? categories.find((c) => c.slug === selectedCategory)?.name || ""
          : "",
        categorySlug: selectedCategory || "",
        author: user?.name || "MKN Group Uzmanları",
        featured: false,
        image: "",
        imageAlt: "",
        imageCredit: "",
        tags: generatedBlog.tags || "",
        metaDescription:
          generatedBlog.metaDescription || generatedBlog.excerpt || "",
      };

      setEditableBlog(newEditableBlog);
    }
  }, [generatedBlog, selectedCategory, categories, user?.name]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="blog.write">
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8">
            {/* Modern Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-white p-3 rounded-2xl shadow-lg">
                      <Bot className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      AI Blog Studio
                    </h1>
                    <p className="text-gray-600 mt-1 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      Profesyonel blog içerikleri oluşturun
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={loadMockData}
                    className="hover:bg-purple-50 hover:border-purple-300"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Test Verisi
                  </Button>
                  <Link href="/admin/blog">
                    <Button variant="outline" className="hover:bg-gray-50">
                      <ArrowLeftIcon className="mr-2 h-4 w-4" />
                      Geri Dön
                    </Button>
                  </Link>
                </div>
              </div>

              {/* AI Model Status Bar - Dinamik */}
              {activeModel && (
                <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          PROVIDER_COLORS[activeModel.provider] ||
                          "bg-gradient-to-r from-gray-500 to-gray-600"
                        }`}
                      >
                        {(() => {
                          const IconComponent =
                            PROVIDER_ICONS[activeModel.provider] || Cpu;
                          return (
                            <IconComponent className="h-4 w-4 text-white" />
                          );
                        })()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {activeModel.label} {activeModel.icon}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currentProvider?.name || activeModel.provider} •{" "}
                          {maxTokens} tokens
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Yaratıcılık:</span>{" "}
                        {aiSettings.creativity}%
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">SEO:</span>{" "}
                        {aiSettings.seoOptimization}%
                      </div>
                      {configLoading ? (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Yükleniyor
                        </Badge>
                      ) : aiIsReady ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Hazır
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-800"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Bağlantı Yok
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshAIConfig}
                        className="h-8 w-8 p-0"
                        title="AI ayarlarını yenile"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Config Loading State */}
              {configLoading && !activeModel && (
                <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                    <span className="text-gray-600">
                      AI konfigürasyonu yükleniyor...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-xl p-1 mb-8">
                <TabsTrigger
                  value="setup"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  AI Ayarları
                </TabsTrigger>
                <TabsTrigger
                  value="topics"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Konular
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg"
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  İçerik Ayarları
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  disabled={!generatedBlog}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Önizleme
                </TabsTrigger>
                <TabsTrigger
                  value="edit"
                  disabled={!generatedBlog}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </TabsTrigger>
              </TabsList>

              {/* AI Setup Sekmesi */}
              <TabsContent value="setup" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Model Selection - Dinamik Firestore */}
                  <Card className="border-purple-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-purple-700">
                        <Cpu className="mr-2 h-5 w-5" />
                        AI Model Seçimi
                        {configLoading && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        Blog üretimi için kullanılacak AI modelini seçin
                        {aiConfig?.name && (
                          <span className="block mt-1 text-xs text-purple-600">
                            📋 Konfigürasyon: {aiConfig.name}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Provider Filter */}
                      {hasModels && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {Object.keys(modelsByProvider || {}).map(
                            (providerId) => {
                              const providerNames = {
                                claude: "Anthropic Claude",
                                gemini: "Google Gemini",
                                openai: "OpenAI",
                              };
                              return (
                                <Badge
                                  key={providerId}
                                  variant="outline"
                                  className={`cursor-default ${
                                    activeModel?.provider === providerId
                                      ? "bg-purple-100 border-purple-500"
                                      : ""
                                  }`}
                                >
                                  {getProviderIcon(providerId)}{" "}
                                  {providerNames[providerId] || providerId}
                                </Badge>
                              );
                            }
                          )}
                        </div>
                      )}

                      {/* Model List */}
                      {configLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                          <span className="ml-2 text-gray-500">
                            Modeller yükleniyor...
                          </span>
                        </div>
                      ) : !hasModels ? (
                        <div className="text-center py-8 text-gray-500">
                          <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Henüz model tanımlı değil.</p>
                          <p className="text-sm mt-1">
                            Firestore'da ai_configurations/blog_generation
                            ayarlayın.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={refreshAIConfig}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Yenile
                          </Button>
                        </div>
                      ) : (
                        availableModels.map((model) => (
                          <div
                            key={model.id || model.modelId}
                            className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                              selectedModelId === (model.id || model.modelId)
                                ? "border-purple-500 bg-purple-50 shadow-md scale-[1.02]"
                                : "border-gray-200 hover:border-purple-300 hover:shadow-sm"
                            }`}
                            onClick={() =>
                              handleModelChange(model.id || model.modelId)
                            }
                          >
                            {model.recommended && (
                              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Önerilen
                              </Badge>
                            )}
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  PROVIDER_COLORS[model.provider] ||
                                  "bg-gray-500"
                                }`}
                              >
                                {(() => {
                                  const IconComponent =
                                    PROVIDER_ICONS[model.provider] || Cpu;
                                  return (
                                    <IconComponent className="h-5 w-5 text-white" />
                                  );
                                })()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {model.icon}{" "}
                                    {model.displayName || model.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {model.provider}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {model.description}
                                </p>
                                {model.capabilities && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Object.entries(model.capabilities)
                                      .filter(([_, v]) => v === true)
                                      .slice(0, 4)
                                      .map(([cap, _], idx) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-xs capitalize"
                                        >
                                          {cap
                                            .replace(/([A-Z])/g, " $1")
                                            .trim()}
                                        </Badge>
                                      ))}
                                  </div>
                                )}
                              </div>
                              {selectedModelId ===
                                (model.id || model.modelId) && (
                                <CheckCircle className="h-6 w-6 text-purple-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Parameters */}
                  <Card className="border-blue-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-700">
                        <Settings className="mr-2 h-5 w-5" />
                        AI Parametreleri
                      </CardTitle>
                      <CardDescription>
                        Model parametrelerini özelleştirin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center">
                          Maksimum Token Sayısı
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 ml-2 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Üretilecek içeriğin maksimum uzunluğunu
                                belirler.
                                <br />
                                Uzun içerik için en az 8192 token önerilir.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          {blogDetails.length === "long" &&
                            maxTokens < 8192 && (
                              <Badge
                                variant="destructive"
                                className="ml-2 text-xs"
                              >
                                ⚠️ Uzun içerik için yetersiz!
                              </Badge>
                            )}
                        </Label>
                        <Slider
                          value={[maxTokens]}
                          onValueChange={(value) => setMaxTokens(value[0])}
                          max={16384}
                          min={2000}
                          step={256}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>2,000</span>
                          <span className="font-medium text-blue-600">
                            {maxTokens.toLocaleString()}
                          </span>
                          <span>16,384</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          💡 Önerilen: Kısa=4096, Orta=6144, Uzun=8192+ (
                          {blogDetails.length === "long"
                            ? "8192+"
                            : blogDetails.length === "medium"
                            ? "6144"
                            : "4096"}{" "}
                          öneriliyor)
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center">
                          Temperature (Yaratıcılık)
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 ml-2 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                0.1 = Tutarlı ve mantıklı
                                <br />
                                0.9 = Yaratıcı ve çeşitli
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Slider
                          value={[temperature]}
                          onValueChange={(value) => setTemperature(value[0])}
                          max={1}
                          min={0.1}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0.1</span>
                          <span className="font-medium">{temperature}</span>
                          <span>1.0</span>
                        </div>
                      </div>

                      <Separator />

                      {/* AI Content Settings */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Wand2 className="mr-2 h-4 w-4" />
                          İçerik Ayarları
                        </h4>

                        {Object.entries(AI_CONTENT_SETTINGS).map(
                          ([key, setting]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center text-sm">
                                  {setting.label}
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="h-3 w-3 ml-2 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{setting.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  {aiSettings[key]}%
                                </Badge>
                              </div>
                              <Slider
                                value={[aiSettings[key]]}
                                onValueChange={(value) =>
                                  setAiSettings((prev) => ({
                                    ...prev,
                                    [key]: value[0],
                                  }))
                                }
                                max={setting.max}
                                min={setting.min}
                                step={setting.step}
                                className="w-full"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Live Prompt Preview */}
                  <Card className="border-slate-200 shadow-lg bg-slate-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-slate-700">
                        <FileText className="mr-2 h-5 w-5" />
                        Canlı Prompt Önizleme
                        <Badge variant="outline" className="ml-2 text-xs">
                          {firestorePrompt ? "Firestore" : "Yükleniyor..."}
                        </Badge>
                        {firestorePrompt?.version && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            v{firestorePrompt.version}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {firestorePrompt
                          ? `"${firestorePrompt.name}" - Seçimlerinize göre AI'a gönderilecek prompt`
                          : "Prompt yükleniyor..."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!firestorePrompt ? (
                        <div className="flex items-center justify-center p-8 text-slate-500">
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Firestore'dan prompt yükleniyor...
                        </div>
                      ) : (
                        <details className="group">
                          <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 flex items-center p-2 rounded-lg hover:bg-slate-100">
                            <Eye className="h-4 w-4 mr-2" />
                            Prompt'u Genişlet (Tıkla)
                          </summary>
                          <div className="mt-3 p-4 bg-slate-900 rounded-lg border border-slate-700 max-h-80 overflow-y-auto">
                            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                              {applyPromptVariables({
                                topic:
                                  selectedTopics.length > 0
                                    ? selectedTopics.join(", ")
                                    : customTopic || "[Konu seçilmedi]",
                                keywords: blogDetails.targetKeywords || "",
                                length: blogDetails.length,
                                tone: blogDetails.tone,
                                creativity: aiSettings.creativity,
                                technicality: aiSettings.technicality,
                                seoOptimization: aiSettings.seoOptimization,
                                readability: aiSettings.readability,
                              })}
                            </pre>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                            <span>
                              📊 Yaklaşık{" "}
                              {applyPromptVariables({
                                topic:
                                  selectedTopics.length > 0
                                    ? selectedTopics.join(", ")
                                    : "test",
                                length: blogDetails.length,
                              }).length.toLocaleString()}{" "}
                              karakter
                            </span>
                            <span>🎯 Temperature: {temperature}</span>
                            <span>📝 Max Tokens: {maxTokens}</span>
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setActiveTab("topics")}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    Devam Et
                    <Lightbulb className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              {/* Konular Sekmesi - Firestore Integration */}
              <TabsContent value="topics" className="space-y-6">
                <Card className="border-green-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-700">
                      <Target className="mr-2 h-5 w-5" />
                      Konu Seçimi & Başlık Yönetimi
                    </CardTitle>
                    <CardDescription>
                      Firestore'dan başlık seçin veya özel konu girin.
                      Kullanılan başlıklar işaretlenir.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title Source Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <Label className="text-base font-medium text-blue-900">
                            Başlık Kaynağı
                          </Label>
                          <p className="text-sm text-blue-700">
                            Firestore'dan hazır başlıkları kullan veya özel konu
                            gir
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-blue-700">
                            Özel Konu
                          </span>
                          <Switch
                            checked={useFirestoreTitles}
                            onCheckedChange={setUseFirestoreTitles}
                          />
                          <span className="text-sm text-blue-700">
                            Firestore
                          </span>
                        </div>
                      </div>

                      {/* Dataset Selection */}
                      {useFirestoreTitles && (
                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            Title Dataset
                          </Label>
                          <Select
                            value={selectedDataset}
                            onValueChange={setSelectedDataset}
                          >
                            <SelectTrigger className="border-green-200 focus:border-green-500">
                              <SelectValue placeholder="Dataset seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {titleDatasets.map((dataset) => (
                                <SelectItem key={dataset.id} value={dataset.id}>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>{dataset.name}</span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {dataset.totalTitles -
                                        (dataset.usedTitles || 0)}{" "}
                                      kalan
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {titleDatasets.length === 0 && (
                            <p className="text-sm text-amber-600">
                              ⚠️ Aktif title dataset bulunamadı. Yeni dataset
                              oluşturmak için Title Yönetimi'ni kullanın.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {useFirestoreTitles ? (
                          <>
                            <div className="space-y-2">
                              <Label className="text-base font-medium">
                                Konu Kategorisi
                              </Label>
                              <Select
                                value={selectedCategory}
                                onValueChange={(value) => {
                                  setSelectedCategory(value);
                                  setSelectedTopics([]); // Reset selections
                                }}
                              >
                                <SelectTrigger className="border-green-200 focus:border-green-500">
                                  <SelectValue placeholder="Kategori seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DEFAULT_TITLE_CATEGORIES.map((category) => (
                                    <SelectItem
                                      key={category.key}
                                      value={category.key}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span>{category.icon}</span>
                                        <span>{category.name}</span>
                                        {titlesByCategory[category.key] && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {
                                              titlesByCategory[category.key]
                                                .length
                                            }{" "}
                                            başlık
                                          </Badge>
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedCategory &&
                              selectedDataset &&
                              titlesByCategory[selectedCategory] && (
                                <div className="space-y-3">
                                  <Label className="text-base font-medium flex items-center justify-between">
                                    <span>
                                      Kullanılabilir Başlıklar (
                                      {
                                        titlesByCategory[selectedCategory]
                                          .length
                                      }{" "}
                                      adet)
                                    </span>
                                    {loadingTitles && (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                  </Label>
                                  <TitleUsageTracker
                                    titles={titlesByCategory[
                                      selectedCategory
                                    ].map((title) => ({
                                      title: title.title,
                                      isUsed: false, // Bu başlıklar available titles'dan geldiği için kullanılmamış
                                      usageCount: 0,
                                      lastUsedAt: null,
                                      usages: [],
                                    }))}
                                    categoryKey={selectedCategory}
                                    categoryName={
                                      DEFAULT_TITLE_CATEGORIES.find(
                                        (c) => c.key === selectedCategory
                                      )?.name
                                    }
                                    datasetId={selectedDataset}
                                    onTitleSelect={(titleData) => {
                                      const topic = titleData.title;
                                      if (selectedTopics.includes(topic)) {
                                        setSelectedTopics(
                                          selectedTopics.filter(
                                            (t) => t !== topic
                                          )
                                        );
                                      } else {
                                        setSelectedTopics([
                                          ...selectedTopics,
                                          topic,
                                        ]);
                                      }
                                    }}
                                    selectedTitle={
                                      selectedTopics.length > 0
                                        ? selectedTopics[
                                            selectedTopics.length - 1
                                          ]
                                        : null
                                    }
                                    compact={true}
                                    showUsageDetails={false}
                                    className="max-h-60 overflow-y-auto"
                                  />
                                </div>
                              )}

                            {selectedCategory &&
                              selectedDataset &&
                              (!titlesByCategory[selectedCategory] ||
                                titlesByCategory[selectedCategory].length ===
                                  0) &&
                              !loadingTitles && (
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    <p className="text-amber-800 font-medium">
                                      Bu kategoride kullanılabilir başlık yok
                                    </p>
                                  </div>
                                  <p className="text-amber-700 text-sm mt-1">
                                    Bu kategori için tüm başlıklar kullanılmış
                                    veya dataset'te bu kategori mevcut değil.
                                  </p>
                                </div>
                              )}
                          </>
                        ) : (
                          // Manual Topic Entry
                          <>
                            <div className="space-y-2">
                              <Label className="text-base font-medium">
                                Konu Kategorisi (Referans)
                              </Label>
                              <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                              >
                                <SelectTrigger className="border-green-200 focus:border-green-500">
                                  <SelectValue placeholder="Kategori seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DEFAULT_TITLE_CATEGORIES.map((category) => (
                                    <SelectItem
                                      key={category.key}
                                      value={category.key}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span>{category.icon}</span>
                                        <span>{category.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedCategory && (
                              <div className="space-y-3">
                                <Label className="text-base font-medium">
                                  Örnek Konular (Referans)
                                </Label>
                                <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                                  {TOPIC_CATEGORIES[selectedCategory]?.topics
                                    .slice(0, 5)
                                    .map((topic, index) => (
                                      <div
                                        key={index}
                                        className="p-2 bg-gray-100 rounded border text-sm text-gray-600"
                                      >
                                        💡 {topic}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Custom Topic Entry - Always visible */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="customTopic"
                            className="text-base font-medium"
                          >
                            {useFirestoreTitles
                              ? "Ek Özel Konu (Opsiyonel)"
                              : "Özel Konu / Araştırma Talebi"}
                          </Label>
                          <Textarea
                            id="customTopic"
                            placeholder={
                              useFirestoreTitles
                                ? "Seçilen başlıklara ek olarak özel bir konu eklemek isterseniz..."
                                : "Örn: 'Sürdürülebilir ambalaj trendleri 2024', 'Kozmetik sektöründe yenilikçi çözümler'..."
                            }
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            rows={useFirestoreTitles ? 4 : 6}
                            className="border-gray-200 focus:border-green-500 resize-none"
                          />
                          <p className="text-xs text-gray-500">
                            {useFirestoreTitles
                              ? "Bu konu seçilen başlıklarla birlikte kullanılacak"
                              : "Detaylı açıklamalar daha iyi sonuçlar verir"}
                          </p>
                        </div>

                        {/* Seçilen konuların özeti */}
                        {(selectedTopics.length > 0 || customTopic.trim()) && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2 flex items-center">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Seçim Özeti
                            </h4>
                            <div className="space-y-2 text-sm">
                              {selectedTopics.length > 0 && (
                                <div>
                                  <span className="font-medium text-green-700">
                                    {useFirestoreTitles
                                      ? "Seçilen Başlıklar"
                                      : "Önerilen Konular"}
                                    :
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedTopics.map((topic, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="bg-green-200 text-green-800"
                                      >
                                        {useFirestoreTitles && (
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                        )}
                                        {topic.length > 50
                                          ? `${topic.substring(0, 50)}...`
                                          : topic}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {customTopic.trim() && (
                                <div>
                                  <span className="font-medium text-green-700">
                                    Özel Konu:
                                  </span>
                                  <p className="text-green-600 mt-1 text-xs">
                                    {customTopic.substring(0, 100)}
                                    {customTopic.length > 100 && "..."}
                                  </p>
                                </div>
                              )}

                              {useFirestoreTitles &&
                                selectedDataset &&
                                selectedTopics.length > 0 && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                    <div className="flex items-center space-x-2 text-blue-700">
                                      <Database className="h-3 w-3" />
                                      <span className="text-xs font-medium">
                                        Seçilen başlıklar kullanım için
                                        işaretlenecek
                                      </span>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}

                        {/* Firestore dataset stats */}
                        {useFirestoreTitles &&
                          selectedDataset &&
                          titleDatasets.length > 0 && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              {(() => {
                                const dataset = titleDatasets.find(
                                  (d) => d.id === selectedDataset
                                );
                                return dataset ? (
                                  <div className="text-sm">
                                    <div className="font-medium text-blue-900 mb-1">
                                      Dataset: {dataset.name}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-blue-700">
                                      <div>
                                        <span className="font-medium">
                                          Toplam:
                                        </span>{" "}
                                        {dataset.totalTitles}
                                      </div>
                                      <div>
                                        <span className="font-medium">
                                          Kullanılan:
                                        </span>{" "}
                                        {dataset.usedTitles || 0}
                                      </div>
                                      <div>
                                        <span className="font-medium">
                                          Kalan:
                                        </span>{" "}
                                        {dataset.totalTitles -
                                          (dataset.usedTitles || 0)}
                                      </div>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          )}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("setup")}
                        className="hover:bg-gray-50"
                      >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        AI Ayarları
                      </Button>

                      <div className="text-sm text-gray-500">
                        {(() => {
                          const hasSelectedTopics = selectedTopics.length > 0;
                          const hasCustomTopic = customTopic.trim();
                          const hasAnyContent =
                            hasSelectedTopics || hasCustomTopic;

                          if (hasAnyContent) {
                            const parts = [];
                            if (hasSelectedTopics)
                              parts.push(
                                `${selectedTopics.length} başlık seçildi`
                              );
                            if (hasCustomTopic) parts.push("özel konu");
                            return `✓ ${parts.join(" + ")}`;
                          }
                          return "⚠ Hiç konu seçilmedi";
                        })()}
                      </div>

                      <Button
                        onClick={() => setActiveTab("content")}
                        disabled={
                          selectedTopics.length === 0 && !customTopic.trim()
                        }
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      >
                        Devam Et
                        <PenTool className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* İçerik Ayarları Sekmesi */}
              <TabsContent value="content" className="space-y-6">
                <Card className="border-blue-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
                      <PenTool className="mr-2 h-5 w-5" />
                      İçerik Ayarları & Özelleştirme
                    </CardTitle>
                    <CardDescription>
                      Blog yazısının tonu, uzunluğu ve özelliklerini belirleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Sol Kolon - Temel Ayarlar */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            <Code className="mr-2 h-4 w-4" />
                            Temel Ayarlar
                          </h3>

                          <div className="space-y-2">
                            <Label>Yazım Tonu</Label>
                            <Select
                              value={blogDetails.tone}
                              onValueChange={(value) =>
                                setBlogDetails({ ...blogDetails, tone: value })
                              }
                            >
                              <SelectTrigger className="border-blue-200 focus:border-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BLOG_SETTINGS_CONFIG.tones.map((tone) => (
                                  <SelectItem
                                    key={tone.value}
                                    value={tone.value}
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {tone.label}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {tone.description}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>İçerik Uzunluğu</Label>
                            <Select
                              value={blogDetails.length}
                              onValueChange={(value) => {
                                setBlogDetails({
                                  ...blogDetails,
                                  length: value,
                                });
                                // Uzunluğa göre önerilen maxTokens ayarla
                                const recommendedTokens =
                                  value === "long"
                                    ? 8192
                                    : value === "medium"
                                    ? 6144
                                    : 4096;
                                if (maxTokens < recommendedTokens) {
                                  setMaxTokens(recommendedTokens);
                                }
                              }}
                            >
                              <SelectTrigger className="border-blue-200 focus:border-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BLOG_SETTINGS_CONFIG.lengths.map((length) => (
                                  <SelectItem
                                    key={length.value}
                                    value={length.value}
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {length.label}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {length.description}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="targetKeywords">
                              Hedef Anahtar Kelimeler
                            </Label>
                            <Input
                              id="targetKeywords"
                              placeholder="Örn: fason üretim, kozmetik, MKN Group, sürdürülebilir ambalaj"
                              value={blogDetails.targetKeywords}
                              onChange={(e) =>
                                setBlogDetails({
                                  ...blogDetails,
                                  targetKeywords: e.target.value,
                                })
                              }
                              className="border-blue-200 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500">
                              Virgülle ayırarak birden fazla anahtar kelime
                              girebilirsiniz
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* İçerik Özellikleri */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            <Workflow className="mr-2 h-4 w-4" />
                            İçerik Özellikleri
                          </h3>
                          {BLOG_SETTINGS_CONFIG.features.map((feature) => (
                            <div
                              key={feature.key}
                              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-blue-900">
                                  {feature.label}
                                </div>
                                <div className="text-sm text-blue-700">
                                  {feature.description}
                                </div>
                              </div>
                              <Switch
                                checked={blogDetails[feature.key]}
                                onCheckedChange={(checked) =>
                                  setBlogDetails({
                                    ...blogDetails,
                                    [feature.key]: checked,
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sağ Kolon - Gelişmiş Özellikler */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Gelişmiş Özellikler
                          </h3>

                          {/* Görsel İçerik */}
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <div className="font-semibold text-purple-900 flex items-center mb-1">
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  Görsel İçerik Dahil Et
                                </div>
                                <div className="text-sm text-purple-700">
                                  Blog için otomatik görsel önerileri
                                </div>
                              </div>
                              <Switch
                                checked={blogDetails.includeImages}
                                onCheckedChange={(checked) =>
                                  setBlogDetails({
                                    ...blogDetails,
                                    includeImages: checked,
                                  })
                                }
                              />
                            </div>

                            {/* Otomatik Görsel Seçimi */}
                            {blogDetails.includeImages && (
                              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                                <div className="flex-1">
                                  <div className="font-medium text-purple-800 flex items-center text-sm">
                                    <Sparkles className="mr-2 h-3 w-3" />
                                    Otomatik Görsel Seçimi
                                  </div>
                                  <div className="text-xs text-purple-600">
                                    AI tarafından uygun görsel otomatik seçilsin
                                  </div>
                                </div>
                                <Switch
                                  checked={blogDetails.autoSelectImage}
                                  onCheckedChange={(checked) =>
                                    setBlogDetails({
                                      ...blogDetails,
                                      autoSelectImage: checked,
                                    })
                                  }
                                  size="sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* İnfografik */}
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex-1">
                              <div className="font-medium text-green-900 flex items-center">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                İnfografik Önerileri
                              </div>
                              <div className="text-sm text-green-700">
                                Veri görselleştirme önerileri ekle
                              </div>
                            </div>
                            <Switch
                              checked={blogDetails.includeInfographics}
                              onCheckedChange={(checked) =>
                                setBlogDetails({
                                  ...blogDetails,
                                  includeInfographics: checked,
                                })
                              }
                            />
                          </div>

                          {/* Çok Dil */}
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex-1">
                              <div className="font-medium text-orange-900 flex items-center">
                                <Globe className="mr-2 h-4 w-4" />
                                Çok Dil Desteği
                              </div>
                              <div className="text-sm text-orange-700">
                                İngilizce özet ve meta bilgiler
                              </div>
                            </div>
                            <Switch
                              checked={blogDetails.multiLanguage}
                              onCheckedChange={(checked) =>
                                setBlogDetails({
                                  ...blogDetails,
                                  multiLanguage: checked,
                                })
                              }
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* Üretim Önizlemesi */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            Üretim Önizlemesi
                          </h3>

                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Model</div>
                                <div className="font-medium text-gray-900">
                                  {activeModel?.label || "AI Model"}{" "}
                                  {activeModel?.icon}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Uzunluk</div>
                                <div className="font-medium text-gray-900">
                                  {
                                    BLOG_SETTINGS_CONFIG.lengths.find(
                                      (l) => l.value === blogDetails.length
                                    )?.label
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Ton</div>
                                <div className="font-medium text-gray-900">
                                  {
                                    BLOG_SETTINGS_CONFIG.tones.find(
                                      (t) => t.value === blogDetails.tone
                                    )?.label
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Özellikler</div>
                                <div className="font-medium text-gray-900">
                                  {
                                    Object.values(blogDetails).filter(
                                      (v) => v === true
                                    ).length
                                  }{" "}
                                  aktif
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("topics")}
                        className="hover:bg-gray-50"
                      >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Konular
                      </Button>

                      {/* Generation Progress */}
                      {aiLoading && (
                        <div className="flex items-center space-x-3 flex-1 max-w-md mx-4">
                          <div className="flex-1">
                            <Progress
                              value={generationProgress}
                              className="h-2"
                            />
                          </div>
                          <div className="text-sm font-medium text-purple-600">
                            {Math.round(generationProgress)}%
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={generateBlog}
                        disabled={aiLoading}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Üretiliyor...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            Blog Üret
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Önizleme Sekmesi - Modernize edilmiş */}
              <TabsContent value="preview" className="space-y-6">
                {generatedBlog && (
                  <Card className="border-indigo-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-indigo-700">
                        <Eye className="mr-2 h-5 w-5" />
                        Blog Önizlemesi
                        <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                          {/* Gerçek kullanılan model - API sonucundan */}
                          {generatedBlog.aiMetadata?.model?.name ||
                            generatedBlog.aiModelName ||
                            generatedBlog.aiModel ||
                            "AI"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {/* Gerçek kullanılan model */}
                        {generatedBlog.aiMetadata?.model?.name ||
                          generatedBlog.aiModelName ||
                          "AI"}{" "}
                        ile üretilen blog yazısını inceleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* AI Metadata Panel - Kullanılan AI Ayarları */}
                      {(aiMetadata || generatedBlog.aiMetadata) && (
                        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-slate-700 text-white mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center">
                              <Cpu className="mr-2 h-5 w-5 text-cyan-400" />
                              AI Üretim Detayları
                            </h3>
                            <Badge className="bg-green-500 text-white">
                              ✓ Başarılı
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Model Bilgisi */}
                            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                Model
                              </div>
                              <div className="font-semibold text-cyan-400">
                                {(aiMetadata || generatedBlog.aiMetadata)?.model
                                  ?.name || generatedBlog.aiModelName}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                API:{" "}
                                {(aiMetadata || generatedBlog.aiMetadata)?.model
                                  ?.apiId || generatedBlog.aiModel}
                              </div>
                            </div>

                            {/* Provider */}
                            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                Provider
                              </div>
                              <div className="font-semibold">
                                <span
                                  className={`${
                                    (aiMetadata || generatedBlog.aiMetadata)
                                      ?.model?.provider === "openai"
                                      ? "text-green-400"
                                      : (aiMetadata || generatedBlog.aiMetadata)
                                          ?.model?.provider === "claude"
                                      ? "text-purple-400"
                                      : (aiMetadata || generatedBlog.aiMetadata)
                                          ?.model?.provider === "gemini"
                                      ? "text-blue-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {(aiMetadata || generatedBlog.aiMetadata)
                                    ?.model?.provider === "openai"
                                    ? "🟢 "
                                    : (aiMetadata || generatedBlog.aiMetadata)
                                        ?.model?.provider === "claude"
                                    ? "🟣 "
                                    : (aiMetadata || generatedBlog.aiMetadata)
                                        ?.model?.provider === "gemini"
                                    ? "🔵 "
                                    : ""}
                                  {(aiMetadata || generatedBlog.aiMetadata)
                                    ?.model?.providerName ||
                                    generatedBlog.aiProvider}
                                </span>
                              </div>
                            </div>

                            {/* Süre */}
                            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                Üretim Süresi
                              </div>
                              <div className="font-semibold text-amber-400">
                                ⚡{" "}
                                {(aiMetadata || generatedBlog.aiMetadata)
                                  ?.performance?.duration || "N/A"}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                {new Date(
                                  (aiMetadata || generatedBlog.aiMetadata)
                                    ?.performance?.timestamp ||
                                    generatedBlog.generatedAt
                                ).toLocaleTimeString("tr-TR")}
                              </div>
                            </div>
                          </div>

                          {/* Ayarlar */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700">
                            <div className="text-center">
                              <div className="text-xs text-slate-400">
                                Temperature
                              </div>
                              <div className="font-mono text-sm text-yellow-400">
                                {(aiMetadata || generatedBlog.aiMetadata)
                                  ?.settings?.temperature || temperature}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-slate-400">
                                Max Tokens
                              </div>
                              <div className="font-mono text-sm text-blue-400">
                                {(aiMetadata || generatedBlog.aiMetadata)
                                  ?.settings?.maxTokens || maxTokens}
                              </div>
                            </div>
                            {(aiMetadata || generatedBlog.aiMetadata)
                              ?.prompt && (
                              <>
                                <div className="text-center">
                                  <div className="text-xs text-slate-400">
                                    Prompt
                                  </div>
                                  <div className="text-sm text-green-400 truncate">
                                    {
                                      (aiMetadata || generatedBlog.aiMetadata)
                                        ?.prompt?.name
                                    }
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-slate-400">
                                    Config
                                  </div>
                                  <div className="text-sm text-pink-400 truncate">
                                    {
                                      (aiMetadata || generatedBlog.aiMetadata)
                                        ?.config?.name
                                    }
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Final Prompt Görüntüleme */}
                          {finalPrompt && (
                            <details className="mt-4 pt-4 border-t border-slate-700">
                              <summary className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300 flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Final Prompt'u Görüntüle (
                                {finalPrompt.length.toLocaleString()} karakter)
                              </summary>
                              <div className="mt-3 p-4 bg-slate-950 rounded-lg border border-slate-600 max-h-96 overflow-y-auto">
                                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                                  {finalPrompt}
                                </pre>
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                                  onClick={() => {
                                    navigator.clipboard.writeText(finalPrompt);
                                    toast({
                                      title: "📋 Kopyalandı",
                                      description: "Prompt panoya kopyalandı",
                                    });
                                  }}
                                >
                                  📋 Kopyala
                                </Button>
                              </div>
                            </details>
                          )}
                        </div>
                      )}

                      {/* İstatistik kartları - Daha görsel */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-600">
                            {generatedBlog.readingTime || 0}
                          </div>
                          <div className="text-sm text-blue-600">
                            Dakika Okuma
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-600">
                            {generatedBlog.content?.split(" ").length || 0}
                          </div>
                          <div className="text-sm text-green-600">Kelime</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-600">
                            {generatedBlog.tags?.split(",").length || 0}
                          </div>
                          <div className="text-sm text-purple-600">Etiket</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                          <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-orange-600">
                            {Math.round(aiSettings.seoOptimization || 80)}
                          </div>
                          <div className="text-sm text-orange-600">
                            SEO Skoru
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 bg-gray-50 rounded-xl border">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Başlık
                          </h3>
                          <p className="text-xl text-gray-800 leading-relaxed">
                            {generatedBlog.title}
                          </p>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-xl border">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Özet
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {generatedBlog.excerpt}
                          </p>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-xl border">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Etiketler
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {generatedBlog.tags
                              ?.split(",")
                              .map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-indigo-100 text-indigo-800 px-3 py-1 text-sm"
                                >
                                  #{tag.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-xl border">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            İçerik Önizlemesi
                          </h3>
                          <div className="bg-white p-4 rounded-lg max-h-96 overflow-y-auto border-2 border-gray-200">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                              {generatedBlog.content?.substring(0, 1500)}
                              {generatedBlog.content?.length > 1500 && "..."}
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("content")}
                          className="hover:bg-gray-50"
                        >
                          <ArrowLeftIcon className="mr-2 h-4 w-4" />
                          İçerik Ayarları
                        </Button>
                        <Button
                          onClick={() => setActiveTab("edit")}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                        >
                          Düzenle
                          <Edit className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Düzenleme Sekmesi - Geliştirilmiş */}
              <TabsContent value="edit" className="space-y-6">
                {generatedBlog && (
                  <Card className="border-emerald-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-emerald-700">
                        <Edit className="mr-2 h-5 w-5" />
                        Blog Düzenleme & Optimizasyon
                      </CardTitle>
                      <CardDescription>
                        Blog içeriğini ihtiyaçlarınıza göre düzenleyin ve
                        optimize edin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Hızlı aksiyon butonları */}
                      <div className="flex flex-wrap gap-2 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleImproveContent}
                          disabled={
                            improving ||
                            improvementLoading ||
                            !editableBlog.content
                          }
                          className="border-emerald-300 hover:bg-emerald-100"
                        >
                          {improving || improvementLoading ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              İyileştiriliyor...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="mr-2 h-3 w-3" />
                              AI ile İyileştir
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateTags}
                          disabled={!editableBlog.content}
                          className="border-blue-300 hover:bg-blue-100"
                        >
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Etiket Üret
                        </Button>
                      </div>

                      {/* Düzenleme alanları - responsive grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Başlık ve Slug */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="editTitle"
                              className="text-base font-medium"
                            >
                              Başlık
                            </Label>
                            <Input
                              id="editTitle"
                              value={editableBlog.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setEditableBlog({
                                  ...editableBlog,
                                  title: newTitle,
                                  slug: generateSlug(newTitle),
                                });
                              }}
                              className="border-emerald-200 focus:border-emerald-500"
                            />
                            <Progress
                              value={Math.min(
                                ((editableBlog.title?.length || 0) / 60) * 100,
                                100
                              )}
                              className="h-2"
                            />
                            <p className="text-xs text-gray-500">
                              {editableBlog.title?.length || 0}/60 karakter (SEO
                              için ideal)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="editSlug"
                              className="text-base font-medium"
                            >
                              URL Slug
                            </Label>
                            <Input
                              id="editSlug"
                              value={editableBlog.slug}
                              onChange={(e) =>
                                setEditableBlog({
                                  ...editableBlog,
                                  slug: e.target.value,
                                })
                              }
                              className="border-emerald-200 focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        {/* Kategori ve Etiketler */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="editCategory"
                              className="text-base font-medium"
                            >
                              Kategori
                            </Label>
                            <Select
                              value={editableBlog.categorySlug}
                              onValueChange={(value) => {
                                const category = categories.find(
                                  (c) => c.slug === value
                                );
                                setEditableBlog({
                                  ...editableBlog,
                                  category: category?.name || "",
                                  categorySlug: value,
                                });
                              }}
                            >
                              <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category.slug}
                                    value={category.slug}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="editTags"
                              className="text-base font-medium"
                            >
                              Etiketler
                            </Label>
                            <Input
                              id="editTags"
                              value={editableBlog.tags}
                              onChange={(e) =>
                                setEditableBlog({
                                  ...editableBlog,
                                  tags: e.target.value,
                                })
                              }
                              placeholder="etiket1, etiket2, etiket3"
                              className="border-emerald-200 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Özet */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="editExcerpt"
                          className="text-base font-medium"
                        >
                          Blog Özeti
                        </Label>
                        <Textarea
                          id="editExcerpt"
                          value={editableBlog.excerpt}
                          onChange={(e) =>
                            setEditableBlog({
                              ...editableBlog,
                              excerpt: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Blog yazısının kısa özeti (SEO için önemli)"
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                        <Progress
                          value={Math.min(
                            ((editableBlog.excerpt?.length || 0) / 250) * 100,
                            100
                          )}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                          {editableBlog.excerpt?.length || 0}/250 karakter
                        </p>
                      </div>

                      {/* Meta Açıklama */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="editMetaDescription"
                          className="text-base font-medium"
                        >
                          SEO Meta Açıklaması
                        </Label>
                        <Textarea
                          id="editMetaDescription"
                          value={editableBlog.metaDescription}
                          onChange={(e) =>
                            setEditableBlog({
                              ...editableBlog,
                              metaDescription: e.target.value,
                            })
                          }
                          rows={2}
                          placeholder="Arama motorları için meta açıklama (150-160 karakter)"
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                        <Progress
                          value={Math.min(
                            ((editableBlog.metaDescription?.length || 0) /
                              160) *
                              100,
                            100
                          )}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                          {editableBlog.metaDescription?.length || 0}/160
                          karakter
                        </p>
                      </div>

                      {/* İçerik editörü */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="editContent"
                            className="text-base font-medium"
                          >
                            Blog İçeriği
                          </Label>
                          <div className="flex items-center gap-2">
                            {/* View Mode Toggle */}
                            <div className="flex rounded-md border border-emerald-200 overflow-hidden">
                              <Button
                                variant={
                                  editViewMode === "html" ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => setEditViewMode("html")}
                                className="rounded-r-none border-r border-emerald-200"
                              >
                                HTML
                              </Button>
                              <Button
                                variant={
                                  editViewMode === "markdown"
                                    ? "default"
                                    : "ghost"
                                }
                                size="sm"
                                onClick={() => setEditViewMode("markdown")}
                                className="rounded-l-none"
                              >
                                Markdown
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Textarea
                          id="editContent"
                          value={
                            editViewMode === "html"
                              ? editableBlog.content
                              : htmlToMarkdown(editableBlog.content)
                          }
                          onChange={(e) => {
                            const newContent = e.target.value;
                            setEditableBlog({
                              ...editableBlog,
                              content:
                                editViewMode === "html"
                                  ? newContent
                                  : convertMarkdownToHtml(newContent),
                            });
                          }}
                          rows={20}
                          className="font-mono text-sm border-emerald-200 focus:border-emerald-500"
                          placeholder={
                            editViewMode === "html"
                              ? "HTML formatında içerik yazın..."
                              : "Markdown formatında içerik yazın..."
                          }
                        />
                        <p className="text-xs text-gray-500">
                          {editViewMode === "html"
                            ? "HTML etiketlerini kullanarak düzenleyin. Veritabanında HTML formatında saklanacak."
                            : "Markdown formatında yazın. Otomatik olarak HTML'e dönüştürülecek."}
                        </p>
                      </div>

                      {/* Profesyonel Görsel Seçimi Alanı */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                                <ImageIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-emerald-900">
                                  Akıllı Görsel Seçimi
                                </h3>
                                <p className="text-sm text-emerald-700">
                                  İçeriğinize uygun profesyonel görseller
                                </p>
                              </div>
                            </div>
                            {editableBlog.image && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Seçildi
                              </Badge>
                            )}
                          </div>

                          {/* Mevcut seçili görsel önizlemesi */}
                          {editableBlog.image && (
                            <div className="mb-4 p-3 bg-white rounded-lg border border-emerald-200">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={editableBlog.image}
                                  alt={editableBlog.imageAlt}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-emerald-900 text-sm">
                                    {editableBlog.imageAlt}
                                  </div>
                                  <div className="text-xs text-emerald-600">
                                    {editableBlog.imageCredit}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setEditableBlog((prev) => ({
                                      ...prev,
                                      image: "",
                                      imageAlt: "",
                                      imageCredit: "",
                                    }))
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Kaldır
                                </Button>
                              </div>
                            </div>
                          )}

                          <SmartImageSelection
                            onImageSelect={handleImageSelect}
                            blogTitle={editableBlog.title}
                            blogContent={editableBlog.content}
                            blogTags={
                              editableBlog.tags
                                ? editableBlog.tags
                                    .split(",")
                                    .map((tag) => tag.trim())
                                    .filter(Boolean)
                                : []
                            }
                            selectedImageUrl={editableBlog.image}
                            className="bg-white rounded-lg border-0 shadow-none p-0"
                          />

                          {/* Görsel ipuçları */}
                          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-2">
                              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div className="text-xs text-blue-700">
                                <div className="font-medium mb-1">
                                  💡 Görsel Seçim İpuçları:
                                </div>
                                <ul className="space-y-1 text-xs">
                                  <li>
                                    • Otomatik seçim aktifse, blog üretiminde AI
                                    tarafından uygun görsel seçilir
                                  </li>
                                  <li>
                                    • Manuel seçim için arama yaparak
                                    istediğiniz görseli bulabilirsiniz
                                  </li>
                                  <li>
                                    • Yüksek çözünürlüklü ve profesyonel
                                    görseller tercih edilir
                                  </li>
                                  <li>
                                    • Tüm görseller telif hakkı açıklaması ile
                                    birlikte gelir
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-emerald-200">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("preview")}
                          className="hover:bg-gray-50"
                        >
                          <ArrowLeftIcon className="mr-2 h-4 w-4" />
                          Önizlemeye Dön
                        </Button>
                        <Button
                          onClick={() => setShowSaveDialog(true)}
                          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Blog'u Kaydet & Yayınla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Modaller ve Dialoglar */}

            {/* Kaydetme Onay Dialog */}
            <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <Save className="mr-2 h-5 w-5 text-green-600" />
                    Blog'u Kaydet & Yayınla
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Blog yazısını kaydetmek ve yayınlamak istediğinizden emin
                    misiniz?
                    <br />
                    <br />
                    <strong>Bu işlem:</strong>
                    <br />
                    • Blog'u anında yayınlayacak
                    <br />
                    • Arama motorları tarafından indekslenebilir hale getirecek
                    <br />• Sosyal medya paylaşımlarına hazır hale getirecek
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={saving}>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSaveBlog}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Evet, Kaydet
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* AI İyileştirme Onay Modal */}
            <Dialog open={showImproveModal} onOpenChange={setShowImproveModal}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-purple-500" />
                    AI İçerik İyileştirme
                  </DialogTitle>
                  <DialogDescription>
                    İçeriği AI ile iyileştirmek istediğinizden emin misiniz?
                    <br />
                    <span className="text-red-500 font-medium">
                      ⚠️ Mevcut içerik değişecektir ve bu işlem geri alınamaz.
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900">
                    🤖 AI iyileştirme kapsamı:
                  </h4>
                  <ul className="text-sm space-y-1 text-purple-800">
                    <li>✨ Daha akıcı ve anlaşılır dil kullanımı</li>
                    <li>🎯 SEO dostu anahtar kelime optimizasyonu</li>
                    <li>📝 Paragraf yapısının optimize edilmesi</li>
                    <li>🔧 Teknik detayların anlaşılır hale getirilmesi</li>
                    <li>🏢 MKN Group uzmanlık alanlarının vurgulanması</li>
                    <li>📊 İçerik yapısının geliştirilmesi</li>
                  </ul>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowImproveModal(false)}
                    disabled={improving}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={performContentImprovement}
                    disabled={improving}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {improving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        İyileştiriliyor...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="mr-2 h-4 w-4" />
                        Evet, İyileştir
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </TooltipProvider>
    </PermissionGuard>
  );
}
