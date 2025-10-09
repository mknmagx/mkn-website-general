"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { site } from "@/config/site";
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
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Beaker,
  Pill,
  Sparkles,
  FileText,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuoteSubmission } from "@/hooks/use-quote-submission";
import {
  SubmissionSuccess,
  SubmissionError,
  SubmissionLoading,
} from "@/components/submission-status";
import {
  OrganizationSchema,
  LocalBusinessSchema,
} from "@/components/structured-data";

// Teklif Sayfası için Structured Data
function TeklifStructuredData() {
  const quoteFormSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Ücretsiz Teklif Alın - MKNGROUP",
    description:
      "MKNGROUP'tan fason üretim, ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri için ücretsiz teklif alın.",
    url: "https://www.mkngroup.com.tr/teklif",
    mainEntity: {
      "@type": "Service",
      name: "Ücretsiz Teklif Hizmeti",
      description:
        "Fason üretim, ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri için profesyonel teklif hazırlama",
      provider: {
        "@type": "Organization",
        name: "MKNGROUP",
        url: "https://www.mkngroup.com.tr",
        logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      },
      serviceType: [
        "Fason Üretim Danışmanlığı",
        "Ambalaj Çözümleri",
        "E-ticaret Operasyon Hizmetleri",
        "Dijital Pazarlama Hizmetleri",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
        description: "Ücretsiz teklif hazırlama hizmeti",
        availability: "https://schema.org/InStock",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Ana Sayfa",
          item: "https://www.mkngroup.com.tr",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Teklif Al",
          item: "https://www.mkngroup.com.tr/teklif",
        },
      ],
    },
  };

  const contactPointSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    telephone: site.contact.headquarters.phone,
    email: site.contact.headquarters.email,
    contactType: "customer service",
    availableLanguage: ["Turkish", "English"],
    areaServed: ["TR", "EU", "ME"],
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:30",
      closes: "18:00",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(quoteFormSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactPointSchema),
        }}
      />
    </>
  );
}

// Client-side SEO Component
function TeklifSEO() {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>
        Ücretsiz Teklif Alın | Fason Üretim, Ambalaj ve Operasyon Çözümleri |
        MKNGROUP
      </title>
      <meta
        name="description"
        content="🎯 MKNGROUP'tan ücretsiz teklif alın! Fason üretim, ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri için detaylı fiyat teklifi. ⚡ 24 saat içinde yanıt, ücretsiz danışmanlık."
      />
      <meta
        name="keywords"
        content="ücretsiz teklif al, fason üretim teklif, kozmetik üretim teklif, ambalaj teklif, fiyat teklifi, contract manufacturing quote, kozmetik fason üretim fiyat, e-ticaret operasyon teklif, dijital pazarlama teklif, private label teklif, OEM üretim teklif, istanbul fason üretim teklif, ISO sertifikalı üretim teklif, hızlı teklif alma, 24 saat teklif, MKNGROUP teklif"
      />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Turkish" />
      <meta name="author" content="MKNGROUP" />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content="Ücretsiz Teklif Alın | MKNGROUP Fason Üretim ve Operasyon Çözümleri"
      />
      <meta
        property="og:description"
        content="MKNGROUP'tan ücretsiz teklif alın! Fason üretim, ambalaj çözümleri, e-ticaret operasyonları için detaylı fiyat teklifi. 24 saat içinde yanıt."
      />
      <meta property="og:url" content="https://www.mkngroup.com.tr/teklif" />
      <meta property="og:site_name" content="MKNGROUP" />
      <meta property="og:locale" content="tr_TR" />
      <meta
        property="og:image"
        content="https://www.mkngroup.com.tr/og-image.png"
      />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="MKNGROUP Ücretsiz Teklif Formu - Fason Üretim ve Operasyon Çözümleri"
      />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Ücretsiz Teklif Alın | MKNGROUP Fason Üretim ve Operasyon Çözümleri"
      />
      <meta
        name="twitter:description"
        content="MKNGROUP'tan ücretsiz teklif alın! Fason üretim, ambalaj çözümleri, e-ticaret operasyonları için detaylı fiyat teklifi. 24 saat içinde yanıt."
      />
      <meta
        name="twitter:image"
        content="https://www.mkngroup.com.tr/og-image.png"
      />
      <meta name="twitter:image:alt" content="MKNGROUP Ücretsiz Teklif Formu" />
      <meta name="twitter:site" content="@mkngroup_x" />
      <meta name="twitter:creator" content="@mkngroup_x" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="application-name" content="MKNGROUP" />

      {/* Canonical URL */}
      <link rel="canonical" href="https://www.mkngroup.com.tr/teklif" />

      {/* Alternate Language Tags */}
      <link
        rel="alternate"
        hrefLang="tr"
        href="https://www.mkngroup.com.tr/teklif"
      />
      <link
        rel="alternate"
        hrefLang="x-default"
        href="https://www.mkngroup.com.tr/teklif"
      />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  );
}

