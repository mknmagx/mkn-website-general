"use client";

import { useState } from "react";
import Link from "next/link";
import { useRequests, useRequestStats } from "../../../hooks/use-requests";
import { useCompanies } from "../../../hooks/use-company";
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
} from "../../../lib/services/request-service";

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

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
} from "lucide-react";

export default function RequestsPage() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  // Data hooks
  const { stats, loading: statsLoading } = useRequestStats();
  const { companies, loading: companiesLoading } = useCompanies();

  // Build filter options for requests
  const requestOptions = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(categoryFilter !== "all" && { category: categoryFilter }),
    ...(priorityFilter !== "all" && { priority: priorityFilter }),
    ...(companyFilter !== "all" && { companyId: companyFilter }),
    limitCount: 50,
  };

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

  // Filter requests by search term
  const filteredRequests = requests.filter((request) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      request.title?.toLowerCase().includes(searchLower) ||
      request.description?.toLowerCase().includes(searchLower) ||
      request.requestNumber?.toLowerCase().includes(searchLower) ||
      request.companyName?.toLowerCase().includes(searchLower) ||
      request.contactEmail?.toLowerCase().includes(searchLower)
    );
  });

  // Group requests by status for tabs
  const requestsByStatus = {
    all: filteredRequests,
    new: filteredRequests.filter((r) => r.status === REQUEST_STATUS.NEW),
    in_progress: filteredRequests.filter(
      (r) => r.status === REQUEST_STATUS.IN_PROGRESS
    ),
    quotation_sent: filteredRequests.filter(
      (r) => r.status === REQUEST_STATUS.QUOTATION_SENT
    ),
    completed: filteredRequests.filter(
      (r) => r.status === REQUEST_STATUS.COMPLETED
    ),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case REQUEST_STATUS.NEW:
        return "bg-sky-50 text-sky-700 border-sky-200";
      case REQUEST_STATUS.ASSIGNED:
        return "bg-violet-50 text-violet-700 border-violet-200";
      case REQUEST_STATUS.IN_PROGRESS:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case REQUEST_STATUS.WAITING_CLIENT:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case REQUEST_STATUS.QUOTATION_SENT:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case REQUEST_STATUS.APPROVED:
        return "bg-green-50 text-green-700 border-green-200";
      case REQUEST_STATUS.REJECTED:
        return "bg-red-50 text-red-700 border-red-200";
      case REQUEST_STATUS.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case REQUEST_STATUS.CANCELLED:
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case REQUEST_PRIORITY.LOW:
        return "bg-slate-50 text-slate-600 border-slate-200";
      case REQUEST_PRIORITY.NORMAL:
        return "bg-blue-50 text-blue-600 border-blue-200";
      case REQUEST_PRIORITY.HIGH:
        return "bg-orange-50 text-orange-600 border-orange-200";
      case REQUEST_PRIORITY.URGENT:
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
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
        return <Zap className="h-3 w-3" />;
      case REQUEST_PRIORITY.HIGH:
        return <Star className="h-3 w-3" />;
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
      hour: "2-digit",
      minute: "2-digit",
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <MessageSquareText className="h-6 w-6 text-white" />
              </div>
              Müşteri Talepleri
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              MKN Group'a gelen tüm müşteri taleplerini kategorizasyon, öncelik
              ve durum bazında yönetin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshRequests()}
              className="hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            {canCreate && (
              <Link href="/admin/requests/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Talep
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">
                  Toplam Talepler
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquareText className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {stats.total}
                </div>
                <p className="text-xs text-blue-600">
                  Bu ay {stats.thisMonth} yeni talep
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-800">
                  Bekleyen Değer
                </CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">
                  {formatCurrency(stats.pendingValue)}
                </div>
                <p className="text-xs text-amber-600">Potansiyel gelir</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">
                  Tamamlanan
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">
                  {stats.byStatus[REQUEST_STATUS.COMPLETED] || 0}
                </div>
                <p className="text-xs text-emerald-600">
                  {formatCurrency(stats.completedValue)} değer
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-800">
                  İşleniyor
                </CardTitle>
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Clock className="h-4 w-4 text-violet-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-900">
                  {stats.byStatus[REQUEST_STATUS.IN_PROGRESS] || 0}
                </div>
                <p className="text-xs text-violet-600">Aktif talepler</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
              <Filter className="h-5 w-5" />
              Arama ve Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Talep başlığı, açıklama, firma adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {Object.values(REQUEST_CATEGORIES).map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="flex items-center gap-2"
                    >
                      {getRequestCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
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
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  Aktif filtreler:
                </span>
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Arama: {searchTerm}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  >
                    Durum: {getRequestStatusLabel(statusFilter)}
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    Kategori: {getRequestCategoryLabel(categoryFilter)}
                  </Badge>
                )}
                {priorityFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 hover:bg-amber-200"
                  >
                    Öncelik: {getRequestPriorityLabel(priorityFilter)}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setPriorityFilter("all");
                    setCompanyFilter("all");
                  }}
                  className="h-6 px-2 text-slate-500 hover:text-slate-700"
                >
                  Temizle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger
              value="all"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              Tümü
              <Badge
                variant="secondary"
                className="text-xs bg-slate-200 text-slate-700"
              >
                {requestsByStatus.all.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              Yeni
              <Badge
                variant="secondary"
                className="text-xs bg-sky-100 text-sky-700"
              >
                {requestsByStatus.new.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="in_progress"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              İşleniyor
              <Badge
                variant="secondary"
                className="text-xs bg-amber-100 text-amber-700"
              >
                {requestsByStatus.in_progress.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="quotation_sent"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              Teklif Gönderildi
              <Badge
                variant="secondary"
                className="text-xs bg-indigo-100 text-indigo-700"
              >
                {requestsByStatus.quotation_sent.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              Tamamlandı
              <Badge
                variant="secondary"
                className="text-xs bg-emerald-100 text-emerald-700"
              >
                {requestsByStatus.completed.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {Object.entries(requestsByStatus).map(([status, statusRequests]) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {requestsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <MessageSquareText className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">
                      Talepler yükleniyor...
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Lütfen bekleyin
                    </p>
                  </div>
                </div>
              ) : statusRequests.length > 0 ? (
                <div className="space-y-4">
                  {statusRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-sm hover:scale-[1.01] relative overflow-hidden"
                    >
                      {/* Kategori renk çubuğu */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          getCategoryColor(request.category).split(" ")[0]
                        } opacity-60`}
                      ></div>

                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            {/* Header with title and badges */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {request.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(
                                    request.status
                                  )} font-medium border`}
                                >
                                  {getRequestStatusLabel(request.status)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`${getPriorityColor(
                                    request.priority
                                  )} font-medium border flex items-center gap-1`}
                                >
                                  {getPriorityIcon(request.priority)}
                                  {getRequestPriorityLabel(request.priority)}
                                </Badge>
                              </div>
                            </div>

                            {/* Request info */}
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                                <span className="font-semibold text-slate-700">
                                  #{request.requestNumber}
                                </span>
                              </div>
                              <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getCategoryColor(
                                  request.category
                                )}`}
                              >
                                {getCategoryIconComponent(request.category)}
                                <span className="font-medium">
                                  {getRequestCategoryLabel(request.category)}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-slate-700 leading-relaxed line-clamp-2">
                                {request.description}
                              </p>
                            </div>

                            {/* Meta information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                              {request.companyName && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                  <Building2 className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium truncate">
                                    {request.companyName}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                <Calendar className="h-4 w-4 text-emerald-500" />
                                <span>{formatDate(request.createdAt)}</span>
                              </div>
                              {request.estimatedValue > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                  <DollarSign className="h-4 w-4 text-amber-500" />
                                  <span className="font-semibold text-emerald-600">
                                    {formatCurrency(request.estimatedValue)}
                                  </span>
                                </div>
                              )}
                              {request.contactEmail && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg sm:col-span-2 lg:col-span-1">
                                  <MessageSquareText className="h-4 w-4 text-violet-500" />
                                  <span className="truncate">
                                    {request.contactEmail}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                            <Link
                              href={`/admin/requests/${request.id}`}
                              className="flex-1 lg:flex-none"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border-slate-200"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">
                                  Görüntüle
                                </span>
                              </Button>
                            </Link>
                            {canEdit && (
                              <Link
                                href={`/admin/requests/${request.id}/edit`}
                                className="flex-1 lg:flex-none"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 border-slate-200"
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">
                                    Düzenle
                                  </span>
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <MessageSquareText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {status === "all"
                        ? "Henüz talep bulunmuyor"
                        : `${getRequestStatusLabel(
                            status
                          )} durumunda talep bulunmuyor`}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {status === "all"
                        ? "Müşterilerinizden gelen talepler burada görünecek. İlk talebi ekleyerek başlayın."
                        : `Bu durumdaki talepler burada görünecek. Diğer durumları kontrol edebilir veya yeni talep ekleyebilirsiniz.`}
                    </p>
                    {canCreate && status === "all" && (
                      <Link href="/admin/requests/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          İlk Talebi Ekle
                        </Button>
                      </Link>
                    )}
                    {status !== "all" && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("all")}
                          className="hover:bg-gray-100"
                        >
                          Tüm Talepleri Görüntüle
                        </Button>
                        {canCreate && (
                          <Link href="/admin/requests/new">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Plus className="h-4 w-4 mr-2" />
                              Yeni Talep Ekle
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
