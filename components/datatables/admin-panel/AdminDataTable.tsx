import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ColumnDef, flexRender } from '@tanstack/react-table';
import TablePagination from '../pagination/TablePagination';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import useSWRImmutable from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import AdminDataTableFilter from '../filters/AdminDataTableFilter';

type AdminDataTableProps<T> = {
  dataTableUrl: string;
  columns: ColumnDef<T>[];
};

export default function AdminDataTable<T>({ dataTableUrl, columns }: AdminDataTableProps<T>) {
  const { data } = useSWRImmutable<T[]>(dataTableUrl, axiosFetcher);

  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });

  const table = useReactTable({
    data: data || [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={
                    header.column.columnDef.meta?.headerClassName ??
                    header.column.columnDef.meta?.className
                  }
                >
                  {header.isPlaceholder ? null : (
                    <div>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanFilter() ? (
                        <div>
                          <AdminDataTableFilter<T> column={header.column} />
                        </div>
                      ) : null}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      cell.column.columnDef.meta?.cellClassName ??
                      cell.column.columnDef.meta?.className
                    }
                    title={String(flexRender(cell.column.columnDef.cell, cell.getContext()))}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="h-24 text-center"
              >
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
