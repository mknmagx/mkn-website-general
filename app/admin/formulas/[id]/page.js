"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  ArrowLeft,
  Save,
  Edit,
  TrendingUp,
  Package,
  DollarSign,
  Beaker,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
  Trash2,
  Settings,
  Factory,
  Shield,
  Thermometer,
  Layers,
  ListChecks,
  X,
  Calendar,
  FlaskConical,
  Sparkles,
  FileText,
  Megaphone,
  Wand2,
  RefreshCw,
  Copy,
  Check,
  Lightbulb,
  Target,
  Heart,
  Zap,
  TriangleAlert,
} from "lucide-react";
import * as FormulaService from "@/lib/services/formula-service";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedAI, AI_CONTEXTS } from "@/hooks/use-unified-ai";
import AISettingsModal from "@/components/admin/ai-settings-modal";
import FormulaPDFExport from "@/components/formula-pdf-export";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Category display names
const CATEGORY_LABELS = {
  cosmetic: "Kozmetik",
  dermocosmetic: "Dermokozmetik",
  cleaning: "Temizlik",
  supplement: "Gıda Takviyesi",
};

// Function display names
const FUNCTION_LABELS = {
  Active: "Aktif Madde",
  Excipient: "Dolgu Maddesi",
  "Flow Agent": "Akışkanlaştırıcı",
  Lubricant: "Yağlayıcı",
  Preservative: "Koruyucu",
  Emulsifier: "Emülgatör",
  Thickener: "Kıvam Artırıcı",
  Solvent: "Çözücü",
  Fragrance: "Parfüm",
  Colorant: "Renklendirici",
  Antioxidant: "Antioksidan",
  Other: "Diğer",
};

