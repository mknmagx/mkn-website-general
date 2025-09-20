import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Palette,
  Camera,
  Globe,
  BookOpen,
  Package,
  Eye,
  Brush,
  Layers,
  Monitor,
  Tag,
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  Award,
  Users,
  Clock,
  Target,
  TrendingUp,
  Lightbulb,
  Wand2,
  Rocket,
  Crown,
  Heart,
  Play,
  Phone,
  Code,
  Pen,
  MousePointer,
  PenTool,
  Hexagon,
  Triangle,
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
    "🎨 Profesyonel Tasarım Stüdyosu | MKNGROUP - 3D Modelleme, Marka Kimliği, Dijital Tasarım Çözümleri",
  description:
    "✨ Türkiye'nin en inovatif tasarım stüdyosu! 3D modelleme, marka kimliği, web tasarım, ürün görselleri, katalog tasarımı ve daha fazlası. Hayalinizdeki tasarımları gerçeğe dönüştürüyoruz. %100 müşteri memnuniyeti garantili.",
  keywords:
    "profesyonel tasarım stüdyosu, 3d modelleme uzmanı, marka kimliği tasarımı, logo tasarım ajansı, web site tasarım şirketi, ürün fotoğrafçılığı, katalog tasarım hizmeti, etiket tasarımı, ambalaj tasarımı, kreatif ajans, tasarım danışmanlığı, görsel kimlik, kurumsal tasarım, e-ticaret görselleri, pazarlama materyalleri, reklam tasarımı, sosyal medya tasarımı, baskı tasarımı, dijital tasarım çözümleri, inovatif tasarım, modern tasarım ajansı, mkngroup tasarım",
  alternates: {
    canonical: "https://mkngroup.com.tr/tasarim",
  },
  openGraph: {
    title: "🎨 Profesyonel Tasarım Stüdyosu | MKNGROUP",
    description:
      "✨ Türkiye'nin en inovatif tasarım stüdyosu! Hayalinizdeki tasarımları gerçeğe dönüştürüyoruz. 3D modelleme, marka kimliği ve daha fazlası...",
    url: "https://mkngroup.com.tr/tasarim",
    siteName: "MKNGROUP Design Studio",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://mkngroup.com.tr/og-tasarim.jpg",
        width: 1200,
        height: 630,
        alt: "MKNGROUP Profesyonel Tasarım Hizmetleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🎨 Profesyonel Tasarım Stüdyosu | MKNGROUP",
    description:
      "✨ Türkiye'nin en inovatif tasarım stüdyosu! Hayalinizdeki tasarımları gerçeğe dönüştürüyoruz.",
    images: ["https://mkngroup.com.tr/og-tasarim.jpg"],
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
  other: {
    "google-site-verification": "your-verification-code",
    "theme-color": "#1a1a2e",
    "color-scheme": "dark",
  },
};

