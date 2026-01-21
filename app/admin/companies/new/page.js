"use client";

import { useState, useEffect } from "react";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { createCompany } from "../../../../lib/services/companies-service";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Globe,
  Save,
  Plus,
  X,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

export default function NewCompanyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    businessLine: "ambalaj",
    status: "lead",
    priority: "medium",
    phone: "",
    email: "",
    website: "",
    address: "",
    contactPerson: "",
    contactPosition: "",
    contactPhone: "",
    contactEmail: "",
    employees: "",
    foundedYear: "",
    description: "",
    taxOffice: "",
    taxNumber: "",
    mersisNumber: "",
    projectDetails: {
      productType: "",
      packagingType: "",
      monthlyVolume: "",
      unitPrice: "",
      expectedMonthlyValue: "",
      projectDescription: "",
      specifications: "",
      deliverySchedule: "",
    },
    contractDetails: {
      contractStart: "",
      contractEnd: "",
      contractValue: "",
      paymentTerms: "",
      deliveryTerms: "",
    },
    socialMedia: {
      linkedin: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
  });

  // URL parametrelerinden pre-fill
  useEffect(() => {
    if (searchParams) {
      const prefillData = {};
      
      // Desteklenen parametreler
      const paramMappings = {
        name: 'name',
        email: 'email',
        phone: 'phone',
        contactPerson: 'contactPerson',
        contactEmail: 'contactEmail',
        contactPhone: 'contactPhone',
        website: 'website',
        address: 'address',
        taxNumber: 'taxNumber',
        mersisNumber: 'mersisNumber',
        businessLine: 'businessLine',
        description: 'description',
      };

      Object.entries(paramMappings).forEach(([param, field]) => {
        const value = searchParams.get(param);
        if (value) {
          prefillData[field] = value;
        }
      });

      // Eğer contactEmail/contactPhone yoksa email/phone'dan kopyala
      if (prefillData.email && !prefillData.contactEmail) {
        prefillData.contactEmail = prefillData.email;
      }
      if (prefillData.phone && !prefillData.contactPhone) {
        prefillData.contactPhone = prefillData.phone;
      }

      if (Object.keys(prefillData).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...prefillData,
        }));
      }
    }
  }, [searchParams]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firestore'a kaydet
      // Saving company data
      
      const companyId = await createCompany(formData);
      // Company created successfully

      toast({
        title: "Başarılı",
        description: "Firma başarıyla eklendi!",
      });

      // Firmalar listesine yönlendir
      router.push("/admin/companies");
    } catch (error) {
      toast({
        title: "Hata",
        description: "Firma eklenirken bir hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = [
    "1-10",
    "11-25",
    "26-50",
    "51-100",
    "101-250",
    "251-500",
    "500+",
  ];

  return (
    <PermissionGuard requiredPermission="companies.write">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                Yeni Firma Ekle
              </h1>
              <p className="text-gray-600 mt-2">
                Yeni bir firma oluşturun ve detaylı bilgilerini kaydedin
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
              <CardDescription>
                Firmanın temel bilgilerini girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma Adı *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Örn: TechCorp Solutions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İş Kolu *
                  </label>
                  <select
                    required
                    value={formData.businessLine}
                    onChange={(e) =>
                      handleInputChange("businessLine", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ambalaj">Ambalaj Üretimi</option>
                    <option value="eticaret">E-ticaret Yönetimi</option>
                    <option value="pazarlama">Pazarlama Hizmetleri</option>
                    <option value="fason-kozmetik">
                      Fason Üretim - Kozmetik
                    </option>
                    <option value="fason-gida">
                      Fason Üretim - Gıda Takviyesi
                    </option>
                    <option value="fason-temizlik">
                      Fason Üretim - Temizlik Ürünleri
                    </option>
                    <option value="tasarim">Tasarım Hizmetleri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lead">Potansiyel Müşteri</option>
                    <option value="negotiation">Görüşme Aşamasında</option>
                    <option value="active-client">Aktif Müşteri</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="paused">Beklemede</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kuruluş Yılı
                  </label>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.foundedYear}
                    onChange={(e) =>
                      handleInputChange("foundedYear", e.target.value)
                    }
                    placeholder="2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Çalışan Sayısı
                  </label>
                  <select
                    value={formData.employees}
                    onChange={(e) =>
                      handleInputChange("employees", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Çalışan sayısı seçin</option>
                    {employeeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma Açıklaması
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Firma hakkında kısa açıklama..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
              <CardDescription>
                Firmanın genel iletişim bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefon *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+90 212 555 0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    E-posta *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="info@firma.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline h-4 w-4 mr-1" />
                    Website
                  </label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    placeholder="https://www.firma.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Yıllık Ciro
                  </label>
                  <Input
                    type="text"
                    value={formData.revenue}
                    onChange={(e) =>
                      handleInputChange("revenue", e.target.value)
                    }
                    placeholder="2.5M TL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Adres
                </label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Tam adres bilgisi..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vergi Bilgileri</CardTitle>
              <CardDescription>
                Şirketin resmi vergi ve ticaret sicil bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vergi Dairesi
                  </label>
                  <Input
                    type="text"
                    value={formData.taxOffice}
                    onChange={(e) =>
                      handleInputChange("taxOffice", e.target.value)
                    }
                    placeholder="Beşiktaş Vergi Dairesi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vergi Numarası
                  </label>
                  <Input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) =>
                      handleInputChange("taxNumber", e.target.value)
                    }
                    placeholder="1234567890"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mersis Numarası
                  </label>
                  <Input
                    type="text"
                    value={formData.mersisNumber}
                    onChange={(e) =>
                      handleInputChange("mersisNumber", e.target.value)
                    }
                    placeholder="0123456789012345"
                    maxLength={16}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card>
            <CardHeader>
              <CardTitle>İletişim Kişisi</CardTitle>
              <CardDescription>
                Ana iletişim kurulacak kişinin bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline h-4 w-4 mr-1" />
                    İsim Soyisim *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) =>
                      handleInputChange("contactPerson", e.target.value)
                    }
                    placeholder="Ahmet Yılmaz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pozisyon
                  </label>
                  <Input
                    type="text"
                    value={formData.contactPosition}
                    onChange={(e) =>
                      handleInputChange("contactPosition", e.target.value)
                    }
                    placeholder="Pazarlama Müdürü"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Direkt Telefon
                  </label>
                  <Input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      handleInputChange("contactPhone", e.target.value)
                    }
                    placeholder="+90 532 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Direkt E-posta
                  </label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                    placeholder="ahmet.yilmaz@firma.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Proje Detayları</CardTitle>
              <CardDescription>İş detayları ve proje bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Tipi
                  </label>
                  <Input
                    type="text"
                    value={formData.projectDetails.productType}
                    onChange={(e) =>
                      handleInputChange(
                        "projectDetails.productType",
                        e.target.value
                      )
                    }
                    placeholder="Örn: Kozmetik Ürünleri"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ambalaj Tipi
                  </label>
                  <Input
                    type="text"
                    value={formData.projectDetails.packagingType}
                    onChange={(e) =>
                      handleInputChange(
                        "projectDetails.packagingType",
                        e.target.value
                      )
                    }
                    placeholder="Örn: Şişe, Kutu, Tüp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aylık Hacim
                  </label>
                  <Input
                    type="text"
                    value={formData.projectDetails.monthlyVolume}
                    onChange={(e) =>
                      handleInputChange(
                        "projectDetails.monthlyVolume",
                        e.target.value
                      )
                    }
                    placeholder="Örn: 50.000 adet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim Fiyat
                  </label>
                  <Input
                    type="text"
                    value={formData.projectDetails.unitPrice}
                    onChange={(e) =>
                      handleInputChange(
                        "projectDetails.unitPrice",
                        e.target.value
                      )
                    }
                    placeholder="Örn: 2.50 TL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beklenen Aylık Değer
                  </label>
                  <Input
                    type="text"
                    value={formData.projectDetails.expectedMonthlyValue}
                    onChange={(e) =>
                      handleInputChange(
                        "projectDetails.expectedMonthlyValue",
                        e.target.value
                      )
                    }
                    placeholder="Örn: 125.000 TL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Programı
                  </label>
                  <Input
                    type="text"
                    value={formData.projectDetails.deliverySchedule}
                    onChange={(e) =>
                      handleInputChange(
                        "projectDetails.deliverySchedule",
                        e.target.value
                      )
                    }
                    placeholder="Örn: Aylık 4 parti"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proje Açıklaması
                </label>
                <Textarea
                  value={formData.projectDetails.projectDescription}
                  onChange={(e) =>
                    handleInputChange(
                      "projectDetails.projectDescription",
                      e.target.value
                    )
                  }
                  placeholder="Proje hakkında detaylı açıklama..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teknik Özellikler
                </label>
                <Textarea
                  value={formData.projectDetails.specifications}
                  onChange={(e) =>
                    handleInputChange(
                      "projectDetails.specifications",
                      e.target.value
                    )
                  }
                  placeholder="Teknik özellikler ve gereksinimler..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle>Sözleşme Detayları</CardTitle>
              <CardDescription>
                Sözleşme ve finansal bilgiler (opsiyonel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sözleşme Başlangıç
                  </label>
                  <Input
                    type="date"
                    value={formData.contractDetails.contractStart}
                    onChange={(e) =>
                      handleInputChange(
                        "contractDetails.contractStart",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sözleşme Bitiş
                  </label>
                  <Input
                    type="date"
                    value={formData.contractDetails.contractEnd}
                    onChange={(e) =>
                      handleInputChange(
                        "contractDetails.contractEnd",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sözleşme Değeri
                  </label>
                  <Input
                    type="text"
                    value={formData.contractDetails.contractValue}
                    onChange={(e) =>
                      handleInputChange(
                        "contractDetails.contractValue",
                        e.target.value
                      )
                    }
                    placeholder="Örn: 1.500.000 TL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ödeme Koşulları
                  </label>
                  <Input
                    type="text"
                    value={formData.contractDetails.paymentTerms}
                    onChange={(e) =>
                      handleInputChange(
                        "contractDetails.paymentTerms",
                        e.target.value
                      )
                    }
                    placeholder="Örn: 30 gün vade"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Koşulları
                  </label>
                  <Input
                    type="text"
                    value={formData.contractDetails.deliveryTerms}
                    onChange={(e) =>
                      handleInputChange(
                        "contractDetails.deliveryTerms",
                        e.target.value
                      )
                    }
                    placeholder="Örn: EXW İstanbul"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Sosyal Medya</CardTitle>
              <CardDescription>
                Firmanın sosyal medya hesapları (opsiyonel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <Input
                    type="url"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) =>
                      handleInputChange("socialMedia.linkedin", e.target.value)
                    }
                    placeholder="https://linkedin.com/company/firma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <Input
                    type="url"
                    value={formData.socialMedia.instagram}
                    onChange={(e) =>
                      handleInputChange("socialMedia.instagram", e.target.value)
                    }
                    placeholder="https://instagram.com/firma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <Input
                    type="url"
                    value={formData.socialMedia.facebook}
                    onChange={(e) =>
                      handleInputChange("socialMedia.facebook", e.target.value)
                    }
                    placeholder="https://facebook.com/firma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <Input
                    type="url"
                    value={formData.socialMedia.twitter}
                    onChange={(e) =>
                      handleInputChange("socialMedia.twitter", e.target.value)
                    }
                    placeholder="https://twitter.com/firma"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link href="/admin/companies">
              <Button type="button" variant="outline">
                İptal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Firmayı Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
