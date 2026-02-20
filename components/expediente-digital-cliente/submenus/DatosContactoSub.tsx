'use client';

import * as z from 'zod/v4';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';

import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { useAuth } from '@/hooks/useAuth';

import ExpDigiCard from './ExpDigiCard';
import { EXP_DIGI_DEFAULT_VALUES, EXP_DIGI_SCHEMAS } from '../schemas/schemasMain';
import { submitFolderAndUpdateProgress } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
import { InputController } from '../InputController';

function asFileArray(v: unknown): File[] {
  return Array.isArray(v) ? (v as File[]) : [];
}

export function DatosContactoSub() {
  const { casa_id, updateProgressFromSubmitResponse, folderMappings } = useCliente();
  const { getCasaUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const FOLDER_KEY = 'imp.contact';

  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];
  type FormType = z.input<typeof formSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY] as FormType,
  });

  const onSubmit = async (data: FormType) => {
    try {
      setIsSubmitting(true);

      const fd = new FormData();
      fd.append('client_rfc', casa_id);
      fd.append('uploaded_by', getCasaUsername() || 'MYGP');

      if (data.comprobanteDomicilio?.file) {
        fd.append('imp.contact.domicilio', data.comprobanteDomicilio.file);
      }

      for (const f of asFileArray(data.fotosDomicilioFiscal?.files))
        fd.append('imp.contact.fotos_fiscal', f);
      for (const f of asFileArray(data.fotosAcreditacionLegalInmueble?.files))
        fd.append('imp.contact.fotos_inmueble', f);
      for (const f of asFileArray(data.fotosLugarActividades?.files))
        fd.append('imp.contact.fotos_actividades', f);

      const { failed } = await submitFolderAndUpdateProgress({
        folderKey: FOLDER_KEY,
        formData: fd,
        docKeys: DOC_KEYS,
        updateProgressFromSubmitResponse,
      });

      if (failed.length) toast.error(`Algunos archivos fallaron: ${failed.join(', ')}`);
      else toast.success('Archivos guardados correctamente');

      form.reset(EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY] as FormType);
    } catch (error) {
      console.error(error);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ExpDigiCard
      title="Datos de Contacto del Importador"
      folderKey={FOLDER_KEY}
      formId="form-datos-contacto"
      isFormSubmitting={isSubmitting}
    >
      <form id="form-datos-contacto" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="space-y-4 mb-4">
            <InputController
              form={form}
              controllerName="comprobanteDomicilio.file"
              docKey={DOC_KEYS[0]}
              fieldLabel="Comprobante de Domicilio:"
            />

            <InputController
              form={form}
              controllerName="fotosDomicilioFiscal.files"
              docKey={DOC_KEYS[1]}
              fieldLabel="Fotos Domicilio Fiscal:"
              description="Fachada del inmueble con número exterior e interior"
              isMulti={true}
            />

            <InputController
              form={form}
              controllerName="fotosAcreditacionLegalInmueble.files"
              docKey={DOC_KEYS[2]}
              fieldLabel="Acreditación Legal del Inmueble:"
              description="Contrato de arrendamiento, título de propiedad, etc."
              isMulti={true}
            />

            <InputController
              form={form}
              controllerName="fotosLugarActividades.files"
              docKey={DOC_KEYS[3]}
              fieldLabel="Fotos del lugar de donde realizan sus actividades:"
              description="Donde se observe: fachada del domicilio, maquinaria, equipo de oficina, el personal, medios de transporte y demás medios empleados para la realización de sus actividades."
              isMulti={true}
            />
          </div>
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
