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
import { useAuth } from '@/hooks/useAuth';

export function MyGPDeaCombo({
  value,
  setValue,
  label = 'Selecciona un item',
  options,
}: {
  value: string;
  setValue: (v: string) => void;
  label?: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';

  // Assuming user.complete_user.user.companies is an array of objects with CVE_IMP
  const userCompanies = user?.complete_user?.user?.companies || [];

  // Extract CVE_IMP values (e.g., ["123", "456"])
  const companyIds = userCompanies.map((c) => c.CVE_IMP);

  // If admin, skip filtering — otherwise, filter by companyIds
  const filteredOptions = isAdmin
    ? options
    : options.filter((opt) => companyIds.includes(opt.value));

  // Pick the first item in the list
  React.useEffect(() => {
    if (!value && filteredOptions?.length > 0) {
      setValue(filteredOptions[0].value);
    }
  }, [value, filteredOptions, setValue]);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-[150px] h-6 justify-between font-normal text-[12px]"
          >
            <span
              className="truncate"
              title={filteredOptions?.find((k) => k.value === value)?.label}
            >
              {filteredOptions?.find((k) => k.value === value)?.label || `Selecciona ${label}`}
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
                {filteredOptions?.map((item) => {
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
                      <span className="text-[9px] text-gray-500">{item.value}</span>
                      <span className="text-xs font-medium text-foreground truncate w-full text-left">
                        {item.label}
                      </span>
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
