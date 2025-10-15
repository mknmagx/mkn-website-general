import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  ArrowRight,
} from "lucide-react";
import { SEOHead } from "@/components/seo-head";
import ShareButton from "@/components/share-button";
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/lib/services/blog-service";

export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const post = await getBlogPostBySlug(awaitedParams.slug);

  if (!post) {
    return {
      title: "Blog Yazısı Bulunamadı | MKN Group",
    };
  }

  return {
    title: `${post.title} | MKN Group Blog`,
    description: post.metaDescription || post.excerpt,
    keywords: post.tags?.join(", "),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [
        {
          url: post.image || "/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image || "/og-image.png"],
    },
    alternates: {
      canonical: `https://www.mkngroup.com.tr/blog/${post.slug}`,
    },
  };
}

export async function generateStaticParams() {
  // Bu sayfa dinamik olarak render edilecek
  return [];
}

export default async function BlogPostPage({ params }) {
  const awaitedParams = await params;
  const post = await getBlogPostBySlug(awaitedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(post.id, post.categorySlug);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead
        title={`${post.title} | MKN Group Blog`}
        description={post.metaDescription || post.excerpt}
        canonical={`https://www.mkngroup.com.tr/blog/${post.slug}`}
      />

      {/* Structured Data for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: `https://www.mkngroup.com.tr${post.image}`,
            author: {
              "@type": "Organization",
              name: post.author,
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
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://www.mkngroup.com.tr/blog/${post.slug}`,
            },
            articleSection: post.category,
            keywords: post.tags.join(", "),
            wordCount: post.content.split(" ").length,
            readingTime: `PT${typeof post.readingTime === 'string' ? post.readingTime.replace(" dk", "") : post.readingTime}M`,
            inLanguage: "tr-TR",
          }),
        }}
      />

      {/* Simple Navigation */}
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Blog&apos;a Dön
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Article Header */}
          <header className="mb-12">
            {/* Category & Meta */}
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-3 py-1 rounded-full font-medium">
                {post.category}
              </Badge>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{typeof post.readingTime === 'number' ? `${post.readingTime} dk` : post.readingTime}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {post.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between py-6 border-y border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {post.author}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    MKN Group Uzmanı
                  </p>
                </div>
              </div>

              <ShareButton
                title={post.title}
                description={post.excerpt}
                url={`https://www.mkngroup.com.tr/blog/${post.slug}`}
                image={post.image}
                variant="outline"
                size="sm"
                className="rounded-full"
              />
            </div>
          </header>

          {/* Article Image */}
          {post.image && (
            <div className="mb-12">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 lg:h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <div
              className="[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:dark:text-white [&>h2]:mt-12 [&>h2]:mb-6
                         [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-800 [&>h3]:dark:text-gray-200 [&>h3]:mt-8 [&>h3]:mb-4
                         [&>p]:text-gray-700 [&>p]:dark:text-gray-300 [&>p]:leading-relaxed [&>p]:mb-6 [&>p]:text-lg
                         [&>ul]:my-6 [&>ul]:pl-6 [&>li]:text-gray-700 [&>li]:dark:text-gray-300 [&>li]:mb-2 [&>li]:text-lg
                         [&>blockquote]:border-l-4 [&>blockquote]:border-orange-400 [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:my-8 [&>blockquote]:bg-orange-50 [&>blockquote]:dark:bg-orange-900/20 [&>blockquote]:rounded-r-lg
                         [&>strong]:font-semibold [&>strong]:text-gray-900 [&>strong]:dark:text-white
                         [&_a]:text-orange-600 [&_a]:dark:text-orange-400 [&_a]:font-medium [&_a]:no-underline hover:[&_a]:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full px-3 py-1"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                İlgili Yazılar
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Bu konuyla ilgili diğer yazılarımızı da okuyabilirsiniz
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Card
                  key={relatedPost.id}
                  className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="relative">
                    {relatedPost.image ? (
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center">
                        <span className="text-orange-600 text-2xl font-bold">
                          MKN
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>{relatedPost.category}</span>
                      <span>•</span>
                      <span>{relatedPost.readingTime}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {relatedPost.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                      {relatedPost.excerpt}
                    </p>

                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm group-hover:gap-2 transition-all"
                    >
                      Devamını Oku
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <div className="text-center py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
        >
          <ArrowLeft className="w-4 h-4" />
          Tüm Blog Yazıları
        </Link>
      </div>
    </div>
  );
}
