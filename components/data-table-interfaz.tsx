'use client';

import * as React from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define the type for our data
type Reference = {
  REFERENCIA: string;
  EE__GE: string;
  ADU_DESP: string;
  REVALIDACION_073: string;
  ULTIMO_DOCUMENTO_114: string;
  ENTREGA_TRANSPORTE_138: string;
  CE_138: string;
  MSA_130: string;
  ENTREGA_CDP_140: string | null;
  CE_140: string | null;
};

// Define the columns
const columns: ColumnDef<Reference>[] = [
  {
    accessorKey: 'REFERENCIA',
    header: 'Referencia',
  },
  {
    accessorKey: 'EE__GE',
    header: 'EE/GE',
  },
  {
    accessorKey: 'ADU_DESP',
    header: 'Aduana',
  },
  {
    accessorKey: 'REVALIDACION_073',
    header: 'Revalidación',
    cell: ({ row }) => {
      const date = new Date(row.original.REVALIDACION_073);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'ULTIMO_DOCUMENTO_114',
    header: 'Último Documento',
    cell: ({ row }) => {
      const date = new Date(row.original.ULTIMO_DOCUMENTO_114);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'ENTREGA_TRANSPORTE_138',
    header: 'Entrega Transporte',
    cell: ({ row }) => {
      const date = new Date(row.original.ENTREGA_TRANSPORTE_138);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'CE_138',
    header: 'CE 138',
  },
  {
    accessorKey: 'MSA_130',
    header: 'MSA',
    cell: ({ row }) => {
      const date = new Date(row.original.MSA_130);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'ENTREGA_CDP_140',
    header: 'Entrega CDP',
    cell: ({ row }) => {
      if (!row.original.ENTREGA_CDP_140) return '-';
      const date = new Date(row.original.ENTREGA_CDP_140);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'CE_140',
    header: 'CE 140',
    cell: ({ row }) => row.original.CE_140 || '-',
  },
];

function DataTableInterfaz() {
  const [data, setData] = React.useState<Reference[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/api/transbel/getRefsPendingCE?initialDate=2024-01-01&finalDate=2024-01-31',
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXVpZCI6ImQ4YTlmYmQwLTlhNmMtNDQzMS04YzZhLTg4ZTQ2OTAzZmQ4OCIsIm5hbWUiOiJBbGljZSBCcm93biIsImVtYWlsIjoiYWxpY2UuYnJvd25AZXhhbXBsZS5jb20iLCJyb2xlIjoxLCJpYXQiOjE3NDkyNTM4ODEsImV4cCI6MTc0OTI1NzQ4MX0.UYUzL9oj_DtBLCdO95N1prB-GYg3mNijrRparGM5_oc`,
            },
          }
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTableInterfaz;
