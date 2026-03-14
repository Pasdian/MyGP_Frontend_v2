import React from 'react';
import useSWR from 'swr';
import { PlusIcon, SaveIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';

import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/useAuth';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';
import { toast } from 'sonner';

const formSchema = z.object({
  concepto: z.string().min(1, 'Selecciona un concepto'),
  clave_proveedor: z.string().min(1, 'Selecciona un proveedor'),
  factura: z.string().min(1, 'El número de factura es obligatorio'),
  importe: z
    .string()
    .min(1, 'El total a pagar es obligatorio')
    .refine((value) => !Number.isNaN(Number(value)), 'Ingresa un importe válido')
    .refine((value) => Number(value) > 0, 'El importe debe ser mayor a 0'),
});

type FormValues = z.infer<typeof formSchema>;

const errorClass = (hasError: boolean) => (hasError ? 'border-red-500' : '');

export function AgregarGasto({ isAmericana = false }: { isAmericana?: boolean }) {
  const { getUserEmail, getUserFullName } = useAuth();
  const { reference, referencePayload, swrKey } = useOrdenFacturacion();
  const { mutate } = useSWR(swrKey, axiosFetcher);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: conceptosData, isLoading: isConceptosLoading } = useSWR(
    isAmericana ? '/dipp/conceptos-americanos' : '/dipp/conceptos',
    axiosFetcher
  );

  const { data: proveedoresData, isLoading: isProveedoresLoading } = useSWR(
    '/dipp/proveedores',
    axiosFetcher
  );

  const conceptoProvisionOptions = React.useMemo(() => {
    if (!conceptosData) return [];
    if (isAmericana) {
      return conceptosData.map((item: any) => ({
        value: String(item.CVE_CONC),
        label: `${item.CVE_CONC} - ${item.DES_CONC}`,
      }));
    }
    return conceptosData.map((item: any) => ({
      value: String(item.CLAVE),
      label: item.DESCRIPCION,
    }));
  }, [conceptosData, isAmericana]);

  const proveedoresOptions = React.useMemo(() => {
    if (!proveedoresData) return [];
    return proveedoresData.map((item: any) => ({
      value: String(item.CVE_BENE),
      label: item.NOM_BENE,
    }));
  }, [proveedoresData]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concepto: '',
      clave_proveedor: isAmericana ? '00025' : '',
      factura: '',
      importe: '',
    },
  });

  React.useEffect(() => {
    reset({
      concepto: '',
      clave_proveedor: isAmericana ? '00025' : '',
      factura: '',
      importe: '',
    });
  }, [referencePayload, reset, isAmericana]);

  const onSubmit = async (payload: FormValues) => {
    try {
      setIsSubmitting(true);

      const proveedor_name = isAmericana
        ? 'CUSTOMS & SHIPPING SERVICES INC'
        : (proveedoresOptions.find(
            (p: { value: string; label: string }) => p.value === payload.clave_proveedor
          )?.label ?? '');

      const concepto_name =
        conceptoProvisionOptions.find(
          (c: { value: string; label: string }) => c.value === payload.concepto
        )?.label ?? '';

      await GPClient.post('/dipp/agregarGasto', {
        ...payload,
        isAmericana,
        referencia: reference,
        userEmail: getUserEmail() || '',
        userFullName: getUserFullName() || '',
        proveedor_name,
        concepto_name,
      });

      await mutate();
      setIsOpen(false);
      toast.success('Gasto agregado correctamente!');

      reset({
        concepto: '',
        clave_proveedor: isAmericana ? '00025' : '',
        factura: '',
        importe: '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MyGPDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Agregar Gasto"
      description="Aquí podrás agregar un gasto."
      trigger={
        <MyGPButtonPrimary>
          <PlusIcon /> Agregar Gasto
        </MyGPButtonPrimary>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="concepto"
          render={({ field, fieldState }) => (
            <MyGPCombo
              id="concepto"
              value={field.value}
              setValue={field.onChange}
              label="Concepto:"
              options={conceptoProvisionOptions}
              placeholder="Selecciona un concepto"
              isModal={true}
              isLoading={isConceptosLoading}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              aria-invalid={!!fieldState.error}
              aria-errormessage={fieldState.error ? 'concepto-error' : undefined}
            />
          )}
        />

        <div className="grid grid-rows gap-2">
          <Label htmlFor="factura">No. Factura</Label>
          <Input
            id="factura"
            {...register('factura')}
            placeholder="1234"
            aria-invalid={!!errors.factura}
            aria-errormessage={errors.factura ? 'factura-error' : undefined}
            className={errorClass(!!errors.factura)}
          />
          {errors.factura && (
            <p id="factura-error" className="text-sm text-red-500">
              {errors.factura.message}
            </p>
          )}
        </div>

        {isAmericana ? (
          <div className="grid gap-2">
            <Label htmlFor="proveedor">Proveedor (CUSTOMS & SHIPPING SERVICES INC)</Label>
            <Input
              id="proveedor"
              defaultValue="00025"
              readOnly
              className="bg-muted cursor-not-allowed opacity-70"
              {...register('clave_proveedor')}
            />
          </div>
        ) : (
          <Controller
            control={control}
            name="clave_proveedor"
            render={({ field, fieldState }) => (
              <MyGPCombo
                id="clave_proveedor"
                value={field.value}
                setValue={field.onChange}
                label="Proveedor:"
                options={proveedoresOptions}
                placeholder="Selecciona un proveedor"
                isModal={true}
                isLoading={isProveedoresLoading}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                aria-invalid={!!fieldState.error}
                aria-errormessage={fieldState.error ? 'proveedor-error' : undefined}
              />
            )}
          />
        )}

        <div className="grid grid-rows gap-2">
          <Label htmlFor="importe">Importe</Label>
          <Input
            id="importe"
            {...register('importe')}
            type="text"
            inputMode="decimal"
            placeholder="1234"
            aria-invalid={!!errors.importe}
            aria-errormessage={errors.importe ? 'importe-error' : undefined}
            className={errorClass(!!errors.importe)}
          />
          {errors.importe && (
            <p id="importe-error" className="text-sm text-red-500">
              {errors.importe.message}
            </p>
          )}
        </div>

        <div className="flex justify-end col-span-2">
          <MyGPButtonSubmit isSubmitting={isSubmitting} type="submit">
            <SaveIcon /> Guardar
          </MyGPButtonSubmit>
        </div>
      </form>
    </MyGPDialog>
  );
}
