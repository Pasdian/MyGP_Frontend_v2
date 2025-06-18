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
import { ZAddPhaseSchema } from './schemas/ZDeliveriesSchemas';
import React from 'react';

export default function TransbelAddPhase() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof ZAddPhaseSchema>>({
    resolver: zodResolver(ZAddPhaseSchema),
    defaultValues: {
      NUM_REFE: '',
      CVE_ETAP: '',
      OBS_ETAP: '',
      CVE_MODI: '',
    },
  });

  async function onSubmit(data: z.infer<typeof ZAddPhaseSchema>) {
    await GPClient.post('/api/transbel/addPhase', {
      ref: data.NUM_REFE,
      phase: data.CVE_ETAP,
      exceptionCode: data.CVE_ETAP,
      user: data.CVE_MODI,
    })
      .then((res) => {
        if (res.status == 200) {
          toast.success('Datos subidos correctamente');
          router.refresh();
          setIsDialogOpen(() => false);
        } else {
          toast.error('No se pudieron subir tus datos');
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
      <Button className="bg-blue-400 hover:bg-blue-500 mb-4" onClick={() => setIsDialogOpen(true)}>
        Añadir Entrega
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:max-w-[500px] md:max-h-[500px] rounded-lg w-full h-[550px] max-h-full max-w-full overflow-y-auto">
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
                      <FormLabel>Usuario</FormLabel>
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
