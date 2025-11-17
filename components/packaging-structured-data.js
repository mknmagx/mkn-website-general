import { site } from "@/config/site";
import { createProductSlug } from "@/utils/slugify-tr";

/**
 * Packaging Structured Data Component
 * Google 2024-2025 güncel taleplerine uygun JSON-LD structured data
 * Ambalaj ürünleri için optimize edilmiş schema markup
 */

// Fiyat hesaplama helper'ı - tek popüler fiyat döner
const calculateMostPopularPrice = (product) => {
  if (!product?.business?.priceRanges?.length) {
    return {
      price: "2.50", // Varsayılan başlangıç fiyatı
      currency: "TRY",
      minQuantity: 50,
      maxQuantity: 500,
    };
  }

  // En popüler fiyat aralığını bul (genellikle ortanca)
  const priceRanges = product.business.priceRanges;
  const popularIndex = Math.floor(priceRanges.length / 2);
  const popularRange = priceRanges[popularIndex];

  if (popularRange?.price && !isNaN(parseFloat(popularRange.price))) {
    return {
      price: parseFloat(popularRange.price).toString(),
      currency: popularRange.currency || "TRY",
      minQuantity: popularRange.minQuantity || 50,
      maxQuantity: popularRange.maxQuantity || 500,
    };
  }

  return {
    price: "2.50",
    currency: "TRY",
    minQuantity: 50,
    maxQuantity: 500,
  };
};

// Cloudinary resim URL'si oluşturucu - .jpg uzantısı ile
const getOptimizedImageUrl = (imageName, width = 800, height = 800) => {
  if (!imageName) return null;
  const nameWithoutExt = imageName.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_${width},h_${height},c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${nameWithoutExt}.jpg`;
};

// Dinamik fiyat geçerlilik tarihini hesapla (bugün + 6 ay)
const getPriceValidUntil = () => {
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  return sixMonthsFromNow.toISOString();
};

// Image nesnesini oluşturucu
const createImageObject = (imageName, width = 800, height = 800) => {
  const url = getOptimizedImageUrl(imageName, width, height);
  if (!url) return null;
  return {
    "@type": "ImageObject",
    url,
    width,
    height,
  };
};

// Ürün spesifikasyonları ve özelliklerini çıkarma
const extractProductProperties = (product) => {
  const properties = [];

  // Temel özellikler
  const specs = product.specifications || {};

  if (product.size || specs.size) {
    properties.push({
      "@type": "PropertyValue",
      name: "Size",
      value: product.size || specs.size,
    });
  }

  if (product.material || specs.material) {
    properties.push({
      "@type": "PropertyValue",
      name: "Material",
      value: product.material || specs.material,
    });
  }

  if (product.colors && product.colors.length > 0) {
    properties.push({
      "@type": "PropertyValue",
      name: "Color Options",
      value: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : product.colors,
    });
  }

  if (product.debit || specs.debit) {
    properties.push({
      "@type": "PropertyValue",
      name: "Output Rate",
      value: product.debit || specs.debit,
    });
  }

  if (product.lockType || specs.lockType) {
    properties.push({
      "@type": "PropertyValue",
      name: "Lock Type",
      value: product.lockType || specs.lockType,
    });
  }

  if (product.code) {
    properties.push({
      "@type": "PropertyValue",
      name: "Product Code",
      value: product.code,
    });
  }

  return properties;
};

/**
 * Tekil ürün için Product Schema - Google Rich Results 2024-2025
 */
export function PackagingProductSchema({ product, pageUrl }) {
  const popularPrice = calculateMostPopularPrice(product);
  const productImages = product.images || [];
  const imageObjects = productImages
    .map((img) => createImageObject(img, 800, 800))
    .filter(Boolean);

  const productProperties = extractProductProperties(product);
  const productSize = product.specifications?.size || product.size;

  // GTIN sadece geçerli rakamsal değer varsa ekle
  const gtinValue =
    product.gtin && /^\d{8,14}$/.test(product.gtin) ? product.gtin : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": pageUrl,
    name: `${product.name}${productSize ? ` - ${productSize}` : ""}`,
    description:
      product.description ||
      `MKN Group'tan profesyonel ${product.name} ambalaj çözümü.`,
    image:
      imageObjects.length > 0
        ? imageObjects
        : [createImageObject("default-packaging", 800, 800)],
    sku: product.code || `MKN-${product.id}`,
    mpn: product.code || `MKN-${product.id}`,
    gtin: gtinValue,
    category: product.category,
    brand: {
      "@type": "Brand", 
      name: "MKN Group",
      url: "https://www.mkngroup.com.tr",
    },
    manufacturer: {
      "@type": "Organization",
      name: "MKN Group",
      url: "https://www.mkngroup.com.tr",
      telephone: site.phone,
      email: site.email,
    },
    offers: {
      "@type": "Offer",
      price: popularPrice.price,
      priceCurrency: popularPrice.currency,
      priceValidUntil: getPriceValidUntil(),
      availability:
        product.inStock !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: pageUrl,
      seller: {
        "@type": "Organization",
        name: "MKN Group",
        url: "https://www.mkngroup.com.tr",
        telephone: site.phone,
      },
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: popularPrice.minQuantity,
        maxValue: popularPrice.maxQuantity,
        unitCode: "C62",
      },
      eligibleRegion: {
        "@type": "Country",
        name: "Turkey",
      },
    },
    additionalProperty: productProperties,
  };
}

