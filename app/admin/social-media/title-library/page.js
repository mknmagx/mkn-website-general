"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import { useTitleGenerator } from "../../../../hooks/use-title-generator";
import { recordTitleUsage } from "../../../../lib/services/title-service";

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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Sparkles,
  Heart,
  Copy,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  Wand2,
  Save,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  Hash,
  Calendar
} from "lucide-react";

import Link from "next/link";

export default function TitleLibraryPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  
  const {
    generateTitles,
    optimizeTitle,
    analyzeTitle,
    loadSavedTitles,
    saveTitle,
    saveTitles,
    updateTitle,
    deleteTitle,
    companyContext,
    titleCategories,
    titleTones,
    getSuggestedTopics,
    generateTrendingTopics,
    loading
  } = useTitleGenerator();

  // States
  const [titles, setTitles] = useState([]);
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTone, setSelectedTone] = useState("all");
  const [selectedBusinessArea, setSelectedBusinessArea] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Dialog states
  const [showNewTitleDialog, setShowNewTitleDialog] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Selected items
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [titleToDelete, setTitleToDelete] = useState(null);
  const [titleAnalysis, setTitleAnalysis] = useState(null);

  // New title form
  const [newTitleData, setNewTitleData] = useState({
    text: "",
    category: "educational",
    tone: "professional",
    businessArea: "general",
    targetAudience: "genel",
    topic: "",
    contentType: "blog"
  });

  const [generateConfig, setGenerateConfig] = useState({
    topic: "",
    category: "educational",
    tone: "professional",
    businessArea: "all",
    targetAudience: "genel",
    count: 10,
    useCustomTopic: false,
    customTopic: ""
  });

  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [error, setError] = useState(null);

  // Load titles on mount
  useEffect(() => {
    loadTitles();
  }, []);

  // Filter titles when search/filters change
  useEffect(() => {
    filterTitles();
  }, [titles, searchQuery, selectedCategory, selectedTone, selectedBusinessArea, sortBy, sortOrder]);

  // Load titles from database
  const loadTitles = async () => {
    try {
      const loadedTitles = await loadSavedTitles();
      setTitles(loadedTitles);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter and sort titles
  const filterTitles = () => {
    let filtered = [...titles];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(title =>
        title.text.toLowerCase().includes(query) ||
        title.topic.toLowerCase().includes(query) ||
        title.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(title => title.category === selectedCategory);
    }

    // Tone filter
    if (selectedTone && selectedTone !== "all") {
      filtered = filtered.filter(title => title.tone === selectedTone);
    }

    // Business area filter
    if (selectedBusinessArea && selectedBusinessArea !== "all") {
      filtered = filtered.filter(title => title.businessArea === selectedBusinessArea);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'usage.clickCount' || sortBy === 'usage.copyCount') {
        aValue = a.usage?.[sortBy.split('.')[1]] || 0;
        bValue = b.usage?.[sortBy.split('.')[1]] || 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTitles(filtered);
  };

  // Handle title generation
  const handleGenerateTitles = async () => {
    const topic = generateConfig.useCustomTopic ? generateConfig.customTopic : generateConfig.topic;
    
    if (!topic?.trim()) {
      setError("Lütfen bir konu belirtin");
      return;
    }

    try {
      setError(null);
      const titles = await generateTitles({
        topic: topic,
        category: generateConfig.category,
        tone: generateConfig.tone,
        businessArea: generateConfig.businessArea === "all" ? null : generateConfig.businessArea,
        targetAudience: generateConfig.targetAudience,
        count: generateConfig.count,
        contentType: 'mixed'
      });

      setGeneratedTitles(titles);
    } catch (err) {
      setError(err.message);
    }
  };

  // Save generated titles
  const handleSaveGeneratedTitles = async (titlesToSave) => {
    try {
      const savedTitles = await saveTitles(titlesToSave.map(title => ({
        ...title,
        createdBy: user?.email || 'system'
      })));
      
      setTitles(prev => [...savedTitles, ...prev]);
      setGeneratedTitles([]);
      setShowGenerateDialog(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create new title manually
  const handleCreateTitle = async () => {
    if (!newTitleData.text.trim()) {
      setError("Başlık metni gerekli");
      return;
    }

    try {
      const savedTitle = await saveTitle({
        ...newTitleData,
        isCustom: true,
        createdBy: user?.email || 'system'
      });

      setTitles(prev => [savedTitle, ...prev]);
      setNewTitleData({
        text: "",
        category: "educational",
        tone: "professional",
        businessArea: "general",
        targetAudience: "genel",
        topic: "",
        contentType: "blog"
      });
      setShowNewTitleDialog(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle title actions
  const handleCopyTitle = async (title) => {
    try {
      await navigator.clipboard.writeText(title.text);
      await recordTitleUsage(title.id, 'copy');
      
      // Update local state
      setTitles(prev => prev.map(t => 
        t.id === title.id 
          ? { ...t, usage: { ...t.usage, copyCount: (t.usage?.copyCount || 0) + 1 } }
          : t
      ));
    } catch (err) {
      setError("Kopyalama başarısız");
    }
  };

  const handleToggleFavorite = async (title) => {
    try {
      const updatedTitle = await updateTitle(title.id, {
        isFavorite: !title.isFavorite
      });

      setTitles(prev => prev.map(t => t.id === title.id ? updatedTitle : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnalyzeTitle = async (title) => {
    try {
      setSelectedTitle(title);
      const analysis = await analyzeTitle(title.text);
      setTitleAnalysis(analysis);
      setShowAnalysisDialog(true);
      
      await recordTitleUsage(title.id, 'click');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTitle = async () => {
    try {
      await deleteTitle(titleToDelete.id);
      setTitles(prev => prev.filter(t => t.id !== titleToDelete.id));
      setShowDeleteDialog(false);
      setTitleToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Stats calculation
  const stats = {
    total: titles.length,
    favorites: titles.filter(t => t.isFavorite).length,
    custom: titles.filter(t => t.isCustom).length,
    ai: titles.filter(t => !t.isCustom).length,
    totalClicks: titles.reduce((sum, t) => sum + (t.usage?.clickCount || 0), 0),
    totalCopies: titles.reduce((sum, t) => sum + (t.usage?.copyCount || 0), 0)
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
                  Sosyal Medyaya Dön
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Başlık Kütüphanesi</h1>
                <p className="text-gray-600 mt-1">
                  AI destekli başlık üretimi ve yönetimi
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowGenerateDialog(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Üret
              </Button>
              <Button onClick={() => setShowNewTitleDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Başlık
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600">Toplam Başlık</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.favorites}</p>
                <p className="text-sm text-gray-600">Favoriler</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.ai}</p>
                <p className="text-sm text-gray-600">AI Üretimi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.custom}</p>
                <p className="text-sm text-gray-600">Manuel</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.totalClicks}</p>
                <p className="text-sm text-gray-600">Tıklama</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-teal-600">{stats.totalCopies}</p>
                <p className="text-sm text-gray-600">Kopyalama</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search">Ara</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Başlık, konu veya etiket ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Kategori</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm kategoriler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm kategoriler</SelectItem>
                      {Object.entries(titleCategories).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ton</Label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm tonlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm tonlar</SelectItem>
                      {Object.entries(titleTones).map(([key, tone]) => (
                        <SelectItem key={key} value={key}>{tone.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>İş Alanı</Label>
                  <Select value={selectedBusinessArea} onValueChange={setSelectedBusinessArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm alanlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm alanlar</SelectItem>
                      {companyContext.businessAreas.map(area => (
                        <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sırala</Label>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">En Yeni</SelectItem>
                      <SelectItem value="createdAt-asc">En Eski</SelectItem>
                      <SelectItem value="text-asc">A-Z</SelectItem>
                      <SelectItem value="text-desc">Z-A</SelectItem>
                      <SelectItem value="usage.clickCount-desc">En Çok Tıklanan</SelectItem>
                      <SelectItem value="usage.copyCount-desc">En Çok Kopyalanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Title List */}
          <div className="grid gap-3">
            {filteredTitles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz başlık yok
                  </h3>
                  <p className="text-gray-600 mb-4">
                    İlk başlıklarınızı oluşturarak başlayın
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setShowGenerateDialog(true)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI ile Üret
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewTitleDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Manuel Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredTitles.map((title) => (
                <Card key={title.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg mb-2 line-clamp-2">
                          {title.text}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">
                            {titleCategories[title.category]?.name}
                          </Badge>
                          <Badge variant="outline">
                            {titleTones[title.tone]?.name}
                          </Badge>
                          {title.businessArea && (
                            <Badge variant="outline" className="bg-blue-50">
                              {companyContext.businessAreas.find(a => a.id === title.businessArea)?.name}
                            </Badge>
                          )}
                          {title.isCustom && (
                            <Badge variant="outline" className="bg-purple-50">
                              Manuel
                            </Badge>
                          )}
                          {title.isFavorite && (
                            <Badge variant="outline" className="bg-red-50">
                              <Heart className="h-3 w-3 mr-1" />
                              Favori
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{title.characterCount} karakter</span>
                          {title.topic && <span>Konu: {title.topic}</span>}
                          <span>{title.usage?.clickCount || 0} tıklama</span>
                          <span>{title.usage?.copyCount || 0} kopyalama</span>
                          <span>{new Date(title.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyTitle(title)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Kopyala</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFavorite(title)}
                              className={title.isFavorite ? 'text-red-500' : ''}
                            >
                              <Heart className={`h-4 w-4 ${title.isFavorite ? 'fill-current' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {title.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAnalyzeTitle(title)}
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Analiz Et</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setNewTitleData({
                                text: title.text,
                                category: title.category,
                                tone: title.tone,
                                businessArea: title.businessArea,
                                targetAudience: title.targetAudience,
                                topic: title.topic,
                                contentType: title.contentType
                              });
                              setShowNewTitleDialog(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setTitleToDelete(title);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* New Title Dialog */}
          <Dialog open={showNewTitleDialog} onOpenChange={setShowNewTitleDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {newTitleData.text ? 'Başlığı Düzenle' : 'Yeni Başlık Oluştur'}
                </DialogTitle>
                <DialogDescription>
                  Manuel olarak yeni bir başlık oluşturun
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="titleText">Başlık Metni *</Label>
                  <Textarea
                    id="titleText"
                    value={newTitleData.text}
                    onChange={(e) => setNewTitleData(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Başlığınızı buraya yazın..."
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {newTitleData.text.length} karakter
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kategori</Label>
                    <Select 
                      value={newTitleData.category}
                      onValueChange={(value) => setNewTitleData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(titleCategories).map(([key, cat]) => (
                          <SelectItem key={key} value={key}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Ton</Label>
                    <Select 
                      value={newTitleData.tone}
                      onValueChange={(value) => setNewTitleData(prev => ({ ...prev, tone: value }))}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>İş Alanı (Opsiyonel)</Label>
                    <Select 
                      value={newTitleData.businessArea || "general"}
                      onValueChange={(value) => setNewTitleData(prev => ({ ...prev, businessArea: value === "general" ? null : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Genel</SelectItem>
                        {companyContext.businessAreas.map(area => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Hedef Kitle</Label>
                    <Select 
                      value={newTitleData.targetAudience}
                      onValueChange={(value) => setNewTitleData(prev => ({ ...prev, targetAudience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="genel">Genel</SelectItem>
                        <SelectItem value="B2B">İşletmeler (B2B)</SelectItem>
                        <SelectItem value="B2C">Bireysel (B2C)</SelectItem>
                        <SelectItem value="uzman">Uzmanlar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="topic">Konu (Opsiyonel)</Label>
                  <Input
                    id="topic"
                    value={newTitleData.topic}
                    onChange={(e) => setNewTitleData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Bu başlığın ana konusu..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewTitleDialog(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={handleCreateTitle}
                    disabled={!newTitleData.text.trim() || loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Kaydediyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Generate Titles Dialog */}
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Başlık Üretici
                </DialogTitle>
                <DialogDescription>
                  MKN Group'un iş dallarına uygun başlıklar üretin
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Generation Config */}
                <div className="space-y-4">
                  {/* Topic Selection */}
                  <div className="space-y-3">
                    <Label>Konu Seçimi *</Label>
                    
                    {/* Topic Type Selection */}
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="predefined"
                          name="topicType"
                          checked={!generateConfig.useCustomTopic}
                          onChange={() => setGenerateConfig(prev => ({ 
                            ...prev, 
                            useCustomTopic: false,
                            customTopic: ""
                          }))}
                          className="text-blue-600"
                        />
                        <label htmlFor="predefined" className="text-sm font-medium">
                          Hazır Konular
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="custom"
                          name="topicType"
                          checked={generateConfig.useCustomTopic}
                          onChange={() => setGenerateConfig(prev => ({ 
                            ...prev, 
                            useCustomTopic: true,
                            topic: ""
                          }))}
                          className="text-blue-600"
                        />
                        <label htmlFor="custom" className="text-sm font-medium">
                          Özel Konu
                        </label>
                      </div>
                    </div>

                    {/* Predefined Topics */}
                    {!generateConfig.useCustomTopic && (
                      <div className="space-y-3">
                        <Select 
                          value={generateConfig.topic}
                          onValueChange={(value) => setGenerateConfig(prev => ({ ...prev, topic: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Hazır konulardan seçin..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {companyContext.predefinedTopics.map((categoryGroup) => (
                              <div key={categoryGroup.category}>
                                <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 bg-gray-50">
                                  {categoryGroup.category === 'ambalaj' && '📦 Ambalaj'}
                                  {categoryGroup.category === 'kozmetik-uretim' && '🧴 Kozmetik Üretim'}
                                  {categoryGroup.category === 'e-ticaret' && '🛒 E-ticaret'}
                                  {categoryGroup.category === 'pazarlama' && '📱 Pazarlama'}
                                  {categoryGroup.category === 'genel' && '🏢 Genel'}
                                  {categoryGroup.category === 'trend' && '📈 Trend & İnovasyon'}
                                </div>
                                {categoryGroup.topics.map((topic) => (
                                  <SelectItem key={topic} value={topic}>
                                    {topic}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Quick Topic Suggestions */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500">Hızlı seçim:</span>
                          {['Sürdürülebilir ambalaj çözümleri', 'ISO 22716 kalite güvencesi', 'E-ticaret fulfillment hizmetleri'].map((topic) => (
                            <button
                              key={topic}
                              onClick={() => setGenerateConfig(prev => ({ ...prev, topic }))}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Topic Input */}
                    {generateConfig.useCustomTopic && (
                      <Input
                        value={generateConfig.customTopic}
                        onChange={(e) => setGenerateConfig(prev => ({ ...prev, customTopic: e.target.value }))}
                        placeholder="Özel konunuzu yazın..."
                        className="w-full"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Kategori</Label>
                      <Select 
                        value={generateConfig.category}
                        onValueChange={(value) => setGenerateConfig(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(titleCategories).map(([key, cat]) => (
                            <SelectItem key={key} value={key}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Ton</Label>
                      <Select 
                        value={generateConfig.tone}
                        onValueChange={(value) => setGenerateConfig(prev => ({ ...prev, tone: value }))}
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

                    <div>
                      <Label>İş Alanı</Label>
                      <Select 
                        value={generateConfig.businessArea || "all"}
                        onValueChange={(value) => setGenerateConfig(prev => ({ ...prev, businessArea: value === "all" ? null : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tüm alanlar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm alanlar</SelectItem>
                          {companyContext.businessAreas.map(area => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Hedef Kitle</Label>
                      <Select 
                        value={generateConfig.targetAudience}
                        onValueChange={(value) => setGenerateConfig(prev => ({ ...prev, targetAudience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="genel">Genel</SelectItem>
                          <SelectItem value="B2B">İşletmeler (B2B)</SelectItem>
                          <SelectItem value="B2C">Bireysel (B2C)</SelectItem>
                          <SelectItem value="uzman">Uzmanlar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateTitles}
                    disabled={loading || (generateConfig.useCustomTopic ? !generateConfig.customTopic?.trim() : !generateConfig.topic)}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Üretiliyor...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Başlık Üret
                      </>
                    )}
                  </Button>
                </div>

                {/* Generated Results */}
                {generatedTitles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        Üretilen Başlıklar ({generatedTitles.length})
                      </h4>
                      <Button
                        onClick={() => handleSaveGeneratedTitles(generatedTitles)}
                        disabled={loading}
                      >
                        {loading ? (
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

                    <div className="grid gap-2 max-h-64 overflow-y-auto">
                      {generatedTitles.map((title, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{title.text}</p>
                              <p className="text-sm text-gray-500">
                                {title.characterCount} karakter
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyTitle(title)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveGeneratedTitles([title])}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Analysis Dialog */}
          <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Başlık Analizi
                </DialogTitle>
                <DialogDescription>
                  {selectedTitle?.text}
                </DialogDescription>
              </DialogHeader>

              {titleAnalysis && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    {typeof titleAnalysis === 'string' ? titleAnalysis : JSON.stringify(titleAnalysis, null, 2)}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Başlığı Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  "{titleToDelete?.text}" başlığını silmek istediğinizden emin misiniz? 
                  Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTitle}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    </PermissionGuard>
  );
}