"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, TrendingUp, Hash, Calendar, Clock } from "lucide-react";

export default function BlogFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  onSearchChange,
  searchTerm,
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term) => {
      onSearchChange(term);
      
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("search", term);
      } else {
        params.delete("search");
      }
      
      router.push(`?${params.toString()}`, { scroll: false });
    }, 300),
    [onSearchChange, router, searchParams]
  );

  // Handle search input change
  useEffect(() => {
    debouncedSearch(localSearchTerm);
  }, [localSearchTerm, debouncedSearch]);

  const handleCategoryChange = (categorySlug) => {
    onCategoryChange(categorySlug);
    
    const params = new URLSearchParams(searchParams);
    if (categorySlug !== "all") {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setLocalSearchTerm("");
    onSearchChange("");
    onCategoryChange("all");
    router.push("/blog", { scroll: false });
  };

  const hasActiveFilters = selectedCategory !== "all" || searchTerm;

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full justify-between border-gray-200 dark:border-gray-700"
        >
          <span className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtreler
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {(selectedCategory !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
              </Badge>
            )}
          </span>
          <div className={`transform transition-transform ${isFilterOpen ? "rotate-180" : ""}`}>
            ▼
          </div>
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-6 ${!isFilterOpen ? "hidden lg:block" : ""}`}>
        {/* Search Bar with Advanced Design */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Yazı başlığı, içerik veya etiket ara..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-12 pr-12 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          {localSearchTerm && (
            <button
              onClick={() => setLocalSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Category Filters with Enhanced Design */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Kategoriler</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange("all")}
              className={`
                rounded-full transition-all duration-200 border-2
                ${selectedCategory === "all"
                  ? "bg-orange-500 border-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                  : "border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-600 dark:hover:text-orange-400"
                }
              `}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Tümü
            </Button>
            
            {categories.map((category) => (
              <Button
                key={category.slug}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.slug)}
                className={`
                  rounded-full transition-all duration-200 border-2
                  ${selectedCategory === category.slug
                    ? "bg-orange-500 border-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                    : "border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-600 dark:hover:text-orange-400"
                  }
                `}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <span className="text-sm font-medium text-orange-900 dark:text-orange-300">
              Aktif Filtreler:
            </span>
            
            {selectedCategory !== "all" && (
              <Badge 
                variant="secondary" 
                className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700"
              >
                {categories.find(c => c.slug === selectedCategory)?.name}
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="ml-1 hover:text-orange-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {searchTerm && (
              <Badge 
                variant="secondary" 
                className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
              >
                "{searchTerm}"
                <button
                  onClick={() => {
                    setLocalSearchTerm("");
                    onSearchChange("");
                  }}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/30 h-6 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Temizle
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Güncellenme</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Haftalık</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Ortalama Okuma</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">5-8 dk</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}