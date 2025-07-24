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
import { mutate } from 'swr';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DATE_VALIDATION,
  EXCEPTION_CODE_VALIDATION,
  PHASE_VALIDATION,
  REF_VALIDATION,
  TIME_VALIDATION,
} from '@/lib/validations/phaseValidations';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { Row } from '@tanstack/react-table';
import { InterfaceContext } from '@/contexts/InterfaceContext';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { USER_CASA_USERNAME_VALIDATION } from '@/lib/validations/userValidations';
import { doesDateKPIBreak } from '@/lib/utilityFunctions/doesDateKPIBreak';
import { shouldPutExceptionCode } from '@/lib/utilityFunctions/shouldPutExceptionCode';
import FormItemsRevalidacion from './FormItems/FormItemsRevalidacion';
import FormItemsUltimoDocumento from './FormItems/FormItemsUltimoDocumento';
import FormItemsEntregaTransporte from './FormItems/FormItemsEntregaTransporte';
import FormItemsMSA from './FormItems/FormItemsMSA';

export default function InterfaceUpsertPhaseForm({
  row,
  setOpenDialog,
}: {
  row: Row<getRefsPendingCE>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { initialDate, finalDate } = React.useContext(InterfaceContext);
  const { user } = useAuth();

  const schema = z
    .object({
      ref: REF_VALIDATION,
      phase: PHASE_VALIDATION,
      exceptionCode: EXCEPTION_CODE_VALIDATION,
      date: DATE_VALIDATION,
      time: TIME_VALIDATION,
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
        // Refinement functions should never throw. Instead they should return a falsy value to signal failure.
        return !doesDateKPIBreak({
          exceptionCode: data.exceptionCode,
          initialDate: data.date,
          finalDate: row.original.ENTREGA_TRANSPORTE_138,
          numDays: 7,
        });
      },
      {
        message:
          'Coloca un código de excepción, la diferencia entre la fecha de entrega de último documento y transporte es mayor a 7 dias',
        path: ['date'],
      }
    )
    .refine(
      (data) => {
        // Refinement functions should never throw. Instead they should return a falsy value to signal failure.
        return !shouldPutExceptionCode({
          exceptionCode: data.exceptionCode,
          initialDate: data.date,
          finalDate: row.original.ENTREGA_TRANSPORTE_138,
          numDays: 7,
        });
      },
      {
        message: 'No es necesario colocar un código de excepción',
        path: ['date'],
      }
    );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      ref: row.original.REFERENCIA ? row.original.REFERENCIA : '',
      phase: '',
      exceptionCode: row.original.CE_138 ? row.original.CE_138 : '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleString('sv-SE').split(' ')[1].substring(0, 5),
      user: user.casa_user_name ? user.casa_user_name : 'MYGP',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    await GPClient.post('/api/casa/upsertPhase', {
      ref: data.ref,
      phase: data.phase,
      exceptionCode: data.exceptionCode,
      date: `${data.date} ${data.time}`,
      user: data.user,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos modificados correctamente');
          setOpenDialog((opened) => !opened);
          if (!initialDate || !finalDate) return mutate('/api/transbel/getRefsPendingCE');

          mutate(
            `/api/transbel/getRefsPendingCE?initialDate=${
              initialDate.toISOString().split('T')[0]
            }&finalDate=${finalDate.toISOString().split('T')[0]}`
          );
        } else {
          toast.error('No se pudieron actualizar tus datos');
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  return (
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
                    onValueChange={(val) => {
                      form.reset();
                      field.onChange(val);
                      if (val == '073' && row.original.REVALIDACION_073) {
                        form.setValue('date', row.original.REVALIDACION_073);
                      } else if (val == '114' && row.original.ULTIMO_DOCUMENTO_114) {
                        form.setValue('date', row.original.ULTIMO_DOCUMENTO_114);
                      } else if (val == '130' && row.original.MSA_130) {
                        form.setValue('date', row.original.MSA_130);
                      } else if (val == '138' && row.original.ENTREGA_TRANSPORTE_138) {
                        form.setValue('date', row.original.ENTREGA_TRANSPORTE_138);
                      } else {
                        form.setValue('date', '');
                      }
                    }}
                    defaultValue={field.value}
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
          {form.watch('phase') == '073' ? <FormItemsRevalidacion form={form} row={row} /> : ''}
          {form.watch('phase') == '114' ? <FormItemsUltimoDocumento form={form} row={row} /> : ''}
          {form.watch('phase') == '130' ? <FormItemsMSA form={form} row={row} /> : ''}
          {form.watch('phase') == '138' ? <FormItemsEntregaTransporte form={form} row={row} /> : ''}

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="Hora..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            <Button variant="outline" className="cursor-pointer">
              Cancelar
            </Button>
          </DialogClose>
          <Button className="cursor-pointer bg-yellow-500 hover:bg-yellow-600" type="submit">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
