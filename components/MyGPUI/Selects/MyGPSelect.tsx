'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Option = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

type MyGPSelectProps = Omit<React.ComponentProps<typeof Select>, 'children'> & {
  options: Option[];
  label?: string;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  helperText?: string;
  error?: boolean;
  id?: string;
  size?: 'sm' | 'default';
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
  'aria-required'?: boolean;
};

export function MyGPSelect({
  options,
  label,
  placeholder = 'Selecciona una opción',
  className,
  contentClassName,
  helperText,
  error,
  id,
  size = 'default',
  open: openProp,
  defaultOpen,
  onOpenChange,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-errormessage': ariaErrorMessage,
  'aria-required': ariaRequired,
  ...selectProps
}: MyGPSelectProps) {
  const reactId = React.useId();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? openProp : uncontrolledOpen;

  const selectId = id ?? `mygp-select-${reactId}`;
  const labelId = `${selectId}-label`;
  const helperTextId = `${selectId}-helper-text`;
  const describedBy =
    [ariaDescribedBy, helperText ? helperTextId : undefined].filter(Boolean).join(' ') || undefined;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isOpenControlled, onOpenChange]
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {label && (
        <Label id={labelId} className="cursor-pointer" htmlFor={selectId}>
          {label}
        </Label>
      )}

      <Select {...selectProps} open={open} onOpenChange={handleOpenChange}>
        <SelectTrigger
          id={selectId}
          size={size}
          aria-labelledby={label ? `${labelId} ${selectId}` : undefined}
          aria-invalid={ariaInvalid ?? error}
          aria-describedby={describedBy}
          aria-errormessage={ariaErrorMessage}
          aria-required={ariaRequired}
          className={cn(
            'w-full min-w-0',
            (ariaInvalid ?? error) && 'border-destructive focus-visible:ring-destructive',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent
          className={contentClassName}
          mobileTitle={label || placeholder}
          onMobileClose={() => handleOpenChange(false)}
        >
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

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
