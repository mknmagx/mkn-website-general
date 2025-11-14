"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PermissionGuard } from "../../../../../components/admin-route-guard";
import { authenticatedFetch } from "../../../../../lib/api/auth-fetch";
import {
  formatDate,
  parseFirestoreDate,
} from "../../../../../lib/utils/date-utils";
import { useToast } from "../../../../../hooks/use-toast";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  RefreshCw,
  Activity,
  ShoppingCart,
  Users,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  Calendar,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { Progress } from "../../../../../components/ui/progress";
import { Separator } from "../../../../../components/ui/separator";

// Import new components
import { OrderDetailModal } from "../../../../../components/admin/shopify/order-detail-modal";
import { CustomersSection } from "../../../../../components/admin/shopify/customers-section";
import { ReturnsSection } from "../../../../../components/admin/shopify/returns-section";
import { AnalyticsSection } from "../../../../../components/admin/shopify/analytics-section";

export default function ShopifyIntegrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  const [integration, setIntegration] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [returns, setReturns] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    loadIntegrationData();
  }, [id]);

  const loadIntegrationData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Load integration details
      await fetchIntegrationDetails();

      // Load orders, customers, returns, and analytics in parallel
      await Promise.all([
        fetchOrders(),
        fetchCustomers(),
        fetchReturns(),
        fetchStats(),
      ]);
    } catch (error) {
      toast({
        title: "Entegrasyon Verileri Hatası",
        description: "Entegrasyon verileri yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrationDetails = async () => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}`
      );

      if (!response.ok) {
        throw new Error("Entegrasyon bulunamadı");
      }

      const data = await response.json();
      setIntegration(data.integration);

      // lastSyncAt değerini güvenli şekilde parse et ve set et
      if (data.integration.lastSyncAt) {
        const syncDate = parseFirestoreDate(data.integration.lastSyncAt);
        setLastSync(syncDate);
      } else {
        setLastSync(null);
      }
    } catch (error) {
      setIntegration(null);
      setLastSync(null);
      throw error;
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}/customers`
      );
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      setCustomers([]);
    }
  };

  const fetchReturns = async () => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}/returns`
      );
      if (response.ok) {
        const data = await response.json();
        setReturns(data.returns || []);
      }
    } catch (error) {
      setReturns([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}/sync`
      );

      if (response.ok) {
        const data = await response.json();

        // Siparişlerdeki tarihleri validate et
        const validatedOrders = (data.orders || []).map((order) => ({
          ...order,
          createdAt: parseFirestoreDate(order.createdAt),
          updatedAt: parseFirestoreDate(order.updatedAt),
        }));

        setOrders(validatedOrders);
      }
    } catch (error) {
      toast({
        title: "Sipariş Verisi Hatası",
        description: "Siparişler yüklenirken hata oluştu",
        variant: "destructive",
      });
      setOrders([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}/stats`
      );

      if (response.ok) {
        const data = await response.json();

        // Set both stats and analytics from API response
        setStats(
          data.stats || {
            totalOrders: 0,
            pendingOrders: 0,
            fulfilledOrders: 0,
            totalRevenue: 0,
            avgOrderValue: 0,
            lastMonthGrowth: 0,
            fulfillmentRate: 0,
          }
        );

        // Set analytics data if available
        setAnalytics(
          data.analytics || {
            fulfillmentMetrics: {
              avgProcessingTime: 24,
              avgShippingTime: 48,
              onTimeDeliveryRate: 95,
              fulfillmentAccuracy: 98,
              returnRate: 2.5,
            },
            customerMetrics: {
              newCustomers: 0,
              returningCustomers: 0,
              customerRetentionRate: 80,
              churnRate: 5,
              satisfactionScore: 4.5,
              customerLifetimeValue: 0,
            },
            salesTrends: [],
            topProducts: [],
            topProductsSold: "0 ürün",
          }
        );
      }
    } catch (error) {
      // Set default values on error
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        fulfilledOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        lastMonthGrowth: 0,
        fulfillmentRate: 0,
      });
      setAnalytics({
        fulfillmentMetrics: {
          avgProcessingTime: 24,
          avgShippingTime: 48,
          onTimeDeliveryRate: 95,
          fulfillmentAccuracy: 98,
          returnRate: 2.5,
        },
        customerMetrics: {
          newCustomers: 0,
          returningCustomers: 0,
          customerRetentionRate: 80,
          churnRate: 5,
          satisfactionScore: 4.5,
          customerLifetimeValue: 0,
        },
        salesTrends: [],
        topProducts: [],
        topProductsSold: "0 ürün",
      });
    }
  };

  const handleSyncOrders = async () => {
    setSyncing(true);

    toast({
      title: "Kapsamlı Senkronizasyon Başlatılıyor...",
      description: "Shopify'dan tüm veriler alınıyor, lütfen bekleyin",
      duration: 5000,
    });

    try {
      // Kapsamlı senkronizasyon - tüm veri tiplerini sync et
      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            syncType: "comprehensive", // orders, customers, returns, analytics
            includeAnalytics: true,
            refreshCache: true,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Detaylı sonuç mesajı
        const syncSummary = [
          result.syncResults.orders
            ? `${result.syncResults.orders} sipariş`
            : null,
          result.syncResults.customers
            ? `${result.syncResults.customers} müşteri`
            : null,
          result.syncResults.returns
            ? `${result.syncResults.returns} iade`
            : null,
        ]
          .filter(Boolean)
          .join(", ");

        toast({
          title: "🎉 Senkronizasyon Tamamlandı",
          description: `Güncellenen: ${syncSummary}. Analytics yenilendi.`,
          variant: "default",
          duration: 5000,
        });

        // Sıralı veri yenileme - önce kritik veriler
        await loadIntegrationData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sync failed");
      }
    } catch (error) {
      toast({
        title: "Senkronizasyon Hatası",
        description: `Shopify senkronizasyonu sırasında hata oluştu: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktif
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Clock className="w-3 h-3 mr-1" />
            Pasif
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Hata
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "fulfilled":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Tamamlandı
          </Badge>
        );
      case "unfulfilled":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Bekliyor
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Kısmi
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount, currency = "TRY") => {
    // Eğer amount null, undefined veya NaN ise 0 kullan
    const numericAmount =
      amount == null || isNaN(amount) ? 0 : parseFloat(amount);

    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(numericAmount);
  };

  // New handler functions for enhanced features
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleFulfillOrder = async (orderId, fulfillmentData) => {
    try {
      if (USE_MOCK_DATA) {
        // Update mock order
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  fulfillmentStatus: "fulfilled",
                  trackingInfo: {
                    trackingNumber: fulfillmentData.trackingNumber,
                    trackingUrl: fulfillmentData.trackingUrl,
                    carrier: fulfillmentData.carrier,
                  },
                }
              : order
          )
        );
        return;
      }

      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}/orders/${orderId}/fulfill`,
        {
          method: "POST",
          body: JSON.stringify(fulfillmentData),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        await fetchOrders();
      }
    } catch (error) {
      toast({
        title: "Fulfillment Hatası",
        description: "Fulfillment işlemi sırasında hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleRefundOrder = async (orderId, refundData) => {
    try {
      if (USE_MOCK_DATA) {
        // Handle mock refund - for development testing
        toast({
          title: "Mock İade İşlemi",
          description: `Sipariş ${orderId} için iade işlemi test edildi`,
          variant: "default",
        });
        return;
      }

      const response = await authenticatedFetch(
        `/api/admin/integrations/shopify/${id}/orders/${orderId}/refund`,
        {
          method: "POST",
          body: JSON.stringify(refundData),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        await fetchOrders();
      }
    } catch (error) {
      toast({
        title: "İade Hatası",
        description: "İade işlemi sırasında hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleUpdateReturn = async (returnId, updateData) => {
    if (USE_MOCK_DATA) {
      setReturns((prev) =>
        prev.map((ret) =>
          ret.id === returnId ? { ...ret, ...updateData } : ret
        )
      );
      return;
    }

    // Real API call would go here
  };

  const handleProcessReturn = async (returnId, action, data) => {
    if (USE_MOCK_DATA) {
      setReturns((prev) =>
        prev.map((ret) =>
          ret.id === returnId
            ? {
                ...ret,
                status: action === "approve" ? "approved" : "rejected",
                processedDate: new Date(),
                ...data,
              }
            : ret
        )
      );
      return;
    }

    // Real API call would go here
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Entegrasyon bulunamadı veya erişim yetkiniz yok.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="integrations.view">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/integrations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                  🛍️
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Entegrasyon Sahibi
                    </Badge>
                    {getStatusBadge(integration.status)}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {integration.companyName || integration.customerName}
                  </h1>
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-600 font-medium">
                      {integration.shopDomain}
                    </p>
                    {integration.companyEmail && (
                      <p className="text-sm text-gray-500">
                        {integration.companyEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSyncOrders}
              disabled={syncing}
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Senkronize Et
            </Button>
            <Link href={`/admin/integrations/shopify/${id}/settings`}>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Ayarlar
              </Button>
            </Link>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Shopify'da Aç
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Sipariş
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Son 30 gün</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bekleyen Siparişler
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                Fulfillment bekliyor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Gelir
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-green-600">
                +{stats.lastMonthGrowth}% önceki aya göre
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ortalama Sipariş
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.avgOrderValue)}
              </div>
              <p className="text-xs text-muted-foreground">Sipariş başına</p>
            </CardContent>
          </Card>
        </div>

        {/* Last Sync Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Son Senkronizasyon:</span>
                <span className="text-sm text-gray-600">
                  {formatDate(lastSync)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>
                    Siparişler:{" "}
                    {integration.settings.syncOrders ? "Açık" : "Kapalı"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>
                    İadeler:{" "}
                    {integration.settings.syncReturns ? "Açık" : "Kapalı"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>
                    Otomatik Fulfillment:{" "}
                    {integration.settings.autoFulfillment ? "Açık" : "Kapalı"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">
              Siparişler ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="customers">
              Müşteriler ({customers.length})
            </TabsTrigger>
            <TabsTrigger value="returns">
              İadeler ({returns.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Son Siparişler</CardTitle>
                    <CardDescription>
                      Shopify'dan senkronize edilen siparişler
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-lg">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerEmail}
                          </div>
                          {order.priority === "urgent" && (
                            <Badge className="bg-red-100 text-red-800">
                              Acil
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(
                                parseFloat(order.totalPrice),
                                order.currency
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                          {getOrderStatusBadge(order.fulfillmentStatus)}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="flex gap-4">
                          <span>
                            Ürünler:{" "}
                            {order.lineItems
                              .map((item) => `${item.title} (${item.quantity})`)
                              .join(", ")}
                          </span>
                          <span>Ödeme: {order.financialStatus}</span>
                        </div>
                        {order.notes && (
                          <div className="mt-2 text-xs text-blue-600">
                            📝 {order.notes}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                        >
                          Detayları Gör
                        </Button>
                        {order.fulfillmentStatus === "unfulfilled" && (
                          <Button
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            Fulfillment Yap
                          </Button>
                        )}
                        {order.trackingInfo && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={order.trackingInfo.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Kargo Takip
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Henüz sipariş bulunmuyor
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <CustomersSection customers={customers} orders={orders} />
          </TabsContent>

          <TabsContent value="returns">
            <ReturnsSection
              returns={returns}
              onUpdateReturn={handleUpdateReturn}
              onProcessReturn={handleProcessReturn}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSection analytics={analytics} stats={stats} />
          </TabsContent>
        </Tabs>

        {/* Order Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          open={showOrderDetail}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          onFulfill={handleFulfillOrder}
          onRefund={handleRefundOrder}
        />
      </div>
    </PermissionGuard>
  );
}
