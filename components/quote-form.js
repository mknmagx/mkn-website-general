"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Package,
  Beaker,
  Pill,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Service Areas Data
const serviceAreas = [
  {
    id: "fason-uretim",
    title: "Fason Üretim",
    description: "Kozmetik, gıda takviyesi ve temizlik ürünleri",
    icon: Beaker,
    subcategories: [
      {
        id: "kozmetik",
        title: "Kozmetik Ürünler",
        description: "Cilt bakım, saç bakım ve makyaj ürünleri",
        products: [
          "Yüz Kremi",
          "Göz Kremi",
          "Serum",
          "Temizleme Jeli",
          "Tonik",
          "Maske",
          "Şampuan",
          "Saç Kremi",
          "Saç Maskesi",
          "Ruj",
          "Fondöten",
          "Maskara",
        ],
      },
      {
        id: "gida-takviyesi",
        title: "Gıda Takviyesi",
        description: "Vitamin, mineral ve bitkisel takviyeler",
        products: [
          "Multivitamin",
          "Vitamin D3",
          "Vitamin C",
          "Omega-3",
          "Probiyotik",
          "Kollajen",
          "Magnezyum",
          "Çinko",
          "Demir",
          "Bitkisel Karışım",
        ],
      },
      {
        id: "temizlik",
        title: "Temizlik Ürünleri",
        description: "Ev ve kişisel temizlik ürünleri",
        products: [
          "Çamaşır Deterjanı",
          "Bulaşık Deterjanı",
          "Yüzey Temizleyici",
          "Cam Temizleyici",
          "Banyo Temizleyici",
          "El Sabunu",
          "Antibakteriyel Jel",
        ],
      },
    ],
  },
  {
    id: "ambalaj",
    title: "Ambalaj Çözümleri",
    description: "Özel tasarım ve baskı hizmetleri",
    icon: Package,
    subcategories: [
      {
        id: "plastik-ambalaj",
        title: "Plastik Ambalaj",
        description: "PET, HDPE, PP ambalajlar",
        products: ["Şişe", "Kavanoz", "Tüp", "Pompa", "Spray"],
      },
      {
        id: "cam-ambalaj",
        title: "Cam Ambalaj",
        description: "Premium cam ambalaj çözümleri",
        products: ["Cam Şişe", "Cam Kavanoz", "Damlalıklı Şişe"],
      },
      {
        id: "metal-ambalaj",
        title: "Metal Ambalaj",
        description: "Alüminyum ve teneke ambalajlar",
        products: ["Alüminyum Tüp", "Teneke Kutu", "Spray Kutu"],
      },
      {
        id: "etiket-baski",
        title: "Etiket ve Baskı",
        description: "Özel tasarım etiket ve baskı hizmetleri",
        products: [
          "Su Bazlı Etiket",
          "PVC Etiket",
          "Hologram Etiket",
          "Shrink Label",
        ],
      },
      {
        id: "ozel-tasarim",
        title: "Özel Tasarım Ambalaj",
        description: "Müşteriye özel ambalaj tasarımları",
        products: ["3D Tasarım", "Prototip Üretim", "Özel Kalıp"],
      },
    ],
  },
  {
    id: "eticaret",
    title: "E-ticaret Operasyonları",
    description: "Depolama, kargo ve müşteri hizmetleri",
    icon: Sparkles,
    subcategories: [
      {
        id: "depolama",
        title: "Depolama Hizmetleri",
        description: "Güvenli ve organize depolama",
        products: ["Kısa Süreli", "Uzun Süreli", "Soğuk Zincir"],
      },
      {
        id: "kargo",
        title: "Kargo ve Lojistik",
        description: "Hızlı ve güvenli teslimat",
        products: ["Aynı Gün", "1-2 Gün", "Uluslararası"],
      },
      {
        id: "musteri-hizmetleri",
        title: "Müşteri Hizmetleri",
        description: "7/24 müşteri destek hizmetleri",
        products: ["Telefon Desteği", "Canlı Chat", "E-posta Desteği"],
      },
      {
        id: "siparis-yonetimi",
        title: "Sipariş Yönetimi",
        description: "Otomatik sipariş işleme ve takibi",
        products: ["Otomatik İşleme", "Stok Yönetimi", "İade Süreci"],
      },
      {
        id: "pazaryeri-entegrasyonu",
        title: "Pazaryeri Entegrasyonu",
        description: "Trendyol, Hepsiburada, Amazon entegrasyonu",
        products: ["Trendyol", "Hepsiburada", "Amazon", "N11"],
      },
    ],
  },
  {
    id: "dijital-pazarlama",
    title: "Dijital Pazarlama",
    description: "Sosyal medya, reklam ve içerik yönetimi",
    icon: Pill,
    subcategories: [
      {
        id: "sosyal-medya",
        title: "Sosyal Medya Yönetimi",
        description: "İçerik üretimi ve hesap yönetimi",
        products: ["Instagram", "TikTok", "Facebook", "YouTube"],
      },
      {
        id: "reklamlar",
        title: "Dijital Reklamlar",
        description: "Google ve Meta reklamları",
        products: ["Google Ads", "Facebook Ads", "Instagram Ads"],
      },
      {
        id: "influencer",
        title: "Influencer Marketing",
        description: "Mikro ve makro influencer işbirlikleri",
        products: [
          "Mikro Influencer",
          "Makro Influencer",
          "Celebrity",
          "Uzun Dönem İşbirliği",
        ],
      },
      {
        id: "icerik-uretimi",
        title: "İçerik Üretimi",
        description: "Fotoğraf, video ve grafik tasarım",
        products: [
          "Ürün Fotoğrafı",
          "Video Çekimi",
          "Grafik Tasarım",
          "Animasyon",
        ],
      },
      {
        id: "seo-web",
        title: "SEO ve Web Tasarım",
        description: "Arama motoru optimizasyonu ve web sitesi",
        products: [
          "SEO Optimizasyonu",
          "Web Tasarım",
          "E-ticaret Sitesi",
          "Blog Yönetimi",
        ],
      },
      {
        id: "email-marketing",
        title: "E-posta Pazarlama",
        description: "Otomatik e-posta kampanyaları",
        products: ["Newsletter", "Otomasyon", "Segmentasyon", "A/B Testing"],
      },
    ],
  },
];

