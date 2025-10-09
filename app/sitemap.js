import { site } from "@/config/site";
import { products } from "@/data/products-catalog";
import { getAllBlogPosts } from "@/lib/services/blog-service";
import { createProductSlug } from "@/utils/slugify-tr";

export default async function sitemap() {
  const baseUrl = `https://${site.domain}`;
  const currentDate = new Date();

  // Blog postlarını Firestore'dan al
  const blogPosts = await getAllBlogPosts();

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

  // Ana sayfa URL'lerini oluştur
  const staticUrls = mainRoutes.map((item) => {
    return {
      url: `${baseUrl}${item.route}`,
      lastModified: currentDate,
      changeFrequency: item.changeFreq,
      priority: item.priority,
    };
  });

  // Ürün URL'lerini oluştur
  const productUrls = products.map((product) => {
    return {
      url: `${baseUrl}/ambalaj/${createProductSlug(product)}`,
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
