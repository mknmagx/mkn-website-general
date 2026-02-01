"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useAdminSync } from "../../../hooks/use-admin-sync";
import {
  PermissionGuard,
  RoleGuard,
  usePermissions,
} from "../../../components/admin-route-guard";
import { getQuoteStats } from "../../../lib/services/admin-quote-service";
import { getContactStats } from "../../../lib/services/admin-contact-service";
import { getUserStats } from "../../../lib/services/admin-user-service";
import { getLogStats } from "../../../lib/services/admin-log-service";
import { getBlogStats } from "../../../lib/services/blog-service";
import { CompanyService } from "../../../lib/services/company-service";
import { motion } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit3,
  RefreshCw,
  Shield,
  ArrowRight,
  ChevronRight,
  PiggyBank,
  Plug,
  Brain,
  Receipt,
  Sparkles,
  Package,
  Settings,
  MessagesSquare,
  Briefcase,
  PenTool,
  LayoutDashboard,
  Wallet,
  Share2,
  Users,
  Building2,
  Calculator,
  FlaskConical,
  Mail,
  MessageCircle,
  FileText,
  Instagram,
  Inbox,
  FileSignature,
  Zap,
  Star,
} from "lucide-react";
import Link from "next/link";
import { cn } from "../../../lib/utils";

