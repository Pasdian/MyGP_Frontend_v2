import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { moduleSchema } from '@/lib/schemas/admin-panel/moduleSchema';
import { moduleModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';
import { useSWRConfig } from 'swr';

const posthogEvent =
  moduleModuleEvents.find((e) => e.alias === 'MODULE_ADD_MODULE')?.eventName || '';

export default function AddModuleForm({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mutate } = useSWRConfig();

  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      alias: '',
    },
  });

  async function onSubmit(data: z.infer<typeof moduleSchema>) {
    await GPClient.post(`/api/modules`, {
      name: data.name,
      description: data.description,
      alias: data.alias,
    })
      .then((res) => {
        toast.success(res.data.message);
        posthog.capture(posthogEvent);
        setIsOpen((opened) => !opened);
        mutate('/api/modules');
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Módulo</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del Módulo..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Descripción del Módulo</FormLabel>
                <FormControl>
                  <Input placeholder="Descripción del Rol..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Alias del Módulo</FormLabel>
                <FormControl>
                  <Input
                    className="uppercase"
                    placeholder="Alias del Modulo..."
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.trim())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
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
