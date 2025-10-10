import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  TrendingUp,
  Award,
  Target,
  Palette,
  Camera,
  Video,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiceSchema, BreadcrumbSchema } from "@/components/structured-data";

export const metadata = {
  title:
    "Dijital Pazarlama & E-Ticaret Uzmanı | MKN GROUP - Meta Ads, Influencer Marketing, Pazaryeri Reklamcılığı",
  description:
    "Markanızı sıfırdan zirveye taşıyan dijital pazarlama uzmanları. E-ticaret pazarlaması, Meta Ads yönetimi, influencer marketing, Amazon & Trendyol pazaryeri reklamcılığı, Google Ads optimizasyonu. Garantili ROI ve satış artışı.",
  keywords:
    "dijital pazarlama uzmanı, e-ticaret pazarlaması, meta ads uzmanı, facebook instagram reklamları, influencer marketing ajansı, pazaryeri reklamcılığı, amazon reklamları, trendyol reklamları, google ads uzmanı, marka büyütme stratejileri, sosyal medya pazarlaması, performans pazarlaması, dijital reklam ajansı",
  alternates: {
    canonical: "https://www.mkngroup.com.tr/pazarlama",
  },
  openGraph: {
    title: "Dijital Pazarlama & E-Ticaret Uzmanı | MKN GROUP",
    description:
      "Markanızı sıfırdan zirveye taşıyan dijital pazarlama uzmanları. Meta Ads, influencer marketing, pazaryeri reklamcılığı ve e-ticaret pazarlaması.",
    url: "https://www.mkngroup.com.tr/pazarlama",
    siteName: "MKN GROUP",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dijital Pazarlama & E-Ticaret Uzmanı | MKN GROUP",
    description:
      "Markanızı sıfırdan zirveye taşıyan dijital pazarlama uzmanları.",
  },
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
};

