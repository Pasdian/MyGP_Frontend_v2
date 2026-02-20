'use client';

import React from 'react';
import * as z from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { InputController } from '../InputController';
import { EXP_DIGI_DEFAULT_VALUES, EXP_DIGI_SCHEMAS } from '../schemas/schemasMain';
import { submitFolderAndUpdateProgress } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import ExpDigiCard from '../submenus/ExpDigiCard';

export function DocumentosComplementariosMain() {
  const {
    casa_id,
    progressMap,
    folderMappings,
    updateProgressFromSubmitResponse,
    getAccordionClassName,
  } = useCliente();

  const { getCasaUsername } = useAuth();

  const FOLDER_KEY = 'cmp.docs';
  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const [value, setValue] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY],
  });

  // Prefer reading folder progress computed in context
  const folderProgress = progressMap[FOLDER_KEY] ?? 0;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!casa_id?.trim()) {
      toast.error('Selecciona un cliente antes de subir archivos');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('client_rfc', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      if (data.cuestionarioLavadoTerrorismo?.file) {
        formData.append(
          data.cuestionarioLavadoTerrorismo.docKey,
          data.cuestionarioLavadoTerrorismo.file
        );
      }

      if (data.altaClientes?.file) {
        formData.append(data.altaClientes.docKey, data.altaClientes.file);
      }

      if (data.listaClinton?.file) {
        formData.append(data.listaClinton.docKey, data.listaClinton.file);
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
    <Accordion type="single" collapsible className="w-full" value={value} onValueChange={setValue}>
      <AccordionItem value="documentos-complementarios-main">
        <AccordionTrigger className={getAccordionClassName(DOC_KEYS, progressMap)}>
          <div>
            <p>Documentos Complementarios - {folderProgress}% completado</p>
          </div>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-2 text-balance">
          <ExpDigiCard
            title="Documentos Complementarios"
            folderKey={FOLDER_KEY}
            formId="form-documentos-complementarios"
            isFormSubmitting={isSubmitting}
          >
            <form onSubmit={form.handleSubmit(onSubmit)} id="form-documentos-complementarios">
              <FieldGroup>
                <div className="space-y-4 mb-4">
                  <InputController
                    form={form}
                    controllerName="cuestionarioLavadoTerrorismo.file"
                    docKey="cmp.pld"
                    fieldLabel="Cuestionario de Prevención de Lavado de Activos y Financiación de Terrorismo:"
                    formatoDoc="CUESTIONARIO_PREVENCION_LAVADO_TERRORISMO"
                  />

                  <InputController
                    form={form}
                    controllerName="altaClientes.file"
                    docKey="cmp.alta"
                    fieldLabel="Alta de Clientes:"
                    formatoDoc="ALTA_CLIENTES"
                  />

                  <InputController
                    form={form}
                    controllerName="listaClinton.file"
                    docKey="cmp.clinton"
                    fieldLabel="Lista Clinton:"
                    formatoDoc="LISTA_CLINTON"
                  />
                </div>
              </FieldGroup>
            </form>
          </ExpDigiCard>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
