import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import React from 'react';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DATE_VALIDATION,
  EXCEPTION_CODE_VALIDATION,
  PHASE_VALIDATION,
  REF_VALIDATION,
} from '@/lib/validations/phaseValidations';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { Row } from '@tanstack/react-table';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { USER_CASA_USERNAME_VALIDATION } from '@/lib/validations/userValidations';
import { shouldPutExceptionCode } from '@/lib/utilityFunctions/shouldPutExceptionCode';
import FormItemsRevalidacion from './FormItems/FormItemsRevalidacion';
import FormItemsUltimoDocumento from './FormItems/FormItemsUltimoDocumento';
import FormItemsEntregaTransporte from './FormItems/FormItemsEntregaTransporte';
import FormItemsMSA from './FormItems/FormItemsMSA';
import { transbelModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { InterfaceContext } from '@/contexts/InterfaceContext';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import axios from 'axios';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';

const posthogEvent =
  transbelModuleEvents.find((e) => e.alias === 'TRANSBEL_MODIFY_INTERFACE')?.eventName || '';

export default function InterfaceUpsertPhaseForm({
  row,
  setOpenDialog,
}: {
  row: Row<getRefsPendingCE>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useAuth();
  const { setRefsPendingCE } = React.useContext(InterfaceContext);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const schema = z
    .object({
      ref: REF_VALIDATION,
      phase: PHASE_VALIDATION,
      exceptionCode: EXCEPTION_CODE_VALIDATION,
      date: DATE_VALIDATION,
      user: USER_CASA_USERNAME_VALIDATION,
    })
    .refine(
      (data) => {
        if (
          data.phase === '073' &&
          row.original.ULTIMO_DOCUMENTO_114 &&
          data.date > row.original.ULTIMO_DOCUMENTO_114
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'La fecha de revalidación no puede ser mayor a la fecha de último documento',
        path: ['date'],
      }
    )
    .refine(
      (data) => {
        if (data.phase === '073' && row.original.MSA_130 && data.date > row.original.MSA_130) {
          return false;
        }
        return true;
      },
      {
        message: 'La fecha de revalidación no puede ser mayor a la fecha de MSA',
        path: ['date'],
      }
    )
    .refine(
      (data) => {
        if (
          data.phase === '073' &&
          row.original.ENTREGA_TRANSPORTE_138 &&
          data.date > row.original.ENTREGA_TRANSPORTE_138
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'La fecha de revalidación no puede ser mayor a la fecha de entrega de transporte',
        path: ['date'],
      }
    )
    .refine(
      (data) => {
        if (data.phase === '114' && row.original.MSA_130 && data.date > row.original.MSA_130) {
          return false;
        }
        return true;
      },
      {
        message: 'La fecha de último documento no puede ser mayor a la fecha de MSA',
        path: ['date'],
      }
    )
    .refine(
      (data) => {
        if (
          data.phase === '114' &&
          row.original.ENTREGA_TRANSPORTE_138 &&
          data.date > row.original.ENTREGA_TRANSPORTE_138
        ) {
          return false;
        }
        return true;
      },
      {
        message:
          'La fecha de último documento no puede ser mayor a la fecha de entrega de transporte',
        path: ['date'],
      }
    )
    .refine(
      (data) => {
        if (
          data.phase === '130' &&
          row.original.ENTREGA_TRANSPORTE_138 &&
          data.date !== row.original.ENTREGA_TRANSPORTE_138
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'La fecha de MSA debe ser igual a la fecha de entrega de transporte',
        path: ['date'],
      }
    )
    .refine(
      (data) =>
        !(
          data.phase === '114' &&
          row.original.ENTREGA_TRANSPORTE_138 &&
          data.date &&
          row.original.ENTREGA_TRANSPORTE_138 < data.date
        ),
      {
        message: 'La fecha de transporte no puede ser menor a la fecha de último documento',
        path: ['date'],
      }
    )
    .refine(
      (data) => {
        return !shouldPutExceptionCode({
          exceptionCode: data.exceptionCode,
          initialDate: row.original.ULTIMO_DOCUMENTO_114,
          finalDate: data.date,
          numDays: 7,
        });
      },
      {
        message:
          'Coloca un código de excepción, la diferencia entre la fecha de último documento y transporte es mayor a 7 dias',
        path: ['date'],
      }
    );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      ref: row.original.REFERENCIA || '',
      phase: '',
      exceptionCode: row.original.CE_138 || '',
      date: '',
      user: user.complete_user.user.casa_user_name
        ? user.complete_user.user.casa_user_name
        : 'MYGP',
    },
  });

  const toISODate = (s?: string) => (s ?? '').split(/[ T]/)[0] || '';

  const phase = form.watch('phase');
  React.useEffect(() => {
    // Set dates when chaging the dropdown
    const phaseField: Record<string, keyof typeof row.original> = {
      '073': 'REVALIDACION_073',
      '114': 'ULTIMO_DOCUMENTO_114',
      '130': 'MSA_130',
      '138': 'ENTREGA_TRANSPORTE_138',
    };

    const getDateFromPhase = (p?: string) => {
      const field = p ? phaseField[p] : undefined;
      const raw = field ? row.original[field] : '';
      return toISODate(typeof raw === 'string' ? raw : '');
    };
    form.setValue('date', getDateFromPhase(phase));
  }, [phase, form, row]);

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsSubmitting(true);
    try {
      const res = await GPClient.patch(`/api/casa/upsertPhase/${data.ref}`, {
        phase: data.phase,
        exceptionCode: data.exceptionCode,
        date: data.date, // "YYYY-MM-DD"
        user: data.user,
      });

      if (res.status === 200) {
        const row = res.data.data; // { NUM_REFE, CVE_ETAP, FEC_ETAP, ... }

        const fieldMap: Record<string, string> = {
          '073': 'REVALIDACION_073',
          '114': 'ULTIMO_DOCUMENTO_114',
          '130': 'MSA_130',
          '138': 'ENTREGA_TRANSPORTE_138',
        };

        const field = fieldMap[row.CVE_ETAP];
        const formatted =
          typeof formatISOtoDDMMYYYY === 'function' ? formatISOtoDDMMYYYY(row.FEC_ETAP) : null; // or formatISOtoDDMMYY(row.FEC_ETAP)

        setRefsPendingCE((prev) =>
          prev.map((r) =>
            r.REFERENCIA === row.NUM_REFE
              ? {
                  ...r,
                  ...(field ? { [field]: row.FEC_ETAP, [`${field}_FORMATTED`]: formatted } : {}),
                  CVE_ETAP: row.CVE_ETAP,
                  CVE_MODI: row.CVE_MODI,
                  OBS_ETAP: row.OBS_ETAP,
                  FEC_ETAP: row.FEC_ETAP,
                  HOR_ETAP: row.HOR_ETAP,
                }
              : r
          )
        );

        toast.success('Datos modificados correctamente');
        posthog.capture(posthogEvent);
        setIsSubmitting(false);

        setOpenDialog((o) => !o);
      } else {
        toast.error('No se pudieron actualizar tus datos');
        setIsSubmitting(false);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Axios error:', err.response?.data || err.message);
        toast.error(err.response?.data?.message || 'Falló la petición');
        setIsSubmitting(false);
      } else {
        console.error('Error inesperado:', err);
        toast.error('Error inesperado');
        setIsSubmitting(false);
      }
    }
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-lg leading-none font-semibold mb-2">Editar Entrega</p>
        <p className="text-muted-foreground text-sm">
          Aquí podrás realizar la modificación de una entrega. Haz click en guardar cuando termines
          de editar los campos.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="ref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="Referencia..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etapa a Modificar</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value} // <-- controlled
                      onValueChange={(val) => {
                        // update phase explicitly
                        form.setValue('phase', val, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });

                        // set date depending on phase & row values
                        if (val === '073' && row.original.REVALIDACION_073) {
                          form.setValue('date', row.original.REVALIDACION_073);
                        } else if (val === '114' && row.original.ULTIMO_DOCUMENTO_114) {
                          form.setValue('date', row.original.ULTIMO_DOCUMENTO_114);
                        } else if (val === '130' && row.original.MSA_130) {
                          form.setValue('date', row.original.MSA_130);
                        } else if (val === '138' && row.original.ENTREGA_TRANSPORTE_138) {
                          form.setValue('date', row.original.ENTREGA_TRANSPORTE_138);
                        } else {
                          form.setValue('date', '');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una etapa..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="073">073 - Revalidación</SelectItem>
                        <SelectItem value="114">114 - Último Documento</SelectItem>
                        <SelectItem value="130">130 - MSA</SelectItem>
                        <SelectItem value="138">138 - Entrega a Transporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {phase == '073' && <FormItemsRevalidacion form={form} row={row} />}
            {phase == '114' && <FormItemsUltimoDocumento form={form} row={row} />}
            {phase == '130' && <FormItemsMSA form={form} row={row} />}
            {phase == '138' && <FormItemsEntregaTransporte form={form} row={row} />}

            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder="Usuario..."
                      className="mb-4 uppercase"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <MyGPButtonGhost>Cancelar</MyGPButtonGhost>
            </DialogClose>
            <MyGPButtonSubmit isSubmitting={isSubmitting} />
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
