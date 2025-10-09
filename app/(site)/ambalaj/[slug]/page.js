import { notFound } from "next/navigation";
import { products } from "@/data/products-catalog";
import { slugifyTr, createProductSlug } from "@/utils/slugify-tr";
import {
  ProductSchema,
  BreadcrumbSchema,
  WebPageSchema,
} from "@/components/structured-data";
import ProductDetailClient from "./client";

const getCloudinaryUrl = (imageName) => {
  if (!imageName) return null;
  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_600,h_600,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${imageName}`;
};

// Server-side function to get product data
async function getProductData(slug) {
  const product = products.find((p) => createProductSlug(p) === slug);

  if (!product) {
    return null;
  }

  // Find related products (same category, different products)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return {
    product,
    relatedProducts,
  };
}

// Generate metadata for SEO
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
  const title = `${product.name} | MKN Group Ambalaj`;
  const description = `${product.description} - ${product.category} kategorisinde profesyonel ambalaj çözümleri.`;
  const canonical = `https://www.mkngroup.com.tr/ambalaj/${slug}`;
  const ogImage = getCloudinaryUrl(product.images?.[0]);

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category,
      "ambalaj",
      "MKN Group",
      product.material,
      "packaging",
      ...(product.features || []),
    ]
      .filter(Boolean)
      .join(", "),
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
          alt: product.name,
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
  };
}

// Generate static params for better performance
export async function generateStaticParams() {
  return products.slice(0, 50).map((product) => ({
    slug: createProductSlug(product),
  }));
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const productData = await getProductData(slug);

  if (!productData) {
    notFound();
  }

  const { product, relatedProducts } = productData;
  return (
    <>
      <ProductSchema product={product} />
      <BreadcrumbSchema
        items={[
          { name: "Ana Sayfa", url: "https://www.mkngroup.com.tr" },
          { name: "Ambalaj", url: "https://www.mkngroup.com.tr/ambalaj" },
          {
            name: product.category,
            url: `https://www.mkngroup.com.tr/ambalaj?category=${encodeURIComponent(
              product.category
            )}`,
          },
          {
            name: product.name,
            url: `https://www.mkngroup.com.tr/ambalaj/${createProductSlug(product)}`,
          },
        ]}
      />
      <WebPageSchema
        title={`${product.name} | MKN Group Ambalaj`}
        description={`${product.description} - ${product.category} kategorisinde profesyonel ambalaj çözümleri.`}
        url={`https://www.mkngroup.com.tr/ambalaj/${createProductSlug(product)}`}
        breadcrumbs={[
          { name: "Ana Sayfa", url: "https://www.mkngroup.com.tr" },
          { name: "Ambalaj", url: "https://www.mkngroup.com.tr/ambalaj" },
          {
            name: product.category,
            url: `https://www.mkngroup.com.tr/ambalaj?category=${encodeURIComponent(
              product.category
            )}`,
          },
          {
            name: product.name,
            url: `https://www.mkngroup.com.tr/ambalaj/${createProductSlug(product)}`,
          },
        ]}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
