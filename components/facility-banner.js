import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Factory,
  MapPin,
  TrendingUp,
  Award,
  Building2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FacilityBanner() {
  // SEO optimized facility data with enhanced information
  const facilities = [
    {
      slug: "aspar-ilac",
      name: "Aspar İlaç Kozmetik Gıda Sanayi A.Ş",
      shortName: "Aspar İlaç",
      description:
        "ISO 22716 GMP sertifikalı dermokozmetik ürünler ve gıda takviyeleri üretiminde uzmanlaşmış modern üretim tesisi",
      capacity: "Aylık 5M+ Ünite",
      location: "Beylikdüzü, İstanbul",
      area: "10.600 m²",
      certifications: ["ISO 22716 GMP", "FDA Onaylı", "Halal Sertifikalı"],
      specialties: [
        "Krem & Serum",
        "Şampuan & Saç Bakımı",
        "Kapsül & Tablet",
        "Sıvı Formlar",
      ],
      keyFeatures: [
        "Otomatik üretim hatları",
        "Kalite kontrol laboratuvarı",
        "Aseptik üretim alanları",
      ],
      image: "/optimized/modern-pharmaceutical-manufacturing-facility-with-.webp",
      alt: "Aspar İlaç ISO 22716 GMP Sertifikalı Kozmetik Üretim Tesisi - Beylikdüzü",
      founded: "2020",
      employees: "25+ Uzman",
    },
    {
      slug: "dogukan-kimya",
      name: "Doğukan Kimya Tekstil Gıda Ambalaj San. ve Tic. Ltd. Şti.",
      shortName: "Doğukan Kimya",
      description:
        "ISO 14001 çevre dostu temizlik ürünleri, dezenfektan ve hijyen ürünleri üretiminde yüksek kapasiteli üretim tesisi",
      capacity: "Aylık 2M+ Ünite",
      location: "Haramidere, İstanbul",
      area: "10.000 m²",
      certifications: ["ISO 14001", "TSE Onaylı", "CE İşaretli"],
      specialties: [
        "Sıvı Sabun",
        "Yüzey Temizleyici",
        "Çamaşır Deterjanı",
        "Dezenfektan",
      ],
      keyFeatures: [
        "Çevre dostu üretim",
        "Yüksek kapasite karıştırıcılar",
        "Otomatik dolum hatları",
      ],
      image: "/optimized/modern-chemical-manufacturing-facility-with-large-.webp",
      alt: "Doğukan Kimya ISO 14001 Çevre Dostu Temizlik Ürünleri Üretim Tesisi - İstanbul",
      founded: "2019",
      employees: "20+ Uzman",
    },
  ];

  const facilitiesStats = {
    totalArea: "10.600 m²",
    totalCapacity: "7M+ Ünite/Ay",
    totalEmployees: "50+ Uzman",
    certifications: "10+ Sertifika",
  };

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-blue-50/30 dark:from-primary/10 dark:via-background dark:to-slate-800/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* SEO Enhanced Header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-8 text-primary border-primary text-sm px-4 py-2"
          >
            🏭 ISO Sertifikalı Tesisler
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-primary">Modern Üretim</span>
            <br className="hidden lg:block" />
            <span className="text-blue-600">Tesislerimiz</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <strong>10.600m² kapalı alanda</strong> ISO sertifikalı
            tesislerimizde
            <strong> aylık 3+ milyon ünite üretim kapasitesi</strong> ile
            kozmetik, gıda takviyesi ve temizlik ürünleri{" "}
            <strong>contract manufacturing</strong> hizmetleri
          </p>
        </div>

        {/* Enhanced Facility Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {facilities.map((facility, index) => (
            <Card
              key={facility.slug}
              className="group border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Facility Image Header */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={facility.image}
                  alt={facility.alt}
                  fill
                  quality={90}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                {/* Floating Stats */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border dark:border-slate-600">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {facility.capacity.split(" ")[1]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Aylık Kapasite
                    </div>
                  </div>
                </div>

                {/* Certification Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    {facility.certifications[0]}
                  </Badge>
                </div>

                {/* Location Badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border dark:border-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {facility.location}
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {facility.shortName}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {facility.description}
                  </p>
                </div>

                {/* Facility Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-primary">
                      {facility.area}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tesis Alanı
                    </div>
                  </div>
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {facility.employees}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Çalışan Sayısı
                    </div>
                  </div>
                </div>

                {/* Production Specialties */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                    🎯 Üretim Uzmanlıkları
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {facility.specialties.map((specialty, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs border-primary/20 text-primary hover:bg-primary/10"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                    ✨ Teknolojik Özellikler
                  </h4>
                  <div className="space-y-2">
                    {facility.keyFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  className="w-full group-hover:bg-primary/90 transition-colors"
                  size="lg"
                >
                  <Link href={`/tesisler/${facility.slug}`}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Tesisi Detaylı İncele
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Statistics */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/15 dark:to-blue-500/15 rounded-3xl p-8 border dark:border-slate-600 mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            📊 Toplam Üretim Kapasitemiz
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {facilitiesStats.totalArea}
              </div>
              <div className="text-sm text-muted-foreground">
                Toplam Kapalı Alan
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {facilitiesStats.totalCapacity}
              </div>
              <div className="text-sm text-muted-foreground">
                Aylık Üretim Kapasitesi
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {facilitiesStats.totalEmployees}
              </div>
              <div className="text-sm text-muted-foreground">Uzman Çalışan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {facilitiesStats.certifications}
              </div>
              <div className="text-sm text-muted-foreground">
                Kalite Sertifikası
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 dark:border-slate-600 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                🏭 Tesislerimizi Yakından Keşfedin
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Modern teknoloji ve yüksek kalite standartlarımızı yerinde
                görün.
                <strong>Sanal tesis turu</strong> ve detaylı bilgiler için
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/tesisler">
                    <Factory className="mr-2 h-4 w-4" />
                    Tüm Tesisleri Görüntüle
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/iletisim">
                    <MapPin className="mr-2 h-4 w-4" />
                    Tesis Ziyareti Planlayın
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
