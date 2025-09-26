'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '../hooks/use-admin-auth';
import { USER_ROLES } from '../lib/services/admin-user-service';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function AdminNavigation() {
  const pathname = usePathname();
  const { user, signOut } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/admin/dashboard'
    },
    {
      name: 'Quote İstekleri',
      href: '/admin/quotes',
      icon: FileText,
      current: pathname === '/admin/quotes'
    },
    {
      name: 'İletişim Mesajları',
      href: '/admin/contacts',
      icon: MessageSquare,
      current: pathname === '/admin/contacts'
    },
    {
      name: 'Kullanıcı Yönetimi',
      href: '/admin/users',
      icon: Users,
      current: pathname.startsWith('/admin/users'),
      requiredRole: USER_ROLES.ADMIN // Sadece admin ve üstü görebilir
    }
  ];

  // Rol tabanlı filtreleme
  const filteredItems = navigationItems.filter(item => {
    if (!item.requiredRole) return true;
    
    const roleHierarchy = {
      [USER_ROLES.SUPER_ADMIN]: 4,
      [USER_ROLES.ADMIN]: 3,
      [USER_ROLES.MODERATOR]: 2,
      [USER_ROLES.USER]: 1
    };
    
    return (roleHierarchy[user?.role] || 0) >= (roleHierarchy[item.requiredRole] || 0);
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 lg:overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6">
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
        <nav className="mt-8 flex-1 px-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-150`}
              >
                <Icon
                  className={`${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Sign Out */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.displayName || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === USER_ROLES.SUPER_ADMIN && 'Süper Admin'}
                  {user?.role === USER_ROLES.ADMIN && 'Admin'}
                  {user?.role === USER_ROLES.MODERATOR && 'Moderatör'}
                  {user?.role === USER_ROLES.USER && 'Kullanıcı'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Çıkış Yap"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
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
          <div className="bg-white border-b border-gray-200">
            <nav className="px-2 py-3 space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${
                      item.current
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
                  >
                    <Icon
                      className={`${
                        item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Info */}
            <div className="px-3 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700">
                      {user?.displayName || 'Admin User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.role === USER_ROLES.SUPER_ADMIN && 'Süper Admin'}
                      {user?.role === USER_ROLES.ADMIN && 'Admin'}
                      {user?.role === USER_ROLES.MODERATOR && 'Moderatör'}
                      {user?.role === USER_ROLES.USER && 'Kullanıcı'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
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