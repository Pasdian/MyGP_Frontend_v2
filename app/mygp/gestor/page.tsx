'use client';

import React from 'react';
import useSWR from 'swr';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { GestorSearchRef } from '@/components/gestor/GestorSearchRef';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';

import type { GestorRefInfo } from '@/types/gestor/GestorRefInfo';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const PDF_MAX_SIZE = 15_000_000;

const formSchema = z
  .object({
    reference: z.string().min(1, 'Falta referencia'),

    client: z.string().min(1, 'Ingresa un cliente'),
    fileCategory: z.string().min(1, 'Selecciona una categoría'),

    pdf_file: z
      .union([z.instanceof(File, { message: 'Archivo inválido' }), z.undefined()])
      .refine((file) => !file || file.size <= PDF_MAX_SIZE, `Máximo ${PDF_MAX_SIZE / 1_000_000} MB`)
      .refine(
        (file) => !file || ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type),
        'Solo se aceptan archivos .pdf .png .jpeg'
      ),

    xml_file: z
      .union([z.instanceof(File, { message: 'Archivo inválido' }), z.undefined()])
      .refine((file) => !file || file.size <= PDF_MAX_SIZE, `Máximo ${PDF_MAX_SIZE / 1_000_000} MB`)
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
        message: 'El XML es obligatorio para esta categoría',
      });
    }
  });

export default function Gestor() {
  const [searchRefData, setSearchRefData] = React.useState<GestorRefInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { getCasaUsername } = useAuth();

  const { data: fileCategories } = useSWR('/gestor/fileCategories', axiosFetcher);

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
  });
  const fileCategory = form.watch('fileCategory');

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
    if (!fileCategory) return;

    form.setValue('pdf_file', undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });

    form.setValue('xml_file', undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });

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

      const base = new FormData();
      base.append('fileCategory', data.fileCategory);
      base.append('client', data.client);
      base.append('reference', data.reference);
      base.append('uploaded_by', uploadedBy);

      // PDF
      const fdPdf = new FormData();
      for (const [k, v] of base.entries()) fdPdf.append(k, v as any);
      fdPdf.append('upload_file', data.pdf_file);

      const pdfRes = await GPClient.post('/gestor/uploads', fdPdf, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // XML (optional)
      let xmlRes: any = null;
      if (data.xml_file) {
        const fdXml = new FormData();
        for (const [k, v] of base.entries()) fdXml.append(k, v as any);
        fdXml.append('upload_file', data.xml_file);

        xmlRes = await GPClient.post('/gestor/uploads', fdXml, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success('Listo');
      console.log('PDF RESPONSE:', pdfRes.data);
      if (xmlRes) console.log('XML RESPONSE:', xmlRes.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ??
          error?.response?.data?.message ??
          'Error al subir el archivo al gestor'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <GestorSearchRef searchRefData={searchRefData} setSearchData={setSearchRefData} />

      {searchRefData.length > 0 && (
        <Card>
          <CardContent>
            <p className="font-semibold text-2xl mb-4">Subir archivo(s) al Gestor</p>

            <form id="form-gestor" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
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
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex items-end">
            <Field orientation="horizontal" className="justify-end">
              <MyGPButtonSubmit form="form-gestor" isSubmitting={isSubmitting}>
                Guardar Cambios
              </MyGPButtonSubmit>
            </Field>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
