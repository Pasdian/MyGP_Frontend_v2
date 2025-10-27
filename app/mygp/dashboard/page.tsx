'use client';
import PieChartLabelList from '@/components/charts/PieChartLabelList';
import React from 'react';
import { Card } from '@/components/ui/card';
import { DailyTrackingDataTable } from '@/components/datatables/dashboard/DailyTrackingDataTable';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { useAuth } from '@/hooks/useAuth';
import useSWR from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import MyGPDatePicker from '@/components/MyGPUI/Datepickers/MyGPDatePicker';
import { customs } from '@/lib/customs/customs';
import { X } from 'lucide-react';
import { useDailyTracking } from '@/hooks/useDailyTracking';
import { DailyTrackingContext } from '@/contexts/DailyTrackingContext';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';
import { MyGPTabs } from '@/components/MyGPUI/Tabs/MyGPTabs';

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
  const isTrafficAdmin = user?.complete_user?.role?.name === 'TRAFICO_ADMIN';
  const hasTrafficPerm = user?.complete_user?.role?.permissions?.some(
    (p) => p.action === 'DASHBOARD_TRAFICO'
  );
  const hasTrafficAdminPerm = user?.complete_user?.role?.permissions?.some(
    (p) => p.action === 'DASHBOARD_TRAFICO_ADMIN'
  );
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(firstDayOfMonth);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(today);

  const [kamValue, setKamValue] = React.useState('');
  const [customValue, setCustomValue] = React.useState('');
  const [clientValue, setClientValue] = React.useState('');
  const [phaseValue, setPhaseValue] = React.useState('');
  const [tabValue, setTabValue] = React.useState<'all' | 'open' | 'closed'>('all');

  const { data: meta } = useSWR<
    | {
        kam: string[];
        customs: string[];
        phases: { code: string; name: string }[];
        clients: { CVE_IMPO: string; CLIENT_NAME: string }[];
      }
    | undefined
  >('/api/daily-tracking/meta', axiosFetcher);

  const { records: dailyTrackingData, setRecords: setDailyTrackingData } = useDailyTracking(
    initialDate,
    finalDate
  );

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
        value: item.CVE_IMPO,
        label: item.CLIENT_NAME,
      })) || [],
    [meta]
  );

  const phasesOptions = React.useMemo(
    () =>
      meta?.phases?.map((phase) => ({
        value: phase.code,
        label: phase.name,
      })) || [],
    [meta]
  );
  // Filters
  const filterValues = React.useMemo(
    () => ({
      kam: kamValue || undefined,
      custom: customValue || undefined,
      phase: phaseValue || undefined,
      client: clientValue.split(' ')[0] || undefined,
      tab: tabValue,
    }),
    [kamValue, customValue, phaseValue, clientValue, tabValue]
  );

  return (
    <div>
      {(isTraffic || isAdmin || hasTrafficPerm) && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start mb-4">
            <MyGPDatePicker date={initialDate} setDate={setInitialDate} label="Fecha de Inicio" />
            <MyGPDatePicker date={finalDate} setDate={setFinalDate} label="Fecha de Termino" />

            {!isAuthLoading && (
              <>
                {(isTrafficAdmin || isAdmin || hasTrafficAdminPerm) && (
                  <MyGPCombo
                    value={kamValue}
                    setValue={setKamValue}
                    label="Ejecutivo"
                    options={kamsOptions}
                    placeholder="Selecciona un ejecutivo"
                  />
                )}

                <MyGPCombo
                  value={customValue}
                  setValue={setCustomValue}
                  label="Aduana"
                  options={customsOptions}
                  placeholder="Selecciona una aduana"
                />
                <MyGPCombo
                  value={clientValue}
                  setValue={setClientValue}
                  label="Cliente"
                  options={clientOptions}
                  placeholder="Selecciona un cliente"
                  showValue
                />
                <MyGPCombo
                  value={phaseValue}
                  setValue={setPhaseValue}
                  label="Etapa Actual"
                  placeholder="Selecciona la etapa actual"
                  options={phasesOptions}
                />
                <div className="flex items-end h-full w-full">
                  <MyGPButtonPrimary
                    className="cursor-pointer h-9 px-3 w-[150px]"
                    onClick={() => {
                      setClientValue('');
                      setCustomValue('');
                      setPhaseValue('');
                      setKamValue('');
                    }}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <X className="h-4 w-4 shrink-0" />
                      <span className="truncate">Borrar filtros</span>
                    </span>
                  </MyGPButtonPrimary>
                </div>
              </>
            )}
          </div>
          <Card className="mb-8 p-4">
            <div className="w-[300px]">
              {!isAuthLoading && (isAdmin || hasTrafficPerm || isTraffic || isTrafficAdmin) && (
                <MyGPTabs
                  defaultValue="all"
                  tabs={[
                    { value: 'all', label: 'Todas' },
                    { value: 'open', label: 'Abiertas' },
                    { value: 'closed', label: 'Despachadas' },
                  ]}
                  value={tabValue}
                  onValueChange={(v) => isTabValue(v) && setTabValue(v)}
                />
              )}
            </div>
            <DailyTrackingContext.Provider
              value={{ initialDate, finalDate, dailyTrackingData, setDailyTrackingData }}
            >
              <DailyTrackingDataTable filterValues={filterValues} />
            </DailyTrackingContext.Provider>
          </Card>
        </>
      )}
      <PieChartLabelList />;
    </div>
  );
}
