"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Droplets, Sparkles, Zap } from "lucide-react";

// ============================================================================
// CLEANING FORM - Minimal & Modern
// ============================================================================

const PRODUCT_FORMS = [
  { id: "liquid", name: "Sıvı" },
  { id: "gel", name: "Jel" },
  { id: "spray", name: "Sprey" },
  { id: "powder", name: "Toz" },
  { id: "tablet", name: "Tablet" },
  { id: "concentrate", name: "Konsantre" },
];

const CONCENTRATIONS = [
  { id: "light", name: "Hafif", icon: Droplets, desc: "Günlük kullanım" },
  { id: "medium", name: "Orta", icon: Sparkles, desc: "Standart temizlik" },
  { id: "strong", name: "Güçlü", icon: Zap, desc: "Yoğun kirler" },
];

const PH_TYPES = [
  { id: "acidic", name: "Asidik", range: "1-6", desc: "Kireç, pas" },
  { id: "neutral", name: "Nötr", range: "6-8", desc: "Genel amaçlı" },
  { id: "alkaline", name: "Bazik", range: "8-14", desc: "Yağ, gres" },
];

export function CleaningForm({ config, onChange }) {
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
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-gray-500 hover:border-slate-300"
                )}
              >
                {form.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Concentration */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-3 block">
          Konsantrasyon
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {CONCENTRATIONS.map((level) => {
            const Icon = level.icon;
            const isSelected = config?.concentration === level.id;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => handleChange("concentration", level.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-gray-500 hover:border-slate-300"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{level.name}</span>
                <span className="text-[10px] text-gray-400">{level.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* pH Type */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-3 block">
          pH Tipi
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {PH_TYPES.map((ph) => {
            const isSelected = config?.phType === ph.id;
            return (
              <button
                key={ph.id}
                type="button"
                onClick={() => handleChange("phType", ph.id)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <span className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-blue-700" : "text-gray-700"
                )}>
                  {ph.name}
                </span>
                <span className="text-xs text-gray-400">{ph.range}</span>
                <span className="text-[10px] text-gray-400">{ph.desc}</span>
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
            placeholder="500"
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
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Toplam Üretim:</span>
            <span className="font-semibold text-blue-700">
              {((parseFloat(config.productVolume) * parseInt(config.productionQuantity)) / 1000).toFixed(2)} L
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CleaningForm;
