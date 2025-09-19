import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search, Home, FileX } from "lucide-react";
import { SEOHead } from "@/components/seo-head";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead
        title="Blog Yazısı Bulunamadı | MKN Group"
        description="Aradığınız blog yazısı bulunamadı. MKN Group blog sayfasına dönün ve diğer yazılarımızı keşfedin."
        canonical="https://mkngroup.com.tr/blog"
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Blog&apos;a Dön
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-16 lg:py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full"></div>
              <FileX className="w-16 h-16 text-orange-600 dark:text-orange-400 relative z-10" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-12">
            <h1 className="text-6xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-4">
              404
            </h1>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
              Blog Yazısı Bulunamadı
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.
              Diğer blog yazılarımızı keşfetmek için blog sayfamıza
              dönebilirsiniz.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/blog">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 w-full sm:w-auto"
              >
                <Search className="w-5 h-5 mr-2" />
                Blog Yazılarını Keşfet
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 px-8 py-3 rounded-full font-medium transition-all duration-300 w-full sm:w-auto"
              >
                <Home className="w-5 h-5 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>

          {/* Suggestions */}
          <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Aradığınızı Bulamadınız mı?
              </h3>
              <div className="text-left space-y-3 text-gray-600 dark:text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  URL&apos;nin doğru yazıldığından emin olun
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  Blog kategorilerini kontrol edin
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  Ana sayfa üzerinden arama yapın
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  İletişime geçin ve yardım alın
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Hala yardıma mı ihtiyacınız var?
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
            >
              Bizimle İletişime Geçin
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
