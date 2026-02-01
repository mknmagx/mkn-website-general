"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "../../../components/admin-route-guard";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CreditCard,
  HandCoins,
  PiggyBank,
  ArrowLeftRight,
  RefreshCcw,
  List,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/finance",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Hesaplar",
    href: "/admin/finance/accounts",
    icon: Wallet,
  },
  {
    name: "Tüm İşlemler",
    href: "/admin/finance/transactions",
    icon: List,
  },
  {
    name: "Transfer",
    href: "/admin/finance/transfer",
    icon: ArrowLeftRight,
  },
  {
    name: "Döviz Çevir",
    href: "/admin/finance/exchange",
    icon: RefreshCcw,
  },
  {
    name: "Gelirler",
    href: "/admin/finance/income",
    icon: ArrowUpCircle,
  },
  {
    name: "Giderler",
    href: "/admin/finance/expenses",
    icon: ArrowDownCircle,
  },
  {
    name: "Alacaklar",
    href: "/admin/finance/receivables",
    icon: TrendingUp,
  },
  {
    name: "Borçlar",
    href: "/admin/finance/payables",
    icon: TrendingDown,
  },
  {
    name: "Personel",
    href: "/admin/finance/personnel",
    icon: Users,
  },
  {
    name: "Maaşlar",
    href: "/admin/finance/salaries",
    icon: HandCoins,
  },
  {
    name: "Avanslar",
    href: "/admin/finance/advances",
    icon: CreditCard,
  },
  {
    name: "Raporlar",
    href: "/admin/finance/reports",
    icon: FileText,
  },
  {
    name: "Ayarlar",
    href: "/admin/finance/settings",
    icon: Settings,
  },
];

export default function FinanceLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("finance-sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("finance-sidebar-collapsed", JSON.stringify(newState));
  };

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <PermissionGuard requiredPermission="finance.view">
      <div className="flex h-[calc(100vh-64px)] bg-slate-50">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm",
            collapsed ? "w-16" : "w-56"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <PiggyBank className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-800">Finans</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-slate-500 hover:text-slate-700"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      active ? "text-emerald-600" : "text-slate-400"
                    )}
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-slate-100">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </PermissionGuard>
  );
}
