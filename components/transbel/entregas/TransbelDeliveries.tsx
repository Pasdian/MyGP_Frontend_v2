'use client';
import { GPClient } from '@/axios-instance';
import { Skeleton } from '@/components/ui/skeleton';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import TransbelDeliveriesDT from './TransbelDeliveriesDT';
import { TailwindSpinner } from '@/components/ui/tailwind-spinner';
import { toast } from 'sonner';

export type Deliveries = {
  NUM_REFE: string | null;
  CVE_ETAP: string | null;
  FEC_ETAP: string | null;
  HOR_ETAP: string | null;
  OBS_ETAP: string | null;
  CVE_MODI: string | null;
};

const columns: ColumnDef<Deliveries>[] = [
  {
    accessorKey: 'NUM_REFE',
    header: 'Referencia',
  },
  {
    accessorKey: 'CVE_ETAP',
    header: 'CE Etapa',
  },
  {
    accessorKey: 'FEC_ETAP',
    header: 'Fecha',
    cell: ({ row }) => {
      if (!row.original.FEC_ETAP) return '-';
      const date = new Date(`${row.original.FEC_ETAP}T00:00:00`);
      return `${date.toLocaleDateString('es-MX')}`;
    },
  },
  {
    accessorKey: 'HOR_ETAP',
    header: 'Hora',
    cell: ({ row }) => {
      if (!row.original.HOR_ETAP) return '-';
      const time = new Date(row.original.HOR_ETAP);

      return time.toLocaleString('es-MX', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });
    },
  },
  {
    accessorKey: 'OBS_ETAP',
    header: 'Observaciones',
    cell: ({ row }) => {
      if (!row.original.OBS_ETAP) return '-';
      return row.original.OBS_ETAP;
    },
  },
  {
    accessorKey: 'CVE_MODI',
    header: 'CE MODI',
    cell: ({ row }) => {
      if (!row.original.CVE_MODI) return '-';
      return row.original.CVE_MODI;
    },
  },
];

export default function TransbelDeliveries() {
  const [data, setData] = React.useState<Deliveries[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchData() {
      await GPClient.get('/api/transbel/getDeliveries').then((res: { data: Deliveries[] }) => {
        if (res.data) {
          const data = res.data;
          if (data.length == 0) {
            toast.error('No hay resultados para las fechas seleccionadas');
            setData(data); // Empty array
            setIsLoading((oldState) => !oldState);
            return;
          }

          data.map((item) => {
            if (item.FEC_ETAP) item.FEC_ETAP = item.FEC_ETAP.split('T')[0];
          });
          setData(data);
          setIsLoading((prevState) => !prevState);
        }
      });
    }
    fetchData();
  }, []);

  return (
    <div>
      {isLoading ? (
        <TailwindSpinner />
      ) : (
        <TransbelDeliveriesDT data={data} columns={columns} setData={setData} />
      )}
    </div>
  );
}
