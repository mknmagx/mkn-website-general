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
  Package,
  Download,
  Star,
  TrendingUp,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function PackagingCatalogSection() {
  const packagingTypes = [
    {
      category: "Airless Şişeler",
      description: "Premium kozmetik ürünler için hava geçirmez ambalaj",
      keyword:
        "airless şişe toptan, airless bottle turkey, kozmetik airless ambalaj",
      sizes: ["15ml", "30ml", "50ml", "100ml"],
      minOrder: "500 adet",
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop&auto=format",
      popular: true,
    },
    {
      category: "Pompa Şişeler",
      description: "Sıvı sabun, losyon ve temizleyici ürünler için",
      keyword: "pompa şişe üretici, lotion pump bottle, sıvı sabun şişesi",
      sizes: ["250ml", "500ml", "750ml", "1000ml"],
      minOrder: "300 adet",
      image:
        "https://images.unsplash.com/photo-1556228652-d8f56fee6a74?w=400&h=300&fit=crop&auto=format",
      popular: true,
    },
    {
      category: "Spray Şişeler",
      description: "Parfüm, temizleyici ve saç bakım ürünleri için",
      keyword: "spray bottle turkey, fine mist sprayer, parfüm şişesi",
      sizes: ["50ml", "100ml", "250ml", "500ml"],
      minOrder: "200 adet",
      image:
        "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=300&fit=crop&auto=format",
      popular: false,
    },
    {
      category: "Cam Kavanozlar",
      description: "Premium cilt bakım kremleri ve maskeleri için",
      keyword: "cam kavanoz toptan, glass jar cosmetic, krem kavanozu",
      sizes: ["30ml", "50ml", "100ml", "200ml"],
      minOrder: "100 adet",
      image:
        "https://images.unsplash.com/photo-1629194607643-5e41e62b8a51?w=400&h=300&fit=crop&auto=format",
      popular: true,
    },
    {
      category: "Tüp Ambalajlar",
      description: "Krem, jel ve pasta ürünler için esnek çözümler",
      keyword: "kozmetik tüp, tube packaging turkey, krem tüpü",
      sizes: ["25ml", "50ml", "75ml", "100ml"],
      minOrder: "250 adet",
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=300&fit=crop&auto=format",
      popular: false,
    },
    {
      category: "Serum Damlalıkları",
      description: "Yüz serumu ve esansiyel yağlar için hassas dozaj",
      keyword: "dropper bottle turkey, serum damlalık, essential oil bottle",
      sizes: ["10ml", "15ml", "30ml", "50ml"],
      minOrder: "150 adet",
      image:
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=300&fit=crop&auto=format",
      popular: true,
    },
  ];

  const advantages = [
    {
      title: "5000+ Ambalaj Seçeneği",
      description: "Geniş ürün yelpazesi ile her ihtiyaca uygun çözüm",
      icon: Package,
    },
    {
      title: "Hızlı Teslimat",
      description: "Stoklu ürünlerde 2-3 gün, özel üretimde 10-15 gün",
      icon: TrendingUp,
    },
    {
      title: "Kalite Garantisi",
      description: "FDA ve EU standartlarında, gıda sınıfı malzemeler",
      icon: Star,
    },
    {
      title: "Toptan Fiyatlar",
      description: "Fabrika fiyatlarıyla, rekabetçi toptan satış",
      icon: ShoppingCart,
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
          >
            <Package className="h-4 w-4 mr-2" />
            Ambalaj Çözümleri
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Türkiye'nin En Geniş{" "}
            <span className="text-purple-600 dark:text-purple-400">
              Kozmetik Ambalaj
            </span>{" "}
            Kataloğu
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            <strong>5000+</strong> farklı ambalaj seçeneği ile kozmetik,
            temizlik ve kişisel bakım ürünleriniz için{" "}
            <strong>premium kalitede ambalaj çözümleri</strong> sunuyoruz.
            <strong>Toptan satış</strong> ve <strong>hızlı teslimat</strong>{" "}
            garantisiyle.
          </p>
        </div>

        {/* Avantajlar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <Card
                key={index}
                className="text-center hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 border-purple-100 dark:border-purple-800 bg-card dark:bg-gray-800"
              >
                <CardContent className="pt-6">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ambalaj Kategorileri */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            <span className="text-purple-600 dark:text-purple-400">
              Premium Ambalaj
            </span>{" "}
            Kategorilerimiz
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Kozmetik, temizlik ve kişisel bakım ürünleriniz için özel olarak
            seçilmiş, kaliteli ve uygun fiyatlı ambalaj seçenekleri.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packagingTypes.map((packaging, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl dark:hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 overflow-hidden relative bg-card dark:bg-gray-800 border-border dark:border-gray-700"
              >
                {packaging.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-orange-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popüler
                    </Badge>
                  </div>
                )}

                <div className="relative h-48">
                  <Image
                    src={packaging.image}
                    alt={packaging.category}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="font-bold text-lg">{packaging.category}</h4>
                    <p className="text-sm text-gray-200">
                      Min. {packaging.minOrder}
                    </p>
                  </div>
                </div>

                <CardContent className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {packaging.description}
                  </p>

                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Mevcut Boyutlar:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {packaging.sizes.map((size, sizeIndex) => (
                        <Badge
                          key={sizeIndex}
                          variant="outline"
                          className="text-xs text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-4 line-clamp-2">
                    SEO: {packaging.keyword}
                  </div>

                  <Button
                    asChild
                    className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
                    size="sm"
                  >
                    <Link href="/ambalaj">
                      Ürünleri İncele
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Katalog İndirme */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <Package className="h-16 w-16 mx-auto mb-6 text-purple-200" />
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Tüm Ambalaj Kataloğumuzu İndirin
            </h3>
            <p className="text-xl text-purple-100 mb-8">
              <strong>200+ sayfa</strong> detaylı katalogumuzda{" "}
              <strong>5000+</strong> farklı ambalaj seçeneği,
              <strong>teknik çizimler</strong>, <strong>fiyat listeleri</strong>{" "}
              ve <strong>minimum sipariş miktarları</strong>
              yer alıyor. Ücretsiz indirin!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Link href="/mkn-ambalaj-katalog-tr.pdf" target="_blank">
                  <Download className="mr-2 h-5 w-5" />
                  PDF Katalog İndir (Türkçe)
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/80 text-white hover:bg-white hover:text-purple-600 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-purple-700 bg-white/10 backdrop-blur-sm"
              >
                <Link href="/iletisim">
                  Özel Teklif Al
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-purple-500">
              <div>
                <div className="text-2xl font-bold">5000+</div>
                <div className="text-purple-200">Ambalaj Çeşidi</div>
              </div>
              <div>
                <div className="text-2xl font-bold">48 Saat</div>
                <div className="text-purple-200">Hızlı Teslimat</div>
              </div>
              <div>
                <div className="text-2xl font-bold">%30</div>
                <div className="text-purple-200">Daha Uygun Fiyat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
