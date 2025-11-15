"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../components/admin-route-guard";
import {
  getAllBlogPosts,
  getAllBlogCategories,
  deleteBlogPost,
  getBlogStats,
  cleanBlogPostContent,
} from "../../../lib/services/blog-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  SearchIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  FileTextIcon,
  TagIcon,
  CalendarIcon,
  TrendingUpIcon,
  StarIcon,
  SparklesIcon,
  Database,
  Eraser,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../hooks/use-toast";

export default function AdminBlogPage() {
  const { user, loading: authLoading, permissions } = useAdminAuth();
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Veri yükleme
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData, statsData] = await Promise.all([
        getAllBlogPosts(),
        getAllBlogCategories(),
        getBlogStats(),
      ]);

      setBlogPosts(postsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Blog post silme
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await deleteBlogPost(postToDelete.id);
      setBlogPosts((posts) =>
        posts.filter((post) => post.id !== postToDelete.id)
      );
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Blog post silinirken hata:", error);
    }
  };

  // Blog post content temizleme
  const handleCleanContent = async (postId, postTitle) => {
    try {
      await cleanBlogPostContent(postId);
      // Veriyi yenile
      await loadData();

      // Başarılı mesajı göster
      toast({
        title: "İçerik temizlendi",
        description: `"${postTitle}" blog yazısının içeriği JSON artifact'larından temizlendi.`,
      });
    } catch (error) {
      console.error("Content temizlenirken hata:", error);
      toast({
        title: "Hata",
        description: "Content temizlenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Filtreleme
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.categorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (date) => {
    if (!date) return "Tarih yok";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("tr-TR");
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Yönetimi</h1>
            <p className="text-gray-600">
              Blog yazılarını ve kategorileri yönetin
            </p>
          </div>
          <div className="flex gap-3">
            <PermissionGuard requiredPermission="blog.write">
              <Button asChild variant="outline">
                <Link href="/admin/blog/title-management">
                  <Database className="mr-2 h-4 w-4" />
                  Title Management
                </Link>
              </Button>
            </PermissionGuard>
            <PermissionGuard requiredPermission="blog.write">
              <Button asChild>
                <Link href="/admin/blog/categories">
                  <TagIcon className="mr-2 h-4 w-4" />
                  Kategoriler
                </Link>
              </Button>
            </PermissionGuard>
            <PermissionGuard requiredPermission="blog.write">
              <Button asChild variant="outline">
                <Link href="/admin/blog/ai-generator">
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  AI Blog Üretici
                </Link>
              </Button>
            </PermissionGuard>
            <PermissionGuard requiredPermission="blog.write">
              <Button asChild>
                <Link href="/admin/blog/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Yeni Yazı
                </Link>
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Yazı</CardTitle>
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
              <TagIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCategories || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Öne Çıkan</CardTitle>
              <StarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.featuredPosts || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.publishedThisMonth || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtreler */}
        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Arama</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Başlık veya içerik ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog Postları Tablosu */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Yazıları ({filteredPosts.length})</CardTitle>
            <CardDescription>
              Tüm blog yazılarını görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Yazar</TableHead>
                    <TableHead>Yayın Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {post.excerpt}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{formatDate(post.publishedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {post.featured && (
                            <Badge variant="secondary">
                              <StarIcon className="w-3 h-3 mr-1" />
                              Öne Çıkan
                            </Badge>
                          )}
                          <Badge variant="default">Yayında</Badge>
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
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${post.slug}`} target="_blank">
                                <EyeIcon className="mr-2 h-4 w-4" />
                                Görüntüle
                              </Link>
                            </DropdownMenuItem>
                            <PermissionGuard requiredPermission="blog.write">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/blog/edit/${post.id}`}>
                                  <EditIcon className="mr-2 h-4 w-4" />
                                  Düzenle
                                </Link>
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard requiredPermission="blog.write">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCleanContent(post.id, post.title)
                                }
                              >
                                <Eraser className="mr-2 h-4 w-4" />
                                İçeriği Temizle
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <DropdownMenuSeparator />
                            <PermissionGuard requiredPermission="blog.delete">
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setPostToDelete(post);
                                  setDeleteDialogOpen(true);
                                }}
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
          </CardContent>
        </Card>

        {/* Silme Onay Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Blog yazısını sil</AlertDialogTitle>
              <AlertDialogDescription>
                "{postToDelete?.title}" adlı blog yazısını silmek istediğinizden
                emin misiniz? Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
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
