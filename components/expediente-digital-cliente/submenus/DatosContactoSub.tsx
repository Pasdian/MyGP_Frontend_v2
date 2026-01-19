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
import { PATHS } from '@/lib/expediente-digital-cliente/paths';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';

const RENAME_MAP: Record<string, string> = {
  comprobanteDomicilio: 'COMPROBANTE_DE_DOMICILIO',
  fotosDomicilioFiscal: 'FOTOS_DOMICILIO_FISCAL',
  acreditacionLegalInmueble: 'ACREDITACION_LEGAL_INMUEBLE',
  fotosLugarActividades: 'FOTOS_LUGAR_ACTIVIDADES',
};

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function DatosContactoSub() {
  const { cliente } = useCliente();

  const formSchema = z.object({
    comprobanteDomicilio: createPdfSchema(2_000_000),
    fotosDomicilioFiscal: createImagesSchema(2_000_000, 10),
    acreditacionLegalInmueble: createImagesSchema(2_000_000, 30),
    fotosLugarActividades: createImagesSchema(2_000_000, 30),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const path = `/${cliente}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.base}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.subfolders.DATOS_CONTACTO_DEL_IMPORTADOR}`;

      const entries = Object.entries(data) as Array<[string, File | File[] | undefined]>;

      for (const [fieldName, value] of entries) {
        if (!value) continue;

        const baseRename = RENAME_MAP[fieldName] ?? fieldName;

        const files = Array.isArray(value) ? value : [value];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;

          const formData = new FormData();
          formData.append('path', path);
          formData.append('file', file);

          // backend preserves extension if rename has no ".pdf/.png/.jpg"
          // add index to avoid overwriting
          const rename = files.length > 1 ? `${baseRename}_${i + 1}` : baseRename;
          formData.append('rename', rename);

          await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        }
      }

      toast.message('Se subieron los archivos correctamente');
      form.reset(data);
    } catch (error) {
      console.error(error);
      toast.message('Error al subir los archivos');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comprobanteDomicilio: undefined,

      fotosDomicilioFiscal: [],
      acreditacionLegalInmueble: [],
      fotosLugarActividades: [],
    },
  });

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white pl-2 [&>svg]:text-white">
          Datos de Contacto del Importador
        </AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent>
              <form id="form-datos-contacto" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <FileController
                      form={form}
                      fieldLabel="Comprobante de Domicilio:"
                      controllerName="comprobanteDomicilio"
                      accept=".pdf"
                      buttonText="Seleccionar .pdf"
                    />

                    <Controller
                      name="acreditacionLegalInmueble"
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
                <MyGPButtonSubmit form="form-datos-contacto">Guardar Cambios</MyGPButtonSubmit>
              </Field>
            </CardFooter>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
