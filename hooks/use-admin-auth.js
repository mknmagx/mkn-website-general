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

  useEffect(() => {
    let mounted = true;

    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000); // Daha kısa timeout

    const unsubscribe = onAdminAuthStateChanged((authUser) => {
      if (!mounted) return;

      console.log("Auth state changed:", authUser?.email || "No user");
      clearTimeout(loadingTimeout);
      setUser(authUser);
      setIsAdmin(!!authUser);
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
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    signOut,
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
