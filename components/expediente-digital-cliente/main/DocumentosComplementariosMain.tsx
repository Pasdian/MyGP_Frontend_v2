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

export function DocumentosComplementariosMain() {
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

  const FOLDER_KEY = 'cmp.docs';

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

      // Use docKey from the schema/defaultValues
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
                  />

                  <InputController
                    form={form}
                    controllerName="altaClientes.file"
                    docKey="cmp.alta"
                    fieldLabel="Alta de Clientes:"
                  />

                  <InputController
                    form={form}
                    controllerName="listaClinton.file"
                    docKey="cmp.clinton"
                    fieldLabel="Lista Clinton:"
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
