"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as socialMediaService from "@/lib/services/social-media-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Calendar,
  Folder,
  FileText,
  Trash2,
  Edit2,
  MoreVertical,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PermissionGuard, usePermissions } from "@/components/admin-route-guard";

const PLATFORM_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  linkedin: Linkedin,
};

const PLATFORM_COLORS = {
  instagram: "from-pink-500 to-purple-500",
  facebook: "from-blue-500 to-blue-600",
  x: "from-gray-700 to-gray-900",
  linkedin: "from-blue-600 to-blue-700",
};

export default function TitleLibraryPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const datasets = await socialMediaService.getDatasets();
      setDatasets(datasets);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Datasetler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/admin/social-media/title-library/create");
  };

  const handleOpenDataset = (id) => {
    router.push(`/admin/social-media/title-library/${id}`);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" dataset'ini silmek istediğinizden emin misiniz?`))
      return;

    try {
      await socialMediaService.deleteDataset(id);

      setDatasets(datasets.filter((d) => d.id !== id));
      toast.success("Dataset silindi");
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const filteredDatasets = datasets.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalTitles = datasets.reduce((acc, d) => acc + (d.titleCount || 0), 0);
  const totalDatasets = datasets.length;
  const avgTitlesPerDataset =
    totalDatasets > 0 ? Math.round(totalTitles / totalDatasets) : 0;

  return (
    <PermissionGuard requiredPermission="social_media.read">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Modern Header with Glass Effect */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
                    <Folder className="h-7 w-7 text-white" />
                  </div>
                  Başlık Kütüphanesi
                </h1>
                <p className="text-gray-600 mt-2 ml-14">
                  Sosyal medya konu başlıklarınızı dataset'ler halinde organize
                  edin
                </p>
              </div>
              {hasPermission("social_media.create") && (
                <Button
                  onClick={handleCreateNew}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Yeni Dataset Oluştur
                </Button>
              )}
            </div>
          </div>
        </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Stats Cards - Modern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Folder className="h-8 w-8 opacity-80" />
              <div className="text-xs font-medium opacity-90">TOPLAM</div>
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {totalDatasets}
            </div>
            <div className="text-sm mt-2 opacity-80">Dataset</div>
          </div>

          <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 opacity-80" />
              <div className="text-xs font-medium opacity-90">TOPLAM</div>
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {totalTitles}
            </div>
            <div className="text-sm mt-2 opacity-80">Konu Başlığı</div>
          </div>

          <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="h-8 w-8 opacity-80" />
              <div className="text-xs font-medium opacity-90">ORTALAMA</div>
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {avgTitlesPerDataset}
            </div>
            <div className="text-sm mt-2 opacity-80">Başlık / Dataset</div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8 border-0 shadow-md rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Dataset adı veya açıklama ile arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Datasets Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
        ) : filteredDatasets.length === 0 ? (
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
            <CardContent className="py-16 text-center">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Folder className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm
                  ? "Sonuç bulunamadı"
                  : "Henüz dataset oluşturulmamış"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Farklı anahtar kelimeler deneyin"
                  : "İlk dataset'inizi oluşturarak başlayın"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Dataset Oluştur
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map((dataset) => {
              const platforms = dataset.platforms || [];
              const categories = dataset.categories || [];

              return (
                <Card
                  key={dataset.id}
                  className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer bg-white"
                  onClick={() => handleOpenDataset(dataset.id)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-2.5 flex-shrink-0">
                          <Folder className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {dataset.name}
                          </h3>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDataset(dataset.id);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Görüntüle
                          </DropdownMenuItem>
                          {hasPermission("social_media.edit") && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDataset(dataset.id);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                          )}
                          {hasPermission("social_media.delete") && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(dataset.id, dataset.name);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Description */}
                    {dataset.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {dataset.description}
                      </p>
                    )}

                    {/* Platforms */}
                    {platforms.length > 0 && (
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {platforms.slice(0, 4).map((platform) => {
                          const Icon = PLATFORM_ICONS[platform];
                          const colorClass = PLATFORM_COLORS[platform];
                          return Icon ? (
                            <div
                              key={platform}
                              className={`bg-gradient-to-br ${colorClass} rounded-lg p-1.5`}
                              title={platform}
                            >
                              <Icon className="h-3.5 w-3.5 text-white" />
                            </div>
                          ) : null;
                        })}
                        {platforms.length > 4 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{platforms.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Categories */}
                    {categories.length > 0 && (
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {categories.slice(0, 2).map((cat, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {cat}
                          </Badge>
                        ))}
                        {categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">
                            {dataset.titleCount || 0}
                          </span>
                        </div>
                        {dataset.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(dataset.createdAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {dataset.status && (
                        <Badge
                          variant={
                            dataset.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {dataset.status === "active" ? "Aktif" : "Arşiv"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </PermissionGuard>
  );
}
