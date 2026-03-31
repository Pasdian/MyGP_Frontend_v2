'use client';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilLine, PlusIcon, SaveIcon } from 'lucide-react';
import { toast } from 'sonner';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import type { InstruccionAdicionalItem } from '@/contexts/dipp/OrdenFacturacionContext';
import { useAuth } from '@/hooks/useAuth';

import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';
import { MyGPSelect } from '../MyGPUI/Selects/MyGPSelect';
import { MyGPButtonWarning } from '../MyGPUI/Buttons/MyGPButtonWarning';
import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  buildInstruccionAdicionalSchema,
  INSTRUCCION_ADICIONAL_OTROS_VALUE,
  InstruccionAdicionalFormValues,
  instruccionAdicionalConceptOptions,
  toInstruccionAdicionalFormDefaultValues,
  toInstruccionAdicionalPayload,
  toModificarInstruccionAdicionalPayload,
} from './instruccionesAdicionalesForm';

const errorClass = (hasError: boolean) => (hasError ? 'border-red-500' : '');

type InstruccionAdicionalDialogProps = {
  mode: 'add' | 'edit';
  title: string;
  description: string;
  trigger: React.ReactNode;
  successMessage: string;
  item?: InstruccionAdicionalItem;
};

function InstruccionAdicionalDialog({
  mode,
  title,
  description,
  trigger,
  successMessage,
  item,
}: InstruccionAdicionalDialogProps) {
  const { reference, referencePayload, refreshReference } = useOrdenFacturacion();
  const { getCasaUsername } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentUuid = item?.UUID || null;
  const fieldIdPrefix = mode === 'edit' ? `edit-${currentUuid || 'instruccion'}` : 'add-instruccion';
  const existingConceptos = React.useMemo(
    () =>
      (referencePayload?.INSTRUCCIONES_ADICIONALES || [])
        .filter((row) => row.UUID !== currentUuid)
        .map((row) => row.CONCEPTO)
        .filter((concepto): concepto is string => Boolean(concepto)),
    [currentUuid, referencePayload?.INSTRUCCIONES_ADICIONALES]
  );

  const schema = React.useMemo(
    () => buildInstruccionAdicionalSchema(existingConceptos),
    [existingConceptos]
  );
  const conceptOptions = React.useMemo(
    () => [...instruccionAdicionalConceptOptions],
    []
  );

  const defaultValues = React.useMemo(
    () =>
      toInstruccionAdicionalFormDefaultValues(
        mode === 'edit'
          ? {
              concepto: item?.CONCEPTO,
              importe: item?.IMPORTE,
              cantidad: item?.CANTIDAD,
            }
          : undefined
      ),
    [item?.CANTIDAD, item?.CONCEPTO, item?.IMPORTE, mode]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<InstruccionAdicionalFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });
  const selectedConcept = watch('concepto');
  const isOtrosSelected = selectedConcept === INSTRUCCION_ADICIONAL_OTROS_VALUE;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      reset(defaultValues);
    },
    [defaultValues, reset]
  );

  React.useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  const onSubmit = async (values: InstruccionAdicionalFormValues) => {
    if (!reference) return;
    if (mode === 'edit' && !currentUuid) return;

    try {
      setIsSubmitting(true);

      if (mode === 'edit') {
        await GPClient.patch(
          '/pyapi/dipp/modificarInstruccionAdicional',
          toModificarInstruccionAdicionalPayload(currentUuid as string, reference, values)
        );
      } else {
        await GPClient.post(
          '/pyapi/dipp/agregarInstruccionAdicional',
          {
            ...toInstruccionAdicionalPayload(reference, values),
            createdBy: getCasaUsername() || 'MYGP',
          }
        );
      }

      await refreshReference();
      toast.success(successMessage);
      setIsOpen(false);
      reset(defaultValues);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MyGPDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      trigger={trigger}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Controller
              control={control}
              name="concepto"
              render={({ field }) => (
                <MyGPSelect
                  id={`${fieldIdPrefix}-concepto`}
                  label="Concepto"
                  placeholder="Selecciona un concepto"
                  options={conceptOptions}
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value !== INSTRUCCION_ADICIONAL_OTROS_VALUE) {
                      setValue('otroConcepto', '', { shouldValidate: true });
                    }
                  }}
                  error={!!errors.concepto}
                  helperText={errors.concepto?.message}
                  aria-invalid={!!errors.concepto}
                />
              )}
            />
          </div>

          {isOtrosSelected && (
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor={`${fieldIdPrefix}-otro-concepto`}>Otro Concepto</Label>
              <Input
                id={`${fieldIdPrefix}-otro-concepto`}
                {...register('otroConcepto')}
                placeholder="Escribe el concepto"
                maxLength={120}
                aria-invalid={!!errors.otroConcepto}
                aria-errormessage={
                  errors.otroConcepto ? `${fieldIdPrefix}-otro-concepto-error` : undefined
                }
                className={errorClass(!!errors.otroConcepto)}
              />
              {errors.otroConcepto && (
                <p
                  id={`${fieldIdPrefix}-otro-concepto-error`}
                  className="text-sm text-red-500"
                >
                  {errors.otroConcepto.message}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor={`${fieldIdPrefix}-importe`}>Importe</Label>
            <Input
              id={`${fieldIdPrefix}-importe`}
              {...register('importe')}
              type="number"
              min="0"
              step="0.01"
              aria-invalid={!!errors.importe}
              aria-errormessage={errors.importe ? `${fieldIdPrefix}-importe-error` : undefined}
              className={errorClass(!!errors.importe)}
            />
            {errors.importe && (
              <p id={`${fieldIdPrefix}-importe-error`} className="text-sm text-red-500">
                {errors.importe.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${fieldIdPrefix}-cantidad`}>Cantidad</Label>
            <Input
              id={`${fieldIdPrefix}-cantidad`}
              {...register('cantidad')}
              type="number"
              min="1"
              step="1"
              placeholder="Opcional"
              aria-invalid={!!errors.cantidad}
              aria-errormessage={errors.cantidad ? `${fieldIdPrefix}-cantidad-error` : undefined}
              className={errorClass(!!errors.cantidad)}
            />
            {errors.cantidad && (
              <p id={`${fieldIdPrefix}-cantidad-error`} className="text-sm text-red-500">
                {errors.cantidad.message}
              </p>
            )}
          </div>

          <div className="flex justify-end md:col-span-2">
            <MyGPButtonSubmit isSubmitting={isSubmitting} disabled={!isValid} type="submit">
              <SaveIcon /> Guardar
            </MyGPButtonSubmit>
          </div>
        </div>
      </form>
    </MyGPDialog>
  );
}

export function AgregarInstruccionAdicional() {
  return (
    <InstruccionAdicionalDialog
      mode="add"
      title="Agregar Instruccion"
      description="Aqui podras agregar una instruccion adicional."
      successMessage="Instruccion agregada correctamente"
      trigger={
        <MyGPButtonPrimary>
          <PlusIcon /> Agregar Instruccion
        </MyGPButtonPrimary>
      }
    />
  );
}

export function ModificarInstruccionAdicional({ item }: { item: InstruccionAdicionalItem }) {
  if (!item.UUID) return null;

  return (
    <InstruccionAdicionalDialog
      mode="edit"
      item={item}
      title="Modificar Instruccion"
      description="Aqui podras modificar una instruccion adicional."
      successMessage="Instruccion modificada correctamente"
      trigger={
        <MyGPButtonWarning size="sm" className="min-w-[110px] py-2 text-white hover:text-white">
          <PencilLine className="h-4 w-4" />
          Modificar
        </MyGPButtonWarning>
      }
    />
  );
}