/**
 * Ambalaj kategori sayfası için ItemList Schema - Google Rich Results 2024-2025
 */
export function PackagingCategorySchema({
  products,
  categoryName,
  pageUrl,
  pageTitle,
  pageDescription,
}) {
  const featuredProducts = products.slice(0, 12);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": pageUrl,
    name: pageTitle || `${categoryName} Products | MKN Group`,
    description:
      pageDescription ||
      `MKN Group'tan kaliteli ${categoryName} ambalaj çözümleri.`,
    url: pageUrl,
    numberOfItems: featuredProducts.length,
    itemListElement: featuredProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        "@id": `https://www.mkngroup.com.tr/ambalaj/${createProductSlug(
          product
        )}`,
        name: product.name,
        image: createImageObject(product.images?.[0], 400, 400),
        description: product.description || `${product.name} ambalaj çözümü.`,
        offers: {
          "@type": "Offer",
          price: calculateMostPopularPrice(product).price,
          itemCondition: "https://schema.org/NewCondition",
          priceCurrency: "TRY",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
}

/**
 * Ana ambalaj sayfası için ItemList Schema - Google Rich Results 2024-2025
 */
export function PackagingMainPageSchema({ products, categories, pageUrl }) {
  const featuredProducts = products.slice(0, 20);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": pageUrl,
    name: "Cosmetic Packaging Products | MKN Group",
    description:
      "Türkiye'nin önde gelen kozmetik ambalaj kataloğu, premium kalite ürünler.",
    url: pageUrl,
    numberOfItems: featuredProducts.length,
    itemListElement: featuredProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        "@id": `https://www.mkngroup.com.tr/ambalaj/${createProductSlug(
          product
        )}`,
        name: product.name,
        image: createImageObject(product.images?.[0], 600, 600),
        description: product.description || `${product.name} ambalaj çözümü.`,
        category: product.category,
        brand: {
          "@type": "Brand",
          name: "MKN Group",
        },
        offers: {
          "@type": "Offer",
          price: calculateMostPopularPrice(product).price,
          priceCurrency: "TRY",
          itemCondition: "https://schema.org/NewCondition",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "MKN Group",
          },
        },
      },
    })),
  };
}

/**
 * Breadcrumb Schema
 */
export function PackagingBreadcrumbSchema(breadcrumbItems) {
  if (!breadcrumbItems || breadcrumbItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Service Schema - Google Rich Results 2024-2025
 */
export function PackagingServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Kozmetik Ambalaj Tedarik Hizmeti",
    description:
      "Profesyonel kozmetik ambalaj ürünleri tedarik hizmeti, hızlı teslimat ile.",
    provider: {
      "@type": "Organization",
      name: "MKN Group",
      url: "https://www.mkngroup.com.tr",
      telephone: site.phone,
    },
    serviceType: "Packaging Supply",
    category: "Manufacturing",
    areaServed: {
      "@type": "Country",
      name: "Turkey",
    },
    offers: {
      "@type": "Offer",
      description: "Kozmetik ambalaj ürünleri toptan satış",
      seller: {
        "@type": "Organization",
        name: "MKN Group",
      },
    },
  };
}

/**
 * FAQ Schema - Google Rich Results 2024-2025
 */
export function PackagingFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage", 
    mainEntity: [
      {
        "@type": "Question",
        name: "Minimum sipariş adedi nedir?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ambalaj ürünlerimiz için minimum sipariş adedi genellikle 50-100 adet arasındadır. Ürüne göre değişiklik gösterebilir.",
        },
      },
      {
        "@type": "Question",
        name: "Teslimat süresi ne kadar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stokta bulunan ürünler için 1-3 iş günü içinde teslimat sağlanır. Özel üretim ürünleri 7-14 iş günü sürer.",
        },
      },
      {
        "@type": "Question",
        name: "Özel tasarım ambalaj yapabilir misiniz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet, müşteri taleplerine göre özel tasarım ve baskılı ambalaj üretimi yapabiliyoruz. Minimum sipariş adetleri değişiklik gösterebilir.",
        },
      },
      {
        "@type": "Question",
        name: "Ürünler gıda uyumlu mu?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ambalaj ürünlerimiz kozmetik ve gıda endüstrisine uygun FDA onaylı malzemelerden üretilmektedir.",
        },
      },
    ],
  };
}

/**
 * Organization Schema for packaging context
 * NOT USED - Global OrganizationSchema in layout.js is used instead
 * to avoid duplicate schema markup
 */
