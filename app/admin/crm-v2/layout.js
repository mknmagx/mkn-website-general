"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "../../../components/admin-route-guard";
import { useAdminAuth } from "../../../hooks/use-admin-auth";
import { useToast } from "../../../hooks/use-toast";
import {
  getReminderStats,
  autoSyncIfNeeded,
  getLastSyncTime,
} from "../../../lib/services/crm-v2";
import {
  manualSync,
  formatSyncStatus,
  getSyncLockStatus,
} from "../../../lib/services/crm-v2/sync-service";
import { getCrmSettings } from "../../../lib/services/crm-v2/settings-service";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Inbox,
  Briefcase,
  Users,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Tags,
  Bell,
  ShoppingCart,
  RefreshCw,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/crm-v2",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Inbox",
    href: "/admin/crm-v2/inbox",
    icon: Inbox,
    badge: "unread", // Dinamik badge gösterimi için
  },
  {
    name: "Talepler",
    href: "/admin/crm-v2/cases",
    icon: Briefcase,
    badge: "openCases",
  },
  {
    name: "Siparişler",
    href: "/admin/crm-v2/orders",
    icon: ShoppingCart,
  },
  {
    name: "Müşteriler",
    href: "/admin/crm-v2/customers",
    icon: Users,
  },
  {
    name: "Hatırlatmalar",
    href: "/admin/crm-v2/reminders",
    icon: Bell,
    badge: "reminders", // Dinamik badge gösterimi için
  },
  {
    name: "Raporlar",
    href: "/admin/crm-v2/reports",
    icon: BarChart3,
  },
  {
    name: "Ayarlar",
    href: "/admin/crm-v2/settings",
    icon: Settings,
  },
];

