'use client';

import EtapasProvider from '@/app/providers/EtapasProvider';
import { NumRefeParamsProvider, useNumRefeParams } from '@/app/providers/NumRefeParamsProvider';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { AñadirEtapa } from '@/components/datatables/transbel/AddEtapa';
import EtapasDataTable from '@/components/datatables/transbel/EtapasDataTable';
import { OPERACIONES_REFERENCIAS_ROLES } from '@/lib/modules/moduleRole';

export default function NUM_REFE() {
  return (
    <AccessGuard allowedRoles={OPERACIONES_REFERENCIAS_ROLES}>
      <NumRefeParamsProvider>
        <Wrapper />
      </NumRefeParamsProvider>
    </AccessGuard>
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
