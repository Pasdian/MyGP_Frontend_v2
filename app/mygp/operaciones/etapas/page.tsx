'use client';

import { AllTransbelRefsProvider } from '@/app/providers/AllTransbelRefsProvider';
import { ReferenciasDataTable } from '@/components/datatables/transbel/ReferenciasDataTable';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';

export default function Referencias() {
  return (
    <PermissionGuard requiredPermissions={[PERM.OPERACIONES_MODIFICAR_ETAPAS]}>
      <AllTransbelRefsProvider>
        <p className="font-bold text-xl mb-4">Modificar Etapas</p>
        <ReferenciasDataTable />
      </AllTransbelRefsProvider>
    </PermissionGuard>
  );
}
