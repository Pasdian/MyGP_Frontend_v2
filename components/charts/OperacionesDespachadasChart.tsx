'use client';

import React from 'react';
import useSWR from 'swr';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, Area, XAxis, YAxis, ComposedChart } from 'recharts';
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
import { MyGPComboMulti } from '../MyGPUI/Combobox/MyGPComboMulti';
import { useCompanies } from '@/hooks/useCompanies';
import { ClientsMap, getClientsMap } from '@/lib/clients/clientsData';

export const description = 'Operaciones despachadas';

type Granularity = 'day' | 'week' | 'month' | 'year';
type ViewAs = 'auto' | 'day' | 'week' | 'month' | 'year';

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

type ChartPointMulti = {
  PERIOD_START: string;
  TREND_TOTAL: number;
} & Record<Exclude<string, 'PERIOD_START' | 'TREND_TOTAL'>, number>;

const OPERACIONES_ENDPOINT = '/api/bi/getOperacionesDespachadas';

function toDate(d: string) {
  return parseISO(d);
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

function formatBucketLabel(periodStart: string, g: Granularity) {
  const start = toDate(periodStart);

  if (g === 'day') return format(start, 'dd MMM', { locale: es });

  if (g === 'week') {
    const end = addDays(start, 6);
    return `${format(start, 'dd MMM', { locale: es })} - ${format(end, 'dd MMM yyyy', {
      locale: es,
    })}`;
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

function normalizeRows(rows: OperacionesDespachadasRow[]) {
  return rows
    .map((r) => ({
      PERIOD_START: String((r as any).PERIOD_START ?? ''),
      TOTAL: Number((r as any).TOTAL) || 0,
    }))
    .filter((r) => r.PERIOD_START)
    .sort((a, b) => parseISO(a.PERIOD_START).getTime() - parseISO(b.PERIOD_START).getTime());
}

function addLinearRegression(
  data: OperacionesDespachadasRow[],
  minForTrend = 1
): {
  series: { PERIOD_START: string; TOTAL: number; TREND: number }[];
  slopePerDay: number;
  intercept: number;
  r2: number;
} {
  const seriesBase = data.map((d) => ({
    PERIOD_START: d.PERIOD_START,
    TOTAL: Number(d.TOTAL) || 0,
  }));

  const pts = seriesBase
    .map((p) => ({
      x: parseISO(p.PERIOD_START).getTime(),
      y: p.TOTAL,
      PERIOD_START: p.PERIOD_START,
    }))
    .filter((p) => p.y >= minForTrend);

  if (pts.length < 2) {
    return {
      series: seriesBase.map((p) => ({ ...p, TREND: p.TOTAL })),
      slopePerDay: 0,
      intercept: 0,
      r2: 0,
    };
  }

  const n = pts.length;
  const sumX = pts.reduce((a, p) => a + p.x, 0);
  const sumY = pts.reduce((a, p) => a + p.y, 0);
  const sumXX = pts.reduce((a, p) => a + p.x * p.x, 0);
  const sumXY = pts.reduce((a, p) => a + p.x * p.y, 0);

  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom; // y per ms
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTot = pts.reduce((a, p) => a + (p.y - meanY) ** 2, 0);
  const ssRes = pts.reduce((a, p) => {
    const yHat = intercept + slope * p.x;
    return a + (p.y - yHat) ** 2;
  }, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  const series = seriesBase.map((p) => {
    const x = parseISO(p.PERIOD_START).getTime();
    const yHat = intercept + slope * x;
    return {
      PERIOD_START: p.PERIOD_START,
      TOTAL: p.TOTAL,
      TREND: Math.max(0, Math.round(yHat)),
    };
  });

  const slopePerDay = slope * 86_400_000;
  return { series, slopePerDay, intercept, r2 };
}

type MultiClientResponse = Record<string, OperacionesDespachadasRow[]>;

function buildSWRKeyMulti(params: {
  granularity: Granularity;
  from: string;
  to: string;
  clients: string[];
}) {
  const clientsSorted = [...params.clients].sort().join(',');
  return `operaciones_multi:${params.granularity}:${params.from}:${params.to}:${clientsSorted || 'ALL'}`;
}

async function fetchMultiClientSeries(args: {
  from: string;
  to: string;
  granularity: Granularity;
  clients: string[];
}): Promise<MultiClientResponse> {
  const { from, to, granularity, clients } = args;

  if (!clients.length) {
    const url = `${OPERACIONES_ENDPOINT}?granularity=${granularity}&initialDate=${from}&finalDate=${to}`;
    const rows = (await axiosFetcher(url)) as OperacionesDespachadasRow[];
    return { ALL: Array.isArray(rows) ? rows : [] };
  }

  const results = await Promise.all(
    clients.map(async (cve) => {
      const url = `${OPERACIONES_ENDPOINT}?granularity=${granularity}&initialDate=${from}&finalDate=${to}&cveImpo=${encodeURIComponent(
        cve
      )}`;
      const rows = (await axiosFetcher(url)) as OperacionesDespachadasRow[];
      return [cve, Array.isArray(rows) ? rows : []] as const;
    })
  );

  return Object.fromEntries(results);
}

function clientLabel(cve: string, clientsMap: ClientsMap) {
  return cve === 'ALL' ? 'AAP' : `${cve} ${clientsMap[cve] ?? ''}`.trim();
}

function mergeSeriesToChartData(seriesByClient: MultiClientResponse, clientKeys: string[]) {
  const allDates = new Set<string>();

  const perClientMaps = new Map<string, Map<string, number>>();
  for (const c of clientKeys) {
    const rows = normalizeRows(seriesByClient[c] ?? []);
    const m = new Map<string, number>();
    for (const r of rows) {
      allDates.add(r.PERIOD_START);
      m.set(r.PERIOD_START, r.TOTAL);
    }
    perClientMaps.set(c, m);
  }

  const dates = Array.from(allDates).sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime());

  // Base combined points: one value series per client (CLI_*)
  const combined: ChartPointMulti[] = dates.map((d) => {
    const p: ChartPointMulti = { PERIOD_START: d, TREND_TOTAL: 0 } as ChartPointMulti;
    for (const c of clientKeys) {
      const cliKey = c === 'ALL' ? 'CLI_ALL' : `CLI_${c}`;
      p[cliKey] = perClientMaps.get(c)?.get(d) ?? 0;
    }
    return p;
  });

  // Total series for total trend
  const totalSeries: OperacionesDespachadasRow[] = combined.map((p) => {
    const total = clientKeys.reduce((acc, c) => {
      const cliKey = c === 'ALL' ? 'CLI_ALL' : `CLI_${c}`;
      return acc + (Number(p[cliKey] ?? 0) || 0);
    }, 0);
    return { PERIOD_START: p.PERIOD_START, TOTAL: total };
  });

  const { series: totalWithTrend } = addLinearRegression(totalSeries, 1);

  // Client trend series: TREND_<client> for each client
  const clientTrendByKey: Record<string, { PERIOD_START: string; TREND: number }[]> = {};
  for (const c of clientKeys) {
    const cliKey = c === 'ALL' ? 'CLI_ALL' : `CLI_${c}`;
    const rowsForClient: OperacionesDespachadasRow[] = dates.map((d) => ({
      PERIOD_START: d,
      TOTAL: Number(perClientMaps.get(c)?.get(d) ?? 0) || 0,
    }));
    const { series } = addLinearRegression(rowsForClient, 1);
    clientTrendByKey[cliKey] = series.map((s) => ({
      PERIOD_START: s.PERIOD_START,
      TREND: s.TREND,
    }));
  }

  // Merge trend values into combined points
  const out: ChartPointMulti[] = combined.map((p, i) => {
    const next = {
      ...p,
      TREND_TOTAL: totalWithTrend[i]?.TREND ?? 0,
    } as ChartPointMulti;

    for (const c of clientKeys) {
      const cliKey = c === 'ALL' ? 'CLI_ALL' : `CLI_${c}`;
      const trendKey = cliKey === 'CLI_ALL' ? 'TREND_ALL' : `TREND_${c}`;
      next[trendKey] = clientTrendByKey[cliKey]?.[i]?.TREND ?? 0;
    }

    return next;
  });

  const totalOperations = totalSeries.reduce((acc, cur) => acc + (cur.TOTAL || 0), 0) || 0;

  const maxPoint =
    totalSeries.length === 0
      ? null
      : totalSeries.reduce((best, cur) => (cur.TOTAL > best.TOTAL ? cur : best), totalSeries[0]);

  return { chartData: out, totalSeries, totalOperations, maxPoint };
}

const PALETTE = [
  '#2563eb',
  '#16a34a',
  '#f97316',
  '#a855f7',
  '#06b6d4',
  '#e11d48',
  '#84cc16',
  '#f59e0b',
  '#0ea5e9',
  '#22c55e',
];

function colorForIndex(i: number) {
  return PALETTE[i % PALETTE.length];
}

export function OperacionesDespachadasChart() {
  const [preset, setPreset] = React.useState<PresetKey>('last3Months');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  const { rows: companies } = useCompanies();

  const [viewAs, setViewAs] = React.useState<ViewAs>('day');
  const [clientNumbers, setClientNumbers] = React.useState<string[]>([]);
  const [clientsMap, setClientsMap] = React.useState<ClientsMap>({});

  React.useEffect(() => {
    getClientsMap().then(setClientsMap);
  }, []);

  React.useEffect(() => {
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

  const companiesOptions = React.useMemo(() => {
    return companies.map((company) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companies]);

  const selectedClients = React.useMemo(() => {
    return Array.from(new Set((clientNumbers || []).filter(Boolean)));
  }, [clientNumbers]);

  const clientKeys = React.useMemo(() => {
    return selectedClients.length ? selectedClients : ['ALL'];
  }, [selectedClients]);

  const swrKey = React.useMemo(() => {
    if (!from || !to) return null;
    return buildSWRKeyMulti({ granularity, from, to, clients: selectedClients });
  }, [from, to, granularity, selectedClients]);

  const { data: seriesByClient } = useSWR<MultiClientResponse>(
    swrKey,
    () => fetchMultiClientSeries({ from, to, granularity, clients: selectedClients }),
    { revalidateOnFocus: false }
  );

  const { chartData, totalOperations, maxPoint } = React.useMemo(() => {
    if (!seriesByClient)
      return {
        chartData: [] as ChartPointMulti[],
        totalOperations: 0,
        maxPoint: null as OperacionesDespachadasRow | null,
      };
    return mergeSeriesToChartData(seriesByClient, clientKeys);
  }, [seriesByClient, clientKeys]);

  const hideXAxis = React.useMemo(() => {
    return granularity === 'day' && chartData.length >= 60;
  }, [chartData.length, granularity]);

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

  const isWeeklyBuckets = granularity === 'week';

  const maxPointLabel = React.useMemo(() => {
    if (!maxPoint) return '';
    return formatBucketLabel(maxPoint.PERIOD_START, granularity);
  }, [maxPoint, granularity]);

  const dynamicChartConfig = React.useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {
      TREND_TOTAL: { label: 'Tendencia (total)', color: '#ff2600' },
    };

    clientKeys.forEach((cve, idx) => {
      const cliKey = cve === 'ALL' ? 'CLI_ALL' : `CLI_${cve}`;
      cfg[cliKey] = {
        label: clientLabel(cve, clientsMap),
        color: colorForIndex(idx),
      };

      const trendKey = cve === 'ALL' ? 'TREND_ALL' : `TREND_${cve}`;
      cfg[trendKey] = {
        label: `Tendencia (${clientLabel(cve, clientsMap)})`,
        color: colorForIndex(idx),
      };
    });

    return cfg satisfies ChartConfig;
  }, [clientKeys, clientsMap]);

  return (
    <div className="h-full w-full">
      <div className="grid grid-cols-1 gap-4">
        <Card className="flex h-full flex-col">
          <CardHeader className="items-start">
            <CardTitle>
              <div className="mb-2 flex flex-col gap-2">
                <p className="text-xl">Operaciones Despachadas</p>
                <p className="font-extralight text-slate-500">
                  {from && to ? `${from} - ${to}` : 'Selecciona un período para visualizar.'}
                </p>
              </div>
            </CardTitle>

            <div className="flex items-end gap-2 max-w-[750px]">
              <MyGPComboMulti
                options={companiesOptions}
                values={clientNumbers}
                setValues={setClientNumbers}
                label="Clientes:"
                placeholder="Selecciona uno o varios clientes"
                showValue
                className="w-[420px]"
              />
              <Button
                onClick={() => {
                  setClientNumbers([]);
                  setPreset('last3Months');
                }}
              >
                Limpiar Filtros
              </Button>
            </div>

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
                      <SelectItem value="week">Semanas</SelectItem>
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
                <ChartContainer config={dynamicChartConfig} className="mx-auto h-[420px] w-full">
                  <ComposedChart
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

                        const p = payload[0].payload as ChartPointMulti;
                        const label = formatBucketLabel(p.PERIOD_START, granularity);

                        return (
                          <div className="rounded-md border bg-background px-3 py-2 text-sm shadow">
                            <div className="font-medium">{label}</div>

                            <div className="mt-2 flex flex-col gap-2">
                              {clientKeys.map((cve, idx) => {
                                const cliKey = cve === 'ALL' ? 'CLI_ALL' : `CLI_${cve}`;
                                const name = clientLabel(cve, clientsMap);
                                const color = colorForIndex(idx);

                                const val = Number((p as any)[cliKey] ?? 0);

                                return (
                                  <div key={cliKey} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="h-2.5 w-2.5 rounded-sm"
                                          style={{ backgroundColor: color }}
                                        />
                                        <span className="text-muted-foreground">{name}</span>
                                      </div>
                                      <span className="font-medium">{val.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }}
                    />
                    {clientKeys.map((cve, idx) => {
                      const cliKey = cve === 'ALL' ? 'CLI_ALL' : `CLI_${cve}`;
                      const color = colorForIndex(idx);

                      return (
                        <Area
                          key={cliKey}
                          type="monotone"
                          dataKey={cliKey}
                          stroke={color}
                          fill={color}
                          fillOpacity={0.15}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                      );
                    })}

                    {clientKeys.map((cve, idx) => {
                      const trendKey = cve === 'ALL' ? 'TREND_ALL' : `TREND_${cve}`;
                      const color = colorForIndex(idx);

                      return (
                        <Line
                          key={trendKey}
                          dataKey={trendKey}
                          type="linear"
                          stroke={color}
                          strokeOpacity={0.35}
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                          isAnimationActive={false}
                          strokeDasharray="6 4"
                        />
                      );
                    })}

                    <Line
                      dataKey="TREND_TOTAL"
                      type="linear"
                      stroke="#ff2600"
                      strokeOpacity={0.7}
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
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
            <div className="w-full flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 text-center">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-[#ff2600]" />
                  <span className="font-medium">Tendencia (total)</span>
                </div>

                {clientKeys.map((cve, idx) => {
                  const color = colorForIndex(idx);
                  const name = clientLabel(cve, clientsMap);

                  return (
                    <div key={cve} className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="font-medium">{name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="h-[2px] w-6 rounded"
                          style={{
                            backgroundImage: `repeating-linear-gradient(to right, ${color} 0 6px, transparent 6px 10px)`,
                          }}
                        />
                        <span className="font-medium">{`Tendencia (${name})`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {maxPoint && maxPoint.TOTAL !== 0 && (
              <div className="flex items-center justify-center gap-1 leading-none text-xs text-slate-500">
                <p>
                  {`${periodArticle(granularity)} ${periodLabel(granularity)} con más operaciones fue ${maxPointLabel} con ${maxPoint.TOTAL.toLocaleString()} operaciones`}
                </p>
                <TrendingUp className="h-4 w-4" />
              </div>
            )}

            {totalOperations !== 0 && chartData.length > 0 && (
              <div className="flex items-center justify-center gap-1 leading-none text-xs text-slate-500">
                <p>Total de operaciones:</p>
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
