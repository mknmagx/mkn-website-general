"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PermissionGuard } from "@/components/admin-route-guard";
import { usePermissions } from "@/components/admin-route-guard";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  Sparkles,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Edit3,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
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
  ChevronDown,
  ChevronRight,
  Wand2,
  Target,
  Shield,
  Star,
  Leaf,
  TestTube,
  FlaskConical,
  Pill,
  Droplets,
  Brush,
  Sun,
  Baby,
  User,
  Home,
  Factory,
  Award,
  RefreshCw,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as FormulaService from "@/lib/services/formula-service";
import { useUnifiedAI, AI_CONTEXTS } from "@/hooks/use-unified-ai";
import { PROVIDER_INFO, getFinishReasonMessage, isResponseTruncated, isResponseFiltered } from "@/lib/ai-constants";
import { cn } from "@/lib/utils";

// Formula Categories Config
import {
  MAIN_CATEGORIES,
  COSMETIC_SUBCATEGORIES,
  DERMOCOSMETIC_SUBCATEGORIES,
  CLEANING_SUBCATEGORIES,
  SUPPLEMENT_SUBCATEGORIES,
  FORMULA_LEVELS,
  INGREDIENT_QUALITY_LEVELS,
  FORMULA_PRESETS,
  CERTIFICATIONS,
  TARGET_AUDIENCES,
  getSubcategoriesByCategory,
  getLevelSpecs,
} from "@/lib/config/formula-categories";

// ============================================================================
// ICON MAP
// ============================================================================
const CATEGORY_ICONS = {
  cosmetic: Sparkles,
  dermocosmetic: TestTube,
  cleaning: Home,
  supplement: Pill,
};

const SUBCATEGORY_ICONS = {
  skincare: Droplets,
  haircare: Brush,
  bodycare: User,
  suncare: Sun,
  makeup: Sparkles,
  mens: User,
  baby: Baby,
  anti_aging: Star,
  brightening: Sparkles,
  acne: Target,
  sensitive: Shield,
  hydration: Droplets,
  medical: FlaskConical,
  household: Home,
  laundry: Package,
  dishwashing: Droplets,
  personal_hygiene: Shield,
  industrial: Factory,
  capsule: Pill,
  sachet: Package,
  tablet: Pill,
  powder: FlaskConical,
  liquid: Droplets,
};

// ============================================================================
// STEP INDICATOR COMPONENT
// ============================================================================
function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300",
              currentStep === step.id
                ? "bg-blue-600 text-white ring-4 ring-blue-100"
                : currentStep > step.id
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
          </div>
          <span
            className={cn(
              "ml-2 text-sm font-medium hidden sm:inline",
              currentStep === step.id
                ? "text-blue-600"
                : currentStep > step.id
                ? "text-green-600"
                : "text-gray-400"
            )}
          >
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-3",
                currentStep > step.id ? "bg-green-500" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CATEGORY CARD COMPONENT
// ============================================================================
function CategoryCard({ category, selected, onSelect }) {
  const Icon = CATEGORY_ICONS[category.id] || Beaker;

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className={cn(
        "relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02]",
        selected
          ? `border-${category.color}-500 bg-gradient-to-br ${category.gradient} text-white shadow-xl`
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all",
          selected
            ? "bg-white/20"
            : `bg-gradient-to-br ${category.gradient} text-white`
        )}
      >
        <span className="text-3xl">{category.icon}</span>
      </div>
      <span
        className={cn(
          "text-lg font-bold",
          selected ? "text-white" : "text-gray-900"
        )}
      >
        {category.name}
      </span>
      <span
        className={cn(
          "text-xs mt-1 text-center",
          selected ? "text-white/80" : "text-gray-500"
        )}
      >
        {category.description}
      </span>
      {selected && (
        <div className="absolute top-3 right-3">
          <Check className="w-5 h-5 text-white" />
        </div>
      )}
    </button>
  );
}

