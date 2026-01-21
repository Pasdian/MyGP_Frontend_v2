import * as z from 'zod/v4';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileIcon } from 'lucide-react';
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

const _documentosVulnerables = FOLDERFILESTRUCT.DOCUMENTOS_ACTIVIDAD_VULNERABLE;

if (!_documentosVulnerables?.docs) {
  throw new Error('Missing DOCUMENTOS_ACTIVIDAD_VULNERABLE docs');
}

const RENAME_MAP: Record<string, string> = {
  formatoActividadVulnerable3901:
    _documentosVulnerables.docs.FORMATO_ACTIVIDAD_VULNERABLE_3901.filename,
  formatoActividadVulnerable3072:
    _documentosVulnerables.docs.FORMATO_ACTIVIDAD_VULNERABLE_3072.filename,

  formatoDuenioBeneficiario3901:
    _documentosVulnerables.docs.FORMATO_DUEÑO_BENEFICIARIO_3901.filename,
  formatoDuenioBeneficiario3072:
    _documentosVulnerables.docs.FORMATO_DUEÑO_BENEFICIARIO_3072.filename,

  constanciaHojaMembretada3901: _documentosVulnerables.docs.LFPIORPI_HOJA_MEMBRETADA_3901.filename,
  constanciaHojaMembretada3072: _documentosVulnerables.docs.LFPIORPI_HOJA_MEMBRETADA_3072.filename,
};

export function DocumentosVulnerablesMain() {
  const { cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_ACTIVIDAD_VULNERABLE = FOLDERFILESTRUCT.DOCUMENTOS_ACTIVIDAD_VULNERABLE;
  const DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS = DOCUMENTOS_ACTIVIDAD_VULNERABLE?.docs;

  const basePath = `/${cliente}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE.name}`;

  const formatoActividadVulnerable3901Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_ACTIVIDAD_VULNERABLE_3901.filename}`;
  const formatoActividadVulnerable3072Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_ACTIVIDAD_VULNERABLE_3072.filename}`;

  const formatodueñoBeneficiario3901Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_DUEÑO_BENEFICIARIO_3901.filename}`;
  const formatodueñoBeneficiario3072Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_DUEÑO_BENEFICIARIO_3072.filename}`;

  const lfpiorpi3901Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.LFPIORPI_HOJA_MEMBRETADA_3901.filename}`;
  const lfpiorpi3072Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.LFPIORPI_HOJA_MEMBRETADA_3072.filename}`;

  const formSchema = z.object({
    formatoActividadVulnerable3901: createPdfSchema(
      DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_ACTIVIDAD_VULNERABLE_3901.size || 2_000_000
    ),
    formatoActividadVulnerable3072: createPdfSchema(
      DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_ACTIVIDAD_VULNERABLE_3072.size || 2_000_000
    ),

    formatoDuenioBeneficiario3901: createPdfSchema(
      DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_DUEÑO_BENEFICIARIO_3901.size || 2_000_000
    ),
    formatoDuenioBeneficiario3072: createPdfSchema(
      DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_DUEÑO_BENEFICIARIO_3072.size || 2_000_000
    ),

    constanciaHojaMembretada3901: createPdfSchema(
      DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.LFPIORPI_HOJA_MEMBRETADA_3901.size || 2_000_000
    ),
    constanciaHojaMembretada3072: createPdfSchema(
      DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.LFPIORPI_HOJA_MEMBRETADA_3072.size || 2_000_000
    ),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (!cliente) {
        toast.message('Selecciona un cliente antes de subir archivos');
        return;
      }

      const fileKeys = [
        'formatoActividadVulnerable3901',
        'formatoActividadVulnerable3072',
        'formatoDuenioBeneficiario3901',
        'formatoDuenioBeneficiario3072',
        'constanciaHojaMembretada3901',
        'constanciaHojaMembretada3072',
      ] as const;

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
        revalidateFileExists(formatoActividadVulnerable3901Path),
        revalidateFileExists(formatoActividadVulnerable3072Path),

        revalidateFileExists(formatodueñoBeneficiario3901Path),
        revalidateFileExists(formatodueñoBeneficiario3072Path),

        revalidateFileExists(lfpiorpi3901Path),
        revalidateFileExists(lfpiorpi3072Path),
      ]);
      form.reset(data);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.message('Error al subir los archivos');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      formatoActividadVulnerable3901: undefined,
      formatoActividadVulnerable3072: undefined,

      formatoDuenioBeneficiario3901: undefined,
      formatoDuenioBeneficiario3072: undefined,

      constanciaHojaMembretada3901: undefined,
      constanciaHojaMembretada3072: undefined,
    },
  });

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'documentos-vulnerables' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'documentos-vulnerables')}
    >
      <AccordionItem value="documentos-vulnerables">
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
                      <ShowFile
                        shouldFetch={accordionOpen}
                        path={formatoActividadVulnerable3901Path}
                      />
                      <DownloadFormato doc="FORMATO_ACTIVIDAD_VULNERABLE_3901" />
                      <FileController
                        form={form}
                        fieldLabel="Formato Actividad Vulnerable (3901):"
                        controllerName="formatoActividadVulnerable3901"
                        accept=".pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile
                        shouldFetch={accordionOpen}
                        path={formatoActividadVulnerable3072Path}
                      />
                      <DownloadFormato doc="FORMATO_ACTIVIDAD_VULNERABLE_3072" />
                      <FileController
                        form={form}
                        fieldLabel="Formato Actividad Vulnerable (3072):"
                        controllerName="formatoActividadVulnerable3072"
                        accept=".pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile
                        shouldFetch={accordionOpen}
                        path={formatodueñoBeneficiario3901Path}
                      />
                      <DownloadFormato doc="FORMATO_DUENIO_BENEFICIARIO_3901" />
                      <FileController
                        form={form}
                        fieldLabel="Formato de Dueño Beneficiario 3901"
                        controllerName="formatoDuenioBeneficiario3901"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile
                        shouldFetch={accordionOpen}
                        path={formatodueñoBeneficiario3072Path}
                      />
                      <DownloadFormato doc="FORMATO_DUENIO_BENEFICIARIO_3072" />
                      <FileController
                        form={form}
                        fieldLabel="Formato de Dueño Beneficiario 3072"
                        controllerName="formatoDuenioBeneficiario3072"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={lfpiorpi3901Path} />
                      <DownloadFormato doc="LFPIORPI_3901" />
                      <FileController
                        form={form}
                        fieldLabel="Constancia LFPIORPI en Hoja Membretada 3901"
                        controllerName="constanciaHojaMembretada3901"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={lfpiorpi3072Path} />
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
                <MyGPButtonSubmit form="form-actividad-vulnerable" isSubmitting={isSubmitting}>
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
