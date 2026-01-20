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

import { haciendaSchema } from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { PATHS } from '@/lib/expediente-digital-cliente/paths';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { RENAMES } from '@/lib/expediente-digital-cliente/renames';
import { ShowFile } from '../buttons/ShowFile';
import React from 'react';

const RENAME_MAP: Record<string, string> = {
  certificado: RENAMES.DOCUMENTOS_IMPORTADOR_EXPORTADOR.DATOS_HACIENDA_IMPORTADOR.CERTIFICADO_SAT,
  efirma: RENAMES.DOCUMENTOS_IMPORTADOR_EXPORTADOR.DATOS_HACIENDA_IMPORTADOR.EFIRMA_SAT,
  constancia:
    RENAMES.DOCUMENTOS_IMPORTADOR_EXPORTADOR.DATOS_HACIENDA_IMPORTADOR
      .CONSTANCIA_SITUACION_FISCAL_SAT,
};

export function DatosHaciendaImportadorSub() {
  const { cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);

  const formSchema = z.object(haciendaSchema);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const path = `/${cliente}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.base}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.subfolders.DATOS_HACIENDA_IMPORTADOR}`;

      const fileKeys = ['certificado', 'efirma', 'constancia'] as const;

      for (const fieldName of fileKeys) {
        const file = data[fieldName];
        if (!file) continue;

        const rename = RENAME_MAP[fieldName] ?? fieldName;

        const formData = new FormData();
        formData.append('path', path);
        formData.append('file', file);
        formData.append('rename', rename);

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
      }

      // If you also want to save RFC, send it to a different endpoint or include it in another request
      toast.message('Se subieron los archivos correctamente');
      form.reset(data);
    } catch (error) {
      console.error(error);
      toast.message('Error al subir los archivos');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rfc: '',
      certificado: undefined,
      efirma: undefined,
      constancia: undefined,
    },
  });

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'datos-hacienda-importador' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'datos-hacienda-importador')}
    >
      {' '}
      <AccordionItem value="datos-hacienda-importador" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Datos de Hacienda del Importador
        </AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent>
              <form id="form-datos-hacienda-importador" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Controller
                      name="rfc"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
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

                    <FileController
                      form={form}
                      fieldLabel="Certificado del Importador (.cer):"
                      controllerName="certificado"
                      accept=".cer"
                      buttonText="Seleccionar .cer"
                    />

                    <FileController
                      form={form}
                      fieldLabel="e-firma del Importador (.key):"
                      controllerName="efirma"
                      accept=".key"
                      buttonText="Seleccionar .key"
                    />
                    <ShowFile
                      shouldFetch={accordionOpen}
                      path={`/${cliente}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.base}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.subfolders.DATOS_CONTACTO_DEL_IMPORTADOR}/${
                        RENAMES.DOCUMENTOS_IMPORTADOR_EXPORTADOR.DATOS_HACIENDA_IMPORTADOR
                          .CONSTANCIA_SITUACION_FISCAL_SAT
                      }.pdf`}
                    />
                    <FileController
                      form={form}
                      fieldLabel="Constancia de Situación Fiscal:"
                      controllerName="constancia"
                      accept=".pdf"
                      buttonText="Seleccionar .pdf"
                    />
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-datos-hacienda-importador">
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
