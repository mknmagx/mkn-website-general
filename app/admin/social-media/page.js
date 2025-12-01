"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/admin-route-guard";
import {
  Calendar,
  FileText,
  PenTool,
  BarChart3,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
  Edit3,
  Sparkles,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function SocialMediaDashboard() {
  const [stats, setStats] = useState({
    totalTitles: 0,
    scheduledPosts: 0,
    draftContent: 0,
    publishedThisMonth: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // TODO: API'den gerçek istatistikleri çek
    setLoading(false);
  };

  const statCards = [
    {
      title: "Toplam Başlık",
      value: stats.totalTitles,
      change: "+12%",
      trend: "up",
      icon: FileText,
      description: "Kütüphanede",
      color: "text-blue-600",
    },
    {
      title: "Planlanmış",
      value: stats.scheduledPosts,
      change: "+8%",
      trend: "up",
      icon: Calendar,
      description: "Takvimde",
      color: "text-green-600",
    },
    {
      title: "Taslaklar",
      value: stats.draftContent,
      change: "-3%",
      trend: "down",
      icon: Edit3,
      description: "Hazırlanıyor",
      color: "text-orange-600",
    },
    {
      title: "Bu Ay",
      value: stats.publishedThisMonth,
      change: "+23%",
      trend: "up",
      icon: CheckCircle,
      description: "Yayınlandı",
      color: "text-purple-600",
    },
  ];

  const platforms = [
    {
      name: "Instagram",
      icon: Instagram,
      followers: "12.5K",
      engagement: "4.2%",
      color: "from-purple-500 to-pink-500",
      posts: 156,
    },
    {
      name: "Facebook",
      icon: Facebook,
      followers: "8.3K",
      engagement: "3.1%",
      color: "from-blue-600 to-blue-500",
      posts: 134,
    },
    {
      name: "Twitter",
      icon: Twitter,
      followers: "5.2K",
      engagement: "2.8%",
      color: "from-black to-gray-800",
      posts: 289,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      followers: "3.8K",
      engagement: "5.6%",
      color: "from-blue-700 to-blue-600",
      posts: 78,
    },
  ];

  const quickActions = [
    {
      title: "Başlık Kütüphanesi",
      description: "AI ile toplu başlık üret ve yönet",
      icon: FileText,
      href: "/admin/social-media/title-library",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "İçerik Takvimi",
      description: "Takvim setleri ile organize edin",
      icon: Calendar,
      href: "/admin/social-media/calendar-view",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      iconColor: "text-green-600",
    },
    {
      title: "İçerik Stüdyosu",
      description: "AI destekli içerik oluştur",
      icon: PenTool,
      href: "/admin/social-media/content-studio",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      title: "Performans",
      description: "İçerik analitiği ve raporlar",
      icon: BarChart3,
      href: "/admin/social-media/analytics",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <PermissionGuard requiredPermission="social_media.read">
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Sosyal Medya
              </h1>
              <p className="text-muted-foreground mt-1">
                AI destekli içerik yönetimi ve planlama
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadStats}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
              <Link href="/admin/social-media/content-studio?action=create">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni İçerik
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
              return (
                <Card
                  key={stat.title}
                  className="bg-white border-l-4 hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: stat.color.replace("text-", "") }}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${
                          stat.trend === "up"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <TrendIcon className="w-3 h-3 mr-1" />
                        {stat.change}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Platforms Overview */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Platform Performansı
              </CardTitle>
              <CardDescription>
                Sosyal medya hesaplarınızın özet durumu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.name}
                      className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-white via-gray-50/30 to-white p-4 hover:shadow-lg hover:border-gray-300 transition-all hover:-translate-y-1"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${platform.color}`}
                      ></div>
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {platform.posts} post
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{platform.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{platform.followers} takipçi</span>
                          <span>•</span>
                          <span className="text-green-600 font-medium">
                            {platform.engagement} etkileşim
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card
                    className={`h-full bg-white border-2 transition-all ${action.color} hover:shadow-lg hover:-translate-y-1 cursor-pointer group`}
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3 ${action.iconColor}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-base">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`flex items-center text-sm font-medium ${action.iconColor} group-hover:gap-2 transition-all`}
                      >
                        Başlat
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Recent Activity */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Son Aktiviteler</CardTitle>
                  <CardDescription>
                    Son içerik hareketleri ve işlemler
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/social-media/calendar-view">
                    Tümünü Gör
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">İçerik planlandı</p>
                      <p className="text-xs text-muted-foreground">
                        {idx === 0
                          ? "5 dakika önce"
                          : idx === 1
                          ? "1 saat önce"
                          : "3 saat önce"}
                      </p>
                    </div>
                    <Badge variant="outline">Instagram</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
