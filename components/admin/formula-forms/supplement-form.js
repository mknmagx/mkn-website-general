"use client";

import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pill, Package, Droplets, FlaskConical, Cookie, Circle } from "lucide-react";

// ============================================================================
// SUPPLEMENT FORM - Minimal & Modern
// ============================================================================

const FORM_TYPES = [
  { id: "capsule", name: "Kapsül", icon: Pill, unit: "mg" },
  { id: "softgel", name: "Softgel", icon: Circle, unit: "mg" },
  { id: "tablet", name: "Tablet", icon: Pill, unit: "mg" },
  { id: "sachet", name: "Saşe", icon: Package, unit: "g" },
  { id: "powder", name: "Toz", icon: FlaskConical, unit: "g" },
  { id: "liquid", name: "Sıvı", icon: Droplets, unit: "ml" },
  { id: "gummy", name: "Gummy", icon: Cookie, unit: "mg" },
];

const CAPSULE_SIZES = [
  { id: "000", name: "000", capacity: "800-1100mg" },
  { id: "00", name: "00", capacity: "600-800mg" },
  { id: "0", name: "0", capacity: "400-600mg" },
  { id: "1", name: "1", capacity: "300-500mg" },
  { id: "2", name: "2", capacity: "200-400mg" },
  { id: "3", name: "3", capacity: "150-300mg" },
];

const SOFTGEL_SIZES = [
  { id: "mini", name: "Mini", capacity: "100-200mg" },
  { id: "small", name: "Küçük", capacity: "200-400mg" },
  { id: "medium", name: "Orta", capacity: "400-700mg" },
  { id: "standard", name: "Standart", capacity: "700-1000mg" },
  { id: "large", name: "Büyük", capacity: "1000-1500mg" },
  { id: "oblong", name: "Oblong", capacity: "1200-1800mg" },
];

export function SupplementForm({ config, onChange }) {
  // formType: config'den oku, yoksa default "capsule"
  // Önemli: Local state KULLANMA - her zaman config'den oku
  const formType = config?.formType || "capsule";

  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    onChange(newConfig);
  };

  const handleFormTypeChange = (type) => {
    handleChange("formType", type);
  };
  
  // Default değerleri set et - formType null/undefined ise "capsule" yap
  useEffect(() => {
    if (config?.formType === null || config?.formType === undefined) {
      onChange({ ...config, formType: "capsule" });
    }
  }, [config?.formType]); // formType değiştiğinde kontrol et

  return (
    <div className="space-y-6">
      {/* Form Type Selection */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-3 block">
          Form Tipi
        </Label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {FORM_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = formType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleFormTypeChange(type.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-gray-500 hover:border-slate-300"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{type.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Capsule Size - Only for capsules */}
      {formType === "capsule" && (
        <div className="animate-in fade-in duration-200">
          <Label className="text-sm font-medium text-gray-600 mb-3 block">
            Kapsül Boyutu
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CAPSULE_SIZES.map((size) => {
              const isSelected = config?.capsuleSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => handleChange("capsuleSize", size.id)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <span className={cn(
                    "text-lg font-bold",
                    isSelected ? "text-emerald-700" : "text-gray-700"
                  )}>
                    {size.name}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {size.capacity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Softgel Size - Only for softgels */}
      {formType === "softgel" && (
        <div className="animate-in fade-in duration-200">
          <Label className="text-sm font-medium text-gray-600 mb-3 block">
            Softgel Boyutu
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SOFTGEL_SIZES.map((size) => {
              const isSelected = config?.softgelSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => handleChange("softgelSize", size.id)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <span className={cn(
                    "text-lg font-bold",
                    isSelected ? "text-blue-700" : "text-gray-700"
                  )}>
                    {size.name}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {size.capacity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size/Weight Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-600 mb-2 block">
            {formType === "capsule" || formType === "softgel" || formType === "tablet" || formType === "gummy"
              ? "Birim Ağırlık (mg)"
              : formType === "liquid"
              ? "Birim Hacim (ml)"
              : "Birim Ağırlık (g)"}
          </Label>
          <Input
            type="number"
            value={config?.productVolume || ""}
            onChange={(e) => handleChange("productVolume", e.target.value)}
            placeholder={formType === "capsule" ? "600" : formType === "softgel" ? "1000" : formType === "sachet" ? "5" : "100"}
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

      {/* Daily Dosage */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-2 block">
          Günlük Kullanım
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleChange("dailyDosage", num)}
              className={cn(
                "flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                config?.dailyDosage === num
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-gray-500 hover:border-slate-300"
              )}
            >
              {num}x
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {config?.productVolume && config?.productionQuantity && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Toplam Üretim:</span>
            <span className="font-semibold text-emerald-700">
              {((parseFloat(config.productVolume) * parseInt(config.productionQuantity)) / 
                (formType === "capsule" || formType === "softgel" || formType === "tablet" || formType === "gummy" ? 1000000 : 1000)
              ).toFixed(2)} kg
            </span>
          </div>
          {config?.dailyDosage && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Kullanım Süresi:</span>
              <span className="font-semibold text-emerald-700">
                {Math.floor(parseInt(config.productionQuantity) / config.dailyDosage)} gün
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SupplementForm;
