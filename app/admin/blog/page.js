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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-lg"></div>
          <p className="mt-6 text-slate-700 text-lg font-medium">
            Blog verileriniz yükleniyor...
          </p>
          <p className="mt-2 text-slate-500 text-sm">Lütfen bekleyiniz</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="blog.read">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Blog Yönetim Merkezi
                </h1>
                <p className="text-slate-600 text-lg">
                  Blog yazılarınızı ve kategorilerinizi kolayca yönetin
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <PermissionGuard requiredPermission="blog.write">
                  <Button
                    asChild
                    variant="outline"
                    className="bg-white/60 hover:bg-white/80 border-slate-200 shadow-sm transition-all duration-200"
                  >
                    <Link href="/admin/blog/title-management">
                      <Database className="mr-2 h-4 w-4 text-blue-600" />
                      Title Management
                    </Link>
                  </Button>
                </PermissionGuard>
                <PermissionGuard requiredPermission="blog.write">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200"
                  >
                    <Link href="/admin/blog/categories">
                      <TagIcon className="mr-2 h-4 w-4" />
                      Kategoriler
                    </Link>
                  </Button>
                </PermissionGuard>
                <PermissionGuard requiredPermission="blog.write">
                  <Button
                    asChild
                    variant="outline"
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-purple-200 shadow-sm transition-all duration-200"
                  >
                    <Link href="/admin/blog/ai-generator">
                      <SparklesIcon className="mr-2 h-4 w-4 text-purple-600" />
                      AI Blog Üretici
                    </Link>
                  </Button>
                </PermissionGuard>
                <PermissionGuard requiredPermission="blog.write">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg transition-all duration-200"
                  >
                    <Link href="/admin/blog/new">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Yeni Yazı
                    </Link>
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Toplam Yazı
                </CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileTextIcon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">
                  {stats.totalPosts || 0}
                </div>
                <p className="text-sm text-blue-600 mt-1">Yayınlanmış içerik</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Kategoriler
                </CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <TagIcon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">
                  {stats.totalCategories || 0}
                </div>
                <p className="text-sm text-purple-600 mt-1">Aktif kategori</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Öne Çıkan
                </CardTitle>
                <div className="p-2 bg-amber-500 rounded-lg">
                  <StarIcon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">
                  {stats.featuredPosts || 0}
                </div>
                <p className="text-sm text-amber-600 mt-1">Özel içerik</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Bu Ay
                </CardTitle>
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-700">
                  {stats.publishedThisMonth || 0}
                </div>
                <p className="text-sm text-emerald-600 mt-1">Yeni yayın</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtreler */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <SearchIcon className="mr-3 h-5 w-5 text-blue-600" />
                Arama ve Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Arama
                  </Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Başlık veya içerik ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-slate-50/50 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64 space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Kategori
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="rounded-lg">
                        Tüm Kategoriler
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.slug}
                          value={category.slug}
                          className="rounded-lg"
                        >
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
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                    <FileTextIcon className="mr-3 h-5 w-5 text-blue-600" />
                    Blog Yazıları
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Toplam {filteredPosts.length} yazı görüntüleniyor
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {filteredPosts.length} yazı
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="text-slate-700 font-semibold">
                        Başlık
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold">
                        Kategori
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold">
                        Yazar
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold">
                        Yayın Tarihi
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold">
                        Durum
                      </TableHead>
                      <TableHead className="text-right text-slate-700 font-semibold">
                        İşlemler
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post, index) => (
                      <TableRow
                        key={post.id}
                        className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white/50" : "bg-slate-50/30"
                        }`}
                      >
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-800 hover:text-blue-600 transition-colors duration-200">
                              {post.title}
                            </div>
                            <div className="text-sm text-slate-600 truncate max-w-md leading-relaxed">
                              {post.excerpt}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 font-medium"
                          >
                            {post.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium">
                          {post.author}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatDate(post.publishedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {post.featured && (
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200"
                              >
                                <StarIcon className="w-3 h-3 mr-1" />
                                Öne Çıkan
                              </Badge>
                            )}
                            <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                              Yayında
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-9 w-9 p-0 hover:bg-slate-100 rounded-lg transition-all duration-200"
                              >
                                <MoreVerticalIcon className="h-4 w-4 text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-xl shadow-xl border-slate-200"
                            >
                              <DropdownMenuLabel className="text-slate-700 font-semibold">
                                İşlemler
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                asChild
                                className="rounded-lg hover:bg-blue-50"
                              >
                                <Link
                                  href={`/blog/${post.slug}`}
                                  target="_blank"
                                  className="flex items-center text-blue-600"
                                >
                                  <EyeIcon className="mr-2 h-4 w-4" />
                                  Görüntüle
                                </Link>
                              </DropdownMenuItem>
                              <PermissionGuard requiredPermission="blog.write">
                                <DropdownMenuItem
                                  asChild
                                  className="rounded-lg hover:bg-emerald-50"
                                >
                                  <Link
                                    href={`/admin/blog/edit/${post.id}`}
                                    className="flex items-center text-emerald-600"
                                  >
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
                                  className="rounded-lg hover:bg-orange-50 text-orange-600"
                                >
                                  <Eraser className="mr-2 h-4 w-4" />
                                  İçeriği Temizle
                                </DropdownMenuItem>
                              </PermissionGuard>
                              <DropdownMenuSeparator />
                              <PermissionGuard requiredPermission="blog.delete">
                                <DropdownMenuItem
                                  className="text-red-600 rounded-lg hover:bg-red-50"
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
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-red-200 shadow-2xl rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold text-red-800 flex items-center">
                  <TrashIcon className="mr-3 h-6 w-6 text-red-600" />
                  Blog yazısını sil
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
                  <span className="font-semibold text-slate-800">
                    "{postToDelete?.title}"
                  </span>{" "}
                  adlı blog yazısını silmek istediğinizden emin misiniz?
                  <br />
                  <span className="text-red-600 font-medium">
                    Bu işlem geri alınamaz.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 rounded-xl transition-all duration-200">
                  İptal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePost}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg transition-all duration-200"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </PermissionGuard>
  );
}
