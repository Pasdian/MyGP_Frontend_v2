
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
import { isValidRfc, isValidUuid, parseCfdiXml } from './rfcValidator';
import { useGestor } from '@/contexts/Gestor/GestorContext';
import { GestorCuenta } from '@/types/gestor/GestorCuenta';
import { Row } from '@tanstack/react-table';
import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';


const PDF_MAX_SIZE = 25_000_000;


export default function GestorUploadFiles({ row }: { row: Row<GestorCuenta> }) {
  const { searchRefData, fileCategories } = useGestor()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { getCasaUsername } = useAuth();

  const formSchema = z
    .object({
      reference: z.string().min(1, 'Falta referencia'),

      client: z.string().min(1, 'Ingresa un cliente'),
      client_rfc: z.string().min(1, 'Ingresa un RFC'),
      fileCategory: z.string().min(1, 'Selecciona una categoría'),
      uuid_factura: z.string().min(1, 'Selecciona un UUID de factura'),

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
      client_rfc: '',
      reference: '',
      fileCategory: '',
      pdf_file: undefined,
      xml_file: undefined,
    },
    mode: 'onChange'
  });
  const xmlFile = form.watch('xml_file');

  const fileCategory = form.watch('fileCategory');

  React.useEffect(() => {
    form.register('client');
    form.register('client_rfc')
    form.register('uuid_factura')
    form.register('reference');
  }, [form]);

  React.useEffect(() => {
    if (searchRefData.length === 0) return;

    const first = searchRefData[0];

    form.setValue('client', first.CVE_IMPO, { shouldValidate: true });
    form.setValue('client_rfc', first.RFC_IMP, { shouldValidate: true });
    form.setValue('uuid_factura', row.original['UUID Factura'] || '', { shouldValidate: true })
    form.setValue('reference', first.NUM_REFE, { shouldValidate: true });
  }, [searchRefData, form]);

  React.useEffect(() => {
    form.setValue('pdf_file', undefined, { shouldValidate: true, shouldDirty: true });
    form.setValue('xml_file', undefined, { shouldValidate: true, shouldDirty: true });
    form.clearErrors(['pdf_file', 'xml_file']);
  }, [fileCategory, form]);

  React.useEffect(() => {
    if (!xmlFile) return;

    let cancelled = false;

    (async () => {
      try {
        form.clearErrors('xml_file');

        const xmlText = await xmlFile.text();
        if (cancelled) return;

        const parsed = parseCfdiXml(xmlText);

        if (!parsed.receptorRfc) {
          form.setError('xml_file', { type: 'custom', message: 'El XML no tiene Receptor@Rfc' });
          return;
        }

        if (!isValidRfc(parsed.receptorRfc)) {
          form.setError('xml_file', { type: 'custom', message: `RFC inválido en Receptor: ${parsed.receptorRfc}` });
          return;
        }

        if (!parsed.uuid) {
          form.setError('xml_file', { type: 'custom', message: 'El XML no tiene TimbreFiscalDigital@UUID' });
          return;
        }

        if (!isValidUuid(parsed.uuid)) {
          form.setError('xml_file', { type: 'custom', message: `UUID inválido: ${parsed.uuid}` });
          return;
        }

        const rowUuid = String(row.original['UUID Factura'] ?? '').trim().toUpperCase();
        const xmlUuid = parsed.uuid.trim().toUpperCase();
        if (rowUuid && xmlUuid !== rowUuid) {
          form.setError('xml_file', {
            type: 'custom',
            message: `El UUID del XML (${parsed.uuid}) no coincide con UUID Factura (${row.original['UUID Factura']})`,
          });
          return;
        }

        const clientRfc = (form.getValues('client_rfc') ?? '').trim().toUpperCase();
        if (clientRfc && parsed.receptorRfc.trim().toUpperCase() !== clientRfc) {
          form.setError('xml_file', {
            type: 'custom',
            message: `El RFC del Receptor (${parsed.receptorRfc}) no coincide con el cliente (${clientRfc})`,
          });
          return;
        }

        form.clearErrors('xml_file');
      } catch (e: any) {
        form.setError('xml_file', { type: 'custom', message: e?.message ?? 'No se pudo leer el XML' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [xmlFile]);


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
      base.append('client_rfc', data.client_rfc)
      base.append('xml_uuid', data.uuid_factura)

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

    <form id='form-gestor-upload-files' onSubmit={form.handleSubmit(onSubmit)}>
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
            <Label className="text-sm font-medium">RFC</Label>
            <Input
              className="w-full rounded-md border px-3 py-2 text-sm bg-muted"
              value={form.watch('client_rfc') ?? ''}
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
          <Field>
            <Label className="text-sm font-medium">UUID Factura</Label>
            <Input
              className="w-full rounded-md border px-3 py-2 text-sm bg-muted"
              value={form.watch('uuid_factura') ?? ''}
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
        <div>

          <MyGPButtonSubmit isSubmitting={isSubmitting} >
            Guardar Cambios
          </MyGPButtonSubmit>
        </div>
      </FieldGroup>
    </form>

  )
}
