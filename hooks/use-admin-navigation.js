import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './use-admin-auth';
import { logNavigation } from '../lib/services/admin-log-service';

/**
 * Admin navigasyon loglaması için hook
 */
export const useAdminNavigation = () => {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const previousPath = useRef(null);

  useEffect(() => {
    // Sadece admin sayfalarında çalışsın
    if (!pathname?.startsWith('/admin') || !user) {
      return;
    }

    // İlk yükleme değilse navigasyon logla
    if (previousPath.current && previousPath.current !== pathname) {
      logNavigation(
        user.uid,
        user.email,
        user.role,
        previousPath.current,
        pathname
      ).catch(error => {
        console.error('Navigation logging failed:', error);
      });
    }

    // Mevcut path'i kaydet
    previousPath.current = pathname;
  }, [pathname, user]);

  return {
    currentPath: pathname,
    logCustomNavigation: (action, details) => {
      if (user) {
        logNavigation(
          user.uid,
          user.email,
          user.role,
          action,
          details
        ).catch(error => {
          console.error('Custom navigation logging failed:', error);
        });
      }
    }
  };
};