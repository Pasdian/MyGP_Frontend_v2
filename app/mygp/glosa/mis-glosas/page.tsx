'use client';

import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import KamInbox from '@/components/glosa/KamInbox';

export default function MisGlosasPage() {
  return (
    <PermissionGuard requiredPermissions={[PERM.GLOSA_KAM_INBOX]}>
      <KamInbox />
    </PermissionGuard>
  );
}
