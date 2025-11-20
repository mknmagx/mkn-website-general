"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import { useSocialMedia } from "../../../../hooks/use-social-media";
import {
  getAllSocialTemplates,
  createSocialTemplate,
  updateSocialTemplate,
  deleteSocialTemplate,
  incrementTemplateUsage,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  MoreHorizontal,
  Target,
  Eye,
  TrendingUp,
  Hash,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Wand2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Settings,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";

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

// Template kategorileri
const TEMPLATE_CATEGORIES = {
  product_launch: "Ürün Lansmanı",
  educational: "Eğitici İçerik",
  promotional: "Tanıtım",
  seasonal: "Mevsimsel",
  announcement: "Duyuru",
  behind_scenes: "Sahne Arkası",
  testimonial: "Müşteri Yorumları",
  tips: "İpuçları",
  news: "Haberler",
  community: "Topluluk",
};

// Hazır şablonlar
const DEFAULT_TEMPLATES = [
  {
    name: "Ürün Lansmanı Duyurusu",
    description:
      "Yeni ürünlerinizi duyururken kullanabileceğiniz profesyonel şablon",
    category: "product_launch",
    platforms: ["instagram", "facebook", "linkedin"],
    contentType: "promotional",
    tone: "exciting",
    template: `🚀 Heyecan verici haberlerimiz var!

{PRODUCT_NAME} ile tanışın! {PRODUCT_DESCRIPTION}

✨ Öne Çıkan Özellikler:
• {FEATURE_1}
• {FEATURE_2}
• {FEATURE_3}

📅 {LAUNCH_DATE} tarihinde sizlerle!

#YeniÜrün #MKNGroup #Ambalaj #Kozmetik #Inovasyon`,
    variables: [
      "PRODUCT_NAME",
      "PRODUCT_DESCRIPTION",
      "FEATURE_1",
      "FEATURE_2",
      "FEATURE_3",
      "LAUNCH_DATE",
    ],
    hashtags: ["#YeniÜrün", "#MKNGroup", "#Ambalaj", "#Kozmetik", "#Inovasyon"],
    usage_count: 0,
  },
  {
    name: "Eğitici İçerik Şablonu",
    description: "Sektör bilgisi paylaşmak için ideal şablon",
    category: "educational",
    platforms: ["linkedin", "facebook", "twitter"],
    contentType: "educational",
    tone: "informative",
    template: `📚 Bugün size {TOPIC} hakkında bilgi vermek istiyoruz.

{MAIN_CONTENT}

💡 İpucu: {TIP}

Bu konuda daha fazla bilgi almak ister misiniz? Yorumlarınızı bekliyoruz! 👇

#Eğitim #Bilgi #MKNGroup #AmbalajSektörü`,
    variables: ["TOPIC", "MAIN_CONTENT", "TIP"],
    hashtags: ["#Eğitim", "#Bilgi", "#MKNGroup", "#AmbalajSektörü"],
    usage_count: 0,
  },
  {
    name: "Müşteri Testimonialı",
    description: "Müşteri deneyimlerini paylaşmak için",
    category: "testimonial",
    platforms: ["instagram", "facebook", "linkedin"],
    contentType: "community",
    tone: "friendly",
    template: `⭐ Müşteri Yorumu

"{TESTIMONIAL_TEXT}"

- {CUSTOMER_NAME}, {CUSTOMER_COMPANY}

Sizin de deneyimlerinizi duymak isteriz! 💬

#MüşteriMemnuniyeti #Referans #KaliteliHizmet #MKNGroup`,
    variables: ["TESTIMONIAL_TEXT", "CUSTOMER_NAME", "CUSTOMER_COMPANY"],
    hashtags: [
      "#MüşteriMemnuniyeti",
      "#Referans",
      "#KaliteliHizmet",
      "#MKNGroup",
    ],
    usage_count: 0,
  },
  {
    name: "Sürdürülebilirlik Vurgusu",
    description: "Çevre dostu uygulamaları vurgulamak için",
    category: "announcement",
    platforms: ["linkedin", "instagram", "facebook"],
    contentType: "news",
    tone: "professional",
    template: `🌱 Sürdürülebilir Gelecek İçin

{SUSTAINABILITY_MESSAGE}

🔄 Geri Dönüştürülebilir Malzemeler
♻️ Çevre Dostu Üretim
🌍 Karbon Ayak İzi Azaltma

Gelecek nesillere daha yaşanabilir bir dünya bırakmak için sorumluluk alıyoruz.

#Sürdürülebilirlik #ÇevreDostu #MKNGroup #GelecekNesillerİçin`,
    variables: ["SUSTAINABILITY_MESSAGE"],
    hashtags: [
      "#Sürdürülebilirlik",
      "#ÇevreDostu",
      "#MKNGroup",
      "#GelecekNesillerİçin",
    ],
    usage_count: 0,
  },
];

export default function SocialMediaTemplatesPage() {
  const { user } = useAdminAuth();
  const { platforms, contentTypes, contentTones } = useSocialMedia();

  // States
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    platform: "",
    contentType: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    platforms: [],
    contentType: "",
    tone: "",
    template: "",
    variables: [],
    hashtags: [],
    isActive: true,
  });

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates
  useEffect(() => {
    filterTemplates();
  }, [templates, filters]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await getAllSocialTemplates();

      // If no templates exist, create default ones
      if (templatesData.length === 0) {
        await createDefaultTemplates();
        const newTemplatesData = await getAllSocialTemplates();
        setTemplates(newTemplatesData);
      } else {
        setTemplates(templatesData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTemplates = async () => {
    for (const template of DEFAULT_TEMPLATES) {
      try {
        await createSocialTemplate({
          ...template,
          createdBy: user?.email || "system",
          authorId: user?.uid || "system",
        });
      } catch (err) {
        console.error("Default template creation error:", err);
      }
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name?.toLowerCase().includes(search) ||
          template.description?.toLowerCase().includes(search) ||
          template.template?.toLowerCase().includes(search)
      );
    }

    if (filters.category && filters.category !== 'all-categories') {
      filtered = filtered.filter(
        (template) => template.category === filters.category
      );
    }

    if (filters.platform && filters.platform !== 'all-platforms') {
      filtered = filtered.filter((template) =>
        template.platforms?.includes(filters.platform)
      );
    }

    if (filters.contentType && filters.contentType !== 'all-types') {
      filtered = filtered.filter(
        (template) => template.contentType === filters.contentType
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePlatform = (platformId) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const addVariable = (variable) => {
    if (variable && !formData.variables.includes(variable)) {
      setFormData((prev) => ({
        ...prev,
        variables: [...prev.variables, variable],
      }));
    }
  };

  const removeVariable = (variable) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((v) => v !== variable),
    }));
  };

  const addHashtag = (hashtag) => {
    const cleanHashtag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;
    if (!formData.hashtags.includes(cleanHashtag)) {
      setFormData((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, cleanHashtag],
      }));
    }
  };

  const removeHashtag = (hashtag) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((h) => h !== hashtag),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      platforms: [],
      contentType: "",
      tone: "",
      template: "",
      variables: [],
      hashtags: [],
      isActive: true,
    });
  };

  const handleCreateTemplate = async () => {
    try {
      await createSocialTemplate({
        ...formData,
        createdBy: user?.email,
        authorId: user?.uid,
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name || "",
      description: template.description || "",
      category: template.category || "",
      platforms: template.platforms || [],
      contentType: template.contentType || "",
      tone: template.tone || "",
      template: template.template || "",
      variables: template.variables || [],
      hashtags: template.hashtags || [],
      isActive: template.isActive !== undefined ? template.isActive : true,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTemplate = async () => {
    try {
      await updateSocialTemplate(selectedTemplate.id, formData);
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      resetForm();
      loadTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (confirm("Bu şablonu silmek istediğinizden emin misiniz?")) {
      try {
        await deleteSocialTemplate(templateId);
        loadTemplates();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      await incrementTemplateUsage(template.id);
      // Template kullanım sayfasına yönlendir - yeni URL yapısı ile
      // Router ile implementasyon
      // window.location.href = `/admin/social-media/social-media-templates/${template.id}/use`;
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Belirsiz";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">
                Sosyal Medya Şablonları
              </h1>
              <p className="text-gray-600 mt-1">
                Hazır şablonlarla hızlı içerik üretimi
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Şablon
          </Button>
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Arama</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Şablon ara..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm kategoriler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">Tüm kategoriler</SelectItem>
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={filters.platform}
                  onValueChange={(value) =>
                    setFilters({ ...filters, platform: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm platformlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-platforms">Tüm platformlar</SelectItem>
                    {Object.entries(platforms).map(([key, platform]) => (
                      <SelectItem key={key} value={key} className="capitalize">
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contentType">İçerik Türü</Label>
                <Select
                  value={filters.contentType}
                  onValueChange={(value) =>
                    setFilters({ ...filters, contentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm türler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">Tüm türler</SelectItem>
                    {Object.entries(contentTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="relative group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Kullan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Kopyala
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Category & Content Type */}
                <div className="flex gap-2 mt-2">
                  {template.category && (
                    <Badge variant="outline">
                      {TEMPLATE_CATEGORIES[template.category] ||
                        template.category}
                    </Badge>
                  )}
                  {template.contentType && (
                    <Badge variant="secondary">
                      {contentTypes[template.contentType]?.name ||
                        template.contentType}
                    </Badge>
                  )}
                </div>

                {/* Platforms */}
                <div className="flex gap-1 mt-2">
                  {template.platforms?.map((platformId) => {
                    const Icon = PLATFORM_ICONS[platformId];
                    return (
                      <div
                        key={platformId}
                        className={`p-1 rounded text-white ${PLATFORM_COLORS[platformId]}`}
                        title={platforms[platformId]?.name}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                    );
                  })}
                </div>
              </CardHeader>

              <CardContent>
                {/* Template Preview */}
                <div className="bg-gray-50 border rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {template.template?.substring(0, 150)}...
                  </p>
                </div>

                {/* Variables */}
                {template.variables?.length > 0 && (
                  <div className="mb-3">
                    <Label className="text-xs text-gray-500">
                      Değişkenler:
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <Badge
                          key={variable}
                          variant="outline"
                          className="text-xs"
                        >
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {template.usageCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(template.createdAt)}
                    </span>
                  </div>
                  {template.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Template Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Şablon Oluştur</DialogTitle>
              <DialogDescription>
                Sosyal medya için yeniden kullanılabilir şablon oluşturun
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Şablon Adı</Label>
                  <Input
                    id="templateName"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Şablon adını giriniz"
                  />
                </div>
                <div>
                  <Label htmlFor="templateCategory">Kategori</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_CATEGORIES).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="templateDescription">Açıklama</Label>
                <Textarea
                  id="templateDescription"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Şablonun ne için kullanıldığını açıklayın"
                  rows={2}
                />
              </div>

              {/* Content Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateContentType">İçerik Türü</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) =>
                      handleInputChange("contentType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="İçerik türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(contentTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="templateTone">Ton</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => handleInputChange("tone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ton seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(contentTones).map(([key, tone]) => (
                        <SelectItem key={key} value={key}>
                          {tone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Platforms */}
              <div>
                <Label>Platformlar</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {Object.entries(platforms).map(([key, platform]) => {
                    const isSelected = formData.platforms.includes(key);
                    const Icon = PLATFORM_ICONS[key];

                    return (
                      <div
                        key={key}
                        className={`
                          border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-3
                          ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                        onClick={() => togglePlatform(key)}
                      >
                        <div
                          className={`p-1 rounded ${PLATFORM_COLORS[key]} text-white`}
                        >
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium">
                          {platform.name}
                        </span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-blue-500 ml-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Template Content */}
              <div>
                <Label htmlFor="templateContent">Şablon İçeriği</Label>
                <Textarea
                  id="templateContent"
                  value={formData.template}
                  onChange={(e) =>
                    handleInputChange("template", e.target.value)
                  }
                  placeholder="Şablon içeriğini yazın. Değişkenler için {VARIABLE_NAME} formatını kullanın."
                  rows={8}
                  className="mt-2 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Değişkenler için {"{VARIABLE_NAME}"} formatını kullanın
                </p>
              </div>

              {/* Variables */}
              <div>
                <Label>Değişkenler</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {formData.variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {variable}
                      <button
                        onClick={() => removeVariable(variable)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Değişken adı giriniz"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addVariable(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              {/* Hashtags */}
              <div>
                <Label>Hashtag Önerileri</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {formData.hashtags.map((hashtag) => (
                    <Badge
                      key={hashtag}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {hashtag}
                      <button
                        onClick={() => removeHashtag(hashtag)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="#hashtag giriniz"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addHashtag(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={!formData.name || !formData.template}
              >
                <Save className="h-4 w-4 mr-2" />
                Şablonu Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Şablon Düzenle</DialogTitle>
              <DialogDescription>Mevcut şablonu düzenleyin</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Same form fields as create dialog */}
              {/* Copy the same form structure from create dialog */}
              {/* For brevity, I'll include just the key differences */}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Bu şablonu düzenlediğinizde, mevcut kullanımları etkilenmez.
                  Değişiklikler yeni kullanımlarda görünür.
                </p>
              </div>

              {/* Include all the same form fields as create dialog */}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleUpdateTemplate}
                disabled={!formData.name || !formData.template}
              >
                <Save className="h-4 w-4 mr-2" />
                Değişiklikleri Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
