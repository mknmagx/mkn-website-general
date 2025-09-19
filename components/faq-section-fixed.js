import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Phone, Mail, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function FAQSection() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqCategories = [
    {
      category: "Fason Üretim",
      questions: [
        {
          question: "Kozmetik fason üretim için minimum sipariş miktarı nedir?",
          answer: "Kozmetik fason üretim için minimum sipariş miktarımız ürün tipine göre değişmektedir. Krem ve losyon gibi ürünler için 500 adet, şampuan ve duş jeli için 300 adet minimum sipariş alıyoruz. ISO 22716 sertifikalı tesisimizde GMP standartlarında üretim yapıyoruz.",
          keywords: "kozmetik fason üretim minimum, iso 22716 üretim, gmp standartları"
        },
        {
          question: "Fason üretim süreniz ne kadar?",
          answer: "Standart formülasyonlar için 10-15 iş günü, özel formülasyon geliştirme ile birlikte 20-25 iş günü sürmektedir. Acil siparişler için 7 iş günü express üretim hizmeti de sunuyoruz. Üretim öncesi numune hazırlama süresi 3-5 iş günüdür.",
          keywords: "fason üretim süresi, hızlı üretim, express üretim hizmeti"
        },
        {
          question: "Hangi ürün kategorilerinde fason üretim yapıyorsunuz?",
          answer: "Cilt bakım ürünleri (krem, serum, tonik), saç bakım ürünleri (şampuan, maskesi), vücut bakım ürünleri (losyon, duş jeli), temizlik ürünleri (deterjan, çok amaçlı temizleyici) ve gıda takviyesi üretimi yapıyoruz. 200+ farklı formülasyon deneyimimiz bulunmaktadır.",
          keywords: "kozmetik ürün çeşitleri, temizlik ürünü üretim, gıda takviyesi fason"
        }
      ]
    },
    {
      category: "Ambalaj Çözümleri", 
      questions: [
        {
          question: "Kaç çeşit ambalaj seçeneğiniz var?",
          answer: "5000+ farklı ambalaj seçeneğimiz bulunmaktadır. Airless şişeler, pompa şişeler, spray şişeler, cam kavanozlar, tüp ambalajlar ve serum damlalıkları başlıca kategorilerimizdir. Tüm ambalajlarımız FDA ve EU standartlarında, gıda sınıfı malzemelerden üretilmiştir.",
          keywords: "5000 ambalaj seçeneği, airless şişe toptan, pompa şişe üretici"
        },
        {
          question: "Ambalaj minimum sipariş miktarları nedir?",
          answer: "Cam kavanozlar için 100 adet, airless şişeler için 150 adet, pompa şişeler için 300 adet, spray şişeler için 200 adet minimum sipariş alıyoruz. Stoklu ürünlerde 2-3 gün, özel renk/baskı siparişlerinde 10-15 gün teslimat süresi vardır.",
          keywords: "ambalaj minimum sipariş, hızlı ambalaj teslimat"
        },
        {
          question: "Özel tasarım ambalaj yapıyor musunuz?",
          answer: "Evet, marka ihtiyaçlarınıza göre özel tasarım ambalaj üretimi yapıyoruz. Logo baskısı, özel renk, etiket tasarımı ve 3D görselleştirme hizmetlerimiz bulunmaktadır. Minimum 1000 adet sipariş ile özel üretim başlatıyoruz.",
          keywords: "özel tasarım ambalaj, logo baskılı ambalaj, özel renk ambalaj"
        }
      ]
    },
    {
      category: "E-Ticaret Operasyon",
      questions: [
        {
          question: "Hangi e-ticaret platformları ile entegre çalışıyorsunuz?",
          answer: "Trendyol, Amazon, Hepsiburada, N11, GittiGidiyor, Shopify, WooCommerce, OpenCart, Magento, PrestaShop gibi 10+ platform ile entegre çalışıyoruz. WMS sistemimiz sayesinde gerçek zamanlı stok takibi yapılmaktadır.",
          keywords: "e-ticaret platform entegrasyonu, wms depo yönetimi, trendyol amazon entegre"
        },
        {
          question: "Günlük kaç sipariş işleyebiliyorsunuz?",
          answer: "50,000+ aylık sipariş kapasitemiz ile günde ortalama 1,500-2,000 sipariş işleyebiliyoruz. Aynı gün kargo hazırlığı yapıyoruz ve 10+ kargo firması ile çalışarak en uygun kargo seçeneklerini sunuyoruz.",
          keywords: "yüksek sipariş kapasitesi, aynı gün kargo, 10 kargo firması"
        },
        {
          question: "Müşteri hizmetleri desteği veriyor musunuz?",
          answer: "7/24 profesyonel müşteri hizmetleri ekibimiz vardır. Telefon, e-posta, canlı chat ve WhatsApp üzerinden çoklu kanal destek sunuyoruz. Sipariş takibi, iade işlemleri ve müşteri şikayetlerini profesyonel şekilde yönetiyoruz.",
          keywords: "7/24 müşteri hizmetleri, çoklu kanal destek, profesyonel müşteri desteği"
        }
      ]
    },
    {
      category: "Dijital Pazarlama",
      questions: [
        {
          question: "Dijital pazarlama hizmetleriniz nelerdir?",
          answer: "Profesyonel ürün fotoğraf çekimi, influencer kampanya yönetimi, Google Ads ve Meta (Facebook/Instagram) reklam yönetimi, sosyal medya content üretimi, SEO optimizasyonu ve marka danışmanlığı hizmetleri veriyoruz.",
          keywords: "dijital pazarlama hizmetleri, influencer kampanya, google ads meta reklam"
        },
        {
          question: "İnfluencer kampanyalarında nasıl çalışıyorsunuz?",
          answer: "500+ influencer networkümüz ile mikro ve makro influencer kampanyaları düzenliyoruz. Hedef kitle analizi, influencer seçimi, içerik stratejisi, kampanya yönetimi ve performans raporlama yapıyoruz. ROI odaklı çalışırız.",
          keywords: "500 influencer network, mikro makro influencer, roi odaklı kampanya"
        },
        {
          question: "Reklam bütçesi minimum ne kadar olmalı?",
          answer: "Google Ads için minimum 5,000 TL/ay, Meta reklamları için minimum 3,000 TL/ay bütçe öneriyoruz. İnfluencer kampanyaları için 10,000 TL+ bütçeler ile etkili sonuçlar alınmaktadır. Bütçenizi optimize ederek maksimum ROI sağlarız.",
          keywords: "reklam bütçesi minimum, google ads bütçe, meta reklam bütçesi"
        }
      ]
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-indigo-600 border-indigo-200">
            <HelpCircle className="h-4 w-4 mr-2" />
            Sık Sorulan Sorular
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            <span className="text-indigo-600">Merak Ettikleriniz</span> Burada
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Fason üretim, ambalaj çözümleri, e-ticaret operasyonu ve dijital pazarlama hakkında 
            <strong> en çok sorulan soruların</strong> cevaplarını burada bulabilirsiniz.
          </p>
        </div>

        {/* FAQ Kategorileri */}
        <div className="space-y-12">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                <span className="text-indigo-600">{category.category}</span> Hakkında
              </h3>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const itemKey = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems[itemKey];
                  
                  return (
                    <Card key={questionIndex} className="bg-gray-50 border border-gray-200">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full p-6 text-left hover:bg-gray-100 transition-colors flex items-center justify-between"
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <p className="text-gray-700 leading-relaxed mb-3">
                              {faq.answer}
                            </p>
                            <div className="pt-3 border-t border-gray-200">
                              <div className="text-xs text-indigo-600 font-medium">
                                SEO Keywords: {faq.keywords}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* İletişim Çağrısı */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-6 text-indigo-200" />
          <h3 className="text-3xl font-bold mb-4">
            Sorunuzun Cevabını Bulamadınız mı?
          </h3>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Uzman ekibimiz <strong>size özel çözümler</strong> üretmek için hazır. 
            <strong>Ücretsiz danışmanlık</strong> için hemen iletişime geçin!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              <Link href="tel:+902123456789">
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
