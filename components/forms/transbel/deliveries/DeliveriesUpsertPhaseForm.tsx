'use client';

import React from 'react';

import { useSWRConfig } from 'swr';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { z } from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Row } from '@tanstack/react-table';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ExceptionCodeCombo } from '@/components/comboboxes/ExceptionCodeCombo';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { IconTrashFilled } from '@tabler/icons-react';
import { deliveriesUpsertPhaseSchema } from '@/lib/schemas/transbel/deliveries/deliveriesUpsertPhaseSchema';

export default function DeliveriesUpsertPhaseForm({ row }: { row: Row<getDeliveries> }) {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  const [isChecked, setIsChecked] = React.useState(false);

  const form = useForm<z.infer<typeof deliveriesUpsertPhaseSchema>>({
    resolver: zodResolver(deliveriesUpsertPhaseSchema),
    defaultValues: {
      ref: row.original.REFERENCIA ? row.original.REFERENCIA : '',
      phase: '140',
      exceptionCode: row.original.CE_140 ? row.original.CE_140 : '',
      cdp: row.original.ENTREGA_CDP_140 ? row.original.ENTREGA_CDP_140 : '',
      time: new Date().toLocaleString('sv-SE').split(' ')[1].substring(0, 5),
      user: user.casa_user_name ? user.casa_user_name : 'MYGP',
      transporte: row.original.ENTREGA_TRANSPORTE_138 ? row.original.ENTREGA_TRANSPORTE_138 : '',
    },
  });

  async function onSubmit(data: z.infer<typeof deliveriesUpsertPhaseSchema>) {
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
                          form.trigger();
                        }}
                        currentValue={field.value}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="cursor-pointer bg-red-400 hover:bg-red-500"
                      type="button"
                      onClick={() => {
                        form.setValue('exceptionCode', '');
                        form.trigger();
                      }}
                    >
                      <IconTrashFilled />
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
                    className="mb-4 uppercase"
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
