import { PermissionGuard } from '@/components/admin-route-guard';
import PackagingForm from '@/components/admin/packaging-form';

export default function NewPackagingPage() {
  return (
    <PermissionGuard requiredPermission="packaging.write">
      <div className="container mx-auto px-4 py-8">
        <PackagingForm />
      </div>
    </PermissionGuard>
  );
}