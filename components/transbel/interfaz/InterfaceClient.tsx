'use client';
import { toast } from 'sonner';
import { columnDef } from './columnDef/columnDef';
import { DataTable } from './DataTable';
import React from 'react';
import InitialDatePicker from './InitialDatePicker';
import FinalDatePicker from './FinalDatePicker';

export const InterfaceContext = React.createContext({ initialDate: '', finalDate: '' });

// Define the type for our data
export default function InterfaceClient() {
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(undefined);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    function validateDates() {
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
    }
    validateDates();
  }, [initialDate, finalDate]);

  return (
    <div>
      <div className="flex flex-col justify-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
          <p className="text-2xl font-light tracking-tight mb-5">
            {initialDate && finalDate
              ? `De ${initialDate.toISOString().split('T')[0]} hasta ${
                  finalDate.toISOString().split('T')[0]
                }`
              : null}
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
        {initialDate && finalDate ? (
          <InterfaceContext.Provider
            value={{
              initialDate: initialDate?.toISOString().split('T')[0],
              finalDate: finalDate.toISOString().split('T')[0],
            }}
          >
            <DataTable columns={columnDef} />
          </InterfaceContext.Provider>
        ) : (
          <DataTable columns={columnDef} />
        )}
      </div>
    </div>
  );
}
