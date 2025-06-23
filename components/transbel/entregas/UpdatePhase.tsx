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

import { GPClient } from '@/axios-instance';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import React, { SetStateAction } from 'react';
import { Row } from '@tanstack/react-table';
import { Label } from '@/components/ui/label';
import { Delivery } from '@/app/transbel/entregas/page';

export default function UpdatePhase({ row }: { row: Row<Delivery> }) {
  const [isChecked, setIsChecked] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const router = useRouter();

  const ZUpdatePhaseSchema = z.object({
    NUM_REFE: z.string().min(3, { message: 'La referencia debe de ser de mínimo 3 caracteres' }),
    CVE_ETAP: z
      .string({ message: 'El C.E de la etapa debe de ser una cadena de caracteres' })
      .min(2, { message: 'El C.E de la etapa debe de ser de mínimo 2 caracteres' })
      .max(15, { message: 'El C.E de la etapa debe de ser de mínimo 15 caracteres' }),
    HOR_ETAP: z.iso.time({
      error: 'La hora no tiene el formato especificado HH:mm',
      precision: -1,
    }),
    FEC_ETAP: z.iso.date({ error: 'La fecha no tiene el formato específicado yyyy-mm-dd' }),
    OBS_ETAP: z
      .string({ message: 'Las observaciones deben de ser una cadena de caracteres' })
      .max(100, { message: 'Las observaciones deben de ser de máximo 100 caracteres' }),
    CVE_MODI: z
      .string({ message: 'El usuario deben de ser una cadena de caracteres' })
      .min(2, { message: 'El usuario debe de ser de mínimo de 2 carácteres' })
      .max(15, { message: 'El usuario debe de ser de máximo de 15 carácteres' }),
  });

  const form = useForm<z.infer<typeof ZUpdatePhaseSchema>>({
    resolver: zodResolver(ZUpdatePhaseSchema),
    defaultValues: {
      NUM_REFE: row.original.NUM_REFE ? row.original.NUM_REFE : '',
      CVE_ETAP: '140',
      FEC_ETAP: row.original.FEC_ETAP ? row.original.FEC_ETAP : '00:00',
      HOR_ETAP: row.original.HOR_ETAP ? row.original.HOR_ETAP : '1970-01-01',
      OBS_ETAP: row.original.OBS_ETAP ? row.original.OBS_ETAP : '',
      CVE_MODI: row.original.CVE_MODI ? 'MYGP' : '',
    },
  });

  async function onSubmit(data: z.infer<typeof ZUpdatePhaseSchema>) {
    const date = new Date(`${data.FEC_ETAP} ${data.HOR_ETAP}`);
    const timestamp = +date;

    await GPClient.post('/api/transbel/updatePhase', {
      ref: data.NUM_REFE,
      phase: data.CVE_ETAP,
      exceptionCode: data.OBS_ETAP,
      date: timestamp, // Timestamp
      user: data.CVE_MODI,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos modificados correctamente');
          router.refresh();
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
                  name="NUM_REFE"
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
                        <Input placeholder="Código de Excepción..." {...field} />
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
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button className="bg-yellow-500 hover:bg-yellow-600" type="submit">
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
