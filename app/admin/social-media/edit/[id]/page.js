"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "../../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../../components/admin-route-guard";
import {
  getSocialPost,
  updateSocialPost,
  createSocialPost,
  POST_STATUS,
  PLATFORMS,
} from "../../../../../lib/services/social-media-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Calendar as CalendarIcon,
  Clock,
  Target,
  Hash,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Eye,
  Sparkles,
  Type,
  Wand2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Send,
  Globe,
  AtSign,
  Bot,
  Zap,
  Lightbulb,
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Platform Icons and Configuration
const PLATFORM_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: () => <span className="text-sm">🎵</span>,
};

const PLATFORM_COLORS = {
  instagram: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-700",
  youtube: "bg-red-600",
  tiktok: "bg-black",
};

const PLATFORM_CONFIGS = {
  instagram: {
    name: "Instagram",
    maxLength: 2200,
    supportsHashtags: true,
    supportsMedia: true,
    maxHashtags: 30,
    maxImages: 10,
  },
  facebook: {
    name: "Facebook",
    maxLength: 63206,
    supportsHashtags: true,
    supportsMedia: true,
    maxHashtags: 20,
    maxImages: 10,
  },
  twitter: {
    name: "Twitter (X)",
    maxLength: 280,
    supportsHashtags: true,
    supportsMedia: true,
    maxHashtags: 10,
    maxImages: 4,
  },
  linkedin: {
    name: "LinkedIn",
    maxLength: 3000,
    supportsHashtags: true,
    supportsMedia: true,
    maxHashtags: 15,
    maxImages: 9,
  },
  youtube: {
    name: "YouTube",
    maxLength: 5000,
    supportsHashtags: true,
    supportsMedia: true,
    maxHashtags: 15,
    maxImages: 1,
  },
  tiktok: {
    name: "TikTok",
    maxLength: 2200,
    supportsHashtags: true,
    supportsMedia: true,
    maxHashtags: 20,
    maxImages: 10,
  },
};

