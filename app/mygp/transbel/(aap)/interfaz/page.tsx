'use client';

import { InterfaceContext } from '@/contexts/InterfaceContext';
import React from 'react';
import { InterfaceDataTable } from '@/components/datatables/transbel/InterfaceDataTable';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import MyGPDatePicker from '@/components/MyGPUI/Datepickers/MyGPDatePicker';
import { useRefsPendingCE } from '@/hooks/useRefsPendingCE';

export default function Page() {
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(() => {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstOfMonth.setHours(0, 0, 0, 0);
    return firstOfMonth;
  });

  const [finalDate, setFinalDate] = React.useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [tabValue, setTabValue] = React.useState<'errors' | 'pending' | 'sent'>('errors');

  const {
    refsPendingCE,
    setRefsPendingCE,
    loading: isRefsLoading,
  } = useRefsPendingCE(initialDate, finalDate);

  return (
    <AccessGuard
      allowedModules={['All Modules', 'Transbel Interfaz']}
      allowedRoles={['ADMIN', 'AAP']}
    >
      <div className="flex flex-col justify-center w-full overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
          <p className="text-2xl font-light tracking-tight mb-5">
            {initialDate && finalDate
              ? `De ${formatISOtoDDMMYYYY(initialDate.toISOString())} hasta ${formatISOtoDDMMYYYY(
                  finalDate.toISOString()
                )}`
              : null}
          </p>
        </div>
        <div className="flex mb-5">
          <div className="mr-5">
            <MyGPDatePicker date={initialDate} setDate={setInitialDate} label="Fecha de Inicio" />
          </div>
          <div>
            <MyGPDatePicker date={finalDate} setDate={setFinalDate} label="Fecha de Término" />
          </div>
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
