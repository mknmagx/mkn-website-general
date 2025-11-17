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
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuickPriceEditDialog from "@/components/admin/quick-price-edit-dialog";

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
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [priceEditProduct, setPriceEditProduct] = useState(null);

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

  const filteredProducts = products
    .filter((product) => {
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
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const formatPrice = (business) => {
    if (!business?.priceRanges || business.priceRanges.length === 0) {
      return "Fiyat belirtilmedi";
    }

    const prices = business.priceRanges
      .map((range) => range.price)
      .sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];

    if (min === max) {
      return `${min.toFixed(2)} TRY`;
    }
    return `${min.toFixed(2)} - ${max.toFixed(2)} TRY`;
  };

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

  const handlePriceSave = (updatedProduct) => {
    // Update the products list with the new price data
    setProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
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

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ürünler ({filteredProducts.length})</CardTitle>
            <CardDescription>
              Tüm ambalaj ürünlerinizi görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Görsel</TableHead>
                    <TableHead
                      className="cursor-pointer select-none min-w-48"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Ürün Adı
                        <SortIcon field="name" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none w-32"
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center">
                        Kod
                        <SortIcon field="code" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none w-36"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center">
                        Kategori
                        <SortIcon field="category" />
                      </div>
                    </TableHead>
                    <TableHead className="w-32">Boyut/Malzeme</TableHead>
                    <TableHead className="w-40">Renkler</TableHead>
                    <TableHead className="w-48">Fiyat Aralığı</TableHead>
                    <TableHead
                      className="cursor-pointer select-none w-24"
                      onClick={() => handleSort("inStock")}
                    >
                      <div className="flex items-center">
                        Durum
                        <SortIcon field="inStock" />
                      </div>
                    </TableHead>
                    <TableHead className="w-16">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={getProductImageSrc(product.images[0])}
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={(e) => handleImageError(e, product.name)}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-44 truncate" title={product.name}>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {product.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs truncate max-w-32" title={product.category}>
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-0.5 max-w-28">
                          {product.specifications?.size && (
                            <div className="text-muted-foreground truncate" title={product.specifications.size}>
                              {product.specifications.size}
                            </div>
                          )}
                          {product.specifications?.material && (
                            <div className="text-muted-foreground text-xs truncate" title={product.specifications.material}>
                              {product.specifications.material}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.colors && product.colors.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-36">
                            {product.colors.slice(0, 2).map((color, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs px-1.5 py-0 truncate max-w-20"
                                title={color}
                              >
                                {color}
                              </Badge>
                            ))}
                            {product.colors.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1.5 py-0"
                                title={`+${product.colors.length - 2} renk daha`}
                              >
                                +{product.colors.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-44">
                          <div className="text-sm font-medium truncate flex-1" title={formatPrice(product.business)}>
                            {formatPrice(product.business)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() => setPriceEditProduct(product)}
                            title="Fiyat düzenle"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.inStock ? "default" : "secondary"}
                          className={
                            product.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {product.inStock ? "Stokta" : "Stok Dışı"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Menüyü aç</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/packaging/${product.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Görüntüle
                              </Link>
                            </DropdownMenuItem>
                            <PermissionGuard requiredPermission="packaging.write">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/packaging/${product.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Düzenle
                                </Link>
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard requiredPermission="packaging.write">
                              <DropdownMenuItem
                                onClick={() => setPriceEditProduct(product)}
                              >
                                <Package className="mr-2 h-4 w-4" />
                                Fiyat Düzenle
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <DropdownMenuSeparator />
                            <PermissionGuard requiredPermission="packaging.delete">
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Bu ürünü silmek istediğinizden emin misiniz?"
                                    )
                                  ) {
                                    handleDeleteProduct(product.id);
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Sil
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
        
        {/* Quick Price Edit Dialog */}
        <QuickPriceEditDialog
          product={priceEditProduct}
          isOpen={!!priceEditProduct}
          onClose={() => setPriceEditProduct(null)}
          onSave={handlePriceSave}
        />
      </div>
    </PermissionGuard>
  );
}
