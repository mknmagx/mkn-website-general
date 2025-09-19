import { Metadata } from "next";
import { Suspense } from "react";
import { SEOHead } from "@/components/seo-head";
import BlogClientWrapper from "@/components/blog-client-wrapper";
import { getAllBlogPosts, blogCategories } from "@/data/blog-posts";

export const metadata = {
  title: "Blog | MKN Group - Türkiye'nin Önde Gelen Fason Üretim Uzmanları",
  description:
    "Kozmetik fason üretim, ambalaj inovasyonları ve e-ticaret operasyonları konularında uzman görüşleri. Endüstri trendleri, best practices ve profesyonel rehberler ile sektörel bilginizi artırın.",
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
  ],
  openGraph: {
    title: "Blog | MKN Group - Türkiye'nin Önde Gelen Fason Üretim Uzmanları",
    description:
      "Kozmetik fason üretim, ambalaj inovasyonları ve e-ticaret operasyonları konularında uzman görüşleri ve endüstri analizi.",
    type: "website",
    url: "https://mkngroup.com.tr/blog",
    siteName: "MKN Group",
    locale: "tr_TR",
    images: [
      {
        url: "https://mkngroup.com.tr/og-blog-main.png",
        width: 1200,
        height: 630,
        alt: "MKN Group Blog - Fason Üretim Uzmanları",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup_official",
    creator: "@mkngroup_official",
    title: "Blog | MKN Group - Fason Üretim Uzmanları",
    description:
      "Kozmetik fason üretim ve endüstri trendleri hakkında uzman görüşleri ve profesyonel rehberler.",
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
    canonical: "https://mkngroup.com.tr/blog",
    languages: {
      "tr-TR": "https://mkngroup.com.tr/blog",
    },
  },
  authors: [{ name: "MKN Group", url: "https://mkngroup.com.tr" }],
  creator: "MKN Group",
  publisher: "MKN Group",
  category: "Manufacturing Blog",
  classification: "Business",
};

export default async function BlogPage({ searchParams }) {
  // Server-side'da blog postlarını al
  const allPosts = getAllBlogPosts();
  const categories = blogCategories;

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
        canonical="https://mkngroup.com.tr/blog"
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "MKN Group Blog",
            description:
              "Kozmetik fason üretim, ambalaj çözümleri ve e-ticaret operasyonları hakkında uzman görüşleri",
            url: "https://mkngroup.com.tr/blog",
            publisher: {
              "@type": "Organization",
              name: "MKN Group",
              url: "https://mkngroup.com.tr",
              logo: {
                "@type": "ImageObject",
                url: "https://mkngroup.com.tr/MKN-GROUP-LOGO.png",
                width: 400,
                height: 200,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://mkngroup.com.tr/blog",
            },
            blogPost: allPosts.slice(0, 5).map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              url: `https://mkngroup.com.tr/blog/${post.slug}`,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt || post.publishedAt,
              author: {
                "@type": "Organization",
                name: post.author,
                url: "https://mkngroup.com.tr",
              },
              image: {
                "@type": "ImageObject",
                url: `https://mkngroup.com.tr${post.image}`,
                width: 1200,
                height: 630,
              },
            })),
          }),
        }}
      />

      {/* Clean Header */}
      <header className="py-16 lg:py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          {/* Simple Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="text-orange-500">MKN Group</span> Blog
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Kozmetik fason üretim, ambalaj inovasyonları ve e-ticaret
            operasyonları konularında uzman görüşleri
          </p>
        </div>
      </header>

      {/* Blog Content - Client Component Wrapper */}
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Yükleniyor...
              </span>
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
    </div>
  );
}
