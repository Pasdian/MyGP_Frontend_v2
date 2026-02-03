import { ColumnDef, Row } from "@tanstack/react-table";
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import { getAllCompanies } from "@/types/getAllCompanies/getAllCompanies";

const fuzzyFilter = createFuzzyFilter<getAllCompanies>();

export function getAllCompaniesColumns(
  Actions: React.ComponentType<{ row: Row<getAllCompanies> }>
): ColumnDef<getAllCompanies>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      filterFn: fuzzyFilter,
      cell: ({ row }) => {
        if (!row.original.NOM_IMP) return "--";
        return row.original.NOM_IMP;
      },
    },
    {
      accessorKey: "ACCIONES",
      header: "Acciones",
      cell: ({ row }) => {
        return <Actions row={row} />;
      },
    },
  ];
}
