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
import { ServiceSchema, BreadcrumbSchema } from "@/components/structured-data";
import { products, product_catalog } from "@/data/products-catalog";
import { slugifyTr } from "@/utils/slugify-tr";
import AmbalajClient from "./client";

export const metadata = {
  title: "Kozmetik Ambalaj Ürünleri | MKN Group - Premium Kalite Ambalajlar",
  description: "MKN Group'un geniş kozmetik ambalaj koleksiyonu. Parfüm şişeleri, krem kavanozları, pompalı şişeler ve daha fazlası. Yüksek kalite, uygun fiyat.",
  keywords: "kozmetik ambalaj, parfüm şişesi, krem kavanozu, pompalı şişe, serum şişesi, ambalaj ürünleri, MKN Group",
  openGraph: {
    title: "Kozmetik Ambalaj Ürünleri | MKN Group",
    description: "Premium kalitede kozmetik ambalaj ürünleri. Geniş ürün yelpazesi, hızlı teslimat ve uygun fiyatlarla.",
    type: "website",
    url: "https://mkngroup.com.tr/ambalaj",
    images: [
      {
        url: "https://mkngroup.com.tr/og-image.png",
        width: 1200,
        height: 630,
        alt: "MKN Group Kozmetik Ambalaj Ürünleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozmetik Ambalaj Ürünleri | MKN Group",
    description: "Premium kalitede kozmetik ambalaj ürünleri. Geniş ürün yelpazesi, hızlı teslimat ve uygun fiyatlarla.",
    images: ["https://mkngroup.com.tr/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mkngroup.com.tr/ambalaj",
  },
};

export default function AmbalajPage() {
  return <AmbalajClient />;
}
  ];

  useEffect(() => {
    filterProducts();
  }, [searchQuery, activeFilters, activeCategory]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    const timer2 = setTimeout(() => {
      setIsHeroVisible(true);
    }, 300);

    const timer3 = setTimeout(() => {
      setIsContentVisible(true);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const filterProducts = () => {
    let filtered = [...products];

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.code?.toLowerCase().includes(query)
      );
    }

    // Ana kategori filtresi (tabs)
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === activeCategory
      );
    }

    // Eğer kategori tab'ı "all" değilse, yan filtreler çalışmasın
    // Sadece "all" seçiliyken yan filtreleri uygula
    if (activeCategory === "all") {
      // Kategori filtresi (yan panel)
      if (activeFilters.category.length > 0) {
        filtered = filtered.filter((product) =>
          activeFilters.category.includes(product.category)
        );
      }
    }

    // Materyal filtresi
    if (activeFilters.material.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.material && activeFilters.material.includes(product.material)
      );
    }

    // Boyut filtresi
    if (activeFilters.size.length > 0) {
      filtered = filtered.filter(
        (product) => product.size && activeFilters.size.includes(product.size)
      );
    }

    // Renk filtresi
    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.colors &&
          product.colors.length > 0 &&
          product.colors.some((color) => activeFilters.colors.includes(color))
      );
    }

    setProductList(filtered);
    setCurrentPage(1); // Filtre değiştiğinde sayfa 1'e dön
  };

  const totalProducts = productList.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = productList.slice(startIndex, endIndex);

  const toggleFilter = (type, value) => {
    setCurrentPage(1); // Filtre değiştiğinde sayfa 1'e dön
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[type].includes(value)) {
        newFilters[type] = newFilters[type].filter((item) => item !== value);
      } else {
        newFilters[type] = [...newFilters[type], value];
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      category: [],
      material: [],
      size: [],
      colors: [],
    });
    setSearchQuery("");
    setActiveCategory("all");
    setCurrentPage(1); // Filtreleri temizlerken sayfa 1'e dön
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const getCloudinaryUrl = (imageName) => {
    if (!imageName) return null;
    return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_600,h_600,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${imageName}`;
  };

  const renderCategoryTabs = () => {
    return (
      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold dark:text-gray-100">
            Ürün Kategorileri
          </h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              className="p-2 h-9 w-9 dark:text-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="sr-only">Grid görünüm</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="p-2 h-9 w-9"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span className="sr-only">Liste görünüm</span>
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="all"
          value={activeCategory}
          onValueChange={(value) => {
            setActiveCategory(value);
            setCurrentPage(1); // Kategori değiştiğinde sayfa 1'e dön
          }}
          className="w-full"
        >
          <div className="relative mb-4">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-max">
                <TabsTrigger value="all" className="px-3 py-2 text-sm">
                  Tüm Ürünler
                </TabsTrigger>
                {product_catalog.slice(0, 6).map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.name}
                    className="px-3 py-2 whitespace-nowrap text-sm"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
                {product_catalog.length > 6 && (
                  <TabsTrigger
                    value="daha-fazla"
                    className="px-3 py-2 text-sm text-blue-600"
                    disabled
                  >
                    +{product_catalog.length - 6} daha fazla
                  </TabsTrigger>
                )}
              </TabsList>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div
        className={`${
          isFilterOpen ? "block" : "hidden"
        } lg:block w-full bg-white dark:bg-gray-800 dark:border-gray-700 p-4 rounded-lg border shadow-sm lg:sticky lg:top-4 lg:h-fit`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2 dark:text-gray-100">
            <Filter className="h-4 w-4" />
            Filtreler
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Temizle
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsFilterOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {/* Arama kutusu */}
          <div className="space-y-2">
            <label
              htmlFor="search-products"
              className="text-sm font-medium dark:text-gray-300"
            >
              Ürün Ara
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
              <Input
                id="search-products"
                type="search"
                placeholder="Ürün adı, kodu veya özelliği..."
                className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Arama değiştiğinde sayfa 1'e dön
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <Separator />
          {/* Materyal filtresi */}
          <Accordion type="single" collapsible defaultValue="material">
            <AccordionItem value="material" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-medium">
                Materyal
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {allMaterials.map((material) => (
                    <div key={material} className="flex items-center space-x-2">
                      <Checkbox
                        id={`material-${material}`}
                        checked={activeFilters.material.includes(material)}
                        onCheckedChange={() =>
                          toggleFilter("material", material)
                        }
                      />
                      <label
                        htmlFor={`material-${material}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator className="dark:bg-gray-700" />
          {/* Boyut filtresi */}
          <Accordion type="single" collapsible defaultValue="size">
            <AccordionItem value="size" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-medium dark:text-gray-200">
                Boyut
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {allSizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={activeFilters.size.includes(size)}
                        onCheckedChange={() => toggleFilter("size", size)}
                      />
                      <label
                        htmlFor={`size-${size}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator />
          {/* Renk filtresi */}
          <Accordion type="single" collapsible defaultValue="colors">
            <AccordionItem value="colors" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-medium">
                Renk Seçenekleri
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {allColors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={`color-${color}`}
                        checked={activeFilters.colors.includes(color)}
                        onCheckedChange={() => toggleFilter("colors", color)}
                      />
                      <label
                        htmlFor={`color-${color}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {color}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator />
          {/* Kategori filtresi - sadece "Tüm Ürünler" sekmesi aktifken göster */}
          {activeCategory === "all" && (
            <>
              <Accordion type="single" collapsible defaultValue="category">
                <AccordionItem value="category" className="border-none">
                  <AccordionTrigger className="py-2 text-sm font-medium">
                    Kategori
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {allCategories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${category}`}
                            checked={activeFilters.category.includes(category)}
                            onCheckedChange={() =>
                              toggleFilter("category", category)
                            }
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Separator />
            </>
          )}
        </div>
      </div>
    );
  };

  const renderProductGrid = () => {
    const productsToShow =
      currentProducts.length > 0
        ? currentProducts
        : products.slice(0, PRODUCTS_PER_PAGE);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {productsToShow.map((product, index) => (
          <Card
            key={product.id}
            className={`overflow-hidden h-full flex flex-col group border hover:shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
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
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Package className="h-12 w-12 md:h-16 md:w-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1">
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
                <Button className="w-full text-xs h-8" variant="default">
                  Detaylı İncele
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderProductList = () => {
    const productsToShow =
      currentProducts.length > 0
        ? currentProducts
        : products.slice(0, PRODUCTS_PER_PAGE);
    return (
      <div className="space-y-4">
        {productsToShow.map((product, index) => (
          <Card
            key={product.id}
            className={`overflow-hidden hover:shadow-md transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
              isContentVisible
                ? "slide-up visible stagger-animation"
                : "slide-up"
            }`}
            style={{
              "--delay": `${index * 100}ms`,
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/4 aspect-square md:aspect-auto relative">
                {product.images && product.images[0] ? (
                  <Image
                    src={getCloudinaryUrl(product.images[0])}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <Package className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                {product.inStock ? (
                  <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800">
                    Stokta
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="absolute top-2 right-2 bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                  >
                    Stok Yok
                  </Badge>
                )}
              </div>
              <div className="p-3 md:p-4 w-full md:w-3/4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="w-full md:w-3/4">
                    <Badge
                      variant="outline"
                      className="mb-2 text-xs dark:border-gray-600 dark:text-gray-300"
                    >
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-base md:text-lg mb-1 dark:text-gray-100">
                      {product.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4 dark:text-gray-400">
                      Kod: {product.code}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground dark:text-gray-400">
                          Boyut:
                        </span>
                        <p className="text-xs md:text-sm font-medium dark:text-gray-300">
                          {product.size}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground dark:text-gray-400">
                          Materyal:
                        </span>
                        <p className="text-xs md:text-sm font-medium dark:text-gray-300">
                          {product.material}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground dark:text-gray-400">
                          Kilit Tipi:
                        </span>
                        <p className="text-xs md:text-sm font-medium dark:text-gray-300">
                          {product.lockType || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground dark:text-gray-400">
                          Debi:
                        </span>
                        <p className="text-xs md:text-sm font-medium dark:text-gray-300">
                          {product.debit}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 md:mb-0">
                      <span className="text-xs text-muted-foreground block mb-1 dark:text-gray-400">
                        Renkler:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.map((color, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 text-xs"
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 justify-between md:justify-start md:min-w-[120px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickView(product)}
                      className="text-xs md:text-sm flex-1 md:flex-auto dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      Hızlı Bakış
                    </Button>
                    <Link
                      href={`/ambalaj/${slugifyTr(product.name)}`}
                      className="flex-1 md:flex-auto"
                    >
                      <Button className="w-full" variant="default" size="sm">
                        Detaylı İncele
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(
            1,
            "...",
            totalPages - 3,
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

      return pages;
    };

    return (
      <div className="flex justify-center mt-8">
        <Pagination>
          <PaginationContent className="dark:text-gray-300">
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer dark:hover:bg-gray-700 dark:border-gray-700"
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <PaginationEllipsis className="dark:hover:bg-gray-700 dark:border-gray-700" />
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className={`cursor-pointer ${
                      currentPage === page
                        ? "dark:bg-gray-700 dark:text-white"
                        : "dark:hover:bg-gray-700 dark:border-gray-700"
                    }`}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer dark:hover:bg-gray-700 dark:border-gray-700"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };
  const renderQuickViewModal = () => {
    if (!selectedProduct) return null;
    return (
      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {selectedProduct.name}
            </DialogTitle>
            <DialogDescription>
              Ürün Kodu: {selectedProduct.code}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-3 sm:mt-4">
            <div className="space-y-3 sm:space-y-4">
              {selectedProduct.images && selectedProduct.images[0] ? (
                <div className="aspect-square overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={getCloudinaryUrl(selectedProduct.images[0])}
                    alt={selectedProduct.name}
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">
                  <Package className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700"
                    >
                      <Image
                        src={getCloudinaryUrl(image)}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        width={150}
                        height={150}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <Badge
                  variant="outline"
                  className="mb-2 text-xs sm:text-sm dark:border-gray-600"
                >
                  {selectedProduct.category}
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 dark:text-gray-100">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {selectedProduct.description}
                </p>
              </div>
              <Separator className="dark:bg-gray-700" />
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 dark:text-gray-400">
                      Boyut
                    </h4>
                    <p className="text-sm sm:text-base dark:text-gray-300">
                      {selectedProduct.size}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 dark:text-gray-400">
                      Materyal
                    </h4>
                    <p className="text-sm sm:text-base dark:text-gray-300">
                      {selectedProduct.material}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 dark:text-gray-400">
                      Debi
                    </h4>
                    <p className="text-sm sm:text-base dark:text-gray-300">
                      {selectedProduct.debit}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 dark:text-gray-400">
                      Kilit Tipi
                    </h4>
                    <p className="text-sm sm:text-base dark:text-gray-300">
                      {selectedProduct.lockType || "-"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 dark:text-gray-400">
                    Renk Seçenekleri
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedProduct.colors.map((color, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 text-xs"
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-2 sm:pt-4">
                  <p className="flex items-center mb-2">
                    {selectedProduct.inStock ? (
                      <>
                        <span className="h-3 w-3 rounded-full bg-green-500 inline-block mr-2"></span>
                        <span className="font-medium text-sm sm:text-base dark:text-gray-300">
                          Stokta mevcut
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="h-3 w-3 rounded-full bg-red-500 inline-block mr-2"></span>
                        <span className="font-medium text-sm sm:text-base">
                          Stokta mevcut değil
                        </span>
                      </>
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <Link
                      href={`/ambalaj/${slugifyTr(selectedProduct.name)}`}
                      className="flex-1"
                    >
                      <Button
                        className="w-full text-xs sm:text-sm"
                        variant="default"
                      >
                        Detaylı İncele
                        <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Link>
                    <Link href="/iletisim" className="flex-1">
                      <Button
                        className="w-full text-xs sm:text-sm"
                        variant="outline"
                      >
                        <ShoppingBag className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Fiyat Teklifi Al
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }

        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .slide-up {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.6s ease-out;
        }

        .slide-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .scale-in {
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.5s ease-out;
        }

        .scale-in.visible {
          opacity: 1;
          transform: scale(1);
        }

        .hero-animation {
          opacity: 0;
          transform: translateX(-100px);
          transition: all 1s ease-out;
        }

        .hero-animation.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .stagger-animation {
          animation-delay: var(--delay, 0ms);
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className={`container mx-auto py-4 sm:py-6 md:py-8 px-4 ${
          isPageLoaded ? "fade-in visible" : "fade-in"
        }`}
      >
        <SEOHead
          title="Kozmetik Ambalaj Çözümleri | MKNGROUP"
          description="Kozmetik ambalaj ürünleri: disc top kapaklar, pompa sistemleri, airless şişeler. İstanbul'dan tüm Türkiye'ye kaliteli ambalaj tedariki."
          canonical="https://mkngroup.com.tr/ambalaj"
        />
        <ServiceSchema
          service={{
            name: "Kozmetik Ambalaj Çözümleri",
            description:
              "Şişe, kavanoz, tüp, pompa, damlalık, airless ve daha fazlası – stok ve siparişe özel seçenekler.",
            type: "Manufacturing",
            category: "Cosmetic Packaging",
          }}
        />
        <BreadcrumbSchema
          items={[
            { name: "Ana Sayfa", url: "https://mkngroup.com.tr" },
            {
              name: "Kozmetik Ambalaj",
              url: "https://mkngroup.com.tr/ambalaj",
            },
          ]}
        />
        <section
          className={`mb-8 sm:mb-12 ${
            isHeroVisible ? "slide-up visible" : "slide-up"
          }`}
        >
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
                ürünlerimizi inceleyin. Özel tasarım ambalajlar için bizimle iletişime geçin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-blue-900 hover:bg-blue-50 border-0 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Link href="/mkn-ambalaj-katalog-tr.pdf" target="_blank" rel="noopener noreferrer">
                    Ambalaj Kataloğu İndir
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-900 transition-colors dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <Link href="#katalog">Ürünleri İncele</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Katalog bölümü */}
        <section
          id="katalog"
          className={`mb-8 sm:mb-12 ${
            isContentVisible ? "fade-in visible" : "fade-in"
          }`}
        >
          {/* Mobil filtre butonu */}
          <div
            className={`block lg:hidden mb-4 ${
              isContentVisible ? "slide-up visible" : "slide-up"
            }`}
            style={{ animationDelay: "200ms" }}
          >
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="w-full flex items-center justify-between"
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
            <div className="lg:w-1/4 w-full">{renderFilters()}</div>

            {/* Ürün listesi - Sağ taraf */}
            <div className="lg:w-3/4 w-full">
              {renderCategoryTabs()}
              {productList.length === 0 && searchQuery ? (
                <div className="text-center py-8 sm:py-12">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground dark:text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2 dark:text-gray-200">
                    Sonuç Bulunamadı
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-400 mb-4">
                    "{searchQuery}" için arama sonucu bulunamadı.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Filtreleri Temizle
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {productList.length > 0
                        ? `${productList.length} ürünün ${
                            startIndex + 1
                          }-${Math.min(
                            endIndex,
                            productList.length
                          )} arası gösteriliyor`
                        : `${products.length} ürün gösteriliyor`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sayfa {currentPage} / {Math.max(1, totalPages)}
                    </p>
                  </div>
                  {viewMode === "grid"
                    ? renderProductGrid()
                    : renderProductList()}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </section>
        {/* Avantajlar bölümü */}
        <section
          className={`mb-8 sm:mb-12 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 ${
            isContentVisible ? "fade-in visible" : "fade-in"
          }`}
          style={{ animationDelay: "400ms" }}
        >
          <h2
            className={`text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 dark:text-gray-100 ${
              isContentVisible ? "slide-up visible" : "slide-up"
            }`}
            style={{ animationDelay: "500ms" }}
          >
            Neden Bizi Seçmelisiniz?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div
              className={`text-center ${
                isContentVisible
                  ? "scale-in visible stagger-animation"
                  : "scale-in"
              }`}
              style={{ animationDelay: "600ms" }}
            >
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 dark:text-gray-100">
                Geniş Ürün Yelpazesi
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground dark:text-gray-400">
                Kozmetik ve kişisel bakım için kapsamlı ambalaj çözümleri
              </p>
            </div>
            <div className="text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400"
                >
                  <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                  <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2 2 0 0 1 .09-3.67Z"></path>
                  <line x1="12" y1="22" x2="12" y2="13"></line>
                  <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 dark:text-gray-100">
                Özel Tasarım
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground dark:text-gray-400">
                Markanıza özel ambalaj çözümleri geliştirme imkanı
              </p>
            </div>
            <div
              className={`text-center ${
                isContentVisible
                  ? "scale-in visible stagger-animation"
                  : "scale-in"
              }`}
              style={{ animationDelay: "700ms" }}
            >
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400"
                >
                  <path d="M9.31 9.31 5 21l7-4 7 4-1.17-3.17"></path>
                  <path d="M14.53 8.06 12 2l-1.76 4.4"></path>
                  <path d="m4.56 10.5-1.41-1.41"></path>
                  <path d="M19.44 10.5 21 9"></path>
                  <path d="m11.31 15.53-1.6 1.6"></path>
                  <circle cx="17" cy="17" r="5"></circle>
                  <path d="M17 14v3h3"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 dark:text-gray-100">
                Hızlı Teslimat
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground dark:text-gray-400">
                Düzenli stok ve etkin lojistik ile zamanında teslimat
              </p>
            </div>
            <div
              className={`text-center ${
                isContentVisible
                  ? "scale-in visible stagger-animation"
                  : "scale-in"
              }`}
              style={{ animationDelay: "800ms" }}
            >
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400"
                >
                  <path d="M2 3h20"></path>
                  <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
                  <path d="m7 21 5-5 5 5"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 dark:text-gray-100">
                Kalite Kontrolü
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground dark:text-gray-400">
                Her ürün için titiz kalite kontrol süreçleri
              </p>
            </div>
          </div>
        </section>
        {/* Kategori bölümü */}
        <section
          className={`mb-8 sm:mb-12 ${
            isContentVisible ? "fade-in visible" : "fade-in"
          }`}
          style={{ animationDelay: "900ms" }}
        >
          <h2
            className={`text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 ${
              isContentVisible ? "slide-up visible" : "slide-up"
            }`}
            style={{ animationDelay: "1000ms" }}
          >
            Popüler Kategoriler
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {product_catalog.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/ambalaj?category=${category.name}`}
              >
                <Card className="group overflow-hidden h-full border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={getCloudinaryUrl(category.image)}
                      alt={category.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 dark:text-gray-100">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 dark:text-gray-400">
                      {category.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-xs sm:text-sm dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      Ürünleri Gör
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        {/* CTA bölümü */}
        <section
          className={`mb-8 sm:mb-12 bg-blue-50 dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 lg:p-12 ${
            isContentVisible ? "fade-in visible" : "fade-in"
          }`}
          style={{ animationDelay: "1100ms" }}
        >
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
                <Button
                  size="default"
                  variant="outline"
                  asChild
                  className="text-sm sm:text-base dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <Link href="/hizmetler">Hizmetlerimiz</Link>
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
        </section>
        {/* Hızlı bakış modalı */}
        {renderQuickViewModal()}
      </div>
    </>
  );
}
