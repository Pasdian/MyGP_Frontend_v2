'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';

export default function MyGPDatePicker({
  date,
  setDate,
  label,
  className,
}: {
  date: Date | undefined;
  setDate:
    | React.Dispatch<React.SetStateAction<Date | undefined>>
    | ((finalDate: Date | undefined) => void);
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="cursor-pointer flex flex-col gap-2">
      {label && (
        <Label htmlFor={label} className="px-1 cursor-pointer">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={label}
            className={cn('justify-between font-normal cursor-pointer', className)}
          >
            {date ? date.toLocaleDateString('es-MX') : 'Selecciona una fecha'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            locale={es}
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
