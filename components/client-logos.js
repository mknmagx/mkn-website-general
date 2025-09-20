import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function ClientLogos() {
  // Placeholder client logos - these would be replaced with actual client logos
  const clients = [
    { name: "Müşteri 1", logo: "/corporate-logo-1.png" },
    { name: "Müşteri 2", logo: "/corporate-logo-2.png" },
    { name: "Müşteri 3", logo: "/corporate-logo-3.png" },
    { name: "Müşteri 4", logo: "/corporate-logo-4.png" },
    { name: "Müşteri 5", logo: "/corporate-logo-5.png" },
    { name: "Müşteri 6", logo: "/corporate-logo-6.png" },
  ];

  return (
    <section className="py-16 bg-background dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            🤝 Güvenilir Ortaklıklar
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-primary">200+</span> Güvenilir
            <br className="hidden lg:block" />
            <span className="text-blue-600">Marka Ortağı</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Sektörün önde gelen markaları tarafından tercih edilen üretim ve
            operasyon çözümleri ile{" "}
            <strong>contract manufacturing mükemmelliği</strong>
          </p>
        </div>

        {/* Referans logoları */}
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center max-w-6xl mx-auto">
            {clients.map((client, index) => (
              <Card
                key={index}
                className="group border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6 flex items-center justify-center">
                  <Image
                    src={client.logo || "/placeholder.svg"}
                    alt={`${client.name} logosu`}
                    width={120}
                    height={60}
                    className="opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-blue-500/10 to-primary/10 rounded-3xl p-8 max-w-5xl mx-auto border">
            <h3 className="text-2xl font-bold text-center mb-8">
              📊 Referans Portföyümüz
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">200+</div>
                <div className="text-sm text-muted-foreground">
                  Marka Ortağı
                  <br />
                  Güveni
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
                <div className="text-sm text-muted-foreground">
                  İhracat Ülkesi
                  <br />
                  Deneyimi
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  1000+
                </div>
                <div className="text-sm text-muted-foreground">
                  Başarılı Proje
                  <br />
                  Teslimi
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  99.8%
                </div>
                <div className="text-sm text-muted-foreground">
                  Müşteri Memnuniyet
                  <br />
                  Oranı
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
