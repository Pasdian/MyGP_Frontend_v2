import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { Deliveries } from '@/app/transbel/entregas/page';
import TransbelUpdatePhase from '../TransbelUpdatePhase';

export const transbelDeliveriesCD: ColumnDef<Deliveries>[] = [
  {
    accessorKey: 'NUM_REFE',
    header: 'Referencia',
  },
  {
    accessorKey: 'CVE_ETAP',
    header: 'CE Etapa',
  },
  {
    accessorKey: 'FEC_ETAP',
    header: 'Fecha',
    cell: ({ row }) => {
      if (!row.original.FEC_ETAP) return '-';
      const date = new Date(`${row.original.FEC_ETAP}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'HOR_ETAP',
    header: 'Hora',
    cell: ({ row }) => {
      if (!row.original.HOR_ETAP) return '-';
      return row.original.HOR_ETAP;
    },
  },
  {
    accessorKey: 'OBS_ETAP',
    header: 'Observaciones',
    cell: ({ row }) => {
      if (!row.original.OBS_ETAP) return '-';
      return row.original.OBS_ETAP;
    },
  },
  {
    accessorKey: 'CVE_MODI',
    header: 'CE MODI',
    cell: ({ row }) => {
      if (!row.original.CVE_MODI) return '-';
      return row.original.CVE_MODI;
    },
  },
  {
    accessorKey: 'ACCIONES',
    header: 'Acciones',
    cell: ({ row }) => {
      if (row) {
        return <TransbelUpdatePhase row={row} />;
      } else {
        return '-';
      }
    },
  },
];
