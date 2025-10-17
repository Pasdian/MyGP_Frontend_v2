'use client';
import PieChartLabelList from '@/components/charts/PieChartLabelList';
import React from 'react';
import { Card } from '@/components/ui/card';
import { DailyTrackingDataTable } from '@/components/datatables/dashboard/DailyTrackingDataTable';
import { MyGPCombo } from '@/components/comboboxes/MyGPCombo';
import { toYMD } from '@/lib/utilityFunctions/toYMD';
import { useAuth } from '@/hooks/useAuth';
import useSWRImmutable from 'swr/immutable';
import { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MyGPDatePicker from '@/components/datepickers/MyGPDatePicker';
import { customs } from '@/lib/customs/customs';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useDailyTracking } from '@/hooks/useDailyTracking';
const toISODate = (d?: Date) => (d ? d.toISOString().slice(0, 10) : '');

const TAB_VALUES = ['all', 'open', 'closed'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}

export default function Dashboard() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';
  const isTraffic = user?.complete_user?.role?.name == 'TRAFICO';

  const [initialDate, setInitialDate] = React.useState<Date | undefined>(firstDayOfMonth);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(today);

  const [kamValue, setKamValue] = React.useState('');
  const [customValue, setCustomValue] = React.useState('');
  const [clientValue, setClientValue] = React.useState('');
  const [phaseValue, setPhaseValue] = React.useState('');
  const [tabValue, setTabValue] = React.useState<'all' | 'open' | 'closed'>('all');

  const { data: meta } = useSWRImmutable<
    | {
        kam: string[];
        customs: string[];
        phases: { code: string; name: string }[];
        clients: string[];
      }
    | undefined
  >('/api/daily-tracking/meta', axiosFetcher);

  const { records: dailyTrackingData } = useDailyTracking(initialDate, finalDate);

  const kamsOptions = React.useMemo(
    () =>
      meta?.kam?.map((item) => ({
        value: item,
        label: item,
      })) || [],
    [meta]
  );

  const customsOptions = React.useMemo(() => {
    return (
      meta?.customs?.map((item) => {
        const custom = customs.find((c) => c.key === item);
        return {
          value: item, // link to custom.key
          label: `${item} - ${custom?.name || 'Sin registro'}`, // show code - name
        };
      }) || []
    );
  }, [meta]);

  const clientOptions = React.useMemo(
    () =>
      meta?.clients?.map((item) => ({
        value: item,
        label: item,
      })) || [],
    [meta]
  );

  const phasesOptions = React.useMemo(
    () =>
      meta?.phases?.map((phase) => ({
        value: phase.code,
        label: `${phase.code}-${phase.name}`,
      })) || [],
    [meta]
  );
  // Filters
  const filterValues = React.useMemo(
    () => ({
      kam: kamValue || undefined,
      custom: customValue || undefined,
      phase: phaseValue || undefined,
      client: clientValue || undefined,
      tab: tabValue,
    }),
    [kamValue, customValue, phaseValue, clientValue, tabValue]
  );

  return (
    <div className="h-full overflow-y-scroll p-2">
      {(isTraffic || isAdmin) && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start mb-4">
            <MyGPDatePicker date={initialDate} setDate={setInitialDate} label="Fecha de Inicio" />
            <MyGPDatePicker date={finalDate} setDate={setFinalDate} label="Fecha de Termino" />

            {!isAuthLoading && (
              <>
                {isAdmin && (
                  <MyGPCombo
                    value={kamValue}
                    setValue={setKamValue}
                    label="Ejecutivo"
                    options={kamsOptions}
                  />
                )}

                <MyGPCombo
                  value={customValue}
                  setValue={setCustomValue}
                  label="Aduana"
                  options={customsOptions}
                />
                <MyGPCombo
                  value={clientValue}
                  setValue={setClientValue}
                  label="Cliente"
                  options={clientOptions}
                />
                <MyGPCombo
                  value={phaseValue}
                  setValue={setPhaseValue}
                  label="Etapa Actual"
                  options={phasesOptions}
                />
                <div className="flex items-end h-full w-full">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    onClick={() => {
                      setClientValue('');
                      setCustomValue('');
                      setPhaseValue('');
                      setKamValue('');
                    }}
                  >
                    <X />
                    Borrar filtros
                  </Button>
                </div>
              </>
            )}
          </div>
          <Card className="mb-8 p-4">
            {!isAuthLoading && isAdmin && (
              <Tabs value={tabValue} onValueChange={(v) => isTabValue(v) && setTabValue(v)}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="open">Abiertas</TabsTrigger>
                  <TabsTrigger value="closed">Despachadas</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <DailyTrackingDataTable
              dailyTrackingData={dailyTrackingData}
              filterValues={filterValues}
            />
          </Card>
        </>
      )}
      <PieChartLabelList />;
    </div>
  );
}
