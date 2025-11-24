"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRequests, useRequestStats } from "../../../hooks/use-requests";
import { useCompanies } from "../../../hooks/use-company";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useToast } from "../../../hooks/use-toast";
import {
  usePermissions,
  PermissionGuard,
} from "../../../components/admin-route-guard";
import {
  REQUEST_STATUS,
  REQUEST_CATEGORIES,
  REQUEST_PRIORITY,
  getRequestCategoryLabel,
  getRequestStatusLabel,
  getRequestPriorityLabel,
  getCategoryColor,
  getCategoryIcon,
  RequestService,
} from "../../../lib/services/request-service";
import { USER_ROLES } from "../../../lib/services/admin-user-service";

// UI Components
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

// Icons
import {
  MessageSquareText,
  Plus,
  Search,
  Eye,
  Edit3,
  Clock,
  AlertCircle,
  CheckCircle,
  Building2,
  Calendar,
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  Droplets,
  Pill,
  SprayCanIcon as SprayCan,
  Package,
  ShoppingCart,
  TrendingUp,
  FlaskConical,
  Users,
  Star,
  Zap,
  Loader2,
  Trash2,
} from "lucide-react";

export default function RequestsPage() {
  const { hasPermission } = usePermissions();
  const { user: currentUser } = useAdminAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Data hooks
  const { stats, loading: statsLoading } = useRequestStats();

  // Build filter options for requests - memoized to prevent unnecessary re-renders
  const requestOptions = useMemo(
    () => ({
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(categoryFilter !== "all" && { category: categoryFilter }),
      ...(priorityFilter !== "all" && { priority: priorityFilter }),
      ...(searchTerm && { searchTerm }),
      limitCount: 100,
    }),
    [statusFilter, categoryFilter, priorityFilter, searchTerm]
  );

  const {
    requests,
    loading: requestsLoading,
    refreshRequests,
  } = useRequests(requestOptions);

  // Permissions
  const canView = hasPermission("requests.view") || hasPermission("admin.all");
  const canCreate =
    hasPermission("requests.create") || hasPermission("admin.all");
  const canEdit = hasPermission("requests.edit") || hasPermission("admin.all");
  const canDelete =
    hasPermission("requests.delete") || hasPermission("admin.all");

  // All filters are now applied in useRequests hook
  const filteredRequests = requests;

  // Talep silme fonksiyonu - sadece super_admin
  const handleDeleteRequest = async (requestId) => {
    if (
      !confirm(
        "Bu talebi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      )
    ) {
      return;
    }

    try {
      const result = await RequestService.deleteRequest(requestId);

      if (!result.success) {
        throw new Error(result.error || "Talep silinemedi");
      }

      toast({
        title: "Başarılı",
        description: "Talep başarıyla silindi.",
      });

      refreshRequests();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Talep silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Sadece super_admin silme yetkisine sahip
  const canDeleteRequest = () => {
    return currentUser?.role === USER_ROLES.SUPER_ADMIN;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case REQUEST_STATUS.NEW:
        return "bg-sky-100 text-sky-700 border-sky-300";
      case REQUEST_STATUS.ASSIGNED:
        return "bg-violet-100 text-violet-700 border-violet-300";
      case REQUEST_STATUS.IN_PROGRESS:
        return "bg-amber-100 text-amber-700 border-amber-300";
      case REQUEST_STATUS.WAITING_CLIENT:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case REQUEST_STATUS.QUOTATION_SENT:
        return "bg-indigo-100 text-indigo-700 border-indigo-300";
      case REQUEST_STATUS.APPROVED:
        return "bg-green-100 text-green-700 border-green-300";
      case REQUEST_STATUS.REJECTED:
        return "bg-red-100 text-red-700 border-red-300";
      case REQUEST_STATUS.COMPLETED:
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case REQUEST_STATUS.CANCELLED:
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case REQUEST_PRIORITY.LOW:
        return "bg-slate-100 text-slate-600 border-slate-300";
      case REQUEST_PRIORITY.NORMAL:
        return "bg-blue-100 text-blue-700 border-blue-300";
      case REQUEST_PRIORITY.HIGH:
        return "bg-orange-100 text-orange-700 border-orange-300";
      case REQUEST_PRIORITY.URGENT:
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-300";
    }
  };

  // Kategori ikonunu getir
  const getCategoryIconComponent = (category) => {
    const iconMap = {
      cosmetic_manufacturing: Droplets,
      supplement_manufacturing: Pill,
      cleaning_manufacturing: SprayCan,
      packaging_supply: Package,
      ecommerce_operations: ShoppingCart,
      digital_marketing: TrendingUp,
      formulation_development: FlaskConical,
      consultation: Users,
    };
    const IconComponent = iconMap[category] || MessageSquareText;
    return <IconComponent className="h-4 w-4" />;
  };

  // Öncelik ikonu getir
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case REQUEST_PRIORITY.URGENT:
        return <Zap className="h-3.5 w-3.5" />;
      case REQUEST_PRIORITY.HIGH:
        return <Star className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-gray-500">
            Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="requests.view">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Modern Header with Glass Effect */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 shadow-lg">
                    <MessageSquareText className="h-7 w-7 text-white" />
                  </div>
                  Müşteri Talepleri
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 ml-14">
                  Tüm müşteri taleplerini görüntüleyin ve yönetin
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshRequests()}
                  className="hover:bg-slate-50 dark:hover:bg-gray-800"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
                {canCreate && (
                  <Link href="/admin/requests/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="h-5 w-5 mr-2" />
                      Yeni Talep
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Statistics Cards */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Toplam Talepler
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats.total}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Bu ay {stats.thisMonth} yeni
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3">
                      <MessageSquareText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Yeni
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats.byStatus[REQUEST_STATUS.NEW] || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Yeni talepler
                      </p>
                    </div>
                    <div className="bg-sky-100 dark:bg-sky-900/30 rounded-xl p-3">
                      <AlertCircle className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        İşleniyor
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats.byStatus[REQUEST_STATUS.IN_PROGRESS] || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Aktif talepler
                      </p>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-xl p-3">
                      <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Tamamlanan
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats.byStatus[REQUEST_STATUS.COMPLETED] || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatCurrency(stats.completedValue)}
                      </p>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-xl p-3">
                      <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-8 bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative lg:col-span-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Talep ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    {Object.values(REQUEST_STATUS).map((status) => (
                      <SelectItem key={status} value={status}>
                        {getRequestStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {Object.values(REQUEST_CATEGORIES).map((category) => (
                      <SelectItem key={category} value={category}>
                        {getRequestCategoryLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500">
                    <SelectValue placeholder="Öncelik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    {Object.values(REQUEST_PRIORITY).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {getRequestPriorityLabel(priority)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {(searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all" ||
                priorityFilter !== "all") && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Aktif Filtreler:
                  </span>
                  {searchTerm && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      Arama: "{searchTerm}"
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      {getRequestStatusLabel(statusFilter)}
                    </Badge>
                  )}
                  {categoryFilter !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    >
                      {getRequestCategoryLabel(categoryFilter)}
                    </Badge>
                  )}
                  {priorityFilter !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    >
                      {getRequestPriorityLabel(priorityFilter)}
                    </Badge>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setCategoryFilter("all");
                      setPriorityFilter("all");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium ml-auto"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Count */}
          {filteredRequests.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredRequests.length}
                </span>{" "}
                talep listeleniyor
                {filteredRequests.length !== requests.length && (
                  <span className="text-gray-500 dark:text-gray-500">
                    {" "}
                    (toplam {requests.length} içinden)
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Requests Table */}
          {requestsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Talepler yükleniyor...
                </p>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <MessageSquareText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all" ||
                  priorityFilter !== "all"
                    ? "Sonuç Bulunamadı"
                    : "Henüz Talep Yok"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all" ||
                  priorityFilter !== "all"
                    ? "Arama kriterlerine uygun talep bulunamadı. Farklı filtreler deneyin."
                    : "Müşteri talepleri burada görünecek. İlk talebi oluşturmak için yeni talep butonuna tıklayın."}
                </p>
                {(searchTerm ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all" ||
                  priorityFilter !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setCategoryFilter("all");
                      setPriorityFilter("all");
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Filtreleri Temizle
                  </Button>
                )}
                {!searchTerm &&
                  statusFilter === "all" &&
                  categoryFilter === "all" &&
                  priorityFilter === "all" &&
                  canCreate && (
                    <Link href="/admin/requests/new">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        İlk Talebi Oluştur
                      </Button>
                    </Link>
                  )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold text-gray-900 dark:text-white py-4">
                        Talep Bilgileri
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Kategori
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Durum
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Öncelik
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Firma
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Tarih
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        İşlemler
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/admin/requests/${request.id}`)
                        }
                      >
                        {/* Talep Bilgileri */}
                        <TableCell className="py-4 max-w-[350px]">
                          <div className="flex items-start gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2 shadow-md flex-shrink-0">
                              <MessageSquareText className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                                  {request.title}
                                </h3>
                              </div>
                              {request.description && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 cursor-help truncate">
                                      {request.description
                                        .trim()
                                        .substring(0, 80)}
                                      {request.description.trim().length > 80
                                        ? "..."
                                        : ""}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    className="max-w-md"
                                  >
                                    <p className="text-sm whitespace-pre-wrap">
                                      {request.description.trim()}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-mono border-gray-300 dark:border-gray-600"
                                >
                                  #{request.requestNumber}
                                </Badge>
                                {request.contactEmail && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                    {request.contactEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Kategori */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${getCategoryColor(
                                request.category
                              )}`}
                            >
                              {getCategoryIconComponent(request.category)}
                              <span className="text-xs font-medium whitespace-nowrap">
                                {
                                  (
                                    getRequestCategoryLabel(request.category) ||
                                    "Bilinmiyor"
                                  ).split(" ")[0]
                                }
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Durum */}
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              request.status
                            )} font-medium border text-xs whitespace-nowrap`}
                          >
                            {getRequestStatusLabel(request.status)}
                          </Badge>
                        </TableCell>

                        {/* Öncelik */}
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${getPriorityColor(
                              request.priority
                            )} font-medium border flex items-center justify-center gap-1 text-xs whitespace-nowrap mx-auto w-fit`}
                          >
                            {getPriorityIcon(request.priority)}
                            {getRequestPriorityLabel(request.priority)}
                          </Badge>
                        </TableCell>

                        {/* Firma */}
                        <TableCell className="text-center">
                          {request.companyName ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Building2 className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                {request.companyName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        {/* Tarih */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDate(request.createdAt)}
                            </span>
                          </div>
                        </TableCell>

                        {/* İşlemler */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin/requests/${request.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {canEdit && (
                              <Link href={`/admin/requests/${request.id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {canDeleteRequest() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRequest(request.id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Talebi Sil (Sadece Super Admin)"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </Card>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
