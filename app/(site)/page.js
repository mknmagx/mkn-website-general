import { Suspense, lazy } from "react";
import Hero from "@/components/hero";
import { FeaturedServices } from "@/components/featured-services";

// Lazy load below-the-fold components for better performance
const WhyMKNGroup = lazy(() =>
  import("@/components/why-mkngroup").then((module) => ({
    default: module.WhyMKNGroup,
  }))
);
const ClientLogos = lazy(() =>
  import("@/components/client-logos").then((module) => ({
    default: module.ClientLogos,
  }))
);
const AboutSection = lazy(() =>
  import("@/components/about-section").then((module) => ({
    default: module.AboutSection,
  }))
);
const CosmeticManufacturingSection = lazy(() =>
  import("@/components/cosmetic-manufacturing-section").then((module) => ({
    default: module.CosmeticManufacturingSection,
  }))
);
const PackagingCatalogSection = lazy(() =>
  import("@/components/packaging-catalog-section").then((module) => ({
    default: module.PackagingCatalogSection,
  }))
);
const EcommerceOperationSection = lazy(() =>
  import("@/components/ecommerce-operation-section").then((module) => ({
    default: module.EcommerceOperationSection,
  }))
);
const SimpleFAQSection = lazy(() =>
  import("@/components/simple-faq-section").then((module) => ({
    default: module.SimpleFAQSection,
  }))
);
const ContactLocationSection = lazy(() =>
  import("@/components/contact-location-section").then((module) => ({
    default: module.ContactLocationSection,
  }))
);
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
  authors: [{ name: "MKN GROUP", url: "https://www.mkngroup.com.tr" }],
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
    canonical: "https://www.mkngroup.com.tr",
    languages: {
      "tr-TR": "https://www.mkngroup.com.tr",
      "en-US": "https://www.mkngroup.com.tr/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://www.mkngroup.com.tr",
    siteName: "MKN GROUP",
    title: "MKN GROUP - Türkiye'nin Güvenilir Fason Üretim Partneri",
    description:
      "🏭 6+ yıl deneyim, 1000+ başarılı proje! ISO sertifikalı kozmetik üretimi, premium ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama. İstanbul'dan Türkiye'ye hizmet veriyoruz.",
    images: [
      {
        url: "https://www.mkngroup.com.tr/og-image.png",
        width: 1200,
        height: 630,
        alt: "MKN GROUP - ISO Sertifikalı Fason Üretim ve Operasyon Çözümleri",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup_x",
    creator: "@mkngroup_x",
    title: "MKN GROUP - Türkiye'nin Güvenilir Fason Üretim Partneri",
    description:
      "🏭 6+ yıl deneyim, 1000+ başarılı proje! ISO sertifikalı kozmetik üretimi, premium ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama.",
    images: ["https://www.mkngroup.com.tr/og-image.png"],
  },
  verification: {
    yandex: "10738437cc124bf9",
    other: {
      "msvalidate.01": "CC65A73AF2E478C1F192007C7CF4A0EE",
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
      url: "https://www.mkngroup.com.tr",
    },
  ];

  // Loading fallback component with better skeleton structure
  const SectionLoader = () => (
    <div className="animate-pulse py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-4 bg-muted rounded w-96 max-w-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted/20 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );

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
          <Suspense fallback={<SectionLoader />}>
            <AboutSection />
          </Suspense>
        </section>
        <Suspense fallback={<SectionLoader />}>
          <WhyMKNGroup />
        </Suspense>
        <section id="manufacturing">
          <Suspense fallback={<SectionLoader />}>
            <CosmeticManufacturingSection />
          </Suspense>
        </section>
        <section id="packaging">
          <Suspense fallback={<SectionLoader />}>
            <PackagingCatalogSection />
          </Suspense>
        </section>
        <section id="ecommerce">
          <Suspense fallback={<SectionLoader />}>
            <EcommerceOperationSection />
          </Suspense>
        </section>
        <Suspense fallback={<SectionLoader />}>
          <ClientLogos />
        </Suspense>
        <section id="faq">
          <Suspense fallback={<SectionLoader />}>
            <SimpleFAQSection />
          </Suspense>
        </section>
        <section id="contact">
          <Suspense fallback={<SectionLoader />}>
            <ContactLocationSection />
          </Suspense>
        </section>
      </div>
    </>
  );
}
