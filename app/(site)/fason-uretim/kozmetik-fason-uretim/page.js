import Link from "next/link";
import {
  Beaker,
  CheckCircle,
  ArrowRight,
  Award,
  FlaskConical,
  Package,
  Shield,
  Sparkles,
  Droplets,
  Palette,
  Heart,
  Eye,
  Clock,
  Calculator,
  FileText,
  Users,
  Target,
  Microscope,
  Factory,
  TrendingUp,
  Globe,
  Star,
  HelpCircle,
  Plus,
  Minus,
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
    "Kozmetik Fason Üretim | GMP Sertifikalı Kozmetik Üretici | ISO 22716 | MKNGROUP",
  description:
    "Türkiye'nin en büyük kozmetik fason üretim tesisi. Krem, serum, şampuan, cilt bakımı ürünleri ISO 22716 GMP sertifikalı tesislerde üretiliyor. OEM/ODM kozmetik fason üretim, özel formülasyon, private label, halal kozmetik üretimi. 1000+ formülasyon deneyimi.",
  keywords:
    "kozmetik fason üretim, kozmetik fason üretici, GMP kozmetik üretim, ISO 22716 kozmetik, OEM kozmetik üretim, ODM kozmetik üretim, private label kozmetik, halal kozmetik üretimi, krem fason üretim, serum fason üretim, şampuan fason üretim, cilt bakımı fason üretim, makyaj fason üretim, kozmetik formülasyon, kozmetik ar-ge, kozmetik kalite kontrol, CPNP kozmetik, türkiye kozmetik üretici",
  alternates: {
    canonical: "https://mkngroup.com.tr/fason-uretim/kozmetik-fason-uretim",
  },
  openGraph: {
    title:
      "Kozmetik Fason Üretim | GMP Sertifikalı Kozmetik Üretici | MKNGROUP",
    description:
      "Türkiye'nin lider kozmetik fason üretim firması. ISO 22716 GMP sertifikalı 5.600 m² tesislerde krem, serum, şampuan ve tüm kozmetik ürün grupları için OEM/ODM hizmetleri. 1000+ formülasyon deneyimi, halal sertifikalı üretim.",
    url: "https://mkngroup.com.tr/fason-uretim/kozmetik-fason-uretim",
    siteName: "MKNGROUP",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://mkngroup.com.tr/kozmetik-fason-uretim-og.jpg",
        width: 1200,
        height: 630,
        alt: "MKNGROUP Kozmetik Fason Üretim Tesisleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozmetik Fason Üretim | GMP Sertifikalı | MKNGROUP",
    description:
      "Türkiye'nin en büyük kozmetik fason üretim tesisi. ISO 22716 GMP sertifikalı tesislerde profesyonel kozmetik üretimi.",
    images: ["https://mkngroup.com.tr/kozmetik-fason-uretim-og.jpg"],
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

export default function KozmetikFasonUretimPage() {
  const serviceData = {
    name: "Kozmetik Fason Üretim Hizmetleri",
    description:
      "ISO 22716 GMP sertifikalı 5.600 m² tesislerde kozmetik ürünlerin profesyonel fason üretimi. Krem, serum, şampuan, cilt bakımı, makyaj ve tüm kozmetik ürün grupları için OEM/ODM hizmetleri. 1000+ formülasyon deneyimi, halal sertifikalı üretim kapasitesi.",
    type: "Manufacturing",
    category: "Cosmetic Contract Manufacturing",
    provider: {
      "@type": "Organization",
      name: "MKNGROUP",
      url: "https://mkngroup.com.tr",
      logo: "https://mkngroup.com.tr/MKN-GROUP-LOGO.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+90-XXX-XXX-XXXX",
        contactType: "Customer Service",
        areaServed: "TR",
        availableLanguage: ["Turkish", "English"],
      },
    },
    areaServed: ["Turkey", "Europe", "Middle East"],
    serviceType: "Cosmetic Contract Manufacturing",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Kozmetik Fason Üretim Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "OEM Kozmetik Üretim",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "ODM Kozmetik Üretim",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Private Label Kozmetik",
          },
        },
      ],
    },
  };

  const breadcrumbItems = [
    {
      name: "Ana Sayfa",
      url: "https://mkngroup.com.tr",
    },
    {
      name: "Fason Üretim",
      url: "https://mkngroup.com.tr/fason-uretim",
    },
    {
      name: "Kozmetik Fason Üretim",
      url: "https://mkngroup.com.tr/fason-uretim/kozmetik-fason-uretim",
    },
  ];

  const productGroups = [
    {
      title: "Krem & Losyon Fason Üretim",
      description:
        "Yüz kremi, vücut losyonu, el kremi ve özel bakım kremlerinin profesyonel fason üretimi",
      icon: Droplets,
      features: [
        "Anti-aging formülasyonlar",
        "Nemlendirici kremler",
        "Güneş koruyucu kremler",
        "Özel bakım kremleri",
      ],
    },
    {
      title: "Serum & Esans Fason Üretim",
      description:
        "Yoğunlaştırılmış aktif içerikli serum ve esans ürünlerinin geliştirilmesi ve fason üretimi",
      icon: FlaskConical,
      features: [
        "Vitamin C serumları",
        "Hyaluronik asit serumları",
        "Peptit serumları",
        "Botanik esanslar",
      ],
    },
    {
      title: "Şampuan & Saç Bakımı Fason Üretim",
      description:
        "Tüm saç tiplerini için özel formülasyonlu şampuan ve saç bakım ürünleri fason üretimi",
      icon: Sparkles,
      features: [
        "Organik şampuanlar",
        "Saç maskesi",
        "Saç serumu",
        "Saç spreyleri",
      ],
    },
    {
      title: "Cilt Bakımı Fason Üretim",
      description:
        "Temizleme, tonikleme ve bakım amaçlı cilt bakım ürünlerinin kapsamlı fason üretimi",
      icon: Heart,
      features: [
        "Yüz temizleyicileri",
        "Tonikler",
        "Peeling ürünleri",
        "Maske formülasyonları",
      ],
    },
    {
      title: "Makyaj Ürünleri Fason Üretim",
      description:
        "Renkli kozmetik ürünlerin formülasyon ve fason üretim süreçlerinin yönetimi",
      icon: Palette,
      features: [
        "Fondöten",
        "Ruj ve lip gloss",
        "Göz makyajı",
        "Pudra ürünleri",
      ],
    },
    {
      title: "Göz Çevresi Bakımı Fason Üretim",
      description:
        "Hassas göz çevresi için özel formülasyonlu bakım ürünlerinin fason üretimi",
      icon: Eye,
      features: [
        "Göz kremi",
        "Göz serumu",
        "Göz maskesi",
        "Anti-aging göz bakımı",
      ],
    },
  ];

  const productionProcess = [
    {
      step: "01",
      title: "Ar-Ge & Formülasyon",
      description:
        "Müşteri ihtiyaçlarına özel kozmetik formül geliştirme, aktif madde seçimi ve stabilite testleri",
    },
    {
      step: "02",
      title: "Numune Geliştirme",
      description:
        "7 gün içinde profesyonel numune hazırlama, müşteri testleri ve formül optimizasyonu",
    },
    {
      step: "03",
      title: "Kalite Testleri",
      description:
        "Mikrobiyolojik testler, stabilite analizleri, deri uyumluluk testleri ve güvenlik değerlendirmeleri",
    },
    {
      step: "04",
      title: "Seri Fason Üretim",
      description:
        "GMP sertifikalı üretim hatlarında yüksek kapasiteli ve kalite kontrollü seri kozmetik fason üretim süreci",
    },
    {
      step: "05",
      title: "Ambalajlama & Teslimat",
      description:
        "Otomatik dolum sistemleri, etiketleme, ambalajlama ve lojistik desteği ile teslimat",
    },
  ];

  const certificates = [
    {
      name: "ISO 22716 GMP",
      description: "İyi Üretim Uygulamaları Kozmetik Standardı",
    },
    {
      name: "Halal Sertifikası",
      description: "Helal Kozmetik Üretim Belgesi",
    },
    {
      name: "CPNP",
      description: "Avrupa Kozmetik Portal Bildirimi",
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
      name: "Ecocert",
      description: "Organik Kozmetik Sertifikası",
    },
    {
      name: "COSMOS",
      description: "Organik ve Doğal Kozmetik Standardı",
    },
    {
      name: "ISO 9001",
      description: "Kalite Yönetim Sistemi",
    },
  ];

  const advantages = [
    {
      title: "GMP Sertifikalı Kozmetik Fason Üretim",
      description:
        "İyi Üretim Uygulamaları standartlarında hijyenik ve kaliteli kozmetik fason üretimi",
    },
    {
      title: "Özel Formülasyon",
      description:
        "Markanıza özel formül geliştirme ve mevcut formüllerin optimizasyonu",
    },
    {
      title: "OEM/ODM Kozmetik Fason Üretim",
      description:
        "Kendi markanız için tam hizmet kozmetik fason üretim ve tasarım desteği",
    },
    {
      title: "Hızlı Numune Süreci",
      description:
        "7 gün içinde numune hazırlama ve müşteri onay süreçlerinin yönetimi",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <ServiceSchema service={serviceData} />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90 dark:from-blue-800/95 dark:to-purple-900/95"></div>
        <div className="absolute inset-0 bg-[url('/optimized/modern-manufacturing-facility-with-advanced-equipm.webp')] bg-cover bg-center opacity-20 dark:opacity-10"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 dark:bg-white/10 text-white border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300">
              GMP Sertifikalı Kozmetik Fason Üretim
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance animate-fade-in">
              ISO 22716 GMP Sertifikalı
              <br />
              Kozmetik Fason Üretim
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 text-pretty leading-relaxed">
              Türkiye'nin en büyük kozmetik fason üretim tesisinde krem, serum,
              şampuan ve tüm kozmetik ürün gruplarında
              <strong> günlük 30.000 adet üretim kapasitesi</strong>. 1000+
              formülasyon deneyimi, halal sertifikalı üretim, private label,
              OEM/ODM hizmetleri ile markanızı global pazara taşıyın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 font-semibold px-8 py-3 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/teklif" className="flex items-center">
                  Kozmetik Fason Üretim Teklifi Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 dark:border-slate-300 dark:hover:bg-slate-200 dark:hover:text-blue-700 font-semibold px-8 py-3 transition-all duration-300 bg-transparent"
              >
                <Link href="/tesisler">Fason Üretim Tesislerimiz</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Kozmetik Fason Üretim Açıklaması */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Türkiye'nin Önde Gelen Kozmetik Fason Üretim Firması
              </h2>
              <div className="max-w-5xl mx-auto">
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  <strong>MKNGROUP</strong>, 6+ yıllık deneyimi ve ISO 22716 GMP
                  sertifikalı 5.600 m² üretim tesisleriyle Türkiye'nin lider
                  kozmetik fason üretim firmasıdır. Krem, serum, şampuan, cilt
                  bakımı ve makyaj ürünleri olmak üzere tüm kozmetik
                  kategorilerinde{" "}
                  <strong>günlük 30.000 adet üretim kapasitesi</strong> ile
                  hizmet veriyoruz.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  1000+ formülasyon deneyimimiz, 8 kişilik Ar-Ge ekibimiz ve 25+
                  kalite kontrol noktamız ile <strong>private label</strong>,{" "}
                  <strong>OEM</strong> ve <strong>ODM</strong> kozmetik fason
                  üretim hizmetlerinde sektörün standardını belirlemekteyiz.
                  Halal sertifikalı üretim, organik kozmetik formülasyonu ve
                  uluslararası ihracat standartlarında üretim kapasitemizle
                  markanızın global büyümesini destekliyoruz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center group">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-300">
                  <Beaker className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  1000+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Kozmetik Fason Üretim Formülasyonu
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors duration-300">
                  <FlaskConical className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  150+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Aktif Kozmetik Fason Üretim Markası
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300">
                  <Award className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  15
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Uluslararası Kozmetik Kalite Sertifikası
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
                  Aylık Kozmetik Fason Üretim Kapasitesi (Adet)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Neden MKNGROUP Kozmetik Fason Üretim?
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
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-2xl p-8 text-white">
                  <h4 className="text-2xl font-bold mb-4">
                    Ücretsiz Kozmetik Fason Üretim Danışmanlığı
                  </h4>
                  <p className="mb-6">
                    Kozmetik formülasyon uzmanlarımızdan ücretsiz fason üretim
                    danışmanlık hizmeti alın.
                  </p>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 font-semibold">
                    <Link href="/teklif">Hemen Başla</Link>
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
                Kozmetik Fason Üretim Ürün Gruplarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Tüm kozmetik kategorilerinde uzman fason üretim hizmetleri ile
                markanızın ihtiyaçlarına cevap veriyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productGroups.map((group, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-2xl dark:hover:shadow-slate-700/50 transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
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
                Kozmetik Fason Üretim Sürecimiz
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                5 adımda profesyonel kozmetik fason üretim süreci ile kaliteli
                sonuçlar garantiliyoruz.
              </p>
            </div>

            <div className="relative">
              {/* Desktop Timeline */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full"></div>

              {/* Mobile Timeline */}
              <div className="lg:hidden absolute left-8 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full"></div>

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
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full text-white font-bold text-lg shadow-lg flex-shrink-0">
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
                Kozmetik Fason Üretim Kalite Sertifikalarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Uluslararası kozmetik kalite standartlarında fason üretim
                yapabilmek için gerekli tüm sertifikalara sahibiz.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-12">
              {certificates.map((cert, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-purple-200 dark:group-hover:from-blue-800 dark:group-hover:to-purple-800 transition-all duration-300">
                    <Shield className="h-10 w-10 text-blue-600 dark:text-blue-300" />
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

            <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Kozmetik Fason Üretim Kalite Politikamız
              </h3>
              <p className="text-blue-100 dark:text-blue-200 mb-6 max-w-3xl mx-auto leading-relaxed">
                Müşteri memnuniyetini en üst düzeyde tutarak, sürekli gelişim ve
                yenilik anlayışıyla uluslararası kozmetik kalite standartlarında
                fason üretim yapmayı taahhüt ediyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90 dark:from-blue-800/95 dark:to-purple-900/95"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
              Kozmetik Fason Üretim Markanızı Hayata Geçirin
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 text-pretty leading-relaxed">
              GMP sertifikalı tesislerimizde profesyonel kozmetik fason üretim
              hizmetleri ile markanızı güçlendirin. Ücretsiz danışmanlık ve
              hızlı teklif için hemen iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/teklif" className="flex items-center">
                  Kozmetik Fason Üretim Teklifi Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 dark:border-slate-300 dark:hover:bg-slate-200 dark:hover:text-blue-700 font-semibold px-8 py-4 text-lg transition-all duration-300 bg-transparent"
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
                Kozmetik Fason Üretim Teknik Kapasitelerimiz
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                5.600 m² kapalı alanda, son teknoloji ekipmanlarla günlük
                30.000 adet ürün üretim kapasitesi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        30.000 adet
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Minimum Üretim:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        1.000 adet
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Tesis Büyüklüğü:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        5.600 m²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Üretim Hatları:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        12 adet
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-green-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        8 kişi
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Test Ekipmanı:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        25+ cihaz
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Numune Süresi:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        3-7 gün
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
                        3-7 gün
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Seri Üretim:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        15-25 gün
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Acil Üretim:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        7-10 gün
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

            <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    Kozmetik Fason Üretim Maliyet Avantajları
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-200" />
                      <span>%40'a varan maliyet tasarrufu</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-200" />
                      <span>Sıfır yatırım maliyeti</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-200" />
                      <span>Hızlı piyasaya giriş</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-200" />
                      <span>Kalite garantisi</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3">
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

      {/* Kozmetik Fason Üretim Uzmanlık Alanları */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Kozmetik Fason Üretim Uzmanlık Alanlarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Her kozmetik kategorisinde derin uzmanlık ve özelleşmiş üretim
                teknolojileri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Formülasyon Uzmanlığı
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Anti-Aging Formülasyonları
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Retinol, peptit, vitamin C ve hyaluronik asit içeren
                      yaşlanma karşıtı kozmetik formülasyonları
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Organik & Doğal Kozmetik
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Sertifikalı organik ham maddeler ile doğal kozmetik ürün
                      formülasyonları
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Hassas Cilt Formülasyonları
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Hipoalerjenik, parfüm-free, dermatoloji test edilmiş
                      hassas cilt ürünleri
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
                      Soğuk İşlem Teknolojisi
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Aktif maddelerin stabilitesini koruyan soğuk işlem üretim
                      teknikleri
                    </p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Emülsifikasyon Uzmanlığı
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Kararlı emülsiyon sistemleri ile üstün doku ve performans
                    </p>
                  </div>
                  <div className="border-l-4 border-teal-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Nano-Enkapsülasyon
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Aktif maddelerin nano-enkapsülasyonu ile artırılmış
                      etkinlik
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Kozmetik Fason Üretim Kalite Kontrol Süreçleri
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Her üretim aşamasında 25+ kalite kontrol noktası ile %100
                  güvenli ürünler
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Microscope className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Hammadde Kontrolü
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Gelen her hammaddenin kimyasal ve mikrobiyolojik analizi
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="h-8 w-8 text-green-600 dark:text-green-300" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Süreç İçi Kontrol
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Üretim sırasında pH, viskozite, renk ve stabilite testleri
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
                    Mikrobiyal güvenlik, stabilite ve performans testleri
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
                Kozmetik Fason Üretim Hakkında Sıkça Sorulan Sorular
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Kozmetik fason üretim süreciyle ilgili merak ettiğiniz her şey
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Minimum kozmetik fason üretim miktarı nedir?",
                  answer:
                    "Ürün tipine göre değişmekle birlikte, minimum 1.000 adet üretim yapabiliyoruz. Krem ve losyon türü ürünlerde 1.000 adet, serum ve özel bakım ürünlerinde 500 adet minimum üretim miktarımızdır.",
                },
                {
                  question: "Kozmetik fason üretim süresi ne kadar?",
                  answer:
                    "Numune onayından sonra seri üretime geçiş 15-25 gün arasında tamamlanır. Acil durumlar için 7-10 günde teslimat yapabiliyoruz. Formülasyon geliştirme süreci dahil olmak üzere toplam süre 25-35 gündür.",
                },
                {
                  question: "Hangi kozmetik sertifikalara sahipsiniz?",
                  answer:
                    "ISO 22716 GMP, Halal, CPNP, FDA, CE marking sertifikalarına sahibiz. Ayrıca organik kozmetik üretimi için Ecocert ve COSMOS sertifikalarımız mevcuttur.",
                },
                {
                  question: "Private label kozmetik üretimi yapıyor musunuz?",
                  answer:
                    "Evet, private label kozmetik üretimi ana hizmetlerimizden biridir. Kendi markanız için formülasyon geliştirme, ambalaj tasarımı, etiket tasarımı dahil olmak üzere A'dan Z'ye hizmet veriyoruz.",
                },
                {
                  question: "Kozmetik fason üretim maliyeti nasıl hesaplanır?",
                  answer:
                    "Maliyet; ürün tipi, formülasyon karmaşıklığı, ambalaj türü, üretim miktarı ve etiketleme gereksinimlerine göre belirlenir. Ücretsiz fiyat teklifi için bizimle iletişime geçebilirsiniz.",
                },
                {
                  question:
                    "Organik ve doğal kozmetik üretimi yapabiliyor musunuz?",
                  answer:
                    "Evet, sertifikalı organik ham maddeler kullanarak organik ve doğal kozmetik üretimi yapıyoruz. Ecocert ve COSMOS standartlarında üretim kapasitemiz bulunmaktadır.",
                },
                {
                  question: "Kozmetik fason üretimde kalite garantisi var mı?",
                  answer:
                    "Tüm ürünlerimiz için ISO 22716 GMP standartlarında kalite garantisi veriyoruz. Üretim sürecinde 25+ kalite kontrol noktası bulunmaktadır ve nihai ürünler için tam analiz raporu sunuyoruz.",
                },
                {
                  question: "Ihracat için kozmetik üretimi yapıyor musunuz?",
                  answer:
                    "Evet, ihracat standartlarında kozmetik üretimi yapıyoruz. AB, ABD, Orta Doğu ve Afrika ülkeleri için gerekli sertifikasyon ve dokümantasyon desteği sağlıyoruz.",
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
                      <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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
              <Button className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold px-8 py-3">
                <Link href="/teklif">
                  Başka Sorularınız İçin İletişime Geçin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Kozmetik Fason Üretim Başarı Hikayeleri */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Kozmetik Fason Üretim Başarı Hikayeleri
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                150+ kozmetik markasının başarı hikayesine ortak olduk
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-green-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Yerli Kozmetik Markası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    6 ay içinde 50+ ürün portföyü oluşturarak e-ticaret
                    pazarında lider konuma geldi.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Cilt Bakımı</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Üretim Süresi:</span>
                    <span className="font-semibold">18 ay</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Uluslararası Marka
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Avrupa pazarına giriş için özel formülasyon ve CE
                    sertifikasyonu ile başarılı ihracat.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Organik Kozmetik</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">İhracat Ülkesi:</span>
                    <span className="font-semibold">15 Ülke</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Premium Kozmetik Markası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Anti-aging serisi ile premium segmente başarılı giriş ve
                    %300 satış artışı.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Anti-Aging</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Satış Artışı:</span>
                    <span className="font-semibold">%300</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Siz de Başarı Hikayenizi Yazın
              </h3>
              <p className="text-blue-100 dark:text-blue-200 mb-6 max-w-2xl mx-auto">
                Kozmetik fason üretim hizmetlerimizle markanızı büyütün ve
                pazarda fark yaratın.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 font-semibold px-8 py-3">
                <Link href="/teklif">Projenizi Başlatalım</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
