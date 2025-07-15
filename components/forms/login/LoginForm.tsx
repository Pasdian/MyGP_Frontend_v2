'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { z } from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema } from '@/lib/schemas/login/loginSchema';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [shouldView, setShouldView] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    await GPClient.post('/api/auth/login', {
      email: data.email,
      password: data.password,
    })
      .then((res) => {
        toast.success(res.data.message);
        router.push('/mygp/dashboard');
      })
      .catch((error) => {
        toast.error(error.response.data.message);
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
                  </div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
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
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
