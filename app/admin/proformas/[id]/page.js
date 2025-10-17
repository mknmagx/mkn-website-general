"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import {
  PermissionGuard,
  usePermissions,
} from "../../../../components/admin-route-guard";
import { useProforma, useUpdateProforma } from "../../../../hooks/use-proforma";
import {
  PROFORMA_STATUS,
  PROFORMA_STATUS_LABELS,
  formatPrice,
  getProformaStatusLabel,
} from "../../../../lib/services/proforma-service";
import ProformaPDFExport from "../../../../components/proforma-pdf-export";

import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { useToast } from "../../../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  ArrowLeft,
  Edit,
  Download,
  Eye,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Helper function to safely convert dates from Firestore
const convertFirestoreDate = (dateValue) => {
  if (!dateValue) return null;

  // If it's a Firestore Timestamp, convert to Date
  if (dateValue && typeof dateValue === "object" && dateValue.seconds) {
    return new Date(dateValue.seconds * 1000);
  }

  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // If it's a string or number, try to parse it
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error("Error parsing date:", dateValue, error);
    return null;
  }
};

export default function ProformaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  // Hooks
  const { proforma, loading, error, refresh } = useProforma(id);
  const { updateStatus, loading: updateLoading } = useUpdateProforma();

  // Durum güncelleme
  const handleStatusUpdate = async (newStatus) => {
    try {
      const result = await updateStatus(id, newStatus);

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

  // Durum rengi
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case PROFORMA_STATUS.DRAFT:
        return "secondary";
      case PROFORMA_STATUS.SENT:
        return "default";
      case PROFORMA_STATUS.ACCEPTED:
        return "success";
      case PROFORMA_STATUS.REJECTED:
        return "destructive";
      case PROFORMA_STATUS.EXPIRED:
        return "outline";
      default:
        return "secondary";
    }
  };

  // Toplam hesaplamaları
  const subtotal = proforma?.totalAmount || 0;
  const discountAmount = subtotal * ((proforma?.discountRate || 0) / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * ((proforma?.taxRate || 0) / 100);
  const grandTotal = taxableAmount + taxAmount;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !proforma) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">{error || "Proforma bulunamadı"}</p>
              <Button
                onClick={() => router.push("/admin/proformas")}
                className="mt-4"
              >
                Geri Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredPermission="proformas.view"
      fallback={
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Erişim Engellendi
              </h1>
              <p className="text-gray-600">
                Bu proformayı görüntülemek için gerekli izinlere sahip
                değilsiniz.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/proformas")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  Proforma Detayı
                </h1>
                <p className="text-gray-600 mt-1">{proforma.proformaNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={getStatusBadgeVariant(proforma.status)}
                className="text-sm px-3 py-1"
              >
                {getProformaStatusLabel(proforma.status)}
              </Badge>
              {hasPermission("proformas.edit") && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/proformas/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              )}
              <ProformaPDFExport
                proforma={proforma}
                fileName={`${proforma.proformaNumber}.pdf`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Ana İçerik */}
            <div className="xl:col-span-2 space-y-6">
              {/* Müşteri Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Müşteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Firma Adı</p>
                          <p className="font-medium text-gray-900">
                            {proforma.customerInfo?.companyName ||
                              "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Yetkili Kişi</p>
                          <p className="font-medium text-gray-900">
                            {proforma.customerInfo?.contactPerson ||
                              "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Telefon</p>
                          <p className="font-medium text-gray-900">
                            {proforma.customerInfo?.phone || "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">E-posta</p>
                          <p className="font-medium text-gray-900">
                            {proforma.customerInfo?.email || "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {proforma.customerInfo?.address && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Adres</p>
                          <p className="font-medium text-gray-900">
                            {proforma.customerInfo.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hizmetler */}
              <Card>
                <CardHeader>
                  <CardTitle>Hizmet Detayları</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hizmet</TableHead>
                        <TableHead className="text-center">Miktar</TableHead>
                        <TableHead className="text-center">Birim</TableHead>
                        <TableHead className="text-right">
                          Birim Fiyat
                        </TableHead>
                        <TableHead className="text-right">Toplam</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(proforma.services || []).map((service, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {service.quantity || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {service.unit || "Adet"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(
                              service.unitPrice || 0,
                              proforma.currency
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(
                              (service.quantity || 0) *
                                (service.unitPrice || 0),
                              proforma.currency
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Toplam Hesapları */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ara Toplam:</span>
                        <span className="font-medium">
                          {formatPrice(subtotal, proforma.currency)}
                        </span>
                      </div>

                      {proforma.discountRate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            İndirim (%{proforma.discountRate}):
                          </span>
                          <span className="font-medium text-green-600">
                            -{formatPrice(discountAmount, proforma.currency)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          KDV (%{proforma.taxRate || 0}):
                        </span>
                        <span className="font-medium">
                          {formatPrice(taxAmount, proforma.currency)}
                        </span>
                      </div>

                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>TOPLAM:</span>
                        <span className="text-blue-600">
                          {formatPrice(grandTotal, proforma.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Şartlar ve Notlar */}
              {(proforma.terms || proforma.notes || proforma.termsConfig) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ek Bilgiler</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {proforma.terms && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Şartlar ve Koşullar
                        </h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {proforma.terms}
                        </p>
                      </div>
                    )}

                    {/* Şartlar Konfigürasyonu Detayları */}
                    {proforma.termsConfig && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Şartlar Detayları
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Geçerlilik Süresi:
                              </span>
                              <span className="font-medium">
                                {proforma.termsConfig.validityPeriod} gün
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ödeme Türü:</span>
                              <span className="font-medium">
                                {proforma.termsConfig.paymentType ===
                                  "advance" && "%100 Peşin"}
                                {proforma.termsConfig.paymentType ===
                                  "partial" && "Kısmi Ödeme"}
                                {proforma.termsConfig.paymentType ===
                                  "credit" && "Vadeli Ödeme"}
                                {proforma.termsConfig.paymentType === "cash" &&
                                  "Nakit Ödeme"}
                              </span>
                            </div>
                            {proforma.termsConfig.paymentType === "partial" && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Avans/Kalan:
                                </span>
                                <span className="font-medium">
                                  %{proforma.termsConfig.advancePayment} / %
                                  {proforma.termsConfig.finalPayment}
                                </span>
                              </div>
                            )}
                            {proforma.termsConfig.paymentType === "credit" && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Vade Süresi:
                                </span>
                                <span className="font-medium">
                                  {proforma.termsConfig.creditDays} gün
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Teslimat Süresi:
                              </span>
                              <span className="font-medium">
                                {proforma.termsConfig.deliveryTime?.min ===
                                proforma.termsConfig.deliveryTime?.max
                                  ? `${proforma.termsConfig.deliveryTime.min} iş günü`
                                  : `${proforma.termsConfig.deliveryTime?.min}-${proforma.termsConfig.deliveryTime?.max} iş günü`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">KDV Durumu:</span>
                              <span className="font-medium">
                                {proforma.taxRate > 0
                                  ? proforma.termsConfig.vatIncluded
                                    ? "KDV Dahil"
                                    : "KDV Hariç"
                                  : "KDV Uygulanmaz"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Min. Sipariş:
                              </span>
                              <span className="font-medium">
                                {proforma.termsConfig.minimumOrderRequired
                                  ? "Gerekli"
                                  : "Gerekli Değil"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Özel Koşullar */}
                        {proforma.termsConfig.specialConditions &&
                          proforma.termsConfig.specialConditions.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="font-medium text-gray-800 mb-2">
                                Özel Koşullar:
                              </h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {proforma.termsConfig.specialConditions
                                  .filter((condition) => condition.trim())
                                  .map((condition, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start"
                                    >
                                      <span className="mr-2">•</span>
                                      <span>{condition}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}

                    {proforma.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Notlar
                        </h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {proforma.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Yan Panel */}
            <div className="space-y-6">
              {/* Genel Bilgiler */}
              <Card>
                <CardHeader>
                  <CardTitle>Genel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Oluşturma Tarihi</p>
                      <p className="font-medium">
                        {format(
                          new Date(
                            proforma.createdAt?.seconds * 1000 || Date.now()
                          ),
                          "dd MMMM yyyy HH:mm",
                          { locale: tr }
                        )}
                      </p>
                    </div>
                  </div>

                  {proforma.validUntil && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">
                          Geçerlilik Tarihi
                        </p>
                        <p className="font-medium">
                          {(() => {
                            const date = convertFirestoreDate(
                              proforma.validUntil
                            );
                            return date
                              ? format(date, "dd MMMM yyyy", { locale: tr })
                              : "Tarih belirtilmemiş";
                          })()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Para Birimi</p>
                      <p className="font-medium">{proforma.currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Durum Yönetimi */}
              <Card>
                <CardHeader>
                  <CardTitle>Durum Yönetimi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Mevcut Durum</p>
                    <Badge
                      variant={getStatusBadgeVariant(proforma.status)}
                      className="text-sm"
                    >
                      {getProformaStatusLabel(proforma.status)}
                    </Badge>
                  </div>

                  {proforma.status !== PROFORMA_STATUS.ACCEPTED &&
                    proforma.status !== PROFORMA_STATUS.REJECTED && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          Durum Değiştir
                        </p>
                        <Select
                          onValueChange={handleStatusUpdate}
                          disabled={updateLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Yeni durum seç..." />
                          </SelectTrigger>
                          <SelectContent>
                            {proforma.status === PROFORMA_STATUS.DRAFT && (
                              <SelectItem value={PROFORMA_STATUS.SENT}>
                                Gönderildi
                              </SelectItem>
                            )}
                            {proforma.status === PROFORMA_STATUS.SENT && (
                              <>
                                <SelectItem value={PROFORMA_STATUS.ACCEPTED}>
                                  Kabul Edildi
                                </SelectItem>
                                <SelectItem value={PROFORMA_STATUS.REJECTED}>
                                  Reddedildi
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Finansal Özet */}
              <Card>
                <CardHeader>
                  <CardTitle>Finansal Özet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hizmet Sayısı:</span>
                      <span className="font-medium">
                        {proforma.services?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ara Toplam:</span>
                      <span className="font-medium">
                        {formatPrice(subtotal, proforma.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Net Toplam:</span>
                      <span className="text-blue-600">
                        {formatPrice(grandTotal, proforma.currency)}
                      </span>
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
