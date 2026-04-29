'use client';

import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import AdminList from '@/components/glosa/AdminList';

export default function TodasPage() {
  return (
    <PermissionGuard requiredPermissions={[PERM.GLOSA_ADMIN_LIST]}>
      <AdminList />
    </PermissionGuard>
  );
}
