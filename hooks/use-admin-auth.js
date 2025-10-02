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

  useEffect(() => {
    let mounted = true;

    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000); // Daha kısa timeout

    const unsubscribe = onAdminAuthStateChanged((authData) => {
      if (!mounted) return;

      console.log("Auth state changed:", authData?.user?.email || "No user");
      clearTimeout(loadingTimeout);

      if (authData) {
        setUser(authData.user);
        setIsAdmin(authData.isAdmin);
        setPermissions(authData.permissions);
        setUserRole(authData.user?.role);
      } else {
        setUser(null);
        setIsAdmin(false);
        setPermissions(null);
        setUserRole(null);
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
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const hasPermission = (permissionKey) => {
    return permissions && permissions[permissionKey] === true;
  };

  const canAccessRoute = (routePath) => {
    if (!userRole) return false;

    const roleRoutes = {
      super_admin: ["*"], // Tüm sayfalara erişim
      admin: [
        "/admin/dashboard",
        "/admin/users",
        "/admin/companies",
        "/admin/contacts",
        "/admin/quotes",
        "/admin/permissions",
      ],
      moderator: ["/admin/dashboard", "/admin/contacts", "/admin/quotes"],
    };

    const allowedRoutes = roleRoutes[userRole] || [];
    return (
      allowedRoutes.includes("*") ||
      allowedRoutes.some((route) => routePath.startsWith(route))
    );
  };

  const value = {
    user,
    isAdmin,
    loading,
    permissions,
    userRole,
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

// Admin Auth Hook
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    console.error("useAdminAuth must be used within AdminAuthProvider");
    return { user: null, isAdmin: false, loading: true };
  }
  return context;
};

// Admin Login Hook
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
