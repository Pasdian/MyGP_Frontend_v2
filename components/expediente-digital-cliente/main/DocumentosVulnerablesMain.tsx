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
import { ExpiraEnController } from '@/components/expediente-digital-cliente/form-controllers/ExpiraEnController';
import { DownloadFormato } from '../DownloadFormato';

export function DocumentosVulnerablesMain() {
  const formSchema = z.object({
    formatoActividadVulnerable3901: createPdfSchema(2_000_000),
    formatoActividadVulnerable3072: createPdfSchema(2_000_000),

    formatoDuenioBeneficiario3901: createPdfSchema(2_000_000),
    formatoDuenioBeneficiario3072: createPdfSchema(2_000_000),

    constanciaHojaMembretada3091: createPdfSchema(2_000_000),
    constanciaHojaMembretada3072: createPdfSchema(2_000_000),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      formatoActividadVulnerable3901: undefined,
      formatoActividadVulnerable3072: undefined,

      formatoDuenioBeneficiario3901: undefined,
      formatoDuenioBeneficiario3072: undefined,

      constanciaHojaMembretada3091: undefined,
      constanciaHojaMembretada3072: undefined,
    },
  });

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1 text-white">
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-yellow-600 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_1fr] gap-2 place-items-center">
            <FileIcon size={18} />
            <p>Documentos para Importadores/Exportadores con Actividad Vulnerable</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 text-balance">
          <Card>
            <CardContent>
              <form id="form-actividad-vulnerable" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex gap-2">
                      <DownloadFormato doc="FORMATO_ACTIVIDAD_VULNERABLE_3901" />

                      <FileController
                        form={form}
                        fieldLabel="Formato Actividad Vulnerable (3091):"
                        controllerName="formatoActividadVulnerable3901"
                        accept=".pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="FORMATO_ACTIVIDAD_VULNERABLE_3072" />

                      <FileController
                        form={form}
                        fieldLabel="Formato Actividad Vulnerable (3072):"
                        controllerName="formatoActividadVulnerable3072"
                        accept=".pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="FORMATO_DUENIO_BENEFICIARIO_3901" />

                      <FileController
                        form={form}
                        fieldLabel="Formato de Dueño Beneficiario 3901"
                        controllerName="formatoDuenioBeneficiario3901"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="FORMATO_DUENIO_BENEFICIARIO_3072" />

                      <FileController
                        form={form}
                        fieldLabel="Formato de Dueño Beneficiario 3072"
                        controllerName="formatoDuenioBeneficiario3072"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="LFPIORPI_3901" />

                      <FileController
                        form={form}
                        fieldLabel="Constancia LFPIORPI en Hoja Membretada 3901"
                        controllerName="constanciaHojaMembretada3091"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="LFPIORPI_3072" />

                      <FileController
                        form={form}
                        fieldLabel="Constancia LFPIORPI en Hoja Membretada 3072"
                        controllerName="constanciaHojaMembretada3072"
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
                <MyGPButtonSubmit form="form-actividad-vulnerable">
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
