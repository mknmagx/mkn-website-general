"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "../../../lib/utils/date-utils";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Separator } from "../../ui/separator";
import {
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Printer,
  Tag,
  User,
  CreditCard,
  ShoppingBag,
  FileText,
  RotateCcw
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export function OrderDetailModal({ order, open, onClose, onFulfill, onRefund }) {
  const { toast } = useToast();
  const [fulfillmentData, setFulfillmentData] = useState({
    trackingNumber: "",
    trackingUrl: "",
    carrier: "MNG Kargo",
    items: order?.lineItems?.map(item => ({ id: item.id, quantity: item.quantity })) || [],
    notifyCustomer: true,
    notes: ""
  });
  const [refundData, setRefundData] = useState({
    amount: order?.totalPrice || 0,
    reason: "",
    refundShipping: false,
    restockItems: true,
    notifyCustomer: true
  });

  if (!order) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Metin panoya kopyalandı",
      duration: 2000,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "fulfilled":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Tamamlandı
          </Badge>
        );
      case "unfulfilled":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Bekliyor
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Package className="w-3 h-3 mr-1" />
            Kısmi
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Acil</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">Yüksek</Badge>;
      case "normal":
        return <Badge variant="secondary">Normal</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-600">Düşük</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const handleFulfillment = () => {
    onFulfill?.(order.id, fulfillmentData);
    toast({
      title: "Fulfillment Başlatıldı",
      description: `${order.orderNumber} siparişi için fulfillment işlemi başlatıldı`,
      duration: 3000,
    });
    onClose();
  };

  const handleRefund = () => {
    onRefund?.(order.id, refundData);
    toast({
      title: "İade İşlemi",
      description: `${order.orderNumber} siparişi için iade işlemi başlatıldı`,
      duration: 3000,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {order.orderNumber}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <span>Shopify Order: {order.shopifyOrderId}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(order.shopifyOrderId)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(order.fulfillmentStatus)}
              {getPriorityBadge(order.priority)}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Sipariş Detayı</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
            <TabsTrigger value="customer">Müşteri</TabsTrigger>
            <TabsTrigger value="actions">İşlemler</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sipariş Özeti */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Sipariş Özeti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sipariş Tarihi:</span>
                    <span className="font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Güncelleme:</span>
                    <span className="font-medium">{formatDate(order.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ödeme Durumu:</span>
                    <Badge variant={order.financialStatus === "paid" ? "default" : "secondary"}>
                      <CreditCard className="w-3 h-3 mr-1" />
                      {order.financialStatus === "paid" ? "Ödendi" : order.financialStatus}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span>{formatCurrency(order.totalPrice, order.currency)}</span>
                  </div>
                  {order.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-gray-600 text-sm">Etiketler:</span>
                        <div className="flex gap-1 mt-1">
                          {order.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Teslimat Adresi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Teslimat Adresi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </div>
                    <div className="text-gray-600">
                      {order.shippingAddress.address1}
                    </div>
                    <div className="text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.province}
                    </div>
                    <div className="text-gray-600">
                      {order.shippingAddress.country} {order.shippingAddress.zip}
                    </div>
                    {order.shippingAddress.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {order.shippingAddress.phone}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(order.shippingAddress.phone)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ürünler */}
            <Card>
              <CardHeader>
                <CardTitle>Sipariş Ürünleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.lineItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.variantTitle && (
                          <p className="text-sm text-gray-600">{item.variantTitle}</p>
                        )}
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {item.quantity} × {formatCurrency(item.price, order.currency)}
                        </div>
                        <div className="text-sm text-gray-600">
                          = {formatCurrency(item.quantity * item.price, order.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notlar */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Sipariş Notları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="fulfillment" className="space-y-4">
            {order.fulfillmentStatus === "unfulfilled" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Fulfillment Yap</CardTitle>
                  <CardDescription>
                    Siparişi hazırlayıp kargo bilgilerini girin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carrier">Kargo Firması</Label>
                      <Select 
                        value={fulfillmentData.carrier} 
                        onValueChange={(value) => 
                          setFulfillmentData(prev => ({ ...prev, carrier: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MNG Kargo">MNG Kargo</SelectItem>
                          <SelectItem value="Yurtiçi Kargo">Yurtiçi Kargo</SelectItem>
                          <SelectItem value="PTT Kargo">PTT Kargo</SelectItem>
                          <SelectItem value="Aras Kargo">Aras Kargo</SelectItem>
                          <SelectItem value="UPS">UPS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tracking">Takip Numarası</Label>
                      <Input
                        id="tracking"
                        value={fulfillmentData.trackingNumber}
                        onChange={(e) => 
                          setFulfillmentData(prev => ({ ...prev, trackingNumber: e.target.value }))
                        }
                        placeholder="Takip numarasını girin"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="trackingUrl">Takip URL (Opsiyonel)</Label>
                    <Input
                      id="trackingUrl"
                      value={fulfillmentData.trackingUrl}
                      onChange={(e) => 
                        setFulfillmentData(prev => ({ ...prev, trackingUrl: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="fulfillmentNotes">Fulfillment Notları</Label>
                    <Textarea
                      id="fulfillmentNotes"
                      value={fulfillmentData.notes}
                      onChange={(e) => 
                        setFulfillmentData(prev => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Opsiyonel notlar..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleFulfillment} className="flex-1">
                      <Truck className="w-4 h-4 mr-2" />
                      Fulfillment Yap
                    </Button>
                    <Button variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      Etiket Yazdır
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Fulfillment Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.trackingInfo ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kargo Firması:</span>
                        <span className="font-medium">{order.trackingInfo.carrier}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Takip Numarası:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.trackingInfo.trackingNumber}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(order.trackingInfo.trackingNumber)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {order.trackingInfo.trackingUrl && (
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <a href={order.trackingInfo.trackingUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Kargo Takip
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Fulfillment bilgileri henüz eklenmemiş
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="customer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Müşteri Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Ad Soyad</Label>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">E-posta</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.customerEmail}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(order.customerEmail)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {order.customerPhone && (
                    <div>
                      <Label className="text-gray-600">Telefon</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.customerPhone}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(order.customerPhone)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    E-posta Gönder
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Müşteri Geçmişi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <RotateCcw className="w-5 h-5" />
                    İade İşlemi
                  </CardTitle>
                  <CardDescription>
                    Siparişin tamamı veya bir kısmı için iade işlemi başlat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="refundAmount">İade Tutarı</Label>
                    <Input
                      id="refundAmount"
                      type="number"
                      value={refundData.amount}
                      onChange={(e) => 
                        setRefundData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                      }
                      max={order.totalPrice}
                    />
                  </div>
                  <div>
                    <Label htmlFor="refundReason">İade Sebebi</Label>
                    <Textarea
                      id="refundReason"
                      value={refundData.reason}
                      onChange={(e) => 
                        setRefundData(prev => ({ ...prev, reason: e.target.value }))
                      }
                      placeholder="İade sebebini açıklayın..."
                    />
                  </div>
                  <Button 
                    onClick={handleRefund} 
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    İade İşlemini Başlat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diğer İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Printer className="w-4 h-4 mr-2" />
                    Fatura Yazdır
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Ambalaj Listesi
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Sevk İrsaliyesi
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Shopify'da Görüntüle
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}