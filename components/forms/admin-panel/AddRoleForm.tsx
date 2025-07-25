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
import { addRoleSchema } from '@/lib/schemas/admin-panel/addRoleSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { z } from 'zod/v4';

export default function AddRoleForm({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mutate } = useSWRConfig();

  const form = useForm<z.infer<typeof addRoleSchema>>({
    resolver: zodResolver(addRoleSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(data: z.infer<typeof addRoleSchema>) {
    await GPClient.post(`/api/roles`, {
      name: data.name,
      description: data.description,
    })
      .then((res) => {
        toast.success(res.data.message);
        setIsOpen((opened) => !opened);
        mutate('/api/users/getAllUsers');
        mutate('/api/roles');
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
                <FormLabel>Nombre del Rol</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del Rol..." {...field} />
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
                <FormLabel>Descripción del Rol</FormLabel>
                <FormControl>
                  <Input placeholder="Descripción del Rol..." {...field} />
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
