'use client';

import React from 'react';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { AllTransbelRefsProvider } from '@/app/providers/AllTransbelRefsProvider';
import { ReferenciasDataTable } from '@/components/datatables/transbel/ReferenciasDataTable';

export default function Referencias() {
  return (
    <AccessGuard allowedRoles={['ADMIN', 'TRAFICO_ADMIN']}>
      <AllTransbelRefsProvider>
        <p className="font-bold text-xl mb-4">Modificar Referencias</p>
        <ReferenciasDataTable />
      </AllTransbelRefsProvider>
    </AccessGuard>
  );
}
