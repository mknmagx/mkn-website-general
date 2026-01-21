import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Database,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Settings,
  BarChart3,
  Target,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  Brain,
  Sparkles,
  ChevronRight,
  Copy,
  ExternalLink,
  Clock,
  TrendingUp,
  Layers,
  MoreVertical,
  PlusCircle,
  X,
  Check,
  Wand2,
  ListFilter,
  LayoutGrid,
  List,
  Star,
  StarOff,
  Bookmark,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  getAllTitleDatasets,
  deleteTitleDataset,
  getDatasetStats,
  updateTitleDataset,
  DEFAULT_TITLE_CATEGORIES,
} from "@/lib/services/blog-title-service";
import AITitleGenerator from "./ai-title-generator";
import { useUnifiedAI } from "@/hooks/use-unified-ai";
import { AI_CONTEXTS } from "@/lib/ai-constants";

// AI Generated Titles Selector Component
const AIGeneratedTitlesSelector = ({
  titles,
  onConfirm,
  onCancel,
  loading,
  categoryName,
}) => {
  const [selectedTitles, setSelectedTitles] = useState(titles.map(() => true));

  const toggleTitle = (index) => {
    const newSelected = [...selectedTitles];
    newSelected[index] = !newSelected[index];
    setSelectedTitles(newSelected);
  };

  const selectAll = () => setSelectedTitles(titles.map(() => true));
  const deselectAll = () => setSelectedTitles(titles.map(() => false));

  const selectedCount = selectedTitles.filter(Boolean).length;
  const getSelectedTitles = () => titles.filter((_, i) => selectedTitles[i]);

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <Badge variant="outline" className="mr-2">
            {categoryName}
          </Badge>
          {selectedCount} / {titles.length} başlık seçili
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll}>
            Tümünü Seç
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAll}>
            Seçimi Kaldır
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {titles.map((title, index) => (
            <div
              key={index}
              onClick={() => toggleTitle(index)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedTitles[index]
                  ? "bg-purple-50 border-purple-300"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedTitles[index]
                      ? "bg-purple-500 border-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedTitles[index] && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <p className="text-sm text-gray-800 flex-1">{title}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          İptal
        </Button>
        <Button
          onClick={() => onConfirm(getSelectedTitles())}
          disabled={loading || selectedCount === 0}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ekleniyor...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {selectedCount} Başlık Ekle
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const TitleManagementInterface = ({ className, onStatsUpdate }) => {
  const { toast } = useToast();

  // Unified AI Hook - Tüm AI verisi Firestore'dan gelir
  // AITitleGenerator ile aynı yapı
  const {
    generateContent,
    availableModels,
    modelsByProvider,
    selectedModel: hookSelectedModel,
    selectModel,
    prompt: firestorePrompt, // Firestore'dan gelen prompt (systemPrompt, userPromptTemplate)
    config: firestoreConfig, // Firestore'dan gelen konfigürasyon
    loading: aiLoading,
    configLoading: aiConfigLoading,
    isReady, // AI sistemi hazır mı?
    hasModels,
  } = useUnifiedAI(AI_CONTEXTS.BLOG_TITLE_DATASET);

  // States
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasetStats, setDatasetStats] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("datasets");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  // Dataset Detail States
  const [showDatasetDetail, setShowDatasetDetail] = useState(false);
  const [detailDataset, setDetailDataset] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [titleSearchTerm, setTitleSearchTerm] = useState("");

  // Add New Titles States
  const [showAddTitlesDialog, setShowAddTitlesDialog] = useState(false);
  const [addTitlesCategory, setAddTitlesCategory] = useState(null);
  const [newTitlesText, setNewTitlesText] = useState("");
  const [addingTitles, setAddingTitles] = useState(false);

  // AI Generation States
  const [showAIGenerateDialog, setShowAIGenerateDialog] = useState(false);
  const [aiGenerateCategory, setAiGenerateCategory] = useState(null);
  const [aiGenerateCount, setAiGenerateCount] = useState(10);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedTitles, setAiGeneratedTitles] = useState([]);
  const [aiGenerateStep, setAiGenerateStep] = useState("config"); // config | generating | results
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState({ system: "", user: "" });

  // Prompt Variables States (AITitleGenerator ile aynı)
  const [creativity, setCreativity] = useState(70);
  const [targetAudience, setTargetAudience] = useState("professional");
  const [includeEmoji, setIncludeEmoji] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(true);

  // MaxTokens States (AITitleGenerator ile aynı)
  const [maxTokens, setMaxTokens] = useState(1500);
  const [autoMaxTokens, setAutoMaxTokens] = useState(true);

  // Helper: Check if model is a thinking model
  const isThinkingModel = (modelName) => {
    if (!modelName) return false;
    const name = modelName.toLowerCase();
    return (
      name.includes("gemini-2") ||
      name.includes("gemini 2") ||
      name.includes("gemini-exp") ||
      name.includes("thinking") ||
      name.includes("claude-opus") ||
      name.includes("opus") ||
      name.includes("o1") ||
      name.includes("o3")
    );
  };

  // Get current selected model (from local state or hook)
  const currentModel = useMemo(() => {
    if (selectedModelId) {
      return availableModels.find(
        (m) => m.id === selectedModelId || m.modelId === selectedModelId
      );
    }
    return hookSelectedModel;
  }, [selectedModelId, hookSelectedModel, availableModels]);

  // Calculate auto maxTokens - AITitleGenerator ile aynı
  const calculateAutoMaxTokens = () => {
    // Her başlık ortalama 15-20 token
    const estimatedTokensPerTitle = 20;
    const baseTokens = aiGenerateCount * estimatedTokensPerTitle;

    // Thinking modelleri için ekstra token gerekli (düşünme için 500-2000 token harcar)
    if (isThinkingModel(currentModel?.id || currentModel?.modelId)) {
      // Thinking modeli: base + 2000 thinking overhead
      const thinkingOverhead = 2000;
      const total = baseTokens + thinkingOverhead;
      // Min 2500, max 8000
      return Math.min(8000, Math.max(2500, Math.round(total)));
    }

    // Normal modeller için
    const safetyMultiplier = 2;
    const total = baseTokens * safetyMultiplier;
    // Min 1000, max 4000
    return Math.min(4000, Math.max(1000, Math.round(total)));
  };

  // Firestore prompt'unu template olarak kullan, placeholder'ları değiştir
  // AITitleGenerator ile aynı yapı
  const buildPromptFromTemplate = (template, variables) => {
    if (!template) return "";
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    });
    return result;
  };

  // Prompt değişkenlerini hazırla - AITitleGenerator ile aynı
  const getPromptVariables = (categoryData, count) => ({
    categoryName: categoryData?.name || "Genel",
    categoryDescription: categoryData?.description || "",
    count: count.toString(),
    targetAudience:
      targetAudience === "professional"
        ? "Profesyonel ve güvenilir ton"
        : targetAudience === "casual"
        ? "Rahat ve samimi ton"
        : "Meraklı ve öğretici ton",
    creativity: creativity.toString(),
    includeNumbers: includeNumbers
      ? "Sayılar ve istatistikler içerebilir"
      : "Sayılardan kaçın",
    includeEmoji: includeEmoji
      ? "Uygun emoji kullanabilirsin"
      : "Emoji kullanma",
  });

  // Build and preview prompt - Firestore prompt'larını kullan
  const buildPrompt = (category, count) => {
    // Firestore'da prompt yoksa hata
    if (!firestorePrompt) {
      return { system: "", user: "" };
    }

    const categoryData = DEFAULT_TITLE_CATEGORIES.find(
      (c) => c.key === category
    );
    const variables = getPromptVariables(categoryData, count);

    // Firestore alan adları: systemPrompt, userPromptTemplate
    const systemPrompt = buildPromptFromTemplate(
      firestorePrompt.systemPrompt,
      variables
    );
    const userPrompt = buildPromptFromTemplate(
      firestorePrompt.userPromptTemplate,
      variables
    );

    return { system: systemPrompt, user: userPrompt };
  };

  // Show prompt preview
  const handleShowPromptPreview = () => {
    if (showPromptPreview) {
      // Toggle off
      setShowPromptPreview(false);
      return;
    }

    if (aiGenerateCategory) {
      const prompts = buildPrompt(aiGenerateCategory, aiGenerateCount);
      setPreviewPrompt(prompts);
      setShowPromptPreview(true);

      // Prompt yoksa uyarı ver
      if (!prompts.user && !prompts.system) {
        toast({
          title: "Prompt Bulunamadı",
          description:
            "Firestore'da bu context için prompt yapılandırması yok.",
          variant: "destructive",
        });
      }
    }
  };

  // Set default model when hook loads
  useEffect(() => {
    if (hookSelectedModel && !selectedModelId) {
      setSelectedModelId(hookSelectedModel.id || hookSelectedModel.modelId);
    }
  }, [hookSelectedModel]);

  // Auto token hesaplama efekti - AITitleGenerator ile aynı
  useEffect(() => {
    if (autoMaxTokens) {
      setMaxTokens(calculateAutoMaxTokens());
    }
  }, [aiGenerateCount, autoMaxTokens, selectedModelId, currentModel]);

  // Load datasets
  const loadDatasets = async () => {
    try {
      setLoading(true);
      const datasetsData = await getAllTitleDatasets();
      setDatasets(datasetsData);
      if (onStatsUpdate) onStatsUpdate();
    } catch (error) {
      console.error("Datasets yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Datasets yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load dataset stats
  const loadDatasetStats = async (datasetId) => {
    try {
      const stats = await getDatasetStats(datasetId);
      setDatasetStats(stats);
    } catch (error) {
      console.error("Dataset istatistikleri yüklenirken hata:", error);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      loadDatasetStats(selectedDataset.id);
    }
  }, [selectedDataset]);

  // Refresh datasets
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDatasets();
    setRefreshing(false);
    toast({
      title: "Güncelleme Başarılı",
      description: "Dataset listesi yenilendi.",
    });
  };

  // Delete dataset
  const handleDeleteDataset = async () => {
    if (!datasetToDelete) return;

    setDeleting(true);
    try {
      await deleteTitleDataset(datasetToDelete.id);
      await loadDatasets();

      toast({
        title: "Dataset Silindi",
        description: `"${datasetToDelete.name}" dataset'i başarıyla silindi.`,
      });

      if (selectedDataset?.id === datasetToDelete.id) {
        setSelectedDataset(null);
        setDatasetStats(null);
      }

      if (detailDataset?.id === datasetToDelete.id) {
        setShowDatasetDetail(false);
        setDetailDataset(null);
      }
    } catch (error) {
      console.error("Dataset silme hatası:", error);
      toast({
        title: "Silme Hatası",
        description: `Dataset silinirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDatasetToDelete(null);
    }
  };

  // Open dataset detail
  const openDatasetDetail = (dataset) => {
    setDetailDataset(dataset);
    setShowDatasetDetail(true);
    setSelectedCategory("all");
    setTitleSearchTerm("");
  };

  // Save edited title
  const handleSaveTitle = async (categoryIndex, titleIndex) => {
    if (!detailDataset || !editTitleValue.trim()) return;

    setSavingTitle(true);
    try {
      const updatedCategories = [...detailDataset.categories];
      updatedCategories[categoryIndex].titles[titleIndex] =
        editTitleValue.trim();

      await updateTitleDataset(detailDataset.id, {
        categories: updatedCategories,
      });

      // Update local state
      setDetailDataset({
        ...detailDataset,
        categories: updatedCategories,
      });

      // Update datasets list
      setDatasets(
        datasets.map((d) =>
          d.id === detailDataset.id
            ? { ...d, categories: updatedCategories }
            : d
        )
      );

      setEditingTitle(null);
      setEditTitleValue("");

      toast({
        title: "Başlık Güncellendi",
        description: "Başlık başarıyla kaydedildi.",
      });
    } catch (error) {
      console.error("Başlık güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Başlık güncellenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSavingTitle(false);
    }
  };

  // Delete title
  const handleDeleteTitle = async (categoryIndex, titleIndex) => {
    if (!detailDataset) return;

    try {
      const updatedCategories = [...detailDataset.categories];
      updatedCategories[categoryIndex].titles.splice(titleIndex, 1);

      // Recalculate totalTitles
      const newTotalTitles = updatedCategories.reduce(
        (sum, cat) => sum + cat.titles.length,
        0
      );

      await updateTitleDataset(detailDataset.id, {
        categories: updatedCategories,
        totalTitles: newTotalTitles,
      });

      setDetailDataset({
        ...detailDataset,
        categories: updatedCategories,
        totalTitles: newTotalTitles,
      });

      setDatasets(
        datasets.map((d) =>
          d.id === detailDataset.id
            ? {
                ...d,
                categories: updatedCategories,
                totalTitles: newTotalTitles,
              }
            : d
        )
      );

      toast({
        title: "Başlık Silindi",
        description: "Başlık başarıyla silindi.",
      });
    } catch (error) {
      console.error("Başlık silme hatası:", error);
      toast({
        title: "Hata",
        description: "Başlık silinirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Add new titles to category
  const handleAddTitles = async () => {
    if (!detailDataset || !addTitlesCategory || !newTitlesText.trim()) return;

    setAddingTitles(true);
    try {
      const newTitles = newTitlesText
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (newTitles.length === 0) {
        toast({
          title: "Hata",
          description: "En az bir başlık girmelisiniz.",
          variant: "destructive",
        });
        return;
      }

      const categoryIndex = detailDataset.categories.findIndex(
        (c) => c.categoryKey === addTitlesCategory
      );

      if (categoryIndex === -1) {
        // Create new category
        const updatedCategories = [
          ...detailDataset.categories,
          { categoryKey: addTitlesCategory, titles: newTitles },
        ];

        const newTotalTitles = updatedCategories.reduce(
          (sum, cat) => sum + cat.titles.length,
          0
        );

        await updateTitleDataset(detailDataset.id, {
          categories: updatedCategories,
          totalTitles: newTotalTitles,
        });

        setDetailDataset({
          ...detailDataset,
          categories: updatedCategories,
          totalTitles: newTotalTitles,
        });

        setDatasets(
          datasets.map((d) =>
            d.id === detailDataset.id
              ? {
                  ...d,
                  categories: updatedCategories,
                  totalTitles: newTotalTitles,
                }
              : d
          )
        );
      } else {
        // Add to existing category
        const updatedCategories = [...detailDataset.categories];
        updatedCategories[categoryIndex].titles = [
          ...updatedCategories[categoryIndex].titles,
          ...newTitles,
        ];

        const newTotalTitles = updatedCategories.reduce(
          (sum, cat) => sum + cat.titles.length,
          0
        );

        await updateTitleDataset(detailDataset.id, {
          categories: updatedCategories,
          totalTitles: newTotalTitles,
        });

        setDetailDataset({
          ...detailDataset,
          categories: updatedCategories,
          totalTitles: newTotalTitles,
        });

        setDatasets(
          datasets.map((d) =>
            d.id === detailDataset.id
              ? {
                  ...d,
                  categories: updatedCategories,
                  totalTitles: newTotalTitles,
                }
              : d
          )
        );
      }

      setShowAddTitlesDialog(false);
      setAddTitlesCategory(null);
      setNewTitlesText("");

      toast({
        title: "Başlıklar Eklendi",
        description: `${newTitles.length} yeni başlık eklendi.`,
      });
    } catch (error) {
      console.error("Başlık ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Başlıklar eklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setAddingTitles(false);
    }
  };

  // Toggle dataset active status
  const handleToggleActive = async (dataset) => {
    try {
      await updateTitleDataset(dataset.id, {
        isActive: !dataset.isActive,
      });

      setDatasets(
        datasets.map((d) =>
          d.id === dataset.id ? { ...d, isActive: !dataset.isActive } : d
        )
      );

      if (detailDataset?.id === dataset.id) {
        setDetailDataset({
          ...detailDataset,
          isActive: !dataset.isActive,
        });
      }

      toast({
        title: dataset.isActive
          ? "Dataset Pasife Alındı"
          : "Dataset Aktifleştirildi",
        description: `"${dataset.name}" ${
          dataset.isActive ? "pasif" : "aktif"
        } duruma getirildi.`,
      });
    } catch (error) {
      console.error("Status güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Durum güncellenirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // AI Generate Titles - AITitleGenerator ile aynı yapı
  const handleAIGenerateTitles = async () => {
    if (!detailDataset || !aiGenerateCategory) return;

    // Firestore prompt kontrolü - AITitleGenerator ile aynı
    if (!firestorePrompt) {
      toast({
        title: "Hata",
        description:
          "Firestore'da prompt bulunamadı. Lütfen AI Ayarlarından 'blog_title_dataset_generation' prompt'unu yükleyin.",
        variant: "destructive",
      });
      return;
    }

    if (!firestorePrompt.systemPrompt || !firestorePrompt.userPromptTemplate) {
      toast({
        title: "Hata",
        description:
          "Prompt eksik: systemPrompt veya userPromptTemplate tanımlı değil.",
        variant: "destructive",
      });
      return;
    }

    // Model kontrolü
    if (!hasModels || !isReady) {
      toast({
        title: "Hata",
        description:
          "AI modelleri yüklenemedi. Lütfen AI ayarlarını kontrol edin.",
        variant: "destructive",
      });
      return;
    }

    setAiGenerating(true);
    setAiGenerateStep("generating");
    setAiGeneratedTitles([]);

    try {
      // Build prompt from Firestore templates
      const prompts = buildPrompt(aiGenerateCategory, aiGenerateCount);

      // maxTokens state'ten al (otomatik veya manuel)

      // Unified AI ile generate et - AITitleGenerator ile aynı (temperature creativitiy'den alınıyor)
      const result = await generateContent(prompts.user, {
        systemPrompt: prompts.system,
        maxTokens: maxTokens,
        temperature: creativity / 100,
        modelId: selectedModelId || currentModel?.modelId || currentModel?.id,
      });

      // Hata kontrolü - AITitleGenerator ile aynı
      if (!result || result.success === false) {
        throw new Error(result?.error || "AI yanıtı alınamadı");
      }

      // Parse titles from response - AITitleGenerator ile aynı yapı
      let responseText = "";
      if (typeof result === "string") {
        responseText = result;
      } else if (result?.content && typeof result.content === "string") {
        responseText = result.content;
      } else if (result?.text && typeof result.text === "string") {
        responseText = result.text;
      } else if (result?.response && typeof result.response === "string") {
        responseText = result.response;
      } else {
        console.warn("Beklenmeyen result yapısı:", result);
        throw new Error("AI yanıtı beklenmeyen formatta");
      }

      const titles = responseText
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line &&
            !line.startsWith("-") &&
            !line.startsWith("*") &&
            line.length > 5
        )
        .map((line) => line.replace(/^[\d\-\.\)\*]+\s*/, "").trim())
        .filter((line) => line.length > 10 && line.length < 150)
        .slice(0, aiGenerateCount);

      if (titles.length === 0) {
        throw new Error("AI hiç geçerli başlık üretemedi");
      }

      setAiGeneratedTitles(titles);
      setAiGenerateStep("results");

      toast({
        title: "Başlıklar Üretildi",
        description: `${titles.length} adet başlık AI tarafından üretildi.`,
      });
    } catch (error) {
      console.error("AI başlık üretme hatası:", error);
      toast({
        title: "Hata",
        description: `AI başlık üretirken hata: ${error.message}`,
        variant: "destructive",
      });
      setAiGenerateStep("config");
    } finally {
      setAiGenerating(false);
    }
  };

  // Add AI generated titles to dataset
  const handleAddAIGeneratedTitles = async (selectedTitles) => {
    if (!detailDataset || !aiGenerateCategory || selectedTitles.length === 0)
      return;

    setAddingTitles(true);
    try {
      const categoryIndex = detailDataset.categories.findIndex(
        (c) => c.categoryKey === aiGenerateCategory
      );

      let updatedCategories;

      if (categoryIndex === -1) {
        // Create new category
        updatedCategories = [
          ...detailDataset.categories,
          { categoryKey: aiGenerateCategory, titles: selectedTitles },
        ];
      } else {
        // Add to existing category
        updatedCategories = [...detailDataset.categories];
        updatedCategories[categoryIndex].titles = [
          ...updatedCategories[categoryIndex].titles,
          ...selectedTitles,
        ];
      }

      const newTotalTitles = updatedCategories.reduce(
        (sum, cat) => sum + cat.titles.length,
        0
      );

      await updateTitleDataset(detailDataset.id, {
        categories: updatedCategories,
        totalTitles: newTotalTitles,
      });

      setDetailDataset({
        ...detailDataset,
        categories: updatedCategories,
        totalTitles: newTotalTitles,
      });

      setDatasets(
        datasets.map((d) =>
          d.id === detailDataset.id
            ? {
                ...d,
                categories: updatedCategories,
                totalTitles: newTotalTitles,
              }
            : d
        )
      );

      // Reset dialog
      setShowAIGenerateDialog(false);
      setAiGenerateCategory(null);
      setAiGeneratedTitles([]);
      setAiGenerateStep("config");

      toast({
        title: "Başlıklar Eklendi",
        description: `${selectedTitles.length} AI başlığı dataset'e eklendi.`,
      });
    } catch (error) {
      console.error("Başlık ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Başlıklar eklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setAddingTitles(false);
    }
  };

  // Copy title to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Başlık panoya kopyalandı.",
    });
  };

  // Filter datasets
  const filteredDatasets = useMemo(() => {
    return datasets.filter((dataset) => {
      const matchesSearch =
        dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && dataset.isActive) ||
        (filterStatus === "inactive" && !dataset.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [datasets, searchTerm, filterStatus]);

  // Calculate total stats
  const totalStats = useMemo(
    () => ({
      totalDatasets: datasets.length,
      activeDatasets: datasets.filter((d) => d.isActive).length,
      totalTitles: datasets.reduce((sum, d) => sum + (d.totalTitles || 0), 0),
      usedTitles: datasets.reduce((sum, d) => sum + (d.usedTitles || 0), 0),
    }),
    [datasets]
  );

  const usagePercentage =
    totalStats.totalTitles > 0
      ? Math.round((totalStats.usedTitles / totalStats.totalTitles) * 100)
      : 0;

  // Get filtered titles for detail view
  const getFilteredTitles = () => {
    if (!detailDataset) return [];

    let allTitles = [];

    detailDataset.categories.forEach((category, categoryIndex) => {
      const categoryData = DEFAULT_TITLE_CATEGORIES.find(
        (c) => c.key === category.categoryKey
      );

      if (
        selectedCategory !== "all" &&
        category.categoryKey !== selectedCategory
      ) {
        return;
      }

      category.titles.forEach((title, titleIndex) => {
        if (
          titleSearchTerm &&
          !title.toLowerCase().includes(titleSearchTerm.toLowerCase())
        ) {
          return;
        }

        allTitles.push({
          title,
          categoryKey: category.categoryKey,
          categoryName: categoryData?.name || category.categoryKey,
          categoryIcon: categoryData?.icon || "📝",
          categoryColor: categoryData?.color || "#6B7280",
          categoryIndex,
          titleIndex,
        });
      });
    });

    return allTitles;
  };

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {totalStats.totalDatasets}
                  </div>
                  <div className="text-blue-100 text-sm">Dataset</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Database className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-100">
                {totalStats.activeDatasets} aktif
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {totalStats.totalTitles}
                  </div>
                  <div className="text-emerald-100 text-sm">Toplam Başlık</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-xs text-emerald-100">
                {DEFAULT_TITLE_CATEGORIES.length} kategoride
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {totalStats.usedTitles}
                  </div>
                  <div className="text-amber-100 text-sm">Kullanılan</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-xs text-amber-100">
                Blog yazılarında
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">%{usagePercentage}</div>
                  <div className="text-purple-100 text-sm">Kullanım</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-white/30 rounded-full h-1.5">
                  <div
                    className="bg-white h-1.5 rounded-full transition-all"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white shadow-md rounded-xl p-1">
              <TabsTrigger
                value="datasets"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg px-6"
              >
                <Database className="mr-2 h-4 w-4" />
                Datasets
              </TabsTrigger>
              <TabsTrigger
                value="generator"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg px-6"
              >
                <Brain className="mr-2 h-4 w-4" />
                AI Üretici
              </TabsTrigger>
            </TabsList>

            {activeTab === "datasets" && (
              <div className="flex items-center gap-2">
                <div className="flex bg-white rounded-lg shadow-sm border p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Datasets Tab */}
          <TabsContent value="datasets" className="space-y-4 mt-0">
            {/* Search and Filter */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Dataset ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48">
                      <ListFilter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Datasets</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setActiveTab("generator")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Dataset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dataset List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-500">Datasets yükleniyor...</p>
                </div>
              </div>
            ) : filteredDatasets.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? "Sonuç bulunamadı" : "Henüz dataset yok"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm
                      ? "Arama kriterlerinize uygun dataset bulunamadı."
                      : "AI Generator ile ilk blog başlık dataset'inizi oluşturun."}
                  </p>
                  <Button
                    onClick={() => setActiveTab("generator")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    AI ile Oluştur
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDatasets.map((dataset) => (
                  <Card
                    key={dataset.id}
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-xl border-0 shadow-md overflow-hidden ${
                      !dataset.isActive ? "opacity-70" : ""
                    }`}
                    onClick={() => openDatasetDetail(dataset)}
                  >
                    <div
                      className={`h-1 ${
                        dataset.isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {dataset.name}
                          </h3>
                          {dataset.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {dataset.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={dataset.isActive ? "default" : "secondary"}
                          className={
                            dataset.isActive
                              ? "bg-green-100 text-green-700"
                              : ""
                          }
                        >
                          {dataset.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {dataset.categories?.length || 0}
                          </div>
                          <div className="text-xs text-blue-600">Kategori</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {dataset.totalTitles || 0}
                          </div>
                          <div className="text-xs text-green-600">Başlık</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">
                            {dataset.usedTitles || 0}
                          </div>
                          <div className="text-xs text-orange-600">
                            Kullanılan
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {dataset.createdAt
                            ? formatDistanceToNow(new Date(dataset.createdAt), {
                                addSuffix: true,
                                locale: tr,
                              })
                            : "Bilinmiyor"}
                        </div>
                        <div className="flex items-center gap-1">
                          {dataset.aiModel && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="mr-1 h-3 w-3" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="divide-y">
                  {filteredDatasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !dataset.isActive ? "opacity-70" : ""
                      }`}
                      onClick={() => openDatasetDetail(dataset)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-1 h-12 rounded-full ${
                            dataset.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {dataset.name}
                            </h3>
                            {dataset.aiModel && (
                              <Badge variant="outline" className="text-xs">
                                <Brain className="mr-1 h-3 w-3" />
                                AI
                              </Badge>
                            )}
                          </div>
                          {dataset.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {dataset.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">
                              {dataset.categories?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              Kategori
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">
                              {dataset.totalTitles || 0}
                            </div>
                            <div className="text-xs text-gray-500">Başlık</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">
                              {dataset.usedTitles || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              Kullanılan
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* AI Generator Tab */}
          <TabsContent value="generator" className="mt-0">
            <AITitleGenerator
              onDatasetCreated={(datasetId) => {
                loadDatasets();
                setActiveTab("datasets");
                toast({
                  title: "Başarılı",
                  description: "Yeni dataset oluşturuldu.",
                });
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Dataset Detail Sheet */}
        <Sheet open={showDatasetDetail} onOpenChange={setShowDatasetDetail}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            {detailDataset && (
              <>
                <SheetHeader className="space-y-4 pb-6 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <SheetTitle className="text-xl">
                        {detailDataset.name}
                      </SheetTitle>
                      {detailDataset.description && (
                        <SheetDescription className="mt-1">
                          {detailDataset.description}
                        </SheetDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={detailDataset.isActive}
                        onCheckedChange={() =>
                          handleToggleActive(detailDataset)
                        }
                      />
                      <span className="text-sm text-gray-500">
                        {detailDataset.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {detailDataset.categories?.length || 0}
                      </div>
                      <div className="text-xs text-blue-600">Kategori</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {detailDataset.totalTitles || 0}
                      </div>
                      <div className="text-xs text-green-600">Başlık</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">
                        {detailDataset.usedTitles || 0}
                      </div>
                      <div className="text-xs text-orange-600">Kullanılan</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        %
                        {detailDataset.totalTitles > 0
                          ? Math.round(
                              ((detailDataset.usedTitles || 0) /
                                detailDataset.totalTitles) *
                                100
                            )
                          : 0}
                      </div>
                      <div className="text-xs text-purple-600">Kullanım</div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="py-6 space-y-4">
                  {/* Filter and Search */}
                  <div className="flex flex-wrap gap-3">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Kategoriler</SelectItem>
                        {detailDataset.categories?.map((cat) => {
                          const categoryData = DEFAULT_TITLE_CATEGORIES.find(
                            (c) => c.key === cat.categoryKey
                          );
                          return (
                            <SelectItem
                              key={cat.categoryKey}
                              value={cat.categoryKey}
                            >
                              {categoryData?.icon}{" "}
                              {categoryData?.name || cat.categoryKey}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Başlık ara..."
                        value={titleSearchTerm}
                        onChange={(e) => setTitleSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddTitlesCategory(
                          selectedCategory !== "all" ? selectedCategory : null
                        );
                        setShowAddTitlesDialog(true);
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Manuel Ekle
                    </Button>
                    <Button
                      onClick={() => {
                        setAiGenerateCategory(
                          selectedCategory !== "all" ? selectedCategory : null
                        );
                        setAiGenerateStep("config");
                        setAiGeneratedTitles([]);
                        setShowAIGenerateDialog(true);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      AI ile Üret
                    </Button>
                  </div>

                  {/* Titles List */}
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <div className="space-y-2 pr-4">
                      {getFilteredTitles().map((item, index) => (
                        <div
                          key={`${item.categoryKey}-${item.titleIndex}`}
                          className="group p-3 bg-gray-50 rounded-lg border hover:border-blue-200 transition-colors"
                        >
                          {editingTitle ===
                          `${item.categoryIndex}-${item.titleIndex}` ? (
                            <div className="flex gap-2">
                              <Input
                                value={editTitleValue}
                                onChange={(e) =>
                                  setEditTitleValue(e.target.value)
                                }
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSaveTitle(
                                    item.categoryIndex,
                                    item.titleIndex
                                  )
                                }
                                disabled={savingTitle}
                              >
                                {savingTitle ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTitle(null);
                                  setEditTitleValue("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                                style={{
                                  backgroundColor: `${item.categoryColor}20`,
                                }}
                              >
                                {item.categoryIcon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-900">{item.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.categoryName}
                                </p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() =>
                                        copyToClipboard(item.title)
                                      }
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Kopyala</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setEditingTitle(
                                          `${item.categoryIndex}-${item.titleIndex}`
                                        );
                                        setEditTitleValue(item.title);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Düzenle</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() =>
                                        handleDeleteTitle(
                                          item.categoryIndex,
                                          item.titleIndex
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Sil</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {getFilteredTitles().length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Başlık bulunamadı</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t flex gap-3">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setDatasetToDelete(detailDataset);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Dataset'i Sil
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Add Titles Dialog */}
        <Dialog
          open={showAddTitlesDialog}
          onOpenChange={setShowAddTitlesDialog}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-blue-600" />
                Yeni Başlıklar Ekle
              </DialogTitle>
              <DialogDescription>
                Her satıra bir başlık yazın. Başlıklar seçili kategoriye
                eklenecek.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={addTitlesCategory || ""}
                  onValueChange={setAddTitlesCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_TITLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.key} value={cat.key}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Başlıklar (her satıra bir başlık)</Label>
                <Textarea
                  value={newTitlesText}
                  onChange={(e) => setNewTitlesText(e.target.value)}
                  placeholder="Kozmetik Fason Üretimde 5 Kritik Adım&#10;GMP Sertifikası Nasıl Alınır?&#10;Private Label Kozmetik Rehberi"
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  {newTitlesText.split("\n").filter((t) => t.trim()).length}{" "}
                  başlık girildi
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddTitlesDialog(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleAddTitles}
                disabled={
                  addingTitles || !addTitlesCategory || !newTitlesText.trim()
                }
              >
                {addingTitles ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ekleniyor...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Ekle
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Generate Titles Dialog */}
        <Dialog
          open={showAIGenerateDialog}
          onOpenChange={(open) => {
            if (!aiGenerating) {
              setShowAIGenerateDialog(open);
              if (!open) {
                setAiGenerateStep("config");
                setAiGeneratedTitles([]);
                setShowPromptPreview(false);
                // Prompt değişkenlerini default değerlere sıfırla
                setCreativity(70);
                setTargetAudience("professional");
                setIncludeEmoji(false);
                setIncludeNumbers(true);
                // MaxTokens ayarlarını sıfırla
                setMaxTokens(1500);
                setAutoMaxTokens(true);
              }
            }
          }}
        >
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Wand2 className="mr-2 h-5 w-5 text-purple-600" />
                AI ile Başlık Üret
              </DialogTitle>
              <DialogDescription>
                {aiGenerateStep === "config" &&
                  "Kategori ve model seçin, prompt'u önizleyin."}
                {aiGenerateStep === "generating" &&
                  "AI başlıkları üretiyor, lütfen bekleyin..."}
                {aiGenerateStep === "results" &&
                  "Üretilen başlıkları inceleyin ve eklemek istediklerinizi seçin."}
              </DialogDescription>
            </DialogHeader>

            {aiGenerateStep === "config" && (
              <div className="space-y-4 py-4">
                {/* AI Config Loading State */}
                {aiConfigLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-3" />
                    <p className="text-gray-500">
                      AI yapılandırması yükleniyor...
                    </p>
                  </div>
                ) : !hasModels ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-3" />
                    <p className="font-medium">AI modelleri bulunamadı</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Lütfen AI ayarlarını kontrol edin
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Category Selection */}
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select
                        value={aiGenerateCategory || ""}
                        onValueChange={setAiGenerateCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_TITLE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.key} value={cat.key}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Title Count */}
                    <div className="space-y-2">
                      <Label>Üretilecek Başlık Sayısı: {aiGenerateCount}</Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="5"
                          max="30"
                          step="5"
                          value={aiGenerateCount}
                          onChange={(e) =>
                            setAiGenerateCount(parseInt(e.target.value))
                          }
                          className="flex-1 accent-purple-500"
                        />
                        <Badge
                          variant="outline"
                          className="w-12 justify-center"
                        >
                          {aiGenerateCount}
                        </Badge>
                      </div>
                    </div>

                    {/* Model Selection - Firestore'dan */}
                    <div className="space-y-2">
                      <Label>AI Model (Firestore)</Label>
                      <Select
                        value={
                          selectedModelId ||
                          currentModel?.id ||
                          currentModel?.modelId ||
                          ""
                        }
                        onValueChange={setSelectedModelId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Model seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(modelsByProvider).map(
                            ([provider, models]) => (
                              <div key={provider}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                                  {provider}
                                </div>
                                {models.map((model) => (
                                  <SelectItem
                                    key={model.id || model.modelId}
                                    value={model.id || model.modelId}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{model.name || model.id}</span>
                                      {isThinkingModel(
                                        model.id || model.modelId
                                      ) && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-purple-50"
                                        >
                                          🧠
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {availableModels.length} model mevcut
                      </p>
                    </div>

                    {/* Prompt Variables - AITitleGenerator ile aynı */}
                    <div className="space-y-4 p-4 bg-purple-50/50 rounded-lg border border-purple-200">
                      <Label className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Prompt Değişkenleri
                      </Label>

                      {/* Creativity Slider */}
                      <div className="space-y-2">
                        <Label className="text-sm">
                          Yaratıcılık Seviyesi: %{creativity}
                        </Label>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          step="10"
                          value={creativity}
                          onChange={(e) =>
                            setCreativity(parseInt(e.target.value))
                          }
                          className="w-full accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>%30 (Konservatif)</span>
                          <span>%70 (Dengeli)</span>
                          <span>%100 (Yaratıcı)</span>
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div className="space-y-2">
                        <Label className="text-sm">Hedef Kitle</Label>
                        <Select
                          value={targetAudience}
                          onValueChange={setTargetAudience}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">
                              Profesyoneller (B2B)
                            </SelectItem>
                            <SelectItem value="casual">
                              Genel Okuyucular (B2C)
                            </SelectItem>
                            <SelectItem value="technical">
                              Teknik Uzmanlar
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                          <Label
                            className="text-xs cursor-pointer"
                            htmlFor="emoji-toggle"
                          >
                            Emoji Kullan
                          </Label>
                          <Switch
                            id="emoji-toggle"
                            checked={includeEmoji}
                            onCheckedChange={setIncludeEmoji}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                          <Label
                            className="text-xs cursor-pointer"
                            htmlFor="numbers-toggle"
                          >
                            Sayı/İstatistik
                          </Label>
                          <Switch
                            id="numbers-toggle"
                            checked={includeNumbers}
                            onCheckedChange={setIncludeNumbers}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Max Tokens Ayarı - AITitleGenerator ile aynı */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          Max Tokens
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  AI'ın üretebileceği maksimum token sayısı.
                                </p>
                                <p className="mt-1">• Her başlık ~20 token</p>
                                <p>• Thinking modeller +2000 token harcar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Otomatik
                          </span>
                          <Switch
                            checked={autoMaxTokens}
                            onCheckedChange={setAutoMaxTokens}
                          />
                        </div>
                      </div>

                      {autoMaxTokens ? (
                        <div className="text-sm text-purple-700 bg-purple-100 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            {isThinkingModel(
                              currentModel?.id || currentModel?.modelId
                            ) ? (
                              <span>
                                Thinking Model: {aiGenerateCount} başlık × 20
                                token + 2000 (thinking) ={" "}
                                <strong>{maxTokens}</strong> token
                              </span>
                            ) : (
                              <span>
                                Normal Model: {aiGenerateCount} başlık × 20
                                token × 2 = <strong>{maxTokens}</strong> token
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <input
                            type="range"
                            min="500"
                            max="8000"
                            step="100"
                            value={maxTokens}
                            onChange={(e) =>
                              setMaxTokens(parseInt(e.target.value))
                            }
                            className="w-full accent-purple-500"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>500</span>
                            <span className="font-medium text-purple-700">
                              {maxTokens} token
                            </span>
                            <span>8000</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* AI Config Summary */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium text-purple-700 truncate">
                            {currentModel?.name ||
                              currentModel?.id ||
                              "Seçilmedi"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Max Tokens:</span>
                          <span className="font-medium text-purple-700">
                            {maxTokens}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Temperature:</span>
                          <span className="font-medium text-purple-700">
                            {(creativity / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Başlık:</span>
                          <span className="font-medium text-purple-700">
                            {aiGenerateCount} adet
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Hedef Kitle:</span>
                          <span className="font-medium text-purple-700 text-xs truncate">
                            {targetAudience === "professional"
                              ? "B2B"
                              : targetAudience === "casual"
                              ? "B2C"
                              : "Teknik"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">Tip:</span>
                          <span className="font-medium text-purple-700">
                            {isThinkingModel(
                              currentModel?.id || currentModel?.modelId
                            )
                              ? "🧠 Thinking"
                              : "⚡ Normal"}
                          </span>
                        </div>
                      </div>
                      {currentModel?.provider && (
                        <div className="mt-2 pt-2 border-t border-purple-200">
                          <span className="text-xs text-purple-600">
                            Provider: {currentModel.provider}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Prompt Status - AITitleGenerator ile aynı */}
                    {firestorePrompt?.systemPrompt &&
                    firestorePrompt?.userPromptTemplate ? (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">
                            Aktif Prompt:{" "}
                            {firestorePrompt.name || firestorePrompt.key}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 mt-1 space-y-0.5">
                          <p className="truncate">
                            System: {firestorePrompt.systemPrompt?.slice(0, 60)}
                            ...
                          </p>
                          <p className="truncate">
                            User:{" "}
                            {firestorePrompt.userPromptTemplate?.slice(0, 60)}
                            ...
                          </p>
                        </div>
                      </div>
                    ) : !aiConfigLoading ? (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700 font-medium">
                            Prompt Bulunamadı
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Firestore'da{" "}
                          <code className="bg-red-100 px-1 rounded">
                            blog_title_dataset_generation
                          </code>{" "}
                          prompt'u tanımlı değil.
                        </p>
                      </div>
                    ) : null}

                    {/* Prompt Preview Button */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleShowPromptPreview}
                      disabled={!aiGenerateCategory}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Prompt Önizle
                    </Button>

                    {/* Prompt Preview Panel */}
                    {showPromptPreview && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border max-h-[300px] overflow-y-auto">
                        {!previewPrompt.user && !previewPrompt.system ? (
                          <div className="text-center py-4 text-amber-600">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium">
                              Prompt Yapılandırması Yok
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Firestore'da "BLOG_TITLE_DATASET" context'i için
                              prompt tanımlanmamış.
                            </p>
                          </div>
                        ) : (
                          <>
                            {previewPrompt.system && (
                              <div>
                                <Label className="text-xs text-gray-500">
                                  System Prompt
                                </Label>
                                <pre className="mt-1 text-xs bg-white p-2 rounded border whitespace-pre-wrap font-mono">
                                  {previewPrompt.system}
                                </pre>
                              </div>
                            )}
                            {previewPrompt.user && (
                              <div>
                                <Label className="text-xs text-gray-500">
                                  User Prompt
                                </Label>
                                <pre className="mt-1 text-xs bg-white p-2 rounded border whitespace-pre-wrap font-mono">
                                  {previewPrompt.user}
                                </pre>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  previewPrompt.user || previewPrompt.system
                                );
                                toast({
                                  title: "Kopyalandı",
                                  description: "Prompt panoya kopyalandı.",
                                });
                              }}
                            >
                              <Copy className="mr-2 h-3 w-3" />
                              Prompt'u Kopyala
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {aiGenerateStep === "generating" && (
              <div className="py-12 text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Brain className="h-10 w-10 text-white animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-600 mb-2">AI başlıkları üretiyor...</p>
                <p className="text-sm text-gray-400">
                  Model:{" "}
                  {currentModel?.name || currentModel?.id || "Yükleniyor..."}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Max Tokens: {maxTokens}
                </p>
              </div>
            )}

            {aiGenerateStep === "results" && (
              <AIGeneratedTitlesSelector
                titles={aiGeneratedTitles}
                onConfirm={handleAddAIGeneratedTitles}
                onCancel={() => {
                  setShowAIGenerateDialog(false);
                  setAiGenerateStep("config");
                  setAiGeneratedTitles([]);
                }}
                loading={addingTitles}
                categoryName={
                  DEFAULT_TITLE_CATEGORIES.find(
                    (c) => c.key === aiGenerateCategory
                  )?.name || aiGenerateCategory
                }
              />
            )}

            {aiGenerateStep === "config" && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAIGenerateDialog(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleAIGenerateTitles}
                  disabled={
                    aiGenerating ||
                    aiLoading ||
                    aiConfigLoading ||
                    !isReady ||
                    !firestorePrompt?.systemPrompt ||
                    !firestorePrompt?.userPromptTemplate ||
                    !aiGenerateCategory ||
                    !hasModels ||
                    availableModels.length === 0
                  }
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Üret
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-red-600">
                <Trash2 className="mr-2 h-5 w-5" />
                Dataset'i Sil
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  <strong>"{datasetToDelete?.name}"</strong> dataset'ini silmek
                  istediğinizden emin misiniz?
                </p>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-800 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Bu işlem geri alınamaz! Dataset ve tüm başlıklar kalıcı
                    olarak silinecektir.
                  </span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDataset}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default TitleManagementInterface;
