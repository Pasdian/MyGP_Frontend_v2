'use client';

export const dynamic = 'force-dynamic';

import {
  ColumnDef,
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
import { InterfaceContext } from '@/contexts/InterfaceContext';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import IntefaceDataTableFilter from '../filters/InterfaceDataTableFilter';
import TablePagination from '../pagination/TablePagination';
import { interfaceColumns } from '@/lib/columns/interfaceColumns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { IconSettings, IconSquareFilled } from '@tabler/icons-react';
import { CheckIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import axios from 'axios';
import { getRefsPendingCEFormat } from '@/types/transbel/getRefsPendingCE';
import { getFormattedDate } from '@/lib/utilityFunctions/getFormattedDate';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TAB_VALUES = ['errors', 'pending', 'sent', 'duplicates'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}
export function InterfaceDataTable() {
  const { initialDate, finalDate } = React.useContext(InterfaceContext);
  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isSendingToWorkato, setIsSendingToWorkato] = React.useState(false);
  const [tabValue, setTabValue] = React.useState<'errors' | 'pending' | 'sent' | 'duplicates'>(
    'errors'
  );

  const pendingRefsKey =
    initialDate && finalDate
      ? `/api/transbel/getRefsPendingCE?initialDate=${
          initialDate.toISOString().split('T')[0]
        }&finalDate=${finalDate.toISOString().split('T')[0]}`
      : '/api/transbel/getRefsPendingCE';

  const { data, isLoading } = useSWRImmutable<getRefsPendingCEFormat[]>(
    pendingRefsKey,
    axiosFetcher
  );

  const modifiedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [] as getRefsPendingCEFormat[];
    return data.map((item) => ({
      ...item,
      REVALIDACION_073_FORMATTED: item.REVALIDACION_073 && getFormattedDate(item.REVALIDACION_073),
      ULTIMO_DOCUMENTO_114_FORMATTED:
        item.ULTIMO_DOCUMENTO_114 && getFormattedDate(item.ULTIMO_DOCUMENTO_114),
      ENTREGA_TRANSPORTE_138_FORMATTED:
        item.ENTREGA_TRANSPORTE_138 && getFormattedDate(item.ENTREGA_TRANSPORTE_138),
      MSA_130_FORMATTED: item.MSA_130 && getFormattedDate(item.MSA_130),
      ENTREGA_CDP_140_FORMATTED: item.ENTREGA_CDP_140 && getFormattedDate(item.ENTREGA_CDP_140),
      workato_created_at_FORMATTED:
        item.workato_created_at && getFormattedDate(item.workato_created_at),
    }));
  }, [data]);

  // Filtered rows based on tabs and delete EE__GE duplicates
  const filtered = React.useMemo(() => {
    const rows = Array.isArray(modifiedData) ? modifiedData : [];

    let subset: typeof rows;
    switch (tabValue) {
      case 'errors':
        subset = rows.filter((r) => r?.has_errors === true);
        break;
      case 'pending':
        subset = rows.filter((r) => r?.pending === true);
        break;
      case 'sent':
        subset = rows.filter((r) => r?.sent === true);
        break;
      case 'duplicates':
        subset = rows.filter((r) => r?.has_eege_duplicate_error === true);
        break;
      default:
        subset = rows;
    }

    // Only show unique objects on EE__GE (keep first occurrence)
    const seen = new Set<string>();
    return subset.filter((r) => {
      const raw = r?.EE__GE;
      // if EE__GE is missing/empty, keep the row (not deduped by key)
      if (raw === null || raw === undefined) return true;

      const key =
        typeof raw === 'string'
          ? raw.trim()
          : (raw as getRefsPendingCEFormat).toString?.() ?? String(raw);

      if (key === '') return true; // keep empties as-is

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [modifiedData, tabValue]);

  const selectionWorkatoColumn = React.useMemo<ColumnDef<getRefsPendingCEFormat>>(
    () => ({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const sent = row.original.was_send_to_workato;

        return (
          <Checkbox
            checked={sent || row.getIsSelected()}
            disabled={sent || !row.getCanSelect()}
            onCheckedChange={(v) => {
              if (!sent) {
                row.toggleSelected(!!v);
              }
            }}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 36,
    }),
    []
  );

  const baseColumns = React.useMemo<ColumnDef<getRefsPendingCEFormat>[]>(() => {
    return [...interfaceColumns];
  }, []);

  // Conditionally add the selection column
  const columns = React.useMemo<ColumnDef<getRefsPendingCEFormat>[]>(() => {
    if (tabValue === 'pending') {
      return [selectionWorkatoColumn, ...baseColumns];
    }
    return baseColumns;
  }, [tabValue, baseColumns, selectionWorkatoColumn]);

  // Table instance
  const table = useReactTable({
    data: filtered ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    enableRowSelection: (row) => !row.original.was_send_to_workato,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.REFERENCIA),
    state: { columnFilters, pagination, rowSelection },
  });

  // Preselect only when data changes (don’t wipe user clicks on every toggle)
  React.useEffect(() => {
    if (!Array.isArray(modifiedData)) return;
    const initial: Record<string, boolean> = {};
    modifiedData.forEach((r) => {
      if (r?.was_send_to_workato) initial[String(r.REFERENCIA)] = true;
    });
    setRowSelection(initial);
  }, [modifiedData]);

  const selectedWorkatoRows = table
    .getSelectedRowModel()
    .rows.filter((r) => r.getCanSelect())
    .map((r) => r.original);

  async function sendToWorkato() {
    try {
      const res = await GPClient.post('/api/transbel/sendToTransbelAPI', {
        payload: selectedWorkatoRows,
      });
      toast.success(res.data.message || 'Enviado a Workato correctamente');
      setIsSendingToWorkato(false);
      mutate(pendingRefsKey);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Ocurrió un error';
        toast.error(message);
        setIsSendingToWorkato(false);
      } else {
        toast.error('Ocurrió un error inesperado');
        setIsSendingToWorkato(false);
      }
      setIsSendingToWorkato(false);
    }
  }

  if (isLoading) return <TailwindSpinner />;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center">
          <Tabs
            value={tabValue}
            onValueChange={(v) => isTabValue(v) && setTabValue(v)}
            className="mr-2"
          >
            <TabsList>
              <TabsTrigger value="errors">Con Error</TabsTrigger>
              <TabsTrigger value="pending">Pendientes de Envio</TabsTrigger>
              <TabsTrigger value="sent">Enviados</TabsTrigger>
            </TabsList>
          </Tabs>
          {tabValue == 'pending' && (
            <div>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 cursor-pointer mr-2"
                onClick={() => table.toggleAllRowsSelected(true)}
              >
                <CheckIcon />
                Seleccionar todo
              </Button>
              {table.getIsAllRowsSelected() && (
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                  onClick={() => table.toggleAllRowsSelected(false)}
                >
                  <IconSquareFilled />
                  Deseleccionar todo
                </Button>
              )}
            </div>
          )}
        </div>

        {selectedWorkatoRows.length > 0 && (
          <div>
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={sendToWorkato}
              disabled={isSendingToWorkato} // optional: disable while loading
            >
              <div className="flex items-center">
                {isSendingToWorkato ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    <p>Enviando</p>
                  </>
                ) : (
                  <>
                    <IconSettings className="mr-2 h-4 w-4" />
                    <p>Enviar {selectedWorkatoRows.length} referencias</p>
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
                          <IntefaceDataTableFilter column={header.column} />
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
              <TableCell colSpan={columns.length} className="h-24 ">
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
