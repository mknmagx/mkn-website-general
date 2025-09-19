import React from "react";
import {
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  Package,
  Truck,
  CreditCard,
  Shield,
  Users,
  Factory,
  Palette,
  Globe,
  Award,
  Recycle,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SSSClientComponent } from "./sss-client";
import { site } from "@/config/site";

// FAQ Data organized by categories
const faqCategories = {
  genel: {
    title: "Genel Sorular",
    icon: "HelpCircle",
    color: "blue",
    questions: [
      {
        id: 1,
        question: "MKN Group hangi hizmetleri sunmaktadır?",
        answer: "MKN Group olarak kozmetik fason üretimi, gıda takviyesi üretimi, temizlik ürünleri üretimi, ambalaj tedariki, e-ticaret operasyon yönetimi, depo-kargo hizmetleri, dijital pazarlama ve tasarım hizmetleri sunmaktayız. Üretimden pazarlamaya kadar tüm süreçlerde yanınızdayız."
      },
      {
        id: 2,
        question: "Hangi bölgelere hizmet veriyorsunuz?",
        answer: "Türkiye genelinde hizmet vermekteyiz. Fabrikamız İstanbul'da bulunmakta olup, kargo ağımız sayesinde tüm Türkiye'ye güvenli teslimat yapabilmekteyiz. Ayrıca ihracat hizmetleri ile uluslararası pazarlara da ulaşım sağlayabilmekteyiz."
      },
      {
        id: 3,
        question: "Minimum sipariş miktarları nelerdir?",
        answer: "Minimum sipariş miktarları ürün grubuna göre değişmektedir. Kozmetik ürünler için genellikle 500-1000 adet, gıda takviyeleri için 1000-2000 adet minimum sipariş gereklidir. Detaylı bilgi için bizimle iletişime geçebilirsiniz."
      },
      {
        id: 4,
        question: "Üretim süreçlerinizde hangi kalite standartlarını uyguluyorsunuz?",
        answer: "ISO 9001, ISO 22000, GMP (Good Manufacturing Practice) ve HACCP standartlarına uygun üretim yapmaktayız. Tüm ürünlerimiz Sağlık Bakanlığı onaylı tesisimizde üretilmekte ve kalite kontrol testlerinden geçmektedir."
      }
    ]
  },
  uretim: {
    title: "Üretim Hizmetleri",
    icon: "Factory",
    color: "green",
    questions: [
      {
        id: 5,
        question: "Fason üretim sürecinde nasıl bir yol izliyorsunuz?",
        answer: "Fason üretim sürecimiz şu aşamalardan oluşur: 1) İhtiyaç analizi ve formülasyon, 2) Numune hazırlama ve onay, 3) Ambalaj tasarımı, 4) Üretim planlaması, 5) Kalite kontrollü üretim, 6) Paketleme ve etiketleme, 7) Kalite kontrol testleri, 8) Sevkiyat. Her aşamada müşterimizle yakın iletişim halinde oluruz."
      },
      {
        id: 6,
        question: "Özel formülasyon hizmeti veriyor musunuz?",
        answer: "Evet, deneyimli R&D ekibimizle özel formülasyon hizmeti sunmaktayız. Müşterilerimizin ihtiyaçlarına göre kozmetik, gıda takviyesi ve temizlik ürünleri için özel formüller geliştirebilmekteyiz. Formülasyon geliştirme süreci 2-4 hafta arası sürmektedir."
      },
      {
        id: 7,
        question: "Üretim kapasiteleriniz nelerdir?",
        answer: "Günlük üretim kapasitemiz ürün tipine göre değişmektedir: Sıvı kozmetik ürünler için günde 10.000 adet, krem ve pomad formları için 8.000 adet, gıda takviyeleri için 15.000 adet kapasitesine sahipiz. Büyük siparişler için özel üretim planlaması yapabilmekteyiz."
      }
    ]
  },
  ambalaj: {
    title: "Ambalaj ve Tasarım",
    icon: "Package",
    color: "purple",
    questions: [
      {
        id: 8,
        question: "Ambalaj tasarımı hizmeti sunuyor musunuz?",
        answer: "Evet, profesyel tasarım ekibimizle ambalaj tasarımı, etiket tasarımı ve marka kimliği oluşturma hizmetleri sunmaktayız. Adobe programları ile 3D modelleme ve mockup hazırlama hizmetlerimiz mevcuttur. Tasarım süreci 5-10 iş günü arasında tamamlanır."
      },
      {
        id: 9,
        question: "Hangi ambalaj malzemelerini kullanıyorsunuz?",
        answer: "Geniş ambalaj yelpazesi sunmaktayız: Cam şişeler, plastik şişeler (PET, HDPE), airless pompalar, krem kavanozları, tüp ambalajlar, dropper şişeler, spray ambalajlar ve özel form ambalajlar. Tüm ambalajlarımız gıdaya uygun ve kozmetik standartlarına uygundur."
      },
      {
        id: 10,
        question: "Ambalaj örnekleri talep edebilir miyim?",
        answer: "Tabii ki! Seçeceğiniz ambalaj türlerinin örneklerini ücretsiz olarak gönderebiliriz. Örnek talep formumuzu doldurarak veya doğrudan bizimle iletişime geçerek ambalaj örneklerini inceleyebilirsiniz."
      }
    ]
  },
  lojistik: {
    title: "Lojistik ve Teslimat",
    icon: "Truck",
    color: "orange",
    questions: [
      {
        id: 11,
        question: "Teslimat süreleri ne kadardır?",
        answer: "Teslimat süreleri ürün tipine ve sipariş miktarına göre değişir: Stokta bulunan ürünler 1-3 iş günü, fason üretim siparişleri 10-20 iş günü, özel formülasyon gerektiren siparişler 15-25 iş günü içinde teslim edilir. Acil siparişler için hızlandırılmış üretim seçeneği mevcuttur."
        },
      {
        id: 12,
        question: "Kargo masrafları nasıl hesaplanır?",
        answer: "Kargo masrafları sipariş ağırlığı, hacmi ve teslimat adresine göre hesaplanır. 500 TL üzeri siparişlerde Türkiye geneli kargo ücretsizdir. Özel paketleme veya soğuk zincir gerektiren ürünler için ek ücret uygulanabilir."
      },
      {
        id: 13,
        question: "Uluslararası gönderim yapıyor musunuz?",
        answer: "Evet, uluslararası kargo ve ihracat hizmetlerimiz mevcuttur. AB ülkeleri, Ortadoğu ve Balkan ülkelerine düzenli gönderimlerimiz bulunmaktadır. İhracat için gerekli belgeler ve sertifikalar tarafımızdan hazırlanır."
      }
    ]
  },
  pazarlama: {
    title: "Pazarlama ve E-ticaret",
    icon: "Globe",
    color: "pink",
    questions: [
      {
        id: 14,
        question: "Dijital pazarlama hizmetleriniz nelerdir?",
        answer: "Sosyal medya yönetimi, Google Ads, Facebook Ads, Instagram Ads, SEO optimizasyonu, influencer marketing, içerik üretimi, e-ticaret mağaza kurulumu ve yönetimi hizmetleri sunmaktayız. Pazarlama stratejinizi A'dan Z'ye planlayıp uyguluyoruz."
      },
      {
        id: 15,
        question: "E-ticaret mağaza kurulumu yapıyor musunuz?",
        answer: "Evet, Trendyol, Hepsiburada, Amazon, N11 gibi pazaryerlerinde mağaza kurulumu ve yönetimi hizmetleri veriyoruz. Ayrıca kendi web siteniz için özel e-ticaret çözümleri de sunmaktayız. Ürün fotoğrafçılığı ve katalog hazırlama hizmetlerimiz de mevcuttur."
      }
    ]
  },
  finansal: {
    title: "Finansal ve Yasal",
    icon: "CreditCard",
    color: "yellow",
    questions: [
      {
        id: 16,
        question: "Ödeme seçenekleriniz nelerdir?",
        answer: "Nakit, kredi kartı, banka havalesi, çek ve vadeli ödeme seçeneklerimiz bulunmaktadır. Kurumsal müşterilerimiz için 30-60-90 gün vadeli ödeme imkanları sunmaktayız. POS cihazı ile kartlı ödeme de kabul etmekteyiz."
      },
      {
        id: 17,
        question: "Faturalama süreci nasıl işliyor?",
        answer: "E-fatura ve e-arşiv fatura sistemleri ile çalışmaktayız. Faturalar sipariş teslim edildikten sonra aynı gün kesilir. Kurumsal müşterilerimiz için özel faturalama seçenekleri mevcuttur."
      },
      {
        id: 18,
        question: "İade ve değişim politikanız nedir?",
        answer: "Ürün hatası veya hasar durumunda 14 gün içinde iade kabul edilir. Özel üretim ürünlerde iade kabul edilmez. İade edilen ürünler incelendikten sonra ücret iadesi veya yeni ürün gönderimi yapılır."
      }
    ]
  }
};

