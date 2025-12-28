import { ColumnDef } from "@tanstack/react-table";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { Embarque } from "@/types/transbel/Embarque";
import { MyGPButtonWarning } from "@/components/MyGPUI/Buttons/MyGPButtonWarning";
import { PencilIcon } from "lucide-react";
import { MyGPDialog } from "@/components/MyGPUI/Dialogs/MyGPDialog";
import { ModifyEmbarque } from "@/components/datatables/transbel/ModifyEmbarque";

const fuzzyFilter = createFuzzyFilter<Embarque>();

export const embarqueColumns: ColumnDef<Embarque>[] = [
  {
    accessorKey: "REF",
    header: () => <div className="text-center w-full">Referencia</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.REF) {
        return <div className="text-center w-full">---</div>;
      }

      return (
        <div className="flex justify-center">
          <MyGPDialog
            trigger={
              <MyGPButtonWarning className="w-[160px]">
                <PencilIcon />
                {row.original.REF}
              </MyGPButtonWarning>
            }
          >
            <ModifyEmbarque
              EE={row.original.EE || ""}
              GE={row.original.GE || ""}
              CECO={row.original.CECO_CUENTA?.split("/")[0] || ""}
              CUENTA={row.original.CECO_CUENTA?.split("/")[1] || ""}
              NUM_REFE={row.original.REF || ""}
            />
          </MyGPDialog>
        </div>
      );
    },
  },
  {
    accessorKey: "PEDIMENTO",
    header: () => <div className="text-center w-full">Pedimento</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.PEDIMENTO) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.PEDIMENTO}</p>;
    },
  },
  {
    accessorKey: "FECHA_ENTRADA_FORMATTED",
    header: () => <div className="text-center w-full">Fecha de Entrada</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      const FECHA_ENTRADA = row.original.FECHA_ENTRADA_FORMATTED;
      if (!FECHA_ENTRADA) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{FECHA_ENTRADA}</p>;
    },
  },
  {
    accessorKey: "ADUANA",
    header: () => <div className="text-center w-full">Aduana</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.ADUANA) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.ADUANA}</p>;
    },
  },
  {
    accessorKey: "PATENTE",
    header: () => <div className="text-center w-full">Patente</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.PATENTE) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.PATENTE}</p>;
    },
  },
  {
    accessorKey: "EE",
    header: () => <div className="text-center w-full">EE</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.EE) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.EE}</p>;
    },
  },
  {
    accessorKey: "GE",
    header: () => <div className="text-center w-full">GE</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.GE) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.GE}</p>;
    },
  },
  {
    accessorKey: "CECO_CUENTA",
    header: () => <div className="text-center w-full">CECO/CUENTA</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.CECO_CUENTA) {
        return <div className="text-center w-full">---</div>;
      }
      return <p className="text-center">{row.original.CECO_CUENTA}</p>;
    },
  },
];
