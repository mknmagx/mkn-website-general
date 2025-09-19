import Link from "next/link";
import { Beaker, Zap, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ManufacturingSection() {
  const steps = [
    {
      icon: Beaker,
      title: "Formülasyon & Numune",
      desc: "Özel ihtiyaçlara göre formülasyon, stabilite ve numune üretimi ile hızlı onay döngüleri.",
    },
    {
      icon: ClipboardCheck,
      title: "Pilot & Sertifikasyon",
      desc: "Pilot üretim, kalite kontrolleri ve mevzuata uygun sertifikasyon süreçleri.",
    },
    {
      icon: Zap,
      title: "Seri Üretim & Paketleme",
      desc: "Esnek kapasitemizle kısa teslimatlar ve üretime hazır paketleme entegrasyonu.",
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Feature panel with gradient and stats */}
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-800 via-indigo-700 to-purple-700 opacity-95"></div>
            <div className="relative p-10 lg:p-14 text-white">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Kozmetik Fason Üretimi
              </h3>
              <p className="text-lg text-blue-100 mb-8 max-w-lg">
                Üretim süreçlerimiz; AR-GE, pilot üretim ve seri üretimi tek bir
                hat üzerinde birleştirir. Kalite ve teslimat hızını ön planda
                tutan yapımızla markanızın taleplerine özel çözümler üretiyoruz.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-blue-100">
                    Aylık Üretim Kapasitesi (kutu)
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">ISO & GMP</div>
                  <div className="text-sm text-blue-100">
                    Kalite ve izlenebilirlik
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">Hızlı</div>
                  <div className="text-sm text-blue-100">
                    Numune onayından seriye geçiş
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">Uzman Ekip</div>
                  <div className="text-sm text-blue-100">
                    Formülasyon & üretim ekipleri
                  </div>
                </div>
              </div>

              <div>
                <Link href="/teklif">
                  <Button className="bg-white text-blue-800 font-semibold border-0">
                    Kozmetik Fason Üretim Teklifi Al
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Vertical steps */}
          <div>
            <div className="space-y-6">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className="flex gap-6 items-start bg-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-foreground">
                          Adım {idx + 1}
                        </div>
                        <div className="text-sm text-muted-foreground">•</div>
                        <div className="text-sm text-muted-foreground">
                          Süreçteki rolümüz
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold mt-2 mb-1">
                        {s.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
