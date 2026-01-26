"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "../../../../hooks/use-toast";
import {
  getOrders,
  getOrderStats,
  ORDER_TYPE,
  ORDER_STATUS,
  PAYMENT_STATUS,
  getOrderTypeLabel,
  getOrderTypeColor,
  getOrderTypeIcon,
  getOrderStatusLabel,
  getOrderStatusColor,
  getOrderStatusDot,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getOrderPriorityLabel,
  getOrderPriorityColor,
  calculateStageProgress,
  calculateProductionProgress,
} from "../../../../lib/services/crm-v2";
import { formatDistanceToNow, format } from "date-fns";
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
import { Progress } from "../../../../components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

// Icons
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Factory,
  Package,
  Briefcase,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Building2,
  RefreshCw,
} from "lucide-react";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    paymentStatus: "all",
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.type !== "all") filterParams.type = filters.type;
      if (filters.status !== "all") filterParams.status = filters.status;
      if (filters.paymentStatus !== "all") filterParams.paymentStatus = filters.paymentStatus;

      const [ordersData, statsData] = await Promise.all([
        getOrders(filterParams),
        getOrderStats(),
      ]);

      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({ title: "Hata", description: "Siparişler yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user, loadData]);

  // Filter orders by search
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(search) ||
      order.customer?.companyName?.toLowerCase().includes(search) ||
      order.customer?.contactName?.toLowerCase().includes(search)
    );
  });

  // Get icon component
  const getIconComponent = (iconName) => {
    const icons = { Factory, Package, Briefcase, FileText };
    return icons[iconName] || FileText;
  };

  // Format currency
  const formatCurrency = (amount, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount || 0);
  };

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Siparişler</h1>
          <p className="text-slate-500 mt-1">
            Üretim, tedarik ve hizmet siparişlerinizi yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button onClick={() => router.push("/admin/crm-v2/orders/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sipariş
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Toplam Sipariş</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="text-purple-600">
                  {stats.byType[ORDER_TYPE.PRODUCTION]} Üretim
                </span>
                <span className="text-blue-600">
                  {stats.byType[ORDER_TYPE.SUPPLY]} Tedarik
                </span>
                <span className="text-emerald-600">
                  {stats.byType[ORDER_TYPE.SERVICE]} Hizmet
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Aktif Siparişler</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(stats.byStatus[ORDER_STATUS.CONFIRMED] || 0) + 
                     (stats.byStatus[ORDER_STATUS.IN_PROGRESS] || 0)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Toplam Değer</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payment */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Bekleyen Ödeme</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(stats.pendingValue)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Sipariş no veya müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value={ORDER_TYPE.PRODUCTION}>Üretim</SelectItem>
                <SelectItem value={ORDER_TYPE.SUPPLY}>Tedarik</SelectItem>
                <SelectItem value={ORDER_TYPE.SERVICE}>Hizmet</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value={ORDER_STATUS.DRAFT}>Taslak</SelectItem>
                <SelectItem value={ORDER_STATUS.PENDING_PAYMENT}>Ödeme Bekliyor</SelectItem>
                <SelectItem value={ORDER_STATUS.CONFIRMED}>Onaylandı</SelectItem>
                <SelectItem value={ORDER_STATUS.IN_PROGRESS}>İşlemde</SelectItem>
                <SelectItem value={ORDER_STATUS.COMPLETED}>Tamamlandı</SelectItem>
                <SelectItem value={ORDER_STATUS.DELIVERED}>Teslim Edildi</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Ödeme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ödemeler</SelectItem>
                <SelectItem value={PAYMENT_STATUS.PENDING}>Bekliyor</SelectItem>
                <SelectItem value={PAYMENT_STATUS.PARTIAL}>Kısmi</SelectItem>
                <SelectItem value={PAYMENT_STATUS.PAID}>Ödendi</SelectItem>
                <SelectItem value={PAYMENT_STATUS.OVERDUE}>Gecikmiş</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Sipariş bulunamadı
              </h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || filters.type !== "all" || filters.status !== "all"
                  ? "Filtreleri değiştirmeyi deneyin"
                  : "Henüz sipariş oluşturulmamış"}
              </p>
              <Button onClick={() => router.push("/admin/crm-v2/orders/new")}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Siparişi Oluştur
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const IconComponent = getIconComponent(getOrderTypeIcon(order.type));
                // Production siparişleri için production objesine dayalı hesaplama
                const stageProgress = order.type === ORDER_TYPE.PRODUCTION 
                  ? calculateProductionProgress(order.production).percent 
                  : calculateStageProgress(order.type, order.currentStage);
                const createdAt = order.createdAt?.toDate?.() || new Date(order.createdAt);

                return (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/crm-v2/orders/${order.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Order info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Icon */}
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          order.type === ORDER_TYPE.PRODUCTION && "bg-purple-100",
                          order.type === ORDER_TYPE.SUPPLY && "bg-blue-100",
                          order.type === ORDER_TYPE.SERVICE && "bg-emerald-100",
                        )}>
                          <IconComponent className={cn(
                            "h-5 w-5",
                            order.type === ORDER_TYPE.PRODUCTION && "text-purple-600",
                            order.type === ORDER_TYPE.SUPPLY && "text-blue-600",
                            order.type === ORDER_TYPE.SERVICE && "text-emerald-600",
                          )} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-900">
                              {order.orderNumber}
                            </span>
                            <Badge variant="outline" className={cn("text-xs", getOrderTypeColor(order.type))}>
                              {getOrderTypeLabel(order.type)}
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", getOrderStatusColor(order.status))}>
                              <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", getOrderStatusDot(order.status))} />
                              {getOrderStatusLabel(order.status)}
                            </Badge>
                          </div>

                          {/* Customer */}
                          {order.customer?.companyName && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-600">
                              <Building2 className="h-3.5 w-3.5" />
                              <span className="truncate">{order.customer.companyName}</span>
                            </div>
                          )}

                          {/* Stage Progress (for production/supply) */}
                          {order.type !== ORDER_TYPE.SERVICE && stageProgress > 0 && (
                            <div className="mt-2 max-w-xs">
                              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>İlerleme</span>
                                <span>%{stageProgress}</span>
                              </div>
                              <Progress value={stageProgress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Date */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(order.total, order.currency)}
                        </div>
                        <Badge variant="outline" className={cn("text-xs mt-1", getPaymentStatusColor(order.paymentStatus))}>
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </Badge>
                        <div className="text-xs text-slate-400 mt-2">
                          {formatDistanceToNow(createdAt, { addSuffix: true, locale: tr })}
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/crm-v2/orders/${order.id}`);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detayları Gör
                          </DropdownMenuItem>
                          {order.caseId && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/crm-v2/cases/${order.caseId}`);
                            }}>
                              <ArrowUpRight className="h-4 w-4 mr-2" />
                              Case'e Git
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
