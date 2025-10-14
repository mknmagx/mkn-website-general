'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { categoryService } from '@/lib/services/packaging-service';
import { PermissionGuard } from '@/components/admin-route-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Grid3X3 } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

export default function EditCategoryPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true,
    color: '#3b82f6',
    icon: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [categorySlug, setCategorySlug] = useState('');

  // Load category data
  useEffect(() => {
    if (user && params.slug) {
      loadCategory(params.slug);
    }
  }, [user, params.slug]);

  const loadCategory = async (slug) => {
    try {
      setLoading(true);
      setCategorySlug(slug);
      
      const categoryData = await categoryService.getCategoryBySlug(slug);
      
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || '',
        sortOrder: categoryData.sortOrder || 0,
        isActive: categoryData.isActive !== false,
        color: categoryData.color || '#3b82f6',
        icon: categoryData.icon || '',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
      router.push('/admin/packaging/categories');
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kategori adı zorunludur';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Kategori adı en az 2 karakter olmalıdır';
    }

    if (formData.sortOrder < 0) {
      newErrors.sortOrder = 'Sıra numarası negatif olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Form Hataları',
        description: 'Lütfen form hatalarını düzeltin',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        sortOrder: parseInt(formData.sortOrder) || 0,
      };

      await categoryService.updateCategory(categorySlug, updateData);
      
      toast({
        title: 'Başarılı',
        description: 'Kategori başarıyla güncellendi',
      });
      
      router.push('/admin/packaging/categories');
    } catch (error) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PermissionGuard requiredPermission="packaging.write">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermission="packaging.write">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/packaging/categories">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kategori Yönetimi
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Kategori Düzenle</h1>
          <p className="text-muted-foreground">
            Kategori bilgilerini güncelleyin
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Kategori Bilgileri
            </CardTitle>
            <CardDescription>
              Kategori detaylarını güncelleyin ve kaydedin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Kategori Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Örn: Plastik Şişeler"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Kategori hakkında açıklama yazın..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sıra Numarası</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => handleChange('sortOrder', e.target.value)}
                  placeholder="0"
                  className={errors.sortOrder ? 'border-red-500' : ''}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-red-500">{errors.sortOrder}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Kategorilerin sıralanmasında kullanılır (0 = en başta)
                </p>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Kategori Rengi</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-20 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Kategorinin görsel temsilinde kullanılacak renk
                </p>
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <Label htmlFor="icon">İkon (Lucide İkon Adı)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleChange('icon', e.target.value)}
                  placeholder="Örn: Package, Box, Container"
                />
                <p className="text-sm text-muted-foreground">
                  Lucide React ikonlarından bir tanesini yazın (opsiyonel)
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Kategori aktif</Label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  asChild
                  disabled={saving}
                >
                  <Link href="/admin/packaging/categories">
                    İptal
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}