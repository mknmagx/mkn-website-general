'use client';

import { AdminAuthProvider } from '../../hooks/use-admin-auth';
import { AdminRouteGuard } from '../../components/admin-route-guard';
import AdminNavigation from '../../components/admin-navigation';
import { Toaster } from '../../components/ui/toaster';

export default function AdminRootLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminRouteGuard>
        <div className="min-h-screen bg-gray-50">
          {/* Admin Navigation */}
          <AdminNavigation />
          
          {/* Main Content Area */}
          <main className="lg:pl-64">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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