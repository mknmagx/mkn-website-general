"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "../hooks/use-admin-auth";

/**
 * Admin route guard component
 * Kullanıcının admin panel sayfalarına erişim yetkisini kontrol eder
 */
export const AdminRouteGuard = ({ 
  children, 
  requiredPermissions = [], 
  fallbackPath = "/admin/login" 
}) => {
  const { user, isAdmin, loading, permissions, canAccessRoute } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user || !isAdmin) {
      router.push(fallbackPath);
      return;
    }

    // Route erişim kontrolü
    if (!canAccessRoute(pathname)) {
      router.push("/admin/dashboard");
      return;
    }

    // Gerekli permission kontrolü
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        permissions && permissions[permission] === true
      );

      if (!hasAllPermissions) {
        router.push("/admin/dashboard");
        return;
      }
    }

    setIsAuthorized(true);
  }, [user, isAdmin, loading, permissions, pathname, requiredPermissions, router, canAccessRoute, fallbackPath]);

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Yetkilendirme başarısızsa boş döndür (router redirect işlemi devam ediyor)
  if (!isAuthorized) {
    return null;
  }

  return children;
};

/**
 * Permission-based component wrapper
 * Belirli bir permission'a sahip olmayan kullanıcılar için fallback içerik gösterir
 */
export const PermissionGuard = ({ 
  children, 
  requiredPermission, 
  fallback = null,
  showMessage = true 
}) => {
  const { permissions } = useAdminAuth();
  
  const hasPermission = permissions && permissions[requiredPermission] === true;
  
  if (!hasPermission) {
    if (fallback) {
      return fallback;
    }
    
    if (showMessage) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-yellow-800">
            <svg className="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Yetkisiz Erişim
            </h3>
            <p className="text-yellow-700">
              Bu bölüme erişim için gerekli yetkiniz bulunmamaktadır.
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  }
  
  return children;
};

/**
 * Role-based component wrapper
 * Belirli rollere sahip olmayan kullanıcılar için fallback içerik gösterir
 */
export const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  fallback = null,
  showMessage = true 
}) => {
  const { user } = useAdminAuth();
  
  const hasAllowedRole = user?.role && allowedRoles.includes(user.role);
  
  if (!hasAllowedRole) {
    if (fallback) {
      return fallback;
    }
    
    if (showMessage) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-800">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Rol Yetkisi Yetersiz
            </h3>
            <p className="text-red-700">
              Bu bölüme erişim için gerekli rol seviyeniz bulunmamaktadır.
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  }
  
  return children;
};

/**
 * Custom hook for permission checks
 */
export const usePermissions = () => {
  const { permissions, user } = useAdminAuth();
  
  const hasPermission = (permissionKey) => {
    // Yeni detaylı yetki sistemi kontrolü
    if (permissions && typeof permissions === 'object') {
      // Eski sistem uyumluluğu
      if (permissions[permissionKey] === true) {
        return true;
      }
      
      // Yeni sistem - rol bazında yetkiler
      if (user?.role) {
        const rolePermissions = permissions.rolePermissions || [];
        if (rolePermissions.includes(permissionKey)) {
          return true;
        }
      }
      
      // Bireysel yetki kontrolü
      const userPermissions = permissions.userPermissions || [];
      if (userPermissions.includes(permissionKey)) {
        return true;
      }
    }
    
    // Süper admin her şeyi yapabilir
    if (user?.role === 'super_admin') {
      return true;
    }
    
    // Eski sistem uyumluluğu için basit mapping
    const oldPermissionMapping = {
      'users.view': 'canManageUsers',
      'users.create': 'canManageUsers',
      'users.edit': 'canManageUsers',
      'users.delete': 'canManageUsers',
      'users.manage_roles': 'canManageAdmins',
      'users.manage_permissions': 'canManageAdmins',
      'contacts.view': 'canViewAllContacts',
      'contacts.update': 'canViewAllContacts',
      'contacts.delete': 'canViewAllContacts',
      'quotes.view': 'canViewAllQuotes',
      'companies.view': 'canManageCompanies',
      'companies.create': 'canManageCompanies',
      'companies.edit': 'canManageCompanies',
      'system.settings': 'canModifySettings',
      'analytics.view': 'canViewAnalytics'
    };
    
    const oldPermissionKey = oldPermissionMapping[permissionKey];
    if (oldPermissionKey && permissions && permissions[oldPermissionKey] === true) {
      return true;
    }
    
    return false;
  };
  
  const hasRole = (role) => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles) => {
    return user?.role && roles.includes(user.role);
  };
  
  const hasAnyPermission = (permissionKeys) => {
    return permissionKeys.some(key => hasPermission(key));
  };
  
  return {
    permissions,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
  };
};