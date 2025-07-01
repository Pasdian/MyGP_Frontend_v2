'use client';

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

export default function Deliveries() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      <DeliveriesDataTable />
    </div>
  );
}