export default function EditSocialPostPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();
  const postId = params.id;

  // States
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    hashtags: [],
    mentions: [],
    platforms: [],
    mediaUrls: [],
    status: POST_STATUS.DRAFT,
    scheduledAt: null,
    isScheduled: false,
    // New: Platform-specific content
    platformContent: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newHashtag, setNewHashtag] = useState("");

  // Load post data
  useEffect(() => {
    if (postId && postId !== "new") {
      loadPost();
    } else {
      // Initialize empty form for new post
      setFormData(prev => ({
        ...prev,
        platformContent: {}
      }));
      setLoading(false);
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await getSocialPost(postId);
      setPost(postData);

      // Initialize platform content
      let platformContent = {};
      
      if (postData.platformContent) {
        // New format: use existing platform content
        platformContent = postData.platformContent;
      } else {
        // Legacy format: convert old data to new format for selected platforms
        postData.platforms?.forEach((platform) => {
          platformContent[platform] = {
            content: postData.content || "",
            hashtags: postData.hashtags || [],
            mentions: postData.mentions || [],
            mediaUrls: postData.mediaUrls || [],
            customizations: {}
          };
        });
      }

      setFormData({
        title: postData.title || "",
        content: postData.content || "", // Keep for legacy compatibility
        hashtags: postData.hashtags || [], // Keep for legacy compatibility
        mentions: postData.mentions || [], // Keep for legacy compatibility
        platforms: postData.platforms || [],
        mediaUrls: postData.mediaUrls || [], // Keep for legacy compatibility
        status: postData.status || POST_STATUS.DRAFT,
        scheduledAt: postData.scheduledAt,
        isScheduled: !!postData.scheduledAt,
        platformContent: platformContent,
      });

      // Set active platform tab
      if (Object.keys(platformContent).length > 0) {
        setSelectedPlatform(Object.keys(platformContent)[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form updates
  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle platform-specific form updates
  const updatePlatformFormData = (platform, field, value) => {
    setFormData((prev) => ({
      ...prev,
      platformContent: {
        ...prev.platformContent,
        [platform]: {
          ...prev.platformContent[platform],
          [field]: value,
        }
      }
    }));
  };

  // Add hashtag to specific platform
  const addPlatformHashtag = (platform, hashtag) => {
    const cleanHashtag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;
    const currentHashtags = formData.platformContent[platform]?.hashtags || [];
    if (!currentHashtags.includes(cleanHashtag)) {
      updatePlatformFormData(platform, "hashtags", [...currentHashtags, cleanHashtag]);
    }
  };

  // Remove hashtag from specific platform
  const removePlatformHashtag = (platform, index) => {
    const currentHashtags = formData.platformContent[platform]?.hashtags || [];
    updatePlatformFormData(
      platform,
      "hashtags",
      currentHashtags.filter((_, i) => i !== index)
    );
  };

  // Generate content for specific platform
  const generatePlatformContent = async (platform) => {
    try {
      setIsGenerating(true);
      
      const prompt = `Generate social media content for ${PLATFORM_CONFIGS[platform].name} platform:
      
      Title: ${formData.title}
      Current content: ${formData.content || ''}
      
      Platform characteristics:
      - Max length: ${PLATFORM_CONFIGS[platform].maxLength} characters
      - Max hashtags: ${PLATFORM_CONFIGS[platform].maxHashtags}
      
      Please generate:
      1. Platform-optimized content (within character limit)
      2. Relevant hashtags (within limit)
      
      Make the content engaging and suitable for ${PLATFORM_CONFIGS[platform].name} audience.`;

      const response = await fetch('/api/admin/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          platform,
          maxLength: PLATFORM_CONFIGS[platform].maxLength,
        }),
      });

      if (!response.ok) {
        throw new Error('AI content generation failed');
      }

      const result = await response.json();
      
      // Update platform content
      updatePlatformFormData(platform, 'content', result.content);
      if (result.hashtags && Array.isArray(result.hashtags)) {
        updatePlatformFormData(platform, 'hashtags', result.hashtags);
      }

    } catch (err) {
      console.error('AI generation error:', err);
      setError('AI content generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (newStatus = null) => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        ...formData,
        status: newStatus || formData.status,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        updatedAt: new Date(),
        ...(newStatus === POST_STATUS.PUBLISHED
          ? { publishedAt: new Date() }
          : {}),
        ...(formData.isScheduled && formData.scheduledAt
          ? {
              scheduledAt: formData.scheduledAt,
              status: POST_STATUS.SCHEDULED,
            }
          : {}),
      };

      if (postId === "new") {
        // Create new post
        updateData.createdAt = new Date();
        const newPostId = await createSocialPost(updateData);
        router.push(`/admin/social-media/view/${newPostId}`);
      } else {
        // Update existing post
        await updateSocialPost(postId, updateData);
        setPost((prev) => ({ ...prev, ...updateData }));
        router.push(`/admin/social-media/view/${postId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePlatformToggle = (platform, checked) => {
    setFormData((prev) => {
      const newPlatforms = checked
        ? [...prev.platforms, platform]
        : prev.platforms.filter((p) => p !== platform);

      const newPlatformContent = { ...prev.platformContent };

      if (checked) {
        // Add platform content if it doesn't exist
        if (!newPlatformContent[platform]) {
          newPlatformContent[platform] = {
            content: prev.content || "",
            hashtags: prev.hashtags || [],
            mentions: prev.mentions || [],
            mediaUrls: prev.mediaUrls || [],
            customizations: {}
          };
        }
      } else {
        // Remove platform content
        delete newPlatformContent[platform];
      }

      return {
        ...prev,
        platforms: newPlatforms,
        platformContent: newPlatformContent,
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Post yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermissions={["social_media_write"]}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/social-media">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {postId === "new" ? "Yeni Post Oluştur" : "Post Düzenle"}
              </h1>
              <p className="text-sm text-gray-600">
                Sosyal medya içeriğini düzenleyin ve yönetin
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => handleSave()} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
            <Button 
              onClick={() => handleSave(POST_STATUS.PUBLISHED)} 
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Yayınla
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">📝 İçerik</TabsTrigger>
                <TabsTrigger value="platforms">📱 Platformlar</TabsTrigger>
                <TabsTrigger value="preview">👁️ Önizleme</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Post İçeriği
                    </CardTitle>
                    <CardDescription>
                      Post başlığı ve platform-specific içerik oluşturun
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Post Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Başlık</Label>
                      <Input
                        id="title"
                        placeholder="Post başlığını girin..."
                        value={formData.title}
                        onChange={(e) => updateFormData("title", e.target.value)}
                      />
                    </div>

                    {/* Platform Content Editor */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Platform İçerikleri</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Generate content for all platforms
                            formData.platforms.forEach(platform => {
                              if (!formData.platformContent[platform]) {
                                generatePlatformContent(platform);
                              }
                            });
                          }}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4 mr-2" />
                          )}
                          Tüm Platformlar İçin İçerik Üret
                        </Button>
                      </div>

                      {/* Platform Tabs */}
                      {formData.platforms.length > 0 ? (
                        <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
                          <TabsList className="grid w-full auto-cols-fr overflow-x-auto">
                            {formData.platforms.map((platform) => {
                              const Icon = PLATFORM_ICONS[platform];
                              return (
                                <TabsTrigger
                                  key={platform}
                                  value={platform}
                                  className="flex items-center gap-2"
                                >
                                  <Icon className="h-4 w-4" />
                                  {PLATFORM_CONFIGS[platform].name}
                                </TabsTrigger>
                              );
                            })}
                          </TabsList>

                          {formData.platforms.map((platform) => (
                            <TabsContent key={platform} value={platform} className="space-y-4">
                              <div className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium flex items-center gap-2">
                                    {React.createElement(PLATFORM_ICONS[platform], { className: "h-4 w-4" })}
                                    {PLATFORM_CONFIGS[platform].name}
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generatePlatformContent(platform)}
                                    disabled={isGenerating}
                                  >
                                    {isGenerating ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Bot className="h-4 w-4 mr-2" />
                                    )}
                                    AI İle Üret
                                  </Button>
                                </div>

                                {/* Platform Content */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label>İçerik</Label>
                                    <span className="text-xs text-gray-500">
                                      {(formData.platformContent[platform]?.content || '').length} / {PLATFORM_CONFIGS[platform].maxLength} karakter
                                    </span>
                                  </div>
                                  <Textarea
                                    placeholder={`${PLATFORM_CONFIGS[platform].name} için içerik yazın...`}
                                    value={formData.platformContent[platform]?.content || ''}
                                    onChange={(e) => updatePlatformFormData(platform, 'content', e.target.value)}
                                    rows={4}
                                    maxLength={PLATFORM_CONFIGS[platform].maxLength}
                                  />
                                </div>

                                {/* Platform Hashtags */}
                                {PLATFORM_CONFIGS[platform].supportsHashtags && (
                                  <div className="space-y-2">
                                    <Label>Hashtag'ler</Label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {(formData.platformContent[platform]?.hashtags || []).map((hashtag, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="flex items-center gap-1"
                                        >
                                          {hashtag}
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removePlatformHashtag(platform, index)}
                                          />
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="#hashtag"
                                        value={newHashtag}
                                        onChange={(e) => setNewHashtag(e.target.value)}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newHashtag.trim()) {
                                              addPlatformHashtag(platform, newHashtag.trim());
                                              setNewHashtag('');
                                            }
                                          }
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          if (newHashtag.trim()) {
                                            addPlatformHashtag(platform, newHashtag.trim());
                                            setNewHashtag('');
                                          }
                                        }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {(formData.platformContent[platform]?.hashtags || []).length} / {PLATFORM_CONFIGS[platform].maxHashtags} hashtag
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Globe className="h-8 w-8 mx-auto mb-2" />
                          <p>Önce platformları seçin</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Platforms Tab */}
              <TabsContent value="platforms" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Platform Seçimi
                    </CardTitle>
                    <CardDescription>
                      İçeriğin yayınlanacağı sosyal medya platformlarını seçin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.values(PLATFORMS).map((platform) => {
                        const Icon = PLATFORM_ICONS[platform];
                        const isSelected = formData.platforms.includes(platform);

                        return (
                          <div
                            key={platform}
                            className={cn(
                              "border rounded-lg p-4 cursor-pointer transition-all",
                              isSelected
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() =>
                              handlePlatformToggle(platform, !isSelected)
                            }
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {}}
                                className="text-blue-600"
                              />
                              <div className="flex items-center space-x-2">
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">
                                  {PLATFORM_CONFIGS[platform].name}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              Max: {PLATFORM_CONFIGS[platform].maxLength} karakter
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Post Önizlemesi
                    </CardTitle>
                    <CardDescription>
                      İçeriğinizin farklı platformlarda nasıl görüneceğini inceleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formData.platforms.length > 0 ? (
                      <div className="space-y-6">
                        {formData.platforms.map((platform) => {
                          const Icon = PLATFORM_ICONS[platform];
                          const content = formData.platformContent[platform];

                          return (
                            <div
                              key={platform}
                              className="border rounded-lg p-4 space-y-3"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                <h4 className="font-medium">
                                  {PLATFORM_CONFIGS[platform].name}
                                </h4>
                              </div>
                              
                              {content?.content && (
                                <div className="bg-gray-50 p-3 rounded border">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {content.content}
                                  </p>
                                </div>
                              )}
                              
                              {content?.hashtags?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {content.hashtags.map((hashtag, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {hashtag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p>Önizleme için platform seçin</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Durum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={POST_STATUS.DRAFT}>Taslak</SelectItem>
                    <SelectItem value={POST_STATUS.SCHEDULED}>Zamanlanmış</SelectItem>
                    <SelectItem value={POST_STATUS.PUBLISHED}>Yayında</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">İstatistikler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seçili Platformlar</span>
                    <Badge variant="secondary">{formData.platforms.length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam Hashtag</span>
                    <Badge variant="secondary">
                      {Object.values(formData.platformContent).reduce((total, content) => {
                        return total + (content.hashtags?.length || 0);
                      }, 0)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (postId === "new") {
                      handleSave();
                    } else {
                      router.push(`/admin/social-media/view/${postId}`);
                    }
                  }}
                  disabled={saving}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {postId === "new" ? "Kaydet ve Önizle" : "Önizleme"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSave()}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Taslak Kaydet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}