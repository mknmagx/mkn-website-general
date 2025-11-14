"use client";

import { useState } from "react";
import { formatCurrency } from "../../../lib/utils/date-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import { Progress } from "../../ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  Users,
  DollarSign,
  ShoppingCart,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";

export function AnalyticsSection({ analytics, stats }) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const MetricCard = ({ title, value, change, icon: Icon, trend = "up", color = "blue" }) => {
    const isPositive = trend === "up";
    const colorClasses = {
      blue: "text-blue-600",
      green: "text-green-600",
      red: "text-red-600",
      yellow: "text-yellow-600",
      purple: "text-purple-600"
    };

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {change !== undefined && (
                <p className={`text-xs flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(change)}% önceki döneme göre
                </p>
              )}
            </div>
            <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProgressCard = ({ title, current, target, unit, color = "blue" }) => {
    const percentage = (current / target) * 100;
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{current}{unit}</span>
              <span className="text-gray-500">Hedef: {target}{unit}</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-gray-600">{percentage.toFixed(1)}% tamamlandı</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analitik Dashboard</h2>
          <p className="text-gray-600">Shopify satış performansı ve fulfillment metrikleri</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="sales">Satış Analizi</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
          <TabsTrigger value="customers">Müşteriler</TabsTrigger>
          <TabsTrigger value="products">Ürünler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Toplam Gelir"
              value={formatCurrency(stats.totalRevenue)}
              change={stats.lastMonthGrowth}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Sipariş Sayısı"
              value={stats.totalOrders}
              change={12.5}
              icon={ShoppingCart}
              color="blue"
            />
            <MetricCard
              title="Ortalama Sipariş"
              value={formatCurrency(stats.avgOrderValue)}
              change={8.2}
              icon={TrendingUp}
              color="purple"
            />
            <MetricCard
              title="Fulfillment Oranı"
              value={`%${stats.fulfillmentRate}`}
              change={2.1}
              icon={CheckCircle}
              color="green"
            />
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Operasyonel Metrikler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.fulfillmentMetrics.avgProcessingTime}h
                    </div>
                    <div className="text-sm text-gray-600">Ortalama İşleme</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.fulfillmentMetrics.avgShippingTime}h
                    </div>
                    <div className="text-sm text-gray-600">Ortalama Kargo</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      %{analytics.fulfillmentMetrics.onTimeDeliveryRate}
                    </div>
                    <div className="text-sm text-gray-600">Zamanında Teslimat</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      %{analytics.fulfillmentMetrics.fulfillmentAccuracy}
                    </div>
                    <div className="text-sm text-gray-600">İşlem Doğruluğu</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Müşteri Metrikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.customerMetrics.newCustomers}
                    </div>
                    <div className="text-sm text-gray-600">Yeni Müşteri</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.customerMetrics.returningCustomers}
                    </div>
                    <div className="text-sm text-gray-600">Dönen Müşteri</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      %{analytics.customerMetrics.customerRetentionRate}
                    </div>
                    <div className="text-sm text-gray-600">Müşteri Elde Tutma</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analytics.customerMetrics.satisfactionScore}/5
                    </div>
                    <div className="text-sm text-gray-600">Memnuniyet</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ProgressCard
              title="Aylık Satış Hedefi"
              current={stats.totalRevenue}
              target={1000000}
              unit="₺"
              color="green"
            />
            <ProgressCard
              title="Fulfillment Hızı"
              current={analytics.fulfillmentMetrics.avgProcessingTime}
              target={24}
              unit="h"
              color="blue"
            />
            <ProgressCard
              title="Müşteri Memnuniyeti"
              current={analytics.customerMetrics.satisfactionScore}
              target={5}
              unit="/5"
              color="yellow"
            />
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Satış Trendi
              </CardTitle>
              <CardDescription>
                Son 6 aylık satış performansı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 p-4">
                {analytics.salesTrends.map((data, index) => {
                  const maxRevenue = Math.max(...analytics.salesTrends.map(d => d.revenue));
                  const height = (data.revenue / maxRevenue) * 200;
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className="text-xs text-center">
                        <div className="font-medium">{formatCurrency(data.revenue)}</div>
                        <div className="text-gray-500">{data.orders} sipariş</div>
                      </div>
                      <div 
                        className="w-8 bg-blue-500 rounded-t"
                        style={{ height: `${height}px` }}
                      />
                      <div className="text-xs text-gray-600">
                        {data.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                En Çok Satan Ürünler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sales} adet satıldı</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-gray-500">gelir</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulfillment" className="space-y-6">
          {/* Fulfillment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Ortalama İşleme Süresi"
              value={`${analytics.fulfillmentMetrics.avgProcessingTime}h`}
              change={-15.2}
              icon={Clock}
              trend="down"
              color="blue"
            />
            <MetricCard
              title="Zamanında Teslimat"
              value={`%${analytics.fulfillmentMetrics.onTimeDeliveryRate}`}
              change={3.1}
              icon={CheckCircle}
              color="green"
            />
            <MetricCard
              title="İşlem Doğruluğu"
              value={`%${analytics.fulfillmentMetrics.fulfillmentAccuracy}`}
              change={1.5}
              icon={Package}
              color="purple"
            />
            <MetricCard
              title="İade Oranı"
              value={`%${analytics.fulfillmentMetrics.returnRate}`}
              change={-0.8}
              icon={AlertTriangle}
              trend="down"
              color="red"
            />
          </div>

          {/* Fulfillment Process */}
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment Süreci</CardTitle>
              <CardDescription>
                Sipariş işleme aşamaları ve süreleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="font-medium">Sipariş Alındı</div>
                  <div className="text-sm text-gray-600">Ortalama: 15 dk</div>
                  <div className="text-xs text-green-600 mt-1">%98 başarı</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="font-medium">Hazırlanıyor</div>
                  <div className="text-sm text-gray-600">Ortalama: 45 dk</div>
                  <div className="text-xs text-green-600 mt-1">%96 doğruluk</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="font-medium">Kargoya Verildi</div>
                  <div className="text-sm text-gray-600">Ortalama: 30 dk</div>
                  <div className="text-xs text-green-600 mt-1">%99 zamanında</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="font-medium">Teslim Edildi</div>
                  <div className="text-sm text-gray-600">Ortalama: 24h</div>
                  <div className="text-xs text-green-600 mt-1">%97 başarı</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {/* Customer Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Yeni Müşteri"
              value={analytics.customerMetrics.newCustomers}
              change={18.2}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Müşteri LTV"
              value={formatCurrency(analytics.customerMetrics.customerLifetimeValue)}
              change={12.5}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Elde Tutma Oranı"
              value={`%${analytics.customerMetrics.customerRetentionRate}`}
              change={5.3}
              icon={Star}
              color="purple"
            />
            <MetricCard
              title="Kayıp Oranı"
              value={`%${analytics.customerMetrics.churnRate}`}
              change={-2.1}
              icon={TrendingDown}
              trend="down"
              color="red"
            />
          </div>

          {/* Customer Segmentation */}
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Segmentasyonu</CardTitle>
              <CardDescription>
                Müşteri değerine göre dağılım
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">15%</div>
                  <div className="font-medium mt-2">Premium</div>
                  <div className="text-sm text-gray-600">Yüksek değerli müşteriler</div>
                  <div className="text-xs text-gray-500 mt-1">LTV: {formatCurrency(5000)}+</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">60%</div>
                  <div className="font-medium mt-2">Standard</div>
                  <div className="text-sm text-gray-600">Orta seviye müşteriler</div>
                  <div className="text-xs text-gray-500 mt-1">LTV: {formatCurrency(1500)}-{formatCurrency(5000)}</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">25%</div>
                  <div className="font-medium mt-2">Basic</div>
                  <div className="text-sm text-gray-600">Düşük değerli müşteriler</div>
                  <div className="text-xs text-gray-500 mt-1">LTV: {formatCurrency(1500)}-</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Product Performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="En Çok Satan"
              value={analytics.topProductsSold}
              change={8.7}
              icon={Star}
              color="yellow"
            />
            <MetricCard
              title="Stok Değeri"
              value={formatCurrency(234500)}
              change={-3.2}
              icon={Package}
              trend="down"
              color="blue"
            />
            <MetricCard
              title="Düşük Stok"
              value="8 ürün"
              change={15.5}
              icon={AlertTriangle}
              color="red"
            />
            <MetricCard
              title="Stok Devir Hızı"
              value="2.4x"
              change={12.1}
              icon={TrendingUp}
              color="green"
            />
          </div>

          {/* Inventory Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Stok Uyarıları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <div>
                    <div className="font-medium">Organik Serum Şişesi</div>
                    <div className="text-sm text-gray-600">Stok tükenmek üzere</div>
                  </div>
                  <div className="text-red-600 font-bold">33 adet</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div>
                    <div className="font-medium">Premium Kozmetik Kutusu</div>
                    <div className="text-sm text-gray-600">Düşük stok seviyesi</div>
                  </div>
                  <div className="text-yellow-600 font-bold">205 adet</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-500 rounded">
                  <div>
                    <div className="font-medium">Gıda Ambalaj Kutusu</div>
                    <div className="text-sm text-gray-600">Stok tükendi - 25 bekleyen sipariş</div>
                  </div>
                  <div className="text-red-600 font-bold">0 adet</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}