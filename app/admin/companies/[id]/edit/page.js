"use client";

import { useState, useEffect } from "react";
import { PermissionGuard } from "../../../../../components/admin-route-guard";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import {
  getCompanyById,
  updateCompany,
} from "../../../../../lib/services/companies-service";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  Globe,
  Save,
  Plus,
  X,
  DollarSign,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newService, setNewService] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    businessLine: "ambalaj",
    status: "prospect",
    priority: "medium",
    phone: "",
    email: "",
    website: "",
    address: "",
    contactPerson: "",
    contactPosition: "",
    contactPhone: "",
    contactEmail: "",
    revenue: "",
    employees: "",
    foundedYear: "",
    monthlyBudget: "",
    description: "",
    tags: [],
    services: [],
    socialMedia: {
      linkedin: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
  });

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        const companyData = await getCompanyById(params.id);
        if (companyData) {
          setFormData({
            name: companyData.name || "",
            businessLine: companyData.businessLine || "ambalaj",
            status: companyData.status || "lead",
            priority: companyData.priority || "medium",
            phone: companyData.phone || "",
            email: companyData.email || "",
            website: companyData.website || "",
            address: companyData.address || "",
            contactPerson: companyData.contactPerson || "",
            contactPosition: companyData.contactPosition || "",
            contactPhone: companyData.contactPhone || "",
            contactEmail: companyData.contactEmail || "",
            revenue: companyData.revenue || "",
            employees: companyData.employees || "",
            foundedYear: companyData.foundedYear || "",
            monthlyBudget: companyData.monthlyBudget || "",
            description: companyData.description || "",
            // Ensure arrays are initialized
            tags: companyData.tags || [],
            services: companyData.services || [],
            socialMedia: companyData.socialMedia || {
              linkedin: "",
              instagram: "",
              facebook: "",
              twitter: "",
            },
          });
        } else {
          // Firma bulunamadı, hata göster
          console.error("Company not found");
          alert("Firma bulunamadı!");
          router.push("/admin/companies");
        }
      } catch (error) {
        console.error("Error loading company:", error);
        alert("Firma bilgileri yüklenirken bir hata oluştu!");
        router.push("/admin/companies");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadCompany();
    }
  }, [params.id]);

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

  const addTag = () => {
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const addService = () => {
    if (
      newService.trim() &&
      !(formData.services || []).includes(newService.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        services: [...(prev.services || []), newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (serviceToRemove) => {
    setFormData((prev) => ({
      ...prev,
      services: (prev.services || []).filter(
        (service) => service !== serviceToRemove
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.name.trim()) {
      alert("Firma adı zorunludur!");
      return;
    }

    if (!formData.businessLine) {
      alert("İş kolu seçimi zorunludur!");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Telefon numarası zorunludur!");
      return;
    }

    if (!formData.email.trim()) {
      alert("E-posta adresi zorunludur!");
      return;
    }

    if (!formData.contactPerson.trim()) {
      alert("İletişim kişisi zorunludur!");
      return;
    }

    setSaving(true);

    try {
      // Updating company data

      await updateCompany(params.id, formData);
      alert("Firma başarıyla güncellendi!");

      // Firma detay sayfasına yönlendir
      router.push(`/admin/companies/${params.id}`);
    } catch (error) {
      console.error("Error updating company:", error);
      alert("Firma güncellenirken bir hata oluştu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Bu firmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      )
    ) {
      setSaving(true);
      try {
        // Deleting company

        const { deleteCompany } = await import(
          "../../../../../lib/services/companies-service"
        );
        await deleteCompany(params.id);
        alert("Firma başarıyla silindi!");

        // Firmalar listesine yönlendir
        router.push("/admin/companies");
      } catch (error) {
        console.error("Error deleting company:", error);
        alert("Firma silinirken bir hata oluştu: " + error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <PermissionGuard requiredPermission="companies.write">
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-lg text-gray-600">
                  Firma bilgileri yükleniyor...
                </div>
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  const businessLineOptions = [
    { value: "ambalaj", label: "Ambalaj Üretimi" },
    { value: "eticaret", label: "E-ticaret Danışmanlığı" },
    { value: "pazarlama", label: "Dijital Pazarlama" },
    { value: "fason-kozmetik", label: "Fason Kozmetik Üretimi" },
    { value: "fason-gida", label: "Fason Gıda Üretimi" },
    { value: "fason-temizlik", label: "Fason Temizlik Üretimi" },
    { value: "tasarim", label: "Tasarım Hizmetleri" },
  ];

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
      <div className="min-h-screen bg-gray-50">
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
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  {formData.name} - Düzenle
                </h1>
                <p className="text-gray-600 mt-2">
                  Firma bilgilerini güncelleyin
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Sil
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>
                  Firmanın temel bilgilerini güncelleyin
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
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
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
                      <option value="">İş kolu seçin</option>
                      {businessLineOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
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
                      <option value="lead">Potansiyel</option>
                      <option value="prospect">Potansiyel (Yeni)</option>
                      <option value="negotiation">Görüşme</option>
                      <option value="active">Aktif</option>
                      <option value="client">Müşteri</option>
                      <option value="paused">Beklemede</option>
                      <option value="inactive">Pasif</option>
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
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Tam adres bilgisi..."
                    rows={2}
                  />
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

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>İş Bilgileri</CardTitle>
                <CardDescription>Bütçe ve hizmet bilgileri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Aylık Bütçe
                  </label>
                  <Input
                    type="text"
                    value={formData.monthlyBudget}
                    onChange={(e) =>
                      handleInputChange("monthlyBudget", e.target.value)
                    }
                    placeholder="15.000 TL"
                  />
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hizmetler
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Hizmet adı girin..."
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addService())
                      }
                    />
                    <Button type="button" onClick={addService} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.services || []).map((service, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => removeService(service)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiketler
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Etiket adı girin..."
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-blue-100 text-blue-800 flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Sosyal Medya</CardTitle>
                <CardDescription>
                  Firmanın sosyal medya hesapları
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
                        handleInputChange(
                          "socialMedia.linkedin",
                          e.target.value
                        )
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
                        handleInputChange(
                          "socialMedia.instagram",
                          e.target.value
                        )
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
                        handleInputChange(
                          "socialMedia.facebook",
                          e.target.value
                        )
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

            {/* Submit Buttons */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-4">
                <Link href={`/admin/companies/${params.id}`}>
                  <Button type="button" variant="outline">
                    İptal
                  </Button>
                </Link>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}
