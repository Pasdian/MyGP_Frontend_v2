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
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import React from 'react';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';

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
  const { cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_COMPLEMENTARIOS = FOLDERFILESTRUCT.DOCUMENTOS_COMPLEMENTARIOS;
  const DOCUMENTOS_COMPLEMENTARIOS_DOCS = DOCUMENTOS_COMPLEMENTARIOS?.docs;

  const basePath = `/${cliente}/${DOCUMENTOS_COMPLEMENTARIOS.name}`;

  const cuestionarioPath = `${basePath}/${DOCUMENTOS_COMPLEMENTARIOS_DOCS?.CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS.filename}`;
  const altaClientesPath = `${basePath}/${DOCUMENTOS_COMPLEMENTARIOS_DOCS?.ALTA_CLIENTES.filename}`;
  const listaClintonPath = `${basePath}/${DOCUMENTOS_COMPLEMENTARIOS_DOCS?.LISTA_CLINTON.filename}`;

  const formSchema = z.object({
    cuestionarioLavadoTerrorismo: createPdfSchema(
      DOCUMENTOS_COMPLEMENTARIOS_DOCS?.CUESTIONARIO_PREVENCION_LAVADO_ACTIVOS.size || 2_000_000
    ),
    altaClientes: createPdfSchema(DOCUMENTOS_COMPLEMENTARIOS_DOCS?.ALTA_CLIENTES.size || 2_000_000),
    listaClinton: createPdfSchema(DOCUMENTOS_COMPLEMENTARIOS_DOCS?.LISTA_CLINTON.size || 2_000_000),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (!cliente) {
        toast.message('Selecciona un cliente antes de subir archivos');
        return;
      }

      const fileKeys = ['cuestionarioLavadoTerrorismo', 'altaClientes', 'listaClinton'] as const;

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

      toast.message('Se subieron los archivos correctamente');
      await Promise.all([
        revalidateFileExists(cuestionarioPath),
        revalidateFileExists(altaClientesPath),
        revalidateFileExists(listaClintonPath),
      ]);
      form.reset(data);
    } catch (error) {
      console.error(error);
      toast.message('Error al subir los archivos');
    }
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
                      <ShowFile shouldFetch={accordionOpen} path={cuestionarioPath} />
                      <DownloadFormato doc="CUESTIONARIO_PREVENCION_LAVADO_TERRORISMO" />
                      <FileController
                        form={form}
                        fieldLabel="Cuestionario de Prevención de Lavado de Activos y Financiación de Terrorismo:"
                        controllerName="cuestionarioLavadoTerrorismo"
                        accept=".pdf"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={altaClientesPath} />
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
