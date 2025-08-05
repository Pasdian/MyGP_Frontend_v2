'use client';

import { InterfaceContext } from '@/contexts/InterfaceContext';
import FinalDatePicker from '@/components/datepickers/FinalDatePicker';
import InitialDatePicker from '@/components/datepickers/InitialDatePicker';
import React from 'react';
import { toast } from 'sonner';
import { InterfaceDataTable } from '@/components/datatables/transbel/InterfaceDataTable';
import { getFormattedDate } from '@/lib/utilityFunctions/getFormattedDate';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

export default function Page() {
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(undefined);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    function validateDates() {
      if (!initialDate) return;
      if (!finalDate) {
        toast.error('Selecciona una fecha de término');
        return;
      }

      const today = new Date();
      const start = new Date(initialDate);
      const end = new Date(finalDate);

      if (start > today) {
        toast.error('La fecha de inicio no puede ser mayor a la fecha actual');
        return;
      }

      if (end > today) {
        toast.error('La fecha de término no puede ser mayor a la fecha actual');
        return;
      }

      if (start >= end) {
        toast.error('La fecha de inicio no puede ser mayor o igual que la fecha de término');
        return;
      }
    }

    validateDates();
  }, [initialDate, finalDate]);

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'AAP']}>
      <div className="flex flex-col justify-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interfaz de Transbel</h1>
          <p className="text-2xl font-light tracking-tight mb-5">
            {initialDate && finalDate
              ? `De ${getFormattedDate(
                  initialDate.toISOString().split('T')[0]
                )} hasta ${getFormattedDate(finalDate.toISOString().split('T')[0])}`
              : null}
          </p>
        </div>
        <div className="mb-5">
          <InitialDatePicker date={initialDate} setDate={setInitialDate} onSelect={() => {}} />
        </div>
        <div className="mb-5">
          <FinalDatePicker date={finalDate} setDate={setFinalDate} onSelect={() => {}} />
        </div>
      </div>
      <div>
        <InterfaceContext.Provider
          value={{
            initialDate: initialDate,
            finalDate: finalDate,
          }}
        >
          <InterfaceDataTable />
        </InterfaceContext.Provider>
      </div>
    </ProtectedRoute>
  );
}
