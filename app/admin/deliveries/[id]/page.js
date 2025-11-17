"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  PermissionGuard,
  usePermissions,
} from "../../../../components/admin-route-guard";
import {
  useDelivery,
  useUpdateDelivery,
} from "../../../../hooks/use-delivery";
import {
  DELIVERY_TYPE,
  DELIVERY_STATUS,
  getDeliveryTypeLabel,
  getDeliveryStatusLabel,
  getStatusColor,
  getTypeColor,
} from "../../../../lib/services/delivery-service";
import DeliveryPDFExport from "../../../../components/delivery-pdf-export";

import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useToast } from "../../../../hooks/use-toast";
import {
  Package,
  ArrowLeft,
  Edit,
  Download,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  X,
  Loader2,
} from "lucide-react";

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const deliveryId = params.id;

  // Hooks
  const { delivery, loading, error, refresh } = useDelivery(deliveryId);
  const { updateStatus, loading: updateLoading } = useUpdateDelivery();

  // State
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // PDF loading handlers
  const handlePdfLoadingStart = () => {
    setIsPdfLoading(true);
  };

  const handlePdfLoadingEnd = () => {
    setIsPdfLoading(false);
  };

  useEffect(() => {
    if (delivery) {
      setSelectedStatus(delivery.status);
    }
  }, [delivery]);

  // Status update handler
  const handleStatusUpdate = async (newStatus) => {
    try {
      const result = await updateStatus(deliveryId, newStatus);
      if (result.success) {
        toast({
          title: "Başarılı",
          description: "İrsaliye durumu güncellendi",
        });
        setSelectedStatus(newStatus);
        refresh();
      } else {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case DELIVERY_STATUS.PREPARED:
        return <Clock className="h-5 w-5" />;
      case DELIVERY_STATUS.IN_TRANSIT:
        return <Truck className="h-5 w-5" />;
      case DELIVERY_STATUS.DELIVERED:
        return <CheckCircle2 className="h-5 w-5" />;
      case DELIVERY_STATUS.RETURNED:
        return <RotateCcw className="h-5 w-5" />;
      case DELIVERY_STATUS.CANCELLED:
        return <X className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Package className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Hata Oluştu
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => router.push("/admin/deliveries")}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Package className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            İrsaliye Bulunamadı
          </h1>
          <p className="text-gray-600 mb-4">
            Aradığınız irsaliye bulunamadı veya silinmiş olabilir.
          </p>
          <Button
            onClick={() => router.push("/admin/deliveries")}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredPermission="deliveries.view"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Yetkisiz Erişim
            </h1>
            <p className="text-gray-600">
              Bu irsaliyeyi görüntülemek için gerekli izinlere sahip değilsiniz.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/deliveries")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-8 w-8 text-blue-600" />
                  İrsaliye #{delivery.deliveryNumber}
                </h1>
                <p className="text-gray-600 mt-1">
                  İrsaliye detayları ve durum bilgileri
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasPermission("deliveries.edit") && (
                <Button
                  onClick={() =>
                    router.push(`/admin/deliveries/${deliveryId}/edit`)
                  }
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              )}

              <DeliveryPDFExport 
                delivery={delivery}
                fileName={`irsaliye-${delivery.deliveryNumber}.pdf`}
                onLoadingStart={handlePdfLoadingStart}
                onLoadingEnd={handlePdfLoadingEnd}
              >
                <button 
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-2 ${
                    isPdfLoading ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
                  }`}
                  disabled={isPdfLoading}
                >
                  {isPdfLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      PDF Hazırlanıyor...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      PDF İndir
                    </>
                  )}
                </button>
              </DeliveryPDFExport>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Temel Bilgiler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        İrsaliye Numarası
                      </label>
                      <p className="text-lg font-semibold">
                        {delivery.deliveryNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        İrsaliye Türü
                      </label>
                      <div className="mt-1">
                        <Badge
                          className={`${getTypeColor(delivery.type)}`}
                        >
                          {getDeliveryTypeLabel(delivery.type)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Durum
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(delivery.status)}
                        <Badge
                          className={`${getStatusColor(delivery.status)}`}
                        >
                          {getDeliveryStatusLabel(delivery.status)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Oluşturma Tarihi
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {delivery.createdAt
                            ? new Date(
                                delivery.createdAt.seconds * 1000
                              ).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Firma Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Firma Adı
                      </label>
                      <p className="text-lg font-medium">
                        {delivery.companyInfo?.companyName || "-"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          İletişim Kişisi
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>
                            {delivery.companyInfo?.contactPerson || "-"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Telefon
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{delivery.companyInfo?.phone || "-"}</span>
                        </div>
                      </div>
                    </div>

                    {delivery.companyInfo?.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          E-posta
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{delivery.companyInfo.email}</span>
                        </div>
                      </div>
                    )}

                    {delivery.companyInfo?.address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Firma Adresi
                        </label>
                        <div className="flex items-start gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span>{delivery.companyInfo.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Teslimat Adresi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Şehir
                        </label>
                        <p>{delivery.deliveryAddress?.city || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          İlçe
                        </label>
                        <p>{delivery.deliveryAddress?.district || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Posta Kodu
                        </label>
                        <p>{delivery.deliveryAddress?.postalCode || "-"}</p>
                      </div>
                    </div>

                    {delivery.deliveryAddress?.address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Adres
                        </label>
                        <p className="mt-1">{delivery.deliveryAddress.address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Ürünler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {delivery.items?.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Ürün Adı
                            </label>
                            <p className="font-medium">{item.productName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Ürün Kodu
                            </label>
                            <p>{item.productCode || "-"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Miktar
                            </label>
                            <p>
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Açıklama
                            </label>
                            <p>{item.description || "-"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Toplam Ürün Çeşidi
                        </label>
                        <p className="text-xl font-bold text-blue-600">
                          {delivery.totalItems || (delivery.items ? delivery.items.length : 0)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Toplam Miktar
                        </label>
                        <p className="text-xl font-bold text-blue-600">
                          {delivery.totalQuantity || 
                           (delivery.items 
                             ? delivery.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
                             : 0)
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {delivery.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{delivery.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Status Management */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Durum Yönetimi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasPermission("deliveries.status_update") ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Mevcut Durum
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(delivery.status)}
                          <Badge
                            className={`${getStatusColor(delivery.status)}`}
                          >
                            {getDeliveryStatusLabel(delivery.status)}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                          Durum Değiştir
                        </label>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DELIVERY_STATUS.PREPARED}>
                              Hazırlandı
                            </SelectItem>
                            <SelectItem value={DELIVERY_STATUS.IN_TRANSIT}>
                              Yolda
                            </SelectItem>
                            <SelectItem value={DELIVERY_STATUS.DELIVERED}>
                              Teslim Edildi
                            </SelectItem>
                            <SelectItem value={DELIVERY_STATUS.RETURNED}>
                              İade
                            </SelectItem>
                            <SelectItem value={DELIVERY_STATUS.CANCELLED}>
                              İptal
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedStatus !== delivery.status && (
                        <Button
                          onClick={() => handleStatusUpdate(selectedStatus)}
                          disabled={updateLoading}
                          className="w-full"
                        >
                          {updateLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Güncelleniyor...
                            </>
                          ) : (
                            "Durumu Güncelle"
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Durum güncelleme yetkiniz bulunmuyor.</p>
                    </div>
                  )}

                  {/* Status History Placeholder */}
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">
                      Durum Geçmişi
                    </label>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {delivery.createdAt
                            ? new Date(
                                delivery.createdAt.seconds * 1000
                              ).toLocaleDateString("tr-TR")
                            : "-"}{" "}
                          - İrsaliye oluşturuldu
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}