/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/manufacturing",
        destination: "/fason-uretim",
        permanent: true,
      },
      {
        source: "/uretim",
        destination: "/fason-uretim",
        permanent: true,
      },
      {
        source: "/uretim/kozmetik",
        destination: "/fason-uretim/kozmetik-fason-uretim",
        permanent: true,
      },
      {
        source: "/uretim/gida-takviyesi",
        destination: "/fason-uretim/gida-takviyesi-fason-uretim",
        permanent: true,
      },
      {
        source: "/uretim/temizlik-bakim",
        destination: "/fason-uretim/temizlik-urunleri-fason-uretim",
        permanent: true,
      },
      // Eski fason üretim URL'lerinden yenilerine redirect
      {
        source: "/fason-uretim/kozmetik",
        destination: "/fason-uretim/kozmetik-fason-uretim",
        permanent: true,
      },
      {
        source: "/fason-uretim/gida-takviyesi",
        destination: "/fason-uretim/gida-takviyesi-fason-uretim",
        permanent: true,
      },
      {
        source: "/fason-uretim/temizlik-bakim",
        destination: "/fason-uretim/temizlik-urunleri-fason-uretim",
        permanent: true,
      },
      {
        source: "/facilities",
        destination: "/tesisler",
        permanent: true,
      },
      {
        source: "/operations",
        destination: "/e-ticaret",
        permanent: true,
      },
      {
        source: "/depo-operasyon",
        destination: "/e-ticaret",
        permanent: true,
      },
      {
        source: "/marketing",
        destination: "/pazarlama",
        permanent: true,
      },
      {
        source: "/products",
        destination: "/tasarim",
        permanent: true,
      },
      {
        source: "/urunler",
        destination: "/tasarim",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/hakkimizda",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/iletisim",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
