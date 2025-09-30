'use client';

import { AdminAuthProvider } from '../../hooks/use-admin-auth';
import { AdminRouteGuard } from '../../components/admin-route-guard';
import AdminNavigation from '../../components/admin-navigation';
import { Toaster } from '../../components/ui/toaster';
import { usePathname } from 'next/navigation';

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <AdminAuthProvider>
      <AdminRouteGuard>
        <div className="min-h-screen bg-gray-50">
          {/* Admin Navigation - Only show when not on login page */}
          {!isLoginPage && <AdminNavigation />}
          
          {/* Main Content Area */}
          <main className={isLoginPage ? '' : 'lg:pl-64'}>
            <div className={isLoginPage ? '' : 'py-6'}>
              <div className={isLoginPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
                {children}
              </div>
            </div>
          </main>
        </div>
      </AdminRouteGuard>
      <Toaster />
    </AdminAuthProvider>
  );
}