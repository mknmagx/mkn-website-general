"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useToast } from "../../../hooks/use-toast";
import {
  useInventoryStatistics,
  useTransactionStatistics,
  useWarehouses,
  useLowStockItems,
} from "../../../hooks/use-inventory";
import {
  ITEM_CATEGORY_LABELS,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LABELS,
  OWNERSHIP_TYPE_LABELS,
} from "../../../lib/services/inventory-service";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Progress } from "../../../components/ui/progress";
import { ScrollArea } from "../../../components/ui/scroll-area";

// Icons
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Warehouse,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Box,
  Building2,
  Users,
  Activity,
  BarChart3,
  Clock,
  FileText,
  Truck,
  Settings,
  Database,
} from "lucide-react";

export default function InventoryDashboardPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const { stats: inventoryStats, loading: statsLoading, refresh: refreshStats } = useInventoryStatistics();
  const { stats: transactionStats, loading: transLoading, refresh: refreshTrans } = useTransactionStatistics();
  const { warehouses, loading: warehousesLoading, refresh: refreshWarehouses } = useWarehouses();
  const { items: lowStockItems, loading: lowStockLoading, refresh: refreshLowStock } = useLowStockItems();

  const loading = statsLoading || transLoading || warehousesLoading || lowStockLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshStats(),
      refreshTrans(),
      refreshWarehouses(),
      refreshLowStock(),
    ]);
    setRefreshing(false);
    toast({
      title: "Yenilendi",
      description: "Veriler başarıyla güncellendi.",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("tr-TR").format(value || 0);
  };

  if (loading && !refreshing) {
    return (
      <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <Skeleton className="h-10 w-32 bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl bg-slate-200" />
          <Skeleton className="h-96 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Envanter Yönetimi</h1>
            <p className="text-sm text-slate-600 mt-1">
              Depo ve stok yönetim merkezi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Yenile"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button asChild variant="outline" className="border-slate-300">
              <Link href="/admin/inventory/inbound">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Giriş
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-300">
              <Link href="/admin/inventory/outbound">
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Çıkış
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Link href="/admin/inventory/items/new">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Items */}
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Toplam Ürün
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {formatNumber(inventoryStats?.totalItems)}
                </span>
                <span className="text-sm text-slate-500">kalem</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-blue-600 font-medium">
                  {formatNumber(inventoryStats?.byOwnership?.mkn || 0)} MKN
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-purple-600 font-medium">
                  {formatNumber(inventoryStats?.byOwnership?.customer || 0)} Müşteri
                </span>
              </div>
              <Link
                href="/admin/inventory/items"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 inline-flex items-center gap-1"
              >
                Tümünü gör <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Toplam Değer
              </CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(inventoryStats?.totalValue)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-emerald-600 font-medium">
                  Stok değeri
                </span>
              </div>
              <Link
                href="/admin/inventory/reports"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 inline-flex items-center gap-1"
              >
                Rapor <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Düşük Stok
              </CardTitle>
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {formatNumber(inventoryStats?.lowStockItems)}
                </span>
                <span className="text-sm text-slate-500">ürün</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-red-600 font-medium">
                  {formatNumber(inventoryStats?.outOfStockItems || 0)} stokta yok
                </span>
              </div>
              <Link
                href="/admin/inventory/items?filter=low-stock"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 inline-flex items-center gap-1"
              >
                Kontrol et <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Warehouses */}
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Depolar
              </CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Warehouse className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {formatNumber(warehouses?.length)}
                </span>
                <span className="text-sm text-slate-500">depo</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-purple-600 font-medium">
                  {warehouses?.filter((w) => w.isActive).length || 0} aktif
                </span>
              </div>
              <Link
                href="/admin/inventory/warehouses"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 inline-flex items-center gap-1"
              >
                Yönet <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link href="/admin/inventory/inbound">
            <Card className="bg-white border-slate-200 hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 bg-green-50 rounded-xl">
                  <ArrowDownToLine className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Stok Girişi</span>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/inventory/outbound">
            <Card className="bg-white border-slate-200 hover:shadow-md hover:border-red-300 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 bg-red-50 rounded-xl">
                  <ArrowUpFromLine className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Stok Çıkışı</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/inventory/items">
            <Card className="bg-white border-slate-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Ürünler</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/inventory/transactions">
            <Card className="bg-white border-slate-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Hareketler</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/inventory/suppliers">
            <Card className="bg-white border-slate-200 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Tedarikçiler</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/inventory/migrate">
            <Card className="bg-white border-slate-200 hover:shadow-md hover:border-slate-400 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <Database className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Migration</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Distribution */}
          <Card className="lg:col-span-2 bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                Kategori Dağılımı
              </CardTitle>
              <CardDescription className="text-slate-500">
                Ürünlerin kategorilere göre dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(inventoryStats?.byCategory || {}).map(([category, count]) => {
                  const total = inventoryStats?.totalItems || 1;
                  const percentage = (count / total) * 100;

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-slate-700 font-medium">
                            {ITEM_CATEGORY_LABELS[category] || category}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2 bg-slate-100" />
                    </div>
                  );
                })}
                {Object.keys(inventoryStats?.byCategory || {}).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Henüz ürün bulunmuyor
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Clock className="h-5 w-5 text-slate-600" />
                Son Hareketler
              </CardTitle>
              <CardDescription className="text-slate-500">
                Son 10 stok hareketi
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                <div className="divide-y divide-slate-100">
                  {transactionStats?.recentTransactions?.length > 0 ? (
                    transactionStats.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${
                              transaction.type === TRANSACTION_TYPE.INBOUND
                                ? "bg-green-50"
                                : transaction.type === TRANSACTION_TYPE.OUTBOUND
                                ? "bg-red-50"
                                : "bg-slate-100"
                            }`}
                          >
                            {transaction.type === TRANSACTION_TYPE.INBOUND ? (
                              <ArrowDownToLine className="h-3.5 w-3.5 text-green-600" />
                            ) : transaction.type === TRANSACTION_TYPE.OUTBOUND ? (
                              <ArrowUpFromLine className="h-3.5 w-3.5 text-red-600" />
                            ) : (
                              <Activity className="h-3.5 w-3.5 text-slate-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {transaction.itemSnapshot?.name || "Ürün"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {transaction.quantity > 0 ? "+" : ""}
                              {transaction.quantity} {transaction.unit}
                            </p>
                          </div>
                          <div className="text-xs text-slate-400">
                            {transaction.createdAt?.seconds
                              ? formatDistanceToNow(
                                  new Date(transaction.createdAt.seconds * 1000),
                                  { addSuffix: true, locale: tr }
                                )
                              : "-"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      Henüz hareket yok
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Link href="/admin/inventory/transactions">
                    Tüm Hareketler
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems?.length > 0 && (
          <Card className="bg-white border-orange-200">
            <CardHeader className="border-b border-orange-100 bg-orange-50/50">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Düşük Stok Uyarısı
              </CardTitle>
              <CardDescription className="text-orange-600">
                Minimum stok seviyesinin altında olan ürünler
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/inventory/items/${item.id}`}
                    className="block"
                  >
                    <div className="p-4 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">{item.sku}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            item.stock?.quantity === 0
                              ? "border-red-300 text-red-700 bg-red-50"
                              : "border-orange-300 text-orange-700 bg-orange-50"
                          }`}
                        >
                          {item.stock?.quantity === 0 ? "Stokta yok" : "Düşük"}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Mevcut:</span>
                        <span className="font-semibold text-slate-900">
                          {item.stock?.quantity || 0}
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-500">Min:</span>
                        <span className="text-slate-700">
                          {item.stock?.minStockLevel || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {lowStockItems.length > 6 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Link href="/admin/inventory/items?filter=low-stock">
                      Tümünü Gör ({lowStockItems.length} ürün)
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transaction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inbound Summary */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle className="text-slate-900">Giriş Özeti</CardTitle>
                <CardDescription className="text-slate-500">
                  Toplam stok girişleri
                </CardDescription>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <ArrowDownToLine className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {formatNumber(transactionStats?.inboundCount)}
                </span>
                <span className="text-sm text-slate-500">işlem</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Toplam değer: {formatCurrency(transactionStats?.inboundValue)}
              </p>
            </CardContent>
          </Card>

          {/* Outbound Summary */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle className="text-slate-900">Çıkış Özeti</CardTitle>
                <CardDescription className="text-slate-500">
                  Toplam stok çıkışları
                </CardDescription>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <ArrowUpFromLine className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600">
                  {formatNumber(transactionStats?.outboundCount)}
                </span>
                <span className="text-sm text-slate-500">işlem</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Toplam değer: {formatCurrency(transactionStats?.outboundValue)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
