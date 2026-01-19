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
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { PATHS } from '@/lib/expediente-digital-cliente/paths';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';
import { Eye } from 'lucide-react';
import { ShowFile } from '../buttons/ShowFile';

const RENAME_MAP: Record<string, string> = {
  actaConstitutiva: 'ACTA_CONSTITUTIVA',
  poderNotarial: 'PODER_NOTARIAL',
};

export function DocumentosImportadorSub() {
  const { cliente } = useCliente();

  const formSchema = z.object({
    actaConstitutiva: createPdfSchema(30_000_000),
    poderNotarial: createPdfSchema(30_000_000),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const path = `/${cliente}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.base}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.subfolders.DOCUMENTOS_IMPORTADOR}`;

      const entries = Object.entries(data) as Array<[string, File | undefined]>;

      for (const [fieldName, file] of entries) {
        if (!file) continue;

        const rename = RENAME_MAP[fieldName] ?? fieldName;

        const formData = new FormData();
        formData.append('path', path);
        formData.append('file', file);
        formData.append('rename', rename); // backend keeps .pdf if omitted

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
      actaConstitutiva: undefined,
      poderNotarial: undefined,
    },
  });

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Documentos del Importador
        </AccordionTrigger>
        <AccordionContent>
          <Card className="w-full">
            <CardContent>
              <form id="form-documentos-importador" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-[auto_1fr] gap-6 mb-4">
                    <ShowFile
                      path={`/${cliente}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.base}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.subfolders.DOCUMENTOS_IMPORTADOR}/ACTA_CONSTITUTIVA.pdf`}
                    />
                    <FileController
                      form={form}
                      fieldLabel="Acta Constitutiva:"
                      controllerName="actaConstitutiva"
                      accept=".pdf"
                      buttonText="Seleccionar .pdf"
                    />

                    {/* <ShowFile /> */}

                    <FileController
                      form={form}
                      fieldLabel="Poder Notarial:"
                      controllerName="poderNotarial"
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
                <MyGPButtonSubmit form="form-documentos-importador">
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
