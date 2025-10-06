"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Check,
  Package,
  Truck,
  Shield,
  ArrowLeft,
  ArrowRight,
  Download,
  Phone,
  Package2,
  Info,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { slugifyTr, createProductSlug } from "@/utils/slugify-tr";

const getCloudinaryUrl = (imageName) => {
  if (!imageName) return null;
  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_600,h_600,c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${imageName}`;
};

export default function ProductDetailClient({ product, relatedProducts }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleDownloadCatalog = () => {
    const link = document.createElement("a");
    link.href =
      "https://firebasestorage.googleapis.com/v0/b/mkngroup-general.firebasestorage.app/o/public%2Fmkn-ambalaj-katalog-tr.pdf?alt=media&token=1ad8671f-60df-496f-aa39-3e6217238a46";
    link.download = "MKN-Ambalaj-Katalog.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppContact = () => {
    const whatsappNumber = "905314942594";
    let message = `Merhaba MKNGROUP! 👋\n\n`;
    message += `Aşağıdaki ürün hakkında bilgi almak istiyorum:\n\n`;
    message += `📦 *Ürün:* ${product.name}${
      product.size ? ` - ${product.size}` : ""
    }\n`;
    message += `📋 *Kategori:* ${product.category}\n`;

    if (product.code) {
      message += `🔢 *Ürün Kodu:* ${product.code}\n`;
    }
    if (product.size) {
      message += `📏 *Boyut:* ${product.size}\n`;
    }
    if (product.material) {
      message += `🧪 *Malzeme:* ${product.material}\n`;
    }
    if (product.color) {
      message += `🎨 *Renk:* ${product.color}\n`;
    }

    message += `\n📝 *Açıklama:* ${product.description}\n\n`;
    message += `Bu ürün için:\n`;
    message += `• Fiyat bilgisi\n`;
    message += `• Minimum sipariş miktarı\n`;
    message += `• Teslimat süresi\n`;
    message += `• Özel üretim seçenekleri\n\n`;
    message += `hakkında detaylı bilgi alabilir miyim?\n\n`;
    message += `Teşekkürler! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name}${
        product.size ? ` - ${product.size}` : ""
      } | MKN Group Ambalaj`,
      text: `${product.description} - ${product.category} kategorisinde profesyonel ambalaj çözümleri.`,
      url: window.location.href,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        throw new Error("Web Share API not available, showing modal");
      }
    } catch (error) {
      console.log("Showing share modal:", error.message);

      const shareUrl = encodeURIComponent(window.location.href);
      const shareTitle = encodeURIComponent(
        `${product.name}${
          product.size ? ` - ${product.size}` : ""
        } | MKN Group Ambalaj`
      );
      const shareText = encodeURIComponent(
        `${product.description} - ${product.category} kategorisinde profesyonel ambalaj çözümleri.`
      );

      const socialOptions = [
        {
          name: "WhatsApp",
          url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
          color: "bg-green-500",
        },
        {
          name: "Twitter",
          url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
          color: "bg-blue-400",
        },
        {
          name: "Facebook",
          url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
          color: "bg-blue-600",
        },
        {
          name: "LinkedIn",
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
          color: "bg-blue-700",
        },
      ];

      const modal = document.createElement("div");
      modal.innerHTML = `
        <div class="fixed inset-0 bg-gray-900 bg-opacity-10 z-50 flex items-center justify-center p-4" onclick="this.remove()">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold dark:text-white">Ürünü Paylaş</h3>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              ${socialOptions
                .map(
                  (option) => `
                <a href="${option.url}" target="_blank" class="flex items-center justify-center space-x-2 ${option.color} text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity">
                  <span>${option.name}</span>
                </a>
              `
                )
                .join("")}
            </div>
            <div class="mt-4 pt-4 border-t dark:border-gray-600">
              <div class="flex items-center space-x-2">
                <input type="text" value="${
                  window.location.href
                }" readonly class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm dark:text-white" id="shareUrlInput">
                <button onclick="
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText('${
                      window.location.href
                    }').then(() => { 
                      this.textContent = 'Kopyalandı!'; 
                      setTimeout(() => this.textContent = 'Kopyala', 2000); 
                    });
                  } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = '${window.location.href}';
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                      document.execCommand('copy');
                      this.textContent = 'Kopyalandı!';
                      setTimeout(() => this.textContent = 'Kopyala', 2000);
                    } catch (err) {
                      this.textContent = 'Kopyalama başarısız';
                      setTimeout(() => this.textContent = 'Kopyala', 2000);
                    } finally {
                      document.body.removeChild(textArea);
                    }
                  }
                " class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-sm">
                  Kopyala
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  };

  // Product images (using Cloudinary)
  const productImages =
    product.images && product.images.length > 0
      ? product.images.map((imageName, index) => ({
          src: getCloudinaryUrl(imageName),
          alt: `${product.name}${product.size ? ` - ${product.size}` : ""} - ${
            index + 1
          }`,
          caption:
            index === 0
              ? `${product.name}${product.size ? ` - ${product.size}` : ""}`
              : `${product.name}${
                  product.size ? ` - ${product.size}` : ""
                } - Görünüm ${index + 1}`,
        }))
      : [
          {
            src: getCloudinaryUrl("placeholder.jpg"),
            alt: `${product.name}${product.size ? ` - ${product.size}` : ""}`,
            caption: `${product.name}${
              product.size ? ` - ${product.size}` : ""
            }`,
          },
        ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Ana Sayfa
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/ambalaj"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Ambalaj
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {product.name}
              {product.size && ` - ${product.size}`}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden aspect-square border-2 border-gray-200 dark:border-gray-700">
              <Image
                src={productImages[selectedImageIndex]?.src}
                alt={productImages[selectedImageIndex]?.alt}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Click overlay for modal */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              />

              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        selectedImageIndex === 0
                          ? productImages.length - 1
                          : selectedImageIndex - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-20"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        (selectedImageIndex + 1) % productImages.length
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-20"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === selectedImageIndex
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Modal for enlarged view */}
            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
              <DialogContent className="max-w-4xl w-full p-0">
                <DialogHeader className="sr-only">
                  <DialogTitle>Ürün Görseli</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-square">
                  <Image
                    src={productImages[selectedImageIndex]?.src}
                    alt={productImages[selectedImageIndex]?.alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden aspect-square border-2 transition-colors ${
                      index === selectedImageIndex
                        ? "border-blue-600"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {image.src ? (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 25vw, 12vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge
                    variant="secondary"
                    className="mb-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {product.category}
                  </Badge>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {product.name}
                    {product.size && <span className="">- {product.size}</span>}
                  </h1>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isFavorite
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="p-2"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>

              {/* Product Features */}
              {product.features && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Öne Çıkan Özellikler:
                  </h3>
                  <ul className="space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-600 dark:text-gray-400"
                      >
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Product Specifications */}
            {product.specifications && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Info className="h-5 w-5 mr-2" />
                    Teknik Özellikler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {key}:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleDownloadCatalog}
                  variant="outline"
                  className="flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Katalog İndir
                </Button>
                <Button
                  onClick={handleWhatsAppContact}
                  variant="outline"
                  className="flex items-center justify-center border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp ile Teklif Al
                </Button>
              </div>

              <Button
                onClick={handleShare}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Kalite Garantisi
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ISO sertifikalı
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Truck className="h-8 w-8 text-blue-600 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Hızlı Teslimat
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Türkiye geneli
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Package className="h-8 w-8 text-blue-600 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Özel Üretim
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Kişiye özel
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                Özellikler
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                Kullanım Alanları
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    Ürün Hakkında
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>
                  {product.features && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Özellikler:
                      </h4>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start text-gray-600 dark:text-gray-400"
                          >
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    Teknik Özellikler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.specifications ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          >
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {key}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      Teknik özellikler bilgisi bulunmamaktadır.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="mt-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    Kullanım Alanları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.applications ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.applications.map((application, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <Package2 className="h-5 w-5 text-blue-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {application}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* General Usage Areas based on Category */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Bu Ürünün Genel Kullanım Alanları:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.category.includes("Disc Top") && (
                            <>
                              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                <Package2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    Kozmetik Ürünleri
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Shampuan, saç kremi, duş jeli, vücut losyonu
                                    gibi kişisel bakım ürünleri için ideal.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
                                <Package2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    Temizlik Ürünleri
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sıvı deterjan, yumuşatıcı ve diğer temizlik
                                    ürünleri için uygun.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                                <Package2 className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    Endüstriyel Ürünler
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Kimyasal çözümler, yağlayıcılar ve
                                    endüstriyel sıvılar için.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700">
                                <Package2 className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    Gıda Ürünleri
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sıvı gıda katkıları, soslar ve diğer sıvı
                                    gıda ürünleri için.
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                          {/* Add more category-specific content as needed */}
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                            <Info className="h-5 w-5 mr-2 text-blue-600" />
                            Özel Kullanım Alanları
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Bu ürün, {product.material?.toLowerCase()} malzemesi
                            ve {product.size} boyutu ile çeşitli endüstriyel ve
                            ticari uygulamalarda kullanılabilir. Özel
                            projeleriniz için teknik özellikler ve uyumluluk
                            bilgileri hakkında detaylı bilgi almak üzere uzman
                            ekibimizle iletişime geçebilirsiniz.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {product.material || "Yüksek Kalite"}
                            </Badge>
                            <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              Güvenli Kullanım
                            </Badge>
                            <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                              Çevre Dostu
                            </Badge>
                            <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                              Uzun Ömürlü
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Benzer Ürünler
              </h2>
              <Link
                href={`/ambalaj?category=${encodeURIComponent(
                  product.category
                )}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm flex items-center"
              >
                Tümünü Gör
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/ambalaj/${createProductSlug(relatedProduct)}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 dark:bg-gray-700">
                    <Image
                      src={getCloudinaryUrl(relatedProduct.images[0])}
                      alt={`${relatedProduct.name}${
                        relatedProduct.size ? ` - ${relatedProduct.size}` : ""
                      }`}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {relatedProduct.inStock && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs">
                          Stokta
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        {relatedProduct.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {relatedProduct.name}
                      {relatedProduct.size && ` - ${relatedProduct.size}`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-3">
                      {relatedProduct.description}
                    </p>

                    {/* Product Details */}
                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      {relatedProduct.code && (
                        <div className="flex items-center justify-between">
                          <span>Kod:</span>
                          <span className="font-medium">
                            {relatedProduct.code}
                          </span>
                        </div>
                      )}
                      {relatedProduct.size && (
                        <div className="flex items-center justify-between">
                          <span>Boyut:</span>
                          <span className="font-medium">
                            {relatedProduct.size}
                          </span>
                        </div>
                      )}
                      {relatedProduct.material && (
                        <div className="flex items-center justify-between">
                          <span>Malzeme:</span>
                          <span className="font-medium">
                            {relatedProduct.material}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 font-medium text-sm">
                        Detayları Gör
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Bu ürün hakkında daha fazla bilgi almak ister misiniz?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Uzman ekibimiz size en uygun çözümü bulmanızda yardımcı olmaya
                  hazır. Hemen iletişime geçin ve özel teklifimizi alın.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleWhatsAppContact}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp ile İletişim
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="tel:+905315942594">
                      <Phone className="h-4 w-4 mr-2" />
                      Hemen Ara
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
