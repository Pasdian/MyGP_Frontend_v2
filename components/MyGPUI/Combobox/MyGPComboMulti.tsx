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
  CommandSeparator,
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
  isModal = true,
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
  isModal?: boolean;
  'aria-invalid'?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef(0);

  React.useEffect(() => {
    if (pickFirst && (!values || values.length === 0) && options.length > 0) {
      setValues([options[0].value]);
    }
  }, [pickFirst, values, options, setValues]);

  const selectedSet = React.useMemo(() => new Set(values || []), [values]);

  const sortedOptions = React.useMemo(() => {
    // Stable: selected first, keep relative order from original `options`
    const selected: { value: string; label: string }[] = [];
    const unselected: { value: string; label: string }[] = [];

    for (const o of options || []) {
      if (selectedSet.has(o.value)) selected.push(o);
      else unselected.push(o);
    }

    return [...selected, ...unselected];
  }, [options, selectedSet]);

  const selectedLabels = React.useMemo(() => {
    const map = new Map((options || []).map((o) => [o.value, o.label]));
    return (values || []).map((v) => map.get(v) ?? v);
  }, [values, options]);

  const buttonText = React.useMemo(() => {
    if (!values || values.length === 0) return placeholder ?? 'Selecciona clientes';
    if (values.length === 1) return selectedLabels[0];
    return `${values.length} seleccionados`;
  }, [values, selectedLabels, placeholder]);

  const toggleValue = React.useCallback(
    (value: string) => {
      // Capture current scroll before list reorders
      if (listRef.current) {
        scrollRef.current = listRef.current.scrollTop;
      }

      setValues((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return current.includes(value)
          ? current.filter((x) => x !== value) // deselect
          : [...current, value]; // select
      });

      onSelect?.();
      setOpen(true);
    },
    [setValues, onSelect]
  );

  // Restore scroll after DOM updates (prevents jump when item moves sections)
  React.useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = scrollRef.current;
    }
  });

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label className="cursor-pointer" htmlFor={label}>
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen} modal={isModal}>
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

            {/* Attach ref here so we can preserve scrollTop */}
            <CommandList ref={listRef}>
              <CommandEmpty>No se encontraron elementos.</CommandEmpty>

              <CommandGroup>
                {sortedOptions.map((item, idx) => {
                  const isSelected = selectedSet.has(item.value);

                  // Optional: draw a separator between selected and unselected
                  const prev = sortedOptions[idx - 1];
                  const prevSelected = prev ? selectedSet.has(prev.value) : true;
                  const needsSeparator = idx > 0 && prevSelected && !isSelected;

                  return (
                    <React.Fragment key={item.value}>
                      {needsSeparator && <CommandSeparator />}

                      <CommandItem
                        value={`${item.label} ${item.value}`}
                        onSelect={() => toggleValue(item.value)}
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
                    </React.Fragment>
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
