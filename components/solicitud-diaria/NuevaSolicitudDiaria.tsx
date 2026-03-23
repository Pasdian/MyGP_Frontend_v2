import { SaveAllIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import {
  buildSolicitudDiariaBasePayload,
  getSolicitudDiariaErrorMessage,
  SolicitudDiariaForm,
} from './SolicitudDiariaForm';

export function NuevaSolicitudDiaria({ onSuccess }: { onSuccess?: () => void }) {
  const isDev = process.env.NODE_ENV === 'development';
  const { getCasaUsername } = useAuth();

  const handleSubmit = async (values: Parameters<typeof buildSolicitudDiariaBasePayload>[0]) => {
    try {
      const now = new Date();
      if (!isDev && now.getHours() >= 12) {
        toast.error('El horario para subir una solicitud es antes de las 12 p.m');
        return;
      }

      await GPClient.post('/pyapi/dipp/solicitudDiaria', {
        ...buildSolicitudDiariaBasePayload(values),
        createdBy: getCasaUsername() || 'MYGP',
        createdAt: new Date().toISOString(),
      });

      toast.success('Solicitud diaria guardada correctamente');
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(getSolicitudDiariaErrorMessage(error, 'Error al guardar la solicitud diaria'));
    }
  };

  return <SolicitudDiariaForm mode="create" onSubmit={handleSubmit} />;
}
