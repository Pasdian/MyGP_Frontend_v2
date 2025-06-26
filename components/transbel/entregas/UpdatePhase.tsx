import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Checkbox } from '@/components/ui/checkbox';

import { Input } from '@/components/ui/input';
import { z } from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { toast } from 'sonner';
import React from 'react';
import { Row } from '@tanstack/react-table';
import { Label } from '@/components/ui/label';
import { ExceptionCodeCombo } from '@/components/ExceptionCode/ExceptionCodeCombo';
import { getDeliveries } from '@/app/api/transbel/getDeliveries/route';
import { useSWRConfig } from 'swr';

import { GPClient } from '@/axios-instance';
import {
  CE_138,
  CE_140,
  EE__GE,
  ENTREGA_CDP_140,
  ENTREGA_TRANSPORTE_138,
  REFERENCIA,
} from '@/lib/zvalidations/updatePhase';

export const UpdatePhaseRowContext = React.createContext<Row<getDeliveries> | undefined>(undefined);

export default function UpdatePhase({ row }: { row: Row<getDeliveries> }) {
  const { mutate } = useSWRConfig();
  const [isChecked, setIsChecked] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const ZUpdatePhaseSchema = z.object({
    REFERENCIA: REFERENCIA,
    EE__GE: EE__GE,
    ENTREGA_TRANSPORTE_138: ENTREGA_TRANSPORTE_138,
    CE_138: CE_138,
    ENTREGA_CDP_140: ENTREGA_CDP_140,
    CE_140: CE_140,
  });

  const form = useForm<z.infer<typeof ZUpdatePhaseSchema>>({
    resolver: zodResolver(ZUpdatePhaseSchema),
    defaultValues: {
      REFERENCIA: row.original.REFERENCIA ?? '',

      EE__GE: row.original.EE__GE ?? '',
      ENTREGA_TRANSPORTE_138: row.original.ENTREGA_TRANSPORTE_138 ?? '',
      CE_138: row.original.CE_138 ?? '',
      ENTREGA_CDP_140: row.original.ENTREGA_CDP_140 ?? '',
      CE_140: row.original.CE_140 ?? '',
    },
  });

  async function onSubmit(data: z.infer<typeof ZUpdatePhaseSchema>) {
    form.reset();
    await GPClient.post('/api/transbel/updatePhase', {
      ref: data.REFERENCIA,
      phase: data.CVE_ETAP,
      exceptionCode: data.OBS_ETAP,
      date: `${data.FEC_ETAP} ${data.HOR_ETAP}`,
      user: data.CVE_MODI,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos modificados correctamente');
          setIsChecked((old) => (old ? !old : old));
          setIsDialogOpen(() => false);
          mutate('/api/transbel/getDeliveries');
        } else {
          toast.error('No se pudieron actualizar tus datos');
          setIsDialogOpen(() => false);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }
  return (
    <div>
      <Button
        className="cursor-pointer bg-yellow-400 hover:bg-yellow-500"
        onClick={() => setIsDialogOpen(true)}
      >
        Modificar
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Entrega</DialogTitle>
            <DialogDescription>
              Aquí podrás realizar la modificación de una entrega. Haz click en guardar cuando
              termines de editar los campos.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="REFERENCIA"
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
                  name="FEC_ETAP"
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
                  name="HOR_ETAP"
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
                  name="OBS_ETAP"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Excepción</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="mr-2">
                            <UpdatePhaseRowContext.Provider value={row}>
                              <ExceptionCodeCombo field={field} />
                            </UpdatePhaseRowContext.Provider>
                          </div>
                          <Button
                            size="sm"
                            className="cursor-pointer bg-red-400 hover:bg-red-500"
                            type="button"
                            onClick={() => form.setValue('OBS_ETAP', '')}
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
                  name="CVE_MODI"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!isChecked}
                          placeholder="CVE Modi..."
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
