'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const formSchema = z.object({
    email: z.string().email({ message: 'Correo electrónico inválido' }),
    password: z.string().min(8, { message: 'La contraseña debe de ser mayor a 8 caracteres' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    axios
      .post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        {
          email: data.email,
          password: data.password,
        },
        {
          withCredentials: true,
        }
      )
      .then(
        (res: {
          data: {
            token: string;
            user: {
              id: number;
              uuid: string;
              name: string;
              role: number;
              email: string;
            };
          };
        }) => {
          toast('Inicio de sesión exitoso');
          localStorage.setItem('token', res.data.token);
          router.push('/transbel/interfaz');
        }
      )
      .catch((error) => {
        if (error.response.data.message) {
          toast(error.response.data.message);
        } else {
          toast('Error en el sistema');
        }
      });
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión en tu cuenta</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico para iniciar sesión en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            {...field}
                            placeholder="Contraseña"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                    Iniciar sesión
                  </Button>
                  <Button variant="outline" className="w-full">
                    Iniciar sesión con Google
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿No tienes una cuenta?{' '}
                <a href="#" className="underline underline-offset-4">
                  Regístrate
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
