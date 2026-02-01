"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import {
  PermissionGuard,
  usePermissions,
} from "../../../components/admin-route-guard";
import {
  useDeliveries,
  useDeleteDelivery,
  useUpdateDelivery,
  useDeliveryStats,
} from "../../../hooks/use-delivery";
import {
  DELIVERY_TYPE,
  DELIVERY_STATUS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_STATUS_LABELS,
} from "../../../lib/services/delivery-service";
import DeliveryPDFExport from "../../../components/delivery-pdf-export";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useToast } from "../../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import {
  Plus,
  Search,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Loader2,
  RefreshCw,
  X,
  Truck,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Link as LinkIcon,
} from "lucide-react";

export default function DeliveriesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const { toast } = useToast();

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, delivery: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Hooks
  const { deliveries, loading, error, refresh } = useDeliveries({
    type: typeFilter === "all" ? "" : typeFilter,
    status: statusFilter === "all" ? "" : statusFilter,
  });
  const { stats, loading: statsLoading, refresh: refreshStats } = useDeliveryStats();
  const { deleteDelivery, loading: deleteLoading } = useDeleteDelivery();
  const { updateStatus } = useUpdateDelivery();

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    let result = [...deliveries];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.deliveryNumber?.toLowerCase().includes(term) ||
          d.companyInfo?.companyName?.toLowerCase().includes(term) ||
          d.companyInfo?.contactPerson?.toLowerCase().includes(term) ||
          d.linkedTransactionRef?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [deliveries, searchTerm]);

  // Paginated deliveries
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDeliveries.slice(start, start + itemsPerPage);
  }, [filteredDeliveries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshStats()]);
    setRefreshing(false);
    toast({ title: "Yenilendi", description: "Veriler güncellendi." });
  };

  // Status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const result = await updateStatus(id, newStatus);
      if (result.success) {
        toast({ title: "Başarılı", description: "Durum güncellendi." });
        refresh();
      } else {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Bir hata oluştu.", variant: "destructive" });
    }
  };

  // Delete operation
  const handleDelete = async () => {
    if (!deleteDialog.delivery) return;
    try {
      const result = await deleteDelivery(deleteDialog.delivery.id);
      if (result.success) {
        toast({ title: "Başarılı", description: "İrsaliye silindi." });
        refresh();
        setDeleteDialog({ open: false, delivery: null });
      } else {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Silme hatası.", variant: "destructive" });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || typeFilter !== "all" || statusFilter !== "all";
  const formatNumber = (value) => new Intl.NumberFormat("tr-TR").format(value || 0);

  const getStatusBadge = (status) => {
    const styles = {
      [DELIVERY_STATUS.PREPARED]: "bg-yellow-50 text-yellow-700 border-yellow-200",
      [DELIVERY_STATUS.IN_TRANSIT]: "bg-blue-50 text-blue-700 border-blue-200",
      [DELIVERY_STATUS.DELIVERED]: "bg-green-50 text-green-700 border-green-200",
      [DELIVERY_STATUS.RETURNED]: "bg-orange-50 text-orange-700 border-orange-200",
      [DELIVERY_STATUS.CANCELLED]: "bg-red-50 text-red-700 border-red-200",
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getTypeBadge = (type) => {
    return type === DELIVERY_TYPE.INBOUND
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-blue-50 text-blue-700 border-blue-200";
  };

  // Loading state
  if ((loading || authLoading) && !refreshing) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 bg-slate-200" />
            ))}
          </div>
          <Skeleton className="h-16 w-full bg-slate-200" />
          <Skeleton className="h-96 w-full bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredPermission="deliveries.view"
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Yetkisiz Erişim</h1>
            <p className="text-slate-600">Bu sayfayı görüntüleme yetkiniz yok.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">İrsaliyeler</h1>
              <p className="text-sm text-slate-600 mt-1">
                Toplam {formatNumber(filteredDeliveries.length)} irsaliye
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              {hasPermission("deliveries.create") && (
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/admin/deliveries/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni İrsaliye
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats Cards */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                      <p className="text-xs text-slate-500">Toplam</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{stats.inbound}</p>
                      <p className="text-xs text-slate-500">Giriş</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <ArrowUpFromLine className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{stats.outbound}</p>
                      <p className="text-xs text-slate-500">Çıkış</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{stats.inTransit}</p>
                      <p className="text-xs text-slate-500">Yolda</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                      <p className="text-xs text-slate-500">Teslim</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="İrsaliye no, firma veya işlem no ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px] border-slate-300">
                    <SelectValue placeholder="Tür" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    <SelectItem value={DELIVERY_TYPE.INBOUND}>Giriş İrsaliyesi</SelectItem>
                    <SelectItem value={DELIVERY_TYPE.OUTBOUND}>Çıkış İrsaliyesi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] border-slate-300">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value={DELIVERY_STATUS.PREPARED}>Hazırlandı</SelectItem>
                    <SelectItem value={DELIVERY_STATUS.IN_TRANSIT}>Yolda</SelectItem>
                    <SelectItem value={DELIVERY_STATUS.DELIVERED}>Teslim Edildi</SelectItem>
                    <SelectItem value={DELIVERY_STATUS.RETURNED}>İade</SelectItem>
                    <SelectItem value={DELIVERY_STATUS.CANCELLED}>İptal</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-600">
                    <X className="h-4 w-4 mr-1" />
                    Temizle
                  </Button>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-slate-600">Sayfa başına:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
                  >
                    <SelectTrigger className="w-[70px] border-slate-300">
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
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-0">
              {error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={refresh} variant="outline">Tekrar Dene</Button>
                </div>
              ) : filteredDeliveries.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">İrsaliye bulunamadı</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {hasActiveFilters ? "Filtre kriterlerine uygun irsaliye yok." : "Henüz irsaliye oluşturulmamış."}
                  </p>
                  {hasPermission("deliveries.create") && !hasActiveFilters && (
                    <Button asChild className="bg-slate-900 hover:bg-slate-800">
                      <Link href="/admin/deliveries/new">
                        <Plus className="h-4 w-4 mr-2" />
                        İlk İrsaliyeyi Oluştur
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-semibold text-slate-700">İrsaliye No</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tür</TableHead>
                        <TableHead className="font-semibold text-slate-700">Firma</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Ürün</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Miktar</TableHead>
                        <TableHead className="font-semibold text-slate-700">Durum</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tarih</TableHead>
                        <TableHead className="font-semibold text-slate-700">Bağlantı</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDeliveries.map((delivery) => (
                        <TableRow key={delivery.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <Link
                              href={`/admin/deliveries/${delivery.id}`}
                              className="font-medium text-slate-900 hover:text-blue-600"
                            >
                              {delivery.deliveryNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTypeBadge(delivery.type)}>
                              {delivery.type === DELIVERY_TYPE.INBOUND ? (
                                <ArrowDownToLine className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowUpFromLine className="h-3 w-3 mr-1" />
                              )}
                              {DELIVERY_TYPE_LABELS[delivery.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">
                                  {delivery.companyInfo?.companyName || "-"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {delivery.companyInfo?.contactPerson || "-"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium text-slate-900">
                              {delivery.totalItems || delivery.items?.length || 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium text-slate-900">
                              {formatNumber(delivery.totalQuantity || 0)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(delivery.status)}>
                              {DELIVERY_STATUS_LABELS[delivery.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {delivery.createdAt?.seconds
                              ? format(new Date(delivery.createdAt.seconds * 1000), "dd MMM yyyy", { locale: tr })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {delivery.linkedTransactionRef ? (
                              <Link
                                href={`/admin/inventory/transactions?search=${delivery.linkedTransactionRef}`}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <LinkIcon className="h-3 w-3" />
                                {delivery.linkedTransactionRef}
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/deliveries/${delivery.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Görüntüle
                                  </Link>
                                </DropdownMenuItem>

                                {hasPermission("deliveries.edit") && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/deliveries/${delivery.id}/edit`}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Düzenle
                                    </Link>
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DeliveryPDFExport
                                  delivery={delivery}
                                  fileName={`irsaliye-${delivery.deliveryNumber}.pdf`}
                                >
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF İndir
                                  </DropdownMenuItem>
                                </DeliveryPDFExport>

                                {hasPermission("deliveries.status_update") && (
                                  <>
                                    <DropdownMenuSeparator />
                                    {delivery.status === DELIVERY_STATUS.PREPARED && (
                                      <DropdownMenuItem
                                        onClick={() => handleStatusUpdate(delivery.id, DELIVERY_STATUS.IN_TRANSIT)}
                                      >
                                        <Truck className="h-4 w-4 mr-2" />
                                        Yola Çıkar
                                      </DropdownMenuItem>
                                    )}
                                    {delivery.status === DELIVERY_STATUS.IN_TRANSIT && (
                                      <DropdownMenuItem
                                        onClick={() => handleStatusUpdate(delivery.id, DELIVERY_STATUS.DELIVERED)}
                                      >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Teslim Edildi
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}

                                {hasPermission("deliveries.delete") && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setDeleteDialog({ open: true, delivery })}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Sil
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        {formatNumber((currentPage - 1) * itemsPerPage + 1)} -{" "}
                        {formatNumber(Math.min(currentPage * itemsPerPage, filteredDeliveries.length))}{" "}
                        / {formatNumber(filteredDeliveries.length)} irsaliye
                      </p>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="px-3 text-sm text-slate-600">{currentPage} / {totalPages}</span>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, delivery: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>İrsaliyeyi Sil</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <strong>{deleteDialog.delivery?.deliveryNumber}</strong> numaralı irsaliyeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLoading ? (
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
