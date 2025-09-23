import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Search,
  Home,
  AlertTriangle,
  Compass,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { SEOHead } from "@/components/seo-head";

export default function NotFound() {
  const popularPages = [
    {
      title: "Fason Üretim",
      description: "Kozmetik, temizlik ve gıda takviyesi üretimi",
      href: "/fason-uretim",
      icon: "🏭",
    },
    {
      title: "Ambalaj Çözümleri",
      description: "Özel tasarım ambalaj ve etiket hizmetleri",
      href: "/ambalaj",
      icon: "📦",
    },
    {
      title: "Tesislerimiz",
      description: "10.600m² modern üretim tesisleri",
      href: "/tesisler",
      icon: "🏢",
    },
    {
      title: "Hakkımızda",
      description: "MKN Group'un hikayesi ve değerleri",
      href: "/hakkimizda",
      icon: "🎯",
    },
  ];

  const quickActions = [
    {
      title: "Ücretsiz Teklif",
      description: "Projeniz için hemen teklif alın",
      href: "/teklif",
      icon: Mail,
      variant: "default",
    },
    {
      title: "Hemen Arayın",
      description: "+90 531 494 25 94",
      href: "tel:+905314942594",
      icon: Phone,
      variant: "outline",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEOHead
        title="Sayfa Bulunamadı (404) | MKN Group"
        description="Aradığınız sayfa bulunamadı. MKN Group ana sayfasına dönün ve hizmetlerimizi keşfedin."
        canonical="https://mkngroup.com.tr"
        noindex={true}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-16 lg:py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* 404 Animation */}
            <div className="mb-8">
              <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-tr from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full"></div>
                <AlertTriangle className="w-20 h-20 text-primary relative z-10" />
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-12">
              <h1 className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
                404
              </h1>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Sayfa Bulunamadı
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8">
                Aradığınız sayfa mevcut değil, taşınmış veya geçici olarak
                erişilemiyor olabilir. Aşağıdaki bağlantıları kullanarak
                aradığınızı bulabilirsiniz.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    size="lg"
                    className="px-8 py-4 text-lg"
                    asChild
                  >
                    <Link href={action.href}>
                      <action.icon className="mr-2 h-5 w-5" />
                      {action.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Pages */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-4">
                <Compass className="w-4 h-4" />
                Popüler Sayfalar
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Size Yardımcı Olabilecek Sayfalar
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                En çok ziyaret edilen sayfalarımızdan birini seçin
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularPages.map((page, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{page.icon}</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {page.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {page.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link href={page.href}>Sayfayı Ziyaret Et</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Search and Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Search Section */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Arama Yapın
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Site haritamızda aradığınızı bulamadınız mı? Doğrudan arama
                  yapabilirsiniz.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/sitemap">
                      <Compass className="mr-2 h-4 w-4" />
                      Site Haritası
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/blog">
                      <Search className="mr-2 h-4 w-4" />
                      Blog Yazıları
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Yardıma İhtiyacınız Var mı?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Aradığınızı bulamıyorsanız bizimle iletişime geçin. Size
                  yardımcı olmaktan mutluluk duyarız.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/iletisim">
                      <Mail className="mr-2 h-4 w-4" />
                      İletişim Formu
                    </Link>
                  </Button>
                  <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                    <Phone className="mr-2 h-4 w-4" />
                    <a
                      href="tel:+905314942594"
                      className="hover:text-primary transition-colors"
                    >
                      +90 531 494 25 94
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section - Company Info */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl p-8 border max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/MKN-GROUP-LOGO.png"
                  alt="MKN Group"
                  className="h-12 w-auto"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                MKN Group
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                6+ yıllık deneyimimizle kozmetik, temizlik ürünleri ve gıda
                takviyesi fason üretiminde Türkiye'nin güvenilir partneri.
                10.600m² modern tesislerimizde kaliteli üretim.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Ana Sayfa
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/hakkimizda">
                    <MapPin className="mr-2 h-4 w-4" />
                    Hakkımızda
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
