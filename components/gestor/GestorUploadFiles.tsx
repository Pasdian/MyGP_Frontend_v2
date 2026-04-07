'use client';

import React from 'react';
import useSWR from 'swr';
import { GPClient, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
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
import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';
import { UploadIcon } from 'lucide-react';
import type { GestorCategoryKey } from '@/types/gestor/GestorCategoryKey';

const PDF_MAX_SIZE = 25_000_000;
const INVALID_FILENAME_SEGMENT_CHARACTERS = /[<>:"/\\|?*\u0000-\u001F]+/g;
const MAN_VAL_CATEGORY: GestorCategoryKey = 'MAN_VAL';
const HOJ_CAL_CATEGORY: GestorCategoryKey = 'HOJ_CAL';
const FAC_PAS_CATEGORY: GestorCategoryKey = 'FAC_PAS';
const HIDDEN_FILE_CATEGORIES = new Set<GestorCategoryKey>([HOJ_CAL_CATEGORY]);
const GESTOR_CATEGORY_DIR_MAP: Record<GestorCategoryKey, string> = {
  CTA_GAS: '01-CTA-GASTOS',
  PED_NOR: '02-EXPEDIENTE-ADUANAL',
  MAN_VAL: '02-EXPEDIENTE-ADUANAL',
  HOJ_CAL: '02-EXPEDIENTE-ADUANAL',
  FAC_TER: '03-FISCALES',
  FAC_PAS: '03-FISCALES',
  FAC_COM: '04-VUCEM',
  GUIA: '04-VUCEM',
  CER_ORI: '04-VUCEM',
};

type FileCategoryOption = {
  value: GestorCategoryKey;
  key: string;
};

const getFileExtension = (file: File) => {
  const filename = file.name || '';
  return filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || '' : '';
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
  suffix,
}: {
  client: string;
  reference: string;
  fileCategory: string;
  casaUsername: string;
  suffix?: string;
}) => {
  const parts = [
    normalizeFilenameSegment(client) || 'CLIENTE',
    normalizeFilenameSegment(reference) || 'REFERENCIA',
    normalizeFilenameSegment(fileCategory) || 'CATEGORIA',
    getUtcDateStamp(),
    normalizeFilenameSegment(casaUsername) || 'MYGP',
  ];

  if (suffix) parts.push(normalizeFilenameSegment(suffix));

  return parts.join('_');
};

const buildFrontendFilename = (params: {
  client: string;
  reference: string;
  fileCategory: string;
  file: File;
  casaUsername: string;
  suffix?: string;
}) => {
  const extension = getFileExtension(params.file) || 'bin';
  const baseFilename = buildFrontendFilenameBase(params);
  return `${baseFilename}.${extension}`;
};

const buildFrontendFilenamePreview = (params: {
  client: string;
  reference: string;
  fileCategory: string;
  extension: string;
  casaUsername: string;
  suffix?: string;
}) => {
  const safeExtension = params.extension.trim() || 'bin';
  const baseFilename = buildFrontendFilenameBase(params);
  return `${baseFilename}.${safeExtension}`;
};

const buildRenamedFile = (file: File, finalName: string) =>
  new File([file], finalName, {
    type: file.type,
    lastModified: file.lastModified,
  });

const getDestFolderForCategory = (category: GestorCategoryKey) => GESTOR_CATEGORY_DIR_MAP[category];

type GestorUploadFilesProps = {
  client: string;
  reference: string;
  defaultFileCategory?: GestorCategoryKey;
  disableCategorySelect?: boolean;
  onUploadSuccess?: () => void | Promise<void>;
};

export default function GestorUploadFiles({
  client: initialClient,
  reference: initialReference,
  defaultFileCategory,
  disableCategorySelect = false, // Default to false
  onUploadSuccess,
}: GestorUploadFilesProps) {
  const { data: fileCategories } = useSWR('/pyapi/gestor/fileCategories', axiosFetcher);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { getCasaUsername } = useAuth();

  const formSchema = z
    .object({
      reference: z.string().min(1, 'Falta referencia'),
      client: z.string().min(1, 'Ingresa un cliente'),
      fileCategory: z.string().min(1, 'Selecciona una categoría'),
      pdf_file: z
        .instanceof(File)
        .optional()
        .refine((f) => !f || f.size <= PDF_MAX_SIZE, `Máximo 25MB`)
        .refine((f) => !f || f.type === 'application/pdf', 'Solo PDF'),
      xml_file: z
        .instanceof(File)
        .optional()
        .refine((f) => !f || f.size <= PDF_MAX_SIZE, `Máximo 25MB`)
        .refine((f) => !f || ['application/xml', 'text/xml'].includes(f.type), 'Solo XML'),
      hoja_calculo_pdf_file: z
        .instanceof(File)
        .optional()
        .refine((f) => !f || f.size <= PDF_MAX_SIZE, `Máximo 25MB`)
        .refine((f) => !f || f.type === 'application/pdf', 'Solo PDF'),
    })
    .superRefine((data, ctx) => {
      if (!data.pdf_file)
        ctx.addIssue({ code: 'custom', path: ['pdf_file'], message: 'Obligatorio' });
      if (data.fileCategory === FAC_PAS_CATEGORY && !data.xml_file)
        ctx.addIssue({ code: 'custom', path: ['xml_file'], message: 'Requiere XML' });
      if (data.fileCategory === MAN_VAL_CATEGORY && !data.hoja_calculo_pdf_file)
        ctx.addIssue({
          code: 'custom',
          path: ['hoja_calculo_pdf_file'],
          message: 'Requiere Hoja de Cálculo',
        });
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: initialClient,
      reference: initialReference,
      fileCategory: defaultFileCategory ?? '',
    },
  });

  const { pdf_file, hoja_calculo_pdf_file, fileCategory, client, reference } = form.watch();
  const casaUsername = normalizeFilenameSegment(getCasaUsername() || 'MYGP');

  const fileCategoryOptions = React.useMemo(() => {
    if (!fileCategories) return [];
    return (fileCategories as FileCategoryOption[])
      .filter((item) => !HIDDEN_FILE_CATEGORIES.has(item.value))
      .map((item) => ({ value: item.value, label: item.key }));
  }, [fileCategories]);

  // --- Filename Previews ---
  const pdfTargetFilenameDisplay = React.useMemo(() => {
    return buildFrontendFilenamePreview({
      client: client || 'CLIENTE',
      reference: reference || 'REFERENCIA',
      fileCategory: fileCategory || 'CATEGORIA',
      extension: (pdf_file && getFileExtension(pdf_file)) || 'pdf',
      casaUsername,
    });
  }, [client, reference, fileCategory, casaUsername, pdf_file]);

  const hojaCalculoTargetFilenameDisplay = React.useMemo(() => {
    if (fileCategory !== MAN_VAL_CATEGORY) return '';
    return buildFrontendFilenamePreview({
      client: client || 'CLIENTE',
      reference: reference || 'REFERENCIA',
      fileCategory: HOJ_CAL_CATEGORY, // Force HOJ_CAL code here
      extension: (hoja_calculo_pdf_file && getFileExtension(hoja_calculo_pdf_file)) || 'pdf',
      casaUsername,
    });
  }, [client, reference, fileCategory, casaUsername, hoja_calculo_pdf_file]);

  const currentCategoryLabel = React.useMemo(() => {
    const selectedOption = fileCategoryOptions.find(
      (opt: { label: string; value: string }) => opt.value === fileCategory
    );

    return selectedOption ? selectedOption.label : 'Archivo';
  }, [fileCategory, fileCategoryOptions]);

  async function uploadBatch({
    files,
    destFolder,
    client,
    reference,
    uploadedBy,
  }: {
    files: File[];
    destFolder: string;
    client: string;
    reference: string;
    uploadedBy: string;
  }) {
    const fd = new FormData();
    fd.append('client', client);
    fd.append('reference', reference);
    fd.append('dest_folder', destFolder);
    fd.append('uploaded_by', uploadedBy);
    files.forEach((file) => {
      fd.append('filenames', file.name);
      fd.append('upload_files', file);
    });

    await GPClient.post('/pyapi/gestor/uploads', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const uploadedBy = getCasaUsername() || 'MYGP';
      const selectedDestFolder = getDestFolderForCategory(data.fileCategory as GestorCategoryKey);

      if (!selectedDestFolder) {
        throw new Error('No se encontró carpeta destino para la categoría seleccionada');
      }
      const filesToUpload: File[] = [];

      const renamedPdfFile = buildRenamedFile(
        data.pdf_file!,
        buildFrontendFilename({
          client: data.client,
          reference: data.reference,
          fileCategory: data.fileCategory,
          file: data.pdf_file!,
          casaUsername: uploadedBy,
        })
      );
      filesToUpload.push(renamedPdfFile);

      const renamedHojaCalculoPdfFile = data.hoja_calculo_pdf_file
        ? buildRenamedFile(
            data.hoja_calculo_pdf_file,
            buildFrontendFilename({
              client: data.client,
              reference: data.reference,
              fileCategory: HOJ_CAL_CATEGORY, // Use HOJ_CAL shorthand
              file: data.hoja_calculo_pdf_file,
              casaUsername: uploadedBy,
            })
          )
        : null;
      if (renamedHojaCalculoPdfFile) {
        filesToUpload.push(renamedHojaCalculoPdfFile);
      }

      if (data.xml_file) {
        const renamedXml = buildRenamedFile(
          data.xml_file,
          buildFrontendFilename({
            client: data.client,
            reference: data.reference,
            fileCategory: data.fileCategory,
            file: data.xml_file,
            casaUsername: uploadedBy,
          })
        );
        filesToUpload.push(renamedXml);
      }

      await uploadBatch({
        files: filesToUpload,
        destFolder: selectedDestFolder,
        client: data.client,
        reference: data.reference,
        uploadedBy,
      });

      await onUploadSuccess?.();
      toast.success('Archivos subidos correctamente');
    } catch (error: unknown) {
      const axiosLikeError = error as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      };

      toast.error(axiosLikeError?.response?.data?.detail ?? 'Error al subir');
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
            <Input className="bg-muted" value={client} disabled readOnly />
          </Field>
          <Field>
            <Label className="text-sm font-medium">Referencia</Label>
            <Input className="bg-muted" value={reference} disabled readOnly />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <Field>
            <Label className="text-sm font-medium">Nombre Destino PDF</Label>
            <Input
              className="bg-muted font-mono text-xs"
              value={pdfTargetFilenameDisplay}
              disabled
              readOnly
            />
          </Field>

          {fileCategory === MAN_VAL_CATEGORY && (
            <Field>
              <Label className="text-sm font-medium">Nombre Destino Hoja de Cálculo</Label>
              <Input
                className="bg-muted font-mono text-xs"
                value={hojaCalculoTargetFilenameDisplay}
                disabled
                readOnly
              />
            </Field>
          )}

          <div className="w-full">
            <Controller
              name="fileCategory"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <MyGPCombo
                    options={fileCategoryOptions}
                    value={field.value ?? ''}
                    setValue={field.onChange}
                    label="Categoría de Archivo"
                    disabled={disableCategorySelect}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <FileController
            form={form}
            fieldLabel={`${currentCategoryLabel} (.pdf)`}
            controllerName="pdf_file"
            accept="application/pdf"
            buttonText="Adjuntar PDF"
          />

          {fileCategory === MAN_VAL_CATEGORY && (
            <FileController
              form={form}
              fieldLabel="Hoja de Cálculo (.pdf)"
              controllerName="hoja_calculo_pdf_file"
              accept="application/pdf"
              buttonText="Adjuntar PDF"
            />
          )}

          {fileCategory === FAC_PAS_CATEGORY && (
            <FileController
              form={form}
              fieldLabel="Archivo XML"
              controllerName="xml_file"
              accept="application/xml,text/xml"
              buttonText="Adjuntar XML"
            />
          )}
        </div>
        <div className="flex justify-end">
          <MyGPButtonSubmit isSubmitting={isSubmitting}>
            <UploadIcon /> Subir archivo(s)
          </MyGPButtonSubmit>
        </div>
      </FieldGroup>
    </form>
  );
}
