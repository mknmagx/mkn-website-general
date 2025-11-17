import {
  PackagingMainPageSchema,
  PackagingBreadcrumbSchema,
  PackagingServiceSchema,
  PackagingFAQSchema,
} from "@/components/packaging-structured-data";
import AmbalajClient from "./client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { packagingService } from "@/lib/services/packaging-service";
import { createProductSlug } from "@/utils/slugify-tr";

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

export async function generateMetadata() {
  // Load products for schema generation
  let products = [];
  try {
    products = await packagingService.getAllProducts();
  } catch (error) {
    console.error("Error loading products for schema:", error);
    products = [];
  }

  return {
    title: "Kozmetik Ambalaj Ürünleri | MKN Group - Premium Kalite Ambalajlar",
    description:
      "🏭 MKN Group fason ambalaj üretimi: ISO sertifikalı premium kozmetik ambalajları. Parfüm şişeleri, airless ambalajlar, krem kavanozları ve özel tasarım packaging çözümleri. ✨ Hızlı teslimat, uygun fiyat, 6+ yıl deneyim.",
    keywords:
      "kozmetik ambalaj, parfüm şişesi, krem kavanozu, pompalı şişe, serum şişesi, ambalaj ürünleri, MKN Group, airless şişe, disc top kapak, kozmetik packaging, ambalaj üreticisi, fason ambalaj, özel tasarım ambalaj, cosmetic packaging, private label ambalaj, contract manufacturing, custom ambalaj tasarımı, foundation şişesi, mascara tüpü, ruj kutusu, glossy ambalaj, mat ambalaj, şeffaf ambalaj, opak ambalaj, cam ambalaj, plastik ambalaj, pp ambalaj, pet ambalaj, pcr ambalaj, sürdürülebilir ambalaj, eco friendly packaging, refillable ambalaj, doldurulabilir ambalaj, travel size ambalaj, mini ambalaj, sample ambalaj",
    authors: [{ name: "MKN Group" }],
    creator: "MKN Group",
    publisher: "MKN Group",
    metadataBase: new URL("https://www.mkngroup.com.tr"),
    alternates: {
      canonical: "https://www.mkngroup.com.tr/ambalaj",
      languages: {
        "tr-TR": "https://www.mkngroup.com.tr/ambalaj",
      },
    },
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
    category: "business",
    classification: "Cosmetics Packaging, Manufacturing",
    other: {
      "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
    },
  };
}

export default async function AmbalajPage() {
  // Load products for schema generation
  let products = [];
  try {
    products = await packagingService.getAllProducts();
  } catch (error) {
    console.error("Error loading products for schema:", error);
    products = [];
  }

  // Generate schemas with new packaging structured data
  const breadcrumbItems = [
    { name: "Ana Sayfa", url: "https://www.mkngroup.com.tr" },
    { name: "Ambalaj Ürünleri", url: "https://www.mkngroup.com.tr/ambalaj" },
  ];

  const pageUrl = "https://www.mkngroup.com.tr/ambalaj";

  // Extract unique categories from products
  const categories = [...new Set(products.map((product) => product.category))];

  // New comprehensive schemas
  const mainPageSchema = PackagingMainPageSchema({
    products,
    categories,
    pageUrl,
  });

  const breadcrumbSchema = PackagingBreadcrumbSchema(breadcrumbItems);
  const serviceSchema = PackagingServiceSchema();
  const faqSchema = PackagingFAQSchema();

  return (
    <>
      {/* Enhanced Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(mainPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
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
