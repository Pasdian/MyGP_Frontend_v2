'use client';

import AdminCrud from '@/components/AdminCrud/AdminCrud';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { getAllModulesColumns } from '@/lib/columns/getAllModulesColumns';
import { getAllModules } from '@/types/getAllModules/getAllModules';
import AddModuleButton from '@/components/buttons/admin-panel/modules/AddModuleButton';
import ModifyModuleButton from '@/components/buttons/admin-panel/modules/ModifyModuleButton';
import AccessGuard from '@/components/AccessGuard/AccessGuard';

function ModulesActions({ row }: { row: Row<getAllModules> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <ModifyModuleButton row={row} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns = getAllModulesColumns(ModulesActions);

export default function Modules() {
  return (
    <AccessGuard allowedModules={['All Modules']} allowedRoles={['ADMIN']}>
      <AdminCrud<getAllModules>
        addButton={<AddModuleButton />}
        dataTableUrl="/api/modules"
        title="Módulos"
        columns={columns}
      />
    </AccessGuard>
  );
}
