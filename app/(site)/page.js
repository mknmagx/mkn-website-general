import Hero from "@/components/hero";
import { FeaturedServices } from "@/components/featured-services";
import { WhyMKNGroup } from "@/components/why-mkngroup";
import { ClientLogos } from "@/components/client-logos";
import { AboutSection } from "@/components/about-section";
import { CTASection } from "@/components/cta-section";
import { ManufacturingSection } from "@/components/manufacturing-section";
import { PackagingSection } from "@/components/packaging-section";
import { ClientFloatingNavigation } from "@/components/client-floating-navigation";
import { CosmeticManufacturingSection } from "@/components/cosmetic-manufacturing-section";
import { PackagingCatalogSection } from "@/components/packaging-catalog-section";
import { EcommerceOperationSection } from "@/components/ecommerce-operation-section";
import { CustomerTestimonialsSection } from "@/components/customer-testimonials-section";
import { SimpleFAQSection } from "@/components/simple-faq-section";
import { ContactLocationSection } from "@/components/contact-location-section";
import {
  BreadcrumbSchema,
  OrganizationSchema,
  WebsiteSchema,
  FAQSchema,
  LocalBusinessSchema,
} from "@/components/structured-data";

export const metadata = {
  title: "MKN GROUP - Türkiye'nin Güvenilir Fason Üretim ve Operasyon Partneri",
  description:
    "🏭 6+ yıl deneyim, 1000+ başarılı proje, ISO sertifikalı üretim! Kozmetik fason üretimi, premium ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri. İstanbul'dan Türkiye'ye hizmet veriyoruz. 📞 Ücretsiz teklif alın!",
  keywords: [
    // Ana hizmetler
    "fason üretim türkiye",
    "kozmetik fason üretim istanbul",
    "iso sertifikalı üretim",
    "cosmetic contract manufacturing",
    "private label cosmetics turkey",

    // Ambalaj çözümleri
    "kozmetik ambalaj tedarik",
    "airless şişe toptan",
    "pompa şişe üretici",
    "cam kavanoz tedarikçi",
    "cosmetic packaging turkey",

    // E-ticaret ve operasyon
    "e-ticaret operasyon",
    "fulfillment hizmetleri",
    "kargo operasyon yönetimi",
    "wms entegrasyonu",

    // Dijital pazarlama
    "kozmetik marka pazarlama",
    "influencer kampanya yönetimi",
    "ürün fotoğraf çekimi",
    "google ads kozmetik",
    "sosyal medya pazarlama",

    // Firma ve lokasyon
    "mkn group",
    "mkngroup",
    "istanbul üretim firması",
    "türkiye contract manufacturing",
    "güvenilir üretim partneri",
  ],
  authors: [{ name: "MKN GROUP", url: "https://mkngroup.com.tr" }],
  creator: "MKN GROUP",
  publisher: "MKN GROUP",
  category: "Manufacturing",
  classification: "Business",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://mkngroup.com.tr",
    languages: {
      "tr-TR": "https://mkngroup.com.tr",
      "en-US": "https://mkngroup.com.tr/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://mkngroup.com.tr",
    siteName: "MKN GROUP",
    title: "MKN GROUP - Türkiye'nin Güvenilir Fason Üretim Partneri",
    description:
      "🏭 6+ yıl deneyim, 1000+ başarılı proje! ISO sertifikalı kozmetik üretimi, premium ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama. İstanbul'dan Türkiye'ye hizmet veriyoruz.",
    images: [
      {
        url: "https://mkngroup.com.tr/og-image.png",
        width: 1200,
        height: 630,
        alt: "MKN GROUP - ISO Sertifikalı Fason Üretim ve Operasyon Çözümleri",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup",
    creator: "@mkngroup",
    title: "MKN GROUP - Türkiye'nin Güvenilir Fason Üretim Partneri",
    description:
      "🏭 6+ yıl deneyim, 1000+ başarılı proje! ISO sertifikalı kozmetik üretimi, premium ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama.",
    images: ["https://mkngroup.com.tr/og-image.png"],
  },
  verification: {
    google: "placeholder-google-verification-code",
    yandex: "placeholder-yandex-verification-code",
    other: {
      "msvalidate.01": "placeholder-bing-verification-code",
    },
  },
  other: {
    "theme-color": "#3B82F6",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function HomePage() {
  const breadcrumbItems = [
    {
      name: "Ana Sayfa",
      url: "https://mkngroup.com.tr",
    },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <OrganizationSchema />
      <WebsiteSchema />
      <FAQSchema />
      <LocalBusinessSchema />
      <div className="animate-fade-in">
        <section id="hero">
          <Hero />
        </section>
        <section id="services">
          <FeaturedServices />
        </section>
        <section id="about">
          <AboutSection />
        </section>
        <WhyMKNGroup />
        <section id="manufacturing">
          <CosmeticManufacturingSection />
        </section>
        <section id="packaging">
          <PackagingCatalogSection />
        </section>
        <section id="ecommerce">
          <EcommerceOperationSection />
        </section>
        <ClientLogos />
        <section id="faq">
          <SimpleFAQSection />
        </section>
        <section id="contact">
          <ContactLocationSection />
        </section>
        {/* <CTASection /> */}
      </div>
      <ClientFloatingNavigation />
    </>
  );
}
