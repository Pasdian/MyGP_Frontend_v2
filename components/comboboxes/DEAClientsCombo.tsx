'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { clientsData } from '@/lib/clients/clientsData';
import { Label } from '../ui/label';

type ClientOption = { value: string; label: string };

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, ''); // remove accents
}

export default function DEAClientsCombo({
  clientName,
  setClientName,
  setClientNumber,
  onSelect,
}: {
  clientName: string;
  setClientName: React.Dispatch<React.SetStateAction<string>>;
  setClientNumber: React.Dispatch<React.SetStateAction<string>> | ((clientNumber: string) => void);
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // 1) Derive options with memo (no state+effect)
  const options: ClientOption[] = React.useMemo(
    () =>
      clientsData.map((item) => ({
        value: String(item.CVE_IMP ?? ''),
        label: String(item.NOM_IMP ?? ''),
      })),
    []
  );

  // 2) Create quick maps for O(1) lookups
  const labelByValue = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const o of options) m.set(o.value, o.label);
    return m;
  }, [options]);

  const valueByLabel = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const o of options) m.set(o.label, o.value);
    return m;
  }, [options]);

  // 3) Filter with normalized search (accent/case insensitive)
  const filtered = React.useMemo(() => {
    const q = normalize(search);
    if (!q) return options;
    return options.filter((o) => normalize(o.label).includes(q) || normalize(o.value).includes(q));
  }, [options, search]);

  // 4) Compute selected label efficiently
  const selectedValue = valueByLabel.get(clientName) ?? '';
  const selectedLabel = clientName || (selectedValue ? labelByValue.get(selectedValue) ?? '' : '');

  const pick = (opt: ClientOption) => {
    // prefer ID as source of truth, but keep name in state for your UI
    setClientName(opt.label);
    setClientNumber(opt.value);
    onSelect(opt.value);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-labelledby="client-label"
            className="w-[200px] h-6 justify-between font-normal text-[12px]"
          >
            {selectedLabel || 'Selecciona un cliente...'}
            <ChevronsUpDown className="opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent id="clientsCombo" className="w-[280px] p-0">
          <Command>
            <CommandInput
              placeholder="Buscar por cliente o ID…"
              className="h-9"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No se encontró el cliente.</CommandEmpty>
              <CommandGroup>
                {filtered.map((client) => {
                  const isSelected = selectedValue
                    ? client.value === selectedValue
                    : client.label === clientName; // fallback for legacy name-based selection
                  return (
                    <CommandItem
                      key={client.value}
                      value={`${client.label} ${client.value}`}
                      onSelect={() => pick(client)}
                    >
                      <div className="flex justify-between w-full">
                        <span>{client.label}</span>
                        <span className="text-xs text-muted-foreground">({client.value})</span>
                      </div>
                      <Check className={cn('ml-auto', isSelected ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
