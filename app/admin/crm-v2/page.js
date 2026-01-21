"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useToast } from "../../../hooks/use-toast";
import {
  getUnifiedInboxCounts,
  getCaseStatistics,
  getCustomerStatistics,
  getRecentActivities,
  getUpcomingReminders,
  // Birleşik Sync fonksiyonları
  autoSyncIfNeeded,
  manualSync,
  getLastSyncTime,
  formatSyncStatus,
  // Sync Lock fonksiyonları
  getSyncLockStatus,
} from "../../../lib/services/crm-v2";
import {
  CASE_STATUS,
  getCaseStatusLabel,
  getCaseStatusColor,
  CUSTOMER_TYPE,
  getCustomerTypeLabel,
  getActivityIcon,
  getActivityColor,
  getActivityBgColor,
  getActivityTypeLabel,
} from "../../../lib/services/crm-v2/schema";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Progress } from "../../../components/ui/progress";
import { ScrollArea } from "../../../components/ui/scroll-area";

// Icons
import {
  Inbox,
  Briefcase,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Plus,
  RefreshCw,
  BarChart3,
  Activity,
  MessageSquare,
  FileText,
  UserPlus,
  Mail,
  Phone,
  Loader2,
  RefreshCcw,
  Settings,
} from "lucide-react";

