'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  isModal = false,
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
  const reactId = React.useId();
  const isMobile = useIsMobile();

  const comboId = `mygp-combo-multi-${reactId}`;
  const labelId = `${comboId}-label`;
  const popoverId = `${comboId}-popover`;
  const mobileTitleId = `${comboId}-dialog-title`;

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

  const contentLabelId = label ? labelId : isMobile ? mobileTitleId : undefined;

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

  const trigger = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      aria-haspopup={isMobile ? 'dialog' : 'listbox'}
      aria-controls={popoverId}
      aria-labelledby={label ? `${labelId} ${comboId}` : undefined}
      aria-invalid={ariaInvalid}
      id={comboId}
      className={cn(
        'flex w-full min-w-0 cursor-pointer items-center justify-between text-left',
        ariaInvalid && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      {...props}
    >
      <span className="flex-1 truncate text-left" title={selectedLabels.join(', ')}>
        {buttonText}
      </span>
      <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
    </Button>
  );

  const commandContent = (
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
      className={cn(isMobile && 'h-full')}
    >
      <CommandInput placeholder={label || placeholder} className="h-9" />

      <CommandList
        ref={listRef}
        role="listbox"
        aria-labelledby={contentLabelId}
        className={cn(isMobile ? 'flex-1 max-h-none' : 'max-h-[300px]')}
      >
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
                  role="option"
                  aria-selected={isSelected}
                  onSelect={() => toggleValue(item.value)}
                >
                  <div className="flex w-full min-w-0 items-center gap-2">
                    {showValue && (
                      <span className="shrink-0 text-xs text-muted-foreground">({item.value})</span>
                    )}

                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">
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
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {label && (
        <Label id={labelId} className="cursor-pointer" htmlFor={comboId}>
          {label}
        </Label>
      )}

      {isMobile ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent
            id={popoverId}
            className="
              top-0 left-0
              flex h-[100dvh] max-h-[100dvh]
              w-screen max-w-none
              translate-x-0 translate-y-0
              flex-col gap-0 overflow-hidden
              rounded-none border-0 p-0
            "
          >
            <DialogHeader className="border-b px-4 py-3 text-left">
              <DialogTitle id={mobileTitleId} className="pr-10 text-base">
                {label || placeholder || 'Selecciona clientes'}
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-hidden">{commandContent}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Popover open={open} onOpenChange={setOpen} modal={isModal}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>

          <PopoverContent
            id={popoverId}
            className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
          >
            {commandContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
