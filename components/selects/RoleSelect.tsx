'use client';

import React from 'react';
import useSWR from 'swr';
import { getAllRoles } from '@/types/roles/getAllRoles';
import { Loader2 } from 'lucide-react';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { MyGPSelect } from '@/components/MyGPUI/Selects/MyGPSelect';

export default function RoleSelect({
  onValueChange,
  defaultValue = '',
}: {
  onValueChange?(value: string): void;
  defaultValue?: string;
}) {
  const { data: roles, isLoading: isRolesLoading } = useSWR<getAllRoles[]>(
    '/api/roles',
    axiosFetcher
  );

  if (isRolesLoading)
    return (
      <div className="flex items-center">
        <div className="mr-2 flex-1">
          <MyGPSelect disabled options={[]} placeholder="Cargando roles..." />
        </div>
        <Loader2 className="w-5 animate-spin" />
      </div>
    );

  if (!roles)
    return <MyGPSelect disabled options={[]} placeholder="No se encontró ningún rol" />;

  return (
    <MyGPSelect
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      placeholder="Selecciona un rol..."
      options={roles.map((role) => ({
        value: role.uuid || '',
        label: `${role.id} - ${role.name}`,
      }))}
    />
  );
}
