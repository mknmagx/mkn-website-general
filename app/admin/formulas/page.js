"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowRight,
  Layers,
  Trash2,
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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: "" });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadFormulas();
  }, []);

  const loadFormulas = async () => {
    try {
      setLoading(true);
      const data = await FormulaService.loadSavedFormulas();
      
      // Calculate cost for each formula
      const formulasWithCost = data.map(formula => {
        let totalCost = 0;
        if (formula.ingredients) {
          formula.ingredients.forEach(ing => {
            const amount = parseFloat(ing.amount) || 0;
            const price = parseFloat(ing.price) || 0;
            let cost = 0;
            
            if (ing.unit === 'g' || ing.unit === 'gram') {
              cost = (amount / 1000) * price;
            } else if (ing.unit === 'ml') {
              cost = (amount / 1000) * price;
            } else if (ing.unit === 'kg') {
              cost = amount * price;
            } else {
              cost = amount * price;
            }
            
            totalCost += cost;
          });
        }
        
        return {
          ...formula,
          calculatedCost: totalCost.toFixed(2)
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

  // Filter and search
  const filteredFormulas = formulas.filter((formula) => {
    const matchesSearch = formula.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || formula.productType === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateNew = () => {
    router.push("/admin/formulas/create");
  };

  const handleViewFormula = (id) => {
    router.push(`/admin/formulas/${id}`);
  };

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

  // Calculate stats
  const totalFormulas = formulas.length;
  const totalCost = formulas.reduce((sum, f) => sum + parseFloat(f.calculatedCost || 0), 0);
  const avgCost = totalFormulas > 0 ? (totalCost / totalFormulas).toFixed(2) : 0;
  const totalIngredients = formulas.reduce((sum, f) => sum + (f.ingredients?.length || 0), 0);
  const totalActiveIngredients = formulas.reduce((sum, f) => {
    const activeCount = f.ingredients?.filter(ing => 
      ing.function === "Active Ingredient" || 
      ing.functionTr === "Aktif Madde"
    ).length || 0;
    return sum + activeCount;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Formüller yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                  <Beaker className="h-7 w-7 text-white" />
                </div>
                Ürün Formülleri
              </h1>
              <p className="text-gray-600 mt-2 ml-14">
                Kayıtlı formülleri görüntüleyin, düzenleyin ve yönetin
              </p>
            </div>
            <Button 
              onClick={handleCreateNew} 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Yeni Formül Oluştur
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Stats Cards - Modern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-8 w-8 opacity-80" />
              <div className="text-xs font-medium opacity-90">TOPLAM</div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{totalFormulas}</div>
            <div className="text-sm mt-2 opacity-80">Kayıtlı Formül</div>
          </div>

          <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 opacity-80" />
              <div className="text-xs font-medium opacity-90">ORT. MALİYET</div>
            </div>
            <div className="text-3xl font-bold tracking-tight">₺{avgCost}</div>
            <div className="text-sm mt-2 opacity-80">Formül başına</div>
          </div>

          <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Layers className="h-8 w-8 opacity-80" />
              <div className="text-xs font-medium opacity-90">HAMMADDE</div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{totalIngredients}</div>
            <div className="text-sm mt-2 opacity-80">Toplam kullanım</div>
            {totalActiveIngredients > 0 && (
              <div className="text-xs mt-1 opacity-70">
                ({totalActiveIngredients} aktif madde)
              </div>
            )}
          </div>

          <div className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <div className="text-xs font-medium opacity-90">TOPLAM</div>
            </div>
            <div className="text-3xl font-bold tracking-tight">₺{totalCost.toFixed(2)}</div>
            <div className="text-sm mt-2 opacity-80">Toplam maliyet</div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 border-0 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Formül adı ile arama yapın..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base"
                  />
                </div>
              </div>
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 rounded-xl">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Ürün tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Tipler</SelectItem>
                    <SelectItem value="kozmetik">Kozmetik</SelectItem>
                    <SelectItem value="gida">Gıda</SelectItem>
                    <SelectItem value="temizlik">Temizlik</SelectItem>
                    <SelectItem value="kisisel-bakim">Kişisel Bakım</SelectItem>
                    <SelectItem value="diger">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || filterType !== "all") && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Aktif Filtreler:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-normal">
                    Arama: "{searchTerm}"
                  </Badge>
                )}
                {filterType !== "all" && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 font-normal">
                    Tip: {filterType}
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-auto"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        {filteredFormulas.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredFormulas.length}</span> formül listeleniyor
              {filteredFormulas.length !== totalFormulas && (
                <span className="text-gray-500"> (toplam {totalFormulas} içinden)</span>
              )}
            </p>
          </div>
        )}

        {/* Formulas Table */}
        {filteredFormulas.length === 0 ? (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="py-16 text-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm || filterType !== "all"
                  ? "Formül Bulunamadı"
                  : "Henüz Formül Yok"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || filterType !== "all"
                  ? "Arama kriterlerinize uygun formül bulunamadı. Filtreleri değiştirerek tekrar deneyin."
                  : "İlk formülünüzü oluşturmak için aşağıdaki butona tıklayın ve yeni bir formül tanımlayın."}
              </p>
              {!searchTerm && filterType === "all" && (
                <Button 
                  onClick={handleCreateNew}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  İlk Formülü Oluştur
                </Button>
              )}
              {(searchTerm || filterType !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  variant="outline"
                  size="lg"
                >
                  Filtreleri Temizle
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-50 hover:to-indigo-50">
                    <TableHead className="font-bold text-gray-900 py-4 w-[35%]">
                      Formül Bilgileri
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 text-center">
                      Hammaddeler
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 text-center">
                      Toplam Hacim
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 text-right">
                      Toplam Maliyet
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 text-right">
                      Gram Başı Maliyet
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 text-center">
                      Tarih
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 text-center">
                      İşlemler
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFormulas.map((formula) => {
                    const activeCount = formula.ingredients?.filter(ing => 
                      ing.function === "Active Ingredient" || 
                      ing.functionTr === "Aktif Madde"
                    ).length || 0;
                    const costPerGram = formula.totalAmount && formula.calculatedCost && parseFloat(formula.calculatedCost) > 0
                      ? (parseFloat(formula.calculatedCost) / parseFloat(formula.totalAmount)).toFixed(4)
                      : "0.0000";

                    return (
                      <TableRow
                        key={formula.id}
                        className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => handleViewFormula(formula.id)}
                      >
                        {/* Formül Bilgileri */}
                        <TableCell className="py-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 shadow-sm flex-shrink-0">
                              <Beaker className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1">
                                {formula.name}
                              </h3>
                              <div className="flex gap-1.5 flex-wrap">
                                <Badge className="bg-blue-600 text-white border-0 text-xs">
                                  {formula.productType || "Genel"}
                                </Badge>
                                {formula.productVolume && (
                                  <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                                    {formula.productVolume} ml
                                  </Badge>
                                )}
                              </div>
                              {/* Ingredients Preview */}
                              {formula.ingredients && formula.ingredients.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {formula.ingredients.slice(0, 3).map((ing, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium"
                                      >
                                        {ing.name}
                                      </span>
                                    ))}
                                    {formula.ingredients.length > 3 && (
                                      <span className="text-xs text-gray-500 px-2 py-0.5 font-medium">
                                        +{formula.ingredients.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Hammaddeler */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <Layers className="h-4 w-4 text-gray-400" />
                              <span className="font-bold text-gray-900">
                                {formula.ingredients?.length || 0}
                              </span>
                            </div>
                            {activeCount > 0 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 font-semibold text-xs">
                                {activeCount} aktif
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Toplam Hacim */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            {formula.totalAmount ? (
                              <>
                                <span className="font-bold text-purple-700">
                                  {parseFloat(formula.totalAmount).toFixed(0)}
                                </span>
                                <span className="text-xs text-gray-500">gram</span>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Toplam Maliyet */}
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            {formula.calculatedCost && parseFloat(formula.calculatedCost) > 0 ? (
                              <>
                                <span className="font-bold text-green-700">
                                  ₺{formula.calculatedCost}
                                </span>
                                <span className="text-xs text-gray-500">toplam</span>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Gram Başı Maliyet */}
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            {formula.totalAmount && formula.calculatedCost && parseFloat(formula.calculatedCost) > 0 ? (
                              <>
                                <span className="font-bold text-orange-700">
                                  ₺{costPerGram}
                                </span>
                                <span className="text-xs text-gray-500">per gram</span>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Tarih */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {formula.createdAt?.toDate
                                ? formula.createdAt.toDate().toLocaleDateString("tr-TR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })
                                : "Bilinmiyor"}
                            </span>
                          </div>
                        </TableCell>

                        {/* İşlemler */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewFormula(formula.id);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({ open: true, id: formula.id, name: formula.name });
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null, name: "" })}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Formülü Sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              <span className="font-semibold text-gray-900">{deleteDialog.name}</span> formülünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
