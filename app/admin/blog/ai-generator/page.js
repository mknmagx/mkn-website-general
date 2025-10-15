"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import useClaude from "../../../../hooks/use-claude";
import {
  getAllBlogCategories,
  addBlogPost,
} from "../../../../lib/services/blog-service";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeftIcon,
  SparklesIcon,
  Loader2,
  RefreshCw,
  Eye,
  Save,
  Brain,
  FileText,
  Lightbulb,
  Target,
  Edit,
  Settings,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { SmartImageSelection } from "@/components/smart-image-selection";

// Import servisler
import {
  estimateReadingTime,
  generateSlug,
  generateTags,
  mockGeneratedBlog,
  AI_PROMPTS,
  processBlogContent,
  convertMarkdownToHtml,
} from "../../../../lib/services/ai-blog-service";
import { htmlToMarkdown } from "../../../../lib/services/markdown-to-html";
import {
  parseAiJsonResponse,
  validateBlogData,
} from "../../../../lib/services/json-parser";
import {
  TOPIC_CATEGORIES,
  BLOG_SETTINGS_CONFIG,
} from "../../../../lib/data/blog-topics";

export default function AIBlogGeneratorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAdminAuth();
  const { generateContent, loading: aiLoading, error: aiError } = useClaude();
  const { toast } = useToast();

  // Ana state'ler
  const [activeTab, setActiveTab] = useState("topics");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [customTopic, setCustomTopic] = useState("");
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // AI improvement modal states
  const [showImproveModal, setShowImproveModal] = useState(false);
  const [improving, setImproving] = useState(false);

  // Blog ayarları
  const [blogDetails, setBlogDetails] = useState({
    targetKeywords: "",
    tone: "professional",
    length: "medium",
    includeStats: true,
    includeMKNInfo: true,
    includeCallToAction: true,
  });

  // Düzenleme modunda blog verisi
  const [editableBlog, setEditableBlog] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    categorySlug: "",
    author: user?.name || "MKN Group Uzmanları",
    featured: false,
    image: "",
    imageAlt: "",
    imageCredit: "",
    tags: "",
    metaDescription: "",
  });

  // Edit view mode - HTML or Markdown
  const [editViewMode, setEditViewMode] = useState("html");

  // Kategorileri yükle
  const loadCategories = async () => {
    try {
      const categoriesData = await getAllBlogCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Kategoriler yüklenirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Mock data test function
  const loadMockData = () => {
    setGeneratedBlog(mockGeneratedBlog);
    setSelectedCategory("ambalaj");
    setActiveTab("preview");

    toast({
      title: "Mock Data Yüklendi",
      description:
        "Test verisi başarıyla yüklendi. Önizleme sekmesine geçiliyor.",
      variant: "default",
    });
  };

  // Modal tabanlı metin güzelleştirme fonksiyonu
  const improveContent = async () => {
    if (!editableBlog.content) {
      toast({
        title: "Hata",
        description: "Güzelleştirilecek içerik bulunamadı!",
        variant: "destructive",
      });
      return;
    }

    setShowImproveModal(true);
  };

  // AI ile içerik iyileştirme
  const performContentImprovement = async () => {
    setImproving(true);
    setShowImproveModal(false);

    try {
      const improvePrompt = AI_PROMPTS.contentImprovement(editableBlog.content);
      const improvedContent = await generateContent(improvePrompt, {
        systemPrompt:
          "You are a professional content editor for MKN Group. Improve the given Turkish HTML content by making it more engaging, informative, and SEO-optimized while maintaining the original meaning and structure. Return only HTML content.",
        maxTokens: 3000,
        temperature: 0.5,
      });

      setEditableBlog({
        ...editableBlog,
        content: improvedContent, // AI already returns HTML
        readingTime: estimateReadingTime(improvedContent),
      });

      toast({
        title: "İçerik İyileştirildi",
        description: "İçerik AI ile başarıyla güzelleştirildi!",
        variant: "default",
      });
    } catch (error) {
      console.error("İçerik iyileştirme hatası:", error);
      toast({
        title: "Hata",
        description: "İçerik iyileştirme sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setImproving(false);
    }
  };

  // Etiketleri otomatik üret
  const handleGenerateTags = () => {
    const generatedTags = generateTags(
      editableBlog.content,
      editableBlog.title,
      editableBlog.excerpt,
      selectedCategory
    );

    setEditableBlog({
      ...editableBlog,
      tags: generatedTags,
    });

    toast({
      title: "Etiketler Oluşturuldu",
      description: "İçerik analizi yapılarak uygun etiketler üretildi.",
      variant: "default",
    });
  };

  // Blog üretme fonksiyonu
  const generateBlog = async () => {
    if (selectedTopics.length === 0 && !customTopic.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir konu seçin veya özel konu girin.",
        variant: "destructive",
      });
      return;
    }

    try {
      const topics =
        selectedTopics.length > 0 ? selectedTopics : [customTopic.trim()];

      const prompt = AI_PROMPTS.blogGeneration(topics, blogDetails);
      const response = await generateContent(prompt, {
        systemPrompt:
          "You are a professional content writer for MKN Group. Generate high-quality blog content in Turkish that is informative, engaging, and SEO-optimized. Always respond with valid JSON format.",
        maxTokens: 3000,
        temperature: 0.7,
      });

      console.log("AI Response:", response);

      let blogData;
      try {
        // Use enhanced JSON parser for AI responses
        blogData = parseAiJsonResponse(response);

        // Validate the parsed data
        blogData = validateBlogData(blogData);
      } catch (parseError) {
        console.error("AI Response parsing error:", parseError);
        console.error("Raw AI Response:", response);
        throw new Error(`AI yanıtı işlenemedi: ${parseError.message}`);
      }

      // Process blog content (AI already provides HTML)
      const processedBlog = {
        ...blogData,
        slug: generateSlug(blogData.title),
        readingTime: estimateReadingTime(blogData.content),
        topics: topics,
      };

      setGeneratedBlog(processedBlog);
      setActiveTab("preview");

      toast({
        title: "Blog Oluşturuldu",
        description:
          "AI blog yazısını başarıyla oluşturdu. Önizleme sekmesine geçiliyor.",
        variant: "default",
      });
    } catch (error) {
      console.error("Blog üretilirken hata:", error);
      toast({
        title: "Hata",
        description: `Blog üretilirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Blog kaydetme
  const handleSaveBlog = async () => {
    try {
      setSaving(true);

      const blogData = {
        ...editableBlog,
        tags: editableBlog.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        metaDescription: editableBlog.metaDescription || editableBlog.excerpt,
        publishedAt: new Date().toISOString().split("T")[0],
        readingTime:
          generatedBlog?.readingTime ||
          estimateReadingTime(editableBlog.content),
      };

      await addBlogPost(blogData);
      setShowSaveDialog(false);

      // Formu temizle
      setGeneratedBlog(null);
      setSelectedTopics([]);
      setCustomTopic("");
      setEditableBlog({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        categorySlug: "",
        author: user?.name || "MKN Group Uzmanları",
        featured: false,
        image: "",
        imageAlt: "",
        imageCredit: "",
        tags: "",
        metaDescription: "",
      });
      setActiveTab("topics");

      toast({
        title: "Blog Kaydedildi",
        description: "Blog yazısı başarıyla kaydedildi ve yayınlandı.",
        variant: "default",
      });

      router.push("/admin/blog");
    } catch (error) {
      console.error("Blog kaydedilirken hata:", error);
      toast({
        title: "Hata",
        description: `Blog kaydedilirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Smart image selection handler
  const handleImageSelect = (image) => {
    setEditableBlog(prev => ({
      ...prev,
      image: image.url,
      imageAlt: image.alt,
      imageCredit: `© ${image.photographer} - Pexels`
    }));

    toast({
      title: "Görsel Seçildi",
      description: `"${image.alt}" görseli başarıyla seçildi.`,
      variant: "default",
    });
  };

  // useEffect'ler
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setEditableBlog((prev) => ({ ...prev, author: user.name }));
    }
  }, [user]);

  // GeneratedBlog değiştiğinde editableBlog'u güncelle
  useEffect(() => {
    if (generatedBlog) {
      const newEditableBlog = {
        title: generatedBlog.title || "",
        slug: generatedBlog.slug || "",
        excerpt: generatedBlog.excerpt || "",
        content: generatedBlog.content || "",
        category: selectedCategory
          ? categories.find((c) => c.slug === selectedCategory)?.name || ""
          : "",
        categorySlug: selectedCategory || "",
        author: user?.name || "MKN Group Uzmanları",
        featured: false,
        image: "",
        imageAlt: "",
        imageCredit: "",
        tags: generatedBlog.tags || "",
        metaDescription:
          generatedBlog.metaDescription || generatedBlog.excerpt || "",
      };

      setEditableBlog(newEditableBlog);
    }
  }, [generatedBlog, selectedCategory, categories, user?.name]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="blog:write">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Blog Generator</h1>
              <p className="text-gray-600 mt-2">
                Yapay zeka destekli blog yazısı oluşturun
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={loadMockData}>
                <FileText className="mr-2 h-4 w-4" />
                Mock Test
              </Button>
              <Link href="/admin/blog">
                <Button variant="outline">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Geri Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Ana Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="topics">
              <Target className="mr-2 h-4 w-4" />
              Konular
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Ayarlar
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedBlog}>
              <Eye className="mr-2 h-4 w-4" />
              Önizleme
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!generatedBlog}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </TabsTrigger>
          </TabsList>

          {/* Konular Sekmesi */}
          <TabsContent value="topics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Konu Seçimi</CardTitle>
                <CardDescription>
                  Blog yazısı için konu kategorisi seçin ve istediğiniz konuları
                  belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Konu Kategorisi</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TOPIC_CATEGORIES).map(
                        ([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory && (
                  <div className="space-y-2">
                    <Label>Önerilen Konular</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {TOPIC_CATEGORIES[selectedCategory].topics.map(
                        (topic) => (
                          <div
                            key={topic}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedTopics.includes(topic)
                                ? "bg-primary/10 border-primary"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              if (selectedTopics.includes(topic)) {
                                setSelectedTopics(
                                  selectedTopics.filter((t) => t !== topic)
                                );
                              } else {
                                setSelectedTopics([...selectedTopics, topic]);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle
                                className={`h-4 w-4 ${
                                  selectedTopics.includes(topic)
                                    ? "text-primary"
                                    : "text-gray-300"
                                }`}
                              />
                              <span className="text-sm">{topic}</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="customTopic">Özel Konu</Label>
                  <Textarea
                    id="customTopic"
                    placeholder="Kendi konunuzu yazın..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    {selectedTopics.length > 0 || customTopic.trim()
                      ? `${selectedTopics.length} konu seçildi${
                          customTopic.trim() ? " + özel konu" : ""
                        }`
                      : "Hiç konu seçilmedi"}
                  </div>
                  <Button
                    onClick={() => setActiveTab("settings")}
                    disabled={
                      selectedTopics.length === 0 && !customTopic.trim()
                    }
                  >
                    Devam Et
                    <Lightbulb className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ayarlar Sekmesi */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blog Ayarları</CardTitle>
                <CardDescription>
                  Blog yazısının tonu, uzunluğu ve özelliklerini belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Yazım Tonu</Label>
                    <Select
                      value={blogDetails.tone}
                      onValueChange={(value) =>
                        setBlogDetails({ ...blogDetails, tone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOG_SETTINGS_CONFIG.tones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            <div>
                              <div className="font-medium">{tone.label}</div>
                              <div className="text-xs text-gray-500">
                                {tone.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>İçerik Uzunluğu</Label>
                    <Select
                      value={blogDetails.length}
                      onValueChange={(value) =>
                        setBlogDetails({ ...blogDetails, length: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOG_SETTINGS_CONFIG.lengths.map((length) => (
                          <SelectItem key={length.value} value={length.value}>
                            <div>
                              <div className="font-medium">{length.label}</div>
                              <div className="text-xs text-gray-500">
                                {length.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetKeywords">
                    Hedef Anahtar Kelimeler
                  </Label>
                  <Input
                    id="targetKeywords"
                    placeholder="Örn: fason üretim, kozmetik, MKN Group"
                    value={blogDetails.targetKeywords}
                    onChange={(e) =>
                      setBlogDetails({
                        ...blogDetails,
                        targetKeywords: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <Label>İçerik Özellikleri</Label>
                  {BLOG_SETTINGS_CONFIG.features.map((feature) => (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{feature.label}</div>
                        <div className="text-sm text-gray-500">
                          {feature.description}
                        </div>
                      </div>
                      <Switch
                        checked={blogDetails[feature.key]}
                        onCheckedChange={(checked) =>
                          setBlogDetails({
                            ...blogDetails,
                            [feature.key]: checked,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("topics")}
                  >
                    Geri
                  </Button>
                  <Button onClick={generateBlog} disabled={aiLoading}>
                    {aiLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Üretiliyor...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Blog Üret
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Önizleme Sekmesi */}
          <TabsContent value="preview" className="space-y-6">
            {generatedBlog && (
              <Card>
                <CardHeader>
                  <CardTitle>Blog Önizlemesi</CardTitle>
                  <CardDescription>
                    Üretilen blog yazısını inceleyin ve gerekirse düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {generatedBlog.readingTime || 0}
                      </div>
                      <div className="text-sm text-blue-600">Dakika Okuma</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {generatedBlog.content?.split(" ").length || 0}
                      </div>
                      <div className="text-sm text-green-600">Kelime</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {generatedBlog.tags?.split(",").length || 0}
                      </div>
                      <div className="text-sm text-purple-600">Etiket</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Başlık</h3>
                      <p className="text-gray-700">{generatedBlog.title}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Özet</h3>
                      <p className="text-gray-700">{generatedBlog.excerpt}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">Etiketler</h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedBlog.tags?.split(",").map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">
                        İçerik Önizlemesi
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm">
                          {generatedBlog.content?.substring(0, 1000)}
                          {generatedBlog.content?.length > 1000 && "..."}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("settings")}
                    >
                      Ayarlara Dön
                    </Button>
                    <Button onClick={() => setActiveTab("edit")}>
                      Düzenle
                      <Edit className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Düzenleme Sekmesi */}
          <TabsContent value="edit" className="space-y-6">
            {generatedBlog && (
              <Card>
                <CardHeader>
                  <CardTitle>Blog Düzenleme</CardTitle>
                  <CardDescription>
                    Blog içeriğini ihtiyaçlarınıza göre düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editTitle">Başlık</Label>
                      <Input
                        id="editTitle"
                        value={editableBlog.title}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setEditableBlog({
                            ...editableBlog,
                            title: newTitle,
                            slug: generateSlug(newTitle),
                          });
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        {editableBlog.title?.length || 0}/60 karakter (SEO için
                        ideal)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editSlug">Slug</Label>
                      <Input
                        id="editSlug"
                        value={editableBlog.slug}
                        onChange={(e) =>
                          setEditableBlog({
                            ...editableBlog,
                            slug: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        URL dostu format (otomatik oluşturulur)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editExcerpt">Özet</Label>
                    <Textarea
                      id="editExcerpt"
                      value={editableBlog.excerpt}
                      onChange={(e) =>
                        setEditableBlog({
                          ...editableBlog,
                          excerpt: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Blog yazısının kısa özeti (200-250 karakter önerilir)"
                    />
                    <p className="text-xs text-gray-500">
                      {editableBlog.excerpt?.length || 0}/250 karakter
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="editContent">İçerik</Label>
                      <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex rounded-md border">
                          <Button
                            variant={editViewMode === "html" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setEditViewMode("html")}
                            className="rounded-r-none border-r"
                          >
                            HTML
                          </Button>
                          <Button
                            variant={editViewMode === "markdown" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setEditViewMode("markdown")}
                            className="rounded-l-none"
                          >
                            Markdown
                          </Button>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={improveContent}
                          disabled={improving || !editableBlog.content}
                        >
                          {improving ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              İyileştiriliyor...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="mr-2 h-3 w-3" />
                              Metni Güzelleştir
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Content Editor */}
                    <div className="space-y-2">
                      <Textarea
                        id="editContent"
                        value={
                          editViewMode === "html" 
                            ? editableBlog.content 
                            : htmlToMarkdown(editableBlog.content)
                        }
                        onChange={(e) => {
                          const newContent = e.target.value;
                          setEditableBlog({
                            ...editableBlog,
                            content: editViewMode === "html" 
                              ? newContent 
                              : convertMarkdownToHtml(newContent),
                          });
                        }}
                        rows={20}
                        className="font-mono text-sm"
                        placeholder={
                          editViewMode === "html" 
                            ? "HTML formatında içerik yazın..." 
                            : "Markdown formatında içerik yazın..."
                        }
                      />
                      <p className="text-xs text-gray-500">
                        {editViewMode === "html" 
                          ? "HTML etiketlerini kullanarak düzenleyin. Veritabanında HTML formatında saklanacak." 
                          : "Markdown formatında yazın. Otomatik olarak HTML'e dönüştürülecek."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="editTags">Etiketler</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateTags}
                          disabled={!editableBlog.content}
                        >
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Otomatik Üret
                        </Button>
                      </div>
                      <Input
                        id="editTags"
                        value={editableBlog.tags}
                        onChange={(e) =>
                          setEditableBlog({
                            ...editableBlog,
                            tags: e.target.value,
                          })
                        }
                        placeholder="etiket1, etiket2, etiket3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editCategory">Kategori</Label>
                      <Select
                        value={editableBlog.categorySlug}
                        onValueChange={(value) => {
                          const category = categories.find(
                            (c) => c.slug === value
                          );
                          setEditableBlog({
                            ...editableBlog,
                            category: category?.name || "",
                            categorySlug: value,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.slug}
                              value={category.slug}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editMetaDescription">Meta Açıklama</Label>
                    <Textarea
                      id="editMetaDescription"
                      value={editableBlog.metaDescription}
                      onChange={(e) =>
                        setEditableBlog({
                          ...editableBlog,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="SEO için meta açıklama (150-160 karakter)"
                    />
                    <p className="text-xs text-gray-500">
                      {editableBlog.metaDescription?.length || 0}/160 karakter
                    </p>
                  </div>

                  {/* Smart Image Selection */}
                  <div className="space-y-4">
                    <SmartImageSelection
                      onImageSelect={handleImageSelect}
                      blogTitle={editableBlog.title}
                      blogContent={editableBlog.content}
                      blogTags={editableBlog.tags ? editableBlog.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []}
                      selectedImageUrl={editableBlog.image}
                      className="border rounded-lg p-4"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("preview")}
                    >
                      Önizlemeye Dön
                    </Button>
                    <Button onClick={() => setShowSaveDialog(true)}>
                      <Save className="mr-2 h-4 w-4" />
                      Blog'u Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Kaydetme Onay Dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Blog'u Kaydet</AlertDialogTitle>
              <AlertDialogDescription>
                Blog yazısını kaydetmek istediğinizden emin misiniz? Bu işlem
                blog'u yayınlayacaktır.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveBlog} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Kaydet"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* İçerik İyileştirme Onay Modal */}
        <Dialog open={showImproveModal} onOpenChange={setShowImproveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-500" />
                İçerik İyileştirme
              </DialogTitle>
              <DialogDescription>
                İçeriği AI ile iyileştirmek istediğinizden emin misiniz?
                <br />
                <span className="text-red-500 font-medium">
                  Mevcut içerik değişecektir ve bu işlem geri alınamaz.
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">
                AI iyileştirme kapsamı:
              </h4>
              <ul className="text-sm space-y-1 text-purple-800">
                <li>• Daha akıcı ve anlaşılır dil kullanımı</li>
                <li>• SEO dostu anahtar kelime optimizasyonu</li>
                <li>• Paragraf yapısının optimize edilmesi</li>
                <li>• Teknik detayların anlaşılır hale getirilmesi</li>
                <li>• MKN Group uzmanlık alanlarının vurgulanması</li>
              </ul>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowImproveModal(false)}
                disabled={improving}
              >
                İptal
              </Button>
              <Button
                onClick={performContentImprovement}
                disabled={improving}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {improving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İyileştiriliyor...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    Evet, İyileştir
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
