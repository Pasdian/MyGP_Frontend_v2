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
import {
  USER_CASA_USERNAME_VALIDATION,
  USER_EMAIL_VALIDATION,
  USER_HAS_CASA_USER_VALIDATION,
  USER_MOBILE_VALIDATION,
  USER_NAME_VALIDATION,
  USER_PASSWORD_VALIDATION,
  USER_ROLE_ID_VALIDATION,
} from '@/lib/validations/userValidations';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { z } from 'zod/v4';
import { Eye, EyeOff } from 'lucide-react';
import { USER_ROLE } from '@/lib/roles/roles';

export default function AdminPanelAddUserForm({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [shouldView, setShouldView] = React.useState(false);
  const { mutate } = useSWRConfig();

  const schema = z
    .object({
      name: USER_NAME_VALIDATION,
      email: USER_EMAIL_VALIDATION,
      password: USER_PASSWORD_VALIDATION,
      confirm_password: USER_PASSWORD_VALIDATION,
      role_id: USER_ROLE_ID_VALIDATION,
      mobile: USER_MOBILE_VALIDATION,
      has_casa_user: USER_HAS_CASA_USER_VALIDATION,
      casa_user_name: USER_CASA_USERNAME_VALIDATION,
    })
    .refine((data) => data.password === data.confirm_password, {
      error: 'Las contraseñas no coinciden',
      path: ['confirm_password'],
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm_password: '',
      role_id: USER_ROLE,
      mobile: '',
      has_casa_user: true,
      casa_user_name: '',
    },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    form.reset();
    await GPClient.post(`/api/users/createUser`, {
      name: data.name,
      email: data.email,
      password: data.password,
      role_id: data.role_id,
      mobile: data.mobile,
      has_casa_user: data.has_casa_user,
      casa_user_name: data.casa_user_name,
    })
      .then((res) => {
        toast.success(res.data.message);
        setIsOpen((opened) => !opened);
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
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña</FormLabel>
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
            name="casa_user_name"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>Nombre de Usuario CASA</FormLabel>
                <FormControl>
                  <Input placeholder="Usuario CASA..." {...field} />
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
