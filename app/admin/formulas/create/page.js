"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Sparkles,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle2,
  Edit3,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Package,
  Layers,
  Beaker,
  Brain,
  Zap,
  Cpu,
  Settings,
  FileText,
  Sliders,
  Eye,
  Code,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as FormulaService from "@/lib/services/formula-service";

// Unified AI Hook - Firestore'dan dinamik config
import { useUnifiedAI, AI_CONTEXTS } from "@/hooks/use-unified-ai";
import { PROVIDER_INFO } from "@/lib/ai-constants";

// Function türlerinin Türkçe karşılıkları
const getFunctionTurkish = (functionEn) => {
  const translations = {
    Solvent: "Çözücü",
    Carrier: "Taşıyıcı",
    Moisturizer: "Nemlendirici",
    Humectant: "Nemlendirici",
    Emulsifier: "Emülgatör",
    Thickener: "Koyulaştırıcı",
    Preservative: "Koruyucu",
    Fragrance: "Parfüm",
    Perfume: "Parfüm",
    Oil: "Yağ",
    "Active Ingredient": "Aktif Madde",
    Antioxidant: "Antioksidan",
    "pH Adjuster": "pH Düzenleyici",
    Colorant: "Renklendirici",
    Other: "Diğer",
  };
  return translations[functionEn] || functionEn;
};

const PRODUCT_TYPES = [
  { value: "kozmetik", label: "Kozmetik" },
  { value: "gida", label: "Gıda" },
  { value: "temizlik", label: "Temizlik" },
  { value: "kisisel-bakim", label: "Kişisel Bakım" },
  { value: "diger", label: "Diğer" },
];

