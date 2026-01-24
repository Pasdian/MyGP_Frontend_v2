'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Input } from '@/components/ui/input';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { X } from 'lucide-react';

import { createPdfSchema } from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { createImagesSchema } from '@/components/expediente-digital-cliente/schemas/datosContactoSchema';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';

import * as z from 'zod/v4';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const _datosContacto =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_CONTACTO_DEL_IMPORTADOR;

if (!_datosContacto?.docs) {
  throw new Error('Missing DATOS_CONTACTO_DEL_IMPORTADOR docs');
}

const RENAME_MAP: Record<string, string> = {
  comprobanteDomicilio: _datosContacto.docs.COMPROBANTE_DE_DOMICILIO.filename,
  fotosDomicilioFiscal: _datosContacto.docs.FOTOS_DOMICILIO_FISCAL.filename,
  fotosAcreditacionLegalInmueble: _datosContacto.docs.FOTOS_ACREDITACION_LEGAL_INMUEBLE.filename,
  fotosLugarActividades: _datosContacto.docs.FOTOS_LUGAR_ACTIVIDADES.filename,
};

const PDF_MERGE_FIELDS = new Set([
  'fotosDomicilioFiscal',
  'fotosAcreditacionLegalInmueble',
  'fotosLugarActividades',
]);
async function uploadMergedImagesAsPdf(params: {
  basePath: string;
  rename: string;
  files: File[];
}) {
  const formData = new FormData();
  formData.append('path', params.basePath);
  formData.append('rename', params.rename);

  for (const f of params.files) {
    formData.append('files', f); // backend expects List[UploadFile] named "files"
  }

  await GPClient.post('/expediente-digital-cliente/mergeImagesToPdf', formData);
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function fileToArray(value: File | File[] | undefined): File[] {
  return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
}

export function DatosContactoSub() {
  const { casa_id, cliente } = useCliente();
  const { getCasaUsername } = useAuth();

  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DATOS_CONTACTO_DEL_IMPORTADOR =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_CONTACTO_DEL_IMPORTADOR;
  const DATOS_CONTACTO_DEL_IMPORTADOR_DOCS =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_CONTACTO_DEL_IMPORTADOR.docs;

  const basePath = `/${casa_id} ${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DATOS_CONTACTO_DEL_IMPORTADOR?.name}`;

  const comprobantePath = `${basePath}/${DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.COMPROBANTE_DE_DOMICILIO.filename}`;
  const fotosAcreditacionPath = `${basePath}/${DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_ACREDITACION_LEGAL_INMUEBLE.filename}`;
  const fotosDomicilioFiscalPath = `${basePath}/${DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_DOMICILIO_FISCAL.filename}`;
  const fotosLugarActividadesPath = `${basePath}/${DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_LUGAR_ACTIVIDADES.filename}`;

  const formSchema = z.object({
    comprobanteDomicilio: z.object({
      file: createPdfSchema(
        DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.COMPROBANTE_DE_DOMICILIO?.size || 2_000_000
      ),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),

    fotosDomicilioFiscal: z.object({
      files: createImagesSchema(
        DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_DOMICILIO_FISCAL?.size || 2_000_000,
        10
      ),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    fotosAcreditacionLegalInmueble: z.object({
      files: createImagesSchema(
        DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_ACREDITACION_LEGAL_INMUEBLE?.size || 2_000_000,
        30
      ),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    fotosLugarActividades: z.object({
      files: createImagesSchema(
        DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_LUGAR_ACTIVIDADES?.size || 2_000_000,
        30
      ),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
  });

  const defaultValues = React.useMemo(() => {
    const docs = DATOS_CONTACTO_DEL_IMPORTADOR_DOCS!;
    return {
      comprobanteDomicilio: {
        file: undefined,
        category: docs.COMPROBANTE_DE_DOMICILIO.category,
        filename: docs.COMPROBANTE_DE_DOMICILIO.filename || 'COMPROBANTE_DE_DOMICILIO.pdf',
        filepath: comprobantePath,
      },
      fotosDomicilioFiscal: {
        files: [],
        category: docs.FOTOS_DOMICILIO_FISCAL.category,
        filename: docs.FOTOS_DOMICILIO_FISCAL.filename || 'FOTOS_DOMICILIO_FISCAL.pdf',
        filepath: fotosDomicilioFiscalPath,
      },
      fotosAcreditacionLegalInmueble: {
        files: [],
        category: docs.FOTOS_ACREDITACION_LEGAL_INMUEBLE.category,
        filename:
          docs.FOTOS_ACREDITACION_LEGAL_INMUEBLE.filename ||
          'FOTOS_ACREDITACION_LEGAL_INMUEBLE.pdf',
        filepath: fotosAcreditacionPath,
      },
      fotosLugarActividades: {
        files: [],
        category: docs.FOTOS_LUGAR_ACTIVIDADES.category,
        filename: docs.FOTOS_LUGAR_ACTIVIDADES.filename || 'FOTOS_LUGAR_ACTIVIDADES.pdf',
        filepath: fotosLugarActividadesPath,
      },
    };
  }, [
    DATOS_CONTACTO_DEL_IMPORTADOR_DOCS,
    comprobantePath,
    fotosDomicilioFiscalPath,
    fotosAcreditacionPath,
    fotosLugarActividadesPath,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      type FormDataType = z.infer<typeof formSchema>;
      type Entry = [keyof FormDataType, FormDataType[keyof FormDataType]];
      const entries = Object.entries(data) as Entry[];

      const pickFiles = (v: Entry[1]): File | File[] | undefined => {
        if (v && typeof v === 'object' && 'files' in v) return v.files as File[];
        if (v && typeof v === 'object' && 'file' in v) return v.file as File | undefined;
        return undefined;
      };

      const getMeta = (fieldName: string) => {
        const docs = DATOS_CONTACTO_DEL_IMPORTADOR_DOCS;

        const doc =
          fieldName === 'comprobanteDomicilio'
            ? docs?.COMPROBANTE_DE_DOMICILIO
            : fieldName === 'fotosDomicilioFiscal'
              ? docs?.FOTOS_DOMICILIO_FISCAL
              : fieldName === 'fotosAcreditacionLegalInmueble'
                ? docs?.FOTOS_ACREDITACION_LEGAL_INMUEBLE
                : fieldName === 'fotosLugarActividades'
                  ? docs?.FOTOS_LUGAR_ACTIVIDADES
                  : undefined;

        return {
          filename: doc?.filename ?? RENAME_MAP[fieldName] ?? fieldName,
          category: (doc as any)?.category ?? 0,
          filepath: basePath,
        };
      };

      const today = new Date().toISOString().split('T')[0];

      for (const [fieldNameKey, value] of entries) {
        const fieldName = String(fieldNameKey);
        const baseRename = RENAME_MAP[fieldName] ?? fieldName;

        const picked = pickFiles(value);
        const files = fileToArray(picked);
        if (files.length === 0) continue;

        const meta = getMeta(fieldName);

        // Merge images into ONE PDF
        if (PDF_MERGE_FIELDS.has(fieldName)) {
          await uploadMergedImagesAsPdf({
            basePath,
            rename: baseRename, // backend writes `${rename}.pdf`
            files,
          });

          const insertRecordPayload = {
            filename: meta.filename, // use struct filename (usually ends in .pdf)
            file_date: today,
            filepath: meta.filepath,
            client_id: cliente.split(' ')[0],
            file_category: meta.category,
            is_valid: 1,
            status: 0,
            comment: '',
            expiration_date: null,
            uploaded_by: getCasaUsername() || 'MYGP',
          };

          await GPClient.post('/api/expediente-digital-cliente', insertRecordPayload);
          continue;
        }

        // Single upload (Comprobante)
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;

          const formData = new FormData();
          formData.append('path', basePath);
          formData.append('file', file);

          const rename = files.length > 1 ? `${baseRename}_${i + 1}` : baseRename;
          formData.append('rename', rename);

          const insertRecordPayload = {
            filename: meta.filename,
            file_date: file?.lastModified
              ? new Date(file.lastModified).toISOString().split('T')[0]
              : today,
            filepath: meta.filepath,
            client_id: cliente.split(' ')[0],
            file_category: meta.category,
            is_valid: 1,
            status: 0,
            comment: '',
            expiration_date: null,
            uploaded_by: getCasaUsername() || 'MYGP',
          };

          await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
          await GPClient.post('/api/expediente-digital-cliente', insertRecordPayload);
        }
      }

      toast.info('Se subieron los archivos correctamente');
      await Promise.all([
        revalidateFileExists(comprobantePath),
        revalidateFileExists(fotosAcreditacionPath),
        revalidateFileExists(fotosDomicilioFiscalPath),
        revalidateFileExists(fotosLugarActividadesPath),
      ]);

      form.reset({
        comprobanteDomicilio: { ...form.getValues('comprobanteDomicilio'), file: undefined },
        fotosDomicilioFiscal: { ...form.getValues('fotosDomicilioFiscal'), files: [] },
        fotosAcreditacionLegalInmueble: {
          ...form.getValues('fotosAcreditacionLegalInmueble'),
          files: [],
        },

        fotosLugarActividades: { ...form.getValues('fotosLugarActividades'), files: [] },
      });
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.error('Error al subir los archivos');
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'datos-contacto-sub' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'datos-contacto-sub')}
    >
      <AccordionItem value="datos-contacto-sub" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white pl-2 [&>svg]:text-white">
          Datos de Contacto del Importador
        </AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent>
              <form id="form-datos-contacto" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-[auto_1fr] gap-2 mb-4">
                    <ShowFile shouldFetch={accordionOpen} path={comprobantePath} />

                    <FileController
                      form={form}
                      fieldLabel="Comprobante de Domicilio:"
                      controllerName="comprobanteDomicilio.file"
                      accept={['application/pdf', 'image/png', 'image/jpeg']}
                      buttonText="Selecciona .pdf .png .jpeg"
                    />
                    <ShowFile shouldFetch={accordionOpen} path={fotosAcreditacionPath} />

                    <Controller
                      name="fotosAcreditacionLegalInmueble.files"
                      control={form.control}
                      render={({ field, fieldState }) => {
                        const files: File[] = Array.isArray(field.value) ? field.value : [];

                        return (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid gap-0 self-start"
                          >
                            <FieldLabel htmlFor="fotos-domicilio-fiscal" className="mb-2">
                              Acreditación Legal del Inmueble (contrato de arrendamiento, título de
                              propiedad):
                            </FieldLabel>

                            <Input
                              id="fotos-domicilio-fiscal"
                              aria-invalid={fieldState.invalid}
                              type="file"
                              multiple
                              accept="image/png,image/jpeg"
                              name={field.name}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              className="h-10 py-0"
                              onChange={(e) => {
                                const picked = Array.from(e.target.files ?? []);
                                field.onChange(picked);
                                e.currentTarget.value = '';
                              }}
                            />

                            {/* Description row: always present so it doesn't shift */}
                            <div className="mt-1 min-h-[16px]">
                              <FieldDescription className="text-xs">
                                Fachada del inmueble con número exterior e interior
                              </FieldDescription>
                            </div>

                            {/* Files list: can grow; keep it visually separated */}
                            <div className="mt-2">
                              {files.length > 0 ? (
                                <ul className="space-y-2 w-full">
                                  {files.map((f, idx) => (
                                    <li
                                      key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                                      className="flex items-center gap-3 w-full"
                                    >
                                      <div className="min-w-0 w-0 flex-1">
                                        <span className="block truncate" title={f.name}>
                                          {f.name}
                                        </span>
                                        <div className="text-sm opacity-70">
                                          {formatBytes(f.size)}
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        className="shrink-0 cursor-pointer"
                                        onClick={() =>
                                          field.onChange(files.filter((_, i) => i !== idx))
                                        }
                                        aria-label="Quitar archivo"
                                      >
                                        <X />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>

                            {fieldState.invalid ? (
                              <div className="mt-1">
                                <FieldError
                                  errors={(Array.isArray(fieldState.error)
                                    ? fieldState.error
                                    : [fieldState.error]
                                  ).filter(Boolean)}
                                />
                              </div>
                            ) : null}
                          </Field>
                        );
                      }}
                    />
                    <ShowFile shouldFetch={accordionOpen} path={fotosDomicilioFiscalPath} />

                    <Controller
                      name="fotosDomicilioFiscal.files"
                      control={form.control}
                      render={({ field, fieldState }) => {
                        const files: File[] = Array.isArray(field.value) ? field.value : [];

                        return (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid gap-0 self-start"
                          >
                            <FieldLabel htmlFor="fotos-domicilio-fiscal" className="mb-2">
                              Fotos Domicilio Fiscal:
                            </FieldLabel>

                            <Input
                              id="fotos-domicilio-fiscal"
                              aria-invalid={fieldState.invalid}
                              type="file"
                              multiple
                              accept="image/png,image/jpeg"
                              name={field.name}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              className="h-10 py-0"
                              onChange={(e) => {
                                const picked = Array.from(e.target.files ?? []);
                                field.onChange(picked);
                                e.currentTarget.value = '';
                              }}
                            />

                            {/* Description row: always present so it doesn't shift */}
                            <div className="mt-1 min-h-[16px]">
                              <FieldDescription className="text-xs">
                                Fachada del inmueble con número exterior e interior
                              </FieldDescription>
                            </div>

                            {/* Files list: can grow; keep it visually separated */}
                            <div className="mt-2">
                              {files.length > 0 ? (
                                <ul className="space-y-2 w-full">
                                  {files.map((f, idx) => (
                                    <li
                                      key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                                      className="flex items-center gap-3 w-full"
                                    >
                                      <div className="min-w-0 w-0 flex-1">
                                        <span className="block truncate" title={f.name}>
                                          {f.name}
                                        </span>
                                        <div className="text-sm opacity-70">
                                          {formatBytes(f.size)}
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        className="shrink-0 cursor-pointer"
                                        onClick={() =>
                                          field.onChange(files.filter((_, i) => i !== idx))
                                        }
                                        aria-label="Quitar archivo"
                                      >
                                        <X />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>

                            {fieldState.invalid ? (
                              <div className="mt-1">
                                <FieldError
                                  errors={(Array.isArray(fieldState.error)
                                    ? fieldState.error
                                    : [fieldState.error]
                                  ).filter(Boolean)}
                                />
                              </div>
                            ) : null}
                          </Field>
                        );
                      }}
                    />
                    <ShowFile shouldFetch={accordionOpen} path={fotosLugarActividadesPath} />

                    <Controller
                      name="fotosLugarActividades.files"
                      control={form.control}
                      render={({ field, fieldState }) => {
                        const files: File[] = Array.isArray(field.value) ? field.value : [];

                        return (
                          <Field data-invalid={fieldState.invalid} className="grid gap-0">
                            <FieldLabel htmlFor="fotos-lugar-actividades" className="mb-2">
                              Fotos del lugar de donde realizan sus actividades:
                            </FieldLabel>

                            <div className="w-full">
                              <Input
                                id="fotos-lugar-actividades"
                                aria-invalid={fieldState.invalid}
                                type="file"
                                multiple
                                accept="image/png,image/jpeg"
                                name={field.name}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                className="h-10 py-0 mb-2 "
                                onChange={(e) => {
                                  const picked = Array.from(e.target.files ?? []);
                                  field.onChange(picked);
                                  e.currentTarget.value = '';
                                }}
                              />
                              <FieldDescription className="text-xs">
                                Donde se observe: fachada del domicilio, maquinaria, equipo de
                                oficina, el personal, medios de transporte y demás medios empleados
                                para la realización de sus actividades.
                              </FieldDescription>

                              {/* Reserve space to reduce layout jump (optional) */}
                              <div className="min-h-[28px]">
                                {files.length > 0 ? (
                                  <ul className="mt-2 space-y-2 w-full">
                                    {files.map((f, idx) => (
                                      <li
                                        key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                                        className="flex items-center gap-3 w-full"
                                      >
                                        <div className="min-w-0 w-0 flex-1">
                                          <span className="block truncate" title={f.name}>
                                            {f.name}
                                          </span>
                                          <div className="text-sm opacity-70">
                                            {formatBytes(f.size)}
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          className="shrink-0"
                                          onClick={() =>
                                            field.onChange(files.filter((_, i) => i !== idx))
                                          }
                                          aria-label="Quitar archivo"
                                        >
                                          <X />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>

                              {fieldState.invalid && (
                                <FieldError
                                  errors={(Array.isArray(fieldState.error)
                                    ? fieldState.error
                                    : [fieldState.error]
                                  ).filter(Boolean)}
                                  className="mt-2"
                                />
                              )}
                            </div>
                          </Field>
                        );
                      }}
                    />
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost
                  onClick={() =>
                    form.reset({
                      comprobanteDomicilio: {
                        ...form.getValues('comprobanteDomicilio'),
                        file: undefined,
                      },
                      fotosDomicilioFiscal: {
                        ...form.getValues('fotosDomicilioFiscal'),
                        files: [],
                      },
                      fotosAcreditacionLegalInmueble: {
                        ...form.getValues('fotosAcreditacionLegalInmueble'),
                        files: [],
                      },

                      fotosLugarActividades: {
                        ...form.getValues('fotosLugarActividades'),
                        files: [],
                      },
                    })
                  }
                >
                  Reiniciar
                </MyGPButtonGhost>
                <MyGPButtonSubmit form="form-datos-contacto" isSubmitting={isSubmitting}>
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
