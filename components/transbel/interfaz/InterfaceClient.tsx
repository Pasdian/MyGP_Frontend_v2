'use client';
import { GPClient } from '@/axios-instance';
import { toast } from 'sonner';
import { columnDef } from './columnDef/columnDef';
import { DataTable } from './DataTable';
import React, { SetStateAction } from 'react';
import InitialDatePicker from './InitialDatePicker';
import FinalDatePicker from './FinalDatePicker';
import TailwindSpinner from '@/components/TailwindSpinner';
import { getRefsPendingCE } from '@/app/api/transbel/getRefsPendingCE/route';

export const InterfaceContext = React.createContext<{
  setShouldFetch: React.Dispatch<SetStateAction<boolean>>;
} | null>(null);

// Define the type for our data
export default function InterfaceClient({ defaultData }: { defaultData: getRefsPendingCE[] }) {
  const [stateToday] = React.useState(new Date());
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(undefined);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(undefined);
  const [shouldFetch, setShouldFetch] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<getRefsPendingCE[]>(defaultData);

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
        .then((res: { data: getRefsPendingCE[] }) => {
          const data = res.data;
          if (data.length == 0) {
            toast.error('No hay resultados para las fechas seleccionadas');
            setData([]);
            setIsLoading((oldState) => !oldState);
            return;
          }

          // Get date as yyyy-mm-dd
          data.map((item: getRefsPendingCE) => {
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
  }, [initialDate, finalDate, shouldFetch]);

  return (
    <div>
      <div className="flex flex-col justify-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
          <p className="text-2xl font-light tracking-tight mb-5">
            {isLoading ||
            initialDate == undefined ||
            finalDate == undefined ||
            initialDate >= finalDate ||
            initialDate > stateToday ||
            finalDate > stateToday ||
            finalDate <= initialDate
              ? null
              : `De ${initialDate?.toLocaleDateString(
                  'es-MX'
                )} hasta ${finalDate?.toLocaleDateString('es-MX')}`}
          </p>
        </div>
        <div className="mb-5">
          <InitialDatePicker date={initialDate} setDate={setInitialDate} />
        </div>
        <div className="mb-5">
          <FinalDatePicker date={finalDate} setDate={setFinalDate} />
        </div>
      </div>
      <div>
        {isLoading ? (
          <TailwindSpinner />
        ) : (
          <InterfaceContext.Provider value={{ setShouldFetch: setShouldFetch }}>
            <DataTable columns={columnDef} data={data} />
          </InterfaceContext.Provider>
        )}
      </div>
    </div>
  );
}
