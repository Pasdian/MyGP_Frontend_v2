'use client';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { es } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { MyGPButtonGhost } from '../Buttons/MyGPButtonGhost';
import { MyGPButtonPrimary } from '../Buttons/MyGPButtonPrimary';

type MyGPCalendarProps = {
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
  label?: string;
} & React.ComponentProps<typeof Button>; // inherit all <Button> props

export default function MyGPCalendar({
  dateRange,
  setDateRange,
  label,
  ...props
}: MyGPCalendarProps) {
  const [open, setOpen] = React.useState(false);

  const getLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    return { from: lastWeek, to: today };
  };

  const getLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    return { from: lastMonth, to: today };
  };

  const getLastTwoMonths = () => {
    const today = new Date();
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(today.getMonth() - 2);
    return { from: twoMonthsAgo, to: today };
  };

  const getLastYear = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    return { from: oneYearAgo, to: today };
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePresetClick = (preset: DateRange) => {
    setDateRange(preset);
  };

  return (
    <div className="flex flex-col">
      {label && (
        <Label className="cursor-pointer mb-2" htmlFor={label}>
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left" {...props}>
            <CalendarIcon className="mr-3 h-5 w-5 text-slate-500" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                </>
              ) : (
                formatDate(dateRange.from)
              )
            ) : (
              <span className="text-slate-500">Selecciona un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-start">
            <div className="border-r pr-2 pl-1 py-2 space-y-0.5 w-[130px] shrink-0">
              <h4 className="font-semibold text-[11px] text-slate-700 mb-1 px-1">Presets</h4>

              <Button
                variant="ghost"
                className="w-full justify-start text-[11px] font-normal px-2 py-1 h-auto"
                onClick={() => handlePresetClick(getLastWeek())}
              >
                Última Semana
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[11px] font-normal px-2 py-1 h-auto"
                onClick={() => handlePresetClick(getLastMonth())}
              >
                Último Mes
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[11px] font-normal px-2 py-1 h-auto"
                onClick={() => handlePresetClick(getLastTwoMonths())}
              >
                Últimos 2 Meses
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-[11px] font-normal px-2 py-1 h-auto"
                onClick={() => handlePresetClick(getLastYear())}
              >
                Último Año
              </Button>

              <div className="pt-1 border-t mt-1">
                <p className="text-[10px] text-slate-500 mb-0.5 px-1">Personalizado</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[11px] font-normal px-2 py-1 h-auto"
                  onClick={() => setDateRange(undefined)}
                >
                  Limpiar
                </Button>
              </div>
            </div>

            <div className="p-3">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
                showOutsideDays={false}
              />
            </div>
          </div>
          <div className="border-t p-4 flex justify-end gap-2">
            <MyGPButtonGhost
              size="sm"
              onClick={() => {
                setDateRange(undefined);
                setOpen(false);
              }}
            >
              Cancelar
            </MyGPButtonGhost>
            <MyGPButtonPrimary size="sm" onClick={() => setOpen(false)}>
              Aplicar
            </MyGPButtonPrimary>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