export default function TasarimPage() {
  const serviceData = {
    "@type": "Service",
    name: "Profesyonel Tasarım Stüdyosu Hizmetleri",
    description:
      "MKNGROUP olarak Türkiye'nin en yenilikçi tasarım stüdyosuyuz. 3D modelleme, marka kimliği, web tasarım, ürün görselleri ve tüm kreatif ihtiyaçlarınız için tek durak çözüm merkezi. Hayalinizdeki tasarımları gerçeğe dönüştürüyoruz.",
    provider: {
      "@type": "Organization",
      name: "MKNGROUP Design Studio",
      url: "https://mkngroup.com.tr",
    },
    areaServed: "Turkey",
    category: "Creative Design Services",
  };

  const breadcrumbItems = [
    {
      name: "Ana Sayfa",
      url: "https://mkngroup.com.tr",
    },
    {
      name: "Tasarım Stüdyosu",
      url: "https://mkngroup.com.tr/tasarim",
    },
  ];

  const designServices = [
    {
      id: 1,
      icon: <Layers className="w-12 h-12" />,
      title: "3D Modelleme & Görselleştirme",
      description:
        "Fotorealistik 3D modeller ve animasyonlar ile ürünlerinizi hayata geçirin",
      image: <Hexagon className="w-24 h-24" />,
      features: [
        "Fotorealistik Rendering",
        "360° Ürün Görselleştirme",
        "3D Animasyonlar",
        "AR/VR Hazırlık",
      ],
      gradient: "from-purple-600 via-blue-600 to-cyan-500",
      price: "₺2.000 - ₺4.000",
      duration: "3-5 Gün",
    },
    {
      id: 2,
      icon: <Crown className="w-12 h-12" />,
      title: "Marka Kimliği Tasarımı",
      description: "Güçlü ve akılda kalıcı marka kimlikleri ile fark yaratın",
      image: <Crown className="w-24 h-24" />,
      features: [
        "Logo Tasarımı",
        "Kurumsal Kimlik",
        "Marka Rehberi",
        "Sosyal Medya Kit",
      ],
      gradient: "from-pink-600 via-rose-600 to-orange-500",
      price: "₺3.000 - ₺6.000",
      duration: "5-7 Gün",
    },
    {
      id: 3,
      icon: <Camera className="w-12 h-12" />,
      title: "Profesyonel Ürün Çekimi",
      description:
        "E-ticaret ve pazarlama için yüksek kaliteli ürün fotoğrafları",
      image: <Camera className="w-24 h-24" />,
      features: [
        "Studio Çekimi",
        "E-ticaret Görselleri",
        "Lifestyle Fotoğraf",
        "360° Çekim",
      ],
      gradient: "from-green-600 via-teal-600 to-blue-500",
      price: "₺1.200 - ₺2.500",
      duration: "1-2 Gün",
    },
    {
      id: 4,
      icon: <BookOpen className="w-12 h-12" />,
      title: "Katalog & Baskı Tasarımı",
      description:
        "Etkileyici kataloglar ve baskı materyalleri ile satışlarınızı artırın",
      image: <BookOpen className="w-24 h-24" />,
      features: [
        "Dijital Katalog",
        "Baskı Tasarımı",
        "Broşür Design",
        "QR Entegrasyonu",
      ],
      gradient: "from-yellow-600 via-orange-600 to-red-500",
      price: "₺1.500 - ₺3.500",
      duration: "3-4 Gün",
    },
    {
      id: 5,
      icon: <Globe className="w-12 h-12" />,
      title: "Web Tasarım & Geliştirme",
      description: "Modern, hızlı ve dönüşüm odaklı web siteleri",
      image: <Monitor className="w-24 h-24" />,
      features: [
        "Responsive Design",
        "E-ticaret",
        "SEO Optimize",
        "Hızlı Yükleme",
      ],
      gradient: "from-indigo-600 via-purple-600 to-pink-500",
      price: "₺4.000 - ₺12.000",
      duration: "7-10 Gün",
    },
    {
      id: 6,
      icon: <Tag className="w-12 h-12" />,
      title: "Etiket & Ambalaj Tasarımı",
      description: "Mevzuat uyumlu, güvenli ve çekici etiket tasarımları",
      image: <Package className="w-24 h-24" />,
      features: ["Mevzuat Uyumlu", "Çok Dilli", "Baskıya Hazır", "QR Code"],
      gradient: "from-emerald-600 via-cyan-600 to-blue-500",
      price: "₺1.500 - ₺3.000",
      duration: "2-3 Gün",
    },
  ];

  const stats = [
    {
      number: "1000+",
      label: "Tamamlanan Proje",
      icon: <Target className="w-6 h-6" />,
    },
    {
      number: "%99",
      label: "Müşteri Memnuniyeti",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      number: "24",
      label: "Saat Express Teslimat",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      number: "15+",
      label: "Ulusal & Uluslararası Ödül",
      icon: <Award className="w-6 h-6" />,
    },
  ];

  const portfolioImages = [
    "/optimized/cosmetic-packaging-mockup.webp",
    "/cosmetic-bottle-30ml.png",
    "/airless-bottle-15ml.png",
    "/pump-bottle-250ml.png",
    "/glass-jar-50ml-cosmetic.png",
    "/optimized/cosmetic-instagram-campaign.webp",
  ];

  const processSteps = [
    {
      step: "01",
      title: "Keşif & Analiz",
      description:
        "Markanızı, hedef kitlenizi ve rekabet ortamınızı derinlemesine analiz ediyoruz",
      icon: <Target className="w-8 h-8" />,
      duration: "1-2 Gün",
    },
    {
      step: "02",
      title: "Konsept Geliştirme",
      description:
        "Benzersiz tasarım konseptleri ve yaratıcı çözümler üretiyoruz",
      icon: <Lightbulb className="w-8 h-8" />,
      duration: "2-3 Gün",
    },
    {
      step: "03",
      title: "Tasarım & Uygulama",
      description:
        "En son teknoloji araçlarla profesyonel tasarımlarınızı hayata geçiriyoruz",
      icon: <PenTool className="w-8 h-8" />,
      duration: "3-7 Gün",
    },
    {
      step: "04",
      title: "Revizyon & Optimizasyon",
      description:
        "Geri bildirimleriniz doğrultusunda tasarımları mükemmelleştiriyoruz",
      icon: <Code className="w-8 h-8" />,
      duration: "1-2 Gün",
    },
  ];

  const faqData = [
    {
      question: "Tasarım projesi ne kadar sürer?",
      answer:
        "Proje türüne göre değişiklik gösterir. Logo tasarımı 3-5 gün, web sitesi 7-10 gün, 3D modelleme 3-5 gün sürmektedir. Express teslimat seçenekleri de mevcuttur.",
    },
    {
      question: "Revizyon hakkım var mı?",
      answer:
        "Evet! Tüm projelerimizde sınırsız revizyon hakkı sunuyoruz. Siz memnun kalana kadar tasarımınızı geliştirmeye devam ederiz.",
    },
    {
      question: "Hangi dosya formatlarında teslim alırım?",
      answer:
        "AI, EPS, PDF, PNG, JPG, SVG gibi tüm standart formatlarda teslim ediyoruz. Web projelerinde HTML, CSS, JS dosyalarını da dahil ediyoruz.",
    },
    {
      question: "Fiyatlandırma nasıl yapılır?",
      answer:
        "Her proje için özel fiyatlandırma yapıyoruz. İlk görüşmede ihtiyaçlarınızı analiz ederek şeffaf bir fiyat teklifi sunuyoruz.",
    },
    {
      question: "Proje sonrası destek veriyor musunuz?",
      answer:
        "Elbette! Proje teslimi sonrası 6 ay boyunca ücretsiz teknik destek sağlıyoruz. Ayrıca 7/24 iletişim kanallarımız açıktır.",
    },
    {
      question: "Hangi sektörlerle çalışıyorsunuz?",
      answer:
        "Kozmetik, temizlik, gıda, teknoloji, sağlık, eğitim ve daha birçok sektörde deneyimimiz var. Her sektörün özel gereksinimlerini anlıyoruz.",
    },
  ];

  const industryExpertise = [
    {
      title: "Kozmetik & Beauty",
      description: "Lüks kozmetik markalar için premium tasarım çözümleri",
      icon: "💄",
      projects: "200+",
    },
    {
      title: "Temizlik Ürünleri",
      description: "Güvenli ve mevzuat uyumlu temizlik ürünü tasarımları",
      icon: "🧽",
      projects: "150+",
    },
    {
      title: "Gıda & İçecek",
      description: "Çekici ve güvenli gıda ambalaj tasarımları",
      icon: "🍯",
      projects: "120+",
    },
    {
      title: "Teknoloji",
      description: "Modern ve inovatif teknoloji şirketi tasarımları",
      icon: "💻",
      projects: "80+",
    },
    {
      title: "Sağlık & Medikal",
      description: "Güvenilir ve profesyonel sağlık sektörü tasarımları",
      icon: "🏥",
      projects: "60+",
    },
    {
      title: "E-ticaret",
      description: "Dönüşüm odaklı e-ticaret platform tasarımları",
      icon: "🛒",
      projects: "100+",
    },
  ];

  const designTools = [
    { name: "Adobe Creative Suite", logo: "🎨", category: "Grafik Tasarım" },
    { name: "Figma", logo: "🎯", category: "UI/UX Design" },
    { name: "Blender", logo: "🔮", category: "3D Modelleme" },
    { name: "Cinema 4D", logo: "🎬", category: "3D Animasyon" },
    { name: "AutoCAD", logo: "📐", category: "Teknik Çizim" },
    { name: "Sketch", logo: "✏️", category: "Interface Design" },
  ];

  return (
    <>
      <ServiceSchema service={serviceData} />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Main Container with Dark Theme */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

          <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-8">
                <Sparkles className="w-4 h-4 animate-sparkle text-yellow-400" />
                Türkiye'nin #1 Tasarım Stüdyosu
                <Crown className="w-4 h-4 text-yellow-400" />
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Yaratıcılığın
                </span>
                <br />
                <span className="text-white">Sınırlarını</span>
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
                  Aşıyoruz
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                3D modelleme, marka kimliği, web tasarım ve daha fazlası...
                <br />
                <span className="text-yellow-400 font-semibold">
                  Hayalinizdeki tasarımları gerçeğe dönüştürüyoruz!
                </span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button
                  size="lg"
                  asChild
                  className="group relative px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  <Link href="/iletisim?service=tasarim">
                    <Rocket className="mr-2 h-6 w-6 group-hover:animate-bounce" />
                    Ücretsiz Keşif Görüşmesi
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="px-8 py-4 text-lg border-white/20 text-blue-900 hover:bg-white/10 rounded-full backdrop-blur-sm"
                >
                  <Link href="#portfolio">
                    <Play className="mr-2 h-6 w-6" />
                    Portfolyoyu İzle
                  </Link>
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex justify-center mb-3 text-blue-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-float" />
          <div
            className="absolute top-40 right-20 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-float"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-40 left-20 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-float"
            style={{ animationDelay: "2s" }}
          />
        </section>
        <section id="portfolio" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Son Projelerimiz
              </h2>
              <p className="text-slate-400 text-lg">
                Tasarımlarımızın gücünü keşfedin
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {portfolioImages.map((image, index) => {
                const imageName = image.split("/").pop();
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <Image
                      src={image}
                      alt={imageName}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Show image name on hover */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      {imageName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="hizmetler" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-6">
                <Wand2 className="w-4 h-4" />
                Premium Tasarım Hizmetleri
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Tasarım Çözümlerimiz
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Her biri alanında uzman ekibimizle, markanızı zirveye taşıyacak
                tasarım çözümleri
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {designServices.map((service, index) => (
                <Card
                  key={service.id}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden rounded-2xl hover:bg-white/10 flex flex-col h-full"
                >
                  <div className="relative flex-1 flex flex-col">
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-20`}
                      />
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                        <div className="text-white opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700">
                          {service.image}
                        </div>
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {service.price}
                      </div>

                      {/* Icon */}
                      <div
                        className={`absolute top-4 left-4 w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}
                      >
                        {service.icon}
                      </div>
                    </div>

                    <CardHeader className="p-6 flex-1">
                      <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors mb-2">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-slate-400 leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-0 flex flex-col justify-end">
                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {service.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <span className="text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Duration */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          {service.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button
                        size="sm"
                        asChild
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:scale-105 transition-all duration-300 rounded-xl"
                      >
                        <Link href="/iletisim?service=tasarim">
                          <Palette className="mr-2 h-4 w-4" />
                          Teklif Al
                        </Link>
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

              <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Projenizi Bugün Başlatalım
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Uzman ekibimizle markanızı zirveye taşıyın.
                  <br />
                  İlk görüşme tamamen ücretsiz!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button
                    size="lg"
                    asChild
                    className="px-8 py-4 text-lg bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-full"
                  >
                    <Link href="/iletisim?service=tasarim">
                      <Heart className="mr-2 h-6 w-6" />
                      Ücretsiz Görüşme
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="px-8 py-4 text-lg border-white/30 text-black hover:bg-white/20 rounded-full"
                  >
                    <Link href="tel:+905314942594">
                      <Phone className="mr-2 h-6 w-6" />
                      Hemen Arayın
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">
                      24 Saat
                    </div>
                    <div className="text-white/80">İlk Görüşme</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">
                      %100
                    </div>
                    <div className="text-white/80">Memnuniyet Garantisi</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">
                      Sınırsız
                    </div>
                    <div className="text-white/80">Revizyon Hakkı</div>
                  </div>
                </div>
              </div>

              {/* Floating Shapes */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full" />
              <div className="absolute top-8 right-8 w-6 h-6 bg-yellow-400/30 rounded-full" />
              <div className="absolute bottom-4 left-8 w-4 h-4 bg-pink-400/30 rounded-full" />
              <div className="absolute bottom-8 right-4 w-10 h-10 bg-cyan-400/20 rounded-full" />
            </div>
          </div>
        </section>
        {/* Design Process Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-6">
                <Hexagon className="w-4 h-4" />
                Tasarım Sürecimiz
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                4 Adımda Mükemmel Tasarım
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Kanıtlanmış metodolojimizle her projede başarıyı garanti
                ediyoruz
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative group">
                  {/* Connection Line */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 z-0" />
                  )}

                  <Card className="relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 p-6 text-center hover:bg-white/10 z-10">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {step.duration}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Industry Expertise Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-6">
                <Award className="w-4 h-4" />
                Sektörel Uzmanlığımız
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Hangi Sektörlerde Çalışıyoruz?
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Her sektörün kendine özgü ihtiyaçlarını anlıyor ve özel çözümler
                üretiyoruz
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industryExpertise.map((industry, index) => (
                <Card
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 p-6 hover:bg-white/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{industry.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                          {industry.title}
                        </h3>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          {industry.projects}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {industry.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
        {/* Tools & Technologies Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-6">
                <Code className="w-4 h-4" />
                Teknoloji & Araçlar
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                En Son Teknoloji Araçları
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Sektörün en gelişmiş araçlarıyla profesyonel sonuçlar üretiyoruz
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {designTools.map((tool, index) => (
                <Card
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 p-6 text-center hover:bg-white/10"
                >
                  <div className="text-3xl mb-3">{tool.logo}</div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500">{tool.category}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-6">
                <Lightbulb className="w-4 h-4" />
                Sıkça Sorulan Sorular
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Merak Ettikleriniz
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Tasarım süreçleri hakkında en çok sorulan soruların yanıtları
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <Card
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                          {faq.question}
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
        {/* Final CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-12 md:p-16 border border-white/10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Hayalinizdeki Tasarımı Gerçeğe Dönüştürmeye Hazır mısınız?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                1000+ başarılı projeye imza atan uzman ekibimizle tanışın. İlk
                görüşme tamamen ücretsiz!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full hover:scale-105 transition-all duration-300"
                >
                  <Link href="/iletisim?service=tasarim">
                    <Rocket className="mr-2 h-6 w-6" />
                    Hemen Başlayalım
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="px-8 py-4 text-lg border-white/30 text-blue-900 hover:bg-white/10 rounded-full"
                >
                  <Link href="#portfolio">
                    <Eye className="mr-2 h-6 w-6" />
                    Portfolyoyu İncele
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
