import React from 'react';
import useSWR from 'swr';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { toast } from 'sonner';
import { FileIcon, Loader2 } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';

type Company = { CVE_IMP: string; NOM_IMP: string; EXISTS_ON_CASA: boolean };

export function ClientMain({
  setShowDocuments,
}: {
  setShowDocuments: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { cliente, casa_id, setCasaId, setCliente } = useCliente();

  const [collapseAccordion, setCollapseAccordion] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isHydrating, setIsHydrating] = React.useState(false);

  const { data: companies } = useSWR<Company[]>(
    '/expediente-digital-cliente/companies',
    axiosFetcher
  );

  const formSchema = z
    .object({
      is_new: z.boolean(),
      casa_id: z.string().optional(),
      legal_name: z.string().optional(),
      legal_type: z
        .string({ message: 'Ingresa el tipo de cliente' })
        .min(1, 'Ingresa el tipo de cliente')
        .max(100, 'Máximo 100 caracteres'),
      rfc: z
        .string({ message: 'Ingresa el RFC del cliente' })
        .min(1, 'Ingresa el RFC del cliente')
        .max(100, 'Máximo 100 caracteres'),
      address_1: z
        .string({ message: 'Ingresa una dirección' })
        .min(1, 'Ingresa una dirección')
        .max(100, { message: 'Máximo 100 caracteres' }),
      neighbourhood: z
        .string({ message: 'Ingresa una colonia' })
        .min(1, 'Ingresa una colonia')
        .max(100, { message: 'Máximo 100 caracteres' }),
      municipality: z
        .string({ message: 'Ingresa un municipio' })
        .min(1, 'Ingresa un municipio')
        .max(100, { message: 'Máximo 100 caracteres' }),
      city: z
        .string({ message: 'Ingresa una ciudad' })
        .min(1, 'Ingresa una ciudad')
        .max(100, { message: 'Máximo 100 caracteres' }),
      state: z
        .string({ message: 'Ingresa un estado' })
        .min(1, 'Ingresa un estado')
        .max(100, { message: 'Máximo 100 caracteres' }),
      postal_code: z
        .string({ message: 'Ingresa un código postal' })
        .min(1, 'Ingresa un código postal')
        .max(100, { message: 'Máximo 100 caracteres' }),
    })
    .superRefine((data, ctx) => {
      if (data.is_new) {
        // NEW client: casa_id must be undefined, and legal_name is required
        if (data.casa_id && data.casa_id.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['casa_id'],
            message: 'Para cliente nuevo, casa_id debe estar vacío',
          });
        }

        if (!data.legal_name?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['legal_name'],
            message: 'Ingresa el nombre del cliente',
          });
        }
      } else {
        // Existing client: casa_id required
        if (!data.casa_id?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['casa_id'],
            message: 'Selecciona un cliente',
          });
        }
      }
    });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_new: false,
      casa_id: '',
      legal_name: '',
      legal_type: '',
      rfc: '',
      address_1: '',
      neighbourhood: '',
      municipality: '',
      city: '',
      state: '',
      postal_code: '',
    },
  });

  const resetForm = () => {
    form.reset({
      is_new: false,
      casa_id: '',
      legal_name: '',
      legal_type: '',
      rfc: '',
      address_1: '',
      neighbourhood: '',
      municipality: '',
      city: '',
      state: '',
      postal_code: '',
    });
    setCasaId(undefined as any);
    setCliente('');
    setShowDocuments(false);
    setCollapseAccordion(false);
  };

  const companiesOptions = React.useMemo(
    () =>
      companies?.map((c) => ({
        value: c.CVE_IMP,
        label: c.NOM_IMP,
        existsCasa: c.EXISTS_ON_CASA,
      })) ?? [],
    [companies]
  );

  const legalTypeOptions = [
    { value: 'M', label: 'Persona Moral' },
    { value: 'F', label: 'Persona física' },
  ];

  const isNew = form.watch('is_new');

  // When switching to "new client", force casa_id to undefined (form + context)
  React.useEffect(() => {
    if (!isNew) return;

    form.setValue('casa_id', '', { shouldValidate: true, shouldDirty: true });
    setCasaId(undefined as any);
  }, [isNew, form, setCasaId]);

  // Hydrate from CASA only when NOT new and casa_id exists
  React.useEffect(() => {
    const hydrateClient = async () => {
      if (isNew) return;
      if (!casa_id || !String(casa_id).trim()) return;

      try {
        setIsHydrating(true);
        setIsSubmitting(true);

        const resp = await GPClient.get('/expediente-digital-cliente/client', {
          params: { casa_id },
        });

        const c = resp.data;
        const addr = c?.address;

        form.setValue('legal_type', c?.legal_type ?? '');
        form.setValue('rfc', c?.rfc ?? '');
        form.setValue('address_1', addr?.address_1 ?? '');
        form.setValue('neighbourhood', addr?.neighbourhod ?? '');
        form.setValue('municipality', addr?.municipality ?? '');
        form.setValue('city', addr?.city ?? '');
        form.setValue('state', addr?.state ?? '');
        form.setValue('postal_code', addr?.postal_code ?? '');

        setShowDocuments(true);
        setCollapseAccordion(true);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          form.setValue('legal_type', '');
          form.setValue('rfc', '');
          form.setValue('address_1', '');
          form.setValue('neighbourhood', '');
          form.setValue('municipality', '');
          form.setValue('city', '');
          form.setValue('state', '');
          form.setValue('postal_code', '');
          return;
        }

        console.error(err);
        toast.error(err?.message ?? 'Error al consultar cliente');
      } finally {
        setIsHydrating(false);
        setIsSubmitting(false);
      }
    };

    hydrateClient();
  }, [casa_id, isNew, form, setShowDocuments]);


  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        casa_id: data.is_new ? undefined : data.casa_id, // enforce requirement
        legal_type: data.legal_type,
        rfc: data.rfc,
        legal_name: data.is_new ? (data.legal_name ?? '') : (cliente ?? ''),
        is_new: data.is_new,
        address: {
          address_1: data.address_1,
          neighbourhod: data.neighbourhood,
          municipality: data.municipality,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
        },
      };

      const resp = await GPClient.post('/expediente-digital-cliente/client', payload);

      if (resp.status !== 200) {
        toast.error('Error al guardar cliente');
        return;
      }

      toast.info('Se subieron los datos correctamente');
      setShowDocuments(true);
      setCollapseAccordion(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };
  console.log(form.formState.errors)

  return (
    <Accordion
      type="single"
      collapsible
      value={collapseAccordion ? '' : 'client-main'}
      onValueChange={(val) => setCollapseAccordion(val !== 'client-main')}
      className="w-full"
    >
      <AccordionItem value="client-main">
        <AccordionTrigger className="bg-blue-900 text-white px-2 [&>svg]:text-white mb-2">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-[auto_1fr] gap-2 place-items-center">
              <FileIcon size={18} />
              <p className="font-bold">
                {cliente ? `Expediente Digital - ${cliente}` : 'Expediente Digital'}
              </p>
            </div>
            {isHydrating && (
              <Loader2 className="h-4 w-4 animate-spin text-white" aria-label="Cargando datos" />
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-2 text-balance">
          <div>
            <Card>
              <CardContent>
                <p className="text-2xl font-bold mb-4">Expediente Digital del Cliente</p>
                <p className="text-xl font-semi-bold mb-4">{cliente && `${cliente}`}</p>

                <form id="form-datos-cliente" onSubmit={form.handleSubmit(onSubmit)}>
                  <Controller
                    name="is_new"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="grid gap-3 w-full">
                        <Label className="text-lg font-medium">¿Es un cliente nuevo?</Label>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              field.onChange(true);

                              // clear casa_id in form + context, then optionally fetch next id
                              form.setValue('casa_id', '', {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              setCasaId(undefined as any);
                            }}
                            className={`
                              h-12 text-base font-medium transition-all
                              ${field.value === true
                                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                : 'border-border hover:bg-blue-50/50'
                              }
                            `}
                          >
                            Sí
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange(false)}
                            className={`
                              h-12 text-base font-medium transition-all
                              ${field.value === false
                                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                : 'border-border hover:bg-blue-50/50'
                              }
                            `}
                          >
                            No
                          </Button>
                        </div>

                        <div className="min-h-[20px]">
                          {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                        </div>
                      </Field>
                    )}
                  />

                  <FieldGroup>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {isNew ? (
                        <Controller
                          name="legal_name"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="grid grid-rows-2 gap-0 w-full min-w-0"
                            >
                              <FieldLabel htmlFor="legal_name">
                                Nombre del cliente nuevo:
                              </FieldLabel>

                              <Input
                                {...field}
                                id="legal_name"
                                placeholder="Ej. Cliente S.A. de C.V."
                                className="mb-2"
                                aria-invalid={fieldState.invalid}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setCliente(e.target.value);
                                }}
                              />

                              <div className="min-h-[20px]">
                                {fieldState.invalid ? (
                                  <FieldError errors={[fieldState.error]} />
                                ) : null}
                              </div>
                            </Field>
                          )}
                        />
                      ) : (
                        <Controller
                          name="casa_id"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field
                              data-invalid={fieldState.invalid}
                              className="grid grid-rows-2 gap-0 w-full min-w-0"
                            >
                              <FieldLabel htmlFor="casa_id">Selecciona un cliente:</FieldLabel>

                              <MyGPCombo
                                placeholder="Busca y selecciona un cliente"
                                value={field.value || ''}
                                className="mb-2"
                                aria-invalid={fieldState.invalid}
                                setValue={(value: string) => {
                                  const selected = companiesOptions.find(
                                    (o) => o.value === value
                                  );
                                  if (!selected) return;

                                  if (!selected.existsCasa) {
                                    toast.warning('Advertencia: El cliente no existe en CASA');
                                  }

                                  field.onChange(value);
                                  setCasaId(selected.value);
                                  setCliente(selected.label);
                                }}
                                options={companiesOptions}
                                showValue
                              />

                              <div className="min-h-[20px]">
                                {fieldState.invalid ? (
                                  <FieldError errors={[fieldState.error]} />
                                ) : null}
                              </div>
                            </Field>
                          )}
                        />
                      )}

                      <Controller
                        name="legal_type"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="legal_type">Selecciona el tipo:</FieldLabel>

                            <MyGPCombo
                              placeholder="Selecciona persona moral o física"
                              value={field.value}
                              className="mb-2"
                              setValue={(value: string) => field.onChange(value)}
                              options={legalTypeOptions}
                              showValue
                            />

                            <div className="min-h-[20px]">
                              {fieldState.invalid ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </div>
                          </Field>
                        )}
                      />

                      <Controller
                        name="rfc"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="rfc">RFC:</FieldLabel>

                            <Input
                              {...field}
                              id="rfc"
                              placeholder="Ej. ABC123456XYZ"
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />

                            <div className="min-h-[20px]">
                              {fieldState.invalid ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </div>
                          </Field>
                        )}
                      />

                      <Controller
                        name="address_1"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="address_1">Dirección Principal:</FieldLabel>

                            <Input
                              {...field}
                              id="address_1"
                              className="mb-2"
                              placeholder="Calle, número exterior e interior"
                              aria-invalid={fieldState.invalid}
                            />

                            <div className="min-h-[20px]">
                              {fieldState.invalid ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </div>
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
                              className="mb-2"
                              placeholder="Ej. Colonia Centro"
                              aria-invalid={fieldState.invalid}
                            />

                            <div className="min-h-[20px]">
                              {fieldState.invalid ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </div>
                          </Field>
                        )}
                      />

                      <Controller
                        name="municipality"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="municipality">Municipio:</FieldLabel>

                            <Input
                              {...field}
                              id="municipality"
                              placeholder="Ej. Benito Juárez"
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />

                            <div className="min-h-[20px]">
                              {fieldState.invalid ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </div>
                          </Field>
                        )}
                      />

                      <Controller
                        name="city"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="city">Ciudad:</FieldLabel>

                            <Input
                              {...field}
                              id="city"
                              placeholder="Ej. Ciudad de México"
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />

                            <div className="min-h-[20px]">
                              {fieldState.invalid ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </div>
                          </Field>
                        )}
                      />

                      <Controller
                        name="state"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="state">Estado:</FieldLabel>

                            <Input
                              {...field}
                              id="state"
                              placeholder="Ej. CDMX"
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />

                            <div className="min-h-[20px]">
                              {fieldState.invalid ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </div>
                          </Field>
                        )}
                      />

                      <Controller
                        name="postal_code"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            <FieldLabel htmlFor="postal_code">Código Postal:</FieldLabel>

                            <Input
                              {...field}
                              id="postal_code"
                              placeholder="Ej. 01234"
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                            />

                            <div className="min-h-[20px]">
                              {fieldState.invalid ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </div>
                          </Field>
                        )}
                      />
                    </div>
                  </FieldGroup>
                </form>
              </CardContent>

              <CardFooter className="flex items-end">
                <Field orientation="horizontal" className="justify-end">
                  <MyGPButtonGhost onClick={resetForm}>Reiniciar</MyGPButtonGhost>
                  <MyGPButtonSubmit form="form-datos-cliente" isSubmitting={isSubmitting}>
                    Guardar Cambios
                  </MyGPButtonSubmit>
                </Field>
              </CardFooter>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}