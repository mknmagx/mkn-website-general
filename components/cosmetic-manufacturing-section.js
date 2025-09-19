import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Award,
  Shield,
  Beaker,
  CheckCircle,
  ArrowRight,
  Factory,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CosmeticManufacturingSection() {
  const certifications = [
    {
      title: "ISO 22716",
      description: "Kozmetik GMP Sertifikası",
      icon: Award,
      color: "text-green-600",
    },
    {
      title: "HACCP",
      description: "Gıda Güvenliği Sistemi",
      icon: Shield,
      color: "text-blue-600",
    },
    {
      title: "ISO 14001",
      description: "Çevre Yönetim Sistemi",
      icon: Beaker,
      color: "text-purple-600",
    },
    {
      title: "10,600m² Tesis",
      description: "Modern Üretim Kapasitesi",
      icon: Factory,
      color: "text-orange-600",
    },
  ];

  const productCategories = [
    {
      title: "Kozmetik Ürünler",
      description: "Krem, serum, şampuan, temizleyici",
      keywords: "kozmetik fason üretim, cilt bakım, saç bakım, GMP sertifikalı",
      image:
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop&auto=format",
    },
    {
      title: "Gıda Takviyeleri",
      description: "Tablet, kapsül, sıvı, toz form",
      keywords:
        "gıda takviyesi fason üretim, vitamin, mineral, HACCP sertifikalı",
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&auto=format",
    },
    {
      title: "Temizlik Ürünleri",
      description: "Deterjan, sabun, yüzey temizleyici",
      keywords: "temizlik ürünü fason üretim, eco-friendly, çevre dostu formül",
      image:
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=300&fit=crop&auto=format",
    },
    {
      title: "Kişisel Bakım",
      description: "Hijyen ürünleri, özel formülasyonlar",
      keywords: "kişisel bakım fason üretim, hijyen ürünleri, özel formül",
      image:
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop&auto=format",
    },
  ];

  const qualitySteps = [
    "Hammadde Kalite Kontrolü",
    "Formülasyon ve R&D Testleri",
    "Pilot Üretim ve Numune",
    "Mikrobiyolojik Analizler",
    "Stabilite ve Raf Ömrü Testleri",
    "Nihai Ürün Onayı",
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
          >
            <Factory className="h-4 w-4 mr-2" />
            Fason Üretim Hizmetleri
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Türkiye'nin En{" "}
            <span className="text-blue-600 dark:text-blue-400">Güvenilir</span>{" "}
            Fason Üretim Merkezi
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            GMP ve HACCP sertifikalı tesislerimizde, kozmetikten gıda
            takviyelerine, temizlik ürünlerinden kişisel bakıma kadar{" "}
            <strong>300+ farklı formülasyon</strong> ile
            <strong>end-to-end fason üretim hizmetleri</strong> sunuyoruz.
          </p>
        </div>

        {/* Sertifikalar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {certifications.map((cert, index) => {
            const IconComponent = cert.icon;
            return (
              <Card
                key={index}
                className="text-center hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 bg-card dark:bg-gray-800 border-border dark:border-gray-700"
              >
                <CardContent className="pt-6">
                  <div
                    className={`h-12 w-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}
                  >
                    <IconComponent className={`h-6 w-6 ${cert.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ürün Kategorileri */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Fason Üretim{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Ürün Kategorilerimiz
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {productCategories.map((product, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl dark:hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 overflow-hidden bg-card dark:bg-gray-800 border-border dark:border-gray-700"
              >
                <div className="relative h-48">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="font-bold text-lg">{product.title}</h4>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {product.description}
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {product.keywords}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Kalite Süreci */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mb-16 border border-blue-100 dark:border-blue-800/30">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                6 Aşamalı{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Kalite Kontrol
                </span>{" "}
                Süreci
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Hammaddeden nihai ürüne kadar her aşamada titizlikle uygulanan
                kalite kontrol sürecimiz ile{" "}
                <strong>%99.8 müşteri memnuniyeti</strong> sağlıyoruz.
              </p>
              <div className="space-y-4">
                {qualitySteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=400&fit=crop&auto=format"
                alt="Modern fason üretim tesisi ve kalite kontrol laboratuvarı"
                width={600}
                height={400}
                className="rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  99.8%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Kalite Başarı Oranı
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Fason Üretim Projenizi Başlatmaya Hazır mısınız?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Ücretsiz numune ve formülasyon danışmanlığı için hemen iletişime
            geçin.
            <strong>48 saat içinde</strong> geri dönüş garantisi!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href="/iletisim">
                Ücretsiz Danışmanlık Al
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/80 text-white hover:bg-white hover:text-blue-600 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-blue-700 bg-white/10 backdrop-blur-sm"
            >
              <Link href="/fason-uretim">Fason Üretim Detayları</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