export const metadata = {
  title: "Sıkça Sorulan Sorular (SSS) | MKN Group",
  description: "MKN Group hakkında merak ettiğiniz tüm soruların yanıtlarını burada bulabilirsiniz. Üretim, ambalaj, lojistik ve pazarlama hizmetleri hakkında detaylı bilgiler.",
  keywords: "SSS, sıkça sorulan sorular, MKN Group, kozmetik üretim, fason üretim, ambalaj, lojistik, pazarlama",
  openGraph: {
    title: "Sıkça Sorulan Sorular | MKN Group",
    description: "MKN Group hakkında merak ettiğiniz tüm soruların yanıtlarını burada bulabilirsiniz.",
    type: "website",
    url: "https://mkngroup.com.tr/sss",
  },
  alternates: {
    canonical: "https://mkngroup.com.tr/sss",
  },
};

export default function SSS() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": Object.values(faqCategories).flatMap(category =>
              category.questions.map(q => ({
                "@type": "Question",
                "name": q.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": q.answer
                }
              }))
            )
          }),
        }}
      />

      {/* Interactive Client Component */}
      <SSSClientComponent faqCategories={faqCategories} />

      {/* Contact CTA Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Aradığınız Cevabı Bulamadınız mı?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Uzman ekibimiz size yardımcı olmaya hazır. Sorularınızı bizimle paylaşın,
              en kısa sürede size dönüş yapalım.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center border border-gray-200 dark:border-gray-700">
                <Phone className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Telefon
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {site.contact.headquarters.phone}
                </p>
              </Card>
              
              <Card className="p-6 text-center border border-gray-200 dark:border-gray-700">
                <Mail className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  E-posta
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {site.contact.headquarters.email}
                </p>
              </Card>
              
              <Card className="p-6 text-center border border-gray-200 dark:border-gray-700">
                <MessageCircle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Canlı Destek
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  7/24 Online
                </p>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
                <Link href="/iletisim">
                  İletişim Formu
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/teklif">
                  Teklif Al
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}