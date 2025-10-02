"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../hooks/use-admin-auth";
import { usePermissions } from "./admin-route-guard";
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
} from "lucide-react";
import { useState } from "react";

export default function AdminNavigation() {
  const pathname = usePathname();
  const { user, signOut, userRole } = useAdminAuth();
  const { hasPermission, hasRole, hasAnyRole } = usePermissions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role badge renkleri
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

  // Role display isimleri
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

  // Navigation items with permission checks
  const getAllNavigationItems = () => [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/admin/dashboard",
      show: true, // Dashboard herkese açık
    },
    {
      name: "Firma Yönetimi",
      href: "/admin/companies",
      icon: Building2,
      current: pathname.startsWith("/admin/companies"),
      show:
        hasPermission("companies.view") || hasPermission("canManageCompanies"),
    },
    {
      name: "Quote İstekleri",
      href: "/admin/quotes",
      icon: FileText,
      current: pathname === "/admin/quotes",
      show: hasPermission("quotes.view") || hasPermission("canViewAllQuotes"),
    },
    {
      name: "İletişim Mesajları",
      href: "/admin/contacts",
      icon: MessageSquare,
      current: pathname === "/admin/contacts",
      show:
        hasPermission("contacts.view") || hasPermission("canViewAllContacts"),
    },
    {
      name: "Blog Yönetimi",
      href: "/admin/blog",
      icon: Edit3,
      current: pathname.startsWith("/admin/blog"),
      show: hasPermission("blog.read") || hasPermission("canManageBlog"),
    },
    {
      name: "Kullanıcı Yönetimi",
      href: "/admin/users",
      icon: Users,
      current: pathname.startsWith("/admin/users"),
      show: hasPermission("users.view") || hasPermission("canManageUsers"),
    },
    {
      name: "Admin Yönetimi",
      href: "/admin/admins",
      icon: UserCheck,
      current: pathname.startsWith("/admin/admins"),
      show:
        hasPermission("users.manage_roles") || hasPermission("canManageAdmins"),
    },
    {
      name: "Yetki Yönetimi",
      href: "/admin/permissions",
      icon: Shield,
      current: pathname.startsWith("/admin/permissions"),
      show:
        hasPermission("users.manage_permissions") ||
        hasPermission("users.manage_roles") ||
        hasRole("super_admin"),
    },
    {
      name: "Sistem Logları",
      href: "/admin/logs",
      icon: Activity,
      current: pathname.startsWith("/admin/logs"),
      show: true, // Tüm admin kullanıcıları logları görebilir
    },
    {
      name: "Sistem Ayarları",
      href: "/admin/settings",
      icon: Settings,
      current: pathname.startsWith("/admin/settings"),
      show: hasPermission("canModifySettings"),
    },
  ];

  // Sadece gösterilmesi gereken navigation items
  const navigationItems = getAllNavigationItems().filter((item) => item.show);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 lg:overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 pb-4 border-b border-gray-200">
          <Link href="/admin/dashboard" className="flex items-center">
            <img
              className="h-8 w-auto"
              src="/MKN-GROUP-LOGO.png"
              alt="MKN Group"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">Admin</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 flex-1 px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-150`}
              >
                <Icon
                  className={`${
                    item.current
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Role Badge - Bottom */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                <span className="text-sm font-medium text-white">
                  {user?.displayName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "A"}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.displayName || user?.email || "Admin User"}
              </p>
              <div className="flex items-center mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    userRole
                  )}`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleDisplayName(userRole)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="flex-shrink-0 p-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-150 group"
          >
            <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile menu button */}
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="/MKN-GROUP-LOGO.png"
              alt="MKN Group"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">Admin</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 shadow-lg">
            <nav className="px-2 py-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${
                      item.current
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-150`}
                  >
                    <Icon
                      className={`${
                        item.current
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Info - Bottom */}
            <div className="px-3 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                      <span className="text-sm font-medium text-white">
                        {user?.displayName?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "A"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-700 truncate">
                      {user?.displayName || user?.email || "Admin User"}
                    </p>
                    <div className="flex items-center mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          userRole
                        )}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {getRoleDisplayName(userRole)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                  title="Çıkış Yap"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
