'use client';

import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getTransbelRefs } from '@/types/transbel/getTransbelRefs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { z } from 'zod/v4';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { DialogClose, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ExceptionCodeCombo } from '../comboboxes/ExceptionCodeCombo';
import {
  DATE_VALIDATION,
  EXCEPTION_CODE_VALIDATION,
  PHASE_VALIDATION,
  TIME_VALIDATION,
  USER_VALIDATION,
} from '@/lib/validations/phaseValidations';

export default function DeliveriesAddPhaseForm() {
  const [isChecked, setIsChecked] = React.useState(false);
  const router = useRouter();
  const { data: refs, isLoading } = useSWRImmutable<getTransbelRefs[]>(
    '/api/transbel/getTransbelRefs',
    axiosFetcher
  );

  const { mutate } = useSWRConfig();
  const schema = z.object({
    ref: z.string().refine((val) => (refs ? refs.some((ref) => ref.NUM_REFE == val) : null), {
      error: 'La referencia no existe',
    }),
    phase: PHASE_VALIDATION,
    exceptionCode: EXCEPTION_CODE_VALIDATION,
    date: DATE_VALIDATION,
    time: TIME_VALIDATION,
    user: USER_VALIDATION,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ref: '',
      phase: '140', // 140 - Entregas
      exceptionCode: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleString('sv-SE').replace(' ', 'T').split('T')[1].substring(0, 5),
      user: 'MYGP',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    form.reset();

    await GPClient.post('/api/transbel/addPhase', {
      ref: data.ref,
      phase: data.phase,
      exceptionCode: data.exceptionCode,
      date: `${data.date} ${data.time}`, // Timestamp
      user: data.user,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos subidos correctamente');
          mutate('/api/transbel/getDeliveries');
        } else {
          toast.error('No se pudieron subir tus datos');
          router.refresh();
        }
      })
      .catch((error) => {
        if (
          error.status == 500 ||
          error.response.data.message.startsWith('Violation of PRIMARY or UNIQUE KEY constraint')
        ) {
          toast.error('Ya existe una entrega asociada a esa referencia');
          return;
        }
        toast.error(error.response.data.message);
      });
  }

  if (isLoading)
    return (
      <Button className="animate-pulse cursor-pointer bg-blue-400 hover:bg-blue-500 mb-4">
        Obteniendo referencias...
      </Button>
    );

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
                  <Input placeholder="Referencia..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" placeholder="Fecha..." {...field} />
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
                  <ExceptionCodeCombo
                    onSelect={(value) => {
                      field.onChange(value);
                    }}
                    currentValue={field.value}
                  />
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
                  <Input disabled={!isChecked} placeholder="CVE Modi..." {...field} />
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
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancelar
            </Button>
          </DialogClose>
          <Button className="cursor-pointer bg-blue-500 hover:bg-blue-600" type="submit">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
