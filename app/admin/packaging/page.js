"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  packagingService,
  categoryService,
} from "@/lib/services/packaging-service";
import { PermissionGuard } from "@/components/admin-route-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  // Image load error - using fallback
  if (!e.target.src.includes("placeholder-product.jpg")) {
    e.target.src = "/placeholder-product.jpg";
  }
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function AdminPackagingPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [productsData, categoriesData] = await Promise.all([
        packagingService.getAllProducts({ isActive: true }),
        categoryService.getAllCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "in-stock" && product.inStock) ||
      (selectedStatus === "out-of-stock" && !product.inStock);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteProduct = async (productId) => {
    try {
      await packagingService.deleteProduct(productId);
      await loadData();

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla silindi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <PermissionGuard requiredPermission="packaging.view">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermission="packaging.view">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ambalaj Yönetimi</h1>
            <p className="text-muted-foreground">
              Ambalaj ürünlerini ekleyin, düzenleyin ve yönetin
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <PermissionGuard requiredPermission="packaging.categories">
              <Button asChild>
                <Link href="/admin/packaging/categories">
                  <Filter className="mr-2 h-4 w-4" />
                  Kategoriler
                </Link>
              </Button>
            </PermissionGuard>
            <PermissionGuard requiredPermission="packaging.write">
              <Button asChild>
                <Link href="/admin/packaging/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Ürün
                </Link>
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stokta</CardTitle>
              <Badge variant="outline" className="text-green-600">
                ●
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter((p) => p.inStock).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Dışı</CardTitle>
              <Badge variant="outline" className="text-red-600">
                ●
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter((p) => !p.inStock).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün adı veya kodu ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Stok durumu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="in-stock">Stokta</SelectItem>
                  <SelectItem value="out-of-stock">Stok Dışı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="p-0">
                {product.images && product.images.length > 0 ? (
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={getProductImageSrc(product.images[0])}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => handleImageError(e, product.name)}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm leading-tight">
                      {product.name}
                    </h3>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? "Stokta" : "Stok Dışı"}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Kod:</span> {product.code}
                    </p>
                    <p>
                      <span className="font-medium">Kategori:</span>{" "}
                      {product.category}
                    </p>
                    {product.specifications?.size && (
                      <p>
                        <span className="font-medium">Boyut:</span>{" "}
                        {product.specifications.size}
                      </p>
                    )}
                    {product.specifications?.material && (
                      <p>
                        <span className="font-medium">Malzeme:</span>{" "}
                        {product.specifications.material}
                      </p>
                    )}
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Renkler:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.slice(0, 2).map((color, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {color}
                          </Badge>
                        ))}
                        {product.colors.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.colors.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Link href={`/admin/packaging/${product.id}`}>
                      <Eye className="mr-1 h-3 w-3" />
                      Görüntüle
                    </Link>
                  </Button>
                  <PermissionGuard requiredPermission="packaging.write">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Link href={`/admin/packaging/${product.id}/edit`}>
                        <Edit className="mr-1 h-3 w-3" />
                        Düzenle
                      </Link>
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard requiredPermission="packaging.delete">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="px-2">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ürünü sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu ürünü silmek istediğinizden emin misiniz? Bu
                            işlem geri alınamaz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </PermissionGuard>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ürün bulunamadı</h3>
              <p className="text-muted-foreground text-center">
                Arama kriterlerinize uygun ürün bulunamadı. Filtrelerinizi
                değiştirin veya yeni ürün ekleyin.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/packaging/new">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Ürünü Ekle
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
}
