import { ColumnDef, FilterFn } from "@tanstack/react-table";
import React from "react";
import { getRoles } from "@/types/roles/getRoles";
import AdminPanelModifyRoleButton from "@/components/buttons/admin-panel/roles/AdminPanelModifyRoleButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { rankItem } from "@tanstack/match-sorter-utils";

export const rolesDataTableFuzzyFilter: FilterFn<getRoles> = (
  row,
  columnId,
  value,
  addMeta
) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export const rolesColumns: ColumnDef<getRoles>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    filterFn: rolesDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.name) return "--";
      return row.original.name;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    filterFn: rolesDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.description) return "--";
      return row.original.description;
    },
  },
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir Menú</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <AdminPanelModifyRoleButton row={row} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
