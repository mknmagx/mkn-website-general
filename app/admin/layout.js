'use client';

import { AdminAuthProvider } from '../../hooks/use-admin-auth';
import { AdminRouteGuard } from '../../components/admin-route-guard';
import AdminNavigation from '../../components/admin-navigation';
import { Toaster } from '../../components/ui/toaster';
import { usePathname } from 'next/navigation';

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const isAIPage = pathname.startsWith('/admin/ai');
  const isOutlookPage = pathname.startsWith('/admin/outlook');
  const isFullHeightPage = isAIPage || isOutlookPage;

  return (
    <AdminAuthProvider>
      <AdminRouteGuard>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Admin Navigation - Only show when not on login page */}
          {!isLoginPage && <AdminNavigation />}
          
          {/* Main Content Area - flex-1 to fill remaining space */}
          <main className={`flex-1 min-w-0 ${isLoginPage ? '' : 'pt-14 lg:pt-0'}`}>
            {isFullHeightPage ? (
              // AI ve Outlook sayfaları için padding ve container yok - full height
              <div className="h-screen lg:h-full">
                {children}
              </div>
            ) : (
              // Diğer sayfalar için normal layout
              <div className={isLoginPage ? '' : 'py-6'}>
                <div className={isLoginPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
                  {children}
                </div>
              </div>
            )}
          </main>
        </div>
      </AdminRouteGuard>
      <Toaster />
    </AdminAuthProvider>
  );
}