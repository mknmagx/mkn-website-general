"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { packagingService } from "@/lib/services/packaging-service";
import { PermissionGuard } from "@/components/admin-route-guard";
import { createProductSlug } from "@/utils/slugify-tr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Cloudinary helper functions
const getCloudinaryUrl = (imageName, width = 400, height = 400) => {
  if (!imageName) return null;

  // Remove .jpg, .png, .webp extensions if they exist
  const nameWithoutExt = imageName.replace(/\.(jpg|jpeg|png|webp)$/i, "");

  return `https://res.cloudinary.com/dnfmvs2ci/image/upload/w_${width},h_${height},c_fill,g_center,f_auto,q_auto,dpr_auto/v1751736117/mkngroup/${nameWithoutExt}`;
};

const getProductImageSrc = (imageName) => {
  if (!imageName) {
    return "/placeholder-product.jpg";
  }

  // Try Cloudinary first
  return getCloudinaryUrl(imageName);
};

// Create a function to handle image errors
const handleImageError = (e, productName = "", imageIndex = "") => {
  // Image load error - using fallback
  if (!e.target.src.includes("placeholder-product.jpg")) {
    e.target.src = "/placeholder-product.jpg";
  }
};
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PackagingDetailPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params with React.use()
  const unwrappedParams = use(params);

  useEffect(() => {
    if (unwrappedParams.id) {
      loadProduct();
    }
  }, [unwrappedParams.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await packagingService.getProductById(
        unwrappedParams.id
      );
      setProduct(productData);
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      router.push("/admin/packaging");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await packagingService.deleteProduct(unwrappedParams.id);
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla silindi",
      });
      router.push("/admin/packaging");
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <PermissionGuard requiredPermission="packaging.view">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PermissionGuard>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <PermissionGuard requiredPermission="packaging.view">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">Ürün Detayları</p>
            </div>
          </div>
          <div className="flex gap-2">
            <PermissionGuard requiredPermission="packaging.write">
              <Button asChild>
                <Link href={`/admin/packaging/${unwrappedParams.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Link>
              </Button>
            </PermissionGuard>
            <PermissionGuard requiredPermission="packaging.delete">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ürünü sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri
                      alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </PermissionGuard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ürün Görselleri</CardTitle>
              </CardHeader>
              <CardContent>
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-48 bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={getProductImageSrc(image)}
                          alt={`${product.name} - ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) =>
                            handleImageError(
                              e,
                              product.name,
                              `image ${index + 1}`
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Durum:</span>
                  <Badge variant={product.inStock ? "default" : "secondary"}>
                    {product.inStock ? "Stokta" : "Stok Dışı"}
                  </Badge>
                </div>
                {product.business?.availability && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Müsaitlik:</span>
                    <Badge variant="outline">
                      {product.business.availability === "in-stock"
                        ? "Stokta Mevcut"
                        : product.business.availability}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Kod:</span>
                  <span>{product.code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Kategori:</span>
                  <span>{product.category}</span>
                </div>
                {product.description && (
                  <div>
                    <span className="font-medium">Açıklama:</span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            {(product.specifications?.size ||
              product.specifications?.debit ||
              product.specifications?.lockType ||
              product.specifications?.material) && (
              <Card>
                <CardHeader>
                  <CardTitle>Teknik Özellikler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.specifications.size && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Boyut:</span>
                      <span>{product.specifications.size}</span>
                    </div>
                  )}
                  {product.specifications.debit && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Debi:</span>
                      <span>{product.specifications.debit}</span>
                    </div>
                  )}
                  {product.specifications.lockType && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Kilit Tipi:</span>
                      <span>{product.specifications.lockType}</span>
                    </div>
                  )}
                  {product.specifications.material && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Malzeme:</span>
                      <span>{product.specifications.material}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Renk Seçenekleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <Badge key={index} variant="outline">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Keywords */}
            {product.seo?.keywords && product.seo.keywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Anahtar Kelimeler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.seo.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Information */}
            {(product.business?.minOrderQuantity ||
              product.business?.leadTime ||
              (product.business?.price !== undefined &&
                product.business?.price !== null)) && (
              <Card>
                <CardHeader>
                  <CardTitle>İş Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.business.minOrderQuantity && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Min. Sipariş Adedi:</span>
                      <span>{product.business.minOrderQuantity}</span>
                    </div>
                  )}
                  {product.business.leadTime && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Teslim Süresi:</span>
                      <span>{product.business.leadTime} gün</span>
                    </div>
                  )}
                  {product.business.price !== undefined &&
                    product.business.price !== null && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Fiyat:</span>
                        <span>
                          {product.business.price === 0
                            ? "Ücretsiz"
                            : `${product.business.price} ${product.business.currency}`}
                        </span>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* SEO Information */}
            {(product.seo?.metaTitle ||
              product.seo?.metaDescription ||
              product.seo?.slug) && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.seo.metaTitle && (
                    <div>
                      <span className="font-medium">Meta Başlık:</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.seo.metaTitle}
                      </p>
                    </div>
                  )}
                  {product.seo.metaDescription && (
                    <div>
                      <span className="font-medium">Meta Açıklama:</span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.seo.metaDescription}
                      </p>
                    </div>
                  )}
                  {product.seo.slug && (
                    <div>
                      <span className="font-medium">Kayıtlı URL Slug:</span>
                      <p className="mt-1 text-sm font-mono text-muted-foreground">
                        {product.seo.slug}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Güncel URL Slug:</span>
                    <p className="mt-1 text-sm font-mono text-blue-600">
                      {createProductSlug(product)}
                    </p>
                    {product.seo?.slug &&
                      product.seo.slug !== createProductSlug(product) && (
                        <p className="mt-1 text-xs text-amber-600">
                          ⚠️ Slug güncel değil - güncelleme gerekebilir
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Sistem Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">ID:</span>
                  <span className="text-sm font-mono">{product.id}</span>
                </div>
                {product.metadata?.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Oluşturulma:</span>
                    <span className="text-sm">
                      {new Date(
                        product.metadata.createdAt.toDate()
                      ).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                )}
                {product.metadata?.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Son Güncelleme:</span>
                    <span className="text-sm">
                      {new Date(
                        product.metadata.updatedAt.toDate()
                      ).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                )}
                {product.metadata?.version && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Versiyon:</span>
                    <span className="text-sm">{product.metadata.version}</span>
                  </div>
                )}
                {product.metadata?.source && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Kaynak:</span>
                    <span className="text-sm">{product.metadata.source}</span>
                  </div>
                )}
                {product.metadata?.isActive !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Aktif:</span>
                    <Badge
                      variant={
                        product.metadata.isActive ? "default" : "secondary"
                      }
                    >
                      {product.metadata.isActive ? "Evet" : "Hayır"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
