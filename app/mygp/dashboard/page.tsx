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
  const [formattedDates, setFormattedDates] = React.useState<{
    initialDate?: string;
    finalDate?: string;
  }>({});

  const [filterValues, setFilterValues] = React.useState<{
    kam?: string;
    custom?: string;
    phase?: string;
    client?: string;
    tab?: string;
  }>({});

  const dailyTrackingKey =
    formattedDates.initialDate &&
    formattedDates.finalDate &&
    `/api/daily-tracking?initialDate=${formattedDates.initialDate}&finalDate=${formattedDates.finalDate}`;

  const { data: dailyTrackingData, isLoading: isDailyTrackingDataLoading } =
    useSWRImmutable<DailyTracking>(dailyTrackingKey, axiosFetcher);

  const kamsOptions = React.useMemo(
    () =>
      dailyTrackingData?.kams?.map((item) => ({
        value: item,
        label: item,
      })) || [],
    [dailyTrackingData]
  );

  const customsOptions = React.useMemo(() => {
    return (
      dailyTrackingData?.customs?.map((item) => {
        const custom = customs.find((c) => c.key === item);
        return {
          value: item, // link to custom.key
          label: `${item} - ${custom?.name || 'Sin registro'}`, // show code - name
        };
      }) || []
    );
  }, [dailyTrackingData]);

  const clientOptions = React.useMemo(
    () =>
      dailyTrackingData?.clients?.map((item) => ({
        value: item,
        label: item,
      })) || [],
    [dailyTrackingData]
  );

  const phaseNameByCode = React.useMemo(() => {
    const map = new Map<string, string>();
    dailyTrackingData?.data?.forEach((row) => {
      if (row.CURRENT_PHASE_CODE && row.CURRENT_PHASE) {
        // keep the first seen name for a code
        if (!map.has(row.CURRENT_PHASE_CODE)) {
          map.set(row.CURRENT_PHASE_CODE, row.CURRENT_PHASE);
        }
      }
    });
    return map;
  }, [dailyTrackingData?.data]);

  const phasesOptions = React.useMemo(() => {
    const phases = dailyTrackingData?.phases ?? [];
    return phases.map((code) => {
      const name = phaseNameByCode.get(code) ?? 'Sin nombre';
      return {
        value: code,
        label: `${code} - ${name}`,
      };
    });
  }, [dailyTrackingData?.phases, phaseNameByCode]);

  React.useEffect(() => {
    setFormattedDates({
      initialDate: toYMD(initialDate),
      finalDate: toYMD(finalDate),
    });
  }, [initialDate, finalDate]);

  React.useEffect(() => {
    setFilterValues({
      kam: kamValue,
      custom: customValue,
      phase: phaseValue,
      client: clientValue,
      tab: tabValue,
    });
  }, [kamValue, customValue, phaseValue, clientValue, tabValue]);
  console.log(isTraffic);
  return (
    <div className="h-full overflow-y-scroll p-2">
      {(isTraffic || isAdmin) && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start mb-4">
            <MyGPDatePicker date={initialDate} setDate={setInitialDate} label="Fecha de Inicio" />
            <MyGPDatePicker date={finalDate} setDate={setFinalDate} label="Fecha de Termino" />

            {!isAuthLoading && !isDailyTrackingDataLoading && (
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
