import { TabsContent } from "@/components/ui/tabs";
import { TabsTrigger } from "@/components/ui/tabs";
import { TabsList } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Beaker,
  Pill,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Award,
  Cog,
  FlaskConical,
  Package,
  Shield,
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
import FacilityBanner from "@/components/facility-banner";

export const metadata = {
  title:
    "Fason Üretim Hizmetleri | GMP Sertifikalı Kozmetik, Gıda Takviyesi ve Temizlik Ürünleri Üretimi | MKNGROUP",
  description:
    "Türkiye'nin önde gelen fason üretim firması MKNGROUP ile GMP sertifikalı tesislerde kozmetik, gıda takviyesi ve temizlik ürünleri fason üretimi. 6+ yıllık deneyim, 10.600m² üretim alanı, 1000+ başarılı proje. OEM/ODM hizmetleri, private label üretim ve contract manufacturing çözümleri.",
  keywords:
    "fason üretim, kozmetik fason üretim, gıda takviyesi üretim, temizlik ürünleri fason üretim, GMP sertifikalı üretim, OEM ODM üretim, contract manufacturing, fason üretim firması, kozmetik üretim hizmetleri, private label üretim, fason üretici, İstanbul fason üretim, şampuan fason üretim, krem fason üretim, serum fason üretim, tablet fason üretim, kapsül fason üretim, sıvı sabun fason üretim, deterjan fason üretim, yüzey temizleyici fason üretim, ISO 22716, HACCP sertifikalı, Türkiye fason üretim, mevzuat uyumlu üretim",
  alternates: {
    canonical: "https://mkngroup.com.tr/fason-uretim",
  },
  openGraph: {
    title:
      "Fason Üretim Hizmetleri | GMP Sertifikalı Kozmetik & Gıda Takviyesi Üretimi | MKNGROUP",
    description:
      "Türkiye'nin lider fason üretim firması MKNGROUP. GMP sertifikalı tesislerde kozmetik, gıda takviyesi ve temizlik ürünleri fason üretimi. 6+ yıllık deneyim, 10.600m² üretim alanı, 1000+ başarılı proje. OEM/ODM ve private label hizmetleri.",
    url: "https://mkngroup.com.tr/fason-uretim",
    siteName: "MKNGROUP",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://mkngroup.com.tr/optimized/modern-manufacturing-facility-with-advanced-equipm.webp",
        width: 1200,
        height: 630,
        alt: "MKNGROUP GMP Sertifikalı Fason Üretim Tesisi - Modern Üretim Hatları",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fason Üretim Hizmetleri | GMP Sertifikalı Üretim | MKNGROUP",
    description:
      "GMP sertifikalı tesislerde kozmetik, gıda takviyesi ve temizlik ürünleri fason üretimi. 6+ yıllık deneyim, 1000+ başarılı proje.",
    images: [
      "https://mkngroup.com.tr/optimized/modern-manufacturing-facility-with-advanced-equipm.webp",
    ],
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

export default function FasonUretimPage() {
  const serviceData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Fason Üretim Hizmetleri - Kozmetik, Gıda Takviyesi ve Temizlik Ürünleri",
    description:
      "Kozmetik, gıda takviyesi ve temizlik ürünleri için profesyonel fason üretim çözümleri. Formülasyondan ambalajlamaya kadar tüm süreçleri GMP sertifikalı tesislerimizde yönetiyoruz. OEM/ODM, private label ve contract manufacturing hizmetleri.",
    serviceType: "Contract Manufacturing",
    category: [
      "Fason Üretim",
      "Contract Manufacturing",
      "Private Label Üretim",
      "OEM ODM Hizmetleri",
    ],
    provider: {
      "@type": "Organization",
      name: "MKNGROUP",
      url: "https://mkngroup.com.tr",
      address: {
        "@type": "PostalAddress",
        addressLocality: "İstanbul",
        addressCountry: "Turkey",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "500",
        bestRating: "5",
        worstRating: "1",
      },
    },
    areaServed: {
      "@type": "Country",
      name: "Turkey",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Fason Üretim Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Kozmetik Fason Üretim",
            description:
              "Krem, serum, şampuan ve kozmetik ürünlerin GMP sertifikalı fason üretimi",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Gıda Takviyesi Fason Üretim",
            description:
              "Kapsül, tablet ve sıvı formda gıda takviyesi fason üretimi",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Temizlik Ürünleri Fason Üretim",
            description:
              "Sıvı sabun, deterjan ve temizlik ürünleri fason üretimi",
          },
        },
      ],
    },
    makesOffer: {
      "@type": "Offer",
      name: "Ücretsiz Fason Üretim Danışmanlığı",
      description:
        "Uzman ekibimizden fason üretim süreçleri hakkında ücretsiz danışmanlık",
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
  ];

  const kozmetikFeatures = [
    "Krem, serum, şampuan formülasyonu",
    "GMP sertifikalı üretim",
    "Hızlı numune geliştirme",
    "ISO 22716 kalite standardı",
  ];

  const gidaFeatures = [
    "Kapsül, tablet, sıvı formlar",
    "Çeşitli ambalaj seçenekleri",
    "Mevzuat uyumluluk desteği",
    "HACCP gıda güvenliği",
  ];

  const temizlikFeatures = [
    "Sıvı sabun, deterjan üretimi",
    "Yüzey temizleyici formülasyonu",
    "Endüstriyel temizlik çözümleri",
    "Çevre dostu formülasyon",
  ];

  const productionAreas = [
    {
      title: "Kozmetik Fason Üretim",
      description:
        "Krem, serum, şampuan ve kozmetik ürünlerin GMP sertifikalı fason üretimi",
      icon: Beaker,
      link: "/fason-uretim/kozmetik-fason-uretim",
      features: [
        "Özel Formülasyon Ar-Ge",
        "GMP Sertifikalı Tesis",
        "Hızlı Numune Geliştirme",
        "Private Label Üretim",
      ],
    },
    {
      title: "Gıda Takviyesi Fason Üretim",
      description: "Kapsül, tablet ve sıvı formda gıda takviyesi fason üretimi",
      icon: Pill,
      link: "/fason-uretim/gida-takviyesi-fason-uretim",
      features: [
        "Çeşitli Form Seçenekleri",
        "Mevzuat Uyumluluk Desteği",
        "Kalite Güvencesi",
        "HACCP Sertifikalı Üretim",
      ],
    },
    {
      title: "Temizlik Ürünleri Fason Üretim",
      description: "Sıvı sabun, deterjan ve temizlik ürünleri fason üretimi",
      icon: Sparkles,
      link: "/fason-uretim/temizlik-urunleri-fason-uretim",
      features: [
        "Çevre Dostu Formülasyon",
        "Endüstriyel Çözümler",
        "Özel Ambalajlama Hizmetleri",
        "Büyük Kapasite Üretim",
      ],
    },
  ];

  const productionProcess = [
    {
      step: "01",
      title: "Ar-Ge & Formülasyon",
      description:
        "Müşteri ihtiyaçlarına özel fason üretim formül geliştirme ve optimizasyon çalışmaları",
    },
    {
      step: "02",
      title: "Numune Geliştirme",
      description:
        "Hızlı prototip üretimi ve müşteri onayı için fason üretim numune hazırlama",
    },
    {
      step: "03",
      title: "Kalite Sertifikasyonu",
      description:
        "GMP standartlarında kalite kontrol testleri ve fason üretim sertifikasyon süreçleri",
    },
    {
      step: "04",
      title: "Seri Fason Üretim",
      description:
        "Modern üretim hatlarında yüksek kapasiteli ve kaliteli seri fason üretim",
    },
    {
      step: "05",
      title: "Ambalajlama & Teslimat",
      description:
        "Otomatik ambalajlama sistemleri ile paketleme ve lojistik desteği",
    },
  ];

  const faqData = [
    {
      question: "Fason üretim nedir ve hangi avantajları sağlar?",
      answer:
        "Fason üretim, markaların kendi ürünlerini üretim tesisine sahip olmadan ürettirmesi hizmetidir. MKNGROUP'ta GMP sertifikalı tesislerimizde kozmetik, gıda takviyesi ve temizlik ürünleri fason üretimi yapıyoruz. Bu sayede yatırım maliyetlerini düşürür, kaliteli üretim alır ve hızla pazara çıkabilirsiniz.",
    },
    {
      question: "GMP sertifikalı fason üretim neden önemlidir?",
      answer:
        "GMP (İyi Üretim Uygulamaları) sertifikası, üretimin uluslararası kalite standartlarında yapıldığını garanti eder. MKNGROUP'un GMP sertifikalı tesislerinde üretilen ürünler, hem yerel hem de uluslararası pazarlarda kabul görür ve kalite güvencesi sunar.",
    },
    {
      question: "Hangi ürünlerin fason üretimini yapıyorsunuz?",
      answer:
        "Kozmetik fason üretim (krem, serum, şampuan), gıda takviyesi fason üretim (kapsül, tablet, sıvı formlar) ve temizlik ürünleri fason üretimi (sıvı sabun, deterjan, yüzey temizleyici) konularında hizmet veriyoruz.",
    },
    {
      question: "Fason üretim sürecinde numune geliştirme ne kadar sürer?",
      answer:
        "MKNGROUP'ta hızlı numune geliştirme sürecimiz sayesinde 7 gün içinde fason üretim numunesi hazırlayıp müşteri onayına sunuyoruz. Bu süreç, formülasyon geliştirme ve kalite kontrol testlerini içerir.",
    },
    {
      question: "Private label fason üretim hizmeti nedir?",
      answer:
        "Private label fason üretim, kendi markanız altında ürün üretimi yapmanızı sağlar. MKNGROUP olarak formülasyondan ambalajlamaya kadar tüm süreçleri yönetir, markanızın etiketiyle ürünlerinizi hazırlayıp teslim ederiz.",
    },
    {
      question: "Minimum fason üretim miktarları nelerdir?",
      answer:
        "Fason üretim minimum miktarları ürün tipine göre değişiklik gösterir. Kozmetik fason üretimde 1000 adet, gıda takviyesi fason üretimde 5000 adet, temizlik ürünleri fason üretimde 2000 adet minimum sipariş miktarlarımız mevcuttur.",
    },
  ];

  const certificates = [
    { name: "GMP Sertifikası", description: "İyi Üretim Uygulamaları" },
    { name: "ISO 22716", description: "Kozmetik Kalite Yönetimi" },
    { name: "ISO 9001", description: "Kalite Yönetim Sistemi" },
    { name: "HACCP", description: "Gıda Güvenliği Sistemi" },
  ];

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceData),
        }}
      />
      <ServiceSchema service={serviceData} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90"></div>
        <div
          className="absolute inset-0 bg-[url('/optimized/modern-manufacturing-facility-with-advanced-equipm.webp')] bg-cover bg-center opacity-20"
          aria-hidden="true"
          role="img"
          aria-label="MKNGROUP GMP Sertifikalı Modern Fason Üretim Tesisi"
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300">
              Türkiye'nin Lider Fason Üretim Firması
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance animate-fade-in">
              GMP Sertifikalı Fason Üretim Hizmetleri
            </h1>
            <p className="text-xl text-blue-100 mb-8 text-pretty leading-relaxed">
              6+ yıllık deneyimimiz ile <strong>kozmetik fason üretim</strong>,{" "}
              <strong>gıda takviyesi üretim</strong> ve{" "}
              <strong>temizlik ürünleri fason üretiminde</strong> Türkiye'nin
              önde gelen firması. GMP sertifikalı 10.600m² tesislerimizde
              OEM/ODM hizmetleri ile markanızı güçlendirin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 transition-all duration-300 transform hover:scale-105"
              >
                <Link
                  href="/teklif"
                  className="flex items-center"
                  title="Teklif Al - MKNGROUP"
                >
                  Teklif Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 transition-all duration-300 bg-transparent"
              >
                <Link
                  href="/tesisler"
                  title="MKNGROUP Üretim Tesisleri - GMP Sertifikalı Fason Üretim"
                >
                  Üretim Tesislerimizi İncele
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Türkiye'nin En Güvenilir Fason Üretim Partneri
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                6+ yıllık deneyimimiz ve{" "}
                <strong>GMP sertifikalı üretim tesislerimizle</strong> kozmetik
                fason üretim, gıda takviyesi üretim ve temizlik ürünleri fason
                üretiminde sektörün lideri konumundayız.{" "}
                <strong>Contract manufacturing</strong> ve{" "}
                <strong>private label üretim</strong> çözümlerimizle markanızı
                güçlendirin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center group">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-300">
                  <Cog className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  50,000m²
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  GMP Sertifikalı Fason Üretim Tesisi Alanı
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors duration-300">
                  <FlaskConical className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  1000+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Başarılı Fason Üretim Projesi
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-300">
                  <Award className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  15+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Uluslararası Kalite Sertifikası
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-orange-100 dark:bg-orange-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors duration-300">
                  <Package className="h-8 w-8 text-orange-600 dark:text-orange-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  500+
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Memnun Fason Üretim Müşterisi
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Neden MKNGROUP Fason Üretim Tercihi?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          GMP Sertifikalı Fason Üretim Tesisi
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          İyi Üretim Uygulamaları standartlarında kaliteli{" "}
                          <strong>contract manufacturing</strong> hizmetleri
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          OEM/ODM Fason Üretim Hizmetleri
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Kendi markanız için özel{" "}
                          <strong>private label fason üretim</strong> ve tasarım
                          desteği
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          Hızlı Numune Geliştirme
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          7 gün içinde fason üretim numune hazırlama ve onay
                          süreci
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          Esnek Fason Üretim Kapasitesi
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          Küçük partilerden büyük siparişlere kadar esnek fason
                          üretim çözümleri
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                    <h4 className="text-2xl font-bold mb-4">
                      Ücretsiz Fason Üretim Danışmanlığı
                    </h4>
                    <p className="mb-6">
                      Uzman ekibimizden fason üretim süreçleri hakkında ücretsiz
                      danışmanlık alın.
                    </p>
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                      <Link
                        href="/iletisim?service=fason-uretim-danismanlik"
                        title="Ücretsiz Fason Üretim Danışmanlığı - MKNGROUP"
                      >
                        Hemen Başla
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Fason Üretim Sektörleri & Uzmanlaştığımız Alanlar
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Farklı sektörlerde uzmanlaşmış{" "}
                <strong>fason üretim hatlarımızla</strong> her türlü
                ihtiyacınıza cevap veriyoruz.{" "}
                <strong>Contract manufacturing</strong> çözümlerimizle markanızı
                büyütün.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {productionAreas.map((area, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-white dark:bg-slate-800"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <area.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {area.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {area.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-6">
                      {area.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full group-hover:bg-blue-600 transition-colors duration-300"
                      asChild
                    >
                      <Link
                        href={area.link}
                        className="flex items-center justify-center"
                        title={`${area.title} Detayları - MKNGROUP`}
                      >
                        Detayları İncele
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facility Banner Component */}
      <FacilityBanner />

      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                5 Adımda Profesyonel Fason Üretim Süreci
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                5 adımda profesyonel <strong>contract manufacturing</strong>{" "}
                süreci ile kaliteli sonuçlar garantiliyoruz.{" "}
                <strong>Private label fason üretimden</strong> seri üretime
                kadar tüm aşamalarda yanınızdayız.
              </p>
            </div>

            <div className="relative">
              {/* Desktop Timeline */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>

              {/* Mobile Timeline */}
              <div className="lg:hidden absolute left-8 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>

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
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          {process.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {process.description}
                        </p>
                      </div>
                    </div>

                    {/* Step Number */}
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-bold text-lg shadow-lg flex-shrink-0">
                      {process.step}
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden flex-1 ml-6">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
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

      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Fason Üretim Kalite Sertifikaları & Güvencesi
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Uluslararası kalite standartlarında{" "}
                <strong>GMP sertifikalı fason üretim</strong> yapabilmek için
                gerekli tüm sertifikalara sahibiz. <strong>ISO 22716</strong>,{" "}
                <strong>HACCP</strong> ve diğer kalite belgelerimiz ile
                güvenilir üretim garantisi sunuyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {certificates.map((cert, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-purple-200 dark:group-hover:from-blue-800 dark:group-hover:to-purple-800 transition-all duration-300">
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

            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Fason Üretim Kalite Politikamız
              </h3>
              <p className="text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
                Müşteri memnuniyetini en üst düzeyde tutarak, sürekli gelişim ve
                yenilik anlayışıyla uluslararası kalite standartlarında{" "}
                <strong>fason üretim</strong> yapmayı taahhüt ediyoruz.{" "}
                <strong>GMP sertifikalı tesislerimizde</strong> kalite güvencesi
                ile üretim yapıyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
              Fason Üretim Projenizi Başlatın
            </h2>
            <p className="text-xl text-blue-100 mb-8 text-pretty leading-relaxed">
              <strong>GMP sertifikalı tesislerimizde</strong> profesyonel{" "}
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
                  href="/teklif"
                  className="flex items-center"
                  title="Teklif Al - MKNGROUP"
                >
                  Teklif Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg transition-all duration-300 bg-transparent"
              >
                <Link href="/tesisler" title="MKNGROUP Üretim Tesisleri Gezisi">
                  Üretim Tesislerimizi Gez
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="kozmetik" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-12 bg-white dark:bg-slate-700 border dark:border-slate-600 h-auto">
              <TabsTrigger
                value="kozmetik"
                className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 text-sm md:text-base py-3 md:py-2"
              >
                <Beaker className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Kozmetik Fason Üretim</span>
              </TabsTrigger>
              <TabsTrigger
                value="gida"
                className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 text-sm md:text-base py-3 md:py-2"
              >
                <Pill className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Gıda Takviyesi Fason Üretim</span>
              </TabsTrigger>
              <TabsTrigger
                value="temizlik"
                className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 text-sm md:text-base py-3 md:py-2"
              >
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Temizlik Ürünleri Fason Üretim</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="kozmetik"
              className="space-y-8 bg-white dark:bg-slate-700 rounded-lg p-4 md:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-gray-100">
                    Kozmetik Fason Üretim & Private Label Hizmetleri
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                    <strong>Krem fason üretim</strong>,{" "}
                    <strong>serum fason üretim</strong>,{" "}
                    <strong>şampuan fason üretim</strong> ve diğer kozmetik
                    ürünlerin fason üretiminde uzman ekibimizle kaliteli ve
                    güvenilir çözümler sunuyoruz.{" "}
                    <strong>GMP sertifikalı tesislerimizde</strong> en yüksek
                    kalite standartlarında{" "}
                    <strong>kozmetik fason üretim</strong> gerçekleştiriyoruz.
                  </p>

                  <div className="space-y-3 mb-6 md:mb-8">
                    {kozmetikFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button size="lg" asChild className="w-full sm:w-auto">
                    <Link href="/teklif" title="Teklif Al - MKNGROUP">
                      Teklif Alın
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 order-1 lg:order-2">
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Formülasyon
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Özel formül geliştirme ve mevcut formüllerin
                        optimizasyonu
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Kalite Kontrol
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Mikrobiyolojik testler ve stabilite analizleri
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Ambalajlama
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Otomatik dolum hatları ve etiketleme sistemleri
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Sertifikasyon
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        GMP, ISO 22716 ve diğer kalite sertifikaları
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="gida"
              className="space-y-8 bg-white dark:bg-slate-700 rounded-lg p-4 md:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-gray-100">
                    Gıda Takviyesi Fason Üretim & Contract Manufacturing
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                    <strong>Kapsül fason üretim</strong>,{" "}
                    <strong>tablet fason üretim</strong> ve sıvı formda gıda
                    takviyesi fason üretimi. <strong>HACCP sertifikalı</strong>{" "}
                    üretim süreçlerimizde mevzuat uyumluluğu ve kalite güvencesi
                    ile desteklenen fason üretim hizmetleri sunuyoruz.
                  </p>

                  <div className="space-y-3 mb-6 md:mb-8">
                    {gidaFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button size="lg" asChild className="w-full sm:w-auto">
                    <Link href="/teklif" title="Teklif Al - MKNGROUP">
                      Teklif Alın
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 order-1 lg:order-2">
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Kapsül Fason Üretim
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Sert ve yumuşak kapsül üretim teknolojileri
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Tablet Fason Üretim
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Çiğnenebilir ve yutulabilir tablet formları
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Sıvı Form Fason Üretim
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Şurup, damla ve içecek formunda takviyeler
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Mevzuat Desteği
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Tarım Bakanlığı onay süreçleri ve etiketleme
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="temizlik"
              className="space-y-8 bg-white dark:bg-slate-700 rounded-lg p-4 md:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-gray-100">
                    Temizlik & Bakım Ürünleri Fason Üretim
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                    <strong>Sıvı sabun fason üretim</strong>,{" "}
                    <strong>deterjan fason üretim</strong>,{" "}
                    <strong>yüzey temizleyici fason üretim</strong> ve
                    endüstriyel temizlik ürünleri fason üretimi. Çevre dostu
                    formülasyonlar ve etkili temizlik çözümleri sunuyoruz.
                  </p>

                  <div className="space-y-3 mb-6 md:mb-8">
                    {temizlikFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button size="lg" asChild className="w-full sm:w-auto">
                    <Link href="/teklif" title="Teklif Al - MKNGROUP">
                      Teklif Alın
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 order-1 lg:order-2">
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Sıvı Sabun Fason Üretim
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        El, vücut ve genel temizlik sabunları
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Deterjan Fason Üretim
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Çamaşır ve bulaşık deterjanları
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Yüzey Temizleyici Fason Üretim
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Mutfak, banyo ve genel yüzey temizleyicileri
                      </CardDescription>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 dark:bg-slate-600 border dark:border-slate-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                        Endüstriyel Fason Üretim
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                        Ağır hizmet tipi temizlik ve bakım ürünleri
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Sıkça Sorulan Sorular - Fason Üretim
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Fason üretim hizmetlerimiz hakkında merak ettiğiniz soruların
                cevapları
              </p>
            </div>

            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <summary className="flex w-full items-center justify-between p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 list-none">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>

            {/* FAQ Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqData.map((faq) => ({
                    "@type": "Question",
                    name: faq.question,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: faq.answer,
                    },
                  })),
                }),
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
