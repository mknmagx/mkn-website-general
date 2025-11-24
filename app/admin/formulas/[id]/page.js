"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2,
  ArrowLeft,
  Save,
  FileDown,
  Sparkles,
  Edit,
  Eye,
  TrendingUp,
  Package,
  DollarSign,
  Beaker,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import * as FormulaService from "@/lib/services/formula-service";
import { useClaude } from "@/hooks/use-claude";
import { useToast } from "@/hooks/use-toast";
import FormulaPDFExport from "@/components/formula-pdf-export";

// Helper function to extract sections from text
function extractSection(text, keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(
      `${keyword}[:\s]*([\\s\\S]*?)(?=\\n\\n|$|[A-Z0-9]{2,}:)`,
      "i"
    );
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return "";
}

export default function FormulaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { sendMessage, loading: aiLoading } = useClaude();

  const [formula, setFormula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [ingredientsEditMode, setIngredientsEditMode] = useState(false);
  const [editableIngredients, setEditableIngredients] = useState([]);
  const [hasMarketingChanges, setHasMarketingChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    function: "",
    amount: "",
    unit: "g",
    price: "",
    supplier: "",
  });

  // Editable fields
  const [formulaName, setFormulaName] = useState("");
  const [nameEditMode, setNameEditMode] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [usageInstructions, setUsageInstructions] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [benefits, setBenefits] = useState("");
  const [warnings, setWarnings] = useState("");
  const [hasNameChange, setHasNameChange] = useState(false);

  // Track marketing content changes
  useEffect(() => {
    if (!formula) return;

    const hasChanges =
      productDescription !== (formula.productDescription || "") ||
      usageInstructions !== (formula.usageInstructions || "") ||
      recommendations !== (formula.recommendations || "") ||
      benefits !== (formula.benefits || "") ||
      warnings !== (formula.warnings || "");

    setHasMarketingChanges(hasChanges);
  }, [
    productDescription,
    usageInstructions,
    recommendations,
    benefits,
    warnings,
    formula,
  ]);

  // Calculate formula cost
  const calculateFormulaCost = () => {
    if (!formula || !formula.ingredients) return null;

    let totalCost = 0;
    const volume = parseFloat(formula.productVolume) || 0;
    const ingredientsWithCost = [];

    formula.ingredients.forEach((ing) => {
      const amount = parseFloat(ing.amount) || 0;
      const price = parseFloat(ing.price) || 0;

      // Calculate cost based on amount and price (price is per kg)
      let cost = 0;
      if (ing.unit === "g" || ing.unit === "gram") {
        cost = (amount / 1000) * price;
      } else if (ing.unit === "ml") {
        cost = (amount / 1000) * price;
      } else if (ing.unit === "kg") {
        cost = amount * price;
      } else {
        cost = amount * price;
      }

      totalCost += cost;
      ingredientsWithCost.push({
        ...ing,
        calculatedCost: cost.toFixed(2),
      });
    });

    return {
      volume: volume,
      totalCost: totalCost.toFixed(2),
      costPerGram: volume > 0 ? (totalCost / volume).toFixed(4) : "0.0000",
      ingredients: ingredientsWithCost,
    };
  };

  const formulaCost = calculateFormulaCost();

  useEffect(() => {
    if (params.id) {
      loadFormula();
    }
  }, [params.id]);

  const loadFormula = async () => {
    try {
      setLoading(true);
      const data = await FormulaService.loadFormula(params.id);
      setFormula(data);
      setFormulaName(data.name || "");
      setEditableIngredients(data.ingredients || []);

      // Load existing marketing content
      setProductDescription(data.productDescription || "");
      setUsageInstructions(data.usageInstructions || "");
      setRecommendations(data.recommendations || "");
      setBenefits(data.benefits || "");
      setWarnings(data.warnings || "");
    } catch (error) {
      console.error("Error loading formula:", error);
      toast({
        title: "Hata",
        description: "Formül yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
      router.push("/admin/formulas");
    } finally {
      setLoading(false);
    }
  };

  const checkAndGenerate = () => {
    // Check if there's existing content
    const hasExistingContent =
      productDescription.trim() ||
      usageInstructions.trim() ||
      recommendations.trim() ||
      benefits.trim() ||
      warnings.trim();

    // Ask for confirmation if content exists
    if (hasExistingContent) {
      setShowConfirmDialog(true);
    } else {
      generateMarketingContent();
    }
  };

  const generateMarketingContent = async () => {
    if (!formula) return;

    try {
      setGenerating(true);
      setShowConfirmDialog(false);

      const ingredientsList = formula.ingredients
        .map((ing) => `${ing.name} (${ing.percentage}%)`)
        .join(", ");

      const prompt = `Sen profesyonel bir kozmetik uzmanısın. Aşağıdaki formül için KISA ve ÖZ ürün bilgileri oluştur.

FORMÜL: ${formula.name}
TİP: ${formula.productType}
HACİM: ${formula.productVolume || "Belirtilmedi"} ml
HAMMADDELER: ${ingredientsList}

Her bölümü KISA tut (2-4 cümle):

1. ÜRÜN AÇIKLAMASI: Ne olduğu, amacı, hangi cilt için uygun
2. KULLANIM TALİMATI: 3-4 adımda nasıl kullanılır
3. ÖNERİLER: Saklama ve kullanım ipuçları
4. FAYDALAR: 4-5 ana madde faydaları
5. UYARILAR: Önemli dikkat edilecekler

JSON döndür:
{
  "productDescription": "...",
  "usageInstructions": "...",
  "recommendations": "...",
  "benefits": "...",
  "warnings": "..."
}`;

      const response = await sendMessage(prompt, {
        maxTokens: 1500,
        type: "generate",
      });

      console.log("AI Response:", response);

      // Parse response - multiple fallback strategies
      let content = null;

      // Strategy 1: JSON code blocks
      let jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          let jsonStr = jsonMatch[1].trim();
          // Remove trailing commas and fix escape issues
          jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");

          // Parse using a more forgiving approach
          content = JSON.parse(jsonStr);
          console.log("Strategy 1 success");
        } catch (e) {
          console.log("Strategy 1 failed:", e.message);

          // Try extracting fields with regex
          try {
            const text = jsonMatch[1].trim();
            const extractField = (fieldName) => {
              // Match field name and capture everything until the next field or end
              const regex = new RegExp(
                `"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`,
                "s"
              );
              const match = text.match(regex);
              if (match && match[1]) {
                return match[1]
                  .replace(/\\n/g, "\n")
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, "\\")
                  .replace(/\\t/g, "\t");
              }
              return "";
            };

            content = {
              productDescription: extractField("productDescription"),
              usageInstructions: extractField("usageInstructions"),
              recommendations: extractField("recommendations"),
              benefits: extractField("benefits"),
              warnings: extractField("warnings"),
            };

            if (Object.values(content).some((v) => v && v.length > 0)) {
              console.log("Strategy 1.5 success");
            } else {
              content = null;
            }
          } catch (e2) {
            console.log("Strategy 1.5 failed:", e2.message);
            content = null;
          }
        }
      }

      // Strategy 2: Direct JSON object
      if (!content) {
        jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            let jsonStr = jsonMatch[0].trim();
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");
            content = JSON.parse(jsonStr);
            console.log("Strategy 2 success");
          } catch (e) {
            console.log("Strategy 2 failed:", e.message);
          }
        }
      }

      // Strategy 3: Extract sections manually
      if (!content) {
        console.log("Attempting manual extraction...");
        content = {
          productDescription: extractSection(response, [
            "productDescription",
            "ÜRÜN AÇIKLAMASI",
            "Ürün Açıklaması",
          ]),
          usageInstructions: extractSection(response, [
            "usageInstructions",
            "KULLANIM TALİMATI",
            "Kullanım Talimatı",
          ]),
          recommendations: extractSection(response, [
            "recommendations",
            "ÖNERİLER",
            "Öneriler",
          ]),
          benefits: extractSection(response, [
            "benefits",
            "FAYDALAR",
            "Faydalar",
          ]),
          warnings: extractSection(response, [
            "warnings",
            "UYARILAR",
            "Uyarılar",
          ]),
        };
      }

      if (content && Object.values(content).some((v) => v && v.length > 0)) {
        console.log("Final content:", content);

        setProductDescription(content.productDescription || "");
        setUsageInstructions(content.usageInstructions || "");
        setRecommendations(content.recommendations || "");
        setBenefits(content.benefits || "");
        setWarnings(content.warnings || "");

        toast({
          title: "İçerik Oluşturuldu",
          description: "AI tarafından pazarlama içeriği hazırlandı.",
        });
      } else {
        throw new Error("JSON parse edilemedi");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Hata",
        description: "İçerik oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...editableIngredients];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate percentage if amount changes
    if (field === "amount") {
      const totalAmount = updated.reduce(
        (sum, ing) => sum + (parseFloat(ing.amount) || 0),
        0
      );
      updated.forEach((ing) => {
        const amount = parseFloat(ing.amount) || 0;
        ing.percentage =
          totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(2) : "0";
      });
    }

    setEditableIngredients(updated);
  };

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim() || !newIngredient.amount) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen en az hammadde adı ve miktarı girin.",
        variant: "destructive",
      });
      return;
    }

    const updated = [...editableIngredients, newIngredient];

    // Recalculate percentages
    const totalAmount = updated.reduce(
      (sum, ing) => sum + (parseFloat(ing.amount) || 0),
      0
    );
    updated.forEach((ing) => {
      const amount = parseFloat(ing.amount) || 0;
      ing.percentage =
        totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(2) : "0";
    });

    setEditableIngredients(updated);

    // Reset form
    setNewIngredient({
      name: "",
      function: "",
      amount: "",
      unit: "g",
      price: "",
      supplier: "",
    });

    toast({
      title: "Eklendi",
      description: "Yeni hammadde listeye eklendi.",
    });
  };

  const handleRemoveIngredient = (index) => {
    const updated = editableIngredients.filter((_, idx) => idx !== index);

    // Recalculate percentages
    const totalAmount = updated.reduce(
      (sum, ing) => sum + (parseFloat(ing.amount) || 0),
      0
    );
    updated.forEach((ing) => {
      const amount = parseFloat(ing.amount) || 0;
      ing.percentage =
        totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(2) : "0";
    });

    setEditableIngredients(updated);

    toast({
      title: "Kaldırıldı",
      description: "Hammadde listeden kaldırıldı.",
    });
  };

  const handleSaveIngredients = async () => {
    try {
      setSaving(true);
      await FormulaService.updateFormula(params.id, {
        ingredients: editableIngredients,
      });

      toast({
        title: "Kaydedildi",
        description: "Hammadde listesi güncellendi.",
      });

      setIngredientsEditMode(false);
      await loadFormula();
    } catch (error) {
      console.error("Error saving ingredients:", error);
      toast({
        title: "Hata",
        description: "Hammadde listesi kaydedilirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelIngredientsEdit = () => {
    setEditableIngredients(formula.ingredients || []);
    setIngredientsEditMode(false);
  };

  const handleSave = async () => {
    if (!formula) return;

    try {
      setSaving(true);

      const updates = {
        name: formulaName,
        productDescription,
        usageInstructions,
        recommendations,
        benefits,
        warnings,
      };

      await FormulaService.updateFormula(params.id, updates);

      toast({
        title: "Kaydedildi",
        description: "Değişiklikler başarıyla kaydedildi.",
      });

      setEditMode(false);
      setHasMarketingChanges(false);
      await loadFormula(); // Reload to get updated data
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Hata",
        description: "Kaydederken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!formula) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Formül bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/formulas")}
                className="hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                {nameEditMode ? (
                  <div className="flex items-center gap-3">
                    <Input
                      value={formulaName}
                      onChange={(e) => setFormulaName(e.target.value)}
                      className="text-2xl font-bold h-12 max-w-md"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={async () => {
                        setNameEditMode(false);
                        await handleSave();
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormulaName(formula.name);
                        setNameEditMode(false);
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                      {formulaName}
                    </h1>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setNameEditMode(true)}
                      className="hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Badge variant="default" className="bg-blue-600">
                    {formula.productType || "Genel"}
                  </Badge>
                  {formula.productVolume && (
                    <Badge
                      variant="outline"
                      className="border-blue-300 text-blue-700"
                    >
                      {formula.productVolume} ml
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-gray-300">
                    {formula.ingredients?.length || 0} hammadde
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <FormulaPDFExport
                formula={{
                  ...formula,
                  productDescription,
                  usageInstructions,
                  recommendations,
                  benefits,
                  warnings,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Cost Summary Cards - Modern Grid */}
        {formulaCost && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <Package className="h-8 w-8 opacity-80" />
                <div className="text-xs font-medium opacity-90">HACIM</div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {formulaCost.volume}
                <span className="text-xl ml-1 opacity-90">gram</span>
              </div>
              <div className="text-sm mt-2 opacity-80">Toplam formül hacmi</div>
            </div>

            <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 opacity-80" />
                <div className="text-xs font-medium opacity-90">MALİYET</div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                ₺{formulaCost.totalCost}
              </div>
              <div className="text-sm mt-2 opacity-80">
                Toplam üretim maliyeti
              </div>
            </div>

            <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 opacity-80" />
                <div className="text-xs font-medium opacity-90">
                  BİRİM FİYAT
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                ₺{formulaCost.costPerGram}
              </div>
              <div className="text-sm mt-2 opacity-80">Gram başına maliyet</div>
            </div>
          </div>
        )}

        {/* Tabs with Modern Design */}
        <Tabs defaultValue="formula" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 shadow-sm p-1 rounded-xl">
            <TabsTrigger
              value="formula"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
            >
              <Beaker className="h-4 w-4 mr-2" />
              Formül Detayı
            </TabsTrigger>
            <TabsTrigger
              value="marketing"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Pazarlama İçeriği
            </TabsTrigger>
            <TabsTrigger
              value="ai-config"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Ayarları
            </TabsTrigger>
          </TabsList>

          {/* Formula Details Tab */}
          <TabsContent value="formula" className="space-y-6">
            {/* Ingredients Table - Minimalist Design */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-blue-600" />
                    Hammadde Bileşimi
                  </CardTitle>
                  <div className="flex gap-2">
                    {ingredientsEditMode ? (
                      <>
                        <Button
                          onClick={handleCancelIngredientsEdit}
                          variant="outline"
                          size="sm"
                          className="hover:bg-gray-100"
                        >
                          İptal
                        </Button>
                        <Button
                          onClick={handleSaveIngredients}
                          disabled={saving}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Kaydediliyor
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Kaydet
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIngredientsEditMode(true)}
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Hammadde
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fonksiyon
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Miktar
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Oran
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Birim Fiyat
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Maliyet
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tedarikçi
                        </th>
                        {ingredientsEditMode && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            İşlem
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(ingredientsEditMode
                        ? editableIngredients
                        : formulaCost?.ingredients
                      )?.map((ing, idx) => {
                        const calculatedCost = ingredientsEditMode
                          ? (() => {
                              const amount = parseFloat(ing.amount) || 0;
                              const price = parseFloat(ing.price) || 0;
                              let cost = 0;
                              if (ing.unit === "g" || ing.unit === "gram") {
                                cost = (amount / 1000) * price;
                              } else if (ing.unit === "ml") {
                                cost = (amount / 1000) * price;
                              } else if (ing.unit === "kg") {
                                cost = amount * price;
                              } else {
                                cost = amount * price;
                              }
                              return cost.toFixed(2);
                            })()
                          : ing.calculatedCost;

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50/30 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4">
                              {ingredientsEditMode ? (
                                <Input
                                  value={ing.name}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      idx,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm font-semibold border-gray-300 focus:border-blue-500 rounded-lg"
                                />
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-sm font-semibold text-gray-900 cursor-help">
                                        {ing.name}
                                      </div>
                                    </TooltipTrigger>
                                    {ing.displayName && (
                                      <TooltipContent>
                                        <p>{ing.displayName}</p>
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {ingredientsEditMode ? (
                                <Input
                                  value={ing.function || ""}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      idx,
                                      "function",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Fonksiyon"
                                  className="text-xs border-gray-300 focus:border-blue-500 rounded-lg"
                                />
                              ) : ing.functionTr || ing.function ? (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-normal bg-blue-100 text-blue-800 border-0"
                                >
                                  {ing.functionTr || ing.function}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {ingredientsEditMode ? (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="number"
                                    value={ing.amount}
                                    onChange={(e) =>
                                      handleIngredientChange(
                                        idx,
                                        "amount",
                                        e.target.value
                                      )
                                    }
                                    className="w-20 text-sm border-gray-300 focus:border-blue-500 rounded-lg"
                                  />
                                  <Input
                                    value={ing.unit}
                                    onChange={(e) =>
                                      handleIngredientChange(
                                        idx,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                    className="w-16 text-sm border-gray-300 focus:border-blue-500 rounded-lg"
                                  />
                                </div>
                              ) : (
                                <span className="text-sm text-gray-700 font-medium">
                                  {ing.amount} {ing.unit}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="outline"
                                className="font-semibold border-blue-200 text-blue-700"
                              >
                                {ing.percentage}%
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {ingredientsEditMode ? (
                                <Input
                                  type="number"
                                  value={ing.price || ""}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      idx,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Fiyat"
                                  className="w-24 text-sm border-gray-300 focus:border-blue-500 rounded-lg"
                                />
                              ) : (
                                <span className="text-sm text-gray-700">
                                  {ing.price ? `₺${ing.price}/kg` : "—"}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-green-600">
                                ₺{calculatedCost}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {ingredientsEditMode ? (
                                <Input
                                  value={ing.supplier || ""}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      idx,
                                      "supplier",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Tedarikçi"
                                  className="text-sm border-gray-300 focus:border-blue-500 rounded-lg"
                                />
                              ) : (
                                <span className="text-sm text-gray-600">
                                  {ing.supplier || "—"}
                                </span>
                              )}
                            </td>
                            {ingredientsEditMode && (
                              <td className="px-6 py-4">
                                <Button
                                  onClick={() => handleRemoveIngredient(idx)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-200">
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-5 text-right text-sm font-bold text-gray-900 uppercase tracking-wide"
                        >
                          Toplam Maliyet
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xl font-bold text-green-600">
                            ₺
                            {ingredientsEditMode
                              ? editableIngredients
                                  .reduce((sum, ing) => {
                                    const amount = parseFloat(ing.amount) || 0;
                                    const price = parseFloat(ing.price) || 0;
                                    let cost = 0;
                                    if (
                                      ing.unit === "g" ||
                                      ing.unit === "gram"
                                    ) {
                                      cost = (amount / 1000) * price;
                                    } else if (ing.unit === "ml") {
                                      cost = (amount / 1000) * price;
                                    } else if (ing.unit === "kg") {
                                      cost = amount * price;
                                    } else {
                                      cost = amount * price;
                                    }
                                    return sum + cost;
                                  }, 0)
                                  .toFixed(2)
                              : formulaCost?.totalCost}
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Yeni Hammadde Ekleme Formu */}
                {ingredientsEditMode && (
                  <div className="p-6 bg-blue-50 border-t-2 border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-blue-600" />
                      Yeni Hammadde Ekle
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
                      <div className="lg:col-span-2">
                        <Label
                          htmlFor="new-name"
                          className="text-xs text-gray-600 mb-1"
                        >
                          Hammadde Adı *
                        </Label>
                        <Input
                          id="new-name"
                          value={newIngredient.name}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              name: e.target.value,
                            })
                          }
                          placeholder="Örn: Gliserin"
                          className="text-sm border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <Label
                          htmlFor="new-function"
                          className="text-xs text-gray-600 mb-1"
                        >
                          Fonksiyon
                        </Label>
                        <Input
                          id="new-function"
                          value={newIngredient.function}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              function: e.target.value,
                            })
                          }
                          placeholder="Örn: Nemlendirici"
                          className="text-sm border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="new-amount"
                          className="text-xs text-gray-600 mb-1"
                        >
                          Miktar *
                        </Label>
                        <Input
                          id="new-amount"
                          type="number"
                          value={newIngredient.amount}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              amount: e.target.value,
                            })
                          }
                          placeholder="100"
                          className="text-sm border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="new-unit"
                          className="text-xs text-gray-600 mb-1"
                        >
                          Birim
                        </Label>
                        <Input
                          id="new-unit"
                          value={newIngredient.unit}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              unit: e.target.value,
                            })
                          }
                          placeholder="g"
                          className="text-sm border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="new-price"
                          className="text-xs text-gray-600 mb-1"
                        >
                          Fiyat (₺/kg)
                        </Label>
                        <Input
                          id="new-price"
                          type="number"
                          value={newIngredient.price}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              price: e.target.value,
                            })
                          }
                          placeholder="150"
                          className="text-sm border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="new-supplier"
                          className="text-xs text-gray-600 mb-1"
                        >
                          Tedarikçi
                        </Label>
                        <Input
                          id="new-supplier"
                          value={newIngredient.supplier}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              supplier: e.target.value,
                            })
                          }
                          placeholder="Firma Adı"
                          className="text-sm border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddIngredient}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Listeye Ekle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Section */}
            {formula.notes && (
              <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="border-b border-amber-100">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="h-5 w-5 text-amber-600" />
                    Notlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {formula.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Marketing Content Tab */}
          <TabsContent value="marketing" className="space-y-6">
            {/* Save Button for Marketing Content */}
            {hasMarketingChanges && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Kaydedilmemiş Değişiklikler
                    </p>
                    <p className="text-sm text-gray-600">
                      Pazarlama içeriğinde yaptığınız değişiklikleri kaydetmeyi
                      unutmayın.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* AI Content Generation Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold">AI Pazarlama İçeriği</h3>
                  </div>
                  <p className="text-purple-50 leading-relaxed mb-4">
                    Formülünüz için profesyonel pazarlama içeriği oluşturun. AI,
                    ürün açıklaması, kullanım talimatı, faydalar ve öneriler
                    hazırlayacak.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-purple-100">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Otomatik ve hızlı</span>
                    <span className="text-purple-200">•</span>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Profesyonel dil</span>
                    <span className="text-purple-200">•</span>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Düzenlenebilir</span>
                  </div>
                </div>
                <Button
                  onClick={checkAndGenerate}
                  disabled={generating || aiLoading}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold shadow-lg hover:shadow-xl transition-all px-8 shrink-0"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      İçerik Oluştur
                    </>
                  )}
                </Button>
              </div>
            </div>
            {/* Product Description */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Ürün Açıklaması
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 font-mono"
                  >
                    {productDescription.length} karakter
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Ürünün ne olduğunu, amacını ve kimler için uygun olduğunu
                  açıklayın.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={6}
                  placeholder="Örnek: Bu nemlendirici krem, kuru ve hassas ciltler için özel olarak formüle edilmiştir..."
                  className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-colors"
                />
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="h-5 w-5 text-green-600" />
                    Kullanım Talimatı
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 font-mono"
                  >
                    {usageInstructions.length} karakter
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Ürünün adım adım nasıl kullanılacağını açıklayın (3-5 adım
                  önerilir).
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={usageInstructions}
                  onChange={(e) => setUsageInstructions(e.target.value)}
                  rows={6}
                  placeholder="Örnek:\n1. Cildinizi temizleyin ve kurulayın\n2. Az miktarda kremi avuç içinize alın\n3. Yüz ve boyun bölgesine hafif masaj hareketleriyle uygulayın\n4. Tamamen emilene kadar bekleyin"
                  className="resize-none border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-colors"
                />
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Öneriler ve İpuçları
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 font-mono"
                  >
                    {recommendations.length} karakter
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Saklama koşulları, kullanım sıklığı ve kombinasyon önerileri
                  ekleyin.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  rows={5}
                  placeholder="Örnek: Serin ve kuru yerde saklayın. Sabah ve akşam düzenli kullanımda en iyi sonuçları alırsınız. Güneş koruyucu ile birlikte kullanmanız önerilir."
                  className="resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-colors"
                />
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    Faydalar
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-teal-100 text-teal-700 font-mono"
                  >
                    {benefits.length} karakter
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Ürünün sağladığı somut faydaları madde madde listeleyin.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  rows={5}
                  placeholder="Örnek:\n• Cildi derinlemesine nemlendirir\n• Kırışıklık görünümünü azaltır\n• Cildin elastikiyetini artırır\n• Parlak ve canlı bir görünüm sağlar"
                  className="resize-none border-gray-200 focus:border-teal-500 focus:ring-teal-500 rounded-xl transition-colors"
                />
              </CardContent>
            </Card>

            {/* Warnings */}
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Uyarılar ve Önlemler
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-700 font-mono"
                  >
                    {warnings.length} karakter
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Güvenlik uyarıları, yan etkiler ve dikkat edilmesi gereken
                  hususları belirtin.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={warnings}
                  onChange={(e) => setWarnings(e.target.value)}
                  rows={5}
                  placeholder="Örnek: Göz ile temasından kaçınınız. Dış kullanım içindir. Alerjik reaksiyon görülürse kullanmayı bırakınız. Çocukların ulaşamayacağı yerde saklayınız."
                  className="resize-none border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl transition-colors"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Configuration Tab */}
          <TabsContent value="ai-config" className="space-y-6">
            {formula.aiConfig ? (
              <div className="space-y-6">
                {/* AI Model Used Card */}
                <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Kullanılan AI Modeli
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 rounded-lg p-3">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {formula.aiConfig.modelName || "Claude AI"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formula.aiConfig.selectedModel === "claude-haiku"
                            ? "Hızlı ve ekonomik AI modeli - Günlük formüller için ideal"
                            : formula.aiConfig.selectedModel === "claude-sonnet"
                            ? "Dengeli performans - Profesyonel formüller için önerilen"
                            : "En güçlü model - Karmaşık formüller için"}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Badge
                            variant="outline"
                            className="border-purple-300 text-purple-700"
                          >
                            {formula.aiConfig.selectedModel || "claude-haiku"}
                          </Badge>
                          {formula.aiConfig.generatedAt && (
                            <Badge
                              variant="outline"
                              className="border-gray-300 text-gray-600"
                            >
                              {new Date(
                                formula.aiConfig.generatedAt
                              ).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Details Card */}
                <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Ürün Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">
                          Ürün Adı
                        </Label>
                        <p className="text-base font-medium text-gray-900">
                          {formula.aiConfig.productName || "—"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">
                          Ürün Tipi
                        </Label>
                        <p className="text-base font-medium text-gray-900">
                          {formula.aiConfig.productType || "—"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">
                          Ürün Hacmi
                        </Label>
                        <p className="text-base font-medium text-gray-900">
                          {formula.aiConfig.productVolume
                            ? `${formula.aiConfig.productVolume} ml`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">
                          Formül Seviyesi
                        </Label>
                        <Badge
                          variant="outline"
                          className={
                            formula.aiConfig.formulaLevel === "basic"
                              ? "border-green-300 text-green-700"
                              : formula.aiConfig.formulaLevel === "professional"
                              ? "border-blue-300 text-blue-700"
                              : "border-purple-300 text-purple-700"
                          }
                        >
                          {formula.aiConfig.formulaLevel === "basic"
                            ? "Temel"
                            : formula.aiConfig.formulaLevel === "professional"
                            ? "Profesyonel"
                            : "İleri Seviye"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Description Card */}
                {formula.aiConfig.description && (
                  <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Info className="h-5 w-5 text-gray-600" />
                        Ürün Açıklaması
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {formula.aiConfig.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-gray-100 rounded-full p-6">
                      <Sparkles className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        AI Ayarları Bulunamadı
                      </h3>
                      <p className="text-sm text-gray-600 max-w-md">
                        Bu formül manuel olarak oluşturulmuş olabilir veya AI
                        ayarları kaydedilmemiş olabilir.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog for Overwriting Content */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Mevcut İçerik Silinecek
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p className="text-gray-700">
                  Pazarlama içeriği alanlarında{" "}
                  <strong>mevcut veri bulunuyor</strong>.
                </p>
                <p className="text-gray-700">
                  Yeni içerik oluşturulduğunda, mevcut tüm pazarlama içeriğiniz{" "}
                  <strong className="text-red-600">
                    silinecek ve yerine AI tarafından oluşturulan yeni içerik
                  </strong>{" "}
                  gelecek.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <strong>Not:</strong> Devam etmeden önce mevcut içeriğinizi
                  yedeklemenizi öneririz.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-100">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={generateMarketingContent}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Devam Et ve Yeni İçerik Oluştur
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
