import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 text-balance">
            Projenizi Bugün Başlatalım
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Uzman ekibimizle iletişime geçin ve işinizi bir sonraki seviyeye taşıyacak çözümleri keşfedin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link href="/iletisim">
                <Mail className="mr-2 h-4 w-4" />
                İletişime Geçin
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="tel:+905314942594">
                <Phone className="mr-2 h-4 w-4" />
                Hemen Arayın
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">Ücretsiz</div>
              <div className="text-sm text-muted-foreground">Danışmanlık</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">24 Saat</div>
              <div className="text-sm text-muted-foreground">Geri Dönüş</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">Özel</div>
              <div className="text-sm text-muted-foreground">Çözümler</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
