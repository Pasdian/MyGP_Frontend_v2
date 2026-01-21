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
  const { cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DATOS_CONTACTO_DEL_IMPORTADOR =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_CONTACTO_DEL_IMPORTADOR;
  const DATOS_CONTACTO_DEL_IMPORTADOR_DOCS =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DATOS_CONTACTO_DEL_IMPORTADOR.docs;

  const basePath = `/${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DATOS_CONTACTO_DEL_IMPORTADOR?.name}`;

  const comprobantePath = `${basePath}/${DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.COMPROBANTE_DE_DOMICILIO.filename}`;
  const fotosAcreditacionPath = `${basePath}/${DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_ACREDITACION_LEGAL_INMUEBLE.filename}`;
  const fotosDomicilioFiscalPath = `${basePath}/${DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_DOMICILIO_FISCAL.filename}`;
  const fotosLugarActividadesPath = `${basePath}/${DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_LUGAR_ACTIVIDADES.filename}`;

  const formSchema = z.object({
    comprobanteDomicilio: createPdfSchema(
      DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.COMPROBANTE_DE_DOMICILIO?.size || 2_000_000
    ),
    fotosDomicilioFiscal: createImagesSchema(
      DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_DOMICILIO_FISCAL?.size || 2_000_000,
      10
    ),
    fotosAcreditacionLegalInmueble: createImagesSchema(
      DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_ACREDITACION_LEGAL_INMUEBLE?.size || 2_000_000,
      30
    ),
    fotosLugarActividades: createImagesSchema(
      DATOS_CONTACTO_DEL_IMPORTADOR_DOCS?.FOTOS_LUGAR_ACTIVIDADES?.size || 2_000_000,
      30
    ),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const entries = Object.entries(data) as Array<[string, File | File[] | undefined]>;

      for (const [fieldName, value] of entries) {
        if (!value) continue;

        const baseRename = RENAME_MAP[fieldName] ?? fieldName;

        // Send images to backend to merge into ONE PDF
        if (PDF_MERGE_FIELDS.has(fieldName)) {
          const files = fileToArray(value);
          if (files.length === 0) continue;

          await uploadMergedImagesAsPdf({
            basePath,
            rename: baseRename, // backend writes `${rename}.pdf`
            files,
          });

          continue;
        }

        // Default behavior (single pdf upload)
        const files = fileToArray(value);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;

          const formData = new FormData();
          formData.append('path', basePath);
          formData.append('file', file);

          const rename = files.length > 1 ? `${baseRename}_${i + 1}` : baseRename;
          formData.append('rename', rename);

          await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        }
      }

      toast.info('Se subieron los archivos correctamente');
      await Promise.all([
        revalidateFileExists(comprobantePath),
        revalidateFileExists(fotosAcreditacionPath),
        revalidateFileExists(fotosDomicilioFiscalPath),
        revalidateFileExists(fotosLugarActividadesPath),
      ]);

      form.reset(data);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);

      console.error(error);
      toast.error('Error al subir los archivos');
    }
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comprobanteDomicilio: undefined,

      fotosDomicilioFiscal: [],
      fotosAcreditacionLegalInmueble: [],
      fotosLugarActividades: [],
    },
  });

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
                      controllerName="comprobanteDomicilio"
                      accept={['application/pdf', 'image/png', 'image/jpeg']}
                      buttonText="Selecciona .pdf .png .jpeg"
                    />
                    <ShowFile shouldFetch={accordionOpen} path={fotosAcreditacionPath} />

                    <Controller
                      name="fotosAcreditacionLegalInmueble"
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
                      name="fotosDomicilioFiscal"
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
                      name="fotosLugarActividades"
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
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
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
