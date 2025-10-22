import { ColumnDef } from "@tanstack/react-table";
import { getDeliveries } from "@/types/transbel/getDeliveries";
import DeliveriesUpsertPhaseButton from "@/components/buttons/upsertPhase/DeliveriesUpsertPhaseButton";
import ErrorTooltip from "@/components/errortooltip/ErrorTooltip";
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

      return <p className="text-center">{row.original.REFERENCIA ?? "--"}</p>;
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
  // {
  //   accessorKey: "GUIA_HOUSE",
  //   header: "Guía House",
  //   cell: ({ row }) => {
  //     return <p className="text-center">{row.original.GUIA_HOUSE || "--"}</p>;
  //   },
  // },
  {
    accessorKey: "ENTREGA_TRANSPORTE_138_FORMATTED",
    header: "Entrega a Transporte",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (row.original.has_entrega_transporte_error) {
        return (
          <ErrorTooltip
            value={row.original.ENTREGA_TRANSPORTE_138_FORMATTED ?? "--"}
            errorMessage={
              row.original.ENTREGA_TRANSPORTE_138_ERROR_MSG ??
              "Error desconocido"
            }
          />
        );
      }

      return (
        <p className="text-center">
          {row.original.ENTREGA_TRANSPORTE_138_FORMATTED ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "ENTREGA_CDP_140_FORMATTED",
    header: "Entrega a CDP",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (row.original.has_entrega_cdp_error) {
        return (
          <ErrorTooltip
            value={row.original.ENTREGA_CDP_140_FORMATTED ?? "--"}
            errorMessage={
              row.original.ENTREGA_CDP_140_ERROR_MSG ?? "Error desconocido"
            }
          />
        );
      }

      return (
        <p className="text-center">
          {row.original.ENTREGA_CDP_140_FORMATTED ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "CE_140",
    header: "Código de Excepción",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      return <p className="text-center">{row.original.CE_140 ?? "--"}</p>;
    },
  },
];
