'use client';

import DeliveriesAddPhaseButton from '@/components/buttons/addPhase/DeliveriesAddPhaseButton';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import React from 'react';
import useSWRImmutable from 'swr/immutable';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { axiosFetcher } from '@/axios-instance';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import TablePagination from '@/components/datatables/pagination/TablePagination';
import { deliveriesColumns } from '@/lib/columns/deliveriesColumns';
import DeliveriesDataTable from '@/components/datatables/DeliveriesDataTable';

function validateEntregaTransporte_CDP(data: getDeliveries[]) {
  return data.some((deliverie) => {
    const diffBetweenDates =
      +new Date(
        deliverie.ENTREGA_TRANSPORTE_138 ? deliverie.ENTREGA_TRANSPORTE_138.split(' ')[0] : 0
      ) - +new Date(deliverie.ENTREGA_CDP_140 ? deliverie.ENTREGA_CDP_140.split(' ')[0] : 0);

    diffBetweenDates > 1;
  });
}

export default function Deliveries() {
  const { data, isValidating } = useSWRImmutable<getDeliveries[]>(
    '/api/transbel/getDeliveries',
    axiosFetcher
  );
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: data ? data : [],
    columns: deliveriesColumns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });

  if (isValidating || !data) return <TailwindSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      {validateEntregaTransporte_CDP(data) ? (
        <DeliveriesAddPhaseButton />
      ) : (
        <p className="text-red-400 mb-4">
          Verifica que la diferencia de fechas de entrega a transporte y CDP no sean mayor a un día
          para poder añadir una fase
        </p>
      )}
      {isValidating ? <TailwindSpinner /> : <DeliveriesDataTable table={table} />}
      <TablePagination table={table} />
    </div>
  );
}
