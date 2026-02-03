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

export function MyGPComboMulti({
  values,
  setValues,
  label,
  options,
  showValue,
  placeholder,
  className,
  pickFirst,
  onSelect,
  'aria-invalid': ariaInvalid,
  ...props
}: {
  values: string[];
  setValues: React.Dispatch<React.SetStateAction<string[]>>;
  label?: string;
  options: { value: string; label: string }[];
  showValue?: boolean;
  placeholder?: string;
  className?: string;
  onSelect?: () => void;
  pickFirst?: boolean;
  'aria-invalid'?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (pickFirst && (!values || values.length === 0) && options.length > 0) {
      setValues([options[0].value]);
    }
  }, [pickFirst, values, options, setValues]);

  const selectedLabels = React.useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o.label]));
    return (values || []).map((v) => map.get(v) ?? v);
  }, [values, options]);

  const buttonText = React.useMemo(() => {
    if (!values || values.length === 0) return placeholder ?? 'Selecciona clientes';
    if (values.length === 1) return selectedLabels[0];
    return `${values.length} clientes seleccionados`;
  }, [values, selectedLabels, placeholder]);

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
            aria-invalid={ariaInvalid}
            id={label}
            className={cn(
              'cursor-pointer flex justify-between items-center text-left',
              ariaInvalid && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            {...props}
          >
            <span className="flex-1 truncate text-left" title={selectedLabels.join(', ')}>
              {buttonText}
            </span>
            <ChevronsUpDown className="ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[350px] max-h-[320px] overflow-y-hidden">
          <Command
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
              if (v.startsWith(s)) return 3;
              if (v.includes(s)) return 2;
              return 0;
            }}
          >
            <CommandInput placeholder={label} className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontraron elementos.</CommandEmpty>

              <CommandGroup>
                {options?.map((item) => {
                  const isSelected = (values || []).includes(item.value);

                  return (
                    <CommandItem
                      key={item.value}
                      value={`${item.label} ${item.value}`}
                      onSelect={() => {
                        setValues((prev) => {
                          const current = Array.isArray(prev) ? prev : [];
                          if (current.includes(item.value))
                            return current.filter((x) => x !== item.value);
                          return [...current, item.value];
                        });
                        onSelect?.();
                        setOpen(true);
                      }}
                    >
                      <div className="flex items-center min-w-0 gap-2 w-full">
                        {showValue && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({item.value})
                          </span>
                        )}

                        <span className="text-xs font-semibold truncate min-w-0 flex-1">
                          {item.label}
                        </span>
                      </div>

                      <Check
                        className={cn(
                          'ml-auto h-4 w-4 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0'
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
