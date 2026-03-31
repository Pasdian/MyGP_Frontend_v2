'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod/v4';
import { ClientsController } from '@/components/expediente-digital-cliente/form-controllers/ClientsController';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SaveAllIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PERM } from '@/lib/modules/permissions';

export type SolicitudDiariaFormMode = 'create' | 'edit';

export type SolicitudDiariaFormValues = {
  client: string;
  tipoReferencia: string;
  tipoPago: string;
  tipo: string;
  concepto: string;
  numeroReferencia: string;
  ingresoEstimado: string;
  ingresoReal: string;
  hasAnticipo: boolean;
  observaciones: string;
};

type SolicitudDiariaFormProps = {
  mode: SolicitudDiariaFormMode;
  defaultValues?: Partial<SolicitudDiariaFormValues>;
  onSubmit: (values: SolicitudDiariaFormValues) => Promise<void> | void;
};

export const getSolicitudDiariaErrorMessage = (error: unknown, fallback: string) => {
  const axiosLikeError = error as {
    response?: {
      data?: {
        detail?: string;
        message?: string;
      };
    };
  };

  return (
    axiosLikeError.response?.data?.detail || axiosLikeError.response?.data?.message || fallback
  );
};

const normalizeSolicitudDiariaText = (value: string) => value.trim();

export const buildSolicitudDiariaBasePayload = (values: SolicitudDiariaFormValues) => ({
  client: values.client,
  tipoReferencia: values.tipoReferencia,
  tipoPago: values.tipoPago,
  tipo: values.tipo,
  concepto: values.concepto,
  numeroReferencia: values.numeroReferencia,
  ingresoEstimado: Number(values.ingresoEstimado),
  observaciones: normalizeSolicitudDiariaText(values.observaciones),
});

export const buildSolicitudDiariaUpdatePayload = (values: SolicitudDiariaFormValues) => ({
  ...buildSolicitudDiariaBasePayload(values),
  ingresoReal: Number(values.ingresoReal),
  hasAnticipo: values.hasAnticipo,
});

const getSolicitudDiariaFormSchema = (mode: SolicitudDiariaFormMode) =>
  z
    .object({
      client: z.string().min(1, 'Selecciona un cliente'),
      tipoReferencia: z.string().min(1, 'Selecciona el tipo de referencia'),
      tipoPago: z.string().min(1, 'Selecciona el tipo de pago'),
      tipo: z.string().min(1, 'Selecciona el tipo'),
      concepto: z.string().min(1, 'Selecciona el concepto'),
      numeroReferencia: z.string().min(1, 'Ingresa el número de referencia'),
      ingresoEstimado: z
        .string()
        .min(1, 'Ingresa el monto')
        .refine((value) => !Number.isNaN(Number(value)), 'Ingresa un importe válido')
        .refine((value) => Number(value) > 0, 'El monto debe ser mayor a 0'),
      ingresoReal: z.string(),
      hasAnticipo: z.boolean(),
      observaciones: z.string(),
    })
    .superRefine((values, ctx) => {
      if (mode === 'edit') {
        if (!values.ingresoReal.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['ingresoReal'],
            message: 'Ingresa el ingreso real',
          });
        } else if (Number.isNaN(Number(values.ingresoReal))) {
          ctx.addIssue({
            code: 'custom',
            path: ['ingresoReal'],
            message: 'Ingresa un importe válido',
          });
        } else if (Number(values.ingresoReal) < 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['ingresoReal'],
            message: 'El ingreso real no puede ser negativo',
          });
        }
      }
    });

const getSolicitudDiariaDefaultValues = (
  mode: SolicitudDiariaFormMode,
  defaultValues?: Partial<SolicitudDiariaFormValues>,
  canEditTipo: boolean = true
): SolicitudDiariaFormValues => ({
  client: '',
  tipoReferencia: '',
  tipoPago: '',
  tipo: canEditTipo ? '' : 'NO_PAGADA',
  concepto: '',
  numeroReferencia: '',
  ingresoEstimado: '',
  ingresoReal: mode === 'edit' ? '' : '',
  hasAnticipo: false,
  observaciones: '',
  ...defaultValues,
});

