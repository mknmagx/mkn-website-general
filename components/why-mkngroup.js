import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, Layers, Zap } from "lucide-react";

export function WhyMKNGroup() {
  const advantages = [
    {
      icon: Globe,
      title: "Global Deneyim",
      description:
        "15+ yıllık uluslararası tecrübe ile dünya standartlarında üretim ve operasyon çözümleri sunuyoruz.",
      badge: "Dünya Standartı",
    },
    {
      icon: Users,
      title: "Profesyonel Ekip",
      description:
        "Alanında uzman 50+ kişilik ekibimiz ile projelerinizi baştan sona profesyonelce yönetiyoruz.",
      badge: "Uzman Kadro",
    },
    {
      icon: Layers,
      title: "Uçtan Uca Çözümler",
      description:
        "Üretimden pazarlamaya, depolamadan lojistiğe kadar tüm süreçleri tek çatı altında yönetiyoruz.",
      badge: "Tam Entegrasyon",
    },
    {
      icon: Zap,
      title: "Esnek Kapasite",
      description:
        "Dinamik üretim kapasitemiz ile küçük partilerden büyük siparişlere kadar her ihtiyacınızı karşılıyoruz.",
      badge: "Hızlı Çözüm",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
          >
            Neden <span className="font-montserrat font-semibold">MKNGROUP</span>?
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Markanızı Geleceğe Taşıyan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              Güçlü Avantajlar
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Sektördeki derin deneyimimiz ve yenilikçi yaklaşımımızla, işinizi
            bir sonraki seviyeye taşıyacak çözümler sunuyoruz. İşte bizi tercih
            etmenizi sağlayan temel değerlerimiz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-700 dark:text-blue-300 border-0"
                    >
                      {advantage.badge}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
            <Zap className="w-5 h-5" />
            <span>Güçlü partnerlik için hazırız!</span>
          </div>
        </div>
      </div>
    </section>
  );
}
