'use client';

import { useAdminAuth } from '../../../hooks/use-admin-auth';
import AuthDebugger from '../../../components/admin/auth-debugger';
import { PermissionGuard } from '../../../components/admin-route-guard';

export default function AdminDebugPage() {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="integrations.view">
      <div className="container mx-auto p-6">
        <AuthDebugger />
      </div>
    </PermissionGuard>
  );
}