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

export function ClientsCombo({
  currentClient,
  setCurrentClient,
  onSelect,
}: {
  currentClient: string;
  setCurrentClient: React.Dispatch<React.SetStateAction<string>>;
  onSelect?: ((value: string) => void) | undefined;
}) {
  const [open, setOpen] = React.useState(false);
  const [clients, setClients] = React.useState<{ value: string; label: string }[]>([]);

  React.useEffect(() => {
    const transformedArray = clientsData.map((item) => ({
      value: item.CVE_IMP,
      label: item.NOM_IMP,
    }));
    setClients(transformedArray);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Label id="client-label">Selecciona un cliente</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-labelledby="client-label"
          >
            {currentClient
              ? clients.find((client) => client.label === currentClient)?.label
              : 'Selecciona un cliente...'}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent id="clientsCombo" className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Buscar por cliente..." className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontro el cliente.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.value}
                    value={client.label}
                    onSelect={(currentValue) => {
                      setCurrentClient(currentValue === currentClient ? '' : currentValue);
                      setOpen(false);
                      onSelect ? onSelect(currentValue) : null;
                    }}
                  >
                    {client.label}
                    <Check
                      className={cn(
                        'ml-auto',
                        currentClient === client.label ? 'opacity-100' : 'opacity-0'
                      )}
                    />
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
