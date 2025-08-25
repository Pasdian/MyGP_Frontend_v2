'use client';

import * as React from 'react';
import useSWRImmutable from 'swr';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import { Select, SelectTrigger, SelectValue } from '../ui/select';

type Props = {
  onValueChange?(value: string): void;
  defaultValue?: string;
};

export default function CompanySelect({ onValueChange, defaultValue = '' }: Props) {
  const { data: companies, isLoading } = useSWRImmutable<getAllCompanies[]>(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );

  const [open, setOpen] = React.useState(false);

  if (isLoading)
    return (
      <div className="flex items-center">
        <div className="mr-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Cargando compañías..." />
            </SelectTrigger>
          </Select>
        </div>
        <Loader2 className="w-5 animate-spin" />
      </div>
    );

  if (!companies || companies.length === 0)
    return (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="No se encontró ninguna compañía" />
        </SelectTrigger>
      </Select>
    );

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Search className="mr-2 h-4 w-4" />
        {companies?.find((c) => c.uuid == defaultValue)?.name || 'Selecciona una compañia'}
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar por nombre, ID o UUID..." />
        <CommandList>
          <CommandEmpty>No se encontró la compañía.</CommandEmpty>
          <CommandGroup heading="Compañías">
            {companies.map((c) => {
              // Include multiple fields in value for built-in filtering
              const value = `${c.name ?? ''} ${c.id ?? ''} ${c.uuid ?? ''}`.trim();
              return (
                <CommandItem
                  key={c.uuid}
                  value={value}
                  onSelect={() => {
                    if (onValueChange) onValueChange(c.uuid || '');
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">UUID: {c.uuid}</span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
