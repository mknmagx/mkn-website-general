import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CustomerTestimonialsSection() {
  const testimonials = [
    {
      name: "Zeynep Kaya",
      company: "Natural Beauty Cosmetics",
      role: "Kurucu",
      content:
        "MKN Group ile çalışmaya başladığımızdan beri işimiz %300 büyüdü. ISO sertifikalı üretim kalitesi ve hızlı teslimatları sayesinde müşteri memnuniyetimiz çok yüksek. Özellikle fason üretim konusunda çok profesyoneller.",
      rating: 5,
      keywords:
        "fason üretim memnuniyet, iso sertifikalı üretim, hızlı teslimat",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1ad?w=80&h=80&fit=crop&auto=format",
      productType: "Cilt Bakım Ürünleri",
    },
    {
      name: "Mehmet Özkan",
      company: "Clean Home Products",
      role: "İşletme Sahibi",
      content:
        "Temizlik ürünleri üretimi için MKN Group'u tercih ettik. Kalite kontrol süreçleri mükemmel, ambalaj seçenekleri çok geniş. 2 yıldır çalışıyoruz ve hiç sorun yaşamadık. Kesinlikle tavsiye ederim.",
      rating: 5,
      keywords: "temizlik ürünü üretim, kalite kontrol, ambalaj çeşitliliği",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format",
      productType: "Temizlik Ürünleri",
    },
    {
      name: "Ayşe Demir",
      company: "Herbal Care",
      role: "Pazarlama Müdürü",
      content:
        "E-ticaret operasyon hizmetleri gerçekten hayat kurtarıcı! Depo yönetimi, kargo, müşteri hizmetleri... Her şeyi hallettiler. Biz sadece satışa odaklanıyoruz. Sipariş sayımız 5 katına çıktı.",
      rating: 5,
      keywords: "e-ticaret operasyon, depo yönetimi, müşteri hizmetleri",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format",
      productType: "E-Ticaret Operasyon",
    },
    {
      name: "Can Yılmaz",
      company: "Organic Solutions",
      role: "Genel Müdür",
      content:
        "Ambalaj konusunda çok titiziz ama MKN Group'un 5000+ seçeneği var. Premium kalitede, uygun fiyatlı ve çok hızlı teslimat. Artık tüm ambalaj ihtiyaçlarımızı buradan karşılıyoruz.",
      rating: 5,
      keywords: "premium ambalaj, uygun fiyat, hızlı ambalaj tedarik",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
      productType: "Ambalaj Çözümleri",
    },
    {
      name: "Fatma Şahin",
      company: "Beauty Essentials",
      role: "Kurucu Ortak",
      content:
        "Dijital pazarlama hizmetleri sayesinde markamız çok büyüdü. Influencer kampanyaları, Google Ads yönetimi, sosyal medya... Profesyonel ekip gerçekten işini biliyor. ROI'mız %400 arttı.",
      rating: 5,
      keywords:
        "dijital pazarlama, influencer kampanya, google ads, sosyal medya",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&auto=format",
      productType: "Dijital Pazarlama",
    },
    {
      name: "Hasan Korkmaz",
      company: "Pro Cosmetics",
      role: "Satış Müdürü",
      content:
        "3 yıldır MKN Group ile çalışıyoruz. Hem fason üretim hem de ambalaj tedariki için tek adres. Kalite hiç düşmedi, fiyatlar rekabetçi. Müşteri portföyümüz sürekli büyüyor.",
      rating: 5,
      keywords: "uzun vadeli ortaklık, fason üretim kalite, rekabetçi fiyat",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&auto=format",
      productType: "Fason Üretim + Ambalaj",
    },
  ];

  const stats = [
    { number: "200+", label: "Mutlu Müşteri" },
    { number: "4.9/5", label: "Müşteri Puanı" },
    { number: "%98", label: "Tekrar Çalışma Oranı" },
    { number: "1000+", label: "Başarılı Proje" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-600/30"
          >
            <Star className="h-4 w-4 mr-2" />
            Müşteri Yorumları
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Müşterilerimiz{" "}
            <span className="text-yellow-600 dark:text-yellow-400">Neler Söylüyor?</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            <strong>200+ mutlu müşterimizin</strong> gerçek deneyimleri ve
            başarı hikayelerini keşfedin.
            <strong>%98 tekrar çalışma oranımız</strong> kalitemizin en büyük
            göstergesi.
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Müşteri Yorumları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <CardContent className="p-6">
                {/* Tırnak İşareti */}
                <Quote className="h-8 w-8 text-yellow-500 dark:text-yellow-400 mb-4" />

                {/* Yıldızlar */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Yorum */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm">
                  "{testimonial.content}"
                </p>

                {/* Müşteri Bilgileri */}
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Ürün Tipi */}
                <Badge variant="outline" className="text-xs text-gray-600 mb-3">
                  {testimonial.productType}
                </Badge>

                {/* SEO Keywords */}
                <div className="text-xs text-gray-400 leading-relaxed">
                  SEO: {testimonial.keywords}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Testimonial Çağrısı */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 md:p-12 text-white text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">
            Başarı Hikayenizi Videoda İzleyin
          </h3>
          <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
            Müşterilerimizin MKN Group ile nasıl büyüdüklerini anlattıkları
            <strong> video testimonial'ları</strong> izlemek için tıklayın.
          </p>
          <div className="flex justify-center">
            <Link href="/iletisim">
              <button className="bg-white text-yellow-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300">
                Video Hikayeler
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Güven Rozetleri */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Güvenilir Ortaklığın{" "}
            <span className="text-yellow-600">Garantileri</span>
          </h3>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
              <Star className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                ISO 22716 Sertifikalı
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">
                GMP Standartları
              </span>
            </div>
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
              <Star className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">
                6+ Yıl Deneyim
              </span>
            </div>
            <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
              <Star className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-800">
                %98 Müşteri Memnuniyeti
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
