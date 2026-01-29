'use client';

import React from 'react';
import useSWR from 'swr';
import { TrendingUp } from 'lucide-react';
import { LabelList, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import { COMPANY } from '@/lib/companies/companies';
import { DateRange } from 'react-day-picker';
import MyGPCalendar from '../MyGPUI/Datepickers/MyGPCalendar';
import { ClientsMap, getClientsMap } from '@/lib/clients/clientsData';

type ChartConfig = Record<string, { label: string | undefined }>;
export const description = 'Operaciones por Aduana';

function getLastMonthRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
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
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() =>
    getLastMonthRange()
  );
  const { user } = useAuth();

  const isAAP = user.complete_user.user.companies.some(
    (company) => company.CVE_IMP === COMPANY.AGENCIA_ADUANAL_PASCAL_SC
  );
  const [clientsMap, setClientsMap] = React.useState<ClientsMap>({});

  React.useEffect(() => {
    getClientsMap().then(setClientsMap);
  }, []);

  const userCompanies = React.useMemo(() => {
    const companies = user?.complete_user?.user?.companies ?? [];
    return companies.filter(
      (c: getAllCompanies) => String(c.CVE_IMP) !== COMPANY.AGENCIA_ADUANAL_PASCAL_SC
    );
  }, [user]);

  const [clientNumber, setClientNumber] = React.useState(() => {
    const firstCompany = userCompanies[0]?.CVE_IMP;
    if (firstCompany) return String(firstCompany);
    if (isAAP) return COMPANY.TRANSBEL_SA_DE_CV;
    return '';
  });

  const { rows: companies } = useCompanies();

  const companyOptions = React.useMemo(() => {
    if (!companies?.length) return [];

    if (isAAP) {
      return companies.map((c) => ({ value: String(c.CVE_IMP), label: c.NOM_IMP }));
    }

    const uCompanies = user?.complete_user?.user?.companies ?? [];
    const userCves = uCompanies.map((c: getAllCompanies) => String(c.CVE_IMP));

    return companies
      .filter((c) => userCves.includes(String(c.CVE_IMP)))
      .map((c) => ({ value: String(c.CVE_IMP), label: c.NOM_IMP }));
  }, [companies, isAAP, user]);

  const from = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '';
  const to = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '';

  const { data: chartDataRaw } = useSWR<OperationsByCustomsRow[]>(
    from && to && clientNumber
      ? `/api/bi/getOperationsDistributionByCustoms?initialDate=${from}&finalDate=${to}&client=${clientNumber}`
      : '',
    axiosFetcher
  );

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
    const cfg: ChartConfig = { OPERATIONS: { label: 'Operaciones' } };

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
              {clientNumber ? (
                <div className="mb-2 flex flex-col gap-2">
                  <p className="text-xl">Operaciones por Aduana</p>
                  <p className="font-light">
                    {clientNumber} {clientsMap[clientNumber]}
                  </p>
                  <p className="font-extralight text-slate-500">
                    {dateRange?.from && dateRange?.to
                      ? `${formatISOtoDDMMYYYY(dateRange.from.toISOString())} - ${formatISOtoDDMMYYYY(
                          dateRange.to.toISOString()
                        )}`
                      : 'Selecciona un período y un cliente para visualizar.'}
                  </p>
                </div>
              ) : (
                <div className="mb-2 flex flex-col gap-2">
                  <p className="text-xl">Operaciones por Aduana</p>
                </div>
              )}
            </CardTitle>

            <div className="w-full max-w-3xl">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <MyGPCalendar
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  label="Fecha de Pago:"
                />

                <MyGPCombo
                  value={clientNumber}
                  setValue={setClientNumber}
                  label="Cliente"
                  options={companyOptions}
                  placeholder="Selecciona un cliente"
                  showValue
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 items-center justify-center">
            {from && to ? (
              chartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto w-full [&_.recharts-text]:fill-background md:h-[420px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="OPERATIONS" hideLabel />}
                    />
                    <Pie data={chartData} dataKey="OPERATIONS" stroke="#162155ff" strokeWidth={1}>
                      <LabelList
                        dataKey="CUSTOMS"
                        offset={12}
                        className="text-lg font-semibold tracking-wide"
                        style={{
                          paintOrder: 'stroke fill',
                          stroke: 'rgba(11,16,38,.35)',
                          strokeWidth: 3,
                        }}
                        formatter={(value: string) => chartConfig[value]?.label ?? value}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground">No hay datos para mostrar.</div>
              )
            ) : (
              <div className="text-sm text-muted-foreground">
                Selecciona un período y un cliente para visualizar.
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2 text-sm">
            {maxOperationValue !== 0 && chartData.length > 0 && (
              <div className="flex items-center gap-1 leading-none">
                <p className="font-medium">Máximo número de operaciones fue:</p>
                <p>{maxOperationValue}</p>
                <TrendingUp className="h-4 w-4" />
              </div>
            )}
            {totalOperations !== 0 && chartData.length > 0 && (
              <div className="flex items-center gap-1 leading-none">
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
