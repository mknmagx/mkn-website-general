"use client";

import { useState, useEffect } from "react";
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
  getDeliveryTypeLabel,
  getDeliveryStatusLabel,
  getStatusColor,
  getTypeColor,
} from "../../../lib/services/delivery-service";
import DeliveryPDFExport from "../../../components/delivery-pdf-export";
import DeliveryService from "../../../lib/services/delivery-service";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Plus,
  Search,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function DeliveriesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const { toast } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loadingPdfIds, setLoadingPdfIds] = useState(new Set());

  // Hooks
  const { deliveries, loading, error, refresh } = useDeliveries({
    type: typeFilter === "all" ? "" : typeFilter,
    status: statusFilter === "all" ? "" : statusFilter,
  });
  const { stats, loading: statsLoading } = useDeliveryStats();
  const { deleteDelivery, loading: deleteLoading } = useDeleteDelivery();
  const { updateStatus } = useUpdateDelivery();

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.deliveryNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      delivery.companyInfo?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      delivery.companyInfo?.contactPerson
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Status badge variants
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case DELIVERY_STATUS.PREPARED:
        return "secondary";
      case DELIVERY_STATUS.IN_TRANSIT:
        return "default";
      case DELIVERY_STATUS.DELIVERED:
        return "success";
      case DELIVERY_STATUS.RETURNED:
        return "destructive";
      case DELIVERY_STATUS.CANCELLED:
        return "outline";
      default:
        return "secondary";
    }
  };

  // Status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const result = await updateStatus(id, newStatus);
      if (result.success) {
        toast({
          title: "Başarılı",
          description: "İrsaliye durumu güncellendi",
        });
        refresh();
      } else {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Delete operation
  const handleDelete = async () => {
    if (!selectedDelivery) return;

    try {
      const result = await deleteDelivery(selectedDelivery.id);
      if (result.success) {
        toast({
          title: "Başarılı",
          description: "İrsaliye silindi",
        });
        refresh();
        setShowDeleteDialog(false);
        setSelectedDelivery(null);
      } else {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İrsaliye silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // PDF loading handlers
  const handlePdfLoadingStart = (id) => {
    setLoadingPdfIds((prev) => new Set(prev).add(id));
  };

  const handlePdfLoadingEnd = (id) => {
    setLoadingPdfIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredPermission="deliveries.view"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Yetkisiz Erişim
            </h1>
            <p className="text-gray-600">
              İrsaliyeleri görüntülemek için gerekli izinlere sahip değilsiniz.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-8 w-8 text-blue-600" />
                İrsaliyeler
              </h1>
              <p className="text-gray-600 mt-1">
                Giriş ve çıkış irsaliyelerini yönetin
              </p>
            </div>

            {hasPermission("deliveries.create") && (
              <Button
                onClick={() => router.push("/admin/deliveries/new")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Yeni İrsaliye
              </Button>
            )}
          </div>

          {/* Statistics */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Toplam İrsaliye
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingDown className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Giriş İrsaliyesi
                      </p>
                      <p className="text-2xl font-bold">{stats.inbound}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Çıkış İrsaliyesi
                      </p>
                      <p className="text-2xl font-bold">{stats.outbound}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Yolda</p>
                      <p className="text-2xl font-bold">{stats.inTransit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Teslim Edildi
                      </p>
                      <p className="text-2xl font-bold">{stats.delivered}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="İrsaliye numarası, firma adı veya kişi adı ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="İrsaliye Türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    <SelectItem value={DELIVERY_TYPE.INBOUND}>
                      Giriş İrsaliyesi
                    </SelectItem>
                    <SelectItem value={DELIVERY_TYPE.OUTBOUND}>
                      Çıkış İrsaliyesi
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value={DELIVERY_STATUS.PREPARED}>
                      Hazırlandı
                    </SelectItem>
                    <SelectItem value={DELIVERY_STATUS.IN_TRANSIT}>
                      Yolda
                    </SelectItem>
                    <SelectItem value={DELIVERY_STATUS.DELIVERED}>
                      Teslim Edildi
                    </SelectItem>
                    <SelectItem value={DELIVERY_STATUS.RETURNED}>
                      İade
                    </SelectItem>
                    <SelectItem value={DELIVERY_STATUS.CANCELLED}>
                      İptal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Delivery List */}
          <Card>
            <CardHeader>
              <CardTitle>İrsaliyeler</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Hata: {error}</p>
                  <Button onClick={refresh} variant="outline">
                    Tekrar Dene
                  </Button>
                </div>
              ) : filteredDeliveries.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    İrsaliye bulunamadı
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Henüz hiç irsaliye oluşturulmamış veya arama kriterlerinize
                    uygun irsaliye bulunamadı.
                  </p>
                  {hasPermission("deliveries.create") && (
                    <Button
                      onClick={() => router.push("/admin/deliveries/new")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      İlk İrsaliyeyi Oluştur
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İrsaliye No</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Firma</TableHead>
                      <TableHead>Ürün Sayısı</TableHead>
                      <TableHead>Toplam Miktar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">
                          {delivery.deliveryNumber}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getTypeColor(delivery.type)}`}>
                            {getDeliveryTypeLabel(delivery.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {delivery.companyInfo?.companyName || "-"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {delivery.companyInfo?.contactPerson || "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {delivery.totalItems ||
                            (delivery.items ? delivery.items.length : 0)}{" "}
                          ürün
                        </TableCell>
                        <TableCell>
                          {delivery.totalQuantity ||
                            (delivery.items
                              ? delivery.items.reduce(
                                  (total, item) =>
                                    total + (Number(item.quantity) || 0),
                                  0
                                )
                              : 0)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(delivery.status)}
                          >
                            {getDeliveryStatusLabel(delivery.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {delivery.createdAt
                            ? new Date(
                                delivery.createdAt.seconds * 1000
                              ).toLocaleDateString("tr-TR")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/admin/deliveries/${delivery.id}`
                                  )
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Görüntüle
                              </DropdownMenuItem>

                              {hasPermission("deliveries.edit") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/admin/deliveries/${delivery.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Düzenle
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DeliveryPDFExport
                                delivery={delivery}
                                fileName={`irsaliye-${delivery.deliveryNumber}.pdf`}
                                onLoadingStart={() =>
                                  handlePdfLoadingStart(delivery.id)
                                }
                                onLoadingEnd={() =>
                                  handlePdfLoadingEnd(delivery.id)
                                }
                              >
                                <DropdownMenuItem>
                                  {loadingPdfIds.has(delivery.id) ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      PDF Hazırlanıyor...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-4 w-4 mr-2" />
                                      PDF İndir
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DeliveryPDFExport>

                              <DropdownMenuSeparator />
                              {hasPermission("deliveries.status_update") && (
                                <>
                                  {delivery.status ===
                                    DELIVERY_STATUS.PREPARED && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          delivery.id,
                                          DELIVERY_STATUS.IN_TRANSIT
                                        )
                                      }
                                    >
                                      Yolda Olarak İşaretle
                                    </DropdownMenuItem>
                                  )}

                                  {delivery.status ===
                                    DELIVERY_STATUS.IN_TRANSIT && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          delivery.id,
                                          DELIVERY_STATUS.DELIVERED
                                        )
                                      }
                                    >
                                      Teslim Edildi Olarak İşaretle
                                    </DropdownMenuItem>
                                  )}

                                  {(delivery.status ===
                                    DELIVERY_STATUS.IN_TRANSIT ||
                                    delivery.status ===
                                      DELIVERY_STATUS.DELIVERED) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          delivery.id,
                                          DELIVERY_STATUS.RETURNED
                                        )
                                      }
                                    >
                                      İade Olarak İşaretle
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {hasPermission("deliveries.delete") && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Sil
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>İrsaliye Sil</DialogTitle>
                <DialogDescription>
                  "{selectedDelivery?.deliveryNumber}" numaralı irsaliyeyi
                  silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    "Sil"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PermissionGuard>
  );
}
