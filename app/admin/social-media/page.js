"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  FileText,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Edit3,
  Plus,
  BarChart3,
  Target,
  Zap,
} from "lucide-react";

// X (Twitter) Icon
const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Mock data for stats
const mockStats = {
  totalTitles: 156,
  scheduledPosts: 12,
  draftContent: 8,
  publishedThisMonth: 34,
};

// Platform data
const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    followers: "12.5K",
    engagement: "4.2%",
    trend: "up",
    color: "from-purple-500 via-pink-500 to-orange-400",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    textColor: "text-purple-600",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    followers: "8.3K",
    engagement: "3.1%",
    trend: "up",
    color: "from-blue-600 to-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "twitter",
    name: "X",
    icon: XIcon,
    followers: "5.2K",
    engagement: "2.8%",
    trend: "down",
    color: "from-slate-800 to-slate-900",
    bgColor: "bg-slate-50",
    textColor: "text-slate-800",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    followers: "3.8K",
    engagement: "5.6%",
    trend: "up",
    color: "from-blue-700 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
];

// Quick actions
const quickActions = [
  {
    id: "new-content",
    title: "Yeni İçerik",
    description: "AI ile içerik oluştur",
    icon: Sparkles,
    href: "/admin/social-media/content-studio",
    color: "bg-violet-500",
    hoverColor: "hover:bg-violet-600",
  },
  {
    id: "schedule",
    title: "Planla",
    description: "Takvime ekle",
    icon: Calendar,
    href: "/admin/social-media/calendar-view",
    color: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
  },
  {
    id: "titles",
    title: "Başlıklar",
    description: "Kütüphaneyi gör",
    icon: FileText,
    href: "/admin/social-media/title-library",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
  },
];

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, trend, change, color }) {
  return (
    <Card className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            color
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-emerald-600" : "text-red-600"
            )}>
              {change}
            </span>
            <span className="text-xs text-slate-400 ml-1">bu ay</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Platform Card Component
function PlatformCard({ platform }) {
  const Icon = platform.icon;
  return (
    <div className={cn(
      "relative p-4 rounded-xl border border-slate-200/60 transition-all hover:shadow-md cursor-pointer group",
      platform.bgColor
    )}>
      <div className="flex items-start justify-between">
        <div className={cn(
          "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm",
          platform.color
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <Badge variant="secondary" className="bg-white/80 text-slate-600 text-[10px]">
          {platform.engagement} etkileşim
        </Badge>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-slate-800">{platform.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-slate-900">{platform.followers}</span>
          <span className="text-xs text-slate-500">takipçi</span>
          {platform.trend === "up" ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          )}
        </div>
      </div>
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-slate-300 transition-colors" />
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ action }) {
  const Icon = action.icon;
  return (
    <Link href={action.href}>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all group cursor-pointer">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          action.color,
          action.hoverColor
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{action.title}</h4>
          <p className="text-xs text-slate-500">{action.description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

// Recent Activity Item
function ActivityItem({ title, time, type, status }) {
  const statusStyles = {
    published: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    scheduled: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    draft: { icon: Edit3, color: "text-amber-500", bg: "bg-amber-50" },
  };
  
  const { icon: StatusIcon, color, bg } = statusStyles[status] || statusStyles.draft;
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bg)}>
        <StatusIcon className={cn("w-4 h-4", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{title}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function SocialMediaDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const recentActivity = [
    { title: "Instagram post yayınlandı", time: "2 saat önce", type: "post", status: "published" },
    { title: "Haftalık kampanya planlandı", time: "5 saat önce", type: "campaign", status: "scheduled" },
    { title: "LinkedIn makalesi taslağı", time: "Dün", type: "article", status: "draft" },
    { title: "Facebook hikayesi", time: "2 gün önce", type: "story", status: "published" },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sosyal Medya</h1>
          <p className="text-sm text-slate-500 mt-1">İçeriklerinizi yönetin ve planlayın</p>
        </div>
        <Link href="/admin/social-media/content-studio">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Yeni İçerik
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Başlık"
          value={stats.totalTitles}
          subtitle="Kütüphanede"
          icon={FileText}
          trend="up"
          change="+12%"
          color="bg-blue-500"
        />
        <StatCard
          title="Planlanmış"
          value={stats.scheduledPosts}
          subtitle="Takvimde"
          icon={Calendar}
          trend="up"
          change="+8%"
          color="bg-emerald-500"
        />
        <StatCard
          title="Taslaklar"
          value={stats.draftContent}
          subtitle="Hazırlanıyor"
          icon={Edit3}
          color="bg-amber-500"
        />
        <StatCard
          title="Bu Ay"
          value={stats.publishedThisMonth}
          subtitle="Yayınlandı"
          icon={CheckCircle}
          trend="up"
          change="+23%"
          color="bg-violet-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Platforms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Hızlı İşlemler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <QuickActionButton key={action.id} action={action} />
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-500" />
              Platformlar
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </div>

          {/* Performance Overview */}
          <Card className="bg-white border-slate-200/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Performans Özeti
                </h2>
                <Badge variant="secondary" className="text-xs">Son 30 gün</Badge>
              </div>
              <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Grafik yakında eklenecek</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Activity */}
        <div>
          <Card className="bg-white border-slate-200/60 sticky top-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Son Aktiviteler
                </h2>
                <Link href="/admin/social-media/content-list">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-700 h-7 px-2">
                    Tümü
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-1">
                {recentActivity.map((item, index) => (
                  <ActivityItem key={index} {...item} />
                ))}
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-lg font-bold text-slate-900">89%</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Başarı Oranı</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-lg font-bold text-slate-900">4.2K</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Etkileşim</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
