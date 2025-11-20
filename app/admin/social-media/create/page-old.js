"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import { useSocialMedia } from "../../../../hooks/use-social-media";
import { useSmartImageSelection } from "../../../../hooks/use-smart-image-selection";
import { useTitleGenerator } from "../../../../hooks/use-title-generator";
import {
  createSocialPost,
  POST_STATUS,
} from "../../../../lib/services/social-media-service";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  Loader2,
  Save,
  Send,
  Eye,
  Calendar,
  Target,
  Hash,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Bot,
  Lightbulb,
  TrendingUp,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Copy,
  Download,
  Upload,
  Search,
  Trash2,
  Edit,
  Heart,
  Share2,
  MessageCircle,
  BarChart3,
  Zap,
  Palette,
  Type,
  Star,
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

export default function CreateSocialPostPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const {
    platforms,
    contentTypes,
    contentTones,
    generateSocialContent,
    generateHashtags,
    getPlatformRecommendations,
    loading: socialLoading,
  } = useSocialMedia();
  const {
    searchImages,
    selectBestImage,
    loading: imageLoading,
  } = useSmartImageSelection();

  const {
    generateTitles,
    optimizeTitle,
    analyzeTitle,
    saveTitle,
    savedTitles,
    companyContext,
    titleCategories,
    titleTones,
    getSuggestedTopics,
    generateTrendingTopics,
    loadSavedTitles,
    loading: titleLoading,
  } = useTitleGenerator();

  // Form States
  const [activeTab, setActiveTab] = useState("setup");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    platforms: [],
    contentType: "",
    tone: "professional",
    hashtags: [],
    mentions: [],
    mediaUrls: [],
    scheduledAt: null,
    status: POST_STATUS.DRAFT,
  });

  // AI Generation States
  const [aiConfig, setAiConfig] = useState({
    topic: "",
    targetAudience: "B2B",
    includeHashtags: true,
    includeEmojis: true,
    creativity: 70,
    brandContext: "",
    additionalInstructions: "",
  });

  // Title Generation States
  const [titleConfig, setTitleConfig] = useState({
    category: "educational",
    tone: "professional",
    businessArea: "all",
    count: 10,
    useCustomTopic: false,
    customTopic: "",
  });
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedTitles, setSelectedTitles] = useState(new Set());
  const [selectedTitlesForSaving, setSelectedTitlesForSaving] = useState(
    new Set()
  );
  const [showTitleGenerator, setShowTitleGenerator] = useState(false);
  const [showSavedTitles, setShowSavedTitles] = useState(false);
  const [titleGenerating, setTitleGenerating] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);

  // Title generation config
  const [generateConfig, setGenerateConfig] = useState({
    topic: "general",
    tone: "professional",
    platform: "all",
    useCustomTopic: false,
    customTopic: "",
  });

  // Generated Content States
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState([]);
  const [platformRecommendations, setPlatformRecommendations] = useState([]);

  // Image States
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [imageSearchResults, setImageSearchResults] = useState([]);

  // Other States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreviewPlatform, setSelectedPreviewPlatform] = useState(null);

  // Load platform recommendations when content type changes
  useEffect(() => {
    if (formData.contentType) {
      const recommendations = getPlatformRecommendations(
        formData.contentType,
        aiConfig.targetAudience
      );
      setPlatformRecommendations(recommendations);
    }
  }, [
    formData.contentType,
    aiConfig.targetAudience,
    getPlatformRecommendations,
  ]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle AI config changes
  const handleAiConfigChange = (field, value) => {
    setAiConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Character count calculator for different platforms
  const getCharacterCount = (text, platformId) => {
    const limits = {
      twitter: 280,
      linkedin: 3000,
      facebook: 63206,
      instagram: 2200,
      youtube: 5000,
      tiktok: 2200,
    };

    const limit = limits[platformId] || 2200;
    const current = text.length;
    const percentage = (current / limit) * 100;

    return { current, limit, percentage };
  };

  // Handle title config changes
  const handleTitleConfigChange = (field, value) => {
    setTitleConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Generate AI titles
  const handleGenerateTitles = async () => {
    const topic = generateConfig.useCustomTopic
      ? generateConfig.customTopic
      : generateConfig.topic;

    if (!topic?.trim()) {
      setError("Lütfen bir konu belirtin");
      return;
    }

    setTitleGenerating(true);

    try {
      setError(null);

      const titles = await generateTitles({
        topic: topic,
        tone: generateConfig.tone,
        platform:
          generateConfig.platform === "all" ? null : generateConfig.platform,
        count: 8,
        contentType: "social_media",
        additionalContext: aiConfig.brandContext,
      });

      setGeneratedTitles(titles);
      setSelectedTitlesForSaving(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setTitleGenerating(false);
    }
  };

  // Select title
  // Select title as main title
  const handleSelectTitle = (title) => {
    setSelectedTitle(title);
    setFormData((prev) => ({
      ...prev,
      title: title.text,
    }));

    // Ana konu'yu otomatik doldur - başlığın topic'ini alıp aiConfig'e set et
    if (title.topic && title.topic.trim()) {
      setAiConfig((prev) => ({
        ...prev,
        topic: title.topic,
      }));
    }

    // Dialog'ları kapat
    setShowTitleGenerator(false);
    setShowSavedTitles(false);

    // Kullanım kaydı
    if (title.id) {
      // recordTitleUsage burada çağrılabilir
    }
  };

  // Save title to database
  const handleSaveTitle = async (title) => {
    try {
      await saveTitle({
        ...title,
        createdBy: user?.email || "anonymous",
        isFavorite: false,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle title selection
  const handleToggleTitleSelection = (titleIndex) => {
    setSelectedTitles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(titleIndex)) {
        newSet.delete(titleIndex);
      } else {
        newSet.add(titleIndex);
      }
      return newSet;
    });
  };

  // Select all titles
  const handleSelectAllTitles = () => {
    if (selectedTitles.size === generatedTitles.length) {
      setSelectedTitles(new Set());
    } else {
      setSelectedTitles(new Set(generatedTitles.map((_, index) => index)));
    }
  };

  // Save selected titles
  const handleSaveSelectedTitles = async () => {
    const titlesToSave = generatedTitles.filter((_, index) =>
      selectedTitles.has(index)
    );
    for (const title of titlesToSave) {
      await handleSaveTitle(title);
    }
  };

  // Toggle platform selection
  const togglePlatform = (platformId) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  // Generate AI content
  const handleGenerateContent = async () => {
    if (!aiConfig.topic.trim()) {
      setError("Lütfen bir konu belirtin");
      return;
    }

    if (formData.platforms.length === 0) {
      setError("Lütfen en az bir platform seçin");
      return;
    }

    try {
      setError(null);

      // Generate content for the first selected platform
      const primaryPlatform = formData.platforms[0];

      const content = await generateSocialContent({
        platform: primaryPlatform,
        contentType: formData.contentType,
        topic: aiConfig.topic,
        tone: formData.tone,
        includeHashtags: aiConfig.includeHashtags,
        includeEmojis: aiConfig.includeEmojis,
        targetAudience: aiConfig.targetAudience,
        brandContext: aiConfig.brandContext,
        additionalInstructions: aiConfig.additionalInstructions,
      });

      setGeneratedContent(content);
      setFormData((prev) => ({
        ...prev,
        content: content,
      }));

      // Generate hashtags if needed
      if (aiConfig.includeHashtags) {
        const hashtags = await generateHashtags(
          aiConfig.topic,
          primaryPlatform,
          10
        );
        setGeneratedHashtags(hashtags);
        setFormData((prev) => ({
          ...prev,
          hashtags: [
            ...prev.hashtags,
            ...hashtags.filter((tag) => !prev.hashtags.includes(tag)),
          ],
        }));
      }

      setActiveTab("content");
    } catch (err) {
      setError(err.message);
    }
  };

  // Search and select images
  const handleImageSearch = async () => {
    if (!imageSearchQuery.trim()) return;

    try {
      const results = await searchImages(imageSearchQuery, 12);
      setImageSearchResults(results);
    } catch (err) {
      setError("Görsel arama hatası: " + err.message);
    }
  };

  // Select image
  const handleSelectImage = (image) => {
    if (!selectedImages.find((img) => img.id === image.id)) {
      setSelectedImages((prev) => [...prev, image]);
      setFormData((prev) => ({
        ...prev,
        mediaUrls: [...prev.mediaUrls, image.webformatURL],
      }));
    }
  };

  // Remove selected image
  const handleRemoveImage = (imageId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
    const removedImage = selectedImages.find((img) => img.id === imageId);
    if (removedImage) {
      setFormData((prev) => ({
        ...prev,
        mediaUrls: prev.mediaUrls.filter(
          (url) => url !== removedImage.webformatURL
        ),
      }));
    }
  };

  // Add custom hashtag
  const addHashtag = (hashtag) => {
    const cleanHashtag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;
    if (!formData.hashtags.includes(cleanHashtag)) {
      setFormData((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, cleanHashtag],
      }));
    }
  };

  // Remove hashtag
  const removeHashtag = (hashtag) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((tag) => tag !== hashtag),
    }));
  };

  // Save post
  const handleSavePost = async (status = POST_STATUS.DRAFT) => {
    try {
      setLoading(true);

      const postData = {
        ...formData,
        status,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdBy: user.email,
      };

      const postId = await createSocialPost(postData);

      router.push(`/admin/social-media`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard permission="blog.write">
      <TooltipProvider>
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
                <h1 className="text-3xl font-bold text-gray-900">
                  Yeni Sosyal Medya İçeriği
                </h1>
                <p className="text-gray-600 mt-1">
                  AI destekli içerik üretimi ile profesyonel sosyal medya
                  postları oluşturun
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(true)}
                disabled={!formData.content}
              >
                <Eye className="h-4 w-4 mr-2" />
                Önizle
              </Button>
              <Button
                onClick={() => handleSavePost(POST_STATUS.DRAFT)}
                disabled={loading || !formData.title}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Taslak Kaydet
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-800">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                ✕
              </Button>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="setup">🎯 Kurulum</TabsTrigger>
                  <TabsTrigger value="content">📝 İçerik</TabsTrigger>
                  <TabsTrigger value="media">🖼️ Medya</TabsTrigger>
                  <TabsTrigger value="preview">👁️ Önizleme</TabsTrigger>
                  <TabsTrigger value="publish">🚀 Yayın</TabsTrigger>
                </TabsList>

                {/* Setup Tab */}
                <TabsContent value="setup" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        İçerik Yapılandırması
                      </CardTitle>
                      <CardDescription>
                        AI'nın size mükemmel içerik üretebilmesi için gerekli
                        bilgileri sağlayın
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Post Başlığı *</Label>
                          <div className="flex gap-2">
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) =>
                                handleInputChange("title", e.target.value)
                              }
                              placeholder="Postunuzun başlığını yazın, AI ile üretin veya kaydedilmiş başlık seçin"
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowSavedTitles(true)}
                                    className="px-3"
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Kaydedilmiş Başlıklar
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowTitleGenerator(true)}
                                    disabled={!selectedTitle && !aiConfig.topic}
                                    className="px-3"
                                  >
                                    <Sparkles className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>AI Başlık Üret</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          {selectedTitle && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-green-800 font-medium text-sm">
                                    ✓ Seçilen Başlık Kullanılıyor
                                  </p>
                                  <p className="text-green-600 text-xs mt-1">
                                    {selectedTitle.text}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTitle(null);
                                    setFormData((prev) => ({
                                      ...prev,
                                      title: "",
                                    }));
                                    // Ana konuyu temizleme - kullanıcı seçebilir
                                    // setAiConfig(prev => ({ ...prev, topic: "" }));
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="topic">
                            Ana Konu {!selectedTitle && "*"}
                          </Label>
                          <Input
                            id="topic"
                            value={aiConfig.topic}
                            onChange={(e) =>
                              handleAiConfigChange("topic", e.target.value)
                            }
                            placeholder={
                              selectedTitle
                                ? "Otomatik dolduruldu (düzenleyebilirsiniz)"
                                : "Postun ana konusunu belirtin (gerekli)"
                            }
                            className={
                              selectedTitle
                                ? "bg-green-50 border-green-300"
                                : ""
                            }
                          />
                          {selectedTitle && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Seçili başlıktan otomatik dolduruldu
                            </p>
                          )}
                          {!selectedTitle && (
                            <p className="text-xs text-gray-500 mt-1">
                              AI içerik üretimi için ana konu gereklidir
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content Type & Tone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contentType">İçerik Türü *</Label>
                          <Select
                            value={formData.contentType}
                            onValueChange={(value) =>
                              handleInputChange("contentType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="İçerik türünü seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(contentTypes).map(
                                ([key, type]) => (
                                  <SelectItem key={key} value={key}>
                                    {type.name} - {type.description}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tone">Ton & Stil</Label>
                          <Select
                            value={formData.tone}
                            onValueChange={(value) =>
                              handleInputChange("tone", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Ton seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(contentTones).map(
                                ([key, tone]) => (
                                  <SelectItem key={key} value={key}>
                                    {tone.name} - {tone.description}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div>
                        <Label htmlFor="audience">Hedef Kitle</Label>
                        <Select
                          value={aiConfig.targetAudience}
                          onValueChange={(value) =>
                            handleAiConfigChange("targetAudience", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Hedef kitle seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="B2B">
                              İşletmeler (B2B)
                            </SelectItem>
                            <SelectItem value="B2C">
                              Bireysel Müşteriler (B2C)
                            </SelectItem>
                            <SelectItem value="genel">Genel Kitle</SelectItem>
                            <SelectItem value="uzman">
                              Uzman/Teknik Kitle
                            </SelectItem>
                            <SelectItem value="genç">
                              Genç Kitle (18-30)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Platform Selection */}
                      <div>
                        <Label>Platform Seçimi *</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {Object.entries(platforms).map(([key, platform]) => {
                            const isSelected = formData.platforms.includes(key);
                            const Icon = PLATFORM_ICONS[key];

                            return (
                              <div
                                key={key}
                                className={`
                                  relative border-2 rounded-lg p-4 cursor-pointer transition-all
                                  ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }
                                `}
                                onClick={() => togglePlatform(key)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`p-2 rounded ${PLATFORM_COLORS[key]} text-white`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {platform.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {platform.charLimit} karakter
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Platform Recommendations */}
                      {platformRecommendations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            AI Platform Önerileri
                          </h4>
                          <div className="space-y-2">
                            {platformRecommendations.map((rec) => {
                              const Icon = PLATFORM_ICONS[rec.platform];
                              return (
                                <div
                                  key={rec.platform}
                                  className="flex items-center gap-3"
                                >
                                  <div
                                    className={`p-1 rounded ${
                                      PLATFORM_COLORS[rec.platform]
                                    } text-white`}
                                  >
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {rec.name}
                                    </p>
                                    <p className="text-xs text-blue-700">
                                      {rec.reasons.join(", ")}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">
                                    {rec.score}/5
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* AI Settings */}
                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          AI Ayarları
                        </h4>

                        {/* Title Generation Info */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Akıllı Başlık Üretimi
                          </h5>
                          <p className="text-green-700 text-sm mb-3">
                            MKN Group'un iş dallarını ve uzmanlık alanlarını
                            analiz ederek, hedef kitlenize uygun etkili
                            başlıklar üretir.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-600">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>SEO optimize başlıklar</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Sektör odaklı içerik</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Hedef kitle analizi</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Marka değerleri uyumu</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Hashtag Dahil Et</Label>
                              <p className="text-sm text-gray-500">
                                Relevant hashtagler eklensin
                              </p>
                            </div>
                            <Switch
                              checked={aiConfig.includeHashtags}
                              onCheckedChange={(checked) =>
                                handleAiConfigChange("includeHashtags", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Emoji Dahil Et</Label>
                              <p className="text-sm text-gray-500">
                                Uygun emojiler eklensin
                              </p>
                            </div>
                            <Switch
                              checked={aiConfig.includeEmojis}
                              onCheckedChange={(checked) =>
                                handleAiConfigChange("includeEmojis", checked)
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label>
                            Yaratıcılık Seviyesi: {aiConfig.creativity}%
                          </Label>
                          <Slider
                            value={[aiConfig.creativity]}
                            onValueChange={(value) =>
                              handleAiConfigChange("creativity", value[0])
                            }
                            max={100}
                            step={10}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Konservatif</span>
                            <span>Yaratıcı</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="brandContext">
                            Marka Bağlamı (Opsiyonel)
                          </Label>
                          <Textarea
                            id="brandContext"
                            value={aiConfig.brandContext}
                            onChange={(e) =>
                              handleAiConfigChange(
                                "brandContext",
                                e.target.value
                              )
                            }
                            placeholder="Bu post için özel marka mesajları veya vurgulanması gereken noktalar..."
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="additionalInstructions">
                            Ek Talimatlar (Opsiyonel)
                          </Label>
                          <Textarea
                            id="additionalInstructions"
                            value={aiConfig.additionalInstructions}
                            onChange={(e) =>
                              handleAiConfigChange(
                                "additionalInstructions",
                                e.target.value
                              )
                            }
                            placeholder="AI'ya özel talimatlar, kaçınması gereken konular, vb..."
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Generate Button */}
                      <div className="flex justify-end">
                        <Button
                          onClick={handleGenerateContent}
                          disabled={
                            socialLoading ||
                            (!selectedTitle && !aiConfig.topic) ||
                            formData.platforms.length === 0
                          }
                          className="flex items-center gap-2"
                        >
                          {socialLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {socialLoading
                            ? "İçerik Üretiliyor..."
                            : "AI ile İçerik Üret"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        İçerik Düzenleme
                      </CardTitle>
                      <CardDescription>
                        Üretilen içeriği düzenleyin ve optimize edin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Content Editor */}
                      <div>
                        <Label htmlFor="content">Post İçeriği *</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) =>
                            handleInputChange("content", e.target.value)
                          }
                          placeholder="Post içeriğinizi yazın veya AI ile üretilen içeriği düzenleyin..."
                          rows={10}
                          className="mt-2"
                        />

                        {/* Character count for each platform */}
                        {formData.platforms.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {formData.platforms.map((platformId) => {
                              const charCount = getCharacterCount(
                                formData.content,
                                platformId
                              );
                              const isOverLimit = charCount.percentage > 100;
                              const platform = platforms[platformId];
                              const Icon = PLATFORM_ICONS[platformId];

                              return (
                                <div
                                  key={platformId}
                                  className="flex items-center gap-3 text-sm"
                                >
                                  <div
                                    className={`p-1 rounded ${PLATFORM_COLORS[platformId]} text-white`}
                                  >
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <span className="font-medium">
                                    {platform.name}:
                                  </span>
                                  <span
                                    className={
                                      isOverLimit
                                        ? "text-red-600"
                                        : "text-gray-600"
                                    }
                                  >
                                    {charCount.current} / {charCount.limit}
                                  </span>
                                  <div className="flex-1 max-w-32">
                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                      <div
                                        className={`h-2 rounded-full ${
                                          isOverLimit
                                            ? "bg-red-500"
                                            : "bg-green-500"
                                        }`}
                                        style={{
                                          width: `${Math.min(
                                            charCount.percentage,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Hashtag Management */}
                      <div>
                        <Label>Hashtagler</Label>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2 mb-3 max-w-full">
                            {formData.hashtags.map((hashtag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-2 max-w-fit"
                              >
                                <span className="truncate max-w-[100px] break-all">{hashtag}</span>
                                <button
                                  onClick={() => removeHashtag(hashtag)}
                                  className="text-gray-500 hover:text-red-500 flex-shrink-0"
                                >
                                  ✕
                                </button>
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="#hashtag ekle"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  addHashtag(e.target.value);
                                  e.target.value = "";
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (formData.platforms.length > 0) {
                                  generateHashtags(
                                    aiConfig.topic,
                                    formData.platforms[0],
                                    5
                                  ).then((hashtags) => {
                                    hashtags.forEach((tag) => addHashtag(tag));
                                  });
                                }
                              }}
                              disabled={
                                socialLoading || !formData.platforms.length
                              }
                            >
                              <Hash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* AI Optimization Tools */}
                      <Separator />

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleGenerateContent}
                          disabled={socialLoading}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Yeniden Üret
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Platform bazlı optimizasyon
                            console.log("Platform optimizasyonu");
                          }}
                          disabled={socialLoading}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Optimize Et
                        </Button>
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
                        Canlı Önizleme
                      </CardTitle>
                      <CardDescription>
                        İçeriğinizin tüm platformlardaki görünümü
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {formData.platforms.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Platform Seçin
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Önizleme görüntülemek için en az bir platform seçin
                          </p>
                          <Button onClick={() => setActiveTab("setup")}>
                            Kuruluma Git
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Platform Previews */}
                          <div className="grid gap-6">
                            {formData.platforms.map((platformId) => {
                              const platform = platforms[platformId];
                              const Icon = PLATFORM_ICONS[platformId];
                              const platformColor = PLATFORM_COLORS[platformId];
                              const charCount = getCharacterCount(
                                formData.title,
                                formData.content
                              );
                              const isOverLimit =
                                platformId === "twitter" && charCount > 280;

                              return (
                                <div
                                  key={platformId}
                                  className="border rounded-xl overflow-hidden bg-white shadow-sm"
                                >
                                  {/* Platform Header */}
                                  <div
                                    className={`${platformColor} text-white px-6 py-4`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                          <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <h3 className="font-semibold">
                                            {platform.name}
                                          </h3>
                                          <p className="text-sm opacity-80">
                                            Post önizlemesi
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div
                                          className={`text-sm ${
                                            isOverLimit
                                              ? "bg-red-500 text-white"
                                              : "bg-white/20"
                                          } px-2 py-1 rounded`}
                                        >
                                          {charCount} /{" "}
                                          {platformId === "twitter"
                                            ? "280"
                                            : "∞"}
                                        </div>
                                        {isOverLimit && (
                                          <p className="text-xs mt-1 text-red-200">
                                            Limit aşıldı!
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Content Preview */}
                                  <div className="p-6">
                                    <div className="space-y-4">
                                      {/* Title */}
                                      {formData.title && (
                                        <div>
                                          <h4 className="font-bold text-lg text-gray-900 leading-tight">
                                            {formData.title}
                                          </h4>
                                        </div>
                                      )}

                                      {/* Content */}
                                      {formData.content && (
                                        <div>
                                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {formData.content}
                                          </p>
                                        </div>
                                      )}

                                      {/* Images */}
                                      {selectedImages.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                          {selectedImages
                                            .slice(0, 4)
                                            .map((image) => (
                                              <div
                                                key={image.id}
                                                className="relative"
                                              >
                                                <Image
                                                  src={image.webformatURL}
                                                  alt="Preview"
                                                  width={200}
                                                  height={150}
                                                  className="w-full h-32 object-cover rounded-lg"
                                                />
                                                {selectedImages.length > 4 &&
                                                  image ===
                                                    selectedImages[3] && (
                                                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                                      <span className="text-white font-bold">
                                                        +
                                                        {selectedImages.length -
                                                          3}
                                                      </span>
                                                    </div>
                                                  )}
                                              </div>
                                            ))}
                                        </div>
                                      )}

                                      {/* Hashtags - Fixed overflow */}
                                      {formData.hashtags.length > 0 && (
                                        <div className="mt-4">
                                          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto max-w-full">
                                            {formData.hashtags.map(
                                              (tag, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="secondary"
                                                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs px-2 py-1 flex-shrink-0 max-w-fit"
                                                >
                                                  <span className="truncate max-w-[80px] break-all">{tag}</span>
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                          {formData.hashtags.length > 10 && (
                                            <p className="text-xs text-gray-500 mt-2">
                                              {formData.hashtags.length} hashtag
                                              toplam
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex justify-center gap-3 pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={() => setIsPreviewOpen(true)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Detaylı Önizleme
                            </Button>
                            <Button
                              onClick={() => setActiveTab("publish")}
                              className="flex items-center gap-2"
                              disabled={
                                !formData.title ||
                                !formData.content ||
                                formData.platforms.length === 0
                              }
                            >
                              <Send className="h-4 w-4" />
                              Yayınlamaya Git
                            </Button>
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
                        Medya Yönetimi
                      </CardTitle>
                      <CardDescription>
                        Görseller ekleyin, arayın veya AI ile oluşturun
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Image Search */}
                      <div>
                        <Label htmlFor="imageSearch">Görsel Arama</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="imageSearch"
                            value={imageSearchQuery}
                            onChange={(e) =>
                              setImageSearchQuery(e.target.value)
                            }
                            placeholder="Aranacak görsel konusunu yazın..."
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleImageSearch();
                              }
                            }}
                          />
                          <Button
                            onClick={handleImageSearch}
                            disabled={imageLoading || !imageSearchQuery}
                          >
                            {imageLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Selected Images */}
                      {selectedImages.length > 0 && (
                        <div>
                          <Label>
                            Seçilen Görseller ({selectedImages.length})
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                            {selectedImages.map((image) => (
                              <div key={image.id} className="relative group">
                                <Image
                                  src={image.webformatURL}
                                  alt="Selected image"
                                  width={200}
                                  height={150}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => handleRemoveImage(image.id)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Image Search Results */}
                      {imageSearchResults.length > 0 && (
                        <div>
                          <Label>Arama Sonuçları</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-64 overflow-y-auto">
                            {imageSearchResults.map((image) => {
                              const isSelected = selectedImages.find(
                                (img) => img.id === image.id
                              );

                              return (
                                <div
                                  key={image.id}
                                  className={`relative cursor-pointer group border-2 rounded-lg ${
                                    isSelected
                                      ? "border-blue-500"
                                      : "border-transparent"
                                  }`}
                                  onClick={() => handleSelectImage(image)}
                                >
                                  <Image
                                    src={image.webformatURL}
                                    alt="Search result"
                                    width={200}
                                    height={150}
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                                      <CheckCircle className="h-6 w-6 text-blue-500" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Manual Upload */}
                      <Separator />

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Manuel Görsel Yükleme
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Bilgisayarınızdan görsel yükleyin
                        </p>
                        <Button disabled>
                          <Upload className="h-4 w-4 mr-2" />
                          Dosya Seç (Yakında)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Publish Tab */}
                <TabsContent value="publish" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Yayın Ayarları
                      </CardTitle>
                      <CardDescription>
                        Post yayın zamanını ve durumunu belirleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Publishing Options */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="immediate"
                            checked={formData.status === POST_STATUS.PUBLISHED}
                            onCheckedChange={(checked) => {
                              handleInputChange(
                                "status",
                                checked
                                  ? POST_STATUS.PUBLISHED
                                  : POST_STATUS.DRAFT
                              );
                              if (checked)
                                handleInputChange("scheduledAt", null);
                            }}
                          />
                          <Label htmlFor="immediate">Hemen Yayınla</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="scheduled"
                            checked={formData.status === POST_STATUS.SCHEDULED}
                            onCheckedChange={(checked) => {
                              handleInputChange(
                                "status",
                                checked
                                  ? POST_STATUS.SCHEDULED
                                  : POST_STATUS.DRAFT
                              );
                            }}
                          />
                          <Label htmlFor="scheduled">Zamanla</Label>
                        </div>
                      </div>

                      {/* Schedule Date/Time */}
                      {formData.status === POST_STATUS.SCHEDULED && (
                        <div>
                          <Label htmlFor="scheduledDate">
                            Yayın Tarihi ve Saati
                          </Label>
                          <Input
                            id="scheduledDate"
                            type="datetime-local"
                            value={formData.scheduledAt || ""}
                            onChange={(e) =>
                              handleInputChange("scheduledAt", e.target.value)
                            }
                            className="mt-2"
                          />
                        </div>
                      )}

                      {/* Final Review */}
                      <Separator />

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Son Kontrol</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Başlık:</span>
                            <span
                              className={
                                formData.title
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {formData.title ? "✓ Tanımlandı" : "✗ Eksik"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>İçerik:</span>
                            <span
                              className={
                                formData.content
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {formData.content ? "✓ Hazır" : "✗ Eksik"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform:</span>
                            <span
                              className={
                                formData.platforms.length > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {formData.platforms.length > 0
                                ? `✓ ${formData.platforms.length} platform`
                                : "✗ Seçilmedi"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Medya:</span>
                            <span className="text-blue-600">
                              {selectedImages.length} görsel
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleSavePost(POST_STATUS.DRAFT)}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Taslak Kaydet
                        </Button>
                        <Button
                          onClick={() => handleSavePost(formData.status)}
                          disabled={
                            loading || !formData.title || !formData.content
                          }
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          {formData.status === POST_STATUS.PUBLISHED
                            ? "Yayınla"
                            : formData.status === POST_STATUS.SCHEDULED
                            ? "Zamanla"
                            : "Kaydet"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Preview & Tips */}
            <div className="space-y-6">
              {/* Live Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5" />
                    Canlı Önizleme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.platforms.length > 0 && formData.content ? (
                    <div className="space-y-4">
                      {formData.platforms.map((platformId) => {
                        const platform = platforms[platformId];
                        const Icon = PLATFORM_ICONS[platformId];
                        const charCount = getCharacterCount(
                          formData.content,
                          platformId
                        );

                        return (
                          <div
                            key={platformId}
                            className={`border rounded-lg p-4 ${
                              charCount.percentage > 100
                                ? "border-red-300"
                                : "border-gray-200"
                            }`}
                          >
                            <div
                              className={`flex items-center gap-2 mb-3 ${PLATFORM_COLORS[platformId]} text-white p-2 rounded`}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="font-medium text-sm">
                                {platform.name}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">{formData.title}</h4>
                              <p className="text-sm whitespace-pre-wrap">
                                {formData.content.substring(
                                  0,
                                  platform.charLimit
                                )}
                                {formData.content.length > platform.charLimit &&
                                  "..."}
                              </p>

                              {formData.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {formData.hashtags
                                    .slice(0, platform.hashtagLimit)
                                    .map((tag, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                </div>
                              )}

                              {selectedImages.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {selectedImages.slice(0, 4).map((image) => (
                                    <Image
                                      key={image.id}
                                      src={image.webformatURL}
                                      alt="Preview"
                                      width={100}
                                      height={75}
                                      className="w-full h-16 object-cover rounded"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Platform seçin ve içerik ekleyin
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5" />
                    AI İpuçları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-900">
                          Akıllı Başlık Üretimi
                        </p>
                        <p className="text-purple-700">
                          Başlık kutusundaki ✨ butonuna tıklayarak MKN Group'a
                          özel başlıklar üretin. Her iş alanı için optimize
                          edilmiştir.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">
                          Etkili İçerik İçin
                        </p>
                        <p className="text-blue-700">
                          Konunuzu net ve spesifik belirtin. "Ambalaj çözümleri"
                          yerine "Sürdürülebilir kozmetik ambalajları" gibi.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">
                          Platform Optimizasyonu
                        </p>
                        <p className="text-green-700">
                          Her platform için içeriği optimize edin. LinkedIn daha
                          profesyonel, Instagram daha görsel odaklı olmalı.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <Target className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900">
                          Hedef Kitle
                        </p>
                        <p className="text-orange-700">
                          B2B içerik için teknik detaylar, B2C için fayda odaklı
                          yaklaşım kullanın.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Hızlı İstatistik
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Karakter Sayısı:</span>
                      <span className="font-medium">
                        {formData.content.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Başlık Uzunluğu:</span>
                      <span className="font-medium">
                        {formData.title.length}
                        {selectedTitle && (
                          <span className="text-green-600 ml-1">
                            (AI: {selectedTitle.category})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hashtag Sayısı:</span>
                      <span className="font-medium">
                        {formData.hashtags.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Sayısı:</span>
                      <span className="font-medium">
                        {formData.platforms.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Görsel Sayısı:</span>
                      <span className="font-medium">
                        {selectedImages.length}
                      </span>
                    </div>

                    {/* Title Analysis */}
                    {selectedTitle && (
                      <div className="pt-3 border-t">
                        <p className="font-medium text-blue-900 mb-2">
                          Başlık Analizi
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Kategori:</span>
                            <span className="font-medium">
                              {titleCategories[selectedTitle.category]?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ton:</span>
                            <span className="font-medium">
                              {titleTones[selectedTitle.tone]?.name}
                            </span>
                          </div>
                          {selectedTitle.businessArea && (
                            <div className="flex justify-between">
                              <span>İş Alanı:</span>
                              <span className="font-medium">
                                {
                                  companyContext.businessAreas.find(
                                    (a) => a.id === selectedTitle.businessArea
                                  )?.name
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Title Generator Dialog */}
          <Dialog
            open={showTitleGenerator}
            onOpenChange={setShowTitleGenerator}
          >
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Başlık Üretici
                </DialogTitle>
                <DialogDescription>
                  MKN Group'un iş dalları ve uzmanlık alanlarına uygun başlıklar
                  üretin
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Title Generation Config */}
                <div className="space-y-4">
                  {/* Topic Selection */}
                  <div className="space-y-3">
                    <Label>Konu Seçimi *</Label>

                    {/* Topic Type Selection */}
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="predefined-topic"
                          name="topicType"
                          checked={!titleConfig.useCustomTopic}
                          onChange={() =>
                            setTitleConfig((prev) => ({
                              ...prev,
                              useCustomTopic: false,
                              customTopic: "",
                            }))
                          }
                          className="text-blue-600"
                        />
                        <label
                          htmlFor="predefined-topic"
                          className="text-sm font-medium"
                        >
                          Hazır Konular
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="custom-topic"
                          name="topicType"
                          checked={titleConfig.useCustomTopic}
                          onChange={() =>
                            setTitleConfig((prev) => ({
                              ...prev,
                              useCustomTopic: true,
                            }))
                          }
                          className="text-blue-600"
                        />
                        <label
                          htmlFor="custom-topic"
                          className="text-sm font-medium"
                        >
                          Ana Konu (Manuel)
                        </label>
                      </div>
                    </div>

                    {/* Predefined Topics */}
                    {!titleConfig.useCustomTopic && (
                      <div className="space-y-3">
                        <Select
                          value={aiConfig.topic}
                          onValueChange={(value) =>
                            handleAiConfigChange("topic", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Hazır konulardan seçin..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {companyContext.predefinedTopics.map(
                              (categoryGroup) => (
                                <div key={categoryGroup.category}>
                                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 bg-gray-50">
                                    {categoryGroup.category === "ambalaj" &&
                                      "📦 Ambalaj"}
                                    {categoryGroup.category ===
                                      "kozmetik-uretim" && "🧴 Kozmetik Üretim"}
                                    {categoryGroup.category === "e-ticaret" &&
                                      "🛒 E-ticaret"}
                                    {categoryGroup.category === "pazarlama" &&
                                      "📱 Pazarlama"}
                                    {categoryGroup.category === "genel" &&
                                      "🏢 Genel"}
                                    {categoryGroup.category === "trend" &&
                                      "📈 Trend & İnovasyon"}
                                  </div>
                                  {categoryGroup.topics.map((topic) => (
                                    <SelectItem key={topic} value={topic}>
                                      {topic}
                                    </SelectItem>
                                  ))}
                                </div>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Custom Topic Input */}
                    {titleConfig.useCustomTopic && (
                      <div>
                        <Label htmlFor="custom-topic-input">Ana Konu</Label>
                        <Input
                          id="custom-topic-input"
                          value={aiConfig.topic}
                          onChange={(e) =>
                            handleAiConfigChange("topic", e.target.value)
                          }
                          placeholder="Postun ana konusunu belirtin"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>İçerik Kategorisi</Label>
                      <Select
                        value={titleConfig.category}
                        onValueChange={(value) =>
                          handleTitleConfigChange("category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(titleCategories).map(
                            ([key, category]) => (
                              <SelectItem key={key} value={key}>
                                {category.name} - {category.description}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Ton & Stil</Label>
                      <Select
                        value={titleConfig.tone}
                        onValueChange={(value) =>
                          handleTitleConfigChange("tone", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(titleTones).map(([key, tone]) => (
                            <SelectItem key={key} value={key}>
                              {tone.name} - {tone.style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>İş Alanı Odağı (Opsiyonel)</Label>
                      <Select
                        value={titleConfig.businessArea || "all"}
                        onValueChange={(value) =>
                          handleTitleConfigChange(
                            "businessArea",
                            value === "all" ? null : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tüm alanlar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm alanlar</SelectItem>
                          {companyContext.businessAreas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Üretilecek Sayı: {titleConfig.count}</Label>
                      <Slider
                        value={[titleConfig.count]}
                        onValueChange={(value) =>
                          handleTitleConfigChange("count", value[0])
                        }
                        max={20}
                        min={5}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateTitles}
                    disabled={
                      titleLoading ||
                      (titleConfig.useCustomTopic
                        ? !titleConfig.customTopic?.trim()
                        : !aiConfig.topic)
                    }
                    className="flex-1"
                  >
                    {titleLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    {titleLoading
                      ? "Başlıklar Üretiliyor..."
                      : "Başlıklar Üret"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleGenerateTitles}
                    disabled={titleLoading || generatedTitles.length === 0}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Generated Titles */}
                {generatedTitles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">
                          Üretilen Başlıklar ({generatedTitles.length})
                        </h4>
                        {generatedTitles.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="select-all"
                              checked={
                                selectedTitles.size ===
                                  generatedTitles.length &&
                                generatedTitles.length > 0
                              }
                              onCheckedChange={handleSelectAllTitles}
                            />
                            <Label
                              htmlFor="select-all"
                              className="text-sm text-gray-600"
                            >
                              Tümünü Seç ({selectedTitles.size}/
                              {generatedTitles.length})
                            </Label>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {selectedTitles.size > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveSelectedTitles}
                            disabled={titleLoading}
                          >
                            {titleLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Kaydediyor...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Seçilenleri Kaydet ({selectedTitles.size})
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            generatedTitles.forEach((title) =>
                              handleSaveTitle(title)
                            );
                          }}
                          disabled={titleLoading}
                        >
                          {titleLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Kaydediyor...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Tümünü Kaydet
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 max-h-64 overflow-y-auto">
                      {generatedTitles.map((title, index) => (
                        <div
                          key={index}
                          className={`
                            p-3 border rounded-lg transition-colors
                            ${
                              selectedTitles.has(index)
                                ? "border-blue-500 bg-blue-50"
                                : selectedTitle?.text === title.text
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedTitles.has(index)}
                              onCheckedChange={() =>
                                handleToggleTitleSelection(index)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium text-sm cursor-pointer"
                                onClick={() => handleSelectTitle(title)}
                              >
                                {title.text}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  {titleCategories[title.category]?.name}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  {titleTones[title.tone]?.name}
                                </span>
                                <span>{title.characterCount} karakter</span>
                              </div>
                            </div>

                            <div className="flex gap-2 ml-3 flex-shrink-0">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          title.text
                                        );
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Kopyala</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSaveTitle(title)}
                                    >
                                      <Heart className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Kaydet</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSelectTitle(title)}
                                      className={
                                        selectedTitle?.text === title.text
                                          ? "bg-green-100"
                                          : ""
                                      }
                                    >
                                      <CheckCircle
                                        className={`h-4 w-4 ${
                                          selectedTitle?.text === title.text
                                            ? "text-green-600"
                                            : ""
                                        }`}
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {selectedTitle?.text === title.text
                                      ? "Seçili"
                                      : "Başlık Olarak Kullan"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Titles Section */}
                {generatedTitles.length > 0 && (
                  <div className="space-y-6">
                    {/* Section Header with Controls */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {generatedTitles.length}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            Üretilen Başlıklar
                          </h4>
                          <p className="text-sm text-gray-600">
                            En iyi sonuçları seçin ve kullanın
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border">
                          <Checkbox
                            id="select-all-titles"
                            checked={
                              selectedTitlesForSaving.size ===
                                generatedTitles.length &&
                              generatedTitles.length > 0
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTitlesForSaving(
                                  new Set(
                                    Array.from(
                                      { length: generatedTitles.length },
                                      (_, i) => i
                                    )
                                  )
                                );
                              } else {
                                setSelectedTitlesForSaving(new Set());
                              }
                            }}
                          />
                          <Label
                            htmlFor="select-all-titles"
                            className="text-sm font-medium"
                          >
                            Tümünü Seç ({selectedTitlesForSaving.size}/
                            {generatedTitles.length})
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Titles Grid */}
                    <div className="grid gap-4">
                      {generatedTitles.map((title, index) => (
                        <div
                          key={index}
                          className={`group border-2 rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
                            selectedTitlesForSaving.has(index)
                              ? "border-blue-500 bg-blue-50/50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Selection Checkbox */}
                            <div className="mt-1">
                              <Checkbox
                                checked={selectedTitlesForSaving.has(index)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(
                                    selectedTitlesForSaving
                                  );
                                  if (checked) {
                                    newSelected.add(index);
                                  } else {
                                    newSelected.delete(index);
                                  }
                                  setSelectedTitlesForSaving(newSelected);
                                }}
                              />
                            </div>

                            {/* Title Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 leading-tight mb-2">
                                    {title.text}
                                  </h5>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Type className="h-3 w-3" />
                                      {title.text.length} karakter
                                    </span>
                                    {title.score && (
                                      <span className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        {Math.round(title.score * 100)}% skor
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              title.text
                                            );
                                          }}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Kopyala</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleSaveTitle(title)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Heart className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Favorilere Ekle
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleSelectTitle(title)
                                          }
                                          className={`h-8 w-8 p-0 ${
                                            selectedTitle?.text === title.text
                                              ? "bg-green-100 text-green-600"
                                              : ""
                                          }`}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {selectedTitle?.text === title.text
                                          ? "Seçili"
                                          : "Başlık Olarak Kullan"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Tips for Title Generation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Etkili Başlık İpuçları
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                    <div>
                      <p className="font-medium">📊 SEO Dostu:</p>
                      <p>Ana anahtar kelimeyi başlıkta kullanın</p>
                    </div>
                    <div>
                      <p className="font-medium">💡 Merak Uyandırıcı:</p>
                      <p>Sorular ve sayılar dikkat çeker</p>
                    </div>
                    <div>
                      <p className="font-medium">🎯 Spesifik:</p>
                      <p>Belirsiz ifadelerden kaçının</p>
                    </div>
                    <div>
                      <p className="font-medium">⚡ Kısa ve Öz:</p>
                      <p>40-80 karakter arası ideal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="border-t bg-gray-50/50 p-4 mt-auto">
                {/* Seçili başlık sayısı */}
                {selectedTitlesForSaving.size > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {selectedTitlesForSaving.size}
                        </div>
                        <span className="font-medium text-blue-900">
                          {selectedTitlesForSaving.size} başlık seçildi
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-blue-50"
                          onClick={() => {
                            const selectedTexts = Array.from(
                              selectedTitlesForSaving
                            )
                              .map((index) => generatedTitles[index].text)
                              .join("\n");
                            navigator.clipboard.writeText(selectedTexts);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Kopyala
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            const selectedTitles = Array.from(
                              selectedTitlesForSaving
                            ).map((index) => generatedTitles[index]);
                            selectedTitles.forEach((title) =>
                              handleSaveTitle(title)
                            );
                            setSelectedTitlesForSaving(new Set());
                          }}
                          disabled={titleSaving}
                        >
                          {titleSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Heart className="h-4 w-4 mr-2" />
                          )}
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ana aksiyon butonları */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      onClick={handleGenerateTitles}
                      disabled={titleGenerating}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium px-6"
                    >
                      {titleGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Üretiliyor...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-3" />
                          Yeni Başlık Üret
                        </>
                      )}
                    </Button>

                    {generatedTitles.length > 0 && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          const allTitles = generatedTitles
                            .map((t) => t.text)
                            .join("\n");
                          navigator.clipboard.writeText(allTitles);
                        }}
                        className="font-medium"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Tümünü Kopyala
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setShowTitleGenerator(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Kapat
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Enhanced Preview Dialog */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      Gelişmiş Önizleme Modu
                    </h2>
                    <p className="text-sm text-gray-500 font-normal">
                      Tüm platformlarda detaylı görünüm
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Scrollable Preview Area */}
              <div className="flex-1 overflow-y-auto py-6">
                {formData.platforms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Eye className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      Platform Seçin
                    </h3>
                    <p className="text-gray-500 text-lg">
                      Önizleme görüntülemek için önce platform seçimi yapın
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {formData.platforms.map((platformId) => {
                      const platform = platforms[platformId];
                      const Icon = PLATFORM_ICONS[platformId];
                      const charCount = getCharacterCount(
                        formData.title + " " + formData.content,
                        platformId
                      );

                      return (
                        <div
                          key={platformId}
                          className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {/* Platform Header */}
                          <div
                            className={`${PLATFORM_COLORS[platformId]} text-white px-8 py-6`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                  <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-2xl">
                                    {platform.name}
                                  </h3>
                                  <p className="text-white/80 text-base">
                                    Post önizlemesi
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-lg font-bold ${
                                    charCount.percentage > 100
                                      ? "text-red-200"
                                      : "text-white"
                                  }`}
                                >
                                  {charCount.current} / {charCount.limit}
                                </div>
                                <p className="text-white/80 text-sm">
                                  karakter
                                </p>
                                <div
                                  className={`text-sm ${
                                    charCount.percentage > 100
                                      ? "text-red-200"
                                      : "text-green-200"
                                  }`}
                                >
                                  {charCount.percentage > 100
                                    ? "⚠️ Limit Aşıldı!"
                                    : "✅ Uygun"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="p-8 space-y-6">
                            {/* Title */}
                            {formData.title && (
                              <div className="border-l-4 border-blue-500 pl-4 bg-blue-50/50 py-3 rounded-r-lg">
                                <p className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wide">
                                  BAŞLIK
                                </p>
                                <h4 className="font-semibold text-lg text-gray-900 leading-tight">
                                  {formData.title}
                                </h4>
                              </div>
                            )}

                            {/* Content */}
                            {formData.content && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  İÇERİK
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
                                    {formData.content}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Images */}
                            {selectedImages.length > 0 && (
                              <div className="space-y-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                  GÖRSELLER ({selectedImages.length})
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {selectedImages
                                    .slice(0, 8)
                                    .map((image, idx) => (
                                      <div
                                        key={idx}
                                        className="relative group aspect-square overflow-hidden rounded-xl"
                                      >
                                        <Image
                                          src={image.webformatURL}
                                          alt={`Önizleme ${idx + 1}`}
                                          width={300}
                                          height={300}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {selectedImages.length > 8 &&
                                          idx === 7 && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                              <div className="text-center text-white">
                                                <div className="text-3xl font-bold">
                                                  +{selectedImages.length - 8}
                                                </div>
                                                <div className="text-sm">
                                                  daha fazla
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Hashtags */}
                            {formData.hashtags.length > 0 && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    ETİKETLER ({formData.hashtags.length})
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="text-gray-600"
                                  >
                                    {platformId === "twitter"
                                      ? "En fazla 2-3 hashtag önerilir"
                                      : "Hashtag limiti yok"}
                                  </Badge>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                  <div className="flex flex-wrap gap-3">
                                    {formData.hashtags
                                      .slice(0, 15)
                                      .map((tag, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="bg-white text-blue-800 hover:bg-blue-100 px-4 py-2 text-base font-medium border border-blue-200 shadow-sm"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    {formData.hashtags.length > 15 && (
                                      <Badge
                                        variant="outline"
                                        className="text-gray-700 border-gray-400 px-4 py-2 bg-gray-100"
                                      >
                                        +{formData.hashtags.length - 15} daha
                                        fazla etiket
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Platform Specific Info & Stats */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                              <h5 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                                Platform Detayları
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {charCount.current}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Toplam Karakter
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {formData.hashtags.length}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Hashtag Sayısı
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {selectedImages.length}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Görsel Sayısı
                                  </div>
                                </div>
                              </div>

                              {/* Character Limit Bar */}
                              <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Karakter Kullanımı
                                  </span>
                                  <span
                                    className={`text-sm font-medium ${
                                      charCount.percentage > 100
                                        ? "text-red-600"
                                        : charCount.percentage > 80
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    %{Math.round(charCount.percentage)}
                                  </span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      charCount.percentage > 100
                                        ? "bg-red-500"
                                        : charCount.percentage > 80
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        charCount.percentage,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Empty State */}
                            {!formData.title &&
                              !formData.content &&
                              formData.hashtags.length === 0 &&
                              selectedImages.length === 0 && (
                                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Edit className="h-10 w-10 text-gray-400" />
                                  </div>
                                  <h4 className="text-xl font-medium text-gray-700 mb-2">
                                    İçerik henüz oluşturulmadı
                                  </h4>
                                  <p className="text-lg">
                                    İçerik sekmesinden post detaylarını doldurun
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t bg-gray-50/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {formData.platforms.length > 0 && (
                      <span>
                        {formData.platforms.length} platform için detaylı
                        önizleme
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsPreviewOpen(false)}
                      size="lg"
                    >
                      Kapat
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => {
                        setIsPreviewOpen(false);
                        setActiveTab("publish");
                      }}
                      disabled={
                        formData.platforms.length === 0 ||
                        (!formData.title && !formData.content)
                      }
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Yayına Geç
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Saved Titles Dialog */}
          <Dialog open={showSavedTitles} onOpenChange={setShowSavedTitles}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Kaydedilmiş Başlıklar</h2>
                    <p className="text-sm text-gray-500 font-normal">
                      Favori başlıklarınızı seçin ve kullanın
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto py-6">
                {titleLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-500" />
                    <p className="text-gray-600">
                      Kaydedilmiş başlıklar yükleniyor...
                    </p>
                  </div>
                ) : savedTitles && savedTitles.length > 0 ? (
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {savedTitles.length}
                          </div>
                          <span className="font-medium text-pink-900">
                            Toplam {savedTitles.length} kaydedilmiş başlık
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-white">
                            Title Library
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadSavedTitles()}
                            disabled={titleLoading}
                            title="Başlıkları Yeniden Yükle"
                          >
                            {titleLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "🔄"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Saved Titles Grid */}
                    <div className="grid gap-3">
                      {savedTitles.map((title) => (
                        <div
                          key={title.id}
                          className="group border-2 border-gray-200 rounded-xl p-4 bg-white hover:border-pink-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => handleSelectTitle(title)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Title Content */}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-gray-900 leading-tight mb-2 group-hover:text-pink-700">
                                {title.text}
                              </h5>

                              {/* Title Meta Info */}
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                {title.businessArea && (
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {title.businessArea}
                                  </span>
                                )}
                                {title.category && (
                                  <span className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    {title.category}
                                  </span>
                                )}
                                {title.tone && (
                                  <span className="flex items-center gap-1">
                                    <Palette className="h-3 w-3" />
                                    {title.tone}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Type className="h-3 w-3" />
                                  {title.text.length} karakter
                                </span>
                                {title.usage?.clickCount > 0 && (
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3" />
                                    {title.usage.clickCount}x kullanıldı
                                  </span>
                                )}
                                {title.targetAudience && (
                                  <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    👥 {title.targetAudience}
                                  </span>
                                )}
                              </div>

                              {/* Topic Info */}
                              {title.topic && (
                                <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded max-w-fit">
                                  💡 {title.topic}
                                </p>
                              )}

                              {/* Creation Date */}
                              {title.createdAt && (
                                <p className="text-xs text-gray-400 mt-1">
                                  📅{" "}
                                  {typeof title.createdAt === "string"
                                    ? new Date(
                                        title.createdAt
                                      ).toLocaleDateString("tr-TR")
                                    : title.createdAt.toDate?.()
                                    ? title.createdAt
                                        .toDate()
                                        .toLocaleDateString("tr-TR")
                                    : new Date(
                                        title.createdAt
                                      ).toLocaleDateString("tr-TR")}{" "}
                                  • {title.createdBy || "Bilinmiyor"}
                                </p>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(
                                          title.text
                                        );
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Kopyala</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {selectedTitle?.id === title.id && (
                                <div className="h-8 w-8 bg-green-100 rounded flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {savedTitles?.length === 0
                        ? "Henüz Kaydedilmiş Başlık Yok"
                        : "Başlıklar Yükleniyor..."}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {savedTitles?.length === 0
                        ? "AI ile başlık üretip favorilerinize ekleyerek buradan hızlıca kullanabilirsiniz"
                        : "Firestore'dan kaydedilmiş başlıklar alınıyor..."}
                    </p>
                    {savedTitles?.length === 0 && (
                      <Button
                        onClick={() => {
                          setShowSavedTitles(false);
                          setShowTitleGenerator(true);
                        }}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI ile Başlık Üret
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t bg-gray-50/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Başlığa tıklayarak hızlıca seçebilirsiniz
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowSavedTitles(false)}
                      size="lg"
                    >
                      Kapat
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => {
                        setShowSavedTitles(false);
                        setShowTitleGenerator(true);
                      }}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Başlık Üret
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </PermissionGuard>
  );
}
