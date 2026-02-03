'use client';

import EtapasProvider from '@/app/providers/EtapasProvider';
import { NumRefeParamsProvider, useNumRefeParams } from '@/app/providers/NumRefeParamsProvider';
import { AñadirEtapa } from '@/components/datatables/transbel/AddEtapa';
import EtapasDataTable from '@/components/datatables/transbel/EtapasDataTable';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';

export default function NUM_REFE() {
  return (
    <PermissionGuard requiredPermissions={[PERM.OPERACIONES_MODIFICAR_ETAPAS]}>
      <NumRefeParamsProvider>
        <Wrapper />
      </NumRefeParamsProvider>
    </PermissionGuard>
  );
}

function Wrapper() {
  const { NUM_REFE } = useNumRefeParams();
  return (
    <EtapasProvider NUM_REFE={NUM_REFE || ''}>
      <p className="font-bold text-lg mb-4">Etapas - {NUM_REFE}</p>
      <div className="mb-4">
        <AñadirEtapa />
      </div>
      <EtapasDataTable />
    </EtapasProvider>
  );
}
