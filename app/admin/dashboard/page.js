'use client';

import { useState, useEffect } from 'react';
import AdminProtectedWrapper from '../../../components/admin-protected-wrapper';
import { getQuoteStats } from '../../../lib/services/admin-quote-service';
import { getContactStats } from '../../../lib/services/admin-contact-service';
import { 
  BarChart3,
  FileText,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
  Mail,
  Phone
} from 'lucide-react';

export default function AdminDashboard() {
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [quoteResult, contactResult] = await Promise.all([
        getQuoteStats(),
        getContactStats()
      ]);

      if (quoteResult.success) {
        setQuoteStats(quoteResult.stats);
      }

      if (contactResult.success) {
        setContactStats(contactResult.stats);
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
      <AdminProtectedWrapper title="Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminProtectedWrapper>
    );
  }

  const totalRequests = quoteStats.total + contactStats.total;
  const pendingRequests = quoteStats.new + quoteStats.inProgress + contactStats.new + contactStats.inProgress;

  return (
    <AdminProtectedWrapper title="Dashboard">
      <div className="space-y-6">
        {/* Hoş Geldiniz */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow">
          <div className="px-6 py-8">
            <div className="flex items-center">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">
                  MKN Group Admin Paneli
                </h1>
                <p className="text-blue-100 mt-2">
                  Quote istekleri ve iletişim mesajlarını yönetin
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 rounded-lg p-4">
                  <BarChart3 className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ana İstatistikler */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Talep"
            value={totalRequests}
            icon={Activity}
            color="text-blue-600"
            description="Quote + İletişim"
          />
          <StatCard
            title="Bekleyen Talepler"
            value={pendingRequests}
            icon={AlertTriangle}
            color="text-orange-600"
            description="Yeni + İşlemde"
          />
          <StatCard
            title="Quote İstekleri"
            value={quoteStats.total}
            icon={FileText}
            color="text-purple-600"
            description="Fason üretim talepleri"
          />
          <StatCard
            title="İletişim Mesajları"
            value={contactStats.total}
            icon={MessageSquare}
            color="text-green-600"
            description="Genel iletişim talepleri"
          />
        </div>

        {/* Quote ve Contact İstatistikleri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quote İstatistikleri */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                Quote İstekleri Durumu
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Yeni</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{quoteStats.new}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">İşlemde</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{quoteStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Yanıtlandı</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{quoteStats.responded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Kapatıldı</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{quoteStats.closed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact İstatistikleri */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                İletişim Mesajları Durumu
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Yeni</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{contactStats.new}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">İşlemde</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{contactStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Yanıtlandı</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{contactStats.responded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Kapatıldı</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{contactStats.closed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Erişim */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Hızlı Erişim</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickActionCard
                title="Quote İstekleri"
                description="Fason üretim taleplerini görüntüleyin ve yönetin"
                icon={FileText}
                color="text-purple-600"
                href="/admin/quotes"
                count={quoteStats.new + quoteStats.inProgress}
              />
              <QuickActionCard
                title="İletişim Mesajları"
                description="Müşteri iletişim taleplerini görüntüleyin"
                icon={MessageSquare}
                color="text-green-600"
                href="/admin/contacts"
                count={contactStats.new + contactStats.inProgress}
              />
              <QuickActionCard
                title="Ayarlar"
                description="Admin panel ayarlarını yapılandırın"
                icon={Users}
                color="text-gray-600"
                href="/admin/settings"
              />
            </div>
          </div>
        </div>

        {/* Günlük Özet */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              Günlük Özet
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{quoteStats.new}</div>
                <div className="text-sm text-gray-500">Yeni Quote İsteği</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{contactStats.new}</div>
                <div className="text-sm text-gray-500">Yeni İletişim Mesajı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{pendingRequests}</div>
                <div className="text-sm text-gray-500">Bekleyen Toplam</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedWrapper>
  );
}