import { axiosFetcher } from '@/axios-instance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import useSWRImmutable from 'swr/immutable';
import { Button } from '../ui/button';
import { getRoles } from '@/types/roles/getRoles';

export default function AdminPanelRoleSelect({
  onValueChange,
  defaultValue = '',
}: {
  onValueChange?(value: string): void;
  defaultValue?: string;
}) {
  const { data, isLoading } = useSWRImmutable<getRoles[]>('/api/roles', axiosFetcher);
  if (isLoading)
    return (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Cargando roles..." />
        </SelectTrigger>
      </Select>
    );

  if (!data)
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
        {data.map((role) => {
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
