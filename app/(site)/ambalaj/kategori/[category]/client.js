"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Sliders,
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/product-card";
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
} from "@/components/ui/pagination";
import { createProductSlug, createCategorySlug } from "@/utils/slugify-tr";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  saveScrollPosition,
  restoreScrollPosition,
} from "@/utils/ambalaj-state";

const getCloudinaryUrl = (imageName, width = 400, height = 400) => {
  if (!imageName) return null;
  const nameWithoutExt = imageName.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_${width},h_${height},c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${nameWithoutExt}`;
};

const getProductImageSrc = (imageName) => {
  if (!imageName) {
    return "/placeholder-product.jpg";
  }
  return getCloudinaryUrl(imageName);
};

const handleImageError = (e, productName = "") => {
  if (!e.target.src.includes("placeholder-product.jpg")) {
    e.target.src = "/placeholder-product.jpg";
  }
};

export default function CategoryPageClient({
  categoryName,
  categorySlug,
  products: initialProducts,
}) {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Initialize with server-provided products filtered by category
  const [products] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState(""); // Başlangıçta boş, kategoriye özel arama yapmak için
  const [activeFilters, setActiveFilters] = useState({
    category: [categoryName], // Bu kategori seçili
    material: [],
    size: [],
    colors: [],
  });
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [activeCategory, setActiveCategory] = useState(categoryName);
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isScrolledToProducts, setIsScrolledToProducts] = useState(false);

  // Get filter options from current category products, but include all categories for navigation
  const allCategories = [
    "Disc Top Kapaklar",
    "Krem Pompalar",
    "Losyon Pompaları",
    "Sprey Pompalar",
    "Köpük Pompalar",
    "Parmak Losyon Pompaları",
    "Aseton Kapakları",
    "Airless Şişeler",
  ];

  const filterOptions = {
    categories: allCategories, // Tüm kategoriler navigasyon için
    materials: [
      ...new Set(
        products
          .map((p) => p.specifications?.material || p.material)
          .filter(Boolean)
      ),
    ],
    sizes: [
      ...new Set(
        products.map((p) => p.specifications?.size || p.size).filter(Boolean)
      ),
    ],
    colors: [...new Set(products.flatMap((p) => p.colors || []))],
  };

  useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [searchQuery, activeFilters, products]);

  // URL'den state'i yükle (sadece ilk yüklemede) - Kategori sayfasında basitleştirildi
  useEffect(() => {
    if (products.length > 0) {
      // Kategori sayfasında filtreleri varsayılan değerlerle başlat
      setSearchQuery("");
      setCurrentPage(1);
      setActiveFilters({
        category: [categoryName], // Kategori her zaman sabit
        material: [],
        size: [],
        colors: [],
      });
      restoreScrollPosition();
    }
  }, [products.length, categoryName]);

  useEffect(() => {
    setIsPageLoaded(true);
    const timer1 = setTimeout(() => setIsHeroVisible(true), 100);
    const timer2 = setTimeout(() => setIsContentVisible(true), 300);

    // Sayfa yüklendiğinde scroll davranışını belirle
    const timer3 = setTimeout(() => {
      const isFromProductPage =
        sessionStorage.getItem("fromProductPage") === "true";
      const shouldScrollToTop =
        sessionStorage.getItem("scrollToProducts") === "true";
      const hasHashKatalog = window.location.hash === "#katalog";
      const isFromAmbalajPages = document.referrer.includes("/ambalaj");

      if (isFromProductPage) {
        // Ürün sayfasından geri geliyorsa, scroll pozisyonunu restore et
        restoreScrollPosition();
        sessionStorage.removeItem("fromProductPage");
      } else if (shouldScrollToTop || hasHashKatalog) {
        // Kategori değişikliği veya direkt link ile geliyorsa katalog bölümüne scroll et
        scrollToProductList();
        sessionStorage.removeItem("scrollToProducts");
      } else if (isFromAmbalajPages && !isFromProductPage) {
        // Ambalaj sayfalarından geliyorsa ama ürün sayfası değilse kataloga scroll et
        scrollToProductList();
      }
      // Hiçbir koşul yoksa normal sayfa yükleme, scroll yapmıyoruz
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Intersection Observer for smooth scroll detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsScrolledToProducts(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "-50px 0px -50px 0px",
      }
    );

    const productSection = document.getElementById("katalog");
    if (productSection) {
      observer.observe(productSection);
    }

    return () => {
      if (productSection) {
        observer.unobserve(productSection);
      }
    };
  }, [isPageLoaded]);

  // URL'i güncelle (state değiştiğinde) - Kategori sayfasında basitleştirildi
  useEffect(() => {
    if (products.length > 0) {
      // Kategori sayfasında sadece base URL kullanıyoruz
      const baseUrl = `/ambalaj/kategori/${categorySlug}`;

      // Sadece sayfa değişikliğinde URL'i güncelle (opsiyonel)
      if (currentPage > 1) {
        router.replace(`${baseUrl}?page=${currentPage}`, { scroll: false });
      } else {
        router.replace(baseUrl, { scroll: false });
      }
    }
  }, [currentPage, products.length, categorySlug]);

  const scrollToProductList = (offset = -100, smooth = true) => {
    const productSection = document.getElementById("katalog");
    if (productSection) {
      const elementTop = productSection.offsetTop;
      const offsetPosition = elementTop + offset;

      if (smooth) {
        // Smooth scroll with easing
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });

        // Scroll işlemi tamamlandığında focus ekle
        setTimeout(() => {
          productSection.style.scrollMargin = "100px";
          // URL hash'i güncelle
          if (window.location.hash !== "#katalog") {
            history.replaceState(null, null, "#katalog");
          }
        }, 500);
      } else {
        // Instant scroll
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "instant",
        });
      }
    }
  };

  const applyFilters = () => {
    let filtered = products; // Already filtered by category from server

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.code &&
            product.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (product.colors &&
            product.colors.some((color) =>
              color.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }

    // Material filter
    if (activeFilters.material.length > 0) {
      filtered = filtered.filter(
        (product) =>
          (product.specifications?.material &&
            activeFilters.material.includes(product.specifications.material)) ||
          (product.material &&
            activeFilters.material.includes(product.material))
      );
    }

    // Size filter
    if (activeFilters.size.length > 0) {
      filtered = filtered.filter(
        (product) =>
          (product.specifications?.size &&
            activeFilters.size.includes(product.specifications.size)) ||
          (product.size && activeFilters.size.includes(product.size))
      );
    }

    // Color filter
    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.colors &&
          product.colors.some((color) => activeFilters.colors.includes(color))
      );
    }

    setFilteredProducts(filtered);

    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const toggleFilter = (type, value) => {
    setCurrentPage(1);
    const newFilters = {
      ...activeFilters,
      [type]: activeFilters[type].includes(value)
        ? activeFilters[type].filter((item) => item !== value)
        : [...activeFilters[type], value],
    };
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setActiveFilters({
      category: [categoryName],
      material: [],
      size: [],
      colors: [],
    });
    setSearchQuery("");
    setCurrentPage(1);
    router.push(`/ambalaj/kategori/${categorySlug}`, { scroll: false });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory) => {
    // Ürün sayfası işaretini temizle ve kategori değişikliği işaretle
    sessionStorage.removeItem("fromProductPage");
    sessionStorage.removeItem("navigatingToProduct");
    sessionStorage.setItem("scrollToProducts", "true");

    if (newCategory === "all") {
      // Ana sayfaya git ve arama bölümüne scroll et
      router.push("/ambalaj#katalog");
    } else if (newCategory !== categoryName) {
      // Başka kategoriye git
      const newCategorySlug = createCategorySlug(newCategory);
      router.push(`/ambalaj/kategori/${newCategorySlug}#katalog`);
    }
    // Aynı kategorideyse katalog bölümüne smooth scroll
    else {
      scrollToProductList();
    }
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleProductNavigation = (product) => {
    // Ürün sayfasına gidildiğini işaretle
    sessionStorage.setItem("fromProductPage", "false"); // Şimdilik false, ürün sayfası yüklendiğinde true yapılacak
    sessionStorage.setItem("navigatingToProduct", "true"); // Ürün sayfasına geçiş yapıldığını işaretle

    // Scroll pozisyonunu kaydet
    saveScrollPosition();

    const productUrl = `/ambalaj/${createProductSlug(product)}`;
    router.push(productUrl);
  };

  const renderFilters = () => {
    const materials = filterOptions.materials || [];
    const sizes = filterOptions.sizes || [];
    const colors = filterOptions.colors || [];

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
            {(activeFilters.material.length > 0 ||
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

          {/* Kategori Filtresi - Sadece mevcut kategori seçili */}
          <div>
            <h4 className="text-sm font-medium mb-3 dark:text-gray-300">
              Kategoriler
            </h4>
            <div className="space-y-2">
              {filterOptions.categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={category === categoryName}
                    onChange={() => {
                      if (category !== categoryName) {
                        const newCategorySlug = createCategorySlug(category);
                        router.push(`/ambalaj/kategori/${newCategorySlug}`);
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <Link
                    href={`/ambalaj/kategori/${createCategorySlug(category)}`}
                    className={`text-sm dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                      category === categoryName
                        ? "font-semibold text-blue-600 dark:text-blue-400"
                        : ""
                    }`}
                  >
                    {category}
                  </Link>
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
                    getProductImageSrc(selectedProduct.images?.[0]) ||
                    "/placeholder.jpg"
                  }
                  alt={selectedProduct.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, selectedProduct.name)}
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
                        src={getProductImageSrc(image) || "/placeholder.jpg"}
                        alt={`${selectedProduct.name} ${index + 2}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          handleImageError(e, selectedProduct.name)
                        }
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
                  {(selectedProduct.specifications?.size ||
                    selectedProduct.size) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Boyut:
                      </span>
                      <span className="dark:text-white">
                        {selectedProduct.specifications?.size ||
                          selectedProduct.size}
                      </span>
                    </div>
                  )}
                  {(selectedProduct.specifications?.material ||
                    selectedProduct.material) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Materyal:
                      </span>
                      <span className="dark:text-white">
                        {selectedProduct.specifications?.material ||
                          selectedProduct.material}
                      </span>
                    </div>
                  )}
                  {(selectedProduct.specifications?.debit ||
                    selectedProduct.debit) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Debi:
                      </span>
                      <span className="dark:text-white">
                        {selectedProduct.specifications?.debit ||
                          selectedProduct.debit}
                      </span>
                    </div>
                  )}
                  {(selectedProduct.specifications?.lockType ||
                    selectedProduct.lockType) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Kilit Tipi:
                      </span>
                      <span className="dark:text-white">
                        {selectedProduct.specifications?.lockType ||
                          selectedProduct.lockType}
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
                  onClick={() => handleProductNavigation(selectedProduct)}
                  className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Detayları Gör
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
      {/* Hero Section - Same as main ambalaj page but category specific */}
      <section
        className={`mb-8 sm:mb-12 ${
          isHeroVisible ? "slide-up visible" : "slide-up"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="rounded-lg sm:rounded-xl overflow-hidden relative min-h-[400px] md:min-h-[500px]">
            <Image
              src="/optimized/cosmetic-packaging-mockup.webp"
              alt={`Premium ${categoryName} - MKN Group Fason Üretim Tesisi, Profesyonel Kozmetik Ambalaj Çözümleri`}
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
                {categoryName} | MKN Group Premium Kalite Garantisi
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 text-blue-50 dark:text-gray-200">
                {categoryName} kategorisinde {products.length} farklı premium
                kalite ürün seçeneği. Markanızın değerini yansıtan yuksek
                standartlarda kozmetik ambalaj çözümleri. Detaylı ürün bilgileri
                için PDF kataloğumuzu indirin veya aşağıdaki ürünlerimizi
                inceleyin. Özel tasarım ambalajlar için bizimle iletişime geçin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-blue-900 hover:bg-blue-50 border-0 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Link
                    href="https://firebasestorage.googleapis.com/v0/b/mkngroup-general.firebasestorage.app/o/public%2Fmkn-ambalaj-katalog-tr.pdf?alt=media&token=1ad8671f-60df-496f-aa39-3e6217238a46"
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
              {/* Enhanced Search Section */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-blue-100 dark:border-gray-600 shadow-sm">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Ürün Arama
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Kozmetik ambalaj ürünleri arasında arama yapın
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Ürün adı, kategori veya kod ile arama yapın..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-12 pr-4 py-3 text-base bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white dark:placeholder-gray-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearchChange("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/ambalaj#katalog"
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                      onClick={() => {
                        // Kategori değişikliği yapılıyor
                        sessionStorage.removeItem("fromProductPage");
                        sessionStorage.removeItem("navigatingToProduct");
                        sessionStorage.setItem("scrollToProducts", "true");
                        saveScrollPosition();
                      }}
                    >
                      Tümü
                    </Link>
                    {filterOptions.categories.map((category) => {
                      const count =
                        category === categoryName ? products.length : 0;
                      const categorySlugForLink = createCategorySlug(category);
                      return (
                        <Link
                          key={category}
                          href={`/ambalaj/kategori/${categorySlugForLink}#katalog`}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            category === categoryName
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                          onClick={(e) => {
                            if (category !== categoryName) {
                              // Kategori değiştiriliyor
                              sessionStorage.removeItem("fromProductPage");
                              sessionStorage.removeItem("navigatingToProduct");
                              sessionStorage.setItem(
                                "scrollToProducts",
                                "true"
                              );
                              saveScrollPosition();
                            } else {
                              // Aynı kategoriye tıklandı, sayfa içi scroll
                              e.preventDefault();
                              scrollToProductList();
                            }
                          }}
                        >
                          {category} {category === categoryName && `(${count})`}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

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
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      isVisible={isContentVisible}
                      onNavigate={handleProductNavigation}
                    />
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
                          onClick={() => {
                            if (currentPage > 1) {
                              const newPage = currentPage - 1;
                              setCurrentPage(newPage);
                              scrollToProductList();
                            }
                          }}
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
                                onClick={() => {
                                  setCurrentPage(page);
                                  scrollToProductList();
                                }}
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
                          onClick={() => {
                            if (currentPage < totalPages) {
                              const newPage = currentPage + 1;
                              setCurrentPage(newPage);
                              scrollToProductList();
                            }
                          }}
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
                {categoryName} için Özel Fiyat Teklifi ve Fason Üretim
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 dark:text-gray-300">
                {categoryName} kategorisinde toplu alımlarınız için özel fiyat
                teklifleri ve markanıza özel tasarım seçenekleri için deneyimli
                ekibimizle iletişime geçin. ISO sertifikalı üretim
                tesislerimizde, ürün geliştirme aşamasından seri üretime kadar
                her adımda yanınızdayız.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="default" asChild className="text-sm sm:text-base">
                  <Link href="/iletisim">İletişime Geçin</Link>
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  asChild
                  className="text-sm sm:text-base"
                >
                  <Link href="/ambalaj">Tüm Ürünleri İncele</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden">
              <Image
                src="/optimized/modern-manufacturing-facility-with-advanced-equipm.webp"
                alt="Modern Kozmetik Ambalaj Üretim Tesisi - İleri Teknoloji Ekipmanları ile Fason Ambalaj Üretimi"
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

      {/* Animations Styles - Simplified since ProductCard handles most animations */}
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
      `}</style>
    </div>
  );
}
