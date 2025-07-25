import { ColumnDef } from "@tanstack/react-table";
import { getDeliveries } from "@/types/transbel/getDeliveries";
import DeliveriesUpsertPhaseButton from "@/components/buttons/upsertPhase/DeliveriesUpsertPhaseButton";
import { businessDaysDiffWithHolidays } from "../utilityFunctions/businessDaysDiffWithHolidays";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { isCurrentYear } from "../utilityFunctions/isCurrentYear";
import { getFormattedDate } from "../utilityFunctions/getFormattedDate";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";

const fuzzyFilter = createFuzzyFilter<getDeliveries>();

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
    filterFn: fuzzyFilter,
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
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.EE__GE) {
        return <ErrorTooltip value="--" errorMessage="No existe EE/GE" />;
      }
      return row.original.EE__GE;
    },
  },
  {
    accessorKey: "GUIA_HOUSE",
    header: "Guía House",
    cell: ({ row }) => {
      const trafficTypeChar = row.original.REFERENCIA?.charAt(1);

      if (
        !row.original.GUIA_HOUSE &&
        trafficTypeChar !== "M" &&
        trafficTypeChar !== "V"
      ) {
        return <ErrorTooltip value="--" errorMessage="No existe guía house" />;
      }

      return <p className="text-center">{row.original.GUIA_HOUSE || "--"}</p>;
    },
  },
  {
    accessorKey: "ENTREGA_TRANSPORTE_138",
    header: "Entrega a Transporte",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.ENTREGA_TRANSPORTE_138) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe una fecha de entrega de transporte"
          />
        );
      }

      if (!isCurrentYear(row.original.ENTREGA_TRANSPORTE_138)) {
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
        row.original.ENTREGA_TRANSPORTE_138 > row.original.ENTREGA_CDP_140
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
            errorMessage="La fecha de entrega de transporte es mayor que la fecha de entrega CDP"
          />
        );
      } else if (
        !row.original.CE_140 &&
        row.original.ENTREGA_CDP_140 &&
        businessDaysDiffWithHolidays(
          new Date(row.original.ENTREGA_TRANSPORTE_138),
          new Date(row.original.ENTREGA_CDP_140)
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
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.ENTREGA_CDP_140) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe una fecha de entrega CDP"
          />
        );
      }

      if (!isCurrentYear(row.original.ENTREGA_CDP_140)) {
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
    accessorKey: "CE_140",
    header: "Código de Excepción",
    filterFn: fuzzyFilter,
  },
];
