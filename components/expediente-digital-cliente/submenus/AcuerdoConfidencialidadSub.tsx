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
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import { toast } from 'sonner';
import React from 'react';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';

const _acuerdoConfidencialidad =
  FOLDERFILESTRUCT.DOCUMENTOS_AREA_COMERCIAL.children?.ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL;

if (!_acuerdoConfidencialidad?.docs) {
  throw new Error('Missing ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL docs');
}

const RENAME_MAP: Record<string, string> = {
  acuerdoConfidencialidad: _acuerdoConfidencialidad.docs.ACUERDO_CONFIDENCIALIDAD.filename,
  acuerdoSocioComercial: _acuerdoConfidencialidad.docs.ACUERDO_SOCIO_COMERCIAL.filename,
};

export function AcuerdoConfidencialidadSub() {
  const { casa_id, cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_AREA_COMERCIAL = FOLDERFILESTRUCT.DOCUMENTOS_AREA_COMERCIAL;
  const ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL =
    DOCUMENTOS_AREA_COMERCIAL.children?.ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL;

  const ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS =
    ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL?.docs;

  const basePath = `/${casa_id} ${cliente}/${DOCUMENTOS_AREA_COMERCIAL.name}/${ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL?.name}`;

  const acuerdoConfidencialidadPath = `${basePath}/${ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS?.ACUERDO_CONFIDENCIALIDAD.filename}`;
  const acuerdoSocioComercialPath = `${basePath}/${ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS?.ACUERDO_SOCIO_COMERCIAL.filename}`;

  const formSchema = z.object({
    acuerdoConfidencialidad: createPdfSchema(
      ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS?.ACUERDO_CONFIDENCIALIDAD?.size || 2_000_000
    ),
    acuerdoSocioComercial: createPdfSchema(
      ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS?.ACUERDO_SOCIO_COMERCIAL?.size || 2_000_000
    ),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (!cliente) {
        toast.message('Selecciona un cliente antes de subir archivos');
        return;
      }

      const fileKeys = ['acuerdoConfidencialidad', 'acuerdoSocioComercial'] as const;

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
        revalidateFileExists(acuerdoConfidencialidadPath),
        revalidateFileExists(acuerdoSocioComercialPath),
      ]);
      form.reset(data);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.message('Error al subir los archivos');
    }
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acuerdoConfidencialidad: undefined,
      acuerdoSocioComercial: undefined,
    },
  });

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'acuerdo-confidencialidad' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'acuerdo-confidencialidad')}
    >
      <AccordionItem value="acuerdo-confidencialidad" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Acuerdo Confidencialidad y Socio Comercial
        </AccordionTrigger>
        <AccordionContent>
          <Card className="w-full">
            <CardContent>
              <form id="form-acuerdo-confidencialidad" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={acuerdoConfidencialidadPath} />
                      <DownloadFormato doc="ACUERDO_CONFIDENCIALIDAD" />
                      <FileController
                        form={form}
                        fieldLabel="Acuerdo Confidencialidad:"
                        controllerName="acuerdoConfidencialidad"
                        buttonText="Selecciona .pdf .png .jpeg"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={acuerdoSocioComercialPath} />
                      <DownloadFormato doc="ACUERDO_SOCIO_COMERCIAL" />
                      <FileController
                        form={form}
                        fieldLabel="Acuerdo de Colaboración Socio Comercial"
                        controllerName="acuerdoSocioComercial"
                        buttonText="Selecciona .pdf .png .jpeg"
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
                <MyGPButtonSubmit form="form-acuerdo-confidencialidad" isSubmitting={isSubmitting}>
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
