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
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
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

  const basePath = `/${casa_id}/${DOCUMENTOS_AREA_COMERCIAL.name}/${ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL?.name}`;

  const acuerdoConfidencialidadPath = `${basePath}/${ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS?.ACUERDO_CONFIDENCIALIDAD.filename}`;
  const acuerdoSocioComercialPath = `${basePath}/${ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS?.ACUERDO_SOCIO_COMERCIAL.filename}`;

  const formSchema = z.object({
    acuerdoConfidencialidad: z.object({
      file: createPdfSchema(
        ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS?.ACUERDO_CONFIDENCIALIDAD?.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),

    acuerdoSocioComercial: z.object({
      file: createPdfSchema(
        ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS?.ACUERDO_SOCIO_COMERCIAL?.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      if (!cliente) {
        toast.message('Selecciona un cliente antes de subir archivos');
        return;
      }

      const fileKeys = ['acuerdoConfidencialidad', 'acuerdoSocioComercial'] as const;

      for (const fieldName of fileKeys) {
        const fileObj = data[fieldName]; // { file, category, filepath, filename }
        const realFile = fileObj?.file;
        if (!realFile) continue;

        const rename = RENAME_MAP[fieldName];

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', realFile);
        formData.append('rename', rename);

        const insertRecordPayload = {
          filename: fileObj.filename,
          file_date: new Date(realFile.lastModified).toISOString().split('T')[0],
          filepath: fileObj.filepath,
          client_id: casa_id,
          file_category: fileObj.category,
          is_valid: true,
          status: 0,
          comment: '',
          expiration_date: null,
          uploaded_by: 'MYGP',
        };

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        await GPClient.post('/api/expediente-digital-cliente', insertRecordPayload);
      }

      toast.message('Se subieron los archivos correctamente');

      await Promise.all([
        revalidateFileExists(acuerdoConfidencialidadPath),
        revalidateFileExists(acuerdoSocioComercialPath),
      ]);

      resetForm();
    } catch (error) {
      console.error(error);
      toast.message('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues = React.useMemo<FormValues>(() => {
    const docs = ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS!;

    return {
      acuerdoConfidencialidad: {
        file: undefined,
        category: docs.ACUERDO_CONFIDENCIALIDAD.category,
        filename: docs.ACUERDO_CONFIDENCIALIDAD.filename || 'ACUERDO_CONFIDENCIALIDAD.pdf',
        filepath: acuerdoConfidencialidadPath,
      },
      acuerdoSocioComercial: {
        file: undefined,
        category: docs.ACUERDO_SOCIO_COMERCIAL.category,
        filename: docs.ACUERDO_SOCIO_COMERCIAL.filename || 'ACUERDO_SOCIO_COMERCIAL.pdf',
        filepath: acuerdoSocioComercialPath,
      },
    };
  }, [
    ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL_DOCS,
    acuerdoConfidencialidadPath,
    acuerdoSocioComercialPath,
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset({
      ...form.getValues(),
      acuerdoConfidencialidad: { ...form.getValues('acuerdoConfidencialidad'), file: undefined },
      acuerdoSocioComercial: { ...form.getValues('acuerdoSocioComercial'), file: undefined },
    });
  };

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
                        controllerName="acuerdoConfidencialidad.file"
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
                        controllerName="acuerdoSocioComercial.file"
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
