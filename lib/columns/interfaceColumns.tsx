import { ColumnDef } from "@tanstack/react-table";

import { getRefsPendingCE } from "@/types/transbel/getRefsPendingCE";
import InterfaceUpsertPhaseButton from "@/components/buttons/upsertPhase/InterfaceUpsertPhaseButton";
import React from "react";
import { isCurrentYear } from "../utilityFunctions/isCurrentYear";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { getFormattedDate } from "../utilityFunctions/getFormattedDate";
import { businessDaysDiffWithHolidays } from "../utilityFunctions/businessDaysDiffWithHolidays";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";

const fuzzyFilter = createFuzzyFilter<getRefsPendingCE>();

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

      const trafficType = row.original.REFERENCIA.charAt(1);

      if (
        row.original.ULTIMO_DOCUMENTO_114 &&
        row.original.ENTREGA_TRANSPORTE_138 &&
        (trafficType == "A" ||
          trafficType == "F" ||
          trafficType == "T" ||
          trafficType == "M" ||
          trafficType == "V") &&
        businessDaysDiffWithHolidays(
          new Date(row.original.ULTIMO_DOCUMENTO_114),
          new Date(row.original.ENTREGA_TRANSPORTE_138)
        ) > 7
      ) {
        return (
          <ErrorTooltip
            value={row.original.REFERENCIA}
            errorMessage="La diferencia entre la fecha de último documento y la entrega a transporte es mayor a 7 días para tráfico aéreo"
          />
        );
      }
      return <p className="text-center">{row.original.REFERENCIA}</p>;
    },
  },
  {
    accessorKey: "EE__GE",
    header: "EE/GE",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.EE__GE) {
        return <ErrorTooltip value="--" errorMessage="No existe EE/GE" />;
      }
      return row.original.EE__GE;
    },
  },

  {
    accessorKey: "REVALIDACION_073",
    header: "Revalidación",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.REVALIDACION_073) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe una fecha de revalidación"
          />
        );
      }

      if (!isCurrentYear(row.original.REVALIDACION_073)) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.REVALIDACION_073)}
            errorMessage="El año de la fecha de revalidación no es del año en curso"
          />
        );
      }

      if (
        row.original.ULTIMO_DOCUMENTO_114 &&
        row.original.REVALIDACION_073 > row.original.ULTIMO_DOCUMENTO_114
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.REVALIDACION_073)}
            errorMessage="La fecha de revalidación es mayor que la fecha de último documento"
          />
        );
      } else if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.REVALIDACION_073 > row.original.ENTREGA_TRANSPORTE_138
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.REVALIDACION_073)}
            errorMessage="La fecha de revalidación es mayor que la fecha de transporte"
          />
        );
      } else if (
        row.original.MSA_130 &&
        row.original.REVALIDACION_073 > row.original.MSA_130
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.REVALIDACION_073)}
            errorMessage="La fecha de revalidación es mayor que la fecha de transporte"
          />
        );
      }
      return (
        <p className="text-center">
          {getFormattedDate(row.original.REVALIDACION_073)}
        </p>
      );
    },
  },
  {
    accessorKey: "ULTIMO_DOCUMENTO_114",
    header: "Último Documento",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.ULTIMO_DOCUMENTO_114) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe una fecha de último documento"
          />
        );
      }

      if (!isCurrentYear(row.original.ULTIMO_DOCUMENTO_114)) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ULTIMO_DOCUMENTO_114)}
            errorMessage="El año de la fecha de último documento no es del año en curso"
          />
        );
      }

      if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.ULTIMO_DOCUMENTO_114 > row.original.ENTREGA_TRANSPORTE_138
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ULTIMO_DOCUMENTO_114)}
            errorMessage="La fecha del último documento es mayor que la fecha de entrega de transporte"
          />
        );
      } else if (
        row.original.MSA_130 &&
        row.original.ULTIMO_DOCUMENTO_114 > row.original.MSA_130
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ULTIMO_DOCUMENTO_114)}
            errorMessage="La fecha de último documento es mayor que MSA"
          />
        );
      }
      return (
        <p className="text-center">
          {getFormattedDate(row.original.ULTIMO_DOCUMENTO_114)}
        </p>
      );
    },
  },
  {
    accessorKey: "MSA_130",
    header: "MSA",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.MSA_130) {
        return (
          <ErrorTooltip value="--" errorMessage="No existe una fecha de MSA" />
        );
      }

      if (!isCurrentYear(row.original.MSA_130)) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.MSA_130)}
            errorMessage="El año de la fecha de MSA no es del año en curso"
          />
        );
      }

      if (
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.MSA_130 !== row.original.ENTREGA_TRANSPORTE_138
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.MSA_130)}
            errorMessage="MSA no es igual a la fecha de entrega de transporte"
          />
        );
      } else if (
        row.original.ENTREGA_CDP_140 &&
        row.original.MSA_130 > row.original.ENTREGA_CDP_140
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.MSA_130)}
            errorMessage="MSA es mayor que la fecha de entrega CDP"
          />
        );
      }
      return (
        <p className="text-center">{getFormattedDate(row.original.MSA_130)}</p>
      );
    },
  },
  {
    accessorKey: "ENTREGA_TRANSPORTE_138",
    header: "Entrega Transporte",
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
            errorMessage="El año de la fecha de último documento no es del año en curso"
          />
        );
      }

      if (
        row.original.MSA_130 &&
        row.original.ENTREGA_TRANSPORTE_138 &&
        row.original.ENTREGA_TRANSPORTE_138 !== row.original.MSA_130
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
            errorMessage="La fecha de entrega de transporte no es igual a MSA"
          />
        );
      }
      return (
        <p className="text-center">
          {getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
        </p>
      );
    },
  },
  {
    accessorKey: "CE_138",
    header: "Código de Excepción 138",
    filterFn: fuzzyFilter,
  },
];
