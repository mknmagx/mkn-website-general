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
  CardDescription,
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
  DialogFooter,
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
  CheckCircle,
  XCircle,
  Send,
  Clock,
  BarChart3,
  Users,
  AlertCircle,
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

  // Durum renkleri ve ikonları
  const getStatusConfig = (status) => {
    switch (status) {
      case PROFORMA_STATUS.DRAFT:
        return {
          variant: "secondary",
          icon: "📝",
          color: "gray",
          gradient: "from-gray-500 to-gray-600",
        };
      case PROFORMA_STATUS.SENT:
        return {
          variant: "default",
          icon: "📤",
          color: "blue",
          gradient: "from-blue-500 to-blue-600",
        };
      case PROFORMA_STATUS.ACCEPTED:
        return {
          variant: "success",
          icon: "✅",
          color: "green",
          gradient: "from-green-500 to-green-600",
        };
      case PROFORMA_STATUS.REJECTED:
        return {
          variant: "destructive",
          icon: "❌",
          color: "red",
          gradient: "from-red-500 to-red-600",
        };
      case PROFORMA_STATUS.EXPIRED:
        return {
          variant: "outline",
          icon: "⏰",
          color: "orange",
          gradient: "from-orange-500 to-orange-600",
        };
      default:
        return {
          variant: "secondary",
          icon: "📄",
          color: "gray",
          gradient: "from-gray-500 to-gray-600",
        };
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
    setLoadingPdfIds((prev) => new Set([...prev, proformaId]));
  };

  const handlePdfLoadingEnd = (proformaId) => {
    setLoadingPdfIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(proformaId);
      return newSet;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Proforma listesi yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredPermission="proformas.view"
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
          <div className="flex items-center justify-center h-screen">
            <Card className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 border-none shadow-lg">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-2">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Erişim Engellendi
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Proforma listesini görüntülemek için gerekli izinlere sahip
                  değilsiniz.
                </p>
                <Button
                  onClick={() => router.push("/admin")}
                  variant="outline"
                  className="mt-4"
                >
                  Ana Sayfaya Dön
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        {/* Modern Sticky Header */}
        <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-2 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Proforma Yönetimi
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fiyat tekliflerinizi görüntüleyin ve yönetin
                  </p>
                </div>
              </div>
              {hasPermission("proformas.create") && (
                <Button
                  onClick={() => router.push("/admin/proformas/new")}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Proforma
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Toplam Proforma */}
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-600/20 dark:to-blue-700/20 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Toplam Proforma
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {statsLoading ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          stats.total
                        )}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Tüm Kayıtlar
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-3 shadow-md">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Kabul Edilen */}
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-600/20 dark:to-green-700/20 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Kabul Edilen
                      </p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {statsLoading ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          stats.accepted
                        )}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600 dark:text-green-400 border-green-600/30"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Onaylandı
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-3 shadow-md">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Toplam Değer */}
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-600/20 dark:to-purple-700/20 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Toplam Değer
                      </p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {statsLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          formatPrice(stats.totalValue)
                        )}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs text-purple-600 dark:text-purple-400 border-purple-600/30"
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Tüm Teklifler
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-3 shadow-md">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Kazanılan Değer */}
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-600/20 dark:to-emerald-700/20 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Kazanılan Değer
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {statsLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          formatPrice(stats.acceptedValue)
                        )}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-600/30"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Onaylı Teklifler
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-lg p-3 shadow-md">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Filtreler */}
          <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg p-2 shadow-md">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Filtrele ve Ara
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Proformaları filtreleyerek arayın
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      placeholder="Proforma no, firma adı veya yetkili kişi ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 h-11"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 h-11">
                      <SelectValue placeholder="Durum filtresi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <span>📋</span>
                          <span>Tüm Durumlar</span>
                        </div>
                      </SelectItem>
                      {Object.entries(PROFORMA_STATUS_LABELS).map(
                        ([status, label]) => {
                          const config = getStatusConfig(status);
                          return (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <span>{config.icon}</span>
                                <span>{label}</span>
                              </div>
                            </SelectItem>
                          );
                        }
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="md:w-auto"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Temizle
                  </Button>
                )}
              </div>
              {(searchTerm || statusFilter !== "all") && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    {filteredProformas.length}
                  </span>
                  <span>sonuç bulundu</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proforma Listesi */}
          <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg p-2 shadow-md">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Proforma Listesi
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {filteredProformas.length} proforma gösteriliyor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Proformalar yükleniyor...
                  </p>
                </div>
              ) : filteredProformas.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
                    <FileText className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {searchTerm || statusFilter !== "all"
                        ? "Sonuç Bulunamadı"
                        : "Henüz Proforma Yok"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm || statusFilter !== "all"
                        ? "Arama kriterlerinize uygun proforma bulunamadı. Filtreleri değiştirerek tekrar deneyin."
                        : "Henüz proforma oluşturulmamış. Yeni proforma oluşturmak için yukarıdaki butona tıklayın."}
                    </p>
                  </div>
                  {hasPermission("proformas.create") &&
                    !searchTerm &&
                    statusFilter === "all" && (
                      <Button
                        onClick={() => router.push("/admin/proformas/new")}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        İlk Proformayı Oluştur
                      </Button>
                    )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableHead className="font-bold text-gray-900 dark:text-white">
                          Proforma No
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">
                          Müşteri Bilgileri
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">
                          Tarih
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">
                          Durum
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-900 dark:text-white">
                          Tutar
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-900 dark:text-white">
                          İşlemler
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProformas.map((proforma) => {
                        const statusConfig = getStatusConfig(proforma.status);
                        return (
                          <TableRow
                            key={proforma.id}
                            className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/admin/proformas/${proforma.id}`)
                            }
                          >
                            <TableCell className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                              {proforma.proformaNumber}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {proforma.customerInfo?.companyName}
                                  </p>
                                </div>
                                {proforma.customerInfo?.contactPerson && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {proforma.customerInfo?.contactPerson}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <span className="text-gray-900 dark:text-white">
                                  {format(
                                    new Date(
                                      proforma.createdAt?.seconds * 1000 ||
                                        Date.now()
                                    ),
                                    "dd MMM yyyy",
                                    { locale: tr }
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Badge
                                variant={statusConfig.variant}
                                className="font-medium"
                              >
                                <span className="mr-1">
                                  {statusConfig.icon}
                                </span>
                                {getProformaStatusLabel(proforma.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-bold text-lg text-gray-900 dark:text-white">
                                {formatPrice(
                                  proforma.grandTotal ||
                                    proforma.totalAmount ||
                                    0,
                                  proforma.currency
                                )}
                              </div>
                            </TableCell>
                            <TableCell
                              className="text-right"
                              onClick={(e) => e.stopPropagation()}
                            ></TableCell>
                            <TableCell
                              className="text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                  >
                                    <MoreVertical className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-56"
                                >
                                  <DropdownMenuLabel className="font-bold">
                                    İşlemler
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/proformas/${proforma.id}`
                                      )
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                    Görüntüle
                                  </DropdownMenuItem>

                                  {hasPermission("proformas.edit") && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/admin/proformas/${proforma.id}/edit`
                                        )
                                      }
                                      className="cursor-pointer"
                                    >
                                      <Edit className="h-4 w-4 mr-2 text-orange-600" />
                                      Düzenle
                                    </DropdownMenuItem>
                                  )}

                                  {/* Durum Değiştirme */}
                                  {hasPermission("proformas.status_update") && (
                                    <>
                                      <DropdownMenuSeparator />
                                      {proforma.status ===
                                        PROFORMA_STATUS.DRAFT && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStatusUpdate(
                                              proforma.id,
                                              PROFORMA_STATUS.SENT
                                            )
                                          }
                                          className="cursor-pointer"
                                        >
                                          <Send className="h-4 w-4 mr-2 text-blue-600" />
                                          Gönderildi Olarak İşaretle
                                        </DropdownMenuItem>
                                      )}

                                      {proforma.status ===
                                        PROFORMA_STATUS.SENT && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleStatusUpdate(
                                                proforma.id,
                                                PROFORMA_STATUS.ACCEPTED
                                              )
                                            }
                                            className="cursor-pointer"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                            Kabul Edildi
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleStatusUpdate(
                                                proforma.id,
                                                PROFORMA_STATUS.REJECTED
                                              )
                                            }
                                            className="cursor-pointer"
                                          >
                                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                            Reddedildi
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </>
                                  )}

                                  <DropdownMenuSeparator />

                                  {/* PDF İşlemleri */}
                                  <div className="px-2 py-1.5">
                                    <ProformaPDFExport
                                      proforma={proforma}
                                      fileName={`${proforma.proformaNumber}.pdf`}
                                      onLoadingStart={() =>
                                        handlePdfLoadingStart(proforma.id)
                                      }
                                      onLoadingEnd={() =>
                                        handlePdfLoadingEnd(proforma.id)
                                      }
                                    >
                                      <div className="flex items-center text-sm cursor-pointer hover:text-blue-600 transition-colors">
                                        {loadingPdfIds.has(proforma.id) ? (
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            PDF Oluşturuluyor...
                                          </>
                                        ) : (
                                          <>
                                            <Download className="h-4 w-4 mr-2 text-purple-600" />
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
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Silme Onay Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-2">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Proforma Sil
                  </DialogTitle>
                </div>
                <div className="space-y-3 pt-2">
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">
                      {selectedProforma?.proformaNumber}
                    </strong>{" "}
                    numaralı proformayı silmek istediğinizden emin misiniz?
                  </DialogDescription>
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      ⚠️ Bu işlem geri alınamaz ve tüm proforma verileri kalıcı
                      olarak silinecektir.
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleteLoading}
                  className="flex-1 sm:flex-none"
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </>
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
