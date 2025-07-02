import { ColumnDef } from "@tanstack/react-table";
import { getDeliveries } from "@/types/transbel/getDeliveries";
import DeliveriesUpsertPhaseButton from "@/components/buttons/upsertPhase/DeliveriesUpsertPhaseButton";
import { daysFrom } from "../utilityFunctions/daysFrom";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { getFormattedDate } from "../utilityFunctions/getFormattedDate";
import { isCurrentYear } from "../utilityFunctions/isCurrentYear";

export const deliveriesColumns: ColumnDef<getDeliveries>[] = [
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      return <DeliveriesUpsertPhaseButton row={row} />;
    },
  },
  {
    accessorKey: "REFERENCIA",
    header: "Referencia",
    cell: ({ row }) => {
      if (!row.original.REFERENCIA) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe un número de referencia"
          />
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
        return <ErrorTooltip value="--" errorMessage="No existe EE/GE" />;
      }
      return row.original.EE__GE;
    },
  },
  {
    accessorKey: "ENTREGA_TRANSPORTE_138",
    header: "Entrega a Transporte",
    cell: ({ row }) => {
      if (!row.original.ENTREGA_TRANSPORTE_138) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe una fecha de entrega de transporte"
          />
        );
      }

      if (!isCurrentYear(row.original.ENTREGA_TRANSPORTE_138.split(" ")[0])) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
            errorMessage="El año de la fecha de entrega de transporte no es del año en curso"
          />
        );
      }

      if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.ENTREGA_CDP_140 &&
        row.original.ENTREGA_TRANSPORTE_138.split(" ")[0] >
          row.original.ENTREGA_CDP_140.split(" ")[0]
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
            errorMessage="La fecha de entrega de transporte es mayor que la fecha de entrega CDP"
          />
        );
      } else if (
        row.original.ENTREGA_CDP_140 &&
        daysFrom(
          row.original.ENTREGA_CDP_140?.split(" ")[0],
          row.original.ENTREGA_TRANSPORTE_138.split(" ")[0]
        ) > 1
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
            errorMessage=" La diferencia de entrega de transporte y la entrega a CDP es mayor a un dia"
          />
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
          <ErrorTooltip
            value="--"
            errorMessage="No existe una fecha de entrega CDP"
          />
        );
      }

      if (!isCurrentYear(row.original.ENTREGA_CDP_140.split(" ")[0])) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ENTREGA_CDP_140)}
            errorMessage="El año de la fecha de entrega a CDP no es del año en curso"
          />
        );
      }

      return (
        <p className="text-center">
          {getFormattedDate(row.original.ENTREGA_CDP_140)}
        </p>
      );
    },
  },
  {
    accessorKey: "CE_138",
    header: "Código de Excepción",
  },
];
