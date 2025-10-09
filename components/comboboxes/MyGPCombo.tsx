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
import { Label } from '../ui/label';

export function MyGPCombo({
  value,
  setValue,
  label = 'Selecciona un item',
  options,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  label?: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="kams">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            id="kams"
            className=" justify-between"
          >
            <span className="truncate" title={options?.find((k) => k.value === value)?.label}>
              {options?.find((k) => k.value === value)?.label || `Selecciona ${label}`}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-max-[350px]">
          <Command>
            <CommandInput placeholder={label} className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontraron elementos.</CommandEmpty>
              <CommandGroup>
                {options?.map((item) => {
                  // include label (and value) so search hits both
                  const searchable = `${item.label} ${item.value}`.toLowerCase();
                  return (
                    <CommandItem
                      key={item.value}
                      value={searchable} // search by label (and value)
                      onSelect={() => {
                        // use the real option value
                        setValue(item.value === value ? '' : item.value);
                        setOpen(false);
                      }}
                    >
                      <span className="truncate">{item.label}</span>
                      <Check
                        className={cn(
                          'ml-auto',
                          value === item.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
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
