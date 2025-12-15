'use client';
import { CarguesDataTable } from '@/components/datatables/transbel/CarguesDataTable';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { CarguesTabs } from '@/components/datatables/transbel/CarguesTabs';
import CargueProvider from '@/app/providers/CargueProvider';

export default function Cargues() {
  return (
    <PermissionGuard requiredPermissions={[PERM.TRANSBEL_CARGUES]}>
      <CargueProvider>
        <CarguesTabs />
        <CarguesDataTable />
      </CargueProvider>
    </PermissionGuard>
  );
}
