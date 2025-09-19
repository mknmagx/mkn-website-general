import { site } from "@/config/site";

export default function robots() {
  const baseUrl = `https://${site.domain}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/private/",
          "/*.json$",
          "/node_modules/",
        ],
        crawlDelay: 1,
      },
      // Google Bot için özel kurallar
      {
        userAgent: "Googlebot",
        allow: ["/", "/images/", "/css/", "/js/"],
        disallow: ["/api/", "/admin/", "/_next/"],
      },
      // Bing Bot için özel kurallar
      {
        userAgent: "Bingbot",
        allow: ["/", "/images/", "/css/", "/js/"],
        disallow: ["/api/", "/admin/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
