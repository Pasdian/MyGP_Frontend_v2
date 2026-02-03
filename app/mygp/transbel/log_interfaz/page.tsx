'use client';
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
import React from 'react';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';
import TablePageSize from '@/components/datatables/pageSize/TablePageSize';
import TablePagination from '@/components/datatables/pagination/TablePagination';
import TransbelApiLogFilter from '@/components/datatables/filters/TransbelApiLogFilter';
import { apiLogColumns } from '@/lib/columns/apiLogColumns';
import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import MyGPCalendar from '@/components/MyGPUI/Datepickers/MyGPCalendar';
import { DateRange } from 'react-day-picker';

function getLastAndCurrentMonthRange(): DateRange {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = January

  // First day of last month
  const from =
    month === 0
      ? new Date(year - 1, 11, 1) // December of previous year
      : new Date(year, month - 1, 1);

  // Last day of current month
  const to = new Date(year, month + 1, 0); // day 0 of next month = last day of this month

  return { from, to };
}

export default function TransbelApiLog() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  // Inside your component:
  const defaultRange = React.useMemo(() => getLastAndCurrentMonthRange(), []);

  const hasCustomRange = dateRange?.from && dateRange?.to;

  const effectiveFrom = hasCustomRange ? dateRange!.from! : defaultRange.from!;
  const effectiveTo = hasCustomRange ? dateRange!.to! : defaultRange.to!;

  const key = `/api/transbel/getTransbelApiLog?initialDate=${effectiveFrom
    .toISOString()
    .slice(0, 10)}&finalDate=${effectiveTo.toISOString().slice(0, 10)}`;

  const { data, isLoading } = useSWR(key, axiosFetcher);

  const table = useReactTable({
    data: data ?? [],
    columns: apiLogColumns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination, // Pagination
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
    state: {
      pagination, // Pagination
    },
  });
  if (isLoading) return <MyGPSpinner />;

  return (
    <div>
      <div className="w-[300px] mb-4">
        <MyGPCalendar dateRange={dateRange} setDateRange={setDateRange} />
      </div>
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
                            <TransbelApiLogFilter column={header.column} />
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
              <TableCell colSpan={apiLogColumns.length} className="h-24 text-center">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="w-full flex justify-end items-center gap-2">
        <TablePageSize pagination={pagination} setPagination={setPagination} />
        <TablePagination table={table} />
      </div>
    </div>
  );
}
