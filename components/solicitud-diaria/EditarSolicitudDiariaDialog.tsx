'use client';

import * as React from 'react';
import { PencilLine } from 'lucide-react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { MyGPButtonWarning } from '../MyGPUI/Buttons/MyGPButtonWarning';
import {
  buildSolicitudDiariaUpdatePayload,
  getSolicitudDiariaErrorMessage,
  SolicitudDiariaForm,
} from './SolicitudDiariaForm';
import type { SolicitudDiariaRow } from './types';
import { PERM } from '@/lib/modules/permissions';
import { useAuth } from '@/hooks/useAuth';

export function EditarSolicitudDiariaDialog({ row }: { row: SolicitudDiariaRow }) {
  const { mutate } = useSWRConfig();
  const { getCasaUsername, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const casaUsername = getCasaUsername().trim().toUpperCase();
  const canSkipDeadline = hasPermission(PERM.DIPP_SOLICITUDES_DIARIAS_ADMIN);
  const canEditSolicitud =
    canSkipDeadline ||
    (row.CREATED_BY ?? '').trim().toUpperCase() === casaUsername;

  const defaultValues = React.useMemo(
    () => ({
      client: row.CLIENT,
      tipoReferencia: row.TIPO_REFERENCIA,
      tipoPago: row.TIPO_PAGO,
      tipo: row.TIPO,
      concepto: row.CONCEPTO,
      numeroReferencia: row.NUMERO_REFERENCIA,
      ingresoEstimado: String(row.INGRESO_ESTIMADO ?? ''),
      ingresoReal: row.INGRESO_REAL != null ? String(row.INGRESO_REAL) : '',
      hasAnticipo: row.HAS_ANTICIPO,
      observaciones: row.OBSERVACIONES ?? '',
    }),
    [row]
  );

  const handleSubmit = async (values: Parameters<typeof buildSolicitudDiariaUpdatePayload>[0]) => {
    try {
      const now = new Date();
      if (!canSkipDeadline && now.getHours() >= 12) {
        toast.error('El horario para actualizar una solicitud es antes de las 12 p.m');
        return;
      }

      await GPClient.patch(
        `/pyapi/dipp/solicitudDiaria/${row.ID_SOLICITUD}`,
        buildSolicitudDiariaUpdatePayload(values)
      );

      await mutate('/pyapi/dipp/solicitudDiaria');
      toast.success('Solicitud diaria actualizada correctamente');
      setIsOpen(false);
    } catch (error: unknown) {
      toast.error(getSolicitudDiariaErrorMessage(error, 'Error al actualizar la solicitud diaria'));
    }
  };

  if (!canEditSolicitud) {
    return null;
  }

  return (
    <MyGPDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={`Actualizar solicitud ${row.NUMERO_REFERENCIA}`}
      description="Aquí podrás actualizar los datos de la solicitud diaria."
      trigger={
        <MyGPButtonWarning
          variant="outline"
          size="sm"
          className="w-full min-w-[110px] py-2 text-white hover:text-white"
        >
          <PencilLine className="mr-2 h-4 w-4" />
          Editar
        </MyGPButtonWarning>
      }
    >
      {isOpen && (
        <SolicitudDiariaForm mode="edit" defaultValues={defaultValues} onSubmit={handleSubmit} />
      )}
    </MyGPDialog>
  );
}
