import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Droplets,
  Sparkles,
  Factory,
  ShieldCheck,
  Award,
  Zap,
  Users,
  Globe,
  MapPin,
  Phone,
  Building,
  Target,
  TrendingUp,
  Package,
  Layers,
  Beaker,
  Microscope,
  ClipboardCheck,
  Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title:
    "Doğukan Kimya Sanayi ve Ticaret A.Ş | Fomex Markası Temizlik Ürünleri ve Islak Mendil Üretim Tesisi | İstanbul",
  description:
    "🧽 Doğukan Kimya: İstanbul Beylikdüzü'nde 5000m² ISO ve GMP sertifikalı tesisimizde köpük sabun, ıslak mendil, kozmetik, temizlik ürünleri, dezenfektan ve antibakteriyel ürün üretimi. FDA ve EPA onaylı üretim, Fomex markası, biyosidal ürünler.",
  keywords: [
    // Şirket ismi ve marka
    "Doğukan Kimya",
    "Doğukan Kimya Sanayi ve Ticaret A.Ş",
    "dogukankimya",
    "dogukan kimya",
    "Fomex",
    "Fomex markası",
    "fomex.com.tr",

    // Üretim alanları
    "islak mendil üretimi",
    "köpük sabun üretimi",
    "temizlik ürünleri üretimi",
    "kozmetik üretimi",
    "kişisel bakım ürünleri",
    "dezenfektan üretimi",
    "antibakteriyel ürün üretimi",
    "biyosidal ürün üretimi",
    "yüzey temizlik havlusu",
    "proteco havlusu",

    // Ürün kategorileri
    "Fomex köpük sabun",
    "Cyber köpük sabun",
    "antibakteriyel köpük sabun",
    "pH 5.5 köpük sabun",
    "köpük sabun dispenseri",
    "islak mendil 120 li",
    "islak mendil 72 li",
    "Karamish baby islak mendil",
    "yüzey temizlik havlusu",

    // Lokasyon ve tesis
    "İstanbul kimya tesisi",
    "Beylikdüzü kimya fabrikası",
    "Haramidere Sanayi Sitesi",
    "5000 m² tesis",
    "kapalı üretim tesisi",

    // Sertifikalar ve standartlar
    "ISO sertifikalı üretim",
    "GMP standartları",
    "FDA onaylı üretim",
    "EPA onaylı",
    "CE sertifikası",
    "kalite güvencesi",

    // Hizmet türleri
    "fason üretim",
    "private label üretim",
    "özel marka üretimi",
    "contract manufacturing",
    "kimya fason üretim",
    "temizlik ürünü fason üretim",

    // Pazarlama alanları
    "toptan satış",
    "perakende satış",
    "e-ticaret",
    "online satış",
    "kapıda ödeme",
    "kredi kartı ile ödeme",

    // Rekabet avantajları
    "orijinal ürünler",
    "güvenli alışveriş",
    "ücretsiz iade",
    "havale EFT",
    "whatsapp satış",
    "hızlı teslimat",
  ],
  alternates: {
    canonical: "https://www.mkngroup.com.tr/tesisler/dogukan-kimya",
  },
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
  openGraph: {
    title:
      "Doğukan Kimya | Fomex Markası ISO Sertifikalı Temizlik Ürünleri ve Islak Mendil Üretim Tesisi",
    description:
      "🧽 5000m² ISO ve GMP sertifikalı tesisimizde köpük sabun, ıslak mendil, temizlik ürünleri fason üretimi. İstanbul.",
    url: "https://www.mkngroup.com.tr/tesisler/dogukan-kimya",
    siteName: "MKN GROUP",
    images: [
      {
        url: "https://www.mkngroup.com.tr/optimized/modern-chemical-manufacturing-facility-with-large-.webp",
        width: 1200,
        height: 630,
        alt: "Doğukan Kimya ISO Sertifikalı Modern Temizlik Ürünleri Üretim Tesisi - İstanbul",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup_x",
    creator: "@dogukankimya",
    title:
      "Doğukan Kimya | ISO Sertifikalı Temizlik Ürünleri ve Islak Mendil Üretim Tesisi",
    description:
      "🧽 5000m² ISO sertifikalı tesisimizde köpük sabun, ıslak mendil, temizlik ürünleri fason üretimi. İstanbul.",
    images: [
      "https://www.mkngroup.com.tr/optimized/modern-chemical-manufacturing-facility-with-large-.webp",
    ],
  },
};

export default function DogukanKimyaPage() {
  // Structured Data for Doğukan Kimya
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "Manufacturer"],
    name: "Doğukan Kimya Sanayi ve Ticaret A.Ş",
    alternateName: ["Doğukan Kimya", "DogukanKimya", "Fomex"],
    description:
      "ISO ve GMP sertifikalı ıslak mendil, köpük sabun, temizlik ürünleri, kozmetik ve biyosidal ürün üretim tesisi",
    url: "https://www.fomex.com.tr",
    sameAs: [
      "https://www.mkngroup.com.tr/tesisler/dogukan-kimya",
      "https://www.fomex.com.tr",
      "https://dogukankimya.com",
    ],
    logo: "https://www.fomex.com.tr/wp-content/uploads/elementor/thumbs/fomex_weeeb-qp1idm3qsgj1gujb5ytix52xekr1ru0fsjsy611w90.png",
    foundingDate: "2020",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Haramidere Sanayi Sitesi B Blok No:107",
      addressLocality: "Beylikdüzü",
      addressRegion: "İstanbul",
      addressCountry: "Turkey",
      postalCode: "34524",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+90 212 422 42 77",
      email: "info@fomex.com.tr",
      contactType: "Customer Service",
      areaServed: "TR",
      availableLanguage: ["Turkish", "English"],
    },
    makesOffer: {
      "@type": "OfferCatalog",
      name: "Fason Üretim Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Islak Mendil Fason Üretimi",
            description:
              "Baby, yetişkin ve yüzey temizlik ıslak mendil üretimi",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Köpük Sabun Fason Üretimi",
            description:
              "Antibakteriyel, pH 5.5 ve standart köpük sabun üretimi",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Temizlik Ürünleri Fason Üretimi",
            description: "Dezenfektan, biyosidal ve temizlik ürünleri üretimi",
          },
        },
      ],
    },
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "ISO Kalite Yönetim Sistemi",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "GMP İyi Üretim Uygulamaları",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "FDA Onaylı Üretim",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "EPA Onaylı Üretim",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "300",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const companyStats = [
    {
      number: "5000m²",
      label: "Kapalı Üretim Tesisi",
      icon: Building,
      description: "Modern teknoloji ile donatılmış tesis",
    },
    {
      number: "800K+",
      label: "Aylık Islak Mendil Kapasitesi",
      icon: Package,
      description: "Yüksek kapasiteli üretim hatları",
    },
    {
      number: "400K+",
      label: "Aylık Köpük Sabun Kapasitesi",
      icon: Droplets,
      description: "Çeşitli formülasyonlarda üretim",
    },
    {
      number: "150+",
      label: "Başarılı Fason Üretim Projesi",
      icon: Award,
      description: "Kanıtlanmış başarı hikayesi",
    },
  ];

  const productionAreas = [
    {
      title: "Islak Mendil Fason Üretimi",
      description:
        "Baby, yetişkin ve yüzey temizlik ıslak mendillerinin profesyonel üretimi",
      products: [
        "Baby Islak Mendil (72-120 yaprak)",
        "Yetişkin Islak Mendil",
        "Antibakteriyel Islak Mendil",
        "Yüzey Temizlik Havlusu",
        "Proteco Yüzey Temizlik Havlusu",
        "Özel Formülasyon Islak Mendil",
        "Private Label Islak Mendil Üretimi",
      ],
      icon: Layers,
      capacity: "800K+ aylık mendil ünitesi",
      certifications: ["ISO", "FDA Onaylı", "EPA Onaylı", "CE Sertifikalı"],
    },
    {
      title: "Köpük Sabun Fason Üretimi",
      description:
        "Antibakteriyel, pH 5.5 ve standart köpük sabunların çeşitli kapasitelerde üretimi",
      products: [
        "F113 Antibakteriyel Köpük Sabun (1000ml)",
        "F116 Standart Köpük Sabun (1000ml)",
        "F303 pH 5.5 Köpük Sabun (500ml)",
        "Cyber Köpük Sabun Serisi",
        "Köpük Sabun Dispenserleri",
        "Özel Marka Köpük Sabun",
        "Toplu Satış Köpük Sabun Paketleri",
      ],
      icon: Droplets,
      capacity: "400K+ aylık köpük sabun ünitesi",
      certifications: [
        "GMP",
        "ISO",
        "Dermatologically Tested",
        "Antibakteriyel Test",
      ],
    },
    {
      title: "Kozmetik ve Kişisel Bakım Ürünleri",
      description:
        "Kişisel hijyen ve bakım ürünlerinde uzmanlaşmış üretim hizmetleri",
      products: [
        "Kişisel Bakım Ürünleri",
        "Hijyen Ürünleri",
        "Kozmetik Formülasyonları",
        "Cilt Bakım Ürünleri",
        "Saç Bakım Ürünleri",
        "Organik Kozmetik Ürünler",
        "Özel Marka Kozmetik Geliştirme",
      ],
      icon: Sparkles,
      capacity: "600K+ aylık kozmetik ünitesi",
      certifications: [
        "ISO 22716",
        "Cruelty-Free",
        "Organic Certified",
        "Dermatologically Tested",
      ],
    },
    {
      title: "Temizlik ve Dezenfektan Ürünleri",
      description:
        "Biyosidal ürünler, dezenfektanlar ve endüstriyel temizlik çözümleri",
      products: [
        "Dezenfektan Çözümler",
        "Biyosidal Ürünler",
        "Antibakteriyel Temizleyiciler",
        "Yüzey Dezenfektanları",
        "El Dezenfektanları",
        "Endüstriyel Temizlik Ürünleri",
        "Hastane Tipi Dezenfektanlar",
      ],
      icon: ShieldCheck,
      capacity: "400K+ aylık dezenfektan ünitesi",
      certifications: [
        "EPA Onaylı",
        "Biyosidal Ürün Ruhsatı",
        "Hospital Grade",
        "Virüsidal Test",
      ],
    },
  ];

  const certificates = [
    {
      name: "ISO Kalite Yönetim Sistemi",
      description: "Uluslararası Kalite Standartları",
      authority: "ISO Sertifikasyonu",
      icon: Award,
    },
    {
      name: "GMP İyi Üretim Uygulamaları",
      description: "İyi Üretim Uygulamaları Sertifikası",
      authority: "Sağlık Bakanlığı",
      icon: ShieldCheck,
    },
    {
      name: "FDA Onaylı Üretim",
      description: "Amerika Gıda ve İlaç Dairesi Onayı",
      authority: "US FDA",
      icon: CheckCircle,
    },
    {
      name: "EPA Onaylı Üretim",
      description: "Çevre Koruma Ajansı Onayı",
      authority: "US EPA",
      icon: Recycle,
    },
    {
      name: "CE Sertifikası",
      description: "Avrupa Uygunluk Beyanı",
      authority: "European Union",
      icon: Target,
    },
  ];

  const productCapabilities = [
    {
      category: "Islak Mendil Çeşitleri",
      items: [
        "Baby Islak Mendil 72 Li",
        "Baby Islak Mendil 120 Li",
        "Yetişkin Islak Mendil",
        "Antibakteriyel Mendil",
      ],
    },
    {
      category: "Köpük Sabun Formülleri",
      items: [
        "Antibakteriyel Köpük Sabun",
        "pH 5.5 Köpük Sabun",
        "Standart Köpük Sabun",
        "Organik Köpük Sabun",
      ],
    },
    {
      category: "Temizlik Havluları",
      items: [
        "Yüzey Temizlik Havlusu",
        "Proteco Havlusu",
        "Endüstriyel Havlular",
        "Özel Boyut Havlular",
      ],
    },
    {
      category: "Dispenserler",
      items: [
        "1000ml Köpük Sabun Dispenseri",
        "500ml Köpük Sabun Dispenseri",
        "Otomatik Dispenserler",
        "Manuel Dispenserler",
      ],
    },
    {
      category: "Dezenfektanlar",
      items: [
        "El Dezenfektanları",
        "Yüzey Dezenfektanları",
        "Biyosidal Ürünler",
        "Hastane Tipi Dezenfektanlar",
      ],
    },
    {
      category: "Özel Üretimler",
      items: [
        "Private Label Üretim",
        "Özel Formülasyon",
        "Özel Ambalaj Tasarımı",
        "Toplu Satış Paketleri",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800/50 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.3),transparent_50%)]"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge className="mb-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 border-blue-200 dark:border-blue-700">
                <Factory className="h-4 w-4 mr-2" />
                ISO ve GMP Sertifikalı Üretim Tesisi
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-6 text-balance leading-tight">
                Doğukan Kimya Sanayi ve Ticaret A.Ş
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 text-pretty leading-relaxed">
                <strong>İstanbul Beylikdüzü'nde 5000m² alanda</strong> faaliyet
                gösteren,
                <strong>ISO ve GMP sertifikalı</strong> modern tesisimizde
                <strong>ıslak mendil</strong>, <strong>köpük sabun</strong>,
                <strong>temizlik ürünleri</strong> ve{" "}
                <strong>kozmetik fason üretimi</strong> yapıyoruz.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    5000m² Modern Tesis
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    FDA & EPA Onaylı
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fomex Markası
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    200+ Başarılı Proje
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 dark:from-blue-500 dark:to-green-500 dark:hover:from-blue-600 dark:hover:to-green-600 text-white px-8 py-3"
                >
                  <Link
                    href="/teklif?facility=dogukan-kimya&service=fason-uretim"
                    className="flex items-center"
                  >
                    Fason Üretim Teklifi Alın
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-slate-800"
                >
                  <Link
                    href="https://www.fomex.com.tr"
                    target="_blank"
                    rel="noopener"
                  >
                    Fomex Mağaza
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="aspect-square rounded-xl overflow-hidden shadow-2xl dark:shadow-slate-800/50 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30">
                <Image
                  src="/optimized/modern-chemical-manufacturing-facility-with-large-.webp"
                  alt="Doğukan Kimya ISO Sertifikalı Modern Üretim Tesisi - İstanbul Beylikdüzü"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 dark:from-slate-900/90 to-transparent p-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-500 dark:bg-blue-600 text-white">
                      ISO Sertifikalı
                    </Badge>
                    <Badge className="bg-green-500 dark:bg-green-600 text-white">
                      FDA Onaylı
                    </Badge>
                    <Badge className="bg-purple-500 dark:bg-purple-600 text-white">
                      Fomex Markası
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Statistics */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Doğukan Kimya Fason Üretim Kapasitemiz
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              <strong>Islak mendil, köpük sabun, temizlik ürünleri</strong> ve
              <strong>kozmetik fason üretiminde</strong> Türkiye'nin güvenilir
              çözüm ortağınız
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={index}
                  className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800"
                >
                  <CardHeader className="pb-2">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {stat.number}
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Production Areas */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Doğukan Kimya Kapsamlı Fason Üretim Alanlarımız
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              <strong>
                Islak mendil, köpük sabun, kozmetik ve temizlik ürünlerinde
              </strong>{" "}
              uzmanlaşmış kapsamlı fason üretim hizmetlerimiz ile markanızın tüm
              ihtiyaçlarını karşılıyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {productionAreas.map((area, index) => {
              const IconComponent = area.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-400 dark:to-green-400 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                          {area.title}
                        </CardTitle>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {area.capacity}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                      {area.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Üretim Ürünleri:
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {area.products.map((product, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-3"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {product}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Sertifikalar:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {area.certifications.map((cert, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                          >
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Capabilities */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Doğukan Kimya Ürün Üretim Kapasiteleri
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Markanız için üretebileceğimiz <strong>ıslak mendil</strong>,{" "}
              <strong>köpük sabun</strong> ve
              <strong>temizlik ürünü</strong> çeşitlerimizi keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {productCapabilities.map((capability, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                    {capability.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {capability.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certificates and Standards */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Doğukan Kimya Sertifikalar ve Kalite Standartları
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              <strong>Uluslararası kalite standartlarına</strong> uygun üretim
              yapan tesisimizin sahip olduğu sertifikalar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
            {certificates.map((cert, index) => {
              const IconComponent = cert.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900"
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                      {cert.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {cert.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                    >
                      {cert.authority}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* R&D and Innovation */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Doğukan Kimya Ar-Ge ve Kalite Kontrol Laboratuvarı
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                <strong>Deneyimli kimyager kadromuzla</strong>, müşterilerimizin
                özel ihtiyaçlarına yönelik{" "}
                <strong>formülasyonlar geliştiriyoruz</strong>. Modern
                laboratuvar altyapımızda, ürün geliştirme sürecinin her
                aşamasını titizlikle yürütüyoruz.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Özel formülasyon geliştirme
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Mikrobiyal ve güvenlik testleri
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    pH ve stabilite analizleri
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Antibakteriyel etkinlik testleri
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Beaker className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Özel Formülasyon
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Müşteri ihtiyaçlarına özel ürün geliştirme hizmetleri
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Microscope className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Kalite Testleri
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Kapsamlı laboratuvar analizleri ve güvenlik testleri
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Hızlı Onay
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  FDA ve EPA onayları ile hızlı pazar süreci
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact and Location */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Doğukan Kimya İletişim ve Konum Bilgileri
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <Building className="h-6 w-6 text-blue-600" />
                  Tesis Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Adres
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Haramidere Sanayi Sitesi B Blok No:107
                      <br />
                      Beylikdüzü, İstanbul, Türkiye
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Factory className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Tesis Alanı
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      5000 m² Kapalı Alan
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Website
                    </p>
                    <p className="text-blue-600 dark:text-blue-400">
                      <Link
                        href="https://www.fomex.com.tr"
                        target="_blank"
                        rel="noopener"
                      >
                        fomex.com.tr
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      İletişim
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      +90 212 422 42 77
                      <br />
                      +90 212 422 77 47
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      WhatsApp: +90 543 383 24 33
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                  Fason Üretim Teklifi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Islak mendil</strong>, <strong>köpük sabun</strong> ve
                  <strong>temizlik ürünlerinizin</strong> fason üretimi için
                  detaylı teklif almak üzere bizimle iletişime geçin.
                </p>
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white">
                    <Link
                      href="/teklif?facility=dogukan-kimya"
                      className="flex items-center justify-center w-full"
                    >
                      Fason Üretim Teklifi Al
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Link
                      href="https://www.fomex.com.tr"
                      target="_blank"
                      className="flex items-center justify-center w-full"
                    >
                      Fomex Mağaza Ziyaret Et
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-green-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-green-700/90"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
              Doğukan Kimya ile Fason Üretim Projenizi Başlatın
            </h2>
            <p className="text-xl text-blue-100 mb-8 text-pretty leading-relaxed">
              <strong>ISO ve GMP sertifikalı tesisimizle</strong> ıslak mendil,
              köpük sabun ve temizlik ürünlerinizin{" "}
              <strong>fason üretiminde</strong> güvenilir çözüm ortağınız.
              Ücretsiz danışmanlık ve hızlı teklif için hemen iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link
                  href="/teklif?facility=dogukan-kimya&service=fason-uretim"
                  className="flex items-center"
                  title="Doğukan Kimya Fason Üretim Teklifi Al"
                >
                  Hemen Teklif Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg transition-all duration-300 bg-transparent"
              >
                <Link
                  href="https://www.fomex.com.tr"
                  target="_blank"
                  title="Fomex Resmi Mağaza"
                >
                  Fomex Mağaza Ziyaret Et
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
