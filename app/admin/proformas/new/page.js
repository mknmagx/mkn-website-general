"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import { useCreateProforma } from "../../../../hooks/use-proforma";
import { getAllCompanies } from "../../../../lib/services/companies-service";
import * as PricingService from "../../../../lib/services/pricing-service";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
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
  Loader2,
  Search,
  Package,
  DollarSign,
  ShoppingCart,
  Globe,
  Check,
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

  // Pricing calculations state
  const [calculations, setCalculations] = useState([]);
  const [loadingCalculations, setLoadingCalculations] = useState(false);
  const [calculationsDialog, setCalculationsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Currency selection modal state
  const [currencySelectModal, setCurrencySelectModal] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState(null);
  const [selectedPriceType, setSelectedPriceType] = useState("TRY"); // TRY veya currency

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

  // Firmaları ve hesaplamaları yükle
  useEffect(() => {
    if (user) {
      loadCompanies();
      loadCalculations();
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

  const loadCalculations = async () => {
    try {
      setLoadingCalculations(true);
      const data = await PricingService.getPricingCalculations();
      setCalculations(data || []);
    } catch (error) {
      console.error("Error loading calculations:", error);
    } finally {
      setLoadingCalculations(false);
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

  // Hesaplamadan ürün ekleme - döviz kontrolü
  const handleCalculationSelect = (calc) => {
    if (!calc || !calc.calculations) return;
    
    // Eğer hesaplamada döviz verisi varsa modal göster
    if (calc.currencyData?.currency && calc.currencyData?.unitPriceConverted) {
      setSelectedCalculation(calc);
      setSelectedPriceType("TRY");
      setCurrencySelectModal(true);
    } else {
      // Döviz verisi yoksa direkt ekle
      addFromCalculation(calc, "TRY");
    }
  };

  // Döviz seçimi ile ekleme
  const handleCurrencyConfirm = () => {
    if (selectedCalculation) {
      addFromCalculation(selectedCalculation, selectedPriceType);
      setCurrencySelectModal(false);
      setSelectedCalculation(null);
      setSelectedPriceType("TRY");
    }
  };

  // Hesaplamadan ürün ekleme
  const addFromCalculation = (calc, priceType = "TRY") => {
    if (!calc || !calc.calculations) return;

    // Ürün açıklamasını oluştur
    const descriptions = [];
    
    // Formül bilgisi
    if (calc.formData?.ingredients && calc.formData.ingredients.length > 0) {
      const ingredientSummary = calc.formData.ingredients
        .filter(ing => ing.name)
        .slice(0, 3)
        .map(ing => ing.name)
        .join(", ");
      descriptions.push(`Formül: ${ingredientSummary}${calc.formData.ingredients.length > 3 ? '...' : ''}`);
    }

    // Formül notu
    if (calc.formData?.notes) {
      descriptions.push(`Not: ${calc.formData.notes.substring(0, 100)}${calc.formData.notes.length > 100 ? '...' : ''}`);
    }

    // Ambalaj bilgisi
    if (calc.formData?.packaging && calc.formData.packaging.length > 0) {
      const packagingSummary = calc.formData.packaging
        .filter(pkg => pkg.type)
        .map(pkg => `${pkg.type}${pkg.material ? ` (${pkg.material})` : ''}`)
        .join(", ");
      if (packagingSummary) {
        descriptions.push(`Ambalaj: ${packagingSummary}`);
      }
    }

    // Kutu/Etiket bilgisi
    const packagingDetails = [];
    if (calc.formData?.boxQuantity && parseFloat(calc.formData.boxQuantity) > 0) {
      packagingDetails.push(`Kutu: ${calc.formData.boxQuantity} adet`);
    }
    if (calc.formData?.labelQuantity && parseFloat(calc.formData.labelQuantity) > 0) {
      packagingDetails.push(`Etiket: ${calc.formData.labelQuantity} adet`);
    }
    if (packagingDetails.length > 0) {
      descriptions.push(packagingDetails.join(", "));
    }

    // Fiyat belirleme - döviz tipine göre
    let unitPrice = parseFloat(calc.calculations.unitPrice) || 0;
    let currency = CURRENCIES.TRY;
    
    if (priceType !== "TRY" && calc.currencyData?.unitPriceConverted) {
      unitPrice = parseFloat(calc.currencyData.unitPriceConverted) || 0;
      currency = calc.currencyData.currency;
      descriptions.push(`Döviz Kuru: ${calc.currencyData.exchangeRate} (${calc.currencyData.currency}/TRY)`);
    }

    const newService = {
      id: Date.now(),
      name: calc.productName || "Ürün",
      description: descriptions.join(" | "),
      quantity: calc.quantity || 1,
      unit: "Adet",
      unitPrice: unitPrice,
      calculationId: calc.id, // Hesaplama referansı
    };

    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
      // Eğer döviz seçildiyse para birimini de güncelle
      ...(priceType !== "TRY" && { currency: currency }),
    }));

    setCalculationsDialog(false);
    toast({
      title: "Ürün Eklendi",
      description: `${calc.productName} proformaya eklendi${priceType !== "TRY" ? ` (${currency})` : ""}`,
    });
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredPermission="proformas.create"
      showMessage={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Modern Header */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
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
                    Yeni Proforma Oluştur
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 ml-14">
                    Müşterileriniz için profesyonel fiyat teklifi hazırlayın
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Ana Form - Sol Taraf */}
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
                  <CardDescription>
                    Müşteri detaylarını girin veya kayıtlı firmadan seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Firma Seçimi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kayıtlı Firma Seç (İsteğe bağlı)
                    </label>
                    <Select onValueChange={handleCompanySelect} value={selectedCompanyId}>
                      <SelectTrigger className="h-11 border-2">
                        <SelectValue placeholder="Firma seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name || company.companyName || "İsimsiz Şirket"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Firma Adı <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.customerInfo.companyName}
                        onChange={(e) =>
                          handleInputChange("customerInfo", "companyName", e.target.value)
                        }
                        placeholder="ABC Şirketi Ltd. Şti."
                        className="h-11 border-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Yetkili Kişi
                      </label>
                      <Input
                        value={formData.customerInfo.contactPerson}
                        onChange={(e) =>
                          handleInputChange("customerInfo", "contactPerson", e.target.value)
                        }
                        placeholder="Ahmet Yılmaz"
                        className="h-11 border-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telefon
                      </label>
                      <Input
                        value={formData.customerInfo.phone}
                        onChange={(e) =>
                          handleInputChange("customerInfo", "phone", e.target.value)
                        }
                        placeholder="+90 532 123 45 67"
                        className="h-11 border-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-posta
                      </label>
                      <Input
                        type="email"
                        value={formData.customerInfo.email}
                        onChange={(e) =>
                          handleInputChange("customerInfo", "email", e.target.value)
                        }
                        placeholder="info@abcsirketi.com"
                        className="h-11 border-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adres
                    </label>
                    <Textarea
                      value={formData.customerInfo.address}
                      onChange={(e) =>
                        handleInputChange("customerInfo", "address", e.target.value)
                      }
                      placeholder="Şirket adresini girin..."
                      rows={3}
                      className="border-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hizmetler */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
                        <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      Hizmetler ve Ürünler
                    </div>
                    <div className="flex gap-2">
                      {/* Hesaplamalardan Ekle Dialog */}
                      <Dialog open={calculationsDialog} onOpenChange={setCalculationsDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-2">
                            <Calculator className="h-4 w-4 mr-2" />
                            Hesaplamalardan Ekle
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
                          {/* Minimal Header */}
                          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                              Hesaplama Seç
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Proformaya eklenecek hesaplamayı seçin
                            </DialogDescription>
                          </div>
                          
                          {/* Search - Minimal */}
                          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Calculations List - Minimal */}
                          <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4">
                            {loadingCalculations ? (
                              <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                              </div>
                            ) : calculations.filter(calc => 
                                calc.productName?.toLowerCase().includes(searchTerm.toLowerCase())
                              ).length === 0 ? (
                              <div className="text-center py-16">
                                <Package className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {searchTerm ? "Sonuç bulunamadı" : "Hesaplama yok"}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {calculations
                                  .filter(calc => 
                                    calc.productName?.toLowerCase().includes(searchTerm.toLowerCase())
                                  )
                                  .map((calc) => (
                                    <div 
                                      key={calc.id}
                                      className="group flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition-all"
                                      onClick={() => handleCalculationSelect(calc)}
                                    >
                                      {/* Product Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                            {calc.productName}
                                          </h4>
                                          {calc.currencyData?.currency && (
                                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 border-green-200 text-green-700 dark:border-green-800 dark:text-green-400 flex-shrink-0">
                                              <Globe className="h-3 w-3 mr-1" />
                                              {calc.currencyData.currency}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                          {calc.productType && (
                                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                              {calc.productType}
                                            </span>
                                          )}
                                          {calc.quantity && (
                                            <span>{calc.quantity} adet</span>
                                          )}
                                          {calc.productVolume && (
                                            <span>{calc.productVolume} ml</span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Price */}
                                      <div className="text-right flex-shrink-0">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                          ₺{calc.calculations?.unitPrice?.toFixed(2) || "0.00"}
                                        </p>
                                        {calc.currencyData?.unitPriceConverted && (
                                          <p className="text-xs text-green-600 dark:text-green-400">
                                            {calc.currencyData.unitPriceConverted} {calc.currencyData.currency}
                                          </p>
                                        )}
                                      </div>
                                      
                                      {/* Add Icon */}
                                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Döviz Seçim Modal */}
                      <Dialog open={currencySelectModal} onOpenChange={setCurrencySelectModal}>
                        <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <Globe className="h-5 w-5 text-green-600" />
                              Fiyat Türü Seç
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Bu hesaplamada döviz fiyatı mevcut
                            </DialogDescription>
                          </div>
                          
                          <div className="p-6 space-y-3">
                            {/* TRY Option */}
                            <div 
                              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedPriceType === "TRY" 
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                              onClick={() => setSelectedPriceType("TRY")}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                selectedPriceType === "TRY" 
                                  ? "bg-blue-500 text-white" 
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              }`}>
                                <DollarSign className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">Türk Lirası (TRY)</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  ₺{selectedCalculation?.calculations?.unitPrice?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                              {selectedPriceType === "TRY" && (
                                <Check className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            
                            {/* Currency Option */}
                            {selectedCalculation?.currencyData && (
                              <div 
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  selectedPriceType === "CURRENCY" 
                                    ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                                onClick={() => setSelectedPriceType("CURRENCY")}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  selectedPriceType === "CURRENCY" 
                                    ? "bg-green-500 text-white" 
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                }`}>
                                  <Globe className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {selectedCalculation.currencyData.currency}
                                  </p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {selectedCalculation.currencyData.unitPriceConverted} {selectedCalculation.currencyData.currency}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Kur: {selectedCalculation.currencyData.exchangeRate}
                                  </p>
                                </div>
                                {selectedPriceType === "CURRENCY" && (
                                  <Check className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => {
                                setCurrencySelectModal(false);
                                setSelectedCalculation(null);
                              }}
                            >
                              İptal
                            </Button>
                            <Button 
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                              onClick={handleCurrencyConfirm}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Ekle
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Select onValueChange={handleCategorySelect}>
                        <SelectTrigger className="w-48 h-9 border-2">
                          <SelectValue placeholder="Şablon seç..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button onClick={addCustomService} size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Özel Hizmet
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.services.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Henüz Hizmet Eklenmedi
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Hesaplamalardan ekle, şablon kullan veya özel hizmet oluşturun
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.services.map((service, index) => (
                        <div
                          key={service.id}
                          className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold shadow-md">
                                {index + 1}
                              </div>
                              <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400">
                                {service.calculationId ? "Hesaplamadan" : "Manuel"}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(service.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Hizmet/Ürün Adı <span className="text-red-500">*</span>
                              </label>
                              <Input
                                value={service.name}
                                onChange={(e) =>
                                  updateService(service.id, "name", e.target.value)
                                }
                                placeholder="Hizmet adını girin..."
                                className="h-11 border-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Birim
                              </label>
                              <Input
                                value={service.unit}
                                onChange={(e) =>
                                  updateService(service.id, "unit", e.target.value)
                                }
                                placeholder="Adet, Litre, Kg..."
                                className="h-11 border-2"
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Açıklama
                            </label>
                            <Textarea
                              value={service.description}
                              onChange={(e) =>
                                updateService(service.id, "description", e.target.value)
                              }
                              placeholder="Hizmet detaylarını açıklayın..."
                              rows={3}
                              className="border-2"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Miktar <span className="text-red-500">*</span>
                              </label>
                              <Input
                                type="number"
                                value={service.quantity}
                                onChange={(e) =>
                                  updateService(service.id, "quantity", Number(e.target.value))
                                }
                                min="0"
                                className="h-11 border-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Birim Fiyat <span className="text-red-500">*</span>
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                value={service.unitPrice}
                                onChange={(e) =>
                                  updateService(service.id, "unitPrice", Number(e.target.value))
                                }
                                min="0"
                                className="h-11 border-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Toplam
                              </label>
                              <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800 rounded-lg text-base font-bold text-green-700 dark:text-green-400">
                                {formatPrice(
                                  (service.quantity || 0) * (service.unitPrice || 0),
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
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
                      <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Fiyatlandırma ve Şartlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Para Birimi
                      </label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => handleInputChange("", "currency", value)}
                      >
                        <SelectTrigger className="h-11 border-2">
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        İndirim Oranı (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.discountRate}
                        onChange={(e) =>
                          handleInputChange("", "discountRate", Number(e.target.value))
                        }
                        className="h-11 border-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        KDV Oranı (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.taxRate}
                        onChange={(e) =>
                          handleInputChange("", "taxRate", Number(e.target.value))
                        }
                        className="h-11 border-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Geçerlilik Tarihi
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) =>
                          handleInputChange("", "validUntil", e.target.value)
                        }
                        className="flex-1 h-11 border-2"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + termsConfig.validityPeriod);
                          handleInputChange("", "validUntil", date.toISOString().split("T")[0]);
                        }}
                        className="border-2"
                      >
                        Otomatik Ayarla
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Önerilen: {(() => {
                        const date = new Date();
                        date.setDate(date.getDate() + termsConfig.validityPeriod);
                        return date.toLocaleDateString("tr-TR");
                      })()}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Şartlar ve Koşullar Ayarları
                      <Badge variant="destructive" className="ml-2 text-xs">Mecburi</Badge>
                    </label>
                    <div className="space-y-4 p-5 border-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-850">
                      {/* Geçerlilik Süresi */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Geçerlilik Süresi (Gün) <span className="text-red-500">*</span>
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Otomatik Oluşturulan Şartlar (Önizleme)
                      </label>
                      <div className="p-4 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-sm whitespace-pre-line text-blue-900 dark:text-blue-100">
                        {formData.terms || "Şartlar ve koşullar ayarlarını tamamlayın..."}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notlar
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange("", "notes", e.target.value)}
                      rows={4}
                      placeholder="Ek notlarınızı girin..."
                      className="border-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Özet Paneli - Sağ Taraf */}
            <div className="space-y-6">
              {/* Finansal Özet ve İşlemler - Birleştirilmiş */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 shadow-md">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    Finansal Özet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Ara Toplam:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(subtotal, formData.currency)}
                      </span>
                    </div>

                    {formData.discountRate > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          İndirim ({formData.discountRate}%):
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          -{formatPrice(discountAmount, formData.currency)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        KDV ({formData.taxRate}%):
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(taxAmount, formData.currency)}
                      </span>
                    </div>

                    <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">TOPLAM:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                          {formatPrice(grandTotal, formData.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-center mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Hizmet Sayısı</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {formData.services.length}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Toplam Adet</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {formData.services.reduce((sum, s) => sum + (s.quantity || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* İşlemler Butonları */}
                  <div className="space-y-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">İşlemler</h3>
                    
                    <Button
                      onClick={() => handleSubmit("draft")}
                      disabled={createLoading}
                      className="w-full h-12 text-base border-2"
                      variant="outline"
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Taslak Kaydet
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleSubmit("sent")}
                      disabled={createLoading}
                      className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <FileText className="h-5 w-5 mr-2" />
                          Oluştur ve Gönder
                        </>
                      )}
                    </Button>

                    {formData.services.length > 0 && (
                      <Button
                        onClick={() => setShowPreview(!showPreview)}
                        variant="ghost"
                        className="w-full h-11 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? "Önizlemeyi Gizle" : "PDF Önizleme"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* PDF Önizleme */}
              {showPreview && formData.services.length > 0 && (
                <Card className="bg-white dark:bg-gray-800 border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      PDF Önizleme
                    </CardTitle>
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
                      companyData={companies.find((c) => c.id === selectedCompanyId)}
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
