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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

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
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { revalidateFileExists, ShowFile, ShowFileSlot } from '../buttons/ShowFile';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';

const _documentosRepresentanteLegal =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_REPRESENTANTE_LEGAL;

if (!_documentosRepresentanteLegal?.docs) {
  throw new Error('Missing DOCUMENTOS_REPRESENTANTE_LEGAL docs');
}

const RENAME_MAP: Record<string, string> = {
  ine: _documentosRepresentanteLegal.docs.INE.filename,
};

export function RepresentanteSub() {
  const { cliente } = useCliente();
  const { getCasaUsername } = useAuth();

  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DOCUMENTOS_REPRESENTANTE_LEGAL =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_REPRESENTANTE_LEGAL;
  const DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_REPRESENTANTE_LEGAL.docs;

  const basePath = `/${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DOCUMENTOS_REPRESENTANTE_LEGAL?.name}`;
  const inePath = `${basePath}/${DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS?.INE.filename}`;

  const formSchema = z.object({
    nombre: z
      .string({ message: 'Ingresa el nombre' })
      .min(1, 'Ingresa el nombre')
      .max(100, 'Máximo 100 caracteres'),
    apellido1: z
      .string({ message: 'Ingresa el primer apellido' })
      .min(1, 'Ingresa el primer apellido')
      .max(100, 'Máximo 100 caracteres'),
    apellido2: z.string('Ingresa el segundo apellido').max(100, 'Máximo 100 caracteres').optional(),
    rfc: z
      .string({ message: 'Ingresa un RFC' })
      .max(13, { error: 'El RFC es de máximo 13 caracteres' })
      .min(1, 'Ingresa un RFC'),
    curp: z
      .string({ message: 'Ingresa el curp' })
      .min(1, 'Ingresa el CURP')
      .max(18, 'Máximo 18 caracteres'),
    address_1: z
      .string({ message: 'Ingresa una dirección' })
      .min(1, 'Ingresa la dirección')
      .max(100, { message: 'Máximo 100 caracteres' }),
    neighbourhood: z
      .string({ message: 'Ingresa una colonia' })
      .min(1, 'Ingresa la colonia')
      .max(100, { message: 'Máximo 100 caracteres' }),
    municipality: z
      .string({ message: 'Ingresa un municipio' })
      .min(1, 'Ingresa la municipio')
      .max(100, { message: 'Máximo 100 caracteres' }),
    city: z
      .string({ message: 'Ingresa una ciudad' })
      .min(1, 'Ingresa la ciudad')
      .max(100, { message: 'Máximo 100 caracteres' }),
    state: z
      .string({ message: 'Ingresa una ciudad' })
      .min(1, 'Ingresa la ciudad')
      .max(100, { message: 'Máximo 100 caracteres' }),
    postal_code: z
      .string({ message: 'Ingresa una ciudad' })
      .min(1, 'Ingresa la ciudad')
      .max(100, { message: 'Máximo 100 caracteres' }),
    correoElectronico: z
      .email({
        pattern: z.regexes.email,
        error: 'El correo eléctronico es inválido',
      })
      .max(100, 'Máximo 100 caracteres'),
    numeroOficina: z.string().min(1, { error: 'Ingresa un número de oficina' }),
    telefonoRepresentanteLegal: z
      .string({
        message: 'Ingresa un número de teléfono',
      })
      .length(10, { message: 'El teléfono debe de ser igual a 10 caracteres' }),

    ine: z.object({
      file: createPdfSchema(DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS?.INE?.size || 2_000_000),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    ineExp: expiryDateSchema,
  });

  const resetForm = () => {
    form.reset({
      nombre: '',
      apellido1: '',
      apellido2: '',
      rfc: '',
      curp: '',
      address_1: '',
      neighbourhood: '',
      municipality: '',
      city: '',
      state: '',
      postal_code: '',
      correoElectronico: '',
      numeroOficina: '',
      telefonoRepresentanteLegal: '',
      ineExp: '',
      ine: { ...form.getValues('ine'), file: undefined },
    });
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const entries = Object.entries(data) as Array<
        [
          keyof typeof data,
          { file?: File; category?: number; filepath?: string; filename?: string },
        ]
      >;

      for (const [fieldName, value] of entries) {
        const file = value?.file;
        if (!file) continue;

        const rename = RENAME_MAP[fieldName as string] ?? String(fieldName);

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', file);
        formData.append('rename', rename);

        const insertRecordPayload = {
          filename: value.filename,
          file_date: value.file
            ? new Date(value.file.lastModified).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          filepath: value.filepath,
          client_id: cliente.split(' ')[0],
          file_category: value.category,
          is_valid: 1,
          status: 0,
          comment: '',
          expiration_date: data.ineExp,
          uploaded_by: getCasaUsername() || 'MYGP',
        };

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        await GPClient.post('/api/expediente-digital-cliente', insertRecordPayload);
      }

      toast.info('Se subieron los archivos correctamente');
      resetForm();

      await Promise.all([revalidateFileExists(inePath)]);
    } catch (error) {
      console.error(error);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues = React.useMemo(() => {
    const docs = DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS!;

    return {
      nombre: '',
      apellido1: '',
      apellido2: '',
      rfc: '',
      curp: '',
      direccion: '',
      correoElectronico: '',
      numeroOficina: '',
      telefonoRepresentanteLegal: '',
      ineExp: '',
      ine: {
        file: undefined,
        category: docs.INE.category,
        filename: docs.INE.filename || 'INE.pdf',
        filepath: inePath,
      },
    };
  }, [DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS, inePath]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'datos-representante-legal' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'datos-representante-legal')}
    >
      <AccordionItem value="datos-representante-legal" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white pl-2 [&>svg]:text-white">
          Datos del Representante Legal
        </AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent>
              <form id="form-datos-representante" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                      <ShowFileSlot />
                      <Controller
                        name="nombre"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="nombre">Nombre:</FieldLabel>
                            <Input
                              {...field}
                              id="nombre"
                              placeholder="Ingresa un nombre..."
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>

                    <Controller
                      name="apellido1"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
                          <FieldLabel htmlFor="apellido1">Primer Apellido:</FieldLabel>
                          <Input
                            {...field}
                            id="apellido1"
                            placeholder="Ingresa un apellido..."
                            className="mb-2"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                      <ShowFileSlot />
                      <Controller
                        name="apellido2"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="apellido2">Segundo Apellido:</FieldLabel>
                            <Input
                              {...field}
                              id="apellido2"
                              placeholder="Ingresa un apellido..."
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>

                    <Controller
                      name="rfc"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
                          <FieldLabel htmlFor="rfc">RFC:</FieldLabel>
                          <Input
                            {...field}
                            id="rfc"
                            placeholder="Ingresa el RFC..."
                            className="mb-2"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start col-span-2">
                      <ShowFileSlot />
                      <Controller
                        name="curp"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="curp">CURP:</FieldLabel>
                            <Input
                              {...field}
                              id="curp"
                              placeholder="Ingresa el CURP..."
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>
                    <div className="col-span-2 my-6">
                      <Separator />
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start col-span-2">
                      <ShowFileSlot />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full min-w-0">
                        <Controller
                          name="address_1"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="grid grid-rows-2 gap-0"
                            >
                              <FieldLabel htmlFor="address_1">Dirección principal:</FieldLabel>
                              <Input
                                {...field}
                                id="address_1"
                                placeholder="Calle y número (ej. Av. Reforma 123)"
                                className="mb-2"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        <Controller
                          name="neighbourhood"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="grid grid-rows-2 gap-0"
                            >
                              <FieldLabel htmlFor="neighbourhood">Colonia:</FieldLabel>
                              <Input
                                {...field}
                                id="neighbourhood"
                                placeholder="Ej. Juárez"
                                className="mb-2"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        <Controller
                          name="postal_code"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="grid grid-rows-2 gap-0"
                            >
                              <FieldLabel htmlFor="postal_code">Código postal:</FieldLabel>
                              <Input
                                {...field}
                                id="postal_code"
                                placeholder="Ej. 06600"
                                className="mb-2"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        <Controller
                          name="city"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="grid grid-rows-2 gap-0"
                            >
                              <FieldLabel htmlFor="city">Ciudad:</FieldLabel>
                              <Input
                                {...field}
                                id="city"
                                placeholder="Ej. Ciudad de México"
                                className="mb-2"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        <Controller
                          name="municipality"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="grid grid-rows-2 gap-0"
                            >
                              <FieldLabel htmlFor="municipality">Municipio/Alcaldía:</FieldLabel>
                              <Input
                                {...field}
                                id="municipality"
                                placeholder="Ej. Cuauhtémoc"
                                className="mb-2"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        <Controller
                          name="state"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="grid grid-rows-2 gap-0"
                            >
                              <FieldLabel htmlFor="state">Estado:</FieldLabel>
                              <Input
                                {...field}
                                id="state"
                                placeholder="Ej. CDMX"
                                className="mb-2"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 my-6">
                      <Separator />
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                      <ShowFileSlot />
                      <Controller
                        name="correoElectronico"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="email">Correo Electrónico:</FieldLabel>
                            <Input
                              {...field}
                              id="email"
                              className="mb-2"
                              placeholder="ejemplo@gmail.com"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>

                    <Controller
                      name="numeroOficina"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
                          <FieldLabel htmlFor="numero-oficina">Número de Oficina:</FieldLabel>
                          <Input
                            {...field}
                            id="numero-oficina"
                            className="mb-2"
                            placeholder="1234"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />

                    <div className="col-span-2 grid grid-cols-[auto_1fr] gap-2 items-start">
                      <ShowFileSlot />
                      <Controller
                        name="telefonoRepresentanteLegal"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="telefono-representante-legal">
                              Teléfono del Representante Legal:
                            </FieldLabel>
                            <Input
                              {...field}
                              id="movil-representante-legal"
                              placeholder="5512345678"
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-[auto_1fr_1fr] col-span-2 gap-2 place-items-center">
                      <ShowFile shouldFetch={accordionOpen} path={inePath} />
                      <FileController
                        form={form}
                        fieldLabel="INE:"
                        controllerName="ine.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                        buttonText="Selecciona .pdf .png .jpeg"
                      />

                      <ExpiraEnController form={form} controllerName="ineExp" />
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => resetForm()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-datos-representante" isSubmitting={isSubmitting}>
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
