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
import useSWRImmutable from 'swr/immutable';
import InitialDatePicker from '../datepickers/InitialDatePicker';
import FinalDatePicker from '../datepickers/FinalDatePicker';
import React from 'react';
import { toast } from 'sonner';
import ClientsCombo from '../comboboxes/ClientsCombo';
import { getOperationsDistributionByCustomsDeepCopy } from '@/types/bi/getOperationsDistributionByCustoms';
import { getFormattedDate } from '@/lib/utilityFunctions/getFormattedDate';
import { customs } from '@/lib/customs/customs';

export const description = 'A pie chart with a label list';

export default function PieChartLabelList() {
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(new Date());
  const [clientName, setClientName] = React.useState('TRANSBEL SA DE CV');
  const [clientNumber, setClientNumber] = React.useState('000259'); // Transbel

  const [maxOperationValue, setMaxOperationValue] = React.useState(0);

  const { data: chartData } = useSWRImmutable(
    initialDate && finalDate && clientName
      ? `/api/bi/getOperationsDistributionByCustoms?initialDate=${
          initialDate.toISOString().split('T')[0]
        }&finalDate=${finalDate.toISOString().split('T')[0]}&client=${clientNumber}`
      : '',
    axiosFetcher
  );
  const [modifiedChartData, setModifiedChartData] = React.useState<
    getOperationsDistributionByCustomsDeepCopy[]
  >([]);
  const [chartConfig, setChartConfig] = React.useState<{
    [key: string]: {
      label: string | undefined;
    };
  }>({
    OPERATIONS: {
      label: 'Operaciones',
    },
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
    if (!chartData) return;
    const localDeepCopy: getOperationsDistributionByCustomsDeepCopy[] = JSON.parse(
      JSON.stringify(chartData)
    );

    const n = localDeepCopy.length;
    const hue = 220; // Blue
    const saturation = 100; // Full saturation
    const minLight = 30; // Dark blue
    const maxLight = 80; // Light blue

    const lightStep = (maxLight - minLight) / (n - 1);
    const maxValue = Math.max(...localDeepCopy.map((obj) => obj.OPERATIONS));
    setMaxOperationValue(maxValue);

    localDeepCopy.map((item, i) => {
      const curValue = item.OPERATIONS;
      if (curValue > maxValue * 0.05) {
        // If my current value is greater than the 5% of my maximum value then add a label
        chartConfig[item.CUSTOMS] = {
          label: customs.find((custom) => custom.key == +item.CUSTOMS)?.name,
        };
      }
      const lightness = minLight + i * lightStep;
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      item.fill = color;
    });

    setModifiedChartData(localDeepCopy);
    setChartConfig(chartConfig);
  }, [chartData, chartConfig]);

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
              <Pie data={modifiedChartData} dataKey="OPERATIONS">
                <LabelList
                  dataKey="CUSTOMS"
                  className="fill-background"
                  stroke="none"
                  fontSize={20}
                  formatter={(value: keyof typeof chartConfig) => chartConfig[value]?.label}
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
