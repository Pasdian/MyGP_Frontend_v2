'use client';

import React from 'react';
import useSWR from 'swr';
import { TrendingUp } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { startOfDay, format, addDays } from 'date-fns';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { useCompanies } from '@/hooks/useCompanies';
import { DateRange } from 'react-day-picker';
import MyGPCalendar from '../MyGPUI/Datepickers/MyGPCalendar';
import { ClientsMap, getClientsMap } from '@/lib/clients/clientsData';

import { Button } from '../ui/button';

type ChartConfig = Record<string, { label: string | undefined }>;
export const description = 'Operaciones por Aduana';

type PresetKey =
  | 'lastWeek'
  | 'lastMonth'
  | 'last3Months'
  | 'lastYear'
  | 'last5Years'
  | 'last10Years'
  | 'custom';

function makePresetRange(daysInclusive: number, baseDate: Date): DateRange {
  const to = startOfDay(baseDate);
  const from = addDays(to, -(daysInclusive - 1));
  return { from, to };
}

// Expected API shape (after backend enrichment)
type OperationsByCustomsRow = {
  CUSTOMS: string;
  OPERATIONS: number;
  fill?: string;
  CUSTOMS_LABEL?: string;
};

export default function OperacionesPorAduanaChart() {
  const [preset, setPreset] = React.useState<PresetKey>('lastMonth');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [clientsMap, setClientsMap] = React.useState<ClientsMap>({});

  React.useEffect(() => {
    getClientsMap().then(setClientsMap);
  }, []);

  const [clientNumber, setClientNumber] = React.useState<string>('');

  const { rows: companies } = useCompanies();

  const companiesOptions = React.useMemo(() => {
    return companies.map((company) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companies]);

  React.useEffect(() => {
    setDateRange(makePresetRange(30, new Date()));
  }, []);

  React.useEffect(() => {
    if (preset === 'custom') return;
    const base = new Date();

    if (preset === 'lastWeek') setDateRange(makePresetRange(7, base));
    if (preset === 'lastMonth') setDateRange(makePresetRange(30, base));
    if (preset === 'last3Months') setDateRange(makePresetRange(90, base));
    if (preset === 'lastYear') setDateRange(makePresetRange(365, base));
    if (preset === 'last5Years') setDateRange(makePresetRange(365 * 5, base));
    if (preset === 'last10Years') setDateRange(makePresetRange(365 * 10, base));
  }, [preset]);

  const from = dateRange?.from ? format(startOfDay(dateRange.from), 'yyyy-MM-dd') : '';
  const to = dateRange?.to ? format(startOfDay(dateRange.to), 'yyyy-MM-dd') : '';

  const swrKey = React.useMemo(() => {
    if (!from || !to) return null;

    const params = new URLSearchParams({
      initialDate: from,
      finalDate: to,
    });

    if (clientNumber) {
      params.set('client', clientNumber);
    }

    return `/api/bi/getOperationsDistributionByCustoms?${params.toString()}`;
  }, [from, to, clientNumber]);

  const { data: chartDataRaw } = useSWR<OperationsByCustomsRow[]>(swrKey, axiosFetcher);

  const chartData: OperationsByCustomsRow[] = React.useMemo(() => {
    if (!Array.isArray(chartDataRaw)) return [];
    return chartDataRaw.map((r) => ({
      ...r,
      OPERATIONS: Number(r.OPERATIONS) || 0,
      CUSTOMS: String(r.CUSTOMS ?? ''),
    }));
  }, [chartDataRaw]);

  const maxOperationValue = React.useMemo(() => {
    return chartData.reduce((acc, cur) => Math.max(acc, cur.OPERATIONS || 0), 0) || 0;
  }, [chartData]);

  const totalOperations = React.useMemo(() => {
    return chartData.reduce((acc, cur) => acc + (cur.OPERATIONS || 0), 0) || 0;
  }, [chartData]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const cfg: ChartConfig = { OPERATIONS: { label: 'Operaciones: ' } };

    if (chartData.length === 0) return cfg;

    chartData.forEach((item) => {
      const curValue = item.OPERATIONS || 0;

      if (maxOperationValue > 0 && curValue >= maxOperationValue * 0.05) {
        cfg[item.CUSTOMS] = {
          label: item.CUSTOMS_LABEL ?? item.CUSTOMS,
        };
      }
    });

    return cfg;
  }, [chartData, maxOperationValue]);

  return (
    <div className="h-full w-full">
      <div className="grid grid-cols-1 gap-4">
        <Card className="flex h-full flex-col">
          <CardHeader className="items-start">
            <CardTitle>
              <div className="mb-2 flex flex-col gap-2">
                {clientNumber ? (
                  <div className="mb-2 flex flex-col gap-2">
                    <p className="text-xl">Operaciones por Aduana</p>
                    <p className="font-light">
                      {clientNumber} {clientsMap[clientNumber]}
                    </p>
                  </div>
                ) : (
                  <p className="text-xl">Operaciones por Aduana en AAP</p>
                )}

                <p className="font-extralight text-slate-500">
                  {dateRange?.from && dateRange?.to
                    ? `${formatISOtoDDMMYYYY(dateRange.from.toISOString())} - ${formatISOtoDDMMYYYY(
                        dateRange.to.toISOString()
                      )}`
                    : 'Selecciona un período para visualizar.'}
                </p>
              </div>
            </CardTitle>

            <div className="flex gap-2 max-w-[500px] items-end mb-4">
              <MyGPCombo
                options={companiesOptions}
                value={clientNumber}
                setValue={setClientNumber}
                label="Cliente:"
                placeholder="Selecciona un cliente"
                showValue
              />
              <Button
                onClick={() => {
                  setClientNumber('');
                  setPreset('last3Months');
                }}
              >
                Limpiar Filtros
              </Button>
            </div>

            {/* Presets + Calendar (solo custom) */}
            <div className="flex w-full flex-wrap items-end gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={preset === 'lastWeek' ? 'default' : 'outline'}
                  onClick={() => setPreset('lastWeek')}
                  className="h-9"
                >
                  Última semana
                </Button>

                <Button
                  type="button"
                  variant={preset === 'lastMonth' ? 'default' : 'outline'}
                  onClick={() => setPreset('lastMonth')}
                  className="h-9"
                >
                  Último mes
                </Button>

                <Button
                  type="button"
                  variant={preset === 'last3Months' ? 'default' : 'outline'}
                  onClick={() => setPreset('last3Months')}
                  className="h-9"
                >
                  Últimos 3 meses
                </Button>

                <Button
                  type="button"
                  variant={preset === 'lastYear' ? 'default' : 'outline'}
                  onClick={() => setPreset('lastYear')}
                  className="h-9"
                >
                  Último año
                </Button>

                <Button
                  type="button"
                  variant={preset === 'last5Years' ? 'default' : 'outline'}
                  onClick={() => setPreset('last5Years')}
                  className="h-9"
                >
                  Últimos 5 años
                </Button>

                <Button
                  type="button"
                  variant={preset === 'last10Years' ? 'default' : 'outline'}
                  onClick={() => setPreset('last10Years')}
                  className="h-9"
                >
                  Últimos 10 años
                </Button>

                <Button
                  type="button"
                  variant={preset === 'custom' ? 'default' : 'outline'}
                  onClick={() => setPreset('custom')}
                  className="h-9"
                >
                  Personalizado
                </Button>
              </div>

              {preset === 'custom' && (
                <div className="mt-2">
                  <MyGPCalendar
                    dateRange={dateRange}
                    setDateRange={(r) => {
                      setPreset('custom');
                      setDateRange(r);
                    }}
                    label="Rango personalizado:"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 items-center justify-center">
            {from && to ? (
              chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto w-full md:h-[420px]">
                  <ResponsiveContainer width="100%" height={420}>
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="OPERATIONS" />} />

                      <Pie
                        data={chartData}
                        dataKey="OPERATIONS"
                        nameKey="CUSTOMS"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        label={(entry) =>
                          `${chartConfig[entry.CUSTOMS]?.label ?? entry.CUSTOMS}: ${entry.OPERATIONS}`
                        }
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground">No hay datos para mostrar.</div>
              )
            ) : (
              <div className="text-sm text-muted-foreground">
                Selecciona un período para visualizar.
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2 text-sm">
            {maxOperationValue !== 0 && chartData.length > 0 && (
              <div className="flex items-center gap-1 leading-none text-xs text-slate-500">
                <p className="font-medium">Máximo número de operaciones fue:</p>
                <p>{maxOperationValue}</p>
                <TrendingUp className="h-4 w-4" />
              </div>
            )}
            {totalOperations !== 0 && chartData.length > 0 && (
              <div className="flex items-center gap-1 leading-none text-xs text-slate-500">
                <p className="font-medium">Total de operaciones:</p>
                <p>{totalOperations}</p>
                <TrendingUp className="h-4 w-4" />
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
