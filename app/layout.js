import { Space_Grotesk, DM_Sans, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PWAInstallBanner from "@/components/pwa-install-banner";
import PWAWrapper from "@/components/pwa-wrapper";
import { Toaster } from "sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  preload: false,
  fallback: ["system-ui", "arial"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  preload: true, // Used in navbar brand, above-the-fold
  fallback: ["system-ui", "arial"],
});

export const metadata = {
  metadataBase: new URL("https://mkngroup.com.tr"),
  title: {
    default:
      "MKNGROUP - Fason Üretim, Ambalaj ve Operasyon Çözümleri | Türkiye",
    template: "%s | MKNGROUP",
  },
  description:
    "🏭 Türkiye'nin lider fason üretim şirketi MKNGROUP: ISO sertifikalı kozmetik üretimi, premium ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri. ✨ 6+ yıl deneyim, 1000+ başarılı proje.",
  keywords: [
    "fason üretim",
    "kozmetik fason üretim",
    "kozmetik ambalaj",
    "ambalaj çözümleri",
    "e-ticaret operasyon",
    "e-ticaret operasyon",
    "dijital pazarlama",
    "MKNGROUP",
    "istanbul fason üretim",
    "türkiye kozmetik üretimi",
    "sertifikalı üretim",
    "contract manufacturing",
    "private label kozmetik",
    "temizlik ürünleri üretimi",
    "gıda takviyesi üretimi",
    "kozmetik ambalaj tedariki",
    "airless şişe",
    "pompa şişe",
    "disc top kapak",
    "depo yönetimi",
    "kargo operasyon",
    "influencer pazarlama",
    "sosyal medya yönetimi",
    "3PL hizmetleri",
    "fulfilment hizmetleri",
  ],
  authors: [{ name: "MKNGROUP", url: "https://mkngroup.com.tr" }],
  creator: "MKNGROUP",
  publisher: "MKNGROUP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "Manufacturing",
  classification: "Business",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "https://mkngroup.com.tr",
    languages: {
      "tr-TR": "https://mkngroup.com.tr",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://mkngroup.com.tr",
    siteName: "MKNGROUP",
    title: "MKNGROUP - Fason Üretim, Ambalaj ve Operasyon Çözümleri",
    description:
      "Türkiye'nin önde gelen fason üretim şirketi MKNGROUP: ISO sertifikalı kozmetik üretimi, premium ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MKNGROUP - Fason Üretim ve Operasyon Çözümleri",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mkngroup",
    creator: "@mkngroup",
    title: "MKNGROUP - Fason Üretim, Ambalaj ve Operasyon Çözümleri",
    description:
      "Türkiye'nin önde gelen fason üretim şirketi MKNGROUP: ISO sertifikalı kozmetik üretimi, premium ambalaj çözümleri, e-ticaret operasyonları ve dijital pazarlama hizmetleri.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/favicon.ico" },
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "google-site-verification": "placeholder-google-verification-code",
    "yandex-verification": "placeholder-yandex-verification-code",
    "msvalidate.01": "placeholder-bing-verification-code",
    "facebook-domain-verification": "placeholder-facebook-verification-code",
  },
  verification: {
    google: "placeholder-google-verification-code",
    yandex: "placeholder-yandex-verification-code",
    other: {
      me: ["mailto:info@mkngroup.com.tr", "https://mkngroup.com.tr"],
    },
  },
};

export const viewport = {
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${montserrat.variable}`}
      suppressHydrationWarning={true}
    >
      <head>
        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MKN GROUP" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Critical Resource Preloading */}
        <link
          rel="preload"
          href="/MKN-GROUP-LOGO.png"
          as="image"
          type="image/png"
        />
        <link rel="preload" href="/og-image.png" as="image" type="image/png" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning={true} className="font-sans antialiased">
        <SpeedInsights />
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <PWAWrapper>
              {children}
              <PWAInstallBanner />
              <Toaster 
                richColors 
                position="top-center"
                expand={true}
                visibleToasts={4}
                closeButton={true}
              />
            </PWAWrapper>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
