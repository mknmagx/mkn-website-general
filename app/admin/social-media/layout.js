"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGuard } from "@/components/admin-route-guard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Sparkles,
  Archive,
  ChevronLeft,
  Settings,
  Smartphone,
  X,
  Instagram,
  Facebook,
} from "lucide-react";

// ============================================
// CONTEXT FOR PREVIEW PANEL
// ============================================
const PreviewContext = createContext({
  showPreview: false,
  setShowPreview: () => {},
  previewContent: null,
  setPreviewContent: () => {},
  previewPlatform: "instagram",
  setPreviewPlatform: () => {},
});

export const usePreview = () => useContext(PreviewContext);

// ============================================
// NAVIGATION ITEMS
// ============================================
const navigation = [
  {
    id: "dashboard",
    name: "Genel Bakış",
    href: "/admin/social-media",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    id: "titles",
    name: "Başlık Kütüphanesi",
    href: "/admin/social-media/title-library",
    icon: FileText,
  },
  {
    id: "calendar",
    name: "İçerik Takvimi",
    href: "/admin/social-media/calendar-view",
    icon: Calendar,
  },
  {
    id: "studio",
    name: "İçerik Stüdyosu",
    href: "/admin/social-media/content-studio",
    icon: Sparkles,
  },
  {
    id: "archive",
    name: "İçerik Arşivi",
    href: "/admin/social-media/content-list",
    icon: Archive,
  },
];

// ============================================
// MOBILE PREVIEW COMPONENT
// ============================================
function MobilePreview({ content, platform, onClose }) {
  const platformStyles = {
    instagram: {
      gradient: "from-purple-500 via-pink-500 to-orange-400",
      icon: Instagram,
      name: "Instagram",
    },
    facebook: {
      gradient: "from-blue-600 to-blue-500",
      icon: Facebook,
      name: "Facebook",
    },
  };

  const currentPlatform = platformStyles[platform] || platformStyles.instagram;
  const PlatformIcon = currentPlatform.icon;

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center",
            currentPlatform.gradient
          )}>
            <PlatformIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">{currentPlatform.name} Önizleme</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Phone Frame */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[2.5rem] p-2 shadow-xl">
          {/* Phone notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
          
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
            {/* Status bar */}
            <div className="h-8 bg-white flex items-center justify-between px-5 pt-1">
              <span className="text-[10px] font-semibold text-slate-900">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-slate-900 rounded-sm" />
              </div>
            </div>

            {/* Content Area */}
            <div className="h-[calc(100%-2rem)] overflow-y-auto">
              {content ? (
                <div className="p-3">
                  {/* Post Preview */}
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300" />
                      <div>
                        <p className="text-[11px] font-semibold text-slate-900">mkngroup</p>
                        <p className="text-[9px] text-slate-500">Şimdi</p>
                      </div>
                    </div>
                    
                    {/* Image placeholder */}
                    {content.image ? (
                      <img 
                        src={content.image} 
                        alt="Preview" 
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Caption */}
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-900 leading-relaxed">
                        <span className="font-semibold">mkngroup</span>{" "}
                        {content.caption || "İçerik metni burada görünecek..."}
                      </p>
                      {content.hashtags && (
                        <p className="text-[10px] text-blue-600">
                          {content.hashtags}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-2 p-6">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500">
                      İçerik oluşturduğunuzda<br />önizleme burada görünecek
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Switcher */}
      <div className="px-4 py-3 bg-white border-t border-slate-100">
        <div className="flex items-center justify-center gap-2">
          {Object.entries(platformStyles).map(([key, value]) => {
            const Icon = value.icon;
            return (
              <button
                key={key}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  platform === key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {value.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================
function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-slate-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">Sosyal Medya</span>
          </div>
        )}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className={cn(
                  "h-8 w-8 text-slate-400 hover:text-slate-600",
                  collapsed && "mx-auto"
                )}
              >
                <ChevronLeft className={cn(
                  "w-4 h-4 transition-transform",
                  collapsed && "rotate-180"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navigation.map((item) => {
            const active = isActive(item);
            const NavItem = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    active ? "text-violet-600" : "text-slate-400"
                  )}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              );
            }

            return NavItem;
          })}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-100 space-y-1">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/admin/social-media/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all",
                  collapsed && "justify-center px-0"
                )}
              >
                <Settings className="w-5 h-5 text-slate-400" />
                {!collapsed && <span>Ayarlar</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Ayarlar</TooltipContent>}
          </Tooltip>
        </TooltipProvider>

        {!collapsed && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Admin Panel</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

// ============================================
// MAIN LAYOUT
// ============================================
export default function SocialMediaLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewPlatform, setPreviewPlatform] = useState("instagram");

  useEffect(() => {
    const saved = localStorage.getItem("sm-sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sm-sidebar-collapsed", JSON.stringify(newState));
  };

  return (
    <PermissionGuard requiredPermission="blog.read">
      <PreviewContext.Provider
        value={{
          showPreview,
          setShowPreview,
          previewContent,
          setPreviewContent,
          previewPlatform,
          setPreviewPlatform,
        }}
      >
        <div className="flex h-[calc(100vh-64px)] bg-slate-50/50">
          {/* Sidebar */}
          <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* Preview Panel */}
          {showPreview && (
            <aside className="w-[340px] border-l border-slate-200 bg-white p-4 hidden xl:block">
              <MobilePreview
                content={previewContent}
                platform={previewPlatform}
                onClose={() => setShowPreview(false)}
              />
            </aside>
          )}
        </div>
      </PreviewContext.Provider>
    </PermissionGuard>
  );
}
