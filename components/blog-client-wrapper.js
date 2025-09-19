"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlogFilter from "@/components/blog-filter";
import BlogCard from "@/components/blog-card";

export default function BlogClientWrapper({
  initialPosts,
  categories,
  initialCategory = "all",
  initialSearchTerm = "",
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Filter posts based on category and search term
  const filteredPosts = useMemo(() => {
    let filtered = initialPosts;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (post) => post.categorySlug === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return filtered;
  }, [initialPosts, selectedCategory, searchTerm]);

  const featuredPost = filteredPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <div className="bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Simple Filter Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-12">
          <BlogFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
          />
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {filteredPosts.length} yazı
            </span>
            {selectedCategory !== "all" && (
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                {categories.find((c) => c.slug === selectedCategory)?.name}
              </Badge>
            )}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                İçerik Bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Seçtiğiniz kriterlere uygun blog yazısı bulunmuyor.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                Tüm İçerikleri Göster
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
