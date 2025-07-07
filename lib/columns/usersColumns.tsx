"use client";

import AdminPanelDeleteUserButton from "@/components/buttons/admin-panel/users/AdminPanelDeleteUserButton";
import AdminPanelModifyUserButton from "@/components/buttons/admin-panel/users/AdminPanelModifyUserButton";
import { getAllUsersDeepCopy } from "@/types/users/getAllUsers";
import { ColumnDef } from "@tanstack/react-table";
import { usersDataTableFuzzyFilter } from "../utilityFunctions/fuzzyFilters/usersDataTableFuzzyFilter";
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

export const usersColumns: ColumnDef<getAllUsersDeepCopy>[] = [
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
    accessorKey: "role_description",
    header: "Rol",
    filterFn: usersDataTableFuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.role_description) {
        return "--";
      }
      return row.original.role_description;
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
      const [isModifyUserDialogOpen, setIsModifyUserDialogOpen] =
        React.useState(false);
      const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] =
        React.useState(false);

      return (
        <div>
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
              <DropdownMenuItem onClick={() => setIsModifyUserDialogOpen(true)}>
                <p>Modificar Usuario</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-red-400 focus:bg-red-500 focus:text-white text-white"
                onClick={() => setIsDeleteUserDialogOpen(true)}
              >
                <p>Eliminar Usuario</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AdminPanelModifyUserButton
            row={row}
            open={isModifyUserDialogOpen}
            setIsOpen={setIsModifyUserDialogOpen}
          />
          <AdminPanelDeleteUserButton
            row={row}
            open={isDeleteUserDialogOpen}
            setIsOpen={setIsDeleteUserDialogOpen}
          />
        </div>
      );
    },
  },
];
