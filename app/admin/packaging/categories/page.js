'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { categoryService } from '@/lib/services/packaging-service';
import { PermissionGuard } from '@/components/admin-route-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, ArrowLeft, Package, Grid3X3, SortAsc } from 'lucide-react';
import Link from 'next/link';
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
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminPackagingCategoriesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load categories
  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Delete category
  const handleDeleteCategory = async (categorySlug, categoryName) => {
    try {
      // Check if category has products
      const productCount = categories.find(c => c.slug === categorySlug)?.metadata?.productCount || 0;
      
      if (productCount > 0) {
        toast({
          title: 'Uyarı',
          description: `Bu kategori ${productCount} ürün içeriyor. Önce ürünleri başka kategoriye taşıyın.`,
          variant: 'destructive',
        });
        return;
      }

      await categoryService.updateCategory(categorySlug, { 
        isActive: false,
        metadata: {
          deletedAt: new Date(),
        }
      });
      
      await loadCategories();
      toast({
        title: 'Başarılı',
        description: 'Kategori başarıyla silindi',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <PermissionGuard requiredPermission="packaging.categories">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermission="packaging.categories">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/packaging">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Ambalaj Yönetimi
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">Kategori Yönetimi</h1>
            <p className="text-muted-foreground">
              Ambalaj ürün kategorilerini ekleyin, düzenleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <PermissionGuard requiredPermission="packaging.write">
              <Button asChild>
                <Link href="/admin/packaging/categories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Kategori
                </Link>
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kategori</CardTitle>
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.reduce((sum, cat) => sum + (cat.metadata?.productCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Ürün/Kategori</CardTitle>
              <SortAsc className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.length > 0 
                  ? Math.round(categories.reduce((sum, cat) => sum + (cat.metadata?.productCount || 0), 0) / categories.length)
                  : 0
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kategori Arama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kategori adı veya açıklama ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kategoriler ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCategories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori Adı</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Ürün Sayısı</TableHead>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.metadata?.productCount || 0} ürün
                        </Badge>
                      </TableCell>
                      <TableCell>{category.sortOrder || 0}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <PermissionGuard requiredPermission="packaging.write">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/packaging/categories/${category.slug}/edit`}>
                                <Edit className="h-3 w-3 mr-1" />
                                Düzenle
                              </Link>
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard requiredPermission="packaging.delete">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled={category.metadata?.productCount > 0}
                                  className="px-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Kategoriyi sil</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{category.name}" kategorisini silmek istediğinizden emin misiniz? 
                                    Bu işlem geri alınamaz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>İptal</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteCategory(category.slug, category.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Grid3X3 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Kategori bulunamadı</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm 
                    ? 'Arama kriterlerinize uygun kategori bulunamadı.' 
                    : 'Henüz hiç kategori eklenmemiş.'
                  }
                </p>
                <Button asChild>
                  <Link href="/admin/packaging/categories/new">
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Kategoriyi Ekle
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}