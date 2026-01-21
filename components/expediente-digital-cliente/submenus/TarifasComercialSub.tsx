import * as z from 'zod/v4';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { createPdfSchema } from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldGroup } from '@/components/ui/field';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { DownloadFormato } from '../DownloadFormato';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';

const _tarifas = FOLDERFILESTRUCT.DOCUMENTOS_AREA_COMERCIAL.children?.TARIFAS;

if (!_tarifas?.docs) {
  throw new Error('Missing TARIFAS docs');
}

const RENAME_MAP: Record<string, string> = {
  tarifaAutorizada: _tarifas.docs.TARIFA_AUTORIZADA.filename,
  tarifaPreclasificacion: _tarifas.docs.TARIFA_PRECLASIFICACION.filename,
  tarifaAmericana: _tarifas.docs.TARIFA_AMERICANA.filename,
};

export function TarifasComercialSub() {
  const { cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_AREA_COMERCIAL = FOLDERFILESTRUCT.DOCUMENTOS_AREA_COMERCIAL;
  const TARIFAS = DOCUMENTOS_AREA_COMERCIAL.children?.TARIFAS;

  const TARIFAS_DOCS = TARIFAS?.docs;

  const basePath = `/${cliente}/${DOCUMENTOS_AREA_COMERCIAL.name}/${TARIFAS?.name}`;

  const tarifaAutorizadaPath = `${basePath}/${TARIFAS_DOCS?.TARIFA_AUTORIZADA.filename}`;
  const tarifaPreclasificacionPath = `${basePath}/${TARIFAS_DOCS?.TARIFA_PRECLASIFICACION.filename}`;
  const tarifaAmericanaPath = `${basePath}/${TARIFAS_DOCS?.TARIFA_AMERICANA.filename}`;

  const formSchema = z.object({
    tarifaAutorizada: createPdfSchema(TARIFAS_DOCS?.TARIFA_AUTORIZADA?.size || 2_000_000),
    tarifaPreclasificacion: createPdfSchema(
      TARIFAS_DOCS?.TARIFA_PRECLASIFICACION?.size || 2_000_000
    ),
    tarifaAmericana: createPdfSchema(TARIFAS_DOCS?.TARIFA_AMERICANA?.size || 2_000_000),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const fileKeys = ['tarifaAutorizada', 'tarifaPreclasificacion', 'tarifaAmericana'] as const;

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

      toast.message('Se subieron los archivos correctamente');
      await Promise.all([
        revalidateFileExists(tarifaAutorizadaPath),
        revalidateFileExists(tarifaPreclasificacionPath),
        revalidateFileExists(tarifaAmericanaPath),
      ]);
      setIsSubmitting(false);
      form.reset(data);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.message('Error al subir los archivos');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tarifaAutorizada: undefined,
      tarifaPreclasificacion: undefined,
      tarifaAmericana: undefined,
    },
  });

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'tarifas-comercial' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'tarifas-comercial')}
    >
      <AccordionItem value="tarifas-comercial" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Tarifas
        </AccordionTrigger>
        <AccordionContent>
          <Card className="w-full">
            <CardContent>
              <form id="form-tarifas-comercial" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={tarifaAutorizadaPath} />
                      <DownloadFormato doc="TARIFA_AUTORIZADA" />
                      <FileController
                        form={form}
                        fieldLabel="Tarifa Autorizada (deberá entregarse en original)"
                        controllerName="tarifaAutorizada"
                        buttonText="Selecciona .pdf .png .jpeg"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={tarifaPreclasificacionPath} />
                      <DownloadFormato doc="TARIFA_PRECLASIFICACION" />
                      <FileController
                        form={form}
                        fieldLabel="Tarifa de Preclasificación (en caso de aplicar)"
                        controllerName="tarifaPreclasificacion"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={tarifaAmericanaPath} />
                      <DownloadFormato doc="TARIFA_AMERICANA" />
                      <FileController
                        form={form}
                        fieldLabel="Tarifa de Americana (en caso de aplicar)"
                        controllerName="tarifaAmericana"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                      />
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-tarifas-comercial" isSubmitting={isSubmitting}>
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
