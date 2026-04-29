'use client';

import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import AdminAssign from '@/components/glosa/AdminAssign';

export default function AsignacionesPage() {
  return (
    <PermissionGuard requiredPermissions={[PERM.GLOSA_ADMIN_ASSIGN]}>
      <AdminAssign />
    </PermissionGuard>
  );
}
