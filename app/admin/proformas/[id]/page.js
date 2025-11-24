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
  CardDescription,
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
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Proforma yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !proforma) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card className="max-w-md w-full bg-white dark:bg-gray-800 border-none shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Proforma Bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || "İstediğiniz proforma bulunamadı veya erişim izniniz yok."}
              </p>
              <Button
                onClick={() => router.push("/admin/proformas")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Proforma Listesine Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="proformas.view" showMessage={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Modern Header */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin/proformas")}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    Proforma Detayı
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 ml-14">
                    {proforma.proformaNumber}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* Status Badge */}
                <Badge
                  variant={getStatusBadgeVariant(proforma.status)}
                  className="px-4 py-2 text-base"
                >
                  {getProformaStatusLabel(proforma.status)}
                </Badge>
                
                {/* Action Buttons */}
                {hasPermission("proformas.edit") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/proformas/${id}/edit`)}
                    className="border-2"
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
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Ana İçerik - Sol Taraf */}
            <div className="xl:col-span-2 space-y-6">
              {/* Müşteri Bilgileri */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Müşteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Firma Adı</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {proforma.customerInfo?.companyName || "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <User className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yetkili Kişi</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {proforma.customerInfo?.contactPerson || "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {proforma.customerInfo?.phone || "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {proforma.customerInfo?.email || "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {proforma.customerInfo?.address && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <MapPin className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Adres</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {proforma.customerInfo.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hizmetler */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
                      <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Hizmet Detayları
                  </CardTitle>
                  <CardDescription>
                    Toplam {(proforma.services || []).length} hizmet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2">
                          <TableHead className="font-bold">Hizmet</TableHead>
                          <TableHead className="text-center font-bold">Miktar</TableHead>
                          <TableHead className="text-center font-bold">Birim</TableHead>
                          <TableHead className="text-right font-bold">Birim Fiyat</TableHead>
                          <TableHead className="text-right font-bold">Toplam</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(proforma.services || []).map((service, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <TableCell className="max-w-md">
                              <div className="group relative">
                                <p className="font-semibold text-gray-900 dark:text-white break-words">{service.name}</p>
                                {service.description && (
                                  <>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words line-clamp-3">
                                      {service.description}
                                    </p>
                                    {/* Hover Tooltip */}
                                    <div className="invisible group-hover:visible absolute z-50 left-0 top-full mt-2 p-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-2xl max-w-md w-max border-2 border-gray-700 dark:border-gray-300">
                                      <div className="font-semibold mb-2 text-blue-300 dark:text-blue-600">{service.name}</div>
                                      <div className="whitespace-normal leading-relaxed">{service.description}</div>
                                      <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 dark:bg-gray-100 border-l-2 border-t-2 border-gray-700 dark:border-gray-300 transform rotate-45"></div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium whitespace-nowrap">
                              {service.quantity || 0}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="whitespace-nowrap">{service.unit || "Adet"}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">
                              {formatPrice(service.unitPrice || 0, proforma.currency)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {formatPrice(
                                (service.quantity || 0) * (service.unitPrice || 0),
                                proforma.currency
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Toplam Hesapları */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 dark:text-gray-400">Ara Toplam:</span>
                        <span className="font-semibold text-gray-900 dark:text-white text-lg">
                          {formatPrice(subtotal, proforma.currency)}
                        </span>
                      </div>

                      {proforma.discountRate > 0 && (
                        <div className="flex justify-between items-center py-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3">
                          <span className="text-green-700 dark:text-green-400">
                            İndirim (%{proforma.discountRate}):
                          </span>
                          <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                            -{formatPrice(discountAmount, proforma.currency)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          KDV (%{proforma.taxRate || 0}):
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white text-lg">
                          {formatPrice(taxAmount, proforma.currency)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xl font-bold pt-3 mt-3 border-t-2 border-gray-300 dark:border-gray-600">
                        <span className="text-gray-900 dark:text-white">TOPLAM:</span>
                        <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                          {formatPrice(grandTotal, proforma.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Şartlar ve Notlar */}
              {(proforma.terms || proforma.notes || proforma.termsConfig) && (
                <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      Ek Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {proforma.terms && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Şartlar ve Koşullar
                        </h4>
                        <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line leading-relaxed">
                          {proforma.terms}
                        </p>
                      </div>
                    )}

                    {/* Şartlar Konfigürasyonu Detayları */}
                    {proforma.termsConfig && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Şartlar Detayları
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                              <span className="text-gray-600 dark:text-gray-400">
                                Geçerlilik Süresi:
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
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

            {/* Yan Panel - Sağ Taraf */}
            <div className="space-y-6">
              {/* Genel Bilgiler ve Durum Yönetimi - Birleştirilmiş */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 shadow-md">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    Proforma Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Durum Badge - En Üstte */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850 border-2 border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Mevcut Durum</p>
                    <Badge
                      variant={getStatusBadgeVariant(proforma.status)}
                      className="text-base px-4 py-2 w-full justify-center"
                    >
                      {getProformaStatusLabel(proforma.status)}
                    </Badge>
                  </div>

                  {/* Durum Güncelleme */}
                  {proforma.status !== PROFORMA_STATUS.ACCEPTED &&
                    proforma.status !== PROFORMA_STATUS.REJECTED &&
                    hasPermission("proformas.edit") && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Durumu Güncelle
                        </p>
                        <Select
                          onValueChange={handleStatusUpdate}
                          disabled={updateLoading}
                        >
                          <SelectTrigger className="border-2 h-11 bg-white dark:bg-gray-800">
                            <SelectValue placeholder="Yeni durum seç..." />
                          </SelectTrigger>
                          <SelectContent>
                            {proforma.status === PROFORMA_STATUS.DRAFT && (
                              <SelectItem value={PROFORMA_STATUS.SENT}>
                                📤 Gönderildi
                              </SelectItem>
                            )}
                            {proforma.status === PROFORMA_STATUS.SENT && (
                              <>
                                <SelectItem value={PROFORMA_STATUS.ACCEPTED}>
                                  ✅ Kabul Edildi
                                </SelectItem>
                                <SelectItem value={PROFORMA_STATUS.REJECTED}>
                                  ❌ Reddedildi
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        {updateLoading && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-blue-600 dark:text-blue-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Güncelleniyor...
                          </div>
                        )}
                      </div>
                    )}

                  {/* Tarih Bilgileri */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Oluşturma Tarihi</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {format(
                            new Date(proforma.createdAt?.seconds * 1000 || Date.now()),
                            "dd MMMM yyyy HH:mm",
                            { locale: tr }
                          )}
                        </p>
                      </div>
                    </div>

                    {proforma.validUntil && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                            Geçerlilik Tarihi
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {(() => {
                              const date = convertFirestoreDate(proforma.validUntil);
                              return date
                                ? format(date, "dd MMMM yyyy", { locale: tr })
                                : "Tarih belirtilmemiş";
                            })()}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Para Birimi</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{proforma.currency}</p>
                      </div>
                    </div>
                  </div>

                  {/* İstatistikler */}
                  <div className="pt-4 mt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                        <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Hizmet</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                          {(proforma.services || []).length}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Toplam</p>
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {formatPrice(grandTotal, proforma.currency).split(' ')[0]}
                        </p>
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
