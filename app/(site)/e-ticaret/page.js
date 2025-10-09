import Link from "next/link";
import Image from "next/image";
import {
  Warehouse,
  Truck,
  BarChart3,
  Settings,
  CheckCircle,
  Package,
  Shield,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ServiceSchema, BreadcrumbSchema } from "@/components/structured-data";

export const metadata = {
  title: "E-ticaret Operasyon & Fulfillment Hizmetleri | MKNGROUP",
  description:
    "E-ticaret operasyon hizmetleri, depo yönetimi, sipariş fulfillment, stok takibi ve kargo entegrasyonu. İstanbul'da WMS uyumlu 3PL hizmetleri ile aylık 50K+ sipariş kapasitesi.",
  keywords: [
    "e-ticaret operasyon hizmeti",
    "e-ticaret fulfillment",
    "3PL hizmetleri",
    "depo yönetim sistemi",
    "WMS entegrasyonu",
    "kargo entegrasyonu",
    "sipariş hazırlama",
    "stok yönetimi",
    "İstanbul e-ticaret hizmeti",
    "e-ticaret lojistik",
    "online satış operasyon çözümleri",
    "dropshipping alternatifi",
    "fulfillment merkezi",
  ].join(", "),
  openGraph: {
    title: "E-ticaret Operasyon & Fulfillment Hizmetleri - MKNGROUP",
    description:
      "İstanbul'da profesyonel e-ticaret operasyon hizmetleri. E-ticaret işletmeleri için sipariş fulfillment, stok yönetimi ve kargo entegrasyonu.",
    url: "https://www.mkngroup.com.tr/e-ticaret",
    siteName: "MKN GROUP",
    images: [
      {
        url: "https://www.mkngroup.com.tr/e-ticaret-og.jpg",
        width: 1200,
        height: 630,
        alt: "MKNGROUP E-ticaret Operasyon Hizmetleri",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-ticaret Operasyon Hizmetleri | MKNGROUP",
    description:
      "Profesyonel 3PL depo hizmetleri ile e-ticaret operasyonlarınızı optimize edin.",
    images: ["https://www.mkngroup.com.tr/e-ticaret-og.jpg"],
  },
  alternates: {
    canonical: "https://www.mkngroup.com.tr/e-ticaret",
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

export default function EticaretPage() {
  const serviceData = {
    name: "E-ticaret Operasyon & Fulfillment Hizmetleri",
    description:
      "İstanbul'da profesyonel e-ticaret operasyon hizmetleri. E-ticaret işletmeleri için sipariş fulfillment, stok yönetimi, WMS entegrasyonu ve kargo optimizasyonu. Aylık 50K+ sipariş kapasitesi ile %40 maliyet tasarrufu.",
    type: "E-commerce Operations Service",
    category: "E-commerce Fulfillment",
    provider: {
      name: "MKN GROUP",
      address: "Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul, Türkiye",
      telephone: "+905314942594",
      email: "info@mkngroup.com.tr",
    },
    areaServed: "Turkey",
    availableLanguage: "Turkish",
    serviceType: "E-commerce Fulfillment",
    offers: {
      price: "Competitive pricing starting from ₺3/m² monthly",
      priceCurrency: "TRY",
      availability: "InStock",
      validFrom: new Date().toISOString(),
    },
  };

  const breadcrumbItems = [
    {
      name: "Ana Sayfa",
      url: "https://www.mkngroup.com.tr",
    },
    {
      name: "E-ticaret Operasyon",
      url: "https://www.mkngroup.com.tr/e-ticaret",
    },
  ];

  const services = [
    {
      icon: Warehouse,
      image: "/optimized/cargo-stock.webp",
      title: "3PL Depo Yönetimi & Stok Takibi",
      description:
        "İstanbul'daki modern tesislerimizde ürünlerinizi güvenli şekilde saklıyor, WMS (Warehouse Management System) ile gerçek zamanlı stok takibi sağlıyoruz. E-ticaret platformunuzla API entegrasyonu ile otomatik stok güncelleme yapıyoruz.",
      features: [
        "WMS sistemi ile gerçek zamanlı stok takibi",
        "E-ticaret platform entegrasyonu (Ticimax, İdeasoft, Shopify)",
        "FIFO stok rotasyonu ve son kullanma tarihi takibi",
        "Barkod/QR kod tabanlı ürün takip sistemi",
        "Sıcaklık kontrollü depolama alanları",
        "Otomatik minimum stok uyarı sistemi",
        "Günlük stok raporlama ve analiz",
      ],
      price: "₺3-8/m² aylık",
      capacity: "10.000 m² depo alanı",
    },
    {
      icon: Package,
      image: "/optimized/order-packaging.webp",
      title: "Sipariş Fulfillment & Paketleme",
      description:
        "E-ticaret siparişlerinizi 24 saat içinde hazırlıyor, markanıza özel paketleme ile müşteri deneyimini üst seviyeye çıkarıyoruz. Özel günler için hediye paketleme ve promosyon ürünü ekleme hizmetleri sunuyoruz.",
      features: [
        "24 saat içinde sipariş hazırlama garantisi",
        "Markanıza özel ambalaj tasarımı ve uygulama",
        "Hediye paketleme ve promosyon ürünü ekleme",
        "Multi-channel sipariş yönetimi",
        "Kalite kontrol ve fotoğraflı onay sistemi",
        "Toplu sipariş işleme kapasitesi",
        "B2B ve B2C sipariş desteği",
      ],
      price: "₺8-15/sipariş",
      capacity: "2.000 sipariş/gün",
    },
    {
      icon: Truck,
      image: "/optimized/cargo-delivery.webp",
      title: "Kargo Entegrasyonu & Maliyet Optimizasyonu",
      description:
        "15+ kargo firması ile entegre sistemimiz sayesinde siparişleriniz için en uygun ve ekonomik kargo seçeneklerini otomatik olarak belirliyoruz. Kargo maliyetlerinizi %30'a kadar düşürüyoruz.",
      features: [
        "15+ kargo firması ile otomatik entegrasyon",
        "AI destekli en uygun kargo seçimi",
        "Toplu kargo anlaşmaları ile %30 maliyet avantajı",
        "Gerçek zamanlı kargo takip sistemi",
        "SLA garantili teslimat süreleri",
        "Kargo sigorta ve hasar takibi",
        "Detaylı kargo maliyet analizi",
      ],
      price: "Kargo + ₺2-4 handling",
      capacity: "50.000 kargo/ay",
    },
    {
      icon: Settings,
      image: "/optimized/return-management.webp",
      title: "İade Yönetimi & Müşteri Hizmetleri",
      description:
        "E-ticaret'te kritik olan iade süreçlerinizi profesyonel şekilde yönetiyoruz. İade gelen ürünlerin kalite kontrolünü yapıyor, yeniden satılabilir olanları stoka dahil ediyoruz. Müşteri memnuniyetini koruyarak iade maliyetlerinizi minimize ediyoruz.",
      features: [
        "7 gün içinde iade işleme garantisi",
        "Ürün kalite kontrolü ve kategorilendirme",
        "İade sebep analizi ve raporlama",
        "Müşteri iletişimi ve bilgilendirme",
        "Yeniden satılabilir ürün stoka alma",
        "İade maliyet optimizasyonu",
        "İade trend analizi ve öneriler",
      ],
      price: "₺10-20/iade",
      capacity: "500 iade/gün",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      image: "/speed-efficiency.svg",
      title: "Hız ve Verimlilik",
      description:
        "Siparişlerinizi aynı gün işleme alıyor, 24 saat içinde kargoya teslim ediyoruz.",
    },
    {
      icon: Shield,
      image: "/security-reliability.svg",
      title: "Güvenilirlik",
      description:
        "ISO sertifikalı süreçlerimiz ve deneyimli ekibimizle %99.5 doğruluk oranı sağlıyoruz.",
    },
    {
      icon: Target,
      image: "/cost-optimization.svg",
      title: "Maliyet Optimizasyonu",
      description:
        "Operasyonel maliyetlerinizi %30'a kadar azaltarak karlılığınızı artırıyoruz.",
    },
    {
      icon: BarChart3,
      image: "/end-to-end-management.svg",
      title: "Uçtan Uca Yönetim",
      description:
        "Depolamadan teslimata kadar tüm süreçleri tek noktadan yönetiyoruz.",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Sipariş Alımı",
      description:
        "E-ticaret platformunuzdan gelen siparişler otomatik olarak sistemimize aktarılır.",
    },
    {
      step: "02",
      title: "Stok Kontrolü",
      description: "Gerçek zamanlı stok kontrolü yapılır ve sipariş onaylanır.",
    },
    {
      step: "03",
      title: "Sipariş Hazırlama",
      description:
        "Profesyonel ekibimiz siparişi hızlı ve hatasız şekilde hazırlar.",
    },
    {
      step: "04",
      title: "Kalite Kontrol",
      description: "Paketleme öncesi son kalite kontrolü yapılır ve onaylanır.",
    },
    {
      step: "05",
      title: "Paketleme & Etiketleme",
      description:
        "Ürünler profesyonel şekilde paketlenir ve kargo etiketi yapıştırılır.",
    },
    {
      step: "06",
      title: "Kargo Teslimi",
      description:
        "En uygun kargo firması seçilerek ürün teslim edilir ve takip numarası paylaşılır.",
    },
  ];

  const faqItems = [
    {
      question: "E-ticaret platformumla nasıl entegrasyon sağlanıyor?",
      answer:
        "Ticimax, İdeasoft, Shopify, WooCommerce, Magento gibi tüm popüler e-ticaret platformları ile API entegrasyonu sağlıyoruz. Siparişler otomatik olarak sistemimize aktarılır, stok güncellemeleri gerçek zamanlı yapılır. Entegrasyon süreci 2-3 iş günü sürer.",
    },
    {
      question: "Minimum sipariş hacmi ve sözleşme süresi nedir?",
      answer:
        "Aylık minimum 200 sipariş hacmi ile çalışmaya başlıyoruz. Sözleşme süresi 6 ay olup, daha sonra 1 aylık bildirimle çıkış yapabilirsiniz. Daha düşük hacimler için özel fiyatlandırma yapılabilir.",
    },
    {
      question: "Depo yönetim sistemi (WMS) nasıl çalışıyor?",
      answer:
        "Modern WMS sistemimiz ile ürünlerinizin giriş-çıkış hareketleri, stok seviyeleri, son kullanma tarihleri gerçek zamanlı takip edilir. Size özel dashboard ile 7/24 stok durumunuzu görüntüleyebilir, raporlara erişebilirsiniz.",
    },
    {
      question: "Hangi kargo firmalarıyla çalışıyorsunuz?",
      answer:
        "PTT, MNG, Yurtiçi, Aras, UPS, Sürat, HepsiJet ve 10+ kargo firması ile anlaşmalıyız. Sistemimiz otomatik olarak en uygun kargo şirketini seçer, bu sayede %30'a kadar kargo maliyeti tasarrufu sağlarız.",
    },
    {
      question: "İade süreçleri nasıl yönetiliyor?",
      answer:
        "İade gelen ürünler 48 saat içinde işleme alınır, kalite kontrolden geçirilir ve durumu size bildirilir. Yeniden satılabilir ürünler stoka dahil edilir, kusurlu ürünler ayrı kategoride listelenir. Tüm süreç size raporlanır.",
    },
    {
      question: "Özel ambalaj ve marka kimliği uygulaması yapılıyor mu?",
      answer:
        "Evet, markanıza özel ambalaj tasarımı, logo baskısı, promosyon broşürü ekleme gibi hizmetler sunuyoruz. Hediye paketleme, özel günler için temalar ve marka deneyimini güçlendiren ek hizmetler mevcuttur.",
    },
    {
      question: "Fiyatlandırma nasıl hesaplanıyor?",
      answer:
        "Fiyatlandırma depo alanı (m²), sipariş sayısı, kargo handling ve ek hizmetler bazında hesaplanır. Sabit aylık maliyet yerine, kullandığınız kadar ödersiniz. Hacim artışında indirimli fiyatlandırma uygulanır.",
    },
    {
      question: "Kapasite artışında nasıl destek sağlanıyor?",
      answer:
        "Sezonsal dönemler veya büyüme durumlarında esnek kapasite sağlıyoruz. Ek personel ve alan tahsisi ile günlük 5.000 siparişe kadar çıkabiliyoruz. Önceden bildirim ile kapasite planlaması yapıyoruz.",
    },
  ];

  return (
    <div className="min-h-screen">
      <ServiceSchema service={serviceData} />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-800/20 dark:to-purple-800/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-blue-100 mb-4">
                ✅ İstanbul'da #1 E-ticaret Fulfillment Merkezi
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance animate-fade-in">
              E-ticaret Operasyon &
              <span className="text-blue-200 block">
                Fulfillment Hizmetleri
              </span>
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 text-pretty leading-relaxed max-w-3xl mx-auto">
              Online satış yapan e-ticaret firmaları için profesyonel 3PL depo
              hizmetleri.
              <strong className="text-white">
                {" "}
                Aylık 50K+ sipariş kapasitesi
              </strong>{" "}
              ile stok yönetiminden kargo teslimatına kadar tüm
              operasyonlarınızı yönetiyoruz. İşinizi büyütmeye odaklanın!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-xs text-blue-200">Aylık Sipariş</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold text-white">99.8%</div>
                <div className="text-xs text-blue-200">Doğruluk Oranı</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold text-white">24h</div>
                <div className="text-xs text-blue-200">Sipariş Süresi</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold text-white">%40</div>
                <div className="text-xs text-blue-200">Maliyet Tasarrufu</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-100 dark:text-blue-600 dark:hover:bg-gray-200 font-semibold px-8 py-4 text-lg"
                asChild
              >
                <Link href="/teklif">🚀 Ücretsiz Kapasite Analizi</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 dark:border-gray-200 dark:text-white dark:hover:bg-white dark:hover:text-blue-600 font-semibold px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <Link href="/teklif">📋 Fiyat Teklifi Al</Link>
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-blue-200 text-sm">
                ⭐ 100+ e-ticaret firmasının güvendiği operasyon partneri
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-background to-blue-50/30 dark:from-gray-900 dark:to-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6 text-balance dark:text-white">
                E-ticaret İşletmeleri İçin Profesyonel 3PL Çözümleri
              </h2>
              <p className="text-lg text-muted-foreground dark:text-gray-300 mb-8 text-pretty leading-relaxed max-w-4xl mx-auto">
                <strong>Ticimax, İdeasoft, Shopify, WooCommerce</strong> gibi
                platformlarda satış yapan e-ticaret firmalarına özel e-ticaret
                operasyon hizmetleri sunuyoruz. İstanbul merkezli modern
                tesislerimizde <strong>5+ yıllık deneyimimiz</strong> ile
                operasyonel süreçlerinizi optimize ediyor, maliyetlerinizi
                düşürüyoruz.
              </p>
            </div>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <Card className="p-8 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <h3 className="text-2xl font-bold mb-6 text-red-800 dark:text-red-300 flex items-center">
                  ❌ E-ticaret'te Yaşanan Sorunlar
                </h3>
                <ul className="space-y-3 text-red-700 dark:text-red-300">
                  <li>• Yüksek depo kirası ve operasyon maliyetleri</li>
                  <li>• Sipariş yoğunluğunda personel yetersizliği</li>
                  <li>• Stok takibi ve envanter yönetimi zorlukları</li>
                  <li>
                    • Kargo entegrasyonu ve maliyet optimizasyonu problemleri
                  </li>
                  <li>• İade süreçlerinde müşteri memnuniyetsizliği</li>
                  <li>• Sezonsal dönemlerde kapasite sorunları</li>
                </ul>
              </Card>

              <Card className="p-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <h3 className="text-2xl font-bold mb-6 text-green-800 dark:text-green-300 flex items-center">
                  ✅ MKNGROUP Çözümleri
                </h3>
                <ul className="space-y-3 text-green-700 dark:text-green-300">
                  <li>• %40'a kadar maliyet tasarrufu sağlıyoruz</li>
                  <li>• Deneyimli ekibimizle 7/24 operasyon desteği</li>
                  <li>• WMS entegrasyonu ile gerçek zamanlı stok takibi</li>
                  <li>• 15+ kargo firması ile otomatik entegrasyon</li>
                  <li>• Profesyonel iade yönetimi ve müşteri iletişimi</li>
                  <li>• Esnek kapasite ile büyüme desteği</li>
                </ul>
              </Card>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  7+
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Yıl Deneyim
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  100+
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  E-ticaret Müşterisi
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  50K+
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Aylık Sipariş
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  99.8%
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Doğruluk Oranı
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  24/7
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Operasyon
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 dark:text-white">
              Kapsamlı E-ticaret Fulfillment Hizmetlerimiz
            </h2>
            <p className="text-lg text-muted-foreground dark:text-gray-300 max-w-3xl mx-auto">
              Depolamadan kargo teslimatına kadar e-ticaret operasyonlarınızın
              her aşamasında profesyonel çözümler sunuyoruz.{" "}
              <strong>İstanbul merkezli tesislerimizde</strong> modern teknoloji
              ile hizmet veriyoruz.
            </p>
          </div>

          <div className="space-y-20">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center shadow-lg p-2">
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={48}
                          height={48}
                          quality={95}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/Z/9k="
                          priority={index === 0}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-3xl font-bold text-balance dark:text-white">
                        {service.title}
                      </h3>
                    </div>

                    <p className="text-muted-foreground dark:text-gray-300 mb-8 leading-relaxed text-lg">
                      {service.description}
                    </p>

                    <div className="space-y-4 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start space-x-3"
                        >
                          <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="text-foreground dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Price and Capacity Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                          Fiyat Aralığı
                        </div>
                        <div className="text-lg font-bold text-blue-800 dark:text-blue-300">
                          {service.price}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                          Kapasite
                        </div>
                        <div className="text-lg font-bold text-green-800 dark:text-green-300">
                          {service.capacity}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                    }
                  >
                    <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-xl">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-600 dark:to-gray-500 rounded-xl flex items-center justify-center p-8">
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={400}
                          height={300}
                          quality={95}
                          placeholder="blur" 
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/Z/9k="
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 dark:text-white">
              Müşterilerimize Sağladığımız Faydalar
            </h2>
            <p className="text-lg text-muted-foreground dark:text-gray-300 max-w-3xl mx-auto">
              Operasyonel mükemmellik ve müşteri odaklı yaklaşımımızla işinizi
              bir üst seviyeye taşıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm"
                >
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-600 dark:to-gray-500 flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
                    <Image
                      src={benefit.image}
                      alt={benefit.title}
                      width={48}
                      height={48}
                      quality={95}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/Z/9k="
                      priority={false}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-300 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 dark:text-white">
              Operasyon Sürecimiz
            </h2>
            <p className="text-lg text-muted-foreground dark:text-gray-300 max-w-3xl mx-auto">
              Siparişten teslimata kadar her adımı titizlikle yönetiyor,
              süreçleri optimize ediyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-700 dark:to-gray-600"
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center text-white font-bold text-lg mr-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-muted-foreground dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-background to-blue-50/30 dark:from-gray-900 dark:to-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 dark:text-white">
              Teknoloji Entegrasyonları
            </h2>
            <p className="text-lg text-muted-foreground dark:text-gray-300 mb-12 leading-relaxed">
              Modern teknoloji altyapımız ve entegrasyon yeteneklerimizle
              operasyonel verimliliği maksimize ediyoruz.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 text-center hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 dark:bg-gray-700 dark:border-gray-600">
                <BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  Stok Takip Sistemi
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 text-sm">
                  Gerçek zamanlı stok takibi, otomatik uyarılar ve detaylı
                  raporlama
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 dark:bg-gray-700 dark:border-gray-600">
                <Settings className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  Otomasyon Sistemleri
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 text-sm">
                  Sipariş işleme otomasyonu ve akıllı süreç yönetimi
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 dark:bg-gray-700 dark:border-gray-600">
                <Truck className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  Kargo Entegrasyonu
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 text-sm">
                  Çoklu kargo firması entegrasyonu ve maliyet optimizasyonu
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 dark:text-white">
              Kalite ve Güvenlik Standartları
            </h2>
            <p className="text-lg text-muted-foreground dark:text-gray-300 mb-12 leading-relaxed">
              Uluslararası standartlarda hizmet kalitesi ve güvenlik önlemleri
              ile operasyonlarınızı güvence altına alıyoruz.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 text-left hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm">
                <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4 dark:text-white">
                  Güvenlik Önlemleri
                </h3>
                <ul className="space-y-3 text-muted-foreground dark:text-gray-300">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>24/7 güvenlik kamera sistemi</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Yangın algılama ve söndürme sistemi</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Erişim kontrol sistemleri</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Sigorta kapsamı ve güvence</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 text-left hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm">
                <Target className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4 dark:text-white">
                  Kalite Standartları
                </h3>
                <ul className="space-y-3 text-muted-foreground dark:text-gray-300">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>ISO 9001 Kalite Yönetim Sistemi</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Sürekli kalite kontrol süreçleri</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Performans ölçümleri ve raporlama</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Müşteri memnuniyet takibi</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 bg-muted/30 dark:bg-gray-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-blue-900/20 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold dark:text-white">
                Müşteri Paneli
              </h2>
            </div>

            <p className="text-muted-foreground dark:text-gray-300 mb-8 leading-relaxed">
              Yakında müşterilerimiz için özel geliştirilen web paneli ile
              operasyonlarınızı gerçek zamanlı takip edebilecek, raporlara
              erişebilecek ve ayarlarınızı yönetebileceksiniz.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary dark:text-blue-400 mb-2">
                  Gerçek Zamanlı
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Stok Takibi
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary dark:text-blue-400 mb-2">
                  Detaylı
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Raporlama
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary dark:text-blue-400 mb-2">
                  Kolay
                </div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  Yönetim
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E-commerce Specific Solutions */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 dark:text-white">
                E-ticaret Firmalarına Özel Çözümler
              </h2>
              <p className="text-lg text-muted-foreground dark:text-gray-300 max-w-3xl mx-auto">
                Online satış kanallarınıza uygun, sektör deneyimimizle
                geliştirilmiş özel hizmetler
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Dropshipping Alternative */}
              <Card className="p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white dark:bg-gray-700">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  Dropshipping Alternatifi
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 mb-4 text-sm">
                  Dropshipping'in dezavantajları olmadan hızlı teslimat.
                  Ürünlerinizi bizde stoklayın, kontrolü elinizde tutun.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Stok kontrolü sizde
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    24 saat teslimat garantisi
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Markanıza özel paketleme
                  </li>
                </ul>
              </Card>

              {/* Multi-Channel Support */}
              <Card className="p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white dark:bg-gray-700">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  Çoklu Kanal Desteği
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 mb-4 text-sm">
                  Kendi siteniz, marketplaceler ve sosyal medya satışlarınızı
                  tek merkezden yönetin.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Hepsiburada, Trendyol entegrasyonu
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Instagram, Facebook Shop desteği
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Merkezi stok yönetimi
                  </li>
                </ul>
              </Card>

              {/* Seasonal Solutions */}
              <Card className="p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white dark:bg-gray-700">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  Sezonsal Çözümler
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 mb-4 text-sm">
                  Black Friday, Sevgililer Günü gibi yoğun dönemlerde kapasite
                  desteği.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Esnek kapasite artışı
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Özel kampanya paketleme
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    7/24 operasyon desteği
                  </li>
                </ul>
              </Card>

              {/* Startup Support */}
              <Card className="p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white dark:bg-gray-700">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  Startup Dostu Paketler
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 mb-4 text-sm">
                  Yeni başlayan e-ticaret firmaları için esnek ve uygun fiyatlı
                  çözümler.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Düşük minimum hacim
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Esnek sözleşme koşulları
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Büyüme desteği
                  </li>
                </ul>
              </Card>

              {/* B2B Solutions */}
              <Card className="p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white dark:bg-gray-700">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  B2B Operasyon Desteği
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 mb-4 text-sm">
                  Kurumsal müşterilerinize özel paketleme, faturalandırma ve
                  teslimat çözümleri.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Toplu sipariş işleme
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Özel fiyatlandırma
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Kurumsal fatura desteği
                  </li>
                </ul>
              </Card>

              {/* International Shipping */}
              <Card className="p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border-0 bg-white dark:bg-gray-700">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  Uluslararası Kargo
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 mb-4 text-sm">
                  Avrupa ve dünya geneline güvenli teslimat, gümrük işlemleri
                  desteği.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    UPS, DHL entegrasyonu
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Gümrük belgesi hazırlığı
                  </li>
                  <li className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Takip ve sigorta
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
              Sık Sorulan Sorular
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-muted/30 dark:bg-gray-800/50 rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left dark:text-white">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground dark:text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-blue-800 dark:via-blue-900 dark:to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-800/20 dark:to-purple-800/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-blue-100 mb-4">
                🚀 E-ticaret İşletmenizi Bir Sonraki Seviyeye Taşıyın
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              E-ticaret Operasyonlarınızı Profesyonelleştirme Zamanı
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 leading-relaxed">
              <strong className="text-white">
                100+ e-ticaret firmasının güvendiği
              </strong>{" "}
              MKNGROUP ile operasyonel maliyetlerinizi %40'a kadar düşürün,
              müşteri memnuniyetinizi artırın.
              <strong className="text-white">
                İlk ay ücretsiz deneme
              </strong>{" "}
              fırsatını kaçırmayın!
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">📦</div>
                <div className="font-semibold mb-1">24 Saat Süreç</div>
                <div className="text-blue-200 text-sm">
                  Sipariş - Kargo Süresi
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold mb-1">%40 Tasarruf</div>
                <div className="text-blue-200 text-sm">Operasyonel Maliyet</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold mb-1">99.8% Doğruluk</div>
                <div className="text-blue-200 text-sm">
                  Sipariş İşleme Oranı
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-100 dark:text-blue-600 dark:hover:bg-gray-200 font-semibold px-8 py-4 text-lg"
                asChild
              >
                <Link href="/teklif">
                  🎯 Ücretsiz Kapasite Analizi & Teklif
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 dark:border-gray-200 dark:text-white dark:hover:bg-white dark:hover:text-blue-600 font-semibold px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <Link href="tel:+905314942594">
                  📞 Hemen Ara: 0531 494 25 94
                </Link>
              </Button>
            </div>

            <div className="mt-8">
              <p className="text-blue-200 text-sm mb-4">
                ⚡ 24 saat içinde teklifnizi hazırlıyoruz
              </p>
              <div className="flex items-center justify-center space-x-6 text-blue-200">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Ücretsiz Danışmanlık</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Hızlı Kurulum</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Esnek Sözleşme</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
