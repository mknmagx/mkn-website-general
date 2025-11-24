"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../../components/admin-route-guard";
import {
  useProforma,
  useUpdateProforma,
} from "../../../../../hooks/use-proforma";
import { getAllCompanies } from "../../../../../lib/services/companies-service";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  SERVICE_TEMPLATES,
  CURRENCIES,
  getServiceTemplate,
  formatPrice,
} from "../../../../../lib/services/proforma-service";
import ProformaPDFExport from "../../../../../components/proforma-pdf-export";
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
import { useToast } from "../../../../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Building2,
  Calculator,
  Download,
  Eye,
  ArrowLeft,
  Edit3,
  Sparkles,
  Package,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";

// Helper function to safely convert dates from Firestore
const convertFirestoreDate = (dateValue) => {
  if (!dateValue) return "";

  // If it's a Firestore Timestamp, convert to Date
  if (dateValue && typeof dateValue === "object" && dateValue.seconds) {
    const date = new Date(dateValue.seconds * 1000);
    return date.toISOString().split("T")[0];
  }

  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split("T")[0];
  }

  // If it's a string, try to parse it
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error parsing date:", dateValue, error);
    return "";
  }
};

export default function EditProformaPage({ params }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { proforma, loading: proformaLoading } = useProforma(id);
  const { updateProforma, loading: updateLoading } = useUpdateProforma();

  // Form state
  const [formData, setFormData] = useState({
    customerInfo: {
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    },
    services: [],
    currency: CURRENCIES.TRY,
    taxRate: 20,
    discountRate: 0,
    validUntil: "",
    terms: "",
    notes: "",
  });

  // Terms configuration state
  const [termsConfig, setTermsConfig] = useState({
    validityPeriod: 30, // gün
    paymentType: "partial", // "advance", "partial", "credit", "cash"
    advancePayment: 50, // %
    finalPayment: 50, // %
    creditDays: 0, // kredi vadesi
    deliveryTime: { min: 15, max: 20 }, // iş günü
    minimumOrderRequired: true,
    vatIncluded: false, // KDV dahil mi?
    specialConditions: [], // özel koşullar
  });

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Proforma verilerini yükle
  useEffect(() => {
    if (proforma) {
      // Form verilerini doldur
      setFormData({
        customerInfo: {
          companyName: proforma.customerInfo?.companyName || "",
          contactPerson: proforma.customerInfo?.contactPerson || "",
          phone: proforma.customerInfo?.phone || "",
          email: proforma.customerInfo?.email || "",
          address: proforma.customerInfo?.address || "",
        },
        services: proforma.services || [],
        currency: proforma.currency || CURRENCIES.TRY,
        taxRate: proforma.taxRate || 20,
        discountRate: proforma.discountRate || 0,
        validUntil: convertFirestoreDate(proforma.validUntil),
        terms: proforma.terms || "",
        notes: proforma.notes || "",
      });

      // Şartlar konfigürasyonunu doldur
      if (proforma.termsConfig) {
        setTermsConfig({
          validityPeriod: proforma.termsConfig.validityPeriod || 30,
          paymentType: proforma.termsConfig.paymentType || "partial",
          advancePayment: proforma.termsConfig.advancePayment || 50,
          finalPayment: proforma.termsConfig.finalPayment || 50,
          creditDays: proforma.termsConfig.creditDays || 0,
          deliveryTime: proforma.termsConfig.deliveryTime || {
            min: 15,
            max: 20,
          },
          minimumOrderRequired:
            proforma.termsConfig.minimumOrderRequired !== false,
          vatIncluded: proforma.termsConfig.vatIncluded || false,
          specialConditions: proforma.termsConfig.specialConditions || [],
        });
      }

      // Şirket ID'sini ayarla
      if (proforma.companyId) {
        setSelectedCompanyId(proforma.companyId);
      }
    }
  }, [proforma]);

  // Firmaları yükle
  useEffect(() => {
    if (user) {
      loadCompanies();
    }
  }, [user]);

  const loadCompanies = async () => {
    try {
      const companiesData = await getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error("Error loading companies:", error);
      toast({
        title: "Hata",
        description: "Firmalar yüklenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Firma seçimi
  const handleCompanySelect = (companyId) => {
    setSelectedCompanyId(companyId);
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      setFormData((prev) => ({
        ...prev,
        customerInfo: {
          companyName: company.name || company.companyName || "",
          contactPerson: company.contactPerson || "",
          phone: company.phone || company.contactPhone || "",
          email: company.email || company.contactEmail || "",
          address: company.address || "",
        },
      }));
    }
  };

  // Kategori seçimi
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const template = getServiceTemplate(category);

    if (template.length > 0) {
      // Şablondaki hizmetleri mevcut hizmetlere ekle
      setFormData((prev) => ({
        ...prev,
        services: [
          ...prev.services,
          ...template.map((service) => ({
            ...service,
            id: Date.now() + Math.random(),
            quantity: 1,
            unitPrice: 0,
          })),
        ],
      }));
    }
  };

  // Input değişiklikleri
  const handleInputChange = (section, field, value) => {
    if (section === "customerInfo") {
      setFormData((prev) => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Hizmet ekleme
  const addCustomService = () => {
    const newService = {
      id: Date.now(),
      name: "",
      description: "",
      quantity: 1,
      unit: "Adet",
      unitPrice: 0,
    };

    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  };

  // Hizmet güncelleme
  const updateService = (serviceId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.id === serviceId ? { ...service, [field]: value } : service
      ),
    }));
  };

  // Hizmet silme
  const removeService = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service.id !== serviceId),
    }));
  };

  // Otomatik şartlar ve koşullar oluşturma
  const generateTermsText = () => {
    const {
      validityPeriod,
      paymentType,
      advancePayment,
      finalPayment,
      creditDays,
      deliveryTime,
      minimumOrderRequired,
      vatIncluded,
      specialConditions,
    } = termsConfig;

    let terms = [];

    // Geçerlilik süresi - mecburi
    if (validityPeriod > 0) {
      terms.push(
        `• Bu proforma fiyat teklifi ${validityPeriod} gün süreyle geçerlidir.`
      );
    }

    // KDV durumu - otomatik belirleme
    if (formData.taxRate > 0) {
      const vatText = vatIncluded ? "KDV dahildir" : "KDV hariçtir";
      terms.push(`• Fiyatlar ${vatText}.`);
    } else {
      terms.push(`• Fiyatlar KDV uygulanmaz.`);
    }

    // Ödeme şartları - mecburi seçim
    let paymentText = "";
    switch (paymentType) {
      case "advance":
        paymentText = `• Ödeme şartları: %100 peşin ödeme gereklidir.`;
        break;
      case "partial":
        if (advancePayment > 0 && finalPayment > 0) {
          paymentText = `• Ödeme şartları: %${advancePayment} avans, %${finalPayment} teslimat öncesi ödeme.`;
        }
        break;
      case "credit":
        if (creditDays > 0) {
          paymentText = `• Ödeme şartları: ${creditDays} gün vadeli ödeme.`;
        }
        break;
      case "cash":
        paymentText = `• Ödeme şartları: Nakit ödeme gereklidir.`;
        break;
    }
    if (paymentText) {
      terms.push(paymentText);
    }

    // Teslimat süresi - mecburi
    if (deliveryTime.min > 0 && deliveryTime.max > 0) {
      if (deliveryTime.min === deliveryTime.max) {
        terms.push(
          `• Teslimat süresi: Sipariş onayından sonra ${deliveryTime.min} iş günü.`
        );
      } else if (deliveryTime.max > deliveryTime.min) {
        terms.push(
          `• Teslimat süresi: Sipariş onayından sonra ${deliveryTime.min}-${deliveryTime.max} iş günü.`
        );
      }
    }

    // Minimum sipariş
    if (minimumOrderRequired) {
      terms.push(`• Minimum sipariş miktarları geçerlidir.`);
    }

    // Özel koşullar - sadece dolu olanları ekle
    specialConditions.forEach((condition) => {
      if (condition.trim()) {
        terms.push(`• ${condition.trim()}`);
      }
    });

    // Standart yasal koşul
    terms.push(
      `• Bu proforma yasal bir sözleşme değildir, yalnızca fiyat bilgilendirmesi amaçlıdır.`
    );

    return terms.join("\n");
  };

  // Şartlar konfigürasyonunu güncelleme
  const updateTermsConfig = (field, value) => {
    setTermsConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Şartlar otomatik güncellemesi
  useEffect(() => {
    const generatedTerms = generateTermsText();
    setFormData((prev) => ({
      ...prev,
      terms: generatedTerms,
    }));
  }, [termsConfig, formData.taxRate]);

  // KDV durumu otomatik güncelleme
  useEffect(() => {
    setTermsConfig((prev) => ({
      ...prev,
      vatIncluded: formData.taxRate > 0 ? prev.vatIncluded : false,
    }));
  }, [formData.taxRate]);

  // Geçerlilik tarihi otomatik güncelleme
  useEffect(() => {
    if (termsConfig.validityPeriod > 0) {
      const validUntilDate = new Date();
      validUntilDate.setDate(
        validUntilDate.getDate() + termsConfig.validityPeriod
      );
      const formattedDate = validUntilDate.toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        validUntil: formattedDate,
      }));
    }
  }, [termsConfig.validityPeriod]);

  // Toplam hesaplama
  const calculateTotal = () => {
    return formData.services.reduce((total, service) => {
      return total + (service.quantity || 0) * (service.unitPrice || 0);
    }, 0);
  };

  const subtotal = calculateTotal();
  const discountAmount = subtotal * (formData.discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (formData.taxRate / 100);
  const grandTotal = taxableAmount + taxAmount;

  // Form gönderimi
  const handleSubmit = async () => {
    try {
      // Validasyon
      if (!formData.customerInfo.companyName.trim()) {
        toast({
          title: "Hata",
          description: "Firma adı gereklidir",
          variant: "destructive",
        });
        return;
      }

      if (formData.services.length === 0) {
        toast({
          title: "Hata",
          description: "En az bir hizmet eklemelisiniz",
          variant: "destructive",
        });
        return;
      }

      // Şartlar validasyonu
      if (termsConfig.validityPeriod <= 0) {
        toast({
          title: "Hata",
          description: "Geçerlilik süresi 1-365 gün arası olmalıdır",
          variant: "destructive",
        });
        return;
      }

      if (
        termsConfig.deliveryTime.min <= 0 ||
        termsConfig.deliveryTime.max < termsConfig.deliveryTime.min
      ) {
        toast({
          title: "Hata",
          description: "Teslimat süresi doğru şekilde girilmelidir",
          variant: "destructive",
        });
        return;
      }

      if (
        termsConfig.paymentType === "partial" &&
        (termsConfig.advancePayment <= 0 || termsConfig.advancePayment >= 100)
      ) {
        toast({
          title: "Hata",
          description: "Kısmi ödeme için avans oranı 1-99% arası olmalıdır",
          variant: "destructive",
        });
        return;
      }

      if (termsConfig.paymentType === "credit" && termsConfig.creditDays <= 0) {
        toast({
          title: "Hata",
          description: "Vadeli ödeme için vade süresi belirtilmelidir",
          variant: "destructive",
        });
        return;
      }

      const proformaData = {
        ...formData,
        companyId: selectedCompanyId || null,
        validUntil: new Date(formData.validUntil),
        totalAmount: subtotal,
        discountAmount,
        taxAmount,
        grandTotal,
        termsConfig,
        updatedBy: user.uid,
        updatedAt: new Date(),
      };

      const result = await updateProforma(id, proformaData);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Proforma güncellendi",
        });

        router.push(`/admin/proformas/${id}`);
      }
    } catch (error) {
      console.error("Error updating proforma:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Loading states
  if (authLoading || proformaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Proforma yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredPermission="proformas.edit"
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
          <div className="flex items-center justify-center h-screen">
            <Card className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 border-none shadow-lg">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-2">
                  <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Erişim Engellendi
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Proforma düzenlemek için gerekli izinlere sahip değilsiniz.
                </p>
                <Button
                  onClick={() => router.push("/admin/proformas")}
                  variant="outline"
                  className="mt-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Proforma Listesine Dön
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
        {/* Modern Header */}
        <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/admin/proformas/${id}`)}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri
                </Button>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-2 shadow-md">
                    <Edit3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Proforma Düzenle
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {proforma?.proformaNumber || "PRF-XXXX"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {proforma && (
                  <ProformaPDFExport
                    proforma={{
                      ...proforma,
                      ...formData,
                      termsConfig,
                      totalAmount: subtotal,
                      discountAmount,
                      taxAmount,
                      grandTotal,
                    }}
                    fileName={`${proforma.proformaNumber}_updated.pdf`}
                  >
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF İndir
                    </Button>
                  </ProformaPDFExport>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={updateLoading}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="xl:col-span-2 space-y-6">
              {/* Müşteri Bilgileri */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-2 shadow-md">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Müşteri Bilgileri
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Proforma müşteri bilgilerini güncelleyin
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  {/* Firma Seçimi */}
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      <Sparkles className="h-4 w-4 inline mr-2 text-purple-600 dark:text-purple-400" />
                      Kayıtlı Firmalardan Hızlı Seçim
                    </label>
                    <Select
                      value={selectedCompanyId}
                      onValueChange={handleCompanySelect}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700">
                        <SelectValue placeholder="Bir firma seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name || company.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Firma Adı <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.customerInfo.companyName}
                        onChange={(e) =>
                          handleInputChange(
                            "customerInfo",
                            "companyName",
                            e.target.value
                          )
                        }
                        placeholder="Firma adını girin"
                        required
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Yetkili Kişi
                      </label>
                      <Input
                        value={formData.customerInfo.contactPerson}
                        onChange={(e) =>
                          handleInputChange(
                            "customerInfo",
                            "contactPerson",
                            e.target.value
                          )
                        }
                        placeholder="Yetkili kişi adını girin"
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Telefon
                      </label>
                      <Input
                        value={formData.customerInfo.phone}
                        onChange={(e) =>
                          handleInputChange(
                            "customerInfo",
                            "phone",
                            e.target.value
                          )
                        }
                        placeholder="Telefon numarasını girin"
                        type="tel"
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        E-posta
                      </label>
                      <Input
                        value={formData.customerInfo.email}
                        onChange={(e) =>
                          handleInputChange(
                            "customerInfo",
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="E-posta adresini girin"
                        type="email"
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Adres
                    </label>
                    <Textarea
                      value={formData.customerInfo.address}
                      onChange={(e) =>
                        handleInputChange(
                          "customerInfo",
                          "address",
                          e.target.value
                        )
                      }
                      placeholder="Firma adresini girin"
                      rows={3}
                      className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hizmetler */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-2 shadow-md">
                        <ShoppingCart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                          Hizmetler ve Ürünler
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Proformaya dahil edilecek kalemleri yönetin
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={selectedCategory}
                        onValueChange={handleCategorySelect}
                      >
                        <SelectTrigger className="w-48 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <SelectValue placeholder="Kategori seç..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SERVICE_CATEGORY_LABELS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={addCustomService}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Özel Hizmet Ekle
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {formData.services.map((service, index) => (
                      <div
                        key={service.id}
                        className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="font-medium">
                            <Package className="h-3 w-3 mr-1" />
                            Hizmet {index + 1}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(service.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Hizmet/Ürün Adı
                            </label>
                            <Input
                              value={service.name}
                              onChange={(e) =>
                                updateService(
                                  service.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Hizmet veya ürün adı"
                              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Miktar
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={service.quantity}
                              onChange={(e) =>
                                updateService(
                                  service.id,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Birim Fiyat
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={service.unitPrice}
                              onChange={(e) =>
                                updateService(
                                  service.id,
                                  "unitPrice",
                                  Number(e.target.value)
                                )
                              }
                              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            />
                          </div>
                        </div>
                        
                        {service.description && (
                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Açıklama
                            </label>
                            <Textarea
                              value={service.description}
                              onChange={(e) =>
                                updateService(
                                  service.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              rows={2}
                              placeholder="Hizmet veya ürün detayları"
                              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            />
                          </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Toplam:</span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(service.quantity * service.unitPrice, formData.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.services.length === 0 && (
                      <div className="text-center py-16 px-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Package className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Henüz Hizmet Eklenmemiş
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Yukarıdaki butonları kullanarak kategori seçin veya özel hizmet ekleyin
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Fiyatlandırma ve Şartlar */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg p-2 shadow-md">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Fiyatlandırma ve Şartlar
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Para birimi, indirim ve KDV ayarları
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Para Birimi
                      </label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) =>
                          handleInputChange("", "currency", value)
                        }
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(CURRENCIES).map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        İndirim Oranı (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.discountRate}
                        onChange={(e) =>
                          handleInputChange(
                            "",
                            "discountRate",
                            Number(e.target.value)
                          )
                        }
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        KDV Oranı (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.taxRate}
                        onChange={(e) =>
                          handleInputChange(
                            "",
                            "taxRate",
                            Number(e.target.value)
                          )
                        }
                        className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Geçerlilik Tarihi (Otomatik Hesaplanır)
                    </label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        handleInputChange("", "validUntil", e.target.value)
                      }
                      disabled
                      className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700"
                    />
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Geçerlilik tarihi şartlar ayarlarına göre otomatik hesaplanır
                    </p>
                  </div>

                  {/* Şartlar ve Koşullar */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800">
                    <label className="flex items-center text-base font-bold text-gray-900 dark:text-white mb-4">
                      <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Şartlar ve Koşullar Ayarları
                      <span className="ml-2 text-xs text-red-500 font-normal">
                        * Mecburi alanlar
                      </span>
                    </label>
                    <div className="space-y-4">
                      {/* Geçerlilik Süresi */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Geçerlilik Süresi (Gün){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={termsConfig.validityPeriod}
                            onChange={(e) =>
                              updateTermsConfig(
                                "validityPeriod",
                                Number(e.target.value)
                              )
                            }
                            required
                            className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                              termsConfig.validityPeriod <= 0
                                ? "border-red-300 dark:border-red-700"
                                : ""
                            }`}
                          />
                          {termsConfig.validityPeriod <= 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              Geçerlilik süresi 1-365 gün arası olmalıdır
                            </p>
                          )}
                        </div>

                        {/* KDV Dahil/Hariç */}
                        {formData.taxRate > 0 && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              KDV Durumu <span className="text-red-500">*</span>
                            </label>
                            <Select
                              value={
                                termsConfig.vatIncluded
                                  ? "included"
                                  : "excluded"
                              }
                              onValueChange={(value) =>
                                updateTermsConfig(
                                  "vatIncluded",
                                  value === "included"
                                )
                              }
                            >
                              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excluded">
                                  KDV Hariç
                                </SelectItem>
                                <SelectItem value="included">
                                  KDV Dahil
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Ödeme Şartları */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Ödeme Türü <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={termsConfig.paymentType}
                          onValueChange={(value) =>
                            updateTermsConfig("paymentType", value)
                          }
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="advance">%100 Peşin</SelectItem>
                            <SelectItem value="partial">
                              Kısmi Ödeme (Avans + Kalan)
                            </SelectItem>
                            <SelectItem value="credit">Vadeli Ödeme</SelectItem>
                            <SelectItem value="cash">Nakit Ödeme</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Kısmi Ödeme Detayları */}
                      {termsConfig.paymentType === "partial" && (
                        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-white dark:bg-gray-800/50">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Avans Oranı (%){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={termsConfig.advancePayment}
                              onChange={(e) => {
                                const advance = Number(e.target.value);
                                updateTermsConfig("advancePayment", advance);
                                updateTermsConfig(
                                  "finalPayment",
                                  100 - advance
                                );
                              }}
                              required
                              className={`${
                                termsConfig.advancePayment <= 0 ||
                                termsConfig.advancePayment >= 100
                                  ? "border-red-300 dark:border-red-700"
                                  : ""
                              }`}
                            />
                            {(termsConfig.advancePayment <= 0 ||
                              termsConfig.advancePayment >= 100) && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Avans oranı 1-99% arası olmalıdır
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              Kalan Ödeme (%)
                            </label>
                            <Input
                              type="number"
                              value={termsConfig.finalPayment}
                              disabled
                              className="bg-gray-100 dark:bg-gray-700"
                            />
                          </div>
                        </div>
                      )}

                      {/* Vadeli Ödeme Detayları */}
                      {termsConfig.paymentType === "credit" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Vade Süresi (Gün){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={termsConfig.creditDays}
                            onChange={(e) =>
                              updateTermsConfig(
                                "creditDays",
                                Number(e.target.value)
                              )
                            }
                            required
                            className={
                              termsConfig.creditDays <= 0
                                ? "border-red-300"
                                : ""
                            }
                          />
                          {termsConfig.creditDays <= 0 && (
                            <p className="text-xs text-red-500 mt-1">
                              Vade süresi 1-365 gün arası olmalıdır
                            </p>
                          )}
                        </div>
                      )}

                      {/* Teslimat Süresi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Teslimat Süresi (İş Günü){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Minimum"
                              value={termsConfig.deliveryTime.min}
                              onChange={(e) =>
                                updateTermsConfig("deliveryTime", {
                                  ...termsConfig.deliveryTime,
                                  min: Number(e.target.value),
                                })
                              }
                              required
                              className={
                                termsConfig.deliveryTime.min <= 0
                                  ? "border-red-300"
                                  : ""
                              }
                            />
                            {termsConfig.deliveryTime.min <= 0 && (
                              <p className="text-xs text-red-500 mt-1">
                                Minimum 1 gün olmalıdır
                              </p>
                            )}
                          </div>
                          <div>
                            <Input
                              type="number"
                              min={termsConfig.deliveryTime.min}
                              placeholder="Maksimum"
                              value={termsConfig.deliveryTime.max}
                              onChange={(e) =>
                                updateTermsConfig("deliveryTime", {
                                  ...termsConfig.deliveryTime,
                                  max: Number(e.target.value),
                                })
                              }
                              required
                              className={
                                termsConfig.deliveryTime.max <
                                termsConfig.deliveryTime.min
                                  ? "border-red-300"
                                  : ""
                              }
                            />
                            {termsConfig.deliveryTime.max <
                              termsConfig.deliveryTime.min && (
                              <p className="text-xs text-red-500 mt-1">
                                Maksimum minimumdan büyük olmalıdır
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Minimum Sipariş */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="minimumOrder"
                          checked={termsConfig.minimumOrderRequired}
                          onChange={(e) =>
                            updateTermsConfig(
                              "minimumOrderRequired",
                              e.target.checked
                            )
                          }
                          className="rounded"
                        />
                        <label
                          htmlFor="minimumOrder"
                          className="text-sm font-medium text-gray-600"
                        >
                          Minimum sipariş miktarları geçerlidir
                        </label>
                      </div>

                      {/* Özel Koşullar */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Özel Koşullar (İsteğe Bağlı)
                        </label>
                        <div className="space-y-2">
                          {termsConfig.specialConditions.map(
                            (condition, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  value={condition}
                                  onChange={(e) => {
                                    const newConditions = [
                                      ...termsConfig.specialConditions,
                                    ];
                                    newConditions[index] = e.target.value;
                                    updateTermsConfig(
                                      "specialConditions",
                                      newConditions
                                    );
                                  }}
                                  placeholder="Özel koşul yazın..."
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newConditions =
                                      termsConfig.specialConditions.filter(
                                        (_, i) => i !== index
                                      );
                                    updateTermsConfig(
                                      "specialConditions",
                                      newConditions
                                    );
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateTermsConfig("specialConditions", [
                                ...termsConfig.specialConditions,
                                "",
                              ]);
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Özel Koşul Ekle
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Oluşturulan Şartlar Önizlemesi */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-blue-50/30 dark:from-green-900/20 dark:to-blue-900/10 border border-green-200 dark:border-green-800">
                      <label className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        <Eye className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                        Otomatik Oluşturulan Şartlar (Önizleme)
                      </label>
                      <div className="p-4 rounded-lg bg-white dark:bg-gray-800 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {formData.terms ||
                          "Şartlar ve koşullar ayarlarını tamamlayın..."}
                      </div>
                    </div>
                  </div>

                  {/* Notlar */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50/30 dark:from-gray-800/50 dark:to-slate-900/10 border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Ek Notlar
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("", "notes", e.target.value)
                      }
                      rows={4}
                      placeholder="Proforma için ek notlarınızı buraya yazabilirsiniz..."
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sticky Summary */}
            <div className="xl:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Finansal Özet ve İşlemler - Birleşik */}
                <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-2 shadow-md">
                        <Calculator className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                          Özet & İşlemler
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Toplam ve kaydetme işlemleri
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Finansal Detaylar */}
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Hizmet Sayısı:</span>
                          <Badge variant="outline" className="font-bold">
                            {formData.services.length}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">Ara Toplam:</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatPrice(subtotal, formData.currency)}
                          </span>
                        </div>
                      </div>

                      {formData.discountRate > 0 && (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              İndirim (%{formData.discountRate}):
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              -{formatPrice(discountAmount, formData.currency)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            KDV (%{formData.taxRate}):
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatPrice(taxAmount, formData.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-lg">GENEL TOPLAM</span>
                          <span className="text-white font-bold text-2xl">
                            {formatPrice(grandTotal, formData.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* İşlem Butonları */}
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        onClick={handleSubmit}
                        disabled={updateLoading}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                        size="lg"
                      >
                        {updateLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Değişiklikleri Kaydet
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? "Önizlemeyi Kapat" : "Önizleme Göster"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
