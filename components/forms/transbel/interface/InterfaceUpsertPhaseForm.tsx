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

const toISODate = (s?: string) => (s ?? '').split(/[ T]/)[0] || '';

const parseDateOnly = (s?: string) => {
  const d = toISODate(s);
  if (!d) return null;
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const isWithinLast365DaysNoFuture = (d: Date) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const min = new Date(todayStart);
  min.setDate(min.getDate() - 365);
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return dd >= min && dd <= todayStart;
};

const businessDaysDiff = (a: Date, b: Date) => {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  if (end <= start) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay(); 
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
};

const PHASE_LABEL: Record<string, string> = {
  '073': 'Revalidación',
  '114': 'Último Documento',
  '130': 'MSA',
  '138': 'Entrega a Transporte',
};

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
    .superRefine((data, ctx) => {
      const allowed = new Set(['073', '114', '130', '138']);
      if (!allowed.has(data.phase)) return;

      const label = PHASE_LABEL[data.phase] ?? data.phase;

      const inputISO = toISODate(data.date);
      if (!inputISO) {
        ctx.addIssue({
          code: 'custom',
          path: ['date'],
          message: `(${label}) La fecha es obligatoria`,
        });
        return;
      }

      const dInput = parseDateOnly(inputISO);
      if (!dInput) {
        ctx.addIssue({
          code: 'custom',
          path: ['date'],
          message: `(${label}) Fecha inválida`,
        });
        return;
      }

      if (!isWithinLast365DaysNoFuture(dInput)) {
        ctx.addIssue({
          code: 'custom',
          path: ['date'],
          message: `(${label}) La fecha debe estar dentro de los últimos 365 días`,
        });
        return;
      }

      const addDateError = (message: string) =>
        ctx.addIssue({ code: 'custom', path: ['date'], message: `(ERROR ${label}) ${message}` });

      const addExceptionError = (message: string) =>
        ctx.addIssue({ code: 'custom', path: ['exceptionCode'], message: `(ERROR ${label}) ${message}` });

      const iso073 = toISODate(row.original.REVALIDACION_073 ?? '');
      const iso114 = toISODate(row.original.ULTIMO_DOCUMENTO_114 ?? '');
      const iso130 = toISODate(row.original.MSA_130 ?? '');
      const iso138 = toISODate(row.original.ENTREGA_TRANSPORTE_138 ?? '');

      const d073 = iso073 ? parseDateOnly(iso073) : null;
      const d114 = iso114 ? parseDateOnly(iso114) : null;
      const d130 = iso130 ? parseDateOnly(iso130) : null;
      const d138 = iso138 ? parseDateOnly(iso138) : null;


      if (data.phase === '073' && d114 && dInput > d114) {
        addDateError(`La fecha de ${PHASE_LABEL['073']} debe ser menor o igual a la fecha de ${PHASE_LABEL['114']}`);
      }

      if (data.phase === '114' && d073 && dInput < d073) {
        addDateError(`La fecha de ${PHASE_LABEL['114']} debe ser mayor o igual a la fecha de ${PHASE_LABEL['073']}`);
      }

      if (data.phase === '114') {
        const upper = d138 ?? d130 ?? null;
        if (upper && dInput > upper) {
          addDateError(`La fecha de ${PHASE_LABEL['114']} debe ser menor o igual a la fecha de ${PHASE_LABEL['130']} / ${PHASE_LABEL['138']}`);
        }
      }

      if (data.phase === '130' && d114 && dInput < d114) {
        addDateError(`La fecha de ${PHASE_LABEL['130']} debe ser mayor o igual a la fecha de ${PHASE_LABEL['114']}`);
      }

      if (data.phase === '138' && d114 && dInput < d114) {
        addDateError(`La fecha de ${PHASE_LABEL['138']} debe ser mayor o igual a la fecha de ${PHASE_LABEL['114']}`);
      }

      if (data.phase === '130') {
        if (!iso138) {
          addDateError(`Para guardar ${PHASE_LABEL['130']}, debe existir ${PHASE_LABEL['138']} y tener la misma fecha`);
        } else if (inputISO !== iso138) {
          addDateError(`La fecha de ${PHASE_LABEL['130']} debe ser igual a la fecha de ${PHASE_LABEL['138']}`);
        }
      }

      if (data.phase === '138') {
        if (!iso130) {
          addDateError(`Para guardar ${PHASE_LABEL['138']}, debe existir ${PHASE_LABEL['130']} y tener la misma fecha`);
        } else if (inputISO !== iso130) {
          addDateError(`La fecha de ${PHASE_LABEL['138']} debe ser igual a la fecha de ${PHASE_LABEL['130']}`);
        }
      }

      const KPI_THRESHOLD = 7;

      let start: Date | null = null;
      let end: Date | null = null;

      if (data.phase === '130' || data.phase === '138') {
        start = d114 ?? null;
        end = dInput;
      }

      if (data.phase === '114') {
        start = dInput;
        end = d138 ?? d130 ?? null;
      }

      if (start && end) {
        const diff = end >= start ? businessDaysDiff(start, end) : businessDaysDiff(end, start);

        if (diff >= KPI_THRESHOLD && !data.exceptionCode) {
          addExceptionError(
            `Coloca un código de excepción: la diferencia entre (${PHASE_LABEL['114']}) y (${PHASE_LABEL['130']})/(${PHASE_LABEL['138']}) es mayor a ${KPI_THRESHOLD} días hábiles`
          );
        }
      }
    });

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

  const phase = form.watch('phase');

  React.useEffect(() => {
    const phaseField: Record<string, keyof getRefsPendingCE> = {
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

    if (phase) {
      form.setValue('date', getDateFromPhase(phase), { shouldValidate: true });
    }
  }, [phase, form, row]);

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsSubmitting(true);
    try {
      const res = await GPClient.patch(`/api/casa/upsertPhase/${data.ref}`, {
        phase: data.phase,
        exceptionCode: data.exceptionCode,
        date: data.date,
        user: data.user,
      });

      if (res.status === 200) {
        const updated = res.data.data;

        const fieldMap: Record<string, keyof getRefsPendingCE> = {
          '073': 'REVALIDACION_073',
          '114': 'ULTIMO_DOCUMENTO_114',
          '130': 'MSA_130',
          '138': 'ENTREGA_TRANSPORTE_138',
        };

        const field = fieldMap[updated.CVE_ETAP];
        const formatted =
          typeof formatISOtoDDMMYYYY === 'function'
            ? formatISOtoDDMMYYYY(updated.FEC_ETAP)
            : null;

        setRefsPendingCE((prev) =>
          prev.map((r) =>
            r.REFERENCIA === updated.NUM_REFE
              ? {
                  ...r,
                  ...(field
                    ? {
                        [field]: updated.FEC_ETAP,
                        [`${field}_FORMATTED`]: formatted,
                      }
                    : {}),
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
                      value={field.value}
                      onValueChange={(val: string) => {
                        form.setValue('phase', val, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });

                        const phaseDates: Record<string, string | null | undefined> = {
                          '073': row.original.REVALIDACION_073,
                          '114': row.original.ULTIMO_DOCUMENTO_114,
                          '130': row.original.MSA_130,
                          '138': row.original.ENTREGA_TRANSPORTE_138,
                        };

                        form.setValue('date', toISODate(phaseDates[val] ?? ''), {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });

                        // Para estas etapas el campo de excepción viene de CE_138 en tu tipo
                        form.setValue('exceptionCode', row.original.CE_138 || '', {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
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

            {phase === '073' && <FormItemsRevalidacion form={form} row={row} />}
            {phase === '114' && <FormItemsUltimoDocumento form={form} row={row} />}
            {phase === '130' && <FormItemsMSA form={form} row={row} />}
            {phase === '138' && <FormItemsEntregaTransporte form={form} row={row} />}

            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="Usuario..." className="mb-4 uppercase" {...field} />
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
