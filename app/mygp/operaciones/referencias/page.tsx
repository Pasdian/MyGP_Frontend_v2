'use client';

import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { AllTransbelRefsProvider } from '@/app/providers/AllTransbelRefsProvider';
import { ReferenciasDataTable } from '@/components/datatables/transbel/ReferenciasDataTable';
import { OPERACIONES_REFERENCIAS_ROLES } from '@/lib/modules/moduleRole';

export default function Referencias() {
  return (
    <AccessGuard allowedRoles={OPERACIONES_REFERENCIAS_ROLES}>
      <AllTransbelRefsProvider>
        <p className="font-bold text-xl mb-4">Modificar Referencias</p>
        <ReferenciasDataTable />
      </AllTransbelRefsProvider>
    </AccessGuard>
  );
}
