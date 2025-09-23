import { useState, useEffect, useContext, createContext } from "react";
import { onAdminAuthStateChanged } from "../lib/services/admin-auth-service";

const AdminAuthContext = createContext({});

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    const unsubscribe = onAdminAuthStateChanged((authUser) => {
      console.log("Auth state changed:", authUser?.email || "No user");
      clearTimeout(loadingTimeout);
      setUser(authUser);
      setIsAdmin(!!authUser);
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    isAdmin,
    loading,
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
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
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
