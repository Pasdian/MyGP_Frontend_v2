'use client';

import { InterfaceContext } from '@/contexts/InterfaceContext';
import React from 'react';
import { InterfaceDataTable } from '@/components/datatables/transbel/InterfaceDataTable';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { useRefsPendingCE } from '@/hooks/useRefsPendingCE';
import MyGPCalendar from '@/components/MyGPUI/Datepickers/MyGPCalendar';
import { DateRange } from 'react-day-picker';
import { INTERFAZ_ROLES } from '@/lib/modules/moduleRole';

export default function Page() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [tabValue, setTabValue] = React.useState<'errors' | 'pending' | 'sent'>('errors');

  const {
    refsPendingCE,
    setRefsPendingCE,
    loading: isRefsLoading,
  } = useRefsPendingCE(dateRange?.from, dateRange?.to);

  return (
    <AccessGuard allowedRoles={INTERFAZ_ROLES}>
      <div className="flex flex-col justify-center w-full overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
          <p className="text-2xl font-light tracking-tight mb-5">
            {dateRange?.from && dateRange?.to
              ? `De ${formatISOtoDDMMYYYY(
                  dateRange?.from.toISOString()
                )} hasta ${formatISOtoDDMMYYYY(dateRange?.to.toISOString())}`
              : null}
          </p>
        </div>
        <div className="mb-4 w-[250px]">
          <MyGPCalendar
            setDateRange={setDateRange}
            dateRange={dateRange}
            label="Fecha de Entrega"
          />
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
