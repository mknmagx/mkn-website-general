import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FlaskConical,
  Award,
  Zap,
  CheckCircle,
  Factory,
  Microscope,
  ShieldCheck,
  Users,
  Globe,
  MapPin,
  Phone,
  Mail,
  Building,
  Target,
  TrendingUp,
  Star,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title:
    "Aspar İlaç Kozmetik Gıda Sanayi A.Ş | Gıda Takviyesi ve Dermokozmetik Fason Üretim Tesisi | İstanbul",
  description:
    "🏭 Aspar İlaç: İstanbul Beylikdüzü'nde 5600m² GMP ve ISO 22000 sertifikalı tesisimizde gıda takviyesi, dermokozmetik ve bitkisel ürün fason üretimi. 15+ yıl deneyim, 2M+ aylık üretim kapasitesi, Ar-Ge laboratuvarı. Vitamin, mineral, protein tozu, krem, serum üretimi.",
  keywords: [
    // Şirket ismi ve marka
    "Aspar İlaç",
    "Aspar İlaç Kozmetik Gıda Sanayi A.Ş",
    "asparilac",
    "aspar ilac",
    "aspar ilaç fabrika",

    // Ana hizmetler
    "gıda takviyesi fason üretim",
    "dermokozmetik fason üretim istanbul",
    "vitamin üretim tesisi",
    "krem serum üretim fabrikası",
    "bitkisel ilaç üretimi",
    "protein tozu üretimi",

    // Sertifikalar ve standartlar
    "GMP sertifikalı tesis istanbul",
    "ISO 22000 gıda güvenliği",
    "FDA uyumlu üretim",
    "HACCP sertifikalı fabrika",

    // Ürün kategorileri
    "tablet kapsül üretimi",
    "vitamin mineral üretim",
    "probiyotik üretimi",
    "anti aging krem üretimi",
    "yüz serumu üretimi",
    "şampuan üretimi",

    // Lokasyon ve hizmet alanı
    "istanbul fason üretim",
    "beylikdüzü üretim tesisi",
    "türkiye contract manufacturing",
    "private label üretim",
    "OEM ODM üretim hizmetleri",

    // İş modeli
    "fason üretim firması",
    "contract manufacturing turkey",
    "özel etiket üretimi",
    "markalı ürün üretimi",
    "anahtar teslim üretim",
  ],
  authors: [
    {
      name: "Aspar İlaç Kozmetik Gıda Sanayi A.Ş",
      url: "https://asparilac.com",
    },
  ],
  creator: "Aspar İlaç",
  publisher: "MKN GROUP",
  category: "Manufacturing",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://www.mkngroup.com.tr/tesisler/aspar-ilac",
    languages: {
      "tr-TR": "https://www.mkngroup.com.tr/tesisler/aspar-ilac",
      "en-US": "https://www.mkngroup.com.tr/en/facilities/aspar-pharmaceutical",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://www.mkngroup.com.tr/tesisler/aspar-ilac",
    siteName: "MKN GROUP",
    title:
      "Aspar İlaç | GMP Sertifikalı Gıda Takviyesi ve Dermokozmetik Üretim Tesisi",
    description:
      "🏭 Aspar İlaç: 5600m² GMP sertifikalı tesisimizde gıda takviyesi, dermokozmetik fason üretimi. 15+ yıl deneyim, 2M+ aylık kapasite. İstanbul Beylikdüzü.",
    images: [
      {
        url: "https://www.mkngroup.com.tr/modern-pharmaceutical-manufacturing-facility-with-.png",
        width: 1200,
        height: 630,
        alt: "Aspar İlaç GMP Sertifikalı Modern Üretim Tesisi - İstanbul",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup_x",
    creator: "@asparilac",
    title:
      "Aspar İlaç | GMP Sertifikalı Gıda Takviyesi ve Dermokozmetik Üretim Tesisi",
    description:
      "🏭 5600m² GMP sertifikalı tesisimizde gıda takviyesi, dermokozmetik fason üretimi. 15+ yıl deneyim, İstanbul.",
    images: [
      "https://www.mkngroup.com.tr/modern-pharmaceutical-manufacturing-facility-with-.png",
    ],
  },
};

export default function AsparIlacPage() {
  // Structured Data for Aspar İlaç
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "Manufacturer"],
    name: "Aspar İlaç Kozmetik Gıda Sanayi A.Ş",
    alternateName: ["Aspar İlaç", "AsparIlac"],
    description:
      "GMP ve ISO sertifikalı gıda takviyesi, dermokozmetik ve bitkisel ürün fason üretim tesisi",
    url: "https://asparilac.com",
    sameAs: [
      "https://www.mkngroup.com.tr/tesisler/aspar-ilac",
      "https://asparilac.com",
    ],
    logo: "https://asparilac.com/assets/asparlogo_original.jpg",
    foundingDate: "2008",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Beylikdüzü",
      addressLocality: "İstanbul",
      addressCountry: "Turkey",
      postalCode: "34520",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+90 536 592 30 35",
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
            name: "Gıda Takviyesi Fason Üretimi",
            description: "Vitamin, mineral, probiyotik, protein tozu üretimi",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Dermokozmetik Fason Üretimi",
            description: "Krem, serum, şampuan, losyon üretimi",
          },
        },
      ],
    },
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "GMP Sertifikası",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: "ISO 22000 Gıda Güvenliği",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "500",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const companyStats = [
    {
      number: "15+",
      label: "Yıl Sektör Deneyimi",
      icon: TrendingUp,
      description: "2008'den beri güvenilir üretim",
    },
    {
      number: "5600m²",
      label: "Modern Tesis Alanı",
      icon: Building,
      description: "Son teknoloji üretim hatları",
    },
    {
      number: "2M+",
      label: "Aylık Üretim Kapasitesi",
      icon: Factory,
      description: "Yüksek kapasiteli üretim",
    },
    {
      number: "300+",
      label: "Başarılı Fason Üretim Projesi",
      icon: Award,
      description: "Kanıtlanmış başarı hikayesi",
    },
  ];

  const productionAreas = [
    {
      title: "Gıda Takviyeleri Fason Üretimi",
      description:
        "GMP standartlarında vitamin, mineral ve bitkisel takviyelerin profesyonel üretimi",
      products: [
        "Vitamin ve Mineral Tabletleri",
        "Probiyotik Kapsüller",
        "Protein Tozları ve Sporcu Besinleri",
        "Bitkisel Ekstraktlar",
        "Sıvı Takviyeler ve Şuruplar",
        "Çiğnenebilir Tablet Formları",
        "Özel Formülasyon Geliştirme",
      ],
      icon: FlaskConical,
      capacity: "1.5M+ aylık tablet/kapsül",
      certifications: ["GMP", "ISO 22000", "HACCP", "FDA Uyumlu"],
    },
    {
      title: "Dermokozmetik Fason Üretimi",
      description:
        "Cilt ve saç bakımı ürünlerinde uzmanlaşmış dermokozmetik fason üretim hizmetleri",
      products: [
        "Anti-Aging Kremler ve Serumlar",
        "Yüz ve Vücut Bakım Ürünleri",
        "Şampuan ve Saç Bakım Ürünleri",
        "Temizleme Lotionları",
        "Güneş Koruyucu Ürünler",
        "Doğal ve Organik Kozmetikler",
        "Özel Marka Geliştirme",
      ],
      icon: Award,
      capacity: "500K+ aylık kozmetik ünite",
      certifications: [
        "ISO 22716",
        "Dermatologically Tested",
        "Organic Certified",
      ],
    },
  ];

  const certificates = [
    {
      name: "GMP (Good Manufacturing Practice)",
      description: "İyi Üretim Uygulamaları Sertifikası",
      authority: "Sağlık Bakanlığı",
      icon: ShieldCheck,
    },
    {
      name: "ISO 22000:2018 Gıda Güvenliği",
      description: "Gıda Güvenliği Yönetim Sistemi",
      authority: "Uluslararası Standart",
      icon: Award,
    },
    {
      name: "HACCP Gıda Güvenliği",
      description: "Kritik Kontrol Noktaları Analizi",
      authority: "FDA Uyumlu",
      icon: CheckCircle,
    },
    {
      name: "ISO 9001:2015 Kalite Yönetimi",
      description: "Kalite Yönetim Sistemi Sertifikası",
      authority: "Uluslararası Standart",
      icon: Target,
    },
    {
      name: "Organik Üretim Sertifikası",
      description: "Organik Ürün Üretim Yetkilendirmesi",
      authority: "Tarım Bakanlığı",
      icon: Microscope,
    },
  ];

  const productCapabilities = [
    {
      category: "Tablet Üretimi",
      items: [
        "Vitamin Tabletleri",
        "Mineral Tabletleri",
        "Çiğnenebilir Tabletler",
        "Effervescent Tabletler",
      ],
    },
    {
      category: "Kapsül Üretimi",
      items: [
        "Probiyotik Kapsüller",
        "Bitkisel Ekstraktlar",
        "Vitamin Kapsülleri",
        "Özel Formülasyonlar",
      ],
    },
    {
      category: "Sıvı Formlar",
      items: ["Şuruplar", "Damlalar", "Tonikler", "Sıvı Takviyeler"],
    },
    {
      category: "Toz Ürünler",
      items: [
        "Protein Tozları",
        "Kolajen Tozları",
        "Bebek Mamaları",
        "Sporcu Besinleri",
      ],
    },
    {
      category: "Krem ve Losyonlar",
      items: [
        "Anti-Aging Kremler",
        "Nemlendirici Losyonlar",
        "Güneş Koruyucular",
        "Özel Bakım Kremleri",
      ],
    },
    {
      category: "Serumlar",
      items: [
        "Vitamin C Serumları",
        "Hyaluronik Asit Serumları",
        "Retinol Serumları",
        "Peptit Serumları",
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
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800/50 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.3),transparent_50%)]"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge className="mb-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 border-blue-200 dark:border-blue-700">
                <Factory className="h-4 w-4 mr-2" />
                GMP Sertifikalı Fason Üretim Tesisi
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 text-balance leading-tight">
                Aspar İlaç Kozmetik Gıda Sanayi A.Ş
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 text-pretty leading-relaxed">
                <strong>İstanbul Beylikdüzü'nde 5600m² alanda</strong> faaliyet
                gösteren,
                <strong>GMP ve ISO 22000 sertifikalı</strong> modern tesisimizde
                <strong>gıda takviyesi</strong>, <strong>dermokozmetik</strong>{" "}
                ve
                <strong>bitkisel ürün fason üretimi</strong> yapıyoruz.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    15+ Yıl Deneyim
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    2M+ Aylık Kapasite
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    300+ Başarılı Proje
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    5600m² Modern Tesis
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-8 py-3"
                >
                  <Link
                    href="/teklif?facility=aspar-ilac&service=fason-uretim"
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
                    href="https://asparilac.com"
                    target="_blank"
                    rel="noopener"
                  >
                    Resmi Website
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="aspect-square rounded-xl overflow-hidden shadow-2xl dark:shadow-slate-800/50 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <Image
                  src="/optimized/modern-pharmaceutical-manufacturing-facility-with-.png"
                  alt="Aspar İlaç GMP Sertifikalı Modern Üretim Tesisi - İstanbul Beylikdüzü"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 dark:from-slate-900/90 to-transparent p-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-500 dark:bg-blue-600 text-white">
                      GMP Sertifikalı
                    </Badge>
                    <Badge className="bg-green-500 dark:bg-green-600 text-white">
                      ISO 22000
                    </Badge>
                    <Badge className="bg-purple-500 dark:bg-purple-600 text-white">
                      15+ Yıl Deneyim
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
              Aspar İlaç Fason Üretim Kapasitemiz
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              <strong>2008'den beri</strong> gıda takviyesi ve dermokozmetik
              sektöründe {" "}
              <strong>fason üretim</strong> alanında Türkiye'nin öncü
              firmalarından biriyiz.
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
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
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
              Aspar İlaç Fason Üretim Alanlarımız
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              <strong>
                İki ana kategoride uzmanlaşmış fason üretim hizmetlerimiz
              </strong>{" "}
              ile markanızın tüm ihtiyaçlarını karşılıyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {productionAreas.map((area, index) => {
              const IconComponent = area.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 flex items-center justify-center">
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
              Aspar İlaç Ürün Üretim Kapasiteleri
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Markanız için üretebileceğimiz <strong>gıda takviyesi</strong> ve
              <strong>dermokozmetik</strong> ürün çeşitlerimizi keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCapabilities.map((capability, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
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
              Aspar İlaç Sertifikalar ve Kalite Standartları
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              <strong>Uluslararası kalite standartlarına</strong> uygun üretim
              yapan tesisimizin sahip olduğu sertifikalar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {certificates.map((cert, index) => {
              const IconComponent = cert.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900"
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
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
                Aspar İlaç Ar-Ge ve Formülasyon Laboratuvarı
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                <strong>Deneyimli kimyager ve mühendis kadromuzla</strong>,
                müşterilerimizin özel ihtiyaçlarına yönelik{" "}
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
                    Stabilite ve raf ömrü testleri
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Mikrobiyal analiz ve güvenlik testleri
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Hızlı prototip geliştirme
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Özel Formülasyon
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Müşteri ihtiyaçlarına özel ürün geliştirme hizmetleri
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Microscope className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Kalite Testleri
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Kapsamlı laboratuvar analizleri ve güvenlik testleri
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Hızlı Geliştirme
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Kısa sürede prototip üretimi ve pazar testleri
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
              Aspar İlaç İletişim ve Konum Bilgileri
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
                      5600 m² Kapalı Alan
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
                        href="https://asparilac.com"
                        target="_blank"
                        rel="noopener"
                      >
                        asparilac.com
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                  Fason Üretim Teklifi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Gıda takviyesi</strong> ve{" "}
                  <strong>dermokozmetik</strong> ürünlerinizin fason üretimi
                  için detaylı teklif almak üzere bizimle iletişime geçin.
                </p>
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Link
                      href="/teklif?facility=aspar-ilac"
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
                      href="/iletisim?konu=aspar-ilac-genel"
                      className="flex items-center justify-center w-full"
                    >
                      Genel Bilgi Al
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
              Aspar İlaç ile Fason Üretim Projenizi Başlatın
            </h2>
            <p className="text-xl text-blue-100 mb-8 text-pretty leading-relaxed">
              <strong>15+ yıllık deneyimimiz</strong> ve{" "}
              <strong>GMP sertifikalı tesisimizle</strong>
              gıda takviyesi ve dermokozmetik ürünlerinizin{" "}
              <strong>fason üretiminde</strong>
              güvenilir çözüm ortağınız. Ücretsiz danışmanlık ve hızlı teklif
              için hemen iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link
                  href="/teklif?facility=aspar-ilac&service=fason-uretim"
                  className="flex items-center"
                  title="Aspar İlaç Fason Üretim Teklifi Al"
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
                  href="https://asparilac.com"
                  target="_blank"
                  title="Aspar İlaç Resmi Website"
                >
                  Resmi Website Ziyaret Et
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
