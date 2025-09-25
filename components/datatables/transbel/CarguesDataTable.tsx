'use client';

export const dynamic = 'force-dynamic';

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React from 'react';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import useSWRImmutable from 'swr/immutable';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import TablePagination from '../pagination/TablePagination';
import { Button } from '@/components/ui/button';
import CarguesDataTableFilter from '../filters/CarguesDataTableFilter';
import { carguesColumns } from '@/lib/columns/carguesColumns';
import { IconSettings } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getFormattedDate } from '@/lib/utilityFunctions/getFormattedDate';
import { getCarguesFormat } from '@/types/transbel/getCargues';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CarguesDataTable() {
  const carguesKey = '/api/transbel/getCargues';

  const { data, isLoading } = useSWRImmutable<getCarguesFormat[]>(carguesKey, axiosFetcher);

  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [shouldFilterFecEnvio, setShouldFilterFecEnvio] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isSendingToDB, setIsSendingToDB] = React.useState(false);

  // Ensure each row has a stable id and USE it in the table
  const modifiedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [] as (getCarguesFormat & { id: string })[];
    return data.map((item) => ({
      ...item,
      id: uuidv4(),
      FEC_PAGO_FORMATTED: item.FEC_PAGO && getFormattedDate(item.FEC_PAGO),
      FEC_ENVIO_FORMATTED: item.FEC_ENVIO && getFormattedDate(item.FEC_ENVIO),
    }));
  }, [data]);

  // const validadoColumn = React.useMemo<ColumnDef<getCarguesFormat & { id: string }>>(
  //   () => ({
  //     id: 'select',
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && 'indeterminate')
  //         }
  //         onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => {
  //       return (
  //         <Checkbox
  //           checked={row.getIsSelected()}
  //           onCheckedChange={(v) => row.toggleSelected(!!v)}
  //           aria-label="Select row"
  //         />
  //       );
  //     },
  //     enableSorting: false,
  //     enableHiding: false,
  //     size: 36,
  //   }),
  //   []
  // );

  const rowsForTable = React.useMemo(() => {
    if (!Array.isArray(modifiedData)) return [];

    return modifiedData.filter((r) => {
      if (shouldFilterFecEnvio) {
        return !r?.FEC_ENVIO;
      } else {
        return !!r?.FEC_ENVIO;
      }
    });
  }, [modifiedData, shouldFilterFecEnvio]);

  // Merge selection column with your domain columns
  // const columns = React.useMemo<ColumnDef<getCarguesFormat & { id: string }>[]>(() => {
  //   return [validadoColumn, ...(carguesColumns as ColumnDef<getCarguesFormat & { id: string }>[])];
  // }, [validadoColumn]);

  // Table instance
  const table = useReactTable({
    data: rowsForTable,
    columns: carguesColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    state: { columnFilters, pagination, rowSelection },
    enableRowSelection: true,
    // getRowId: (row) => row.id,
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.filter((r) => r.getCanSelect())
    .map((r) => r.original);

  async function sendToDB() {
    setIsSendingToDB(true);
    try {
      const res = await GPClient.post('/api/transbel/missingCargue', {
        payload: selectedRows,
      });

      toast.success(res.data.message || 'Se actualizó el estado de los pedimentos');
      setIsSendingToDB(false);
      mutate(carguesKey);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Ocurrió un error';
        toast.error(message);
        setIsSendingToDB(false);
      } else {
        toast.error('Ocurrió un error inesperado');
        setIsSendingToDB(false);
      }
      setIsSendingToDB(false);
    }
  }

  if (isLoading) return <TailwindSpinner />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Cargues de Transbel</h1>
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center">
          <Tabs
            onValueChange={(value) => {
              if (value === 'not_sent_and_not_fec_envio') {
                setShouldFilterFecEnvio(true);
              } else {
                setShouldFilterFecEnvio(false);
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="validated">Pedimentos Pagados</TabsTrigger>
              <TabsTrigger value="not_sent_and_not_fec_envio">Pendientes por Enviar</TabsTrigger>
              <TabsTrigger value="sent_and_not_errors">Enviados</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {selectedRows.length > 0 && (
          <div>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
              onClick={sendToDB}
              disabled={isSendingToDB}
            >
              <div className="flex items-center">
                {isSendingToDB ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    <p>Enviando</p>
                  </>
                ) : (
                  <>
                    <IconSettings className="mr-2 h-4 w-4" />
                    <p>Enviar {selectedRows.length} pedimentos</p>
                  </>
                )}
              </div>
            </Button>
          </div>
        )}
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
                          <CarguesDataTableFilter column={header.column} />
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
            table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}{' '}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={carguesColumns.length} className="h-24 text-center">
                <div className="flex justify-center">
                  <p>Sin resultados...</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination table={table} />
    </div>
  );
}
