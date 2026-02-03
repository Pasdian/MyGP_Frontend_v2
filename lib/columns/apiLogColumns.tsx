import { ColumnDef } from "@tanstack/react-table";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { TransbelApiLog } from "@/types/transbel/TransbelApiLog";

const fuzzyFilter = createFuzzyFilter<TransbelApiLog>();

export const apiLogColumns: ColumnDef<TransbelApiLog>[] = [
  {
    accessorKey: "REFERENCIA",
    header: "Referencia",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.ref) {
        return <p className="text-center">--</p>;
      }

      return <p className="text-center">{row.original.ref ?? "--"}</p>;
    },
  },
  {
    accessorKey: "ee__ge",
    header: "Entrega Entrante",
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.ee__ge) {
        return <p className="text-center">--</p>;
      }
      return <p className="text-center">{row.original.ee__ge}</p>;
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-center w-full">Creado en</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      const created_at = row.original.created_at;
      if (!created_at) {
        return <div className="text-center w-full">---</div>;
      }
      const formatted = new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "America/Mexico_City",
      }).format(new Date(created_at));
      return <p className="text-center">{formatted}</p>;
    },
  },
  {
    accessorKey: "updated_at",
    header: () => <div className="text-center w-full">Actualizado en</div>,
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      const updated_at = row.original.updated_at;
      if (!updated_at) {
        return <div className="text-center w-full">---</div>;
      }
      const formatted = new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "America/Mexico_City",
      }).format(new Date(updated_at));
      return <p className="text-center">{formatted}</p>;
    },
  },
];
