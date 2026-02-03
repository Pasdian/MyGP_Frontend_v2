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

// Adjust these to the real docKeys your backend/progress map expects.
const DOC_KEYS = ['imp.tax.cert', 'imp.tax.efirma', 'imp.tax.constancia'] as const;

const folderKey = 'imp.tax';

export function DatosHaciendaImportadorSub() {
  const { casa_id, setProgressMap, setFolderProgressFromDocKeys } = useCliente();
  const { getCasaUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = EXP_DIGI_SCHEMAS[folderKey];
  type FormType = z.input<typeof formSchema>;

  const defaultValues = EXP_DIGI_DEFAULT_VALUES[folderKey];

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('client_id', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      if (data.constancia?.file) {
        formData.append('imp.tax.cert', data.constancia.file);
      }

      if (data.efirma?.file) {
        formData.append('imp.tax.efirma', data.efirma.file);
      }

      if (data.constancia?.file) {
        formData.append('imp.tax.constancia', data.constancia.file);
      }

      const { failed } = await submitFolderAndUpdateProgress({
        folderKey: folderKey,
        formData,
        docKeys: DOC_KEYS,
        setProgressMap,
        recomputeFolderProgress: setFolderProgressFromDocKeys,
      });

      if (failed.length > 0) {
        toast.error(`Fallaron: ${failed.join(', ')}`);
      } else {
        toast.success('Archivos guardados correctamente');
        form.reset(EXP_DIGI_DEFAULT_VALUES[folderKey]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };
  console.log(form.formState.errors);
  return (
    <ExpDigiCard
      title="Datos de Hacienda del Importador"
      folderKey={folderKey}
      formId="form-datos-hacienda-importador"
      isFormSubmitting={isSubmitting}
    >
      <form id="form-datos-hacienda-importador" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid w-full grid-cols-[auto_1fr] gap-2 items-center">
            <div className="col-span-2 grid w-full gap-2">
              <InputController
                form={form}
                controllerName="certificado.file"
                docKey="imp.legal.acta"
                fieldLabel="Certificado del Importador (.cer):"
                buttonText="Selecciona .cer"
                accept={['.cer']}
              />
              <InputController
                form={form}
                controllerName="efirma.file"
                docKey="imp.legal.acta"
                buttonText="Selecciona .key"
                fieldLabel="e-firma del Importador (.key):"
                accept={['.key']}
              />

              <InputController
                form={form}
                controllerName="constancia.file"
                docKey="imp.legal.acta"
                fieldLabel="Constancia de Situación Fiscal:"
              />
            </div>
          </div>
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