export default function CrmV2Layout({ children }) {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [counts, setCounts] = useState({
    unread: 0,
    openCases: 0,
    reminders: 0,
  });

  // Sidebar durum için local storage
  useEffect(() => {
    const saved = localStorage.getItem("crm-v2-sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  // Reminder sayılarını yükle
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const stats = await getReminderStats();
        setCounts((prev) => ({
          ...prev,
          reminders: (stats?.overdue || 0) + (stats?.today || 0),
        }));
      } catch (error) {
        console.error("Error loading reminder counts:", error);
      }
    };

    loadCounts();

    // Her 60 saniyede bir güncelle
    const interval = setInterval(loadCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync status yükle
  const loadSyncStatus = async () => {
    try {
      const syncData = await getLastSyncTime();
      const lockStatus = await getSyncLockStatus();
      setSyncStatus({
        lastSyncAt: syncData?.lastSyncAt || null,
        lastSyncBy: syncData?.lastSyncBy || null,
        syncCount: syncData?.syncCount || 0,
        isLocked: lockStatus.isLocked,
        lockedBy: lockStatus.lockedBy,
      });
    } catch (error) {
      console.error("Error loading sync status:", error);
    }
  };

  // Manuel sync
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await manualSync(user?.uid);

      // result.skipped = false ise başarılı, skipped = true ise atlandı
      if (!result.skipped) {
        const { summary } = result;
        const parts = [];
        if (summary?.forms) parts.push(`${summary.forms} form`);
        if (summary?.emails) parts.push(`${summary.emails} email`);

        // WhatsApp detayları
        const wpConv = summary?.whatsapp?.conversations || 0;
        const wpMsg = summary?.whatsapp?.messages || 0;
        if (wpConv || wpMsg) {
          const wpParts = [];
          if (wpConv) wpParts.push(`${wpConv} sohbet`);
          if (wpMsg) wpParts.push(`${wpMsg} mesaj`);
          parts.push(`${wpParts.join(", ")} (WhatsApp)`);
        }

        const description =
          parts.length > 0
            ? `${parts.join(", ")} senkronize edildi`
            : "Veriler senkronize edildi";
        toast({
          title: "Senkronizasyon Tamamlandı",
          description,
        });
      } else if (result.skipReason === "sync_locked") {
        toast({
          title: "Senkronizasyon Bekliyor",
          description: result.message || "Başka bir işlem devam ediyor",
          variant: "default",
        });
      } else {
        toast({
          title: "Senkronizasyon Atlandı",
          description: result.message || "Henüz gerekli değil",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
      loadSyncStatus();
    }
  };

  // CRM Otomatik Senkronizasyon (formlar + emailler)
  useEffect(() => {
    let syncIntervalId = null;
    let statusIntervalId = null;

    const performAutoSync = async () => {
      if (!user?.uid) return;

      try {
        console.log("[CRM Layout] Checking auto-sync (forms + emails)...");
        const result = await autoSyncIfNeeded(user.uid);

        if (result && !result.skipped && result.summary) {
          const { imported, threadUpdates, forms, emails } = result.summary;

          if (imported > 0 || threadUpdates > 0) {
            let description = "";
            if (forms > 0) description += `${forms} form`;
            if (emails > 0)
              description += `${description ? ", " : ""}${emails} email`;

            toast({
              title: "Otomatik Senkronizasyon",
              description: `${description} senkronize edildi.`,
            });
          }
        }

        // Sync sonrası status'u güncelle
        loadSyncStatus();
      } catch (error) {
        console.error("[CRM Layout] Auto-sync error:", error);
      }
    };

    const initSync = async () => {
      if (!user?.uid) return;

      // Önce sync status'u yükle
      loadSyncStatus();

      // İlk sync kontrolü
      await performAutoSync();

      // Ayarlardan sync interval'i al
      try {
        const settings = await getCrmSettings();
        const syncIntervalMinutes = settings?.sync?.syncInterval || 15;
        const intervalMs = syncIntervalMinutes * 60 * 1000; // dakikayı ms'ye çevir

        console.log(
          `[CRM Layout] Setting up auto-sync interval: ${syncIntervalMinutes} minutes`,
        );

        // Periyodik senkronizasyon kontrolü (ayarlardaki interval'e göre)
        syncIntervalId = setInterval(performAutoSync, intervalMs);
      } catch (error) {
        console.error("[CRM Layout] Error setting up sync interval:", error);
        // Hata durumunda varsayılan 15 dakika
        syncIntervalId = setInterval(performAutoSync, 15 * 60 * 1000);
      }

      // UI status güncellemesi için ayrı interval (her 30 saniye)
      statusIntervalId = setInterval(loadSyncStatus, 30000);
    };

    initSync();

    return () => {
      if (syncIntervalId) clearInterval(syncIntervalId);
      if (statusIntervalId) clearInterval(statusIntervalId);
    };
  }, [user?.uid, toast]);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("crm-v2-sidebar-collapsed", JSON.stringify(newState));
  };

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  // lastSyncAt'i Date'e çevir (Timestamp, Date veya string olabilir)
  const getLastSyncDate = () => {
    if (!syncStatus?.lastSyncAt) return null;
    const ls = syncStatus.lastSyncAt;
    if (ls.toDate) return ls.toDate(); // Firestore Timestamp
    if (ls instanceof Date) return ls; // Already Date
    if (typeof ls === "string" || typeof ls === "number") return new Date(ls);
    return null;
  };

  return (
    <PermissionGuard requiredPermission="crm.view">
      <div className="flex h-full max-h-full overflow-hidden bg-slate-50">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm relative flex-shrink-0",
            collapsed ? "w-16" : "w-64",
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-base text-slate-900">
                  CRM v2
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Müşteri Yönetimi
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                collapsed && "mx-auto",
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const badgeCount = item.badge ? counts[item.badge] : 0;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
                    active
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      active && "text-blue-600",
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">
                        {item.name}
                      </span>
                      {badgeCount > 0 && (
                        <Badge
                          variant={active ? "default" : "secondary"}
                          className={cn(
                            "h-5 min-w-[20px] px-1.5 text-xs font-medium",
                            active
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-700",
                          )}
                        >
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </Badge>
                      )}
                    </>
                  )}
                  {collapsed && badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                  {collapsed && (
                    <div className="fixed left-16 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999]">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sync Status Footer */}
          <div className="p-3 border-t border-slate-200">
            {collapsed ? (
              /* Collapsed: Sadece ikon butonu */
              <button
                onClick={handleManualSync}
                disabled={syncing || syncStatus?.isLocked}
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 group relative"
                title="Senkronize Et"
              >
                {syncing || syncStatus?.isLocked ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : syncStatus?.lastSyncAt ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <RefreshCw className="h-5 w-5 text-slate-400" />
                )}
                {/* Tooltip */}
                <div className="fixed left-16 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999]">
                  {syncing ? "Senkronize ediliyor..." : "Son sync: "}
                  {!syncing && getLastSyncDate()
                    ? formatDistanceToNow(getLastSyncDate(), {
                        addSuffix: true,
                        locale: tr,
                      })
                    : !syncing
                      ? "Henüz yok"
                      : ""}
                </div>
              </button>
            ) : (
              /* Expanded: Full widget */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {syncStatus?.lastSyncAt ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Son Sync
                      </p>
                      <p className="text-xs text-slate-400">
                        {getLastSyncDate()
                          ? formatDistanceToNow(getLastSyncDate(), {
                              addSuffix: true,
                              locale: tr,
                            })
                          : "Henüz yok"}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleManualSync}
                  disabled={syncing || syncStatus?.isLocked}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {syncing || syncStatus?.isLocked ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Senkronize ediliyor...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Senkronize Et</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </PermissionGuard>
  );
}
