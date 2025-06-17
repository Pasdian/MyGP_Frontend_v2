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
import { z } from 'zod';
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
import { Deliveries } from '@/app/transbel/entregas/page';
import React from 'react';
import { ZUpdatePhaseSchema } from './schemas/ZDeliveriesSchemas';
import { Row } from '@tanstack/react-table';

export default function TransbelUpdatePhase({ row }: { row: Row<Deliveries> }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof ZUpdatePhaseSchema>>({
    resolver: zodResolver(ZUpdatePhaseSchema),
    defaultValues: {
      NUM_REFE: row.original.NUM_REFE ? row.original.NUM_REFE : '',
      CVE_ETAP: row.original.CVE_ETAP ? row.original.CVE_ETAP : '',
      FEC_ETAP: row.original.FEC_ETAP ? row.original.FEC_ETAP : '',
      HOR_ETAP: row.original.HOR_ETAP ? row.original.HOR_ETAP : '',
      OBS_ETAP: row.original.OBS_ETAP ? row.original.OBS_ETAP : '',
      CVE_MODI: row.original.CVE_MODI ? row.original.CVE_MODI : '',
    },
  });

  async function onSubmit(data: z.infer<typeof ZUpdatePhaseSchema>) {
    await GPClient.post('/api/transbel/updatePhase', {
      ref: data.NUM_REFE,
      phase: data.CVE_ETAP,
      exceptionCode: data.CVE_ETAP,
      date: `${data.FEC_ETAP}T${data.HOR_ETAP}`,
      user: data.CVE_MODI,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos modificados correctamente');
          router.refresh();
          setIsDialogOpen(() => false);
        } else {
          toast.error('No se pudieron actualizar tus datos');
          router.refresh();
          setIsDialogOpen(() => false);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  return (
    <div>
      <Button className="bg-yellow-400 hover:bg-yellow-500" onClick={() => setIsDialogOpen(true)}>
        Modificar
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:max-w-[500px] md:max-h-[650px] md:h-[650px] rounded-lg w-full h-[600px] max-h-full max-w-full overflow-y-auto">
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
                        <Input placeholder="Referencia..." {...field} />
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
                      <FormLabel>C.E de la Etapa</FormLabel>
                      <FormControl>
                        <Input placeholder="CVE Etapa..." {...field} />
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
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Input placeholder="Observaciones..." {...field} />
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
                      <FormLabel>C.E Modi</FormLabel>
                      <FormControl>
                        <Input placeholder="CVE Modi..." className="mb-4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
