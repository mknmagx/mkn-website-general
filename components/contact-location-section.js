import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ContactLocationSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Bizimle <span className="text-green-600 dark:text-green-400">İletişime Geçin</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Projeniz için hemen danışmanlık alın. İstanbul merkezli tesisimizde uzman ekibimizle buluşun.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* İletişim Bilgileri */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Telefon</div>
                <div className="text-green-600 dark:text-green-400">+90 531 494 25 94</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">7/24 WhatsApp Destek</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">E-posta</div>
                <div className="text-blue-600 dark:text-blue-400">info@mkngroup.com.tr</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">48 saat içinde yanıt</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Adres</div>
                <div className="text-purple-600 dark:text-purple-400">Akçaburgaz Mah, 3026 Sk, No:5, Esenyurt, İstanbul</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">15,000m² Modern Tesis</div>
              </div>
            </div>
          </div>

          {/* Hızlı İletişim */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Hemen Başlayalım</h3>
            <p className="text-green-100 mb-6">
              Projenizi 5 dakikada paylaşın, 48 saat içinde özel teklifimizi alın.
            </p>
            
            <div className="space-y-3">
              <Button asChild className="w-full bg-white text-green-600 hover:bg-gray-100">
                <Link href="/teklif">
                  Hızlı Teklif Al
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full border-white/80 text-white hover:bg-white hover:text-green-600 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-green-700 bg-white/10 backdrop-blur-sm">
                <Link href="https://wa.me/905314942594" target="_blank">
                  WhatsApp ile Yaz
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-green-500">
              <div className="text-center">
                <div className="text-lg font-bold">48 Saat</div>
                <div className="text-xs text-green-200">Geri Dönüş</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">Ücretsiz</div>
                <div className="text-xs text-green-200">Danışmanlık</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
