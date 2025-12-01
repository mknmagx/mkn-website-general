"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  PermissionGuard,
  usePermissions,
} from "@/components/admin-route-guard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Sparkles,
  MoreVertical,
  Trash2,
  Edit2,
  Save,
  Download,
  Folder,
  FileText,
  Grid3x3,
  Layers,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Zap,
  Check,
  Eye,
  X,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import * as socialMediaService from "@/lib/services/social-media-service";

const CATEGORIES = [
  { value: "fason-kozmetik", label: "Fason - Kozmetik", icon: "💄" },
  { value: "fason-gida", label: "Fason - Gıda", icon: "🍃" },
  { value: "fason-temizlik", label: "Fason - Temizlik", icon: "🧼" },
  { value: "kozmetik-ambalaj", label: "Kozmetik Ambalaj", icon: "📦" },
  { value: "e-ticaret-operasyon", label: "E-Ticaret", icon: "🚚" },
  { value: "dijital-pazarlama", label: "Dijital Pazarlama", icon: "📱" },
  { value: "tasarim", label: "Tasarım", icon: "🎨" },
  { value: "marka-olusturma", label: "Marka Oluşturma", icon: "✨" },
];

const PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-500",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "from-blue-500 to-blue-600",
  },
  { value: "x", label: "X", icon: Twitter, color: "from-gray-700 to-gray-900" },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-600 to-blue-700",
  },
];

const CONTENT_TYPES = {
  instagram: [
    {
      value: "post",
      label: "Post",
      color: "bg-blue-100 text-blue-700",
      icon: "📸",
    },
    {
      value: "reel",
      label: "Reel",
      color: "bg-purple-100 text-purple-700",
      icon: "🎬",
    },
    {
      value: "story",
      label: "Story",
      color: "bg-pink-100 text-pink-700",
      icon: "⚡",
    },
  ],
  facebook: [
    {
      value: "post",
      label: "Post",
      color: "bg-blue-100 text-blue-700",
      icon: "📝",
    },
    {
      value: "video",
      label: "Video",
      color: "bg-indigo-100 text-indigo-700",
      icon: "🎥",
    },
  ],
  x: [
    {
      value: "tweet",
      label: "Tweet",
      color: "bg-sky-100 text-sky-700",
      icon: "🐦",
    },
    {
      value: "thread",
      label: "Thread",
      color: "bg-cyan-100 text-cyan-700",
      icon: "🧵",
    },
  ],
  linkedin: [
    {
      value: "post",
      label: "Post",
      color: "bg-blue-100 text-blue-700",
      icon: "💼",
    },
    {
      value: "carousel",
      label: "Carousel",
      color: "bg-violet-100 text-violet-700",
      icon: "🎠",
    },
    {
      value: "article",
      label: "Article",
      color: "bg-emerald-100 text-emerald-700",
      icon: "📰",
    },
  ],
};

const AI_MODELS = [
  { value: "claude-sonnet-4", label: "Sonnet 4 (Önerilen)" },
  { value: "claude-opus-4", label: "Opus 4 (Güçlü)" },
  { value: "claude-haiku-4", label: "Haiku 4 (Hızlı)" },
];

