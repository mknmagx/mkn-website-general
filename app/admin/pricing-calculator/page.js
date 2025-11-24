"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../components/admin-route-guard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";
import { Slider } from "../../../components/ui/slider";
import {
  Loader2,
  Calculator,
  Plus,
  Sparkles,
  Save,
  FileText,
  DollarSign,
  Package,
  Tag,
  Users,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  TrendingUp,
  Layers,
  Beaker,
  Percent,
  X,
  Info,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { useClaude } from "../../../hooks/use-claude";
import * as FormulaService from "../../../lib/services/formula-service";
import * as PricingService from "../../../lib/services/pricing-service";

// Form başlangıç değerleri
const initialFormState = {
  productName: "",
  quantity: "",
  productType: "",
  productVolume: "",
  description: "",
  ingredients: [],
  packaging: [],
  boxType: "",
  boxQuantity: "",
  boxPrice: "",
  labelType: "",
  labelQuantity: "",
  labelPrice: "",
  laborCostPerUnit: "",
  laborNotes: "",
  otherCosts: [],
  profitType: "percentage",
  profitMarginPercent: "20",
  profitAmountPerUnit: "",
  notes: "",
  sourceFormulaId: null,
  sourceFormulaName: null,
};

export default function PricingCalculatorPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { sendMessage, loading: aiLoading } = useClaude();

  // Form state
  const [formData, setFormData] = useState(initialFormState);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [showFormulaDialog, setShowFormulaDialog] = useState(false);
  const [generatedFormula, setGeneratedFormula] = useState(null);
  const [generatingFormula, setGeneratingFormula] = useState(false);
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(null);
  const [gettingPrice, setGettingPrice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCalculation, setSavingCalculation] = useState(false);
  const [savedFormulas, setSavedFormulas] = useState([]);
  const [loadingFormulas, setLoadingFormulas] = useState(false);
  const [showSaveFormulaDialog, setShowSaveFormulaDialog] = useState(false);
  const [formulaName, setFormulaName] = useState("");
  const [formulaNotes, setFormulaNotes] = useState("");
  const [savingFormula, setSavingFormula] = useState(false);
  const [showLoadFormulaDialog, setShowLoadFormulaDialog] = useState(false);
  const [showGenerateFormulaDialog, setShowGenerateFormulaDialog] =
    useState(false);
  const [formulaLevel, setFormulaLevel] = useState(5);

  // Load formulas
  useEffect(() => {
    loadSavedFormulas();
  }, []);

  const loadSavedFormulas = async () => {
    try {
      setLoadingFormulas(true);
      const formulas = await FormulaService.loadSavedFormulas();
      setSavedFormulas(formulas);
    } catch (error) {
      console.error("Error loading formulas:", error);
    } finally {
      setLoadingFormulas(false);
    }
  };

  // Form update functions
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          name: "",
          amount: "",
          unit: "gram",
          price: "",
          supplier: "",
          function: "",
        },
      ],
    }));
  };

  const removeIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updatePackaging = (index, field, value) => {
    const newPackaging = [...formData.packaging];
    newPackaging[index] = { ...newPackaging[index], [field]: value };
    setFormData((prev) => ({ ...prev, packaging: newPackaging }));
  };

  const addPackaging = () => {
    setFormData((prev) => ({
      ...prev,
      packaging: [
        ...prev.packaging,
        {
          type: "",
          material: "",
          quantity: "",
          unit: "adet",
          price: "",
          supplier: "",
        },
      ],
    }));
  };

  const removePackaging = (index) => {
    setFormData((prev) => ({
      ...prev,
      packaging: prev.packaging.filter((_, i) => i !== index),
    }));
  };

  const updateOtherCost = (index, field, value) => {
    const newOtherCosts = [...formData.otherCosts];
    newOtherCosts[index] = { ...newOtherCosts[index], [field]: value };
    setFormData((prev) => ({ ...prev, otherCosts: newOtherCosts }));
  };

  const addOtherCost = () => {
    setFormData((prev) => ({
      ...prev,
      otherCosts: [
        ...prev.otherCosts,
        { description: "", amount: "", category: "genel" },
      ],
    }));
  };

  const removeOtherCost = (index) => {
    setFormData((prev) => ({
      ...prev,
      otherCosts: prev.otherCosts.filter((_, i) => i !== index),
    }));
  };

  // Calculate pricing
  const calculatePrice = useMemo(() => {
    return PricingService.calculatePricing(formData);
  }, [formData]);

  // AI fiyat önerisi
  const getAiSuggestion = async () => {
    try {
      const prompt = `
Fason üretim için fiyatlandırma analizi yap:

ÜRÜN BİLGİLERİ:
- Ürün Adı: ${formData.productName}
- Ürün Tipi: ${formData.productType}
- Üretim Miktarı: ${formData.quantity}

MALİYET DETAYLARI:
İçerik Maliyeti: ${calculatePrice.ingredientsCost.toFixed(2)} TL
Ambalaj Maliyeti: ${calculatePrice.packagingCost.toFixed(2)} TL
Toplam Maliyet: ${calculatePrice.totalCost.toFixed(2)} TL
Mevcut Kar Marjı: %${formData.profitMarginPercent}
Hesaplanan Fiyat: ${calculatePrice.totalPrice.toFixed(2)} TL
Birim Fiyat: ${calculatePrice.unitPrice.toFixed(2)} TL

JSON formatında şu bilgileri içer:
{
  "suggestedProfitMargin": "önerilen kar marjı yüzdesi",
  "suggestedUnitPrice": "önerilen birim fiyat",
  "suggestedTotalPrice": "önerilen toplam fiyat",
  "analysis": "detaylı analiz metni",
  "optimizationTips": ["öneri 1", "öneri 2"],
  "riskFactors": ["risk 1", "risk 2"]
}
`;

      const response = await sendMessage(prompt, {
        maxTokens: 2000,
        type: "generate",
      });
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        setAiSuggestion(parsedResponse);
        setShowAiDialog(true);
      }

      toast({
        title: "AI Analizi Tamamlandı",
        description: "Fiyatlandırma önerileri hazır.",
      });
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        title: "AI Hatası",
        description: "AI analizi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion?.suggestedProfitMargin) {
      updateField(
        "profitMarginPercent",
        aiSuggestion.suggestedProfitMargin.toString()
      );
      setShowAiDialog(false);
      toast({
        title: "Öneri Uygulandı",
        description: "AI önerileri hesaplamaya yansıtıldı.",
      });
    }
  };

  // Generate formula with AI
  const generateFormula = async () => {
    if (!formData.productName || !formData.productType) {
      toast({
        title: "Eksik Bilgi",
        description: "Ürün adı ve tipi gereklidir.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingFormula(true);
      setShowGenerateFormulaDialog(false);

      const productInfo = {
        productName: formData.productName,
        productType: formData.productType,
        productVolume: formData.productVolume,
        description: formData.description,
        formulaLevel: formulaLevel,
      };

      const parsedFormula = await FormulaService.generateAIFormula(
        productInfo,
        sendMessage
      );
      setGeneratedFormula(parsedFormula);
      setShowFormulaDialog(true);

      toast({
        title: "Formül Oluşturuldu",
        description: `${parsedFormula.formula.length} hammadde içeren formül hazır.`,
      });
    } catch (error) {
      console.error("Formula generation error:", error);
      toast({
        title: "Hata",
        description: "Formül oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setGeneratingFormula(false);
    }
  };

  const applyFormula = () => {
    if (generatedFormula?.formula) {
      const mapFunctionToFormValue = (func) => {
        if (!func) return "";

        const normalized = func.toLowerCase().trim();

        // Direkt eşleşmeler
        const directMappings = {
          solvent: "cozucu",
          carrier: "cozucu",
          moisturizer: "nemlendirici",
          humectant: "nemlendirici",
          emulsifier: "emulgator",
          "co-emulsifier": "yardimci-emulgator",
          thickener: "koyulastirici",
          "viscosity modifier": "koyulastirici",
          preservative: "koruyucu",
          fragrance: "parfum",
          perfume: "parfum",
          oil: "yag",
          butter: "yag",
          "active ingredient": "aktif-madde",
          active: "aktif-madde",
          antioxidant: "antioksidan",
          "ph adjuster": "ph-duzenleyici",
          colorant: "boya",
          dye: "boya",
          pigment: "boya",
        };

        return directMappings[normalized] || "diger";
      };

      const newIngredients = generatedFormula.formula.map((item) => ({
        name: item.name || "",
        amount: item.amount?.toString() || "",
        unit: item.unit || "gram",
        price: item.price
          ? item.price.toString()
          : item.estimatedPrice
          ? item.estimatedPrice.toString()
          : "",
        supplier: item.supplier || "",
        function: mapFunctionToFormValue(item.function),
      }));

      setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
      setShowFormulaDialog(false);

      toast({
        title: "Formül Uygulandı",
        description: `${newIngredients.length} hammadde eklendi.`,
      });
    }
  };

  // Get ingredient price
  const getIngredientPrice = async (index) => {
    const ingredient = formData.ingredients[index];
    if (!ingredient.name) {
      toast({
        title: "Eksik Bilgi",
        description: "Hammadde adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGettingPrice(true);
      setSelectedIngredientIndex(index);

      const ingredientInfo = {
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        supplier: ingredient.supplier,
        productType: formData.productType,
        productName: formData.productName,
      };

      const priceData = await FormulaService.getAIIngredientPrice(
        ingredientInfo,
        sendMessage
      );

      if (priceData.estimatedPrice) {
        const priceValue =
          typeof priceData.estimatedPrice === "number"
            ? priceData.estimatedPrice
            : parseFloat(priceData.estimatedPrice);

        if (!isNaN(priceValue)) {
          updateIngredient(index, "price", priceValue.toFixed(2));
          if (ingredient.unit !== "kg" && ingredient.unit !== "adet") {
            updateIngredient(index, "unit", "kg");
          }
        }
      }

      toast({
        title: "✓ Fiyat Bilgisi Alındı",
        description: `Tahmini Fiyat: ${priceData.estimatedPrice} TL/kg`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Get price error:", error);
      toast({
        title: "Hata",
        description: "Fiyat alınırken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setGettingPrice(false);
      setSelectedIngredientIndex(null);
    }
  };

  // Save calculation
  const saveCalculation = async () => {
    try {
      setSavingCalculation(true);

      const cleanFormData = {
        productName: formData.productName || "",
        productType: formData.productType || "",
        productVolume: formData.productVolume || "",
        quantity: formData.quantity || "",
        description: formData.description || "",
        ingredients: formData.ingredients.filter((ing) => ing.name),
        packaging: formData.packaging.filter((pkg) => pkg.type),
        boxType: formData.boxType || "",
        boxQuantity: formData.boxQuantity || "",
        boxPrice: formData.boxPrice || "",
        labelType: formData.labelType || "",
        labelQuantity: formData.labelQuantity || "",
        labelPrice: formData.labelPrice || "",
        laborCostPerUnit: formData.laborCostPerUnit || "",
        laborNotes: formData.laborNotes || "",
        otherCosts: formData.otherCosts.filter((cost) => cost.description),
        profitType: formData.profitType || "percentage",
        profitMarginPercent: formData.profitMarginPercent || "20",
        profitAmountPerUnit: formData.profitAmountPerUnit || "",
        notes: formData.notes || "",
        sourceFormulaId: formData.sourceFormulaId || null,
        sourceFormulaName: formData.sourceFormulaName || null,
      };

      const calculationData = {
        productName: cleanFormData.productName,
        productType: cleanFormData.productType,
        productVolume: cleanFormData.productVolume,
        quantity: parseFloat(cleanFormData.quantity) || 0,
        description: cleanFormData.description,
        formData: cleanFormData,
        calculations: {
          unitPrice: parseFloat(calculatePrice.unitPrice) || 0,
          totalPrice: parseFloat(calculatePrice.totalPrice) || 0,
          totalCostPerUnit: parseFloat(calculatePrice.totalCostPerUnit) || 0,
          profitPerUnit: parseFloat(calculatePrice.profitPerUnit) || 0,
        },
      };

      const id = await PricingService.savePricingCalculation(calculationData);

      toast({
        title: "Kaydedildi",
        description: "Hesaplama başarıyla kaydedildi.",
      });

      router.push(`/admin/pricing-calculations/${id}`);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Hata",
        description: error.message || "Kaydetme sırasında hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSavingCalculation(false);
    }
  };

  // Save formula
  const saveFormulaToFirestore = async () => {
    if (!formulaName.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Formül adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    if (formData.ingredients.length === 0 || !formData.ingredients[0].name) {
      toast({
        title: "Eksik Bilgi",
        description: "En az bir hammadde eklemelisiniz.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingFormula(true);

      const formulaData = {
        name: formulaName.trim(),
        productType: formData.productType || "genel",
        productVolume: formData.productVolume || null,
        notes: formulaNotes.trim() || "",
        ingredients: formData.ingredients
          .filter((ing) => ing.name)
          .map((ing) => ({
            name: ing.name,
            amount: parseFloat(ing.amount) || 0,
            unit: ing.unit || "gram",
            price: parseFloat(ing.price) || 0,
            supplier: ing.supplier || "",
            function: ing.function || "",
          })),
      };

      await FormulaService.saveFormula(formulaData);

      toast({
        title: "Formül Kaydedildi",
        description: `"${formulaName}" başarıyla kaydedildi.`,
      });

      setShowSaveFormulaDialog(false);
      setFormulaName("");
      setFormulaNotes("");
      await loadSavedFormulas();
    } catch (error) {
      console.error("Error saving formula:", error);
      toast({
        title: "Hata",
        description: "Formül kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSavingFormula(false);
    }
  };

  // Load formula
  const loadFormulaFromFirestore = async (formulaId) => {
    try {
      const formulaData = await FormulaService.loadFormula(formulaId);

      // Function mapping helper
      const mapFunctionToFormValue = (func) => {
        if (!func) return "";

        const normalized = func.toLowerCase().trim();

        // Direkt eşleşmeler
        const directMappings = {
          solvent: "cozucu",
          carrier: "cozucu",
          moisturizer: "nemlendirici",
          humectant: "nemlendirici",
          emulsifier: "emulgator",
          "co-emulsifier": "yardimci-emulgator",
          thickener: "koyulastirici",
          "viscosity modifier": "koyulastirici",
          preservative: "koruyucu",
          fragrance: "parfum",
          perfume: "parfum",
          oil: "yag",
          butter: "yag",
          "active ingredient": "aktif-madde",
          active: "aktif-madde",
          antioxidant: "antioksidan",
          "ph adjuster": "ph-duzenleyici",
          colorant: "boya",
          dye: "boya",
          pigment: "boya",
        };

        return directMappings[normalized] || "diger";
      };

      const mappedIngredients = formulaData.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount.toString(),
        unit: ing.unit,
        price: ing.price.toString(),
        supplier: ing.supplier || "",
        function: mapFunctionToFormValue(ing.function),
      }));

      setFormData((prev) => ({
        ...prev,
        productType: formulaData.productType || prev.productType,
        productVolume: formulaData.productVolume || prev.productVolume,
        ingredients: mappedIngredients,
        notes: formulaData.notes || "",
        sourceFormulaId: formulaId,
        sourceFormulaName: formulaData.name,
      }));

      setShowLoadFormulaDialog(false);

      toast({
        title: "Formül Yüklendi",
        description: `"${formulaData.name}" formülü uygulandı.`,
      });
    } catch (error) {
      console.error("Error loading formula:", error);
      toast({
        title: "Hata",
        description: "Formül yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setAiSuggestion(null);
    setGeneratedFormula(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="proformas.view" showMessage={true}>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
        {/* Modern Header with Glass Effect */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2.5 shadow-lg">
                    <Calculator className="h-7 w-7 text-white" />
                  </div>
                  Fiyat Hesaplama
                </h1>
                <p className="text-gray-600 mt-2 ml-14">
                  Fason üretim maliyet ve fiyat hesaplaması yapın
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowLoadFormulaDialog(true)}
                  variant="outline"
                  size="sm"
                  disabled={loadingFormulas}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Formül Yükle
                </Button>
                <Button
                  onClick={() => setShowGenerateFormulaDialog(true)}
                  size="sm"
                  variant="default"
                  disabled={
                    !formData.productName ||
                    !formData.productType ||
                    generatingFormula
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {generatingFormula ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI ile Formül
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <Layers className="h-8 w-8 text-white opacity-90" />
                <div className="text-xs font-medium text-white/80">
                  HAMMADDE
                </div>
              </div>
              <div className="text-sm font-medium text-blue-600 mb-1">
                Toplam Yazı
              </div>
              <div className="text-3xl font-bold tracking-tight text-blue-700">
                {formData.ingredients.filter((i) => i.name).length}
              </div>
              <div className="text-sm mt-2 text-blue-600">
                Yayınlanmış içerik
              </div>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500 rounded-xl p-3">
                  <Tag className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm font-medium text-purple-600 mb-1">
                Kategoriler
              </div>
              <div className="text-3xl font-bold tracking-tight text-purple-700">
                {calculatePrice.unitPrice}
              </div>
              <div className="text-sm mt-2 text-purple-600">Aktif kategori</div>
            </div>

            <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500 rounded-xl p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm font-medium text-orange-600 mb-1">
                Öne Çıkan
              </div>
              <div className="text-3xl font-bold tracking-tight text-orange-700">
                {formData.quantity || 0}
              </div>
              <div className="text-sm mt-2 text-orange-600">Özel içerik</div>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500 rounded-xl p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm font-medium text-green-600 mb-1">
                Bu Ay
              </div>
              <div className="text-3xl font-bold tracking-tight text-green-700">
                ₺{calculatePrice.totalPrice}
              </div>
              <div className="text-sm mt-2 text-green-600">Yeni yayın</div>
            </div>
          </div>

          {/* Product Info Card */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="productName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ürün Adı *
                  </Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => updateField("productName", e.target.value)}
                    placeholder="Örn: Organik Yüz Kremi"
                    className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="productType"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ürün Tipi
                  </Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => updateField("productType", value)}
                  >
                    <SelectTrigger
                      id="productType"
                      className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kozmetik">Kozmetik</SelectItem>
                      <SelectItem value="gida">Gıda Takviyesi</SelectItem>
                      <SelectItem value="temizlik">Temizlik Ürünü</SelectItem>
                      <SelectItem value="kisisel-bakim">
                        Kişisel Bakım
                      </SelectItem>
                      <SelectItem value="diger">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="quantity"
                    className="text-sm font-medium text-gray-700"
                  >
                    Üretim Miktarı *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => updateField("quantity", e.target.value)}
                    placeholder="Adet"
                    className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="productVolume"
                    className="text-sm font-medium text-gray-700"
                  >
                    Hacim (ml)
                  </Label>
                  <Input
                    id="productVolume"
                    type="number"
                    value={formData.productVolume}
                    onChange={(e) =>
                      updateField("productVolume", e.target.value)
                    }
                    placeholder="Örn: 50"
                    className="h-11 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ürün Açıklaması
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Ürün hakkında detaylı açıklama..."
                    rows={3}
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients Section - Formula Style */}
          <Accordion
            type="single"
            collapsible
            defaultValue="item-1"
            className="mb-8"
          >
            <AccordionItem value="item-1" className="border-0">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between flex-wrap gap-3 w-full">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Beaker className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Hammadde Bileşenleri
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formData.ingredients.filter((i) => i.name).length}{" "}
                        hammadde • Toplam: {calculatePrice.totalProductVolume}{" "}
                        gram
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setShowSaveFormulaDialog(true)}
                        size="sm"
                        variant="outline"
                        disabled={
                          formData.ingredients.length === 0 ||
                          !formData.ingredients[0]?.name
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Kaydet
                      </Button>
                      <Button
                        onClick={addIngredient}
                        size="sm"
                        variant="default"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Hammadde Ekle
                      </Button>
                      <AccordionTrigger className="hover:no-underline py-0 px-3 [&[data-state=open]>svg]:rotate-180">
                        {/* <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200" /> */}
                      </AccordionTrigger>
                    </div>
                  </div>
                </CardHeader>
                <AccordionContent>
                  <CardContent className="p-0">
                    {formData.ingredients.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Henüz Hammadde Eklenmedi
                        </h3>
                        <p className="text-gray-600 mb-4">
                          İlk hammaddeyi eklemek için yukarıdaki butonu kullanın
                        </p>
                        <Button onClick={addIngredient} size="lg">
                          <Plus className="h-5 w-5 mr-2" />
                          İlk Hammaddeyi Ekle
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b-2 border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-12">
                                #
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[200px]">
                                Hammadde
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[150px]">
                                Fonksiyon
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                                Miktar
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">
                                Oran %
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                                Birim Fiyat
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                                Maliyet
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">
                                İşlem
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {formData.ingredients.map((ingredient, index) => {
                              const ingredientDetail =
                                calculatePrice.ingredientDetails?.[index];
                              const calculatedCost =
                                Number(ingredientDetail?.costPerUnit) || 0;

                              return (
                                <tr
                                  key={index}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    <Badge
                                      variant="secondary"
                                      className="font-semibold text-xs"
                                    >
                                      {index + 1}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Input
                                      value={ingredient.name}
                                      onChange={(e) =>
                                        updateIngredient(
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Örn: Shea Butter"
                                      className="h-9 text-sm font-semibold border-gray-300 focus:border-purple-500 rounded-lg"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <Select
                                      value={ingredient.function || ""}
                                      onValueChange={(value) =>
                                        updateIngredient(
                                          index,
                                          "function",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-purple-500">
                                        <SelectValue placeholder="Seçiniz" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="aktif-madde">
                                          Aktif Madde
                                        </SelectItem>
                                        <SelectItem value="nemlendirici">
                                          Nemlendirici
                                        </SelectItem>
                                        <SelectItem value="emulgator">
                                          Emülgatör
                                        </SelectItem>
                                        <SelectItem value="yardimci-emulgator">
                                          Yardımcı Emülgatör
                                        </SelectItem>
                                        <SelectItem value="koyulastirici">
                                          Koyulaştırıcı
                                        </SelectItem>
                                        <SelectItem value="koruyucu">
                                          Koruyucu
                                        </SelectItem>
                                        <SelectItem value="parfum">
                                          Parfüm
                                        </SelectItem>
                                        <SelectItem value="cozucu">
                                          Çözücü
                                        </SelectItem>
                                        <SelectItem value="yag">Yağ</SelectItem>
                                        <SelectItem value="boya">
                                          Boya
                                        </SelectItem>
                                        <SelectItem value="antioksidan">
                                          Antioksidan
                                        </SelectItem>
                                        <SelectItem value="ph-duzenleyici">
                                          pH Düzenleyici
                                        </SelectItem>
                                        <SelectItem value="diger">
                                          Diğer
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={ingredient.amount}
                                        onChange={(e) =>
                                          updateIngredient(
                                            index,
                                            "amount",
                                            e.target.value
                                          )
                                        }
                                        className="h-9 text-sm w-16 border-gray-300 focus:border-purple-500"
                                      />
                                      <Select
                                        value={ingredient.unit}
                                        onValueChange={(value) =>
                                          updateIngredient(index, "unit", value)
                                        }
                                      >
                                        <SelectTrigger className="h-9 text-sm w-24 border-gray-300">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="gram">
                                            g
                                          </SelectItem>
                                          <SelectItem value="ml">ml</SelectItem>
                                          <SelectItem value="kg">kg</SelectItem>
                                          <SelectItem value="adet">
                                            adet
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    {ingredientDetail &&
                                    ingredientDetail.percentage > 0 ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-purple-50 text-purple-700 border-purple-200 font-medium"
                                      >
                                        {ingredientDetail.percentage}%
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-400 text-sm">
                                        -
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={ingredient.price}
                                      onChange={(e) =>
                                        updateIngredient(
                                          index,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                      placeholder="0.00"
                                      className="h-9 text-sm w-20 border-gray-300 focus:border-purple-500"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    {calculatedCost > 0 ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 font-semibold"
                                      >
                                        {calculatedCost} ₺
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-400 text-sm">
                                        -
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Button
                                      onClick={() => removeIngredient(index)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 border-t-2 border-purple-300">
                            <tr>
                              <td colSpan="6" className="px-4 py-4 text-right">
                                <span className="text-sm font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wide">
                                  Toplam Hammadde Maliyeti:
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <Badge
                                  variant="outline"
                                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 font-bold text-base px-4 py-2 shadow-md"
                                >
                                  {calculatePrice?.ingredientsCostTotal
                                    ? Number(
                                        calculatePrice.ingredientsCostTotal
                                      ).toFixed(2)
                                    : "0.00"}{" "}
                                  ₺
                                </Badge>
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {/* Notes Section */}
                    {formData.notes && (
                      <div className="mt-6 px-6 pb-6">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="bg-amber-500 rounded-lg p-2 flex-shrink-0">
                              <Info className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-amber-900 mb-2 text-sm uppercase tracking-wide">
                                Formül Notları
                              </h4>
                              <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-wrap">
                                {formData.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>

          {/* Packaging Section */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Ambalaj Malzemeleri
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Her bir ürün için kullanılan ambalaj malzemelerini girin
                  </p>
                </div>
                <Button
                  onClick={addPackaging}
                  size="sm"
                  variant="default"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ambalaj Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Info Alert */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">💡 Nasıl Doldurulur?</p>
                    <p className="text-blue-800">
                      <strong>Miktar:</strong> Bir ürün için kaç adet ambalaj
                      parçası kullanılıyor (örn: 1 kavanoz, 1 kapak)
                      <br />
                      <strong>Birim Fiyat:</strong> Tek bir ambalaj parçasının
                      fiyatı (örn: 1 kavanoz = 17 TL)
                    </p>
                  </div>
                </div>
              </div>

              {formData.packaging.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Henüz Ambalaj Eklenmedi
                  </h3>
                  <p className="text-gray-600 mb-4">
                    İlk ambalajı eklemek için yukarıdaki butonu kullanın
                  </p>
                  <Button
                    onClick={addPackaging}
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    İlk Ambalajı Ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.packaging.map((pkg, index) => (
                    <Card
                      key={index}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="font-semibold"
                            >
                              Ambalaj #{index + 1}
                            </Badge>
                            {pkg.type && (
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {pkg.type}
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => removePackaging(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 -mt-1 -mr-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-medium text-gray-700">
                              Ambalaj Tipi
                            </Label>
                            <Input
                              value={pkg.type}
                              onChange={(e) =>
                                updatePackaging(index, "type", e.target.value)
                              }
                              placeholder="Örn: Plastik Kavanoz"
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-medium text-gray-700">
                              Malzeme
                            </Label>
                            <Input
                              value={pkg.material}
                              onChange={(e) =>
                                updatePackaging(
                                  index,
                                  "material",
                                  e.target.value
                                )
                              }
                              placeholder="Örn: PET Plastik"
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-700">
                              Miktar
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={pkg.quantity}
                              onChange={(e) =>
                                updatePackaging(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-700">
                              Birim
                            </Label>
                            <Select
                              value={pkg.unit}
                              onValueChange={(value) =>
                                updatePackaging(index, "unit", value)
                              }
                            >
                              <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="adet">Adet</SelectItem>
                                <SelectItem value="kg">Kilogram</SelectItem>
                                <SelectItem value="metre">Metre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-medium text-gray-700">
                              Birim Fiyat (TL){" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={pkg.price}
                              onChange={(e) =>
                                updatePackaging(index, "price", e.target.value)
                              }
                              placeholder="Örn: 17.00"
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                            <p className="text-xs text-gray-600">
                              Tek bir ambalaj parçasının fiyatı
                            </p>
                          </div>

                          <div className="space-y-2 md:col-span-4">
                            <Label className="text-xs font-medium text-gray-700">
                              Tedarikçi (Opsiyonel)
                            </Label>
                            <Input
                              value={pkg.supplier}
                              onChange={(e) =>
                                updatePackaging(
                                  index,
                                  "supplier",
                                  e.target.value
                                )
                              }
                              placeholder="Tedarikçi adı"
                              className="h-10 border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                          </div>
                        </div>

                        {pkg.quantity && pkg.price && (
                          <div className="mt-3 flex justify-end">
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800"
                            >
                              Ürün Başına Ambalaj Maliyeti:{" "}
                              {(
                                parseFloat(pkg.quantity) * parseFloat(pkg.price)
                              ).toFixed(2)}{" "}
                              TL
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Box and Label Section */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Tag className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                Kutu ve Etiket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Warning Alert */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold text-orange-900 mb-2">
                      ⚠️ ÖNEMLİ UYARI
                    </p>
                    <ul className="space-y-1 text-orange-800">
                      <li>
                        • <strong>Miktar:</strong> Bir ürün için kullanılan
                        kutu/etiket sayısı (genellikle 1)
                      </li>
                      <li>
                        • <strong>Birim Fiyat:</strong> Tek bir kutu veya
                        etiketin fiyatı
                      </li>
                      <li>
                        • <strong>Örnek:</strong> 1 kutu = 10 TL ise, "Miktar:
                        1" ve "Birim Fiyat: 10" yazın
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Box Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Kutu Bilgileri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="boxType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Kutu Tipi
                    </Label>
                    <Input
                      id="boxType"
                      value={formData.boxType}
                      onChange={(e) => updateField("boxType", e.target.value)}
                      placeholder="Örn: Karton Kutu"
                      className="h-11 border-2 border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="boxQuantity"
                      className="text-sm font-medium text-gray-700"
                    >
                      Miktar (Ürün Başına)
                    </Label>
                    <Input
                      id="boxQuantity"
                      type="number"
                      step="0.01"
                      value={formData.boxQuantity}
                      onChange={(e) =>
                        updateField("boxQuantity", e.target.value)
                      }
                      placeholder="1"
                      className="h-11 border-2 border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                    />
                    <p className="text-xs text-gray-600">
                      Genellikle 1 kutu/ürün
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="boxPrice"
                      className="text-sm font-medium text-gray-700"
                    >
                      Kutu Birim Fiyatı (TL){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="boxPrice"
                      type="number"
                      step="0.01"
                      value={formData.boxPrice}
                      onChange={(e) => updateField("boxPrice", e.target.value)}
                      placeholder="Örn: 10.00"
                      className="h-11 border-2 border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                    />
                    <p className="text-xs text-gray-600">
                      Tek bir kutunun fiyatı
                    </p>
                  </div>
                </div>
                {formData.boxQuantity && formData.boxPrice && (
                  <div className="flex justify-end">
                    <Badge
                      variant="secondary"
                      className="bg-pink-100 text-pink-800"
                    >
                      Ürün Başına Kutu Maliyeti:{" "}
                      {(
                        (parseFloat(formData.boxQuantity) || 0) *
                        (parseFloat(formData.boxPrice) || 0)
                      ).toFixed(2)}{" "}
                      TL
                    </Badge>
                  </div>
                )}
              </div>

              {/* Label Section */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Etiket Bilgileri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="labelType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Etiket Tipi
                    </Label>
                    <Input
                      id="labelType"
                      value={formData.labelType}
                      onChange={(e) => updateField("labelType", e.target.value)}
                      placeholder="Örn: Hologram Etiket"
                      className="h-11 border-2 border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="labelQuantity"
                      className="text-sm font-medium text-gray-700"
                    >
                      Miktar (Ürün Başına)
                    </Label>
                    <Input
                      id="labelQuantity"
                      type="number"
                      step="0.01"
                      value={formData.labelQuantity}
                      onChange={(e) =>
                        updateField("labelQuantity", e.target.value)
                      }
                      placeholder="1"
                      className="h-11 border-2 border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                    />
                    <p className="text-xs text-gray-600">
                      Genellikle 1 etiket/ürün
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="labelPrice"
                      className="text-sm font-medium text-gray-700"
                    >
                      Etiket Birim Fiyatı (TL){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="labelPrice"
                      type="number"
                      step="0.01"
                      value={formData.labelPrice}
                      onChange={(e) =>
                        updateField("labelPrice", e.target.value)
                      }
                      placeholder="Örn: 4.00"
                      className="h-11 border-2 border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                    />
                    <p className="text-xs text-gray-600">
                      Tek bir etiketin fiyatı
                    </p>
                  </div>
                </div>
                {formData.labelQuantity && formData.labelPrice && (
                  <div className="flex justify-end">
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-800"
                    >
                      Ürün Başına Etiket Maliyeti:{" "}
                      {(
                        (parseFloat(formData.labelQuantity) || 0) *
                        (parseFloat(formData.labelPrice) || 0)
                      ).toFixed(2)}{" "}
                      TL
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Labor Section */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                İşçilik Maliyeti
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="laborCostPerUnit"
                    className="text-sm font-medium text-gray-700"
                  >
                    Birim İşçilik Maliyeti (TL)
                  </Label>
                  <Input
                    id="laborCostPerUnit"
                    type="number"
                    step="0.01"
                    value={formData.laborCostPerUnit}
                    onChange={(e) =>
                      updateField("laborCostPerUnit", e.target.value)
                    }
                    placeholder="0.00"
                    className="h-11 border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  />
                  <p className="text-sm text-gray-600">
                    Bir ürün için işçilik maliyeti
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="laborNotes"
                    className="text-sm font-medium text-gray-700"
                  >
                    İşçilik Notları (Opsiyonel)
                  </Label>
                  <Textarea
                    id="laborNotes"
                    value={formData.laborNotes}
                    onChange={(e) => updateField("laborNotes", e.target.value)}
                    placeholder="İşçilik detayları..."
                    rows={2}
                    className="border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  />
                </div>
              </div>
              {formData.laborCostPerUnit && formData.quantity && (
                <div className="flex justify-end mt-4">
                  <Badge
                    variant="secondary"
                    className="bg-cyan-100 text-cyan-800"
                  >
                    Toplam İşçilik:{" "}
                    {(
                      (parseFloat(formData.laborCostPerUnit) || 0) *
                      (parseFloat(formData.quantity) || 1)
                    ).toFixed(2)}{" "}
                    TL
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other Costs Section */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <DollarSign className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    Diğer Masraflar
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Nakliye, vergi, genel giderler gibi diğer masraflar
                  </p>
                </div>
                <Button
                  onClick={addOtherCost}
                  size="sm"
                  variant="default"
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Masraf Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {formData.otherCosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <DollarSign className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Henüz Masraf Eklenmedi
                  </h3>
                  <p className="text-gray-600 mb-4">
                    İlk masrafı eklemek için yukarıdaki butonu kullanın
                  </p>
                  <Button
                    onClick={addOtherCost}
                    size="lg"
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    İlk Masrafı Ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.otherCosts.map((cost, index) => (
                    <Card
                      key={index}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="font-semibold"
                            >
                              Masraf #{index + 1}
                            </Badge>
                            {cost.description && (
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {cost.description}
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => removeOtherCost(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 -mt-1 -mr-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-medium text-gray-700">
                              Açıklama
                            </Label>
                            <Input
                              value={cost.description}
                              onChange={(e) =>
                                updateOtherCost(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Örn: Nakliye masrafı"
                              className="h-10 border-2 border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-700">
                              Kategori
                            </Label>
                            <Select
                              value={cost.category}
                              onValueChange={(value) =>
                                updateOtherCost(index, "category", value)
                              }
                            >
                              <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="genel">
                                  Genel Gider
                                </SelectItem>
                                <SelectItem value="nakliye">Nakliye</SelectItem>
                                <SelectItem value="vergi">Vergi</SelectItem>
                                <SelectItem value="depo">Depolama</SelectItem>
                                <SelectItem value="diger">Diğer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 md:col-span-3">
                            <Label className="text-xs font-medium text-gray-700">
                              Tutar (TL)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={cost.amount}
                              onChange={(e) =>
                                updateOtherCost(index, "amount", e.target.value)
                              }
                              placeholder="0.00"
                              className="h-10 border-2 border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profit Margin and Notes Section */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Kar Marjı ve Notlar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Kar Türü
                </Label>
                <Select
                  value={formData.profitType}
                  onValueChange={(value) => updateField("profitType", value)}
                >
                  <SelectTrigger className="h-11 border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                    <SelectValue placeholder="Kar türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Yüzde (%)</SelectItem>
                    <SelectItem value="fixed">Sabit Tutar (TL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.profitType === "percentage" ? (
                <div className="space-y-2">
                  <Label
                    htmlFor="profitMargin"
                    className="text-sm font-medium text-gray-700"
                  >
                    Kar Marjı (%)
                  </Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    step="0.1"
                    value={formData.profitMarginPercent}
                    onChange={(e) =>
                      updateField("profitMarginPercent", e.target.value)
                    }
                    placeholder="20"
                    className="h-11 border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                  <p className="text-sm text-gray-600">
                    Maliyet üzerine eklenecek kar yüzdesi
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label
                    htmlFor="profitAmount"
                    className="text-sm font-medium text-gray-700"
                  >
                    Birim Kar Tutarı (TL)
                  </Label>
                  <Input
                    id="profitAmount"
                    type="number"
                    step="0.01"
                    value={formData.profitAmountPerUnit}
                    onChange={(e) =>
                      updateField("profitAmountPerUnit", e.target.value)
                    }
                    placeholder="0.00"
                    className="h-11 border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                  <p className="text-sm text-gray-600">
                    Her ürün için sabit kar tutarı
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Özel Notlar
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Proforma için özel notlar..."
                  rows={4}
                  className="border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Rest of sections continue... */}
          {/* Calculation Results */}
          <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-600 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                Hesaplama Sonuçları
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Birim Maliyetler */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-900 text-sm uppercase tracking-wide">
                    Birim Maliyetler
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">İçerik:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.ingredientsCostPerUnit} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Ambalaj:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.packagingCostPerUnit} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Kutu:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.boxCostPerUnit} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Etiket:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.labelCostPerUnit} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                      <span className="font-semibold text-green-900">
                        Toplam Maliyet:
                      </span>
                      <span className="font-bold text-green-900">
                        {calculatePrice.totalCostPerUnit} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Kar:</span>
                      <span className="font-semibold text-emerald-700">
                        +{calculatePrice.profitPerUnit} TL
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <span className="font-bold text-green-900">
                        Birim Fiyat:
                      </span>
                      <span className="font-bold text-xl text-green-900">
                        {calculatePrice.unitPrice} TL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toplam Maliyetler */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-900 text-sm uppercase tracking-wide">
                    Toplam ({calculatePrice.quantity} adet)
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">İçerik:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.ingredientsCostTotal} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Ambalaj:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.packagingCostTotal} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Diğer:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.otherCostTotal} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                      <span className="font-semibold text-green-900">
                        Toplam Maliyet:
                      </span>
                      <span className="font-bold text-green-900">
                        {calculatePrice.totalCostTotal} TL
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Kar:</span>
                      <span className="font-semibold text-emerald-700">
                        +{calculatePrice.profitTotal} TL
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <span className="font-bold text-green-900">
                        Toplam Fiyat:
                      </span>
                      <span className="font-bold text-xl text-green-900">
                        {calculatePrice.totalPrice} TL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Özet */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-900 text-sm uppercase tracking-wide">
                    Özet Bilgiler
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Ürün Tipi:</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {formData.productType || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Miktarı:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.quantity} adet
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Ürün Hacmi:</span>
                      <span className="font-semibold text-gray-900">
                        {calculatePrice.totalProductVolume}g
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                      <span className="text-gray-700">Kar Marjı:</span>
                      <span className="font-semibold text-emerald-700">
                        {calculatePrice.profitType === "percentage"
                          ? `%${calculatePrice.profitMarginPercent}`
                          : "Sabit Tutar"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-green-300 mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={saveCalculation}
                  disabled={
                    savingCalculation ||
                    !formData.productName ||
                    !formData.quantity
                  }
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                >
                  {savingCalculation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Hesaplamayı Kaydet
                    </>
                  )}
                </Button>

                <Button
                  onClick={getAiSuggestion}
                  disabled={
                    aiLoading || !formData.productName || !formData.quantity
                  }
                  className="flex-1 md:flex-none"
                  variant="secondary"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI ile Analiz Et
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 md:flex-none border-2 border-gray-300"
                >
                  Formu Temizle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* AI Suggestion Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Fiyatlandırma Analizi
            </DialogTitle>
            <DialogDescription>
              Claude AI tarafından oluşturulan fiyatlandırma önerileri
            </DialogDescription>
          </DialogHeader>

          {aiSuggestion && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600">
                      Önerilen Kar Marjı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      %{aiSuggestion.suggestedProfitMargin}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600">
                      Önerilen Birim Fiyat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {parseFloat(aiSuggestion.suggestedUnitPrice).toFixed(2)}{" "}
                      TL
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600">
                      Önerilen Toplam Fiyat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-600">
                      {parseFloat(aiSuggestion.suggestedTotalPrice).toFixed(2)}{" "}
                      TL
                    </p>
                  </CardContent>
                </Card>
              </div>

              {aiSuggestion.analysis && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">
                    Detaylı Analiz
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
                    {aiSuggestion.analysis}
                  </div>
                </div>
              )}

              {aiSuggestion.optimizationTips &&
                aiSuggestion.optimizationTips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                      Maliyet Optimizasyonu Önerileri
                    </h4>
                    <ul className="space-y-2">
                      {aiSuggestion.optimizationTips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {aiSuggestion.riskFactors &&
                aiSuggestion.riskFactors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-700">
                      Risk Faktörleri
                    </h4>
                    <ul className="space-y-2">
                      {aiSuggestion.riskFactors.map((risk, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={applyAiSuggestion} className="flex-1">
                  Önerileri Uygula
                </Button>
                <Button
                  onClick={() => setShowAiDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Generate Formula Settings Dialog */}
      <Dialog
        open={showGenerateFormulaDialog}
        onOpenChange={setShowGenerateFormulaDialog}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Formül Ayarları
            </DialogTitle>
            <DialogDescription>
              Formül seviyesini seçin ve AI ile profesyonel formül oluşturun
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">
                Ürün Bilgileri
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700">Ürün Adı:</span>
                  <p className="font-medium text-blue-900">
                    {formData.productName || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Ürün Tipi:</span>
                  <p className="font-medium text-blue-900">
                    {formData.productType || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Hacim:</span>
                  <p className="font-medium text-blue-900">
                    {formData.productVolume
                      ? `${formData.productVolume} ml`
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Üretim Miktarı:</span>
                  <p className="font-medium text-blue-900">
                    {formData.quantity ? `${formData.quantity} adet` : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Formül Kalite Seviyesi
                </Label>
                <p className="text-sm text-gray-600">
                  1 (Ekonomik) ile 10 (Ultra Premium) arasında seçim yapın
                </p>
              </div>

              <div className="space-y-3 px-2">
                <Slider
                  value={[formulaLevel]}
                  onValueChange={(value) => setFormulaLevel(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between text-xs text-gray-500">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <span key={num}>{num}</span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Seçili Seviye:
                  </span>
                  <Badge variant="default" className="text-lg px-4 py-1">
                    {formulaLevel <= 3 && "💰"}
                    {formulaLevel >= 4 && formulaLevel <= 6 && "⭐"}
                    {formulaLevel >= 7 && formulaLevel <= 8 && "💎"}
                    {formulaLevel >= 9 && "👑"} {formulaLevel}/10
                  </Badge>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">
                  {formulaLevel <= 3 && "Ekonomik Formül"}
                  {formulaLevel === 4 && "Standart Formül"}
                  {formulaLevel === 5 && "Orta Segment Formül"}
                  {formulaLevel === 6 && "İyi Kalite Formül"}
                  {formulaLevel === 7 && "Premium Formül"}
                  {formulaLevel === 8 && "Yüksek Premium Formül"}
                  {formulaLevel >= 9 && "Ultra Lüks Formül"}
                </h4>
                <p className="text-sm text-gray-600">
                  {formulaLevel === 1 &&
                    "En temel hammaddeler, minimum maliyet, 6-8 bileşen"}
                  {formulaLevel === 2 &&
                    "Temel ama kaliteli hammaddeler, 8-10 bileşen"}
                  {formulaLevel === 3 &&
                    "Uygun fiyatlı etkili hammaddeler, 10-12 bileşen"}
                  {formulaLevel === 4 &&
                    "Dengeli standart kalite, etkili içerikler, 12-14 bileşen"}
                  {formulaLevel === 5 &&
                    "Orta segment, kalite-fiyat dengesi, 14-16 bileşen"}
                  {formulaLevel === 6 &&
                    "İyi kalite aktif maddeler, güçlü formülasyon, 16-18 bileşen"}
                  {formulaLevel === 7 &&
                    "Premium hammaddeler, kompleks formülasyon, 18-20 bileşen"}
                  {formulaLevel === 8 &&
                    "Yüksek konsantrasyon aktifler, lüks içerikler, 20-22 bileşen"}
                  {formulaLevel === 9 &&
                    "Ultra premium bileşenler, ileri teknoloji, 22-24 bileşen"}
                  {formulaLevel === 10 &&
                    "En lüks hammaddeler, biyoteknoloji, peptidler, 24-25+ bileşen"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowGenerateFormulaDialog(false)}
                variant="outline"
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={generateFormula}
                disabled={
                  generatingFormula ||
                  !formData.productName ||
                  !formData.productType
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {generatingFormula ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Formül Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Formula Generation Result Dialog */}
      <Dialog open={showFormulaDialog} onOpenChange={setShowFormulaDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Oluşturulan Formül
            </DialogTitle>
            <DialogDescription>
              AI tarafından oluşturulan formülü inceleyin ve uygulayın
            </DialogDescription>
          </DialogHeader>

          {generatedFormula && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  {formulaLevel <= 3 && "💰"}
                  {formulaLevel >= 4 && formulaLevel <= 6 && "⭐"}
                  {formulaLevel >= 7 && formulaLevel <= 8 && "💎"}
                  {formulaLevel >= 9 && "👑"} Seviye {formulaLevel}/10
                </Badge>
                {generatedFormula.totalAmount && (
                  <Badge variant="outline">
                    Toplam: {generatedFormula.totalAmount}
                  </Badge>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          #
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Hammadde
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Miktar
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Fonksiyon
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">
                          Tahmini Fiyat
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {generatedFormula.formula?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.amount} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {item.function}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.estimatedPrice} TL
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {generatedFormula.suggestions && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">
                    Genel Öneriler
                  </h4>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-sm text-purple-900">
                    {generatedFormula.suggestions}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div className="flex gap-3">
                  <Button onClick={applyFormula} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Formülü Uygula
                  </Button>
                  <Button
                    onClick={() => {
                      applyFormula();
                      setTimeout(() => setShowSaveFormulaDialog(true), 500);
                    }}
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Uygula ve Kaydet
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setShowFormulaDialog(false);
                    setGeneratedFormula(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Save Formula Dialog */}
      <Dialog
        open={showSaveFormulaDialog}
        onOpenChange={setShowSaveFormulaDialog}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Formülü Kaydet
            </DialogTitle>
            <DialogDescription>
              Bu formülü ileride kullanmak üzere kaydedin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="formulaName"
                className="text-sm font-medium text-gray-700"
              >
                Formül Adı *
              </Label>
              <Input
                id="formulaName"
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
                placeholder="Örn: Nemlendirici Krem Formülü v1"
                className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="formulaNotes"
                className="text-sm font-medium text-gray-700"
              >
                Notlar (Opsiyonel)
              </Label>
              <Textarea
                id="formulaNotes"
                value={formulaNotes}
                onChange={(e) => setFormulaNotes(e.target.value)}
                placeholder="Formül hakkında notlar..."
                rows={3}
                className="border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Kaydedilecek Hammaddeler:
              </h4>
              <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                {formData.ingredients
                  .filter((ing) => ing.name)
                  .map((ing, idx) => (
                    <li key={idx} className="text-gray-600">
                      • {ing.name} - {ing.amount} {ing.unit}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={saveFormulaToFirestore}
                disabled={savingFormula || !formulaName}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {savingFormula ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowSaveFormulaDialog(false)}
                variant="outline"
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Load Formula Dialog */}
      <Dialog
        open={showLoadFormulaDialog}
        onOpenChange={setShowLoadFormulaDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Kayıtlı Formül Yükle
            </DialogTitle>
            <DialogDescription>
              Daha önce kaydettiğiniz formüllerden birini seçin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loadingFormulas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : savedFormulas.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Henüz kaydedilmiş formül yok</p>
                <p className="text-sm text-gray-500 mt-1">
                  İlk formülünüzü oluşturun ve kaydedin
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedFormulas.map((formula) => (
                  <div
                    key={formula.id}
                    className="border-2 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => loadFormulaFromFirestore(formula.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {formula.name}
                        </h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {formula.productType || "genel"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {formula.ingredients?.length || 0} hammadde
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {formula.ingredients && formula.ingredients.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {formula.ingredients.slice(0, 5).map((ing, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              {ing.name}
                            </span>
                          ))}
                          {formula.ingredients.length > 5 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{formula.ingredients.length - 5} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => setShowLoadFormulaDialog(false)}
                variant="outline"
              >
                Kapat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    
    </PermissionGuard>
  );
}
