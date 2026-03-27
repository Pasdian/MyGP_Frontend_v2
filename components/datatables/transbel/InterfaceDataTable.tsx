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
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { InterfaceContext } from '@/contexts/InterfaceContext';
import IntefaceDataTableFilter from '../filters/InterfaceDataTableFilter';
import TablePagination from '../pagination/TablePagination';
import { Checkbox } from '@/components/ui/checkbox';
import { IconSettings } from '@tabler/icons-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useInterfaceColumns } from '@/lib/columns/interfaceColumns';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { MyGPTabs } from '@/components/MyGPUI/Tabs/MyGPTabs';
import TablePageSize from '../pageSize/TablePageSize';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sheet } from 'lucide-react';

const TAB_VALUES = ['errors', 'pending', 'sent'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}

export function InterfaceDataTable() {
  const { refsPendingCE, isRefsLoading, tabValue, setTabValue, mutateRefsPendingCE } =
    React.useContext(InterfaceContext);
  const [isConvertingToCsv, setIsConvertingToCsv] = React.useState(false);

  // UI state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [isSendingToWorkato, setIsSendingToWorkato] = React.useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [enableSendWithErrors, setEnableSendWithErrors] = React.useState(false);
  const interfaceColumns = useInterfaceColumns();

  // Filtered rows based on tabs and delete EE__GE duplicates
  const filtered = React.useMemo(() => {
    const rows = Array.isArray(refsPendingCE) ? refsPendingCE : [];

    let subset = rows;
    switch (tabValue) {
      case 'errors':
        subset = rows.filter((r) => r?.has_error === true);
        break;
      case 'pending':
        subset = rows.filter((r) => !r?.has_error && r.workato_status !== '1');
        break;
      case 'sent':
        subset = rows.filter((r) => r?.workato_status === '1' && !r?.has_error);
        break;
    }

    return subset;
  }, [refsPendingCE, tabValue]);

  const selectionWorkatoColumn = React.useMemo<ColumnDef<getRefsPendingCE>>(
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
        const sent = row.original.workato_status == '1';

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

  const baseColumns = React.useMemo<ColumnDef<getRefsPendingCE>[]>(() => {
    return [...interfaceColumns];
  }, [interfaceColumns]);

  // Conditionally add the selection column
  const columns = React.useMemo<ColumnDef<getRefsPendingCE>[]>(() => {
    if (tabValue === 'pending' || (tabValue === 'errors' && enableSendWithErrors)) {
      return [selectionWorkatoColumn, ...baseColumns];
    }
    return baseColumns;
  }, [tabValue, enableSendWithErrors, baseColumns, selectionWorkatoColumn]);

  // Table instance
  const table = useReactTable({
    data: filtered ?? [],
    columns, // ensure your "Acciones" column has id: "ACCIONES"
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    enableRowSelection: (row) => row.original.workato_status !== '1',
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.REFERENCIA),
    // NEW: include visibility in state and handler
    state: { columnFilters, pagination, rowSelection, columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    autoResetPageIndex: false,
  });
  // toggle "ACCIONES" only on 'errors'
  React.useEffect(() => {
    setColumnVisibility((v) => ({ ...v, ACCIONES: tabValue === 'errors' }));
  }, [tabValue]);

  // Preselect only when data changes (don’t wipe user clicks on every toggle)
  React.useEffect(() => {
    if (!Array.isArray(refsPendingCE)) return;
    const initial: Record<string, boolean> = {};
    refsPendingCE.forEach((r) => {
      if (r?.workato_status == '1') initial[String(r.REFERENCIA)] = true;
    });
    setRowSelection(initial);
  }, [refsPendingCE]);

  React.useEffect(() => {
    if (tabValue !== 'errors' || enableSendWithErrors) {
      return;
    }

    table.toggleAllRowsSelected(false);
  }, [enableSendWithErrors, tabValue, table]);

  const selectedWorkatoRows = table
    .getSelectedRowModel()
    .rows.filter((r) => r.getCanSelect())
    .map((r) => r.original);

  async function sendToWorkato() {
    setIsSendingToWorkato(true);
    const selectedReferences = new Set(selectedWorkatoRows.map((row) => row.REFERENCIA));
    const previousRows = refsPendingCE ?? [];

    try {
      await mutateRefsPendingCE(
        (currentRows = []) =>
          currentRows.map((row) =>
            selectedReferences.has(row.REFERENCIA) ? { ...row, workato_status: '1' } : row
          ),
        { revalidate: false }
      );

      const res = await GPClient.post('/api/transbel/sendToTransbelAPI', {
        payload: selectedWorkatoRows,
      });

      if (res.status === 200) {
        table.toggleAllRowsSelected(false);
        toast.success(res.data.message || 'Datos enviados correctamente');
      } else {
        await mutateRefsPendingCE(previousRows, { revalidate: false });
        toast.error('No se pudo enviar los datos solicitados');
      }
    } catch (err) {
      await mutateRefsPendingCE(previousRows, { revalidate: false });
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || err.message || 'Ocurrió un error';
        toast.error(message);
      } else {
        toast.error('Ocurrió un error inesperado');
      }
    } finally {
      setIsSendingToWorkato(false);
    }
  }

  async function convertToCsv() {
    setIsConvertingToCsv(true);

    try {
      // Export all rows after filters (not just current page)
      const exportRows = table.getFilteredRowModel().rows;

      // Export only currently visible leaf columns (excluding UI columns)
      const exportCols = table
        .getVisibleLeafColumns()
        .filter((c) => c.id !== 'select' && c.id !== 'ACCIONES');

      if (!exportRows.length || !exportCols.length) {
        toast.error('No hay datos para exportar');
        return;
      }

      const headerLabel = (col: (typeof exportCols)[number]) => {
        const h = col.columnDef.header;
        if (typeof h === 'string') return h;
        // If header is a function / React node, fall back to id
        return col.id;
      };

      const escapeCsv = (value: unknown) => {
        if (value === null || value === undefined) return '';
        if (value instanceof Date) value = value.toISOString();

        const s = String(value);
        // Quote if it contains comma, quote, or newline
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const headers = exportCols.map((col) => escapeCsv(headerLabel(col))).join(',');

      const dataLines = exportRows.map((row) => {
        return exportCols
          .map((col) => {
            // This uses TanStack's computed value for the column
            const val = row.getValue(col.id);
            return escapeCsv(val);
          })
          .join(',');
      });

      const csv = [headers, ...dataLines].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const filename = `interface_${tabValue}_${yyyy}-${mm}-${dd}.csv`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      toast.success('CSV generado correctamente');
    } catch {
      toast.error('No se pudo generar el CSV');
    } finally {
      setIsConvertingToCsv(false);
    }
  }

  if (isRefsLoading) return <MyGPSpinner />;

  return (
    <div>
      <div className="mb-4">
        {filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            <Button
              className="bg-green-500 hover:bg-green-700 font-bold hover:text-white cursor-pointer text-white w-[200px]"
              onClick={() => convertToCsv()}
            >
              <div>
                {isConvertingToCsv ? (
                  <div className="flex space-x-2 items-center">
                    <Loader2 className="animate-spin" />
                    <p>Cargando...</p>
                  </div>
                ) : (
                  <div className="flex space-x-2 items-center">
                    <Sheet className="mr-2 h-4 w-4" />
                    <p> Exportar Tabla a CSV</p>
                  </div>
                )}
              </div>
            </Button>

            <div className="flex items-center gap-2">
              <Switch
                id="enable_send_with_errors"
                checked={enableSendWithErrors}
                onCheckedChange={setEnableSendWithErrors}
                className="data-[state=checked]:bg-green-600"
              />
              <label htmlFor="enable_send_with_errors" className="text-sm font-medium">
                Habilitar Envio con Errores
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="mb-4 grid w-full max-w-[950px] grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
        <div className="w-full md:w-[450px]">
          <MyGPTabs
            value={tabValue}
            onValueChange={(v) => isTabValue(v) && setTabValue?.(v)}
            defaultValue="errors"
            className="mr-2 mb-0"
            tabs={[
              { value: 'errors', label: 'Con Error' },
              { value: 'pending', label: 'Pendientes de Envio' },
              { value: 'sent', label: 'Enviados' },
            ]}
          />
        </div>

        {selectedWorkatoRows.length > 0 && (
          <div>
            <MyGPButtonSubmit
              className="h-6"
              danger={tabValue === 'errors'}
              onClick={sendToWorkato}
              isSubmitting={isSendingToWorkato} // optional: disable while loading
            >
              <IconSettings className="mr-2 h-4 w-4" />
              <p>Enviar {selectedWorkatoRows.length} referencias</p>
            </MyGPButtonSubmit>
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
      <div className="w-full flex justify-end items-center gap-2">
        <TablePageSize pagination={pagination} setPagination={setPagination} />
        <TablePagination table={table} />
      </div>
    </div>
  );
}
