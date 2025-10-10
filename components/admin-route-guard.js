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
  fallbackPath = "/admin/login",
}) => {
  const { user, isAdmin, loading, permissions, canAccessRoute } =
    useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const publicRoutes = ["/admin/login"];

  useEffect(() => {
    if (loading) return;

    if (publicRoutes.includes(pathname)) {
      setIsAuthorized(true);
      return;
    }

    if (!user || !isAdmin) {
      router.push(fallbackPath);
      return;
    }

    if (!canAccessRoute(pathname)) {
      router.push("/admin/dashboard");
      return;
    }

    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(
        (permission) => permissions && permissions[permission] === true
      );

      if (!hasAllPermissions) {
        router.push("/admin/dashboard");
        return;
      }
    }

    setIsAuthorized(true);
  }, [
    user,
    isAdmin,
    loading,
    permissions,
    pathname,
    requiredPermissions,
    router,
    canAccessRoute,
    fallbackPath,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return children;
};

export const PermissionGuard = ({
  children,
  requiredPermission,
  fallback = null,
  showMessage = true,
}) => {
  const { permissions, user, userRole, hasPermission } = useAdminAuth();

  // Super admin kontrolü - super admin her şeye erişebilir
  const isSuperAdmin =
    userRole === "super_admin" || user?.role === "super_admin";

  const permissionCheck = hasPermission(requiredPermission);

  if (!permissionCheck) {
    if (fallback) {
      return fallback;
    }

    if (showMessage) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-yellow-800">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
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
  showMessage = true,
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
            <svg
              className="mx-auto h-12 w-12 text-red-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
              />
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
  const { permissions, user, hasPermission: authHasPermission } = useAdminAuth();

  const hasPermission = (permissionKey) => {
    return authHasPermission ? authHasPermission(permissionKey) : false;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return user?.role && roles.includes(user.role);
  };

  const hasAnyPermission = (permissionKeys) => {
    return permissionKeys.some((key) => hasPermission(key));
  };

  return {
    permissions,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
  };
};
