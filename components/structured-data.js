import { site } from "@/config/site";
import { slugifyTr, createProductSlug } from "@/utils/slugify-tr";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "Manufacturer"],
    name: "MKN GROUP",
    alternateName: ["MKN GROUP", "MKN Grup"],
    description:
      "Türkiye'nin önde gelen fason üretim şirketi. ISO sertifikalı kozmetik üretimi, premium ambalaj çözümleri, profesyonel e-ticaret operasyonları ve dijital pazarlama hizmetleri.",
    url: "https://www.mkngroup.com.tr",
    logo: {
      "@type": "ImageObject",
      url: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      width: 400,
      height: 200,
    },
    image: [
      "https://www.mkngroup.com.tr/og-image.png",
      "https://www.mkngroup.com.tr/optimized/modern-manufacturing-facility-with-advanced-equipm.webp",
      "https://www.mkngroup.com.tr/optimized/modern-pharmaceutical-manufacturing-facility-with-.webp",
    ],
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5",
      addressLocality: "Esenyurt",
      addressRegion: "İstanbul",
      addressCountry: "TR",
      postalCode: "34522",
    },
    foundingDate: "2010",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 50,
      maxValue: 100,
    },
    naics: "325620", // Toilet Preparation Manufacturing
    industry: [
      "Manufacturing",
      "Cosmetics Manufacturing",
      "Contract Manufacturing",
    ],
    serviceArea: [
      {
        "@type": "Country",
        name: "Turkey",
      },
      {
        "@type": "Place",
        name: "Europe",
      },
      {
        "@type": "Place",
        name: "Middle East",
      },
    ],
    areaServed: ["TR", "EU", "ME"],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "127",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "MKN GROUP Hizmet Kataloğu",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Kozmetik Fason Üretim",
            description: "ISO 22716 sertifikalı kozmetik ürün üretimi",
            category: "Manufacturing",
            serviceType: "Contract Manufacturing",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Temizlik Ürünleri Üretimi",
            description: "Profesyonel temizlik ve bakım ürünleri üretimi",
            category: "Manufacturing",
            serviceType: "Contract Manufacturing",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Gıda Takviyesi Üretimi",
            description:
              "Sertifikalı gıda takviyesi ve besin destekleri üretimi",
            category: "Manufacturing",
            serviceType: "Contract Manufacturing",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Kozmetik Ambalaj Çözümleri",
            description:
              "Airless şişe, pompa şişe, disc top kapak ve özel ambalaj tasarımları",
            category: "Packaging",
            serviceType: "Packaging Solutions",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "E-ticaret Operasyon Yönetimi",
            description:
              "Depo yönetimi, kargo operasyonları ve e-ticaret altyapı hizmetleri",
            category: "Logistics",
            serviceType: "Operations Management",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Dijital Pazarlama Hizmetleri",
            description:
              "Sosyal medya yönetimi, influencer pazarlama ve reklam kampanyaları",
            category: "Marketing",
            serviceType: "Digital Marketing",
          },
        },
      ],
    },
    sameAs: [
      site.socials.linkedin,
      site.socials.instagram,
      site.socials.twitter,
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phone,
        contactType: "customer service",
        email: site.email,
        availableLanguage: ["Turkish", "English"],
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:30",
          closes: "18:00",
        },
      },
    ],
    makesOffer: [
      {
        "@type": "Offer",
        name: "Ücretsiz Numune ve Konsültasyon",
        description:
          "Tüm ürünlerimiz için ücretsiz numune ve profesyonel danışmanlık hizmeti",
        category: "Consultation",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "MKN GROUP hangi sektörlerde fason üretim hizmeti sunuyor?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MKN GROUP kozmetik ürünler, temizlik ve bakım ürünleri, gıda takviyeleri olmak üzere 3 ana sektörde ISO sertifikalı fason üretim hizmeti sunmaktadır. Özellikle cilt bakım ürünleri, saç bakım ürünleri, ev temizlik ürünleri ve besin destekleri alanında uzmanlaşmıştır.",
        },
      },
      {
        "@type": "Question",
        name: "Minimum sipariş miktarları nedir?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Minimum sipariş miktarları ürün tipine göre değişmektedir. Kozmetik ürünler için genellikle 500-1000 adet, temizlik ürünleri için 1000-5000 adet minimum sipariş alınmaktadır. Detaylı bilgi için bizimle iletişime geçebilirsiniz.",
        },
      },
      {
        "@type": "Question",
        name: "Hangi ambalaj türlerini tedarik ediyorsunuz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Airless şişeler, pompa şişeler, disc top kapaklar, krem pompaları, sprey pompalar, köpük pompaları ve özel tasarım ambalajlar dahil geniş bir ambalaj yelpazesi sunuyoruz. Tüm ambalajlarımız kaliteli malzemelerden üretilmekte ve müşteri ihtiyaçlarına göre özelleştirilebilmektedir.",
        },
      },
      {
        "@type": "Question",
        name: "Teslimat süreleri ne kadar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ürün tipine ve sipariş miktarına bağlı olarak teslimat süreleri değişmektedir. Standart ürünler için 7-15 gün, özel formülasyon gerektiren ürünler için 15-30 gün arası teslimat yapılmaktadır. Acil siparişler için express üretim seçeneği de mevcuttur.",
        },
      },
      {
        "@type": "Question",
        name: "Hangi sertifikalara sahipsiniz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ISO 22716 Kozmetik GMP, ISO 9001 Kalite Yönetim Sistemi, ISO 14001 Çevre Yönetim Sistemi ve OHSAS 18001 İş Sağlığı ve Güvenliği sertifikalarına sahiptir. Ayrıca tüm üretimimiz TSE ve CE standartlarına uygun şekilde yapılmaktadır.",
        },
      },
      {
        "@type": "Question",
        name: "Özel formülasyon hizmeti veriyor musunuz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet, deneyimli R&D ekibimizle müşterilerimizin ihtiyaçlarına özel formülasyon geliştirme hizmeti sunuyoruz. Ücretsiz konsültasyon ve numune üretimi ile birlikte markanıza özel ürünler geliştiriyoruz.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.mkngroup.com.tr/#organization",
    name: "MKN GROUP",
    alternateName: "MKN GROUP",
    description:
      "Türkiye'nin önde gelen fason üretim ve operasyon çözümleri şirketi",
    url: "https://www.mkngroup.com.tr",
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5",
      addressLocality: "Esenyurt",
      addressRegion: "İstanbul",
      addressCountry: "TR",
      postalCode: "34522",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.0082,
      longitude: 28.9784,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:30",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    currenciesAccepted: "TRY, USD, EUR",
    paymentAccepted: "Bank Transfer, Credit Card, Cash",
    hasMap:
      "https://maps.google.com/?q=Akçaburgaz+Mah,+3026+Sk,+No:5,+Esenyurt,+İstanbul",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MKN GROUP",
    url: "https://www.mkngroup.com.tr",
    description:
      "Fason üretim, kozmetik ambalaj çözümleri ve operasyon yönetimi hizmetleri",
    publisher: {
      "@type": "Organization",
      name: "MKN GROUP",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.mkngroup.com.tr/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "tr-TR",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function BreadcrumbSchema({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function ServiceSchema({ service }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: "MKN GROUP",
      url: "https://www.mkngroup.com.tr",
    },
    areaServed: {
      "@type": "Country",
      name: "Turkey",
    },
    serviceType: service.type,
    category: service.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function ProductSchema({ product }) {
  const getCloudinaryUrl = (imageName) => {
    if (!imageName) return null;
    return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_800,h_800,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${imageName}`;
  };

  const images = product.images
    ? product.images.map((img) => getCloudinaryUrl(img)).filter(Boolean)
    : [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://www.mkngroup.com.tr/ambalaj/${createProductSlug(product)}`,
    name: product.name,
    description:
      product.description ||
      `${product.name} - Premium kaliteli kozmetik ambalaj ürünü. ${product.category} kategorisinde ${product.material} malzemeden üretilmiştir.`,
    image: images,
    brand: {
      "@type": "Brand",
      name: "MKN Group",
    },
    manufacturer: {
      "@type": "Organization",
      name: "MKN Group",
      url: "https://www.mkngroup.com.tr",
      logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5",
        addressLocality: "Esenyurt",
        addressRegion: "İstanbul",
        addressCountry: "TR",
        postalCode: "34522",
      },
      telephone: site.phone,
      email: site.email,
    },
    category: product.category,
    productID: product.code,
    sku: product.sku || product.code,
    gtin: product.gtin || product.code,
    mpn: product.code,
    material: product.material,
    size: product.size,
    color: product.colors ? product.colors.join(", ") : product.color,
    weight: product.weight,
    dimensions: product.dimensions,
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Cosmetics Industry, Beauty Brands, Private Label Manufacturers",
    },
    additionalProperty: [
      ...(product.debit
        ? [
            {
              "@type": "PropertyValue",
              name: "Debit/Flow Rate",
              value: product.debit,
              description: "Ürün akış hızı",
            },
          ]
        : []),
      ...(product.lockType
        ? [
            {
              "@type": "PropertyValue",
              name: "Lock Type",
              value: product.lockType,
              description: "Kapak kilit sistemi",
            },
          ]
        : []),
      ...(product.material
        ? [
            {
              "@type": "PropertyValue",
              name: "Material",
              value: product.material,
              description: "Üretim materyali",
            },
          ]
        : []),
      ...(product.size
        ? [
            {
              "@type": "PropertyValue",
              name: "Size/Threading",
              value: product.size,
              description: "Ürün boyutu/dış çap",
            },
          ]
        : []),
      {
        "@type": "PropertyValue",
        name: "Industry",
        value: "Cosmetics Packaging",
        description: "Kozmetik ambalaj sektörü",
      },
      {
        "@type": "PropertyValue",
        name: "Application",
        value: "Skincare, Haircare, Perfume, Cosmetics",
        description: "Kullanım alanları",
      },
    ],
    potentialAction: {
      "@type": "Order",
      target: "https://www.mkngroup.com.tr/iletisim",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.mkngroup.com.tr/ambalaj/${createProductSlug(product)}`,
      priceCurrency: "TRY",
      price: "0.00",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "MKN Group",
        url: "https://www.mkngroup.com.tr",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function ProductCatalogSchema({ products, category }) {
  const getCloudinaryUrl = (imageName) => {
    if (!imageName) return null;
    return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_400,h_400,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${imageName}`;
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.mkngroup.com.tr/ambalaj",
    name: "Kozmetik Ambalaj Ürünleri Kataloğu | MKN Group",
    description:
      "MKN Group'un geniş kozmetik ambalaj koleksiyonu. Parfüm şişeleri, krem kavanozları, pompalı şişeler ve premium kalitede ambalaj çözümleri.",
    url: "https://www.mkngroup.com.tr/ambalaj",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products?.length || 0,
      itemListElement:
        products?.slice(0, 20).map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            "@id": `https://www.mkngroup.com.tr/ambalaj/${createProductSlug(
              product
            )}`,
            name: product.name,
            description:
              product.description ||
              `${product.name} - ${product.category} kategorisinde premium kaliteli ambalaj ürünü`,
            image: product.images
              ? product.images
                  .map((img) => getCloudinaryUrl(img))
                  .filter(Boolean)
              : [],
            category: product.category,
            sku: product.code,
            offers: {
              "@type": "Offer",
              url: `https://www.mkngroup.com.tr/ambalaj/${createProductSlug(
                product
              )}`,
              priceCurrency: "TRY",
              price: "0.00",
              availability: "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                name: "MKN Group",
                url: "https://www.mkngroup.com.tr",
              },
            },
          },
        })) || [],
    },
    breadcrumb: {
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
          name: "Ambalaj Ürünleri",
          item: "https://www.mkngroup.com.tr/ambalaj",
        },
      ],
    },
    provider: {
      "@type": "Organization",
      name: "MKN Group",
      url: "https://www.mkngroup.com.tr",
      logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      description:
        "Türkiye'nin önde gelen kozmetik ambalaj ve fason üretim şirketi",
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Cosmetics Industry, Beauty Brands, Private Label Manufacturers",
    },
    about: {
      "@type": "Thing",
      name: "Kozmetik Ambalaj Ürünleri",
      description:
        "Airless şişeler, pompa şişeler, disc top kapaklar, krem pompaları ve özel tasarım ambalajlar",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function WebPageSchema({ title, description, url, breadcrumbs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    name: title,
    description: description,
    url: url,
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://www.mkngroup.com.tr/#website",
      name: "MKN Group",
      url: "https://www.mkngroup.com.tr",
      potentialAction: {
        "@type": "SearchAction",
        target:
          "https://www.mkngroup.com.tr/ambalaj?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    breadcrumb: breadcrumbs
      ? {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }
      : undefined,
    mainEntity: {
      "@type": "Organization",
      name: "MKN Group",
      url: "https://www.mkngroup.com.tr",
    },
    publisher: {
      "@type": "Organization",
      name: "MKN Group",
      url: "https://www.mkngroup.com.tr",
      logo: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
    },
    dateModified: new Date().toISOString(),
    inLanguage: "tr",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function ManufacturerSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "Manufacturer"],
    "@id": "https://www.mkngroup.com.tr/#manufacturer",
    name: "MKN Group",
    alternateName: ["MKN GROUP", "MKN Grup"],
    description:
      "ISO sertifikalı kozmetik üretimi ve premium ambalaj çözümleri sunan Türkiye'nin önde gelen fason üretim şirketi",
    url: "https://www.mkngroup.com.tr",
    logo: {
      "@type": "ImageObject",
      url: "https://www.mkngroup.com.tr/MKN-GROUP-LOGO.png",
      width: 400,
      height: 200,
    },
    foundingDate: "2010",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 50,
      maxValue: 100,
    },
    naics: "325620",
    industry: [
      "Manufacturing",
      "Cosmetics Manufacturing",
      "Packaging Manufacturing",
    ],
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Kozmetik Ambalaj Üretimi",
          description:
            "Airless şişe, pompa şişe, disc top kapak ve özel ambalaj tasarımları",
          category: "Packaging Manufacturing",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "ISO Sertifikalı Fason Üretim",
          description:
            "Kozmetik ürünler, temizlik ürünleri ve gıda takviyeleri fason üretimi",
          category: "Contract Manufacturing",
        },
      },
    ],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        name: "ISO 22716 Kozmetik GMP Sertifikası",
        description:
          "Kozmetik ürünler için İyi Üretim Uygulamaları sertifikası",
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "ISO 9001 Kalite Yönetim Sistemi",
        description: "Kalite yönetim sistemi sertifikası",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5",
      addressLocality: "Esenyurt",
      addressRegion: "İstanbul",
      addressCountry: "TR",
      postalCode: "34522",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.phone,
      contactType: "sales",
      email: site.email,
      availableLanguage: ["Turkish", "English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function AmbalajFAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://www.mkngroup.com.tr/ambalaj#faq",
    mainEntity: [
      {
        "@type": "Question",
        name: "Hangi kozmetik ambalaj türlerini üretiyorsunuz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MKN Group olarak airless şişeler, pompa şişeler, disc top kapaklar, krem pompaları, sprey pompalar, köpük pompaları, parfüm şişeleri, serum şişeleri ve özel tasarım ambalajlar üretiyoruz. Tüm ürünlerimiz yüksek kaliteli malzemelerden üretilmekte ve farklı boyut seçenekleri sunmaktayız.",
        },
      },
      {
        "@type": "Question",
        name: "Ambalaj ürünlerinde minimum sipariş miktarları nedir?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Minimum sipariş miktarları ürün tipine göre değişmektedir. Standart ambalaj ürünleri için genellikle 500-1000 adet, özel tasarım ambalajlar için ise 1000-5000 adet minimum sipariş alınmaktadır. Detaylı bilgi için lütfen bizimle iletişime geçiniz.",
        },
      },
      {
        "@type": "Question",
        name: "Ambalaj ürünlerinde hangi malzemeleri kullanıyorsunuz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ürünlerimizde PP (Polipropilen), PE (Polietilen), PET (Polietilen Tereftalat), PETG, alüminyum ve cam malzemeleri kullanıyoruz. Tüm malzemelerimiz kozmetik ürünler için uygun, gıda teması güvenli ve çevre dostu özellikler taşımaktadır.",
        },
      },
      {
        "@type": "Question",
        name: "Özel tasarım ambalaj üretimi yapıyor musunuz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet, müşterilerimizin ihtiyaçlarına göre özel tasarım ambalaj üretimi yapmaktayız. Marka kimliğinize uygun renk, şekil ve boyut seçenekleri sunuyoruz. Ayrıca özel baskı, etiket ve dekorasyon hizmetleri de sağlıyoruz.",
        },
      },
      {
        "@type": "Question",
        name: "Ambalaj teslimat süreleri ne kadar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stokta bulunan standart ürünler için 3-7 iş günü, özel üretim ürünler için 15-30 iş günü teslimat süresi bulunmaktadır. Acil siparişler için hızlı teslimat seçenekleri de mevcuttur.",
        },
      },
      {
        "@type": "Question",
        name: "Ambalaj ürünlerinin kalite sertifikaları var mı?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet, tüm ambalaj ürünlerimiz ISO 22716 kozmetik GMP standartlarına uygun üretilmektedir. Ayrıca FDA onaylı malzemeler kullanıyor ve CE işaretli ürünler sunuyoruz. Kalite kontrollerimiz düzenli olarak yapılmaktadır.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
