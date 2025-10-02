'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../../hooks/use-admin-auth';
import { PermissionGuard, RoleGuard, usePermissions } from '../../../components/admin-route-guard';
import { getQuoteStats } from '../../../lib/services/admin-quote-service';
import { getContactStats } from '../../../lib/services/admin-contact-service';
import { getUserStats } from '../../../lib/services/admin-user-service';
import { getLogStats } from '../../../lib/services/admin-log-service';
import { getBlogStats } from '../../../lib/services/blog-service';
import { CompanyService } from '../../../lib/services/company-service';
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
  Edit3
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, permissions, userRole, loading: authLoading } = useAdminAuth();
  const { hasPermission } = usePermissions();
  
  const [quoteStats, setQuoteStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    responded: 0,
    closed: 0
  });
  
  const [contactStats, setContactStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    responded: 0,
    closed: 0
  });

  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    superAdmins: 0,
    admins: 0,
    moderators: 0,
    users: 0
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
    monthlyRevenue: 0
  });

  const [logStats, setLogStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    errors: 0,
    warnings: 0
  });

  const [blogStats, setBlogStats] = useState({
    totalPosts: 0,
    totalCategories: 0,
    featuredPosts: 0,
    publishedThisMonth: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && permissions) {
      loadStats();
    }
  }, [authLoading, permissions]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const promises = [];
      
      // Quote stats - tüm admin rollerine açık
      if (hasPermission("canViewAllQuotes")) {
        promises.push(getQuoteStats());
      }
      
      // Contact stats - tüm admin rollerine açık  
      if (hasPermission("canViewAllContacts")) {
        promises.push(getContactStats());
      }
      
      // User stats - sadece yetki sahibi kullanıcılar için
      if (hasPermission("canViewAnalytics")) {
        promises.push(getUserStats(permissions));
      }

      // Company stats - firma yönetimi yetkisi olanlar için
      if (hasPermission("canManageCompanies")) {
        promises.push(CompanyService.getCompanyStats());
      }

      // Log stats - tüm admin kullanıcıları görebilir
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      promises.push(getLogStats(today.toISOString(), null));

      // Blog stats - blog yönetimi yetkisi olanlar için
      if (hasPermission("blog.read") || hasPermission("canManageBlog")) {
        promises.push(getBlogStats());
      }

      const results = await Promise.all(promises);
      let resultIndex = 0;

      if (hasPermission("canViewAllQuotes")) {
        const quoteResult = results[resultIndex++];
        if (quoteResult.success) {
          setQuoteStats(quoteResult.stats);
        }
      }

      if (hasPermission("canViewAllContacts")) {
        const contactResult = results[resultIndex++];
        if (contactResult.success) {
          setContactStats(contactResult.stats);
        }
      }

      if (hasPermission("canViewAnalytics")) {
        const userResult = results[resultIndex++];
        if (userResult.success) {
          setUserStats(userResult.stats);
        }
      }

      // Company stats - firma yönetimi yetkisi olanlar için
      if (hasPermission("canManageCompanies")) {
        const companyResult = results[resultIndex++];
        if (companyResult.success) {
          setCompanyStats(companyResult.stats);
        }
      }

      // Log stats her zaman yükle
      const logResult = results[resultIndex++];
      if (logResult.success) {
        const stats = logResult.stats;
        setLogStats({
          totalLogs: stats.totalLogs || 0,
          todayLogs: stats.totalLogs || 0, // Today için ayrı hesaplanabilir
          errors: stats.levels?.error || 0,
          warnings: stats.levels?.warning || 0,
        });
      }

      // Blog stats - blog yönetimi yetkisi olanlar için
      if (hasPermission("blog.read") || hasPermission("canManageBlog")) {
        const blogResult = results[resultIndex++];
        if (blogResult) {
          setBlogStats(blogResult);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, description }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.type === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                    <span className="ml-1">{trend.value}%</span>
                  </div>
                )}
              </dd>
              {description && (
                <div className="text-xs text-gray-400 mt-1">{description}</div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, href, count }) => (
    <a
      href={href}
      className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
            {count !== undefined && (
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">{count}</span>
                <span className="text-sm text-gray-500 ml-1">adet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );

  const ActivityItem = ({ type, message, time, status }) => {
    const getIcon = () => {
      switch (type) {
        case 'quote':
          return <FileText className="h-4 w-4 text-blue-500" />;
        case 'contact':
          return <MessageSquare className="h-4 w-4 text-green-500" />;
        default:
          return <Activity className="h-4 w-4 text-gray-500" />;
      }
    };

    const getStatusColor = () => {
      switch (status) {
        case 'new':
          return 'text-blue-600 bg-blue-100';
        case 'in-progress':
          return 'text-orange-600 bg-orange-100';
        case 'responded':
          return 'text-green-600 bg-green-100';
        case 'closed':
          return 'text-gray-600 bg-gray-100';
        default:
          return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="flex items-center space-x-3 py-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{message}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {status}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalRequests = quoteStats.total + contactStats.total;
  const pendingRequests = quoteStats.new + quoteStats.inProgress + contactStats.new + contactStats.inProgress;

  return (
    <div className="space-y-6">
      {/* Hoş Geldiniz */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow">
        <div className="px-6 py-8">
          <div className="flex items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                Hoş Geldiniz, {user?.displayName || user?.email || "Admin"}
              </h1>
              <div className="flex items-center mt-2">
                <span className="text-blue-100">
                  {userRole === "super_admin" && "Süper Admin olarak giriş yaptınız - Tüm sistem yetkilerine sahipsiniz"}
                  {userRole === "admin" && "Admin olarak giriş yaptınız - Kullanıcı ve sistem yönetimi yetkileriniz bulunmaktadır"}
                  {userRole === "moderator" && "Moderatör olarak giriş yaptınız - İçerik yönetimi yetkileriniz bulunmaktadır"}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 rounded-lg p-4">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İstatistikler - Role-based */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Quote Stats - Tüm admin rollerine görünür */}
        <PermissionGuard requiredPermission="canViewAllQuotes">
          <StatCard
            title="Quote İstekleri"
            value={quoteStats.total}
            icon={FileText}
            color="text-purple-600"
            description="Fason üretim talepleri"
          />
        </PermissionGuard>

        {/* Contact Stats - Tüm admin rollerine görünür */}
        <PermissionGuard requiredPermission="canViewAllContacts">
          <StatCard
            title="İletişim Mesajları"
            value={contactStats.total}
            icon={MessageSquare}
            color="text-green-600"
            description="Müşteri mesajları"
          />
        </PermissionGuard>

        {/* User Stats - Sadece user management yetkisi olanlar */}
        <PermissionGuard requiredPermission="canViewAnalytics">
          <StatCard
            title="Sistem Kullanıcıları"
            value={userStats.total}
            icon={Users}
            color="text-blue-600"
            description="Toplam kullanıcı"
          />
        </PermissionGuard>

        {/* Blog Stats - Blog yönetimi yetkisi olanlar */}
        <PermissionGuard requiredPermission="blog.read">
          <Link href="/admin/blog" className="block hover:shadow-lg transition-shadow">
            <StatCard
              title="Blog Yazıları"
              value={blogStats.totalPosts}
              icon={Edit3}
              color="text-purple-600"
              description={`${blogStats.featuredPosts} öne çıkan, ${blogStats.totalCategories} kategori`}
            />
          </Link>
        </PermissionGuard>

        {/* Log Stats - Tüm admin kullanıcılarına görünür */}
        <Link href="/admin/logs" className="block hover:shadow-lg transition-shadow">
          <StatCard
            title="Sistem Logları"
            value={logStats.totalLogs}
            icon={Activity}
            color="text-orange-600"
            description={`${logStats.errors} hata, ${logStats.warnings} uyarı`}
          />
        </Link>
      </div>

      {/* Blog Yönetimi İstatistikleri - Blog yetkisi olanlar */}
      <PermissionGuard requiredPermission="blog.read">
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Blog Yönetimi</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Toplam Yazı"
              value={blogStats.totalPosts}
              icon={Edit3}
              color="text-blue-600"
              description="Yayınlanan blog yazıları"
            />
            <StatCard
              title="Kategoriler"
              value={blogStats.totalCategories}
              icon={BarChart3}
              color="text-green-600"
              description="Blog kategorileri"
            />
            <StatCard
              title="Öne Çıkan"
              value={blogStats.featuredPosts}
              icon={TrendingUp}
              color="text-purple-600"
              description="Öne çıkan yazılar"
            />
            <StatCard
              title="Bu Ay Yayınlanan"
              value={blogStats.publishedThisMonth}
              icon={Calendar}
              color="text-orange-600"
              description="Bu ay yayınlanan yazılar"
            />
          </div>
        </div>
      </PermissionGuard>

      {/* Firma İstatistikleri - Sadece company management yetkisi olanlar */}
      <PermissionGuard requiredPermission="canManageCompanies">
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Firma Yönetimi</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Toplam Firma"
              value={companyStats.total}
              icon={Building2}
              color="text-indigo-600"
              description="Kayıtlı tüm firmalar"
            />
            <StatCard
              title="Aktif Müşteriler"
              value={companyStats.clients}
              icon={CheckCircle}
              color="text-green-600"
              description="Anlaşmalı müşteriler"
            />
            <StatCard
              title="Potansiyel Müşteriler"
              value={companyStats.prospects}
              icon={Clock}
              color="text-yellow-600"
              description="Görüşme aşamasında"
            />
            <StatCard
              title="Yüksek Öncelik"
              value={companyStats.highPriority}
              icon={AlertTriangle}
              color="text-red-600"
              description="Öncelikli takip"
            />
          </div>
          
          {/* Aylık Gelir Kartı */}
          {companyStats.monthlyRevenue > 0 && (
            <div className="mt-4">
              <StatCard
                title="Aylık Tahmini Gelir"
                value={`₺${companyStats.monthlyRevenue.toLocaleString('tr-TR')}`}
                icon={DollarSign}
                color="text-emerald-600"
                description="Aktif müşterilerden"
              />
            </div>
          )}
        </div>
      </PermissionGuard>

      {/* Özet Bilgiler */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sistem Özeti</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalRequests}</div>
            <div className="text-sm text-gray-500">Toplam Talep</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingRequests}</div>
            <div className="text-sm text-gray-500">Bekleyen Toplam</div>
          </div>
          
          {/* Company özet bilgileri - sadece yetki sahibi kullanıcılar için */}
          <PermissionGuard requiredPermission="canManageCompanies">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{companyStats.active}</div>
              <div className="text-sm text-gray-500">Aktif Firma</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{companyStats.inactive}</div>
              <div className="text-sm text-gray-500">Pasif Firma</div>
            </div>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}