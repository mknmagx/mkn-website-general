import { site } from "@/config/site";

export const metadata = {
  title: "MKN GROUP - İletişim Kartı | Telefon, E-posta, Adres",
  description:
    "MKN GROUP iletişim bilgileri: Telefon +90 531 494 25 94, E-posta info@mkngroup.com.tr, Adres İstanbul. WhatsApp, sosyal medya ve tüm iletişim kanalları. QR kod ile kolayca erişim.",
  keywords: [
    "MKN GROUP",
    "iletişim",
    "telefon",
    "email",
    "WhatsApp",
    "adres",
    "İstanbul",
    "sosyal medya",
    "kozmetik",
    "temizlik",
    "ambalaj",
    "e-ticaret",
    "QR kod",
    "iletişim kartı",
    "contact card",
    "vCard",
  ].join(", "),
  authors: [{ name: "MKN GROUP", url: `https://${site.domain}` }],
  creator: "MKN GROUP",
  publisher: "MKN GROUP",

  robots: {
    index: false, // QR kod ile özel erişim
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
  },

  // Canonical URL
  alternates: {
    canonical: `https://${site.domain}/contact-card`,
  },

  openGraph: {
    title: "MKN GROUP - İletişim Kartı | Telefon, E-posta, Adres",
    description:
      "MKN GROUP iletişim bilgileri: Telefon +90 531 494 25 94, E-posta info@mkngroup.com.tr, WhatsApp, sosyal medya hesapları. QR kod ile kolayca erişim.",
    url: `https://${site.domain}/contact-card`,
    siteName: "MKN GROUP",
    images: [
      {
        url: `https://${site.domain}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MKN GROUP İletişim Kartı - Telefon, E-posta, Adres Bilgileri",
        type: "image/png",
      },
      {
        url: `https://${site.domain}/MKN-GROUP-LOGO.png`,
        width: 400,
        height: 400,
        alt: "MKN GROUP Logo",
        type: "image/png",
      },
    ],
    locale: "tr_TR",
    type: "profile", // İletişim kartı için daha uygun
    countryName: "Turkey",
    emails: [site.email],
    phoneNumbers: [site.phone],
  },

  twitter: {
    card: "summary_large_image",
    title: "MKN GROUP - İletişim Kartı",
    description:
      "MKN GROUP iletişim bilgileri: Telefon, E-posta, WhatsApp, sosyal medya. QR kod ile kolayca erişim.",
    site: "@mkngroup_x",
    creator: "@mkngroup_x",
    images: [`https://${site.domain}/og-image.png`],
  },

  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    colorScheme: "light dark",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  manifest: "/site.webmanifest",

  // App specific
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MKN GROUP İletişim",
  },

  formatDetection: {
    telephone: true,
    date: false,
    address: true,
    email: true,
  },

  // Enhanced metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=yes",
    "theme-color": "#3b82f6",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function ContactCardLayout({ children }) {
  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MKN GROUP",
    alternateName: "MKN Group",
    url: `https://${site.domain}`,
    logo: `https://${site.domain}/MKN-GROUP-LOGO.png`,
    image: `https://${site.domain}/og-image.png`,
    description:
      "Kozmetik, temizlik ve ambalaj çözümleri sunan lider firma. E-ticaret, pazarlama ve tasarım hizmetleri.",

    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.phone,
      contactType: "customer service",
      availableLanguage: ["Turkish", "English"],
      areaServed: "TR",
    },

    address: {
      "@type": "PostalAddress",
      streetAddress: "Akçaburgaz Mah, 3026 Sk, No:5",
      addressLocality: "Esenyurt",
      addressRegion: "İstanbul",
      addressCountry: "TR",
      postalCode: "34522",
    },

    email: site.email,
    telephone: site.phone,

    sameAs: [
      site.socials.instagram,
      site.socials.linkedin,
      site.socials.twitter,
      `https://${site.domain}`,
    ],

    founder: {
      "@type": "Person",
      name: "MKN GROUP",
    },

    foundingDate: "2020",

    industry: ["Cosmetics", "Cleaning Products", "Packaging", "E-commerce"],

    knowsAbout: [
      "Kozmetik Üretimi",
      "Temizlik Ürünleri",
      "Ambalaj Çözümleri",
      "E-ticaret",
      "Dijital Pazarlama",
      "Fason Üretim",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
