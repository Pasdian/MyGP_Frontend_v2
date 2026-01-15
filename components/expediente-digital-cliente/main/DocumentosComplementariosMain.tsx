import * as z from 'zod/v4';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Download, FileIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createPdfSchema } from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldGroup } from '@/components/ui/field';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { DownloadFormato } from '../DownloadFormato';

export function DocumentosComplementariosMain() {
  const formSchema = z.object({
    cuestionarioLavadoTerrorismo: createPdfSchema(2_000_000),
    altaClientes: createPdfSchema(2_000_000),
    listaClinton: createPdfSchema(2_000_000),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cuestionarioLavadoTerrorismo: undefined,
      altaClientes: undefined,
      listaClinton: undefined,
    },
  });

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1 text-white">
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-green-700 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_1fr] gap-2 place-items-center">
            <FileIcon size={18} />
            <p>Documentos Complementarios</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 text-balance">
          <Card>
            <CardContent>
              <form id="form-documentos-complementarios" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex gap-2">
                      <DownloadFormato doc="CUESTIONARIO_PREVENCION_LAVADO_TERRORISMO" />

                      <FileController
                        form={form}
                        fieldLabel="Cuestionario de Prevención de Lavado de Activos y Financiarión de Terrorismo:"
                        controllerName="cuestionarioLavadoTerrorismo"
                        accept=".pdf"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="ALTA_CLIENTES" />

                      <FileController
                        form={form}
                        fieldLabel="Alta de Clientes:"
                        controllerName="altaClientes"
                        accept=".pdf"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Download
                        size={20}
                        className="cursor-pointer"
                        onClick={() => {
                          window.open(
                            'https://sanctionssearch.ofac.treas.gov/',
                            '_blank',
                            'noopener,noreferrer'
                          );
                        }}
                      />

                      <FileController
                        form={form}
                        fieldLabel="Lista Clinton:"
                        controllerName="listaClinton"
                        accept=".pdf"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-documentos-complementarios">
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
