import Link from "next/link"
import { Package, Box, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PackagingSection() {
  const items = [
    { icon: Box, title: "Flakon & Şişe", desc: "Cam, plastik ve özel kaplama seçenekleri." },
    { icon: Package, title: "Kutu & Ambalaj", desc: "Marka odaklı tasarım ve sürdürülebilir malzeme alternatifleri." },
    { icon: Layers, title: "Özelleştirme", desc: "Baskı, etiketleme ve tam paketleme çözümleri." },
  ]

  return (
    <section className="py-20 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">Kozmetik Ambalaj Tedariki</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Markanıza uygun ambalaj çözümleri; sürdürülebilir, estetik ve üretime hazır tedarik altyapısı.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <div key={it.title} className="bg-card border-0 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{it.title}</h4>
                <p className="text-sm text-muted-foreground">{it.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/ambalaj">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">Ambalaj Kataloğu</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
