import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRefsPendingCE } from "@/types/transbel/getRefsPendingCE";
import InterfaceUpsertPhaseButton from "@/components/buttons/upsertPhase/InterfaceUpsertPhaseButton";
import { daysFrom } from "../utilityFunctions/daysFrom";

const getFormattedDate = (d: string | undefined) => {
  if (!d) return;
  const date = d.split(" ")[0];
  const splittedDate = date.split("-");

  const day = splittedDate[2];
  const month = splittedDate[1];
  const year = splittedDate[0];
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};

export const interfaceColumns: ColumnDef<getRefsPendingCE>[] = [
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      return <InterfaceUpsertPhaseButton row={row} />;
    },
  },
  {
    accessorKey: "REFERENCIA",
    header: "Referencia",
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
        row.original.ENTREGA_TRANSPORTE_138 &&
        (trafficType == "A" || trafficType == "F" || trafficType == "T")
      ) {
        if (
          daysFrom(
            row.original.ULTIMO_DOCUMENTO_114.split(" ")[0],
            row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
          ) > 7
        ) {
          // 7 days
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-center bg-red-400">
                  {row.original.REFERENCIA}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">
                  La diferencia entre la fecha de último documento y la entrega
                  a transporte es mayor a 7 días para tráfico aéreo
                </p>
              </TooltipContent>
            </Tooltip>
          );
        }
      } else if (
        row.original.ULTIMO_DOCUMENTO_114 &&
        row.original.ENTREGA_TRANSPORTE_138 &&
        (trafficType == "M" || trafficType == "V")
      ) {
        if (
          daysFrom(
            row.original.ULTIMO_DOCUMENTO_114.split(" ")[0],
            row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
          ) > 7
        ) {
          // 7 days
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-center bg-red-400">
                  {row.original.REFERENCIA}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  La diferencia entre la fecha de último documento y la entrega
                  a transporte es mayor a 7 días para tráfico marítimo
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
    accessorKey: "EE__GE",
    header: "EE/GE",
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
    accessorKey: "REVALIDACION_073",
    header: "Revalidación",
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
        row.original.REVALIDACION_073.split(" ")[0] >
          row.original.ULTIMO_DOCUMENTO_114.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.REVALIDACION_073)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                La fecha de revalidación es mayor que la fecha de último
                documento
              </p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.REVALIDACION_073.split(" ")[0] >
          row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.REVALIDACION_073)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                La fecha de revalidación es mayor que la fecha de transporte
              </p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.REVALIDACION_073.split(" ")[0] >
          row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.REVALIDACION_073)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de revalidación es mayor que la fecha de MSA</p>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        return (
          <p className="text-center">
            {getFormattedDate(row.original.REVALIDACION_073)}
          </p>
        );
      }
    },
  },
  {
    accessorKey: "ULTIMO_DOCUMENTO_114",
    header: "Último Documento",
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
        row.original.ULTIMO_DOCUMENTO_114.split(" ")[0] >
          row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.ULTIMO_DOCUMENTO_114)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                La fecha del último documento es mayor que la fecha de entrega
                de transporte
              </p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.ULTIMO_DOCUMENTO_114.split(" ")[0] >
          row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.ULTIMO_DOCUMENTO_114)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de último documento es mayor que MSA</p>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        return (
          <p className="text-center">
            {getFormattedDate(row.original.ULTIMO_DOCUMENTO_114)}
          </p>
        );
      }
    },
  },
  {
    accessorKey: "MSA_130",
    header: "MSA",
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
        row.original.MSA_130.split(" ")[0] !==
          row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.MSA_130)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>MSA no es igual a la fecha de entrega de transporte</p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.ENTREGA_CDP_140 &&
        row.original.MSA_130.split(" ")[0] >
          row.original.ENTREGA_CDP_140.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.MSA_130)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>MSA es mayor que la fecha de entrega CDP</p>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        return (
          <p className="text-center">
            {getFormattedDate(row.original.MSA_130)}
          </p>
        );
      }
    },
  },
  {
    accessorKey: "ENTREGA_TRANSPORTE_138",
    header: "Entrega Transporte",
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
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.ENTREGA_TRANSPORTE_138.split(" ")[0] !==
          row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>La fecha de entrega de transporte no es igual a MSA</p>
            </TooltipContent>
          </Tooltip>
        );
      } else if (
        row.original.ENTREGA_CDP_140 &&
        row.original.ENTREGA_TRANSPORTE_138.split(" ")[0] >
          row.original.ENTREGA_CDP_140.split(" ")[0]
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-center bg-red-400">
                {getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                La fecha de entrega de transporte es mayor que la fecha de
                entrega CDP
              </p>
            </TooltipContent>
          </Tooltip>
        );
      } else {
        return (
          <p className="text-center">
            {getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
          </p>
        );
      }
    },
  },
  {
    accessorKey: "CE_138",
    header: "Código de Excepción 138",
  },
];
