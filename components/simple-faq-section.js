import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export function SimpleFAQSection() {
  const faqs = [
    {
      question: "Kozmetik fason üretim için minimum sipariş miktarı nedir?",
      answer: "Kozmetik fason üretim için minimum sipariş miktarımız ürün tipine göre değişmektedir. Krem ve losyon gibi ürünler için 500 adet, şampuan ve duş jeli için 300 adet minimum sipariş alıyoruz. ISO 22716 sertifikalı tesisimizde GMP standartlarında üretim yapıyoruz.",
      category: "Fason Üretim"
    },
    {
      question: "Kaç çeşit ambalaj seçeneğiniz var?",
      answer: "5000+ farklı ambalaj seçeneğimiz bulunmaktadır. Airless şişeler, pompa şişeler, spray şişeler, cam kavanozlar, tüp ambalajlar ve serum damlalıkları başlıca kategorilerimizdir. Tüm ambalajlarımız FDA ve EU standartlarında üretilmiştir.",
      category: "Ambalaj Çözümleri"
    },
    {
      question: "Hangi e-ticaret platformları ile entegre çalışıyorsunuz?",
      answer: "Trendyol, Amazon, Hepsiburada, N11, GittiGidiyor, Shopify, WooCommerce, OpenCart, Magento, PrestaShop gibi 10+ platform ile entegre çalışıyoruz. WMS sistemimiz sayesinde gerçek zamanlı stok takibi yapılmaktadır.",
      category: "E-Ticaret Operasyon"
    },
    {
      question: "Dijital pazarlama hizmetleriniz nelerdir?",
      answer: "Profesyonel ürün fotoğraf çekimi, influencer kampanya yönetimi, Google Ads ve Meta reklam yönetimi, sosyal medya content üretimi, SEO optimizasyonu ve marka danışmanlığı hizmetleri veriyoruz.",
      category: "Dijital Pazarlama"
    },
    {
      question: "Fason üretim süreniz ne kadar?",
      answer: "Standart formülasyonlar için 10-15 iş günü, özel formülasyon geliştirme ile birlikte 20-25 iş günü sürmektedir. Acil siparişler için 7 iş günü express üretim hizmeti de sunuyoruz.",
      category: "Fason Üretim"
    },
    {
      question: "Ambalaj minimum sipariş miktarları nedir?",
      answer: "Cam kavanozlar için 100 adet, airless şişeler için 150 adet, pompa şişeler için 300 adet, spray şişeler için 200 adet minimum sipariş alıyoruz. Stoklu ürünlerde 2-3 gün teslimat süresi vardır.",
      category: "Ambalaj Çözümleri"
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
            <HelpCircle className="h-4 w-4 mr-2" />
            Sık Sorulan Sorular
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-indigo-600 dark:text-indigo-400">Merak Ettikleriniz</span> Burada
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Fason üretim, ambalaj çözümleri, e-ticaret operasyonu ve dijital pazarlama hakkında 
            <strong> en çok sorulan soruların</strong> cevaplarını burada bulabilirsiniz.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {faqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardContent className="p-6">
                <div className="mb-3">
                  <Badge variant="outline" className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                    {faq.category}
                  </Badge>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg leading-tight">
                  {faq.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* İletişim Çağrısı */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-6 text-indigo-200 dark:text-indigo-300" />
          <h3 className="text-3xl font-bold mb-4">
            Sorunuzun Cevabını Bulamadınız mı?
          </h3>
          <p className="text-xl text-indigo-100 dark:text-indigo-200 mb-8 max-w-2xl mx-auto">
            Uzman ekibimiz <strong>size özel çözümler</strong> üretmek için hazır. 
            <strong>Ücretsiz danışmanlık</strong> için hemen iletişime geçin!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg">
              <Link href="tel:+905314942594">
                <Phone className="mr-2 h-5 w-5" />
                Hemen Arayın
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/80 text-white hover:bg-white hover:text-indigo-600 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-indigo-700 bg-white/10 backdrop-blur-sm">
              <Link href="/iletisim">
                <Mail className="mr-2 h-5 w-5" />
                E-posta Gönderin
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-indigo-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">48 Saat</div>
                <div className="text-indigo-200">İçinde Geri Dönüş</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Ücretsiz</div>
                <div className="text-indigo-200">Danışmanlık</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">6+ Yıl</div>
                <div className="text-indigo-200">Sektör Deneyimi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
