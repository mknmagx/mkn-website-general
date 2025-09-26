"use client";

import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { site } from "@/config/site";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Linkedin,
  Twitter,
  Download,
  Share2,
  Clock,
  Building2,
  Copy,
  Check,
  Globe,
} from "lucide-react";

function ContactCardPage() {
  const [copiedItem, setCopiedItem] = useState(null);

  const handleCopy = useCallback(async (text, item) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error("Kopyalama başarısız:", err);
    }
  }, []);

  const handleCall = useCallback((phone) => {
    window.location.href = `tel:${phone}`;
  }, []);

  const handleEmail = useCallback((email) => {
    window.location.href = `mailto:${email}`;
  }, []);

  const handleWhatsApp = useCallback((phone) => {
    const cleanPhone = phone.replace(/\s+/g, "").replace(/\+/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  }, []);

  const handleMaps = useCallback(() => {
    window.open("https://maps.app.goo.gl/cWpjfxZog7nwUjV36", "_blank");
  }, []);

  const handleWebsite = useCallback(() => {
    window.open(`https://${site.domain}`, "_blank");
  }, []);

  const handleSaveContact = () => {
    // vCard formatında iletişim bilgisi oluştur
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:MKN GROUP
ORG:MKN GROUP
TEL;TYPE=CELL:${site.phone}
EMAIL:${site.email}
URL:https://${site.domain}
ADR:;;${site.address};;;;
NOTE:MKN GROUP - Kozmetik, Temizlik ve Ambalaj Çözümleri
X-SOCIALPROFILE;TYPE=instagram:${site.socials.instagram}
X-SOCIALPROFILE;TYPE=linkedin:${site.socials.linkedin}
X-SOCIALPROFILE;TYPE=twitter:${site.socials.twitter}
END:VCARD`;

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "MKN-GROUP-Contact.vcf";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MKN GROUP İletişim",
          text: "MKN GROUP iletişim bilgileri",
          url: window.location.href,
        });
      } catch (err) {
        console.error("Paylaşım başarısız:", err);
      }
    } else {
      handleCopy(window.location.href, "url");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Ana Kart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl p-3">
                <Image
                  src="/MKN-GROUP-LOGO.png"
                  alt="MKN Group Logo"
                  width={72}
                  height={72}
                  quality={95}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">MKN GROUP</h1>
              <p className="text-blue-100 text-sm">
                Kozmetik • Temizlik • Ambalaj • E-ticaret
              </p>
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="p-6 space-y-4">
            {/* Ana Telefon */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Telefon
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {site.phone}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleCall(site.phone)}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  title="Ara"
                >
                  <Phone className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleWhatsApp(site.phone)}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  title="WhatsApp"
                >
                  <span className="text-sm font-bold">WA</span>
                </button>
                <button
                  onClick={() => handleCopy(site.phone, "phone")}
                  className="p-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  title="Kopyala"
                >
                  {copiedItem === "phone" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Telefon 2
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {"+90 541 390 3969"}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleCall("+90 541 390 3969")}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  title="Ara"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleWhatsApp("+90 541 390 3969")}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  title="WhatsApp"
                >
                  <span className="text-sm font-bold">WA</span>
                </button>
                <button
                  onClick={() => handleCopy("+90 541 390 3969", "phone")}
                  className="p-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  title="Kopyala"
                >
                  {copiedItem === "phone" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    E-posta
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {site.email}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEmail(site.email)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  title="E-posta Gönder"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopy(site.email, "email")}
                  className="p-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  title="Kopyala"
                >
                  {copiedItem === "email" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Adres */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Adres
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {site.address}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleMaps()}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="Haritada Aç"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopy(site.address, "address")}
                  className="p-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  title="Kopyala"
                >
                  {copiedItem === "address" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Web Sitesi */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Web Sitesi
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {site.domain}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleWebsite()}
                  className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                  title="Web Sitesini Aç"
                >
                  <Globe className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    handleCopy(`https://${site.domain}`, "website")
                  }
                  className="p-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  title="Kopyala"
                >
                  {copiedItem === "website" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Çalışma Saatleri */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Çalışma Saatleri
                </p>
              </div>
              <div className="ml-11 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Hafta İçi:</span>
                  <span>{site.contact.workingHours.weekdays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cumartesi:</span>
                  <span>{site.contact.workingHours.saturday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pazar:</span>
                  <span>{site.contact.workingHours.sunday}</span>
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <p className="font-medium text-slate-900 dark:text-white mb-3">
                Sosyal Medya
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href={site.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  title="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href={site.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  title="LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                <a
                  href={site.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-black text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  title="X (Twitter)"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Fabrikalar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Fabrikalarımız
                </p>
              </div>
              <div className="ml-11 space-y-3">
                {site.contact.factories.map((factory, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {factory.title}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 mb-1">
                      {factory.specialization}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {factory.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSaveContact}
                className="flex-1 flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Rehbere Ekle</span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center space-x-2 p-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Paylaş</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          <p>© 2025 MKN GROUP - Tüm hakları saklıdır</p>
          <p className="mt-1">QR kod ile erişim sağladınız</p>
        </div>
      </div>
    </div>
  );
}

export default memo(ContactCardPage);
