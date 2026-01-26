import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';

import { FileIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import React from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';

export function ClientMain({
  setShowDocuments,
}: {
  setShowDocuments: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { cliente, casa_id, setCasaId, setCliente } = useCliente();
  const [collapseAccordion, setCollapseAccordion] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isHydrating, setIsHydrating] = React.useState(false);

  const { rows: companies } = useCompanies();

  const formSchema = z.object({
    casa_id: z
      .string({ message: 'Selecciona un cliente' })
      .min(1, 'Selecciona un cliente')
      .max(100, 'Máximo 100 caracteres'),
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
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      casa_id: '',
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
      casa_id: '',
      legal_type: '',
      rfc: '',
      address_1: '',
      neighbourhood: '',
      municipality: '',
      city: '',
      state: '',
      postal_code: '',
    });
  };

  const companiesOptions = React.useMemo(() => {
    return companies.map((company) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companies]);

  const legalTypeOptions = [
    {
      value: 'M',
      label: 'Persona Moral',
    },
    { value: 'F', label: 'Persona física' },
  ];

  React.useEffect(() => {
    const hydrateClient = async () => {
      if (!casa_id || !casa_id.trim()) return;

      try {
        setIsHydrating(true);

        setIsSubmitting(true);

        const resp = await GPClient.get('/api/expediente-digital-cliente/client', {
          params: { casa_id },
        });

        const c = resp.data;
        const addr = c?.address;

        form.reset({
          casa_id: casa_id,
          legal_type: c?.legal_type ?? '',
          rfc: c?.rfc ?? '',
          address_1: addr?.address_1 ?? '',
          neighbourhood: addr?.neighbourhod ?? '',
          municipality: addr?.municipality ?? '',
          city: addr?.city ?? '',
          state: addr?.state ?? '',
          postal_code: addr?.postal_code ?? '',
        });
        setShowDocuments(true);
        setCollapseAccordion(true);
      } catch (err: any) {
        // 404 = aún no hay registro en BD, dejamos campos vacíos (pero mantenemos casa_id)
        if (err?.response?.status === 404) {
          form.reset({
            casa_id: casa_id,
            legal_type: '',
            rfc: '',
            address_1: '',
            neighbourhood: '',
            municipality: '',
            city: '',
            state: '',
            postal_code: '',
          });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [casa_id]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const payload = {
        casa_id: data.casa_id,
        legal_type: data.legal_type,
        rfc: data.rfc,
        legal_name: cliente ?? '',
        address: {
          address_1: data.address_1,
          neighbourhod: data.neighbourhood,
          municipality: data.municipality,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
        },
      };

      const resp = await GPClient.post('/api/expediente-digital-cliente/client', payload);

      if (resp.status !== 200) {
        toast.error('Error al guardar cliente');
        return;
      }
      toast.info('Se subieron los datos correctamente');
      setShowDocuments(true);
      setCollapseAccordion(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={collapseAccordion ? '' : 'client-main'}
      onValueChange={(val) => {
        setCollapseAccordion(val !== 'client-main');
      }}
      className="w-full"
    >
      <AccordionItem value="client-main">
        <AccordionTrigger className="bg-blue-700 text-white px-2 [&>svg]:text-white mb-2">
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
                  <FieldGroup>
                    <div className="grid grid-cols-2 gap-2 mb-4">
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
                              value={field.value}
                              className="mb-2"
                              aria-invalid={fieldState.invalid}
                              setValue={(value: string) => {
                                const selected = companiesOptions.find((o) => o.value === value);
                                if (!selected) return;

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
                      <Controller
                        name="legal_type"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0 w-full min-w-0"
                          >
                            {' '}
                            <FieldLabel htmlFor="rfc">Selecciona el tipo:</FieldLabel>
                            <MyGPCombo
                              placeholder="Selecciona persona moral o física"
                              value={field.value}
                              className="mb-2"
                              setValue={(value: string) => {
                                field.onChange(value);
                              }}
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
                            {' '}
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
                            <FieldLabel htmlFor="email">Dirección Principal:</FieldLabel>
                            <Input
                              {...field}
                              id="email"
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
                          <Field
                            data-invalid={fieldState.invalid}
                            className="grid grid-rows-2 gap-0"
                          >
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
                  <MyGPButtonGhost onClick={() => resetForm()}>Reiniciar</MyGPButtonGhost>
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
