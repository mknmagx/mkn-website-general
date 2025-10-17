"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import {
  PermissionGuard,
  usePermissions,
} from "../../../components/admin-route-guard";
import {
  useProformas,
  useDeleteProforma,
  useUpdateProforma,
  useProformaStats,
} from "../../../hooks/use-proforma";
import {
  PROFORMA_STATUS,
  PROFORMA_STATUS_LABELS,
  formatPrice,
  getProformaStatusLabel,
} from "../../../lib/services/proforma-service";
import ProformaPDFExport from "../../../components/proforma-pdf-export";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  MoreVertical,
  TrendingUp,
  DollarSign,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function ProformasPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const { toast } = useToast();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loadingPdfIds, setLoadingPdfIds] = useState(new Set());

  // Hooks
  const { proformas, loading, error, refresh } = useProformas({
    status: statusFilter === "all" ? "" : statusFilter,
  });
  const { stats, loading: statsLoading } = useProformaStats();
  const { deleteProforma, loading: deleteLoading } = useDeleteProforma();
  const { updateStatus } = useUpdateProforma();

  // Filtrelenmiş proformalar
  const filteredProformas = proformas.filter((proforma) => {
    const matchesSearch =
      proforma.proformaNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proforma.customerInfo?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proforma.customerInfo?.contactPerson
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Durum renkleri
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case PROFORMA_STATUS.DRAFT:
        return "secondary";
      case PROFORMA_STATUS.SENT:
        return "default";
      case PROFORMA_STATUS.ACCEPTED:
        return "success";
      case PROFORMA_STATUS.REJECTED:
        return "destructive";
      case PROFORMA_STATUS.EXPIRED:
        return "outline";
      default:
        return "secondary";
    }
  };

  // Durum güncelleme
  const handleStatusUpdate = async (proformaId, newStatus) => {
    try {
      const result = await updateStatus(proformaId, newStatus);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Proforma durumu güncellendi",
        });
        refresh();
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Proforma silme
  const handleDelete = async () => {
    if (!selectedProforma) return;

    try {
      const result = await deleteProforma(selectedProforma.id);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Proforma silindi",
        });
        refresh();
        setShowDeleteDialog(false);
        setSelectedProforma(null);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // PDF loading durumu yönetimi
  const handlePdfLoadingStart = (proformaId) => {
    setLoadingPdfIds(prev => new Set([...prev, proformaId]));
  };

  const handlePdfLoadingEnd = (proformaId) => {
    setLoadingPdfIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(proformaId);
      return newSet;
    });
  };

  if (authLoading) return <div>Yükleniyor...</div>;

  return (
    <PermissionGuard
      requiredPermission="proformas.view"
      fallback={
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Erişim Engellendi
              </h1>
              <p className="text-gray-600">
                Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                Proforma Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">
                Fiyat tekliflerinizi görüntüleyin, düzenleyin ve yönetin
              </p>
            </div>
            {hasPermission("proformas.create") && (
              <Button onClick={() => router.push("/admin/proformas/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Proforma
              </Button>
            )}
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Proforma</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats.total}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kabul Edilen</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statsLoading ? "..." : stats.accepted}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Toplam Değer</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {statsLoading ? "..." : formatPrice(stats.totalValue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kazanılan Değer</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statsLoading ? "..." : formatPrice(stats.acceptedValue)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtreler */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Proforma no, firma adı veya kişi ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum filtresi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      {Object.entries(PROFORMA_STATUS_LABELS).map(
                        ([status, label]) => (
                          <SelectItem key={status} value={status}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proforma Listesi */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    Proformalar yükleniyor...
                  </p>
                </div>
              ) : filteredProformas.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {searchTerm || statusFilter
                      ? "Kriterlere uygun proforma bulunamadı"
                      : "Henüz proforma oluşturulmamış"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proforma No</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProformas.map((proforma) => (
                      <TableRow key={proforma.id}>
                        <TableCell className="font-medium">
                          {proforma.proformaNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {proforma.customerInfo?.companyName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {proforma.customerInfo?.contactPerson}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(
                              proforma.createdAt?.seconds * 1000 || Date.now()
                            ),
                            "dd MMM yyyy",
                            { locale: tr }
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(proforma.status)}
                          >
                            {getProformaStatusLabel(proforma.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(
                            proforma.totalAmount || 0,
                            proforma.currency
                          )}
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
                                  router.push(`/admin/proformas/${proforma.id}`)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Görüntüle
                              </DropdownMenuItem>

                              {hasPermission("proformas.edit") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/admin/proformas/${proforma.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Düzenle
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {/* Durum Değiştirme */}
                              {hasPermission("proformas.status_update") && (
                                <>
                                  {proforma.status ===
                                    PROFORMA_STATUS.DRAFT && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(
                                          proforma.id,
                                          PROFORMA_STATUS.SENT
                                        )
                                      }
                                    >
                                      Gönderildi Olarak İşaretle
                                    </DropdownMenuItem>
                                  )}

                                  {proforma.status === PROFORMA_STATUS.SENT && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusUpdate(
                                            proforma.id,
                                            PROFORMA_STATUS.ACCEPTED
                                          )
                                        }
                                      >
                                        Kabul Edildi
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStatusUpdate(
                                            proforma.id,
                                            PROFORMA_STATUS.REJECTED
                                          )
                                        }
                                      >
                                        Reddedildi
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </>
                              )}

                              <DropdownMenuSeparator />

                              {/* PDF İşlemleri */}
                              <div className="px-2 py-1">
                                <ProformaPDFExport
                                  proforma={proforma}
                                  fileName={`${proforma.proformaNumber}.pdf`}
                                  onLoadingStart={() => handlePdfLoadingStart(proforma.id)}
                                  onLoadingEnd={() => handlePdfLoadingEnd(proforma.id)}
                                >
                                  <div className="flex items-center text-sm cursor-pointer hover:text-blue-600">
                                    {loadingPdfIds.has(proforma.id) ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        PDF Oluşturuluyor...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="h-4 w-4 mr-2" />
                                        PDF İndir
                                      </>
                                    )}
                                  </div>
                                </ProformaPDFExport>
                              </div>

                              {hasPermission("proformas.delete") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedProforma(proforma);
                                      setShowDeleteDialog(true);
                                    }}
                                    className="text-red-600"
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
              )}
            </CardContent>
          </Card>

          {/* Silme Onay Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Proforma Sil</DialogTitle>
                <DialogDescription>
                  <strong>{selectedProforma?.proformaNumber}</strong> numaralı
                  proformayı silmek istediğinizden emin misiniz? Bu işlem geri
                  alınamaz.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleteLoading}
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Siliniyor..." : "Sil"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PermissionGuard>
  );
}
