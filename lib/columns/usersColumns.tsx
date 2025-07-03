"use client";

import AdminPanelDeleteUserButton from "@/components/buttons/admin-panel/users/AdminPanelDeleteUserButton";
import AdminPanelModifyUserButton from "@/components/buttons/admin-panel/users/AdminPanelModifyUserButton";
import { getAllUsers } from "@/types/users/getAllUsers";
import { ColumnDef, Row } from "@tanstack/react-table";
import { usersDataTableFuzzyFilter } from "../utilityFunctions/fuzzyFilters/usersDataTableFuzzyFilter";
import { RolesContext } from "@/contexts/RolesContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export const usersColumns: ColumnDef<getAllUsers>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    filterFn: usersDataTableFuzzyFilter,
  },
  {
    accessorKey: "email",
    header: "Email",
    filterFn: usersDataTableFuzzyFilter,
  },
  {
    accessorKey: "mobile",
    header: "Teléfono",
    filterFn: usersDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.mobile) {
        return "--";
      }
      return row.original.mobile;
    },
  },
  {
    accessorKey: "role_id",
    header: "Rol",
    filterFn: usersDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.role_id) {
        return "--";
      }
      return <AdminPanelDisplayUserRole row={row} />;
    },
  },
  {
    accessorKey: "casa_user_name",
    header: "Nombre de Usuario CASA",
    filterFn: usersDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.casa_user_name) {
        return "--";
      }
      return row.original.casa_user_name;
    },
  },
  {
    accessorKey: "status",
    header: "Estatus",
    filterFn: usersDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.status) return "--";
      if (row.original.status == "active") {
        return "Activo";
      } else {
        return "Inactivo";
      }
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
              <AdminPanelModifyUserButton row={row} />
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <AdminPanelDeleteUserButton row={row} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function AdminPanelDisplayUserRole({ row }: { row: Row<getAllUsers> }) {
  const roles = React.useContext(RolesContext);
  const userRole = roles?.find((role) => role.id == row.original.role_id);
  return userRole ? userRole.name : "--";
}
