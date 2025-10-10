/**
 * Admin Sync Hook
 * Permission, Role ve User senkronizasyon işlemlerini yöneten hook
 */

import { useState } from "react";
import { 
  validateAndFixPermissionConsistency, 
  syncBulkChanges 
} from "../lib/services/sync-service";
import { toast } from "sonner";

export const useAdminSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  /**
   * Sistem genelinde tutarlılık kontrolü ve otomatik düzeltme
   */
  const validateSystemConsistency = async () => {
    setIsSyncing(true);
    try {
      toast.info("Sistem tutarlılığı kontrol ediliyor...");
      
      const result = await validateAndFixPermissionConsistency();
      
      setLastSyncResult(result);
      
      if (result.success) {
        if (result.fixedUsers > 0 || result.fixedRoles > 0) {
          toast.success(
            `Tutarlılık kontrolü tamamlandı. ${result.fixedUsers} kullanıcı, ${result.fixedRoles} rol düzeltildi.`
          );
        } else {
          toast.success("Sistem tutarlılığı kontrol edildi. Sorun bulunamadı.");
        }
      } else {
        toast.error("Tutarlılık kontrolünde hata oluştu.");
      }
      
      return result;
    } catch (error) {
      console.error("Consistency validation error:", error);
      toast.error("Tutarlılık kontrolünde hata: " + error.message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Toplu değişiklikleri senkronize eder
   */
  const syncBulkOperations = async (changes) => {
    setIsSyncing(true);
    try {
      toast.info("Toplu senkronizasyon başlatılıyor...");
      
      const result = await syncBulkChanges(changes);
      
      setLastSyncResult(result);
      
      if (result.success) {
        toast.success(
          `Toplu senkronizasyon tamamlandı. ${result.processedChanges} değişiklik işlendi.`
        );
      } else {
        toast.error("Toplu senkronizasyonda hata oluştu.");
      }
      
      return result;
    } catch (error) {
      console.error("Bulk sync error:", error);
      toast.error("Toplu senkronizasyonda hata: " + error.message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Senkronizasyon durumunu temizler
   */
  const clearSyncStatus = () => {
    setLastSyncResult(null);
  };

  return {
    isSyncing,
    lastSyncResult,
    validateSystemConsistency,
    syncBulkOperations,
    clearSyncStatus,
  };
};