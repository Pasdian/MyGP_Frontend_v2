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
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import ExpDigiCard from '../submenus/ExpDigiCard';

type ProgressResponse = {
  client_id: string;
  overall: { scannedFiles: number; requiredFiles: number; progress: number };
  byDocKey: Record<string, { scannedFiles: number; requiredFiles: number; progress: number }>;
};

export function DocumentosVulnerablesMain() {
  const {
    casa_id,
    progressMap,
    setProgressMap,
    folderMappings,
    setFolderProgressFromDocKeys,
    getAccordionClassName,
    getProgressFromKeys,
  } = useCliente();

  const { getCasaUsername } = useAuth();

  // From your folder mappings
  const FOLDER_KEY = 'vuln.docs';

  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const [value, setValue] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY],
  });

  const fetchProgress = React.useCallback(async () => {
    try {
      if (!casa_id || DOC_KEYS.length === 0) return;

      const res = await GPClient.get<ProgressResponse>(
        '/expediente-digital-cliente/getProgressByDocKeys',
        {
          params: {
            client_id: casa_id,
            'docKeys[]': DOC_KEYS,
          },
        }
      );

      setProgressMap((prev) => {
        const next = { ...prev };
        for (const k of DOC_KEYS) next[k] = res.data?.byDocKey?.[k]?.progress ?? 0;
        return next;
      });

      setFolderProgressFromDocKeys(FOLDER_KEY, DOC_KEYS);
    } catch (e) {
      console.error(e);
    }
  }, [DOC_KEYS, casa_id, setProgressMap, setFolderProgressFromDocKeys]);

  React.useEffect(() => {
    if (!casa_id) return;
    fetchProgress();
  }, [casa_id, fetchProgress]);

  const folderProgress = getProgressFromKeys(DOC_KEYS, progressMap);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
        setProgressMap,
        recomputeFolderProgress: setFolderProgressFromDocKeys,
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
