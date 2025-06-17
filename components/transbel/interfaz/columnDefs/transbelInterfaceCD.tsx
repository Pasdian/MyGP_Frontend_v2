import { TTransbelData } from '@/app/transbel/interfaz/page';
import { ColumnDef } from '@tanstack/react-table';

export const transbelInterfaceCD: ColumnDef<TTransbelData>[] = [
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
      if (!row.original.REVALIDACION_073) return '-';
      // Set timezone to 00:00:00 for correct displaying
      const date = new Date(`${row.original.REVALIDACION_073}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ULTIMO_DOCUMENTO_114',
    header: 'Último Documento',
    cell: ({ row }) => {
      if (!row.original.ULTIMO_DOCUMENTO_114) return '-';
      const date = new Date(`${row.original.ULTIMO_DOCUMENTO_114}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ENTREGA_TRANSPORTE_138',
    header: 'Entrega Transporte',
    cell: ({ row }) => {
      if (!row.original.ENTREGA_TRANSPORTE_138) return '-';
      const date = new Date(`${row.original.ENTREGA_TRANSPORTE_138}T00:00:00`);
      return date.toLocaleDateString('es-MX');
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
      if (!row.original.MSA_130) return '-';
      const date = new Date(`${row.original.MSA_130}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ENTREGA_CDP_140',
    header: 'Entrega CDP',
    cell: ({ row }) => {
      if (!row.original.ENTREGA_CDP_140) return '-';
      const date = new Date(`${row.original.ENTREGA_CDP_140}T00:00:00`);
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'CE_140',
    header: 'CE 140',
    cell: ({ row }) => row.original.CE_140 || '-',
  },
];
