'use client';

import AddCompanyButton from '@/components/buttons/admin-panel/companies/AddCompanyButton';
import CompaniesDataTable from '@/components/datatables/admin-panel/CompaniesDataTable';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import React from 'react';

export default function Companies() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Compañias</h1>
      <AddCompanyButton />
      <CompaniesDataTable />
    </ProtectedRoute>
  );
}
