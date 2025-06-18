'use client';
import * as React from 'react';
import { GPClient } from '@/axios-instance';
import { toast } from 'sonner';
import { TransbelInterfaceDT } from '@/components/transbel/interfaz/TransbelInterfaceDT';
import { TailwindSpinner } from '@/components/ui/tailwind-spinner';
import { transbelInterfaceCD } from './columnDefs/transbelInterfaceCD';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { RefsPending } from '@/app/transbel/interfaz/page';

// Define the type for our data

const today = new Date();

export default function TransbelClientInterface({ defaultData }: { defaultData: RefsPending[] }) {
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(undefined);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<RefsPending[]>(defaultData);

  React.useEffect(() => {
    async function fetchData() {
      const today = new Date();
      // Common mistakes that the user can do
      if (initialDate == undefined) {
        toast.error('Selecciona una fecha de inicio');
        return;
      } else if (initialDate > today) {
        toast.error('La fecha de inicio no puede ser mayor a la fecha actual');
        return;
      } else if (finalDate == undefined) {
        toast.error('Selecciona una fecha de termino');
        return;
      } else if (initialDate > finalDate) {
        toast.error('La fecha de inicio no puede ser mayor o igual que la fecha de termino');
        return;
      } else if (finalDate <= initialDate) {
        toast.error('La fecha de termino no puede ser menor o igual a la fecha de inicio');
        return;
      } else if (finalDate > today) {
        toast.error('La fecha de termino no puede ser mayor a la fecha actual');
        return;
      }

      // Format both dates as yyyy-mm-dd
      const initialDateISO = initialDate?.toISOString().split('T')[0];
      const finalDateISO = finalDate?.toISOString().split('T')[0];

      setIsLoading((oldState) => !oldState);
      await GPClient.get(
        `/api/transbel/getRefsPendingCE?initialDate=${initialDateISO}&finalDate=${finalDateISO}`
      )
        .then((res: { data: RefsPending[] }) => {
          const data = res.data;
          if (data.length == 0) {
            toast.error('No hay resultados para las fechas seleccionadas');
            setData(data); // Empty array
            setIsLoading((oldState) => !oldState);
            return;
          }
          console.log(data);
          // Only get date as yyyy-mm-dd
          data.map((item: RefsPending) => {
            if (item.MSA_130) {
              const date = new Date(item.MSA_130).toLocaleDateString('es-pa').split('/');
              const month = date[0];
              const day = date[1];
              const year = date[2];
              // ISO format
              item.MSA_130 = `${year}-${month}-${day}`;
            }
            if (item.ENTREGA_CDP_140) {
              const date = new Date(item.ENTREGA_CDP_140).toLocaleDateString('es-pa').split('/');
              const month = date[0];
              const day = date[1];
              const year = date[2];
              // ISO format
              item.ENTREGA_CDP_140 = `${year}-${month}-${day}`;
            }
            if (item.REVALIDACION_073) {
              const date = new Date(item.REVALIDACION_073).toLocaleDateString('es-pa').split('/');
              const month = date[0];
              const day = date[1];
              const year = date[2];
              // ISO format
              item.REVALIDACION_073 = `${year}-${month}-${day}`;
            }
            if (item.ENTREGA_TRANSPORTE_138) {
              const date = new Date(item.ENTREGA_TRANSPORTE_138)
                .toLocaleDateString('es-pa')
                .split('/');
              const month = date[0];
              const day = date[1];
              const year = date[2];
              // ISO format
              item.ENTREGA_TRANSPORTE_138 = `${year}-${month}-${day}`;
            }
            if (item.ULTIMO_DOCUMENTO_114) {
              const date = new Date(item.ULTIMO_DOCUMENTO_114)
                .toLocaleDateString('es-pa')
                .split('/');
              const month = date[0];
              const day = date[1];
              const year = date[2];
              // ISO format
              item.ULTIMO_DOCUMENTO_114 = `${year}-${month}-${day}`;
            }
          });

          setData(data);
          setIsLoading((oldState) => !oldState);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
    fetchData();
  }, [initialDate, finalDate]);

  // This conditions should be true in order to NOT display the data table
  const cond =
    initialDate == undefined ||
    finalDate == undefined ||
    initialDate >= finalDate ||
    initialDate > today ||
    finalDate > today ||
    finalDate <= initialDate;

  return (
    <div>
      <div className="flex flex-col justify-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
          <p className="text-2xl font-light tracking-tight mb-5">
            {isLoading || cond
              ? null
              : `De ${initialDate?.toLocaleDateString(
                  'es-MX'
                )} hasta ${finalDate?.toLocaleDateString('es-MX')}`}
          </p>
        </div>
        <div className="mb-5">
          <DatePicker date={initialDate} setDate={setInitialDate} title={'Fecha de Inicio'} />
        </div>
        <div className="mb-5">
          <DatePicker date={finalDate} setDate={setFinalDate} title={'Fecha de Termino'} />
        </div>
      </div>
      <div>
        {isLoading ? (
          <TailwindSpinner />
        ) : (
          <TransbelInterfaceDT columns={transbelInterfaceCD} data={data} />
        )}
      </div>
    </div>
  );
}

function DatePicker({
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
