"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Factory,
  Package,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-background via-card to-primary/5 py-24 lg:py-40"
      itemScope
      itemType="https://schema.org/Organization"
      aria-label="MKNGROUP Ana Bölüm"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-secondary rounded-full blur-3xl opacity-15 animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg border border-green-200 dark:border-green-800">
              <Award className="h-5 w-5" />
              <span itemProp="alternateName">
                6+ Yıl Deneyim • 1000+ Başarılı Proje • ISO Sertifikalı
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 text-balance leading-tight"
              itemProp="name"
            >
              Markanızın{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Büyüme Ortağı
              </span>
              <br />
              <span className="text-primary" itemProp="description">
                MKN GROUP ile Farkı Yaşayın
              </span>
            </h1>
          </div>

          <div className="animate-slide-up delay-200">
            <p
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto text-pretty leading-relaxed"
              itemProp="description"
            >
              <strong className="text-primary">Kozmetik fason üretimi</strong>,{" "}
              <strong className="text-primary">
                premium ambalaj çözümleri
              </strong>
              ,<strong className="text-primary">e-ticaret operasyonları</strong>{" "}
              ve <strong className="text-primary">dijital pazarlama</strong>{" "}
              hizmetleri ile markanızı{" "}
              <span className="text-foreground font-semibold">
                bir sonraki seviyeye taşıyoruz
              </span>
              .
            </p>

            {/* Güven İstatistikleri */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  1000+
                </div>
                <div className="text-sm text-muted-foreground">
                  Başarılı Proje
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  6+
                </div>
                <div className="text-sm text-muted-foreground">Yıl Deneyim</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  200+
                </div>
                <div className="text-sm text-muted-foreground">
                  Mutlu Müşteri
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  ISO
                </div>
                <div className="text-sm text-muted-foreground">
                  Sertifikalı Üretim
                </div>
              </div>
            </div>
          </div>

          <div className="animate-slide-up delay-300">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link
                  href="/teklif"
                  aria-label="Ücretsiz teklif almak için hemen iletişime geçin"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Ücretsiz Teklif Alın
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white dark:text-primary dark:border-primary transition-all duration-300 px-8 py-4 text-lg font-semibold"
                onClick={() => {
                  document.getElementById("services")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                aria-label="Tüm hizmetlerimizi keşfedin"
              >
                <Package className="mr-2 h-5 w-5" />
                Hizmetlerimizi Keşfedin
              </Button>
            </div>

            {/* Hızlı Erişim Menüsü */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-12">
              <Link
                href="/fason-uretim"
                className="group flex flex-col items-center p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-white/10 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-primary/30 transition-all duration-300"
              >
                <Factory className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-center text-foreground">
                  Fason Üretim
                </span>
              </Link>
              <Link
                href="/ambalaj"
                className="group flex flex-col items-center p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-white/10 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-primary/30 transition-all duration-300"
              >
                <Package className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-center text-foreground">
                  Ambalaj Çözümleri
                </span>
              </Link>
              <Link
                href="/e-ticaret"
                className="group flex flex-col items-center p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-white/10 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-primary/30 transition-all duration-300"
              >
                <TrendingUp className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-center text-foreground">
                  E-Ticaret
                </span>
              </Link>
              <Link
                href="/pazarlama"
                className="group flex flex-col items-center p-4 rounded-xl bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm border border-white/10 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-primary/30 transition-all duration-300"
              >
                <Zap className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-center text-foreground">
                  Dijital Pazarlama
                </span>
              </Link>
            </div>
          </div>

          <div className="animate-scale-in delay-500">
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
              role="region"
              aria-label="MKNGROUP İstatistikleri"
            >
              <article className="group hover-lift bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Factory className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <div
                  className="text-3xl font-bold text-foreground mb-2"
                  itemProp="areaServed"
                >
                  10,600m²
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Modern Üretim Tesisi
                </div>
              </article>

              <article className="group hover-lift bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300">
                <div className="h-16 w-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  5,000+
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Premium Ambalaj Seçeneği
                </div>
              </article>

              <article className="group hover-lift bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all duration-300">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp
                    className="h-8 w-8 text-white"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  %300
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Ortalama Büyüme Artışı
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// import Link from "next/link"
// import { ArrowRight, Factory, Package, Truck } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export function Hero() {
//   return (
//     <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-20 lg:py-32">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto text-center">
//           {/* Main Heading */}
//           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
//             Fason Üretim, Ambalaj ve <span className="text-primary">Operasyon Çözümleri</span>
//           </h1>

//           {/* Subtitle */}
//           <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
//             Kozmetik üretimi, gıda takviyesi, temizlik & bakım; kozmetik ambalaj tedariki; depo-kargo ve e-ticaret
//             operasyon yönetimi; pazarlama & reklam desteği – hepsi <span className="font-montserrat font-semibold">MKNGROUP</span> çatısı altında.
//           </p>

//           {/* CTA Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
//             <Button size="lg" asChild>
//               <Link href="/iletisim">
//                 Hemen Başlayın
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//             <Button variant="outline" size="lg" asChild>
//               <Link href="/hakkimizda">Hakkımızda</Link>
//             </Button>
//           </div>

//           {/* Key Stats */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
//             <div className="flex flex-col items-center space-y-2">
//               <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
//                 <Factory className="h-6 w-6 text-primary" />
//               </div>
//               <div className="text-2xl font-bold text-foreground">2</div>
//               <div className="text-sm text-muted-foreground">Üretim Tesisi</div>
//             </div>
//             <div className="flex flex-col items-center space-y-2">
//               <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
//                 <Package className="h-6 w-6 text-primary" />
//               </div>
//               <div className="text-2xl font-bold text-foreground">1000+</div>
//               <div className="text-sm text-muted-foreground">Ambalaj Çeşidi</div>
//             </div>
//             <div className="flex flex-col items-center space-y-2">
//               <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
//                 <Truck className="h-6 w-6 text-primary" />
//               </div>
//               <div className="text-2xl font-bold text-foreground">24/7</div>
//               <div className="text-sm text-muted-foreground">Operasyon Desteği</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }
