'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { GPClient } from '@/axios-instance';
import { toast } from 'sonner';
import { TransbelInterfaceDT } from '@/components/transbel/interfaz/TransbelInterfaceDT';
import { TailwindSpinner } from '@/components/ui/tailwind-spinner';
import DatePicker from '@/components/date-picker';

// Define the type for our data
export type TTransbelData = {
  REFERENCIA: string;
  EE__GE: string;
  ADU_DESP: string;
  REVALIDACION_073: string | null;
  ULTIMO_DOCUMENTO_114: string | null;
  ENTREGA_TRANSPORTE_138: string | null;
  CE_138: string;
  MSA_130: string | null;
  ENTREGA_CDP_140: string | null;
  CE_140: string | null;
};

// Column definitions for data table
const columns: ColumnDef<TTransbelData>[] = [
  {
    accessorKey: 'REFERENCIA',
    header: 'Referencia',
  },
  {
    accessorKey: 'EE__GE',
    header: 'EE/GE',
  },
  {
    accessorKey: 'ADU_DESP',
    header: 'Aduana',
  },
  {
    accessorKey: 'REVALIDACION_073',
    header: 'Revalidación',
    cell: ({ row }) => {
      if (!row.original.REVALIDACION_073) return '-';
      // Set timezone to 00:00:00 for correct displaying
      const date = new Date(`${row.original.REVALIDACION_073}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ULTIMO_DOCUMENTO_114',
    header: 'Último Documento',
    cell: ({ row }) => {
      if (!row.original.ULTIMO_DOCUMENTO_114) return '-';
      const date = new Date(`${row.original.ULTIMO_DOCUMENTO_114}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ENTREGA_TRANSPORTE_138',
    header: 'Entrega Transporte',
    cell: ({ row }) => {
      if (!row.original.ENTREGA_TRANSPORTE_138) return '-';
      const date = new Date(`${row.original.ENTREGA_TRANSPORTE_138}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'CE_138',
    header: 'CE 138',
  },
  {
    accessorKey: 'MSA_130',
    header: 'MSA',
    cell: ({ row }) => {
      if (!row.original.MSA_130) return '-';
      const date = new Date(`${row.original.MSA_130}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ENTREGA_CDP_140',
    header: 'Entrega CDP',
    cell: ({ row }) => {
      if (!row.original.ENTREGA_CDP_140) return '-';
      const date = new Date(`${row.original.ENTREGA_CDP_140}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'CE_140',
    header: 'CE 140',
    cell: ({ row }) => row.original.CE_140 || '-',
  },
];

const today = new Date();

export default function TransbelClientInterface() {
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(undefined);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<TTransbelData[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      const today = new Date();
      // Common mistakes that the user can do
      if (initialDate == undefined) {
        toast.error('Selecciona una fecha de inicio');
        return;
      } else if (initialDate > today) {
        toast.error('La fecha de inicio no puede ser mayor a la fecha actual');
        return;
      } else if (finalDate == undefined) {
        toast.error('Selecciona una fecha de termino');
        return;
      } else if (initialDate > finalDate) {
        toast.error('La fecha de inicio no puede ser mayor o igual que la fecha de termino');
        return;
      } else if (finalDate <= initialDate) {
        toast.error('La fecha de termino no puede ser menor o igual a la fecha de inicio');
        return;
      } else if (finalDate > today) {
        toast.error('La fecha de termino no puede ser mayor a la fecha actual');
        return;
      }

      // Format both dates as yyyy-mm-dd
      const formattedInitialDate = initialDate?.toISOString().split('T')[0];
      const formattedFinalDate = finalDate?.toISOString().split('T')[0];

      setIsLoading((oldState) => !oldState);
      await GPClient.get(
        `/api/transbel/getRefsPendingCE?initialDate=${formattedInitialDate}&finalDate=${formattedFinalDate}`
      )
        .then((res: { data: TTransbelData[] }) => {
          const data = res.data;
          if (data.length == 0) {
            toast.error('No hay resultados para las fechas seleccionadas');
            setData(data); // Empty array
            setIsLoading((oldState) => !oldState);
            return;
          }
          // Only get date as yyyy-mm-dd
          data.map((item: TTransbelData) => {
            if (item.MSA_130) item.MSA_130 = item.MSA_130.split('T')[0];
            if (item.ENTREGA_CDP_140) item.ENTREGA_CDP_140 = item.ENTREGA_CDP_140.split('T')[0];
            if (item.REVALIDACION_073) item.REVALIDACION_073 = item.REVALIDACION_073.split('T')[0];
            if (item.ENTREGA_TRANSPORTE_138)
              item.ENTREGA_TRANSPORTE_138 = item.ENTREGA_TRANSPORTE_138.split('T')[0];
            if (item.ULTIMO_DOCUMENTO_114)
              item.ULTIMO_DOCUMENTO_114 = item.ULTIMO_DOCUMENTO_114.split('T')[0];
          });

          setData(data);
          setIsLoading((oldState) => !oldState);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
    fetchData();
  }, [initialDate, finalDate]);

  // This conditions should be true in order to NOT display the data table
  const cond =
    initialDate == undefined ||
    finalDate == undefined ||
    initialDate >= finalDate ||
    initialDate > today ||
    finalDate > today ||
    finalDate <= initialDate;

  return (
    <div>
      <div className="flex flex-col justify-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
          <p className="text-2xl font-light tracking-tight mb-5">
            {isLoading || cond
              ? null
              : `De ${initialDate?.toLocaleDateString(
                  'es-MX'
                )} hasta ${finalDate?.toLocaleDateString('es-MX')}`}
          </p>
        </div>
        <div className="mb-5">
          <DatePicker date={initialDate} setDate={setInitialDate} title={'Fecha de Inicio'} />
        </div>
        <div className="mb-5">
          <DatePicker date={finalDate} setDate={setFinalDate} title={'Fecha de Termino'} />
        </div>
      </div>
      <div>
        {isLoading ? <TailwindSpinner /> : <TransbelInterfaceDT columns={columns} data={data} />}
      </div>
    </div>
  );
}
