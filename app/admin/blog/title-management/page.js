"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../hooks/use-admin-auth";
import { PermissionGuard } from "../../../../components/admin-route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  Database,
  Brain,
  BarChart3,
  Settings,
  Sparkles,
  Target,
  FileText,
  Plus,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import TitleManagementInterface from "../../../../components/admin/title-management-interface";
import {
  getAllTitleDatasets,
  DEFAULT_TITLE_CATEGORIES,
} from "../../../../lib/services/blog-title-service";

export default function TitleManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();

  // States
  const [activeTab, setActiveTab] = useState("management");
  const [stats, setStats] = useState({
    totalDatasets: 0,
    activeDatasets: 0,
    totalTitles: 0,
    usedTitles: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load stats
  const loadStats = async () => {
    try {
      setLoading(true);
      const datasets = await getAllTitleDatasets();

      const totalDatasets = datasets.length;
      const activeDatasets = datasets.filter((d) => d.isActive).length;
      const totalTitles = datasets.reduce(
        (sum, d) => sum + (d.totalTitles || 0),
        0
      );
      const usedTitles = datasets.reduce(
        (sum, d) => sum + (d.usedTitles || 0),
        0
      );

      setStats({
        totalDatasets,
        activeDatasets,
        totalTitles,
        usedTitles,
      });
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "İstatistikler yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const usagePercentage =
    stats.totalTitles > 0
      ? Math.round((stats.usedTitles / stats.totalTitles) * 100)
      : 0;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="blog.read">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-white p-3 rounded-2xl shadow-lg">
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Title Management Studio
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-blue-500" />
                    Blog başlık dataset'lerini yönetin ve analiz edin
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/blog/ai-generator">
                  <Button
                    variant="outline"
                    className="hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    AI Generator
                  </Button>
                </Link>
                <Link href="/admin/blog">
                  <Button variant="outline" className="hover:bg-gray-50">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Blog Yönetimi
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {loading ? "..." : stats.totalDatasets}
                      </div>
                      <div className="text-sm text-blue-600">Dataset</div>
                    </div>
                    <Database className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    {loading ? "..." : stats.activeDatasets} aktif
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {loading ? "..." : stats.totalTitles}
                      </div>
                      <div className="text-sm text-green-600">
                        Toplam Başlık
                      </div>
                    </div>
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    8 kategoride
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {loading ? "..." : stats.usedTitles}
                      </div>
                      <div className="text-sm text-orange-600">Kullanılan</div>
                    </div>
                    <Activity className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-2 text-xs text-orange-600">
                    Blog yazılarında
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        %{loading ? "..." : usagePercentage}
                      </div>
                      <div className="text-sm text-purple-600">Kullanım</div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 border-indigo-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-700">
                <Sparkles className="mr-2 h-5 w-5" />
                Hızlı İşlemler
              </CardTitle>
              <CardDescription>
                Sık kullanılan işlemler için hızlı erişim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                  onClick={() => setActiveTab("management")}
                >
                  <Plus className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Yeni Dataset Oluştur</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                  onClick={() => router.push("/admin/blog/ai-generator")}
                >
                  <Brain className="h-6 w-6 text-green-600" />
                  <span className="text-sm">AI Blog Generator</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">Usage Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <TitleManagementInterface
            className="space-y-6"
            onStatsUpdate={loadStats}
          />

          {/* Categories Overview */}
          <Card className="mt-8 border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <Settings className="mr-2 h-5 w-5" />
                Kategori Genel Bakış
              </CardTitle>
              <CardDescription>
                Mevcut başlık kategorileri ve özellikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DEFAULT_TITLE_CATEGORIES.map((category) => (
                  <Card key={category.key} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <span className="text-lg">{category.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {category.name}
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: category.color,
                            color: category.color,
                          }}
                        >
                          {category.key}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    💡 Title Management Studio Nasıl Kullanılır?
                  </h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>1. Dataset Yönetimi:</strong> Mevcut başlık
                      dataset'lerini görüntüleyin, düzenleyin veya silin
                    </p>
                    <p>
                      <strong>2. AI Generator:</strong> Yeni başlık dataset'leri
                      oluşturmak için AI'yi kullanın
                    </p>
                    <p>
                      <strong>3. Usage Tracking:</strong> Hangi başlıkların
                      kullanıldığını takip edin ve analiz yapın
                    </p>
                    <p>
                      <strong>4. Analytics:</strong> Dataset performansını ve
                      kullanım istatistiklerini inceleyin
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
