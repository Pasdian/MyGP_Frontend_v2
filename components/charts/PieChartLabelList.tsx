'use client';

import { TrendingUp } from 'lucide-react';
import { LabelList, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import useSWRImmutable from 'swr';
import InitialDatePicker from '../datepickers/ChartInitialDatePicker';
import FinalDatePicker from '../datepickers/ChartFinalDatePicker';
import React from 'react';
import { toast } from 'sonner';
import ClientsCombo from '../comboboxes/ClientsCombo';
import { getOperationsDistributionByCustomsDeepCopy } from '@/types/bi/getOperationsDistributionByCustoms';
import { getFormattedDate } from '@/lib/utilityFunctions/getFormattedDate';
import { customs } from '@/lib/customs/customs';

export const COLORS_6 = ['#0B2B66', '#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#8FB2FF'];

function bluePalette(n: number): string[] {
  if (n <= 0) return [];
  const base = COLORS_6;
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
}

type ChartConfig = Record<string, { label: string | undefined }>;
export const description = 'Operaciones por Aduana';

export default function PieChartLabelList() {
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(new Date());
  const [clientName, setClientName] = React.useState('TRANSBEL SA DE CV - Nuevo');
  const [clientNumber, setClientNumber] = React.useState('005009'); // Transbel Nuevo
  const [maxOperationValue, setMaxOperationValue] = React.useState(0);

  const { data: chartData } = useSWRImmutable(
    initialDate && finalDate
      ? `/api/bi/getOperationsDistributionByCustoms?initialDate=${
          initialDate.toISOString().split('T')[0]
        }&finalDate=${finalDate.toISOString().split('T')[0]}&client=${clientNumber}`
      : '',
    axiosFetcher
  );
  const [modifiedChartData, setModifiedChartData] = React.useState<
    getOperationsDistributionByCustomsDeepCopy[]
  >([]);

  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({
    OPERATIONS: { label: 'Operaciones' },
  });

  React.useEffect(() => {
    function validateDates() {
      if (!initialDate) return;
      if (!finalDate) {
        toast.error('Selecciona una fecha de término');
        return;
      }

      const today = new Date();
      const start = new Date(initialDate);
      const end = new Date(finalDate);

      if (start > today) {
        toast.error('La fecha de inicio no puede ser mayor a la fecha actual');
        return;
      }

      if (end > today) {
        toast.error('La fecha de término no puede ser mayor a la fecha actual');
        return;
      }

      if (start >= end) {
        toast.error('La fecha de inicio no puede ser mayor o igual que la fecha de término');
        return;
      }
    }

    validateDates();
  }, [initialDate, finalDate]);

  React.useEffect(() => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      setModifiedChartData([]);
      setChartConfig({ OPERATIONS: { label: 'Operaciones' } });
      setMaxOperationValue(0);
      return;
    }

    const local: getOperationsDistributionByCustomsDeepCopy[] = chartData.map((r) => ({
      ...r,
    }));

    const maxValue = local.reduce((acc, cur) => Math.max(acc, Number(cur.OPERATIONS) || 0), 0) || 0;
    setMaxOperationValue(maxValue);

    const nextConfig: ChartConfig = { OPERATIONS: { label: 'Operaciones' } };

    const palette = bluePalette(local.length);

    local.forEach((item, i) => {
      const curValue = Number(item.OPERATIONS) || 0;
      if (maxValue > 0 && curValue >= maxValue * 0.05) {
        nextConfig[item.CUSTOMS] = {
          label: customs.find((c) => c.key == item.CUSTOMS)?.name ?? undefined,
        };
      }
      item.fill = palette[i];
    });
    setModifiedChartData(local);
    setChartConfig(nextConfig);
    // Do NOT depend on chartConfig to avoid loops.
  }, [chartData]);

  return (
    <>
      <div className="flex mb-5">
        <div className="mr-5">
          <InitialDatePicker date={initialDate} setDate={setInitialDate} onSelect={() => {}} />
        </div>
        <div className=" mr-5">
          <FinalDatePicker date={finalDate} setDate={setFinalDate} onSelect={() => {}} />
        </div>
        <div>
          <ClientsCombo
            clientName={clientName}
            setClientName={setClientName}
            setClientNumber={setClientNumber}
            onSelect={() => {}}
          />
        </div>
      </div>
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>
            {initialDate && finalDate && clientName
              ? `Operaciones por Aduana - ${clientName}`
              : 'Para visualizar, selecciona los campos correspondientes'}
          </CardTitle>
          <CardDescription>
            {initialDate && finalDate && clientName
              ? `${getFormattedDate(initialDate.toISOString().split('T')[0])} - ${getFormattedDate(
                  finalDate.toISOString().split('T')[0]
                )}`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-text]:fill-background mx-auto aspect-square  max-h-[550px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="OPERATIONS" hideLabel />} />
              <Pie data={modifiedChartData} dataKey="OPERATIONS" stroke="#162155ff" strokeWidth={1}>
                <LabelList
                  dataKey="CUSTOMS"
                  offset={12}
                  className="font-semibold text-lg tracking-wide"
                  style={{
                    paintOrder: 'stroke fill', // outline text for contrast
                    stroke: 'rgba(11,16,38,.35)',
                    strokeWidth: 3,
                  }}
                  formatter={(value: string) => chartConfig[value]?.label ?? value}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        {initialDate && finalDate && clientName && maxOperationValue !== 0 && (
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {`El máximo número de operaciones fue ${maxOperationValue}`}

              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Período{' '}
              {`${getFormattedDate(initialDate.toISOString().split('T')[0])} - ${getFormattedDate(
                finalDate.toISOString().split('T')[0]
              )}`}
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
