'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../../../hooks/use-admin-auth';
import { PermissionGuard } from '../../../../components/admin-route-guard';
import {
  getAllBlogCategories,
  addBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from '../../../../lib/services/blog-service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  ArrowLeftIcon,
  TagIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function BlogCategoriesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllBlogCategories();
      // "Tümü" kategorisini filtrele
      setCategories(data.filter(cat => cat.slug !== 'all'));
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value) => {
    setFormData({
      ...formData,
      name: value,
      slug: editingCategory ? formData.slug : generateSlug(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateBlogCategory(editingCategory.id, formData);
      } else {
        await addBlogCategory(formData);
      }
      
      await loadCategories();
      setDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '' });
    } catch (error) {
      console.error('Kategori kaydedilirken hata:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteBlogCategory(categoryToDelete.id);
      await loadCategories();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '' });
    setEditingCategory(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="blog.read">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/blog">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Geri
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Kategorileri</h1>
              <p className="text-gray-600">Blog kategorilerini yönetin</p>
            </div>
          </div>
          <PermissionGuard requiredPermission="blog.write">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Yeni Kategori
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory 
                      ? 'Kategori bilgilerini düzenleyin' 
                      : 'Yeni bir blog kategorisi oluşturun'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Kategori Adı</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Örn: Fason Üretim"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="Örn: fason-uretim"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        URL'de kullanılacak benzersiz tanımlayıcı
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Kategori açıklaması..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Güncelle' : 'Kaydet'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        {/* Kategoriler Tablosu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              Kategoriler ({categories.length})
            </CardTitle>
            <CardDescription>
              Blog yazılarınızı organize etmek için kategorileri yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori Adı</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Yazı Sayısı</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate text-gray-600">
                          {category.description || 'Açıklama yok'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {category.count || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                            <PermissionGuard requiredPermission="blog.write">
                              <DropdownMenuItem onClick={() => handleEdit(category)}>
                                <EditIcon className="mr-2 h-4 w-4" />
                                Düzenle
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <DropdownMenuSeparator />
                            <PermissionGuard requiredPermission="blog.delete">
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setCategoryToDelete(category);
                                  setDeleteDialogOpen(true);
                                }}
                                disabled={category.count > 0}
                              >
                                <TrashIcon className="mr-2 h-4 w-4" />
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
            {categories.length === 0 && (
              <div className="text-center py-8">
                <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz kategori yok
                </h3>
                <p className="text-gray-600 mb-4">
                  Blog yazılarınızı organize etmek için ilk kategoriyi oluşturun
                </p>
                <PermissionGuard requiredPermission="blog.write">
                  <Button onClick={() => setDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    İlk Kategoriyi Oluştur
                  </Button>
                </PermissionGuard>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Silme Onay Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kategoriyi sil</AlertDialogTitle>
              <AlertDialogDescription>
                "{categoryToDelete?.name}" kategorisini silmek istediğinizden emin misiniz?
                Bu işlem geri alınamaz. Bu kategoriye ait yazılar varsa önce onları başka 
                kategoriye taşımanız gerekir.
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
      </div>
    </PermissionGuard>
  );
}
