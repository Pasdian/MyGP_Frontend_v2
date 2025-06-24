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

import { axiosFetcher, GPClient } from '@/axios-instance';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ExceptionCodeCombo } from '../../ExceptionCode/ExceptionCodeCombo';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { getTransbelRefs } from '@/app/api/transbel/getTransbelRefs/route';

export default function AddPhase() {
  const { data: refs, isLoading } = useSWRImmutable<getTransbelRefs[]>(
    '/api/transbel/getTransbelRefs',
    axiosFetcher
  );

  const { mutate } = useSWRConfig();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);
  const router = useRouter();

  const ZAddPhaseSchema = z.object({
    NUM_REFE: z.string().refine((val) => (refs ? refs.some((ref) => ref.NUM_REFE == val) : null), {
      error: 'La referencia no existe',
    }),
    HOR_ETAP: z.iso.time({
      error: 'La hora no tiene el formato especificado HH:mm',
      precision: -1,
    }),
    FEC_ETAP: z.iso.date({ error: 'La fecha no tiene el formato específicado yyyy-mm-dd' }),
    CVE_ETAP: z
      .string({ error: 'El código de la etapa debe de ser siempre 140' })
      .length(3, { error: 'El código de la etapa debe ser 140' }), // 140 - Entregas
    OBS_ETAP: z
      .string({ error: 'El código de excepción debe de ser una cadena de caracteres' })
      .min(4, { error: 'El código de excepción debe de ser de mínimo 4 caracteres' }),
    USUARIO: z
      .string({ error: 'El usuario deben de ser una cadena de caracteres' })
      .min(2, { error: 'El usuario debe de ser de mínimo de 2 carácteres' })
      .max(15, { error: 'El usuario debe de ser de máximo de 15 carácteres' }),
  });

  const form = useForm<z.infer<typeof ZAddPhaseSchema>>({
    resolver: zodResolver(ZAddPhaseSchema),
    defaultValues: {
      NUM_REFE: '',
      CVE_ETAP: '140', // Codigo de Excepción 140 - Entregas
      OBS_ETAP: '',
      USUARIO: 'MYGP',
      FEC_ETAP: new Date().toISOString().split('T')[0],
      HOR_ETAP: `${new Date().getHours()}:${new Date().getMinutes()}`,
    },
  });

  async function onSubmit(data: z.infer<typeof ZAddPhaseSchema>) {
    form.reset();

    await GPClient.post('/api/transbel/addPhase', {
      ref: data.NUM_REFE,
      phase: data.CVE_ETAP,
      exceptionCode: data.OBS_ETAP,
      date: `${data.FEC_ETAP}T${data.HOR_ETAP}`, // Timestamp
      user: data.USUARIO,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos subidos correctamente');
          mutate('/api/transbel/getDeliveries');
          setIsDialogOpen(() => false);
        } else {
          toast.error('No se pudieron subir tus datos');
          router.refresh();
          setIsDialogOpen(() => false);
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
    <div>
      <Button
        className="acursor-pointer bg-blue-400 hover:bg-blue-500 mb-4"
        onClick={() => setIsDialogOpen(true)}
      >
        Añadir Entrega
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:max-w-[500px] md:max-h-[600px] rounded-lg max-h-full max-w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Entrega</DialogTitle>
            <DialogDescription>
              Aquí podrás añadir una entrega. Haz click en guardar cuando termines de escribir en
              los campos.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="NUM_REFE"
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
                  name="FEC_ETAP"
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
                        <ExceptionCodeCombo field={field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="USUARIO"
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
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button className="bg-blue-500 hover:bg-blue-600" type="submit">
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
