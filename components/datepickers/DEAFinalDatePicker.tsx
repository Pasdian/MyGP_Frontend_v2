'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { es } from 'date-fns/locale';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';

export default function DEAFinalDatePicker({
  date,
  setDate,
  onSelect,
}: {
  date: Date | undefined;
  setDate:
    | React.Dispatch<React.SetStateAction<Date | undefined>>
    | ((finalDate: Date | undefined) => void);
  onSelect: (value: Date | undefined) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-26 h-6 justify-between font-normal text-[12px]"
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
              onSelect(date);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
