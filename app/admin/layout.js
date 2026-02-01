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
  const isMetaMessengerPage = pathname.startsWith('/admin/meta-messenger');
  const isFinancePage = pathname.startsWith('/admin/finance');
  const isFullHeightPage = isAIPage || isOutlookPage || isMetaMessengerPage;
  const isFullWidthPage = isFinancePage;

  return (
    <AdminAuthProvider>
      <AdminRouteGuard>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Admin Navigation - Only show when not on login page */}
          {!isLoginPage && <AdminNavigation />}
          
          {/* Main Content Area - flex-1 to fill remaining space */}
          <main className={`flex-1 min-w-0 ${isLoginPage ? '' : 'pt-14 lg:pt-0'}`}>
            {isFullHeightPage ? (
              // AI, Outlook ve Instagram DM sayfaları için padding ve container yok - full height
              <div className="h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden max-w-[1300px] mx-auto">
                {children}
              </div>
            ) : isFullWidthPage ? (
              // Finans sayfaları için - max-width ile sınırlı
              <div className="py-4 px-6 max-w-[1600px] mx-auto">
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