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
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import React from 'react';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';

const _cartaEncomienda =
  FOLDERFILESTRUCT.DOCUMENTOS_AREA_COMERCIAL.children?.CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD;

if (!_cartaEncomienda?.docs) {
  throw new Error('Missing CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD docs');
}

const RENAME_MAP: Record<string, string> = {
  cartaEncomienda3901: _cartaEncomienda.docs.CARTA_ENCOMIENDA_3901.filename,
  cartaEncomienda3072: _cartaEncomienda.docs.CARTA_ENCOMIENDA_3072.filename,
  avisoPrivacidad: _cartaEncomienda.docs.AVISO_PRIVACIDAD.filename,
};

export function CartaEncomiendaSub() {
  const { casa_id, cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_AREA_COMERCIAL = FOLDERFILESTRUCT.DOCUMENTOS_AREA_COMERCIAL;
  const CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD =
    DOCUMENTOS_AREA_COMERCIAL.children?.CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD;

  const CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD_DOCS = CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD?.docs;

  const basePath = `/${casa_id} ${cliente}/${DOCUMENTOS_AREA_COMERCIAL.name}/${CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD?.name}`;

  const cartaEncomienda3901Path = `${basePath}/${CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD_DOCS?.CARTA_ENCOMIENDA_3901.filename}`;
  const cartaEncomienda3072Path = `${basePath}/${CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD_DOCS?.CARTA_ENCOMIENDA_3072.filename}`;
  const avisoPrivacidadPath = `${basePath}/${CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD_DOCS?.AVISO_PRIVACIDAD.filename}`;

  const formSchema = z.object({
    cartaEncomienda3901: createPdfSchema(
      CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD_DOCS?.CARTA_ENCOMIENDA_3901?.size || 2_000_000
    ),

    cartaEncomienda3072: createPdfSchema(
      CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD_DOCS?.CARTA_ENCOMIENDA_3072?.size || 2_000_000
    ),

    avisoPrivacidad: createPdfSchema(
      CARTAS_ENCOMIENDA_AVISO_PRIVACIDAD_DOCS?.AVISO_PRIVACIDAD?.size || 2_000_000
    ),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const fileKeys = ['cartaEncomienda3901', 'cartaEncomienda3072', 'avisoPrivacidad'] as const;

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

      toast.info('Se subieron los archivos correctamente');
      await Promise.all([
        revalidateFileExists(cartaEncomienda3901Path),
        revalidateFileExists(cartaEncomienda3072Path),
        revalidateFileExists(avisoPrivacidadPath),
      ]);
      form.reset(data);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.error('Error al subir los archivos');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cartaEncomienda3901: undefined,
      cartaEncomienda3072: undefined,
      avisoPrivacidad: undefined,
    },
  });

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'carta-encomienda' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'carta-encomienda')}
    >
      <AccordionItem value="carta-encomienda" className="ml-4">
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
                      <ShowFile shouldFetch={accordionOpen} path={cartaEncomienda3901Path} />

                      <DownloadFormato doc="ENCOMIENDA_PASCAL" />
                      <FileController
                        form={form}
                        fieldLabel="Carta Encomienda Patente 3901:"
                        controllerName="cartaEncomienda3901"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={cartaEncomienda3072Path} />

                      <DownloadFormato doc="ENCOMIENDA_BREMER" />

                      <FileController
                        form={form}
                        fieldLabel="Carta Encomienda Patente 3072:"
                        controllerName="cartaEncomienda3072"
                        buttonText="Selecciona .pdf .png .jpeg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={avisoPrivacidadPath} />

                      <DownloadFormato doc="AVISO_PRIVACIDAD" />

                      <FileController
                        form={form}
                        fieldLabel="Aviso de Privacidad:"
                        controllerName="avisoPrivacidad"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                        buttonText="Selecciona .pdf .png .jpeg"
                      />
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-carta-encomienda" isSubmitting={isSubmitting}>
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
