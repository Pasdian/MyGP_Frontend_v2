import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import React from 'react';
import { RolesContext } from '@/contexts/RolesContext';

export default function AdminPanelRoleSelect({
  onValueChange,
  defaultValue = '',
}: {
  onValueChange?(value: string): void;
  defaultValue?: string;
}) {
  const roles = React.useContext(RolesContext);
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
