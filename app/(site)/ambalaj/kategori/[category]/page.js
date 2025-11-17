import { notFound } from "next/navigation";
import { packagingService } from "@/lib/services/packaging-service";
import {
  getCategoryFromSlug,
  getAllCategorySlugs,
  createProductSlug,
} from "@/utils/slugify-tr";
import {
  PackagingCategorySchema,
  PackagingBreadcrumbSchema,
  PackagingServiceSchema,
} from "@/components/packaging-structured-data";
import CategoryPageClient from "./client";

const CATEGORY_SEO = {
  "Disc Top Kapaklar": {
    title: "Disc Top Kapaklar | Premium Kozmetik Ambalaj - MKN Group",
    description:
      "Yüksek kaliteli disc top kapaklar - Şampuan, duş jeli ve sıvı sabunlar için ideal alüminyum ve plastik disk top kapak çözümleri. Altın, gümüş, beyaz, siyah renk seçenekleri. 24/410 ve 28/410 ebatları. Hızlı teslimat, uygun fiyat.",
    keywords:
      "disc top kapak, disk top kapak, şampuan kapağı, duş jeli kapağı, sıvı sabun kapağı, clip lock kapak, kozmetik kapak, alüminyum disk top, plastik disc top, 24/410 kapak, 28/410 kapak",
  },
  "Krem Pompalar": {
    title: "Krem Pompaları | Premium Kozmetik Pompalar - MKN Group",
    description:
      "Profesyonel krem pompaları - Yüz kremi, el kremi ve bakım ürünleri için premium alüminyum ve plastik pompalar. 0.75ml debi, left-right lock sistemi. Altın, gümüş, beyaz, siyah renk seçenekleri. ISO sertifikalı üretim.",
    keywords:
      "krem pompası, krem kapağı, yüz kremi pompası, el kremi pompası, bakım ürünü pompası, 24/410 pompa, alüminyum krem pompası, plastik krem pompası, left-right lock pompa",
  },
  "Losyon Pompaları": {
    title: "Losyon Pompaları | Kozmetik Pompa Çözümleri - MKN Group",
    description:
      "Yüksek kapasiteli losyon pompaları - Vücut losyonları ve sıvı bakım ürünleri için 1.80ml debi kapasiteli profesyonel pompalar. Alüminyum ve plastik seçenekleri. Dayanıklı ve uzun ömürlü.",
    keywords:
      "losyon pompası, vücut losyonu pompası, sıvı bakım pompası, 24/410 losyon pompası, yüksek debili pompa, alüminyum losyon pompası, plastik losyon pompası",
  },
  "Sprey Pompalar": {
    title: "Sprey Pompaları | Profesyonel Sprey Çözümleri - MKN Group",
    description:
      "Premium sprey pompaları - Parfüm, deodorant ve kozmetik spreyler için 0.12ml debi kapasiteli alüminyum pompalar. Koruyucu kapaklı, tam kaplama seçenekleri. Altın, gümüş, mat beyaz renkleri. Hassas dozajlama.",
    keywords:
      "sprey pompası, parfüm spreyi, deodorant pompası, kozmetik sprey, 24/410 sprey, alüminyum sprey pompası, tam kaplama sprey, fine mist sprayer",
  },
  "Köpük Pompalar": {
    title: "Köpük Pompaları | Foamer Pump Çözümleri - MKN Group",
    description:
      "Köpük pompaları (foamer pump) - Köpüklü sabun, el yıkama ve temizlik ürünleri için 43/410 ebat plastik pompalar. 0.5ml debi kapasitesi. Zengin köpük oluşumu.",
    keywords:
      "köpük pompası, foamer pump, köpüklü sabun pompası, el yıkama pompası, 43/410 pompa, plastik köpük pompası, foam dispenser",
  },
  "Parmak Losyon Pompaları": {
    title: "Parmak Losyon Pompaları | Mini Kozmetik Pompalar - MKN Group",
    description:
      "Parmak losyon pompaları - Serum, göz kremi ve hassas dozajlama gerektiren ürünler için 20/410 ve 24/410 ebat mini pompalar. Alüminyum ve plastik seçenekleri. Hassas uygulamalar için ideal.",
    keywords:
      "parmak losyon pompası, mini pompa, serum pompası, göz kremi pompası, 20/410 pompa, 24/410 mini pompa, finger pump",
  },
  "Aseton Kapakları": {
    title: "Aseton Kapakları | Oje Çıkarıcı Pompaları - MKN Group",
    description:
      "Aseton kapakları ve oje çıkarıcı pompaları - Aseton, oje çıkarıcı ve kimyasal sıvılar için dayanıklı plastik pompalar. 24/410 ebat, 0.5ml debi. Kimyasal dayanıklı malzeme.",
    keywords:
      "aseton kapağı, oje çıkarıcı pompası, aseton pompası, nail polish remover pump, 24/410 aseton kapağı, kimyasal pompa",
  },
  "Airless Şişeler": {
    title: "Airless Şişeler | Hava Geçirmeyen Ambalajlar - MKN Group",
    description:
      "Premium airless şişeler - Hassas formüller için hava geçirmeyen vakum sistemli şişeler. 10ml, 50ml, 100ml kapasiteler. UV korumalı, vakum pompası. Maksimum ürün koruması, %100 boşaltma.",
    keywords:
      "airless şişe, hava geçirmeyen şişe, vakum şişe, serum şişesi, krem şişesi, airless bottle, vacuum pump bottle, 50ml airless, 100ml airless",
  },
};