const UNITS = [
  { value: "gram", label: "Gram (g)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "ml", label: "Mililitre (ml)" },
  { value: "litre", label: "Litre (L)" },
  { value: "adet", label: "Adet" },
];

const FUNCTION_TYPES = [
  { value: "Solvent", label: "Çözücü" },
  { value: "Carrier", label: "Taşıyıcı" },
  { value: "Moisturizer", label: "Nemlendirici" },
  { value: "Emulsifier", label: "Emülgatör" },
  { value: "Thickener", label: "Koyulaştırıcı" },
  { value: "Preservative", label: "Koruyucu" },
  { value: "Fragrance", label: "Parfüm" },
  { value: "Oil", label: "Yağ" },
  { value: "Active Ingredient", label: "Aktif Madde" },
  { value: "Antioxidant", label: "Antioksidan" },
  { value: "pH Adjuster", label: "pH Düzenleyici" },
  { value: "Colorant", label: "Renklendirici" },
  { value: "Other", label: "Diğer" },
];

export default function CreateFormulaPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Unified AI Hook - Firestore'dan dinamik config
  const {
    config: unifiedConfig,
    availableModels,
    modelsByProvider,
    selectedModel: currentModel,
    currentProvider,
    generateContent,
    selectModel,
    loading: aiLoading,
    configLoading,
    error: aiError,
    isReady: aiIsReady,
    hasModels,
    refresh: refreshAIConfig,
    getProviderIcon,
    prompt: firestorePrompt,
  } = useUnifiedAI(AI_CONTEXTS.FORMULA_GENERATION);

  // Fiyat analizi için ayrı hook
  const {
    generateContent: generatePriceAnalysis,
    loading: priceAnalysisLoading,
    prompt: priceAnalysisPrompt, // Firestore'dan fiyat analizi prompt'u
  } = useUnifiedAI(AI_CONTEXTS.FORMULA_PRICE_ANALYSIS);

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState({
    productName: "",
    productType: "kozmetik",
    productVolume: "",
    productionQuantity: "", // Toplam üretim adedi
    description: "",
    formulaLevel: 5,
    selectedModel: null, // useUnifiedAI'dan dinamik olarak set edilecek
  });

  // Unified AI config yüklendiginde default model'i set et
  useEffect(() => {
    if (currentModel && !aiConfig.selectedModel) {
      setAiConfig((prev) => ({
        ...prev,
        selectedModel: currentModel.modelId || currentModel.id,
      }));
    }
  }, [currentModel, aiConfig.selectedModel]);

  // Formula State
  const [formula, setFormula] = useState({
    name: "",
    productType: "kozmetik",
    productVolume: "",
    productionQuantity: "",
    notes: "",
    ingredients: [],
  });

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [step, setStep] = useState(1); // 1: AI Config, 2: Review/Edit, 3: Save
  const [loadingPriceFor, setLoadingPriceFor] = useState(null); // Track which ingredient is loading price

  // Settings Dialog State
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("config");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  
  // Model Settings State (maxToken control)
  const [modelSettings, setModelSettings] = useState({
    maxTokens: 8000,
    autoMaxTokens: true,
    temperature: 0.7,
  });

  // Check if current model is a thinking model
  const isThinkingModel = (modelId) => {
    if (!modelId) return false;
    const id = modelId.toLowerCase();
    return (
      id.includes("gemini-2") ||
      id.includes("gemini-exp") ||
      id.includes("thinking") ||
      id.includes("claude-opus") ||
      id.includes("opus") ||
      id.includes("o1") ||
      id.includes("o3")
    );
  };

  // Calculate auto max tokens based on model and formula level
  const calculateAutoMaxTokens = () => {
    const modelId = aiConfig.selectedModel || currentModel?.modelId || currentModel?.id;
    const level = aiConfig.formulaLevel || 5;
    
    // Base tokens: formül seviyesine göre (daha yüksek seviye = daha fazla hammadde = daha fazla token)
    const baseTokens = 3000 + (level * 300); // 3300 - 6000 arası
    
    // Thinking model overhead
    const thinkingOverhead = isThinkingModel(modelId) ? 4000 : 0;
    
    const total = baseTokens + thinkingOverhead;
    // Min 6000, max 16000
    return Math.min(16000, Math.max(6000, total));
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Get current model settings
  const getCurrentModelSettings = () => {
    const activeModel = availableModels?.find(
      (m) => m.modelId === aiConfig.selectedModel || m.id === aiConfig.selectedModel
    ) || currentModel;
    return activeModel?.settings || {};
  };

  // ============================================================================
  // AI INGREDIENT PRICE SUGGESTION
  // ============================================================================

  const handleGetPriceSuggestion = async (index) => {
    const ingredient = formula.ingredients[index];

    if (!ingredient.name.trim()) {
      toast({
        title: "Uyarı",
        description: "Önce hammadde adını girin.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPriceFor(index);

    try {
      const priceData = await FormulaService.getAIIngredientPrice(
        {
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          supplier: ingredient.supplier,
          productType: formula.productType,
          productName: formula.name,
        },
        // Unified AI generateContent wrapper - API uyumluluğu için
        async (prompt, options = {}) => {
          const result = await generatePriceAnalysis(prompt, {
            maxTokens: options.maxTokens || 2000,
            temperature: 0.7,
            // ✅ FIX: System prompt'u ayrı olarak geç - token tekrarını önler
            systemPrompt: options.systemPrompt,
          });
          return result?.content || result;
        },
        // Firestore'dan gelen price analysis prompt - dinamik prompt sistemi
        priceAnalysisPrompt
      );

      // Update ingredient with suggested price
      handleIngredientChange(index, "price", priceData.estimatedPrice || 0);

      toast({
        title: "Fiyat Önerisi Alındı",
        description: `${ingredient.name}: ${priceData.estimatedPrice} TL/kg (${priceData.priceRange?.min}-${priceData.priceRange?.max} TL/kg)`,
      });
    } catch (error) {
      console.error("Price suggestion error:", error);
      toast({
        title: "Hata",
        description: "Fiyat önerisi alınırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoadingPriceFor(null);
    }
  };

  // ============================================================================
  // AI FORMULA GENERATION
  // ============================================================================

  const handleGenerateFormula = async () => {
    // Validation
    if (!aiConfig.productName.trim()) {
      toast({
        title: "Hata",
        description: "Ürün adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    if (!aiConfig.productVolume) {
      toast({
        title: "Hata",
        description: "Ürün hacmi gereklidir.",
        variant: "destructive",
      });
      return;
    }

    if (!aiConfig.productionQuantity) {
      toast({
        title: "Hata",
        description: "Üretim adedi gereklidir.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await FormulaService.generateAIFormula(
        {
          ...aiConfig,
          // Model ID'yi doğrudan geç - useUnifiedAI modeli yönetir
          selectedModel:
            aiConfig.selectedModel || currentModel?.modelId || currentModel?.id,
        },
        // Unified AI generateContent wrapper - API uyumluluğu için
        async (prompt, options = {}) => {
          // Use modelSettings if auto is off, otherwise calculate based on model
          const maxTokens = modelSettings.autoMaxTokens 
            ? calculateAutoMaxTokens()
            : modelSettings.maxTokens;
          const temperature = modelSettings.autoMaxTokens 
            ? 0.7 
            : modelSettings.temperature;
          
          console.log("[FormulaCreate] Using maxTokens:", maxTokens, "autoMode:", modelSettings.autoMaxTokens);
            
          const result = await generateContent(prompt, {
            maxTokens,
            temperature,
            modelId: options.model || aiConfig.selectedModel,
            // ✅ FIX: System prompt'u ayrı olarak geç - token tekrarını önler
            systemPrompt: options.systemPrompt,
          });
          
          // Check if result is successful and has content
          if (!result?.success) {
            throw new Error(result?.error || "AI generation failed");
          }
          
          if (!result?.content || typeof result.content !== 'string') {
            throw new Error("AI returned empty or invalid response");
          }
          
          return result.content;
        },
        // Firestore'dan gelen prompt config - dinamik prompt sistemi
        firestorePrompt
      );

      // Map AI result to formula format
      const ingredients = result.formula.map((item) => ({
        name: item.name,
        displayName: item.displayName || item.name, // Türkçe ad varsa kullan
        amount: parseFloat(item.amount) || 0,
        unit: item.unit || "gram",
        price: parseFloat(item.estimatedPrice) || 0,
        supplier: "",
        function: item.function || "Other",
        functionTr: getFunctionTurkish(item.function || "Other"),
      }));

      setFormula({
        name: aiConfig.productName,
        productType: aiConfig.productType,
        productVolume: aiConfig.productVolume,
        productionQuantity: aiConfig.productionQuantity,
        notes: result.suggestions || "",
        ingredients: ingredients,
      });

      setGeneratedData(result);
      setStep(2);

      toast({
        title: "Başarılı!",
        description: `${ingredients.length} hammadde ile formül oluşturuldu.`,
      });
    } catch (error) {
      console.error("AI generation error:", error);

      let errorMessage = "Formül oluşturulurken bir hata oluştu.";

      if (error.message.includes("JSON parse")) {
        errorMessage =
          "AI yanıtı işlenirken hata oluştu. Lütfen tekrar deneyin veya farklı bir model seçin.";
      } else if (error.message.includes("Claude API Error")) {
        errorMessage =
          "AI servisi ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================================
  // INGREDIENT MANAGEMENT
  // ============================================================================

  const handleAddIngredient = () => {
    setFormula((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          name: "",
          displayName: "",
          amount: 0,
          unit: "gram",
          price: 0,
          supplier: "",
          function: "Other",
          functionTr: "Diğer",
        },
      ],
    }));
  };

  const handleRemoveIngredient = (index) => {
    setFormula((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setFormula((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => {
        if (i === index) {
          const updated = { ...ing, [field]: value };
          // Update functionTr when function changes
          if (field === "function") {
            updated.functionTr = getFunctionTurkish(value);
          }
          return updated;
        }
        return ing;
      }),
    }));
  };

  // ============================================================================
  // SAVE FORMULA
  // ============================================================================

  const handleSaveFormula = async () => {
    // Validation
    if (!formula.name.trim()) {
      toast({
        title: "Hata",
        description: "Formül adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const validIngredients = formula.ingredients.filter(
      (ing) => ing.name && ing.amount > 0
    );

    if (validIngredients.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir geçerli hammadde eklemelisiniz.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Model bilgisini unified AI'dan al
      const activeModel =
        availableModels?.find(
          (m) =>
            m.modelId === aiConfig.selectedModel ||
            m.id === aiConfig.selectedModel
        ) || currentModel;

      await FormulaService.saveFormula({
        ...formula,
        ingredients: validIngredients,
        aiConfig: {
          productName: aiConfig.productName,
          productType: aiConfig.productType,
          productVolume: aiConfig.productVolume,
          description: aiConfig.description,
          formulaLevel: aiConfig.formulaLevel,
          selectedModel: aiConfig.selectedModel,
          modelName:
            activeModel?.name || activeModel?.displayName || "AI Model",
          provider: activeModel?.provider || currentProvider?.id || "unified",
          generatedAt: new Date().toISOString(),
        },
      });

      toast({
        title: "Başarılı!",
        description: "Formül başarıyla kaydedildi.",
      });

      // Redirect to formulas list
      router.push("/admin/formulas");
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Hata",
        description: "Formül kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // CALCULATE TOTALS
  // ============================================================================

  const calculateTotals = () => {
    let totalAmount = 0;
    let totalCost = 0;

    formula.ingredients.forEach((ing) => {
      const amount = parseFloat(ing.amount) || 0;
      const price = parseFloat(ing.price) || 0;

      // Convert to grams
      let amountInGrams = amount;
      if (ing.unit === "kg") amountInGrams = amount * 1000;
      else if (ing.unit === "ml") amountInGrams = amount;
      else if (ing.unit === "litre") amountInGrams = amount * 1000;

      totalAmount += amountInGrams;

      // Calculate cost (price is per kg)
      if (ing.unit === "gram" || ing.unit === "ml") {
        totalCost += (amount / 1000) * price;
      } else if (ing.unit === "kg" || ing.unit === "litre") {
        totalCost += amount * price;
      } else {
        totalCost += amount * price;
      }
    });

    return {
      totalAmount: totalAmount.toFixed(2),
      totalCost: totalCost.toFixed(2),
      costPerGram:
        totalAmount > 0 ? (totalCost / totalAmount).toFixed(4) : "0.0000",
    };
  };

  const totals = calculateTotals();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                Yeni Formül Oluştur
              </h1>
              <p className="text-gray-600 mt-2 ml-14">
                AI destekli formül oluşturucu ile hızlı ve kolay formül tasarımı
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/admin/formulas")}
              className="border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Geri Dön
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Progress Steps - Modern Design */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3">
            {[
              {
                num: 1,
                label: "Yapılandırma",
                icon: Sparkles,
                desc: "AI Ayarları",
              },
              {
                num: 2,
                label: "Düzenleme",
                icon: Edit3,
                desc: "İçerik Kontrolü",
              },
              { num: 3, label: "Kaydetme", icon: Save, desc: "Tamamla" },
            ].map((item, idx) => (
              <div key={item.num} className="flex items-center">
                <button
                  onClick={() => {
                    if (
                      item.num <= step ||
                      (item.num === 2 && formula.ingredients.length > 0)
                    ) {
                      setStep(item.num);
                    }
                  }}
                  disabled={
                    item.num > step &&
                    !(item.num === 2 && formula.ingredients.length > 0)
                  }
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${
                    step >= item.num
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                  } ${
                    item.num <= step ||
                    (item.num === 2 && formula.ingredients.length > 0)
                      ? "cursor-pointer hover:scale-105"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      {step > item.num ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <item.icon className="h-5 w-5" />
                      )}
                      <span className="font-bold text-sm">{item.label}</span>
                    </div>
                    <span
                      className={`text-xs ${
                        step >= item.num ? "opacity-80" : "opacity-60"
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                </button>
                {idx < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full transition-all ${
                      step > item.num
                        ? "bg-gradient-to-r from-blue-600 to-blue-700"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: AI Configuration */}
        {step === 1 && (
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    AI Formül Oluşturucu
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Ürün bilgilerini girin ve AI ile otomatik formül oluşturun
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              {/* Product Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="productName"
                  className="text-gray-900 font-semibold text-sm flex items-center gap-2"
                >
                  <Beaker className="h-4 w-4 text-blue-600" />
                  Ürün Adı *
                </Label>
                <Input
                  id="productName"
                  placeholder="Örn: Nemlendirici Krem, Antibakteriyel Sabun..."
                  value={aiConfig.productName}
                  onChange={(e) =>
                    setAiConfig((prev) => ({
                      ...prev,
                      productName: e.target.value,
                    }))
                  }
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base rounded-xl"
                />
              </div>

              {/* Product Type and Volume */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="productType"
                    className="text-gray-900 font-semibold text-sm flex items-center gap-2"
                  >
                    <Package className="h-4 w-4 text-blue-600" />
                    Ürün Tipi *
                  </Label>
                  <Select
                    value={aiConfig.productType}
                    onValueChange={(value) =>
                      setAiConfig((prev) => ({ ...prev, productType: value }))
                    }
                  >
                    <SelectTrigger className="h-12 border-gray-200 text-base rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="productVolume"
                    className="text-gray-900 font-semibold text-sm flex items-center gap-2"
                  >
                    <Layers className="h-4 w-4 text-blue-600" />
                    Ürün Hacmi (ml/gram) *
                  </Label>
                  <Input
                    id="productVolume"
                    type="number"
                    placeholder="100"
                    value={aiConfig.productVolume}
                    onChange={(e) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        productVolume: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="productionQuantity"
                    className="text-gray-900 font-semibold text-sm flex items-center gap-2"
                  >
                    <Package className="h-4 w-4 text-green-600" />
                    Üretim Adedi *
                  </Label>
                  <Input
                    id="productionQuantity"
                    type="number"
                    placeholder="1000"
                    value={aiConfig.productionQuantity}
                    onChange={(e) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        productionQuantity: e.target.value,
                      }))
                    }
                    className="h-12 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-base rounded-xl"
                  />
                  <p className="text-xs text-gray-500">
                    Toplam kaç adet ürün üretilecek? (Fiyatlandırma için önemli)
                  </p>
                </div>
              </div>

              {/* Formula Level */}
              <div className="space-y-3 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl">
                <Label
                  htmlFor="formulaLevel"
                  className="text-gray-900 font-semibold text-sm flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Formül Seviyesi
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {aiConfig.formulaLevel}/10
                  </span>
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 font-medium w-20">
                    Ekonomik
                  </span>
                  <div className="flex-1 relative">
                    {/* Track Background */}
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      {/* Progress - Gradient based on level */}
                      <div
                        className={`h-full transition-all duration-300 ${
                          aiConfig.formulaLevel <= 3
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : aiConfig.formulaLevel <= 6
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : aiConfig.formulaLevel <= 8
                            ? "bg-gradient-to-r from-purple-500 to-purple-600"
                            : "bg-gradient-to-r from-amber-500 to-amber-600"
                        }`}
                        style={{ width: `${aiConfig.formulaLevel * 10}%` }}
                      />
                    </div>
                    {/* Range Input */}
                    <input
                      id="formulaLevel"
                      type="range"
                      min="1"
                      max="10"
                      value={aiConfig.formulaLevel}
                      onChange={(e) =>
                        setAiConfig((prev) => ({
                          ...prev,
                          formulaLevel: parseInt(e.target.value),
                        }))
                      }
                      className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
                    />
                    {/* Thumb */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 rounded-full shadow-lg pointer-events-none transition-all duration-300 ${
                        aiConfig.formulaLevel <= 3
                          ? "border-green-600"
                          : aiConfig.formulaLevel <= 6
                          ? "border-blue-600"
                          : aiConfig.formulaLevel <= 8
                          ? "border-purple-600"
                          : "border-amber-600"
                      }`}
                      style={{
                        left: `calc(${aiConfig.formulaLevel * 10}% - 12px)`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium w-20 text-right">
                    Ultra Lüks
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm bg-white p-4 rounded-xl border border-gray-200 mt-4">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      {aiConfig.formulaLevel <= 3 && "Ekonomik Segment"}
                      {aiConfig.formulaLevel >= 4 &&
                        aiConfig.formulaLevel <= 6 &&
                        "Orta Segment"}
                      {aiConfig.formulaLevel >= 7 &&
                        aiConfig.formulaLevel <= 8 &&
                        "Premium Segment"}
                      {aiConfig.formulaLevel >= 9 && "Ultra Lüks Segment"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {aiConfig.formulaLevel <= 3 &&
                        "Temel hammaddeler ile uygun fiyatlı formülasyon. Günlük kullanım için ideal."}
                      {aiConfig.formulaLevel >= 4 &&
                        aiConfig.formulaLevel <= 6 &&
                        "Dengeli kalite-fiyat oranı. Orta segment pazar için uygun."}
                      {aiConfig.formulaLevel >= 7 &&
                        aiConfig.formulaLevel <= 8 &&
                        "Yüksek kaliteli aktif maddeler ve premium hammaddeler içerir."}
                      {aiConfig.formulaLevel >= 9 &&
                        "En kaliteli hammaddeler ve maksimum etkinlik. Lüks pazar segmenti için."}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Model Selection - Unified AI'dan dinamik */}
              <div className="space-y-3 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-gray-900 font-semibold text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-indigo-600" />
                    AI Model Seçimi
                    {configLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    )}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettingsDialogOpen(true)}
                    className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-100 text-indigo-600"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {/* Provider'lara göre grupla */}
                  {Object.entries(modelsByProvider || {}).map(
                    ([provider, models]) => (
                      <div key={provider} className="space-y-2">
                        {/* Provider Header */}
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-lg">
                            {PROVIDER_INFO[provider]?.icon || "⚪"}
                          </span>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {PROVIDER_INFO[provider]?.name || provider}
                          </span>
                        </div>
                        {/* Models */}
                        {models.map((model) => {
                          const isSelected =
                            aiConfig.selectedModel === model.modelId ||
                            aiConfig.selectedModel === model.id;
                          const providerColor =
                            PROVIDER_INFO[provider]?.gradient ||
                            "from-gray-500 to-gray-600";
                          return (
                            <button
                              key={model.id || model.modelId}
                              type="button"
                              onClick={() =>
                                setAiConfig((prev) => ({
                                  ...prev,
                                  selectedModel: model.modelId || model.id,
                                }))
                              }
                              className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left w-full ${
                                isSelected
                                  ? "border-indigo-500 bg-white shadow-lg scale-[1.02]"
                                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
                              }`}
                            >
                              {/* Model Icon */}
                              <div
                                className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${providerColor} flex items-center justify-center shadow-md`}
                              >
                                <span className="text-xl">
                                  {PROVIDER_INFO[provider]?.icon || "🤖"}
                                </span>
                              </div>

                              {/* Model Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 text-sm">
                                    {model.displayName || model.name}
                                  </h4>
                                  {model.isDefault && (
                                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5">
                                      Önerilen
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                  {model.description ||
                                    `${
                                      PROVIDER_INFO[provider]?.name || provider
                                    } modeli`}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {model.settings?.speed || "Normal"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {model.settings?.cost || "Standart"}
                                  </span>
                                </div>
                              </div>

                              {/* Selection Indicator */}
                              {isSelected && (
                                <div className="flex-shrink-0">
                                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )
                  )}
                  {/* Loading state */}
                  {configLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                      <span className="ml-2 text-sm text-gray-500">
                        Modeller yükleniyor...
                      </span>
                    </div>
                  )}
                  {/* No models state */}
                  {!configLoading &&
                    (!availableModels || availableModels.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          Kullanılabilir model bulunamadı
                        </p>
                      </div>
                    )}
                </div>
                <div className="flex items-start gap-2 text-xs bg-white p-3 rounded-xl border border-indigo-200 mt-3">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                  <div className="text-gray-600">
                    <span className="font-semibold text-indigo-900">
                      Model Seçimi:
                    </span>{" "}
                    Basit formüller için hızlı modeller, profesyonel formüller
                    için dengeli modeller, kompleks özel formüller için güçlü
                    modelleri öneriririz.
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-900 font-semibold text-sm"
                >
                  Ek Açıklama{" "}
                  <span className="text-gray-500 font-normal">(Opsiyonel)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Örn: parabensiz, vegan, doğal katkılar, hassas ciltler için..."
                  value={aiConfig.description}
                  onChange={(e) =>
                    setAiConfig((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base rounded-xl resize-none"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Özel gereksinimlerinizi belirtirseniz AI daha uygun
                  hammaddeler önerir
                </p>
              </div>

              {/* Generate Button */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  onClick={handleGenerateFormula}
                  disabled={isGenerating}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all h-14 text-base font-semibold rounded-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      AI Formül Oluşturuyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      AI ile Formül Oluştur
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Edit Formula */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Formula Info */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                    <Edit3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Formül Bilgileri
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Formül detaylarını gözden geçirin ve düzenleyin
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="formulaName"
                      className="text-gray-900 font-semibold text-sm flex items-center gap-2"
                    >
                      <Beaker className="h-4 w-4 text-blue-600" />
                      Formül Adı *
                    </Label>
                    <Input
                      id="formulaName"
                      value={formula.name}
                      onChange={(e) =>
                        setFormula((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="formulaType"
                      className="text-gray-900 font-semibold text-sm flex items-center gap-2"
                    >
                      <Package className="h-4 w-4 text-blue-600" />
                      Ürün Tipi
                    </Label>
                    <Select
                      value={formula.productType}
                      onValueChange={(value) =>
                        setFormula((prev) => ({ ...prev, productType: value }))
                      }
                    >
                      <SelectTrigger className="h-12 border-gray-200 text-base rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="formulaNotes"
                    className="text-gray-900 font-semibold text-sm"
                  >
                    Notlar
                  </Label>
                  <Textarea
                    id="formulaNotes"
                    value={formula.notes}
                    onChange={(e) =>
                      setFormula((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={3}
                    className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
                      <Layers className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Hammaddeler
                        <Badge className="ml-3 bg-purple-600 text-white border-0 text-base px-3 py-1">
                          {formula.ingredients.length} adet
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        AI tarafından oluşturulan hammaddeleri düzenleyin veya
                        yeni ekleyin
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddIngredient}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Hammadde Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-3">
                  {formula.ingredients.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                        <Layers className="h-16 w-16 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Henüz Hammadde Eklenmedi
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Formülünüze ilk hammaddeyi ekleyerek başlayın
                      </p>
                      <Button
                        onClick={handleAddIngredient}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        İlk Hammaddeyi Ekle
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {/* Compact Header */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">
                        <div className="w-8 flex-shrink-0">#</div>
                        <div className="w-52 flex-shrink-0">Hammadde</div>
                        <div className="w-24 flex-shrink-0 text-center">
                          Miktar
                        </div>
                        <div className="w-24 flex-shrink-0 text-center">
                          Birim
                        </div>
                        <div className="w-20 flex-shrink-0 text-center">
                          Yüzde
                        </div>
                        <div className="w-32 flex-shrink-0 text-center">
                          Fiyat
                        </div>
                        <div className="w-10 flex-shrink-0"></div>
                        <div className="w-28 flex-shrink-0 text-center">
                          Maliyet
                        </div>
                        <div className="w-44 flex-shrink-0 text-center">
                          Fonksiyon
                        </div>
                        <div className="w-10 flex-shrink-0"></div>
                      </div>

                      {/* Ingredient List */}
                      {formula.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="group bg-white hover:bg-blue-50/50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {/* Index */}
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>

                            {/* Name */}
                            <div className="w-52 flex-shrink-0">
                              <Input
                                value={
                                  ingredient.displayName || ingredient.name
                                }
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleIngredientChange(
                                    index,
                                    "displayName",
                                    value
                                  );
                                  if (!ingredient.displayName) {
                                    handleIngredientChange(
                                      index,
                                      "name",
                                      value
                                    );
                                  }
                                }}
                                placeholder="Hammadde adı..."
                                className="border-gray-200 bg-white text-sm h-8 rounded-md"
                              />
                              {ingredient.displayName &&
                                ingredient.displayName !== ingredient.name && (
                                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">
                                    INCI: {ingredient.name}
                                  </p>
                                )}
                            </div>

                            {/* Amount */}
                            <div className="w-24 flex-shrink-0">
                              <Input
                                type="number"
                                step="0.01"
                                value={ingredient.amount}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    index,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                className="border-gray-200 bg-white text-sm h-8 rounded-md text-center"
                              />
                            </div>

                            {/* Unit */}
                            <div className="w-24 flex-shrink-0">
                              <Select
                                value={ingredient.unit}
                                onValueChange={(value) =>
                                  handleIngredientChange(index, "unit", value)
                                }
                              >
                                <SelectTrigger className="border-gray-200 bg-white text-xs h-8 rounded-md">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {UNITS.map((unit) => (
                                    <SelectItem
                                      key={unit.value}
                                      value={unit.value}
                                      className="text-xs"
                                    >
                                      {unit.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Percentage */}
                            <div className="w-20 flex-shrink-0 text-center">
                              <div className="text-xs font-semibold text-gray-700 bg-blue-50 rounded-md px-2 py-1.5 h-8 flex items-center justify-center">
                                {(() => {
                                  const amount =
                                    parseFloat(ingredient.amount) || 0;
                                  let amountInGrams = amount;
                                  if (ingredient.unit === "kg")
                                    amountInGrams = amount * 1000;
                                  else if (ingredient.unit === "ml")
                                    amountInGrams = amount;
                                  else if (ingredient.unit === "litre")
                                    amountInGrams = amount * 1000;
                                  const totalGrams =
                                    parseFloat(totals.totalAmount) || 1;
                                  const percentage =
                                    (amountInGrams / totalGrams) * 100;
                                  return percentage.toFixed(1) + "%";
                                })()}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="w-32 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={ingredient.price}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  className="border-gray-200 bg-white text-sm h-8 rounded-md text-center flex-1"
                                />
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  ₺/kg
                                </span>
                              </div>
                            </div>

                            {/* AI Price Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGetPriceSuggestion(index)}
                              disabled={loadingPriceFor === index}
                              className="flex-shrink-0 h-8 w-10 p-0 hover:bg-blue-100 rounded-md"
                              title="AI Fiyat Önerisi"
                            >
                              {loadingPriceFor === index ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                              )}
                            </Button>

                            {/* Ingredient Cost */}
                            <div className="w-28 flex-shrink-0 text-center">
                              <div className="text-xs font-bold text-green-700 bg-green-50 rounded-md px-2 py-1.5 h-8 flex items-center justify-center">
                                {(() => {
                                  const amount =
                                    parseFloat(ingredient.amount) || 0;
                                  const price =
                                    parseFloat(ingredient.price) || 0;
                                  let cost = 0;
                                  if (
                                    ingredient.unit === "gram" ||
                                    ingredient.unit === "ml"
                                  ) {
                                    cost = (amount / 1000) * price;
                                  } else if (
                                    ingredient.unit === "kg" ||
                                    ingredient.unit === "litre"
                                  ) {
                                    cost = amount * price;
                                  } else {
                                    cost = amount * price;
                                  }
                                  return "₺" + cost.toFixed(2);
                                })()}
                              </div>
                            </div>

                            {/* Function */}
                            <div className="w-44 flex-shrink-0">
                              <Select
                                value={ingredient.function || "Other"}
                                onValueChange={(value) =>
                                  handleIngredientChange(
                                    index,
                                    "function",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="border-gray-200 bg-white text-xs h-8 rounded-md">
                                  <SelectValue placeholder="Fonksiyon seçin">
                                    {ingredient.function
                                      ? getFunctionTurkish(ingredient.function)
                                      : "Fonksiyon seçin"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {FUNCTION_TYPES.map((func) => (
                                    <SelectItem
                                      key={func.value}
                                      value={func.value}
                                      className="text-xs"
                                    >
                                      {func.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveIngredient(index)}
                              className="flex-shrink-0 h-8 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Totals */}
                      {formula.ingredients.length > 0 && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            Formül Özeti
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                <Package className="h-6 w-6 opacity-80" />
                                <div className="text-[10px] font-medium opacity-90">
                                  TOPLAM
                                </div>
                              </div>
                              <div className="text-2xl font-bold tracking-tight">
                                {totals.totalAmount} g
                              </div>
                              <div className="text-xs mt-1 opacity-80">
                                Toplam Hacim
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                <DollarSign className="h-6 w-6 opacity-80" />
                                <div className="text-[10px] font-medium opacity-90">
                                  MALİYET
                                </div>
                              </div>
                              <div className="text-2xl font-bold tracking-tight">
                                ₺{totals.totalCost}
                              </div>
                              <div className="text-xs mt-1 opacity-80">
                                Toplam Maliyet
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="h-6 w-6 opacity-80" />
                                <div className="text-[10px] font-medium opacity-90">
                                  BİRİM
                                </div>
                              </div>
                              <div className="text-2xl font-bold tracking-tight">
                                ₺{totals.costPerGram}
                              </div>
                              <div className="text-xs mt-1 opacity-80">
                                Gram Başı Maliyet
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Generated Notes */}
            {generatedData && (
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-amber-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-2.5 shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-amber-900 text-xl font-bold">
                        AI Önerileri
                      </CardTitle>
                      <CardDescription className="text-amber-700">
                        Yapay zeka destekli formül notları
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {generatedData.productionNotes && (
                    <div className="bg-white rounded-xl p-4 border border-amber-200">
                      <p className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Üretim Notları
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-amber-800">
                        {generatedData.productionNotes.map((note, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {generatedData.suggestions && (
                    <div className="bg-white rounded-xl p-4 border border-amber-200">
                      <p className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Genel Öneriler
                      </p>
                      <p className="text-amber-800 leading-relaxed">
                        {generatedData.suggestions}
                      </p>
                    </div>
                  )}
                  {generatedData.priceNotes && (
                    <div className="bg-white rounded-xl p-4 border border-amber-200">
                      <p className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Fiyat Notları
                      </p>
                      <p className="text-amber-800 leading-relaxed">
                        {generatedData.priceNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                size="lg"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-50 h-14 text-base font-semibold rounded-xl"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Geri Dön
              </Button>
              <Button
                onClick={handleSaveFormula}
                disabled={isSaving}
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all h-14 text-base font-semibold rounded-xl"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Formülü Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AI Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[540px] p-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 shadow-2xl bg-white">
          {/* Compact Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-gray-900 text-lg font-bold">
                    Model Ayarları
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-sm">
                    Yapılandırma ve prompt önizlemesi
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={settingsTab} onValueChange={setSettingsTab} className="w-full">
            <div className="px-6 py-3 bg-gray-50/50">
              <TabsList className="w-full grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg h-10">
                <TabsTrigger 
                  value="config" 
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  Ayarlar
                </TabsTrigger>
                <TabsTrigger 
                  value="prompt" 
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Prompt
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Config Tab */}
            <TabsContent value="config" className="mt-0 focus:outline-none">
              <ScrollArea className="h-[380px]">
                <div className="p-6 space-y-5">
                  
                  {/* Active Model Card */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Aktif Model</p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                          PROVIDER_INFO[currentProvider?.id]?.gradient || 'from-gray-400 to-gray-500'
                        } flex items-center justify-center shadow-md`}>
                          <span className="text-xl">{PROVIDER_INFO[currentProvider?.id]?.icon || '🤖'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {currentModel?.displayName || currentModel?.name || 'Model seçilmedi'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {PROVIDER_INFO[currentProvider?.id]?.name || currentProvider?.id || 'Provider'}
                          </p>
                        </div>
                        {currentModel?.isDefault && (
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                            Varsayılan
                          </Badge>
                        )}
                      </div>
                      
                      {/* Model Stats */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <span>{getCurrentModelSettings()?.speed || 'Normal'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <DollarSign className="h-3.5 w-3.5 text-green-500" />
                          <span>{getCurrentModelSettings()?.cost || 'Standart'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Brain className="h-3.5 w-3.5 text-purple-500" />
                          <span>{availableModels?.length || 0} model</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token Settings */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Token Limiti</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${modelSettings.autoMaxTokens ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                          Otomatik
                        </span>
                        <Switch
                          checked={modelSettings.autoMaxTokens}
                          onCheckedChange={(checked) => 
                            setModelSettings(prev => ({ ...prev, autoMaxTokens: checked }))
                          }
                          className="scale-90"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      {modelSettings.autoMaxTokens ? (
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-900">Otomatik ayarlama aktif</p>
                            <p className="text-xs text-indigo-600">
                              {isThinkingModel(aiConfig.selectedModel || currentModel?.modelId) 
                                ? `Thinking Model: ${calculateAutoMaxTokens().toLocaleString()} token` 
                                : `Hesaplanan: ${calculateAutoMaxTokens().toLocaleString()} token`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={modelSettings.maxTokens}
                              onChange={(e) => setModelSettings(prev => ({ 
                                ...prev, 
                                maxTokens: parseInt(e.target.value) || 1000 
                              }))}
                              min={500}
                              max={16000}
                              step={500}
                              className="flex-1 h-10 rounded-lg border-gray-200 text-center font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {[1000, 2000, 4000, 8000].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setModelSettings(prev => ({ ...prev, maxTokens: val }))}
                                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                                  modelSettings.maxTokens === val 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {val >= 1000 ? `${val/1000}K` : val}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Yaratıcılık</p>
                      <span className="text-sm font-bold text-indigo-600 font-mono">
                        {modelSettings.temperature.toFixed(1)}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={modelSettings.temperature}
                          onChange={(e) => setModelSettings(prev => ({ 
                            ...prev, 
                            temperature: parseFloat(e.target.value) 
                          }))}
                          className="w-full h-2 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between mt-3 text-xs">
                        <span className="text-blue-600 font-medium">Tutarlı</span>
                        <span className="text-indigo-600 font-medium">Dengeli</span>
                        <span className="text-purple-600 font-medium">Yaratıcı</span>
                      </div>
                    </div>
                  </div>

                </div>
              </ScrollArea>
            </TabsContent>

            {/* Prompt Tab */}
            <TabsContent value="prompt" className="mt-0 focus:outline-none">
              <ScrollArea className="h-[380px]" style={{ width: '100%' }}>
                <div className="p-6 space-y-4" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  
                  {firestorePrompt ? (
                    <>
                      {/* Prompt Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          {firestorePrompt.name && (
                            <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs font-medium">
                              {firestorePrompt.name}
                            </Badge>
                          )}
                          {firestorePrompt.version && (
                            <Badge variant="outline" className="text-xs font-mono">
                              v{firestorePrompt.version}
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPrompt(firestorePrompt?.systemPrompt || firestorePrompt?.content || '')}
                          className="h-8 px-3 text-xs rounded-lg hover:bg-gray-100 flex-shrink-0"
                        >
                          {copiedPrompt ? (
                            <><Check className="h-3.5 w-3.5 mr-1.5 text-green-600" /> Kopyalandı</>
                          ) : (
                            <><Copy className="h-3.5 w-3.5 mr-1.5" /> Kopyala</>
                          )}
                        </Button>
                      </div>

                      {/* System Prompt */}
                      <div className="rounded-xl border border-gray-700 overflow-hidden" style={{ maxWidth: '100%' }}>
                        <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-[11px] text-gray-400 ml-1 font-mono">system_prompt</span>
                        </div>
                        <div className="bg-gray-900 p-4 overflow-auto" style={{ maxWidth: '100%' }}>
                          <pre style={{ 
                            margin: 0, 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            color: '#f3f4f6',
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
                          }}>
{firestorePrompt.systemPrompt || firestorePrompt.content || 'Prompt bulunamadı'}</pre>
                        </div>
                      </div>

                      {/* User Prompt Template */}
                      {firestorePrompt.userPromptTemplate && (
                        <div className="rounded-xl border border-purple-800 overflow-hidden" style={{ maxWidth: '100%' }}>
                          <div className="px-3 py-2 bg-purple-900 border-b border-purple-800 flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-[11px] text-purple-300 ml-1 font-mono">user_prompt_template</span>
                          </div>
                          <div className="bg-purple-950 p-4 overflow-auto" style={{ maxWidth: '100%' }}>
                            <pre style={{ 
                              margin: 0, 
                              whiteSpace: 'pre-wrap', 
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              fontSize: '13px',
                              lineHeight: '1.6',
                              color: '#f3e8ff',
                              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
                            }}>
{firestorePrompt.userPromptTemplate}</pre>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {firestorePrompt.description && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-800 leading-relaxed">{firestorePrompt.description}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">Prompt yükleniyor...</p>
                      <p className="text-gray-400 text-sm mt-1">Firestore'dan veri alınıyor</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Context: <span className="font-mono text-gray-500">{AI_CONTEXTS.FORMULA_GENERATION}</span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSettingsDialogOpen(false)}
              className="rounded-lg hover:bg-gray-200"
            >
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
