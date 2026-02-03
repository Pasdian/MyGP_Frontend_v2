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

export function DocumentosVulnerablesMain() {
  const {
    casa_id,
    progressMap,
    folderMappings,
    updateProgressFromSubmitResponse,
    getAccordionClassName,
  } = useCliente();

  const { getCasaUsername } = useAuth();

  const FOLDER_KEY = 'vuln.docs';
  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const [value, setValue] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY],
  });

  // Prefer reading the folder progress already computed by the context
  const folderProgress = progressMap[FOLDER_KEY] ?? 0;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!casa_id?.trim()) {
      toast.error('Selecciona un cliente antes de subir archivos');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('client_id', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      if (data.formatoActividadVulnerable3901?.file) {
        formData.append(
          data.formatoActividadVulnerable3901.docKey,
          data.formatoActividadVulnerable3901.file
        );
      }

      if (data.formatoActividadVulnerable3072?.file) {
        formData.append(
          data.formatoActividadVulnerable3072.docKey,
          data.formatoActividadVulnerable3072.file
        );
      }

      if (data.formatoDuenioBeneficiario3901?.file) {
        formData.append(
          data.formatoDuenioBeneficiario3901.docKey,
          data.formatoDuenioBeneficiario3901.file
        );
      }

      if (data.formatoDuenioBeneficiario3072?.file) {
        formData.append(
          data.formatoDuenioBeneficiario3072.docKey,
          data.formatoDuenioBeneficiario3072.file
        );
      }

      if (data.constanciaHojaMembretada3901?.file) {
        formData.append(
          data.constanciaHojaMembretada3901.docKey,
          data.constanciaHojaMembretada3901.file
        );
      }

      if (data.constanciaHojaMembretada3072?.file) {
        formData.append(
          data.constanciaHojaMembretada3072.docKey,
          data.constanciaHojaMembretada3072.file
        );
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
      <AccordionItem value="documentos-vulnerables-main">
        <AccordionTrigger className={getAccordionClassName(DOC_KEYS, progressMap)}>
          <div>
            <p>
              Documentos para Importadores/Exportadores con Actividad Vulnerable - {folderProgress}%
              completado
            </p>
          </div>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-2 text-balance">
          <ExpDigiCard
            title="Documentos para Importadores/Exportadores con Actividad Vulnerable"
            folderKey={FOLDER_KEY}
            formId="form-actividad-vulnerable"
            isFormSubmitting={isSubmitting}
          >
            <form onSubmit={form.handleSubmit(onSubmit)} id="form-actividad-vulnerable">
              <FieldGroup>
                <div className="space-y-4 mb-4">
                  <InputController
                    form={form}
                    controllerName="formatoActividadVulnerable3901.file"
                    docKey="vul.act.3901"
                    fieldLabel="Formato Actividad Vulnerable (3901):"
                    formatoDoc="FORMATO_ACTIVIDAD_VULNERABLE_3901"
                  />

                  <InputController
                    form={form}
                    controllerName="formatoActividadVulnerable3072.file"
                    docKey="vul.act.3072"
                    fieldLabel="Formato Actividad Vulnerable (3072):"
                    formatoDoc="FORMATO_ACTIVIDAD_VULNERABLE_3072"
                  />

                  <InputController
                    form={form}
                    controllerName="formatoDuenioBeneficiario3901.file"
                    docKey="vul.benef.3901"
                    fieldLabel="Formato de Dueño Beneficiario 3901:"
                    formatoDoc="FORMATO_DUENIO_BENEFICIARIO_3901"
                  />

                  <InputController
                    form={form}
                    controllerName="formatoDuenioBeneficiario3072.file"
                    docKey="vul.benef.3072"
                    fieldLabel="Formato de Dueño Beneficiario 3072:"
                    formatoDoc="FORMATO_DUENIO_BENEFICIARIO_3072"
                  />

                  <InputController
                    form={form}
                    controllerName="constanciaHojaMembretada3901.file"
                    docKey="vul.lfpiorpi.3901"
                    fieldLabel="Constancia LFPIORPI en Hoja Membretada 3901:"
                    formatoDoc="LFPIORPI_3901"
                  />

                  <InputController
                    form={form}
                    controllerName="constanciaHojaMembretada3072.file"
                    docKey="vul.lfpiorpi.3072"
                    fieldLabel="Constancia LFPIORPI en Hoja Membretada 3072:"
                    formatoDoc="LFPIORPI_3072"
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
