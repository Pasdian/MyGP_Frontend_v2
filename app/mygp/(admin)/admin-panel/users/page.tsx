'use client';

import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DeleteUserButton from '@/components/buttons/admin-panel/users/DeleteUserButton';
import ModifyUserButton from '@/components/buttons/admin-panel/users/ModifyUserButton';
import RoleGuard from '@/components/RoleGuard/RoleGuard';
import { getAllUsersColumns } from '@/lib/columns/getAllUsersColumns';
import { getAllUsers } from '@/types/users/getAllUsers';
import { Row } from '@tanstack/react-table';
import React from 'react';
import AdminCrud from '@/components/AdminCrud/AdminCrud';
import AddUserButton from '@/components/buttons/admin-panel/users/AddUserButton';

function UserActionsDropdown({ row }: { row: Row<getAllUsers> }) {
  const [isModifyUserDialogOpen, setIsModifyUserDialogOpen] = React.useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = React.useState(false);

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
          <DropdownMenuItem asChild>
            <ModifyUserButton
              open={isModifyUserDialogOpen}
              setIsOpen={setIsModifyUserDialogOpen}
              row={row}
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="bg-red-400 focus:bg-red-500 focus:text-white text-white"
            asChild
          >
            <DeleteUserButton
              open={isDeleteUserDialogOpen}
              setIsOpen={setIsDeleteUserDialogOpen}
              row={row}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const columns = getAllUsersColumns(UserActionsDropdown);

export default function Users() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminCrud<getAllUsers>
        addButton={<AddUserButton />}
        dataTableUrl="/api/users/getAllUsers"
        title="Usuarios"
        columns={columns}
      />
    </RoleGuard>
  );
}
