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
import { ServiceSchema, BreadcrumbSchema } from "@/components/structured-data";
import { products, product_catalog } from "@/data/products-catalog";
import { slugifyTr } from "@/utils/slugify-tr";
import AmbalajClient from "./client";

export const metadata = {
  title: "Kozmetik Ambalaj Ürünleri | MKN Group - Premium Kalite Ambalajlar",
  description: "MKN Group'un geniş kozmetik ambalaj koleksiyonu. Parfüm şişeleri, krem kavanozları, pompalı şişeler ve daha fazlası. Yüksek kalite, uygun fiyat.",
  keywords: "kozmetik ambalaj, parfüm şişesi, krem kavanozu, pompalı şişe, serum şişesi, ambalaj ürünleri, MKN Group",
  openGraph: {
    title: "Kozmetik Ambalaj Ürünleri | MKN Group",
    description: "Premium kalitede kozmetik ambalaj ürünleri. Geniş ürün yelpazesi, hızlı teslimat ve uygun fiyatlarla.",
    type: "website",
    url: "https://mkngroup.com.tr/ambalaj",
    images: [
      {
        url: "https://mkngroup.com.tr/og-image.png",
        width: 1200,
        height: 630,
        alt: "MKN Group Kozmetik Ambalaj Ürünleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozmetik Ambalaj Ürünleri | MKN Group",
    description: "Premium kalitede kozmetik ambalaj ürünleri. Geniş ürün yelpazesi, hızlı teslimat ve uygun fiyatlarla.",
    images: ["https://mkngroup.com.tr/og-image.png"],
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
    canonical: "https://mkngroup.com.tr/ambalaj",
  },
};

export default function AmbalajPage() {
  return <AmbalajClient />;
}
