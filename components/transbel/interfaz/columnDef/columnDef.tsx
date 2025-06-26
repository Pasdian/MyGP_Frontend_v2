import { ColumnDef } from '@tanstack/react-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import UpdatePhase from '../UpdatePhase';
import { getRefsPendingCE } from '@/app/api/transbel/getRefsPendingCE/route';

export const columnDef: ColumnDef<getRefsPendingCE>[] = [
  {
    accessorKey: 'ACCIONES',
    header: 'Acciones',
    cell: ({ row }) => {
      return <UpdatePhase row={row} />;
    },
  },
  {
    accessorKey: 'REFERENCIA',
    header: 'Referencia',
    cell: ({ row }) => {
      if (!row.original.REFERENCIA) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">--</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>No existe un número de referencia</p>
            </TooltipContent>
          </Tooltip>
        );
      }
      const trafficType = row.original.REFERENCIA[1];

      if (
        row.original.ULTIMO_DOCUMENTO_114 &&
        row.original.MSA_130 &&
        (trafficType == 'A' || trafficType == 'F' || trafficType == 'T')
      ) {
        const diffTimestamp =
          +new Date(row.original.ULTIMO_DOCUMENTO_114.split(' ')[0]) -
          +new Date(row.original.MSA_130.split(' ')[0]);

        const diffBetweenDates = diffTimestamp > 0 ? new Date(diffTimestamp).getDate() : 0; // Can't be negative

        if (diffBetweenDates > 4) {
          // 4 days
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-center bg-red-400">{row.original.REFERENCIA}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">
                  La diferencia entre la fecha de último documento y MSA es mayor a 4 días para
                  tráfico aéreo
                </p>
              </TooltipContent>
            </Tooltip>
          );
        }
      } else if (
        row.original.ULTIMO_DOCUMENTO_114 &&
        row.original.MSA_130 &&
        (trafficType == 'M' || trafficType == 'V')
      ) {
        const diffTimestamp =
          +new Date(row.original.ULTIMO_DOCUMENTO_114.split(' ')[0]) -
          +new Date(row.original.MSA_130.split(' ')[0]);
        const diffBetweenDates = diffTimestamp > 0 ? new Date(diffTimestamp).getDate() : 0; // Can't be negative

        if (diffBetweenDates > 11) {
          // 4 days
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-center bg-red-400">{row.original.REFERENCIA}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  La diferencia entre la fecha de último documento y MSA es mayor a 11 días para
                  tráfico marítimo
                </p>
              </TooltipContent>
            </Tooltip>
          );
        }
      }
      return <p className="text-center">{row.original.REFERENCIA}</p>;
    },
  },
  {
    accessorKey: 'EE__GE',
    header: 'EE/GE',
    cell: ({ row }) => {
      if (!row.original.EE__GE) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">--</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>No existe EE/GE</p>
            </TooltipContent>
          </Tooltip>
        );
      }
      return row.original.EE__GE;
    },
  },
  {
    accessorKey: 'ADU_DESP',
    header: 'Aduana',
    cell: ({ row }) => {
      if (!row.original.ADU_DESP) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">--</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>No existe número de aduana</p>
            </TooltipContent>
          </Tooltip>
        );
      }
      return row.original.ADU_DESP;
    },
  },
  {
    accessorKey: 'REVALIDACION_073',
    header: 'Revalidación',
    cell: ({ row }) => {
      if (!row.original.REVALIDACION_073) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">--</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>No existe una fecha de revalidación</p>
            </TooltipContent>
          </Tooltip>
        );
      }

      if (
        row.original.ULTIMO_DOCUMENTO_114 &&
        row.original.REVALIDACION_073.split(' ')[0] >
          row.original.ULTIMO_DOCUMENTO_114.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {row.original.REVALIDACION_073.split(' ')[0]}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de revalidación es mayor que la fecha de último documento</p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.REVALIDACION_073.split(' ')[0] >
          row.original.ENTREGA_TRANSPORTE_138.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {row.original.REVALIDACION_073.split(' ')[0]}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de revalidación es mayor que la fecha de transporte</p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.MSA_130 &&
        row.original.REVALIDACION_073.split(' ')[0] > row.original.MSA_130.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {row.original.REVALIDACION_073.split(' ')[0]}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de revalidación es mayor que la fecha de MSA</p>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        return <p className="text-center">{row.original.REVALIDACION_073.split(' ')[0]}</p>;
      }
    },
  },
  {
    accessorKey: 'ULTIMO_DOCUMENTO_114',
    header: 'Último Documento',
    cell: ({ row }) => {
      if (!row.original.ULTIMO_DOCUMENTO_114) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">--</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>No existe una fecha de último documento</p>
            </TooltipContent>
          </Tooltip>
        );
      }

      if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.ULTIMO_DOCUMENTO_114.split(' ')[0] >
          row.original.ENTREGA_TRANSPORTE_138.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {row.original.ULTIMO_DOCUMENTO_114.split(' ')[0]}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha del último documento es mayor que la fecha de entrega de transporte</p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.MSA_130 &&
        row.original.ULTIMO_DOCUMENTO_114.split(' ')[0] > row.original.MSA_130.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {row.original.ULTIMO_DOCUMENTO_114.split(' ')[0]}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de último documento es mayor que MSA</p>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        return <p className="text-center">{row.original.ULTIMO_DOCUMENTO_114.split(' ')[0]}</p>;
      }
    },
  },
  {
    accessorKey: 'ENTREGA_TRANSPORTE_138',
    header: 'Entrega Transporte',
    cell: ({ row }) => {
      if (!row.original.ENTREGA_TRANSPORTE_138) {
        if (!row.original.ENTREGA_TRANSPORTE_138) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-center bg-red-400">--</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>No existe una fecha de entrega de transporte</p>
              </TooltipContent>
            </Tooltip>
          );
        }
      }

      if (
        row.original.ENTREGA_CDP_140 &&
        row.original.MSA_130 &&
        row.original.ENTREGA_TRANSPORTE_138.split(' ')[0] !== row.original.MSA_130.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {row.original.ENTREGA_TRANSPORTE_138.split(' ')[0]}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de entrega de transporte no es igual a MSA</p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.ENTREGA_CDP_140 &&
        row.original.ENTREGA_TRANSPORTE_138.split(' ')[0] >
          row.original.ENTREGA_CDP_140.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {row.original.ENTREGA_TRANSPORTE_138.split(' ')[0]}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de entrega de transporte es mayor que la fecha de entrega CDP</p>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        return <p className="text-center">{row.original.ENTREGA_TRANSPORTE_138.split(' ')[0]}</p>;
      }
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
      if (!row.original.MSA_130) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">--</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>No existe una fecha de MSA</p>
            </TooltipContent>
          </Tooltip>
        );
      }

      if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.MSA_130.split(' ')[0] !== row.original.ENTREGA_TRANSPORTE_138.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">{row.original.MSA_130.split(' ')[0]}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>MSA no es igual a la fecha de entrega de transporte</p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.ENTREGA_CDP_140 &&
        row.original.MSA_130.split(' ')[0] > row.original.ENTREGA_CDP_140.split(' ')[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">{row.original.MSA_130.split(' ')[0]}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>MSA es mayor que la fecha de entrega CDP</p>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        return <p className="text-center">{row.original.MSA_130.split(' ')[0]}</p>;
      }
    },
  },
  {
    accessorKey: 'ENTREGA_CDP_140',
    header: 'Entrega CDP',
    cell: ({ row }) => {
      if (!row.original.ENTREGA_CDP_140) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">--</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>No existe una fecha de entrega CDP</p>
            </TooltipContent>
          </Tooltip>
        );
      }
      return <p className="text-center">{row.original.ENTREGA_CDP_140.split(' ')[0]}</p>;
    },
  },
  {
    accessorKey: 'CE_140',
    header: 'CE 140',
    cell: ({ row }) => {
      if (!row.original.CE_140) return '-';
      return <p className="text-center">{row.original.CE_140}</p>;
    },
  },
];
