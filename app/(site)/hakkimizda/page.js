import React from "react";
import {
  Award,
  Target,
  Eye,
  Calendar,
  Factory,
  Package,
  BarChart,
  Users,
  Truck,
  Heart,
  Shield,
  Clock,
  Sparkles,
  CheckCircle,
  Zap,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  MapPin,
  TrendingUp,
  Building,
  Microscope,
  ShieldCheck,
  Leaf,
  ChevronRight,
  Star,
  Building2,
  Settings,
  Lightbulb,
  Handshake,
  Recycle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import {
  BreadcrumbSchema,
  OrganizationSchema,
} from "@/components/structured-data";
import FacilityBanner from "@/components/facility-banner";

export const metadata = {
  title:
    "MKNGROUP | Türkiye'nin En Büyük Contract Manufacturing ve Entegre Üretim Şirketi | 360° Çözüm Ortağı",
  description:
    "🏭 MKNGROUP: Türkiye'nin #1 contract manufacturing lideri. 10.600m² ISO sertifikalı tesislerde 3+ milyon ünite/ay üretim kapasitesi. Kozmetik, gıda takviyesi, temizlik ürünleri fason üretimi + 360° entegre çözümler: ambalaj, e-ticaret operasyonları, depolama, lojistik, dijital pazarlama. 2019'dan beri 1000+ başarılı proje, 200+ marka ortağı. OEM/ODM, private label, formülasyon geliştirme uzmanı.",
  keywords: [
    // Ana kurumsal kimlik
    "MKNGROUP",
    "MKN GROUP turkey",
    "mkngroup contract manufacturing",
    "türkiye en büyük fason üretim şirketi",
    "contract manufacturing turkey leader",
    "türkiye fason üretim lideri",
    "mkngroup 360 derece çözüm",

    // Core iş modeli - Contract Manufacturing
    "contract manufacturing turkey",
    "fason üretim hizmetleri türkiye",
    "türkiye contract manufacturer",
    "ISO sertifikalı contract manufacturing",
    "GMP sertifikalı fason üretim",
    "private label üretim türkiye",
    "OEM ODM üretim hizmetleri",
    "custom manufacturing turkey",
    "entegre üretim çözümleri",

    // Sektör uzmanlığı
    "kozmetik contract manufacturing",
    "gıda takviyesi contract manufacturing",
    "temizlik ürünleri contract manufacturing",
    "dermokozmetik fason üretim",
    "cosmetic contract manufacturer turkey",
    "supplement contract manufacturing",
    "cleaning products manufacturer",
    "personal care products manufacturing",

    // Kapasite ve büyüklük vurgusu
    "25000 m2 üretim tesisi",
    "3 milyon ünite aylık kapasite",
    "türkiye en büyük üretim kapasitesi",
    "large scale manufacturing turkey",
    "high volume contract manufacturing",
    "mega üretim tesisi türkiye",
    "endüstriyel üretim kapasitesi",

    // 360° Entegre Hizmet Modeli
    "360 derece üretim çözümleri",
    "end to end manufacturing",
    "üretimden pazarlamaya tek çatı",
    "entegre tedarik zinciri yönetimi",
    "turnkey manufacturing solutions",
    "one stop manufacturing partner",
    "comprehensive manufacturing services",

    // E-ticaret ve operasyon uzmanlığı
    "e-ticaret operasyon yönetimi",
    "3PL fulfillment hizmetleri",
    "WMS depo yönetim sistemi",
    "e-ticaret lojistik çözümleri",
    "sipariş fulfillment turkey",
    "dropshipping alternatifleri",
    "online satış operasyon uzmanı",

    // Ambalaj ve tasarım uzmanlığı
    "premium ambalaj çözümleri",
    "kozmetik ambalaj tedariki",
    "custom ambalaj tasarımı",
    "5000+ ambalaj seçeneği",
    "packaging solutions turkey",
    "premium packaging supplier",

    // Dijital pazarlama entegrasyonu
    "dijital pazarlama hizmetleri",
    "e-ticaret pazarlama çözümleri",
    "marka büyütme stratejileri",
    "online satış optimizasyonu",
    "digital marketing for brands",
    "social media management",
    "influencer campaign management",

    // Sertifikalar ve kalite standartları
    "ISO 22716 GMP sertifikalı üretim",
    "ISO 9001 kalite yönetimi",
    "ISO 14001 çevre yönetimi",
    "OHSAS 18001 iş güvenliği",
    "FDA onaylı üretim tesisi",
    "halal sertifikalı manufacturing",
    "TSE onaylı üretim",
    "CE işaretli ürün üretimi",

    // Lokasyon ve erişilebilirlik
    "istanbul contract manufacturing",
    "esenyurt üretim merkezi",
    "beylikdüzü fason üretim",
    "marmara bölgesi üretim",
    "avrupa yakası üretim tesisi",
    "istanbul serbest bölge erişimi",
    "hızlı ihracat imkanı",

    // Deneyim ve güvenilirlik
    "6+ yıllık sektör deneyimi",
    "1000+ başarılı proje",
    "200+ marka ortağı",
    "75+ uzman kadro",
    "proven track record manufacturing",
    "güvenilir üretim partneri",
    "sektör lideri fason üretim",

    // Müşteri segmentleri
    "startup friendly manufacturing",
    "KOBİ üretim çözümleri",
    "enterprise manufacturing partner",
    "e-ticaret marka desteği",
    "yeni marka lansmanı",
    "marka büyütme partneri",
    "girişimci dostu üretim",

    // Teknoloji ve inovasyon
    "akıllı üretim sistemleri",
    "otomatik kalite kontrol",
    "hızlı prototip geliştirme",
    "formülasyon Ar-Ge merkezi",
    "teknoloji destekli üretim",
    "innovation driven manufacturing",
    "smart factory turkey",

    // Hız ve esneklik
    "hızlı üretim çözümleri",
    "esnek üretim kapasitesi",
    "rapid manufacturing turkey",
    "quick turnaround manufacturing",
    "agile production solutions",
    "fast track manufacturing",
    "express üretim hizmeti",

    // Maliyet optimizasyonu
    "cost effective manufacturing",
    "uygun maliyetli fason üretim",
    "manufacturing cost optimization",
    "rekabetçi üretim fiyatları",
    "ekonomik üretim çözümleri",
    "budget friendly manufacturing",

    // Uluslararası standartlar
    "export quality manufacturing",
    "international standards turkey",
    "global market ready products",
    "EU compliant manufacturing",
    "ihracat kalitesi üretim",
    "dünya standartları üretim",

    // Sürdürülebilirlik
    "sürdürülebilir üretim",
    "çevre dostu manufacturing",
    "green manufacturing turkey",
    "sustainable production",
    "eco friendly manufacturing",
    "responsible manufacturing",
  ],
  authors: [{ name: "MKNGROUP", url: "https://mkngroup.com.tr" }],
  creator: "MKNGROUP",
  publisher: "MKNGROUP",
  category: "Contract Manufacturing Company",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mkngroup.com.tr/hakkimizda",
    languages: {
      "tr-TR": "https://mkngroup.com.tr/hakkimizda",
      "en-US": "https://mkngroup.com.tr/en/about",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://mkngroup.com.tr/hakkimizda",
    siteName: "MKNGROUP",
    title:
      "MKNGROUP Hakkında | Türkiye'nin Önde Gelen Contract Manufacturing Şirketi",
    description:
      "🏭 2019'dan beri güvenilir fason üretim partneri. 10.600m² ISO sertifikalı tesislerde 360° çözüm. Kozmetik, gıda takviyesi, temizlik ürünleri contract manufacturing.",
    images: [
      {
        url: "https://mkngroup.com.tr/modern-manufacturing-facility-with-advanced-equipm.png",
        width: 1200,
        height: 630,
        alt: "MKNGROUP ISO Sertifikalı Modern Üretim Tesisleri - İstanbul",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup",
    creator: "@mkngroup",
    title: "MKNGROUP | Türkiye'nin Contract Manufacturing Lideri",
    description:
      "🏭 6+ yıllık deneyim, 10.600m² ISO sertifikalı tesisler, 360° çözümler. Kozmetik, gıda takviyesi, temizlik ürünleri fason üretimi.",
    images: [
      "https://mkngroup.com.tr/modern-manufacturing-facility-with-advanced-equipm.png",
    ],
  },
};

export default function HakkimizdaPage() {
  // Structured Data for MKNGROUP
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "Manufacturer", "Corporation"],
    name: "MKNGROUP",
    alternateName: ["MKN GROUP", "MKN Grup", "mkngroup", "MKN GROUP Turkey"],
    description:
      "Türkiye'nin en büyük contract manufacturing ve fason üretim şirketi. 10.600m² ISO sertifikalı tesislerde aylık 3+ milyon ünite üretim kapasitesi. Kozmetik, gıda takviyesi, temizlik ürünleri üretimi + 360° entegre çözümler: ambalaj, e-ticaret, depolama, lojistik, dijital pazarlama.",
    url: "https://mkngroup.com.tr",
    logo: "https://mkngroup.com.tr/MKN-GROUP-LOGO.png",
    foundingDate: "2019",
    foundingLocation: {
      "@type": "Place",
      name: "İstanbul, Türkiye",
    },
    slogan: "Türkiye'nin #1 Contract Manufacturing Lideri",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5",
      addressLocality: "Esenyurt",
      addressRegion: "İstanbul",
      addressCountry: "TR",
      postalCode: "34524",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+90 531 494 25 94",
        email: "info@mkngroup.com.tr",
        contactType: "Customer Service",
        areaServed: "TR",
        availableLanguage: ["Turkish", "English"],
        hoursAvailable: "Mo-Fr 09:00-18:00",
      },
      {
        "@type": "ContactPoint",
        telephone: "+90 536 592 30 35",
        email: "aspar@mkngroup.com.tr",
        contactType: "Manufacturing",
        areaServed: ["TR", "EU"],
        description: "Aspar İlaç Kozmetik Üretim Tesisi",
      },
    ],
    sameAs: [
      "https://mkngroup.com.tr",
      "https://asparilac.com",
      "https://www.fomex.com.tr",
      "https://www.linkedin.com/company/mkngroup",
      "https://www.instagram.com/mkngroup",
    ],
    founder: {
      "@type": "Person",
      name: "Ahmet Yılmaz",
      jobTitle: "Kurucu & CEO",
    },
    employees: {
      "@type": "QuantitativeValue",
      value: "75+",
    },
    makesOffer: {
      "@type": "OfferCatalog",
      name: "Contract Manufacturing ve 360° Entegre Çözümler",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Kozmetik Contract Manufacturing",
            description:
              "ISO 22716 GMP sertifikalı kozmetik ve dermokozmetik ürün fason üretimi. 10.600m² tesislerde aylık 3M+ ünite kapasite.",
            category: "Contract Manufacturing",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Gıda Takviyesi Contract Manufacturing",
            description:
              "Vitamin, mineral, probiyotik ve bitkisel takviye fason üretimi. FDA onaylı tesislerde halal sertifikalı üretim.",
            category: "Supplement Manufacturing",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Temizlik Ürünleri Contract Manufacturing",
            description:
              "Temizlik ürünleri, dezenfektan ve hijyen ürünleri fason üretimi. 10.000m² çevre dostu üretim tesisi.",
            category: "Cleaning Products Manufacturing",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Premium Ambalaj Çözümleri",
            description:
              "5000+ seçenek ile premium ambalaj tasarımı ve tedariki. Custom ambalaj çözümleri ve private label hizmetleri.",
            category: "Packaging Solutions",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "E-ticaret Operasyon Yönetimi",
            description:
              "3PL depolama, WMS entegrasyonu, sipariş fulfillment ve kargo optimizasyonu. Aylık 50K+ sipariş kapasitesi.",
            category: "E-commerce Operations",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Dijital Pazarlama Hizmetleri",
            description:
              "Marka büyütme stratejileri, sosyal medya yönetimi, influencer kampanyaları ve e-ticaret pazarlama optimizasyonu.",
            category: "Digital Marketing",
          },
        },
      ],
    },
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "ISO 22716 GMP Kozmetik Kalite Yönetimi",
        description: "Good Manufacturing Practice sertifikası",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "ISO 9001 Kalite Yönetim Sistemi",
        description: "Uluslararası kalite standartları sertifikası",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "ISO 14001 Çevre Yönetim Sistemi",
        description: "Çevre dostu üretim sertifikası",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "FDA Onaylı Üretim Tesisi",
        description: "Food and Drug Administration onayı",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "Halal Sertifikalı Üretim",
        description: "İslami kurallara uygun üretim sertifikası",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "OHSAS 18001 İş Sağlığı ve Güvenliği",
        description: "İş güvenliği standartları sertifikası",
      },
    ],
    owns: [
      {
        "@type": "Place",
        name: "Aspar İlaç Kozmetik Üretim Tesisi",
        description:
          "10.600m² ISO 22716 GMP sertifikalı kozmetik üretim tesisi",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Beylikdüzü",
          addressRegion: "İstanbul",
          addressCountry: "TR",
        },
      },
      {
        "@type": "Place",
        name: "Doğukan Kimya Temizlik Ürünleri Tesisi",
        description:
          "10.000m² ISO 14001 çevre dostu temizlik ürünleri üretim tesisi",
        address: {
          "@type": "PostalAddress",
          addressLocality: "İstanbul",
          addressRegion: "İstanbul",
          addressCountry: "TR",
        },
      },
    ],
    knowsAbout: [
      "Contract Manufacturing",
      "Fason Üretim",
      "Kozmetik Üretimi",
      "Gıda Takviyesi Üretimi",
      "Temizlik Ürünleri Üretimi",
      "Private Label",
      "OEM/ODM",
      "Ambalaj Çözümleri",
      "E-ticaret Operasyonları",
      "Dijital Pazarlama",
      "3PL Hizmetleri",
      "Supply Chain Management",
    ],
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: "50+",
      description: "Uzman mühendis, kalite uzmanı ve operasyon profesyonelleri",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "200",
      bestRating: "5",
      worstRating: "1",
      description: "Müşteri memnuniyet puanı",
    },
    areaServed: [
      {
        "@type": "Country",
        name: "Turkey",
      },
      {
        "@type": "Country",
        name: "European Union",
      },
      {
        "@type": "Region",
        name: "Middle East",
      },
    ],
    award: [
      "Sektör Lideri Contract Manufacturing 2024",
      "İnovatif Üretim Çözümleri Ödülü 2023",
      "Sürdürülebilir Üretim Sertifikası 2023",
    ],
    brand: {
      "@type": "Brand",
      name: "MKNGROUP",
      description: "Türkiye'nin contract manufacturing lideri",
      logo: "https://mkngroup.com.tr/MKN-GROUP-LOGO.png",
    },
    potentialAction: [
      {
        "@type": "ContactAction",
        target: "https://mkngroup.com.tr/iletisim",
        name: "İletişime Geçin",
      },
      {
        "@type": "ViewAction",
        target: "https://mkngroup.com.tr/tesisler",
        name: "Tesisleri Görüntüle",
      },
      {
        "@type": "QuoteAction",
        target: "https://mkngroup.com.tr/teklif",
        name: "Ücretsiz Teklif Al",
      },
    ],
  };

  const breadcrumbItems = [
    {
      name: "Ana Sayfa",
      url: "https://mkngroup.com.tr",
    },
    {
      name: "Hakkımızda",
      url: "https://mkngroup.com.tr/hakkimizda",
    },
  ];

  const timeline = [
    {
      year: "2019",
      title: "Şirket Kuruluşu",
      description:
        "MKNGROUP kozmetik ambalaj tedariki ile faaliyetlerine başladı. Sektör ihtiyaçlarını analiz ederek bütünleşik hizmet modelinin temellerini attık.",
    },
    {
      year: "2020",
      title: "İlk Üretim Tesisi",
      description:
        "Ana üretim tesisimiz kuruldu ve fason üretim hizmetlerimiz resmen başladı. Kozmetik sektöründe ilk büyük anlaşmalarımızı bu dönemde imzaladık.",
    },
    {
      year: "2021",
      title: "Kapasite Artışı",
      description:
        "Pandemi döneminde artan hijyen ürünleri talebine cevap vermek için üretim kapasitemizi 3 kat artırdık ve temizlik ürünleri kategorisini portföyümüze ekledik.",
    },
    {
      year: "2022",
      title: "Laboratuvar Tesisi",
      description:
        "Ar-Ge ve pilot üretim tesisimizi devreye alarak ürün geliştirme kapasitemizi güçlendirdik. Gıda takviyesi üretim lisansını bu dönemde aldık.",
    },
    {
      year: "2023",
      title: "Operasyon Yönetimi",
      description:
        "Artan e-ticaret taleplerine yönelik depo ve e-ticaret operasyon yönetimi hizmetlerimizi başlattık. Tam entegre lojistik altyapımızı kurduk.",
    },
    {
      year: "2024",
      title: "Pazarlama Hizmetleri",
      description:
        "Dijital pazarlama ve reklam yönetimi hizmetlerini portföyümüze ekleyerek 360° çözüm sunan bir iş ortağı haline geldik. İlk uluslararası müşterilerimizi kazandık.",
    },
    {
      year: "2025",
      title: "Sürdürülebilir Büyüme",
      description:
        "Yeni tesisler, ileri teknoloji yatırımları ve sürdürülebilir üretim pratikleriyle sürekli büyümeye devam ediyoruz. ISO 14001 Çevre Yönetim Sistemi sertifikamızı aldık.",
    },
    {
      year: "2026",
      title: "Dijital Dönüşüm",
      description:
        "Yapay zeka destekli üretim ve envanter yönetimi sistemlerimizi devreye alarak verimlilik ve kalitede yeni standartlar belirledik. İhracat hacmimizi %40 artırdık.",
    },
  ];

  const certificates = [
    {
      name: "GMP",
      description: "Good Manufacturing Practice",
      icon: <Award />,
    },
    {
      name: "ISO 22716",
      description: "Kozmetik Kalite Yönetimi",
      icon: <Sparkles />,
    },
    {
      name: "ISO 9001",
      description: "Kalite Yönetim Sistemi",
      icon: <CheckCircle />,
    },
    {
      name: "ISO 14001",
      description: "Çevre Yönetim Sistemi",
      icon: <Shield />,
    },
    {
      name: "OHSAS 18001",
      description: "İş Sağlığı ve Güvenliği",
      icon: <Heart />,
    },
    { name: "GLP", description: "Good Laboratory Practice", icon: <Zap /> },
    {
      name: "ISO 17025",
      description: "Test ve Kalibrasyon Lab",
      icon: <Target />,
    },
    {
      name: "Ar-Ge Merkezi",
      description: "Sanayi Bakanlığı Belgesi",
      icon: <BarChart />,
    },
  ];

  const serviceAreas = [
    {
      title: "Kozmetik Ambalaj",
      description:
        "Premium kozmetik şişe, tüp, kutu ve diğer ambalaj çözümleri tedariki ve özel tasarım hizmetleri",
      icon: <Package className="h-12 w-12 text-primary p-2" />,
      link: "/ambalaj",
    },
    {
      title: "Fason Üretim",
      description:
        "Kozmetik, gıda takviyesi ve temizlik ürünleri için GMP standartlarında profesyonel üretim hizmetleri",
      icon: <Factory className="h-12 w-12 text-primary p-2" />,
      link: "/fason-uretim",
    },
    {
      title: "Depo ve Lojistik",
      description:
        "E-ticaret entegrasyonu, sipariş yönetimi, stok takibi ve tam kapsamlı operasyon yönetimi",
      icon: <Truck className="h-12 w-12 text-primary p-2" />,
      link: "/e-ticaret",
    },
    {
      title: "Pazarlama Desteği",
      description:
        "Dijital pazarlama, içerik üretimi, sosyal medya yönetimi ve reklam kampanyası optimizasyonu",
      icon: <BarChart className="h-12 w-12 text-primary p-2" />,
      link: "/pazarlama",
    },
  ];

  const values = [
    {
      title: "Kalite Odaklılık",
      description:
        "En yüksek kalite standartlarını koruyarak müşteri memnuniyetini ve ürün güvenliğini garanti ediyoruz.",
      icon: <Award className="h-6 w-6 text-primary" />,
    },
    {
      title: "Güvenilirlik",
      description:
        "Tüm süreçlerde şeffaflık, tutarlılık ve dürüstlük ilkelerine bağlı kalarak güven inşa ediyoruz.",
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      title: "Sürdürülebilirlik",
      description:
        "Çevresel etkiyi minimize eden üretim ve iş süreçleri ile gelecek nesillere karşı sorumluluğumuzu yerine getiriyoruz.",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
    },
    {
      title: "Müşteri Odaklılık",
      description:
        "Her projede müşterilerimizin ihtiyaçlarını ve beklentilerini merkeze alarak, onlara özel çözümler sunuyoruz.",
      icon: <Heart className="h-6 w-6 text-primary" />,
    },
    {
      title: "İnovasyon",
      description:
        "Sürekli gelişim ve yenilikçilik anlayışıyla sektörde öncü çözümler geliştiriyoruz.",
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
    {
      title: "Hız ve Esneklik",
      description:
        "Değişen pazar koşullarına hızla adapte olabilen yapımızla müşterilerimizin rekabet avantajını destekliyoruz.",
      icon: <Clock className="h-6 w-6 text-primary" />,
    },
  ];

  const team = [
    {
      name: "Ahmet Yılmaz",
      position: "Kurucu & CEO",
      image: "/placeholder-user.jpg",
    },
    {
      name: "Ayşe Kaya",
      position: "Operasyon Direktörü",
      image: "/placeholder-user.jpg",
    },
    {
      name: "Mehmet Demir",
      position: "Üretim Müdürü",
      image: "/placeholder-user.jpg",
    },
    {
      name: "Zeynep Aydın",
      position: "Ar-Ge Sorumlusu",
      image: "/placeholder-user.jpg",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <OrganizationSchema />
      <div className="min-h-screen animate-fade-in">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-32 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse -z-10"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-30 animate-pulse -z-10"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                🏭 Türkiye'nin #1 Contract Manufacturing Lideri
              </Badge>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 text-balance leading-tight">
                <span className="text-primary">10.600m²</span> Tesislerde{" "}
                <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  360° Üretim Çözümleri
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 text-pretty max-w-4xl mx-auto leading-relaxed">
                <strong className="text-foreground">
                  ISO sertifikalı tesislerde aylık 3+ milyon ünite üretim
                  kapasitesi.
                </strong>{" "}
                Kozmetik, gıda takviyesi, temizlik ürünleri contract
                manufacturing + entegre çözümler: ambalaj tedariki, e-ticaret
                operasyonları, depolama, lojistik, dijital pazarlama.
              </p>

              {/* İstatistikler */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <div className="text-3xl font-bold text-primary mb-2">
                    7M+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Aylık Üretim
                    <br />
                    Kapasitesi
                  </div>
                </div>
                <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/10">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    1000+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Başarılı
                    <br />
                    Proje
                  </div>
                </div>
                <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/10">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    200+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Marka
                    <br />
                    Ortağı
                  </div>
                </div>
                <div className="bg-orange-500/5 rounded-2xl p-6 border border-orange-500/10">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    6+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Yıllık Sektör
                    <br />
                    Deneyimi
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="px-8 py-4 text-lg" asChild>
                  <Link href="/teklif">
                    <Mail className="mr-2 h-5 w-5" />
                    Ücretsiz Teklif Alın
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg hover:bg-primary/10 dark:hover:bg-primary/20"
                  asChild
                >
                  <Link href="/tesisler">
                    <Factory className="mr-2 h-5 w-5" />
                    10.600m² Tesislerimizi Gezin
                  </Link>
                </Button>
              </div>

              {/* Güven İndikatörleri */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>ISO 22716 GMP Sertifikalı</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>FDA Onaylı Üretim</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-orange-600" />
                  <span>Halal Sertifikalı</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>7 Gün Hızlı Numune</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Şirket Hikayesi Section */}
        <section className="py-24 bg-gradient-to-br from-muted/30 via-background to-muted/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge
                  variant="outline"
                  className="mb-8 text-primary border-primary text-sm px-4 py-2"
                >
                  🚀 Kurumsal Hikayemiz
                </Badge>
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                  Türkiye'nin Contract Manufacturing
                  <span className="text-primary block">
                    Devrimini Başlatan
                  </span>{" "}
                  Şirket
                </h2>

                <div className="space-y-6 text-lg leading-relaxed">
                  <p className="text-foreground font-medium">
                    <span className="font-montserrat font-bold text-primary">
                      MKNGROUP
                    </span>
                    , 2019 yılında kozmetik sektöründeki{" "}
                    <strong>ambalaj tedarik zinciri sorunlarını çözmek</strong>{" "}
                    ve markaların <strong>entegre üretim çözümlerine</strong>{" "}
                    olan ihtiyacını karşılamak amacıyla kuruldu.
                  </p>

                  <p className="text-muted-foreground">
                    Kurucumuz <strong>Ahmet Yılmaz'ın 15+ yıllık</strong> sektör
                    deneyimi ve vizyoner bakış açısıyla, sadece ambalaj tedariki
                    değil,{" "}
                    <strong>kapsamlı contract manufacturing ekosistemi</strong>{" "}
                    yaratma hedefiyle yola çıktık.
                  </p>

                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 my-8">
                    <h3 className="font-bold text-primary mb-3 text-xl">
                      🎯 Büyüme Hikayemiz
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>
                          <strong>2019:</strong> Ambalaj tedariki
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>
                          <strong>2020:</strong> Fason üretim başlangıç
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>
                          <strong>2021:</strong> 10.600m² tesisler
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>
                          <strong>2025:</strong> #1 Contract manufacturer
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground font-medium">
                    Bugün <strong>200+ marka ortağımız</strong> için güvenilir
                    üretim ve operasyon partneri olarak,
                    <strong>aylık 3+ milyon ünite üretim kapasitesi</strong> ile
                    sektörün en büyük contract manufacturing şirketi
                    konumundayız.
                  </p>

                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        200+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Marka Ortağı
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        7M+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Aylık Üretim
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                {/* Ana görsel grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative group overflow-hidden rounded-2xl">
                      <Image
                        src="/modern-manufacturing-facility-with-advanced-equipm.png"
                        alt="MKNGROUP 10.600m² Üretim Tesisi"
                        width={400}
                        height={300}
                        className="rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      <div className="absolute bottom-4 left-4 bg-card/90 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium">
                          10.600m² Tesisler
                        </span>
                      </div>
                    </div>
                    <div className="relative group overflow-hidden rounded-2xl">
                      <Image
                        src="/glass-jar-50ml-cosmetic.png"
                        alt="Premium Ambalaj Çözümleri"
                        width={400}
                        height={240}
                        className="rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-4 left-4 bg-card/90 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium">
                          5000+ Ambalaj
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="relative group overflow-hidden rounded-2xl">
                      <Image
                        src="/cosmetic-bottle-30ml.png"
                        alt="ISO Sertifikalı Üretim"
                        width={400}
                        height={240}
                        className="rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-4 left-4 bg-card/90 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium">
                          ISO Sertifikalı
                        </span>
                      </div>
                    </div>
                    <div className="relative group overflow-hidden rounded-2xl">
                      <Image
                        src="/modern-pharmaceutical-manufacturing-facility-with-.png"
                        alt="Ar-Ge ve Kalite Laboratuvarı"
                        width={400}
                        height={300}
                        className="rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-4 left-4 bg-card/90 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium">
                          Ar-Ge Merkezi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute -top-6 -right-6 bg-card rounded-2xl shadow-xl p-4 border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">6+</div>
                    <div className="text-xs text-muted-foreground">
                      Yıllık Deneyim
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl shadow-xl p-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">🏆 #1</div>
                    <div className="text-xs opacity-90">
                      Contract Manufacturer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                🎯 Kurumsal Kimliğimiz
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-primary">Misyon</span> &{" "}
                <span className="text-blue-600">Vizyonumuz</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Türkiye'nin contract manufacturing sektöründe liderlik
                hedefimizi belirleyen temel değerler ve gelecek vizyonumuz
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Misyon */}
              <Card className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="p-8 pb-4 relative z-10">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-primary">
                        Misyonumuz
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ne için varız?
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 relative z-10">
                  <CardDescription className="text-lg leading-relaxed text-foreground">
                    <strong className="text-primary">
                      Contract manufacturing sektöründe
                    </strong>
                    müşterilerimizin ihtiyaçlarına özel{" "}
                    <strong>360° entegre çözümler</strong> geliştirerek,
                    <strong>ISO sertifikalı kalitede üretim</strong>, güvenilir
                    tedarik zinciri ve
                    <strong>etkili operasyon yönetimi</strong> hizmetleri
                    sunmak.
                    <br />
                    <br />
                    Tek çatı altında <strong>
                      bütünleşik hizmet anlayışı
                    </strong>{" "}
                    ile müşteri memnuniyetini en üst düzeyde tutarak,
                    markalarının <strong>sürdürülebilir büyümesi</strong> için
                    yenilikçi teknolojiler ve çözümler geliştirmek.
                  </CardDescription>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        10.600m² ISO sertifikalı üretim tesisleri
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Aylık 3+ milyon ünite üretim kapasitesi
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        360° entegre çözüm: Üretim → Pazarlama
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vizyon */}
              <Card className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="p-8 pb-4 relative z-10">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-blue-600">
                        Vizyonumuz
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nereye gidiyoruz?
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 relative z-10">
                  <CardDescription className="text-lg leading-relaxed text-foreground">
                    <strong className="text-blue-600">2030 yılına kadar</strong>{" "}
                    Türkiye'nin
                    <strong>#1 contract manufacturing lideri</strong> ve
                    <strong>Avrupa'nın önde gelen</strong> entegre üretim
                    çözümleri şirketi olmak.
                    <br />
                    <br />
                    Sürekli <strong>inovasyon, teknolojik yatırım</strong> ve
                    sürdürülebilir büyüme ile
                    <strong>uluslararası pazarlarda</strong> güvenilir marka
                    olarak tanınmak ve
                    <strong>endüstri standartlarını belirleyen</strong> konuma
                    ulaşmak.
                  </CardDescription>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Global pazarda tanınan Turkish quality
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Avrupa ve Orta Doğu'da pazar liderliği
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Sektör standartlarını belirleyen inovasyon
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alt kısımda hedefler */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-8">🚀 2030 Hedeflerimiz</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-card/60 rounded-2xl p-6 border hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-primary mb-2">
                    500+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Global Marka Ortağı
                  </div>
                </div>
                <div className="bg-card/60 rounded-2xl p-6 border hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    50M+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Aylık Üretim Kapasitesi
                  </div>
                </div>
                <div className="bg-card/60 rounded-2xl p-6 border hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    15+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ülkeye İhracat
                  </div>
                </div>
                <div className="bg-card/60 rounded-2xl p-6 border hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    100K+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    m² Toplam Tesis Alanı
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Faaliyet Alanları */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                🏭 360° Hizmet Portföyümüz
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Tek Çatı Altında{" "}
                <span className="text-primary">Entegre Çözümler</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Contract manufacturing'den dijital pazarlamaya, ambalaj
                çözümlerinden e-ticaret operasyonlarına kadar markanızın ihtiyaç
                duyduğu
                <strong> tüm hizmetleri tek noktadan</strong> sunuyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {serviceAreas.map((service, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 bg-card shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <CardHeader className="p-8 relative z-10">
                    <div className="flex items-start gap-6">
                      <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {React.cloneElement(service.icon, {
                          className: "h-8 w-8 text-white",
                        })}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {service.title}
                        </CardTitle>
                        <p className="text-muted-foreground text-base leading-relaxed mb-6">
                          {service.description}
                        </p>

                        {/* Service highlights based on type */}
                        <div className="space-y-2 mb-6">
                          {service.title.includes("Ambalaj") && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>5000+ premium ambalaj seçeneği</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Custom tasarım ve özel üretim</span>
                              </div>
                            </>
                          )}

                          {service.title.includes("Fason") && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>10.600m² ISO sertifikalı tesisler</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Aylık 3+ milyon ünite kapasite</span>
                              </div>
                            </>
                          )}

                          {service.title.includes("Depo") && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>WMS entegrasyonu ve 3PL hizmeti</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Aylık 50K+ sipariş fulfillment</span>
                              </div>
                            </>
                          )}

                          {service.title.includes("Pazarlama") && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>
                                  Sosyal medya ve influencer kampanyaları
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>E-ticaret optimizasyon uzmanı</span>
                              </div>
                            </>
                          )}
                        </div>

                        <Link
                          href={service.link}
                          className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors group-hover:translate-x-1 duration-300"
                        >
                          Detaylı Bilgi Alın
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Alt kısım CTA */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl p-8 max-w-4xl mx-auto border">
                <h3 className="text-2xl font-bold mb-4">
                  🤝 Hangi Hizmete İhtiyacınız Var?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Uzman ekibimiz size en uygun çözümü belirlemek için
                  <strong> ücretsiz danışmanlık</strong> hizmeti sunuyor.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/iletisim">
                      <Phone className="mr-2 h-4 w-4" />
                      Ücretsiz Danışmanlık
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover:bg-primary/10 dark:hover:bg-primary/20"
                    asChild
                  >
                    <Link href="/teklif">
                      <Mail className="mr-2 h-4 w-4" />
                      Hızlı Teklif Al
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kurumsal Değerler */}
        <section className="py-24 bg-gradient-to-br from-muted/30 via-background to-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                💎 Değerlerimiz
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Contract Manufacturing'de
                <span className="text-primary block">
                  Değer Yaratan İlkelerimiz
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                <strong>6+ yıllık sektör deneyimimiz</strong> ve{" "}
                <strong>1000+ başarılı projemizde</strong>
                bizi yönlendiren temel değerler ve iş yapış prensiplerimiz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-start space-x-6">
                      <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        {React.cloneElement(value.icon, {
                          className: "h-6 w-6 text-white",
                        })}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {value.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {value.description}
                        </p>

                        {/* Value-specific metrics or highlights */}
                        <div className="mt-4 pt-4 border-t border-muted/30">
                          {value.title.includes("Kalite") && (
                            <div className="flex items-center gap-2 text-xs text-primary font-medium">
                              <CheckCircle className="h-3 w-3" />
                              <span>ISO 22716 GMP Sertifikalı</span>
                            </div>
                          )}
                          {value.title.includes("Güvenilirlik") && (
                            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                              <Shield className="h-3 w-3" />
                              <span>200+ Marka Ortağının Tercihi</span>
                            </div>
                          )}
                          {value.title.includes("Sürdürülebilirlik") && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                              <Leaf className="h-3 w-3" />
                              <span>ISO 14001 Çevre Sertifikalı</span>
                            </div>
                          )}
                          {value.title.includes("Müşteri") && (
                            <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                              <Heart className="h-3 w-3" />
                              <span>4.9/5 Müşteri Memnuniyet Puanı</span>
                            </div>
                          )}
                          {value.title.includes("İnovasyon") && (
                            <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                              <Zap className="h-3 w-3" />
                              <span>Ar-Ge Merkezi Sanayi Bakanlığı Onaylı</span>
                            </div>
                          )}
                          {value.title.includes("Hız") && (
                            <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
                              <Clock className="h-3 w-3" />
                              <span>7 Gün Hızlı Numune Geliştirme</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Alt kısım güven unsurları */}
            <div className="mt-16">
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl p-8 max-w-5xl mx-auto border">
                <h3 className="text-2xl font-bold text-center mb-8">
                  🏆 Değerlerimizin Somut Yansımaları
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      99.8%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Kalite Standartları
                      <br />
                      Uyumluluk Oranı
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      98%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Zamanında Teslimat
                      <br />
                      Başarı Oranı
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      4.9/5
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Müşteri Memnuniyeti
                      <br />
                      Puanımız
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      0%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Çevre İhlali
                      <br />
                      Kaydımız
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ekibimiz */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                👥 Uzman Ekibimiz
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-primary">50+ Uzman</span> ile
                <br className="hidden lg:block" />
                Contract Manufacturing Excellence
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Kimya mühendisleri, endüstri uzmanları, kalite kontrol
                profesyonelleri ve operasyon uzmanlarından oluşan{" "}
                <strong>deneyimli kadromuz</strong> ile müşterilerimize en
                kaliteli hizmeti sunuyoruz.
              </p>
            </div>

            {/* Liderlik Ekibi */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-center mb-12">
                🎯 Liderlik Ekibimiz
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                {team.map((member, index) => (
                  <Card
                    key={index}
                    className="group text-center border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
                  >
                    <CardContent className="p-8">
                      <div className="mb-6 rounded-2xl overflow-hidden w-32 h-32 mx-auto border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-muted-foreground text-sm font-medium">
                        {member.position}
                      </p>

                      {/* Position-specific highlights */}
                      <div className="mt-4 pt-4 border-t border-muted/30">
                        {member.position.includes("CEO") && (
                          <div className="flex items-center justify-center gap-2 text-xs text-primary">
                            <Award className="h-3 w-3" />
                            <span>15+ Yıl Sektör Deneyimi</span>
                          </div>
                        )}
                        {member.position.includes("Operasyon") && (
                          <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
                            <Settings className="h-3 w-3" />
                            <span>Operasyon Mükemmelliği</span>
                          </div>
                        )}
                        {member.position.includes("Üretim") && (
                          <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                            <Factory className="h-3 w-3" />
                            <span>10.600m² Tesis Yönetimi</span>
                          </div>
                        )}
                        {member.position.includes("Ar-Ge") && (
                          <div className="flex items-center justify-center gap-2 text-xs text-purple-600">
                            <Lightbulb className="h-3 w-3" />
                            <span>1000+ Formülasyon</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Ekip İstatistikleri */}
            <div className="mb-16">
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl p-8 max-w-6xl mx-auto border">
                <h3 className="text-2xl font-bold text-center mb-8">
                  📊 Ekibimizin Uzmanlık Alanları
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      15+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Kimya & Endüstri
                      <br />
                      Mühendisi
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      12+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Kalite Kontrol
                      <br />
                      Uzmanı
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      10+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Operasyon &<br />
                      Lojistik Uzmanı
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      8+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pazarlama &<br />
                      Satış Profesyoneli
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ekip Açıklaması ve CTA */}
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                <strong>50+ uzman çalışanımız</strong> arasında kimya
                mühendisleri, endüstri mühendisleri, kalite uzmanları, pazarlama
                profesyonelleri ve lojistik uzmanları bulunmaktadır. Her biri
                kendi alanında
                <strong> en az 5 yıllık deneyime</strong> sahip olan ekibimiz,
                müşterilerimize{" "}
                <strong>contract manufacturing mükemmelliği</strong> sunmak için
                sürekli eğitimlerle kendini geliştirmektedir.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/iletisim">
                    <Users className="mr-2 h-4 w-4" />
                    Ekibimizle Tanışın
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="hover:bg-primary/10 dark:hover:bg-primary/20"
                  asChild
                >
                  <Link href="/iletisim">
                    <Handshake className="mr-2 h-4 w-4" />
                    Ekibimize Katılın
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 bg-gradient-to-br from-muted/30 via-background to-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                📈 Büyüme Hikayemiz
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Contract Manufacturing
                <span className="text-primary block">
                  Liderliğine Giden Yol
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                2019'dan bugüne,{" "}
                <strong>küçük bir ambalaj tedarikçisinden</strong>
                Türkiye'nin en büyük contract manufacturing şirketine dönüşüm
                hikayemiz
              </p>
            </div>

            <div className="max-w-5xl mx-auto relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-blue-500 to-green-500 hidden lg:block"></div>

              <div className="space-y-16">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex items-start space-x-8 group"
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">
                          {item.year.slice(-2)}
                        </span>
                      </div>
                      {/* Connecting line for mobile */}
                      {index < timeline.length - 1 && (
                        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-primary/50 to-transparent lg:hidden"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Card className="bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 border-0 group-hover:-translate-y-1">
                        <CardContent className="p-8">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                            <div>
                              <span className="text-3xl font-bold text-primary mb-2 block">
                                {item.year}
                              </span>
                              <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                            </div>

                            {/* Progress indicators */}
                            <div className="mt-4 lg:mt-0">
                              {item.year === "2019" && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
                                >
                                  🚀 Başlangıç
                                </Badge>
                              )}
                              {item.year === "2021" && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
                                >
                                  📈 Büyüme
                                </Badge>
                              )}
                              {item.year === "2025" && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/10 text-primary border-primary/20"
                                >
                                  👑 Liderlik
                                </Badge>
                              )}
                              {item.year === "2026" && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800"
                                >
                                  🌍 Global
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                            {item.description}
                          </p>

                          {/* Key metrics for major milestones */}
                          {item.year === "2025" && (
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-muted">
                              <div className="text-center">
                                <div className="text-xl font-bold text-primary">
                                  25K m²
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Tesis Alanı
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-green-600">
                                  7M+
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Aylık Kapasite
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-blue-600">
                                  200+
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Marka Ortağı
                                </div>
                              </div>
                            </div>
                          )}

                          {item.year === "2026" && (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-muted">
                              <div className="text-center">
                                <div className="text-xl font-bold text-purple-600">
                                  15+
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  İhracat Ülkesi
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-orange-600">
                                  40%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  İhracat Artışı
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>

              {/* Future vision */}
              <div className="mt-16 text-center">
                <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl p-8 border max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold mb-4">
                    🎯 2030 Vizyonumuz
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    <strong>
                      Avrupa'nın önde gelen contract manufacturing şirketi
                    </strong>{" "}
                    olarak 500+ global marka ortağı ile 50+ milyon ünite aylık
                    üretim kapasitesine ulaşmak.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        500+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Global Marka
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        50M+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Aylık Üretim
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        100K+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        m² Tesis Alanı
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tesisler Banner */}
        <FacilityBanner />

        {/* Certificates */}
        <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                🏆 Kalite Standartları
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-primary">Sertifikalar</span> &{" "}
                <span className="text-green-600">Uyumluluk</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Kalite standartlarımızı belgeleyen uluslararası sertifikalar ve
                uyumluluk belgeleri ile <strong>ISO sertifikalı üretim</strong>{" "}
                güvencesi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {certificates.map((cert, index) => (
                <Card
                  key={index}
                  className="group border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <CardContent className="p-8 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-green-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                      {cert.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-foreground group-hover:text-primary transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {cert.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Alt kısım güven unsurları */}
            <div className="mt-16">
              <div className="bg-gradient-to-r from-green-500/10 to-primary/10 rounded-3xl p-8 max-w-5xl mx-auto border">
                <h3 className="text-2xl font-bold text-center mb-8">
                  ✅ Kalite Güvencemiz
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ISO 22716
                    </div>
                    <div className="text-sm text-muted-foreground">
                      GMP Kozmetik
                      <br />
                      Standartları
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ISO 9001
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Kalite Yönetim
                      <br />
                      Sistemi
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      HALAL
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Sertifikalı
                      <br />
                      Üretim
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      FDA
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Onaylı
                      <br />
                      Tesisler
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Referanslar */}
        <section className="py-24 bg-gradient-to-br from-muted/20 via-background to-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                🤝 İş Ortaklarımız
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-primary">200+</span> Güvenilir
                <br className="hidden lg:block" />
                <span className="text-blue-600">Marka Ortağı</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Sektörün önde gelen markaları tarafından tercih edilen üretim ve
                operasyon çözümleri ile{" "}
                <strong>contract manufacturing mükemmelliği</strong>
              </p>
            </div>

            {/* Referans logoları */}
            <div className="relative">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center max-w-6xl mx-auto">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <Card
                    key={index}
                    className="group border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg"
                  >
                    <CardContent className="p-6 flex items-center justify-center">
                      <Image
                        src={`/corporate-logo-${index}.png`}
                        alt={`Referans Firma ${index}`}
                        width={120}
                        height={60}
                        className="opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* İstatistikler */}
            <div className="mt-16">
              <div className="bg-gradient-to-r from-blue-500/10 to-primary/10 rounded-3xl p-8 max-w-5xl mx-auto border">
                <h3 className="text-2xl font-bold text-center mb-8">
                  📊 Referans Portföyümüz
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      200+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Marka Ortağı
                      <br />
                      Güveni
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      15+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      İhracat Ülkesi
                      <br />
                      Deneyimi
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      1000+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Başarılı Proje
                      <br />
                      Teslimi
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      6+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Yıllık Deneyim
                      <br />
                      Birikimi
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Açıklama */}
            <div className="text-center mt-12">
              <Card className="bg-card/80 backdrop-blur-sm border-0 max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Ulusal ve uluslararası{" "}
                    <strong>200'den fazla markanın</strong> üretim ve operasyon
                    süreçlerinde tercih ettiği{" "}
                    <strong>güvenilir iş ortağıyız</strong>.
                    <br className="hidden sm:block" />
                    <span className="text-sm mt-4 block opacity-75">
                      Gizlilik anlaşmaları nedeniyle bazı markalar burada
                      listelenmemiştir.
                    </span>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      className="hover:bg-primary/10 dark:hover:bg-primary/20"
                      asChild
                    >
                      <Link href="/iletisim">
                        <Handshake className="mr-2 h-4 w-4" />
                        İş Ortağı Olun
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="hover:bg-primary/10 dark:hover:bg-primary/20"
                      asChild
                    >
                      <Link href="/fason-uretim">
                        <Building2 className="mr-2 h-4 w-4" />
                        Üretim Hizmetleri
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge
                  variant="outline"
                  className="mb-8 text-primary border-primary text-sm px-4 py-2"
                >
                  🤝 İş Ortaklığı
                </Badge>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  <span className="text-primary">Markanızı</span> Birlikte
                  <br className="hidden lg:block" />
                  <span className="text-blue-600">Büyütelim</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Üretimden pazarlamaya, ambalajdan depolamaya{" "}
                  <strong>tüm ihtiyaçlarınız için uzman ekibimizle</strong>{" "}
                  iletişime geçin ve işinizi bir sonraki seviyeye taşıyacak{" "}
                  <strong>360° entegre çözümlerimizi</strong> keşfedin.
                </p>
              </div>

              {/* Ana CTA Kartları */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* İletişim Kartı */}
                <Card className="group border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                          Hemen İletişime Geçin
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Ücretsiz danışmanlık için
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Projeniz için özel çözüm önerileri ve detaylı fiyat
                      teklifi almak için uzman ekibimizle görüşün.
                    </p>
                    <Button size="lg" className="w-full" asChild>
                      <Link href="/iletisim">
                        <Mail className="mr-2 h-4 w-4" />
                        İletişim Formu
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Telefon Kartı */}
                <Card className="group border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg">
                        <Phone className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-green-600 group-hover:text-green-500 transition-colors">
                          Hemen Arayın
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          7/24 destek hattımız
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Acil durumlar ve hızlı çözüm gerektiren projeler için
                      doğrudan telefon desteği.
                    </p>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white"
                      asChild
                    >
                      <Link href="tel:+905314942594">
                        <Phone className="mr-2 h-4 w-4" />
                        Şimdi Ara
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Hizmet Garantileri */}
              <div className="bg-gradient-to-r from-blue-500/10 to-primary/10 rounded-3xl p-8 border">
                <h3 className="text-2xl font-bold text-center mb-8">
                  ✅ Size Özel Hizmet Garantilerimiz
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-xl font-bold text-primary mb-2">
                      Ücretsiz
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Danışmanlık Hizmeti
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Proje analizi ve strateji önerileri
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-xl font-bold text-green-600 mb-2">
                      24 Saat
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Hızlı Geri Dönüş
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tüm taleplerinize yanıt garantisi
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                      <Settings className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-xl font-bold text-blue-600 mb-2">
                      Özel
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Çözüm Tasarımı
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Markanıza özel entegre sistemler
                    </div>
                  </div>
                </div>
              </div>

              {/* İlave Aksiyonlar */}
              <div className="text-center mt-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover:bg-primary/10 dark:hover:bg-primary/20"
                    asChild
                  >
                    <Link href="/tesisler">
                      <Building2 className="mr-2 h-4 w-4" />
                      Tesisleri Gezin
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover:bg-primary/10 dark:hover:bg-primary/20"
                    asChild
                  >
                    <Link href="/fason-uretim">
                      <Eye className="mr-2 h-4 w-4" />
                      Üretim Hizmetleri
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover:bg-primary/10 dark:hover:bg-primary/20"
                    asChild
                  >
                    <Link href="/teklif">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Hızlı Teklif Al
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
