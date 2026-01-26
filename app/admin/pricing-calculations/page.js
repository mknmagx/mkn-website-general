"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { PermissionGuard } from "@/components/admin-route-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Plus,
  Search,
  Trash2,
  Loader2,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  FileText,
  Building2,
  Beaker,
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import * as PricingService from "@/lib/services/pricing-service";
import * as CompaniesService from "@/lib/services/companies-service";
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

export default function PricingCalculationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loading: authLoading } = useAdminAuth();

  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [companiesMap, setCompaniesMap] = useState({});
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    try {
      setLoading(true);
      const data = await PricingService.getPricingCalculations();
      setCalculations(data || []);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hesaplamalar yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompaniesData = async () => {
    try {
      setLoadingCompanies(true);
      const allCompanies = await CompaniesService.getAllCompanies();

      const map = {};
      calculations.forEach((calc) => {
        map[calc.id] = allCompanies.filter((company) => {
          const calcs = company.pricingCalculations || [];
          return calcs.some((c) => c.calculationId === calc.id);
        });
      });

      setCompaniesMap(map);
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    if (calculations.length > 0) {
      loadCompaniesData();
    }
  }, [calculations]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await PricingService.deletePricingCalculation(deleteDialog.id);
      toast({ title: "Silindi", description: "Hesaplama başarıyla silindi." });
      await loadCalculations();
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Silme işlemi başarısız.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const filteredCalculations = calculations.filter((calc) =>
    calc.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // İstatistikler
  const stats = {
    total: calculations.length,
    totalQuantity: calculations.reduce(
      (sum, calc) => sum + (calc.quantity || 0),
      0
    ),
    totalValue: calculations.reduce(
      (sum, calc) => sum + (calc.calculations?.totalPrice || 0),
      0
    ),
    avgMargin:
      calculations.length > 0
        ? calculations.reduce((sum, calc) => {
            const cost = calc.calculations?.totalCostPerUnit || 0;
            const profit = calc.calculations?.profitPerUnit || 0;
            return cost > 0 ? sum + (profit / cost) * 100 : sum;
          }, 0) /
          (calculations.filter((c) => (c.calculations?.totalCostPerUnit || 0) > 0)
            .length || 1)
        : 0,
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="proformas.view" showMessage={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Maliyet Hesaplamaları
                  </h1>
                  <p className="text-sm text-slate-500">
                    {stats.total} hesaplama
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/admin/pricing-calculator")}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Hesaplama
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Toplam Hesaplama</p>
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
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Toplam Ürün</p>
                    <p className="text-lg font-bold text-slate-900">
                      {stats.totalQuantity.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Toplam Değer</p>
                    <p className="text-lg font-bold text-slate-900">
                      ₺
                      {stats.totalValue.toLocaleString("tr-TR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
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
                    <p className="text-xs text-slate-500">Ort. Kar Marjı</p>
                    <p className="text-lg font-bold text-slate-900">
                      %{stats.avgMargin.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Ürün adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* List */}
          {filteredCalculations.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? "Sonuç Bulunamadı" : "Henüz Hesaplama Yok"}
                </h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                  {searchTerm
                    ? "Arama kriterlerine uygun hesaplama bulunamadı."
                    : "İlk maliyet hesaplamanızı oluşturun."}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => router.push("/admin/pricing-calculator")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Hesaplama
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCalculations.map((calc) => {
                const linkedCompanies = companiesMap[calc.id] || [];
                const profitMargin =
                  calc.calculations?.totalCostPerUnit > 0
                    ? (
                        (calc.calculations?.profitPerUnit /
                          calc.calculations?.totalCostPerUnit) *
                        100
                      ).toFixed(1)
                    : "0.0";
                const hasFormula = calc.formData?.sourceFormulaId;

                return (
                  <Card
                    key={calc.id}
                    className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() =>
                      router.push(`/admin/pricing-calculations/${calc.id}`)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Sol: Ürün Bilgileri */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                            <Calculator className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 truncate">
                                {calc.productName}
                              </h3>
                              {hasFormula && (
                                <Badge
                                  variant="outline"
                                  className="bg-violet-50 text-violet-700 border-violet-200 text-[10px] px-1.5 py-0 flex-shrink-0"
                                >
                                  <Beaker className="h-3 w-3 mr-0.5" />
                                  Formül
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0"
                              >
                                {calc.productType || "Genel"}
                              </Badge>
                              {calc.productVolume && (
                                <span>{calc.productVolume} ml</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(calc.createdAt)}
                              </span>
                              {linkedCompanies.length > 0 && (
                                <span className="flex items-center gap-1 text-blue-600">
                                  <Building2 className="h-3 w-3" />
                                  {linkedCompanies.length} müşteri
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Orta: Fiyat Bilgileri */}
                        <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
                          <div className="text-center px-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                              Miktar
                            </p>
                            <p className="font-semibold text-slate-900">
                              {calc.quantity?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="text-center px-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                              Birim Fiyat
                            </p>
                            <p className="font-bold text-blue-600">
                              ₺{calc.calculations?.unitPrice?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                          <div className="text-center px-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                              Toplam
                            </p>
                            <p className="font-bold text-emerald-600">
                              ₺
                              {calc.calculations?.totalPrice?.toLocaleString(
                                "tr-TR",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              ) || "0.00"}
                            </p>
                          </div>
                          <div className="text-center px-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                              Maliyet
                            </p>
                            <p className="font-semibold text-slate-600">
                              ₺
                              {calc.calculations?.totalCostPerUnit?.toFixed(2) ||
                                "0.00"}
                            </p>
                          </div>
                          <div className="text-center px-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                              Kar
                            </p>
                            <Badge
                              variant="outline"
                              className={`font-semibold text-xs ${
                                parseFloat(profitMargin) >= 30
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : parseFloat(profitMargin) >= 15
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              %{profitMargin}
                            </Badge>
                          </div>
                        </div>

                        {/* Sağ: Actions */}
                        <div className="flex items-center gap-2 lg:pl-4 lg:border-l lg:border-slate-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/admin/pricing-calculations/${calc.id}`
                              );
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
                              {hasFormula && calc.formData?.sourceFormulaId && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/admin/formulas/${calc.formData.sourceFormulaId}`
                                    );
                                  }}
                                  className="text-violet-600"
                                >
                                  <Beaker className="h-4 w-4 mr-2" />
                                  Formülü Görüntüle
                                </DropdownMenuItem>
                              )}
                              {linkedCompanies.length > 0 && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/admin/companies/${linkedCompanies[0].id}`
                                    );
                                  }}
                                  className="text-blue-600"
                                >
                                  <Building2 className="h-4 w-4 mr-2" />
                                  Müşteriyi Görüntüle
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog({ open: true, id: calc.id });
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
          onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hesaplamayı Sil</AlertDialogTitle>
              <AlertDialogDescription>
                Bu hesaplamayı silmek istediğinizden emin misiniz? Bu işlem geri
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
    </PermissionGuard>
  );
}
