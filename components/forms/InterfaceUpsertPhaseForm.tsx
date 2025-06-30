import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExceptionCodeCombo } from '@/components/comboboxes/ExceptionCodeCombo';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';

import React from 'react';
import { Button } from '../ui/button';

import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { GPClient } from '@/axios-instance';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DATE_VALIDATION,
  EXCEPTION_CODE_VALIDATION,
  PHASE_VALIDATION,
  REF_VALIDATION,
  TIME_VALIDATION,
  USER_VALIDATION,
} from '@/lib/validations/phaseValidations';
import { z } from 'zod/v4';
import { Form } from '@/components/ui/form';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { Row } from '@tanstack/react-table';
import { DialogClose, DialogFooter } from '../ui/dialog';
import { InterfaceContext } from '@/contexts/InterfaceContext';

const getFormattedDate = (d: Date | undefined) => {
  if (!d) return;
  const date = d;
  const formatted = date.toISOString().split('T')[0];
  return formatted;
};

export default function InterfaceUpsertPhaseForm({
  row,
  setOpenDialog,
}: {
  row: Row<getRefsPendingCE>;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isChecked, setIsChecked] = React.useState(false);
  const { initialDate, finalDate } = React.useContext(InterfaceContext);
  const schema = z.object({
    ref: REF_VALIDATION,
    phase: PHASE_VALIDATION,
    exceptionCode: EXCEPTION_CODE_VALIDATION,
    date: DATE_VALIDATION,
    time: TIME_VALIDATION,
    user: USER_VALIDATION,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ref: row.original.REFERENCIA ? row.original.REFERENCIA : '',
      phase: '',
      exceptionCode: row.original.CE_138 ? row.original.CE_138 : '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleString('sv-SE').replace(' ', 'T').split('T')[1].substring(0, 5),
      user: 'MYGP',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    form.reset();

    await GPClient.post('/api/transbel/upsertPhase', {
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
          mutate(
            `/api/transbel/getRefsPendingCE?initialDate=${getFormattedDate(
              initialDate
            )}&finalDate=${getFormattedDate(finalDate)}`
          );
        } else {
          toast.error('No se pudieron actualizar tus datos');
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  console.log(row.original);

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
                      field.onChange(val);
                      if (val == '073' && row.original.REVALIDACION_073) {
                        form.setValue('date', row.original.REVALIDACION_073?.split(' ')[0]);
                      } else if (val == '114' && row.original.ULTIMO_DOCUMENTO_114) {
                        form.setValue('date', row.original.ULTIMO_DOCUMENTO_114?.split(' ')[0]);
                      } else if (val == '130' && row.original.MSA_130) {
                        form.setValue('date', row.original.MSA_130?.split(' ')[0]);
                      } else if (val == '138' && row.original.ENTREGA_TRANSPORTE_138) {
                        form.setValue('date', row.original.ENTREGA_TRANSPORTE_138?.split(' ')[0]);
                      } else if (val == '140' && row.original.ENTREGA_CDP_140) {
                        form.setValue('date', row.original.ENTREGA_CDP_140?.split(' ')[0]);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una etapa..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="073">073 - Revalidación</SelectItem>
                      <SelectItem value="114">114 - Último Documento</SelectItem>
                      <SelectItem value="130">130 - MSA</SelectItem>
                      <SelectItem value="138">138 - Entrega a Transporte</SelectItem>
                      <SelectItem value="140">140 - Entrega a CDP</SelectItem>
                    </SelectContent>
                  </Select>
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

          {form.watch('phase') == '138' ? (
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
          ) : null}

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