const serviceAreas = [
  {
    id: "fason-uretim",
    title: "Fason Üretim",
    icon: Beaker,
    description: "ISO sertifikalı tesislerde üretim hizmetleri",
    subcategories: [
      {
        id: "kozmetik",
        title: "Kozmetik Ürünler",
        products: [
          "Cilt Bakım Ürünleri (Krem, Serum, Losiyon)",
          "Saç Bakım Ürünleri (Şampuan, Saç Kremi)",
          "Makyaj Ürünleri (Fondöten, Ruj, Maskara)",
          "Güneş Koruyucu Ürünler",
          "Anti-aging Ürünler",
          "Bebek Bakım Ürünleri",
          "Diğer Kozmetik Ürünler",
        ],
      },
      {
        id: "gida-takviyesi",
        title: "Gıda Takviyeleri",
        products: [
          "Vitamin Takviyeleri (A, B, C, D, E, K)",
          "Mineral Takviyeleri (Çinko, Magnezyum, Kalsiyum)",
          "Protein Takviyeleri",
          "Probiyotik Ürünler",
          "Bitki Ekstraktları",
          "Omega-3 Ürünleri",
          "Diğer Gıda Takviyeleri",
        ],
      },
      {
        id: "temizlik",
        title: "Temizlik Ürünleri",
        products: [
          "Sıvı Sabunlar",
          "Çamaşır Deterjanları",
          "Bulaşık Deterjanları",
          "Yüzey Temizleyiciler",
          "Endüstriyel Temizlik Ürünleri",
          "Dezenfektan Ürünler",
          "Diğer Temizlik Ürünleri",
        ],
      },
      {
        id: "hepsi",
        title: "Tüm Kategoriler",
        products: ["Kategori seçmek istemiyorum, hepsini değerlendirin"],
      },
    ],
  },
  {
    id: "ambalaj",
    title: "Ambalaj Çözümleri",
    icon: Package,
    description: "5000+ farklı ambalaj seçeneği",
    subcategories: [
      {
        id: "siseler",
        title: "Şişe Ambalajlar",
        products: [
          "Airless Şişeler (15ml, 30ml, 50ml)",
          "Pompa Şişeler (100ml, 200ml, 500ml)",
          "Spray Şişeler (50ml, 100ml, 250ml)",
          "Serum Şişeleri (10ml, 20ml, 30ml)",
          "Cam Şişeler (Tüm Boyutlar)",
          "Plastik Şişeler (Tüm Boyutlar)",
          "Diğer Şişe Türleri",
        ],
      },
      {
        id: "kavanozlar",
        title: "Kavanoz Ambalajlar",
        products: [
          "Cam Kavanozlar (30ml, 50ml, 100ml)",
          "Plastik Kavanozlar (Tüm Boyutlar)",
          "Airless Kavanozlar",
          "Krem Kavanozları",
          "Gıda Kavanozları",
          "Özel Tasarım Kavanozlar",
          "Diğer Kavanoz Türleri",
        ],
      },
      {
        id: "tublar",
        title: "Tüp Ambalajlar",
        products: [
          "Plastik Tüpler (10ml-200ml)",
          "Alüminyum Tüpler",
          "Laminat Tüpler",
          "Squeeze Tüpler",
          "Özel Tasarım Tüpler",
          "Diğer Tüp Türleri",
        ],
      },
      {
        id: "hepsi",
        title: "Tüm Ambalaj Türleri",
        products: ["Ambalaj türü seçmek istemiyorum, hepsini değerlendirin"],
      },
    ],
  },
  {
    id: "eticaret-operasyon",
    title: "E-Ticaret Operasyon",
    icon: Sparkles,
    description: "Depodan kargoya operasyon yönetimi",
    subcategories: [
      {
        id: "depo-yonetimi",
        title: "Depo Yönetimi",
        products: [
          "WMS Entegreli Depo Sistemleri",
          "Stok Yönetimi ve Takibi",
          "Giriş-Çıkış Operasyonları",
          "Envanter Yönetimi",
          "Raf Düzeni Optimizasyonu",
          "Diğer Depo Hizmetleri",
        ],
      },
      {
        id: "kargo-sevkiyat",
        title: "Kargo & Sevkiyat",
        products: [
          "Kargo Firması Entegrasyonları",
          "Sevkiyat Operasyon Yönetimi",
          "Paketleme Hizmetleri",
          "Express Teslimat Hizmetleri",
          "Uluslararası Kargo",
          "Diğer Sevkiyat Hizmetleri",
        ],
      },
      {
        id: "musteri-hizmetleri",
        title: "Müşteri Hizmetleri",
        products: [
          "Çağrı Merkezi Hizmetleri",
          "Canlı Destek Sistemleri",
          "İade & Değişim Yönetimi",
          "Müşteri Memnuniyet Takibi",
          "CRM Entegrasyonları",
          "Diğer Müşteri Hizmetleri",
        ],
      },
      {
        id: "hepsi",
        title: "Tüm Operasyon Hizmetleri",
        products: ["Operasyon türü seçmek istemiyorum, hepsini değerlendirin"],
      },
    ],
  },
  {
    id: "dijital-pazarlama",
    title: "Dijital Pazarlama",
    icon: Pill,
    description: "360° dijital pazarlama çözümleri",
    subcategories: [
      {
        id: "icerik-uretimi",
        title: "İçerik Üretimi",
        products: [
          "Profesyonel Ürün Fotoğraf Çekimi",
          "Video Prodüksiyon Hizmetleri",
          "3D Modelleme ve Animasyon",
          "Grafik Tasarım Hizmetleri",
          "Sosyal Medya İçeriği",
          "Diğer İçerik Türleri",
        ],
      },
      {
        id: "reklam-yonetimi",
        title: "Reklam Yönetimi",
        products: [
          "Google Ads Kampanya Yönetimi",
          "Meta (Facebook & Instagram) Ads",
          "YouTube Reklam Kampanyaları",
          "LinkedIn Reklam Yönetimi",
          "Programatik Reklam",
          "Diğer Reklam Platformları",
        ],
      },
      {
        id: "influencer-pazarlama",
        title: "Influencer Pazarlama",
        products: [
          "Mikro Influencer Kampanyaları",
          "Makro Influencer İş Birlikleri",
          "Nano Influencer Stratejileri",
          "Celebrity Endorsement",
          "Kampanya Yönetimi ve Takibi",
          "Diğer Influencer Hizmetleri",
        ],
      },
      {
        id: "hepsi",
        title: "Tüm Pazarlama Hizmetleri",
        products: ["Pazarlama türü seçmek istemiyorum, hepsini değerlendirin"],
      },
    ],
  },
];

