"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../hooks/use-admin-auth";
import { usePermissions } from "./admin-route-guard";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  MessageSquareText,
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
  ChevronRight,
  Folder,
  ShoppingCart,
  Wrench,
  BookOpen,
  Sparkles,
  FolderTree,
  StickyNote,
  DollarSign,
  Briefcase,
  Box,
  Plug,
  Database,
  Bug,
  Bell,
  Mail,
  Calendar as CalendarIcon,
  FileSignature,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminNavigation() {
  const pathname = usePathname();
  const { user, signOut, userRole } = useAdminAuth();
  const { hasPermission, hasRole, hasAnyRole } = usePermissions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Aktif menüyü otomatik olarak aç
  useEffect(() => {
    const menuStructure = getMenuStructure();
    const activeMenu = menuStructure.find((menu) => {
      if (menu.href) {
        return pathname.startsWith(menu.href);
      }
      if (menu.items) {
        return menu.items.some((item) => pathname.startsWith(item.href));
      }
      return false;
    });

    if (activeMenu && activeMenu.items) {
      // Sadece aktif menüyü aç, diğerlerini kapat
      setOpenMenus({ [activeMenu.id]: true });
    } else {
      // Hiçbir alt menü yoksa hepsini kapat
      setOpenMenus({});
    }
  }, [pathname]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-600 text-white";
      case "admin":
        return "bg-blue-600 text-white";
      case "moderator":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "super_admin":
        return "Süper Admin";
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderatör";
      default:
        return "Kullanıcı";
    }
  };

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => {
      // Eğer açılmak istenen menü zaten açıksa kapat
      if (prev[menuId]) {
        return { [menuId]: false };
      }
      // Değilse, sadece bu menüyü aç, diğerlerini kapat
      return { [menuId]: true };
    });
  };

  const isMenuActive = (items) => {
    return items.some((item) => pathname.startsWith(item.href));
  };

  const getMenuStructure = () => [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
      show: true,
    },
    {
      id: "blog",
      name: "Blog Yönetimi",
      icon: Edit3,
      show: hasPermission("blog.read"),
      items: [
        {
          name: "Tüm Blog Yazıları",
          href: "/admin/blog",
          icon: BookOpen,
          show: hasPermission("blog.read"),
        },
        {
          name: "Yeni Blog Oluştur",
          href: "/admin/blog/new",
          icon: FileText,
          show: hasPermission("blog.write"),
        },
        {
          name: "AI Blog Oluşturucu",
          href: "/admin/blog/ai-generator",
          icon: Sparkles,
          show: hasPermission("blog.read"),
        },
        {
          name: "Kategoriler",
          href: "/admin/blog/categories",
          icon: FolderTree,
          show: hasPermission("blog.read"),
        },
        {
          name: "Başlık Yönetimi",
          href: "/admin/blog/title-management",
          icon: StickyNote,
          show: hasPermission("blog.read"),
        },
      ],
    },
    {
      id: "social-media",
      name: "Sosyal Medya",
      icon: Share2,
      show: hasPermission("blog.read"),
      items: [
        {
          name: "Dashboard",
          href: "/admin/social-media",
          icon: LayoutDashboard,
          show: hasPermission("blog.read"),
        },
        {
          name: "Başlık Kütüphanesi",
          href: "/admin/social-media/title-library",
          icon: StickyNote,
          show: hasPermission("blog.read"),
        },
        {
          name: "İçerik Planlama",
          href: "/admin/social-media/calendar-view",
          icon: CalendarIcon,
          show: hasPermission("blog.read"),
        },
        {
          name: "İçerik Stüdyosu",
          href: "/admin/social-media/content-studio",
          icon: Sparkles,
          show: hasPermission("blog.read"),
        },
        {
          name: "İçerik Kütüphanesi",
          href: "/admin/social-media/content-list",
          icon: Database,
          show: hasPermission("blog.read"),
        },
      ],
    },
    {
      id: "customers",
      name: "Müşteri Yönetimi",
      icon: Building2,
      show:
        hasPermission("companies.view") ||
        hasPermission("contracts.view") ||
        hasPermission("quotes.view") ||
        hasPermission("contacts.view") ||
        hasPermission("requests.view"),
      items: [
        {
          name: "Firmalar",
          href: "/admin/companies",
          icon: Building2,
          show: hasPermission("companies.view"),
        },
        {
          name: "Contracts",
          href: "/admin/contracts",
          icon: FileSignature,
          show: hasPermission("contracts.view"),
        },
        {
          name: "Quote İstekleri",
          href: "/admin/quotes",
          icon: FileText,
          show: hasPermission("quotes.view"),
        },
        {
          name: "İletişim Mesajları",
          href: "/admin/contacts",
          icon: MessageSquare,
          show: hasPermission("contacts.view"),
        },
        {
          name: "Müşteri Talepleri",
          href: "/admin/requests",
          icon: MessageSquareText,
          show:
            hasPermission("requests.view") ||
            hasAnyRole(["admin", "super_admin"]),
        },
      ],
    },
    {
      id: "sales",
      name: "Satış & Fiyatlandırma",
      icon: DollarSign,
      show:
        hasPermission("proformas.view") || hasAnyRole(["admin", "super_admin"]),
      items: [
        {
          name: "Proformalar",
          href: "/admin/proformas",
          icon: FileText,
          show:
            hasPermission("proformas.view") ||
            hasAnyRole(["admin", "super_admin"]),
        },
        {
          name: "Fiyat Hesaplama",
          href: "/admin/pricing-calculator",
          icon: Calculator,
          show:
            hasPermission("proformas.view") ||
            hasAnyRole(["admin", "super_admin"]),
        },
        {
          name: "Hesaplama Geçmişi",
          href: "/admin/pricing-calculations",
          icon: Activity,
          show:
            hasPermission("proformas.view") ||
            hasAnyRole(["admin", "super_admin"]),
        },
        {
          name: "Formüller",
          href: "/admin/formulas",
          icon: FlaskConical,
          show:
            hasPermission("proformas.view") ||
            hasAnyRole(["admin", "super_admin"]),
        },
      ],
    },
    {
      id: "warehouse",
      name: "Depo Yönetimi",
      icon: Box,
      show:
        hasPermission("packaging.view") ||
        hasPermission("deliveries.view") ||
        hasAnyRole(["admin", "super_admin"]),
      items: [
        {
          name: "Ambalajlar",
          href: "/admin/packaging",
          icon: Package,
          show:
            hasPermission("packaging.view") ||
            hasAnyRole(["admin", "super_admin"]),
        },
        {
          name: "İrsaliyeler",
          href: "/admin/deliveries",
          icon: Truck,
          show:
            hasPermission("deliveries.view") ||
            hasAnyRole(["admin", "super_admin"]),
        },
      ],
    },
    {
      id: "integrations",
      name: "Entegrasyonlar",
      icon: Plug,
      show:
        hasPermission("integrations.view") ||
        hasAnyRole(["admin", "super_admin"]),
      items: [
        {
          name: "E-ticaret",
          href: "/admin/integrations",
          icon: ShoppingCart,
          show:
            hasPermission("integrations.view") ||
            hasAnyRole(["admin", "super_admin"]),
        },
      ],
    },
    {
      id: "users",
      name: "Kullanıcılar & Yetkiler",
      icon: Users,
      show:
        hasPermission("users.view") ||
        hasPermission("users.manage_roles") ||
        hasPermission("users.manage_permissions"),
      items: [
        {
          name: "Kullanıcılar",
          href: "/admin/users",
          icon: Users,
          show: hasPermission("users.view"),
        },
        {
          name: "Adminler",
          href: "/admin/admins",
          icon: UserCheck,
          show: hasPermission("users.manage_roles"),
        },
        {
          name: "Yetkiler",
          href: "/admin/permissions",
          icon: Shield,
          show:
            hasPermission("users.manage_permissions") ||
            hasPermission("users.manage_roles") ||
            hasRole("super_admin"),
        },
      ],
    },
    {
      id: "system",
      name: "Sistem",
      icon: Settings,
      show:
        hasPermission("system.logs") ||
        hasPermission("system.settings") ||
        hasRole("super_admin"),
      items: [
        {
          name: "Loglar",
          href: "/admin/logs",
          icon: Activity,
          show: hasPermission("system.logs"),
        },
        {
          name: "Ayarlar",
          href: "/admin/settings",
          icon: Wrench,
          show: hasPermission("system.settings"),
        },
        {
          name: "Debug",
          href: "/admin/debug",
          icon: Bug,
          show: hasRole("super_admin"),
        },
      ],
    },
  ];

  const menuStructure = getMenuStructure()
    .filter((menu) => menu.show)
    .map((menu) => {
      if (menu.items) {
        return {
          ...menu,
          items: menu.items.filter((item) => item.show),
        };
      }
      return menu;
    })
    .filter((menu) => !menu.items || menu.items.length > 0);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Sign out error handling
    }
  };

  return (
    <>
      <style jsx>{`
        /* Modern thin scrollbar for desktop navigation */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 100%);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c7d2fe 0%, #a5b4fc 100%);
        }

        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #c7d2fe transparent;
        }

        /* Mobile menu scrollbar */
        .mobile-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .mobile-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .mobile-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
          border-radius: 10px;
        }

        .mobile-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
        }

        .mobile-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 transparent;
        }
      `}</style>

      {/* Desktop Navigation */}
      <nav className="custom-scrollbar hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-gradient-to-b lg:from-white lg:to-gray-50 lg:pt-5 lg:pb-4 lg:overflow-y-auto">
        <div className="flex items-center justify-between flex-shrink-0 px-6 pb-4 mb-2 border-b border-gray-200">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 group"
          >
            <img
              className="h-6 w-auto transition-all duration-200 group-hover:scale-105"
              src="/MKN-GROUP-LOGO.png"
              alt="MKN Group"
            />
            <span className="text-xs font-bold text-gray-800">MKN - Panel</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative"
              title="Bildirimler"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative"
              title="Mesajlar"
            >
              <Mail className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-5 flex-1 px-3 space-y-1.5">
          {menuStructure.map((menu) => {
            const Icon = menu.icon;
            const isOpen = openMenus[menu.id];
            const isActive = menu.href
              ? pathname.startsWith(menu.href)
              : menu.items && isMenuActive(menu.items);

            // Single menu item (no submenu)
            if (!menu.items) {
              return (
                <Link
                  key={menu.id}
                  href={menu.href}
                  className={`${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                  } group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200`}
                >
                  <Icon
                    className={`${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    } flex-shrink-0 mr-3 h-5 w-5 transition-colors`}
                  />
                  <span>{menu.name}</span>
                </Link>
              );
            }

            // Menu with submenu
            return (
              <div key={menu.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`${
                    isActive
                      ? "bg-gray-100 text-gray-900 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  } group w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200`}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      } flex-shrink-0 mr-3 h-5 w-5 transition-colors`}
                    />
                    <span>{menu.name}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-all duration-300 ${
                      isOpen ? "rotate-0 text-blue-600" : "-rotate-90"
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-5 pl-4 border-l-2 border-blue-200 space-y-1 py-1.5">
                    {menu.items.map((item) => {
                      const SubIcon = item.icon;
                      const isSubActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`${
                            isSubActive
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          } group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200`}
                        >
                          <SubIcon
                            className={`${
                              isSubActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-gray-600"
                            } flex-shrink-0 mr-3 h-4 w-4 transition-colors`}
                          />
                          <span className="text-xs font-medium">
                            {item.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Info & Role Badge - Bottom */}
        <div className="flex-shrink-0 mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-blue-100">
                <span className="text-base font-semibold text-white">
                  {user?.displayName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "A"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.displayName || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "admin@mkngroup.com"}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm ${getRoleBadgeColor(
                userRole
              )}`}
            >
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {getRoleDisplayName(userRole)}
            </span>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile menu button */}
        <div className="flex items-center justify-between bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <img
              className="h-6 w-auto"
              src="/MKN-GROUP-LOGO.png"
              alt="MKN Group"
            />
            <span className="text-xs font-bold text-gray-800">Panel</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative"
              title="Bildirimler"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative"
              title="Mesajlar"
            >
              <Mail className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="mobile-scrollbar bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 shadow-xl max-h-[calc(100vh-64px)] overflow-y-auto">
            <nav className="px-3 py-4 space-y-1.5">
              {menuStructure.map((menu) => {
                const Icon = menu.icon;
                const isOpen = openMenus[menu.id];
                const isActive = menu.href
                  ? pathname.startsWith(menu.href)
                  : menu.items && isMenuActive(menu.items);

                // Single menu item (no submenu)
                if (!menu.items) {
                  return (
                    <Link
                      key={menu.id}
                      href={menu.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                      } group flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all duration-200`}
                    >
                      <Icon
                        className={`${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-600"
                        } flex-shrink-0 mr-3 h-6 w-6 transition-colors`}
                      />
                      {menu.name}
                    </Link>
                  );
                }

                // Menu with submenu
                return (
                  <div key={menu.id} className="space-y-1">
                    <button
                      onClick={() => toggleMenu(menu.id)}
                      className={`${
                        isActive
                          ? "bg-gray-100 text-gray-900 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      } group w-full flex items-center justify-between px-3 py-3 text-base font-medium rounded-xl transition-all duration-200`}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`${
                            isActive
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-gray-600"
                          } flex-shrink-0 mr-3 h-6 w-6 transition-colors`}
                        />
                        <span>{menu.name}</span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-all duration-300 ${
                          isOpen ? "rotate-0 text-blue-600" : "-rotate-90"
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="ml-5 pl-4 border-l-2 border-blue-200 space-y-1 py-1.5">
                        {menu.items.map((item) => {
                          const SubIcon = item.icon;
                          const isSubActive = pathname.startsWith(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`${
                                isSubActive
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              } group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}
                            >
                              <SubIcon
                                className={`${
                                  isSubActive
                                    ? "text-white"
                                    : "text-gray-400 group-hover:text-gray-600"
                                } flex-shrink-0 mr-3 h-5 w-5 transition-colors`}
                              />
                              <span className="font-medium">{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Mobile User Info - Bottom */}
            <div className="p-3 border-t border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
              <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-blue-100">
                      <span className="text-base font-semibold text-white">
                        {user?.displayName?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "A"}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate">
                      {user?.displayName || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {user?.email || "admin@mkngroup.com"}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Çıkış Yap"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <span
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm ${getRoleBadgeColor(
                      userRole
                    )}`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    {getRoleDisplayName(userRole)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
