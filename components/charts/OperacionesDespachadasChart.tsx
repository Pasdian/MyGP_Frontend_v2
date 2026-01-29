'use client';

import React from 'react';
import useSWR from 'swr';
import { TrendingUp } from 'lucide-react';
import { AreaChart, CartesianGrid, Line, Area, XAxis, YAxis } from 'recharts';
import { startOfDay, format, addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';

import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import MyGPCalendar from '../MyGPUI/Datepickers/MyGPCalendar';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { useCompanies } from '@/hooks/useCompanies';
import { ClientsMap, getClientsMap } from '@/lib/clients/clientsData';

export const description = 'Operaciones despachadas';

type Granularity = 'day' | 'week' | 'month' | 'year';
type ViewAs = 'auto' | 'day' | 'month' | 'year';
type PresetKey =
  | 'lastWeek'
  | 'lastMonth'
  | 'last3Months'
  | 'lastYear'
  | 'last5Years'
  | 'last10Years'
  | 'custom';

type OperacionesDespachadasRow = {
  PERIOD_START: string;
  TOTAL: number;
  fill?: string;
};

type ChartPoint = {
  PERIOD_START: string;
  TOTAL: number;
  AVG3: number;
};

const chartConfig = {
  TOTAL: { label: 'Operaciones', color: '#2563eb' },
  AVG3: { label: 'Promedio', color: '#60a5fa' },
} satisfies ChartConfig;

function toDate(d: string) {
  return parseISO(d);
}

function formatBucketLabel(periodStart: string, g: Granularity) {
  const start = toDate(periodStart);

  if (g === 'day') return format(start, 'dd MMM', { locale: es });

  if (g === 'week') {
    const end = addDays(start, 6);
    return `${format(start, 'dd MMM', { locale: es })} - ${format(end, 'dd MMM yyyy', { locale: es })}`;
  }

  if (g === 'month') return format(start, 'MMM yy', { locale: es });

  return format(start, 'yyyy', { locale: es });
}

function formatWeekTick(periodStart: string) {
  const start = toDate(periodStart);
  const weekNum = format(start, 'II', { locale: es });
  const year = format(start, 'yyyy', { locale: es });
  return `W${weekNum} ${year}`;
}

function addMovingAvg(data: OperacionesDespachadasRow[], windowSize = 3): ChartPoint[] {
  return data.map((d, i) => {
    const start = Math.max(0, i - (windowSize - 1));
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((acc, x) => acc + (Number(x.TOTAL) || 0), 0) / (slice.length || 1);

    return {
      PERIOD_START: d.PERIOD_START,
      TOTAL: Number(d.TOTAL) || 0,
      AVG3: Math.round(avg),
    };
  });
}

function endpointForGranularity(g: Granularity) {
  switch (g) {
    case 'day':
      return '/api/bi/getOperacionesDespachadasDay';
    case 'week':
      return '/api/bi/getOperacionesDespachadasWeek';
    case 'month':
      return '/api/bi/getOperacionesDespachadasMonth';
    case 'year':
      return '/api/bi/getOperacionesDespachadasYear';
  }
}

function normalizeIsoDate(d: Date | undefined) {
  if (!d) return '';
  return format(startOfDay(d), 'yyyy-MM-dd');
}

function makePresetRange(daysInclusive: number, baseDate: Date): DateRange {
  const to = startOfDay(baseDate);
  const from = addDays(to, -(daysInclusive - 1));
  return { from, to };
}

function deriveGranularity(range: DateRange | undefined): Granularity {
  const from = range?.from;
  const to = range?.to;
  if (!from || !to) return 'day';

  const fromDay = startOfDay(from);
  const toDay = startOfDay(to);

  const days = Math.max(1, differenceInCalendarDays(toDay, fromDay) + 1);

  if (days <= 70) return 'day';
  if (days <= 180) return 'week';
  if (days <= 730) return 'month';
  return 'year';
}

function periodLabel(g: Granularity) {
  switch (g) {
    case 'day':
      return 'día';
    case 'week':
      return 'semana';
    case 'month':
      return 'mes';
    case 'year':
      return 'año';
  }
}

function periodArticle(g: Granularity) {
  return g === 'week' ? 'La' : 'El';
}

export function OperacionesDespachadasChart() {
  const [preset, setPreset] = React.useState<PresetKey>('last3Months');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  const { rows: companies } = useCompanies();
  const [viewAs, setViewAs] = React.useState<ViewAs>('day');
  const [clientNumber, setClientNumber] = React.useState<string>('');
  const [clientsMap, setClientsMap] = React.useState<ClientsMap>({});

  React.useEffect(() => {
    getClientsMap().then(setClientsMap);
  }, []);

  React.useEffect(() => {
    // Solo en cliente: aquí sí puedes usar new Date()
    setDateRange(makePresetRange(90, new Date()));
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

  const granularity: Granularity = React.useMemo(() => {
    if (viewAs !== 'auto') return viewAs;
    return deriveGranularity(dateRange);
  }, [dateRange, viewAs]);

  const from = normalizeIsoDate(dateRange?.from);
  const to = normalizeIsoDate(dateRange?.to);

  const endpoint = endpointForGranularity(granularity);
  const swrKey =
    from && to
      ? `${endpoint}?initialDate=${from}&finalDate=${to}${
          clientNumber ? `&cveImpo=${encodeURIComponent(clientNumber)}` : ''
        }`
      : null;
  const { data: raw } = useSWR<OperacionesDespachadasRow[]>(swrKey, axiosFetcher);

  const baseData = React.useMemo<OperacionesDespachadasRow[]>(() => {
    if (!Array.isArray(raw)) return [];

    return raw
      .map((r) => ({
        PERIOD_START: String((r as any).PERIOD_START ?? ''),
        TOTAL: Number((r as any).TOTAL) || 0,
        fill: (r as any).fill,
      }))
      .filter((r) => r.PERIOD_START)
      .sort((a, b) => toDate(a.PERIOD_START).getTime() - toDate(b.PERIOD_START).getTime());
  }, [raw]);

  const avgWindow = React.useMemo(() => {
    if (granularity === 'day') return 7;
    if (granularity === 'week') return 4;
    return 3;
  }, [granularity]);

  const chartData = React.useMemo<ChartPoint[]>(
    () => addMovingAvg(baseData, avgWindow),
    [baseData, avgWindow]
  );

  const hideXAxis = React.useMemo(() => {
    return granularity === 'day' && chartData.length >= 60;
  }, [chartData.length, granularity]);

  const totalOperations = React.useMemo(() => {
    return baseData.reduce((acc, cur) => acc + (cur.TOTAL || 0), 0) || 0;
  }, [baseData]);

  const tickInterval = React.useMemo(() => {
    const n = chartData.length;

    if (granularity === 'day') {
      if (n <= 14) return 0;
      if (n <= 31) return 1;
      if (n <= 62) return 6;
      return 13;
    }

    if (granularity === 'week') {
      if (n <= 12) return 0;
      if (n <= 24) return 1;
      if (n <= 52) return 3;
      return 7;
    }

    if (granularity === 'month') {
      if (n <= 12) return 0;
      if (n <= 24) return 1;
      return 4;
    }

    return 0;
  }, [chartData.length, granularity]);

  const maxPoint = React.useMemo(() => {
    if (baseData.length === 0) return null;
    return baseData.reduce((best, cur) => (cur.TOTAL > best.TOTAL ? cur : best), baseData[0]);
  }, [baseData]);

  const maxPointLabel = React.useMemo(() => {
    if (!maxPoint) return '';
    return formatBucketLabel(maxPoint.PERIOD_START, granularity);
  }, [maxPoint, granularity]);

  const companiesOptions = React.useMemo(() => {
    return companies.map((company) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companies]);

  const isWeeklyBuckets = granularity === 'week';
  return (
    <div className="h-full w-full">
      <div className="grid grid-cols-1 gap-4">
        <Card className="flex h-full flex-col">
          <CardHeader className="items-start">
            <CardTitle>
              <div className="mb-2 flex flex-col gap-2">
                {clientNumber ? (
                  <div className="mb-2 flex flex-col gap-2">
                    <p className="text-xl">Operaciones Despachadas</p>
                    <p className="font-light">
                      {clientNumber} {clientsMap[clientNumber]}
                    </p>
                  </div>
                ) : (
                  <p className="text-xl">Operaciones Despachadas en AAP</p>
                )}
                <p className="font-extralight text-slate-500">
                  {from && to ? `${from} - ${to}` : 'Selecciona un período para visualizar.'}
                </p>
              </div>
            </CardTitle>
            <div className="max-w-[500px]">
              <MyGPCombo
                options={companiesOptions}
                value={clientNumber}
                setValue={setClientNumber}
                label="Cliente:"
                placeholder="Selecciona un cliente"
                showValue
              />
            </div>
            <div className="flex w-full flex-wrap items-end gap-3">
              {/* Presets */}
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

              {/* View as */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-600">Ver como</Label>

                <Select value={viewAs} onValueChange={(value) => setViewAs(value as ViewAs)}>
                  <SelectTrigger className="w-full max-w-48">
                    <SelectValue placeholder="Selecciona vista" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="day">Días</SelectItem>
                      <SelectItem value="month">Meses</SelectItem>
                      <SelectItem value="year">Años</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 items-center justify-center">
            {from && to ? (
              chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto w-full md:h-[420px]">
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 12, right: 28, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid vertical={false} />

                    {!hideXAxis && (
                      <XAxis
                        dataKey="PERIOD_START"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        interval={tickInterval}
                        padding={{ left: 8, right: 14 }}
                        angle={isWeeklyBuckets ? -35 : 0}
                        textAnchor={isWeeklyBuckets ? 'end' : 'middle'}
                        {...(isWeeklyBuckets ? { height: 50 } : {})}
                        tickFormatter={(v) => {
                          const s = String(v);
                          if (granularity === 'week') return formatWeekTick(s);
                          return formatBucketLabel(s, granularity);
                        }}
                      />
                    )}

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      allowDecimals={false}
                      tickFormatter={(v) => Number(v).toLocaleString()}
                    />

                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;

                        const p = payload[0].payload as ChartPoint;
                        const total = Number(p.TOTAL) || 0;
                        const label = formatBucketLabel(p.PERIOD_START, granularity);

                        const prefix =
                          granularity === 'day'
                            ? 'Día'
                            : granularity === 'week'
                              ? 'Semana'
                              : granularity === 'month'
                                ? 'Mes'
                                : 'Año';

                        return (
                          <div className="rounded-md border bg-background px-3 py-2 text-sm shadow">
                            <div className="font-medium">{`${prefix}: ${label}`}</div>
                            <div className="mt-1 flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Operaciones</span>
                                <span className="font-medium">{total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="TOTAL"
                      stroke="var(--color-TOTAL)"
                      fill="var(--color-TOTAL)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="AVG3"
                      stroke="var(--color-AVG3)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
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
            {maxPoint && maxPoint.TOTAL !== 0 && (
              <div className="flex items-center gap-1 leading-none">
                <p className="font-medium">
                  {`${periodArticle(granularity)} ${periodLabel(granularity)} con más operaciones fue ${maxPointLabel} con ${maxPoint.TOTAL.toLocaleString()} operaciones`}
                </p>
                <TrendingUp className="h-4 w-4" />
              </div>
            )}

            {totalOperations !== 0 && baseData.length > 0 && (
              <div className="flex items-center gap-1 leading-none">
                <p className="font-medium">Total de operaciones:</p>
                <p>{totalOperations.toLocaleString()}</p>
                <TrendingUp className="h-4 w-4" />
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
