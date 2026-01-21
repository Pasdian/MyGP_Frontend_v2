import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldGroup } from '@/components/ui/field';

import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

import {
  createPdfSchema,
  expiryDateSchema,
} from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { ExpiraEnController } from '@/components/expediente-digital-cliente/form-controllers/ExpiraEnController';

import * as z from 'zod/v4';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';

const _documentosAcreditaAgente =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_ACREDITA_AGENTE_ADUANAL;

if (!_documentosAcreditaAgente?.docs) {
  throw new Error('Missing DOCUMENTOS_ACREDITA_AGENTE_ADUANAL docs');
}

const RENAME_MAP: Record<string, string> = {
  obligacionesFiscales:
    _documentosAcreditaAgente.docs.OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES.filename,
  datosBancarios: _documentosAcreditaAgente.docs.DATOS_BANCARIOS_HOJA_MEMBRETADA.filename,
  conferidoJosePascal:
    _documentosAcreditaAgente.docs.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.filename,
  conferidoMarcoBremer:
    _documentosAcreditaAgente.docs.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.filename,
};

export function AcreditacionSub() {
  const { cliente } = useCliente();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [accordionOpen, setAccordionOpen] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DOCUMENTOS_ACREDITA_AGENTE_ADUANAL =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_ACREDITA_AGENTE_ADUANAL;

  const DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS = DOCUMENTOS_ACREDITA_AGENTE_ADUANAL?.docs;

  const basePath = `/${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL?.name}`;

  const obligacionesFiscalesPath = `${basePath}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES.filename}`;
  const datosBancariosPath = `${basePath}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.DATOS_BANCARIOS_HOJA_MEMBRETADA.filename}`;
  const conferidoJosePascalPath = `${basePath}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.filename}`;
  const conferidoMarcoBremerPath = `${basePath}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.filename}`;

  const formSchema = z.object({
    obligacionesFiscales: createPdfSchema(
      DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES?.size ||
        2_000_000
    ),

    datosBancarios: createPdfSchema(
      DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.DATOS_BANCARIOS_HOJA_MEMBRETADA?.size || 2_000_000
    ),
    datosBancariosExp: expiryDateSchema,

    conferidoJosePascal: createPdfSchema(
      DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO
        ?.size || 2_000_000
    ),
    conferidoJosePascalExp: expiryDateSchema,

    conferidoMarcoBremer: createPdfSchema(
      DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA?.size ||
        2_000_000
    ),
    conferidoMarcoBremerExp: expiryDateSchema,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const fileKeys = [
        'obligacionesFiscales',
        'datosBancarios',
        'conferidoJosePascal',
        'conferidoMarcoBremer',
      ] as const;

      for (const fieldName of fileKeys) {
        const file = data[fieldName];
        if (!file) continue;

        const rename = RENAME_MAP[fieldName] ?? fieldName;

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', file);
        formData.append('rename', rename);

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
      }

      toast.info('Se subieron los archivos correctamente');
      await Promise.all([
        revalidateFileExists(obligacionesFiscalesPath),
        revalidateFileExists(datosBancariosPath),
        revalidateFileExists(conferidoJosePascalPath),
        revalidateFileExists(conferidoMarcoBremerPath),
      ]);
      form.reset(data);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.error('Error al subir los archivos');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      obligacionesFiscales: undefined,

      datosBancarios: undefined,
      datosBancariosExp: '',

      conferidoJosePascal: undefined,
      conferidoJosePascalExp: '',

      conferidoMarcoBremer: undefined,
      conferidoMarcoBremerExp: '',
    },
  });

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'acreditacion' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'acreditacion')}
    >
      <AccordionItem value="acreditacion" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Documentos que acredita el Agente Aduanal
        </AccordionTrigger>
        <AccordionContent>
          <Card className="w-full px-4">
            <CardContent>
              <form id="form-acreditacion" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
                    <ShowFile shouldFetch={accordionOpen} path={obligacionesFiscalesPath} />
                    <div className="col-span-2">
                      <FileController
                        form={form}
                        fieldLabel="Opinión de Cumplimiento de Obligaciones Fiscales (mes en curso):"
                        controllerName="obligacionesFiscales"
                        accept=".pdf"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>

                    <ShowFile shouldFetch={accordionOpen} path={datosBancariosPath} />
                    <FileController
                      form={form}
                      fieldLabel="Datos Bancarios en Hoja Membretada:"
                      controllerName="datosBancarios"
                      accept=".pdf"
                      buttonText="Seleccionar .pdf"
                    />
                    <ExpiraEnController form={form} controllerName="datosBancariosExp" />

                    <ShowFile shouldFetch={accordionOpen} path={conferidoJosePascalPath} />
                    <FileController
                      form={form}
                      fieldLabel="Generación del Encargo Conferido A.A. José Antonio Pascal Calvillo (no aplica en exportación):"
                      controllerName="conferidoJosePascal"
                      accept=".pdf"
                    />
                    <ExpiraEnController form={form} controllerName="conferidoJosePascalExp" />

                    <ShowFile shouldFetch={accordionOpen} path={conferidoMarcoBremerPath} />
                    <FileController
                      form={form}
                      fieldLabel="Generación del Encargo Conferido A.A. Marco Bremer García (no aplica en exportación):"
                      controllerName="conferidoMarcoBremer"
                      buttonText="Seleccionar .pdf"
                    />
                    <ExpiraEnController form={form} controllerName="conferidoMarcoBremerExp" />
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-acreditacion" isSubmitting={isSubmitting}>
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
