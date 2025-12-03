'use client';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { CarguesDataTable } from '@/components/datatables/transbel/CarguesDataTable';
import React from 'react';
import { CarguesContext } from '@/contexts/CarguesContext';
import useCargues from '@/hooks/useCargues';
import { MyGPTabs } from '@/components/MyGPUI/Tabs/MyGPTabs';

const TAB_VALUES = ['pending', 'paid'] as const;
type TabValue = (typeof TAB_VALUES)[number];
// 2) Type guard to narrow string -> TabValue

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}
export default function Cargues() {
  const [tabValue, setTabValue] = React.useState<'paid' | 'pending'>('pending');
  const { cargues, isLoading: isCarguesLoading, setCargues } = useCargues();
  return (
    <AccessGuard
      allowedModules={['All Modules', 'Transbel Interfaz']}
      allowedRoles={['ADMIN', 'AAP']}
    >
      <div className="flex items-center mb-4 w-[280px]">
        <MyGPTabs
          value={tabValue}
          onValueChange={(v) => isTabValue(v) && setTabValue(v)}
          defaultValue="pending"
          className="mr-2"
          tabs={[
            { value: 'pending', label: 'Pendientes por Enviar' },
            { value: 'paid', label: 'Enviados' },
          ]}
        />
      </div>

      <CarguesContext.Provider
        value={{ cargues, setCargues, tabValue, setTabValue, isLoading: isCarguesLoading }}
      >
        <CarguesDataTable />
      </CarguesContext.Provider>
    </AccessGuard>
  );
}
