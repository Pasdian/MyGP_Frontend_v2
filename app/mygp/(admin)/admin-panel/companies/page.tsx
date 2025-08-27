'use client';

import AdminCrud from '@/components/AdminCrud/AdminCrud';
import AddCompanyButton from '@/components/buttons/admin-panel/companies/AddCompanyButton';
import ModifyCompanyButton from '@/components/buttons/admin-panel/companies/ModifyCompanyButton';
import { getAllCompaniesColumns } from '@/lib/columns/getAllCompaniesColumns';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
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
import AccessGuard from '@/components/AccessGuard/AccessGuard';

function CompanyActions({ row }: { row: Row<getAllCompanies> }) {
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
          <ModifyCompanyButton row={row} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns = getAllCompaniesColumns(CompanyActions);

export default function Companies() {
  return (
    <AccessGuard allowedModules={['All Modules']} allowedRoles={['ADMIN']}>
      <AdminCrud<getAllCompanies>
        addButton={<AddCompanyButton />}
        dataTableUrl="/api/companies/getAllCompanies"
        title="Compañias"
        columns={columns}
      />
    </AccessGuard>
  );
}
