import { ColumnDef } from "@tanstack/react-table";

import InterfaceUpsertPhaseButton from "@/components/buttons/upsertPhase/InterfaceUpsertPhaseButton";
import React from "react";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
import { getFormattedDate } from "../utilityFunctions/getFormattedDate";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { getRefsPendingCE } from "@/types/transbel/getRefsPendingCE";

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

      if (row.original.has_error && row.original.BUSINESS_DAYS_ERROR_MSG) {
        return (
          <ErrorTooltip
            value={row.original.REFERENCIA}
            errorMessage={row.original.BUSINESS_DAYS_ERROR_MSG}
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

      if (row.original.has_error && row.original.REVALIDACION_073_ERROR_MSG) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.REVALIDACION_073)}
            errorMessage={row.original.REVALIDACION_073_ERROR_MSG}
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

      if (
        row.original.has_error &&
        row.original.ULTIMO_DOCUMENTO_114_ERROR_MSG
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ULTIMO_DOCUMENTO_114)}
            errorMessage={row.original.ULTIMO_DOCUMENTO_114_ERROR_MSG}
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

      if (row.original.has_error && row.original.MSA_130_ERROR_MSG) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.MSA_130)}
            errorMessage={row.original.MSA_130_ERROR_MSG}
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

      if (
        row.original.has_error &&
        row.original.ENTREGA_TRANSPORTE_138_ERROR_MSG
      ) {
        return (
          <ErrorTooltip
            value={getFormattedDate(row.original.ENTREGA_TRANSPORTE_138)}
            errorMessage={row.original.ENTREGA_TRANSPORTE_138}
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
    accessorKey: "ENTREGA_CDP_140",
    header: "Entrega a CDP",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.ENTREGA_CDP_140) {
        return (
          <ErrorTooltip
            value="--"
            errorMessage="No existe una fecha de entrega de transporte"
          />
        );
      }

      return (
        <p className="text-center">
          {row.original.ENTREGA_CDP_140
            ? getFormattedDate(row.original.ENTREGA_CDP_140)
            : "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "CE_138",
    header: "CE 138",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      return (
        <p className="text-center">
          {row.original.CE_138 ? row.original.CE_138 : "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "CE_140",
    header: "CE 140",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      return (
        <p className="text-center">
          {row.original.CE_140 ? row.original.CE_140 : "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "workato_last_modified",
    header: "Fecha Último Envio",
    cell: ({ row }) => {
      return (
        <p className="text-center">
          {row.original.workato_created_at
            ? getFormattedDate(String(row.original.workato_created_at))
            : "--"}
        </p>
      );
    },
  },
];
