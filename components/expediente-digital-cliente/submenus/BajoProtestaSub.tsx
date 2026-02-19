import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldError, FieldGroup } from '@/components/ui/field';
import * as z from 'zod/v4';
import { toast } from 'sonner';
import React from 'react';

import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { useAuth } from '@/hooks/useAuth';
import { EXP_DIGI_DEFAULT_VALUES, EXP_DIGI_SCHEMAS } from '../schemas/schemasMain';
import ExpDigiCard from './ExpDigiCard';
import { submitFolderAndUpdateProgress } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
import { InputController } from '../InputController';

export function BajoProtestaSub() {
  const { casa_id, updateProgressFromSubmitResponse, folderMappings } = useCliente();
  const { getCasaUsername } = useAuth();

  const FOLDER_KEY = 'imp.man';
  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const defaultValues = EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY];
  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const usuarioError =
    form.formState.errors.usuarioSolicitoOperacion?.file?.file

  const agenteError =
    form.formState.errors.agenteAduanalVerificoUsuarios?.file?.file

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('client_id', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      const usuarioFile = data.usuarioSolicitoOperacion.file.file;
      if (usuarioFile) formData.append('man.usuario', usuarioFile);

      const agenteFile = data.agenteAduanalVerificoUsuarios.file.file;
      if (agenteFile) formData.append('man.agente', agenteFile);

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
      title="Manifiesto Bajo Protesta"
      folderKey={FOLDER_KEY}
      formId="form-manifiesto-bajo-protesta"
      isFormSubmitting={isSubmitting}
    >
      <form id="form-manifiesto-bajo-protesta" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="space-y-3">
            <div className="space-y-1">
              <InputController
                form={form}
                docKey="man.usuario"
                controllerName="usuarioSolicitoOperacion.file.file"
                fieldLabel="Manifiesto bajo protesta de decir verdad del usuario que solicitó la operación:"
                accept={['application/pdf']}
                buttonText="Selecciona .pdf"
                formatoDoc="MANIFIESTO_USUARIO_SOLICITO_OPERACION"
              />
              {usuarioError ? <FieldError errors={[usuarioError]} /> : null}
            </div>

            <div className="space-y-1">
              <InputController
                form={form}
                docKey="man.agente"
                controllerName="agenteAduanalVerificoUsuarios.file.file"
                fieldLabel="Manifiesto bajo protesta de decir verdad en el que el Agente Aduanal señale que verificó a los usuarios"
                accept={['application/pdf']}
                buttonText="Selecciona .pdf"
                description="Artículos 49 Bis fracción X, 69, 69 B y 69 B-Bis del CFF"
                formatoDoc="MANIFIESTO_AGENTE_VERIFICO_USUARIO"
              />
              {agenteError ? <FieldError errors={[agenteError]} /> : null}
            </div>
          </div>
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
