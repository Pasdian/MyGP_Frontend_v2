'use client';

import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import UploadForm from '@/components/glosa/UploadForm';

export default function EnviarPage() {
  return (
    <PermissionGuard requiredPermissions={[PERM.GLOSA_KAM_UPLOAD]}>
      <UploadForm />
    </PermissionGuard>
  );
}
