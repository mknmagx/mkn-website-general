"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  useInventoryItems,
  useWarehouses,
  useInventoryOperations,
} from "../../../../hooks/use-inventory";
import {
  ITEM_CATEGORY,
  ITEM_CATEGORY_LABELS,
  OWNERSHIP_TYPE,
  OWNERSHIP_TYPE_LABELS,
  ITEM_STATUS,
  ITEM_STATUS_LABELS,
  UNIT_LABELS,
} from "../../../../lib/services/inventory-service";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "../../../../lib/utils";

// UI Components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

// PDF Export
import InventoryPDFExport from "../../../../components/inventory-pdf-export";

// Icons
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Package,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  AlertTriangle,
  Warehouse,
  X,
  FileDown,
} from "lucide-react";

// Cloudinary helper functions
const getCloudinaryUrl = (imageName, width = 80, height = 80) => {
  if (!imageName) return null;
  const nameWithoutExt = imageName.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_${width},h_${height},c_fill,g_center,f_auto,q_auto/v1751736117/mkngroup/${nameWithoutExt}`;
};

const getProductImageSrc = (imageName) => {
  if (!imageName) return null;
  return getCloudinaryUrl(imageName, 80, 80);
};

export default function InventoryItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  const { toast } = useToast();

  // URL'den parametreleri oku (her render'da güncel değer)
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "all";
  const urlOwnership = searchParams.get("ownership") || "all";
  const urlStatus = searchParams.get("status") || "active";
  const urlWarehouse = searchParams.get("warehouse") || "all";
  const urlStockFilter = searchParams.get("filter") || "all";

  // State - URL değerlerini kullan
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [ownershipFilter, setOwnershipFilter] = useState(urlOwnership);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [warehouseFilter, setWarehouseFilter] = useState(urlWarehouse);
  const [stockFilter, setStockFilter] = useState(urlStockFilter);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isInitialized, setIsInitialized] = useState(false);

  // URL değiştiğinde state'i güncelle (geri/ileri navigasyonu için)
  useEffect(() => {
    setCurrentPage(urlPage);
    setSearchTerm(urlSearch);
    setCategoryFilter(urlCategory);
    setOwnershipFilter(urlOwnership);
    setStatusFilter(urlStatus);
    setWarehouseFilter(urlWarehouse);
    setStockFilter(urlStockFilter);
    setIsInitialized(true);
  }, [urlPage, urlSearch, urlCategory, urlOwnership, urlStatus, urlWarehouse, urlStockFilter]);

  // Scroll restore - sayfa yüklendiğinde
  useEffect(() => {
    if (isInitialized) {
      const savedScroll = sessionStorage.getItem("inventory-items-scroll");
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
          sessionStorage.removeItem("inventory-items-scroll");
        }, 100);
      }
    }
  }, [isInitialized]);

  // URL'i güncelle fonksiyonu
  const updateURL = useCallback((updates) => {
    const params = new URLSearchParams();
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "active" && value !== "" && value !== "1") {
        params.set(key, value);
      }
    });
    
    // Status için özel durum
    if (updates.status && updates.status !== "active") {
      params.set("status", updates.status);
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/admin/inventory/items${newUrl}`, { scroll: false });
  }, [router]);

  // Data
  const { items: allItems, loading, refresh } = useInventoryItems({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { warehouses } = useWarehouses();
  const { deleteItem, loading: operationLoading } = useInventoryOperations();

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Ownership filter
    if (ownershipFilter !== "all") {
      result = result.filter((item) => item.ownership?.type === ownershipFilter);
    }

    // Warehouse filter
    if (warehouseFilter !== "all") {
      result = result.filter((item) => item.warehouseId === warehouseFilter);
    }

    // Stock filter
    if (stockFilter === "low-stock") {
      result = result.filter((item) => {
        const quantity = item.stock?.quantity || 0;
        const minStock = item.stock?.minStockLevel || 0;
        return minStock > 0 && quantity <= minStock && quantity > 0;
      });
    } else if (stockFilter === "out-of-stock") {
      result = result.filter((item) => (item.stock?.quantity || 0) === 0);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.sku?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.ownership?.companyName?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [allItems, categoryFilter, ownershipFilter, warehouseFilter, stockFilter, searchTerm]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // URL'i filtre değişikliklerinde güncelle
  useEffect(() => {
    updateURL({
      page: currentPage.toString(),
      search: searchTerm,
      category: categoryFilter,
      ownership: ownershipFilter,
      status: statusFilter,
      warehouse: warehouseFilter,
      filter: stockFilter,
    });
  }, [currentPage, searchTerm, categoryFilter, ownershipFilter, statusFilter, warehouseFilter, stockFilter]);

  // Filtre değişikliklerinde sayfayı sıfırla (ama URL güncelleme yukarıda yapılıyor)
  const handleFilterChange = useCallback((setter, value, resetPage = true) => {
    setter(value);
    if (resetPage) {
      setCurrentPage(1);
    }
  }, []);

  // Detay sayfasına gitmeden önce scroll pozisyonunu kaydet
  const saveScrollPosition = useCallback(() => {
    sessionStorage.setItem("inventory-items-scroll", window.scrollY.toString());
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;

    try {
      await deleteItem(deleteDialog.item.id);
      toast({
        title: "Başarılı",
        description: "Ürün silindi.",
      });
      refresh();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, item: null });
    }
  };

  const formatCurrency = (value, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("tr-TR").format(value || 0);
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setOwnershipFilter("all");
    setWarehouseFilter("all");
    setStockFilter("all");
    setSearchTerm("");
    setStatusFilter("active");
    setCurrentPage(1);
    // URL'i temizle
    router.replace("/admin/inventory/items", { scroll: false });
  };

  const hasActiveFilters =
    categoryFilter !== "all" ||
    ownershipFilter !== "all" ||
    warehouseFilter !== "all" ||
    stockFilter !== "all" ||
    searchTerm !== "" ||
    statusFilter !== "active";

  // Get selected warehouse name (must be before conditional return)
  const selectedWarehouse = useMemo(() => {
    if (warehouseFilter === "all") return null;
    return warehouses.find(w => w.id === warehouseFilter);
  }, [warehouseFilter, warehouses]);

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <Skeleton className="h-16 w-full bg-slate-200" />
          <Skeleton className="h-96 w-full bg-slate-200" />
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
            <h1 className="text-2xl font-bold text-slate-900">Stok Kalemleri</h1>
            <p className="text-sm text-slate-600 mt-1">
              Toplam {formatNumber(filteredItems.length)} ürün
              {selectedWarehouse && (
                <span className="text-blue-600 font-medium"> • {selectedWarehouse.name}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <InventoryPDFExport
              items={filteredItems}
              filters={{
                category: categoryFilter,
                ownership: ownershipFilter,
                search: searchTerm,
              }}
              warehouseName={selectedWarehouse?.name}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/admin/inventory/items/new">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Warehouse Filter Banner */}
      {selectedWarehouse && (
        <div className="bg-blue-50 border-b border-blue-100 px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                <strong>{selectedWarehouse.name}</strong> deposundaki ürünler gösteriliyor
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setWarehouseFilter("all");
                router.push("/admin/inventory/items");
              }}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              <X className="h-4 w-4 mr-1" />
              Filtreyi Kaldır
            </Button>
          </div>
        </div>
      )}

      <div className="p-8 space-y-6">
        {/* Filters */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ürün adı, SKU veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={(v) => handleFilterChange(setCategoryFilter, v)}>
                <SelectTrigger className="w-[160px] border-slate-300">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {Object.entries(ITEM_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Ownership Filter */}
              <Select value={ownershipFilter} onValueChange={(v) => handleFilterChange(setOwnershipFilter, v)}>
                <SelectTrigger className="w-[140px] border-slate-300">
                  <SelectValue placeholder="Sahiplik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sahiplik</SelectItem>
                  {Object.entries(OWNERSHIP_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Warehouse Filter */}
              <Select value={warehouseFilter} onValueChange={(v) => handleFilterChange(setWarehouseFilter, v)}>
                <SelectTrigger className="w-[140px] border-slate-300">
                  <SelectValue placeholder="Depo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Depolar</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Stock Filter */}
              <Select value={stockFilter} onValueChange={(v) => handleFilterChange(setStockFilter, v)}>
                <SelectTrigger className="w-[150px] border-slate-300">
                  <SelectValue placeholder="Stok Durumu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Stoklar</SelectItem>
                  <SelectItem value="low-stock">Düşük Stok</SelectItem>
                  <SelectItem value="out-of-stock">Stokta Yok</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(v) => handleFilterChange(setStatusFilter, v)}>
                <SelectTrigger className="w-[130px] border-slate-300">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {Object.entries(ITEM_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Temizle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50">
                  <TableHead className="text-slate-700 font-semibold w-[30%]">Ürün</TableHead>
                  <TableHead className="text-slate-700 font-semibold w-[10%]">SKU</TableHead>
                  <TableHead className="text-slate-700 font-semibold w-[10%]">Kategori</TableHead>
                  <TableHead className="text-slate-700 font-semibold w-[10%]">Sahiplik</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-right w-[12%]">Stok</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-right w-[12%]">Değer</TableHead>
                  <TableHead className="text-slate-700 font-semibold w-[10%]">Depo</TableHead>
                  <TableHead className="text-slate-700 font-semibold w-[6%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => {
                    const quantity = item.stock?.quantity || 0;
                    const minStock = item.stock?.minStockLevel || 0;
                    const isLowStock = minStock > 0 && quantity <= minStock && quantity > 0;
                    const isOutOfStock = quantity === 0;
                    const warehouse = warehouses.find((w) => w.id === item.warehouseId);

                    return (
                      <TableRow
                        key={item.id}
                        className="border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.images && item.images.length > 0 ? (
                                <Image
                                  src={getProductImageSrc(item.images[0])}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={cn(
                                  "w-full h-full items-center justify-center",
                                  item.images && item.images.length > 0 ? "hidden" : "flex"
                                )}
                              >
                                <Package className="h-5 w-5 text-slate-400" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <Link 
                                href={`/admin/inventory/items/${item.id}`}
                                onClick={saveScrollPosition}
                                className="font-medium text-slate-900 hover:text-blue-600 hover:underline transition-colors cursor-pointer block truncate"
                              >
                                {item.name}
                              </Link>
                              {item.specifications?.size && (
                                <p className="text-xs text-slate-500">
                                  {item.specifications.size}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {item.sku}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-300 text-slate-700 text-xs">
                            {ITEM_CATEGORY_LABELS[item.category] || item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.ownership?.type === OWNERSHIP_TYPE.MKN ? (
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                MKN
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-purple-500" />
                                <span className="text-sm text-slate-700">
                                  {item.ownership?.companyName || "Müşteri"}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(isLowStock || isOutOfStock) && (
                              <AlertTriangle
                                className={cn(
                                  "h-4 w-4",
                                  isOutOfStock ? "text-red-500" : "text-orange-500"
                                )}
                              />
                            )}
                            <span
                              className={cn(
                                "font-semibold",
                                isOutOfStock
                                  ? "text-red-600"
                                  : isLowStock
                                  ? "text-orange-600"
                                  : "text-slate-900"
                              )}
                            >
                              {formatNumber(quantity)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {UNIT_LABELS[item.stock?.unit] || item.stock?.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-slate-700">
                            {formatCurrency(
                              quantity * (item.pricing?.costPrice || 0),
                              item.pricing?.currency
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Warehouse className="h-3 w-3" />
                            {warehouse?.name || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/inventory/items/${item.id}`} onClick={saveScrollPosition}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detay
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/inventory/items/${item.id}/edit`} onClick={saveScrollPosition}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Düzenle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/inventory/inbound?itemId=${item.id}`}>
                                  <ArrowDownToLine className="h-4 w-4 mr-2 text-green-600" />
                                  Giriş Yap
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/inventory/outbound?itemId=${item.id}`}>
                                  <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-600" />
                                  Çıkış Yap
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteDialog({ open: true, item })}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                      {hasActiveFilters
                        ? "Filtrelere uygun ürün bulunamadı."
                        : "Henüz ürün eklenmemiş."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Sayfa başına:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(v) => {
                    setItemsPerPage(Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-slate-300"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 border-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 border-slate-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 border-slate-300"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-slate-600">
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredItems.length)} /{" "}
                {filteredItems.length}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, item: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-600">Ürünü Pasif Yap</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>{deleteDialog.item?.name}</strong> ürününü pasif yapmak istediğinize emin
                  misiniz?
                </p>
                <p className="text-slate-600">
                  Bu işlem ürünü "Üretimden Kalktı" durumuna çevirecektir. Stok hareketleri korunacaktır.
                </p>
                <p className="text-sm text-slate-500">
                  Kalıcı silme için ürün detay sayfasını kullanın.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Pasif Yap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
