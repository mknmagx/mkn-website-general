import Link from "next/link";
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Award,
  FlaskConical,
  Package,
  Shield,
  Droplets,
  Recycle,
  Home,
  Building,
  Truck,
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
  Users,
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
  title: "Temizlik Ürünleri Fason Üretim | ISO 14001 Çevre Dostu | MKNGROUP",
  description:
    "Türkiye'nin en büyük temizlik ürünleri fason üretim tesisi. Sıvı sabun, deterjan, yüzey temizleyici, endüstriyel temizlik ürünleri ISO 14001 çevre dostu tesislerde üretiliyor. OEM/ODM temizlik ürünleri, private label deterjan, çevre dostu formülasyonlar. 300+ formülasyon deneyimi.",
  keywords:
    "temizlik ürünleri fason üretim, temizlik ürünleri fason üretici, ISO 14001 temizlik üretim, OEM temizlik ürünleri, ODM deterjan üretim, private label temizlik ürünleri, sıvı sabun fason üretim, deterjan fason üretim, yüzey temizleyici üretim, endüstriyel temizlik fason üretim, çevre dostu temizlik ürünleri, ekolojik deterjan üretimi, organik sabun fason üretim, antibakteriyel sabun üretimi, temizlik ürünleri formülasyon",
  alternates: {
    canonical: "https://www.mkngroup.com.tr/fason-uretim/temizlik-bakim-fason-uretim",
  },
  openGraph: {
    title: "Temizlik Ürünleri Fason Üretim | ISO 14001 Çevre Dostu | MKNGROUP",
    description:
      "Türkiye'nin lider temizlik ürünleri fason üretim firması. ISO 14001 çevre dostu 10.000 m² tesislerde sıvı sabun, deterjan, yüzey temizleyici üretimi. 300+ formülasyon deneyimi, çevre dostu üretim.",
    url: "https://www.mkngroup.com.tr/fason-uretim/temizlik-bakim-fason-uretim",
    siteName: "MKNGROUP",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://www.mkngroup.com.tr/temizlik-urunleri-fason-uretim-og.jpg",
        width: 1200,
        height: 630,
        alt: "MKNGROUP Temizlik Ürünleri Fason Üretim Tesisleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Temizlik Ürünleri Fason Üretim | ISO 14001 Çevre Dostu | MKNGROUP",
    description: "Türkiye'nin en büyük temizlik ürünleri fason üretim tesisi. ISO 14001 çevre dostu tesislerde profesyonel temizlik ürünleri üretimi.",
    images: ["https://www.mkngroup.com.tr/temizlik-urunleri-fason-uretim-og.jpg"],
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

export default function TemizlikBakimFasonUretimPage() {
  const serviceData = {
    name: "Temizlik Ürünleri Fason Üretim Hizmetleri",
    description:
      "ISO 14001 çevre dostu sertifikalı 10.000 m² tesislerde temizlik ürünlerinin profesyonel fason üretimi. Sıvı sabun, deterjan, yüzey temizleyici ve endüstriyel temizlik ürünleri için çevre dostu üretim çözümleri. 300+ formülasyon deneyimi.",
    type: "Manufacturing",
    category: "Cleaning Products Contract Manufacturing",
    provider: {
      "@type": "Organization",
      name: "MKNGROUP",
      url: "https://www.mkngroup.com.tr",
      logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+90-XXX-XXX-XXXX",
        contactType: "Customer Service",
        areaServed: "TR",
        availableLanguage: ["Turkish", "English"]
      }
    },
    areaServed: ["Turkey", "Europe", "Middle East"],
    serviceType: "Cleaning Products Contract Manufacturing",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Temizlik Ürünleri Fason Üretim Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "OEM Temizlik Ürünleri Üretim"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service", 
            name: "ODM Deterjan Üretim"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Private Label Temizlik Ürünleri"
          }
        }
      ]
    }
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
      name: "Temizlik Ürünleri Fason Üretim",
      url: "https://www.mkngroup.com.tr/fason-uretim/temizlik-urunleri-fason-uretim",
    },
  ];

  const productGroups = [
    {
      title: "Sıvı Sabun Fason Üretim",
      description:
        "El, vücut ve genel temizlik amaçlı sıvı sabun fason üretimi",
      icon: Droplets,
      features: [
        "Antibakteriyel el sabunları",
        "Hassas cilt sabunları",
        "Vücut şampuanları",
        "Organik sabun formülleri",
      ],
    },
    {
      title: "Deterjan Fason Üretim",
      description: "Çamaşır ve bulaşık deterjanları fason üretimi",
      icon: Package,
      features: [
        "Sıvı çamaşır deterjanları",
        "Bulaşık deterjanları",
        "Makine deterjanları",
        "Konsantre deterjanlar",
      ],
    },
    {
      title: "Yüzey Temizleyici Fason Üretim",
      description:
        "Mutfak, banyo ve genel yüzey temizleyici ürünleri fason üretimi",
      icon: Sparkles,
      features: [
        "Çok amaçlı temizleyiciler",
        "Cam temizleyicileri",
        "Banyo temizleyicileri",
        "Mutfak yağ çözücüler",
      ],
    },
    {
      title: "Endüstriyel Temizlik Fason Üretim",
      description:
        "Ağır hizmet tipi endüstriyel temizlik ürünleri fason üretimi",
      icon: Building,
      features: [
        "Endüstriyel yağ çözücüler",
        "Makine temizleyicileri",
        "Zemin temizleyicileri",
        "Dezenfektan ürünler",
      ],
    },
    {
      title: "Çevre Dostu Ürünler",
      description:
        "Biyolojik parçalanabilir çevre dostu temizlik ürünleri fason üretimi",
      icon: Recycle,
      features: [
        "Ekolojik deterjanlar",
        "Bitkisel temizleyiciler",
        "Fosfat içermeyen formüller",
        "Geri dönüştürülebilir ambalaj",
      ],
    },
    {
      title: "Ev Bakım Ürünleri",
      description:
        "Ev temizliği ve bakımı için özel formülasyonlu ürünler fason üretimi",
      icon: Home,
      features: [
        "Yer temizleyicileri",
        "Mobilya bakım ürünleri",
        "Halı şampuanları",
        "Hava ferahlatıcılar",
      ],
    },
  ];

  const productionProcess = [
    {
      step: "01",
      title: "Formülasyon & Ar-Ge",
      description:
        "Çevre dostu ve etkili temizlik formülü geliştirme, aktif madde seçimi ve performans testleri",
    },
    {
      step: "02",
      title: "Kalite & Güvenlik Testleri",
      description:
        "Temizlik etkinliği, cilt uyumluluğu ve çevre dostu özellik testleri",
    },
    {
      step: "03",
      title: "Numune Geliştirme",
      description:
        "Test amaçlı numune üretimi ve müşteri onay süreçlerinin yönetimi",
    },
    {
      step: "04",
      title: "Seri Fason Üretim",
      description:
        "Çevre dostu üretim süreçleri ile yüksek kapasiteli ve kalite kontrollü temizlik ürünleri fason üretimi",
    },
    {
      step: "05",
      title: "Ambalajlama & Teslimat",
      description:
        "Geri dönüştürülebilir ambalajlama ve sürdürülebilir lojistik desteği",
    },
  ];

  const certificates = [
    {
      name: "ISO 14001",
      description: "Çevre Yönetim Sistemi",
    },
    { name: "ISO 9001", description: "Kalite Yönetim Sistemi" },
    { name: "OHSAS 18001", description: "İş Sağlığı ve Güvenliği" },
    { name: "Ecolabel", description: "Çevre Dostu Ürün Sertifikası" },
  ];

  const advantages = [
    {
      title: "Çevre Dostu Temizlik Ürünleri Fason Üretim",
      description:
        "Biyolojik parçalanabilir ve çevre dostu formülasyonlar ile sürdürülebilir temizlik ürünleri fason üretimi",
    },
    {
      title: "Etkili Temizlik Formülasyonları",
      description:
        "Güçlü temizlik performansı ve kullanıcı güvenliği dengesi kuran profesyonel formül geliştirme",
    },
    {
      title: "Geniş Ürün Yelpazesi",
      description:
        "Ev temizliğinden endüstriyel uygulamalara kadar geniş temizlik ürünleri fason üretim portföyü",
    },
    {
      title: "Sürdürülebilir Üretim",
      description:
        "ISO 14001 çevre yönetimi standartlarında sürdürülebilir üretim süreçleri",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <ServiceSchema service={serviceData} />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-teal-600 to-blue-800 dark:from-blue-800 dark:via-teal-800 dark:to-blue-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-700/90 dark:from-blue-800/95 dark:to-teal-900/95"></div>
        <div className="absolute inset-0 bg-[url('/optimized/modern-chemical-manufacturing-facility-with-large-.webp')] bg-cover bg-center opacity-20 dark:opacity-10"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 dark:bg-white/10 text-white border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300">
              Çevre Dostu Temizlik Ürünleri Fason Üretim
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance animate-fade-in">
              Temizlik Ürünleri Fason Üretim Hizmetleri
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 text-pretty leading-relaxed">
              Sıvı sabun, deterjan, yüzey temizleyici ve endüstriyel temizlik
              ürünleri fason üretimi. Çevre dostu formülasyonlar ve
              sürdürülebilir üretim süreçleri ile ISO 14001 sertifikalı kaliteli
              üretim.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 font-semibold px-8 py-3 transition-all duration-300 transform hover:scale-105"
              >
                <Link
                  href="/iletisim?service=temizlik-fason-uretim"
                  className="flex items-center"
                >
                  Temizlik Ürünleri Fason Üretim Teklifi Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 dark:border-slate-300 dark:hover:bg-slate-200 dark:hover:text-blue-700 font-semibold px-8 py-3 transition-all duration-300 bg-transparent"
              >
                <Link href="/tesisler">Üretim Tesislerimiz</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Temizlik Ürünleri Fason Üretim Açıklaması */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Türkiye'nin Önde Gelen Temizlik Ürünleri Fason Üretim Firması
              </h2>
              <div className="max-w-5xl mx-auto">
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  <strong>MKNGROUP</strong>, 6+ yıllık deneyimi ve ISO 14001 çevre dostu sertifikalı 10.000 m² üretim tesisleriyle Türkiye'nin lider temizlik ürünleri fason üretim firmasıdır. 
                  Sıvı sabun, deterjan, yüzey temizleyici ve endüstriyel temizlik ürünleri olmak üzere tüm temizlik kategorilerinde <strong>günlük 25.000 litre üretim kapasitesi</strong> ile hizmet veriyoruz.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  300+ formülasyon deneyimimiz, 5 kişilik Ar-Ge ekibimiz ve 18+ kalite kontrol noktamız ile <strong>private label</strong>, <strong>OEM</strong> ve <strong>ODM</strong> temizlik ürünleri fason üretim hizmetlerinde sektörün standardını belirlemekteyiz. 
                  Çevre dostu formülasyonlar, biyolojik parçalanabilir ürünler ve sürdürülebilir üretim kapasitemizle markanızın çevre bilincini destekliyoruz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center group">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-300">
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  300+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Temizlik Ürünü Formülasyonu
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-teal-100 dark:bg-teal-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors duration-300">
                  <Recycle className="h-8 w-8 text-teal-600 dark:text-teal-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  60+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Aktif Temizlik Markası
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300">
                  <Award className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  10+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Çevre Dostu Sertifika
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors duration-300">
                  <Package className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  50K L
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Günlük Üretim Kapasitesi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Neden MKNGROUP Temizlik Ürünleri Fason Üretim?
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
                <div className="bg-gradient-to-br from-blue-500 to-teal-600 dark:from-blue-600 dark:to-teal-700 rounded-2xl p-8 text-white">
                  <h4 className="text-2xl font-bold mb-4">
                    Ücretsiz Temizlik Ürünleri Fason Üretim Danışmanlığı
                  </h4>
                  <p className="mb-6">
                    Temizlik ürünleri uzmanlarımızdan ücretsiz fason üretim
                    danışmanlık hizmeti alın.
                  </p>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 font-semibold">
                    <Link href="/iletisim?service=temizlik-danismanlik">
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
                Temizlik Ürünleri Fason Üretim Ürün Gruplarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Tüm temizlik ürünleri kategorilerinde uzman fason üretim
                hizmetleri ile markanızın ihtiyaçlarına cevap veriyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productGroups.map((group, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-2xl dark:hover:shadow-slate-700/50 transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-teal-600 dark:from-blue-600 dark:to-teal-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
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
                Temizlik Ürünleri Fason Üretim Sürecimiz
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                5 adımda profesyonel temizlik ürünleri fason üretim süreci ile
                kaliteli sonuçlar garantiliyoruz.
              </p>
            </div>

            <div className="relative">
              {/* Desktop Timeline */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-teal-600 dark:from-blue-400 dark:to-teal-500 rounded-full"></div>

              {/* Mobile Timeline */}
              <div className="lg:hidden absolute left-8 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-teal-600 dark:from-blue-400 dark:to-teal-500 rounded-full"></div>

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
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-600 dark:from-blue-400 dark:to-teal-500 rounded-full text-white font-bold text-lg shadow-lg flex-shrink-0">
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
                Temizlik Ürünleri Fason Üretim Kalite Sertifikalarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Uluslararası çevre ve kalite standartlarında fason üretim
                yapabilmek için gerekli tüm sertifikalara sahibiz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {certificates.map((cert, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-teal-200 dark:group-hover:from-blue-800 dark:group-hover:to-teal-800 transition-all duration-300">
                    <Shield className="h-12 w-12 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {cert.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-teal-700 dark:from-blue-700 dark:to-teal-800 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Temizlik Ürünleri Fason Üretim Çevre Politikamız
              </h3>
              <p className="text-blue-100 dark:text-blue-200 mb-6 max-w-3xl mx-auto leading-relaxed">
                Müşteri memnuniyetini en üst düzeyde tutarak, sürekli gelişim ve
                yenilik anlayışıyla çevre dostu ve sürdürülebilir temizlik
                ürünleri fason üretim yapmayı taahhüt ediyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-teal-600 to-blue-800 dark:from-blue-800 dark:via-teal-800 dark:to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-700/90 dark:from-blue-800/95 dark:to-teal-900/95"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
              Temizlik Ürünleri Fason Üretim Markanızı Hayata Geçirin
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 text-pretty leading-relaxed">
              Çevre dostu tesislerimizde profesyonel temizlik ürünleri fason
              üretim hizmetleri ile markanızı güçlendirin. Ücretsiz danışmanlık
              ve hızlı teklif için hemen iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link
                  href="/teklif"
                  className="flex items-center"
                >
                  Temizlik Ürünleri Fason Üretim Teklifi Al
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
                Temizlik Ürünleri Fason Üretim Teknik Kapasitelerimiz
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                5.000 m² çevre dostu tesiste, son teknoloji ekipmanlarla günlük 25.000 litre üretim kapasitesi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Factory className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Üretim Kapasitesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Günlük Kapasite:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">25.000 litre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Minimum Üretim:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">1.000 litre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Tesis Büyüklüğü:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">10.000 m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Üretim Hatları:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">6 adet</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-green-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Microscope className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Ar-Ge Laboratuvarı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Formülasyon Uzmanı:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">5 kişi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Test Ekipmanı:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">15+ cihaz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Numune Süresi:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">2-5 gün</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Revizyon:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Ücretsiz</span>
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
                      <span className="text-gray-600 dark:text-gray-300">Numune:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">2-5 gün</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Seri Üretim:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">10-20 gün</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Acil Üretim:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">5-8 gün</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Kargo:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">1-2 gün</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-teal-700 dark:from-blue-700 dark:to-teal-800 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Temizlik Ürünleri Fason Üretim Maliyet Avantajları</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-200" />
                      <span>%45'e varan maliyet tasarrufu</span>
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
                      <span>Çevre dostu üretim garantisi</span>
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

      {/* Temizlik Ürünleri Fason Üretim Uzmanlık Alanları */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Temizlik Ürünleri Fason Üretim Uzmanlık Alanlarımız
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Her temizlik ürünü kategorisinde derin uzmanlık ve çevre dostu üretim teknolojileri
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
                      Çevre Dostu Formülasyonlar
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Biyolojik parçalanabilir, fosfat içermeyen ve doğa dostu temizlik ürünü formülasyonları
                    </p>
                  </div>
                  <div className="border-l-4 border-teal-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Antibakteriyel Temizlik Ürünleri
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      %99.9 bakteri öldürücü, virüs etkili antibakteriyel el sabunu ve yüzey temizleyicileri
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Endüstriyel Güç Formülleri
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ağır hizmet tipi endüstriyel temizlik için özel güçlendirilmiş formülasyonlar
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
                      Soğuk Karışım Teknolojisi
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Enerji tasarruflu soğuk karışım ile çevre dostu üretim prosesleri
                    </p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Konsantre Üretim Teknolojisi
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Az su kullanımı ile yüksek konsantrasyonlu etkili temizlik ürünleri
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Mikroemülsiyon Teknolojisi
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Üstün temizlik performansı için mikroemülsiyon sistemi üretim teknolojisi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Temizlik Ürünleri Fason Üretim Kalite Kontrol Süreçleri
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Her üretim aşamasında 18+ kalite kontrol noktası ile %100 güvenli ve etkili ürünler
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
                    Gelen her hammaddenin kimyasal analizi ve çevre uyumluluğu testleri
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-teal-100 dark:bg-teal-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="h-8 w-8 text-teal-600 dark:text-teal-300" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Süreç İçi Kontrol
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Üretim sırasında pH, viskozite, köpürme ve temizlik etkinliği testleri
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-green-600 dark:text-green-300" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Nihai Ürün Testi
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Mikrobiyal güvenlik, biyolojik parçalanabilirlik ve performans testleri
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
                Temizlik Ürünleri Fason Üretim Hakkında Sıkça Sorulan Sorular
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Temizlik ürünleri fason üretim süreciyle ilgili merak ettiğiniz her şey
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Minimum temizlik ürünleri fason üretim miktarı nedir?",
                  answer: "Ürün tipine göre değişmekle birlikte, minimum 1.000 litre üretim yapabiliyoruz. Sıvı sabun ve deterjan ürünlerde 1.000 litre, konsantre ürünlerde 500 litre minimum üretim miktarımızdır."
                },
                {
                  question: "Temizlik ürünleri fason üretim süresi ne kadar?",
                  answer: "Numune onayından sonra seri üretime geçiş 10-20 gün arasında tamamlanır. Acil durumlar için 5-8 günde teslimat yapabiliyoruz. Formülasyon geliştirme süreci dahil olmak üzere toplam süre 15-25 gündür."
                },
                {
                  question: "Hangi çevre dostu sertifikalara sahipsiniz?",
                  answer: "ISO 14001 Çevre Yönetim Sistemi, Ekolabel, REACH uyumluluğu, GMP, biyolojik parçalanabilirlik sertifikalarına sahibiz. Ayrıca AB çevre standartlarında üretim kapasitemiz bulunmaktadır."
                },
                {
                  question: "Private label temizlik ürünleri üretimi yapıyor musunuz?",
                  answer: "Evet, private label temizlik ürünleri üretimi ana hizmetlerimizden biridir. Kendi markanız için formülasyon geliştirme, ambalaj tasarımı, etiket tasarımı dahil olmak üzere A'dan Z'ye hizmet veriyoruz."
                },
                {
                  question: "Temizlik ürünleri fason üretim maliyeti nasıl hesaplanır?",
                  answer: "Maliyet; ürün tipi, formülasyon karmaşıklığı, ambalaj türü, üretim miktarı ve hammadde kalitesine göre belirlenir. Çevre dostu formülasyonlar, antibakteriyel ürünler ve endüstriyel temizlik ürünleri için farklı fiyatlandırma uygulanır."
                },
                {
                  question: "Organik ve doğal temizlik ürünleri üretimi yapabiliyor musunuz?",
                  answer: "Evet, sertifikalı organik ve doğal ham maddeler kullanarak ekolojik temizlik ürünleri üretimi yapıyoruz. Biyolojik parçalanabilir formülasyonlar ve çevre dostu üretim prosesleri konusunda uzmanlığımız bulunmaktadır."
                },
                {
                  question: "Temizlik ürünleri fason üretimde kalite garantisi var mı?",
                  answer: "Tüm ürünlerimiz için ISO 14001 ve GMP standartlarında kalite garantisi veriyoruz. Üretim sürecinde 18+ kalite kontrol noktası bulunmaktadır ve nihai ürünler için tam analiz raporu sunuyoruz."
                },
                {
                  question: "İhracat için temizlik ürünleri üretimi yapıyor musunuz?",
                  answer: "Evet, ihracat standartlarında temizlik ürünleri üretimi yapıyoruz. AB, ABD, Orta Doğu ülkeleri için gerekli çevre ve kalite sertifikasyonu desteği sağlıyoruz."
                }
              ].map((faq, index) => (
                <Card key={index} className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800">
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
              <Button className="bg-gradient-to-r from-blue-600 to-teal-700 hover:from-blue-700 hover:to-teal-800 text-white font-semibold px-8 py-3">
                <Link href="/teklif">
                  Başka Sorularınız İçin İletişime Geçin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Temizlik Ürünleri Fason Üretim Başarı Hikayeleri */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Temizlik Ürünleri Fason Üretim Başarı Hikayeleri
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                60+ temizlik ürünleri markasının başarı hikayesine ortak olduk
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-blue-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Ekolojik Temizlik Markası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    6 ay içinde 20+ çevre dostu ürün geliştirerek organik temizlik pazarında lider konuma geldi.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Ekolojik Temizlik</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Üretim Süresi:</span>
                    <span className="font-semibold">15 ay</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-green-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Endüstriyel Temizlik Markası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Ağır hizmet tipi endüstriyel formülasyonları ile Avrupa pazarına başarılı giriş ve 8 ülkeye ihracat.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Endüstriyel Temizlik</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">İhracat Ülkesi:</span>
                    <span className="font-semibold">8 Ülke</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:shadow-slate-800/50 bg-white dark:bg-slate-800 text-center">
                <CardHeader>
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Antibakteriyel Sabun Markası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Pandemi döneminde antibakteriyel ürün serisi ile hijyen pazarında güçlü konum elde etti.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ürün Kategorisi:</span>
                    <span className="font-semibold">Antibakteriyel</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Satış Artışı:</span>
                    <span className="font-semibold">%250</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-teal-700 dark:from-blue-700 dark:to-teal-800 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Siz de Başarı Hikayenizi Yazın
              </h3>
              <p className="text-blue-100 dark:text-blue-200 mb-6 max-w-2xl mx-auto">
                Temizlik ürünleri fason üretim hizmetlerimizle markanızı büyütün ve pazarda fark yaratın.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 font-semibold px-8 py-3">
                <Link href="/teklif">
                  Projenizi Başlatalım
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
