import { use } from "react";
import { PermissionGuard } from "@/components/admin-route-guard";
import PackagingForm from "@/components/admin/packaging-form";

export default function EditPackagingPage({ params }) {
  const unwrappedParams = use(params);
  
  return (
    <PermissionGuard requiredPermission="packaging.write">
      <div className="container mx-auto px-4 py-8">
        <PackagingForm productId={unwrappedParams.id} />
      </div>
    </PermissionGuard>
  );
}
