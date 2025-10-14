import {
  ServiceSchema,
  BreadcrumbSchema,
  ProductCatalogSchema,
  WebPageSchema,
  ManufacturerSchema,
  AmbalajFAQSchema,
} from "@/components/structured-data";
import AmbalajClient from "./client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { packagingService } from "@/lib/services/packaging-service";

// Lazy load SEO content for performance
const AmbalajSeoContent = dynamic(
  () => import("@/components/ambalaj-seo-content"),
  {
    ssr: true,
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-32 rounded-lg" />
    ),
  }
);

export const metadata = {
  title: "Kozmetik Ambalaj Ürünleri | MKN Group - Premium Kalite Ambalajlar",
  description:
    "🏭 MKN Group fason ambalaj üretimi: ISO sertifikalı premium kozmetik ambalajları. Parfüm şişeleri, airless ambalajlar, krem kavanozları ve özel tasarım packaging çözümleri. ✨ Hızlı teslimat, uygun fiyat, 6+ yıl deneyim.",
  keywords:
    "kozmetik ambalaj, parfüm şişesi, krem kavanozu, pompalı şişe, serum şişesi, ambalaj ürünleri, MKN Group, airless şişe, disc top kapak, kozmetik packaging, ambalaj üreticisi, fason ambalaj, özel tasarım ambalaj, cosmetic packaging, private label ambalaj, contract manufacturing, custom ambalaj tasarımı, foundation şişesi, mascara tüpü, ruj kutusu, glossy ambalaj, mat ambalaj, şeffaf ambalaj, opak ambalaj, cam ambalaj, plastik ambalaj, pp ambalaj, pet ambalaj, pcr ambalaj, sürdürülebilir ambalaj, eco friendly packaging, refillable ambalaj, doldurulabilir ambalaj, travel size ambalaj, mini ambalaj, sample ambalaj",
  openGraph: {
    title: "Kozmetik Ambalaj Ürünleri | MKN Group",
    description:
      "Premium kalitede kozmetik ambalaj ürünleri. Geniş ürün yelpazesi, hızlı teslimat ve uygun fiyatlarla.",
    type: "website",
    url: "https://www.mkngroup.com.tr/ambalaj",
    siteName: "MKN Group",
    locale: "tr_TR",
    images: [
      {
        url: "https://www.mkngroup.com.tr/og-image.png",
        width: 1200,
        height: 630,
        alt: "MKN Group Kozmetik Ambalaj Ürünleri",
        type: "image/png",
      },
      {
        url: "https://res.cloudinary.com/dnfmvs2ci/image/upload/w_1200,h_630,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/cosmetic-packaging-mockup.png",
        width: 1200,
        height: 630,
        alt: "Kozmetik Ambalaj Ürünleri Koleksiyonu",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup_x",
    creator: "@mkngroup_x",
    title: "Kozmetik Ambalaj Ürünleri | MKN Group",
    description:
      "Premium kalitede kozmetik ambalaj ürünleri. Geniş ürün yelpazesi, hızlı teslimat ve uygun fiyatlarla.",
    images: {
      url: "https://www.mkngroup.com.tr/og-image.png",
      alt: "MKN Group Kozmetik Ambalaj Ürünleri",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.mkngroup.com.tr/ambalaj",
    languages: {
      "tr-TR": "https://www.mkngroup.com.tr/ambalaj",
    },
  },
  category: "business",
  classification: "Cosmetics Packaging, Manufacturing",
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
    "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
  },
};

export default async function AmbalajPage() {
  // Firestore'dan aktif ürünleri al
  let products = [];
  try {
    products = await packagingService.getAllProducts(); // Filter kaldırıldı
  } catch (error) {
    console.error("Error loading products for schema:", error);
    products = [];
  }

  return (
    <>
      <ServiceSchema
        service={{
          name: "Kozmetik Ambalaj Ürünleri",
          description:
            "Premium kalitede kozmetik ambalaj ürünleri, parfüm şişeleri, krem kavanozları ve pompalı şişeler.",
          type: "Kozmetik Ambalaj",
          category: "Manufacturing",
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Ana Sayfa", url: "https://www.mkngroup.com.tr" },
          {
            name: "Ambalaj Ürünleri",
            url: "https://www.mkngroup.com.tr/ambalaj",
          },
        ]}
      />
      <ProductCatalogSchema products={products} category="Kozmetik Ambalaj" />
      <WebPageSchema
        title="Kozmetik Ambalaj Ürünleri | MKN Group - Premium Kalite Ambalajlar"
        description="MKN Group'un geniş kozmetik ambalaj koleksiyonu. Parfüm şişeleri, krem kavanozları, pompalı şişeler ve daha fazlası. Yüksek kalite, uygun fiyat."
        url="https://www.mkngroup.com.tr/ambalaj"
        breadcrumbs={[
          { name: "Ana Sayfa", url: "https://www.mkngroup.com.tr" },
          {
            name: "Ambalaj Ürünleri",
            url: "https://www.mkngroup.com.tr/ambalaj",
          },
        ]}
      />
      <ManufacturerSchema />
      <AmbalajFAQSchema />

      {/* Ambalaj-specific LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://www.mkngroup.com.tr/ambalaj#business",
            name: "MKN Group Kozmetik Ambalaj Üretimi",
            alternateName: "MKN Group Packaging",
            description:
              "Türkiye'nin önde gelen fason kozmetik ambalaj üretim şirketi. Premium kalite airless ambalajlar, parfüm şişeleri ve özel tasarım packaging çözümleri.",
            url: "https://www.mkngroup.com.tr/ambalaj",
            telephone: "+90 212 886 57 41",
            email: "info@mkngroup.com.tr",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5",
              addressLocality: "Esenyurt",
              addressRegion: "İstanbul",
              postalCode: "34522",
              addressCountry: "TR",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 41.0082,
              longitude: 28.9784,
            },
            openingHours: "Mo-Fr 09:00-18:00",
            priceRange: "$$",
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Kozmetik Ambalaj Ürünleri",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Parfüm Şişesi Üretimi",
                    description:
                      "5ml-100ml arası cam ve kristal parfüm şişeleri",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Airless Ambalaj Üretimi",
                    description:
                      "Hassas formüller için airless pompa sistemleri",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Fason Ambalaj Üretimi",
                    description:
                      "Markanıza özel tasarım private label ambalajlar",
                  },
                },
              ],
            },
            areaServed: [
              {
                "@type": "Country",
                name: "Turkey",
              },
              {
                "@type": "Country",
                name: "Europe",
              },
            ],
            knowsAbout: [
              "Kozmetik Ambalaj",
              "Fason Üretim",
              "Private Label",
              "Contract Manufacturing",
              "Airless Packaging",
              "Parfüm Şişeleri",
              "Sustainable Packaging",
            ],
          }),
        }}
      />

      <AmbalajClient />
      <Suspense
        fallback={
          <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-32 rounded-lg" />
        }
      >
        <AmbalajSeoContent />
      </Suspense>
    </>
  );
}
