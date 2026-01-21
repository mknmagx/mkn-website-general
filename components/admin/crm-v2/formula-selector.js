"use client";

import { useState, useEffect } from "react";
import { loadSavedFormulas } from "../../../lib/services/formula-service";
import { cn } from "../../../lib/utils";

// UI Components
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

// Icons
import {
  Search,
  FlaskConical,
  Beaker,
  Check,
  X,
  Droplet,
  Sparkles,
  Package,
  Loader2,
} from "lucide-react";

const FORMULA_CATEGORIES = {
  skincare: { label: "Cilt Bakım", icon: Sparkles, color: "bg-pink-100 text-pink-700" },
  haircare: { label: "Saç Bakım", icon: Sparkles, color: "bg-purple-100 text-purple-700" },
  bodycare: { label: "Vücut Bakım", icon: Droplet, color: "bg-blue-100 text-blue-700" },
  cleaning: { label: "Temizlik", icon: Droplet, color: "bg-cyan-100 text-cyan-700" },
  supplement: { label: "Takviye", icon: Package, color: "bg-green-100 text-green-700" },
  other: { label: "Diğer", icon: Beaker, color: "bg-slate-100 text-slate-700" },
};

const FORMULA_TYPES = {
  cream: "Krem",
  serum: "Serum",
  lotion: "Losyon",
  gel: "Jel",
  tonic: "Tonik",
  shampoo: "Şampuan",
  conditioner: "Saç Kremi",
  cleanser: "Temizleyici",
  mask: "Maske",
  oil: "Yağ",
  spray: "Sprey",
  other: "Diğer",
};