function getCategorySEO(categoryName) {
  return (
    CATEGORY_SEO[categoryName] || {
      title: `${categoryName} | MKN Group Kozmetik Ambalaj`,
      description: `${categoryName} kategorisinde profesyonel kozmetik ambalaj çözümleri. Premium kalite, uygun fiyat, hızlı teslimat.`,
      keywords: `${categoryName}, kozmetik ambalaj, MKN Group, packaging`,
    }
  );
}

async function getCategoryData(categorySlug) {
  try {
    const categoryName = getCategoryFromSlug(categorySlug);

    if (!categoryName) {
      return null;
    }

    // Get all active products
    const allProducts = await packagingService.getAllProducts();

    // Filter products by category
    const categoryProducts = allProducts.filter(
      (p) => p.category === categoryName
    );

    if (categoryProducts.length === 0) {
      return null;
    }

    // Convert Firestore Timestamp objects to plain JavaScript objects
    const serializedProducts = categoryProducts.map((product) => {
      // Helper function to serialize any Timestamp object
      const serializeTimestamp = (timestamp) => {
        if (!timestamp || typeof timestamp !== "object" || !timestamp.seconds) {
          return timestamp; // Return as-is if not a Timestamp
        }
        return {
          seconds: timestamp.seconds,
          nanoseconds: timestamp.nanoseconds,
        };
      };

      // Deep serialize the product object
      const serializedProduct = {};
      for (const [key, value] of Object.entries(product)) {
        if (value && typeof value === "object" && value.seconds !== undefined) {
          // This looks like a Timestamp object
          serializedProduct[key] = serializeTimestamp(value);
        } else if (Array.isArray(value)) {
          // Handle arrays that might contain Timestamps
          serializedProduct[key] = value.map((item) =>
            item && typeof item === "object" && item.seconds !== undefined
              ? serializeTimestamp(item)
              : item
          );
        } else if (value && typeof value === "object") {
          // Handle nested objects that might contain Timestamps
          const nestedObject = {};
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            if (
              nestedValue &&
              typeof nestedValue === "object" &&
              nestedValue.seconds !== undefined
            ) {
              nestedObject[nestedKey] = serializeTimestamp(nestedValue);
            } else {
              nestedObject[nestedKey] = nestedValue;
            }
          }
          serializedProduct[key] = nestedObject;
        } else {
          serializedProduct[key] = value;
        }
      }
      return serializedProduct;
    });

    return {
      categoryName,
      categorySlug,
      products: serializedProducts,
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryData = await getCategoryData(category);

  if (!categoryData) {
    return {
      title: "Kategori Bulunamadı | MKN Group",
      description: "Aradığınız kategori bulunamadı.",
    };
  }

  const { categoryName, categorySlug, products } = categoryData;
  const seo = getCategorySEO(categoryName);
  const canonical = `https://www.mkngroup.com.tr/ambalaj/kategori/${categorySlug}`;

  // Get first product image for OG image
  const firstProductImage = categoryData.products[0]?.images?.[0];
  const ogImage = firstProductImage
    ? `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_1200,h_630,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${firstProductImage.replace(
        /\.(jpg|jpeg|png|webp)$/i,
        ""
      )}`
    : "https://www.mkngroup.com.tr/og-image.png";

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: "MKN Group" }],
    creator: "MKN Group",
    publisher: "MKN Group",
    metadataBase: new URL("https://www.mkngroup.com.tr"),
    alternates: {
      canonical,
      languages: {
        "tr-TR": canonical,
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: "MKN Group",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
      creator: "@mkngroup_x",
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
    category: "business",
    classification: "Cosmetics Packaging, Manufacturing",
    other: {
      "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
    },
  };
}

export async function generateStaticParams() {
  try {
    // Get all category slugs for static generation
    const categorySlugs = getAllCategorySlugs();

    return categorySlugs.map((slug) => ({
      category: slug,
    }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categoryData = await getCategoryData(category);

  if (!categoryData) {
    notFound();
  }

  const { categoryName, categorySlug, products } = categoryData;
  const canonical = `https://www.mkngroup.com.tr/ambalaj/kategori/${categorySlug}`;

  // Generate schemas for head with new packaging components
  const breadcrumbItems = [
    { name: "Ana Sayfa", url: "https://www.mkngroup.com.tr" },
    { name: "Ambalaj Ürünleri", url: "https://www.mkngroup.com.tr/ambalaj" },
    {
      name: categoryName,
      url: `https://www.mkngroup.com.tr/ambalaj/kategori/${categorySlug}`,
    },
  ];

  const seo = getCategorySEO(categoryName);

  // 1. Category Schema with new component
  const categorySchema = PackagingCategorySchema({
    products,
    categoryName,
    pageUrl: canonical,
    pageTitle: seo.title,
    pageDescription: seo.description,
  });

  // 2. BreadcrumbList Schema with new component
  const breadcrumbSchema = PackagingBreadcrumbSchema(breadcrumbItems);

  // 3. Service Schema
  const serviceSchema = PackagingServiceSchema();

  return (
    <>
      {/* Enhanced Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categorySchema),
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

      <CategoryPageClient
        categoryName={categoryName}
        categorySlug={categorySlug}
        products={products}
      />
    </>
  );
}
