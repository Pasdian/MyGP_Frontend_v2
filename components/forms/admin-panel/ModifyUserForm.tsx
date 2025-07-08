import { GPClient } from '@/axios-instance';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { getAllUsersDeepCopy } from '@/types/users/getAllUsers';
import { zodResolver } from '@hookform/resolvers/zod';
import { Row } from '@tanstack/react-table';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { z } from 'zod/v4';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import AdminPanelRoleSelect from '@/components/selects/AdminPanelRoleSelect';
import { modifyUserSchema } from '@/lib/schemas/admin-panel/modifyUserSchema';

export default function ModifyUserForm({ row }: { row: Row<getAllUsersDeepCopy> }) {
  const [shouldView, setShouldView] = React.useState(false);
  const { mutate } = useSWRConfig();

  const form = useForm<z.infer<typeof modifyUserSchema>>({
    resolver: zodResolver(modifyUserSchema),
    defaultValues: {
      name: row.original.name ? row.original.name : '',
      email: row.original.email ? row.original.email : '',
      mobile: row.original.mobile ? row.original.mobile : '',
      password: '',
      role_id: row.original.role_id ? row.original.role_id.toString() : '',
      casa_user_name: row.original.casa_user_name ?? '',
      status: row.original.status == 'Activo' ? true : false,
    },
  });

  async function onSubmit(data: z.infer<typeof modifyUserSchema>) {
    await GPClient.post(`/api/users/updateUser/${row.original.user_uuid}`, {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      role_id: data.role_id,
      casa_user_name: data.casa_user_name,
      status: data.status == true ? 'active' : 'inactive',
    })
      .then((res) => {
        toast.success(res.data.message);
        mutate('/api/users/getAllUsers');
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
                <FormLabel>Nombre de Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de usuario..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="Correo Electrónico..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Número de Teléfono..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={shouldView ? 'text' : 'password'}
                      {...field}
                      placeholder="Contraseña"
                    />
                    {shouldView ? (
                      <Eye
                        className="absolute right-4 top-2"
                        onClick={() => {
                          setShouldView(!shouldView);
                        }}
                      />
                    ) : (
                      <EyeOff
                        className="absolute right-4 top-2"
                        onClick={() => setShouldView(!shouldView)}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol de Usuario</FormLabel>
                <FormControl>
                  <AdminPanelRoleSelect onValueChange={field.onChange} defaultValue={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="casa_user_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de Usuario CASA</FormLabel>
                <FormControl>
                  <Input className="uppercase" placeholder="Usuario CASA..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex mb-4">
                <FormLabel>¿Activo?</FormLabel>
                <FormDescription>Activar o desactivar un usuario</FormDescription>
                <FormControl>
                  <Switch
                    className="data-[state=checked]:bg-green-500 bg-gray-300"
                    checked={field.value}
                    onCheckedChange={field.onChange}
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
