'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

import * as z from 'zod/v4';

import { buildHaciendaSchema } from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { revalidateFileExists, ShowFile, ShowFileSlot } from '../buttons/ShowFile';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const _datosHaciendaImportador =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_HACIENDA_IMPORTADOR;

if (!_datosHaciendaImportador?.docs) {
  throw new Error('Missing DATOS_HACIENDA_IMPORTADOR docs');
}

const RENAME_MAP: Record<string, string> = {
  certificado: _datosHaciendaImportador.docs.CERTIFICADO_SAT.filename,
  efirma: _datosHaciendaImportador.docs.EFIRMA_SAT.filename,
  constancia: _datosHaciendaImportador.docs.CONSTANCIA_SITUACION_FISCAL_SAT.filename,
};

export function DatosHaciendaImportadorSub() {
  const { casa_id, cliente } = useCliente();
  const { getCasaUsername } = useAuth();

  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DATOS_HACIENDA_IMPORTADOR =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_HACIENDA_IMPORTADOR;
  const DATOS_HACIENDA_IMPORTADOR_DOCS =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_HACIENDA_IMPORTADOR.docs;

  const basePath = `/${casa_id} ${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DATOS_HACIENDA_IMPORTADOR?.name}`;

  const certificadoPath = `${basePath}/${DATOS_HACIENDA_IMPORTADOR_DOCS?.CERTIFICADO_SAT.filename}`;
  const efirmaPath = `${basePath}/${DATOS_HACIENDA_IMPORTADOR_DOCS?.EFIRMA_SAT.filename}`;
  const constanciaPath = `${basePath}/${DATOS_HACIENDA_IMPORTADOR_DOCS?.CONSTANCIA_SITUACION_FISCAL_SAT.filename}`;

  const formSchema = buildHaciendaSchema(
    DATOS_HACIENDA_IMPORTADOR_DOCS?.CERTIFICADO_SAT?.size || 2_000_000,
    DATOS_HACIENDA_IMPORTADOR_DOCS?.EFIRMA_SAT?.size || 2_000_000,
    DATOS_HACIENDA_IMPORTADOR_DOCS?.CONSTANCIA_SITUACION_FISCAL_SAT?.size || 2_000_000
  );

  const defaultValues = React.useMemo(() => {
    const docs = DATOS_HACIENDA_IMPORTADOR_DOCS!;
    return {
      certificado: {
        file: undefined,
        category: docs.CERTIFICADO_SAT.category,
        filename: docs.CERTIFICADO_SAT.filename || 'CERTIFICADO_SAT.pdf',
        filepath: certificadoPath,
      },
      efirma: {
        files: [],
        category: docs.EFIRMA_SAT.category,
        filename: docs.EFIRMA_SAT.filename || 'EFIRMA_SAT.pdf',
        filepath: efirmaPath,
      },
      constancia: {
        files: [],
        category: docs.CONSTANCIA_SITUACION_FISCAL_SAT.category,
        filename:
          docs.CONSTANCIA_SITUACION_FISCAL_SAT.filename || 'CONSTANCIA_SITUACION_FISCAL_SAT.pdf',
        filepath: constanciaPath,
      },
    };
  }, [DATOS_HACIENDA_IMPORTADOR_DOCS, certificadoPath, efirmaPath, efirmaPath]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const resetForm = () => {
    form.reset({
      certificado: { ...form.getValues('certificado'), file: undefined },
      efirma: { ...form.getValues('efirma'), file: undefined },
      constancia: { ...form.getValues('constancia'), file: undefined },
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const entries = Object.entries(data) as Array<
        [
          keyof typeof data,
          { file?: File; category?: number; filepath?: string; filename?: string },
        ]
      >;

      for (const [fieldName, value] of entries) {
        const file = value?.file;
        if (!file) continue;

        const rename = RENAME_MAP[fieldName as string] ?? String(fieldName);

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', file);
        formData.append('rename', rename);

        const insertRecordPayload = {
          filename: value.filename,
          file_date: value.file
            ? new Date(value.file.lastModified).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          filepath: value.filepath,
          client_id: cliente.split(' ')[0],
          file_category: value.category,
          is_valid: 1,
          status: 0,
          comment: '',
          expiration_date: null,
          uploaded_by: getCasaUsername() || 'MYGP',
        };

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        await GPClient.post('/api/expediente-digital-cliente', insertRecordPayload);
      }

      toast.info('Se subieron los archivos correctamente');

      await Promise.all([revalidateFileExists(constanciaPath)]);

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'datos-hacienda-importador' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'datos-hacienda-importador')}
    >
      <AccordionItem value="datos-hacienda-importador" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Datos de Hacienda del Importador
        </AccordionTrigger>

        <AccordionContent>
          <Card>
            <CardContent>
              <form id="form-datos-hacienda-importador" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid w-full grid-cols-[auto_1fr] gap-2 items-center">
                    <div className="col-span-2 grid w-full gap-2">
                      <div className="grid w-full grid-cols-[auto_1fr] gap-2 items-center">
                        <ShowFileSlot />
                        <div className="min-w-0 w-full">
                          <FileController
                            form={form}
                            fieldLabel="Certificado del Importador (.cer):"
                            controllerName="certificado.file"
                            accept=".cer"
                            buttonText="Seleccionar .cer"
                          />
                        </div>
                      </div>

                      <div className="grid w-full grid-cols-[auto_1fr] gap-2 items-center">
                        <ShowFileSlot />
                        <div className="min-w-0 w-full">
                          <FileController
                            form={form}
                            fieldLabel="e-firma del Importador (.key):"
                            controllerName="efirma.file"
                            accept=".key"
                            buttonText="Seleccionar .key"
                          />
                        </div>
                      </div>

                      <div className="grid w-full grid-cols-[auto_1fr] gap-2 items-center">
                        <ShowFile shouldFetch={accordionOpen} path={constanciaPath} />
                        <div className="min-w-0 w-full">
                          <FileController
                            form={form}
                            fieldLabel="Constancia de Situación Fiscal:"
                            controllerName="constancia.file"
                            accept={['application/pdf', 'image/png', 'image/jpeg']}
                            buttonText="Selecciona .pdf .png .jpeg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => resetForm()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-datos-hacienda-importador" isSubmitting={isSubmitting}>
                  Guardar Cambios
                </MyGPButtonSubmit>
              </Field>
            </CardFooter>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
