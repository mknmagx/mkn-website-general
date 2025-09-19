"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Sliders,
  Tag,
  Package,
  Droplets,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { products, product_catalog } from "@/data/products-catalog";
import { slugifyTr } from "@/utils/slugify-tr";
import { useIsMobile } from "@/hooks/use-mobile";

const getCloudinaryUrl = (imageName) => {
  if (!imageName) return null;
  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_400,h_400,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${imageName}`;
};

export default function AmbalajClient() {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    material: [],
    size: [],
    colors: [],
  });
  const [productList, setProductList] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const allCategories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];
  const allMaterials = [
    ...new Set(products.map((product) => product.material).filter(Boolean)),
  ];
  const allSizes = [
    ...new Set(products.map((product) => product.size).filter(Boolean)),
  ];
  const allColors = [
    ...new Set(
      products.flatMap((product) => product.colors || []).filter(Boolean)
    ),
  ];

  useEffect(() => {
    filterProducts();
  }, [searchQuery, activeFilters, activeCategory]);

  useEffect(() => {
    setIsPageLoaded(true);
    const timer1 = setTimeout(() => setIsHeroVisible(true), 100);
    const timer2 = setTimeout(() => setIsContentVisible(true), 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const filterProducts = () => {
    let filtered = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.code?.toLowerCase().includes(query) ||
          product.material?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    // Category tab filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === activeCategory
      );
    }

    // Apply side filters only when "all" category is selected
    if (activeCategory === "all") {
      // Category filter (side panel)
      if (activeFilters.category.length > 0) {
        filtered = filtered.filter((product) =>
          activeFilters.category.includes(product.category)
        );
      }
    }

    // Material filter
    if (activeFilters.material.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.material && activeFilters.material.includes(product.material)
      );
    }

    // Size filter
    if (activeFilters.size.length > 0) {
      filtered = filtered.filter(
        (product) => product.size && activeFilters.size.includes(product.size)
      );
    }

    // Color filter
    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.colors &&
          product.colors.length > 0 &&
          product.colors.some((color) => activeFilters.colors.includes(color))
      );
    }

    setProductList(filtered);
    setCurrentPage(1);
  };

  const totalProducts = productList.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = productList.slice(startIndex, endIndex);

  const toggleFilter = (type, value) => {
    setCurrentPage(1);
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      category: [],
      material: [],
      size: [],
      colors: [],
    });
    setSearchQuery("");
    setActiveCategory("all");
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const renderFilters = () => {
    const categories = [...new Set(products.map((p) => p.category))];
    const materials = [
      ...new Set(products.map((p) => p.material).filter(Boolean)),
    ];
    const sizes = [...new Set(products.map((p) => p.size).filter(Boolean))];
    const colors = [...new Set(products.flatMap((p) => p.colors || []))];

    return (
      <div
        className={`
        lg:block 
        transition-all duration-300 ease-in-out 
        ${isFilterOpen ? "block" : "hidden lg:block"} 
        bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700
      `}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Filtreler</h3>
            {(activeFilters.category.length > 0 ||
              activeFilters.material.length > 0 ||
              activeFilters.size.length > 0 ||
              activeFilters.colors.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <X className="w-4 h-4 mr-1" />
                Temizle
              </Button>
            )}
          </div>

          {/* Kategori Filtresi */}
          <div>
            <h4 className="text-sm font-medium mb-3 dark:text-gray-300">
              Kategori
            </h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.category.includes(category)}
                    onChange={() => toggleFilter("category", category)}
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm dark:text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Materyal Filtresi */}
          {materials.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 dark:text-gray-300">
                Materyal
              </h4>
              <div className="space-y-2">
                {materials.map((material) => (
                  <label
                    key={material}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.material.includes(material)}
                      onChange={() => toggleFilter("material", material)}
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm dark:text-gray-300">
                      {material}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Boyut Filtresi */}
          {sizes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 dark:text-gray-300">
                Boyut
              </h4>
              <div className="space-y-2">
                {sizes.map((size) => (
                  <label
                    key={size}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.size.includes(size)}
                      onChange={() => toggleFilter("size", size)}
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm dark:text-gray-300">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Renk Filtresi */}
          {colors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 dark:text-gray-300">
                Renkler
              </h4>
              <div className="space-y-2">
                {colors.map((color) => (
                  <label
                    key={color}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.colors.includes(color)}
                      onChange={() => toggleFilter("colors", color)}
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm dark:text-gray-300">{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuickViewModal = () => {
    if (!selectedProduct) return null;

    return (
      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="max-w-4xl dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {selectedProduct.name}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {selectedProduct.category} - {selectedProduct.code}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden border dark:border-gray-700">
                <Image
                  src={
                    getCloudinaryUrl(selectedProduct.images?.[0]) ||
                    "/placeholder.jpg"
                  }
                  alt={selectedProduct.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {selectedProduct.images.slice(1, 4).map((image, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-20 h-20 rounded border dark:border-gray-700 overflow-hidden"
                    >
                      <Image
                        src={getCloudinaryUrl(image) || "/placeholder.jpg"}
                        alt={`${selectedProduct.name} ${index + 2}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">
                  Ürün Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Kod:
                    </span>
                    <span className="dark:text-white">
                      {selectedProduct.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Kategori:
                    </span>
                    <span className="dark:text-white">
                      {selectedProduct.category}
                    </span>
                  </div>
                  {selectedProduct.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Boyut:
                      </span>
                      <span className="dark:text-white">
                        {selectedProduct.size}
                      </span>
                    </div>
                  )}
                  {selectedProduct.material && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Materyal:
                      </span>
                      <span className="dark:text-white">
                        {selectedProduct.material}
                      </span>
                    </div>
                  )}
                  {selectedProduct.debit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Debi:
                      </span>
                      <span className="dark:text-white">
                        {selectedProduct.debit}
                      </span>
                    </div>
                  )}
                  {selectedProduct.lockType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Kilit Tipi:
                      </span>
                      <span className="dark:text-white">
                        {selectedProduct.lockType}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 dark:text-white">
                    Mevcut Renkler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.description && (
                <div>
                  <h3 className="font-semibold mb-2 dark:text-white">
                    Açıklama
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  asChild
                  className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Link href={`/ambalaj/${slugifyTr(selectedProduct.name)}`}>
                    Detayları Gör
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section
        className={`mb-8 sm:mb-12 ${
          isHeroVisible ? "slide-up visible" : "slide-up"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="rounded-lg sm:rounded-xl overflow-hidden relative min-h-[400px] md:min-h-[500px]">
            <Image
              src="/cosmetic-packaging-mockup.png"
              alt="Kozmetik Ambalaj Üretim Tesisi"
              width={1600}
              height={500}
              className="absolute inset-0 w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/70 to-transparent dark:from-gray-900/90 dark:via-gray-900/70"></div>
            <div
              className={`relative z-20 p-4 sm:p-6 md:p-8 lg:p-12 max-w-2xl text-white h-full flex flex-col justify-center ${
                isHeroVisible ? "hero-animation visible" : "hero-animation"
              }`}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                Kozmetik Ambalaj Çözümleri
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 text-blue-50 dark:text-gray-200">
                Markanızın değerini yansıtan premium ambalaj ürünleri. Detaylı
                ürün bilgileri için PDF kataloğumuzu indirin veya aşağıdaki
                ürünlerimizi inceleyin. Özel tasarım ambalajlar için bizimle
                iletişime geçin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-blue-900 hover:bg-blue-50 border-0 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Link
                    href="/mkn-ambalaj-katalog-tr.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ambalaj Kataloğu İndir
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-white text-blue-900 hover:bg-white hover:text-blue-900 transition-colors dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <Link href="#katalog">Ürünleri İncele</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section
        className={`py-6 border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm transition-all duration-1000 delay-300 ${
          isContentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="container mx-auto px-4">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full justify-start overflow-x-auto dark:bg-gray-700">
              <TabsTrigger
                value="all"
                className="dark:data-[state=active]:bg-gray-600 dark:text-gray-300"
              >
                Tüm Ürünler ({products.length})
              </TabsTrigger>
              {allCategories.map((category) => {
                const count = products.filter(
                  (product) => product.category === category
                ).length;
                return (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="dark:data-[state=active]:bg-gray-600 dark:text-gray-300"
                  >
                    {category} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Products Grid */}
      {/* Products Section */}
      <section
        id="katalog"
        className={`mb-8 sm:mb-12 ${
          isContentVisible ? "fade-in visible" : "fade-in"
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Mobil filtre butonu */}
          <div className="block lg:hidden mb-4">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="w-full flex items-center justify-between dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span className="flex items-center">
                <Sliders className="mr-2 h-4 w-4" />
                Filtreleri {isFilterOpen ? "Gizle" : "Göster"}
              </span>
              {isFilterOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filtreler - Sol taraf */}
            <div
              className={`lg:w-1/4 w-full ${
                isFilterOpen ? "block" : "hidden lg:block"
              }`}
            >
              {renderFilters()}
            </div>

            {/* Ürün listesi - Sağ taraf */}
            <div className="lg:w-3/4 w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {currentProducts.length > 0
                    ? `${totalProducts} ürünün ${startIndex + 1}-${Math.min(
                        endIndex,
                        totalProducts
                      )} arası gösteriliyor`
                    : `${totalProducts} ürün gösteriliyor`}
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Sayfa {currentPage} / {Math.max(1, totalPages)}
                </p>
              </div>

              {/* Products Grid */}
              {currentProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {currentProducts.map((product, index) => (
                    <Card
                      key={product.id}
                      className={`overflow-hidden hover:shadow-md transition-all duration-300 border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col ${
                        isContentVisible
                          ? "scale-in visible stagger-animation"
                          : "scale-in"
                      }`}
                      style={{
                        "--delay": `${index * 100}ms`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="relative">
                        <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
                          {product.images && product.images[0] ? (
                            <Image
                              src={getCloudinaryUrl(product.images[0])}
                              alt={product.name}
                              width={400}
                              height={400}
                              className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                              <Package className="h-12 w-12 md:h-16 md:w-16 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          {product.inStock ? (
                            <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 text-xs">
                              Stokta
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 text-xs"
                            >
                              Stok Yok
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="flex-grow flex flex-col p-3 md:p-4">
                        <div className="mb-3">
                          <Badge
                            variant="outline"
                            className="mb-2 text-xs dark:border-gray-600 dark:text-gray-300"
                          >
                            {product.category}
                          </Badge>
                          <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2 leading-tight dark:text-gray-100">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2 dark:text-gray-400">
                            Kod: {product.code}
                          </p>
                        </div>
                        <div className="mt-auto space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {product.colors &&
                              product.colors.slice(0, 2).map((color, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 text-xs px-2 py-0.5"
                                >
                                  {color}
                                </Badge>
                              ))}
                            {product.colors && product.colors.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0.5 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                              >
                                +{product.colors.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50 text-xs"
                            >
                              {product.size}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickView(product)}
                              className="text-xs h-7 px-2 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                            >
                              Hızlı Bakış
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 md:p-4 pt-0">
                        <Link
                          href={`/ambalaj/${slugifyTr(product.name)}`}
                          className="w-full"
                        >
                          <Button
                            className="w-full text-xs h-8 dark:bg-blue-600 dark:hover:bg-blue-700"
                            variant="default"
                          >
                            Detaylı İncele
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ürün bulunamadı
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Arama kriterlerinizi değiştirerek tekrar deneyin.
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Filtreleri Temizle
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 px-4">
                  <Pagination className="w-full max-w-full">
                    <PaginationContent className="dark:text-gray-300 flex-wrap gap-1 sm:gap-2">
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                          className={`text-xs sm:text-sm ${
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer dark:hover:bg-gray-700 dark:border-gray-700 dark:text-gray-300"
                          }`}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Önceki</span>
                          <span className="sm:hidden">‹</span>
                        </Button>
                      </PaginationItem>

                      {(() => {
                        const pages = [];
                        const maxVisiblePages = isMobile ? 3 : 5;

                        if (totalPages <= maxVisiblePages) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          if (currentPage <= 2) {
                            pages.push(1, 2, 3, "...", totalPages);
                          } else if (currentPage >= totalPages - 1) {
                            pages.push(
                              1,
                              "...",
                              totalPages - 2,
                              totalPages - 1,
                              totalPages
                            );
                          } else {
                            pages.push(
                              1,
                              "...",
                              currentPage - 1,
                              currentPage,
                              currentPage + 1,
                              "...",
                              totalPages
                            );
                          }
                        }

                        return pages.map((page, index) => (
                          <PaginationItem key={index}>
                            {page === "..." ? (
                              <PaginationEllipsis className="dark:hover:bg-gray-700 dark:border-gray-700 w-6 h-6 sm:w-8 sm:h-8" />
                            ) : (
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className={`cursor-pointer text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8 p-0 flex items-center justify-center ${
                                  currentPage === page
                                    ? "dark:bg-gray-700 dark:text-white"
                                    : "dark:hover:bg-gray-700 dark:border-gray-700"
                                }`}
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ));
                      })()}

                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            currentPage < totalPages &&
                            setCurrentPage(currentPage + 1)
                          }
                          className={`text-xs sm:text-sm ${
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer dark:hover:bg-gray-700 dark:border-gray-700 dark:text-gray-300"
                          }`}
                          disabled={currentPage === totalPages}
                        >
                          <span className="hidden sm:inline">Sonraki</span>
                          <span className="sm:hidden">›</span>
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`mb-8 sm:mb-12 bg-blue-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 lg:p-12 ${
          isContentVisible ? "fade-in visible" : "fade-in"
        }`}
        style={{ animationDelay: "1100ms" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 dark:text-gray-100">
                Özel Ambalaj Çözümleri
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 dark:text-gray-300">
                Markanızı öne çıkaracak özel ambalaj çözümleri için ekibimizle
                iletişime geçin. Ürün geliştirme aşamasından üretime kadar
                yanınızdayız.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="default" asChild className="text-sm sm:text-base">
                  <Link href="/iletisim">İletişime Geçin</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden">
              <Image
                src="/modern-manufacturing-facility-with-advanced-equipm.png"
                alt="Kozmetik Ambalaj Üretim"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 dark:from-gray-900/80 to-transparent flex flex-col justify-end p-4 sm:p-6">
                <Badge className="self-start mb-2 bg-blue-600 dark:bg-blue-700 text-xs sm:text-sm">
                  Premium Kalite
                </Badge>
                <h3 className="text-white text-lg sm:text-xl font-bold">
                  Güvenilir Üretim
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Modern tesislerimizde yüksek standartlarda üretim
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick view modal */}
      {renderQuickViewModal()}

      {/* Animations Styles */}
      <style jsx>{`
        .hero-animation {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }

        .hero-animation.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .slide-up {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease-out;
        }

        .slide-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-in {
          opacity: 0;
          transition: opacity 0.6s ease-out;
        }

        .fade-in.visible {
          opacity: 1;
        }

        .scale-in {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.5s ease-out;
        }

        .scale-in.visible {
          opacity: 1;
          transform: scale(1);
        }

        .stagger-animation {
          animation-delay: var(--delay, 0ms);
        }
      `}</style>
    </div>
  );
}
