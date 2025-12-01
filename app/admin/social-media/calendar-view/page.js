"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as socialMediaService from "@/lib/services/social-media-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  MoreVertical,
  Search,
  Clock,
  FileText,
  Sparkles,
  Eye,
  Edit2,
  TrendingUp,
  Layers,
  Filter,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import {
  PermissionGuard,
  usePermissions,
} from "@/components/admin-route-guard";

export default function CalendarViewPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [calendarSets, setCalendarSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const PLATFORM_ICONS = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    x: Twitter,
    youtube: Youtube,
  };

  useEffect(() => {
    fetchCalendarSets();
  }, []);

  const fetchCalendarSets = async () => {
    try {
      const plans = await socialMediaService.getCalendarPlans();
      setCalendarSets(plans);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Takvim setleri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/admin/social-media/calendar-view/create");
  };

  const handleOpenSet = (id) => {
    router.push(`/admin/social-media/calendar-view/${id}`);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" takvim setini silmek istediğinizden emin misiniz?`))
      return;

    try {
      await socialMediaService.deleteCalendarPlan(id);
      setCalendarSets(calendarSets.filter((s) => s.id !== id));
      toast.success("Takvim seti silindi");
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const filteredSets = calendarSets.filter(
    (set) =>
      set.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalSets = calendarSets.length;
  const totalEvents = calendarSets.reduce(
    (acc, set) => acc + (set.events?.length || 0),
    0
  );
  const avgEventsPerSet =
    totalSets > 0 ? Math.round(totalEvents / totalSets) : 0;

  return (
    <PermissionGuard requiredPermission="social_media.read">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Modern Header with Glassmorphism */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Left: Title */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 shadow-xl">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    İçerik Takvimi
                  </h1>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Sosyal medya içerik planlarınızı yönetin
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              {hasPermission("social_media.create") && (
                <Button
                  onClick={handleCreateNew}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 h-11"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Yeni Takvim Seti
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
          {/* Modern Stats Grid with Gradient */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Total Sets Card */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs font-semibold">
                    TOPLAM
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold tracking-tight">
                    {totalSets}
                  </div>
                  <div className="text-sm opacity-90 font-medium">
                    Takvim Seti
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <Layers className="h-32 w-32" />
              </div>
            </div>

            {/* Total Events Card */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs font-semibold">
                    TOPLAM
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold tracking-tight">
                    {totalEvents}
                  </div>
                  <div className="text-sm opacity-90 font-medium">
                    Planlı İçerik
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <FileText className="h-32 w-32" />
              </div>
            </div>

            {/* Average Card */}
            <div className="group relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs font-semibold">
                    ORTALAMA
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold tracking-tight">
                    {avgEventsPerSet}
                  </div>
                  <div className="text-sm opacity-90 font-medium">
                    İçerik / Set
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <TrendingUp className="h-32 w-32" />
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Takvim seti adı veya açıklama ile arama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-sm bg-white"
                  />
                </div>

                {/* Filter Options */}
                <div className="flex gap-2">
                  <Button
                    variant={filterBy === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterBy("all")}
                    className={`h-12 px-5 rounded-xl transition-all duration-200 ${
                      filterBy === "all"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Tümü
                  </Button>
                  <Button
                    variant={filterBy === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterBy("recent")}
                    className={`h-12 px-5 rounded-xl transition-all duration-200 ${
                      filterBy === "recent"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Son Eklenenler
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Sets Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                    <CalendarIcon className="w-20 h-20 mx-auto text-blue-600 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Takvimler yükleniyor...
                </p>
              </div>
            </div>
          ) : filteredSets.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 p-16">
              <div className="text-center max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
                  <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 inline-block">
                    <CalendarIcon className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm
                    ? "Sonuç bulunamadı"
                    : "Henüz takvim seti yok"}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {searchTerm
                    ? "Aradığınız kriterlere uygun takvim seti bulunamadı. Farklı anahtar kelimeler deneyin."
                    : "İlk takvim setinizi oluşturarak sosyal medya içeriklerinizi planlamaya başlayın."}
                </p>
                {!searchTerm && hasPermission("social_media.create") && (
                  <Button
                    onClick={handleCreateNew}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl rounded-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    İlk Takvim Setini Oluştur
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSets.map((set, index) => {
                const platforms = Array.from(
                  new Set(set.events?.map((e) => e.platform).filter(Boolean))
                );

                return (
                  <div
                    key={set.id}
                    onClick={() => handleOpenSet(set.id)}
                    className="group bg-white rounded-3xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards"
                    }}
                  >
                    {/* Header with Gradient */}
                    <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-8 text-white">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-12 -mb-12" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                            <CalendarIcon className="w-7 h-7 text-white" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-white hover:bg-white/20 rounded-xl"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenSet(set.id);
                                }}
                                className="rounded-lg"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Görüntüle
                              </DropdownMenuItem>
                              {hasPermission("social_media.edit") && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSet(set.id);
                                  }}
                                  className="rounded-lg"
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Düzenle
                                </DropdownMenuItem>
                              )}
                              {hasPermission("social_media.delete") && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(set.id, set.name);
                                  }}
                                  className="text-red-600 focus:text-red-600 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Sil
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:scale-105 transition-transform duration-200">
                          {set.name}
                        </h3>

                        {set.description && (
                          <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                            {set.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-7 space-y-5">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                              İçerik
                            </span>
                          </div>
                          <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {set.events?.length || 0}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-purple-500/10 rounded-lg">
                              <Clock className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                              Tarih
                            </span>
                          </div>
                          <div className="text-sm font-bold text-purple-900">
                            {new Date(set.createdAt).toLocaleDateString(
                              "tr-TR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              }
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Platform Badges */}
                      {platforms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {platforms.slice(0, 4).map((platform) => {
                            const Icon = PLATFORM_ICONS[platform];
                            return (
                              <div
                                key={platform}
                                className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 hover:border-gray-300 transition-colors"
                              >
                                {Icon && <Icon className="w-4 h-4" />}
                                <span className="capitalize">{platform}</span>
                              </div>
                            );
                          })}
                          {platforms.length > 4 && (
                            <div className="flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200">
                              +{platforms.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all rounded-xl h-12 font-semibold shadow-sm hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSet(set.id);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Takvimi Aç
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Animations */}
        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 100px;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 100px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%);
          }
        `}</style>
      </div>
    </PermissionGuard>
  );
}