export function FormulaSelector({ 
  open, 
  onClose, 
  onSelect,
  selectedFormulaId = null,
  category = null,
}) {
  const [loading, setLoading] = useState(true);
  const [formulas, setFormulas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(category || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedFormula, setSelectedFormula] = useState(null);

  useEffect(() => {
    if (open) {
      loadFormulas();
      setSelectedFormula(null);
    }
  }, [open]);

  const loadFormulas = async () => {
    setLoading(true);
    try {
      const result = await loadSavedFormulas();
      setFormulas(result || []);
    } catch (error) {
      console.error("Error loading formulas:", error);
      setFormulas([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Formülden kategori al (farklı field yapılarını destekle)
  const getFormulaCategory = (formula) => {
    return formula.category || formula.productCategory || "other";
  };

  // Helper: Formülden tip al
  const getFormulaType = (formula) => {
    return formula.type || formula.productType || formula.formulaType || "other";
  };

  // Helper: Formülden isim al
  const getFormulaName = (formula) => {
    return formula.productName || formula.name || formula.formulaName || "İsimsiz Formül";
  };

  // Helper: Formülden maliyet al
  const getFormulaCost = (formula) => {
    return formula.totals?.totalEstimatedCostTL || 
           formula.estimatedCost || 
           formula.cost || 
           0;
  };

  // Helper: Formülden içerik sayısı al
  const getIngredientCount = (formula) => {
    const ingredients = formula.formula || formula.ingredients || [];
    return ingredients.length;
  };

  // Formülleri filtrele
  const filteredFormulas = formulas.filter(formula => {
    // Kategori filtresi
    const formulaCategory = getFormulaCategory(formula);
    if (categoryFilter !== "all" && formulaCategory !== categoryFilter) {
      return false;
    }
    
    // Tip filtresi
    const formulaType = getFormulaType(formula);
    if (typeFilter !== "all" && formulaType !== typeFilter) {
      return false;
    }
    
    // Arama filtresi
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const name = getFormulaName(formula).toLowerCase();
    const description = (formula.description || "").toLowerCase();
    
    return name.includes(search) || description.includes(search);
  });

  const handleSelect = (formula) => {
    setSelectedFormula(formula);
  };

  const handleConfirm = () => {
    if (selectedFormula) {
      onSelect(selectedFormula);
      onClose();
    }
  };

  const getCategoryInfo = (cat) => {
    return FORMULA_CATEGORIES[cat] || FORMULA_CATEGORIES.other;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount || 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="flex flex-col p-0 gap-0 overflow-hidden"
        style={{ maxWidth: '700px', width: '95vw', maxHeight: '85vh' }}
      >
        <DialogHeader className="px-4 py-3 border-b bg-slate-50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-purple-600" />
            Formül Seç
          </DialogTitle>
          <DialogDescription className="text-xs">
            Üretime eklenecek formülü seçin.
          </DialogDescription>
        </DialogHeader>

        {/* Arama ve Filtreler */}
        <div className="flex flex-col gap-2 px-4 py-3 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Formül adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {Object.entries(FORMULA_CATEGORIES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Formül Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                {Object.entries(FORMULA_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <span className="text-xs text-slate-500 ml-auto">
              {filteredFormulas.length} formül
            </span>
          </div>
        </div>

        {/* Formül Listesi */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: '200px', maxHeight: '350px' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredFormulas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FlaskConical className="h-10 w-10 mb-2" />
              <p className="text-sm">Formül bulunamadı</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-purple-500 hover:underline mt-1"
                >
                  Aramayı temizle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
              {filteredFormulas.map((formula) => {
                const isSelected = selectedFormula?.id === formula.id;
                const category = getFormulaCategory(formula);
                const categoryInfo = getCategoryInfo(category);
                const CategoryIcon = categoryInfo.icon;
                const formulaType = getFormulaType(formula);
                const formulaCost = getFormulaCost(formula);
                const ingredientCount = getIngredientCount(formula);
                
                return (
                  <div
                    key={formula.id}
                    onClick={() => handleSelect(formula)}
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-purple-500 bg-purple-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                        categoryInfo.color
                      )}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {getFormulaName(formula)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {FORMULA_TYPES[formulaType] || formulaType}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <Badge className={cn("text-[10px] px-1.5 py-0", categoryInfo.color)}>
                            {categoryInfo.label}
                          </Badge>
                          {formula.level && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Seviye {formula.level}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Formül detayları */}
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                          <span>{ingredientCount} içerik</span>
                          {formulaCost > 0 && (
                            <span className="font-medium text-slate-700">
                              {formatCurrency(formulaCost)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seçili Formül Özeti */}
        {selectedFormula && (
          <div className="border-t px-4 py-3 bg-purple-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600">Seçili Formül</p>
                  <p className="font-semibold text-sm text-purple-900">
                    {getFormulaName(selectedFormula)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {getFormulaCost(selectedFormula) > 0 && (
                  <>
                    <p className="text-xs text-purple-600">Tahmini Maliyet</p>
                    <p className="font-bold text-sm text-purple-900">
                      {formatCurrency(getFormulaCost(selectedFormula))}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="px-4 py-3 border-t bg-slate-50 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            İptal
          </Button>
          <Button 
            size="sm"
            onClick={handleConfirm} 
            disabled={!selectedFormula}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Formülü Seç
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Formül Özet Kartı
export function FormulaSummaryCard({ formula, onRemove, onView }) {
  if (!formula) return null;

  // Helper fonksiyonlar
  const getFormulaCategory = () => {
    return formula.category || formula.productCategory || "other";
  };

  const getFormulaType = () => {
    return formula.type || formula.productType || formula.formulaType || "other";
  };

  const getFormulaName = () => {
    return formula.productName || formula.name || formula.formulaName || "İsimsiz Formül";
  };

  const getFormulaCost = () => {
    return formula.totals?.totalEstimatedCostTL || 
           formula.estimatedCost || 
           formula.cost || 
           0;
  };

  const getIngredientCount = () => {
    const ingredients = formula.formula || formula.ingredients || [];
    return ingredients.length;
  };

  const category = getFormulaCategory();
  const categoryInfo = FORMULA_CATEGORIES[category] || FORMULA_CATEGORIES.other;
  const CategoryIcon = categoryInfo.icon;
  const formulaType = getFormulaType();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount || 0);
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
            categoryInfo.color
          )}>
            <CategoryIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-purple-900 truncate">
              {getFormulaName()}
            </p>
            <p className="text-xs text-purple-600">
              {FORMULA_TYPES[formulaType] || formulaType} • {getIngredientCount()} içerik
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="text-right">
            {getFormulaCost() > 0 && (
              <>
                <p className="font-bold text-sm text-purple-900">
                  {formatCurrency(getFormulaCost())}
                </p>
                <p className="text-[10px] text-purple-600">Tahmini Maliyet</p>
              </>
            )}
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
              onClick={onRemove}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormulaSelector;
