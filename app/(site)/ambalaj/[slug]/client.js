"use client";

import React, { useState, useEffect } from "react";
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
import { createProductSlug, createCategorySlug } from "@/utils/slugify-tr";
import { useWhatsApp } from "@/hooks/use-whatsapp";

// Teknik özellik anahtarlarını Türkçe'ye çeviren mapping
const specificationLabels = {
  material: "Malzeme",
  size: "Boyut",
  debit: "Debi",
  lockType: "Kilit Tipi",
  colors: "Renkler",
  color: "Renk",
  code: "Ürün Kodu",
  weight: "Ağırlık",
  capacity: "Kapasite",
  dimensions: "Ölçüler",
  volume: "Hacim",
  diameter: "Çap",
  height: "Yükseklik",
  width: "Genişlik",
  length: "Uzunluk",
  thickness: "Kalınlık",
  temperature: "Sıcaklık",
  pressure: "Basınç",
  closure: "Kapak Tipi",
  thread: "Diş",
  finish: "Yüzey İşlemi",
  barrier: "Bariyer",
  compatibility: "Uyumluluk",
  certification: "Sertifika",
  brand: "Marka",
  model: "Model",
  type: "Tip",
  style: "Stil",
  shape: "Şekil",
  surface: "Yüzey",
  texture: "Doku",
};

