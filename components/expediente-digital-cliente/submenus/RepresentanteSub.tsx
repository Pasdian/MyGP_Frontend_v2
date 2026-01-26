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
import { buildRepresentanteSchema } from '../schemas/representanteSchema';
import { Loader2 } from 'lucide-react';

const _documentosRepresentanteLegal =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_REPRESENTANTE_LEGAL;

if (!_documentosRepresentanteLegal?.docs) {
  throw new Error('Missing DOCUMENTOS_REPRESENTANTE_LEGAL docs');
}

const RENAME_MAP: Record<string, string> = {
  ine: _documentosRepresentanteLegal.docs.INE.filename,
};

export function RepresentanteSub() {
  const { casa_id, cliente } = useCliente();
  const { getCasaUsername } = useAuth();
  const [isHydrating, setIsHydrating] = React.useState(false);

  const didHydrateRef = React.useRef(false);

  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const DOCUMENTOS_REPRESENTANTE_LEGAL =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_REPRESENTANTE_LEGAL;
  const DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.DOCUMENTOS_REPRESENTANTE_LEGAL.docs;

  const basePath = `/${casa_id} ${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${DOCUMENTOS_REPRESENTANTE_LEGAL?.name}`;
  const inePath = `${basePath}/${DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS?.INE.filename}`;

  const formSchema = buildRepresentanteSchema(
    DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS?.INE?.size || 2_000_000
  );

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

        const filePayload = {
          filename: value.filename,
          file_date: value.file
            ? new Date(value.file.lastModified).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          filepath: value.filepath,
          client_id: casa_id,
          file_category: value.category,
          is_valid: true,
          status: 0,
          comment: '',
          expiration_date: data.ineExp,
          uploaded_by: getCasaUsername() || 'MYGP',
        };

        const legalRepPayload = {
          name: data.nombre,
          last_name: data.apellido1,
          casa_id: casa_id,
          last_name_2: data.apellido2 || '',
          curp: data.curp,
          rfc: data.rfc,
          is_valid: true,
          phone: data.telefonoRepresentanteLegal,
          email: data.correoElectronico,
          created_by: getCasaUsername() || 'MYGP',
          address: {
            address_1: data.address_1,
            neighbourhod: data.neighbourhood,
            municipality: data.municipality,
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
          },
        };

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
        await GPClient.post(
          '/api/expediente-digital-cliente/legal-representative',
          legalRepPayload
        );

        await GPClient.post('/api/expediente-digital-cliente', filePayload);
      }

      toast.info('Se subieron los archivos correctamente');
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

  React.useEffect(() => {
    const hydrate = async () => {
      if (!accordionOpen) return;
      if (didHydrateRef.current) return;

      try {
        setIsHydrating(true);

        const { data: rep } = await GPClient.get(
          '/api/expediente-digital-cliente/legal-representative',
          { params: { casa_id } }
        );

        const addr = rep?.addressByIdAddress;

        let lastIneFile = null;
        try {
          lastIneFile = await fetchLastFileByClientAndFilename(
            casa_id,
            DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS!.INE.filename
          );
        } catch (err: any) {
          if (err?.response?.status !== 404) throw err;
        }

        // Hydrate form
        form.reset({
          nombre: rep?.name ?? '',
          apellido1: rep?.last_name ?? '',
          apellido2: rep?.last_name_2 ?? '',
          rfc: rep?.rfc ?? '',
          curp: rep?.curp ?? '',
          correoElectronico: rep?.email ?? '',
          telefonoRepresentanteLegal: rep?.phone ?? '',
          numeroOficina: rep?.phone ?? '',

          address_1: addr?.address_1 ?? '',
          neighbourhood: addr?.neighbourhod ?? '',
          municipality: addr?.municipality ?? '',
          city: addr?.city ?? '',
          state: addr?.state ?? '',
          postal_code: addr?.postal_code ?? '',

          ineExp: lastIneFile?.expiration_date ?? '',
          ine: {
            ...form.getValues('ine'),
            filepath: lastIneFile?.filepath ?? inePath,
            filename: lastIneFile?.filename ?? DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS!.INE.filename,
            file: undefined,
          },
        });

        didHydrateRef.current = true;
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          console.error(error);
          toast.error('Error al hidratar datos del representante');
        }
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate();
  }, [accordionOpen, casa_id, form, inePath, DOCUMENTOS_REPRESENTANTE_LEGAL_DOCS]);

  const fetchLastFileByClientAndFilename = async (clientId: string, filename: string) => {
    const { data } = await GPClient.get('/api/expediente-digital-cliente/files/last', {
      params: {
        client_id: clientId,
        filename,
      },
    });

    return data;
  };

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
          <div className="flex items-center gap-2">
            <span>Datos del Representante Legal</span>

            {isHydrating && (
              <Loader2 className="h-4 w-4 animate-spin text-white" aria-label="Cargando datos" />
            )}
          </div>
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
