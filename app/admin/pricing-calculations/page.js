"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { PermissionGuard } from "@/components/admin-route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calculator,
  Plus,
  Search,
  Eye,
  Trash2,
  Loader2,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  FileText,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as PricingService from "@/lib/services/pricing-service";
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

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await PricingService.deletePricingCalculation(deleteDialog.id);

      toast({
        title: "Silindi",
        description: "Hesaplama başarıyla silindi.",
      });

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
    if (!timestamp) return "Tarih bilinmiyor";
    try {
      const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return date.toLocaleDateString("tr-TR");
    } catch {
      return "Tarih bilinmiyor";
    }
  };

  const filteredCalculations = calculations.filter((calc) =>
    calc.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="proformas.view" showMessage={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Modern Header with Glass Effect */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                    <Calculator className="h-7 w-7 text-white" />
                  </div>
                  Maliyet Hesaplamaları
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 ml-14">
                  Ürün maliyet analizlerinizi görüntüleyin ve yönetin
                </p>
              </div>
              <Button
                onClick={() => router.push("/admin/pricing-calculator")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Yeni Hesaplama
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Toplam Hesaplama
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {calculations.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3">
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Toplam Ürün Sayısı
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {calculations
                        .reduce((sum, calc) => sum + (calc.quantity || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3">
                    <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Toplam Değer
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      ₺
                      {calculations
                        .reduce(
                          (sum, calc) =>
                            sum + (calc.calculations?.totalPrice || 0),
                          0
                        )
                        .toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-3">
                    <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ortalama Kar Marjı
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {calculations.length > 0
                        ? (
                            calculations.reduce((sum, calc) => {
                              const cost =
                                calc.calculations?.totalCostPerUnit || 0;
                              const profit =
                                calc.calculations?.profitPerUnit || 0;
                              return cost > 0
                                ? sum + (profit / cost) * 100
                                : sum;
                            }, 0) /
                              calculations.filter(
                                (c) =>
                                  (c.calculations?.totalCostPerUnit || 0) > 0
                              ).length || 0
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 rounded-xl p-3">
                    <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Ürün adı ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          {filteredCalculations.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {searchTerm ? "Sonuç Bulunamadı" : "Henüz Hesaplama Yok"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? "Arama kriterlerine uygun hesaplama bulunamadı. Farklı anahtar kelimeler deneyin."
                    : "İlk maliyet hesaplamanızı oluşturmak için yeni hesaplama butonuna tıklayın."}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => router.push("/admin/pricing-calculator")}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Yeni Hesaplama Oluştur
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4">
                        Ürün Bilgileri
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Miktar
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-right">
                        Birim Fiyat
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-right">
                        Toplam Fiyat
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-right">
                        Birim Maliyet
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-right">
                        Birim Kar
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Kar Marjı
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        İşlemler
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalculations.map((calc) => {
                      const profitMargin =
                        calc.calculations?.totalCostPerUnit > 0
                          ? (
                              (calc.calculations?.profitPerUnit /
                                calc.calculations?.totalCostPerUnit) *
                              100
                            ).toFixed(1)
                          : "0.0";

                      return (
                        <TableRow
                          key={calc.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/pricing-calculations/${calc.id}`)
                          }
                        >
                          {/* Ürün Bilgileri */}
                          <TableCell className="py-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 shadow-md flex-shrink-0">
                                <Calculator className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                                  {calc.productName}
                                </h3>
                                <div className="flex gap-1.5 flex-wrap">
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs"
                                  >
                                    {calc.productType || "Genel"}
                                  </Badge>
                                  {calc.productVolume && (
                                    <Badge
                                      variant="outline"
                                      className="border-gray-300 dark:border-gray-600 text-xs"
                                    >
                                      {calc.productVolume} ml
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(calc.createdAt)}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Miktar */}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {calc.quantity?.toLocaleString() || "0"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Birim Fiyat */}
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-blue-700 dark:text-blue-300">
                                ₺{calc.calculations?.unitPrice?.toFixed(2) || "0.00"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                satış fiyatı
                              </span>
                            </div>
                          </TableCell>

                          {/* Toplam Fiyat */}
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-green-700 dark:text-green-300">
                                ₺
                                {calc.calculations?.totalPrice?.toFixed(2) ||
                                  "0.00"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                toplam
                              </span>
                            </div>
                          </TableCell>

                          {/* Birim Maliyet */}
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-orange-700 dark:text-orange-300">
                                ₺
                                {calc.calculations?.totalCostPerUnit?.toFixed(
                                  2
                                ) || "0.00"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                maliyet
                              </span>
                            </div>
                          </TableCell>

                          {/* Birim Kar */}
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-purple-700 dark:text-purple-300">
                                ₺
                                {calc.calculations?.profitPerUnit?.toFixed(2) ||
                                  "0.00"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                kar
                              </span>
                            </div>
                          </TableCell>

                          {/* Kar Marjı */}
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`font-bold ${
                                parseFloat(profitMargin) >= 30
                                  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                                  : parseFloat(profitMargin) >= 15
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700"
                                  : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                              }`}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              %{profitMargin}
                            </Badge>
                          </TableCell>

                          {/* İşlemler */}
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/admin/pricing-calculations/${calc.id}`
                                  );
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog({ open: true, id: calc.id });
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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
          onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        >
          <AlertDialogContent className="bg-white dark:bg-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Hesaplamayı Sil
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
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
