import React from 'react';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { ChevronDownIcon } from 'lucide-react';
import { es } from 'date-fns/locale';
import { Calendar } from './ui/calendar';

export default function DatePicker({
  date,
  setDate,
  title,
}: {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  title: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="date" className="px-1">
        {title}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date" className="w-48 justify-between font-normal">
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