export default function DatasetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id;
  const { hasPermission } = usePermissions();

  const [dataset, setDataset] = useState(null);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Dataset editable fields
  const [name, setName] = useState("");

  // Multi-select states (used for both single and multi-select)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  // Content types stored as "platform:contentType" for unique identification
  const [selectedContentTypes, setSelectedContentTypes] = useState([]);

  // Generation summary dialog
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [generationSummary, setGenerationSummary] = useState(null);

  // Generation settings
  const [count, setCount] = useState(10);
  const [aiModel, setAiModel] = useState("claude-sonnet-4");
  const [customPrompt, setCustomPrompt] = useState("");

  // Filter states for title library
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterContentType, setFilterContentType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  
  // Title details dialog
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [selectedTitleDetails, setSelectedTitleDetails] = useState(null);

  useEffect(() => {
    if (datasetId) {
      fetchDataset();
      fetchTitles();
    }
  }, [datasetId]);

  const fetchDataset = async () => {
    try {
      const response = await fetch(
        `/api/admin/social-media/datasets/${datasetId}`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      setDataset(data.dataset);
      setName(data.dataset.name || "");
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Dataset yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchTitles = async () => {
    try {
      const response = await fetch(
        `/api/admin/social-media/datasets/${datasetId}/titles`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTitles(data.titles || []);
    } catch (error) {
      console.error("Fetch titles error:", error);
    }
  };

  const handleGenerate = async () => {
    // Get single values from arrays (for single-select mode)
    const category = selectedCategories[0];
    const platformContentType = selectedContentTypes[0]; // format: "platform:contentType"

    if (!category || !platformContentType) {
      toast.error("Lütfen kategori, platform ve içerik tipi seçin");
      return;
    }

    // Parse platform:contentType
    const [platform, contentType] = platformContentType.split(":");

    setGenerating(true);
    try {
      const response = await fetch("/api/admin/social-media/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          platform,
          contentType,
          count,
          aiModel,
          customPrompt,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");
      const data = await response.json();

      await saveGeneratedTitles(data.titles, category, platform, contentType);

      toast.success(`${data.titles.length} başlık oluşturuldu!`);
      fetchTitles();
      fetchDataset();
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Başlık oluşturulamadı");
    } finally {
      setGenerating(false);
    }
  };

  // Calculate batch generation summary
  const calculateBatchSummary = () => {
    const categories = selectedCategories.length || 0;
    const contentTypes = selectedContentTypes.length || 0; // Each is already platform:contentType

    if (categories === 0 || contentTypes === 0) {
      return null;
    }

    // Total combinations = categories × (platform:contentType pairs)
    const totalCombinations = categories * contentTypes;
    const estimatedTitles = totalCombinations * count;

    return {
      categories: selectedCategories,
      contentTypes: selectedContentTypes,
      totalCombinations,
      estimatedTitles,
      countPerRequest: count,
      aiModel,
    };
  };

  // Handle multi-select batch generation
  const handleMultiSelectGenerate = async () => {
    const summary = calculateBatchSummary();
    if (!summary) {
      toast.error("Lütfen en az 1 kategori, 1 platform ve 1 içerik tipi seçin");
      return;
    }

    // Show summary dialog first
    setGenerationSummary(summary);
    setShowSummaryDialog(true);
  };

  // Confirm and execute batch generation
  const executeBatchGeneration = async () => {
    setShowSummaryDialog(false);
    setGenerating(true);
    let totalGenerated = 0;
    let successCount = 0;
    let failCount = 0;

    try {
      const combinations = [];

      // Create all combinations
      for (const cat of selectedCategories) {
        for (const platformContentType of selectedContentTypes) {
          // Parse platform:contentType format
          const [platform, contentType] = platformContentType.split(":");
          combinations.push({ category: cat, platform, contentType });
        }
      }

      // Execute each combination
      for (let i = 0; i < combinations.length; i++) {
        const { category, platform, contentType } = combinations[i];

        try {
          const response = await fetch(
            "/api/admin/social-media/generate-titles",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category,
                platform,
                contentType,
                count,
                aiModel,
                customPrompt,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            await saveGeneratedTitles(
              data.titles,
              category,
              platform,
              contentType
            );
            totalGenerated += data.titles.length;
            successCount++;
          } else {
            failCount++;
            console.error(`Failed for ${category}-${platform}-${contentType}`);
          }
        } catch (error) {
          failCount++;
          console.error(
            `Error for ${category}-${platform}-${contentType}:`,
            error
          );
        }

        // Progress feedback
        if ((i + 1) % 3 === 0) {
          toast.info(`İlerleme: ${i + 1}/${combinations.length} tamamlandı...`);
        }
      }

      toast.success(
        `✅ ${successCount} başarılı, ${failCount} başarısız - Toplam ${totalGenerated} başlık oluşturuldu!`
      );

      // Reset selections
      setSelectedCategories([]);
      setSelectedPlatforms([]);
      setSelectedContentTypes([]);

      fetchTitles();
      fetchDataset();
    } catch (error) {
      console.error("Batch generation error:", error);
      toast.error("Toplu üretim hatası");
    } finally {
      setGenerating(false);
    }
  };

  const saveGeneratedTitles = async (generatedTitles, cat, plat, cType) => {
    const titlesToSave = generatedTitles.map((t) => ({
      ...t,
      datasetId,
      category: cat,
      platform: plat,
      contentType: cType,
      createdAt: new Date().toISOString(),
      status: "draft",
    }));

    const response = await fetch(
      `/api/admin/social-media/datasets/${datasetId}/titles`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles: titlesToSave }),
      }
    );

    if (!response.ok) throw new Error("Failed to save titles");
  };

  const handleDeleteTitle = async (id) => {
    if (!confirm("Bu başlığı silmek istediğinizden emin misiniz?")) return;

    try {
      await fetch(
        `/api/admin/social-media/datasets/${datasetId}/titles/${id}`,
        {
          method: "DELETE",
        }
      );

      setTitles(titles.filter((t) => t.id !== id));
      toast.success("Başlık silindi");
      fetchDataset();
    } catch (error) {
      toast.error("Silme başarısız");
    }
  };

  const handleSaveTitle = async (id, updatedTitle) => {
    try {
      await fetch(
        `/api/admin/social-media/datasets/${datasetId}/titles/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTitle),
        }
      );

      setTitles(
        titles.map((t) => (t.id === id ? { ...t, ...updatedTitle } : t))
      );
      setEditingId(null);
      toast.success("Başlık güncellendi");
    } catch (error) {
      toast.error("Güncelleme başarısız");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(titles, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name || "dataset"}-titles-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    toast.success("Başlıklar dışa aktarıldı");
  };

  // Calculate stats
  const platformCounts = {};
  const categoryCounts = {};
  titles.forEach((title) => {
    platformCounts[title.platform] = (platformCounts[title.platform] || 0) + 1;
    categoryCounts[title.category] = (categoryCounts[title.category] || 0) + 1;
  });

  const getPlatformIcon = (platformValue) => {
    const platform = PLATFORMS.find((p) => p.value === platformValue);
    return platform?.icon || FileText;
  };

  const getContentTypeInfo = (platform, contentType) => {
    const types = CONTENT_TYPES[platform] || [];
    return (
      types.find((t) => t.value === contentType) || {
        label: contentType,
        color: "bg-gray-100 text-gray-700",
        icon: "📄",
      }
    );
  };

  // Navigate to content studio with selected title
  const handleOpenInContentStudio = (title) => {
    // Store the selected title data in session storage for content studio to pick up
    sessionStorage.setItem('contentStudioTitle', JSON.stringify({
      id: title.id,
      title: title.title,
      description: title.description,
      category: title.category,
      platform: title.platform,
      contentType: title.contentType,
      datasetId: title.datasetId,
      emotionalHook: title.emotionalHook,
      trendAlignment: title.trendAlignment,
      visualPotential: title.visualPotential
    }));
    router.push('/admin/social-media/content-studio');
  };

  // View title details
  const handleViewDetails = (title) => {
    setSelectedTitleDetails(title);
    setShowTitleDialog(true);
  };

  // Load content in Content Studio for editing
  const handleViewContent = async (postId) => {
    try {
      // Fetch single content by ID using service
      const content = await socialMediaService.getGeneratedContentById(postId);
      
      // Store content in sessionStorage for content-studio to load
      sessionStorage.setItem("editingContent", JSON.stringify(content));
      
      // Navigate to content studio
      router.push("/admin/social-media/content-studio?mode=edit");
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('İçerik yüklenemedi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Dataset bulunamadı</div>
      </div>
    );
  }

  // Get unique categories, platforms, and content types from existing titles
  const uniqueCategories = [...new Set(titles.map((t) => t.category))];
  const uniquePlatforms = [...new Set(titles.map((t) => t.platform))];
  const uniqueContentTypes = [...new Set(titles.map((t) => t.contentType))];

  // Filtered titles
  const filteredTitles = titles.filter((title) => {
    const matchesCategory =
      filterCategory === "all" || title.category === filterCategory;
    const matchesPlatform =
      filterPlatform === "all" || title.platform === filterPlatform;
    const matchesContentType =
      filterContentType === "all" || title.contentType === filterContentType;
    const matchesSearch =
      !searchQuery ||
      title.title.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      matchesCategory && matchesPlatform && matchesContentType && matchesSearch
    );
  });

  return (
    <PermissionGuard requiredPermission="social_media.read">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      router.push("/admin/social-media/title-library")
                    }
                    className="rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 shadow-lg">
                        <Folder className="h-5 w-5 text-white" />
                      </div>
                      {name}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="h-10 px-4 rounded-xl text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Dışa Aktar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-6 overflow-auto max-w-7xl">
            <div className="space-y-6">
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="h-6 w-6 opacity-80" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight">
                      {titles.length}
                    </div>
                    <div className="text-xs mt-1 opacity-80">Toplam Başlık</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Layers className="h-6 w-6 opacity-80" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight">
                      {PLATFORMS.length}
                    </div>
                    <div className="text-xs mt-1 opacity-80">Platform</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Grid3x3 className="h-6 w-6 opacity-80" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight">
                      {CATEGORIES.length}
                    </div>
                    <div className="text-xs mt-1 opacity-80">Kategori</div>
                  </div>
                </div>

                {/* Generate Card */}
                <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Başlık Üret
                      </h2>
                      <p className="text-sm text-gray-500">
                        Tekli veya çoklu seçim yaparak başlık oluşturun
                      </p>
                    </div>

                    {/* Category Selection - Unified */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                        Kategori Seçin
                        {selectedCategories.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 text-[10px]"
                          >
                            {selectedCategories.length} seçili
                          </Badge>
                        )}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => {
                          const isSelected = selectedCategories.includes(
                            cat.value
                          );
                          return (
                            <button
                              key={cat.value}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCategories(
                                    selectedCategories.filter(
                                      (c) => c !== cat.value
                                    )
                                  );
                                } else {
                                  setSelectedCategories([
                                    ...selectedCategories,
                                    cat.value,
                                  ]);
                                }
                              }}
                              className={`
                              px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                              ${
                                isSelected
                                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md scale-105"
                                  : "bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                              }
                            `}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                              {isSelected && <Check className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Platform Selection - Unified */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                        Platform Seçin
                        {selectedPlatforms.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 text-[10px]"
                          >
                            {selectedPlatforms.length} seçili
                          </Badge>
                        )}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map((plat) => {
                          const Icon = plat.icon;
                          const isSelected = selectedPlatforms.includes(
                            plat.value
                          );
                          return (
                            <button
                              key={plat.value}
                              onClick={() => {
                                if (isSelected) {
                                  // Remove platform and its content types
                                  setSelectedPlatforms(
                                    selectedPlatforms.filter(
                                      (p) => p !== plat.value
                                    )
                                  );
                                  // Remove content types belonging to this platform
                                  setSelectedContentTypes(
                                    selectedContentTypes.filter(
                                      (ct) => !ct.startsWith(`${plat.value}:`)
                                    )
                                  );
                                } else {
                                  setSelectedPlatforms([
                                    ...selectedPlatforms,
                                    plat.value,
                                  ]);
                                }
                              }}
                              className={`
                              px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                              ${
                                isSelected
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105"
                                  : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                              }
                            `}
                            >
                              <Icon className="h-3 w-3" />
                              <span>{plat.label}</span>
                              {isSelected && <Check className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Content Type - Unified */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                        İçerik Tipi
                        {selectedPlatforms.length === 0 && (
                          <span className="text-[10px] text-gray-400">
                            (önce platform seçin)
                          </span>
                        )}
                        {selectedContentTypes.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 text-[10px]"
                          >
                            {selectedContentTypes.length} seçili
                          </Badge>
                        )}
                      </Label>
                      {selectedPlatforms.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPlatforms
                            .flatMap((plat) =>
                              (CONTENT_TYPES[plat] || []).map((ct) => ({
                                platform: plat,
                                value: ct.value,
                                label: ct.label,
                                uniqueKey: `${plat}:${ct.value}`,
                              }))
                            )
                            .map((type, index) => {
                              const isSelected = selectedContentTypes.includes(
                                type.uniqueKey
                              );
                              const platformInfo = PLATFORMS.find(
                                (p) => p.value === type.platform
                              );
                              return (
                                <button
                                  key={type.uniqueKey}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedContentTypes(
                                        selectedContentTypes.filter(
                                          (ct) => ct !== type.uniqueKey
                                        )
                                      );
                                    } else {
                                      setSelectedContentTypes([
                                        ...selectedContentTypes,
                                        type.uniqueKey,
                                      ]);
                                    }
                                  }}
                                  className={`
                                  px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                                  ${
                                    isSelected
                                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md scale-105"
                                      : "bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
                                  }
                                `}
                                >
                                  <span className="text-[10px] opacity-70">
                                    {platformInfo?.label}:
                                  </span>
                                  <span>{type.label}</span>
                                  {isSelected && <Check className="h-3 w-3" />}
                                </button>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                          Önce platform seçin
                        </div>
                      )}
                    </div>

                    {/* Count */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Oluşturulacak Adet
                        </Label>
                        <div className="flex gap-2">
                          {[5, 10, 20, 30].map((num) => {
                            const isSelected = count === num;
                            return (
                              <button
                                key={num}
                                onClick={() => setCount(num)}
                                className={`
                                    flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                                    ${
                                      isSelected
                                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700"
                                    }
                                  `}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">
                          Özel Miktar
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={count}
                          onChange={(e) => setCount(parseInt(e.target.value))}
                          placeholder="veya özel..."
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    {/* AI Model */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        AI Model
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {AI_MODELS.map((model) => {
                          const isSelected = aiModel === model.value;
                          return (
                            <div
                              key={model.value}
                              onClick={() => setAiModel(model.value)}
                              className={`
                                  relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 text-center
                                  ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50 shadow-sm"
                                      : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                                  }
                                `}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <Sparkles
                                  className={`h-4 w-4 ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-400"
                                  }`}
                                />
                                <span className="text-xs font-medium text-gray-900">
                                  {model.label.split(" ")[0]}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {model.label.split(" ").slice(1).join(" ")}
                                </span>
                                {isSelected && (
                                  <Check className="h-3 w-3 text-blue-600 absolute top-1 right-1" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Özel Prompt (Opsiyonel)
                      </Label>
                      <Input
                        placeholder="Ek talimat..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="h-9 rounded-lg text-sm"
                      />
                    </div>

                    {/* Summary Preview - Auto shows when selections made */}
                    {selectedCategories.length > 0 &&
                      selectedContentTypes.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200 shadow-sm">
                          <div className="text-xs text-gray-600 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                Toplam Kombinasyon:
                              </span>
                              <span className="font-bold text-purple-600">
                                {selectedCategories.length} ×{" "}
                                {selectedContentTypes.length} ={" "}
                                {selectedCategories.length *
                                  selectedContentTypes.length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                Tahmini Başlık:
                              </span>
                              <span className="font-bold text-green-600">
                                ~
                                {selectedCategories.length *
                                  selectedContentTypes.length *
                                  count}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-purple-200">
                              <span className="font-medium">Mod:</span>
                              <span className="font-bold text-blue-600">
                                {selectedCategories.length === 1 &&
                                selectedContentTypes.length === 1
                                  ? "Tekli"
                                  : "Çoklu Batch"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {hasPermission("social_media.create") && (
                      <Button
                        onClick={() => {
                          // Auto-detect: if all selections are 1, do single generation, otherwise do batch
                          const isSingle =
                            selectedCategories.length === 1 &&
                            selectedContentTypes.length === 1;
                          if (isSingle) {
                            handleGenerate();
                          } else {
                            handleMultiSelectGenerate();
                          }
                        }}
                        disabled={
                          generating ||
                          selectedCategories.length === 0 ||
                          selectedContentTypes.length === 0
                        }
                        className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {selectedCategories.length === 1 &&
                        selectedContentTypes.length === 1 ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            {generating ? "Oluşturuluyor..." : "Başlık Oluştur"}
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            {generating
                              ? "Toplu Üretim Yapılıyor..."
                              : `${
                                  selectedCategories.length *
                                  selectedContentTypes.length
                                } Kombinasyon Üret`}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Platform Breakdown */}
                <Card className="border-0 shadow-md rounded-xl overflow-hidden bg-white">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Platform Dağılımı
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(platformCounts).length === 0 ? (
                        <p className="text-xs text-gray-500">
                          Henüz başlık üretilmedi
                        </p>
                      ) : (
                        Object.entries(platformCounts)
                          .slice(0, 4)
                          .map(([plat, count]) => {
                            const platInfo = PLATFORMS.find(
                              (p) => p.value === plat
                            );
                            const Icon = platInfo?.icon || FileText;
                            const percentage = Math.round(
                              (count / titles.length) * 100
                            );

                            return (
                              <div key={plat}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-3 w-3 text-gray-600" />
                                    <span className="text-xs font-medium text-gray-700">
                                      {platInfo?.label || plat}
                                    </span>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-900">
                                    {count}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Title Library Mini Preview */}
        <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col">
          <div className="sticky top-0 bg-white z-10">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Başlık Kütüphanesi
                  </h2>
                  <p className="text-xs text-gray-500">
                    {titles.length} başlık üretildi
                  </p>
                </div>
                <Button
                  onClick={() => setShowLibraryDialog(true)}
                  className="h-9 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Tümünü Gör
                </Button>
              </div>
            </div>

            {/* Mini Preview - Son 5 Başlık */}
            <div className="p-5">
              <p className="text-xs font-medium text-gray-500 mb-3">
                Son Eklenenler
              </p>
              <div className="space-y-2">
                {titles.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Henüz başlık üretilmedi
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Yukarıdan başlık oluşturun
                    </p>
                  </div>
                ) : (
                  titles.slice(0, 5).map((title) => {
                    const Icon = getPlatformIcon(title.platform);
                    const catInfo = CATEGORIES.find(
                      (c) => c.value === title.category
                    );
                    const contentInfo = getContentTypeInfo(
                      title.platform,
                      title.contentType
                    );

                    return (
                      <div
                        key={title.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-3 w-3 text-gray-600 flex-shrink-0" />
                          {catInfo && (
                            <span className="text-[10px] text-gray-500">
                              {catInfo.icon}
                            </span>
                          )}
                          <span
                            className={`text-[10px] h-4 px-1.5 rounded-md flex items-center gap-0.5 font-medium ${contentInfo.color}`}
                          >
                            {contentInfo.icon} {contentInfo.label}
                          </span>
                          {title.usedPosts && title.usedPosts.length > 0 && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] bg-green-50 text-green-700 border-green-200">
                              ✓ {title.usedPosts.length}x
                            </Badge>
                          )}
                        </div>
                        <p 
                          className="text-xs text-gray-900 leading-relaxed line-clamp-2 mb-2"
                          onClick={() => handleViewDetails(title)}
                        >
                          {title.title}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[10px]"
                            onClick={() => handleOpenInContentStudio(title)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Content Studio'da Aç
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {titles.length > 5 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowLibraryDialog(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    +{titles.length - 5} başlık daha
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Page Dialog */}
        <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
          <DialogContent
            className="p-0"
            style={{
              maxWidth: "95vw",
              width: "95vw",
              maxHeight: "95vh",
              height: "95vh",
            }}
          >
            <DialogHeader className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                  Başlık Kütüphanesi
                  <Badge variant="secondary" className="text-sm">
                    {filteredTitles.length} başlık
                  </Badge>
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLibraryDialog(false)}
                  className="rounded-lg"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Search and Filters */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Başlıklarda ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-10 rounded-lg"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Category Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-700">
                      Kategori:
                    </span>
                    <button
                      onClick={() => setFilterCategory("all")}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filterCategory === "all"
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      Tümü
                    </button>
                    {CATEGORIES.filter((cat) =>
                      uniqueCategories.includes(cat.value)
                    ).map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setFilterCategory(cat.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          filterCategory === cat.value
                            ? "bg-purple-100 text-purple-700 font-medium"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Separator */}
                  <div className="h-8 w-px bg-gray-300"></div>

                  {/* Platform Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-700">
                      Platform:
                    </span>
                    <button
                      onClick={() => setFilterPlatform("all")}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filterPlatform === "all"
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      Tümü
                    </button>
                    {PLATFORMS.filter((plat) =>
                      uniquePlatforms.includes(plat.value)
                    ).map((plat) => {
                      const Icon = plat.icon;
                      return (
                        <button
                          key={plat.value}
                          onClick={() => setFilterPlatform(plat.value)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                            filterPlatform === plat.value
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {Icon && <Icon className="h-3 w-3" />}
                          {plat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Separator */}
                  <div className="h-8 w-px bg-gray-300"></div>

                  {/* Content Type Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-700">
                      İçerik Tipi:
                    </span>
                    <button
                      onClick={() => setFilterContentType("all")}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filterContentType === "all"
                          ? "bg-green-100 text-green-700 font-medium"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      Tümü
                    </button>
                    {uniqueContentTypes.map((ct) => {
                      // Find the platform for this content type to get proper info
                      const titleWithType = titles.find(
                        (t) => t.contentType === ct
                      );
                      const contentInfo = titleWithType
                        ? getContentTypeInfo(titleWithType.platform, ct)
                        : null;

                      if (!contentInfo) return null;

                      return (
                        <button
                          key={ct}
                          onClick={() => setFilterContentType(ct)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                            filterContentType === ct
                              ? contentInfo.color
                                  .replace("bg-", "bg-")
                                  .replace("text-", "text-") + " font-medium"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {contentInfo.icon} {contentInfo.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Titles Grid */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {filteredTitles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Başlık Bulunamadı
                    </h3>
                    <p className="text-sm text-gray-500">
                      {titles.length === 0
                        ? "Henüz başlık üretilmedi"
                        : "Filtrelerinize uygun başlık bulunamadı"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredTitles.map((title) => {
                      const Icon = getPlatformIcon(title.platform);
                      const catInfo = CATEGORIES.find(
                        (c) => c.value === title.category
                      );
                      const contentInfo = getContentTypeInfo(
                        title.platform,
                        title.contentType
                      );

                      return (
                        <div
                          key={title.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all group bg-white"
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Icon className="h-4 w-4 text-gray-600" />
                              {catInfo && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-5 px-2"
                                >
                                  {catInfo.icon} {catInfo.label}
                                </Badge>
                              )}
                              {title.usedPosts && title.usedPosts.length > 0 && (
                                <Badge className="h-5 px-2 text-[10px] bg-green-500 hover:bg-green-600">
                                  <Check className="h-3 w-3 mr-1" />
                                  {title.usedPosts.length} içerikte kullanıldı
                                </Badge>
                              )}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(title)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detayları Gör
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenInContentStudio(title)}>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Content Studio'da Aç
                                </DropdownMenuItem>
                                {title.usedPosts && title.usedPosts.length > 0 && (
                                  <DropdownMenuItem onClick={() => handleViewDetails(title)}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Kullanıldığı İçerikleri Gör ({title.usedPosts.length})
                                  </DropdownMenuItem>
                                )}
                                {hasPermission("social_media.edit") && (
                                  <>
                                    {editingId === title.id ? (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          const newTitle =
                                            document.getElementById(
                                              `edit-dialog-${title.id}`
                                            ).value;
                                          handleSaveTitle(title.id, {
                                            title: newTitle,
                                          });
                                        }}
                                      >
                                        <Save className="h-4 w-4 mr-2" />
                                        Kaydet
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() => setEditingId(title.id)}
                                      >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Düzenle
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                                {hasPermission("social_media.delete") && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTitle(title.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Sil
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium mb-3 ${contentInfo.color}`}
                          >
                            {contentInfo.icon} {contentInfo.label}
                          </span>

                          {editingId === title.id ? (
                            <Textarea
                              defaultValue={title.title}
                              className="min-h-[100px] rounded-lg text-sm"
                              id={`edit-dialog-${title.id}`}
                            />
                          ) : (
                            <div>
                              <p 
                                className="text-sm text-gray-900 leading-relaxed cursor-pointer hover:text-purple-600 transition-colors"
                                onClick={() => handleViewDetails(title)}
                              >
                                {title.title}
                              </p>
                              {title.description && (
                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                  {title.description}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Quick actions - always visible */}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-8 text-xs"
                              onClick={() => handleOpenInContentStudio(title)}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              Content Studio'da Aç
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Title Details Dialog */}
        <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedTitleDetails && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Başlık Detayları
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Header badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const Icon = getPlatformIcon(selectedTitleDetails.platform);
                      const catInfo = CATEGORIES.find(
                        (c) => c.value === selectedTitleDetails.category
                      );
                      const contentInfo = getContentTypeInfo(
                        selectedTitleDetails.platform,
                        selectedTitleDetails.contentType
                      );
                      return (
                        <>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {PLATFORMS.find(p => p.value === selectedTitleDetails.platform)?.label}
                          </Badge>
                          {catInfo && (
                            <Badge variant="outline">
                              {catInfo.icon} {catInfo.label}
                            </Badge>
                          )}
                          <Badge className={contentInfo.color}>
                            {contentInfo.icon} {contentInfo.label}
                          </Badge>
                          {selectedTitleDetails.usedPosts && selectedTitleDetails.usedPosts.length > 0 && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              {selectedTitleDetails.usedPosts.length} içerikte kullanıldı
                            </Badge>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Title */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                      {selectedTitleDetails.title}
                    </h3>
                  </div>

                  {/* Description */}
                  {selectedTitleDetails.description && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Açıklama</Label>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedTitleDetails.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Emotional Hook */}
                  {selectedTitleDetails.emotionalHook && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Duygusal Çengel</Label>
                      <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                        <p className="text-sm text-gray-700">
                          {selectedTitleDetails.emotionalHook}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Visual Potential */}
                  {selectedTitleDetails.visualPotential && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Görsel Potansiyel</Label>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-gray-700">
                          {selectedTitleDetails.visualPotential}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Trend Alignment */}
                  {selectedTitleDetails.trendAlignment && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Trend Uyumu</Label>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-sm text-gray-700">
                          {selectedTitleDetails.trendAlignment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Used Posts */}
                  {selectedTitleDetails.usedPosts && selectedTitleDetails.usedPosts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Kullanıldığı İçerikler ({selectedTitleDetails.usedPosts.length})
                      </Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedTitleDetails.usedPosts.map((post, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-300 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const Icon = getPlatformIcon(post.platform);
                                  return <Icon className="h-4 w-4 text-gray-600" />;
                                })()}
                                <Badge variant="outline" className="text-xs">
                                  {post.contentType}
                                </Badge>
                              </div>
                              {post.postId && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewContent(post.postId);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Görüntüle
                                </Button>
                              )}
                            </div>
                            {post.visualPotential && (
                              <p className="text-xs text-gray-600">
                                {post.visualPotential}
                              </p>
                            )}
                            {post.createdAt && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      className="w-full"
                      onClick={() => {
                        handleOpenInContentStudio(selectedTitleDetails);
                        setShowTitleDialog(false);
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Content Studio'da Aç
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Batch Generation Summary Dialog */}
        <AlertDialog
          open={showSummaryDialog}
          onOpenChange={setShowSummaryDialog}
        >
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-5 w-5 text-purple-600" />
                Toplu Başlık Üretimi Onayı
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-600">
                Aşağıdaki kombinasyonlar için AI ile başlık üretilecek. Devam
                etmek istiyor musunuz?
              </AlertDialogDescription>
            </AlertDialogHeader>

            {generationSummary && (
              <div className="space-y-4 py-4">
                {/* Selected Items */}
                <div className="grid gap-3">
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-1.5">
                      <span>📂</span> Kategoriler (
                      {generationSummary.categories.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {generationSummary.categories.map((cat) => {
                        const catInfo = CATEGORIES.find((c) => c.value === cat);
                        return (
                          <Badge
                            key={cat}
                            variant="secondary"
                            className="text-xs"
                          >
                            {catInfo?.icon} {catInfo?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1.5">
                      <span>📝</span> Platform × İçerik Tipleri (
                      {generationSummary.contentTypes.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {generationSummary.contentTypes.map(
                        (platformContentType) => {
                          // Parse platform:contentType format
                          const [platformValue, contentTypeValue] =
                            platformContentType.split(":");
                          const platInfo = PLATFORMS.find(
                            (p) => p.value === platformValue
                          );
                          const ctInfo = CONTENT_TYPES[platformValue]?.find(
                            (ct) => ct.value === contentTypeValue
                          );
                          const Icon = platInfo?.icon;

                          return (
                            <Badge
                              key={platformContentType}
                              variant="secondary"
                              className="text-xs flex items-center gap-1"
                            >
                              {Icon && <Icon className="h-3 w-3" />}
                              <span className="font-semibold">
                                {platInfo?.label}:
                              </span>
                              <span>{ctInfo?.label}</span>
                            </Badge>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        Toplam Kombinasyon
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {generationSummary.totalCombinations}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {generationSummary.categories.length} ×{" "}
                        {generationSummary.contentTypes.length}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        Tahmini Başlık Sayısı
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ~{generationSummary.estimatedTitles}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        Her kombinasyon için {generationSummary.countPerRequest}{" "}
                        başlık
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-xs text-gray-600 mb-1">AI Model</div>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {AI_MODELS.find(
                          (m) => m.value === generationSummary.aiModel
                        )?.label || generationSummary.aiModel}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <div className="text-xs text-amber-800">
                    <strong>Not:</strong> Bu işlem{" "}
                    {generationSummary.totalCombinations} adet AI çağrısı
                    yapacaktır. İşlem süresi kombinasyon sayısına göre birkaç
                    dakika sürebilir.
                  </div>
                </div>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                İptal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={executeBatchGeneration}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl"
              >
                <Zap className="h-4 w-4 mr-2" />
                Üretimi Başlat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  );
}
