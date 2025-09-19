import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  ShoppingCart,
  Star,
  Check,
  X,
  Package,
  Truck,
  Shield,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  Download,
  Mail,
  Phone,
  Palette,
  Ruler,
  Package2,
  Info,
  FileText,
  MessageCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products } from "@/data/products-catalog";
import { slugifyTr } from "@/utils/slugify-tr";
import { ProductSchema, BreadcrumbSchema } from "@/components/structured-data";
import { notFound } from "next/navigation";
import ProductDetailClient from "./client";

// Server-side metadata generation
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  
  if (!resolvedParams?.slug) {
    return {
      title: "Ürün Bulunamadı | MKN Group",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  const product = products.find(
    (p) => slugifyTr(p.name) === resolvedParams.slug
  );

  if (!product) {
    return {
      title: "Ürün Bulunamadı | MKN Group",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  const productImageUrl = product.images?.[0] 
    ? `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_1200,h_630,c_fill,g_center,f_auto,q_auto/v1751736117/mkngroup/${product.images[0]}`
    : "https://mkngroup.com.tr/og-image.png";

  return {
    title: `${product.name} | ${product.category} | MKN Group`,
    description: product.description || `${product.name} - ${product.category}. Kod: ${product.code}. ${product.material ? `Materyal: ${product.material}.` : ''} ${product.size ? `Boyut: ${product.size}.` : ''} MKN Group kalitesiyle.`,
    keywords: `${product.name}, ${product.category}, ${product.code}, kozmetik ambalaj, ${product.material || ''}, MKN Group`,
    openGraph: {
      title: `${product.name} | MKN Group`,
      description: product.description || `${product.name} - ${product.category}. Premium kalitede kozmetik ambalaj ürünü.`,
      type: "product",
      url: `https://mkngroup.com.tr/ambalaj/${resolvedParams.slug}`,
      images: [
        {
          url: productImageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | MKN Group`,
      description: product.description || `${product.name} - ${product.category}. Premium kalitede kozmetik ambalaj ürünü.`,
      images: [productImageUrl],
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
    alternates: {
      canonical: `https://mkngroup.com.tr/ambalaj/${resolvedParams.slug}`,
    },
  };
}

// Generate static params for all products
export async function generateStaticParams() {
  return products.map((product) => ({
    slug: slugifyTr(product.name),
  }));
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  
  if (!resolvedParams?.slug) {
    notFound();
  }

  const product = products.find(
    (p) => slugifyTr(p.name) === resolvedParams.slug
  );

  if (!product) {
    notFound();
  }

  // Find related products (same category, different products)
  const relatedProducts = products
    .filter(
      (p) =>
        p.category === product.category && p.id !== product.id
    )
    .slice(0, 4);

  return (
    <>
      <ProductSchema
        product={{
          "@type": "Product",
          name: product.name,
          description: product.description || `${product.name} - ${product.category}`,
          sku: product.code,
          brand: {
            "@type": "Brand",
            name: "MKN Group",
          },
          category: product.category,
          material: product.material,
          size: product.size,
          color: product.colors,
          inStock: product.inStock !== false,
          image: product.images?.map(img => 
            `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_800,h_800,c_fill,g_center,f_auto,q_auto/v1751736117/mkngroup/${img}`
          ) || [],
          manufacturer: {
            "@type": "Organization",
            name: "MKN Group",
            url: "https://mkngroup.com.tr",
          },
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Ana Sayfa", url: "https://mkngroup.com.tr" },
          { name: "Ambalaj Ürünleri", url: "https://mkngroup.com.tr/ambalaj" },
          { name: product.category, url: `https://mkngroup.com.tr/ambalaj?category=${encodeURIComponent(product.category)}` },
          { name: product.name, url: `https://mkngroup.com.tr/ambalaj/${slugifyTr(product.name)}` },
        ]}
      />
      
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts}
      />
    </>
  );
}
