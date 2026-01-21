"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { doc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAdminAuth } from "./use-admin-auth";

// Default navigation settings (Firestore'a kaydedilenler)
const DEFAULT_FIRESTORE_SETTINGS = {
  isCollapsed: false,
  pinnedMenus: [], // Kullanıcının pinlediği menü ID'leri (sıralı)
  lastUpdated: null,
};

// Debounce helper
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export function useNavigationSettings() {
  const { user } = useAdminAuth();
  
  // Firestore'a kaydedilen ayarlar
  const [firestoreSettings, setFirestoreSettings] = useState(DEFAULT_FIRESTORE_SETTINGS);
  
  // LOCAL STATE - Sadece bu oturumda geçerli, Firestore'a kaydedilmiyor
  const [expandedMenus, setExpandedMenus] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isLocalUpdate = useRef(false);

  // Firestore'dan real-time dinleme (sadece isCollapsed ve pinnedMenus)
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const navSettings = userData?.preferences?.navigation || DEFAULT_FIRESTORE_SETTINGS;
          
          // Skip update if this is a feedback from our own local change
          if (isLocalUpdate.current) {
            isLocalUpdate.current = false;
            setLoading(false);
            return;
          }
          
          setFirestoreSettings({
            isCollapsed: navSettings.isCollapsed ?? false,
            pinnedMenus: navSettings.pinnedMenus ?? [],
            lastUpdated: navSettings.lastUpdated,
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Navigation settings listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Firestore'a kaydet (debounced) - SADECE isCollapsed ve pinnedMenus
  const saveToFirestore = useCallback(
    debounce(async (newSettings) => {
      if (!user?.uid) return;

      isLocalUpdate.current = true;
      setSaving(true);
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          "preferences.navigation": {
            isCollapsed: newSettings.isCollapsed,
            pinnedMenus: newSettings.pinnedMenus,
            lastUpdated: serverTimestamp(),
          },
        });
      } catch (error) {
        console.error("Error saving navigation settings:", error);
        isLocalUpdate.current = false;
      } finally {
        setSaving(false);
      }
    }, 500),
    [user?.uid]
  );

  // Toggle sidebar collapse (Firestore'a kaydedilir)
  const toggleCollapsed = useCallback(() => {
    setFirestoreSettings((prev) => {
      const newSettings = { ...prev, isCollapsed: !prev.isCollapsed };
      saveToFirestore(newSettings);
      return newSettings;
    });
  }, [saveToFirestore]);

  // Set collapsed state directly (Firestore'a kaydedilir)
  const setCollapsed = useCallback(
    (isCollapsed) => {
      setFirestoreSettings((prev) => {
        const newSettings = { ...prev, isCollapsed };
        saveToFirestore(newSettings);
        return newSettings;
      });
    },
    [saveToFirestore]
  );

  // Toggle menu expand/collapse - SADECE LOCAL STATE, Firestore'a kaydedilmez!
  const toggleMenuExpanded = useCallback((menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  }, []);

  // Set specific menu expanded state - SADECE LOCAL STATE
  const setMenuExpanded = useCallback((menuId, isExpanded) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: isExpanded,
    }));
  }, []);

  // Pin a menu item (Firestore'a kaydedilir)
  const pinMenu = useCallback(
    (menuId) => {
      setFirestoreSettings((prev) => {
        if (prev.pinnedMenus.includes(menuId)) return prev;
        
        const newPinnedMenus = [...prev.pinnedMenus, menuId];
        const newSettings = { ...prev, pinnedMenus: newPinnedMenus };
        saveToFirestore(newSettings);
        return newSettings;
      });
    },
    [saveToFirestore]
  );

  // Unpin a menu item (Firestore'a kaydedilir)
  const unpinMenu = useCallback(
    (menuId) => {
      setFirestoreSettings((prev) => {
        const newPinnedMenus = prev.pinnedMenus.filter((id) => id !== menuId);
        const newSettings = { ...prev, pinnedMenus: newPinnedMenus };
        saveToFirestore(newSettings);
        return newSettings;
      });
    },
    [saveToFirestore]
  );

  // Toggle pin state (Firestore'a kaydedilir)
  const togglePin = useCallback(
    (menuId) => {
      setFirestoreSettings((prev) => {
        const isPinned = prev.pinnedMenus.includes(menuId);
        const newPinnedMenus = isPinned
          ? prev.pinnedMenus.filter((id) => id !== menuId)
          : [...prev.pinnedMenus, menuId];
        const newSettings = { ...prev, pinnedMenus: newPinnedMenus };
        saveToFirestore(newSettings);
        return newSettings;
      });
    },
    [saveToFirestore]
  );

  // Reorder pinned menus (Firestore'a kaydedilir)
  const reorderPinnedMenus = useCallback(
    (newOrder) => {
      setFirestoreSettings((prev) => {
        const newSettings = { ...prev, pinnedMenus: newOrder };
        saveToFirestore(newSettings);
        return newSettings;
      });
    },
    [saveToFirestore]
  );

  // Check if menu is pinned
  const isMenuPinned = useCallback(
    (menuId) => {
      return firestoreSettings.pinnedMenus.includes(menuId);
    },
    [firestoreSettings.pinnedMenus]
  );

  // Check if menu is expanded - LOCAL STATE
  const isMenuExpanded = useCallback(
    (menuId) => {
      return expandedMenus[menuId] || false;
    },
    [expandedMenus]
  );

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setFirestoreSettings(DEFAULT_FIRESTORE_SETTINGS);
    setExpandedMenus({});
    saveToFirestore(DEFAULT_FIRESTORE_SETTINGS);
  }, [saveToFirestore]);

  return {
    // State
    loading,
    saving,
    isCollapsed: firestoreSettings.isCollapsed,
    pinnedMenus: firestoreSettings.pinnedMenus,
    expandedMenus,

    // Actions
    toggleCollapsed,
    setCollapsed,
    toggleMenuExpanded,
    setMenuExpanded,
    pinMenu,
    unpinMenu,
    togglePin,
    reorderPinnedMenus,
    resetSettings,

    // Helpers
    isMenuPinned,
    isMenuExpanded,
  };
}

export default useNavigationSettings;
