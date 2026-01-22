// DocumentosImportadorSub.tsx
import * as z from 'zod/v4';
import React from 'react';
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
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { ShowFile, revalidateFileExists } from '../buttons/ShowFile';
import { createPdfSchema } from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { useAuth } from '@/hooks/useAuth';

const documentosImportador =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_IMPORTADOR;

if (!documentosImportador?.docs) {
  throw new Error('Missing DOCUMENTOS_IMPORTADOR docs');
}

const RENAME_MAP: Record<string, string> = {
  actaConstitutiva: documentosImportador.docs.ACTA_CONSTITUTIVA.filename,
  poderNotarial: documentosImportador.docs.PODER_NOTARIAL.filename,
};

export function DocumentosImportadorSub() {
  const { cliente } = useCliente();
  const { getCasaUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [accordionOpen, setAccordionOpen] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DOCUMENTOS_IMPORTADOR =
    FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_IMPORTADOR;
  const DOCUMENTOS_IMPORTADOR_DOCS =
    FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_IMPORTADOR.docs;

  const basePath = `/${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DOCUMENTOS_IMPORTADOR?.name}`;

  const actaPath = `${basePath}/${DOCUMENTOS_IMPORTADOR_DOCS?.ACTA_CONSTITUTIVA.filename}`;
  const poderPath = `${basePath}/${DOCUMENTOS_IMPORTADOR_DOCS?.PODER_NOTARIAL.filename}`;

  const formSchema = z.object({
    actaConstitutiva: z.object({
      file: createPdfSchema(DOCUMENTOS_IMPORTADOR_DOCS?.ACTA_CONSTITUTIVA?.size || 2_000_000),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    poderNotarial: z.object({
      file: createPdfSchema(DOCUMENTOS_IMPORTADOR_DOCS?.PODER_NOTARIAL?.size || 2_000_000),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
  });

  const defaultValues = React.useMemo(() => {
    const docs = DOCUMENTOS_IMPORTADOR_DOCS!;

    return {
      actaConstitutiva: {
        file: undefined,
        category: docs.ACTA_CONSTITUTIVA.category,
        filename: docs.ACTA_CONSTITUTIVA.filename || 'ACTA_CONSTITUTIVA.pdf',
        filepath: actaPath,
      },
      poderNotarial: {
        file: undefined,
        category: docs.PODER_NOTARIAL.category,
        filename: docs.PODER_NOTARIAL.filename || 'PODER_NOTARIAL.pdf',
        filepath: poderPath,
      },
    };
  }, [DOCUMENTOS_IMPORTADOR_DOCS, actaPath, poderPath]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const resetForm = () => {
    form.reset({
      actaConstitutiva: { ...form.getValues('actaConstitutiva'), file: undefined },
      poderNotarial: { ...form.getValues('poderNotarial'), file: undefined },
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const entries = Object.entries(data) as Array<
        [
          keyof typeof data,
          { file?: File; category?: number; filepath?: string; filename?: string },
        ]
      >;

      for (const [fieldName, value] of entries) {
        const file = value?.file;
        if (!file) continue;

        const rename = RENAME_MAP[fieldName as string] ?? String(fieldName);

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', file);
        formData.append('rename', rename);

        const insertRecordPayload = {
          filename: value.filename,
          file_date: value.file
            ? new Date(value.file.lastModified).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          filepath: value.filepath,
          client_id: cliente.split(' ')[0],
          file_category: value.category,
          is_valid: 1,
          status: 0,
          comment: '',
          expiration_date: null,
          uploaded_by: getCasaUsername() || 'MYGP',
        };

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        await GPClient.post('/api/expediente-digital-cliente', insertRecordPayload);
      }

      toast.info('Se subieron los archivos correctamente');
      resetForm();

      await Promise.all([revalidateFileExists(actaPath), revalidateFileExists(poderPath)]);
    } catch (error) {
      console.error(error);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'documentos-importador-sub' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'documentos-importador-sub')}
    >
      <AccordionItem value="documentos-importador-sub" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Documentos del Importador
        </AccordionTrigger>

        <AccordionContent>
          <Card className="w-full">
            <CardContent>
              <form id="form-documentos-importador" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
                      <ShowFile shouldFetch={accordionOpen} path={actaPath} />
                      <FileController
                        form={form}
                        fieldLabel="Acta Constitutiva:"
                        controllerName="actaConstitutiva.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                        buttonText="Selecciona .pdf .png .jpeg"
                      />
                    </div>

                    <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
                      <ShowFile shouldFetch={accordionOpen} path={poderPath} />
                      <FileController
                        form={form}
                        fieldLabel="Poder Notarial:"
                        controllerName="poderNotarial.file"
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
                <MyGPButtonGhost onClick={() => resetForm()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-documentos-importador" isSubmitting={isSubmitting}>
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