export default function PazarlamaPage() {
  const serviceData = {
    name: "Dijital Pazarlama & E-Ticaret Uzmanı",
    description:
      "MKN GROUP olarak markanızı sıfırdan zirveye taşıyan kapsamlı dijital pazarlama hizmetleri sunuyoruz. E-ticaret pazarlaması, Meta Ads (Facebook & Instagram) yönetimi, influencer marketing kampanyaları, Amazon & Trendyol pazaryeri reklamcılığı, Google Ads optimizasyonu ve sosyal medya büyütme stratejileri ile garantili ROI ve satış artışı sağlıyoruz.",
    type: "Digital Marketing",
    category: "E-commerce & Performance Marketing",
  };

  const breadcrumbItems = [
    {
      name: "Ana Sayfa",
      url: "https://www.mkngroup.com.tr",
    },
    {
      name: "Pazarlama & Reklam",
      url: "https://www.mkngroup.com.tr/pazarlama",
    },
  ];

  const services = [
    {
      image: "/meta-ads-marketing.jpg",
      title: "Meta Ads Uzmanı (Facebook & Instagram Reklamları)",
      description:
        "Facebook ve Instagram reklamlarında uzman ekibimizle markanızın hedef kitlesine en etkili şekilde ulaşın. Görsel odaklı kampanyalar, video reklamları, carousel ads ve collection ads ile yüksek dönüşüm oranları elde edin. Pixel optimizasyonu, lookalike audience'lar ve retargeting stratejileri ile ROI'nizi maksimize edin.",
      features: [
        "Facebook & Instagram Reklam Yönetimi",
        "Pixel Kurulumu ve Optimizasyonu",
        "Lookalike & Custom Audience Oluşturma",
        "A/B Test ve Creative Optimizasyonu",
        "Retargeting ve Remarketing Kampanyaları",
        "Conversion API Entegrasyonu",
        "Shopping Ads & Dynamic Ads",
        "Video Ads ve Story Reklamları",
      ],
      benefits:
        "Meta Ads ile satışlarınızı %300'e kadar artırın, CPA'nızı %50 azaltın ve marka bilinirliğinizi güçlendirin.",
    },
    {
      image: "/ecommerce-marketing.jpg",
      title: "E-Ticaret Pazarlama Uzmanı",
      description:
        "E-ticaret sitenizin tüm pazarlama süreçlerini optimize ediyoruz. Conversion rate optimization (CRO), email marketing, cart abandonment kampanyaları, upsell/cross-sell stratejileri ve customer lifetime value artışı için kapsamlı e-ticaret pazarlama çözümleri sunuyoruz.",
      features: [
        "E-Ticaret SEO Optimizasyonu",
        "Conversion Rate Optimization (CRO)",
        "Email Marketing Automation",
        "Cart Abandonment Kampanyaları",
        "Product Feed Optimizasyonu",
        "Customer Journey Mapping",
        "Upsell & Cross-sell Stratejileri",
        "E-ticaret Analytics ve Raporlama",
      ],
      benefits:
        "E-ticaret satışlarınızı %250 artırın, conversion rate'inizi ikiye katlayın ve müşteri yaşam boyu değerini %180 yükseltin.",
    },
    {
      image: "/influencer-marketing.jpg",
      title: "Profesyonel Influencer Marketing Ajansı",
      description:
        "Markanıza uygun mikro ve makro influencer'larla stratejik kampanyalar yürütüyoruz. Instagram, TikTok, YouTube ve diğer platformlarda authentic içerik üretimiyle hedef kitlenize güvenilir bir şekilde ulaşın. Influencer seçimi, kampanya yönetimi ve performans analizi ile garantili sonuçlar.",
      features: [
        "Influencer Araştırma ve Seçimi",
        "Mikro & Makro Influencer Yönetimi",
        "Kampanya Stratejisi ve Planlama",
        "İçerik Koordinasyonu ve Onay Süreci",
        "Performance Tracking ve Analytics",
        "ROI ve Engagement Analizi",
        "Multi-Platform Kampanya Yönetimi",
        "Brand Safety ve Compliance",
      ],
      benefits:
        "Influencer marketing ile organik erişimi %400 artırın, marka güvenilirliğini güçlendirin ve hedef kitleyle derin bağ kurun.",
    },
    {
      image: "/marketplace-advertising.jpg",
      title: "Pazaryeri Reklamcılığı (Amazon, Trendyol, Hepsiburada)",
      description:
        "Amazon, Trendyol, Hepsiburada, N11 ve diğer pazaryerlerinde reklamlarınızı profesyonelce yönetiyoruz. Sponsored Products, Sponsored Brands, Display reklamları ve pazaryerine özel optimizasyon stratejileri ile satışlarınızı hızla artırın. Keyword research, bid management ve competitive analysis ile en iyi sonuçları elde edin.",
      features: [
        "Amazon PPC Kampanya Yönetimi",
        "Trendyol Reklam Optimizasyonu",
        "Hepsiburada Pazarlama Çözümleri",
        "Pazaryeri SEO Optimizasyonu",
        "Keyword Research ve Analiz",
        "Bid Management ve Otomasyon",
        "Competitive Intelligence",
        "Product Listing Optimization",
      ],
      benefits:
        "Pazaryerlerinde görünürlüğünüzü %350 artırın, organik sıralamalarınızı yükseltin ve satış hacminizi 5 kata kadar çıkarın.",
    },
    {
      image: "/google-ads-marketing.jpg",
      title: "Google Ads & Performance Marketing Uzmanı",
      description:
        "Google Ads kampanyalarınızı ROI odaklı yönetiyoruz. Search ads, Shopping ads, Display reklamları, YouTube ads ve Performance Max kampanyaları ile hedef kitlenize en uygun maliyetle ulaşın. Landing page optimizasyonu, Quality Score iyileştirme ve advanced bidding strategies ile maximum performans.",
      features: [
        "Google Search Ads Yönetimi",
        "Google Shopping Kampanyaları",
        "YouTube Ads ve Video Marketing",
        "Display ve Remarketing Reklamları",
        "Performance Max Kampanyaları",
        "Landing Page Optimization",
        "Google Analytics 4 Kurulumu",
        "Conversion Tracking ve Attribution",
      ],
      benefits:
        "Google Ads ile kaliteli trafiği %400 artırın, CPC'nizi %40 azaltın ve ROAS'nızı minimum 5:1 oranına çıkarın.",
    },
    {
      image: "/brand-growth-marketing.jpg",
      title: "Marka Büyütme Stratejileri (Sıfırdan Zirveye)",
      description:
        "Yeni markaları sıfırdan büyütmek için kapsamlı strateji geliştiriyoruz. Brand positioning, target audience analysis, competitive research, go-to-market stratejisi, omnichannel marketing ve scalable growth hacking teknikleri ile markanızı kısa sürede zirveye taşıyoruz.",
      features: [
        "Brand Strategy ve Positioning",
        "Target Audience Research",
        "Go-to-Market Strategy",
        "Omnichannel Marketing",
        "Growth Hacking Teknikleri",
        "Competitive Analysis",
        "Market Penetration Strategies",
        "Scalable Marketing Systems",
      ],
      benefits:
        "12 ay içinde markanızı tanınır hale getirin, pazar payınızı %500 artırın ve sürdürülebilir büyüme sistemi kurun.",
    },
    {
      image: "/social-media-growth.jpg",
      title: "Sosyal Medya Büyütme & İçerik Pazarlaması",
      description:
        "Instagram, TikTok, LinkedIn, YouTube ve Facebook'ta organik büyüme stratejileri uyguluyoruz. Viral içerik üretimi, hashtag stratejileri, community management, engagement optimization ve platform-specific growth tactics ile takipçi ve etkileşim oranlarınızı organik olarak artırıyoruz.",
      features: [
        "Organik Sosyal Medya Büyütme",
        "Viral İçerik Strateji ve Üretimi",
        "Community Management",
        "Hashtag Research ve Optimizasyon",
        "Engagement Rate Optimization",
        "Cross-Platform Content Strategy",
        "User-Generated Content Campaigns",
        "Social Media Analytics",
      ],
      benefits:
        "Sosyal medya takipçilerinizi %600 artırın, engagement rate'inizi %300 yükseltin ve organik erişimi maksimize edin.",
    },
    {
      image: "/video-marketing.jpg",
      title: "Video Marketing & TikTok Pazarlama Uzmanı",
      description:
        "TikTok, Instagram Reels, YouTube Shorts ve diğer video platformlarında viral video stratejileri geliştiriyoruz. Trend analysis, video editing, storytelling, platform algoritma optimizasyonu ve video SEO ile videolarınızın milyonlarca kişiye ulaşmasını sağlıyoruz.",
      features: [
        "TikTok Marketing ve Büyütme",
        "Instagram Reels Optimizasyonu",
        "YouTube Shorts Stratejisi",
        "Viral Video İçerik Üretimi",
        "Video SEO ve Optimization",
        "Trend Analysis ve Forecasting",
        "Video Performance Analytics",
        "Multi-Platform Video Strategy",
      ],
      benefits:
        "Video içeriklerinizle 10M+ görüntülenme alın, viral olma şansınızı %500 artırın ve genç kitleye etkili ulaşın.",
    },
  ];

  const caseStudies = [
    {
      title: "E-Ticaret Kozmetik Markası - Meta Ads Başarısı",
      description:
        "Yeni kurulan kozmetik e-ticaret markası için Meta Ads (Facebook & Instagram) kampanyası. Lookalike audience'lar, retargeting ve video reklamları ile 6 ayda markanın pazardaki yerini sağlamlaştırdık. Conversion API optimizasyonu ve dynamic ads ile exceptional ROAS elde edildi.",
      metrics: ["ROAS 8.5:1", "CPA ₺28", "%1,200 Satış Artışı", "₺2.8M Cirro"],
      image: "/cosmetic-meta-ads-case.svg",
      category: "Meta Ads",
    },
    {
      title: "Amazon Pazaryeri - Sponsored Products Optimizasyonu",
      description:
        "Ev tekstili kategorisinde Amazon Türkiye'de sponsored products, sponsored brands ve display reklamları ile marka görünürlüğünü artırdık. Keyword research, bid optimization ve negative keyword stratejileri ile organik sıralamalar da iyileştirildi.",
      metrics: [
        "₺1.45 ACoS",
        "%85 Impression Share",
        "%450 Satış Büyümesi",
        "Top 3 Sıralama",
      ],
      image: "/logistics-optimization-case.svg",
      category: "Pazaryeri Reklamları",
    },
    {
      title: "TikTok Influencer Kampanyası - Viral Video Serisi",
      description:
        "Genç hedef kitleye yönelik spor takviyesi markası için TikTok'ta 15 mikro-influencer ile authentic content kampanyası. Trend analysis ve hashtag challenge stratejileri ile viral içerikler üretildi. Gen-Z hedef kitlede güçlü marka bilinirliği oluşturuldu.",
      metrics: [
        "12.5M Video İzlenme",
        "450K Etkileşim",
        "%850 Takipçi Artışı",
        "3 Viral Video",
      ],
      image: "/viral-video-case.svg",
      category: "TikTok Influencer Marketing",
    },
    {
      title: "B2B SaaS - Google Ads & LinkedIn Ads Entegrasyonu",
      description:
        "B2B SaaS şirketi için Google Ads search campaigns ve LinkedIn Ads targeting ile kaliteli lead generation. Sales funnel optimization, landing page CRO ve lead scoring sistemi ile sales team'e kaliteli MQL'ler teslim edildi.",
      metrics: [
        "₺85 Cost Per Lead",
        "%35 Lead to Customer Rate",
        "₺2,400 Customer LTV",
        "%280 Pipeline Growth",
      ],
      image: "/digital-ads-optimization-case.svg",
      category: "B2B Performance Marketing",
    },
    {
      title: "E-Ticaret Fashion Brand - Omnichannel Growth",
      description:
        "Fashion e-ticaret markası için Google Ads, Meta Ads, influencer marketing ve email marketing entegre stratejisi. Customer journey optimization, cross-channel attribution ve retention marketing ile sürdürülebilir büyüme sağlandı.",
      metrics: [
        "%320 Online Satış Artışı",
        "₺180 Average Order Value",
        "%45 Customer Retention",
        "4.2 LTV/CAC Ratio",
      ],
      image: "/instant-growth-case.svg",
      category: "Omnichannel E-commerce",
    },
    {
      title: "Startup Food Brand - Sıfırdan Pazar Lideri",
      description:
        "Yeni kurulan organik gıda markası için comprehensive brand building stratejisi. Social media organic growth, influencer partnerships, content marketing ve performance advertising ile 18 ayda kategoride lider konuma getirdik.",
      metrics: [
        "₺0'dan ₺15M Ciro",
        "250K Sosyal Medya Takipçisi",
        "%25 Pazar Payı",
        "500+ Satış Noktası",
      ],
      image: "/professional-3d-modeling-case.svg",
      category: "Brand Building",
    },
  ];

  const customerBenefits = [
    {
      icon: TrendingUp,
      title: "Satış ve Ciro Artışı",
      description:
        "Kanıtlanmış performance marketing stratejileri ile satışlarınızı %300-800 arasında artırın. ROI odaklı kampanyalarla sürdürülebilir büyüme sağlayın.",
    },
    {
      icon: Target,
      title: "Marka Bilinirliği ve Pazarlama",
      description:
        "Doğru hedef kitleye ulaşarak marka bilinirliğinizi %500'e kadar artırın. Organic ve paid media entegrasyonu ile maximum etki yaratın.",
    },
    {
      icon: Award,
      title: "Rekabetçi Üstünlük",
      description:
        "Rakiplerinizden önde olmak için cutting-edge dijital pazarlama teknikleri. Market leader pozisyonuna ulaşın ve koruyun.",
    },
    {
      icon: Zap,
      title: "Hızlı Sonuçlar",
      description:
        "İlk 30 gün içinde ölçülebilir sonuçlar görün. Agile marketing metodolojileri ile hızlı optimizasyon ve sürekli iyileştirme.",
    },
  ];

  return (
    <div className="min-h-screen">
      <ServiceSchema service={serviceData} />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-muted/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/80 py-24 border-b dark:border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
              Dijital Pazarlama & E-Ticaret Uzmanı
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              <strong className="text-foreground">
                Markanızı sıfırdan zirveye taşıyan
              </strong>{" "}
              dijital pazarlama uzmanları. Meta Ads, Google Ads, influencer
              marketing, pazaryeri reklamcılığı ve e-ticaret pazarlaması ile
              <strong className="text-foreground">
                {" "}
                garantili ROI ve satış artışı
              </strong>{" "}
              sağlıyoruz.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                Meta Ads Uzmanı
              </span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                E-Ticaret Pazarlama
              </span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                Influencer Marketing
              </span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                Pazaryeri Reklamcılığı
              </span>
            </div>
            <Button size="lg" asChild className="mt-4">
              <Link href="/teklif">
                Ücretsiz Strateji Görüşmesi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Results Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30 dark:from-slate-900 dark:to-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Kanıtlanmış Dijital Pazarlama Sonuçları
              </h2>
              <p className="text-lg text-muted-foreground">
                Müşterilerimizle elde ettiğimiz ölçülebilir başarılar
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">800+</div>
                <div className="text-muted-foreground text-sm">
                  Başarılı Dijital Kampanya
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  ₺150M+
                </div>
                <div className="text-muted-foreground text-sm">
                  Yönetilen Reklam Bütçesi
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">%450</div>
                <div className="text-muted-foreground text-sm">
                  Ortalama Satış Artışı
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  6.8:1
                </div>
                <div className="text-muted-foreground text-sm">
                  Ortalama ROAS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Overview */}
      <section className="py-16 bg-background dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              Markanızı Sıfırdan Zirveye Taşıyan Stratejiler
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              MKN GROUP olarak,{" "}
              <strong className="text-foreground">
                her markanın dijital dünyada başarıya ulaşabileceğine
              </strong>{" "}
              inanıyoruz.
              <strong className="text-foreground">
                {" "}
                E-ticaret pazarlaması
              </strong>
              ,
              <strong className="text-foreground">
                {" "}
                Meta Ads (Facebook & Instagram) uzmanı
              </strong>{" "}
              hizmetleri,
              <strong className="text-foreground">
                {" "}
                influencer marketing kampanyaları
              </strong>
              ,
              <strong className="text-foreground">
                {" "}
                Amazon ve Trendyol pazaryeri reklamcılığı
              </strong>{" "}
              ve
              <strong className="text-foreground">
                {" "}
                Google Ads optimizasyonu
              </strong>{" "}
              ile markanızın dijital dönüşümünü gerçekleştiriyoruz.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              <strong className="text-foreground">Performance marketing</strong>{" "}
              odaklı yaklaşımımızla, her kampanyanın{" "}
              <strong className="text-foreground">ölçülebilir ROI</strong>{" "}
              getirmesini sağlıyoruz.
              <strong className="text-foreground">Data-driven</strong>{" "}
              stratejiler,
              <strong className="text-foreground">A/B testleri</strong>,
              <strong className="text-foreground">
                conversion optimization
              </strong>{" "}
              ve
              <strong className="text-foreground">
                customer journey mapping
              </strong>{" "}
              ile markanızın büyümesini hızlandırıyoruz.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800/50">
              <h3 className="text-xl font-bold text-foreground mb-4">
                🎯 Uzmanlaştığımız Alanlar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-foreground">
                    <span className="text-green-500 mr-2">✓</span>
                    Meta Ads (Facebook & Instagram) Uzmanı
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <span className="text-green-500 mr-2">✓</span>
                    E-Ticaret Pazarlama & CRO
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <span className="text-green-500 mr-2">✓</span>
                    Amazon & Trendyol Pazaryeri Reklamları
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <span className="text-green-500 mr-2">✓</span>
                    Google Ads & Performance Max
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-foreground">
                    <span className="text-green-500 mr-2">✓</span>
                    TikTok & Instagram Influencer Marketing
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <span className="text-green-500 mr-2">✓</span>
                    Sosyal Medya Organik Büyütme
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <span className="text-green-500 mr-2">✓</span>
                    Video Marketing & Viral İçerik
                  </li>
                  <li className="flex items-center text-sm text-foreground">
                    <span className="text-green-500 mr-2">✓</span>
                    Brand Building (Sıfırdan Zirveye)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/20 dark:bg-slate-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Dijital Pazarlama Uzmanı Hizmetlerimiz
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              E-ticaret pazarlamasından influencer marketing'e, Meta Ads'dan
              pazaryeri reklamcılığına kadar markanızın büyümesi için gereken
              tüm hizmetler
            </p>
          </div>

          <div className="space-y-16">
            {services.map((service, index) => {
              return (
                <div
                  key={index}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center overflow-hidden">
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={48}
                          height={48}
                          className="object-cover rounded-full"
                        />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">
                        {service.title}
                      </h2>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {service.features && service.features.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-3 text-foreground">
                          Özellikler:
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-start space-x-2"
                            >
                              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ✓
                                </span>
                              </div>
                              <span className="text-sm text-foreground">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.benefits && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                          Faydalar:
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 text-sm">
                          {service.benefits}
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className={
                      index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                    }
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 dark:bg-slate-800 dark:border-slate-700">
                      {/* Görsel Kısmı */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/15 dark:from-primary/10 dark:to-primary/20 flex items-center justify-center p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 dark:to-primary/10"></div>
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={350}
                          height={250}
                          className="object-contain w-full h-full relative z-10 drop-shadow-lg"
                          priority={index < 2}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </div>
                      
                      {/* Alt Yazı Kısmı */}
                      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-primary text-center leading-tight">
                          {service.title}
                        </h3>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Benefits */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Neden MKN GROUP Dijital Pazarlama?
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-4xl mx-auto">
              Markanızın dijital dönüşümünde güvenilir ortağınız. Performance
              marketing uzmanlarımızla ölçülebilir sonuçlar ve sürdürülebilir
              büyüme garantisi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {customerBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card
                  key={index}
                  className="bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <CardContent className="p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                    <p className="text-blue-100 dark:text-blue-200 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20 bg-background dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Dijital Pazarlama Başarı Hikayeleri
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Müşterilerimizle birlikte elde ettiğimiz ölçülebilir sonuçlar ve
              markaları sıfırdan zirveye taşıyan kampanyalarımız
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 dark:bg-slate-800 dark:border-slate-700 overflow-hidden"
              >
                <CardHeader className="p-0">
                  <div className="aspect-video overflow-hidden bg-muted/30 dark:bg-slate-700/50 relative">
                    <img
                      src={study.image}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary/90 text-white text-xs px-3 py-1 rounded-full font-medium">
                        {study.category}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-3 text-foreground leading-tight">
                    {study.title}
                  </CardTitle>
                  <CardDescription className="mb-6 text-muted-foreground leading-relaxed">
                    {study.description}
                  </CardDescription>

                  <div className="grid grid-cols-2 gap-3">
                    {study.metrics.map((metric, metricIndex) => (
                      <div
                        key={metricIndex}
                        className="text-sm font-bold text-primary bg-primary/10 rounded-lg px-3 py-2 text-center"
                      >
                        {metric}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Message */}
      <section className="py-20 bg-muted/30 dark:bg-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-blue-600 dark:from-green-400 dark:to-blue-500 flex items-center justify-center">
                <Award className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              Türkiye'nin En Güvenilir Dijital Pazarlama Uzmanı
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              <strong className="text-foreground">
                800+ başarılı dijital kampanya
              </strong>
              ,<strong className="text-foreground"> 400+ mutlu müşteri</strong>{" "}
              ve
              <strong className="text-foreground">
                {" "}
                %98 müşteri memnuniyet oranı
              </strong>{" "}
              ile MKN GROUP, dijital pazarlama alanında Türkiye'nin lider
              ajanslarından biri.
              <strong className="text-foreground">
                {" "}
                Performance marketing uzmanlarımız
              </strong>
              , her projede{" "}
              <strong className="text-foreground">ölçülebilir ROI</strong> elde
              etmek için çalışıyor.
            </p>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                🏆 Sektördeki Yerimiz
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-foreground">
                      Google Partner Ajans Sertifikası
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-foreground">
                      Meta Business Partner (Facebook)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-foreground">
                      TikTok Marketing Partner
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-foreground">
                      Amazon Advertising Certified
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-foreground">
                      LinkedIn Marketing Partner
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-foreground">
                      YouTube Certified Professional
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">800+</div>
                <div className="text-muted-foreground">Başarılı Kampanya</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">400+</div>
                <div className="text-muted-foreground">Mutlu Müşteri</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">%98</div>
                <div className="text-muted-foreground">Memnuniyet Oranı</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  ₺150M+
                </div>
                <div className="text-muted-foreground">Yönetilen Bütçe</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-100 dark:border-orange-800/50">
              <h3 className="text-xl font-bold text-foreground mb-4">
                🎯 Garantili Sonuçlar
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                <strong className="text-foreground">
                  30 gün içinde sonuç göremezseniz ücret almıyoruz!
                </strong>
                Performance marketing uzmanlarımız, her kampanyanın başında net
                hedefler belirliyor ve ölçülebilir KPI'lar ile takip ediyor.
                Transparantsız, data-driven yaklaşımımızla markanızın büyümesini
                garantili hale getiriyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Markanızı Sıfırdan Zirveye Taşımaya Hazır mısınız?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Dijital pazarlama uzmanlarımızla ücretsiz strateji görüşmesi
              yapın.
              <strong className="text-foreground">
                {" "}
                Meta Ads, e-ticaret pazarlaması, influencer marketing
              </strong>{" "}
              ve
              <strong className="text-foreground">
                {" "}
                pazaryeri reklamcılığı
              </strong>{" "}
              ile markanızın potansiyelini keşfedin.
            </p>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                🚀 Ücretsiz Dijital Pazarlama Analizi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="text-center">
                  <div className="text-primary font-bold text-lg mb-2">
                    ✓ Rekabet Analizi
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rakiplerinizin dijital stratejilerini analiz ediyoruz
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-primary font-bold text-lg mb-2">
                    ✓ Fırsat Tespiti
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pazarınızdaki boşlukları ve fırsatları belirliyoruz
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-primary font-bold text-lg mb-2">
                    ✓ ROI Projeksiyonu
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Yatırımınızın geri dönüşümünü hesaplıyoruz
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" asChild className="text-lg px-8 py-4">
                <Link href="/teklif">
                  🎯 Ücretsiz Strateji Görüşmesi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8 py-4"
              >
                <Link href="tel:+905314942594">
                  📞 Hemen Ara: 0531 494 25 94
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">24 saat içinde</strong> size
              özel dijital pazarlama stratejisi hazırlıyoruz.
              <strong className="text-foreground">Hiçbir ön ödeme yok</strong>,
              sonuç alana kadar yanınızdayız.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Sıkça Sorulan Sorular
              </h2>
              <p className="text-xl text-muted-foreground">
                Dijital pazarlama hizmetlerimiz hakkında merak ettiğiniz sorular
              </p>
            </div>

            <div className="space-y-6">
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Meta Ads (Facebook & Instagram) ile ne kadar sürede sonuç
                    alabilirim?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Meta Ads kampanyalarında genellikle ilk 7-14 gün içinde
                    initial data toplamaya başlarız. Optimization phase'i 30 gün
                    sürer ve bu süre sonunda stable performance elde ederiz.
                    Ancak bazı kampanyalarda 48-72 saat içinde bile conversion
                    almaya başlayabilirsiniz. Pixel data'nızın kalitesi ve
                    audience size'ınız bu süreyi etkiler.
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    E-ticaret sitem için hangi pazarlama stratejisini
                    önerirsiniz?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    E-ticaret pazarlaması için omnichannel yaklaşım öneriyoruz:
                    Google Ads ile high-intent traffic, Meta Ads ile awareness
                    ve retargeting, email marketing ile customer retention,
                    Amazon/Trendyol gibi pazaryerlerinde presence, ve SEO ile
                    organic visibility. Conversion Rate Optimization (CRO) ile
                    sitenizin performansını artırırız.
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Influencer marketing kampanyalarında ROI nasıl ölçülür?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Influencer marketing ROI'sini mehrere metrics ile ölçeriz:
                    Direct sales (promo codes, affiliate links), brand awareness
                    lift (surveys, branded search increase), engagement rate,
                    website traffic increase, social media follower growth, ve
                    user-generated content volume. Attribution tracking ile her
                    influencer'ın contribution'ını detaylı analiz ederiz.
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Amazon ve Trendyol'da reklamlarım neden performans
                    göstermiyor?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Pazaryeri reklamlarında en yaygın sorunlar: keyword
                    targeting hatası, bid strategy problemleri, product listing
                    optimization eksikliği, negative keyword kullanımı, ve
                    seasonal trends'i görmezden gelme. Bizim approach'ümüz:
                    derinlemesine keyword research, competitor analysis, bid
                    optimization, ve listing SEO. İlk 30 günde %200+ performance
                    artışı sağlayabiliriyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Yeni markam için hangi platformlarda reklam vermeliyim?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Yeni markalar için platform seçimi target audience'a bağlı:
                    B2C products için Meta Ads + Google Ads kombinasyonu ideal.
                    Gen-Z target için TikTok Ads, professional products için
                    LinkedIn Ads. Budget allocation genellikle: %40 Meta Ads,
                    %35 Google Ads, %15 TikTok/YouTube, %10 test budget. Data
                    toplandıkça budget'ı best performing platforms'a kaydırırız.
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Dijital pazarlama bütçemi nasıl belirlemeliim?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Dijital pazarlama budget'ı genellikle target revenue'nizin
                    %15-25'i olmalı. Yeni markalar için minimum aylık
                    ₺15,000-25,000 budget öneriyoruz. Budget allocation: %50
                    paid advertising, %20 content creation, %15 influencer
                    marketing, %10 SEO/organic, %5 analytics/tools. İlk 3 ay
                    data collection period, sonra scale up yapıyoruz.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
