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
import { Label } from '../../ui/label';

export function MyGPCombo({
  value,
  setValue,
  label,
  options,
  showValue,
  placeholder,
  className,
  pickFirst,
}: {
  value: string;
  setValue: (v: string) => void;
  label?: string;
  options: {
    value: string;
    label: string;
  }[];
  showValue?: boolean;
  placeholder?: string;
  className?: string;
  pickFirst?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  // Only auto-select first if pickFirst is true
  React.useEffect(() => {
    if (pickFirst && !value && options.length > 0) {
      setValue(options[0].value);
    }
  }, [pickFirst, value, options, setValue]);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label className="cursor-pointer" htmlFor={label}>
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            id={label}
            className={cn('cursor-pointer flex justify-between items-center text-left', className)}
          >
            <span
              className="flex-1 truncate text-left"
              title={options?.find((k) => k.value === value)?.label}
            >
              {options?.find((k) => k.value === value)?.label || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[350px] max-h-[300px] overflow-y-hidden">
          <Command
            // return 0 to hide; >0 to show (higher = higher rank)
            filter={(value, search) => {
              const v = value
                .toLowerCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '');
              const s = search
                .toLowerCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '');

              if (!s) return 1;
              // tweak scoring as needed
              if (v.startsWith(s)) return 3;
              if (v.includes(s)) return 2;
              return 0;
            }}
          >
            {' '}
            <CommandInput placeholder={label} className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontraron elementos.</CommandEmpty>
              <CommandGroup>
                {options?.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={`${item.label} ${item.value}`} // searchable by both
                    onSelect={() => {
                      setValue(item.value === value ? '' : item.value);
                      setOpen(false);
                    }}
                  >
                    <div className="grid grid-cols-[auto_1fr] items-center min-w-0 gap-2">
                      {showValue && (
                        <span className="text-xs text-muted-foreground truncate w-[70px]">
                          ({item.value})
                        </span>
                      )}
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    </div>

                    <Check
                      className={cn(
                        'ml-auto h-4 w-4 shrink-0',
                        value === item.value ? 'opacity-100' : 'opacity-0'
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
