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
    direccion: z
      .string({ message: 'Ingresa una dirección' })
      .min(1, 'Ingresa la dirección')
      .max(300, { message: 'Máximo 300 caracteres' }),
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

    ine: createPdfSchema(DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS?.INE?.size || 2_000_000),
    ineExp: expiryDateSchema,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const file = data.ine;
      if (file) {
        const rename = RENAME_MAP.ine ?? 'ine';

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', file);
        formData.append('rename', rename);

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
      }

      toast.info('Se subió el INE correctamente');
      if (data.ine) {
        await revalidateFileExists(inePath);
      }
      form.reset(data);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.error('Error al subir el INE');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      apellido1: '',
      apellido2: '',
      rfc: '',
      curp: '',
      direccion: '',
      correoElectronico: '',
      numeroOficina: '',
      telefonoRepresentanteLegal: '',

      ine: undefined,
      ineExp: '',
    },
  });

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'datos-representante-legal' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'datos-representante-legal')}
    >
      {' '}
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

                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
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
                    <Controller
                      name="direccion"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
                          <FieldLabel htmlFor="direccion">Dirección:</FieldLabel>
                          <Input
                            {...field}
                            id="direccion"
                            placeholder="Ingresa la dirección..."
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
                        controllerName="ine"
                        accept=".pdf"
                        buttonText="Seleccionar .pdf"
                      />

                      <ExpiraEnController form={form} controllerName="ineExp" />
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
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
