'use client';

import * as React from 'react';
import useSWRImmutable from 'swr';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { cn } from '@/lib/utils';
import { AAP_UUID } from '@/lib/companiesUUIDs/companiesUUIDs';
import type { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';

type Option = { uuid: string; label: string; casaId: string };

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const isOption = (o: {
  uuid?: string | null;
  name?: string | null;
  casa_id?: string | null;
}): o is { uuid: string; name: string; casa_id?: string | null } =>
  typeof o.uuid === 'string' &&
  o.uuid.length > 0 &&
  typeof o.name === 'string' &&
  o.name.length > 0;

export default function DEAClientsCombo({
  clientName,
  onSelect,
}: {
  clientName: string;
  onSelect: (casaId: string | null, label: string | null) => void;
}) {
  const { user } = useAuth();
  const allowedCompanies = user?.complete_user?.user?.companies ?? [];
  const isAAP = !!allowedCompanies?.some((c) => c?.uuid === AAP_UUID);

  const { data: allCompanies, isLoading } = useSWRImmutable<getAllCompanies[]>(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );

  const allOptions: Option[] = React.useMemo(
    () =>
      (allCompanies ?? []).filter(isOption).map((c) => ({
        uuid: c.uuid!,
        label: c.name!,
        casaId: c.casa_id ?? '',
      })),
    [allCompanies]
  );

  const visibleOptions: Option[] = React.useMemo(() => {
    if (isAAP) return allOptions;
    const allowed = new Set(
      (allowedCompanies ?? []).map((c) => c?.uuid).filter((id): id is string => !!id)
    );
    return allOptions.filter((o) => allowed.has(o.uuid));
  }, [isAAP, allOptions, allowedCompanies]);

  // Search by name or casa_id
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = normalize(search);
    if (!q) return visibleOptions;
    return visibleOptions.filter(
      (o) => normalize(o.label).includes(q) || normalize(o.casaId).includes(q)
    );
  }, [visibleOptions, search]);

  const selectedLabel = clientName || '';
  const emptyState = isLoading
    ? 'Cargando compañías…'
    : visibleOptions.length === 0
    ? 'No tienes compañías asignadas'
    : 'No se encontró el cliente.';

  const pick = (opt: Option) => {
    onSelect(opt.casaId || null, opt.label);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] h-6 justify-between font-normal text-[12px]"
          >
            <span className="truncate max-w-[250px]">
              {selectedLabel || 'Selecciona una compañia...'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[360px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar por nombre o CASA ID…"
              className="h-9"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{emptyState}</CommandEmpty>
              <CommandGroup heading={isAAP ? 'Todas las compañías' : 'Tus compañías'}>
                {filtered.map((c) => (
                  <CommandItem
                    key={c.uuid}
                    value={`${c.label} ${c.casaId}`} // built-in search also matches CASA ID
                    onSelect={() => pick(c)}
                    className="aria-selected:bg-muted/40"
                  >
                    <div className="flex w-full items-center gap-3">
                      {/* CASA ID on the left */}
                      <span className="w-16 shrink-0 text-[10px] font-mono text-muted-foreground truncate">
                        {c.casaId || '—'}
                      </span>
                      {/* Company name */}
                      <span className="min-w-0 truncate text-xs font-medium">{c.label}</span>

                      {/* Checkmark if current label matches */}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedLabel && selectedLabel === c.label ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
