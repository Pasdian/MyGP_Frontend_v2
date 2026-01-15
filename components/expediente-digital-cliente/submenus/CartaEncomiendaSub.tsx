import * as z from 'zod/v4';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import {
  createPdfSchema,
  expiryDateSchema,
} from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldGroup } from '@/components/ui/field';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { Download } from 'lucide-react';
import axios from 'axios';
import { DownloadFormato } from '../DownloadFormato';

export function CartaEncomiendaSub() {
  const formSchema = z.object({
    cartaEncomienda3901: createPdfSchema(2_000_000),
    cartaEncomienda3901Exp: expiryDateSchema,

    cartaEncomienda3072: createPdfSchema(2_000_000),
    cartaEncomienda3072Exp: expiryDateSchema,

    avisoPrivacidad: createPdfSchema(2_000_000),
    avisoPrivacidadExp: expiryDateSchema,
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cartaEncomienda3901: undefined,
      cartaEncomienda3901Exp: '',

      cartaEncomienda3072: undefined,
      cartaEncomienda3072Exp: '',

      avisoPrivacidad: undefined,
      avisoPrivacidadExp: '',
    },
  });

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Cartas Encomienda y Aviso de Privacidad
        </AccordionTrigger>
        <AccordionContent>
          <Card className="w-full">
            <CardContent>
              <form id="form-carta-encomienda" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex gap-2">
                      <DownloadFormato doc="ENCOMIENDA_PASCAL" />
                      <FileController
                        form={form}
                        fieldLabel="Carta Encomienda Patente 3901:"
                        controllerName="cartaEncomienda3901"
                        accept=".pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="ENCOMIENDA_BREMER" />

                      <FileController
                        form={form}
                        fieldLabel="Carta Encomienda Patente 3072:"
                        controllerName="cartaEncomienda3072"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <DownloadFormato doc="AVISO_PRIVACIDAD" />

                      <FileController
                        form={form}
                        fieldLabel="Aviso de Privacidad:"
                        controllerName="avisoPrivacidad"
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
                <MyGPButtonSubmit form="form-carta-encomienda">Guardar Cambios</MyGPButtonSubmit>
              </Field>
            </CardFooter>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
