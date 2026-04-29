'use client';

import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import GlosadorInbox from '@/components/glosa/GlosadorInbox';

export default function BandejaPage() {
  return (
    <PermissionGuard requiredPermissions={[PERM.GLOSA_GLOSADOR_BANDEJA]}>
      <GlosadorInbox />
    </PermissionGuard>
  );
}
