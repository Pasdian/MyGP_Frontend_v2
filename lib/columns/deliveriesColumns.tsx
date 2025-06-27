import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDeliveries } from "@/types/transbel/getDeliveries";
import DeliveriesUpdatePhaseButton from "@/components/buttons/updatePhase/DeliveriesUpdatePhaseButton";

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

export const deliveriesColumns: ColumnDef<getDeliveries>[] = [
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      return <DeliveriesUpdatePhaseButton row={row} />;
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

      return <p className="text-center">{row.original.REFERENCIA}</p>;
    },
  },
  {
    accessorKey: "EE__GE",
    header: "Entrega Entrante",
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
    accessorKey: "ENTREGA_TRANSPORTE_138",
    header: "Entrega a Transporte",
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
    accessorKey: "ENTREGA_CDP_140",
    header: "Entrega a CDP",
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
      return (
        <p className="text-center">
          {row.original.ENTREGA_CDP_140.split(" ")[0]}
        </p>
      );
    },
  },
  {
    accessorKey: "CE_138",
    header: "Código de Excepción",
  },
];
