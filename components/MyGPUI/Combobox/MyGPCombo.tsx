'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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

type Option = {
  value: string;
  label: string;
};

type MyGPComboProps = {
  value: string;
  setValue: (v: string) => void;
  label?: string;
  options: Option[];
  showValue?: boolean;
  placeholder?: string;
  className?: string;
  popoverContentClassName?: string;
  onSelect?: () => void;
  isModal?: boolean;
  pickFirst?: boolean;
  isLoading?: boolean;
  error?: boolean;
  helperText?: string;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
  'aria-required'?: boolean;
};

export function MyGPCombo({
  value,
  setValue,
  label,
  options,
  showValue,
  placeholder = 'Selecciona una opción',
  className,
  popoverContentClassName,
  pickFirst,
  onSelect,
  isModal = false,
  isLoading = false,
  error,
  helperText,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-errormessage': ariaErrorMessage,
  'aria-required': ariaRequired,
}: MyGPComboProps) {
  const [open, setOpen] = React.useState(false);
  const reactId = React.useId();

  const comboId = id ?? `mygp-combo-${reactId}`;
  const labelId = `${comboId}-label`;
  const popoverId = `${comboId}-popover`;
  const helperTextId = `${comboId}-helper-text`;

  const describedBy =
    [ariaDescribedBy, helperText ? helperTextId : undefined].filter(Boolean).join(' ') || undefined;

  React.useEffect(() => {
    if (pickFirst && !value && options.length > 0) {
      setValue(options[0].value);
    }
  }, [pickFirst, value, options, setValue]);

  const selectedOption = options.find((item) => item.value === value);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label id={labelId} className="cursor-pointer" htmlFor={comboId}>
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen} modal={isModal}>
        <PopoverTrigger asChild>
          <Button
            id={comboId}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={popoverId}
            aria-labelledby={label ? `${labelId} ${comboId}` : undefined}
            aria-invalid={ariaInvalid ?? error}
            aria-describedby={describedBy}
            aria-errormessage={ariaErrorMessage}
            aria-required={ariaRequired}
            disabled={isLoading}
            className={cn(
              'flex items-center justify-between text-left cursor-pointer',
              (ariaInvalid ?? error) && 'border-destructive focus-visible:ring-destructive',
              className
            )}
          >
            <span className="flex-1 truncate text-left" title={selectedOption?.label}>
              {selectedOption?.label || placeholder}
            </span>

            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-70" />
            ) : (
              <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          id={popoverId}
          className={cn('w-[350px] max-h-[300px] overflow-y-hidden p-0', popoverContentClassName)}
        >
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
            <CommandInput placeholder={label || placeholder} className="h-9" />
            <CommandList role="listbox" aria-labelledby={labelId}>
              <CommandEmpty>No se encontraron elementos.</CommandEmpty>

              <CommandGroup>
                {options.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={`${item.label} ${item.value}`}
                    role="option"
                    aria-selected={value === item.value}
                    onSelect={() => {
                      setValue(item.value === value ? '' : item.value);
                      setOpen(false);
                      onSelect?.();
                    }}
                  >
                    <div className="flex w-full min-w-0 items-center gap-2">
                      {showValue && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          ({item.value})
                        </span>
                      )}

                      <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                        {item.label}
                      </span>
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

      {helperText && (
        <p
          id={helperTextId}
          className={cn(
            'text-sm',
            (ariaInvalid ?? error) ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
