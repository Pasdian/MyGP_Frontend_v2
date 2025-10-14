'use client';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { CarguesDataTable } from '@/components/datatables/transbel/CarguesDataTable';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CargueContext } from '@/contexts/CargueContext';

const TAB_VALUES = ['pending', 'paid'] as const;
type TabValue = (typeof TAB_VALUES)[number];
// 2) Type guard to narrow string -> TabValue

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}
export default function Cargues() {
  const [tabValue, setTabValue] = React.useState<'paid' | 'pending'>('pending');

  return (
    <AccessGuard
      allowedModules={['All Modules', 'Transbel Interfaz']}
      allowedRoles={['ADMIN', 'AAP']}
    >
      <div className="flex items-center mb-4 ">
        <Tabs
          value={tabValue}
          onValueChange={(v) => isTabValue(v) && setTabValue(v)}
          className="mr-2"
        >
          <TabsList>
            <TabsTrigger value="pending">Pendientes por Enviar</TabsTrigger>
            <TabsTrigger value="paid">Enviados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <CargueContext.Provider value={{ tabValue, setTabValue }}>
        <CarguesDataTable />
      </CargueContext.Provider>
    </AccessGuard>
  );
}