const packagingOptions = [
  "Şişe (Plastik)",
  "Şişe (Cam)",
  "Tüp",
  "Kavanoz",
  "Poşet/Sachet",
  "Kutu",
  "Blister",
  "Stick",
  "Aerosol",
  "Diğer",
];

const volumeRanges = [
  "1.000 - 5.000 adet",
  "5.000 - 10.000 adet",
  "10.000 - 25.000 adet",
  "25.000 - 50.000 adet",
  "50.000 - 100.000 adet",
  "100.000+ adet",
];

export default function TeklifPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Firebase submission hook
  const {
    isSubmitting,
    submitResult,
    submitForm,
    clearResult,
    resetSubmission,
    isSuccess,
    isError,
    hasErrors,
    errorMessage,
    successMessage,
  } = useQuoteSubmission();

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
    productType: "", // Kozmetik, Gıda Takviyesi, Temizlik
    consistency: "", // Krem, gel, sıvı, etc.
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
    brandStage: "", // Yeni marka, mevcut marka, rebrand
    targetAudience: "",
    marketingGoals: [],
    campaignBudget: "",
    contentNeeds: [],

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

  // Scroll to form top when step changes
  const scrollToForm = () => {
    const formElement = document.getElementById("quote-form");
    if (formElement) {
      formElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  // Reusable Field Component
  const FormField = ({
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
  );

  // Reusable Input Component
  const FormInput = ({
    id,
    value,
    onChange,
    error,
    placeholder,
    type = "text",
    ...props
  }) => (
    <Input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className={`h-12 text-base border-2 transition-all duration-300 ${
        error
          ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/50"
          : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50"
      } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg shadow-sm`}
      placeholder={placeholder}
      {...props}
    />
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = "Ad zorunludur";
        if (!formData.lastName.trim()) newErrors.lastName = "Soyad zorunludur";
        if (!formData.email.trim()) {
          newErrors.email = "E-posta zorunludur";
        } else {
          // E-posta formatı kontrolü
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            newErrors.email = "Geçerli bir e-posta adresi girin";
          }
        }
        if (!formData.phone.trim()) {
          newErrors.phone = "Telefon zorunludur";
        } else {
          // Telefon formatı kontrolü (basit)
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
      case 3:
        // Hizmet alanına göre özel validasyonlar
        if (formData.serviceArea === "fason-uretim") {
          if (!formData.existingFormula)
            newErrors.existingFormula = "Bu alan zorunludur";
        } else if (formData.serviceArea === "ambalaj") {
          if (!formData.ambalajType)
            newErrors.ambalajType = "Ambalaj tipi seçimi zorunludur";
          if (!formData.quantity)
            newErrors.quantity = "Miktar seçimi zorunludur";
        } else if (formData.serviceArea === "eticaret-operasyon") {
          if (!formData.currentOrderVolume)
            newErrors.currentOrderVolume = "Sipariş hacmi belirtilmelidir";
        } else if (formData.serviceArea === "dijital-pazarlama") {
          if (!formData.brandStage)
            newErrors.brandStage = "Marka durumu belirtilmelidir";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    console.log("nextStep called, currentStep:", currentStep);
    console.log("formData:", formData);
    const isValid = validateStep(currentStep);
    console.log("Validation result:", isValid);
    if (isValid) {
      if (currentStep === 3) {
        // 3. adımdan 4. adıma geçerken validation yap ama submit etme
        setCurrentStep(4);
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
      }
      // Scroll to form after state update
      setTimeout(() => scrollToForm(), 100);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    // Scroll to form after state update
    setTimeout(() => scrollToForm(), 100);
  };

  const handleKeyDown = (e) => {
    // Enter tuşuna basıldığında form submit olmasını engelle
    if (e.key === "Enter" && currentStep !== 4) {
      e.preventDefault();
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submit işlemini engelle, sadece 4. adımda handleFinalSubmit kullan
    return false;
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return; // Çift tıklamayı engelle

    try {
      console.log("Starting form submission with data:", formData);
      setShowSubmissionModal(true); // Modal'ı göster
      const result = await submitForm(formData);
      console.log("Submission result:", result);

      if (result.success) {
        // Başarılı gönderim - modal açık kalır, success component gösterilir
        console.log("Form successfully submitted:", result);
      } else {
        // Hata durumu - modal açık kalır, error component gösterilir
        console.error("Form submission failed:", result);

        // Eğer validation hataları varsa, kullanıcıyı ilgili adıma yönlendir
        if (result.errors) {
          setErrors(result.errors);
          // İlk hatanın bulunduğu adımı belirle
          const errorFields = Object.keys(result.errors);
          console.log("Error fields:", errorFields);
          if (
            errorFields.some((field) =>
              ["firstName", "lastName", "email", "phone", "company"].includes(
                field
              )
            )
          ) {
            setCurrentStep(1);
          } else if (
            errorFields.some((field) =>
              ["serviceArea", "projectName", "projectDescription"].includes(
                field
              )
            )
          ) {
            setCurrentStep(2);
          } else if (
            errorFields.some((field) =>
              [
                "existingFormula",
                "ambalajType",
                "quantity",
                "currentOrderVolume",
                "brandStage",
              ].includes(field)
            )
          ) {
            setCurrentStep(3);
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error during form submission:", error);
    }
  };

  // Modal kapama fonksiyonu
  const handleCloseModal = () => {
    setShowSubmissionModal(false);
    resetSubmission();

    // Başarılı gönderim sonrası ana sayfaya yönlendir
    if (isSuccess) {
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  };

  // Tekrar deneme fonksiyonu
  const handleRetrySubmission = () => {
    clearResult();
    setShowSubmissionModal(false);
    // Kullanıcıyı form üzerinde bırak
  };

  const getSelectedArea = () => {
    return serviceAreas.find((area) => area.id === formData.serviceArea);
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: "Kişi Bilgileri", shortTitle: "Kişi" },
      { number: 2, title: "Proje Detayları", shortTitle: "Proje" },
      { number: 3, title: "Teknik Özellikler", shortTitle: "Teknik" },
      { number: 4, title: "Tamamla", shortTitle: "Tamamla" },
    ];

    return (
      <div className="w-full mb-6 sm:mb-8 px-2">
        {/* Mobile Step Indicator */}
        <div className="block sm:hidden">
          <div className="relative flex items-center justify-between w-full max-w-sm mx-auto">
            {/* Progress Line */}
            <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-600"></div>
            <div
              className="absolute top-3 left-0 h-0.5 bg-blue-600 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            ></div>

            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center z-10"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1 border-2 ${
                    currentStep >= step.number
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-500 border-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="text-xs font-medium text-center">
                  <div
                    className={`${
                      currentStep >= step.number
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.shortTitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Step Indicator */}
        <div className="hidden sm:flex items-center justify-center">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentStep >= step.number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="ml-2 text-sm font-medium">
                  <div
                    className={`${
                      currentStep >= step.number
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 ${
                      currentStep > step.number
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Client-side SEO */}
      <TeklifSEO />

      {/* Structured Data */}
      <TeklifStructuredData />
      <OrganizationSchema />
      <LocalBusinessSchema />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-x-hidden w-full max-w-full">
        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-12 sm:py-16 overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                Teklif Formu
              </Badge>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Ücretsiz Teklif Alın
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-6">
                Detaylı bilgilerinizi paylaşın, ihtiyacınıza özel teklifi 24
                saat içinde alın
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">
                    24 Saat İçinde Yanıt
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">
                    Ücretsiz Danışmanlık
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Content */}
        <section className="py-8 sm:py-12 lg:py-16 overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
            <div className="max-w-4xl mx-auto overflow-x-hidden">
              {renderStepIndicator()}

              <Card
                id="quote-form"
                className="shadow-2xl border-0 bg-white dark:bg-gray-900 overflow-x-hidden w-full max-w-full"
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                  <div className="text-center space-y-2">
                    <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-gray-100 font-bold">
                      {currentStep === 1 && "🏢 Kişi ve Firma Bilgileriniz"}
                      {currentStep === 2 && "📋 Proje Detayları"}
                      {currentStep === 3 && "⚙️ Teknik Özellikler"}
                      {currentStep === 4 && "✅ Son Kontrol ve Gönder"}
                    </CardTitle>
                    <CardDescription className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {currentStep === 1 &&
                        "İletişim bilgilerinizi eksiksiz doldurun"}
                      {currentStep === 2 &&
                        "Üretmek istediğiniz ürün hakkında detaylı bilgi verin"}
                      {currentStep === 3 &&
                        "Teknik gereksinimler ve özel isteklerinizi belirtin"}
                      {currentStep === 4 &&
                        "Bilgilerinizi kontrol edin ve formu gönderin"}
                    </CardDescription>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                      <div
                        className={`bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out ${
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Adım {currentStep} / 4 • %
                      {((currentStep / 4) * 100).toFixed(0)} tamamlandı
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 overflow-x-hidden w-full max-w-full">
                  {/* Submission Error Alert */}
                  {isError && !showSubmissionModal && (
                    <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <strong>Gönderim Hatası:</strong> {errorMessage}
                        {hasErrors &&
                          " Lütfen aşağıdaki alanları kontrol edin."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    onKeyDown={handleKeyDown}
                    className="overflow-x-hidden w-full max-w-full"
                  >
                    {/* Step 1: Kişi Bilgileri */}
                    {currentStep === 1 && (
                      <div className="space-y-6 sm:space-y-8 overflow-x-hidden w-full max-w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 overflow-x-hidden w-full max-w-full">
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
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
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
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              error={errors.lastName}
                              placeholder="Soyadınızı girin"
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
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
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
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
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              error={errors.phone}
                              placeholder="+90 5XX XXX XX XX"
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                              onChange={(e) =>
                                handleInputChange("company", e.target.value)
                              }
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
                              onChange={(e) =>
                                handleInputChange("position", e.target.value)
                              }
                              error={errors.position}
                              placeholder="Genel Müdür, Satış Müdürü vs."
                            />
                          </FormField>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Proje Detayları */}
                    {currentStep === 2 && (
                      <div className="space-y-8 overflow-x-hidden w-full max-w-full">
                        {/* Hizmet Alanı Seçimi */}
                        <div className="space-y-4 overflow-x-hidden">
                          <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">
                            Hizmet Alanı <span className="text-red-500">*</span>
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-x-hidden w-full max-w-full">
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
                                    <div className="text-blue-500">
                                      <CheckCircle className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {errors.serviceArea && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.serviceArea}
                            </p>
                          )}
                        </div>

                        {/* Alt Kategori Seçimi */}
                        {formData.serviceArea && (
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">
                              Alt Kategori{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-x-hidden w-full max-w-full">
                              {getSelectedArea()?.subcategories.map(
                                (subcategory) => (
                                  <div
                                    key={subcategory.id}
                                    className={`relative cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 hover:shadow-sm ${
                                      formData.serviceSubcategory ===
                                      subcategory.id
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
                                        {subcategory.products.length} seçenek
                                      </p>
                                      {formData.serviceSubcategory ===
                                        subcategory.id && (
                                        <div className="absolute -top-1 -right-1 text-blue-500">
                                          <CheckCircle className="h-4 w-4" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            {errors.serviceSubcategory && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.serviceSubcategory}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Ürün Kategorisi Seçimi */}
                        {formData.serviceSubcategory && (
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">
                              Ürün/Hizmet Kategorisi
                            </Label>
                            <div className="grid grid-cols-1 gap-2 overflow-x-hidden w-full max-w-full">
                              {getSelectedArea()
                                ?.subcategories.find(
                                  (sub) =>
                                    sub.id === formData.serviceSubcategory
                                )
                                ?.products.map((product, index) => (
                                  <div
                                    key={index}
                                    className={`relative cursor-pointer transition-all duration-200 border rounded-lg p-3 hover:shadow-sm ${
                                      formData.productCategory === product
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 bg-white dark:bg-gray-800"
                                    }`}
                                    onClick={() =>
                                      handleInputChange(
                                        "productCategory",
                                        product
                                      )
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {product}
                                      </span>
                                      {formData.productCategory === product && (
                                        <CheckCircle className="h-4 w-4 text-blue-500" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <Label
                            htmlFor="projectName"
                            className="text-lg font-semibold text-gray-900 dark:text-gray-100 block"
                          >
                            Proje Adı <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="projectName"
                            value={formData.projectName}
                            onChange={(e) =>
                              handleInputChange("projectName", e.target.value)
                            }
                            className={`h-12 text-lg border-2 transition-all duration-200 ${
                              errors.projectName
                                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg shadow-sm`}
                            placeholder="Projenizin adını girin"
                          />
                          {errors.projectName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.projectName}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor="projectDescription"
                            className="text-gray-900 dark:text-gray-100 font-medium mb-2 block"
                          >
                            Proje Açıklaması *
                          </Label>
                          <Textarea
                            id="projectDescription"
                            value={formData.projectDescription}
                            onChange={(e) =>
                              handleInputChange(
                                "projectDescription",
                                e.target.value
                              )
                            }
                            className={`border-2 ${
                              errors.projectDescription
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800`}
                            placeholder="Projenizin detaylarını, hedeflerinizi ve beklentilerinizi açıklayın"
                            rows={4}
                          />
                          {errors.projectDescription && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.projectDescription}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor="targetMarket"
                            className="text-gray-900 dark:text-gray-100 font-medium mb-2 block"
                          >
                            Hedef Pazar
                          </Label>
                          <Select
                            value={formData.targetMarket}
                            onValueChange={(value) =>
                              handleInputChange("targetMarket", value)
                            }
                          >
                            <SelectTrigger className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                              <SelectValue placeholder="Hedef pazar seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="domestic">Türkiye</SelectItem>
                              <SelectItem value="eu">Avrupa Birliği</SelectItem>
                              <SelectItem value="middle-east">
                                Orta Doğu
                              </SelectItem>
                              <SelectItem value="africa">Afrika</SelectItem>
                              <SelectItem value="global">Küresel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Teknik Özellikler / Detaylar */}
                    {currentStep === 3 && (
                      <div className="space-y-8 overflow-x-hidden w-full max-w-full">
                        {/* FASON ÜRETİM TEKNİK DETAYLARI */}
                        {formData.serviceArea === "fason-uretim" && (
                          <>
                            {/* Formül Durumu */}
                            <div className="space-y-4">
                              <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Formül Durumunuz{" "}
                                <span className="text-red-500">*</span>
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
                                    label:
                                      "Mevcut formülümü geliştirmek istiyorum",
                                    desc: "R&D desteği ile iyileştirme",
                                  },
                                  {
                                    value: "new",
                                    label: "Yeni formül geliştirmek istiyorum",
                                    desc: "Sıfırdan formül geliştirme",
                                  },
                                  {
                                    value: "copy",
                                    label:
                                      "Piyasadaki bir ürünün benzerini istiyorum",
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
                                      handleInputChange(
                                        "existingFormula",
                                        option.value
                                      )
                                    }
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div
                                        className={`mt-1 h-4 w-4 rounded-full border-2 ${
                                          formData.existingFormula ===
                                          option.value
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {formData.existingFormula ===
                                          option.value && (
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
                              <div>
                                <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                  Ürün Kıvamı/Formu
                                </Label>
                                <Select
                                  value={formData.consistency}
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
                                    <SelectItem value="lotion">
                                      Losyon
                                    </SelectItem>
                                    <SelectItem value="foam">Köpük</SelectItem>
                                    <SelectItem value="powder">Toz</SelectItem>
                                    <SelectItem value="tablet">
                                      Tablet
                                    </SelectItem>
                                    <SelectItem value="capsule">
                                      Kapsül
                                    </SelectItem>
                                    <SelectItem value="stick">Stick</SelectItem>
                                    <SelectItem value="oil">Yağ</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                  Hedef Raf Ömrü
                                </Label>
                                <Select
                                  value={formData.shelfLife}
                                  onValueChange={(value) =>
                                    handleInputChange("shelfLife", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Raf ömrü seçin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="6months">
                                      6 Ay
                                    </SelectItem>
                                    <SelectItem value="12months">
                                      12 Ay
                                    </SelectItem>
                                    <SelectItem value="18months">
                                      18 Ay
                                    </SelectItem>
                                    <SelectItem value="24months">
                                      24 Ay
                                    </SelectItem>
                                    <SelectItem value="36months">
                                      36 Ay
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Özel İçerikler */}
                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Özel İçerik Talepleri
                              </Label>
                              <Textarea
                                value={formData.ingredients}
                                onChange={(e) =>
                                  handleInputChange(
                                    "ingredients",
                                    e.target.value
                                  )
                                }
                                placeholder="Özel aktif maddeler, doğal içerikler, vitaminler vb. isteklerinizi belirtin"
                                rows={3}
                              />
                            </div>

                            {/* Sertifikasyon Gereksinimleri */}
                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Sertifikasyon ve Uyumluluk Gereksinimleri
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  "ISO 22716 (Kozmetik GMP)",
                                  "Halal Sertifikası",
                                  "Organik Sertifikası",
                                  "Vegan Sertifikası",
                                  "Cruelty-Free",
                                  "FDA Uyumluluğu",
                                  "CE İşareti",
                                  "Dermatologist Test",
                                ].map((cert) => (
                                  <div
                                    key={cert}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={cert}
                                      checked={formData.regulatoryRequirements.includes(
                                        cert
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleArrayChange(
                                          "regulatoryRequirements",
                                          cert,
                                          checked
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={cert}
                                      className="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                      {cert}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* AMBALAJ ÇÖZÜMLERİ TEKNİK DETAYLARI */}
                        {formData.serviceArea === "ambalaj" && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                  Ambalaj Tipi{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={formData.ambalajType}
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
                                    <SelectItem value="pump">
                                      Pompalı Şişe
                                    </SelectItem>
                                    <SelectItem value="airless">
                                      Airless Şişe
                                    </SelectItem>
                                    <SelectItem value="spray">
                                      Spray Şişe
                                    </SelectItem>
                                    <SelectItem value="dropper">
                                      Damlalıklı Şişe
                                    </SelectItem>
                                    <SelectItem value="stick">
                                      Stick Ambalaj
                                    </SelectItem>
                                    <SelectItem value="sachet">
                                      Sachet/Poşet
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                  Malzeme Tercihi
                                </Label>
                                <Select
                                  value={formData.ambalajMaterial}
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
                                    <SelectItem value="aluminum">
                                      Alüminyum
                                    </SelectItem>
                                    <SelectItem value="laminated">
                                      Lamine Malzeme
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Baskı ve Tasarım Gereksinimleri
                              </Label>
                              <Textarea
                                value={formData.printingRequirements}
                                onChange={(e) =>
                                  handleInputChange(
                                    "printingRequirements",
                                    e.target.value
                                  )
                                }
                                placeholder="Logo baskısı, etiket tasarımı, renk tercihleri, özel finishing işlemleri vb."
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Miktar ve Teslimat{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.quantity}
                                onValueChange={(value) =>
                                  handleInputChange("quantity", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sipariş miktarını seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="500-1000">
                                    500 - 1.000 adet
                                  </SelectItem>
                                  <SelectItem value="1000-5000">
                                    1.000 - 5.000 adet
                                  </SelectItem>
                                  <SelectItem value="5000-10000">
                                    5.000 - 10.000 adet
                                  </SelectItem>
                                  <SelectItem value="10000-25000">
                                    10.000 - 25.000 adet
                                  </SelectItem>
                                  <SelectItem value="25000-50000">
                                    25.000 - 50.000 adet
                                  </SelectItem>
                                  <SelectItem value="50000+">
                                    50.000+ adet
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {/* E-TİCARET OPERASYON TEKNİK DETAYLARI */}
                        {formData.serviceArea === "eticaret-operasyon" && (
                          <>
                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Mevcut Sipariş Hacminiz{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.currentOrderVolume}
                                onValueChange={(value) =>
                                  handleInputChange("currentOrderVolume", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Aylık sipariş adedini seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0-50">
                                    0 - 50 sipariş/ay
                                  </SelectItem>
                                  <SelectItem value="50-200">
                                    50 - 200 sipariş/ay
                                  </SelectItem>
                                  <SelectItem value="200-500">
                                    200 - 500 sipariş/ay
                                  </SelectItem>
                                  <SelectItem value="500-1000">
                                    500 - 1.000 sipariş/ay
                                  </SelectItem>
                                  <SelectItem value="1000-2500">
                                    1.000 - 2.500 sipariş/ay
                                  </SelectItem>
                                  <SelectItem value="2500+">
                                    2.500+ sipariş/ay
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Depo ve Lojistik İhtiyaçları
                              </Label>
                              <Textarea
                                value={formData.warehouseNeeds}
                                onChange={(e) =>
                                  handleInputChange(
                                    "warehouseNeeds",
                                    e.target.value
                                  )
                                }
                                placeholder="Stok alanı ihtiyacı, özel saklama koşulları, kargo hacmi beklentileri"
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Entegrasyon İhtiyaçları
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  "E-ticaret Platformu (Shopify, WooCommerce vb.)",
                                  "ERP Sistemi Entegrasyonu",
                                  "Muhasebe Sistemi Entegrasyonu",
                                  "CRM Sistemi Entegrasyonu",
                                  "Kargo Firması API Entegrasyonu",
                                  "SMS/Email Otomasyonu",
                                  "Stok Takip Sistemi",
                                  "Raporlama ve Analitik",
                                ].map((integration) => (
                                  <div
                                    key={integration}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={integration}
                                      checked={formData.integrationNeeds.includes(
                                        integration
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleArrayChange(
                                          "integrationNeeds",
                                          integration,
                                          checked
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={integration}
                                      className="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                      {integration}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Müşteri Hizmetleri Gereksinimleri
                              </Label>
                              <Textarea
                                value={formData.customerServiceNeeds}
                                onChange={(e) =>
                                  handleInputChange(
                                    "customerServiceNeeds",
                                    e.target.value
                                  )
                                }
                                placeholder="Telefon desteği, canlı chat, email yanıtlama, iade/değişim süreçleri"
                                rows={3}
                              />
                            </div>
                          </>
                        )}

                        {/* DİJİTAL PAZARLAMA TEKNİK DETAYLARI */}
                        {formData.serviceArea === "dijital-pazarlama" && (
                          <>
                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Marka Durumunuz{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <div className="grid grid-cols-1 gap-3">
                                {[
                                  {
                                    value: "new",
                                    label: "Yeni marka kuruyorum",
                                    desc: "Sıfırdan marka stratejisi",
                                  },
                                  {
                                    value: "existing",
                                    label:
                                      "Mevcut markam var, büyütmek istiyorum",
                                    desc: "Marka büyütme stratejileri",
                                  },
                                  {
                                    value: "relaunch",
                                    label: "Rebrand/yeniden lansma yapıyorum",
                                    desc: "Marka yenileme süreçleri",
                                  },
                                  {
                                    value: "seasonal",
                                    label: "Belirli bir kampanya/lansman için",
                                    desc: "Kampanya odaklı pazarlama",
                                  },
                                ].map((option) => (
                                  <div
                                    key={option.value}
                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                      formData.brandStage === option.value
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                    }`}
                                    onClick={() =>
                                      handleInputChange(
                                        "brandStage",
                                        option.value
                                      )
                                    }
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div
                                        className={`mt-1 h-4 w-4 rounded-full border-2 ${
                                          formData.brandStage === option.value
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {formData.brandStage ===
                                          option.value && (
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

                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Hedef Kitle Tanımı
                              </Label>
                              <Textarea
                                value={formData.targetAudience}
                                onChange={(e) =>
                                  handleInputChange(
                                    "targetAudience",
                                    e.target.value
                                  )
                                }
                                placeholder="Yaş grubu, cinsiyet, ilgi alanları, demografik özellikler, satın alma davranışları"
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                Pazarlama Hedefleriniz
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  "Marka Bilinirliği Artırma",
                                  "Satış Artışı",
                                  "Web Sitesi Trafiği Artırma",
                                  "Sosyal Medya Takipçi Artışı",
                                  "Lead Generation",
                                  "Müşteri Sadakati Artırma",
                                  "Yeni Ürün Lansmanı",
                                  "Pazar Payı Artırma",
                                ].map((goal) => (
                                  <div
                                    key={goal}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={goal}
                                      checked={formData.marketingGoals.includes(
                                        goal
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleArrayChange(
                                          "marketingGoals",
                                          goal,
                                          checked
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={goal}
                                      className="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                      {goal}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                  Kampanya Bütçesi
                                </Label>
                                <Select
                                  value={formData.campaignBudget}
                                  onValueChange={(value) =>
                                    handleInputChange("campaignBudget", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Aylık bütçe aralığı" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5000-15000">
                                      5.000 - 15.000 TL
                                    </SelectItem>
                                    <SelectItem value="15000-30000">
                                      15.000 - 30.000 TL
                                    </SelectItem>
                                    <SelectItem value="30000-50000">
                                      30.000 - 50.000 TL
                                    </SelectItem>
                                    <SelectItem value="50000-100000">
                                      50.000 - 100.000 TL
                                    </SelectItem>
                                    <SelectItem value="100000+">
                                      100.000+ TL
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                                  İçerik İhtiyaçları
                                </Label>
                                <div className="space-y-2">
                                  {[
                                    "Ürün Fotoğrafçılığı",
                                    "Video Prodüksiyonu",
                                    "Grafik Tasarım",
                                    "Metin İçerik Yazımı",
                                    "Influencer İçeriği",
                                  ].map((content) => (
                                    <div
                                      key={content}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={content}
                                        checked={formData.contentNeeds.includes(
                                          content
                                        )}
                                        onCheckedChange={(checked) =>
                                          handleArrayChange(
                                            "contentNeeds",
                                            content,
                                            checked
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={content}
                                        className="text-sm text-gray-700 dark:text-gray-300"
                                      >
                                        {content}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* GENEL BİLGİLER (TÜM HİZMETLER İÇİN) */}
                        <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Proje Detayları
                          </h3>

                          <div>
                            <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                              Proje Zaman Çizelgesi
                            </Label>
                            <Select
                              value={formData.timeline}
                              onValueChange={(value) =>
                                handleInputChange("timeline", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Proje teslim süresini seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="asap">
                                  Mümkün olduğunca hızlı
                                </SelectItem>
                                <SelectItem value="1-month">
                                  1 Ay içinde
                                </SelectItem>
                                <SelectItem value="2-month">
                                  2 Ay içinde
                                </SelectItem>
                                <SelectItem value="3-month">
                                  3 Ay içinde
                                </SelectItem>
                                <SelectItem value="6-month">
                                  6 Ay içinde
                                </SelectItem>
                                <SelectItem value="flexible">Esnek</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                              Bütçe Beklentiniz
                            </Label>
                            <Select
                              value={formData.budget}
                              onValueChange={(value) =>
                                handleInputChange("budget", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Bütçe aralığını seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10000-25000">
                                  10.000 - 25.000 TL
                                </SelectItem>
                                <SelectItem value="25000-50000">
                                  25.000 - 50.000 TL
                                </SelectItem>
                                <SelectItem value="50000-100000">
                                  50.000 - 100.000 TL
                                </SelectItem>
                                <SelectItem value="100000-250000">
                                  100.000 - 250.000 TL
                                </SelectItem>
                                <SelectItem value="250000+">
                                  250.000+ TL
                                </SelectItem>
                                <SelectItem value="flexible">
                                  Esnek/Danışmanlık İstiyorum
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-gray-900 dark:text-gray-100 font-medium mb-3 block">
                              Ek Bilgiler ve Özel Talepler
                            </Label>
                            <Textarea
                              value={formData.notes}
                              onChange={(e) =>
                                handleInputChange("notes", e.target.value)
                              }
                              placeholder="Projenizie özel gereksinimler, beklentiler veya sorularınız"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Final Review */}
                    {currentStep === 4 && (
                      <div className="space-y-6 overflow-x-hidden w-full max-w-full">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Lütfen bilgilerinizi son kez kontrol edin. Form
                            gönderildikten sonra 24 saat içinde size detaylı
                            teklif sunacağız.
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
                              <CardTitle className="text-lg">
                                Proje Bilgileri
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <p>
                                <strong>Üretim Alanı:</strong>{" "}
                                {getSelectedArea()?.title}
                              </p>
                              {formData.productSubcategory && (
                                <p>
                                  <strong>Kategori:</strong>{" "}
                                  {formData.productSubcategory}
                                </p>
                              )}
                              <p>
                                <strong>Ürün:</strong> {formData.productName}
                              </p>
                              <p>
                                <strong>Üretim Miktarı:</strong>{" "}
                                {formData.productVolume}
                              </p>
                              {formData.timeline && (
                                <p>
                                  <strong>Hedef Tarih:</strong>{" "}
                                  {formData.timeline}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <div>
                          <Label
                            htmlFor="previousExperience"
                            className="text-gray-900 dark:text-gray-100 font-medium mb-2 block"
                          >
                            Daha Önce Fason Üretim Deneyiminiz Var mı?
                          </Label>
                          <Textarea
                            id="previousExperience"
                            value={formData.previousExperience}
                            onChange={(e) =>
                              handleInputChange(
                                "previousExperience",
                                e.target.value
                              )
                            }
                            className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                            placeholder="Daha önce fason üretim yaptırdıysanız deneyimlerinizi paylaşın"
                            rows={3}
                          />
                        </div>

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
                                  checked={formData.additionalServices.includes(
                                    service
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleArrayChange(
                                      "additionalServices",
                                      service,
                                      checked
                                    )
                                  }
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

                        <div>
                          <Label
                            htmlFor="notes"
                            className="text-gray-900 dark:text-gray-100 font-medium mb-2 block"
                          >
                            Ek Notlar
                          </Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                              handleInputChange("notes", e.target.value)
                            }
                            className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                            placeholder="Belirtmek istediğiniz başka bilgiler varsa buraya yazabilirsiniz"
                            rows={3}
                          />
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
                      {currentStep > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Önceki Adım
                        </Button>
                      ) : (
                        <div></div>
                      )}

                      <div className="w-full sm:w-auto">
                        {currentStep < 4 ? (
                          <Button
                            type="button"
                            onClick={nextStep}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            Sonraki Adım
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleFinalSubmit}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Gönderiliyor...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Teklif Talebini Gönder
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-12 bg-gray-50 dark:bg-slate-800 overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
            <div className="max-w-4xl mx-auto overflow-x-hidden">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Hemen İletişime Geçin
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Formu doldururken soru işaretleriniz mi var? Uzman ekibimiz
                  size yardımcı olmaya hazır.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Phone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Telefon</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {site.contact.headquarters.phone}
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">E-posta</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {site.contact.headquarters.email}
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Adres</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {site.contact.headquarters.address}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Submission Modal */}
        {showSubmissionModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {isSubmitting && <SubmissionLoading />}
                {isSuccess && (
                  <SubmissionSuccess
                    onClose={handleCloseModal}
                    result={submitResult}
                  />
                )}
                {isError && (
                  <SubmissionError
                    onRetry={handleRetrySubmission}
                    onClose={handleCloseModal}
                    result={submitResult}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
