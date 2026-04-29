'use client';

import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { useAuth } from '@/hooks/useAuth';
import KpiDashboard from '@/components/glosa/KpiDashboard';

export default function KpisPage() {
  const { hasPermission } = useAuth();
  const scope = hasPermission(PERM.GLOSA_ADMIN_KPIS) ? 'admin' : 'glosador';

  return (
    <PermissionGuard requiredPermissions={[PERM.GLOSA_GLOSADOR_KPIS, PERM.GLOSA_ADMIN_KPIS]}>
      <KpiDashboard scope={scope} />
    </PermissionGuard>
  );
}
