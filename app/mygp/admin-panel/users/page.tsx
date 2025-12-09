'use client';

import React from 'react';
import AddUserButton from '@/components/buttons/admin-panel/users/AddUserButton';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { UsersDataTableContext } from '@/contexts/UsersDataTableContext';
import useGetAllUsers from '@/hooks/useGetAllUsers';
import UsersDataTable from '@/components/datatables/admin-panel/UsersDataTable';
import { ADMIN_ROLES } from '@/lib/modules/moduleRole';

export default function Users() {
  const { users: getAllUsers, setUsers: setAllUsers, isLoading: isUsersLoading } = useGetAllUsers();
  return (
    <AccessGuard allowedRoles={ADMIN_ROLES}>
      <UsersDataTableContext.Provider value={{ getAllUsers, setAllUsers, isUsersLoading }}>
        <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Usuarios</h1>
        <div>
          <AddUserButton />
        </div>
        <UsersDataTable />
      </UsersDataTableContext.Provider>
    </AccessGuard>
  );
}
