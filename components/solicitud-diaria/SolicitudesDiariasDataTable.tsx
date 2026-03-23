'use client';

import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import HoverPopover from '@/components/HoverPopover/HoverPopover';
import MyGPCalendar from '@/components/MyGPUI/Datepickers/MyGPCalendar';
import TablePagination from '@/components/datatables/pagination/TablePagination';
import TablePageSize from '@/components/datatables/pageSize/TablePageSize';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';
import { X } from 'lucide-react';
import { EditarSolicitudDiariaDialog } from './EditarSolicitudDiariaDialog';
import type { SolicitudDiariaRow } from './types';

export type { SolicitudDiariaRow } from './types';

type ColumnSearchKey =
  | 'CLIENT'
  | 'REPROGRAMACION'
  | 'MOTIVO_REPROGRAMACION'
  | 'TIPO_REFERENCIA'
  | 'TIPO_PAGO'
  | 'TIPO'
  | 'CONCEPTO'
  | 'NUMERO_REFERENCIA'
  | 'INGRESO_ESTIMADO'
  | 'INGRESO_REAL'
  | 'DIFERENCIA'
  | 'HAS_ANTICIPO'
  | 'OBSERVACIONES'
  | 'CREATED_BY'
  | 'CREATED_AT';

type SelectFilterState = {
  reprogramacion: string;
  motivoReprogramacion: string;
  tipoReferencia: string;
  tipoPago: string;
  tipo: string;
  concepto: string;
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

const initialSelectFilters: SelectFilterState = {
  reprogramacion: 'ALL',
  motivoReprogramacion: 'ALL',
  tipoReferencia: 'ALL',
  tipoPago: 'ALL',
  tipo: 'ALL',
  concepto: 'ALL',
};

const initialColumnSearches: Record<ColumnSearchKey, string> = {
  CLIENT: '',
  REPROGRAMACION: '',
  MOTIVO_REPROGRAMACION: '',
  TIPO_REFERENCIA: '',
  TIPO_PAGO: '',
  TIPO: '',
  CONCEPTO: '',
  NUMERO_REFERENCIA: '',
  INGRESO_ESTIMADO: '',
  INGRESO_REAL: '',
  DIFERENCIA: '',
  HAS_ANTICIPO: '',
  OBSERVACIONES: '',
  CREATED_BY: '',
  CREATED_AT: '',
};

const getColumnSearchValue = (row: SolicitudDiariaRow, columnId: ColumnSearchKey) => {
  switch (columnId) {
    case 'CLIENT':
      return row.CLIENT ?? '';
    case 'REPROGRAMACION':
      return row.REPROGRAMACION ? 'SI' : 'NO';
    case 'MOTIVO_REPROGRAMACION':
      return row.MOTIVO_REPROGRAMACION ?? '';
    case 'TIPO_REFERENCIA':
      return row.TIPO_REFERENCIA ?? '';
    case 'TIPO_PAGO':
      return row.TIPO_PAGO ?? '';
    case 'TIPO':
      return row.TIPO ?? '';
    case 'CONCEPTO':
      return row.CONCEPTO ?? '';
    case 'NUMERO_REFERENCIA':
      return row.NUMERO_REFERENCIA ?? '';
    case 'INGRESO_ESTIMADO':
      return `${row.INGRESO_ESTIMADO ?? ''} ${currencyFormatter.format(Number(row.INGRESO_ESTIMADO || 0))}`;
    case 'INGRESO_REAL':
      return row.INGRESO_REAL != null
        ? `${row.INGRESO_REAL} ${currencyFormatter.format(Number(row.INGRESO_REAL))}`
        : '';
    case 'DIFERENCIA':
      return row.DIFERENCIA != null
        ? `${row.DIFERENCIA} ${currencyFormatter.format(Number(row.DIFERENCIA))}`
        : '';
    case 'HAS_ANTICIPO':
      return row.HAS_ANTICIPO ? 'SI' : 'NO';
    case 'OBSERVACIONES':
      return row.OBSERVACIONES ?? '';
    case 'CREATED_BY':
      return row.CREATED_BY ?? '';
    case 'CREATED_AT':
      return row.CREATED_AT_FMT ?? row.CREATED_AT ?? '';
    default:
      return '';
  }
};

const parseCreatedAt = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const [datePart, timePart = '00:00:00'] = value.trim().split(' ');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const [hourRaw = '0', minuteRaw = '0', secondRaw = '0'] = timePart.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const secondWithMs = Number(secondRaw);
  const second = Math.trunc(secondWithMs);
  const millisecond = Math.round((secondWithMs - second) * 1000);

  const parsed = new Date(year, month - 1, day, hour, minute, second, millisecond);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const matchesSelectFilters = (row: SolicitudDiariaRow, filters: SelectFilterState) => {
  if (filters.reprogramacion !== 'ALL') {
    const value = row.REPROGRAMACION ? 'SI' : 'NO';
    if (value !== filters.reprogramacion) {
      return false;
    }
  }

  if (
    filters.motivoReprogramacion !== 'ALL' &&
    (row.MOTIVO_REPROGRAMACION ?? '') !== filters.motivoReprogramacion
  ) {
    return false;
  }

  if (filters.tipoReferencia !== 'ALL' && row.TIPO_REFERENCIA !== filters.tipoReferencia) {
    return false;
  }

  if (filters.tipoPago !== 'ALL' && row.TIPO_PAGO !== filters.tipoPago) {
    return false;
  }

  if (filters.tipo !== 'ALL' && row.TIPO !== filters.tipo) {
    return false;
  }

  if (filters.concepto !== 'ALL' && row.CONCEPTO !== filters.concepto) {
    return false;
  }

  return true;
};

const matchesCreatedAtRange = (row: SolicitudDiariaRow, range: DateRange | undefined) => {
  if (!range?.from) {
    return true;
  }

  const createdAt = parseCreatedAt(row.CREATED_AT);
  if (!createdAt) {
    return false;
  }

  const from = range.from;
  const to = range.to ?? range.from;

  return createdAt >= from && createdAt <= to;
};

const matchesColumnSearches = (
  row: SolicitudDiariaRow,
  searches: Record<ColumnSearchKey, string>
) => {
  return Object.entries(searches).every(([columnId, rawQuery]) => {
    const query = rawQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return getColumnSearchValue(row, columnId as ColumnSearchKey)
      .toLowerCase()
      .includes(query);
  });
};

const columns: ColumnDef<SolicitudDiariaRow>[] = [
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => <EditarSolicitudDiariaDialog row={row.original} />,
    meta: {
      label: 'Acciones',
      searchable: false,
    },
  },
  {
    accessorKey: 'CLIENT',
    header: 'Cliente',
    meta: {
      label: 'Cliente',
    },
  },
  {
    accessorKey: 'REPROGRAMACION',
    header: 'Reprogramación',
    cell: ({ row }) => (row.original.REPROGRAMACION ? 'SI' : 'NO'),
    meta: {
      label: 'Reprogramación',
    },
  },
  {
    accessorKey: 'MOTIVO_REPROGRAMACION',
    header: 'Motivo',
    cell: ({ row }) => row.original.MOTIVO_REPROGRAMACION || '-',
    meta: {
      label: 'Motivo',
    },
  },
  {
    accessorKey: 'TIPO_REFERENCIA',
    header: 'Tipo Referencia',
    meta: {
      label: 'Tipo Referencia',
    },
  },
  {
    accessorKey: 'TIPO_PAGO',
    header: 'Tipo Pago',
    meta: {
      label: 'Tipo Pago',
    },
  },
  {
    accessorKey: 'TIPO',
    header: 'Tipo',
    meta: {
      label: 'Tipo',
    },
  },
  {
    accessorKey: 'CONCEPTO',
    header: 'Concepto',
    meta: {
      label: 'Concepto',
    },
  },
  {
    accessorKey: 'NUMERO_REFERENCIA',
    header: 'Referencia',
    meta: {
      label: 'Referencia',
    },
  },
  {
    accessorKey: 'INGRESO_ESTIMADO',
    header: 'Ingreso Estimado',
    cell: ({ row }) => currencyFormatter.format(Number(row.original.INGRESO_ESTIMADO || 0)),
    meta: {
      label: 'Ingreso Estimado',
    },
  },
  {
    accessorKey: 'INGRESO_REAL',
    header: 'Ingreso Real',
    cell: ({ row }) =>
      row.original.INGRESO_REAL != null
        ? currencyFormatter.format(Number(row.original.INGRESO_REAL))
        : '-',
    meta: {
      label: 'Ingreso Real',
    },
  },
  {
    accessorKey: 'DIFERENCIA',
    header: 'Diferencia',
    cell: ({ row }) =>
      row.original.DIFERENCIA != null
        ? currencyFormatter.format(Number(row.original.DIFERENCIA))
        : '-',
    meta: {
      label: 'Diferencia',
    },
  },
  {
    accessorKey: 'HAS_ANTICIPO',
    header: 'Tiene Anticipo',
    cell: ({ row }) => (row.original.HAS_ANTICIPO ? 'SI' : 'NO'),
    meta: {
      label: 'Tiene Anticipo',
    },
  },
  {
    accessorKey: 'OBSERVACIONES',
    header: 'Observaciones',
    cell: ({ row }) => (
      <HoverPopover
        text={row.original.OBSERVACIONES}
        className="text-center"
        maxWidthClass="max-w-[320px]"
        heightClassName="h-auto min-h-14"
      />
    ),
    meta: {
      label: 'Observaciones',
    },
  },
  {
    accessorKey: 'CREATED_BY',
    header: 'Creado Por',
    meta: {
      label: 'Creado Por',
    },
  },
  {
    accessorKey: 'CREATED_AT',
    header: 'Creado En',
    cell: ({ row }) => row.original.CREATED_AT_FMT || '-',
    meta: {
      label: 'Creado En',
    },
  },
];

