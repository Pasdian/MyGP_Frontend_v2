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

import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

import {
  createPdfSchema,
  expiryDateSchema,
} from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { ExpiraEnController } from '@/components/expediente-digital-cliente/form-controllers/ExpiraEnController';

import * as z from 'zod/v4';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';
import { Loader2 } from 'lucide-react';

const _documentosAcreditaAgente =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_ACREDITA_AGENTE_ADUANAL;

if (!_documentosAcreditaAgente?.docs) {
  throw new Error('Missing DOCUMENTOS_ACREDITA_AGENTE_ADUANAL docs');
}

const RENAME_MAP: Record<
  'obligacionesFiscales' | 'datosBancarios' | 'conferidoJosePascal' | 'conferidoMarcoBremer',
  string
> = {
  obligacionesFiscales:
    _documentosAcreditaAgente.docs.OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES.filename,
  datosBancarios: _documentosAcreditaAgente.docs.DATOS_BANCARIOS_HOJA_MEMBRETADA.filename,
  conferidoJosePascal:
    _documentosAcreditaAgente.docs.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.filename,
  conferidoMarcoBremer:
    _documentosAcreditaAgente.docs.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.filename,
};

export function AcreditacionSub() {
  const { casa_id, cliente } = useCliente();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isHydrating, setIsHydrating] = React.useState(false);
  const didHydrateRef = React.useRef(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DOCUMENTOS_ACREDITA_AGENTE_ADUANAL =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_ACREDITA_AGENTE_ADUANAL;

  const DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS = DOCUMENTOS_ACREDITA_AGENTE_ADUANAL?.docs;

  const basePath = `/${casa_id}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL?.name}`;

  const obligacionesFiscalesPath = `${basePath}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES.filename}`;
  const datosBancariosPath = `${basePath}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.DATOS_BANCARIOS_HOJA_MEMBRETADA.filename}`;
  const conferidoJosePascalPath = `${basePath}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.filename}`;
  const conferidoMarcoBremerPath = `${basePath}/${DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.filename}`;

  const formSchema = z.object({
    obligacionesFiscales: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES?.size ||
          2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),

    datosBancarios: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.DATOS_BANCARIOS_HOJA_MEMBRETADA?.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    datosBancariosExp: expiryDateSchema,

    conferidoJosePascal: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO
          ?.size || 2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    conferidoJosePascalExp: expiryDateSchema,

    conferidoMarcoBremer: z.object({
      file: createPdfSchema(
        DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS?.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA?.size ||
          2_000_000
      ).optional(),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    conferidoMarcoBremerExp: expiryDateSchema,
  });

  const resetForm = () => {
    form.reset({
      ...form.getValues(),
      obligacionesFiscales: { ...form.getValues('obligacionesFiscales'), file: undefined },
      datosBancarios: { ...form.getValues('datosBancarios'), file: undefined },
      conferidoJosePascal: { ...form.getValues('conferidoJosePascal'), file: undefined },
      conferidoMarcoBremer: { ...form.getValues('conferidoMarcoBremer'), file: undefined },
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const fileKeys = [
        'obligacionesFiscales',
        'datosBancarios',
        'conferidoJosePascal',
        'conferidoMarcoBremer',
      ] as const;

      for (const fieldName of fileKeys) {
        const fileObj = data[fieldName]; // { file, category, filepath, filename }
        const realFile = fileObj?.file; // File | undefined
        if (!realFile) continue;

        const rename = RENAME_MAP[fieldName];

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', realFile);
        formData.append('rename', rename);

        // pick matching expiration_date
        const expiration_date =
          fieldName === 'datosBancarios'
            ? (data.datosBancariosExp ?? null)
            : fieldName === 'conferidoJosePascal'
              ? (data.conferidoJosePascalExp ?? null)
              : fieldName === 'conferidoMarcoBremer'
                ? (data.conferidoMarcoBremerExp ?? null)
                : null;

        const insertRecordPayload = {
          filename: fileObj.filename,
          file_date: new Date(realFile.lastModified).toISOString().split('T')[0],
          filepath: fileObj.filepath,
          client_id: casa_id,
          file_category: fileObj.category,
          is_valid: true,
          status: 0,
          comment: '',
          expiration_date,
          uploaded_by: 'MYGP', // or your user
        };

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        await GPClient.post('/api/expediente-digital-cliente', insertRecordPayload);
      }

      toast.info('Se subieron los archivos correctamente');

      await Promise.all([
        revalidateFileExists(obligacionesFiscalesPath),
        revalidateFileExists(datosBancariosPath),
        revalidateFileExists(conferidoJosePascalPath),
        revalidateFileExists(conferidoMarcoBremerPath),
      ]);
    } catch (error) {
      console.error(error);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues = React.useMemo<z.infer<typeof formSchema>>(() => {
    const docs = DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS!;

    return {
      obligacionesFiscales: {
        file: undefined,
        category: docs.OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES.category,
        filename:
          docs.OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES.filename ||
          'OPINION_CUMPLIMIENTO_OBLIGACIONES_FISCALES.pdf',
        filepath: obligacionesFiscalesPath,
      },

      datosBancarios: {
        file: undefined,
        category: docs.DATOS_BANCARIOS_HOJA_MEMBRETADA.category,
        filename:
          docs.DATOS_BANCARIOS_HOJA_MEMBRETADA.filename || 'DATOS_BANCARIOS_HOJA_MEMBRETADA.pdf',
        filepath: datosBancariosPath,
      },
      datosBancariosExp: '',

      conferidoJosePascal: {
        file: undefined,
        category: docs.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.category,
        filename:
          docs.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.filename ||
          'ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.pdf',
        filepath: conferidoJosePascalPath,
      },
      conferidoJosePascalExp: '',

      conferidoMarcoBremer: {
        file: undefined,
        category: docs.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.category,
        filename:
          docs.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.filename ||
          'ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.pdf',
        filepath: conferidoMarcoBremerPath,
      },
      conferidoMarcoBremerExp: '',
    };
  }, [
    DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS,
    obligacionesFiscalesPath,
    datosBancariosPath,
    conferidoJosePascalPath,
    conferidoMarcoBremerPath,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const fetchLastFileByClientAndFilename = React.useCallback(
    async (clientId: string, filename: string) => {
      const { data } = await GPClient.get('/api/expediente-digital-cliente/files/last', {
        params: { client_id: clientId, filename },
      });
      return data as { expiration_date?: string | null };
    },
    []
  );

  React.useEffect(() => {
    const hydrateDates = async () => {
      if (!accordionOpen) return;
      if (didHydrateRef.current) return;

      try {
        setIsHydrating(true);

        const docs = DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS!;
        const clientId = casa_id;

        const [banc, jose, marco] = await Promise.allSettled([
          fetchLastFileByClientAndFilename(clientId, docs.DATOS_BANCARIOS_HOJA_MEMBRETADA.filename),
          fetchLastFileByClientAndFilename(
            clientId,
            docs.ENCARGO_CONFERIDO_JOSE_ANTONIO_PASCAL_CALVILLO.filename
          ),
          fetchLastFileByClientAndFilename(
            clientId,
            docs.ENCARGO_CONFERIDO_MARCO_BREMER_GARCIA.filename
          ),
        ]);

        const bancDate = banc.status === 'fulfilled' ? (banc.value?.expiration_date ?? '') : '';
        const joseDate = jose.status === 'fulfilled' ? (jose.value?.expiration_date ?? '') : '';
        const marcoDate = marco.status === 'fulfilled' ? (marco.value?.expiration_date ?? '') : '';

        form.reset({
          ...form.getValues(), // keep any already-selected files in UI
          datosBancariosExp: bancDate,
          conferidoJosePascalExp: joseDate,
          conferidoMarcoBremerExp: marcoDate,
        });

        didHydrateRef.current = true;
      } catch (err: any) {
        console.error(err);
        toast.error('Error al cargar fechas de documentos');
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateDates();
  }, [
    accordionOpen,
    casa_id,
    form,
    fetchLastFileByClientAndFilename,
    DOCUMENTOS_ACREDITA_AGENTE_ADUANAL_DOCS,
  ]);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'acreditacion' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'acreditacion')}
    >
      <AccordionItem value="acreditacion" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          <div className="flex items-center gap-2">
            <span> Documentos que acredita el Agente Aduanal</span>

            {isHydrating && (
              <Loader2 className="h-4 w-4 animate-spin text-white" aria-label="Cargando datos" />
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <Card className="w-full px-4">
            <CardContent>
              <form id="form-acreditacion" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
                    <ShowFile shouldFetch={accordionOpen} path={obligacionesFiscalesPath} />
                    <div className="col-span-2">
                      <FileController
                        form={form}
                        fieldLabel="Opinión de Cumplimiento de Obligaciones Fiscales (mes en curso):"
                        controllerName="obligacionesFiscales.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                        buttonText="Selecciona .pdf .png .jpeg"
                      />
                    </div>

                    <ShowFile shouldFetch={accordionOpen} path={datosBancariosPath} />
                    <FileController
                      form={form}
                      fieldLabel="Datos Bancarios en Hoja Membretada:"
                      controllerName="datosBancarios.file"
                      accept={['application/pdf', 'image/png', 'image/jpeg']}
                      buttonText="Selecciona .pdf .png .jpeg"
                    />
                    <ExpiraEnController form={form} controllerName="datosBancariosExp" />

                    <ShowFile shouldFetch={accordionOpen} path={conferidoJosePascalPath} />
                    <FileController
                      form={form}
                      fieldLabel="Generación del Encargo Conferido A.A. José Antonio Pascal Calvillo (no aplica en exportación):"
                      controllerName="conferidoJosePascal.file"
                      accept={['application/pdf', 'image/png', 'image/jpeg']}
                    />
                    <ExpiraEnController form={form} controllerName="conferidoJosePascalExp" />

                    <ShowFile shouldFetch={accordionOpen} path={conferidoMarcoBremerPath} />
                    <FileController
                      form={form}
                      fieldLabel="Generación del Encargo Conferido A.A. Marco Bremer García (no aplica en exportación):"
                      controllerName="conferidoMarcoBremer.file"
                      buttonText="Selecciona .pdf .png .jpeg"
                      accept={['application/pdf', 'image/png', 'image/jpeg']}
                    />
                    <ExpiraEnController form={form} controllerName="conferidoMarcoBremerExp" />
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-acreditacion" isSubmitting={isSubmitting}>
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
