import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Factory,
  FlaskConical,
  MapPin,
  Users,
  Award,
  Zap,
  Microscope,
  ShieldCheck,
  Leaf,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title:
    "Üretim Tesislerimiz | ISO Sertifikalı Fason Üretim Tesisleri | MKN GROUP",
  description:
    "🏭 ISO 22716 GMP sertifikalı modern üretim tesislerimiz: 10.600m² toplam üretim alanı. Contract manufacturing, OEM/ODM hizmetleri. Aylık 3.8+ milyon ünite üretim kapasitesi. Türkiye'nin güvenilir fason üretim partneri.",
  keywords: [
    // Ana anahtar kelimeler
    "üretim tesisi türkiye",
    "ISO sertifikalı fason üretim tesisi",
    "GMP sertifikalı kozmetik üretim tesisi",
    "contract manufacturing facility turkey",
    "fason üretim tesisi istanbul",

    // Sektör odaklı
    "kozmetik üretim tesisi",
    "dermokozmetik üretim tesisi",
    "temizlik ürünleri üretim tesisi",
    "gıda takviyesi üretim tesisi",
    "cosmetic manufacturing facility",

    // Hizmetler
    "OEM üretim tesisi",
    "ODM üretim tesisi",
    "private label üretim tesisi",
    "fason üretici",
    "contract manufacturer turkey",

    // Standartlar
    "ISO 22716 tesis",
    "GMP sertifikalı tesis",
    "ISO 9001 üretim tesisi",
    "ISO 14001 çevre dostu tesis",
    "helal sertifikalı üretim",

    // Lokasyon
    "istanbul üretim tesisi",
    "türkiye fason üretim",
    "modern üretim tesisi",
    "teknoloji donanımlı tesis",
    "kalite kontrol laboratuvarı",
  ],
  authors: [{ name: "MKN GROUP", url: "https://www.mkngroup.com.tr" }],
  creator: "MKN GROUP",
  publisher: "MKN GROUP",
  category: "Manufacturing Facilities",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://www.mkngroup.com.tr/tesisler",
    languages: {
      "tr-TR": "https://www.mkngroup.com.tr/tesisler",
      "en-US": "https://www.mkngroup.com.tr/en/facilities",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://www.mkngroup.com.tr/tesisler",
    siteName: "MKN GROUP",
    title: "ISO Sertifikalı Üretim Tesislerimiz | MKN GROUP",
    description:
      "🏭 10.600m² toplam alan, ISO 22716 GMP sertifikalı modern üretim tesisleri. Kozmetik, gıda takviyesi ve temizlik ürünleri fason üretimi. Contract manufacturing çözümleri.",
    images: [
      {
        url: "https://www.mkngroup.com.tr/optimized/modern-manufacturing-facility-with-advanced-equipm.webp",
        width: 1200,
        height: 630,
        alt: "MKN GROUP ISO Sertifikalı Modern Üretim Tesisleri",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup_x",
    creator: "@mkngroup_x",
    title: "ISO Sertifikalı Üretim Tesislerimiz | MKN GROUP",
    description:
      "🏭 10.600m² toplam alan, ISO 22716 GMP sertifikalı modern üretim tesisleri. Contract manufacturing ve fason üretim çözümleri.",
    images: [
      "https://www.mkngroup.com.tr/optimized/modern-manufacturing-facility-with-advanced-equipm.webp",
    ],
  },
};

export default function TesislerPage() {
  // Structured Data for Manufacturing Facilities
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MKN GROUP",
    description:
      "ISO sertifikalı üretim tesisleri ile fason üretim, contract manufacturing ve OEM/ODM hizmetleri",
    url: "https://www.mkngroup.com.tr/tesisler",
    logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "İstanbul",
      addressCountry: "Turkey",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Üretim Tesisleri ve Manufacturing Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Kozmetik Fason Üretim",
            description:
              "ISO 22716 GMP sertifikalı kozmetik ve dermokozmetik ürün üretimi",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Temizlik Ürünleri Fason Üretim",
            description: "ISO 14001 çevre dostu temizlik ürünleri üretimi",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Contract Manufacturing",
            description: "OEM/ODM ve private label üretim hizmetleri",
          },
        },
      ],
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+90 531 494 25 94",
      contactType: "Customer Service",
      areaServed: "TR",
      availableLanguage: ["Turkish", "English"],
    },
  };

  const facilities = [
    {
      slug: "aspar-ilac",
      name: "Aspar İlaç Kozmetik Gıda Sanayi A.Ş",
      description:
        "ISO 22716 GMP standardında dermokozmetik ürünler ve gıda takviyeleri üretiminde uzmanlaşmış, 5.600m² kapalı alana sahip teknoloji donanımlı üretim tesisi. Günlük 50.000 ünite üretim kapasitesi ile contract manufacturing hizmetleri.",
      features: [
        "Dermokozmetik Contract Manufacturing",
        "Gıda Takviyesi OEM/ODM Üretim",
        "ISO 22716 GMP Sertifikalı Tesis",
        "Ar-Ge ve Formülasyon Laboratuvarı",
        "Private Label Üretim Hizmetleri",
        "Helal Sertifikalı Üretim",
      ],
      capacity: "Aylık 2 Milyon Ünite",
      dailyCapacity: "Günlük 65.000 Ünite",
      area: "5.600 m² Kapalı Alan",
      location: "İstanbul, Türkiye",
      image:
        "/optimized/modern-pharmaceutical-manufacturing-facility-with-.webp",
      icon: FlaskConical,
      specialties: [
        "Krem & Serum Üretimi",
        "Şampuan & Saç Bakım Ürünleri",
        "Kapsül & Tablet Üretimi",
        "Sıvı Formlar ve İçecekler",
        "Dermokozmetik Ürünler",
        "Gıda Takviyesi Üretimi",
      ],
      certifications: [
        "ISO 22716 Kozmetik GMP",
        "ISO 9001:2015 Kalite Yönetimi",
        "ISO 14001 Çevre Yönetimi",
        "Helal Sertifikası",
        "HACCP Gıda Güvenliği",
        "TSE Uygunluk Belgesi",
      ],
      technologies: [
        "Yüksek Hızlı Otomatik Dolum Hatları",
        "Steril Üretim Alanları (Clean Room)",
        "QC/QA Kalite Kontrol Laboratuvarı",
        "Stabilite Test Odaları",
        "Mikrobiyal Analiz Ünitesi",
        "Formülasyon Geliştirme R&D",
      ],
      productTypes: [
        "Kozmetik Kremler ve Losyonlar",
        "Serumlar ve Esanslar",
        "Şampuan ve Saç Bakım",
        "Yüz ve Vücut Bakım",
        "Vitamin ve Mineral Takviyeleri",
        "Probiyotik Ürünler",
      ],
      qualityFeatures: [
        "24/7 Kalite Kontrol",
        "Batch to Batch Tutarlılık",
        "Uluslararası Standartlara Uygunluk",
        "Tam Traceability Sistemi",
        "Mikrobiyal Güvenlik Testleri",
        "Stabilite ve Raf Ömrü Testleri",
      ],
    },
    {
      slug: "dogukan-kimya",
      name: "DOĞUKAN KİMYA TEKSTİL GIDA AMBALAJ SAN. VE TİC. LTD. ŞTİ.",
      description:
        "ISO 14001 çevre dostu sertifikalı 5000 m² kapalı alana sahip temizlik ürünleri, mendil ve çamaşır suyu üretiminde yüksek kapasiteli modern üretim tesisi. Günlük 200.000 ünite üretim kapasitesi ile endüstriyel boyutta fason üretim hizmetleri.",
      features: [
        "Temizlik Ürünleri Contract Manufacturing",
        "Çevre Dostu Üretim Teknolojileri",
        "Yüksek Hacimli Üretim Kapasitesi",
        "ISO 14001 Çevre Yönetim Sistemi",
        "Otomatik Üretim Hatları",
        "Private Label Deterjan Üretimi",
      ],
      capacity: "Aylık 1.8 Milyon Ünite",
      dailyCapacity: "Günlük 60.000 Ünite",
      area: "5000  m² Kapalı Alan",
      location: "İstanbul, Türkiye",
      image:
        "/optimized/modern-chemical-manufacturing-facility-with-large-.webp",
      icon: Factory,
      specialties: [
        "Sıvı Sabun Üretimi",
        "Yüzey Temizleyici Üretimi",
        "Çamaşır Deterjanı Üretimi",
        "Dezenfektan Üretimi",
        "Endüstriyel Temizlik Ürünleri",
        "Islak Mendil Üretimi",
      ],
      certifications: [
        "ISO 9001:2015 Kalite Yönetimi",
        "ISO 14001:2015 Çevre Yönetimi",
        "TSE Uygunluk Belgesi",
        "Çevre Dostu Üretim Sertifikası",
        "REACH Uyumluluk",
        "CE Marking",
      ],
      technologies: [
        "Otomatik Karıştırma ve Homojenizasyon",
        "Yüksek Hacimli Sıvı Dolum Hatları",
        "Kalite Kontrol Analiz Merkezi",
        "Otomatik Paketleme ve Etiketleme",
        "Atık Su Arıtma Sistemi",
        "Enerji Verimli Üretim Teknolojisi",
      ],
      productTypes: [
        "Ev Tipi Temizlik Ürünleri",
        "Endüstriyel Temizleyiciler",
        "Çamaşır ve Bulaşık Deterjanları",
        "Dezenfektan ve Antiseptik",
        "Otomotiv Bakım Ürünleri",
        "Islak Mendil ve Hijyen Ürünleri",
      ],
      qualityFeatures: [
        "Çevre Dostu Formülasyonlar",
        "Biyolojik Parçalanabilir İçerik",
        "Ağır Metal İçermeyen Üretim",
        "pH Dengeli Formülasyonlar",
        "Deri Dostu Test Edilmiş",
        "Avrupa Standartlarına Uygun",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100/50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800/50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge className="mb-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                <Factory className="h-4 w-4 mr-2" />
                ISO Sertifikalı Üretim Tesisleri
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-6 text-balance">
                <span className="block sm:hidden">
                  Contract Manufacturing Tesisleri
                </span>
                <span className="hidden sm:block">
                  Türkiye'nin Önde Gelen Contract Manufacturing Tesisleri
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 text-pretty leading-relaxed">
                <strong>10.600m² toplam alan</strong> üzerinde,{" "}
                <strong>ISO 22716 GMP sertifikalı</strong> modern tesislerimizde{" "}
                <strong>fason üretim</strong>,{" "}
                <strong>contract manufacturing</strong> ve
                <strong> OEM/ODM hizmetleri</strong> sunuyoruz.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Aylık 3.8+ Milyon Ünite Kapasite
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ISO 22716 GMP Sertifikalı
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    1000+ Başarılı Proje
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    6+ Yıl Sektör Deneyimi
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-8 py-3"
                >
                  <Link
                    href="/teklif?service=uretim"
                    className="flex items-center"
                  >
                    Ücretsiz Teklif Alın
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                >
                  <Link href="/iletisim?service=uretim">
                    Tesislerimizi Gezin
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative rounded-xl overflow-hidden shadow-2xl dark:shadow-slate-800/50">
              <Image
                src="/optimized/modern-manufacturing-facility-with-advanced-equipm.webp"
                alt="MKN GROUP ISO Sertifikalı Modern Üretim Tesisi - Contract Manufacturing"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 dark:from-slate-900/90 to-transparent p-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-blue-500 dark:bg-blue-600 text-white">
                    ISO 22716 GMP
                  </Badge>
                  <Badge className="bg-green-500 dark:bg-green-600 text-white">
                    Çevre Dostu Üretim
                  </Badge>
                  <Badge className="bg-purple-500 dark:bg-purple-600 text-white">
                    Contract Manufacturing
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Contract Manufacturing Mükemmelliğimiz
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              <span className="font-montserrat font-semibold">MKN GROUP</span>{" "}
              olarak, iki özel{" "}
              <strong>contract manufacturing tesisimizde</strong> farklı
              sektörlere yönelik kapsamlı{" "}
              <strong>fason üretim hizmetleri</strong> sunuyoruz.{" "}
              <strong>ISO sertifikalı</strong>
              kalite standartlarımız, teknoloji odaklı yaklaşımımız ve deneyimli
              ekibimizle, müşterilerimizin ihtiyaçlarına özel{" "}
              <strong>OEM/ODM çözümler</strong> geliştiriyoruz.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  10.600m²
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Toplam Üretim Alanı
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  7M+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Aylık Üretim Kapasitesi
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  500+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Başarılı Proje
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  6+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Yıl Sektör Deneyimi
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Uluslararası Kalite Standartları
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                ISO 22716 GMP, ISO 9001, ISO 14001 ve diğer kalite
                sertifikalarıyla güvence altında{" "}
                <strong>contract manufacturing</strong>
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Yüksek Kapasite Contract Manufacturing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Aylık 3.8+ milyon ünite <strong>fason üretim kapasitesi</strong>{" "}
                ile büyük ölçekli <strong>OEM/ODM projelerine</strong> hazır
                altyapı
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Ar-Ge ve Formülasyon Merkezi
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                İnovatif <strong>private label formülasyonlar</strong> ve özel
                ürün geliştirme hizmetleri ile rekabet avantajı sağlayın
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ISO Sertifikalı Contract Manufacturing Tesislerimiz
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Her biri kendi alanında uzmanlaşmış,{" "}
              <strong>ISO sertifikalı</strong> modern teknoloji ile donatılmış{" "}
              <strong>fason üretim tesislerimiz</strong>.{" "}
              <strong>OEM/ODM</strong> ve
              <strong> private label üretim</strong> hizmetleri için ideal çözüm
              ortağınız.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {facilities.map((facility) => {
              const IconComponent = facility.icon;
              return (
                <Card
                  key={facility.slug}
                  className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white dark:bg-slate-900"
                >
                  <CardHeader className="p-0">
                    <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                      <img
                        src={facility.image}
                        alt={facility.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                        {facility.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-base mb-6 leading-relaxed text-gray-600 dark:text-gray-300">
                      {facility.description}
                    </CardDescription>
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Kapasite:
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {facility.capacity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Konum:
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {facility.location}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Factory className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Alan:
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {facility.area}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Günlük:
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {facility.dailyCapacity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Tabs defaultValue="uretim" className="mb-6">
                      <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4 bg-gray-100 dark:bg-slate-800">
                        <TabsTrigger
                          value="uretim"
                          className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 text-xs"
                        >
                          Üretim Alanları
                        </TabsTrigger>
                        <TabsTrigger
                          value="ozellikler"
                          className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 text-xs"
                        >
                          Özellikler
                        </TabsTrigger>
                        <TabsTrigger
                          value="teknoloji"
                          className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 text-xs"
                        >
                          Teknoloji
                        </TabsTrigger>
                        <TabsTrigger
                          value="kalite"
                          className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 text-xs"
                        >
                          Kalite
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="uretim" className="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {facility.specialties.map((specialty, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {specialty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="ozellikler" className="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {facility.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="teknoloji" className="mt-2">
                        <div className="grid grid-cols-1 gap-2">
                          {facility.technologies.map((tech, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 dark:bg-purple-400 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {tech}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="kalite" className="mt-2">
                        <div className="grid grid-cols-1 gap-2">
                          {facility.qualityFeatures.map((quality, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 dark:bg-orange-400 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {quality}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                        Sertifikalar:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {facility.certifications.map((cert, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" /> {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>{" "}
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white group-hover:shadow-lg transition-all mb-3"
                    >
                      <Link
                        href={`/teklif?facility=${facility.slug}&service=uretim`}
                      >
                        Fason Üretim Teklifi Alın
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Link href={`/tesisler/${facility.slug}`}>
                        Detaylı Tesis Bilgileri
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sektör Odaklı Contract Manufacturing */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Sektör Odaklı Contract Manufacturing Hizmetlerimiz
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              <strong>MKN GROUP</strong> olarak, kozmetik, gıda takviyesi ve
              temizlik ürünleri sektörlerinde uzmanlaşmış{" "}
              <strong>contract manufacturing</strong> çözümleri sunuyoruz.
              <strong>OEM/ODM</strong> üretimden <strong>private label</strong>{" "}
              hizmetlerine kadar her türlü <strong>fason üretim</strong>{" "}
              ihtiyacınızı karşılıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Kozmetik Contract Manufacturing
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  ISO 22716 GMP sertifikalı kozmetik ve dermokozmetik ürün
                  üretimi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Krem, Serum, Lotion Üretimi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Şampuan ve Saç Bakım Ürünleri
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Private Label Kozmetik Üretimi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Formülasyon Geliştirme R&D
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href="/fason-uretim/kozmetik-fason-uretim">
                    Kozmetik Üretim Detayları
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Gıda Takviyesi Fason Üretimi
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  HACCP ve ISO 22000 sertifikalı gıda takviyesi üretimi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Kapsül ve Tablet Üretimi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Vitamin ve Mineral Takviyeleri
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Probiyotik Ürün Üretimi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Helal Sertifikalı Üretim
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Link href="/fason-uretim/gida-takviyesi-fason-uretim">
                    Gıda Takviyesi Detayları
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Factory className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Temizlik Ürünleri Üretimi
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  ISO 14001 çevre dostu temizlik ürünleri üretimi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Sıvı Sabun ve Deterjan
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Yüzey Temizleyici Üretimi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Dezenfektan Üretimi
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Çevre Dostu Formülasyonlar
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Link href="/fason-uretim/temizlik-urunleri-fason-uretim">
                    Temizlik Ürünleri Detayları
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ISO Sertifikalar ve Kalite Standartları */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ISO Sertifikalı Kalite Standartları ve Teknolojilerimiz
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              <strong>Contract manufacturing</strong> süreçlerimizde
              uluslararası kalite standartları, en son teknoloji ile donatılmış
              üretim hatlarımız ve kalite kontrol sistemlerimiz sayesinde,
              yüksek kaliteli <strong>fason üretim</strong> hizmetleri
              sunuyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900">
              <CardHeader className="pb-0">
                <div className="mb-4 w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-center text-xl mb-2 text-gray-900 dark:text-gray-100">
                  ISO Sertifikalı Kalite Güvencesi
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  <strong>ISO 22716 GMP</strong>, <strong>ISO 9001</strong>,{" "}
                  <strong>ISO 14001</strong>
                  ve <strong>HACCP</strong> sertifikalarımızla uluslararası
                  standartlarda
                  <strong> contract manufacturing</strong> hizmetleri.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-800 dark:border-blue-700 dark:text-blue-300"
                  >
                    ISO 22716 GMP
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-green-200 text-green-800 dark:border-green-700 dark:text-green-300"
                  >
                    ISO 9001:2015
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-purple-200 text-purple-800 dark:border-purple-700 dark:text-purple-300"
                  >
                    ISO 14001
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-orange-200 text-orange-800 dark:border-orange-700 dark:text-orange-300"
                  >
                    HACCP
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900">
              <CardHeader className="pb-0">
                <div className="mb-4 w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto">
                  <Microscope className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-center text-xl mb-2 text-gray-900 dark:text-gray-100">
                  Ar-Ge ve Formülasyon Laboratuvarları
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Yenilikçi <strong>private label formülasyonlar</strong>{" "}
                  geliştiren Ar-Ge ekibimiz, modern analiz cihazları ve
                  teknolojik altyapı ile müşterilerimizin ihtiyaçlarına özel{" "}
                  <strong>OEM/ODM çözümler</strong> sunmaktadır.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Formülasyon Geliştirme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Stabilite Testleri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Mikrobiyal Analiz</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900">
              <CardHeader className="pb-0">
                <div className="mb-4 w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto">
                  <Factory className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-center text-xl mb-2 text-gray-900 dark:text-gray-100">
                  Otomatik Üretim Hatları ve Teknoloji
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Yüksek kapasiteli ve tam otomatik{" "}
                  <strong>fason üretim hatlarımız</strong>, minimum insan
                  müdahalesi ile maksimum verimlilik ve tutarlı kalite
                  sağlayarak büyük ölçekli projelerinizi desteklemektedir.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Otomatik Dolum Sistemleri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Clean Room Teknolojisi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Kalite Kontrol Sistemleri</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kalite Süreçleri */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Contract Manufacturing Kalite Süreç Yönetimimiz
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Hammadde Kontrolü
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tüm hammaddelerin GMP standartlarına uygun kontrol ve analizi
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Üretim Süreç Kontrolü
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Her üretim aşamasında kalite parametrelerinin takibi ve
                  kontrolü
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Ürün Analizi
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bitmiş ürünlerin detaylı laboratuvar analizi ve test süreçleri
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Traceability
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hammaddeden bitmiş ürüne kadar tam izlenebilirlik sistemi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Müşteri Güven Unsurları ve Başarı Hikayesi */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Neden MKN GROUP Contract Manufacturing?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              <strong>6+ yıllık sektör deneyimimiz</strong>,{" "}
              <strong>1000+ başarılı proje</strong>
              portfolyomuz ve{" "}
              <strong>ISO sertifikalı kalite güvencemizle</strong>, Türkiye'nin
              en güvenilir <strong>contract manufacturing</strong> ve
              <strong>fason üretim</strong> çözüm ortağıyız.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md hover:shadow-lg dark:shadow-gray-800/30 dark:hover:shadow-gray-800/40 transition-all text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
                  ISO 22716 GMP
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Kozmetik Üretim Sertifikası
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md hover:shadow-lg dark:shadow-gray-800/30 dark:hover:shadow-gray-800/40 transition-all text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
                  ISO 9001:2015
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Kalite Yönetim Sistemi
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md hover:shadow-lg dark:shadow-gray-800/30 dark:hover:shadow-gray-800/40 transition-all text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
                  ISO 14001
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Çevre Yönetim Sistemi
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md hover:shadow-lg dark:shadow-gray-800/30 dark:hover:shadow-gray-800/40 transition-all text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
                  HACCP
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Gıda Güvenliği Sistemi
                </p>
              </div>
            </div>

            {/* Güven Unsurları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  500+
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Başarılı Proje
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  6+ yılda tamamlanan başarılı contract manufacturing projeleri
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  7M+
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Aylık Üretim
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Aylık toplam fason üretim kapasitemiz (ünite)
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  10.600m²
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Üretim Alanı
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Modern ve teknoloji donanımlı toplam üretim tesisi alanı
                </p>
              </div>
            </div>

            {/* Müşteri Testimonial */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-8 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic mb-4">
                "MKN GROUP'un contract manufacturing hizmetleri sayesinde markami
                başarıyla büyüttüm. ISO sertifikalı kalite standartları, hızlı
                teslimat ve profesyonel yaklaşımları ile güvenilir bir partner."
              </blockquote>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                - Kozmetik Markası Sahibi
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold"
              >
                <Link
                  href="/teklif?service=uretim"
                  className="flex items-center"
                >
                  Ücretsiz Contract Manufacturing Teklifi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 bg-transparent px-8 py-4 text-lg font-semibold"
              >
                <Link href="/iletisim?service=uretim&konu=tesis-ziyaret">
                  Tesislerimizi Ziyaret Edin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
              Contract Manufacturing Projenizi Başlatın
            </h2>
            <p className="text-xl text-blue-100 mb-8 text-pretty leading-relaxed">
              <strong>ISO sertifikalı tesislerimizde</strong> profesyonel{" "}
              <strong>fason üretim hizmetleri</strong> ile markanızı
              güçlendirin. <strong>Contract manufacturing</strong>,{" "}
              <strong>private label üretim</strong> ve{" "}
              <strong>OEM/ODM hizmetleri</strong> için ücretsiz danışmanlık ve
              hızlı teklif alın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link
                  href="/teklif?service=uretim"
                  className="flex items-center"
                  title="Contract Manufacturing Teklif Al - MKN GROUP"
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
                  href="/iletisim?service=uretim"
                  title="MKN GROUP Contract Manufacturing İletişim"
                >
                  Danışmanlık Alın
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
