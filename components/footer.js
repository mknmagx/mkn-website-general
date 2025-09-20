import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { site } from "@/config/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const serviceLinks = [
    { name: "Kozmetik Ambalaj", href: "/ambalaj" },
    { name: "Fason Üretim", href: "/fason-uretim" },
    { name: "E-ticaret Operasyon", href: "/e-ticaret" },
    { name: "Pazarlama Hizmetleri", href: "/pazarlama" },
    { name: "Tasarım Hizmetleri", href: "/tasarim" },
  ];

  const companyLinks = [
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "Tesislerimiz", href: "/tesisler" },
    { name: "Blog", href: "/blog" },
    { name: "İletişim", href: "/iletisim" },
  ];

  const quickLinks = [
    { name: "Teklif Al", href: "/teklif" },
    { name: "Ambalaj Ürün Kataloğu", href: "/ambalaj" },
    { name: "Tesislerimiz", href: "/tesisler" },
    { name: "SSS", href: "/sss" },
  ];

  return (
    <footer
      className="bg-muted/50 border-t"
      itemScope
      itemType="https://schema.org/Organization"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Image
                  src="/MKN-GROUP-LOGO.png"
                  alt="MKN Group Logo - Kozmetik Üretim Firması"
                  width={32}
                  height={32}
                  quality={95}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="font-bold text-xl font-montserrat leading-none"
                  itemProp="name"
                >
                  {site.name}
                  <sup className="text-sm font-black relative -top-2"></sup>
                </span>
                <span
                  className="text-xs text-muted-foreground font-medium leading-none"
                  itemProp="slogan"
                >
                  Üretimden Pazarlamaya
                </span>
              </div>
            </div>
            <p
              className="text-muted-foreground text-sm leading-relaxed"
              itemProp="description"
            >
              Türkiye'nin önde gelen kozmetik üretimi, gıda takviyesi ve
              temizlik ürünleri fason üretim merkezi. Kozmetik ambalaj tedariki,
              depo-kargo ve e-ticaret operasyon yönetimi, dijital pazarlama &
              reklam desteği hizmetleriyle markanızı büyütüyoruz.
            </p>
            <div className="flex space-x-3">
              <Link
                href={site.socials.instagram}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="MKN Group Instagram Sayfası"
                itemProp="sameAs"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href={site.socials.linkedin}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="MKN Group LinkedIn Sayfası"
                itemProp="sameAs"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href={site.socials.youtube}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="MKN Group YouTube Kanalı"
                itemProp="sameAs"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Hizmetlerimiz</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Şirket</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">İletişim</h3>
            <div
              className="space-y-3"
              itemScope
              itemType="https://schema.org/ContactPoint"
            >
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span itemProp="telephone">{site.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span itemProp="email">{site.email}</span>
              </div>
              <div
                className="flex items-center space-x-2 text-sm text-muted-foreground"
                itemScope
                itemType="https://schema.org/PostalAddress"
              >
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span itemProp="streetAddress">{site.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-muted-foreground text-sm">
              {currentYear}{" "}
              <span className="font-montserrat font-semibold">{site.name}</span>
              . Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-4 text-sm">
              <Link
                href="/gizlilik-politikasi"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Gizlilik Politikası
              </Link>
              <Link
                href="/kullanim-kosullari"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
