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
        return "bg-blue-100 text-blue-800 border-blue-200";
      case REQUEST_STATUS.ASSIGNED:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case REQUEST_STATUS.IN_PROGRESS:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case REQUEST_STATUS.WAITING_CLIENT:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case REQUEST_STATUS.QUOTATION_SENT:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case REQUEST_STATUS.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case REQUEST_STATUS.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case REQUEST_STATUS.COMPLETED:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case REQUEST_STATUS.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case REQUEST_PRIORITY.LOW:
        return "bg-gray-100 text-gray-700";
      case REQUEST_PRIORITY.NORMAL:
        return "bg-blue-100 text-blue-700";
      case REQUEST_PRIORITY.HIGH:
        return "bg-orange-100 text-orange-700";
      case REQUEST_PRIORITY.URGENT:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquareText className="h-8 w-8 text-blue-600" />
              Müşteri Talepleri
            </h1>
            <p className="text-gray-600 mt-2">
              Şirketinize gelen tüm müşteri taleplerini yönetin ve takip edin
            </p>
          </div>
          {canCreate && (
            <Link href="/admin/requests/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Talep Ekle
              </Button>
            </Link>
          )}
        </div>

        {/* Statistics Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Talepler
                </CardTitle>
                <MessageSquareText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Bu ay {stats.thisMonth} yeni
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bekleyen Değer
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.pendingValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Potansiyel gelir
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tamamlanan
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byStatus[REQUEST_STATUS.COMPLETED] || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.completedValue)} değer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">İşleniyor</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byStatus[REQUEST_STATUS.IN_PROGRESS] || 0}
                </div>
                <p className="text-xs text-muted-foreground">Aktif talepler</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Talep ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
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
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
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

              {/* Company Filter */}
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Firma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Firmalar</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              Tümü
              <Badge variant="secondary" className="text-xs">
                {requestsByStatus.all.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              Yeni
              <Badge variant="secondary" className="text-xs">
                {requestsByStatus.new.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="in_progress"
              className="flex items-center gap-2"
            >
              İşleniyor
              <Badge variant="secondary" className="text-xs">
                {requestsByStatus.in_progress.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="quotation_sent"
              className="flex items-center gap-2"
            >
              Teklif Gönderildi
              <Badge variant="secondary" className="text-xs">
                {requestsByStatus.quotation_sent.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Tamamlandı
              <Badge variant="secondary" className="text-xs">
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
                      className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            {/* Header with title and badges */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                {request.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(
                                    request.status
                                  )} font-medium`}
                                >
                                  {getRequestStatusLabel(request.status)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`${getPriorityColor(
                                    request.priority
                                  )} font-medium`}
                                >
                                  {getRequestPriorityLabel(request.priority)}
                                </Badge>
                              </div>
                            </div>

                            {/* Request info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                <span className="font-semibold text-gray-700">
                                  #{request.requestNumber}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                <span className="text-blue-700 font-medium">
                                  {getRequestCategoryLabel(request.category)}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700 leading-relaxed line-clamp-3">
                                {request.description}
                              </p>
                            </div>

                            {/* Meta information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                              {request.companyName && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Building2 className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">
                                    {request.companyName}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <span>{formatDate(request.createdAt)}</span>
                              </div>
                              {request.estimatedValue > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <DollarSign className="h-4 w-4 text-yellow-500" />
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(request.estimatedValue)}
                                  </span>
                                </div>
                              )}
                              {request.contactEmail && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2 lg:col-span-1">
                                  <MessageSquareText className="h-4 w-4 text-purple-500" />
                                  <span className="truncate">
                                    {request.contactEmail}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-3 lg:flex-col lg:items-stretch">
                            <Link
                              href={`/admin/requests/${request.id}`}
                              className="flex-1 lg:flex-none"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full hover:bg-blue-50 hover:border-blue-300"
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
                                  className="w-full hover:bg-green-50 hover:border-green-300"
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
