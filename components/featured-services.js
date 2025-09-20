import Link from "next/link";
import {
  ArrowRight,
  Beaker,
  Warehouse,
  Megaphone,
  Palette,
  Factory,
  Package,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export function FeaturedServices() {
  const services = [
    {
      icon: Factory,
      title: "Fason Üretim",
      description:
        "ISO sertifikalı tesislerde kozmetik, gıda takviyesi ve temizlik ürünleri üretimi.",
      features: [
        "ISO 22716 Sertifikalı Üretim",
        "R&D ve Formülasyon Geliştirme",
        "Hızlı Prototip & Seri Üretim",
        "Kalite Kontrol Laboratuvarı",
      ],
      href: "/fason-uretim",
      cta: "Üretim Detayları",
      image: "/optimized/modern-manufacturing-facility-with-advanced-equipm.webp",
      highlight: "15,000m² Üretim Tesisi",
    },
    {
      icon: Package,
      title: "Ambalaj Çözümleri",
      description:
        "5000+ farklı ambalaj seçeneği ile ürününüze en uygun premium ambalajı bulun.",
      features: [
        "Airless, Pompa, Spray Şişeler",
        "Cam Kavanoz & Tüpler",
        "Özel Tasarım Ambalajlar",
        "Toptan & Perakende Satış",
      ],
      href: "/ambalaj",
      cta: "Ambalaj Kataloğu",
      image: "/optimized/cosmetic-packaging-mockup.webp",
      highlight: "5,000+ Ambalaj Seçeneği",
    },
    {
      icon: TrendingUp,
      title: "E-Ticaret Operasyon",
      description:
        "Depodan kargoya, müşteri hizmetlerinden iade yönetimine e-ticaret operasyonları.",
      features: [
        "WMS Entegreli Depo Yönetimi",
        "Kargo & Sevkiyat Operasyonu",
        "Müşteri Hizmetleri",
        "İade & Değişim Yönetimi",
      ],
      href: "/e-ticaret",
      cta: "Operasyon Detayları",
      image: "/optimized/cargo-delivery.webp",
      highlight: "24 Saat İçinde Sevkiyat",
    },
    {
      icon: Zap,
      title: "Dijital Pazarlama",
      description:
        "Ürün çekiminden influencer kampanyalarına, Google Ads'ten sosyal medya yönetimine.",
      features: [
        "Profesyonel Fotoğraf & Video",
        "Influencer Kampanya Yönetimi",
        "Google & Meta Ads Yönetimi",
        "Sosyal Medya Pazarlaması",
      ],
      href: "/pazarlama",
      cta: "Pazarlama Paketleri",
      image: "/optimized/cosmetic-instagram-campaign.webp",
      highlight: "500+ Başarılı Kampanya",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 dark:from-gray-900 dark:to-gray-800/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary/20 dark:border-primary/30">
            <Package className="h-4 w-4" />
            Hizmetlerimiz
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
            Tek Çatı Altında <span className="text-primary">Tüm Çözümler</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Markanızın başarısı için ihtiyacınız olan tüm hizmetleri profesyonel
            ekibimiz ve modern tesislerimizle sunuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.title}
                className={`group hover:shadow-2xl dark:hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-500 border-0 bg-card dark:bg-gray-800 overflow-hidden ${
                  index % 2 === 0
                    ? "hover:-translate-y-2"
                    : "hover:translate-y-2"
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 dark:border-gray-700/50">
                      <IconComponent className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {service.highlight}
                      </span>
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary mr-3 flex-shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6"
                    size="lg"
                  >
                    <Link
                      href={service.href}
                      className="flex items-center justify-center gap-2"
                    >
                      {service.cta}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 max-w-2xl mx-auto border border-primary/10 dark:border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Hangi Hizmete İhtiyacınız Var?
            </h3>
            <p className="text-muted-foreground mb-6">
              Ücretsiz teklif almak için hemen başvurun. Size en uygun çözümü ve
              fiyatları sunalım.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/teklif">
                Ücretsiz Teklif Alın
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
