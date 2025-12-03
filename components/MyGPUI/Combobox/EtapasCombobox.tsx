import * as React from 'react';
import useSWR from 'swr';
import { ChevronsUpDown, Check } from 'lucide-react';

import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getPhasesByAduanaPatente } from '@/types/casa/getPhasesByAduanaPatente';

import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface EtapasComboboxProps {
  ADU_DESP: string;
  PAT_AGEN: string;

  value: string | undefined;
  onValueChange: (value: string, selectedItem?: getPhasesByAduanaPatente) => void;
}

export function EtapasCombobox({ ADU_DESP, PAT_AGEN, value, onValueChange }: EtapasComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const { data, isLoading } = useSWR<getPhasesByAduanaPatente[]>(
    `/api/casa/getPhasesByAduanaPatente?ADU_DESP=${ADU_DESP}&PAT_AGEN=${PAT_AGEN}`,
    axiosFetcher
  );

  const selectedItem = data?.find((item) => item.CVE_ETAP === value);

  const handleSelect = (cveEtap: string) => {
    const selected = data?.find((item) => item.CVE_ETAP === cveEtap);
    onValueChange(cveEtap, selected);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[350px] justify-between"
          disabled={isLoading}
        >
          {isLoading && 'Cargando etapas...'}
          {!isLoading && !selectedItem && 'Selecciona una etapa'}
          {!isLoading && selectedItem && (
            <span className="truncate">
              ({selectedItem.CVE_ETAP}) {selectedItem.DESC_ETAP}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[350px] p-0">
        <Command
          filter={(itemValue, search, keywords) => {
            const searchLower = search.toLowerCase();

            const desc = itemValue.toLowerCase();
            const code = (keywords?.[0] ?? '').toLowerCase();

            const matchesDesc = desc.includes(searchLower);
            const matchesCode = code.includes(searchLower);

            return matchesDesc || matchesCode ? 1 : 0;
          }}
        >
          <CommandInput
            placeholder={isLoading ? 'Cargando etapas...' : 'Buscar por código o descripción...'}
          />
          <CommandList>
            {isLoading && <CommandEmpty>Cargando...</CommandEmpty>}
            {!isLoading && <CommandEmpty>No se encontraron resultados.</CommandEmpty>}

            <CommandGroup>
              {data?.map((item) => (
                <CommandItem
                  key={item.CVE_ETAP}
                  value={item.DESC_ETAP}
                  keywords={[item.CVE_ETAP]}
                  onSelect={() => handleSelect(item.CVE_ETAP)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      item.CVE_ETAP === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex gap-1 items-center truncate">
                    <span className="text-muted-foreground whitespace-nowrap">
                      ({item.CVE_ETAP})
                    </span>
                    <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.DESC_ETAP}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