export default function FormulaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  // State
  const [formula, setFormula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Edit states
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editableIngredients, setEditableIngredients] = useState([]);

  // Marketing Content States
  const [marketingContent, setMarketingContent] = useState({
    productDescription: "",
    usageInstructions: "",
    recommendations: "",
    benefits: "",
    warnings: "",
  });
  const [isGeneratingMarketing, setIsGeneratingMarketing] = useState(false);
  const [savingMarketing, setSavingMarketing] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [marketingModelSettings, setMarketingModelSettings] = useState({
    temperature: 0.7,
    maxTokens: 2000,
  });

  // AI Hook for Marketing Content
  const {
    generateContent: generateMarketingAI,
    loading: aiLoading,
    configLoading: aiConfigLoading,
    availableModels,
    selectedModel,
    selectModel,
    isReady: aiIsReady,
    config: aiConfig,
    prompt: aiPrompt,
  } = useUnifiedAI(AI_CONTEXTS.FORMULA_MARKETING_GENERATION);

  // New ingredient form
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    displayName: "",
    function: "Other",
    amount: "",
    unit: "gram",
    price: "",
    supplier: "",
  });

  // Load formula
  const loadFormula = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FormulaService.loadFormula(params.id);
      setFormula(data);
      setEditForm({
        name: data.name || "",
        notes: data.notes || "",
        productVolume: data.productVolume || data.totalAmount || "",
        productionQuantity:
          data.productionQuantity || data.aiConfig?.productionQuantity || "",
      });
      setEditableIngredients(data.ingredients || []);
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
  }, [params.id, router, toast]);

  useEffect(() => {
    if (params.id) {
      loadFormula();
    }
  }, [params.id, loadFormula]);

  // Calculate costs - works for both view mode and edit mode
  // Also calculates percentage based on unit type
  const calculateIngredientsCosts = useCallback((ingredients, totalVolume) => {
    if (!ingredients || ingredients.length === 0) return [];

    // First, calculate total gram-based amount for percentage calculation
    // Exclude "adet" (piece) units from percentage calculation
    const totalGramAmount = ingredients.reduce((sum, ing) => {
      const amount = parseFloat(ing.amount) || 0;
      const unit = ing.unit || "gram";

      // Only include gram-based units in total
      if (unit === "adet" || unit === "%") return sum;

      // Convert to grams for percentage calculation
      let gramAmount = amount;
      if (unit === "mg") gramAmount = amount / 1000;
      else if (unit === "kg") gramAmount = amount * 1000;
      else if (unit === "ml")
        gramAmount = amount; // assume 1ml ≈ 1g
      else if (unit === "L") gramAmount = amount * 1000;

      return sum + gramAmount;
    }, 0);

    return ingredients.map((ing) => {
      const amount = parseFloat(ing.amount) || 0;
      const unit = ing.unit || "gram";
      const price =
        parseFloat(ing.price) || parseFloat(ing.estimatedPriceTLperKg) || 0;

      let cost = 0;
      let percentage = null;

      // Calculate cost based on unit type
      switch (unit) {
        case "adet":
          // For pieces: cost = amount * price per piece
          cost = amount * price;
          percentage = null; // Pieces don't have percentage
          break;
        case "mg":
          // price is per kg, so: (mg / 1,000,000) * pricePerKg
          cost = (amount / 1000000) * price;
          percentage =
            totalGramAmount > 0 ? (amount / 1000 / totalGramAmount) * 100 : 0;
          break;
        case "kg":
          // price is per kg: kg * pricePerKg
          cost = amount * price;
          percentage =
            totalGramAmount > 0 ? ((amount * 1000) / totalGramAmount) * 100 : 0;
          break;
        case "ml":
          // Assume 1ml ≈ 1g, price per kg: (ml / 1000) * pricePerKg
          cost = (amount / 1000) * price;
          percentage =
            totalGramAmount > 0 ? (amount / totalGramAmount) * 100 : 0;
          break;
        case "L":
          // Assume 1L ≈ 1000g, price per kg: L * pricePerKg
          cost = amount * price;
          percentage =
            totalGramAmount > 0 ? ((amount * 1000) / totalGramAmount) * 100 : 0;
          break;
        case "%":
          // Percentage-based: calculate from total volume
          const gramFromPercentage =
            totalVolume > 0 ? (amount / 100) * totalVolume : 0;
          cost = (gramFromPercentage / 1000) * price;
          percentage = amount; // Already a percentage
          break;
        case "gram":
        default:
          // Default gram: (gram / 1000) * pricePerKg
          cost = (amount / 1000) * price;
          percentage =
            totalGramAmount > 0 ? (amount / totalGramAmount) * 100 : 0;
          break;
      }

      return { ...ing, calculatedCost: cost, percentage };
    });
  }, []);

  // Memoized costs for view mode (from formula)
  const viewModeCosts = useMemo(() => {
    if (!formula?.ingredients) return null;

    const volume =
      parseFloat(formula.productVolume || formula.totalAmount) || 0;
    // Kutu içindeki adet - formül oluşturulurken seçilen değer
    const productionQuantity = parseInt(formula.productionQuantity) || 1;
    
    const ingredientsWithCost = calculateIngredientsCosts(
      formula.ingredients,
      volume,
    );
    // 1 birim için toplam maliyet
    const costPerUnit = ingredientsWithCost.reduce(
      (sum, ing) => sum + (ing.calculatedCost || 0),
      0,
    );
    // Kutu başına toplam maliyet (productionQuantity ile çarpılmış)
    const totalCost = costPerUnit * productionQuantity;

    // 1 birim hacim (toplam hacim / adet sayısı)
    const unitVolume = productionQuantity > 0 ? volume / productionQuantity : volume;

    return {
      volume,
      productionQuantity, // Kutu içindeki adet
      costPerUnit: costPerUnit.toFixed(4), // 1 birim için maliyet
      totalCost: totalCost.toFixed(2), // Kutu başına toplam maliyet
      costPerGram: unitVolume > 0 ? (costPerUnit / unitVolume).toFixed(4) : "0.0000",
      ingredients: ingredientsWithCost,
    };
  }, [formula, calculateIngredientsCosts]);

  // Memoized costs for edit mode (from editableIngredients)
  const editModeCosts = useMemo(() => {
    if (!editableIngredients || editableIngredients.length === 0) return null;

    // In edit mode, use editForm.productVolume for real-time calculation
    const volume =
      parseFloat(editForm.productVolume) ||
      parseFloat(formula?.productVolume || formula?.totalAmount) ||
      0;
    // Kutu içindeki adet
    const productionQuantity = parseInt(editForm.productionQuantity) || parseInt(formula?.productionQuantity) || 1;
    
    const ingredientsWithCost = calculateIngredientsCosts(
      editableIngredients,
      volume,
    );
    // 1 birim için toplam maliyet
    const costPerUnit = ingredientsWithCost.reduce(
      (sum, ing) => sum + (ing.calculatedCost || 0),
      0,
    );
    // Kutu başına toplam maliyet
    const totalCost = costPerUnit * productionQuantity;

    // 1 birim hacim (toplam hacim / adet sayısı)
    const unitVolume = productionQuantity > 0 ? volume / productionQuantity : volume;

    return {
      volume,
      productionQuantity,
      costPerUnit: costPerUnit.toFixed(4),
      totalCost: totalCost.toFixed(2),
      costPerGram: unitVolume > 0 ? (costPerUnit / unitVolume).toFixed(4) : "0.0000",
      ingredients: ingredientsWithCost,
    };
  }, [
    editableIngredients,
    editForm.productVolume,
    editForm.productionQuantity,
    formula,
    calculateIngredientsCosts,
  ]);

  // Use the appropriate costs based on editing state
  const costs = editing ? editModeCosts : viewModeCosts;

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      await FormulaService.updateFormula(params.id, {
        name: editForm.name,
        notes: editForm.notes,
        productVolume: parseFloat(editForm.productVolume) || 0,
        totalAmount: parseFloat(editForm.productVolume) || 0,
        productionQuantity: parseInt(editForm.productionQuantity) || 0,
        ingredients: editableIngredients,
      });

      await loadFormula();
      setEditing(false);

      toast({
        title: "Kaydedildi",
        description: "Formül başarıyla güncellendi.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Hata",
        description: "Formül kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Add ingredient
  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount) {
      toast({
        title: "Eksik Bilgi",
        description: "Hammadde adı ve miktarı zorunludur.",
        variant: "destructive",
      });
      return;
    }

    setEditableIngredients([
      ...editableIngredients,
      {
        ...newIngredient,
        displayName: newIngredient.displayName || newIngredient.name,
        amount: parseFloat(newIngredient.amount) || 0,
        price: parseFloat(newIngredient.price) || 0,
      },
    ]);

    setNewIngredient({
      name: "",
      displayName: "",
      function: "Other",
      amount: "",
      unit: "gram",
      price: "",
      supplier: "",
    });
  };

  // Remove ingredient
  const handleRemoveIngredient = (index) => {
    setEditableIngredients(editableIngredients.filter((_, i) => i !== index));
  };

  // Update ingredient - supports multiple fields at once
  const handleUpdateIngredient = (index, fieldOrFields, value) => {
    setEditableIngredients((prev) => {
      const updated = [...prev];
      if (typeof fieldOrFields === "object") {
        // Multiple fields: fieldOrFields is an object like { price: 100, estimatedPriceTLperKg: 100 }
        updated[index] = { ...updated[index], ...fieldOrFields };
      } else {
        // Single field
        updated[index] = { ...updated[index], [fieldOrFields]: value };
      }
      return updated;
    });
  };

  // Initialize marketing content from formula when loaded
  useEffect(() => {
    if (formula) {
      setMarketingContent({
        productDescription: formula.productDescription || "",
        usageInstructions: formula.usageInstructions || "",
        recommendations: formula.recommendations || "",
        benefits: formula.benefits || "",
        warnings: formula.warnings || "",
      });
    }
  }, [formula]);

  // Generate Marketing Content with AI
  const handleGenerateMarketing = async () => {
    if (!formula || !aiIsReady) {
      toast({
        title: "Hazır Değil",
        description: "AI yapılandırması yükleniyor, lütfen bekleyin.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingMarketing(true);

      // Prepare variables for prompt (DB'deki prompt template bu değişkenleri kullanacak)
      const activeIngredients =
        formula.ingredients
          ?.filter(
            (ing) =>
              ing.function === "Active" || ing.functionTr?.includes("Aktif"),
          )
          ?.map((ing) => ing.displayName || ing.name)
          ?.join(", ") || "Belirtilmemiş";

      const ingredientsList =
        formula.ingredients
          ?.map(
            (ing) =>
              `${ing.displayName || ing.name} (${ing.functionTr || ing.function})`,
          )
          ?.join(", ") || "Belirtilmemiş";

      // promptVariables - DB'deki prompt template'inde {{formulaName}}, {{productType}} gibi kullanılacak
      const promptVariables = {
        formulaName: formula.name,
        productType:
          CATEGORY_LABELS[formula.productType] || formula.productType,
        productVolume:
          formula.productVolume || formula.totalAmount || "Belirtilmemiş",
        activeIngredients,
        ingredientsList,
      };

      // generateContent çağrısı - prompt DB'den gelecek, sadece variables gönderiyoruz
      const response = await generateMarketingAI(null, {
        promptVariables: promptVariables,
        temperature: marketingModelSettings.temperature,
        maxTokens: marketingModelSettings.maxTokens,
      });

      // Response yapısı: { success: true, content: "..." } veya { success: false, error: "..." }
      if (!response?.success) {
        throw new Error(response?.error || "AI generation failed");
      }

      const content = response.content;
      
      if (content) {
        // Parse JSON response
        let parsedContent;
        try {
          // content artık string olarak geliyor (useUnifiedAI bunu hallediyor)
          let contentToParse = content;
          
          // Check if content is already an object with the expected fields
          if (typeof contentToParse === "object" && contentToParse.productDescription) {
            parsedContent = contentToParse;
          } else if (typeof contentToParse === "string") {
            // Try to extract JSON from string response
            const jsonMatch = contentToParse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              let jsonString = jsonMatch[0];
              
              // First try standard JSON parse
              try {
                parsedContent = JSON.parse(jsonString);
              } catch (firstParseError) {
                // API returns single-quoted JSON, need to convert
                // Step 1: Replace escaped single quotes (\') with placeholder
                let convertedJson = jsonString.replace(/\\'/g, '<<<ESCAPED_QUOTE>>>');
                
                // Step 2: Replace newlines inside strings with placeholder
                convertedJson = convertedJson.replace(/\n/g, '<<<NEWLINE>>>');
                
                // Step 3: Convert single quotes to double quotes
                convertedJson = convertedJson.replace(/'/g, '"');
                
                // Step 4: Restore escaped quotes as regular single quotes
                convertedJson = convertedJson.replace(/<<<ESCAPED_QUOTE>>>/g, "'");
                
                // Step 5: Restore newlines as escaped newlines
                convertedJson = convertedJson.replace(/<<<NEWLINE>>>/g, '\\n');
                
                try {
                  parsedContent = JSON.parse(convertedJson);
                } catch (secondParseError) {
                  // Log only in development, not as error
                  console.warn("JSON dönüştürme başarısız, regex fallback kullanılıyor");
                  throw secondParseError;
                }
              }
            } else {
              throw new Error("JSON bulunamadı");
            }
          } else if (typeof contentToParse === "object") {
            parsedContent = contentToParse;
          } else {
            throw new Error("Beklenmeyen yanıt formatı");
          }
        } catch (parseError) {
          // Fallback: Extract content manually using regex
          // This handles edge cases where JSON conversion fails
          const rawContent = typeof content === "string" ? content : JSON.stringify(content);
          
          // Extract values using regex - handles both 'key': 'value' and "key": "value"
          const extractValue = (key) => {
            // Try double quotes first
            let regex = new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"\\s*(?:,|\\})`);
            let match = rawContent.match(regex);
            
            if (!match) {
              // Try single quotes
              regex = new RegExp(`'${key}'\\s*:\\s*'([\\s\\S]*?)'\\s*(?:,|\\})`);
              match = rawContent.match(regex);
            }
            
            if (match) {
              // Convert escaped newlines and clean up
              return match[1]
                .replace(/\\n/g, '\n')
                .replace(/\\'/g, "'")
                .replace(/\\"/g, '"');
            }
            return "";
          };
          
          parsedContent = {
            productDescription: extractValue('productDescription'),
            usageInstructions: extractValue('usageInstructions'),
            recommendations: extractValue('recommendations'),
            benefits: extractValue('benefits'),
            warnings: extractValue('warnings'),
          };
          
          // If all fields are empty, put raw content in description
          if (!parsedContent.productDescription && !parsedContent.usageInstructions) {
            parsedContent.productDescription = rawContent;
          }
        }

        setMarketingContent({
          productDescription: parsedContent.productDescription || "",
          usageInstructions: parsedContent.usageInstructions || "",
          recommendations: parsedContent.recommendations || "",
          benefits: parsedContent.benefits || "",
          warnings: parsedContent.warnings || "",
        });

        toast({
          title: "Başarılı!",
          description: "Pazarlama içeriği oluşturuldu.",
        });
      }
    } catch (error) {
      console.error("Marketing generation error:", error);
      toast({
        title: "Hata",
        description:
          error.message || "Pazarlama içeriği oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMarketing(false);
    }
  };

  // Save Marketing Content
  const handleSaveMarketing = async () => {
    try {
      setSavingMarketing(true);
      await FormulaService.updateFormula(params.id, {
        productDescription: marketingContent.productDescription,
        usageInstructions: marketingContent.usageInstructions,
        recommendations: marketingContent.recommendations,
        benefits: marketingContent.benefits,
        warnings: marketingContent.warnings,
      });

      await loadFormula();

      toast({
        title: "Kaydedildi",
        description: "Pazarlama içeriği başarıyla kaydedildi.",
      });
    } catch (error) {
      console.error("Save marketing error:", error);
      toast({
        title: "Hata",
        description: "Pazarlama içeriği kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSavingMarketing(false);
    }
  };

  // Copy to clipboard
  const handleCopyField = async (field, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama başarısız oldu.",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "d MMMM yyyy, HH:mm", { locale: tr });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!formula) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800">
            Formül Bulunamadı
          </h2>
          <p className="text-slate-500 mt-1">
            İstenen formül mevcut değil veya silinmiş olabilir.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/admin/formulas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Formüllere Dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
                asChild
              >
                <Link href="/admin/formulas">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Geri
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  {formula.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs border-slate-300 text-slate-600"
                  >
                    {CATEGORY_LABELS[formula.productType] ||
                      formula.productType}
                  </Badge>
                  {formula.aiConfig?.subcategory?.name && (
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-300 text-slate-600"
                    >
                      {formula.aiConfig.subcategory.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setEditableIngredients(formula.ingredients || []);
                      setEditForm({
                        name: formula.name,
                        notes: formula.notes,
                        productVolume:
                          formula.productVolume || formula.totalAmount || "",
                        productionQuantity:
                          formula.productionQuantity ||
                          formula.aiConfig?.productionQuantity ||
                          "",
                      });
                    }}
                    className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-slate-800 hover:bg-slate-900 text-white"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Kaydet
                  </Button>
                </>
              ) : (
                <>
                  <FormulaPDFExport formula={formula} />
                  <Button
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="bg-slate-800 hover:bg-slate-900 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Hacim
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {costs?.volume || 0}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    gram
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Toplam Maliyet
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  ₺{costs?.totalCost || "0.00"}
                </p>
                {costs?.productionQuantity > 1 && (
                  <p className="text-xs text-green-600">
                    {costs.productionQuantity} adet × ₺{costs.costPerUnit}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Birim Maliyet
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  ₺{costs?.costPerGram || "0.0000"}{" "}
                  <span className="text-sm font-normal text-slate-500">/g</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Beaker className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Hammadde
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {formula.ingredients?.length || 0}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    adet
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Factory className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Üretim Maliyeti
                </p>
                <p className="text-lg font-semibold text-emerald-700">
                  ₺{costs?.totalCost || "0.00"}
                </p>
                <p className="text-xs text-slate-400">
                  {costs?.productionQuantity || 1}{" "}
                  adet × ₺{costs?.costPerUnit || "0.0000"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 p-1 mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
            >
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger
              value="ingredients"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
            >
              Hammaddeler ({formula.ingredients?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="manufacturing"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
            >
              Üretim
            </TabsTrigger>
            <TabsTrigger
              value="quality"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
            >
              Kalite
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
            >
              AI Ayarları
            </TabsTrigger>
            <TabsTrigger
              value="marketing"
              className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800"
            >
              Pazarlama
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Info className="h-4 w-4 text-slate-400" />
                      Temel Bilgiler
                    </h3>
                  </div>
                  <div className="p-5">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-600 text-sm">
                            Formül Adı
                          </Label>
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-600 text-sm">
                              Formül Gramı
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={editForm.productVolume}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    productVolume: e.target.value,
                                  })
                                }
                                className="bg-slate-50 border-slate-200 focus:bg-white pr-12"
                                placeholder="Örn: 100"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                gram
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-600 text-sm">
                              Üretim Adedi
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={editForm.productionQuantity}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    productionQuantity: e.target.value,
                                  })
                                }
                                className="bg-slate-50 border-slate-200 focus:bg-white pr-12"
                                placeholder="Örn: 1000"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                adet
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-600 text-sm">
                            Notlar
                          </Label>
                          <Textarea
                            value={editForm.notes}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                notes: e.target.value,
                              })
                            }
                            rows={4}
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Kategori
                          </p>
                          <p className="text-sm text-slate-800">
                            {CATEGORY_LABELS[formula.productType] ||
                              formula.productType}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Alt Kategori
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.aiConfig?.subcategory?.name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Ürün Hacmi
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.productVolume ||
                              formula.totalAmount ||
                              "-"}{" "}
                            gram
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Üretim Adedi
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.productionQuantity ||
                              formula.aiConfig?.productionQuantity ||
                              "-"}{" "}
                            adet
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Notlar
                          </p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">
                            {formula.notes || "-"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Suggestions */}
                {formula.suggestions && (
                  <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-400 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        AI Önerileri
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {formula.suggestions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Specs */}
                {(formula.shelfLife ||
                  formula.targetPH ||
                  formula.storageConditions) && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-slate-400" />
                        Hızlı Spesifikasyonlar
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-4">
                        {formula.shelfLife && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Raf Ömrü
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {formula.shelfLife}
                            </p>
                          </div>
                        )}
                        {formula.targetPH && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Hedef pH
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {formula.targetPH}
                            </p>
                          </div>
                        )}
                        {formula.storageConditions && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Saklama
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {formula.storageConditions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Dates */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Tarihler
                    </h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Oluşturulma
                      </span>
                      <span className="text-sm text-slate-800">
                        {formatDate(formula.createdAt)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Güncelleme</span>
                      <span className="text-sm text-slate-800">
                        {formatDate(formula.updatedAt)}
                      </span>
                    </div>
                    {formula.aiConfig?.generatedAt && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            AI Üretim
                          </span>
                          <span className="text-sm text-slate-800">
                            {format(
                              new Date(formula.aiConfig.generatedAt),
                              "d MMM yyyy, HH:mm",
                              { locale: tr },
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Production Notes */}
                {formula.productionNotes &&
                  formula.productionNotes.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <Factory className="h-4 w-4 text-slate-400" />
                          Üretim Notları
                        </h3>
                      </div>
                      <div className="p-5">
                        <ul className="space-y-2">
                          {formula.productionNotes.map((note, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-slate-600 flex items-start gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                {/* Quality Checks */}
                {formula.qualityChecks && formula.qualityChecks.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                        Kalite Kontrolleri
                      </h3>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2">
                        {formula.qualityChecks.map((check, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-slate-600 flex items-start gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            {check}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Beaker className="h-4 w-4 text-slate-400" />
                  Hammadde Listesi
                </h3>
                {editing && (
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-200 text-blue-600"
                  >
                    Düzenleme Modu
                  </Badge>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Hammadde
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Fonksiyon
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Oran
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Fiyat (₺/kg)
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Maliyet
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Tedarikçi
                      </th>
                      {editing && <th className="px-5 py-3"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(editing
                      ? editableIngredients
                      : costs?.ingredients || []
                    )?.map((ing, idx) => {
                      // Get calculated cost from costs for this ingredient
                      const calculatedCost =
                        costs?.ingredients?.[idx]?.calculatedCost || 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-4">
                            {editing ? (
                              <div className="space-y-1">
                                <Input
                                  value={ing.displayName || ing.name}
                                  onChange={(e) =>
                                    handleUpdateIngredient(
                                      idx,
                                      "displayName",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-sm bg-slate-50 border-slate-200"
                                  placeholder="Türkçe ad"
                                />
                                <Input
                                  value={ing.name}
                                  onChange={(e) =>
                                    handleUpdateIngredient(
                                      idx,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-xs bg-slate-50 border-slate-200"
                                  placeholder="INCI adı"
                                />
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {ing.displayName || ing.name}
                                </p>
                                {ing.displayName &&
                                  ing.name !== ing.displayName && (
                                    <p className="text-xs text-slate-500">
                                      {ing.name}
                                    </p>
                                  )}
                                {ing.specNotes && (
                                  <p className="text-xs text-slate-400 mt-1">
                                    {ing.specNotes}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {editing ? (
                              <Input
                                value={ing.functionTr || ing.function}
                                onChange={(e) =>
                                  handleUpdateIngredient(
                                    idx,
                                    "functionTr",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-sm w-32 bg-slate-50 border-slate-200"
                              />
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs border-slate-200 text-slate-600"
                              >
                                {ing.functionTr ||
                                  FUNCTION_LABELS[ing.function] ||
                                  ing.function}
                              </Badge>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {editing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.001"
                                  value={ing.amount}
                                  onChange={(e) =>
                                    handleUpdateIngredient(
                                      idx,
                                      "amount",
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="h-8 text-sm w-20 bg-slate-50 border-slate-200"
                                />
                                <Select
                                  value={ing.unit || "gram"}
                                  onValueChange={(value) =>
                                    handleUpdateIngredient(idx, "unit", value)
                                  }
                                >
                                  <SelectTrigger className="h-8 w-20 text-xs bg-slate-50 border-slate-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gram">gram</SelectItem>
                                    <SelectItem value="mg">mg</SelectItem>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="L">L</SelectItem>
                                    <SelectItem value="adet">adet</SelectItem>
                                    <SelectItem value="%"> %</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-800">
                                {ing.amount} {ing.unit}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-800">
                              {ing.unit === "adet"
                                ? "-"
                                : costs?.ingredients?.[idx]?.percentage != null
                                  ? `${costs.ingredients[idx].percentage.toFixed(2)}%`
                                  : ing.percentage != null
                                    ? `${ing.percentage.toFixed(2)}%`
                                    : "-"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {editing ? (
                              <Input
                                type="number"
                                value={
                                  ing.estimatedPriceTLperKg || ing.price || 0
                                }
                                onChange={(e) => {
                                  const newPrice =
                                    parseFloat(e.target.value) || 0;
                                  handleUpdateIngredient(idx, {
                                    price: newPrice,
                                    estimatedPriceTLperKg: newPrice,
                                  });
                                }}
                                className="h-8 text-sm w-24 bg-slate-50 border-slate-200"
                              />
                            ) : (
                              <span className="text-sm text-slate-800">
                                {ing.estimatedPriceTLperKg || ing.price
                                  ? `₺${ing.estimatedPriceTLperKg || ing.price}`
                                  : "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-slate-800">
                              ₺
                              {(() => {
                                // 1 adet ürün için maliyet
                                const unitCost = calculatedCost ||
                                  ing.calculatedCost ||
                                  ing.estimatedCostTL ||
                                  0;
                                return unitCost.toFixed(4);
                              })()}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {editing ? (
                              <Input
                                value={ing.supplier || ""}
                                onChange={(e) =>
                                  handleUpdateIngredient(
                                    idx,
                                    "supplier",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-sm w-32 bg-slate-50 border-slate-200"
                              />
                            ) : (
                              <span className="text-sm text-slate-600">
                                {ing.supplier || "-"}
                              </span>
                            )}
                          </td>
                          {editing && (
                            <td className="px-5 py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveIngredient(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-4 text-sm font-semibold text-slate-800"
                      >
                        Toplam
                        {costs?.productionQuantity > 1 && (
                          <span className="text-xs font-normal text-green-600 ml-2">
                            ({costs.productionQuantity} adet/kutu)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {(() => {
                          // Calculate total percentage excluding "adet" units
                          const totalPercentage = (costs?.ingredients || [])
                            .filter((ing) => ing.unit !== "adet")
                            .reduce(
                              (sum, ing) => sum + (ing.percentage || 0),
                              0,
                            );
                          return totalPercentage > 0
                            ? `${totalPercentage.toFixed(2)}%`
                            : "-";
                        })()}
                      </td>
                      <td className="px-5 py-4"></td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        ₺{costs?.totalCost || "0.00"}
                        {costs?.productionQuantity > 1 && costs?.costPerUnit && (
                          <span className="text-xs font-normal text-slate-500 block">
                            (1 birim: ₺{costs.costPerUnit})
                          </span>
                        )}
                      </td>
                      <td colSpan={editing ? 2 : 1}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Add New Ingredient Form */}
              {editing && (
                <div className="px-5 py-4 bg-blue-50 border-t border-blue-100">
                  <h4 className="text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-blue-600" />
                    Yeni Hammadde Ekle
                  </h4>
                  <div className="grid grid-cols-7 gap-3">
                    <div>
                      <Label className="text-xs text-slate-500">
                        INCI Adı *
                      </Label>
                      <Input
                        value={newIngredient.name}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            name: e.target.value,
                          })
                        }
                        className="h-9 text-sm bg-white border-slate-200"
                        placeholder="Aqua"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">
                        Türkçe Adı
                      </Label>
                      <Input
                        value={newIngredient.displayName}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            displayName: e.target.value,
                          })
                        }
                        className="h-9 text-sm bg-white border-slate-200"
                        placeholder="Su"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">
                        Fonksiyon
                      </Label>
                      <Input
                        value={newIngredient.function}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            function: e.target.value,
                          })
                        }
                        className="h-9 text-sm bg-white border-slate-200"
                        placeholder="Çözücü"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">
                        Miktar (g) *
                      </Label>
                      <Input
                        type="number"
                        value={newIngredient.amount}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            amount: e.target.value,
                          })
                        }
                        className="h-9 text-sm bg-white border-slate-200"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">
                        Fiyat (₺/kg)
                      </Label>
                      <Input
                        type="number"
                        value={newIngredient.price}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            price: e.target.value,
                          })
                        }
                        className="h-9 text-sm bg-white border-slate-200"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">
                        Tedarikçi
                      </Label>
                      <Input
                        value={newIngredient.supplier}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            supplier: e.target.value,
                          })
                        }
                        className="h-9 text-sm bg-white border-slate-200"
                        placeholder="Firma"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddIngredient}
                        size="sm"
                        className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ekle
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Manufacturing Tab */}
          <TabsContent value="manufacturing" className="space-y-6">
            {formula.manufacturing ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-slate-400" />
                      İşlem Bilgileri
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {formula.manufacturing.processType && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          İşlem Tipi
                        </p>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {formula.manufacturing.processType.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    )}
                    {formula.manufacturing.mixingSpeed && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Karıştırma Hızı
                        </p>
                        <p className="text-sm text-slate-800">
                          {formula.manufacturing.mixingSpeed}
                        </p>
                      </div>
                    )}
                    {formula.manufacturing.totalTime && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Toplam Süre
                        </p>
                        <p className="text-sm text-slate-800">
                          {formula.manufacturing.totalTime}
                        </p>
                      </div>
                    )}
                    {(formula.manufacturing.fillingTemp ||
                      formula.manufacturing.fillingTemp_C) && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Dolum Sıcaklığı
                        </p>
                        <p className="text-sm text-slate-800">
                          {formula.manufacturing.fillingTemp ||
                            `${formula.manufacturing.fillingTemp_C}°C`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-slate-400" />
                      Üretim Adımları
                    </h3>
                  </div>
                  <div className="p-5">
                    {formula.manufacturing.steps &&
                    formula.manufacturing.steps.length > 0 ? (
                      <ol className="space-y-3">
                        {formula.manufacturing.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {step}
                            </p>
                          </li>
                        ))}
                      </ol>
                    ) : formula.manufacturing.phases &&
                      formula.manufacturing.phases.length > 0 ? (
                      <div className="space-y-4">
                        {formula.manufacturing.phases.map((phase, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-slate-800">
                                {phase.name}
                              </h4>
                              {phase.temperature && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-red-200 text-red-600"
                                >
                                  <Thermometer className="h-3 w-3 mr-1" />
                                  {phase.temperature}
                                </Badge>
                              )}
                            </div>
                            {phase.ingredients &&
                              phase.ingredients.length > 0 && (
                                <p className="text-xs text-slate-500 mb-2">
                                  <span className="font-medium">
                                    Hammaddeler:
                                  </span>{" "}
                                  {phase.ingredients.join(", ")}
                                </p>
                              )}
                            {phase.instructions && (
                              <p className="text-sm text-slate-600">
                                {phase.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-8">
                        Üretim adımı tanımlanmamış
                      </p>
                    )}
                  </div>
                </div>

                {formula.manufacturing.criticalPoints &&
                  formula.manufacturing.criticalPoints.length > 0 && (
                    <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 border-l-4 border-l-red-400 overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Kritik Kontrol Noktaları
                        </h3>
                      </div>
                      <div className="p-5">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {formula.manufacturing.criticalPoints.map(
                            (point, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-slate-600 flex items-start gap-2"
                              >
                                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                                {point}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Factory className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">
                  Üretim bilgisi tanımlanmamış
                </p>
              </div>
            )}
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {formula.quality ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-slate-400" />
                      Kalite Spesifikasyonları
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-4">
                      {formula.quality.appearance && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Görünüm
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.quality.appearance}
                          </p>
                        </div>
                      )}
                      {formula.quality.color && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Renk
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.quality.color}
                          </p>
                        </div>
                      )}
                      {formula.quality.odor && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Koku
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.quality.odor}
                          </p>
                        </div>
                      )}
                      {formula.quality.texture && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Doku
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.quality.texture}
                          </p>
                        </div>
                      )}
                      {formula.quality.pH && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            pH
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.quality.pH.min} - {formula.quality.pH.max}
                          </p>
                        </div>
                      )}
                      {formula.quality.viscosity && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Viskozite
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.quality.viscosity.min} -{" "}
                            {formula.quality.viscosity.max}{" "}
                            {formula.quality.viscosity.unit || "cP"}
                          </p>
                        </div>
                      )}
                    </div>
                    {formula.quality.stabilityNotes && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 uppercase tracking-wide mb-1">
                          Stabilite
                        </p>
                        <p className="text-sm text-amber-800">
                          {formula.quality.stabilityNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    Kalite spesifikasyonu yok
                  </p>
                </div>
              )}

              {formula.compliance ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-400" />
                      Uyumluluk
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {formula.compliance.regulations?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                          Düzenlemeler
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formula.compliance.regulations.map((reg, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs border-green-200 text-green-700"
                            >
                              {reg}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {formula.compliance.claims?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                          İddialar
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formula.compliance.claims.map((claim, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs border-blue-200 text-blue-700"
                            >
                              {claim}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {formula.compliance.warnings?.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs text-red-700 uppercase tracking-wide mb-2">
                          Uyarılar
                        </p>
                        <ul className="space-y-1">
                          {formula.compliance.warnings.map((w, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-red-600 flex items-start gap-2"
                            >
                              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {formula.compliance.allergens?.length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 uppercase tracking-wide mb-2">
                          Alerjenler
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formula.compliance.allergens.map((a, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs border-amber-300 text-amber-700"
                            >
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    Uyumluluk bilgisi yok
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* AI Config Tab */}
          <TabsContent value="config" className="space-y-6">
            {formula.aiConfig ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-400" />
                      AI Yapılandırması
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Model
                        </p>
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                          {formula.aiConfig.selectedModel || "-"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Seviye
                        </p>
                        <p className="text-sm text-slate-800">
                          {formula.aiConfig.formulaLevel || "-"}/10
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Kategori
                        </p>
                        <p className="text-sm text-slate-800">
                          {CATEGORY_LABELS[formula.aiConfig.mainCategory] ||
                            formula.aiConfig.mainCategory}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Alt Kategori
                        </p>
                        <p className="text-sm text-slate-800">
                          {formula.aiConfig.subcategory?.name || "-"}
                        </p>
                      </div>
                    </div>
                    {formula.aiConfig.productType && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Ürün Tipi
                        </p>
                        <p className="text-sm text-slate-800">
                          {formula.aiConfig.productType.name ||
                            formula.aiConfig.productType}
                        </p>
                      </div>
                    )}
                    {formula.aiConfig.description && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                          Açıklama
                        </p>
                        <p className="text-sm text-slate-600">
                          {formula.aiConfig.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {formula.aiConfig.advancedOptions && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-slate-400" />
                        Gelişmiş Seçenekler
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Min Hammadde
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.aiConfig.advancedOptions.minIngredients ||
                              "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Max Hammadde
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.aiConfig.advancedOptions.maxIngredients ||
                              "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Kalite
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.aiConfig.advancedOptions
                              .ingredientQuality || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Hedef Kitle
                          </p>
                          <p className="text-sm text-slate-800">
                            {formula.aiConfig.advancedOptions.targetAudience ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      {formula.aiConfig.advancedOptions.certifications?.length >
                        0 && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                            Sertifikalar
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formula.aiConfig.advancedOptions.certifications.map(
                              (cert, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs border-slate-200"
                                >
                                  {cert}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formula.aiConfig.categorySpecific && (
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-slate-400" />
                        Kategori Özellikleri
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formula.aiConfig.categorySpecific.formType && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Form Tipi
                            </p>
                            <p className="text-sm text-slate-800">
                              {formula.aiConfig.categorySpecific.formType}
                            </p>
                          </div>
                        )}
                        {formula.aiConfig.categorySpecific.capsuleType && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Kapsül Tipi
                            </p>
                            <p className="text-sm text-slate-800">
                              {formula.aiConfig.categorySpecific.capsuleType}
                            </p>
                          </div>
                        )}
                        {formula.aiConfig.categorySpecific.capsuleSize && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Kapsül Boyutu
                            </p>
                            <p className="text-sm text-slate-800">
                              {formula.aiConfig.categorySpecific.capsuleSize}
                            </p>
                          </div>
                        )}
                        {formula.aiConfig.categorySpecific.productVolume && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Ürün Hacmi
                            </p>
                            <p className="text-sm text-slate-800">
                              {formula.aiConfig.categorySpecific.productVolume}{" "}
                              ml
                            </p>
                          </div>
                        )}
                        {formula.aiConfig.categorySpecific
                          .productionQuantity && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              Üretim Adedi
                            </p>
                            <p className="text-sm text-slate-800">
                              {
                                formula.aiConfig.categorySpecific
                                  .productionQuantity
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">
                  AI yapılandırması bulunamadı
                </p>
              </div>
            )}
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-6">
            {/* AI Marketing Generator Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Pazarlama İçeriği
                  </h3>
                  <p className="text-emerald-100 text-sm mt-1">
                    Formülünüz için profesyonel pazarlama içeriği oluşturun. AI,
                    ürün açıklaması, kullanım talimatı, faydalar ve öneriler
                    hazırlayacak.
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-emerald-100">
                    <span className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      {selectedModel?.name || "Model seçilmedi"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      Sıcaklık: {marketingModelSettings.temperature}
                    </span>
                    <span>{marketingModelSettings.maxTokens} token</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAISettings(true)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Ayarlar
                  </Button>
                  <Button
                    onClick={handleGenerateMarketing}
                    disabled={isGeneratingMarketing || !aiIsReady}
                    className="bg-white text-emerald-600 hover:bg-emerald-50"
                  >
                    {isGeneratingMarketing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        İçerik Oluştur
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Marketing Content Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Description */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    Ürün Açıklaması
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {marketingContent.productDescription?.length || 0}{" "}
                      karakter
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyField(
                          "productDescription",
                          marketingContent.productDescription,
                        )
                      }
                      disabled={!marketingContent.productDescription}
                      className="h-7 px-2"
                    >
                      {copiedField === "productDescription" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <Textarea
                    value={marketingContent.productDescription}
                    onChange={(e) =>
                      setMarketingContent({
                        ...marketingContent,
                        productDescription: e.target.value,
                      })
                    }
                    placeholder="Ürünün ne olduğunu, amacını ve kimler için uygun olduğunu açıklayın..."
                    rows={4}
                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Örnek: Bu nemlendirici krem, kuru ve hassas ciltler için
                    özel olarak formüle edilmiştir...
                  </p>
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-blue-500" />
                    Kullanım Talimatı
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {marketingContent.usageInstructions?.length || 0} karakter
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyField(
                          "usageInstructions",
                          marketingContent.usageInstructions,
                        )
                      }
                      disabled={!marketingContent.usageInstructions}
                      className="h-7 px-2"
                    >
                      {copiedField === "usageInstructions" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <Textarea
                    value={marketingContent.usageInstructions}
                    onChange={(e) =>
                      setMarketingContent({
                        ...marketingContent,
                        usageInstructions: e.target.value,
                      })
                    }
                    placeholder="Ürünün adım adım nasıl kullanılacağını açıklayın (3-5 adım önerilir)..."
                    rows={5}
                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Örnek: 1. Cildinizi temizleyin ve kurulayın. 2. Az miktarda
                    kremi avuç içinize alın...
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-blue-400 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Öneriler ve İpuçları
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {marketingContent.recommendations?.length || 0} karakter
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyField(
                          "recommendations",
                          marketingContent.recommendations,
                        )
                      }
                      disabled={!marketingContent.recommendations}
                      className="h-7 px-2"
                    >
                      {copiedField === "recommendations" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <Textarea
                    value={marketingContent.recommendations}
                    onChange={(e) =>
                      setMarketingContent({
                        ...marketingContent,
                        recommendations: e.target.value,
                      })
                    }
                    placeholder="Saklama koşulları, kullanım sıklığı ve kombinasyon önerilerini ekleyin..."
                    rows={4}
                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Örnek: Serin ve kuru yerde saklayın. Sabah ve akşam düzenli
                    kullanımda en iyi sonuçları alırsınız.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-green-400 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-green-500" />
                    Faydalar
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {marketingContent.benefits?.length || 0} karakter
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyField("benefits", marketingContent.benefits)
                      }
                      disabled={!marketingContent.benefits}
                      className="h-7 px-2"
                    >
                      {copiedField === "benefits" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <Textarea
                    value={marketingContent.benefits}
                    onChange={(e) =>
                      setMarketingContent({
                        ...marketingContent,
                        benefits: e.target.value,
                      })
                    }
                    placeholder="Ürünün sağladığı somut faydaları madde madde listeleyin..."
                    rows={4}
                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Örnek: • Cildi derilemesine nemlendirir • Kırışıklık
                    görünümünü azaltır • Cildin elastikiyetini artırır
                  </p>
                </div>
              </div>

              {/* Warnings */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 border-l-4 border-l-red-400 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4 text-red-500" />
                    Uyarılar
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {marketingContent.warnings?.length || 0} karakter
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyField("warnings", marketingContent.warnings)
                      }
                      disabled={!marketingContent.warnings}
                      className="h-7 px-2"
                    >
                      {copiedField === "warnings" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <Textarea
                    value={marketingContent.warnings}
                    onChange={(e) =>
                      setMarketingContent({
                        ...marketingContent,
                        warnings: e.target.value,
                      })
                    }
                    placeholder="Hassasiyet, kullanım kısıtlamaları ve güvenlik uyarılarını ekleyin..."
                    rows={3}
                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Örnek: İlk kullanımdan önce yama testi yapın. Göz çevresine
                    uygulamayın. Çocukların ulaşamayacağı yerde saklayın.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setMarketingContent({
                    productDescription: formula.productDescription || "",
                    usageInstructions: formula.usageInstructions || "",
                    recommendations: formula.recommendations || "",
                    benefits: formula.benefits || "",
                    warnings: formula.warnings || "",
                  });
                }}
                className="border-slate-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sıfırla
              </Button>
              <Button
                onClick={handleSaveMarketing}
                disabled={savingMarketing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {savingMarketing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Pazarlama İçeriğini Kaydet
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Settings Modal */}
        <AISettingsModal
          open={showAISettings}
          onOpenChange={setShowAISettings}
          title="Pazarlama AI Ayarları"
          description="Pazarlama içeriği üretimi için AI model ve ayarlarını yapılandırın"
          contextKey={AI_CONTEXTS.FORMULA_MARKETING_GENERATION}
          availableModels={availableModels}
          currentModel={selectedModel}
          selectModel={selectModel}
          prompt={aiPrompt}
          config={aiConfig}
          loading={aiConfigLoading}
          modelSettings={marketingModelSettings}
          setModelSettings={setMarketingModelSettings}
          promptVariables={{
            formulaName: formula?.name || "",
            productType:
              CATEGORY_LABELS[formula?.productType] ||
              formula?.productType ||
              "",
            productVolume: formula?.productVolume || formula?.totalAmount || "",
            activeIngredients:
              formula?.ingredients
                ?.filter((ing) => ing.function === "Active")
                ?.map((ing) => ing.displayName || ing.name)
                ?.join(", ") || "",
            ingredientsList:
              formula?.ingredients
                ?.map((ing) => ing.displayName || ing.name)
                ?.join(", ") || "",
          }}
        />
      </div>
    </div>
  );
}
