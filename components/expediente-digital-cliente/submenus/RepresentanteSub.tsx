'use client';

import * as z from 'zod/v4';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { useAuth } from '@/hooks/useAuth';

import { EXP_DIGI_DEFAULT_VALUES, EXP_DIGI_SCHEMAS } from '../schemas/schemasMain';
import { submitFolderAndUpdateProgress } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
import { InputController } from '../InputController';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { ShowFileSlot } from '../buttons/ShowFile';
import ExpDigiCard from './ExpDigiCard';

export function RepresentanteSub() {
  const didHydrateRef = React.useRef(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [_, setIsHydrating] = React.useState(false);

  const { casa_id, setProgressMap, setFolderProgressFromDocKeys, folderMappings } = useCliente();
  const { getCasaUsername } = useAuth();

  const FOLDER_KEY = 'imp.rep' as const;
  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];
  type FormType = z.infer<typeof formSchema>;

  const defaultValues = React.useMemo<FormType>(() => {
    return EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY] as FormType;
  }, []);

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  React.useEffect(() => {
    const hydrate = async () => {
      if (didHydrateRef.current) return;

      try {
        setIsHydrating(true);

        const { data: rep } = await GPClient.get(
          '/api/expediente-digital-cliente/legal-representative',
          { params: { casa_id } }
        );

        const addr = rep?.addressByIdAddress;

        form.reset({
          ...form.getValues(),
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

          // si tu schema maneja expiración del INE:
          ineExp: rep?.ine_expiration_date ?? form.getValues('ineExp'),
          ine: { ...form.getValues('ine'), file: undefined },
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
  }, [casa_id, form]);

  const onSubmit = async (data: FormType) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('client_id', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      if (data.ine?.file) {
        formData.append('rep.ine', data.ine.file);
      }

      await GPClient.post('/expediente-digital-cliente/legalRepresentative', {
        casa_id,
        name: data.nombre,
        last_name: data.apellido1,
        last_name_2: data.apellido2 || '',
        rfc: data.rfc,
        curp: data.curp,
        email: data.correoElectronico,
        phone: data.telefonoRepresentanteLegal,
        created_by: getCasaUsername() || 'MYGP',
        address: {
          address_1: data.address_1,
          neighbourhod: data.neighbourhood,
          municipality: data.municipality,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
        },
      });

      const { failed } = await submitFolderAndUpdateProgress({
        folderKey: FOLDER_KEY,
        formData,
        docKeys: DOC_KEYS,
        setProgressMap,
        recomputeFolderProgress: setFolderProgressFromDocKeys,
      });

      if (failed.length > 0) {
        toast.error(`Fallaron: ${failed.join(', ')}`);
        return;
      }

      toast.success('Archivos guardados correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ExpDigiCard
      title="Datos del Representante Legal"
      folderKey={FOLDER_KEY}
      formId="form-datos-representante"
      isFormSubmitting={isSubmitting}
    >
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
                    <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
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
                    <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
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
                    <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
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
                    <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
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
                    <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
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
                    <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
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
                    <FieldLabel htmlFor="correoElectronico">Correo Electrónico:</FieldLabel>
                    <Input
                      {...field}
                      id="correoElectronico"
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
                  <FieldLabel htmlFor="numeroOficina">Número de Oficina:</FieldLabel>
                  <Input
                    {...field}
                    id="numeroOficina"
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
                    <FieldLabel htmlFor="telefonoRepresentanteLegal">
                      Teléfono del Representante Legal:
                    </FieldLabel>
                    <Input
                      {...field}
                      id="telefonoRepresentanteLegal"
                      placeholder="5512345678"
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
              <div className="space-y-4 w-full">
                <InputController
                  form={form}
                  controllerName="ine.file"
                  docKey={DOC_KEYS[0]}
                  fieldLabel="INE:"
                  buttonText="Selecciona .pdf .png .jpeg"
                  accept={['application/pdf', 'image/png', 'image/jpeg']}
                />

                <Controller
                  name="ineExp"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="grid grid-rows-2 gap-0">
                      <FieldLabel htmlFor="ineExp">Expira en:</FieldLabel>
                      <Input
                        {...field}
                        id="ineExp"
                        placeholder="YYYY-MM-DD"
                        className="mb-2"
                        aria-invalid={fieldState.invalid}
                        type="date"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </div>
          </div>
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
