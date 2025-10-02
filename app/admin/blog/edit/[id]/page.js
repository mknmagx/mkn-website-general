'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '../../../../../hooks/use-admin-auth';
import { PermissionGuard } from '../../../../../components/admin-route-guard';
import {
  getAllBlogCategories,
  getBlogPost,
  updateBlogPost,
} from '../../../../../lib/services/blog-service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeftIcon,
  SaveIcon,
  EyeIcon,
  LoaderIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postNotFound, setPostNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    categorySlug: '',
    author: '',
    publishedAt: '',
    readingTime: '5 dk',
    featured: false,
    image: '',
    tags: '',
    metaDescription: '',
  });

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [post, categoriesData] = await Promise.all([
        getBlogPost(params.id),
        getAllBlogCategories(),
      ]);

      if (!post) {
        setPostNotFound(true);
        return;
      }

      setCategories(categoriesData.filter(cat => cat.slug !== 'all'));
      
      // Post verilerini form'a aktar
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || '',
        categorySlug: post.categorySlug || '',
        author: post.author || '',
        publishedAt: post.publishedAt 
          ? new Date(post.publishedAt).toISOString().split('T')[0] 
          : '',
        readingTime: post.readingTime || '5 dk',
        featured: post.featured || false,
        image: post.image || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        metaDescription: post.metaDescription || '',
      });
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      setPostNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
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

  const estimateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} dk`;
  };

  const handleTitleChange = (value) => {
    setFormData({
      ...formData,
      title: value,
      // Slug'ı sadece boşsa otomatik oluştur
      ...(formData.slug === generateSlug(formData.title) && { slug: generateSlug(value) }),
    });
  };

  const handleContentChange = (value) => {
    setFormData({
      ...formData,
      content: value,
      readingTime: estimateReadingTime(value),
    });
  };

  const handleCategoryChange = (categorySlug) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    setFormData({
      ...formData,
      categorySlug,
      category: category ? category.name : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        metaDescription: formData.metaDescription || formData.excerpt,
      };
      
      await updateBlogPost(params.id, postData);
      router.push('/admin/blog');
    } catch (error) {
      console.error('Blog post güncellenirken hata:', error);
    } finally {
      setSaving(false);
    }
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

  if (postNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog yazısı bulunamadı</h1>
          <p className="text-gray-600 mb-6">Bu blog yazısı silinmiş olabilir veya ID hatalı olabilir.</p>
          <Button asChild>
            <Link href="/admin/blog">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Blog Yönetimine Dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="blog.write">
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
              <h1 className="text-3xl font-bold text-gray-900">Blog Yazısını Düzenle</h1>
              <p className="text-gray-600">"{formData.title}" yazısını düzenliyorsunuz</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/blog/${formData.slug}`} target="_blank">
                <EyeIcon className="w-4 h-4 mr-2" />
                Görüntüle
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Güncelle
                </>
              )}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ana İçerik */}
            <div className="lg:col-span-2 space-y-6">
              {/* Başlık ve Slug */}
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Blog yazısı başlığı..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="url-slug-burada-olacak"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      URL'de kullanılacak benzersiz tanımlayıcı
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Özet</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Blog yazısının kısa açıklaması..."
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* İçerik */}
              <Card>
                <CardHeader>
                  <CardTitle>İçerik</CardTitle>
                  <CardDescription>
                    HTML etiketleri kullanabilirsiniz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Blog yazısının tam içeriği... HTML etiketleri kullanabilirsiniz."
                    rows={20}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tahmini okuma süresi: {formData.readingTime}
                  </p>
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO ve Meta Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Açıklama</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="SEO için meta açıklama (boş bırakılırsa özet kullanılır)"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Etiketler</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="etiket1, etiket2, etiket3"
                    />
                    <p className="text-xs text-gray-500">
                      Virgülle ayırın
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Yan Panel */}
            <div className="space-y-6">
              {/* Yayın Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle>Yayın Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={formData.categorySlug} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Yazar</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Yayın Tarihi</Label>
                    <Input
                      id="publishedAt"
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Öne çıkan yazı</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Görsel */}
              <Card>
                <CardHeader>
                  <CardTitle>Görsel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Görsel URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formData.image && (
                    <div className="space-y-2">
                      <Label>Önizleme</Label>
                      <img
                        src={formData.image}
                        alt="Görsel önizleme"
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* İstatistikler */}
              <Card>
                <CardHeader>
                  <CardTitle>İstatistikler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kelime sayısı:</span>
                    <span className="text-sm font-medium">
                      {formData.content.split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Karakter sayısı:</span>
                    <span className="text-sm font-medium">{formData.content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Okuma süresi:</span>
                    <span className="text-sm font-medium">{formData.readingTime}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}