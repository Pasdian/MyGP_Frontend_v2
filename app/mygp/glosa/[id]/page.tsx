'use client';

import { useParams, useRouter } from 'next/navigation';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { useAuth } from '@/hooks/useAuth';
import GlosaViewer from '@/components/glosa/GlosaViewer';
import type { ViewerRole } from '@/lib/glosa/types';

export default function ViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasPermission } = useAuth();

  // Determine role: glosador can annotate, kam read-only mirror, admin read-only
  let role: ViewerRole = 'kam';
  if (hasPermission(PERM.GLOSA_GLOSADOR_VIEWER)) role = 'glosador';
  else if (hasPermission(PERM.GLOSA_ADMIN_LIST)) role = 'admin';
  else if (hasPermission(PERM.GLOSA_KAM_VIEWER)) role = 'kam';

  // KAM defaults to 'errors' layout per design spec 4.4 (read-only mirror opens with errors panel)
  // Glosador and admin default to 'split'
  const initialLayout = role === 'kam' ? 'errors' : 'split';

  return (
    <PermissionGuard
      requiredPermissions={[
        PERM.GLOSA_GLOSADOR_VIEWER,
        PERM.GLOSA_KAM_VIEWER,
        PERM.GLOSA_ADMIN_LIST,
      ]}
    >
      <div className="h-[calc(100vh-var(--header-height,3rem))] -mx-2 -my-3 sm:-mx-4 sm:-my-4">
        <GlosaViewer
          glosaId={id}
          role={role}
          initialLayout={initialLayout}
          onBack={() => router.back()}
        />
      </div>
    </PermissionGuard>
  );
}
