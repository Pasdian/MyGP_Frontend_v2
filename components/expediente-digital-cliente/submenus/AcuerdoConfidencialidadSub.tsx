import * as z from 'zod/v4';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldGroup } from '@/components/ui/field';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import ExpDigiCard from './ExpDigiCard';
import { EXP_DIGI_DEFAULT_VALUES, EXP_DIGI_SCHEMAS } from '../schemas/schemasMain';
import { submitFolderAndUpdateProgress } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
import { InputController } from '../InputController';

export function AcuerdoConfidencialidadSub() {
  const { casa_id, updateProgressFromSubmitResponse, folderMappings } = useCliente();

  const FOLDER_KEY = 'com.conf';

  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const { getCasaUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY],
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('client_rfc', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      if (data.acuerdoConfidencialidad?.file) {
        formData.append(data.acuerdoConfidencialidad.docKey, data.acuerdoConfidencialidad.file);
      }

      if (data.acuerdoSocioComercial?.file) {
        formData.append(data.acuerdoSocioComercial.docKey, data.acuerdoSocioComercial.file);
      }

      const { failed } = await submitFolderAndUpdateProgress({
        folderKey: FOLDER_KEY,
        formData,
        docKeys: DOC_KEYS,
        updateProgressFromSubmitResponse,
      });

      if (failed.length > 0) {
        toast.error(`Fallaron: ${failed.join(', ')}`);
      } else {
        toast.success('Archivos guardados correctamente');
        form.reset(EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ExpDigiCard
      title="Acuerdo Confidencialidad y Socio Comercial"
      folderKey={FOLDER_KEY}
      formId="form-acuerdo-confidencialidad"
      isFormSubmitting={isSubmitting}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} id="form-acuerdo-confidencialidad">
        <FieldGroup>
          <div className="space-y-4 mb-4">
            <InputController
              form={form}
              controllerName="acuerdoConfidencialidad.file"
              docKey="com.acuerdo.conf"
              fieldLabel="Acuerdo Confidencialidad:"
              formatoDoc="ACUERDO_CONFIDENCIALIDAD"
            />

            <InputController
              form={form}
              controllerName="acuerdoSocioComercial.file"
              docKey="com.acuerdo.socio"
              fieldLabel="Acuerdo de Colaboración Socio Comercial:"
              formatoDoc="ACUERDO_SOCIO_COMERCIAL"
            />
          </div>
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
