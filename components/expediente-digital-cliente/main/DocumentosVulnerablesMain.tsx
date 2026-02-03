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
import { useAuth } from '@/hooks/useAuth';

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

type FileField = {
  file?: File;
  category: number;
  filepath: string;
  filename: string;
};

export function DocumentosVulnerablesMain() {
  const { casa_id, cliente } = useCliente();
  const { getCasaUsername } = useAuth();

  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_ACTIVIDAD_VULNERABLE = FOLDERFILESTRUCT.DOCUMENTOS_ACTIVIDAD_VULNERABLE;
  const DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS = DOCUMENTOS_ACTIVIDAD_VULNERABLE?.docs;

  const basePath = `/${casa_id} ${cliente}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE.name}`;

  const formatoActividadVulnerable3901Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_ACTIVIDAD_VULNERABLE_3901.filename}`;
  const formatoActividadVulnerable3072Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_ACTIVIDAD_VULNERABLE_3072.filename}`;

  const formatodueñoBeneficiario3901Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_DUEÑO_BENEFICIARIO_3901.filename}`;
  const formatodueñoBeneficiario3072Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_DUEÑO_BENEFICIARIO_3072.filename}`;

  const lfpiorpi3901Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.LFPIORPI_HOJA_MEMBRETADA_3901.filename}`;
  const lfpiorpi3072Path = `${basePath}/${DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.LFPIORPI_HOJA_MEMBRETADA_3072.filename}`;

  // Convert each field into { file, category, filepath, filename }
  const formSchema = z.object({
    formatoActividadVulnerable3901: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_ACTIVIDAD_VULNERABLE_3901.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    formatoActividadVulnerable3072: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_ACTIVIDAD_VULNERABLE_3072.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),

    formatoDuenioBeneficiario3901: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_DUEÑO_BENEFICIARIO_3901.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    formatoDuenioBeneficiario3072: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.FORMATO_DUEÑO_BENEFICIARIO_3072.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),

    constanciaHojaMembretada3901: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.LFPIORPI_HOJA_MEMBRETADA_3901.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    constanciaHojaMembretada3072: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS?.LFPIORPI_HOJA_MEMBRETADA_3072.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const defaultValues = React.useMemo<FormValues>(() => {
    const docs = DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS!;

    const mk = (doc: any, filepath: string, fallback: string): FileField => ({
      file: undefined,
      category: doc.category,
      filename: doc.filename || fallback,
      filepath,
    });

    return {
      formatoActividadVulnerable3901: mk(
        docs.FORMATO_ACTIVIDAD_VULNERABLE_3901,
        formatoActividadVulnerable3901Path,
        'FORMATO_ACTIVIDAD_VULNERABLE_3901.pdf'
      ),
      formatoActividadVulnerable3072: mk(
        docs.FORMATO_ACTIVIDAD_VULNERABLE_3072,
        formatoActividadVulnerable3072Path,
        'FORMATO_ACTIVIDAD_VULNERABLE_3072.pdf'
      ),

      formatoDuenioBeneficiario3901: mk(
        docs.FORMATO_DUEÑO_BENEFICIARIO_3901,
        formatodueñoBeneficiario3901Path,
        'FORMATO_DUENIO_BENEFICIARIO_3901.pdf'
      ),
      formatoDuenioBeneficiario3072: mk(
        docs.FORMATO_DUEÑO_BENEFICIARIO_3072,
        formatodueñoBeneficiario3072Path,
        'FORMATO_DUENIO_BENEFICIARIO_3072.pdf'
      ),

      constanciaHojaMembretada3901: mk(
        docs.LFPIORPI_HOJA_MEMBRETADA_3901,
        lfpiorpi3901Path,
        'LFPIORPI_HOJA_MEMBRETADA_3901.pdf'
      ),
      constanciaHojaMembretada3072: mk(
        docs.LFPIORPI_HOJA_MEMBRETADA_3072,
        lfpiorpi3072Path,
        'LFPIORPI_HOJA_MEMBRETADA_3072.pdf'
      ),
    };
  }, [
    DOCUMENTOS_ACTIVIDAD_VULNERABLE_DOCS,
    formatoActividadVulnerable3901Path,
    formatoActividadVulnerable3072Path,
    formatodueñoBeneficiario3901Path,
    formatodueñoBeneficiario3072Path,
    lfpiorpi3901Path,
    lfpiorpi3072Path,
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const resetForm = () => {
    const v = form.getValues();
    form.reset({
      ...v,
      formatoActividadVulnerable3901: { ...v.formatoActividadVulnerable3901, file: undefined },
      formatoActividadVulnerable3072: { ...v.formatoActividadVulnerable3072, file: undefined },
      formatoDuenioBeneficiario3901: { ...v.formatoDuenioBeneficiario3901, file: undefined },
      formatoDuenioBeneficiario3072: { ...v.formatoDuenioBeneficiario3072, file: undefined },
      constanciaHojaMembretada3901: { ...v.constanciaHojaMembretada3901, file: undefined },
      constanciaHojaMembretada3072: { ...v.constanciaHojaMembretada3072, file: undefined },
    });
  };

  // Upload + insert record
  const onSubmit = async (data: FormValues) => {
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

      toast.info('Se subieron los archivos correctamente');

      await Promise.all([
        revalidateFileExists(formatoActividadVulnerable3901Path),
        revalidateFileExists(formatoActividadVulnerable3072Path),
        revalidateFileExists(formatodueñoBeneficiario3901Path),
        revalidateFileExists(formatodueñoBeneficiario3072Path),
        revalidateFileExists(lfpiorpi3901Path),
        revalidateFileExists(lfpiorpi3072Path),
      ]);

      resetForm();
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
      value={accordionOpen ? 'documentos-vulnerables' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'documentos-vulnerables')}
    >
      <AccordionItem value="documentos-vulnerables">
        <AccordionTrigger className="bg-yellow-600 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_1fr] gap-2 place-items-center">
            <FileIcon size={18} />
            <p className="font-bold">
              Documentos para Importadores/Exportadores con Actividad Vulnerable
            </p>
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
                        controllerName="formatoActividadVulnerable3901.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
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
                        controllerName="formatoActividadVulnerable3072.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
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
                        controllerName="formatoDuenioBeneficiario3901.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
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
                        controllerName="formatoDuenioBeneficiario3072.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                      />
                    </div>

                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={lfpiorpi3901Path} />
                      <DownloadFormato doc="LFPIORPI_3901" />
                      <FileController
                        form={form}
                        fieldLabel="Constancia LFPIORPI en Hoja Membretada 3901"
                        controllerName="constanciaHojaMembretada3901.file"
                        buttonText="Selecciona .pdf .png .jpeg"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                      />
                    </div>

                    <div className="flex gap-2">
                      <ShowFile shouldFetch={accordionOpen} path={lfpiorpi3072Path} />
                      <DownloadFormato doc="LFPIORPI_3072" />
                      <FileController
                        form={form}
                        fieldLabel="Constancia LFPIORPI en Hoja Membretada 3072"
                        controllerName="constanciaHojaMembretada3072.file"
                        buttonText="Selecciona .pdf .png .jpeg"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                      />
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={resetForm}>Reiniciar</MyGPButtonGhost>
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
