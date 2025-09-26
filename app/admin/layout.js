'use client';

import { AdminAuthProvider } from '../../hooks/use-admin-auth';
import { Toaster } from '../../components/ui/toaster';

export default function AdminRootLayout({ children }) {
  return (
    <AdminAuthProvider>
      {children}
      <Toaster />
    </AdminAuthProvider>
  );
}