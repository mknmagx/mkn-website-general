import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Brain,
  Wand2,
  Loader2,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Target,
  Sparkles,
  Info,
  Settings,
  Lightbulb,
  FileText,
  Cpu,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_TITLE_CATEGORIES,
  createTitleDataset,
  validateTitleDataset,
} from "@/lib/services/blog-title-service";

// Yeni merkezi AI sistemi
import { useUnifiedAI, AI_CONTEXTS } from "@/hooks/use-unified-ai";
import { PROVIDER_INFO, getProviderIcon } from "@/lib/ai-constants";

const AITitleGenerator = ({ onDatasetCreated, className }) => {
  const { toast } = useToast();

  // Yeni unified AI hook - BLOG_TITLE_DATASET context'i kullan (toplu üretim için)
  const {
    generateContent,
    availableModels,
    selectedModel: hookSelectedModel,
    selectModel,
    prompt: firestorePrompt, // Firestore'dan gelen system prompt
    config: firestoreConfig, // Firestore'dan gelen konfigürasyon
    loading: aiLoading,
    configLoading,
    isReady,
  } = useUnifiedAI(AI_CONTEXTS.BLOG_TITLE_DATASET);

  // States
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [titlesPerCategory, setTitlesPerCategory] = useState(10);
  const [creativity, setCreativity] = useState(70);
  const [targetAudience, setTargetAudience] = useState("professional");
  const [includeEmoji, setIncludeEmoji] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [generatedDataset, setGeneratedDataset] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // AI Config States - düzenlenebilir
  const [maxTokens, setMaxTokens] = useState(1500);
  const [autoMaxTokens, setAutoMaxTokens] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Hook'tan gelen default model'i kullan
  useEffect(() => {
    if (hookSelectedModel && !selectedModelId) {
      setSelectedModelId(hookSelectedModel.modelId || hookSelectedModel.id);
    }
  }, [hookSelectedModel, selectedModelId]);

  // Config'ten gelen ayarları yükle
  useEffect(() => {
    if (firestoreConfig?.settings) {
      if (firestoreConfig.settings.maxTokens && autoMaxTokens) {
        setMaxTokens(firestoreConfig.settings.maxTokens);
      }
      if (firestoreConfig.settings.temperature) {
        setCreativity(Math.round(firestoreConfig.settings.temperature * 100));
      }
    }
  }, [firestoreConfig, autoMaxTokens]);

  // Initialize with all categories selected
  useEffect(() => {
    setSelectedCategories(DEFAULT_TITLE_CATEGORIES.map((cat) => cat.key));
  }, []);

  // Seçili modelin "thinking" model olup olmadığını kontrol et
  const isThinkingModel = () => {
    const modelId =
      selectedModelId ||
      hookSelectedModel?.modelId ||
      hookSelectedModel?.id ||
      "";
    const modelName = (
      hookSelectedModel?.name ||
      hookSelectedModel?.displayName ||
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
  };

  // Otomatik maxTokens hesapla - model türüne ve başlık sayısına göre
  const calculateAutoMaxTokens = () => {
    // Her başlık ortalama 15-20 token
    const estimatedTokensPerTitle = 20;
    const baseTokens = titlesPerCategory * estimatedTokensPerTitle;

    // Thinking modelleri için ekstra token gerekli (düşünme için 500-2000 token harcar)
    if (isThinkingModel()) {
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

  // Auto token hesaplama efekti
  useEffect(() => {
    if (autoMaxTokens) {
      setMaxTokens(calculateAutoMaxTokens());
    }
  }, [titlesPerCategory, autoMaxTokens, selectedModelId, hookSelectedModel]);

  // Firestore prompt'unu template olarak kullan, placeholder'ları değiştir
  const buildPromptFromTemplate = (template, variables) => {
    if (!template) return "";
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    });
    return result;
  };

  // Prompt değişkenlerini hazırla
  const getPromptVariables = (categoryData, count) => ({
    categoryName: categoryData.name,
    categoryDescription: categoryData.description,
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

  // Prompt oluştur - Sadece Firestore'dan
  const generatePrompts = (categoryData, count) => {
    if (!firestorePrompt) {
      throw new Error(
        "Firestore'da prompt bulunamadı. Lütfen AI Ayarlarından 'blog_title_dataset_generation' prompt'unu yükleyin."
      );
    }

    if (!firestorePrompt.systemPrompt || !firestorePrompt.userPromptTemplate) {
      throw new Error(
        "Prompt eksik: systemPrompt veya userPromptTemplate tanımlı değil."
      );
    }

    const variables = getPromptVariables(categoryData, count);

    return {
      systemPrompt: buildPromptFromTemplate(
        firestorePrompt.systemPrompt,
        variables
      ),
      userPrompt: buildPromptFromTemplate(
        firestorePrompt.userPromptTemplate,
        variables
      ),
    };
  };

  const simulateProgress = (categoryCount) => {
    setProgress(0);
    let currentProgress = 0;
    const increment = 100 / categoryCount;

    const interval = setInterval(() => {
      currentProgress += increment;
      setProgress(Math.min(currentProgress, 95));

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 1000);

    return interval;
  };

  const generateDataset = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir kategori seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    if (!datasetName.trim()) {
      toast({
        title: "Hata",
        description: "Dataset adı girmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    const progressInterval = simulateProgress(selectedCategories.length);

    try {
      const generatedCategories = [];

      for (const categoryKey of selectedCategories) {
        const categoryData = DEFAULT_TITLE_CATEGORIES.find(
          (cat) => cat.key === categoryKey
        );
        if (!categoryData) continue;

        setCurrentCategory(categoryData.name);

        // Firestore prompt'ları template olarak kullan, yoksa fallback
        const { systemPrompt, userPrompt } = generatePrompts(
          categoryData,
          titlesPerCategory
        );

        // Unified AI ile generate et
        const result = await generateContent(userPrompt, {
          systemPrompt,
          maxTokens: maxTokens,
          temperature: creativity / 100,
          modelId: selectedModelId,
        });

        // Hata kontrolü
        if (!result || result.success === false) {
          console.error(
            "AI üretim hatası:",
            result?.error || "Bilinmeyen hata"
          );
          continue; // Sonraki kategoriye geç
        }

        // Parse titles from response - result yapısını kontrol et
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
          continue; // Sonraki kategoriye geç
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
          .slice(0, titlesPerCategory);

        if (titles.length > 0) {
          generatedCategories.push({
            categoryKey,
            titles,
          });
        }
      }

      const dataset = {
        name: datasetName,
        description: datasetDescription,
        categories: generatedCategories,
        isActive: true,
        aiModel: selectedModelId || hookSelectedModel?.modelId,
        generatedBy: "ai_generator",
        aiSettings: {
          titlesPerCategory,
          creativity,
          targetAudience,
          includeEmoji,
          includeNumbers,
        },
      };

      setGeneratedDataset(dataset);
      setProgress(100);

      toast({
        title: "🎉 Dataset Oluşturuldu!",
        description: `${
          generatedCategories.length
        } kategori için ${generatedCategories.reduce(
          (sum, cat) => sum + cat.titles.length,
          0
        )} başlık üretildi.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Dataset üretim hatası:", error);
      toast({
        title: "Hata",
        description: `Dataset üretilirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      clearInterval(progressInterval);
      setCurrentCategory("");
    }
  };

  const handleSaveDataset = async () => {
    if (!generatedDataset) return;

    const validation = validateTitleDataset(generatedDataset);
    if (!validation.isValid) {
      toast({
        title: "Doğrulama Hatası",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setShowSaveDialog(false);

    try {
      const datasetId = await createTitleDataset(generatedDataset);

      toast({
        title: "Dataset Kaydedildi",
        description: "Başlık dataset'i başarıyla Firestore'a kaydedildi.",
        variant: "default",
      });

      // Reset form
      setGeneratedDataset(null);
      setDatasetName("");
      setDatasetDescription("");
      setProgress(0);

      if (onDatasetCreated) {
        onDatasetCreated(datasetId);
      }
    } catch (error) {
      console.error("Dataset kayıt hatası:", error);
      toast({
        title: "Kayıt Hatası",
        description: `Dataset kaydedilirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditTitle = (categoryIndex, titleIndex, newTitle) => {
    if (!generatedDataset) return;

    const updatedDataset = { ...generatedDataset };
    updatedDataset.categories[categoryIndex].titles[titleIndex] = newTitle;
    setGeneratedDataset(updatedDataset);
  };

  const handleDeleteTitle = (categoryIndex, titleIndex) => {
    if (!generatedDataset) return;

    const updatedDataset = { ...generatedDataset };
    updatedDataset.categories[categoryIndex].titles.splice(titleIndex, 1);
    setGeneratedDataset(updatedDataset);
  };

  const handleAddTitle = (categoryIndex) => {
    if (!generatedDataset) return;

    const updatedDataset = { ...generatedDataset };
    updatedDataset.categories[categoryIndex].titles.push(
      "Yeni başlık ekleyin..."
    );
    setGeneratedDataset(updatedDataset);
  };

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Dataset Configuration */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Brain className="mr-2 h-5 w-5" />
              AI Dataset Yapılandırması
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="datasetName">Dataset Adı *</Label>
                <Input
                  id="datasetName"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Örn: 2024 Blog Başlıkları V1"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="datasetDesc">Açıklama</Label>
                <Input
                  id="datasetDesc"
                  value={datasetDescription}
                  onChange={(e) => setDatasetDescription(e.target.value)}
                  placeholder="Dataset hakkında kısa açıklama"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>
            </div>

            {/* AI Model Selection - Firestore'dan gelen modeller */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                AI Model Seçimi
                {configLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </Label>

              {availableModels.length === 0 && !configLoading ? (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                    <Info className="h-4 w-4" />
                    Model Bulunamadı
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Firestore'da{" "}
                    <code className="bg-red-100 px-1 rounded">
                      blog_title_dataset
                    </code>{" "}
                    konfigürasyonu veya izin verilen modeller tanımlı değil.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableModels.map((model) => {
                    const modelId = model.modelId || model.id;
                    const isSelected = selectedModelId === modelId;
                    const providerInfo = PROVIDER_INFO[model.provider] || {};

                    return (
                      <div
                        key={modelId}
                        className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? "border-purple-500 bg-purple-50 shadow-md scale-[1.02]"
                            : "border-gray-200 hover:border-purple-300 hover:shadow-sm"
                        }`}
                        onClick={() => {
                          setSelectedModelId(modelId);
                          selectModel(modelId);
                        }}
                      >
                        {model.isDefault && (
                          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Varsayılan
                          </Badge>
                        )}
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${
                              providerInfo.gradient ||
                              "from-gray-500 to-gray-600"
                            }`}
                          >
                            <span className="text-lg">
                              {providerInfo.icon || "🤖"}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {model.displayName || model.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {model.description?.slice(0, 50) ||
                                providerInfo.name}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="absolute bottom-2 right-2 h-5 w-5 text-purple-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Model Config - Gelişmiş Ayarlar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  AI Konfigürasyonu
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  {showAdvancedSettings ? "Gizle" : "Göster"}
                </Button>
              </div>

              {/* Özet Bilgi */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Max Tokens</div>
                  <div className="font-semibold text-gray-900">{maxTokens}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Temperature</div>
                  <div className="font-semibold text-gray-900">
                    {(creativity / 100).toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Provider</div>
                  <div className="font-semibold text-gray-900">
                    {hookSelectedModel?.provider ||
                      firestoreConfig?.defaultProvider ||
                      "-"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Model</div>
                  <div className="font-semibold text-gray-900 text-xs truncate">
                    {hookSelectedModel?.displayName ||
                      hookSelectedModel?.name ||
                      selectedModelId ||
                      "-"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Tip</div>
                  <div
                    className={`font-semibold text-xs ${
                      isThinkingModel() ? "text-amber-600" : "text-green-600"
                    }`}
                  >
                    {isThinkingModel() ? "🧠 Thinking" : "⚡ Normal"}
                  </div>
                </div>
              </div>

              {/* Gelişmiş Ayarlar Paneli */}
              {showAdvancedSettings && (
                <div className="space-y-4 p-4 bg-purple-50/50 rounded-lg border border-purple-200">
                  {/* Thinking Model Uyarısı */}
                  {isThinkingModel() && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                        <Brain className="h-4 w-4" />
                        Thinking Model Algılandı
                      </div>
                      <p className="text-xs text-amber-600 mt-1">
                        Bu model (Gemini 3 Pro, Claude Opus vb.) "düşünme"
                        aşaması için ekstra token harcar. Otomatik hesaplamada
                        +2000 token ekleniyor.
                      </p>
                    </div>
                  )}

                  {/* Max Tokens */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        Max Tokens
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>AI'ın üretebileceği maksimum token sayısı.</p>
                            <p className="mt-1">• Her başlık ~20 token</p>
                            <p>• Thinking modeller +2000 token harcar</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Otomatik</span>
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
                          {isThinkingModel() ? (
                            <span>
                              Thinking Model: {titlesPerCategory} başlık × 20
                              token + 2000 (thinking) ={" "}
                              <strong>{maxTokens}</strong> token
                            </span>
                          ) : (
                            <span>
                              Normal Model: {titlesPerCategory} başlık × 20
                              token × 2 = <strong>{maxTokens}</strong> token
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <Slider
                          value={[maxTokens]}
                          onValueChange={(value) => setMaxTokens(value[0])}
                          max={8000}
                          min={500}
                          step={100}
                          className="w-full"
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

                  {/* Firestore Config Bilgisi */}
                  {firestoreConfig && (
                    <div className="pt-3 border-t border-purple-200">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Firestore Konfigürasyonu
                      </Label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between p-2 bg-white rounded border">
                          <span className="text-gray-500">Context:</span>
                          <span className="font-mono">
                            {firestoreConfig.contextId ||
                              firestoreConfig.context}
                          </span>
                        </div>
                        <div className="flex justify-between p-2 bg-white rounded border">
                          <span className="text-gray-500">Operation:</span>
                          <span className="font-mono">
                            {firestoreConfig.operation}
                          </span>
                        </div>
                        <div className="flex justify-between p-2 bg-white rounded border">
                          <span className="text-gray-500">Default Model:</span>
                          <span className="font-mono">
                            {firestoreConfig.defaultModelId}
                          </span>
                        </div>
                        <div className="flex justify-between p-2 bg-white rounded border">
                          <span className="text-gray-500">Prompt Key:</span>
                          <span className="font-mono">
                            {firestoreConfig.promptKey}
                          </span>
                        </div>
                        {firestoreConfig.settings?.temperature && (
                          <div className="flex justify-between p-2 bg-white rounded border">
                            <span className="text-gray-500">
                              DB Temperature:
                            </span>
                            <span className="font-mono">
                              {firestoreConfig.settings.temperature}
                            </span>
                          </div>
                        )}
                        {firestoreConfig.settings?.maxTokens && (
                          <div className="flex justify-between p-2 bg-white rounded border">
                            <span className="text-gray-500">DB MaxTokens:</span>
                            <span className="font-mono">
                              {firestoreConfig.settings.maxTokens}
                            </span>
                          </div>
                        )}
                      </div>
                      {firestoreConfig.allowedModelIds?.length > 0 && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <span className="text-gray-500 text-xs">
                            İzin Verilen Modeller:{" "}
                          </span>
                          <span className="font-mono text-xs">
                            {firestoreConfig.allowedModelIds.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Model Limitleri */}
                  {hookSelectedModel?.limits && (
                    <div className="pt-3 border-t border-purple-200">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Model Limitleri
                      </Label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {hookSelectedModel.limits.maxTokens && (
                          <div className="flex justify-between p-2 bg-white rounded border">
                            <span className="text-gray-500">Max Output:</span>
                            <span className="font-mono">
                              {hookSelectedModel.limits.maxTokens.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {hookSelectedModel.limits.contextWindow && (
                          <div className="flex justify-between p-2 bg-white rounded border">
                            <span className="text-gray-500">
                              Context Window:
                            </span>
                            <span className="font-mono">
                              {hookSelectedModel.limits.contextWindow.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Aktif System Prompt Bilgisi */}
            {firestorePrompt ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Aktif Prompt: {firestorePrompt.name || firestorePrompt.key}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPromptPreview(true)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Önizle
                  </Button>
                </div>
                <div className="text-xs text-blue-600 space-y-1 mt-2">
                  {firestorePrompt.systemPrompt && (
                    <p className="line-clamp-1">
                      <strong>System:</strong>{" "}
                      {firestorePrompt.systemPrompt?.slice(0, 80)}...
                    </p>
                  )}
                  {firestorePrompt.userPromptTemplate && (
                    <p className="line-clamp-1">
                      <strong>User:</strong>{" "}
                      {firestorePrompt.userPromptTemplate?.slice(0, 80)}...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              !configLoading && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                    <Info className="h-4 w-4" />
                    Prompt Bulunamadı
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Firestore'da{" "}
                    <code className="bg-red-100 px-1 rounded">
                      blog_title_dataset_generation
                    </code>{" "}
                    prompt'u tanımlı değil. AI Ayarlarından prompt'ları
                    yükleyin.
                  </p>
                </div>
              )
            )}

            {/* Generation Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Kategori Başına Başlık Sayısı
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 ml-2 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Her kategori için kaç başlık üretileceği</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Slider
                    value={[titlesPerCategory]}
                    onValueChange={(value) => setTitlesPerCategory(value[0])}
                    max={20}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5</span>
                    <span className="font-medium">
                      {titlesPerCategory} başlık
                    </span>
                    <span>20</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    Yaratıcılık Seviyesi
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 ml-2 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          %30 = Konservatif, %70 = Dengeli, %100 = Çok yaratıcı
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Slider
                    value={[creativity]}
                    onValueChange={(value) => setCreativity(value[0])}
                    max={100}
                    min={30}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>%30</span>
                    <span className="font-medium">%{creativity}</span>
                    <span>%100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hedef Kitle</Label>
                  <Select
                    value={targetAudience}
                    onValueChange={setTargetAudience}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">
                        Profesyoneller (B2B)
                      </SelectItem>
                      <SelectItem value="casual">
                        Genel Okuyucular (B2C)
                      </SelectItem>
                      <SelectItem value="technical">Teknik Uzmanlar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <div className="font-medium text-purple-900">
                      Emoji Kullan
                    </div>
                    <div className="text-sm text-purple-700">
                      Başlıklarda emoji karakterleri
                    </div>
                  </div>
                  <Switch
                    checked={includeEmoji}
                    onCheckedChange={setIncludeEmoji}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <div className="font-medium text-purple-900">
                      Sayı ve İstatistik
                    </div>
                    <div className="text-sm text-purple-700">
                      Rakamlar ve yüzdeler ekle
                    </div>
                  </div>
                  <Switch
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                  />
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Kategoriler ({selectedCategories.length}/8)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DEFAULT_TITLE_CATEGORIES.map((category) => (
                  <div
                    key={category.key}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedCategories.includes(category.key)
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => {
                      if (selectedCategories.includes(category.key)) {
                        setSelectedCategories(
                          selectedCategories.filter(
                            (key) => key !== category.key
                          )
                        );
                      } else {
                        setSelectedCategories([
                          ...selectedCategories,
                          category.key,
                        ]);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {category.description}
                        </div>
                      </div>
                      {selectedCategories.includes(category.key) && (
                        <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generation Progress */}
            {generating && (
              <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <span className="font-medium text-purple-900">
                    AI Dataset Üretiliyor...
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-purple-700">
                  <span>
                    {currentCategory && `İşlenen: ${currentCategory}`}
                  </span>
                  <span>%{Math.round(progress)}</span>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button
                onClick={generateDataset}
                disabled={
                  generating ||
                  aiLoading ||
                  configLoading ||
                  !isReady ||
                  !firestorePrompt ||
                  selectedCategories.length === 0 ||
                  !datasetName.trim() ||
                  availableModels.length === 0
                }
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8"
              >
                {generating || aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Üretiliyor...
                  </>
                ) : configLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : !firestorePrompt ? (
                  <>
                    <Info className="mr-2 h-4 w-4" />
                    Prompt Gerekli
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Dataset Üret
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Dataset Preview */}
        {generatedDataset && (
          <Card className="border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-green-700">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Üretilen Dataset Önizlemesi
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="border-green-300"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    {editMode ? "Düzenlemeyi Bitir" : "Düzenle"}
                  </Button>
                  <Button
                    onClick={() => setShowSaveDialog(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dataset Info */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-green-600 font-medium">Dataset</div>
                    <div className="text-green-800">
                      {generatedDataset.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-600 font-medium">
                      Toplam Kategori
                    </div>
                    <div className="text-green-800">
                      {generatedDataset.categories.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-600 font-medium">
                      Toplam Başlık
                    </div>
                    <div className="text-green-800">
                      {generatedDataset.categories.reduce(
                        (sum, cat) => sum + cat.titles.length,
                        0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-600 font-medium">AI Model</div>
                    <div className="text-green-800">
                      {hookSelectedModel?.displayName ||
                        hookSelectedModel?.name ||
                        selectedModelId}
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories and Titles */}
              <div className="space-y-4">
                {generatedDataset.categories.map((category, categoryIndex) => {
                  const categoryData = DEFAULT_TITLE_CATEGORIES.find(
                    (c) => c.key === category.categoryKey
                  );
                  return (
                    <Card
                      key={category.categoryKey}
                      className="border-gray-200"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <span className="mr-2">{categoryData?.icon}</span>
                          {categoryData?.name}
                          <Badge variant="outline" className="ml-2">
                            {category.titles.length} başlık
                          </Badge>
                          {editMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddTitle(categoryIndex)}
                              className="ml-auto"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {category.titles.map((title, titleIndex) => (
                            <div
                              key={titleIndex}
                              className="flex items-center group"
                            >
                              {editMode ? (
                                <div className="flex items-center space-x-2 flex-1">
                                  <Input
                                    value={title}
                                    onChange={(e) =>
                                      handleEditTitle(
                                        categoryIndex,
                                        titleIndex,
                                        e.target.value
                                      )
                                    }
                                    className="text-sm"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteTitle(
                                        categoryIndex,
                                        titleIndex
                                      )
                                    }
                                    className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-700 flex-1 p-2 bg-gray-50 rounded border">
                                  {title}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Confirmation Dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <Save className="mr-2 h-5 w-5 text-green-600" />
                Dataset Kaydet
              </AlertDialogTitle>
              <AlertDialogDescription>
                Bu dataset Firestore'a kaydedilecek ve blog başlığı seçiminde
                kullanılabilir hale gelecek.
                <br />
                <br />
                <strong>Dataset Özeti:</strong>
                <br />• Ad: {generatedDataset?.name}
                <br />• Kategoriler: {generatedDataset?.categories.length}
                <br />• Toplam başlık:{" "}
                {generatedDataset?.categories.reduce(
                  (sum, cat) => sum + cat.titles.length,
                  0
                )}
                <br />• AI Model:{" "}
                {hookSelectedModel?.displayName ||
                  hookSelectedModel?.name ||
                  selectedModelId}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSaveDataset}
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

        {/* Prompt Preview Dialog */}
        <AlertDialog
          open={showPromptPreview}
          onOpenChange={setShowPromptPreview}
        >
          <AlertDialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-purple-600" />
                Prompt Önizleme
              </AlertDialogTitle>
              <AlertDialogDescription>
                Değişkenler yerine örnek değerler konulmuş prompt. Seçili
                kategori ve ayarlara göre dinamik olarak güncellenir.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {/* System Prompt */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  System Prompt
                </Label>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <pre className="text-xs text-purple-900 whitespace-pre-wrap font-mono leading-relaxed">
                    {firestorePrompt?.systemPrompt
                      ? buildPromptFromTemplate(
                          firestorePrompt.systemPrompt,
                          getPromptVariables(
                            selectedCategories.length > 0
                              ? DEFAULT_TITLE_CATEGORIES.find(
                                  (c) => c.key === selectedCategories[0]
                                ) || {
                                  name: "Örnek Kategori",
                                  description: "Örnek açıklama",
                                }
                              : {
                                  name: "Örnek Kategori",
                                  description: "Örnek açıklama",
                                },
                            titlesPerCategory
                          )
                        )
                      : "System prompt tanımlı değil"}
                  </pre>
                </div>
              </div>

              {/* User Prompt */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  User Prompt (İlk Kategori Örneği)
                </Label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <pre className="text-xs text-blue-900 whitespace-pre-wrap font-mono leading-relaxed">
                    {firestorePrompt?.userPromptTemplate
                      ? buildPromptFromTemplate(
                          firestorePrompt.userPromptTemplate,
                          getPromptVariables(
                            selectedCategories.length > 0
                              ? DEFAULT_TITLE_CATEGORIES.find(
                                  (c) => c.key === selectedCategories[0]
                                ) || {
                                  name: "Örnek Kategori",
                                  description: "Örnek açıklama",
                                }
                              : {
                                  name: "Örnek Kategori",
                                  description: "Örnek açıklama",
                                },
                            titlesPerCategory
                          )
                        )
                      : "User prompt template tanımlı değil"}
                  </pre>
                </div>
              </div>

              {/* Değişkenler Tablosu */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Aktif Değişkenler
                </Label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Başlık Sayısı:</span>
                      <span className="font-medium">{titlesPerCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Yaratıcılık:</span>
                      <span className="font-medium">%{creativity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hedef Kitle:</span>
                      <span className="font-medium">
                        {targetAudience === "professional"
                          ? "B2B"
                          : targetAudience === "casual"
                          ? "B2C"
                          : "Teknik"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Emoji:</span>
                      <span className="font-medium">
                        {includeEmoji ? "Evet" : "Hayır"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sayılar:</span>
                      <span className="font-medium">
                        {includeNumbers ? "Evet" : "Hayır"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kategori:</span>
                      <span className="font-medium">
                        {selectedCategories.length} seçili
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Kapat</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default AITitleGenerator;
