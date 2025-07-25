"use client";

import { getAllUsersDeepCopy } from "@/types/users/getAllUsers";
import { ColumnDef, Row } from "@tanstack/react-table";
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
import { createFuzzyFilter } from "../utilityFunctions/createFuzzyFilter";
import ModifyUserButton from "@/components/buttons/admin-panel/users/ModifyUserButton";
import DeleteUserButton from "@/components/buttons/admin-panel/users/DeleteUserButton";

const fuzzyFilter = createFuzzyFilter<getAllUsersDeepCopy>();

export const usersColumns: ColumnDef<getAllUsersDeepCopy>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    filterFn: fuzzyFilter,
  },
  {
    accessorKey: "email",
    header: "Email",
    filterFn: fuzzyFilter,
  },
  {
    accessorKey: "mobile",
    header: "Teléfono",
    filterFn: fuzzyFilter,
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
    filterFn: fuzzyFilter,
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
    filterFn: fuzzyFilter,
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
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      if (!row.original.status) return "--";
      return row.original.status;
    },
  },
  {
    accessorKey: "ACCIONES",
    header: "Acciones",
    cell: ({ row }) => {
      if (!row) return "--";
      return <UserActionsDropDown row={row} />;
    },
  },
];

function UserActionsDropDown({ row }: { row: Row<getAllUsersDeepCopy> }) {
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
      <ModifyUserButton
        row={row}
        open={isModifyUserDialogOpen}
        setIsOpen={setIsModifyUserDialogOpen}
      />
      <DeleteUserButton
        row={row}
        open={isDeleteUserDialogOpen}
        setIsOpen={setIsDeleteUserDialogOpen}
      />
    </div>
  );
}
