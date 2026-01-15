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

export function DatosHaciendaImportadorSub() {
  const formSchema = z.object(haciendaSchema);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
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
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
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