// ============================================================================
// SUBCATEGORY SELECTOR COMPONENT
// ============================================================================
function SubcategorySelector({
  category,
  subcategories,
  selectedSubcategory,
  onSelect,
}) {
  const [expandedSub, setExpandedSub] = useState(null);
  const [customProductName, setCustomProductName] = useState("");
  const [customProductVolume, setCustomProductVolume] = useState("");

  // Handle custom "Other" product selection
  const handleCustomProductSelect = (sub, key) => {
    if (customProductName.trim()) {
      const customProduct = {
        id: "custom_other",
        name: customProductName.trim(),
        defaultVolume: parseInt(customProductVolume) || 50,
        unit: "ml",
        isCustom: true,
      };
      onSelect({ ...sub, id: key }, customProduct);
    }
  };

  return (
    <div className="space-y-2">
      {Object.entries(subcategories).map(([key, sub]) => {
        const Icon = SUBCATEGORY_ICONS[key] || Package;
        const isExpanded = expandedSub === key;
        const isSelected = selectedSubcategory?.id === key;
        const isOtherSelected = selectedSubcategory?.productId === "custom_other" && isSelected;

        return (
          <Collapsible
            key={key}
            open={isExpanded}
            onOpenChange={() => setExpandedSub(isExpanded ? null : key)}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <span className="text-lg">{sub.icon}</span>
                  </div>
                  <div className="text-left">
                    <span
                      className={cn(
                        "font-semibold",
                        isSelected ? "text-blue-700" : "text-gray-900"
                      )}
                    >
                      {sub.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(sub.products?.length || sub.formTypes?.length || 0) + 1}{" "}
                      ürün)
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isExpanded ? "rotate-180" : "",
                    isSelected ? "text-blue-500" : "text-gray-400"
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-b-xl -mt-2 border border-t-0 border-gray-200">
                {sub.products?.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onSelect({ ...sub, id: key }, product)}
                    className={cn(
                      "p-3 rounded-lg text-left transition-all text-sm",
                      selectedSubcategory?.productId === product.id
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                    )}
                  >
                    <span className="font-medium block truncate">
                      {product.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        selectedSubcategory?.productId === product.id
                          ? "text-blue-100"
                          : "text-gray-400"
                      )}
                    >
                      {product.defaultVolume} {product.unit}
                    </span>
                  </button>
                ))}
                
                <button
                  key="other"
                  type="button"
                  onClick={() => {
                    if (!isOtherSelected) {
                      setCustomProductName("");
                      setCustomProductVolume("");
                    }
                    // Sadece işaretleme yapmak için - custom input alanı açılacak
                    onSelect({ ...sub, id: key }, {
                      id: "custom_other",
                      name: customProductName.trim() || "Diğer Ürün",
                      defaultVolume: parseInt(customProductVolume) || 50,
                      unit: "ml",
                      isCustom: true,
                    });
                  }}
                  className={cn(
                    "p-3 rounded-lg text-left transition-all text-sm border-2 border-dashed",
                    isOtherSelected
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white hover:bg-amber-50 text-gray-700 border-amber-300 hover:border-amber-400"
                  )}
                >
                  <span className="font-medium truncate flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    Diğer
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isOtherSelected
                        ? "text-amber-100"
                        : "text-amber-600"
                    )}
                  >
                    Manuel giriş
                  </span>
                </button>
              </div>
              
              {/* Diğer seçildiğinde manuel giriş alanları */}
              {isOtherSelected && (
                <div className="p-4 bg-amber-50 border border-t-0 border-amber-200 rounded-b-xl -mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                    <Edit3 className="w-4 h-4" />
                    Manuel Ürün Girişi
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-amber-800 mb-1 block">
                        Ürün Adı *
                      </Label>
                      <Input
                        value={customProductName}
                        onChange={(e) => {
                          setCustomProductName(e.target.value);
                          // Real-time update
                          if (e.target.value.trim()) {
                            onSelect({ ...sub, id: key }, {
                              id: "custom_other",
                              name: e.target.value.trim(),
                              defaultVolume: parseInt(customProductVolume) || 50,
                              unit: "ml",
                              isCustom: true,
                            });
                          }
                        }}
                        placeholder="Örn: Anti-aging Serum, Peptit Kremi..."
                        className="h-10 bg-white border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-amber-800 mb-1 block">
                        Varsayılan Hacim (ml)
                      </Label>
                      <Input
                        type="number"
                        value={customProductVolume}
                        onChange={(e) => {
                          setCustomProductVolume(e.target.value);
                          // Real-time update
                          if (customProductName.trim()) {
                            onSelect({ ...sub, id: key }, {
                              id: "custom_other",
                              name: customProductName.trim(),
                              defaultVolume: parseInt(e.target.value) || 50,
                              unit: "ml",
                              isCustom: true,
                            });
                          }
                        }}
                        placeholder="50"
                        className="h-10 bg-white border-amber-300 focus:border-amber-500"
                      />
                    </div>
                  </div>
                  {customProductName.trim() && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Ürün: <strong>{customProductName}</strong> 
                        {customProductVolume && ` - ${customProductVolume} ml`}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

// ============================================================================
// FORMULA LEVEL SLIDER COMPONENT
// ============================================================================
function FormulaLevelSlider({ value, onChange }) {
  const level = FORMULA_LEVELS[value];

  const getTierColor = (tier) => {
    switch (tier) {
      case "economy":
        return "from-green-500 to-emerald-500";
      case "mid":
        return "from-blue-500 to-indigo-500";
      case "premium":
        return "from-purple-500 to-violet-500";
      case "luxury":
        return "from-amber-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case "economy":
        return "bg-green-100 text-green-700 border-green-200";
      case "mid":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "premium":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "luxury":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Level Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl",
              `bg-gradient-to-br ${getTierColor(level.tier)}`
            )}
          >
            {value}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{level.name}</span>
              <Badge
                variant="outline"
                className={getTierBadgeColor(level.tier)}
              >
                {level.tier === "economy" && "Ekonomik"}
                {level.tier === "mid" && "Orta Segment"}
                {level.tier === "premium" && "Premium"}
                {level.tier === "luxury" && "Lüks"}
              </Badge>
            </div>
            <span className="text-sm text-gray-500">{level.description}</span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative pt-2">
        <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
          <span>Temel</span>
          <span>Premium</span>
          <span>Prestige</span>
        </div>

        {/* Track with gradient segments */}
        <div className="relative h-3 rounded-full overflow-hidden bg-gray-200">
          <div className="absolute inset-0 flex">
            <div className="w-[30%] bg-gradient-to-r from-green-400 to-green-500" />
            <div className="w-[30%] bg-gradient-to-r from-blue-400 to-blue-500" />
            <div className="w-[20%] bg-gradient-to-r from-purple-400 to-purple-500" />
            <div className="w-[20%] bg-gradient-to-r from-amber-400 to-amber-500" />
          </div>
          {/* Progress overlay */}
          <div
            className="absolute inset-y-0 left-0 bg-transparent"
            style={{ width: `${(value - 1) * 11.11}%` }}
          />
        </div>

        {/* Range input */}
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ marginTop: "24px" }}
        />

        {/* Thumb indicator */}
        <div
          className={cn(
            "absolute top-[24px] w-6 h-6 rounded-full border-4 bg-white shadow-lg transform -translate-x-1/2 -translate-y-[6px] pointer-events-none",
            level.tier === "economy" && "border-green-500",
            level.tier === "mid" && "border-blue-500",
            level.tier === "premium" && "border-purple-500",
            level.tier === "luxury" && "border-amber-500"
          )}
          style={{ left: `${(value - 1) * 11.11}%` }}
        />
      </div>

      {/* Specs Info */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="p-3 rounded-xl bg-gray-50 text-center">
          <div className="text-lg font-bold text-gray-900">
            {level.ingredientCount.min}-{level.ingredientCount.max}
          </div>
          <div className="text-xs text-gray-500">Hammadde</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 text-center">
          <div className="text-lg font-bold text-gray-900">
            {level.activeCount.min}-{level.activeCount.max}
          </div>
          <div className="text-xs text-gray-500">Aktif Madde</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 text-center">
          <div className="text-lg font-bold text-gray-900">
            x{level.priceMultiplier.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Fiyat Çarpanı</div>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-2">
        {level.features.map((feature, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {feature}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ADVANCED OPTIONS COMPONENT
// ============================================================================
function AdvancedOptions({ config, onChange }) {
  return (
    <div className="space-y-6">
      {/* Ingredient Count Override */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Min. Hammadde Sayısı
          </Label>
          <Input
            type="number"
            min="5"
            max="50"
            value={config.minIngredients || ""}
            onChange={(e) =>
              onChange({ ...config, minIngredients: e.target.value })
            }
            placeholder="Otomatik"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Max. Hammadde Sayısı
          </Label>
          <Input
            type="number"
            min="5"
            max="50"
            value={config.maxIngredients || ""}
            onChange={(e) =>
              onChange({ ...config, maxIngredients: e.target.value })
            }
            placeholder="Otomatik"
            className="mt-1"
          />
        </div>
      </div>

      {/* Active Ingredient Count */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Min. Aktif Madde Sayısı
          </Label>
          <Input
            type="number"
            min="0"
            max="15"
            value={config.minActives || ""}
            onChange={(e) =>
              onChange({ ...config, minActives: e.target.value })
            }
            placeholder="Otomatik"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Max. Aktif Madde Sayısı
          </Label>
          <Input
            type="number"
            min="0"
            max="15"
            value={config.maxActives || ""}
            onChange={(e) =>
              onChange({ ...config, maxActives: e.target.value })
            }
            placeholder="Otomatik"
            className="mt-1"
          />
        </div>
      </div>

      {/* Ingredient Quality */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Hammadde Kalitesi
        </Label>
        <Select
          value={config.ingredientQuality || "standard"}
          onValueChange={(value) =>
            onChange({ ...config, ingredientQuality: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(INGREDIENT_QUALITY_LEVELS).map(([key, quality]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{quality.name}</span>
                  <span className="text-xs text-gray-400">
                    (x{quality.priceMultiplier})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Certifications */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Sertifikasyon Gereksinimleri
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(CERTIFICATIONS).map(([key, cert]) => (
            <label
              key={key}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                config.certifications?.includes(key)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Checkbox
                checked={config.certifications?.includes(key)}
                onCheckedChange={(checked) => {
                  const certs = config.certifications || [];
                  if (checked) {
                    onChange({ ...config, certifications: [...certs, key] });
                  } else {
                    onChange({
                      ...config,
                      certifications: certs.filter((c) => c !== key),
                    });
                  }
                }}
              />
              <span className="text-lg">{cert.icon}</span>
              <span className="text-sm">{cert.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Hedef Kitle
        </Label>
        <Select
          value={config.targetAudience || "all_skin"}
          onValueChange={(value) =>
            onChange({ ...config, targetAudience: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TARGET_AUDIENCES).map(([key, audience]) => (
              <SelectItem key={key} value={key}>
                {audience.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exclude Ingredients */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Hariç Tutulacak Hammaddeler
        </Label>
        <Textarea
          value={config.excludeIngredients || ""}
          onChange={(e) =>
            onChange({ ...config, excludeIngredients: e.target.value })
          }
          placeholder="Virgülle ayırarak yazın: Paraben, SLS, Silikon..."
          className="h-20"
        />
      </div>

      {/* Must Include Ingredients */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          Mutlaka İçermesi Gerekenler
        </Label>
        <Textarea
          value={config.mustInclude || ""}
          onChange={(e) => onChange({ ...config, mustInclude: e.target.value })}
          placeholder="Virgülle ayırarak yazın: Hyaluronik Asit, Niasinamid..."
          className="h-20"
        />
      </div>
    </div>
  );
}

// ============================================================================
// PRESET SELECTOR COMPONENT
// ============================================================================
function PresetSelector({ onSelect }) {
  const presets = Object.entries(FORMULA_PRESETS);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {presets.map(([key, preset]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(preset)}
          className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="font-semibold text-gray-900 group-hover:text-blue-700">
                {preset.name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Seviye {preset.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {preset.volume} {preset.volume > 100 ? "ml" : "ml/g"}
                </Badge>
              </div>
            </div>
            <Wand2 className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {preset.description}
          </p>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
function ProfessionalFormulaPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // Steps
  const STEPS = [
    { id: 1, label: "Kategori & Ürün" },
    { id: 2, label: "Formül Ayarları" },
    { id: 3, label: "AI Üretimi" },
    { id: 4, label: "İnceleme" },
  ];

  const [currentStep, setCurrentStep] = useState(1);

  // AI Hook - Profesyonel formül üretimi için SADECE formula_generation_pro context'i
  // Fallback YOK - bu sayfa sadece profesyonel konfigürasyon ile çalışır
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
    prompt: firestorePrompt,
    // Kategori bazlı prompt desteği (v4)
    hasCategoryPrompts,
    loadPromptForCategory,
    categoryPromptsInfo,
  } = useUnifiedAI(AI_CONTEXTS.FORMULA_GENERATION_PRO);

  // Kategori bazlı yüklenen prompt
  const [categoryPrompt, setCategoryPrompt] = useState(null);
  const [categoryPromptLoading, setCategoryPromptLoading] = useState(false);

  // Form State
  const [formConfig, setFormConfig] = useState({
    // Step 1: Category & Product
    mainCategory: null,
    subcategory: null,
    productType: null,
    customProductName: "",

    // Step 2: Formula Settings
    formulaLevel: 5,
    productVolume: "",
    productionQuantity: 1000,

    // Advanced Options
    advancedOptions: {
      minIngredients: "",
      maxIngredients: "",
      minActives: "",
      maxActives: "",
      ingredientQuality: "standard",
      certifications: [],
      targetAudience: "all_skin",
      excludeIngredients: "",
      mustInclude: "",
    },

    // Additional
    description: "",
    selectedModel: null,
  });

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFormula, setGeneratedFormula] = useState(null);
  const [aiResponseMetadata, setAiResponseMetadata] = useState(null); // AI finishReason, isTruncated, usage bilgisi
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Model Settings
  const [modelSettings, setModelSettings] = useState({
    maxTokens: 8000,
    autoMaxTokens: true,
    temperature: 0.7,
  });

  // Set default model when loaded
  useEffect(() => {
    if (currentModel && !formConfig.selectedModel) {
      setFormConfig((prev) => ({
        ...prev,
        selectedModel: currentModel.modelId || currentModel.id,
      }));
    }
  }, [currentModel, formConfig.selectedModel]);

  // Get current subcategories
  const currentSubcategories = useMemo(() => {
    if (!formConfig.mainCategory) return {};
    return getSubcategoriesByCategory(formConfig.mainCategory);
  }, [formConfig.mainCategory]);

  // Computed product name
  const productName = useMemo(() => {
    if (formConfig.customProductName) return formConfig.customProductName;
    if (formConfig.productType) return formConfig.productType.name;
    return "";
  }, [formConfig.customProductName, formConfig.productType]);

  // Processed User Prompt - replace template variables with actual form values
  // Öncelik: kategori bazlı prompt > genel prompt
  const processedUserPrompt = useMemo(() => {
    const activePrompt = categoryPrompt || firestorePrompt;
    if (!activePrompt?.userPromptTemplate) return null;

    const levelSpecs = getLevelSpecs(formConfig.formulaLevel || 5);
    const totalProductionKg = (
      ((Number(formConfig.productVolume) || 0) *
        (Number(formConfig.productionQuantity) || 0)) /
      1000
    ).toFixed(2);

    const variables = {
      productName: productName || "[Ürün Adı]",
      productCategory:
        MAIN_CATEGORIES[formConfig.mainCategory?.toUpperCase()]?.name ||
        formConfig.mainCategory ||
        "[Kategori]",
      subcategory: formConfig.subcategory?.name || "[Alt Kategori]",
      productType: formConfig.productType?.name || "[Ürün Tipi]",
      productVolumeGram: formConfig.productVolume || "[Hacim]",
      productVolume: formConfig.productVolume || "[Hacim]",
      productionQuantity: formConfig.productionQuantity || "[Adet]",
      totalProductionKg: totalProductionKg || "[Toplam]",
      level: formConfig.formulaLevel || 5,
      levelName: levelSpecs?.name || "[Seviye]",
      levelDescription: levelSpecs?.description || "",
      minIngredients:
        formConfig.advancedOptions?.minIngredients ||
        levelSpecs?.ingredientCount?.min ||
        "[Min]",
      maxIngredients:
        formConfig.advancedOptions?.maxIngredients ||
        levelSpecs?.ingredientCount?.max ||
        "[Max]",
      minActives:
        formConfig.advancedOptions?.minActives ||
        levelSpecs?.activeCount?.min ||
        "[Min]",
      maxActives:
        formConfig.advancedOptions?.maxActives ||
        levelSpecs?.activeCount?.max ||
        "[Max]",
      quality: levelSpecs?.quality || "[Kalite]",
      ingredientQuality:
        formConfig.advancedOptions?.ingredientQuality || "standard",
      targetAudience: formConfig.advancedOptions?.targetAudience || "all_skin",
      certifications:
        formConfig.advancedOptions?.certifications?.length > 0
          ? formConfig.advancedOptions.certifications.join(", ")
          : "Belirtilmedi",
      excludeIngredients:
        formConfig.advancedOptions?.excludeIngredients || "Yok",
      mustInclude: formConfig.advancedOptions?.mustInclude || "Yok",
      description: formConfig.description || "Belirtilmedi",
    };

    let processed = activePrompt.userPromptTemplate;

    // Replace all {{variable}} patterns
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      processed = processed.replace(regex, String(value));
    });

    return processed;
  }, [
    categoryPrompt,
    firestorePrompt?.userPromptTemplate,
    productName,
    formConfig.mainCategory,
    formConfig.subcategory,
    formConfig.productType,
    formConfig.productVolume,
    formConfig.productionQuantity,
    formConfig.formulaLevel,
    formConfig.advancedOptions,
    formConfig.description,
  ]);

  // Handle category selection - kategori değiştiğinde ilgili prompt'u yükle
  const handleCategorySelect = async (categoryId) => {
    setFormConfig((prev) => ({
      ...prev,
      mainCategory: categoryId,
      subcategory: null,
      productType: null,
    }));

    // Kategori bazlı prompt varsa yükle (v4 sistemi)
    if (hasCategoryPrompts && loadPromptForCategory) {
      setCategoryPromptLoading(true);
      try {
        const promptData = await loadPromptForCategory(categoryId);
        if (promptData) {
          setCategoryPrompt(promptData);
          console.log(
            `[Formula Pro] Loaded prompt for category: ${categoryId}`,
            promptData.name
          );
        }
      } catch (err) {
        console.error(`[Formula Pro] Failed to load category prompt:`, err);
      } finally {
        setCategoryPromptLoading(false);
      }
    }
  };

  // Handle subcategory/product selection
  const handleSubcategorySelect = (subcategory, product) => {
    setFormConfig((prev) => ({
      ...prev,
      subcategory: { ...subcategory, productId: product.id },
      productType: product,
      productVolume: product.defaultVolume?.toString() || "",
    }));
  };

  // Handle preset selection
  const handlePresetSelect = (preset) => {
    const subcats = getSubcategoriesByCategory(preset.category);
    const subcat =
      subcats[preset.subcategory.toUpperCase()] || Object.values(subcats)[0];
    const product =
      subcat?.products?.find((p) => p.id === preset.productType) ||
      subcat?.products?.[0];

    setFormConfig((prev) => ({
      ...prev,
      mainCategory: preset.category,
      subcategory: { ...subcat, productId: product?.id },
      productType: product,
      formulaLevel: preset.level,
      productVolume: preset.volume?.toString() || "",
      description: preset.description,
      advancedOptions: {
        ...prev.advancedOptions,
        mustInclude: preset.suggestedActives?.join(", ") || "",
      },
    }));
    setShowPresets(false);
  };

  // Validate step before proceeding
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formConfig.mainCategory && formConfig.productType;
      case 2:
        return (
          formConfig.formulaLevel &&
          formConfig.productVolume &&
          formConfig.productionQuantity
        );
      case 3:
        return aiIsReady;
      default:
        return true;
    }
  };

  // Navigate steps
  const nextStep = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Generate formula
  const handleGenerate = async () => {
    // Aktif prompt: kategori bazlı varsa onu kullan, yoksa genel prompt
    const activePrompt = categoryPrompt || firestorePrompt;

    // Prompt kontrolü - systemPrompt veya content alanından biri olmalı
    const hasValidPrompt = activePrompt?.systemPrompt || activePrompt?.content;
    
    if (!aiIsReady || !hasValidPrompt) {
      toast({
        title: "Hata",
        description:
          "AI sistemi hazır değil veya prompt yüklenmedi. Lütfen bekleyin.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("[Formula Pro] Using prompt:", activePrompt?.name || "Unknown", {
      hasSystemPrompt: !!activePrompt?.systemPrompt,
      hasUserTemplate: !!activePrompt?.userPromptTemplate,
      hasContent: !!activePrompt?.content,
    });

    setIsGenerating(true);

    try {
      const levelSpecs = getLevelSpecs(formConfig.formulaLevel);

      // Build product info for AI
      const productInfo = {
        productName: productName,
        productType: formConfig.mainCategory,
        productCategory:
          MAIN_CATEGORIES[formConfig.mainCategory?.toUpperCase()]?.name ||
          formConfig.mainCategory ||
          "Kategori",
        subcategory: formConfig.subcategory?.name || "",
        productVolumeGram: formConfig.productVolume,
        productVolume: formConfig.productVolume,
        productionQuantity: formConfig.productionQuantity,
        description: formConfig.description,
        formulaLevel: formConfig.formulaLevel,
        selectedModel: formConfig.selectedModel,

        // Advanced options
        minIngredients:
          formConfig.advancedOptions.minIngredients ||
          levelSpecs.ingredientCount.min,
        maxIngredients:
          formConfig.advancedOptions.maxIngredients ||
          levelSpecs.ingredientCount.max,
        minActives:
          formConfig.advancedOptions.minActives || levelSpecs.activeCount.min,
        maxActives:
          formConfig.advancedOptions.maxActives || levelSpecs.activeCount.max,
        ingredientQuality: formConfig.advancedOptions.ingredientQuality,
        certifications: formConfig.advancedOptions.certifications,
        targetAudience: formConfig.advancedOptions.targetAudience,
        excludeIngredients: formConfig.advancedOptions.excludeIngredients,
        mustInclude: formConfig.advancedOptions.mustInclude,
      };

      // AI Metadata'yı tutacak değişken
      let capturedAiMetadata = null;
      
      const result = await FormulaService.generateAIFormula(
        productInfo,
        async (prompt, options = {}) => {
          const maxTokens = modelSettings.autoMaxTokens
            ? Math.min(
                16000,
                Math.max(6000, 3000 + formConfig.formulaLevel * 300)
              )
            : modelSettings.maxTokens;

          const response = await generateContent(prompt, {
            maxTokens,
            temperature: modelSettings.temperature,
            modelId: options.model || formConfig.selectedModel,
            systemPrompt: options.systemPrompt,
          });

          if (!response?.success) {
            throw new Error(response?.error || "AI generation failed");
          }

          // AI Metadata'yı yakala (finishReason, isTruncated vb.)
          if (response.aiMetadata) {
            capturedAiMetadata = response.aiMetadata;
          }

          return response.content;
        },
        activePrompt // Prompt objesi (systemPrompt, userPromptTemplate alanları ile)
      );

      // AI metadata'yı state'e kaydet
      setAiResponseMetadata(capturedAiMetadata);
      setGeneratedFormula(result);
      setCurrentStep(4);

      toast({
        title: "Başarılı!",
        description: `${
          result.formula?.length || 0
        } hammadde ile formül oluşturuldu.${
          categoryPrompt ? ` (${categoryPrompt.name} prompt kullanıldı)` : ""
        }`,
      });
    } catch (error) {
      console.error("Formula generation error:", error);
      toast({
        title: "Hata",
        description: error.message || "Formül oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save formula
  const handleSave = async () => {
    if (!generatedFormula) return;

    // Permission kontrolü
    if (!hasPermission("formula.create")) {
      toast({
        title: "Yetki Hatası",
        description: "Formül kaydetme yetkiniz bulunmamaktadır.",
        variant: "destructive",
      });
      return;
    }

    try {
      await FormulaService.saveFormula({
        name: productName,
        productType: formConfig.mainCategory,
        productVolume: formConfig.productVolume,
        productionQuantity: formConfig.productionQuantity,
        notes: formConfig.description,
        ingredients:
          generatedFormula.formula?.map((item) => ({
            name: item.name,
            displayName: item.displayName || item.name,
            amount: parseFloat(item.amount) || 0,
            unit: item.unit || "gram",
            // v3.1 uyumu: yeni field adları + eski field uyumluluğu
            price:
              parseFloat(item.estimatedPriceTLperKg || item.estimatedPrice) ||
              0,
            estimatedCostTL: parseFloat(item.estimatedCostTL) || 0,
            supplier: item.supplier || "",
            function: item.function || "Other",
            functionTr: item.functionTr || "",
            specNotes: item.specNotes || "",
          })) || [],
        aiConfig: {
          ...formConfig,
          generatedAt: new Date().toISOString(),
        },
      });

      toast({
        title: "Kaydedildi!",
        description: "Formül başarıyla kaydedildi.",
      });

      router.push("/admin/formulas");
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Hata",
        description: "Formül kaydedilirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Config yükleme hatası kontrolü
  const configMissing = !configLoading && !unifiedConfig;

  // Config yoksa uyarı göster
  if (configMissing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Konfigürasyon Bulunamadı
            </CardTitle>
            <CardDescription className="text-gray-600">
              Profesyonel formül üretimi için gerekli AI konfigürasyonu
              Firestore'da bulunamadı.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-medium mb-2">Çözüm:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Admin panelinde <strong>AI Ayarları</strong> sayfasına gidin
                </li>
                <li>
                  <strong>"Konfigürasyonları Sıfırla"</strong> butonuna tıklayın
                </li>
                <li>Bu sayfayı yenileyin</li>
              </ol>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/admin/formulas")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push("/admin/settings/ai")}
              >
                <Settings className="w-4 h-4 mr-2" />
                AI Ayarları
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/formulas")}
                className="text-gray-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Profesyonel Formül Oluşturucu
                </h1>
                <p className="text-sm text-gray-500">
                  AI destekli formülasyon sistemi
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="mt-6">
            <StepIndicator currentStep={currentStep} steps={STEPS} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Step 1: Category & Product Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Quick Presets */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-500" />
                    <CardTitle className="text-lg">Hızlı Başlangıç</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPresets(!showPresets)}
                  >
                    {showPresets ? "Gizle" : "Şablonları Göster"}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 ml-1 transition-transform",
                        showPresets && "rotate-180"
                      )}
                    />
                  </Button>
                </div>
              </CardHeader>
              {showPresets && (
                <CardContent>
                  <PresetSelector onSelect={handlePresetSelect} />
                </CardContent>
              )}
            </Card>

            {/* Main Category Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ana Kategori Seçin
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(MAIN_CATEGORIES).map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    selected={formConfig.mainCategory === cat.id}
                    onSelect={handleCategorySelect}
                  />
                ))}
              </div>

              {/* Kategori bazlı prompt bilgisi */}
              {formConfig.mainCategory && hasCategoryPrompts && (
                <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    {categoryPromptLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        <span className="text-sm text-emerald-700 dark:text-emerald-300">
                          Kategori prompt'u yükleniyor...
                        </span>
                      </>
                    ) : categoryPrompt ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700 dark:text-emerald-300">
                          <strong>{categoryPrompt.name}</strong> prompt'u aktif
                          {categoryPrompt.version && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              v{categoryPrompt.version}
                            </Badge>
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <Info className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-700 dark:text-amber-300">
                          Genel prompt kullanılıyor
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Subcategory & Product Selection */}
            {formConfig.mainCategory && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {MAIN_CATEGORIES[formConfig.mainCategory?.toUpperCase()]
                    ?.name || "Kategori"}{" "}
                  - Alt Kategori & Ürün
                </h2>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <SubcategorySelector
                      category={formConfig.mainCategory}
                      subcategories={currentSubcategories}
                      selectedSubcategory={formConfig.subcategory}
                      onSelect={handleSubcategorySelect}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Custom Product Name */}
            {formConfig.productType && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Özel Ürün Adı (Opsiyonel)
                    </Label>
                    <Input
                      value={formConfig.customProductName}
                      onChange={(e) =>
                        setFormConfig((prev) => ({
                          ...prev,
                          customProductName: e.target.value,
                        }))
                      }
                      placeholder={
                        formConfig.productType?.name || "Ürün adı girin..."
                      }
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Boş bırakırsanız seçilen ürün tipi adı kullanılır:{" "}
                      <strong>{formConfig.productType?.name}</strong>
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Formula Settings */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Selected Product Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <span className="text-3xl">
                      {
                        MAIN_CATEGORIES[formConfig.mainCategory?.toUpperCase()]
                          ?.icon
                      }
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{productName}</h3>
                    <p className="text-blue-100">
                      {MAIN_CATEGORIES[formConfig.mainCategory?.toUpperCase()]
                        ?.name || "Kategori"}{" "}
                      / {formConfig.subcategory?.name || "Alt Kategori"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume & Quantity */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Üretim Detayları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Ürün Hacmi ({formConfig.productType?.unit || "ml/g"})
                    </Label>
                    <Input
                      type="number"
                      value={formConfig.productVolume}
                      onChange={(e) =>
                        setFormConfig((prev) => ({
                          ...prev,
                          productVolume: e.target.value,
                        }))
                      }
                      placeholder={formConfig.productType?.defaultVolume?.toString()}
                      className="mt-1 h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Üretim Adedi
                    </Label>
                    <Input
                      type="number"
                      value={formConfig.productionQuantity}
                      onChange={(e) =>
                        setFormConfig((prev) => ({
                          ...prev,
                          productionQuantity: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="1000"
                      className="mt-1 h-12"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Toplam Üretim:</span>
                      <span className="font-bold text-gray-900">
                        {(
                          ((parseFloat(formConfig.productVolume) || 0) *
                            (formConfig.productionQuantity || 0)) /
                          1000
                        ).toFixed(2)}{" "}
                        kg
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formula Level */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Formül Seviyesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormulaLevelSlider
                    value={formConfig.formulaLevel}
                    onChange={(level) =>
                      setFormConfig((prev) => ({
                        ...prev,
                        formulaLevel: level,
                      }))
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  Ek Açıklamalar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formConfig.description}
                  onChange={(e) =>
                    setFormConfig((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Formül hakkında özel isteklerinizi, hedef kitlenizi, beklentilerinizi yazın..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            {/* Advanced Options Toggle */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-0">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-orange-500" />
                    Gelişmiş Seçenekler
                  </CardTitle>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform",
                      showAdvanced && "rotate-180"
                    )}
                  />
                </button>
              </CardHeader>
              {showAdvanced && (
                <CardContent className="pt-6">
                  <AdvancedOptions
                    config={formConfig.advancedOptions}
                    onChange={(opts) =>
                      setFormConfig((prev) => ({
                        ...prev,
                        advancedOptions: opts,
                      }))
                    }
                  />
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Step 3: AI Generation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Formül Özeti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 text-center">
                    <span className="text-2xl block mb-1">
                      {MAIN_CATEGORIES[formConfig.mainCategory?.toUpperCase()]
                        ?.icon || "📦"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {MAIN_CATEGORIES[formConfig.mainCategory?.toUpperCase()]
                        ?.name || "Kategori"}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">
                      {formConfig.formulaLevel}
                    </span>
                    <span className="text-sm text-gray-600">Seviye</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">
                      {formConfig.productVolume}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formConfig.productType?.unit || "ml"}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">
                      {formConfig.productionQuantity?.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">Adet</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Model Selection */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Model Seçimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(modelsByProvider || {}).flatMap(
                    ([provider, models]) =>
                      models.map((model) => {
                        const modelId = model.modelId || model.id;
                        const providerIcon = PROVIDER_INFO[provider]?.icon;
                        const providerName = PROVIDER_INFO[provider]?.name;

                        return (
                          <button
                            key={`${provider}-${modelId}`}
                            type="button"
                            onClick={() =>
                              setFormConfig((prev) => ({
                                ...prev,
                                selectedModel: modelId,
                              }))
                            }
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all text-left",
                              formConfig.selectedModel === modelId
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {providerIcon || "🤖"}
                              </span>
                              <div>
                                <span className="font-medium block">
                                  {model.displayName || model.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {providerName || provider}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating || !aiIsReady}
                className="h-14 px-12 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Formül Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI ile Formül Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && generatedFormula && (
          <div className="space-y-6">
            {/* Formula Summary Stats */}
            {(() => {
              // Hesaplamalar
              const targetVolume = parseFloat(formConfig.productVolume) || 0;
              const formulaItems = generatedFormula.formula || [];
              const actualTotalVolume = Number(
                formulaItems
                  .reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0
                  )
                  .toFixed(2)
              );
              const volumeDifference = Number(
                (actualTotalVolume - targetVolume).toFixed(2)
              );
              const volumeMatch = Math.abs(volumeDifference) < 0.1;

              // v3.0 Maliyet hesaplaması - yeni ve eski şema uyumlu
              // Yeni şema: estimatedPriceTLperKg (kg fiyatı) ve estimatedCostTL (birim maliyet)
              // Eski şema: estimatedPrice (belirsiz - bazen kg fiyatı, bazen birim maliyet)
              const totalCostPerUnit = Number(
                formulaItems
                  .reduce((sum, item) => {
                    const amount = parseFloat(item.amount) || 0;

                    // Önce yeni şemayı kontrol et (estimatedCostTL direkt maliyet)
                    if (
                      item.estimatedCostTL !== undefined &&
                      item.estimatedCostTL !== null
                    ) {
                      return sum + parseFloat(item.estimatedCostTL);
                    }

                    // estimatedPriceTLperKg varsa bu kg fiyatıdır, hesapla
                    if (
                      item.estimatedPriceTLperKg !== undefined &&
                      item.estimatedPriceTLperKg !== null
                    ) {
                      const pricePerKg =
                        parseFloat(item.estimatedPriceTLperKg) || 0;
                      return sum + (amount / 1000) * pricePerKg;
                    }

                    // Eski şema fallback - estimatedPrice kg fiyatı olarak kabul et
                    const pricePerKg = parseFloat(item.estimatedPrice) || 0;
                    return sum + (amount / 1000) * pricePerKg;
                  }, 0)
                  .toFixed(4)
              );

              const totalProductionCost = Number(
                (
                  totalCostPerUnit * (formConfig.productionQuantity || 1)
                ).toFixed(2)
              );

              return (
                <>
                  {/* Success Banner with Stats */}
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              Formül Başarıyla Oluşturuldu!
                            </h3>
                            <p className="text-green-100">
                              {formulaItems.length} hammadde ile profesyonel
                              formülasyon hazır.
                            </p>
                          </div>
                        </div>
                        {/* Quick Stats */}
                        <div className="hidden md:flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-3xl font-bold">{targetVolume}</p>
                            <p className="text-xs text-green-200">Hedef (g)</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold">
                              {actualTotalVolume}
                            </p>
                            <p className="text-xs text-green-200">Toplam (g)</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold">
                              ₺{totalCostPerUnit}
                            </p>
                            <p className="text-xs text-green-200">
                              Birim Maliyet
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Response Status - finishReason bilgisi */}
                  {aiResponseMetadata && (
                    <Card className={cn(
                      "border-0 shadow-md",
                      aiResponseMetadata.isTruncated 
                        ? "bg-amber-50 border-2 border-amber-300" 
                        : isResponseFiltered(aiResponseMetadata.finishReason)
                        ? "bg-red-50 border-2 border-red-300"
                        : "bg-blue-50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            aiResponseMetadata.isTruncated 
                              ? "bg-amber-100" 
                              : isResponseFiltered(aiResponseMetadata.finishReason)
                              ? "bg-red-100"
                              : "bg-blue-100"
                          )}>
                            {aiResponseMetadata.isTruncated ? (
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                            ) : isResponseFiltered(aiResponseMetadata.finishReason) ? (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <Info className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                AI Yanıt Durumu
                              </span>
                              <Badge 
                                variant={
                                  aiResponseMetadata.isTruncated 
                                    ? "warning" 
                                    : isResponseFiltered(aiResponseMetadata.finishReason)
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {aiResponseMetadata.finishReason || "unknown"}
                              </Badge>
                            </div>
                            <p className={cn(
                              "text-sm",
                              aiResponseMetadata.isTruncated 
                                ? "text-amber-700" 
                                : isResponseFiltered(aiResponseMetadata.finishReason)
                                ? "text-red-700"
                                : "text-gray-600"
                            )}>
                              {getFinishReasonMessage(aiResponseMetadata.finishReason)}
                            </p>
                            
                            {/* Truncation Warning */}
                            {aiResponseMetadata.isTruncated && (
                              <div className="mt-2 p-2 bg-amber-100 rounded-md">
                                <p className="text-xs text-amber-800">
                                  <strong>Dikkat:</strong> AI yanıtı token limiti nedeniyle yarıda kesilmiş olabilir. 
                                  Formül eksik olabilir. Daha yüksek max token değeri ile tekrar deneyin veya 
                                  daha az hammadde içeren bir formül talep edin.
                                </p>
                              </div>
                            )}
                            
                            {/* Content Filter Warning */}
                            {isResponseFiltered(aiResponseMetadata.finishReason) && (
                              <div className="mt-2 p-2 bg-red-100 rounded-md">
                                <p className="text-xs text-red-800">
                                  <strong>Uyarı:</strong> AI güvenlik filtresi nedeniyle içerik üretilemedi. 
                                  Lütfen ürün açıklamanızı veya parametrelerinizi değiştirip tekrar deneyin.
                                </p>
                              </div>
                            )}
                            
                            {/* Model & Usage Info */}
                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                              {aiResponseMetadata.model && (
                                <span className="flex items-center gap-1">
                                  <Cpu className="w-3 h-3" />
                                  {aiResponseMetadata.model.name || aiResponseMetadata.model.apiId}
                                </span>
                              )}
                              {aiResponseMetadata.usage && (
                                <>
                                  <span>
                                    Giriş: {aiResponseMetadata.usage.inputTokens || aiResponseMetadata.usage.promptTokens || "?"} token
                                  </span>
                                  <span>
                                    Çıkış: {aiResponseMetadata.usage.outputTokens || aiResponseMetadata.usage.completionTokens || "?"} token
                                  </span>
                                </>
                              )}
                              {aiResponseMetadata.performance?.duration && (
                                <span>
                                  Süre: {aiResponseMetadata.performance.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {targetVolume} g
                            </p>
                            <p className="text-xs text-gray-500">Hedef Hacim</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`border-0 shadow-md ${
                        !volumeMatch ? "ring-2 ring-amber-400" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              volumeMatch ? "bg-green-100" : "bg-amber-100"
                            }`}
                          >
                            <FlaskConical
                              className={`w-5 h-5 ${
                                volumeMatch
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {actualTotalVolume} g
                            </p>
                            <p className="text-xs text-gray-500">
                              Formül Toplamı
                              {!volumeMatch && (
                                <span
                                  className={`ml-1 ${
                                    volumeDifference > 0
                                      ? "text-amber-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  ({volumeDifference > 0 ? "+" : ""}
                                  {volumeDifference}g)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              ₺{totalCostPerUnit}
                            </p>
                            <p className="text-xs text-gray-500">
                              Birim Maliyet
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              ₺{totalProductionCost}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formConfig.productionQuantity} Adet Toplam
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Volume Warning */}
                  {!volumeMatch && (
                    <Card className="border-0 shadow-md border-l-4 border-l-amber-500 bg-amber-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800">
                              Hacim Uyuşmazlığı
                            </p>
                            <p className="text-sm text-amber-700">
                              Hedef hacim {targetVolume}g, formül toplamı{" "}
                              {actualTotalVolume}g. Fark:{" "}
                              {volumeDifference > 0 ? "+" : ""}
                              {volumeDifference}g
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Formula Details Table */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Formül Detayları: {productName}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Badge variant="outline">
                            {formulaItems.length} Hammadde
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Seviye {formConfig.formulaLevel}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50/50">
                              <th className="text-center py-3 px-3 text-sm font-semibold text-gray-700 w-12">
                                #
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                Hammadde
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                Miktar
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                %
                              </th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                                Fonksiyon
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                Fiyat (TL/kg)
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                Birim Maliyet
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {formulaItems.map((item, idx) => {
                              const amount = parseFloat(item.amount) || 0;

                              // v3.0 uyumlu fiyat hesaplaması
                              // Yeni şema: estimatedPriceTLperKg (kg fiyatı), estimatedCostTL (birim maliyet)
                              // Eski şema: estimatedPrice (kg fiyatı olarak kabul et)
                              let pricePerKg = 0;
                              let unitCost = 0;

                              if (
                                item.estimatedPriceTLperKg !== undefined &&
                                item.estimatedPriceTLperKg !== null
                              ) {
                                // Yeni şema - kg fiyatı direkt var
                                pricePerKg =
                                  parseFloat(item.estimatedPriceTLperKg) || 0;
                                // estimatedCostTL varsa kullan, yoksa hesapla
                                unitCost =
                                  item.estimatedCostTL !== undefined
                                    ? parseFloat(item.estimatedCostTL) || 0
                                    : (amount / 1000) * pricePerKg;
                              } else {
                                // Eski şema - estimatedPrice kg fiyatı olarak kabul et
                                pricePerKg =
                                  parseFloat(item.estimatedPrice) || 0;
                                unitCost = (amount / 1000) * pricePerKg;
                              }

                              const percentage =
                                actualTotalVolume > 0
                                  ? (amount / actualTotalVolume) * 100
                                  : 0;

                              return (
                                <tr
                                  key={idx}
                                  className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                                >
                                  <td className="py-3 px-3 text-center">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                                      {idx + 1}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div>
                                      <span className="font-medium text-gray-900">
                                        {item.displayName || item.name}
                                      </span>
                                      {item.displayName &&
                                        item.displayName !== item.name && (
                                          <span className="text-xs text-gray-500 block italic">
                                            {item.name}
                                          </span>
                                        )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span className="font-mono font-medium text-gray-900">
                                      {amount.toFixed(2)}
                                    </span>
                                    <span className="text-gray-500 text-sm ml-1">
                                      g
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span className="font-mono text-gray-700">
                                      {percentage.toFixed(2)}%
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${
                                        item.function === "Active Ingredient"
                                          ? "bg-purple-100 text-purple-700 border-purple-200"
                                          : item.function === "Carrier"
                                          ? "bg-blue-100 text-blue-700 border-blue-200"
                                          : item.function === "Emollient"
                                          ? "bg-cyan-100 text-cyan-700 border-cyan-200"
                                          : item.function === "Preservative"
                                          ? "bg-red-100 text-red-700 border-red-200"
                                          : item.function === "Fragrance"
                                          ? "bg-pink-100 text-pink-700 border-pink-200"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {item.functionTr || item.function}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span className="font-mono text-gray-600">
                                      ₺{pricePerKg.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span className="font-mono font-medium text-emerald-600">
                                      ₺{unitCost.toFixed(4)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 border-t-2 border-gray-200">
                              <td
                                colSpan={2}
                                className="py-3 px-4 font-semibold text-gray-700"
                              >
                                TOPLAM
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                                {actualTotalVolume} g
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                                100%
                              </td>
                              <td className="py-3 px-4"></td>
                              <td className="py-3 px-4"></td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                                ₺{totalCostPerUnit}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Table Footer Info */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-6 text-gray-600">
                          <span>
                            <strong>Hedef:</strong> {targetVolume}g
                          </span>
                          <span>
                            <strong>Formül:</strong> {actualTotalVolume}g
                          </span>
                          <span>
                            <strong>Üretim:</strong>{" "}
                            {formConfig.productionQuantity} adet
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            <strong>Birim Maliyet:</strong>{" "}
                            <span className="text-emerald-600 font-semibold">
                              ₺{totalCostPerUnit}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            <strong>Toplam:</strong>{" "}
                            <span className="text-emerald-600 font-semibold">
                              ₺{totalProductionCost}
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Notes */}
                  {(generatedFormula.productionNotes ||
                    generatedFormula.suggestions ||
                    generatedFormula.qualityChecks ||
                    generatedFormula.shelfLife) && (
                    <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Info className="w-5 h-5 text-amber-500" />
                          AI Önerileri & Bilgiler
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Quick Info */}
                        {(generatedFormula.shelfLife ||
                          generatedFormula.targetPH ||
                          generatedFormula.storageConditions) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            {generatedFormula.shelfLife && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Raf Ömrü
                                </p>
                                <p className="font-medium text-gray-900">
                                  {generatedFormula.shelfLife}
                                </p>
                              </div>
                            )}
                            {generatedFormula.targetPH && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Hedef pH
                                </p>
                                <p className="font-medium text-gray-900">
                                  {generatedFormula.targetPH}
                                </p>
                              </div>
                            )}
                            {generatedFormula.storageConditions && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Saklama Koşulları
                                </p>
                                <p className="font-medium text-gray-900">
                                  {generatedFormula.storageConditions}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {generatedFormula.productionNotes &&
                          generatedFormula.productionNotes.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Üretim Notları
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {generatedFormula.productionNotes.map(
                                  (note, idx) => (
                                    <li key={idx}>{note}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                        {generatedFormula.qualityChecks &&
                          generatedFormula.qualityChecks.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Kalite Kontrol Noktaları
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {generatedFormula.qualityChecks.map(
                                  (check, idx) => (
                                    <li key={idx}>{check}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                        {generatedFormula.suggestions && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Genel Öneriler
                            </h4>
                            <p className="text-gray-600">
                              {generatedFormula.suggestions}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentStep(3)}
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Yeniden Oluştur
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Formülü Kaydet
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(currentStep === 1 && "invisible")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>

          {currentStep < 3 && (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              İleri
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              AI Ayarları ve Prompt Görüntüleme
            </DialogTitle>
            <DialogDescription>
              Model parametrelerini ayarlayın ve aktif prompt'u görüntüleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* AI Model Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <Label className="text-base font-semibold">
                  AI Model Seçimi
                </Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(modelsByProvider || {}).flatMap(
                  ([provider, models]) =>
                    models.map((model) => {
                      const modelId = model.modelId || model.id;
                      const providerIcon = PROVIDER_INFO[provider]?.icon;
                      const providerName = PROVIDER_INFO[provider]?.name;

                      return (
                        <button
                          key={`${provider}-${modelId}`}
                          type="button"
                          onClick={() => {
                            setFormConfig((prev) => ({
                              ...prev,
                              selectedModel: modelId,
                            }));
                            selectModel(modelId);
                          }}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all text-left",
                            formConfig.selectedModel === modelId
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {providerIcon || "🤖"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm block truncate">
                                {model.displayName || model.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {providerName || provider}
                              </span>
                            </div>
                            {formConfig.selectedModel === modelId && (
                              <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Model Parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <Label className="text-base font-semibold">
                  Model Parametreleri
                </Label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <Label className="text-sm font-medium">
                    Otomatik Token Hesaplama
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Formül seviyesine göre otomatik token miktarı belirlenir
                  </p>
                </div>
                <Switch
                  checked={modelSettings.autoMaxTokens}
                  onCheckedChange={(checked) =>
                    setModelSettings((prev) => ({
                      ...prev,
                      autoMaxTokens: checked,
                    }))
                  }
                />
              </div>

              {!modelSettings.autoMaxTokens && (
                <div className="space-y-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div>
                    <Label className="text-sm font-medium">Max Tokens</Label>
                    <Input
                      type="number"
                      min="2000"
                      max="32000"
                      value={modelSettings.maxTokens}
                      onChange={(e) =>
                        setModelSettings((prev) => ({
                          ...prev,
                          maxTokens: parseInt(e.target.value),
                        }))
                      }
                      className="mt-2 bg-white"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Minimum: 2000, Maximum: 32000
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Temperature</Label>
                      <Badge variant="secondary">
                        {modelSettings.temperature}
                      </Badge>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={modelSettings.temperature}
                      onChange={(e) =>
                        setModelSettings((prev) => ({
                          ...prev,
                          temperature: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Tutarlı (0.0)</span>
                      <span>Dengeli (0.5)</span>
                      <span>Yaratıcı (1.0)</span>
                    </div>
                  </div>
                </div>
              )}

              {modelSettings.autoMaxTokens && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Otomatik Mod Aktif</p>
                      <p className="text-xs text-green-700 mt-1">
                        Tahmini token kullanımı:{" "}
                        {Math.min(
                          16000,
                          Math.max(6000, 3000 + formConfig.formulaLevel * 300)
                        )}
                        (Seviye {formConfig.formulaLevel} için optimize edildi)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Active Prompts Display - System & User */}
            {/* Kategori bazlı prompt varsa onu kullan, yoksa genel prompt */}
            {(() => {
              const activePrompt = categoryPrompt || firestorePrompt;
              const promptSource = categoryPrompt ? "Kategori" : "Genel";

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <Label className="text-base font-semibold">
                        Aktif Promptlar{" "}
                        {activePrompt?.name ? `(${activePrompt.name})` : ""}
                      </Label>
                    </div>
                    {categoryPrompt && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        <Target className="w-3 h-3 mr-1" />
                        Kategori:{" "}
                        {MAIN_CATEGORIES[formConfig.mainCategory?.toUpperCase()]
                          ?.name || formConfig.mainCategory}
                      </Badge>
                    )}
                  </div>

                  {/* System Prompt */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500 text-white text-xs">
                          System Prompt
                        </Badge>
                        <span className="text-xs text-gray-500">
                          AI'ın rolünü ve davranışını tanımlar
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activePrompt?.systemPrompt
                          ? `${activePrompt.systemPrompt.length} karakter`
                          : "—"}
                      </Badge>
                    </div>

                    {categoryPromptLoading ? (
                      <div className="p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                        <p className="text-sm text-gray-500">
                          Kategori promptu yükleniyor...
                        </p>
                      </div>
                    ) : activePrompt?.systemPrompt ? (
                      <div className="relative">
                        <Textarea
                          value={activePrompt.systemPrompt}
                          readOnly
                          className="font-mono text-xs h-48 resize-none bg-blue-950 text-blue-300 border-blue-800"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-blue-800 hover:bg-blue-700 text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              activePrompt.systemPrompt
                            );
                            toast({
                              title: "Kopyalandı!",
                              description: "System prompt panoya kopyalandı.",
                            });
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Kopyala
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <p className="text-sm text-gray-500">
                          System prompt bulunamadı
                        </p>
                      </div>
                    )}
                  </div>

                  {/* User Prompt Template - Processed with actual values */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500 text-white text-xs">
                          User Prompt
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Seçilen değerlerle güncellenmiş
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {processedUserPrompt
                          ? `${processedUserPrompt.length} karakter`
                          : "—"}
                      </Badge>
                    </div>

                    {processedUserPrompt ? (
                      <div className="relative">
                        <Textarea
                          value={processedUserPrompt}
                          readOnly
                          className="font-mono text-xs h-64 resize-none bg-gray-900 text-green-400 border-gray-700"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(processedUserPrompt);
                            toast({
                              title: "Kopyalandı!",
                              description:
                                "İşlenmiş user prompt panoya kopyalandı.",
                            });
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Kopyala
                        </Button>
                      </div>
                    ) : activePrompt?.userPromptTemplate ? (
                      <div className="relative">
                        <Textarea
                          value={activePrompt.userPromptTemplate}
                          readOnly
                          className="font-mono text-xs h-64 resize-none bg-gray-900 text-green-400 border-gray-700 opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                          <p className="text-xs text-gray-300 text-center px-4">
                            Ürün bilgilerini seçerek prompt'u güncelleyin
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <p className="text-sm text-gray-500">
                          User prompt template bulunamadı
                        </p>
                      </div>
                    )}

                    {/* Variable Status Indicators */}
                    {activePrompt?.userPromptTemplate && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge
                          variant={productName ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          Ürün: {productName || "—"}
                        </Badge>
                        <Badge
                          variant={
                            formConfig.mainCategory ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          Kategori:{" "}
                          {MAIN_CATEGORIES[
                            formConfig.mainCategory?.toUpperCase()
                          ]?.name || "—"}
                        </Badge>
                        <Badge
                          variant={
                            formConfig.productVolume ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          Hacim:{" "}
                          {formConfig.productVolume
                            ? `${formConfig.productVolume}g`
                            : "—"}
                        </Badge>
                        <Badge
                          variant={
                            formConfig.formulaLevel ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          Seviye: {formConfig.formulaLevel || "—"}/10
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Fallback: content field if system/user prompts not available */}
                  {!activePrompt?.systemPrompt &&
                    !activePrompt?.userPromptTemplate &&
                    activePrompt?.content && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-amber-500 text-white text-xs">
                            Combined Prompt
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {activePrompt.content.length} karakter
                          </Badge>
                        </div>
                        <div className="relative">
                          <Textarea
                            value={activePrompt.content}
                            readOnly
                            className="font-mono text-xs h-64 resize-none bg-gray-900 text-amber-400 border-gray-700"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                activePrompt.content
                              );
                              toast({
                                title: "Kopyalandı!",
                                description: "Prompt panoya kopyalandı.",
                              });
                            }}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Kopyala
                          </Button>
                        </div>
                      </div>
                    )}

                  {/* Loading State */}
                  {!activePrompt?.systemPrompt &&
                    !activePrompt?.userPromptTemplate &&
                    !activePrompt?.content &&
                    !categoryPromptLoading && (
                      <div className="p-8 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Promptlar yükleniyor...
                          </p>
                        </div>
                      </div>
                    )}

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Prompt Yapısı</p>
                      <p className="mt-1">
                        <strong>System Prompt:</strong> AI'ın uzmanlık alanını
                        ve yanıt formatını tanımlar.
                        <br />
                        <strong>User Prompt:</strong> Dinamik değişkenlerle (
                        {`{productType}, {category}`} vb.) kullanıcı talebini
                        formatlar.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Context Info */}
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-purple-900 mb-2">
                    AI Context Bilgisi
                  </p>
                  <div className="space-y-1 text-purple-800">
                    <p>
                      • <strong>Context:</strong> formula_generation_pro
                    </p>
                    <p>
                      • <strong>Aktif Model:</strong>{" "}
                      {currentModel?.displayName ||
                        currentModel?.name ||
                        "Seçilmedi"}
                    </p>
                    <p>
                      • <strong>Provider:</strong>{" "}
                      {currentProvider?.icon || "🤖"}{" "}
                      {currentProvider?.name || "Bilinmiyor"}
                    </p>
                    <p>
                      • <strong>Durum:</strong>{" "}
                      {aiIsReady ? "✅ Hazır" : "⏳ Hazırlanıyor..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Kapat
            </Button>
            <Button
              onClick={() => {
                setSettingsOpen(false);
                toast({
                  title: "Ayarlar Kaydedildi",
                  description: "AI model ve parametre ayarlarınız güncellendi.",
                });
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProfessionalFormulaPage() {
  return (
    <PermissionGuard requiredPermission="formula.view">
      <ProfessionalFormulaPageContent />
    </PermissionGuard>
  );
}
