'use client';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { NuevaSolicitudDiaria } from '@/components/solicitud-diaria/NuevaSolicitudDiaria';
import {
  SolicitudesDiariasDataTable,
  type SolicitudDiariaRow,
} from '@/components/solicitud-diaria/SolicitudesDiariasDataTable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import { type DateRange } from 'react-day-picker';
import useSWR from 'swr';

const formatDateParam = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function SolicitudDiaria() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [createdAtRange, setCreatedAtRange] = React.useState<DateRange | undefined>(undefined);
  const solicitudesDiariasUrl = React.useMemo(() => {
    const params = new URLSearchParams();

    if (createdAtRange?.from) {
      const to = createdAtRange.to ?? createdAtRange.from;
      params.set('created_at_from', formatDateParam(createdAtRange.from));
      params.set('created_at_to', formatDateParam(to));
    }

    const query = params.toString();
    return query ? `/pyapi/dipp/solicitudDiaria?${query}` : '/pyapi/dipp/solicitudDiaria';
  }, [createdAtRange]);

  const { data, mutate, isLoading } = useSWR<SolicitudDiariaRow[]>(
    solicitudesDiariasUrl,
    axiosFetcher
  );

  return (
    <div className="grid gap-4">
      <MyGPDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Nueva Solicitud"
        description="Aquí podrás añadir una nueva solicitud diaria de recursos operativos."
        trigger={
          <MyGPButtonPrimary className="w-[170px]">
            <IconPlus stroke={2} />
            <span className="ml-1">Nueva Solicitud</span>
          </MyGPButtonPrimary>
        }
      >
        {isOpen && (
          <NuevaSolicitudDiaria
            onSuccess={() => {
              setIsOpen(false);
              void mutate();
            }}
          />
        )}
      </MyGPDialog>

      {!isLoading && (
        <SolicitudesDiariasDataTable
          data={data ?? []}
          createdAtRange={createdAtRange}
          setCreatedAtRange={setCreatedAtRange}
        />
      )}
    </div>
  );
}
