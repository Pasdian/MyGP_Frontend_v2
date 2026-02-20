'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';

import * as z from 'zod/v4';
import { submitFolderAndUpdateProgress } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';

import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { useAuth } from '@/hooks/useAuth';
import { EXP_DIGI_DEFAULT_VALUES, EXP_DIGI_SCHEMAS } from '../schemas/schemasMain';
import { InputController } from '../InputController';
import ExpDigiCard from './ExpDigiCard';

export function DatosHaciendaImportadorSub() {
  const { casa_id, folderMappings, updateProgressFromSubmitResponse } = useCliente();
  const { getCasaUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const FOLDER_KEY = 'imp.tax';
  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];
  type FormType = z.input<typeof formSchema>;

  const defaultValues = EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY];

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      if (!casa_id?.trim()) {
        toast.error('Selecciona un cliente antes de subir archivos');
        return;
      }

      const formData = new FormData();
      formData.append('client_rfc', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      // IMPORTANT: append using the backend docKey field names
      // Make sure these keys match your DOC_KEYS ordering / schema fields.
      if (data.certificado?.file) {
        formData.append(DOC_KEYS[0] ?? 'imp.tax.cert', data.certificado.file);
      }

      if (data.efirma?.file) {
        formData.append(DOC_KEYS[1] ?? 'imp.tax.efirma', data.efirma.file);
      }

      if (data.constancia?.file) {
        formData.append(DOC_KEYS[2] ?? 'imp.tax.constancia', data.constancia.file);
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
      title="Datos de Hacienda del Importador"
      folderKey={FOLDER_KEY}
      formId="form-datos-hacienda-importador"
      isFormSubmitting={isSubmitting}
    >
      <form id="form-datos-hacienda-importador" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <InputController
            form={form}
            controllerName="certificado.file"
            docKey={DOC_KEYS[0]}
            fieldLabel="Certificado del Importador (.cer):"
            buttonText="Selecciona .cer"
            accept={['.cer']}
            showFile={false}
          />

          <InputController
            form={form}
            controllerName="efirma.file"
            docKey={DOC_KEYS[1]}
            buttonText="Selecciona .key"
            fieldLabel="e-firma del Importador (.key):"
            accept={['.key']}
            showFile={false}
          />

          <InputController
            form={form}
            controllerName="constancia.file"
            docKey={DOC_KEYS[2]}
            fieldLabel="Constancia de Situación Fiscal:"
          />
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
