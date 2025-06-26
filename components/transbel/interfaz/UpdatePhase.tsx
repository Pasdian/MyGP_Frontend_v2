'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
import { getRefsPendingCE } from '@/app/api/transbel/getRefsPendingCE/route';
import { mutate } from 'swr';
import { InterfaceContext } from './InterfaceClient';
import {
  CVE_ETAP,
  CVE_MODI,
  FEC_ETAP,
  HOR_ETAP,
  NUM_REFE,
  OBS_ETAP,
} from '@/lib/zvalidations/updatePhase';
import { GPClient } from '@/axios-instance';

export default function UpdatePhase({ row }: { row: Row<getRefsPendingCE> }) {
  const { initialDate, finalDate } = React.useContext(InterfaceContext);
  const [isChecked, setIsChecked] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const ZUpdatePhaseSchema = z.object({
    REFERENCIA: NUM_REFE,
    CE_140: z
      .string({
        message: 'Ingresa un código de excepción',
      })
      .min(2, { message: 'El codigo de la etapa debe de ser de mínimo 2 caracteres' })
      .max(15, {
        message: 'El codigo de la etapa debe de ser de mínimo 15 caracteres',
      }),
    HOR_ETAP: HOR_ETAP,
    FEC_ETAP: FEC_ETAP,
    OBS_ETAP: OBS_ETAP,
    CVE_MODI: CVE_MODI,
    CVE_ETAP: CVE_ETAP,
  });

  const form = useForm<z.infer<typeof ZUpdatePhaseSchema>>({
    resolver: zodResolver(ZUpdatePhaseSchema),
    defaultValues: {
      REFERENCIA: row.original.REFERENCIA ? row.original.REFERENCIA : '',
      CE_140: '140',
      FEC_ETAP: new Date().toISOString().split('T')[0],
      HOR_ETAP: new Date().toLocaleString('sv-SE').replace(' ', 'T').split('T')[1].substring(0, 5),
      CVE_MODI: 'MYGP',
      OBS_ETAP: '',
      CVE_ETAP: '',
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
          mutate(
            `/api/transbel/getRefsPendingCE?initialDate=${initialDate}&finalDate=${finalDate}`
          );
          setIsChecked((old) => (old ? !old : old));
          setIsDialogOpen(() => false);
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
                  name="CVE_ETAP"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etapa a Modificar</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <ExceptionCodeCombo field={field} />
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
