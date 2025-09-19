import { site } from "@/config/site";
import { products } from "@/data/products-catalog";
import { getAllBlogPosts } from "@/data/blog-posts";

export default function sitemap() {
  const baseUrl = `https://${site.domain}`;
  const currentDate = new Date();

  // Blog postlarını al
  const blogPosts = getAllBlogPosts();

  // Ana sayfalar ve öncelik sıralaması
  const mainRoutes = [
    { route: "", priority: 1.0, changeFreq: "daily" },
    { route: "/fason-uretim", priority: 0.9, changeFreq: "weekly" },
    {
      route: "/fason-uretim/kozmetik-fason-uretim",
      priority: 0.8,
      changeFreq: "weekly",
    },
    {
      route: "/fason-uretim/gida-takviyesi-fason-uretim",
      priority: 0.8,
      changeFreq: "weekly",
    },
    {
      route: "/fason-uretim/temizlik-urunleri-fason-uretim",
      priority: 0.8,
      changeFreq: "weekly",
    },
    { route: "/ambalaj", priority: 0.9, changeFreq: "weekly" },
    { route: "/tesisler", priority: 0.8, changeFreq: "monthly" },
    { route: "/tesisler/aspar-ilac", priority: 0.7, changeFreq: "monthly" },
    { route: "/tesisler/dogukan-kimya", priority: 0.7, changeFreq: "monthly" },
    { route: "/e-ticaret", priority: 0.8, changeFreq: "weekly" },
    { route: "/pazarlama", priority: 0.8, changeFreq: "weekly" },
    { route: "/tasarim", priority: 0.8, changeFreq: "weekly" },
    { route: "/blog", priority: 0.8, changeFreq: "daily" },
    { route: "/hakkimizda", priority: 0.7, changeFreq: "monthly" },
    { route: "/iletisim", priority: 0.9, changeFreq: "monthly" },
    { route: "/teklif", priority: 0.8, changeFreq: "monthly" },
  ];

  // Ambalaj kategorileri ve öncelikleri
  const categoryRoutes = [
    {
      route: "/ambalaj/disc-top-kapaklar",
      priority: 0.7,
      changeFreq: "weekly",
    },
    { route: "/ambalaj/krem-pompalar", priority: 0.7, changeFreq: "weekly" },
    {
      route: "/ambalaj/parmak-losyon-pompalari",
      priority: 0.7,
      changeFreq: "weekly",
    },
    { route: "/ambalaj/losyon-pompalari", priority: 0.7, changeFreq: "weekly" },
    { route: "/ambalaj/sprey-pompalar", priority: 0.7, changeFreq: "weekly" },
    { route: "/ambalaj/kopuk-pompalar", priority: 0.7, changeFreq: "weekly" },
    { route: "/ambalaj/aseton-kapaklari", priority: 0.7, changeFreq: "weekly" },
    { route: "/ambalaj/airless-siseler", priority: 0.7, changeFreq: "weekly" },
  ];

  // Ana sayfa ve kategori URL'lerini oluştur
  const staticUrls = [...mainRoutes, ...categoryRoutes].map((item) => {
    return {
      url: `${baseUrl}${item.route}`,
      lastModified: currentDate,
      changeFrequency: item.changeFreq,
      priority: item.priority,
    };
  });

  // Ürün URL'lerini oluştur
  const productUrls = products.map((product) => {
    // Kategori adını URL-friendly hale getir
    const categorySlug = product.category
      .toLowerCase()
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Ürün adını URL-friendly hale getir
    const productSlug = product.name
      .toLowerCase()
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-") // Çoklu tire işaretlerini tek tire yap
      .replace(/^-|-$/g, ""); // Başta ve sonda tire varsa kaldır

    return {
      url: `${baseUrl}/ambalaj/${productSlug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  // Blog yazı URL'lerini oluştur
  const blogUrls = blogPosts.map((post) => {
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: "monthly",
      priority: post.featured ? 0.8 : 0.7,
    };
  });

  // Tüm URL'leri birleştir
  return [...staticUrls, ...productUrls, ...blogUrls];
}
