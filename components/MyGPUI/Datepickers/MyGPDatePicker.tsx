'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';

type MyGPDatePickerProps = {
  date: Date | undefined;
  setDate: (finalDate: Date | undefined) => void;
  label?: string;
  className?: string;
};

export default function MyGPDatePicker({ date, setDate, label, className }: MyGPDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Ensures id is always valid and unique
  const inputId = React.useId();

  // Prevents crashing if date is not a real Date object
  const formattedDate =
    date instanceof Date ? date.toLocaleDateString('es-MX') : 'Selecciona una fecha';

  return (
    <div className="cursor-pointer flex flex-col gap-2">
      {label && (
        <Label htmlFor={inputId} className="px-1 cursor-pointer">
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={inputId}
            className={cn('justify-between font-normal cursor-pointer', className)}
          >
            {formattedDate}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            locale={es}
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(newDate) => {
              // Ensures the parent always receives valid data
              setDate(newDate ?? undefined);

              // Close only when selecting a valid date
              if (newDate instanceof Date) {
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
