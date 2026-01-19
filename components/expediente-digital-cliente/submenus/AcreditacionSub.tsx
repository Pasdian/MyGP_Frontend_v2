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
import { PATHS } from '@/lib/expediente-digital-cliente/paths';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';

const RENAME_MAP: Record<string, string> = {
  obligacionesFiscales: 'OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES',
  datosBancarios: 'DATOS_BANCARIOS_HOJA_MEMBRETADA',
  conferidoJosePascal: 'ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO',
  conferidoMarcoBremer: 'ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA',
};

export function AcreditacionSub() {
  const { cliente } = useCliente();

  const formSchema = z.object({
    obligacionesFiscales: createPdfSchema(2_000_000),

    datosBancarios: createPdfSchema(2_000_000),
    datosBancariosExp: expiryDateSchema,

    conferidoJosePascal: createPdfSchema(2_000_000),
    conferidoJosePascalExp: expiryDateSchema,

    conferidoMarcoBremer: createPdfSchema(2_000_000),
    conferidoMarcoBremerExp: expiryDateSchema,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const path = `/${cliente}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.base}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.subfolders.DOCUMENTOS_ACREDITA_AGENTE_ADUANAL}`;

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
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Documentos que acredita el Agente Aduanal
        </AccordionTrigger>
        <AccordionContent>
          <Card className="w-full px-4">
            <CardContent>
              <form id="form-acreditacion" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-2 place-items-center gap-4">
                    <div className="col-span-2">
                      <FileController
                        form={form}
                        fieldLabel="Opinión de Cumplimiento de Obligaciones Fiscales (mes en curso):"
                        controllerName="obligacionesFiscales"
                        accept=".pdf"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>

                    <FileController
                      form={form}
                      fieldLabel="Datos Bancarios en Hoja Membretada:"
                      controllerName="datosBancarios"
                      accept=".pdf"
                      buttonText="Seleccionar .pdf"
                    />
                    <ExpiraEnController form={form} controllerName="datosBancariosExp" />

                    <FileController
                      form={form}
                      fieldLabel="Generación del Encargo Conferido A.A. José Antonio Pascal Calvillo (no aplica en exportación):"
                      controllerName="conferidoJosePascal"
                      accept=".pdf"
                    />
                    <ExpiraEnController form={form} controllerName="conferidoJosePascalExp" />

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
                <MyGPButtonSubmit form="form-acreditacion">Guardar Cambios</MyGPButtonSubmit>
              </Field>
            </CardFooter>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
