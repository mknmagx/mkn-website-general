import { notFound } from "next/navigation";
import { packagingService } from "@/lib/services/packaging-service";
import { createProductSlug, createCategorySlug } from "@/utils/slugify-tr";
import {
  PackagingProductSchema,
  PackagingBreadcrumbSchema,
  PackagingFAQSchema,
} from "@/components/packaging-structured-data";
import ProductDetailClient from "./client";

const getCloudinaryUrl = (imageName) => {
  if (!imageName) return null;
  // Remove .jpg, .png, .webp extensions if they exist
  const nameWithoutExt = imageName.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_600,h_600,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${nameWithoutExt}`;
};

function serializeProduct(product) {
  if (!product) return null;

  return {
    ...product,
    // Convert Firestore timestamps to ISO strings
    metadata: product.metadata
      ? {
          ...product.metadata,
          createdAt: product.metadata.createdAt?.toDate?.()
            ? product.metadata.createdAt.toDate().toISOString()
            : product.metadata.createdAt,
          updatedAt: product.metadata.updatedAt?.toDate?.()
            ? product.metadata.updatedAt.toDate().toISOString()
            : product.metadata.updatedAt,
          deletedAt: product.metadata.deletedAt?.toDate?.()
            ? product.metadata.deletedAt.toDate().toISOString()
            : product.metadata.deletedAt,
        }
      : product.metadata,
    // Ensure other nested objects are plain
    specifications: product.specifications
      ? { ...product.specifications }
      : product.specifications,
    seo: product.seo ? { ...product.seo } : product.seo,
    business: product.business ? { ...product.business } : product.business,
    customFields: product.customFields
      ? { ...product.customFields }
      : product.customFields,
  };
}

async function getProductData(slug) {
  try {
    // Get all active products from Firestore
    const allProducts = await packagingService.getAllProducts(); // isActive filtresi kaldırıldı

    // Find the product by slug
    const product = allProducts.find((p) => {
      const productSlug = createProductSlug(p);
      return productSlug === slug;
    });

    if (!product) {
      return null;
    }

    // Find related products (same category, different products)
    const relatedProducts = allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    return {
      product: serializeProduct(product),
      relatedProducts: relatedProducts.map(serializeProduct),
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const productData = await getProductData(slug);

  if (!productData) {
    return {
      title: "Ürün Bulunamadı | MKN Group",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  const { product } = productData;
  const productSize = product.specifications?.size || product.size;
  const title = `${product.name}${
    productSize ? ` - ${productSize}` : ""
  } | MKN Group Ambalaj - Stokta Var`;
  const description =
    product.description ||
    `${product.name}${productSize ? ` (${productSize})` : ""} - ${
      product.category
    } kategorisinde profesyonel ambalaj çözümleri. Stokta mevcut, hızlı teslimat.`;
  const canonical = `https://www.mkngroup.com.tr/ambalaj/${slug}`;
  const ogImage = getCloudinaryUrl(product.images?.[0]);

  // Google Shopping optimized keywords
  const seoKeywords = [
    product.name,
    product.category,
    "ambalaj",
    "packaging",
    "MKN Group",
    "stokta var",
    "satın al",
    "fiyat",
    "toptan",
    "üretici",
    product.specifications?.material,
    product.specifications?.size,
    ...(product.features || []),
    ...(product.seo?.keywords || []),
  ].filter(Boolean);

  return {
    title,
    description,
    keywords: seoKeywords.join(", "),
    authors: [{ name: "MKN Group" }],
    creator: "MKN Group",
    publisher: "MKN Group",
    metadataBase: new URL("https://www.mkngroup.com.tr"),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "MKN Group",
      images: [
        {
          url: ogImage || "/apple-touch-icon.png",
          width: 1200,
          height: 630,
          alt: `${product.name} - Stokta Var - MKN Group`,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage || "/apple-touch-icon.png"],
      creator: "@mkngroup",
    },
    other: {
      // Google Shopping specific meta tags
      "product:availability": "in stock",
      "product:condition": "new",
      "product:price:currency": "TRY",
      "product:retailer": "MKN Group",
      "product:brand": "MKN Group",
      "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
      "msvalidate.01": process.env.BING_VERIFICATION || "",
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
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "",
      bing: process.env.BING_VERIFICATION || "",
    },
  };
}

export async function generateStaticParams() {
  try {
    // Get active products from Firestore for static generation
    const products = await packagingService.getAllProducts({ isActive: true });

    return products.slice(0, 50).map((product) => ({
      slug: createProductSlug(product),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    // Return empty array as fallback
    return [];
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const productData = await getProductData(slug);

  if (!productData) {
    notFound();
  }

  const { product, relatedProducts } = productData;
  const categorySlug = createCategorySlug(product.category);

  // Generate schemas for head with new packaging structured data
  const canonical = `https://www.mkngroup.com.tr/ambalaj/${slug}`;
  const productSize = product.specifications?.size || product.size;
  const title = `${product.name}${
    productSize ? ` - ${productSize}` : ""
  } | MKN Group Ambalaj - Stokta Var`;
  const description =
    product.description ||
    `${product.name}${productSize ? ` (${productSize})` : ""} - ${
      product.category
    } kategorisinde profesyonel ambalaj çözümleri. Stokta mevcut, hızlı teslimat.`;

  // Generate Product Schema for SEO with new component
  const productSchema = PackagingProductSchema({
    product,
    pageUrl: canonical,
  });

  // Generate Breadcrumb Schema
  const breadcrumbItems = [
    { name: "Ana Sayfa", url: "https://www.mkngroup.com.tr" },
    { name: "Ambalaj", url: "https://www.mkngroup.com.tr/ambalaj" },
    {
      name: product.category,
      url: `https://www.mkngroup.com.tr/ambalaj/kategori/${categorySlug}`,
    },
    {
      name: product.name,
      url: canonical,
    },
  ];
  const breadcrumbSchema = PackagingBreadcrumbSchema(breadcrumbItems);

  // Generate FAQ Schema
  const faqSchema = PackagingFAQSchema();

  return (
    <>
      {/* Enhanced Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
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
          __html: JSON.stringify(faqSchema),
        }}
      />

      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
