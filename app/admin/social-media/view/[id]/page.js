"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../../components/admin-route-guard";
import {
  getSocialPost,
  updateSocialPost,
  deleteSocialPost,
  POST_STATUS,
  PLATFORMS
} from "../../../../../lib/services/social-media-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Share2,
  BarChart3,
  Calendar,
  User,
  Clock,
  Target,
  Hash,
  Image as ImageIcon,
  Copy,
  Download,
  MoreHorizontal,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Send,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Star,
  Globe,
  Zap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Platform Icons
const PLATFORM_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: () => <span className="text-sm">🎵</span>,
};

// Platform Colors
const PLATFORM_COLORS = {
  instagram: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-700",
  youtube: "bg-red-600",
  tiktok: "bg-black",
};

// Status Configuration
const STATUS_CONFIG = {
  [POST_STATUS.DRAFT]: {
    label: "Taslak",
    color: "bg-gray-500",
    icon: Edit,
    textColor: "text-gray-700",
    bgColor: "bg-gray-100"
  },
  [POST_STATUS.SCHEDULED]: {
    label: "Zamanlanmış",
    color: "bg-blue-500",
    icon: Clock,
    textColor: "text-blue-700",
    bgColor: "bg-blue-100"
  },
  [POST_STATUS.PUBLISHED]: {
    label: "Yayınlandı",
    color: "bg-green-500",
    icon: CheckCircle,
    textColor: "text-green-700",
    bgColor: "bg-green-100"
  },
  [POST_STATUS.ARCHIVED]: {
    label: "Arşivlendi",
    color: "bg-gray-400",
    icon: Archive,
    textColor: "text-gray-600",
    bgColor: "bg-gray-50"
  }
};

