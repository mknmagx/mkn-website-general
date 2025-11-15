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
import useClaude from "@/hooks/use-claude";
import {
  DEFAULT_TITLE_CATEGORIES,
  createTitleDataset,
  validateTitleDataset,
} from "@/lib/services/blog-title-service";

// AI Models Configuration - Claude Only
const AI_MODELS = {
  "claude-sonnet": {
    id: "claude-sonnet",
    name: "Claude Sonnet 4.5",
    description: "En akıllı model, yaratıcı ve çeşitli başlıklar",
    icon: Brain,
    recommended: false,
    color: "bg-gradient-to-r from-purple-500 to-indigo-600",
  },
  "claude-haiku": {
    id: "claude-haiku",
    name: "Claude Haiku 4.5",
    description: "Hızlı ve etkili başlık üretimi",
    icon: Zap,
    recommended: true,
    color: "bg-gradient-to-r from-green-500 to-emerald-600",
  },
  "claude-opus": {
    id: "claude-opus",
    name: "Claude Opus 4.1",
    description: "Profesyonel ve detaylı başlıklar",
    icon: Cpu,
    recommended: false,
    color: "bg-gradient-to-r from-blue-500 to-cyan-600",
  },
};

const AITitleGenerator = ({ onDatasetCreated, className }) => {
  const { toast } = useToast();
  const { generateContent, loading: aiLoading } = useClaude();

  // States
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-haiku");
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

  // Initialize with all categories selected
  useEffect(() => {
    setSelectedCategories(DEFAULT_TITLE_CATEGORIES.map((cat) => cat.key));
  }, []);

  const generateTitlePrompt = (categoryData, count) => {
    return `MKN Group için "${
      categoryData.name
    }" kategorisinde ${count} adet blog başlığı üret.

KATEGORİ BİLGİSİ:
- Kategori: ${categoryData.name} 
- Açıklama: ${categoryData.description}

BAŞLIK GEREKSİNİMLERİ:
- Türkçe olmalı
- SEO dostu ve anahtar kelime içermeli
- ${
      targetAudience === "professional"
        ? "Profesyonel ve güvenilir ton"
        : targetAudience === "casual"
        ? "Rahat ve samimi ton"
        : "Meraklı ve öğretici ton"
    }
- Yaratıcılık seviyesi: %${creativity}
- ${includeNumbers ? "Sayılar ve istatistikler içerebilir" : "Sayılardan kaçın"}
- ${includeEmoji ? "Uygun emoji kullanabilirsin" : "Emoji kullanma"}
- Başlık uzunluğu: 40-60 karakter arası ideal
- Tıklanabilir ve merak uyandırıcı

MKN GROUP HİZMETLERİ:
- Kozmetik fason üretimi (GMP, Halal sertifikalı)
- Gıda takviyesi üretimi (HACCP sertifikalı)  
- Temizlik ürünleri üretimi
- Ambalaj tasarımı ve üretimi (Airless, premium)
- E-ticaret operasyon hizmetleri (3PL, fulfillment)

ÇIKTI FORMATI:
Sadece başlıkları listele, her satırda bir başlık. Hiçbir açıklama ekleme.

ÖRNEK ÇIKTI:
MKN Group'tan Kozmetik Fason Üretimde Başarı Rehberi
GMP Sertifikalı Üretimin İş Büyütme Etkisi
Halal Kozmetik Üretimi: Neden Tercih Edilmeli?

Şimdi "${categoryData.name}" için ${count} başlık üret:`;
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

        const prompt = generateTitlePrompt(categoryData, titlesPerCategory);

        const response = await generateContent(prompt, {
          systemPrompt: `Sen MKN Group için blog başlığı üreticisisin. Türkçe, SEO dostu, tıklanabilir başlıklar üret. Sadece başlık listesi döndür, başka açıklama ekleme.`,
          maxTokens: 1500,
          temperature: creativity / 100,
        });

        // Parse titles from response
        const titles = response
          .split("\n")
          .map((line) => line.trim())
          .filter(
            (line) => line && !line.startsWith("-") && !line.startsWith("*")
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
        aiModel: selectedModel,
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

            {/* AI Model Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">AI Model Seçimi</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(AI_MODELS).map((model) => (
                  <div
                    key={model.id}
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedModel === model.id
                        ? "border-purple-500 bg-purple-50 shadow-md scale-[1.02]"
                        : "border-gray-200 hover:border-purple-300 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    {model.recommended && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Önerilen
                      </Badge>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${model.color}`}>
                        {(() => {
                          const IconComponent = model.icon;
                          return (
                            <IconComponent className="h-5 w-5 text-white" />
                          );
                        })()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {model.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {model.description}
                        </div>
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <CheckCircle className="absolute bottom-2 right-2 h-5 w-5 text-purple-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

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
                  selectedCategories.length === 0 ||
                  !datasetName.trim()
                }
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Üretiliyor...
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
                      {AI_MODELS[selectedModel].name}
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
                <br />• AI Model: {AI_MODELS[selectedModel].name}
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
      </div>
    </TooltipProvider>
  );
};

export default AITitleGenerator;