export function SolicitudesDiariasDataTable({ data }: { data: SolicitudDiariaRow[] }) {
  const [selectFilters, setSelectFilters] = React.useState<SelectFilterState>(initialSelectFilters);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [createdAtRange, setCreatedAtRange] = React.useState<DateRange | undefined>(undefined);
  const [columnSearches, setColumnSearches] =
    React.useState<Record<ColumnSearchKey, string>>(initialColumnSearches);

  const filteredData = React.useMemo(() => {
    return data.filter(
      (row) =>
        matchesSelectFilters(row, selectFilters) &&
        matchesCreatedAtRange(row, createdAtRange) &&
        matchesColumnSearches(row, columnSearches)
    );
  }, [columnSearches, createdAtRange, data, selectFilters]);

  const setSelectFilter = (key: keyof SelectFilterState, value: string) => {
    setSelectFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setColumnSearch = (key: ColumnSearchKey, value: string) => {
    setColumnSearches((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setSelectFilters(initialSelectFilters);
    setCreatedAtRange(undefined);
    setColumnSearches(initialColumnSearches);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const hasActiveFilters = React.useMemo(() => {
    const hasSelectFilters = Object.values(selectFilters).some((value) => value !== 'ALL');
    const hasColumnFilters = Object.values(columnSearches).some((value) => value.trim() !== '');
    const hasDateFilter = Boolean(createdAtRange?.from || createdAtRange?.to);

    return hasSelectFilters || hasColumnFilters || hasDateFilter;
  }, [columnSearches, createdAtRange, selectFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [selectFilters, createdAtRange, columnSearches]);

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="min-w-0 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <CardTitle>
          <h1 className="mb-4 text-2xl font-bold tracking-tight">
            Solicitud Diaria de Recursos Operativos
          </h1>
        </CardTitle>

        <MyGPButtonPrimary onClick={clearAllFilters} disabled={!hasActiveFilters}>
          <X /> Limpiar filtros
        </MyGPButtonPrimary>
      </CardHeader>

      <CardContent className="min-w-0 overflow-hidden">
        <div className="mb-4 grid w-full min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <div className="grid w-full min-w-0 gap-2">
            <Label>Reprogramación</Label>
            <Select
              value={selectFilters.reprogramacion}
              onValueChange={(value) => setSelectFilter('reprogramacion', value)}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todas</SelectItem>
                  <SelectItem value="SI">SI</SelectItem>
                  <SelectItem value="NO">NO</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full min-w-0 gap-2">
            <Label>Motivo de Reprogramación</Label>
            <Select
              value={selectFilters.motivoReprogramacion}
              onValueChange={(value) => setSelectFilter('motivoReprogramacion', value)}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Todos los motivos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="NO_ANTICIPO">No se recibió anticipo</SelectItem>
                  <SelectItem value="INSTRUCCION_CLIENTE">Instrucción del Cliente</SelectItem>
                  <SelectItem value="FALTA_DOCUMENTACION">Falta de Documentación</SelectItem>
                  <SelectItem value="MERCANCIA_PARCIAL">Mercancía Parcial</SelectItem>
                  <SelectItem value="OTROS">Otros</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full min-w-0 gap-2">
            <Label>Tipo de Referencia</Label>
            <Select
              value={selectFilters.tipoReferencia}
              onValueChange={(value) => setSelectFilter('tipoReferencia', value)}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CONSIDERADA">Considerada</SelectItem>
                  <SelectItem value="NO_CONSIDERADA">No Considerada</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full min-w-0 gap-2">
            <Label>Tipo de Pago</Label>
            <Select
              value={selectFilters.tipoPago}
              onValueChange={(value) => setSelectFilter('tipoPago', value)}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CON_ANTICIPO">Con Anticipo</SelectItem>
                  <SelectItem value="FINANCIADA">Financiada</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full min-w-0 gap-2">
            <Label>Tipo</Label>
            <Select
              value={selectFilters.tipo}
              onValueChange={(value) => setSelectFilter('tipo', value)}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="PAGADA">Pagada</SelectItem>
                  <SelectItem value="NO_PAGADA">No Pagada</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full min-w-0 gap-2">
            <Label>Concepto</Label>
            <Select
              value={selectFilters.concepto}
              onValueChange={(value) => setSelectFilter('concepto', value)}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Todos los conceptos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CORRESPONSALIAS">Corresponsalias</SelectItem>
                  <SelectItem value="IMPUESTOS">Impuestos</SelectItem>
                  <SelectItem value="PAGO_TERCEROS">Pago a Terceros</SelectItem>
                  <SelectItem value="REGALIAS">Regalias</SelectItem>
                  <SelectItem value="SALDOS_FAVOR">Saldos a Favor</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full min-w-0 gap-2">
            <MyGPCalendar
              dateRange={createdAtRange}
              setDateRange={setCreatedAtRange}
              label="Creado En"
            />
          </div>
        </div>

        <Table className="min-w-full w-max max-w-full">
          <TableHeader className="[&_tr]:border-b-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
            <TableRow>
              {table.getAllLeafColumns().map((column) => {
                const meta = column.columnDef.meta as
                  | { label?: string; searchable?: boolean }
                  | undefined;
                const columnId = column.id as ColumnSearchKey;

                if (meta?.searchable === false) {
                  return <TableHead key={`${column.id}-search`} className="h-auto align-top" />;
                }

                return (
                  <TableHead key={`${column.id}-search`} className="h-auto align-top">
                    <Input
                      className="min-w-[140px]"
                      placeholder={`Buscar ${meta?.label?.toLowerCase() || column.id.toLowerCase()}`}
                      value={columnSearches[columnId] ?? ''}
                      onChange={(event) => setColumnSearch(columnId, event.target.value)}
                    />
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin solicitudes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TablePageSize pagination={pagination} setPagination={setPagination} />
          <TablePagination table={table} />
        </div>
      </CardContent>
    </Card>
  );
}