// Teknik özellik anahtarını Türkçe'ye çeviren fonksiyon
const translateSpecKey = (key) => {
  return specificationLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

const getCloudinaryUrl = (imageName, width = 600, height = 600) => {
  if (!imageName) return null;
  // Remove .jpg, .png, .webp extensions if they exist
  const nameWithoutExt = imageName.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_${width},h_${height},c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${nameWithoutExt}`;
};

const getProductImageSrc = (imageName) => {
  if (!imageName) {
    return "/placeholder-product.jpg";
  }
  return getCloudinaryUrl(imageName);
};

// Handle image loading errors
const handleImageError = (e, productName = "") => {
  if (!e.target.src.includes("placeholder-product.jpg")) {
    e.target.src = "/placeholder-product.jpg";
  }
};

export default function ProductDetailClient({ product, relatedProducts }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { contactForProduct, makePhoneCall, getFormattedPhoneNumber } =
    useWhatsApp();

  // Sayfa yüklendiğinde sessionStorage'a işaret koy
  useEffect(() => {
    // Eğer kategori sayfasından gelindi ise işaretle
    if (sessionStorage.getItem("navigatingToProduct") === "true") {
      sessionStorage.setItem("fromProductPage", "true");
      sessionStorage.removeItem("navigatingToProduct");
    }
  }, []);
  const [activeTab, setActiveTab] = useState("overview");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Ürün verilerinden teknik özellikleri dinamik olarak oluştur
  const productSpecifications = React.useMemo(() => {
    const specs = {};

    // Mevcut specifications nesnesini ekle
    if (product.specifications && typeof product.specifications === "object") {
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (value) specs[key] = value;
      });
    }

    // Diğer ürün özelliklerini specifications'a ekle
    if (product.size && !specs.size) specs.size = product.size;
    if (product.material && !specs.material) specs.material = product.material;
    if (product.color && !specs.color) specs.color = product.color;
    if (product.colors && !specs.colors)
      specs.colors = Array.isArray(product.colors)
        ? product.colors.join(", ")
        : product.colors;
    if (product.code && !specs.code) specs.code = product.code;
    if (product.debit && !specs.debit) specs.debit = product.debit;
    if (product.lockType && !specs.lockType) specs.lockType = product.lockType;

    return specs;
  }, [product]);

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
    contactForProduct(product, productSpecifications);
  };

  const handleShare = async () => {
    const productSize = product.specifications?.size || product.size;
    const shareData = {
      title: `${product.name}${
        productSize ? ` - ${productSize}` : ""
      } | MKN Group Ambalaj`,
      text: `${
        product.description ||
        `${product.name} - ${product.category} kategorisinde profesyonel ambalaj ürünü`
      } - ${product.category} kategorisinde profesyonel ambalaj çözümleri.`,
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
      const shareUrl = encodeURIComponent(window.location.href);
      const shareTitle = encodeURIComponent(
        `${product.name}${
          productSize ? ` - ${productSize}` : ""
        } | MKN Group Ambalaj`
      );
      const shareText = encodeURIComponent(
        `${
          product.description ||
          `${product.name} - ${product.category} kategorisinde profesyonel ambalaj ürünü`
        } - ${product.category} kategorisinde profesyonel ambalaj çözümleri.`
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              ${socialOptions
                .map(
                  (option) => `
                <a href="${option.url}" target="_blank" class="flex items-center justify-center space-x-2 ${option.color} text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base">
                  <span>${option.name}</span>
                </a>
              `
                )
                .join("")}
            </div>
            <div class="mt-4 pt-4 border-t dark:border-gray-600">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <input type="text" value="${
                  window.location.href
                }" readonly class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-xs sm:text-sm dark:text-white min-w-0" id="shareUrlInput">
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
                " class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-xs sm:text-sm w-full sm:w-auto whitespace-nowrap">
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
          src: getProductImageSrc(imageName),
          alt: `${product.name}${
            product.specifications?.size || product.size
              ? ` - ${product.specifications?.size || product.size}`
              : ""
          } - ${index + 1}`,
          caption:
            index === 0
              ? `${product.name}${
                  product.specifications?.size || product.size
                    ? ` - ${product.specifications?.size || product.size}`
                    : ""
                }`
              : `${product.name}${
                  product.specifications?.size || product.size
                    ? ` - ${product.specifications?.size || product.size}`
                    : ""
                } - Görünüm ${index + 1}`,
        }))
      : [
          {
            src: getProductImageSrc("placeholder.jpg"),
            alt: `${product.name}${
              product.specifications?.size || product.size
                ? ` - ${product.specifications?.size || product.size}`
                : ""
            }`,
            caption: `${product.name}${
              product.specifications?.size || product.size
                ? ` - ${product.specifications?.size || product.size}`
                : ""
            }`,
          },
        ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 overflow-x-auto pb-1">
            <style jsx>{`
              nav::-webkit-scrollbar {
                display: none;
              }
              nav {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
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
            <Link
              href={`/ambalaj/kategori/${createCategorySlug(product.category)}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {product.name}
              {(product.specifications?.size || product.size) &&
                ` - ${product.specifications?.size || product.size}`}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/ambalaj"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 sm:p-1 -ml-2 sm:ml-0 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Ürün Listesine Dön</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Product Images */}
          <div className="xl:col-span-1 space-y-3 sm:space-y-4">
            {/* Main Image */}
            <div className="sticky top-4 sm:top-8">
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden aspect-square border border-gray-100 dark:border-gray-700 group">
                <Image
                  src={productImages[selectedImageIndex]?.src}
                  alt={productImages[selectedImageIndex]?.alt}
                  fill
                  className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                  onError={(e) => handleImageError(e, product.name)}
                />

                {/* Magical gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Click overlay for modal */}
                <div
                  className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    Büyütmek için tıklayın
                  </div>
                </div>

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
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 z-20 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIndex(
                          (selectedImageIndex + 1) % productImages.length
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 z-20 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {productImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {selectedImageIndex + 1}/{productImages.length}
                  </div>
                )}

                {/* Image Indicators */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`h-2 w-8 rounded-full transition-all duration-200 ${
                          index === selectedImageIndex
                            ? "bg-blue-600 dark:bg-blue-400"
                            : "bg-white/50 dark:bg-gray-400/50 hover:bg-white/70 dark:hover:bg-gray-400/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Compact Thumbnail Grid */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {productImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden aspect-square border-2 transition-all duration-200 hover:scale-105 ${
                        index === selectedImageIndex
                          ? "border-blue-500 shadow-lg shadow-blue-500/25"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {image.src ? (
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-contain p-1"
                          sizes="(max-width: 768px) 25vw, 8vw"
                          onError={(e) => handleImageError(e, product.name)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal for enlarged view */}
            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
              <DialogContent className="max-w-6xl w-full p-0 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                <DialogHeader className="sr-only">
                  <DialogTitle>Ürün Görseli</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-square">
                  <Image
                    src={productImages[selectedImageIndex]?.src}
                    alt={productImages[selectedImageIndex]?.alt}
                    fill
                    className="object-contain p-4"
                    sizes="90vw"
                    onError={(e) => handleImageError(e, product.name)}
                  />
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
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6 text-white" />
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            (selectedImageIndex + 1) % productImages.length
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6 text-white" />
                      </button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Center & Right Columns - Product Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Product Header Card */}
            <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 border-0 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1 text-sm font-medium"
                      >
                        {product.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          Stokta Mevcut
                        </span>
                      </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                      {product.name}
                      {(product.specifications?.size || product.size) && (
                        <span className="block text-lg sm:text-xl lg:text-2xl text-blue-600 dark:text-blue-400 font-normal mt-2">
                          {product.specifications?.size || product.size}
                        </span>
                      )}
                    </h1>

                    <div className="mb-4 sm:mb-6 max-w-2xl">
                      <p
                        className={`text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed transition-all duration-300 ${
                          !isDescriptionExpanded ? "line-clamp-3" : ""
                        }`}
                      >
                        {product.description}
                      </p>
                      {product.description &&
                        product.description.length > 150 && (
                          <button
                            onClick={() =>
                              setIsDescriptionExpanded(!isDescriptionExpanded)
                            }
                            className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors flex items-center"
                          >
                            {isDescriptionExpanded
                              ? "Daha az göster"
                              : "Devamını oku"}
                            <ChevronRight
                              className={`h-4 w-4 ml-1 transition-transform duration-300 ${
                                isDescriptionExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                        )}
                    </div>

                    {/* Product Features */}
                    {product.features && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {product.features.slice(0, 4).map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 rounded-lg px-3 py-2 backdrop-blur-sm"
                          >
                            <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-sm font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Specs */}
                    {Object.keys(productSpecifications).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {Object.entries(productSpecifications)
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="text-center bg-white/50 dark:bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm"
                            >
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                {translateSpecKey(key)}
                              </div>
                              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {value}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-start space-x-1 sm:space-x-2 ml-2 sm:ml-4 lg:ml-6 flex-shrink-0 min-w-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="p-2 sm:p-3 border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-500 transition-all duration-300 min-w-0 w-10 h-10 sm:w-12 sm:h-12"
                    >
                      <Heart
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="p-2 sm:p-3 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 min-w-0 w-10 h-10 sm:w-12 sm:h-12"
                    >
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </div>
                </div>

                {/* Main CTA */}
                <div className="space-y-4">
                  <Button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white shadow-xl shadow-green-500/25 transform hover:scale-[1.02] transition-all duration-300 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                    size="lg"
                  >
                    <MessageCircle className="h-6 w-6 mr-3" />
                    WhatsApp'dan Hemen Satın Al
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleDownloadCatalog}
                      variant="outline"
                      className="flex items-center justify-center border-blue-200 hover:text-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 py-2 sm:py-3 text-sm sm:text-base"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Katalog İndir
                    </Button>
                    <Button
                      onClick={makePhoneCall}
                      variant="outline"
                      className="flex items-center justify-center border-purple-200 hover:text-purple-500 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 py-2 sm:py-3 text-sm sm:text-base"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Hemen Ara
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Section - Redesigned */}
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 sm:py-6 rounded-t-2xl">
                <CardTitle className="flex items-center justify-center text-lg sm:text-xl font-bold mb-2">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  <span className="text-center">
                    Fiyat Aralıkları & Sipariş Miktarları
                  </span>
                </CardTitle>
                <p className="text-green-100 text-sm text-center">
                  💰 Sipariş miktarınıza göre en uygun fiyatı alın
                </p>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {product.business?.priceRanges?.length > 0 ? (
                    product.business.priceRanges.map((range, index) => {
                      const isPopular = index === 1;
                      const currencySymbol =
                        range.currency === "USD"
                          ? "$"
                          : range.currency === "EUR"
                          ? "€"
                          : "₺";

                      return (
                        <div
                          key={index}
                          className={`relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
                            isPopular
                              ? "ring-2 sm:ring-4 ring-green-500 dark:ring-green-400 shadow-2xl shadow-green-500/20 scale-105"
                              : "shadow-lg hover:shadow-xl transition-shadow"
                          }`}
                        >
                          {isPopular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                                🎯 En Popüler
                              </Badge>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                              {range.minQuantity.toLocaleString()}-
                              {range.maxQuantity.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                              adet sipariş
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                              {index === 0
                                ? "✨ Küçük Sipariş"
                                : index === 1
                                ? "🚀 Orta Sipariş"
                                : "💎 Toptan Sipariş"}
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {range.price
                                ? `${currencySymbol}${parseFloat(
                                    range.price
                                  ).toLocaleString()}`
                                : "Teklif Alın"}
                            </div>
                            {range.price && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                birim fiyat
                              </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {index === 0
                                  ? "Hızlı başlangıç için ideal"
                                  : index === 1
                                  ? "En çok tercih edilen"
                                  : "Maksimum tasarruf"}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Fallback to default ranges
                    <>
                      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                            50-500
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                            adet sipariş
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                            ✨ Küçük Sipariş
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Teklif Alın
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Hızlı başlangıç için ideal
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 ring-2 sm:ring-4 ring-green-500 dark:ring-green-400 shadow-2xl shadow-green-500/20 scale-105">
                        <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold shadow-lg">
                            🎯 En Popüler
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                            500-2,000
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                            adet sipariş
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                            🚀 Orta Sipariş
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            İndirimli Fiyat
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              En çok tercih edilen
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                            2,000-5,000
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                            adet sipariş
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                            💎 Toptan Sipariş
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            En İyi Fiyat
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Maksimum tasarruf
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-center text-blue-800 dark:text-blue-200">
                    <Info className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium text-center">
                      <strong>5000+ adet siparişler</strong> için özel indirimli
                      fiyat teklifi.
                      <br />
                      WhatsApp üzerinden iletişime geçin ve en uygun fiyatı
                      alın.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators - Redesigned */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/25 mx-auto w-fit">
                      <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                        Kalite Garantisi
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        ISO sertifikalı üretim
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/25 mx-auto w-fit">
                      <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                        Hızlı Teslimat
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Türkiye geneli 1-3 gün
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg shadow-purple-500/25 mx-auto w-fit">
                      <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                        Özel Üretim
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Kişiye özel tasarım
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Specifications - Always Open */}
            {Object.keys(productSpecifications).length > 4 && (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Info className="h-5 w-5 mr-3" />
                    🔧 Detaylı Teknik Özellikler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(productSpecifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {translateSpecKey(key)}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 font-semibold">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usage Areas Card */}
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  <Package2 className="h-5 w-5 mr-3" />
                  🎯 Kullanım Alanları
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {product.applications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {product.applications.map((application, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow"
                      >
                        <Package2 className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {application}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Category-specific Applications */}
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                        {product.name} için En Uygun Kullanım Alanları
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {product.category.includes("Disc Top") && (
                          <>
                            <div className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/20 p-6 rounded-2xl border border-pink-200 dark:border-pink-700 hover:shadow-lg transition-all hover:scale-105">
                              <div className="flex items-center space-x-4">
                                <div className="bg-pink-500 p-3 rounded-xl">
                                  <Package2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                                    💄 Kozmetik Ürünleri
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Şampuan, saç kremi, duş jeli, vücut losyonu
                                    gibi kişisel bakım ürünleri için ideal
                                    çözüm.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all hover:scale-105">
                              <div className="flex items-center space-x-4">
                                <div className="bg-green-500 p-3 rounded-xl">
                                  <Package2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                                    🧽 Temizlik Ürünleri
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sıvı deterjan, yumuşatıcı ve ev temizlik
                                    ürünleri için güvenli paketleme.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all hover:scale-105">
                              <div className="flex items-center space-x-4">
                                <div className="bg-purple-500 p-3 rounded-xl">
                                  <Package2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                                    ⚗️ Endüstriyel Ürünler
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Kimyasal çözümler, yağlayıcılar ve
                                    endüstriyel sıvılar için profesyonel
                                    ambalajlama.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all hover:scale-105">
                              <div className="flex items-center space-x-4">
                                <div className="bg-orange-500 p-3 rounded-xl">
                                  <Package2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                                    🍯 Gıda Ürünleri
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sıvı gıda katkıları, soslar ve güvenli gıda
                                    paketleme çözümleri.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Special Usage Information */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-700">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center text-xl">
                        <Info className="h-6 w-6 mr-3 text-indigo-600" />
                        💡 Özel Kullanım Önerileri
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            Bu ürün,{" "}
                            <strong>
                              {productSpecifications.material?.toLowerCase()}
                            </strong>{" "}
                            malzemesi ve{" "}
                            <strong>{productSpecifications.size}</strong> boyutu
                            ile çeşitli endüstriyel ve ticari uygulamalarda
                            güvenle kullanılabilir.
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Özel projeleriniz için teknik özellikler ve
                            uyumluluk bilgileri hakkında detaylı bilgi almak
                            üzere uzman ekibimizle iletişime geçebilirsiniz.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 text-sm">
                            🔬{" "}
                            {productSpecifications.material || "Yüksek Kalite"}
                          </Badge>
                          <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 text-sm">
                            ✅ Güvenli Kullanım
                          </Badge>
                          <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-4 py-2 text-sm">
                            🌱 Çevre Dostu
                          </Badge>
                          <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-4 py-2 text-sm">
                            ⏰ Uzun Ömürlü
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products Section - Modern Design */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                🔗 Benzer Ürünler
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Aynı kategoride bulunan diğer kaliteli ürünlerimizi keşfedin
              </p>
              <Link
                href={`/ambalaj/kategori/${createCategorySlug(
                  product.category
                )}`}
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm mt-4 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full transition-colors"
              >
                Tümünü Gör
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/ambalaj/${createProductSlug(relatedProduct)}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden hover:scale-105"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <Image
                      src={getCloudinaryUrl(relatedProduct.images[0])}
                      alt={`${relatedProduct.name}${
                        relatedProduct.size ? ` - ${relatedProduct.size}` : ""
                      }`}
                      fill
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {relatedProduct.inStock && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 text-white text-xs font-bold shadow-lg">
                          ✓ Stokta
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-6">
                    <div className="mb-2 sm:mb-3">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium"
                      >
                        {relatedProduct.category}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-2 mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {relatedProduct.name}
                      {relatedProduct.size && (
                        <span className="block text-xs text-gray-500 dark:text-gray-400 font-normal mt-1">
                          {relatedProduct.size}
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-4">
                      {relatedProduct.description}
                    </p>

                    {/* Product Quick Details */}
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {relatedProduct.code && (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                          <span>Kod:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {relatedProduct.code}
                          </span>
                        </div>
                      )}
                      {(relatedProduct.material ||
                        relatedProduct.specifications?.material) && (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                          <span>Malzeme:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {relatedProduct.material ||
                              relatedProduct.specifications?.material}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 font-semibold text-sm bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg transition-colors">
                        Detayları İncele
                        <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section - Redesigned */}
        <div className="mt-12 sm:mt-16 mb-6 sm:mb-8">
          <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
            <CardContent className="relative p-8 sm:p-12">
              {/* Background decorations */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90"></div>
              <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/5 rounded-full -translate-y-24 sm:-translate-y-48 translate-x-24 sm:translate-x-48"></div>
              <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/5 rounded-full translate-y-24 sm:translate-y-48 -translate-x-24 sm:-translate-x-48"></div>

              <div className="relative text-center space-y-4 sm:space-y-6 text-white">
                <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-white/20 rounded-full backdrop-blur-sm mb-3 sm:mb-4">
                  <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  Bu ürün hakkında daha fazla bilgi almak ister misiniz?
                </h3>
                <p className="text-blue-100 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
                  Uzman ekibimiz size en uygun çözümü bulmanızda yardımcı olmaya
                  hazır. Özel fiyat tekliflerimizi kaçırmayın ve hemen iletişime
                  geçin.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6">
                  <Button
                    onClick={handleWhatsAppContact}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/25 transform hover:scale-105 transition-all duration-300 py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg font-semibold"
                    size="lg"
                  >
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    <span className="text-center">
                      WhatsApp ile Hemen İletişim
                    </span>
                  </Button>
                  <Button
                    onClick={makePhoneCall}
                    variant="outline"
                    className="border-2 border-white text-blue-500 hover:bg-white hover:text-blue-700 transition-all duration-300 py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg font-semibold backdrop-blur-sm"
                    size="lg"
                  >
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    <span className="text-center">
                      Hemen Ara: {getFormattedPhoneNumber()}
                    </span>
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 pt-6 sm:pt-8 text-blue-200">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      Ücretsiz Danışmanlık
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      Hızlı Yanıt Garantisi
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">
                      Özel Fiyat Teklifi
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
