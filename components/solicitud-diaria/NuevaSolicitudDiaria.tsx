import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import {
  buildSolicitudDiariaBasePayload,
  getSolicitudDiariaErrorMessage,
  SolicitudDiariaForm,
} from './SolicitudDiariaForm';
import { PERM } from '@/lib/modules/permissions';

export function NuevaSolicitudDiaria({ onSuccess }: { onSuccess?: () => void }) {
  const { getCasaUsername, hasPermission } = useAuth();

  const handleSubmit = async (values: Parameters<typeof buildSolicitudDiariaBasePayload>[0]) => {
    try {
      const now = new Date();
      const canSkipDeadline = hasPermission(PERM.DIPP_SOLICITUDES_DIARIAS_ADMIN);

      if (!canSkipDeadline && now.getHours() >= 12) {
        toast.error('El horario para subir una solicitud es antes de las 12 p.m');
        return;
      }

      await GPClient.post('/pyapi/dipp/solicitudDiaria', {
        ...buildSolicitudDiariaBasePayload(values),
        createdBy: getCasaUsername() || 'MYGP',
      });

      toast.success('Solicitud diaria guardada correctamente');
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(getSolicitudDiariaErrorMessage(error, 'Error al guardar la solicitud diaria'));
    }
  };

  return <SolicitudDiariaForm mode="create" onSubmit={handleSubmit} />;
}
