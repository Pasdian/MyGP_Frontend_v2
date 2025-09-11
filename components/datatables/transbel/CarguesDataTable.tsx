import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { deliveriesColumns } from '@/lib/columns/deliveriesColumns';
import React from 'react';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import DeliveriesDataTableFilter from '../filters/DeliveriesDataTableFilter';
import TablePagination from '../pagination/TablePagination';

export default function CarguesDataTable() {
  const { data, isLoading } = useSWRImmutable<getDeliveries[]>(
    '/api/transbel/getDeliveries',
    axiosFetcher
  );
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });

  const transformedData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      ENTREGA_TRANSPORTE_138: item.ENTREGA_TRANSPORTE_138
        ? item.ENTREGA_TRANSPORTE_138.split(' ')[0]
        : '',
      ENTREGA_CDP_140: item.ENTREGA_CDP_140 ? item.ENTREGA_CDP_140.split(' ')[0] : '',
    }));
  }, [data]);

  const table = useReactTable({
    data: transformedData ?? [],
    columns: deliveriesColumns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });

  React.useEffect(() => {
    if (!data) return;
    data.map((item) => {
      item.ENTREGA_TRANSPORTE_138 = item.ENTREGA_TRANSPORTE_138
        ? item.ENTREGA_TRANSPORTE_138.split(' ')[0]
        : '';
      item.ENTREGA_CDP_140 = item.ENTREGA_CDP_140 ? item.ENTREGA_CDP_140.split(' ')[0] : '';
    });
  }, [data]);

  if (isLoading) return <TailwindSpinner />;

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanFilter() ? (
                          <div>
                            <DeliveriesDataTableFilter column={header.column} />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={deliveriesColumns.length} className="h-24 text-center">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination table={table} />
    </div>
  );
}
