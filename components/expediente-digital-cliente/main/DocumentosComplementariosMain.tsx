import * as z from 'zod/v4';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileIcon, LinkIcon } from 'lucide-react';
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
import { toast } from 'sonner';
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
import React from 'react';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';
import { useAuth } from '@/hooks/useAuth';

const _documentosComplementarios = FOLDERFILESTRUCT.DOCUMENTOS_COMPLEMENTARIOS;

if (!_documentosComplementarios?.docs) {
  throw new Error('Missing DOCUMENTOS_COMPLEMENTARIOS docs');
}

const RENAME_MAP: Record<string, string> = {
  cuestionarioLavadoTerrorismo:
    _documentosComplementarios.docs.CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS.filename,
  altaClientes: _documentosComplementarios.docs.ALTA_CLIENTES.filename,
  listaClinton: _documentosComplementarios.docs.LISTA_CLINTON.filename,
};

export function DocumentosComplementariosMain() {
  const { casa_id, cliente } = useCliente();
  const { getCasaUsername } = useAuth();

  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_COMPLEMENTARIOS = FOLDERFILESTRUCT.DOCUMENTOS_COMPLEMENTARIOS;
  const DOCUMENTOS_COMPLEMENTARIOS_DOCS = DOCUMENTOS_COMPLEMENTARIOS?.docs;

  const basePath = `/${casa_id}/${DOCUMENTOS_COMPLEMENTARIOS.name}`;

  const cuestionarioPath = `${basePath}/${DOCUMENTOS_COMPLEMENTARIOS_DOCS?.CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS.filename}`;
  const altaClientesPath = `${basePath}/${DOCUMENTOS_COMPLEMENTARIOS_DOCS?.ALTA_CLIENTES.filename}`;
  const listaClintonPath = `${basePath}/${DOCUMENTOS_COMPLEMENTARIOS_DOCS?.LISTA_CLINTON.filename}`;

  // Convert each field to { file, category, filepath, filename }
  const formSchema = z.object({
    cuestionarioLavadoTerrorismo: z.object({
      file: createPdfSchema(
        DOCUMENTOS_COMPLEMENTARIOS_DOCS?.CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    altaClientes: z.object({
      file: createPdfSchema(
        DOCUMENTOS_COMPLEMENTARIOS_DOCS?.ALTA_CLIENTES.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    listaClinton: z.object({
      file: createPdfSchema(
        DOCUMENTOS_COMPLEMENTARIOS_DOCS?.LISTA_CLINTON.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const defaultValues = React.useMemo<FormValues>(() => {
    const docs = DOCUMENTOS_COMPLEMENTARIOS_DOCS!;
    return {
      cuestionarioLavadoTerrorismo: {
        file: undefined,
        category: docs.CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS.category,
        filename:
          docs.CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS.filename || 'CUESTIONARIO_LAVADO_ACTIVOS.pdf',
        filepath: cuestionarioPath,
      },
      altaClientes: {
        file: undefined,
        category: docs.ALTA_CLIENTES.category,
        filename: docs.ALTA_CLIENTES.filename || 'ALTA_CLIENTES.pdf',
        filepath: altaClientesPath,
      },
      listaClinton: {
        file: undefined,
        category: docs.LISTA_CLINTON.category,
        filename: docs.LISTA_CLINTON.filename || 'LISTA_CLINTON.pdf',
        filepath: listaClintonPath,
      },
    };
  }, [DOCUMENTOS_COMPLEMENTARIOS_DOCS, cuestionarioPath, altaClientesPath, listaClintonPath]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset({
      ...form.getValues(),
      cuestionarioLavadoTerrorismo: {
        ...form.getValues('cuestionarioLavadoTerrorismo'),
        file: undefined,
      },
      altaClientes: { ...form.getValues('altaClientes'), file: undefined },
      listaClinton: { ...form.getValues('listaClinton'), file: undefined },
    });
  };

  // Upload + insert record (like BajoProtesta/CartaEncomienda)
  const onSubmit = async (data: FormValues) => {
    try {
      if (!cliente) {
        toast.message('Selecciona un cliente antes de subir archivos');
        return;
      }

      setIsSubmitting(true);

      const fileKeys = ['cuestionarioLavadoTerrorismo', 'altaClientes', 'listaClinton'] as const;

      for (const fieldName of fileKeys) {
        const fileObj = data[fieldName];
        const realFile = fileObj?.file;
        if (!realFile) continue;

        const rename = RENAME_MAP[fieldName] ?? fieldName;

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', realFile);
        formData.append('rename', rename);

        const insertRecordPayload = {
          filename: fileObj.filename,
          file_date: new Date(realFile.lastModified).toISOString().split('T')[0],
          filepath: fileObj.filepath,
          client_id: casa_id,
          file_category: fileObj.category,
          is_valid: true,
          status: 0,
          comment: '',
          expiration_date: null,
          uploaded_by: getCasaUsername() || 'MYGP',
        };

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        await GPClient.post('/api/expediente-digital-cliente', insertRecordPayload);
      }

      toast.message('Se subieron los archivos correctamente');

      await Promise.all([
        revalidateFileExists(cuestionarioPath),
        revalidateFileExists(altaClientesPath),
        revalidateFileExists(listaClintonPath),
      ]);

      resetForm();
    } catch (error) {
      console.error(error);
      toast.message('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'documentos-complementarios' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'documentos-complementarios')}
    >
      <AccordionItem value="documentos-complementarios">
        <AccordionTrigger className="bg-green-700 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_1fr] gap-2 place-items-center">
            <FileIcon size={18} />
            <p className="font-bold">Documentos Complementarios</p>
          </div>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-2 text-balance">
          <Card>
            <CardContent>
              <form id="form-documentos-complementarios" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={cuestionarioPath} />
                      <DownloadFormato doc="CUESTIONARIO_PREVENCION_LAVADO_TERRORISMO" />
                      <FileController
                        form={form}
                        fieldLabel="Cuestionario de Prevención de Lavado de Activos y Financiación de Terrorismo:"
                        controllerName="cuestionarioLavadoTerrorismo.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                        buttonText="Selecciona .pdf .png .jpeg"
                      />
                    </div>

                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={altaClientesPath} />
                      <DownloadFormato doc="ALTA_CLIENTES" />
                      <FileController
                        form={form}
                        fieldLabel="Alta de Clientes:"
                        controllerName="altaClientes.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                        buttonText="Selecciona .pdf .png .jpeg"
                      />
                    </div>

                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={listaClintonPath} />
                      <LinkIcon
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
                        controllerName="listaClinton.file"
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
                <MyGPButtonGhost onClick={resetForm}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit
                  form="form-documentos-complementarios"
                  isSubmitting={isSubmitting}
                >
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
