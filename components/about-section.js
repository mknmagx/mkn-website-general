import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Award,
  TrendingUp,
  Shield,
  Factory,
  Users,
  Globe,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export function AboutSection() {
  const achievements = [
    {
      icon: Factory,
      number: "10,600m²",
      label: "Modern Üretim Tesisi",
      color: "text-blue-400",
    },
    {
      icon: Award,
      number: "ISO 22716",
      label: "Sertifikalı Üretim",
      color: "text-green-400",
    },
    {
      icon: Users,
      number: "75+",
      label: "Uzman Ekip",
      color: "text-cyan-400",
    },
    {
      icon: Globe,
      number: "6+",
      label: "Yıl Deneyim",
      color: "text-emerald-400",
    },
  ];

  const trustedFeatures = [
    "ISO 22716 Sertifikalı Kozmetik Üretimi",
    "GMP Standardında Üretim Kalitesi",
    "5000+ Premium Ambalaj Seçeneği",
    "24 Saat İçinde Sevkiyat Garantisi",
    "Profesyonel R&D Laboratuvarı",
    "1000+ Başarılı Proje Deneyimi",
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 text-gray-900 dark:text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.4),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.3),transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge
              variant="outline"
              className="mb-6 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-300/50 bg-blue-100 dark:bg-blue-500/10"
            >
              <Award className="h-4 w-4 mr-2" />
              Hakkımızda
            </Badge>

            <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight text-gray-900 dark:text-white">
              Türkiye'nin{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                Güvenilir Üretim
              </span>{" "}
              Partneri
            </h2>

            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              <span className="font-semibold text-gray-900 dark:text-white">2019</span>'dan bu yana{" "}
              <span className="font-montserrat font-semibold text-blue-600 dark:text-blue-400">
                MKN GROUP
              </span>{" "}
              olarak, kozmetik sektöründe öncü teknolojiler ve kaliteli üretim
              anlayışımızla markaların büyüme yolculuğunda güvenilir partneri
              olmaya devam ediyoruz.
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">İstanbul merkezli</strong> modern
              tesisimizde, kozmetik üretiminden e-ticaret operasyonlarına,
              ambalaj çözümlerinden dijital pazarlamaya kadar{" "}
              <strong className="text-blue-600 dark:text-blue-400">360° hizmet</strong> sunuyoruz.
            </p>

            {/* Güven Unsurları */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ✨ Neden MKN GROUP?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trustedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/hakkimizda">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 group px-8 shadow-lg"
                >
                  Hikayemizi Keşfedin
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/iletisim">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 dark:border-white/30 text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 px-8"
                >
                  İletişime Geçin
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* Ana İstatistik Kartları */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/50 dark:border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`h-10 w-10 rounded-lg bg-white/60 dark:bg-white/20 flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${achievement.color}`}
                        />
                      </div>
                    </div>
                    <div
                      className={`text-2xl sm:text-3xl font-bold ${achievement.color} mb-1`}
                    >
                      {achievement.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                      {achievement.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Başarı Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-500/20 dark:to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-200 dark:border-green-500/20">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
                <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                  1000+
                </div>
                <div className="text-green-600 dark:text-green-100 text-sm">Başarılı Proje</div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-500/20 dark:to-violet-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-200 dark:border-purple-500/20">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                  200+
                </div>
                <div className="text-purple-600 dark:text-purple-100 text-sm">Mutlu Müşteri</div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
