import { Suspense } from "react";
import { SEOHead } from "@/components/seo-head";
import BlogClientWrapper from "@/components/blog-client-wrapper";
import {
  getAllBlogPosts,
  getAllBlogCategories,
} from "@/lib/services/blog-service";

// Dynamic metadata generation based on search params
export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = resolvedSearchParams?.category || "all";
  const searchTerm = resolvedSearchParams?.search || "";

  // Get total post count for dynamic meta
  const allPosts = await getAllBlogPosts();
  const totalPosts = allPosts.length;

  // Dynamic title and description based on filters
  let dynamicTitle =
    "Blog | MKN Group - Türkiye'nin Önde Gelen Fason Üretim Uzmanları";
  let dynamicDescription =
    "Kozmetik fason üretim, ambalaj inovasyonları ve e-ticaret operasyonları konularında uzman görüşleri. Endüstri trendleri, best practices ve profesyonel rehberler ile sektörel bilginizi artırın.";

  if (selectedCategory !== "all") {
    const categoryPosts = allPosts.filter(
      (post) => post.category === selectedCategory
    );
    dynamicTitle = `${selectedCategory} Blog Yazıları | MKN Group - ${categoryPosts.length} Makale`;
    dynamicDescription = `${selectedCategory} konusunda ${categoryPosts.length} uzman makale. MKN Group'un deneyimli ekibinden sektörel içgörüler ve profesyonel rehberler.`;
  }

  if (searchTerm) {
    dynamicTitle = `"${searchTerm}" Arama Sonuçları | MKN Group Blog`;
    dynamicDescription = `${searchTerm} ile ilgili blog yazıları. Kozmetik fason üretim ve sektörel konularda aradığınız içerikleri keşfedin.`;
  }

  return {
    title: dynamicTitle,
    description: dynamicDescription,
    keywords: [
      "kozmetik fason üretim blog",
      "contract manufacturing turkey",
      "ambalaj çözümleri rehberi",
      "private label kozmetik",
      "e-ticaret operasyonları",
      "endüstri trendleri 2024",
      "MKN Group uzman görüşleri",
      "kozmetik sektörü analizi",
      "sürdürülebilir üretim",
      "R&D kozmetik geliştirme",
      "packaging innovation",
      "manufacturing expertise",
      ...(selectedCategory !== "all"
        ? [selectedCategory, `${selectedCategory} blog`]
        : []),
      ...(searchTerm ? [searchTerm, `${searchTerm} makale`] : []),
    ],
    openGraph: {
      title: dynamicTitle,
      description: dynamicDescription,
      type: "website",
      url:
        selectedCategory !== "all"
          ? `https://www.mkngroup.com.tr/blog?category=${selectedCategory}`
          : searchTerm
          ? `https://www.mkngroup.com.tr/blog?search=${encodeURIComponent(
              searchTerm
            )}`
          : "https://www.mkngroup.com.tr/blog",
      siteName: "MKN Group",
      locale: "tr_TR",
      images: [
        {
          url: "https://www.mkngroup.com.tr/og-image.png",
          width: 1200,
          height: 630,
          alt: "MKN Group Blog - Fason Üretim Uzmanları",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@mkngroup_x",
      creator: "@mkngroup_x",
      title: dynamicTitle,
      description: dynamicDescription,
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
      canonical:
        selectedCategory !== "all"
          ? `https://www.mkngroup.com.tr/blog?category=${selectedCategory}`
          : searchTerm
          ? `https://www.mkngroup.com.tr/blog?search=${encodeURIComponent(
              searchTerm
            )}`
          : "https://www.mkngroup.com.tr/blog",
      languages: {
        "tr-TR":
          selectedCategory !== "all"
            ? `https://www.mkngroup.com.tr/blog?category=${selectedCategory}`
            : searchTerm
            ? `https://www.mkngroup.com.tr/blog?search=${encodeURIComponent(
                searchTerm
              )}`
            : "https://www.mkngroup.com.tr/blog",
      },
    },
    authors: [{ name: "MKN Group", url: "https://www.mkngroup.com.tr" }],
    creator: "MKN Group",
    publisher: "MKN Group",
    category: "Manufacturing Blog",
    classification: "Business",
    other: {
      "article:section":
        selectedCategory !== "all" ? selectedCategory : "Manufacturing",
      "article:tag":
        selectedCategory !== "all"
          ? selectedCategory
          : "kozmetik,fason üretim,manufacturing",
    },
  };
}

export default async function BlogPage({ searchParams }) {
  // Server-side'da blog postlarını ve kategorileri Firestore'dan al
  const allPosts = await getAllBlogPosts();
  const categories = await getAllBlogCategories();

  // URL parametrelerini al (await for Next.js 15+)
  const resolvedSearchParams = await searchParams;
  const selectedCategory = resolvedSearchParams?.category || "all";
  const searchTerm = resolvedSearchParams?.search || "";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Advanced SEO Head */}
      <SEOHead
        title="Blog | MKN Group - Türkiye'nin Önde Gelen Fason Üretim Uzmanları"
        description="Kozmetik fason üretim, ambalaj inovasyonları ve e-ticaret operasyonları konularında uzman görüşleri. Endüstri trendleri, best practices ve profesyonel rehberler."
        canonical="https://www.mkngroup.com.tr/blog"
      />

      {/* Enhanced Structured Data with Real-time Content */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "MKN Group Blog",
            description:
              "Kozmetik fason üretim, ambalaj çözümleri ve e-ticaret operasyonları hakkında uzman görüşleri",
            url: "https://www.mkngroup.com.tr/blog",
            inLanguage: "tr-TR",
            publisher: {
              "@type": "Organization",
              name: "MKN Group",
              url: "https://www.mkngroup.com.tr",
              logo: {
                "@type": "ImageObject",
                url: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
                width: 400,
                height: 200,
              },
              sameAs: [
                "https://www.linkedin.com/company/mkn-group",
                "https://twitter.com/mkngroup_x",
                "https://www.instagram.com/mkngroup.tr",
              ],
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://www.mkngroup.com.tr/blog",
            },
            blogPost: allPosts.slice(0, 10).map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              url: `https://www.mkngroup.com.tr/blog/${post.slug}`,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt || post.publishedAt,
              author: {
                "@type": "Organization",
                name: post.author || "MKN Group",
                url: "https://www.mkngroup.com.tr",
              },
              publisher: {
                "@type": "Organization",
                name: "MKN Group",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
                },
              },
              image: {
                "@type": "ImageObject",
                url: `https://www.mkngroup.com.tr${post.image}`,
                width: 1200,
                height: 630,
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://www.mkngroup.com.tr/blog/${post.slug}`,
              },
              articleSection: post.category || "Manufacturing",
              keywords:
                post.tags?.join(", ") || "kozmetik,fason üretim,manufacturing",
              wordCount: post.content?.length || 0,
              inLanguage: "tr-TR",
            })),
            numberOfItems: allPosts.length,
            about: {
              "@type": "Thing",
              name: "Kozmetik Fason Üretim",
              description:
                "Kozmetik ürünlerin fason üretimi ve contract manufacturing hizmetleri",
            },
            audience: {
              "@type": "Audience",
              audienceType: "business professionals",
              geographicArea: {
                "@type": "Country",
                name: "Turkey",
              },
            },
          }),
        }}
      />

      {/* WebSite Schema for Enhanced Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MKN Group",
            url: "https://www.mkngroup.com.tr",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate:
                  "https://www.mkngroup.com.tr/blog?search={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Ana Sayfa",
                item: "https://www.mkngroup.com.tr",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: "https://www.mkngroup.com.tr/blog",
              },
              ...(selectedCategory !== "all"
                ? [
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: selectedCategory,
                      item: `https://www.mkngroup.com.tr/blog?category=${selectedCategory}`,
                    },
                  ]
                : []),
            ],
          }),
        }}
      />

      {/* SEO-Optimized Header with Semantic Structure */}
      <header className="py-16 lg:py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          {/* Dynamic Page Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {selectedCategory !== "all" ? (
              <>
                <span className="text-orange-500">{selectedCategory}</span> Blog
                Yazıları
              </>
            ) : searchTerm ? (
              <>
                "<span className="text-orange-500">{searchTerm}</span>" Arama
                Sonuçları
              </>
            ) : (
              <>
                <span className="text-orange-500">MKN Group</span> Blog
              </>
            )}
          </h1>

          {/* Dynamic Subtitle with Post Count */}
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {selectedCategory !== "all"
              ? `${selectedCategory} konusunda ${
                  allPosts.filter((p) => p.category === selectedCategory).length
                } uzman makale. Sektörel içgörüler ve profesyonel rehberler.`
              : searchTerm
              ? `${searchTerm} ile ilgili makaleleri keşfedin. Aradığınız sektörel içerikleri bulun.`
              : `Kozmetik fason üretim, ambalaj inovasyonları ve e-ticaret operasyonları konularında ${allPosts.length} uzman görüşü`}
          </p>

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mt-8">
            <ol className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a href="/" className="hover:text-orange-500 transition-colors">
                  Ana Sayfa
                </a>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <a
                  href="/blog"
                  className="hover:text-orange-500 transition-colors"
                >
                  Blog
                </a>
              </li>
              {selectedCategory !== "all" && (
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 mx-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-orange-500 font-medium">
                    {selectedCategory}
                  </span>
                </li>
              )}
            </ol>
          </nav>
        </div>
      </header>

      {/* Blog Content - Optimized Client Component Wrapper */}
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-12">
            {/* SEO-friendly loading placeholder with structured content */}
            <div className="space-y-8">
              {/* Loading indicator */}
              <div className="flex items-center justify-center space-x-2 mb-8">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Blog makaleleri yükleniyor...
                </span>
              </div>

              {/* Skeleton content for better CLS */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <article
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <BlogClientWrapper
          initialPosts={allPosts}
          categories={categories}
          initialCategory={selectedCategory}
          initialSearchTerm={searchTerm}
        />
      </Suspense>

      {/* Preload critical resources */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />

      {/* Preconnect to Firebase CDN */}
      <link rel="preconnect" href="https://firebasestorage.googleapis.com" />

      {/* Add RSS feed discovery */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title="MKN Group Blog RSS Feed"
        href="https://www.mkngroup.com.tr/blog/rss.xml"
      />

      {/* Add JSON-LD for Local Business if applicable */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "MKN Group",
            description:
              "Türkiye'nin önde gelen kozmetik fason üretim ve contract manufacturing uzmanı",
            url: "https://www.mkngroup.com.tr",
            telephone: "+90 531 494 25 94", // MKN Group telefon numarası
            address: {
              "@type": "PostalAddress",
              addressCountry: "TR",
              addressLocality: "İstanbul", // Gerçek şehri ekleyin
              addressRegion: "İstanbul",
              postalCode: "34522", // Esenyurt posta kodu
              streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5", // Gerçek adres
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "41.0082", // Gerçek koordinatları ekleyin
              longitude: "28.9784",
            },
            openingHours: "Mo-Fr 09:00-18:00",
            sameAs: [
              "https://www.linkedin.com/company/mkn-group",
              "https://twitter.com/mkngroup_x",
              "https://www.instagram.com/mkngroup.tr",
            ],
          }),
        }}
      />
    </div>
  );
}
