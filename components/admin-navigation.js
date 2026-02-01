"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../hooks/use-admin-auth";
import { usePermissions } from "./admin-route-guard";
import { useNavigationSettings } from "../hooks/use-navigation-settings";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  UserCheck,
  Activity,
  Edit3,
  Package,
  Truck,
  Share2,
  Calculator,
  FlaskConical,
  ChevronDown,
  BookOpen,
  Sparkles,
  FolderTree,
  StickyNote,
  DollarSign,
  Briefcase,
  Box,
  Plug,
  Bug,
  Bell,
  Mail,
  Calendar as CalendarIcon,
  FileSignature,
  Brain,
  Bot,
  Pin,
  PinOff,
  GripVertical,
  PanelLeftClose,
  PanelLeft,
  ShoppingCart,
  Wrench,
  Database,
  Star,
  PiggyBank,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  HandCoins,
  BarChart3,
  List,
} from "lucide-react";
import { useState, useMemo, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// ============================================
// ANIMATION VARIANTS
// ============================================
const sidebarVariants = {
  expanded: { width: 320, transition: { duration: 0.25, ease: "easeInOut" } },
  collapsed: { width: 72, transition: { duration: 0.25, ease: "easeInOut" } },
};

// ============================================
// COLLAPSIBLE SUBMENU COMPONENT (CSS Grid based - no layout shift)
// ============================================
const CollapsibleSubmenu = memo(function CollapsibleSubmenu({ isOpen, children }) {
  return (
    <div 
      className="grid transition-[grid-template-rows] duration-200 ease-out"
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden min-h-0">
        {children}
      </div>
    </div>
  );
});

// ============================================
// SUBMENU ITEM COMPONENT (Memoized)
// ============================================
const SubmenuItem = memo(function SubmenuItem({
  item,
  isActive,
  isPinned,
  onNavigate,
  onTogglePin,
}) {
  const SubIcon = item.icon;
  return (
    <div className="group/subitem relative">
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${
          isActive
            ? "bg-gray-900 text-white font-medium shadow-sm"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        <SubIcon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
        <span className="truncate">{item.name}</span>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTogglePin(item.id);
        }}
        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/subitem:opacity-100 transition-all ${
          isPinned ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        }`}
      >
        {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
      </button>
    </div>
  );
});

// ============================================
// MENU WITH ITEMS COMPONENT (Memoized - Main accordion component)
// ============================================
const MenuWithItemsComponent = memo(function MenuWithItemsComponent({
  menu,
  isExpanded,
  hasActiveChild,
  isCollapsed,
  isMobile,
  pathname,
  onToggleExpanded,
  onTogglePin,
  isMenuPinned,
  onNavigate,
  isItemActive,
}) {
  const Icon = menu.icon;
  const shouldShowExpanded = isExpanded || hasActiveChild;

  // Stable toggle handler
  const handleToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleExpanded(menu.id);
  }, [menu.id, onToggleExpanded]);

  if (isCollapsed && !isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <button
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  hasActiveChild
                    ? "text-gray-900 bg-gray-50"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {hasActiveChild && (
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-gray-900 rounded-full" />
                )}
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            align="start" 
            className="p-0 w-52 bg-white border border-gray-200 shadow-lg rounded-xl" 
            sideOffset={8}
          >
            <div className="py-2">
              <div className="px-3 py-2 border-b border-gray-100">
                <span className="font-semibold text-sm text-gray-900">{menu.name}</span>
              </div>
              {menu.items.map((item) => {
                const SubIcon = item.icon;
                const isSubActive = isItemActive(item.href, menu.items);
                const isSubPinned = isMenuPinned(item.id);
                return (
                  <div key={item.id} className="group/item flex items-center">
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        isSubActive
                          ? "bg-gray-900 text-white mx-2 my-0.5 rounded-lg"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <SubIcon className={`h-4 w-4 ${isSubActive ? "text-white" : "text-gray-400"}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                    {!isSubActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(item.id);
                        }}
                        className={`mr-2 p-1 rounded opacity-0 group-hover/item:opacity-100 transition-opacity ${
                          isSubPinned ? "text-amber-500" : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {isSubPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleToggle}
        className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          shouldShowExpanded 
            ? "bg-gray-50 text-gray-900" 
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${shouldShowExpanded ? "text-gray-600" : "text-gray-400"}`} />
          <span className="truncate">{menu.name}</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${shouldShowExpanded ? "rotate-180" : ""}`} 
        />
        {hasActiveChild && !shouldShowExpanded && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-900 rounded-full" />
        )}
      </button>

      <CollapsibleSubmenu isOpen={shouldShowExpanded}>
        <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-0.5 py-1">
          {menu.items.map((item) => {
            const isSubActive = isItemActive(item.href, menu.items);
            const isSubPinned = isMenuPinned(item.id);
            return (
              <SubmenuItem
                key={item.id}
                item={item}
                isActive={isSubActive}
                isPinned={isSubPinned}
                onNavigate={onNavigate}
                onTogglePin={onTogglePin}
              />
            );
          })}
        </div>
      </CollapsibleSubmenu>
    </div>
  );
});

// ============================================
// SORTABLE PINNED ITEM (for drag & drop)
// ============================================
const SortablePinnedItem = memo(function SortablePinnedItem({ 
  item, 
  isCollapsed, 
  pathname, 
  onUnpin,
  onNavigate 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = item.icon;
  // Exact match veya bu path ile başlayıp / ile devam eden yollar
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div ref={setNodeRef} style={style} className="w-full flex justify-center">
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  isDragging ? "opacity-50 scale-105" : ""
                } ${
                  isActive
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span className="font-medium">{item.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnpin(item.id);
              }}
              className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"
            >
              <PinOff className="h-3 w-3" />
            </button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-gray-900 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
        <span className="truncate text-[13px]">{item.name}</span>
      </Link>
      <button
        onClick={() => onUnpin(item.id)}
        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
        title="Favorilerden Kaldır"
      >
        <PinOff className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminNavigation() {
  const pathname = usePathname();
  const { user, signOut, userRole } = useAdminAuth();
  const { hasPermission, hasRole, hasAnyRole } = usePermissions();
  const {
    isCollapsed,
    pinnedMenus,
    toggleCollapsed,
    toggleMenuExpanded,
    togglePin,
    unpinMenu,
    reorderPinnedMenus,
    isMenuPinned,
    expandedMenus,
  } = useNavigationSettings();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll pozisyonunu korumak için ref
  const navScrollRef = useRef(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ============================================
  // MENU STRUCTURE
  // ============================================
  const getMenuStructure = useCallback(() => [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
      show: true,
    },
    {
      id: "communication-center",
      name: "İletişim Merkezi",
      icon: MessageSquare,
      show: hasAnyRole(["admin", "super_admin"]) || hasPermission("contacts.view") || hasPermission("quotes.view") || hasPermission("outlook.view"),
      items: [
        { id: "crm-v2", name: "CRM v2", href: "/admin/crm-v2", icon: Briefcase, show: hasAnyRole(["admin", "super_admin"]) },
        { id: "site-messages", name: "Site Mesajları", href: "/admin/contacts", icon: Mail, show: hasPermission("contacts.view") },
        { id: "quote-requests", name: "Teklif Talepleri", href: "/admin/quotes", icon: FileText, show: hasPermission("quotes.view") },
        { id: "outlook-email", name: "Outlook E-posta", href: "/admin/outlook", icon: Mail, show: hasPermission("outlook.view") },
        { id: "meta-messages", name: "Meta Mesajlar", href: "/admin/meta-messenger", icon: MessageSquare, show: hasPermission("integrations.view") || hasAnyRole(["admin", "super_admin"]) },
      ],
    },
    {
      id: "companies-contracts",
      name: "Firmalar & Sözleşmeler",
      icon: Building2,
      show: hasPermission("companies.view") || hasPermission("contracts.view"),
      items: [
        { id: "companies", name: "Firmalar", href: "/admin/companies", icon: Building2, show: hasPermission("companies.view") },
        { id: "contracts", name: "Sözleşmeler", href: "/admin/contracts", icon: FileSignature, show: hasPermission("contracts.view") },
      ],
    },
    {
      id: "sales",
      name: "Satış",
      icon: DollarSign,
      show: hasPermission("proformas.view") || hasAnyRole(["admin", "super_admin"]),
      items: [
        { id: "proformas", name: "Proformalar", href: "/admin/proformas", icon: FileText, show: hasPermission("proformas.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "pricing-calc", name: "Fiyat Hesapla", href: "/admin/pricing-calculator", icon: Calculator, show: hasPermission("proformas.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "pricing-list", name: "Hesaplamalar", href: "/admin/pricing-calculations", icon: Activity, show: hasPermission("proformas.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "formulas", name: "Formüller", href: "/admin/formulas", icon: FlaskConical, show: hasPermission("proformas.view") || hasAnyRole(["admin", "super_admin"]) },
      ],
    },
    {
      id: "finance",
      name: "Finans",
      icon: PiggyBank,
      show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]),
      items: [
        { id: "finance-dashboard", name: "Özet", href: "/admin/finance", icon: LayoutDashboard, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-accounts", name: "Hesaplar", href: "/admin/finance/accounts", icon: Wallet, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-transactions", name: "Tüm İşlemler", href: "/admin/finance/transactions", icon: List, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-income", name: "Gelirler", href: "/admin/finance/income", icon: TrendingUp, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-expenses", name: "Giderler", href: "/admin/finance/expenses", icon: TrendingDown, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-receivables", name: "Alacaklar", href: "/admin/finance/receivables", icon: TrendingUp, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-payables", name: "Borçlar", href: "/admin/finance/payables", icon: TrendingDown, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-personnel", name: "Personel", href: "/admin/finance/personnel", icon: Users, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-salaries", name: "Maaşlar", href: "/admin/finance/salaries", icon: HandCoins, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-advances", name: "Avanslar", href: "/admin/finance/advances", icon: CreditCard, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "finance-reports", name: "Raporlar", href: "/admin/finance/reports", icon: BarChart3, show: hasPermission("finance.view") || hasAnyRole(["admin", "super_admin"]) },
      ],
    },
    {
      id: "warehouse",
      name: "Depo & Envanter",
      icon: Box,
      show: hasPermission("packaging.view") || hasPermission("deliveries.view") || hasAnyRole(["admin", "super_admin"]),
      items: [
        { id: "inventory-dashboard", name: "Envanter", href: "/admin/inventory", icon: Database, show: hasAnyRole(["admin", "super_admin"]) },
        { id: "inventory-items", name: "Ürünler", href: "/admin/inventory/items", icon: Package, show: hasAnyRole(["admin", "super_admin"]) },
        { id: "inventory-transactions", name: "Stok Hareketleri", href: "/admin/inventory/transactions", icon: Activity, show: hasAnyRole(["admin", "super_admin"]) },
        { id: "inventory-warehouses", name: "Depolar", href: "/admin/inventory/warehouses", icon: Box, show: hasAnyRole(["admin", "super_admin"]) },
        { id: "inventory-suppliers", name: "Tedarikçiler", href: "/admin/inventory/suppliers", icon: Truck, show: hasAnyRole(["admin", "super_admin"]) },
        { id: "packaging", name: "Ambalajlar (Eski)", href: "/admin/packaging", icon: Package, show: hasPermission("packaging.view") || hasAnyRole(["admin", "super_admin"]) },
        { id: "deliveries", name: "İrsaliyeler", href: "/admin/deliveries", icon: Truck, show: hasPermission("deliveries.view") || hasAnyRole(["admin", "super_admin"]) },
      ],
    },
    {
      id: "content-management",
      name: "İçerik Yönetimi",
      icon: Edit3,
      show: hasPermission("blog.read"),
      items: [
        { id: "blog-list", name: "Blog Yazıları", href: "/admin/blog", icon: BookOpen, show: hasPermission("blog.read") },
        { id: "blog-new", name: "Blog Yeni Yazı", href: "/admin/blog/new", icon: FileText, show: hasPermission("blog.write") },
        { id: "blog-ai", name: "Blog AI Oluşturucu", href: "/admin/blog/ai-generator", icon: Sparkles, show: hasPermission("blog.read") },
        { id: "blog-categories", name: "Blog Kategorileri", href: "/admin/blog/categories", icon: FolderTree, show: hasPermission("blog.read") },
        { id: "blog-titles", name: "Blog Başlıkları", href: "/admin/blog/title-management", icon: StickyNote, show: hasPermission("blog.read") },
        { id: "sm-dashboard", name: "SM Genel Bakış", href: "/admin/social-media", icon: Share2, show: hasPermission("blog.read") },
        { id: "sm-titles", name: "SM Başlık Kütüphanesi", href: "/admin/social-media/title-library", icon: StickyNote, show: hasPermission("blog.read") },
        { id: "sm-calendar", name: "SM İçerik Takvimi", href: "/admin/social-media/calendar-view", icon: CalendarIcon, show: hasPermission("blog.read") },
        { id: "sm-studio", name: "SM İçerik Stüdyosu", href: "/admin/social-media/content-studio", icon: Sparkles, show: hasPermission("blog.read") },
        { id: "sm-library", name: "SM İçerik Arşivi", href: "/admin/social-media/content-list", icon: Database, show: hasPermission("blog.read") },
      ],
    },
    {
      id: "ai",
      name: "AI Asistanlar",
      icon: Brain,
      show: hasPermission("gemini.read") || hasPermission("claude.read") || hasPermission("chatgpt.read") || hasAnyRole(["admin", "super_admin"]),
      items: [
        { id: "ai-chatgpt", name: "ChatGPT", href: "/admin/ai/chatgpt", icon: Bot, show: hasPermission("chatgpt.read") || hasAnyRole(["admin", "super_admin"]) },
        { id: "ai-gemini", name: "Gemini", href: "/admin/ai/gemini", icon: Sparkles, show: hasPermission("gemini.read") || hasAnyRole(["admin", "super_admin"]) },
        { id: "ai-claude", name: "Claude", href: "/admin/ai/claude", icon: Bot, show: hasPermission("claude.read") || hasAnyRole(["admin", "super_admin"]) },
      ],
    },
    {
      id: "integrations",
      name: "Entegrasyonlar",
      icon: Plug,
      show: hasPermission("integrations.view") || hasAnyRole(["admin", "super_admin"]),
      items: [
        { id: "ecommerce", name: "E-ticaret", href: "/admin/integrations", icon: ShoppingCart, show: hasPermission("integrations.view") || hasAnyRole(["admin", "super_admin"]) },
      ],
    },
    {
      id: "users",
      name: "Kullanıcılar",
      icon: Users,
      show: hasPermission("users.view") || hasPermission("users.manage_roles") || hasPermission("users.manage_permissions"),
      items: [
        { id: "users-list", name: "Kullanıcılar", href: "/admin/users", icon: Users, show: hasPermission("users.view") },
        { id: "admins", name: "Adminler", href: "/admin/admins", icon: UserCheck, show: hasPermission("users.manage_roles") },
        { id: "permissions", name: "Yetkiler", href: "/admin/permissions", icon: Shield, show: hasPermission("users.manage_permissions") || hasPermission("users.manage_roles") || hasRole("super_admin") },
      ],
    },
    {
      id: "system",
      name: "Sistem",
      icon: Settings,
      show: hasPermission("system.logs") || hasPermission("system.settings") || hasRole("super_admin"),
      items: [
        { id: "ai-settings", name: "AI Ayarları", href: "/admin/settings/ai", icon: Bot, show: hasRole("super_admin") || hasPermission("system.settings") },
        { id: "logs", name: "Loglar", href: "/admin/logs", icon: Activity, show: hasPermission("system.logs") },
        { id: "general-settings", name: "Genel Ayarlar", href: "/admin/settings/general", icon: Wrench, show: hasPermission("system.settings") },
        { id: "debug", name: "Debug", href: "/admin/debug", icon: Bug, show: hasRole("super_admin") },
      ],
    },
  ], [hasPermission, hasRole, hasAnyRole]);

  // Filtered menu structure
  const menuStructure = useMemo(() => {
    return getMenuStructure()
      .filter((menu) => menu.show)
      .map((menu) =>
        menu.items ? { ...menu, items: menu.items.filter((item) => item.show) } : menu
      )
      .filter((menu) => !menu.items || menu.items.length > 0);
  }, [getMenuStructure]);

  // Create a flat map of all menu items (including sub-items) for pinning
  const allMenuItemsMap = useMemo(() => {
    const map = new Map();
    menuStructure.forEach((menu) => {
      if (menu.href) {
        map.set(menu.id, { ...menu, parentId: null });
      }
      if (menu.items) {
        menu.items.forEach((item) => {
          map.set(item.id, { ...item, parentId: menu.id, parentName: menu.name });
        });
      }
    });
    return map;
  }, [menuStructure]);

  // Pinned items resolved from IDs
  const pinnedItems = useMemo(() => {
    return pinnedMenus
      .map((id) => allMenuItemsMap.get(id))
      .filter(Boolean);
  }, [pinnedMenus, allMenuItemsMap]);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pinnedMenus.indexOf(active.id);
      const newIndex = pinnedMenus.indexOf(over.id);
      reorderPinnedMenus(arrayMove(pinnedMenus, oldIndex, newIndex));
    }
  }, [pinnedMenus, reorderPinnedMenus]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [signOut]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getRoleBadgeStyle = useCallback((role) => {
    const styles = {
      super_admin: "bg-violet-100 text-violet-700 border-violet-200",
      admin: "bg-blue-100 text-blue-700 border-blue-200",
      moderator: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return styles[role] || "bg-gray-100 text-gray-700 border-gray-200";
  }, []);

  const getRoleDisplayName = useCallback((role) => {
    const names = {
      super_admin: "Süper Admin",
      admin: "Admin",
      moderator: "Moderatör",
    };
    return names[role] || "Kullanıcı";
  }, []);

  // Aktif sayfa kontrolü - alt menü itemları için daha akıllı kontrol (STABLE)
  const isItemActive = useCallback((href, parentItems = null) => {
    // Eğer parent items varsa (bu bir alt menü item'ı), 
    // diğer kardeş itemlarla karşılaştır
    if (parentItems) {
      // Tam eşleşme kontrolü
      if (pathname === href) return true;
      
      // Bu item'ın href'i ile başlayan ama başka bir kardeş item'ın href'i ile başlamayan
      if (pathname.startsWith(href)) {
        // Başka bir kardeş daha spesifik mi?
        const moreSpecificSibling = parentItems.find(
          sibling => sibling.href !== href && 
                     pathname.startsWith(sibling.href) && 
                     sibling.href.length > href.length
        );
        return !moreSpecificSibling;
      }
      return false;
    }
    
    // Tek menü item'ı için (alt menüsü olmayan)
    return pathname === href || pathname.startsWith(href + "/");
  }, [pathname]);

  // ============================================
  // SUB-COMPONENTS
  // ============================================
  
  // Single Menu Item (no sub-items)
  const SingleMenuItem = memo(function SingleMenuItem({ menu, isMobile = false }) {
    const Icon = menu.icon;
    const isActive = isItemActive(menu.href);
    const isPinned = isMenuPinned(menu.id);

    if (isCollapsed && !isMobile) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Link
                  href={menu.href}
                  onClick={isMobile ? closeMobileMenu : undefined}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              <span className="font-medium">{menu.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(menu.id);
                }}
                className={`p-1 rounded ${isPinned ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`}
              >
                {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              </button>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="group relative">
        <Link
          href={menu.href}
          onClick={isMobile ? closeMobileMenu : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive
              ? "bg-gray-900 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
          <span className="truncate">{menu.name}</span>
        </Link>
        <button
          onClick={() => togglePin(menu.id)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
            isPinned ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
        >
          {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
      </div>
    );
  });

  // User Card
  const UserCard = ({ compact = false }) => {
    // Collapsed modda minimal görünüm
    if (isCollapsed) {
      return (
        <div className="flex flex-col items-center gap-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-semibold text-white">
                      {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="p-3">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{user?.displayName || "Admin User"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "admin@mkngroup.com"}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${getRoleBadgeStyle(userRole)}`}>
                    <Shield className="w-2.5 h-2.5" />
                    {getRoleDisplayName(userRole)}
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Çıkış Yap</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }

    // Normal (expanded) görünüm
    return (
      <div className={`bg-white rounded-xl border border-gray-200 ${compact ? "p-3" : "p-4"} transition-all`}>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className={`${compact ? "h-9 w-9" : "h-10 w-10"} rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg`}>
              <span className={`${compact ? "text-xs" : "text-sm"} font-semibold text-white`}>
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.displayName || "Admin User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "admin@mkngroup.com"}
            </p>
          </div>
          {!compact && (
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeStyle(userRole)}`}>
            <Shield className="w-3 h-3" />
            {getRoleDisplayName(userRole)}
          </span>
          {compact && (
            <button
              onClick={handleSignOut}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:bg-gray-50/95 lg:backdrop-blur-xl lg:border-r lg:border-gray-200 overflow-hidden z-40"
      >
        {/* Header */}
        <div className={`h-16 flex items-center border-b border-gray-200/80 bg-white flex-shrink-0 ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          {isCollapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCollapsed}
                    className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <PanelLeft className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Menüyü Genişlet</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <Link href="/admin/dashboard" className="flex items-center gap-3 min-w-0 group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-gray-900 leading-tight">MKN Group</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Admin Panel</span>
                </div>
              </Link>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all relative">
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>
                <button
                  onClick={toggleCollapsed}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                  title="Daralt"
                >
                  <PanelLeftClose className="h-[18px] w-[18px]" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav 
          ref={navScrollRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-contain ${isCollapsed ? "px-1.5" : "px-3"} py-4`}
        >
          {/* Pinned Section */}
          {pinnedItems.length > 0 && (
            <div className="mb-4">
              {!isCollapsed && (
                <div className="px-2 mb-2 flex items-center gap-2">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Favoriler
                  </span>
                </div>
              )}
              {isCollapsed && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center mb-2">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Favoriler</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={pinnedMenus} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {pinnedItems.map((item) => (
                      <SortablePinnedItem
                        key={item.id}
                        item={item}
                        isCollapsed={isCollapsed}
                        pathname={pathname}
                        onUnpin={unpinMenu}
                        onNavigate={() => {}}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {!isCollapsed && <div className="mt-3 mx-3 border-b border-gray-200" />}
              {isCollapsed && <div className="mt-2 w-6 mx-auto border-b border-gray-300" />}
            </div>
          )}

          {/* Main Menu */}
          {!isCollapsed && pinnedItems.length > 0 && (
            <div className="px-2 mb-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Menü
              </span>
            </div>
          )}
          <div className="space-y-1">
            {menuStructure.map((menu) => (
              menu.items ? (
                <MenuWithItemsComponent
                  key={menu.id}
                  menu={menu}
                  isExpanded={expandedMenus[menu.id] || false}
                  hasActiveChild={menu.items.some((item) => isItemActive(item.href, menu.items))}
                  isCollapsed={isCollapsed}
                  isMobile={false}
                  pathname={pathname}
                  onToggleExpanded={toggleMenuExpanded}
                  onTogglePin={togglePin}
                  isMenuPinned={isMenuPinned}
                  onNavigate={undefined}
                  isItemActive={isItemActive}
                />
              ) : (
                <SingleMenuItem key={menu.id} menu={menu} />
              )
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className={`${isCollapsed ? "px-2 py-3" : "p-3"} border-t border-gray-200 bg-white/90 backdrop-blur-sm flex-shrink-0 ${isCollapsed ? "flex justify-center" : ""}`}>
          <UserCard />
        </div>
      </motion.aside>

      {/* Mobile Header & Menu */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 z-50">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900 leading-tight">MKN Group</span>
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Admin</span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all relative">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={closeMobileMenu}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-14 right-0 bottom-0 w-80 bg-white/98 backdrop-blur-xl border-l border-gray-200 z-50 shadow-2xl flex flex-col"
              >
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                  {/* Mobile Pinned */}
                  {pinnedItems.length > 0 && (
                    <div className="mb-4">
                      <div className="px-2 mb-2 flex items-center gap-2">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Favoriler
                        </span>
                      </div>
                      <div className="space-y-1">
                        {pinnedItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname.startsWith(item.href);
                          return (
                            <div key={item.id} className="group flex items-center gap-1">
                              <Link
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  isActive
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                                <span className="truncate">{item.name}</span>
                              </Link>
                              <button
                                onClick={() => unpinMenu(item.id)}
                                className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <PinOff className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 mx-3 border-b border-gray-200" />
                    </div>
                  )}

                  {/* Mobile Main Menu */}
                  {menuStructure.map((menu) => (
                    menu.items ? (
                      <MenuWithItemsComponent
                        key={menu.id}
                        menu={menu}
                        isExpanded={expandedMenus[menu.id] || false}
                        hasActiveChild={menu.items.some((item) => isItemActive(item.href, menu.items))}
                        isCollapsed={false}
                        isMobile={true}
                        pathname={pathname}
                        onToggleExpanded={toggleMenuExpanded}
                        onTogglePin={togglePin}
                        isMenuPinned={isMenuPinned}
                        onNavigate={closeMobileMenu}
                        isItemActive={isItemActive}
                      />
                    ) : (
                      <SingleMenuItem key={menu.id} menu={menu} isMobile />
                    )
                  ))}
                </nav>
                <div className="p-3 border-t border-gray-200 bg-white/90">
                  <UserCard compact />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer for main content */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? "w-[72px]" : "w-80"}`} />
    </>
  );
}
