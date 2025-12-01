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
import {
  BarChart3,
  FileText,
  MessageSquare,
  Users,
  Building2,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
  Mail,
  Phone,
  DollarSign,
  Edit3,
  RefreshCw,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ShoppingCart,
  Sparkles,
  Eye,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, permissions, userRole, loading: authLoading } = useAdminAuth();
  const { hasPermission } = usePermissions();
  const {
    isSyncing,
    lastSyncResult,
    validateSystemConsistency,
    clearSyncStatus,
  } = useAdminSync();

  const [quoteStats, setQuoteStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    responded: 0,
    closed: 0,
  });

  const [contactStats, setContactStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    responded: 0,
    closed: 0,
  });

  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    superAdmins: 0,
    admins: 0,
    moderators: 0,
    users: 0,
  });

  const [companyStats, setCompanyStats] = useState({
    total: 0,
    clients: 0,
    prospects: 0,
    active: 0,
    inactive: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    monthlyRevenue: 0,
  });

  const [logStats, setLogStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    errors: 0,
    warnings: 0,
  });

  const [blogStats, setBlogStats] = useState({
    totalPosts: 0,
    totalCategories: 0,
    featuredPosts: 0,
    publishedThisMonth: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && permissions) {
      loadStats();
    }
  }, [authLoading, permissions]);

  const loadStats = async () => {
    setLoading(true);

    // Her bir stats çağrısını ayrı ayrı güvenli bir şekilde yap
    await loadStatsIndividually();

    setLoading(false);
  };

  const loadStatsIndividually = async () => {
    // Quote Stats - güvenli çağrı
    if (hasPermission("quotes.view")) {
      try {
        const quoteResult = await getQuoteStats();
        if (quoteResult && quoteResult.success) {
          setQuoteStats(quoteResult.stats);
        }
      } catch (error) {
        console.warn("Quote stats fetch failed:", error.message);
        setQuoteStats({
          total: 0,
          new: 0,
          inProgress: 0,
          responded: 0,
          closed: 0,
        });
      }
    }

    // Contact Stats - güvenli çağrı
    if (hasPermission("contacts.view")) {
      try {
        const contactResult = await getContactStats();
        if (contactResult && contactResult.success) {
          setContactStats(contactResult.stats);
        }
      } catch (error) {
        console.warn("Contact stats fetch failed:", error.message);
        setContactStats({
          total: 0,
          new: 0,
          inProgress: 0,
          responded: 0,
          closed: 0,
        });
      }
    }

    // User Stats - güvenli çağrı
    if (hasPermission("analytics.view") || hasPermission("users.view")) {
      try {
        const userResult = await getUserStats(permissions);
        if (userResult && userResult.success) {
          setUserStats(userResult.stats);
        }
      } catch (error) {
        console.warn("User stats fetch failed:", error.message);
        setUserStats({
          total: 0,
          active: 0,
          inactive: 0,
          superAdmins: 0,
          admins: 0,
          moderators: 0,
          users: 0,
        });
      }
    }

    // Company Stats - güvenli çağrı
    if (hasPermission("companies.view")) {
      try {
        const companyResult = await CompanyService.getCompanyStats();
        if (companyResult && companyResult.success) {
          setCompanyStats(companyResult.stats);
        }
      } catch (error) {
        console.warn("Company stats fetch failed:", error.message);
        setCompanyStats({
          total: 0,
          clients: 0,
          prospects: 0,
          active: 0,
          inactive: 0,
          highPriority: 0,
          mediumPriority: 0,
          lowPriority: 0,
          monthlyRevenue: 0,
        });
      }
    }

    // Log Stats - sistem izni kontrolü ile
    if (hasPermission("system.logs")) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const logResult = await getLogStats(today.toISOString(), null);
        if (logResult && logResult.success) {
          const stats = logResult.stats;
          setLogStats({
            totalLogs: stats.totalLogs || 0,
            todayLogs: stats.totalLogs || 0,
            errors: stats.levels?.error || 0,
            warnings: stats.levels?.warning || 0,
          });
        }
      } catch (error) {
        console.warn(
          "Log stats fetch failed (expected if user lacks system.logs permission):",
          error.message
        );
        setLogStats({
          totalLogs: 0,
          todayLogs: 0,
          errors: 0,
          warnings: 0,
        });
      }
    } else {
      // system.logs izni olmayan kullanıcılar için varsayılan değerler
      setLogStats({
        totalLogs: 0,
        todayLogs: 0,
        errors: 0,
        warnings: 0,
      });
    }

    // Blog Stats - güvenli çağrı
    if (hasPermission("blog.read")) {
      try {
        const blogResult = await getBlogStats();
        if (blogResult) {
          setBlogStats(blogResult);
        }
      } catch (error) {
        console.warn("Blog stats fetch failed:", error.message);
        setBlogStats({
          totalPosts: 0,
          totalCategories: 0,
          featuredPosts: 0,
          publishedThisMonth: 0,
        });
      }
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    description,
    link,
  }) => {
    const CardContent = (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Gradient accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${color} opacity-0 group-hover:opacity-100 transition-opacity`}
        ></div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                {trend && (
                  <div
                    className={`flex items-center text-sm font-semibold ${
                      trend.type === "up"
                        ? "text-emerald-600"
                        : trend.type === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {trend.type === "up" && (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    {trend.type === "down" && (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{trend.value}%</span>
                  </div>
                )}
              </div>
              {description && (
                <p className="text-xs text-gray-500 mt-2">{description}</p>
              )}
            </div>
            <div
              className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
            </div>
          </div>
        </div>

        {link && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Detayları görüntüle</span>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </div>
        )}
      </div>
    );

    if (link) {
      return <Link href={link}>{CardContent}</Link>;
    }

    return CardContent;
  };

  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    color,
    href,
    count,
    badge,
  }) => (
    <Link
      href={href}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              {badge && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
            {count !== undefined && (
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {count}
                </span>
                <span className="text-sm text-gray-500">bekliyor</span>
              </div>
            )}
          </div>
          <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </div>
      </div>
    </Link>
  );

  const ActivityItem = ({ type, message, time, status }) => {
    const getIcon = () => {
      switch (type) {
        case "quote":
          return <FileText className="h-4 w-4 text-blue-600" />;
        case "contact":
          return <MessageSquare className="h-4 w-4 text-green-600" />;
        case "company":
          return <Building2 className="h-4 w-4 text-purple-600" />;
        case "blog":
          return <Edit3 className="h-4 w-4 text-orange-600" />;
        default:
          return <Activity className="h-4 w-4 text-gray-600" />;
      }
    };

    const getStatusStyle = () => {
      switch (status) {
        case "new":
          return "bg-blue-50 text-blue-700 border-blue-200";
        case "in-progress":
          return "bg-orange-50 text-orange-700 border-orange-200";
        case "responded":
          return "bg-green-50 text-green-700 border-green-200";
        case "closed":
          return "bg-gray-50 text-gray-700 border-gray-200";
        default:
          return "bg-gray-50 text-gray-700 border-gray-200";
      }
    };

    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="flex-shrink-0 mt-1 p-2 bg-gray-50 rounded-lg">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <p className="text-xs text-gray-500 mt-0.5">{time}</p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyle()}`}
        >
          {status}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
          <p className="text-sm text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  const totalRequests = quoteStats.total + contactStats.total;
  const pendingRequests =
    quoteStats.new +
    quoteStats.inProgress +
    contactStats.new +
    contactStats.inProgress;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              ></div>
            </div>

            <div className="relative px-8 py-10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-yellow-300" />
                      <span className="text-blue-100 text-sm font-medium">
                        Admin Panel
                      </span>
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Hoş Geldiniz,{" "}
                    {user?.displayName || user?.email?.split("@")[0] || "Admin"}
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base">
                    {userRole === "super_admin" &&
                      "🔐 Süper Admin - Tam sistem erişimi"}
                    {userRole === "admin" &&
                      "⚙️ Admin - Sistem ve kullanıcı yönetimi"}
                    {userRole === "moderator" &&
                      "📝 Moderatör - İçerik yönetimi"}
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <BarChart3 className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">
                    {totalRequests}
                  </div>
                  <div className="text-blue-100 text-sm">Toplam Talep</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">
                    {pendingRequests}
                  </div>
                  <div className="text-blue-100 text-sm">Bekleyen</div>
                </div>
                <PermissionGuard requiredPermission="companies.view">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-2xl font-bold text-white">
                      {companyStats.total}
                    </div>
                    <div className="text-blue-100 text-sm">Firma</div>
                  </div>
                </PermissionGuard>
                <PermissionGuard requiredPermission="users.view">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-2xl font-bold text-white">
                      {userStats.total}
                    </div>
                    <div className="text-blue-100 text-sm">Kullanıcı</div>
                  </div>
                </PermissionGuard>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Genel Bakış</h2>
            <button
              onClick={loadStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Yenile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PermissionGuard requiredPermission="quotes.view">
              <StatCard
                title="Quote İstekleri"
                value={quoteStats.total}
                icon={FileText}
                color="bg-blue-600"
                description={`${quoteStats.new} yeni, ${quoteStats.inProgress} işlemde`}
                trend={{ type: "up", value: 12 }}
                link="/admin/quotes"
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="contacts.view">
              <StatCard
                title="İletişim Mesajları"
                value={contactStats.total}
                icon={MessageSquare}
                color="bg-green-600"
                description={`${contactStats.new} yeni mesaj`}
                trend={{ type: "up", value: 8 }}
                link="/admin/contacts"
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="companies.view">
              <StatCard
                title="Firmalar"
                value={companyStats.total}
                icon={Building2}
                color="bg-purple-600"
                description={`${companyStats.clients} aktif müşteri`}
                link="/admin/companies"
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="blog.read">
              <StatCard
                title="Blog Yazıları"
                value={blogStats.totalPosts}
                icon={Edit3}
                color="bg-orange-600"
                description={`${blogStats.featuredPosts} öne çıkan`}
                link="/admin/blog"
              />
            </PermissionGuard>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PermissionGuard requiredPermission="quotes.view">
              <QuickActionCard
                title="Fiyat Talepleri"
                description="Müşteri fiyat taleplerinizi görüntüleyin ve yanıtlayın"
                icon={FileText}
                color="bg-blue-600"
                href="/admin/quotes"
                count={quoteStats.new + quoteStats.inProgress}
                badge={quoteStats.new > 0 ? `${quoteStats.new} yeni` : null}
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="contacts.view">
              <QuickActionCard
                title="İletişim Mesajları"
                description="Gelen mesajları yönetin ve cevaplayın"
                icon={MessageSquare}
                color="bg-green-600"
                href="/admin/contacts"
                count={contactStats.new + contactStats.inProgress}
                badge={contactStats.new > 0 ? `${contactStats.new} yeni` : null}
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="companies.view">
              <QuickActionCard
                title="Firma Yönetimi"
                description="Müşteri firmalarınızı yönetin"
                icon={Building2}
                color="bg-purple-600"
                href="/admin/companies"
                badge={
                  companyStats.highPriority > 0
                    ? `${companyStats.highPriority} öncelikli`
                    : null
                }
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="blog.write">
              <QuickActionCard
                title="Blog Yönetimi"
                description="Blog yazılarını oluşturun ve düzenleyin"
                icon={Edit3}
                color="bg-orange-600"
                href="/admin/blog"
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="users.view">
              <QuickActionCard
                title="Kullanıcı Yönetimi"
                description="Sistem kullanıcılarını yönetin"
                icon={Users}
                color="bg-indigo-600"
                href="/admin/users"
              />
            </PermissionGuard>

            <PermissionGuard requiredPermission="system.logs">
              <QuickActionCard
                title="Sistem Logları"
                description="Sistem aktivitelerini görüntüleyin"
                icon={Activity}
                color="bg-red-600"
                href="/admin/logs"
                badge={logStats.errors > 0 ? `${logStats.errors} hata` : null}
              />
            </PermissionGuard>
          </div>
        </div>

        {/* Company Management Section */}
        <PermissionGuard requiredPermission="companies.view">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Firma İstatistikleri
                </h2>
              </div>
              <Link
                href="/admin/companies"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Tümünü Gör
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-medium text-green-600">
                    Aktif
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {companyStats.clients}
                </div>
                <div className="text-xs text-gray-600 mt-1">Müşteriler</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-600">
                    Potansiyel
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {companyStats.prospects}
                </div>
                <div className="text-xs text-gray-600 mt-1">Görüşmede</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-xs font-medium text-red-600">
                    Öncelikli
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {companyStats.highPriority}
                </div>
                <div className="text-xs text-gray-600 mt-1">Takip Gerekli</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">
                    Toplam
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {companyStats.total}
                </div>
                <div className="text-xs text-gray-600 mt-1">Firma</div>
              </div>
            </div>

            {companyStats.monthlyRevenue > 0 && (
              <div className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Tahmini Aylık Gelir
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₺{companyStats.monthlyRevenue.toLocaleString("tr-TR")}
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            )}
          </div>
        </PermissionGuard>

        {/* Blog Stats Section */}
        <PermissionGuard requiredPermission="blog.read">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit3 className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Blog İstatistikleri
                </h2>
              </div>
              <Link
                href="/admin/blog"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Blog Paneli
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-gray-900">
                  {blogStats.totalPosts}
                </div>
                <div className="text-sm text-gray-600 mt-1">Toplam Yazı</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-900">
                  {blogStats.featuredPosts}
                </div>
                <div className="text-sm text-purple-600 mt-1">Öne Çıkan</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-900">
                  {blogStats.totalCategories}
                </div>
                <div className="text-sm text-blue-600 mt-1">Kategori</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-900">
                  {blogStats.publishedThisMonth}
                </div>
                <div className="text-sm text-green-600 mt-1">Bu Ay</div>
              </div>
            </div>
          </div>
        </PermissionGuard>

        {/* System Consistency Check - Super Admin Only */}
        <RoleGuard allowedRoles={["super_admin"]}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Sistem Tutarlılığı
                  </h2>
                  <p className="text-sm text-gray-600">
                    Kullanıcı izinlerini doğrulayın ve senkronize edin
                  </p>
                </div>
              </div>
              <button
                onClick={validateSystemConsistency}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "Kontrol Ediliyor..." : "Kontrol Et"}
              </button>
            </div>

            {lastSyncResult && (
              <div
                className={`p-4 rounded-xl border-2 ${
                  lastSyncResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {lastSyncResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        lastSyncResult.success
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      {lastSyncResult.message}
                    </p>
                    {lastSyncResult.success &&
                      (lastSyncResult.fixedUsers > 0 ||
                        lastSyncResult.fixedRoles > 0) && (
                        <p className="text-sm text-green-700 mt-2">
                          ✓ Düzeltilen: {lastSyncResult.fixedUsers} kullanıcı,{" "}
                          {lastSyncResult.fixedRoles} rol
                        </p>
                      )}
                  </div>
                  <button
                    onClick={clearSyncStatus}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </RoleGuard>

        {/* System Logs Preview */}
        <PermissionGuard requiredPermission="system.logs">
          {(logStats.errors > 0 || logStats.warnings > 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Activity className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Sistem Durumu
                    </h2>
                    <p className="text-sm text-gray-600">
                      Son 24 saat içindeki log özeti
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/logs"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Detaylı Loglar
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600 mb-2" />
                  <div className="text-2xl font-bold text-red-900">
                    {logStats.errors}
                  </div>
                  <div className="text-sm text-red-600">Hata</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mb-2" />
                  <div className="text-2xl font-bold text-yellow-900">
                    {logStats.warnings}
                  </div>
                  <div className="text-sm text-yellow-600">Uyarı</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <Activity className="h-5 w-5 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-900">
                    {logStats.todayLogs}
                  </div>
                  <div className="text-sm text-blue-600">Toplam Log</div>
                </div>
              </div>
            </div>
          )}
        </PermissionGuard>
      </div>
    </div>
  );
}
