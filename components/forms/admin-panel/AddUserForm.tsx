import { GPClient } from '@/lib/axiosUtils/axios-instance';
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
import { Eye, EyeOff, SaveAllIcon, X } from 'lucide-react';
import AdminPanelRoleSelect from '@/components/selects/RoleSelect';
import { z } from 'zod/v4';
import { addUserSchema } from '@/lib/schemas/admin-panel/userSchema';
import { usersModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';
import CompanySelect from '@/components/selects/CompanySelect';
import { MyGPButtonDanger } from '@/components/MyGPUI/Buttons/MyGPButtonDanger';
import { UsersDataTableContext } from '@/contexts/UsersDataTableContext';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

const posthogEvent = usersModuleEvents.find((e) => e.alias === 'USERS_ADD_USER')?.eventName || '';

export default function AddUserForm({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [shouldView, setShouldView] = React.useState(false);
  const { setAllUsers } = React.useContext(UsersDataTableContext);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm_password: '',
      mobile: '',
      has_casa_user: true,
      casa_user_name: '',
      role_uuid: '',
      companies_uuids: [],
    },
  });

  async function onSubmit(data: z.infer<typeof addUserSchema>) {
    setIsSubmitting(true);
    await GPClient.post(`/api/users/createUser`, {
      name: data.name,
      email: data.email,
      password: data.password,
      role_uuid: data.role_uuid,
      mobile: data.mobile,
      has_casa_user: data.has_casa_user,
      casa_user_name: data.casa_user_name,
      companies_uuids: data.companies_uuids,
    })
      .then((res) => {
        toast.success(res.data.message);
        setIsOpen((opened) => !opened);
        posthog.capture(posthogEvent);
        setAllUsers((prev) => [...prev, res.data.data]);
        setIsSubmitting(false);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        setIsSubmitting(false);
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
            name="role_uuid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol del Usuario</FormLabel>
                <FormControl>
                  <AdminPanelRoleSelect onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companies_uuids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compañia del Usuario</FormLabel>
                <FormControl>
                  <CompanySelect value={field.value} onChange={field.onChange} />
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
                  <Input className="uppercase" placeholder="Usuario CASA..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <MyGPButtonDanger>
              <X /> Cancelar
            </MyGPButtonDanger>
          </DialogClose>
          <MyGPButtonSubmit isSubmitting={isSubmitting} className="w-[170px]">
            <SaveAllIcon />
            Guardar Cambios
          </MyGPButtonSubmit>
        </DialogFooter>
      </form>
    </Form>
  );
}
