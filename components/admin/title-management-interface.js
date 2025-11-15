import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Settings,
  BarChart3,
  Target,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  Brain,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  getAllTitleDatasets,
  deleteTitleDataset,
  getDatasetStats,
  DEFAULT_TITLE_CATEGORIES,
} from "@/lib/services/blog-title-service";
import AITitleGenerator from "./ai-title-generator";
import TitleUsageTracker from "./title-usage-tracker";

const TitleManagementInterface = ({ className }) => {
  const { toast } = useToast();

  // States
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasetStats, setDatasetStats] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("datasets");
  const [refreshing, setRefreshing] = useState(false);

  // Load datasets
  const loadDatasets = async () => {
    try {
      setLoading(true);
      const datasetsData = await getAllTitleDatasets();
      setDatasets(datasetsData);
    } catch (error) {
      console.error("Datasets yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Datasets yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load dataset stats
  const loadDatasetStats = async (datasetId) => {
    try {
      const stats = await getDatasetStats(datasetId);
      setDatasetStats(stats);
    } catch (error) {
      console.error("Dataset istatistikleri yüklenirken hata:", error);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      loadDatasetStats(selectedDataset.id);
    }
  }, [selectedDataset]);

  // Refresh datasets
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDatasets();
    setRefreshing(false);
    toast({
      title: "Güncellenme Başarılı",
      description: "Dataset listesi yenilendi.",
      variant: "default",
    });
  };

  // Delete dataset
  const handleDeleteDataset = async () => {
    if (!datasetToDelete) return;

    setDeleting(true);
    try {
      await deleteTitleDataset(datasetToDelete.id);
      await loadDatasets();

      toast({
        title: "Dataset Silindi",
        description: `"${datasetToDelete.name}" dataset'i başarıyla silindi.`,
        variant: "default",
      });

      if (selectedDataset?.id === datasetToDelete.id) {
        setSelectedDataset(null);
        setDatasetStats(null);
      }
    } catch (error) {
      console.error("Dataset silme hatası:", error);
      toast({
        title: "Silme Hatası",
        description: `Dataset silinirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDatasetToDelete(null);
    }
  };

  // Filter datasets
  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch =
      dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && dataset.isActive) ||
      (filterStatus === "inactive" && !dataset.isActive);

    return matchesSearch && matchesFilter;
  });

  // Calculate total stats
  const totalStats = {
    totalDatasets: datasets.length,
    activeDatasets: datasets.filter((d) => d.isActive).length,
    totalTitles: datasets.reduce((sum, d) => sum + (d.totalTitles || 0), 0),
    usedTitles: datasets.reduce((sum, d) => sum + (d.usedTitles || 0), 0),
  };

  const usagePercentage =
    totalStats.totalTitles > 0
      ? Math.round((totalStats.usedTitles / totalStats.totalTitles) * 100)
      : 0;

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalStats.totalDatasets}
                  </div>
                  <div className="text-sm text-blue-600">Toplam Dataset</div>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {totalStats.totalTitles}
                  </div>
                  <div className="text-sm text-green-600">Toplam Başlık</div>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {totalStats.usedTitles}
                  </div>
                  <div className="text-sm text-orange-600">Kullanılan</div>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    %{usagePercentage}
                  </div>
                  <div className="text-sm text-purple-600">Kullanım Oranı</div>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
              <Progress value={usagePercentage} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-xl p-1 mb-8">
            <TabsTrigger
              value="datasets"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg"
            >
              <Database className="mr-2 h-4 w-4" />
              Dataset Yönetimi
            </TabsTrigger>
            <TabsTrigger
              value="generator"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg"
            >
              <Brain className="mr-2 h-4 w-4" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              disabled={!selectedDataset}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analitik
            </TabsTrigger>
          </TabsList>

          {/* Dataset Management Tab */}
          <TabsContent value="datasets" className="space-y-6">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-blue-700">
                    <Database className="mr-2 h-5 w-5" />
                    Dataset Yönetimi
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="border-blue-300"
                    >
                      {refreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => setActiveTab("generator")}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Dataset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Dataset ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48 border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Datasets</SelectItem>
                      <SelectItem value="active">Aktif Olanlar</SelectItem>
                      <SelectItem value="inactive">Pasif Olanlar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dataset List */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredDatasets.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "Dataset bulunamadı" : "Henüz dataset yok"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Arama kriterlerinize uygun dataset bulunamadı."
                        : "İlk dataset'inizi oluşturmak için AI Generator'ı kullanın."}
                    </p>
                    <Button
                      onClick={() => setActiveTab("generator")}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      İlk Dataset'i Oluştur
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredDatasets.map((dataset) => (
                      <Card
                        key={dataset.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedDataset?.id === dataset.id
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        } ${!dataset.isActive ? "opacity-60" : ""}`}
                        onClick={() => setSelectedDataset(dataset)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {dataset.name}
                              </h3>
                              {dataset.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {dataset.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              {dataset.isActive ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Aktif
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-gray-100 text-gray-600"
                                >
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Pasif
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <div className="text-gray-500">Kategoriler</div>
                              <div className="font-medium">
                                {dataset.categories?.length || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Toplam Başlık</div>
                              <div className="font-medium">
                                {dataset.totalTitles || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Kullanılan</div>
                              <div className="font-medium text-orange-600">
                                {dataset.usedTitles || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Oluşturulma</div>
                              <div className="font-medium">
                                {dataset.createdAt
                                  ? formatDistanceToNow(
                                      new Date(dataset.createdAt),
                                      {
                                        addSuffix: true,
                                        locale: tr,
                                      }
                                    )
                                  : "Bilinmiyor"}
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Kullanım Oranı</span>
                              <span>
                                %
                                {dataset.totalTitles > 0
                                  ? Math.round(
                                      ((dataset.usedTitles || 0) /
                                        dataset.totalTitles) *
                                        100
                                    )
                                  : 0}
                              </span>
                            </div>
                            <Progress
                              value={
                                dataset.totalTitles > 0
                                  ? ((dataset.usedTitles || 0) /
                                      dataset.totalTitles) *
                                    100
                                  : 0
                              }
                              className="h-2"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {dataset.aiModel && (
                                <Badge variant="outline" className="text-xs">
                                  <Brain className="mr-1 h-3 w-3" />
                                  {dataset.aiModel}
                                </Badge>
                              )}
                              {dataset.generatedBy && (
                                <Badge variant="outline" className="text-xs">
                                  {dataset.generatedBy === "ai_generator" ? (
                                    <>
                                      <Sparkles className="mr-1 h-3 w-3" />
                                      AI
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="mr-1 h-3 w-3" />
                                      Manuel
                                    </>
                                  )}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center space-x-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDataset(dataset);
                                      setActiveTab("analytics");
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Detayları görüntüle</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDatasetToDelete(dataset);
                                      setShowDeleteDialog(true);
                                    }}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Dataset'i sil</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <AITitleGenerator
              onDatasetCreated={(datasetId) => {
                loadDatasets();
                setActiveTab("datasets");
                toast({
                  title: "Başarılı",
                  description: "Yeni dataset başarıyla oluşturuldu.",
                  variant: "default",
                });
              }}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {selectedDataset ? (
              <Card className="border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Dataset Analitik: {selectedDataset.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {datasetStats ? (
                    <div className="space-y-6">
                      {/* Overall Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-blue-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {datasetStats.dataset.totalTitles}
                            </div>
                            <div className="text-sm text-blue-600">
                              Toplam Başlık
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-green-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {datasetStats.dataset.availableTitles}
                            </div>
                            <div className="text-sm text-green-600">
                              Kullanılabilir
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-orange-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {datasetStats.dataset.usedTitles}
                            </div>
                            <div className="text-sm text-orange-600">
                              Kullanılmış
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-purple-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              %{datasetStats.dataset.usagePercentage}
                            </div>
                            <div className="text-sm text-purple-600">
                              Kullanım Oranı
                            </div>
                            <Progress
                              value={datasetStats.dataset.usagePercentage}
                              className="mt-2 h-2"
                            />
                          </CardContent>
                        </Card>
                      </div>

                      {/* Category Breakdown */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Kategori Bazında Analiz
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {datasetStats.categories.map((categoryStat) => {
                            const categoryData = DEFAULT_TITLE_CATEGORIES.find(
                              (c) => c.key === categoryStat.categoryKey
                            );
                            return (
                              <Card
                                key={categoryStat.categoryKey}
                                className="border-gray-200"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg">
                                        {categoryData?.icon}
                                      </span>
                                      <h4 className="font-medium text-gray-900">
                                        {categoryStat.categoryName}
                                      </h4>
                                    </div>
                                    <Badge variant="outline">
                                      %{categoryStat.usagePercentage}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                                    <div>
                                      <div className="text-gray-500">
                                        Toplam
                                      </div>
                                      <div className="font-medium">
                                        {categoryStat.totalTitles}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">
                                        Kullanılmış
                                      </div>
                                      <div className="font-medium text-orange-600">
                                        {categoryStat.usedTitles}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">Kalan</div>
                                      <div className="font-medium text-green-600">
                                        {categoryStat.availableTitles}
                                      </div>
                                    </div>
                                  </div>

                                  <Progress
                                    value={categoryStat.usagePercentage}
                                    className="h-2"
                                  />
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recent Usage */}
                      {datasetStats.recentUsage.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Son Kullanımlar
                          </h3>
                          <div className="space-y-2">
                            {datasetStats.recentUsage
                              .slice(0, 5)
                              .map((usage, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {usage.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {
                                        DEFAULT_TITLE_CATEGORIES.find(
                                          (c) => c.key === usage.categoryKey
                                        )?.name
                                      }
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatDistanceToNow(
                                      new Date(usage.usedAt),
                                      {
                                        addSuffix: true,
                                        locale: tr,
                                      }
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-gray-300">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Dataset Seçin
                  </h3>
                  <p className="text-gray-500">
                    Analitik görüntülemek için Dataset Yönetimi sekmesinden bir
                    dataset seçin.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-red-600">
                <Trash2 className="mr-2 h-5 w-5" />
                Dataset Sil
              </AlertDialogTitle>
              <AlertDialogDescription>
                <strong>"{datasetToDelete?.name}"</strong> dataset'ini silmek
                istediğinizden emin misiniz?
                <br />
                <br />
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-800">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>Bu işlem geri alınamaz!</strong> Dataset ve tüm
                      kullanım kayıtları kalıcı olarak silinecektir.
                    </span>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDataset}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Evet, Sil
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default TitleManagementInterface;