// Form Field Component
const FormField = React.memo(
  ({
    id,
    label,
    required = false,
    error,
    children,
    description,
    className = "space-y-3",
  }) => (
    <div className={className}>
      <Label
        htmlFor={id}
        className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
      >
        {label}
        {required && <span className="text-red-500 text-lg">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {description}
        </p>
      )}
      {children}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">
            {error}
          </p>
        </div>
      )}
    </div>
  )
);

FormField.displayName = "FormField";

// Optimized Input Component
const FormInput = React.memo(
  ({
    id,
    value,
    onChange,
    error,
    placeholder,
    type = "text",
    className = "",
    ...props
  }) => {
    const inputClassName = `h-12 text-base border-2 transition-all duration-300 ${
      error
        ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/50"
        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50"
    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg shadow-sm ${className}`;

    return (
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={inputClassName}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

FormInput.displayName = "FormInput";

// Main Quote Form Component
export default function QuoteForm({ onSubmit, isSubmitting }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Kişi Bilgileri
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",

    // Proje Bilgileri
    serviceArea: "",
    serviceSubcategory: "",
    productCategory: "",
    projectName: "",
    projectDescription: "",
    targetMarket: "",

    // Teknik Bilgiler
    existingFormula: "",
    formulaDetails: "",
    packagingType: [],
    packagingSize: "",
    productVolume: "",

    // Fason Üretim Özel Alanları
    productType: "",
    consistency: "",
    ingredients: "",
    regulatoryRequirements: [],
    shelfLife: "",

    // Ambalaj Özel Alanları
    ambalajType: "",
    ambalajMaterial: "",
    printingRequirements: "",
    quantity: "",

    // E-ticaret Operasyon Özel Alanları
    currentOrderVolume: "",
    warehouseNeeds: "",
    integrationNeeds: [],
    customerServiceNeeds: "",

    // Dijital Pazarlama Özel Alanları
    brandStage: "",
    targetAudience: "",
    marketingGoals: [],
    campaignBudget: "",
    contentNeeds: [],
    contentFrequency: "",

    // Özel Gereksinimler
    certificates: [],
    specialRequirements: "",
    timeline: "",
    budget: "",

    // Ek Bilgiler
    previousExperience: "",
    additionalServices: [],
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Optimized input change handler
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Array change handler for checkboxes
  const handleArrayChange = useCallback((field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  }, []);

  // Get selected area helper
  const getSelectedArea = useCallback(() => {
    return serviceAreas.find((area) => area.id === formData.serviceArea);
  }, [formData.serviceArea]);

  // Get selected subcategory helper
  const getSelectedSubcategory = useCallback(() => {
    const area = getSelectedArea();
    return area?.subcategories.find(
      (sub) => sub.id === formData.serviceSubcategory
    );
  }, [getSelectedArea, formData.serviceSubcategory]);

  // Validation function
  const validateStep = useCallback(
    (step) => {
      const newErrors = {};

      switch (step) {
        case 1:
          if (!formData.firstName.trim()) newErrors.firstName = "Ad zorunludur";
          if (!formData.lastName.trim())
            newErrors.lastName = "Soyad zorunludur";
          if (!formData.email.trim()) {
            newErrors.email = "E-posta zorunludur";
          } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
              newErrors.email = "Geçerli bir e-posta adresi girin";
            }
          }
          if (!formData.phone.trim()) {
            newErrors.phone = "Telefon zorunludur";
          } else {
            const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
            const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, "");
            if (!phoneRegex.test(cleanPhone)) {
              newErrors.phone = "Geçerli bir telefon numarası girin";
            }
          }
          if (!formData.company.trim())
            newErrors.company = "Firma adı zorunludur";
          break;
        case 2:
          if (!formData.serviceArea)
            newErrors.serviceArea = "Hizmet alanı seçimi zorunludur";
          if (!formData.serviceSubcategory)
            newErrors.serviceSubcategory = "Alt kategori seçimi zorunludur";
          if (!formData.projectName.trim())
            newErrors.projectName = "Proje adı zorunludur";
          if (!formData.projectDescription.trim()) {
            newErrors.projectDescription = "Proje açıklaması zorunludur";
          } else if (formData.projectDescription.trim().length < 20) {
            newErrors.projectDescription =
              "Proje açıklaması en az 20 karakter olmalıdır";
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  // Navigation functions
  const nextStep = useCallback(() => {
    const isValid = validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // Prevent automatic submission when not on final step
    // Only allow manual submission via submit button
  }, []);

  const handleFormSubmit = useCallback(() => {
    if (currentStep === 4) {
      onSubmit(formData);
    }
  }, [currentStep, formData, onSubmit]);

  // Memoized handlers for better performance
  const inputHandlers = useMemo(
    () => ({
      firstName: (e) => handleInputChange("firstName", e.target.value),
      lastName: (e) => handleInputChange("lastName", e.target.value),
      email: (e) => handleInputChange("email", e.target.value),
      phone: (e) => handleInputChange("phone", e.target.value),
      company: (e) => handleInputChange("company", e.target.value),
      position: (e) => handleInputChange("position", e.target.value),
      projectName: (e) => handleInputChange("projectName", e.target.value),
      projectDescription: (e) =>
        handleInputChange("projectDescription", e.target.value),
      targetMarket: (value) => handleInputChange("targetMarket", value),
    }),
    [handleInputChange]
  );

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl lg:text-3xl font-bold mb-2">
              Ücretsiz Teklif Alın
            </CardTitle>
            <CardDescription className="text-blue-100 text-base lg:text-lg">
              Fason üretim, ambalaj, e-ticaret ve dijital pazarlama
              hizmetlerimiz için detaylı teklif alın
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 px-4 py-2"
            >
              Adım {currentStep} / 4
            </Badge>
          </div>
        </div>

        <div className="mt-6">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className={`bg-white h-3 rounded-full transition-all duration-500 ease-out ${
                currentStep === 1
                  ? "w-1/4"
                  : currentStep === 2
                  ? "w-2/4"
                  : currentStep === 3
                  ? "w-3/4"
                  : "w-full"
              }`}
            ></div>
          </div>
          <p className="text-xs text-blue-100 mt-2">
            %{((currentStep / 4) * 100).toFixed(0)} tamamlandı
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-6 lg:p-8 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="w-full">
          {/* Step 1: Kişi Bilgileri */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="firstName"
                  label="Ad"
                  required
                  error={errors.firstName}
                  description="Lütfen gerçek adınızı girin"
                >
                  <FormInput
                    id="firstName"
                    value={formData.firstName}
                    onChange={inputHandlers.firstName}
                    error={errors.firstName}
                    placeholder="Adınızı girin"
                  />
                </FormField>

                <FormField
                  id="lastName"
                  label="Soyad"
                  required
                  error={errors.lastName}
                  description="Lütfen soyadınızı girin"
                >
                  <FormInput
                    id="lastName"
                    value={formData.lastName}
                    onChange={inputHandlers.lastName}
                    error={errors.lastName}
                    placeholder="Soyadınızı girin"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="email"
                  label="E-posta"
                  required
                  error={errors.email}
                  description="Teklif ve iletişim için kullanılacak"
                >
                  <FormInput
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={inputHandlers.email}
                    error={errors.email}
                    placeholder="ornek@firma.com"
                  />
                </FormField>

                <FormField
                  id="phone"
                  label="Telefon"
                  required
                  error={errors.phone}
                  description="Hızlı iletişim için gerekli"
                >
                  <FormInput
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={inputHandlers.phone}
                    error={errors.phone}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="company"
                  label="Firma Adı"
                  required
                  error={errors.company}
                  description="Şirket veya marka adınız"
                >
                  <FormInput
                    id="company"
                    value={formData.company}
                    onChange={inputHandlers.company}
                    error={errors.company}
                    placeholder="Firma adını girin"
                  />
                </FormField>

                <FormField
                  id="position"
                  label="Pozisyon"
                  error={errors.position}
                  description="Firmadaki göreviniz (opsiyonel)"
                >
                  <FormInput
                    id="position"
                    value={formData.position}
                    onChange={inputHandlers.position}
                    error={errors.position}
                    placeholder="Genel Müdür, Satış Müdürü vs."
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Step 2: Proje Detayları */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Hizmet Alanı Seçimi */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">
                  Hizmet Alanı <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceAreas.map((area) => (
                    <div
                      key={area.id}
                      className={`relative cursor-pointer transition-all duration-200 border-2 rounded-xl p-4 hover:shadow-md ${
                        formData.serviceArea === area.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 bg-white dark:bg-gray-800"
                      }`}
                      onClick={() => {
                        handleInputChange("serviceArea", area.id);
                        handleInputChange("serviceSubcategory", "");
                        handleInputChange("productCategory", "");
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            formData.serviceArea === area.id
                              ? "bg-blue-100 dark:bg-blue-800/30"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <area.icon
                            className={`h-5 w-5 ${
                              formData.serviceArea === area.id
                                ? "text-blue-600"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {area.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {area.description}
                          </p>
                        </div>
                        {formData.serviceArea === area.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.serviceArea && (
                  <p className="text-red-500 text-sm">{errors.serviceArea}</p>
                )}
              </div>

              {/* Alt Kategori Seçimi */}
              {formData.serviceArea && (
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">
                    Alt Kategori <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {getSelectedArea()?.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className={`relative cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 hover:shadow-sm ${
                          formData.serviceSubcategory === subcategory.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 bg-white dark:bg-gray-800"
                        }`}
                        onClick={() => {
                          handleInputChange(
                            "serviceSubcategory",
                            subcategory.id
                          );
                          handleInputChange("productCategory", "");
                        }}
                      >
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                            {subcategory.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {subcategory.description}
                          </p>
                          {formData.serviceSubcategory === subcategory.id && (
                            <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.serviceSubcategory && (
                    <p className="text-red-500 text-sm">
                      {errors.serviceSubcategory}
                    </p>
                  )}
                </div>
              )}

              {/* Proje Bilgileri */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">
                  Proje Adı <span className="text-red-500">*</span>
                </Label>
                <FormInput
                  id="projectName"
                  value={formData.projectName}
                  onChange={inputHandlers.projectName}
                  error={errors.projectName}
                  placeholder="Projenizin adını girin"
                  className="text-lg"
                />
                {errors.projectName && (
                  <p className="text-red-500 text-sm">{errors.projectName}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">
                  Proje Açıklaması <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={inputHandlers.projectDescription}
                  className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                  placeholder="Projenizin detaylarını, hedeflerinizi ve beklentilerinizi açıklayın"
                  rows={4}
                />
                {errors.projectDescription && (
                  <p className="text-red-500 text-sm">
                    {errors.projectDescription}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">
                  Hedef Pazar
                </Label>
                <Select
                  value={formData.targetMarket}
                  onValueChange={inputHandlers.targetMarket}
                >
                  <SelectTrigger className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Hedef pazar seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Türkiye</SelectItem>
                    <SelectItem value="eu">Avrupa Birliği</SelectItem>
                    <SelectItem value="middle-east">Orta Doğu</SelectItem>
                    <SelectItem value="africa">Afrika</SelectItem>
                    <SelectItem value="global">Küresel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Teknik Detaylar */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {/* FASON ÜRETİM TEKNİK DETAYLARI */}
              {formData.serviceArea === "fason-uretim" && (
                <>
                  {/* Formül Durumu */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Formül Durumunuz <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          value: "existing",
                          label:
                            "Mevcut formülüm var, aynısını üretmek istiyorum",
                          desc: "Formül analizi ve üretim",
                        },
                        {
                          value: "improve",
                          label: "Mevcut formülümü geliştirmek istiyorum",
                          desc: "R&D desteği ile iyileştirme",
                        },
                        {
                          value: "new",
                          label: "Yeni formül geliştirmek istiyorum",
                          desc: "Sıfırdan formül geliştirme",
                        },
                        {
                          value: "copy",
                          label: "Piyasadaki bir ürünün benzerini istiyorum",
                          desc: "Referans ürün analizi",
                        },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                            formData.existingFormula === option.value
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                          }`}
                          onClick={() =>
                            handleInputChange("existingFormula", option.value)
                          }
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`mt-1 h-4 w-4 rounded-full border-2 ${
                                formData.existingFormula === option.value
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {formData.existingFormula === option.value && (
                                <div className="h-full w-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {option.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ürün Özellikleri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Ürün Kıvamı/Formu">
                      <Select
                        value={formData.consistency || ""}
                        onValueChange={(value) =>
                          handleInputChange("consistency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kıvam seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="liquid">Sıvı</SelectItem>
                          <SelectItem value="cream">Krem</SelectItem>
                          <SelectItem value="gel">Jel</SelectItem>
                          <SelectItem value="lotion">Losyon</SelectItem>
                          <SelectItem value="foam">Köpük</SelectItem>
                          <SelectItem value="powder">Toz</SelectItem>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="capsule">Kapsül</SelectItem>
                          <SelectItem value="stick">Stick</SelectItem>
                          <SelectItem value="oil">Yağ</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Hedef Raf Ömrü">
                      <Select
                        value={formData.shelfLife || ""}
                        onValueChange={(value) =>
                          handleInputChange("shelfLife", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Raf ömrü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6months">6 Ay</SelectItem>
                          <SelectItem value="12months">12 Ay</SelectItem>
                          <SelectItem value="18months">18 Ay</SelectItem>
                          <SelectItem value="24months">24 Ay</SelectItem>
                          <SelectItem value="36months">36 Ay</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  {/* Özel İçerikler */}
                  <FormField label="Özel İçerik Talepleri">
                    <Textarea
                      value={formData.ingredients || ""}
                      onChange={(e) =>
                        handleInputChange("ingredients", e.target.value)
                      }
                      placeholder="Özel aktif maddeler, doğal içerikler, vitaminler vb. isteklerinizi belirtin"
                      rows={3}
                    />
                  </FormField>
                </>
              )}

              {/* AMBALAJ ÇÖZÜMLERİ TEKNİK DETAYLARI */}
              {formData.serviceArea === "ambalaj" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Ambalaj Tipi" required>
                      <Select
                        value={formData.ambalajType || ""}
                        onValueChange={(value) =>
                          handleInputChange("ambalajType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ambalaj tipi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottle">Şişe</SelectItem>
                          <SelectItem value="jar">Kavanoz</SelectItem>
                          <SelectItem value="tube">Tüp</SelectItem>
                          <SelectItem value="pump">Pompalı Şişe</SelectItem>
                          <SelectItem value="airless">Airless Şişe</SelectItem>
                          <SelectItem value="spray">Spray Şişe</SelectItem>
                          <SelectItem value="dropper">
                            Damlalıklı Şişe
                          </SelectItem>
                          <SelectItem value="stick">Stick Ambalaj</SelectItem>
                          <SelectItem value="sachet">Sachet/Poşet</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Malzeme Tercihi">
                      <Select
                        value={formData.ambalajMaterial || ""}
                        onValueChange={(value) =>
                          handleInputChange("ambalajMaterial", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Malzeme seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plastic-pet">
                            Plastik (PET)
                          </SelectItem>
                          <SelectItem value="plastic-hdpe">
                            Plastik (HDPE)
                          </SelectItem>
                          <SelectItem value="plastic-pp">
                            Plastik (PP)
                          </SelectItem>
                          <SelectItem value="glass">Cam</SelectItem>
                          <SelectItem value="aluminum">Alüminyum</SelectItem>
                          <SelectItem value="laminated">
                            Lamine Malzeme
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <FormField label="Baskı ve Tasarım Gereksinimleri">
                    <Textarea
                      value={formData.printingRequirements || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "printingRequirements",
                          e.target.value
                        )
                      }
                      placeholder="Etiket, baskı, tasarım gereksinimlerinizi belirtin"
                      rows={3}
                    />
                  </FormField>
                </>
              )}

              {/* E-TİCARET OPERASYONLARI TEKNİK DETAYLARI */}
              {formData.serviceArea === "eticaret" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Mevcut Sipariş Hacmi" required>
                      <Select
                        value={formData.currentOrderVolume || ""}
                        onValueChange={(value) =>
                          handleInputChange("currentOrderVolume", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Aylık sipariş adedi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-50">0-50 sipariş/ay</SelectItem>
                          <SelectItem value="51-200">
                            51-200 sipariş/ay
                          </SelectItem>
                          <SelectItem value="201-500">
                            201-500 sipariş/ay
                          </SelectItem>
                          <SelectItem value="501-1000">
                            501-1000 sipariş/ay
                          </SelectItem>
                          <SelectItem value="1000+">
                            1000+ sipariş/ay
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Depolama İhtiyacı">
                      <Select
                        value={formData.warehouseNeeds || ""}
                        onValueChange={(value) =>
                          handleInputChange("warehouseNeeds", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Depolama türü" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standart">
                            Standart Depolama
                          </SelectItem>
                          <SelectItem value="soguk-zincir">
                            Soğuk Zincir
                          </SelectItem>
                          <SelectItem value="kontrollü-sicaklik">
                            Kontrollü Sıcaklık
                          </SelectItem>
                          <SelectItem value="ozel-kosullar">
                            Özel Koşullar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                      Pazaryeri Entegrasyonları
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        "Trendyol",
                        "Hepsiburada",
                        "Amazon",
                        "N11",
                        "GittiGidiyor",
                        "Çiçeksepeti",
                        "Idefix",
                        "Diğer",
                      ].map((platform) => (
                        <div
                          key={platform}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`platform-${platform}`}
                            checked={
                              formData.integrationNeeds?.includes(platform) ||
                              false
                            }
                            onCheckedChange={(checked) => {
                              const platforms = formData.integrationNeeds || [];
                              if (checked) {
                                handleInputChange("integrationNeeds", [
                                  ...platforms,
                                  platform,
                                ]);
                              } else {
                                handleInputChange(
                                  "integrationNeeds",
                                  platforms.filter((p) => p !== platform)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`platform-${platform}`}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <FormField label="Müşteri Hizmetleri İhtiyacı">
                    <Textarea
                      value={formData.customerServiceNeeds || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "customerServiceNeeds",
                          e.target.value
                        )
                      }
                      placeholder="Müşteri hizmetleri, iade/değişim süreçleri, canlı destek ihtiyaçlarınızı belirtin"
                      rows={3}
                    />
                  </FormField>
                </>
              )}

              {/* DİJİTAL PAZARLAMA TEKNİK DETAYLARI */}
              {formData.serviceArea === "dijital-pazarlama" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Marka Gelişim Aşaması" required>
                      <Select
                        value={formData.brandStage || ""}
                        onValueChange={(value) =>
                          handleInputChange("brandStage", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Marka aşaması seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yeni-marka">
                            Yeni Marka (0-6 ay)
                          </SelectItem>
                          <SelectItem value="gelisen-marka">
                            Gelişen Marka (6-24 ay)
                          </SelectItem>
                          <SelectItem value="oturan-marka">
                            Oturan Marka (2+ yıl)
                          </SelectItem>
                          <SelectItem value="buyuk-marka">
                            Büyük Marka (5+ yıl)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Hedef Kitle">
                      <Select
                        value={formData.targetAudience || ""}
                        onValueChange={(value) =>
                          handleInputChange("targetAudience", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ana hedef kitle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18-25-kadin">
                            18-25 Yaş Kadın
                          </SelectItem>
                          <SelectItem value="25-35-kadin">
                            25-35 Yaş Kadın
                          </SelectItem>
                          <SelectItem value="35-45-kadin">
                            35-45 Yaş Kadın
                          </SelectItem>
                          <SelectItem value="18-25-erkek">
                            18-25 Yaş Erkek
                          </SelectItem>
                          <SelectItem value="25-35-erkek">
                            25-35 Yaş Erkek
                          </SelectItem>
                          <SelectItem value="35-45-erkek">
                            35-45 Yaş Erkek
                          </SelectItem>
                          <SelectItem value="karma">
                            Karma Hedef Kitle
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                      Pazarlama Hedefleri
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Marka Bilinirliği Artırma",
                        "Satış Artırma",
                        "Müşteri Kazanma",
                        "Müşteri Sadakati",
                        "Sosyal Medya Takipçi Artırma",
                        "Website Trafiği Artırma",
                        "E-ticaret Dönüşüm Artırma",
                        "Yeni Ürün Lansmanı",
                      ].map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={`goal-${goal}`}
                            checked={
                              formData.marketingGoals?.includes(goal) || false
                            }
                            onCheckedChange={(checked) => {
                              const goals = formData.marketingGoals || [];
                              if (checked) {
                                handleInputChange("marketingGoals", [
                                  ...goals,
                                  goal,
                                ]);
                              } else {
                                handleInputChange(
                                  "marketingGoals",
                                  goals.filter((g) => g !== goal)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`goal-${goal}`}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {goal}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Aylık Reklam Bütçesi">
                      <Select
                        value={formData.campaignBudget || ""}
                        onValueChange={(value) =>
                          handleInputChange("campaignBudget", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bütçe aralığı" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000-5000">
                            1.000₺ - 5.000₺
                          </SelectItem>
                          <SelectItem value="5000-15000">
                            5.000₺ - 15.000₺
                          </SelectItem>
                          <SelectItem value="15000-30000">
                            15.000₺ - 30.000₺
                          </SelectItem>
                          <SelectItem value="30000-50000">
                            30.000₺ - 50.000₺
                          </SelectItem>
                          <SelectItem value="50000+">50.000₺+</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="İçerik Üretim Sıklığı">
                      <Select
                        value={formData.contentFrequency || ""}
                        onValueChange={(value) =>
                          handleInputChange("contentFrequency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Paylaşım sıklığı" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gunluk">Günlük</SelectItem>
                          <SelectItem value="haftada-3">
                            Haftada 3 Post
                          </SelectItem>
                          <SelectItem value="haftada-5">
                            Haftada 5 Post
                          </SelectItem>
                          <SelectItem value="haftalik">Haftalık</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                      İçerik İhtiyaçları
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        "Ürün Fotoğrafı",
                        "Video Çekimi",
                        "Grafik Tasarım",
                        "Animasyon",
                        "Reels Video",
                        "Story Tasarımı",
                        "Katalog Tasarımı",
                        "Banner Tasarımı",
                      ].map((content) => (
                        <div
                          key={content}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`content-${content}`}
                            checked={
                              formData.contentNeeds?.includes(content) || false
                            }
                            onCheckedChange={(checked) => {
                              const contents = formData.contentNeeds || [];
                              if (checked) {
                                handleInputChange("contentNeeds", [
                                  ...contents,
                                  content,
                                ]);
                              } else {
                                handleInputChange(
                                  "contentNeeds",
                                  contents.filter((c) => c !== content)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`content-${content}`}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {content}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* DİĞER HİZMETLER */}
              {![
                "fason-uretim",
                "ambalaj",
                "eticaret",
                "dijital-pazarlama",
              ].includes(formData.serviceArea) &&
                formData.serviceArea && (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-4">
                      Teknik Detaylar
                    </h3>
                    <p className="text-gray-600">
                      Bu hizmet alanı için teknik detaylar bir sonraki adımda
                      toplanacaktır.
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Step 4: Özet ve Gönderim */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Lütfen bilgilerinizi son kez kontrol edin. Form gönderildikten
                  sonra 24 saat içinde size detaylı teklif sunacağız.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      İletişim Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <strong>Ad Soyad:</strong> {formData.firstName}{" "}
                      {formData.lastName}
                    </p>
                    <p>
                      <strong>E-posta:</strong> {formData.email}
                    </p>
                    <p>
                      <strong>Telefon:</strong> {formData.phone}
                    </p>
                    <p>
                      <strong>Firma:</strong> {formData.company}
                    </p>
                    {formData.position && (
                      <p>
                        <strong>Pozisyon:</strong> {formData.position}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Proje Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <strong>Hizmet Alanı:</strong>{" "}
                      {
                        serviceAreas.find(
                          (area) => area.id === formData.serviceArea
                        )?.title
                      }
                    </p>
                    {formData.productSubcategory && (
                      <p>
                        <strong>Kategori:</strong> {formData.productSubcategory}
                      </p>
                    )}
                    <p>
                      <strong>Ürün:</strong> {formData.productName}
                    </p>
                    <p>
                      <strong>Üretim Miktarı:</strong> {formData.productVolume}
                    </p>
                    {formData.timeline && (
                      <p>
                        <strong>Hedef Tarih:</strong> {formData.timeline}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <FormField label="Daha Önce Fason Üretim Deneyiminiz Var mı?">
                <Textarea
                  value={formData.previousExperience || ""}
                  onChange={(e) =>
                    handleInputChange("previousExperience", e.target.value)
                  }
                  placeholder="Daha önce fason üretim yaptırdıysanız deneyimlerinizi paylaşın"
                  rows={3}
                />
              </FormField>

              <div>
                <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                  Ek Hizmetler
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {[
                    "Etiket Tasarımı",
                    "Ambalaj Tasarımı",
                    "Pazarlama Desteği",
                    "Lojistik Hizmetler",
                    "Depolama",
                    "Kalite Testleri",
                  ].map((service) => (
                    <div
                      key={service}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Checkbox
                        id={`service-${service}`}
                        checked={
                          formData.additionalServices?.includes(service) ||
                          false
                        }
                        onCheckedChange={(checked) => {
                          const services = formData.additionalServices || [];
                          if (checked) {
                            handleInputChange("additionalServices", [
                              ...services,
                              service,
                            ]);
                          } else {
                            handleInputChange(
                              "additionalServices",
                              services.filter((s) => s !== service)
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`service-${service}`}
                        className="flex-1 cursor-pointer text-gray-900 dark:text-gray-100"
                      >
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                İleri
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Gönderiliyor..." : "Teklif Gönder"}
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
