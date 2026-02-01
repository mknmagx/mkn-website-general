"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "@/components/admin-route-guard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Inbox,
  MessageSquare,
  Settings,
  LayoutDashboard,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Facebook,
} from "lucide-react";

// Custom Instagram Icon (smaller, cleaner)
const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Custom Meta Messenger Icon
const MetaMessengerIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.936 1.444 5.548 3.7 7.254V22l3.405-1.87c.91.252 1.873.388 2.895.388 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.054 12.443l-2.55-2.723-4.974 2.723 5.47-5.805 2.612 2.723 4.912-2.723-5.47 5.805z"/>
  </svg>
);

const navigation = [
  {
    name: "Gelen Kutusu",
    href: "/admin/meta-messenger",
    icon: Inbox,
    exact: true,
  },
  {
    name: "Hazır Yanıtlar",
    href: "/admin/meta-messenger/quick-replies",
    icon: MessageSquare,
  },
  {
    name: "Ayarlar",
    href: "/admin/meta-messenger/settings",
    icon: Settings,
  },
];

export default function MetaMessengerLayout({ children }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Bağlantı durumunu kontrol et
  const checkConnection = async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/settings");
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus(data.data.connectionStatus);
      }
    } catch (error) {
      // Silent fail for connection check
    }
  };

  // Okunmamış mesaj sayısını al
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/admin/instagram-dm/conversations?status=open");
      const data = await response.json();
      
      if (data.success) {
        setUnreadCount(data.meta?.unreadCount || 0);
      }
    } catch (error) {
      // Silent fail for unread count
    }
  };

  useEffect(() => {
    checkConnection();
    fetchUnreadCount();

    // Her 30 saniyede kontrol et
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await Promise.all([checkConnection(), fetchUnreadCount()]);
      toast({
        title: "Senkronize edildi",
        description: "Veriler güncellendi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Senkronizasyon başarısız",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const getConnectionIcon = () => {
    if (!connectionStatus) return <WifiOff className="h-4 w-4 text-gray-400" />;
    
    switch (connectionStatus.status) {
      case "connected":
        return <Wifi className="h-4 w-4 text-emerald-500" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <PermissionGuard requiredPermission="instagram_dm.view">
      <div className="flex h-full w-full overflow-hidden bg-gray-100">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <MetaMessengerIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-gray-900">Meta Mesajlar</span>
              </div>
              {getConnectionIcon()}
            </div>
            
            {/* Connection Status - Facebook & Instagram */}
            {connectionStatus && (
              <div className="mt-2 space-y-1">
                {connectionStatus.pageName && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Facebook className="h-3 w-3 text-blue-600" />
                    <span className="truncate">{connectionStatus.pageName}</span>
                  </div>
                )}
                {connectionStatus.instagramUsername && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <InstagramIcon className="h-3 w-3 text-pink-600" />
                    <span className="truncate">@{connectionStatus.instagramUsername}</span>
                  </div>
                )}
                {!connectionStatus.pageName && !connectionStatus.instagramUsername && connectionStatus.status === "disconnected" && (
                  <span className="text-xs text-amber-600">Bağlantı gerekli</span>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const showBadge = item.href === "/admin/meta-messenger" && unreadCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-white" : "text-gray-400")} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {showBadge && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-gray-500 h-8"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
              )}
              Senkronize Et
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </PermissionGuard>
  );
}
