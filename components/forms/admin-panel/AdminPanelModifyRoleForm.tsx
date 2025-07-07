import { GPClient } from '@/axios-instance';
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
import {
  ROLE_DESCRIPTION_VALIDATION,
  ROLE_NAME_VALIDATION,
} from '@/lib/validations/roleValidations';
import { getRoles } from '@/types/roles/getRoles';
import { Row } from '@tanstack/react-table';

export default function AdminPanelModifyRoleForm({
  row,
  setIsOpen,
}: {
  row: Row<getRoles>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mutate } = useSWRConfig();

  const schema = z.object({
    name: ROLE_NAME_VALIDATION,
    description: ROLE_DESCRIPTION_VALIDATION,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: row.original.name ? row.original.name : '',
      description: row.original.description ? row.original.description : '',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    form.reset();
    await GPClient.put(`/api/roles/${row.original.uuid}`, {
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
          <Button className="cursor-pointer bg-yellow-500 hover:bg-yellow-600" type="submit">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
