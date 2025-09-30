"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "../hooks/use-admin-auth";
import { adminSignOut } from "../lib/services/admin-auth-service";
import {
  Shield,
  LogOut,
  Menu,
  Home,
  MessageSquare,
  FileText,
  Settings,
  Users,
  Building2,
  BarChart3,
  Bell,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AdminProtectedWrapper({
  children,
  title = "Admin Panel",
}) {
  const { user, isAdmin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log("useEffect triggered:", { loading, isAdmin, pathname });

    // Loading bitince ve admin değilse, login sayfasına değilse yönlendir
    if (!loading && !isAdmin && !pathname?.includes("/admin/login")) {
      console.log("Redirecting to login page");
      router.push("/admin/login");
    }
  }, [isAdmin, loading, router, pathname]);

  const handleSignOut = async () => {
    await adminSignOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">
              Admin Panel Yükleniyor...
            </h2>
            <p className="text-sm text-gray-500">
              Kimlik doğrulaması kontrol ediliyor
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Kullanıcı rol seviyesini kontrol et
  const getRoleLevel = (role) => {
    const roleLevels = {
      super_admin: 4,
      admin: 3,
      moderator: 2,
      user: 1,
    };
    return roleLevels[role] || 0;
  };

  const canAccessUserManagement = getRoleLevel(user?.role) >= 3; // Admin ve üstü

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
      current: pathname === "/admin/dashboard",
    },
    {
      name: "Firma Yönetimi",
      href: "/admin/companies",
      icon: Building2,
      current: pathname.startsWith("/admin/companies"),
    },
    {
      name: "Quote İstekleri",
      href: "/admin/quotes",
      icon: FileText,
      current: pathname === "/admin/quotes",
    },
    {
      name: "İletişim Mesajları",
      href: "/admin/contacts",
      icon: MessageSquare,
      current: pathname === "/admin/contacts",
    },
    ...(canAccessUserManagement
      ? [
          {
            name: "Kullanıcı Yönetimi",
            href: "/admin/users",
            icon: Users,
            current: pathname?.startsWith("/admin/users"),
          },
        ]
      : []),
    {
      name: "Ayarlar",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative flex w-full max-w-xs flex-col bg-white pb-4 pt-5 shadow-xl">
          <div className="flex flex-shrink-0 items-center px-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              Admin Panel
            </span>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`${
                  item.current
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } group flex items-center rounded-md px-2 py-2 text-base font-medium transition-colors`}
              >
                <item.icon
                  className={`${
                    item.current
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  } mr-4 h-6 w-6 flex-shrink-0`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
          <div className="flex h-16 shrink-0 items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              Admin Panel
            </span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigationItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`${
                          item.current
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                        } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all`}
                      >
                        <item.icon
                          className={`${
                            item.current
                              ? "text-blue-700"
                              : "text-gray-400 group-hover:text-blue-700"
                          } h-6 w-6 shrink-0`}
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm leading-6 text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user?.displayName?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="truncate font-semibold">
                      {user?.displayName || "Admin User"}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {user?.role === "super_admin" && "Süper Admin"}
                      {user?.role === "admin" && "Admin"}
                      {user?.role === "moderator" && "Moderatör"}
                      {(!user?.role || user?.role === "user") && "Kullanıcı"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all"
                >
                  <LogOut className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-700" />
                  Çıkış Yap
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h1 className="text-xl font-semibold leading-7 text-gray-900">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
