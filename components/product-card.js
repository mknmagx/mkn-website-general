"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Heart,
  ShoppingCart,
  Info,
  Star,
  Palette,
  Ruler,
  Package2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { motion } from "framer-motion";
import { createProductSlug } from "@/utils/slugify-tr";

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

export default function ProductCard({
  product,
  onNavigate,
  index = 0,
  isVisible = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="group"
    >
      <Card
        className="overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col relative rounded-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          {/* Product Image */}
          <div className="w-full h-full">
            {product.images && product.images[0] ? (
              <Image
                src={getProductImageSrc(product.images[0])}
                alt={product.name}
                width={400}
                height={400}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                onLoad={() => setIsImageLoaded(true)}
                onError={(e) => handleImageError(e, product.name)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {product.inStock ? (
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg text-xs font-medium px-3 py-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></div>
                Stokta
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs font-medium px-3 py-1"
              >
                Stok Yok
              </Badge>
            )}
          </div>

          {/* Category Badge - Sol Alt Köşe */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg text-xs font-medium px-3 py-1 backdrop-blur-sm">
              {product.category}
            </Badge>
          </div>

          {/* Favorilere Ekle Butonu - Hover'da Görünür */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="secondary"
              className={`h-9 w-9 rounded-full border-0 shadow-lg backdrop-blur-sm transition-all duration-200 ${
                isFavorite
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
              }`}
              onClick={handleFavoriteToggle}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite
                    ? "text-white fill-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              />
            </Button>
          </div>

          {/* Loading Animation */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="flex-grow flex flex-col p-5 space-y-4">
          {/* Product Title & Code */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {product.name}
              {(product.specifications?.size || product.size) && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {" "}
                  - {product.specifications?.size || product.size}
                </span>
              )}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                Kod: <span className="font-semibold">{product.code}</span>
              </p>
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-1">
                  <Palette className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.colors.length} Renk
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Ruler className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Boyut
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {product.specifications?.size || product.size || "N/A"}
                </p>
              </div>
            </div>

            {(product.specifications?.material || product.material) && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <Package2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Materyal
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {product.specifications?.material || product.material}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Popular Price Range */}
          {product.business?.priceRanges?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Popüler Fiyat Aralığı
              </p>
              <div className="relative bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                {/* Popular badge */}
                <div className="absolute -top-2 left-3">
                  <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🎯 En Popüler
                  </span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {(() => {
                        // Find the most popular price range (usually the middle one)
                        const popularRange =
                          product.business.priceRanges[1] ||
                          product.business.priceRanges[0];
                        const currencySymbol =
                          popularRange.currency === "USD"
                            ? "$"
                            : popularRange.currency === "EUR"
                            ? "€"
                            : "₺";
                        return popularRange.price
                          ? `${currencySymbol}${parseFloat(
                              popularRange.price
                            ).toLocaleString()}`
                          : "Teklif Al";
                      })()}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {(() => {
                        const popularRange =
                          product.business.priceRanges[1] ||
                          product.business.priceRanges[0];
                        return `${popularRange.minQuantity.toLocaleString()}-${popularRange.maxQuantity.toLocaleString()} adet`;
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      birim fiyat
                    </div>
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs font-semibold">Stokta</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Mevcut Renkler
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.colors.slice(0, 3).map((color, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 text-xs px-2 py-0.5 rounded-md"
                  >
                    {color}
                  </Badge>
                ))}
                {product.colors.length > 3 && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs px-2 py-0.5 rounded-md"
                  >
                    +{product.colors.length - 3} Daha
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="p-5 pt-0">
          <Link
            href={`/ambalaj/${createProductSlug(product)}`}
            onClick={() => onNavigate?.(product)}
            className="w-full"
          >
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 h-11 rounded-xl group">
              <span className="font-medium">Detaylı İncele</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </Link>
        </CardFooter>

        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl scale-95" />
      </Card>
    </motion.div>
  );
}
