"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Plus,
  Search,
  Beaker,
  Package,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Eye,
  Layers,
  Trash2,
  Sparkles,
  MoreVertical,
  Calculator,
  FlaskConical,
} from "lucide-react";
import * as FormulaService from "@/lib/services/formula-service";
import { useToast } from "@/hooks/use-toast";
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

export default function FormulasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadFormulas();
  }, []);

  // Akıllı birim formatlaması (gram → kg/g)
  const formatVolume = (gramValue) => {
    const value = parseFloat(gramValue) || 0;
    
    if (value >= 1000) {
      // 1000g ve üzeri → kg
      const kgValue = value / 1000;
      return `${kgValue % 1 === 0 ? kgValue.toFixed(0) : kgValue.toFixed(2)} kg`;
    } else if (value > 0) {
      // 0'dan büyük tüm değerler gram olarak göster
      // Tam sayıysa ondalık gösterme, değilse uygun hassasiyette göster
      if (value % 1 === 0) {
        return `${value.toFixed(0)} g`;
      } else if (value >= 0.1) {
        return `${value.toFixed(1)} g`;
      } else {
        return `${value.toFixed(2)} g`;
      }
    }
    return "0 g";
  };

  // Detay sayfasıyla aynı hesaplama mantığı
  const calculateIngredientCost = (ing) => {
    const amount = parseFloat(ing.amount) || 0;
    const unit = ing.unit || "gram";
    // price veya estimatedPriceTLperKg her zaman KG başına fiyattır
    const pricePerKg = parseFloat(ing.price) || parseFloat(ing.estimatedPriceTLperKg) || 0;

    let cost = 0;

    switch (unit) {
      case "adet":
        // Adet: miktar × adet başına fiyat (bu durumda price adet fiyatıdır)
        cost = amount * pricePerKg;
        break;
      case "mg":
        // mg: (mg / 1,000,000) × pricePerKg
        cost = (amount / 1000000) * pricePerKg;
        break;
      case "kg":
        // kg: kg × pricePerKg
        cost = amount * pricePerKg;
        break;
      case "ml":
        // ml: (ml / 1000) × pricePerKg (1ml ≈ 1g varsayımı)
        cost = (amount / 1000) * pricePerKg;
        break;
      case "L":
        // L: L × pricePerKg (1L ≈ 1000g)
        cost = amount * pricePerKg;
        break;
      case "g":
      case "gram":
      default:
        // gram: (gram / 1000) × pricePerKg
        cost = (amount / 1000) * pricePerKg;
        break;
    }

    return cost;
  };

  const loadFormulas = async () => {
    try {
      setLoading(true);
      const data = await FormulaService.loadSavedFormulas();

      // Calculate cost for each formula
      const formulasWithCost = data.map((formula) => {
        let totalCost = 0;
        let totalAmount = 0;

        if (formula.ingredients) {
          formula.ingredients.forEach((ing) => {
            const amount = parseFloat(ing.amount) || 0;
            const unit = ing.unit || "gram";
            
            // adet birimli hammaddeler gram hesabına dahil edilmez
            if (unit !== "adet") {
              // Gram'a dönüştür
              let gramAmount = amount;
              if (unit === "mg") gramAmount = amount / 1000;
              else if (unit === "kg") gramAmount = amount * 1000;
              else if (unit === "ml") gramAmount = amount;
              else if (unit === "L") gramAmount = amount * 1000;
              totalAmount += gramAmount;
            }

            // Maliyet hesapla (detay sayfasıyla aynı mantık)
            totalCost += calculateIngredientCost(ing);
          });
        }

        // Her zaman hesaplanan totalAmount kullan (adet hariç, gram cinsinden)
        // Firestore'daki totalAmount adet dahil olabilir, bu yüzden kullanmıyoruz
        const displayVolume = totalAmount;

        return {
          ...formula,
          calculatedCost: totalCost.toFixed(2),
          totalAmount: totalAmount, // Ham değer (gram cinsinden, adet hariç)
          displayVolume: displayVolume, // Gösterim için (gram cinsinden)
          costPerGram:
            displayVolume > 0 ? (totalCost / displayVolume).toFixed(4) : "0.0000",
        };
      });

      setFormulas(formulasWithCost);
    } catch (error) {
      console.error("Error loading formulas:", error);
      toast({
        title: "Hata",
        description: "Formüller yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFormulas = formulas.filter((formula) => {
    const matchesSearch = formula.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || formula.productType === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await FormulaService.deleteFormula(deleteDialog.id);

      toast({
        title: "Başarılı",
        description: "Formül başarıyla silindi.",
      });

      await loadFormulas();
      setDeleteDialog({ open: false, id: null, name: "" });
    } catch (error) {
      console.error("Error deleting formula:", error);
      toast({
        title: "Hata",
        description: "Formül silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // Stats
  const stats = {
    total: formulas.length,
    totalCost: formulas.reduce(
      (sum, f) => sum + parseFloat(f.calculatedCost || 0),
      0
    ),
    totalIngredients: formulas.reduce(
      (sum, f) => sum + (f.ingredients?.length || 0),
      0
    ),
    avgCost:
      formulas.length > 0
        ? formulas.reduce(
            (sum, f) => sum + parseFloat(f.calculatedCost || 0),
            0
          ) / formulas.length
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="text-sm text-slate-500">Formüller yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Beaker className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Ürün Formülleri
                </h1>
                <p className="text-sm text-slate-500">{stats.total} formül</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/admin/formulas/professional")}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-600/25"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Profesyonel
              </Button>
              <Button
                onClick={() => router.push("/admin/formulas/create")}
                variant="outline"
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Hızlı Oluştur
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <FlaskConical className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Toplam Formül</p>
                  <p className="text-lg font-bold text-slate-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Ort. Maliyet</p>
                  <p className="text-lg font-bold text-slate-900">
                    ₺{stats.avgCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hammadde</p>
                  <p className="text-lg font-bold text-slate-900">
                    {stats.totalIngredients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Toplam Maliyet</p>
                  <p className="text-lg font-bold text-slate-900">
                    ₺{stats.totalCost.toFixed(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Formül adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200 rounded-xl"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] h-10 bg-white border-slate-200 rounded-xl">
              <Filter className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Tüm tipler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tipler</SelectItem>
              <SelectItem value="kozmetik">Kozmetik</SelectItem>
              <SelectItem value="gida">Gıda Takviyesi</SelectItem>
              <SelectItem value="temizlik">Temizlik</SelectItem>
              <SelectItem value="kisisel-bakim">Kişisel Bakım</SelectItem>
              <SelectItem value="diger">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter tags */}
        {(searchTerm || filterType !== "all") && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-500">Filtreler:</span>
            {searchTerm && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                &quot;{searchTerm}&quot;
              </Badge>
            )}
            {filterType !== "all" && (
              <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                {filterType}
              </Badge>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
              }}
              className="text-xs text-violet-600 hover:underline ml-2"
            >
              Temizle
            </button>
          </div>
        )}

        {/* List */}
        {filteredFormulas.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Beaker className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchTerm || filterType !== "all"
                  ? "Sonuç Bulunamadı"
                  : "Henüz Formül Yok"}
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                {searchTerm || filterType !== "all"
                  ? "Arama kriterlerine uygun formül bulunamadı."
                  : "İlk formülünüzü oluşturun."}
              </p>
              {!searchTerm && filterType === "all" && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => router.push("/admin/formulas/professional")}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Profesyonel Formül
                  </Button>
                  <Button
                    onClick={() => router.push("/admin/formulas/create")}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Hızlı Formül
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFormulas.map((formula) => {
              const activeCount =
                formula.ingredients?.filter(
                  (ing) =>
                    ing.function === "Active Ingredient" ||
                    ing.functionTr === "Aktif Madde"
                ).length || 0;
              const isProfessional = formula.source === "professional";
              const hasProductionQuantity =
                formula.productionQuantity &&
                parseFloat(formula.productionQuantity) > 0;

              // Kutu başına maliyet hesaplama (productionQuantity varsa)
              const costPerUnit = hasProductionQuantity
                ? (
                    parseFloat(formula.calculatedCost) *
                    parseFloat(formula.productionQuantity)
                  ).toFixed(2)
                : null;

              return (
                <Card
                  key={formula.id}
                  className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/admin/formulas/${formula.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Sol: Formül Bilgileri */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                            isProfessional
                              ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/20"
                              : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20"
                          }`}
                        >
                          {isProfessional ? (
                            <Sparkles className="h-5 w-5 text-white" />
                          ) : (
                            <Beaker className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">
                              {formula.name}
                            </h3>
                            {isProfessional && (
                              <Badge
                                variant="outline"
                                className="bg-violet-50 text-violet-700 border-violet-200 text-[10px] px-1.5 py-0 flex-shrink-0"
                              >
                                Profesyonel
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0"
                            >
                              {formula.productType || "Genel"}
                            </Badge>
                            {formula.productVolume && (
                              <span>{formula.productVolume} ml</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(formula.createdAt)}
                            </span>
                            {hasProductionQuantity && (
                              <span className="flex items-center gap-1 text-violet-600">
                                <Package className="h-3 w-3" />
                                {formula.productionQuantity} adet/kutu
                              </span>
                            )}
                          </div>
                          {/* Ingredients preview */}
                          {formula.ingredients && formula.ingredients.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {formula.ingredients.slice(0, 4).map((ing, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                                >
                                  {ing.name}
                                </span>
                              ))}
                              {formula.ingredients.length > 4 && (
                                <span className="text-[10px] text-slate-400 px-1">
                                  +{formula.ingredients.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Orta: Bilgiler */}
                      <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
                        <div className="text-center px-3">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                            Hammadde
                          </p>
                          <div className="flex items-center justify-center gap-1">
                            <p className="font-semibold text-slate-900">
                              {formula.ingredients?.length || 0}
                            </p>
                            {activeCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-700 text-[10px] px-1 py-0"
                              >
                                {activeCount} aktif
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-center px-3">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                            Hacim
                          </p>
                          <p className="font-semibold text-slate-900">
                            {formatVolume(formula.displayVolume)}
                          </p>
                        </div>
                        <div className="text-center px-3">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                            Birim Maliyet
                          </p>
                          <p className="font-bold text-emerald-600">
                            ₺{formula.calculatedCost}
                          </p>
                        </div>
                        {costPerUnit && (
                          <div className="text-center px-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                              Kutu Maliyeti
                            </p>
                            <p className="font-bold text-violet-600">
                              ₺{costPerUnit}
                            </p>
                          </div>
                        )}
                        <div className="text-center px-3">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                            Gram/TL
                          </p>
                          <p className="font-semibold text-slate-600">
                            ₺{formula.costPerGram}
                          </p>
                        </div>
                      </div>

                      {/* Sağ: Actions */}
                      <div className="flex items-center gap-2 lg:pl-4 lg:border-l lg:border-slate-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-slate-600 hover:text-violet-600 hover:bg-violet-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/formulas/${formula.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Görüntüle
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/admin/pricing-calculator?formulaId=${formula.id}`
                                );
                              }}
                              className="text-blue-600"
                            >
                              <Calculator className="h-4 w-4 mr-2" />
                              Maliyet Hesapla
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({
                                  open: true,
                                  id: formula.id,
                                  name: formula.name,
                                });
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null, name: "" })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Formülü Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-slate-900">
                {deleteDialog.name}
              </span>{" "}
              formülünü silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                "Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
