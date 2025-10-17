"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import { useCreateProforma } from "../../../../hooks/use-proforma";
import { getAllCompanies } from "../../../../lib/services/companies-service";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  SERVICE_TEMPLATES,
  CURRENCIES,
  getServiceTemplate,
  formatPrice,
} from "../../../../lib/services/proforma-service";
import ProformaPDFExport from "../../../../components/proforma-pdf-export";

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
import { useToast } from "../../../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Building2,
  Calculator,
  Download,
  Eye,
} from "lucide-react";

export default function CreateProformaPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { createProforma, loading: createLoading } = useCreateProforma();

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
      const date = new Date();
      date.setDate(date.getDate() + termsConfig.validityPeriod);
      const newValidUntil = date.toISOString().split("T")[0];

      // Sadece kullanıcı henüz bir tarih girmemişse otomatik ayarla
      if (!formData.validUntil) {
        setFormData((prev) => ({
          ...prev,
          validUntil: newValidUntil,
        }));
      }
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
  const handleSubmit = async (status = "draft") => {
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

      // Geçerlilik tarihi ayarla
      const validUntil =
        formData.validUntil ||
        (() => {
          const date = new Date();
          date.setDate(date.getDate() + termsConfig.validityPeriod);
          return date.toISOString().split("T")[0];
        })();

      const proformaData = {
        ...formData,
        companyId: selectedCompanyId || null,
        status,
        validUntil: new Date(validUntil),
        totalAmount: subtotal,
        discountAmount,
        taxAmount,
        grandTotal,
        termsConfig, // Şartlar konfigürasyonunu da kaydet
        createdBy: user.uid,
      };

      const result = await createProforma(proformaData);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: `Proforma ${result.proformaNumber} oluşturuldu`,
        });

        router.push(`/admin/proformas/${result.id}`);
      }
    } catch (error) {
      console.error("Error creating proforma:", error);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading) return <div>Yükleniyor...</div>;

  return (
    <PermissionGuard
      requiredPermission="proformas.create"
      fallback={
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Erişim Engellendi
              </h1>
              <p className="text-gray-600">
                Proforma oluşturmak için gerekli izinlere sahip değilsiniz.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              Yeni Proforma Oluştur
            </h1>
            <p className="text-gray-600 mt-2">
              Müşterileriniz için kapsamlı fiyat teklifleri hazırlayın
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Ana Form */}
            <div className="xl:col-span-2 space-y-6">
              {/* Müşteri Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Müşteri Bilgileri
                  </CardTitle>
                  <CardDescription>
                    Müşteri detaylarını girin veya mevcut firmadan seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Firma Seçimi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mevcut Firma Seç (İsteğe bağlı)
                    </label>
                    <Select onValueChange={handleCompanySelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Firma seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name ||
                              company.companyName ||
                              "İsimsiz Şirket"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firma Adı *
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
                        placeholder="ABC Şirketi Ltd. Şti."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        placeholder="Ahmet Yılmaz"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        placeholder="+90 532 123 45 67"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta
                      </label>
                      <Input
                        type="email"
                        value={formData.customerInfo.email}
                        onChange={(e) =>
                          handleInputChange(
                            "customerInfo",
                            "email",
                            e.target.value
                          )
                        }
                        placeholder="info@abcsirketi.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      placeholder="Şirket adresini girin..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hizmetler */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Hizmetler ve Fiyatlar
                    </span>
                    <div className="flex gap-2">
                      <Select onValueChange={handleCategorySelect}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Hizmet şablonu seç..." />
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
                      <Button onClick={addCustomService} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Özel Hizmet
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.services.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Henüz hizmet eklenmedi</p>
                      <p className="text-sm">
                        Yukarıdaki şablonları kullanın veya özel hizmet ekleyin
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.services.map((service, index) => (
                        <div
                          key={service.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">#{index + 1}</Badge>
                              <span className="text-sm text-gray-500">
                                Hizmet
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(service.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hizmet Adı *
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
                                placeholder="Hizmet adını girin..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Birim
                              </label>
                              <Input
                                value={service.unit}
                                onChange={(e) =>
                                  updateService(
                                    service.id,
                                    "unit",
                                    e.target.value
                                  )
                                }
                                placeholder="Adet, Litre, Kg..."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                              placeholder="Hizmet detaylarını açıklayın..."
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Miktar *
                              </label>
                              <Input
                                type="number"
                                value={service.quantity}
                                onChange={(e) =>
                                  updateService(
                                    service.id,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Birim Fiyat *
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                value={service.unitPrice}
                                onChange={(e) =>
                                  updateService(
                                    service.id,
                                    "unitPrice",
                                    Number(e.target.value)
                                  )
                                }
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Toplam
                              </label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium text-gray-900">
                                {formatPrice(
                                  (service.quantity || 0) *
                                    (service.unitPrice || 0),
                                  formData.currency
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ek Bilgiler */}
              <Card>
                <CardHeader>
                  <CardTitle>Ek Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Para Birimi
                      </label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) =>
                          handleInputChange("", "currency", value)
                        }
                      >
                        <SelectTrigger>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Geçerlilik Tarihi (Otomatik Hesaplanır)
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) =>
                          handleInputChange("", "validUntil", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const date = new Date();
                          date.setDate(
                            date.getDate() + termsConfig.validityPeriod
                          );
                          handleInputChange(
                            "",
                            "validUntil",
                            date.toISOString().split("T")[0]
                          );
                        }}
                      >
                        Otomatik Ayarla
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Şartlar ayarlarındaki geçerlilik süresine göre:{" "}
                      {(() => {
                        const date = new Date();
                        date.setDate(
                          date.getDate() + termsConfig.validityPeriod
                        );
                        return date.toLocaleDateString("tr-TR");
                      })()}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Şartlar ve Koşullar Ayarları
                      <span className="ml-2 text-xs text-red-500">
                        * Mecburi alanlar
                      </span>
                    </label>
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      {/* Geçerlilik Süresi */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
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
                            className={
                              termsConfig.validityPeriod <= 0
                                ? "border-red-300"
                                : ""
                            }
                          />
                          {termsConfig.validityPeriod <= 0 && (
                            <p className="text-xs text-red-500 mt-1">
                              Geçerlilik süresi 1-365 gün arası olmalıdır
                            </p>
                          )}
                        </div>

                        {/* KDV Dahil/Hariç */}
                        {formData.taxRate > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
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
                              <SelectTrigger>
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
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Ödeme Türü <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={termsConfig.paymentType}
                          onValueChange={(value) =>
                            updateTermsConfig("paymentType", value)
                          }
                        >
                          <SelectTrigger>
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
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
                              className={
                                termsConfig.advancePayment <= 0 ||
                                termsConfig.advancePayment >= 100
                                  ? "border-red-300"
                                  : ""
                              }
                            />
                            {(termsConfig.advancePayment <= 0 ||
                              termsConfig.advancePayment >= 100) && (
                              <p className="text-xs text-red-500 mt-1">
                                Avans oranı 1-99% arası olmalıdır
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Kalan Ödeme (%)
                            </label>
                            <Input
                              type="number"
                              value={termsConfig.finalPayment}
                              disabled
                              className="bg-gray-100"
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
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Otomatik Oluşturulan Şartlar (Önizleme)
                      </label>
                      <div className="p-4 border rounded-lg bg-blue-50 text-sm whitespace-pre-line">
                        {formData.terms ||
                          "Şartlar ve koşullar ayarlarını tamamlayın..."}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notlar
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("", "notes", e.target.value)
                      }
                      rows={4}
                      placeholder="Ek notlarınızı girin..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Özet Paneli */}
            <div className="space-y-6">
              {/* Finansal Özet */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Finansal Özet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam:</span>
                    <span className="font-medium">
                      {formatPrice(subtotal, formData.currency)}
                    </span>
                  </div>

                  {formData.discountRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        İndirim ({formData.discountRate}%):
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(discountAmount, formData.currency)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      KDV ({formData.taxRate}%):
                    </span>
                    <span className="font-medium">
                      {formatPrice(taxAmount, formData.currency)}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>TOPLAM:</span>
                      <span className="text-blue-600">
                        {formatPrice(grandTotal, formData.currency)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* İşlemler */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleSubmit("draft")}
                    disabled={createLoading}
                    className="w-full"
                    variant="outline"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createLoading ? "Kaydediliyor..." : "Taslak Kaydet"}
                  </Button>

                  <Button
                    onClick={() => handleSubmit("sent")}
                    disabled={createLoading}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Oluştur ve Gönder
                  </Button>

                  {formData.services.length > 0 && (
                    <div className="pt-3 border-t">
                      <Button
                        onClick={() => setShowPreview(!showPreview)}
                        variant="ghost"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? "Önizlemeyi Gizle" : "PDF Önizleme"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* PDF Önizleme */}
              {showPreview && formData.services.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PDF Önizleme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProformaPDFExport
                      proforma={{
                        ...formData,
                        proformaNumber: "ÖNIZLEME",
                        totalAmount: subtotal,
                        discountAmount,
                        taxAmount,
                        grandTotal,
                        createdAt: { seconds: Date.now() / 1000 },
                      }}
                      companyData={companies.find(
                        (c) => c.id === selectedCompanyId
                      )}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
