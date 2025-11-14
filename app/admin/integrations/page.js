"use client";

import { useState, useEffect } from "react";
import { PermissionGuard } from "../../../components/admin-route-guard";
import { authenticatedFetch } from "../../../lib/api/auth-fetch";
import logger from "../../../lib/utils/logger";
import Link from "next/link";
import {
  Plus,
  Settings,
  Users,
  ShoppingCart,
  RotateCcw,
  ExternalLink,
  Activity,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "../../../lib/utils/date-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { useToast } from "../../../hooks/use-toast";

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState([]);
  const [stats, setStats] = useState({
    totalIntegrations: 0,
    activeIntegrations: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIntegrations();
    fetchStats();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(
        "/api/admin/integrations/shopify"
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Entegrasyonlar yüklenemedi");
      }

      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      logger.error("Integration fetch error:", error.message);
      toast({
        title: "Veri Yükleme Hatası",
        description: error.message || "Entegrasyonlar yüklenirken hata oluştu",
        variant: "destructive",
      });
      setError(error.message);
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch(
        "/api/admin/integrations/shopify/stats"
      );

      if (response.ok) {
        const data = await response.json();
        setStats(
          data.stats || {
            totalIntegrations: 0,
            activeIntegrations: 0,
            totalOrders: 0,
            totalCustomers: 0,
          }
        );
      }
    } catch (error) {
      logger.warn("Stats fetch error:", error.message);
      // İstatistik hatası genellikle kritik değil, sessiz başarısızlık
      setStats({
        totalIntegrations: 0,
        activeIntegrations: 0,
        totalOrders: 0,
        totalCustomers: 0,
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="w-3 h-3 mr-1" />
            Aktif
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <X className="w-3 h-3 mr-1" />
            Pasif
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Hata
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "shopify":
        return "🛍️";
      default:
        return "🔗";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchIntegrations} className="mt-4" variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="integrations.view">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              E-ticaret Entegrasyonları
            </h1>
            <p className="text-gray-600 mt-2">
              Müşterilerinizin e-ticaret platformlarını yönetin ve fulfillment
              süreçlerini otomatikleştirin
            </p>
          </div>
          <Link href="/admin/integrations/shopify/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Entegrasyon
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Entegrasyon
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalIntegrations}
              </div>
              <p className="text-xs text-muted-foreground">Tüm platformlar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aktif Entegrasyon
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeIntegrations}
              </div>
              <p className="text-xs text-muted-foreground">Şu anda çalışan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Sipariş
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Bu ay senkronize edildi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Müşteri Sayısı
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Entegrasyon sahibi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Desteklenen Platformlar</CardTitle>
            <CardDescription>
              Fulfillment hizmeti için entegre edebileceğiniz e-ticaret
              platformları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/integrations/shopify/new">
                <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                      🛍️
                    </div>
                    <div>
                      <h3 className="font-semibold">Shopify</h3>
                      <p className="text-sm text-gray-600">
                        E-ticaret platformu
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                  </div>
                </div>
              </Link>

              <div className="p-4 border rounded-lg bg-gray-50 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                    🛒
                  </div>
                  <div>
                    <h3 className="font-semibold">WooCommerce</h3>
                    <p className="text-sm text-gray-600">Yakında gelecek</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">
                    🏪
                  </div>
                  <div>
                    <h3 className="font-semibold">Magento</h3>
                    <p className="text-sm text-gray-600">Yakında gelecek</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Mevcut Entegrasyonlar
              <Button variant="outline" size="sm" onClick={fetchIntegrations}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </CardTitle>
            <CardDescription>
              Aktif entegrasyonlarınızı görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {integrations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🔗</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Henüz entegrasyon yok
                </h3>
                <p className="text-gray-600 mb-4">
                  İlk entegrasyonunuzu oluşturarak başlayın
                </p>
                <Link href="/admin/integrations/shopify/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Shopify Entegrasyonu Ekle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                          {getPlatformIcon(integration.platform)}
                        </div>
                        <div>
                          <div className="mb-1">
                            <Badge variant="outline" className="text-xs mb-2">
                              Entegrasyon Sahibi
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg">
                            {integration.companyName ||
                              integration.customerName}
                          </h3>
                          <p className="text-gray-600">
                            {integration.shopDomain}
                          </p>
                          {integration.companyEmail && (
                            <p className="text-sm text-gray-500">
                              {integration.companyEmail}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(integration.status)}
                            <span className="text-sm text-gray-500">
                              Son senkronizasyon:{" "}
                              {formatDate(integration.lastSyncAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Sipariş Sayısı
                          </div>
                          <div className="text-lg font-semibold">
                            {integration.ordersCount}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/admin/integrations/shopify/${integration.id}`}
                          >
                            <Button variant="outline" size="sm">
                              Detaylar
                            </Button>
                          </Link>
                          <Link
                            href={`/admin/integrations/shopify/${integration.id}/settings`}
                          >
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Integration Settings Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {integration.settings.syncOrders ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-600" />
                          )}
                          <span>Sipariş Senkronizasyonu</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {integration.settings.syncReturns ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-600" />
                          )}
                          <span>İade Senkronizasyonu</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {integration.settings.autoFulfillment ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <X className="h-3 w-3 text-red-600" />
                          )}
                          <span>Otomatik Fulfillment</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
