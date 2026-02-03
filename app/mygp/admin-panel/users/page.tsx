'use client';

import React from 'react';
import AddUserButton from '@/components/buttons/admin-panel/users/AddUserButton';
import { UsersDataTableContext } from '@/contexts/UsersDataTableContext';
import useGetAllUsers from '@/hooks/useGetAllUsers';
import UsersDataTable from '@/components/datatables/admin-panel/UsersDataTable';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';

export default function Users() {
  const { users: getAllUsers, setUsers: setAllUsers, isLoading: isUsersLoading } = useGetAllUsers();

  return (
    <PermissionGuard requiredPermissions={[PERM.ADMIN_USUARIOS]}>
      <UsersDataTableContext.Provider value={{ getAllUsers, setAllUsers, isUsersLoading }}>
        <h1 className="text-2xl font-bold tracking-tight mb-4">Panel Administrativo / Usuarios</h1>
        <div>
          <AddUserButton />
        </div>
        <UsersDataTable />
      </UsersDataTableContext.Provider>
    </PermissionGuard>
  );
}
