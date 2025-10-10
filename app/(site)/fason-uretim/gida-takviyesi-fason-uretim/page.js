import Link from "next/link";
import {
  Pill,
  CheckCircle,
  ArrowRight,
  Award,
  FlaskConical,
  Package,
  Shield,
  Heart,
  Activity,
  Zap,
  Users,
  FileText,
  Clock,
  Calculator,
  Factory,
  TrendingUp,
  Globe,
  Star,
  HelpCircle,
  Plus,
  Minus,
  Microscope,
  Target,
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
import { ServiceSchema, BreadcrumbSchema } from "@/components/structured-data";

export const metadata = {
  title:
    "Gıda Takviyesi Fason Üretim | HACCP Sertifikalı | ISO 22000 | MKN GROUP",
  description:
    "Türkiye'nin en büyük gıda takviyesi fason üretim tesisi. Kapsül, tablet, sıvı ve toz formda HACCP ISO 22000 sertifikalı tesislerde üretim. Vitamin, mineral, probiyotik, protein tozu fason üretimi. OEM/ODM hizmetleri, private label gıda takviyesi, Tarım Bakanlığı onaylı mevzuat uyumlu üretim.",
  keywords:
    "gıda takviyesi fason üretim, gıda takviyesi fason üretici, HACCP gıda takviyesi, ISO 22000 gıda üretim, OEM gıda takviyesi, ODM gıda takviyesi, private label gıda takviyesi, kapsül fason üretim, tablet fason üretim, sıvı gıda takviyesi üretim, vitamin fason üretim, mineral fason üretim, probiyotik fason üretim, protein tozu fason üretim, spor beslenme fason üretim, fonksiyonel gıda üretimi, tarım bakanlığı onaylı üretim, gıda takviyesi formülasyon",
  alternates: {
    canonical:
      "https://www.mkngroup.com.tr/fason-uretim/gida-takviyesi-fason-uretim",
  },
  openGraph: {
    title: "Gıda Takviyesi Fason Üretim | HACCP Sertifikalı | MKN GROUP",
    description:
      "Türkiye'nin lider gıda takviyesi fason üretim firması. HACCP ISO 22000 sertifikalı 12.000 m² tesislerde kapsül, tablet, sıvı ve toz formda gıda takviyesi üretimi. 500+ formülasyon deneyimi, Tarım Bakanlığı onaylı üretim.",
    url: "https://www.mkngroup.com.tr/fason-uretim/gida-takviyesi-fason-uretim",
    siteName: "MKN GROUP",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://www.mkngroup.com.tr/gida-takviyesi-fason-uretim-og.jpg",
        width: 1200,
        height: 630,
        alt: "MKN GROUP Gıda Takviyesi Fason Üretim Tesisleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gıda Takviyesi Fason Üretim | HACCP Sertifikalı | MKN GROUP",
    description:
      "Türkiye'nin en büyük gıda takviyesi fason üretim tesisi. HACCP ISO 22000 sertifikalı tesislerde profesyonel gıda takviyesi üretimi.",
    images: ["https://www.mkngroup.com.tr/gida-takviyesi-fason-uretim-og.jpg"],
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
};

export default function GidaTakviyesiFasonUretimPage() {
  const serviceData = {
    name: "Gıda Takviyesi Fason Üretim Hizmetleri",
    description:
      "HACCP ISO 22000 sertifikalı 12.000 m² tesislerde gıda takviyesi ürünlerinin profesyonel fason üretimi. Kapsül, tablet, sıvı ve toz formda gıda takviyesi üretimi. Vitamin, mineral, probiyotik, protein tozu fason üretimi. Tarım Bakanlığı mevzuatına uygun üretim.",
    type: "Manufacturing",
    category: "Food Supplement Contract Manufacturing",
    provider: {
      "@type": "Organization",
      name: "MKN GROUP",
      url: "https://www.mkngroup.com.tr",
      logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+90 531 494 25 94",
        contactType: "Customer Service",
        areaServed: "TR",
        availableLanguage: ["Turkish", "English"],
      },
    },
    areaServed: ["Turkey", "Europe", "Middle East"],
    serviceType: "Food Supplement Contract Manufacturing",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Gıda Takviyesi Fason Üretim Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "OEM Gıda Takviyesi Üretim",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "ODM Gıda Takviyesi Üretim",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Private Label Gıda Takviyesi",
          },
        },
      ],
    },
  };

  const breadcrumbItems = [
    {
      name: "Ana Sayfa",
      url: "https://www.mkngroup.com.tr",
    },
    {
      name: "Fason Üretim",
      url: "https://www.mkngroup.com.tr/fason-uretim",
    },
    {
      name: "Gıda Takviyesi Fason Üretim",
      url: "https://www.mkngroup.com.tr/fason-uretim/gida-takviyesi-fason-uretim",
    },
  ];

  const productGroups = [
    {
      title: "Kapsül Fason Üretim",
      description:
        "Sert ve yumuşak kapsül formunda gıda takviyesi fason üretimi",
      icon: Pill,
      features: [
        "Sert jelatin kapsüller",
        "Yumuşak jelatin kapsüller",
        "Vegan kapsül seçenekleri",
        "Enterik kaplamalı kapsüller",
      ],
    },
    {
      title: "Tablet Fason Üretim",
      description:
        "Çiğnenebilir ve yutulabilir tablet formlarında gıda takviyesi üretimi",
      icon: Package,
      features: [
        "Film kaplamalı tabletler",
        "Çiğnenebilir tabletler",
        "Efervesan tabletler",
        "Yavaş salınımlı tabletler",
      ],
    },
    {
      title: "Sıvı Form Fason Üretim",
      description:
        "Şurup, damla ve içecek formunda gıda takviyesi fason üretimi",
      icon: FlaskConical,
      features: [
        "Vitamin şurupları",
        "Mineral damlaları",
        "Protein içecekleri",
        "Probiyotik şuruplar",
      ],
    },
    {
      title: "Toz Form Fason Üretim",
      description:
        "Protein tozları ve karışım formlarında gıda takviyesi üretimi",
      icon: Zap,
      features: [
        "Protein tozları",
        "Spor beslenme tozları",
        "Vitamin-mineral karışımları",
        "Prebiyotik tozlar",
      ],
    },
    {
      title: "Fonksiyonel Gıdalar",
      description:
        "Sağlığı destekleyici özel fonksiyonel gıda ürünleri fason üretimi",
      icon: Heart,
      features: [
        "Probiyotik ürünler",
        "Omega-3 ürünleri",
        "Antioksidan karışımları",
        "Immün destek formülleri",
      ],
    },
    {
      title: "Spor Beslenmesi",
      description:
        "Sporcu performansını artıran gıda takviyesi ürünleri fason üretimi",
      icon: Activity,
      features: [
        "Pre-workout formülleri",
        "Post-workout ürünleri",
        "Aminoasit kompleksleri",
        "Enerji içecekleri",
      ],
    },
  ];

  const productionProcess = [
    {
      step: "01",
      title: "Formülasyon & Ar-Ge",
      description:
        "Gıda takviyesi formülü geliştirme, aktif madde seçimi ve stabilite testleri",
    },
    {
      step: "02",
      title: "Mevzuat Uyumluluk",
      description:
        "Tarım Bakanlığı mevzuatına uygunluk kontrolü ve gerekli belgelendirme süreçleri",
    },
    {
      step: "03",
      title: "Numune Üretimi",
      description:
        "Test amaçlı numune üretimi ve müşteri onay süreçlerinin yönetimi",
    },
    {
      step: "04",
      title: "Seri Fason Üretim",
      description:
        "HACCP sertifikalı üretim hatlarında yüksek kapasiteli ve kalite kontrollü gıda takviyesi fason üretimi",
    },
    {
      step: "05",
      title: "Ambalajlama & Etiketleme",
      description: "Mevzuat uyumlu etiketleme, ambalajlama ve lojistik desteği",
    },
  ];

  const certificates = [
    {
      name: "HACCP Sertifikası",
      description: "Gıda Güvenliği Kritik Kontrol Noktaları",
    },
    {
      name: "ISO 22000",
      description: "Gıda Güvenliği Yönetim Sistemi",
    },
    {
      name: "GMP Sertifikası",
      description: "İyi Üretim Uygulamaları",
    },
    {
      name: "Halal Sertifikası",
      description: "Helal Gıda Üretim Belgesi",
    },
    {
      name: "Tarım Bakanlığı",
      description: "Gıda İşletme Ruhsatı",
    },
    {
      name: "FDA Registration",
      description: "ABD Gıda ve İlaç Dairesi Kaydı",
    },
    {
      name: "CE Marking",
      description: "Avrupa Uygunluk Beyanı",
    },
    {
      name: "ISO 9001",
      description: "Kalite Yönetim Sistemi",
    },
  ];

  const advantages = [
    {
      title: "HACCP Sertifikalı Gıda Takviyesi Fason Üretim",
      description:
        "Gıda güvenliği standartlarında hijyenik ve kaliteli gıda takviyesi fason üretimi",
    },
    {
      title: "Mevzuat Uyumluluk Desteği",
      description:
        "Tarım Bakanlığı mevzuatına uygun üretim ve belgelendirme süreçleri",
    },
    {
      title: "Çeşitli Form Seçenekleri",
      description:
        "Kapsül, tablet, sıvı ve toz formlarında esnek gıda takviyesi fason üretim çözümleri",
    },
    {
      title: "Hızlı Üretim Süreci",
      description:
        "Etkili proje yönetimi ile hızlı numune geliştirme ve seri üretim süreçleri",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <ServiceSchema service={serviceData} />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-blue-600 to-green-800 dark:from-green-800 dark:via-blue-800 dark:to-green-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-blue-700/90 dark:from-green-800/95 dark:to-blue-900/95"></div>
        <div className="absolute inset-0 bg-[url('/optimized/modern-pharmaceutical-manufacturing-facility-with-.webp')] bg-cover bg-center opacity-20 dark:opacity-10"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 dark:bg-white/10 text-white border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300">
              HACCP ISO 22000 Sertifikalı Gıda Takviyesi Fason Üretim
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance animate-fade-in">
              HACCP Sertifikalı
              <br />
              Gıda Takviyesi Fason Üretim
            </h1>
            <p className="text-xl text-green-100 dark:text-green-200 mb-8 text-pretty leading-relaxed">
              Türkiye'nin en büyük gıda takviyesi fason üretim tesisinde kapsül,
              tablet, sıvı ve toz formda
              <strong> günlük 100.000 adet üretim kapasitesi</strong>. 500+
              formülasyon deneyimi, Tarım Bakanlığı onaylı mevzuat uyumlu
              üretim, private label, OEM/ODM hizmetleri ile markanızı global
              pazara taşıyın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 dark:bg-slate-100 dark:text-green-700 dark:hover:bg-slate-200 font-semibold px-8 py-3 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/teklif" className="flex items-center">
                  Gıda Takviyesi Fason Üretim Teklifi Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 dark:border-slate-300 dark:hover:bg-slate-200 dark:hover:text-green-700 font-semibold px-8 py-3 transition-all duration-300 bg-transparent"
              >
                <Link href="/tesisler">Üretim Tesislerimiz</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gıda Takviyesi Fason Üretim Açıklaması */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Türkiye'nin Önde Gelen Gıda Takviyesi Fason Üretim Firması
              </h2>
              <div className="max-w-5xl mx-auto">
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  <strong>MKN GROUP</strong>, 6+ yıllık deneyimi ve HACCP ISO
                  22000 sertifikalı 12.000 m² üretim tesisleriyle Türkiye'nin
                  lider gıda takviyesi fason üretim firmasıdır. Kapsül, tablet,
                  sıvı ve toz formda vitamin, mineral, probiyotik, protein tozu
                  olmak üzere tüm gıda takviyesi kategorilerinde{" "}
                  <strong>günlük 100.000 adet üretim kapasitesi</strong> ile
                  hizmet veriyoruz.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  500+ formülasyon deneyimimiz, 6 kişilik Ar-Ge ekibimiz ve 20+
                  kalite kontrol noktamız ile <strong>private label</strong>,{" "}
                  <strong>OEM</strong> ve <strong>ODM</strong> gıda takviyesi
                  fason üretim hizmetlerinde sektörün standardını
                  belirlemekteyiz. Tarım Bakanlığı onaylı mevzuat uyumlu üretim,
                  spor beslenme ürünleri ve fonksiyonel gıda üretim
                  kapasitemizle markanızın global büyümesini destekliyoruz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center group">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300">
                  <Pill className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  500+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Gıda Takviyesi Formülasyonu
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-300">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  80+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Aktif Gıda Takviyesi Markası
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors duration-300">
                  <Award className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  12
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Uluslararası Gıda Güvenliği Sertifikası
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-orange-100 dark:bg-orange-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors duration-300">
                  <Package className="h-8 w-8 text-orange-600 dark:text-orange-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  5M+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Aylık Gıda Takviyesi Üretim Kapasitesi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Neden MKN GROUP Gıda Takviyesi Fason Üretim?
                </h3>
                <div className="space-y-4">
                  {advantages.map((advantage, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {advantage.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {advantage.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-green-500 to-blue-600 dark:from-green-600 dark:to-blue-700 rounded-2xl p-8 text-white">
                  <h4 className="text-2xl font-bold mb-4">
                    Ücretsiz Gıda Takviyesi Fason Üretim Danışmanlığı
                  </h4>
                  <p className="mb-6">
                    Gıda takviyesi uzmanlarımızdan ücretsiz fason üretim
                    danışmanlık hizmeti alın.
                  </p>
                  <Button className="bg-white text-green-600 hover:bg-green-50 dark:bg-slate-100 dark:text-green-700 dark:hover:bg-slate-200 font-semibold">
                    <Link href="/iletisim?service=gida-takviyesi-danismanlik">
                      Hemen Başla
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ürün Grupları */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Gıda Takviyesi Fason Üretim Ürün Gruplarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Tüm gıda takviyesi kategorilerinde uzman fason üretim hizmetleri
                ile markanızın ihtiyaçlarına cevap veriyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productGroups.map((group, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-2xl dark:hover:shadow-slate-700/50 transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="bg-gradient-to-br from-green-500 to-blue-600 dark:from-green-600 dark:to-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <group.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {group.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {group.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {group.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Üretim Süreci */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Gıda Takviyesi Fason Üretim Sürecimiz
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                5 adımda profesyonel gıda takviyesi fason üretim süreci ile
                kaliteli sonuçlar garantiliyoruz.
              </p>
            </div>

            <div className="relative">
              {/* Desktop Timeline */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 to-blue-600 dark:from-green-400 dark:to-blue-500 rounded-full"></div>

              {/* Mobile Timeline */}
              <div className="lg:hidden absolute left-8 top-0 w-1 h-full bg-gradient-to-b from-green-500 to-blue-600 dark:from-green-400 dark:to-blue-500 rounded-full"></div>

              <div className="space-y-8 lg:space-y-12">
                {productionProcess.map((process, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    } flex-row`}
                  >
                    {/* Desktop Layout */}
                    <div
                      className={`hidden lg:block w-1/2 ${
                        index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                      }`}
                    >
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-700/50 p-6 hover:shadow-xl dark:hover:shadow-slate-600/50 transition-shadow duration-300">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          {process.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {process.description}
                        </p>
                      </div>
                    </div>

                    {/* Step Number */}
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 dark:from-green-400 dark:to-blue-500 rounded-full text-white font-bold text-lg shadow-lg flex-shrink-0">
                      {process.step}
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden flex-1 ml-6">
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-700/50 p-4 sm:p-6 hover:shadow-xl dark:hover:shadow-slate-600/50 transition-shadow duration-300">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                          {process.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                          {process.description}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Empty Space */}
                    <div className="hidden lg:block w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kalite ve Sertifikalar */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Gıda Takviyesi Fason Üretim Kalite Sertifikalarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Uluslararası gıda güvenliği standartlarında fason üretim
                yapabilmek için gerekli tüm sertifikalara sahibiz.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-12">
              {certificates.map((cert, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-green-200 group-hover:to-blue-200 dark:group-hover:from-green-800 dark:group-hover:to-blue-800 transition-all duration-300">
                    <Shield className="h-10 w-10 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {cert.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs leading-tight">
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-600 to-blue-700 dark:from-green-700 dark:to-blue-800 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Gıda Takviyesi Fason Üretim Kalite Politikamız
              </h3>
              <p className="text-green-100 dark:text-green-200 mb-6 max-w-3xl mx-auto leading-relaxed">
                Müşteri memnuniyetini en üst düzeyde tutarak, sürekli gelişim ve
                yenilik anlayışıyla uluslararası gıda güvenliği standartlarında
                gıda takviyesi fason üretim yapmayı taahhüt ediyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-blue-600 to-green-800 dark:from-green-800 dark:via-blue-800 dark:to-green-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-blue-700/90 dark:from-green-800/95 dark:to-blue-900/95"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
              Gıda Takviyesi Fason Üretim Markanızı Hayata Geçirin
            </h2>
            <p className="text-xl text-green-100 dark:text-green-200 mb-8 text-pretty leading-relaxed">
              HACCP sertifikalı tesislerimizde profesyonel gıda takviyesi fason
              üretim hizmetleri ile markanızı güçlendirin. Ücretsiz danışmanlık
              ve hızlı teklif için hemen iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 dark:bg-slate-100 dark:text-green-700 dark:hover:bg-slate-200 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/teklif" className="flex items-center">
                  Gıda Takviyesi Fason Üretim Teklifi Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 dark:border-slate-300 dark:hover:bg-slate-200 dark:hover:text-green-700 font-semibold px-8 py-4 text-lg transition-all duration-300 bg-transparent"
              >
                <Link href="/tesisler">Fason Üretim Tesislerimizi Gez</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Teknik Özellikler ve Kapasiteler */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Gıda Takviyesi Fason Üretim Teknik Kapasitelerimiz
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                12.000 m² kapalı alanda, son teknoloji ekipmanlarla günlük
                100.000 adet ürün üretim kapasitesi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-green-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Factory className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Üretim Kapasitesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Günlük Kapasite:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        100.000 adet
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Minimum Üretim:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        5.000 adet
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Tesis Büyüklüğü:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        12.000 m²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Üretim Hatları:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        8 adet
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Microscope className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Ar-Ge Laboratuvarı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Formülasyon Uzmanı:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        6 kişi
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Test Ekipmanı:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        20+ cihaz
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Numune Süresi:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        5-10 gün
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Revizyon:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Ücretsiz
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Teslimat Süreleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Numune:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        5-10 gün
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Seri Üretim:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        20-30 gün
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Acil Üretim:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        10-15 gün
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Kargo:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        1-3 gün
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-blue-700 dark:from-green-700 dark:to-blue-800 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    Gıda Takviyesi Fason Üretim Maliyet Avantajları
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-200" />
                      <span>%50'ye varan maliyet tasarrufu</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-200" />
                      <span>Sıfır yatırım maliyeti</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-200" />
                      <span>Hızlı piyasaya giriş</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-200" />
                      <span>HACCP kalite garantisi</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button className="bg-white text-green-600 hover:bg-green-50 font-semibold px-6 py-3">
                    <Link href="/teklif">
                      <Calculator className="mr-2 h-5 w-5 inline" />
                      Maliyet Hesaplama
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gıda Takviyesi Fason Üretim Uzmanlık Alanları */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Gıda Takviyesi Fason Üretim Uzmanlık Alanlarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Her gıda takviyesi kategorisinde derin uzmanlık ve özelleşmiş
                üretim teknolojileri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Formülasyon Uzmanlığı
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Probiyotik Formülasyonları
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Canlı probiyotik kültürler ile bağırsak sağlığını
                      destekleyen gıda takviyesi formülasyonları
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Spor Beslenme Ürünleri
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Protein, aminoasit, kreatin ve performans artırıcı spor
                      beslenme ürünleri
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Fonksiyonel Gıda Takviyesi
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Omega-3, CoQ10, curcumin gibi fonksiyonel bileşenlerle
                      özel formülasyonlar
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Üretim Teknolojileri
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Enterik Kaplama Teknolojisi
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Mide asidine dayanıklı özel kaplama ile aktif madde
                      korunması
                    </p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Yavaş Salınım Teknolojisi
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Kontrollü salınım ile uzun süreli etki sağlayan tablet
                      teknolojileri
                    </p>
                  </div>
                  <div className="border-l-4 border-teal-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Mikroenkapsülasyon
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Hassas aktif maddelerin mikroenkapsülasyonu ile stabilite
                      artırımı
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Gıda Takviyesi Fason Üretim Kalite Kontrol Süreçleri
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Her üretim aşamasında 20+ kalite kontrol noktası ile %100
                  güvenli ürünler
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Microscope className="h-8 w-8 text-green-600 dark:text-green-300" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Hammadde Kontrolü
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Gelen her hammaddenin kimyasal analizi ve saflık testleri
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Süreç İçi Kontrol
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Üretim sırasında ağırlık, sertlik ve çözünme testleri
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Nihai Ürün Testi
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Mikrobiyal güvenlik, etiket uygunluğu ve son kontroller
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sıkça Sorulan Sorular */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Gıda Takviyesi Fason Üretim Hakkında Sıkça Sorulan Sorular
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Gıda takviyesi fason üretim süreciyle ilgili merak ettiğiniz her
                şey
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question:
                    "Minimum gıda takviyesi fason üretim miktarı nedir?",
                  answer:
                    "Ürün tipine göre değişmekle birlikte, minimum 5.000 adet üretim yapabiliyoruz. Kapsül ve tablet ürünlerde 5.000 adet, sıvı formlarda 3.000 adet minimum üretim miktarımızdır.",
                },
                {
                  question: "Gıda takviyesi fason üretim süresi ne kadar?",
                  answer:
                    "Numune onayından sonra seri üretime geçiş 20-30 gün arasında tamamlanır. Acil durumlar için 10-15 günde teslimat yapabiliyoruz. Formülasyon geliştirme süreci dahil olmak üzere toplam süre 35-45 gündür.",
                },
                {
                  question: "Hangi gıda takviyesi sertifikalarına sahipsiniz?",
                  answer:
                    "HACCP, ISO 22000, Tarım Bakanlığı Gıda İşletme Belgesi, GMP, Halal sertifikalarına sahibiz. Ayrıca ihracat için FDA, CE marking ve ülkeye özel sertifikasyon desteği sağlıyoruz.",
                },
                {
                  question:
                    "Private label gıda takviyesi üretimi yapıyor musunuz?",
                  answer:
                    "Evet, private label gıda takviyesi üretimi ana hizmetlerimizden biridir. Kendi markanız için formülasyon geliştirme, ambalaj tasarımı, etiket tasarımı dahil olmak üzere A'dan Z'ye hizmet veriyoruz.",
                },
                {
                  question:
                    "Gıda takviyesi fason üretim maliyeti nasıl hesaplanır?",
                  answer:
                    "Maliyet; ürün tipi, formülasyon karmaşıklığı, ambalaj türü, üretim miktarı ve hammadde kalitesine göre belirlenir. Vitamin-mineral karışımları, probiyotik ürünler ve spor beslenme ürünleri için farklı fiyatlandırma uygulanır.",
                },
                {
                  question:
                    "Organik gıda takviyesi üretimi yapabiliyor musunuz?",
                  answer:
                    "Evet, sertifikalı organik ham maddeler kullanarak organik gıda takviyesi üretimi yapıyoruz. Organik sertifikasyon süreçlerinde de tam destek sağlıyoruz.",
                },
                {
                  question:
                    "Gıda takviyesi fason üretimde kalite garantisi var mı?",
                  answer:
                    "Tüm ürünlerimiz için HACCP ve ISO 22000 standartlarında kalite garantisi veriyoruz. Üretim sürecinde 20+ kalite kontrol noktası bulunmaktadır ve nihai ürünler için tam analiz raporu sunuyoruz.",
                },
                {
                  question:
                    "İhracat için gıda takviyesi üretimi yapıyor musunuz?",
                  answer:
                    "Evet, ihracat standartlarında gıda takviyesi üretimi yapıyoruz. AB, ABD, Orta Doğu ve Afrika ülkeleri için gerekli sertifikasyon ve dokümantasyon desteği sağlıyoruz.",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800"
                >
                  <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4">
                        {faq.question}
                      </h3>
                      <HelpCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 text-white font-semibold px-8 py-3">
                <Link href="/teklif">
                  Başka Sorularınız İçin İletişime Geçin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gıda Takviyesi Fason Üretim Başarı Hikayeleri */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Gıda Takviyesi Fason Üretim Başarı Hikayeleri
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                80+ gıda takviyesi markasının başarı hikayesine ortak olduk
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-green-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Spor Beslenme Markası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    3 ay içinde 25+ protein ve performans ürünü geliştirerek
                    spor beslenme pazarında güçlü konuma geldi.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Spor Beslenme</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Üretim Süresi:</span>
                    <span className="font-semibold">12 ay</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Probiyotik Markası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Özel probiyotik formülasyonları ile Avrupa pazarına başarılı
                    giriş ve 10 ülkeye ihracat.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Probiyotik</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">İhracat Ülkesi:</span>
                    <span className="font-semibold">10 Ülke</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Vitamin Markası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Çocuk vitaminleri serisi ile aile segmentinde lider konuma
                    geldi ve %400 satış artışı elde etti.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Çocuk Vitaminleri</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Satış Artışı:</span>
                    <span className="font-semibold">%400</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-blue-700 dark:from-green-700 dark:to-blue-800 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Siz de Başarı Hikayenizi Yazın
              </h3>
              <p className="text-green-100 dark:text-green-200 mb-6 max-w-2xl mx-auto">
                Gıda takviyesi fason üretim hizmetlerimizle markanızı büyütün ve
                pazarda fark yaratın.
              </p>
              <Button className="bg-white text-green-600 hover:bg-green-50 dark:bg-slate-100 dark:text-green-700 dark:hover:bg-slate-200 font-semibold px-8 py-3">
                <Link href="/teklif">Projenizi Başlatalım</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
