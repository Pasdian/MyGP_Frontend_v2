'use client';

import React from 'react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod/v4';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldGroup } from '../ui/field';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { FileController } from '../expediente-digital-cliente/form-controllers/FileController';
import { useGestor } from '@/contexts/Gestor/GestorContext';
import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';

const PDF_MAX_SIZE = 25_000_000;
const INVALID_FILENAME_SEGMENT_CHARACTERS = /[<>:"/\\|?*\u0000-\u001F]+/g;

const getFileExtension = (file: File) => {
  const filename = file.name || '';
  const extension = filename.includes('.') ? filename.split('.').pop() : '';
  return extension ? extension.toLowerCase() : '';
};

const getUtcDateStamp = () => new Date().toISOString().slice(0, 10).replaceAll('-', '');

const normalizeFilenameSegment = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(INVALID_FILENAME_SEGMENT_CHARACTERS, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

const buildFrontendFilenameBase = ({
  client,
  reference,
  fileCategory,
  casaUsername,
}: {
  client: string;
  reference: string;
  fileCategory: string;
  casaUsername: string;
}) => {
  const parts = [
    normalizeFilenameSegment(client) || 'CLIENTE',
    normalizeFilenameSegment(reference) || 'REFERENCIA',
    normalizeFilenameSegment(fileCategory) || 'CATEGORIA',
    getUtcDateStamp(),
    normalizeFilenameSegment(casaUsername) || 'MYGP',
  ];

  return parts.join('_');
};

const buildFrontendFilename = ({
  client,
  reference,
  fileCategory,
  file,
  casaUsername,
}: {
  client: string;
  reference: string;
  fileCategory: string;
  file: File;
  casaUsername: string;
}) => {
  const extension = getFileExtension(file) || 'bin';
  const baseFilename = buildFrontendFilenameBase({
    client,
    reference,
    fileCategory,
    casaUsername,
  });

  return `${baseFilename}.${extension}`;
};

const buildFrontendFilenamePreview = ({
  client,
  reference,
  fileCategory,
  extension,
  casaUsername,
}: {
  client: string;
  reference: string;
  fileCategory: string;
  extension: string;
  casaUsername: string;
}) => {
  const safeExtension = extension.trim() || 'bin';
  const baseFilename = buildFrontendFilenameBase({
    client,
    reference,
    fileCategory,
    casaUsername,
  });

  return `${baseFilename}.${safeExtension}`;
};

const buildRenamedFile = (file: File, finalName: string) =>
  new File([file], finalName, {
    type: file.type,
    lastModified: file.lastModified,
  });

export default function GestorUploadFiles() {
  const { searchRefData, fileCategories } = useGestor();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { getCasaUsername } = useAuth();

  const formSchema = z
    .object({
      reference: z.string().min(1, 'Falta referencia'),

      client: z.string().min(1, 'Ingresa un cliente'),
      fileCategory: z.string().min(1, 'Selecciona una categoría'),

      pdf_file: z
        .union([z.instanceof(File, { message: 'Archivo inválido' }), z.undefined()])
        .refine(
          (file) => !file || file.size <= PDF_MAX_SIZE,
          `Máximo ${PDF_MAX_SIZE / 1_000_000} MB`
        )
        .refine(
          (file) => !file || file.type === 'application/pdf',
          'Solo se aceptan archivos .pdf'
        ),

      xml_file: z
        .union([z.instanceof(File, { message: 'Archivo inválido' }), z.undefined()])
        .refine(
          (file) => !file || file.size <= PDF_MAX_SIZE,
          `Máximo ${PDF_MAX_SIZE / 1_000_000} MB`
        )
        .refine(
          (file) => !file || ['application/xml', 'text/xml'].includes(file.type),
          'Solo se aceptan archivos .xml'
        ),
    })
    .superRefine((data, ctx) => {
      if (!data.pdf_file) {
        ctx.addIssue({
          code: 'custom',
          path: ['pdf_file'],
          message: 'El archivo es obligatorio',
        });
      }

      if (data.fileCategory === 'FAC_PAS' && !data.xml_file) {
        ctx.addIssue({
          code: 'custom',
          path: ['xml_file'],
          message: 'Para factura pascal debes subir PDF + XML',
        });
      }

      if (data.fileCategory !== 'FAC_PAS' && data.xml_file) {
        ctx.addIssue({
          code: 'custom',
          path: ['xml_file'],
          message: 'El XML solo se permite para la categoría FAC_PAS',
        });
      }
    });

  const fileCategoryOptions = React.useMemo(() => {
    if (!fileCategories) return [];
    return fileCategories.map((item: { value: string; key: string }) => ({
      value: item.value,
      label: item.key,
    }));
  }, [fileCategories]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: '',
      reference: '',
      fileCategory: '',
      pdf_file: undefined,
      xml_file: undefined,
    },
    mode: 'onChange',
  });
  const pdfFile = form.watch('pdf_file');
  const xmlFile = form.watch('xml_file');
  const fileCategory = form.watch('fileCategory');
  const client = form.watch('client') ?? '';
  const reference = form.watch('reference') ?? '';
  const casaUsername = normalizeFilenameSegment(getCasaUsername() || 'MYGP') || 'MYGP';
  const pdfTargetFilenameDisplay = React.useMemo(() => {
    const previewClient = client || 'CLIENTE';
    const previewReference = reference || 'REFERENCIA';
    const previewCategory = fileCategory || 'CATEGORIA';
    const previewCasaUsername = casaUsername || 'MYGP';
    const previewPdfExtension = (pdfFile && getFileExtension(pdfFile)) || 'pdf';

    return buildFrontendFilenamePreview({
      client: previewClient,
      reference: previewReference,
      fileCategory: previewCategory,
      extension: previewPdfExtension,
      casaUsername: previewCasaUsername,
    });
  }, [client, reference, fileCategory, casaUsername, pdfFile]);

  const xmlTargetFilenameDisplay = React.useMemo(() => {
    if (fileCategory !== 'FAC_PAS') {
      return '';
    }

    const previewClient = client || 'CLIENTE';
    const previewReference = reference || 'REFERENCIA';
    const previewCategory = fileCategory || 'CATEGORIA';
    const previewCasaUsername = casaUsername || 'MYGP';
    const previewXmlExtension = (xmlFile && getFileExtension(xmlFile)) || 'xml';

    return buildFrontendFilenamePreview({
      client: previewClient,
      reference: previewReference,
      fileCategory: previewCategory,
      extension: previewXmlExtension,
      casaUsername: previewCasaUsername,
    });
  }, [client, reference, fileCategory, casaUsername, xmlFile]);

  React.useEffect(() => {
    form.register('client');
    form.register('reference');
  }, [form]);

  React.useEffect(() => {
    if (searchRefData.length === 0) return;

    const first = searchRefData[0];

    form.setValue('client', first.CVE_IMPO, { shouldValidate: true });
    form.setValue('reference', first.NUM_REFE, { shouldValidate: true });
  }, [searchRefData, form]);

  React.useEffect(() => {
    form.setValue('pdf_file', undefined, { shouldValidate: true, shouldDirty: true });
    form.setValue('xml_file', undefined, { shouldValidate: true, shouldDirty: true });
    form.clearErrors(['pdf_file', 'xml_file']);
  }, [fileCategory, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!data.pdf_file) {
      toast.error('Selecciona un PDF');
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedBy = getCasaUsername() || 'MYGP';
      const renamedPdfFile = buildRenamedFile(
        data.pdf_file,
        buildFrontendFilename({
          client: data.client,
          reference: data.reference,
          fileCategory: data.fileCategory,
          file: data.pdf_file,
          casaUsername: uploadedBy,
        })
      );
      const renamedXmlFile = data.xml_file
        ? buildRenamedFile(
            data.xml_file,
            buildFrontendFilename({
              client: data.client,
              reference: data.reference,
              fileCategory: data.fileCategory,
              file: data.xml_file,
              casaUsername: uploadedBy,
            })
          )
        : null;

      const fd = new FormData();
      fd.append('fileCategory', data.fileCategory);
      fd.append('client', data.client);
      fd.append('reference', data.reference);
      fd.append('uploaded_by', uploadedBy);
      fd.append('upload_files', renamedPdfFile);
      if (renamedXmlFile) fd.append('upload_files', renamedXmlFile);

      const uploadRes = await GPClient.post('/pyapi/gestor/uploads', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Archivo(s) subido(s) exitosamente');
      console.log('UPLOAD RESPONSE:', uploadRes.data);
    } catch (error: unknown) {
      const axiosLikeError = error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      };

      toast.error(
        axiosLikeError?.response?.data?.detail ??
          axiosLikeError?.response?.data?.message ??
          'Error al subir el archivo al gestor'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id="form-gestor-upload-files" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <Label className="text-sm font-medium">Cliente</Label>
            <Input
              className="w-full rounded-md border px-3 py-2 text-sm bg-muted"
              value={form.watch('client') ?? ''}
              disabled
              readOnly
            />
          </Field>
          <Field>
            <Label className="text-sm font-medium">Referencia</Label>
            <Input
              className="w-full rounded-md border px-3 py-2 text-sm bg-muted"
              value={form.watch('reference') ?? ''}
              disabled
              readOnly
            />
          </Field>
        </div>
        <div className="flex flex-col gap-2">
          <Field>
            <Label className="text-sm font-medium">
              {fileCategory === 'FAC_PAS' ? 'Nombre Archivo .pdf' : 'Nombre del Archivo'}
            </Label>
            <Input
              className="w-full rounded-md border bg-muted px-3 py-2 font-mono text-sm text-foreground disabled:text-foreground disabled:opacity-100"
              value={pdfTargetFilenameDisplay}
              disabled
              readOnly
              title={pdfTargetFilenameDisplay}
            />
          </Field>

          {fileCategory === 'FAC_PAS' && (
            <Field>
              <Label className="text-sm font-medium">Nombre Archivo .xml</Label>
              <Input
                className="w-full rounded-md border bg-muted px-3 py-2 font-mono text-sm text-foreground disabled:text-foreground disabled:opacity-100"
                value={xmlTargetFilenameDisplay}
                disabled
                readOnly
                title={xmlTargetFilenameDisplay}
              />
            </Field>
          )}

          <div className="w-58">
            <Controller
              name="fileCategory"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <MyGPCombo
                    options={fileCategoryOptions}
                    value={field.value ?? ''}
                    setValue={(val) => {
                      field.onChange(val); // only update RHF
                    }}
                    placeholder="Selecciona una categoría"
                    label="Selecciona una categoría"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <FileController
            form={form}
            fieldLabel="Selecciona un archivo .pdf"
            controllerName="pdf_file"
            accept="application/pdf"
            buttonText="Selecciona un archivo .pdf"
          />

          {fileCategory === 'FAC_PAS' && (
            <FileController
              form={form}
              fieldLabel="Selecciona un archivo .xml"
              controllerName="xml_file"
              accept="application/xml,text/xml"
              buttonText="Selecciona un archivo .xml"
            />
          )}
        </div>
        <div>
          <MyGPButtonSubmit isSubmitting={isSubmitting}>Subir archivo(s)</MyGPButtonSubmit>
        </div>
      </FieldGroup>
    </form>
  );
}
