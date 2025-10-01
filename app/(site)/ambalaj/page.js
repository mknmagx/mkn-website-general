import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Sliders,
  Tag,
  Package,
  Droplets,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ServiceSchema,
  BreadcrumbSchema,
  ProductCatalogSchema,
  WebPageSchema,
  ManufacturerSchema,
  AmbalajFAQSchema,
} from "@/components/structured-data";
import { products, product_catalog } from "@/data/products-catalog";
import { slugifyTr } from "@/utils/slugify-tr";
import AmbalajClient from "./client";

export const metadata = {
  title: "Kozmetik Ambalaj Ürünleri | MKN Group - Premium Kalite Ambalajlar",
  description:
    "MKN Group'un geniş kozmetik ambalaj koleksiyonu. Parfüm şişeleri, krem kavanozları, pompalı şişeler ve daha fazlası. Yüksek kalite, uygun fiyat.",
  keywords:
    "kozmetik ambalaj, parfüm şişesi, krem kavanozu, pompalı şişe, serum şişesi, ambalaj ürünleri, MKN Group, airless şişe, disc top kapak, kozmetik packaging, ambalaj üreticisi, fason ambalaj, özel tasarım ambalaj",
  openGraph: {
    title: "Kozmetik Ambalaj Ürünleri | MKN Group",
    description:
      "Premium kalitede kozmetik ambalaj ürünleri. Geniş ürün yelpazesi, hızlı teslimat ve uygun fiyatlarla.",
    type: "website",
    url: "https://mkngroup.com.tr/ambalaj",
    siteName: "MKN Group",
    locale: "tr_TR",
    images: [
      {
        url: "https://mkngroup.com.tr/og-image.png",
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
      url: "https://mkngroup.com.tr/og-image.png",
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
    canonical: "https://mkngroup.com.tr/ambalaj",
    languages: {
      "tr-TR": "https://mkngroup.com.tr/ambalaj",
    },
  },
  category: "business",
  classification: "Cosmetics Packaging, Manufacturing",
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
    "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
  },
};

export default function AmbalajPage() {
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
          { name: "Ana Sayfa", url: "https://mkngroup.com.tr" },
          { name: "Ambalaj Ürünleri", url: "https://mkngroup.com.tr/ambalaj" },
        ]}
      />
      <ProductCatalogSchema products={products} category="Kozmetik Ambalaj" />
      <WebPageSchema
        title="Kozmetik Ambalaj Ürünleri | MKN Group - Premium Kalite Ambalajlar"
        description="MKN Group'un geniş kozmetik ambalaj koleksiyonu. Parfüm şişeleri, krem kavanozları, pompalı şişeler ve daha fazlası. Yüksek kalite, uygun fiyat."
        url="https://mkngroup.com.tr/ambalaj"
        breadcrumbs={[
          { name: "Ana Sayfa", url: "https://mkngroup.com.tr" },
          { name: "Ambalaj Ürünleri", url: "https://mkngroup.com.tr/ambalaj" },
        ]}
      />
      <ManufacturerSchema />
      <AmbalajFAQSchema />
      <AmbalajClient />
    </>
  );
}