export function SolicitudDiariaForm({ mode, defaultValues, onSubmit }: SolicitudDiariaFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { hasPermission } = useAuth();
  const canEditTipo = hasPermission(PERM.DIPP_SOLICITUDES_DIARIAS_ADMIN);
  const formSchema = React.useMemo(() => getSolicitudDiariaFormSchema(mode), [mode]);
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SolicitudDiariaFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: getSolicitudDiariaDefaultValues(mode, defaultValues, canEditTipo),
  });

  const handleFormSubmit = async (values: SolicitudDiariaFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="grid w-full gap-4">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <div className="w-full">
          <ClientsController control={control} isModal={true} />
        </div>

        <Controller
          control={control}
          name="tipoReferencia"
          render={({ field, fieldState }) => (
            <div className="grid w-full gap-2">
              <Label>Tipo de Referencia</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={!!fieldState.error}>
                  <SelectValue placeholder="Selecciona tipo de referencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="CONSIDERADA">Considerada</SelectItem>
                    <SelectItem value="NO_CONSIDERADA">No Considerada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />

        <Controller
          control={control}
          name="tipoPago"
          render={({ field, fieldState }) => (
            <div className="grid w-full gap-2">
              <Label>Tipo de Pago</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={!!fieldState.error}>
                  <SelectValue placeholder="Selecciona tipo de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="CON_ANTICIPO">Con Anticipo</SelectItem>
                    <SelectItem value="FINANCIADA">Financiada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />

        {canEditTipo ? (
          <Controller
            control={control}
            name="tipo"
            render={({ field, fieldState }) => (
              <div className="grid w-full gap-2">
                <Label>Tipo</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-invalid={!!fieldState.error}>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="PAGADA">Pagada</SelectItem>
                      <SelectItem value="NO_PAGADA">No Pagada</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="concepto"
          render={({ field, fieldState }) => (
            <div className="grid w-full gap-2">
              <Label>Concepto</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={!!fieldState.error}>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="CORRESPONSALIAS">Corresponsalias</SelectItem>
                    <SelectItem value="IMPUESTOS">Impuestos</SelectItem>
                    <SelectItem value="PAGO_TERCEROS">Pago a Terceros</SelectItem>
                    <SelectItem value="REGALIAS">Regalias</SelectItem>
                    <SelectItem value="SALDOS_FAVOR">Saldos a Favor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        />

        <div className="grid w-full gap-2">
          <Label>Número de Referencia</Label>
          <Input
            className="w-full"
            placeholder="PAI123456"
            aria-invalid={!!errors.numeroReferencia}
            {...register('numeroReferencia')}
          />
          <FieldError errors={[errors.numeroReferencia]} />
        </div>

        <div className="grid w-full gap-2">
          <Label>Monto</Label>
          <Input
            className="w-full"
            type="text"
            inputMode="decimal"
            placeholder="1234.56"
            aria-invalid={!!errors.ingresoEstimado}
            {...register('ingresoEstimado')}
          />
          <FieldError errors={[errors.ingresoEstimado]} />
        </div>

        {mode === 'edit' && hasPermission(PERM.DIPP_SOLICITUDES_DIARIAS_ADMIN) ? (
          <>
            <div className="grid w-full gap-2">
              <Label>Ingreso Real</Label>
              <Input
                className="w-full"
                type="text"
                inputMode="decimal"
                placeholder="1234.56"
                aria-invalid={!!errors.ingresoReal}
                {...register('ingresoReal')}
              />
              <FieldError errors={[errors.ingresoReal]} />
            </div>

            <Controller
              control={control}
              name="hasAnticipo"
              render={({ field }) => (
                <div className="flex items-center gap-3 self-end pb-2">
                  <Checkbox
                    id={`${mode}-has-anticipo`}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  <Label htmlFor={`${mode}-has-anticipo`}>Tiene anticipo</Label>
                </div>
              )}
            />
          </>
        ) : null}

        <div className="grid w-full gap-2 md:col-span-2">
          <Label>Observaciones</Label>
          <Textarea
            className="w-full"
            placeholder="Observaciones"
            aria-invalid={!!errors.observaciones}
            {...register('observaciones')}
          />
          <FieldError errors={[errors.observaciones]} />
        </div>

        <div className="flex w-full justify-end md:col-span-2">
          <MyGPButtonSubmit isSubmitting={isSubmitting}>
            <SaveAllIcon />
            Guardar Cambios
          </MyGPButtonSubmit>
        </div>
      </div>
    </form>
  );
}
