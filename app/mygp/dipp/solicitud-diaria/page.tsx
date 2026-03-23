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
import useSWR from 'swr';

export default function SolicitudDiaria() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data, mutate, isLoading } = useSWR<SolicitudDiariaRow[]>(
    '/pyapi/dipp/solicitudDiaria',
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

      {!isLoading && <SolicitudesDiariasDataTable data={data ?? []} />}
    </div>
  );
}
