'use client';

import AdminCrud from '@/components/AdminCrud/AdminCrud';
import AddRoleButton from '@/components/buttons/admin-panel/roles/AddRoleButton';
import ModifyRoleButton from '@/components/buttons/admin-panel/roles/ModifyRoleButton';
import { getAllRolesColumns } from '@/lib/columns/getAllRolesColumns';
import { getAllRoles } from '@/types/roles/getAllRoles';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';

function RolesActions({ row }: { row: Row<getAllRoles> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MyGPButtonPrimary className="h-8 w-8 p-0">
          <span className="sr-only">Abrir Menú</span>
          <MoreHorizontal />
        </MyGPButtonPrimary>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <ModifyRoleButton row={row} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns = getAllRolesColumns(RolesActions);

export default function Roles() {
  return (
    <AccessGuard allowedModules={['All Modules']} allowedRoles={['ADMIN']}>
      <AdminCrud<getAllRoles>
        addButton={<AddRoleButton />}
        dataTableUrl="/api/roles"
        title="Roles"
        columns={columns}
      />
    </AccessGuard>
  );
}
