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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Bot,
  Lightbulb,
  TrendingUp,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Copy,
  Trash2,
  Edit,
  Zap,
  Play,
  Settings2,
  BarChart3,
  Users,
  Globe,
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
  tiktok: () => <span className="text-sm font-bold">TT</span>,
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

export default function CreateSocialPostPageNew() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const {
    platforms,
    contentTypes,
    contentTones,
    generateSocialContent,
    generateMultiPlatformContent,
    generateHashtags,
    getPlatformRecommendations,
    loading: socialLoading,
  } = useSocialMedia();

  const {
    generateTitles,
    savedTitles,
    companyContext,
    titleCategories,
    titleTones,
    loadSavedTitles,
    saveTitle,
    loading: titleLoading,
  } = useTitleGenerator();

  const {
    searchImages,
    loading: imageLoading,
  } = useSmartImageSelection();

  // Form States
  const [activeTab, setActiveTab] = useState("setup");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [activePlatformTab, setActivePlatformTab] = useState(null);

  // Global post settings
  const [globalSettings, setGlobalSettings] = useState({
    title: "",
    topic: "",
    contentType: "",
    tone: "professional",
    targetAudience: "B2B",
    brandContext: "",
    additionalInstructions: "",
    scheduledAt: null,
    status: POST_STATUS.DRAFT,
  });

  // Platform-specific content
  const [platformContent, setPlatformContent] = useState({});

  // AI generation states
  const [aiConfig, setAiConfig] = useState({
    includeHashtags: true,
    includeEmojis: true,
    creativity: 70,
    generateForAll: false,
  });

  // Other states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [showTitleGenerator, setShowTitleGenerator] = useState(false);
  const [showBulkGenerate, setShowBulkGenerate] = useState(false);
  const [imageSearchResults, setImageSearchResults] = useState([]);

  // Title generator states
  const [titleConfig, setTitleConfig] = useState({
    category: "educational",
    tone: "professional",
    businessArea: "all",
    count: 10,
  });

  // Platform recommendation
  useEffect(() => {
    if (globalSettings.contentType && selectedPlatforms.length === 0) {
      const recommendations = getPlatformRecommendations(
        globalSettings.contentType,
        globalSettings.targetAudience
      );
      // Auto-select top recommended platforms
      if (recommendations.length > 0) {
        const topPlatforms = recommendations.slice(0, 2).map(r => r.platform);
        setSelectedPlatforms(topPlatforms);
        setActivePlatformTab(topPlatforms[0]);
        
        // Initialize platform content
        const initialContent = {};
        topPlatforms.forEach(platform => {
          initialContent[platform] = {
            content: "",
            hashtags: [],
            mentions: [],
            mediaUrls: [],
            customizations: {}
          };
        });
        setPlatformContent(initialContent);
      }
    }
  }, [globalSettings.contentType, globalSettings.targetAudience, getPlatformRecommendations, selectedPlatforms.length]);

  // Update active platform tab when platforms change
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !activePlatformTab) {
      setActivePlatformTab(selectedPlatforms[0]);
    } else if (selectedPlatforms.length === 0) {
      setActivePlatformTab(null);
    } else if (!selectedPlatforms.includes(activePlatformTab)) {
      setActivePlatformTab(selectedPlatforms[0]);
    }
  }, [selectedPlatforms, activePlatformTab]);

  // Handle global settings changes
  const updateGlobalSettings = (field, value) => {
    setGlobalSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle AI config changes
  const updateAiConfig = (field, value) => {
    setAiConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle platform selection
  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId];

      // Update platform content
      setPlatformContent(prevContent => {
        const newContent = { ...prevContent };
        
        if (newPlatforms.includes(platformId) && !prevContent[platformId]) {
          // Add new platform
          newContent[platformId] = {
            content: "",
            hashtags: [],
            mentions: [],
            mediaUrls: [],
            customizations: {}
          };
        } else if (!newPlatforms.includes(platformId)) {
          // Remove platform
          delete newContent[platformId];
        }
        
        return newContent;
      });

      return newPlatforms;
    });
  };

  // Update platform-specific content
  const updatePlatformContent = (platform, field, value) => {
    setPlatformContent(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  // Add hashtag to specific platform
  const addPlatformHashtag = (platform, hashtag) => {
    const cleanHashtag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;
    updatePlatformContent(platform, "hashtags", [
      ...platformContent[platform]?.hashtags || [],
      cleanHashtag,
    ]);
  };

  // Remove hashtag from specific platform
  const removePlatformHashtag = (platform, index) => {
    const currentHashtags = platformContent[platform]?.hashtags || [];
    updatePlatformContent(
      platform,
      "hashtags",
      currentHashtags.filter((_, i) => i !== index)
    );
  };

  // Generate content for all selected platforms
  const generateAllPlatformContent = async () => {
    if (!globalSettings.topic || selectedPlatforms.length === 0) {
      setError("Lütfen konu belirtin ve en az bir platform seçin");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (aiConfig.generateForAll) {
        // Generate for all platforms at once
        const results = await generateMultiPlatformContent({
          platforms: selectedPlatforms,
          contentType: globalSettings.contentType,
          topic: globalSettings.topic,
          tone: globalSettings.tone,
          includeHashtags: aiConfig.includeHashtags,
          includeEmojis: aiConfig.includeEmojis,
          targetAudience: globalSettings.targetAudience,
          brandContext: globalSettings.brandContext,
          additionalInstructions: globalSettings.additionalInstructions,
        });

        // Update platform content with results
        Object.keys(results).forEach(platform => {
          updatePlatformContent(platform, "content", results[platform].content);
          if (results[platform].hashtags.length > 0) {
            updatePlatformContent(platform, "hashtags", results[platform].hashtags);
          }
        });
      } else {
        // Generate for active platform only
        if (activePlatformTab) {
          const content = await generateSocialContent({
            platform: activePlatformTab,
            contentType: globalSettings.contentType,
            topic: globalSettings.topic,
            tone: globalSettings.tone,
            includeHashtags: aiConfig.includeHashtags,
            includeEmojis: aiConfig.includeEmojis,
            targetAudience: globalSettings.targetAudience,
            brandContext: globalSettings.brandContext,
            additionalInstructions: globalSettings.additionalInstructions,
          });

          updatePlatformContent(activePlatformTab, "content", content);

          if (aiConfig.includeHashtags) {
            const hashtags = await generateHashtags(globalSettings.topic, activePlatformTab, 10);
            updatePlatformContent(activePlatformTab, "hashtags", hashtags);
          }
        }
      }

      setActiveTab("content");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate titles
  const handleGenerateTitles = async () => {
    if (!globalSettings.topic) {
      setError("Lütfen bir konu belirtin");
      return;
    }

    try {
      const titles = await generateTitles({
        topic: globalSettings.topic,
        tone: titleConfig.tone,
        platform: selectedPlatforms.length > 0 ? selectedPlatforms[0] : null,
        count: titleConfig.count,
        contentType: "social_media",
        additionalContext: globalSettings.brandContext,
      });

      setGeneratedTitles(titles);
    } catch (err) {
      setError(err.message);
    }
  };

  // Select title
  const handleSelectTitle = (title) => {
    setSelectedTitle(title);
    updateGlobalSettings("title", title.text);
    if (title.topic) {
      updateGlobalSettings("topic", title.topic);
    }
    setShowTitleGenerator(false);
  };

  // Character count for platform
  const getCharacterCount = (platform) => {
    const platformConfig = platforms[platform];
    const content = platformContent[platform]?.content || "";
    const hashtags = (platformContent[platform]?.hashtags || []).join(" ");
    const total = content.length + hashtags.length;
    
    return {
      current: total,
      limit: platformConfig.charLimit,
      percentage: (total / platformConfig.charLimit) * 100,
      isOverLimit: total > platformConfig.charLimit,
    };
  };

  // Save post
  const handleSave = async (status = POST_STATUS.DRAFT) => {
    try {
      setLoading(true);

      const postData = {
        title: globalSettings.title,
        contentType: globalSettings.contentType,
        tone: globalSettings.tone,
        targetAudience: globalSettings.targetAudience,
        platformSpecificContent: platformContent,
        status,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdBy: user.email,
        scheduledAt: globalSettings.scheduledAt,
        metadata: {
          aiGenerated: true,
          template: null,
          version: "2.0",
        },
      };

      await createSocialPost(postData);
      router.push("/admin/social-media");
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
                  Yeni Çoklu Platform İçeriği
                </h1>
                <p className="text-gray-600 mt-1">
                  Her platform için optimize edilmiş özel içerik üretin
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  /* Preview logic */
                }}
                disabled={selectedPlatforms.length === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Önizle
              </Button>
              <Button
                onClick={() => handleSave(POST_STATUS.DRAFT)}
                disabled={loading || !globalSettings.title}
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="setup">🎯 Kurulum</TabsTrigger>
                  <TabsTrigger value="content" disabled={selectedPlatforms.length === 0}>📝 İçerik</TabsTrigger>
                  <TabsTrigger value="media" disabled={selectedPlatforms.length === 0}>🖼️ Medya</TabsTrigger>
                  <TabsTrigger value="publish" disabled={selectedPlatforms.length === 0}>🚀 Yayın</TabsTrigger>
                </TabsList>

                {/* Setup Tab */}
                <TabsContent value="setup" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Genel Ayarlar
                      </CardTitle>
                      <CardDescription>
                        Tüm platformlar için genel post ayarlarını yapın
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Title Section */}
                      <div>
                        <Label htmlFor="title">Post Başlığı *</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="title"
                            value={globalSettings.title}
                            onChange={(e) => updateGlobalSettings("title", e.target.value)}
                            placeholder="Ana post başlığını yazın"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowTitleGenerator(true)}
                            className="px-3"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        </div>
                        {selectedTitle && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 font-medium text-sm">
                              ✓ AI Başlık Kullanılıyor: {selectedTitle.text}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Topic and Content Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="topic">Ana Konu *</Label>
                          <Input
                            id="topic"
                            value={globalSettings.topic}
                            onChange={(e) => updateGlobalSettings("topic", e.target.value)}
                            placeholder="Postun ana konusunu belirtin"
                          />
                        </div>
                        <div>
                          <Label>İçerik Türü *</Label>
                          <Select
                            value={globalSettings.contentType}
                            onValueChange={(value) => updateGlobalSettings("contentType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="İçerik türünü seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(contentTypes).map(([key, type]) => (
                                <SelectItem key={key} value={key}>
                                  {type.name} - {type.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Tone and Target Audience */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Ton & Stil</Label>
                          <Select
                            value={globalSettings.tone}
                            onValueChange={(value) => updateGlobalSettings("tone", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(contentTones).map(([key, tone]) => (
                                <SelectItem key={key} value={key}>
                                  {tone.name} - {tone.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Hedef Kitle</Label>
                          <Select
                            value={globalSettings.targetAudience}
                            onValueChange={(value) => updateGlobalSettings("targetAudience", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B2B">İşletmeler (B2B)</SelectItem>
                              <SelectItem value="B2C">Bireysel Müşteriler (B2C)</SelectItem>
                              <SelectItem value="genel">Genel Kitle</SelectItem>
                              <SelectItem value="uzman">Uzman/Teknik Kitle</SelectItem>
                              <SelectItem value="genç">Genç Kitle (18-30)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Platform Selection */}
                      <div>
                        <Label className="text-lg font-semibold">Platform Seçimi *</Label>
                        <p className="text-sm text-gray-600 mt-1 mb-4">
                          Her seçilen platform için ayrı optimize içerik üretilecek
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(platforms).map(([key, platform]) => {
                            const isSelected = selectedPlatforms.includes(key);
                            const Icon = PLATFORM_ICONS[key];

                            return (
                              <div
                                key={key}
                                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:scale-105 ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => togglePlatform(key)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-lg ${PLATFORM_COLORS[key]} text-white`}>
                                    <Icon className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                                    <p className="text-xs text-gray-500">{platform.charLimit} karakter</p>
                                    <p className="text-xs text-gray-500">{platform.description}</p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="absolute top-3 right-3 h-6 w-6 text-blue-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Platform Recommendations */}
                      {globalSettings.contentType && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            AI Platform Önerileri
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {getPlatformRecommendations(globalSettings.contentType, globalSettings.targetAudience)
                              .slice(0, 4)
                              .map((rec) => {
                                const Icon = PLATFORM_ICONS[rec.platform];
                                const isSelected = selectedPlatforms.includes(rec.platform);
                                
                                return (
                                  <div
                                    key={rec.platform}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                      isSelected ? "bg-blue-200" : "bg-white hover:bg-blue-100"
                                    }`}
                                    onClick={() => togglePlatform(rec.platform)}
                                  >
                                    <div className={`p-2 rounded ${PLATFORM_COLORS[rec.platform]} text-white`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium">{rec.name}</p>
                                      <p className="text-xs text-blue-700">{rec.reasons[0]}</p>
                                    </div>
                                    <Badge variant="secondary">{rec.score}/5</Badge>
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
                          <Bot className="h-4 w-4" />
                          AI Üretim Ayarları
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Label>Hashtag Dahil Et</Label>
                              <p className="text-sm text-gray-500">Platform-specific hashtagler</p>
                            </div>
                            <Switch
                              checked={aiConfig.includeHashtags}
                              onCheckedChange={(checked) => updateAiConfig("includeHashtags", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Label>Emoji Dahil Et</Label>
                              <p className="text-sm text-gray-500">Platform kültürüne uygun</p>
                            </div>
                            <Switch
                              checked={aiConfig.includeEmojis}
                              onCheckedChange={(checked) => updateAiConfig("includeEmojis", checked)}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Label>Tüm Platformlar İçin Üret</Label>
                            <p className="text-sm text-gray-500">Tek seferde tüm seçili platformlar için içerik</p>
                          </div>
                          <Switch
                            checked={aiConfig.generateForAll}
                            onCheckedChange={(checked) => updateAiConfig("generateForAll", checked)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="brandContext">Marka Bağlamı (Opsiyonel)</Label>
                          <Textarea
                            id="brandContext"
                            value={globalSettings.brandContext}
                            onChange={(e) => updateGlobalSettings("brandContext", e.target.value)}
                            placeholder="Bu post için özel vurgulanması gereken noktalar..."
                            rows={3}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      {/* Generate Button */}
                      <div className="flex justify-end">
                        <Button
                          onClick={generateAllPlatformContent}
                          disabled={
                            socialLoading ||
                            loading ||
                            !globalSettings.topic ||
                            selectedPlatforms.length === 0
                          }
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {socialLoading || loading ? (
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          ) : (
                            <Zap className="h-5 w-5 mr-2" />
                          )}
                          {aiConfig.generateForAll
                            ? `${selectedPlatforms.length} Platform İçin Üret`
                            : "Aktif Platform İçin Üret"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  {selectedPlatforms.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="h-5 w-5" />
                          Platform İçerikleri
                        </CardTitle>
                        <CardDescription>
                          Her platform için özel optimize edilmiş içerik düzenleyin
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs value={activePlatformTab} onValueChange={setActivePlatformTab}>
                          <TabsList className="grid w-full" style={{gridTemplateColumns: `repeat(${selectedPlatforms.length}, 1fr)`}}>
                            {selectedPlatforms.map(platform => {
                              const Icon = PLATFORM_ICONS[platform];
                              const charCount = getCharacterCount(platform);
                              
                              return (
                                <TabsTrigger key={platform} value={platform} className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span className="hidden sm:inline">{platforms[platform].name}</span>
                                  <Badge 
                                    variant={charCount.isOverLimit ? "destructive" : "secondary"}
                                    className="text-xs"
                                  >
                                    {charCount.current}
                                  </Badge>
                                </TabsTrigger>
                              );
                            })}
                          </TabsList>

                          {selectedPlatforms.map(platform => {
                            const platformConfig = platforms[platform];
                            const content = platformContent[platform] || {};
                            const charCount = getCharacterCount(platform);
                            const Icon = PLATFORM_ICONS[platform];

                            return (
                              <TabsContent key={platform} value={platform} className="space-y-6 mt-6">
                                {/* Platform Header */}
                                <div className={`p-4 rounded-lg text-white ${PLATFORM_COLORS[platform]}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Icon className="h-6 w-6" />
                                      <div>
                                        <h3 className="font-bold text-lg">{platformConfig.name}</h3>
                                        <p className="text-white/80">{platformConfig.description}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold">{charCount.current} / {charCount.limit}</div>
                                      <div className={`text-sm ${charCount.isOverLimit ? 'text-red-200' : 'text-white/80'}`}>
                                        karakter
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Character Usage Bar */}
                                  <div className="mt-3">
                                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                      <div
                                        className={`h-2 transition-all duration-300 ${
                                          charCount.isOverLimit ? "bg-red-400" : "bg-white"
                                        }`}
                                        style={{ width: `${Math.min(charCount.percentage, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Content Editor */}
                                <div>
                                  <Label htmlFor={`content-${platform}`}>İçerik</Label>
                                  <div className="flex gap-2 mb-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        generateSocialContent({
                                          platform,
                                          contentType: globalSettings.contentType,
                                          topic: globalSettings.topic,
                                          tone: globalSettings.tone,
                                          includeHashtags: aiConfig.includeHashtags,
                                          includeEmojis: aiConfig.includeEmojis,
                                          targetAudience: globalSettings.targetAudience,
                                          brandContext: globalSettings.brandContext,
                                          additionalInstructions: globalSettings.additionalInstructions,
                                        }).then(generatedContent => {
                                          updatePlatformContent(platform, "content", generatedContent);
                                        });
                                      }}
                                      disabled={socialLoading}
                                    >
                                      <RefreshCw className="h-4 w-4 mr-1" />
                                      Yeniden Üret
                                    </Button>
                                  </div>
                                  
                                  <Textarea
                                    id={`content-${platform}`}
                                    value={content.content || ""}
                                    onChange={(e) => updatePlatformContent(platform, "content", e.target.value)}
                                    placeholder={`${platformConfig.name} için optimize edilmiş içerik yazın...`}
                                    rows={8}
                                    className={charCount.isOverLimit ? "border-red-500" : ""}
                                  />
                                </div>

                                {/* Hashtags */}
                                <div>
                                  <Label>Hashtagler ({(content.hashtags || []).length}/{platformConfig.hashtagLimit})</Label>
                                  
                                  <div className="flex gap-2 mb-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        generateHashtags(globalSettings.topic, platform, 10).then(hashtags => {
                                          updatePlatformContent(platform, "hashtags", hashtags);
                                        });
                                      }}
                                      disabled={socialLoading}
                                    >
                                      <Hash className="h-4 w-4 mr-1" />
                                      Hashtag Üret
                                    </Button>
                                  </div>

                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {(content.hashtags || []).map((hashtag, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                      >
                                        {hashtag}
                                        <button
                                          onClick={() => removePlatformHashtag(platform, index)}
                                          className="text-red-500 hover:text-red-700 ml-1"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>

                                  <Input
                                    placeholder="Hashtag ekle (# ile veya # olmadan)"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter" && e.target.value.trim()) {
                                        addPlatformHashtag(platform, e.target.value.trim());
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                </div>
                              </TabsContent>
                            );
                          })}
                        </Tabs>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Seçin</h3>
                        <p className="text-gray-600 mb-4">
                          İçerik düzenlemek için önce kurulum sekmesinden platform seçin
                        </p>
                        <Button onClick={() => setActiveTab("setup")}>
                          Kuruluma Git
                        </Button>
                      </CardContent>
                    </Card>
                  )}
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
                        Her platform için uygun görseller ekleyin
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-gray-500">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                          Medya Yönetimi
                        </h3>
                        <p className="text-gray-600">
                          Görsel yükleme ve yönetimi yakında eklenecek
                        </p>
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
                        Çoklu platform post yayın ayarlarını yapın
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Platform Summary */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Yayınlanacak Platformlar</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedPlatforms.map(platform => {
                            const Icon = PLATFORM_ICONS[platform];
                            const charCount = getCharacterCount(platform);
                            const content = platformContent[platform] || {};

                            return (
                              <div key={platform} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded ${PLATFORM_COLORS[platform]} text-white`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{platforms[platform].name}</p>
                                    <p className="text-sm text-gray-500">
                                      {(content.hashtags || []).length} hashtag
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={charCount.isOverLimit ? "destructive" : "secondary"}>
                                  {charCount.current}/{charCount.limit}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Publishing Options */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="publish-now"
                            name="publishOption"
                            checked={globalSettings.status === POST_STATUS.PUBLISHED}
                            onChange={() => updateGlobalSettings("status", POST_STATUS.PUBLISHED)}
                          />
                          <Label htmlFor="publish-now">Hemen Yayınla</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="save-draft"
                            name="publishOption"
                            checked={globalSettings.status === POST_STATUS.DRAFT}
                            onChange={() => updateGlobalSettings("status", POST_STATUS.DRAFT)}
                          />
                          <Label htmlFor="save-draft">Taslak Olarak Kaydet</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="schedule"
                            name="publishOption"
                            checked={globalSettings.status === POST_STATUS.SCHEDULED}
                            onChange={() => updateGlobalSettings("status", POST_STATUS.SCHEDULED)}
                          />
                          <Label htmlFor="schedule">Zamanla</Label>
                        </div>
                      </div>

                      {globalSettings.status === POST_STATUS.SCHEDULED && (
                        <div>
                          <Label htmlFor="scheduledDate">Yayın Tarihi ve Saati</Label>
                          <Input
                            id="scheduledDate"
                            type="datetime-local"
                            value={globalSettings.scheduledAt || ""}
                            onChange={(e) => updateGlobalSettings("scheduledAt", e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      )}

                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleSave(POST_STATUS.DRAFT)}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Taslak Kaydet
                        </Button>
                        <Button
                          onClick={() => handleSave(globalSettings.status)}
                          disabled={loading || !globalSettings.title || selectedPlatforms.length === 0}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          {globalSettings.status === POST_STATUS.PUBLISHED
                            ? "Yayınla"
                            : globalSettings.status === POST_STATUS.SCHEDULED
                            ? "Zamanla"
                            : "Kaydet"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar */}
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
                  {activePlatformTab && platformContent[activePlatformTab] ? (
                    <div className="space-y-4">
                      <div className={`p-3 rounded-lg text-white ${PLATFORM_COLORS[activePlatformTab]}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            const Icon = PLATFORM_ICONS[activePlatformTab];
                            return <Icon className="h-4 w-4" />;
                          })()}
                          <span className="font-medium text-sm">
                            {platforms[activePlatformTab].name}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {globalSettings.title && (
                          <h4 className="font-semibold text-sm">{globalSettings.title}</h4>
                        )}
                        
                        {platformContent[activePlatformTab]?.content && (
                          <p className="text-sm whitespace-pre-wrap">
                            {platformContent[activePlatformTab].content.substring(0, 150)}
                            {platformContent[activePlatformTab].content.length > 150 && "..."}
                          </p>
                        )}

                        {platformContent[activePlatformTab]?.hashtags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {platformContent[activePlatformTab].hashtags
                              .slice(0, 5)
                              .map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            {platformContent[activePlatformTab].hashtags.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{platformContent[activePlatformTab].hashtags.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        Platform seçin ve içerik üretin
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    İstatistikler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Seçili Platform:</span>
                      <span className="font-medium">{selectedPlatforms.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam İçerik:</span>
                      <span className="font-medium">
                        {Object.keys(platformContent).filter(p => platformContent[p]?.content).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Başlık Uzunluğu:</span>
                      <span className="font-medium">{globalSettings.title.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Kullanımı:</span>
                      <span className="font-medium text-green-600">Aktif</span>
                    </div>
                  </div>
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
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Platform Optimizasyonu</p>
                        <p className="text-blue-700">
                          Her platform için farklı algoritma ve kitle beklentilerini dikkate alıyoruz.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Akıllı İçerik</p>
                        <p className="text-green-700">
                          MKN Group'un değerlerini her platforma uygun dilde ifade ediyoruz.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900">Engagement Odaklı</p>
                        <p className="text-orange-700">
                          Her platform için etkileşimi maksimize edecek format kullanıyoruz.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Title Generator Dialog */}
          <Dialog open={showTitleGenerator} onOpenChange={setShowTitleGenerator}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Başlık Üretici
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Kategori</Label>
                    <Select
                      value={titleConfig.category}
                      onValueChange={(value) => setTitleConfig(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(titleCategories).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Ton</Label>
                    <Select
                      value={titleConfig.tone}
                      onValueChange={(value) => setTitleConfig(prev => ({ ...prev, tone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(titleTones).map(([key, tone]) => (
                          <SelectItem key={key} value={key}>
                            {tone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateTitles}
                    disabled={titleLoading || !globalSettings.topic}
                    className="flex-1"
                  >
                    {titleLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Başlık Üret
                  </Button>
                </div>

                {generatedTitles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Üretilen Başlıklar</h4>
                    <div className="grid gap-2 max-h-64 overflow-y-auto">
                      {generatedTitles.map((title, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                          onClick={() => handleSelectTitle(title)}
                        >
                          <p className="font-medium">{title.text}</p>
                          <p className="text-sm text-gray-500">{title.characterCount} karakter</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </PermissionGuard>
  );
}