'use client';

import { InterfaceContext } from '@/contexts/InterfaceContext';
import React from 'react';
import { InterfaceDataTable } from '@/components/datatables/transbel/InterfaceDataTable';
import { useRefsPendingCE } from '@/hooks/useRefsPendingCE';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';

export default function Page() {
  const [tabValue, setTabValue] = React.useState<'errors' | 'pending' | 'sent'>('errors');

  const { refsPendingCE, setRefsPendingCE, loading: isRefsLoading } = useRefsPendingCE();

  return (
    <PermissionGuard requiredPermissions={[PERM.TRANSBEL_INTERFAZ]}>
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
    </PermissionGuard>
  );
}
