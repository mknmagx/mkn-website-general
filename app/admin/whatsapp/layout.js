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
  FileText,
  Settings,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  AlertCircle,
  BarChart3,
} from "lucide-react";

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const navigation = [
  {
    name: "Gelen Kutusu",
    href: "/admin/whatsapp",
    icon: Inbox,
    exact: true,
  },
  {
    name: "Şablonlar",
    href: "/admin/whatsapp/message-templates",
    icon: FileText,
  },
  {
    name: "Analitik",
    href: "/admin/whatsapp/analytics",
    icon: BarChart3,
  },
  {
    name: "Ayarlar",
    href: "/admin/whatsapp/settings",
    icon: Settings,
  },
];

export default function WhatsAppLayout({ children }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Check connection status
  const checkConnection = async () => {
    try {
      const response = await fetch("/api/admin/whatsapp/settings");
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus(data.data?.connectionStatus);
      }
    } catch (error) {
      // Silent fail
    }
  };

  // Get unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/admin/whatsapp/conversations?unread=true");
      const data = await response.json();
      
      if (data.success) {
        setUnreadCount(data.data?.totalUnread || 0);
      }
    } catch (error) {
      // Silent fail
    }
  };

  useEffect(() => {
    checkConnection();
    fetchUnreadCount();

    // Refresh every 30 seconds
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
    <PermissionGuard requiredPermission="whatsapp.view">
      <div className="flex h-full w-full overflow-hidden bg-gray-100">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <WhatsAppIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 truncate">
                  WhatsApp
                </h2>
                <div className="flex items-center gap-1">
                  {getConnectionIcon()}
                  <span className="text-xs text-gray-500">
                    {connectionStatus?.status === "connected" ? "Bağlı" : "Bağlı değil"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4",
                    active ? "text-green-600" : "text-gray-400"
                  )} />
                  <span className="flex-1">{item.name}</span>
                  {item.exact && unreadCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-700 text-xs px-1.5 py-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Senkronize Et
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </PermissionGuard>
  );
}
