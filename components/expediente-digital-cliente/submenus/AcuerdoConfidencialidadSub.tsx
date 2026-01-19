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
import { PATHS } from '@/lib/expediente-digital-cliente/paths';
import { toast } from 'sonner';

const RENAME_MAP: Record<string, string> = {
  acuerdoConfidencialidad: 'ACUERDO_CONFIDENCIALIDAD',
  acuerdoSocioComercial: 'ACUERDO_SOCIO_COMERCIAL',
};

export function AcuerdoConfidencialidadSub() {
  const { cliente } = useCliente();

  const formSchema = z.object({
    acuerdoConfidencialidad: createPdfSchema(2_000_000),
    acuerdoSocioComercial: createPdfSchema(2_000_000),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!cliente) {
        toast.message('Selecciona un cliente antes de subir archivos');
        return;
      }

      const path = `/${cliente}/${PATHS.DOCUMENTOS_AREA_COMERCIAL.base}/${PATHS.DOCUMENTOS_AREA_COMERCIAL.subfolders.ACUERDO_CONFIDENCIALIDAD_SOCIO_COMERCIAL}`;

      const fileKeys = ['acuerdoConfidencialidad', 'acuerdoSocioComercial'] as const;

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
      acuerdoConfidencialidad: undefined,
      acuerdoSocioComercial: undefined,
    },
  });

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Acuerdo Confidencialidad y Socio Comercial
        </AccordionTrigger>
        <AccordionContent>
          <Card className="w-full">
            <CardContent>
              <form id="form-acuerdo-comercial" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex gap-2">
                      <DownloadFormato doc="ACUERDO_CONFIDENCIALIDAD" />

                      <FileController
                        form={form}
                        fieldLabel="Acuerdo Confidencialidad:"
                        controllerName="acuerdoConfidencialidad"
                        buttonText="Seleccionar .pdf"
                        accept=".pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="ACUERDO_SOCIO_COMERCIAL" />

                      <FileController
                        form={form}
                        fieldLabel="Acuerdo de Colaboración Socio Comercial"
                        controllerName="acuerdoSocioComercial"
                        buttonText="Seleccionar .pdf"
                        accept=".pdf"
                      />
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-acuerdo-comercial">Guardar Cambios</MyGPButtonSubmit>
              </Field>
            </CardFooter>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