export default function CrmV2DashboardPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  
  const [data, setData] = useState({
    inboxCounts: null,
    caseStats: null,
    customerStats: null,
    recentActivities: [],
    upcomingReminders: [],
  });

  const loadDashboardData = async () => {
    try {
      const [inboxCounts, caseStats, customerStats, recentActivities, upcomingReminders] = await Promise.all([
        getUnifiedInboxCounts({ assignedTo: null }),
        getCaseStatistics(),
        getCustomerStatistics(),
        getRecentActivities({ limitCount: 10 }),
        getUpcomingReminders(user?.uid, { limitCount: 5 }),
      ]);

      setData({
        inboxCounts,
        caseStats,
        customerStats,
        recentActivities,
        upcomingReminders,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Sync durumunu yükle ve otomatik sync kontrolü yap
  useEffect(() => {
    const initSync = async () => {
      try {
        // Sync durumunu al
        const syncData = await getLastSyncTime();
        setSyncStatus(syncData);
        
        // Otomatik birleşik sync kontrolü (15 dakika geçtiyse)
        if (user?.uid) {
          console.log("[CRM Dashboard] Checking auto-sync (forms + emails)...");
          const result = await autoSyncIfNeeded(user.uid);
          
          if (result && !result.skipped && result.summary) {
            const { imported, threadUpdates, forms, emails } = result.summary;
            
            if (imported > 0 || threadUpdates > 0) {
              let description = '';
              if (forms > 0) description += `${forms} form`;
              if (emails > 0) description += `${description ? ', ' : ''}${emails} email`;
              
              toast({
                title: "Otomatik Senkronizasyon",
                description: `${description} senkronize edildi.`,
              });
              // Verileri yenile
              loadDashboardData();
            }
            
            // Sync durumunu güncelle
            const updatedSyncData = await getLastSyncTime();
            setSyncStatus(updatedSyncData);
          }
        }
      } catch (error) {
        console.error("[CRM Dashboard] Init sync error:", error);
      }
    };
    
    initSync();
  }, [user?.uid]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Manuel senkronizasyon (formlar + emailler - birleşik)
  const handleManualSync = async () => {
    if (syncing) return;
    
    // 🔒 Önce lock durumunu kontrol et
    const lockStatus = getSyncLockStatus();
    if (lockStatus.isLocked) {
      const elapsedSec = Math.round((lockStatus.elapsed || 0) / 1000);
      toast({
        title: "⏳ Senkronizasyon Devam Ediyor",
        description: `Başka bir senkronizasyon işlemi çalışıyor (${elapsedSec}s). Lütfen bekleyin.`,
        variant: "default",
      });
      return;
    }
    
    setSyncing(true);
    try {
      console.log('[CRM Dashboard] Starting unified sync (forms + emails)...');
      const result = await manualSync(user?.uid);
      
      // Lock nedeniyle skip edildiyse
      if (result.skipReason === 'sync_locked') {
        toast({
          title: "⏳ Senkronizasyon Bekleniyor",
          description: result.message || "Başka bir işlem devam ediyor.",
          variant: "default",
        });
        return;
      }
      
      if (result.skipped) {
        toast({
          title: "Senkronizasyon Atlandı",
          description: result.message || "Son 15 dakikada senkronize edilmiş.",
        });
      } else if (result.summary) {
        const { imported, threadUpdates, forms, emails, errors } = result.summary;
        
        let description = '';
        
        if (imported > 0 || threadUpdates > 0) {
          const parts = [];
          if (forms > 0) parts.push(`${forms} form`);
          if (emails > 0) parts.push(`${emails} email`);
          description = parts.join(', ') + ' senkronize edildi.';
        } else {
          description = 'Yeni veri bulunamadı.';
        }
        
        if (errors > 0) {
          description += ` ${errors} hata.`;
          console.error('[CRM Dashboard] Sync errors:', result.results);
        }
        
        toast({
          title: (imported > 0 || threadUpdates > 0) 
            ? "✅ Senkronizasyon Tamamlandı" 
            : "Kontrol Edildi",
          description,
        });
        
        // Verileri yenile
        if (imported > 0 || threadUpdates > 0) {
          loadDashboardData();
        }
      }
      
      // Sync durumunu güncelle
      const updatedSyncData = await getLastSyncTime();
      setSyncStatus(updatedSyncData);
      
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Senkronizasyon Hatası",
        description: "Veriler senkronize edilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <Skeleton className="h-10 w-32 bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl bg-slate-200" />
          <Skeleton className="h-96 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              Hoş geldiniz, {user?.displayName || "Admin"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Birleşik Sync Status & Button */}
            <div className="flex items-center gap-2">
              {syncStatus && (
                <span className={`text-xs ${formatSyncStatus(syncStatus).color}`}>
                  {formatSyncStatus(syncStatus).label}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualSync} 
                disabled={syncing}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                title="Formları ve Outlook emaillerini senkronize et"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4 mr-2" />
                )}
                {syncing ? "Senkronize..." : "Senkronize Et"}
              </Button>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing}
              title="Yenile"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/crm-v2/settings">
                <Settings className="h-4 w-4 mr-2" />
                Ayarlar
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Link href="/admin/crm-v2/inbox">
                <Inbox className="h-4 w-4 mr-2" />
                Inbox
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Inbox */}
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Inbox
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Inbox className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{data.inboxCounts?.open || 0}</span>
                <span className="text-sm text-slate-500">açık</span>
              </div>
              {data.inboxCounts?.unread > 0 && (
                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1 font-medium">
                  <Mail className="h-3 w-3" />
                  {data.inboxCounts.unread} okunmamış
                </p>
              )}
              <Link
                href="/admin/crm-v2/inbox"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 inline-flex items-center gap-1"
              >
                Tümünü gör <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Active Cases */}
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Aktif Talepler
              </CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <Briefcase className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {(data.caseStats?.byStatus?.[CASE_STATUS.NEW] || 0) +
                    (data.caseStats?.byStatus?.[CASE_STATUS.QUALIFYING] || 0) +
                    (data.caseStats?.byStatus?.[CASE_STATUS.QUOTE_SENT] || 0) +
                    (data.caseStats?.byStatus?.[CASE_STATUS.NEGOTIATING] || 0)}
                </span>
                <span className="text-sm text-slate-500">talep</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-green-600 font-medium">{data.caseStats?.byStatus?.[CASE_STATUS.WON] || 0} kazanıldı</span>
                <span className="text-slate-300">•</span>
                <span className="text-red-600 font-medium">{data.caseStats?.byStatus?.[CASE_STATUS.LOST] || 0} kaybedildi</span>
              </div>
              <Link
                href="/admin/crm-v2/cases"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 inline-flex items-center gap-1"
              >
                Pipeline'ı gör <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Customers */}
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Müşteriler
              </CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{data.customerStats?.total || 0}</span>
                <span className="text-sm text-slate-500">toplam</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-slate-600 font-medium">{data.customerStats?.byType?.[CUSTOMER_TYPE.CUSTOMER] || 0} aktif</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">{data.customerStats?.byType?.[CUSTOMER_TYPE.LEAD] || 0} potansiyel</span>
              </div>
              <Link
                href="/admin/crm-v2/customers"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 inline-flex items-center gap-1"
              >
                Tümünü gör <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Kazanılan Değer
              </CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(data.caseStats?.wonValue)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-slate-600 font-medium">
                  Dönüşüm: {data.caseStats?.conversionRate?.toFixed(1) || 0}%
                </span>
              </div>
              <Link
                href="/admin/crm-v2/reports"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3 inline-flex items-center gap-1"
              >
                Raporlar <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Overview */}
          <Card className="lg:col-span-2 bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                Pipeline Özeti
              </CardTitle>
              <CardDescription className="text-slate-500">
                Taleplerin aşamalara göre dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  CASE_STATUS.NEW,
                  CASE_STATUS.QUALIFYING,
                  CASE_STATUS.QUOTE_SENT,
                  CASE_STATUS.NEGOTIATING,
                ].map((status) => {
                  const count = data.caseStats?.byStatus?.[status] || 0;
                  const total = data.caseStats?.total || 1;
                  const percentage = (count / total) * 100;

                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getCaseStatusColor(status)}`}
                          />
                          <span className="text-slate-700 font-medium">{getCaseStatusLabel(status)}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2 bg-slate-100" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-slate-700 font-medium">
                      {data.caseStats?.byStatus?.[CASE_STATUS.WON] || 0} Kazanıldı
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-slate-700 font-medium">
                      {data.caseStats?.byStatus?.[CASE_STATUS.LOST] || 0} Kaybedildi
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  <Link href="/admin/crm-v2/cases">
                    Pipeline'ı Aç
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Bell className="h-5 w-5 text-slate-600" />
                Hatırlatmalar
              </CardTitle>
              <CardDescription className="text-slate-500">Yaklaşan hatırlatmalarınız</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {data.upcomingReminders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-3 bg-slate-50 rounded-full w-fit mx-auto mb-3">
                    <Bell className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">Yaklaşan hatırlatma yok</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.upcomingReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                    >
                      <div className="p-2 rounded-lg bg-amber-50">
                        <Bell className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {reminder.metadata?.title || "Hatırlatma"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {reminder.metadata?.dueDate &&
                            formatDistanceToNow(reminder.metadata.dueDate.toDate(), {
                              addSuffix: true,
                              locale: tr,
                            })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="h-5 w-5 text-slate-600" />
              Son Aktiviteler
            </CardTitle>
            <CardDescription className="text-slate-500">
              Sistemdeki son hareketler
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {data.recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 bg-slate-50 rounded-full w-fit mx-auto mb-3">
                  <Activity className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500">Henüz aktivite yok</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {data.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      <div className={`p-2 rounded-lg ${getActivityBgColor(activity.type)} ${getActivityColor(activity.type)}`}>
                        {activity.type === "message_received" && <MessageSquare className="h-4 w-4" />}
                        {activity.type === "message_sent" && <Mail className="h-4 w-4" />}
                        {activity.type === "case_created" && <Briefcase className="h-4 w-4" />}
                        {activity.type === "customer_created" && <UserPlus className="h-4 w-4" />}
                        {!["message_received", "message_sent", "case_created", "customer_created"].includes(activity.type) && (
                          <Activity className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium">
                          {activity.description || getActivityTypeLabel(activity.type)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(() => {
                            const originalDate = activity.metadata?.originalCreatedAt;
                            const displayDate = originalDate || activity.createdAt;
                            if (!displayDate) return '';
                            return formatDistanceToNow(
                              displayDate?.toDate?.() || new Date(displayDate),
                              { addSuffix: true, locale: tr }
                            );
                          })()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-900">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-50 justify-start h-auto py-3">
                <Link href="/admin/crm-v2/inbox?status=open">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Inbox className="h-4 w-4" />
                      <span className="font-medium">Açık Mesajlar</span>
                    </div>
                    <span className="text-xs text-slate-500">Bekleyen konuşmalar</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-50 justify-start h-auto py-3">
                <Link href="/admin/crm-v2/cases/new">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Yeni Talep</span>
                    </div>
                    <span className="text-xs text-slate-500">Talep oluştur</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-50 justify-start h-auto py-3">
                <Link href="/admin/crm-v2/customers/new">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <UserPlus className="h-4 w-4" />
                      <span className="font-medium">Yeni Müşteri</span>
                    </div>
                    <span className="text-xs text-slate-500">Müşteri ekle</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-50 justify-start h-auto py-3">
                <Link href="/admin/crm-v2/inbox/new">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">Manuel Kayıt</span>
                    </div>
                    <span className="text-xs text-slate-500">Konuşma ekle</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
