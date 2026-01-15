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

export function AcreditacionSub() {
  const formSchema = z.object({
    obligacionesFiscales: createPdfSchema(2_000_000),

    datosBancarios: createPdfSchema(2_000_000),
    datosBancariosExp: expiryDateSchema,

    conferidoJosePascal: createPdfSchema(2_000_000),
    conferidoJosePascalExp: expiryDateSchema,

    conferidoMarcoBremer: createPdfSchema(2_000_000),
    conferidoMarcoBremerExp: expiryDateSchema,
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
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
