import { useState, useEffect, useContext, createContext } from "react";
import {
  onAdminAuthStateChanged,
  adminSignOut,
} from "../lib/services/admin-auth-service";

const AdminAuthContext = createContext({});

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [allowedRoutes, setAllowedRoutes] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000); // Daha kısa timeout

    const unsubscribe = onAdminAuthStateChanged((authData) => {
      if (!mounted) return;

      clearTimeout(loadingTimeout);

      if (authData) {
        setUser(authData.user);
        setIsAdmin(authData.isAdmin);
        setPermissions(authData.permissions);
        setUserRole(authData.user?.role);
        setAllowedRoutes(authData.allowedRoutes || []);
      } else {
        setUser(null);
        setIsAdmin(false);
        setPermissions(null);
        setUserRole(null);
        setAllowedRoutes([]);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await adminSignOut();
      setUser(null);
      setIsAdmin(false);
      setPermissions(null);
      setUserRole(null);
      setAllowedRoutes([]);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const hasPermission = (permissionKey) => {
    if (user?.role === "super_admin") {
      return true;
    }

    if (Array.isArray(permissions)) {
      return permissions.includes(permissionKey);
    }

    return permissions && permissions[permissionKey] === true;
  };

  const canAccessRoute = (routePath) => {
    if (!userRole || !allowedRoutes) return false;

    // Super admin her yere erişebilir
    if (allowedRoutes.includes("*")) return true;

    // Database'den gelen allowed routes'u kontrol et
    return allowedRoutes.some((route) => routePath.startsWith(route));
  };

  const value = {
    user,
    isAdmin,
    loading,
    permissions,
    userRole,
    allowedRoutes,
    signOut,
    hasPermission,
    canAccessRoute,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    console.error("useAdminAuth must be used within AdminAuthProvider");
    return { user: null, isAdmin: false, loading: true };
  }
  return context;
};

export const useAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password, loginFunction) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginFunction(email, password);
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (err) {
      setError("Beklenmeyen bir hata oluştu.");
      return { success: false, message: "Beklenmeyen bir hata oluştu." };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    isLoading,
    error,
    clearError,
  };
};
