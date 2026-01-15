'use client';
import PieChartLabelList from '@/components/charts/PieChartLabelList';
import React from 'react';
import { Card } from '@/components/ui/card';
import { DailyTrackingDataTable } from '@/components/datatables/dashboard/DailyTrackingDataTable';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { useAuth } from '@/hooks/useAuth';
import useSWR from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { customs } from '@/lib/customs/customs';
import { X } from 'lucide-react';
import { useDailyTracking } from '@/hooks/useDailyTracking';
import { DailyTrackingContext } from '@/contexts/DailyTrackingContext';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';
import { MyGPTabs } from '@/components/MyGPUI/Tabs/MyGPTabs';
import MyGPCalendar from '@/components/MyGPUI/Datepickers/MyGPCalendar';
import { DateRange } from 'react-day-picker';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';

const TAB_VALUES = ['all', 'open', 'closed'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}

function getDefaultDashboardRanges(): {
  fechaEntradaRange: DateRange;
  MSARange: DateRange | undefined;
} {
  const today = new Date();
  const lastMonthSameDay = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  return {
    fechaEntradaRange: { from: lastMonthSameDay, to: today },
    MSARange: undefined,
  };
}

export default function Dashboard() {
  const { isLoading: isAuthLoading } = useAuth();

  const [dates, setDates] = React.useState<{
    fechaEntradaRange: DateRange | undefined;
    MSARange: DateRange | undefined;
  }>(() => getDefaultDashboardRanges());

  const [metaState, setMetaState] = React.useState({
    casaId: '',
    customValue: '',
    clientValue: '',
    currentPhaseValue: '',
    tabValue: 'all' as TabValue,
  });

  const { data: meta } = useSWR<
    | {
        kam: { KAM: string; CASA_ID: string }[];
        customs: string[];
        phases: { CURRENT_PHASE: string; CURRENT_PHASE_CODE: string }[];
        clients: { CVE_IMPO: string; CLIENT_NAME: string }[];
      }
    | undefined
  >('/api/daily-tracking/meta', axiosFetcher);

  const {
    records: dailyTrackingData,
    setRecords: setDailyTrackingData,
    loading: isLoading,
  } = useDailyTracking(dates);

  const kamsOptions = React.useMemo(
    () =>
      meta?.kam?.map((item) => ({
        value: item.CASA_ID,
        label: item.KAM,
      })) || [],
    [meta]
  );

  const customsOptions = React.useMemo(() => {
    return (
      meta?.customs?.map((item) => {
        const custom = customs.find((c) => c.key === item);
        return {
          value: item,
          label: `${item} - ${custom?.name || 'Sin registro'}`,
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
        value: phase.CURRENT_PHASE_CODE,
        label: phase.CURRENT_PHASE,
      })) || [],
    [meta]
  );

  return (
    <div>
      <PermissionGuard requiredPermissions={[PERM.DASHBOARD_TRAFICO]}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start mb-4">
          <MyGPCalendar
            dateRange={dates.fechaEntradaRange}
            setDateRange={(value) => setDates((prev) => ({ ...prev, fechaEntradaRange: value }))}
            label="Fecha de Entrada"
          />
          <MyGPCalendar
            dateRange={dates.MSARange}
            setDateRange={(value) => setDates((prev) => ({ ...prev, MSARange: value }))}
            label="MSA"
          />

          {!isAuthLoading && (
            <>
              <PermissionGuard requiredPermissions={[PERM.DASHBOARD_TRAFICO_ADMIN]}>
                <MyGPCombo
                  value={metaState.casaId}
                  setValue={(newValue) => setMetaState((prev) => ({ ...prev, casaId: newValue }))}
                  label="Ejecutivo"
                  options={kamsOptions}
                  placeholder="Selecciona un ejecutivo"
                  showValue
                />
              </PermissionGuard>

              <MyGPCombo
                value={metaState.customValue}
                setValue={(newValue) =>
                  setMetaState((prev) => ({ ...prev, customValue: newValue }))
                }
                label="Aduana"
                options={customsOptions}
                placeholder="Selecciona una aduana"
              />

              <MyGPCombo
                value={metaState.clientValue}
                setValue={(newValue) =>
                  setMetaState((prev) => ({ ...prev, clientValue: newValue }))
                }
                label="Cliente"
                options={clientOptions}
                placeholder="Selecciona un cliente"
                showValue
              />

              <MyGPCombo
                value={metaState.currentPhaseValue}
                setValue={(newValue) =>
                  setMetaState((prev) => ({ ...prev, currentPhaseValue: newValue }))
                }
                label="Etapa Actual"
                placeholder="Selecciona la etapa actual"
                options={phasesOptions}
                showValue
              />

              <div className="flex items-end h-full w-full">
                <MyGPButtonPrimary
                  className="cursor-pointer h-9 px-3 w-[150px]"
                  onClick={() => {
                    setMetaState({
                      casaId: '',
                      clientValue: '',
                      customValue: '',
                      currentPhaseValue: '',
                      tabValue: 'all',
                    });
                    setDates({
                      fechaEntradaRange: undefined,
                      MSARange: undefined,
                    });

                    setDates(getDefaultDashboardRanges());
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
            <MyGPTabs
              defaultValue="all"
              tabs={[
                { value: 'all', label: 'Todas' },
                { value: 'open', label: 'Abiertas' },
                { value: 'closed', label: 'Despachadas' },
              ]}
              value={metaState.tabValue}
              onValueChange={(v) =>
                isTabValue(v) && setMetaState((prev) => ({ ...prev, tabValue: v }))
              }
            />
          </div>
          <DailyTrackingContext.Provider
            value={{
              dates,
              dailyTrackingData,
              setDailyTrackingData,
              isLoading,
            }}
          >
            <DailyTrackingDataTable metaState={metaState} />
          </DailyTrackingContext.Provider>
        </Card>
      </PermissionGuard>
      <div className="mb-4">
        <PieChartLabelList />
      </div>
    </div>
  );
}
