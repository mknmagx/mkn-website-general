"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../components/admin-route-guard";
import { useSocialMedia } from "../../../hooks/use-social-media";
import {
  getAllSocialPosts,
  getSocialMediaStats,
  getSocialMediaAnalytics,
  POST_STATUS,
  PLATFORMS
} from "../../../lib/services/social-media-service";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Plus,
  Edit,
  Trash2,
  Eye,
  Share2,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Download,
  MoreHorizontal,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Copy,
  Send,
  Settings
} from "lucide-react";
import Link from "next/link";

// Platform icon mapping
const PLATFORM_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: () => <span>🎵</span>
};

// Platform color mapping
const PLATFORM_COLORS = {
  instagram: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-700",
  youtube: "bg-red-600",
  tiktok: "bg-black"
};

// Status mapping
const STATUS_CONFIG = {
  [POST_STATUS.DRAFT]: {
    label: "Taslak",
    color: "bg-gray-500",
    icon: Edit
  },
  [POST_STATUS.SCHEDULED]: {
    label: "Zamanlanmış",
    color: "bg-blue-500",
    icon: Clock
  },
  [POST_STATUS.PUBLISHED]: {
    label: "Yayınlandı",
    color: "bg-green-500",
    icon: CheckCircle
  },
  [POST_STATUS.ARCHIVED]: {
    label: "Arşivlendi",
    color: "bg-gray-400",
    icon: Archive
  }
};

