'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { es } from 'react-day-picker/locale';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { GPClient } from '@/axios-instance';
import { toast } from 'sonner';
import { TransbelDataTable } from '@/components/transbel-datatable';
import { TailwindSpinner } from '@/components/ui/tailwind-spinner';

// Define the type for our data
type Reference = {
  REFERENCIA: string;
  EE__GE: string;
  ADU_DESP: string;
  REVALIDACION_073: string;
  ULTIMO_DOCUMENTO_114: string;
  ENTREGA_TRANSPORTE_138: string;
  CE_138: string;
  MSA_130: string;
  ENTREGA_CDP_140: string | null;
  CE_140: string | null;
};

// Define the columns
const columns: ColumnDef<Reference>[] = [
  {
    accessorKey: 'REFERENCIA',
    header: 'Referencia',
  },
  {
    accessorKey: 'EE__GE',
    header: 'EE/GE',
  },
  {
    accessorKey: 'ADU_DESP',
    header: 'Aduana',
  },
  {
    accessorKey: 'REVALIDACION_073',
    header: 'Revalidación',
    cell: ({ row }) => {
      const date = new Date(row.original.REVALIDACION_073);
      if (row.original.REVALIDACION_073 == null) {
        return '-';
      }
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ULTIMO_DOCUMENTO_114',
    header: 'Último Documento',
    cell: ({ row }) => {
      const date = new Date(row.original.ULTIMO_DOCUMENTO_114);
      if (row.original.ULTIMO_DOCUMENTO_114 == null) {
        return '-';
      }
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ENTREGA_TRANSPORTE_138',
    header: 'Entrega Transporte',
    cell: ({ row }) => {
      const date = new Date(row.original.ENTREGA_TRANSPORTE_138);
      if (row.original.ENTREGA_TRANSPORTE_138 == null) {
        return '-';
      }
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'CE_138',
    header: 'CE 138',
  },
  {
    accessorKey: 'MSA_130',
    header: 'MSA',
    cell: ({ row }) => {
      const date = new Date(row.original.MSA_130);
      if (date == null) {
        return '-';
      }
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'ENTREGA_CDP_140',
    header: 'Entrega CDP',
    cell: ({ row }) => {
      if (!row.original.ENTREGA_CDP_140) return '-';
      const date = new Date(row.original.ENTREGA_CDP_140);
      if (date == null) {
        return '-';
      }
      return date.toLocaleDateString('es-MX');
    },
  },
  {
    accessorKey: 'CE_140',
    header: 'CE 140',
    cell: ({ row }) => row.original.CE_140 || '-',
  },
];

export default function TransbelClientInterface() {
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(undefined);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [today] = React.useState(new Date());

  React.useEffect(() => {
    async function fetchData() {
      const today = new Date();
      // Common mistakes
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
      const formattedInitialDate = initialDate?.toISOString().split('T')[0];
      const formattedFinalDate = finalDate?.toISOString().split('T')[0];

      setIsLoading((oldState) => !oldState);
      await GPClient.get(
        `/api/transbel/getRefsPendingCE?initialDate=${formattedInitialDate}&finalDate=${formattedFinalDate}`
      )
        .then((res) => {
          if (res.data.length == 0) {
            toast.error('No hay resultados para las fechas seleccionadas');
            setIsLoading((oldState) => !oldState);
            return;
          }
          setData(res.data);
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
      <div className="flex mb-4">
        <div className="mr-4">
          <InitialDatePicker date={initialDate} setDate={setInitialDate} />
        </div>
        <div>
          <FinalDatePicker date={finalDate} setDate={setFinalDate} />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
        <p className="text-2xl font-light tracking-tight mb-4">
          {isLoading || cond
            ? null
            : `De ${initialDate?.toLocaleDateString('es-MX')} hasta ${finalDate?.toLocaleDateString(
                'es-MX'
              )}`}
        </p>
      </div>
      {isLoading ? (
        <div className="flex w-full h-[25px] justify-center">
          <TailwindSpinner />
        </div>
      ) : (
        <TransbelDataTable columns={columns} data={data} />
      )}
    </div>
  );
}

function InitialDatePicker({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Fecha de Inicio
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

// The same as above
function FinalDatePicker({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Fecha de Inicio
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
