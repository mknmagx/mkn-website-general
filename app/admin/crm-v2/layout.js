"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "../../../components/admin-route-guard";
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
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({
    unread: 0,
    openCases: 0,
  });

  // Sidebar durum için local storage
  useEffect(() => {
    const saved = localStorage.getItem("crm-v2-sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

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

  return (
    <PermissionGuard requiredPermission="crm.view">
      <div className="flex h-[calc(100vh-64px)] bg-slate-50">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-base text-slate-900">CRM v2</h2>
                <p className="text-xs text-slate-500 mt-0.5">Müşteri Yönetimi</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn("h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100", collapsed && "mx-auto")}
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
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", active && "text-blue-600")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      {badgeCount > 0 && (
                        <Badge
                          variant={active ? "default" : "secondary"}
                          className={cn(
                            "h-5 min-w-[20px] px-1.5 text-xs font-medium",
                            active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
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
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Quick Actions */}
          <div className="p-3 border-t border-slate-200">
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              className={cn("w-full justify-start gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50", collapsed && "px-0")}
              asChild
            >
              <Link href="/admin/crm-v2/reminders">
                <Bell className="h-4 w-4" />
                {!collapsed && <span className="text-sm">Hatırlatmalar</span>}
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </PermissionGuard>
  );
}
