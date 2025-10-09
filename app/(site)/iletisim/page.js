import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Building,
  ArrowRight,
  MessageCircle,
  Users,
  CheckCircle,
  HelpCircle,
  Palette,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { site } from "@/config/site";
import ContactForm from "@/components/contact-form";

// SEO Metadata and Structured Data
export const metadata = {
  title:
    "İletişim | MKNGROUP - Contract Manufacturing ve Fason Üretim İletişim Bilgileri",
  description:
    "MKNGROUP ile iletişime geçin. Kozmetik, gıda takviyesi ve temizlik ürünleri contract manufacturing hizmetleri için uzman ekibimizle görüşün. 7/24 destek, ücretsiz danışmanlık.",
  keywords: [
    "MKNGROUP iletişim",
    "contract manufacturing iletişim",
    "fason üretim iletişim",
    "üretim hizmetleri iletişim",
    "istanbul üretim firması iletişim",
    "kozmetik üretim iletişim",
    "gıda takviyesi üretim iletişim",
    "temizlik ürünleri üretim iletişim",
    "üretim teklifi al",
    "fason üretim teklifi",
    "contract manufacturing teklifi",
    "üretim partneri iletişim",
    "istanbul esenyurt üretim",
    "beylikdüzü üretim tesisi",
    "ISO sertifikalı üretim iletişim",
    "GMP üretim tesisi iletişim",
    "ücretsiz üretim danışmanlığı",
    "mkngroup telefon",
    "mkngroup adres",
    "mkngroup email",
  ],
  authors: [{ name: "MKNGROUP", url: "https://www.mkngroup.com.tr" }],
  creator: "MKNGROUP",
  publisher: "MKNGROUP",
  category: "Contact Information",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.mkngroup.com.tr/iletisim",
    languages: {
      "tr-TR": "https://www.mkngroup.com.tr/iletisim",
      "en-US": "https://www.mkngroup.com.tr/en/contact",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://www.mkngroup.com.tr/iletisim",
    siteName: "MKNGROUP",
    title: "İletişim | MKNGROUP Contract Manufacturing",
    description:
      "MKNGROUP ile iletişime geçin. ISO sertifikalı tesislerde contract manufacturing hizmetleri için uzman ekibimizle görüşün. Ücretsiz danışmanlık ve hızlı teklif.",
    images: [
      {
        url: "https://www.mkngroup.com.tr/mkngroup-contact-manufacturing-facility.png",
        width: 1200,
        height: 630,
        alt: "MKNGROUP Contract Manufacturing İletişim",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup_x",
    creator: "@mkngroup_x",
    title: "İletişim | MKNGROUP Contract Manufacturing",
    description:
      "ISO sertifikalı tesislerde contract manufacturing. Ücretsiz danışmanlık için iletişime geçin.",
    images: [
      "https://www.mkngroup.com.tr/mkngroup-contact-manufacturing-facility.png",
    ],
  },
};

export default function ContactPage() {
  // Structured Data for Contact Page
  const contactStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    mainEntity: {
      "@type": "Organization",
      name: "MKNGROUP",
      url: "https://www.mkngroup.com.tr",
      logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+90 531 494 25 94",
        contactType: "Customer Service",
        areaServed: "TR",
        availableLanguage: ["Turkish", "English"],
        hoursAvailable: "Mo-Fr 08:30-18:00",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5",
        addressLocality: "Esenyurt",
        addressRegion: "İstanbul",
        addressCountry: "TR",
        postalCode: "34524",
      },
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactStructuredData),
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 dark:from-background dark:via-primary/10 dark:to-primary/20">
        {/* Enhanced Hero Section */}
        <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <Badge
                variant="outline"
                className="mb-8 text-primary border-primary text-sm px-4 py-2"
              >
                📞 Contract Manufacturing İletişim
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="text-primary">İletişime</span>
                <br className="hidden lg:block" />
                <span className="text-blue-600">Geçin</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                <strong>Contract manufacturing</strong> ve{" "}
                <strong>fason üretim</strong> ihtiyaçlarınız için uzman
                ekibimizle iletişime geçin.{" "}
                <strong>Ücretsiz danışmanlık</strong> ve
                <strong> 24 saat içinde geri dönüş</strong> garantisi ile size
                özel çözümler sunuyoruz.
              </p>
            </div>

            {/* Quick Contact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">24h</div>
                <div className="text-sm text-muted-foreground">Geri Dönüş</div>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  7/24
                </div>
                <div className="text-sm text-muted-foreground">Destek</div>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Uzman</div>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  Ücretsiz
                </div>
                <div className="text-sm text-muted-foreground">Danışmanlık</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Contact Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Contact Cards */}
              <div className="space-y-8">
                {/* Headquarters Card */}
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-8 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Building className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl mb-2 text-primary">
                          Genel Merkez
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          Ana Ofis
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1 text-foreground">
                            Adres
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {site.contact.headquarters.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1 text-foreground">
                            Telefon
                          </h4>
                          <p className="text-muted-foreground font-medium">
                            {site.contact.headquarters.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1 text-foreground">
                            E-posta
                          </h4>
                          <p className="text-muted-foreground">
                            {site.contact.headquarters.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Working Hours Card */}
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-8 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/20 dark:to-transparent">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                        <Clock className="h-7 w-7 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl mb-2 text-green-600">
                          Çalışma Saatleri
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs border-green-200 text-green-600"
                        >
                          7/24 Destek
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
                        <span className="font-medium text-foreground">
                          Pazartesi - Cuma:
                        </span>
                        <span className="font-bold text-green-600">
                          {site.contact.workingHours.weekdays}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
                        <span className="font-medium text-foreground">
                          Cumartesi:
                        </span>
                        <span className="font-bold text-green-600">
                          {site.contact.workingHours.saturday}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
                        <span className="font-medium text-foreground">
                          Pazar:
                        </span>
                        <span className="font-bold text-green-600">
                          {site.contact.workingHours.sunday}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Middle and Right Columns - Form and Map */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Form Component */}
                <ContactForm />

                {/* Enhanced Map */}
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-blue-600">
                          Konum
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Akçaburgaz Mah, Esenyurt/İstanbul
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="aspect-video w-full">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1264.5085347671104!2d28.626822037032817!3d41.079372449662856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1str!2str!4v1757167728449!5m2!1str!2str"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </Card>

                {/* Enhanced FAQ Section */}
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-8 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/20 dark:to-transparent">
                    <CardHeader className="p-0 mb-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                          <HelpCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-orange-600">
                            Sıkça Sorulan Sorular
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            En çok merak edilen konular
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="item-1"
                        className="border-orange-100"
                      >
                        <AccordionTrigger className="hover:text-orange-600">
                          Minimum sipariş miktarınız nedir?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          Ürün kategorisine göre değişmekle birlikte, genellikle
                          kozmetik ürünlerde 1000 adet, temizlik ürünlerinde 500
                          litre minimum sipariş kabul etmekteyiz. Detaylı bilgi
                          için lütfen bizimle iletişime geçiniz.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-2"
                        className="border-orange-100"
                      >
                        <AccordionTrigger className="hover:text-orange-600">
                          Üretim süreci ne kadar sürer?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          Standart ürünlerde teslimat süresi 2-3 hafta
                          arasındadır. Özel formülasyon gerektiren ürünlerde bu
                          süre 4-6 haftaya çıkabilmektedir. Ambalaj temininin
                          müşteri tarafından sağlanması durumunda süreç daha
                          hızlı ilerleyebilir.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-3"
                        className="border-orange-100"
                      >
                        <AccordionTrigger className="hover:text-orange-600">
                          Kendi markamı oluşturmak istiyorum. Yardımcı olabilir
                          misiniz?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          Evet, MKN Group olarak "Private Label" (özel
                          markalama) hizmetimiz ile kendi markanızı
                          oluşturmanıza yardımcı oluyoruz. Formülasyon, ambalaj
                          tasarımı, etiketleme ve gerekli yasal izinlerin
                          alınması konusunda tam destek sağlıyoruz.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-4"
                        className="border-orange-100"
                      >
                        <AccordionTrigger className="hover:text-orange-600">
                          Hangi sertifikalara sahipsiniz?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          Tesislerimiz ISO 9001, ISO 22716 (GMP), ISO 14001 ve
                          ISO 45001 sertifikalarına sahiptir. Ayrıca ürettiğimiz
                          ürünlere talep doğrultusunda Helal Sertifikası ve
                          hayvan deneyi yapılmadığına dair sertifikalar da
                          sağlayabilmekteyiz.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        value="item-5"
                        className="border-orange-100"
                      >
                        <AccordionTrigger className="hover:text-orange-600">
                          Yurtdışına ihracat yapıyor musunuz?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          Evet, Avrupa Birliği, Orta Doğu, Afrika ve Orta Asya
                          ülkelerine düzenli olarak ihracat
                          gerçekleştirmekteyiz. Farklı ülkelerin
                          regülasyonlarına uygun ürün geliştirme ve
                          sertifikalandırma konusunda deneyimli bir ekibe
                          sahibiz.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-purple-50/20 dark:from-primary/20 dark:via-primary/10 dark:to-purple-900/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge
                variant="outline"
                className="mb-6 text-primary border-primary"
              >
                🚀 Contract Manufacturing Uzmanı
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-primary">Projelerinizi</span>
                <br className="hidden lg:block" />
                <span className="text-blue-600">Hayata Geçirelim</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                <strong>Üretim</strong> ve <strong>ambalaj</strong>{" "}
                süreçlerinizde profesyonel destek için hemen iletişime geçin.{" "}
                <strong>24 saat içinde geri dönüş</strong> garantisi ile size
                özel çözümler sunuyoruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                  asChild
                >
                  <Link href="/tasarim">
                    <Palette className="mr-2 h-5 w-5" />
                    Tasarım Hizmetleri
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 hover:bg-primary/5"
                  asChild
                >
                  <Link href="/hakkimizda">
                    <Users className="mr-2 h-5 w-5" />
                    Hakkımızda
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