export default function SocialMediaDashboard() {
  const { user, loading: authLoading } = useAdminAuth();
  const { platforms } = useSocialMedia();

  // States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    platform: 'all',
    search: ''
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [postsData, statsData, analyticsData] = await Promise.all([
        getAllSocialPosts({ limit: 20 }),
        getSocialMediaStats(),
        getSocialMediaAnalytics(30)
      ]);

      setPosts(postsData);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesStatus = filters.status === 'all' || post.status === filters.status;
    const matchesPlatform = filters.platform === 'all' || post.platforms?.includes(filters.platform);
    const matchesSearch = !filters.search || 
      post.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.content?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesPlatform && matchesSearch;
  });

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Belirsiz';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  if (authLoading) return <div>Yükleniyor...</div>;

  return (
    <PermissionGuard permission="blog.read">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sosyal Medya Yönetimi</h1>
            <p className="text-gray-600 mt-2">
              AI destekli sosyal medya içerik üretimi ve yönetimi
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAnalyticsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analitikler
            </Button>
            <Link href="/admin/social-media/settings">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                AI Ayarları
              </Button>
            </Link>
            <Link href="/admin/social-media/title-library">
              <Button variant="outline" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Başlık Kütüphanesi
              </Button>
            </Link>
            <Link href="/admin/social-media/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Yeni İçerik Oluştur
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Postlar
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Şablonlar
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Kampanyalar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analitik
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900">Bir hata oluştu</p>
                  <p className="text-gray-600 mt-2">{error}</p>
                  <Button onClick={loadDashboardData} className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tekrar Dene
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Toplam Post</p>
                          <p className="text-3xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
                        </div>
                        <Share2 className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+12% bu ay</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatNumber(analytics?.totalViews || 0)}
                          </p>
                        </div>
                        <Eye className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+8% bu hafta</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Etkileşim Oranı</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {analytics?.engagementRate || 0}%
                          </p>
                        </div>
                        <Heart className="h-8 w-8 text-pink-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+5% bu ay</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Aktif Şablon</p>
                          <p className="text-3xl font-bold text-gray-900">{stats?.totalTemplates || 0}</p>
                        </div>
                        <Target className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <Plus className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-blue-600">3 yeni şablon</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <Link href="/admin/social-media/create">
                      <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Plus className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Yeni İçerik</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              AI destekli sosyal medya içeriği oluştur
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <Link href="/admin/social-media/title-library">
                      <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-3 bg-purple-100 rounded-full">
                            <Sparkles className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Başlık Kütüphanesi</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              AI başlık üretimi ve yönetimi
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <Link href="/admin/social-media/social-media-templates">
                      <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-3 bg-green-100 rounded-full">
                            <Target className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Şablonlar</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Hazır içerik şablonları
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </div>

                {/* Platform Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Performansı</CardTitle>
                      <CardDescription>
                        Platform bazında post dağılımı
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(analytics?.platformBreakdown || {}).map(([platform, count]) => {
                          const PlatformIcon = PLATFORM_ICONS[platform];
                          const total = analytics?.totalPosts || 1;
                          const percentage = ((count / total) * 100).toFixed(1);

                          return (
                            <div key={platform} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${PLATFORM_COLORS[platform]} text-white`}>
                                  {PlatformIcon && <PlatformIcon className="h-4 w-4" />}
                                </div>
                                <div>
                                  <p className="font-medium capitalize">{platform}</p>
                                  <p className="text-sm text-gray-500">{count} post</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{percentage}%</p>
                                <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                                  <div
                                    className={`h-full rounded-full ${PLATFORM_COLORS[platform]}`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>İçerik Türü Dağılımı</CardTitle>
                      <CardDescription>
                        İçerik türlerine göre post sayısı
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(analytics?.contentTypeBreakdown || {}).map(([type, count]) => {
                          const total = analytics?.totalPosts || 1;
                          const percentage = ((count / total) * 100).toFixed(1);

                          const typeLabels = {
                            promotional: 'Tanıtım',
                            educational: 'Eğitici',
                            entertainment: 'Eğlenceli',
                            news: 'Haber',
                            community: 'Topluluk',
                            other: 'Diğer'
                          };

                          const typeColors = {
                            promotional: 'bg-blue-500',
                            educational: 'bg-green-500',
                            entertainment: 'bg-purple-500',
                            news: 'bg-red-500',
                            community: 'bg-yellow-500',
                            other: 'bg-gray-500'
                          };

                          return (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${typeColors[type] || 'bg-gray-500'}`} />
                                <div>
                                  <p className="font-medium">{typeLabels[type] || type}</p>
                                  <p className="text-sm text-gray-500">{count} post</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{percentage}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Son Aktivite</CardTitle>
                    <CardDescription>
                      En son oluşturulan ve güncellenen postlar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recentActivity?.slice(0, 5).map((post) => {
                        const StatusIcon = STATUS_CONFIG[post.status]?.icon || Edit;
                        
                        return (
                          <Link key={post.id} href={`/admin/social-media/view/${post.id}`}>
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${STATUS_CONFIG[post.status]?.color} text-white`}>
                                  <StatusIcon className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{post.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {post.platforms?.map(platform => {
                                      const PlatformIcon = PLATFORM_ICONS[platform];
                                      return (
                                        <div
                                          key={platform}
                                          className={`p-1 rounded text-white text-xs ${PLATFORM_COLORS[platform]}`}
                                        >
                                          {PlatformIcon && <PlatformIcon className="h-3 w-3" />}
                                        </div>
                                      );
                                    })}
                                    <span className="text-sm text-gray-500">
                                      {formatDate(post.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`${STATUS_CONFIG[post.status]?.color} text-white`}
                              >
                                {STATUS_CONFIG[post.status]?.label}
                              </Badge>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtreler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arama
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Post ara..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durum
                    </label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tüm durumlar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm durumlar</SelectItem>
                        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                          <SelectItem key={status} value={status}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <Select value={filters.platform} onValueChange={(value) => setFilters({ ...filters, platform: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tüm platformlar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm platformlar</SelectItem>
                        {Object.entries(PLATFORMS).map(([key, platform]) => (
                          <SelectItem key={key} value={key} className="capitalize">
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ status: 'all', platform: 'all', search: '' })}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Temizle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Table */}
            <Card>
              <CardHeader>
                <CardTitle>Postlar ({filteredPosts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Platformlar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead>Etkileşim</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <Link 
                              href={`/admin/social-media/view/${post.id}`}
                              className="font-medium hover:text-blue-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {post.content?.substring(0, 80)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {post.platforms?.map(platform => {
                              const PlatformIcon = PLATFORM_ICONS[platform];
                              return (
                                <div
                                  key={platform}
                                  className={`p-1 rounded text-white ${PLATFORM_COLORS[platform]}`}
                                  title={platform}
                                >
                                  {PlatformIcon && <PlatformIcon className="h-3 w-3" />}
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${STATUS_CONFIG[post.status]?.color} text-white`}
                          >
                            {STATUS_CONFIG[post.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(post.createdAt)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(post.analytics?.views || 0)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {formatNumber(post.analytics?.likes || 0)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Direct Action Buttons */}
                            <Link href={`/admin/social-media/view/${post.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/social-media/edit/${post.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            
                            {/* More Actions Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Diğer İşlemler</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${post.title}\n\n${post.content}`);
                                  }}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Kopyala
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Sosyal Medya Şablonları</CardTitle>
                <CardDescription>
                  Hazır şablonlar ve özelleştirilebilir içerik formatları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Şablon Yönetimine Git
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Hazır şablonları kullanın veya kendiniz oluşturun.
                  </p>
                  <Link href="/admin/social-media/social-media-templates">
                    <Button>
                      <Target className="h-4 w-4 mr-2" />
                      Şablonları Yönet
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Sosyal Medya Kampanyaları</CardTitle>
                <CardDescription>
                  Koordineli kampanya yönetimi ve takibi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Kampanya Yönetimi Çok Yakında
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Koordineli kampanya oluşturma ve takip sistemi geliştiriliyor.
                  </p>
                  <Button disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Kampanya Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Detaylı Analitikler</CardTitle>
                <CardDescription>
                  Platform ve içerik performans analizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Detaylı Analitikler Çok Yakında
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Platform ve içerik performans analizi araçları geliştiriliyor.
                  </p>
                  <Button disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Rapor İndir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}