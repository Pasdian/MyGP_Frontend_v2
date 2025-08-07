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
import { useSWRConfig } from 'swr';
import { z } from 'zod/v4';
import { moduleSchema } from '@/lib/schemas/admin-panel/moduleSchema';
import { getAllModules } from '@/types/getAllModules/getAllModules';
import { Row } from '@tanstack/react-table';

export default function ModifyModuleForm({
  row,
  setIsOpen,
}: {
  row: Row<getAllModules>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mutate } = useSWRConfig();

  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    mode: 'onChange',
    defaultValues: {
      name: row.original.name || '',
      description: row.original.description || '',
      alias: row.original.alias || '',
    },
  });

  async function onSubmit(data: z.infer<typeof moduleSchema>) {
    await GPClient.put(`/api/modules/${row.original.uuid}`, {
      name: data.name,
      description: data.description,
      alias: data.alias,
    })
      .then((res) => {
        toast.success(res.data.message);
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
          <Button className="cursor-pointer bg-yellow-500 hover:bg-yellow-600" type="submit">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