// ============================================
// WELCOME HERO SECTION
// ============================================
const WelcomeHero = ({ user, userRole }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi Günler";
    return "İyi Akşamlar";
  };

  const roleLabels = {
    super_admin: "Süper Admin",
    admin: "Admin",
    moderator: "Moderatör",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {(user?.displayName || user?.email || "A")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {getGreeting()},{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {user?.displayName || user?.email?.split("@")[0] || "Admin"}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {roleLabels[userRole] || "Kullanıcı"}
              </span>
              <span className="text-sm text-slate-400">
                {currentTime.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-emerald-400 font-medium">Sistem Aktif</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// KEY STATS BAR - Minimal & Important
// ============================================
const KeyStatsBar = ({ stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="grid grid-cols-2 md:grid-cols-4 gap-3"
  >
    {stats.map((stat, index) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 + index * 0.05 }}
        className={cn(
          "relative overflow-hidden rounded-xl p-4",
          "bg-white border border-slate-200",
          "hover:shadow-lg hover:border-slate-300 transition-all duration-300"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
          </div>
          <div className={cn("p-2.5 rounded-xl", stat.bgColor)}>
            <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
          </div>
        </div>
        {stat.badge && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
            {stat.badge}
          </span>
        )}
      </motion.div>
    ))}
  </motion.div>
);

// ============================================
// QUICK APPS - Phone Style App Icons
// ============================================
const QuickApps = () => {
  const apps = [
    {
      name: "Fiyat Hesapla",
      icon: Calculator,
      href: "/admin/pricing-calculator",
      gradient: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500",
    },
    {
      name: "Formüller",
      icon: FlaskConical,
      href: "/admin/formulas",
      gradient: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500",
    },
    {
      name: "Outlook",
      icon: Mail,
      href: "/admin/outlook",
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500",
    },
    {
      name: "Gemini",
      icon: Sparkles,
      href: "/admin/ai/gemini",
      gradient: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-500",
    },
    {
      name: "Sözleşmeler",
      icon: FileSignature,
      href: "/admin/contracts",
      gradient: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500",
    },
    {
      name: "Meta DM",
      icon: Instagram,
      href: "/admin/meta-messenger",
      gradient: "from-pink-500 to-rose-600",
      bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
    },
    {
      name: "Site Mesajları",
      icon: MessageCircle,
      href: "/admin/contacts",
      gradient: "from-sky-500 to-cyan-600",
      bgColor: "bg-sky-500",
    },
    {
      name: "Teklif Talepleri",
      icon: FileText,
      href: "/admin/quotes",
      gradient: "from-indigo-500 to-violet-600",
      bgColor: "bg-indigo-500",
    },
    {
      name: "CRM Gelen",
      icon: Inbox,
      href: "/admin/crm-v2/inbox",
      gradient: "from-slate-600 to-slate-800",
      bgColor: "bg-slate-700",
    },
    {
      name: "Proforma",
      icon: Receipt,
      href: "/admin/proformas",
      gradient: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-3"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-700">Hızlı Erişim</h3>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {apps.map((app, index) => (
          <motion.div
            key={app.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + index * 0.03 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={app.href} className="group">
              <div className="flex flex-col items-center gap-1.5">
                {/* App Icon */}
                <div
                  className={cn(
                    "relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center",
                    "shadow-lg transition-all duration-300",
                    "group-hover:shadow-xl group-hover:shadow-black/20",
                    app.bgColor.includes("gradient") ? app.bgColor : `bg-gradient-to-br ${app.gradient}`
                  )}
                >
                  <app.icon className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                  </div>
                </div>
                {/* App Name */}
                <span className="text-[10px] md:text-xs text-slate-600 font-medium text-center leading-tight line-clamp-1 group-hover:text-slate-900 transition-colors">
                  {app.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// AI ASSISTANTS SECTION - Premium Provider Cards
// ============================================
const AIAssistantsSection = () => {
  const providers = [
    {
      name: "ChatGPT",
      provider: "OpenAI",
      description: "GPT-4 Turbo ile gelişmiş metin üretimi, analiz ve kod yazımı",
      href: "/admin/ai/chatgpt",
      gradient: "from-emerald-600 via-teal-500 to-cyan-500",
      icon: "✦",
      features: ["Metin Üretimi", "Kod Analizi", "SEO İçerik"],
      badge: "En Popüler",
    },
    {
      name: "Gemini",
      provider: "Google",
      description: "Google'ın çoklu modal AI'ı ile görsel ve metin analizi",
      href: "/admin/ai/gemini",
      gradient: "from-blue-600 via-indigo-500 to-violet-500",
      icon: "◈",
      features: ["Görsel Analiz", "Çoklu Modal", "Araştırma"],
      badge: "Yeni",
    },
    {
      name: "Claude",
      provider: "Anthropic",
      description: "Uzun bağlam ve detaylı analiz için güvenli AI asistan",
      href: "/admin/ai/claude",
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      icon: "◉",
      features: ["Uzun Bağlam", "Güvenli AI", "Analitik"],
      badge: null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Asistanlar</h2>
            <p className="text-sm text-slate-500">Yapay zeka destekli içerik ve analiz</p>
          </div>
        </div>
      </div>

      {/* AI Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group"
          >
            <Link href={provider.href}>
              <div className="relative overflow-hidden rounded-2xl h-full">
                {/* Gradient Background */}
                <div className={cn("absolute inset-0 bg-gradient-to-br", provider.gradient)} />
                
                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 text-8xl font-bold text-white/20">{provider.icon}</div>
                </div>

                {/* Content */}
                <div className="relative p-5 flex flex-col h-full min-h-[180px]">
                  {provider.badge && (
                    <span className="absolute top-4 right-4 px-2 py-1 text-[10px] font-bold rounded-full bg-white/20 text-white backdrop-blur-sm">
                      {provider.badge}
                    </span>
                  )}

                  <div className="flex-1">
                    <span className="text-xs text-white/70 font-medium">{provider.provider}</span>
                    <h3 className="text-xl font-bold text-white mt-1">{provider.name}</h3>
                    <p className="text-sm text-white/80 mt-2 line-clamp-2">{provider.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {provider.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-[10px] font-medium rounded-full bg-white/15 text-white backdrop-blur-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// MODULE BANNER CARD - Play Store Style
// ============================================
const ModuleBanner = ({
  title,
  subtitle,
  description,
  icon: Icon,
  href,
  gradient,
  features,
  stats,
  badge,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4 }}
    className="group"
  >
    <Link href={href}>
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300">
        {/* Top Gradient Header */}
        <div className={cn("relative overflow-hidden h-28 bg-gradient-to-br", gradient)}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/20 rounded-full blur-2xl" />
          </div>

          {/* Icon */}
          <div className="absolute top-4 left-5">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Badge */}
          {badge && (
            <div className="absolute top-4 right-4 px-2.5 py-1 text-xs font-bold rounded-full bg-white/25 text-white backdrop-blur-sm">
              {badge}
            </div>
          )}

          {/* Stats on header */}
          {stats && stats.length > 0 && (
            <div className="absolute bottom-3 left-5 flex items-center gap-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm">
                  <span className="text-lg font-bold text-white">{stat.value}</span>
                  <span className="text-[10px] text-white/80 font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
          </div>

          {description && (
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{description}</p>
          )}

          {/* Features Tags */}
          {features && features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {features.map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-600"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function AdminDashboard() {
  const { user, permissions, userRole, loading: authLoading } = useAdminAuth();
  const { hasPermission, hasAnyRole } = usePermissions();
  const { isSyncing, lastSyncResult, validateSystemConsistency } = useAdminSync();

  const [stats, setStats] = useState({
    quotes: { total: 0, new: 0, inProgress: 0, responded: 0, closed: 0 },
    contacts: { total: 0, new: 0, inProgress: 0, responded: 0, closed: 0 },
    users: { total: 0, active: 0, inactive: 0, superAdmins: 0, admins: 0, moderators: 0, users: 0 },
    companies: { total: 0, clients: 0, prospects: 0, active: 0, inactive: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0, monthlyRevenue: 0 },
    logs: { totalLogs: 0, todayLogs: 0, errors: 0, warnings: 0 },
    blog: { totalPosts: 0, totalCategories: 0, featuredPosts: 0, publishedThisMonth: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && permissions) {
      loadStats();
    }
  }, [authLoading, permissions]);

  const loadStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const results = await Promise.allSettled([
        hasPermission("quotes.view") ? getQuoteStats() : Promise.resolve(null),
        hasPermission("contacts.view") ? getContactStats() : Promise.resolve(null),
        (hasPermission("analytics.view") || hasPermission("users.view")) ? getUserStats(permissions) : Promise.resolve(null),
        hasPermission("companies.view") ? CompanyService.getCompanyStats() : Promise.resolve(null),
        hasPermission("system.logs") ? getLogStats(new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), null) : Promise.resolve(null),
        hasPermission("blog.read") ? getBlogStats() : Promise.resolve(null),
      ]);

      setStats((prev) => ({
        quotes: results[0]?.status === "fulfilled" && results[0]?.value?.stats ? results[0].value.stats : prev.quotes,
        contacts: results[1]?.status === "fulfilled" && results[1]?.value?.stats ? results[1].value.stats : prev.contacts,
        users: results[2]?.status === "fulfilled" && results[2]?.value?.stats ? results[2].value.stats : prev.users,
        companies: results[3]?.status === "fulfilled" && results[3]?.value?.stats ? results[3].value.stats : prev.companies,
        logs: results[4]?.status === "fulfilled" && results[4]?.value?.stats
          ? {
              totalLogs: results[4].value.stats.totalLogs || 0,
              todayLogs: results[4].value.stats.totalLogs || 0,
              errors: results[4].value.stats.levels?.error || 0,
              warnings: results[4].value.stats.levels?.warning || 0,
            }
          : prev.logs,
        blog: results[5]?.status === "fulfilled" && results[5]?.value ? results[5].value : prev.blog,
      }));
    } catch (error) {
      console.error("Stats loading error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-violet-600" />
          </div>
          <p className="text-slate-600 font-medium">Dashboard yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  const pendingItems = (stats.quotes.new || 0) + (stats.contacts.new || 0);
  const totalRequests = (stats.quotes.total || 0) + (stats.contacts.total || 0);

  // Key Stats for the stats bar
  const keyStats = [
    {
      label: "Bekleyen Talepler",
      value: pendingItems,
      icon: Clock,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      badge: pendingItems > 0 ? pendingItems : null,
    },
    {
      label: "Toplam Firma",
      value: stats.companies.total,
      icon: Building2,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Blog Yazısı",
      value: stats.blog.totalPosts,
      icon: Edit3,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Kullanıcılar",
      value: stats.users.total,
      icon: Users,
      bgColor: "bg-violet-100",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome Hero */}
        <WelcomeHero user={user} userRole={userRole} />

        {/* Key Stats Bar */}
        <KeyStatsBar stats={keyStats} />

        {/* Quick Apps - Phone Style */}
        <QuickApps />

        {/* AI Assistants Section */}
        <RoleGuard allowedRoles={["super_admin", "admin"]}>
          <AIAssistantsSection />
        </RoleGuard>

        {/* Main Modules Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Modüller</h2>
              <p className="text-sm text-slate-500">Tüm yönetim araçlarına hızlı erişim</p>
            </div>
          </div>

          {/* CRM Module Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PermissionGuard requiredPermission="quotes.view">
              <ModuleBanner
                title="İletişim Merkezi (CRM)"
                subtitle="Müşteri ilişkileri yönetimi"
                description="Tüm müşteri taleplerini, mesajları ve iletişim geçmişini tek bir yerden yönetin. Outlook ve Meta entegrasyonu ile çok kanallı iletişim."
                icon={MessagesSquare}
                href="/admin/crm-v2"
                gradient="from-violet-600 via-purple-600 to-indigo-600"
                features={["Gelen Kutusu", "Teklif Talepleri", "Site Mesajları", "Outlook", "Meta DM"]}
                stats={[
                  { value: pendingItems, label: "bekleyen" },
                  { value: totalRequests, label: "toplam" },
                ]}
                badge={pendingItems > 0 ? "Yeni Mesaj" : null}
                delay={0.35}
              />
            </PermissionGuard>

            {/* Firms & Contracts */}
            <PermissionGuard requiredPermission="companies.view">
              <ModuleBanner
                title="Firmalar & Sözleşmeler"
                subtitle="Müşteri portföyü yönetimi"
                description="Müşteri ve potansiyel müşteri bilgilerini, sözleşmeleri ve iş ilişkilerini profesyonelce yönetin."
                icon={Briefcase}
                href="/admin/companies"
                gradient="from-emerald-600 via-teal-500 to-cyan-500"
                features={["Firma Kartları", "Sözleşmeler", "İletişim Bilgileri", "Öncelik Takibi"]}
                stats={[
                  { value: stats.companies.clients, label: "müşteri" },
                  { value: stats.companies.prospects, label: "aday" },
                ]}
                delay={0.4}
              />
            </PermissionGuard>
          </div>

          {/* Sales & Finance Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PermissionGuard requiredPermission="proformas.view">
              <ModuleBanner
                title="Satış Yönetimi"
                subtitle="Proforma ve fiyatlandırma"
                description="Proforma fatura oluşturma, fiyatlandırma hesaplama ve satış süreçlerini yönetin."
                icon={Receipt}
                href="/admin/proformas"
                gradient="from-amber-500 via-orange-500 to-rose-500"
                features={["Proforma Fatura", "Fiyat Hesaplama", "PDF Çıktı"]}
                delay={0.45}
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="finance.view">
              <ModuleBanner
                title="Finans Merkezi"
                subtitle="Gelir, gider ve raporlar"
                description="Finansal işlemleri takip edin, gelir-gider analizleri yapın ve detaylı raporlar alın."
                icon={Wallet}
                href="/admin/finance"
                gradient="from-blue-600 via-indigo-500 to-violet-500"
                features={["Gelir Takibi", "Gider Yönetimi", "Finansal Raporlar"]}
                delay={0.5}
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="packaging.view">
              <ModuleBanner
                title="Depo & Envanter"
                subtitle="Stok ve irsaliye yönetimi"
                description="Ambalaj stoklarını takip edin, irsaliye oluşturun ve envanter yönetimini kolaylaştırın."
                icon={Package}
                href="/admin/packaging"
                gradient="from-teal-500 via-emerald-500 to-green-500"
                features={["Stok Takibi", "İrsaliye", "Ambalaj Yönetimi"]}
                delay={0.55}
              />
            </PermissionGuard>
          </div>

          {/* Content Management Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PermissionGuard requiredPermission="blog.read">
              <ModuleBanner
                title="Blog Yönetimi"
                subtitle="Makale ve içerik yayınlama"
                description="SEO uyumlu blog yazıları oluşturun, kategorilere ayırın ve yayın takviminizi yönetin."
                icon={PenTool}
                href="/admin/blog"
                gradient="from-rose-500 via-pink-500 to-fuchsia-500"
                features={["AI Yazı Üretimi", "SEO Optimizasyon", "Kategori Yönetimi", "Öne Çıkan Yazılar"]}
                stats={[
                  { value: stats.blog.totalPosts, label: "yazı" },
                  { value: stats.blog.publishedThisMonth, label: "bu ay" },
                ]}
                delay={0.6}
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="social_media.view">
              <ModuleBanner
                title="Sosyal Medya"
                subtitle="İçerik planlama ve paylaşım"
                description="Tüm sosyal medya hesaplarınız için içerik oluşturun, planlayın ve performansı takip edin."
                icon={Share2}
                href="/admin/social-media"
                gradient="from-cyan-500 via-blue-500 to-indigo-500"
                features={["Instagram", "Facebook", "LinkedIn", "İçerik Takvimi"]}
                delay={0.65}
              />
            </PermissionGuard>
          </div>

          {/* Integration & System Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RoleGuard allowedRoles={["super_admin", "admin"]}>
              <ModuleBanner
                title="Entegrasyonlar"
                subtitle="E-ticaret bağlantıları"
                description="Trendyol, Hepsiburada ve diğer pazaryeri entegrasyonlarını yönetin."
                icon={Plug}
                href="/admin/integrations"
                gradient="from-slate-700 via-slate-600 to-slate-500"
                features={["Trendyol", "Hepsiburada", "N11", "API Yönetimi"]}
                delay={0.7}
              />
            </RoleGuard>

            <PermissionGuard requiredPermission="users.view">
              <ModuleBanner
                title="Kullanıcı Yönetimi"
                subtitle="Yetki ve rol atama"
                description="Sistem kullanıcılarını yönetin, roller atayın ve erişim izinlerini düzenleyin."
                icon={Users}
                href="/admin/users"
                gradient="from-pink-600 via-rose-500 to-red-500"
                features={["Rol Atama", "İzin Yönetimi", "Aktivite Takibi"]}
                stats={[{ value: stats.users.total, label: "kullanıcı" }]}
                delay={0.75}
              />
            </PermissionGuard>

            <RoleGuard allowedRoles={["super_admin"]}>
              <ModuleBanner
                title="Sistem Ayarları"
                subtitle="Yapılandırma ve loglar"
                description="Sistem ayarlarını yapılandırın, logları inceleyin ve güvenlik kontrollerini yönetin."
                icon={Settings}
                href="/admin/settings"
                gradient="from-gray-700 via-gray-600 to-gray-500"
                features={["Genel Ayarlar", "Sistem Logları", "Güvenlik"]}
                delay={0.8}
              />
            </RoleGuard>
          </div>
        </motion.div>

        {/* System Status - Super Admin Only */}
        <RoleGuard allowedRoles={["super_admin"]}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Sistem Durumu</h3>
                  <p className="text-sm text-slate-500">Son kontrol ve senkronizasyon</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {lastSyncResult && (
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                      lastSyncResult.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    )}
                  >
                    {lastSyncResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span className="font-medium">{lastSyncResult.message}</span>
                  </div>
                )}

                <button
                  onClick={validateSystemConsistency}
                  disabled={isSyncing}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                    "bg-violet-600 text-white hover:bg-violet-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                  {isSyncing ? "Kontrol..." : "Kontrol Et"}
                </button>
              </div>
            </div>

            {/* Error/Warning Summary */}
            {(stats.logs.errors > 0 || stats.logs.warnings > 0) && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-rose-50 border border-rose-100">
                  <div className="text-xl font-bold text-rose-600">{stats.logs.errors}</div>
                  <div className="text-xs text-rose-600">Hata</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-xl font-bold text-amber-600">{stats.logs.warnings}</div>
                  <div className="text-xs text-amber-600">Uyarı</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-xl font-bold text-blue-600">{stats.logs.todayLogs}</div>
                  <div className="text-xs text-blue-600">Bugünkü Log</div>
                </div>
              </div>
            )}
          </motion.div>
        </RoleGuard>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center pb-6"
        >
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all",
              "bg-white border border-slate-200 text-slate-600",
              "hover:bg-slate-50 hover:border-slate-300 hover:shadow-md",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {refreshing ? "Yenileniyor..." : "Verileri Yenile"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
