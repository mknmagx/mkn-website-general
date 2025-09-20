import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, HeadphonesIcon, RotateCcw, TrendingUp, ArrowRight, Clock, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function EcommerceOperationSection() {
  const services = [
    {
      title: "Depo Yönetimi (WMS)",
      description: "Modern WMS sistemi ile envanter takibi ve depo optimizasyonu",
      icon: Package,
      features: [
        "Gerçek zamanlı stok takibi",
        "Barcode & QR kod sistemi", 
        "Otomatik stok uyarıları",
        "Çoklu platform entegrasyonu"
      ],
      keyword: "wms depo yönetimi, warehouse management turkey, stok takip sistemi",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=300&fit=crop&auto=format"
    },
    {
      title: "Kargo & Sevkiyat",
      description: "Tüm kargo firmaları ile entegre hızlı sevkiyat operasyonu",
      icon: Truck,
      features: [
        "Aynı gün kargo hazırlığı",
        "10+ kargo firması entegrasyonu",
        "Otomatik kargo etiketi",
        "Takip numarası bildirimi"
      ],
      keyword: "hızlı kargo operasyon, same day shipping turkey, e-ticaret lojistik",
      image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&h=300&fit=crop&auto=format"
    },
    {
      title: "Müşteri Hizmetleri",
      description: "7/24 profesyonel müşteri hizmetleri ve sipariş takibi",
      icon: HeadphonesIcon,
      features: [
        "7/24 canlı destek",
        "Çoklu kanal iletişim",
        "Sipariş durumu bildirimi",
        "Müşteri memnuniyet anketi"
      ],
      keyword: "müşteri hizmetleri outsourcing, call center hizmetleri, 7/24 destek",
      image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=500&h=300&fit=crop&auto=format"
    },
    {
      title: "İade & Değişim",
      description: "Kolay iade süreci ve müşteri memnuniyeti odaklı çözümler",
      icon: RotateCcw,
      features: [
        "Kolay iade süreci",
        "Kalite kontrol değerlendirmesi",
        "Hızlı geri ödeme",
        "İade analiz raporları"
      ],
      keyword: "iade yönetimi, return management, müşteri memnuniyeti",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop&auto=format"
    }
  ];

  const integrations = [
    "Trendyol", "Amazon", "Hepsiburada", "N11", "GittiGidiyor", 
    "Shopify", "WooCommerce", "Opencart", "Magento", "Prestashop"
  ];

  const stats = [
    { number: "24 Saat", label: "İçinde Sevkiyat", icon: Clock },
    { number: "99.5%", label: "Başarılı Teslimat", icon: Shield },
    { number: "10+", label: "Platform Entegrasyonu", icon: TrendingUp },
    { number: "50,000+", label: "Aylık Sipariş Kapasitesi", icon: Package }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
            <Truck className="h-4 w-4 mr-2" />
            E-Ticaret Operasyon
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-green-600 dark:text-green-400">E-Ticaret</span> Operasyonunuzu Bize Bırakın
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Depodan kargoya, müşteri hizmetlerinden iade yönetimine kadar 
            <strong>e-ticaret operasyonlarınızın tamamını</strong> profesyonel ekibimizle yönetiyoruz. 
            <strong>50,000+ aylık sipariş kapasitesi</strong> ile büyümenizi destekliyoruz.
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 border-green-100 dark:border-green-800 bg-card dark:bg-gray-800">
                <CardContent className="pt-6">
                  <IconComponent className="h-8 w-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hizmet Detayları */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            <span className="text-green-600 dark:text-green-400">Tam Entegre</span> E-Ticaret Çözümleri
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="group hover:shadow-xl dark:hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 overflow-hidden bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                  <div className="flex">
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-gray-900 dark:text-white">{service.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-4">
                        SEO: {service.keyword}
                      </div>
                    </div>
                    
                    <div className="w-48 relative hidden md:block">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        quality={85}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Platform Entegrasyonları */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 mb-16 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            <span className="text-green-600 dark:text-green-400">10+</span> E-Ticaret Platformu ile Entegre
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Tüm büyük e-ticaret platformları ve WMS sistemleri ile sorunsuz entegrasyon
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((platform, index) => (
              <Badge key={index} variant="outline" className="px-4 py-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        {/* Süreç Akışı */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            <span className="text-green-600 dark:text-green-400">Sipariş Süreci</span> Nasıl İşliyor?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Sipariş Alımı",
                description: "Platform entegrasyonu ile otomatik sipariş alımı"
              },
              {
                step: "2", 
                title: "Depo Hazırlığı",
                description: "WMS sistemi ile ürün hazırlama ve kalite kontrol"
              },
              {
                step: "3",
                title: "Kargo Sevkiyatı", 
                description: "Aynı gün kargo hazırlığı ve sevkiyat"
              },
              {
                step: "4",
                title: "Takip & Destek",
                description: "Müşteri bildirimi ve 7/24 destek hizmeti"
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{process.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{process.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            E-Ticaret Operasyonunuzu Büyütmeye Hazır mısınız?
          </h3>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Ücretsiz danışmanlık ve operasyon analizi için hemen iletişime geçin. 
            <strong>İlk ay %50 indirimli</strong> deneme fırsatı!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <Link href="/iletisim">
                Ücretsiz Danışmanlık Al
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/80 text-white hover:bg-white hover:text-green-600 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-green-700 bg-white/10 backdrop-blur-sm">
              <Link href="/iletisim">
                Operasyon Detayları
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
