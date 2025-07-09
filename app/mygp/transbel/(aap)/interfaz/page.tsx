'use client';

import { InterfaceContext } from '@/contexts/InterfaceContext';
import FinalDatePicker from '@/components/datepickers/FinalDatePicker';
import InitialDatePicker from '@/components/datepickers/InitialDatePicker';
import { interfaceColumns } from '@/lib/columns/interfaceColumns';
import React from 'react';
import { toast } from 'sonner';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import { InterfaceDataTable } from '@/components/datatables/transbel/InterfaceDataTable';
import { ADMIN_ROLE_UUID, OPERACIONES_AAP_UUID } from '@/lib/roles/roles';
import { useAuth } from '@/hooks/useAuth';
import { getFormattedDate } from '@/lib/utilityFunctions/getFormattedDate';

export default function Page() {
  const allowedRoles = [ADMIN_ROLE_UUID, OPERACIONES_AAP_UUID];
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(undefined);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(undefined);

  const { user, isAuthLoading, userRoleUUID } = useAuth();

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

  if (isAuthLoading || !user) return;
  if (!allowedRoles.includes(userRoleUUID)) {
    return <p>No tienes permisos para ver este contenido.</p>;
  }

  return (
    <AuthProvider>
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
          <InitialDatePicker date={initialDate} setDate={setInitialDate} />
        </div>
        <div className="mb-5">
          <FinalDatePicker date={finalDate} setDate={setFinalDate} />
        </div>
      </div>
      <div>
        <InterfaceContext.Provider
          value={{
            initialDate: initialDate,
            finalDate: finalDate,
          }}
        >
          <InterfaceDataTable columns={interfaceColumns} />
        </InterfaceContext.Provider>
      </div>
    </AuthProvider>
  );
}
