'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import React from 'react';
import useSWR from 'swr';
import { getAllRoles } from '@/types/roles/getAllRoles';
import { Loader2 } from 'lucide-react';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';

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
        <div className="mr-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Cargando roles..." />
            </SelectTrigger>
          </Select>
        </div>
        <Loader2 className="w-5 animate-spin" />
      </div>
    );

  if (!roles)
    return (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="No se encontró ningún rol" />
        </SelectTrigger>
      </Select>
    );

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona una rol..." />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => {
          return (
            <div key={role.name}>
              <SelectItem value={role.id.toString()}>
                {role.id} - {role.name}
              </SelectItem>
            </div>
          );
        })}
      </SelectContent>
    </Select>
  );
}