export default function ViewSocialPostPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();
  const postId = params.id;

  // States
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Load post data
  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const postData = await getSocialPost(postId);
      if (!postData) {
        setError("Post bulunamadı");
        return;
      }
      setPost(postData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle post actions
  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      const updateData = { 
        status: newStatus,
        ...(newStatus === POST_STATUS.PUBLISHED ? { publishedAt: new Date() } : {})
      };
      await updateSocialPost(postId, updateData);
      setPost(prev => ({ ...prev, ...updateData }));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setIsPublishDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteSocialPost(postId);
      router.push('/admin/social-media');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyContent = (platform = null) => {
    if (platform && post.platformContent?.[platform]) {
      // Copy platform-specific content
      const platformData = post.platformContent[platform];
      const content = `${post.title}\n\n${platformData.content}\n\n${platformData.hashtags?.join(' ') || ''}`;
      navigator.clipboard.writeText(content);
    } else if (post.content) {
      // Legacy content format
      const content = `${post.title}\n\n${post.content}\n\n${post.hashtags?.join(' ') || ''}`;
      navigator.clipboard.writeText(content);
    } else {
      // New format - copy all platform contents
      const allContent = Object.entries(post.platformContent || {})
        .map(([platform, data]) => `=== ${platform.toUpperCase()} ===\n${data.content}\n${data.hashtags?.join(' ') || ''}`)
        .join('\n\n');
      const fullContent = `${post.title}\n\n${allContent}`;
      navigator.clipboard.writeText(fullContent);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Belirsiz';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    if (!date) return 'Belirsiz';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffInHours = (now - dateObj) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return `${Math.round(diffInHours * 60)} dakika önce`;
    if (diffInHours < 24) return `${Math.round(diffInHours)} saat önce`;
    return `${Math.round(diffInHours / 24)} gün önce`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Hata Oluştu</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => router.push('/admin/social-media')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Post Bulunamadı</h3>
              <p className="text-gray-600 mb-4">Bu post mevcut değil veya silinmiş olabilir.</p>
              <Button onClick={() => router.push('/admin/social-media')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[post.status];
  const StatusIcon = statusConfig?.icon || Eye;

  return (
    <PermissionGuard permission="blog.read">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/social-media">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                <Badge 
                  className={`${statusConfig?.color} text-white`}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig?.label}
                </Badge>
              </div>
              <p className="text-gray-600">
                {post.authorName} tarafından {formatRelativeTime(post.createdAt)} oluşturuldu
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContent}
            >
              <Copy className="h-4 w-4 mr-2" />
              Kopyala
            </Button>
            
            <Link href={`/admin/social-media/edit/${postId}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            </Link>

            {/* Status Actions */}
            {post.status === POST_STATUS.DRAFT && (
              <Button
                size="sm"
                onClick={() => setIsPublishDialogOpen(true)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Yayınla
              </Button>
            )}

            {post.status === POST_STATUS.PUBLISHED && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(POST_STATUS.ARCHIVED)}
                disabled={actionLoading}
              >
                <Archive className="h-4 w-4 mr-2" />
                Arşivle
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Post Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">📝 İçerik</TabsTrigger>
                <TabsTrigger value="media">🖼️ Medya</TabsTrigger>
                <TabsTrigger value="platforms">📱 Platformlar</TabsTrigger>
                <TabsTrigger value="analytics">📊 Analitik</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Post İçeriği
                    </CardTitle>
                    <CardDescription>
                      {post.platformContent ? 
                        "Platform bazlı optimize edilmiş içerikler" : 
                        "Genel içerik (Eski format)"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Platform-specific content or legacy content */}
                    {post.platformContent && Object.keys(post.platformContent).length > 0 ? (
                      // New format: Platform-specific content
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <Badge variant="secondary">
                            {Object.keys(post.platformContent).length} Platform
                          </Badge>
                        </div>
                        
                        {Object.entries(post.platformContent).map(([platform, platformData]) => {
                          const Icon = PLATFORM_ICONS[platform];
                          const platformColor = PLATFORM_COLORS[platform];
                          
                          return (
                            <div key={platform} className="border rounded-lg overflow-hidden">
                              {/* Platform Header */}
                              <div className={`p-4 text-white ${platformColor}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Icon className="h-6 w-6" />
                                    <div>
                                      <h4 className="font-semibold text-lg capitalize">
                                        {platform}
                                      </h4>
                                      <p className="text-white/80 text-sm">
                                        Platform özel içerik
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyContent(platform)}
                                    className="text-white hover:bg-white/20"
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Kopyala
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Platform Content */}
                              <div className="p-6 space-y-4">
                                {platformData.content && (
                                  <div>
                                    <h5 className="font-medium mb-2">İçerik</h5>
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                      <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                        {platformData.content}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Platform Hashtags */}
                                {platformData.hashtags?.length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                      <Hash className="h-4 w-4" />
                                      Hashtagler ({platformData.hashtags.length})
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {platformData.hashtags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-blue-700 bg-blue-100">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Platform Mentions */}
                                {platformData.mentions?.length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      Etiketlenenler ({platformData.mentions.length})
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {platformData.mentions.map((mention, index) => (
                                        <Badge key={index} variant="outline">
                                          @{mention}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Platform Media */}
                                {platformData.mediaUrls?.length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                      <ImageIcon className="h-4 w-4" />
                                      Medya ({platformData.mediaUrls.length})
                                    </h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {platformData.mediaUrls.slice(0, 4).map((url, idx) => (
                                        <div key={idx} className="relative">
                                          <Image
                                            src={url}
                                            alt={`${platform} medya ${idx + 1}`}
                                            width={100}
                                            height={100}
                                            className="w-full h-20 object-cover rounded"
                                          />
                                        </div>
                                      ))}
                                      {platformData.mediaUrls.length > 4 && (
                                        <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-gray-600 text-sm">
                                          +{platformData.mediaUrls.length - 4} daha
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Platform Analytics */}
                                {platformData.analytics && (
                                  <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4" />
                                      Platform Analytics
                                    </h5>
                                    <div className="grid grid-cols-3 gap-3">
                                      <div className="text-center p-2 bg-blue-50 rounded">
                                        <div className="text-lg font-semibold text-blue-900">
                                          {platformData.analytics.views || 0}
                                        </div>
                                        <div className="text-xs text-blue-600">Görüntüleme</div>
                                      </div>
                                      <div className="text-center p-2 bg-red-50 rounded">
                                        <div className="text-lg font-semibold text-red-900">
                                          {platformData.analytics.likes || 0}
                                        </div>
                                        <div className="text-xs text-red-600">Beğeni</div>
                                      </div>
                                      <div className="text-center p-2 bg-green-50 rounded">
                                        <div className="text-lg font-semibold text-green-900">
                                          {platformData.analytics.shares || 0}
                                        </div>
                                        <div className="text-xs text-green-600">Paylaşım</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Legacy format: Single content for all platforms
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Eski Format</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyContent()}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Kopyala
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-6 bg-gray-50 rounded-lg border">
                          {post.content ? (
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">İçerik bulunamadı</p>
                          )}
                        </div>

                        {/* Legacy Hashtags */}
                        {post.hashtags?.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Hashtagler ({post.hashtags.length})
                            </h4>
                            <div className="flex flex-wrap gap-2 max-w-full">
                              {post.hashtags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-blue-700 bg-blue-100 max-w-fit">
                                  <span className="truncate max-w-[120px] break-all">{tag}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Legacy Mentions */}
                        {post.mentions?.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Etiketlenenler ({post.mentions.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {post.mentions.map((mention, index) => (
                                <Badge key={index} variant="outline">
                                  @{mention}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Migration Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-900 mb-1">
                                Eski Format Tespit Edildi
                              </p>
                              <p className="text-amber-700 text-sm">
                                Bu post eski format kullanıyor. Düzenleyerek yeni platform-specific sisteme geçebilirsiniz.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Medya Dosyaları
                    </CardTitle>
                    <CardDescription>
                      Bu post ile ilgili görseller ve medya dosyaları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.mediaUrls?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {post.mediaUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={url}
                              alt={`Medya ${index + 1}`}
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => window.open(url, '_blank')}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Görüntüle
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Medya dosyası bulunmuyor</p>
                        <p>Bu post için henüz bir görsel eklenmemiş.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Platforms Tab */}
              <TabsContent value="platforms" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Platform Detayları
                    </CardTitle>
                    <CardDescription>
                      Her platform için özel optimizasyon ve önizleme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.platforms?.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {post.platforms.map((platformId) => {
                          const Icon = PLATFORM_ICONS[platformId];
                          const platformColor = PLATFORM_COLORS[platformId];
                          const platformData = post.platformContent?.[platformId];
                          const hasSpecificContent = platformData && (platformData.content || platformData.hashtags?.length > 0);
                          
                          return (
                            <div
                              key={platformId}
                              className="border rounded-xl overflow-hidden bg-white shadow-sm"
                            >
                              {/* Platform Header */}
                              <div className={`p-4 text-white ${platformColor}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                      <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-lg capitalize">{platformId}</h4>
                                      <p className="text-white/80 text-sm">
                                        {post.status === POST_STATUS.PUBLISHED ? 'Yayınlandı' : 'Beklemede'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {hasSpecificContent ? (
                                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                        Özel İçerik
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                        Standart İçerik
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Platform Content Preview */}
                              <div className="p-4 space-y-4">
                                {hasSpecificContent ? (
                                  // Platform-specific content preview
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="text-sm font-medium text-green-700">Platform Özel İçerik</span>
                                    </div>
                                    
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                      <h5 className="font-medium text-sm mb-2">{post.title}</h5>
                                      {platformData.content && (
                                        <p className="text-sm text-gray-700 line-clamp-3">
                                          {platformData.content}
                                        </p>
                                      )}
                                    </div>

                                    {platformData.hashtags?.length > 0 && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-2">Platform Hashtags:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {platformData.hashtags.slice(0, 5).map((tag, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                          {platformData.hashtags.length > 5 && (
                                            <Badge variant="outline" className="text-xs">
                                              +{platformData.hashtags.length - 5}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Character Count for Platform */}
                                    {platformData.content && (
                                      <div className="text-xs text-gray-500">
                                        Karakter sayısı: {platformData.content.length}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  // Generic content preview
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                      <span className="text-sm font-medium text-amber-700">Standart İçerik</span>
                                    </div>
                                    
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                      <h5 className="font-medium text-sm mb-2">{post.title}</h5>
                                      {post.content ? (
                                        <p className="text-sm text-gray-700 line-clamp-3">
                                          {post.content}
                                        </p>
                                      ) : (
                                        <p className="text-sm text-gray-500 italic">İçerik yok</p>
                                      )}
                                    </div>

                                    {post.hashtags?.length > 0 && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-2">Genel Hashtags:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {post.hashtags.slice(0, 5).map((tag, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                          {post.hashtags.length > 5 && (
                                            <Badge variant="outline" className="text-xs">
                                              +{post.hashtags.length - 5}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <div className="text-xs text-amber-600">
                                      Bu platform için özel içerik mevcut değil
                                    </div>
                                  </div>
                                )}

                                {/* Platform Status */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <span className="text-sm text-gray-600">Durum:</span>
                                  <div className="flex items-center gap-2">
                                    {post.status === POST_STATUS.PUBLISHED ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">Yayında</span>
                                      </>
                                    ) : post.status === POST_STATUS.SCHEDULED ? (
                                      <>
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm text-blue-600">Zamanlandı</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Beklemede</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Platform Actions */}
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyContent(platformId)}
                                    className="flex-1"
                                  >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Kopyala
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/admin/social-media/edit/${postId}`)}
                                    className="flex-1"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Düzenle
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Platform seçilmemiş</p>
                        <p>Bu post için henüz bir platform belirlenmemiş.</p>
                        <Button 
                          className="mt-4"
                          onClick={() => router.push(`/admin/social-media/edit/${postId}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Platform Ekle
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performans Analitikleri
                    </CardTitle>
                    <CardDescription>
                      Post etkileşimleri ve performans metrikleri
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.status === POST_STATUS.PUBLISHED ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Analytics Cards */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-blue-600 font-medium">Görüntülenme</p>
                              <p className="text-2xl font-bold text-blue-900">
                                {post.analytics?.views || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <Heart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-red-600 font-medium">Beğeni</p>
                              <p className="text-2xl font-bold text-red-900">
                                {post.analytics?.likes || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Share2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-green-600 font-medium">Paylaşım</p>
                              <p className="text-2xl font-bold text-green-900">
                                {post.analytics?.shares || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <MessageCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-purple-600 font-medium">Yorum</p>
                              <p className="text-2xl font-bold text-purple-900">
                                {post.analytics?.comments || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-orange-600 font-medium">Etkileşim</p>
                              <p className="text-2xl font-bold text-orange-900">
                                {Math.round((post.analytics?.engagement || 0) * 100)}%
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-500 rounded-lg">
                              <Zap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-teal-600 font-medium">Tıklama</p>
                              <p className="text-2xl font-bold text-teal-900">
                                {post.analytics?.clicks || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Analitik verisi mevcut değil</p>
                        <p>Post henüz yayınlanmadığı için analitik verisi bulunmuyor.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Post Info */}
          <div className="space-y-6">
            {/* Post Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Post Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Durum:</span>
                    <Badge className={`${statusConfig?.color} text-white`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig?.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Oluşturulma:</span>
                    <span className="text-sm text-gray-600">
                      {formatRelativeTime(post.createdAt)}
                    </span>
                  </div>

                  {post.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Son güncelleme:</span>
                      <span className="text-sm text-gray-600">
                        {formatRelativeTime(post.updatedAt)}
                      </span>
                    </div>
                  )}

                  {post.scheduledAt && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Zamanlanmış:</span>
                      <span className="text-sm text-gray-600">
                        {formatDate(post.scheduledAt)}
                      </span>
                    </div>
                  )}

                  {post.publishedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Yayın tarihi:</span>
                      <span className="text-sm text-gray-600">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Yazar:</span>
                    <span className="text-sm text-gray-600">{post.authorName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Özet İstatistik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Karakter sayısı:</span>
                    <span className="text-sm text-gray-600">
                      {(post.content?.length || 0) + (post.title?.length || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Hashtag sayısı:</span>
                    <span className="text-sm text-gray-600">
                      {post.hashtags?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Platform sayısı:</span>
                    <span className="text-sm text-gray-600">
                      {post.platforms?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Medya sayısı:</span>
                    <span className="text-sm text-gray-600">
                      {post.mediaUrls?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyContent}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  İçeriği Kopyala
                </Button>

                <Link href={`/admin/social-media/edit/${postId}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                </Link>

                {post.status === POST_STATUS.DRAFT && (
                  <Button
                    className="w-full justify-start"
                    onClick={() => setIsPublishDialogOpen(true)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Yayınla
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Postu Sil
              </DialogTitle>
              <DialogDescription>
                Bu işlem geri alınamaz. Post kalıcı olarak silinecek.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>"{post.title}"</strong> adlı post silinecek.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Sil
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Publish Confirmation Dialog */}
        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-700">
                <Send className="h-5 w-5" />
                Postu Yayınla
              </DialogTitle>
              <DialogDescription>
                Bu post seçilen platformlarda yayınlanacak.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 mb-3">
                  <strong>"{post.title}"</strong> şu platformlarda yayınlanacak:
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.platforms?.map((platformId) => {
                    const Icon = PLATFORM_ICONS[platformId];
                    return (
                      <Badge key={platformId} variant="secondary" className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {platformId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPublishDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  onClick={() => handleStatusChange(POST_STATUS.PUBLISHED)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Yayınla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}