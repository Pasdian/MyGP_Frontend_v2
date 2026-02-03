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
import { ExpiraEnController } from '@/components/expediente-digital-cliente/form-controllers/ExpiraEnController';

export function AcreditacionSub() {
  const { casa_id, setProgressMap, setFolderProgressFromDocKeys, folderMappings } = useCliente();
  const { getCasaUsername } = useAuth();

  const FOLDER_KEY = 'imp.acre';

  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];

  // Must match the schema literals (imp.agent.*), otherwise TS will error.
  const defaultValues = EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('client_id', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      // Upload keys: use your folderMappings keys (acre.*) since that's what your progress/upload expects.
      if (data.obligacionesFiscales?.file) {
        formData.append('acre.legal.opinion', data.obligacionesFiscales.file);
      }

      if (data.datosBancarios?.file) {
        formData.append('acre.legal.banco', data.datosBancarios.file);
      }
      if (data.datosBancariosExp) {
        formData.append('acre.legal.banco.exp', data.datosBancariosExp);
      }

      if (data.conferidoJosePascal?.file) {
        formData.append('acre.legal.encargo_jpc', data.conferidoJosePascal.file);
      }
      if (data.conferidoJosePascalExp) {
        formData.append('acre.legal.encargo_jpc.exp', data.conferidoJosePascalExp);
      }

      if (data.conferidoMarcoBremer?.file) {
        formData.append('acre.legal.encargo_mbg', data.conferidoMarcoBremer.file);
      }
      if (data.conferidoMarcoBremerExp) {
        formData.append('acre.legal.encargo_mbg.exp', data.conferidoMarcoBremerExp);
      }

      const { failed } = await submitFolderAndUpdateProgress({
        folderKey: FOLDER_KEY,
        formData,
        docKeys: DOC_KEYS,
        setProgressMap,
        recomputeFolderProgress: setFolderProgressFromDocKeys,
      });

      if (failed.length > 0) {
        toast.error(`Fallaron: ${failed.join(', ')}`);
      } else {
        toast.success('Archivos guardados correctamente');
        form.reset(defaultValues);
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
      title="Documentos que acredita el Agente Aduanal"
      folderKey={FOLDER_KEY}
      formId="form-acreditacion"
      isFormSubmitting={isSubmitting}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} id="form-acreditacion">
        <FieldGroup>
          <div className="space-y-4 mb-4">
            <InputController
              form={form}
              controllerName="obligacionesFiscales.file"
              docKey="acre.legal.opinion"
              fieldLabel="Opinión de Cumplimiento de Obligaciones Fiscales (mes en curso):"
            />

            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <InputController
                form={form}
                controllerName="datosBancarios.file"
                docKey="acre.legal.banco"
                fieldLabel="Datos Bancarios en Hoja Membretada:"
              />
              <ExpiraEnController form={form} controllerName="datosBancariosExp" />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <InputController
                form={form}
                controllerName="conferidoJosePascal.file"
                docKey="acre.legal.encargo_jpc"
                fieldLabel="Generación del Encargo Conferido A.A. José Antonio Pascal Calvillo (no aplica en exportación):"
              />
              <ExpiraEnController form={form} controllerName="conferidoJosePascalExp" />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <InputController
                form={form}
                controllerName="conferidoMarcoBremer.file"
                docKey="acre.legal.encargo_mbg"
                fieldLabel="Generación del Encargo Conferido A.A. Marco Bremer García (no aplica en exportación):"
              />
              <ExpiraEnController form={form} controllerName="conferidoMarcoBremerExp" />
            </div>
          </div>
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
