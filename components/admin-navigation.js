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
} from "lucide-react";
import { useState } from "react";

export default function AdminNavigation() {
  const pathname = usePathname();
  const { user, signOut, userRole } = useAdminAuth();
  const { hasPermission, hasRole, hasAnyRole } = usePermissions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

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
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
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
          name: "Tüm Gönderiler",
          href: "/admin/social-media",
          icon: Share2,
          show: hasPermission("blog.read"),
        },
        {
          name: "Yeni Gönderi Oluştur",
          href: "/admin/social-media/create",
          icon: FileText,
          show: hasPermission("blog.read"),
        },
        {
          name: "Şablonlar",
          href: "/admin/social-media/social-media-templates",
          icon: Folder,
          show: hasPermission("blog.read"),
        },
        {
          name: "Başlık Kütüphanesi",
          href: "/admin/social-media/title-library",
          icon: StickyNote,
          show: hasPermission("blog.read"),
        },
        {
          name: "Ayarlar",
          href: "/admin/social-media/settings",
          icon: Settings,
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
          background: linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9ca3af 0%, #6b7280 100%);
        }

        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #9ca3af transparent;
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
      <nav className="custom-scrollbar hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 lg:overflow-y-auto">
        <div className="flex items-center justify-between flex-shrink-0 px-6 pb-3 mb-1 border-b border-gray-200">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 group"
          >
            <img
              className="h-6 w-auto transition-opacity duration-200 group-hover:opacity-80"
              src="/MKN-GROUP-LOGO.png"
              alt="MKN Group"
            />
            <span className="text-xs font-semibold text-gray-700">
              MKN - Panel
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
              title="Bildirimler"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
              title="Mesajlar"
            >
              <Mail className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 flex-1 px-2 space-y-1">
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
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200`}
                >
                  <Icon
                    className={`${
                      isActive ? "text-blue-600" : "text-gray-400"
                    } flex-shrink-0 mr-3 h-5 w-5`}
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
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  } group w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200`}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`${
                        isActive ? "text-gray-700" : "text-gray-400"
                      } flex-shrink-0 mr-3 h-5 w-5`}
                    />
                    <span>{menu.name}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1 py-1">
                    {menu.items.map((item) => {
                      const SubIcon = item.icon;
                      const isSubActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`${
                            isSubActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          } group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200`}
                        >
                          <SubIcon
                            className={`${
                              isSubActive ? "text-blue-600" : "text-gray-400"
                            } flex-shrink-0 mr-3 h-4 w-4`}
                          />
                          <span className="text-xs">{item.name}</span>
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
        <div className="flex-shrink-0 mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-base font-semibold text-white">
                  {user?.displayName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "A"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.displayName || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "admin@mkngroup.com"}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm ${getRoleBadgeColor(
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
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2.5 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <img
              className="h-6 w-auto"
              src="/MKN-GROUP-LOGO.png"
              alt="MKN Group"
            />
            <span className="text-xs font-semibold text-gray-700">Panel</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
              title="Bildirimler"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
              title="Mesajlar"
            >
              <Mail className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
          <div className="mobile-scrollbar bg-white border-b border-gray-200 shadow-lg max-h-[calc(100vh-64px)] overflow-y-auto">
            <nav className="px-2 py-3 space-y-1">
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
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      } group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all duration-200`}
                    >
                      <Icon
                        className={`${
                          isActive ? "text-blue-600" : "text-gray-400"
                        } flex-shrink-0 mr-3 h-6 w-6`}
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
                          ? "bg-gray-50 text-gray-900"
                          : "text-gray-700 hover:bg-gray-50"
                      } group w-full flex items-center justify-between px-3 py-3 text-base font-medium rounded-lg transition-all duration-200`}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`${
                            isActive ? "text-gray-700" : "text-gray-400"
                          } flex-shrink-0 mr-3 h-6 w-6`}
                        />
                        <span>{menu.name}</span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                          isOpen ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1 py-1">
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
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              } group flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200`}
                            >
                              <SubIcon
                                className={`${
                                  isSubActive
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                } flex-shrink-0 mr-3 h-5 w-5`}
                              />
                              <span>{item.name}</span>
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
            <div className="p-3 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md ring-2 ring-blue-100">
                      <span className="text-base font-semibold text-white">
                        {user?.displayName?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "A"}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
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
                <div className="mt-3 pt-3 border-t border-gray-100">
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
