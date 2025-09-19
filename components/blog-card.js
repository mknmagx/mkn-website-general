import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, User, ArrowRight, TrendingUp, Eye } from "lucide-react";

export default function BlogCard({ post, featured = false }) {
  if (featured) {
    return (
      <Card className="group relative overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="grid lg:grid-cols-2 gap-0 h-full">
          {/* Image Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 lg:h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-64 lg:h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
                <TrendingUp className="w-16 h-16 text-orange-400" />
              </div>
            )}
            
            {/* Featured Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                <TrendingUp className="w-3 h-3 mr-1" />
                Öne Çıkan
              </Badge>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <Badge 
                variant="secondary" 
                className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full shadow-lg border"
              >
                {post.category}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Meta Information */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>250+ okuma</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-orange-600 transition-colors duration-300">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/30"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Author and CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {post.author}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Endüstri Uzmanı
                  </p>
                </div>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
              >
                Devamını Oku
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Regular card design
  return (
    <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 rounded-xl">
      <div className="relative">
        {/* Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 h-48">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
              <TrendingUp className="w-12 h-12 text-orange-400" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant="secondary" 
              className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 text-xs rounded-full shadow-sm"
            >
              {post.category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readingTime}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 text-lg leading-tight">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/30"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {post.author}
              </span>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-300 group-hover:gap-2"
            >
              Oku
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}