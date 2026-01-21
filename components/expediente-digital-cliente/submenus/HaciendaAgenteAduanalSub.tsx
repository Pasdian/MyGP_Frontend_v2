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

const _datosHaciendaAgente =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_HACIENDA_AGENTE_ADUANAL;

if (!_datosHaciendaAgente?.docs) {
  throw new Error('Missing DATOS_HACIENDA_AGENTE_ADUANAL docs');
}

const RENAME_MAP: Record<string, string> = {
  certificado: _datosHaciendaAgente.docs.CERTIFICADO_SAT.filename,
  efirma: _datosHaciendaAgente.docs.EFIRMA_SAT.filename,
  constancia: _datosHaciendaAgente.docs.CONSTANCIA_SITUACION_FISCAL_SAT.filename,
};

export function HaciendaAgenteAduanalSub() {
  const { cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DATOS_HACIENDA_AGENTE_ADUANAL =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_HACIENDA_AGENTE_ADUANAL;
  const DATOS_HACIENDA_AGENTE_ADUANAL_DOCS =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_HACIENDA_AGENTE_ADUANAL.docs;

  const basePath = `/${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DATOS_HACIENDA_AGENTE_ADUANAL?.name}`;
  const constanciaPath = `${basePath}/${DATOS_HACIENDA_AGENTE_ADUANAL_DOCS?.CONSTANCIA_SITUACION_FISCAL_SAT.filename}`;
  const formSchema = buildHaciendaSchema(
    DATOS_HACIENDA_AGENTE_ADUANAL_DOCS?.CERTIFICADO_SAT?.size || 2_000_000,
    DATOS_HACIENDA_AGENTE_ADUANAL_DOCS?.EFIRMA_SAT?.size || 2_000_000,
    DATOS_HACIENDA_AGENTE_ADUANAL_DOCS?.CONSTANCIA_SITUACION_FISCAL_SAT?.size || 2_000_000
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rfc: '',
      certificado: undefined,
      efirma: undefined,
      constancia: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const fileKeys = ['certificado', 'efirma', 'constancia'] as const;

      for (const fieldName of fileKeys) {
        const file = data[fieldName];
        if (!file) continue;

        const rename = RENAME_MAP[fieldName] ?? fieldName;

        const formData = new FormData();
        formData.append('path', basePath); // folder, not file path
        formData.append('file', file);
        formData.append('rename', rename);

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
      }

      toast.info('Se subieron los archivos correctamente');

      if (data.constancia) {
        await revalidateFileExists(constanciaPath);
      }

      form.reset(data);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.error('Error al subir los archivos');
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'datos-hacienda-agente' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'datos-hacienda-agente')}
    >
      <AccordionItem value="datos-hacienda-agente" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Datos de Hacienda del Agente Aduanal
        </AccordionTrigger>

        <AccordionContent>
          <Card>
            <CardContent>
              <form id="form-datos-hacienda-agente" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid w-full grid-cols-[auto_1fr] gap-2 items-center">
                    <div className="col-span-2 grid w-full gap-2">
                      <div className="grid w-full grid-cols-[auto_1fr] gap-2 items-center">
                        <ShowFileSlot />
                        <div className="min-w-0 w-full">
                          <Controller
                            name="rfc"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field
                                data-invalid={fieldState.invalid}
                                className="grid grid-rows-2 gap-0"
                              >
                                <FieldLabel htmlFor="email">RFC:</FieldLabel>
                                <Input
                                  {...field}
                                  id="email"
                                  placeholder="RFC123456789"
                                  className="mb-2"
                                  aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid w-full grid-cols-[auto_1fr] gap-2 items-center">
                        <ShowFileSlot />
                        <div className="min-w-0 w-full">
                          <FileController
                            form={form}
                            fieldLabel="Certificado del Importador (.cer):"
                            controllerName="certificado"
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
                            controllerName="efirma"
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
                            controllerName="constancia"
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
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-datos-hacienda-agente" isSubmitting={isSubmitting}>
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
