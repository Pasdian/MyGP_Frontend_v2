'use client';

import { InterfaceContext } from '@/contexts/InterfaceContext';
import React from 'react';
import { InterfaceDataTable } from '@/components/datatables/transbel/InterfaceDataTable';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { useRefsPendingCE } from '@/hooks/useRefsPendingCE';
import { INTERFAZ_ROLES } from '@/lib/modules/moduleRole';

export default function Page() {
  const [tabValue, setTabValue] = React.useState<'errors' | 'pending' | 'sent'>('errors');

  const { refsPendingCE, setRefsPendingCE, loading: isRefsLoading } = useRefsPendingCE();

  return (
    <AccessGuard allowedRoles={INTERFAZ_ROLES}>
      <div className="flex flex-col justify-center w-full overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-4">Interfaz de Transbel</h1>
        </div>
      </div>
      <InterfaceContext.Provider
        value={{
          refsPendingCE,
          setRefsPendingCE,
          tabValue,
          setTabValue,
          isRefsLoading,
        }}
      >
        <InterfaceDataTable />
      </InterfaceContext.Provider>
    </AccessGuard>
  );
}
