'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { ExceptionCodeCombo } from '../comboboxes/ExceptionCodeCombo';
import { Button } from '../ui/button';
import React from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import {
  DATE_VALIDATION,
  EXCEPTION_CODE_VALIDATION,
  PHASE_VALIDATION,
  REF_VALIDATION,
  TIME_VALIDATION,
  TRANSPORTE_VALIDATION,
  USER_VALIDATION,
} from '@/lib/validations/phaseValidations';

import { useSWRConfig } from 'swr';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { z } from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Row } from '@tanstack/react-table';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { DialogClose, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { businessDaysDiffWithHolidays } from '@/lib/utilityFunctions/businessDaysDiffWithHolidays';

export default function DeliveriesUpsertPhaseForm({ row }: { row: Row<getDeliveries> }) {
  const { mutate } = useSWRConfig();

  const [isChecked, setIsChecked] = React.useState(false);
  const schema = z.object({
    ref: REF_VALIDATION,
    phase: PHASE_VALIDATION,
    exceptionCode: EXCEPTION_CODE_VALIDATION,
    cdp: DATE_VALIDATION,
    time: TIME_VALIDATION,
    user: USER_VALIDATION,
    transporte: TRANSPORTE_VALIDATION,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ref: row.original.REFERENCIA ? row.original.REFERENCIA : '',
      phase: '140',
      exceptionCode: row.original.CE_140 ? row.original.CE_140 : '',
      cdp: row.original.ENTREGA_CDP_140 ? row.original.ENTREGA_CDP_140.split(' ')[0] : '',
      time: new Date().toLocaleString('sv-SE').replace(' ', 'T').split('T')[1].substring(0, 5),
      user: 'MYGP',
      transporte: row.original.ENTREGA_TRANSPORTE_138
        ? row.original.ENTREGA_TRANSPORTE_138.split(' ')[0]
        : '',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    if (data.transporte && data.cdp && data.cdp < data.transporte) {
      form.setError('cdp', {
        type: 'manual',
        message: 'La fecha de CDP no puede ser menor a la fecha de entrega',
      });
      return;
    }

    if (!data.exceptionCode && data.transporte && data.cdp) {
      const diff = businessDaysDiffWithHolidays(new Date(data.transporte), new Date(data.cdp));
      if (diff > 1) {
        form.setError('exceptionCode', {
          type: 'manual',
          message:
            'Coloca un código de excepción, la diferencia entre la fecha de entrega de transporte y CDP es mayor a 1 día',
        });
        return;
      }
    }

    form.reset();
    await GPClient.post('/api/transbel/upsertPhase', {
      ref: data.ref,
      phase: data.phase,
      exceptionCode: data.exceptionCode,
      date: `${data.cdp} ${data.time}`,
      user: data.user,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos modificados correctamente');
          mutate('/api/transbel/getDeliveries');
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
            name="transporte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega a Transporte</FormLabel>
                <FormControl>
                  <Input disabled type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cdp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega a CDP</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="exceptionCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Excepción</FormLabel>
                <FormControl>
                  <div className="flex">
                    <div className="mr-2">
                      <ExceptionCodeCombo
                        onSelect={(value) => {
                          field.onChange(value);
                        }}
                        currentValue={field.value}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="cursor-pointer bg-red-400 hover:bg-red-500"
                      type="button"
                      onClick={() => form.setValue('exceptionCode', '')}
                    >
                      Eliminar
                    </Button>
                  </div>
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
                  <Input
                    disabled={!isChecked}
                    placeholder="Usuario..."
                    className="mb-4"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Label className="mb-3 hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
              <Checkbox
                id="toggle-2"
                checked={isChecked}
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                onClick={() => setIsChecked(!isChecked)}
              />
              <div className="grid gap-1.5 font-normal">
                <p className="text-sm leading-none font-medium">Modificar usuario</p>
                <p className="text-muted-foreground text-sm">
                  Puedes colocar el nombre del usuario que realice el cambio
                </p>
              </div>
            </Label>
          </div>
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
