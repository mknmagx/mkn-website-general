'use client';

import { AdminAuthProvider } from '../../hooks/use-admin-auth';

export default function AdminRootLayout({ children }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}