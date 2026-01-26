"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Droplets, Sun, Baby, User, Sparkles } from "lucide-react";

// ============================================================================
// COSMETIC FORM - Minimal & Modern
// ============================================================================

const PRODUCT_FORMS = [
  { id: "cream", name: "Krem" },
  { id: "lotion", name: "Losyon" },
  { id: "serum", name: "Serum" },
  { id: "gel", name: "Jel" },
  { id: "oil", name: "Yağ" },
  { id: "foam", name: "Köpük" },
];

const SKIN_TYPES = [
  { id: "all", name: "Tüm Ciltler", icon: User },
  { id: "dry", name: "Kuru", icon: Droplets },
  { id: "oily", name: "Yağlı", icon: Sparkles },
  { id: "combination", name: "Karma", icon: Sun },
  { id: "sensitive", name: "Hassas", icon: Baby },
];

const PH_RANGES = [
  { id: "acidic", name: "Asidik", range: "4.5-5.5", desc: "AHA/BHA ürünleri" },
  { id: "balanced", name: "Dengeli", range: "5.5-6.5", desc: "Günlük bakım" },
  { id: "neutral", name: "Nötr", range: "6.5-7.5", desc: "Hassas ciltler" },
];

export function CosmeticForm({ config, onChange, isDermocosmetic = false }) {
  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    onChange(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Product Form */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-3 block">
          Ürün Formu
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRODUCT_FORMS.map((form) => {
            const isSelected = config?.productForm === form.id;
            return (
              <button
                key={form.id}
                type="button"
                onClick={() => handleChange("productForm", form.id)}
                className={cn(
                  "py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all",
                  isSelected
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-gray-500 hover:border-slate-300"
                )}
              >
                {form.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skin Type */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-3 block">
          Hedef Cilt Tipi
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {SKIN_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = config?.skinType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleChange("skinType", type.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-gray-500 hover:border-slate-300"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{type.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* pH Selection */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-3 block">
          pH Aralığı
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {PH_RANGES.map((ph) => {
            const isSelected = config?.phRange === ph.id;
            return (
              <button
                key={ph.id}
                type="button"
                onClick={() => handleChange("phRange", ph.id)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <span className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-violet-700" : "text-gray-700"
                )}>
                  {ph.name}
                </span>
                <span className="text-xs text-gray-400">{ph.range}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Volume & Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-600 mb-2 block">
            Ürün Hacmi (ml)
          </Label>
          <Input
            type="number"
            value={config?.productVolume || ""}
            onChange={(e) => handleChange("productVolume", e.target.value)}
            placeholder="50"
            className="h-11 bg-white"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-600 mb-2 block">
            Üretim Adedi
          </Label>
          <Input
            type="number"
            value={config?.productionQuantity || ""}
            onChange={(e) => handleChange("productionQuantity", e.target.value)}
            placeholder="1000"
            className="h-11 bg-white"
          />
        </div>
      </div>

      {/* Summary */}
      {config?.productVolume && config?.productionQuantity && (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Toplam Üretim:</span>
            <span className="font-semibold text-violet-700">
              {((parseFloat(config.productVolume) * parseInt(config.productionQuantity)) / 1000).toFixed(2)} L
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CosmeticForm;
